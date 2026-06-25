import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import AdminLayout from "./AdminLayout";
import {
  listAllBookings,
  listServicesCatalog,
  listProfessionals,
} from "../../services/adminDataService";

function formatCurrency(value) {
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

const PROF_COLORS = [
  "#d1b76b", "#60a5fa", "#a78bfa", "#34d399",
  "#f87171", "#fbbf24", "#e879f9", "#2dd4bf",
];

function ColumnChart({ data, valueKey, labelKey, color, formatValue }) {
  if (!data.length) return null;
  const max = Math.max(...data.map((d) => d[valueKey] || 0), 1);
  return (
    <div style={{ display: "flex", gap: "8px", alignItems: "flex-end", height: "140px", paddingBottom: "4px" }}>
      {data.map((item, i) => {
        const pct = Math.max(((item[valueKey] || 0) / max) * 100, 3);
        return (
          <div key={item[labelKey] || i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-end", height: "100%", gap: "4px" }}>
            <span style={{ fontSize: "10px", color: "#d1b76b", fontWeight: "700" }}>
              {formatValue ? formatValue(item[valueKey]) : item[valueKey]}
            </span>
            <div style={{ width: "100%", height: `${pct}%`, background: color || "#2563eb", borderRadius: "4px 4px 0 0", transition: "height 0.6s ease" }} />
            <p style={{ fontSize: "10px", color: "#beb7a3", margin: 0, textAlign: "center", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "100%", width: "100%" }}>
              {item[labelKey]}
            </p>
          </div>
        );
      })}
    </div>
  );
}

function DonutChart({ data, size = 140, centerLabel }) {
  const total = data.reduce((s, d) => s + (d.value || 0), 0);
  if (!total) return null;
  const sw = Math.round(size * 0.14);
  const r = (size - sw) / 2;
  const cx = size / 2;
  const cy = size / 2;
  const C = 2 * Math.PI * r;
  let acc = 0;
  const segments = data.map((d) => {
    const f = d.value / total;
    const seg = { ...d, f, acc };
    acc += f;
    return seg;
  });
  return (
    <div style={{ display: "flex", gap: "20px", alignItems: "center", flexWrap: "wrap" }}>
      <div style={{ position: "relative", width: size, height: size, flexShrink: 0 }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ transform: "rotate(-90deg)" }}>
          <circle cx={cx} cy={cy} r={r} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth={sw} />
          {segments.map((seg, i) => (
            <circle
              key={i}
              cx={cx} cy={cy} r={r}
              fill="none"
              stroke={seg.color}
              strokeWidth={sw}
              strokeDasharray={`${seg.f * C} ${C}`}
              strokeDashoffset={C * (1 - seg.acc)}
            />
          ))}
        </svg>
        {centerLabel && (
          <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "2px" }}>
            {centerLabel}
          </div>
        )}
      </div>
      <div style={{ display: "grid", gap: "8px", flex: 1, minWidth: "100px" }}>
        {segments.map((seg, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: seg.color, flexShrink: 0 }} />
            <span style={{ fontSize: "12px", color: "#beb7a3", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1 }}>
              {seg.label}
            </span>
            <span style={{ fontSize: "11px", color: "#f6f2e8", fontWeight: "700", flexShrink: 0 }}>
              {seg.displayValue || seg.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function formatDateLabel(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
  });
}

export default function AdminAnalytics() {
  const [bookings, setBookings] = useState([]);
  const [services, setServices] = useState([]);
  const [professionals, setProfessionals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [startDate, setStartDate] = useState(() => {
    const date = new Date();
    date.setDate(date.getDate() - 29);
    return date.toISOString().slice(0, 10);
  });
  const [endDate, setEndDate] = useState(() => new Date().toISOString().slice(0, 10));

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      setError("");

      const [bookingsRes, servicesRes, profsRes] = await Promise.all([
        listAllBookings(),
        listServicesCatalog(),
        listProfessionals(),
      ]);

      if (!bookingsRes.success) {
        setError(bookingsRes.error || "Erro ao carregar agendamentos.");
      } else {
        setBookings(bookingsRes.data);
      }

      if (!servicesRes.success) {
        setError((prev) => prev || servicesRes.error || "Erro ao carregar serviços.");
      } else {
        setServices(servicesRes.data);
      }

      if (profsRes.success) setProfessionals(profsRes.data);

      setLoading(false);
    }

    loadData();
  }, []);

  const servicesMap = useMemo(() => {
    return new Map(services.map((service) => [service.$id, service]));
  }, [services]);

  const filteredBookings = useMemo(() => {
    return bookings.filter((booking) => {
      const raw = booking.dateIso || booking.date;
      const iso = new Date(raw).toISOString().slice(0, 10);
      return (!startDate || iso >= startDate) && (!endDate || iso <= endDate);
    });
  }, [bookings, startDate, endDate]);

  const totalRevenue = useMemo(() => {
    return filteredBookings.reduce((sum, booking) => {
      const price = Number(booking.servicePrice ?? servicesMap.get(booking.serviceId)?.price ?? 0);
      return sum + (Number.isNaN(price) ? 0 : price);
    }, 0);
  }, [filteredBookings, servicesMap]);

  const bookingsByDate = useMemo(() => {
    const counts = {};
    filteredBookings.forEach((booking) => {
      const iso = new Date(booking.dateIso || booking.date).toISOString().slice(0, 10);
      counts[iso] = (counts[iso] || 0) + 1;
    });
    return Object.entries(counts)
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [filteredBookings]);

  const serviceStats = useMemo(() => {
    const stats = {};
    filteredBookings.forEach((booking) => {
      const serviceId = booking.serviceId || "sem-servico";
      const price = Number(booking.servicePrice ?? servicesMap.get(serviceId)?.price ?? 0);
      if (!stats[serviceId]) {
        stats[serviceId] = {
          serviceId,
          name: booking.serviceName || servicesMap.get(serviceId)?.name || "Serviço desconhecido",
          count: 0,
          revenue: 0,
        };
      }
      stats[serviceId].count += 1;
      stats[serviceId].revenue += Number.isNaN(price) ? 0 : price;
    });
    return Object.values(stats).sort((a, b) => b.count - a.count);
  }, [filteredBookings, servicesMap]);

  const busiestHours = useMemo(() => {
    const counts = {};
    filteredBookings.forEach((booking) => {
      const time = booking.time || "--:--";
      counts[time] = (counts[time] || 0) + 1;
    });
    return Object.entries(counts)
      .map(([time, count]) => ({ time, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }, [filteredBookings]);

  const totalDays = bookingsByDate.length;
  const averageBookings = totalDays ? (filteredBookings.length / totalDays).toFixed(1) : "0.0";

  const maxBookings = bookingsByDate.reduce((max, item) => Math.max(max, item.count), 1);

  const profMap = useMemo(
    () => new Map(professionals.map((p) => [p.$id, p.nickName || p.$id])),
    [professionals]
  );

  const professionalStats = useMemo(() => {
    const stats = {};
    filteredBookings.forEach((booking) => {
      const pid = booking.professionalProfileId || "sem-profissional";
      const price = Number(booking.servicePrice ?? 0);
      if (!stats[pid]) {
        stats[pid] = {
          id: pid,
          name: profMap.get(pid) || booking.professionalLabel || pid,
          bookings: 0,
          revenue: 0,
        };
      }
      stats[pid].bookings += 1;
      stats[pid].revenue += Number.isNaN(price) ? 0 : price;
    });
    return Object.values(stats).sort((a, b) => b.bookings - a.bookings);
  }, [filteredBookings, profMap]);

  const cardStyle = {
    padding: "28px",
    borderRadius: "20px",
    background: "rgba(255, 255, 255, 0.04)",
    border: "1px solid rgba(209, 183, 107, 0.14)",
  };

  return (
    <AdminLayout>
      <section style={{ padding: "24px 32px", color: "#f6f2e8" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "10px", maxWidth: "960px" }}>
          <p style={{ color: "#d1b76b", textTransform: "uppercase", letterSpacing: "0.24em", marginBottom: "8px" }}>
            Controle e desempenho
          </p>
          <h1 style={{ fontSize: "clamp(2rem, 2.5vw, 3rem)", margin: 0, color: "#f6f2e8" }}>
            Painel de Análises
          </h1>
          <p style={{ maxWidth: "700px", lineHeight: 1.75, color: "#beb7a3" }}>
            Acompanhe agendamentos, receita por serviço e horários mais demandados em um dashboard profissional.
          </p>
        </div>

        <div style={{ display: "flex", flexWrap: "wrap", gap: "18px", marginTop: "30px" }}>
          <div style={{ ...cardStyle, flex: "1 1 240px" }}>
            <p style={{ color: "#beb7a3", margin: 0, fontSize: "0.9rem", textTransform: "uppercase", letterSpacing: "0.12em" }}>
              Período
            </p>
            <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", marginTop: "14px" }}>
              <label style={{ display: "grid", gap: "6px", minWidth: "160px" }}>
                <span style={{ color: "#beb7a3" }}>Início</span>
                <input
                  type="date"
                  value={startDate}
                  onChange={(event) => setStartDate(event.target.value)}
                  style={inputStyle}
                />
              </label>
              <label style={{ display: "grid", gap: "6px", minWidth: "160px" }}>
                <span style={{ color: "#beb7a3" }}>Fim</span>
                <input
                  type="date"
                  value={endDate}
                  onChange={(event) => setEndDate(event.target.value)}
                  style={inputStyle}
                />
              </label>
            </div>
          </div>
          <div style={{ ...cardStyle, flex: "1 1 240px" }}>
            <p style={{ color: "#beb7a3", margin: 0, fontSize: "0.9rem", textTransform: "uppercase", letterSpacing: "0.12em" }}>
              Agendamentos
            </p>
            <h2 style={{ margin: "14px 0 0", color: "#f6f2e8", fontSize: "2.5rem" }}>{filteredBookings.length}</h2>
            <p style={{ color: "#99907c", marginTop: "10px" }}>Média de {averageBookings} agendamentos por dia no período.</p>
          </div>
          <div style={{ ...cardStyle, flex: "1 1 240px" }}>
            <p style={{ color: "#beb7a3", margin: 0, fontSize: "0.9rem", textTransform: "uppercase", letterSpacing: "0.12em" }}>
              Receita estimada
            </p>
            <h2 style={{ margin: "14px 0 0", color: "#f6f2e8", fontSize: "2.5rem" }}>{formatCurrency(totalRevenue)}</h2>
            <p style={{ color: "#99907c", marginTop: "10px" }}>Receita gerada por serviços vendidos.</p>
          </div>
        </div>

        {error && <p style={{ color: "#f18f01", marginTop: "20px" }}>{error}</p>}
        {loading ? (
          <p style={{ color: "#beb7a3", marginTop: "20px" }}>Carregando métricas...</p>
        ) : (
          <div style={{ display: "grid", gap: "24px", marginTop: "24px" }}>
            <div style={{ ...cardStyle, padding: "32px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: "12px", marginBottom: "20px" }}>
                <div>
                  <p style={{ color: "#beb7a3", margin: 0, fontSize: "0.85rem", textTransform: "uppercase", letterSpacing: "0.12em" }}>
                    Agendamentos por período
                  </p>
                  <h3 style={{ margin: "10px 0 0", color: "#f6f2e8" }}>Tendência diária</h3>
                </div>
                <span style={{ color: "#99907c", fontSize: "0.9rem" }}>{bookingsByDate.length} dias</span>
              </div>

              {bookingsByDate.length === 0 ? (
                <p style={{ color: "#beb7a3" }}>Nenhum agendamento encontrado no período selecionado.</p>
              ) : (
                <div style={{ display: "grid", gap: "14px" }}>
                  {bookingsByDate.map((item) => (
                    <div key={item.date} style={{ display: "grid", gap: "8px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", color: "#beb7a3", fontSize: "0.9rem" }}>
                        <span>{formatDateLabel(item.date)}</span>
                        <strong>{item.count}</strong>
                      </div>
                      <div style={{ background: "rgba(255,255,255,0.08)", borderRadius: "999px", minHeight: "10px" }}>
                        <div
                          style={{
                            width: `${Math.max((item.count / maxBookings) * 100, 6)}%`,
                            minHeight: "10px",
                            borderRadius: "999px",
                            background: "linear-gradient(90deg, #d1b76b, #f6e79d)",
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div style={{ display: "grid", gap: "24px", gridTemplateColumns: "2fr 1fr" }}>
              <div style={{ ...cardStyle, padding: "32px" }}>
                <div style={{ marginBottom: "20px" }}>
                  <p style={{ color: "#beb7a3", margin: 0, fontSize: "0.85rem", textTransform: "uppercase", letterSpacing: "0.12em" }}>
                    Receita por serviço
                  </p>
                  <h3 style={{ margin: "10px 0 0", color: "#f6f2e8" }}>Top serviços</h3>
                </div>

                {serviceStats.length === 0 ? (
                  <p style={{ color: "#beb7a3" }}>Nenhum serviço vendido no período.</p>
                ) : (
                  <div style={{ display: "grid", gap: "14px" }}>
                    {serviceStats.slice(0, 5).map((service) => (
                      <div key={service.serviceId} style={{ display: "flex", justifyContent: "space-between", gap: "12px", alignItems: "center" }}>
                        <div>
                          <p style={{ margin: 0, fontSize: "0.95rem", color: "#f6f2e8" }}>{service.name}</p>
                          <p style={{ margin: "6px 0 0", color: "#beb7a3", fontSize: "0.85rem" }}>{service.count} agendamentos</p>
                        </div>
                        <strong style={{ color: "#d1b76b" }}>{formatCurrency(service.revenue)}</strong>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div style={{ ...cardStyle, padding: "32px" }}>
                <p style={{ color: "#beb7a3", margin: 0, fontSize: "0.85rem", textTransform: "uppercase", letterSpacing: "0.12em" }}>
                  Horários mais demandados
                </p>
                <h3 style={{ margin: "10px 0 0", color: "#f6f2e8" }}>Top 5 horários</h3>
                {busiestHours.length === 0 ? (
                  <p style={{ color: "#beb7a3", marginTop: "16px" }}>Sem dados para o período.</p>
                ) : (
                  <ul style={{ marginTop: "18px", padding: 0, listStyle: "none", display: "grid", gap: "12px" }}>
                    {busiestHours.map((item) => (
                      <li key={item.time} style={{ display: "flex", justifyContent: "space-between", color: "#f6f2e8" }}>
                        <span>{item.time}</span>
                        <span style={{ color: "#d1b76b" }}>{item.count}x</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>

            {/* Comparativo por Profissional */}
            <div style={{ ...cardStyle, padding: "32px" }}>
              <p style={{ color: "#beb7a3", margin: 0, fontSize: "0.85rem", textTransform: "uppercase", letterSpacing: "0.12em" }}>
                Comparativo por profissional
              </p>
              <h3 style={{ margin: "10px 0 24px", color: "#f6f2e8" }}>Desempenho individual no período</h3>

              {professionalStats.length === 0 ? (
                <p style={{ color: "#beb7a3" }}>Nenhum dado de profissional no período selecionado.</p>
              ) : (
                <>
                  {/* Tabela resumo */}
                  <div style={{ overflowX: "auto", marginBottom: "28px" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
                      <thead>
                        <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
                          {["Profissional", "Agendamentos", "Receita", "Ticket Médio", "% do Total"].map((h) => (
                            <th key={h} style={{ padding: "10px 12px", textAlign: "left", color: "#99907c", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.08em", fontSize: "11px" }}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {professionalStats.map((prof) => {
                          const ticket = prof.bookings ? prof.revenue / prof.bookings : 0;
                          const pct = filteredBookings.length ? ((prof.bookings / filteredBookings.length) * 100).toFixed(1) : "0.0";
                          return (
                            <tr key={prof.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                              <td style={{ padding: "12px", color: "#f6f2e8", fontWeight: "600" }}>{prof.name}</td>
                              <td style={{ padding: "12px", color: "#beb7a3" }}>{prof.bookings}</td>
                              <td style={{ padding: "12px", color: "#d1b76b", fontWeight: "700" }}>{formatCurrency(prof.revenue)}</td>
                              <td style={{ padding: "12px", color: "#beb7a3" }}>{formatCurrency(ticket)}</td>
                              <td style={{ padding: "12px", color: "#99907c" }}>{pct}%</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  {/* Gráficos interativos */}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px", marginTop: "8px" }}>
                    <div style={{ padding: "20px", borderRadius: "14px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
                      <p style={{ color: "#60a5fa", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.12em", margin: "0 0 16px" }}>
                        Volume de agendamentos
                      </p>
                      <ColumnChart
                        data={professionalStats}
                        valueKey="bookings"
                        labelKey="name"
                        color="linear-gradient(180deg, #60a5fa 0%, #2563eb 100%)"
                        formatValue={(v) => String(v)}
                      />
                    </div>
                    <div style={{ padding: "20px", borderRadius: "14px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
                      <p style={{ color: "#d1b76b", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.12em", margin: "0 0 16px" }}>
                        Distribuição de faturamento
                      </p>
                      <DonutChart
                        size={130}
                        data={professionalStats.map((p, i) => ({
                          label: p.name,
                          value: p.revenue,
                          displayValue: formatCurrency(p.revenue),
                          color: PROF_COLORS[i % PROF_COLORS.length],
                        }))}
                        centerLabel={
                          <div style={{ textAlign: "center" }}>
                            <p style={{ margin: 0, color: "#99907c", fontSize: "9px", textTransform: "uppercase", letterSpacing: "0.1em" }}>Total</p>
                            <strong style={{ color: "#f6f2e8", fontSize: "12px" }}>
                              {formatCurrency(professionalStats.reduce((s, p) => s + p.revenue, 0))}
                            </strong>
                          </div>
                        }
                      />
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        <div style={{ marginTop: "28px" }}>
          <Link
            to="/admin"
            style={{
              color: "#d1b76b",
              textDecoration: "none",
              fontWeight: "600",
            }}
          >
            ← Voltar para painel administrativo
          </Link>
        </div>
      </section>
    </AdminLayout>
  );
}

const inputStyle = {
  width: "100%",
  padding: "12px 14px",
  borderRadius: "12px",
  border: "1px solid rgba(255, 255, 255, 0.12)",
  background: "rgba(255, 255, 255, 0.04)",
  color: "#f6f2e8",
  outline: "none",
};
