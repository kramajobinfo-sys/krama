import React from "react";

/** Small pill label for counts, categories, and metadata. */
export function Badge({ children, tone = "neutral", solid = false, style = {}, ...rest }) {
  const tones = {
    neutral: { bg: "var(--stone-100)", fg: "var(--stone-700)", solidBg: "var(--stone-700)" },
    brand: { bg: "var(--brand-subtle)", fg: "var(--text-brand)", solidBg: "var(--brand)" },
    accent: { bg: "var(--accent-subtle)", fg: "var(--saffron-700)", solidBg: "var(--accent)" },
    success: { bg: "var(--success-subtle)", fg: "var(--success)", solidBg: "var(--success)" },
    warning: { bg: "var(--warning-subtle)", fg: "var(--warning)", solidBg: "var(--warning)" },
    danger: { bg: "var(--danger-subtle)", fg: "var(--danger)", solidBg: "var(--danger)" },
    info: { bg: "var(--info-subtle)", fg: "var(--info)", solidBg: "var(--info)" },
  };
  const t = tones[tone] || tones.neutral;
  return (
    <span
      style={{
        display: "inline-flex", alignItems: "center", gap: 5,
        fontFamily: "var(--font-sans)", fontSize: "var(--text-xs)", fontWeight: 600,
        lineHeight: 1, padding: "4px 9px", borderRadius: "var(--radius-pill)",
        background: solid ? t.solidBg : t.bg,
        color: solid ? "#fff" : t.fg,
        ...style,
      }}
      {...rest}
    >
      {children}
    </span>
  );
}
