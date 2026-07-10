import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import AdminLayout from "./AdminLayout";
import {
  listAllBookings,
  listProfessionals,
  listServicesCatalog,
} from "../../services/adminDataService";
import { listAllProductsAdmin } from "../../services/storeService";
import KpiCard from "../../components/admin/charts/KpiCard";
import DonutChart from "../../components/admin/charts/DonutChart";
import SegmentedControl from "../../components/admin/charts/SegmentedControl";
import LineChart from "../../components/admin/charts/LineChart";
import { isThisMonth, isLastMonth } from "../../utils/adminPeriod";

const STATUS_COLORS = {
  CONCLUIDO: "#10b981",
  AGENDADO: "#d1b76b",
  CANCELADO: "#f87171",
};

const STATUS_LABELS = {
  CONCLUIDO: "Concluído",
  AGENDADO: "Agendado",
  CANCELADO: "Cancelado",
};

const PROF_COLORS = [
  "#d1b76b", "#60a5fa", "#a78bfa", "#34d399",
  "#f87171", "#fbbf24", "#e879f9", "#2dd4bf",
];

const PERIOD_OPTIONS = [
  { value: "current", label: "Mês atual" },
  { value: "last", label: "Mês anterior" },
  { value: "all", label: "Todo o período" },
];

function formatCurrency(value) {
  return Number(value).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

export default function AdminDashboard() {
  const [bookings, setBookings] = useState([]);
  const [professionals, setProfessionals] = useState([]);
  const [products, setProducts] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState("current");

  useEffect(() => {
    async function load() {
      setLoading(true);
      const [bookRes, profRes, prodRes, svcRes] = await Promise.all([
        listAllBookings(),
        listProfessionals(),
        listAllProductsAdmin(),
        listServicesCatalog(),
      ]);
      if (bookRes.success) setBookings(bookRes.data);
      if (profRes.success) setProfessionals(profRes.data);
      if (prodRes.success) setProducts(prodRes.data);
      if (svcRes.success) setServices(svcRes.data);
      setLoading(false);
    }
    load();
  }, []);

  const thisMonthBookings = useMemo(
    () => bookings.filter((b) => isThisMonth(b.dateIso)),
    [bookings]
  );

  const lastMonthBookings = useMemo(
    () => bookings.filter((b) => isLastMonth(b.dateIso)),
    [bookings]
  );

  const periodBookings = useMemo(() => {
    if (period === "current") return thisMonthBookings;
    if (period === "last") return lastMonthBookings;
    return bookings;
  }, [period, bookings, thisMonthBookings, lastMonthBookings]);

  const servicePriceMap = useMemo(
    () => new Map(services.map((s) => [s.$id, Number(s.price) || 0])),
    [services]
  );

  const thisMonthRevenue = useMemo(
    () =>
      thisMonthBookings
        .filter((b) => (b.status || "").toUpperCase() === "CONCLUIDO")
        .reduce((sum, b) => {
          const p = Number(b.servicePrice ?? servicePriceMap.get(b.serviceId) ?? 0);
          return sum + (Number.isNaN(p) ? 0 : p);
        }, 0),
    [thisMonthBookings, servicePriceMap]
  );

  const lastMonthRevenue = useMemo(
    () =>
      lastMonthBookings
        .filter((b) => (b.status || "").toUpperCase() === "CONCLUIDO")
        .reduce((sum, b) => {
          const p = Number(b.servicePrice ?? servicePriceMap.get(b.serviceId) ?? 0);
          return sum + (Number.isNaN(p) ? 0 : p);
        }, 0),
    [lastMonthBookings, servicePriceMap]
  );

  const periodRevenue = useMemo(
    () =>
      periodBookings
        .filter((b) => (b.status || "").toUpperCase() === "CONCLUIDO")
        .reduce((sum, b) => {
          const p = Number(b.servicePrice ?? servicePriceMap.get(b.serviceId) ?? 0);
          return sum + (Number.isNaN(p) ? 0 : p);
        }, 0),
    [periodBookings, servicePriceMap]
  );

  const periodFutureRevenue = useMemo(
    () =>
      periodBookings
        .filter((b) => (b.status || "").toUpperCase() !== "CONCLUIDO")
        .reduce((sum, b) => {
          const p = Number(b.servicePrice ?? servicePriceMap.get(b.serviceId) ?? 0);
          return sum + (Number.isNaN(p) ? 0 : p);
        }, 0),
    [periodBookings, servicePriceMap]
  );

  const profMap = useMemo(
    () => new Map(professionals.map((p) => [p.$id, p.nickName || p.$id])),
    [professionals]
  );

  const serviceMap = useMemo(
    () => new Map(services.map((s) => [s.$id, s.name || s.$id])),
    [services]
  );

  const professionalStats = useMemo(() => {
    // Começa com todos os profissionais cadastrados (inclusive com 0 agendamentos)
    const stats = {};
    professionals.forEach((p) => {
      stats[p.$id] = {
        id: p.$id,
        name: p.nickName || p.professionalLabel || "Profissional",
        bookings: 0,
        revenue: 0,
      };
    });
    // Soma os agendamentos do período selecionado
    periodBookings.forEach((b) => {
      const pid = b.professionalProfileId || "desconhecido";
      if (!stats[pid]) {
        stats[pid] = {
          id: pid,
          name: profMap.get(pid) || b.professionalLabel || pid,
          bookings: 0,
          revenue: 0,
        };
      }
      stats[pid].bookings += 1;
      const p = Number(b.servicePrice ?? servicePriceMap.get(b.serviceId) ?? 0);
      stats[pid].revenue += Number.isNaN(p) ? 0 : p;
    });
    return Object.values(stats).sort((a, b) => b.bookings - a.bookings);
  }, [periodBookings, professionals, profMap, servicePriceMap]);

  const revenueByProfessional = useMemo(
    () => professionalStats.filter((p) => p.revenue > 0),
    [professionalStats]
  );

  const statusStats = useMemo(() => {
    const stats = {};
    periodBookings.forEach((b) => {
      const status = (b.status || "").toUpperCase() || "AGENDADO";
      stats[status] = (stats[status] || 0) + 1;
    });
    return Object.entries(stats).map(([status, count]) => ({
      status,
      count,
    }));
  }, [periodBookings]);

  const weeklyTrend = useMemo(() => {
    const days = [];
    const today = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const iso = d.toISOString().slice(0, 10);
      const label = d.toLocaleDateString("pt-BR", { weekday: "short" }).replace(".", "").toUpperCase();
      days.push({ iso, label, revenue: 0, bookings: 0 });
    }
    const dayMap = new Map(days.map((d) => [d.iso, d]));
    bookings.forEach((b) => {
      const iso = b.dateIso ? new Date(b.dateIso).toISOString().slice(0, 10) : null;
      const entry = iso && dayMap.get(iso);
      if (!entry) return;
      entry.bookings += 1;
      if ((b.status || "").toUpperCase() === "CONCLUIDO") {
        const p = Number(b.servicePrice ?? servicePriceMap.get(b.serviceId) ?? 0);
        entry.revenue += Number.isNaN(p) ? 0 : p;
      }
    });
    return days;
  }, [bookings, servicePriceMap]);

  const last30DaysServiceStats = useMemo(() => {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - 30);
    const stats = {};
    bookings.forEach((b) => {
      const d = b.dateIso ? new Date(b.dateIso) : null;
      if (!d || d < cutoff) return;
      const sid = b.serviceId || "outro";
      if (!stats[sid]) {
        stats[sid] = { id: sid, name: serviceMap.get(sid) || b.serviceName || "Serviço", count: 0 };
      }
      stats[sid].count += 1;
    });
    return Object.values(stats).sort((a, b) => b.count - a.count);
  }, [bookings, serviceMap]);

  const todayServiceStats = useMemo(() => {
    const todayIso = new Date().toISOString().slice(0, 10);
    const stats = {};
    bookings.forEach((b) => {
      const iso = b.dateIso ? new Date(b.dateIso).toISOString().slice(0, 10) : null;
      if (iso !== todayIso) return;
      const sid = b.serviceId || "outro";
      if (!stats[sid]) {
        stats[sid] = { id: sid, name: serviceMap.get(sid) || b.serviceName || "Serviço", count: 0 };
      }
      stats[sid].count += 1;
    });
    return Object.values(stats).sort((a, b) => b.count - a.count);
  }, [bookings, serviceMap]);

  const revenueDelta = thisMonthRevenue - lastMonthRevenue;

  const lowStockProducts = products.filter(
    (p) => p.active && Number(p.stock) < 5
  );
  const activeProducts = products.filter((p) => p.active);

  const cardStyle = {
    padding: "28px",
    borderRadius: "16px",
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(209,183,107,0.14)",
  };

  const quickActions = [
    {
      to: "/admin/store",
      icon: "storefront",
      title: "Loja Virtual",
      desc: "Cadastre produtos, gerencie estoque e imagens",
      tag: "Loja",
    },
    {
      to: "/store",
      icon: "shopping_bag",
      title: "Ver Loja",
      desc: "Visualize a loja como o cliente vê",
      tag: "Preview",
    },
  ];

  return (
    <AdminLayout>
      <header className="atelier-admin-header">
        <div className="atelier-admin-header-content">
          <span className="atelier-admin-eyebrow">Controle Mestre</span>
          <h1 className="atelier-admin-title">
            Painel <em>Administrativo</em>
          </h1>
          <p className="atelier-admin-subtitle">
            Supervisione operações, compare desempenhos e tome decisões
            estratégicas com clareza.
          </p>
        </div>
      </header>

      {loading ? (
        <p style={{ color: "#beb7a3", padding: "12px 0" }}>
          Carregando métricas...
        </p>
      ) : (
        <>
          {/* KPI Cards */}
          <section style={{ marginBottom: "36px" }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: "12px",
                marginBottom: "16px",
              }}
            >
              <p
                style={{
                  color: "#d1b76b",
                  textTransform: "uppercase",
                  letterSpacing: "0.18em",
                  fontSize: "11px",
                  margin: 0,
                }}
              >
                Resumo do período
              </p>
              <SegmentedControl options={PERIOD_OPTIONS} value={period} onChange={setPeriod} />
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(220px, 280px))",
                gap: "20px",
                alignItems: "start",
              }}
            >
              <KpiCard
                icon="request_quote"
                label="Receita Estimada"
                value={formatCurrency(periodRevenue + periodFutureRevenue)}
                sub="realizada + futura no período"
              />
              <KpiCard
                icon="payments"
                label="Receita Realizada"
                value={formatCurrency(periodRevenue)}
                sub={period === "current" ? `mês anterior: ${formatCurrency(lastMonthRevenue)}` : "agendamentos concluídos"}
                delta={
                  period === "current" && lastMonthRevenue
                    ? `${((revenueDelta / lastMonthRevenue) * 100).toFixed(1)}%`
                    : null
                }
              />
              <KpiCard
                icon="pending_actions"
                label="Receita Futura"
                value={formatCurrency(periodFutureRevenue)}
                sub="agendamentos pendentes"
              />
            </div>
          </section>

          {/* Visão geral interativa */}
          <section style={{ marginBottom: "36px" }}>
            <p
              style={{
                color: "#d1b76b",
                textTransform: "uppercase",
                letterSpacing: "0.18em",
                fontSize: "11px",
                marginBottom: "16px",
              }}
            >
              Visão geral — clique em um segmento para filtrar
            </p>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(300px, 460px))",
                gap: "24px",
                alignItems: "start",
              }}
            >
              <div style={cardStyle}>
                <p
                  style={{
                    color: "#beb7a3",
                    margin: "0 0 6px",
                    fontSize: "11px",
                    textTransform: "uppercase",
                    letterSpacing: "0.16em",
                  }}
                >
                  Distribuição de faturamento
                </p>
                <h3 style={{ margin: "0 0 20px", color: "#f6f2e8", fontSize: "16px" }}>
                  Receita por profissional
                </h3>
                <DonutChart
                  size={140}
                  data={revenueByProfessional.map((p, i) => ({
                    id: p.id,
                    label: p.name,
                    value: p.revenue,
                    displayValue: formatCurrency(p.revenue),
                    color: PROF_COLORS[i % PROF_COLORS.length],
                  }))}
                  centerLabel={
                    <div style={{ textAlign: "center" }}>
                      <p style={{ margin: 0, color: "#99907c", fontSize: "9px", textTransform: "uppercase", letterSpacing: "0.1em" }}>Total</p>
                      <strong style={{ color: "#f6f2e8", fontSize: "12px" }}>
                        {formatCurrency(revenueByProfessional.reduce((s, p) => s + p.revenue, 0))}
                      </strong>
                    </div>
                  }
                />
              </div>
              <div style={cardStyle}>
                <p
                  style={{
                    color: "#beb7a3",
                    margin: "0 0 6px",
                    fontSize: "11px",
                    textTransform: "uppercase",
                    letterSpacing: "0.16em",
                  }}
                >
                  Saúde da agenda
                </p>
                <h3 style={{ margin: "0 0 20px", color: "#f6f2e8", fontSize: "16px" }}>
                  Status dos agendamentos
                </h3>
                <DonutChart
                  size={140}
                  data={statusStats.map((s) => ({
                    label: STATUS_LABELS[s.status] || s.status,
                    value: s.count,
                    displayValue: `${s.count}x`,
                    color: STATUS_COLORS[s.status] || "#99907c",
                  }))}
                  centerLabel={
                    <div style={{ textAlign: "center" }}>
                      <p style={{ margin: 0, color: "#99907c", fontSize: "9px", textTransform: "uppercase", letterSpacing: "0.1em" }}>Total</p>
                      <strong style={{ color: "#f6f2e8", fontSize: "12px" }}>{periodBookings.length}</strong>
                    </div>
                  }
                />
              </div>
            </div>
          </section>

          {/* Crescimento */}
          <section style={{ marginBottom: "36px" }}>
            <p
              style={{
                color: "#d1b76b",
                textTransform: "uppercase",
                letterSpacing: "0.18em",
                fontSize: "11px",
                marginBottom: "16px",
              }}
            >
              Correlação de crescimento — últimos 7 dias
            </p>
            <div style={cardStyle}>
              <p
                style={{
                  color: "#beb7a3",
                  margin: "0 0 6px",
                  fontSize: "11px",
                  textTransform: "uppercase",
                  letterSpacing: "0.16em",
                }}
              >
                Receita vs. agendamentos
              </p>
              <h3 style={{ margin: "0 0 20px", color: "#f6f2e8", fontSize: "16px" }}>
                Tendência de crescimento
              </h3>
              <LineChart
                data={weeklyTrend}
                series={[
                  { key: "revenue", label: "Receita", color: "#d1b76b", formatValue: formatCurrency },
                  { key: "bookings", label: "Agendamentos", color: "#99907c", dashed: true, formatValue: (v) => `${v}` },
                ]}
              />
            </div>
          </section>

          {/* Loja & serviços recentes */}
          <section style={{ marginBottom: "36px" }}>
            <p
              style={{
                color: "#d1b76b",
                textTransform: "uppercase",
                letterSpacing: "0.18em",
                fontSize: "11px",
                marginBottom: "16px",
              }}
            >
              Loja & serviços
            </p>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
                gap: "24px",
                alignItems: "start",
              }}
            >
            {/* Loja */}
            <div style={cardStyle}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  marginBottom: "20px",
                }}
              >
                <span
                  className="material-symbols-outlined"
                  style={{ color: "#d1b76b", fontSize: "22px" }}
                >
                  storefront
                </span>
                <p
                  style={{
                    color: "#beb7a3",
                    margin: 0,
                    fontSize: "11px",
                    textTransform: "uppercase",
                    letterSpacing: "0.16em",
                  }}
                >
                  Loja Virtual
                </p>
              </div>
              <div style={{ display: "grid", gap: "14px" }}>
                <div>
                  <h2
                    style={{ margin: 0, color: "#f6f2e8", fontSize: "1.8rem" }}
                  >
                    {activeProducts.length}
                  </h2>
                  <p style={{ color: "#99907c", fontSize: "12px", margin: "4px 0 0" }}>
                    produtos ativos
                  </p>
                </div>
                {lowStockProducts.length > 0 && (
                  <div
                    style={{
                      padding: "10px 14px",
                      borderRadius: "8px",
                      background: "rgba(251,191,36,0.08)",
                      border: "1px solid rgba(251,191,36,0.2)",
                      display: "flex",
                      gap: "8px",
                      alignItems: "center",
                    }}
                  >
                    <span
                      className="material-symbols-outlined"
                      style={{ color: "#fbbf24", fontSize: "16px" }}
                    >
                      warning
                    </span>
                    <p style={{ color: "#fbbf24", margin: 0, fontSize: "12px" }}>
                      {lowStockProducts.length} produto(s) com estoque baixo
                    </p>
                  </div>
                )}
              </div>
              <div
                style={{
                  display: "flex",
                  gap: "10px",
                  marginTop: "20px",
                  flexWrap: "wrap",
                }}
              >
                <Link
                  to="/admin/store"
                  style={{
                    fontSize: "12px",
                    color: "#d1b76b",
                    textDecoration: "none",
                    fontWeight: "600",
                  }}
                >
                  Gerenciar →
                </Link>
                <Link
                  to="/store"
                  style={{
                    fontSize: "12px",
                    color: "#99907c",
                    textDecoration: "none",
                  }}
                >
                  Ver loja
                </Link>
              </div>
            </div>

            {/* Serviços — últimos 30 dias */}
            <div style={cardStyle}>
              <p
                style={{
                  color: "#beb7a3",
                  margin: "0 0 6px",
                  fontSize: "11px",
                  textTransform: "uppercase",
                  letterSpacing: "0.16em",
                }}
              >
                Últimos 30 dias — renova automaticamente
              </p>
              <h3 style={{ margin: "0 0 20px", color: "#f6f2e8", fontSize: "16px" }}>
                Serviços mais procurados
              </h3>
              <DonutChart
                size={130}
                data={last30DaysServiceStats.map((s, i) => ({
                  label: s.name,
                  value: s.count,
                  displayValue: `${s.count}x`,
                  color: PROF_COLORS[i % PROF_COLORS.length],
                }))}
                centerLabel={
                  <div style={{ textAlign: "center" }}>
                    <p style={{ margin: 0, color: "#99907c", fontSize: "9px", textTransform: "uppercase", letterSpacing: "0.1em" }}>Total</p>
                    <strong style={{ color: "#f6f2e8", fontSize: "12px" }}>
                      {last30DaysServiceStats.reduce((s, x) => s + x.count, 0)}
                    </strong>
                  </div>
                }
              />
            </div>

            {/* Serviços — hoje */}
            <div style={cardStyle}>
              <p
                style={{
                  color: "#beb7a3",
                  margin: "0 0 6px",
                  fontSize: "11px",
                  textTransform: "uppercase",
                  letterSpacing: "0.16em",
                }}
              >
                Agenda de hoje
              </p>
              <h3 style={{ margin: "0 0 20px", color: "#f6f2e8", fontSize: "16px" }}>
                Serviços do dia
              </h3>
              <DonutChart
                size={130}
                data={todayServiceStats.map((s, i) => ({
                  label: s.name,
                  value: s.count,
                  displayValue: `${s.count}x`,
                  color: PROF_COLORS[i % PROF_COLORS.length],
                }))}
                centerLabel={
                  <div style={{ textAlign: "center" }}>
                    <p style={{ margin: 0, color: "#99907c", fontSize: "9px", textTransform: "uppercase", letterSpacing: "0.1em" }}>Hoje</p>
                    <strong style={{ color: "#f6f2e8", fontSize: "12px" }}>
                      {todayServiceStats.reduce((s, x) => s + x.count, 0)}
                    </strong>
                  </div>
                }
              />
            </div>
            </div>
          </section>
        </>
      )}

      {/* Quick Actions */}
      <section style={{ marginBottom: "36px" }}>
        <p
          style={{
            color: "#d1b76b",
            textTransform: "uppercase",
            letterSpacing: "0.18em",
            fontSize: "11px",
            marginBottom: "16px",
          }}
        >
          Acesso rápido
        </p>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(260px, 340px))",
            gap: "20px",
            alignItems: "start",
          }}
        >
          {quickActions.map((action) => (
            <Link
              key={action.to}
              to={action.to}
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "12px",
                padding: "24px",
                borderRadius: "12px",
                border: "1px solid rgba(255,255,255,0.05)",
                background: "#1c1b1b",
                textDecoration: "none",
                color: "inherit",
                transition: "all 0.3s ease",
                boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "rgba(242,202,80,0.3)";
                e.currentTarget.style.boxShadow =
                  "0 16px 48px rgba(242,202,80,0.1)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "rgba(255,255,255,0.05)";
                e.currentTarget.style.boxShadow =
                  "0 8px 32px rgba(0,0,0,0.3)";
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <div
                  style={{
                    width: "40px",
                    height: "40px",
                    borderRadius: "10px",
                    background: "rgba(242,202,80,0.1)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <span
                    className="material-symbols-outlined"
                    style={{ color: "#f2ca50", fontSize: "20px" }}
                  >
                    {action.icon}
                  </span>
                </div>
                <div>
                  <h3
                    style={{
                      fontFamily: "'Noto Serif', serif",
                      fontSize: "16px",
                      color: "#e5e2e1",
                      margin: 0,
                    }}
                  >
                    {action.title}
                  </h3>
                  <p
                    style={{
                      color: "#d0c5af",
                      fontSize: "12px",
                      margin: "4px 0 0",
                    }}
                  >
                    {action.desc}
                  </p>
                </div>
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <span
                  style={{
                    fontSize: "10px",
                    fontWeight: "600",
                    textTransform: "uppercase",
                    letterSpacing: "0.12em",
                    color: "#99907c",
                  }}
                >
                  {action.tag}
                </span>
                <span
                  className="material-symbols-outlined"
                  style={{ color: "#99907c", fontSize: "18px" }}
                >
                  arrow_forward
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <div className="atelier-admin-quote">
        <p className="atelier-admin-quote-text">
          "No mundo do luxo, a perfeição não é um objetivo, mas um padrão."
        </p>
      </div>
    </AdminLayout>
  );
}
