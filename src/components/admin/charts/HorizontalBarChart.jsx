/**
 * Barra horizontal em lista, com gradiente de accent configurável.
 * Default dourado para manter identidade visual do admin.
 */
export default function HorizontalBarChart({
  data,
  valueKey,
  labelKey,
  formatValue,
  accentFrom = "#d1b76b",
  accentTo = "#f6e79d",
}) {
  if (!data.length) {
    return <p style={{ color: "#99907c", fontSize: "14px" }}>Nenhum dado disponível.</p>;
  }
  const max = Math.max(...data.map((d) => d[valueKey] || 0), 1);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
      {data.map((item, i) => {
        const pct = Math.max(((item[valueKey] || 0) / max) * 100, item[valueKey] > 0 ? 3 : 0);
        return (
          <div key={item[labelKey] || i} style={{ display: "grid", gap: "6px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "8px" }}>
              <span style={{ fontSize: "12px", color: "#beb7a3", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1 }}>
                {item[labelKey]}
              </span>
              <strong style={{ fontSize: "12px", color: accentFrom, flexShrink: 0 }}>
                {formatValue ? formatValue(item[valueKey]) : item[valueKey]}
              </strong>
            </div>
            <div style={{ background: "rgba(255,255,255,0.07)", borderRadius: "999px", height: "6px" }}>
              <div
                style={{
                  width: `${pct}%`,
                  height: "6px",
                  borderRadius: "999px",
                  background: `linear-gradient(90deg, ${accentFrom}, ${accentTo})`,
                  transition: "width 0.6s ease",
                }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
