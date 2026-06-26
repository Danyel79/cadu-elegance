import { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  listBookingsForUser,
  listServicesCatalog,
  listUserProfiles,
  updateBookingStatus,
} from "../../services/adminDataService";
import ClientLayout from "./ClientLayout";

function isBookingPast(booking) {
  if (!booking.dateIso) return false;
  const today = new Date().toISOString().slice(0, 10);
  if (booking.dateIso < today) return true;
  if (booking.dateIso > today) return false;
  // Mesmo dia: compara hora
  const now = new Date();
  const [h, m] = (booking.time || "0:0").split(":").map(Number);
  const bookingTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), h, m);
  return bookingTime < now;
}

const STATUS_CONFIG = {
  AGENDADO: { label: "Agendado", color: "#d1b76b" },
  CONCLUIDO: { label: "Concluído", color: "#10b981" },
  CANCELADO: { label: "Cancelado", color: "#e05252" },
  ATENDIDO: { label: "Atendido", color: "#10b981" },
};

function getStatusConfig(booking, past) {
  const raw = (booking.status || "").toUpperCase();
  if (raw === "CANCELADO") return STATUS_CONFIG.CANCELADO;
  if (raw === "CONCLUIDO") return STATUS_CONFIG.CONCLUIDO;
  if (past) return STATUS_CONFIG.ATENDIDO;
  return STATUS_CONFIG.AGENDADO;
}

function formatCurrency(value) {
  if (value == null) return "—";
  return Number(value).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export default function ClientBookings() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [services, setServices] = useState([]);
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [cancellingId, setCancellingId] = useState(null);

  const serviceMap = useMemo(
    () => new Map(services.map((s) => [s.$id, s.name])),
    [services]
  );

  const servicePriceMap = useMemo(
    () => new Map(services.map((s) => [s.$id, Number(s.price) || 0])),
    [services]
  );

  const profMap = useMemo(
    () => new Map(profiles.map((p) => [p.$id, p.nickName || p.name || p.email || p.$id])),
    [profiles]
  );

  useEffect(() => {
    if (!user) return;

    async function load() {
      setLoading(true);
      const [bookingsRes, servicesRes, profilesRes] = await Promise.all([
        listBookingsForUser(user.$id),
        listServicesCatalog(),
        listUserProfiles(),
      ]);
      if (bookingsRes.success) setBookings(bookingsRes.data);
      else setError(bookingsRes.error || "Erro ao carregar agendamentos.");
      if (servicesRes.success) setServices(servicesRes.data);
      if (profilesRes.success) setProfiles(profilesRes.data);
      setLoading(false);
    }

    load();
  }, [user]);

  async function handleCancel(bookingId) {
    if (!window.confirm("Deseja cancelar este agendamento?")) return;
    setCancellingId(bookingId);
    const res = await updateBookingStatus(bookingId, "CANCELADO");
    setCancellingId(null);
    if (res.success) {
      setBookings((prev) =>
        prev.map((b) => (b.$id === bookingId ? { ...b, status: "CANCELADO" } : b))
      );
    }
  }

  return (
    <ClientLayout backTo="/client" backLabel="← Área do cliente">
      <header style={{ marginBottom: "42px" }}>
        <p style={{ color: "#d1b76b", textTransform: "uppercase", letterSpacing: "0.24em", marginBottom: "12px" }}>
          Meus agendamentos
        </p>
        <h1 style={{ fontSize: "clamp(2rem, 2.5vw, 3rem)", marginBottom: "12px", color: "#f6f2e8" }}>
          Seus horários confirmados
        </h1>
        <p style={{ maxWidth: "700px", lineHeight: 1.75, color: "#beb7a3" }}>
          Aqui estão os seus agendamentos. Agendamentos futuros podem ser cancelados.
        </p>
      </header>

      <div style={{ marginBottom: "32px" }}>
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

      {loading && <p style={{ color: "#beb7a3" }}>Carregando agendamentos…</p>}
      {error && <p style={{ color: "#f18f01" }}>{error}</p>}

      {!loading && bookings.length === 0 && !error && (
        <p style={{ color: "#beb7a3" }}>
          Você ainda não tem agendamentos. Comece escolhendo um profissional e um serviço.
        </p>
      )}

      <div style={{ display: "grid", gap: "18px" }}>
        {bookings.map((booking) => {
          const past = isBookingPast(booking);
          const statusRaw = (booking.status || "").toUpperCase();
          const cancelled = statusRaw === "CANCELADO";
          const concluido = statusRaw === "CONCLUIDO";
          const statusCfg = getStatusConfig(booking, past);
          const canCancel = !past && !cancelled && !concluido;
          const isCancelling = cancellingId === booking.$id;
          const dimmed = past || cancelled;
          const price = booking.servicePrice != null
            ? Number(booking.servicePrice)
            : servicePriceMap.get(booking.serviceId) ?? null;

          return (
            <article
              key={booking.$id}
              style={{
                padding: "24px",
                borderRadius: "18px",
                border: cancelled
                  ? "1px solid rgba(224,82,82,0.18)"
                  : past
                  ? "1px solid rgba(255,255,255,0.06)"
                  : "1px solid rgba(209,183,107,0.18)",
                background: "rgba(255,255,255,0.03)",
                boxShadow: "0 18px 40px rgba(0,0,0,0.2)",
                opacity: dimmed ? 0.65 : 1,
                transition: "opacity 0.2s",
              }}
            >
              {/* Cabeçalho: serviço + data/hora */}
              <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: "16px", marginBottom: "16px" }}>
                <div>
                  <p style={{ margin: "0 0 4px", color: "#99907c", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.14em" }}>
                    Serviço
                  </p>
                  <h2 style={{ margin: 0, color: past || cancelled ? "#beb7a3" : "#d1b76b", fontSize: "1.1rem" }}>
                    {serviceMap.get(booking.serviceId) || booking.serviceName || "Serviço"}
                  </h2>
                </div>
                <div style={{ textAlign: "right" }}>
                  <p style={{ margin: "0 0 2px", color: "#beb7a3", fontSize: "13px" }}>{booking.date}</p>
                  <strong style={{ color: "#f6f2e8", fontSize: "1.1rem" }}>{booking.time}</strong>
                </div>
              </div>

              {/* Detalhes + ações */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: "14px" }}>
                <div style={{ display: "grid", gap: "6px", color: "#beb7a3", fontSize: "13px" }}>
                  <span>
                    Profissional:{" "}
                    {profMap.get(booking.professionalProfileId) || booking.professionalLabel || "—"}
                  </span>
                  <span>Preço: {formatCurrency(price)}</span>
                </div>

                {/* Status + botão cancelar */}
                <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
                  <span
                    style={{
                      display: "inline-block",
                      padding: "5px 14px",
                      borderRadius: "999px",
                      fontSize: "11px",
                      fontWeight: 600,
                      color: statusCfg.color,
                      background: `${statusCfg.color}18`,
                      border: `1px solid ${statusCfg.color}40`,
                      whiteSpace: "nowrap",
                    }}
                  >
                    {statusCfg.label}
                  </span>

                  {canCancel && (
                    <button
                      type="button"
                      disabled={isCancelling}
                      onClick={() => handleCancel(booking.$id)}
                      style={{
                        padding: "5px 14px",
                        borderRadius: "8px",
                        border: "1px solid rgba(224,82,82,0.4)",
                        background: isCancelling ? "rgba(224,82,82,0.05)" : "rgba(224,82,82,0.08)",
                        color: "#e05252",
                        fontSize: "11px",
                        fontWeight: 600,
                        cursor: isCancelling ? "not-allowed" : "pointer",
                        whiteSpace: "nowrap",
                        display: "flex",
                        alignItems: "center",
                        gap: "4px",
                      }}
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: "14px" }}>
                        cancel
                      </span>
                      {isCancelling ? "Cancelando..." : "Cancelar"}
                    </button>
                  )}
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </ClientLayout>
  );
}
