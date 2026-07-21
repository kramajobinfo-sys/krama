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
  const toggleLang = () => {
    var next = (window.KRAMA_LANG === "km") ? "en" : "km";
    if (window.KRAMA_SET_LANG) window.KRAMA_SET_LANG(next);
    setLang(next);
  };

  React.useEffect(() => {
    const api = window.KRAMA_API;
    const params = new URLSearchParams(window.location.search);
    const deepJobId = params.get("job");
    // Password-reset deep link (?reset=1&token=…&email=…) opens the reset view.
    if (params.get("reset")) { setPage("forgot"); }
    // Community deep link (?thread=N) opens that discussion (used by digest emails).
    const deepThreadId = params.get("thread");
    if (deepThreadId) { setForumThreadId(deepThreadId); setPage("community"); }
    const ctrl = new AbortController();
    setTimeout(() => ctrl.abort(), 8000);
    Promise.allSettled([
      api.init(),
      api.fetchMe().then((u) => { if (u) setUser(u); }),
      deepJobId
        ? fetch((/^(localhost|127\.0\.0\.1|::1|192\.168\.|10\.)/.test(window.location.hostname) ? 'http://127.0.0.1:8000/api' : (window.location.protocol + '//' + window.location.host + '/api')) + "/jobs/" + encodeURIComponent(deepJobId), { signal: ctrl.signal })
            .then((r) => r.ok ? r.json() : null)
            .then((j) => {
              if (j && j.id) { openJob(window.KRAMA_API.normaliseJob(j)); return; }
              // API failed or job not found — check if init() already cached it
              const cached = window.KRAMA_DATA && window.KRAMA_DATA.jobs && window.KRAMA_DATA.jobs.find(x => String(x.id) === String(deepJobId) || x.slug === deepJobId);
              if (cached) { openJob(cached); return; }
              // Nothing found — land on jobs page rather than silent home
              setPage("jobs");
            })
            .catch(() => { setPage("jobs"); })
        : Promise.resolve(),
    ]).finally(() => setReady(true));
  }, []);

  const toggleSave = (id) => {
    const api = window.KRAMA_API;
    if (!user) { nav("login"); return; }
    setSaved((s) => {
      if (s.includes(id)) { api.unsaveJob(id).catch(() => {}); return s.filter((x) => x !== id); }
      api.saveJob(id).catch(() => {});
      return [...s, id];
    });
  };

  const openJob = (j) => { setJob(j); setPage("detail"); window.scrollTo(0, 0); };
  const nav = (p, opts) => {
    opts = opts || {};
    setJobCategory(opts.category || "All categories");
    setJobCompany(opts.company || "");
    setJobKeyword(opts.keyword || "");
    setJobLocation(opts.location || "");
    if (opts.companyId != null) setCompanyId(opts.companyId);
    setCompanyTab(opts.tab != null ? opts.tab : null);
    setPage(p);
    window.scrollTo(0, 0);
  };

  const handleLogin = (u) => {
    setUser(u);
    const roleSlug = u && u.role && u.role.slug;
    const token = localStorage.getItem("krama_access_token");
    if (roleSlug === "employer") {
      if (token) localStorage.setItem("krama_employer_token", token);
      window.location.href = "/krama/krama/ui_kits/employer-dashboard/index.html";
    } else if (roleSlug === "admin" || roleSlug === "super_admin") {
      if (token) localStorage.setItem("krama_admin_token", token);
      window.location.href = "/krama/krama/ui_kits/admin-dashboard/index.html";
    } else {
      window.location.href = "/krama/krama/ui_kits/candidate-dashboard/index.html";
    }
  };
  const handleLogout = () => { window.KRAMA_API.logout(); setUser(null); nav("home"); };

  React.useEffect(() => { if (window.lucide) window.lucide.createIcons(); });

  const { KramaHeader, KramaFooter, KramaHome, KramaJobs, KramaCompanies, KramaCompanyProfile, KramaJobDetail,
          KramaLogin, KramaRegister, KramaForgotPassword, KramaApplyModal, KramaInfoPage, KramaCandidateProfile,
          KramaCommunity } = window;

  if (!ready) return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: "var(--teal-800)", gap: 16 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <img src={window.getKramaLogo("../../assets/krama-mark.svg")} height="40" alt="KRAMA" />
        <span style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "24px", letterSpacing: ".08em", color: "#fff", opacity: 0.9 }}>{window.KRAMA_BRAND_NAME || "KRAMA"}</span>
      </div>
      <div style={{ width: 36, height: 36, border: "3px solid rgba(255,255,255,0.2)", borderTopColor: "#fff", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  if (page === "login")    return <KramaLogin onNav={nav} onLogin={handleLogin} />;
  if (page === "register") return <KramaRegister onNav={nav} onLogin={handleLogin} />;
  if (page === "forgot")   return <KramaForgotPassword onNav={nav} />;

  const INFO = ["about", "contact", "terms", "privacy", "pricing", "employers"];
  const headerPage = page === "detail" ? "jobs" : page === "company" ? "companies" : (INFO.includes(page) ? "" : page);

  if (page === "candidateProfile") {
    return (
      <div>
        <KramaHeader page="" onNav={nav} user={user} onLogout={handleLogout} lang={lang} onToggleLang={toggleLang} />
        {KramaCandidateProfile
          ? <KramaCandidateProfile user={user} onNav={nav} onUserUpdate={(u) => setUser(u)} />
          : <div style={{ padding: 40, textAlign: "center", color: "var(--text-muted)" }}>Loading…</div>}
        <KramaFooter onNav={nav} />
      </div>
    );
  }

  return (
    <div>
      <KramaHeader page={headerPage} onNav={nav} user={user} onLogout={handleLogout} lang={lang} onToggleLang={toggleLang} />
      {page === "home" && <KramaHome onNav={nav} onOpenJob={openJob} saved={saved} toggleSave={toggleSave} />}
      {page === "jobs" && <KramaJobs onNav={nav} onOpenJob={openJob} saved={saved} toggleSave={toggleSave} initialCategory={jobCategory} initialCompany={jobCompany} initialKeyword={jobKeyword} initialLocation={jobLocation} />}
      {page === "companies" && <KramaCompanies onNav={nav} initialCompany={jobCompany} />}
      {page === "community" && <KramaCommunity onNav={nav} user={user} initialThreadId={forumThreadId} />}
      {page === "company" && <KramaCompanyProfile companyId={companyId} initialTab={companyTab} onNav={nav} onOpenJob={openJob} saved={saved} toggleSave={toggleSave} />}
      {INFO.includes(page) && <KramaInfoPage slug={page} onNav={nav} />}
      {page === "detail" && <KramaJobDetail job={job} onBack={() => nav("jobs")} onOpenJob={openJob} onApply={setApplyJob} saved={saved} toggleSave={toggleSave} onNav={nav} />}
      <KramaFooter onNav={nav} />
      <KramaApplyModal job={applyJob} onClose={() => setApplyJob(null)} user={user} onNav={nav} />
      {window.KramaChatAgent ? <window.KramaChatAgent onNav={nav} /> : null}
    </div>
  );
}
window.KramaPublicApp = App;
