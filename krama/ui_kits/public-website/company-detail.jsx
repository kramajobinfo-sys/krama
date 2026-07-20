// Public company profile — About / Jobs / Gallery / Awards + social links.
(function init() {
  if (!window.KramaDesignSystem_1a6f65) { return setTimeout(init, 40); }
  const { Button, Badge, Avatar, Card, JobCard, EmptyState } = window.KramaDesignSystem_1a6f65;
  const TR = window.KRAMA_T || function (s) { return s; };
  const D = window.KRAMA_DATA;
  const I = (n, s = 18) => <i data-lucide={n} style={{ width: s, height: s }}></i>;

  // ── Top announcement bar (shared style with Find Jobs / Companies / Job Detail) ──
  const CO_PROFILE_TOP_DEFAULT = { visible: true, theme: "teal", icon: "building-2", title: "Looking to hire?", message: "List your company on Krama and reach 40,000+ verified candidates.", cta: "Post a job", ctaUrl: "", image: "../../assets/banners/bg-companyProfileTopBanner.svg", fit: "cover" };
  function loadBanner(key, def) {
    try { const s = JSON.parse(localStorage.getItem("krama_home_settings") || "{}"); const m = Object.assign({}, def, s[key] || {}); if (!m.image && def.image) m.image = def.image; return m; }
    catch (e) { return Object.assign({}, def); }
  }
  const BAR_THEMES = { saffron: { bg: "var(--saffron-500)", pill: "#fff", pillFg: "var(--saffron-700)", fg: "#fff" }, teal: { bg: "var(--teal-700)", pill: "#fff", pillFg: "var(--teal-800)", fg: "#fff" }, dark: { bg: "var(--stone-900)", pill: "var(--saffron-500)", pillFg: "#fff", fg: "#fff" }, brand: { bg: "var(--brand-700)", pill: "#fff", pillFg: "var(--brand-800)", fg: "#fff" }, blank: { bg: "var(--surface-card)", pill: "var(--brand)", pillFg: "#fff", fg: "var(--text-body)" }, transparent: { bg: "transparent", pill: "var(--brand)", pillFg: "#fff", fg: "var(--text-body)" } };
  function resolveBarTheme(b) {
    if (b.theme === "custom") return { bg: b.customBg || "var(--saffron-500)", pill: b.customCtaBg || "#fff", pillFg: b.customCtaFg || "var(--saffron-700)", fg: b.customFg || "#fff" };
    const t = BAR_THEMES[b.theme] || BAR_THEMES.teal;
    return b.customFg ? Object.assign({}, t, { fg: b.customFg }) : t;
  }
  function useHomeContent() {
    const [, setTick] = React.useState(0);
    React.useEffect(function () {
      var apiBase = (/^(localhost|127\.0\.0\.1|::1|192\.168\.|10\.)/.test(window.location.hostname) ? 'http://127.0.0.1:8000/api' : (window.location.protocol + '//' + window.location.host + '/api'));
      fetch(apiBase + '/settings/home_content', { cache: 'no-cache' })
        .then(function (r) { return r.ok ? r.json() : null; })
        .then(function (d) { if (d && d.data) { try { localStorage.setItem('krama_home_settings', JSON.stringify(JSON.parse(d.data))); setTick(1); } catch (e) {} } })
        .catch(function () {});
    }, []);
  }
  function AnnouncementBar({ b, onNav }) {
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
                {b.cta && <span onClick={() => { if (b.ctaUrl) window.open(b.ctaUrl, b.ctaUrl.startsWith("http") ? "_blank" : "_self"); else onNav && onNav("employers"); }} style={{ flexShrink: 0, background: t.pill, color: t.pillFg, fontSize: "var(--text-sm)", fontWeight: 700, padding: "7px 16px", borderRadius: "var(--radius-pill)", cursor: "pointer", whiteSpace: "nowrap" }}>{TR(b.cta)}</span>}
              </React.Fragment>}
          <button onClick={() => setDismissed(true)} style={{ flexShrink: 0, background: "transparent", border: "none", color: t.fg, opacity: 0.7, cursor: "pointer", display: "inline-flex", padding: 4 }}>{I("x", 16)}</button>
        </div>
      </div>
    );
  }

  const SOCIALS = [
    { key: "facebook",  icon: "facebook",  bg: "#1877f2" },
    { key: "linkedin",  icon: "linkedin",  bg: "#0a66c2" },
    { key: "twitter",   icon: "twitter",   bg: "#000000" },
    { key: "instagram", icon: "instagram", bg: "linear-gradient(135deg,#f09433,#e6683c,#dc2743,#cc2366,#bc1888)" },
  ];

  function SocialIcons({ links }) {
    if (!links) return null;
    const items = SOCIALS.filter((s) => links[s.key]);
    if (!items.length) return null;
    return (
      <div style={{ display: "flex", gap: 8 }}>
        {items.map((s) => (
          <a key={s.key} href={links[s.key]} target="_blank" rel="noopener noreferrer" title={s.key}
            style={{ width: 34, height: 34, borderRadius: "50%", background: s.bg, color: "#fff", display: "inline-flex", alignItems: "center", justifyContent: "center", textDecoration: "none" }}>
            {I(s.icon, 16)}
          </a>
        ))}
      </div>
    );
  }

  function CompanyProfile({ companyId, initialTab, onNav, onOpenJob, saved, toggleSave }) {
    const summary = (D.companies || []).find((c) => String(c.id) === String(companyId)) || {};
    const [company, setCompany] = React.useState(null);
    const [companyJobs, setCompanyJobs] = React.useState(null);
    const [loading, setLoading] = React.useState(true);
    const [tab, setTab] = React.useState(initialTab || "about");
    const [jobsPage, setJobsPage] = React.useState(0);
    const [galleryPage, setGalleryPage] = React.useState(0);
    const [jobsView, setJobsView] = React.useState("grid");
    const [galleryView, setGalleryView] = React.useState("grid");
    const [awardsView, setAwardsView] = React.useState("grid");
    const [following, setFollowing] = React.useState(false);
    const [followCount, setFollowCount] = React.useState(0);
    const [followBusy, setFollowBusy] = React.useState(false);
    const [revData, setRevData] = React.useState(null);
    const [revLoading, setRevLoading] = React.useState(false);
    const [revPage, setRevPage] = React.useState(1);
    const [reviewForm, setReviewForm] = React.useState({ open: false, rating: 0, title: "", body: "", anon: false });
    const [reviewBusy, setReviewBusy] = React.useState(false);
    const [reviewMsg, setReviewMsg] = React.useState("");
    const isLoggedIn = !!window.KRAMA_API.getToken();
    const JOBS_PER = 10;
    const GALLERY_PER = 8;

    React.useEffect(() => {
      let alive = true;
      setLoading(true);
      window.KRAMA_API.fetchCompany(companyId)
        .then((r) => { if (alive) { const co = (r && r.company) || null; setCompany(co); setCompanyJobs((r && r.jobs) || null); if (co && co.follower_count) setFollowCount(co.follower_count); setLoading(false); } })
        .catch(() => { if (alive) setLoading(false); });
      return () => { alive = false; };
    }, [companyId]);

    React.useEffect(() => {
      if (!isLoggedIn) return;
      window.KRAMA_API.checkFollowing(companyId)
        .then((r) => { setFollowing(!!r.following); setFollowCount(r.follower_count || 0); })
        .catch(() => {});
    }, [companyId, isLoggedIn]);

    React.useEffect(() => {
      if (tab !== "reviews") return;
      setRevLoading(true);
      window.KRAMA_API.fetchReviews(companyId, revPage)
        .then(function(d) { setRevData(d); setRevLoading(false); })
        .catch(function() { setRevLoading(false); });
    }, [tab, companyId, revPage]);

    React.useEffect(() => { if (window.lucide) window.lucide.createIcons(); });

    // Merge API detail over the directory summary so we render instantly and enrich on load.
    const c = company || {};
    const name = c.name || summary.name || "Company";
    const logo = c.logo_url || summary.logo || (window.KRAMA_LOGOS || {})[name] || null;
    const industry = c.industry || summary.industry || "";
    const location = (c.location && c.location.name) || summary.location || "";
    const website = c.website || "";
    const address = c.address || "";
    const description = c.description || "";
    const aboutImage = c.about_image_url || "";
    const verified = c.is_verified != null ? c.is_verified : !!summary.verified;
    const social = c.social_links || null;
    const gallery = Array.isArray(c.gallery) ? c.gallery : [];
    const awards = Array.isArray(c.awards) ? c.awards : [];
    const coverBanner = c.cover_banner_url || "";
    const companySize = c.company_size || "";
    const parseTags = (v) => Array.isArray(v) ? v : (typeof v === "string" && v ? v.split(",").map(function(s) { return s.trim(); }).filter(Boolean) : []);
    const cultureValues = parseTags(c.culture_values);
    const benefitsTags  = parseTags(c.benefits_tags);

    const jobs = companyJobs !== null
      ? companyJobs.map((j) => window.KRAMA_API.normaliseJob(j))
      : (D.jobs || []).filter((j) => String(j.companyId) === String(companyId) || j.company === name);
    const jobCount = jobs.length;

    const reviewCount = revData ? revData.stats && revData.stats.count : null;
    const TABS = [
      { key: "about",   label: "About" },
      { key: "jobs",    label: "Jobs", count: jobCount },
      { key: "gallery", label: "Gallery", count: gallery.length || null },
      { key: "awards",  label: "Awards", count: awards.length || null },
      { key: "reviews", label: "Reviews", count: reviewCount || null },
    ];

    const stripTags = (html) => (html || "").replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();

    useHomeContent();
    return (
      <div style={{ background: "var(--surface-page)", minHeight: "70vh" }}>
        <AnnouncementBar b={loadBanner("companyProfileTopBanner", CO_PROFILE_TOP_DEFAULT)} onNav={onNav} />
        {/* Hero band — same 191px height/teal style as the page heroes; shows the company's own cover photo when set, else a branded fallback */}
        <div className="krm-co-hero" style={{ position: "relative", background: coverBanner ? "var(--surface-sunken)" : "var(--teal-800)", overflow: "hidden", height: 191 }}>
          {coverBanner
            ? <img src={coverBanner} alt="" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
            : <React.Fragment>
                <div style={{ position: "absolute", inset: 0, backgroundImage: "url('../../assets/banners/bg-companyProfileHero.svg')", backgroundSize: "cover", backgroundPosition: "center" }} />
                <div style={{ position: "absolute", inset: 0, background: "var(--teal-800)", opacity: 0.45 }} />
              </React.Fragment>}
        </div>

        <div style={{ maxWidth: 1080, margin: "0 auto", padding: "0 32px 56px" }} className="krm-co-profile-wrap">
          {/* Back link */}
          <button onClick={() => onNav("companies")} style={{ display: "inline-flex", alignItems: "center", gap: 6, marginTop: 16, border: "none", background: "transparent", cursor: "pointer", color: "var(--text-muted)", fontFamily: "var(--font-sans)", fontSize: "var(--text-sm)", fontWeight: 600 }}>
            {I("arrow-left", 15)} All companies
          </button>

          {/* Header card overlapping the hero */}
          <Card padding={0} style={{ marginTop: 10, overflow: "visible" }}>
            <div className="krm-co-header" style={{ display: "flex", gap: 20, alignItems: "flex-start", padding: "24px 28px" }}>
              <div className="krm-co-logo" style={{ marginTop: -60, flexShrink: 0, width: 104, height: 104, borderRadius: "var(--radius-lg)", background: "#fff", border: "1px solid var(--border)", boxShadow: "var(--shadow-md)", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
                <Avatar src={logo} name={name} square size={96} />
              </div>
              <div style={{ flex: 1, minWidth: 0, paddingTop: 4 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                  <h1 style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "var(--text-2xl)", color: "var(--text-strong)", margin: 0 }}>{name}</h1>
                  {verified && <Badge tone="success"><span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>{I("badge-check", 13)} Verified</span></Badge>}
                </div>
                <div style={{ fontSize: "var(--text-sm)", color: "var(--text-muted)", marginTop: 6, display: "flex", gap: 16, flexWrap: "wrap" }}>
                  {industry && <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>{I("briefcase", 14)} {industry}</span>}
                  {location && <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>{I("map-pin", 14)} {location}</span>}
                  {jobCount > 0 && <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>{I("circle-user", 14)} {jobCount} open role{jobCount === 1 ? "" : "s"}</span>}
                </div>
                {description && <p style={{ fontSize: "var(--text-sm)", color: "var(--text-body)", marginTop: 12, lineHeight: 1.6, maxWidth: 640 }}>{stripTags(description).slice(0, 180)}{stripTags(description).length > 180 ? "…" : ""}</p>}
              </div>
              <div className="krm-co-header-actions" style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 12, flexShrink: 0 }}>
                {jobCount > 0 && <Button variant="primary" onClick={() => setTab("jobs")}>View {jobCount} job{jobCount === 1 ? "" : "s"}</Button>}
                <button
                  disabled={followBusy}
                  onClick={() => {
                    if (!isLoggedIn) { onNav && onNav("login"); return; }
                    setFollowBusy(true);
                    const action = following ? window.KRAMA_API.unfollowCompany : window.KRAMA_API.followCompany;
                    action(companyId).then((r) => {
                      setFollowing(!!r.following);
                      setFollowCount(r.follower_count || 0);
                      setFollowBusy(false);
                    }).catch(() => setFollowBusy(false));
                  }}
                  style={{ display: "inline-flex", alignItems: "center", gap: 7, border: "1px solid " + (following ? "var(--brand)" : "var(--border-strong)"), background: following ? "var(--brand-subtle)" : "var(--surface-card)", color: following ? "var(--text-brand)" : "var(--text-body)", fontFamily: "var(--font-sans)", fontWeight: 600, fontSize: "var(--text-sm)", padding: "8px 16px", borderRadius: "var(--radius-md)", cursor: followBusy ? "default" : "pointer", opacity: followBusy ? 0.7 : 1 }}>
                  {I(following ? "heart" : "heart", 15)}
                  {following ? "Following" : "Follow"}
                  {followCount > 0 && <span style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)", fontWeight: 500 }}>{followCount}</span>}
                </button>
                <SocialIcons links={social} />
              </div>
            </div>

            {/* Tab bar */}
            <div className="krm-co-tabs" style={{ display: "flex", alignItems: "center", gap: 4, padding: "0 28px", borderTop: "1px solid var(--border-subtle)" }}>
              {TABS.map((t) => {
                const on = tab === t.key;
                return (
                  <button key={t.key} onClick={() => setTab(t.key)} style={{ position: "relative", display: "inline-flex", alignItems: "center", gap: 8, border: "none", background: "transparent", cursor: "pointer", fontFamily: "var(--font-sans)", fontWeight: on ? 700 : 600, fontSize: "var(--text-base)", color: on ? "var(--text-brand)" : "var(--text-muted)", padding: "16px 12px", borderBottom: "2px solid " + (on ? "var(--brand)" : "transparent"), marginBottom: -1 }}>
                    {t.label}
                    {t.count != null && t.count !== undefined && (t.count > 0) ? (
                      <span className={"krm-co-tab-count" + (t.key === "jobs" ? " krm-co-tab-count--jobs" : "")} style={{ fontSize: "var(--text-xs)", fontWeight: 700, color: on ? "#fff" : "var(--text-body)", background: on ? "var(--brand)" : "var(--surface-sunken)", borderRadius: "var(--radius-sm)", padding: "1px 7px", minWidth: 20, textAlign: "center" }}>{t.count}</span>
                    ) : null}
                  </button>
                );
              })}
            </div>
          </Card>

          {/* Tab panels */}
          <div style={{ marginTop: 20 }}>
            {tab === "about" && (
              <div className="krm-co-about-grid" style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: 20, alignItems: "start" }}>
                <Card padding={24}>
                  <h2 style={{ fontSize: "var(--text-lg)", fontWeight: 700, color: "var(--text-strong)", marginTop: 0, marginBottom: 12 }}>About {name}</h2>
                  {aboutImage && (
                    <img src={aboutImage} alt={name} style={{ width: "100%", maxHeight: 320, objectFit: "cover", borderRadius: "var(--radius-md)", marginBottom: 16, display: "block" }} />
                  )}
                  {description
                    ? <div className="krama-rich-body" style={{ fontSize: "var(--text-base)", color: "var(--text-body)", lineHeight: 1.7 }} dangerouslySetInnerHTML={{ __html: description }} />
                    : <div style={{ fontSize: "var(--text-sm)", color: "var(--text-muted)" }}>{loading ? "Loading…" : "This company hasn't added a description yet."}</div>}
                  {cultureValues.length > 0 && (
                    <div style={{ marginTop: 20, paddingTop: 16, borderTop: "1px solid var(--border-subtle)" }}>
                      <div style={{ fontSize: "var(--text-sm)", fontWeight: 700, color: "var(--text-strong)", marginBottom: 10 }}>Culture &amp; values</div>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                        {cultureValues.map(function(v, i) { return <span key={i} style={{ padding: "4px 12px", borderRadius: 99, background: "var(--brand-subtle)", color: "var(--text-brand)", fontSize: "var(--text-xs)", fontWeight: 600 }}>{v}</span>; })}
                      </div>
                    </div>
                  )}
                  {benefitsTags.length > 0 && (
                    <div style={{ marginTop: 16, paddingTop: 16, borderTop: "1px solid var(--border-subtle)" }}>
                      <div style={{ fontSize: "var(--text-sm)", fontWeight: 700, color: "var(--text-strong)", marginBottom: 10 }}>{TR("Benefits")}</div>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                        {benefitsTags.map(function(b, i) { return <span key={i} style={{ padding: "4px 12px", borderRadius: 99, background: "var(--success-subtle)", color: "var(--success)", fontSize: "var(--text-xs)", fontWeight: 600 }}>{b}</span>; })}
                      </div>
                    </div>
                  )}
                </Card>
                <Card padding={20}>
                  <div style={{ fontSize: "var(--text-sm)", fontWeight: 700, color: "var(--text-strong)", marginBottom: 14 }}>{TR("Company details")}</div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    {industry && <DetailRow icon="briefcase" label={TR("Industry")} value={industry} />}
                    {location && <DetailRow icon="map-pin" label={TR("Location")} value={location} />}
                    {address && <DetailRow icon="building-2" label={TR("Address")} value={address} />}
                    {companySize && <DetailRow icon="users" label={TR("Company size")} value={companySize} />}
                    {website && <DetailRow icon="globe" label={TR("Website")} value={<a href={website} target="_blank" rel="noopener noreferrer" style={{ color: "var(--text-brand)", textDecoration: "none", wordBreak: "break-all" }}>{website.replace(/^https?:\/\//, "")}</a>} />}
                  </div>
                  {social && SOCIALS.some((s) => social[s.key]) && (
                    <div style={{ marginTop: 18, paddingTop: 16, borderTop: "1px solid var(--border-subtle)" }}>
                      <div style={{ fontSize: "var(--text-sm)", fontWeight: 700, color: "var(--text-strong)", marginBottom: 10 }}>{TR("Follow")}</div>
                      <SocialIcons links={social} />
                    </div>
                  )}
                </Card>
              </div>
            )}

            {tab === "jobs" && (
              jobs.length > 0
                ? (() => {
                    const pages = Math.max(1, Math.ceil(jobs.length / JOBS_PER));
                    const safe = Math.min(jobsPage, pages - 1);
                    const slice = jobs.slice(safe * JOBS_PER, safe * JOBS_PER + JOBS_PER);
                    return (
                      <React.Fragment>
                        <Toolbar count={jobs.length} noun="job" view={jobsView} onView={setJobsView} />
                        <JobsView view={jobsView} items={slice} saved={saved} toggleSave={toggleSave} onOpenJob={onOpenJob} />
                        <Pager page={safe} pages={pages} onPage={setJobsPage} />
                      </React.Fragment>
                    );
                  })()
                : <Card padding={0}><EmptyState icon={I("briefcase", 22)} title="No open roles right now" description={"Check back later — " + name + " isn't hiring at the moment."} /></Card>
            )}

            {tab === "gallery" && (
              gallery.length > 0
                ? (() => {
                    const pages = Math.max(1, Math.ceil(gallery.length / GALLERY_PER));
                    const safe = Math.min(galleryPage, pages - 1);
                    const slice = gallery.slice(safe * GALLERY_PER, safe * GALLERY_PER + GALLERY_PER);
                    return (
                      <React.Fragment>
                        <Toolbar count={gallery.length} noun="photo" view={galleryView} onView={setGalleryView} options={["grid", "list"]} />
                        <GalleryView view={galleryView} items={slice} />
                        <Pager page={safe} pages={pages} onPage={setGalleryPage} />
                      </React.Fragment>
                    );
                  })()
                : <Card padding={0}><EmptyState icon={I("image", 22)} title="No photos yet" description={name + " hasn't uploaded any photos."} /></Card>
            )}

            {tab === "awards" && (
              awards.length > 0
                ? <React.Fragment>
                    <Toolbar count={awards.length} noun="award" view={awardsView} onView={setAwardsView} />
                    <AwardsView view={awardsView} items={awards} />
                  </React.Fragment>
                : <Card padding={0}><EmptyState icon={I("trophy", 22)} title="No awards listed" description={name + " hasn't added any awards or recognition."} /></Card>
            )}

            {tab === "reviews" && (
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                {/* Stats + write review header */}
                <Card padding={20}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 20, flexWrap: "wrap" }}>
                      {revData && revData.stats && revData.stats.avg != null ? (
                        <React.Fragment>
                          <div style={{ textAlign: "center" }}>
                            <div style={{ fontSize: 40, fontWeight: 800, color: "var(--text-strong)", lineHeight: 1 }}>{revData.stats.avg.toFixed(1)}</div>
                            <div style={{ display: "flex", gap: 2, color: "var(--saffron-500)", marginTop: 4, justifyContent: "center" }}>
                              {[1,2,3,4,5].map(function(n) { return <span key={n} style={{ opacity: n <= Math.round(revData.stats.avg) ? 1 : 0.2 }}>{I("star", 16)}</span>; })}
                            </div>
                            <div style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)", marginTop: 4 }}>{revData.stats.count} review{revData.stats.count === 1 ? "" : "s"}</div>
                          </div>
                          <div style={{ display: "flex", flexDirection: "column", gap: 4, minWidth: 160 }}>
                            {[5,4,3,2,1].map(function(n) {
                              var cnt = revData.stats["r" + n] || 0;
                              var pct = revData.stats.count > 0 ? Math.round((cnt / revData.stats.count) * 100) : 0;
                              return (
                                <div key={n} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                  <span style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)", width: 8 }}>{n}</span>
                                  <span style={{ color: "var(--saffron-500)", display: "inline-flex" }}>{I("star", 12)}</span>
                                  <div style={{ flex: 1, height: 6, background: "var(--surface-sunken)", borderRadius: 99, overflow: "hidden" }}>
                                    <div style={{ width: pct + "%", height: "100%", background: "var(--saffron-500)", borderRadius: 99 }} />
                                  </div>
                                  <span style={{ fontSize: "var(--text-xs)", color: "var(--text-faint)", width: 24 }}>{cnt}</span>
                                </div>
                              );
                            })}
                          </div>
                        </React.Fragment>
                      ) : (
                        <div style={{ fontSize: "var(--text-sm)", color: "var(--text-muted)" }}>
                          {revLoading ? "Loading…" : "No reviews yet. Be the first to review " + name + "."}
                        </div>
                      )}
                    </div>
                    {isLoggedIn && !reviewForm.open && (
                      <button onClick={() => setReviewForm(function(f) { return Object.assign({}, f, { open: true }); })} style={{ display: "inline-flex", alignItems: "center", gap: 8, border: "1px solid var(--border-strong)", borderRadius: "var(--radius-md)", background: "var(--surface-card)", color: "var(--text-body)", fontFamily: "var(--font-sans)", fontWeight: 600, fontSize: "var(--text-sm)", padding: "9px 16px", cursor: "pointer" }}>
                        {I("star", 15)} Write a review
                      </button>
                    )}
                    {!isLoggedIn && (
                      <div style={{ fontSize: "var(--text-sm)", color: "var(--text-muted)" }}>
                        <a href="#" onClick={function(e) { e.preventDefault(); onNav && onNav("login"); }} style={{ color: "var(--text-brand)", fontWeight: 600 }}>{TR("Sign in")}</a> to write a review.
                      </div>
                    )}
                  </div>

                  {/* Submit review form */}
                  {reviewForm.open && (
                    <div style={{ marginTop: 20, paddingTop: 20, borderTop: "1px solid var(--border-subtle)" }}>
                      <div style={{ fontWeight: 700, fontSize: "var(--text-base)", color: "var(--text-strong)", marginBottom: 14 }}>Your review of {name}</div>
                      {reviewMsg && <div style={{ padding: "10px 14px", background: reviewMsg.startsWith("Error") ? "var(--danger-subtle)" : "var(--success-subtle)", color: reviewMsg.startsWith("Error") ? "var(--danger)" : "var(--success)", borderRadius: "var(--radius-md)", marginBottom: 12, fontSize: "var(--text-sm)" }}>{reviewMsg}</div>}
                      <div style={{ marginBottom: 12 }}>
                        <div style={{ fontSize: "var(--text-sm)", fontWeight: 600, color: "var(--text-strong)", marginBottom: 6 }}>Rating *</div>
                        <div style={{ display: "flex", gap: 6 }}>
                          {[1,2,3,4,5].map(function(n) {
                            return (
                              <button key={n} onClick={() => setReviewForm(function(f) { return Object.assign({}, f, { rating: n }); })}
                                style={{ width: 36, height: 36, border: "none", background: "transparent", cursor: "pointer", padding: 0, color: n <= reviewForm.rating ? "var(--saffron-500)" : "var(--border-strong)", display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
                                {I("star", 28)}
                              </button>
                            );
                          })}
                          {reviewForm.rating > 0 && <span style={{ fontSize: "var(--text-sm)", color: "var(--text-muted)", alignSelf: "center", marginLeft: 4 }}>{["","Poor","Fair","Good","Very good","Excellent"][reviewForm.rating]}</span>}
                        </div>
                      </div>
                      <div style={{ marginBottom: 12 }}>
                        <label style={{ display: "block", fontSize: "var(--text-sm)", fontWeight: 600, color: "var(--text-strong)", marginBottom: 6 }}>Title (optional)</label>
                        <input value={reviewForm.title} onChange={function(e) { setReviewForm(function(f) { return Object.assign({}, f, { title: e.target.value }); }); }} maxLength={100} placeholder={TR("Summarise your experience in a short phrase…")} style={{ width: "100%", padding: "9px 12px", border: "1px solid var(--border)", borderRadius: "var(--radius-md)", fontFamily: "var(--font-sans)", fontSize: "var(--text-sm)", boxSizing: "border-box", background: "var(--surface-card)", color: "var(--text-body)" }} />
                      </div>
                      <div style={{ marginBottom: 12 }}>
                        <label style={{ display: "block", fontSize: "var(--text-sm)", fontWeight: 600, color: "var(--text-strong)", marginBottom: 6 }}>Review * <span style={{ fontWeight: 400, color: "var(--text-muted)" }}>(min 20 characters)</span></label>
                        <textarea value={reviewForm.body} onChange={function(e) { setReviewForm(function(f) { return Object.assign({}, f, { body: e.target.value }); }); }} rows={4} maxLength={3000} placeholder={"Share your experience working at " + name + " or as a customer…"} style={{ width: "100%", padding: "9px 12px", border: "1px solid var(--border)", borderRadius: "var(--radius-md)", fontFamily: "var(--font-sans)", fontSize: "var(--text-sm)", boxSizing: "border-box", background: "var(--surface-card)", color: "var(--text-body)", resize: "vertical" }} />
                      </div>
                      <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", fontSize: "var(--text-sm)", color: "var(--text-body)", marginBottom: 16, userSelect: "none" }}>
                        <input type="checkbox" checked={reviewForm.anon} onChange={function(e) { setReviewForm(function(f) { return Object.assign({}, f, { anon: e.target.checked }); }); }} style={{ width: 16, height: 16 }} />
                        Post anonymously
                      </label>
                      <div style={{ display: "flex", gap: 10 }}>
                        <button disabled={reviewBusy} onClick={function() {
                          if (!reviewForm.rating) { setReviewMsg("Error: Please select a star rating."); return; }
                          if (reviewForm.body.length < 20) { setReviewMsg("Error: Your review must be at least 20 characters."); return; }
                          setReviewBusy(true); setReviewMsg("");
                          window.KRAMA_API.submitReview(companyId, { rating: reviewForm.rating, title: reviewForm.title || null, body: reviewForm.body, is_anonymous: reviewForm.anon })
                            .then(function() {
                              setReviewBusy(false);
                              setReviewMsg("Review submitted! It will appear after moderation.");
                              setReviewForm({ open: false, rating: 0, title: "", body: "", anon: false });
                            })
                            .catch(function(e) { setReviewBusy(false); setReviewMsg("Error: " + ((e && e.message) || "Submission failed.")); });
                        }} style={{ padding: "9px 20px", borderRadius: "var(--radius-md)", border: "none", background: "var(--brand)", color: "#fff", fontFamily: "var(--font-sans)", fontWeight: 700, fontSize: "var(--text-sm)", cursor: reviewBusy ? "not-allowed" : "pointer", opacity: reviewBusy ? 0.7 : 1 }}>
                          {reviewBusy ? "Submitting…" : "Submit review"}
                        </button>
                        <button onClick={() => { setReviewForm({ open: false, rating: 0, title: "", body: "", anon: false }); setReviewMsg(""); }} style={{ padding: "9px 16px", borderRadius: "var(--radius-md)", border: "1px solid var(--border)", background: "transparent", fontFamily: "var(--font-sans)", fontWeight: 600, fontSize: "var(--text-sm)", cursor: "pointer", color: "var(--text-body)" }}>{TR("Cancel")}</button>
                      </div>
                    </div>
                  )}
                </Card>

                {/* Reviews list */}
                {revLoading && <div style={{ padding: 24, textAlign: "center", color: "var(--text-muted)", fontSize: "var(--text-sm)" }}>Loading reviews…</div>}
                {!revLoading && revData && (revData.data || []).length === 0 && <Card padding={0}><EmptyState icon={I("star", 22)} title="No reviews yet" description={"Be the first to share your experience with " + name + "."} /></Card>}
                {!revLoading && revData && (revData.data || []).map(function(r) {
                  return (
                    <Card key={r.id} padding={20}>
                      <div style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
                        <Avatar src={r.author ? r.author.avatar_url : null} name={r.author ? r.author.name : "A"} size={40} />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", marginBottom: 4 }}>
                            <span style={{ fontWeight: 700, fontSize: "var(--text-sm)", color: "var(--text-strong)" }}>{r.author ? r.author.name : "Anonymous"}</span>
                            <span style={{ display: "inline-flex", gap: 2, color: "var(--saffron-500)" }}>
                              {[1,2,3,4,5].map(function(n) { return <span key={n} style={{ opacity: n <= r.rating ? 1 : 0.2 }}>{I("star", 13)}</span>; })}
                            </span>
                            <span style={{ fontSize: "var(--text-xs)", color: "var(--text-faint)" }}>{(function(iso) { if (!iso) return ""; var d = new Date(iso); return d.getDate() + " " + ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"][d.getMonth()] + " " + d.getFullYear(); })(r.created_at)}</span>
                          </div>
                          {r.title && <div style={{ fontWeight: 700, fontSize: "var(--text-base)", color: "var(--text-strong)", marginBottom: 6 }}>{r.title}</div>}
                          <div style={{ fontSize: "var(--text-sm)", color: "var(--text-body)", lineHeight: 1.6 }}>{r.body}</div>
                        </div>
                      </div>
                    </Card>
                  );
                })}
                {!revLoading && revData && revData.last_page > 1 && (
                  <Pager page={revPage - 1} pages={revData.last_page} onPage={function(p) { setRevPage(p + 1); }} />
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  function DetailRow({ icon, label, value }) {
    return (
      <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
        <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 32, height: 32, borderRadius: "var(--radius-md)", background: "var(--brand-subtle)", color: "var(--brand)", flexShrink: 0 }}>{I(icon, 15)}</span>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>{label}</div>
          <div style={{ fontSize: "var(--text-sm)", fontWeight: 600, color: "var(--text-strong)" }}>{value}</div>
        </div>
      </div>
    );
  }

  function Pager({ page, pages, onPage }) {
    if (pages <= 1) return null;
    const btn = (active, disabled) => ({ minWidth: 38, height: 38, padding: "0 12px", borderRadius: "var(--radius-md)", cursor: disabled ? "not-allowed" : "pointer", border: "1px solid " + (active ? "var(--brand)" : "var(--border-strong)"), background: active ? "var(--brand)" : "var(--surface-card)", color: active ? "var(--on-brand, #fff)" : (disabled ? "var(--text-faint)" : "var(--text-body)"), fontFamily: "var(--font-sans)", fontSize: "var(--text-sm)", fontWeight: 700, display: "inline-flex", alignItems: "center", justifyContent: "center" });
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginTop: 24 }}>
        <button onClick={() => onPage(Math.max(0, page - 1))} disabled={page === 0} style={btn(false, page === 0)}>{I("chevron-left", 18)}</button>
        {Array.from({ length: pages }).map((_, i) => (
          <button key={i} onClick={() => onPage(i)} style={btn(i === page, false)}>{i + 1}</button>
        ))}
        <button onClick={() => onPage(Math.min(pages - 1, page + 1))} disabled={page === pages - 1} style={btn(false, page === pages - 1)}>{I("chevron-right", 18)}</button>
      </div>
    );
  }

  function ViewSwitch({ view, onView, options }) {
    let opts = [["grid", "layout-grid", "Grid"], ["list", "list", "List"], ["detail", "layout-list", "Detail"]];
    if (options) opts = opts.filter((o) => options.indexOf(o[0]) !== -1);
    return (
      <div style={{ display: "flex", gap: 2, padding: 3, background: "var(--surface-sunken)", borderRadius: "var(--radius-md)" }}>
        {opts.map(([val, ic, label]) => {
          const on = view === val;
          return (
            <button key={val} onClick={() => onView(val)} title={label} aria-label={label}
              style={{ display: "inline-flex", alignItems: "center", gap: 6, height: 32, padding: "0 10px", cursor: "pointer", border: "none", borderRadius: "var(--radius-sm)", background: on ? "var(--surface-card)" : "transparent", color: on ? "var(--text-brand)" : "var(--text-muted)", boxShadow: on ? "var(--shadow-xs)" : "none", fontFamily: "var(--font-sans)", fontSize: "var(--text-xs)", fontWeight: 700 }}>
              {I(ic, 16)}<span className="krm-vs-label">{label}</span>
            </button>
          );
        })}
      </div>
    );
  }

  function Toolbar({ count, noun, view, onView, options }) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16, gap: 12, flexWrap: "wrap" }}>
        <div style={{ fontSize: "var(--text-sm)", color: "var(--text-muted)" }}>{count} {count === 1 ? noun : noun + "s"}</div>
        <ViewSwitch view={view} onView={onView} options={options} />
      </div>
    );
  }

  const chip = (ic, txt) => txt ? <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>{I(ic, 13)}{txt}</span> : null;
  const strip = (html) => (html || "").replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();

  function JobsView({ view, items, saved, toggleSave, onOpenJob }) {
    if (view === "grid") {
      return (
        <div className="krm-co-jobs-grid" style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 14 }}>
          {items.map((j) => <JobCard key={j.id} {...j} saved={saved.includes(j.id)} onSave={() => toggleSave(j.id)} onClick={() => onOpenJob(j)} />)}
        </div>
      );
    }
    if (view === "list") {
      return (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {items.map((j) => (
            <div key={j.id} onClick={() => onOpenJob(j)} style={{ display: "flex", alignItems: "center", gap: 14, padding: "12px 16px", border: "1px solid var(--border)", borderRadius: "var(--radius-md)", background: "var(--surface-card)", cursor: "pointer" }}>
              <Avatar src={j.logo} name={j.company} square size={40} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 700, color: "var(--text-strong)", fontSize: "var(--text-sm)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{j.title}</div>
                <div style={{ display: "flex", gap: 14, flexWrap: "wrap", marginTop: 3 }}>{chip("map-pin", j.location)}{chip("briefcase", j.type)}{chip("banknote", j.salary)}</div>
              </div>
              {j.postedAt && <span style={{ fontSize: "var(--text-xs)", color: "var(--text-faint)", flexShrink: 0 }}>{j.postedAt}</span>}
            </div>
          ))}
        </div>
      );
    }
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {items.map((j) => (
          <Card key={j.id} padding={20}>
            <div style={{ display: "flex", gap: 16 }}>
              <Avatar src={j.logo} name={j.company} square size={52} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                  <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "var(--text-lg)", color: "var(--text-strong)" }}>{j.title}</span>
                  {j.featured && <Badge tone="accent">{TR("Featured")}</Badge>}
                </div>
                <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginTop: 8 }}>{chip("map-pin", j.location)}{chip("briefcase", j.type)}{chip("banknote", j.salary)}{chip("clock", j.postedAt)}</div>
                {strip(j.description) && <p style={{ fontSize: "var(--text-sm)", color: "var(--text-body)", marginTop: 10, lineHeight: 1.6 }}>{strip(j.description).slice(0, 170)}{strip(j.description).length > 170 ? "…" : ""}</p>}
                <div style={{ marginTop: 12 }}><Button variant="secondary" size="sm" onClick={() => onOpenJob(j)}>{TR("View job")}</Button></div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    );
  }

  function GalleryView({ view, items }) {
    if (view === "grid") {
      return (
        <div className="krm-co-gallery" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 14 }}>
          {items.map((p) => (
            <figure key={p.id} style={{ margin: 0, border: "1px solid var(--border)", borderRadius: "var(--radius-md)", overflow: "hidden", background: "var(--surface-card)" }}>
              <a href={p.url} target="_blank" rel="noopener noreferrer" style={{ display: "block", aspectRatio: "4/3", background: "var(--surface-sunken)" }}>
                <img src={p.url} alt={p.caption || ""} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
              </a>
              {p.caption ? <figcaption style={{ fontSize: "var(--text-xs)", color: "var(--text-body)", padding: "8px 10px", lineHeight: 1.4 }}>{p.caption}</figcaption> : null}
            </figure>
          ))}
        </div>
      );
    }
    // list view
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {items.map((p) => (
          <a key={p.id} href={p.url} target="_blank" rel="noopener noreferrer" style={{ display: "flex", alignItems: "center", gap: 14, padding: 10, border: "1px solid var(--border)", borderRadius: "var(--radius-md)", background: "var(--surface-card)", textDecoration: "none" }}>
            <span style={{ flexShrink: 0, width: 120, height: 80, borderRadius: "var(--radius-sm)", overflow: "hidden", background: "var(--surface-sunken)" }}>
              <img src={p.url} alt={p.caption || ""} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
            </span>
            <span style={{ fontSize: "var(--text-sm)", color: p.caption ? "var(--text-body)" : "var(--text-faint)" }}>{p.caption || "Untitled photo"}</span>
          </a>
        ))}
      </div>
    );
  }

  function AwardsView({ view, items }) {
    const thumb = (a, size) => a.image_url
      ? <a href={a.image_url} target="_blank" rel="noopener noreferrer" style={{ flexShrink: 0, width: size, height: size, borderRadius: "var(--radius-md)", overflow: "hidden", border: "1px solid var(--border)", background: "var(--surface-sunken)", display: "block" }}><img src={a.image_url} alt={a.title} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} /></a>
      : <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: size, height: size, borderRadius: "var(--radius-md)", background: "var(--warning-subtle, #fef3c7)", color: "var(--warning, #b45309)", flexShrink: 0 }}>{I("trophy", Math.round(size * 0.5))}</span>;

    if (view === "grid") {
      return (
        <div className="krm-co-awards-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 14 }}>
          {items.map((a) => (
            <Card key={a.id} padding={0} style={{ overflow: "hidden" }}>
              {a.image_url
                ? <a href={a.image_url} target="_blank" rel="noopener noreferrer" style={{ display: "block", aspectRatio: "4/3", background: "var(--surface-sunken)" }}><img src={a.image_url} alt={a.title} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} /></a>
                : <div style={{ aspectRatio: "4/3", background: "var(--warning-subtle, #fef3c7)", color: "var(--warning, #b45309)", display: "flex", alignItems: "center", justifyContent: "center" }}>{I("trophy", 40)}</div>}
              <div style={{ padding: 16 }}>
                <div style={{ fontWeight: 700, color: "var(--text-strong)", fontSize: "var(--text-sm)" }}>{a.title}</div>
                {a.year && <div style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)", marginTop: 2 }}>{a.year}</div>}
                {a.description && <div style={{ fontSize: "var(--text-xs)", color: "var(--text-body)", marginTop: 6, lineHeight: 1.5 }}>{a.description}</div>}
              </div>
            </Card>
          ))}
        </div>
      );
    }
    if (view === "list") {
      return (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {items.map((a) => (
            <div key={a.id} style={{ display: "flex", alignItems: "center", gap: 14, padding: "10px 14px", border: "1px solid var(--border)", borderRadius: "var(--radius-md)", background: "var(--surface-card)" }}>
              {thumb(a, 40)}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 700, color: "var(--text-strong)", fontSize: "var(--text-sm)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{a.title}</div>
                {a.description && <div style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{a.description}</div>}
              </div>
              {a.year && <span style={{ fontSize: "var(--text-xs)", color: "var(--text-faint)", flexShrink: 0 }}>{a.year}</span>}
            </div>
          ))}
        </div>
      );
    }
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {items.map((a) => (
          <Card key={a.id} padding={18}>
            <div style={{ display: "flex", alignItems: "flex-start", gap: 16 }}>
              {thumb(a, 110)}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 700, color: "var(--text-strong)", fontSize: "var(--text-base)" }}>{a.title}</div>
                {a.year && <div style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)", marginTop: 2 }}>{a.year}</div>}
                {a.description && <div style={{ fontSize: "var(--text-sm)", color: "var(--text-body)", marginTop: 8, lineHeight: 1.6 }}>{a.description}</div>}
              </div>
            </div>
          </Card>
        ))}
      </div>
    );
  }

  window.KramaCompanyProfile = CompanyProfile;
})();
