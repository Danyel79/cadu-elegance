import { useState } from "react";

/**
 * Gráfico de colunas verticais. O maior valor do período é destacado em
 * dourado claro, os demais em tom mais opaco — hover mostra tooltip.
 */
export default function ColumnChart({ data, valueKey, labelKey, formatValue, height = 180 }) {
  const [hoverIndex, setHoverIndex] = useState(null);

  if (!data.length) {
    return <p style={{ color: "#99907c", fontSize: "14px" }}>Nenhum dado disponível.</p>;
  }

  const max = Math.max(...data.map((d) => d[valueKey] || 0), 1);
  const peakValue = Math.max(...data.map((d) => d[valueKey] || 0));

  return (
    <div>
      <div
        style={{
          display: "flex",
          alignItems: "flex-end",
          gap: "10px",
          height: `${height}px`,
          padding: "0 4px",
        }}
      >
        {data.map((item, i) => {
          const value = item[valueKey] || 0;
          const pct = Math.max((value / max) * 100, value > 0 ? 4 : 1);
          const isPeak = value === peakValue && value > 0;
          const isHover = hoverIndex === i;
          return (
            <div
              key={item[labelKey] || i}
              onMouseEnter={() => setHoverIndex(i)}
              onMouseLeave={() => setHoverIndex(null)}
              style={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "flex-end",
                height: "100%",
                gap: "8px",
                position: "relative",
                cursor: "default",
              }}
            >
              {isHover && (
                <div
                  style={{
                    position: "absolute",
                    bottom: `calc(${pct}% + 12px)`,
                    padding: "4px 8px",
                    borderRadius: "6px",
                    background: "#1c1b1b",
                    border: "1px solid rgba(209,183,107,0.3)",
                    color: "#f6f2e8",
                    fontSize: "11px",
                    fontWeight: "700",
                    whiteSpace: "nowrap",
                    zIndex: 1,
                  }}
                >
                  {formatValue ? formatValue(value) : value}
                </div>
              )}
              <div
                style={{
                  width: "100%",
                  maxWidth: "36px",
                  height: `${pct}%`,
                  minHeight: "3px",
                  borderRadius: "6px 6px 2px 2px",
                  background: isPeak
                    ? "linear-gradient(180deg, #f6e79d, #d1b76b)"
                    : "linear-gradient(180deg, rgba(209,183,107,0.55), rgba(209,183,107,0.28))",
                  opacity: hoverIndex === null || isHover ? 1 : 0.6,
                  transition: "height 0.5s ease, opacity 0.2s ease",
                }}
              />
            </div>
          );
        })}
      </div>
      <div style={{ display: "flex", gap: "10px", padding: "8px 4px 0" }}>
        {data.map((item, i) => (
          <span
            key={item[labelKey] || i}
            style={{
              flex: 1,
              textAlign: "center",
              fontSize: "10px",
              color: hoverIndex === i ? "#d1b76b" : "#99907c",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {item[labelKey]}
          </span>
        ))}
      </div>
    </div>
  );
}
