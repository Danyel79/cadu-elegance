import { useState } from "react";
import { uploadStaffPhoto, getStaffPhotoUrl } from "../../services/adminDataService";
import { updateGalleryGroup, deleteGalleryGroup } from "../../services/galleryService";

const inputStyle = {
  padding: "10px 14px",
  borderRadius: "8px",
  border: "1px solid rgba(209,183,107,0.25)",
  background: "rgba(255,255,255,0.05)",
  color: "#f6f2e8",
  fontSize: "14px",
  outline: "none",
  boxSizing: "border-box",
  fontFamily: "inherit",
};

const addTileStyle = {
  aspectRatio: "1/1",
  borderRadius: "8px",
  border: "1px dashed rgba(209,183,107,0.35)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  cursor: "pointer",
  color: "#6b6359",
};

function iconBtnStyle(disabled, danger) {
  return {
    width: "32px",
    height: "32px",
    borderRadius: "8px",
    border: "1px solid rgba(255,255,255,0.1)",
    background: "transparent",
    color: disabled ? "#3a3835" : danger ? "#f87171" : "#beb7a3",
    cursor: disabled ? "not-allowed" : "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  };
}

function PhotoThumb({ src, onRemove, isNew }) {
  return (
    <div
      style={{
        position: "relative",
        aspectRatio: "1/1",
        borderRadius: "8px",
        overflow: "hidden",
        background: "rgba(255,255,255,0.05)",
        border: isNew ? "1px solid rgba(16,185,129,0.4)" : "1px solid rgba(209,183,107,0.25)",
      }}
    >
      <img src={src} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
      <button
        type="button"
        onClick={onRemove}
        title="Remover"
        style={{
          position: "absolute",
          top: "4px",
          right: "4px",
          width: "20px",
          height: "20px",
          borderRadius: "50%",
          border: "none",
          background: "rgba(10,9,9,0.75)",
          color: "#f6f2e8",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <span className="material-symbols-outlined" style={{ fontSize: "12px" }}>close</span>
      </button>
    </div>
  );
}

export default function GalleryGroupCard({ group, onChanged, onMoveUp, onMoveDown, canMoveUp, canMoveDown }) {
  const [initial] = useState({
    titulo: group.titulo || "",
    fotos: Array.isArray(group.fotos) ? group.fotos : [],
  });
  const [titulo, setTitulo] = useState(initial.titulo);
  const [existingFotos, setExistingFotos] = useState(initial.fotos);
  const [newFiles, setNewFiles] = useState([]);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const isDirty =
    titulo !== initial.titulo ||
    newFiles.length > 0 ||
    existingFotos.length !== initial.fotos.length ||
    existingFotos.some((id, i) => id !== initial.fotos[i]);

  function handleAddFiles(e) {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setNewFiles((prev) => [
      ...prev,
      ...files.map((file) => ({ file, previewUrl: URL.createObjectURL(file) })),
    ]);
    e.target.value = "";
  }

  function removeExisting(fileId) {
    setExistingFotos((prev) => prev.filter((id) => id !== fileId));
  }

  function removeNew(index) {
    setNewFiles((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSave() {
    setSaving(true);
    setError("");
    setSuccess("");

    const newIds = [];
    if (newFiles.length) {
      setUploading(true);
      for (const item of newFiles) {
        const uploadRes = await uploadStaffPhoto(item.file);
        if (!uploadRes.success) {
          setUploading(false);
          setSaving(false);
          setError(uploadRes.error || "Falha ao enviar uma das fotos.");
          return;
        }
        newIds.push(uploadRes.fileId);
      }
      setUploading(false);
    }

    const fotos = [...existingFotos, ...newIds];
    const res = await updateGalleryGroup(group.$id, { titulo: titulo.trim(), fotos });
    setSaving(false);

    if (res.success) {
      setExistingFotos(fotos);
      setNewFiles([]);
      setSuccess("Salvo.");
      onChanged?.();
      setTimeout(() => setSuccess(""), 2000);
    } else {
      setError(res.error || "Falha ao salvar.");
    }
  }

  async function handleDelete() {
    if (!window.confirm(`Excluir a fileira "${group.titulo}"?`)) return;
    setDeleting(true);
    const res = await deleteGalleryGroup(group.$id);
    setDeleting(false);
    if (res.success) {
      onChanged?.();
    } else {
      setError(res.error || "Falha ao excluir.");
    }
  }

  return (
    <div
      style={{
        padding: "20px",
        borderRadius: "14px",
        background: "rgba(255,255,255,0.03)",
        border: "1px solid rgba(255,255,255,0.08)",
      }}
    >
      <div style={{ display: "flex", gap: "10px", alignItems: "center", marginBottom: "16px", flexWrap: "wrap" }}>
        <input
          type="text"
          value={titulo}
          onChange={(e) => setTitulo(e.target.value)}
          placeholder="Título da fileira (ex.: Nossos Cortes)"
          style={{ ...inputStyle, flex: "1 1 220px" }}
        />
        <button type="button" onClick={onMoveUp} disabled={!canMoveUp} title="Mover para cima" style={iconBtnStyle(!canMoveUp)}>
          <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>arrow_upward</span>
        </button>
        <button type="button" onClick={onMoveDown} disabled={!canMoveDown} title="Mover para baixo" style={iconBtnStyle(!canMoveDown)}>
          <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>arrow_downward</span>
        </button>
        <button type="button" onClick={handleDelete} disabled={deleting} title="Excluir fileira" style={iconBtnStyle(deleting, true)}>
          <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>delete</span>
        </button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(90px, 1fr))", gap: "10px" }}>
        {existingFotos.map((fileId) => (
          <PhotoThumb key={fileId} src={getStaffPhotoUrl(fileId)} onRemove={() => removeExisting(fileId)} />
        ))}
        {newFiles.map((item, i) => (
          <PhotoThumb key={item.previewUrl} src={item.previewUrl} isNew onRemove={() => removeNew(i)} />
        ))}
        <label style={addTileStyle}>
          <span className="material-symbols-outlined" style={{ fontSize: "22px" }}>add_photo_alternate</span>
          <input type="file" accept="image/*" multiple onChange={handleAddFiles} style={{ display: "none" }} />
        </label>
      </div>

      {uploading && <p style={{ margin: "10px 0 0", color: "#d1b76b", fontSize: "12px" }}>Enviando fotos...</p>}
      {error && <p style={{ margin: "10px 0 0", color: "#f87171", fontSize: "12px" }}>{error}</p>}
      {success && <p style={{ margin: "10px 0 0", color: "#10b981", fontSize: "12px" }}>{success}</p>}

      <button
        type="button"
        onClick={handleSave}
        disabled={saving || !isDirty}
        style={{
          marginTop: "14px",
          padding: "8px 20px",
          borderRadius: "8px",
          border: "none",
          background: saving || !isDirty ? "rgba(209,183,107,0.2)" : "linear-gradient(135deg, #d1b76b, #f6e79d)",
          color: saving || !isDirty ? "#6b6359" : "#1a1a1a",
          fontWeight: "700",
          fontSize: "12px",
          cursor: saving || !isDirty ? "not-allowed" : "pointer",
        }}
      >
        {saving ? "Salvando..." : "Salvar fileira"}
      </button>
    </div>
  );
}
