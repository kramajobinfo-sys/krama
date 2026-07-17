import React from "react";

/**
 * Krama primary action button. Variants map to the brand's intent system:
 * primary (teal), accent (saffron), secondary (outline), ghost, danger.
 */
export function Button({
  children,
  variant = "primary",
  size = "md",
  block = false,
  disabled = false,
  loading = false,
  iconLeft = null,
  iconRight = null,
  style = {},
  ...rest
}) {
  const sizes = {
    sm: { fontSize: "var(--text-sm)", padding: "0 14px", height: 34, gap: 6, radius: "var(--radius-sm)" },
    md: { fontSize: "var(--text-base)", padding: "0 18px", height: 42, gap: 8, radius: "var(--radius-md)" },
    lg: { fontSize: "var(--text-md)", padding: "0 24px", height: 50, gap: 10, radius: "var(--radius-md)" },
  };
  const s = sizes[size] || sizes.md;

  const variants = {
    primary: { background: "var(--brand)", color: "var(--on-brand)", border: "1px solid transparent", boxShadow: "var(--shadow-xs)" },
    accent: { background: "var(--accent)", color: "var(--on-accent)", border: "1px solid transparent", boxShadow: "var(--shadow-xs)" },
    secondary: { background: "var(--surface-card)", color: "var(--text-strong)", border: "1px solid var(--border-strong)" },
    ghost: { background: "transparent", color: "var(--text-brand)", border: "1px solid transparent" },
    danger: { background: "var(--danger)", color: "#fff", border: "1px solid transparent" },
  };
  const v = variants[variant] || variants.primary;

  const [hover, setHover] = React.useState(false);
  const [active, setActive] = React.useState(false);

  const hoverBg = {
    primary: "var(--brand-hover)",
    accent: "var(--accent-hover)",
    secondary: "var(--surface-hover)",
    ghost: "var(--brand-subtle)",
    danger: "var(--red-700)",
  }[variant];
  const activeBg = {
    primary: "var(--brand-active)",
    accent: "var(--accent-active)",
    secondary: "var(--stone-200)",
    ghost: "var(--brand-subtle-2)",
    danger: "var(--red-700)",
  }[variant];

  const isDisabled = disabled || loading;

  return (
    <button
      disabled={isDisabled}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => { setHover(false); setActive(false); }}
      onMouseDown={() => setActive(true)}
      onMouseUp={() => setActive(false)}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap: s.gap,
        width: block ? "100%" : "auto",
        height: s.height,
        padding: s.padding,
        fontFamily: "var(--font-sans)",
        fontSize: s.fontSize,
        fontWeight: 600,
        lineHeight: 1,
        borderRadius: s.radius,
        cursor: isDisabled ? "not-allowed" : "pointer",
        opacity: isDisabled ? 0.55 : 1,
        transition: "background var(--dur-fast) var(--ease-standard), box-shadow var(--dur-fast), transform var(--dur-instant)",
        transform: active && !isDisabled ? "translateY(1px)" : "none",
        ...v,
        background: isDisabled ? v.background : active ? activeBg : hover ? hoverBg : v.background,
        ...style,
      }}
      {...rest}
    >
      {loading && (
        <span style={{
          width: 14, height: 14, borderRadius: "50%",
          border: "2px solid currentColor", borderTopColor: "transparent",
          display: "inline-block", animation: "krmspin 0.7s linear infinite",
        }} />
      )}
      {!loading && iconLeft}
      {children}
      {!loading && iconRight}
      <style>{`@keyframes krmspin{to{transform:rotate(360deg)}}`}</style>
    </button>
  );
}
