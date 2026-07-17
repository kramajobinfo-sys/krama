import * as React from "react";
export interface ProgressStep { label: string; }
export interface ProgressTrackerProps {
  /** Stages as strings or {label}. */
  steps?: Array<string | ProgressStep>;
  /** Zero-based index of the current (active) step. @default 0 */
  current?: number;
  style?: React.CSSProperties;
}
export function ProgressTracker(props: ProgressTrackerProps): JSX.Element;
