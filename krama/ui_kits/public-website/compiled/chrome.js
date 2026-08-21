// Krama public website -- shared chrome (header + footer). Assigns to window.
(function init() {
  if (!window.KramaDesignSystem_1a6f65) {
    return setTimeout(init, 40);
  }
  const {
    Button,
    Badge
  } = window.KramaDesignSystem_1a6f65;

  // Page-hero heading/subtitle size presets (admin-configurable per hero). Returns CSS
  // classes; the actual sizes live in mobile.css and use clamp() so they scale down on
  // mobile automatically. Empty => the hero keeps its default size.
  window.kHeroCls = function (h) {
    h = h || {};
    var hh = {
      sm: "krm-hh-sm",
      md: "krm-hh-md",
      lg: "krm-hh-lg",
      xl: "krm-hh-xl"
    }[h.headingSize] || "";
    var hs = {
      sm: "krm-hs-sm",
      md: "krm-hs-md",
      lg: "krm-hs-lg"
    }[h.subSize] || "";
    return (hh ? " " + hh : "") + (hs ? " " + hs : "");
  };
  function UserMenu({
    user,
    onLogout,
    onNav
  }) {
    const [open, setOpen] = React.useState(false);
    const initials = user.name ? user.name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase() : "?";
    const roleSlug = user.role && user.role.slug;
    const isAdmin = roleSlug === "admin" || roleSlug === "super_admin";
    const goToDashboard = () => {
      setOpen(false);
      const token = localStorage.getItem("krama_access_token");
      if (roleSlug === "employer") {
        if (token) localStorage.setItem("krama_employer_token", token);
        window.location.href = "../employer-dashboard/index.html";
      } else if (isAdmin) {
        if (token) localStorage.setItem("krama_admin_token", token);
        window.location.href = "../admin-dashboard/index.html";
      } else {
        window.location.href = "../candidate-dashboard/index.html";
      }
    };
    const dashboardLabel = roleSlug === "employer" ? "Employer Dashboard" : isAdmin ? "Admin Dashboard" : "Candidate Dashboard";

    // Profile editing lives inside each dashboard, so the account menu only offers Dashboard.
    const menuItems = [[dashboardLabel, goToDashboard]];
    return /*#__PURE__*/React.createElement("div", {
      style: {
        position: "relative"
      }
    }, /*#__PURE__*/React.createElement("button", {
      onClick: () => setOpen(o => !o),
      style: {
        display: "flex",
        alignItems: "center",
        gap: 8,
        border: 0,
        borderRadius: "var(--radius-full)",
        padding: "4px 12px 4px 4px",
        background: "var(--surface-card)",
        cursor: "pointer",
        fontFamily: "var(--font-sans)"
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        width: 30,
        height: 30,
        borderRadius: "50%",
        background: "var(--brand)",
        color: "#fff",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 12,
        fontWeight: 700,
        flexShrink: 0,
        overflow: "hidden"
      }
    }, user.avatar_url ? /*#__PURE__*/React.createElement("img", {
      src: user.avatar_url,
      alt: initials,
      style: {
        width: "100%",
        height: "100%",
        objectFit: "cover",
        display: "block"
      }
    }) : initials), /*#__PURE__*/React.createElement("span", {
      style: {
        fontWeight: 600,
        fontSize: "var(--text-sm)",
        color: "var(--text-strong)",
        maxWidth: 120,
        overflow: "hidden",
        textOverflow: "ellipsis",
        whiteSpace: "nowrap"
      }
    }, user.name)), open && /*#__PURE__*/React.createElement("div", {
      onClick: () => setOpen(false),
      style: {
        position: "fixed",
        inset: 0,
        zIndex: 99
      }
    }, /*#__PURE__*/React.createElement("div", {
      onClick: e => e.stopPropagation(),
      style: {
        position: "absolute",
        top: 40,
        right: 0,
        minWidth: 200,
        background: "var(--surface-card)",
        border: "1px solid var(--border)",
        borderRadius: "var(--radius-md)",
        boxShadow: "var(--shadow-lg)",
        zIndex: 100,
        padding: "6px 0",
        overflow: "hidden"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        padding: "10px 14px 8px",
        borderBottom: "1px solid var(--border)"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontWeight: 700,
        fontSize: "var(--text-sm)",
        color: "var(--text-strong)"
      }
    }, user.name), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: "var(--text-xs)",
        color: "var(--text-muted)"
      }
    }, user.email), roleSlug && /*#__PURE__*/React.createElement("div", {
      style: {
        marginTop: 4,
        fontSize: "var(--text-xs)",
        color: "var(--text-brand)",
        fontWeight: 600,
        textTransform: "capitalize"
      }
    }, roleSlug)), menuItems.map(([label, action]) => /*#__PURE__*/React.createElement("button", {
      key: label,
      onClick: action,
      style: {
        display: "block",
        width: "100%",
        textAlign: "left",
        border: "none",
        background: "transparent",
        padding: "9px 14px",
        cursor: "pointer",
        fontFamily: "var(--font-sans)",
        fontSize: "var(--text-sm)",
        color: "var(--text-body)"
      }
    }, label)), /*#__PURE__*/React.createElement("div", {
      style: {
        borderTop: "1px solid var(--border)",
        marginTop: 4
      }
    }, /*#__PURE__*/React.createElement("button", {
      onClick: () => {
        setOpen(false);
        onLogout();
      },
      style: {
        display: "block",
        width: "100%",
        textAlign: "left",
        border: "none",
        background: "transparent",
        padding: "9px 14px",
        cursor: "pointer",
        fontFamily: "var(--font-sans)",
        fontSize: "var(--text-sm)",
        color: "var(--danger)"
      }
    }, "Sign out")))));
  }
  function Header({
    page,
    onNav,
    user,
    onLogout,
    lang,
    onSelectLang
  }) {
    const [menuOpen, setMenuOpen] = React.useState(false);
    const t = window.KRAMA_T || function (s) {
      return s;
    };
    // Segmented language picker, rendered from the registry in i18n.js rather than hardcoded —
    // adding a language there adds a segment here with no change to this component. Each
    // segment is its own button so it's directly selectable (a 3-state cycle-toggle would make
    // reaching the third language a guessing game) and keyboard-reachable.
    const LangToggle = () => {
      const langs = window.KRAMA_LANGS || [{
        code: "en",
        label: "EN"
      }];
      const active = langs.some(function (l) {
        return l.code === lang;
      }) ? lang : "en";
      return /*#__PURE__*/React.createElement("div", {
        role: "group",
        "aria-label": "Language",
        title: "Language / \u1797\u17B6\u179F\u17B6 / \u8BED\u8A00",
        style: {
          display: "inline-flex",
          alignItems: "center",
          gap: 2,
          border: "1px solid var(--border)",
          borderRadius: "var(--radius-pill)",
          background: "transparent",
          padding: 3,
          flexShrink: 0
        }
      }, langs.map(function (l) {
        const on = l.code === active;
        return /*#__PURE__*/React.createElement("button", {
          key: l.code,
          onClick: function () {
            onSelectLang(l.code);
          },
          lang: l.html,
          "aria-pressed": on,
          style: {
            padding: "2px 8px",
            border: "none",
            borderRadius: "var(--radius-pill)",
            cursor: "pointer",
            fontSize: "var(--text-xs)",
            fontWeight: 700,
            background: on ? "var(--brand)" : "transparent",
            color: on ? "#fff" : "var(--text-muted)",
            fontFamily: l.code === "km" ? "var(--font-khmer, var(--font-sans))" : "var(--font-sans)"
          }
        }, l.label);
      }));
    };
    const links = [{
      id: "home",
      label: "Home"
    }, {
      id: "jobs",
      label: "Jobs"
    }, {
      id: "companies",
      label: "Companies"
    }, {
      id: "community",
      label: "Community"
    }, {
      id: "employers",
      label: "Employers"
    }];
    // Mobile bottom nav (app-style tab bar). Home removed (logo links home);
    // "Job Search" is a raised action button in the centre.
    const bottomTabs = [{
      id: "home",
      icon: "home",
      label: "Home"
    }, {
      id: "companies",
      icon: "building-2",
      label: "Companies"
    }, {
      id: "jobs",
      icon: "search",
      label: "Job Search",
      center: true
    }, {
      id: "employers",
      icon: "users",
      label: "Employers"
    }, {
      id: "community",
      icon: "messages-square",
      label: "Community"
    }];
    const navTo = id => {
      setMenuOpen(false);
      onNav(id);
    };

    // Dashboard routing for the mobile account sheet (mirrors the desktop UserMenu).
    const roleSlug = user && user.role && user.role.slug;
    const initials = user && user.name ? user.name.split(" ").map(function (w) {
      return w[0];
    }).join("").slice(0, 2).toUpperCase() : "?";
    const isAdmin = roleSlug === "admin" || roleSlug === "super_admin";
    const dashboardLabel = roleSlug === "employer" ? "Employer Dashboard" : isAdmin ? "Admin Dashboard" : "Candidate Dashboard";
    const goToDashboard = () => {
      setMenuOpen(false);
      const token = localStorage.getItem("krama_access_token");
      if (roleSlug === "employer") {
        if (token) localStorage.setItem("krama_employer_token", token);
        window.location.href = "../employer-dashboard/index.html";
      } else if (isAdmin) {
        if (token) localStorage.setItem("krama_admin_token", token);
        window.location.href = "../admin-dashboard/index.html";
      } else {
        window.location.href = "../candidate-dashboard/index.html";
      }
    };
    return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("header", {
      className: "krm-header",
      style: {
        position: "sticky",
        top: 0,
        zIndex: 50,
        height: 64,
        background: "rgba(255,255,255,0.92)",
        backdropFilter: "blur(8px)",
        borderBottom: "1px solid var(--border)",
        display: "flex",
        alignItems: "center",
        padding: "0 32px",
        gap: 32
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        alignItems: "center",
        gap: 9,
        cursor: "pointer",
        flexShrink: 0
      },
      onClick: () => navTo("home")
    }, /*#__PURE__*/React.createElement("img", {
      src: window.getKramaLogo("../../assets/krama-icon.png"),
      height: "36",
      alt: "KRAMA"
    }), /*#__PURE__*/React.createElement("span", {
      style: {
        fontFamily: "var(--font-display)",
        fontWeight: 800,
        fontSize: "var(--text-lg)",
        letterSpacing: ".08em",
        color: "var(--text-strong)"
      }
    }, window.KRAMA_BRAND_NAME || "KRAMA")), /*#__PURE__*/React.createElement("nav", {
      className: "krm-header-nav",
      style: {
        display: "flex",
        gap: 6
      }
    }, links.map(l => /*#__PURE__*/React.createElement("button", {
      key: l.id,
      onClick: () => navTo(l.id),
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
    }, t(l.label)))), /*#__PURE__*/React.createElement("div", {
      className: "krm-header-right",
      style: {
        marginLeft: "auto",
        display: "flex",
        alignItems: "center",
        gap: 12,
        flexShrink: 0
      }
    }, window.KramaChatLauncher ? /*#__PURE__*/React.createElement(window.KramaChatLauncher, null) : null, /*#__PURE__*/React.createElement(LangToggle, null), user ? /*#__PURE__*/React.createElement(UserMenu, {
      user: user,
      onLogout: onLogout,
      onNav: onNav
    }) : /*#__PURE__*/React.createElement("button", {
      onClick: () => navTo("login"),
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
    }, t("Sign in")), !user && /*#__PURE__*/React.createElement(Button, {
      variant: "primary",
      size: "sm",
      style: {
        whiteSpace: "nowrap"
      },
      onClick: () => navTo("register")
    }, t("Post a job"))), /*#__PURE__*/React.createElement("div", {
      className: "krm-mobile-lang",
      style: {
        marginLeft: "auto",
        display: "none",
        alignItems: "center",
        gap: 8,
        flexShrink: 0
      }
    }, window.KramaChatLauncher ? /*#__PURE__*/React.createElement(window.KramaChatLauncher, null) : null, window.KRAMA_SOCIAL_TELEGRAM ? /*#__PURE__*/React.createElement("a", {
      href: window.KRAMA_SOCIAL_TELEGRAM,
      target: "_blank",
      rel: "noopener noreferrer",
      "aria-label": "Telegram",
      title: "Telegram",
      style: {
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        width: 28,
        height: 28,
        flexShrink: 0,
        color: "var(--text-muted)"
      }
    }, /*#__PURE__*/React.createElement("svg", {
      width: "19",
      height: "19",
      viewBox: "0 0 24 24",
      fill: "currentColor"
    }, /*#__PURE__*/React.createElement("path", {
      d: "M9.78 18.65l.28-4.23 7.68-6.92c.34-.31-.07-.46-.52-.19L7.74 13.3 3.64 12c-.88-.25-.89-.86.2-1.3l15.97-6.16c.73-.33 1.43.18 1.15 1.3l-2.72 12.81c-.19.91-.74 1.13-1.5.71L12.6 16.3l-1.99 1.93c-.23.23-.42.42-.83.42z"
    }))) : null, window.KRAMA_SOCIAL_FACEBOOK ? /*#__PURE__*/React.createElement("a", {
      href: window.KRAMA_SOCIAL_FACEBOOK,
      target: "_blank",
      rel: "noopener noreferrer",
      "aria-label": "Facebook",
      title: "Facebook",
      style: {
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        width: 28,
        height: 28,
        flexShrink: 0,
        color: "var(--text-muted)"
      }
    }, /*#__PURE__*/React.createElement("svg", {
      width: "19",
      height: "19",
      viewBox: "0 0 24 24",
      fill: "currentColor"
    }, /*#__PURE__*/React.createElement("path", {
      d: "M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"
    }))) : null, /*#__PURE__*/React.createElement(LangToggle, null), /*#__PURE__*/React.createElement("button", {
      onClick: () => {
        if (user) {
          setMenuOpen(o => !o);
        } else {
          navTo("login");
        }
      },
      "aria-label": t("Account"),
      style: {
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        border: "1px solid var(--border)",
        borderRadius: "var(--radius-pill)",
        background: menuOpen ? "var(--brand-subtle)" : "transparent",
        cursor: "pointer",
        padding: user ? 3 : 6,
        flexShrink: 0,
        color: menuOpen ? "var(--text-brand)" : "var(--text-muted)",
        overflow: "hidden"
      }
    }, user ? /*#__PURE__*/React.createElement("span", {
      style: {
        width: 28,
        height: 28,
        borderRadius: "50%",
        background: "var(--brand)",
        color: "#fff",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 11,
        fontWeight: 700,
        overflow: "hidden",
        flexShrink: 0
      }
    }, user.avatar_url ? /*#__PURE__*/React.createElement("img", {
      src: user.avatar_url,
      alt: initials,
      style: {
        width: "100%",
        height: "100%",
        objectFit: "cover",
        display: "block"
      }
    }) : initials) : /*#__PURE__*/React.createElement("svg", {
      width: "20",
      height: "20",
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: "2",
      strokeLinecap: "round",
      strokeLinejoin: "round"
    }, /*#__PURE__*/React.createElement("path", {
      d: "M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"
    }), /*#__PURE__*/React.createElement("circle", {
      cx: "12",
      cy: "7",
      r: "4"
    }))))), menuOpen && /*#__PURE__*/React.createElement("div", {
      className: "krm-mobile-drawer",
      style: {
        position: "fixed",
        inset: 0,
        zIndex: 400,
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-end"
      }
    }, /*#__PURE__*/React.createElement("div", {
      onClick: () => setMenuOpen(false),
      style: {
        position: "absolute",
        inset: 0,
        background: "rgba(0,0,0,0.35)"
      }
    }), /*#__PURE__*/React.createElement("div", {
      style: {
        position: "relative",
        background: "#fff",
        borderTopLeftRadius: 18,
        borderTopRightRadius: 18,
        boxShadow: "var(--shadow-xl)",
        padding: "10px 0 calc(72px + env(safe-area-inset-bottom, 0px))"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        width: 40,
        height: 4,
        borderRadius: 2,
        background: "var(--border)",
        margin: "0 auto 12px"
      }
    }), user ? /*#__PURE__*/React.createElement("div", {
      style: {
        padding: "0 20px",
        display: "flex",
        flexDirection: "column",
        gap: 10
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        alignItems: "center",
        gap: 12
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        width: 46,
        height: 46,
        borderRadius: "50%",
        background: "var(--brand)",
        color: "#fff",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 17,
        fontWeight: 700,
        overflow: "hidden",
        flexShrink: 0
      }
    }, user.avatar_url ? /*#__PURE__*/React.createElement("img", {
      src: user.avatar_url,
      alt: initials,
      style: {
        width: "100%",
        height: "100%",
        objectFit: "cover",
        display: "block"
      }
    }) : initials), /*#__PURE__*/React.createElement("div", {
      style: {
        minWidth: 0
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontWeight: 700,
        fontSize: "var(--text-sm)",
        color: "var(--text-strong)",
        marginBottom: 2,
        overflow: "hidden",
        textOverflow: "ellipsis",
        whiteSpace: "nowrap"
      }
    }, user.name), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: "var(--text-xs)",
        color: "var(--text-muted)",
        overflow: "hidden",
        textOverflow: "ellipsis",
        whiteSpace: "nowrap"
      }
    }, user.email), roleSlug && /*#__PURE__*/React.createElement("div", {
      style: {
        marginTop: 4,
        fontSize: "var(--text-xs)",
        color: "var(--text-brand)",
        fontWeight: 600,
        textTransform: "capitalize"
      }
    }, roleSlug))), /*#__PURE__*/React.createElement("button", {
      onClick: goToDashboard,
      style: {
        width: "100%",
        padding: "11px",
        border: "none",
        borderRadius: "var(--radius-md)",
        background: "var(--brand)",
        cursor: "pointer",
        fontFamily: "var(--font-sans)",
        fontWeight: 700,
        color: "#fff",
        fontSize: "var(--text-base)"
      }
    }, t(dashboardLabel)), /*#__PURE__*/React.createElement("button", {
      onClick: () => {
        setMenuOpen(false);
        onLogout();
      },
      style: {
        width: "100%",
        padding: "10px",
        border: "1px solid var(--border)",
        borderRadius: "var(--radius-md)",
        background: "transparent",
        cursor: "pointer",
        fontFamily: "var(--font-sans)",
        fontWeight: 600,
        color: "var(--danger)",
        fontSize: "var(--text-sm)"
      }
    }, t("Log out"))) : /*#__PURE__*/React.createElement("div", {
      style: {
        padding: "0 20px",
        display: "flex",
        flexDirection: "column",
        gap: 10
      }
    }, /*#__PURE__*/React.createElement("button", {
      onClick: () => navTo("login"),
      style: {
        width: "100%",
        padding: "11px",
        border: "1px solid var(--border)",
        borderRadius: "var(--radius-md)",
        background: "transparent",
        cursor: "pointer",
        fontFamily: "var(--font-sans)",
        fontWeight: 600,
        color: "var(--text-strong)",
        fontSize: "var(--text-base)"
      }
    }, t("Log in")), /*#__PURE__*/React.createElement("button", {
      onClick: () => navTo("register"),
      style: {
        width: "100%",
        padding: "11px",
        border: "none",
        borderRadius: "var(--radius-md)",
        background: "var(--brand)",
        cursor: "pointer",
        fontFamily: "var(--font-sans)",
        fontWeight: 700,
        color: "#fff",
        fontSize: "var(--text-base)"
      }
    }, t("Register"))))), /*#__PURE__*/React.createElement("nav", {
      className: "krm-bottom-nav"
    }, bottomTabs.map((tab, i) => {
      const active = page === tab.id;
      if (tab.center) {
        return /*#__PURE__*/React.createElement("button", {
          key: "c" + i,
          className: "krm-bottom-tab krm-bottom-tab--center",
          onClick: () => navTo(tab.id),
          "aria-label": t(tab.label)
        }, /*#__PURE__*/React.createElement("span", {
          className: "krm-bottom-fab"
        }, /*#__PURE__*/React.createElement("i", {
          "data-lucide": tab.icon,
          style: {
            width: 24,
            height: 24
          }
        })), /*#__PURE__*/React.createElement("span", {
          style: {
            fontSize: 11,
            fontWeight: active ? 700 : 500,
            fontFamily: "var(--font-sans)",
            whiteSpace: "nowrap",
            color: active ? "var(--text-brand)" : "var(--text-muted)"
          }
        }, t(tab.label)));
      }
      return /*#__PURE__*/React.createElement("button", {
        key: "t" + i,
        className: "krm-bottom-tab",
        onClick: () => navTo(tab.id),
        style: {
          color: active ? "var(--text-brand)" : "var(--text-muted)"
        }
      }, /*#__PURE__*/React.createElement("i", {
        "data-lucide": tab.icon,
        style: {
          width: 22,
          height: 22
        }
      }), /*#__PURE__*/React.createElement("span", {
        style: {
          fontSize: 11,
          fontWeight: active ? 700 : 500,
          fontFamily: "var(--font-sans)",
          whiteSpace: "nowrap"
        }
      }, t(tab.label)));
    })));
  }

  // ── Footer call-to-action banner ──────────────────────────────────────────
  // The wide banner above the site footer. It used to render only on the Home page
  // (in home.jsx); moved here into the shared Footer so it shows on EVERY public
  // page. Config is the admin's home_content.footerBanner (same control as before).
  // home_content is warmed at app init (api.js → KRAMA_SETTINGS), so it's available
  // on any page; we read the localStorage cache first and refresh on mount.
  const FB_HOME_KEY = "krama_home_settings";
  const FOOTER_BANNER_DEFAULT = {
    visible: true,
    mobileVisible: false,
    theme: "teal",
    title: "Hiring? Reach 40,000+ verified candidates.",
    message: "Post your first job free and reach thousands of candidates.",
    cta: "Post a job",
    ctaUrl: "",
    image: "../../assets/banners/bg-footerBanner.svg",
    fit: "cover"
  };
  const FOOTER_BANNER_THEMES = {
    teal: {
      bg: "var(--teal-700)",
      fg: "#fff",
      ctaBg: "var(--saffron-500)",
      ctaFg: "#fff"
    },
    saffron: {
      bg: "var(--saffron-500)",
      fg: "#fff",
      ctaBg: "#fff",
      ctaFg: "var(--saffron-700)"
    },
    dark: {
      bg: "var(--stone-900)",
      fg: "#fff",
      ctaBg: "var(--saffron-500)",
      ctaFg: "#fff"
    },
    blank: {
      bg: "var(--surface-card)",
      fg: "var(--text-body)",
      ctaBg: "var(--brand)",
      ctaFg: "#fff"
    },
    transparent: {
      bg: "transparent",
      fg: "var(--text-body)",
      ctaBg: "var(--brand)",
      ctaFg: "#fff"
    }
  };
  function resolveFooterTheme(b) {
    if (b.theme === "custom") return {
      bg: b.customBg || "var(--teal-700)",
      fg: b.customFg || "#fff",
      ctaBg: b.customCtaBg || "var(--saffron-500)",
      ctaFg: b.customCtaFg || "#fff"
    };
    return FOOTER_BANNER_THEMES[b.theme] || FOOTER_BANNER_THEMES.teal;
  }
  function FooterBanner({
    onNav
  }) {
    const t = window.KRAMA_T || function (s) {
      return s;
    };
    const readCache = function () {
      try {
        return JSON.parse(localStorage.getItem(FB_HOME_KEY) || "{}") || {};
      } catch (e) {
        return {};
      }
    };
    const [hs, setHs] = React.useState(readCache);
    React.useEffect(function () {
      if (!window.KRAMA_SETTINGS) return;
      window.KRAMA_SETTINGS("home_content").then(function (d) {
        if (d && d.data) {
          try {
            var p = JSON.parse(d.data);
            try {
              localStorage.setItem(FB_HOME_KEY, JSON.stringify(p));
            } catch (e) {}
            setHs(p);
          } catch (e) {}
        }
      }).catch(function () {});
    }, []);
    const b = Object.assign({}, FOOTER_BANNER_DEFAULT, hs.footerBanner || {});
    if (!b.visible) return null;
    const th = resolveFooterTheme(b);
    const handleCta = function () {
      if (b.ctaUrl) window.open(b.ctaUrl, "_blank");else if (onNav) onNav("register");
    };
    return /*#__PURE__*/React.createElement("section", {
      className: "krm-footer-banner" + (b.mobileVisible === true ? " krm-banner-show-mobile" : ""),
      style: {
        position: "relative",
        background: th.bg,
        overflow: "hidden",
        margin: "0 32px 56px",
        maxWidth: 1136,
        marginLeft: "auto",
        marginRight: "auto",
        borderRadius: "var(--radius-2xl)",
        padding: b.hideText ? 0 : "48px",
        minHeight: b.hideText ? 160 : undefined,
        border: b.theme === "transparent" || b.theme === "blank" ? "1px solid var(--border)" : "none"
      }
    }, b.image ? /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
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
        background: th.bg,
        opacity: (b.imgOverlay != null ? b.imgOverlay : 20) / 100
      }
    })) : /*#__PURE__*/React.createElement("div", {
      style: {
        position: "absolute",
        inset: 0,
        background: "url('../../assets/krama-pattern.svg')",
        backgroundSize: 64,
        opacity: 0.08
      }
    }), !b.hideText && /*#__PURE__*/React.createElement("div", {
      className: "krm-footer-banner-inner",
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
        color: th.fg,
        fontSize: "var(--text-3xl)",
        fontWeight: 700
      }
    }, t(b.title)), b.message && /*#__PURE__*/React.createElement("p", {
      style: {
        color: th.fg,
        opacity: 0.8,
        fontSize: "var(--text-md)",
        marginTop: 10
      }
    }, t(b.message))), b.cta && /*#__PURE__*/React.createElement("button", {
      className: "krm-footer-cta-btn",
      onClick: handleCta,
      style: {
        flexShrink: 0,
        height: 52,
        padding: "0 32px",
        borderRadius: "var(--radius-pill)",
        border: "none",
        background: th.ctaBg,
        color: th.ctaFg,
        fontFamily: "var(--font-sans)",
        fontSize: "var(--text-base)",
        fontWeight: 700,
        cursor: "pointer",
        whiteSpace: "nowrap"
      }
    }, t(b.cta))));
  }
  function Footer({
    onNav
  }) {
    const t = window.KRAMA_T || function (s) {
      return s;
    };
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
    }, t(title)), /*#__PURE__*/React.createElement("div", {
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
    }, t(label)))));
    return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(FooterBanner, {
      onNav: onNav
    }), /*#__PURE__*/React.createElement("footer", {
      className: "krm-footer",
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
      className: "krm-footer-grid",
      style: {
        position: "relative",
        maxWidth: 1200,
        margin: "0 auto",
        display: "grid",
        gridTemplateColumns: "1.4fr 1fr 1fr 1fr",
        gap: 40
      }
    }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        alignItems: "center",
        gap: 9
      }
    }, /*#__PURE__*/React.createElement("img", {
      src: window.getKramaLogo("../../assets/krama-icon.png"),
      height: "34",
      alt: "KRAMA"
    }), /*#__PURE__*/React.createElement("span", {
      style: {
        fontFamily: "var(--font-display)",
        fontWeight: 800,
        fontSize: "var(--text-lg)",
        letterSpacing: ".08em",
        color: "#fff"
      }
    }, window.KRAMA_BRAND_NAME || "KRAMA")), /*#__PURE__*/React.createElement("p", {
      style: {
        color: "var(--text-on-dark-mut)",
        fontSize: "var(--text-sm)",
        marginTop: 16,
        maxWidth: 260,
        lineHeight: 1.6
      }
    }, t("Connecting talent and verified employers across Cambodia and Southeast Asia.")), window.KRAMA_SOCIAL_TELEGRAM || window.KRAMA_SOCIAL_FACEBOOK ? /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        gap: 10,
        marginTop: 18
      }
    }, window.KRAMA_SOCIAL_TELEGRAM ? /*#__PURE__*/React.createElement("a", {
      href: window.KRAMA_SOCIAL_TELEGRAM,
      target: "_blank",
      rel: "noopener noreferrer",
      "aria-label": "Telegram",
      title: "Telegram",
      style: {
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        width: 38,
        height: 38,
        borderRadius: "50%",
        background: "rgba(255,255,255,0.1)",
        color: "#fff",
        transition: "background var(--dur-base) var(--ease-standard)"
      },
      onMouseEnter: e => {
        e.currentTarget.style.background = "#229ED9";
      },
      onMouseLeave: e => {
        e.currentTarget.style.background = "rgba(255,255,255,0.1)";
      }
    }, /*#__PURE__*/React.createElement("svg", {
      width: "19",
      height: "19",
      viewBox: "0 0 24 24",
      fill: "currentColor"
    }, /*#__PURE__*/React.createElement("path", {
      d: "M9.78 18.65l.28-4.23 7.68-6.92c.34-.31-.07-.46-.52-.19L7.74 13.3 3.64 12c-.88-.25-.89-.86.2-1.3l15.97-6.16c.73-.33 1.43.18 1.15 1.3l-2.72 12.81c-.19.91-.74 1.13-1.5.71L12.6 16.3l-1.99 1.93c-.23.23-.42.42-.83.42z"
    }))) : null, window.KRAMA_SOCIAL_FACEBOOK ? /*#__PURE__*/React.createElement("a", {
      href: window.KRAMA_SOCIAL_FACEBOOK,
      target: "_blank",
      rel: "noopener noreferrer",
      "aria-label": "Facebook",
      title: "Facebook",
      style: {
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        width: 38,
        height: 38,
        borderRadius: "50%",
        background: "rgba(255,255,255,0.1)",
        color: "#fff",
        transition: "background var(--dur-base) var(--ease-standard)"
      },
      onMouseEnter: e => {
        e.currentTarget.style.background = "#1877F2";
      },
      onMouseLeave: e => {
        e.currentTarget.style.background = "rgba(255,255,255,0.1)";
      }
    }, /*#__PURE__*/React.createElement("svg", {
      width: "19",
      height: "19",
      viewBox: "0 0 24 24",
      fill: "currentColor"
    }, /*#__PURE__*/React.createElement("path", {
      d: "M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"
    }))) : null) : null), col("For candidates", [["Find jobs", "jobs"], ["Build résumé", "register"], ["Saved jobs", "login"], ["Community", "community"]]), col("Employers", [["Employers", "employers"], ["Post a job", "register"], ["Pricing", "pricing"], ["Companies", "companies"]]), col("Company", [["About us", "about"], ["Contact", "contact"], ["Terms", "terms"], ["Privacy", "privacy"]])), /*#__PURE__*/React.createElement("div", {
      className: "krm-footer-bottom",
      style: {
        position: "relative",
        maxWidth: 1200,
        margin: "32px auto 0",
        paddingTop: 20,
        borderTop: "1px solid rgba(255,255,255,0.1)",
        display: "flex",
        justifyContent: "center",
        textAlign: "center",
        color: "var(--text-on-dark-mut)",
        fontSize: "var(--text-xs)"
      }
    }, /*#__PURE__*/React.createElement("span", null, "\xA9 2026 Krama Job. ", t("All rights reserved.")))));
  }

  // Share a job/company to other platforms. Uses the native share sheet on mobile,
  // else a popover (copy link + Facebook / Telegram / LinkedIn / X). The URL should be
  // the canonical server-rendered page (/jobs/{slug}, /companies/{id}) so the shared
  // link shows a rich preview card.
  function ShareButton({
    url,
    title,
    compact
  }) {
    const [open, setOpen] = React.useState(false);
    const [copied, setCopied] = React.useState(false);
    const ref = React.useRef(null);
    React.useEffect(function () {
      function onDoc(e) {
        if (ref.current && !ref.current.contains(e.target)) setOpen(false);
      }
      if (open) document.addEventListener("mousedown", onDoc);
      return function () {
        document.removeEventListener("mousedown", onDoc);
      };
    }, [open]);
    const enc = encodeURIComponent(url);
    const encT = encodeURIComponent(title || "Krama");
    const links = [{
      k: "Facebook",
      href: "https://www.facebook.com/sharer/sharer.php?u=" + enc
    }, {
      k: "Telegram",
      href: "https://t.me/share/url?url=" + enc + "&text=" + encT
    }, {
      k: "LinkedIn",
      href: "https://www.linkedin.com/sharing/share-offsite/?url=" + enc
    }, {
      k: "X (Twitter)",
      href: "https://twitter.com/intent/tweet?url=" + enc + "&text=" + encT
    }];
    const copy = function () {
      const done = function () {
        setCopied(true);
        setTimeout(function () {
          setCopied(false);
        }, 1800);
      };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(url).then(done).catch(function () {});
      } else {
        try {
          var t = document.createElement("textarea");
          t.value = url;
          document.body.appendChild(t);
          t.select();
          document.execCommand("copy");
          document.body.removeChild(t);
          done();
        } catch (e) {}
      }
    };
    const onMain = function () {
      if (navigator.share) {
        navigator.share({
          title: title || "Krama",
          url: url
        }).catch(function () {});
        return;
      }
      setOpen(function (o) {
        return !o;
      });
    };
    const icon = /*#__PURE__*/React.createElement("svg", {
      width: "16",
      height: "16",
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: "2",
      strokeLinecap: "round",
      strokeLinejoin: "round",
      "aria-hidden": "true"
    }, /*#__PURE__*/React.createElement("circle", {
      cx: "18",
      cy: "5",
      r: "3"
    }), /*#__PURE__*/React.createElement("circle", {
      cx: "6",
      cy: "12",
      r: "3"
    }), /*#__PURE__*/React.createElement("circle", {
      cx: "18",
      cy: "19",
      r: "3"
    }), /*#__PURE__*/React.createElement("line", {
      x1: "8.59",
      y1: "13.51",
      x2: "15.42",
      y2: "17.49"
    }), /*#__PURE__*/React.createElement("line", {
      x1: "15.41",
      y1: "6.51",
      x2: "8.59",
      y2: "10.49"
    }));
    const item = {
      display: "block",
      width: "100%",
      textAlign: "left",
      padding: "9px 14px",
      border: "none",
      background: "transparent",
      cursor: "pointer",
      fontFamily: "var(--font-sans)",
      fontSize: "var(--text-sm)",
      color: "var(--text-body)",
      textDecoration: "none",
      boxSizing: "border-box"
    };
    return /*#__PURE__*/React.createElement("div", {
      ref: ref,
      style: {
        position: "relative",
        display: "inline-block"
      }
    }, /*#__PURE__*/React.createElement("button", {
      onClick: onMain,
      "aria-label": "Share",
      title: "Share",
      style: {
        display: "inline-flex",
        alignItems: "center",
        gap: 7,
        padding: compact ? "9px 12px" : "10px 16px",
        border: "1px solid var(--border)",
        borderRadius: "var(--radius-md)",
        background: "var(--surface-card)",
        color: "var(--text-body)",
        cursor: "pointer",
        fontFamily: "var(--font-sans)",
        fontWeight: 600,
        fontSize: "var(--text-sm)",
        whiteSpace: "nowrap"
      }
    }, icon, !compact && /*#__PURE__*/React.createElement("span", null, "Share")), open && /*#__PURE__*/React.createElement("div", {
      style: {
        position: "absolute",
        right: 0,
        top: "calc(100% + 6px)",
        zIndex: 60,
        minWidth: 190,
        background: "var(--surface-card)",
        border: "1px solid var(--border)",
        borderRadius: "var(--radius-md)",
        boxShadow: "0 10px 30px rgba(0,0,0,0.14)",
        overflow: "hidden",
        padding: "4px 0"
      }
    }, /*#__PURE__*/React.createElement("button", {
      onClick: copy,
      style: Object.assign({}, item, {
        fontWeight: 600,
        color: copied ? "var(--brand)" : "var(--text-strong)"
      })
    }, copied ? "✓ Link copied" : "Copy link"), /*#__PURE__*/React.createElement("div", {
      style: {
        height: 1,
        background: "var(--border)",
        margin: "4px 0"
      }
    }), links.map(function (l) {
      return /*#__PURE__*/React.createElement("a", {
        key: l.k,
        href: l.href,
        target: "_blank",
        rel: "noopener noreferrer",
        onClick: function () {
          setOpen(false);
        },
        style: item,
        onMouseEnter: function (e) {
          e.currentTarget.style.background = "var(--surface-page)";
        },
        onMouseLeave: function (e) {
          e.currentTarget.style.background = "transparent";
        }
      }, l.k);
    })));
  }
  Object.assign(window, {
    KramaHeader: Header,
    KramaFooter: Footer,
    KramaShareButton: ShareButton
  });
})();