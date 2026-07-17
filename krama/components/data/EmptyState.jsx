import React from "react";

/** Friendly empty state for lists with no data yet. */
export function EmptyState({ icon, title, description, action, style = {} }) {
  return (
    <div style={{
      display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center",
      padding: "48px 24px", gap: 6, ...style,
    }}>
      {icon && (
        <span style={{
          display: "inline-flex", alignItems: "center", justifyContent: "center",
          width: 56, height: 56, borderRadius: "var(--radius-lg)",
          background: "var(--brand-subtle)", color: "var(--brand)", marginBottom: 6,
        }}>{icon}</span>
      )}
      <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "var(--text-lg)", color: "var(--text-strong)" }}>{title}</div>
      {description && <div style={{ fontSize: "var(--text-base)", color: "var(--text-muted)", maxWidth: 340, lineHeight: "var(--leading-normal)" }}>{description}</div>}
      {action && <div style={{ marginTop: 14 }}>{action}</div>}
    </div>
  );
}
