import * as React from "react";
export interface TabItem { value: string; label: string; count?: number; }
export interface TabsProps {
  /** Tabs as strings or {value,label,count}. */
  tabs?: Array<string | TabItem>;
  /** Active tab value. */
  value?: string;
  onChange?: (value: string) => void;
  style?: React.CSSProperties;
}
export function Tabs(props: TabsProps): JSX.Element;
