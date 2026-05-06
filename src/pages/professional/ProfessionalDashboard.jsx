import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useUserProfile } from "../../hooks/useUserProfile";
import ProfessionalLayout from "./ProfessionalLayout";

export default function ProfessionalDashboard() {
  const { user, signOut } = useAuth();
  const { profile } = useUserProfile();

  const displayName = profile?.nickName || user?.name || user?.email || "Profissional";

  return (
    <ProfessionalLayout>
      <header style={{ marginBottom: "42px" }}>
        <p style={{ color: "#d1b76b", textTransform: "uppercase", letterSpacing: "0.24em", marginBottom: "12px" }}>
          Área do profissional
        </p>
        <h1
          style={{
            fontSize: "clamp(2rem, 2.8vw, 3.4rem)",
            marginBottom: "14px",
            color: "#f6f2e8",
          }}
        >
          Olá, {displayName}
        </h1>
        <p style={{ maxWidth: "740px", lineHeight: 1.8, color: "#beb7a3" }}>
          Visualize seus agendamentos confirmados, bloqueie horários e mantenha sua agenda sob controle.
        </p>
      </header>

      <div style={{ display: "grid", gap: "22px", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))" }}>
        <Link to="/professional/bookings" style={cardStyle}>
          <span className="material-symbols-outlined" style={iconStyle}>event_available</span>
          <div>
            <h2 style={cardHeadingStyle}>Clientes agendados</h2>
            <p style={{ color: "#beb7a3", lineHeight: 1.55 }}>Confira os próximos compromissos e acompanhe cada reserva.</p>
          </div>
        </Link>

        <Link to="/professional/schedule" style={cardStyle}>
          <span className="material-symbols-outlined" style={iconStyle}>calendar_month</span>
          <div>
            <h2 style={cardHeadingStyle}>Bloquear agenda</h2>
            <p style={{ color: "#beb7a3", lineHeight: 1.55 }}>Reserve horários ou dias inteiros para não receber novos agendamentos.</p>
          </div>
        </Link>

        <Link to="/client/profile" style={cardStyle}>
          <span className="material-symbols-outlined" style={iconStyle}>person</span>
          <div>
            <h2 style={cardHeadingStyle}>Meu perfil</h2>
            <p style={{ color: "#beb7a3", lineHeight: 1.55 }}>Atualize seus dados pessoais e verifique suas informações.</p>
          </div>
        </Link>
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
    </ProfessionalLayout>
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

const cardHeadingStyle = {
  margin: "0 0 8px",
  color: "#d1b76b",
};

const iconStyle = {
  fontSize: "38px",
  color: "#d1b76b",
};
