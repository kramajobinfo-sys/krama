import React from "react";

/** Avatar for people & companies. Renders image, else initials on a tinted fill. */
export function Avatar({ src, name = "", size = 40, square = false, style = {}, ...rest }) {
  const initials = name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join("");

  // deterministic tint from name
  const palette = [
    ["var(--teal-100)", "var(--teal-800)"],
    ["var(--saffron-100)", "var(--saffron-800)"],
    ["var(--blue-100)", "var(--blue-700)"],
    ["var(--green-100)", "var(--green-700)"],
  ];
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) % palette.length;
  const [bg, fg] = palette[h] || palette[0];

  return (
    <span
      style={{
        display: "inline-flex", alignItems: "center", justifyContent: "center",
        width: size, height: size, flexShrink: 0,
        borderRadius: square ? "var(--radius-md)" : "var(--radius-pill)",
        background: src ? "var(--stone-100)" : bg,
        color: fg, overflow: "hidden",
        fontFamily: "var(--font-sans)", fontWeight: 700,
        fontSize: Math.max(11, Math.round(size * 0.38)),
        border: "1px solid var(--border-subtle)",
        ...style,
      }}
      {...rest}
    >
      {src ? (
        <img src={src} alt={name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
      ) : (
        initials || "?"
      )}
    </span>
  );
}
