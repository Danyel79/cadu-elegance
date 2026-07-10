import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { listProfessionals, getStaffPhotoUrl } from "../services/adminDataService";
import { getSiteContent } from "../services/siteContentService";

export default function AboutPage() {
  const [content, setContent] = useState(null);
  const [professionals, setProfessionals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const [contentRes, profRes] = await Promise.all([
        getSiteContent(),
        listProfessionals(),
      ]);
      if (contentRes.success) setContent(contentRes.data);
      if (profRes.success) setProfessionals(profRes.data);
      setLoading(false);
    }
    load();
  }, []);

  const barbeariaFotoUrl = getStaffPhotoUrl(content?.barbeariaFotoId);

  return (
    <div style={{ minHeight: "100vh", background: "#0a0909", color: "#f6f2e8" }}>
      <header
        style={{
          padding: "0 32px",
          height: "64px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        <Link
          to="/login"
          style={{
            fontFamily: "'Noto Serif', serif",
            fontWeight: "700",
            fontSize: "16px",
            color: "#d1b76b",
            textDecoration: "none",
          }}
        >
          Cadu Elegance
        </Link>
        <nav style={{ display: "flex", gap: "24px" }}>
          <Link to="/sobre" style={{ color: "#d1b76b", fontSize: "12px", fontWeight: "700", textDecoration: "none", letterSpacing: "0.08em" }}>
            SOBRE NÓS
          </Link>
          <Link to="/contato" style={{ color: "#99907c", fontSize: "12px", fontWeight: "600", textDecoration: "none", letterSpacing: "0.08em" }}>
            CONTATO
          </Link>
        </nav>
      </header>

      <main style={{ maxWidth: "1000px", margin: "0 auto", padding: "56px 32px 80px" }}>
        {loading ? (
          <p style={{ color: "#beb7a3" }}>Carregando...</p>
        ) : (
          <>
            {/* Sobre a barbearia */}
            <section style={{ marginBottom: "64px" }}>
              <p style={{ color: "#d1b76b", textTransform: "uppercase", letterSpacing: "0.24em", fontSize: "11px", marginBottom: "12px" }}>
                Nossa história
              </p>
              <h1
                style={{
                  fontFamily: "'Noto Serif', serif",
                  fontSize: "clamp(2rem, 4vw, 3rem)",
                  margin: "0 0 24px",
                  color: "#f2ca50",
                }}
              >
                Sobre a Cadu Elegance
              </h1>

              {barbeariaFotoUrl && (
                <div
                  style={{
                    width: "100%",
                    aspectRatio: "16/7",
                    borderRadius: "20px",
                    overflow: "hidden",
                    marginBottom: "28px",
                    background: "#141312",
                  }}
                >
                  <img
                    src={barbeariaFotoUrl}
                    alt="Cadu Elegance"
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  />
                </div>
              )}

              {content?.barbeariaTexto ? (
                <p style={{ color: "#beb7a3", fontSize: "15px", lineHeight: 1.9, whiteSpace: "pre-line" }}>
                  {content.barbeariaTexto}
                </p>
              ) : (
                <p style={{ color: "#6b6359", fontSize: "14px" }}>
                  Conteúdo em preparação — em breve contaremos nossa história aqui.
                </p>
              )}
            </section>

            {/* Profissionais */}
            <section>
              <p style={{ color: "#d1b76b", textTransform: "uppercase", letterSpacing: "0.24em", fontSize: "11px", marginBottom: "12px" }}>
                Nossa equipe
              </p>
              <h2 style={{ fontFamily: "'Noto Serif', serif", fontSize: "clamp(1.6rem, 3vw, 2.2rem)", margin: "0 0 28px", color: "#f6f2e8" }}>
                Profissionais
              </h2>

              {professionals.length === 0 ? (
                <p style={{ color: "#6b6359", fontSize: "14px" }}>Nenhum profissional cadastrado no momento.</p>
              ) : (
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
                    gap: "24px",
                  }}
                >
                  {professionals.map((prof) => {
                    const photoUrl = getStaffPhotoUrl(prof.fotoFileId);
                    return (
                      <div
                        key={prof.$id}
                        style={{
                          borderRadius: "16px",
                          background: "#141312",
                          border: "1px solid rgba(255,255,255,0.06)",
                          overflow: "hidden",
                        }}
                      >
                        <div
                          style={{
                            aspectRatio: "1/1",
                            background: "#1a1918",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            overflow: "hidden",
                          }}
                        >
                          {photoUrl ? (
                            <img
                              src={photoUrl}
                              alt={prof.nickName}
                              style={{ width: "100%", height: "100%", objectFit: "cover" }}
                            />
                          ) : (
                            <span className="material-symbols-outlined" style={{ color: "#2a2826", fontSize: "48px" }}>
                              person
                            </span>
                          )}
                        </div>
                        <div style={{ padding: "16px 18px 20px" }}>
                          <h3 style={{ margin: "0 0 8px", color: "#f6f2e8", fontSize: "16px", fontFamily: "'Noto Serif', serif" }}>
                            {prof.nickName || "Profissional"}
                          </h3>
                          <p style={{ margin: 0, color: "#99907c", fontSize: "13px", lineHeight: 1.7, whiteSpace: "pre-line" }}>
                            {prof.bio || "Sem biografia cadastrada."}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>
          </>
        )}
      </main>
    </div>
  );
}
