import { useEffect, useMemo, useState } from "react";
import AdminLayout from "./AdminLayout";
import {
  listTransactions,
  createTransaction,
  deleteTransaction,
  TRANSACTION_TYPES,
  EXPENSE_CATEGORIES,
  INCOME_CATEGORIES,
  getCategoryLabel,
} from "../../services/financialService";

function formatCurrency(value) {
  return Number(value).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

function formatDateBR(isoDate) {
  if (!isoDate) return "—";
  const [y, m, d] = isoDate.split("-");
  return `${d}/${m}/${y}`;
}

const EMPTY_FORM = {
  tipo: TRANSACTION_TYPES.SAIDA,
  categoria: EXPENSE_CATEGORIES[0].value,
  descricao: "",
  valor: "",
  data: new Date().toISOString().slice(0, 10),
  observacoes: "",
};

const cardStyle = {
  padding: "28px",
  borderRadius: "16px",
  background: "rgba(255,255,255,0.04)",
  border: "1px solid rgba(209,183,107,0.14)",
};

function SummaryCard({ icon, label, value, color }) {
  return (
    <div style={cardStyle}>
      <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px" }}>
        <span
          className="material-symbols-outlined"
          style={{ color: color || "#d1b76b", fontSize: "22px" }}
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
      <h2 style={{ margin: 0, color: color || "#f6f2e8", fontSize: "1.8rem" }}>
        {value}
      </h2>
    </div>
  );
}

const inputStyle = {
  width: "100%",
  padding: "10px 14px",
  borderRadius: "8px",
  border: "1px solid rgba(209,183,107,0.25)",
  background: "rgba(255,255,255,0.05)",
  color: "#f6f2e8",
  fontSize: "14px",
  outline: "none",
  boxSizing: "border-box",
};

const labelStyle = {
  display: "block",
  color: "#beb7a3",
  fontSize: "12px",
  textTransform: "uppercase",
  letterSpacing: "0.12em",
  marginBottom: "6px",
};

export default function AdminFinancial() {
  const now = new Date();
  const [filterYear, setFilterYear] = useState(now.getFullYear());
  const [filterMonth, setFilterMonth] = useState(now.getMonth() + 1);

  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  const [formSuccess, setFormSuccess] = useState("");
  const [deletingId, setDeletingId] = useState(null);

  const categories = useMemo(
    () =>
      form.tipo === TRANSACTION_TYPES.SAIDA ? EXPENSE_CATEGORIES : INCOME_CATEGORIES,
    [form.tipo]
  );

  async function load() {
    setLoading(true);
    const res = await listTransactions({ year: filterYear, month: filterMonth });
    if (res.success) setTransactions(res.data);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, [filterYear, filterMonth]);

  const { totalEntradas, totalSaidas, saldo } = useMemo(() => {
    let totalEntradas = 0;
    let totalSaidas = 0;
    transactions.forEach((t) => {
      if (t.tipo === TRANSACTION_TYPES.ENTRADA) totalEntradas += t.valor;
      else totalSaidas += t.valor;
    });
    return { totalEntradas, totalSaidas, saldo: totalEntradas - totalSaidas };
  }, [transactions]);

  function handleFormChange(field, value) {
    setForm((prev) => {
      const next = { ...prev, [field]: value };
      if (field === "tipo") {
        next.categoria =
          value === TRANSACTION_TYPES.SAIDA
            ? EXPENSE_CATEGORIES[0].value
            : INCOME_CATEGORIES[0].value;
      }
      return next;
    });
    setFormError("");
    setFormSuccess("");
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setFormError("");
    setFormSuccess("");
    setSubmitting(true);

    const res = await createTransaction({
      tipo: form.tipo,
      categoria: form.categoria,
      descricao: form.descricao,
      valor: form.valor,
      data: form.data,
      observacoes: form.observacoes,
    });

    setSubmitting(false);

    if (!res.success) {
      setFormError(res.error);
      return;
    }

    setFormSuccess("Transação registrada com sucesso!");
    setForm(EMPTY_FORM);
    load();
  }

  async function handleDelete(id) {
    if (!window.confirm("Deseja excluir esta transação?")) return;
    setDeletingId(id);
    const res = await deleteTransaction(id);
    setDeletingId(null);
    if (res.success) {
      setTransactions((prev) => prev.filter((t) => t.$id !== id));
    }
  }

  const years = [];
  for (let y = now.getFullYear(); y >= now.getFullYear() - 3; y--) years.push(y);

  const months = [
    { value: 1, label: "Janeiro" },
    { value: 2, label: "Fevereiro" },
    { value: 3, label: "Março" },
    { value: 4, label: "Abril" },
    { value: 5, label: "Maio" },
    { value: 6, label: "Junho" },
    { value: 7, label: "Julho" },
    { value: 8, label: "Agosto" },
    { value: 9, label: "Setembro" },
    { value: 10, label: "Outubro" },
    { value: 11, label: "Novembro" },
    { value: 12, label: "Dezembro" },
  ];

  return (
    <AdminLayout>
      <header className="atelier-admin-header">
        <div className="atelier-admin-header-content">
          <span className="atelier-admin-eyebrow">Gestão</span>
          <h1 className="atelier-admin-title">
            Controle <em>Financeiro</em>
          </h1>
          <p className="atelier-admin-subtitle">
            Registre entradas, saídas e acompanhe o saldo do negócio.
          </p>
        </div>
      </header>

      {/* Filtro de período */}
      <section style={{ marginBottom: "28px", display: "flex", gap: "16px", flexWrap: "wrap", alignItems: "flex-end" }}>
        <div>
          <label style={labelStyle}>Mês</label>
          <select
            value={filterMonth}
            onChange={(e) => setFilterMonth(Number(e.target.value))}
            style={{ ...inputStyle, width: "160px" }}
          >
            {months.map((m) => (
              <option key={m.value} value={m.value}>
                {m.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label style={labelStyle}>Ano</label>
          <select
            value={filterYear}
            onChange={(e) => setFilterYear(Number(e.target.value))}
            style={{ ...inputStyle, width: "100px" }}
          >
            {years.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </div>
      </section>

      {/* Cards de resumo */}
      <section
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "20px",
          marginBottom: "36px",
        }}
      >
        <SummaryCard
          icon="trending_up"
          label="Total de Entradas"
          value={formatCurrency(totalEntradas)}
          color="#10b981"
        />
        <SummaryCard
          icon="trending_down"
          label="Total de Saídas"
          value={formatCurrency(totalSaidas)}
          color="#f87171"
        />
        <SummaryCard
          icon="account_balance"
          label="Saldo do Período"
          value={formatCurrency(saldo)}
          color={saldo >= 0 ? "#10b981" : "#f87171"}
        />
      </section>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 2fr",
          gap: "28px",
          alignItems: "start",
        }}
      >
        {/* Formulário de nova transação */}
        <div style={cardStyle}>
          <p
            style={{
              color: "#d1b76b",
              textTransform: "uppercase",
              letterSpacing: "0.18em",
              fontSize: "11px",
              marginBottom: "20px",
              marginTop: 0,
            }}
          >
            Nova transação
          </p>

          <form onSubmit={handleSubmit} style={{ display: "grid", gap: "16px" }}>
            {/* Tipo */}
            <div>
              <label style={labelStyle}>Tipo</label>
              <div style={{ display: "flex", gap: "10px" }}>
                {[
                  { value: TRANSACTION_TYPES.SAIDA, label: "Saída (Gasto)" },
                  { value: TRANSACTION_TYPES.ENTRADA, label: "Entrada (Receita)" },
                ].map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => handleFormChange("tipo", opt.value)}
                    style={{
                      flex: 1,
                      padding: "8px 12px",
                      borderRadius: "8px",
                      border: "1px solid",
                      fontSize: "12px",
                      cursor: "pointer",
                      transition: "all 0.2s",
                      borderColor:
                        form.tipo === opt.value
                          ? opt.value === TRANSACTION_TYPES.ENTRADA
                            ? "#10b981"
                            : "#f87171"
                          : "rgba(255,255,255,0.1)",
                      background:
                        form.tipo === opt.value
                          ? opt.value === TRANSACTION_TYPES.ENTRADA
                            ? "rgba(16,185,129,0.15)"
                            : "rgba(248,113,113,0.15)"
                          : "transparent",
                      color:
                        form.tipo === opt.value
                          ? opt.value === TRANSACTION_TYPES.ENTRADA
                            ? "#10b981"
                            : "#f87171"
                          : "#99907c",
                    }}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Categoria */}
            <div>
              <label style={labelStyle}>Categoria</label>
              <select
                value={form.categoria}
                onChange={(e) => handleFormChange("categoria", e.target.value)}
                style={inputStyle}
                required
              >
                {categories.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Descrição */}
            <div>
              <label style={labelStyle}>Descrição</label>
              <input
                type="text"
                placeholder={
                  form.tipo === TRANSACTION_TYPES.SAIDA
                    ? "ex: Navalha descartável, Refrigerante lata..."
                    : "ex: Venda de produto, Comissão..."
                }
                value={form.descricao}
                onChange={(e) => handleFormChange("descricao", e.target.value)}
                style={inputStyle}
                required
              />
            </div>

            {/* Valor */}
            <div>
              <label style={labelStyle}>Valor (R$)</label>
              <input
                type="number"
                placeholder="0,00"
                min="0.01"
                step="0.01"
                value={form.valor}
                onChange={(e) => handleFormChange("valor", e.target.value)}
                style={inputStyle}
                required
              />
            </div>

            {/* Data */}
            <div>
              <label style={labelStyle}>Data</label>
              <input
                type="date"
                value={form.data}
                onChange={(e) => handleFormChange("data", e.target.value)}
                style={inputStyle}
                required
              />
            </div>

            {/* Observações */}
            <div>
              <label style={labelStyle}>Observações (opcional)</label>
              <input
                type="text"
                placeholder="Detalhes adicionais..."
                value={form.observacoes}
                onChange={(e) => handleFormChange("observacoes", e.target.value)}
                style={inputStyle}
              />
            </div>

            {formError && (
              <p style={{ color: "#f87171", fontSize: "13px", margin: 0 }}>
                {formError}
              </p>
            )}
            {formSuccess && (
              <p style={{ color: "#10b981", fontSize: "13px", margin: 0 }}>
                {formSuccess}
              </p>
            )}

            <button
              type="submit"
              disabled={submitting}
              style={{
                padding: "11px 20px",
                borderRadius: "8px",
                border: "none",
                background: submitting
                  ? "rgba(209,183,107,0.3)"
                  : "linear-gradient(135deg, #d1b76b, #f6e79d)",
                color: "#1a1a1a",
                fontWeight: "700",
                fontSize: "13px",
                cursor: submitting ? "not-allowed" : "pointer",
                letterSpacing: "0.06em",
              }}
            >
              {submitting ? "Registrando..." : "Registrar transação"}
            </button>
          </form>
        </div>

        {/* Lista de transações */}
        <div style={cardStyle}>
          <p
            style={{
              color: "#d1b76b",
              textTransform: "uppercase",
              letterSpacing: "0.18em",
              fontSize: "11px",
              marginBottom: "20px",
              marginTop: 0,
            }}
          >
            Transações do período
          </p>

          {loading ? (
            <p style={{ color: "#beb7a3", fontSize: "14px" }}>
              Carregando...
            </p>
          ) : transactions.length === 0 ? (
            <p style={{ color: "#99907c", fontSize: "14px" }}>
              Nenhuma transação registrada neste período.
            </p>
          ) : (
            <div style={{ display: "grid", gap: "10px" }}>
              {transactions.map((t) => {
                const isEntrada = t.tipo === TRANSACTION_TYPES.ENTRADA;
                return (
                  <div
                    key={t.$id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "12px 16px",
                      borderRadius: "10px",
                      background: "rgba(255,255,255,0.03)",
                      border: "1px solid rgba(255,255,255,0.05)",
                      gap: "12px",
                    }}
                  >
                    {/* Ícone + info */}
                    <div style={{ display: "flex", alignItems: "center", gap: "12px", minWidth: 0 }}>
                      <div
                        style={{
                          width: "36px",
                          height: "36px",
                          borderRadius: "8px",
                          background: isEntrada
                            ? "rgba(16,185,129,0.12)"
                            : "rgba(248,113,113,0.12)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                        }}
                      >
                        <span
                          className="material-symbols-outlined"
                          style={{
                            fontSize: "18px",
                            color: isEntrada ? "#10b981" : "#f87171",
                          }}
                        >
                          {isEntrada ? "add_circle" : "remove_circle"}
                        </span>
                      </div>
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
                          {t.descricao}
                        </p>
                        <p style={{ margin: "3px 0 0", fontSize: "11px", color: "#99907c" }}>
                          {getCategoryLabel(t.categoria)} · {formatDateBR(t.data)}
                        </p>
                        {t.observacoes && (
                          <p style={{ margin: "2px 0 0", fontSize: "11px", color: "#6b6359", fontStyle: "italic" }}>
                            {t.observacoes}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Valor + excluir */}
                    <div style={{ display: "flex", alignItems: "center", gap: "12px", flexShrink: 0 }}>
                      <span
                        style={{
                          fontSize: "14px",
                          fontWeight: "700",
                          color: isEntrada ? "#10b981" : "#f87171",
                        }}
                      >
                        {isEntrada ? "+" : "-"} {formatCurrency(t.valor)}
                      </span>
                      <button
                        type="button"
                        disabled={deletingId === t.$id}
                        onClick={() => handleDelete(t.$id)}
                        style={{
                          background: "none",
                          border: "none",
                          cursor: deletingId === t.$id ? "not-allowed" : "pointer",
                          padding: "4px",
                          color: "#6b6359",
                          display: "flex",
                          alignItems: "center",
                        }}
                        title="Excluir transação"
                      >
                        <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>
                          delete
                        </span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <div className="atelier-admin-quote" style={{ marginTop: "40px" }}>
        <p className="atelier-admin-quote-text">
          "Controlar as finanças é controlar o futuro do negócio."
        </p>
      </div>
    </AdminLayout>
  );
}
