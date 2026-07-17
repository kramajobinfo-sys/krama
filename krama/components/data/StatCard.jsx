import React from "react";
import { Card } from "../core/Card.jsx";

/** KPI tile for dashboards. Icon + label + value + optional delta. */
export function StatCard({ label, value, icon, delta, deltaDir = "up", tone = "brand", style = {} }) {
  const tones = {
    brand: { bg: "var(--brand-subtle)", fg: "var(--brand)" },
    accent: { bg: "var(--accent-subtle)", fg: "var(--accent)" },
    success: { bg: "var(--success-subtle)", fg: "var(--success)" },
    warning: { bg: "var(--warning-subtle)", fg: "var(--warning)" },
    info: { bg: "var(--info-subtle)", fg: "var(--info)" },
    neutral: { bg: "var(--stone-100)", fg: "var(--stone-700)" },
  };
  const t = tones[tone] || tones.brand;
  const deltaColor = deltaDir === "down" ? "var(--danger)" : "var(--success)";
  return (
    <Card padding={20} style={style}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
        <div>
          <div style={{ fontSize: "var(--text-sm)", color: "var(--text-muted)", fontWeight: 500 }}>{label}</div>
          <div style={{
            fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "var(--text-3xl)",
            color: "var(--text-strong)", letterSpacing: "var(--tracking-tight)", marginTop: 6, lineHeight: 1,
          }}>{value}</div>
          {delta != null && (
            <div style={{ display: "inline-flex", alignItems: "center", gap: 4, marginTop: 10, fontSize: "var(--text-sm)", fontWeight: 600, color: deltaColor }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" style={{ transform: deltaDir === "down" ? "rotate(180deg)" : "none" }}><line x1="12" x2="12" y1="19" y2="5"/><polyline points="5 12 12 5 19 12"/></svg>
              {delta}
            </div>
          )}
        </div>
        {icon && (
          <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 44, height: 44, borderRadius: "var(--radius-md)", background: t.bg, color: t.fg, flexShrink: 0 }}>
            {icon}
          </span>
        )}
      </div>
    </Card>
  );
}
