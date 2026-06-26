import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import TermsModal from "../components/TermsModal";

const REGISTER_SIDE_IMG =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuCfKkAwh3a8huXqZuRekC6cYqy01XPFGmMiqDbMCpoRWqh0t7r38gXe53J3q4sJ_f1lk8W_pZ3NWbM7R_8s5Ipm1mFKWrn1P1x8baYJ-ubfpUiPpDjYw3IBAzEBSIv4bxvZ-AeqRXfedS_062qCWXXKxbEg7XWObcPkXjDMNVSwBNYSL7qoe3xTLKkRM1DTju9n_fDYudDpEVz1Xibe9SesIaDyo-BFQ6h9ETtjAq5WpaYuXNi1Wm4XIu_JFu9N4TR3ee_fZbdjrNQ";

function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [senhaConfirm, setSenhaConfirm] = useState("");
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [modalType, setModalType] = useState(null); // "terms" | "privacy" | null
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const { user, signUp } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate("/home", { replace: true });
    }
  }, [user, navigate]);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (!name.trim() || !email.trim() || !senha.trim() || !senhaConfirm.trim()) {
      setError("Todos os campos são obrigatórios.");
      return;
    }

    if (!termsAccepted) {
      setError("Aceite os termos e a política de privacidade para continuar.");
      return;
    }

    if (senha !== senhaConfirm) {
      setError("As senhas não conferem.");
      return;
    }

    setLoading(true);

    const result = await signUp(name, email, senha);

    setLoading(false);

    if (result.success) {
      setSuccess("Cadastro realizado com sucesso. Redirecionando…");
      setError("");
      setTimeout(() => navigate("/home", { replace: true }), 600);
    } else {
      setError(result.error || "Erro ao cadastrar.");
      setSuccess("");
    }
  }

  return (
    <>
    {modalType && <TermsModal type={modalType} onClose={() => setModalType(null)} />}
    <div className="atelier-auth atelier-auth--register">
      <main className="atelier-auth-register-shell">
        <section className="atelier-auth-register-visual" aria-hidden="true">
          <div className="atelier-auth-register-visual-img-wrap">
            <img
              className="atelier-auth-register-visual-img"
              src={REGISTER_SIDE_IMG}
              alt=""
            />
            <div className="atelier-auth-register-visual-scrim" />
          </div>
          <div className="atelier-auth-register-visual-copy">
            <span className="atelier-auth-eyebrow atelier-auth-eyebrow--on-dark">Desde 2024</span>
            <h1 className="atelier-auth-register-hero-title">
              Cadu
              <br />
              Ellegance
            </h1>
            <p className="atelier-auth-register-hero-text">
              Tradição e precisão num só lugar. Faça parte da nossa casa e eleve a sua experiência de
              barbearia e grooming.
            </p>
          </div>
        </section>

        <section className="atelier-auth-register-panel">
          <div className="atelier-auth-register-inner">
            <div className="atelier-auth-register-mobile-brand">
              <span className="atelier-auth-logo atelier-auth-logo--sm">Cadu Ellegance</span>
            </div>

            <header className="atelier-auth-register-header">
              <span className="atelier-auth-eyebrow">Cadastro</span>
              <h2 className="atelier-auth-title atelier-auth-title--register">Criar conta</h2>
              <p className="atelier-auth-subtitle">
                Preencha os seus dados para iniciar a sua experiência.
              </p>
            </header>

            <form className="atelier-auth-form atelier-auth-form--register" onSubmit={handleSubmit}>
              <p className="atelier-auth-register-hint">Novo cliente</p>

              <div className="atelier-auth-float-fields">
                <div className="atelier-auth-float">
                  <input
                    id="name"
                    className="atelier-auth-float-input"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder=" "
                    autoComplete="name"
                    required
                  />
                  <label className="atelier-auth-float-label" htmlFor="name">
                    Nome completo
                  </label>
                </div>

                <div className="atelier-auth-float">
                  <input
                    id="email"
                    className="atelier-auth-float-input"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder=" "
                    autoComplete="email"
                    required
                  />
                  <label className="atelier-auth-float-label" htmlFor="email">
                    Email
                  </label>
                </div>

                <div className="atelier-auth-register-two-col">
                  <div className="atelier-auth-float">
                    <input
                      id="senha"
                      className="atelier-auth-float-input"
                      type="password"
                      value={senha}
                      onChange={(e) => setSenha(e.target.value)}
                      placeholder=" "
                      autoComplete="new-password"
                      required
                    />
                    <label className="atelier-auth-float-label" htmlFor="senha">
                      Senha
                    </label>
                  </div>
                  <div className="atelier-auth-float">
                    <input
                      id="senhaConfirm"
                      className="atelier-auth-float-input"
                      type="password"
                      value={senhaConfirm}
                      onChange={(e) => setSenhaConfirm(e.target.value)}
                      placeholder=" "
                      autoComplete="new-password"
                      required
                    />
                    <label className="atelier-auth-float-label" htmlFor="senhaConfirm">
                      Confirmar senha
                    </label>
                  </div>
                </div>
              </div>

              <div className="atelier-auth-terms">
                <input
                  id="terms"
                  className="atelier-auth-checkbox"
                  type="checkbox"
                  checked={termsAccepted}
                  onChange={(e) => setTermsAccepted(e.target.checked)}
                />
                <label className="atelier-auth-terms-label" htmlFor="terms">
                  Concordo com os{" "}
                  <button type="button" className="atelier-auth-inline-link" onClick={() => setModalType("terms")}>
                    Termos de utilização
                  </button>{" "}
                  e com a{" "}
                  <button type="button" className="atelier-auth-inline-link" onClick={() => setModalType("privacy")}>
                    Política de privacidade
                  </button>
                  .
                </label>
              </div>

              <div className="atelier-auth-register-actions">
                <button
                  type="submit"
                  className="atelier-auth-btn-gold atelier-auth-btn-gold--register"
                  disabled={loading}
                >
                  {loading ? "Aguarde…" : "Criar conta"}
                </button>

                {error && (
                  <p className="atelier-auth-alert atelier-auth-alert--error">{error}</p>
                )}
                {success && (
                  <p className="atelier-auth-alert atelier-auth-alert--success">{success}</p>
                )}

                <p className="atelier-auth-switch atelier-auth-switch--center">
                  <span className="atelier-auth-switch-muted">Já tem conta?</span>{" "}
                  <Link className="atelier-auth-link" to="/login">
                    Entrar
                  </Link>
                </p>
              </div>
            </form>

            <footer className="atelier-auth-register-foot">
              <span className="material-symbols-outlined" aria-hidden>
                content_cut
              </span>
              <span className="atelier-auth-register-foot-text">Excelência em cada detalhe</span>
              <span className="material-symbols-outlined" aria-hidden>
                badge
              </span>
            </footer>
          </div>
        </section>
      </main>
    </div>
    </>
  );
}

export default Register;
