/**
 * Seletor tipo abas usado para trocar período (Painel) ou métrica (Análises).
 * options: [{ value, label }]
 */
export default function SegmentedControl({ options, value, onChange }) {
  return (
    <div
      style={{
        display: "inline-flex",
        gap: "4px",
        padding: "4px",
        borderRadius: "999px",
        background: "rgba(255,255,255,0.04)",
        border: "1px solid rgba(255,255,255,0.08)",
      }}
    >
      {options.map((opt) => {
        const isActive = opt.value === value;
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            style={{
              padding: "8px 16px",
              borderRadius: "999px",
              border: "none",
              cursor: "pointer",
              fontSize: "12px",
              fontWeight: "700",
              letterSpacing: "0.04em",
              color: isActive ? "#131313" : "#beb7a3",
              background: isActive ? "linear-gradient(90deg, #d1b76b, #f6e79d)" : "transparent",
              transition: "all 0.2s ease",
            }}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
