import { useState, useEffect } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { confirmPasswordRecovery } from "../context/authService";

const LOGIN_BG =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuBqOwE08MCgq-xekfOc-gIfbZ31tiORjGl4hvGHSkXrh1njETLXXe5ZU3_RsIZBZPYBD1vPi4Il9SfcvU5lZzu71kfz5E-w4Nm6lBn8IeIu3Ohs-3OKxclfBgd_zVAD5Y9TZUejvM7ehb2y4SvgrJSPydcYohgvnAqndUzqqVjlDNbVXTmUyQrJoM3aHnk-sy0MYt8KTK_M_HJhlFWcqZxY39-y-0mBNxB8r2LSrDUVdjXoDaSrdX7t5n-PISPPGGiRDuEMA9rfGuM";

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const userId = searchParams.get("userId");
  const secret = searchParams.get("secret");

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  // Parâmetros ausentes = link inválido
  const invalidLink = !userId || !secret;

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (password.length < 8) {
      setError("A senha deve ter pelo menos 8 caracteres.");
      return;
    }
    if (password !== confirm) {
      setError("As senhas não coincidem.");
      return;
    }

    setLoading(true);
    const result = await confirmPasswordRecovery(userId, secret, password);
    setLoading(false);

    if (result.success) {
      setDone(true);
      setTimeout(() => navigate("/login", { replace: true }), 3000);
    } else {
      setError(result.error || "Erro ao redefinir a senha.");
    }
  }

  return (
    <div className="atelier-auth atelier-auth--login">
      <div className="atelier-auth-login-bg" aria-hidden="true">
        <div
          className="atelier-auth-login-bg-photo"
          style={{ backgroundImage: `url(${LOGIN_BG})` }}
        />
        <div className="atelier-auth-login-bg-gradient" />
      </div>

      <main className="atelier-auth-login-main">
        <header className="atelier-auth-brand">
          <h1 className="atelier-auth-logo">Cadu Ellegance</h1>
          <p className="atelier-auth-tagline">Barbearia &amp; elegância em um só lugar</p>
        </header>

        <div className="atelier-auth-card">

          {invalidLink && (
            <>
              <div className="atelier-auth-card-head">
                <span className="atelier-auth-eyebrow">Link inválido</span>
                <h2 className="atelier-auth-title">Link expirado</h2>
              </div>
              <div style={{ padding: "8px 0 16px", display: "grid", gap: "16px" }}>
                <p style={{ color: "#beb7a3", fontSize: "13px", lineHeight: 1.65, margin: 0 }}>
                  Este link de recuperação é inválido ou expirou. Solicite um novo link na tela de login.
                </p>
                <Link to="/login" className="atelier-auth-btn-gold" style={{ textAlign: "center", display: "flex", justifyContent: "center", gap: "8px" }}>
                  Ir para o login
                  <span className="material-symbols-outlined atelier-auth-btn-icon" aria-hidden>arrow_forward</span>
                </Link>
              </div>
            </>
          )}

          {!invalidLink && !done && (
            <>
              <div className="atelier-auth-card-head">
                <span className="atelier-auth-eyebrow">Nova senha</span>
                <h2 className="atelier-auth-title">Redefinir senha</h2>
                <p style={{ color: "#beb7a3", fontSize: "13px", marginTop: "8px", lineHeight: 1.6 }}>
                  Escolha uma nova senha com pelo menos 8 caracteres.
                </p>
              </div>

              <form className="atelier-auth-form" onSubmit={handleSubmit}>
                <div className="atelier-auth-stack">
                  <div className="atelier-auth-field-group">
                    <label className="atelier-auth-label" htmlFor="new-password">Nova senha</label>
                    <input
                      id="new-password"
                      className="atelier-auth-input-line"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Mínimo 8 caracteres"
                      autoComplete="new-password"
                      required
                      autoFocus
                    />
                  </div>

                  <div className="atelier-auth-field-group">
                    <label className="atelier-auth-label" htmlFor="confirm-password">Confirmar senha</label>
                    <input
                      id="confirm-password"
                      className="atelier-auth-input-line"
                      type="password"
                      value={confirm}
                      onChange={(e) => setConfirm(e.target.value)}
                      placeholder="Repita a nova senha"
                      autoComplete="new-password"
                      required
                    />
                  </div>
                </div>

                <button type="submit" className="atelier-auth-btn-gold" disabled={loading}>
                  {loading ? "Salvando…" : "Salvar nova senha"}
                  {!loading && (
                    <span className="material-symbols-outlined atelier-auth-btn-icon" aria-hidden>
                      lock_reset
                    </span>
                  )}
                </button>

                {error && <p className="atelier-auth-alert atelier-auth-alert--error">{error}</p>}
              </form>
            </>
          )}

          {done && (
            <>
              <div className="atelier-auth-card-head">
                <span className="atelier-auth-eyebrow">Tudo certo</span>
                <h2 className="atelier-auth-title">Senha redefinida!</h2>
              </div>
              <div style={{ padding: "8px 0 16px", display: "grid", gap: "16px" }}>
                <div style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "14px",
                  padding: "16px",
                  borderRadius: "10px",
                  background: "rgba(16,185,129,0.08)",
                  border: "1px solid rgba(16,185,129,0.25)",
                }}>
                  <span className="material-symbols-outlined" style={{ color: "#10b981", fontSize: "28px", flexShrink: 0 }}>
                    check_circle
                  </span>
                  <p style={{ margin: 0, color: "#beb7a3", fontSize: "13px", lineHeight: 1.65 }}>
                    Sua senha foi alterada com sucesso. Redirecionando para o login…
                  </p>
                </div>
              </div>
            </>
          )}

        </div>

        <footer className="atelier-auth-login-footer">
          <p className="atelier-auth-switch">
            Lembrou a senha?{" "}
            <Link className="atelier-auth-link" to="/login">
              Fazer login
            </Link>
          </p>
        </footer>
      </main>

      <aside className="atelier-auth-floating-quote" aria-hidden="true">
        <span className="atelier-auth-floating-rule" />
        <span className="atelier-auth-floating-text">A arte do cuidado masculino</span>
      </aside>
    </div>
  );
}
