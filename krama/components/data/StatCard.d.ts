import * as React from "react";
export interface StatCardProps {
  label: string;
  value: React.ReactNode;
  /** Lucide icon element shown in the tinted square. */
  icon?: React.ReactNode;
  /** Delta text, e.g. "12%". Hidden when absent. */
  delta?: React.ReactNode;
  /** @default "up" */
  deltaDir?: "up" | "down";
  /** Icon tint. @default "brand" */
  tone?: "brand" | "accent" | "success" | "warning" | "info" | "neutral";
  style?: React.CSSProperties;
}
export function StatCard(props: StatCardProps): JSX.Element;
