import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Home() {
  const { user, signOut } = useAuth();
  const userName = user?.name || user?.email || "Cliente";

  return (
    <main className="atelier-auth atelier-home">
      <div className="atelier-auth-login-bg">
        <div className="atelier-auth-login-bg-gradient" />
        <div className="atelier-auth-login-bg-photo" />
      </div>

      <div className="atelier-home-frame">
        <header className="atelier-home-header">
          <div>
            <p className="atelier-auth-logo atelier-home-logo">Cadu Elegance</p>
          </div>
        </header>

        <section className="atelier-home-hero">
          <h1 className="atelier-home-hero-title">Bem-vindo</h1>
          <p className="atelier-home-hero-copy">
            Venha conhecer a experiência Cadu Elegance.
          </p>
        </section>

        <div className="atelier-home-grid">
          <Link to="/client" className="atelier-home-card">
            <div className="atelier-home-card-top">
              <span className="material-symbols-outlined atelier-home-card-icon">person</span>
              <h2 className="atelier-home-card-title">Área do Cliente</h2>
            </div>
            <p className="atelier-home-card-desc">
              Agende seus serviços e gerencie sua assinatura de concierge exclusiva.
            </p>
          </Link>

          <Link to="/professional" className="atelier-home-card">
            <div className="atelier-home-card-top">
              <span className="material-symbols-outlined atelier-home-card-icon">calendar_month</span>
              <h2 className="atelier-home-card-title">Área do Profissional</h2>
            </div>
            <p className="atelier-home-card-desc">
              Acesse sua agenda de atendimentos, métricas de desempenho e ferramentas de precisão.
            </p>
          </Link>

          <Link to="/admin" className="atelier-home-card">
            <div className="atelier-home-card-top">
              <span className="material-symbols-outlined atelier-home-card-icon">admin_panel_settings</span>
              <h2 className="atelier-home-card-title">Painel de Administração</h2>
            </div>
            <p className="atelier-home-card-desc">
              Gestão estratégica da unidade, controle financeiro e configurações do sistema.
            </p>
          </Link>
        </div>

        <p className="atelier-home-greeting">Olá, {userName}.</p>

        <div className="atelier-home-footer-actions">
          <Link to="/login" className="atelier-home-footer-link">
            ← Voltar
          </Link>
          <button type="button" className="atelier-home-footer-signout" onClick={signOut}>
            Sair
          </button>
        </div>
      </div>
    </main>
  );
}
