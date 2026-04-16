import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const LOGIN_BG =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuBqOwE08MCgq-xekfOc-gIfbZ31tiORjGl4hvGHSkXrh1njETLXXe5ZU3_RsIZBZPYBD1vPi4Il9SfcvU5lZzu71kfz5E-w4Nm6lBn8IeIu3Ohs-3OKxclfBgd_zVAD5Y9TZUejvM7ehb2y4SvgrJSPydcYohgvnAqndUzqqVjlDNbVXTmUyQrJoM3aHnk-sy0MYt8KTK_M_HJhlFWcqZxY39-y-0mBNxB8r2LSrDUVdjXoDaSrdX7t5n-PISPPGGiRDuEMA9rfGuM";

function Login() {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [error, setError] = useState("");
  const [hint, setHint] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const { user, signIn } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate("/home", { replace: true });
    }
  }, [user, navigate]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setHint("");
    setSuccess("");

    if (!email.trim() || !senha.trim()) {
      setError("Preencha email e senha.");
      return;
    }

    setLoading(true);

    const result = await signIn(email.trim(), senha.trim());

    setLoading(false);

    if (result.success) {
      setSuccess("Login efetuado com sucesso!");
      setError("");
    } else {
      setError(result.error || "Erro ao autenticar.");
      setSuccess("");
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
          <p className="atelier-auth-tagline">Barbearia e grooming</p>
        </header>

        <div className="atelier-auth-card">
          <div className="atelier-auth-card-head">
            <span className="atelier-auth-eyebrow">Bem-vindo de volta</span>
            <h2 className="atelier-auth-title">Acesso de cliente</h2>
          </div>

          <form className="atelier-auth-form" onSubmit={handleSubmit}>
            <div className="atelier-auth-stack">
              <div className="atelier-auth-field-group">
                <label className="atelier-auth-label" htmlFor="email">
                  Email
                </label>
                <input
                  id="email"
                  className="atelier-auth-input-line"
                  type="email"
                  value={email}
                  onChange={(ev) => setEmail(ev.target.value)}
                  placeholder="seu@email.com"
                  autoComplete="email"
                  required
                />
              </div>

              <div className="atelier-auth-field-group">
                <div className="atelier-auth-label-row">
                  <label className="atelier-auth-label" htmlFor="senha">
                    Senha
                  </label>
                  <button
                    type="button"
                    className="atelier-auth-text-btn"
                    onClick={() => {
                      setHint("Recuperação de senha em breve.");
                      setError("");
                    }}
                  >
                    Esqueceu?
                  </button>
                </div>
                <input
                  id="senha"
                  className="atelier-auth-input-line"
                  type="password"
                  value={senha}
                  onChange={(ev) => setSenha(ev.target.value)}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="atelier-auth-btn-gold"
              disabled={loading}
            >
              {loading ? "Aguarde…" : "Entrar na Cadu Ellegance"}
              {!loading && (
                <span className="material-symbols-outlined atelier-auth-btn-icon" aria-hidden>
                  arrow_forward
                </span>
              )}
            </button>

            {error && <p className="atelier-auth-alert atelier-auth-alert--error">{error}</p>}
            {hint && !error && (
              <p className="atelier-auth-alert atelier-auth-alert--hint">{hint}</p>
            )}
            {success && (
              <p className="atelier-auth-alert atelier-auth-alert--success">{success}</p>
            )}
          </form>

          <div className="atelier-auth-divider" aria-hidden="true">
            <span className="atelier-auth-divider-line" />
            <span className="atelier-auth-divider-label">Acesso seguro</span>
            <span className="atelier-auth-divider-line" />
          </div>

          <div className="atelier-auth-social-row">
            <button
              type="button"
              className="atelier-auth-social-btn"
              disabled
              title="Em breve"
            >
              <span className="material-symbols-outlined" aria-hidden>
                google
              </span>
              <span>Google</span>
            </button>
            <button
              type="button"
              className="atelier-auth-social-btn"
              disabled
              title="Em breve"
            >
              <span className="material-symbols-outlined" aria-hidden>
                ios
              </span>
              <span>Apple</span>
            </button>
          </div>
        </div>

        <footer className="atelier-auth-login-footer">
          <p className="atelier-auth-switch">
            Novo por aqui?{" "}
            <Link className="atelier-auth-link" to="/register">
              Criar conta
            </Link>
          </p>
          <div className="atelier-auth-legal">
            <a className="atelier-auth-legal-link" href="#" onClick={(e) => e.preventDefault()}>
              Termos de utilização
            </a>
            <a className="atelier-auth-legal-link" href="#" onClick={(e) => e.preventDefault()}>
              Política de privacidade
            </a>
          </div>
        </footer>
      </main>

      <aside className="atelier-auth-floating-quote" aria-hidden="true">
        <span className="atelier-auth-floating-rule" />
        <span className="atelier-auth-floating-text">A arte do cuidado masculino</span>
      </aside>
    </div>
  );
}

export default Login;
