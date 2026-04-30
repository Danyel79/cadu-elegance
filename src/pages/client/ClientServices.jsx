import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { listServicesCatalog } from "../../services/adminDataService";
import { CLIENT_AREA_INNER_STYLE, CLIENT_AREA_MAIN_STYLE } from "./clientAreaLayout";

export default function ClientServices() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadServices() {
      const res = await listServicesCatalog();
      if (res.success) {
        setServices(res.data);
      } else {
        setError(res.error || "Erro ao carregar serviços.");
      }
      setLoading(false);
    }
    loadServices();
  }, []);

  return (
    <main style={CLIENT_AREA_MAIN_STYLE}>
      <div style={CLIENT_AREA_INNER_STYLE}>
      <header style={{ marginBottom: "42px" }}>
        <p style={{ color: "#d1b76b", textTransform: "uppercase", letterSpacing: "0.24em", marginBottom: "12px" }}>
          Serviços cadastrados
        </p>
        <h1
          style={{
            fontSize: "clamp(2rem, 2.5vw, 3rem)",
            marginBottom: "12px",
            color: "#f6f2e8",
          }}
        >
          Serviços disponíveis
        </h1>
        <p style={{ maxWidth: "700px", lineHeight: 1.75, color: "#beb7a3" }}>
          Aqui estão apenas os serviços que já foram cadastrados no sistema pela equipe de administração.
        </p>
      </header>

      {loading && <p>Carregando serviços…</p>}
      {error && <p style={{ color: "#f18f01" }}>{error}</p>}

      {!loading && !error && services.length === 0 && (
        <p style={{ color: "#beb7a3" }}>
          Nenhum serviço cadastrado ainda. Peça para o administrador cadastrar os serviços antes de agendar.
        </p>
      )}

      <div style={{ display: "grid", gap: "18px" }}>
        {services.map((service) => (
          <article
            key={service.$id}
            style={{
              padding: "24px",
              borderRadius: "18px",
              border: "1px solid rgba(209, 183, 107, 0.18)",
              background: "rgba(255, 255, 255, 0.04)",
              boxShadow: "0 18px 40px rgba(0,0,0,0.24)",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
              <div>
                <h2 style={{ margin: 0, color: "#d1b76b" }}>{service.name}</h2>
                <p style={{ margin: 0, color: "#beb7a3" }}>{service.description || "Serviço registrado pelo administrador."}</p>
              </div>
              <strong style={{ color: "#d1b76b" }}>
                {Number(service.price).toFixed(2).replace(".", ",")} €
              </strong>
            </div>
          </article>
        ))}
      </div>

      <div style={{ marginTop: "30px" }}>
        <Link
          to="/client"
          style={{
            color: "#d1b76b",
            textDecoration: "none",
            fontWeight: "600",
          }}
        >
          ← Voltar para área do cliente
        </Link>
      </div>
      </div>
    </main>
  );
}
