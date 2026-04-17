import { Link } from "react-router-dom";
import AdminLayout from "./AdminLayout";

export default function AdminDashboard() {
  return (
    <AdminLayout>
      {/* Header Section */}
      <header className="atelier-admin-header">
        <div className="atelier-admin-header-content">
          <span className="atelier-admin-eyebrow">Controle Mestre</span>
          <h1 className="atelier-admin-title">Painel <em>Administrativo</em></h1>
          <p className="atelier-admin-subtitle">Comande o reino digital da barbearia. Supervisione operações, gerencie equipe e garanta excelência em cada detalhe.</p>
        </div>
      </header>

      {/* Quick Actions Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '24px',
        marginBottom: '48px'
      }}>
        <Link
          to="/admin/users"
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
            padding: '32px',
            borderRadius: '12px',
            border: '1px solid rgba(255, 255, 255, 0.05)',
            background: '#1c1b1b',
            textDecoration: 'none',
            color: 'inherit',
            transition: 'all 0.3s ease',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)'
          }}
          onMouseEnter={(e) => {
            e.target.style.borderColor = 'rgba(242, 202, 80, 0.3)';
            e.target.style.boxShadow = '0 16px 48px rgba(242, 202, 80, 0.1)';
          }}
          onMouseLeave={(e) => {
            e.target.style.borderColor = 'rgba(255, 255, 255, 0.05)';
            e.target.style.boxShadow = '0 8px 32px rgba(0, 0, 0, 0.3)';
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              background: 'rgba(242, 202, 80, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <span className="material-symbols-outlined" style={{ color: '#f2ca50', fontSize: '24px' }}>group</span>
            </div>
            <div>
              <h3 style={{
                fontFamily: "'Noto Serif', serif",
                fontSize: '20px',
                color: '#e5e2e1',
                margin: '0 0 4px',
                transition: 'color 0.3s ease'
              }}>Gestão de Clientes</h3>
              <p style={{ color: '#d0c5af', fontSize: '14px', margin: 0 }}>Gerencie perfis de usuários e permissões</p>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{
              fontSize: '12px',
              fontWeight: '600',
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              color: '#99907c'
            }}>Registro</span>
            <span className="material-symbols-outlined" style={{ color: '#99907c', transition: 'color 0.3s ease' }}>arrow_forward</span>
          </div>
        </Link>

        <Link
          to="/admin/services/new"
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
            padding: '32px',
            borderRadius: '12px',
            border: '1px solid rgba(255, 255, 255, 0.05)',
            background: '#1c1b1b',
            textDecoration: 'none',
            color: 'inherit',
            transition: 'all 0.3s ease',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)'
          }}
          onMouseEnter={(e) => {
            e.target.style.borderColor = 'rgba(242, 202, 80, 0.3)';
            e.target.style.boxShadow = '0 16px 48px rgba(242, 202, 80, 0.1)';
          }}
          onMouseLeave={(e) => {
            e.target.style.borderColor = 'rgba(255, 255, 255, 0.05)';
            e.target.style.boxShadow = '0 8px 32px rgba(0, 0, 0, 0.3)';
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              background: 'rgba(242, 202, 80, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <span className="material-symbols-outlined" style={{ color: '#f2ca50', fontSize: '24px' }}>content_cut</span>
            </div>
            <div>
              <h3 style={{
                fontFamily: "'Noto Serif', serif",
                fontSize: '20px',
                color: '#e5e2e1',
                margin: '0 0 4px',
                transition: 'color 0.3s ease'
              }}>Configuração de Serviços</h3>
              <p style={{ color: '#d0c5af', fontSize: '14px', margin: 0 }}>Adicione e gerencie serviços de barbearia</p>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{
              fontSize: '12px',
              fontWeight: '600',
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              color: '#99907c'
            }}>Serviços</span>
            <span className="material-symbols-outlined" style={{ color: '#99907c', transition: 'color 0.3s ease' }}>arrow_forward</span>
          </div>
        </Link>

        <Link
          to="/admin/analytics"
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
            padding: '32px',
            borderRadius: '12px',
            border: '1px solid rgba(255, 255, 255, 0.05)',
            background: '#1c1b1b',
            textDecoration: 'none',
            color: 'inherit',
            transition: 'all 0.3s ease',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)'
          }}
          onMouseEnter={(e) => {
            e.target.style.borderColor = 'rgba(242, 202, 80, 0.3)';
            e.target.style.boxShadow = '0 16px 48px rgba(242, 202, 80, 0.1)';
          }}
          onMouseLeave={(e) => {
            e.target.style.borderColor = 'rgba(255, 255, 255, 0.05)';
            e.target.style.boxShadow = '0 8px 32px rgba(0, 0, 0, 0.3)';
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              background: 'rgba(242, 202, 80, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <span className="material-symbols-outlined" style={{ color: '#f2ca50', fontSize: '24px' }}>insights</span>
            </div>
            <div>
              <h3 style={{
                fontFamily: "'Noto Serif', serif",
                fontSize: '20px',
                color: '#e5e2e1',
                margin: '0 0 4px',
                transition: 'color 0.3s ease'
              }}>Análises e Insights</h3>
              <p style={{ color: '#d0c5af', fontSize: '14px', margin: 0 }}>Acompanhe performance e tendências</p>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{
              fontSize: '12px',
              fontWeight: '600',
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              color: '#99907c'
            }}>Relatórios</span>
            <span className="material-symbols-outlined" style={{ color: '#99907c', transition: 'color 0.3s ease' }}>arrow_forward</span>
          </div>
        </Link>
      </div>

      {/* System Status */}
      <div style={{
        background: '#1c1b1b',
        borderRadius: '12px',
        padding: '32px',
        border: '1px solid rgba(255, 255, 255, 0.05)'
      }}>
        <h3 style={{
          fontFamily: "'Noto Serif', serif",
          fontSize: '24px',
          color: '#e5e2e1',
          margin: '0 0 24px'
        }}>Status do Sistema</h3>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '24px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{
              width: '12px',
              height: '12px',
              borderRadius: '50%',
              background: '#10b981'
            }}></div>
            <div>
              <p style={{
                color: '#e5e2e1',
                fontWeight: '700',
                fontSize: '14px',
                margin: '0 0 4px'
              }}>Servidor Appwrite</p>
              <p style={{
                color: '#d0c5af',
                fontSize: '12px',
                margin: 0
              }}>Operacional</p>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{
              width: '12px',
              height: '12px',
              borderRadius: '50%',
              background: '#10b981'
            }}></div>
            <div>
              <p style={{
                color: '#e5e2e1',
                fontWeight: '700',
                fontSize: '14px',
                margin: '0 0 4px'
              }}>Banco de Dados</p>
              <p style={{
                color: '#d0c5af',
                fontSize: '12px',
                margin: 0
              }}>Todos os sistemas normais</p>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{
              width: '12px',
              height: '12px',
              borderRadius: '50%',
              background: '#f59e0b'
            }}></div>
            <div>
              <p style={{
                color: '#e5e2e1',
                fontWeight: '700',
                fontSize: '14px',
                margin: '0 0 4px'
              }}>Backups</p>
              <p style={{
                color: '#d0c5af',
                fontSize: '12px',
                margin: 0
              }}>Último: 2 horas atrás</p>
            </div>
          </div>
        </div>
      </div>

      {/* Luxury Aesthetic Note */}
      <div className="atelier-admin-quote">
        <p className="atelier-admin-quote-text">
          "No mundo do luxo, a perfeição não é um objetivo, mas um padrão."
        </p>
      </div>
    </AdminLayout>
  );
}
