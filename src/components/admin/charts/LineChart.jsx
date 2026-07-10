import { useState } from "react";

/**
 * Gráfico de linha com múltiplas séries (cada uma normalizada ao próprio
 * máximo, já que costuma comparar métricas de unidades diferentes — ex.:
 * receita em R$ vs. nº de agendamentos). Fundo pontilhado, marcadores nos
 * pontos, tooltip com os valores reais ao passar o mouse.
 */
export default function LineChart({ data, series, height = 220 }) {
  const [hoverIndex, setHoverIndex] = useState(null);
  const width = 600;
  const padX = 8;
  const padY = 16;

  if (!data.length) {
    return <p style={{ color: "#99907c", fontSize: "14px" }}>Nenhum dado disponível.</p>;
  }

  const maxByKey = series.reduce((acc, s) => {
    acc[s.key] = Math.max(...data.map((d) => Number(d[s.key]) || 0), 1);
    return acc;
  }, {});

  const stepX = data.length > 1 ? (width - padX * 2) / (data.length - 1) : 0;

  const seriesPoints = series.map((s) => ({
    ...s,
    points: data.map((d, i) => {
      const value = Number(d[s.key]) || 0;
      const x = padX + stepX * i;
      const y = padY + (1 - value / maxByKey[s.key]) * (height - padY * 2);
      return { x, y, value };
    }),
  }));

  const gridLines = [0, 0.25, 0.5, 0.75, 1];

  return (
    <div>
      <svg width="100%" viewBox={`0 0 ${width} ${height}`} style={{ display: "block", overflow: "visible" }}>
        {gridLines.map((f) => (
          <line
            key={f}
            x1={0}
            x2={width}
            y1={padY + f * (height - padY * 2)}
            y2={padY + f * (height - padY * 2)}
            stroke="rgba(255,255,255,0.08)"
            strokeDasharray="2 4"
          />
        ))}

        {hoverIndex !== null && (
          <line
            x1={padX + stepX * hoverIndex}
            x2={padX + stepX * hoverIndex}
            y1={padY}
            y2={height - padY}
            stroke="rgba(209,183,107,0.25)"
          />
        )}

        {seriesPoints.map((s) => (
          <polyline
            key={s.key}
            points={s.points.map((p) => `${p.x},${p.y}`).join(" ")}
            fill="none"
            stroke={s.color}
            strokeWidth={2.5}
            strokeDasharray={s.dashed ? "6 5" : undefined}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        ))}

        {seriesPoints.map((s) =>
          s.points.map((p, i) => (
            <circle
              key={`${s.key}-${i}`}
              cx={p.x}
              cy={p.y}
              r={hoverIndex === i ? 5 : 3}
              fill={s.color}
              stroke="#131313"
              strokeWidth={1.5}
              style={{ transition: "r 0.15s ease" }}
            />
          ))
        )}

        {/* faixas invisíveis para detectar hover por índice */}
        {data.map((d, i) => (
          <rect
            key={i}
            x={padX + stepX * i - stepX / 2}
            y={0}
            width={stepX || width}
            height={height}
            fill="transparent"
            onMouseEnter={() => setHoverIndex(i)}
            onMouseLeave={() => setHoverIndex(null)}
          />
        ))}
      </svg>

      {hoverIndex !== null && (
        <div
          style={{
            display: "flex",
            gap: "16px",
            flexWrap: "wrap",
            marginTop: "8px",
            padding: "8px 12px",
            borderRadius: "8px",
            background: "#1c1b1b",
            border: "1px solid rgba(209,183,107,0.2)",
            fontSize: "12px",
          }}
        >
          <strong style={{ color: "#f6f2e8" }}>{data[hoverIndex].label}</strong>
          {series.map((s) => (
            <span key={s.key} style={{ color: s.color, display: "flex", alignItems: "center", gap: "6px" }}>
              <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: s.color, display: "inline-block" }} />
              {s.label}: {s.formatValue ? s.formatValue(data[hoverIndex][s.key]) : data[hoverIndex][s.key]}
            </span>
          ))}
        </div>
      )}

      <div style={{ display: "flex", gap: "10px", padding: "8px 4px 0" }}>
        {data.map((item, i) => (
          <span
            key={i}
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
            {item.label}
          </span>
        ))}
      </div>

      {!hoverIndex && series.length > 1 && (
        <div style={{ display: "flex", gap: "16px", marginTop: "10px" }}>
          {series.map((s) => (
            <span key={s.key} style={{ fontSize: "11px", color: "#beb7a3", display: "flex", alignItems: "center", gap: "6px" }}>
              <span
                style={{
                  width: "14px",
                  height: "2px",
                  background: s.color,
                  display: "inline-block",
                  ...(s.dashed ? { backgroundImage: `repeating-linear-gradient(90deg, ${s.color} 0 4px, transparent 4px 7px)`, background: "none" } : {}),
                }}
              />
              {s.label}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
