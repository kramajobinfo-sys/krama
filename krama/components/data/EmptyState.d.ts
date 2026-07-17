import * as React from "react";
export interface EmptyStateProps {
  /** Lucide icon element. */
  icon?: React.ReactNode;
  title: string;
  description?: string;
  /** Optional CTA element (e.g. a Button). */
  action?: React.ReactNode;
  style?: React.CSSProperties;
}
export function EmptyState(props: EmptyStateProps): JSX.Element;
