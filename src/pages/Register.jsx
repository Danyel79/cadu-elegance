import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [senhaConfirm, setSenhaConfirm] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const { signUp } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (!name.trim() || !email.trim() || !senha.trim() || !senhaConfirm.trim()) {
      setError("Todos os campos são obrigatórios.");
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
      setSuccess("Cadastro realizado com sucesso. Redirecionando para login...");
      setError("");
      setTimeout(() => navigate("/login"), 1000);
    } else {
      setError(result.error || "Erro ao cadastrar.");
      setSuccess("");
    }
  }

  return (
    <main className="login-screen">
      <form className="login-form" onSubmit={handleSubmit}>
        <h1>Cadastro</h1>

        <label htmlFor="name">Nome</label>
        <input
          id="name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Seu nome"
          required
        />

        <label htmlFor="email">Email</label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="seu@email.com"
          required
        />

        <label htmlFor="senha">Senha</label>
        <input
          id="senha"
          type="password"
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
          placeholder="********"
          required
        />

        <label htmlFor="senhaConfirm">Confirme a senha</label>
        <input
          id="senhaConfirm"
          type="password"
          value={senhaConfirm}
          onChange={(e) => setSenhaConfirm(e.target.value)}
          placeholder="********"
          required
        />

        <button type="submit" disabled={loading}>
          {loading ? "Aguarde..." : "Cadastrar"}
        </button>

        {error && <p className="login-error">{error}</p>}
        {success && <p className="login-success">{success}</p>}

        <p className="switch-text">
          Já tem conta?{' '}
          <button type="button" className="switch-link" onClick={() => navigate("/login")}> 
            Entrar
          </button>
        </p>
      </form>
    </main>
  );
}

export default Register;
