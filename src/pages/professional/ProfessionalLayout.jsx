import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { CLIENT_AREA_INNER_STYLE, CLIENT_AREA_MAIN_STYLE } from "../client/clientAreaLayout";

const navigation = [
  { name: "Painel", href: "/professional", icon: "home" },
  { name: "Agendamentos", href: "/professional/bookings", icon: "event_available" },
  { name: "Agenda", href: "/professional/schedule", icon: "calendar_month" },
  { name: "Perfil", href: "/client/profile", icon: "person" },
];

export default function ProfessionalLayout({ children }) {
  const location = useLocation();
  const { signOut } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    await signOut();
    navigate("/login", { replace: true });
  }

  return (
    <div style={{ minHeight: "100vh", background: "#080808", color: "#f6f2e8" }}>
      {/* ── Top bar fixa: Voltar | Sair ── */}
      <header
        style={{
          position: "sticky",
          top: 0,
          zIndex: 100,
          background: "rgba(8,8,8,0.96)",
          backdropFilter: "blur(10px)",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
          padding: "0 24px",
          height: "52px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "16px",
        }}
      >
        <Link
          to="/home"
          style={{
            color: "#d1b76b",
            textDecoration: "none",
            fontSize: "13px",
            fontWeight: "600",
            display: "flex",
            alignItems: "center",
            gap: "4px",
          }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>
            arrow_back
          </span>
          Início
        </Link>

        <p
          style={{
            margin: 0,
            fontFamily: "'Noto Serif', serif",
            fontSize: "13px",
            color: "#f2ca50",
            fontWeight: "700",
          }}
        >
          Cadu Elegance
        </p>

        <button
          type="button"
          onClick={handleLogout}
          style={{
            background: "transparent",
            border: "1px solid rgba(255,255,255,0.1)",
            color: "#beb7a3",
            padding: "6px 14px",
            borderRadius: "8px",
            cursor: "pointer",
            fontSize: "13px",
            display: "flex",
            alignItems: "center",
            gap: "5px",
          }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: "15px" }}>
            logout
          </span>
          Sair
        </button>
      </header>

      {/* ── Conteúdo + Nav interna ── */}
      <main style={{ ...CLIENT_AREA_MAIN_STYLE, paddingTop: "28px" }}>
        <div style={CLIENT_AREA_INNER_STYLE}>
          <nav
            style={{
              marginBottom: "34px",
              display: "flex",
              flexWrap: "wrap",
              gap: "12px",
            }}
          >
            {navigation.map((item) => {
              const active = location.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "10px",
                    padding: "14px 20px",
                    borderRadius: "14px",
                    textDecoration: "none",
                    color: active ? "#080808" : "#f6f2e8",
                    background: active
                      ? "#d1b76b"
                      : "rgba(255,255,255,0.04)",
                    border: active
                      ? "1px solid #d1b76b"
                      : "1px solid rgba(255,255,255,0.08)",
                    transition: "all 0.2s ease",
                  }}
                >
                  <span className="material-symbols-outlined">{item.icon}</span>
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>

          {children}
        </div>
      </main>
    </div>
  );
}
