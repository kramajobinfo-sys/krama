import React from "react";

/** Toggle switch for binary settings (e.g. "Open to remote"). */
export function Switch({ label, checked = false, onChange, disabled = false, style = {}, ...rest }) {
  return (
    <label style={{
      display: "inline-flex", alignItems: "center", gap: 10, cursor: disabled ? "not-allowed" : "pointer",
      opacity: disabled ? 0.55 : 1, fontFamily: "var(--font-sans)", fontSize: "var(--text-base)",
      color: "var(--text-body)", ...style,
    }}>
      <span
        onClick={() => !disabled && onChange && onChange(!checked)}
        style={{
          width: 40, height: 24, flexShrink: 0, borderRadius: "var(--radius-pill)",
          background: checked ? "var(--brand)" : "var(--stone-300)",
          position: "relative", transition: "background var(--dur-base) var(--ease-standard)",
        }}>
        <span style={{
          position: "absolute", top: 2, left: checked ? 18 : 2, width: 20, height: 20,
          borderRadius: "50%", background: "#fff", boxShadow: "var(--shadow-sm)",
          transition: "left var(--dur-base) var(--ease-standard)",
        }} />
      </span>
      {label}
    </label>
  );
}
