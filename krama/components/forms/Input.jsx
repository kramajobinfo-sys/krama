import React from "react";

/** Text input with optional label, leading icon, hint and error states. */
export function Input({
  label, hint, error, iconLeft, size = "md", id,
  style = {}, containerStyle = {}, ...rest
}) {
  const [focus, setFocus] = React.useState(false);
  const heights = { sm: 36, md: 44, lg: 52 };
  const h = heights[size] || heights.md;
  const inputId = id || (label ? "in-" + label.replace(/\s+/g, "-").toLowerCase() : undefined);

  const borderColor = error ? "var(--danger)" : focus ? "var(--border-focus)" : "var(--border-strong)";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6, ...containerStyle }}>
      {label && (
        <label htmlFor={inputId} style={{ fontSize: "var(--text-sm)", fontWeight: 600, color: "var(--text-strong)" }}>
          {label}
        </label>
      )}
      <div style={{
        display: "flex", alignItems: "center", gap: 8,
        height: h, padding: "0 14px",
        background: rest.disabled ? "var(--surface-sunken)" : "var(--surface-card)",
        border: "1px solid " + borderColor,
        borderRadius: "var(--radius-md)",
        boxShadow: focus && !error ? "var(--focus-ring)" : "none",
        transition: "border-color var(--dur-fast), box-shadow var(--dur-fast)",
      }}>
        {iconLeft && <span style={{ display: "inline-flex", color: "var(--text-faint)" }}>{iconLeft}</span>}
        <input
          id={inputId}
          onFocus={() => setFocus(true)}
          onBlur={() => setFocus(false)}
          style={{
            flex: 1, border: "none", outline: "none", background: "transparent",
            fontFamily: "var(--font-sans)", fontSize: "var(--text-base)", color: "var(--text-strong)",
            minWidth: 0, ...style,
          }}
          {...rest}
        />
      </div>
      {(hint || error) && (
        <span style={{ fontSize: "var(--text-xs)", color: error ? "var(--danger)" : "var(--text-muted)" }}>
          {error || hint}
        </span>
      )}
    </div>
  );
}
