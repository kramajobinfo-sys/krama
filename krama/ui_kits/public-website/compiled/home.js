function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
// Home screen -- hero search, categories, featured jobs, companies, stats.
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
  const TR = window.KRAMA_T || function (s) {
    return s;
  };
  const I = (n, s = 20) => /*#__PURE__*/React.createElement("i", {
    "data-lucide": n,
    style: {
      width: s,
      height: s
    }
  });
  // Windowed page numbers: at most `size` (default 5) buttons, centred on the current
  // page and clamped to the ends — so long paginators (Featured jobs, etc.) don't sprawl.
  const pageWindow = (pages, current, size = 5) => {
    if (pages <= size) return Array.from({
      length: pages
    }, (_, i) => i);
    const half = Math.floor(size / 2);
    const start = Math.max(0, Math.min(current - half, pages - size));
    return Array.from({
      length: size
    }, (_, i) => start + i);
  };

  // Compact row for the Featured-jobs List view — matches the Find Jobs list style.
  function CompactJobRow({
    job,
    saved,
    onSave,
    onOpen
  }) {
    return /*#__PURE__*/React.createElement("div", {
      onClick: onOpen,
      style: {
        position: "relative",
        display: "flex",
        alignItems: "center",
        gap: 12,
        background: "var(--surface-card)",
        border: "1px solid " + (job.featured ? "var(--accent-border)" : "var(--border)"),
        borderRadius: "var(--radius-md)",
        boxShadow: "var(--shadow-sm)",
        padding: "11px 14px",
        cursor: "pointer",
        overflow: "hidden"
      }
    }, job.featured ? /*#__PURE__*/React.createElement("span", {
      style: {
        position: "absolute",
        top: 0,
        left: 0,
        bottom: 0,
        width: 3,
        background: "var(--accent)"
      }
    }) : null, /*#__PURE__*/React.createElement(Avatar, {
      src: job.logo || (window.KRAMA_LOGOS || {})[job.company],
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
        fontSize: "var(--text-base)",
        color: "var(--text-strong)",
        whiteSpace: "nowrap",
        overflow: "hidden",
        textOverflow: "ellipsis"
      }
    }, job.title), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: "var(--text-xs)",
        color: "var(--text-muted)",
        whiteSpace: "nowrap",
        overflow: "hidden",
        textOverflow: "ellipsis",
        marginTop: 1
      }
    }, job.company, job.location ? " · " + job.location : ""), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        alignItems: "center",
        gap: 10,
        marginTop: 4
      }
    }, job.salary ? /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: "var(--text-xs)",
        fontWeight: 600,
        color: "var(--text-brand)",
        whiteSpace: "nowrap"
      }
    }, job.salary) : null, job.type ? /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: "var(--text-xs)",
        color: "var(--text-faint)",
        whiteSpace: "nowrap"
      }
    }, job.type) : null)), /*#__PURE__*/React.createElement("button", {
      onClick: e => {
        e.stopPropagation();
        onSave();
      },
      "aria-label": saved ? TR("Saved") : TR("Save job"),
      style: {
        flexShrink: 0,
        background: "none",
        border: "none",
        cursor: "pointer",
        color: saved ? "var(--accent)" : "var(--text-faint)",
        padding: 4,
        display: "inline-flex"
      }
    }, I(saved ? "bookmark-check" : "bookmark", 18)));
  }
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
  function resolveBannerTheme(b) {
    if (b.theme === "custom") return {
      bg: b.customBg || "var(--saffron-500)",
      fg: b.customFg || "#fff",
      ctaBg: b.customCtaBg || "#fff",
      ctaFg: b.customCtaFg || "var(--saffron-700)"
    };
    return BANNER_THEMES[b.theme] || BANNER_THEMES.saffron;
  }
  const TODAY = new Date().toISOString().slice(0, 10);
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
      const t = resolveBannerTheme(b);
      const img = bannerImg(b.image);
      const center = b.align === "center";
      return /*#__PURE__*/React.createElement("div", {
        key: b.id,
        style: {
          position: "relative",
          overflow: "hidden",
          background: t.bg,
          color: t.fg,
          borderBottom: b.theme === "transparent" || b.theme === "blank" ? "1px solid var(--border)" : "none"
        }
      }, img ? /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
        style: {
          position: "absolute",
          inset: 0,
          backgroundImage: "url('" + img + "')",
          backgroundSize: b.fit === "contain" ? "contain" : "cover",
          backgroundRepeat: "no-repeat",
          backgroundPosition: "center"
        }
      }), /*#__PURE__*/React.createElement("div", {
        style: {
          position: "absolute",
          inset: 0,
          background: t.bg,
          opacity: (b.imgOverlay != null ? b.imgOverlay : 20) / 100
        }
      })) : /*#__PURE__*/React.createElement("div", {
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
      }, b.hideText ? /*#__PURE__*/React.createElement("div", {
        style: {
          flex: 1
        }
      }) : /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
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
      }, TR(b.title)), b.message ? /*#__PURE__*/React.createElement("span", {
        style: {
          opacity: 0.92
        }
      }, " -- ", TR(b.message)) : null)), b.cta ? /*#__PURE__*/React.createElement("span", {
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
      }, TR(b.cta)) : null), /*#__PURE__*/React.createElement("button", {
        onClick: () => setDismissed(s => ({
          ...s,
          [b.id]: true
        })),
        "aria-label": "Dismiss",
        style: {
          flexShrink: 0,
          border: "none",
          background: "transparent",
          color: t.fg,
          cursor: "pointer",
          opacity: 0.6,
          display: "inline-flex",
          padding: 4
        }
      }, I("x", 16))));
    }));
  }
  function Section({
    eyebrow,
    title,
    action,
    children
  }) {
    return /*#__PURE__*/React.createElement("section", {
      className: "krm-section",
      style: {
        maxWidth: 1200,
        margin: "0 auto",
        padding: "24px 32px"
      }
    }, /*#__PURE__*/React.createElement("div", {
      className: "krm-section-header",
      style: {
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "space-between",
        marginBottom: 20
      }
    }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      className: "eyebrow",
      style: {
        marginBottom: 6
      }
    }, eyebrow), /*#__PURE__*/React.createElement("h2", {
      style: {
        fontSize: "var(--text-2xl)",
        fontWeight: 700,
        color: "var(--text-strong)"
      }
    }, title)), action), children);
  }
  function TopEmployers({
    onNav,
    settings
  }) {
    let pool = D && D.companies || [];
    if (settings && settings.topVisible === false) return null;
    // Only feature employers that actually have open jobs (admin-controlled; default on).
    if (!settings || settings.topOnlyWithJobs !== false) {
      pool = pool.filter(c => (c.openJobs || 0) > 0);
    }
    const list = settings && settings.topCount ? pool.slice(0, settings.topCount) : pool;
    if (list.length === 0) return null;
    const loop = list.concat(list); // duplicate for seamless scroll
    const dur = Math.max(18, list.length * 3.5); // seconds
    const Tile = (c, i) => /*#__PURE__*/React.createElement("button", {
      key: i,
      onClick: () => onNav("jobs", {
        company: c.name
      }),
      title: c.name,
      style: {
        width: 100,
        height: 100,
        flexShrink: 0,
        border: "1px solid var(--border)",
        borderRadius: "var(--radius-lg)",
        background: "var(--surface-card)",
        boxShadow: "var(--shadow-xs)",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 12,
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
      src: c.logo,
      name: c.name,
      square: true,
      size: 76
    }));
    return /*#__PURE__*/React.createElement("section", {
      style: {
        background: "var(--surface-card)",
        borderBottom: "1px solid var(--border)"
      }
    }, /*#__PURE__*/React.createElement("div", {
      className: "krm-top-inner",
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
    }, TR("Trusted by Cambodia's leading employers")), /*#__PURE__*/React.createElement("h2", {
      style: {
        fontSize: "var(--text-xl)",
        fontWeight: 700,
        color: "var(--text-strong)",
        marginTop: 4
      }
    }, TR("Top employers"))), /*#__PURE__*/React.createElement("div", {
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
  const SLIDE_DEFAULTS = [{
    id: "s1",
    title: "Find work that fits your life",
    subtitle: "Search thousands of roles across Cambodia -- from banking to engineering -- and apply in two clicks.",
    badge: "12,480 open jobs from verified employers",
    theme: "teal",
    image: "../../assets/banners/bg-heroSlide1.svg",
    fit: "cover",
    ctaLabel: "",
    ctaUrl: ""
  }, {
    id: "s2",
    title: "Hiring? Reach top talent fast",
    subtitle: "Post your job and get in front of 40,000+ verified candidates.",
    badge: "Trusted by 500+ companies",
    theme: "saffron",
    image: "../../assets/banners/bg-heroSlide2.svg",
    fit: "cover",
    ctaLabel: "Post a job",
    ctaUrl: ""
  }, {
    id: "s3",
    title: "Get career-matched roles instantly",
    subtitle: "Complete your profile and let AI find the right jobs for you.",
    badge: "Smart job matching",
    theme: "dark",
    image: "../../assets/banners/bg-heroSlide3.svg",
    fit: "cover",
    ctaLabel: "Build profile",
    ctaUrl: ""
  }];
  const SLIDE_THEMES = {
    teal: {
      bg: "var(--teal-800)",
      fg: "#fff",
      ctaBg: "var(--saffron-500)",
      ctaFg: "#fff"
    },
    saffron: {
      bg: "var(--saffron-600)",
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
    brand: {
      bg: "var(--brand-700)",
      fg: "#fff",
      ctaBg: "#fff",
      ctaFg: "var(--brand-700)"
    },
    blank: {
      bg: "var(--surface-card)",
      fg: "var(--text-strong)",
      ctaBg: "var(--brand)",
      ctaFg: "#fff"
    },
    transparent: {
      bg: "var(--surface-page)",
      fg: "var(--text-strong)",
      ctaBg: "var(--brand)",
      ctaFg: "#fff"
    }
  };
  function resolveSlideTheme(slide) {
    if (slide.theme === "custom") return {
      bg: slide.customBg || "var(--teal-800)",
      fg: slide.customFg || "#fff",
      ctaBg: slide.customCtaBg || "var(--saffron-500)",
      ctaFg: slide.customCtaFg || "#fff"
    };
    return SLIDE_THEMES[slide.theme] || SLIDE_THEMES.teal;
  }
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
    const hs = loadHomeSettings();
    const b = Object.assign({}, FOOTER_BANNER_DEFAULT, hs.footerBanner || {});
    if (!b.visible) return null;
    const t = resolveFooterTheme(b);
    const handleCta = () => {
      if (b.ctaUrl) window.open(b.ctaUrl, "_blank");else if (onNav) onNav("register");
    };
    return /*#__PURE__*/React.createElement("section", {
      className: "krm-footer-banner" + (b.mobileVisible === true ? " krm-banner-show-mobile" : ""),
      style: {
        position: "relative",
        background: t.bg,
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
        background: t.bg,
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
        color: t.fg,
        fontSize: "var(--text-3xl)",
        fontWeight: 700
      }
    }, TR(b.title)), b.message && /*#__PURE__*/React.createElement("p", {
      style: {
        color: t.fg,
        opacity: 0.8,
        fontSize: "var(--text-md)",
        marginTop: 10
      }
    }, TR(b.message))), b.cta && /*#__PURE__*/React.createElement("button", {
      className: "krm-footer-cta-btn",
      onClick: handleCta,
      style: {
        flexShrink: 0,
        height: 52,
        padding: "0 32px",
        borderRadius: "var(--radius-pill)",
        border: "none",
        background: t.ctaBg,
        color: t.ctaFg,
        fontFamily: "var(--font-sans)",
        fontSize: "var(--text-base)",
        fontWeight: 700,
        cursor: "pointer",
        whiteSpace: "nowrap"
      }
    }, TR(b.cta))));
  }
  function loadSlides() {
    try {
      const s = JSON.parse(localStorage.getItem(HOME_KEY) || "{}");
      return s.heroSlides && s.heroSlides.length ? s.heroSlides : SLIDE_DEFAULTS;
    } catch (e) {
      return SLIDE_DEFAULTS;
    }
  }
  function HeroSlider({
    onNav
  }) {
    const slides = loadSlides();
    const [idx, setIdx] = React.useState(0);
    const [kw, setKw] = React.useState("");
    const [loc, setLoc] = React.useState("");
    const [paused, setPaused] = React.useState(false);
    const [isMobile, setIsMobile] = React.useState(!!(window.matchMedia && window.matchMedia("(max-width: 767px)").matches));
    React.useEffect(() => {
      if (!window.matchMedia) return;
      const mq = window.matchMedia("(max-width: 767px)");
      const on = () => setIsMobile(mq.matches);
      mq.addEventListener ? mq.addEventListener("change", on) : mq.addListener(on);
      return () => {
        mq.removeEventListener ? mq.removeEventListener("change", on) : mq.removeListener(on);
      };
    }, []);
    const search = () => onNav("jobs", {
      keyword: kw,
      location: loc
    });
    const onKey = e => {
      if (e.key === "Enter") search();
    };
    const prev = () => setIdx(i => (i - 1 + slides.length) % slides.length);
    const next = () => setIdx(i => (i + 1) % slides.length);
    React.useEffect(() => {
      if (paused || slides.length <= 1) return;
      const t = setInterval(next, 5000);
      return () => clearInterval(t);
    }, [paused, slides.length, idx]);
    React.useEffect(() => {
      if (window.lucide) window.lucide.createIcons();
    });
    const slide = slides[idx] || slides[0];
    const t = resolveSlideTheme(slide);
    const heroImg = slide.image;
    // Image-only ad slide: show the full poster as-is (no crop, no overlaid text/search).
    const imageOnly = !!(slide.imageOnly && heroImg);
    const hasHeroImg = !!slide.image;
    // Title hidden per-device (hideTitleDesktop / hideTitleMobile; legacy hideTitle hides on both).
    const titleHidden = isMobile ? slide.hideTitleMobile || slide.hideTitle : slide.hideTitleDesktop || slide.hideTitle;
    const showTitle = !imageOnly && !titleHidden;
    // Search overlays the banner; optional desktop-only (hidden on phones — search lives in the bottom menu).
    const showSearch = !imageOnly && !slide.hideSearch && !(isMobile && slide.searchDesktopOnly);
    const hasOverlay = showTitle || showSearch;
    return /*#__PURE__*/React.createElement("section", {
      className: "krm-hero" + (hasHeroImg ? " krm-hero--has-img" : "") + (imageOnly ? " krm-hero--image-only" : ""),
      style: {
        position: "relative",
        overflow: "hidden",
        background: t.bg,
        minHeight: hasHeroImg ? 0 : isMobile ? 260 : 360,
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        padding: 0,
        transition: "background 0.5s ease"
      },
      onMouseEnter: () => setPaused(true),
      onMouseLeave: () => setPaused(false)
    }, slide.image ? /*#__PURE__*/React.createElement("img", {
      src: heroImg,
      alt: TR(slide.title) || "Banner",
      onClick: () => {
        if (imageOnly && slide.ctaUrl) window.open(slide.ctaUrl, "_blank");
      },
      style: {
        position: "relative",
        zIndex: 1,
        display: "block",
        width: "100%",
        height: imageOnly || isMobile ? "auto" : 360,
        objectFit: "cover",
        cursor: imageOnly && slide.ctaUrl ? "pointer" : "default"
      }
    }) : /*#__PURE__*/React.createElement("div", {
      style: {
        position: "absolute",
        inset: 0,
        background: "url('../../assets/krama-pattern.svg')",
        backgroundSize: 80,
        opacity: 0.08
      }
    }), hasOverlay && /*#__PURE__*/React.createElement("div", {
      style: {
        position: "absolute",
        inset: 0,
        zIndex: 2,
        background: t.bg,
        opacity: (slide.imgOverlay != null ? slide.imgOverlay : 25) / 100
      }
    }), hasOverlay && /*#__PURE__*/React.createElement("div", {
      style: {
        position: "absolute",
        inset: 0,
        zIndex: 3,
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        padding: "24px 16px"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        maxWidth: 1200,
        width: "100%",
        margin: "0 auto",
        textAlign: "center"
      }
    }, showTitle && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("h1", {
      style: {
        color: t.fg,
        fontSize: slide.titleSize || "var(--text-6xl)",
        fontWeight: 800,
        letterSpacing: "-0.03em",
        lineHeight: 1.05,
        textShadow: "0 2px 14px rgba(0,0,0,0.28)"
      }
    }, TR(slide.title)), slide.subtitle && /*#__PURE__*/React.createElement("p", {
      style: {
        color: t.fg,
        opacity: 0.92,
        fontSize: "var(--text-lg)",
        marginTop: 18,
        maxWidth: 560,
        marginLeft: "auto",
        marginRight: "auto",
        textShadow: "0 1px 10px rgba(0,0,0,0.28)"
      }
    }, TR(slide.subtitle)), slide.ctaLabel && /*#__PURE__*/React.createElement("div", {
      style: {
        marginTop: 24
      }
    }, /*#__PURE__*/React.createElement("button", {
      onClick: () => {
        if (slide.ctaUrl) window.open(slide.ctaUrl, "_blank");else onNav("jobs");
      },
      style: {
        background: t.ctaBg,
        color: t.ctaFg,
        border: "none",
        borderRadius: "var(--radius-lg)",
        padding: "12px 28px",
        fontSize: "var(--text-base)",
        fontWeight: 700,
        cursor: "pointer",
        fontFamily: "var(--font-sans)"
      }
    }, TR(slide.ctaLabel)))), showSearch && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
      className: "krm-search-bar",
      style: {
        display: "flex",
        gap: 8,
        background: "#fff",
        padding: 8,
        borderRadius: "var(--radius-lg)",
        boxShadow: "var(--shadow-lg)",
        marginTop: showTitle ? 32 : 0,
        maxWidth: 920,
        marginLeft: "auto",
        marginRight: "auto"
      }
    }, /*#__PURE__*/React.createElement("div", {
      className: "krm-search-input",
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
      placeholder: TR("Job title or keyword"),
      style: {
        flex: 1,
        border: "none",
        outline: "none",
        fontFamily: "var(--font-sans)",
        fontSize: "var(--text-base)",
        color: "var(--text-strong)"
      }
    })), /*#__PURE__*/React.createElement("div", {
      className: "krm-search-divider",
      style: {
        width: 1,
        background: "var(--border)"
      }
    }), /*#__PURE__*/React.createElement("div", {
      className: "krm-search-input",
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
      placeholder: TR("City or province"),
      style: {
        flex: 1,
        border: "none",
        outline: "none",
        fontFamily: "var(--font-sans)",
        fontSize: "var(--text-base)",
        color: "var(--text-strong)"
      }
    })), /*#__PURE__*/React.createElement(Button, {
      className: "krm-search-btn",
      variant: "primary",
      size: "lg",
      onClick: search
    }, TR("Search"))), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        gap: 8,
        justifyContent: "center",
        marginTop: 20,
        flexWrap: "wrap"
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        color: t.fg,
        opacity: 0.7,
        fontSize: "var(--text-sm)",
        marginRight: 4
      }
    }, TR("Popular:")), ["Accountant", "Engineer", "Sales", "Designer"].map(tag => /*#__PURE__*/React.createElement("span", {
      key: tag,
      onClick: () => onNav("jobs", {
        keyword: tag
      }),
      style: {
        color: t.fg,
        fontSize: "var(--text-sm)",
        fontWeight: 500,
        padding: "4px 12px",
        border: "1px solid " + (t.fg === "#fff" ? "rgba(255,255,255,0.25)" : "rgba(0,0,0,0.15)"),
        borderRadius: "var(--radius-pill)",
        cursor: "pointer"
      }
    }, tag)))))), slides.length > 1 && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("button", {
      onClick: prev,
      style: {
        position: "absolute",
        left: 20,
        top: "50%",
        transform: "translateY(-50%)",
        width: 40,
        height: 40,
        borderRadius: "50%",
        background: "rgba(255,255,255,0.18)",
        border: "1px solid rgba(255,255,255,0.25)",
        color: "#fff",
        cursor: "pointer",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center"
      }
    }, I("chevron-left", 20)), /*#__PURE__*/React.createElement("button", {
      onClick: next,
      style: {
        position: "absolute",
        right: 20,
        top: "50%",
        transform: "translateY(-50%)",
        width: 40,
        height: 40,
        borderRadius: "50%",
        background: "rgba(255,255,255,0.18)",
        border: "1px solid rgba(255,255,255,0.25)",
        color: "#fff",
        cursor: "pointer",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center"
      }
    }, I("chevron-right", 20)), /*#__PURE__*/React.createElement("div", {
      style: {
        position: "absolute",
        bottom: 18,
        left: "50%",
        transform: "translateX(-50%)",
        display: "flex",
        gap: 8
      }
    }, slides.map((_, i) => /*#__PURE__*/React.createElement("button", {
      key: i,
      onClick: () => setIdx(i),
      style: {
        width: i === idx ? 28 : 8,
        height: 8,
        borderRadius: "var(--radius-pill)",
        background: i === idx ? "#fff" : "rgba(255,255,255,0.4)",
        border: "none",
        cursor: "pointer",
        transition: "all 0.3s ease",
        padding: 0
      }
    })))));
  }

  // Shared compact company tile for the 3-column MOBILE grids — home Featured/Premium AND the
  // Companies directory page (jobs.jsx). The full DS CompanyCard (logo 64 + industry + location +
  // roles badges) is far too tall/wide for 3 columns on a phone, so this slim tile (logo 44 +
  // 2-line name + role count) is used instead. `premium` adds the gold border + PREMIUM ribbon.
  // Exposed on window so jobs.jsx can render the identical tile.
  function CompactCompany({
    company: c,
    premium,
    onNav
  }) {
    return /*#__PURE__*/React.createElement("button", {
      onClick: () => onNav("company", {
        companyId: c.id
      }),
      style: {
        position: "relative",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 6,
        textAlign: "center",
        padding: "14px 6px 12px",
        minWidth: 0,
        cursor: "pointer",
        background: "var(--surface-card)",
        borderRadius: "var(--radius-lg)",
        border: premium ? "1px solid #D9A521" : "1px solid var(--border)",
        boxShadow: premium ? "0 2px 4px rgba(190,140,25,0.18), 0 5px 14px rgba(190,140,25,0.28)" : "var(--shadow-sm)"
      }
    }, premium ? /*#__PURE__*/React.createElement("span", {
      style: {
        position: "absolute",
        top: -8,
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: 3,
        background: "linear-gradient(180deg,#F7CE63,#D99A1F)",
        color: "#4a3300",
        fontSize: 8,
        fontWeight: 800,
        letterSpacing: ".05em",
        padding: "2px 7px",
        borderRadius: 999,
        boxShadow: "0 2px 6px rgba(200,150,30,0.55)",
        whiteSpace: "nowrap"
      }
    }, "\u2605 PREMIUM") : null, /*#__PURE__*/React.createElement(Avatar, {
      src: c.logo,
      name: c.name,
      square: true,
      size: 44
    }), /*#__PURE__*/React.createElement("span", {
      style: {
        fontFamily: "var(--font-display)",
        fontWeight: 700,
        fontSize: 11,
        lineHeight: 1.2,
        color: "var(--text-strong)",
        display: "-webkit-box",
        WebkitLineClamp: 2,
        WebkitBoxOrient: "vertical",
        overflow: "hidden",
        width: "100%"
      }
    }, c.name), /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 9.5,
        fontWeight: 600,
        color: "var(--text-brand)"
      }
    }, c.openJobs || 0, " ", c.openJobs === 1 ? TR("role") : TR("roles")));
  }
  window.KramaCompactCompany = CompactCompany;
  function Home({
    onNav,
    onOpenJob,
    saved,
    toggleSave
  }) {
    const [hs, setHs] = React.useState(loadHomeSettings);
    React.useEffect(function () {
      // Shared promise, already in flight from api.js init() — see window.KRAMA_SETTINGS.
      // Doing our own fetch here meant an extra round trip after everything else settled.
      window.KRAMA_SETTINGS('home_content').then(function (d) {
        if (d && d.data) {
          try {
            var parsed = JSON.parse(d.data);
            try {
              localStorage.setItem(HOME_KEY, JSON.stringify(parsed));
            } catch (e) {}
            setHs(parsed);
          } catch (e) {}
        }
      }).catch(function () {});
    }, []);
    const [fjPage, setFjPage] = React.useState(0);
    const [fcPage, setFcPage] = React.useState(0);
    // Categories: paged on desktop, progressively revealed on mobile (see CAT_PER_* below).
    const [catPage, setCatPage] = React.useState(0);
    const [catShown, setCatShown] = React.useState(8);
    // Default view is device-aware: List on mobile (compact rows), Grid on desktop.
    const [fjView, setFjView] = React.useState(function () {
      try {
        return window.matchMedia("(max-width: 767px)").matches ? "list" : "grid";
      } catch (e) {
        return "grid";
      }
    });
    // Featured jobs: desktop = grid + paginator (in place); mobile = infinite scroll (10 at a time), moved to page bottom.
    const [isMobile, setIsMobile] = React.useState(function () {
      try {
        return window.matchMedia("(max-width: 767px)").matches;
      } catch (e) {
        return false;
      }
    });
    React.useEffect(function () {
      var mq;
      try {
        mq = window.matchMedia("(max-width: 767px)");
      } catch (e) {
        return;
      }
      var on = function () {
        setIsMobile(mq.matches);
      };
      mq.addEventListener ? mq.addEventListener("change", on) : mq.addListener(on);
      return function () {
        mq.removeEventListener ? mq.removeEventListener("change", on) : mq.removeListener(on);
      };
    }, []);
    const [fjShown, setFjShown] = React.useState(10);
    const fjSentinelRef = React.useRef(null);
    const showFeaturedJobs = hs.featuredJobsVisible !== false;
    const FJ_PER_PAGE = hs.featuredJobsCount || 8;
    // Featured companies per page — admin-configurable, separate mobile vs desktop counts so
    // each grid tiles evenly (mobile = 3 cols, desktop = 4 cols).
    const FC_PER_PAGE = isMobile ? hs.featuredCountMobile || 9 : hs.featuredCount || 8;
    const CAT_PER_PAGE = isMobile ? 8 : 12; // categories per page (numbered pagination on all sizes)
    const CAT_PER_LOAD = 8; // mobile: how many more each "Load more" reveals
    // featured-first ordering across all jobs, then paginate
    // Age in minutes parsed from the relative "postedAt" string (works for static + API data)
    const fjAge = s => {
      if (!s) return Infinity;
      s = String(s).toLowerCase();
      if (s.indexOf("yesterday") >= 0) return 1440;
      if (s.indexOf("now") >= 0 || s.indexOf("just") >= 0) return 0;
      const m = s.match(/(\d+)\s*([mhdw])/);
      if (!m) return Infinity;
      return parseInt(m[1], 10) * ({
        m: 1,
        h: 60,
        d: 1440,
        w: 10080
      }[m[2]] || 1e9);
    };
    // Featured first, then newest first (descending date)
    const fjAll = D && D.jobs ? D.jobs.slice().sort((a, b) => {
      const fa = a.featured ? 0 : 1,
        fb = b.featured ? 0 : 1;
      return fa !== fb ? fa - fb : fjAge(a.postedAt) - fjAge(b.postedAt);
    }) : [];
    const fjPages = Math.max(1, Math.ceil(fjAll.length / FJ_PER_PAGE));
    const fjPageSafe = Math.min(fjPage, fjPages - 1);
    const fjSlice = fjAll.slice(fjPageSafe * FJ_PER_PAGE, fjPageSafe * FJ_PER_PAGE + FJ_PER_PAGE);
    // Mobile infinite scroll — load 10 more when the end-sentinel nears the viewport bottom
    React.useEffect(function () {
      if (!isMobile) return;
      var onScroll = function () {
        var el = fjSentinelRef.current;
        if (!el) return;
        var r = el.getBoundingClientRect();
        if (r.top - window.innerHeight < 300) setFjShown(function (n) {
          return Math.min(n + 10, fjAll.length);
        });
      };
      window.addEventListener("scroll", onScroll, {
        passive: true
      });
      onScroll();
      return function () {
        window.removeEventListener("scroll", onScroll);
      };
    }, [isMobile, fjShown, fjAll.length]);
    // map home category labels to Find-jobs filter values
    const CAT_FILTER = {
      "Information Technology": "IT",
      "Human Resources": "HR"
    };
    const toFilter = name => CAT_FILTER[name] || name;
    // respect admin's category visibility selection (null = show all)
    const allCats = D && D.categories || [];
    const visibleCats = hs.visibleCategories && hs.visibleCategories.length ? allCats.filter(function (c) {
      return hs.visibleCategories.includes(c.slug);
    }) : allCats;
    // The catalogue outgrew a single grid, so show a slice: numbered pages on desktop,
    // a "Load more" step on mobile where pagination controls are fiddly to tap.
    const catPages = Math.max(1, Math.ceil(visibleCats.length / CAT_PER_PAGE));
    const catPageSafe = Math.min(catPage, catPages - 1);
    const catShownSafe = Math.min(catShown, visibleCats.length);
    const catSlice = visibleCats.slice(catPageSafe * CAT_PER_PAGE, catPageSafe * CAT_PER_PAGE + CAT_PER_PAGE);
    const catMoreLeft = visibleCats.length - catShownSafe;
    // featured companies: admin selection (fallback to all), respect visibility
    const allCompanies = D && D.companies || [];
    // Premium featured: admin-selected paid tier (manual until employer subscriptions exist),
    // capped at the admin limit, shown ABOVE regular Featured with a gold highlight.
    const premiumNames = hs.premiumFeatured && hs.premiumFeatured.length ? hs.premiumFeatured : [];
    const premiumLimit = hs.premiumFeaturedLimit || 10; // business slot cap = desktop show count
    // How many premium companies to display, per device. Desktop uses the slot limit;
    // mobile can be capped smaller (falls back to the slot limit when unset).
    const premiumShow = isMobile ? Math.min(premiumLimit, hs.premiumFeaturedCountMobile || premiumLimit) : premiumLimit;
    const premiumSet = new Set(premiumNames);
    // A company is premium if it holds a paid slot (c.isPremium) OR the admin comped it by name.
    const isPrem = c => c.isPremium || premiumSet.has(c.name);
    const premiumList = allCompanies.filter(isPrem).slice(0, premiumShow);
    const showPremium = hs.premiumFeaturedVisible !== false && premiumList.length > 0;
    const featuredNames = hs.featured && hs.featured.length ? hs.featured : null;
    // Regular Featured excludes anything already promoted to Premium so a company never appears twice.
    const featuredList = (featuredNames ? allCompanies.filter(c => featuredNames.includes(c.name)) : allCompanies).filter(c => !isPrem(c));
    const showFeatured = hs.featuredVisible !== false;
    const fcPages = Math.max(1, Math.ceil(featuredList.length / FC_PER_PAGE));
    const fcPageSafe = Math.min(fcPage, fcPages - 1);
    const fcSlice = featuredList.slice(fcPageSafe * FC_PER_PAGE, fcPageSafe * FC_PER_PAGE + FC_PER_PAGE);

    // Compact tile for the 3-column mobile grid — shared with the Companies page (see CompactCompany).
    const compactCompany = (c, premium) => /*#__PURE__*/React.createElement(CompactCompany, {
      key: c.name,
      company: c,
      premium: premium,
      onNav: onNav
    });

    // Featured jobs section — rendered in place on desktop, at the page bottom on mobile.
    const fjSection = showFeaturedJobs ? /*#__PURE__*/React.createElement("div", {
      style: {
        background: "var(--surface-card)",
        borderTop: "1px solid var(--border)",
        borderBottom: "1px solid var(--border)"
      }
    }, /*#__PURE__*/React.createElement(Section, {
      eyebrow: TR("Hand-picked"),
      title: TR("Featured jobs"),
      action: /*#__PURE__*/React.createElement(Button, {
        variant: "ghost",
        onClick: () => onNav("jobs"),
        iconRight: I("arrow-right", 16)
      }, TR("View all jobs"))
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        justifyContent: "flex-end",
        marginBottom: 16
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        gap: 2,
        padding: 3,
        background: "var(--surface-sunken)",
        borderRadius: "var(--radius-md)"
      }
    }, [["list", "list", "List"], ["grid", "layout-grid", "Grid"]].map(([val, ic, label]) => {
      const on = fjView === val;
      return /*#__PURE__*/React.createElement("button", {
        key: val,
        onClick: () => setFjView(val),
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
    }))), isMobile ?
    /*#__PURE__*/
    /* MOBILE — infinite scroll, 10 at a time */
    React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
      className: fjView === "grid" ? "krm-job-grid" : "",
      style: fjView === "grid" ? {
        display: "grid",
        gridTemplateColumns: "1fr",
        gap: 12
      } : {
        display: "flex",
        flexDirection: "column",
        gap: 10
      }
    }, fjAll.slice(0, fjShown).map(j => fjView === "list" ? /*#__PURE__*/React.createElement(CompactJobRow, {
      key: j.id,
      job: j,
      saved: saved.includes(j.id),
      onSave: () => toggleSave(j.id),
      onOpen: () => onOpenJob(j)
    }) : /*#__PURE__*/React.createElement(JobCard, _extends({
      key: j.id
    }, j, {
      saved: saved.includes(j.id),
      onSave: () => toggleSave(j.id),
      onClick: () => onOpenJob(j)
    })))), fjShown < fjAll.length ? /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
      ref: fjSentinelRef,
      style: {
        height: 1
      }
    }), /*#__PURE__*/React.createElement("div", {
      style: {
        textAlign: "center",
        padding: "18px 0 4px",
        color: "var(--text-muted)",
        fontSize: "var(--text-sm)"
      }
    }, TR("Loading more jobs…"))) : /*#__PURE__*/React.createElement("div", {
      style: {
        textAlign: "center",
        padding: "18px 0 4px",
        color: "var(--text-faint)",
        fontSize: "var(--text-sm)"
      }
    }, TR("You've reached the end"))) :
    /*#__PURE__*/
    /* DESKTOP — grid or compact list + page-number paginator */
    React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
      className: fjView === "grid" ? "krm-job-grid krm-job-grid--2col" : "",
      style: fjView === "grid" ? {
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: 16
      } : {
        display: "flex",
        flexDirection: "column",
        gap: 12
      }
    }, fjSlice.map(j => fjView === "list" ? /*#__PURE__*/React.createElement(CompactJobRow, {
      key: j.id,
      job: j,
      saved: saved.includes(j.id),
      onSave: () => toggleSave(j.id),
      onOpen: () => onOpenJob(j)
    }) : /*#__PURE__*/React.createElement(JobCard, _extends({
      key: j.id
    }, j, {
      saved: saved.includes(j.id),
      onSave: () => toggleSave(j.id),
      onClick: () => onOpenJob(j)
    })))), fjPages > 1 ? /*#__PURE__*/React.createElement("div", {
      className: "krm-pagination",
      style: {
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexWrap: "wrap",
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
    }, I("chevron-left", 18)), pageWindow(fjPages, fjPageSafe).map(i => /*#__PURE__*/React.createElement("button", {
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
    }, I("chevron-right", 18))) : null))) : null;
    return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(PromoBannerStack, {
      onNav: onNav
    }), /*#__PURE__*/React.createElement(HeroSlider, {
      onNav: onNav
    }), /*#__PURE__*/React.createElement(TopEmployers, {
      onNav: onNav,
      settings: hs
    }), /*#__PURE__*/React.createElement(Section, {
      eyebrow: TR("Browse by field"),
      title: TR("Explore job categories")
    }, /*#__PURE__*/React.createElement("div", {
      className: "krm-cat-grid",
      style: {
        display: "grid",
        gridTemplateColumns: "repeat(3,1fr)",
        gap: 10
      }
    }, catSlice.map(c => /*#__PURE__*/React.createElement("button", {
      key: c.name,
      onClick: () => onNav("jobs", {
        category: toFilter(c.name)
      }),
      style: {
        display: "flex",
        alignItems: "center",
        gap: 10,
        width: "100%",
        textAlign: "left",
        padding: "11px 13px",
        border: "1px solid var(--border)",
        borderRadius: "var(--radius-md)",
        background: "var(--surface-card)",
        cursor: "pointer",
        transition: "border-color var(--dur-base) var(--ease-standard), background var(--dur-base) var(--ease-standard)"
      },
      onMouseEnter: e => {
        e.currentTarget.style.borderColor = "var(--border-strong)";
        e.currentTarget.style.background = "var(--surface-sunken)";
      },
      onMouseLeave: e => {
        e.currentTarget.style.borderColor = "var(--border)";
        e.currentTarget.style.background = "var(--surface-card)";
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        width: 34,
        height: 34,
        flexShrink: 0,
        borderRadius: "var(--radius-sm)",
        background: "var(--brand-subtle)",
        color: "var(--brand)"
      }
    }, I(c.icon, 18)), /*#__PURE__*/React.createElement("span", {
      style: {
        flex: 1,
        minWidth: 0,
        fontWeight: 600,
        color: "var(--text-strong)",
        fontSize: "var(--text-base)",
        whiteSpace: "nowrap",
        overflow: "hidden",
        textOverflow: "ellipsis"
      }
    }, c.name), /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: "var(--text-sm)",
        color: "var(--text-muted)",
        whiteSpace: "nowrap"
      }
    }, c.count.toLocaleString(), " jobs")))), catPages > 1 ? /*#__PURE__*/React.createElement("div", {
      className: "krm-pagination",
      style: {
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexWrap: "wrap",
        gap: 8,
        marginTop: 28
      }
    }, /*#__PURE__*/React.createElement("button", {
      onClick: () => setCatPage(Math.max(0, catPageSafe - 1)),
      disabled: catPageSafe === 0,
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
        cursor: catPageSafe === 0 ? "not-allowed" : "pointer",
        color: catPageSafe === 0 ? "var(--text-faint)" : "var(--text-body)"
      }
    }, I("chevron-left", 18)), pageWindow(catPages, catPageSafe).map(i => /*#__PURE__*/React.createElement("button", {
      key: i,
      onClick: () => setCatPage(i),
      style: {
        minWidth: 40,
        height: 40,
        padding: "0 12px",
        borderRadius: "var(--radius-md)",
        cursor: "pointer",
        border: "1px solid " + (i === catPageSafe ? "var(--brand)" : "var(--border-strong)"),
        background: i === catPageSafe ? "var(--brand)" : "var(--surface-card)",
        color: i === catPageSafe ? "var(--on-brand)" : "var(--text-body)",
        fontFamily: "var(--font-sans)",
        fontSize: "var(--text-sm)",
        fontWeight: 700
      }
    }, i + 1)), /*#__PURE__*/React.createElement("button", {
      onClick: () => setCatPage(Math.min(catPages - 1, catPageSafe + 1)),
      disabled: catPageSafe === catPages - 1,
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
        cursor: catPageSafe === catPages - 1 ? "not-allowed" : "pointer",
        color: catPageSafe === catPages - 1 ? "var(--text-faint)" : "var(--text-body)"
      }
    }, I("chevron-right", 18))) : null), showPremium ? /*#__PURE__*/React.createElement(Section, {
      eyebrow: TR("Premium"),
      title: TR("Premium featured companies"),
      action: /*#__PURE__*/React.createElement(Button, {
        variant: "ghost",
        onClick: () => onNav("companies"),
        iconRight: I("arrow-right", 16)
      }, TR("All companies"))
    }, /*#__PURE__*/React.createElement("div", {
      className: "krm-company-grid",
      style: {
        display: "grid",
        gridTemplateColumns: "repeat(4,1fr)",
        gap: 16
      }
    }, premiumList.map(c => isMobile ? compactCompany(c, true) : /*#__PURE__*/React.createElement("div", {
      key: c.name,
      style: {
        position: "relative",
        display: "grid"
      }
    }, /*#__PURE__*/React.createElement(CompanyCard, _extends({}, c, {
      onClick: () => onNav("company", {
        companyId: c.id
      }),
      style: {
        border: "1px solid #D9A521",
        boxShadow: "0 2px 4px rgba(190,140,25,0.18), 0 6px 18px rgba(190,140,25,0.30)"
      }
    })), /*#__PURE__*/React.createElement("span", {
      style: {
        position: "absolute",
        top: -9,
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: 3,
        background: "linear-gradient(180deg,#F7CE63,#D99A1F)",
        color: "#4a3300",
        fontSize: 10,
        fontWeight: 800,
        letterSpacing: ".08em",
        padding: "3px 11px",
        borderRadius: 999,
        boxShadow: "0 2px 8px rgba(200,150,30,0.55)",
        whiteSpace: "nowrap"
      }
    }, "\u2605 PREMIUM"))))) : null, showFeatured ? /*#__PURE__*/React.createElement(Section, {
      eyebrow: TR("Trusted by"),
      title: TR("Featured companies"),
      action: /*#__PURE__*/React.createElement(Button, {
        variant: "ghost",
        onClick: () => onNav("companies"),
        iconRight: I("arrow-right", 16)
      }, TR("All companies"))
    }, /*#__PURE__*/React.createElement("div", {
      className: "krm-company-grid",
      style: {
        display: "grid",
        gridTemplateColumns: "repeat(4,1fr)",
        gap: 16
      }
    }, fcSlice.map(c => isMobile ? compactCompany(c, false) : /*#__PURE__*/React.createElement(CompanyCard, _extends({
      key: c.name
    }, c, {
      onClick: () => onNav("company", {
        companyId: c.id
      })
    })))), fcPages > 1 ? /*#__PURE__*/React.createElement("div", {
      className: "krm-pagination",
      style: {
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexWrap: "wrap",
        gap: 8,
        marginTop: 28
      }
    }, /*#__PURE__*/React.createElement("button", {
      onClick: () => setFcPage(Math.max(0, fcPageSafe - 1)),
      disabled: fcPageSafe === 0,
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
        cursor: fcPageSafe === 0 ? "not-allowed" : "pointer",
        color: fcPageSafe === 0 ? "var(--text-faint)" : "var(--text-body)"
      }
    }, I("chevron-left", 18)), pageWindow(fcPages, fcPageSafe).map(i => /*#__PURE__*/React.createElement("button", {
      key: i,
      onClick: () => setFcPage(i),
      style: {
        minWidth: 40,
        height: 40,
        padding: "0 12px",
        borderRadius: "var(--radius-md)",
        cursor: "pointer",
        border: "1px solid " + (i === fcPageSafe ? "var(--brand)" : "var(--border-strong)"),
        background: i === fcPageSafe ? "var(--brand)" : "var(--surface-card)",
        color: i === fcPageSafe ? "var(--on-brand)" : "var(--text-body)",
        fontFamily: "var(--font-sans)",
        fontSize: "var(--text-sm)",
        fontWeight: 700
      }
    }, i + 1)), /*#__PURE__*/React.createElement("button", {
      onClick: () => setFcPage(Math.min(fcPages - 1, fcPageSafe + 1)),
      disabled: fcPageSafe === fcPages - 1,
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
        cursor: fcPageSafe === fcPages - 1 ? "not-allowed" : "pointer",
        color: fcPageSafe === fcPages - 1 ? "var(--text-faint)" : "var(--text-body)"
      }
    }, I("chevron-right", 18))) : null) : null, fjSection);
  }
  window.KramaHome = Home;
})();