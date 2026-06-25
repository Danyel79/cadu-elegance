import { useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useUserProfile } from "../hooks/useUserProfile";

export default function Home() {
  const { user, loading: authLoading, signOut } = useAuth();
  const { isAdmin, isProfessional, loading: profileLoading } = useUserProfile();
  const navigate = useNavigate();

  const areas = [];
  if (isAdmin) {
    areas.push({
      to: "/admin",
      icon: "admin_panel_settings",
      title: "Painel de Administração",
      desc: "Gestão estratégica, controle financeiro e configurações do sistema.",
      tag: "Admin",
    });
  }
  if (isProfessional) {
    areas.push({
      to: "/professional",
      icon: "calendar_month",
      title: "Área do Profissional",
      desc: "Acesse sua agenda, agendamentos e métricas de desempenho.",
      tag: "Profissional",
    });
  }
  areas.push({
    to: "/client",
    icon: "person",
    title: "Área do Cliente",
    desc: "Agende serviços, veja agendamentos e explore a loja.",
    tag: "Cliente",
  });

  // Auto-redirect apenas se a única opção for cliente (sem roles extras)
  useEffect(() => {
    if (authLoading || (user && profileLoading)) return;
    if (!user) {
      navigate("/login", { replace: true });
      return;
    }
    // Se tiver somente acesso de cliente (não admin e não profissional), vai direto
    if (!isAdmin && !isProfessional) {
      navigate("/client", { replace: true });
    }
  }, [user, authLoading, profileLoading, isAdmin, isProfessional, navigate]);

  // Loading
  if (authLoading || (user && profileLoading)) {
    return (
      <main
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh",
          background: "#0f0e0e",
          color: "#e5e2e1",
          flexDirection: "column",
          gap: "16px",
        }}
      >
        <p
          style={{
            color: "#d1b76b",
            fontSize: "14px",
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            margin: 0,
          }}
        >
          Cadu Elegance
        </p>
        <p style={{ color: "#beb7a3", margin: 0, fontSize: "14px" }}>
          Carregando...
        </p>
      </main>
    );
  }

  // Só renderiza seleção se o usuário tiver múltiplas roles
  if (!user || (!isAdmin && !isProfessional)) return null;

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#0f0e0e",
        color: "#f6f2e8",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Top bar */}
      <div
        style={{
          padding: "0 32px",
          height: "60px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          borderBottom: "1px solid rgba(255,255,255,0.05)",
        }}
      >
        <p
          style={{
            margin: 0,
            fontFamily: "'Noto Serif', serif",
            fontWeight: "700",
            fontSize: "15px",
            color: "#d1b76b",
          }}
        >
          Cadu Elegance
        </p>
        <button
          type="button"
          onClick={signOut}
          style={{
            background: "transparent",
            border: "1px solid rgba(255,255,255,0.12)",
            color: "#beb7a3",
            padding: "7px 16px",
            borderRadius: "8px",
            cursor: "pointer",
            fontSize: "13px",
            display: "flex",
            alignItems: "center",
            gap: "6px",
          }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>
            logout
          </span>
          Sair
        </button>
      </div>

      {/* Conteúdo central */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "48px 32px",
        }}
      >
        <p
          style={{
            color: "#d1b76b",
            textTransform: "uppercase",
            letterSpacing: "0.28em",
            fontSize: "11px",
            margin: "0 0 14px",
          }}
        >
          Bem-vindo de volta
        </p>
        <h1
          style={{
            fontFamily: "'Noto Serif', serif",
            fontSize: "clamp(1.8rem, 3vw, 2.6rem)",
            margin: "0 0 10px",
            textAlign: "center",
            color: "#f6f2e8",
          }}
        >
          {user?.name || user?.email}
        </h1>
        <p
          style={{
            color: "#beb7a3",
            fontSize: "15px",
            margin: "0 0 48px",
            textAlign: "center",
          }}
        >
          Com qual perfil deseja entrar?
        </p>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: `repeat(${areas.length}, minmax(240px, 340px))`,
            gap: "20px",
            maxWidth: "1100px",
            width: "100%",
          }}
        >
          {areas.map((area) => (
            <Link
              key={area.to}
              to={area.to}
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "14px",
                padding: "32px",
                borderRadius: "16px",
                border: "1px solid rgba(255,255,255,0.07)",
                background: "#161514",
                textDecoration: "none",
                color: "inherit",
                transition: "all 0.25s ease",
                boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "rgba(209,183,107,0.4)";
                e.currentTarget.style.boxShadow =
                  "0 20px 48px rgba(209,183,107,0.1)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor =
                  "rgba(255,255,255,0.07)";
                e.currentTarget.style.boxShadow =
                  "0 8px 32px rgba(0,0,0,0.3)";
              }}
            >
              <div
                style={{
                  width: "48px",
                  height: "48px",
                  borderRadius: "12px",
                  background: "rgba(209,183,107,0.1)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <span
                  className="material-symbols-outlined"
                  style={{ color: "#d1b76b", fontSize: "24px" }}
                >
                  {area.icon}
                </span>
              </div>
              <div>
                <h2
                  style={{
                    fontFamily: "'Noto Serif', serif",
                    fontSize: "18px",
                    color: "#f6f2e8",
                    margin: "0 0 8px",
                  }}
                >
                  {area.title}
                </h2>
                <p
                  style={{
                    color: "#beb7a3",
                    fontSize: "13px",
                    margin: 0,
                    lineHeight: 1.6,
                  }}
                >
                  {area.desc}
                </p>
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginTop: "auto",
                  paddingTop: "12px",
                }}
              >
                <span
                  style={{
                    fontSize: "10px",
                    color: "#99907c",
                    textTransform: "uppercase",
                    letterSpacing: "0.12em",
                    fontWeight: "600",
                  }}
                >
                  {area.tag}
                </span>
                <span
                  className="material-symbols-outlined"
                  style={{ color: "#d1b76b", fontSize: "20px" }}
                >
                  arrow_forward
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
