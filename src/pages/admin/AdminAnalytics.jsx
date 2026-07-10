import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import AdminLayout from "./AdminLayout";
import {
  listAllBookings,
  listServicesCatalog,
  listProfessionals,
  listUserProfiles,
} from "../../services/adminDataService";
import ColumnChart from "../../components/admin/charts/ColumnChart";
import LineChart from "../../components/admin/charts/LineChart";
import HorizontalBarChart from "../../components/admin/charts/HorizontalBarChart";
import SegmentedControl from "../../components/admin/charts/SegmentedControl";
import KpiCard from "../../components/admin/charts/KpiCard";
import { isThisMonth, isLastMonth } from "../../utils/adminPeriod";

function formatCurrency(value) {
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

const METRIC_OPTIONS = [
  { value: "count", label: "Agendamentos" },
  { value: "revenue", label: "Receita" },
  { value: "ticket", label: "Ticket médio" },
];

const METRIC_META = {
  count: { format: (v) => `${v}`, label: "Agendamentos" },
  revenue: { format: (v) => formatCurrency(v), label: "Receita" },
  ticket: { format: (v) => formatCurrency(v), label: "Ticket médio" },
};

const CHART_TYPE_OPTIONS = [
  { value: "column", label: "Coluna" },
  { value: "line", label: "Linha" },
];

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
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [startDate, setStartDate] = useState(() => {
    const date = new Date();
    date.setDate(date.getDate() - 29);
    return date.toISOString().slice(0, 10);
  });
  const [endDate, setEndDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [metric, setMetric] = useState("count");
  const [chartType, setChartType] = useState("column");

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      setError("");

      const [bookingsRes, servicesRes, profsRes, usersRes] = await Promise.all([
        listAllBookings(),
        listServicesCatalog(),
        listProfessionals(),
        listUserProfiles(),
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
      if (usersRes.success) setUsers(usersRes.data);

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

  const thisMonthBookings = useMemo(
    () => bookings.filter((b) => isThisMonth(b.dateIso || b.date)),
    [bookings]
  );

  const lastMonthBookings = useMemo(
    () => bookings.filter((b) => isLastMonth(b.dateIso || b.date)),
    [bookings]
  );

  const bookingDelta = thisMonthBookings.length - lastMonthBookings.length;

  const totalClients = useMemo(
    () =>
      users.filter((u) =>
        u.roles?.some((r) => String(r).toLowerCase() === "client")
      ).length,
    [users]
  );

  const bookingsByDate = useMemo(() => {
    const counts = {};
    filteredBookings.forEach((booking) => {
      const iso = new Date(booking.dateIso || booking.date).toISOString().slice(0, 10);
      const price = Number(booking.servicePrice ?? servicesMap.get(booking.serviceId)?.price ?? 0);
      if (!counts[iso]) counts[iso] = { date: iso, count: 0, revenue: 0 };
      counts[iso].count += 1;
      counts[iso].revenue += Number.isNaN(price) ? 0 : price;
    });
    return Object.values(counts)
      .map((item) => ({ ...item, ticket: item.count ? item.revenue / item.count : 0 }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [filteredBookings, servicesMap]);

  const chartData = useMemo(
    () =>
      bookingsByDate.map((item) => ({
        date: item.date,
        label: formatDateLabel(item.date),
        value: item[metric],
      })),
    [bookingsByDate, metric]
  );

  const serviceStats = useMemo(() => {
    const stats = {};
    filteredBookings.forEach((booking) => {
      const serviceId = booking.serviceId || "sem-servico";
      const price = Number(booking.servicePrice ?? servicesMap.get(serviceId)?.price ?? 0);
      if (!stats[serviceId]) {
        stats[serviceId] = {
          serviceId,
          name: servicesMap.get(serviceId)?.name || booking.serviceName || "Serviço desconhecido",
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

  const professionalStatsByRevenue = useMemo(
    () => [...professionalStats].sort((a, b) => b.revenue - a.revenue),
    [professionalStats]
  );

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

        <div style={{ display: "flex", flexWrap: "wrap", gap: "18px", marginTop: "30px", alignItems: "flex-start" }}>
          <div style={{ ...cardStyle, flex: "0 1 280px" }}>
            <p style={{ color: "#beb7a3", margin: 0, fontSize: "0.9rem", textTransform: "uppercase", letterSpacing: "0.12em" }}>
              Período
            </p>
            <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", marginTop: "14px" }}>
              <label style={{ display: "grid", gap: "6px", minWidth: "140px" }}>
                <span style={{ color: "#beb7a3" }}>Início</span>
                <input
                  type="date"
                  value={startDate}
                  onChange={(event) => setStartDate(event.target.value)}
                  style={inputStyle}
                />
              </label>
              <label style={{ display: "grid", gap: "6px", minWidth: "140px" }}>
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
          <div style={{ ...cardStyle, flex: "0 1 260px" }}>
            <p style={{ color: "#beb7a3", margin: 0, fontSize: "0.9rem", textTransform: "uppercase", letterSpacing: "0.12em" }}>
              Agendamentos no período
            </p>
            <h2 style={{ margin: "14px 0 0", color: "#f6f2e8", fontSize: "2.5rem" }}>{filteredBookings.length}</h2>
            <p style={{ color: "#99907c", marginTop: "10px" }}>Média de {averageBookings} por dia.</p>
          </div>
          <div style={{ flex: "0 1 260px" }}>
            <KpiCard
              icon="calendar_month"
              label="Agendamentos (mês atual)"
              value={thisMonthBookings.length}
              sub={`mês anterior: ${lastMonthBookings.length}`}
              delta={bookingDelta}
            />
          </div>
          <div style={{ flex: "0 1 260px" }}>
            <KpiCard
              icon="group"
              label="Clientes Cadastrados"
              value={totalClients}
              sub="total na plataforma"
            />
          </div>
          <div style={{ flex: "0 1 260px" }}>
            <KpiCard
              icon="content_cut"
              label="Profissionais"
              value={professionals.length}
              sub="equipe ativa"
            />
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
                <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
                  <SegmentedControl options={METRIC_OPTIONS} value={metric} onChange={setMetric} />
                  <SegmentedControl options={CHART_TYPE_OPTIONS} value={chartType} onChange={setChartType} />
                  <span style={{ color: "#99907c", fontSize: "0.9rem" }}>{bookingsByDate.length} dias</span>
                </div>
              </div>

              {bookingsByDate.length === 0 ? (
                <p style={{ color: "#beb7a3" }}>Nenhum agendamento encontrado no período selecionado.</p>
              ) : chartType === "column" ? (
                <ColumnChart
                  data={chartData}
                  valueKey="value"
                  labelKey="label"
                  formatValue={METRIC_META[metric].format}
                />
              ) : (
                <LineChart
                  data={chartData.map((d) => ({ label: d.label, [metric]: d.value }))}
                  series={[
                    { key: metric, label: METRIC_META[metric].label, color: "#d1b76b", formatValue: METRIC_META[metric].format },
                  ]}
                />
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

                  {/* Gráficos de barra */}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px", marginTop: "8px" }}>
                    <div style={{ padding: "20px", borderRadius: "14px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
                      <p style={{ color: "#d1b76b", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.12em", margin: "0 0 16px" }}>
                        Volume de agendamentos
                      </p>
                      <HorizontalBarChart
                        data={professionalStats}
                        valueKey="bookings"
                        labelKey="name"
                        formatValue={(v) => `${v} ag.`}
                      />
                    </div>
                    <div style={{ padding: "20px", borderRadius: "14px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
                      <p style={{ color: "#d1b76b", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.12em", margin: "0 0 16px" }}>
                        Receita por profissional
                      </p>
                      <HorizontalBarChart
                        data={professionalStatsByRevenue}
                        valueKey="revenue"
                        labelKey="name"
                        formatValue={(v) => formatCurrency(v)}
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
