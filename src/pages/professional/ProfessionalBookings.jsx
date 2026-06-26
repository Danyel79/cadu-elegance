import { useEffect, useState, useMemo } from "react";
import { useUserProfile } from "../../hooks/useUserProfile";
import {
  listBookingsForProfessionalSchedule,
  listUserProfiles,
  listServicesCatalog,
  updateBookingStatus,
} from "../../services/adminDataService";
import ProfessionalLayout from "./ProfessionalLayout";

const STATUS_LABEL = {
  agendado: "Agendado",
  confirmado: "Confirmado",
  pendente: "Pendente",
  cancelado: "Cancelado",
  concluido: "Concluído",
};

const STATUS_COLOR = {
  agendado: "#d1b76b",
  confirmado: "#4caf84",
  pendente: "#d1b76b",
  cancelado: "#e05252",
  concluido: "#7b8fa1",
};

function formatDate(dateStr) {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  if (isNaN(d)) return dateStr;
  return d.toLocaleDateString("pt-BR", { weekday: "long", day: "2-digit", month: "long" });
}

function formatCurrency(value) {
  return Number(value).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function groupByDate(bookings) {
  const map = new Map();
  for (const b of bookings) {
    const key = b.dateIso ? b.dateIso.slice(0, 10) : (b.date || "");
    if (!map.has(key)) map.set(key, []);
    map.get(key).push(b);
  }
  return [...map.entries()].sort(([a], [b]) => a.localeCompare(b));
}

export default function ProfessionalBookings() {
  const { profile } = useUserProfile();
  const [bookings, setBookings] = useState([]);
  const [clientMap, setClientMap] = useState(new Map());
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [completingId, setCompletingId] = useState(null);

  const serviceMap = useMemo(
    () => new Map(services.map((s) => [s.$id, s.name])),
    [services]
  );

  useEffect(() => {
    if (!profile?.$id) return;

    async function load() {
      setLoading(true);
      setError("");

      const [bookingsRes, profilesRes, servicesRes] = await Promise.all([
        listBookingsForProfessionalSchedule(profile.$id),
        listUserProfiles(),
        listServicesCatalog(),
      ]);

      if (bookingsRes.success) {
        setBookings(bookingsRes.data);
      } else {
        setError(bookingsRes.error || "Erro ao carregar agendamentos.");
      }

      if (profilesRes.success) {
        const map = new Map();
        profilesRes.data.forEach((p) => {
          if (p.userId) {
            map.set(p.userId, p.nickName || p.name || p.email || p.userId);
          }
        });
        setClientMap(map);
      }

      if (servicesRes.success) setServices(servicesRes.data);

      setLoading(false);
    }

    load();
  }, [profile]);

  async function handleComplete(bookingId) {
    setCompletingId(bookingId);
    const res = await updateBookingStatus(bookingId, "CONCLUIDO");
    setCompletingId(null);
    if (res.success) {
      setBookings((prev) =>
        prev.map((b) =>
          b.$id === bookingId ? { ...b, status: "CONCLUIDO" } : b
        )
      );
    }
  }

  const groups = useMemo(() => groupByDate(bookings), [bookings]);

  const totalConcluidos = useMemo(
    () => bookings.filter((b) => (b.status || "").toLowerCase() === "concluido"),
    [bookings]
  );

  const receitaRealizada = useMemo(
    () => totalConcluidos.reduce((sum, b) => sum + (Number(b.servicePrice) || 0), 0),
    [totalConcluidos]
  );

  return (
    <ProfessionalLayout>
      <header style={{ marginBottom: "32px" }}>
        <p style={{ color: "#d1b76b", textTransform: "uppercase", letterSpacing: "0.24em", marginBottom: "12px", fontSize: "11px" }}>
          Últimos 30 dias e futuros
        </p>
        <h1 style={{ fontSize: "clamp(2rem, 2.5vw, 3rem)", marginBottom: "12px", color: "#f6f2e8" }}>
          Clientes agendados
        </h1>
        <p style={{ maxWidth: "700px", lineHeight: 1.75, color: "#beb7a3", margin: 0 }}>
          Seus agendamentos por dia. Marque o atendimento como concluído ao finalizar.
        </p>
      </header>

      {/* Card receita realizada */}
      {totalConcluidos.length > 0 && (
        <div
          style={{
            display: "flex",
            gap: "20px",
            marginBottom: "36px",
            flexWrap: "wrap",
          }}
        >
          <div
            style={{
              padding: "20px 24px",
              borderRadius: "14px",
              background: "rgba(16,185,129,0.08)",
              border: "1px solid rgba(16,185,129,0.25)",
              display: "flex",
              alignItems: "center",
              gap: "14px",
            }}
          >
            <span className="material-symbols-outlined" style={{ color: "#10b981", fontSize: "24px" }}>
              payments
            </span>
            <div>
              <p style={{ margin: 0, fontSize: "11px", color: "#10b981", textTransform: "uppercase", letterSpacing: "0.14em" }}>
                Receita realizada
              </p>
              <strong style={{ color: "#f6f2e8", fontSize: "1.4rem" }}>
                {formatCurrency(receitaRealizada)}
              </strong>
              <p style={{ margin: "2px 0 0", fontSize: "11px", color: "#6b9e8a" }}>
                {totalConcluidos.length} atendimento(s) concluído(s)
              </p>
            </div>
          </div>
        </div>
      )}

      {loading && <p style={{ color: "#beb7a3" }}>Carregando agendamentos…</p>}
      {error && <p style={{ color: "#e05252" }}>{error}</p>}
      {!loading && bookings.length === 0 && !error && (
        <p style={{ color: "#beb7a3" }}>Nenhum agendamento encontrado nos últimos 30 dias.</p>
      )}

      <div style={{ display: "grid", gap: "36px" }}>
        {groups.map(([dateKey, dayBookings]) => (
          <section key={dateKey}>
            <p style={{
              color: "#d1b76b",
              fontSize: "11px",
              textTransform: "uppercase",
              letterSpacing: "0.2em",
              margin: "0 0 14px",
              paddingBottom: "8px",
              borderBottom: "1px solid rgba(209,183,107,0.18)",
            }}>
              {formatDate(dayBookings[0]?.dateIso || dayBookings[0]?.date)}
            </p>

            <div style={{ display: "grid", gap: "14px" }}>
              {dayBookings.map((booking) => {
                const clientName = clientMap.get(booking.userId) || booking.userId || "Cliente";
                const status = (booking.status || "").toLowerCase();
                const isConcluido = status === "concluido";
                const statusColor = STATUS_COLOR[status] || "#beb7a3";
                const statusLabel = STATUS_LABEL[status] || booking.status || "—";
                const isCompleting = completingId === booking.$id;

                return (
                  <article
                    key={booking.$id}
                    style={{
                      padding: "20px 24px",
                      borderRadius: "16px",
                      border: isConcluido
                        ? "1px solid rgba(123,143,161,0.25)"
                        : "1px solid rgba(209,183,107,0.14)",
                      background: isConcluido
                        ? "rgba(255,255,255,0.015)"
                        : "rgba(255,255,255,0.03)",
                      display: "grid",
                      gridTemplateColumns: "64px 1fr auto",
                      gap: "16px",
                      alignItems: "center",
                      opacity: isConcluido ? 0.7 : 1,
                      transition: "opacity 0.2s",
                    }}
                  >
                    {/* Hora */}
                    <div style={{ textAlign: "center" }}>
                      <strong style={{ display: "block", color: isConcluido ? "#7b8fa1" : "#f2ca50", fontSize: "1.2rem", fontVariantNumeric: "tabular-nums" }}>
                        {booking.time || "—"}
                      </strong>
                    </div>

                    {/* Info */}
                    <div style={{ overflow: "hidden" }}>
                      <p style={{ margin: "0 0 4px", color: "#f6f2e8", fontWeight: 700, fontSize: "15px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {clientName}
                      </p>
                      <p style={{ margin: "0 0 2px", color: "#beb7a3", fontSize: "13px" }}>
                        {serviceMap.get(booking.serviceId) || booking.serviceName || "—"}
                      </p>
                      {booking.servicePrice != null && (
                        <p style={{ margin: 0, color: "#99907c", fontSize: "12px" }}>
                          {formatCurrency(booking.servicePrice)}
                        </p>
                      )}
                    </div>

                    {/* Status + ação */}
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "8px" }}>
                      <span style={{
                        display: "inline-block",
                        padding: "4px 12px",
                        borderRadius: "999px",
                        fontSize: "11px",
                        fontWeight: 600,
                        color: statusColor,
                        background: `${statusColor}18`,
                        border: `1px solid ${statusColor}40`,
                        whiteSpace: "nowrap",
                      }}>
                        {statusLabel}
                      </span>

                      {!isConcluido && (
                        <button
                          type="button"
                          disabled={isCompleting}
                          onClick={() => handleComplete(booking.$id)}
                          style={{
                            padding: "5px 12px",
                            borderRadius: "8px",
                            border: "1px solid rgba(16,185,129,0.4)",
                            background: isCompleting ? "rgba(16,185,129,0.05)" : "rgba(16,185,129,0.1)",
                            color: "#10b981",
                            fontSize: "11px",
                            fontWeight: 600,
                            cursor: isCompleting ? "not-allowed" : "pointer",
                            whiteSpace: "nowrap",
                            display: "flex",
                            alignItems: "center",
                            gap: "4px",
                          }}
                        >
                          <span className="material-symbols-outlined" style={{ fontSize: "14px" }}>
                            check_circle
                          </span>
                          {isCompleting ? "Salvando..." : "Marcar como atendido"}
                        </button>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
          </section>
        ))}
      </div>
    </ProfessionalLayout>
  );
}
