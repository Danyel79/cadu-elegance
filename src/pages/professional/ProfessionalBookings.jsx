import { useEffect, useState, useMemo } from "react";
import { useUserProfile } from "../../hooks/useUserProfile";
import {
  listBookingsForProfessionalSchedule,
  listUserProfiles,
} from "../../services/adminDataService";
import ProfessionalLayout from "./ProfessionalLayout";

const STATUS_LABEL = {
  confirmado: "Confirmado",
  pendente: "Pendente",
  cancelado: "Cancelado",
  concluido: "Concluído",
};

const STATUS_COLOR = {
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!profile?.$id) return;

    async function load() {
      setLoading(true);
      setError("");

      const [bookingsRes, profilesRes] = await Promise.all([
        listBookingsForProfessionalSchedule(profile.$id),
        listUserProfiles(),
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

      setLoading(false);
    }

    load();
  }, [profile]);

  const groups = useMemo(() => groupByDate(bookings), [bookings]);

  return (
    <ProfessionalLayout>
      <header style={{ marginBottom: "42px" }}>
        <p style={{ color: "#d1b76b", textTransform: "uppercase", letterSpacing: "0.24em", marginBottom: "12px", fontSize: "11px" }}>
          A partir de hoje
        </p>
        <h1 style={{ fontSize: "clamp(2rem, 2.5vw, 3rem)", marginBottom: "12px", color: "#f6f2e8" }}>
          Clientes agendados
        </h1>
        <p style={{ maxWidth: "700px", lineHeight: 1.75, color: "#beb7a3", margin: 0 }}>
          Horários confirmados com você por dia, com nome do cliente e serviço.
        </p>
      </header>

      {loading && (
        <p style={{ color: "#beb7a3" }}>Carregando agendamentos…</p>
      )}
      {error && (
        <p style={{ color: "#e05252" }}>{error}</p>
      )}
      {!loading && bookings.length === 0 && !error && (
        <p style={{ color: "#beb7a3" }}>
          Nenhum agendamento encontrado a partir de hoje.
        </p>
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
                const statusColor = STATUS_COLOR[status] || "#beb7a3";
                const statusLabel = STATUS_LABEL[status] || booking.status || "—";

                return (
                  <article
                    key={booking.$id}
                    style={{
                      padding: "20px 24px",
                      borderRadius: "16px",
                      border: "1px solid rgba(209,183,107,0.14)",
                      background: "rgba(255,255,255,0.03)",
                      display: "grid",
                      gridTemplateColumns: "64px 1fr auto",
                      gap: "16px",
                      alignItems: "center",
                    }}
                  >
                    {/* Hora */}
                    <div style={{ textAlign: "center" }}>
                      <strong style={{ display: "block", color: "#f2ca50", fontSize: "1.2rem", fontVariantNumeric: "tabular-nums" }}>
                        {booking.time || "—"}
                      </strong>
                    </div>

                    {/* Info */}
                    <div style={{ overflow: "hidden" }}>
                      <p style={{ margin: "0 0 4px", color: "#f6f2e8", fontWeight: 700, fontSize: "15px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {clientName}
                      </p>
                      <p style={{ margin: "0 0 2px", color: "#beb7a3", fontSize: "13px" }}>
                        {booking.serviceName || "—"}
                      </p>
                      {booking.servicePrice != null && (
                        <p style={{ margin: 0, color: "#99907c", fontSize: "12px" }}>
                          R$ {Number(booking.servicePrice).toFixed(2).replace(".", ",")}
                        </p>
                      )}
                    </div>

                    {/* Status */}
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
