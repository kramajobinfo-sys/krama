import * as React from "react";
export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Hover lift + pointer cursor for clickable cards. @default false */
  interactive?: boolean;
  /** Saffron accent hairline along the top edge. @default false */
  featured?: boolean;
  /** Inner padding in px. @default 20 */
  padding?: number;
  children?: React.ReactNode;
}
export function Card(props: CardProps): JSX.Element;
