import React from "react";

/** Surface container. `interactive` adds hover lift for clickable cards. */
export function Card({ children, interactive = false, featured = false, padding = 20, style = {}, ...rest }) {
  const [hover, setHover] = React.useState(false);
  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        position: "relative",
        background: "var(--surface-card)",
        border: "1px solid " + (hover && interactive ? "var(--border-strong)" : "var(--border)"),
        borderRadius: "var(--radius-lg)",
        boxShadow: hover && interactive ? "var(--shadow-md)" : "var(--shadow-sm)",
        padding,
        transition: "box-shadow var(--dur-base) var(--ease-standard), transform var(--dur-base) var(--ease-standard), border-color var(--dur-base)",
        transform: hover && interactive ? "translateY(-2px)" : "none",
        cursor: interactive ? "pointer" : "default",
        overflow: "hidden",
        ...style,
      }}
      {...rest}
    >
      {featured && (
        <span style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: "var(--accent)" }} />
      )}
      {children}
    </div>
  );
}
