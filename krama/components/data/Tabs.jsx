import React from "react";

/** Underline tab bar. Controlled via `value`/`onChange`. */
export function Tabs({ tabs = [], value, onChange, style = {} }) {
  return (
    <div style={{ display: "flex", gap: 4, borderBottom: "1px solid var(--border)", ...style }}>
      {tabs.map((tab) => {
        const val = typeof tab === "string" ? tab : tab.value;
        const label = typeof tab === "string" ? tab : tab.label;
        const count = typeof tab === "string" ? null : tab.count;
        const active = val === value;
        return (
          <button
            key={val}
            onClick={() => onChange && onChange(val)}
            style={{
              position: "relative", border: "none", background: "transparent", cursor: "pointer",
              padding: "12px 14px", fontFamily: "var(--font-sans)", fontSize: "var(--text-base)",
              fontWeight: active ? 700 : 500, color: active ? "var(--text-brand)" : "var(--text-muted)",
              display: "inline-flex", alignItems: "center", gap: 8,
              transition: "color var(--dur-fast)",
            }}
          >
            {label}
            {count != null && (
              <span style={{
                fontSize: "var(--text-xs)", fontWeight: 600, padding: "1px 7px", borderRadius: "var(--radius-pill)",
                background: active ? "var(--brand-subtle)" : "var(--stone-100)",
                color: active ? "var(--text-brand)" : "var(--text-muted)",
              }}>{count}</span>
            )}
            {active && (
              <span style={{ position: "absolute", left: 8, right: 8, bottom: -1, height: 2.5, borderRadius: "2px 2px 0 0", background: "var(--brand)" }} />
            )}
          </button>
        );
      })}
    </div>
  );
}
