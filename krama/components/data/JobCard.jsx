import React from "react";
import { Card } from "../core/Card.jsx";
import { Badge } from "../core/Badge.jsx";
import { Avatar } from "../core/Avatar.jsx";
import { IconButton } from "../core/IconButton.jsx";

// Verified non-commercial organization types → a small trust pill shown next to the company.
const ORG_BADGE = {
  ngo:           { label: "NGO",           color: "#0e7490", bg: "rgba(14,116,144,.12)" },
  government:    { label: "Government",    color: "#4338ca", bg: "rgba(67,56,202,.12)" },
  education:     { label: "Education",     color: "#7c3aed", bg: "rgba(124,58,237,.12)" },
  international: { label: "International", color: "#0f766e", bg: "rgba(15,118,110,.12)" },
};
function OrgBadge({ orgType }) {
  const m = orgType ? ORG_BADGE[orgType] : null;
  if (!m) return null;
  return (
    <span title={"Verified " + m.label} style={{ display: "inline-flex", alignItems: "center", padding: "1px 7px", borderRadius: 999, fontSize: 10.5, fontWeight: 700, background: m.bg, color: m.color, lineHeight: 1.7, whiteSpace: "nowrap" }}>{m.label}</span>
  );
}

/**
 * Job listing card used across search results, featured grids, and dashboards.
 * Composes Card + Avatar + Badge.
 */
export function JobCard({
  title, company, logo, location, salary, type, remote = false,
  featured = false, postedAt, saved = false, orgType = null, onSave, onClick, style = {},
}) {
  return (
    <Card interactive featured={featured} onClick={onClick} padding={20} style={style}>
      <div style={{ display: "flex", gap: 14 }}>
        <Avatar src={logo} name={company} square size={48} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
            <div style={{ minWidth: 0 }}>
              <div style={{
                fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "var(--text-lg)",
                color: "var(--text-strong)", letterSpacing: "var(--tracking-snug)",
                whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
              }}>{title}</div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 2, minWidth: 0 }}>
                <span style={{ fontSize: "var(--text-sm)", color: "var(--text-muted)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{company}</span>
                <OrgBadge orgType={orgType} />
              </div>
            </div>
            <IconButton
              size="sm"
              aria-label={saved ? "Saved" : "Save job"}
              onClick={(e) => { e.stopPropagation(); onSave && onSave(); }}
              style={{ color: saved ? "var(--accent)" : "var(--text-faint)" }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill={saved ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>
            </IconButton>
          </div>

          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 14 }}>
            {type && <Badge tone="neutral">{type}</Badge>}
            {remote && <Badge tone="brand">Remote</Badge>}
            {featured && <Badge tone="accent">Featured</Badge>}
          </div>

          <div style={{
            display: "flex", flexWrap: "wrap", gap: 16, marginTop: 14,
            fontSize: "var(--text-sm)", color: "var(--text-muted)", alignItems: "center",
          }}>
            {location && <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
              {location}</span>}
            {salary && <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontWeight: 600, color: "var(--text-brand)" }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" x2="12" y1="2" y2="22"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
              {salary}</span>}
            {postedAt && <span style={{ marginLeft: "auto", color: "var(--text-faint)" }}>{postedAt}</span>}
          </div>
        </div>
      </div>
    </Card>
  );
}
