import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useUserProfile } from "../../hooks/useUserProfile";
import { listBookingsForProfessionalSchedule } from "../../services/adminDataService";
import ProfessionalLayout from "./ProfessionalLayout";

export default function ProfessionalBookings() {
  const { signOut } = useAuth();
  const { profile } = useUserProfile();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!profile?._id) return;

    async function loadBookings() {
      setLoading(true);
      setError("");
      const res = await listBookingsForProfessionalSchedule(profile.$id);
      if (res.success) {
        setBookings(res.data);
      } else {
        setError(res.error || "Erro ao carregar agendamentos.");
      }
      setLoading(false);
    }

    loadBookings();
  }, [profile]);

  return (
    <ProfessionalLayout>
      <header style={{ marginBottom: "42px" }}>
        <p style={{ color: "#d1b76b", textTransform: "uppercase", letterSpacing: "0.24em", marginBottom: "12px" }}>
          Agendamentos futuros
        </p>
        <h1
          style={{
            fontSize: "clamp(2rem, 2.5vw, 3rem)",
            marginBottom: "12px",
            color: "#f6f2e8",
          }}
        >
          Clientes agendados
        </h1>
        <p style={{ maxWidth: "700px", lineHeight: 1.75, color: "#beb7a3" }}>
          Veja os horários confirmados com você e a situação de cada reserva.
        </p>
      </header>

      {loading && <p>Carregando agendamentos…</p>}
      {error && <p style={{ color: "#f18f01" }}>{error}</p>}
      {!loading && bookings.length === 0 && !error && (
        <p style={{ color: "#beb7a3" }}>
          Nenhum agendamento encontrado. Use a agenda para bloquear horários ou verifique se há reservas futuras.
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
              <span>Cliente: {booking.userId || "—"}</span>
              <span>Preço: {booking.servicePrice != null ? `${Number(booking.servicePrice).toFixed(2).replace(".", ",")} €` : "—"}</span>
              <span>Status: {booking.status || "—"}</span>
            </div>
          </article>
        ))}
      </div>

      <div style={{ marginTop: "30px" }}>
        <Link
          to="/professional"
          style={{
            color: "#d1b76b",
            textDecoration: "none",
            fontWeight: "600",
          }}
        >
          ← Voltar para área do profissional
        </Link>
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
    </ProfessionalLayout>
  );
}
