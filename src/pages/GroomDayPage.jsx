import { useState } from "react";
import PublicSiteHeader from "../components/PublicSiteHeader";
import Reveal from "../components/Reveal";

const BENEFICIOS = [
  {
    icon: "event",
    title: "Agendamento Flexível",
    text: "Horários personalizados para o dia do seu casamento.",
  },
  {
    icon: "diversity_3",
    title: "Pacotes em Grupo",
    text: "Descontos especiais para noivo + padrinhos.",
  },
  {
    icon: "favorite",
    title: "Experiência Premium",
    text: "Ambiente exclusivo com serviços de alto padrão.",
  },
];

const EMPTY_FORM = {
  nome: "",
  whatsapp: "",
  dataCasamento: "",
  padrinhos: "",
  observacoes: "",
};

const inputStyle = {
  width: "100%",
  padding: "12px 14px",
  borderRadius: "10px",
  border: "1px solid rgba(255, 255, 255, 0.12)",
  background: "rgba(255, 255, 255, 0.04)",
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
  letterSpacing: "0.1em",
  marginBottom: "6px",
};

export default function GroomDayPage() {
  const [form, setForm] = useState(EMPTY_FORM);
  const [submitted, setSubmitted] = useState(false);

  function handleChange(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    // Envio automático via WhatsApp ainda não está integrado (API da Meta
    // pendente) — por enquanto só confirmamos o recebimento na tela.
    setSubmitted(true);
  }

  return (
    <div style={{ minHeight: "100vh", background: "#0a0909", color: "#f6f2e8" }}>
      <PublicSiteHeader />

      <main style={{ maxWidth: "760px", margin: "0 auto", padding: "56px 32px 96px" }}>
        <Reveal>
          <p style={{ color: "#d1b76b", textTransform: "uppercase", letterSpacing: "0.24em", fontSize: "11px", marginBottom: "12px" }}>
            Um momento único
          </p>
          <h1
            style={{
              fontFamily: "'Noto Serif', serif",
              fontSize: "clamp(2rem, 4vw, 3rem)",
              margin: "0 0 16px",
              color: "#f2ca50",
            }}
          >
            Dia do <em style={{ color: "#d1b76b" }}>Noivo</em>
          </h1>
          <p style={{ color: "#beb7a3", fontSize: "15px", lineHeight: 1.9, maxWidth: "560px", marginBottom: "48px" }}>
            Um dia especial merece cuidados especiais. Prepare-se com elegância ao lado dos seus padrinhos.
          </p>
        </Reveal>

        <section style={{ marginBottom: "56px" }}>
          <Reveal>
            <h2 style={{ fontFamily: "'Noto Serif', serif", fontSize: "clamp(1.3rem, 2.5vw, 1.7rem)", margin: "0 0 24px", color: "#f6f2e8" }}>
              Por que escolher nosso pacote?
            </h2>
          </Reveal>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "18px" }}>
            {BENEFICIOS.map((b, i) => (
              <Reveal
                key={b.title}
                delay={i * 0.1}
                style={{
                  padding: "24px 20px",
                  borderRadius: "16px",
                  background: "#141312",
                  border: "1px solid rgba(255,255,255,0.06)",
                  textAlign: "center",
                }}
              >
                <span className="material-symbols-outlined" style={{ color: "#d1b76b", fontSize: "26px", display: "block", marginBottom: "12px" }}>
                  {b.icon}
                </span>
                <h3 style={{ margin: "0 0 8px", color: "#f6f2e8", fontSize: "15px", fontFamily: "'Noto Serif', serif" }}>{b.title}</h3>
                <p style={{ margin: 0, color: "#99907c", fontSize: "13px", lineHeight: 1.6 }}>{b.text}</p>
              </Reveal>
            ))}
          </div>
        </section>

        <Reveal
          as="section"
          style={{
            padding: "32px",
            borderRadius: "20px",
            background: "#141312",
            border: "1px solid rgba(209,183,107,0.15)",
          }}
        >
          {submitted ? (
            <div style={{ textAlign: "center", padding: "24px 0" }}>
              <span className="material-symbols-outlined" style={{ color: "#10b981", fontSize: "40px", display: "block", marginBottom: "16px" }}>
                check_circle
              </span>
              <h2 style={{ fontFamily: "'Noto Serif', serif", fontSize: "1.4rem", margin: "0 0 10px", color: "#f6f2e8" }}>
                Solicitação recebida!
              </h2>
              <p style={{ color: "#99907c", fontSize: "14px", maxWidth: "420px", margin: "0 auto" }}>
                Em breve nossa equipe entra em contato pelo WhatsApp {form.whatsapp} para confirmar os detalhes do seu Dia do Noivo.
              </p>
            </div>
          ) : (
            <>
              <h2 style={{ fontFamily: "'Noto Serif', serif", fontSize: "1.4rem", margin: "0 0 6px", color: "#f6f2e8" }}>
                Reserve seu Dia do Noivo
              </h2>
              <p style={{ color: "#99907c", fontSize: "13px", margin: "0 0 24px" }}>
                Preencha seus dados — em breve o envio será automático pelo WhatsApp.
              </p>
              <form onSubmit={handleSubmit} style={{ display: "grid", gap: "16px" }}>
                <label>
                  <span style={labelStyle}>Nome completo</span>
                  <input
                    type="text"
                    required
                    value={form.nome}
                    onChange={(e) => handleChange("nome", e.target.value)}
                    style={inputStyle}
                  />
                </label>
                <label>
                  <span style={labelStyle}>WhatsApp</span>
                  <input
                    type="tel"
                    required
                    placeholder="(11) 99999-9999"
                    value={form.whatsapp}
                    onChange={(e) => handleChange("whatsapp", e.target.value)}
                    style={inputStyle}
                  />
                </label>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                  <label>
                    <span style={labelStyle}>Data do casamento</span>
                    <input
                      type="date"
                      required
                      value={form.dataCasamento}
                      onChange={(e) => handleChange("dataCasamento", e.target.value)}
                      style={inputStyle}
                    />
                  </label>
                  <label>
                    <span style={labelStyle}>Nº de padrinhos</span>
                    <input
                      type="number"
                      min="0"
                      placeholder="0"
                      value={form.padrinhos}
                      onChange={(e) => handleChange("padrinhos", e.target.value)}
                      style={inputStyle}
                    />
                  </label>
                </div>
                <label>
                  <span style={labelStyle}>Observações (opcional)</span>
                  <textarea
                    rows={3}
                    placeholder="Alguma preferência ou detalhe que devemos saber?"
                    value={form.observacoes}
                    onChange={(e) => handleChange("observacoes", e.target.value)}
                    style={inputStyle}
                  />
                </label>

                <button
                  type="submit"
                  style={{
                    justifySelf: "start",
                    padding: "12px 28px",
                    borderRadius: "10px",
                    border: "none",
                    background: "linear-gradient(135deg, #d1b76b, #f6e79d)",
                    color: "#1a1a1a",
                    fontWeight: "700",
                    fontSize: "13px",
                    cursor: "pointer",
                    letterSpacing: "0.06em",
                  }}
                >
                  Enviar solicitação
                </button>
              </form>
            </>
          )}
        </Reveal>
      </main>
    </div>
  );
}
