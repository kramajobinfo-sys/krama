function App() {
  const [page, setPage] = React.useState("home");
  const [job, setJob] = React.useState(null);
  const [jobCategory, setJobCategory] = React.useState("All categories");
  const [jobCompany, setJobCompany] = React.useState("");
  const [jobKeyword, setJobKeyword] = React.useState("");
  const [jobLocation, setJobLocation] = React.useState("");
  const [companyId, setCompanyId] = React.useState(null);
  const [companyTab, setCompanyTab] = React.useState(null);
  const [forumThreadId, setForumThreadId] = React.useState(null);
  const [applyJob, setApplyJob] = React.useState(null);
  const [saved, setSaved] = React.useState([]);
  const [user, setUser] = React.useState(null);
  const [ready, setReady] = React.useState(false);
  const [lang, setLang] = React.useState(window.KRAMA_LANG || "en");
  // Selects a specific language rather than flipping between two — there are three now
  // (en / km / zh), and the list is driven by KRAMA_LANGS in i18n.js.
  const selectLang = code => {
    if (window.KRAMA_SET_LANG) window.KRAMA_SET_LANG(code);
    setLang(window.KRAMA_LANG);
  };
  React.useEffect(() => {
    const api = window.KRAMA_API;
    const params = new URLSearchParams(window.location.search);
    const deepJobId = params.get("job");
    // Password-reset deep link (?reset=1&token=…&email=…) opens the reset view.
    if (params.get("reset")) {
      setPage("forgot");
    }
    // Community deep link (?thread=N) opens that discussion (used by digest emails).
    const deepThreadId = params.get("thread");
    if (deepThreadId) {
      setForumThreadId(deepThreadId);
      setPage("community");
    }
    // ?page=<id> opens a top-level view that has no clean URL of its own. Those views are
    // otherwise reachable only by clicking inside the SPA, so anything rendered OUTSIDE it
    // — the server-rendered CV page's header and footer — had no way to link to them.
    // Allowlisted so a stray/hostile value can't push the app into an unknown state.
    const PAGE_LINKS = ["jobs", "companies", "community", "employers", "pricing", "about", "contact", "privacy", "terms", "login", "register"];
    const deepPage = params.get("page");
    if (deepPage && PAGE_LINKS.indexOf(deepPage) !== -1) {
      setPage(deepPage);
    }
    // Clean-URL deep links: /companies/{id} and /jobs/{slug} — the same pages Laravel
    // server-renders for crawlers. A company opens immediately; a job is resolved from the
    // loaded catalogue once init() finishes (the public job API only accepts numeric ids).
    const _mCo = window.location.pathname.match(/\/companies\/(\d+)$/);
    const _mJobSlug = window.location.pathname.match(/\/jobs\/([^\/]+)$/);
    const _mInfo = window.location.pathname.match(/\/(privacy|terms)$/);
    if (_mCo) {
      setCompanyId(Number(_mCo[1]));
      setPage("company");
    } else if (_mInfo) {
      setPage(_mInfo[1]);
    }
    const ctrl = new AbortController();
    setTimeout(() => ctrl.abort(), 8000);
    Promise.allSettled([api.init().then(() => {
      if (_mJobSlug && !deepJobId) {
        const j = (window.KRAMA_DATA && window.KRAMA_DATA.jobs || []).find(x => x.slug === _mJobSlug[1]);
        if (j) openJob(j);else setPage("jobs");
      }
    }), api.fetchMe().then(u => {
      if (u) setUser(u);
    }), deepJobId ? fetch((/^(localhost|127\.0\.0\.1|::1|192\.168\.|10\.)/.test(window.location.hostname) ? 'http://127.0.0.1:8000/api' : window.location.protocol + '//' + window.location.host + '/api') + "/jobs/" + encodeURIComponent(deepJobId), {
      signal: ctrl.signal
    }).then(r => r.ok ? r.json() : null).then(j => {
      if (j && j.id) {
        openJob(window.KRAMA_API.normaliseJob(j));
        return;
      }
      // API failed or job not found — check if init() already cached it
      const cached = window.KRAMA_DATA && window.KRAMA_DATA.jobs && window.KRAMA_DATA.jobs.find(x => String(x.id) === String(deepJobId) || x.slug === deepJobId);
      if (cached) {
        openJob(cached);
        return;
      }
      // Nothing found — land on jobs page rather than silent home
      setPage("jobs");
    }).catch(() => {
      setPage("jobs");
    }) : Promise.resolve()]).finally(() => setReady(true));
  }, []);

  // Keep the address bar in sync with the current view: job detail → /jobs/{slug},
  // company → /companies/{id}, everything else → /. Only on the live clean-URL host
  // (skipped in local dev where the SPA is served from its own folder). Pushes only
  // when the path actually changes, so browser back/forward (popstate) doesn't loop.
  React.useEffect(() => {
    if (!ready) return;
    const cur = window.location.pathname;
    if (cur.indexOf("/ui_kits/public-website/") !== -1) return; // local dev — leave URLs alone
    let desired = "/";
    if (page === "detail" && job && job.slug && !job.external) desired = "/jobs/" + job.slug;else if (page === "company" && companyId != null && String(companyId).indexOf("ext-") !== 0) desired = "/companies/" + companyId;else if (page === "privacy" || page === "terms") desired = "/" + page;
    if (desired !== cur) {
      try {
        window.history.pushState({
          krama: true
        }, "", desired);
      } catch (e) {}
    }
  }, [ready, page, job, companyId]);

  // Browser back/forward → restore the view from the URL.
  React.useEffect(() => {
    const onPop = () => {
      const path = window.location.pathname;
      const mCo = path.match(/\/companies\/(\d+)$/);
      const mJob = path.match(/\/jobs\/([^\/]+)$/);
      const mInfo = path.match(/\/(privacy|terms)$/);
      if (mCo) {
        setCompanyId(Number(mCo[1]));
        setJob(null);
        setPage("company");
      } else if (mJob) {
        const j = (window.KRAMA_DATA && window.KRAMA_DATA.jobs || []).find(x => x.slug === mJob[1]);
        if (j) {
          setJob(j);
          setPage("detail");
        } else {
          setPage("jobs");
        }
      } else if (mInfo) {
        setJob(null);
        setPage(mInfo[1]);
      } else {
        setJob(null);
        setPage("home");
      }
      window.scrollTo(0, 0);
    };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);
  const toggleSave = id => {
    const api = window.KRAMA_API;
    if (typeof id === "string" && id.indexOf("ext-") === 0) return; // external listings aren't saveable
    if (!user) {
      nav("login");
      return;
    }
    setSaved(s => {
      if (s.includes(id)) {
        api.unsaveJob(id).catch(() => {});
        return s.filter(x => x !== id);
      }
      api.saveJob(id).catch(() => {});
      return [...s, id];
    });
  };
  const openJob = j => {
    // Aggregated external listings link out to their source instead of opening an internal detail page.
    if (j && j.external && j.applyUrl) {
      window.open(j.applyUrl, "_blank", "noopener");
      return;
    }
    setJob(j);
    setPage("detail");
    window.scrollTo(0, 0);
  };
  const nav = (p, opts) => {
    opts = opts || {};
    // Aggregated external company → open its source profile in a new tab (no internal page).
    if (p === "company" && typeof opts.companyId === "string" && opts.companyId.indexOf("ext-co-") === 0) {
      var ext = (window.KRAMA_DATA && window.KRAMA_DATA.companies || []).find(function (c) {
        return c.id === opts.companyId;
      });
      if (ext && ext.profileUrl) {
        window.open(ext.profileUrl, "_blank", "noopener");
        return;
      }
    }
    setJobCategory(opts.category || "All categories");
    setJobCompany(opts.company || "");
    setJobKeyword(opts.keyword || "");
    setJobLocation(opts.location || "");
    if (opts.companyId != null) setCompanyId(opts.companyId);
    setCompanyTab(opts.tab != null ? opts.tab : null);
    setPage(p);
    window.scrollTo(0, 0);
  };
  const handleLogin = u => {
    setUser(u);
    const roleSlug = u && u.role && u.role.slug;
    const token = localStorage.getItem("krama_access_token");
    if (roleSlug === "employer") {
      if (token) localStorage.setItem("krama_employer_token", token);
      window.location.href = "../employer-dashboard/index.html";
    } else if (roleSlug === "admin" || roleSlug === "super_admin") {
      if (token) localStorage.setItem("krama_admin_token", token);
      window.location.href = "../admin-dashboard/index.html";
    } else {
      window.location.href = "../candidate-dashboard/index.html";
    }
  };
  const handleLogout = () => {
    window.KRAMA_API.logout();
    setUser(null);
    nav("home");
  };
  React.useEffect(() => {
    if (window.lucide) window.lucide.createIcons();
  });
  const {
    KramaHeader,
    KramaFooter,
    KramaHome,
    KramaJobs,
    KramaCompanies,
    KramaCompanyProfile,
    KramaJobDetail,
    KramaLogin,
    KramaRegister,
    KramaForgotPassword,
    KramaApplyModal,
    KramaInfoPage,
    KramaCandidateProfile,
    KramaCommunity
  } = window;
  if (!ready) return /*#__PURE__*/React.createElement("div", {
    style: {
      minHeight: "100vh",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      background: "var(--teal-800)",
      gap: 16
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 10
    }
  }, /*#__PURE__*/React.createElement("img", {
    src: window.getKramaLogo("../../assets/krama-icon.png"),
    height: "40",
    alt: "KRAMA"
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: "var(--font-display)",
      fontWeight: 800,
      fontSize: "24px",
      letterSpacing: ".08em",
      color: "#fff",
      opacity: 0.9
    }
  }, window.KRAMA_BRAND_NAME || "KRAMA")), /*#__PURE__*/React.createElement("div", {
    style: {
      width: 36,
      height: 36,
      border: "3px solid rgba(255,255,255,0.2)",
      borderTopColor: "#fff",
      borderRadius: "50%",
      animation: "spin 0.8s linear infinite"
    }
  }), /*#__PURE__*/React.createElement("style", null, `@keyframes spin { to { transform: rotate(360deg); } }`));
  if (page === "login" || page === "register" || page === "forgot") {
    // Auth pages reuse the standard site header + footer (shown on mobile so the
    // page matches every other page; hidden on desktop via .krm-auth-page CSS so
    // the split-screen Shell keeps its own chrome — desktop stays untouched).
    return /*#__PURE__*/React.createElement("div", {
      className: "krm-auth-page"
    }, /*#__PURE__*/React.createElement(KramaHeader, {
      page: "",
      onNav: nav,
      user: user,
      onLogout: handleLogout,
      lang: lang,
      onSelectLang: selectLang
    }), page === "login" && /*#__PURE__*/React.createElement(KramaLogin, {
      onNav: nav,
      onLogin: handleLogin
    }), page === "register" && /*#__PURE__*/React.createElement(KramaRegister, {
      onNav: nav,
      onLogin: handleLogin
    }), page === "forgot" && /*#__PURE__*/React.createElement(KramaForgotPassword, {
      onNav: nav
    }), /*#__PURE__*/React.createElement(KramaFooter, {
      onNav: nav
    }));
  }
  const INFO = ["about", "contact", "terms", "privacy", "pricing", "employers"];
  const headerPage = page === "detail" ? "jobs" : page === "company" ? "companies" : INFO.includes(page) ? "" : page;
  if (page === "candidateProfile") {
    return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(KramaHeader, {
      page: "",
      onNav: nav,
      user: user,
      onLogout: handleLogout,
      lang: lang,
      onSelectLang: selectLang
    }), KramaCandidateProfile ? /*#__PURE__*/React.createElement(KramaCandidateProfile, {
      user: user,
      onNav: nav,
      onUserUpdate: u => setUser(u)
    }) : /*#__PURE__*/React.createElement("div", {
      style: {
        padding: 40,
        textAlign: "center",
        color: "var(--text-muted)"
      }
    }, "Loading\u2026"), /*#__PURE__*/React.createElement(KramaFooter, {
      onNav: nav
    }));
  }
  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(KramaHeader, {
    page: headerPage,
    onNav: nav,
    user: user,
    onLogout: handleLogout,
    lang: lang,
    onSelectLang: selectLang
  }), page === "home" && /*#__PURE__*/React.createElement(KramaHome, {
    onNav: nav,
    onOpenJob: openJob,
    saved: saved,
    toggleSave: toggleSave
  }), page === "jobs" && /*#__PURE__*/React.createElement(KramaJobs, {
    onNav: nav,
    onOpenJob: openJob,
    saved: saved,
    toggleSave: toggleSave,
    initialCategory: jobCategory,
    initialCompany: jobCompany,
    initialKeyword: jobKeyword,
    initialLocation: jobLocation
  }), page === "companies" && /*#__PURE__*/React.createElement(KramaCompanies, {
    onNav: nav,
    initialCompany: jobCompany
  }), page === "community" && /*#__PURE__*/React.createElement(KramaCommunity, {
    onNav: nav,
    user: user,
    initialThreadId: forumThreadId
  }), page === "company" && /*#__PURE__*/React.createElement(KramaCompanyProfile, {
    companyId: companyId,
    initialTab: companyTab,
    onNav: nav,
    onOpenJob: openJob,
    saved: saved,
    toggleSave: toggleSave
  }), INFO.includes(page) && /*#__PURE__*/React.createElement(KramaInfoPage, {
    slug: page,
    onNav: nav
  }), page === "detail" && /*#__PURE__*/React.createElement(KramaJobDetail, {
    job: job,
    onBack: () => nav("jobs"),
    onOpenJob: openJob,
    onApply: setApplyJob,
    saved: saved,
    toggleSave: toggleSave,
    onNav: nav
  }), /*#__PURE__*/React.createElement(KramaFooter, {
    onNav: nav
  }), /*#__PURE__*/React.createElement(KramaApplyModal, {
    job: applyJob,
    onClose: () => setApplyJob(null),
    user: user,
    onNav: nav
  }), window.KramaChatAgent ? /*#__PURE__*/React.createElement(window.KramaChatAgent, {
    onNav: nav
  }) : null);
}
window.KramaPublicApp = App;