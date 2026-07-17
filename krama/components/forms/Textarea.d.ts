import * as React from "react";
export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  hint?: string;
  error?: string;
  /** @default 4 */
  rows?: number;
  containerStyle?: React.CSSProperties;
}
export function Textarea(props: TextareaProps): JSX.Element;
