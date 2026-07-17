import * as React from "react";
export interface TagProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** Leading icon element. */
  icon?: React.ReactNode;
  /** Show a × affordance. @default false */
  removable?: boolean;
  /** Fired when × is clicked. */
  onRemove?: () => void;
  /** Selected/active filter state. @default false */
  active?: boolean;
  children?: React.ReactNode;
}
export function Tag(props: TagProps): JSX.Element;
