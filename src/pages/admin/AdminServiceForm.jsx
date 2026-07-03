import { useEffect, useState } from "react";
import AdminLayout from "./AdminLayout";
import {
  createServiceRecord,
  updateServiceRecord,
  deleteServiceRecord,
  listServicesCatalog,
  uploadServicePhoto,
  getServicePhotoUrl,
} from "../../services/adminDataService";

function formatCurrency(value) {
  return Number(value).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

const EMPTY_FORM = { name: "", description: "", price: "" };

const inputStyle = {
  width: "100%",
  padding: "10px 14px",
  borderRadius: "8px",
  border: "1px solid rgba(209,183,107,0.25)",
  background: "rgba(255,255,255,0.05)",
  color: "#f6f2e8",
  fontSize: "14px",
  outline: "none",
  boxSizing: "border-box",
};

const labelStyle = {
  display: "block",
  color: "#beb7a3",
  fontSize: "12px",
  textTransform: "uppercase",
  letterSpacing: "0.12em",
  marginBottom: "6px",
};

const cardStyle = {
  padding: "28px",
  borderRadius: "16px",
  background: "rgba(255,255,255,0.04)",
  border: "1px solid rgba(209,183,107,0.14)",
};

export default function AdminServiceForm() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  async function load() {
    setLoading(true);
    const res = await listServicesCatalog();
    if (res.success) setServices(res.data);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  function handleEdit(service) {
    setEditingId(service.$id);
    setForm({
      name: service.name || "",
      description: service.description || "",
      price: service.price != null ? String(service.price) : "",
    });
    setPhotoFile(null);
    setPhotoPreview(getServicePhotoUrl(service.fotoFileId));
    setError("");
    setSuccess("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function handleCancel() {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setPhotoFile(null);
    setPhotoPreview(null);
    setError("");
    setSuccess("");
  }

  function handlePhotoChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSuccess("");
    setSubmitting(true);

    let fotoFileId;
    if (photoFile) {
      setUploadingPhoto(true);
      const uploadRes = await uploadServicePhoto(photoFile);
      setUploadingPhoto(false);
      if (!uploadRes.success) {
        setSubmitting(false);
        setError(uploadRes.error || "Falha ao enviar a foto.");
        return;
      }
      fotoFileId = uploadRes.fileId;
    }

    const payload = { ...form, ...(fotoFileId ? { fotoFileId } : {}) };
    const res = editingId
      ? await updateServiceRecord(editingId, payload)
      : await createServiceRecord(payload);

    setSubmitting(false);

    if (!res.success) {
      setError(res.error);
      return;
    }

    setSuccess(editingId ? "Serviço atualizado com sucesso!" : "Serviço criado com sucesso!");
    setForm(EMPTY_FORM);
    setEditingId(null);
    setPhotoFile(null);
    setPhotoPreview(null);
    load();
  }

  async function handleDelete(id) {
    if (!window.confirm("Deseja excluir este serviço? Essa ação não pode ser desfeita.")) return;
    setDeletingId(id);
    const res = await deleteServiceRecord(id);
    setDeletingId(null);
    if (res.success) {
      setServices((prev) => prev.filter((s) => s.$id !== id));
    } else {
      setError(res.error || "Erro ao excluir serviço.");
    }
  }

  return (
    <AdminLayout>
      <header className="atelier-admin-header">
        <div className="atelier-admin-header-content">
          <span className="atelier-admin-eyebrow">Catálogo</span>
          <h1 className="atelier-admin-title">
            Gestão de <em>Serviços</em>
          </h1>
          <p className="atelier-admin-subtitle">
            Cadastre, edite e gerencie os serviços oferecidos pela barbearia.
          </p>
        </div>
      </header>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 2fr",
          gap: "28px",
          alignItems: "start",
        }}
      >
        {/* Formulário */}
        <div style={cardStyle}>
          <p
            style={{
              color: "#d1b76b",
              textTransform: "uppercase",
              letterSpacing: "0.18em",
              fontSize: "11px",
              marginBottom: "20px",
              marginTop: 0,
            }}
          >
            {editingId ? "Editar serviço" : "Novo serviço"}
          </p>

          <form onSubmit={handleSubmit} style={{ display: "grid", gap: "16px" }}>
            <div>
              <label style={labelStyle}>Nome</label>
              <input
                type="text"
                placeholder="Ex.: Corte + Barba"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                style={inputStyle}
                required
                autoComplete="off"
              />
            </div>

            <div>
              <label style={labelStyle}>Descrição</label>
              <textarea
                placeholder="Descreva o serviço..."
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                rows={4}
                style={{ ...inputStyle, resize: "vertical", fontFamily: "inherit" }}
                required
              />
            </div>

            <div>
              <label style={labelStyle}>Preço (R$)</label>
              <input
                type="text"
                inputMode="decimal"
                placeholder="Ex.: 35 ou 35,50"
                value={form.price}
                onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
                style={inputStyle}
                required
              />
            </div>

            <div>
              <label style={labelStyle}>Foto do serviço</label>
              <label
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  cursor: "pointer",
                }}
              >
                <div
                  style={{
                    width: "56px",
                    height: "56px",
                    borderRadius: "10px",
                    overflow: "hidden",
                    flexShrink: 0,
                    background: "rgba(255,255,255,0.05)",
                    border: "1px solid rgba(209,183,107,0.25)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {photoPreview ? (
                    <img
                      src={photoPreview}
                      alt="Foto do serviço"
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    />
                  ) : (
                    <span className="material-symbols-outlined" style={{ color: "#99907c", fontSize: "22px" }}>
                      add_a_photo
                    </span>
                  )}
                </div>
                <span style={{ color: "#beb7a3", fontSize: "13px" }}>
                  {uploadingPhoto ? "Enviando…" : photoPreview ? "Trocar foto" : "Escolher foto"}
                </span>
                <input type="file" accept="image/*" onChange={handlePhotoChange} style={{ display: "none" }} />
              </label>
            </div>

            {error && (
              <p style={{ color: "#f87171", fontSize: "13px", margin: 0 }}>{error}</p>
            )}
            {success && (
              <p style={{ color: "#10b981", fontSize: "13px", margin: 0 }}>{success}</p>
            )}

            <div style={{ display: "flex", gap: "10px" }}>
              <button
                type="submit"
                disabled={submitting}
                style={{
                  flex: 1,
                  padding: "11px 20px",
                  borderRadius: "8px",
                  border: "none",
                  background: submitting
                    ? "rgba(209,183,107,0.3)"
                    : "linear-gradient(135deg, #d1b76b, #f6e79d)",
                  color: "#1a1a1a",
                  fontWeight: "700",
                  fontSize: "13px",
                  cursor: submitting ? "not-allowed" : "pointer",
                  letterSpacing: "0.06em",
                }}
              >
                {submitting
                  ? "Salvando..."
                  : editingId
                  ? "Salvar alterações"
                  : "Criar serviço"}
              </button>

              {editingId && (
                <button
                  type="button"
                  onClick={handleCancel}
                  style={{
                    padding: "11px 16px",
                    borderRadius: "8px",
                    border: "1px solid rgba(255,255,255,0.1)",
                    background: "transparent",
                    color: "#99907c",
                    fontSize: "13px",
                    cursor: "pointer",
                  }}
                >
                  Cancelar
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Lista de serviços */}
        <div style={cardStyle}>
          <p
            style={{
              color: "#d1b76b",
              textTransform: "uppercase",
              letterSpacing: "0.18em",
              fontSize: "11px",
              marginBottom: "20px",
              marginTop: 0,
            }}
          >
            Serviços cadastrados ({services.length})
          </p>

          {loading ? (
            <p style={{ color: "#beb7a3", fontSize: "14px" }}>Carregando...</p>
          ) : services.length === 0 ? (
            <p style={{ color: "#99907c", fontSize: "14px" }}>
              Nenhum serviço cadastrado ainda.
            </p>
          ) : (
            <div style={{ display: "grid", gap: "10px" }}>
              {services.map((service) => {
                const isEditing = editingId === service.$id;
                return (
                  <div
                    key={service.$id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "14px 16px",
                      borderRadius: "10px",
                      background: isEditing
                        ? "rgba(209,183,107,0.07)"
                        : "rgba(255,255,255,0.03)",
                      border: isEditing
                        ? "1px solid rgba(209,183,107,0.3)"
                        : "1px solid rgba(255,255,255,0.05)",
                      gap: "12px",
                      transition: "all 0.2s",
                    }}
                  >
                    {/* Foto */}
                    <div
                      style={{
                        width: "40px",
                        height: "40px",
                        borderRadius: "8px",
                        overflow: "hidden",
                        flexShrink: 0,
                        background: "rgba(255,255,255,0.05)",
                        border: "1px solid rgba(255,255,255,0.08)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      {getServicePhotoUrl(service.fotoFileId) ? (
                        <img
                          src={getServicePhotoUrl(service.fotoFileId)}
                          alt={service.name}
                          style={{ width: "100%", height: "100%", objectFit: "cover" }}
                        />
                      ) : (
                        <span className="material-symbols-outlined" style={{ color: "#6b6359", fontSize: "18px" }}>
                          content_cut
                        </span>
                      )}
                    </div>

                    {/* Info */}
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <p
                        style={{
                          margin: 0,
                          fontSize: "14px",
                          color: "#f6f2e8",
                          fontFamily: "'Noto Serif', serif",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {service.name}
                      </p>
                      {service.description && (
                        <p
                          style={{
                            margin: "3px 0 0",
                            fontSize: "12px",
                            color: "#6b6359",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {service.description}
                        </p>
                      )}
                    </div>

                    {/* Preço */}
                    <span
                      style={{
                        color: "#d1b76b",
                        fontWeight: "700",
                        fontSize: "14px",
                        flexShrink: 0,
                      }}
                    >
                      {formatCurrency(service.price || 0)}
                    </span>

                    {/* Ações */}
                    <div style={{ display: "flex", gap: "4px", flexShrink: 0 }}>
                      <button
                        type="button"
                        onClick={() => handleEdit(service)}
                        title="Editar"
                        style={{
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                          padding: "6px",
                          color: isEditing ? "#d1b76b" : "#99907c",
                          display: "flex",
                          alignItems: "center",
                        }}
                      >
                        <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>
                          edit
                        </span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(service.$id)}
                        disabled={deletingId === service.$id}
                        title="Excluir"
                        style={{
                          background: "none",
                          border: "none",
                          cursor: deletingId === service.$id ? "not-allowed" : "pointer",
                          padding: "6px",
                          color: "#6b6359",
                          display: "flex",
                          alignItems: "center",
                        }}
                      >
                        <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>
                          delete
                        </span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <div className="atelier-admin-quote" style={{ marginTop: "40px" }}>
        <p className="atelier-admin-quote-text">
          "A excelência está nos detalhes de cada serviço oferecido."
        </p>
      </div>
    </AdminLayout>
  );
}
