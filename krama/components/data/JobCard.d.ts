import * as React from "react";
/**
 * Props for the job listing card.
 * @startingPoint section="Data display" subtitle="Job, company & stat cards" viewport="700x620"
 */
export interface JobCardProps {
  title: string;
  company: string;
  /** Company logo URL (falls back to initials). */
  logo?: string;
  location?: string;
  /** Pre-formatted salary range, e.g. "$800 – 1,200 / mo". */
  salary?: string;
  /** Employment type label, e.g. "Full-time". */
  type?: string;
  remote?: boolean;
  /** Saffron featured treatment + badge. @default false */
  featured?: boolean;
  /** Relative time, e.g. "2h ago". */
  postedAt?: string;
  saved?: boolean;
  onSave?: () => void;
  onClick?: () => void;
  style?: React.CSSProperties;
}
export function JobCard(props: JobCardProps): JSX.Element;
