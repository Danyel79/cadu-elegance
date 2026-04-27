import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useUserProfile } from "../hooks/useUserProfile";

export default function Home() {
  const { user, signOut } = useAuth();
  const { isAdmin } = useUserProfile();

  return (
    <main className="login-screen">
      <div className="login-form">
        <h1>Bem-vindo</h1>
        <p>Usuário: {user?.name || user?.email || "Usuário"}</p>
        <p className="home-admin-link-wrap">
          <Link className="home-admin-link" to="/client">
            Área do cliente
          </Link>
        </p>
        {isAdmin && (
          <p className="home-admin-link-wrap">
            <Link className="home-admin-link" to="/admin">
              Painel de administração
            </Link>
          </p>
        )}
        <button type="button" onClick={signOut}>
          Sair
        </button>
      </div>
    </main>
  );
}
