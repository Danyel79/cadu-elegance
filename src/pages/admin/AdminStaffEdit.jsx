import { useState, useEffect, useCallback } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  getUserProfileDocument,
  listServicesCatalog,
  listAllBookings,
  updateUserProfileRoles,
  normalizeRolesSelection,
  rolesSelectionEqual,
  serviceIdsEqual,
} from "../../services/adminDataService";

const ROLE_OPTIONS = [
  { value: "admin", label: "Admin" },
  { value: "profissional", label: "Profissional" },
  { value: "client", label: "Cliente" },
];

function countBookings(bookings, profileId) {
  return bookings.filter((booking) => booking.professionalProfileId === profileId).length;
}

function countUpcomingBookings(bookings, profileId) {
  const today = new Date().toISOString().slice(0, 10);
  return bookings.filter(
    (booking) => booking.professionalProfileId === profileId && booking.dateIso >= today
  ).length;
}

export default function AdminStaffEdit() {
  const { profileId } = useParams();
  const navigate = useNavigate();

  const [doc, setDoc] = useState(null);
  const [servicesCatalog, setServicesCatalog] = useState([]);
  const [roleDraft, setRoleDraft] = useState(["client"]);
  const [servicesDraft, setServicesDraft] = useState([]);
  const [nameDraft, setNameDraft] = useState("");
  const [phoneDraft, setPhoneDraft] = useState("");
  const [bookingMetrics, setBookingMetrics] = useState({ total: 0, upcoming: 0 });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const load = useCallback(async () => {
    if (!profileId) return;
    setLoading(true);
    setError("");

    const [profileRes, svcRes, bookingsRes] = await Promise.all([
      getUserProfileDocument(profileId),
      listServicesCatalog(),
      listAllBookings(),
    ]);

    if (!profileRes.success) {
      setError(profileRes.error || "Perfil não encontrado.");
      setDoc(null);
      setLoading(false);
      return;
    }

    const profile = profileRes.data;
    setDoc(profile);
    setRoleDraft(normalizeRolesSelection(profile.roles));
    setServicesDraft(Array.isArray(profile.services) ? profile.services.map(String) : []);
    setNameDraft(profile.nickName || "");
    setPhoneDraft(profile.phone || "");

    if (svcRes.success) {
      setServicesCatalog(svcRes.data);
    } else {
      setServicesCatalog([]);
    }

    if (bookingsRes.success) {
      setBookingMetrics({
        total: countBookings(bookingsRes.data, profile.$id),
        upcoming: countUpcomingBookings(bookingsRes.data, profile.$id),
      });
    } else {
      setBookingMetrics({ total: 0, upcoming: 0 });
    }

    setLoading(false);
  }, [profileId]);

  useEffect(() => {
    let active = true;
    queueMicrotask(() => {
      if (active) load();
    });
    return () => {
      active = false;
    };
  }, [load]);

  const hasProfissional = roleDraft.includes("profissional");

  const isDirty =
    !!doc &&
    (nameDraft !== (doc.nickName || "") ||
      phoneDraft !== (doc.phone || "") ||
      !rolesSelectionEqual(doc.roles, roleDraft) ||
      (hasProfissional && !serviceIdsEqual(Array.isArray(doc.services) ? doc.services : [], servicesDraft)));

  function toggleRole(value, checked) {
    setRoleDraft((current) => {
      const next = new Set(current.map((r) => String(r).toLowerCase()));
      if (checked) next.add(value);
      else next.delete(value);
      if (next.size === 0) next.add("client");
      return normalizeRolesSelection([...next]);
    });
  }

  function toggleService(serviceId, checked) {
    const id = String(serviceId);
    setServicesDraft((prev) => {
      const set = new Set(prev.map(String));
      if (checked) set.add(id);
      else set.delete(id);
      return [...set];
    });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!doc || !isDirty) return;
    setSaving(true);
    setError("");
    setSuccess("");
    const servicesPayload = hasProfissional ? servicesDraft : [];
    const res = await updateUserProfileRoles(doc.$id, roleDraft, {
      services: servicesPayload,
      nickName: nameDraft,
      phone: phoneDraft,
    });
    setSaving(false);
    if (res.success) {
      setSuccess("Alterações guardadas.");
      await load();
      setTimeout(() => setSuccess(""), 2500);
    } else {
      setError(res.error || "Falha ao guardar.");
    }
  }

  if (loading) {
    return (
      <main className="admin-screen">
        <div className="admin-panel admin-panel-wide">
          <p className="admin-muted">A carregar…</p>
        </div>
      </main>
    );
  }

  if (!doc) {
    return (
      <main className="admin-screen">
        <div className="admin-panel admin-panel-wide">
          <p className="admin-banner admin-banner-error">{error || "Perfil inválido."}</p>
          <nav className="admin-footer-nav">
            <Link to="/admin/staff">← Voltar para a equipe</Link>
          </nav>
        </div>
      </main>
    );
  }

  return (
    <main className="admin-screen">
      <div className="admin-panel admin-panel-wide admin-staff-edit-panel">
        <header className="admin-header">
          <span className="admin-eyebrow">Edit Artisan Profile</span>
          <h1>Master Professional</h1>
          <p className="admin-subtitle">Atualize informações chave do profissional e gerencie seus serviços.</p>
        </header>

        <div className="admin-staff-edit-grid">
          <aside className="admin-staff-summary">
            <div className="admin-profile-card">
              <div className="admin-profile-avatar">
                <span className="material-symbols-outlined">camera_alt</span>
              </div>
              <div>
                <p className="admin-profile-role">Professional</p>
                <h2 className="admin-profile-name">{nameDraft || "Sem nome"}</h2>
                <p className="admin-profile-id">{doc.userId}</p>
              </div>
            </div>

            <div className="admin-profile-metrics">
              <div className="admin-profile-metric-card">
                <span className="admin-profile-metric-label">Agendamentos totais</span>
                <strong>{bookingMetrics.total}</strong>
              </div>
              <div className="admin-profile-metric-card">
                <span className="admin-profile-metric-label">Agendamentos futuros</span>
                <strong>{bookingMetrics.upcoming}</strong>
              </div>
            </div>

            <div className="admin-profile-info-box">
              <div className="admin-profile-info-row">
                <span>Nome</span>
                <strong>{nameDraft || "—"}</strong>
              </div>
              <div className="admin-profile-info-row">
                <span>Telefone</span>
                <strong>{phoneDraft || "—"}</strong>
              </div>
              <div className="admin-profile-info-row">
                <span>Auth ID</span>
                <strong className="admin-mono">{doc.userId}</strong>
              </div>
            </div>
          </aside>

          <section className="admin-staff-editor">
            {error && <p className="admin-banner admin-banner-error">{error}</p>}
            {success && <p className="admin-banner admin-banner-success">{success}</p>}

            <form className="admin-form" onSubmit={handleSubmit}>
              <div className="admin-form-section">
                <div className="admin-form-heading">
                  <h2>Profile Information</h2>
                  <p>Dados essenciais do profissional.</p>
                </div>
                <label>
                  Nome completo
                  <input
                    type="text"
                    className="admin-input"
                    value={nameDraft}
                    onChange={(e) => setNameDraft(e.target.value)}
                  />
                </label>
                <label>
                  Telefone
                  <input
                    type="text"
                    className="admin-input"
                    value={phoneDraft}
                    onChange={(e) => setPhoneDraft(e.target.value)}
                  />
                </label>
                <label>
                  Auth ID / Identificador
                  <input type="text" className="admin-input" value={doc.userId} disabled />
                </label>
              </div>

              <div className="admin-form-section">
                <div className="admin-form-heading">
                  <h2>Access & Permissions</h2>
                  <p>Defina o papel do perfil.</p>
                </div>
                <div className="admin-permissions-grid">
                  {ROLE_OPTIONS.map((opt) => {
                    const selected = normalizeRolesSelection(roleDraft);
                    const checked = selected.includes(opt.value);
                    return (
                      <button
                        key={opt.value}
                        type="button"
                        className={`admin-role-card ${checked ? "admin-role-card--selected" : ""}`}
                        onClick={() => toggleRole(opt.value, !checked)}
                      >
                        <span>{opt.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {hasProfissional && (
                <div className="admin-form-section">
                  <div className="admin-form-heading">
                    <h2>Professional Services</h2>
                    <p>Selecione os serviços que este profissional oferece.</p>
                  </div>
                  <div className="admin-services-grid">
                    {servicesCatalog.length === 0 ? (
                      <p className="admin-muted">
                        Nenhum serviço encontrado. <Link to="/admin/services/new">Criar serviço</Link>
                      </p>
                    ) : (
                      servicesCatalog.map((svc) => {
                        const id = String(svc.$id);
                        const checked = servicesDraft.map(String).includes(id);
                        return (
                          <label key={id} className={`admin-service-card ${checked ? "admin-service-card--selected" : ""}`}>
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={(e) => toggleService(svc.$id, e.target.checked)}
                            />
                            <div>
                              <strong>{svc.name}</strong>
                              <p>{svc.description || "Serviço disponível"}</p>
                            </div>
                            <span>{svc.price != null ? `${Number(svc.price).toFixed(2)} €` : "—"}</span>
                          </label>
                        );
                      })
                    )}
                  </div>
                </div>
              )}

              <div className="admin-form-actions">
                <button type="submit" className="admin-btn-primary" disabled={saving || !isDirty}>
                  {saving ? "A guardar…" : "Guardar alterações"}
                </button>
                <button type="button" className="admin-btn-secondary" onClick={() => navigate("/admin/staff")}>Cancelar</button>
              </div>
            </form>
          </section>
        </div>
      </div>
    </main>
  );
}
