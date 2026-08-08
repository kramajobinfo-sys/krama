import React from "react";
import { Card } from "../core/Card.jsx";
import { Avatar } from "../core/Avatar.jsx";
import { Badge } from "../core/Badge.jsx";

// Verified non-commercial organization types → a small trust pill shown next to the name.
const ORG_BADGE = {
  ngo:           { label: "NGO",           color: "#0e7490", bg: "rgba(14,116,144,.12)" },
  government:    { label: "Government",    color: "#4338ca", bg: "rgba(67,56,202,.12)" },
  education:     { label: "Education",     color: "#7c3aed", bg: "rgba(124,58,237,.12)" },
  international: { label: "International", color: "#0f766e", bg: "rgba(15,118,110,.12)" },
};
function OrgBadge({ orgType, style = {} }) {
  const m = orgType ? ORG_BADGE[orgType] : null;
  if (!m) return null;
  return (
    <span title={"Verified " + m.label} style={{ display: "inline-flex", alignItems: "center", padding: "2px 8px", borderRadius: 999, fontSize: 11, fontWeight: 700, background: m.bg, color: m.color, lineHeight: 1.6, whiteSpace: "nowrap", ...style }}>{m.label}</span>
  );
}

/** Company directory card — logo, industry, location, open-roles count. */
export function CompanyCard({ name, logo, industry, location, openJobs = 0, verified = false, orgType = null, onClick, style = {} }) {
  return (
    <Card interactive onClick={onClick} padding={20} style={{ textAlign: "center", ...style }}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
        <Avatar src={logo} name={name} square size={64} />
        <div>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 6, justifyContent: "center", flexWrap: "wrap" }}>
            <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "var(--text-md)", color: "var(--text-strong)" }}>{name}</span>
            {verified && (
              <span title="Verified" style={{ color: "var(--brand)", display: "inline-flex" }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="m9 12 2 2 4-4" fill="none" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"/><path d="M12 2 3.5 6v6c0 5 3.5 8 8.5 10 5-2 8.5-5 8.5-10V6L12 2Z" /></svg>
              </span>
            )}
          </div>
          {orgType && <div style={{ marginTop: 6 }}><OrgBadge orgType={orgType} /></div>}
          <div style={{ fontSize: "var(--text-sm)", color: "var(--text-muted)", marginTop: 3 }}>{industry}</div>
        </div>
        <div style={{ display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap" }}>
          {location && <Badge tone="neutral">{location}</Badge>}
          <Badge tone="brand">{openJobs} open {openJobs === 1 ? "role" : "roles"}</Badge>
        </div>
      </div>
    </Card>
  );
}
