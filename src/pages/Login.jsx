import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Login() {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e) {
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

    if (result.success) {
      setSuccess("Login efetuado com sucesso!");
      setError("");
      navigate("/");
    } else {
      setError(result.error || "Erro ao autenticar.");
      setSuccess("");
    }
  }

  return (
    <main className="login-screen">
      <form className="login-form" onSubmit={handleSubmit}>
        <h1>Entrar</h1>

        <label htmlFor="email">Email</label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(ev) => setEmail(ev.target.value)}
          placeholder="seu@email.com"
          required
        />

        <label htmlFor="senha">Senha</label>
        <input
          id="senha"
          type="password"
          value={senha}
          onChange={(ev) => setSenha(ev.target.value)}
          placeholder="********"
          required
        />

        <button type="submit" disabled={loading}>
          {loading ? "Aguarde..." : "Entrar"}
        </button>

        {error && <p className="login-error">{error}</p>}
        {success && <p className="login-success">{success}</p>}

        <p className="switch-text">
          Não tem conta?{' '}
          <button type="button" className="switch-link" onClick={() => navigate("/register")}> 
            Cadastrar
          </button>
        </p>
      </form>
    </main>
  );
}

export default Login;
