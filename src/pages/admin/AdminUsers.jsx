import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { listUserProfiles, normalizeRolesSelection } from "../../services/adminDataService";

const ROLE_LABELS = { admin: "Admin", profissional: "Profissional", client: "Cliente" };

function formatRolesDisplay(roles) {
  return normalizeRolesSelection(roles)
    .map((r) => ROLE_LABELS[r] || r)
    .join(", ");
}

export default function AdminUsers() {
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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

  return (
    <main className="admin-screen">
      <div className="admin-panel admin-panel-wide">
        <header className="admin-header">
          <h1>Utilizadores</h1>
          <p className="admin-subtitle">Lista de perfis</p>
        </header>

        {error && <p className="admin-banner admin-banner-error">{error}</p>}

        {loading ? (
          <p className="admin-muted">A carregar…</p>
        ) : profiles.length === 0 ? (
          <p className="admin-muted">Nenhum perfil encontrado.</p>
        ) : (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Nome / alcunha</th>
                  <th>ID utilizador</th>
                  <th>Telefone</th>
                  <th>Permissões</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {profiles.map((doc) => (
                  <tr key={doc.$id}>
                    <td>{doc.nickName || "—"}</td>
                    <td className="admin-mono">{doc.userId}</td>
                    <td>{doc.phone || "—"}</td>
                    <td>{formatRolesDisplay(doc.roles)}</td>
                    <td>
                      <Link
                        className="admin-btn-secondary admin-btn-link"
                        to={`/admin/users/${doc.$id}/edit`}
                      >
                        Editar
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <nav className="admin-footer-nav">
          <Link to="/admin">← Painel admin</Link>
        </nav>
      </div>
    </main>
  );
}
