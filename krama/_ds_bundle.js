/* @ds-bundle: {"format":3,"namespace":"KramaDesignSystem_1a6f65","components":[{"name":"Avatar","sourcePath":"components/core/Avatar.jsx"},{"name":"Badge","sourcePath":"components/core/Badge.jsx"},{"name":"Button","sourcePath":"components/core/Button.jsx"},{"name":"Card","sourcePath":"components/core/Card.jsx"},{"name":"IconButton","sourcePath":"components/core/IconButton.jsx"},{"name":"StatusBadge","sourcePath":"components/core/StatusBadge.jsx"},{"name":"Tag","sourcePath":"components/core/Tag.jsx"},{"name":"CompanyCard","sourcePath":"components/data/CompanyCard.jsx"},{"name":"EmptyState","sourcePath":"components/data/EmptyState.jsx"},{"name":"JobCard","sourcePath":"components/data/JobCard.jsx"},{"name":"ProgressTracker","sourcePath":"components/data/ProgressTracker.jsx"},{"name":"StatCard","sourcePath":"components/data/StatCard.jsx"},{"name":"Tabs","sourcePath":"components/data/Tabs.jsx"},{"name":"Checkbox","sourcePath":"components/forms/Checkbox.jsx"},{"name":"Input","sourcePath":"components/forms/Input.jsx"},{"name":"Select","sourcePath":"components/forms/Select.jsx"},{"name":"Switch","sourcePath":"components/forms/Switch.jsx"},{"name":"Textarea","sourcePath":"components/forms/Textarea.jsx"}],"sourceHashes":{"components/core/Avatar.jsx":"958e2b549309","components/core/Badge.jsx":"855ad4396988","components/core/Button.jsx":"856799ca81ee","components/core/Card.jsx":"4888ad7b95e2","components/core/IconButton.jsx":"f61af49298ff","components/core/StatusBadge.jsx":"d5e27fa64f75","components/core/Tag.jsx":"34198206d803","components/data/CompanyCard.jsx":"e77fa2dfbfff","components/data/EmptyState.jsx":"879974ce081a","components/data/JobCard.jsx":"8459c5c82f9f","components/data/ProgressTracker.jsx":"dd861b8a25fa","components/data/StatCard.jsx":"097968a34db0","components/data/Tabs.jsx":"438556dc57e6","components/forms/Checkbox.jsx":"72f48e037c01","components/forms/Input.jsx":"a7a33bde6917","components/forms/Select.jsx":"b10407f26262","components/forms/Switch.jsx":"4a04872b37a7","components/forms/Textarea.jsx":"2136b38c84e0","deck/deck-stage.js":"208980974db4","ui_kits/admin-dashboard/app.jsx":"f28acd82ae6f","ui_kits/candidate-dashboard/app.jsx":"c346431713cf","ui_kits/employer-dashboard/app.jsx":"c103894d4395","ui_kits/public-website/apply.jsx":"4300090d69ee","ui_kits/public-website/auth.jsx":"96953cea5e3a","ui_kits/public-website/chat.jsx":"111743038def","ui_kits/public-website/chrome.jsx":"75e19df73333","ui_kits/public-website/data.js":"ece618adc84f","ui_kits/public-website/home.jsx":"b393d959223a","ui_kits/public-website/job-detail.jsx":"7c5df042feee","ui_kits/public-website/jobs.jsx":"34f6c3866062","ui_kits/public-website/pages.jsx":"e1aed28afd75"},"inlinedExternals":[],"unexposedExports":[]} */

(() => {

const __ds_ns = (window.KramaDesignSystem_1a6f65 = window.KramaDesignSystem_1a6f65 || {});

const __ds_scope = {};

(__ds_ns.__errors = __ds_ns.__errors || []);

// components/core/Avatar.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/** Avatar for people & companies. Renders image, else initials on a tinted fill. */
function Avatar({
  src,
  name = "",
  size = 40,
  square = false,
  style = {},
  ...rest
}) {
  const initials = name.split(" ").filter(Boolean).slice(0, 2).map(w => w[0]?.toUpperCase()).join("");

  // deterministic tint from name
  const palette = [["var(--teal-100)", "var(--teal-800)"], ["var(--saffron-100)", "var(--saffron-800)"], ["var(--blue-100)", "var(--blue-700)"], ["var(--green-100)", "var(--green-700)"]];
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) % palette.length;
  const [bg, fg] = palette[h] || palette[0];
  return /*#__PURE__*/React.createElement("span", _extends({
    style: {
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      width: size,
      height: size,
      flexShrink: 0,
      borderRadius: square ? "var(--radius-md)" : "var(--radius-pill)",
      background: src ? "var(--stone-100)" : bg,
      color: fg,
      overflow: "hidden",
      fontFamily: "var(--font-sans)",
      fontWeight: 700,
      fontSize: Math.max(11, Math.round(size * 0.38)),
      border: "1px solid var(--border-subtle)",
      ...style
    }
  }, rest), src ? /*#__PURE__*/React.createElement("img", {
    src: src,
    alt: name,
    style: {
      width: "100%",
      height: "100%",
      objectFit: "cover"
    }
  }) : initials || "?");
}
Object.assign(__ds_scope, { Avatar });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Avatar.jsx", error: String((e && e.message) || e) }); }

// components/core/Badge.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/** Small pill label for counts, categories, and metadata. */
function Badge({
  children,
  tone = "neutral",
  solid = false,
  style = {},
  ...rest
}) {
  const tones = {
    neutral: {
      bg: "var(--stone-100)",
      fg: "var(--stone-700)",
      solidBg: "var(--stone-700)"
    },
    brand: {
      bg: "var(--brand-subtle)",
      fg: "var(--text-brand)",
      solidBg: "var(--brand)"
    },
    accent: {
      bg: "var(--accent-subtle)",
      fg: "var(--saffron-700)",
      solidBg: "var(--accent)"
    },
    success: {
      bg: "var(--success-subtle)",
      fg: "var(--success)",
      solidBg: "var(--success)"
    },
    warning: {
      bg: "var(--warning-subtle)",
      fg: "var(--warning)",
      solidBg: "var(--warning)"
    },
    danger: {
      bg: "var(--danger-subtle)",
      fg: "var(--danger)",
      solidBg: "var(--danger)"
    },
    info: {
      bg: "var(--info-subtle)",
      fg: "var(--info)",
      solidBg: "var(--info)"
    }
  };
  const t = tones[tone] || tones.neutral;
  return /*#__PURE__*/React.createElement("span", _extends({
    style: {
      display: "inline-flex",
      alignItems: "center",
      gap: 5,
      fontFamily: "var(--font-sans)",
      fontSize: "var(--text-xs)",
      fontWeight: 600,
      lineHeight: 1,
      padding: "4px 9px",
      borderRadius: "var(--radius-pill)",
      background: solid ? t.solidBg : t.bg,
      color: solid ? "#fff" : t.fg,
      ...style
    }
  }, rest), children);
}
Object.assign(__ds_scope, { Badge });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Badge.jsx", error: String((e && e.message) || e) }); }

// components/core/Button.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * Krama primary action button. Variants map to the brand's intent system:
 * primary (teal), accent (saffron), secondary (outline), ghost, danger.
 */
function Button({
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
    sm: {
      fontSize: "var(--text-sm)",
      padding: "0 14px",
      height: 34,
      gap: 6,
      radius: "var(--radius-sm)"
    },
    md: {
      fontSize: "var(--text-base)",
      padding: "0 18px",
      height: 42,
      gap: 8,
      radius: "var(--radius-md)"
    },
    lg: {
      fontSize: "var(--text-md)",
      padding: "0 24px",
      height: 50,
      gap: 10,
      radius: "var(--radius-md)"
    }
  };
  const s = sizes[size] || sizes.md;
  const variants = {
    primary: {
      background: "var(--brand)",
      color: "var(--on-brand)",
      border: "1px solid transparent",
      boxShadow: "var(--shadow-xs)"
    },
    accent: {
      background: "var(--accent)",
      color: "var(--on-accent)",
      border: "1px solid transparent",
      boxShadow: "var(--shadow-xs)"
    },
    secondary: {
      background: "var(--surface-card)",
      color: "var(--text-strong)",
      border: "1px solid var(--border-strong)"
    },
    ghost: {
      background: "transparent",
      color: "var(--text-brand)",
      border: "1px solid transparent"
    },
    danger: {
      background: "var(--danger)",
      color: "#fff",
      border: "1px solid transparent"
    }
  };
  const v = variants[variant] || variants.primary;
  const [hover, setHover] = React.useState(false);
  const [active, setActive] = React.useState(false);
  const hoverBg = {
    primary: "var(--brand-hover)",
    accent: "var(--accent-hover)",
    secondary: "var(--surface-hover)",
    ghost: "var(--brand-subtle)",
    danger: "var(--red-700)"
  }[variant];
  const activeBg = {
    primary: "var(--brand-active)",
    accent: "var(--accent-active)",
    secondary: "var(--stone-200)",
    ghost: "var(--brand-subtle-2)",
    danger: "var(--red-700)"
  }[variant];
  const isDisabled = disabled || loading;
  return /*#__PURE__*/React.createElement("button", _extends({
    disabled: isDisabled,
    onMouseEnter: () => setHover(true),
    onMouseLeave: () => {
      setHover(false);
      setActive(false);
    },
    onMouseDown: () => setActive(true),
    onMouseUp: () => setActive(false),
    style: {
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
      ...style
    }
  }, rest), loading && /*#__PURE__*/React.createElement("span", {
    style: {
      width: 14,
      height: 14,
      borderRadius: "50%",
      border: "2px solid currentColor",
      borderTopColor: "transparent",
      display: "inline-block",
      animation: "krmspin 0.7s linear infinite"
    }
  }), !loading && iconLeft, children, !loading && iconRight, /*#__PURE__*/React.createElement("style", null, `@keyframes krmspin{to{transform:rotate(360deg)}}`));
}
Object.assign(__ds_scope, { Button });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Button.jsx", error: String((e && e.message) || e) }); }

// components/core/Card.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/** Surface container. `interactive` adds hover lift for clickable cards. */
function Card({
  children,
  interactive = false,
  featured = false,
  padding = 20,
  style = {},
  ...rest
}) {
  const [hover, setHover] = React.useState(false);
  return /*#__PURE__*/React.createElement("div", _extends({
    onMouseEnter: () => setHover(true),
    onMouseLeave: () => setHover(false),
    style: {
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
      ...style
    }
  }, rest), featured && /*#__PURE__*/React.createElement("span", {
    style: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      height: 3,
      background: "var(--accent)"
    }
  }), children);
}
Object.assign(__ds_scope, { Card });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Card.jsx", error: String((e && e.message) || e) }); }

// components/core/IconButton.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/** Square icon-only button. Mirrors Button variants at a compact footprint. */
function IconButton({
  children,
  variant = "ghost",
  size = "md",
  disabled = false,
  "aria-label": ariaLabel,
  style = {},
  ...rest
}) {
  const sizes = {
    sm: 32,
    md: 40,
    lg: 48
  };
  const dim = sizes[size] || sizes.md;
  const [hover, setHover] = React.useState(false);
  const variants = {
    ghost: {
      background: "transparent",
      color: "var(--text-muted)",
      hover: "var(--surface-hover)"
    },
    secondary: {
      background: "var(--surface-card)",
      color: "var(--text-strong)",
      border: "1px solid var(--border-strong)",
      hover: "var(--surface-hover)"
    },
    primary: {
      background: "var(--brand)",
      color: "var(--on-brand)",
      hover: "var(--brand-hover)"
    },
    accent: {
      background: "var(--accent)",
      color: "var(--on-accent)",
      hover: "var(--accent-hover)"
    }
  };
  const v = variants[variant] || variants.ghost;
  return /*#__PURE__*/React.createElement("button", _extends({
    "aria-label": ariaLabel,
    disabled: disabled,
    onMouseEnter: () => setHover(true),
    onMouseLeave: () => setHover(false),
    style: {
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      width: dim,
      height: dim,
      padding: 0,
      borderRadius: "var(--radius-md)",
      border: v.border || "1px solid transparent",
      background: disabled ? v.background : hover ? v.hover : v.background,
      color: v.color,
      cursor: disabled ? "not-allowed" : "pointer",
      opacity: disabled ? 0.5 : 1,
      transition: "background var(--dur-fast) var(--ease-standard)",
      ...style
    }
  }, rest), children);
}
Object.assign(__ds_scope, { IconButton });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/IconButton.jsx", error: String((e && e.message) || e) }); }

// components/core/StatusBadge.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * Workflow status badge for jobs/companies/applications.
 * Maps a status key to the brand's status color pair + a leading dot.
 */
function StatusBadge({
  status = "draft",
  children,
  style = {},
  ...rest
}) {
  const map = {
    draft: {
      bg: "var(--status-draft-bg)",
      fg: "var(--status-draft-fg)",
      label: "Draft"
    },
    pending: {
      bg: "var(--status-pending-bg)",
      fg: "var(--status-pending-fg)",
      label: "Pending approval"
    },
    published: {
      bg: "var(--status-published-bg)",
      fg: "var(--status-published-fg)",
      label: "Published"
    },
    approved: {
      bg: "var(--status-published-bg)",
      fg: "var(--status-published-fg)",
      label: "Approved"
    },
    rejected: {
      bg: "var(--status-rejected-bg)",
      fg: "var(--status-rejected-fg)",
      label: "Rejected"
    },
    closed: {
      bg: "var(--status-closed-bg)",
      fg: "var(--status-closed-fg)",
      label: "Closed"
    },
    suspended: {
      bg: "var(--status-rejected-bg)",
      fg: "var(--status-rejected-fg)",
      label: "Suspended"
    }
  };
  const s = map[status] || map.draft;
  return /*#__PURE__*/React.createElement("span", _extends({
    style: {
      display: "inline-flex",
      alignItems: "center",
      gap: 6,
      fontFamily: "var(--font-sans)",
      fontSize: "var(--text-xs)",
      fontWeight: 600,
      lineHeight: 1,
      padding: "5px 11px",
      borderRadius: "var(--radius-pill)",
      background: s.bg,
      color: s.fg,
      ...style
    }
  }, rest), /*#__PURE__*/React.createElement("span", {
    style: {
      width: 7,
      height: 7,
      borderRadius: "50%",
      background: "currentColor"
    }
  }), children || s.label);
}
Object.assign(__ds_scope, { StatusBadge });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/StatusBadge.jsx", error: String((e && e.message) || e) }); }

// components/core/Tag.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/** Outlined/soft category chip — filter tokens, skill tags, job categories. */
function Tag({
  children,
  icon = null,
  removable = false,
  onRemove,
  active = false,
  style = {},
  ...rest
}) {
  const [hover, setHover] = React.useState(false);
  return /*#__PURE__*/React.createElement("span", _extends({
    onMouseEnter: () => setHover(true),
    onMouseLeave: () => setHover(false),
    style: {
      display: "inline-flex",
      alignItems: "center",
      gap: 6,
      fontFamily: "var(--font-sans)",
      fontSize: "var(--text-sm)",
      fontWeight: 500,
      lineHeight: 1,
      padding: "6px 12px",
      borderRadius: "var(--radius-pill)",
      border: "1px solid " + (active ? "var(--brand)" : "var(--border-strong)"),
      background: active ? "var(--brand-subtle)" : hover ? "var(--surface-hover)" : "var(--surface-card)",
      color: active ? "var(--text-brand)" : "var(--text-body)",
      cursor: rest.onClick ? "pointer" : "default",
      transition: "background var(--dur-fast), border-color var(--dur-fast)",
      ...style
    }
  }, rest), icon, children, removable && /*#__PURE__*/React.createElement("span", {
    onClick: e => {
      e.stopPropagation();
      onRemove && onRemove();
    },
    style: {
      display: "inline-flex",
      cursor: "pointer",
      opacity: 0.6,
      marginRight: -2
    }
  }, "\xD7"));
}
Object.assign(__ds_scope, { Tag });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Tag.jsx", error: String((e && e.message) || e) }); }

// components/data/CompanyCard.jsx
try { (() => {
/** Company directory card — logo, industry, location, open-roles count. */
function CompanyCard({
  name,
  logo,
  industry,
  location,
  openJobs = 0,
  verified = false,
  onClick,
  style = {}
}) {
  return /*#__PURE__*/React.createElement(__ds_scope.Card, {
    interactive: true,
    onClick: onClick,
    padding: 20,
    style: {
      textAlign: "center",
      ...style
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      gap: 12
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.Avatar, {
    src: logo,
    name: name,
    square: true,
    size: 64
  }), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "inline-flex",
      alignItems: "center",
      gap: 6,
      justifyContent: "center"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: "var(--font-display)",
      fontWeight: 700,
      fontSize: "var(--text-md)",
      color: "var(--text-strong)"
    }
  }, name), verified && /*#__PURE__*/React.createElement("span", {
    title: "Verified",
    style: {
      color: "var(--brand)",
      display: "inline-flex"
    }
  }, /*#__PURE__*/React.createElement("svg", {
    width: "16",
    height: "16",
    viewBox: "0 0 24 24",
    fill: "currentColor"
  }, /*#__PURE__*/React.createElement("path", {
    d: "m9 12 2 2 4-4",
    fill: "none",
    stroke: "#fff",
    strokeWidth: "2.4",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M12 2 3.5 6v6c0 5 3.5 8 8.5 10 5-2 8.5-5 8.5-10V6L12 2Z"
  })))), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: "var(--text-sm)",
      color: "var(--text-muted)",
      marginTop: 3
    }
  }, industry)), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 8,
      justifyContent: "center",
      flexWrap: "wrap"
    }
  }, location && /*#__PURE__*/React.createElement(__ds_scope.Badge, {
    tone: "neutral"
  }, location), /*#__PURE__*/React.createElement(__ds_scope.Badge, {
    tone: "brand"
  }, openJobs, " open ", openJobs === 1 ? "role" : "roles"))));
}
Object.assign(__ds_scope, { CompanyCard });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/data/CompanyCard.jsx", error: String((e && e.message) || e) }); }

// components/data/EmptyState.jsx
try { (() => {
/** Friendly empty state for lists with no data yet. */
function EmptyState({
  icon,
  title,
  description,
  action,
  style = {}
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      textAlign: "center",
      padding: "48px 24px",
      gap: 6,
      ...style
    }
  }, icon && /*#__PURE__*/React.createElement("span", {
    style: {
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      width: 56,
      height: 56,
      borderRadius: "var(--radius-lg)",
      background: "var(--brand-subtle)",
      color: "var(--brand)",
      marginBottom: 6
    }
  }, icon), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: "var(--font-display)",
      fontWeight: 700,
      fontSize: "var(--text-lg)",
      color: "var(--text-strong)"
    }
  }, title), description && /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: "var(--text-base)",
      color: "var(--text-muted)",
      maxWidth: 340,
      lineHeight: "var(--leading-normal)"
    }
  }, description), action && /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 14
    }
  }, action));
}
Object.assign(__ds_scope, { EmptyState });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/data/EmptyState.jsx", error: String((e && e.message) || e) }); }

// components/data/JobCard.jsx
try { (() => {
/**
 * Job listing card used across search results, featured grids, and dashboards.
 * Composes Card + Avatar + Badge.
 */
function JobCard({
  title,
  company,
  logo,
  location,
  salary,
  type,
  remote = false,
  featured = false,
  postedAt,
  saved = false,
  onSave,
  onClick,
  style = {}
}) {
  return /*#__PURE__*/React.createElement(__ds_scope.Card, {
    interactive: true,
    featured: featured,
    onClick: onClick,
    padding: 20,
    style: style
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 14
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.Avatar, {
    src: logo,
    name: company,
    square: true,
    size: 48
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      justifyContent: "space-between",
      gap: 8
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: "var(--font-display)",
      fontWeight: 700,
      fontSize: "var(--text-lg)",
      color: "var(--text-strong)",
      letterSpacing: "var(--tracking-snug)",
      whiteSpace: "nowrap",
      overflow: "hidden",
      textOverflow: "ellipsis"
    }
  }, title), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: "var(--text-sm)",
      color: "var(--text-muted)",
      marginTop: 2
    }
  }, company)), /*#__PURE__*/React.createElement(__ds_scope.IconButton, {
    size: "sm",
    "aria-label": saved ? "Saved" : "Save job",
    onClick: e => {
      e.stopPropagation();
      onSave && onSave();
    },
    style: {
      color: saved ? "var(--accent)" : "var(--text-faint)"
    }
  }, /*#__PURE__*/React.createElement("svg", {
    width: "18",
    height: "18",
    viewBox: "0 0 24 24",
    fill: saved ? "currentColor" : "none",
    stroke: "currentColor",
    strokeWidth: "2",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }, /*#__PURE__*/React.createElement("path", {
    d: "m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"
  })))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexWrap: "wrap",
      gap: 8,
      marginTop: 14
    }
  }, type && /*#__PURE__*/React.createElement(__ds_scope.Badge, {
    tone: "neutral"
  }, type), remote && /*#__PURE__*/React.createElement(__ds_scope.Badge, {
    tone: "brand"
  }, "Remote"), featured && /*#__PURE__*/React.createElement(__ds_scope.Badge, {
    tone: "accent"
  }, "Featured")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexWrap: "wrap",
      gap: 16,
      marginTop: 14,
      fontSize: "var(--text-sm)",
      color: "var(--text-muted)",
      alignItems: "center"
    }
  }, location && /*#__PURE__*/React.createElement("span", {
    style: {
      display: "inline-flex",
      alignItems: "center",
      gap: 5
    }
  }, /*#__PURE__*/React.createElement("svg", {
    width: "15",
    height: "15",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"
  }), /*#__PURE__*/React.createElement("circle", {
    cx: "12",
    cy: "10",
    r: "3"
  })), location), salary && /*#__PURE__*/React.createElement("span", {
    style: {
      display: "inline-flex",
      alignItems: "center",
      gap: 5,
      fontWeight: 600,
      color: "var(--text-brand)"
    }
  }, /*#__PURE__*/React.createElement("svg", {
    width: "15",
    height: "15",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }, /*#__PURE__*/React.createElement("line", {
    x1: "12",
    x2: "12",
    y1: "2",
    y2: "22"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"
  })), salary), postedAt && /*#__PURE__*/React.createElement("span", {
    style: {
      marginLeft: "auto",
      color: "var(--text-faint)"
    }
  }, postedAt)))));
}
Object.assign(__ds_scope, { JobCard });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/data/JobCard.jsx", error: String((e && e.message) || e) }); }

// components/data/ProgressTracker.jsx
try { (() => {
/** Horizontal stage tracker for the applicant/job pipeline. */
function ProgressTracker({
  steps = [],
  current = 0,
  style = {}
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "flex-start",
      ...style
    }
  }, steps.map((step, i) => {
    const label = typeof step === "string" ? step : step.label;
    const done = i < current;
    const active = i === current;
    const isLast = i === steps.length - 1;
    const dotColor = done ? "var(--brand)" : active ? "var(--brand)" : "var(--stone-300)";
    return /*#__PURE__*/React.createElement("div", {
      key: i,
      style: {
        flex: isLast ? "0 0 auto" : 1,
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-start",
        position: "relative",
        minWidth: 0
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        alignItems: "center",
        width: "100%"
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        width: 26,
        height: 26,
        flexShrink: 0,
        borderRadius: "50%",
        background: done ? "var(--brand)" : "var(--surface-card)",
        border: "2px solid " + dotColor,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        color: done ? "#fff" : active ? "var(--brand)" : "var(--text-faint)",
        fontSize: 12,
        fontWeight: 700
      }
    }, done ? /*#__PURE__*/React.createElement("svg", {
      width: "13",
      height: "13",
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: "3.2",
      strokeLinecap: "round",
      strokeLinejoin: "round"
    }, /*#__PURE__*/React.createElement("polyline", {
      points: "20 6 9 17 4 12"
    })) : i + 1), !isLast && /*#__PURE__*/React.createElement("span", {
      style: {
        flex: 1,
        height: 2,
        background: done ? "var(--brand)" : "var(--border-strong)",
        margin: "0 8px"
      }
    })), /*#__PURE__*/React.createElement("span", {
      style: {
        marginTop: 8,
        fontSize: "var(--text-sm)",
        fontWeight: active ? 700 : 500,
        color: active || done ? "var(--text-strong)" : "var(--text-muted)",
        paddingRight: 12
      }
    }, label));
  }));
}
Object.assign(__ds_scope, { ProgressTracker });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/data/ProgressTracker.jsx", error: String((e && e.message) || e) }); }

// components/data/StatCard.jsx
try { (() => {
/** KPI tile for dashboards. Icon + label + value + optional delta. */
function StatCard({
  label,
  value,
  icon,
  delta,
  deltaDir = "up",
  tone = "brand",
  style = {}
}) {
  const tones = {
    brand: {
      bg: "var(--brand-subtle)",
      fg: "var(--brand)"
    },
    accent: {
      bg: "var(--accent-subtle)",
      fg: "var(--accent)"
    },
    success: {
      bg: "var(--success-subtle)",
      fg: "var(--success)"
    },
    warning: {
      bg: "var(--warning-subtle)",
      fg: "var(--warning)"
    },
    info: {
      bg: "var(--info-subtle)",
      fg: "var(--info)"
    },
    neutral: {
      bg: "var(--stone-100)",
      fg: "var(--stone-700)"
    }
  };
  const t = tones[tone] || tones.brand;
  const deltaColor = deltaDir === "down" ? "var(--danger)" : "var(--success)";
  return /*#__PURE__*/React.createElement(__ds_scope.Card, {
    padding: 20,
    style: style
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "flex-start",
      justifyContent: "space-between",
      gap: 12
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: "var(--text-sm)",
      color: "var(--text-muted)",
      fontWeight: 500
    }
  }, label), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: "var(--font-display)",
      fontWeight: 700,
      fontSize: "var(--text-3xl)",
      color: "var(--text-strong)",
      letterSpacing: "var(--tracking-tight)",
      marginTop: 6,
      lineHeight: 1
    }
  }, value), delta != null && /*#__PURE__*/React.createElement("div", {
    style: {
      display: "inline-flex",
      alignItems: "center",
      gap: 4,
      marginTop: 10,
      fontSize: "var(--text-sm)",
      fontWeight: 600,
      color: deltaColor
    }
  }, /*#__PURE__*/React.createElement("svg", {
    width: "14",
    height: "14",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2.4",
    strokeLinecap: "round",
    strokeLinejoin: "round",
    style: {
      transform: deltaDir === "down" ? "rotate(180deg)" : "none"
    }
  }, /*#__PURE__*/React.createElement("line", {
    x1: "12",
    x2: "12",
    y1: "19",
    y2: "5"
  }), /*#__PURE__*/React.createElement("polyline", {
    points: "5 12 12 5 19 12"
  })), delta)), icon && /*#__PURE__*/React.createElement("span", {
    style: {
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      width: 44,
      height: 44,
      borderRadius: "var(--radius-md)",
      background: t.bg,
      color: t.fg,
      flexShrink: 0
    }
  }, icon)));
}
Object.assign(__ds_scope, { StatCard });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/data/StatCard.jsx", error: String((e && e.message) || e) }); }

// components/data/Tabs.jsx
try { (() => {
/** Underline tab bar. Controlled via `value`/`onChange`. */
function Tabs({
  tabs = [],
  value,
  onChange,
  style = {}
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 4,
      borderBottom: "1px solid var(--border)",
      ...style
    }
  }, tabs.map(tab => {
    const val = typeof tab === "string" ? tab : tab.value;
    const label = typeof tab === "string" ? tab : tab.label;
    const count = typeof tab === "string" ? null : tab.count;
    const active = val === value;
    return /*#__PURE__*/React.createElement("button", {
      key: val,
      onClick: () => onChange && onChange(val),
      style: {
        position: "relative",
        border: "none",
        background: "transparent",
        cursor: "pointer",
        padding: "12px 14px",
        fontFamily: "var(--font-sans)",
        fontSize: "var(--text-base)",
        fontWeight: active ? 700 : 500,
        color: active ? "var(--text-brand)" : "var(--text-muted)",
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
        transition: "color var(--dur-fast)"
      }
    }, label, count != null && /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: "var(--text-xs)",
        fontWeight: 600,
        padding: "1px 7px",
        borderRadius: "var(--radius-pill)",
        background: active ? "var(--brand-subtle)" : "var(--stone-100)",
        color: active ? "var(--text-brand)" : "var(--text-muted)"
      }
    }, count), active && /*#__PURE__*/React.createElement("span", {
      style: {
        position: "absolute",
        left: 8,
        right: 8,
        bottom: -1,
        height: 2.5,
        borderRadius: "2px 2px 0 0",
        background: "var(--brand)"
      }
    }));
  }));
}
Object.assign(__ds_scope, { Tabs });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/data/Tabs.jsx", error: String((e && e.message) || e) }); }

// components/forms/Checkbox.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/** Checkbox with label. Controlled via `checked`/`onChange`. */
function Checkbox({
  label,
  checked = false,
  onChange,
  disabled = false,
  style = {},
  ...rest
}) {
  return /*#__PURE__*/React.createElement("label", {
    style: {
      display: "inline-flex",
      alignItems: "center",
      gap: 10,
      cursor: disabled ? "not-allowed" : "pointer",
      opacity: disabled ? 0.55 : 1,
      fontFamily: "var(--font-sans)",
      fontSize: "var(--text-base)",
      color: "var(--text-body)",
      ...style
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: 20,
      height: 20,
      flexShrink: 0,
      borderRadius: "var(--radius-sm)",
      border: "1.5px solid " + (checked ? "var(--brand)" : "var(--border-strong)"),
      background: checked ? "var(--brand)" : "var(--surface-card)",
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      transition: "background var(--dur-fast), border-color var(--dur-fast)"
    }
  }, checked && /*#__PURE__*/React.createElement("svg", {
    width: "13",
    height: "13",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "#fff",
    strokeWidth: "3.2",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }, /*#__PURE__*/React.createElement("polyline", {
    points: "20 6 9 17 4 12"
  }))), /*#__PURE__*/React.createElement("input", _extends({
    type: "checkbox",
    checked: checked,
    disabled: disabled,
    onChange: onChange,
    style: {
      position: "absolute",
      opacity: 0,
      width: 0,
      height: 0
    }
  }, rest)), label);
}
Object.assign(__ds_scope, { Checkbox });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Checkbox.jsx", error: String((e && e.message) || e) }); }

// components/forms/Input.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/** Text input with optional label, leading icon, hint and error states. */
function Input({
  label,
  hint,
  error,
  iconLeft,
  size = "md",
  id,
  style = {},
  containerStyle = {},
  ...rest
}) {
  const [focus, setFocus] = React.useState(false);
  const heights = {
    sm: 36,
    md: 44,
    lg: 52
  };
  const h = heights[size] || heights.md;
  const inputId = id || (label ? "in-" + label.replace(/\s+/g, "-").toLowerCase() : undefined);
  const borderColor = error ? "var(--danger)" : focus ? "var(--border-focus)" : "var(--border-strong)";
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 6,
      ...containerStyle
    }
  }, label && /*#__PURE__*/React.createElement("label", {
    htmlFor: inputId,
    style: {
      fontSize: "var(--text-sm)",
      fontWeight: 600,
      color: "var(--text-strong)"
    }
  }, label), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 8,
      height: h,
      padding: "0 14px",
      background: rest.disabled ? "var(--surface-sunken)" : "var(--surface-card)",
      border: "1px solid " + borderColor,
      borderRadius: "var(--radius-md)",
      boxShadow: focus && !error ? "var(--focus-ring)" : "none",
      transition: "border-color var(--dur-fast), box-shadow var(--dur-fast)"
    }
  }, iconLeft && /*#__PURE__*/React.createElement("span", {
    style: {
      display: "inline-flex",
      color: "var(--text-faint)"
    }
  }, iconLeft), /*#__PURE__*/React.createElement("input", _extends({
    id: inputId,
    onFocus: () => setFocus(true),
    onBlur: () => setFocus(false),
    style: {
      flex: 1,
      border: "none",
      outline: "none",
      background: "transparent",
      fontFamily: "var(--font-sans)",
      fontSize: "var(--text-base)",
      color: "var(--text-strong)",
      minWidth: 0,
      ...style
    }
  }, rest))), (hint || error) && /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: "var(--text-xs)",
      color: error ? "var(--danger)" : "var(--text-muted)"
    }
  }, error || hint));
}
Object.assign(__ds_scope, { Input });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Input.jsx", error: String((e && e.message) || e) }); }

// components/forms/Select.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/** Styled native select with label/hint/error, matching Input metrics. */
function Select({
  label,
  hint,
  error,
  options = [],
  placeholder,
  size = "md",
  id,
  style = {},
  containerStyle = {},
  ...rest
}) {
  const [focus, setFocus] = React.useState(false);
  const heights = {
    sm: 36,
    md: 44,
    lg: 52
  };
  const h = heights[size] || heights.md;
  const inputId = id || (label ? "sel-" + label.replace(/\s+/g, "-").toLowerCase() : undefined);
  const borderColor = error ? "var(--danger)" : focus ? "var(--border-focus)" : "var(--border-strong)";
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 6,
      ...containerStyle
    }
  }, label && /*#__PURE__*/React.createElement("label", {
    htmlFor: inputId,
    style: {
      fontSize: "var(--text-sm)",
      fontWeight: 600,
      color: "var(--text-strong)"
    }
  }, label), /*#__PURE__*/React.createElement("div", {
    style: {
      position: "relative"
    }
  }, /*#__PURE__*/React.createElement("select", _extends({
    id: inputId,
    onFocus: () => setFocus(true),
    onBlur: () => setFocus(false),
    style: {
      appearance: "none",
      WebkitAppearance: "none",
      width: "100%",
      height: h,
      padding: "0 38px 0 14px",
      background: rest.disabled ? "var(--surface-sunken)" : "var(--surface-card)",
      border: "1px solid " + borderColor,
      borderRadius: "var(--radius-md)",
      boxShadow: focus && !error ? "var(--focus-ring)" : "none",
      fontFamily: "var(--font-sans)",
      fontSize: "var(--text-base)",
      color: "var(--text-strong)",
      outline: "none",
      cursor: "pointer",
      transition: "border-color var(--dur-fast), box-shadow var(--dur-fast)",
      ...style
    }
  }, rest), placeholder && /*#__PURE__*/React.createElement("option", {
    value: ""
  }, placeholder), options.map(o => {
    const val = typeof o === "string" ? o : o.value;
    const lab = typeof o === "string" ? o : o.label;
    return /*#__PURE__*/React.createElement("option", {
      key: val,
      value: val
    }, lab);
  })), /*#__PURE__*/React.createElement("span", {
    style: {
      position: "absolute",
      right: 14,
      top: "50%",
      transform: "translateY(-50%)",
      pointerEvents: "none",
      color: "var(--text-faint)"
    }
  }, /*#__PURE__*/React.createElement("svg", {
    width: "14",
    height: "14",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2.2",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }, /*#__PURE__*/React.createElement("polyline", {
    points: "6 9 12 15 18 9"
  })))), (hint || error) && /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: "var(--text-xs)",
      color: error ? "var(--danger)" : "var(--text-muted)"
    }
  }, error || hint));
}
Object.assign(__ds_scope, { Select });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Select.jsx", error: String((e && e.message) || e) }); }

// components/forms/Switch.jsx
try { (() => {
/** Toggle switch for binary settings (e.g. "Open to remote"). */
function Switch({
  label,
  checked = false,
  onChange,
  disabled = false,
  style = {},
  ...rest
}) {
  return /*#__PURE__*/React.createElement("label", {
    style: {
      display: "inline-flex",
      alignItems: "center",
      gap: 10,
      cursor: disabled ? "not-allowed" : "pointer",
      opacity: disabled ? 0.55 : 1,
      fontFamily: "var(--font-sans)",
      fontSize: "var(--text-base)",
      color: "var(--text-body)",
      ...style
    }
  }, /*#__PURE__*/React.createElement("span", {
    onClick: () => !disabled && onChange && onChange(!checked),
    style: {
      width: 40,
      height: 24,
      flexShrink: 0,
      borderRadius: "var(--radius-pill)",
      background: checked ? "var(--brand)" : "var(--stone-300)",
      position: "relative",
      transition: "background var(--dur-base) var(--ease-standard)"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      position: "absolute",
      top: 2,
      left: checked ? 18 : 2,
      width: 20,
      height: 20,
      borderRadius: "50%",
      background: "#fff",
      boxShadow: "var(--shadow-sm)",
      transition: "left var(--dur-base) var(--ease-standard)"
    }
  })), label);
}
Object.assign(__ds_scope, { Switch });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Switch.jsx", error: String((e && e.message) || e) }); }

// components/forms/Textarea.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/** Multi-line text field. Shares the Input visual language. */
function Textarea({
  label,
  hint,
  error,
  rows = 4,
  id,
  style = {},
  containerStyle = {},
  ...rest
}) {
  const [focus, setFocus] = React.useState(false);
  const inputId = id || (label ? "ta-" + label.replace(/\s+/g, "-").toLowerCase() : undefined);
  const borderColor = error ? "var(--danger)" : focus ? "var(--border-focus)" : "var(--border-strong)";
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 6,
      ...containerStyle
    }
  }, label && /*#__PURE__*/React.createElement("label", {
    htmlFor: inputId,
    style: {
      fontSize: "var(--text-sm)",
      fontWeight: 600,
      color: "var(--text-strong)"
    }
  }, label), /*#__PURE__*/React.createElement("textarea", _extends({
    id: inputId,
    rows: rows,
    onFocus: () => setFocus(true),
    onBlur: () => setFocus(false),
    style: {
      resize: "vertical",
      padding: "11px 14px",
      background: rest.disabled ? "var(--surface-sunken)" : "var(--surface-card)",
      border: "1px solid " + borderColor,
      borderRadius: "var(--radius-md)",
      boxShadow: focus && !error ? "var(--focus-ring)" : "none",
      fontFamily: "var(--font-sans)",
      fontSize: "var(--text-base)",
      color: "var(--text-strong)",
      lineHeight: "var(--leading-normal)",
      outline: "none",
      transition: "border-color var(--dur-fast), box-shadow var(--dur-fast)",
      ...style
    }
  }, rest)), (hint || error) && /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: "var(--text-xs)",
      color: error ? "var(--danger)" : "var(--text-muted)"
    }
  }, error || hint));
}
Object.assign(__ds_scope, { Textarea });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Textarea.jsx", error: String((e && e.message) || e) }); }

// deck/deck-stage.js
try { (() => {
// @ds-adherence-ignore -- omelette starter scaffold (raw elements/hex/px by design)
/* ═══ THIS PROJECT USES DESIGN COMPONENTS (.dc.html) ═══
 * Reference this stage from your <x-dc> template as an import — NEVER as a
 * raw <deck-stage> tag plus a <script src> (that hides the whole deck until
 * the stream finishes):
 *
 *   <x-import component-from-global-scope="deck-stage" from="./deck-stage.js"
 *             width="1920" height="1080" hint-size="100%,100%">
 *     <section data-label="Title" style="...">…</section>
 *     <section data-label="Agenda" style="...">…</section>
 *   </x-import>
 *
 * Slides are inline-styled <section> siblings; do not add a stylesheet or a
 * deck-stage:not(:defined) rule. The plain-HTML "Usage" block in the comment
 * below does NOT apply to .dc.html templates.
 */
/* BEGIN USAGE */
/**
 * <deck-stage> — reusable web component for HTML decks.
 *
 * Handles:
 *  (a) speaker notes — reads <script type="application/json" id="speaker-notes">
 *      and posts {slideIndexChanged: N} to the parent window on nav.
 *  (b) keyboard navigation — ←/→, PgUp/PgDn, Space, Home/End, number keys.
 *      On touch devices, tapping the left/right half of the stage goes
 *      prev/next — taps on links, buttons and other interactive slide
 *      content are left alone.
 *  (c) press R to reset to slide 0 (with a tasteful keyboard hint).
 *  (d) bottom-center overlay showing slide count + hints, fades out on idle.
 *  (e) auto-scaling — inner canvas is a fixed design size (default 1920×1080)
 *      scaled with `transform: scale()` to fit the viewport, letterboxed.
 *      Set the `noscale` attribute to render at authored size (1:1) — the
 *      PPTX exporter sets this so its DOM capture sees unscaled geometry.
 *  (f) print — `@media print` lays every slide out as its own page at the
 *      design size, so the browser's Print → Save as PDF produces a clean
 *      one-page-per-slide PDF with no extra setup.
 *  (g) thumbnail rail — resizable left-hand column of per-slide thumbnails
 *      (static clones). Click to navigate; ↑/↓ with a thumbnail focused to
 *      step between slides; drag to reorder; right-click for
 *      Skip / Move up / Move down / Duplicate / Delete (Delete opens a
 *      Cancel/Delete confirm dialog). Drag the rail's right edge to resize;
 *      width persists to
 *      localStorage. Skipped slides carry `data-deck-skip`, are dimmed in
 *      the rail, omitted from prev/next navigation, and hidden at print.
 *      The rail is suppressed in presenting mode, in the host's Preview
 *      mode (ViewerMode='none'), on `noscale`, on narrow viewports
 *      (≤640px), and via the `no-rail` attribute. Rail mutations dispatch
 *      a `dc-op` CustomEvent on the element (see docs/dc-ops.md) and do
 *      NOT touch the DOM: the host applies the op and re-renders;
 *      structural rail input is locked until the host posts
 *      {__dc_op_ack: true, applied}.
 *
 * Slides are HIDDEN, not unmounted. Non-active slides stay in the DOM with
 * `visibility: hidden` + `opacity: 0`, so their state (videos, iframes,
 * form inputs, React trees) is preserved across navigation.
 *
 * Lifecycle event — the component dispatches a `slidechange` CustomEvent on
 * itself whenever the active slide changes (including the initial mount).
 * The event bubbles and composes out of shadow DOM, so you can listen on
 * the <deck-stage> element or on document:
 *
 *   document.querySelector('deck-stage').addEventListener('slidechange', (e) => {
 *     e.detail.index         // new 0-based index
 *     e.detail.previousIndex // previous index, or -1 on init
 *     e.detail.total         // total slide count
 *     e.detail.slide         // the new active slide element
 *     e.detail.previousSlide // the prior slide element, or null on init
 *     e.detail.reason        // 'init' | 'keyboard' | 'click' | 'tap' | 'api'
 *   });
 *
 * Persistence: none at the deck level. The host app keeps the current slide
 * in its own URL (?slide=) and re-delivers it via location.hash on load, so a
 * bare load with no hash always starts at slide 1.
 *
 * Usage:
 *   <style>deck-stage:not(:defined){visibility:hidden}</style>
 *   <deck-stage width="1920" height="1080">
 *     <section data-label="Title">...</section>
 *     <section data-label="Agenda">...</section>
 *   </deck-stage>
 *   <script src="deck-stage.js"></script>
 *
 * The :not(:defined) rule prevents a flash of the first slide at its
 * authored styles before this script runs and attaches the shadow root.
 *
 * Slides are the direct element children of <deck-stage>. Each slide is
 * automatically tagged with:
 *   - data-screen-label="NN Label"   (1-indexed, for comment flow)
 *   - data-om-validate="no_overflowing_text,no_overlapping_text,slide_sized_text"
 *
 * Speaker notes stay in sync because the component posts {slideIndexChanged: N}
 * to the parent — just include the #speaker-notes script tag if asked for notes.
 *
 * Authoring guidance:
 *   - Write slide bodies as static HTML inside <deck-stage>, with sizing via
 *     CSS custom properties in a <style> block rather than JS constants.
 *     Static slide markup is what lets the user click a heading in edit mode
 *     and retype it directly; a slide rendered through <script type="text/babel">,
 *     React, or a loop over a JS array has to round-trip every tweak through a
 *     chat message instead. Reach for script-generated slides only when the
 *     content genuinely needs interactive behaviour static HTML can't express.
 *   - Do NOT set position/inset/width/height on the slide <section> elements —
 *     the component absolutely positions every slotted child for you.
 *   - Entrance animations: make the visible end-state the base style and
 *     animate *from* hidden, so print and reduced-motion show content.
 *     Gate the animation on [data-deck-active] and the motion query, e.g.
 *     `@media (prefers-reduced-motion:no-preference){ [data-deck-active] .x{animation:fade-in .5s both} }`.
 *     Avoid infinite decorative loops on slide content.
 */
/* END USAGE */

(() => {
  const DESIGN_W_DEFAULT = 1920;
  const DESIGN_H_DEFAULT = 1080;
  const OVERLAY_HIDE_MS = 1800;
  const VALIDATE_ATTR = 'no_overflowing_text,no_overlapping_text,slide_sized_text';
  const FINE_POINTER_MQ = matchMedia('(hover: hover) and (pointer: fine)');
  const NARROW_MQ = matchMedia('(max-width: 640px)');
  // Slide-authored controls that should keep a tap instead of it navigating.
  const INTERACTIVE_SEL = 'a[href], button, input, select, textarea, summary, label, video[controls], audio[controls], [role="button"], [onclick], [tabindex]:not([tabindex^="-"]), [contenteditable]:not([contenteditable="false" i])';
  const pad2 = n => String(n).padStart(2, '0');

  // Label precedence: data-label → data-screen-label (number stripped) → first heading → "Slide".
  const getSlideLabel = el => {
    const explicit = el.getAttribute('data-label');
    if (explicit) return explicit;
    const existing = el.getAttribute('data-screen-label');
    if (existing) return existing.replace(/^\s*\d+\s*/, '').trim() || existing;
    const h = el.querySelector('h1, h2, h3, [data-title]');
    const t = h && (h.textContent || '').trim().slice(0, 40);
    if (t) return t;
    return 'Slide';
  };
  const stylesheet = `
    :host {
      position: fixed;
      inset: 0;
      display: block;
      background: #000;
      color: #fff;
      font-family: -apple-system, BlinkMacSystemFont, "Helvetica Neue", Helvetica, Arial, sans-serif;
      overflow: hidden;
      -webkit-tap-highlight-color: transparent;
    }
    /* connectedCallback holds this until document.fonts.ready (capped 2s) so
     * the first visible paint has the deck's real typography + final rail
     * layout. opacity (not visibility) so the active slide can't un-hide
     * itself via the ::slotted([data-deck-active]) visibility:visible rule.
     * Only the stage/rail hide — the black :host background stays, so the
     * iframe doesn't flash the page's default white. */
    :host([data-fonts-pending]) .stage,
    :host([data-fonts-pending]) .rail { opacity: 0; pointer-events: none; }

    .stage {
      position: absolute;
      inset: 0;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .canvas {
      position: relative;
      transform-origin: center center;
      flex-shrink: 0;
      background: #fff;
      will-change: transform;
    }

    /* Slides live in light DOM (via <slot>) so authored CSS still applies.
       We absolutely position each slotted child to stack them. */
    ::slotted(*) {
      position: absolute !important;
      inset: 0 !important;
      width: 100% !important;
      height: 100% !important;
      box-sizing: border-box !important;
      overflow: hidden;
      opacity: 0;
      pointer-events: none;
      visibility: hidden;
    }
    ::slotted([data-deck-active]) {
      opacity: 1;
      pointer-events: auto;
      visibility: visible;
    }

    .overlay {
      position: fixed;
      left: 50%;
      bottom: 22px;
      transform: translate(-50%, 6px) scale(0.92);
      filter: blur(6px);
      display: flex;
      align-items: center;
      gap: 4px;
      padding: 4px;
      background: #000;
      color: #fff;
      border-radius: 999px;
      font-size: 12px;
      font-feature-settings: "tnum" 1;
      letter-spacing: 0.01em;
      opacity: 0;
      pointer-events: none;
      transition: opacity 260ms ease, transform 260ms cubic-bezier(.2,.8,.2,1), filter 260ms ease;
      transform-origin: center bottom;
      z-index: 2147483000;
      user-select: none;
    }
    .overlay[data-visible] {
      opacity: 1;
      pointer-events: auto;
      transform: translate(-50%, 0) scale(1);
      filter: blur(0);
    }

    .btn {
      appearance: none;
      -webkit-appearance: none;
      background: transparent;
      border: 0;
      margin: 0;
      padding: 0;
      color: inherit;
      font: inherit;
      cursor: default;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      height: 28px;
      min-width: 28px;
      border-radius: 999px;
      color: rgba(255,255,255,0.72);
      transition: background 140ms ease, color 140ms ease;
      -webkit-tap-highlight-color: transparent;
    }
    .btn:hover { background: rgba(255,255,255,0.12); color: #fff; }
    .btn:active { background: rgba(255,255,255,0.18); }
    .btn:focus { outline: none; }
    .btn:focus-visible { outline: none; }
    .btn::-moz-focus-inner { border: 0; }
    .btn svg { width: 14px; height: 14px; display: block; }
    .btn.reset {
      font-size: 11px;
      font-weight: 500;
      letter-spacing: 0.02em;
      padding: 0 10px 0 12px;
      gap: 6px;
      color: rgba(255,255,255,0.72);
    }
    .btn.reset .kbd {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      min-width: 16px;
      height: 16px;
      padding: 0 4px;
      font-family: ui-monospace, "SF Mono", Menlo, Consolas, monospace;
      font-size: 10px;
      line-height: 1;
      color: rgba(255,255,255,0.88);
      background: rgba(255,255,255,0.12);
      border-radius: 4px;
    }

    .count {
      font-variant-numeric: tabular-nums;
      color: #fff;
      font-weight: 500;
      padding: 0 8px;
      min-width: 42px;
      text-align: center;
      font-size: 12px;
    }
    .count .sep { color: rgba(255,255,255,0.45); margin: 0 3px; font-weight: 400; }
    .count .total { color: rgba(255,255,255,0.55); }

    .divider {
      width: 1px;
      height: 14px;
      background: rgba(255,255,255,0.18);
      margin: 0 2px;
    }

    /* ── Thumbnail rail ──────────────────────────────────────────────────
       Fixed column on the left; each thumbnail is a static deep-clone of
       the light-DOM slide scaled into a 16:9 (or design-aspect) frame. The
       stage re-fits around it (see _fit); hidden during present / noscale
       / print so capture geometry and fullscreen output are unchanged. */
    .rail {
      position: fixed;
      left: 0;
      top: 0;
      bottom: 0;
      width: var(--deck-rail-w, 188px);
      background: #141414;
      border-right: 1px solid rgba(255,255,255,0.08);
      overflow-y: auto;
      overflow-x: hidden;
      padding: 12px 10px;
      box-sizing: border-box;
      display: flex;
      flex-direction: column;
      gap: 12px;
      z-index: 2147482500;
      scrollbar-width: thin;
      scrollbar-color: rgba(255,255,255,0.18) transparent;
    }
    .rail::-webkit-scrollbar { width: 8px; }
    .rail::-webkit-scrollbar-track { background: transparent; margin: 2px; }
    .rail::-webkit-scrollbar-thumb {
      background: rgba(255,255,255,0.18);
      border-radius: 4px;
      border: 2px solid transparent;
      background-clip: content-box;
    }
    .rail::-webkit-scrollbar-thumb:hover {
      background: rgba(255,255,255,0.28);
      border: 2px solid transparent;
      background-clip: content-box;
    }
    :host([no-rail]) .rail,
    :host([noscale]) .rail { display: none; }
    .rail[data-presenting] { display: none; }
    @media (max-width: 640px) {
      .rail, .rail-resize { display: none; }
    }
    /* User-driven show/hide (the TweaksPanel toggle) slides instead of
       popping. Transitions are gated on :host([data-rail-anim]) — set only
       for the 200ms around the toggle — so window-resize and rail-width
       drag (which also call _fit) don't lag behind the cursor. */
    .rail[data-user-hidden] { transform: translateX(-100%); }
    :host([data-rail-anim]) .rail { transition: transform 200ms cubic-bezier(.3,.7,.4,1); }
    :host([data-rail-anim]) .stage { transition: left 200ms cubic-bezier(.3,.7,.4,1); }
    :host([data-rail-anim]) .canvas { transition: transform 200ms cubic-bezier(.3,.7,.4,1); }
    /* transition shorthand replaces rather than merges — repeat the base
       .overlay opacity/transform/filter transitions so visibility changes
       during the 200ms toggle window still fade instead of popping. */
    :host([data-rail-anim]) .overlay {
      transition: margin-left 200ms cubic-bezier(.3,.7,.4,1),
                  opacity 260ms ease,
                  transform 260ms cubic-bezier(.2,.8,.2,1),
                  filter 260ms ease;
    }

    .thumb {
      position: relative;
      display: flex;
      align-items: flex-start;
      gap: 8px;
      cursor: pointer;
      user-select: none;
    }
    .thumb .num {
      width: 16px;
      flex-shrink: 0;
      font-size: 11px;
      font-weight: 500;
      text-align: right;
      color: rgba(255,255,255,0.55);
      padding-top: 2px;
      font-variant-numeric: tabular-nums;
    }
    .thumb .frame {
      position: relative;
      flex: 1;
      min-width: 0;
      aspect-ratio: var(--deck-aspect);
      background: #fff;
      border-radius: 4px;
      outline: 2px solid transparent;
      outline-offset: 0;
      overflow: hidden;
      transition: outline-color 120ms ease;
    }
    .thumb:hover .frame { outline-color: rgba(255,255,255,0.25); }
    .thumb { outline: none; }
    .thumb:focus-visible .frame { outline-color: rgba(255,255,255,0.5); }
    .thumb[data-current] .num { color: #fff; }
    .thumb[data-current] .frame { outline-color: #D97757; }
    .thumb[data-dragging] { opacity: 0.35; }
    .thumb::before {
      content: '';
      position: absolute;
      left: 24px;
      right: 0;
      height: 3px;
      border-radius: 2px;
      background: #D97757;
      opacity: 0;
      pointer-events: none;
    }
    .thumb[data-drop="before"]::before { top: -8px; opacity: 1; }
    .thumb[data-drop="after"]::before { bottom: -8px; opacity: 1; }
    .thumb[data-skip] .frame { opacity: 0.35; }
    .thumb[data-skip] .frame::after {
      content: 'Skipped';
      position: absolute;
      inset: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      background: rgba(0,0,0,0.45);
      color: #fff;
      font-size: 10px;
      font-weight: 500;
      letter-spacing: 0.04em;
    }

    .ctxmenu {
      position: fixed;
      min-width: 150px;
      padding: 4px;
      background: #242424;
      border: 1px solid rgba(255,255,255,0.12);
      border-radius: 7px;
      box-shadow: 0 8px 24px rgba(0,0,0,0.45);
      z-index: 2147483100;
      display: none;
      font-size: 12px;
    }
    .ctxmenu[data-open] { display: block; }
    .ctxmenu button {
      display: block;
      width: 100%;
      appearance: none;
      border: 0;
      background: transparent;
      color: #e8e8e8;
      font: inherit;
      text-align: left;
      padding: 6px 10px;
      border-radius: 4px;
      cursor: pointer;
    }
    .ctxmenu button:hover:not(:disabled) { background: rgba(255,255,255,0.08); }
    .ctxmenu button:disabled { opacity: 0.35; cursor: default; }
    .ctxmenu hr {
      border: 0;
      border-top: 1px solid rgba(255,255,255,0.1);
      margin: 4px 2px;
    }

    .rail-resize {
      position: fixed;
      left: calc(var(--deck-rail-w, 188px) - 3px);
      top: 0;
      bottom: 0;
      width: 6px;
      cursor: col-resize;
      z-index: 2147482600;
      touch-action: none;
    }
    .rail-resize:hover,
    .rail-resize[data-dragging] { background: rgba(255,255,255,0.12); }
    :host([no-rail]) .rail-resize,
    :host([noscale]) .rail-resize,
    .rail[data-presenting] + .rail-resize,
    .rail[data-user-hidden] + .rail-resize { display: none; }

    /* Delete-confirm popup — matches the SPA's ConfirmDialog layout
       (title + message body, depressed footer with Cancel / Delete). */
    .confirm-backdrop {
      position: fixed;
      inset: 0;
      background: rgba(0,0,0,0.45);
      z-index: 2147483200;
      display: none;
      align-items: center;
      justify-content: center;
    }
    .confirm-backdrop[data-open] { display: flex; }
    .confirm {
      width: 320px;
      max-width: calc(100vw - 32px);
      background: #2a2a2a;
      color: #e8e8e8;
      border: 1px solid rgba(255,255,255,0.12);
      border-radius: 12px;
      box-shadow: 0 12px 32px rgba(0,0,0,0.5);
      overflow: hidden;
      font-family: inherit;
      animation: deck-confirm-in 0.18s ease;
    }
    @keyframes deck-confirm-in {
      from { opacity: 0; transform: scale(0.96); }
      to { opacity: 1; transform: scale(1); }
    }
    .confirm .body { padding: 20px 20px 16px; }
    .confirm .title { font-size: 14px; font-weight: 600; margin-bottom: 4px; }
    .confirm .msg { font-size: 13px; line-height: 1.5; color: rgba(255,255,255,0.65); }
    .confirm .footer {
      padding: 14px 20px;
      background: #1f1f1f;
      border-top: 1px solid rgba(255,255,255,0.08);
      display: flex;
      justify-content: flex-end;
      gap: 8px;
    }
    .confirm button {
      appearance: none;
      font: inherit;
      font-size: 13px;
      font-weight: 500;
      padding: 8px 16px;
      border-radius: 8px;
      cursor: pointer;
    }
    .confirm .cancel {
      background: transparent;
      border: 0;
      color: rgba(255,255,255,0.8);
    }
    .confirm .cancel:hover { background: rgba(255,255,255,0.08); }
    .confirm .danger {
      background: #c96442;
      border: 1px solid rgba(0,0,0,0.15);
      color: #fff;
      box-shadow: 0 1px 3px rgba(166,50,68,0.3), 0 2px 6px rgba(166,50,68,0.18);
    }
    .confirm .danger:hover { background: #b5563a; }

    /* ── Print: one page per slide, no chrome ────────────────────────────
       The screen layout stacks every slide at inset:0 inside a scaled
       canvas; for print we want them in document flow at the authored
       design size so the browser paginates one slide per sheet. The
       @page size is set from the width/height attributes via the inline
       <style id="deck-stage-print-page"> that _syncPrintPageRule appends
       to the document (the @page at-rule has no effect inside shadow DOM). */
    @media print {
      :host {
        position: static;
        inset: auto;
        background: none;
        overflow: visible;
        color: inherit;
      }
      .stage { position: static; display: block; }
      .canvas {
        transform: none !important;
        width: auto !important;
        height: auto !important;
        background: none;
        will-change: auto;
      }
      ::slotted(*) {
        position: relative !important;
        inset: auto !important;
        width: var(--deck-design-w) !important;
        height: var(--deck-design-h) !important;
        box-sizing: border-box !important;
        opacity: 1 !important;
        visibility: visible !important;
        pointer-events: auto;
        break-after: page;
        page-break-after: always;
        break-inside: avoid;
        overflow: hidden;
      }
      /* :last-child alone isn't enough once data-deck-skip hides the
         trailing slide(s) — the last *visible* slide still carries
         break-after:page and prints a blank sheet. _markLastVisible()
         maintains data-deck-last-visible on the last non-skipped slide. */
      ::slotted(*:last-child),
      ::slotted([data-deck-last-visible]) {
        break-after: auto;
        page-break-after: auto;
      }
      ::slotted([data-deck-skip]) { display: none !important; }
      .overlay, .rail, .rail-resize, .ctxmenu, .confirm-backdrop { display: none !important; }
    }
  `;
  class DeckStage extends HTMLElement {
    static get observedAttributes() {
      return ['width', 'height', 'noscale', 'no-rail'];
    }
    constructor() {
      super();
      this._root = this.attachShadow({
        mode: 'open'
      });
      this._index = 0;
      this._slides = [];
      this._notes = [];
      this._hideTimer = null;
      this._mouseIdleTimer = null;
      this._menuIndex = -1;
      this._onKey = this._onKey.bind(this);
      this._onResize = this._onResize.bind(this);
      this._onSlotChange = this._onSlotChange.bind(this);
      this._onMouseMove = this._onMouseMove.bind(this);
      this._onTap = this._onTap.bind(this);
      this._onMessage = this._onMessage.bind(this);
      // Capture-phase close so a click anywhere dismisses the menu, but
      // ignore clicks that land inside the menu itself — otherwise the
      // capture handler runs before the menu's own (bubble) handler and
      // clears _menuIndex out from under it.
      this._onDocClick = e => {
        if (this._menu && e.composedPath && e.composedPath().includes(this._menu)) return;
        this._closeMenu();
      };
    }
    get designWidth() {
      return parseInt(this.getAttribute('width'), 10) || DESIGN_W_DEFAULT;
    }
    get designHeight() {
      return parseInt(this.getAttribute('height'), 10) || DESIGN_H_DEFAULT;
    }
    connectedCallback() {
      // Presenter-view popup loads deckUrl?_snthumb=...#N for its prev/cur/
      // next thumbnails — the rail has no business rendering inside those
      // (wrong scale, and it offsets the stage so the thumb shows a gutter).
      if (/[?&]_snthumb=/.test(location.search)) this.setAttribute('no-rail', '');
      this._render();
      this._loadNotes();
      this._syncPrintPageRule();
      window.addEventListener('keydown', this._onKey);
      window.addEventListener('resize', this._onResize);
      window.addEventListener('mousemove', this._onMouseMove, {
        passive: true
      });
      window.addEventListener('message', this._onMessage);
      window.addEventListener('click', this._onDocClick, true);
      this.addEventListener('click', this._onTap);
      // Print lays every slide out as its own page, so [data-deck-active]-
      // gated entrance styles need the attribute on every slide (not just
      // the current one) or their content prints at the hidden base style.
      // The transient freeze style lands BEFORE the attributes so any
      // attribute-keyed transition fires at 0s (changing transition-
      // duration after a transition has started doesn't affect it).
      this._onBeforePrint = () => {
        this._syncPrintPageRule();
        if (this._freezeStyle) this._freezeStyle.remove();
        this._freezeStyle = document.createElement('style');
        this._freezeStyle.textContent = '*,*::before,*::after{transition-duration:0s !important}';
        document.head.appendChild(this._freezeStyle);
        this._slides.forEach(s => s.setAttribute('data-deck-active', ''));
      };
      this._onAfterPrint = () => {
        this._applyIndex({
          showOverlay: false,
          broadcast: false
        });
        if (this._freezeStyle) {
          this._freezeStyle.remove();
          this._freezeStyle = null;
        }
      };
      window.addEventListener('beforeprint', this._onBeforePrint);
      window.addEventListener('afterprint', this._onAfterPrint);
      // Initial collection + layout happens via slotchange, which fires on mount.
      this._enableRail();
      // Hold the stage hidden until webfonts are ready so the first visible
      // paint has the deck's real typography — the :not(:defined) guard in
      // the page HTML only covers custom-element upgrade, not font load.
      // Capped so a 404'd font URL can't blank the deck indefinitely.
      this.setAttribute('data-fonts-pending', '');
      const reveal = () => this.removeAttribute('data-fonts-pending');
      // rAF first: fonts.ready is a pre-resolved promise until layout has
      // resolved the slotted text's font-family and pushed a FontFace into
      // 'loading'. Reading it here in connectedCallback (parse-time) would
      // settle the race in a microtask before any font fetch starts.
      requestAnimationFrame(() => {
        Promise.race([document.fonts ? document.fonts.ready : Promise.resolve(), new Promise(r => setTimeout(r, 2000))]).then(reveal, reveal);
      });
    }
    _enableRail() {
      // Idempotent — older host builds still post __omelette_rail_enabled.
      // no-rail guard keeps the observers/stylesheet walk off the cheap path
      // for presenter-popup thumbnail iframes (up to 9 per view).
      if (this._railEnabled || this.hasAttribute('no-rail')) return;
      this._railEnabled = true;
      // Per-viewer preference — restored alongside rail width. Default on;
      // only a stored '0' (from the TweaksPanel toggle) hides it.
      this._railVisible = true;
      try {
        if (localStorage.getItem('deck-stage.railVisible') === '0') this._railVisible = false;
      } catch (e) {}
      // Live thumbnail updates: watch the light-DOM slides for content
      // edits and re-clone just the affected thumb(s), debounced. Ignore
      // the data-deck-* / data-screen-label / data-om-validate attributes
      // this component itself writes so nav doesn't trigger spurious
      // refreshes — except data-deck-skip, which now arrives from the host
      // re-render and is what updates the rail badge, print bookkeeping,
      // and deckSkipped re-broadcast.
      const OWN_ATTRS = /^data-(deck-(?!skip$)|screen-label$|om-validate$)/;
      this._liveDirty = new Set();
      this._liveObserver = new MutationObserver(records => {
        for (const r of records) {
          if (r.type === 'attributes' && OWN_ATTRS.test(r.attributeName || '')) continue;
          let n = r.target;
          while (n && n.parentElement !== this) n = n.parentElement;
          // Skip/unskip is handled below without re-cloning (the badge sits
          // on the thumb wrapper, not the clone) — don't mark the slide
          // dirty for an attr change whose only visible effect is the badge.
          if (n && this._slideSet && this._slideSet.has(n) && !(r.type === 'attributes' && r.attributeName === 'data-deck-skip')) {
            this._liveDirty.add(n);
          }
          // Host-driven skip toggle: sync the rail badge + print + presenter
          // skipped-list the way _toggleSkip used to do locally.
          if (r.type === 'attributes' && r.attributeName === 'data-deck-skip' && n && this._slideSet && this._slideSet.has(n)) {
            const i = this._slides.indexOf(n);
            if (this._thumbs && this._thumbs[i]) {
              if (n.hasAttribute('data-deck-skip')) this._thumbs[i].thumb.setAttribute('data-skip', '');else this._thumbs[i].thumb.removeAttribute('data-skip');
            }
            this._markLastVisible();
            try {
              window.postMessage({
                slideIndexChanged: this._index,
                deckTotal: this._slides.length,
                deckSkipped: this._skippedIndices()
              }, '*');
            } catch (e) {}
          }
        }
        if (this._liveDirty.size && !this._liveTimer) {
          this._liveTimer = setTimeout(() => {
            this._liveTimer = null;
            this._liveDirty.forEach(s => this._refreshThumb(s));
            this._liveDirty.clear();
          }, 200);
        }
      });
      this._liveObserver.observe(this, {
        subtree: true,
        childList: true,
        characterData: true,
        attributes: true
      });
      // Lazy thumbnail materialization — clone the slide only when its
      // frame scrolls into (or near) the rail viewport. rootMargin gives
      // ~4 thumbs of pre-load so fast scrolling doesn't flash blanks.
      this._railObserver = new IntersectionObserver(entries => {
        entries.forEach(e => {
          if (e.isIntersecting && e.target.__deckThumb) {
            this._materialize(e.target.__deckThumb);
          }
        });
      }, {
        root: this._rail,
        rootMargin: '400px 0px'
      });
      // Tweaks typically change CSS vars / attrs OUTSIDE <deck-stage>
      // (on <html>, <body>, a wrapper div, or a <style> tag), which
      // _liveObserver can't see. Re-snapshot author CSS (constructable
      // sheet is shared by reference, so one replaceSync updates every
      // thumb shadow root) and re-sync each thumb host's attrs + custom
      // properties. In-slide DOM mutations are _liveObserver's job.
      // Debounced so slider drags don't thrash.
      this._onTweakChange = () => {
        clearTimeout(this._tweakTimer);
        this._tweakTimer = setTimeout(() => {
          this._snapshotAuthorCss();
          // One getComputedStyle for the whole batch — each
          // getPropertyValue read below reuses the same computed style
          // as long as nothing invalidates layout between thumbs.
          const cs = getComputedStyle(this);
          (this._thumbs || []).forEach(t => {
            if (t.host) this._syncThumbHostAttrs(t.host, cs);
          });
        }, 120);
      };
      window.addEventListener('tweakchange', this._onTweakChange);
      this._snapshotAuthorCss();
      // Build the rail now that it's enabled — slotchange already fired,
      // so _renderRail's early-return skipped the initial build.
      this._syncRailHidden();
      this._renderRail();
      this._fit();
    }

    /** Snapshot document stylesheets into a constructable sheet that each
     *  thumbnail's nested shadow root adopts — so author CSS styles the
     *  cloned slide content without touching this component's chrome.
     *  Cross-origin sheets throw on .cssRules — skip them. Re-callable:
     *  the existing constructable sheet is reused via replaceSync so every
     *  already-adopted shadow root picks up the fresh CSS without re-adopt. */
    _snapshotAuthorCss() {
      // :root in an adopted sheet inside a shadow root matches nothing
      // (only the document root qualifies), so author rules like
      // `:root[data-voice="modern"] .serif` never reach the clones.
      // Rewrite :root → :host and mirror <html>'s data-*/class/lang onto
      // each thumb host (see _syncThumbHostAttrs) so the same selectors
      // match inside the thumbnail's shadow tree.
      const authorCss = Array.from(document.styleSheets).map(sh => {
        try {
          return Array.from(sh.cssRules).map(r => r.cssText).join('\n');
        } catch (e) {
          return '';
        }
      }).join('\n')
      // The shadow host is featureless outside the functional :host(...)
      // form, so any compound on :root — [attr], .class, #id, :pseudo —
      // must become :host(<compound>) not :host<compound>. Same for the
      // html type selector (Tailwind class-strategy dark mode emits
      // html.dark; Pico uses html[data-theme]), which has nothing to
      // match inside the thumb's shadow tree.
      .replace(/:root((?:\[[^\]]*\]|[.#][-\w]+|:[-\w]+(?:\([^)]*\))?)+)/g, ':host($1)').replace(/:root\b/g, ':host').replace(/(^|[\s,>~+(}])html((?:\[[^\]]*\]|[.#][-\w]+|:[-\w]+(?:\([^)]*\))?)+)(?![-\w])/g, '$1:host($2)').replace(/(^|[\s,>~+(}])html(?![-\w])/g, '$1:host');
      // Every custom property the author references. _syncThumbHostAttrs
      // mirrors each one's *computed* value at <deck-stage> onto the
      // thumb host so the live value wins over the :host default above
      // regardless of which ancestor the tweak wrote to (<html>, <body>,
      // a wrapper div, or the deck-stage element itself all inherit
      // down to getComputedStyle(this)).
      this._authorVars = new Set(authorCss.match(/--[\w-]+/g) || []);
      try {
        if (!this._adoptedSheet) this._adoptedSheet = new CSSStyleSheet();
        this._adoptedSheet.replaceSync(authorCss);
      } catch (e) {
        this._adoptedSheet = null;
        this._authorCss = authorCss;
      }
    }
    _syncThumbHostAttrs(host, cs) {
      const de = document.documentElement;
      // setAttribute overwrites but can't delete — an attr removed from
      // <html> (toggleAttribute off, classList emptied) would linger on
      // the host and :host([data-*]) / :host(.foo) rules would keep
      // matching. Remove stale mirrored attrs first; iterate backward
      // because removeAttribute mutates the live NamedNodeMap.
      for (let i = host.attributes.length - 1; i >= 0; i--) {
        const n = host.attributes[i].name;
        if ((n.startsWith('data-') || n === 'class' || n === 'lang') && !de.hasAttribute(n)) {
          host.removeAttribute(n);
        }
      }
      for (const a of de.attributes) {
        if (a.name.startsWith('data-') || a.name === 'class' || a.name === 'lang') {
          host.setAttribute(a.name, a.value);
        }
      }
      // The :root→:host rewrite in _snapshotAuthorCss pins each custom
      // property to its stylesheet default on the thumb host, shadowing
      // the live value that would otherwise inherit. Tweaks can write the
      // live value on any ancestor — <html>, <body>, a wrapper div, the
      // deck-stage element — so read it as the *computed* value at
      // <deck-stage> (which sees the whole inheritance chain) rather than
      // trying to guess which element the author wrote to. Inline on the
      // host beats the :host{} rule. remove-stale covers vars dropped
      // from the stylesheet between snapshots.
      const vars = this._authorVars || new Set();
      for (let i = host.style.length - 1; i >= 0; i--) {
        const p = host.style[i];
        if (p.startsWith('--') && !vars.has(p)) host.style.removeProperty(p);
      }
      const live = cs || getComputedStyle(this);
      vars.forEach(p => {
        const v = live.getPropertyValue(p);
        if (v) host.style.setProperty(p, v.trim());else host.style.removeProperty(p);
      });
    }
    disconnectedCallback() {
      window.removeEventListener('keydown', this._onKey);
      window.removeEventListener('resize', this._onResize);
      window.removeEventListener('mousemove', this._onMouseMove);
      window.removeEventListener('message', this._onMessage);
      window.removeEventListener('click', this._onDocClick, true);
      window.removeEventListener('beforeprint', this._onBeforePrint);
      window.removeEventListener('afterprint', this._onAfterPrint);
      if (this._freezeStyle) {
        this._freezeStyle.remove();
        this._freezeStyle = null;
      }
      this.removeEventListener('click', this._onTap);
      if (this._hideTimer) clearTimeout(this._hideTimer);
      if (this._mouseIdleTimer) clearTimeout(this._mouseIdleTimer);
      if (this._liveTimer) clearTimeout(this._liveTimer);
      if (this._tweakTimer) clearTimeout(this._tweakTimer);
      if (this._railAnimTimer) clearTimeout(this._railAnimTimer);
      if (this._scaleRaf) cancelAnimationFrame(this._scaleRaf);
      if (this._liveObserver) this._liveObserver.disconnect();
      if (this._railObserver) this._railObserver.disconnect();
      if (this._onTweakChange) window.removeEventListener('tweakchange', this._onTweakChange);
    }
    attributeChangedCallback() {
      if (this._canvas) {
        this._canvas.style.width = this.designWidth + 'px';
        this._canvas.style.height = this.designHeight + 'px';
        this._canvas.style.setProperty('--deck-design-w', this.designWidth + 'px');
        this._canvas.style.setProperty('--deck-design-h', this.designHeight + 'px');
        if (this._rail) {
          this._rail.style.setProperty('--deck-aspect', this.designWidth + '/' + this.designHeight);
        }
        this._fit();
        this._scaleThumbs();
        this._syncPrintPageRule();
      }
    }
    _render() {
      const style = document.createElement('style');
      style.textContent = stylesheet;
      const stage = document.createElement('div');
      stage.className = 'stage';
      const canvas = document.createElement('div');
      canvas.className = 'canvas';
      canvas.style.width = this.designWidth + 'px';
      canvas.style.height = this.designHeight + 'px';
      canvas.style.setProperty('--deck-design-w', this.designWidth + 'px');
      canvas.style.setProperty('--deck-design-h', this.designHeight + 'px');
      const slot = document.createElement('slot');
      slot.addEventListener('slotchange', this._onSlotChange);
      canvas.appendChild(slot);
      stage.appendChild(canvas);

      // Overlay: compact, solid black, with clickable controls.
      const overlay = document.createElement('div');
      overlay.className = 'overlay export-hidden';
      overlay.setAttribute('role', 'toolbar');
      overlay.setAttribute('aria-label', 'Deck controls');
      overlay.setAttribute('data-omelette-chrome', '');
      overlay.innerHTML = `
        <button class="btn prev" type="button" aria-label="Previous slide" title="Previous (←)">
          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M10 3L5 8l5 5"/></svg>
        </button>
        <span class="count" aria-live="polite"><span class="current">1</span><span class="sep">/</span><span class="total">1</span></span>
        <button class="btn next" type="button" aria-label="Next slide" title="Next (→)">
          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 3l5 5-5 5"/></svg>
        </button>
        <span class="divider"></span>
        <button class="btn reset" type="button" aria-label="Reset to first slide" title="Reset (R)">Reset<span class="kbd">R</span></button>
      `;
      overlay.querySelector('.prev').addEventListener('click', () => this._advance(-1, 'click'));
      overlay.querySelector('.next').addEventListener('click', () => this._advance(1, 'click'));
      overlay.querySelector('.reset').addEventListener('click', () => this._go(0, 'click'));

      // Thumbnail rail + context menu. Thumbnails are populated in
      // _renderRail() after _collectSlides().
      const rail = document.createElement('div');
      rail.className = 'rail export-hidden';
      rail.setAttribute('data-omelette-chrome', '');
      // Edit mode hooks wheel to pan the canvas; this opts the rail's own
      // scrollview out so thumbnails stay scrollable while editing.
      rail.setAttribute('data-dc-wheel-passthru', '');
      rail.style.setProperty('--deck-aspect', this.designWidth + '/' + this.designHeight);
      // Edge auto-scroll while dragging a thumb near the rail's top/bottom
      // so off-screen drop targets are reachable. Native dragover fires
      // continuously while the pointer is stationary, so a per-event nudge
      // (ramped by edge proximity) is enough — no rAF loop needed.
      rail.addEventListener('dragover', e => {
        if (this._dragFrom == null) return;
        const r = rail.getBoundingClientRect();
        const EDGE = 40;
        const dt = e.clientY - r.top;
        const db = r.bottom - e.clientY;
        if (dt < EDGE) rail.scrollTop -= Math.ceil((EDGE - dt) / 3);else if (db < EDGE) rail.scrollTop += Math.ceil((EDGE - db) / 3);
      });
      const menu = document.createElement('div');
      menu.className = 'ctxmenu export-hidden';
      menu.setAttribute('data-omelette-chrome', '');
      menu.innerHTML = `
        <button type="button" data-act="skip">Skip slide</button>
        <button type="button" data-act="up">Move up</button>
        <button type="button" data-act="down">Move down</button>
        <button type="button" data-act="duplicate">Duplicate slide</button>
        <hr>
        <button type="button" data-act="delete">Delete slide</button>
      `;
      menu.addEventListener('click', e => {
        const act = e.target && e.target.getAttribute && e.target.getAttribute('data-act');
        if (!act) return;
        const i = this._menuIndex;
        this._closeMenu();
        if (act === 'skip') this._toggleSkip(i);else if (act === 'up') this._moveSlide(i, i - 1);else if (act === 'down') this._moveSlide(i, i + 1);else if (act === 'duplicate') this._duplicateSlide(i);else if (act === 'delete') this._openConfirm(i);
      });
      menu.addEventListener('contextmenu', e => e.preventDefault());

      // Rail resize handle — drag to set --deck-rail-w, persisted to
      // localStorage so the width survives reloads.
      const resize = document.createElement('div');
      resize.className = 'rail-resize export-hidden';
      resize.setAttribute('data-omelette-chrome', '');
      resize.addEventListener('pointerdown', e => {
        e.preventDefault();
        resize.setPointerCapture(e.pointerId);
        resize.setAttribute('data-dragging', '');
        const move = ev => this._setRailWidth(ev.clientX);
        const up = () => {
          resize.removeEventListener('pointermove', move);
          resize.removeEventListener('pointerup', up);
          resize.removeEventListener('pointercancel', up);
          resize.removeAttribute('data-dragging');
          try {
            localStorage.setItem('deck-stage.railWidth', String(this._railPx));
          } catch (err) {}
        };
        resize.addEventListener('pointermove', move);
        resize.addEventListener('pointerup', up);
        resize.addEventListener('pointercancel', up);
      });

      // Delete-confirm dialog — mirrors the SPA's ConfirmDialog layout.
      const confirm = document.createElement('div');
      confirm.className = 'confirm-backdrop export-hidden';
      confirm.setAttribute('data-omelette-chrome', '');
      confirm.innerHTML = `
        <div class="confirm" role="dialog" aria-modal="true">
          <div class="body">
            <div class="title">Delete slide?</div>
            <div class="msg">This slide will be removed from the deck.</div>
          </div>
          <div class="footer">
            <button type="button" class="cancel">Cancel</button>
            <button type="button" class="danger">Delete</button>
          </div>
        </div>
      `;
      confirm.addEventListener('click', e => {
        if (e.target === confirm) this._closeConfirm();
      });
      confirm.querySelector('.cancel').addEventListener('click', () => this._closeConfirm());
      confirm.querySelector('.danger').addEventListener('click', () => {
        const i = this._confirmIndex;
        this._closeConfirm();
        this._deleteSlide(i);
      });
      this._root.append(style, rail, resize, stage, overlay, menu, confirm);
      this._canvas = canvas;
      this._stage = stage;
      this._slot = slot;
      this._overlay = overlay;
      this._rail = rail;
      this._resize = resize;
      this._menu = menu;
      this._confirm = confirm;
      this._countEl = overlay.querySelector('.current');
      this._totalEl = overlay.querySelector('.total');

      // Restore persisted rail width.
      let rw = 188;
      try {
        const s = localStorage.getItem('deck-stage.railWidth');
        if (s) rw = parseInt(s, 10) || rw;
      } catch (err) {}
      this._setRailWidth(rw);
      this._syncRailHidden();
    }
    _setRailWidth(px) {
      const w = Math.max(120, Math.min(360, Math.round(px)));
      this._railPx = w;
      this.style.setProperty('--deck-rail-w', w + 'px');
      this._fit();
      // _scaleThumbs forces a sync layout (frame.offsetWidth) then writes
      // N transforms. During a resize drag this runs per-pointermove;
      // coalesce to one per frame.
      if (!this._scaleRaf) {
        this._scaleRaf = requestAnimationFrame(() => {
          this._scaleRaf = null;
          this._scaleThumbs();
        });
      }
    }

    /** @page must live in the document stylesheet — it's a no-op inside
     *  shadow DOM. (Re-)append so any author @page landing later in
     *  source order can't reintroduce a margin and push each slide onto
     *  two sheets; called again from beforeprint. */
    _syncPrintPageRule() {
      const id = 'deck-stage-print-page';
      let tag = document.getElementById(id);
      if (!tag) {
        tag = document.createElement('style');
        tag.id = id;
      }
      (document.body || document.head).appendChild(tag);
      tag.textContent = '@page { size: ' + this.designWidth + 'px ' + this.designHeight + 'px; margin: 0; } ' + '@media print { html, body { margin: 0 !important; padding: 0 !important; background: none !important; overflow: visible !important; height: auto !important; } ' + '* { -webkit-print-color-adjust: exact; print-color-adjust: exact; } ' +
      // Jump authored animations/transitions to their end state so print
      // never captures mid-entrance — pairs with the beforeprint handler
      // in connectedCallback that sets data-deck-active on every slide.
      '*, *::before, *::after { animation-delay: -99s !important; animation-duration: .001s !important; ' + 'animation-iteration-count: 1 !important; animation-fill-mode: both !important; ' + 'animation-play-state: running !important; transition-duration: 0s !important; } }';
    }
    _onSlotChange() {
      // Self-mutate path already reconciled synchronously and emitted
      // slidechange; skip the async slotchange it caused.
      if (this._squelchSlotChange) {
        this._squelchSlotChange = false;
        return;
      }
      // Primary lock-clear is the host's __deck_rail_ack; this clears on a
      // dropped ack so the rail can't stay dead.
      this._railLock = false;
      this._collectSlides();
      this._restoreIndex();
      this._applyIndex({
        showOverlay: false,
        broadcast: true,
        reason: 'init'
      });
      this._fit();
    }
    _collectSlides() {
      const assigned = this._slot.assignedElements({
        flatten: true
      });
      this._slides = assigned.filter(el => {
        // Skip template/style/script nodes even if someone slots them.
        const tag = el.tagName;
        return tag !== 'TEMPLATE' && tag !== 'SCRIPT' && tag !== 'STYLE';
      });
      this._slideSet = new Set(this._slides);
      this._slides.forEach((slide, i) => {
        const n = i + 1;
        slide.setAttribute('data-screen-label', `${pad2(n)} ${getSlideLabel(slide)}`);

        // Validation attribute for comment flow / auto-checks.
        if (!slide.hasAttribute('data-om-validate')) {
          slide.setAttribute('data-om-validate', VALIDATE_ATTR);
        }
        slide.setAttribute('data-deck-slide', String(i));
      });
      if (this._totalEl) this._totalEl.textContent = String(this._slides.length || 1);
      if (this._index >= this._slides.length) this._index = Math.max(0, this._slides.length - 1);
      this._markLastVisible();
      this._renderRail();
    }

    /** Tag the last non-skipped slide so print CSS can drop its
     *  break-after (see the @media print comment above — :last-child
     *  alone matches a hidden skipped slide). */
    _markLastVisible() {
      let last = null;
      this._slides.forEach(s => {
        s.removeAttribute('data-deck-last-visible');
        if (!s.hasAttribute('data-deck-skip')) last = s;
      });
      if (last) last.setAttribute('data-deck-last-visible', '');
    }
    _loadNotes() {
      // Per-slide data-speaker-notes is authoritative when present (attrs
      // travel with the element on reorder/dup/delete); a slide without
      // the attr falls through to the legacy #speaker-notes JSON array
      // PER SLIDE so a single attr on a JSON-authored deck doesn't blank
      // the rest.
      const tag = document.getElementById('speaker-notes');
      let json = null;
      if (tag) try {
        const p = JSON.parse(tag.textContent || '[]');
        if (Array.isArray(p)) json = p;
      } catch (e) {
        console.warn('[deck-stage] Failed to parse #speaker-notes JSON:', e);
      }
      this._notes = this._slides.map((s, i) => {
        const a = s.getAttribute('data-speaker-notes');
        return a !== null ? a : json && typeof json[i] === 'string' ? json[i] : '';
      });
    }
    _restoreIndex() {
      // The host's ?slide= param is delivered as a #<int> hash (1-indexed) on
      // the iframe src. No hash → slide 1; the deck itself keeps no position
      // state across loads.
      const h = (location.hash || '').match(/^#(\d+)$/);
      if (h) {
        const n = parseInt(h[1], 10) - 1;
        if (n >= 0 && n < this._slides.length) this._index = n;
      }
    }
    _applyIndex({
      showOverlay = true,
      broadcast = true,
      reason = 'init'
    } = {}) {
      if (!this._slides.length) return;
      const prev = this._prevIndex == null ? -1 : this._prevIndex;
      const curr = this._index;
      // Keep the iframe's own hash in sync so an in-iframe location.reload()
      // (reload banner path in viewer-handle.ts) lands on the current slide,
      // not the stale deep-link hash from initial load.
      try {
        history.replaceState(null, '', '#' + (curr + 1));
      } catch (e) {}
      this._slides.forEach((s, i) => {
        if (i === curr) s.setAttribute('data-deck-active', '');else s.removeAttribute('data-deck-active');
      });
      if (this._countEl) this._countEl.textContent = String(curr + 1);
      // Follow-scroll on every navigation (init deep-link, keyboard, click,
      // tap, external goTo) — the only time we *don't* want the rail to
      // track current is after a rail-internal mutation, where _renderRail
      // has already restored the user's scroll position and yanking back to
      // current would undo it.
      this._syncRail(reason !== 'mutation');
      if (broadcast) {
        // (1) Legacy: host-window postMessage for speaker-notes renderers.
        try {
          window.postMessage({
            slideIndexChanged: curr,
            deckTotal: this._slides.length,
            deckSkipped: this._skippedIndices()
          }, '*');
        } catch (e) {}

        // (2) In-page CustomEvent on the <deck-stage> element itself.
        //     Bubbles and composes out of shadow DOM so slide code can listen:
        //       document.querySelector('deck-stage').addEventListener('slidechange', e => {
        //         e.detail.index, e.detail.previousIndex, e.detail.total, e.detail.slide, e.detail.reason
        //       });
        const detail = {
          index: curr,
          previousIndex: prev,
          total: this._slides.length,
          slide: this._slides[curr] || null,
          previousSlide: prev >= 0 ? this._slides[prev] || null : null,
          reason: reason // 'init' | 'keyboard' | 'click' | 'tap' | 'api'
        };
        this.dispatchEvent(new CustomEvent('slidechange', {
          detail,
          bubbles: true,
          composed: true
        }));
      }
      this._prevIndex = curr;
      if (showOverlay) this._flashOverlay();
    }
    _flashOverlay() {
      // Host posts __omelette_presenting while in fullscreen/tab presentation
      // mode — suppress the nav footer entirely (both hover and slide-change
      // flash) so the audience sees clean slides.
      if (!this._overlay || this._presenting) return;
      this._overlay.setAttribute('data-visible', '');
      if (this._hideTimer) clearTimeout(this._hideTimer);
      this._hideTimer = setTimeout(() => {
        this._overlay.removeAttribute('data-visible');
      }, OVERLAY_HIDE_MS);
    }
    _railWidth() {
      // State-based, no offsetWidth: the first _fit() can run before the
      // rail has had layout on some load paths, and a 0 there paints the
      // slide full-width for one frame before the post-slotchange _fit()
      // corrects it.
      if (!this._railEnabled || !this._railVisible || this.hasAttribute('no-rail') || this.hasAttribute('noscale') || this._presenting || this._previewMode || NARROW_MQ.matches) return 0;
      return this._railPx || 0;
    }
    _fit() {
      if (!this._canvas) return;
      const stage = this._canvas.parentElement;
      // PPTX export sets noscale so the DOM capture sees authored-size
      // geometry — the scaled canvas is in shadow DOM, so the exporter's
      // resetTransformSelector can't reach .canvas.style.transform directly.
      if (this.hasAttribute('noscale')) {
        this._canvas.style.transform = 'none';
        if (stage) stage.style.left = '0';
        if (this._overlay) this._overlay.style.marginLeft = '0';
        return;
      }
      const rw = this._railWidth();
      if (stage) stage.style.left = rw + 'px';
      // Overlay is centred on the viewport via left:50% + translate(-50%);
      // marginLeft shifts the centre by rw/2 so it lands in the middle of
      // the [rw, innerWidth] stage region.
      if (this._overlay) this._overlay.style.marginLeft = rw / 2 + 'px';
      const vw = window.innerWidth - rw;
      const vh = window.innerHeight;
      const s = Math.min(vw / this.designWidth, vh / this.designHeight);
      this._canvas.style.transform = `scale(${s})`;
    }
    _onResize() {
      this._fit();
      // Crossing the narrow-viewport breakpoint reveals the rail — rerun the
      // thumbnail scale the same way _setRailWidth does.
      if (!this._scaleRaf) {
        this._scaleRaf = requestAnimationFrame(() => {
          this._scaleRaf = null;
          this._scaleThumbs();
        });
      }
    }
    _onMouseMove() {
      // Keep overlay visible while mouse moves; hide after idle.
      this._flashOverlay();
    }
    _onMessage(e) {
      const d = e.data;
      if (d && typeof d.__omelette_presenting === 'boolean') {
        this._presenting = d.__omelette_presenting;
        if (this._presenting && this._overlay) {
          this._overlay.removeAttribute('data-visible');
          if (this._hideTimer) clearTimeout(this._hideTimer);
        }
        this._syncRailHidden();
        this._closeMenu();
        this._closeConfirm();
        this._fit();
        this._scaleThumbs();
      }
      // Host's Preview segment (ViewerMode='none'): the rail's drag-reorder /
      // right-click skip-delete affordances are editing chrome, so hide it
      // while the user is just looking at the deck. Same hard-hide path as
      // presenting; independent of the user's _railVisible preference so
      // returning to Edit restores whatever they had.
      if (d && typeof d.__omelette_preview_mode === 'boolean') {
        if (d.__omelette_preview_mode === this._previewMode) return;
        this._previewMode = d.__omelette_preview_mode;
        this._syncRailHidden();
        this._closeMenu();
        this._closeConfirm();
        this._fit();
        this._scaleThumbs();
      }
      // Host has processed a dc-op; rail input is safe again. Not tied to
      // slotchange — setAttr and refusal don't fire one. On refusal,
      // revert the optimistic _index/hash adjustment so the next nav
      // starts from what's actually on screen.
      if (d && d.__dc_op_ack) {
        this._railLock = false;
        if (d.applied === false && this._indexBeforeEmit != null) {
          this._index = this._indexBeforeEmit;
          try {
            history.replaceState(null, '', '#' + (this._index + 1));
          } catch (e) {}
        }
        this._indexBeforeEmit = null;
      }
      // Per-viewer show/hide, driven by the TweaksPanel's auto-injected
      // "Thumbnail rail" toggle (or any author script). Independent of
      // whether the Tweaks panel itself is open — closing the panel
      // doesn't change rail visibility. Persists alongside rail width.
      if (d && d.type === '__deck_rail_visible' && typeof d.on === 'boolean') {
        if (d.on === this._railVisible) return;
        this._railVisible = d.on;
        try {
          localStorage.setItem('deck-stage.railVisible', d.on ? '1' : '0');
        } catch (e) {}
        // Arm the transition, commit it, then flip state — otherwise the
        // browser coalesces both writes and nothing animates on show.
        this.setAttribute('data-rail-anim', '');
        void (this._rail && this._rail.offsetHeight);
        this._syncRailHidden();
        this._fit();
        this._scaleThumbs();
        clearTimeout(this._railAnimTimer);
        this._railAnimTimer = setTimeout(() => this.removeAttribute('data-rail-anim'), 220);
      }
      if (d && d.type === '__omelette_rail_enabled') this._enableRail();
    }
    _syncRailHidden() {
      if (!this._rail) return;
      // data-presenting is the hard hide (display:none) for flag-off,
      // presentation mode, and the host's Preview segment — instant, no
      // transition. data-user-hidden is the soft hide (translateX(-100%))
      // for the viewer's rail toggle, so show/hide slides under
      // :host([data-rail-anim]).
      const hard = !this._railEnabled || this._presenting || this._previewMode;
      if (hard) this._rail.setAttribute('data-presenting', '');else this._rail.removeAttribute('data-presenting');
      if (!this._railVisible) this._rail.setAttribute('data-user-hidden', '');else this._rail.removeAttribute('data-user-hidden');
      // translateX hide leaves thumbs (tabIndex=0) in the tab order —
      // inert keeps them unfocusable while the rail is off-screen.
      this._rail.inert = hard || !this._railVisible;
    }
    _onTap(e) {
      // Touch-only — keyboard + the overlay toolbar cover nav on desktop.
      if (FINE_POINTER_MQ.matches) return;
      // Only taps that land on the stage (slide content or letterbox); the
      // overlay / rail / menus are siblings with their own click handlers.
      const path = e.composedPath();
      if (!this._stage || !path.includes(this._stage)) return;
      // Let interactive slide content keep the tap. composedPath (not
      // e.target.closest) so we see through open shadow roots — a <button>
      // inside a slide-authored custom element retargets e.target to the
      // host but still appears in the composed path.
      if (e.defaultPrevented) return;
      for (const n of path) {
        if (n === this._stage) break;
        if (n.matches && n.matches(INTERACTIVE_SEL)) return;
      }
      e.preventDefault();
      const rw = this._railWidth();
      const mid = rw + (window.innerWidth - rw) / 2;
      this._advance(e.clientX < mid ? -1 : 1, 'tap');
    }
    _onKey(e) {
      // Ignore when the user is typing.
      const t = e.target;
      if (t && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName))) return;
      // Confirm dialog swallows nav keys while open; Escape cancels. Enter
      // is left to the focused button's native activation so Tab→Cancel
      // →Enter activates Cancel, not the window-level confirm path.
      if (this._confirm && this._confirm.hasAttribute('data-open')) {
        if (e.key === 'Escape') {
          this._closeConfirm();
          e.preventDefault();
        }
        return;
      }
      if (e.key === 'Escape' && this._menu && this._menu.hasAttribute('data-open')) {
        this._closeMenu();
        e.preventDefault();
        return;
      }
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const key = e.key;
      let handled = true;
      if (key === 'ArrowRight' || key === 'PageDown' || key === ' ' || key === 'Spacebar') {
        this._advance(1, 'keyboard');
      } else if (key === 'ArrowLeft' || key === 'PageUp') {
        this._advance(-1, 'keyboard');
      } else if (key === 'Home') {
        this._go(0, 'keyboard');
      } else if (key === 'End') {
        this._go(this._slides.length - 1, 'keyboard');
      } else if (key === 'r' || key === 'R') {
        this._go(0, 'keyboard');
      } else if (/^[0-9]$/.test(key)) {
        // 1..9 jump to that slide; 0 jumps to 10.
        const n = key === '0' ? 9 : parseInt(key, 10) - 1;
        if (n < this._slides.length) this._go(n, 'keyboard');
      } else {
        handled = false;
      }
      if (handled) {
        e.preventDefault();
        this._flashOverlay();
      }
    }
    _go(i, reason = 'api') {
      if (!this._slides.length) return;
      const clamped = Math.max(0, Math.min(this._slides.length - 1, i));
      if (clamped === this._index) {
        this._flashOverlay();
        return;
      }
      this._index = clamped;
      this._applyIndex({
        showOverlay: true,
        broadcast: true,
        reason
      });
    }

    /** Step forward/back skipping any slide marked data-deck-skip. Falls
     *  back to _go's clamp-at-ends behaviour (flash overlay) when there's
     *  nothing further in that direction. */
    _advance(dir, reason) {
      if (!this._slides.length) return;
      let i = this._index + dir;
      while (i >= 0 && i < this._slides.length && this._slides[i].hasAttribute('data-deck-skip')) {
        i += dir;
      }
      if (i < 0 || i >= this._slides.length) {
        this._flashOverlay();
        return;
      }
      this._go(i, reason);
    }

    // ── Thumbnail rail ────────────────────────────────────────────────────
    //
    // Thumbs are keyed by slide element and reused across _renderRail()
    // calls, so a reorder/delete is an O(changed) DOM shuffle instead of an
    // O(N) teardown-and-re-clone. Each thumb starts as a lightweight shell
    // (num + empty frame); the clone is materialized lazily by an
    // IntersectionObserver when the frame scrolls into (or near) view, so
    // only visible-ish slides pay the clone + image-decode cost.

    _renderRail() {
      if (!this._rail || !this._railEnabled) {
        this._thumbs = [];
        return;
      }
      // FLIP: record each *materialized* thumb's top before the reconcile.
      // Off-screen (non-materialized) thumbs don't need the animation and
      // skipping their getBoundingClientRect saves a forced layout per
      // off-screen thumb on large decks.
      const prevTops = new Map();
      (this._thumbs || []).forEach(({
        thumb,
        slide,
        host
      }) => {
        if (host) prevTops.set(slide, thumb.getBoundingClientRect().top);
      });
      const st = this._rail.scrollTop;

      // Reconcile: reuse thumbs that already exist for a slide, create
      // shells for new slides, drop thumbs for removed slides.
      const bySlide = new Map();
      (this._thumbs || []).forEach(t => bySlide.set(t.slide, t));
      const next = [];
      this._slides.forEach(slide => {
        let t = bySlide.get(slide);
        if (t) bySlide.delete(slide);else t = this._makeThumb(slide);
        next.push(t);
      });
      // Orphans — slides removed since last render.
      bySlide.forEach(t => {
        if (this._railObserver) this._railObserver.unobserve(t.frame);
        t.thumb.remove();
      });
      // Put thumbs into document order to match _slides. insertBefore on
      // an already-correctly-placed node is a no-op, so this is cheap
      // when nothing moved.
      next.forEach((t, i) => {
        const want = t.thumb;
        const at = this._rail.children[i];
        if (at !== want) this._rail.insertBefore(want, at || null);
        t.i = i;
        t.num.textContent = String(i + 1);
        if (t.slide.hasAttribute('data-deck-skip')) t.thumb.setAttribute('data-skip', '');else t.thumb.removeAttribute('data-skip');
      });
      this._thumbs = next;
      this._rail.scrollTop = st;
      if (prevTops.size) {
        const moved = [];
        this._thumbs.forEach(({
          thumb,
          slide
        }) => {
          const old = prevTops.get(slide);
          if (old == null) return;
          const dy = old - thumb.getBoundingClientRect().top;
          if (Math.abs(dy) < 1) return;
          thumb.style.transition = 'none';
          thumb.style.transform = `translateY(${dy}px)`;
          moved.push(thumb);
        });
        if (moved.length) {
          // Commit the inverted positions before flipping the transition
          // on — otherwise the browser coalesces both style writes and
          // nothing animates.
          void this._rail.offsetHeight;
          moved.forEach(t => {
            t.style.transition = 'transform 180ms cubic-bezier(.2,.7,.3,1)';
            t.style.transform = '';
          });
          setTimeout(() => moved.forEach(t => {
            t.style.transition = '';
          }), 220);
        }
      }
      requestAnimationFrame(() => this._scaleThumbs());
      this._syncRail(false);
    }

    /** Create a lightweight thumb shell for one slide. The clone is
     *  materialized later by the IntersectionObserver. Event handlers
     *  look up the thumb's *current* index (via _thumbs.indexOf) so the
     *  same element can be reused across reorders. */
    _makeThumb(slide) {
      const thumb = document.createElement('div');
      thumb.className = 'thumb';
      thumb.tabIndex = 0;
      const num = document.createElement('div');
      num.className = 'num';
      const frame = document.createElement('div');
      frame.className = 'frame';
      thumb.append(num, frame);
      const entry = {
        thumb,
        num,
        frame,
        slide,
        clone: null,
        host: null,
        i: -1
      };
      // entry.i is refreshed on every _renderRail reconcile pass, so
      // handlers read the thumb's current position without an O(N) scan.
      const idx = () => entry.i;
      thumb.addEventListener('click', () => this._go(idx(), 'click'));
      // ↑/↓ step through the rail when a thumb has focus. _go clamps at the
      // ends and _applyIndex→_syncRail scrolls the new current thumb into
      // view; we move focus to it (preventScroll — _syncRail already
      // scrolled) so a held key walks the whole list. stopPropagation keeps
      // this out of the window-level _onKey nav handler.
      thumb.addEventListener('keydown', e => {
        if (e.key !== 'ArrowUp' && e.key !== 'ArrowDown') return;
        if (e.metaKey || e.ctrlKey || e.altKey) return;
        e.preventDefault();
        e.stopPropagation();
        this._go(idx() + (e.key === 'ArrowDown' ? 1 : -1), 'keyboard');
        const cur = this._thumbs && this._thumbs[this._index];
        if (cur) cur.thumb.focus({
          preventScroll: true
        });
      });
      thumb.addEventListener('contextmenu', e => {
        e.preventDefault();
        this._openMenu(idx(), e.clientX, e.clientY);
      });
      thumb.draggable = true;
      thumb.addEventListener('dragstart', e => {
        this._dragFrom = idx();
        thumb.setAttribute('data-dragging', '');
        e.dataTransfer.effectAllowed = 'move';
        try {
          e.dataTransfer.setData('text/plain', String(this._dragFrom));
        } catch (err) {}
      });
      thumb.addEventListener('dragend', () => {
        thumb.removeAttribute('data-dragging');
        this._clearDrop();
        this._dragFrom = null;
      });
      thumb.addEventListener('dragover', e => {
        if (this._dragFrom == null) return;
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        const r = thumb.getBoundingClientRect();
        this._setDrop(idx(), e.clientY < r.top + r.height / 2 ? 'before' : 'after');
      });
      thumb.addEventListener('drop', e => {
        if (this._dragFrom == null) return;
        e.preventDefault();
        const i = idx();
        const r = thumb.getBoundingClientRect();
        let to = e.clientY >= r.top + r.height / 2 ? i + 1 : i;
        if (this._dragFrom < to) to--;
        const from = this._dragFrom;
        this._clearDrop();
        this._dragFrom = null;
        if (to !== from) this._moveSlide(from, to);
      });
      if (this._railObserver) this._railObserver.observe(frame);
      frame.__deckThumb = entry;
      return entry;
    }

    /** Lazily build the clone for a thumb that has scrolled into view. */
    _materialize(entry) {
      if (entry.host) return;
      const dw = this.designWidth,
        dh = this.designHeight;
      let clone = entry.slide.cloneNode(true);
      clone.removeAttribute('id');
      clone.removeAttribute('data-deck-active');
      clone.querySelectorAll('[id]').forEach(el => el.removeAttribute('id'));
      // Neuter heavy media; replace <video> with its poster so the box
      // keeps a visual. <iframe>/<audio> become empty placeholders.
      clone.querySelectorAll('iframe, audio, object, embed').forEach(el => {
        el.removeAttribute('src');
        el.removeAttribute('srcdoc');
        el.removeAttribute('data');
        el.innerHTML = '';
      });
      clone.querySelectorAll('video').forEach(el => {
        if (!el.poster) {
          el.removeAttribute('src');
          el.innerHTML = '';
          return;
        }
        const img = document.createElement('img');
        img.src = el.poster;
        img.alt = '';
        img.style.cssText = el.style.cssText + ';object-fit:cover;width:100%;height:100%;';
        img.className = el.className;
        el.replaceWith(img);
      });
      // Images: defer decode and let the browser pick the smallest
      // srcset candidate for the ~140px thumb. Same-URL clones reuse the
      // slide's decoded bitmap (URL-keyed cache), so the remaining cost
      // is paint/composite — lazy+async keeps that off the main thread.
      clone.querySelectorAll('img').forEach(el => {
        el.loading = 'lazy';
        el.decoding = 'async';
        if (el.srcset) el.sizes = (this._railPx || 188) + 'px';
      });
      // Custom elements inside the slide would have their
      // connectedCallback fire when the clone is appended. Replace them
      // with inert boxes so a component-heavy deck doesn't run N copies
      // of each component's mount logic in the rail. Children are
      // preserved so layout-wrapper elements (<my-column><h2>…</h2>)
      // still show their authored content; the querySelectorAll NodeList
      // is static, so nested custom elements in the moved subtree are
      // still visited on later iterations.
      const neuter = el => {
        const box = document.createElement('div');
        box.style.cssText = (el.getAttribute('style') || '') + ';background:rgba(0,0,0,0.06);border:1px dashed rgba(0,0,0,0.15);';
        box.className = el.className;
        // Preserve theming/i18n hooks so [data-*] / :lang() / [dir]
        // descendant selectors still match the neutered root.
        for (const a of el.attributes) {
          const n = a.name;
          if (n.startsWith('data-') || n.startsWith('aria-') || n === 'lang' || n === 'dir' || n === 'role' || n === 'title') {
            box.setAttribute(n, a.value);
          }
        }
        while (el.firstChild) box.appendChild(el.firstChild);
        return box;
      };
      // querySelectorAll('*') returns descendants only — a custom-element
      // slide root (<my-slide>…</my-slide>) would slip through and upgrade
      // on append. Swap the root first.
      if (clone.tagName.includes('-')) clone = neuter(clone);
      clone.querySelectorAll('*').forEach(el => {
        if (el.tagName.includes('-')) el.replaceWith(neuter(el));
      });
      clone.style.cssText += ';position:absolute;top:0;left:0;transform-origin:0 0;' + 'pointer-events:none;width:' + dw + 'px;height:' + dh + 'px;' + 'box-sizing:border-box;overflow:hidden;visibility:visible;opacity:1;';
      const host = document.createElement('div');
      host.style.cssText = 'position:absolute;inset:0;';
      this._syncThumbHostAttrs(host);
      const sr = host.attachShadow({
        mode: 'open'
      });
      if (this._adoptedSheet) sr.adoptedStyleSheets = [this._adoptedSheet];else {
        const st = document.createElement('style');
        st.textContent = this._authorCss || '';
        sr.appendChild(st);
      }
      sr.appendChild(clone);
      entry.frame.appendChild(host);
      entry.host = host;
      entry.clone = clone;
      if (this._thumbScale) clone.style.transform = 'scale(' + this._thumbScale + ')';
      // Once materialized the IO callback is a no-op early-return —
      // unobserve so scroll doesn't keep firing it.
      if (this._railObserver) this._railObserver.unobserve(entry.frame);
    }

    /** Re-clone a single thumb (live-update path). No-op if the thumb
     *  hasn't been materialized yet — it'll pick up current content when
     *  it scrolls into view. */
    _refreshThumb(slide) {
      const entry = (this._thumbs || []).find(t => t.slide === slide);
      if (!entry || !entry.host) return;
      entry.host.remove();
      entry.host = entry.clone = null;
      this._materialize(entry);
    }
    _scaleThumbs() {
      if (!this._thumbs || !this._thumbs.length) return;
      // Every frame is the same width; if it reads 0 the rail is
      // display:none (noscale / no-rail / presenting / print) — leave the
      // clones as-is and re-run when the rail is revealed.
      const fw = this._thumbs[0].frame.offsetWidth;
      if (!fw) return;
      this._thumbScale = fw / this.designWidth;
      this._thumbs.forEach(({
        clone
      }) => {
        if (clone) clone.style.transform = 'scale(' + this._thumbScale + ')';
      });
    }
    _setDrop(i, where) {
      // dragover fires at pointer-event rate; touch only the previous
      // and new target rather than sweeping all N thumbs.
      const t = this._thumbs && this._thumbs[i];
      if (this._dropOn && this._dropOn !== t) {
        this._dropOn.thumb.removeAttribute('data-drop');
      }
      if (t) t.thumb.setAttribute('data-drop', where);
      this._dropOn = t || null;
    }
    _clearDrop() {
      if (this._dropOn) this._dropOn.thumb.removeAttribute('data-drop');
      this._dropOn = null;
    }
    _syncRail(follow) {
      if (!this._thumbs) return;
      this._thumbs.forEach(({
        thumb
      }, i) => {
        if (i === this._index) {
          thumb.setAttribute('data-current', '');
          if (follow && typeof thumb.scrollIntoView === 'function') {
            thumb.scrollIntoView({
              block: 'nearest'
            });
          }
        } else {
          thumb.removeAttribute('data-current');
        }
      });
    }
    _openMenu(i, x, y) {
      if (!this._menu) return;
      this._menuIndex = i;
      const slide = this._slides[i];
      const skip = slide && slide.hasAttribute('data-deck-skip');
      this._menu.querySelector('[data-act="skip"]').textContent = skip ? 'Unskip slide' : 'Skip slide';
      this._menu.querySelector('[data-act="up"]').disabled = i <= 0;
      this._menu.querySelector('[data-act="down"]').disabled = i >= this._slides.length - 1;
      this._menu.querySelector('[data-act="delete"]').disabled = this._slides.length <= 1;
      // Place, then clamp to viewport after it's measurable.
      this._menu.style.left = x + 'px';
      this._menu.style.top = y + 'px';
      this._menu.setAttribute('data-open', '');
      const r = this._menu.getBoundingClientRect();
      const nx = Math.min(x, window.innerWidth - r.width - 4);
      const ny = Math.min(y, window.innerHeight - r.height - 4);
      this._menu.style.left = Math.max(4, nx) + 'px';
      this._menu.style.top = Math.max(4, ny) + 'px';
    }
    _closeMenu() {
      if (this._menu) this._menu.removeAttribute('data-open');
      this._menuIndex = -1;
    }
    _openConfirm(i) {
      if (!this._confirm) return;
      this._confirmIndex = i;
      this._confirm.querySelector('.title').textContent = 'Delete slide ' + (i + 1) + '?';
      this._confirm.setAttribute('data-open', '');
      const btn = this._confirm.querySelector('.danger');
      if (btn && btn.focus) btn.focus();
    }
    _closeConfirm() {
      if (this._confirm) this._confirm.removeAttribute('data-open');
      this._confirmIndex = -1;
    }

    /** Rail mutations. When a dc-runtime is present (`window.__dcUpdate`)
     *  the host owns the light DOM — handlers emit a dc-op only and the
     *  host applies it (to the editor's model or to the source file) and
     *  re-renders via dc-runtime; slotchange catches the rail up.
     *  Structural ops lock rail input until the host acks so a rapid second
     *  click can't address a stale index; setAttr/removeAttr respect the
     *  lock but don't set it (indices unchanged; the host serializes).
     *  `newIndex` is written to location.hash so slotchange's
     *  _restoreIndex lands on the right slide.
     *
     *  With NO dc-runtime (a raw .html deck), there's no re-render path,
     *  so handlers self-mutate locally for an instant update and emit
     *  `emitOnly: false`; the host persists to disk without
     *  re-rendering over the already-mutated DOM.
     *
     *  See docs/dc-ops.md for the contract. */
    _emitDcOp(op, slide, lock, newIndex) {
      // Slide index (template/script/style filtered — same as
      // _collectSlides). deck-stage is a filtered-index dc-op emitter;
      // the host resolves against findDeckStage().slideTids. Callers
      // already pass `to` as a slide index.
      op.at = this._slides.indexOf(slide);
      op.witness = {
        childCount: this._slides.length
      };
      // dc-runtime wraps an <x-import>-mounted component in a
      // <div class="sc-host-x" data-dc-tpl="N"> host — the stamp is on the
      // WRAPPER, not this element. closest() finds it (or this element's
      // own stamp when directly templated).
      const host = this.closest('[data-dc-tpl]');
      const tid = host && host.getAttribute('data-dc-tpl');
      op.mount = {
        tid: tid !== null ? parseInt(tid, 10) : null,
        tag: 'deck-stage'
      };
      op.emitOnly = !!window.__dcUpdate;
      if (op.emitOnly) {
        if (lock) this._railLock = true;
        if (newIndex != null && newIndex !== this._index) {
          this._indexBeforeEmit = this._index;
          this._index = newIndex;
          try {
            history.replaceState(null, '', '#' + (newIndex + 1));
          } catch (e) {}
        }
      }
      this.dispatchEvent(new CustomEvent('dc-op', {
        detail: op,
        bubbles: true,
        composed: true
      }));
      return op.emitOnly;
    }
    _deleteSlide(i) {
      if (this._railLock) return;
      const slide = this._slides[i];
      if (!slide || this._slides.length <= 1) return;
      const cur = this._index;
      const ni = i < cur || i === cur && i === this._slides.length - 1 ? cur - 1 : cur;
      if (this._emitDcOp({
        op: 'remove'
      }, slide, true, ni)) return;
      this._index = ni;
      this._squelchSlotChange = true;
      slide.remove();
      this._collectSlides();
      this._applyIndex({
        showOverlay: true,
        broadcast: true,
        reason: 'mutation'
      });
    }
    _duplicateSlide(i) {
      if (this._railLock) return;
      const slide = this._slides[i];
      if (!slide) return;
      if (this._emitDcOp({
        op: 'duplicate'
      }, slide, true, i + 1)) return;
      const copy = slide.cloneNode(true);
      copy.removeAttribute('id');
      copy.querySelectorAll('[id]').forEach(el => el.removeAttribute('id'));
      this._index = i + 1;
      this._squelchSlotChange = true;
      this.insertBefore(copy, slide.nextSibling);
      this._collectSlides();
      this._applyIndex({
        showOverlay: true,
        broadcast: true,
        reason: 'mutation'
      });
    }
    _toggleSkip(i) {
      if (this._railLock) return;
      const slide = this._slides[i];
      if (!slide) return;
      const on = !slide.hasAttribute('data-deck-skip');
      if (this._emitDcOp(on ? {
        op: 'setAttr',
        attr: 'data-deck-skip',
        value: ''
      } : {
        op: 'removeAttr',
        attr: 'data-deck-skip'
      }, slide, false)) return;
      if (on) slide.setAttribute('data-deck-skip', '');else slide.removeAttribute('data-deck-skip');
    }
    _skippedIndices() {
      const out = [];
      for (let i = 0; i < this._slides.length; i++) {
        if (this._slides[i].hasAttribute('data-deck-skip')) out.push(i);
      }
      return out;
    }
    _moveSlide(i, j) {
      if (this._railLock || j < 0 || j >= this._slides.length || j === i) return;
      const cur = this._index;
      const ni = cur === i ? j : i < cur && j >= cur ? cur - 1 : i > cur && j <= cur ? cur + 1 : cur;
      const slide = this._slides[i];
      if (this._emitDcOp({
        op: 'move',
        to: j
      }, slide, true, ni)) return;
      const ref = j < i ? this._slides[j] : this._slides[j].nextSibling;
      this._index = ni;
      this._squelchSlotChange = true;
      this.insertBefore(slide, ref);
      this._collectSlides();
      this._applyIndex({
        showOverlay: false,
        broadcast: true,
        reason: 'mutation'
      });
    }

    // Public API ------------------------------------------------------------

    /** Current slide index (0-based). */
    get index() {
      return this._index;
    }
    /** Total slide count. */
    get length() {
      return this._slides.length;
    }
    /** Programmatically navigate. */
    goTo(i) {
      this._go(i, 'api');
    }
    next() {
      this._advance(1, 'api');
    }
    prev() {
      this._advance(-1, 'api');
    }
    reset() {
      this._go(0, 'api');
    }
  }
  if (!customElements.get('deck-stage')) {
    customElements.define('deck-stage', DeckStage);
  }
})();
})(); } catch (e) { __ds_ns.__errors.push({ path: "deck/deck-stage.js", error: String((e && e.message) || e) }); }

// ui_kits/admin-dashboard/app.jsx
try { (() => {
// Krama admin console — shell + KPI overview (with bar chart) + job approval queue.
(function init() {
  if (!window.KramaDesignSystem_1a6f65) {
    return setTimeout(init, 40);
  }
  const NS = window.KramaDesignSystem_1a6f65;
  const {
    Button,
    Badge,
    StatusBadge,
    Avatar,
    Card,
    StatCard,
    Tabs,
    Checkbox,
    Switch,
    Select,
    Input,
    Textarea,
    IconButton,
    EmptyState
  } = NS;
  const I = (n, s = 18) => /*#__PURE__*/React.createElement("i", {
    "data-lucide": n,
    style: {
      width: s,
      height: s
    }
  });
  const NAV = [{
    id: "dashboard",
    label: "Dashboard",
    icon: "layout-dashboard"
  }, {
    id: "companies",
    label: "Companies",
    icon: "building-2",
    badge: 5
  }, {
    id: "jobs",
    label: "Jobs",
    icon: "briefcase",
    badge: 12
  }, {
    id: "candidates",
    label: "Candidates",
    icon: "users"
  }, {
    id: "categories",
    label: "Categories",
    icon: "tags"
  }, {
    id: "homepage",
    label: "Homepage",
    icon: "layout-template"
  }, {
    id: "chat",
    label: "Chat agent",
    icon: "bot"
  }, {
    id: "payments",
    label: "Payments",
    icon: "credit-card"
  }, {
    id: "reports",
    label: "Reports",
    icon: "chart-line"
  }, {
    id: "banners",
    label: "Banners",
    icon: "megaphone"
  }, {
    id: "settings",
    label: "Settings",
    icon: "settings"
  }];
  function Sidebar({
    page,
    onNav
  }) {
    return /*#__PURE__*/React.createElement("aside", {
      style: {
        width: 248,
        flexShrink: 0,
        background: "var(--stone-900)",
        display: "flex",
        flexDirection: "column",
        padding: "20px 14px",
        position: "sticky",
        top: 0,
        height: "100vh"
      }
    }, /*#__PURE__*/React.createElement("img", {
      src: "../../assets/krama-logo-light.svg",
      height: "28",
      alt: "Krama",
      style: {
        margin: "4px 8px 8px"
      }
    }), /*#__PURE__*/React.createElement("div", {
      style: {
        margin: "0 8px 18px",
        fontSize: "var(--text-xs)",
        fontWeight: 700,
        letterSpacing: ".1em",
        textTransform: "uppercase",
        color: "var(--stone-500)"
      }
    }, "Admin console"), /*#__PURE__*/React.createElement("nav", {
      style: {
        display: "flex",
        flexDirection: "column",
        gap: 3
      }
    }, NAV.map(n => {
      const active = page === n.id;
      return /*#__PURE__*/React.createElement("button", {
        key: n.id,
        onClick: () => onNav(n.id),
        style: {
          display: "flex",
          alignItems: "center",
          gap: 11,
          border: "none",
          cursor: "pointer",
          padding: "10px 12px",
          borderRadius: "var(--radius-md)",
          textAlign: "left",
          background: active ? "rgba(255,255,255,0.10)" : "transparent",
          color: active ? "#fff" : "var(--stone-300)",
          fontFamily: "var(--font-sans)",
          fontWeight: active ? 700 : 500,
          fontSize: "var(--text-base)"
        }
      }, /*#__PURE__*/React.createElement("span", {
        style: {
          display: "inline-flex",
          color: active ? "var(--teal-300)" : "var(--stone-400)"
        }
      }, I(n.icon, 19)), /*#__PURE__*/React.createElement("span", {
        style: {
          flex: 1
        }
      }, n.label), n.badge && /*#__PURE__*/React.createElement("span", {
        style: {
          fontSize: "var(--text-xs)",
          fontWeight: 700,
          padding: "1px 7px",
          borderRadius: 99,
          background: "var(--saffron-500)",
          color: "#fff"
        }
      }, n.badge));
    })));
  }
  function Topbar({
    title
  }) {
    return /*#__PURE__*/React.createElement("header", {
      style: {
        height: 64,
        flexShrink: 0,
        borderBottom: "1px solid var(--border)",
        background: "var(--surface-card)",
        display: "flex",
        alignItems: "center",
        gap: 16,
        padding: "0 28px",
        position: "sticky",
        top: 0,
        zIndex: 10
      }
    }, /*#__PURE__*/React.createElement("h1", {
      style: {
        fontSize: "var(--text-xl)",
        fontWeight: 700,
        color: "var(--text-strong)"
      }
    }, title), /*#__PURE__*/React.createElement("div", {
      style: {
        marginLeft: "auto",
        display: "flex",
        alignItems: "center",
        gap: 14
      }
    }, /*#__PURE__*/React.createElement("button", {
      style: {
        position: "relative",
        width: 40,
        height: 40,
        border: "1px solid var(--border)",
        borderRadius: "var(--radius-md)",
        background: "var(--surface-card)",
        cursor: "pointer",
        color: "var(--text-muted)",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center"
      }
    }, I("bell", 18), /*#__PURE__*/React.createElement("span", {
      style: {
        position: "absolute",
        top: 7,
        right: 8,
        width: 7,
        height: 7,
        borderRadius: "50%",
        background: "var(--accent)",
        border: "1.5px solid var(--surface-card)"
      }
    })), /*#__PURE__*/React.createElement(Avatar, {
      name: "Admin",
      size: 40
    })));
  }
  const BARS = [["Jan", 60], ["Feb", 75], ["Mar", 58], ["Apr", 88], ["May", 96], ["Jun", 72], ["Jul", 110], ["Aug", 84], ["Sep", 120], ["Oct", 102], ["Nov", 134], ["Dec", 118]];
  function Overview() {
    const max = Math.max(...BARS.map(b => b[1]));
    return /*#__PURE__*/React.createElement("div", {
      style: {
        padding: 28,
        display: "flex",
        flexDirection: "column",
        gap: 24
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: "grid",
        gridTemplateColumns: "repeat(3,1fr)",
        gap: 16
      }
    }, /*#__PURE__*/React.createElement(StatCard, {
      label: "Total jobs",
      value: "3,482",
      delta: "8%",
      tone: "brand",
      icon: I("briefcase", 22)
    }), /*#__PURE__*/React.createElement(StatCard, {
      label: "Active jobs",
      value: "1,204",
      delta: "5%",
      tone: "success",
      icon: I("circle-check-big", 22)
    }), /*#__PURE__*/React.createElement(StatCard, {
      label: "Pending approval",
      value: "12",
      tone: "warning",
      icon: I("clock", 22)
    }), /*#__PURE__*/React.createElement(StatCard, {
      label: "Companies",
      value: "486",
      delta: "3%",
      tone: "info",
      icon: I("building-2", 22)
    }), /*#__PURE__*/React.createElement(StatCard, {
      label: "Candidates",
      value: "41,920",
      delta: "12%",
      tone: "brand",
      icon: I("users", 22)
    }), /*#__PURE__*/React.createElement(StatCard, {
      label: "Revenue (MTD)",
      value: "$28,640",
      delta: "9%",
      tone: "accent",
      icon: I("banknote", 22)
    })), /*#__PURE__*/React.createElement(Card, {
      padding: 24
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 22
      }
    }, /*#__PURE__*/React.createElement("h2", {
      style: {
        fontSize: "var(--text-lg)",
        fontWeight: 700,
        color: "var(--text-strong)"
      }
    }, "Monthly job posts"), /*#__PURE__*/React.createElement(Badge, {
      tone: "brand"
    }, "2026")), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        alignItems: "flex-end",
        gap: 12,
        height: 180
      }
    }, BARS.map(([m, v], i) => /*#__PURE__*/React.createElement("div", {
      key: m,
      style: {
        flex: 1,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 8
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        width: "100%",
        maxWidth: 36,
        height: v / max * 150,
        background: i === 10 ? "var(--accent)" : "var(--teal-500)",
        borderRadius: "var(--radius-sm) var(--radius-sm) 0 0",
        transition: "height var(--dur-slow) var(--ease-out)"
      }
    }), /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: "var(--text-xs)",
        color: "var(--text-faint)"
      }
    }, m))))));
  }
  const QUEUE = [{
    title: "Senior Accountant",
    company: "ABA Bank",
    cat: "Accounting",
    date: "14 Jun 2026",
    verified: true
  }, {
    title: "DevOps Engineer",
    company: "Smart Axiata",
    cat: "IT",
    date: "14 Jun 2026",
    verified: true
  }, {
    title: "Sales Executive",
    company: "Chip Mong Retail",
    cat: "Marketing",
    date: "13 Jun 2026",
    verified: true
  }, {
    title: "Crypto Trader (urgent!!)",
    company: "QuickCash Ltd",
    cat: "Finance",
    date: "13 Jun 2026",
    verified: false
  }, {
    title: "HR Coordinator",
    company: "Manulife",
    cat: "HR",
    date: "12 Jun 2026",
    verified: true
  }];
  function Approvals() {
    const [sel, setSel] = React.useState([]);
    const [tab, setTab] = React.useState("pending");
    const toggle = i => setSel(s => s.includes(i) ? s.filter(x => x !== i) : [...s, i]);
    const allSel = sel.length === QUEUE.length;
    return /*#__PURE__*/React.createElement("div", {
      style: {
        padding: 28
      }
    }, /*#__PURE__*/React.createElement(Tabs, {
      value: tab,
      onChange: setTab,
      tabs: [{
        value: "pending",
        label: "Pending",
        count: 12
      }, {
        value: "published",
        label: "Published",
        count: 1204
      }, {
        value: "rejected",
        label: "Rejected",
        count: 38
      }],
      style: {
        marginBottom: 20
      }
    }), sel.length > 0 && /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: "12px 18px",
        background: "var(--teal-800)",
        borderRadius: "var(--radius-md)",
        marginBottom: 14
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        color: "#fff",
        fontWeight: 600,
        fontSize: "var(--text-sm)"
      }
    }, sel.length, " selected"), /*#__PURE__*/React.createElement("div", {
      style: {
        marginLeft: "auto",
        display: "flex",
        gap: 8
      }
    }, /*#__PURE__*/React.createElement(Button, {
      variant: "accent",
      size: "sm",
      iconLeft: I("check", 14)
    }, "Approve selected"), /*#__PURE__*/React.createElement(Button, {
      variant: "secondary",
      size: "sm"
    }, "Reject selected"))), /*#__PURE__*/React.createElement(Card, {
      padding: 0
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: "grid",
        gridTemplateColumns: "40px 2fr 1.4fr 1fr 1fr 200px",
        padding: "12px 18px",
        fontSize: "var(--text-xs)",
        fontWeight: 700,
        letterSpacing: ".04em",
        textTransform: "uppercase",
        color: "var(--text-faint)",
        borderBottom: "1px solid var(--border)",
        alignItems: "center"
      }
    }, /*#__PURE__*/React.createElement(Checkbox, {
      checked: allSel,
      onChange: () => setSel(allSel ? [] : QUEUE.map((_, i) => i))
    }), /*#__PURE__*/React.createElement("span", null, "Job title"), /*#__PURE__*/React.createElement("span", null, "Employer"), /*#__PURE__*/React.createElement("span", null, "Category"), /*#__PURE__*/React.createElement("span", null, "Submitted"), /*#__PURE__*/React.createElement("span", {
      style: {
        textAlign: "right"
      }
    }, "Actions")), QUEUE.map((j, i) => /*#__PURE__*/React.createElement("div", {
      key: i,
      style: {
        display: "grid",
        gridTemplateColumns: "40px 2fr 1.4fr 1fr 1fr 200px",
        alignItems: "center",
        padding: "14px 18px",
        borderBottom: i < QUEUE.length - 1 ? "1px solid var(--border-subtle)" : "none",
        background: sel.includes(i) ? "var(--brand-subtle)" : "transparent"
      }
    }, /*#__PURE__*/React.createElement(Checkbox, {
      checked: sel.includes(i),
      onChange: () => toggle(i)
    }), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      style: {
        fontWeight: 600,
        color: "var(--text-strong)"
      }
    }, j.title), /*#__PURE__*/React.createElement(StatusBadge, {
      status: "pending"
    })), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        alignItems: "center",
        gap: 8
      }
    }, /*#__PURE__*/React.createElement(Avatar, {
      name: j.company,
      square: true,
      size: 30
    }), /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: "var(--text-sm)",
        color: "var(--text-body)",
        display: "flex",
        alignItems: "center",
        gap: 4
      }
    }, j.company, j.verified ? /*#__PURE__*/React.createElement("span", {
      style: {
        color: "var(--brand)",
        display: "inline-flex"
      }
    }, I("badge-check", 13)) : /*#__PURE__*/React.createElement("span", {
      title: "Unverified",
      style: {
        color: "var(--warning)",
        display: "inline-flex"
      }
    }, I("triangle-alert", 13)))), /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement(Badge, {
      tone: "neutral"
    }, j.cat)), /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: "var(--text-sm)",
        color: "var(--text-muted)"
      }
    }, j.date), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        gap: 8,
        justifyContent: "flex-end"
      }
    }, /*#__PURE__*/React.createElement(Button, {
      variant: "primary",
      size: "sm",
      iconLeft: I("check", 14)
    }, "Approve"), /*#__PURE__*/React.createElement(Button, {
      variant: "secondary",
      size: "sm"
    }, "Reject"))))));
  }
  function ScreenHead({
    title,
    sub,
    action
  }) {
    return /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "space-between",
        marginBottom: 18
      }
    }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h2", {
      style: {
        fontSize: "var(--text-xl)",
        fontWeight: 700,
        color: "var(--text-strong)"
      }
    }, title), sub && /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: "var(--text-sm)",
        color: "var(--text-muted)",
        marginTop: 4
      }
    }, sub)), action);
  }
  const COMPANIES = [{
    name: "ABA Bank",
    industry: "Financial services",
    reg: "00012345-2010",
    jobs: 12,
    status: "approved"
  }, {
    name: "Smart Axiata",
    industry: "Telecommunications",
    reg: "00033211-2009",
    jobs: 8,
    status: "approved"
  }, {
    name: "QuickCash Ltd",
    industry: "Finance",
    reg: "—",
    jobs: 0,
    status: "pending"
  }, {
    name: "Chip Mong Group",
    industry: "Retail",
    reg: "00091122-2012",
    jobs: 6,
    status: "approved"
  }, {
    name: "GoldTrade Express",
    industry: "Logistics",
    reg: "00120931-2023",
    jobs: 1,
    status: "suspended"
  }, {
    name: "Prince Bank",
    industry: "Financial services",
    reg: "00077654-2018",
    jobs: 4,
    status: "pending"
  }];
  const CANDIDATES = [{
    name: "Sok Dara",
    title: "Senior Accountant",
    location: "Phnom Penh",
    applied: 12,
    status: "active"
  }, {
    name: "Chan Mony",
    title: "Finance Officer",
    location: "Phnom Penh",
    applied: 7,
    status: "active"
  }, {
    name: "Heng Visal",
    title: "Data Analyst",
    location: "Siem Reap",
    applied: 4,
    status: "active"
  }, {
    name: "Lim Chhay",
    title: "Bookkeeper",
    location: "Battambang",
    applied: 9,
    status: "suspended"
  }, {
    name: "Neang Sreyleak",
    title: "Financial Controller",
    location: "Phnom Penh",
    applied: 3,
    status: "active"
  }];
  const CATEGORIES = [{
    name: "Information Technology",
    slug: "it",
    icon: "monitor",
    jobs: 1240,
    status: "active"
  }, {
    name: "Accounting",
    slug: "accounting",
    icon: "calculator",
    jobs: 860,
    status: "active"
  }, {
    name: "Finance",
    slug: "finance",
    icon: "landmark",
    jobs: 540,
    status: "active"
  }, {
    name: "Marketing",
    slug: "marketing",
    icon: "megaphone",
    jobs: 720,
    status: "active"
  }, {
    name: "Human Resources",
    slug: "hr",
    icon: "users",
    jobs: 410,
    status: "active"
  }, {
    name: "Engineering",
    slug: "engineering",
    icon: "hard-hat",
    jobs: 630,
    status: "inactive"
  }];
  const APP_BARS = [["Jan", 320], ["Feb", 410], ["Mar", 380], ["Apr", 520], ["May", 610], ["Jun", 470], ["Jul", 680], ["Aug", 540], ["Sep", 720], ["Oct", 660], ["Nov", 810], ["Dec", 760]];
  function CompaniesMgmt() {
    const [tab, setTab] = React.useState("pending");
    return /*#__PURE__*/React.createElement("div", {
      style: {
        padding: 28
      }
    }, /*#__PURE__*/React.createElement(ScreenHead, {
      title: "Company management",
      sub: "Approve, reject, or suspend employer companies."
    }), /*#__PURE__*/React.createElement(Tabs, {
      value: tab,
      onChange: setTab,
      tabs: [{
        value: "pending",
        label: "Pending",
        count: 5
      }, {
        value: "approved",
        label: "Approved",
        count: 481
      }, {
        value: "suspended",
        label: "Suspended",
        count: 4
      }],
      style: {
        marginBottom: 18
      }
    }), /*#__PURE__*/React.createElement(Card, {
      padding: 0
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: "grid",
        gridTemplateColumns: "2fr 1.3fr 1.2fr 0.7fr 1fr 180px",
        padding: "12px 20px",
        fontSize: "var(--text-xs)",
        fontWeight: 700,
        letterSpacing: ".04em",
        textTransform: "uppercase",
        color: "var(--text-faint)",
        borderBottom: "1px solid var(--border)"
      }
    }, /*#__PURE__*/React.createElement("span", null, "Company"), /*#__PURE__*/React.createElement("span", null, "Industry"), /*#__PURE__*/React.createElement("span", null, "Reg. number"), /*#__PURE__*/React.createElement("span", null, "Jobs"), /*#__PURE__*/React.createElement("span", null, "Status"), /*#__PURE__*/React.createElement("span", {
      style: {
        textAlign: "right"
      }
    }, "Actions")), COMPANIES.map((c, i) => /*#__PURE__*/React.createElement("div", {
      key: i,
      style: {
        display: "grid",
        gridTemplateColumns: "2fr 1.3fr 1.2fr 0.7fr 1fr 180px",
        alignItems: "center",
        padding: "14px 20px",
        borderBottom: i < COMPANIES.length - 1 ? "1px solid var(--border-subtle)" : "none"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        alignItems: "center",
        gap: 10
      }
    }, /*#__PURE__*/React.createElement(Avatar, {
      name: c.name,
      square: true,
      size: 34
    }), /*#__PURE__*/React.createElement("span", {
      style: {
        fontWeight: 600,
        color: "var(--text-strong)"
      }
    }, c.name)), /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: "var(--text-sm)",
        color: "var(--text-body)"
      }
    }, c.industry), /*#__PURE__*/React.createElement("span", {
      style: {
        fontFamily: "var(--font-mono)",
        fontSize: "var(--text-sm)",
        color: "var(--text-muted)"
      }
    }, c.reg), /*#__PURE__*/React.createElement("span", {
      style: {
        fontFamily: "var(--font-mono)",
        fontSize: "var(--text-sm)",
        color: "var(--text-body)"
      }
    }, c.jobs), /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement(StatusBadge, {
      status: c.status === "approved" ? "approved" : c.status === "pending" ? "pending" : "suspended"
    })), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        gap: 8,
        justifyContent: "flex-end"
      }
    }, c.status === "pending" ? /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(Button, {
      variant: "primary",
      size: "sm",
      iconLeft: I("check", 13)
    }, "Approve"), /*#__PURE__*/React.createElement(Button, {
      variant: "secondary",
      size: "sm"
    }, "Reject")) : /*#__PURE__*/React.createElement(Button, {
      variant: "secondary",
      size: "sm"
    }, c.status === "suspended" ? "Reinstate" : "Suspend"))))));
  }
  function Candidates() {
    return /*#__PURE__*/React.createElement("div", {
      style: {
        padding: 28
      }
    }, /*#__PURE__*/React.createElement(ScreenHead, {
      title: "Candidates",
      sub: "41,920 registered candidates. Activate, suspend, or reset access."
    }), /*#__PURE__*/React.createElement(Card, {
      padding: 0
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: "grid",
        gridTemplateColumns: "2fr 1.6fr 1.2fr 0.8fr 1fr 150px",
        padding: "12px 20px",
        fontSize: "var(--text-xs)",
        fontWeight: 700,
        letterSpacing: ".04em",
        textTransform: "uppercase",
        color: "var(--text-faint)",
        borderBottom: "1px solid var(--border)"
      }
    }, /*#__PURE__*/React.createElement("span", null, "Name"), /*#__PURE__*/React.createElement("span", null, "Title"), /*#__PURE__*/React.createElement("span", null, "Location"), /*#__PURE__*/React.createElement("span", null, "Applied"), /*#__PURE__*/React.createElement("span", null, "Status"), /*#__PURE__*/React.createElement("span", {
      style: {
        textAlign: "right"
      }
    }, "Actions")), CANDIDATES.map((c, i) => /*#__PURE__*/React.createElement("div", {
      key: i,
      style: {
        display: "grid",
        gridTemplateColumns: "2fr 1.6fr 1.2fr 0.8fr 1fr 150px",
        alignItems: "center",
        padding: "14px 20px",
        borderBottom: i < CANDIDATES.length - 1 ? "1px solid var(--border-subtle)" : "none"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        alignItems: "center",
        gap: 10
      }
    }, /*#__PURE__*/React.createElement(Avatar, {
      name: c.name,
      size: 34
    }), /*#__PURE__*/React.createElement("span", {
      style: {
        fontWeight: 600,
        color: "var(--text-strong)"
      }
    }, c.name)), /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: "var(--text-sm)",
        color: "var(--text-body)"
      }
    }, c.title), /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: "var(--text-sm)",
        color: "var(--text-muted)"
      }
    }, c.location), /*#__PURE__*/React.createElement("span", {
      style: {
        fontFamily: "var(--font-mono)",
        fontSize: "var(--text-sm)",
        color: "var(--text-body)"
      }
    }, c.applied), /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement(Badge, {
      tone: c.status === "active" ? "success" : "danger"
    }, c.status === "active" ? "Active" : "Suspended")), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        gap: 8,
        justifyContent: "flex-end"
      }
    }, /*#__PURE__*/React.createElement(Button, {
      variant: "secondary",
      size: "sm"
    }, c.status === "active" ? "Suspend" : "Activate"))))));
  }
  function Categories() {
    return /*#__PURE__*/React.createElement("div", {
      style: {
        padding: 28
      }
    }, /*#__PURE__*/React.createElement(ScreenHead, {
      title: "Categories",
      sub: "Manage the job taxonomy candidates browse by.",
      action: /*#__PURE__*/React.createElement(Button, {
        variant: "primary",
        iconLeft: I("plus", 16)
      }, "New category")
    }), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "grid",
        gridTemplateColumns: "repeat(2,1fr)",
        gap: 14
      }
    }, CATEGORIES.map(c => /*#__PURE__*/React.createElement(Card, {
      key: c.slug,
      padding: 18
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        alignItems: "center",
        gap: 14
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        width: 44,
        height: 44,
        borderRadius: "var(--radius-md)",
        background: "var(--brand-subtle)",
        color: "var(--brand)"
      }
    }, I(c.icon, 22)), /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontWeight: 700,
        color: "var(--text-strong)"
      }
    }, c.name), /*#__PURE__*/React.createElement("div", {
      style: {
        fontFamily: "var(--font-mono)",
        fontSize: "var(--text-xs)",
        color: "var(--text-faint)",
        marginTop: 2
      }
    }, "/", c.slug, " \xB7 ", c.jobs.toLocaleString(), " jobs")), /*#__PURE__*/React.createElement(Badge, {
      tone: c.status === "active" ? "success" : "neutral"
    }, c.status === "active" ? "Active" : "Inactive"), /*#__PURE__*/React.createElement("span", {
      style: {
        color: "var(--text-faint)",
        cursor: "pointer",
        display: "inline-flex"
      }
    }, I("pencil", 16)))))));
  }
  function Reports() {
    const max = Math.max(...APP_BARS.map(b => b[1]));
    const topCats = CATEGORIES.slice().sort((a, b) => b.jobs - a.jobs).slice(0, 5);
    const catMax = Math.max(...topCats.map(c => c.jobs));
    return /*#__PURE__*/React.createElement("div", {
      style: {
        padding: 28,
        display: "flex",
        flexDirection: "column",
        gap: 24
      }
    }, /*#__PURE__*/React.createElement(ScreenHead, {
      title: "Reports",
      sub: "Marketplace activity across 2026.",
      action: /*#__PURE__*/React.createElement(Button, {
        variant: "secondary",
        iconLeft: I("download", 16)
      }, "Export CSV")
    }), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "grid",
        gridTemplateColumns: "repeat(3,1fr)",
        gap: 16
      }
    }, /*#__PURE__*/React.createElement(StatCard, {
      label: "Applications (YTD)",
      value: "6,680",
      delta: "11%",
      tone: "info",
      icon: I("send", 22)
    }), /*#__PURE__*/React.createElement(StatCard, {
      label: "New registrations",
      value: "4,210",
      delta: "7%",
      tone: "brand",
      icon: I("user-plus", 22)
    }), /*#__PURE__*/React.createElement(StatCard, {
      label: "Approval rate",
      value: "92%",
      tone: "success",
      icon: I("circle-check-big", 22)
    })), /*#__PURE__*/React.createElement(Card, {
      padding: 24
    }, /*#__PURE__*/React.createElement("h2", {
      style: {
        fontSize: "var(--text-lg)",
        fontWeight: 700,
        color: "var(--text-strong)",
        marginBottom: 22
      }
    }, "Applications per month"), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        alignItems: "flex-end",
        gap: 12,
        height: 170
      }
    }, APP_BARS.map(([m, v]) => /*#__PURE__*/React.createElement("div", {
      key: m,
      style: {
        flex: 1,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 8
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        width: "100%",
        maxWidth: 36,
        height: v / max * 140,
        background: "var(--info)",
        borderRadius: "var(--radius-sm) var(--radius-sm) 0 0"
      }
    }), /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: "var(--text-xs)",
        color: "var(--text-faint)"
      }
    }, m))))), /*#__PURE__*/React.createElement(Card, {
      padding: 24
    }, /*#__PURE__*/React.createElement("h2", {
      style: {
        fontSize: "var(--text-lg)",
        fontWeight: 700,
        color: "var(--text-strong)",
        marginBottom: 18
      }
    }, "Top categories by open jobs"), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        flexDirection: "column",
        gap: 14
      }
    }, topCats.map(c => /*#__PURE__*/React.createElement("div", {
      key: c.slug,
      style: {
        display: "flex",
        alignItems: "center",
        gap: 14
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        width: 150,
        fontSize: "var(--text-sm)",
        fontWeight: 600,
        color: "var(--text-strong)"
      }
    }, c.name), /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1,
        height: 10,
        background: "var(--surface-sunken)",
        borderRadius: 99,
        overflow: "hidden"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        width: c.jobs / catMax * 100 + "%",
        height: "100%",
        background: "var(--brand)"
      }
    })), /*#__PURE__*/React.createElement("span", {
      style: {
        width: 60,
        textAlign: "right",
        fontFamily: "var(--font-mono)",
        fontSize: "var(--text-sm)",
        color: "var(--text-body)"
      }
    }, c.jobs.toLocaleString()))))));
  }

  // ===== User management — roles & permissions ============================
  const ROLES = {
    super_admin: {
      label: "Super Admin",
      tone: "danger",
      desc: "Full control of the entire system."
    },
    admin: {
      label: "Admin",
      tone: "brand",
      desc: "Moderates content; no billing or role changes."
    },
    employer: {
      label: "Employer",
      tone: "info",
      desc: "Posts jobs and manages applicants."
    },
    candidate: {
      label: "Candidate",
      tone: "neutral",
      desc: "Searches and applies to jobs."
    }
  };

  // permission catalogue grouped by area
  const PERM_GROUPS = [{
    group: "Dashboard & reports",
    perms: [["view_dashboard", "View dashboard"], ["view_reports", "View reports"], ["view_audit", "View audit logs"]]
  }, {
    group: "Moderation",
    perms: [["approve_companies", "Approve companies"], ["approve_jobs", "Approve jobs"], ["suspend_users", "Suspend users"]]
  }, {
    group: "Content",
    perms: [["manage_categories", "Manage categories"], ["manage_locations", "Manage locations"], ["manage_cms", "Manage CMS pages"]]
  }, {
    group: "Commerce",
    perms: [["manage_plans", "Manage plans"], ["manage_payments", "Manage payments"]]
  }, {
    group: "Administration",
    perms: [["manage_users", "Manage users"], ["manage_roles", "Manage roles & permissions"], ["site_settings", "Site settings"]]
  }, {
    group: "Employer actions",
    perms: [["post_jobs", "Post jobs"], ["view_applicants", "View applicants"], ["download_resume", "Download résumés"]]
  }, {
    group: "Candidate actions",
    perms: [["apply_jobs", "Apply to jobs"], ["build_resume", "Build résumé"], ["save_jobs", "Save jobs"]]
  }];
  const ALL_PERMS = PERM_GROUPS.flatMap(g => g.perms.map(p => p[0]));

  // default permission set per role
  const ROLE_PERMS = {
    super_admin: ALL_PERMS,
    admin: ["view_dashboard", "view_reports", "view_audit", "approve_companies", "approve_jobs", "suspend_users", "manage_categories", "manage_locations", "manage_cms"],
    employer: ["view_dashboard", "post_jobs", "view_applicants", "download_resume"],
    candidate: ["apply_jobs", "build_resume", "save_jobs"]
  };
  const USERS = [{
    id: "USR-1001",
    name: "Sophea Chan",
    email: "sophea@krama.com",
    role: "super_admin",
    status: "active",
    last: "2m ago"
  }, {
    id: "USR-1002",
    name: "Vichea Lim",
    email: "vichea@krama.com",
    role: "admin",
    status: "active",
    last: "1h ago"
  }, {
    id: "USR-1003",
    name: "Davin Ouk",
    email: "davin@krama.com",
    role: "admin",
    status: "active",
    last: "Yesterday"
  }, {
    id: "USR-2041",
    name: "ABA Bank HR",
    email: "hr@ababank.com",
    role: "employer",
    status: "active",
    last: "3h ago"
  }, {
    id: "USR-2042",
    name: "Smart Axiata TA",
    email: "talent@smart.com.kh",
    role: "employer",
    status: "active",
    last: "2d ago"
  }, {
    id: "USR-2043",
    name: "QuickCash Ltd",
    email: "jobs@quickcash.kh",
    role: "employer",
    status: "suspended",
    last: "1w ago"
  }, {
    id: "USR-3087",
    name: "Sok Dara",
    email: "dara.sok@email.com",
    role: "candidate",
    status: "active",
    last: "5m ago"
  }, {
    id: "USR-3088",
    name: "Chan Mony",
    email: "mony.chan@email.com",
    role: "candidate",
    status: "active",
    last: "30m ago"
  }, {
    id: "USR-3091",
    name: "Lim Chhay",
    email: "chhay.lim@email.com",
    role: "candidate",
    status: "suspended",
    last: "3w ago"
  }];
  function RoleBadge({
    role
  }) {
    const r = ROLES[role];
    return /*#__PURE__*/React.createElement(Badge, {
      tone: r.tone
    }, r.label);
  }
  function PermissionDrawer({
    user,
    onClose
  }) {
    const [role, setRole] = React.useState(user ? user.role : "candidate");
    const [perms, setPerms] = React.useState(user ? ROLE_PERMS[user.role] : []);
    React.useEffect(() => {
      if (user) {
        setRole(user.role);
        setPerms(ROLE_PERMS[user.role]);
      }
    }, [user]);
    React.useEffect(() => {
      if (window.lucide) window.lucide.createIcons();
    });
    if (!user) return null;
    const setRoleAndDefaults = r => {
      setRole(r);
      setPerms(ROLE_PERMS[r]);
    };
    const toggle = p => setPerms(s => s.includes(p) ? s.filter(x => x !== p) : [...s, p]);
    return /*#__PURE__*/React.createElement("div", {
      onClick: onClose,
      style: {
        position: "fixed",
        inset: 0,
        zIndex: 200,
        background: "var(--surface-overlay)",
        display: "flex",
        justifyContent: "flex-end",
        animation: "krmfade var(--dur-base) var(--ease-out)"
      }
    }, /*#__PURE__*/React.createElement("div", {
      onClick: e => e.stopPropagation(),
      style: {
        width: 480,
        maxWidth: "92vw",
        height: "100%",
        background: "var(--surface-card)",
        boxShadow: "var(--shadow-xl)",
        display: "flex",
        flexDirection: "column",
        animation: "krmslide var(--dur-base) var(--ease-out)"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: "20px 24px",
        borderBottom: "1px solid var(--border)"
      }
    }, /*#__PURE__*/React.createElement(Avatar, {
      name: user.name,
      size: 44
    }), /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1,
        minWidth: 0
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontFamily: "var(--font-display)",
        fontWeight: 700,
        fontSize: "var(--text-lg)",
        color: "var(--text-strong)"
      }
    }, user.name), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: "var(--text-sm)",
        color: "var(--text-muted)"
      }
    }, user.email, " \xB7 ", /*#__PURE__*/React.createElement("span", {
      style: {
        fontFamily: "var(--font-mono)",
        fontSize: "var(--text-xs)"
      }
    }, user.id))), /*#__PURE__*/React.createElement(IconButton, {
      "aria-label": "Close",
      onClick: onClose
    }, I("x", 18))), /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1,
        overflowY: "auto",
        padding: 24
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: "var(--text-sm)",
        fontWeight: 700,
        color: "var(--text-strong)",
        marginBottom: 10
      }
    }, "Role"), /*#__PURE__*/React.createElement(Select, {
      value: role,
      onChange: e => setRoleAndDefaults(e.target.value),
      options: Object.keys(ROLES).map(k => ({
        value: k,
        label: ROLES[k].label
      }))
    }), /*#__PURE__*/React.createElement("p", {
      style: {
        fontSize: "var(--text-sm)",
        color: "var(--text-muted)",
        margin: "8px 0 22px"
      }
    }, ROLES[role].desc), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 12
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: "var(--text-sm)",
        fontWeight: 700,
        color: "var(--text-strong)"
      }
    }, "Permissions"), /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: "var(--text-xs)",
        color: "var(--text-muted)"
      }
    }, perms.length, " of ", ALL_PERMS.length, " enabled")), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        flexDirection: "column",
        gap: 18
      }
    }, PERM_GROUPS.map(g => /*#__PURE__*/React.createElement("div", {
      key: g.group
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: "var(--text-xs)",
        fontWeight: 700,
        letterSpacing: ".06em",
        textTransform: "uppercase",
        color: "var(--text-faint)",
        marginBottom: 10
      }
    }, g.group), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        flexDirection: "column",
        gap: 12
      }
    }, g.perms.map(([id, label]) => /*#__PURE__*/React.createElement("div", {
      key: id,
      style: {
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between"
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: "var(--text-sm)",
        color: "var(--text-body)"
      }
    }, label), /*#__PURE__*/React.createElement(Switch, {
      checked: perms.includes(id),
      onChange: () => toggle(id)
    })))))))), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        gap: 10,
        padding: "16px 24px",
        borderTop: "1px solid var(--border)"
      }
    }, /*#__PURE__*/React.createElement(Button, {
      variant: "ghost",
      onClick: onClose
    }, "Cancel"), /*#__PURE__*/React.createElement(Button, {
      variant: "primary",
      block: true,
      onClick: onClose
    }, "Save changes"))), /*#__PURE__*/React.createElement("style", null, `
          @keyframes krmfade { from { opacity: 0 } to { opacity: 1 } }
          @keyframes krmslide { from { transform: translateX(40px); opacity: .4 } to { transform: none; opacity: 1 } }
        `));
  }
  function Settings() {
    const [tab, setTab] = React.useState("users");
    const [filter, setFilter] = React.useState("all");
    const [editing, setEditing] = React.useState(null);
    const filtered = filter === "all" ? USERS : USERS.filter(u => u.role === filter);
    const counts = {
      all: USERS.length,
      super_admin: 0,
      admin: 0,
      employer: 0,
      candidate: 0
    };
    USERS.forEach(u => {
      counts[u.role]++;
    });
    return /*#__PURE__*/React.createElement("div", {
      style: {
        padding: 28
      }
    }, /*#__PURE__*/React.createElement(ScreenHead, {
      title: "User management",
      sub: "Every user across the platform in one place. Assign roles and fine-tune permissions."
    }), /*#__PURE__*/React.createElement(Tabs, {
      value: tab,
      onChange: setTab,
      tabs: [{
        value: "users",
        label: "Users",
        count: USERS.length
      }, {
        value: "roles",
        label: "Roles & permissions",
        count: 4
      }],
      style: {
        marginBottom: 20
      }
    }), tab === "users" && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        alignItems: "center",
        gap: 12,
        marginBottom: 16
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        alignItems: "center",
        gap: 8,
        height: 40,
        padding: "0 12px",
        border: "1px solid var(--border-strong)",
        borderRadius: "var(--radius-md)",
        background: "var(--surface-card)",
        width: 260
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        color: "var(--text-faint)"
      }
    }, I("search", 16)), /*#__PURE__*/React.createElement("input", {
      placeholder: "Search name or email",
      style: {
        border: "none",
        outline: "none",
        flex: 1,
        fontFamily: "var(--font-sans)",
        fontSize: "var(--text-sm)"
      }
    })), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        gap: 6,
        marginLeft: "auto",
        flexWrap: "wrap"
      }
    }, [["all", "All"], ["super_admin", "Super Admin"], ["admin", "Admin"], ["employer", "Employer"], ["candidate", "Candidate"]].map(([id, label]) => /*#__PURE__*/React.createElement("button", {
      key: id,
      onClick: () => setFilter(id),
      style: {
        height: 34,
        padding: "0 12px",
        borderRadius: "var(--radius-pill)",
        cursor: "pointer",
        border: "1px solid " + (filter === id ? "var(--brand)" : "var(--border-strong)"),
        background: filter === id ? "var(--brand-subtle)" : "var(--surface-card)",
        color: filter === id ? "var(--text-brand)" : "var(--text-body)",
        fontFamily: "var(--font-sans)",
        fontSize: "var(--text-sm)",
        fontWeight: 600
      }
    }, label, " ", /*#__PURE__*/React.createElement("span", {
      style: {
        opacity: 0.6
      }
    }, counts[id])))), /*#__PURE__*/React.createElement(Button, {
      variant: "primary",
      iconLeft: I("user-plus", 16)
    }, "Invite user")), /*#__PURE__*/React.createElement(Card, {
      padding: 0
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: "grid",
        gridTemplateColumns: "2.2fr 1.2fr 1fr 1fr 132px",
        padding: "12px 20px",
        fontSize: "var(--text-xs)",
        fontWeight: 700,
        letterSpacing: ".04em",
        textTransform: "uppercase",
        color: "var(--text-faint)",
        borderBottom: "1px solid var(--border)"
      }
    }, /*#__PURE__*/React.createElement("span", null, "User"), /*#__PURE__*/React.createElement("span", null, "Role"), /*#__PURE__*/React.createElement("span", null, "Status"), /*#__PURE__*/React.createElement("span", null, "Last active"), /*#__PURE__*/React.createElement("span", {
      style: {
        textAlign: "right"
      }
    }, "Actions")), filtered.map((u, i) => /*#__PURE__*/React.createElement("div", {
      key: u.id,
      style: {
        display: "grid",
        gridTemplateColumns: "2.2fr 1.2fr 1fr 1fr 132px",
        alignItems: "center",
        padding: "13px 20px",
        borderBottom: i < filtered.length - 1 ? "1px solid var(--border-subtle)" : "none"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        alignItems: "center",
        gap: 11,
        minWidth: 0
      }
    }, /*#__PURE__*/React.createElement(Avatar, {
      name: u.name,
      size: 36
    }), /*#__PURE__*/React.createElement("div", {
      style: {
        minWidth: 0
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontWeight: 600,
        color: "var(--text-strong)",
        whiteSpace: "nowrap",
        overflow: "hidden",
        textOverflow: "ellipsis"
      }
    }, u.name), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: "var(--text-sm)",
        color: "var(--text-muted)",
        whiteSpace: "nowrap",
        overflow: "hidden",
        textOverflow: "ellipsis"
      }
    }, u.email))), /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement(RoleBadge, {
      role: u.role
    })), /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement(Badge, {
      tone: u.status === "active" ? "success" : "danger"
    }, u.status === "active" ? "Active" : "Suspended")), /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: "var(--text-sm)",
        color: "var(--text-muted)"
      }
    }, u.last), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        gap: 6,
        justifyContent: "flex-end"
      }
    }, /*#__PURE__*/React.createElement(Button, {
      variant: "secondary",
      size: "sm",
      onClick: () => setEditing(u)
    }, "Edit"), /*#__PURE__*/React.createElement(IconButton, {
      size: "sm",
      variant: "ghost",
      "aria-label": "More options"
    }, I("ellipsis", 16))))))), tab === "roles" && /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        flexDirection: "column",
        gap: 16
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: "grid",
        gridTemplateColumns: "repeat(4,1fr)",
        gap: 14
      }
    }, Object.keys(ROLES).map(k => /*#__PURE__*/React.createElement(Card, {
      key: k,
      padding: 18
    }, /*#__PURE__*/React.createElement(RoleBadge, {
      role: k
    }), /*#__PURE__*/React.createElement("p", {
      style: {
        fontSize: "var(--text-sm)",
        color: "var(--text-muted)",
        margin: "10px 0 12px",
        lineHeight: 1.5,
        minHeight: 42
      }
    }, ROLES[k].desc), /*#__PURE__*/React.createElement("div", {
      style: {
        fontFamily: "var(--font-mono)",
        fontSize: "var(--text-xs)",
        color: "var(--text-faint)"
      }
    }, ROLE_PERMS[k].length, " permissions \xB7 ", USERS.filter(u => u.role === k).length, " users")))), /*#__PURE__*/React.createElement(Card, {
      padding: 0
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        padding: "16px 20px",
        borderBottom: "1px solid var(--border)",
        fontWeight: 700,
        color: "var(--text-strong)"
      }
    }, "Permission matrix"), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "grid",
        gridTemplateColumns: "1.6fr repeat(4, 1fr)",
        padding: "10px 20px",
        fontSize: "var(--text-xs)",
        fontWeight: 700,
        letterSpacing: ".04em",
        textTransform: "uppercase",
        color: "var(--text-faint)",
        borderBottom: "1px solid var(--border)",
        position: "sticky",
        top: 0,
        background: "var(--surface-card)"
      }
    }, /*#__PURE__*/React.createElement("span", null, "Permission"), Object.keys(ROLES).map(k => /*#__PURE__*/React.createElement("span", {
      key: k,
      style: {
        textAlign: "center"
      }
    }, ROLES[k].label))), PERM_GROUPS.map(g => /*#__PURE__*/React.createElement(React.Fragment, {
      key: g.group
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        padding: "10px 20px",
        background: "var(--surface-sunken)",
        fontSize: "var(--text-xs)",
        fontWeight: 700,
        letterSpacing: ".05em",
        textTransform: "uppercase",
        color: "var(--text-muted)"
      }
    }, g.group), g.perms.map(([id, label]) => /*#__PURE__*/React.createElement("div", {
      key: id,
      style: {
        display: "grid",
        gridTemplateColumns: "1.6fr repeat(4, 1fr)",
        alignItems: "center",
        padding: "11px 20px",
        borderBottom: "1px solid var(--border-subtle)"
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: "var(--text-sm)",
        color: "var(--text-body)"
      }
    }, label), Object.keys(ROLES).map(k => /*#__PURE__*/React.createElement("span", {
      key: k,
      style: {
        display: "flex",
        justifyContent: "center",
        color: ROLE_PERMS[k].includes(id) ? "var(--success)" : "var(--stone-300)"
      }
    }, ROLE_PERMS[k].includes(id) ? I("check", 18) : I("minus", 16))))))))), /*#__PURE__*/React.createElement(PermissionDrawer, {
      user: editing,
      onClose: () => setEditing(null)
    }));
  }

  // ===== Promotional banner manager ======================================
  const BANNER_THEMES = {
    saffron: {
      label: "Saffron",
      bg: "var(--saffron-500)",
      fg: "#fff",
      ctaBg: "#fff",
      ctaFg: "var(--saffron-700)"
    },
    teal: {
      label: "Teal",
      bg: "var(--teal-700)",
      fg: "#fff",
      ctaBg: "#fff",
      ctaFg: "var(--teal-700)"
    },
    dark: {
      label: "Dark",
      bg: "var(--stone-900)",
      fg: "#fff",
      ctaBg: "var(--saffron-500)",
      ctaFg: "#fff"
    }
  };
  const BANNER_IMAGES = [{
    id: "",
    label: "None"
  }, {
    id: "jobfair",
    label: "Job fair",
    src: "../../assets/banners/banner-jobfair.png"
  }, {
    id: "ai",
    label: "AI / teal",
    src: "../../assets/banners/banner-ai.png"
  }, {
    id: "hiring",
    label: "Hiring / dark",
    src: "../../assets/banners/banner-hiring.png"
  }];
  const bannerImgSrc = id => {
    if (!id) return null;
    if (/^(data:|https?:|\.|\/)/.test(id)) return id; // uploaded data-URL or direct path
    const m = BANNER_IMAGES.find(x => x.id === id);
    return m ? m.src : null;
  };
  function BannerStrip({
    data,
    onDismiss
  }) {
    const t = BANNER_THEMES[data.theme] || BANNER_THEMES.saffron;
    const img = bannerImgSrc(data.image);
    const center = data.align === "center";
    return /*#__PURE__*/React.createElement("div", {
      style: {
        position: "relative",
        overflow: "hidden",
        background: t.bg,
        color: "#fff"
      }
    }, img ? /*#__PURE__*/React.createElement("div", {
      style: {
        position: "absolute",
        inset: 0,
        backgroundImage: "url('" + img + "')",
        backgroundSize: data.fit === "contain" ? "contain" : "cover",
        backgroundRepeat: "no-repeat",
        backgroundPosition: "center"
      }
    }) : /*#__PURE__*/React.createElement("div", {
      style: {
        position: "absolute",
        inset: 0,
        background: "url('../../assets/krama-pattern.svg')",
        backgroundSize: 60,
        opacity: 0.10
      }
    }), /*#__PURE__*/React.createElement("div", {
      style: {
        position: "relative",
        maxWidth: 1200,
        margin: "0 auto",
        minHeight: 52,
        display: "flex",
        alignItems: "center",
        gap: 14,
        padding: "10px 20px"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1,
        display: "flex",
        alignItems: "center",
        gap: 12,
        minWidth: 0,
        justifyContent: center ? "center" : "flex-start"
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        display: "inline-flex",
        flexShrink: 0
      }
    }, I(data.icon || "megaphone", 18)), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: "var(--text-sm)",
        fontWeight: 500,
        lineHeight: 1.3,
        textAlign: center ? "center" : "left"
      }
    }, /*#__PURE__*/React.createElement("strong", {
      style: {
        fontWeight: 700
      }
    }, data.title), data.message ? /*#__PURE__*/React.createElement("span", {
      style: {
        opacity: 0.92
      }
    }, " \u2014 ", data.message) : null)), data.cta ? /*#__PURE__*/React.createElement("span", {
      style: {
        flexShrink: 0,
        background: img ? "#fff" : t.ctaBg,
        color: img ? "var(--stone-900)" : t.ctaFg,
        fontSize: "var(--text-sm)",
        fontWeight: 700,
        padding: "7px 14px",
        borderRadius: "var(--radius-pill)",
        cursor: "pointer",
        whiteSpace: "nowrap"
      }
    }, data.cta) : null, onDismiss ? /*#__PURE__*/React.createElement("button", {
      onClick: onDismiss,
      "aria-label": "Dismiss",
      style: {
        flexShrink: 0,
        border: "none",
        background: "transparent",
        color: "#fff",
        cursor: "pointer",
        opacity: 0.8,
        display: "inline-flex",
        padding: 4
      }
    }, I("x", 16)) : null));
  }
  const TODAY = "2026-06-17";
  const fmtDate = s => {
    if (!s) return "—";
    const [y, m, d] = s.split("-");
    const mon = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][parseInt(m, 10) - 1];
    return d + " " + mon + " " + y;
  };
  // status: hidden | scheduled | expired | live
  const bannerStatus = b => {
    if (!b.active) return "hidden";
    if (b.start && TODAY < b.start) return "scheduled";
    if (b.end && TODAY > b.end) return "expired";
    return "live";
  };
  const STATUS_TONE = {
    live: "success",
    scheduled: "info",
    expired: "neutral",
    hidden: "neutral"
  };
  const STATUS_LABEL = {
    live: "Live",
    scheduled: "Scheduled",
    expired: "Expired",
    hidden: "Hidden"
  };
  const ICON_OPTS = [{
    value: "party-popper",
    label: "Celebration"
  }, {
    value: "megaphone",
    label: "Announcement"
  }, {
    value: "sparkles",
    label: "Sparkles"
  }, {
    value: "calendar",
    label: "Event"
  }, {
    value: "zap",
    label: "Flash"
  }];
  const INITIAL_BANNERS = [{
    id: "b1",
    title: "Krama Job Fair 2026",
    message: "Meet 80+ verified employers in Phnom Penh this Saturday.",
    cta: "Reserve your spot",
    theme: "saffron",
    icon: "party-popper",
    image: "jobfair",
    align: "left",
    fit: "cover",
    active: true,
    start: "2026-06-10",
    end: "2026-06-21"
  }, {
    id: "b2",
    title: "New: AI job matching",
    message: "Get roles picked for your résumé — now in beta.",
    cta: "Try it",
    theme: "teal",
    icon: "sparkles",
    image: "ai",
    align: "center",
    fit: "cover",
    active: true,
    start: "",
    end: ""
  }, {
    id: "b3",
    title: "Year-end hiring rush",
    message: "Premium listings 20% off through December.",
    cta: "See plans",
    theme: "dark",
    icon: "zap",
    image: "hiring",
    align: "left",
    fit: "cover",
    active: true,
    start: "2026-11-01",
    end: "2026-12-31"
  }];
  function BannerEditorDrawer({
    banner,
    onClose,
    onSave
  }) {
    const [d, setD] = React.useState(banner);
    React.useEffect(() => {
      setD(banner);
    }, [banner]);
    React.useEffect(() => {
      if (window.lucide) window.lucide.createIcons();
    });
    const fileRef = React.useRef(null);
    const [dragOver, setDragOver] = React.useState(false);
    if (!banner || !d) return null;
    const set = (k, v) => setD(x => ({
      ...x,
      [k]: v
    }));
    const readImageFile = f => {
      if (!f || !/^image\//.test(f.type)) return;
      const r = new FileReader();
      r.onload = () => setD(x => ({
        ...x,
        image: r.result,
        fit: x.fit || "cover"
      }));
      r.readAsDataURL(f);
    };
    const onUpload = e => readImageFile(e.target.files && e.target.files[0]);
    const isUploaded = d.image && /^data:/.test(d.image);
    const hasImage = !!d.image;
    const themeBtn = key => {
      const t = BANNER_THEMES[key];
      const sel = d.theme === key;
      return /*#__PURE__*/React.createElement("button", {
        key: key,
        onClick: () => set("theme", key),
        style: {
          flex: 1,
          height: 40,
          borderRadius: "var(--radius-md)",
          cursor: "pointer",
          border: "2px solid " + (sel ? "var(--brand)" : "var(--border)"),
          background: t.bg,
          color: t.fg,
          fontFamily: "var(--font-sans)",
          fontWeight: 700,
          fontSize: "var(--text-sm)"
        }
      }, t.label);
    };
    return /*#__PURE__*/React.createElement("div", {
      onClick: onClose,
      style: {
        position: "fixed",
        inset: 0,
        zIndex: 200,
        background: "var(--surface-overlay)",
        display: "flex",
        justifyContent: "flex-end",
        animation: "krmfade var(--dur-base) var(--ease-out)"
      }
    }, /*#__PURE__*/React.createElement("div", {
      onClick: e => e.stopPropagation(),
      style: {
        width: 520,
        maxWidth: "94vw",
        height: "100%",
        background: "var(--surface-card)",
        boxShadow: "var(--shadow-xl)",
        display: "flex",
        flexDirection: "column",
        animation: "krmslide var(--dur-base) var(--ease-out)"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: "20px 24px",
        borderBottom: "1px solid var(--border)"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1,
        fontFamily: "var(--font-display)",
        fontWeight: 700,
        fontSize: "var(--text-lg)",
        color: "var(--text-strong)"
      }
    }, banner.isNew ? "New banner" : "Edit banner"), /*#__PURE__*/React.createElement(IconButton, {
      "aria-label": "Close",
      onClick: onClose
    }, I("x", 18))), /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1,
        overflowY: "auto",
        padding: 24
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        border: "1px solid var(--border)",
        borderRadius: "var(--radius-md)",
        overflow: "hidden",
        marginBottom: 20
      }
    }, /*#__PURE__*/React.createElement(BannerStrip, {
      data: d,
      onDismiss: null
    })), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        flexDirection: "column",
        gap: 16
      }
    }, /*#__PURE__*/React.createElement(Input, {
      label: "Headline",
      value: d.title,
      onChange: e => set("title", e.target.value)
    }), /*#__PURE__*/React.createElement(Input, {
      label: "Message",
      value: d.message,
      onChange: e => set("message", e.target.value),
      hint: "Keep it short \u2014 it sits on one line."
    }), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: 14
      }
    }, /*#__PURE__*/React.createElement(Input, {
      label: "Button label",
      value: d.cta,
      onChange: e => set("cta", e.target.value)
    }), /*#__PURE__*/React.createElement(Select, {
      label: "Icon",
      value: d.icon,
      onChange: e => set("icon", e.target.value),
      options: ICON_OPTS
    })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: "var(--text-sm)",
        fontWeight: 600,
        color: "var(--text-strong)",
        marginBottom: 8
      }
    }, "Theme"), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        gap: 10
      }
    }, Object.keys(BANNER_THEMES).map(themeBtn))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        alignItems: "center",
        gap: 8,
        marginBottom: 8
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        color: "var(--text-muted)",
        display: "inline-flex"
      }
    }, I("image", 16)), /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: "var(--text-sm)",
        fontWeight: 600,
        color: "var(--text-strong)"
      }
    }, "Background picture")), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "grid",
        gridTemplateColumns: "repeat(4, 1fr)",
        gap: 10
      }
    }, BANNER_IMAGES.map(im => {
      const sel = (d.image || "") === im.id;
      return /*#__PURE__*/React.createElement("button", {
        key: im.id || "none",
        onClick: () => set("image", im.id),
        title: im.label,
        style: {
          position: "relative",
          height: 48,
          borderRadius: "var(--radius-md)",
          cursor: "pointer",
          overflow: "hidden",
          padding: 0,
          border: "2px solid " + (sel ? "var(--brand)" : "var(--border)"),
          background: im.src ? "transparent" : "var(--surface-sunken)",
          backgroundImage: im.src ? "url('" + im.src + "')" : "none",
          backgroundSize: "cover",
          backgroundPosition: "center",
          display: "flex",
          alignItems: "center",
          justifyContent: "center"
        }
      }, !im.src ? /*#__PURE__*/React.createElement("span", {
        style: {
          fontSize: "var(--text-xs)",
          fontWeight: 600,
          color: "var(--text-muted)"
        }
      }, "None") : null, sel ? /*#__PURE__*/React.createElement("span", {
        style: {
          position: "absolute",
          top: 3,
          right: 3,
          width: 16,
          height: 16,
          borderRadius: "50%",
          background: "var(--brand)",
          color: "#fff",
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center"
        }
      }, I("check", 11)) : null);
    }), /*#__PURE__*/React.createElement("button", {
      onClick: () => fileRef.current && fileRef.current.click(),
      onDragOver: e => {
        e.preventDefault();
        setDragOver(true);
      },
      onDragLeave: () => setDragOver(false),
      onDrop: e => {
        e.preventDefault();
        setDragOver(false);
        readImageFile(e.dataTransfer.files && e.dataTransfer.files[0]);
      },
      title: "Upload image",
      style: {
        position: "relative",
        height: 48,
        borderRadius: "var(--radius-md)",
        cursor: "pointer",
        overflow: "hidden",
        padding: 0,
        border: "2px " + (dragOver ? "solid var(--brand)" : isUploaded ? "solid var(--brand)" : "dashed var(--border-strong)"),
        background: dragOver ? "var(--brand-subtle)" : isUploaded ? "transparent" : "var(--surface-sunken)",
        backgroundImage: isUploaded && !dragOver ? "url('" + d.image + "')" : "none",
        backgroundSize: "cover",
        backgroundPosition: "center",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: dragOver ? "var(--brand)" : "var(--text-muted)"
      }
    }, !isUploaded || dragOver ? /*#__PURE__*/React.createElement("span", {
      style: {
        display: "inline-flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 2,
        fontSize: "var(--text-2xs)",
        fontWeight: 600
      }
    }, I(dragOver ? "download" : "upload", 15), dragOver ? "Drop" : "Upload") : null, isUploaded && !dragOver ? /*#__PURE__*/React.createElement("span", {
      style: {
        position: "absolute",
        top: 3,
        right: 3,
        width: 16,
        height: 16,
        borderRadius: "50%",
        background: "var(--brand)",
        color: "#fff",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center"
      }
    }, I("check", 11)) : null)), /*#__PURE__*/React.createElement("input", {
      ref: fileRef,
      type: "file",
      accept: "image/*",
      onChange: onUpload,
      style: {
        display: "none"
      }
    }), /*#__PURE__*/React.createElement("p", {
      style: {
        fontSize: "var(--text-xs)",
        color: "var(--text-muted)",
        marginTop: 8
      }
    }, "Pick a preset, or drag & drop / click Upload for your own (JPG/PNG, wide image works best).")), hasImage ? /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: "var(--text-sm)",
        fontWeight: 600,
        color: "var(--text-strong)",
        marginBottom: 8
      }
    }, "Image fit"), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        gap: 4,
        padding: 4,
        background: "var(--surface-sunken)",
        borderRadius: "var(--radius-md)",
        maxWidth: 240
      }
    }, [["cover", "Cover", "scaling"], ["contain", "Contain", "maximize-2"]].map(([val, label, ic]) => {
      const sel = (d.fit || "cover") === val;
      return /*#__PURE__*/React.createElement("button", {
        key: val,
        onClick: () => set("fit", val),
        style: {
          flex: 1,
          height: 36,
          border: "none",
          cursor: "pointer",
          borderRadius: "var(--radius-sm)",
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 6,
          fontFamily: "var(--font-sans)",
          fontSize: "var(--text-sm)",
          fontWeight: 700,
          background: sel ? "var(--surface-card)" : "transparent",
          color: sel ? "var(--text-brand)" : "var(--text-muted)",
          boxShadow: sel ? "var(--shadow-xs)" : "none"
        }
      }, I(ic, 14), label);
    })), /*#__PURE__*/React.createElement("p", {
      style: {
        fontSize: "var(--text-xs)",
        color: "var(--text-muted)",
        marginTop: 8
      }
    }, "Cover fills the bar (may crop). Contain shows the whole image on the theme color.")) : null, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: "var(--text-sm)",
        fontWeight: 600,
        color: "var(--text-strong)",
        marginBottom: 8
      }
    }, "Text position"), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        gap: 4,
        padding: 4,
        background: "var(--surface-sunken)",
        borderRadius: "var(--radius-md)",
        maxWidth: 240
      }
    }, [["left", "Left", "align-left"], ["center", "Center", "align-center"]].map(([val, label, ic]) => {
      const sel = (d.align || "left") === val;
      return /*#__PURE__*/React.createElement("button", {
        key: val,
        onClick: () => set("align", val),
        style: {
          flex: 1,
          height: 36,
          border: "none",
          cursor: "pointer",
          borderRadius: "var(--radius-sm)",
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 6,
          fontFamily: "var(--font-sans)",
          fontSize: "var(--text-sm)",
          fontWeight: 700,
          background: sel ? "var(--surface-card)" : "transparent",
          color: sel ? "var(--text-brand)" : "var(--text-muted)",
          boxShadow: sel ? "var(--shadow-xs)" : "none"
        }
      }, I(ic, 15), label);
    }))), /*#__PURE__*/React.createElement("div", {
      style: {
        borderTop: "1px solid var(--border-subtle)",
        paddingTop: 16
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        alignItems: "center",
        gap: 8,
        marginBottom: 12
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        color: "var(--text-muted)",
        display: "inline-flex"
      }
    }, I("calendar-clock", 16)), /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: "var(--text-sm)",
        fontWeight: 700,
        color: "var(--text-strong)"
      }
    }, "Scheduling window")), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: 14
      }
    }, /*#__PURE__*/React.createElement(Input, {
      label: "Start date",
      type: "date",
      value: d.start,
      onChange: e => set("start", e.target.value)
    }), /*#__PURE__*/React.createElement(Input, {
      label: "End date",
      type: "date",
      value: d.end,
      onChange: e => set("end", e.target.value)
    })), /*#__PURE__*/React.createElement("p", {
      style: {
        fontSize: "var(--text-xs)",
        color: "var(--text-muted)",
        marginTop: 8
      }
    }, "Leave a date blank for no bound. The banner only shows while active and within the window.")), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        borderTop: "1px solid var(--border-subtle)",
        paddingTop: 16
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: "var(--text-sm)",
        fontWeight: 700,
        color: "var(--text-strong)"
      }
    }, "Active"), /*#__PURE__*/React.createElement(Switch, {
      checked: d.active,
      onChange: v => set("active", v)
    })))), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        gap: 10,
        padding: "16px 24px",
        borderTop: "1px solid var(--border)"
      }
    }, /*#__PURE__*/React.createElement(Button, {
      variant: "ghost",
      onClick: onClose
    }, "Cancel"), /*#__PURE__*/React.createElement(Button, {
      variant: "primary",
      block: true,
      onClick: () => onSave(d)
    }, banner.isNew ? "Create banner" : "Save changes"))), /*#__PURE__*/React.createElement("style", null, `
          @keyframes krmfade { from { opacity: 0 } to { opacity: 1 } }
          @keyframes krmslide { from { transform: translateX(40px); opacity: .4 } to { transform: none; opacity: 1 } }
        `));
  }
  function Banners() {
    const [banners, setBanners] = React.useState(INITIAL_BANNERS);
    const [editing, setEditing] = React.useState(null);
    React.useEffect(() => {
      if (window.lucide) window.lucide.createIcons();
    });
    const liveStack = banners.filter(b => bannerStatus(b) === "live");
    const toggle = id => setBanners(arr => arr.map(b => b.id === id ? {
      ...b,
      active: !b.active
    } : b));
    const remove = id => setBanners(arr => arr.filter(b => b.id !== id));
    const save = d => {
      setBanners(arr => arr.some(b => b.id === d.id) ? arr.map(b => b.id === d.id ? d : b) : [...arr, {
        ...d,
        isNew: false
      }]);
      setEditing(null);
    };
    const newBanner = () => setEditing({
      id: "b" + Date.now(),
      title: "New announcement",
      message: "",
      cta: "Learn more",
      theme: "teal",
      icon: "megaphone",
      image: "",
      align: "left",
      fit: "cover",
      active: true,
      start: "",
      end: "",
      isNew: true
    });
    return /*#__PURE__*/React.createElement("div", {
      style: {
        padding: 28
      }
    }, /*#__PURE__*/React.createElement(ScreenHead, {
      title: "Promotional banners",
      sub: "Stack multiple banners at the top of the public website. Each can be scheduled and toggled independently.",
      action: /*#__PURE__*/React.createElement(Button, {
        variant: "primary",
        iconLeft: I("plus", 16),
        onClick: newBanner
      }, "New banner")
    }), /*#__PURE__*/React.createElement("div", {
      style: {
        marginBottom: 8,
        fontSize: "var(--text-xs)",
        fontWeight: 700,
        letterSpacing: ".06em",
        textTransform: "uppercase",
        color: "var(--text-faint)"
      }
    }, "Live preview \xB7 public website ", liveStack.length > 0 ? "· " + liveStack.length + " showing" : ""), /*#__PURE__*/React.createElement("div", {
      style: {
        border: "1px solid var(--border)",
        borderRadius: "var(--radius-lg)",
        overflow: "hidden",
        boxShadow: "var(--shadow-sm)",
        marginBottom: 28
      }
    }, liveStack.length > 0 ? liveStack.map(b => /*#__PURE__*/React.createElement(BannerStrip, {
      key: b.id,
      data: b,
      onDismiss: null
    })) : /*#__PURE__*/React.createElement("div", {
      style: {
        padding: "18px 20px",
        background: "var(--surface-sunken)",
        color: "var(--text-muted)",
        fontSize: "var(--text-sm)"
      }
    }, "No banners live right now \u2014 nothing shows on the public site."), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        alignItems: "center",
        gap: 16,
        padding: "12px 20px",
        background: "var(--surface-card)",
        borderTop: "1px solid var(--border-subtle)"
      }
    }, /*#__PURE__*/React.createElement("img", {
      src: "../../assets/krama-logo.svg",
      height: "22",
      alt: "Krama"
    }), /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: "var(--text-sm)",
        color: "var(--text-muted)"
      }
    }, "Home"), /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: "var(--text-sm)",
        color: "var(--text-muted)"
      }
    }, "Find jobs"), /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: "var(--text-sm)",
        color: "var(--text-muted)"
      }
    }, "Companies"))), /*#__PURE__*/React.createElement(Card, {
      padding: 0
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: "grid",
        gridTemplateColumns: "44px 2.4fr 1fr 1.4fr 150px",
        padding: "12px 20px",
        fontSize: "var(--text-xs)",
        fontWeight: 700,
        letterSpacing: ".04em",
        textTransform: "uppercase",
        color: "var(--text-faint)",
        borderBottom: "1px solid var(--border)"
      }
    }, /*#__PURE__*/React.createElement("span", null), /*#__PURE__*/React.createElement("span", null, "Banner"), /*#__PURE__*/React.createElement("span", null, "Status"), /*#__PURE__*/React.createElement("span", null, "Schedule"), /*#__PURE__*/React.createElement("span", {
      style: {
        textAlign: "right"
      }
    }, "Actions")), banners.map((b, i) => {
      const st = bannerStatus(b);
      const t = BANNER_THEMES[b.theme] || BANNER_THEMES.saffron;
      return /*#__PURE__*/React.createElement("div", {
        key: b.id,
        style: {
          display: "grid",
          gridTemplateColumns: "44px 2.4fr 1fr 1.4fr 150px",
          alignItems: "center",
          padding: "14px 20px",
          borderBottom: i < banners.length - 1 ? "1px solid var(--border-subtle)" : "none"
        }
      }, /*#__PURE__*/React.createElement("span", {
        style: {
          width: 28,
          height: 28,
          borderRadius: "var(--radius-sm)",
          background: t.bg,
          color: t.fg,
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center"
        }
      }, I(b.icon, 15)), /*#__PURE__*/React.createElement("div", {
        style: {
          minWidth: 0,
          paddingRight: 12
        }
      }, /*#__PURE__*/React.createElement("div", {
        style: {
          fontWeight: 700,
          color: "var(--text-strong)",
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis"
        }
      }, b.title), /*#__PURE__*/React.createElement("div", {
        style: {
          fontSize: "var(--text-sm)",
          color: "var(--text-muted)",
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis"
        }
      }, b.message)), /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement(Badge, {
        tone: STATUS_TONE[st]
      }, STATUS_LABEL[st])), /*#__PURE__*/React.createElement("span", {
        style: {
          fontSize: "var(--text-sm)",
          color: "var(--text-muted)",
          display: "inline-flex",
          alignItems: "center",
          gap: 6
        }
      }, I("calendar", 14), fmtDate(b.start), " \u2013 ", fmtDate(b.end)), /*#__PURE__*/React.createElement("div", {
        style: {
          display: "flex",
          gap: 8,
          justifyContent: "flex-end",
          alignItems: "center"
        }
      }, /*#__PURE__*/React.createElement(Switch, {
        checked: b.active,
        onChange: () => toggle(b.id)
      }), /*#__PURE__*/React.createElement(IconButton, {
        size: "sm",
        variant: "ghost",
        "aria-label": "Edit banner",
        onClick: () => setEditing(b)
      }, I("pencil", 15)), /*#__PURE__*/React.createElement(IconButton, {
        size: "sm",
        variant: "ghost",
        "aria-label": "Delete banner",
        onClick: () => remove(b.id)
      }, I("trash-2", 15))));
    })), /*#__PURE__*/React.createElement(BannerEditorDrawer, {
      banner: editing,
      onClose: () => setEditing(null),
      onSave: save
    }));
  }

  // ===== Homepage content control (drives the public website) ==========
  const HOME_KEY = "krama_home_settings";
  const HOME_COMPANIES = ["ABA Bank", "Smart Axiata", "Wing Bank", "Manulife", "Acleda Bank", "Cellcard"];
  const HOME_DEFAULTS = {
    topVisible: true,
    topCount: 6,
    featuredVisible: true,
    featured: ["ABA Bank", "Smart Axiata", "Wing Bank", "Manulife"],
    sidebarBanner: {
      visible: true,
      theme: "teal",
      icon: "sparkles",
      title: "Boost your search",
      message: "Complete your profile to get AI-matched roles and apply in one click.",
      cta: "Build your profile",
      image: "../../assets/banners/promo-profile.png",
      fit: "cover"
    },
    categoryBanner: {
      visible: true,
      theme: "saffron",
      icon: "rocket",
      title: "Hiring? Reach top talent",
      message: "Post a job and get in front of 40,000+ candidates.",
      cta: "Post a job",
      image: "../../assets/banners/promo-hiring.png",
      fit: "cover"
    },
    companiesBanner: {
      visible: true,
      theme: "teal",
      icon: "building-2",
      title: "Get your company verified",
      message: "Verified employers rank higher and earn candidate trust.",
      cta: "List your company",
      image: "../../assets/banners/promo-verified.png",
      fit: "cover"
    },
    companiesBanner2: {
      visible: true,
      theme: "dark",
      icon: "gift",
      title: "Featured placement",
      message: "Put your company at the top of the directory and get 3× more views.",
      cta: "Go featured",
      image: "../../assets/banners/promo-featured.png",
      fit: "cover"
    },
    companiesBanner3: {
      visible: true,
      theme: "saffron",
      icon: "bell",
      title: "Company alerts",
      message: "Follow employers and get notified when they post new roles.",
      cta: "Follow companies",
      image: "../../assets/banners/promo-talent.png",
      fit: "cover"
    },
    companiesBanner4: {
      visible: true,
      theme: "teal",
      icon: "sparkles",
      title: "Browse by industry",
      message: "Find employers in banking, telecom, retail and more.",
      cta: "Explore industries",
      image: "../../assets/banners/promo-profile.png",
      fit: "cover"
    },
    findJobsBanner3: {
      visible: true,
      theme: "saffron",
      icon: "bell",
      title: "Job alerts",
      message: "Get an email the moment a matching role is posted.",
      cta: "Create alert",
      image: "../../assets/banners/promo-talent.png",
      fit: "cover"
    }
  };
  function loadHome() {
    try {
      return Object.assign({}, HOME_DEFAULTS, JSON.parse(localStorage.getItem(HOME_KEY) || "{}"));
    } catch (e) {
      return Object.assign({}, HOME_DEFAULTS);
    }
  }
  function saveHome(s) {
    try {
      localStorage.setItem(HOME_KEY, JSON.stringify(s));
    } catch (e) {}
  }
  function Stepper({
    value,
    min,
    max,
    onChange
  }) {
    const btn = (label, fn, disabled) => /*#__PURE__*/React.createElement("button", {
      onClick: fn,
      disabled: disabled,
      style: {
        width: 38,
        height: 38,
        border: "1px solid var(--border-strong)",
        background: disabled ? "var(--surface-sunken)" : "var(--surface-card)",
        color: disabled ? "var(--text-faint)" : "var(--text-strong)",
        borderRadius: "var(--radius-md)",
        cursor: disabled ? "not-allowed" : "pointer",
        fontSize: 20,
        fontWeight: 700,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        lineHeight: 1
      }
    }, label);
    return /*#__PURE__*/React.createElement("div", {
      style: {
        display: "inline-flex",
        alignItems: "center",
        gap: 12
      }
    }, btn("−", () => onChange(Math.max(min, value - 1)), value <= min), /*#__PURE__*/React.createElement("span", {
      style: {
        minWidth: 36,
        textAlign: "center",
        fontFamily: "var(--font-display)",
        fontWeight: 800,
        fontSize: "var(--text-2xl)",
        color: "var(--text-strong)"
      }
    }, value), btn("+", () => onChange(Math.min(max, value + 1)), value >= max));
  }
  function Homepage() {
    const [s, setS] = React.useState(loadHome);
    const [saved, setSaved] = React.useState(false);
    React.useEffect(() => {
      if (window.lucide) window.lucide.createIcons();
    });
    const set = (k, v) => {
      setS(x => ({
        ...x,
        [k]: v
      }));
      setSaved(false);
    };
    const setSB = (k, v) => {
      setS(x => ({
        ...x,
        sidebarBanner: Object.assign({}, x.sidebarBanner, {
          [k]: v
        })
      }));
      setSaved(false);
    };
    const setBanner = (key, k, v) => {
      setS(x => ({
        ...x,
        [key]: Object.assign({}, x[key], {
          [k]: v
        })
      }));
      setSaved(false);
    };
    const uploadTo = key => e => {
      const f = e.target.files && e.target.files[0];
      if (!f || !/^image\//.test(f.type)) return;
      const r = new FileReader();
      r.onload = () => setBanner(key, "image", r.result);
      r.readAsDataURL(f);
    };
    const toggleFeatured = name => {
      setS(x => {
        const has = x.featured.includes(name);
        return {
          ...x,
          featured: has ? x.featured.filter(n => n !== name) : [...x.featured, name]
        };
      });
      setSaved(false);
    };
    const apply = () => {
      saveHome(s);
      setSaved(true);
    };
    const ICON_SET = [{
      value: "sparkles",
      label: "Sparkles"
    }, {
      value: "rocket",
      label: "Rocket"
    }, {
      value: "bell",
      label: "Bell"
    }, {
      value: "gift",
      label: "Gift"
    }, {
      value: "building-2",
      label: "Building"
    }, {
      value: "badge-check",
      label: "Verified"
    }, {
      value: "star",
      label: "Star"
    }, {
      value: "trending-up",
      label: "Trending"
    }, {
      value: "briefcase",
      label: "Briefcase"
    }];
    const BannerCard = (key, label, sub, iconName, iconTint) => {
      const b = s[key] || {};
      return /*#__PURE__*/React.createElement(Card, {
        padding: 24,
        style: {
          marginTop: 18
        }
      }, /*#__PURE__*/React.createElement("div", {
        style: {
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: 16
        }
      }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
        style: {
          display: "flex",
          alignItems: "center",
          gap: 10
        }
      }, /*#__PURE__*/React.createElement("span", {
        style: {
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          width: 36,
          height: 36,
          borderRadius: "var(--radius-md)",
          background: iconTint[0],
          color: iconTint[1]
        }
      }, I(iconName, 18)), /*#__PURE__*/React.createElement("h3", {
        style: {
          fontSize: "var(--text-lg)",
          fontWeight: 700,
          color: "var(--text-strong)"
        }
      }, label)), /*#__PURE__*/React.createElement("p", {
        style: {
          fontSize: "var(--text-sm)",
          color: "var(--text-muted)",
          marginTop: 8
        }
      }, sub)), /*#__PURE__*/React.createElement(Switch, {
        checked: b.visible,
        onChange: v => setBanner(key, "visible", v)
      })), /*#__PURE__*/React.createElement("div", {
        style: {
          marginTop: 20,
          paddingTop: 18,
          borderTop: "1px solid var(--border-subtle)",
          opacity: b.visible ? 1 : 0.45,
          pointerEvents: b.visible ? "auto" : "none",
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 16
        }
      }, /*#__PURE__*/React.createElement(Input, {
        label: "Headline",
        value: b.title,
        onChange: e => setBanner(key, "title", e.target.value)
      }), /*#__PURE__*/React.createElement(Input, {
        label: "Button label",
        value: b.cta,
        onChange: e => setBanner(key, "cta", e.target.value)
      }), /*#__PURE__*/React.createElement("div", {
        style: {
          gridColumn: "1 / -1"
        }
      }, /*#__PURE__*/React.createElement(Textarea, {
        label: "Message",
        rows: 2,
        value: b.message,
        onChange: e => setBanner(key, "message", e.target.value)
      })), /*#__PURE__*/React.createElement(Select, {
        label: "Icon",
        value: b.icon,
        onChange: e => setBanner(key, "icon", e.target.value),
        options: ICON_SET
      }), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
        style: {
          fontSize: "var(--text-sm)",
          fontWeight: 600,
          color: "var(--text-strong)",
          marginBottom: 8
        }
      }, "Theme"), /*#__PURE__*/React.createElement("div", {
        style: {
          display: "flex",
          gap: 8
        }
      }, [["teal", "var(--teal-700)"], ["saffron", "var(--saffron-500)"], ["dark", "var(--stone-900)"]].map(([val, col]) => /*#__PURE__*/React.createElement("button", {
        key: val,
        onClick: () => setBanner(key, "theme", val),
        title: val,
        style: {
          flex: 1,
          height: 40,
          borderRadius: "var(--radius-md)",
          cursor: "pointer",
          border: "2px solid " + (b.theme === val ? "var(--brand)" : "var(--border)"),
          background: col
        }
      })))), /*#__PURE__*/React.createElement("div", {
        style: {
          gridColumn: "1 / -1",
          display: "flex",
          alignItems: "center",
          gap: 12
        }
      }, /*#__PURE__*/React.createElement("div", {
        style: {
          width: 88,
          height: 52,
          flexShrink: 0,
          borderRadius: "var(--radius-md)",
          border: "1px solid var(--border)",
          background: b.image ? "transparent" : "var(--surface-sunken)",
          backgroundImage: b.image ? "url('" + b.image + "')" : "none",
          backgroundSize: "cover",
          backgroundPosition: "center"
        }
      }), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
        style: {
          display: "inline-flex",
          alignItems: "center",
          gap: 6,
          cursor: "pointer",
          fontFamily: "var(--font-sans)",
          fontSize: "var(--text-sm)",
          fontWeight: 700,
          color: "var(--text-brand)"
        }
      }, I("upload", 14), " ", b.image ? "Replace image" : "Upload image", /*#__PURE__*/React.createElement("input", {
        type: "file",
        accept: "image/*",
        onChange: uploadTo(key),
        style: {
          display: "none"
        }
      })), b.image ? /*#__PURE__*/React.createElement("div", {
        style: {
          display: "flex",
          gap: 6,
          marginTop: 8
        }
      }, ["cover", "contain"].map(f => /*#__PURE__*/React.createElement("button", {
        key: f,
        onClick: () => setBanner(key, "fit", f),
        style: {
          height: 28,
          padding: "0 12px",
          borderRadius: "var(--radius-sm)",
          cursor: "pointer",
          border: "1px solid " + (b.fit === f ? "var(--brand)" : "var(--border-strong)"),
          background: b.fit === f ? "var(--brand-subtle)" : "var(--surface-card)",
          color: b.fit === f ? "var(--text-brand)" : "var(--text-muted)",
          fontFamily: "var(--font-sans)",
          fontSize: "var(--text-xs)",
          fontWeight: 700
        }
      }, f)), /*#__PURE__*/React.createElement("button", {
        onClick: () => setBanner(key, "image", ""),
        style: {
          height: 28,
          padding: "0 12px",
          borderRadius: "var(--radius-sm)",
          cursor: "pointer",
          border: "1px solid var(--border-strong)",
          background: "var(--surface-card)",
          color: "var(--text-muted)",
          fontFamily: "var(--font-sans)",
          fontSize: "var(--text-xs)",
          fontWeight: 700
        }
      }, "Remove")) : /*#__PURE__*/React.createElement("div", {
        style: {
          fontSize: "var(--text-xs)",
          color: "var(--text-muted)",
          marginTop: 4
        }
      }, "Optional \u2014 image sits behind the text with a dark wash.")))));
    };
    return /*#__PURE__*/React.createElement("div", {
      style: {
        padding: 28,
        maxWidth: 1100
      }
    }, /*#__PURE__*/React.createElement(ScreenHead, {
      title: "Homepage content",
      sub: "Control how many companies appear on the public website. Changes apply to the live home page.",
      action: /*#__PURE__*/React.createElement(Button, {
        variant: "primary",
        iconLeft: I("check", 16),
        onClick: apply
      }, "Save changes")
    }), saved ? /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: "12px 16px",
        background: "var(--success-subtle)",
        border: "1px solid var(--success-border)",
        borderRadius: "var(--radius-md)",
        color: "var(--success)",
        fontWeight: 600,
        fontSize: "var(--text-sm)",
        marginBottom: 18
      }
    }, I("circle-check-big", 16), " Saved \u2014 reload the public website to see the change.") : null, /*#__PURE__*/React.createElement(Card, {
      padding: 24,
      style: {
        marginBottom: 18
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "space-between",
        gap: 16
      }
    }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        alignItems: "center",
        gap: 10
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        width: 36,
        height: 36,
        borderRadius: "var(--radius-md)",
        background: "var(--brand-subtle)",
        color: "var(--brand)"
      }
    }, I("building-2", 18)), /*#__PURE__*/React.createElement("h3", {
      style: {
        fontSize: "var(--text-lg)",
        fontWeight: 700,
        color: "var(--text-strong)"
      }
    }, "Top employers carousel")), /*#__PURE__*/React.createElement("p", {
      style: {
        fontSize: "var(--text-sm)",
        color: "var(--text-muted)",
        marginTop: 8
      }
    }, "The auto-scrolling logo strip below the hero.")), /*#__PURE__*/React.createElement(Switch, {
      checked: s.topVisible,
      onChange: v => set("topVisible", v)
    })), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        marginTop: 20,
        paddingTop: 18,
        borderTop: "1px solid var(--border-subtle)",
        opacity: s.topVisible ? 1 : 0.45,
        pointerEvents: s.topVisible ? "auto" : "none"
      }
    }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: "var(--text-sm)",
        fontWeight: 700,
        color: "var(--text-strong)"
      }
    }, "Companies to show"), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: "var(--text-xs)",
        color: "var(--text-muted)",
        marginTop: 2
      }
    }, "Up to ", HOME_COMPANIES.length, " available")), /*#__PURE__*/React.createElement(Stepper, {
      value: s.topCount,
      min: 1,
      max: HOME_COMPANIES.length,
      onChange: v => set("topCount", v)
    }))), /*#__PURE__*/React.createElement(Card, {
      padding: 24
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "space-between",
        gap: 16
      }
    }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        alignItems: "center",
        gap: 10
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        width: 36,
        height: 36,
        borderRadius: "var(--radius-md)",
        background: "var(--accent-subtle)",
        color: "var(--accent)"
      }
    }, I("star", 18)), /*#__PURE__*/React.createElement("h3", {
      style: {
        fontSize: "var(--text-lg)",
        fontWeight: 700,
        color: "var(--text-strong)"
      }
    }, "Featured companies")), /*#__PURE__*/React.createElement("p", {
      style: {
        fontSize: "var(--text-sm)",
        color: "var(--text-muted)",
        marginTop: 8
      }
    }, "Pick which companies appear in the \u201CFeatured companies\u201D grid.")), /*#__PURE__*/React.createElement(Switch, {
      checked: s.featuredVisible,
      onChange: v => set("featuredVisible", v)
    })), /*#__PURE__*/React.createElement("div", {
      style: {
        marginTop: 20,
        paddingTop: 18,
        borderTop: "1px solid var(--border-subtle)",
        opacity: s.featuredVisible ? 1 : 0.45,
        pointerEvents: s.featuredVisible ? "auto" : "none"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 14
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: "var(--text-sm)",
        fontWeight: 700,
        color: "var(--text-strong)"
      }
    }, "Selected companies"), /*#__PURE__*/React.createElement(Badge, {
      tone: "accent"
    }, s.featured.length, " shown")), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: 12
      }
    }, HOME_COMPANIES.map(name => {
      const on = s.featured.includes(name);
      return /*#__PURE__*/React.createElement("button", {
        key: name,
        onClick: () => toggleFeatured(name),
        style: {
          display: "flex",
          alignItems: "center",
          gap: 12,
          padding: "12px 14px",
          cursor: "pointer",
          textAlign: "left",
          border: "1px solid " + (on ? "var(--brand)" : "var(--border-strong)"),
          background: on ? "var(--brand-subtle)" : "var(--surface-card)",
          borderRadius: "var(--radius-md)"
        }
      }, /*#__PURE__*/React.createElement(Avatar, {
        name: name,
        square: true,
        size: 32
      }), /*#__PURE__*/React.createElement("span", {
        style: {
          flex: 1,
          fontWeight: 600,
          fontSize: "var(--text-sm)",
          color: "var(--text-strong)"
        }
      }, name), /*#__PURE__*/React.createElement("span", {
        style: {
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          width: 20,
          height: 20,
          borderRadius: "var(--radius-sm)",
          border: "1.5px solid " + (on ? "var(--brand)" : "var(--border-strong)"),
          background: on ? "var(--brand)" : "transparent",
          color: "#fff"
        }
      }, on ? I("check", 13) : null));
    })))), /*#__PURE__*/React.createElement(Card, {
      padding: 24,
      style: {
        marginTop: 18
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "space-between",
        gap: 16
      }
    }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        alignItems: "center",
        gap: 10
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        width: 36,
        height: 36,
        borderRadius: "var(--radius-md)",
        background: "var(--info-subtle)",
        color: "var(--info)"
      }
    }, I("panel-left", 18)), /*#__PURE__*/React.createElement("h3", {
      style: {
        fontSize: "var(--text-lg)",
        fontWeight: 700,
        color: "var(--text-strong)"
      }
    }, "Find Jobs sidebar banner")), /*#__PURE__*/React.createElement("p", {
      style: {
        fontSize: "var(--text-sm)",
        color: "var(--text-muted)",
        marginTop: 8
      }
    }, "The promo card under the filters on the Find Jobs page.")), /*#__PURE__*/React.createElement(Switch, {
      checked: s.sidebarBanner.visible,
      onChange: v => setSB("visible", v)
    })), /*#__PURE__*/React.createElement("div", {
      style: {
        marginTop: 20,
        paddingTop: 18,
        borderTop: "1px solid var(--border-subtle)",
        opacity: s.sidebarBanner.visible ? 1 : 0.45,
        pointerEvents: s.sidebarBanner.visible ? "auto" : "none",
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: 16
      }
    }, /*#__PURE__*/React.createElement(Input, {
      label: "Headline",
      value: s.sidebarBanner.title,
      onChange: e => setSB("title", e.target.value)
    }), /*#__PURE__*/React.createElement(Input, {
      label: "Button label",
      value: s.sidebarBanner.cta,
      onChange: e => setSB("cta", e.target.value)
    }), /*#__PURE__*/React.createElement("div", {
      style: {
        gridColumn: "1 / -1"
      }
    }, /*#__PURE__*/React.createElement(Textarea, {
      label: "Message",
      rows: 2,
      value: s.sidebarBanner.message,
      onChange: e => setSB("message", e.target.value)
    })), /*#__PURE__*/React.createElement(Select, {
      label: "Icon",
      value: s.sidebarBanner.icon,
      onChange: e => setSB("icon", e.target.value),
      options: [{
        value: "sparkles",
        label: "Sparkles"
      }, {
        value: "rocket",
        label: "Rocket"
      }, {
        value: "bell",
        label: "Bell"
      }, {
        value: "gift",
        label: "Gift"
      }, {
        value: "file-text",
        label: "Résumé"
      }]
    }), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: "var(--text-sm)",
        fontWeight: 600,
        color: "var(--text-strong)",
        marginBottom: 8
      }
    }, "Theme"), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        gap: 8
      }
    }, [["teal", "var(--teal-700)"], ["saffron", "var(--saffron-500)"], ["dark", "var(--stone-900)"]].map(([val, col]) => /*#__PURE__*/React.createElement("button", {
      key: val,
      onClick: () => setSB("theme", val),
      title: val,
      style: {
        flex: 1,
        height: 40,
        borderRadius: "var(--radius-md)",
        cursor: "pointer",
        border: "2px solid " + (s.sidebarBanner.theme === val ? "var(--brand)" : "var(--border)"),
        background: col
      }
    })))), /*#__PURE__*/React.createElement("div", {
      style: {
        gridColumn: "1 / -1",
        display: "flex",
        alignItems: "center",
        gap: 12
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        width: 88,
        height: 52,
        flexShrink: 0,
        borderRadius: "var(--radius-md)",
        border: "1px solid var(--border)",
        background: s.sidebarBanner.image ? "transparent" : "var(--surface-sunken)",
        backgroundImage: s.sidebarBanner.image ? "url('" + s.sidebarBanner.image + "')" : "none",
        backgroundSize: "cover",
        backgroundPosition: "center"
      }
    }), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
      style: {
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        cursor: "pointer",
        fontFamily: "var(--font-sans)",
        fontSize: "var(--text-sm)",
        fontWeight: 700,
        color: "var(--text-brand)"
      }
    }, I("upload", 14), " ", s.sidebarBanner.image ? "Replace image" : "Upload image", /*#__PURE__*/React.createElement("input", {
      type: "file",
      accept: "image/*",
      onChange: uploadTo("sidebarBanner"),
      style: {
        display: "none"
      }
    })), s.sidebarBanner.image ? /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        gap: 6,
        marginTop: 8
      }
    }, ["cover", "contain"].map(f => /*#__PURE__*/React.createElement("button", {
      key: f,
      onClick: () => setSB("fit", f),
      style: {
        height: 28,
        padding: "0 12px",
        borderRadius: "var(--radius-sm)",
        cursor: "pointer",
        border: "1px solid " + (s.sidebarBanner.fit === f ? "var(--brand)" : "var(--border-strong)"),
        background: s.sidebarBanner.fit === f ? "var(--brand-subtle)" : "var(--surface-card)",
        color: s.sidebarBanner.fit === f ? "var(--text-brand)" : "var(--text-muted)",
        fontFamily: "var(--font-sans)",
        fontSize: "var(--text-xs)",
        fontWeight: 700
      }
    }, f)), /*#__PURE__*/React.createElement("button", {
      onClick: () => setSB("image", ""),
      style: {
        height: 28,
        padding: "0 12px",
        borderRadius: "var(--radius-sm)",
        cursor: "pointer",
        border: "1px solid var(--border-strong)",
        background: "var(--surface-card)",
        color: "var(--text-muted)",
        fontFamily: "var(--font-sans)",
        fontSize: "var(--text-xs)",
        fontWeight: 700
      }
    }, "Remove")) : /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: "var(--text-xs)",
        color: "var(--text-muted)",
        marginTop: 4
      }
    }, "Optional \u2014 image sits behind the text with a dark wash."))))), /*#__PURE__*/React.createElement(Card, {
      padding: 24,
      style: {
        marginTop: 18
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "space-between",
        gap: 16
      }
    }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        alignItems: "center",
        gap: 10
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        width: 36,
        height: 36,
        borderRadius: "var(--radius-md)",
        background: "var(--accent-subtle)",
        color: "var(--accent)"
      }
    }, I("megaphone", 18)), /*#__PURE__*/React.createElement("h3", {
      style: {
        fontSize: "var(--text-lg)",
        fontWeight: 700,
        color: "var(--text-strong)"
      }
    }, "Find Jobs \u2014 Category banner")), /*#__PURE__*/React.createElement("p", {
      style: {
        fontSize: "var(--text-sm)",
        color: "var(--text-muted)",
        marginTop: 8
      }
    }, "The promo card directly under the Category filter.")), /*#__PURE__*/React.createElement(Switch, {
      checked: s.categoryBanner.visible,
      onChange: v => setBanner("categoryBanner", "visible", v)
    })), /*#__PURE__*/React.createElement("div", {
      style: {
        marginTop: 20,
        paddingTop: 18,
        borderTop: "1px solid var(--border-subtle)",
        opacity: s.categoryBanner.visible ? 1 : 0.45,
        pointerEvents: s.categoryBanner.visible ? "auto" : "none",
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: 16
      }
    }, /*#__PURE__*/React.createElement(Input, {
      label: "Headline",
      value: s.categoryBanner.title,
      onChange: e => setBanner("categoryBanner", "title", e.target.value)
    }), /*#__PURE__*/React.createElement(Input, {
      label: "Button label",
      value: s.categoryBanner.cta,
      onChange: e => setBanner("categoryBanner", "cta", e.target.value)
    }), /*#__PURE__*/React.createElement("div", {
      style: {
        gridColumn: "1 / -1"
      }
    }, /*#__PURE__*/React.createElement(Textarea, {
      label: "Message",
      rows: 2,
      value: s.categoryBanner.message,
      onChange: e => setBanner("categoryBanner", "message", e.target.value)
    })), /*#__PURE__*/React.createElement(Select, {
      label: "Icon",
      value: s.categoryBanner.icon,
      onChange: e => setBanner("categoryBanner", "icon", e.target.value),
      options: [{
        value: "rocket",
        label: "Rocket"
      }, {
        value: "megaphone",
        label: "Megaphone"
      }, {
        value: "sparkles",
        label: "Sparkles"
      }, {
        value: "gift",
        label: "Gift"
      }, {
        value: "briefcase",
        label: "Briefcase"
      }]
    }), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: "var(--text-sm)",
        fontWeight: 600,
        color: "var(--text-strong)",
        marginBottom: 8
      }
    }, "Theme"), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        gap: 8
      }
    }, [["teal", "var(--teal-700)"], ["saffron", "var(--saffron-500)"], ["dark", "var(--stone-900)"]].map(([val, col]) => /*#__PURE__*/React.createElement("button", {
      key: val,
      onClick: () => setBanner("categoryBanner", "theme", val),
      title: val,
      style: {
        flex: 1,
        height: 40,
        borderRadius: "var(--radius-md)",
        cursor: "pointer",
        border: "2px solid " + (s.categoryBanner.theme === val ? "var(--brand)" : "var(--border)"),
        background: col
      }
    })))), /*#__PURE__*/React.createElement("div", {
      style: {
        gridColumn: "1 / -1",
        display: "flex",
        alignItems: "center",
        gap: 12
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        width: 88,
        height: 52,
        flexShrink: 0,
        borderRadius: "var(--radius-md)",
        border: "1px solid var(--border)",
        background: s.categoryBanner.image ? "transparent" : "var(--surface-sunken)",
        backgroundImage: s.categoryBanner.image ? "url('" + s.categoryBanner.image + "')" : "none",
        backgroundSize: "cover",
        backgroundPosition: "center"
      }
    }), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
      style: {
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        cursor: "pointer",
        fontFamily: "var(--font-sans)",
        fontSize: "var(--text-sm)",
        fontWeight: 700,
        color: "var(--text-brand)"
      }
    }, I("upload", 14), " ", s.categoryBanner.image ? "Replace image" : "Upload image", /*#__PURE__*/React.createElement("input", {
      type: "file",
      accept: "image/*",
      onChange: uploadTo("categoryBanner"),
      style: {
        display: "none"
      }
    })), s.categoryBanner.image ? /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        gap: 6,
        marginTop: 8
      }
    }, ["cover", "contain"].map(f => /*#__PURE__*/React.createElement("button", {
      key: f,
      onClick: () => setBanner("categoryBanner", "fit", f),
      style: {
        height: 28,
        padding: "0 12px",
        borderRadius: "var(--radius-sm)",
        cursor: "pointer",
        border: "1px solid " + (s.categoryBanner.fit === f ? "var(--brand)" : "var(--border-strong)"),
        background: s.categoryBanner.fit === f ? "var(--brand-subtle)" : "var(--surface-card)",
        color: s.categoryBanner.fit === f ? "var(--text-brand)" : "var(--text-muted)",
        fontFamily: "var(--font-sans)",
        fontSize: "var(--text-xs)",
        fontWeight: 700
      }
    }, f)), /*#__PURE__*/React.createElement("button", {
      onClick: () => setBanner("categoryBanner", "image", ""),
      style: {
        height: 28,
        padding: "0 12px",
        borderRadius: "var(--radius-sm)",
        cursor: "pointer",
        border: "1px solid var(--border-strong)",
        background: "var(--surface-card)",
        color: "var(--text-muted)",
        fontFamily: "var(--font-sans)",
        fontSize: "var(--text-xs)",
        fontWeight: 700
      }
    }, "Remove")) : /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: "var(--text-xs)",
        color: "var(--text-muted)",
        marginTop: 4
      }
    }, "Optional \u2014 image sits behind the text with a dark wash."))))), BannerCard("findJobsBanner3", "Find Jobs — banner 3", "A third promo card in the Find Jobs filter sidebar.", "bell", ["var(--saffron-50)", "var(--saffron-600)"]), /*#__PURE__*/React.createElement(Card, {
      padding: 24,
      style: {
        marginTop: 18
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "space-between",
        gap: 16
      }
    }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        alignItems: "center",
        gap: 10
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        width: 36,
        height: 36,
        borderRadius: "var(--radius-md)",
        background: "var(--brand-subtle)",
        color: "var(--brand)"
      }
    }, I("building-2", 18)), /*#__PURE__*/React.createElement("h3", {
      style: {
        fontSize: "var(--text-lg)",
        fontWeight: 700,
        color: "var(--text-strong)"
      }
    }, "Companies page \u2014 side banner")), /*#__PURE__*/React.createElement("p", {
      style: {
        fontSize: "var(--text-sm)",
        color: "var(--text-muted)",
        marginTop: 8
      }
    }, "The promo card on the right of the Companies directory.")), /*#__PURE__*/React.createElement(Switch, {
      checked: s.companiesBanner.visible,
      onChange: v => setBanner("companiesBanner", "visible", v)
    })), /*#__PURE__*/React.createElement("div", {
      style: {
        marginTop: 20,
        paddingTop: 18,
        borderTop: "1px solid var(--border-subtle)",
        opacity: s.companiesBanner.visible ? 1 : 0.45,
        pointerEvents: s.companiesBanner.visible ? "auto" : "none",
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: 16
      }
    }, /*#__PURE__*/React.createElement(Input, {
      label: "Headline",
      value: s.companiesBanner.title,
      onChange: e => setBanner("companiesBanner", "title", e.target.value)
    }), /*#__PURE__*/React.createElement(Input, {
      label: "Button label",
      value: s.companiesBanner.cta,
      onChange: e => setBanner("companiesBanner", "cta", e.target.value)
    }), /*#__PURE__*/React.createElement("div", {
      style: {
        gridColumn: "1 / -1"
      }
    }, /*#__PURE__*/React.createElement(Textarea, {
      label: "Message",
      rows: 2,
      value: s.companiesBanner.message,
      onChange: e => setBanner("companiesBanner", "message", e.target.value)
    })), /*#__PURE__*/React.createElement(Select, {
      label: "Icon",
      value: s.companiesBanner.icon,
      onChange: e => setBanner("companiesBanner", "icon", e.target.value),
      options: [{
        value: "building-2",
        label: "Building"
      }, {
        value: "badge-check",
        label: "Verified"
      }, {
        value: "rocket",
        label: "Rocket"
      }, {
        value: "sparkles",
        label: "Sparkles"
      }, {
        value: "briefcase",
        label: "Briefcase"
      }]
    }), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: "var(--text-sm)",
        fontWeight: 600,
        color: "var(--text-strong)",
        marginBottom: 8
      }
    }, "Theme"), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        gap: 8
      }
    }, [["teal", "var(--teal-700)"], ["saffron", "var(--saffron-500)"], ["dark", "var(--stone-900)"]].map(([val, col]) => /*#__PURE__*/React.createElement("button", {
      key: val,
      onClick: () => setBanner("companiesBanner", "theme", val),
      title: val,
      style: {
        flex: 1,
        height: 40,
        borderRadius: "var(--radius-md)",
        cursor: "pointer",
        border: "2px solid " + (s.companiesBanner.theme === val ? "var(--brand)" : "var(--border)"),
        background: col
      }
    })))), /*#__PURE__*/React.createElement("div", {
      style: {
        gridColumn: "1 / -1",
        display: "flex",
        alignItems: "center",
        gap: 12
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        width: 88,
        height: 52,
        flexShrink: 0,
        borderRadius: "var(--radius-md)",
        border: "1px solid var(--border)",
        background: s.companiesBanner.image ? "transparent" : "var(--surface-sunken)",
        backgroundImage: s.companiesBanner.image ? "url('" + s.companiesBanner.image + "')" : "none",
        backgroundSize: "cover",
        backgroundPosition: "center"
      }
    }), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
      style: {
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        cursor: "pointer",
        fontFamily: "var(--font-sans)",
        fontSize: "var(--text-sm)",
        fontWeight: 700,
        color: "var(--text-brand)"
      }
    }, I("upload", 14), " ", s.companiesBanner.image ? "Replace image" : "Upload image", /*#__PURE__*/React.createElement("input", {
      type: "file",
      accept: "image/*",
      onChange: uploadTo("companiesBanner"),
      style: {
        display: "none"
      }
    })), s.companiesBanner.image ? /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        gap: 6,
        marginTop: 8
      }
    }, ["cover", "contain"].map(f => /*#__PURE__*/React.createElement("button", {
      key: f,
      onClick: () => setBanner("companiesBanner", "fit", f),
      style: {
        height: 28,
        padding: "0 12px",
        borderRadius: "var(--radius-sm)",
        cursor: "pointer",
        border: "1px solid " + (s.companiesBanner.fit === f ? "var(--brand)" : "var(--border-strong)"),
        background: s.companiesBanner.fit === f ? "var(--brand-subtle)" : "var(--surface-card)",
        color: s.companiesBanner.fit === f ? "var(--text-brand)" : "var(--text-muted)",
        fontFamily: "var(--font-sans)",
        fontSize: "var(--text-xs)",
        fontWeight: 700
      }
    }, f)), /*#__PURE__*/React.createElement("button", {
      onClick: () => setBanner("companiesBanner", "image", ""),
      style: {
        height: 28,
        padding: "0 12px",
        borderRadius: "var(--radius-sm)",
        cursor: "pointer",
        border: "1px solid var(--border-strong)",
        background: "var(--surface-card)",
        color: "var(--text-muted)",
        fontFamily: "var(--font-sans)",
        fontSize: "var(--text-xs)",
        fontWeight: 700
      }
    }, "Remove")) : /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: "var(--text-xs)",
        color: "var(--text-muted)",
        marginTop: 4
      }
    }, "Optional \u2014 image sits behind the text with a dark wash."))))), /*#__PURE__*/React.createElement(Card, {
      padding: 24,
      style: {
        marginTop: 18
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "space-between",
        gap: 16
      }
    }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        alignItems: "center",
        gap: 10
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        width: 36,
        height: 36,
        borderRadius: "var(--radius-md)",
        background: "var(--accent-subtle)",
        color: "var(--accent)"
      }
    }, I("gift", 18)), /*#__PURE__*/React.createElement("h3", {
      style: {
        fontSize: "var(--text-lg)",
        fontWeight: 700,
        color: "var(--text-strong)"
      }
    }, "Companies page \u2014 side banner 2")), /*#__PURE__*/React.createElement("p", {
      style: {
        fontSize: "var(--text-sm)",
        color: "var(--text-muted)",
        marginTop: 8
      }
    }, "A second promo card below the first, on the right of the Companies directory.")), /*#__PURE__*/React.createElement(Switch, {
      checked: s.companiesBanner2.visible,
      onChange: v => setBanner("companiesBanner2", "visible", v)
    })), /*#__PURE__*/React.createElement("div", {
      style: {
        marginTop: 20,
        paddingTop: 18,
        borderTop: "1px solid var(--border-subtle)",
        opacity: s.companiesBanner2.visible ? 1 : 0.45,
        pointerEvents: s.companiesBanner2.visible ? "auto" : "none",
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: 16
      }
    }, /*#__PURE__*/React.createElement(Input, {
      label: "Headline",
      value: s.companiesBanner2.title,
      onChange: e => setBanner("companiesBanner2", "title", e.target.value)
    }), /*#__PURE__*/React.createElement(Input, {
      label: "Button label",
      value: s.companiesBanner2.cta,
      onChange: e => setBanner("companiesBanner2", "cta", e.target.value)
    }), /*#__PURE__*/React.createElement("div", {
      style: {
        gridColumn: "1 / -1"
      }
    }, /*#__PURE__*/React.createElement(Textarea, {
      label: "Message",
      rows: 2,
      value: s.companiesBanner2.message,
      onChange: e => setBanner("companiesBanner2", "message", e.target.value)
    })), /*#__PURE__*/React.createElement(Select, {
      label: "Icon",
      value: s.companiesBanner2.icon,
      onChange: e => setBanner("companiesBanner2", "icon", e.target.value),
      options: [{
        value: "gift",
        label: "Gift"
      }, {
        value: "star",
        label: "Star"
      }, {
        value: "rocket",
        label: "Rocket"
      }, {
        value: "sparkles",
        label: "Sparkles"
      }, {
        value: "trending-up",
        label: "Trending"
      }]
    }), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: "var(--text-sm)",
        fontWeight: 600,
        color: "var(--text-strong)",
        marginBottom: 8
      }
    }, "Theme"), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        gap: 8
      }
    }, [["teal", "var(--teal-700)"], ["saffron", "var(--saffron-500)"], ["dark", "var(--stone-900)"]].map(([val, col]) => /*#__PURE__*/React.createElement("button", {
      key: val,
      onClick: () => setBanner("companiesBanner2", "theme", val),
      title: val,
      style: {
        flex: 1,
        height: 40,
        borderRadius: "var(--radius-md)",
        cursor: "pointer",
        border: "2px solid " + (s.companiesBanner2.theme === val ? "var(--brand)" : "var(--border)"),
        background: col
      }
    })))), /*#__PURE__*/React.createElement("div", {
      style: {
        gridColumn: "1 / -1",
        display: "flex",
        alignItems: "center",
        gap: 12
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        width: 88,
        height: 52,
        flexShrink: 0,
        borderRadius: "var(--radius-md)",
        border: "1px solid var(--border)",
        background: s.companiesBanner2.image ? "transparent" : "var(--surface-sunken)",
        backgroundImage: s.companiesBanner2.image ? "url('" + s.companiesBanner2.image + "')" : "none",
        backgroundSize: "cover",
        backgroundPosition: "center"
      }
    }), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
      style: {
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        cursor: "pointer",
        fontFamily: "var(--font-sans)",
        fontSize: "var(--text-sm)",
        fontWeight: 700,
        color: "var(--text-brand)"
      }
    }, I("upload", 14), " ", s.companiesBanner2.image ? "Replace image" : "Upload image", /*#__PURE__*/React.createElement("input", {
      type: "file",
      accept: "image/*",
      onChange: uploadTo("companiesBanner2"),
      style: {
        display: "none"
      }
    })), s.companiesBanner2.image ? /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        gap: 6,
        marginTop: 8
      }
    }, ["cover", "contain"].map(f => /*#__PURE__*/React.createElement("button", {
      key: f,
      onClick: () => setBanner("companiesBanner2", "fit", f),
      style: {
        height: 28,
        padding: "0 12px",
        borderRadius: "var(--radius-sm)",
        cursor: "pointer",
        border: "1px solid " + (s.companiesBanner2.fit === f ? "var(--brand)" : "var(--border-strong)"),
        background: s.companiesBanner2.fit === f ? "var(--brand-subtle)" : "var(--surface-card)",
        color: s.companiesBanner2.fit === f ? "var(--text-brand)" : "var(--text-muted)",
        fontFamily: "var(--font-sans)",
        fontSize: "var(--text-xs)",
        fontWeight: 700
      }
    }, f)), /*#__PURE__*/React.createElement("button", {
      onClick: () => setBanner("companiesBanner2", "image", ""),
      style: {
        height: 28,
        padding: "0 12px",
        borderRadius: "var(--radius-sm)",
        cursor: "pointer",
        border: "1px solid var(--border-strong)",
        background: "var(--surface-card)",
        color: "var(--text-muted)",
        fontFamily: "var(--font-sans)",
        fontSize: "var(--text-xs)",
        fontWeight: 700
      }
    }, "Remove")) : /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: "var(--text-xs)",
        color: "var(--text-muted)",
        marginTop: 4
      }
    }, "Optional \u2014 image sits behind the text with a dark wash."))))), BannerCard("companiesBanner3", "Companies page — side banner 3", "A third promo card on the right of the Companies directory.", "bell", ["var(--saffron-50)", "var(--saffron-600)"]), BannerCard("companiesBanner4", "Companies page — side banner 4", "A fourth promo card on the right of the Companies directory.", "sparkles", ["var(--brand-subtle)", "var(--brand)"]));
  }

  // ===== Chat agent settings (drives the public website chat widget) =====
  const CHAT_KEY = "krama_chat_settings";
  const CHAT_DEFAULTS = {
    enabled: true,
    botName: "Krama Assistant",
    welcome: "Hi! I'm Krama's assistant 👋 Ask me about jobs, applications, or your account.",
    endpoint: "",
    apiKey: "",
    model: "",
    launcher: "Chat with us"
  };
  function loadChatCfg() {
    try {
      return Object.assign({}, CHAT_DEFAULTS, JSON.parse(localStorage.getItem(CHAT_KEY) || "{}"));
    } catch (e) {
      return Object.assign({}, CHAT_DEFAULTS);
    }
  }
  function ChatAgentSettings() {
    const [c, setC] = React.useState(loadChatCfg);
    const [saved, setSaved] = React.useState(false);
    const [showKey, setShowKey] = React.useState(false);
    React.useEffect(() => {
      if (window.lucide) window.lucide.createIcons();
    });
    const set = (k, v) => {
      setC(x => ({
        ...x,
        [k]: v
      }));
      setSaved(false);
    };
    const save = () => {
      try {
        localStorage.setItem(CHAT_KEY, JSON.stringify(c));
      } catch (e) {}
      setSaved(true);
    };
    const connected = !!c.endpoint;
    return /*#__PURE__*/React.createElement("div", {
      style: {
        padding: 28,
        maxWidth: 1100
      }
    }, /*#__PURE__*/React.createElement(ScreenHead, {
      title: "Chat agent",
      sub: "Control the assistant on the public website and connect it to your chat API.",
      action: /*#__PURE__*/React.createElement(Button, {
        variant: "primary",
        iconLeft: I("check", 16),
        onClick: save
      }, "Save changes")
    }), saved ? /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: "12px 16px",
        background: "var(--success-subtle)",
        border: "1px solid var(--success-border)",
        borderRadius: "var(--radius-md)",
        color: "var(--success)",
        fontWeight: 600,
        fontSize: "var(--text-sm)",
        marginBottom: 18
      }
    }, I("circle-check-big", 16), " Saved \u2014 reload the public website to apply.") : null, /*#__PURE__*/React.createElement(Card, {
      padding: 24,
      style: {
        marginBottom: 18
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "space-between",
        gap: 16
      }
    }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        alignItems: "center",
        gap: 10
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        width: 36,
        height: 36,
        borderRadius: "var(--radius-md)",
        background: "var(--brand-subtle)",
        color: "var(--brand)"
      }
    }, I("bot", 18)), /*#__PURE__*/React.createElement("h3", {
      style: {
        fontSize: "var(--text-lg)",
        fontWeight: 700,
        color: "var(--text-strong)"
      }
    }, "Show chat on public site")), /*#__PURE__*/React.createElement("p", {
      style: {
        fontSize: "var(--text-sm)",
        color: "var(--text-muted)",
        marginTop: 8
      }
    }, "The floating chat launcher in the bottom-left of every public page.")), /*#__PURE__*/React.createElement(Switch, {
      checked: c.enabled,
      onChange: v => set("enabled", v)
    })), /*#__PURE__*/React.createElement("div", {
      style: {
        marginTop: 20,
        paddingTop: 18,
        borderTop: "1px solid var(--border-subtle)",
        opacity: c.enabled ? 1 : 0.45,
        pointerEvents: c.enabled ? "auto" : "none",
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: 16
      }
    }, /*#__PURE__*/React.createElement(Input, {
      label: "Assistant name",
      value: c.botName,
      onChange: e => set("botName", e.target.value)
    }), /*#__PURE__*/React.createElement(Input, {
      label: "Launcher button label",
      value: c.launcher,
      onChange: e => set("launcher", e.target.value)
    }), /*#__PURE__*/React.createElement("div", {
      style: {
        gridColumn: "1 / -1"
      }
    }, /*#__PURE__*/React.createElement(Textarea, {
      label: "Welcome message",
      rows: 2,
      value: c.welcome,
      onChange: e => set("welcome", e.target.value)
    })))), /*#__PURE__*/React.createElement(Card, {
      padding: 24
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        alignItems: "center",
        gap: 10,
        marginBottom: 4
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        width: 36,
        height: 36,
        borderRadius: "var(--radius-md)",
        background: "var(--info-subtle)",
        color: "var(--info)"
      }
    }, I("plug", 18)), /*#__PURE__*/React.createElement("h3", {
      style: {
        fontSize: "var(--text-lg)",
        fontWeight: 700,
        color: "var(--text-strong)"
      }
    }, "API connection"), /*#__PURE__*/React.createElement(Badge, {
      tone: connected ? "success" : "neutral",
      style: {
        marginLeft: "auto"
      }
    }, connected ? "Connected" : "Demo mode")), /*#__PURE__*/React.createElement("p", {
      style: {
        fontSize: "var(--text-sm)",
        color: "var(--text-muted)",
        margin: "0 0 18px"
      }
    }, "Krama POSTs ", /*#__PURE__*/React.createElement("code", {
      style: {
        fontFamily: "var(--font-mono)",
        fontSize: "var(--text-xs)",
        background: "var(--surface-sunken)",
        padding: "1px 5px",
        borderRadius: 4
      }
    }, "{ message, history, model }"), " to your endpoint and reads ", /*#__PURE__*/React.createElement("code", {
      style: {
        fontFamily: "var(--font-mono)",
        fontSize: "var(--text-xs)",
        background: "var(--surface-sunken)",
        padding: "1px 5px",
        borderRadius: 4
      }
    }, "reply"), " from the JSON response. Leave the endpoint blank to use the built-in demo replies."), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        flexDirection: "column",
        gap: 16
      }
    }, /*#__PURE__*/React.createElement(Input, {
      label: "API endpoint URL",
      placeholder: "https://api.your-service.com/chat",
      value: c.endpoint,
      onChange: e => set("endpoint", e.target.value),
      iconLeft: I("link", 16)
    }), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "grid",
        gridTemplateColumns: "2fr 1fr",
        gap: 16
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        position: "relative"
      }
    }, /*#__PURE__*/React.createElement(Input, {
      label: "API key (Bearer token)",
      type: showKey ? "text" : "password",
      placeholder: "sk-\u2026",
      value: c.apiKey,
      onChange: e => set("apiKey", e.target.value)
    }), /*#__PURE__*/React.createElement("button", {
      onClick: () => setShowKey(!showKey),
      style: {
        position: "absolute",
        right: 10,
        top: 32,
        border: "none",
        background: "transparent",
        color: "var(--text-muted)",
        cursor: "pointer",
        display: "inline-flex"
      },
      "aria-label": "Toggle key visibility"
    }, I(showKey ? "eye-off" : "eye", 16))), /*#__PURE__*/React.createElement(Input, {
      label: "Model (optional)",
      placeholder: "gpt-4o-mini",
      value: c.model,
      onChange: e => set("model", e.target.value)
    })), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: "var(--text-xs)",
        color: "var(--text-faint)",
        display: "flex",
        alignItems: "center",
        gap: 6
      }
    }, I("shield", 13), " Stored in the browser for this demo; in production, keep keys server-side and proxy the request."))));
  }

  // ===== Payment settings (drives employer checkout) =====
  const PAY_KEY = "krama_payment_settings";
  const PAY_DEFAULTS = {
    currency: "USD",
    khqr: {
      enabled: true,
      merchant: "Krama (Cambodia) Co., Ltd",
      account: "krama@aclb"
    },
    acleda: {
      enabled: true,
      merchant: "Krama (Cambodia) Co., Ltd",
      account: "1000-12-345678-9"
    },
    aba: {
      enabled: true,
      merchant: "Krama (Cambodia) Co., Ltd",
      account: "000 123 456"
    }
  };
  function loadPay() {
    try {
      return Object.assign({}, PAY_DEFAULTS, JSON.parse(localStorage.getItem(PAY_KEY) || "{}"));
    } catch (e) {
      return Object.assign({}, PAY_DEFAULTS);
    }
  }

  // All employer payment transactions recorded by the platform.
  const PAY_TX = [{
    id: "TXN-2026-1042",
    employer: "ABA Bank",
    plan: "Standard",
    amount: "$49.00",
    method: "ABA Bank",
    status: "Paid",
    date: "01 Jun 2026"
  }, {
    id: "TXN-2026-1041",
    employer: "Smart Axiata",
    plan: "Premium",
    amount: "$99.00",
    method: "KHQR",
    status: "Paid",
    date: "01 Jun 2026"
  }, {
    id: "TXN-2026-1040",
    employer: "Wing Bank",
    plan: "Standard",
    amount: "$49.00",
    method: "ACLEDA Bank",
    status: "Paid",
    date: "31 May 2026"
  }, {
    id: "TXN-2026-1039",
    employer: "Cellcard",
    plan: "Premium",
    amount: "$99.00",
    method: "ABA Bank",
    status: "Paid",
    date: "30 May 2026"
  }, {
    id: "TXN-2026-1038",
    employer: "Manulife",
    plan: "Standard",
    amount: "$49.00",
    method: "KHQR",
    status: "Pending",
    date: "30 May 2026"
  }, {
    id: "TXN-2026-1037",
    employer: "Acleda Bank",
    plan: "Standard",
    amount: "$49.00",
    method: "ACLEDA Bank",
    status: "Paid",
    date: "29 May 2026"
  }, {
    id: "TXN-2026-1036",
    employer: "Chip Mong",
    plan: "Premium",
    amount: "$99.00",
    method: "ABA Bank",
    status: "Paid",
    date: "28 May 2026"
  }, {
    id: "TXN-2026-1035",
    employer: "Prince Bank",
    plan: "Standard",
    amount: "$49.00",
    method: "KHQR",
    status: "Failed",
    date: "28 May 2026"
  }, {
    id: "TXN-2026-1034",
    employer: "Borey Peng Huoth",
    plan: "Standard",
    amount: "$49.00",
    method: "ABA Bank",
    status: "Paid",
    date: "27 May 2026"
  }, {
    id: "TXN-2026-1033",
    employer: "Pizza Company",
    plan: "Premium",
    amount: "$99.00",
    method: "ACLEDA Bank",
    status: "Paid",
    date: "26 May 2026"
  }, {
    id: "TXN-2026-1032",
    employer: "Sathapana Bank",
    plan: "Standard",
    amount: "$49.00",
    method: "KHQR",
    status: "Paid",
    date: "25 May 2026"
  }, {
    id: "TXN-2026-1031",
    employer: "Coca-Cola Cambodia",
    plan: "Premium",
    amount: "$99.00",
    method: "ABA Bank",
    status: "Refunded",
    date: "24 May 2026"
  }, {
    id: "TXN-2026-1030",
    employer: "ABA Bank",
    plan: "Standard",
    amount: "$49.00",
    method: "ABA Bank",
    status: "Paid",
    date: "01 May 2026"
  }, {
    id: "TXN-2026-1029",
    employer: "Smart Axiata",
    plan: "Premium",
    amount: "$99.00",
    method: "KHQR",
    status: "Paid",
    date: "01 May 2026"
  }, {
    id: "TXN-2026-1028",
    employer: "Wing Bank",
    plan: "Standard",
    amount: "$49.00",
    method: "ACLEDA Bank",
    status: "Paid",
    date: "30 Apr 2026"
  }, {
    id: "TXN-2026-1027",
    employer: "Cellcard",
    plan: "Premium",
    amount: "$99.00",
    method: "ABA Bank",
    status: "Paid",
    date: "29 Apr 2026"
  }, {
    id: "TXN-2026-1026",
    employer: "Manulife",
    plan: "Standard",
    amount: "$49.00",
    method: "KHQR",
    status: "Paid",
    date: "28 Apr 2026"
  }, {
    id: "TXN-2026-1025",
    employer: "Acleda Bank",
    plan: "Standard",
    amount: "$49.00",
    method: "ACLEDA Bank",
    status: "Paid",
    date: "27 Apr 2026"
  }, {
    id: "TXN-2026-1024",
    employer: "Chip Mong",
    plan: "Premium",
    amount: "$99.00",
    method: "ABA Bank",
    status: "Paid",
    date: "26 Apr 2026"
  }, {
    id: "TXN-2026-1023",
    employer: "Prince Bank",
    plan: "Standard",
    amount: "$49.00",
    method: "KHQR",
    status: "Paid",
    date: "25 Apr 2026"
  }, {
    id: "TXN-2026-1022",
    employer: "Borey Peng Huoth",
    plan: "Standard",
    amount: "$49.00",
    method: "ABA Bank",
    status: "Paid",
    date: "24 Apr 2026"
  }, {
    id: "TXN-2026-1021",
    employer: "Pizza Company",
    plan: "Premium",
    amount: "$99.00",
    method: "ACLEDA Bank",
    status: "Paid",
    date: "23 Apr 2026"
  }];
  const TX_TONE = {
    Paid: "success",
    Pending: "warning",
    Failed: "danger",
    Refunded: "neutral"
  };
  function PaymentSettings() {
    const [p, setP] = React.useState(loadPay);
    const [saved, setSaved] = React.useState(false);
    const [txPage, setTxPage] = React.useState(0);
    const TX_PER = 10;
    React.useEffect(() => {
      if (window.lucide) window.lucide.createIcons();
    });
    const setMethod = (key, k, v) => {
      setP(x => ({
        ...x,
        [key]: Object.assign({}, x[key], {
          [k]: v
        })
      }));
      setSaved(false);
    };
    const save = () => {
      try {
        localStorage.setItem(PAY_KEY, JSON.stringify(p));
      } catch (e) {}
      setSaved(true);
    };
    const methods = [{
      key: "khqr",
      label: "KHQR",
      desc: "Scan-to-pay QR accepted by all Cambodian banking apps.",
      tint: ["var(--brand-subtle)", "var(--brand)"],
      icon: "qr-code",
      accountLabel: "KHQR account ID"
    }, {
      key: "acleda",
      label: "ACLEDA Bank",
      desc: "ACLEDA mobile / bank transfer.",
      tint: ["var(--info-subtle)", "var(--info)"],
      icon: "landmark",
      accountLabel: "ACLEDA account number"
    }, {
      key: "aba",
      label: "ABA Bank",
      desc: "ABA PAY / bank transfer.",
      tint: ["var(--accent-subtle)", "var(--accent)"],
      icon: "building-2",
      accountLabel: "ABA account number"
    }];
    const activeCount = methods.filter(m => p[m.key].enabled).length;
    return /*#__PURE__*/React.createElement("div", {
      style: {
        padding: 28,
        maxWidth: 1100
      }
    }, /*#__PURE__*/React.createElement(ScreenHead, {
      title: "Payment settings",
      sub: "Choose which methods employers can pay with at checkout.",
      action: /*#__PURE__*/React.createElement(Button, {
        variant: "primary",
        iconLeft: I("check", 16),
        onClick: save
      }, "Save changes")
    }), saved ? /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: "12px 16px",
        background: "var(--success-subtle)",
        border: "1px solid var(--success-border)",
        borderRadius: "var(--radius-md)",
        color: "var(--success)",
        fontWeight: 600,
        fontSize: "var(--text-sm)",
        marginBottom: 18
      }
    }, I("circle-check-big", 16), " Saved \u2014 ", activeCount, " method", activeCount === 1 ? "" : "s", " available to employers.") : null, methods.map(m => {
      const cfg = p[m.key];
      return /*#__PURE__*/React.createElement(Card, {
        key: m.key,
        padding: 24,
        style: {
          marginBottom: 18
        }
      }, /*#__PURE__*/React.createElement("div", {
        style: {
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: 16
        }
      }, /*#__PURE__*/React.createElement("div", {
        style: {
          display: "flex",
          alignItems: "center",
          gap: 12
        }
      }, /*#__PURE__*/React.createElement("span", {
        style: {
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          width: 40,
          height: 40,
          borderRadius: "var(--radius-md)",
          background: m.tint[0],
          color: m.tint[1]
        }
      }, I(m.icon, 20)), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h3", {
        style: {
          fontSize: "var(--text-lg)",
          fontWeight: 700,
          color: "var(--text-strong)"
        }
      }, m.label), /*#__PURE__*/React.createElement("p", {
        style: {
          fontSize: "var(--text-sm)",
          color: "var(--text-muted)",
          marginTop: 2
        }
      }, m.desc))), /*#__PURE__*/React.createElement(Switch, {
        checked: cfg.enabled,
        onChange: v => setMethod(m.key, "enabled", v)
      })), /*#__PURE__*/React.createElement("div", {
        style: {
          marginTop: 20,
          paddingTop: 18,
          borderTop: "1px solid var(--border-subtle)",
          opacity: cfg.enabled ? 1 : 0.45,
          pointerEvents: cfg.enabled ? "auto" : "none",
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 16
        }
      }, /*#__PURE__*/React.createElement(Input, {
        label: "Merchant name",
        value: cfg.merchant,
        onChange: e => setMethod(m.key, "merchant", e.target.value)
      }), /*#__PURE__*/React.createElement(Input, {
        label: m.accountLabel,
        value: cfg.account,
        onChange: e => setMethod(m.key, "account", e.target.value)
      })));
    }), /*#__PURE__*/React.createElement(Card, {
      padding: 0,
      style: {
        marginTop: 8
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "16px 22px",
        borderBottom: "1px solid var(--border)"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        alignItems: "center",
        gap: 10
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        width: 32,
        height: 32,
        borderRadius: "var(--radius-md)",
        background: "var(--brand-subtle)",
        color: "var(--brand)"
      }
    }, I("receipt", 17)), /*#__PURE__*/React.createElement("h3", {
      style: {
        fontSize: "var(--text-md)",
        fontWeight: 700,
        color: "var(--text-strong)"
      }
    }, "Payment history")), /*#__PURE__*/React.createElement(Badge, {
      tone: "neutral"
    }, PAY_TX.length, " transactions")), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "grid",
        gridTemplateColumns: "1.2fr 1.4fr 0.9fr 0.8fr 1.1fr 0.9fr 0.9fr",
        padding: "10px 22px",
        fontSize: "var(--text-xs)",
        fontWeight: 700,
        letterSpacing: ".04em",
        textTransform: "uppercase",
        color: "var(--text-faint)",
        borderBottom: "1px solid var(--border-subtle)"
      }
    }, /*#__PURE__*/React.createElement("span", null, "Txn ID"), /*#__PURE__*/React.createElement("span", null, "Employer"), /*#__PURE__*/React.createElement("span", null, "Plan"), /*#__PURE__*/React.createElement("span", null, "Amount"), /*#__PURE__*/React.createElement("span", null, "Method"), /*#__PURE__*/React.createElement("span", null, "Date"), /*#__PURE__*/React.createElement("span", null, "Status")), (() => {
      const pages = Math.max(1, Math.ceil(PAY_TX.length / TX_PER));
      const safe = Math.min(txPage, pages - 1);
      const slice = PAY_TX.slice(safe * TX_PER, safe * TX_PER + TX_PER);
      return /*#__PURE__*/React.createElement(React.Fragment, null, slice.map((t, i) => /*#__PURE__*/React.createElement("div", {
        key: t.id,
        style: {
          display: "grid",
          gridTemplateColumns: "1.2fr 1.4fr 0.9fr 0.8fr 1.1fr 0.9fr 0.9fr",
          alignItems: "center",
          padding: "12px 22px",
          borderBottom: i < slice.length - 1 ? "1px solid var(--border-subtle)" : "none"
        }
      }, /*#__PURE__*/React.createElement("span", {
        style: {
          fontFamily: "var(--font-mono)",
          fontSize: "var(--text-xs)",
          color: "var(--text-body)"
        }
      }, t.id), /*#__PURE__*/React.createElement("span", {
        style: {
          fontSize: "var(--text-sm)",
          fontWeight: 600,
          color: "var(--text-strong)"
        }
      }, t.employer), /*#__PURE__*/React.createElement("span", {
        style: {
          fontSize: "var(--text-sm)",
          color: "var(--text-muted)"
        }
      }, t.plan), /*#__PURE__*/React.createElement("span", {
        style: {
          fontWeight: 600,
          color: "var(--text-strong)"
        }
      }, t.amount), /*#__PURE__*/React.createElement("span", {
        style: {
          fontSize: "var(--text-sm)",
          color: "var(--text-body)"
        }
      }, t.method), /*#__PURE__*/React.createElement("span", {
        style: {
          fontSize: "var(--text-sm)",
          color: "var(--text-muted)"
        }
      }, t.date), /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement(Badge, {
        tone: TX_TONE[t.status]
      }, t.status)))), pages > 1 ? /*#__PURE__*/React.createElement("div", {
        style: {
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "14px 22px",
          borderTop: "1px solid var(--border-subtle)"
        }
      }, /*#__PURE__*/React.createElement("span", {
        style: {
          fontSize: "var(--text-sm)",
          color: "var(--text-muted)"
        }
      }, "Showing ", safe * TX_PER + 1, "\u2013", safe * TX_PER + slice.length, " of ", PAY_TX.length), /*#__PURE__*/React.createElement("div", {
        style: {
          display: "flex",
          gap: 8
        }
      }, /*#__PURE__*/React.createElement(Button, {
        variant: "secondary",
        size: "sm",
        disabled: safe === 0,
        onClick: () => setTxPage(safe - 1)
      }, "Previous"), Array.from({
        length: pages
      }).map((_, n) => /*#__PURE__*/React.createElement("button", {
        key: n,
        onClick: () => setTxPage(n),
        style: {
          minWidth: 34,
          height: 32,
          padding: "0 10px",
          borderRadius: "var(--radius-md)",
          cursor: "pointer",
          border: "1px solid " + (n === safe ? "var(--brand)" : "var(--border-strong)"),
          background: n === safe ? "var(--brand)" : "var(--surface-card)",
          color: n === safe ? "var(--on-brand)" : "var(--text-body)",
          fontFamily: "var(--font-sans)",
          fontSize: "var(--text-sm)",
          fontWeight: 700
        }
      }, n + 1)), /*#__PURE__*/React.createElement(Button, {
        variant: "secondary",
        size: "sm",
        disabled: safe === pages - 1,
        onClick: () => setTxPage(safe + 1)
      }, "Next"))) : null);
    })()), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: "var(--text-xs)",
        color: "var(--text-faint)",
        display: "flex",
        alignItems: "center",
        gap: 6,
        marginTop: 4
      }
    }, I("shield", 13), " Demo settings stored in the browser. In production, store credentials server-side and integrate each provider's payment API."));
  }
  function App() {
    const [page, setPage] = React.useState("dashboard");
    React.useEffect(() => {
      if (window.lucide) window.lucide.createIcons();
    });
    const titles = {
      dashboard: "Overview",
      jobs: "Job approval queue",
      companies: "Company management",
      candidates: "Candidates",
      categories: "Categories",
      homepage: "Homepage content",
      chat: "Chat agent",
      payments: "Payment settings",
      reports: "Reports",
      banners: "Promotional banner",
      settings: "Settings · Users & roles"
    };
    return /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        minHeight: "100vh",
        background: "var(--surface-page)"
      }
    }, /*#__PURE__*/React.createElement(Sidebar, {
      page: page,
      onNav: setPage
    }), /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1,
        minWidth: 0,
        display: "flex",
        flexDirection: "column"
      }
    }, /*#__PURE__*/React.createElement(Topbar, {
      title: titles[page]
    }), page === "dashboard" && /*#__PURE__*/React.createElement(Overview, null), page === "jobs" && /*#__PURE__*/React.createElement(Approvals, null), page === "companies" && /*#__PURE__*/React.createElement(CompaniesMgmt, null), page === "candidates" && /*#__PURE__*/React.createElement(Candidates, null), page === "categories" && /*#__PURE__*/React.createElement(Categories, null), page === "homepage" && /*#__PURE__*/React.createElement(Homepage, null), page === "chat" && /*#__PURE__*/React.createElement(ChatAgentSettings, null), page === "payments" && /*#__PURE__*/React.createElement(PaymentSettings, null), page === "reports" && /*#__PURE__*/React.createElement(Reports, null), page === "banners" && /*#__PURE__*/React.createElement(Banners, null), page === "settings" && /*#__PURE__*/React.createElement(Settings, null)));
  }
  window.KramaAdminApp = App;
})();
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/admin-dashboard/app.jsx", error: String((e && e.message) || e) }); }

// ui_kits/candidate-dashboard/app.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
// Krama candidate dashboard — sidebar shell + overview + applications tracker.
(function init() {
  if (!window.KramaDesignSystem_1a6f65) {
    return setTimeout(init, 40);
  }
  const NS = window.KramaDesignSystem_1a6f65;
  const {
    Button,
    Badge,
    StatusBadge,
    Avatar,
    Card,
    StatCard,
    Tabs,
    ProgressTracker,
    JobCard,
    EmptyState,
    Input,
    Select,
    Tag,
    Switch
  } = NS;
  const I = (n, s = 18) => /*#__PURE__*/React.createElement("i", {
    "data-lucide": n,
    style: {
      width: s,
      height: s
    }
  });
  const NAV = [{
    id: "dashboard",
    label: "Dashboard",
    icon: "layout-dashboard"
  }, {
    id: "applications",
    label: "My applications",
    icon: "send",
    badge: 5
  }, {
    id: "saved",
    label: "Saved jobs",
    icon: "bookmark",
    badge: 8
  }, {
    id: "resume",
    label: "Résumé builder",
    icon: "file-text"
  }, {
    id: "profile",
    label: "Profile",
    icon: "user-round"
  }];
  function Sidebar({
    page,
    onNav
  }) {
    return /*#__PURE__*/React.createElement("aside", {
      style: {
        width: 248,
        flexShrink: 0,
        background: "var(--surface-card)",
        borderRight: "1px solid var(--border)",
        display: "flex",
        flexDirection: "column",
        padding: "20px 14px",
        position: "sticky",
        top: 0,
        height: "100vh"
      }
    }, /*#__PURE__*/React.createElement("img", {
      src: "../../assets/krama-logo.svg",
      height: "28",
      alt: "Krama",
      style: {
        margin: "4px 8px 22px"
      }
    }), /*#__PURE__*/React.createElement("nav", {
      style: {
        display: "flex",
        flexDirection: "column",
        gap: 3
      }
    }, NAV.map(n => {
      const active = page === n.id;
      return /*#__PURE__*/React.createElement("button", {
        key: n.id,
        onClick: () => onNav(n.id),
        style: {
          display: "flex",
          alignItems: "center",
          gap: 11,
          border: "none",
          cursor: "pointer",
          padding: "10px 12px",
          borderRadius: "var(--radius-md)",
          textAlign: "left",
          background: active ? "var(--brand-subtle)" : "transparent",
          color: active ? "var(--text-brand)" : "var(--text-body)",
          fontFamily: "var(--font-sans)",
          fontWeight: active ? 700 : 500,
          fontSize: "var(--text-base)"
        }
      }, /*#__PURE__*/React.createElement("span", {
        style: {
          display: "inline-flex",
          color: active ? "var(--brand)" : "var(--text-muted)"
        }
      }, I(n.icon, 19)), /*#__PURE__*/React.createElement("span", {
        style: {
          flex: 1
        }
      }, n.label), n.badge && /*#__PURE__*/React.createElement(Badge, {
        tone: active ? "brand" : "neutral"
      }, n.badge));
    })), /*#__PURE__*/React.createElement("div", {
      style: {
        marginTop: "auto"
      }
    }, /*#__PURE__*/React.createElement(Card, {
      padding: 16,
      style: {
        background: "var(--brand-subtle)",
        border: "1px solid var(--brand-border)"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontWeight: 700,
        color: "var(--teal-800)",
        fontSize: "var(--text-sm)"
      }
    }, "Profile 80% complete"), /*#__PURE__*/React.createElement("div", {
      style: {
        height: 6,
        background: "var(--teal-100)",
        borderRadius: 99,
        marginTop: 10,
        overflow: "hidden"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        width: "80%",
        height: "100%",
        background: "var(--brand)"
      }
    })), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: "var(--text-xs)",
        color: "var(--teal-700)",
        marginTop: 8
      }
    }, "Add skills to stand out."))));
  }
  function Topbar({
    title
  }) {
    return /*#__PURE__*/React.createElement("header", {
      style: {
        height: 64,
        flexShrink: 0,
        borderBottom: "1px solid var(--border)",
        background: "var(--surface-card)",
        display: "flex",
        alignItems: "center",
        gap: 16,
        padding: "0 28px",
        position: "sticky",
        top: 0,
        zIndex: 10
      }
    }, /*#__PURE__*/React.createElement("h1", {
      style: {
        fontSize: "var(--text-xl)",
        fontWeight: 700,
        color: "var(--text-strong)"
      }
    }, title), /*#__PURE__*/React.createElement("div", {
      style: {
        marginLeft: "auto",
        display: "flex",
        alignItems: "center",
        gap: 14
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        alignItems: "center",
        gap: 8,
        height: 40,
        padding: "0 12px",
        border: "1px solid var(--border-strong)",
        borderRadius: "var(--radius-md)",
        width: 240
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        color: "var(--text-faint)"
      }
    }, I("search", 16)), /*#__PURE__*/React.createElement("input", {
      placeholder: "Search jobs",
      style: {
        border: "none",
        outline: "none",
        flex: 1,
        fontFamily: "var(--font-sans)",
        fontSize: "var(--text-sm)"
      }
    })), /*#__PURE__*/React.createElement("button", {
      style: {
        position: "relative",
        width: 40,
        height: 40,
        border: "1px solid var(--border)",
        borderRadius: "var(--radius-md)",
        background: "var(--surface-card)",
        cursor: "pointer",
        color: "var(--text-muted)",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center"
      }
    }, I("bell", 18), /*#__PURE__*/React.createElement("span", {
      style: {
        position: "absolute",
        top: 7,
        right: 8,
        width: 7,
        height: 7,
        borderRadius: "50%",
        background: "var(--accent)",
        border: "1.5px solid var(--surface-card)"
      }
    })), /*#__PURE__*/React.createElement(Avatar, {
      name: "Sok Dara",
      size: 40
    })));
  }
  const APPS = [{
    title: "Senior Accountant",
    company: "ABA Bank",
    stage: 3,
    status: "Interview",
    date: "12 Jun 2026"
  }, {
    title: "Finance Officer",
    company: "Wing Bank",
    stage: 2,
    status: "Shortlisted",
    date: "09 Jun 2026"
  }, {
    title: "Data Analyst",
    company: "Smart Axiata",
    stage: 1,
    status: "Reviewed",
    date: "06 Jun 2026"
  }, {
    title: "Bookkeeper",
    company: "Manulife",
    stage: 0,
    status: "Applied",
    date: "03 Jun 2026"
  }];
  const RECS = [{
    id: 11,
    title: "Financial Controller",
    company: "Prince Bank",
    location: "Phnom Penh",
    salary: "$1,500–2,000/mo",
    type: "Full-time",
    postedAt: "1d ago",
    featured: true
  }, {
    id: 12,
    title: "Accounts Manager",
    company: "Chip Mong",
    location: "Phnom Penh",
    salary: "$1,100–1,500/mo",
    type: "Full-time",
    postedAt: "2d ago"
  }];
  const SAVED = [{
    id: 21,
    title: "Tax Manager",
    company: "Acleda Bank",
    location: "Phnom Penh",
    salary: "$1,400–1,900/mo",
    type: "Full-time",
    postedAt: "1d ago",
    featured: true
  }, {
    id: 22,
    title: "Internal Auditor",
    company: "Cellcard",
    location: "Phnom Penh",
    salary: "$1,000–1,500/mo",
    type: "Full-time",
    postedAt: "3d ago"
  }, {
    id: 23,
    title: "Payroll Officer",
    company: "Pizza Company",
    location: "Siem Reap",
    salary: "$600–900/mo",
    type: "Full-time",
    postedAt: "4d ago"
  }, {
    id: 24,
    title: "Credit Analyst",
    company: "Prince Bank",
    location: "Phnom Penh",
    salary: "$900–1,300/mo",
    type: "Full-time",
    remote: true,
    postedAt: "5d ago"
  }];
  const RESUME = {
    name: "Sok Dara",
    title: "Senior Accountant",
    email: "dara.sok@email.com",
    phone: "+855 12 345 678",
    location: "Phnom Penh, Cambodia",
    summary: "CPA-qualified accountant with 6+ years across banking and retail. Led monthly close for a 200-staff branch network and cut reporting time 30%.",
    education: [{
      school: "Royal University of Law and Economics",
      degree: "BBA, Accounting",
      years: "2014 – 2018"
    }, {
      school: "ACCA (in progress)",
      degree: "F1–F6 completed",
      years: "2020 – present"
    }],
    experience: [{
      role: "Senior Accountant",
      org: "ABA Bank",
      years: "2021 – present",
      note: "Owns monthly close, statutory reporting, and a team of 3."
    }, {
      role: "Accountant",
      org: "Chip Mong Group",
      years: "2018 – 2021",
      note: "AP/AR, reconciliations, and tax filing for retail division."
    }],
    skills: ["QuickBooks", "Excel (advanced)", "Khmer GAAP", "IFRS", "Tax filing", "Payroll", "Audit"],
    certifications: ["CPA Cambodia (2021)", "Certified Bookkeeper (2019)"]
  };
  function ScreenHead({
    title,
    sub,
    action
  }) {
    return /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "space-between",
        marginBottom: 18
      }
    }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h2", {
      style: {
        fontSize: "var(--text-xl)",
        fontWeight: 700,
        color: "var(--text-strong)"
      }
    }, title), sub && /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: "var(--text-sm)",
        color: "var(--text-muted)",
        marginTop: 4
      }
    }, sub)), action);
  }
  function SavedJobs({
    saved,
    toggleSave
  }) {
    return /*#__PURE__*/React.createElement("div", {
      style: {
        padding: 28
      }
    }, /*#__PURE__*/React.createElement(ScreenHead, {
      title: "Saved jobs",
      sub: SAVED.length + " jobs saved · we'll alert you before deadlines"
    }), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: 14
      }
    }, SAVED.map(j => /*#__PURE__*/React.createElement(JobCard, _extends({
      key: j.id
    }, j, {
      saved: saved.includes(j.id),
      onSave: () => toggleSave(j.id)
    })))));
  }
  function Resume() {
    const r = RESUME;
    const Section = ({
      icon,
      title,
      children,
      action
    }) => /*#__PURE__*/React.createElement(Card, {
      padding: 22,
      style: {
        marginBottom: 16
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        alignItems: "center",
        gap: 10,
        marginBottom: 14
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        width: 34,
        height: 34,
        borderRadius: "var(--radius-md)",
        background: "var(--brand-subtle)",
        color: "var(--brand)"
      }
    }, I(icon, 18)), /*#__PURE__*/React.createElement("h3", {
      style: {
        fontSize: "var(--text-md)",
        fontWeight: 700,
        color: "var(--text-strong)",
        flex: 1
      }
    }, title), action || /*#__PURE__*/React.createElement(Button, {
      variant: "ghost",
      size: "sm",
      iconLeft: I("pencil", 13)
    }, "Edit")), children);
    return /*#__PURE__*/React.createElement("div", {
      style: {
        padding: 28,
        maxWidth: 860
      }
    }, /*#__PURE__*/React.createElement(ScreenHead, {
      title: "R\xE9sum\xE9 builder",
      sub: "Keep this current \u2014 employers see it when you apply.",
      action: /*#__PURE__*/React.createElement(Button, {
        variant: "primary",
        iconLeft: I("download", 16)
      }, "Download PDF")
    }), /*#__PURE__*/React.createElement(Section, {
      icon: "user-round",
      title: "Personal information"
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        gap: 16,
        alignItems: "center"
      }
    }, /*#__PURE__*/React.createElement(Avatar, {
      name: r.name,
      size: 56
    }), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      style: {
        fontWeight: 700,
        fontSize: "var(--text-lg)",
        color: "var(--text-strong)",
        fontFamily: "var(--font-display)"
      }
    }, r.name), /*#__PURE__*/React.createElement("div", {
      style: {
        color: "var(--text-muted)"
      }
    }, r.title), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        gap: 16,
        marginTop: 8,
        fontSize: "var(--text-sm)",
        color: "var(--text-muted)",
        flexWrap: "wrap"
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        display: "inline-flex",
        alignItems: "center",
        gap: 5
      }
    }, I("mail", 14), r.email), /*#__PURE__*/React.createElement("span", {
      style: {
        display: "inline-flex",
        alignItems: "center",
        gap: 5
      }
    }, I("phone", 14), r.phone), /*#__PURE__*/React.createElement("span", {
      style: {
        display: "inline-flex",
        alignItems: "center",
        gap: 5
      }
    }, I("map-pin", 14), r.location)))), /*#__PURE__*/React.createElement("p", {
      style: {
        marginTop: 14,
        color: "var(--text-body)",
        lineHeight: 1.6
      }
    }, r.summary)), /*#__PURE__*/React.createElement(Section, {
      icon: "graduation-cap",
      title: "Education"
    }, r.education.map((e, i) => /*#__PURE__*/React.createElement("div", {
      key: i,
      style: {
        display: "flex",
        justifyContent: "space-between",
        padding: "10px 0",
        borderTop: i ? "1px solid var(--border-subtle)" : "none"
      }
    }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      style: {
        fontWeight: 600,
        color: "var(--text-strong)"
      }
    }, e.school), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: "var(--text-sm)",
        color: "var(--text-muted)"
      }
    }, e.degree)), /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: "var(--text-sm)",
        color: "var(--text-faint)"
      }
    }, e.years)))), /*#__PURE__*/React.createElement(Section, {
      icon: "briefcase",
      title: "Experience"
    }, r.experience.map((e, i) => /*#__PURE__*/React.createElement("div", {
      key: i,
      style: {
        padding: "12px 0",
        borderTop: i ? "1px solid var(--border-subtle)" : "none"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        justifyContent: "space-between"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontWeight: 700,
        color: "var(--text-strong)"
      }
    }, e.role, " \xB7 ", /*#__PURE__*/React.createElement("span", {
      style: {
        color: "var(--text-brand)"
      }
    }, e.org)), /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: "var(--text-sm)",
        color: "var(--text-faint)"
      }
    }, e.years)), /*#__PURE__*/React.createElement("p", {
      style: {
        fontSize: "var(--text-sm)",
        color: "var(--text-body)",
        marginTop: 4
      }
    }, e.note)))), /*#__PURE__*/React.createElement(Section, {
      icon: "sparkles",
      title: "Skills",
      action: /*#__PURE__*/React.createElement(Button, {
        variant: "ghost",
        size: "sm",
        iconLeft: I("plus", 13)
      }, "Add")
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        flexWrap: "wrap",
        gap: 8
      }
    }, r.skills.map(s => /*#__PURE__*/React.createElement(Tag, {
      key: s
    }, s)))), /*#__PURE__*/React.createElement(Section, {
      icon: "award",
      title: "Certifications"
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        flexDirection: "column",
        gap: 8
      }
    }, r.certifications.map(c => /*#__PURE__*/React.createElement("div", {
      key: c,
      style: {
        display: "flex",
        alignItems: "center",
        gap: 8,
        color: "var(--text-body)"
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        color: "var(--success)"
      }
    }, I("badge-check", 16)), c)))));
  }
  function Profile() {
    const r = RESUME;
    return /*#__PURE__*/React.createElement("div", {
      style: {
        padding: 28,
        maxWidth: 720
      }
    }, /*#__PURE__*/React.createElement(ScreenHead, {
      title: "Profile",
      sub: "How you appear to employers and how we tailor recommendations."
    }), /*#__PURE__*/React.createElement(Card, {
      padding: 24
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        flexDirection: "column",
        gap: 18
      }
    }, /*#__PURE__*/React.createElement(Input, {
      label: "Full name",
      defaultValue: r.name
    }), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: 16
      }
    }, /*#__PURE__*/React.createElement(Input, {
      label: "Email",
      defaultValue: r.email,
      iconLeft: I("mail", 16)
    }), /*#__PURE__*/React.createElement(Input, {
      label: "Phone",
      defaultValue: r.phone,
      iconLeft: I("phone", 16)
    })), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: 16
      }
    }, /*#__PURE__*/React.createElement(Input, {
      label: "Current title",
      defaultValue: r.title
    }), /*#__PURE__*/React.createElement(Select, {
      label: "Location",
      options: ["Phnom Penh", "Siem Reap", "Battambang", "Sihanoukville"],
      defaultValue: "Phnom Penh"
    })), /*#__PURE__*/React.createElement(Switch, {
      label: "Open to remote work",
      checked: true,
      onChange: () => {}
    }), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        gap: 10,
        paddingTop: 6
      }
    }, /*#__PURE__*/React.createElement(Button, {
      variant: "primary"
    }, "Save changes"), /*#__PURE__*/React.createElement(Button, {
      variant: "ghost"
    }, "Cancel")))));
  }
  function Overview({
    saved,
    toggleSave
  }) {
    return /*#__PURE__*/React.createElement("div", {
      style: {
        padding: 28,
        display: "flex",
        flexDirection: "column",
        gap: 24
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: "grid",
        gridTemplateColumns: "repeat(3,1fr)",
        gap: 16
      }
    }, /*#__PURE__*/React.createElement(StatCard, {
      label: "Applied jobs",
      value: "12",
      tone: "brand",
      icon: I("send", 22)
    }), /*#__PURE__*/React.createElement(StatCard, {
      label: "Saved jobs",
      value: "8",
      tone: "accent",
      icon: I("bookmark", 22)
    }), /*#__PURE__*/React.createElement(StatCard, {
      label: "Interview requests",
      value: "2",
      tone: "success",
      delta: "2 new",
      icon: I("calendar-check", 22)
    })), /*#__PURE__*/React.createElement(Card, {
      padding: 0
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        padding: "18px 22px",
        borderBottom: "1px solid var(--border)",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center"
      }
    }, /*#__PURE__*/React.createElement("h2", {
      style: {
        fontSize: "var(--text-lg)",
        fontWeight: 700,
        color: "var(--text-strong)"
      }
    }, "Recent applications"), /*#__PURE__*/React.createElement(Button, {
      variant: "ghost",
      size: "sm",
      iconRight: I("arrow-right", 14)
    }, "View all")), APPS.slice(0, 3).map((a, i) => /*#__PURE__*/React.createElement("div", {
      key: i,
      style: {
        padding: "16px 22px",
        borderBottom: i < 2 ? "1px solid var(--border-subtle)" : "none",
        display: "flex",
        alignItems: "center",
        gap: 16
      }
    }, /*#__PURE__*/React.createElement(Avatar, {
      name: a.company,
      square: true,
      size: 42
    }), /*#__PURE__*/React.createElement("div", {
      style: {
        width: 200
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontWeight: 700,
        color: "var(--text-strong)"
      }
    }, a.title), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: "var(--text-sm)",
        color: "var(--text-muted)"
      }
    }, a.company)), /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1,
        maxWidth: 380
      }
    }, /*#__PURE__*/React.createElement(ProgressTracker, {
      current: a.stage,
      steps: ["Applied", "Reviewed", "Shortlisted", "Interview", "Offered"]
    })), /*#__PURE__*/React.createElement("span", {
      style: {
        marginLeft: "auto",
        fontSize: "var(--text-sm)",
        color: "var(--text-faint)"
      }
    }, a.date)))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 14
      }
    }, /*#__PURE__*/React.createElement("h2", {
      style: {
        fontSize: "var(--text-lg)",
        fontWeight: 700,
        color: "var(--text-strong)"
      }
    }, "Recommended for you"), /*#__PURE__*/React.createElement(Badge, {
      tone: "brand"
    }, "AI match")), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: 14
      }
    }, RECS.map(j => /*#__PURE__*/React.createElement(JobCard, _extends({
      key: j.id
    }, j, {
      saved: saved.includes(j.id),
      onSave: () => toggleSave(j.id)
    }))))));
  }
  function Applications() {
    const [tab, setTab] = React.useState("all");
    return /*#__PURE__*/React.createElement("div", {
      style: {
        padding: 28
      }
    }, /*#__PURE__*/React.createElement(Tabs, {
      value: tab,
      onChange: setTab,
      tabs: [{
        value: "all",
        label: "All",
        count: 12
      }, {
        value: "active",
        label: "Active",
        count: 5
      }, {
        value: "interview",
        label: "Interview",
        count: 2
      }, {
        value: "closed",
        label: "Closed",
        count: 5
      }],
      style: {
        marginBottom: 20
      }
    }), /*#__PURE__*/React.createElement(Card, {
      padding: 0
    }, APPS.map((a, i) => /*#__PURE__*/React.createElement("div", {
      key: i,
      style: {
        padding: "18px 22px",
        borderBottom: i < APPS.length - 1 ? "1px solid var(--border-subtle)" : "none",
        display: "flex",
        alignItems: "center",
        gap: 16
      }
    }, /*#__PURE__*/React.createElement(Avatar, {
      name: a.company,
      square: true,
      size: 46
    }), /*#__PURE__*/React.createElement("div", {
      style: {
        width: 220
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontWeight: 700,
        color: "var(--text-strong)",
        fontSize: "var(--text-md)"
      }
    }, a.title), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: "var(--text-sm)",
        color: "var(--text-muted)"
      }
    }, a.company, " \xB7 Applied ", a.date)), /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1,
        maxWidth: 420
      }
    }, /*#__PURE__*/React.createElement(ProgressTracker, {
      current: a.stage,
      steps: ["Applied", "Reviewed", "Shortlisted", "Interview", "Offered"]
    })), /*#__PURE__*/React.createElement(Button, {
      variant: "secondary",
      size: "sm",
      style: {
        marginLeft: "auto"
      }
    }, "View")))));
  }
  function App() {
    const [page, setPage] = React.useState("dashboard");
    const [saved, setSaved] = React.useState([11, 21, 22, 23, 24]);
    const toggleSave = id => setSaved(s => s.includes(id) ? s.filter(x => x !== id) : [...s, id]);
    React.useEffect(() => {
      if (window.lucide) window.lucide.createIcons();
    });
    const titles = {
      dashboard: "Welcome back, Dara",
      applications: "My applications",
      saved: "Saved jobs",
      resume: "Résumé builder",
      profile: "Profile"
    };
    return /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        minHeight: "100vh",
        background: "var(--surface-page)"
      }
    }, /*#__PURE__*/React.createElement(Sidebar, {
      page: page,
      onNav: setPage
    }), /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1,
        minWidth: 0,
        display: "flex",
        flexDirection: "column"
      }
    }, /*#__PURE__*/React.createElement(Topbar, {
      title: titles[page]
    }), page === "dashboard" && /*#__PURE__*/React.createElement(Overview, {
      saved: saved,
      toggleSave: toggleSave
    }), page === "applications" && /*#__PURE__*/React.createElement(Applications, null), page === "saved" && /*#__PURE__*/React.createElement(SavedJobs, {
      saved: saved,
      toggleSave: toggleSave
    }), page === "resume" && /*#__PURE__*/React.createElement(Resume, null), page === "profile" && /*#__PURE__*/React.createElement(Profile, null)));
  }
  window.KramaCandidateApp = App;
})();
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/candidate-dashboard/app.jsx", error: String((e && e.message) || e) }); }

// ui_kits/employer-dashboard/app.jsx
try { (() => {
// Krama employer dashboard — shell + overview + applicant pipeline board.
(function init() {
  if (!window.KramaDesignSystem_1a6f65) {
    return setTimeout(init, 40);
  }
  const NS = window.KramaDesignSystem_1a6f65;
  const {
    Button,
    Badge,
    StatusBadge,
    Avatar,
    Card,
    StatCard,
    Tabs,
    EmptyState,
    Input,
    Textarea,
    Select,
    Switch
  } = NS;
  const I = (n, s = 18) => /*#__PURE__*/React.createElement("i", {
    "data-lucide": n,
    style: {
      width: s,
      height: s
    }
  });
  const NAV = [{
    id: "dashboard",
    label: "Dashboard",
    icon: "layout-dashboard"
  }, {
    id: "jobs",
    label: "Job postings",
    icon: "briefcase",
    badge: 6
  }, {
    id: "applicants",
    label: "Applicants",
    icon: "users",
    badge: 24
  }, {
    id: "company",
    label: "Company profile",
    icon: "building-2"
  }, {
    id: "billing",
    label: "Plan & billing",
    icon: "credit-card"
  }];
  function Sidebar({
    page,
    onNav
  }) {
    return /*#__PURE__*/React.createElement("aside", {
      style: {
        width: 248,
        flexShrink: 0,
        background: "var(--surface-card)",
        borderRight: "1px solid var(--border)",
        display: "flex",
        flexDirection: "column",
        padding: "20px 14px",
        position: "sticky",
        top: 0,
        height: "100vh"
      }
    }, /*#__PURE__*/React.createElement("img", {
      src: "../../assets/krama-logo.svg",
      height: "28",
      alt: "Krama",
      style: {
        margin: "4px 8px 22px"
      }
    }), /*#__PURE__*/React.createElement("nav", {
      style: {
        display: "flex",
        flexDirection: "column",
        gap: 3
      }
    }, NAV.map(n => {
      const active = page === n.id;
      return /*#__PURE__*/React.createElement("button", {
        key: n.id,
        onClick: () => onNav(n.id),
        style: {
          display: "flex",
          alignItems: "center",
          gap: 11,
          border: "none",
          cursor: "pointer",
          padding: "10px 12px",
          borderRadius: "var(--radius-md)",
          textAlign: "left",
          background: active ? "var(--brand-subtle)" : "transparent",
          color: active ? "var(--text-brand)" : "var(--text-body)",
          fontFamily: "var(--font-sans)",
          fontWeight: active ? 700 : 500,
          fontSize: "var(--text-base)"
        }
      }, /*#__PURE__*/React.createElement("span", {
        style: {
          display: "inline-flex",
          color: active ? "var(--brand)" : "var(--text-muted)"
        }
      }, I(n.icon, 19)), /*#__PURE__*/React.createElement("span", {
        style: {
          flex: 1
        }
      }, n.label), n.badge && /*#__PURE__*/React.createElement(Badge, {
        tone: active ? "brand" : "neutral"
      }, n.badge));
    })), /*#__PURE__*/React.createElement("div", {
      style: {
        marginTop: "auto",
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: "10px 8px",
        borderTop: "1px solid var(--border)"
      }
    }, /*#__PURE__*/React.createElement(Avatar, {
      name: "ABA Bank",
      square: true,
      size: 36
    }), /*#__PURE__*/React.createElement("div", {
      style: {
        minWidth: 0
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontWeight: 700,
        fontSize: "var(--text-sm)",
        color: "var(--text-strong)",
        whiteSpace: "nowrap"
      }
    }, "ABA Bank"), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: "var(--text-xs)",
        color: "var(--success)",
        display: "flex",
        alignItems: "center",
        gap: 4
      }
    }, I("badge-check", 12), " Verified"))));
  }
  function Topbar({
    title
  }) {
    return /*#__PURE__*/React.createElement("header", {
      style: {
        height: 64,
        flexShrink: 0,
        borderBottom: "1px solid var(--border)",
        background: "var(--surface-card)",
        display: "flex",
        alignItems: "center",
        gap: 16,
        padding: "0 28px",
        position: "sticky",
        top: 0,
        zIndex: 10
      }
    }, /*#__PURE__*/React.createElement("h1", {
      style: {
        fontSize: "var(--text-xl)",
        fontWeight: 700,
        color: "var(--text-strong)"
      }
    }, title), /*#__PURE__*/React.createElement("div", {
      style: {
        marginLeft: "auto",
        display: "flex",
        alignItems: "center",
        gap: 14
      }
    }, /*#__PURE__*/React.createElement("button", {
      style: {
        position: "relative",
        width: 40,
        height: 40,
        border: "1px solid var(--border)",
        borderRadius: "var(--radius-md)",
        background: "var(--surface-card)",
        cursor: "pointer",
        color: "var(--text-muted)",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center"
      }
    }, I("bell", 18), /*#__PURE__*/React.createElement("span", {
      style: {
        position: "absolute",
        top: 7,
        right: 8,
        width: 7,
        height: 7,
        borderRadius: "50%",
        background: "var(--accent)",
        border: "1.5px solid var(--surface-card)"
      }
    })), /*#__PURE__*/React.createElement(Button, {
      variant: "primary",
      iconLeft: I("plus", 16)
    }, "Post a job")));
  }
  const JOBS = [{
    title: "Senior Accountant",
    status: "published",
    apps: 18,
    views: 420,
    date: "02 Jun"
  }, {
    title: "Finance Officer",
    status: "published",
    apps: 9,
    views: 260,
    date: "28 May"
  }, {
    title: "Treasury Analyst",
    status: "pending",
    apps: 0,
    views: 0,
    date: "14 Jun"
  }, {
    title: "Branch Manager",
    status: "draft",
    apps: 0,
    views: 0,
    date: "—"
  }, {
    title: "Teller (Siem Reap)",
    status: "rejected",
    apps: 0,
    views: 0,
    date: "10 Jun"
  }];
  const PIPE = {
    Applied: [["Chan Mony", "5y · Accounting"], ["Sok Pisey", "3y · Finance"], ["Vy Daro", "6y · Audit"]],
    Reviewed: [["Kim Sotheara", "4y · Banking"], ["Lim Chhay", "2y · Bookkeeping"]],
    Shortlisted: [["Neang Sreyleak", "7y · Controller"]],
    Interview: [["Heng Visal", "5y · Finance"]],
    Offered: [["Tep Dara", "8y · CFO track"]]
  };
  const stageTone = {
    Applied: "neutral",
    Reviewed: "info",
    Shortlisted: "brand",
    Interview: "warning",
    Offered: "success"
  };
  function Overview() {
    return /*#__PURE__*/React.createElement("div", {
      style: {
        padding: 28,
        display: "flex",
        flexDirection: "column",
        gap: 24
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: "grid",
        gridTemplateColumns: "repeat(4,1fr)",
        gap: 16
      }
    }, /*#__PURE__*/React.createElement(StatCard, {
      label: "Active jobs",
      value: "4",
      tone: "brand",
      icon: I("briefcase", 22)
    }), /*#__PURE__*/React.createElement(StatCard, {
      label: "Pending approval",
      value: "1",
      tone: "warning",
      icon: I("clock", 22)
    }), /*#__PURE__*/React.createElement(StatCard, {
      label: "Total applications",
      value: "27",
      delta: "6 new",
      tone: "info",
      icon: I("users", 22)
    }), /*#__PURE__*/React.createElement(StatCard, {
      label: "Profile views",
      value: "680",
      delta: "14%",
      tone: "success",
      icon: I("eye", 22)
    })), /*#__PURE__*/React.createElement(Card, {
      padding: 0
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        padding: "18px 22px",
        borderBottom: "1px solid var(--border)",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center"
      }
    }, /*#__PURE__*/React.createElement("h2", {
      style: {
        fontSize: "var(--text-lg)",
        fontWeight: 700,
        color: "var(--text-strong)"
      }
    }, "Your job postings"), /*#__PURE__*/React.createElement(Button, {
      variant: "ghost",
      size: "sm",
      iconRight: I("arrow-right", 14)
    }, "Manage jobs")), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "grid",
        gridTemplateColumns: "1.6fr 1fr 0.7fr 0.7fr 0.8fr 40px",
        padding: "10px 22px",
        fontSize: "var(--text-xs)",
        fontWeight: 700,
        letterSpacing: ".04em",
        textTransform: "uppercase",
        color: "var(--text-faint)",
        borderBottom: "1px solid var(--border-subtle)"
      }
    }, /*#__PURE__*/React.createElement("span", null, "Job title"), /*#__PURE__*/React.createElement("span", null, "Status"), /*#__PURE__*/React.createElement("span", null, "Applicants"), /*#__PURE__*/React.createElement("span", null, "Views"), /*#__PURE__*/React.createElement("span", null, "Posted"), /*#__PURE__*/React.createElement("span", null)), JOBS.map((j, i) => /*#__PURE__*/React.createElement("div", {
      key: i,
      style: {
        display: "grid",
        gridTemplateColumns: "1.6fr 1fr 0.7fr 0.7fr 0.8fr 40px",
        alignItems: "center",
        padding: "14px 22px",
        borderBottom: i < JOBS.length - 1 ? "1px solid var(--border-subtle)" : "none"
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontWeight: 600,
        color: "var(--text-strong)"
      }
    }, j.title), /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement(StatusBadge, {
      status: j.status
    })), /*#__PURE__*/React.createElement("span", {
      style: {
        fontFamily: "var(--font-mono)",
        fontSize: "var(--text-sm)",
        color: "var(--text-body)"
      }
    }, j.apps), /*#__PURE__*/React.createElement("span", {
      style: {
        fontFamily: "var(--font-mono)",
        fontSize: "var(--text-sm)",
        color: "var(--text-body)"
      }
    }, j.views), /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: "var(--text-sm)",
        color: "var(--text-muted)"
      }
    }, j.date), /*#__PURE__*/React.createElement("span", {
      style: {
        color: "var(--text-faint)",
        cursor: "pointer",
        display: "inline-flex"
      }
    }, I("ellipsis", 18))))));
  }
  function Applicants() {
    return /*#__PURE__*/React.createElement("div", {
      style: {
        padding: 28
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        alignItems: "center",
        gap: 12,
        marginBottom: 20
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontWeight: 700,
        color: "var(--text-strong)",
        fontSize: "var(--text-md)"
      }
    }, "Senior Accountant"), /*#__PURE__*/React.createElement(Badge, {
      tone: "neutral"
    }, "18 applicants")), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "grid",
        gridTemplateColumns: "repeat(5, minmax(190px, 1fr))",
        gap: 14,
        alignItems: "start",
        overflowX: "auto",
        paddingBottom: 6
      }
    }, Object.entries(PIPE).map(([stage, people]) => /*#__PURE__*/React.createElement("div", {
      key: stage,
      style: {
        background: "var(--surface-sunken)",
        borderRadius: "var(--radius-lg)",
        padding: 10,
        minHeight: 200,
        minWidth: 0
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "4px 6px 10px"
      }
    }, /*#__PURE__*/React.createElement(Badge, {
      tone: stageTone[stage]
    }, stage), /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: "var(--text-xs)",
        fontWeight: 700,
        color: "var(--text-muted)"
      }
    }, people.length)), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        flexDirection: "column",
        gap: 8
      }
    }, people.map(([name, meta], i) => /*#__PURE__*/React.createElement("div", {
      key: i,
      style: {
        background: "var(--surface-card)",
        border: "1px solid var(--border)",
        borderRadius: "var(--radius-md)",
        padding: 12,
        boxShadow: "var(--shadow-xs)"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        alignItems: "center",
        gap: 9
      }
    }, /*#__PURE__*/React.createElement(Avatar, {
      name: name,
      size: 32
    }), /*#__PURE__*/React.createElement("div", {
      style: {
        minWidth: 0
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontWeight: 700,
        fontSize: "var(--text-sm)",
        color: "var(--text-strong)",
        whiteSpace: "nowrap",
        overflow: "hidden",
        textOverflow: "ellipsis"
      }
    }, name), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: "var(--text-xs)",
        color: "var(--text-muted)"
      }
    }, meta))), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        gap: 6,
        marginTop: 10
      }
    }, /*#__PURE__*/React.createElement(Button, {
      variant: "ghost",
      size: "sm",
      style: {
        flex: 1,
        height: 30
      },
      iconLeft: I("file-text", 13)
    }, "CV"), /*#__PURE__*/React.createElement(Button, {
      variant: "secondary",
      size: "sm",
      style: {
        flex: 1,
        height: 30
      }
    }, "Move")))))))));
  }
  const PLANS = [{
    name: "Free",
    price: "$0",
    per: "forever",
    tone: "neutral",
    current: false,
    features: ["1 active job post", "Standard listing", "Basic applicant list", "Email support"]
  }, {
    name: "Standard",
    price: "$49",
    per: "/ month",
    tone: "brand",
    popular: true,
    current: true,
    features: ["10 active job posts", "Applicant tracking pipeline", "Résumé downloads", "Priority support"]
  }, {
    name: "Premium",
    price: "$99",
    per: "/ month",
    tone: "accent",
    current: false,
    features: ["Unlimited job posts", "3 featured listings / mo", "Résumé database search", "AI candidate matching", "Dedicated manager"]
  }];
  const INVOICES = [{
    id: "INV-2026-0042",
    date: "01 Jun 2026",
    amount: "$49.00",
    status: "Paid",
    method: "ABA Bank"
  }, {
    id: "INV-2026-0031",
    date: "01 May 2026",
    amount: "$49.00",
    status: "Paid",
    method: "Wing"
  }, {
    id: "INV-2026-0019",
    date: "01 Apr 2026",
    amount: "$49.00",
    status: "Paid",
    method: "KHQR"
  }, {
    id: "INV-2026-0008",
    date: "01 Mar 2026",
    amount: "$49.00",
    status: "Paid",
    method: "ACLEDA Bank"
  }, {
    id: "INV-2025-0391",
    date: "01 Feb 2026",
    amount: "$49.00",
    status: "Paid",
    method: "ABA Bank"
  }, {
    id: "INV-2025-0372",
    date: "01 Jan 2026",
    amount: "$49.00",
    status: "Paid",
    method: "KHQR"
  }, {
    id: "INV-2025-0353",
    date: "01 Dec 2025",
    amount: "$99.00",
    status: "Paid",
    method: "ABA Bank"
  }, {
    id: "INV-2025-0334",
    date: "01 Nov 2025",
    amount: "$99.00",
    status: "Paid",
    method: "ACLEDA Bank"
  }, {
    id: "INV-2025-0315",
    date: "01 Oct 2025",
    amount: "$49.00",
    status: "Paid",
    method: "Wing"
  }, {
    id: "INV-2025-0296",
    date: "01 Sep 2025",
    amount: "$49.00",
    status: "Paid",
    method: "KHQR"
  }, {
    id: "INV-2025-0277",
    date: "01 Aug 2025",
    amount: "$49.00",
    status: "Paid",
    method: "ABA Bank"
  }, {
    id: "INV-2025-0258",
    date: "01 Jul 2025",
    amount: "$49.00",
    status: "Refunded",
    method: "ABA Bank"
  }, {
    id: "INV-2025-0239",
    date: "01 Jun 2025",
    amount: "$49.00",
    status: "Paid",
    method: "ACLEDA Bank"
  }, {
    id: "INV-2025-0220",
    date: "01 May 2025",
    amount: "$0.00",
    status: "Paid",
    method: "Free"
  }];
  function ScreenHead({
    title,
    sub,
    action
  }) {
    return /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "space-between",
        marginBottom: 18
      }
    }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h2", {
      style: {
        fontSize: "var(--text-xl)",
        fontWeight: 700,
        color: "var(--text-strong)"
      }
    }, title), sub && /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: "var(--text-sm)",
        color: "var(--text-muted)",
        marginTop: 4
      }
    }, sub)), action);
  }
  function JobsManage() {
    const [tab, setTab] = React.useState("all");
    return /*#__PURE__*/React.createElement("div", {
      style: {
        padding: 28
      }
    }, /*#__PURE__*/React.createElement(ScreenHead, {
      title: "Job postings",
      sub: "Create, edit, duplicate, and close your listings.",
      action: /*#__PURE__*/React.createElement(Button, {
        variant: "primary",
        iconLeft: I("plus", 16)
      }, "Post a job")
    }), /*#__PURE__*/React.createElement(Tabs, {
      value: tab,
      onChange: setTab,
      tabs: [{
        value: "all",
        label: "All",
        count: 6
      }, {
        value: "published",
        label: "Published",
        count: 2
      }, {
        value: "pending",
        label: "Pending",
        count: 1
      }, {
        value: "draft",
        label: "Draft",
        count: 1
      }, {
        value: "closed",
        label: "Closed",
        count: 2
      }],
      style: {
        marginBottom: 18
      }
    }), /*#__PURE__*/React.createElement(Card, {
      padding: 0
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: "grid",
        gridTemplateColumns: "1.8fr 1fr 0.7fr 0.7fr 0.8fr 92px",
        padding: "10px 22px",
        fontSize: "var(--text-xs)",
        fontWeight: 700,
        letterSpacing: ".04em",
        textTransform: "uppercase",
        color: "var(--text-faint)",
        borderBottom: "1px solid var(--border-subtle)"
      }
    }, /*#__PURE__*/React.createElement("span", null, "Job title"), /*#__PURE__*/React.createElement("span", null, "Status"), /*#__PURE__*/React.createElement("span", null, "Applicants"), /*#__PURE__*/React.createElement("span", null, "Views"), /*#__PURE__*/React.createElement("span", null, "Posted"), /*#__PURE__*/React.createElement("span", null)), JOBS.map((j, i) => /*#__PURE__*/React.createElement("div", {
      key: i,
      style: {
        display: "grid",
        gridTemplateColumns: "1.8fr 1fr 0.7fr 0.7fr 0.8fr 92px",
        alignItems: "center",
        padding: "14px 22px",
        borderBottom: i < JOBS.length - 1 ? "1px solid var(--border-subtle)" : "none"
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontWeight: 600,
        color: "var(--text-strong)"
      }
    }, j.title), /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement(StatusBadge, {
      status: j.status
    })), /*#__PURE__*/React.createElement("span", {
      style: {
        fontFamily: "var(--font-mono)",
        fontSize: "var(--text-sm)",
        color: "var(--text-body)"
      }
    }, j.apps), /*#__PURE__*/React.createElement("span", {
      style: {
        fontFamily: "var(--font-mono)",
        fontSize: "var(--text-sm)",
        color: "var(--text-body)"
      }
    }, j.views), /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: "var(--text-sm)",
        color: "var(--text-muted)"
      }
    }, j.date), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        gap: 4,
        justifyContent: "flex-end",
        color: "var(--text-faint)"
      }
    }, /*#__PURE__*/React.createElement("span", {
      title: "Edit",
      style: {
        cursor: "pointer",
        display: "inline-flex"
      }
    }, I("pencil", 16)), /*#__PURE__*/React.createElement("span", {
      title: "Duplicate",
      style: {
        cursor: "pointer",
        display: "inline-flex"
      }
    }, I("copy", 16)), /*#__PURE__*/React.createElement("span", {
      title: "More",
      style: {
        cursor: "pointer",
        display: "inline-flex"
      }
    }, I("ellipsis", 16)))))));
  }
  function CompanyProfile() {
    return /*#__PURE__*/React.createElement("div", {
      style: {
        padding: 28,
        maxWidth: 1100
      }
    }, /*#__PURE__*/React.createElement(ScreenHead, {
      title: "Company profile",
      sub: "This is what candidates see. Verified companies rank higher.",
      action: /*#__PURE__*/React.createElement(Badge, {
        tone: "success"
      }, /*#__PURE__*/React.createElement("span", {
        style: {
          display: "inline-flex",
          alignItems: "center",
          gap: 4
        }
      }, I("badge-check", 13), " Verified"))
    }), /*#__PURE__*/React.createElement(Card, {
      padding: 24
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        gap: 16,
        alignItems: "center",
        marginBottom: 20
      }
    }, /*#__PURE__*/React.createElement(Avatar, {
      name: "ABA Bank",
      square: true,
      size: 64
    }), /*#__PURE__*/React.createElement(Button, {
      variant: "secondary",
      size: "sm",
      iconLeft: I("upload", 14)
    }, "Change logo")), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        flexDirection: "column",
        gap: 18
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: 16
      }
    }, /*#__PURE__*/React.createElement(Input, {
      label: "Company name",
      defaultValue: "ABA Bank"
    }), /*#__PURE__*/React.createElement(Input, {
      label: "Registration number",
      defaultValue: "00012345-2010"
    })), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: 16
      }
    }, /*#__PURE__*/React.createElement(Select, {
      label: "Industry",
      options: ["Financial services", "Telecommunications", "Retail", "Insurance", "Construction"],
      defaultValue: "Financial services"
    }), /*#__PURE__*/React.createElement(Input, {
      label: "Website",
      defaultValue: "https://www.ababank.com",
      iconLeft: I("globe", 16)
    })), /*#__PURE__*/React.createElement(Input, {
      label: "Address",
      defaultValue: "#148, Preah Sihanouk Blvd, Phnom Penh",
      iconLeft: I("map-pin", 16)
    }), /*#__PURE__*/React.createElement(Textarea, {
      label: "About the company",
      rows: 4,
      defaultValue: "ABA Bank is one of Cambodia's premier commercial banks, serving millions of customers with digital-first banking across a nationwide branch network."
    }), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        gap: 10,
        paddingTop: 4
      }
    }, /*#__PURE__*/React.createElement(Button, {
      variant: "primary"
    }, "Save changes"), /*#__PURE__*/React.createElement(Button, {
      variant: "ghost"
    }, "Cancel")))));
  }

  // Payment methods enabled by Admin Console (Payment settings).
  const PAY_DEFAULTS = {
    khqr: {
      enabled: true,
      merchant: "Krama (Cambodia) Co., Ltd",
      account: "krama@aclb"
    },
    acleda: {
      enabled: true,
      merchant: "Krama (Cambodia) Co., Ltd",
      account: "1000-12-345678-9"
    },
    aba: {
      enabled: true,
      merchant: "Krama (Cambodia) Co., Ltd",
      account: "000 123 456"
    }
  };
  function loadPay() {
    try {
      return Object.assign({}, PAY_DEFAULTS, JSON.parse(localStorage.getItem("krama_payment_settings") || "{}"));
    } catch (e) {
      return Object.assign({}, PAY_DEFAULTS);
    }
  }
  const PAY_META = {
    khqr: {
      label: "KHQR",
      desc: "Scan with any Cambodian banking app",
      icon: "qr-code",
      tint: ["var(--brand-subtle)", "var(--brand)"]
    },
    acleda: {
      label: "ACLEDA Bank",
      desc: "ACLEDA mobile / transfer",
      icon: "landmark",
      tint: ["var(--info-subtle)", "var(--info)"]
    },
    aba: {
      label: "ABA Bank",
      desc: "ABA PAY / transfer",
      icon: "building-2",
      tint: ["var(--accent-subtle)", "var(--accent)"]
    }
  };
  function CheckoutModal({
    plan,
    onClose
  }) {
    // inline SVG icons (NOT lucide) so React can reconcile the re-rendering modal safely
    const SVG = kids => /*#__PURE__*/React.createElement("svg", {
      width: "19",
      height: "19",
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: "2",
      strokeLinecap: "round",
      strokeLinejoin: "round"
    }, kids);
    const Ico = {
      x: /*#__PURE__*/React.createElement("svg", {
        width: "18",
        height: "18",
        viewBox: "0 0 24 24",
        fill: "none",
        stroke: "currentColor",
        strokeWidth: "2",
        strokeLinecap: "round",
        strokeLinejoin: "round"
      }, /*#__PURE__*/React.createElement("path", {
        d: "M18 6 6 18M6 6l12 12"
      })),
      check: /*#__PURE__*/React.createElement("svg", {
        width: "12",
        height: "12",
        viewBox: "0 0 24 24",
        fill: "none",
        stroke: "currentColor",
        strokeWidth: "3.2",
        strokeLinecap: "round",
        strokeLinejoin: "round"
      }, /*#__PURE__*/React.createElement("path", {
        d: "M20 6 9 17l-5-5"
      })),
      checkBig: /*#__PURE__*/React.createElement("svg", {
        width: "30",
        height: "30",
        viewBox: "0 0 24 24",
        fill: "none",
        stroke: "currentColor",
        strokeWidth: "2.5",
        strokeLinecap: "round",
        strokeLinejoin: "round"
      }, /*#__PURE__*/React.createElement("path", {
        d: "M20 6 9 17l-5-5"
      })),
      "qr-code": /*#__PURE__*/React.createElement("svg", {
        width: "19",
        height: "19",
        viewBox: "0 0 24 24",
        fill: "none",
        stroke: "currentColor",
        strokeWidth: "2",
        strokeLinecap: "round",
        strokeLinejoin: "round"
      }, /*#__PURE__*/React.createElement("rect", {
        x: "3",
        y: "3",
        width: "7",
        height: "7",
        rx: "1"
      }), /*#__PURE__*/React.createElement("rect", {
        x: "14",
        y: "3",
        width: "7",
        height: "7",
        rx: "1"
      }), /*#__PURE__*/React.createElement("rect", {
        x: "3",
        y: "14",
        width: "7",
        height: "7",
        rx: "1"
      }), /*#__PURE__*/React.createElement("path", {
        d: "M14 14h3v3M21 14v.01M21 21v-3M17 21h.01"
      })),
      landmark: /*#__PURE__*/React.createElement("svg", {
        width: "19",
        height: "19",
        viewBox: "0 0 24 24",
        fill: "none",
        stroke: "currentColor",
        strokeWidth: "2",
        strokeLinecap: "round",
        strokeLinejoin: "round"
      }, /*#__PURE__*/React.createElement("path", {
        d: "M3 22h18M4 10h16M5 10 12 4l7 6M6 10v8M10 10v8M14 10v8M18 10v8"
      })),
      "building-2": /*#__PURE__*/React.createElement("svg", {
        width: "19",
        height: "19",
        viewBox: "0 0 24 24",
        fill: "none",
        stroke: "currentColor",
        strokeWidth: "2",
        strokeLinecap: "round",
        strokeLinejoin: "round"
      }, /*#__PURE__*/React.createElement("path", {
        d: "M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18M6 12H4a2 2 0 0 0-2 2v8h4M10 6h4M10 10h4M10 14h4M10 18h4"
      }))
    };
    const pay = loadPay();
    const available = ["khqr", "acleda", "aba"].filter(k => pay[k] && pay[k].enabled);
    const [method, setMethod] = React.useState(available[0] || null);
    const [done, setDone] = React.useState(false);
    React.useEffect(() => {
      if (window.lucide) window.lucide.createIcons();
    });
    React.useEffect(() => {
      if (plan) {
        setDone(false);
        setMethod(available[0] || null);
      }
    }, [plan]);
    if (!plan) return null;
    const m = method ? PAY_META[method] : null;
    const acct = method ? pay[method] : null;
    return /*#__PURE__*/React.createElement("div", {
      onClick: onClose,
      style: {
        position: "fixed",
        inset: 0,
        zIndex: 200,
        background: "var(--surface-overlay)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 24
      }
    }, /*#__PURE__*/React.createElement("div", {
      onClick: e => e.stopPropagation(),
      style: {
        width: "100%",
        maxWidth: 460,
        background: "var(--surface-card)",
        borderRadius: "var(--radius-xl)",
        boxShadow: "var(--shadow-xl)",
        overflow: "hidden"
      }
    }, !done ? /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "18px 22px",
        borderBottom: "1px solid var(--border)"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontFamily: "var(--font-display)",
        fontWeight: 700,
        fontSize: "var(--text-lg)",
        color: "var(--text-strong)"
      }
    }, "Upgrade to ", plan.name), /*#__PURE__*/React.createElement("button", {
      onClick: onClose,
      "aria-label": "Close",
      style: {
        border: "none",
        background: "transparent",
        cursor: "pointer",
        color: "var(--text-muted)",
        display: "inline-flex"
      }
    }, Ico.x)), /*#__PURE__*/React.createElement("div", {
      style: {
        padding: 22,
        display: "flex",
        flexDirection: "column",
        gap: 16,
        maxHeight: "66vh",
        overflowY: "auto"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        alignItems: "baseline",
        justifyContent: "space-between",
        padding: "14px 16px",
        background: "var(--surface-sunken)",
        borderRadius: "var(--radius-md)"
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontWeight: 600,
        color: "var(--text-body)"
      }
    }, plan.name, " plan"), /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement("strong", {
      style: {
        fontFamily: "var(--font-display)",
        fontSize: "var(--text-2xl)",
        color: "var(--text-strong)"
      }
    }, plan.price), /*#__PURE__*/React.createElement("span", {
      style: {
        color: "var(--text-muted)",
        fontSize: "var(--text-sm)"
      }
    }, " ", plan.per))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: "var(--text-sm)",
        fontWeight: 700,
        color: "var(--text-strong)",
        marginBottom: 10
      }
    }, "Payment method"), available.length === 0 ? /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: "var(--text-sm)",
        color: "var(--text-muted)",
        padding: "12px 14px",
        border: "1px solid var(--border)",
        borderRadius: "var(--radius-md)"
      }
    }, "No payment methods are enabled. Ask an admin to enable one in Payment settings.") : /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        flexDirection: "column",
        gap: 8
      }
    }, available.map(k => {
      const meta = PAY_META[k];
      const on = method === k;
      return /*#__PURE__*/React.createElement("button", {
        key: k,
        onClick: () => setMethod(k),
        style: {
          display: "flex",
          alignItems: "center",
          gap: 12,
          padding: "12px 14px",
          cursor: "pointer",
          textAlign: "left",
          border: "1.5px solid " + (on ? "var(--brand)" : "var(--border-strong)"),
          background: on ? "var(--brand-subtle)" : "var(--surface-card)",
          borderRadius: "var(--radius-md)"
        }
      }, /*#__PURE__*/React.createElement("span", {
        style: {
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          width: 38,
          height: 38,
          borderRadius: "var(--radius-sm)",
          background: meta.tint[0],
          color: meta.tint[1]
        }
      }, Ico[meta.icon]), /*#__PURE__*/React.createElement("div", {
        style: {
          flex: 1
        }
      }, /*#__PURE__*/React.createElement("div", {
        style: {
          fontWeight: 700,
          fontSize: "var(--text-sm)",
          color: "var(--text-strong)"
        }
      }, meta.label), /*#__PURE__*/React.createElement("div", {
        style: {
          fontSize: "var(--text-xs)",
          color: "var(--text-muted)"
        }
      }, meta.desc)), /*#__PURE__*/React.createElement("span", {
        style: {
          width: 18,
          height: 18,
          borderRadius: "50%",
          border: "2px solid " + (on ? "var(--brand)" : "var(--border-strong)"),
          background: on ? "var(--brand)" : "transparent",
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#fff"
        }
      }, on ? Ico.check : null));
    }))), m ? method === "khqr" ? /*#__PURE__*/React.createElement("div", {
      key: "pay-khqr",
      style: {
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 10,
        padding: "18px",
        border: "1px solid var(--border)",
        borderRadius: "var(--radius-md)"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        width: 160,
        height: 160,
        borderRadius: "var(--radius-md)",
        background: "repeating-conic-gradient(var(--stone-900) 0% 25%, #fff 0% 50%) 50% / 16px 16px",
        border: "6px solid #fff",
        boxShadow: "var(--shadow-sm)"
      }
    }), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: "var(--text-sm)",
        color: "var(--text-muted)",
        textAlign: "center"
      }
    }, "Scan with any banking app to pay ", /*#__PURE__*/React.createElement("strong", {
      style: {
        color: "var(--text-body)"
      }
    }, acct.merchant))) : /*#__PURE__*/React.createElement("div", {
      key: "pay-acct",
      style: {
        padding: "14px 16px",
        border: "1px solid var(--border)",
        borderRadius: "var(--radius-md)",
        fontSize: "var(--text-sm)",
        color: "var(--text-body)"
      }
    }, "Transfer to ", /*#__PURE__*/React.createElement("strong", null, m.label), /*#__PURE__*/React.createElement("br", null), /*#__PURE__*/React.createElement("span", {
      style: {
        color: "var(--text-muted)"
      }
    }, acct.merchant), /*#__PURE__*/React.createElement("br", null), /*#__PURE__*/React.createElement("span", {
      style: {
        fontFamily: "var(--font-mono)",
        color: "var(--text-strong)"
      }
    }, acct.account)) : null), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        gap: 10,
        padding: "16px 22px",
        borderTop: "1px solid var(--border)"
      }
    }, /*#__PURE__*/React.createElement(Button, {
      variant: "ghost",
      onClick: onClose
    }, "Cancel"), /*#__PURE__*/React.createElement(Button, {
      variant: "primary",
      block: true,
      disabled: !method,
      onClick: () => setDone(true)
    }, method === "khqr" ? "I've paid" : "Confirm payment"))) : /*#__PURE__*/React.createElement("div", {
      style: {
        padding: "40px 32px",
        textAlign: "center"
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        width: 64,
        height: 64,
        borderRadius: "50%",
        background: "var(--success-subtle)",
        color: "var(--success)"
      }
    }, Ico.checkBig), /*#__PURE__*/React.createElement("h2", {
      style: {
        fontSize: "var(--text-2xl)",
        fontWeight: 700,
        color: "var(--text-strong)",
        marginTop: 18
      }
    }, "Payment received"), /*#__PURE__*/React.createElement("p", {
      style: {
        color: "var(--text-muted)",
        marginTop: 8,
        lineHeight: 1.55
      }
    }, "You're now on the ", /*#__PURE__*/React.createElement("strong", {
      style: {
        color: "var(--text-body)"
      }
    }, plan.name), " plan, paid via ", PAY_META[method].label, ". A receipt has been emailed to you."), /*#__PURE__*/React.createElement(Button, {
      variant: "primary",
      style: {
        marginTop: 22
      },
      onClick: onClose
    }, "Done"))));
  }
  function Billing() {
    const [checkout, setCheckout] = React.useState(null);
    const [invPage, setInvPage] = React.useState(0);
    const INV_PER = 10;
    const invPages = Math.max(1, Math.ceil(INVOICES.length / INV_PER));
    const invSafe = Math.min(invPage, invPages - 1);
    const invSlice = INVOICES.slice(invSafe * INV_PER, invSafe * INV_PER + INV_PER);
    return /*#__PURE__*/React.createElement("div", {
      style: {
        padding: 28
      }
    }, /*#__PURE__*/React.createElement(ScreenHead, {
      title: "Plan & billing",
      sub: "You're on the Standard plan. Renews 01 Jul 2026."
    }), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "grid",
        gridTemplateColumns: "repeat(3,1fr)",
        gap: 16,
        marginBottom: 28
      }
    }, PLANS.map(p => /*#__PURE__*/React.createElement(Card, {
      key: p.name,
      featured: p.popular,
      padding: 24,
      style: {
        border: p.current ? "1.5px solid var(--brand)" : undefined
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        alignItems: "center",
        gap: 8
      }
    }, /*#__PURE__*/React.createElement("h3", {
      style: {
        fontSize: "var(--text-lg)",
        fontWeight: 700,
        color: "var(--text-strong)"
      }
    }, p.name), p.popular && /*#__PURE__*/React.createElement(Badge, {
      tone: "accent"
    }, "Popular"), p.current && /*#__PURE__*/React.createElement(Badge, {
      tone: "brand"
    }, "Current")), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        alignItems: "baseline",
        gap: 6,
        marginTop: 12
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontFamily: "var(--font-display)",
        fontSize: "var(--text-4xl)",
        fontWeight: 800,
        color: "var(--text-strong)"
      }
    }, p.price), /*#__PURE__*/React.createElement("span", {
      style: {
        color: "var(--text-muted)",
        fontSize: "var(--text-sm)"
      }
    }, p.per)), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        flexDirection: "column",
        gap: 9,
        margin: "18px 0"
      }
    }, p.features.map(f => /*#__PURE__*/React.createElement("div", {
      key: f,
      style: {
        display: "flex",
        gap: 8,
        fontSize: "var(--text-sm)",
        color: "var(--text-body)"
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        color: "var(--brand)",
        flexShrink: 0
      }
    }, I("check", 16)), f))), p.name === "Free" ? /*#__PURE__*/React.createElement(Button, {
      variant: "secondary",
      block: true,
      disabled: true
    }, p.current ? "Current plan" : "Free forever") : /*#__PURE__*/React.createElement(Button, {
      variant: p.current ? "secondary" : p.popular ? "primary" : "ghost",
      block: true,
      disabled: p.current,
      onClick: () => !p.current && setCheckout(p)
    }, p.current ? "Current plan" : "Upgrade")))), /*#__PURE__*/React.createElement(Card, {
      padding: 0
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        padding: "16px 22px",
        borderBottom: "1px solid var(--border)",
        fontWeight: 700,
        color: "var(--text-strong)"
      }
    }, "Billing history"), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "grid",
        gridTemplateColumns: "1.2fr 1fr 0.8fr 1fr 0.8fr",
        padding: "10px 22px",
        fontSize: "var(--text-xs)",
        fontWeight: 700,
        letterSpacing: ".04em",
        textTransform: "uppercase",
        color: "var(--text-faint)",
        borderBottom: "1px solid var(--border-subtle)"
      }
    }, /*#__PURE__*/React.createElement("span", null, "Invoice"), /*#__PURE__*/React.createElement("span", null, "Date"), /*#__PURE__*/React.createElement("span", null, "Amount"), /*#__PURE__*/React.createElement("span", null, "Method"), /*#__PURE__*/React.createElement("span", null, "Status")), invSlice.map((inv, i) => /*#__PURE__*/React.createElement("div", {
      key: inv.id,
      style: {
        display: "grid",
        gridTemplateColumns: "1.2fr 1fr 0.8fr 1fr 0.8fr",
        alignItems: "center",
        padding: "13px 22px",
        borderBottom: i < invSlice.length - 1 ? "1px solid var(--border-subtle)" : "none"
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontFamily: "var(--font-mono)",
        fontSize: "var(--text-sm)",
        color: "var(--text-body)"
      }
    }, inv.id), /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: "var(--text-sm)",
        color: "var(--text-muted)"
      }
    }, inv.date), /*#__PURE__*/React.createElement("span", {
      style: {
        fontWeight: 600,
        color: "var(--text-strong)"
      }
    }, inv.amount), /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: "var(--text-sm)",
        color: "var(--text-body)"
      }
    }, inv.method), /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement(Badge, {
      tone: inv.status === "Refunded" ? "neutral" : "success"
    }, inv.status)))), invPages > 1 ? /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "14px 22px",
        borderTop: "1px solid var(--border-subtle)"
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: "var(--text-sm)",
        color: "var(--text-muted)"
      }
    }, "Showing ", invSafe * INV_PER + 1, "\u2013", invSafe * INV_PER + invSlice.length, " of ", INVOICES.length), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        gap: 8
      }
    }, /*#__PURE__*/React.createElement(Button, {
      variant: "secondary",
      size: "sm",
      disabled: invSafe === 0,
      onClick: () => setInvPage(invSafe - 1)
    }, "Previous"), /*#__PURE__*/React.createElement(Button, {
      variant: "secondary",
      size: "sm",
      disabled: invSafe === invPages - 1,
      onClick: () => setInvPage(invSafe + 1)
    }, "Next"))) : null), /*#__PURE__*/React.createElement(CheckoutModal, {
      plan: checkout,
      onClose: () => setCheckout(null)
    }));
  }
  function App() {
    const [page, setPage] = React.useState("dashboard");
    React.useEffect(() => {
      if (window.lucide) window.lucide.createIcons();
    });
    const titles = {
      dashboard: "Dashboard",
      jobs: "Job postings",
      applicants: "Applicant tracking",
      company: "Company profile",
      billing: "Plan & billing"
    };
    return /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        minHeight: "100vh",
        background: "var(--surface-page)"
      }
    }, /*#__PURE__*/React.createElement(Sidebar, {
      page: page,
      onNav: setPage
    }), /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1,
        minWidth: 0,
        display: "flex",
        flexDirection: "column"
      }
    }, /*#__PURE__*/React.createElement(Topbar, {
      title: titles[page]
    }), page === "dashboard" && /*#__PURE__*/React.createElement(Overview, null), page === "applicants" && /*#__PURE__*/React.createElement(Applicants, null), page === "jobs" && /*#__PURE__*/React.createElement(JobsManage, null), page === "company" && /*#__PURE__*/React.createElement(CompanyProfile, null), page === "billing" && /*#__PURE__*/React.createElement(Billing, null)));
  }
  window.KramaEmployerApp = App;
})();
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/employer-dashboard/app.jsx", error: String((e && e.message) || e) }); }

// ui_kits/public-website/apply.jsx
try { (() => {
// Krama — Apply modal. Multi-state: form → success. Assigns to window.
(function init() {
  if (!window.KramaDesignSystem_1a6f65) {
    return setTimeout(init, 40);
  }
  const {
    Button,
    Input,
    Textarea,
    Avatar,
    IconButton
  } = window.KramaDesignSystem_1a6f65;
  const I = (n, s = 18) => /*#__PURE__*/React.createElement("i", {
    "data-lucide": n,
    style: {
      width: s,
      height: s
    }
  });
  function ApplyModal({
    job,
    onClose
  }) {
    const [done, setDone] = React.useState(false);
    const [fileName, setFileName] = React.useState("Sok-Dara-Resume.pdf");

    // reset to form whenever a new job opens
    React.useEffect(() => {
      if (job) setDone(false);
    }, [job]);
    React.useEffect(() => {
      if (window.lucide) window.lucide.createIcons();
    });
    if (!job) return null;
    return /*#__PURE__*/React.createElement("div", {
      onClick: onClose,
      style: {
        position: "fixed",
        inset: 0,
        zIndex: 200,
        background: "var(--surface-overlay)",
        backdropFilter: "blur(2px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
        animation: "krmfade var(--dur-base) var(--ease-out)"
      }
    }, /*#__PURE__*/React.createElement("div", {
      onClick: e => e.stopPropagation(),
      style: {
        width: "100%",
        maxWidth: 520,
        background: "var(--surface-card)",
        borderRadius: "var(--radius-xl)",
        boxShadow: "var(--shadow-xl)",
        overflow: "hidden",
        animation: "krmrise var(--dur-base) var(--ease-out)"
      }
    }, !done ? /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        alignItems: "center",
        gap: 14,
        padding: "20px 24px",
        borderBottom: "1px solid var(--border)"
      }
    }, /*#__PURE__*/React.createElement(Avatar, {
      src: (window.KRAMA_LOGOS || {})[job.company],
      name: job.company,
      square: true,
      size: 44
    }), /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1,
        minWidth: 0
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontFamily: "var(--font-display)",
        fontWeight: 700,
        fontSize: "var(--text-lg)",
        color: "var(--text-strong)"
      }
    }, "Apply \u2014 ", job.title), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: "var(--text-sm)",
        color: "var(--text-muted)"
      }
    }, job.company, " \xB7 ", job.location)), /*#__PURE__*/React.createElement(IconButton, {
      "aria-label": "Close",
      onClick: onClose
    }, I("x", 18))), /*#__PURE__*/React.createElement("div", {
      style: {
        padding: 24,
        display: "flex",
        flexDirection: "column",
        gap: 16,
        maxHeight: "60vh",
        overflowY: "auto"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: 12
      }
    }, /*#__PURE__*/React.createElement(Input, {
      label: "Full name",
      defaultValue: "Sok Dara"
    }), /*#__PURE__*/React.createElement(Input, {
      label: "Phone",
      defaultValue: "+855 12 345 678"
    })), /*#__PURE__*/React.createElement(Input, {
      label: "Email",
      type: "email",
      defaultValue: "dara.sok@email.com",
      iconLeft: I("mail", 16)
    }), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        flexDirection: "column",
        gap: 6
      }
    }, /*#__PURE__*/React.createElement("label", {
      style: {
        fontSize: "var(--text-sm)",
        fontWeight: 600,
        color: "var(--text-strong)"
      }
    }, "R\xE9sum\xE9 / CV"), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: "12px 14px",
        border: "1px dashed var(--border-strong)",
        borderRadius: "var(--radius-md)",
        background: "var(--surface-sunken)"
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        width: 38,
        height: 38,
        borderRadius: "var(--radius-sm)",
        background: "var(--brand-subtle)",
        color: "var(--brand)"
      }
    }, I("file-text", 18)), /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1,
        minWidth: 0
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontWeight: 600,
        fontSize: "var(--text-sm)",
        color: "var(--text-strong)",
        whiteSpace: "nowrap",
        overflow: "hidden",
        textOverflow: "ellipsis"
      }
    }, fileName), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: "var(--text-xs)",
        color: "var(--text-muted)"
      }
    }, "From your Krama r\xE9sum\xE9 \xB7 PDF")), /*#__PURE__*/React.createElement(Button, {
      variant: "ghost",
      size: "sm",
      iconLeft: I("upload", 14)
    }, "Replace"))), /*#__PURE__*/React.createElement(Textarea, {
      label: "Cover note (optional)",
      rows: 3,
      placeholder: "Tell " + job.company + " why you're a great fit…"
    })), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        gap: 10,
        padding: "16px 24px",
        borderTop: "1px solid var(--border)",
        background: "var(--surface-card)"
      }
    }, /*#__PURE__*/React.createElement(Button, {
      variant: "ghost",
      onClick: onClose
    }, "Cancel"), /*#__PURE__*/React.createElement(Button, {
      variant: "primary",
      block: true,
      size: "lg",
      onClick: () => setDone(true)
    }, "Submit application"))) : /*#__PURE__*/React.createElement("div", {
      style: {
        padding: "40px 32px",
        textAlign: "center"
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        width: 64,
        height: 64,
        borderRadius: "50%",
        background: "var(--success-subtle)",
        color: "var(--success)",
        animation: "krmpop var(--dur-slow) var(--ease-spring)"
      }
    }, I("check", 30)), /*#__PURE__*/React.createElement("h2", {
      style: {
        fontSize: "var(--text-2xl)",
        fontWeight: 700,
        color: "var(--text-strong)",
        marginTop: 18
      }
    }, "Application sent!"), /*#__PURE__*/React.createElement("p", {
      style: {
        color: "var(--text-muted)",
        marginTop: 8,
        maxWidth: 360,
        marginLeft: "auto",
        marginRight: "auto",
        lineHeight: 1.55
      }
    }, job.company, " has received your application for ", /*#__PURE__*/React.createElement("strong", {
      style: {
        color: "var(--text-body)"
      }
    }, job.title), ". Track its status from your dashboard."), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        gap: 10,
        justifyContent: "center",
        marginTop: 24
      }
    }, /*#__PURE__*/React.createElement(Button, {
      variant: "secondary",
      onClick: onClose
    }, "Keep browsing"), /*#__PURE__*/React.createElement(Button, {
      variant: "primary"
    }, "View application")))), /*#__PURE__*/React.createElement("style", null, `
          @keyframes krmfade { from { opacity: 0 } to { opacity: 1 } }
          @keyframes krmrise { from { opacity: 0; transform: translateY(12px) } to { opacity: 1; transform: none } }
          @keyframes krmpop { 0% { transform: scale(0.6); opacity: 0 } 100% { transform: scale(1); opacity: 1 } }
        `));
  }
  window.KramaApplyModal = ApplyModal;
})();
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/public-website/apply.jsx", error: String((e && e.message) || e) }); }

// ui_kits/public-website/auth.jsx
try { (() => {
// Krama auth — Login + Register screens with social sign-in. Assigns to window.
(function init() {
  if (!window.KramaDesignSystem_1a6f65) {
    return setTimeout(init, 40);
  }
  const {
    Button,
    Input,
    Checkbox
  } = window.KramaDesignSystem_1a6f65;

  // Brand social marks (standard "continue with" glyphs)
  const GoogleIcon = () => /*#__PURE__*/React.createElement("svg", {
    width: "18",
    height: "18",
    viewBox: "0 0 24 24",
    "aria-hidden": "true"
  }, /*#__PURE__*/React.createElement("path", {
    fill: "#4285F4",
    d: "M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.27-4.74 3.27-8.1Z"
  }), /*#__PURE__*/React.createElement("path", {
    fill: "#34A853",
    d: "M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23Z"
  }), /*#__PURE__*/React.createElement("path", {
    fill: "#FBBC05",
    d: "M5.84 14.1a6.6 6.6 0 0 1 0-4.2V7.06H2.18a11 11 0 0 0 0 9.88l3.66-2.84Z"
  }), /*#__PURE__*/React.createElement("path", {
    fill: "#EA4335",
    d: "M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84C6.71 7.3 9.14 5.38 12 5.38Z"
  }));
  const FacebookIcon = () => /*#__PURE__*/React.createElement("svg", {
    width: "18",
    height: "18",
    viewBox: "0 0 24 24",
    "aria-hidden": "true"
  }, /*#__PURE__*/React.createElement("path", {
    fill: "#1877F2",
    d: "M24 12a12 12 0 1 0-13.88 11.85v-8.38H7.08V12h3.04V9.36c0-3 1.79-4.67 4.53-4.67 1.31 0 2.68.24 2.68.24v2.95H15.8c-1.49 0-1.95.92-1.95 1.87V12h3.32l-.53 3.47h-2.79v8.38A12 12 0 0 0 24 12Z"
  }));
  function SocialButtons() {
    const base = {
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: 10,
      width: "100%",
      height: 46,
      borderRadius: "var(--radius-md)",
      border: "1px solid var(--border-strong)",
      background: "var(--surface-card)",
      fontFamily: "var(--font-sans)",
      fontSize: "var(--text-base)",
      fontWeight: 600,
      color: "var(--text-strong)",
      cursor: "pointer"
    };
    return /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        flexDirection: "column",
        gap: 10
      }
    }, /*#__PURE__*/React.createElement("button", {
      style: base
    }, /*#__PURE__*/React.createElement(GoogleIcon, null), " Continue with Google"), /*#__PURE__*/React.createElement("button", {
      style: base
    }, /*#__PURE__*/React.createElement(FacebookIcon, null), " Continue with Facebook"));
  }
  function Divider() {
    return /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        alignItems: "center",
        gap: 12,
        margin: "20px 0"
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        flex: 1,
        height: 1,
        background: "var(--border)"
      }
    }), /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: "var(--text-xs)",
        color: "var(--text-faint)",
        fontWeight: 600
      }
    }, "OR"), /*#__PURE__*/React.createElement("span", {
      style: {
        flex: 1,
        height: 1,
        background: "var(--border)"
      }
    }));
  }
  function Shell({
    children,
    onNav
  }) {
    return /*#__PURE__*/React.createElement("div", {
      style: {
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        minHeight: "100vh",
        background: "var(--surface-page)"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        flexDirection: "column",
        padding: "28px 40px"
      }
    }, /*#__PURE__*/React.createElement("img", {
      src: "../../assets/krama-logo.svg",
      height: "30",
      alt: "Krama",
      style: {
        cursor: "pointer",
        alignSelf: "flex-start"
      },
      onClick: () => onNav("home")
    }), /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1,
        display: "flex",
        alignItems: "center",
        justifyContent: "center"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        width: "100%",
        maxWidth: 380
      }
    }, children))), /*#__PURE__*/React.createElement("div", {
      style: {
        position: "relative",
        background: "var(--teal-800)",
        overflow: "hidden",
        display: "flex",
        alignItems: "center",
        padding: 56
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        position: "absolute",
        inset: 0,
        background: "url('../../assets/krama-pattern.svg')",
        backgroundSize: 80,
        opacity: 0.1
      }
    }), /*#__PURE__*/React.createElement("div", {
      style: {
        position: "relative",
        color: "#fff",
        maxWidth: 420
      }
    }, /*#__PURE__*/React.createElement("h2", {
      style: {
        fontFamily: "var(--font-display)",
        fontSize: "var(--text-4xl)",
        fontWeight: 800,
        lineHeight: 1.1,
        letterSpacing: "-0.02em"
      }
    }, "Your next role is waiting."), /*#__PURE__*/React.createElement("p", {
      style: {
        color: "var(--stone-300)",
        fontSize: "var(--text-lg)",
        marginTop: 16,
        lineHeight: 1.6
      }
    }, "Join 40,000+ people building their careers with verified employers across Cambodia."), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        gap: 28,
        marginTop: 36
      }
    }, [["12,480", "Open jobs"], ["486", "Companies"], ["40k+", "Candidates"]].map(([n, l]) => /*#__PURE__*/React.createElement("div", {
      key: l
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontFamily: "var(--font-display)",
        fontSize: "var(--text-2xl)",
        fontWeight: 700
      }
    }, n), /*#__PURE__*/React.createElement("div", {
      style: {
        color: "var(--stone-400)",
        fontSize: "var(--text-sm)",
        marginTop: 2
      }
    }, l)))))));
  }
  function Login({
    onNav
  }) {
    return /*#__PURE__*/React.createElement(Shell, {
      onNav: onNav
    }, /*#__PURE__*/React.createElement("h1", {
      style: {
        fontSize: "var(--text-3xl)",
        fontWeight: 700,
        color: "var(--text-strong)"
      }
    }, "Welcome back"), /*#__PURE__*/React.createElement("p", {
      style: {
        color: "var(--text-muted)",
        marginTop: 8,
        marginBottom: 28
      }
    }, "Sign in to track applications and saved jobs."), /*#__PURE__*/React.createElement(SocialButtons, null), /*#__PURE__*/React.createElement(Divider, null), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        flexDirection: "column",
        gap: 16
      }
    }, /*#__PURE__*/React.createElement(Input, {
      label: "Email",
      type: "email",
      placeholder: "you@example.com"
    }), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(Input, {
      label: "Password",
      type: "password",
      placeholder: "\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022"
    }), /*#__PURE__*/React.createElement("div", {
      style: {
        textAlign: "right",
        marginTop: 8
      }
    }, /*#__PURE__*/React.createElement("a", {
      href: "#",
      onClick: e => {
        e.preventDefault();
        onNav("forgot");
      },
      style: {
        fontSize: "var(--text-sm)",
        fontWeight: 600
      }
    }, "Forgot password?"))), /*#__PURE__*/React.createElement(Button, {
      variant: "primary",
      block: true,
      size: "lg"
    }, "Sign in")), /*#__PURE__*/React.createElement("p", {
      style: {
        textAlign: "center",
        marginTop: 24,
        fontSize: "var(--text-sm)",
        color: "var(--text-muted)"
      }
    }, "Don't have an account?", " ", /*#__PURE__*/React.createElement("a", {
      href: "#",
      onClick: e => {
        e.preventDefault();
        onNav("register");
      },
      style: {
        fontWeight: 700
      }
    }, "Create one")));
  }
  function Register({
    onNav
  }) {
    const [role, setRole] = React.useState("candidate");
    const seg = (id, label) => /*#__PURE__*/React.createElement("button", {
      key: id,
      onClick: () => setRole(id),
      style: {
        flex: 1,
        height: 38,
        border: "none",
        cursor: "pointer",
        borderRadius: "var(--radius-sm)",
        fontFamily: "var(--font-sans)",
        fontSize: "var(--text-sm)",
        fontWeight: 700,
        background: role === id ? "var(--surface-card)" : "transparent",
        color: role === id ? "var(--text-brand)" : "var(--text-muted)",
        boxShadow: role === id ? "var(--shadow-xs)" : "none"
      }
    }, label);
    return /*#__PURE__*/React.createElement(Shell, {
      onNav: onNav
    }, /*#__PURE__*/React.createElement("h1", {
      style: {
        fontSize: "var(--text-3xl)",
        fontWeight: 700,
        color: "var(--text-strong)"
      }
    }, "Create your account"), /*#__PURE__*/React.createElement("p", {
      style: {
        color: "var(--text-muted)",
        marginTop: 8,
        marginBottom: 20
      }
    }, "It's free. Apply to jobs in two clicks."), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        gap: 4,
        padding: 4,
        background: "var(--surface-sunken)",
        borderRadius: "var(--radius-md)",
        marginBottom: 22
      }
    }, seg("candidate", "I'm a candidate"), seg("employer", "I'm an employer")), /*#__PURE__*/React.createElement(SocialButtons, null), /*#__PURE__*/React.createElement(Divider, null), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        flexDirection: "column",
        gap: 16
      }
    }, /*#__PURE__*/React.createElement(Input, {
      label: role === "employer" ? "Contact name" : "Full name",
      placeholder: "Sok Dara"
    }), /*#__PURE__*/React.createElement(Input, {
      label: "Email",
      type: "email",
      placeholder: "you@example.com"
    }), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: 12
      }
    }, /*#__PURE__*/React.createElement(Input, {
      label: "Phone",
      placeholder: "+855 12 345 678"
    }), /*#__PURE__*/React.createElement(Input, {
      label: "Password",
      type: "password",
      placeholder: "\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022"
    })), /*#__PURE__*/React.createElement(Checkbox, {
      label: /*#__PURE__*/React.createElement("span", {
        style: {
          fontSize: "var(--text-sm)"
        }
      }, "I agree to the Terms and Privacy Policy"),
      checked: true,
      onChange: () => {}
    }), /*#__PURE__*/React.createElement(Button, {
      variant: "primary",
      block: true,
      size: "lg"
    }, "Create account")), /*#__PURE__*/React.createElement("p", {
      style: {
        textAlign: "center",
        marginTop: 22,
        fontSize: "var(--text-sm)",
        color: "var(--text-muted)"
      }
    }, "Already have an account?", " ", /*#__PURE__*/React.createElement("a", {
      href: "#",
      onClick: e => {
        e.preventDefault();
        onNav("login");
      },
      style: {
        fontWeight: 700
      }
    }, "Sign in")));
  }
  function ForgotPassword({
    onNav
  }) {
    // step: "request" -> "sent" -> "reset" -> "done"
    const [step, setStep] = React.useState("request");
    const [email, setEmail] = React.useState("dara.sok@email.com");
    React.useEffect(() => {
      if (window.lucide) window.lucide.createIcons();
    });
    const I = (n, s = 18) => /*#__PURE__*/React.createElement("i", {
      "data-lucide": n,
      style: {
        width: s,
        height: s
      }
    });
    const backToLogin = /*#__PURE__*/React.createElement("p", {
      style: {
        textAlign: "center",
        marginTop: 24,
        fontSize: "var(--text-sm)",
        color: "var(--text-muted)"
      }
    }, /*#__PURE__*/React.createElement("a", {
      href: "#",
      onClick: e => {
        e.preventDefault();
        onNav("login");
      },
      style: {
        fontWeight: 700,
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        whiteSpace: "nowrap"
      }
    }, I("arrow-left", 14), " Back to sign in"));
    let body;
    if (step === "request") {
      body = /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("h1", {
        style: {
          fontSize: "var(--text-3xl)",
          fontWeight: 700,
          color: "var(--text-strong)"
        }
      }, "Forgot your password?"), /*#__PURE__*/React.createElement("p", {
        style: {
          color: "var(--text-muted)",
          marginTop: 8,
          marginBottom: 28
        }
      }, "Enter your email and we'll send a reset link."), /*#__PURE__*/React.createElement("div", {
        style: {
          display: "flex",
          flexDirection: "column",
          gap: 16
        }
      }, /*#__PURE__*/React.createElement(Input, {
        label: "Email",
        type: "email",
        value: email,
        onChange: e => setEmail(e.target.value),
        iconLeft: I("mail", 16)
      }), /*#__PURE__*/React.createElement(Button, {
        variant: "primary",
        block: true,
        size: "lg",
        onClick: () => setStep("sent")
      }, "Send reset link")), backToLogin);
    } else if (step === "sent") {
      body = /*#__PURE__*/React.createElement("div", {
        style: {
          textAlign: "center"
        }
      }, /*#__PURE__*/React.createElement("span", {
        style: {
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          width: 60,
          height: 60,
          borderRadius: "50%",
          background: "var(--brand-subtle)",
          color: "var(--brand)"
        }
      }, I("mail-check", 28)), /*#__PURE__*/React.createElement("h1", {
        style: {
          fontSize: "var(--text-2xl)",
          fontWeight: 700,
          color: "var(--text-strong)",
          marginTop: 18
        }
      }, "Check your email"), /*#__PURE__*/React.createElement("p", {
        style: {
          color: "var(--text-muted)",
          marginTop: 8,
          lineHeight: 1.55
        }
      }, "We sent a reset link to", /*#__PURE__*/React.createElement("br", null), /*#__PURE__*/React.createElement("strong", {
        style: {
          color: "var(--text-body)"
        }
      }, email), ". It expires in 30 minutes."), /*#__PURE__*/React.createElement(Button, {
        variant: "primary",
        block: true,
        size: "lg",
        style: {
          marginTop: 24
        },
        onClick: () => setStep("reset")
      }, "Open reset link"), /*#__PURE__*/React.createElement("p", {
        style: {
          marginTop: 16,
          fontSize: "var(--text-sm)",
          color: "var(--text-muted)"
        }
      }, "Didn't get it? ", /*#__PURE__*/React.createElement("a", {
        href: "#",
        onClick: e => {
          e.preventDefault();
          setStep("request");
        },
        style: {
          fontWeight: 700
        }
      }, "Resend")), backToLogin);
    } else if (step === "reset") {
      body = /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("h1", {
        style: {
          fontSize: "var(--text-3xl)",
          fontWeight: 700,
          color: "var(--text-strong)"
        }
      }, "Set a new password"), /*#__PURE__*/React.createElement("p", {
        style: {
          color: "var(--text-muted)",
          marginTop: 8,
          marginBottom: 28
        }
      }, "Choose a strong password you haven't used before."), /*#__PURE__*/React.createElement("div", {
        style: {
          display: "flex",
          flexDirection: "column",
          gap: 16
        }
      }, /*#__PURE__*/React.createElement(Input, {
        label: "New password",
        type: "password",
        placeholder: "\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022",
        hint: "At least 8 characters with a number."
      }), /*#__PURE__*/React.createElement(Input, {
        label: "Confirm password",
        type: "password",
        placeholder: "\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022"
      }), /*#__PURE__*/React.createElement(Button, {
        variant: "primary",
        block: true,
        size: "lg",
        onClick: () => setStep("done")
      }, "Reset password")));
    } else {
      body = /*#__PURE__*/React.createElement("div", {
        style: {
          textAlign: "center"
        }
      }, /*#__PURE__*/React.createElement("span", {
        style: {
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          width: 60,
          height: 60,
          borderRadius: "50%",
          background: "var(--success-subtle)",
          color: "var(--success)"
        }
      }, I("check", 28)), /*#__PURE__*/React.createElement("h1", {
        style: {
          fontSize: "var(--text-2xl)",
          fontWeight: 700,
          color: "var(--text-strong)",
          marginTop: 18
        }
      }, "Password reset"), /*#__PURE__*/React.createElement("p", {
        style: {
          color: "var(--text-muted)",
          marginTop: 8,
          lineHeight: 1.55
        }
      }, "Your password has been updated. You can now sign in with your new password."), /*#__PURE__*/React.createElement(Button, {
        variant: "primary",
        block: true,
        size: "lg",
        style: {
          marginTop: 24
        },
        onClick: () => onNav("login")
      }, "Back to sign in"));
    }
    return /*#__PURE__*/React.createElement(Shell, {
      onNav: onNav
    }, body);
  }
  window.KramaLogin = Login;
  window.KramaRegister = Register;
  window.KramaForgotPassword = ForgotPassword;
})();
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/public-website/auth.jsx", error: String((e && e.message) || e) }); }

// ui_kits/public-website/chat.jsx
try { (() => {
// Krama — floating chat agent (bottom-left). Pluggable external API.
//
// INTEGRATION: set window.KRAMA_CHAT_API before this script loads, e.g.
//   window.KRAMA_CHAT_API = {
//     // return a string (or a Promise of a string)
//     async send(message, history) {
//       const res = await fetch("https://your-api.example.com/chat", {
//         method: "POST",
//         headers: { "Content-Type": "application/json", "Authorization": "Bearer <KEY>" },
//         body: JSON.stringify({ message, history })
//       });
//       const data = await res.json();
//       return data.reply;
//     }
//   };
// With no API configured, a local canned-response stub is used so the UI is demoable.
(function init() {
  if (!window.KramaDesignSystem_1a6f65) {
    return setTimeout(init, 40);
  }
  const I = (n, s = 18) => /*#__PURE__*/React.createElement("i", {
    "data-lucide": n,
    style: {
      width: s,
      height: s
    }
  });

  // Admin-configured chat settings (Admin Console → Chat agent), persisted to localStorage.
  const CHAT_DEFAULTS = {
    enabled: true,
    botName: "Krama Assistant",
    welcome: "Hi! I'm Krama's assistant \uD83D\uDC4B Ask me about jobs, applications, or your account.",
    endpoint: "",
    apiKey: "",
    model: "",
    launcher: "Chat with us"
  };
  function loadChat() {
    try {
      return Object.assign({}, CHAT_DEFAULTS, JSON.parse(localStorage.getItem("krama_chat_settings") || "{}"));
    } catch (e) {
      return Object.assign({}, CHAT_DEFAULTS);
    }
  }

  // --- fallback stub when no external API is wired ---
  const STUB = {
    send(msg) {
      const m = (msg || "").toLowerCase();
      let reply = "Thanks! A Krama specialist will follow up. Meanwhile, try Find jobs to search openings.";
      if (/salary|pay|wage/.test(m)) reply = "Most roles list a monthly range. Use the Minimum salary filter on Find jobs to narrow by pay.";else if (/apply|application/.test(m)) reply = "Open any job and hit Apply now — you can attach your Krama résumé in two clicks.";else if (/remote/.test(m)) reply = "Toggle Remote under Work mode on the Find jobs page to see remote-friendly roles.";else if (/account|register|sign ?up|login/.test(m)) reply = "You can register as a candidate or employer — Google and Facebook sign-in are supported.";else if (/hi|hello|hey/.test(m)) reply = "Hi! I'm Krama's assistant. Ask me about jobs, applications, or your account.";
      return new Promise(res => setTimeout(() => res(reply), 650));
    }
  };

  // --- send via admin-configured endpoint, else window.KRAMA_CHAT_API, else stub ---
  async function sendMessage(cfg, msg, history) {
    if (cfg.endpoint) {
      const headers = {
        "Content-Type": "application/json"
      };
      if (cfg.apiKey) headers["Authorization"] = "Bearer " + cfg.apiKey;
      const res = await fetch(cfg.endpoint, {
        method: "POST",
        headers,
        body: JSON.stringify({
          message: msg,
          history: history,
          model: cfg.model || undefined
        })
      });
      if (!res.ok) throw new Error("HTTP " + res.status);
      const data = await res.json();
      return data.reply || data.message || data.content || data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content || "…";
    }
    if (window.KRAMA_CHAT_API && window.KRAMA_CHAT_API.send) return window.KRAMA_CHAT_API.send(msg, history);
    return STUB.send(msg, history);
  }
  function ChatAgent({
    onNav
  }) {
    const cfg = loadChat();
    if (!cfg.enabled) return null;
    const [open, setOpen] = React.useState(false);
    const [input, setInput] = React.useState("");
    const [busy, setBusy] = React.useState(false);
    const [msgs, setMsgs] = React.useState([{
      from: "bot",
      text: cfg.welcome
    }]);
    const scrollRef = React.useRef(null);
    React.useEffect(() => {
      if (window.lucide) window.lucide.createIcons();
    });
    React.useEffect(() => {
      if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }, [msgs, open, busy]);
    const send = async () => {
      const text = input.trim();
      if (!text || busy) return;
      const history = msgs.map(m => ({
        role: m.from === "bot" ? "assistant" : "user",
        content: m.text
      }));
      setMsgs(s => [...s, {
        from: "me",
        text
      }]);
      setInput("");
      setBusy(true);
      try {
        const reply = await sendMessage(cfg, text, history);
        setMsgs(s => [...s, {
          from: "bot",
          text: String(reply || "…")
        }]);
      } catch (e) {
        setMsgs(s => [...s, {
          from: "bot",
          text: "Sorry — I couldn't reach the assistant. Please try again."
        }]);
      } finally {
        setBusy(false);
      }
    };
    const onKey = e => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        send();
      }
    };
    const quick = ["How do I apply?", "Show remote jobs", "Salary info"];
    return /*#__PURE__*/React.createElement("div", {
      style: {
        position: "fixed",
        left: 24,
        bottom: 24,
        zIndex: 300,
        fontFamily: "var(--font-sans)"
      }
    }, open ? /*#__PURE__*/React.createElement("div", {
      style: {
        width: 360,
        maxWidth: "calc(100vw - 48px)",
        height: 520,
        maxHeight: "calc(100vh - 120px)",
        background: "var(--surface-card)",
        borderRadius: "var(--radius-xl)",
        boxShadow: "var(--shadow-xl)",
        border: "1px solid var(--border)",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        animation: "krmChatIn var(--dur-base) var(--ease-out)"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        position: "relative",
        overflow: "hidden",
        background: "var(--teal-800)",
        color: "#fff",
        padding: "16px 18px",
        display: "flex",
        alignItems: "center",
        gap: 12
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        position: "absolute",
        inset: 0,
        background: "url('../../assets/krama-pattern.svg')",
        backgroundSize: 52,
        opacity: 0.1
      }
    }), /*#__PURE__*/React.createElement("div", {
      style: {
        position: "relative",
        display: "flex",
        alignItems: "center",
        gap: 12,
        flex: 1
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        width: 38,
        height: 38,
        borderRadius: "50%",
        background: "rgba(255,255,255,0.16)"
      }
    }, I("bot", 20)), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      style: {
        fontWeight: 700,
        fontFamily: "var(--font-display)",
        fontSize: "var(--text-md)"
      }
    }, cfg.botName), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: "var(--text-xs)",
        color: "var(--teal-100)",
        display: "flex",
        alignItems: "center",
        gap: 5
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        width: 7,
        height: 7,
        borderRadius: "50%",
        background: "#46d39a"
      }
    }), "Online"))), /*#__PURE__*/React.createElement("button", {
      onClick: () => setOpen(false),
      "aria-label": "Close chat",
      style: {
        position: "relative",
        border: "none",
        background: "transparent",
        color: "#fff",
        cursor: "pointer",
        opacity: 0.85,
        display: "inline-flex",
        padding: 4
      }
    }, I("x", 18))), /*#__PURE__*/React.createElement("div", {
      ref: scrollRef,
      style: {
        flex: 1,
        overflowY: "auto",
        padding: 16,
        display: "flex",
        flexDirection: "column",
        gap: 10,
        background: "var(--surface-page)"
      }
    }, msgs.map((m, i) => /*#__PURE__*/React.createElement("div", {
      key: i,
      style: {
        alignSelf: m.from === "me" ? "flex-end" : "flex-start",
        maxWidth: "82%",
        padding: "10px 13px",
        borderRadius: m.from === "me" ? "14px 14px 4px 14px" : "14px 14px 14px 4px",
        background: m.from === "me" ? "var(--brand)" : "var(--surface-card)",
        color: m.from === "me" ? "#fff" : "var(--text-body)",
        border: m.from === "me" ? "none" : "1px solid var(--border)",
        fontSize: "var(--text-sm)",
        lineHeight: 1.5,
        boxShadow: "var(--shadow-xs)"
      }
    }, m.text)), busy ? /*#__PURE__*/React.createElement("div", {
      style: {
        alignSelf: "flex-start",
        padding: "10px 14px",
        borderRadius: "14px 14px 14px 4px",
        background: "var(--surface-card)",
        border: "1px solid var(--border)",
        display: "flex",
        gap: 4
      }
    }, [0, 1, 2].map(d => /*#__PURE__*/React.createElement("span", {
      key: d,
      style: {
        width: 6,
        height: 6,
        borderRadius: "50%",
        background: "var(--text-faint)",
        animation: "krmDot 1s " + d * 0.15 + "s infinite"
      }
    }))) : null), msgs.length <= 2 ? /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        gap: 6,
        padding: "0 16px 10px",
        flexWrap: "wrap"
      }
    }, quick.map(q => /*#__PURE__*/React.createElement("button", {
      key: q,
      onClick: () => {
        setInput(q);
        setTimeout(send, 0);
      },
      style: {
        border: "1px solid var(--brand-border)",
        background: "var(--brand-subtle)",
        color: "var(--text-brand)",
        fontSize: "var(--text-xs)",
        fontWeight: 600,
        padding: "6px 11px",
        borderRadius: "var(--radius-pill)",
        cursor: "pointer"
      }
    }, q))) : null, /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        alignItems: "center",
        gap: 8,
        padding: "12px 14px",
        borderTop: "1px solid var(--border)",
        background: "var(--surface-card)"
      }
    }, /*#__PURE__*/React.createElement("input", {
      value: input,
      onChange: e => setInput(e.target.value),
      onKeyDown: onKey,
      placeholder: "Type a message\u2026",
      style: {
        flex: 1,
        border: "1px solid var(--border-strong)",
        borderRadius: "var(--radius-pill)",
        padding: "10px 14px",
        fontFamily: "var(--font-sans)",
        fontSize: "var(--text-sm)",
        outline: "none",
        color: "var(--text-strong)"
      }
    }), /*#__PURE__*/React.createElement("button", {
      onClick: send,
      disabled: !input.trim() || busy,
      "aria-label": "Send",
      style: {
        flexShrink: 0,
        width: 40,
        height: 40,
        borderRadius: "50%",
        border: "none",
        background: input.trim() && !busy ? "var(--brand)" : "var(--stone-300)",
        color: "#fff",
        cursor: input.trim() && !busy ? "pointer" : "default",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center"
      }
    }, I("send", 17)))) : /*#__PURE__*/React.createElement("button", {
      onClick: () => setOpen(true),
      "aria-label": "Open chat",
      style: {
        display: "inline-flex",
        alignItems: "center",
        gap: 10,
        height: 56,
        padding: "0 22px 0 18px",
        borderRadius: "var(--radius-pill)",
        border: "none",
        background: "var(--brand)",
        color: "#fff",
        cursor: "pointer",
        boxShadow: "var(--shadow-lg)",
        fontFamily: "var(--font-sans)",
        fontWeight: 700,
        fontSize: "var(--text-base)",
        animation: "krmChatIn var(--dur-base) var(--ease-out)"
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        display: "inline-flex"
      }
    }, I("message-circle", 22)), cfg.launcher), /*#__PURE__*/React.createElement("style", null, `
          @keyframes krmChatIn { from { opacity: 0; transform: translateY(12px) scale(0.96); } to { opacity: 1; transform: none; } }
          @keyframes krmDot { 0%,60%,100% { opacity: 0.25; transform: translateY(0); } 30% { opacity: 1; transform: translateY(-3px); } }
        `));
  }
  window.KramaChatAgent = ChatAgent;
})();
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/public-website/chat.jsx", error: String((e && e.message) || e) }); }

// ui_kits/public-website/chrome.jsx
try { (() => {
// Krama public website — shared chrome (header + footer). Assigns to window.
(function init() {
  if (!window.KramaDesignSystem_1a6f65) {
    return setTimeout(init, 40);
  }
  const {
    Button,
    Badge
  } = window.KramaDesignSystem_1a6f65;
  function Header({
    page,
    onNav
  }) {
    const links = [{
      id: "home",
      label: "Home"
    }, {
      id: "jobs",
      label: "Find jobs"
    }, {
      id: "companies",
      label: "Companies"
    }];
    return /*#__PURE__*/React.createElement("header", {
      style: {
        position: "sticky",
        top: 0,
        zIndex: 50,
        height: 64,
        background: "rgba(255,255,255,0.85)",
        backdropFilter: "blur(8px)",
        borderBottom: "1px solid var(--border)",
        display: "flex",
        alignItems: "center",
        padding: "0 32px",
        gap: 32
      }
    }, /*#__PURE__*/React.createElement("img", {
      src: "../../assets/krama-logo.svg",
      height: "30",
      alt: "Krama",
      style: {
        cursor: "pointer"
      },
      onClick: () => onNav("home")
    }), /*#__PURE__*/React.createElement("nav", {
      style: {
        display: "flex",
        gap: 6
      }
    }, links.map(l => /*#__PURE__*/React.createElement("button", {
      key: l.id,
      onClick: () => onNav(l.id),
      style: {
        border: "none",
        background: "transparent",
        cursor: "pointer",
        fontFamily: "var(--font-sans)",
        fontSize: "var(--text-base)",
        fontWeight: page === l.id ? 700 : 500,
        color: page === l.id ? "var(--text-brand)" : "var(--text-body)",
        padding: "8px 12px",
        borderRadius: "var(--radius-sm)"
      }
    }, l.label))), /*#__PURE__*/React.createElement("div", {
      style: {
        marginLeft: "auto",
        display: "flex",
        alignItems: "center",
        gap: 12,
        flexShrink: 0
      }
    }, /*#__PURE__*/React.createElement("button", {
      onClick: () => onNav("login"),
      style: {
        border: "none",
        background: "transparent",
        cursor: "pointer",
        fontFamily: "var(--font-sans)",
        fontWeight: 600,
        color: "var(--text-body)",
        fontSize: "var(--text-base)",
        whiteSpace: "nowrap"
      }
    }, "Sign in"), /*#__PURE__*/React.createElement(Button, {
      variant: "primary",
      size: "sm",
      style: {
        whiteSpace: "nowrap"
      },
      onClick: () => onNav("register")
    }, "Post a job")));
  }
  function Footer({
    onNav
  }) {
    const go = p => e => {
      e.preventDefault();
      onNav && onNav(p);
    };
    const col = (title, items) => /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      style: {
        fontWeight: 700,
        color: "var(--text-on-dark)",
        fontSize: "var(--text-sm)",
        marginBottom: 12
      }
    }, title), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        flexDirection: "column",
        gap: 9
      }
    }, items.map(([label, target]) => /*#__PURE__*/React.createElement("a", {
      key: label,
      href: "#",
      onClick: go(target),
      style: {
        color: "var(--text-on-dark-mut)",
        fontSize: "var(--text-sm)",
        cursor: "pointer",
        textDecoration: "none"
      }
    }, label))));
    return /*#__PURE__*/React.createElement("footer", {
      style: {
        position: "relative",
        background: "var(--stone-900)",
        padding: "56px 32px 32px",
        overflow: "hidden"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        position: "absolute",
        inset: 0,
        background: "url('../../assets/krama-pattern.svg')",
        backgroundSize: 64,
        opacity: 0.05
      }
    }), /*#__PURE__*/React.createElement("div", {
      style: {
        position: "relative",
        maxWidth: 1200,
        margin: "0 auto",
        display: "grid",
        gridTemplateColumns: "1.4fr 1fr 1fr 1fr",
        gap: 40
      }
    }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("img", {
      src: "../../assets/krama-logo-light.svg",
      height: "30",
      alt: "Krama"
    }), /*#__PURE__*/React.createElement("p", {
      style: {
        color: "var(--text-on-dark-mut)",
        fontSize: "var(--text-sm)",
        marginTop: 16,
        maxWidth: 260,
        lineHeight: 1.6
      }
    }, "Connecting talent and verified employers across Cambodia and Southeast Asia.")), col("For candidates", [["Find jobs", "jobs"], ["Build résumé", "register"], ["Saved jobs", "login"], ["Career advice", "about"]]), col("For employers", [["Post a job", "register"], ["Pricing", "pricing"], ["Search résumés", "register"], ["Companies", "companies"]]), col("Company", [["About us", "about"], ["Contact", "contact"], ["Terms", "terms"], ["Privacy", "privacy"]])), /*#__PURE__*/React.createElement("div", {
      style: {
        position: "relative",
        maxWidth: 1200,
        margin: "32px auto 0",
        paddingTop: 20,
        borderTop: "1px solid rgba(255,255,255,0.1)",
        display: "flex",
        justifyContent: "space-between",
        color: "var(--text-on-dark-mut)",
        fontSize: "var(--text-xs)"
      }
    }, /*#__PURE__*/React.createElement("span", null, "\xA9 2026 Krama. All rights reserved."), /*#__PURE__*/React.createElement("span", null, "\u1781\u17D2\u1798\u17C2\u179A \xB7 English")));
  }
  Object.assign(window, {
    KramaHeader: Header,
    KramaFooter: Footer
  });
})();
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/public-website/chrome.jsx", error: String((e && e.message) || e) }); }

// ui_kits/public-website/data.js
try { (() => {
// Shared sample data for the Krama public website kit.
window.KRAMA_DATA = {
  // multiple stacked banners; shown when active and today is within [start, end]
  banners: [{
    id: "b1",
    active: true,
    title: "Krama Job Fair 2026",
    message: "Meet 80+ verified employers in Phnom Penh this Saturday.",
    cta: "Reserve your spot",
    theme: "saffron",
    icon: "party-popper",
    image: "jobfair",
    align: "left",
    fit: "cover",
    start: "2026-06-10",
    end: "2026-06-21"
  }, {
    id: "b2",
    active: true,
    title: "New: AI job matching",
    message: "Get roles picked for your résumé — now in beta.",
    cta: "Try it",
    theme: "teal",
    icon: "sparkles",
    image: "ai",
    align: "center",
    fit: "cover",
    start: "",
    end: ""
  }],
  jobs: [{
    id: 1,
    title: "Senior Accountant",
    company: "ABA Bank",
    location: "Phnom Penh",
    salary: "$800–1,200/mo",
    type: "Full-time",
    remote: false,
    featured: true,
    postedAt: "2h ago",
    category: "Accounting"
  }, {
    id: 2,
    title: "Frontend Engineer",
    company: "Smart Axiata",
    location: "Remote",
    salary: "$1,500–2,200/mo",
    type: "Full-time",
    remote: true,
    featured: true,
    postedAt: "5h ago",
    category: "IT"
  }, {
    id: 3,
    title: "Marketing Manager",
    company: "Wing Bank",
    location: "Phnom Penh",
    salary: "$1,000–1,600/mo",
    type: "Full-time",
    remote: false,
    featured: false,
    postedAt: "Yesterday",
    category: "Marketing"
  }, {
    id: 4,
    title: "HR Business Partner",
    company: "Manulife",
    location: "Siem Reap",
    salary: "$900–1,400/mo",
    type: "Full-time",
    remote: false,
    featured: false,
    postedAt: "Yesterday",
    category: "HR"
  }, {
    id: 5,
    title: "Civil Engineer",
    company: "Borey Peng Huoth",
    location: "Phnom Penh",
    salary: "$700–1,100/mo",
    type: "Full-time",
    remote: false,
    featured: false,
    postedAt: "2d ago",
    category: "Engineering"
  }, {
    id: 6,
    title: "Data Analyst",
    company: "Smart Axiata",
    location: "Phnom Penh",
    salary: "$1,200–1,800/mo",
    type: "Full-time",
    remote: true,
    featured: false,
    postedAt: "3d ago",
    category: "IT"
  }, {
    id: 7,
    title: "Sales Executive",
    company: "Chip Mong Retail",
    location: "Phnom Penh",
    salary: "$500–900/mo",
    type: "Full-time",
    remote: false,
    featured: false,
    postedAt: "3d ago",
    category: "Marketing"
  }, {
    id: 8,
    title: "UX Designer",
    company: "Cellcard",
    location: "Phnom Penh",
    salary: "$1,300–1,900/mo",
    type: "Full-time",
    remote: true,
    featured: true,
    postedAt: "4d ago",
    category: "IT"
  }, {
    id: 9,
    title: "Branch Manager",
    company: "Acleda Bank",
    location: "Battambang",
    salary: "$1,400–2,000/mo",
    type: "Full-time",
    remote: false,
    featured: false,
    postedAt: "5d ago",
    category: "Finance"
  }, {
    id: 10,
    title: "Registered Nurse",
    company: "Royal Phnom Penh Hospital",
    location: "Phnom Penh",
    salary: "$700–1,100/mo",
    type: "Full-time",
    remote: false,
    featured: false,
    postedAt: "6d ago",
    category: "Healthcare"
  }, {
    id: 11,
    title: "Tax Manager",
    company: "Acleda Bank",
    location: "Phnom Penh",
    salary: "$1,400–1,900/mo",
    type: "Full-time",
    remote: false,
    featured: true,
    postedAt: "1d ago",
    category: "Accounting"
  }, {
    id: 12,
    title: "Backend Engineer",
    company: "Smart Axiata",
    location: "Phnom Penh",
    salary: "$1,600–2,400/mo",
    type: "Full-time",
    remote: true,
    featured: false,
    postedAt: "2d ago",
    category: "IT"
  }, {
    id: 13,
    title: "Customer Success Lead",
    company: "Cellcard",
    location: "Phnom Penh",
    salary: "$900–1,300/mo",
    type: "Full-time",
    remote: false,
    featured: false,
    postedAt: "2d ago",
    category: "Marketing"
  }, {
    id: 14,
    title: "Procurement Officer",
    company: "Chip Mong",
    location: "Phnom Penh",
    salary: "$700–1,000/mo",
    type: "Full-time",
    remote: false,
    featured: false,
    postedAt: "4d ago",
    category: "Engineering"
  }, {
    id: 15,
    title: "Mobile Developer",
    company: "Wing Bank",
    location: "Remote",
    salary: "$1,500–2,200/mo",
    type: "Full-time",
    remote: true,
    featured: false,
    postedAt: "5d ago",
    category: "IT"
  }, {
    id: 16,
    title: "Recruitment Specialist",
    company: "Manulife",
    location: "Siem Reap",
    salary: "$800–1,200/mo",
    type: "Full-time",
    remote: false,
    featured: false,
    postedAt: "1w ago",
    category: "HR"
  }],
  companies: [{
    name: "ABA Bank",
    industry: "Financial services",
    location: "Phnom Penh",
    openJobs: 12,
    verified: true
  }, {
    name: "Smart Axiata",
    industry: "Telecommunications",
    location: "Phnom Penh",
    openJobs: 8,
    verified: true
  }, {
    name: "Wing Bank",
    industry: "Financial services",
    location: "Phnom Penh",
    openJobs: 6,
    verified: true
  }, {
    name: "Manulife",
    industry: "Insurance",
    location: "Siem Reap",
    openJobs: 3,
    verified: true
  }, {
    name: "Acleda Bank",
    industry: "Financial services",
    location: "Battambang",
    openJobs: 9,
    verified: true
  }, {
    name: "Cellcard",
    industry: "Telecommunications",
    location: "Phnom Penh",
    openJobs: 4,
    verified: true
  }, {
    name: "Prince Bank",
    industry: "Financial services",
    location: "Phnom Penh",
    openJobs: 7,
    verified: true
  }, {
    name: "Chip Mong",
    industry: "Retail",
    location: "Phnom Penh",
    openJobs: 5,
    verified: true
  }, {
    name: "Chip Mong Retail",
    industry: "Retail",
    location: "Phnom Penh",
    openJobs: 11,
    verified: true
  }, {
    name: "Borey Peng Huoth",
    industry: "Construction",
    location: "Phnom Penh",
    openJobs: 6,
    verified: true
  }, {
    name: "Pizza Company",
    industry: "Food & beverage",
    location: "Phnom Penh",
    openJobs: 2,
    verified: true
  }, {
    name: "Royal Phnom Penh Hospital",
    industry: "Healthcare",
    location: "Phnom Penh",
    openJobs: 4,
    verified: true
  }, {
    name: "Sathapana Bank",
    industry: "Financial services",
    location: "Phnom Penh",
    openJobs: 8,
    verified: true
  }, {
    name: "Coca-Cola Cambodia",
    industry: "Food & beverage",
    location: "Phnom Penh",
    openJobs: 3,
    verified: true
  }],
  categories: [{
    name: "Information Technology",
    icon: "monitor",
    count: 1240
  }, {
    name: "Accounting",
    icon: "calculator",
    count: 860
  }, {
    name: "Finance",
    icon: "landmark",
    count: 540
  }, {
    name: "Marketing",
    icon: "megaphone",
    count: 720
  }, {
    name: "Human Resources",
    icon: "users",
    count: 410
  }, {
    name: "Engineering",
    icon: "hard-hat",
    count: 630
  }, {
    name: "Sales",
    icon: "trending-up",
    count: 980
  }, {
    name: "Healthcare",
    icon: "stethoscope",
    count: 350
  }]
};

// Original monogram logos (not real trademarks) — map company name → SVG path.
window.KRAMA_LOGOS = {
  "ABA Bank": "../../assets/logos/aba-bank.svg",
  "Smart Axiata": "../../assets/logos/smart-axiata.svg",
  "Wing Bank": "../../assets/logos/wing-bank.svg",
  "Manulife": "../../assets/logos/manulife.svg",
  "Borey Peng Huoth": "../../assets/logos/borey-peng-huoth.svg",
  "Chip Mong": "../../assets/logos/chip-mong.svg",
  "Chip Mong Retail": "../../assets/logos/chip-mong-retail.svg",
  "Cellcard": "../../assets/logos/cellcard.svg",
  "Acleda Bank": "../../assets/logos/acleda-bank.svg",
  "Royal Phnom Penh Hospital": "../../assets/logos/royal-phnom-penh-hospital.svg",
  "Prince Bank": "../../assets/logos/prince-bank.svg",
  "Pizza Company": "../../assets/logos/pizza-company.svg"
};
// Attach logo to every job + company by name.
(function () {
  var L = window.KRAMA_LOGOS,
    D = window.KRAMA_DATA;
  (D.jobs || []).forEach(function (j) {
    if (L[j.company]) j.logo = L[j.company];
  });
  (D.companies || []).forEach(function (c) {
    if (L[c.name]) c.logo = L[c.name];
  });
})();
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/public-website/data.js", error: String((e && e.message) || e) }); }

// ui_kits/public-website/home.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
// Home screen — hero search, categories, featured jobs, companies, stats.
(function init() {
  if (!window.KramaDesignSystem_1a6f65) {
    return setTimeout(init, 40);
  }
  const {
    Button,
    JobCard,
    CompanyCard,
    Card,
    Tag,
    Avatar
  } = window.KramaDesignSystem_1a6f65;
  const D = window.KRAMA_DATA;
  const I = (n, s = 20) => /*#__PURE__*/React.createElement("i", {
    "data-lucide": n,
    style: {
      width: s,
      height: s
    }
  });
  const BANNER_THEMES = {
    saffron: {
      bg: "var(--saffron-500)",
      fg: "#fff",
      ctaBg: "#fff",
      ctaFg: "var(--saffron-700)"
    },
    teal: {
      bg: "var(--teal-700)",
      fg: "#fff",
      ctaBg: "#fff",
      ctaFg: "var(--teal-700)"
    },
    dark: {
      bg: "var(--stone-900)",
      fg: "#fff",
      ctaBg: "var(--saffron-500)",
      ctaFg: "#fff"
    }
  };
  const TODAY = "2026-06-17";
  const bannerLive = b => b.active && (!b.start || TODAY >= b.start) && (!b.end || TODAY <= b.end);
  const BANNER_IMG = {
    jobfair: "../../assets/banners/banner-jobfair.png",
    ai: "../../assets/banners/banner-ai.png",
    hiring: "../../assets/banners/banner-hiring.png"
  };
  const bannerImg = id => {
    if (!id) return null;
    if (/^(data:|https?:|\.|\/)/.test(id)) return id;
    return BANNER_IMG[id] || null;
  };
  function PromoBannerStack({
    onNav
  }) {
    const all = D && D.banners || [];
    const [dismissed, setDismissed] = React.useState({});
    const visible = all.filter(b => bannerLive(b) && !dismissed[b.id]);
    if (visible.length === 0) return null;
    return /*#__PURE__*/React.createElement("div", null, visible.map(b => {
      const t = BANNER_THEMES[b.theme] || BANNER_THEMES.saffron;
      const img = bannerImg(b.image);
      const center = b.align === "center";
      return /*#__PURE__*/React.createElement("div", {
        key: b.id,
        style: {
          position: "relative",
          overflow: "hidden",
          background: t.bg,
          color: "#fff"
        }
      }, img ? /*#__PURE__*/React.createElement("div", {
        style: {
          position: "absolute",
          inset: 0,
          backgroundImage: "url('" + img + "')",
          backgroundSize: b.fit === "contain" ? "contain" : "cover",
          backgroundRepeat: "no-repeat",
          backgroundPosition: "center"
        }
      }) : /*#__PURE__*/React.createElement("div", {
        style: {
          position: "absolute",
          inset: 0,
          background: "url('../../assets/krama-pattern.svg')",
          backgroundSize: 60,
          opacity: 0.10
        }
      }), /*#__PURE__*/React.createElement("div", {
        style: {
          position: "relative",
          maxWidth: 1200,
          margin: "0 auto",
          minHeight: 52,
          display: "flex",
          alignItems: "center",
          gap: 14,
          padding: "10px 24px"
        }
      }, /*#__PURE__*/React.createElement("div", {
        style: {
          flex: 1,
          display: "flex",
          alignItems: "center",
          gap: 12,
          minWidth: 0,
          justifyContent: center ? "center" : "flex-start"
        }
      }, /*#__PURE__*/React.createElement("span", {
        style: {
          display: "inline-flex",
          flexShrink: 0
        }
      }, I(b.icon || "megaphone", 18)), /*#__PURE__*/React.createElement("div", {
        style: {
          fontSize: "var(--text-sm)",
          fontWeight: 500,
          lineHeight: 1.3,
          textAlign: center ? "center" : "left"
        }
      }, /*#__PURE__*/React.createElement("strong", {
        style: {
          fontWeight: 700
        }
      }, b.title), b.message ? /*#__PURE__*/React.createElement("span", {
        style: {
          opacity: 0.92
        }
      }, " \u2014 ", b.message) : null)), b.cta ? /*#__PURE__*/React.createElement("span", {
        onClick: () => onNav("jobs"),
        style: {
          flexShrink: 0,
          background: img ? "#fff" : t.ctaBg,
          color: img ? "var(--stone-900)" : t.ctaFg,
          fontSize: "var(--text-sm)",
          fontWeight: 700,
          padding: "7px 14px",
          borderRadius: "var(--radius-pill)",
          cursor: "pointer",
          whiteSpace: "nowrap"
        }
      }, b.cta) : null, /*#__PURE__*/React.createElement("button", {
        onClick: () => setDismissed(s => ({
          ...s,
          [b.id]: true
        })),
        "aria-label": "Dismiss",
        style: {
          flexShrink: 0,
          border: "none",
          background: "transparent",
          color: "#fff",
          cursor: "pointer",
          opacity: 0.8,
          display: "inline-flex",
          padding: 4
        }
      }, I("x", 16))));
    }));
  }
  function Hero({
    onNav
  }) {
    const [kw, setKw] = React.useState("");
    const [loc, setLoc] = React.useState("");
    const search = () => onNav("jobs", {
      keyword: kw,
      location: loc
    });
    const onKey = e => {
      if (e.key === "Enter") search();
    };
    return /*#__PURE__*/React.createElement("section", {
      style: {
        position: "relative",
        background: "var(--teal-800)",
        overflow: "hidden",
        padding: "72px 32px 88px"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        position: "absolute",
        inset: 0,
        background: "url('../../assets/krama-pattern.svg')",
        backgroundSize: 80,
        opacity: 0.08
      }
    }), /*#__PURE__*/React.createElement("div", {
      style: {
        position: "relative",
        maxWidth: 880,
        margin: "0 auto",
        textAlign: "center"
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        display: "inline-block",
        background: "rgba(255,255,255,0.14)",
        color: "#fff",
        fontSize: "var(--text-sm)",
        fontWeight: 600,
        padding: "6px 14px",
        borderRadius: "var(--radius-pill)",
        marginBottom: 22
      }
    }, "12,480 open jobs from verified employers"), /*#__PURE__*/React.createElement("h1", {
      style: {
        color: "#fff",
        fontSize: "var(--text-6xl)",
        fontWeight: 800,
        letterSpacing: "-0.03em",
        lineHeight: 1.05
      }
    }, "Find work that fits your life"), /*#__PURE__*/React.createElement("p", {
      style: {
        color: "var(--text-on-dark-mut)",
        fontSize: "var(--text-lg)",
        marginTop: 18,
        maxWidth: 560,
        marginLeft: "auto",
        marginRight: "auto"
      }
    }, "Search thousands of roles across Cambodia \u2014 from banking to engineering \u2014 and apply in two clicks."), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        gap: 8,
        background: "#fff",
        padding: 8,
        borderRadius: "var(--radius-lg)",
        boxShadow: "var(--shadow-lg)",
        marginTop: 32,
        maxWidth: 720,
        marginLeft: "auto",
        marginRight: "auto"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1,
        display: "flex",
        alignItems: "center",
        gap: 8,
        padding: "0 12px"
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        color: "var(--text-faint)"
      }
    }, I("search", 18)), /*#__PURE__*/React.createElement("input", {
      value: kw,
      onChange: e => setKw(e.target.value),
      onKeyDown: onKey,
      placeholder: "Job title or keyword",
      style: {
        flex: 1,
        border: "none",
        outline: "none",
        fontFamily: "var(--font-sans)",
        fontSize: "var(--text-base)",
        color: "var(--text-strong)"
      }
    })), /*#__PURE__*/React.createElement("div", {
      style: {
        width: 1,
        background: "var(--border)"
      }
    }), /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1,
        display: "flex",
        alignItems: "center",
        gap: 8,
        padding: "0 12px"
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        color: "var(--text-faint)"
      }
    }, I("map-pin", 18)), /*#__PURE__*/React.createElement("input", {
      value: loc,
      onChange: e => setLoc(e.target.value),
      onKeyDown: onKey,
      placeholder: "City or province",
      style: {
        flex: 1,
        border: "none",
        outline: "none",
        fontFamily: "var(--font-sans)",
        fontSize: "var(--text-base)",
        color: "var(--text-strong)"
      }
    })), /*#__PURE__*/React.createElement(Button, {
      variant: "primary",
      size: "lg",
      onClick: search
    }, "Search")), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        gap: 8,
        justifyContent: "center",
        marginTop: 20,
        flexWrap: "wrap"
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        color: "var(--text-on-dark-mut)",
        fontSize: "var(--text-sm)",
        marginRight: 4
      }
    }, "Popular:"), ["Accountant", "Engineer", "Sales", "Designer"].map(t => /*#__PURE__*/React.createElement("span", {
      key: t,
      onClick: () => onNav("jobs", {
        keyword: t
      }),
      style: {
        color: "#fff",
        fontSize: "var(--text-sm)",
        fontWeight: 500,
        padding: "4px 12px",
        border: "1px solid rgba(255,255,255,0.25)",
        borderRadius: "var(--radius-pill)",
        cursor: "pointer"
      }
    }, t)))));
  }
  function Section({
    eyebrow,
    title,
    action,
    children
  }) {
    return /*#__PURE__*/React.createElement("section", {
      style: {
        maxWidth: 1200,
        margin: "0 auto",
        padding: "56px 32px"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "space-between",
        marginBottom: 28
      }
    }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      className: "eyebrow",
      style: {
        marginBottom: 8
      }
    }, eyebrow), /*#__PURE__*/React.createElement("h2", {
      style: {
        fontSize: "var(--text-3xl)",
        fontWeight: 700,
        color: "var(--text-strong)"
      }
    }, title)), action), children);
  }
  function TopEmployers({
    onNav,
    settings
  }) {
    const all = D && D.companies || [];
    if (settings && settings.topVisible === false) return null;
    const list = settings && settings.topCount ? all.slice(0, settings.topCount) : all;
    if (list.length === 0) return null;
    const loop = list.concat(list); // duplicate for seamless scroll
    const dur = Math.max(18, list.length * 3.5); // seconds
    const Tile = (c, i) => /*#__PURE__*/React.createElement("button", {
      key: i,
      onClick: () => onNav("companies"),
      title: c.name,
      style: {
        width: 104,
        height: 76,
        flexShrink: 0,
        border: "1px solid var(--border)",
        borderRadius: "var(--radius-lg)",
        background: "var(--surface-card)",
        boxShadow: "var(--shadow-xs)",
        cursor: "pointer",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 6,
        transition: "box-shadow var(--dur-base) var(--ease-standard), transform var(--dur-base) var(--ease-standard), border-color var(--dur-base)"
      },
      onMouseEnter: e => {
        e.currentTarget.style.boxShadow = "var(--shadow-md)";
        e.currentTarget.style.transform = "translateY(-2px)";
        e.currentTarget.style.borderColor = "var(--border-strong)";
      },
      onMouseLeave: e => {
        e.currentTarget.style.boxShadow = "var(--shadow-xs)";
        e.currentTarget.style.transform = "none";
        e.currentTarget.style.borderColor = "var(--border)";
      }
    }, /*#__PURE__*/React.createElement(Avatar, {
      src: (window.KRAMA_LOGOS || {})[c.name],
      name: c.name,
      square: true,
      size: 36
    }), /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: "var(--text-2xs)",
        fontWeight: 600,
        color: "var(--text-muted)",
        maxWidth: 92,
        whiteSpace: "nowrap",
        overflow: "hidden",
        textOverflow: "ellipsis"
      }
    }, c.name));
    return /*#__PURE__*/React.createElement("section", {
      style: {
        background: "var(--surface-card)",
        borderBottom: "1px solid var(--border)"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        maxWidth: 1200,
        margin: "0 auto",
        padding: "28px 32px"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        textAlign: "center",
        marginBottom: 18
      }
    }, /*#__PURE__*/React.createElement("span", {
      className: "eyebrow"
    }, "Trusted by Cambodia's leading employers"), /*#__PURE__*/React.createElement("h2", {
      style: {
        fontSize: "var(--text-xl)",
        fontWeight: 700,
        color: "var(--text-strong)",
        marginTop: 4
      }
    }, "Top employers")), /*#__PURE__*/React.createElement("div", {
      className: "krm-marquee",
      style: {
        position: "relative",
        overflow: "hidden",
        WebkitMaskImage: "linear-gradient(90deg, transparent, #000 8%, #000 92%, transparent)",
        maskImage: "linear-gradient(90deg, transparent, #000 8%, #000 92%, transparent)"
      }
    }, /*#__PURE__*/React.createElement("div", {
      className: "krm-marquee-track",
      style: {
        display: "flex",
        gap: 14,
        width: "max-content",
        padding: "4px 0",
        animation: "krmMarquee " + dur + "s linear infinite"
      }
    }, loop.map((c, i) => Tile(c, i))))), /*#__PURE__*/React.createElement("style", null, `
          @keyframes krmMarquee { from { transform: translateX(0); } to { transform: translateX(-50%); } }
          .krm-marquee:hover .krm-marquee-track { animation-play-state: paused; }
          @media (prefers-reduced-motion: reduce) { .krm-marquee-track { animation: none !important; } }
        `));
  }
  const HOME_KEY = "krama_home_settings";
  function loadHomeSettings() {
    try {
      return JSON.parse(localStorage.getItem(HOME_KEY) || "{}") || {};
    } catch (e) {
      return {};
    }
  }
  function Home({
    onNav,
    onOpenJob,
    saved,
    toggleSave
  }) {
    // admin-controlled homepage settings (count/visibility of company sections)
    const [hs] = React.useState(loadHomeSettings);
    const [fjPage, setFjPage] = React.useState(0);
    const FJ_PER_PAGE = 8;
    // featured-first ordering across all jobs, then paginate
    const fjAll = D && D.jobs ? D.jobs.filter(j => j.featured).concat(D.jobs.filter(j => !j.featured)) : [];
    const fjPages = Math.max(1, Math.ceil(fjAll.length / FJ_PER_PAGE));
    const fjPageSafe = Math.min(fjPage, fjPages - 1);
    const fjSlice = fjAll.slice(fjPageSafe * FJ_PER_PAGE, fjPageSafe * FJ_PER_PAGE + FJ_PER_PAGE);
    // map home category labels to Find-jobs filter values
    const CAT_FILTER = {
      "Information Technology": "IT",
      "Human Resources": "HR"
    };
    const toFilter = name => CAT_FILTER[name] || name;
    // featured companies: admin selection (fallback to all), respect visibility
    const allCompanies = D && D.companies || [];
    const featuredNames = hs.featured && hs.featured.length ? hs.featured : null;
    const featuredList = featuredNames ? allCompanies.filter(c => featuredNames.includes(c.name)) : allCompanies;
    const showFeatured = hs.featuredVisible !== false;
    return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(PromoBannerStack, {
      onNav: onNav
    }), /*#__PURE__*/React.createElement(Hero, {
      onNav: onNav
    }), /*#__PURE__*/React.createElement(TopEmployers, {
      onNav: onNav,
      settings: hs
    }), /*#__PURE__*/React.createElement(Section, {
      eyebrow: "Browse by field",
      title: "Explore job categories"
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: "grid",
        gridTemplateColumns: "repeat(3,1fr)",
        gap: 16
      }
    }, D.categories.map(c => /*#__PURE__*/React.createElement(Card, {
      key: c.name,
      interactive: true,
      onClick: () => onNav("jobs", {
        category: toFilter(c.name)
      }),
      padding: 18
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        alignItems: "center",
        gap: 14
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        width: 46,
        height: 46,
        borderRadius: "var(--radius-md)",
        background: "var(--brand-subtle)",
        color: "var(--brand)"
      }
    }, I(c.icon, 22)), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      style: {
        fontWeight: 700,
        color: "var(--text-strong)",
        fontSize: "var(--text-md)"
      }
    }, c.name), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: "var(--text-sm)",
        color: "var(--text-muted)",
        marginTop: 2
      }
    }, c.count.toLocaleString(), " jobs"))))))), /*#__PURE__*/React.createElement("div", {
      style: {
        background: "var(--surface-card)",
        borderTop: "1px solid var(--border)",
        borderBottom: "1px solid var(--border)"
      }
    }, /*#__PURE__*/React.createElement(Section, {
      eyebrow: "Hand-picked",
      title: "Featured jobs",
      action: /*#__PURE__*/React.createElement(Button, {
        variant: "ghost",
        onClick: () => onNav("jobs"),
        iconRight: I("arrow-right", 16)
      }, "View all jobs")
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: 16
      }
    }, fjSlice.map(j => /*#__PURE__*/React.createElement(JobCard, _extends({
      key: j.id
    }, j, {
      saved: saved.includes(j.id),
      onSave: () => toggleSave(j.id),
      onClick: () => onOpenJob(j)
    })))), fjPages > 1 ? /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        marginTop: 28
      }
    }, /*#__PURE__*/React.createElement("button", {
      onClick: () => setFjPage(Math.max(0, fjPageSafe - 1)),
      disabled: fjPageSafe === 0,
      "aria-label": "Previous",
      style: {
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        width: 40,
        height: 40,
        borderRadius: "var(--radius-md)",
        border: "1px solid var(--border-strong)",
        background: "var(--surface-card)",
        cursor: fjPageSafe === 0 ? "not-allowed" : "pointer",
        color: fjPageSafe === 0 ? "var(--text-faint)" : "var(--text-body)"
      }
    }, I("chevron-left", 18)), Array.from({
      length: fjPages
    }).map((_, i) => /*#__PURE__*/React.createElement("button", {
      key: i,
      onClick: () => setFjPage(i),
      style: {
        minWidth: 40,
        height: 40,
        padding: "0 12px",
        borderRadius: "var(--radius-md)",
        cursor: "pointer",
        border: "1px solid " + (i === fjPageSafe ? "var(--brand)" : "var(--border-strong)"),
        background: i === fjPageSafe ? "var(--brand)" : "var(--surface-card)",
        color: i === fjPageSafe ? "var(--on-brand)" : "var(--text-body)",
        fontFamily: "var(--font-sans)",
        fontSize: "var(--text-sm)",
        fontWeight: 700
      }
    }, i + 1)), /*#__PURE__*/React.createElement("button", {
      onClick: () => setFjPage(Math.min(fjPages - 1, fjPageSafe + 1)),
      disabled: fjPageSafe === fjPages - 1,
      "aria-label": "Next",
      style: {
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        width: 40,
        height: 40,
        borderRadius: "var(--radius-md)",
        border: "1px solid var(--border-strong)",
        background: "var(--surface-card)",
        cursor: fjPageSafe === fjPages - 1 ? "not-allowed" : "pointer",
        color: fjPageSafe === fjPages - 1 ? "var(--text-faint)" : "var(--text-body)"
      }
    }, I("chevron-right", 18))) : null)), showFeatured ? /*#__PURE__*/React.createElement(Section, {
      eyebrow: "Trusted by",
      title: "Featured companies",
      action: /*#__PURE__*/React.createElement(Button, {
        variant: "ghost",
        onClick: () => onNav("companies"),
        iconRight: I("arrow-right", 16)
      }, "All companies")
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: "grid",
        gridTemplateColumns: "repeat(4,1fr)",
        gap: 16
      }
    }, featuredList.map(c => /*#__PURE__*/React.createElement(CompanyCard, _extends({
      key: c.name
    }, c, {
      onClick: () => onNav("jobs", {
        company: c.name
      })
    }))))) : null, /*#__PURE__*/React.createElement("section", {
      style: {
        position: "relative",
        background: "var(--teal-700)",
        overflow: "hidden",
        margin: "0 32px 56px",
        maxWidth: 1136,
        marginLeft: "auto",
        marginRight: "auto",
        borderRadius: "var(--radius-2xl)",
        padding: "48px"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        position: "absolute",
        inset: 0,
        background: "url('../../assets/krama-pattern.svg')",
        backgroundSize: 64,
        opacity: 0.08
      }
    }), /*#__PURE__*/React.createElement("div", {
      style: {
        position: "relative",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 32,
        flexWrap: "wrap"
      }
    }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h2", {
      style: {
        color: "#fff",
        fontSize: "var(--text-3xl)",
        fontWeight: 700
      }
    }, "Hiring? Reach 40,000+ verified candidates."), /*#__PURE__*/React.createElement("p", {
      style: {
        color: "var(--text-on-dark-mut)",
        fontSize: "var(--text-md)",
        marginTop: 10
      }
    }, "Post your first job free. Featured listings available.")), /*#__PURE__*/React.createElement(Button, {
      variant: "accent",
      size: "lg"
    }, "Post a job"))));
  }
  window.KramaHome = Home;
})();
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/public-website/home.jsx", error: String((e && e.message) || e) }); }

// ui_kits/public-website/job-detail.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
// Job detail screen — full posting + sticky apply card + similar jobs.
(function init() {
  if (!window.KramaDesignSystem_1a6f65) {
    return setTimeout(init, 40);
  }
  const {
    Button,
    Badge,
    Avatar,
    Card,
    StatusBadge,
    JobCard
  } = window.KramaDesignSystem_1a6f65;
  const D = window.KRAMA_DATA;
  const I = (n, s = 18) => /*#__PURE__*/React.createElement("i", {
    "data-lucide": n,
    style: {
      width: s,
      height: s
    }
  });
  function Meta({
    icon,
    label,
    value
  }) {
    return /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        alignItems: "center",
        gap: 10
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        width: 38,
        height: 38,
        borderRadius: "var(--radius-md)",
        background: "var(--brand-subtle)",
        color: "var(--brand)"
      }
    }, I(icon, 18)), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: "var(--text-xs)",
        color: "var(--text-muted)"
      }
    }, label), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: "var(--text-sm)",
        fontWeight: 700,
        color: "var(--text-strong)"
      }
    }, value)));
  }
  function Block({
    title,
    children
  }) {
    return /*#__PURE__*/React.createElement("div", {
      style: {
        marginTop: 28
      }
    }, /*#__PURE__*/React.createElement("h3", {
      style: {
        fontSize: "var(--text-xl)",
        fontWeight: 700,
        color: "var(--text-strong)",
        marginBottom: 12
      }
    }, title), children);
  }
  const li = t => /*#__PURE__*/React.createElement("li", {
    style: {
      display: "flex",
      gap: 10,
      marginBottom: 9,
      color: "var(--text-body)",
      fontSize: "var(--text-base)",
      lineHeight: 1.5
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      color: "var(--brand)",
      flexShrink: 0,
      marginTop: 2
    }
  }, I("check", 16)), t);
  function JobDetail({
    job,
    onBack,
    onOpenJob,
    onApply,
    saved,
    toggleSave,
    onNav
  }) {
    const j = job || D.jobs[0];

    // Format expires_at for display
    function fmtExpiry(iso) {
      if (!iso) return null;
      var d = new Date(iso);
      if (isNaN(d)) return null;
      return d.getDate() + " " + ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"][d.getMonth()] + " " + d.getFullYear();
    }

    // Render rich-text HTML or plain text safely
    function RichContent({ html, plain }) {
      if (html && /<[a-z][\s\S]*>/i.test(html)) {
        return /*#__PURE__*/React.createElement("div", {
          className: "krm-rich",
          style: { color: "var(--text-body)", fontSize: "var(--text-base)", lineHeight: 1.7 },
          dangerouslySetInnerHTML: { __html: html }
        });
      }
      var text = html || plain || "";
      return /*#__PURE__*/React.createElement("p", {
        style: { color: "var(--text-body)", fontSize: "var(--text-base)", lineHeight: 1.7, whiteSpace: "pre-wrap" }
      }, text);
    }

    var expiryStr = fmtExpiry(j.expiresAt || (j._raw && j._raw.expires_at));
    var similarJobs = (D.jobs || []).filter(function(x) { return String(x.id) !== String(j.id); }).slice(0, 4);

    return /*#__PURE__*/React.createElement("div", { style: { background: "var(--surface-page)" } },
      /*#__PURE__*/React.createElement("div", { style: { maxWidth: 1200, margin: "0 auto", padding: "24px 32px 56px" } },
        /*#__PURE__*/React.createElement("button", {
          onClick: onBack,
          style: { border: "none", background: "transparent", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 6, color: "var(--text-muted)", fontFamily: "var(--font-sans)", fontWeight: 600, fontSize: "var(--text-sm)", marginBottom: 18 }
        }, I("arrow-left", 16), " Back to jobs"),
        /*#__PURE__*/React.createElement("div", { style: { display: "grid", gridTemplateColumns: "1fr 340px", gap: 28, alignItems: "start" } },

          // \u2500\u2500 MAIN COLUMN \u2500\u2500
          /*#__PURE__*/React.createElement("main", null,
            /*#__PURE__*/React.createElement(Card, { padding: 28 },

              // Header: logo + title + company
              /*#__PURE__*/React.createElement("div", { style: { display: "flex", gap: 18 } },
                /*#__PURE__*/React.createElement(Avatar, { src: j.logo, name: j.company, square: true, size: 64 }),
                /*#__PURE__*/React.createElement("div", { style: { flex: 1 } },
                  /*#__PURE__*/React.createElement("div", { style: { display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" } },
                    /*#__PURE__*/React.createElement("h1", { style: { fontSize: "var(--text-3xl)", fontWeight: 700, color: "var(--text-strong)" } }, j.title),
                    j.featured && /*#__PURE__*/React.createElement(Badge, { tone: "accent" }, "Featured"),
                    j.remote   && /*#__PURE__*/React.createElement(Badge, { tone: "brand"  }, "Remote")
                  ),
                  /*#__PURE__*/React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 8, marginTop: 6, color: "var(--text-muted)", fontSize: "var(--text-md)", flexWrap: "wrap" } },
                    /*#__PURE__*/React.createElement("span", { style: { fontWeight: 600, color: "var(--text-body)" } }, j.company),
                    j.isVerified && /*#__PURE__*/React.createElement("span", { style: { color: "var(--brand)", display: "inline-flex" } }, I("badge-check", 16)),
                    j.location && /*#__PURE__*/React.createElement(React.Fragment, null,
                      /*#__PURE__*/React.createElement("span", null, "\xB7"),
                      /*#__PURE__*/React.createElement("span", null, j.location)
                    )
                  )
                )
              ),

              // Meta bar
              /*#__PURE__*/React.createElement("div", { style: { display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(140px,1fr))", gap: 16, marginTop: 24, paddingTop: 24, borderTop: "1px solid var(--border)" } },
                j.salary          && /*#__PURE__*/React.createElement(Meta, { icon: "banknote", label: "Salary",     value: j.salary }),
                j.type            && /*#__PURE__*/React.createElement(Meta, { icon: "briefcase", label: "Job type",  value: j.type }),
                j.experienceLevel && /*#__PURE__*/React.createElement(Meta, { icon: "signal",    label: "Experience", value: j.experienceLevel }),
                j.location        && /*#__PURE__*/React.createElement(Meta, { icon: "map-pin",   label: "Location",  value: j.location })
              ),

              // Description
              j.description
                ? /*#__PURE__*/React.createElement(Block, { title: "About the role" },
                    /*#__PURE__*/React.createElement(RichContent, { html: j.description })
                  )
                : null,

              // Requirements
              j.requirements
                ? /*#__PURE__*/React.createElement(Block, { title: "Requirements" },
                    /*#__PURE__*/React.createElement(RichContent, { html: j.requirements })
                  )
                : null,

              // Benefits
              j.benefits
                ? /*#__PURE__*/React.createElement(Block, { title: "Benefits" },
                    /*#__PURE__*/React.createElement(RichContent, { html: j.benefits })
                  )
                : null,

              // Empty state
              (!j.description && !j.requirements && !j.benefits)
                ? /*#__PURE__*/React.createElement("div", { style: { marginTop: 24, color: "var(--text-muted)", fontSize: "var(--text-sm)", fontStyle: "italic" } }, "No additional details provided for this role.")
                : null
            ),

            // Similar jobs
            similarJobs.length > 0
              ? /*#__PURE__*/React.createElement("div", { style: { marginTop: 40 } },
                  /*#__PURE__*/React.createElement("h3", { style: { fontSize: "var(--text-2xl)", fontWeight: 700, color: "var(--text-strong)", marginBottom: 18 } }, "Similar jobs"),
                  /*#__PURE__*/React.createElement("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 } },
                    similarJobs.map(function(x) {
                      return /*#__PURE__*/React.createElement(JobCard, _extends({ key: x.id }, x, {
                        saved: saved.includes(x.id),
                        onSave: function() { toggleSave(x.id); },
                        onClick: function() { onOpenJob(x); }
                      }));
                    })
                  )
                )
              : null
          ),

          // \u2500\u2500 SIDEBAR \u2500\u2500
          /*#__PURE__*/React.createElement("aside", { style: { position: "sticky", top: 84, display: "flex", flexDirection: "column", gap: 16 } },

            // Apply card
            /*#__PURE__*/React.createElement(Card, { padding: 20 },
              /*#__PURE__*/React.createElement(Button, { variant: "primary", block: true, size: "lg", onClick: function() { onApply && onApply(j); } }, "Apply now"),
              /*#__PURE__*/React.createElement(Button, {
                variant: "secondary", block: true,
                iconLeft: I(saved.includes(j.id) ? "bookmark-check" : "bookmark", 16),
                style: { marginTop: 10 },
                onClick: function() { toggleSave(j.id); }
              }, saved.includes(j.id) ? "Saved" : "Save job"),
              /*#__PURE__*/React.createElement("div", { style: { marginTop: 16, paddingTop: 16, borderTop: "1px solid var(--border)", display: "flex", justifyContent: "space-between", fontSize: "var(--text-sm)", color: "var(--text-muted)" } },
                j.postedAt  && /*#__PURE__*/React.createElement("span", null, "Posted ", j.postedAt),
                expiryStr   && /*#__PURE__*/React.createElement("span", null, "Closes ", expiryStr)
              )
            ),

            // Company card
            /*#__PURE__*/React.createElement(Card, { padding: 20 },
              /*#__PURE__*/React.createElement("div", { style: { display: "flex", gap: 12, alignItems: "center" } },
                /*#__PURE__*/React.createElement(Avatar, { src: j.logo, name: j.company, square: true, size: 44 }),
                /*#__PURE__*/React.createElement("div", null,
                  /*#__PURE__*/React.createElement("div", { style: { fontWeight: 700, color: "var(--text-strong)", display: "flex", alignItems: "center", gap: 6 } },
                    j.company,
                    j.isVerified && /*#__PURE__*/React.createElement("span", { style: { color: "var(--brand)" } }, I("badge-check", 14))
                  ),
                  j.companyIndustry && /*#__PURE__*/React.createElement("div", { style: { fontSize: "var(--text-sm)", color: "var(--text-muted)" } }, j.companyIndustry)
                )
              ),
              j.companyAddress && /*#__PURE__*/React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 6, marginTop: 10, fontSize: "var(--text-sm)", color: "var(--text-muted)" } },
                I("map-pin", 13), j.companyAddress
              ),
              j.companyWebsite && /*#__PURE__*/React.createElement("a", {
                href: j.companyWebsite, target: "_blank", rel: "noopener noreferrer",
                style: { display: "flex", alignItems: "center", gap: 6, marginTop: 6, fontSize: "var(--text-sm)", color: "var(--brand)", textDecoration: "none" }
              }, I("external-link", 13), j.companyWebsite.replace(/^https?:\/\//, "")),
              onNav && /*#__PURE__*/React.createElement(Button, {
                variant: "ghost", size: "sm",
                style: { marginTop: 12, paddingLeft: 0 },
                iconRight: I("arrow-right", 14),
                onClick: function() { onNav("companies", { companyId: j.companyId }); }
              }, "View company profile")
            )
          )
        )
      )
    );
  }
  window.KramaJobDetail = JobDetail;
})();
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/public-website/job-detail.jsx", error: String((e && e.message) || e) }); }

// ui_kits/public-website/jobs.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
// Jobs search + Companies directory — functional filters.
(function init() {
  if (!window.KramaDesignSystem_1a6f65) {
    return setTimeout(init, 40);
  }
  const {
    JobCard,
    CompanyCard,
    Tag,
    Select,
    Checkbox,
    Button,
    Badge,
    Avatar,
    EmptyState
  } = window.KramaDesignSystem_1a6f65;
  const D = window.KRAMA_DATA;
  const I = (n, s = 18) => /*#__PURE__*/React.createElement("i", {
    "data-lucide": n,
    style: {
      width: s,
      height: s
    }
  });

  // map a job to a coarse category bucket matching the filter options
  const catOf = j => j.category || "";

  // Admin-controlled promos (Find Jobs). Read Admin Console settings.
  const SB_DEFAULT = {
    visible: true,
    theme: "teal",
    icon: "sparkles",
    title: "Boost your search",
    message: "Complete your profile to get AI-matched roles and apply in one click.",
    cta: "Build your profile",
    image: "../../assets/banners/promo-profile.png",
    fit: "cover"
  };
  const CB_DEFAULT = {
    visible: true,
    theme: "saffron",
    icon: "rocket",
    title: "Hiring? Reach top talent",
    message: "Post a job and get in front of 40,000+ candidates.",
    cta: "Post a job",
    image: "../../assets/banners/promo-hiring.png",
    fit: "cover"
  };
  const CO_DEFAULT = {
    visible: true,
    theme: "teal",
    icon: "building-2",
    title: "Get your company verified",
    message: "Verified employers rank higher and earn candidate trust.",
    cta: "List your company",
    image: "../../assets/banners/promo-verified.png",
    fit: "cover"
  };
  const CO2_DEFAULT = {
    visible: true,
    theme: "dark",
    icon: "gift",
    title: "Featured placement",
    message: "Put your company at the top of the directory and get 3× more views.",
    cta: "Go featured",
    image: "../../assets/banners/promo-featured.png",
    fit: "cover"
  };
  const FJ3_DEFAULT = {
    visible: true,
    theme: "saffron",
    icon: "bell",
    title: "Job alerts",
    message: "Get an email the moment a matching role is posted.",
    cta: "Create alert",
    image: "../../assets/banners/promo-talent.png",
    fit: "cover"
  };
  const CO3_DEFAULT = {
    visible: true,
    theme: "saffron",
    icon: "bell",
    title: "Company alerts",
    message: "Follow employers and get notified when they post new roles.",
    cta: "Follow companies",
    image: "../../assets/banners/promo-talent.png",
    fit: "cover"
  };
  const CO4_DEFAULT = {
    visible: true,
    theme: "teal",
    icon: "sparkles",
    title: "Browse by industry",
    message: "Find employers in banking, telecom, retail and more.",
    cta: "Explore industries",
    image: "../../assets/banners/promo-profile.png",
    fit: "cover"
  };
  function loadBanner(key, def) {
    try {
      const s = JSON.parse(localStorage.getItem("krama_home_settings") || "{}");
      const m = Object.assign({}, def, s[key] || {});
      if (!m.image && def.image) m.image = def.image;
      return m;
    } catch (e) {
      return Object.assign({}, def);
    }
  }
  const SB_THEME = {
    teal: {
      bg: "var(--teal-800)",
      ctaBg: "#fff",
      ctaFg: "var(--teal-800)"
    },
    saffron: {
      bg: "var(--saffron-500)",
      ctaBg: "#fff",
      ctaFg: "var(--saffron-700)"
    },
    dark: {
      bg: "var(--stone-900)",
      ctaBg: "var(--accent)",
      ctaFg: "#fff"
    }
  };
  function PromoBox({
    b,
    onNav,
    style
  }) {
    if (!b.visible) return null;
    const t = SB_THEME[b.theme] || SB_THEME.teal;
    const hasImg = !!b.image;
    return /*#__PURE__*/React.createElement("div", {
      style: Object.assign({
        position: "relative",
        overflow: "hidden",
        borderRadius: "var(--radius-lg)",
        background: t.bg,
        color: "#fff",
        padding: 18
      }, style)
    }, hasImg ? /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
      style: {
        position: "absolute",
        inset: 0,
        backgroundImage: "url('" + b.image + "')",
        backgroundSize: b.fit === "contain" ? "contain" : "cover",
        backgroundRepeat: "no-repeat",
        backgroundPosition: "center"
      }
    }), /*#__PURE__*/React.createElement("div", {
      style: {
        position: "absolute",
        inset: 0,
        background: "linear-gradient(180deg, rgba(16,15,12,0.25), rgba(16,15,12,0.72))"
      }
    })) : /*#__PURE__*/React.createElement("div", {
      style: {
        position: "absolute",
        inset: 0,
        background: "url('../../assets/krama-pattern.svg')",
        backgroundSize: 56,
        opacity: 0.1
      }
    }), /*#__PURE__*/React.createElement("div", {
      style: {
        position: "relative"
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        width: 38,
        height: 38,
        borderRadius: "var(--radius-md)",
        background: "rgba(255,255,255,0.16)",
        marginBottom: 12
      }
    }, I(b.icon || "sparkles", 18)), /*#__PURE__*/React.createElement("div", {
      style: {
        fontFamily: "var(--font-display)",
        fontWeight: 700,
        fontSize: "var(--text-md)"
      }
    }, b.title), /*#__PURE__*/React.createElement("p", {
      style: {
        fontSize: "var(--text-sm)",
        color: "rgba(255,255,255,0.88)",
        marginTop: 6,
        lineHeight: 1.45
      }
    }, b.message), b.cta ? /*#__PURE__*/React.createElement("button", {
      onClick: () => onNav && onNav("register"),
      style: {
        marginTop: 14,
        width: "100%",
        height: 38,
        border: "none",
        borderRadius: "var(--radius-md)",
        background: t.ctaBg,
        color: t.ctaFg,
        fontFamily: "var(--font-sans)",
        fontWeight: 700,
        fontSize: "var(--text-sm)",
        cursor: "pointer"
      }
    }, b.cta) : null));
  }
  function SidebarBanner({
    onNav
  }) {
    return /*#__PURE__*/React.createElement(PromoBox, {
      b: loadBanner("sidebarBanner", SB_DEFAULT),
      onNav: onNav,
      style: {
        marginTop: 18
      }
    });
  }
  function CategoryBanner({
    onNav
  }) {
    return /*#__PURE__*/React.createElement(PromoBox, {
      b: loadBanner("categoryBanner", CB_DEFAULT),
      onNav: onNav,
      style: {
        marginTop: 0
      }
    });
  }
  function FilterGroup({
    title,
    children
  }) {
    return /*#__PURE__*/React.createElement("div", {
      style: {
        padding: "18px 0",
        borderBottom: "1px solid var(--border)"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontWeight: 700,
        color: "var(--text-strong)",
        fontSize: "var(--text-sm)",
        marginBottom: 12
      }
    }, title), children);
  }

  // Expanded "Details" row — denser layout with description & actions
  function DetailRow({
    job,
    saved,
    onSave,
    onOpen
  }) {
    const meta = (ic, txt, opts) => /*#__PURE__*/React.createElement("span", {
      style: {
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        fontSize: "var(--text-sm)",
        color: opts && opts.brand ? "var(--text-brand)" : "var(--text-muted)",
        fontWeight: opts && opts.brand ? 600 : 400
      }
    }, I(ic, 15), txt);
    const desc = "We're hiring a " + job.title.toLowerCase() + " to join " + job.company + " in " + job.location + ". " + (job.remote ? "Remote-friendly. " : "") + "Full job description and requirements inside.";
    return /*#__PURE__*/React.createElement("div", {
      onClick: onOpen,
      style: {
        position: "relative",
        background: "var(--surface-card)",
        border: "1px solid " + (job.featured ? "var(--accent-border)" : "var(--border)"),
        borderRadius: "var(--radius-lg)",
        boxShadow: "var(--shadow-sm)",
        padding: 22,
        cursor: "pointer",
        overflow: "hidden"
      }
    }, job.featured ? /*#__PURE__*/React.createElement("span", {
      style: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        height: 3,
        background: "var(--accent)"
      }
    }) : null, /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        gap: 16
      }
    }, /*#__PURE__*/React.createElement(Avatar, {
      src: (window.KRAMA_LOGOS || {})[job.company],
      name: job.company,
      square: true,
      size: 52
    }), /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1,
        minWidth: 0
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "space-between",
        gap: 12
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        minWidth: 0
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        alignItems: "center",
        gap: 8,
        flexWrap: "wrap"
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontFamily: "var(--font-display)",
        fontWeight: 700,
        fontSize: "var(--text-lg)",
        color: "var(--text-strong)"
      }
    }, job.title), job.featured ? /*#__PURE__*/React.createElement(Badge, {
      tone: "accent"
    }, "Featured") : null, job.remote ? /*#__PURE__*/React.createElement(Badge, {
      tone: "brand"
    }, "Remote") : null), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: "var(--text-sm)",
        color: "var(--text-muted)",
        marginTop: 3
      }
    }, job.company)), /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: "var(--text-xs)",
        color: "var(--text-faint)",
        whiteSpace: "nowrap"
      }
    }, job.postedAt)), /*#__PURE__*/React.createElement("p", {
      style: {
        fontSize: "var(--text-sm)",
        color: "var(--text-body)",
        lineHeight: 1.5,
        margin: "10px 0 12px",
        maxWidth: 720
      }
    }, desc), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        alignItems: "center",
        gap: 18,
        flexWrap: "wrap"
      }
    }, meta("map-pin", job.location), meta("briefcase", job.type), meta("banknote", job.salary, {
      brand: true
    }), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        gap: 8,
        marginLeft: "auto"
      }
    }, /*#__PURE__*/React.createElement(Button, {
      variant: "secondary",
      size: "sm",
      iconLeft: I(saved ? "bookmark-check" : "bookmark", 14),
      onClick: e => {
        e.stopPropagation();
        onSave();
      }
    }, saved ? "Saved" : "Save"), /*#__PURE__*/React.createElement(Button, {
      variant: "primary",
      size: "sm",
      onClick: e => {
        e.stopPropagation();
        onOpen();
      }
    }, "View & apply"))))));
  }
  function Jobs({
    onNav,
    onOpenJob,
    saved,
    toggleSave,
    initialCategory,
    initialCompany,
    initialKeyword,
    initialLocation
  }) {
    const [keyword, setKeyword] = React.useState(initialKeyword || "");
    const [location, setLocation] = React.useState(initialLocation || "");
    const [category, setCategory] = React.useState(initialCategory || "All categories");
    const [company, setCompany] = React.useState(initialCompany || "");
    const [workModes, setWorkModes] = React.useState({
      "On-site": false,
      Remote: false,
      Hybrid: false
    });
    const [salaryMin, setSalaryMin] = React.useState(0);
    const [sort, setSort] = React.useState("Newest");
    const [view, setView] = React.useState("grid");
    const [page, setPage] = React.useState(0);
    const PER_PAGE = 12;
    const fjBanner1 = loadBanner("sidebarBanner", SB_DEFAULT);
    const fjBanner2 = loadBanner("categoryBanner", CB_DEFAULT);
    const fjBanner3 = loadBanner("findJobsBanner3", FJ3_DEFAULT);
    React.useEffect(() => {
      if (window.lucide) window.lucide.createIcons();
    });
    const toggleMode = m => setWorkModes(s => ({
      ...s,
      [m]: !s[m]
    }));
    const clearAll = () => {
      setKeyword("");
      setLocation("");
      setCategory("All categories");
      setCompany("");
      setWorkModes({
        "On-site": false,
        Remote: false,
        Hybrid: false
      });
      setSalaryMin(0);
    };

    // parse a salary string like "$800–1,200/mo" to its lower bound for sorting
    const salaryLow = s => {
      const m = (s || "").replace(/,/g, "").match(/\d+/);
      return m ? parseInt(m[0], 10) : 0;
    };
    // upper bound of a range like "$800–1,200/mo"
    const salaryHigh = s => {
      const nums = (s || "").replace(/,/g, "").match(/\d+/g);
      return nums ? parseInt(nums[nums.length - 1], 10) : 0;
    };
    let results = D.jobs.filter(j => {
      if (keyword.trim()) {
        const k = keyword.toLowerCase();
        if (!(j.title + " " + j.company).toLowerCase().includes(k)) return false;
      }
      if (location.trim()) {
        if (!j.location.toLowerCase().includes(location.toLowerCase())) return false;
      }
      if (category !== "All categories" && catOf(j) !== category) return false;
      if (company && j.company !== company) return false;
      if (salaryMin > 0 && salaryHigh(j.salary) < salaryMin) return false;
      const remoteOn = workModes["Remote"];
      const onsiteOn = workModes["On-site"];
      const hybridOn = workModes["Hybrid"];
      const anyMode = remoteOn || onsiteOn || hybridOn;
      if (anyMode) {
        // our data only distinguishes remote vs on-site
        const matchRemote = remoteOn && j.remote;
        const matchOnsite = onsiteOn && !j.remote;
        if (!(matchRemote || matchOnsite)) return false;
      }
      return true;
    });
    if (sort === "Highest salary") results = results.slice().sort((a, b) => salaryLow(b.salary) - salaryLow(a.salary));else if (sort === "Oldest") results = results.slice().reverse();

    // pagination — 12 per page
    const pages = Math.max(1, Math.ceil(results.length / PER_PAGE));
    const pageSafe = Math.min(page, pages - 1);
    const pageResults = results.slice(pageSafe * PER_PAGE, pageSafe * PER_PAGE + PER_PAGE);
    // reset to first page whenever the filtered set changes
    const filterSig = keyword + "|" + location + "|" + category + "|" + company + "|" + JSON.stringify(workModes) + "|" + salaryMin + "|" + sort;
    React.useEffect(() => {
      setPage(0);
    }, [filterSig]);

    // active filter chips
    const chips = [];
    if (keyword.trim()) chips.push(["keyword", '“' + keyword.trim() + '”']);
    if (company) chips.push(["company", company]);
    if (category !== "All categories") chips.push(["category", category]);
    Object.keys(workModes).forEach(m => {
      if (workModes[m]) chips.push(["mode:" + m, m]);
    });
    if (salaryMin > 0) chips.push(["salary", "≥ $" + salaryMin.toLocaleString() + "/mo"]);
    if (location.trim()) chips.push(["location", location]);
    const removeChip = key => {
      if (key === "keyword") setKeyword("");else if (key === "category") setCategory("All categories");else if (key === "company") setCompany("");else if (key === "salary") setSalaryMin(0);else if (key === "location") setLocation("");else if (key.startsWith("mode:")) toggleMode(key.slice(5));
    };
    return /*#__PURE__*/React.createElement("div", {
      style: {
        background: "var(--surface-page)",
        minHeight: "70vh"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        position: "relative",
        background: "var(--teal-800)",
        overflow: "hidden",
        padding: "44px 32px"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        position: "absolute",
        inset: 0,
        background: "url('../../assets/krama-pattern.svg')",
        backgroundSize: 72,
        opacity: 0.08
      }
    }), /*#__PURE__*/React.createElement("div", {
      style: {
        position: "relative",
        maxWidth: 1200,
        margin: "0 auto"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: "var(--text-xs)",
        fontWeight: 800,
        letterSpacing: "0.1em",
        textTransform: "uppercase",
        color: "var(--teal-200)"
      }
    }, "Find jobs"), /*#__PURE__*/React.createElement("h1", {
      style: {
        color: "#fff",
        fontSize: "var(--text-4xl)",
        fontWeight: 800,
        letterSpacing: "-0.02em",
        marginTop: 6
      }
    }, "Find your next opportunity"), /*#__PURE__*/React.createElement("p", {
      style: {
        color: "var(--stone-300)",
        fontSize: "var(--text-lg)",
        marginTop: 8
      }
    }, "Browse thousands of verified roles across Cambodia \u2014 filter by category, location, and work mode."))), /*#__PURE__*/React.createElement("div", {
      style: {
        background: "var(--surface-card)",
        borderBottom: "1px solid var(--border)",
        padding: "20px 0"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        maxWidth: 1200,
        margin: "0 auto",
        display: "flex",
        gap: 10,
        padding: "0 32px"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1,
        display: "flex",
        alignItems: "center",
        gap: 8,
        padding: "0 14px",
        height: 44,
        border: "1px solid var(--border-strong)",
        borderRadius: "var(--radius-md)",
        background: "var(--surface-card)"
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        color: "var(--text-faint)"
      }
    }, I("search")), /*#__PURE__*/React.createElement("input", {
      value: keyword,
      onChange: e => setKeyword(e.target.value),
      placeholder: "Job title or keyword",
      style: {
        flex: 1,
        border: "none",
        outline: "none",
        fontFamily: "var(--font-sans)",
        fontSize: "var(--text-base)",
        background: "transparent"
      }
    })), /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1,
        display: "flex",
        alignItems: "center",
        gap: 8,
        padding: "0 14px",
        height: 44,
        border: "1px solid var(--border-strong)",
        borderRadius: "var(--radius-md)",
        background: "var(--surface-card)"
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        color: "var(--text-faint)"
      }
    }, I("map-pin")), /*#__PURE__*/React.createElement("input", {
      value: location,
      onChange: e => setLocation(e.target.value),
      placeholder: "City or province",
      style: {
        flex: 1,
        border: "none",
        outline: "none",
        fontFamily: "var(--font-sans)",
        fontSize: "var(--text-base)",
        background: "transparent"
      }
    })), /*#__PURE__*/React.createElement(Button, {
      variant: "primary"
    }, "Search"))), /*#__PURE__*/React.createElement("div", {
      style: {
        maxWidth: 1200,
        margin: "0 auto",
        padding: "28px 32px",
        display: "grid",
        gridTemplateColumns: "260px 1fr",
        gap: 28,
        alignItems: "start"
      }
    }, /*#__PURE__*/React.createElement("aside", {
      style: {
        background: "var(--surface-card)",
        border: "1px solid var(--border)",
        borderRadius: "var(--radius-lg)",
        padding: "4px 18px 18px"
      }
    }, /*#__PURE__*/React.createElement(FilterGroup, {
      title: "Category"
    }, /*#__PURE__*/React.createElement(Select, {
      value: category,
      onChange: e => setCategory(e.target.value),
      options: ["All categories", "IT", "Accounting", "Finance", "Marketing", "HR", "Engineering", "Sales", "Healthcare"],
      size: "sm"
    })), /*#__PURE__*/React.createElement(FilterGroup, {
      title: "Minimum salary"
    }, /*#__PURE__*/React.createElement(Select, {
      value: String(salaryMin),
      onChange: e => setSalaryMin(parseInt(e.target.value, 10)),
      options: [{
        value: "0",
        label: "Any salary"
      }, {
        value: "500",
        label: "$500+/mo"
      }, {
        value: "800",
        label: "$800+/mo"
      }, {
        value: "1000",
        label: "$1,000+/mo"
      }, {
        value: "1500",
        label: "$1,500+/mo"
      }, {
        value: "2000",
        label: "$2,000+/mo"
      }],
      size: "sm"
    })), /*#__PURE__*/React.createElement(FilterGroup, {
      title: "Work mode"
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        flexDirection: "column",
        gap: 10
      }
    }, ["On-site", "Remote", "Hybrid"].map(m => /*#__PURE__*/React.createElement(Checkbox, {
      key: m,
      label: m,
      checked: workModes[m],
      onChange: () => toggleMode(m)
    })))), /*#__PURE__*/React.createElement("div", {
      style: {
        paddingTop: 18
      }
    }, /*#__PURE__*/React.createElement(Button, {
      variant: "secondary",
      block: true,
      size: "sm",
      onClick: clearAll
    }, "Clear filters")), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        flexDirection: "column",
        gap: 16,
        marginTop: 18
      }
    }, fjBanner1.visible ? /*#__PURE__*/React.createElement(PromoBox, {
      b: fjBanner1,
      onNav: onNav,
      style: {
        marginTop: 0
      }
    }) : null, fjBanner2.visible ? /*#__PURE__*/React.createElement(PromoBox, {
      b: fjBanner2,
      onNav: onNav,
      style: {
        marginTop: 0
      }
    }) : null, fjBanner3.visible ? /*#__PURE__*/React.createElement(PromoBox, {
      b: fjBanner3,
      onNav: onNav,
      style: {
        marginTop: 0
      }
    }) : null)), /*#__PURE__*/React.createElement("main", null, /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "space-between",
        marginBottom: 16,
        gap: 16
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        minWidth: 0
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontWeight: 700,
        fontSize: "var(--text-xl)",
        color: "var(--text-strong)",
        fontFamily: "var(--font-display)"
      }
    }, results.length, " ", results.length === 1 ? "job" : "jobs", location.trim() ? " in " + location : ""), chips.length > 0 && /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        gap: 8,
        marginTop: 10,
        flexWrap: "wrap"
      }
    }, chips.map(([key, label]) => /*#__PURE__*/React.createElement(Tag, {
      key: key,
      active: true,
      removable: true,
      onRemove: () => removeChip(key)
    }, label)))), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        alignItems: "center",
        gap: 12,
        flexShrink: 0
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        gap: 2,
        padding: 3,
        background: "var(--surface-sunken)",
        borderRadius: "var(--radius-md)"
      }
    }, [["list", "list", "List"], ["grid", "layout-grid", "Grid"], ["details", "rows-3", "Details"]].map(([val, ic, label]) => {
      const on = view === val;
      return /*#__PURE__*/React.createElement("button", {
        key: val,
        onClick: () => setView(val),
        title: label,
        "aria-label": label,
        style: {
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          width: 36,
          height: 34,
          cursor: "pointer",
          border: "none",
          borderRadius: "var(--radius-sm)",
          background: on ? "var(--surface-card)" : "transparent",
          color: on ? "var(--text-brand)" : "var(--text-muted)",
          boxShadow: on ? "var(--shadow-xs)" : "none"
        }
      }, I(ic, 17));
    })), /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: "var(--text-sm)",
        color: "var(--text-muted)"
      }
    }, "Sort"), /*#__PURE__*/React.createElement(Select, {
      value: sort,
      onChange: e => setSort(e.target.value),
      options: ["Newest", "Oldest", "Highest salary"],
      size: "sm",
      containerStyle: {
        minWidth: 150
      }
    }))), results.length > 0 ? /*#__PURE__*/React.createElement(React.Fragment, null, view === "details" ? /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        flexDirection: "column",
        gap: 12
      }
    }, pageResults.map(j => /*#__PURE__*/React.createElement(DetailRow, {
      key: j.id,
      job: j,
      saved: saved.includes(j.id),
      onSave: () => toggleSave(j.id),
      onOpen: () => onOpenJob(j)
    }))) : /*#__PURE__*/React.createElement("div", {
      style: view === "grid" ? {
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: 14
      } : {
        display: "flex",
        flexDirection: "column",
        gap: 14
      }
    }, pageResults.map(j => /*#__PURE__*/React.createElement(JobCard, _extends({
      key: j.id
    }, j, {
      saved: saved.includes(j.id),
      onSave: () => toggleSave(j.id),
      onClick: () => onOpenJob(j)
    })))), pages > 1 ? /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        marginTop: 28
      }
    }, /*#__PURE__*/React.createElement("button", {
      onClick: () => setPage(Math.max(0, pageSafe - 1)),
      disabled: pageSafe === 0,
      "aria-label": "Previous",
      style: {
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        width: 40,
        height: 40,
        borderRadius: "var(--radius-md)",
        border: "1px solid var(--border-strong)",
        background: "var(--surface-card)",
        cursor: pageSafe === 0 ? "not-allowed" : "pointer",
        color: pageSafe === 0 ? "var(--text-faint)" : "var(--text-body)"
      }
    }, I("chevron-left", 18)), Array.from({
      length: pages
    }).map((_, i) => /*#__PURE__*/React.createElement("button", {
      key: i,
      onClick: () => setPage(i),
      style: {
        minWidth: 40,
        height: 40,
        padding: "0 12px",
        borderRadius: "var(--radius-md)",
        cursor: "pointer",
        border: "1px solid " + (i === pageSafe ? "var(--brand)" : "var(--border-strong)"),
        background: i === pageSafe ? "var(--brand)" : "var(--surface-card)",
        color: i === pageSafe ? "var(--on-brand)" : "var(--text-body)",
        fontFamily: "var(--font-sans)",
        fontSize: "var(--text-sm)",
        fontWeight: 700
      }
    }, i + 1)), /*#__PURE__*/React.createElement("button", {
      onClick: () => setPage(Math.min(pages - 1, pageSafe + 1)),
      disabled: pageSafe === pages - 1,
      "aria-label": "Next",
      style: {
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        width: 40,
        height: 40,
        borderRadius: "var(--radius-md)",
        border: "1px solid var(--border-strong)",
        background: "var(--surface-card)",
        cursor: pageSafe === pages - 1 ? "not-allowed" : "pointer",
        color: pageSafe === pages - 1 ? "var(--text-faint)" : "var(--text-body)"
      }
    }, I("chevron-right", 18))) : null) : /*#__PURE__*/React.createElement("div", {
      style: {
        background: "var(--surface-card)",
        border: "1px solid var(--border)",
        borderRadius: "var(--radius-lg)"
      }
    }, /*#__PURE__*/React.createElement(EmptyState, {
      icon: I("search-x", 22),
      title: "No jobs match your filters",
      description: "Try removing a filter or widening your search.",
      action: /*#__PURE__*/React.createElement(Button, {
        variant: "secondary",
        onClick: clearAll
      }, "Clear filters")
    })))));
  }

  // Company "Details" row — denser layout with industry, location, open roles + actions
  function CompanyDetailRow({
    c,
    onNav
  }) {
    const meta = (ic, txt) => /*#__PURE__*/React.createElement("span", {
      style: {
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        fontSize: "var(--text-sm)",
        color: "var(--text-muted)"
      }
    }, I(ic, 15), txt);
    return /*#__PURE__*/React.createElement("div", {
      onClick: () => onNav("jobs", {
        company: c.name
      }),
      style: {
        background: "var(--surface-card)",
        border: "1px solid var(--border)",
        borderRadius: "var(--radius-lg)",
        boxShadow: "var(--shadow-sm)",
        padding: 20,
        cursor: "pointer"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        gap: 16,
        alignItems: "center"
      }
    }, /*#__PURE__*/React.createElement(Avatar, {
      src: (window.KRAMA_LOGOS || {})[c.name],
      name: c.name,
      square: true,
      size: 52
    }), /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1,
        minWidth: 0
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        alignItems: "center",
        gap: 8
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontFamily: "var(--font-display)",
        fontWeight: 700,
        fontSize: "var(--text-lg)",
        color: "var(--text-strong)"
      }
    }, c.name), c.verified ? /*#__PURE__*/React.createElement("span", {
      style: {
        color: "var(--brand)",
        display: "inline-flex"
      },
      title: "Verified"
    }, I("badge-check", 16)) : null), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        gap: 18,
        flexWrap: "wrap",
        marginTop: 8
      }
    }, meta("briefcase", c.industry), meta("map-pin", c.location), meta("circle-user", c.openJobs + " open roles"))), /*#__PURE__*/React.createElement(Button, {
      variant: "secondary",
      size: "sm",
      onClick: e => {
        e.stopPropagation();
        onNav("jobs", {
          company: c.name
        });
      }
    }, "View jobs")));
  }
  function Companies({
    onNav
  }) {
    const [keyword, setKeyword] = React.useState("");
    const [industry, setIndustry] = React.useState("All industries");
    const [view, setView] = React.useState("grid");
    const [page, setPage] = React.useState(0);
    const PER_PAGE = 12;
    React.useEffect(() => {
      if (window.lucide) window.lucide.createIcons();
    });
    const industries = ["All industries", ...Array.from(new Set(D.companies.map(c => c.industry)))];
    const banner = loadBanner("companiesBanner", CO_DEFAULT);
    const banner2 = loadBanner("companiesBanner2", CO2_DEFAULT);
    const banner3 = loadBanner("companiesBanner3", CO3_DEFAULT);
    const banner4 = loadBanner("companiesBanner4", CO4_DEFAULT);
    const hasSide = banner.visible || banner2.visible || banner3.visible || banner4.visible;
    const results = D.companies.filter(c => {
      if (keyword.trim() && !c.name.toLowerCase().includes(keyword.toLowerCase())) return false;
      if (industry !== "All industries" && c.industry !== industry) return false;
      return true;
    });
    const pages = Math.max(1, Math.ceil(results.length / PER_PAGE));
    const pageSafe = Math.min(page, pages - 1);
    const pageResults = results.slice(pageSafe * PER_PAGE, pageSafe * PER_PAGE + PER_PAGE);
    React.useEffect(() => {
      setPage(0);
    }, [keyword, industry]);
    return /*#__PURE__*/React.createElement("div", {
      style: {
        background: "var(--surface-page)",
        minHeight: "70vh"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        position: "relative",
        overflow: "hidden",
        background: "var(--saffron-500)",
        color: "#fff"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        position: "absolute",
        inset: 0,
        background: "url('../../assets/krama-pattern.svg')",
        backgroundSize: 60,
        opacity: 0.12
      }
    }), /*#__PURE__*/React.createElement("div", {
      style: {
        position: "relative",
        maxWidth: 1200,
        margin: "0 auto",
        display: "flex",
        alignItems: "center",
        gap: 16,
        padding: "12px 32px"
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        display: "inline-flex",
        flexShrink: 0
      }
    }, I("building-2", 18)), /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1,
        fontSize: "var(--text-sm)",
        fontWeight: 500
      }
    }, /*#__PURE__*/React.createElement("strong", {
      style: {
        fontWeight: 700
      }
    }, "Are you hiring?"), " List your company and reach 40,000+ verified candidates."), /*#__PURE__*/React.createElement("span", {
      onClick: () => onNav("register"),
      style: {
        flexShrink: 0,
        background: "#fff",
        color: "var(--saffron-700)",
        fontSize: "var(--text-sm)",
        fontWeight: 700,
        padding: "7px 16px",
        borderRadius: "var(--radius-pill)",
        cursor: "pointer",
        whiteSpace: "nowrap"
      }
    }, "Post a job"))), /*#__PURE__*/React.createElement("div", {
      style: {
        position: "relative",
        background: "var(--teal-800)",
        overflow: "hidden",
        padding: "48px 32px"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        position: "absolute",
        inset: 0,
        background: "url('../../assets/krama-pattern.svg')",
        backgroundSize: 72,
        opacity: 0.08
      }
    }), /*#__PURE__*/React.createElement("div", {
      style: {
        position: "relative",
        maxWidth: 1200,
        margin: "0 auto"
      }
    }, /*#__PURE__*/React.createElement("h1", {
      style: {
        color: "#fff",
        fontSize: "var(--text-4xl)",
        fontWeight: 800,
        letterSpacing: "-0.02em"
      }
    }, "Verified companies hiring now"), /*#__PURE__*/React.createElement("p", {
      style: {
        color: "var(--stone-300)",
        fontSize: "var(--text-lg)",
        marginTop: 10
      }
    }, "Explore ", D.companies.length, " approved employers across Cambodia."))), /*#__PURE__*/React.createElement("div", {
      style: {
        maxWidth: 1200,
        margin: "0 auto",
        padding: "28px 32px",
        display: "grid",
        gridTemplateColumns: hasSide ? "1fr 300px" : "1fr",
        gap: 28,
        alignItems: "start"
      }
    }, /*#__PURE__*/React.createElement("main", null, /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        gap: 10,
        marginBottom: 20,
        flexWrap: "wrap",
        alignItems: "center"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1,
        minWidth: 220,
        display: "flex",
        alignItems: "center",
        gap: 8,
        padding: "0 14px",
        height: 44,
        border: "1px solid var(--border-strong)",
        borderRadius: "var(--radius-md)",
        background: "var(--surface-card)"
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        color: "var(--text-faint)"
      }
    }, I("search")), /*#__PURE__*/React.createElement("input", {
      value: keyword,
      onChange: e => setKeyword(e.target.value),
      placeholder: "Search companies",
      style: {
        flex: 1,
        border: "none",
        outline: "none",
        fontFamily: "var(--font-sans)",
        fontSize: "var(--text-base)",
        background: "transparent"
      }
    })), /*#__PURE__*/React.createElement(Select, {
      value: industry,
      onChange: e => setIndustry(e.target.value),
      options: industries,
      containerStyle: {
        minWidth: 200
      }
    }), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        gap: 2,
        padding: 3,
        background: "var(--surface-sunken)",
        borderRadius: "var(--radius-md)"
      }
    }, [["grid", "layout-grid", "Grid"], ["details", "rows-3", "Details"]].map(([val, ic, label]) => {
      const on = view === val;
      return /*#__PURE__*/React.createElement("button", {
        key: val,
        onClick: () => setView(val),
        title: label,
        "aria-label": label,
        style: {
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          width: 36,
          height: 34,
          cursor: "pointer",
          border: "none",
          borderRadius: "var(--radius-sm)",
          background: on ? "var(--surface-card)" : "transparent",
          color: on ? "var(--text-brand)" : "var(--text-muted)",
          boxShadow: on ? "var(--shadow-xs)" : "none"
        }
      }, I(ic, 17));
    }))), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: "var(--text-sm)",
        color: "var(--text-muted)",
        marginBottom: 14
      }
    }, results.length, " ", results.length === 1 ? "company" : "companies"), results.length > 0 ? /*#__PURE__*/React.createElement(React.Fragment, null, view === "details" ? /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        flexDirection: "column",
        gap: 12
      }
    }, pageResults.map(c => /*#__PURE__*/React.createElement(CompanyDetailRow, {
      key: c.name,
      c: c,
      onNav: onNav
    }))) : /*#__PURE__*/React.createElement("div", {
      style: {
        display: "grid",
        gridTemplateColumns: hasSide ? "1fr 1fr" : "repeat(3,1fr)",
        gap: 16
      }
    }, pageResults.map(c => /*#__PURE__*/React.createElement(CompanyCard, _extends({
      key: c.name
    }, c, {
      onClick: () => onNav("jobs", {
        company: c.name
      })
    })))), pages > 1 ? /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        marginTop: 28
      }
    }, /*#__PURE__*/React.createElement("button", {
      onClick: () => setPage(Math.max(0, pageSafe - 1)),
      disabled: pageSafe === 0,
      "aria-label": "Previous",
      style: {
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        width: 40,
        height: 40,
        borderRadius: "var(--radius-md)",
        border: "1px solid var(--border-strong)",
        background: "var(--surface-card)",
        cursor: pageSafe === 0 ? "not-allowed" : "pointer",
        color: pageSafe === 0 ? "var(--text-faint)" : "var(--text-body)"
      }
    }, I("chevron-left", 18)), Array.from({
      length: pages
    }).map((_, i) => /*#__PURE__*/React.createElement("button", {
      key: i,
      onClick: () => setPage(i),
      style: {
        minWidth: 40,
        height: 40,
        padding: "0 12px",
        borderRadius: "var(--radius-md)",
        cursor: "pointer",
        border: "1px solid " + (i === pageSafe ? "var(--brand)" : "var(--border-strong)"),
        background: i === pageSafe ? "var(--brand)" : "var(--surface-card)",
        color: i === pageSafe ? "var(--on-brand)" : "var(--text-body)",
        fontFamily: "var(--font-sans)",
        fontSize: "var(--text-sm)",
        fontWeight: 700
      }
    }, i + 1)), /*#__PURE__*/React.createElement("button", {
      onClick: () => setPage(Math.min(pages - 1, pageSafe + 1)),
      disabled: pageSafe === pages - 1,
      "aria-label": "Next",
      style: {
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        width: 40,
        height: 40,
        borderRadius: "var(--radius-md)",
        border: "1px solid var(--border-strong)",
        background: "var(--surface-card)",
        cursor: pageSafe === pages - 1 ? "not-allowed" : "pointer",
        color: pageSafe === pages - 1 ? "var(--text-faint)" : "var(--text-body)"
      }
    }, I("chevron-right", 18))) : null) : /*#__PURE__*/React.createElement("div", {
      style: {
        background: "var(--surface-card)",
        border: "1px solid var(--border)",
        borderRadius: "var(--radius-lg)"
      }
    }, /*#__PURE__*/React.createElement(EmptyState, {
      icon: I("building-2", 22),
      title: "No companies found",
      description: "Try a different name or industry.",
      action: /*#__PURE__*/React.createElement(Button, {
        variant: "secondary",
        onClick: () => {
          setKeyword("");
          setIndustry("All industries");
        }
      }, "Reset")
    }))), hasSide ? /*#__PURE__*/React.createElement("aside", {
      style: {
        position: "sticky",
        top: 84,
        display: "flex",
        flexDirection: "column",
        gap: 16
      }
    }, banner.visible ? /*#__PURE__*/React.createElement(PromoBox, {
      b: banner,
      onNav: onNav,
      style: {
        marginTop: 0
      }
    }) : null, banner2.visible ? /*#__PURE__*/React.createElement(PromoBox, {
      b: banner2,
      onNav: onNav,
      style: {
        marginTop: 0
      }
    }) : null, banner3.visible ? /*#__PURE__*/React.createElement(PromoBox, {
      b: banner3,
      onNav: onNav,
      style: {
        marginTop: 0
      }
    }) : null, banner4.visible ? /*#__PURE__*/React.createElement(PromoBox, {
      b: banner4,
      onNav: onNav,
      style: {
        marginTop: 0
      }
    }) : null) : null));
  }
  window.KramaJobs = Jobs;
  window.KramaCompanies = Companies;
})();
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/public-website/jobs.jsx", error: String((e && e.message) || e) }); }

// ui_kits/public-website/pages.jsx
try { (() => {
// Krama public website — CMS info pages (About, Contact, Terms, Privacy).
(function init() {
  if (!window.KramaDesignSystem_1a6f65) {
    return setTimeout(init, 40);
  }
  const {
    Button,
    Input,
    Textarea,
    Card,
    Badge
  } = window.KramaDesignSystem_1a6f65;
  const I = (n, s = 18) => /*#__PURE__*/React.createElement("i", {
    "data-lucide": n,
    style: {
      width: s,
      height: s
    }
  });
  const CONTENT = {
    pricing: {
      eyebrow: "Pricing",
      title: "Plans that grow with your hiring.",
      lead: "Start free, upgrade when you need more reach. All prices in USD.",
      render: onNav => {
        const plans = [{
          name: "Free",
          price: "$0",
          per: "forever",
          cta: "Get started",
          features: ["1 active job post", "Standard listing", "Basic applicant list", "Email support"]
        }, {
          name: "Standard",
          price: "$49",
          per: "/ month",
          popular: true,
          cta: "Choose Standard",
          features: ["10 active job posts", "Applicant tracking pipeline", "Résumé downloads", "Priority support"]
        }, {
          name: "Premium",
          price: "$99",
          per: "/ month",
          cta: "Choose Premium",
          features: ["Unlimited job posts", "3 featured listings / mo", "Résumé database search", "AI candidate matching", "Dedicated manager"]
        }];
        return /*#__PURE__*/React.createElement("div", {
          style: {
            display: "flex",
            flexDirection: "column",
            gap: 28
          }
        }, /*#__PURE__*/React.createElement("div", {
          style: {
            display: "grid",
            gridTemplateColumns: "repeat(3,1fr)",
            gap: 20,
            alignItems: "start"
          }
        }, plans.map(p => /*#__PURE__*/React.createElement(Card, {
          key: p.name,
          featured: p.popular,
          padding: 28,
          style: p.popular ? {
            border: "1.5px solid var(--brand)"
          } : {}
        }, /*#__PURE__*/React.createElement("div", {
          style: {
            display: "flex",
            alignItems: "center",
            gap: 8
          }
        }, /*#__PURE__*/React.createElement("h3", {
          style: {
            fontSize: "var(--text-lg)",
            fontWeight: 700,
            color: "var(--text-strong)"
          }
        }, p.name), p.popular ? /*#__PURE__*/React.createElement(Badge, {
          tone: "accent"
        }, "Most popular") : null), /*#__PURE__*/React.createElement("div", {
          style: {
            display: "flex",
            alignItems: "baseline",
            gap: 6,
            marginTop: 14
          }
        }, /*#__PURE__*/React.createElement("span", {
          style: {
            fontFamily: "var(--font-display)",
            fontSize: "var(--text-5xl)",
            fontWeight: 800,
            color: "var(--text-strong)"
          }
        }, p.price), /*#__PURE__*/React.createElement("span", {
          style: {
            color: "var(--text-muted)",
            fontSize: "var(--text-base)"
          }
        }, p.per)), /*#__PURE__*/React.createElement("div", {
          style: {
            display: "flex",
            flexDirection: "column",
            gap: 11,
            margin: "20px 0 24px"
          }
        }, p.features.map(f => /*#__PURE__*/React.createElement("div", {
          key: f,
          style: {
            display: "flex",
            gap: 9,
            fontSize: "var(--text-base)",
            color: "var(--text-body)"
          }
        }, /*#__PURE__*/React.createElement("span", {
          style: {
            color: "var(--brand)",
            flexShrink: 0
          }
        }, I("check", 18)), f))), /*#__PURE__*/React.createElement(Button, {
          variant: p.popular ? "primary" : "secondary",
          block: true,
          onClick: () => onNav && onNav("register")
        }, p.cta)))), /*#__PURE__*/React.createElement("p", {
          style: {
            fontSize: "var(--text-sm)",
            color: "var(--text-muted)",
            textAlign: "center"
          }
        }, "Prices exclude applicable taxes. Pay by KHQR, ABA, Wing, or card. Cancel anytime."));
      }
    },
    about: {
      eyebrow: "About us",
      title: "Work that fits your life.",
      lead: "Krama connects ambitious people with verified employers across Cambodia and Southeast Asia.",
      render: () => /*#__PURE__*/React.createElement("div", {
        style: {
          display: "flex",
          flexDirection: "column",
          gap: 24
        }
      }, /*#__PURE__*/React.createElement("p", {
        style: {
          fontSize: "var(--text-lg)",
          color: "var(--text-body)",
          lineHeight: 1.65
        }
      }, "We started Krama with one belief: finding work \u2014 and hiring \u2014 should be hopeful and human. Every company on Krama is verified, every job is reviewed before it goes live, and every candidate is treated as more than a CV."), /*#__PURE__*/React.createElement("div", {
        style: {
          display: "grid",
          gridTemplateColumns: "repeat(3,1fr)",
          gap: 16
        }
      }, [["12,480", "Open jobs"], ["486", "Verified companies"], ["40k+", "Candidates"]].map(([n, l]) => /*#__PURE__*/React.createElement(Card, {
        key: l,
        padding: 24
      }, /*#__PURE__*/React.createElement("div", {
        style: {
          fontFamily: "var(--font-display)",
          fontWeight: 800,
          fontSize: "var(--text-4xl)",
          color: "var(--brand)"
        }
      }, n), /*#__PURE__*/React.createElement("div", {
        style: {
          fontSize: "var(--text-base)",
          color: "var(--text-muted)",
          marginTop: 4
        }
      }, l)))), /*#__PURE__*/React.createElement("p", {
        style: {
          fontSize: "var(--text-base)",
          color: "var(--text-body)",
          lineHeight: 1.65
        }
      }, "We're a Cambodia-first team building for the whole region \u2014 with Khmer and English as first-class peers, and payment options that work locally, from KHQR to ABA and Wing."))
    },
    contact: {
      eyebrow: "Contact",
      title: "We'd love to hear from you.",
      lead: "Questions, partnerships, or support — reach the Krama team.",
      render: () => /*#__PURE__*/React.createElement("div", {
        style: {
          display: "grid",
          gridTemplateColumns: "1.2fr 1fr",
          gap: 32,
          alignItems: "start"
        }
      }, /*#__PURE__*/React.createElement(Card, {
        padding: 28
      }, /*#__PURE__*/React.createElement("div", {
        style: {
          display: "flex",
          flexDirection: "column",
          gap: 16
        }
      }, /*#__PURE__*/React.createElement("div", {
        style: {
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 14
        }
      }, /*#__PURE__*/React.createElement(Input, {
        label: "Your name",
        placeholder: "Sok Dara"
      }), /*#__PURE__*/React.createElement(Input, {
        label: "Email",
        type: "email",
        placeholder: "you@example.com"
      })), /*#__PURE__*/React.createElement(Input, {
        label: "Subject",
        placeholder: "How can we help?"
      }), /*#__PURE__*/React.createElement(Textarea, {
        label: "Message",
        rows: 5,
        placeholder: "Tell us a little more\u2026"
      }), /*#__PURE__*/React.createElement(Button, {
        variant: "primary"
      }, "Send message"))), /*#__PURE__*/React.createElement("div", {
        style: {
          display: "flex",
          flexDirection: "column",
          gap: 16
        }
      }, [["map-pin", "Office", "#148, Preah Sihanouk Blvd, Phnom Penh"], ["mail", "Email", "hello@krama.com"], ["phone", "Phone", "+855 23 900 100"], ["clock", "Hours", "Mon–Fri · 8:00–17:30"]].map(([ic, k, v]) => /*#__PURE__*/React.createElement("div", {
        key: k,
        style: {
          display: "flex",
          gap: 14,
          alignItems: "flex-start"
        }
      }, /*#__PURE__*/React.createElement("span", {
        style: {
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          width: 42,
          height: 42,
          borderRadius: "var(--radius-md)",
          background: "var(--brand-subtle)",
          color: "var(--brand)",
          flexShrink: 0
        }
      }, I(ic, 18)), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
        style: {
          fontWeight: 700,
          color: "var(--text-strong)"
        }
      }, k), /*#__PURE__*/React.createElement("div", {
        style: {
          fontSize: "var(--text-sm)",
          color: "var(--text-muted)",
          marginTop: 2
        }
      }, v))))))
    },
    terms: {
      eyebrow: "Legal",
      title: "Terms of Service",
      lead: "The rules for using Krama. Last updated 18 June 2026.",
      render: () => prose([["1. Acceptance", "By creating an account or using Krama, you agree to these terms. If you don't agree, please don't use the service."], ["2. Accounts", "You're responsible for your account and for keeping your password secure. Employers must provide accurate company information for verification."], ["3. Job postings", "All jobs are reviewed before publishing. We may reject or remove postings that are misleading, discriminatory, or violate local law."], ["4. Candidate conduct", "Apply honestly. Misrepresenting your experience or identity may result in account suspension."], ["5. Payments", "Paid plans renew on their billing date until cancelled. Fees are non-refundable except where required by law."], ["6. Liability", "Krama is a marketplace; we don't guarantee employment or hiring outcomes and aren't party to any employment contract."]])
    },
    privacy: {
      eyebrow: "Legal",
      title: "Privacy Policy",
      lead: "How we handle your data. Last updated 18 June 2026.",
      render: () => prose([["1. What we collect", "Account details, résumé content you provide, and usage data needed to run the service."], ["2. How we use it", "To match you with jobs or candidates, process applications, and improve recommendations. We don't sell your personal data."], ["3. Sharing", "When you apply, your résumé is shared with that employer. Verified employers can search résumés only if you opt in."], ["4. Security", "Data is encrypted in transit and at rest. Access is role-based and audit-logged."], ["5. Your rights", "You can view, export, or delete your data at any time from your profile, or by contacting us."], ["6. Contact", "Questions about privacy? Email privacy@krama.com."]])
    }
  };
  function prose(items) {
    return /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        flexDirection: "column",
        gap: 22,
        maxWidth: 760
      }
    }, items.map(([h, b]) => /*#__PURE__*/React.createElement("div", {
      key: h
    }, /*#__PURE__*/React.createElement("h3", {
      style: {
        fontSize: "var(--text-lg)",
        fontWeight: 700,
        color: "var(--text-strong)",
        marginBottom: 6
      }
    }, h), /*#__PURE__*/React.createElement("p", {
      style: {
        fontSize: "var(--text-base)",
        color: "var(--text-body)",
        lineHeight: 1.6
      }
    }, b))));
  }
  function InfoPage({
    slug,
    onNav
  }) {
    const c = CONTENT[slug] || CONTENT.about;
    React.useEffect(() => {
      if (window.lucide) window.lucide.createIcons();
    }, [slug]);
    return /*#__PURE__*/React.createElement("div", {
      style: {
        background: "var(--surface-page)",
        minHeight: "70vh"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        position: "relative",
        background: "var(--teal-800)",
        overflow: "hidden",
        padding: "52px 32px"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        position: "absolute",
        inset: 0,
        background: "url('../../assets/krama-pattern.svg')",
        backgroundSize: 72,
        opacity: 0.08
      }
    }), /*#__PURE__*/React.createElement("div", {
      style: {
        position: "relative",
        maxWidth: 1000,
        margin: "0 auto"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: "var(--text-xs)",
        fontWeight: 800,
        letterSpacing: "0.1em",
        textTransform: "uppercase",
        color: "var(--teal-200)"
      }
    }, c.eyebrow), /*#__PURE__*/React.createElement("h1", {
      style: {
        color: "#fff",
        fontSize: "var(--text-5xl)",
        fontWeight: 800,
        letterSpacing: "-0.02em",
        marginTop: 8
      }
    }, c.title), /*#__PURE__*/React.createElement("p", {
      style: {
        color: "var(--stone-300)",
        fontSize: "var(--text-lg)",
        marginTop: 12,
        maxWidth: 640
      }
    }, c.lead))), /*#__PURE__*/React.createElement("div", {
      style: {
        maxWidth: 1000,
        margin: "0 auto",
        padding: "44px 32px 64px"
      }
    }, c.render(onNav)));
  }
  window.KramaInfoPage = InfoPage;
})();
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/public-website/pages.jsx", error: String((e && e.message) || e) }); }

__ds_ns.Avatar = __ds_scope.Avatar;

__ds_ns.Badge = __ds_scope.Badge;

__ds_ns.Button = __ds_scope.Button;

__ds_ns.Card = __ds_scope.Card;

__ds_ns.IconButton = __ds_scope.IconButton;

__ds_ns.StatusBadge = __ds_scope.StatusBadge;

__ds_ns.Tag = __ds_scope.Tag;

__ds_ns.CompanyCard = __ds_scope.CompanyCard;

__ds_ns.EmptyState = __ds_scope.EmptyState;

__ds_ns.JobCard = __ds_scope.JobCard;

__ds_ns.ProgressTracker = __ds_scope.ProgressTracker;

__ds_ns.StatCard = __ds_scope.StatCard;

__ds_ns.Tabs = __ds_scope.Tabs;

__ds_ns.Checkbox = __ds_scope.Checkbox;

__ds_ns.Input = __ds_scope.Input;

__ds_ns.Select = __ds_scope.Select;

__ds_ns.Switch = __ds_scope.Switch;

__ds_ns.Textarea = __ds_scope.Textarea;

})();
