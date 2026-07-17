import React from "react";
import { Card } from "../core/Card.jsx";
import { Avatar } from "../core/Avatar.jsx";
import { Badge } from "../core/Badge.jsx";

/** Company directory card — logo, industry, location, open-roles count. */
export function CompanyCard({ name, logo, industry, location, openJobs = 0, verified = false, onClick, style = {} }) {
  return (
    <Card interactive onClick={onClick} padding={20} style={{ textAlign: "center", ...style }}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
        <Avatar src={logo} name={name} square size={64} />
        <div>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 6, justifyContent: "center" }}>
            <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "var(--text-md)", color: "var(--text-strong)" }}>{name}</span>
            {verified && (
              <span title="Verified" style={{ color: "var(--brand)", display: "inline-flex" }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="m9 12 2 2 4-4" fill="none" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"/><path d="M12 2 3.5 6v6c0 5 3.5 8 8.5 10 5-2 8.5-5 8.5-10V6L12 2Z" /></svg>
              </span>
            )}
          </div>
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
