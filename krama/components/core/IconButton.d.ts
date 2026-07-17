import * as React from "react";
export interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** @default "ghost" */
  variant?: "ghost" | "secondary" | "primary" | "accent";
  /** @default "md" */
  size?: "sm" | "md" | "lg";
  /** Required for accessibility — describes the action. */
  "aria-label": string;
  children?: React.ReactNode;
}
export function IconButton(props: IconButtonProps): JSX.Element;
