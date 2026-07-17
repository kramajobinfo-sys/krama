import * as React from "react";
export interface CompanyCardProps {
  name: string;
  logo?: string;
  industry?: string;
  location?: string;
  /** Count of published open roles. @default 0 */
  openJobs?: number;
  /** Show the teal verified shield. @default false */
  verified?: boolean;
  onClick?: () => void;
  style?: React.CSSProperties;
}
export function CompanyCard(props: CompanyCardProps): JSX.Element;
