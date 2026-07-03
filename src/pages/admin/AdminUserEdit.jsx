import { useState, useEffect, useCallback } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import AdminLayout from "./AdminLayout";
import {
  getUserProfileDocument,
  listServicesCatalog,
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

export default function AdminUserEdit() {
  const { profileId } = useParams();
  const navigate = useNavigate();

  const [doc, setDoc] = useState(null);
  const [servicesCatalog, setServicesCatalog] = useState([]);
  const [roleDraft, setRoleDraft] = useState(["client"]);
  const [servicesDraft, setServicesDraft] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const load = useCallback(async () => {
    if (!profileId) return;
    setLoading(true);
    setError("");
    const [profileRes, svcRes] = await Promise.all([
      getUserProfileDocument(profileId),
      listServicesCatalog(),
    ]);

    if (!profileRes.success) {
      setError(profileRes.error || "Perfil não encontrado.");
      setDoc(null);
      setLoading(false);
      return;
    }

    setDoc(profileRes.data);
    setRoleDraft(normalizeRolesSelection(profileRes.data.roles));
    setServicesDraft(
      Array.isArray(profileRes.data.services)
        ? profileRes.data.services.map(String)
        : []
    );

    if (svcRes.success) {
      setServicesCatalog(svcRes.data);
    } else {
      setServicesCatalog([]);
    }

    setLoading(false);
  }, [profileId]);

  useEffect(() => {
    let cancelled = false;
    queueMicrotask(() => {
      if (!cancelled) load();
    });
    return () => {
      cancelled = true;
    };
  }, [load]);

  const hasProfissional = roleDraft.includes("profissional");

  const isDirty =
    !!doc &&
    (!rolesSelectionEqual(doc.roles, roleDraft) ||
      (hasProfissional &&
        !serviceIdsEqual(Array.isArray(doc.services) ? doc.services : [], servicesDraft)));

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
      <AdminLayout>
        <div className="admin-staff-edit-panel">
          <p className="admin-muted">A carregar…</p>
        </div>
      </AdminLayout>
    );
  }

  if (!doc) {
    return (
      <AdminLayout>
        <div className="admin-staff-edit-panel">
          <p className="admin-banner admin-banner-error">{error || "Perfil inválido."}</p>
          <nav className="admin-footer-nav">
            <Link to="/admin/users">← Lista de utilizadores</Link>
          </nav>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div style={{ marginBottom: "24px" }}>
        <Link to="/admin/users" style={{ color: "#d1b76b", textDecoration: "none", fontWeight: "600" }}>
          ← Lista de utilizadores
        </Link>
      </div>

      <div className="admin-staff-edit-panel">
        <header className="admin-header">
          <h1>Editar utilizador</h1>
          <p className="admin-subtitle">Permissões e serviços do profissional</p>
        </header>

        <section className="admin-user-readonly" aria-label="Dados do perfil">
          <div className="admin-user-field">
            <span className="admin-user-label">Nome / alcunha</span>
            <span>{doc.nickName || "—"}</span>
          </div>
          <div className="admin-user-field">
            <span className="admin-user-label">ID utilizador (Auth)</span>
            <span className="admin-mono">{doc.userId}</span>
          </div>
          <div className="admin-user-field">
            <span className="admin-user-label">Telefone</span>
            <span>{doc.phone || "—"}</span>
          </div>
        </section>

        <form className="admin-user-edit-form" onSubmit={handleSubmit}>
          <fieldset className="admin-fieldset">
            <legend>Permissões</legend>
            <div className="admin-role-fieldset admin-role-fieldset-row">
              {ROLE_OPTIONS.map((opt) => {
                const selected = normalizeRolesSelection(roleDraft);
                const checked = selected.includes(opt.value);
                return (
                  <label key={opt.value} className="admin-role-check">
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={(e) => toggleRole(opt.value, e.target.checked)}
                    />
                    <span>{opt.label}</span>
                  </label>
                );
              })}
            </div>
          </fieldset>

          {hasProfissional && (
            <fieldset className="admin-fieldset">
              <legend>Serviços que este profissional realiza</legend>
              {servicesCatalog.length === 0 ? (
                <p className="admin-muted">
                  Nenhum serviço na base de dados.{" "}
                  <Link to="/admin/services/new" style={{ color: "#d1b76b" }}>Criar serviço</Link>
                </p>
              ) : (
                <ul className="admin-services-pick-list">
                  {servicesCatalog.map((svc) => {
                    const id = String(svc.$id);
                    const checked = servicesDraft.map(String).includes(id);
                    return (
                      <li key={id}>
                        <label className="admin-role-check">
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={(e) => toggleService(svc.$id, e.target.checked)}
                          />
                          <span>
                            <strong>{svc.name}</strong>
                            {svc.price != null && (
                              <span className="admin-svc-price">
                                {" "}
                                — {Number(svc.price).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                              </span>
                            )}
                          </span>
                        </label>
                      </li>
                    );
                  })}
                </ul>
              )}
            </fieldset>
          )}

          {error && <p className="admin-banner admin-banner-error">{error}</p>}
          {success && <p className="admin-banner admin-banner-success">{success}</p>}

          <div className="admin-form-actions">
            <button type="submit" className="admin-btn-primary" disabled={saving || !isDirty}>
              {saving ? "A guardar…" : "Guardar alterações"}
            </button>
            <button
              type="button"
              className="admin-btn-secondary"
              onClick={() => navigate("/admin/users")}
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
}
