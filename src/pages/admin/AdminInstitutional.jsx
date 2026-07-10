import { useCallback, useEffect, useState } from "react";
import AdminLayout from "./AdminLayout";
import { uploadStaffPhoto, getStaffPhotoUrl } from "../../services/adminDataService";
import { getSiteContent, saveSiteContent } from "../../services/siteContentService";

const cardStyle = {
  padding: "28px",
  borderRadius: "16px",
  background: "rgba(255,255,255,0.04)",
  border: "1px solid rgba(209,183,107,0.14)",
};

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
  fontFamily: "inherit",
};

const labelStyle = {
  display: "block",
  color: "#beb7a3",
  fontSize: "12px",
  textTransform: "uppercase",
  letterSpacing: "0.12em",
  marginBottom: "6px",
};

export default function AdminInstitutional() {
  const [doc, setDoc] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [barbeariaTexto, setBarbeariaTexto] = useState("");
  const [instagramUrl, setInstagramUrl] = useState("");
  const [whatsappNumero, setWhatsappNumero] = useState("");
  const [contatoTexto, setContatoTexto] = useState("");
  const [fotoFile, setFotoFile] = useState(null);
  const [fotoPreview, setFotoPreview] = useState(null);
  const [uploadingFoto, setUploadingFoto] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    const res = await getSiteContent();
    if (res.success) {
      setDoc(res.data);
      setBarbeariaTexto(res.data?.barbeariaTexto || "");
      setInstagramUrl(res.data?.instagramUrl || "");
      setWhatsappNumero(res.data?.whatsappNumero || "");
      setContatoTexto(res.data?.contatoTexto || "");
      setFotoPreview(getStaffPhotoUrl(res.data?.barbeariaFotoId));
    } else {
      setError(res.error);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    let active = true;
    queueMicrotask(() => {
      if (active) load();
    });
    return () => {
      active = false;
    };
  }, [load]);

  function handleFotoChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setFotoFile(file);
    setFotoPreview(URL.createObjectURL(file));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");

    let barbeariaFotoId;
    if (fotoFile) {
      setUploadingFoto(true);
      const uploadRes = await uploadStaffPhoto(fotoFile);
      setUploadingFoto(false);
      if (!uploadRes.success) {
        setSaving(false);
        setError(uploadRes.error || "Falha ao enviar a foto.");
        return;
      }
      barbeariaFotoId = uploadRes.fileId;
    }

    const res = await saveSiteContent(doc?.$id, {
      barbeariaTexto,
      instagramUrl,
      whatsappNumero,
      contatoTexto,
      ...(barbeariaFotoId ? { barbeariaFotoId } : {}),
    });
    setSaving(false);

    if (res.success) {
      setSuccess("Conteúdo institucional atualizado.");
      setFotoFile(null);
      await load();
      setTimeout(() => setSuccess(""), 2500);
    } else {
      setError(res.error || "Falha ao salvar.");
    }
  }

  return (
    <AdminLayout>
      <header className="atelier-admin-header">
        <div className="atelier-admin-header-content">
          <span className="atelier-admin-eyebrow">Site público</span>
          <h1 className="atelier-admin-title">
            Conteúdo <em>Institucional</em>
          </h1>
          <p className="atelier-admin-subtitle">
            Gerencie a foto e o texto da barbearia, redes sociais e contato exibidos nas páginas
            públicas "Sobre Nós" e "Contato". A biografia de cada profissional é editada
            individualmente em Equipe de Profissionais.
          </p>
        </div>
      </header>

      {loading ? (
        <p style={{ color: "#beb7a3", padding: "12px 0" }}>Carregando...</p>
      ) : (
        <form onSubmit={handleSubmit} style={{ display: "grid", gap: "24px", maxWidth: "720px" }}>
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
              Sobre a barbearia
            </p>

            <div style={{ display: "flex", gap: "20px", alignItems: "center", marginBottom: "20px" }}>
              <label
                style={{
                  width: "120px",
                  height: "120px",
                  borderRadius: "12px",
                  overflow: "hidden",
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(209,183,107,0.25)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  flexShrink: 0,
                }}
              >
                {fotoPreview ? (
                  <img
                    src={fotoPreview}
                    alt="Foto da barbearia"
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  />
                ) : (
                  <span className="material-symbols-outlined" style={{ color: "#6b6359", fontSize: "32px" }}>
                    add_a_photo
                  </span>
                )}
                <input type="file" accept="image/*" onChange={handleFotoChange} style={{ display: "none" }} />
              </label>
              <div>
                <p style={{ margin: "0 0 4px", color: "#f6f2e8", fontSize: "13px" }}>Foto de capa</p>
                <p style={{ margin: 0, color: "#99907c", fontSize: "12px" }}>
                  Aparece no topo da página Sobre Nós. Clique na imagem para trocar.
                </p>
                {uploadingFoto && <p style={{ margin: "4px 0 0", color: "#d1b76b", fontSize: "12px" }}>Enviando foto...</p>}
              </div>
            </div>

            <label style={{ display: "block" }}>
              <span style={labelStyle}>Texto sobre a barbearia</span>
              <textarea
                rows={6}
                placeholder="Conte a história, os valores e o que torna a Cadu Elegance única..."
                value={barbeariaTexto}
                onChange={(e) => setBarbeariaTexto(e.target.value)}
                style={inputStyle}
              />
            </label>
          </div>

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
              Redes sociais & contato
            </p>
            <div style={{ display: "grid", gap: "16px" }}>
              <label>
                <span style={labelStyle}>Instagram (URL completa)</span>
                <input
                  type="url"
                  placeholder="https://instagram.com/caduelegance"
                  value={instagramUrl}
                  onChange={(e) => setInstagramUrl(e.target.value)}
                  style={inputStyle}
                />
              </label>
              <label>
                <span style={labelStyle}>WhatsApp (código do país + DDD + número, só dígitos)</span>
                <input
                  type="text"
                  placeholder="5511999999999"
                  value={whatsappNumero}
                  onChange={(e) => setWhatsappNumero(e.target.value.replace(/\D/g, ""))}
                  style={inputStyle}
                />
              </label>
              <label>
                <span style={labelStyle}>Informações de contato (endereço, horário, telefone...)</span>
                <textarea
                  rows={4}
                  placeholder="Rua Exemplo, 123 — Seg a Sáb, 9h às 19h"
                  value={contatoTexto}
                  onChange={(e) => setContatoTexto(e.target.value)}
                  style={inputStyle}
                />
              </label>
            </div>
          </div>

          {error && <p style={{ color: "#f87171", fontSize: "13px", margin: 0 }}>{error}</p>}
          {success && <p style={{ color: "#10b981", fontSize: "13px", margin: 0 }}>{success}</p>}

          <button
            type="submit"
            disabled={saving}
            style={{
              justifySelf: "start",
              padding: "11px 28px",
              borderRadius: "8px",
              border: "none",
              background: saving ? "rgba(209,183,107,0.3)" : "linear-gradient(135deg, #d1b76b, #f6e79d)",
              color: "#1a1a1a",
              fontWeight: "700",
              fontSize: "13px",
              cursor: saving ? "not-allowed" : "pointer",
              letterSpacing: "0.06em",
            }}
          >
            {saving ? "Salvando..." : "Salvar alterações"}
          </button>
        </form>
      )}
    </AdminLayout>
  );
}
