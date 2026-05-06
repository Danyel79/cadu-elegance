import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import AdminLayout from "./AdminLayout";
import { listProfessionals, listAllBookings } from "../../services/adminDataService";

function countProfessionalBookings(bookings) {
  return bookings.reduce((acc, booking) => {
    const professionalId = booking.professionalProfileId;
    if (!professionalId) return acc;
    acc[professionalId] = (acc[professionalId] || 0) + 1;
    return acc;
  }, {});
}

function countUpcomingBookings(bookings) {
  const today = new Date().toISOString().slice(0, 10);
  return bookings.reduce((acc, booking) => {
    if (!booking.professionalProfileId || !booking.dateIso) return acc;
    if (booking.dateIso >= today) {
      acc[booking.professionalProfileId] = (acc[booking.professionalProfileId] || 0) + 1;
    }
    return acc;
  }, {});
}

export default function AdminStaff() {
  const [professionals, setProfessionals] = useState([]);
  const [bookingCounts, setBookingCounts] = useState({});
  const [upcomingCounts, setUpcomingCounts] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    const [professionalsRes, bookingsRes] = await Promise.all([
      listProfessionals(),
      listAllBookings(),
    ]);

    if (!professionalsRes.success) {
      setError(professionalsRes.error || "Não foi possível carregar os profissionais.");
      setProfessionals([]);
    } else {
      setProfessionals(professionalsRes.data || []);
    }

    if (!bookingsRes.success) {
      setBookingCounts({});
      setUpcomingCounts({});
    } else {
      setBookingCounts(countProfessionalBookings(bookingsRes.data));
      setUpcomingCounts(countUpcomingBookings(bookingsRes.data));
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    let active = true;
    queueMicrotask(() => {
      if (active) load();
    });
    return () => {
      active = false;
    };
  }, [load]);

  const filteredProfessionals = professionals.filter((profile) => {
    const lowerSearch = searchTerm.toLowerCase();
    return (
      !searchTerm ||
      (profile.nickName && profile.nickName.toLowerCase().includes(lowerSearch)) ||
      (profile.userId && profile.userId.toLowerCase().includes(lowerSearch)) ||
      (profile.phone && profile.phone.toLowerCase().includes(lowerSearch))
    );
  });

  const stats = {
    totalProfessionals: professionals.length,
    offeredServices: professionals.filter((p) => Array.isArray(p.services) && p.services.length > 0).length,
    scheduledBookings: Object.values(bookingCounts).reduce((sum, value) => sum + value, 0),
    upcomingBookings: Object.values(upcomingCounts).reduce((sum, value) => sum + value, 0),
  };

  return (
    <AdminLayout>
      <header className="atelier-admin-header">
        <div className="atelier-admin-header-content">
          <span className="atelier-admin-eyebrow">Gestão de Equipe</span>
          <h1 className="atelier-admin-title">Profissionais Cadastrados</h1>
          <p className="atelier-admin-subtitle">
            Acompanhe a performance do time, consulte agendamentos por profissional e atualize dados com segurança.
          </p>
        </div>
        <div className="atelier-admin-header-actions">
          <div className="atelier-admin-search-group">
            <input
              className="atelier-admin-search-input"
              placeholder="Pesquisar profissionais..."
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <span className="material-symbols-outlined atelier-admin-search-icon">search</span>
          </div>
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

      <div className="atelier-admin-stats">
        <div className="atelier-admin-stat-card">
          <p className="atelier-admin-stat-label">Total de Profissionais</p>
          <h3 className="atelier-admin-stat-value">{stats.totalProfessionals}</h3>
        </div>
        <div className="atelier-admin-stat-card atelier-admin-stat-card--barber">
          <p className="atelier-admin-stat-label">Serviços Cadastrados</p>
          <h3 className="atelier-admin-stat-value">{stats.offeredServices}</h3>
        </div>
        <div className="atelier-admin-stat-card atelier-admin-stat-card--admin">
          <p className="atelier-admin-stat-label">Agendamentos Totais</p>
          <h3 className="atelier-admin-stat-value">{stats.scheduledBookings}</h3>
        </div>
        <div className="atelier-admin-stat-card atelier-admin-stat-card--new">
          <p className="atelier-admin-stat-label">Agendamentos Futuros</p>
          <h3 className="atelier-admin-stat-value">+{stats.upcomingBookings}</h3>
        </div>
      </div>

      {error && (
        <div className="atelier-admin-error" style={{ marginBottom: 32, padding: 20, background: "rgba(255, 180, 171, 0.1)", border: "1px solid rgba(255, 180, 171, 0.2)", borderRadius: 8 }}>
          <p style={{ color: "#ffb4ab", fontSize: 14, margin: 0 }}>{error}</p>
        </div>
      )}

      <div className="atelier-admin-table-container">
        {loading ? (
          <div style={{ padding: 48, textAlign: "center" }}>
            <p style={{ color: "#d0c5af", fontSize: 16, margin: 0 }}>Carregando...</p>
          </div>
        ) : filteredProfessionals.length === 0 ? (
          <div style={{ padding: 48, textAlign: "center" }}>
            <p style={{ color: "#d0c5af", fontSize: 16, margin: 0 }}>Nenhum profissional encontrado.</p>
          </div>
        ) : (
          <table className="atelier-admin-table">
            <thead>
              <tr>
                <th>Identidade</th>
                <th>ID do Usuário</th>
                <th>Desempenho</th>
                <th>Telefone</th>
                <th style={{ textAlign: "right" }}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {filteredProfessionals.map((profile) => {
                const total = bookingCounts[profile.$id] || 0;
                const upcoming = upcomingCounts[profile.$id] || 0;
                return (
                  <tr key={profile.$id}>
                    <td>
                      <div className="atelier-admin-table-identity">
                        <div className="atelier-admin-table-avatar">
                          <span className="material-symbols-outlined" style={{ color: "#64748b", fontSize: 20 }}>person</span>
                        </div>
                        <span className="atelier-admin-table-name">{profile.nickName || "—"}</span>
                      </div>
                    </td>
                    <td>
                      <span style={{ fontFamily: "monospace", fontSize: 12, color: "#d0c5af" }}>{profile.userId}</span>
                    </td>
                    <td>
                      <div className="atelier-admin-performance-cell">
                        <strong>{total} agend.</strong>
                        <span>{upcoming} futuros</span>
                      </div>
                    </td>
                    <td>
                      <span className="atelier-admin-table-last-access">{profile.phone || "—"}</span>
                    </td>
                    <td className="atelier-admin-table-actions">
                      <Link to={`/admin/staff/${profile.$id}/edit`} className="atelier-admin-action-btn">
                        <span className="material-symbols-outlined atelier-admin-action-icon">manage_accounts</span>
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </AdminLayout>
  );
}
