import { Link, useLocation } from "react-router-dom";
import { CLIENT_AREA_INNER_STYLE, CLIENT_AREA_MAIN_STYLE } from "../client/clientAreaLayout";

const navigation = [
  { name: "Painel", href: "/professional", icon: "home" },
  { name: "Agendamentos", href: "/professional/bookings", icon: "event_available" },
  { name: "Agenda", href: "/professional/schedule", icon: "calendar_month" },
  { name: "Perfil", href: "/client/profile", icon: "person" },
];

export default function ProfessionalLayout({ children }) {
  const location = useLocation();

  return (
    <main style={CLIENT_AREA_MAIN_STYLE}>
      <div style={CLIENT_AREA_INNER_STYLE}>
        <nav style={{ marginBottom: "34px", display: "flex", flexWrap: "wrap", gap: "12px" }}>
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
                  background: active ? "#d1b76b" : "rgba(255,255,255,0.04)",
                  border: active ? "1px solid #d1b76b" : "1px solid rgba(255,255,255,0.08)",
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
  );
}
