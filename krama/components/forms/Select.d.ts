import * as React from "react";
export interface SelectOption { value: string; label: string; }
export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  hint?: string;
  error?: string;
  /** Options as strings or {value,label} objects. */
  options?: Array<string | SelectOption>;
  /** Empty leading option text. */
  placeholder?: string;
  /** @default "md" */
  size?: "sm" | "md" | "lg";
  containerStyle?: React.CSSProperties;
}
export function Select(props: SelectProps): JSX.Element;
