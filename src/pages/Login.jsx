import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { requestPasswordRecovery } from "../context/authService";
import TermsModal from "../components/TermsModal";
import { InstagramIcon, WhatsAppIcon } from "../components/SocialIcons";
import { getSiteContent } from "../services/siteContentService";

const LOGIN_BG =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuBqOwE08MCgq-xekfOc-gIfbZ31tiORjGl4hvGHSkXrh1njETLXXe5ZU3_RsIZBZPYBD1vPi4Il9SfcvU5lZzu71kfz5E-w4Nm6lBn8IeIu3Ohs-3OKxclfBgd_zVAD5Y9TZUejvM7ehb2y4SvgrJSPydcYohgvnAqndUzqqVjlDNbVXTmUyQrJoM3aHnk-sy0MYt8KTK_M_HJhlFWcqZxY39-y-0mBNxB8r2LSrDUVdjXoDaSrdX7t5n-PISPPGGiRDuEMA9rfGuM";

// mode: "login" | "forgot" | "forgot_sent"
function Login() {
  const [mode, setMode] = useState("login");
  const [modalType, setModalType] = useState(null);
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [recoveryEmail, setRecoveryEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const { user, signIn } = useAuth();
  const navigate = useNavigate();
  const [siteContent, setSiteContent] = useState(null);

  useEffect(() => {
    if (user) navigate("/home", { replace: true });
  }, [user, navigate]);

  useEffect(() => {
    let active = true;
    getSiteContent().then((res) => {
      if (active && res.success) setSiteContent(res.data);
    });
    return () => {
      active = false;
    };
  }, []);

  const whatsappUrl = siteContent?.whatsappNumero ? `https://wa.me/${siteContent.whatsappNumero}` : null;
  const instagramUrl = siteContent?.instagramUrl || null;

  function openForgot() {
    setMode("forgot");
    setError("");
    setSuccess("");
    setRecoveryEmail(email); // pré-preenche com o email já digitado
  }

  function backToLogin() {
    setMode("login");
    setError("");
    setSuccess("");
  }

  async function handleLogin(e) {
    e.preventDefault();
    setError("");
    setSuccess("");
    if (!email.trim() || !senha.trim()) {
      setError("Preencha email e senha.");
      return;
    }
    setLoading(true);
    const result = await signIn(email.trim(), senha.trim());
    setLoading(false);
    if (!result.success) {
      setError(result.error || "Erro ao autenticar.");
    }
  }

  async function handleRecovery(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const result = await requestPasswordRecovery(recoveryEmail.trim());
    setLoading(false);
    if (result.success) {
      setMode("forgot_sent");
    } else {
      setError(result.error || "Erro ao enviar e-mail de recuperação.");
    }
  }

  return (
    <>
    {modalType && <TermsModal type={modalType} onClose={() => setModalType(null)} />}
    <div className="atelier-auth atelier-auth--login">
      <nav className="atelier-auth-topnav">
        <Link to="/sobre" className="atelier-auth-topnav-link">SOBRE NÓS</Link>
        <Link to="/dia-do-noivo" className="atelier-auth-topnav-link">DIA DO NOIVO</Link>
        <Link to="/contato" className="atelier-auth-topnav-link">CONTATO</Link>
      </nav>

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

          {/* ─── MODO LOGIN ─── */}
          {mode === "login" && (
            <>
              <div className="atelier-auth-card-head">
                <span className="atelier-auth-eyebrow">Bem-vindo de volta</span>
                <h2 className="atelier-auth-title">Acesso de cliente</h2>
              </div>

              <form className="atelier-auth-form" onSubmit={handleLogin}>
                <div className="atelier-auth-stack">
                  <div className="atelier-auth-field-group">
                    <label className="atelier-auth-label" htmlFor="email">Email</label>
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
                      <label className="atelier-auth-label" htmlFor="senha">Senha</label>
                      <button type="button" className="atelier-auth-text-btn" onClick={openForgot}>
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

                <button type="submit" className="atelier-auth-btn-gold" disabled={loading}>
                  {loading ? "Aguarde…" : "Entrar na Cadu Ellegance"}
                  {!loading && (
                    <span className="material-symbols-outlined atelier-auth-btn-icon" aria-hidden>
                      arrow_forward
                    </span>
                  )}
                </button>

                {error && <p className="atelier-auth-alert atelier-auth-alert--error">{error}</p>}
                {success && <p className="atelier-auth-alert atelier-auth-alert--success">{success}</p>}
              </form>

            </>
          )}

          {/* ─── MODO ESQUECI A SENHA ─── */}
          {mode === "forgot" && (
            <>
              <div className="atelier-auth-card-head">
                <span className="atelier-auth-eyebrow">Recuperar acesso</span>
                <h2 className="atelier-auth-title">Esqueceu a senha?</h2>
                <p style={{ color: "#beb7a3", fontSize: "13px", marginTop: "8px", lineHeight: 1.6 }}>
                  Informe o e-mail da sua conta. Enviaremos um link para você criar uma nova senha.
                </p>
              </div>

              <form className="atelier-auth-form" onSubmit={handleRecovery}>
                <div className="atelier-auth-field-group">
                  <label className="atelier-auth-label" htmlFor="recovery-email">Email</label>
                  <input
                    id="recovery-email"
                    className="atelier-auth-input-line"
                    type="email"
                    value={recoveryEmail}
                    onChange={(ev) => setRecoveryEmail(ev.target.value)}
                    placeholder="seu@email.com"
                    autoComplete="email"
                    required
                    autoFocus
                  />
                </div>

                <button type="submit" className="atelier-auth-btn-gold" disabled={loading}>
                  {loading ? "Enviando…" : "Enviar link de recuperação"}
                  {!loading && (
                    <span className="material-symbols-outlined atelier-auth-btn-icon" aria-hidden>
                      send
                    </span>
                  )}
                </button>

                {error && <p className="atelier-auth-alert atelier-auth-alert--error">{error}</p>}

                <button type="button" className="atelier-auth-text-btn" onClick={backToLogin}
                  style={{ display: "block", margin: "4px auto 0", fontSize: "13px" }}>
                  ← Voltar para o login
                </button>
              </form>
            </>
          )}

          {/* ─── MODO ENVIADO ─── */}
          {mode === "forgot_sent" && (
            <>
              <div className="atelier-auth-card-head">
                <span className="atelier-auth-eyebrow">E-mail enviado</span>
                <h2 className="atelier-auth-title">Verifique sua caixa</h2>
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
                    mark_email_read
                  </span>
                  <p style={{ margin: 0, color: "#beb7a3", fontSize: "13px", lineHeight: 1.65 }}>
                    Enviamos um link para <strong style={{ color: "#f6f2e8" }}>{recoveryEmail}</strong>.
                    Clique no link dentro de 1 hora para criar uma nova senha.
                  </p>
                </div>

                <p style={{ color: "#99907c", fontSize: "12px", textAlign: "center", margin: 0 }}>
                  Não recebeu? Verifique o spam ou tente novamente.
                </p>

                <button
                  type="button"
                  className="atelier-auth-btn-gold"
                  onClick={backToLogin}
                >
                  Voltar para o login
                  <span className="material-symbols-outlined atelier-auth-btn-icon" aria-hidden>
                    arrow_forward
                  </span>
                </button>

                <button
                  type="button"
                  className="atelier-auth-text-btn"
                  onClick={() => { setMode("forgot"); setError(""); }}
                  style={{ fontSize: "12px" }}
                >
                  Reenviar para outro e-mail
                </button>
              </div>
            </>
          )}

        </div>

        <footer className="atelier-auth-login-footer">
          {(instagramUrl || whatsappUrl) && (
            <div className="atelier-auth-social-icons">
              {instagramUrl && (
                <a href={instagramUrl} target="_blank" rel="noreferrer" className="atelier-auth-social-icon-link" aria-label="Instagram">
                  <InstagramIcon size={18} />
                </a>
              )}
              {whatsappUrl && (
                <a href={whatsappUrl} target="_blank" rel="noreferrer" className="atelier-auth-social-icon-link" aria-label="WhatsApp">
                  <WhatsAppIcon size={18} />
                </a>
              )}
            </div>
          )}
          <p className="atelier-auth-switch">
            Novo por aqui?{" "}
            <Link className="atelier-auth-link" to="/register">
              Criar conta
            </Link>
          </p>
          <div className="atelier-auth-legal">
            <button type="button" className="atelier-auth-legal-link" onClick={() => setModalType("terms")}>
              Termos de utilização
            </button>
            <button type="button" className="atelier-auth-legal-link" onClick={() => setModalType("privacy")}>
              Política de privacidade
            </button>
          </div>
        </footer>
      </main>

      <aside className="atelier-auth-floating-quote" aria-hidden="true">
        <span className="atelier-auth-floating-rule" />
        <span className="atelier-auth-floating-text">A arte do cuidado masculino</span>
      </aside>
    </div>
    </>
  );
}

export default Login;
