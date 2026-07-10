import { Link, useLocation, useNavigate } from "react-router-dom";

const NAV_LINKS = [
  { to: "/sobre", label: "SOBRE NÓS" },
  { to: "/dia-do-noivo", label: "DIA DO NOIVO" },
  { to: "/contato", label: "CONTATO" },
];

export default function PublicSiteHeader() {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <header
      style={{
        padding: "0 32px",
        height: "64px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
        flexWrap: "wrap",
        gap: "12px",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "24px" }}>
        <button
          type="button"
          onClick={() => navigate(-1)}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
            background: "none",
            border: "none",
            color: "#99907c",
            fontSize: "12px",
            fontWeight: "600",
            letterSpacing: "0.04em",
            cursor: "pointer",
            padding: 0,
          }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>
            arrow_back
          </span>
          Voltar
        </button>
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
      </div>
      <nav style={{ display: "flex", gap: "24px" }}>
        {NAV_LINKS.map((link) => {
          const active = location.pathname === link.to;
          return (
            <Link
              key={link.to}
              to={link.to}
              style={{
                color: active ? "#d1b76b" : "#99907c",
                fontSize: "12px",
                fontWeight: active ? "700" : "600",
                textDecoration: "none",
                letterSpacing: "0.08em",
              }}
            >
              {link.label}
            </Link>
          );
        })}
      </nav>
    </header>
  );
}
