// Job detail screen -- full posting + sticky apply card + similar jobs.
(function init() {
  if (!window.KramaDesignSystem_1a6f65) { return setTimeout(init, 40); }
  const { Button, Badge, Avatar, Card, JobCard } = window.KramaDesignSystem_1a6f65;
  const TR = window.KRAMA_T || function (s) { return s; };
  const D = window.KRAMA_DATA;
  const I = (n, s = 18) => <i data-lucide={n} style={{ width: s, height: s }}></i>;

  function Meta({ icon, label, value }) {
    if (!value) return null;
    return (
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 38, height: 38, borderRadius: "var(--radius-md)", background: "var(--brand-subtle)", color: "var(--brand)" }}>{I(icon, 18)}</span>
        <div>
          <div style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>{label}</div>
          <div style={{ fontSize: "var(--text-sm)", fontWeight: 700, color: "var(--text-strong)" }}>{value}</div>
        </div>
      </div>
    );
  }

  function Block({ title, children }) {
    return (
      <div style={{ marginTop: 28 }}>
        <h3 style={{ fontSize: "var(--text-xl)", fontWeight: 700, color: "var(--text-strong)", marginBottom: 12 }}>{title}</h3>
        {children}
      </div>
    );
  }

  // Render HTML from rich editor or plain text safely
  function RichContent({ html }) {
    if (!html) return null;
    if (/<[a-z][\s\S]*>/i.test(html)) {
      return <div className="krm-rich" style={{ color: "var(--text-body)", fontSize: "var(--text-base)", lineHeight: 1.7 }} dangerouslySetInnerHTML={{ __html: html }} />;
    }
    return <p style={{ color: "var(--text-body)", fontSize: "var(--text-base)", lineHeight: 1.7, whiteSpace: "pre-wrap" }}>{html}</p>;
  }

  function fmtExpiry(iso) {
    if (!iso) return null;
    var d = new Date(iso);
    if (isNaN(d)) return null;
    return d.getDate() + " " + ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"][d.getMonth()] + " " + d.getFullYear();
  }

  const JDB_DEFAULT = { visible: true, theme: "teal", icon: "sparkles", title: "Looking for more opportunities?", message: "Browse hundreds of open roles matching your skills.", cta: "Explore jobs", ctaUrl: "", image: "../../assets/banners/bg-jobDetailBanner.svg", fit: "cover" };
  const JD_TOP_DEFAULT = { visible: true, theme: "teal", icon: "sparkles", title: "Looking for more roles?", message: "Browse thousands of verified opportunities across Cambodia.", cta: "Browse jobs", ctaUrl: "", image: "../../assets/banners/bg-jobDetailTopBanner.svg", fit: "cover" };
  const JD_HERO_DEFAULT = { visible: true, heading: "Find the role that fits you", sub: "Discover verified opportunities from Cambodia's leading employers.", image: "../../assets/banners/bg-jobDetailHero.svg", fit: "cover", imgOverlay: 45 };
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
                  <strong style={{ fontWeight: 700 }}>{b.title}</strong>{b.message ? " -- " + b.message : ""}
                </div>
                {b.cta && <span onClick={() => { if (b.ctaUrl) window.open(b.ctaUrl, b.ctaUrl.startsWith("http") ? "_blank" : "_self"); else onNav && onNav("jobs"); }} style={{ flexShrink: 0, background: t.pill, color: t.pillFg, fontSize: "var(--text-sm)", fontWeight: 700, padding: "7px 16px", borderRadius: "var(--radius-pill)", cursor: "pointer", whiteSpace: "nowrap" }}>{b.cta}</span>}
              </React.Fragment>}
          <button onClick={() => setDismissed(true)} style={{ flexShrink: 0, background: "transparent", border: "none", color: t.fg, opacity: 0.7, cursor: "pointer", display: "inline-flex", padding: 4 }}>{I("x", 16)}</button>
        </div>
      </div>
    );
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

  function JobDetailBanner({ onNav }) {
    useHomeContent();
    const b = loadBanner("jobDetailBanner", JDB_DEFAULT);
    if (!b || !b.visible) return null;
    const THEMES = { teal: { bg: "var(--teal-700)", fg: "#fff" }, saffron: { bg: "var(--saffron-600)", fg: "#fff" }, dark: { bg: "var(--stone-900)", fg: "#fff" }, brand: { bg: "var(--brand-700)", fg: "#fff" }, blank: { bg: "var(--surface-card)", fg: "var(--text-body)" }, transparent: { bg: "transparent", fg: "var(--text-body)" } };
    function resolveJdbTheme(b) {
      if (b.theme === "custom") return { bg: b.customBg || "var(--teal-700)", fg: b.customFg || "#fff" };
      const t = THEMES[b.theme] || THEMES.teal;
      return b.customFg ? Object.assign({}, t, { fg: b.customFg }) : t;
    }
    const t = resolveJdbTheme(b);
    return (
      <div style={{ position: "relative", overflow: "hidden", borderRadius: "var(--radius-lg)", background: t.bg, color: t.fg, marginTop: 12, minHeight: b.hideText ? 160 : undefined, border: (b.theme === "transparent" || b.theme === "blank") ? "1px solid var(--border)" : "none" }}>
        {b.image
          ? <React.Fragment>
              <div style={{ position: "absolute", inset: 0, backgroundImage: "url('" + b.image + "')", backgroundSize: b.fit === "contain" ? "contain" : "cover", backgroundRepeat: "no-repeat", backgroundPosition: "center" }} />
              <div style={{ position: "absolute", inset: 0, background: t.bg, opacity: (b.imgOverlay != null ? b.imgOverlay : 20) / 100 }} />
            </React.Fragment>
          : <div style={{ position: "absolute", inset: 0, background: "url('../../assets/krama-pattern.svg')", backgroundSize: 48, opacity: 0.08 }} />}
        {!b.hideText && (
        <div style={{ position: "relative", padding: "16px 18px" }}>
          {b.icon && <i data-lucide={b.icon} style={{ width: 20, height: 20, marginBottom: 8, opacity: 0.9 }} />}
          <div style={{ fontWeight: 700, fontSize: "var(--text-sm)", lineHeight: 1.35, marginBottom: 4 }}>{b.title}</div>
          {b.message && <div style={{ fontSize: "var(--text-xs)", opacity: 0.85, lineHeight: 1.45, marginBottom: 12 }}>{b.message}</div>}
          {b.cta && (
            <button
              onClick={() => { if (b.ctaUrl) window.open(b.ctaUrl, "_blank"); else if (onNav) onNav("jobs"); }}
              style={{ display: "inline-flex", alignItems: "center", gap: 6, background: b.customCtaBg || "rgba(255,255,255,0.18)", border: "1px solid " + (b.customCtaBg ? "transparent" : "rgba(255,255,255,0.35)"), color: b.customCtaFg || t.fg, borderRadius: "var(--radius-sm)", padding: "6px 14px", fontSize: "var(--text-xs)", fontWeight: 700, fontFamily: "var(--font-sans)", cursor: "pointer" }}
            >{b.cta}</button>
          )}
        </div>
        )}
      </div>
    );
  }

  function JobDetailTopBar({ onNav }) {
    useHomeContent();
    return <AnnouncementBar b={loadBanner("jobDetailTopBanner", JD_TOP_DEFAULT)} onNav={onNav} />;
  }

  function JobDetailHero({ onNav }) {
    useHomeContent();
    const h = loadBanner("jobDetailHero", JD_HERO_DEFAULT);
    if (!h || h.visible === false) return null;
    return (
      <div className={"krm-page-hero" + (h.hideText ? " krm-page-hero--img" : "")} style={{ position: "relative", background: "var(--teal-800)", overflow: "hidden", padding: h.hideText ? 0 : "64px 32px", aspectRatio: h.hideText ? "1600 / 480" : undefined, maxHeight: h.hideText ? 480 : undefined }}>
        {h.image
          ? <React.Fragment>
              <img className="krm-page-hero-bg" src={h.image} alt="" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: h.fit === "contain" ? "contain" : "cover", display: "block" }} />
              <div className="krm-page-hero-tint" style={{ position: "absolute", inset: 0, background: "var(--teal-800)", opacity: (h.imgOverlay != null ? h.imgOverlay : 60) / 100 }} />
            </React.Fragment>
          : <div style={{ position: "absolute", inset: 0, background: "url('../../assets/krama-pattern.svg')", backgroundSize: 72, opacity: 0.08 }} />}
        {!h.hideText && (
        <div style={{ position: "relative", maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ fontSize: "var(--text-xs)", fontWeight: 800, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--teal-200)" }}>{TR("Now hiring")}</div>
          <h2 style={{ color: "#fff", fontSize: "var(--text-4xl)", fontWeight: 800, letterSpacing: "-0.02em", marginTop: 6 }}>{TR(h.heading)}</h2>
          {h.sub && <p style={{ color: "var(--stone-300)", fontSize: "var(--text-lg)", marginTop: 8 }}>{TR(h.sub)}</p>}
        </div>
        )}
      </div>
    );
  }

  function JobDetail({ job, onBack, onOpenJob, onApply, saved, toggleSave, onNav }) {
    const j = job || (D.jobs && D.jobs[0]);
    const [applied, setApplied] = React.useState(false);
    // Similar jobs view — List by default, with a Grid option.
    const [similarView, setSimilarView] = React.useState("list");
    React.useEffect(() => {
      let alive = true;
      setApplied(false);
      var id = j && (j._raw ? j._raw.id : j.id);
      if (id && window.KRAMA_API && window.KRAMA_API.checkApplied) {
        window.KRAMA_API.checkApplied(id).then((r) => { if (alive) setApplied(!!(r && r.applied)); }).catch(() => {});
      }
      return () => { alive = false; };
    }, [j && j.id]);

    if (!j) return null;

    const expiryStr = fmtExpiry(j.expiresAt || (j._raw && j._raw.expires_at));
    const similarJobs = (D.jobs || [])
      .filter((x) => String(x.id) !== String(j.id))
      .map((x) => {
        var score = 0;
        if (x.category && j.category && x.category === j.category) score += 3;
        if (x.type && j.type && x.type === j.type) score += 1;
        if (x.experienceLevel && j.experienceLevel && x.experienceLevel === j.experienceLevel) score += 1;
        return { job: x, score };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, 5)
      .map((x) => x.job);

    const ApplyButton = () => applied
      ? <Button variant="secondary" block size="lg" disabled iconLeft={I("check", 16)}>{TR("Applied")}</Button>
      : <Button variant="primary" block size="lg" onClick={() => onApply && onApply(j)}>{TR("Apply now")}</Button>;

    return (
      <div style={{ background: "var(--surface-page)" }}>
        <JobDetailTopBar onNav={onNav} />
        <JobDetailHero onNav={onNav} />
        <div className="krm-jd-container" style={{ maxWidth: 1200, margin: "0 auto", padding: "24px 32px 56px" }}>
          <button onClick={onBack} style={{ border: "none", background: "transparent", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 6, color: "var(--text-muted)", fontFamily: "var(--font-sans)", fontWeight: 600, fontSize: "var(--text-sm)", marginBottom: 18 }}>
            {I("arrow-left", 16)} Back to jobs
          </button>

          <div className="krm-jd-layout" style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) 340px", gap: 28, alignItems: "start" }}>
            <main>
              <Card padding={28}>
                {/* Header */}
                <div style={{ display: "flex", gap: 18 }}>
                  <Avatar src={j.logo || (window.KRAMA_LOGOS||{})[j.company]} name={j.company} square size={64} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                      <h1 className="krm-jd-title" style={{ fontSize: "var(--text-3xl)", fontWeight: 700, color: "var(--text-strong)" }}>{j.title}</h1>
                      {j.featured && <Badge tone="accent">{TR("Featured")}</Badge>}
                      {j.remote && <Badge tone="brand">{TR("Remote")}</Badge>}
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 6, color: "var(--text-muted)", fontSize: "var(--text-md)", flexWrap: "wrap" }}>
                      <span style={{ fontWeight: 600, color: "var(--text-body)" }}>{j.company}</span>
                      {j.isVerified && <span style={{ color: "var(--brand)", display: "inline-flex" }}>{I("badge-check", 16)}</span>}
                      {j.location && <React.Fragment><span>·</span><span>{j.location}</span></React.Fragment>}
                    </div>
                  </div>
                </div>

                {/* Meta bar */}
                <div className="krm-jd-meta" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(140px,1fr))", gap: 16, marginTop: 24, paddingTop: 24, borderTop: "1px solid var(--border)" }}>
                  <Meta icon="banknote"  label={TR("Salary")}     value={j.salary} />
                  <Meta icon="briefcase" label={TR("Job type")}   value={j.type} />
                  <Meta icon="signal"    label={TR("Experience")} value={j.experienceLevel} />
                  <Meta icon="map-pin"   label={TR("Location")}   value={j.location} />
                  {j.workingDays && <Meta icon="calendar-days" label={TR("Working days")} value={j.workingDays} />}
                  {j.workingTime && <Meta icon="clock"         label={TR("Working time")} value={j.workingTime} />}
                </div>
                {j.mapLocation && (
                  <div style={{ marginTop: 16 }}>
                    <a
                      href={/^https?:\/\//i.test(j.mapLocation) ? j.mapLocation : ("https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent(j.mapLocation))}
                      target="_blank" rel="noopener noreferrer"
                      style={{ display: "inline-flex", alignItems: "center", gap: 6, color: "var(--text-brand)", fontWeight: 600, fontSize: "var(--text-sm)", textDecoration: "none" }}
                    >{I("map-pin", 15)} {/^https?:\/\//i.test(j.mapLocation) ? TR("View on map") : j.mapLocation}</a>
                  </div>
                )}

                {/* Description */}
                {j.description && (
                  <Block title="About the role">
                    <RichContent html={j.description} />
                  </Block>
                )}

                {/* Requirements */}
                {j.requirements && (
                  <Block title="Requirements">
                    <RichContent html={j.requirements} />
                  </Block>
                )}

                {/* Benefits */}
                {j.benefits && (
                  <Block title="Benefits">
                    <RichContent html={j.benefits} />
                  </Block>
                )}

                {/* Empty state */}
                {!j.description && !j.requirements && !j.benefits && (
                  <div style={{ marginTop: 24, color: "var(--text-muted)", fontSize: "var(--text-sm)", fontStyle: "italic" }}>
                    No additional details provided for this role.
                  </div>
                )}
              </Card>

              {/* Mobile: apply + save card above Similar jobs (hidden on desktop) */}
              <div className="krm-jd-apply-above-similar" style={{ display: "none", marginTop: 24 }}>
                <Card padding={20}>
                  <ApplyButton />
                  <Button variant="secondary" block iconLeft={I("bookmark", 16)} style={{ marginTop: 10 }} onClick={() => toggleSave(j.id)}>
                    {saved && saved.includes(j.id) ? "Saved" : "Save job"}
                  </Button>
                  {expiryStr && (
                    <div style={{ marginTop: 16, paddingTop: 16, borderTop: "1px solid var(--border)", fontSize: "var(--text-sm)", color: "var(--text-muted)", textAlign: "center" }}>
                      Closes {expiryStr}
                    </div>
                  )}
                </Card>
                <JobDetailBanner onNav={onNav} />
              </div>

              {/* Similar jobs */}
              {similarJobs.length > 0 && (
                <div className="krm-jd-similar" style={{ marginTop: 40 }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, marginBottom: 18 }}>
                    <h3 style={{ fontSize: "var(--text-2xl)", fontWeight: 700, color: "var(--text-strong)" }}>{TR("Similar jobs")}</h3>
                    <div style={{ display: "flex", gap: 4 }}>
                      {[["list", "list"], ["grid", "layout-grid"]].map(([v, ic]) => (
                        <button key={v} onClick={() => setSimilarView(v)} aria-label={v === "list" ? "List view" : "Grid view"} style={{
                          width: 34, height: 34, borderRadius: "var(--radius-sm)", cursor: "pointer",
                          border: "1px solid " + (similarView === v ? "var(--brand)" : "var(--border-strong)"),
                          background: similarView === v ? "var(--brand-subtle)" : "var(--surface-card)",
                          color: similarView === v ? "var(--text-brand)" : "var(--text-muted)",
                          display: "inline-flex", alignItems: "center", justifyContent: "center",
                        }}>{I(ic, 16)}</button>
                      ))}
                    </div>
                  </div>
                  {similarView === "grid" ? (
                    <div className="krm-jd-similar-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                      {similarJobs.map((x) => (
                        <JobCard key={x.id} {...x} saved={saved.includes(x.id)} onSave={() => toggleSave(x.id)} onClick={() => onOpenJob(x)} />
                      ))}
                    </div>
                  ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                      {similarJobs.map((x) => (
                        <div key={x.id} onClick={() => onOpenJob(x)} style={{ display: "flex", alignItems: "center", gap: 14, padding: "12px 16px", border: "1px solid var(--border)", borderRadius: "var(--radius-md)", background: "var(--surface-card)", cursor: "pointer" }}>
                          <Avatar src={x.logo} name={x.company} square size={40} />
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontWeight: 700, color: "var(--text-strong)", fontSize: "var(--text-sm)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{x.title}</div>
                            <div style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)", marginTop: 3, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{[x.company, x.location, x.salary].filter(Boolean).join("  ·  ")}</div>
                          </div>
                          {x.postedAt && <span style={{ fontSize: "var(--text-xs)", color: "var(--text-faint)", flexShrink: 0 }}>{x.postedAt}</span>}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </main>

            {/* Sidebar */}
            <aside className="krm-jd-aside" style={{ position: "sticky", top: 84, display: "flex", flexDirection: "column", gap: 16 }}>
              <Card padding={20}>
                <ApplyButton />
                <Button variant="secondary" block iconLeft={I("bookmark", 16)} style={{ marginTop: 10 }} onClick={() => toggleSave(j.id)}>
                  {saved && saved.includes(j.id) ? "Saved" : "Save job"}
                </Button>
                <div style={{ marginTop: 16, paddingTop: 16, borderTop: "1px solid var(--border)", display: "flex", justifyContent: "space-between", fontSize: "var(--text-sm)", color: "var(--text-muted)" }}>
                  <span>Posted {j.postedAt}</span>
                  {expiryStr && <span>Closes {expiryStr}</span>}
                </div>
                <JobDetailBanner onNav={onNav} />
              </Card>

              <Card padding={20}>
                <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                  <Avatar src={j.logo || (window.KRAMA_LOGOS||{})[j.company]} name={j.company} square size={44} />
                  <div>
                    <div style={{ fontWeight: 700, color: "var(--text-strong)" }}>{j.company}</div>
                    {j.companyIndustry && <div style={{ fontSize: "var(--text-sm)", color: "var(--text-muted)" }}>{j.companyIndustry}</div>}
                  </div>
                </div>
                {j.companyAddress && (
                  <div style={{ display: "flex", gap: 6, alignItems: "center", marginTop: 10, fontSize: "var(--text-sm)", color: "var(--text-muted)" }}>
                    {I("map-pin", 14)} {j.companyAddress}
                  </div>
                )}
                {j.companyWebsite && (
                  <a href={j.companyWebsite} target="_blank" rel="noreferrer" style={{ display: "flex", gap: 6, alignItems: "center", marginTop: 6, fontSize: "var(--text-sm)", color: "var(--brand)", textDecoration: "none" }}>
                    {I("globe", 14)} {j.companyWebsite.replace(/^https?:\/\//, "")}
                  </a>
                )}
                <Button variant="ghost" size="sm" style={{ marginTop: 8, paddingLeft: 0 }} iconRight={I("arrow-right", 14)} onClick={() => onNav && onNav("companies", { company: j.company })}>{TR("View company profile")}</Button>
              </Card>
            </aside>
          </div>
        </div>
      </div>
    );
  }

  window.KramaJobDetail = JobDetail;
})();
