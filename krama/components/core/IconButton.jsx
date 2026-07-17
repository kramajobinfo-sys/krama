import React from "react";

/** Square icon-only button. Mirrors Button variants at a compact footprint. */
export function IconButton({
  children,
  variant = "ghost",
  size = "md",
  disabled = false,
  "aria-label": ariaLabel,
  style = {},
  ...rest
}) {
  const sizes = { sm: 32, md: 40, lg: 48 };
  const dim = sizes[size] || sizes.md;
  const [hover, setHover] = React.useState(false);

  const variants = {
    ghost: { background: "transparent", color: "var(--text-muted)", hover: "var(--surface-hover)" },
    secondary: { background: "var(--surface-card)", color: "var(--text-strong)", border: "1px solid var(--border-strong)", hover: "var(--surface-hover)" },
    primary: { background: "var(--brand)", color: "var(--on-brand)", hover: "var(--brand-hover)" },
    accent: { background: "var(--accent)", color: "var(--on-accent)", hover: "var(--accent-hover)" },
  };
  const v = variants[variant] || variants.ghost;

  return (
    <button
      aria-label={ariaLabel}
      disabled={disabled}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        display: "inline-flex", alignItems: "center", justifyContent: "center",
        width: dim, height: dim, padding: 0,
        borderRadius: "var(--radius-md)",
        border: v.border || "1px solid transparent",
        background: disabled ? v.background : hover ? v.hover : v.background,
        color: v.color,
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.5 : 1,
        transition: "background var(--dur-fast) var(--ease-standard)",
        ...style,
      }}
      {...rest}
    >
      {children}
    </button>
  );
}
