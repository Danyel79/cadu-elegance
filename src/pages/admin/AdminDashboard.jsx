import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import AdminLayout from "./AdminLayout";
import {
  listAllBookings,
  listProfessionals,
  listUserProfiles,
  listServicesCatalog,
} from "../../services/adminDataService";
import { listAllProductsAdmin } from "../../services/storeService";

function formatCurrency(value) {
  return Number(value).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

function isThisMonth(isoDate) {
  if (!isoDate) return false;
  const d = new Date(isoDate);
  const now = new Date();
  return (
    d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
  );
}

function isLastMonth(isoDate) {
  if (!isoDate) return false;
  const d = new Date(isoDate);
  const now = new Date();
  const last = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  return (
    d.getMonth() === last.getMonth() && d.getFullYear() === last.getFullYear()
  );
}

function BarChart({ data, valueKey, labelKey, formatValue }) {
  if (!data.length) {
    return <p style={{ color: "#99907c", fontSize: "14px" }}>Nenhum dado disponível.</p>;
  }
  const max = Math.max(...data.map((d) => d[valueKey] || 0), 1);
  return (
    <div style={{ display: "grid", gap: "14px" }}>
      {data.map((item, i) => (
        <div key={item[labelKey] || i} style={{ display: "grid", gap: "6px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", color: "#beb7a3", fontSize: "13px" }}>
            <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "65%" }}>
              {item[labelKey]}
            </span>
            <strong style={{ color: "#d1b76b", flexShrink: 0 }}>
              {formatValue ? formatValue(item[valueKey]) : item[valueKey]}
            </strong>
          </div>
          <div style={{ background: "rgba(255,255,255,0.08)", borderRadius: "999px", height: "8px" }}>
            <div
              style={{
                width: `${Math.max(((item[valueKey] || 0) / max) * 100, item[valueKey] > 0 ? 4 : 0)}%`,
                height: "8px",
                borderRadius: "999px",
                background: "linear-gradient(90deg, #d1b76b, #f6e79d)",
                transition: "width 0.5s ease",
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

function KpiCard({ label, value, sub, icon, delta }) {
  const isUp = delta > 0;
  const isDown = delta < 0;
  return (
    <div
      style={{
        padding: "28px",
        borderRadius: "16px",
        background: "rgba(255,255,255,0.04)",
        border: "1px solid rgba(209,183,107,0.14)",
        display: "flex",
        flexDirection: "column",
        gap: "12px",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        <span
          className="material-symbols-outlined"
          style={{ color: "#d1b76b", fontSize: "22px" }}
        >
          {icon}
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
          {label}
        </p>
      </div>
      <h2 style={{ margin: 0, color: "#f6f2e8", fontSize: "2rem" }}>{value}</h2>
      <div
        style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}
      >
        {delta != null && (
          <span
            style={{
              fontSize: "12px",
              fontWeight: "700",
              color: isUp ? "#10b981" : isDown ? "#f87171" : "#99907c",
            }}
          >
            {isUp ? "▲" : isDown ? "▼" : "—"}{" "}
            {Math.abs(delta)}
            {typeof delta === "number" && !String(delta).includes("%")
              ? ""
              : ""}
          </span>
        )}
        {sub && (
          <p style={{ color: "#99907c", margin: 0, fontSize: "12px" }}>{sub}</p>
        )}
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const [bookings, setBookings] = useState([]);
  const [professionals, setProfessionals] = useState([]);
  const [users, setUsers] = useState([]);
  const [products, setProducts] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const [bookRes, profRes, userRes, prodRes, svcRes] = await Promise.all([
        listAllBookings(),
        listProfessionals(),
        listUserProfiles(),
        listAllProductsAdmin(),
        listServicesCatalog(),
      ]);
      if (bookRes.success) setBookings(bookRes.data);
      if (profRes.success) setProfessionals(profRes.data);
      if (userRes.success) setUsers(userRes.data);
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

  const thisMonthFutureRevenue = useMemo(
    () =>
      thisMonthBookings
        .filter((b) => (b.status || "").toUpperCase() !== "CONCLUIDO")
        .reduce((sum, b) => {
          const p = Number(b.servicePrice ?? servicePriceMap.get(b.serviceId) ?? 0);
          return sum + (Number.isNaN(p) ? 0 : p);
        }, 0),
    [thisMonthBookings, servicePriceMap]
  );

  const totalClients = useMemo(
    () =>
      users.filter((u) =>
        u.roles?.some((r) => String(r).toLowerCase() === "client")
      ).length,
    [users]
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
    // Soma os agendamentos históricos
    bookings.forEach((b) => {
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
  }, [bookings, professionals, profMap, servicePriceMap]);

  const bookingDelta = thisMonthBookings.length - lastMonthBookings.length;
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
      to: "/admin/users",
      icon: "group",
      title: "Gestão de Clientes",
      desc: "Gerencie perfis de usuários e permissões",
      tag: "Registro",
    },
    {
      to: "/admin/staff",
      icon: "content_cut",
      title: "Equipe de Profissionais",
      desc: "Gerencie equipe, serviços e permissões",
      tag: "Equipe",
    },
    {
      to: "/admin/services/new",
      icon: "inventory_2",
      title: "Configuração de Serviços",
      desc: "Adicione e gerencie serviços de barbearia",
      tag: "Serviços",
    },
    {
      to: "/admin/analytics",
      icon: "insights",
      title: "Análises e Insights",
      desc: "Acompanhe performance e tendências detalhadas",
      tag: "Relatórios",
    },
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
            <p
              style={{
                color: "#d1b76b",
                textTransform: "uppercase",
                letterSpacing: "0.18em",
                fontSize: "11px",
                marginBottom: "16px",
              }}
            >
              Resumo do mês atual
            </p>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                gap: "20px",
              }}
            >
              <KpiCard
                icon="calendar_month"
                label="Agendamentos"
                value={thisMonthBookings.length}
                sub={`mês anterior: ${lastMonthBookings.length}`}
                delta={bookingDelta}
              />
              <KpiCard
                icon="payments"
                label="Receita Realizada"
                value={formatCurrency(thisMonthRevenue)}
                sub={`mês anterior: ${formatCurrency(lastMonthRevenue)}`}
                delta={
                  lastMonthRevenue
                    ? `${((revenueDelta / lastMonthRevenue) * 100).toFixed(1)}%`
                    : null
                }
              />
              <KpiCard
                icon="pending_actions"
                label="Receita Futura"
                value={formatCurrency(thisMonthFutureRevenue)}
                sub="agendamentos pendentes"
              />
              <KpiCard
                icon="group"
                label="Clientes Cadastrados"
                value={totalClients}
                sub="total na plataforma"
              />
              <KpiCard
                icon="content_cut"
                label="Profissionais"
                value={professionals.length}
                sub="equipe ativa"
              />
            </div>
          </section>

          {/* Comparativo de Profissionais */}
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
              Comparativo de profissionais — histórico geral
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
                Volume de agendamentos por profissional
              </p>
              <h3 style={{ margin: "0 0 20px", color: "#f6f2e8", fontSize: "16px" }}>
                Ranking de atendimentos
              </h3>
              <BarChart
                data={professionalStats}
                valueKey="bookings"
                labelKey="name"
                formatValue={(v) => `${v} agend.`}
              />
            </div>
          </section>

          {/* Loja + Últimos agendamentos */}
          <section
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 2fr",
              gap: "24px",
              marginBottom: "36px",
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

            {/* Últimos agendamentos */}
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
                Atividade recente
              </p>
              <h3
                style={{
                  margin: "0 0 20px",
                  color: "#f6f2e8",
                  fontSize: "16px",
                }}
              >
                Últimos agendamentos
              </h3>
              {bookings.length === 0 ? (
                <p style={{ color: "#99907c", fontSize: "14px" }}>
                  Nenhum agendamento encontrado.
                </p>
              ) : (
                <div style={{ display: "grid", gap: "12px" }}>
                  {bookings.slice(0, 6).map((b) => (
                    <div
                      key={b.$id}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        padding: "10px 14px",
                        borderRadius: "8px",
                        background: "rgba(255,255,255,0.03)",
                        gap: "12px",
                      }}
                    >
                      <div style={{ minWidth: 0 }}>
                        <p
                          style={{
                            margin: 0,
                            fontSize: "13px",
                            color: "#f6f2e8",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {serviceMap.get(b.serviceId) || b.serviceName || "Serviço"}
                        </p>
                        <p
                          style={{
                            margin: "3px 0 0",
                            fontSize: "11px",
                            color: "#99907c",
                          }}
                        >
                          {profMap.get(b.professionalProfileId) || b.professionalLabel || "—"} · {b.date || "—"} {b.time || ""}
                        </p>
                      </div>
                      <div style={{ textAlign: "right", flexShrink: 0 }}>
                        {b.servicePrice ? (
                          <span
                            style={{
                              color: "#d1b76b",
                              fontSize: "13px",
                              fontWeight: "700",
                            }}
                          >
                            {formatCurrency(b.servicePrice)}
                          </span>
                        ) : null}
                        <p
                          style={{
                            margin: "3px 0 0",
                            fontSize: "10px",
                            color:
                              b.status === "AGENDADO" ? "#10b981" : "#99907c",
                          }}
                        >
                          {b.status || "—"}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              <Link
                to="/admin/analytics"
                style={{
                  display: "inline-block",
                  marginTop: "16px",
                  fontSize: "12px",
                  color: "#d1b76b",
                  textDecoration: "none",
                  fontWeight: "600",
                }}
              >
                Ver análise completa →
              </Link>
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
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: "20px",
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
