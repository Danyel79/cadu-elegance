export default function KpiCard({ label, value, sub, icon, delta }) {
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
        <span className="material-symbols-outlined" style={{ color: "#d1b76b", fontSize: "22px" }}>
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
      <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
        {delta != null && (
          <span
            style={{
              fontSize: "12px",
              fontWeight: "700",
              color: isUp ? "#10b981" : isDown ? "#f87171" : "#99907c",
            }}
          >
            {isUp ? "▲" : isDown ? "▼" : "—"} {Math.abs(delta)}
          </span>
        )}
        {sub && <p style={{ color: "#99907c", margin: 0, fontSize: "12px" }}>{sub}</p>}
      </div>
    </div>
  );
}
