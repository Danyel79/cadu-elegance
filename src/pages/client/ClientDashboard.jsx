import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useUserProfile } from "../../hooks/useUserProfile";

export default function ClientDashboard() {
  const { user, signOut } = useAuth();
  const { isAdmin } = useUserProfile();

  return (
    <main
      className="client-dashboard"
      style={{
        minHeight: "100vh",
        padding: "36px 24px",
        background: "#080808",
        color: "#f6f2e8",
      }}
    >
      <div style={{ maxWidth: "1180px", margin: "0 auto" }}>
        <header style={{ marginBottom: "42px" }}>
          <p style={{ color: "#d1b76b", textTransform: "uppercase", letterSpacing: "0.24em", marginBottom: "10px" }}>
            Área do cliente
          </p>
          <h1 style={{ fontSize: "clamp(2rem, 3vw, 3.4rem)", marginBottom: "16px" }}>
            Olá, {user?.name || user?.email || "cliente"}
          </h1>
          <p style={{ maxWidth: "700px", lineHeight: 1.8, color: "#beb7a3" }}>
            Agende com os profissionais disponíveis, escolha apenas os serviços cadastrados e confirme o horário na hora.
          </p>
        </header>

        <div style={{ display: "grid", gap: "22px", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))" }}>
          <Link to="/client/book" style={cardStyle}>
            <span className="material-symbols-outlined" style={iconStyle}>calendar_month</span>
            <div>
              <h2>Agendar</h2>
              <p>Escolha profissional, serviço, data e horário.</p>
            </div>
          </Link>

          <Link to="/client/bookings" style={cardStyle}>
            <span className="material-symbols-outlined" style={iconStyle}>event_available</span>
            <div>
              <h2>Meus agendamentos</h2>
              <p>Veja seus compromissos confirmados e históricos.</p>
            </div>
          </Link>

          <Link to="/client/services" style={cardStyle}>
            <span className="material-symbols-outlined" style={iconStyle}>inventory_2</span>
            <div>
              <h2>Serviços</h2>
              <p>Veja apenas os serviços cadastrados pela barbearia.</p>
            </div>
          </Link>

          <Link to="/client/profile" style={cardStyle}>
            <span className="material-symbols-outlined" style={iconStyle}>person</span>
            <div>
              <h2>Perfil</h2>
              <p>Atualize seus dados pessoais e preferências.</p>
            </div>
          </Link>

          {isAdmin && (
            <Link to="/admin" style={cardStyle}>
              <span className="material-symbols-outlined" style={iconStyle}>admin_panel_settings</span>
              <div>
                <h2>Painel admin</h2>
                <p>Acesse o painel de administração quando precisar.</p>
              </div>
            </Link>
          )}
        </div>

        <footer style={{ marginTop: "42px" }}>
          <button
            type="button"
            onClick={signOut}
            style={{
              border: "1px solid #d1b76b",
              background: "transparent",
              color: "#f6f2e8",
              padding: "12px 24px",
              borderRadius: "12px",
              cursor: "pointer",
            }}
          >
            Sair
          </button>
        </footer>
      </div>
    </main>
  );
}

const cardStyle = {
  display: "flex",
  alignItems: "flex-start",
  gap: "18px",
  padding: "26px",
  borderRadius: "24px",
  textDecoration: "none",
  border: "1px solid rgba(209, 183, 107, 0.18)",
  background: "rgba(255, 255, 255, 0.03)",
  boxShadow: "0 28px 80px rgba(0,0,0,0.25)",
  color: "inherit",
};

const iconStyle = {
  fontSize: "38px",
  color: "#d1b76b",
};
