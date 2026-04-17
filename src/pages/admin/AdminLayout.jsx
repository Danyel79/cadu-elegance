import { Link, useLocation } from "react-router-dom";

const navigation = [
  { name: "Lista de Clientes", href: "/admin/users", icon: "group", current: true },
  { name: "Gestão de Equipe", href: "/admin/staff", icon: "content_cut", current: false },
  { name: "Inventário", href: "/admin/inventory", icon: "inventory_2", current: false },
  { name: "Análises", href: "/admin/analytics", icon: "insights", current: false },
  { name: "Arquivo", href: "/admin/archive", icon: "history", current: false },
];

function AdminLayout({ children }) {
  const location = useLocation();

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
            const isActive = location.pathname === item.href;
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

        <div className="atelier-admin-sidebar-actions">
          <button className="atelier-admin-btn-primary atelier-admin-btn-full">
            Quick Consultation
          </button>
        </div>

        <div className="atelier-admin-sidebar-footer">
          <a className="atelier-admin-sidebar-footer-link" href="#">
            <span className="material-symbols-outlined atelier-admin-sidebar-footer-icon">help</span>
            <span className="atelier-admin-sidebar-footer-text">Support</span>
          </a>
          <a className="atelier-admin-sidebar-footer-link" href="#">
            <span className="material-symbols-outlined atelier-admin-sidebar-footer-icon">logout</span>
            <span className="atelier-admin-sidebar-footer-text">Log Out</span>
          </a>
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