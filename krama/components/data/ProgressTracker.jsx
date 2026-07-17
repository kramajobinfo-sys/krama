import React from "react";

/** Horizontal stage tracker for the applicant/job pipeline. */
export function ProgressTracker({ steps = [], current = 0, style = {} }) {
  return (
    <div style={{ display: "flex", alignItems: "flex-start", ...style }}>
      {steps.map((step, i) => {
        const label = typeof step === "string" ? step : step.label;
        const done = i < current;
        const active = i === current;
        const isLast = i === steps.length - 1;
        const dotColor = done ? "var(--brand)" : active ? "var(--brand)" : "var(--stone-300)";
        return (
          <div key={i} style={{ flex: isLast ? "0 0 auto" : 1, display: "flex", flexDirection: "column", alignItems: "flex-start", position: "relative", minWidth: 0 }}>
            <div style={{ display: "flex", alignItems: "center", width: "100%" }}>
              <span style={{
                width: 26, height: 26, flexShrink: 0, borderRadius: "50%",
                background: done ? "var(--brand)" : "var(--surface-card)",
                border: "2px solid " + dotColor,
                display: "inline-flex", alignItems: "center", justifyContent: "center",
                color: done ? "#fff" : active ? "var(--brand)" : "var(--text-faint)",
                fontSize: 12, fontWeight: 700,
              }}>
                {done
                  ? <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                  : i + 1}
              </span>
              {!isLast && <span style={{ flex: 1, height: 2, background: done ? "var(--brand)" : "var(--border-strong)", margin: "0 8px" }} />}
            </div>
            <span style={{ marginTop: 8, fontSize: "var(--text-sm)", fontWeight: active ? 700 : 500, color: active || done ? "var(--text-strong)" : "var(--text-muted)", paddingRight: 12 }}>{label}</span>
          </div>
        );
      })}
    </div>
  );
}
