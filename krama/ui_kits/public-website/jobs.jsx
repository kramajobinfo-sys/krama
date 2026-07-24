// Jobs search + Companies directory -- functional filters.
(function init() {
  if (!window.KramaDesignSystem_1a6f65) { return setTimeout(init, 40); }
  const { JobCard, CompanyCard, Tag, Select, Checkbox, Button, Badge, Avatar, EmptyState } = window.KramaDesignSystem_1a6f65;
  const D = window.KRAMA_DATA;
  const TR = window.KRAMA_T || function (s) { return s; };
  const I = (n, s = 18) => <i data-lucide={n} style={{ width: s, height: s }}></i>;

  // map a job to a coarse category bucket matching the filter options
  const catOf = (j) => j.category || "";

  // Admin-controlled promos (Find Jobs). Read Admin Console settings.
  const SB_DEFAULT = { visible: true, theme: "teal", icon: "sparkles", title: "Boost your search", message: "Complete your profile to get AI-matched roles and apply in one click.", cta: "Build your profile", image: "../../assets/banners/bg-sidebarBanner.svg", fit: "cover" };
  const CB_DEFAULT = { visible: true, theme: "saffron", icon: "rocket", title: "Hiring? Reach top talent", message: "Post a job and get in front of 40,000+ candidates.", cta: "Post a job", image: "../../assets/banners/bg-categoryBanner.svg", fit: "cover" };
  const CO_DEFAULT = { visible: true, theme: "teal", icon: "building-2", title: "Get your company verified", message: "Verified employers rank higher and earn candidate trust.", cta: "List your company", image: "../../assets/banners/bg-companiesBanner.svg", fit: "cover" };
  const CO2_DEFAULT = { visible: true, theme: "dark", icon: "images", title: "Showcase your company", message: "Add photos, awards, and social links to your profile to stand out to candidates.", cta: "Complete your profile", image: "../../assets/banners/bg-companiesBanner2.svg", fit: "cover" };
  const FJ3_DEFAULT = { visible: true, theme: "saffron", icon: "bell", title: "Job alerts", message: "Get an email the moment a matching role is posted.", cta: "Create alert", image: "../../assets/banners/bg-findJobsBanner3.svg", fit: "cover" };
  const FJ4_DEFAULT = { visible: true, theme: "dark", icon: "briefcase", title: "Career resources", message: "Tips, guides, and tools to help you land your next role.", cta: "Explore", ctaUrl: "", image: "../../assets/banners/bg-findJobsBanner4.svg", fit: "cover" };
  const CO3_DEFAULT = { visible: true, theme: "saffron", icon: "bell", title: "Company alerts", message: "Follow employers and get notified when they post new roles.", cta: "Follow companies", image: "../../assets/banners/bg-companiesBanner3.svg", fit: "cover" };
  const CO4_DEFAULT = { visible: true, theme: "teal", icon: "sparkles", title: "Browse by industry", message: "Find employers in banking, telecom, retail and more.", cta: "Explore industries", image: "../../assets/banners/bg-companiesBanner4.svg", fit: "cover" };
  const FJ_TOP_DEFAULT = { visible: true, theme: "saffron", icon: "bell", title: "Job alerts", message: "Get an email the moment a matching role is posted.", cta: "Create alert", ctaUrl: "", image: "../../assets/banners/bg-findJobsTopBanner.svg", fit: "cover" };
  const CO_TOP_DEFAULT = { visible: true, theme: "saffron", icon: "building-2", title: "Are you hiring?", message: "List your company and reach 40,000+ verified candidates.", cta: "Post a job", ctaUrl: "", image: "../../assets/banners/bg-companiesTopBanner.svg", fit: "cover" };
  const FJ_HERO_DEFAULT = { heading: "Find your next opportunity", sub: "Browse thousands of verified roles across Cambodia -- filter by category, location, and work mode.", image: "../../assets/banners/bg-findJobsHero.svg", fit: "cover", imgOverlay: 45 };
  const CO_HERO_DEFAULT = { heading: "Verified companies hiring now", sub: "Explore {count} approved employers across Cambodia.", image: "../../assets/banners/bg-companiesHero.svg", fit: "cover", imgOverlay: 45 };
  function loadBanner(key, def) {
    try { const s = JSON.parse(localStorage.getItem("krama_home_settings") || "{}"); const m = Object.assign({}, def, s[key] || {}); if (!m.image && def.image) m.image = def.image; return m; }
    catch (e) { return Object.assign({}, def); }
  }
  function useHomeContent() {
    const [, setTick] = React.useState(0);
    React.useEffect(function() {
      var apiBase = (/^(localhost|127\.0\.0\.1|::1|192\.168\.|10\.)/.test(window.location.hostname) ? 'http://127.0.0.1:8000/api' : (window.location.protocol + '//' + window.location.host + '/api'));
      fetch(apiBase + '/settings/home_content', { cache: 'no-cache' })
        .then(function(r) { return r.ok ? r.json() : null; })
        .then(function(d) {
          if (d && d.data) {
            try { localStorage.setItem('krama_home_settings', JSON.stringify(JSON.parse(d.data))); setTick(1); } catch (e) {}
          }
        })
        .catch(function() {});
    }, []);
  }
  const SB_THEME = {
    teal:        { bg: "var(--teal-800)",     fg: "#fff", ctaBg: "#fff",           ctaFg: "var(--teal-800)" },
    saffron:     { bg: "var(--saffron-500)",  fg: "#fff", ctaBg: "#fff",           ctaFg: "var(--saffron-700)" },
    dark:        { bg: "var(--stone-900)",    fg: "#fff", ctaBg: "var(--accent)",  ctaFg: "#fff" },
    blank:       { bg: "var(--surface-card)", fg: "var(--text-body)", ctaBg: "var(--brand)", ctaFg: "#fff" },
    transparent: { bg: "transparent",         fg: "var(--text-body)", ctaBg: "var(--brand)", ctaFg: "#fff" },
  };
  function resolveSbTheme(b) {
    if (b.theme === "custom") return { bg: b.customBg || "var(--teal-800)", fg: b.customFg || "#fff", ctaBg: b.customCtaBg || "#fff", ctaFg: b.customCtaFg || "var(--teal-800)" };
    const t = SB_THEME[b.theme] || SB_THEME.teal;
    return b.customFg ? Object.assign({}, t, { fg: b.customFg }) : t;
  }
  function PromoBox({ b, onNav, onCtaClick, style }) {
    if (!b.visible) return null;
    const t = resolveSbTheme(b);
    const hasImg = !!b.image;
    const isLight = b.theme === "transparent" || b.theme === "blank";
    const handleCta = () => {
      if (onCtaClick) { onCtaClick(); return; }
      if (b.ctaUrl) { window.open(b.ctaUrl, b.ctaUrl.startsWith("http") ? "_blank" : "_self"); } else { onNav && onNav("register"); }
    };
    return (
      <div style={Object.assign({ position: "relative", overflow: "hidden", borderRadius: "var(--radius-lg)", background: t.bg, color: t.fg, padding: 18, minHeight: b.hideText ? 200 : undefined, border: isLight ? "1px solid var(--border)" : "none" }, style)}>
        {hasImg
          ? <React.Fragment>
              <div style={{ position: "absolute", inset: 0, backgroundImage: "url('" + b.image + "')", backgroundSize: b.fit === "contain" ? "contain" : "cover", backgroundRepeat: "no-repeat", backgroundPosition: "center" }} />
              <div style={{ position: "absolute", inset: 0, background: t.bg, opacity: (b.imgOverlay != null ? b.imgOverlay : 20) / 100 }} />
            </React.Fragment>
          : <div style={{ position: "absolute", inset: 0, background: "url('../../assets/krama-pattern.svg')", backgroundSize: 56, opacity: isLight ? 0.04 : 0.1 }} />}
        {!b.hideText && (
        <div style={{ position: "relative" }}>
          <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 38, height: 38, borderRadius: "var(--radius-md)", background: isLight ? "var(--surface-sunken)" : "rgba(255,255,255,0.16)", marginBottom: 12 }}>{I(b.icon || "sparkles", 18)}</span>
          <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "var(--text-md)" }}>{TR(b.title)}</div>
          <p style={{ fontSize: "var(--text-sm)", color: b.customFg ? b.customFg : (isLight ? "var(--text-muted)" : "rgba(255,255,255,0.88)"), marginTop: 6, lineHeight: 1.45, opacity: b.customFg ? 0.85 : 1 }}>{TR(b.message)}</p>
          {b.cta ? <button onClick={handleCta} style={{ marginTop: 14, width: "100%", height: 38, border: "none", borderRadius: "var(--radius-md)", background: t.ctaBg, color: t.ctaFg, fontFamily: "var(--font-sans)", fontWeight: 700, fontSize: "var(--text-sm)", cursor: "pointer" }}>{TR(b.cta)}</button> : null}
        </div>
        )}
      </div>
    );
  }
  function SidebarBanner({ onNav }) { return <PromoBox b={loadBanner("sidebarBanner", SB_DEFAULT)} onNav={onNav} style={{ marginTop: 18 }} />; }
  function CategoryBanner({ onNav }) { return <PromoBox b={loadBanner("categoryBanner", CB_DEFAULT)} onNav={onNav} style={{ marginTop: 0 }} />; }
  const BAR_THEMES = { saffron: { bg: "var(--saffron-500)", pill: "#fff", pillFg: "var(--saffron-700)" }, teal: { bg: "var(--teal-700)", pill: "#fff", pillFg: "var(--teal-800)" }, dark: { bg: "var(--stone-900)", pill: "var(--saffron-500)", pillFg: "#fff" }, brand: { bg: "var(--brand-700)", pill: "#fff", pillFg: "var(--brand-800)" }, blank: { bg: "var(--surface-card)", pill: "var(--brand)", pillFg: "#fff" }, transparent: { bg: "transparent", pill: "var(--brand)", pillFg: "#fff" } };
  function resolveBarTheme(b) {
    if (b.theme === "custom") return { bg: b.customBg || "var(--saffron-500)", pill: b.customCtaBg || "#fff", pillFg: b.customCtaFg || "var(--saffron-700)", fg: b.customFg || "#fff" };
    const isLight = b.theme === "transparent" || b.theme === "blank";
    const t = BAR_THEMES[b.theme] || BAR_THEMES.saffron;
    const base = Object.assign({ fg: isLight ? "var(--text-body)" : "#fff" }, t);
    return b.customFg ? Object.assign({}, base, { fg: b.customFg }) : base;
  }
  function AnnouncementBar({ b, onNav, onCtaClick }) {
    const [dismissed, setDismissed] = React.useState(false);
    if (!b || !b.visible || dismissed) return null;
    const t = resolveBarTheme(b);
    const hasImg = !!b.image;
    if (b.hideText && hasImg) {
      return (
        <div style={{ position: "relative", overflow: "hidden", background: t.bg, width: "100%", aspectRatio: "1600 / 160", maxHeight: 160, minHeight: 60 }}>
          <img src={b.image} alt="" style={{ display: "block", width: "100%", height: "100%", objectFit: "cover" }} />
          <button onClick={() => setDismissed(true)} aria-label="Dismiss" style={{ position: "absolute", top: 8, right: 12, width: 28, height: 28, borderRadius: "50%", background: "rgba(0,0,0,0.35)", border: "none", color: "#fff", cursor: "pointer", display: "inline-flex", alignItems: "center", justifyContent: "center" }}>{I("x", 16)}</button>
        </div>
      );
    }
    return (
      <div style={{ position: "relative", overflow: "hidden", background: t.bg, color: t.fg, borderBottom: (b.theme === "transparent" || b.theme === "blank") ? "1px solid var(--border)" : "none" }}>
        {hasImg
          ? <React.Fragment>
              <div style={{ position: "absolute", inset: 0, backgroundImage: "url('" + b.image + "')", backgroundSize: b.fit === "contain" ? "contain" : "cover", backgroundRepeat: "no-repeat", backgroundPosition: "center" }} />
              <div style={{ position: "absolute", inset: 0, background: t.bg, opacity: (b.imgOverlay != null ? b.imgOverlay : 20) / 100 }} />
            </React.Fragment>
          : <div style={{ position: "absolute", inset: 0, background: "url('../../assets/krama-pattern.svg')", backgroundSize: 60, opacity: 0.10 }} />}
        <div style={{ position: "relative", maxWidth: 1200, margin: "0 auto", display: "flex", alignItems: "center", gap: 14, padding: "10px 32px", minHeight: b.hideText ? 28 : undefined }}>
          {b.hideText
            ? <div style={{ flex: 1 }} />
            : <React.Fragment>
                {b.icon && <span style={{ display: "inline-flex", flexShrink: 0 }}>{I(b.icon, 18)}</span>}
                <div style={{ flex: 1, fontSize: "var(--text-sm)", fontWeight: 500 }}>
                  <strong style={{ fontWeight: 700 }}>{TR(b.title)}</strong>{b.message ? " -- " + TR(b.message) : ""}
                </div>
                {b.cta && <span onClick={() => { if (onCtaClick) { onCtaClick(); } else if (b.ctaUrl) window.open(b.ctaUrl, b.ctaUrl.startsWith("http") ? "_blank" : "_self"); else onNav && onNav("register"); }} style={{ flexShrink: 0, background: t.pill, color: t.pillFg, fontSize: "var(--text-sm)", fontWeight: 700, padding: "7px 16px", borderRadius: "var(--radius-pill)", cursor: "pointer", whiteSpace: "nowrap" }}>{TR(b.cta)}</span>}
              </React.Fragment>}
          <button onClick={() => setDismissed(true)} style={{ flexShrink: 0, background: "transparent", border: "none", color: t.fg, opacity: 0.7, cursor: "pointer", display: "inline-flex", padding: 4 }}>{I("x", 16)}</button>
        </div>
      </div>
    );
  }

  function FilterGroup({ title, children }) {
    return (
      <div style={{ padding: "18px 0", borderBottom: "1px solid var(--border)" }}>
        <div style={{ fontWeight: 700, color: "var(--text-strong)", fontSize: "var(--text-sm)", marginBottom: 12 }}>{title}</div>
        {children}
      </div>
    );
  }

  // Expanded "Details" row -- denser layout with description & actions
  function DetailRow({ job, saved, onSave, onOpen }) {
    const meta = (ic, txt, opts) => (
      <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: "var(--text-sm)", color: opts && opts.brand ? "var(--text-brand)" : "var(--text-muted)", fontWeight: opts && opts.brand ? 600 : 400 }}>{I(ic, 15)}{txt}</span>
    );
    const desc = "We're hiring a " + job.title.toLowerCase() + " to join " + job.company + " in " + job.location + ". " + (job.remote ? "Remote-friendly. " : "") + "Full job description and requirements inside.";
    return (
      <div onClick={onOpen} style={{ position: "relative", background: "var(--surface-card)", border: "1px solid " + (job.featured ? "var(--accent-border)" : "var(--border)"), borderRadius: "var(--radius-lg)", boxShadow: "var(--shadow-sm)", padding: 22, cursor: "pointer", overflow: "hidden" }}>
        {job.featured ? <span style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: "var(--accent)" }} /> : null}
        <div style={{ display: "flex", gap: 16 }}>
          <Avatar src={job.logo || (window.KRAMA_LOGOS||{})[job.company]} name={job.company} square size={52} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
              <div style={{ minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                  <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "var(--text-lg)", color: "var(--text-strong)" }}>{job.title}</span>
                  {job.featured ? <Badge tone="accent">{TR("Featured")}</Badge> : null}
                  {job.remote ? <Badge tone="brand">{TR("Remote")}</Badge> : null}
                </div>
                <div style={{ fontSize: "var(--text-sm)", color: "var(--text-muted)", marginTop: 3 }}>{job.company}</div>
              </div>
              <span style={{ fontSize: "var(--text-xs)", color: "var(--text-faint)", whiteSpace: "nowrap" }}>{job.postedAt}</span>
            </div>
            <p style={{ fontSize: "var(--text-sm)", color: "var(--text-body)", lineHeight: 1.5, margin: "10px 0 12px", maxWidth: 720 }}>{desc}</p>
            <div style={{ display: "flex", alignItems: "center", gap: 18, flexWrap: "wrap" }}>
              {meta("map-pin", job.location)}
              {meta("briefcase", job.type)}
              {meta("banknote", job.salary, { brand: true })}
              <div style={{ display: "flex", gap: 8, marginLeft: "auto" }}>
                <Button variant="secondary" size="sm" iconLeft={I(saved ? "bookmark-check" : "bookmark", 14)} onClick={(e) => { e.stopPropagation(); onSave(); }}>{saved ? TR("Saved") : TR("Save")}</Button>
                <Button variant="primary" size="sm" onClick={(e) => { e.stopPropagation(); onOpen(); }}>{TR("View & apply")}</Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Modal for creating a job alert from the public jobs page
  function JobAlertModal({ onClose, initialKeyword, initialLocation }) {
    const apiBase = /^(localhost|127\.0\.0\.1|::1|192\.168\.|10\.)/.test(window.location.hostname) ? "http://127.0.0.1:8000/api" : (window.location.protocol + "//" + window.location.host + "/api");
    const LS_KEY = "krama_access_token";
    const isLoggedIn = !!localStorage.getItem(LS_KEY);

    const [keyword, setKeyword] = React.useState(initialKeyword || "");
    const [categories, setCategories] = React.useState([]);
    const [locations, setLocations] = React.useState([]);
    const [categoryId, setCategoryId] = React.useState("");
    const [locationId, setLocationId] = React.useState("");
    const [jobType, setJobType] = React.useState("");
    const [saving, setSaving] = React.useState(false);
    const [done, setDone] = React.useState(false);
    const [err, setErr] = React.useState("");

    React.useEffect(() => {
      Promise.all([fetch(apiBase + "/categories").then(r => r.json()), fetch(apiBase + "/locations").then(r => r.json())])
        .then(([cats, locs]) => { setCategories(cats.data || cats || []); setLocations(locs.data || locs || []); })
        .catch(() => {});
    }, []);

    function handleSave(e) {
      e.preventDefault();
      setErr("");
      const payload = {};
      if (keyword.trim()) payload.keyword = keyword.trim();
      if (categoryId) payload.category_id = parseInt(categoryId);
      if (locationId) payload.location_id = parseInt(locationId);
      if (jobType) payload.job_type = jobType;
      if (!Object.keys(payload).length) { setErr("Set at least one filter."); return; }
      setSaving(true);
      const token = localStorage.getItem(LS_KEY) || "";
      fetch(apiBase + "/candidate/alerts", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": "Bearer " + token },
        body: JSON.stringify(payload),
      }).then(r => r.json().then(d => { if (!r.ok) throw new Error(d.message || "Failed"); return d; }))
        .then(() => { setSaving(false); setDone(true); })
        .catch(e => { setSaving(false); setErr(e.message); });
    }

    const overlayStyle = { position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 };
    const boxStyle = { background: "var(--surface-card)", borderRadius: "var(--radius-lg)", width: "100%", maxWidth: 480, padding: 32, position: "relative", boxShadow: "0 20px 60px rgba(0,0,0,0.3)", fontFamily: "var(--font-sans)" };
    const inputStyle = { width: "100%", padding: "9px 12px", border: "1px solid var(--border-strong)", borderRadius: "var(--radius-md)", fontFamily: "var(--font-sans)", fontSize: "var(--text-sm)", background: "var(--surface-card)", color: "var(--text-body)", boxSizing: "border-box" };
    const labelStyle = { display: "block", fontSize: "var(--text-sm)", fontWeight: 600, color: "var(--text-label)", marginBottom: 6, marginTop: 14 };

    return (
      <div style={overlayStyle} onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
        <div style={boxStyle}>
          <button onClick={onClose} style={{ position: "absolute", top: 16, right: 16, border: "none", background: "transparent", cursor: "pointer", color: "var(--text-muted)", display: "inline-flex", padding: 4 }}>{I("x", 20)}</button>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
            <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 36, height: 36, background: "var(--saffron-100)", borderRadius: "var(--radius-md)", color: "var(--saffron-700)" }}>{I("bell", 18)}</span>
            <div style={{ fontWeight: 800, fontSize: "var(--text-lg)", color: "var(--text-strong)" }}>{TR("Create job alert")}</div>
          </div>
          <p style={{ fontSize: "var(--text-sm)", color: "var(--text-muted)", marginBottom: 20, marginTop: 4 }}>Get an email the moment a matching role is posted.</p>

          {!isLoggedIn ? (
            <div style={{ textAlign: "center", paddingTop: 12 }}>
              <p style={{ color: "var(--text-body)", fontSize: "var(--text-sm)", marginBottom: 18 }}>Sign in to your candidate account to set up job alerts.</p>
              <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
                <button onClick={() => { onClose(); window.location.href = "/krama/krama/ui_kits/candidate-dashboard/index.html"; }} style={{ padding: "10px 22px", background: "var(--brand)", color: "#fff", border: "none", borderRadius: "var(--radius-md)", fontWeight: 700, cursor: "pointer", fontSize: "var(--text-sm)" }}>{TR("Sign in")}</button>
                <button onClick={onClose} style={{ padding: "10px 18px", background: "var(--surface-sunken)", color: "var(--text-body)", border: "1px solid var(--border-strong)", borderRadius: "var(--radius-md)", fontWeight: 600, cursor: "pointer", fontSize: "var(--text-sm)" }}>{TR("Cancel")}</button>
              </div>
            </div>
          ) : done ? (
            <div style={{ textAlign: "center", paddingTop: 8 }}>
              <span style={{ fontSize: 40 }}>🎉</span>
              <div style={{ fontWeight: 700, color: "var(--text-strong)", marginTop: 12 }}>Alert created!</div>
              <p style={{ color: "var(--text-muted)", fontSize: "var(--text-sm)", marginTop: 6 }}>We'll email you when a matching job is posted. Manage your alerts in the candidate dashboard.</p>
              <button onClick={onClose} style={{ marginTop: 18, padding: "10px 24px", background: "var(--brand)", color: "#fff", border: "none", borderRadius: "var(--radius-md)", fontWeight: 700, cursor: "pointer", fontSize: "var(--text-sm)" }}>{TR("Done")}</button>
            </div>
          ) : (
            <form onSubmit={handleSave}>
              <label style={labelStyle}>{TR("Keyword")}</label>
              <input style={inputStyle} placeholder={TR("e.g. Software Engineer")} value={keyword} onChange={e => setKeyword(e.target.value)} />
              <label style={labelStyle}>{TR("Category")}</label>
              <select style={inputStyle} value={categoryId} onChange={e => setCategoryId(e.target.value)}>
                <option value="">{TR("Any category")}</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
              <label style={labelStyle}>{TR("Location")}</label>
              <select style={inputStyle} value={locationId} onChange={e => setLocationId(e.target.value)}>
                <option value="">{TR("Any location")}</option>
                {locations.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
              </select>
              <label style={labelStyle}>{TR("Job type")}</label>
              <select style={inputStyle} value={jobType} onChange={e => setJobType(e.target.value)}>
                <option value="">{TR("Any")}</option>
                <option value="full_time">{TR("Full-time")}</option>
                <option value="part_time">{TR("Part-time")}</option>
                <option value="contract">{TR("Contract")}</option>
                <option value="internship">{TR("Internship")}</option>
              </select>
              {err && <div style={{ color: "var(--danger)", fontSize: "var(--text-sm)", marginTop: 12 }}>{err}</div>}
              <div style={{ display: "flex", gap: 10, marginTop: 22 }}>
                <button type="submit" disabled={saving} style={{ flex: 1, padding: "11px 0", background: "var(--brand)", color: "#fff", border: "none", borderRadius: "var(--radius-md)", fontWeight: 700, cursor: "pointer", fontSize: "var(--text-sm)", opacity: saving ? 0.7 : 1 }}>{saving ? "Saving…" : "Save alert"}</button>
                <button type="button" onClick={onClose} style={{ padding: "11px 18px", background: "var(--surface-sunken)", color: "var(--text-body)", border: "1px solid var(--border-strong)", borderRadius: "var(--radius-md)", fontWeight: 600, cursor: "pointer", fontSize: "var(--text-sm)" }}>{TR("Cancel")}</button>
              </div>
            </form>
          )}
        </div>
      </div>
    );
  }

  function Jobs({ onNav, onOpenJob, saved, toggleSave, initialCategory, initialCompany, initialKeyword, initialLocation }) {
    useHomeContent();
    const [keyword, setKeyword] = React.useState(initialKeyword || "");
    const [query, setQuery] = React.useState(initialKeyword || "");
    const debounceRef = React.useRef(null);
    const handleKeywordChange = (val) => {
      setKeyword(val);
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => { setQuery(val); }, 300);
    };
    const [location, setLocation] = React.useState(initialLocation || "");
    const [category, setCategory] = React.useState(initialCategory || "All categories");
    const [company, setCompany] = React.useState(initialCompany || "");
    const [workModes, setWorkModes] = React.useState({ "On-site": false, Remote: false, Hybrid: false });
    const [salaryMin, setSalaryMin] = React.useState(0);
    const [sort, setSort] = React.useState("Newest");
    const [view, setView] = React.useState("grid");
    const [page, setPage] = React.useState(0);
    const PER_PAGE = 14;
    const fjTopBanner = loadBanner("findJobsTopBanner", FJ_TOP_DEFAULT);
    const fjBanner1 = loadBanner("sidebarBanner", SB_DEFAULT);
    const fjBanner2 = loadBanner("categoryBanner", CB_DEFAULT);
    const fjBanner3 = loadBanner("findJobsBanner3", FJ3_DEFAULT);
    const fjBanner4 = loadBanner("findJobsBanner4", FJ4_DEFAULT);

    const [filtersOpen, setFiltersOpen] = React.useState(false);
    const [alertModalOpen, setAlertModalOpen] = React.useState(false);
    const openAlertModal = () => setAlertModalOpen(true);

    React.useEffect(() => { if (window.lucide) window.lucide.createIcons(); });

    const toggleMode = (m) => setWorkModes((s) => ({ ...s, [m]: !s[m] }));

    const clearAll = () => {
      setKeyword(""); setQuery(""); setLocation(""); setCategory("All categories"); setCompany("");
      setWorkModes({ "On-site": false, Remote: false, Hybrid: false }); setSalaryMin(0);
    };

    // parse a salary string like "$800-1,200/mo" to its lower bound for sorting
    const salaryLow = (s) => {
      const m = (s || "").replace(/,/g, "").match(/\d+/);
      return m ? parseInt(m[0], 10) : 0;
    };
    // upper bound of a range like "$800-1,200/mo"
    const salaryHigh = (s) => {
      const nums = (s || "").replace(/,/g, "").match(/\d+/g);
      return nums ? parseInt(nums[nums.length - 1], 10) : 0;
    };

    let results = (D.jobs || []).filter((j) => {
      if (query.trim()) {
        const k = query.toLowerCase();
        if (!((j.title + " " + j.company).toLowerCase().includes(k))) return false;
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
        const matchRemote = remoteOn && j.remote;
        const matchOnsite = onsiteOn && !j.remote;
        if (!(matchRemote || matchOnsite)) return false;
      }
      return true;
    });
    if (sort === "Highest salary") results = results.slice().sort((a, b) => salaryLow(b.salary) - salaryLow(a.salary));
    else if (sort === "Oldest") results = results.slice().reverse();

    // pagination -- 12 per page
    const pages = Math.max(1, Math.ceil(results.length / PER_PAGE));
    const pageSafe = Math.min(page, pages - 1);
    const pageResults = results.slice(pageSafe * PER_PAGE, pageSafe * PER_PAGE + PER_PAGE);
    // reset to first page whenever the filtered set changes
    const filterSig = query + "|" + location + "|" + category + "|" + company + "|" + JSON.stringify(workModes) + "|" + salaryMin + "|" + sort;
    React.useEffect(() => { setPage(0); }, [filterSig]);

    // active filter chips
    const chips = [];
    if (query.trim()) chips.push(["keyword", "\"" + query.trim() + "\""]);
    if (company) chips.push(["company", company]);
    if (category !== "All categories") chips.push(["category", category]);
    Object.keys(workModes).forEach((m) => { if (workModes[m]) chips.push(["mode:" + m, m]); });
    if (salaryMin > 0) chips.push(["salary", "≥ $" + salaryMin.toLocaleString() + "/mo"]);
    if (location.trim()) chips.push(["location", location]);
    const removeChip = (key) => {
      if (key === "keyword") { setKeyword(""); setQuery(""); }
      else if (key === "category") setCategory("All categories");
      else if (key === "company") setCompany("");
      else if (key === "salary") setSalaryMin(0);
      else if (key === "location") setLocation("");
      else if (key.startsWith("mode:")) toggleMode(key.slice(5));
    };

    return (
      <div style={{ background: "var(--surface-page)", minHeight: "70vh" }}>
        {alertModalOpen && <JobAlertModal onClose={() => setAlertModalOpen(false)} initialKeyword={keyword} initialLocation={location} />}
        <AnnouncementBar b={fjTopBanner} onNav={onNav} onCtaClick={openAlertModal} />
        {/* top banner */}
        {(() => { const h = loadBanner("findJobsHero", FJ_HERO_DEFAULT); return (
        <div className={"krm-page-hero" + (h.hideText ? " krm-page-hero--img" : "")} style={{ position: "relative", background: "var(--teal-800)", overflow: "hidden", padding: h.hideText ? 0 : "64px 32px", aspectRatio: h.hideText ? "1600 / 480" : undefined, maxHeight: h.hideText ? 480 : undefined }}>
          {h.image
            ? <React.Fragment>
                <img className="krm-page-hero-bg" src={h.image} alt="" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: h.fit === "contain" ? "contain" : "cover", display: "block" }} />
                <div className="krm-page-hero-tint" style={{ position: "absolute", inset: 0, background: "var(--teal-800)", opacity: (h.imgOverlay != null ? h.imgOverlay : 60) / 100 }} />
              </React.Fragment>
            : <div style={{ position: "absolute", inset: 0, background: "url('../../assets/krama-pattern.svg')", backgroundSize: 72, opacity: 0.08 }} />}
          {!h.hideText && (
          <div style={{ position: "relative", maxWidth: 1200, margin: "0 auto" }}>
            <div style={{ fontSize: "var(--text-xs)", fontWeight: 800, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--teal-200)" }}>{TR("Find jobs")}</div>
            <h1 style={{ color: "#fff", fontSize: "var(--text-4xl)", fontWeight: 800, letterSpacing: "-0.02em", marginTop: 6 }}>{TR(h.heading)}</h1>
            <p style={{ color: "var(--stone-300)", fontSize: "var(--text-lg)", marginTop: 8 }}>{TR(h.sub)}</p>
          </div>
          )}
        </div>
        ); })()}
        {/* search bar strip */}
        <div className="krm-jobs-search-strip" style={{ background: "var(--surface-card)", borderBottom: "1px solid var(--border)", padding: "20px 32px" }}>
          <div className="krm-jobs-search-bar" style={{ maxWidth: 1200, margin: "0 auto", display: "flex", gap: 10 }}>
            <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 8, padding: "0 14px", height: 44, border: "1px solid var(--border-strong)", borderRadius: "var(--radius-md)", background: "var(--surface-card)" }}>
              <span style={{ color: "var(--text-faint)" }}>{I("search")}</span>
              <input value={keyword} onChange={(e) => handleKeywordChange(e.target.value)} placeholder={TR("Job title or keyword")} style={{ flex: 1, border: "none", outline: "none", fontFamily: "var(--font-sans)", fontSize: "var(--text-base)", background: "transparent" }} />
            </div>
            <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 8, padding: "0 14px", height: 44, border: "1px solid var(--border-strong)", borderRadius: "var(--radius-md)", background: "var(--surface-card)" }}>
              <span style={{ color: "var(--text-faint)" }}>{I("map-pin")}</span>
              <input value={location} onChange={(e) => setLocation(e.target.value)} placeholder={TR("City or province")} style={{ flex: 1, border: "none", outline: "none", fontFamily: "var(--font-sans)", fontSize: "var(--text-base)", background: "transparent" }} />
            </div>
            <Button variant="primary">{TR("Search")}</Button>
          </div>
        </div>

        {/* Mobile filter toggle */}
        <div className="krm-filter-toggle-bar" style={{ display: "none", padding: "10px 16px", background: "var(--surface-card)", borderBottom: "1px solid var(--border)" }}>
          <button onClick={() => setFiltersOpen(o => !o)} style={{ display: "flex", alignItems: "center", gap: 8, border: "1px solid var(--border-strong)", borderRadius: "var(--radius-md)", padding: "8px 16px", background: "var(--surface-card)", cursor: "pointer", fontFamily: "var(--font-sans)", fontWeight: 600, fontSize: "var(--text-sm)", color: "var(--text-strong)", width: "100%" }}>
            <i data-lucide="sliders-horizontal" style={{ width: 16, height: 16 }}></i>
            {filtersOpen ? TR("Hide filters") : TR("Show filters")}
            {chips.length > 0 && <span style={{ marginLeft: "auto", background: "var(--brand)", color: "#fff", borderRadius: "var(--radius-full)", fontSize: "var(--text-xs)", fontWeight: 700, padding: "2px 7px" }}>{chips.length}</span>}
          </button>
        </div>

        <div className="krm-jobs-layout" style={{ maxWidth: 1200, margin: "0 auto", padding: "28px 32px", display: "grid", gridTemplateColumns: "260px 1fr", gap: 28, alignItems: "start" }}>
          {/* filters */}
          <aside className={"krm-jobs-sidebar" + (filtersOpen ? " open" : "")} style={{ background: "var(--surface-card)", border: "1px solid var(--border)", borderRadius: "var(--radius-lg)", padding: "4px 18px 18px" }}>
            <FilterGroup title="Category">
              <Select value={category} onChange={(e) => setCategory(e.target.value)} options={["All categories", "IT", "Accounting", "Finance", "Marketing", "HR", "Engineering", "Sales", "Healthcare"]} size="sm" />
            </FilterGroup>
            <FilterGroup title="Minimum salary">
              <Select value={String(salaryMin)} onChange={(e) => setSalaryMin(parseInt(e.target.value, 10))}
                options={[{ value: "0", label: "Any salary" }, { value: "500", label: "$500+/mo" }, { value: "800", label: "$800+/mo" }, { value: "1000", label: "$1,000+/mo" }, { value: "1500", label: "$1,500+/mo" }, { value: "2000", label: "$2,000+/mo" }]}
                size="sm" />
            </FilterGroup>
            <FilterGroup title="Work mode">
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {["On-site", "Remote", "Hybrid"].map((m) => (
                  <Checkbox key={m} label={m} checked={workModes[m]} onChange={() => toggleMode(m)} />
                ))}
              </div>
            </FilterGroup>
            <div style={{ paddingTop: 18 }}>
              <Button variant="secondary" block size="sm" onClick={clearAll}>{TR("Clear filters")}</Button>
            </div>
            {/* promos -- all outside the filter groups */}
            <div style={{ display: "flex", flexDirection: "column", gap: 16, marginTop: 18 }}>
              {fjBanner1.visible ? <PromoBox b={fjBanner1} onNav={onNav} style={{ marginTop: 0 }} /> : null}
              {fjBanner2.visible ? <PromoBox b={fjBanner2} onNav={onNav} style={{ marginTop: 0 }} /> : null}
              {fjBanner3.visible ? <PromoBox b={fjBanner3} onNav={onNav} onCtaClick={openAlertModal} style={{ marginTop: 0 }} /> : null}
              {fjBanner4.visible ? <PromoBox b={fjBanner4} onNav={onNav} style={{ marginTop: 0 }} /> : null}
            </div>
          </aside>

          {/* results */}
          <main>
            <div className="krm-results-header" style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 16, gap: 16 }}>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontWeight: 700, fontSize: "var(--text-xl)", color: "var(--text-strong)", fontFamily: "var(--font-display)" }}>
                  {results.length} {results.length === 1 ? TR("job") : TR("jobs")}{location.trim() ? " " + TR("in") + " " + location : ""}
                </div>
                {chips.length > 0 && (
                  <div style={{ display: "flex", gap: 8, marginTop: 10, flexWrap: "wrap" }}>
                    {chips.map(([key, label]) => (
                      <Tag key={key} active removable onRemove={() => removeChip(key)}>{label}</Tag>
                    ))}
                  </div>
                )}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 12, flexShrink: 0 }}>
                {/* view switcher */}
                <div style={{ display: "flex", gap: 2, padding: 3, background: "var(--surface-sunken)", borderRadius: "var(--radius-md)" }}>
                  {[["list", "list", "List"], ["grid", "layout-grid", "Grid"], ["details", "rows-3", "Details"]].map(([val, ic, label]) => {
                    const on = view === val;
                    return (
                      <button key={val} onClick={() => setView(val)} title={label} aria-label={label} style={{
                        display: "inline-flex", alignItems: "center", justifyContent: "center", width: 36, height: 34, cursor: "pointer",
                        border: "none", borderRadius: "var(--radius-sm)",
                        background: on ? "var(--surface-card)" : "transparent", color: on ? "var(--text-brand)" : "var(--text-muted)",
                        boxShadow: on ? "var(--shadow-xs)" : "none",
                      }}>{I(ic, 17)}</button>
                    );
                  })}
                </div>
                <span style={{ fontSize: "var(--text-sm)", color: "var(--text-muted)" }}>{TR("Sort")}</span>
                <Select value={sort} onChange={(e) => setSort(e.target.value)} options={["Newest", "Oldest", "Highest salary"]} size="sm" containerStyle={{ minWidth: 150 }} />
              </div>
            </div>

            {results.length > 0 ? (
              <React.Fragment>
              {view === "details"
                ? <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>{pageResults.map((j) => <DetailRow key={j.id} job={j} saved={saved.includes(j.id)} onSave={() => toggleSave(j.id)} onOpen={() => onOpenJob(j)} />)}</div>
                : <div className={view === "grid" ? "krm-jobs-grid-view" : "krm-jobs-list-view"} style={view === "grid"
                    ? { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }
                    : { display: "flex", flexDirection: "column", gap: 14 }}>
                    {pageResults.map((j) => (
                      <JobCard key={j.id} {...j} saved={saved.includes(j.id)} onSave={() => toggleSave(j.id)} onClick={() => onOpenJob(j)} />
                    ))}
                  </div>}
              {pages > 1 ? (
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginTop: 28 }}>
                  <button onClick={() => setPage(Math.max(0, pageSafe - 1))} disabled={pageSafe === 0} aria-label={TR("Previous")} style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 40, height: 40, borderRadius: "var(--radius-md)", border: "1px solid var(--border-strong)", background: "var(--surface-card)", cursor: pageSafe === 0 ? "not-allowed" : "pointer", color: pageSafe === 0 ? "var(--text-faint)" : "var(--text-body)" }}>{I("chevron-left", 18)}</button>
                  {Array.from({ length: pages }).map((_, i) => (
                    <button key={i} onClick={() => setPage(i)} style={{ minWidth: 40, height: 40, padding: "0 12px", borderRadius: "var(--radius-md)", cursor: "pointer", border: "1px solid " + (i === pageSafe ? "var(--brand)" : "var(--border-strong)"), background: i === pageSafe ? "var(--brand)" : "var(--surface-card)", color: i === pageSafe ? "var(--on-brand)" : "var(--text-body)", fontFamily: "var(--font-sans)", fontSize: "var(--text-sm)", fontWeight: 700 }}>{i + 1}</button>
                  ))}
                  <button onClick={() => setPage(Math.min(pages - 1, pageSafe + 1))} disabled={pageSafe === pages - 1} aria-label={TR("Next")} style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 40, height: 40, borderRadius: "var(--radius-md)", border: "1px solid var(--border-strong)", background: "var(--surface-card)", cursor: pageSafe === pages - 1 ? "not-allowed" : "pointer", color: pageSafe === pages - 1 ? "var(--text-faint)" : "var(--text-body)" }}>{I("chevron-right", 18)}</button>
                </div>
              ) : null}
              </React.Fragment>
            ) : (
              <div style={{ background: "var(--surface-card)", border: "1px solid var(--border)", borderRadius: "var(--radius-lg)" }}>
                <EmptyState icon={I("search-x", 22)} title={TR("No jobs match your filters")}
                  description={TR("Try removing a filter or widening your search.")}
                  action={<Button variant="secondary" onClick={clearAll}>{TR("Clear filters")}</Button>} />
              </div>
            )}

            {/* Mobile-only banners — shown below results when sidebar is hidden */}
            <div className="krm-mobile-banners-fj" style={{ display: "none", flexDirection: "column", gap: 16, marginTop: 24 }}>
              {fjBanner1.visible ? <PromoBox b={fjBanner1} onNav={onNav} style={{ marginTop: 0 }} /> : null}
              {fjBanner2.visible ? <PromoBox b={fjBanner2} onNav={onNav} style={{ marginTop: 0 }} /> : null}
              {fjBanner3.visible ? <PromoBox b={fjBanner3} onNav={onNav} onCtaClick={openAlertModal} style={{ marginTop: 0 }} /> : null}
              {fjBanner4.visible ? <PromoBox b={fjBanner4} onNav={onNav} style={{ marginTop: 0 }} /> : null}
            </div>
          </main>
        </div>
      </div>
    );
  }

  // Company "Details" row -- denser layout with industry, location, open roles + actions
  function CompanyDetailRow({ c, onNav }) {
    const meta = (ic, txt) => (
      <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: "var(--text-sm)", color: "var(--text-muted)" }}>{I(ic, 15)}{txt}</span>
    );
    return (
      <div onClick={() => onNav("company", { companyId: c.id })} style={{ background: "var(--surface-card)", border: "1px solid var(--border)", borderRadius: "var(--radius-lg)", boxShadow: "var(--shadow-sm)", padding: 20, cursor: "pointer" }}>
        <div className="krm-codetail-row" style={{ display: "flex", gap: 16, alignItems: "center" }}>
          <Avatar src={c.logo || (window.KRAMA_LOGOS || {})[c.name]} name={c.name} square size={52} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "var(--text-lg)", color: "var(--text-strong)" }}>{c.name}</span>
              {c.verified ? <span style={{ color: "var(--brand)", display: "inline-flex" }} title="Verified">{I("badge-check", 16)}</span> : null}
            </div>
            <div style={{ display: "flex", gap: 18, flexWrap: "wrap", marginTop: 8 }}>
              {meta("briefcase", c.industry)}
              {meta("map-pin", c.location)}
              {meta("circle-user", c.openJobs + " open roles")}
            </div>
          </div>
          <div className="krm-codetail-actions" style={{ display: "flex", gap: 8, flexShrink: 0 }}>
            <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); onNav("company", { companyId: c.id, tab: "jobs" }); }}>{TR("View jobs")}</Button>
          </div>
        </div>
      </div>
    );
  }

  function Companies({ onNav, initialCompany }) {
    useHomeContent();
    const [keyword, setKeyword] = React.useState(initialCompany || "");
    const [industry, setIndustry] = React.useState("All industries");
    const [view, setView] = React.useState(function () {
      return (window.matchMedia && window.matchMedia("(max-width: 767px)").matches) ? "grid" : "details";
    });
    const [page, setPage] = React.useState(0);
    const PER_PAGE = 8;
    React.useEffect(() => { if (window.lucide) window.lucide.createIcons(); });

    const industries = ["All industries", ...Array.from(new Set(D.companies.map((c) => c.industry)))];
    const banner = loadBanner("companiesBanner", CO_DEFAULT);
    const banner2 = loadBanner("companiesBanner2", CO2_DEFAULT);
    const banner3 = loadBanner("companiesBanner3", CO3_DEFAULT);
    const banner4 = loadBanner("companiesBanner4", CO4_DEFAULT);
    const hasSide = banner.visible || banner2.visible || banner3.visible || banner4.visible;

    const results = D.companies.filter((c) => {
      if (keyword.trim() && !c.name.toLowerCase().includes(keyword.toLowerCase())) return false;
      if (industry !== "All industries" && c.industry !== industry) return false;
      return true;
    });
    const pages = Math.max(1, Math.ceil(results.length / PER_PAGE));
    const pageSafe = Math.min(page, pages - 1);
    const pageResults = results.slice(pageSafe * PER_PAGE, pageSafe * PER_PAGE + PER_PAGE);
    React.useEffect(() => { setPage(0); }, [keyword, industry]);

    return (
      <div style={{ background: "var(--surface-page)", minHeight: "70vh" }}>
        <AnnouncementBar b={loadBanner("companiesTopBanner", CO_TOP_DEFAULT)} onNav={onNav} />
        {/* header strip */}
        {(() => { const h = loadBanner("companiesHero", CO_HERO_DEFAULT); return (
        <div className={"krm-page-hero" + (h.hideText ? " krm-page-hero--img" : "")} style={{ position: "relative", background: "var(--teal-800)", overflow: "hidden", padding: h.hideText ? 0 : "64px 32px", aspectRatio: h.hideText ? "1600 / 480" : undefined, maxHeight: h.hideText ? 480 : undefined }}>
          {h.image
            ? <React.Fragment>
                <img className="krm-page-hero-bg" src={h.image} alt="" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: h.fit === "contain" ? "contain" : "cover", display: "block" }} />
                <div className="krm-page-hero-tint" style={{ position: "absolute", inset: 0, background: "var(--teal-800)", opacity: (h.imgOverlay != null ? h.imgOverlay : 60) / 100 }} />
              </React.Fragment>
            : <div style={{ position: "absolute", inset: 0, background: "url('../../assets/krama-pattern.svg')", backgroundSize: 72, opacity: 0.08 }} />}
          {!h.hideText && (
          <div style={{ position: "relative", maxWidth: 1200, margin: "0 auto" }}>
            <div style={{ fontSize: "var(--text-xs)", fontWeight: 800, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--teal-200)" }}>{TR("Companies")}</div>
            <h1 style={{ color: "#fff", fontSize: "var(--text-4xl)", fontWeight: 800, letterSpacing: "-0.02em", marginTop: 6 }}>{TR(h.heading)}</h1>
            <p style={{ color: "var(--stone-300)", fontSize: "var(--text-lg)", marginTop: 8 }}>{TR(h.sub).replace("{count}", D.companies.length)}</p>
          </div>
          )}
        </div>
        ); })()}

        <div className="krm-companies-layout" style={{ maxWidth: 1200, margin: "0 auto", padding: "28px 32px", display: "grid", gridTemplateColumns: hasSide ? "1fr 300px" : "1fr", gap: 28, alignItems: "start" }}>
          <main>
            {/* search + industry filter + view switcher */}
            <div className="krm-co-search-bar" style={{ display: "flex", gap: 10, marginBottom: 20, flexWrap: "wrap", alignItems: "center" }}>
              <div style={{ flex: 1, minWidth: 220, display: "flex", alignItems: "center", gap: 8, padding: "0 14px", height: 44, border: "1px solid var(--border-strong)", borderRadius: "var(--radius-md)", background: "var(--surface-card)" }}>
                <span style={{ color: "var(--text-faint)" }}>{I("search")}</span>
                <input value={keyword} onChange={(e) => setKeyword(e.target.value)} placeholder={TR("Search companies")} style={{ flex: 1, border: "none", outline: "none", fontFamily: "var(--font-sans)", fontSize: "var(--text-base)", background: "transparent" }} />
              </div>
              <Select value={industry} onChange={(e) => setIndustry(e.target.value)} options={industries} containerStyle={{ minWidth: 200 }} />
              <div style={{ display: "flex", gap: 2, padding: 3, background: "var(--surface-sunken)", borderRadius: "var(--radius-md)" }}>
                {[["grid", "layout-grid", "Grid"], ["details", "rows-3", "Details"]].map(([val, ic, label]) => {
                  const on = view === val;
                  return (
                    <button key={val} onClick={() => setView(val)} title={label} aria-label={label} style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 36, height: 34, cursor: "pointer", border: "none", borderRadius: "var(--radius-sm)", background: on ? "var(--surface-card)" : "transparent", color: on ? "var(--text-brand)" : "var(--text-muted)", boxShadow: on ? "var(--shadow-xs)" : "none" }}>{I(ic, 17)}</button>
                  );
                })}
              </div>
            </div>

            <div style={{ fontSize: "var(--text-sm)", color: "var(--text-muted)", marginBottom: 14 }}>{results.length} {results.length === 1 ? "company" : "companies"}</div>

            {results.length > 0 ? (
              <React.Fragment>
              {view === "details"
                ? <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>{pageResults.map((c) => <CompanyDetailRow key={c.name} c={c} onNav={onNav} />)}</div>
                : <div className="krm-company-grid" style={{ display: "grid", gridTemplateColumns: hasSide ? "1fr 1fr" : "repeat(3,1fr)", gap: 16 }}>{pageResults.map((c) => <CompanyCard key={c.name} {...c} onClick={() => onNav("company", { companyId: c.id })} />)}</div>}
              {pages > 1 ? (
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginTop: 28 }}>
                  <button onClick={() => setPage(Math.max(0, pageSafe - 1))} disabled={pageSafe === 0} aria-label={TR("Previous")} style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 40, height: 40, borderRadius: "var(--radius-md)", border: "1px solid var(--border-strong)", background: "var(--surface-card)", cursor: pageSafe === 0 ? "not-allowed" : "pointer", color: pageSafe === 0 ? "var(--text-faint)" : "var(--text-body)" }}>{I("chevron-left", 18)}</button>
                  {Array.from({ length: pages }).map((_, i) => (
                    <button key={i} onClick={() => setPage(i)} style={{ minWidth: 40, height: 40, padding: "0 12px", borderRadius: "var(--radius-md)", cursor: "pointer", border: "1px solid " + (i === pageSafe ? "var(--brand)" : "var(--border-strong)"), background: i === pageSafe ? "var(--brand)" : "var(--surface-card)", color: i === pageSafe ? "var(--on-brand)" : "var(--text-body)", fontFamily: "var(--font-sans)", fontSize: "var(--text-sm)", fontWeight: 700 }}>{i + 1}</button>
                  ))}
                  <button onClick={() => setPage(Math.min(pages - 1, pageSafe + 1))} disabled={pageSafe === pages - 1} aria-label={TR("Next")} style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 40, height: 40, borderRadius: "var(--radius-md)", border: "1px solid var(--border-strong)", background: "var(--surface-card)", cursor: pageSafe === pages - 1 ? "not-allowed" : "pointer", color: pageSafe === pages - 1 ? "var(--text-faint)" : "var(--text-body)" }}>{I("chevron-right", 18)}</button>
                </div>
              ) : null}
              </React.Fragment>
            ) : (
              <div style={{ background: "var(--surface-card)", border: "1px solid var(--border)", borderRadius: "var(--radius-lg)" }}>
                <EmptyState icon={I("building-2", 22)} title="No companies found"
                  description="Try a different name or industry."
                  action={<Button variant="secondary" onClick={() => { setKeyword(""); setIndustry("All industries"); }}>{TR("Reset")}</Button>} />
              </div>
            )}
          </main>

          {hasSide ? (
            <aside style={{ position: "sticky", top: 84, display: "flex", flexDirection: "column", gap: 16 }}>
              {banner.visible ? <PromoBox b={banner} onNav={onNav} style={{ marginTop: 0 }} /> : null}
              {banner2.visible ? <PromoBox b={banner2} onNav={onNav} style={{ marginTop: 0 }} /> : null}
              {banner3.visible ? <PromoBox b={banner3} onNav={onNav} style={{ marginTop: 0 }} /> : null}
              {banner4.visible ? <PromoBox b={banner4} onNav={onNav} style={{ marginTop: 0 }} /> : null}
            </aside>
          ) : null}
        </div>
      </div>
    );
  }

  window.KramaJobs = Jobs;
  window.KramaCompanies = Companies;
})();
