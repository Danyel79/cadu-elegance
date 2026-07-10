import { useEffect, useState } from "react";
import { getSiteContent } from "../services/siteContentService";
import { InstagramIcon, WhatsAppIcon } from "../components/SocialIcons";
import PublicSiteHeader from "../components/PublicSiteHeader";
import Reveal from "../components/Reveal";

export default function ContactPage() {
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const res = await getSiteContent();
      if (res.success) setContent(res.data);
      setLoading(false);
    }
    load();
  }, []);

  const whatsappUrl = content?.whatsappNumero ? `https://wa.me/${content.whatsappNumero}` : null;
  const instagramUrl = content?.instagramUrl || null;

  return (
    <div style={{ minHeight: "100vh", background: "#0a0909", color: "#f6f2e8" }}>
      <PublicSiteHeader />

      <main style={{ maxWidth: "640px", margin: "0 auto", padding: "72px 32px 96px" }}>
        {loading ? (
          <p style={{ color: "#beb7a3" }}>Carregando...</p>
        ) : (
          <Reveal>
            <p style={{ color: "#d1b76b", textTransform: "uppercase", letterSpacing: "0.24em", fontSize: "11px", marginBottom: "12px" }}>
              Fale com a gente
            </p>
            <h1
              style={{
                fontFamily: "'Noto Serif', serif",
                fontSize: "clamp(2rem, 4vw, 3rem)",
                margin: "0 0 24px",
                color: "#f2ca50",
              }}
            >
              Contato
            </h1>

            {content?.contatoTexto ? (
              <p style={{ color: "#beb7a3", fontSize: "15px", lineHeight: 1.9, whiteSpace: "pre-line", marginBottom: "32px" }}>
                {content.contatoTexto}
              </p>
            ) : (
              <p style={{ color: "#6b6359", fontSize: "14px", marginBottom: "32px" }}>
                Informações de contato em breve.
              </p>
            )}

            {(whatsappUrl || instagramUrl) && (
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {whatsappUrl && (
                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                      padding: "14px 20px",
                      borderRadius: "12px",
                      border: "1px solid rgba(255,255,255,0.1)",
                      color: "#f6f2e8",
                      textDecoration: "none",
                      fontSize: "14px",
                      fontWeight: "600",
                    }}
                  >
                    <WhatsAppIcon size={20} color="#10b981" />
                    Conversar no WhatsApp
                  </a>
                )}
                {instagramUrl && (
                  <a
                    href={instagramUrl}
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                      padding: "14px 20px",
                      borderRadius: "12px",
                      border: "1px solid rgba(255,255,255,0.1)",
                      color: "#f6f2e8",
                      textDecoration: "none",
                      fontSize: "14px",
                      fontWeight: "600",
                    }}
                  >
                    <InstagramIcon size={20} color="#d1b76b" />
                    Seguir no Instagram
                  </a>
                )}
              </div>
            )}
          </Reveal>
        )}
      </main>
    </div>
  );
}
