import * as React from "react";
export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** @default "neutral" */
  tone?: "neutral" | "brand" | "accent" | "success" | "warning" | "danger" | "info";
  /** Filled background instead of subtle. @default false */
  solid?: boolean;
  children?: React.ReactNode;
}
export function Badge(props: BadgeProps): JSX.Element;
