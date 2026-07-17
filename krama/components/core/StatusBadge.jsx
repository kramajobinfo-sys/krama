import React from "react";

/**
 * Workflow status badge for jobs/companies/applications.
 * Maps a status key to the brand's status color pair + a leading dot.
 */
export function StatusBadge({ status = "draft", children, style = {}, ...rest }) {
  const map = {
    draft: { bg: "var(--status-draft-bg)", fg: "var(--status-draft-fg)", label: "Draft" },
    pending: { bg: "var(--status-pending-bg)", fg: "var(--status-pending-fg)", label: "Pending approval" },
    published: { bg: "var(--status-published-bg)", fg: "var(--status-published-fg)", label: "Published" },
    approved: { bg: "var(--status-published-bg)", fg: "var(--status-published-fg)", label: "Approved" },
    rejected: { bg: "var(--status-rejected-bg)", fg: "var(--status-rejected-fg)", label: "Rejected" },
    closed: { bg: "var(--status-closed-bg)", fg: "var(--status-closed-fg)", label: "Closed" },
    suspended: { bg: "var(--status-rejected-bg)", fg: "var(--status-rejected-fg)", label: "Suspended" },
  };
  const s = map[status] || map.draft;
  return (
    <span
      style={{
        display: "inline-flex", alignItems: "center", gap: 6,
        fontFamily: "var(--font-sans)", fontSize: "var(--text-xs)", fontWeight: 600,
        lineHeight: 1, padding: "5px 11px", borderRadius: "var(--radius-pill)",
        background: s.bg, color: s.fg, ...style,
      }}
      {...rest}
    >
      <span style={{ width: 7, height: 7, borderRadius: "50%", background: "currentColor" }} />
      {children || s.label}
    </span>
  );
}
