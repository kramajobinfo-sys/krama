import React from "react";

/** Outlined/soft category chip — filter tokens, skill tags, job categories. */
export function Tag({ children, icon = null, removable = false, onRemove, active = false, style = {}, ...rest }) {
  const [hover, setHover] = React.useState(false);
  return (
    <span
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        display: "inline-flex", alignItems: "center", gap: 6,
        fontFamily: "var(--font-sans)", fontSize: "var(--text-sm)", fontWeight: 500,
        lineHeight: 1, padding: "6px 12px", borderRadius: "var(--radius-pill)",
        border: "1px solid " + (active ? "var(--brand)" : "var(--border-strong)"),
        background: active ? "var(--brand-subtle)" : hover ? "var(--surface-hover)" : "var(--surface-card)",
        color: active ? "var(--text-brand)" : "var(--text-body)",
        cursor: rest.onClick ? "pointer" : "default",
        transition: "background var(--dur-fast), border-color var(--dur-fast)",
        ...style,
      }}
      {...rest}
    >
      {icon}
      {children}
      {removable && (
        <span
          onClick={(e) => { e.stopPropagation(); onRemove && onRemove(); }}
          style={{ display: "inline-flex", cursor: "pointer", opacity: 0.6, marginRight: -2 }}
        >×</span>
      )}
    </span>
  );
}
