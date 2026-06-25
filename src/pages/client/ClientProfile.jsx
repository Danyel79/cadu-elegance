import { useAuth } from "../../context/AuthContext";
import ClientLayout from "./ClientLayout";

export default function ClientProfile() {
  const { user } = useAuth();

  return (
    <ClientLayout backTo="/client" backLabel="← Área do cliente">
        <header style={{ marginBottom: "42px" }}>
          <p
            style={{
              color: "#d1b76b",
              textTransform: "uppercase",
              letterSpacing: "0.24em",
              marginBottom: "12px",
            }}
          >
            Meu perfil
          </p>
          <h1
            style={{
              fontSize: "clamp(2rem, 2.5vw, 3rem)",
              marginBottom: "12px",
              color: "#f6f2e8",
            }}
          >
            Informações do cliente
          </h1>
          <p style={{ maxWidth: "700px", lineHeight: 1.75, color: "#beb7a3" }}>
            Verifique seus dados e mantenha seu perfil atualizado para um atendimento mais personalizado.
          </p>
        </header>

        <section style={{ display: "grid", gap: "18px" }}>
          <div style={fieldCardStyle}>
            <strong style={{ color: "#d1b76b", fontSize: "0.75rem", letterSpacing: "0.12em", textTransform: "uppercase" }}>
              Nome
            </strong>
            <span style={{ color: "#f6f2e8" }}>{user?.name || "Não informado"}</span>
          </div>
          <div style={fieldCardStyle}>
            <strong style={{ color: "#d1b76b", fontSize: "0.75rem", letterSpacing: "0.12em", textTransform: "uppercase" }}>
              Email
            </strong>
            <span style={{ color: "#f6f2e8" }}>{user?.email || "Não informado"}</span>
          </div>
          <div style={fieldCardStyle}>
            <strong style={{ color: "#d1b76b", fontSize: "0.75rem", letterSpacing: "0.12em", textTransform: "uppercase" }}>
              Tipo de conta
            </strong>
            <span style={{ color: "#f6f2e8" }}>{user?.role === "admin" ? "Administrador" : "Cliente"}</span>
          </div>
        </section>

    </ClientLayout>
  );
}

const fieldCardStyle = {
  padding: "22px",
  borderRadius: "18px",
  border: "1px solid rgba(209, 183, 107, 0.18)",
  background: "rgba(255, 255, 255, 0.04)",
  boxShadow: "0 18px 40px rgba(0, 0, 0, 0.24)",
  display: "grid",
  gap: "8px",
};
