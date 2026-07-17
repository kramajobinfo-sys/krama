import * as React from "react";
export interface AvatarProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** Image URL; falls back to initials when absent. */
  src?: string;
  /** Full name — used for initials and deterministic tint. */
  name?: string;
  /** Pixel diameter. @default 40 */
  size?: number;
  /** Rounded-square (use for company logos). @default false */
  square?: boolean;
}
export function Avatar(props: AvatarProps): JSX.Element;
