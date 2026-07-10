import { useEffect, useState } from "react";
import { listProfessionals, getStaffPhotoUrl } from "../services/adminDataService";
import { getSiteContent } from "../services/siteContentService";
import { listGalleryGroups } from "../services/galleryService";
import PublicSiteHeader from "../components/PublicSiteHeader";
import Reveal from "../components/Reveal";

const VALORES = [
  {
    icon: "auto_awesome",
    title: "Sofisticação",
    text: "Um ambiente que reflete precisão e cuidado em cada detalhe do atendimento.",
  },
  {
    icon: "diversity_3",
    title: "Relacionamento",
    text: "Construímos vínculos duradouros com quem confia na Cadu Elegance.",
  },
  {
    icon: "bolt",
    title: "Inovação",
    text: "Técnicas tradicionais unidas às tendências mais atuais do grooming.",
  },
];

const DIFERENCIAIS = [
  "Ambiente climatizado e exclusivo",
  "Produtos premium selecionados",
  "Agendamento 100% online",
  "Wi-Fi de alta velocidade",
  "Atendimento pontual e ágil",
  "Espaço pensado para sua experiência",
];

export default function AboutPage() {
  const [content, setContent] = useState(null);
  const [professionals, setProfessionals] = useState([]);
  const [galleryGroups, setGalleryGroups] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const [contentRes, profRes, galleryRes] = await Promise.all([
        getSiteContent(),
        listProfessionals(),
        listGalleryGroups(),
      ]);
      if (contentRes.success) setContent(contentRes.data);
      if (profRes.success) setProfessionals(profRes.data);
      if (galleryRes.success) setGalleryGroups(galleryRes.data);
      setLoading(false);
    }
    load();
  }, []);

  const barbeariaFotoUrl = getStaffPhotoUrl(content?.barbeariaFotoId);

  return (
    <div style={{ minHeight: "100vh", background: "#0a0909", color: "#f6f2e8" }}>
      <PublicSiteHeader />

      <main style={{ maxWidth: "1000px", margin: "0 auto", padding: "56px 32px 96px" }}>
        {loading ? (
          <p style={{ color: "#beb7a3" }}>Carregando...</p>
        ) : (
          <>
            {/* Sobre a barbearia */}
            <Reveal as="section" style={{ marginBottom: "80px" }}>
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
            </Reveal>

            {/* Galerias — fileiras nomeadas cadastradas pelo admin */}
            {galleryGroups
              .filter((group) => Array.isArray(group.fotos) && group.fotos.length > 0)
              .map((group) => (
                <section key={group.$id} style={{ marginBottom: "80px" }}>
                  <Reveal>
                    <h2 style={{ fontFamily: "'Noto Serif', serif", fontSize: "clamp(1.6rem, 3vw, 2.2rem)", margin: "0 0 28px", color: "#f6f2e8" }}>
                      {group.titulo}
                    </h2>
                  </Reveal>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
                      gap: "16px",
                    }}
                  >
                    {group.fotos.map((fileId, i) => (
                      <Reveal
                        key={fileId}
                        delay={i * 0.05}
                        style={{
                          aspectRatio: "1/1",
                          borderRadius: "14px",
                          overflow: "hidden",
                          background: "#141312",
                        }}
                      >
                        <img
                          src={getStaffPhotoUrl(fileId)}
                          alt={group.titulo}
                          style={{ width: "100%", height: "100%", objectFit: "cover" }}
                        />
                      </Reveal>
                    ))}
                  </div>
                </section>
              ))}

            {/* Nossos Valores */}
            <section style={{ marginBottom: "80px" }}>
              <Reveal>
                <p style={{ color: "#d1b76b", textTransform: "uppercase", letterSpacing: "0.24em", fontSize: "11px", marginBottom: "12px" }}>
                  Os pilares que guiam nosso trabalho
                </p>
                <h2 style={{ fontFamily: "'Noto Serif', serif", fontSize: "clamp(1.6rem, 3vw, 2.2rem)", margin: "0 0 28px", color: "#f6f2e8" }}>
                  Nossos Valores
                </h2>
              </Reveal>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                  gap: "20px",
                }}
              >
                {VALORES.map((valor, i) => (
                  <Reveal
                    key={valor.title}
                    delay={i * 0.1}
                    style={{
                      padding: "28px 24px",
                      borderRadius: "16px",
                      background: "#141312",
                      border: "1px solid rgba(255,255,255,0.06)",
                    }}
                  >
                    <span className="material-symbols-outlined" style={{ color: "#d1b76b", fontSize: "28px", display: "block", marginBottom: "14px" }}>
                      {valor.icon}
                    </span>
                    <h3 style={{ margin: "0 0 8px", color: "#f6f2e8", fontSize: "16px", fontFamily: "'Noto Serif', serif" }}>
                      {valor.title}
                    </h3>
                    <p style={{ margin: 0, color: "#99907c", fontSize: "13px", lineHeight: 1.7 }}>{valor.text}</p>
                  </Reveal>
                ))}
              </div>
            </section>

            {/* Nossos Diferenciais */}
            <section style={{ marginBottom: "80px" }}>
              <Reveal>
                <p style={{ color: "#d1b76b", textTransform: "uppercase", letterSpacing: "0.24em", fontSize: "11px", marginBottom: "12px" }}>
                  Experiência premium em cada detalhe
                </p>
                <h2 style={{ fontFamily: "'Noto Serif', serif", fontSize: "clamp(1.6rem, 3vw, 2.2rem)", margin: "0 0 28px", color: "#f6f2e8" }}>
                  Nossos Diferenciais
                </h2>
              </Reveal>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
                  gap: "16px",
                }}
              >
                {DIFERENCIAIS.map((item, i) => (
                  <Reveal
                    key={item}
                    delay={i * 0.05}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                      padding: "16px 18px",
                      borderRadius: "12px",
                      background: "#141312",
                      border: "1px solid rgba(255,255,255,0.06)",
                    }}
                  >
                    <span className="material-symbols-outlined" style={{ color: "#d1b76b", fontSize: "20px", flexShrink: 0 }}>
                      check_circle
                    </span>
                    <span style={{ color: "#e5e2e1", fontSize: "13px" }}>{item}</span>
                  </Reveal>
                ))}
              </div>
            </section>

            {/* Profissionais */}
            <Reveal as="section">
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
            </Reveal>
          </>
        )}
      </main>
    </div>
  );
}
