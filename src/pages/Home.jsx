import { useAuth } from "../context/AuthContext";

export default function Home() {
  const { user, signOut } = useAuth();

  return (
    <main className="login-screen">
      <div className="login-form">
        <h1>Bem-vindo</h1>
        <p>Usuário: {user?.name || user?.email || "Usuário"}</p>
        <button onClick={signOut}>Sair</button>
      </div>
    </main>
  );
}
