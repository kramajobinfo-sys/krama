import React from "react";

/** Styled native select with label/hint/error, matching Input metrics. */
export function Select({ label, hint, error, options = [], placeholder, size = "md", id, style = {}, containerStyle = {}, ...rest }) {
  const [focus, setFocus] = React.useState(false);
  const heights = { sm: 36, md: 44, lg: 52 };
  const h = heights[size] || heights.md;
  const inputId = id || (label ? "sel-" + label.replace(/\s+/g, "-").toLowerCase() : undefined);
  const borderColor = error ? "var(--danger)" : focus ? "var(--border-focus)" : "var(--border-strong)";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6, ...containerStyle }}>
      {label && (
        <label htmlFor={inputId} style={{ fontSize: "var(--text-sm)", fontWeight: 600, color: "var(--text-strong)" }}>
          {label}
        </label>
      )}
      <div style={{ position: "relative" }}>
        <select
          id={inputId}
          onFocus={() => setFocus(true)}
          onBlur={() => setFocus(false)}
          style={{
            appearance: "none", WebkitAppearance: "none",
            width: "100%", height: h, padding: "0 38px 0 14px",
            background: rest.disabled ? "var(--surface-sunken)" : "var(--surface-card)",
            border: "1px solid " + borderColor, borderRadius: "var(--radius-md)",
            boxShadow: focus && !error ? "var(--focus-ring)" : "none",
            fontFamily: "var(--font-sans)", fontSize: "var(--text-base)",
            color: "var(--text-strong)", outline: "none", cursor: "pointer",
            transition: "border-color var(--dur-fast), box-shadow var(--dur-fast)", ...style,
          }}
          {...rest}
        >
          {placeholder && <option value="">{placeholder}</option>}
          {options.map((o) => {
            const val = typeof o === "string" ? o : o.value;
            const lab = typeof o === "string" ? o : o.label;
            return <option key={val} value={val}>{lab}</option>;
          })}
        </select>
        <span style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", pointerEvents: "none", color: "var(--text-faint)" }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
        </span>
      </div>
      {(hint || error) && (
        <span style={{ fontSize: "var(--text-xs)", color: error ? "var(--danger)" : "var(--text-muted)" }}>{error || hint}</span>
      )}
    </div>
  );
}
