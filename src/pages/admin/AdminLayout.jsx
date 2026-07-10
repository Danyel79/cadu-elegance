import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const navigation = [
  { name: "Análises", href: "/admin/analytics", icon: "insights" },
  { name: "Painel Administrativo", href: "/admin", icon: "dashboard" },
  { name: "Clientes", href: "/admin/users", icon: "group" },
  { name: "Profissionais", href: "/admin/staff", icon: "content_cut" },
  { name: "Serviços", href: "/admin/services/new", icon: "inventory_2" },
  { name: "Loja", href: "/admin/store", icon: "storefront" },
  { name: "Financeiro", href: "/admin/financial", icon: "account_balance" },
  { name: "Institucional", href: "/admin/institutional", icon: "info" },
];

function AdminLayout({ children }) {
  const location = useLocation();

  const navigate = useNavigate();
  const { signOut } = useAuth();

  async function handleLogout() {
    if (!window.confirm("Tem certeza que deseja sair?")) return;
    await signOut();
    navigate("/login", { replace: true });
  }

  return (
    <div className="atelier-admin">
      {/* SideNavBar */}
      <aside className="atelier-admin-sidebar">
        <div className="atelier-admin-sidebar-header">
          <div className="atelier-admin-sidebar-brand">
            <div className="atelier-admin-sidebar-logo">
              <span className="material-symbols-outlined atelier-admin-sidebar-logo-icon">content_cut</span>
            </div>
            <h2 className="atelier-admin-sidebar-title">Cadu Elegance</h2>
          </div>
          <p className="atelier-admin-sidebar-subtitle">Master Admin</p>
        </div>

        <nav className="atelier-admin-sidebar-nav">
          {navigation.map((item) => {
            const isActive = item.href === "/admin"
              ? location.pathname === "/admin"
              : location.pathname === item.href || location.pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.name}
                to={item.href}
                className={`atelier-admin-sidebar-nav-item ${isActive ? 'atelier-admin-sidebar-nav-item--active' : ''}`}
              >
                <span className="material-symbols-outlined atelier-admin-sidebar-nav-icon">{item.icon}</span>
                <span className="atelier-admin-sidebar-nav-text">{item.name}</span>
              </Link>
            );
          })}
        </nav>

        <div className="atelier-admin-sidebar-footer">
          <Link to="/home" className="atelier-admin-sidebar-footer-link">
            <span className="material-symbols-outlined atelier-admin-sidebar-footer-icon">arrow_back</span>
            <span className="atelier-admin-sidebar-footer-text">Voltar</span>
          </Link>
          <button type="button" className="atelier-admin-sidebar-footer-link" onClick={handleLogout}>
            <span className="material-symbols-outlined atelier-admin-sidebar-footer-icon">logout</span>
            <span className="atelier-admin-sidebar-footer-text">Sair</span>
          </button>
        </div>
      </aside>

      {/* Main Canvas */}
      <main className="atelier-admin-main">
        {children}
      </main>
    </div>
  );
}

export default AdminLayout;