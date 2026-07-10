import { useState } from "react";

/**
 * Donut chart interativo: hover realça o segmento (tooltip com valor/%),
 * clique dispara onSegmentClick para o pai reagir (ex.: filtrar uma lista).
 */
export default function DonutChart({ data, size = 140, centerLabel, onSegmentClick }) {
  const [hoverIndex, setHoverIndex] = useState(null);
  const total = data.reduce((s, d) => s + (d.value || 0), 0);
  if (!total) {
    return <p style={{ color: "#99907c", fontSize: "14px" }}>Nenhum dado disponível.</p>;
  }
  const sw = Math.round(size * 0.14);
  const hoverSw = sw + 4;
  const r = (size - hoverSw) / 2;
  const cx = size / 2;
  const cy = size / 2;
  const C = 2 * Math.PI * r;
  const segments = data.reduce((list, d) => {
    const f = d.value / total;
    const acc = list.length ? list[list.length - 1].acc + list[list.length - 1].f : 0;
    list.push({ ...d, f, acc });
    return list;
  }, []);

  return (
    <div style={{ display: "flex", gap: "20px", alignItems: "center", flexWrap: "wrap" }}>
      <div style={{ position: "relative", width: size, height: size, flexShrink: 0 }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ transform: "rotate(-90deg)", overflow: "visible" }}>
          <circle cx={cx} cy={cy} r={r} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth={sw} />
          {segments.map((seg, i) => {
            const isHover = hoverIndex === i;
            return (
              <circle
                key={i}
                cx={cx}
                cy={cy}
                r={r}
                fill="none"
                stroke={seg.color}
                strokeWidth={isHover ? hoverSw : sw}
                strokeOpacity={hoverIndex === null || isHover ? 1 : 0.45}
                strokeDasharray={`${seg.f * C} ${C}`}
                strokeDashoffset={C * (1 - seg.acc)}
                style={{ cursor: onSegmentClick ? "pointer" : "default", transition: "stroke-width 0.2s ease, stroke-opacity 0.2s ease" }}
                onMouseEnter={() => setHoverIndex(i)}
                onMouseLeave={() => setHoverIndex(null)}
                onClick={() => onSegmentClick?.(seg)}
              />
            );
          })}
        </svg>
        <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "2px", pointerEvents: "none" }}>
          {hoverIndex !== null ? (
            <div style={{ textAlign: "center" }}>
              <p style={{ margin: 0, color: "#99907c", fontSize: "9px", textTransform: "uppercase", letterSpacing: "0.1em", maxWidth: `${size * 0.7}px`, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {segments[hoverIndex].label}
              </p>
              <strong style={{ color: "#f6f2e8", fontSize: "12px" }}>
                {segments[hoverIndex].displayValue || segments[hoverIndex].value}
              </strong>
              <p style={{ margin: 0, color: segments[hoverIndex].color, fontSize: "10px", fontWeight: "700" }}>
                {Math.round(segments[hoverIndex].f * 100)}%
              </p>
            </div>
          ) : (
            centerLabel
          )}
        </div>
      </div>
      <div style={{ display: "grid", gap: "8px", flex: 1, minWidth: "100px" }}>
        {segments.map((seg, i) => (
          <div
            key={i}
            onMouseEnter={() => setHoverIndex(i)}
            onMouseLeave={() => setHoverIndex(null)}
            onClick={() => onSegmentClick?.(seg)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              cursor: onSegmentClick ? "pointer" : "default",
              opacity: hoverIndex === null || hoverIndex === i ? 1 : 0.55,
              transition: "opacity 0.2s ease",
            }}
          >
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
