import { Link } from "react-router-dom";

export default function AdminDashboard() {
  return (
    <main className="admin-screen">
      <div className="admin-panel">
        <header className="admin-header">
          <h1>Administração</h1>
          <p className="admin-subtitle">Gestão da barbearia</p>
        </header>

        <div className="admin-cards">
          <Link className="admin-card" to="/admin/users">
            <span className="admin-card-title">Utilizadores</span>
            <span className="admin-card-desc">Listar perfis e editar permissões</span>
          </Link>
          <Link className="admin-card" to="/admin/services/new">
            <span className="admin-card-title">Adicionar serviço</span>
            <span className="admin-card-desc">Nome, descrição e preço</span>
          </Link>
        </div>

        <nav className="admin-footer-nav">
          <Link to="/home">← Voltar ao início</Link>
        </nav>
      </div>
    </main>
  );
}
