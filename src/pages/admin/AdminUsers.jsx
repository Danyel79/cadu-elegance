import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import AdminLayout from "./AdminLayout";
import {
  listUserProfiles,
  normalizeRolesSelection,
  deleteUserProfileDocument,
} from "../../services/adminDataService";

const ROLE_LABELS = { admin: "Admin", profissional: "Barber", client: "Client" };

function formatRolesDisplay(roles) {
  return normalizeRolesSelection(roles)
    .map((r) => ROLE_LABELS[r] || r)
    .join(", ");
}

function getRoleBadgeClass(role) {
  switch (role.toLowerCase()) {
    case 'admin':
      return 'atelier-admin-role-badge--admin';
    case 'barber':
    case 'profissional':
      return 'atelier-admin-role-badge--barber';
    case 'client':
      return 'atelier-admin-role-badge--client';
    default:
      return 'atelier-admin-role-badge--client';
  }
}

export default function AdminUsers() {
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [deletingId, setDeletingId] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    const res = await listUserProfiles();
    if (res.success) {
      setProfiles(res.data);
    } else {
      setError(res.error || "Não foi possível carregar a lista.");
      setProfiles(res.data || []);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    let cancelled = false;
    queueMicrotask(() => {
      if (!cancelled) load();
    });
    return () => {
      cancelled = true;
    };
  }, [load]);

  async function handleDelete(profile) {
    const confirmed = window.confirm(
      `Tem certeza que deseja excluir o cliente "${profile.nickName || profile.userId}"? Esta ação não pode ser desfeita.`
    );
    if (!confirmed) return;
    setDeletingId(profile.$id);
    const res = await deleteUserProfileDocument(profile.$id);
    setDeletingId(null);
    if (res.success) {
      setProfiles((prev) => prev.filter((p) => p.$id !== profile.$id));
    } else {
      setError(res.error || "Não foi possível excluir o usuário.");
    }
  }

  const filteredProfiles = profiles.filter(profile => {
    const matchesSearch = !searchTerm ||
      (profile.nickName && profile.nickName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (profile.userId && profile.userId.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesRole = !roleFilter || profile.roles?.includes(roleFilter);

    return matchesSearch && matchesRole;
  });

  const stats = {
    totalMembers: profiles.length,
    activeBarbers: profiles.filter(p => p.roles?.includes('profissional')).length,
    administrators: profiles.filter(p => p.roles?.includes('admin')).length,
    newThisWeek: profiles.filter(p => {
      // Simple logic: consider profiles created in last 7 days as "new this week"
      // In a real app, you'd check creation date
      return Math.random() > 0.8; // Placeholder
    }).length
  };

  return (
    <AdminLayout>
      {/* Header Section */}
      <header className="atelier-admin-header">
        <div className="atelier-admin-header-content">
          <span className="atelier-admin-eyebrow">Gestão de Cadastro</span>
          <h1 className="atelier-admin-title">Lista de <em>Clientes</em></h1>
          <p className="atelier-admin-subtitle">Supervisione o círculo exclusivo da Cadu Elegance. Gerencie permissões e monitore o engajamento com precisão.</p>
        </div>
        <div className="atelier-admin-header-actions">
          <div className="atelier-admin-search-group">
            <input
              className="atelier-admin-search-input"
              placeholder="Pesquisar usuários..."
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <span className="material-symbols-outlined atelier-admin-search-icon">search</span>
          </div>
          <select
            className="atelier-admin-filter-btn"
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
          >
            <option value="">Todos os Papéis</option>
            <option value="admin">Admin</option>
            <option value="profissional">Barbeiro</option>
            <option value="client">Cliente</option>
          </select>
        </div>
      </header>

      <div style={{ marginBottom: '24px' }}>
        <Link
          to="/admin"
          style={{
            color: '#d1b76b',
            textDecoration: 'none',
            fontWeight: '600',
          }}
        >
          ← Voltar para painel admin
        </Link>
      </div>

      {/* Bento Stats Grid */}
      <div className="atelier-admin-stats">
        <div className="atelier-admin-stat-card">
          <p className="atelier-admin-stat-label">Total de Membros</p>
          <h3 className="atelier-admin-stat-value">{stats.totalMembers}</h3>
        </div>
        <div className="atelier-admin-stat-card atelier-admin-stat-card--barber">
          <p className="atelier-admin-stat-label">Barbeiros Ativos</p>
          <h3 className="atelier-admin-stat-value">{stats.activeBarbers}</h3>
        </div>
        <div className="atelier-admin-stat-card atelier-admin-stat-card--admin">
          <p className="atelier-admin-stat-label">Administradores</p>
          <h3 className="atelier-admin-stat-value">{stats.administrators}</h3>
        </div>
        <div className="atelier-admin-stat-card atelier-admin-stat-card--new">
          <p className="atelier-admin-stat-label">Novos Esta Semana</p>
          <h3 className="atelier-admin-stat-value">+{stats.newThisWeek}</h3>
        </div>
      </div>

      {error && (
        <div className="atelier-admin-error" style={{
          marginBottom: '32px',
          padding: '16px 20px',
          background: 'rgba(255, 180, 171, 0.1)',
          border: '1px solid rgba(255, 180, 171, 0.2)',
          borderRadius: '8px'
        }}>
          <p style={{ color: '#ffb4ab', fontSize: '14px', margin: 0 }}>{error}</p>
        </div>
      )}

      {/* Data Table Container */}
      <div className="atelier-admin-table-container">
        {loading ? (
          <div style={{ padding: '48px', textAlign: 'center' }}>
            <p style={{ color: '#d0c5af', fontSize: '16px', margin: 0 }}>Carregando...</p>
          </div>
        ) : filteredProfiles.length === 0 ? (
          <div style={{ padding: '48px', textAlign: 'center' }}>
            <p style={{ color: '#d0c5af', fontSize: '16px', margin: 0 }}>Nenhum usuário encontrado.</p>
          </div>
        ) : (
          <table className="atelier-admin-table">
            <thead>
              <tr>
                <th>Identidade</th>
                <th>ID do Usuário</th>
                <th>Nível de Acesso</th>
                <th>Telefone</th>
                <th style={{ textAlign: 'right' }}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {filteredProfiles.map((profile) => (
                <tr key={profile.$id}>
                  <td>
                    <div className="atelier-admin-table-identity">
                      <div className="atelier-admin-table-avatar">
                        <span className="material-symbols-outlined" style={{ color: '#64748b', fontSize: '20px' }}>person</span>
                      </div>
                      <span className="atelier-admin-table-name">{profile.nickName || "—"}</span>
                    </div>
                  </td>
                  <td>
                    <span style={{ fontFamily: 'monospace', fontSize: '12px', color: '#d0c5af' }}>{profile.userId}</span>
                  </td>
                  <td>
                    <span className={`atelier-admin-role-badge ${getRoleBadgeClass(profile.roles?.[0] || 'client')}`}>
                      {formatRolesDisplay(profile.roles) || 'Client'}
                    </span>
                  </td>
                  <td>
                    <span className="atelier-admin-table-last-access">{profile.phone || "—"}</span>
                  </td>
                  <td className="atelier-admin-table-actions">
                    <Link
                      to={`/admin/users/${profile.$id}/edit`}
                      className="atelier-admin-action-btn"
                    >
                      <span className="material-symbols-outlined atelier-admin-action-icon">edit</span>
                    </Link>
                    <button
                      type="button"
                      className="atelier-admin-action-btn"
                      style={{ marginLeft: 8 }}
                      onClick={() => handleDelete(profile)}
                      disabled={deletingId === profile.$id}
                      title="Excluir usuário"
                    >
                      <span className="material-symbols-outlined atelier-admin-action-icon" style={{ color: "#ffb4ab" }}>
                        {deletingId === profile.$id ? "hourglass_empty" : "delete"}
                      </span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {/* Pagination Overlay */}
        {!loading && filteredProfiles.length > 0 && (
          <div className="atelier-admin-pagination">
            <p className="atelier-admin-pagination-info">
              Mostrando 1 a {filteredProfiles.length} de {profiles.length} membros
            </p>
            <div className="atelier-admin-pagination-controls">
              <button className="atelier-admin-pagination-btn">
                <span className="material-symbols-outlined">chevron_left</span>
              </button>
              <button className="atelier-admin-pagination-current">1</button>
              <button className="atelier-admin-pagination-page">2</button>
              <button className="atelier-admin-pagination-page">3</button>
              <button className="atelier-admin-pagination-btn">
                <span className="material-symbols-outlined">chevron_right</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Luxury Aesthetic Note */}
      <div className="atelier-admin-quote">
        <p className="atelier-admin-quote-text">
          "O verdadeiro luxo é sentido nos detalhes invisíveis, a organização silenciosa da arte de um mestre."
        </p>
      </div>

      {/* Contextual FAB */}
      <Link
        to="/admin/users/new"
        className="atelier-admin-fab"
      >
        <span className="material-symbols-outlined atelier-admin-fab-icon">person_add</span>
      </Link>
    </AdminLayout>
  );
}
