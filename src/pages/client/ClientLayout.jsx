import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

/**
 * Layout compartilhado das páginas do cliente.
 * Barra fixada no topo: ← Voltar à esquerda | Sair à direita.
 */
export default function ClientLayout({
  children,
  backTo = "/client",
  backLabel = "← Área do cliente",
}) {
  const { signOut } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    if (!window.confirm("Tem certeza que deseja sair?")) return;
    await signOut();
    navigate("/login", { replace: true });
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#080808",
        color: "#f6f2e8",
        boxSizing: "border-box",
      }}
    >
      {/* ── Top bar fixada ── */}
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
          to={backTo}
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
          <span
            className="material-symbols-outlined"
            style={{ fontSize: "16px" }}
          >
            arrow_back
          </span>
          {backLabel}
        </Link>

        <p
          style={{
            margin: 0,
            fontFamily: "'Noto Serif', serif",
            fontSize: "13px",
            color: "#d1b76b",
            letterSpacing: "0.06em",
            opacity: 0.7,
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
          <span
            className="material-symbols-outlined"
            style={{ fontSize: "15px" }}
          >
            logout
          </span>
          Sair
        </button>
      </header>

      {/* ── Conteúdo ── */}
      <main
        style={{
          padding: "36px 24px",
          maxWidth: "1180px",
          margin: "0 auto",
          boxSizing: "border-box",
        }}
      >
        {children}
      </main>
    </div>
  );
}
