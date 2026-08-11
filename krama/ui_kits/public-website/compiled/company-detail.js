function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
// Public company profile — About / Jobs / Gallery / Awards + social links.
(function init() {
  if (!window.KramaDesignSystem_1a6f65) {
    return setTimeout(init, 40);
  }
  const {
    Button,
    Badge,
    Avatar,
    Card,
    JobCard,
    EmptyState
  } = window.KramaDesignSystem_1a6f65;
  const TR = window.KRAMA_T || function (s) {
    return s;
  };
  const D = window.KRAMA_DATA;
  const I = (n, s = 18) => /*#__PURE__*/React.createElement("i", {
    "data-lucide": n,
    style: {
      width: s,
      height: s
    }
  });

  // ── Top announcement bar (shared style with Find Jobs / Companies / Job Detail) ──
  const CO_PROFILE_TOP_DEFAULT = {
    visible: true,
    theme: "teal",
    icon: "building-2",
    title: "Looking to hire?",
    message: "List your company on Krama and reach 40,000+ verified candidates.",
    cta: "Post a job",
    ctaUrl: "",
    image: "../../assets/banners/bg-companyProfileTopBanner.svg",
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
  const BAR_THEMES = {
    saffron: {
      bg: "var(--saffron-500)",
      pill: "#fff",
      pillFg: "var(--saffron-700)",
      fg: "#fff"
    },
    teal: {
      bg: "var(--teal-700)",
      pill: "#fff",
      pillFg: "var(--teal-800)",
      fg: "#fff"
    },
    dark: {
      bg: "var(--stone-900)",
      pill: "var(--saffron-500)",
      pillFg: "#fff",
      fg: "#fff"
    },
    brand: {
      bg: "var(--brand-700)",
      pill: "#fff",
      pillFg: "var(--brand-800)",
      fg: "#fff"
    },
    blank: {
      bg: "var(--surface-card)",
      pill: "var(--brand)",
      pillFg: "#fff",
      fg: "var(--text-body)"
    },
    transparent: {
      bg: "transparent",
      pill: "var(--brand)",
      pillFg: "#fff",
      fg: "var(--text-body)"
    }
  };
  function resolveBarTheme(b) {
    if (b.theme === "custom") return {
      bg: b.customBg || "var(--saffron-500)",
      pill: b.customCtaBg || "#fff",
      pillFg: b.customCtaFg || "var(--saffron-700)",
      fg: b.customFg || "#fff"
    };
    const t = BAR_THEMES[b.theme] || BAR_THEMES.teal;
    return b.customFg ? Object.assign({}, t, {
      fg: b.customFg
    }) : t;
  }
  function useHomeContent() {
    const [, setTick] = React.useState(0);
    React.useEffect(function () {
      var apiBase = /^(localhost|127\.0\.0\.1|::1|192\.168\.|10\.)/.test(window.location.hostname) ? 'http://127.0.0.1:8000/api' : window.location.protocol + '//' + window.location.host + '/api';
      fetch(apiBase + '/settings/home_content', {
        cache: 'no-cache'
      }).then(function (r) {
        return r.ok ? r.json() : null;
      }).then(function (d) {
        if (d && d.data) {
          try {
            localStorage.setItem('krama_home_settings', JSON.stringify(JSON.parse(d.data)));
            setTick(1);
          } catch (e) {}
        }
      }).catch(function () {});
    }, []);
  }
  function AnnouncementBar({
    b,
    onNav
  }) {
    const [dismissed, setDismissed] = React.useState(false);
    if (!b || !b.visible || dismissed) return null;
    const t = resolveBarTheme(b);
    const hasImg = !!b.image;
    if (b.hideText && hasImg) {
      return /*#__PURE__*/React.createElement("div", {
        style: {
          position: "relative",
          overflow: "hidden",
          background: t.bg,
          width: "100%",
          aspectRatio: "1600 / 160",
          maxHeight: 160,
          minHeight: 60
        }
      }, /*#__PURE__*/React.createElement("img", {
        src: b.image,
        alt: "",
        style: {
          display: "block",
          width: "100%",
          height: "100%",
          objectFit: "cover"
        }
      }), /*#__PURE__*/React.createElement("button", {
        onClick: () => setDismissed(true),
        "aria-label": "Dismiss",
        style: {
          position: "absolute",
          top: 8,
          right: 12,
          width: 28,
          height: 28,
          borderRadius: "50%",
          background: "rgba(0,0,0,0.35)",
          border: "none",
          color: "#fff",
          cursor: "pointer",
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center"
        }
      }, I("x", 16)));
    }
    return /*#__PURE__*/React.createElement("div", {
      style: {
        position: "relative",
        overflow: "hidden",
        background: t.bg,
        color: t.fg,
        borderBottom: b.theme === "transparent" || b.theme === "blank" ? "1px solid var(--border)" : "none"
      }
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
        display: "flex",
        alignItems: "center",
        gap: 14,
        padding: "10px 32px",
        minHeight: b.hideText ? 28 : undefined
      }
    }, b.hideText ? /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1
      }
    }) : /*#__PURE__*/React.createElement(React.Fragment, null, b.icon && /*#__PURE__*/React.createElement("span", {
      style: {
        display: "inline-flex",
        flexShrink: 0
      }
    }, I(b.icon, 18)), /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1,
        fontSize: "var(--text-sm)",
        fontWeight: 500
      }
    }, /*#__PURE__*/React.createElement("strong", {
      style: {
        fontWeight: 700
      }
    }, TR(b.title)), b.message ? " -- " + TR(b.message) : ""), b.cta && /*#__PURE__*/React.createElement("span", {
      onClick: () => {
        if (b.ctaUrl) window.open(b.ctaUrl, b.ctaUrl.startsWith("http") ? "_blank" : "_self");else onNav && onNav("employers");
      },
      style: {
        flexShrink: 0,
        background: t.pill,
        color: t.pillFg,
        fontSize: "var(--text-sm)",
        fontWeight: 700,
        padding: "7px 16px",
        borderRadius: "var(--radius-pill)",
        cursor: "pointer",
        whiteSpace: "nowrap"
      }
    }, TR(b.cta))), /*#__PURE__*/React.createElement("button", {
      onClick: () => setDismissed(true),
      style: {
        flexShrink: 0,
        background: "transparent",
        border: "none",
        color: t.fg,
        opacity: 0.7,
        cursor: "pointer",
        display: "inline-flex",
        padding: 4
      }
    }, I("x", 16))));
  }
  const SOCIALS = [{
    key: "facebook",
    icon: "facebook",
    bg: "#1877f2"
  }, {
    key: "linkedin",
    icon: "linkedin",
    bg: "#0a66c2"
  }, {
    key: "twitter",
    icon: "twitter",
    bg: "#000000"
  }, {
    key: "instagram",
    icon: "instagram",
    bg: "linear-gradient(135deg,#f09433,#e6683c,#dc2743,#cc2366,#bc1888)"
  }, {
    key: "telegram",
    icon: "send",
    bg: "#229ED9"
  }];
  function SocialIcons({
    links
  }) {
    if (!links) return null;
    const items = SOCIALS.filter(s => links[s.key]);
    if (!items.length) return null;
    return /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        gap: 8
      }
    }, items.map(s => /*#__PURE__*/React.createElement("a", {
      key: s.key,
      href: links[s.key],
      target: "_blank",
      rel: "noopener noreferrer",
      title: s.key,
      style: {
        width: 34,
        height: 34,
        borderRadius: "50%",
        background: s.bg,
        color: "#fff",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        textDecoration: "none"
      }
    }, I(s.icon, 16))));
  }
  function CompanyProfile({
    companyId,
    initialTab,
    onNav,
    onOpenJob,
    saved,
    toggleSave
  }) {
    const summary = (D.companies || []).find(c => String(c.id) === String(companyId)) || {};
    // On phones the company profile leads with Jobs (default tab) and moves About to the end.
    const isMobile = function () {
      try {
        return !!(window.matchMedia && window.matchMedia("(max-width: 767px)").matches);
      } catch (e) {
        return false;
      }
    }();
    const [company, setCompany] = React.useState(null);
    const [companyJobs, setCompanyJobs] = React.useState(null);
    const [loading, setLoading] = React.useState(true);
    const [tab, setTab] = React.useState(initialTab || (isMobile ? "jobs" : "about"));
    const [jobsPage, setJobsPage] = React.useState(0);
    const [jobSearch, setJobSearch] = React.useState("");
    const [galleryPage, setGalleryPage] = React.useState(0);
    // Jobs tab defaults to List view on mobile (grid on larger screens).
    const [jobsView, setJobsView] = React.useState(isMobile ? "list" : "grid");
    const [galleryView, setGalleryView] = React.useState("grid");
    const [awardsView, setAwardsView] = React.useState("grid");
    const [following, setFollowing] = React.useState(false);
    const [followCount, setFollowCount] = React.useState(0);
    const [followBusy, setFollowBusy] = React.useState(false);
    const [revData, setRevData] = React.useState(null);
    const [revLoading, setRevLoading] = React.useState(false);
    const [revPage, setRevPage] = React.useState(1);
    const [reviewForm, setReviewForm] = React.useState({
      open: false,
      rating: 0,
      title: "",
      body: "",
      anon: false
    });
    const [reviewBusy, setReviewBusy] = React.useState(false);
    const [reviewMsg, setReviewMsg] = React.useState("");
    const isLoggedIn = !!window.KRAMA_API.getToken();
    const JOBS_PER = 8;
    const GALLERY_PER = 8;
    React.useEffect(() => {
      let alive = true;
      setLoading(true);
      window.KRAMA_API.fetchCompany(companyId).then(r => {
        if (alive) {
          const co = r && r.company || null;
          setCompany(co);
          setCompanyJobs(r && r.jobs || null);
          if (co && co.follower_count) setFollowCount(co.follower_count);
          setLoading(false);
        }
      }).catch(() => {
        if (alive) setLoading(false);
      });
      return () => {
        alive = false;
      };
    }, [companyId]);
    React.useEffect(() => {
      if (!isLoggedIn) return;
      window.KRAMA_API.checkFollowing(companyId).then(r => {
        setFollowing(!!r.following);
        setFollowCount(r.follower_count || 0);
      }).catch(() => {});
    }, [companyId, isLoggedIn]);
    React.useEffect(() => {
      if (tab !== "reviews") return;
      setRevLoading(true);
      window.KRAMA_API.fetchReviews(companyId, revPage).then(function (d) {
        setRevData(d);
        setRevLoading(false);
      }).catch(function () {
        setRevLoading(false);
      });
    }, [tab, companyId, revPage]);
    React.useEffect(() => {
      if (window.lucide) window.lucide.createIcons();
    });

    // Merge API detail over the directory summary so we render instantly and enrich on load.
    const c = company || {};
    const name = c.name || summary.name || "Company";
    const logo = c.logo_url || summary.logo || (window.KRAMA_LOGOS || {})[name] || null;
    const industry = c.industry || summary.industry || "";
    const location = c.location && c.location.name || summary.location || "";
    const website = c.website || "";
    const address = c.address || "";
    const phone = c.phone || "";
    const contactName = c.contact_name || "";
    const contactEmail = c.contact_email || "";
    const description = c.description || "";
    const aboutImage = c.about_image_url || "";
    const verified = c.is_verified != null ? c.is_verified : !!summary.verified;
    const orgMeta = c.org_status === "verified" && (window.KRAMA_ORG_BADGE || {})[c.org_type] ? window.KRAMA_ORG_BADGE[c.org_type] : null;
    const social = c.social_links || null;
    const gallery = Array.isArray(c.gallery) ? c.gallery : [];
    const awards = Array.isArray(c.awards) ? c.awards : [];
    const coverBanner = c.cover_banner_url || "";
    const companySize = c.company_size || "";
    const parseTags = v => Array.isArray(v) ? v : typeof v === "string" && v ? v.split(",").map(function (s) {
      return s.trim();
    }).filter(Boolean) : [];
    const cultureValues = parseTags(c.culture_values);
    const benefitsTags = parseTags(c.benefits_tags);

    // GET /companies/{id} returns its jobs without the `company` relation (it would just
    // repeat this same parent on every row), so normaliseJob() derives no company name or
    // logo and the cards fell back to a "?" avatar. Backfill from the company we already
    // have on this page — every job here belongs to it by definition.
    const jobs = companyJobs !== null ? companyJobs.map(j => {
      const n = window.KRAMA_API.normaliseJob(j);
      return Object.assign(n, {
        company: n.company || name,
        companyId: n.companyId != null ? n.companyId : companyId,
        logo: n.logo || logo
      });
    }) : (D.jobs || []).filter(j => String(j.companyId) === String(companyId) || j.company === name);
    const jobCount = jobs.length;
    const reviewCount = revData ? revData.stats && revData.stats.count : null;
    const _tabAbout = {
      key: "about",
      label: "About"
    };
    const _tabJobs = {
      key: "jobs",
      label: "Jobs",
      count: jobCount
    };
    const _tabGallery = {
      key: "gallery",
      label: "Gallery",
      count: gallery.length || null
    };
    const _tabAwards = {
      key: "awards",
      label: "Awards",
      count: awards.length || null
    };
    const _tabReviews = {
      key: "reviews",
      label: "Reviews",
      count: reviewCount || null
    };
    // Mobile: Jobs first, About moved to the end (after Reviews). Desktop: original order.
    const TABS = isMobile ? [_tabJobs, _tabGallery, _tabAwards, _tabReviews, _tabAbout] : [_tabAbout, _tabJobs, _tabGallery, _tabAwards, _tabReviews];
    const stripTags = html => (html || "").replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
    useHomeContent();
    return /*#__PURE__*/React.createElement("div", {
      style: {
        background: "var(--surface-page)",
        minHeight: "70vh"
      }
    }, /*#__PURE__*/React.createElement(AnnouncementBar, {
      b: loadBanner("companyProfileTopBanner", CO_PROFILE_TOP_DEFAULT),
      onNav: onNav
    }), /*#__PURE__*/React.createElement("div", {
      className: "krm-co-hero" + (coverBanner ? " krm-co-hero--img" : ""),
      style: {
        position: "relative",
        background: coverBanner ? "var(--surface-sunken)" : "var(--teal-800)",
        overflow: "hidden",
        aspectRatio: "1600 / 360",
        maxHeight: 360
      }
    }, coverBanner ? /*#__PURE__*/React.createElement("img", {
      className: "krm-co-hero-pic",
      src: coverBanner,
      alt: "",
      style: {
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        objectFit: "cover",
        display: "block"
      }
    }) : /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
      style: {
        position: "absolute",
        inset: 0,
        backgroundImage: "url('../../assets/banners/bg-companyProfileHero.svg')",
        backgroundSize: "cover",
        backgroundPosition: "center"
      }
    }), /*#__PURE__*/React.createElement("div", {
      style: {
        position: "absolute",
        inset: 0,
        background: "var(--teal-800)",
        opacity: 0.45
      }
    }))), /*#__PURE__*/React.createElement("div", {
      style: {
        maxWidth: 1080,
        margin: "0 auto",
        padding: "0 32px 56px"
      },
      className: "krm-co-profile-wrap"
    }, /*#__PURE__*/React.createElement("button", {
      onClick: () => onNav("companies"),
      style: {
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        marginTop: 16,
        border: "none",
        background: "transparent",
        cursor: "pointer",
        color: "var(--text-muted)",
        fontFamily: "var(--font-sans)",
        fontSize: "var(--text-sm)",
        fontWeight: 600
      }
    }, I("arrow-left", 15), " All companies"), /*#__PURE__*/React.createElement(Card, {
      padding: 0,
      style: {
        marginTop: 10,
        overflow: "visible"
      }
    }, /*#__PURE__*/React.createElement("div", {
      className: "krm-co-header",
      style: {
        display: "flex",
        gap: 20,
        alignItems: "flex-start",
        padding: "24px 28px"
      }
    }, /*#__PURE__*/React.createElement("div", {
      className: "krm-co-logo",
      style: {
        marginTop: -60,
        flexShrink: 0,
        width: 104,
        height: 104,
        borderRadius: "var(--radius-lg)",
        background: "#fff",
        border: "1px solid var(--border)",
        boxShadow: "var(--shadow-md)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden"
      }
    }, /*#__PURE__*/React.createElement(Avatar, {
      src: logo,
      name: name,
      square: true,
      size: 96
    })), /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1,
        minWidth: 0,
        paddingTop: 4
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        alignItems: "center",
        gap: 10,
        flexWrap: "wrap"
      }
    }, /*#__PURE__*/React.createElement("h1", {
      style: {
        fontFamily: "var(--font-display)",
        fontWeight: 800,
        fontSize: "var(--text-2xl)",
        color: "var(--text-strong)",
        margin: 0
      }
    }, name), verified && /*#__PURE__*/React.createElement(Badge, {
      tone: "success"
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        display: "inline-flex",
        alignItems: "center",
        gap: 4
      }
    }, I("badge-check", 13), " Verified")), orgMeta && /*#__PURE__*/React.createElement("span", {
      title: "Verified " + orgMeta.label,
      style: {
        display: "inline-flex",
        alignItems: "center",
        padding: "3px 10px",
        borderRadius: 999,
        fontSize: "var(--text-xs)",
        fontWeight: 700,
        background: orgMeta.bg,
        color: orgMeta.color
      }
    }, orgMeta.label)), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: "var(--text-sm)",
        color: "var(--text-muted)",
        marginTop: 6,
        display: "flex",
        gap: 16,
        flexWrap: "wrap"
      }
    }, industry && /*#__PURE__*/React.createElement("span", {
      style: {
        display: "inline-flex",
        alignItems: "center",
        gap: 5
      }
    }, I("briefcase", 14), " ", industry), location && /*#__PURE__*/React.createElement("span", {
      style: {
        display: "inline-flex",
        alignItems: "center",
        gap: 5
      }
    }, I("map-pin", 14), " ", location), jobCount > 0 && /*#__PURE__*/React.createElement("span", {
      style: {
        display: "inline-flex",
        alignItems: "center",
        gap: 5
      }
    }, I("circle-user", 14), " ", jobCount, " open role", jobCount === 1 ? "" : "s")), description && /*#__PURE__*/React.createElement("p", {
      style: {
        fontSize: "var(--text-sm)",
        color: "var(--text-body)",
        marginTop: 12,
        lineHeight: 1.6,
        maxWidth: 640
      }
    }, stripTags(description).slice(0, 180), stripTags(description).length > 180 ? "…" : "")), /*#__PURE__*/React.createElement("div", {
      className: "krm-co-header-actions",
      style: {
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-end",
        gap: 12,
        flexShrink: 0
      }
    }, jobCount > 0 && /*#__PURE__*/React.createElement(Button, {
      variant: "primary",
      onClick: () => setTab("jobs")
    }, "View ", jobCount, " job", jobCount === 1 ? "" : "s"), /*#__PURE__*/React.createElement("button", {
      disabled: followBusy,
      onClick: () => {
        if (!isLoggedIn) {
          onNav && onNav("login");
          return;
        }
        setFollowBusy(true);
        const action = following ? window.KRAMA_API.unfollowCompany : window.KRAMA_API.followCompany;
        action(companyId).then(r => {
          setFollowing(!!r.following);
          setFollowCount(r.follower_count || 0);
          setFollowBusy(false);
        }).catch(() => setFollowBusy(false));
      },
      style: {
        display: "inline-flex",
        alignItems: "center",
        gap: 7,
        border: "1px solid " + (following ? "var(--brand)" : "var(--border-strong)"),
        background: following ? "var(--brand-subtle)" : "var(--surface-card)",
        color: following ? "var(--text-brand)" : "var(--text-body)",
        fontFamily: "var(--font-sans)",
        fontWeight: 600,
        fontSize: "var(--text-sm)",
        padding: "8px 16px",
        borderRadius: "var(--radius-md)",
        cursor: followBusy ? "default" : "pointer",
        opacity: followBusy ? 0.7 : 1
      }
    }, I(following ? "heart" : "heart", 15), following ? "Following" : "Follow", followCount > 0 && /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: "var(--text-xs)",
        color: "var(--text-muted)",
        fontWeight: 500
      }
    }, followCount)), window.KramaShareButton && React.createElement(window.KramaShareButton, {
      url: (window.location.origin || "https://kramajob.com") + "/companies/" + companyId,
      title: name + " — Jobs & hiring on Krama",
      compact: false
    }), /*#__PURE__*/React.createElement(SocialIcons, {
      links: social
    }))), /*#__PURE__*/React.createElement("div", {
      className: "krm-co-tabs",
      style: {
        display: "flex",
        alignItems: "center",
        gap: 4,
        padding: "0 28px",
        borderTop: "1px solid var(--border-subtle)"
      }
    }, TABS.map(t => {
      const on = tab === t.key;
      return /*#__PURE__*/React.createElement("button", {
        key: t.key,
        onClick: () => setTab(t.key),
        style: {
          position: "relative",
          display: "inline-flex",
          alignItems: "center",
          gap: 8,
          border: "none",
          background: "transparent",
          cursor: "pointer",
          fontFamily: "var(--font-sans)",
          fontWeight: on ? 700 : 600,
          fontSize: "var(--text-base)",
          color: on ? "var(--text-brand)" : "var(--text-muted)",
          padding: "16px 12px",
          borderBottom: "2px solid " + (on ? "var(--brand)" : "transparent"),
          marginBottom: -1
        }
      }, t.label, t.count != null && t.count !== undefined && t.count > 0 ? /*#__PURE__*/React.createElement("span", {
        className: "krm-co-tab-count" + (t.key === "jobs" ? " krm-co-tab-count--jobs" : ""),
        style: {
          fontSize: "var(--text-xs)",
          fontWeight: 700,
          color: on ? "#fff" : "var(--text-body)",
          background: on ? "var(--brand)" : "var(--surface-sunken)",
          borderRadius: "var(--radius-sm)",
          padding: "1px 7px",
          minWidth: 20,
          textAlign: "center"
        }
      }, t.count) : null);
    }))), /*#__PURE__*/React.createElement("div", {
      style: {
        marginTop: 20
      }
    }, tab === "about" && /*#__PURE__*/React.createElement("div", {
      className: "krm-co-about-grid",
      style: {
        display: "grid",
        gridTemplateColumns: "1fr 300px",
        gap: 20,
        alignItems: "start"
      }
    }, /*#__PURE__*/React.createElement(Card, {
      padding: 24
    }, /*#__PURE__*/React.createElement("h2", {
      style: {
        fontSize: "var(--text-lg)",
        fontWeight: 700,
        color: "var(--text-strong)",
        marginTop: 0,
        marginBottom: 12
      }
    }, "About ", name), aboutImage && /*#__PURE__*/React.createElement("img", {
      src: aboutImage,
      alt: name,
      style: {
        width: "100%",
        maxHeight: 320,
        objectFit: "cover",
        borderRadius: "var(--radius-md)",
        marginBottom: 16,
        display: "block"
      }
    }), description ? /*#__PURE__*/React.createElement("div", {
      className: "krama-rich-body",
      style: {
        fontSize: "var(--text-base)",
        color: "var(--text-body)",
        lineHeight: 1.7
      },
      dangerouslySetInnerHTML: {
        __html: description
      }
    }) : /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: "var(--text-sm)",
        color: "var(--text-muted)"
      }
    }, loading ? "Loading…" : "This company hasn't added a description yet."), c.culture_values && /*#__PURE__*/React.createElement("div", {
      style: {
        marginTop: 20,
        paddingTop: 16,
        borderTop: "1px solid var(--border-subtle)"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: "var(--text-sm)",
        fontWeight: 700,
        color: "var(--text-strong)",
        marginBottom: 10
      }
    }, "Culture & values"), /*#__PURE__*/React.createElement("div", {
      className: "krama-rich-body",
      style: {
        fontSize: "var(--text-base)",
        color: "var(--text-body)",
        lineHeight: 1.7
      },
      dangerouslySetInnerHTML: {
        __html: c.culture_values
      }
    })), benefitsTags.length > 0 && /*#__PURE__*/React.createElement("div", {
      style: {
        marginTop: 16,
        paddingTop: 16,
        borderTop: "1px solid var(--border-subtle)"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: "var(--text-sm)",
        fontWeight: 700,
        color: "var(--text-strong)",
        marginBottom: 10
      }
    }, TR("Benefits")), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        flexWrap: "wrap",
        gap: 8
      }
    }, benefitsTags.map(function (b, i) {
      return /*#__PURE__*/React.createElement("span", {
        key: i,
        style: {
          padding: "4px 12px",
          borderRadius: 99,
          background: "var(--success-subtle)",
          color: "var(--success)",
          fontSize: "var(--text-xs)",
          fontWeight: 600
        }
      }, b);
    })))), /*#__PURE__*/React.createElement(Card, {
      padding: 20
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: "var(--text-sm)",
        fontWeight: 700,
        color: "var(--text-strong)",
        marginBottom: 14
      }
    }, TR("Company details")), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        flexDirection: "column",
        gap: 12
      }
    }, industry && /*#__PURE__*/React.createElement(DetailRow, {
      icon: "briefcase",
      label: TR("Industry"),
      value: industry
    }), location && /*#__PURE__*/React.createElement(DetailRow, {
      icon: "map-pin",
      label: TR("Location"),
      value: location
    }), address && /*#__PURE__*/React.createElement(DetailRow, {
      icon: "building-2",
      label: TR("Address"),
      value: address
    }), companySize && /*#__PURE__*/React.createElement(DetailRow, {
      icon: "users",
      label: TR("Company size"),
      value: companySize
    }), website && /*#__PURE__*/React.createElement(DetailRow, {
      icon: "globe",
      label: TR("Website"),
      value: /*#__PURE__*/React.createElement("a", {
        href: website,
        target: "_blank",
        rel: "noopener noreferrer",
        style: {
          color: "var(--text-brand)",
          textDecoration: "none",
          wordBreak: "break-all"
        }
      }, website.replace(/^https?:\/\//, ""))
    }), phone && /*#__PURE__*/React.createElement(DetailRow, {
      icon: "phone",
      label: TR("Phone"),
      value: /*#__PURE__*/React.createElement("a", {
        href: "tel:" + phone.replace(/\s+/g, ""),
        style: {
          color: "var(--text-brand)",
          textDecoration: "none"
        }
      }, phone)
    }), contactName && /*#__PURE__*/React.createElement(DetailRow, {
      icon: "user",
      label: TR("Contact"),
      value: contactName
    }), contactEmail && /*#__PURE__*/React.createElement(DetailRow, {
      icon: "mail",
      label: TR("Email"),
      value: /*#__PURE__*/React.createElement("a", {
        href: "mailto:" + contactEmail,
        style: {
          color: "var(--text-brand)",
          textDecoration: "none",
          wordBreak: "break-all"
        }
      }, contactEmail)
    })), social && SOCIALS.some(s => social[s.key]) && /*#__PURE__*/React.createElement("div", {
      style: {
        marginTop: 18,
        paddingTop: 16,
        borderTop: "1px solid var(--border-subtle)"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: "var(--text-sm)",
        fontWeight: 700,
        color: "var(--text-strong)",
        marginBottom: 10
      }
    }, TR("Follow")), /*#__PURE__*/React.createElement(SocialIcons, {
      links: social
    })))), tab === "jobs" && (jobs.length > 0 ? (() => {
      const q = jobSearch.trim().toLowerCase();
      const filtered = q ? jobs.filter(j => [j.title, j.location, j.category, j.type, j.experienceLevel].filter(Boolean).some(v => String(v).toLowerCase().indexOf(q) !== -1)) : jobs;
      const pages = Math.max(1, Math.ceil(filtered.length / JOBS_PER));
      const safe = Math.min(jobsPage, pages - 1);
      const slice = filtered.slice(safe * JOBS_PER, safe * JOBS_PER + JOBS_PER);
      return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
        style: {
          position: "relative",
          marginBottom: 14
        }
      }, /*#__PURE__*/React.createElement("span", {
        style: {
          position: "absolute",
          left: 12,
          top: "50%",
          transform: "translateY(-50%)",
          color: "var(--text-faint)",
          display: "inline-flex",
          pointerEvents: "none"
        }
      }, I("search", 16)), /*#__PURE__*/React.createElement("input", {
        value: jobSearch,
        onChange: e => {
          setJobSearch(e.target.value);
          setJobsPage(0);
        },
        placeholder: "Search jobs at " + name + "…",
        style: {
          width: "100%",
          boxSizing: "border-box",
          padding: "10px 34px",
          borderRadius: "var(--radius-md)",
          border: "1px solid var(--border)",
          background: "var(--surface-card)",
          fontFamily: "var(--font-sans)",
          fontSize: "var(--text-sm)",
          color: "var(--text-body)",
          outline: "none"
        }
      }), jobSearch && /*#__PURE__*/React.createElement("button", {
        onClick: () => {
          setJobSearch("");
          setJobsPage(0);
        },
        "aria-label": "Clear search",
        style: {
          position: "absolute",
          right: 10,
          top: "50%",
          transform: "translateY(-50%)",
          border: "none",
          background: "transparent",
          cursor: "pointer",
          color: "var(--text-muted)",
          display: "inline-flex"
        }
      }, I("x", 15))), filtered.length > 0 ? /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(Toolbar, {
        count: filtered.length,
        noun: "job",
        view: jobsView,
        onView: setJobsView
      }), /*#__PURE__*/React.createElement(JobsView, {
        view: jobsView,
        items: slice,
        saved: saved,
        toggleSave: toggleSave,
        onOpenJob: onOpenJob
      }), /*#__PURE__*/React.createElement(Pager, {
        page: safe,
        pages: pages,
        onPage: setJobsPage
      })) : /*#__PURE__*/React.createElement(Card, {
        padding: 0
      }, /*#__PURE__*/React.createElement(EmptyState, {
        icon: I("search", 22),
        title: "No matching jobs",
        description: "No roles match “" + jobSearch.trim() + "”. Try a different keyword."
      })));
    })() : /*#__PURE__*/React.createElement(Card, {
      padding: 0
    }, /*#__PURE__*/React.createElement(EmptyState, {
      icon: I("briefcase", 22),
      title: "No open roles right now",
      description: "Check back later — " + name + " isn't hiring at the moment."
    }))), tab === "gallery" && (gallery.length > 0 ? (() => {
      const pages = Math.max(1, Math.ceil(gallery.length / GALLERY_PER));
      const safe = Math.min(galleryPage, pages - 1);
      const slice = gallery.slice(safe * GALLERY_PER, safe * GALLERY_PER + GALLERY_PER);
      return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(Toolbar, {
        count: gallery.length,
        noun: "photo",
        view: galleryView,
        onView: setGalleryView,
        options: ["grid", "list"]
      }), /*#__PURE__*/React.createElement(GalleryView, {
        view: galleryView,
        items: slice
      }), /*#__PURE__*/React.createElement(Pager, {
        page: safe,
        pages: pages,
        onPage: setGalleryPage
      }));
    })() : /*#__PURE__*/React.createElement(Card, {
      padding: 0
    }, /*#__PURE__*/React.createElement(EmptyState, {
      icon: I("image", 22),
      title: "No photos yet",
      description: name + " hasn't uploaded any photos."
    }))), tab === "awards" && (awards.length > 0 ? /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(Toolbar, {
      count: awards.length,
      noun: "award",
      view: awardsView,
      onView: setAwardsView
    }), /*#__PURE__*/React.createElement(AwardsView, {
      view: awardsView,
      items: awards
    })) : /*#__PURE__*/React.createElement(Card, {
      padding: 0
    }, /*#__PURE__*/React.createElement(EmptyState, {
      icon: I("trophy", 22),
      title: "No awards listed",
      description: name + " hasn't added any awards or recognition."
    }))), tab === "reviews" && /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        flexDirection: "column",
        gap: 16
      }
    }, /*#__PURE__*/React.createElement(Card, {
      padding: 20
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        flexWrap: "wrap",
        gap: 16
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        alignItems: "center",
        gap: 20,
        flexWrap: "wrap"
      }
    }, revData && revData.stats && revData.stats.avg != null ? /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
      style: {
        textAlign: "center"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 40,
        fontWeight: 800,
        color: "var(--text-strong)",
        lineHeight: 1
      }
    }, revData.stats.avg.toFixed(1)), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        gap: 2,
        color: "var(--saffron-500)",
        marginTop: 4,
        justifyContent: "center"
      }
    }, [1, 2, 3, 4, 5].map(function (n) {
      return /*#__PURE__*/React.createElement("span", {
        key: n,
        style: {
          opacity: n <= Math.round(revData.stats.avg) ? 1 : 0.2
        }
      }, I("star", 16));
    })), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: "var(--text-xs)",
        color: "var(--text-muted)",
        marginTop: 4
      }
    }, revData.stats.count, " review", revData.stats.count === 1 ? "" : "s")), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        flexDirection: "column",
        gap: 4,
        minWidth: 160
      }
    }, [5, 4, 3, 2, 1].map(function (n) {
      var cnt = revData.stats["r" + n] || 0;
      var pct = revData.stats.count > 0 ? Math.round(cnt / revData.stats.count * 100) : 0;
      return /*#__PURE__*/React.createElement("div", {
        key: n,
        style: {
          display: "flex",
          alignItems: "center",
          gap: 8
        }
      }, /*#__PURE__*/React.createElement("span", {
        style: {
          fontSize: "var(--text-xs)",
          color: "var(--text-muted)",
          width: 8
        }
      }, n), /*#__PURE__*/React.createElement("span", {
        style: {
          color: "var(--saffron-500)",
          display: "inline-flex"
        }
      }, I("star", 12)), /*#__PURE__*/React.createElement("div", {
        style: {
          flex: 1,
          height: 6,
          background: "var(--surface-sunken)",
          borderRadius: 99,
          overflow: "hidden"
        }
      }, /*#__PURE__*/React.createElement("div", {
        style: {
          width: pct + "%",
          height: "100%",
          background: "var(--saffron-500)",
          borderRadius: 99
        }
      })), /*#__PURE__*/React.createElement("span", {
        style: {
          fontSize: "var(--text-xs)",
          color: "var(--text-faint)",
          width: 24
        }
      }, cnt));
    }))) : /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: "var(--text-sm)",
        color: "var(--text-muted)"
      }
    }, revLoading ? "Loading…" : "No reviews yet. Be the first to review " + name + ".")), isLoggedIn && !reviewForm.open && /*#__PURE__*/React.createElement("button", {
      onClick: () => setReviewForm(function (f) {
        return Object.assign({}, f, {
          open: true
        });
      }),
      style: {
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
        border: "1px solid var(--border-strong)",
        borderRadius: "var(--radius-md)",
        background: "var(--surface-card)",
        color: "var(--text-body)",
        fontFamily: "var(--font-sans)",
        fontWeight: 600,
        fontSize: "var(--text-sm)",
        padding: "9px 16px",
        cursor: "pointer"
      }
    }, I("star", 15), " Write a review"), !isLoggedIn && /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: "var(--text-sm)",
        color: "var(--text-muted)"
      }
    }, /*#__PURE__*/React.createElement("a", {
      href: "#",
      onClick: function (e) {
        e.preventDefault();
        onNav && onNav("login");
      },
      style: {
        color: "var(--text-brand)",
        fontWeight: 600
      }
    }, TR("Sign in")), " to write a review.")), reviewForm.open && /*#__PURE__*/React.createElement("div", {
      style: {
        marginTop: 20,
        paddingTop: 20,
        borderTop: "1px solid var(--border-subtle)"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontWeight: 700,
        fontSize: "var(--text-base)",
        color: "var(--text-strong)",
        marginBottom: 14
      }
    }, "Your review of ", name), reviewMsg && /*#__PURE__*/React.createElement("div", {
      style: {
        padding: "10px 14px",
        background: reviewMsg.startsWith("Error") ? "var(--danger-subtle)" : "var(--success-subtle)",
        color: reviewMsg.startsWith("Error") ? "var(--danger)" : "var(--success)",
        borderRadius: "var(--radius-md)",
        marginBottom: 12,
        fontSize: "var(--text-sm)"
      }
    }, reviewMsg), /*#__PURE__*/React.createElement("div", {
      style: {
        marginBottom: 12
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: "var(--text-sm)",
        fontWeight: 600,
        color: "var(--text-strong)",
        marginBottom: 6
      }
    }, "Rating *"), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        gap: 6
      }
    }, [1, 2, 3, 4, 5].map(function (n) {
      return /*#__PURE__*/React.createElement("button", {
        key: n,
        onClick: () => setReviewForm(function (f) {
          return Object.assign({}, f, {
            rating: n
          });
        }),
        style: {
          width: 36,
          height: 36,
          border: "none",
          background: "transparent",
          cursor: "pointer",
          padding: 0,
          color: n <= reviewForm.rating ? "var(--saffron-500)" : "var(--border-strong)",
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center"
        }
      }, I("star", 28));
    }), reviewForm.rating > 0 && /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: "var(--text-sm)",
        color: "var(--text-muted)",
        alignSelf: "center",
        marginLeft: 4
      }
    }, ["", "Poor", "Fair", "Good", "Very good", "Excellent"][reviewForm.rating]))), /*#__PURE__*/React.createElement("div", {
      style: {
        marginBottom: 12
      }
    }, /*#__PURE__*/React.createElement("label", {
      style: {
        display: "block",
        fontSize: "var(--text-sm)",
        fontWeight: 600,
        color: "var(--text-strong)",
        marginBottom: 6
      }
    }, "Title (optional)"), /*#__PURE__*/React.createElement("input", {
      value: reviewForm.title,
      onChange: function (e) {
        setReviewForm(function (f) {
          return Object.assign({}, f, {
            title: e.target.value
          });
        });
      },
      maxLength: 100,
      placeholder: TR("Summarise your experience in a short phrase…"),
      style: {
        width: "100%",
        padding: "9px 12px",
        border: "1px solid var(--border)",
        borderRadius: "var(--radius-md)",
        fontFamily: "var(--font-sans)",
        fontSize: "var(--text-sm)",
        boxSizing: "border-box",
        background: "var(--surface-card)",
        color: "var(--text-body)"
      }
    })), /*#__PURE__*/React.createElement("div", {
      style: {
        marginBottom: 12
      }
    }, /*#__PURE__*/React.createElement("label", {
      style: {
        display: "block",
        fontSize: "var(--text-sm)",
        fontWeight: 600,
        color: "var(--text-strong)",
        marginBottom: 6
      }
    }, "Review * ", /*#__PURE__*/React.createElement("span", {
      style: {
        fontWeight: 400,
        color: "var(--text-muted)"
      }
    }, "(min 20 characters)")), /*#__PURE__*/React.createElement("textarea", {
      value: reviewForm.body,
      onChange: function (e) {
        setReviewForm(function (f) {
          return Object.assign({}, f, {
            body: e.target.value
          });
        });
      },
      rows: 4,
      maxLength: 3000,
      placeholder: "Share your experience working at " + name + " or as a customer…",
      style: {
        width: "100%",
        padding: "9px 12px",
        border: "1px solid var(--border)",
        borderRadius: "var(--radius-md)",
        fontFamily: "var(--font-sans)",
        fontSize: "var(--text-sm)",
        boxSizing: "border-box",
        background: "var(--surface-card)",
        color: "var(--text-body)",
        resize: "vertical"
      }
    })), /*#__PURE__*/React.createElement("label", {
      style: {
        display: "flex",
        alignItems: "center",
        gap: 8,
        cursor: "pointer",
        fontSize: "var(--text-sm)",
        color: "var(--text-body)",
        marginBottom: 16,
        userSelect: "none"
      }
    }, /*#__PURE__*/React.createElement("input", {
      type: "checkbox",
      checked: reviewForm.anon,
      onChange: function (e) {
        setReviewForm(function (f) {
          return Object.assign({}, f, {
            anon: e.target.checked
          });
        });
      },
      style: {
        width: 16,
        height: 16
      }
    }), "Post anonymously"), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        gap: 10
      }
    }, /*#__PURE__*/React.createElement("button", {
      disabled: reviewBusy,
      onClick: function () {
        if (!reviewForm.rating) {
          setReviewMsg("Error: Please select a star rating.");
          return;
        }
        if (reviewForm.body.length < 20) {
          setReviewMsg("Error: Your review must be at least 20 characters.");
          return;
        }
        setReviewBusy(true);
        setReviewMsg("");
        window.KRAMA_API.submitReview(companyId, {
          rating: reviewForm.rating,
          title: reviewForm.title || null,
          body: reviewForm.body,
          is_anonymous: reviewForm.anon
        }).then(function () {
          setReviewBusy(false);
          setReviewMsg("Review submitted! It will appear after moderation.");
          setReviewForm({
            open: false,
            rating: 0,
            title: "",
            body: "",
            anon: false
          });
        }).catch(function (e) {
          setReviewBusy(false);
          setReviewMsg("Error: " + (e && e.message || "Submission failed."));
        });
      },
      style: {
        padding: "9px 20px",
        borderRadius: "var(--radius-md)",
        border: "none",
        background: "var(--brand)",
        color: "#fff",
        fontFamily: "var(--font-sans)",
        fontWeight: 700,
        fontSize: "var(--text-sm)",
        cursor: reviewBusy ? "not-allowed" : "pointer",
        opacity: reviewBusy ? 0.7 : 1
      }
    }, reviewBusy ? "Submitting…" : "Submit review"), /*#__PURE__*/React.createElement("button", {
      onClick: () => {
        setReviewForm({
          open: false,
          rating: 0,
          title: "",
          body: "",
          anon: false
        });
        setReviewMsg("");
      },
      style: {
        padding: "9px 16px",
        borderRadius: "var(--radius-md)",
        border: "1px solid var(--border)",
        background: "transparent",
        fontFamily: "var(--font-sans)",
        fontWeight: 600,
        fontSize: "var(--text-sm)",
        cursor: "pointer",
        color: "var(--text-body)"
      }
    }, TR("Cancel"))))), revLoading && /*#__PURE__*/React.createElement("div", {
      style: {
        padding: 24,
        textAlign: "center",
        color: "var(--text-muted)",
        fontSize: "var(--text-sm)"
      }
    }, "Loading reviews\u2026"), !revLoading && revData && (revData.data || []).length === 0 && /*#__PURE__*/React.createElement(Card, {
      padding: 0
    }, /*#__PURE__*/React.createElement(EmptyState, {
      icon: I("star", 22),
      title: "No reviews yet",
      description: "Be the first to share your experience with " + name + "."
    })), !revLoading && revData && (revData.data || []).map(function (r) {
      return /*#__PURE__*/React.createElement(Card, {
        key: r.id,
        padding: 20
      }, /*#__PURE__*/React.createElement("div", {
        style: {
          display: "flex",
          alignItems: "flex-start",
          gap: 14
        }
      }, /*#__PURE__*/React.createElement(Avatar, {
        src: r.author ? r.author.avatar_url : null,
        name: r.author ? r.author.name : "A",
        size: 40
      }), /*#__PURE__*/React.createElement("div", {
        style: {
          flex: 1,
          minWidth: 0
        }
      }, /*#__PURE__*/React.createElement("div", {
        style: {
          display: "flex",
          alignItems: "center",
          gap: 10,
          flexWrap: "wrap",
          marginBottom: 4
        }
      }, /*#__PURE__*/React.createElement("span", {
        style: {
          fontWeight: 700,
          fontSize: "var(--text-sm)",
          color: "var(--text-strong)"
        }
      }, r.author ? r.author.name : "Anonymous"), /*#__PURE__*/React.createElement("span", {
        style: {
          display: "inline-flex",
          gap: 2,
          color: "var(--saffron-500)"
        }
      }, [1, 2, 3, 4, 5].map(function (n) {
        return /*#__PURE__*/React.createElement("span", {
          key: n,
          style: {
            opacity: n <= r.rating ? 1 : 0.2
          }
        }, I("star", 13));
      })), /*#__PURE__*/React.createElement("span", {
        style: {
          fontSize: "var(--text-xs)",
          color: "var(--text-faint)"
        }
      }, function (iso) {
        if (!iso) return "";
        var d = new Date(iso);
        return d.getDate() + " " + ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][d.getMonth()] + " " + d.getFullYear();
      }(r.created_at))), r.title && /*#__PURE__*/React.createElement("div", {
        style: {
          fontWeight: 700,
          fontSize: "var(--text-base)",
          color: "var(--text-strong)",
          marginBottom: 6
        }
      }, r.title), /*#__PURE__*/React.createElement("div", {
        style: {
          fontSize: "var(--text-sm)",
          color: "var(--text-body)",
          lineHeight: 1.6
        }
      }, r.body))));
    }), !revLoading && revData && revData.last_page > 1 && /*#__PURE__*/React.createElement(Pager, {
      page: revPage - 1,
      pages: revData.last_page,
      onPage: function (p) {
        setRevPage(p + 1);
      }
    })))));
  }
  function DetailRow({
    icon,
    label,
    value
  }) {
    return /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        gap: 10,
        alignItems: "flex-start"
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
        color: "var(--brand)",
        flexShrink: 0
      }
    }, I(icon, 15)), /*#__PURE__*/React.createElement("div", {
      style: {
        minWidth: 0
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: "var(--text-xs)",
        color: "var(--text-muted)"
      }
    }, label), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: "var(--text-sm)",
        fontWeight: 600,
        color: "var(--text-strong)"
      }
    }, value)));
  }
  function Pager({
    page,
    pages,
    onPage
  }) {
    if (pages <= 1) return null;
    const btn = (active, disabled) => ({
      minWidth: 38,
      height: 38,
      padding: "0 12px",
      borderRadius: "var(--radius-md)",
      cursor: disabled ? "not-allowed" : "pointer",
      border: "1px solid " + (active ? "var(--brand)" : "var(--border-strong)"),
      background: active ? "var(--brand)" : "var(--surface-card)",
      color: active ? "var(--on-brand, #fff)" : disabled ? "var(--text-faint)" : "var(--text-body)",
      fontFamily: "var(--font-sans)",
      fontSize: "var(--text-sm)",
      fontWeight: 700,
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center"
    });
    return /*#__PURE__*/React.createElement("div", {
      className: "krm-pagination",
      style: {
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexWrap: "wrap",
        gap: 8,
        marginTop: 24
      }
    }, /*#__PURE__*/React.createElement("button", {
      onClick: () => onPage(Math.max(0, page - 1)),
      disabled: page === 0,
      style: btn(false, page === 0)
    }, I("chevron-left", 18)), Array.from({
      length: pages
    }).map((_, i) => /*#__PURE__*/React.createElement("button", {
      key: i,
      onClick: () => onPage(i),
      style: btn(i === page, false)
    }, i + 1)), /*#__PURE__*/React.createElement("button", {
      onClick: () => onPage(Math.min(pages - 1, page + 1)),
      disabled: page === pages - 1,
      style: btn(false, page === pages - 1)
    }, I("chevron-right", 18)));
  }
  function ViewSwitch({
    view,
    onView,
    options
  }) {
    let opts = [["grid", "layout-grid", "Grid"], ["list", "list", "List"], ["detail", "layout-list", "Detail"]];
    if (options) opts = opts.filter(o => options.indexOf(o[0]) !== -1);
    return /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        gap: 2,
        padding: 3,
        background: "var(--surface-sunken)",
        borderRadius: "var(--radius-md)"
      }
    }, opts.map(([val, ic, label]) => {
      const on = view === val;
      return /*#__PURE__*/React.createElement("button", {
        key: val,
        onClick: () => onView(val),
        title: label,
        "aria-label": label,
        style: {
          display: "inline-flex",
          alignItems: "center",
          gap: 6,
          height: 32,
          padding: "0 10px",
          cursor: "pointer",
          border: "none",
          borderRadius: "var(--radius-sm)",
          background: on ? "var(--surface-card)" : "transparent",
          color: on ? "var(--text-brand)" : "var(--text-muted)",
          boxShadow: on ? "var(--shadow-xs)" : "none",
          fontFamily: "var(--font-sans)",
          fontSize: "var(--text-xs)",
          fontWeight: 700
        }
      }, I(ic, 16), /*#__PURE__*/React.createElement("span", {
        className: "krm-vs-label"
      }, label));
    }));
  }
  function Toolbar({
    count,
    noun,
    view,
    onView,
    options
  }) {
    return /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 16,
        gap: 12,
        flexWrap: "wrap"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: "var(--text-sm)",
        color: "var(--text-muted)"
      }
    }, count, " ", count === 1 ? noun : noun + "s"), /*#__PURE__*/React.createElement(ViewSwitch, {
      view: view,
      onView: onView,
      options: options
    }));
  }
  const chip = (ic, txt) => txt ? /*#__PURE__*/React.createElement("span", {
    style: {
      display: "inline-flex",
      alignItems: "center",
      gap: 5,
      fontSize: "var(--text-xs)",
      color: "var(--text-muted)"
    }
  }, I(ic, 13), txt) : null;
  const strip = html => (html || "").replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
  function JobsView({
    view,
    items,
    saved,
    toggleSave,
    onOpenJob
  }) {
    if (view === "grid") {
      return /*#__PURE__*/React.createElement("div", {
        className: "krm-co-jobs-grid",
        style: {
          display: "grid",
          gridTemplateColumns: "repeat(2, 1fr)",
          gap: 14
        }
      }, items.map(j => /*#__PURE__*/React.createElement(JobCard, _extends({
        key: j.id
      }, j, {
        saved: saved.includes(j.id),
        onSave: () => toggleSave(j.id),
        onClick: () => onOpenJob(j)
      }))));
    }
    if (view === "list") {
      return /*#__PURE__*/React.createElement("div", {
        style: {
          display: "flex",
          flexDirection: "column",
          gap: 8
        }
      }, items.map(j => /*#__PURE__*/React.createElement("div", {
        key: j.id,
        onClick: () => onOpenJob(j),
        style: {
          display: "flex",
          alignItems: "center",
          gap: 14,
          padding: "12px 16px",
          border: "1px solid var(--border)",
          borderRadius: "var(--radius-md)",
          background: "var(--surface-card)",
          cursor: "pointer"
        }
      }, /*#__PURE__*/React.createElement(Avatar, {
        src: j.logo,
        name: j.company,
        square: true,
        size: 40
      }), /*#__PURE__*/React.createElement("div", {
        style: {
          flex: 1,
          minWidth: 0
        }
      }, /*#__PURE__*/React.createElement("div", {
        style: {
          fontWeight: 700,
          color: "var(--text-strong)",
          fontSize: "var(--text-sm)",
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis"
        }
      }, j.title), /*#__PURE__*/React.createElement("div", {
        style: {
          display: "flex",
          gap: 14,
          flexWrap: "wrap",
          marginTop: 3
        }
      }, chip("map-pin", j.location), chip("briefcase", j.type), chip("banknote", j.salary))), j.postedAt && /*#__PURE__*/React.createElement("span", {
        style: {
          fontSize: "var(--text-xs)",
          color: "var(--text-faint)",
          flexShrink: 0
        }
      }, j.postedAt))));
    }
    return /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        flexDirection: "column",
        gap: 12
      }
    }, items.map(j => /*#__PURE__*/React.createElement(Card, {
      key: j.id,
      padding: 20
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        gap: 16
      }
    }, /*#__PURE__*/React.createElement(Avatar, {
      src: j.logo,
      name: j.company,
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
    }, j.title), j.featured && /*#__PURE__*/React.createElement(Badge, {
      tone: "accent"
    }, TR("Featured"))), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        gap: 16,
        flexWrap: "wrap",
        marginTop: 8
      }
    }, chip("map-pin", j.location), chip("briefcase", j.type), chip("banknote", j.salary), chip("clock", j.postedAt)), strip(j.description) && /*#__PURE__*/React.createElement("p", {
      style: {
        fontSize: "var(--text-sm)",
        color: "var(--text-body)",
        marginTop: 10,
        lineHeight: 1.6
      }
    }, strip(j.description).slice(0, 170), strip(j.description).length > 170 ? "…" : ""), /*#__PURE__*/React.createElement("div", {
      style: {
        marginTop: 12
      }
    }, /*#__PURE__*/React.createElement(Button, {
      variant: "secondary",
      size: "sm",
      onClick: () => onOpenJob(j)
    }, TR("View job"))))))));
  }
  function GalleryView({
    view,
    items
  }) {
    if (view === "grid") {
      return /*#__PURE__*/React.createElement("div", {
        className: "krm-co-gallery",
        style: {
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
          gap: 14
        }
      }, items.map(p => /*#__PURE__*/React.createElement("figure", {
        key: p.id,
        style: {
          margin: 0,
          border: "1px solid var(--border)",
          borderRadius: "var(--radius-md)",
          overflow: "hidden",
          background: "var(--surface-card)"
        }
      }, /*#__PURE__*/React.createElement("a", {
        href: p.url,
        target: "_blank",
        rel: "noopener noreferrer",
        style: {
          display: "block",
          aspectRatio: "4/3",
          background: "var(--surface-sunken)"
        }
      }, /*#__PURE__*/React.createElement("img", {
        src: p.url,
        alt: p.caption || "",
        style: {
          width: "100%",
          height: "100%",
          objectFit: "cover",
          display: "block"
        }
      })), p.caption ? /*#__PURE__*/React.createElement("figcaption", {
        style: {
          fontSize: "var(--text-xs)",
          color: "var(--text-body)",
          padding: "8px 10px",
          lineHeight: 1.4
        }
      }, p.caption) : null)));
    }
    // list view
    return /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        flexDirection: "column",
        gap: 8
      }
    }, items.map(p => /*#__PURE__*/React.createElement("a", {
      key: p.id,
      href: p.url,
      target: "_blank",
      rel: "noopener noreferrer",
      style: {
        display: "flex",
        alignItems: "center",
        gap: 14,
        padding: 10,
        border: "1px solid var(--border)",
        borderRadius: "var(--radius-md)",
        background: "var(--surface-card)",
        textDecoration: "none"
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        flexShrink: 0,
        width: 120,
        height: 80,
        borderRadius: "var(--radius-sm)",
        overflow: "hidden",
        background: "var(--surface-sunken)"
      }
    }, /*#__PURE__*/React.createElement("img", {
      src: p.url,
      alt: p.caption || "",
      style: {
        width: "100%",
        height: "100%",
        objectFit: "cover",
        display: "block"
      }
    })), /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: "var(--text-sm)",
        color: p.caption ? "var(--text-body)" : "var(--text-faint)"
      }
    }, p.caption || "Untitled photo"))));
  }
  function AwardsView({
    view,
    items
  }) {
    const thumb = (a, size) => a.image_url ? /*#__PURE__*/React.createElement("a", {
      href: a.image_url,
      target: "_blank",
      rel: "noopener noreferrer",
      style: {
        flexShrink: 0,
        width: size,
        height: size,
        borderRadius: "var(--radius-md)",
        overflow: "hidden",
        border: "1px solid var(--border)",
        background: "var(--surface-sunken)",
        display: "block"
      }
    }, /*#__PURE__*/React.createElement("img", {
      src: a.image_url,
      alt: a.title,
      style: {
        width: "100%",
        height: "100%",
        objectFit: "cover",
        display: "block"
      }
    })) : /*#__PURE__*/React.createElement("span", {
      style: {
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        width: size,
        height: size,
        borderRadius: "var(--radius-md)",
        background: "var(--warning-subtle, #fef3c7)",
        color: "var(--warning, #b45309)",
        flexShrink: 0
      }
    }, I("trophy", Math.round(size * 0.5)));
    if (view === "grid") {
      return /*#__PURE__*/React.createElement("div", {
        className: "krm-co-awards-grid",
        style: {
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
          gap: 14
        }
      }, items.map(a => /*#__PURE__*/React.createElement(Card, {
        key: a.id,
        padding: 0,
        style: {
          overflow: "hidden"
        }
      }, a.image_url ? /*#__PURE__*/React.createElement("a", {
        href: a.image_url,
        target: "_blank",
        rel: "noopener noreferrer",
        style: {
          display: "block",
          aspectRatio: "4/3",
          background: "var(--surface-sunken)"
        }
      }, /*#__PURE__*/React.createElement("img", {
        src: a.image_url,
        alt: a.title,
        style: {
          width: "100%",
          height: "100%",
          objectFit: "cover",
          display: "block"
        }
      })) : /*#__PURE__*/React.createElement("div", {
        style: {
          aspectRatio: "4/3",
          background: "var(--warning-subtle, #fef3c7)",
          color: "var(--warning, #b45309)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center"
        }
      }, I("trophy", 40)), /*#__PURE__*/React.createElement("div", {
        style: {
          padding: 16
        }
      }, /*#__PURE__*/React.createElement("div", {
        style: {
          fontWeight: 700,
          color: "var(--text-strong)",
          fontSize: "var(--text-sm)"
        }
      }, a.title), a.year && /*#__PURE__*/React.createElement("div", {
        style: {
          fontSize: "var(--text-xs)",
          color: "var(--text-muted)",
          marginTop: 2
        }
      }, a.year), a.description && /*#__PURE__*/React.createElement("div", {
        style: {
          fontSize: "var(--text-xs)",
          color: "var(--text-body)",
          marginTop: 6,
          lineHeight: 1.5
        }
      }, a.description)))));
    }
    if (view === "list") {
      return /*#__PURE__*/React.createElement("div", {
        style: {
          display: "flex",
          flexDirection: "column",
          gap: 8
        }
      }, items.map(a => /*#__PURE__*/React.createElement("div", {
        key: a.id,
        style: {
          display: "flex",
          alignItems: "center",
          gap: 14,
          padding: "10px 14px",
          border: "1px solid var(--border)",
          borderRadius: "var(--radius-md)",
          background: "var(--surface-card)"
        }
      }, thumb(a, 40), /*#__PURE__*/React.createElement("div", {
        style: {
          flex: 1,
          minWidth: 0
        }
      }, /*#__PURE__*/React.createElement("div", {
        style: {
          fontWeight: 700,
          color: "var(--text-strong)",
          fontSize: "var(--text-sm)",
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis"
        }
      }, a.title), a.description && /*#__PURE__*/React.createElement("div", {
        style: {
          fontSize: "var(--text-xs)",
          color: "var(--text-muted)",
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis"
        }
      }, a.description)), a.year && /*#__PURE__*/React.createElement("span", {
        style: {
          fontSize: "var(--text-xs)",
          color: "var(--text-faint)",
          flexShrink: 0
        }
      }, a.year))));
    }
    return /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        flexDirection: "column",
        gap: 12
      }
    }, items.map(a => /*#__PURE__*/React.createElement(Card, {
      key: a.id,
      padding: 18
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        alignItems: "flex-start",
        gap: 16
      }
    }, thumb(a, 110), /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1,
        minWidth: 0
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontWeight: 700,
        color: "var(--text-strong)",
        fontSize: "var(--text-base)"
      }
    }, a.title), a.year && /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: "var(--text-xs)",
        color: "var(--text-muted)",
        marginTop: 2
      }
    }, a.year), a.description && /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: "var(--text-sm)",
        color: "var(--text-body)",
        marginTop: 8,
        lineHeight: 1.6
      }
    }, a.description))))));
  }
  window.KramaCompanyProfile = CompanyProfile;
})();