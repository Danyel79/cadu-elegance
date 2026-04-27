import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function ClientProfile() {
  const { user } = useAuth();

  return (
    <main style={{ padding: "32px", maxWidth: "840px", margin: "0 auto" }}>
      <header style={{ marginBottom: "32px" }}>
        <p style={{ color: "#b2996e", textTransform: "uppercase", letterSpacing: "0.2em", marginBottom: "12px" }}>
          Meu perfil
        </p>
        <h1 style={{ fontSize: "clamp(2rem, 2.5vw, 3rem)", marginBottom: "12px" }}>
          Informações do cliente
        </h1>
        <p style={{ maxWidth: "700px", lineHeight: 1.75, color: "#555" }}>
          Verifique seus dados e mantenha seu perfil atualizado para um atendimento mais personalizado.
        </p>
      </header>

      <section style={{ display: "grid", gap: "18px" }}>
        <div style={fieldCardStyle}>
          <strong>Nome</strong>
          <span>{user?.name || "Não informado"}</span>
        </div>
        <div style={fieldCardStyle}>
          <strong>Email</strong>
          <span>{user?.email || "Não informado"}</span>
        </div>
        <div style={fieldCardStyle}>
          <strong>Tipo de conta</strong>
          <span>{user?.role === "admin" ? "Administrador" : "Cliente"}</span>
        </div>
      </section>

      <div style={{ marginTop: "30px" }}>
        <Link
          to="/client"
          style={{
            color: "#b2996e",
            textDecoration: "none",
            fontWeight: "600",
          }}
        >
          ← Voltar para área do cliente
        </Link>
      </div>
    </main>
  );
}

const fieldCardStyle = {
  padding: "22px",
  borderRadius: "18px",
  border: "1px solid rgba(0,0,0,0.08)",
  background: "#fff",
  boxShadow: "0 18px 40px rgba(0,0,0,0.04)",
  display: "grid",
  gap: "6px",
};
