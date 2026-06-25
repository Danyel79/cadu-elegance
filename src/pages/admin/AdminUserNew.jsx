import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import AdminLayout from "./AdminLayout";
import { adminCreateUser } from "../../services/adminDataService";

const ROLES = [
  {
    value: "client",
    label: "Cliente",
    icon: "person",
    desc: "Acesso à área do cliente: agendamentos e loja.",
  },
  {
    value: "profissional",
    label: "Profissional",
    icon: "content_cut",
    desc: "Acesso à agenda, agendamentos e métricas do profissional.",
  },
  {
    value: "admin",
    label: "Administrador",
    icon: "admin_panel_settings",
    desc: "Acesso total ao painel de administração.",
  },
];

const inp = {
  width: "100%",
  padding: "13px 16px",
  borderRadius: "12px",
  border: "1px solid rgba(255,255,255,0.12)",
  background: "rgba(255,255,255,0.05)",
  color: "#f6f2e8",
  fontSize: "14px",
  outline: "none",
  boxSizing: "border-box",
};

const labelText = {
  display: "block",
  color: "#beb7a3",
  fontSize: "12px",
  fontWeight: 600,
  letterSpacing: "0.08em",
  textTransform: "uppercase",
  marginBottom: "8px",
};

export default function AdminUserNew() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    passwordConfirm: "",
    role: "client",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  function set(key, val) {
    setForm((f) => ({ ...f, [key]: val }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!form.name.trim() || !form.email.trim() || !form.password.trim()) {
      setError("Nome, email e senha são obrigatórios.");
      return;
    }
    if (form.password.length < 8) {
      setError("A senha deve ter no mínimo 8 caracteres.");
      return;
    }
    if (form.password !== form.passwordConfirm) {
      setError("As senhas não conferem.");
      return;
    }

    setSubmitting(true);
    const res = await adminCreateUser({
      name: form.name,
      email: form.email,
      password: form.password,
      role: form.role,
    });
    setSubmitting(false);

    if (res.success) {
      setSuccess("Usuário criado com sucesso! Redirecionando…");
      setTimeout(() => navigate("/admin/users"), 1400);
    } else {
      setError(res.error || "Erro ao criar usuário.");
    }
  }

  return (
    <AdminLayout>
      <header className="atelier-admin-header">
        <div className="atelier-admin-header-content">
          <span className="atelier-admin-eyebrow">Gestão de Usuários</span>
          <h1 className="atelier-admin-title">
            Novo <em>Usuário</em>
          </h1>
          <p className="atelier-admin-subtitle">
            Crie uma conta diretamente pelo painel e defina o tipo de acesso.
          </p>
        </div>
      </header>

      <div style={{ maxWidth: "600px" }}>
        {/* Back link */}
        <Link
          to="/admin/users"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            color: "#99907c",
            fontSize: "13px",
            textDecoration: "none",
            marginBottom: "32px",
          }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>arrow_back</span>
          Voltar para usuários
        </Link>

        <form onSubmit={handleSubmit} style={{ display: "grid", gap: "24px" }}>

          {/* Name */}
          <div>
            <label style={labelText} htmlFor="name">Nome completo</label>
            <input
              id="name"
              style={inp}
              type="text"
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
              placeholder="Ex: João Silva"
              autoComplete="off"
              required
            />
          </div>

          {/* Email */}
          <div>
            <label style={labelText} htmlFor="email">Email</label>
            <input
              id="email"
              style={inp}
              type="email"
              value={form.email}
              onChange={(e) => set("email", e.target.value)}
              placeholder="email@exemplo.com"
              autoComplete="off"
              required
            />
          </div>

          {/* Password */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
            <div>
              <label style={labelText} htmlFor="password">Senha</label>
              <input
                id="password"
                style={inp}
                type="password"
                value={form.password}
                onChange={(e) => set("password", e.target.value)}
                placeholder="mín. 8 caracteres"
                autoComplete="new-password"
                required
              />
            </div>
            <div>
              <label style={labelText} htmlFor="passwordConfirm">Confirmar senha</label>
              <input
                id="passwordConfirm"
                style={inp}
                type="password"
                value={form.passwordConfirm}
                onChange={(e) => set("passwordConfirm", e.target.value)}
                placeholder="Repita a senha"
                autoComplete="new-password"
                required
              />
            </div>
          </div>

          {/* Role selection */}
          <div>
            <span style={labelText}>Tipo de conta</span>
            <div style={{ display: "grid", gap: "10px" }}>
              {ROLES.map((r) => {
                const active = form.role === r.value;
                return (
                  <button
                    key={r.value}
                    type="button"
                    onClick={() => set("role", r.value)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "16px",
                      padding: "16px 20px",
                      borderRadius: "14px",
                      border: active
                        ? "1px solid rgba(209,183,107,0.6)"
                        : "1px solid rgba(255,255,255,0.08)",
                      background: active
                        ? "rgba(209,183,107,0.08)"
                        : "rgba(255,255,255,0.03)",
                      cursor: "pointer",
                      textAlign: "left",
                      transition: "all 0.18s ease",
                    }}
                  >
                    {/* Radio indicator */}
                    <div style={{
                      width: "18px",
                      height: "18px",
                      borderRadius: "50%",
                      border: active ? "2px solid #d1b76b" : "2px solid rgba(255,255,255,0.2)",
                      background: active ? "rgba(209,183,107,0.2)" : "transparent",
                      flexShrink: 0,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}>
                      {active && (
                        <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#d1b76b" }} />
                      )}
                    </div>

                    <span
                      className="material-symbols-outlined"
                      style={{ color: active ? "#d1b76b" : "#99907c", fontSize: "22px", flexShrink: 0 }}
                    >
                      {r.icon}
                    </span>

                    <div style={{ flex: 1 }}>
                      <p style={{ margin: 0, color: active ? "#f6f2e8" : "#beb7a3", fontWeight: 600, fontSize: "14px" }}>
                        {r.label}
                      </p>
                      <p style={{ margin: "2px 0 0", color: "#99907c", fontSize: "12px" }}>
                        {r.desc}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Feedback */}
          {error && (
            <div style={{
              padding: "12px 16px",
              borderRadius: "10px",
              background: "rgba(248,113,113,0.1)",
              border: "1px solid rgba(248,113,113,0.3)",
              color: "#f87171",
              fontSize: "14px",
              display: "flex",
              gap: "8px",
              alignItems: "center",
            }}>
              <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>error</span>
              {error}
            </div>
          )}
          {success && (
            <div style={{
              padding: "12px 16px",
              borderRadius: "10px",
              background: "rgba(16,185,129,0.1)",
              border: "1px solid rgba(16,185,129,0.3)",
              color: "#10b981",
              fontSize: "14px",
              display: "flex",
              gap: "8px",
              alignItems: "center",
            }}>
              <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>check_circle</span>
              {success}
            </div>
          )}

          {/* Submit */}
          <div style={{ display: "flex", gap: "12px" }}>
            <button
              type="submit"
              disabled={submitting}
              style={{
                padding: "13px 28px",
                borderRadius: "12px",
                border: "none",
                background: submitting ? "#8a7a3a" : "#d1b76b",
                color: "#0f0e0e",
                fontWeight: 700,
                fontSize: "14px",
                cursor: submitting ? "wait" : "pointer",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              {submitting ? (
                "Criando…"
              ) : (
                <>
                  <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>person_add</span>
                  Criar usuário
                </>
              )}
            </button>
            <button
              type="button"
              onClick={() => navigate("/admin/users")}
              disabled={submitting}
              style={{
                padding: "13px 20px",
                borderRadius: "12px",
                border: "1px solid rgba(255,255,255,0.12)",
                background: "transparent",
                color: "#beb7a3",
                cursor: "pointer",
                fontSize: "14px",
              }}
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
}
