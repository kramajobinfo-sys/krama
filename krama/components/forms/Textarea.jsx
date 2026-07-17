import React from "react";

/** Multi-line text field. Shares the Input visual language. */
export function Textarea({ label, hint, error, rows = 4, id, style = {}, containerStyle = {}, ...rest }) {
  const [focus, setFocus] = React.useState(false);
  const inputId = id || (label ? "ta-" + label.replace(/\s+/g, "-").toLowerCase() : undefined);
  const borderColor = error ? "var(--danger)" : focus ? "var(--border-focus)" : "var(--border-strong)";
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6, ...containerStyle }}>
      {label && (
        <label htmlFor={inputId} style={{ fontSize: "var(--text-sm)", fontWeight: 600, color: "var(--text-strong)" }}>
          {label}
        </label>
      )}
      <textarea
        id={inputId}
        rows={rows}
        onFocus={() => setFocus(true)}
        onBlur={() => setFocus(false)}
        style={{
          resize: "vertical", padding: "11px 14px",
          background: rest.disabled ? "var(--surface-sunken)" : "var(--surface-card)",
          border: "1px solid " + borderColor, borderRadius: "var(--radius-md)",
          boxShadow: focus && !error ? "var(--focus-ring)" : "none",
          fontFamily: "var(--font-sans)", fontSize: "var(--text-base)", color: "var(--text-strong)",
          lineHeight: "var(--leading-normal)", outline: "none",
          transition: "border-color var(--dur-fast), box-shadow var(--dur-fast)",
          ...style,
        }}
        {...rest}
      />
      {(hint || error) && (
        <span style={{ fontSize: "var(--text-xs)", color: error ? "var(--danger)" : "var(--text-muted)" }}>
          {error || hint}
        </span>
      )}
    </div>
  );
}
