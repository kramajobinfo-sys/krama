import * as React from "react";

/**
 * Props for the Krama action button.
 * @startingPoint section="Core" subtitle="Primary, accent, secondary, ghost & danger buttons" viewport="700x460"
 */
export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Visual intent. @default "primary" */
  variant?: "primary" | "accent" | "secondary" | "ghost" | "danger";
  /** @default "md" */
  size?: "sm" | "md" | "lg";
  /** Stretch to full container width. @default false */
  block?: boolean;
  /** Show a spinner and disable interaction. @default false */
  loading?: boolean;
  /** Icon element rendered before the label. */
  iconLeft?: React.ReactNode;
  /** Icon element rendered after the label. */
  iconRight?: React.ReactNode;
  children?: React.ReactNode;
}

/**
 * Krama action button.
 */
export function Button(props: ButtonProps): JSX.Element;
