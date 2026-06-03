import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { createServiceRecord } from "../../services/adminDataService";

export default function AdminServiceForm() {
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);
    const res = await createServiceRecord({ name, description, price });
    setLoading(false);
    if (res.success) {
      setSuccess("Serviço criado com sucesso.");
      setName("");
      setDescription("");
      setPrice("");
      setTimeout(() => navigate("/admin"), 1200);
    } else {
      setError(res.error || "Erro ao criar serviço.");
    }
  }

  return (
    <main className="admin-screen">
      <div className="admin-panel">
        <header className="admin-header">
          <h1>Adicionar serviço</h1>
          <p className="admin-subtitle">Campos alinhados com a collection no Appwrite</p>
        </header>

        <form className="admin-form" onSubmit={handleSubmit}>
          <label htmlFor="svc-name">Nome</label>
          <input
            id="svc-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ex.: Corte + barba"
            required
            autoComplete="off"
          />

          <label htmlFor="svc-desc">Descrição</label>
          <textarea
            id="svc-desc"
            className="admin-textarea"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Descrição do serviço"
            rows={5}
            required
          />

          <label htmlFor="svc-price">Preço</label>
          <input
            id="svc-price"
            type="text"
            inputMode="decimal"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="Ex.: 25 ou 25,50"
            required
          />

          <button type="submit" className="admin-btn-primary" disabled={loading}>
            {loading ? "A criar…" : "Criar serviço"}
          </button>

          {error && <p className="admin-banner admin-banner-error">{error}</p>}
          {success && <p className="admin-banner admin-banner-success">{success}</p>}
        </form>

        <div style={{ marginTop: "20px" }}>
          <button
            type="button"
            onClick={() => signOut()}
            style={{
              border: "1px solid #d1b76b",
              background: "transparent",
              color: "#f6f2e8",
              padding: "12px 22px",
              borderRadius: "12px",
              cursor: "pointer",
            }}
          >
            Sair
          </button>
        </div>

        <nav className="admin-footer-nav">
          <Link to="/admin">← Painel admin</Link>
        </nav>
      </div>
    </main>
  );
}
