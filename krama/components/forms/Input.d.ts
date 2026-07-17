import * as React from "react";
/**
 * Props for the single-line text field.
 * @startingPoint section="Forms" subtitle="Inputs, selects, checkboxes & switches" viewport="700x420"
 */
export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  /** Field label rendered above the control. */
  label?: string;
  /** Helper text below the field. */
  hint?: string;
  /** Error message — turns the field red and replaces the hint. */
  error?: string;
  /** Leading icon element inside the field. */
  iconLeft?: React.ReactNode;
  /** @default "md" */
  size?: "sm" | "md" | "lg";
  containerStyle?: React.CSSProperties;
}
export function Input(props: InputProps): JSX.Element;
