import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { listBookingsForUser } from "../../services/adminDataService";
import { CLIENT_AREA_INNER_STYLE, CLIENT_AREA_MAIN_STYLE } from "./clientAreaLayout";

export default function ClientBookings() {
  const { user, signOut } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user) return;

    async function loadBookings() {
      setLoading(true);
      const res = await listBookingsForUser(user.$id);
      if (res.success) {
        setBookings(res.data);
      } else {
        setError(res.error || "Erro ao carregar agendamentos.");
      }
      setLoading(false);
    }

    loadBookings();
  }, [user]);

  return (
    <main style={CLIENT_AREA_MAIN_STYLE}>
      <div style={CLIENT_AREA_INNER_STYLE}>
      <header style={{ marginBottom: "42px" }}>
        <p style={{ color: "#d1b76b", textTransform: "uppercase", letterSpacing: "0.24em", marginBottom: "12px" }}>
          Meus agendamentos
        </p>
        <h1
          style={{
            fontSize: "clamp(2rem, 2.5vw, 3rem)",
            marginBottom: "12px",
            color: "#f6f2e8",
          }}
        >
          Seus horários confirmados
        </h1>
        <p style={{ maxWidth: "700px", lineHeight: 1.75, color: "#beb7a3" }}>
          Aqui estão os seus agendamentos criados pelo app. Se quiser marcar um novo horário, clique no botão abaixo.
        </p>
      </header>

      <div style={{ marginBottom: "24px" }}>
        <Link
          to="/client/book"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "10px",
            padding: "14px 22px",
            borderRadius: "14px",
            background: "#d1b76b",
            color: "#080808",
            textDecoration: "none",
            fontWeight: "600",
          }}
        >
          Agendar novo horário
        </Link>
      </div>

      {loading && <p>Carregando agendamentos…</p>}
      {error && <p style={{ color: "#f18f01" }}>{error}</p>}

      {!loading && bookings.length === 0 && !error && (
        <p style={{ color: "#beb7a3" }}>
          Você ainda não tem agendamentos. Comece escolhendo um profissional e um serviço.
        </p>
      )}

      <div style={{ display: "grid", gap: "18px" }}>
        {bookings.map((booking) => (
          <article
            key={booking.$id}
            style={{
              padding: "24px",
              borderRadius: "18px",
              border: "1px solid rgba(209, 183, 107, 0.18)",
              background: "rgba(255, 255, 255, 0.04)",
              boxShadow: "0 18px 40px rgba(0,0,0,0.24)",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: "16px", marginBottom: "14px" }}>
              <div>
                <p style={{ margin: 0, color: "#d1b76b", fontWeight: 700, letterSpacing: "0.02em" }}>Serviço</p>
                <h2 style={{ margin: "6px 0 0", color: "#d1b76b" }}>{booking.serviceName}</h2>
              </div>
              <div style={{ textAlign: "right" }}>
                <p style={{ margin: 0, color: "#beb7a3" }}>{booking.date}</p>
                <strong style={{ color: "#f6f2e8", fontSize: "1.1rem" }}>{booking.time}</strong>
              </div>
            </div>
            <div style={{ display: "grid", gap: "8px", color: "#beb7a3" }}>
              <span>Profissional: {booking.professionalLabel || "—"}</span>
              <span>Preço: {booking.servicePrice != null ? `${Number(booking.servicePrice).toFixed(2).replace(".", ",")} €` : "—"}</span>
              <span>Status: {booking.status || "—"}</span>
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
    </main>
  );
}
