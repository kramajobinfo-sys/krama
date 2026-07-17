import * as React from "react";
export interface StatusBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** Workflow state. @default "draft" */
  status?: "draft" | "pending" | "published" | "approved" | "rejected" | "closed" | "suspended";
  /** Override the default label text. */
  children?: React.ReactNode;
}
export function StatusBadge(props: StatusBadgeProps): JSX.Element;
