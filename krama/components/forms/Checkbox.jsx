import React from "react";

/** Checkbox with label. Controlled via `checked`/`onChange`. */
export function Checkbox({ label, checked = false, onChange, disabled = false, style = {}, ...rest }) {
  return (
    <label style={{
      display: "inline-flex", alignItems: "center", gap: 10, cursor: disabled ? "not-allowed" : "pointer",
      opacity: disabled ? 0.55 : 1, fontFamily: "var(--font-sans)", fontSize: "var(--text-base)",
      color: "var(--text-body)", ...style,
    }}>
      <span style={{
        width: 20, height: 20, flexShrink: 0, borderRadius: "var(--radius-sm)",
        border: "1.5px solid " + (checked ? "var(--brand)" : "var(--border-strong)"),
        background: checked ? "var(--brand)" : "var(--surface-card)",
        display: "inline-flex", alignItems: "center", justifyContent: "center",
        transition: "background var(--dur-fast), border-color var(--dur-fast)",
      }}>
        {checked && (
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
        )}
      </span>
      <input type="checkbox" checked={checked} disabled={disabled} onChange={onChange}
        style={{ position: "absolute", opacity: 0, width: 0, height: 0 }} {...rest} />
      {label}
    </label>
  );
}
