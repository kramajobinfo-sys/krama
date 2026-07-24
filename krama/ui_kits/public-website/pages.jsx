// Krama public website -- CMS info pages (About, Contact, Terms, Privacy) + Candidate profile.
(function init() {
  if (!window.KramaDesignSystem_1a6f65) { return setTimeout(init, 40); }
  const { Button, Input, Textarea, Card, Badge, Avatar } = window.KramaDesignSystem_1a6f65;
  const TR = window.KRAMA_T || function (s) { return s; };
  const I = (n, s = 18) => <i data-lucide={n} style={{ width: s, height: s }}></i>;

  // ── Top announcement bar (shared style with Find Jobs / Companies / Job Detail) ──
  const EMPLOYERS_TOP_DEFAULT = { visible: true, theme: "saffron", icon: "briefcase", title: "Ready to hire?", message: "Post your first job free and reach 40,000+ verified candidates.", cta: "Post a job", ctaUrl: "", image: "../../assets/banners/bg-employersTopBanner.svg", fit: "cover" };
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
                {b.cta && <span onClick={() => { if (b.ctaUrl) window.open(b.ctaUrl, b.ctaUrl.startsWith("http") ? "_blank" : "_self"); else onNav && onNav("register"); }} style={{ flexShrink: 0, background: t.pill, color: t.pillFg, fontSize: "var(--text-sm)", fontWeight: 700, padding: "7px 16px", borderRadius: "var(--radius-pill)", cursor: "pointer", whiteSpace: "nowrap" }}>{TR(b.cta)}</span>}
              </React.Fragment>}
          <button onClick={() => setDismissed(true)} style={{ flexShrink: 0, background: "transparent", border: "none", color: t.fg, opacity: 0.7, cursor: "pointer", display: "inline-flex", padding: 4 }}>{I("x", 16)}</button>
        </div>
      </div>
    );
  }

  // Live pricing — mirrors the real plans an employer sees in Billing (never hardcode plan copy here,
  // it drifts out of sync with the actual subscription tiers). If plans can't be fetched, hide the
  // cards rather than risk showing stale/incorrect pricing.
  function PricingSection({ onNav }) {
    const [plans, setPlans] = React.useState(null); // null = loading
    const [active, setActive] = React.useState(0);  // mobile: which plan tab is selected
    React.useEffect(() => {
      let alive = true;
      window.KRAMA_API.fetchPlans()
        .then((data) => { if (alive) setPlans(Array.isArray(data) ? data : []); })
        .catch(() => { if (alive) setPlans([]); });
      return () => { alive = false; };
    }, []);

    const isTrial = (p) => Number(p.price) === 0 && Number(p.trial_days) > 0;
    const isFree = (p) => Number(p.price) === 0 && !isTrial(p);
    const isCustom = (p) => !!p.custom_pricing;
    const planFeatures = (p) => Array.isArray(p.features_json) ? p.features_json : [];

    if (plans === null) {
      return <div style={{ textAlign: "center", padding: "60px 0", color: "var(--text-muted)" }}>Loading plans…</div>;
    }
    if (plans.length === 0) {
      return (
        <div className="krm-emp-empty" style={{ textAlign: "center", padding: "44px 24px", color: "var(--text-muted)", background: "var(--surface-sunken)", borderRadius: "var(--radius-xl)", border: "1px solid var(--border)" }}>
          <p style={{ fontSize: "var(--text-base)", marginTop: 0 }}>{TR("Pricing is being updated right now.")}</p>
          <Button variant="secondary" style={{ marginTop: 12 }} onClick={() => onNav && onNav("contact")}>{TR("Contact us")}</Button>
        </div>
      );
    }

    const act = Math.min(active, plans.length - 1);
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        {/* Mobile: tab selector. Hidden on desktop (there the grid below shows all cards). */}
        <div className="krm-pricing-tabs">
          {plans.map((p, i) => (
            <button key={p.id} className={"krm-pricing-tab" + (i === act ? " is-active" : "")} onClick={() => setActive(i)}>{p.name}</button>
          ))}
        </div>
        <div className="krm-info-grid krm-pricing-grid" style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16, alignItems: "start" }}>
          {plans.map((p, i) => {
            const popular = /professional/i.test(p.name || "");
            const custom = isCustom(p);
            const free = isFree(p);
            const trial = isTrial(p);
            const dark = custom;
            const textStrong = dark ? "var(--text-on-dark, #fff)" : "var(--text-strong)";
            const textMuted = dark ? "var(--text-on-dark-mut, rgba(255,255,255,0.65))" : "var(--text-muted)";
            const textBody = dark ? "rgba(255,255,255,0.9)" : "var(--text-body)";
            const checkColor = dark ? "#fff" : "var(--brand)";
            return (
              <Card key={p.id} className={"krm-plan-card" + (i === act ? " is-active" : "")} featured={popular} padding={22} style={{
                border: popular ? "1.5px solid var(--brand)" : (dark ? "none" : undefined),
                background: dark ? "var(--stone-900, #1a1a1a)" : undefined,
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <h3 style={{ fontSize: "var(--text-lg)", fontWeight: 700, color: textStrong }}>{p.name}</h3>
                  {popular ? <Badge tone="accent">{TR("Most popular")}</Badge> : null}
                </div>
                <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginTop: 14 }}>
                  {custom ? (
                    <span style={{ fontFamily: "var(--font-display)", fontSize: "var(--text-4xl)", fontWeight: 800, color: textStrong }}>{TR("Custom")}</span>
                  ) : trial ? (
                    <React.Fragment>
                      <span style={{ fontFamily: "var(--font-display)", fontSize: "var(--text-4xl)", fontWeight: 800, color: textStrong }}>{p.trial_days || 7}</span>
                      <span style={{ color: textMuted, fontSize: "var(--text-base)" }}>{TR("days free")}</span>
                    </React.Fragment>
                  ) : free ? (
                    <span style={{ fontFamily: "var(--font-display)", fontSize: "var(--text-4xl)", fontWeight: 800, color: textStrong }}>{TR("Free")}</span>
                  ) : (
                    <React.Fragment>
                      <span style={{ fontFamily: "var(--font-display)", fontSize: "var(--text-4xl)", fontWeight: 800, color: textStrong }}>${p.price}</span>
                      <span style={{ color: textMuted, fontSize: "var(--text-base)" }}>/ {p.interval}</span>
                    </React.Fragment>
                  )}
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 11, margin: "20px 0 24px" }}>
                  {p.job_post_limit != null && (
                    <div style={{ display: "flex", gap: 9, fontSize: "var(--text-base)", color: textBody }}>
                      <span style={{ color: checkColor, flexShrink: 0 }}>{I("check", 18)}</span>{p.job_post_limit} {TR("active job posts")}
                    </div>
                  )}
                  {planFeatures(p).map((f) => (
                    <div key={f} style={{ display: "flex", gap: 9, fontSize: "var(--text-base)", color: textBody }}>
                      <span style={{ color: checkColor, flexShrink: 0 }}>{I("check", 18)}</span>{f}
                    </div>
                  ))}
                </div>
                <Button
                  variant={dark ? "secondary" : (popular ? "primary" : "secondary")}
                  block
                  style={dark ? { background: "#fff", color: "var(--stone-900, #1a1a1a)", border: "none" } : undefined}
                  onClick={() => {
                    if (custom) { window.location.href = "mailto:info@kramajob.com?subject=" + encodeURIComponent("Enterprise plan inquiry"); return; }
                    onNav && onNav("register");
                  }}
                >
                  {custom ? TR("Contact sales") : trial ? (TR("Start") + " " + (p.trial_days || 7) + TR("-Day Trial")) : free ? TR("Get started") : (TR("Choose") + " " + p.name)}
                </Button>
              </Card>
            );
          })}
        </div>
        <p style={{ fontSize: "var(--text-sm)", color: "var(--text-muted)", textAlign: "center" }}>
          {TR("Prices exclude applicable taxes. Pay by KHQR, ABA, Wing, or card. Cancel anytime.")}
        </p>
      </div>
    );
  }

  // ── For Employers landing ─────────────────────────────────────────────────
  const EMPLOYER_FEATURES = [
    ["briefcase", "Post jobs in minutes", "Create a listing with salary range, requirements, and your company brand. Every job is reviewed by our team before it goes live — candidates trust what they see."],
    ["layout-dashboard", "Pipeline board", "See every applicant at a glance. Drag candidates through stages — Applied, Reviewed, Shortlisted, Interview, Offered — and your whole team stays in sync."],
    ["file-down", "CV access", "Download uploaded CVs directly through Krama. Candidates control their visibility so you always work with people who genuinely want to be found."],
    ["users", "Team management", "Invite recruiters under your company account. Each team member posts and manages their own jobs; you see the full picture."],
    ["bar-chart-2", "Analytics dashboard", "Track how many views, applications, and conversion rates your jobs get — so you know which roles need a boost."],
    ["shield-check", "Verified company badge", "Complete a quick verification and earn the Krama Verified badge. Candidates apply more confidently to verified listings."],
  ];

  function EmployerLanding({ onNav }) {
    React.useEffect(() => { if (window.lucide) window.lucide.createIcons(); });
    return (
      <React.Fragment>
        {/* How it works */}
        <div className="krm-emp-section" style={{ marginBottom: 56 }}>
          <div style={{ textAlign: "center", marginBottom: 32 }}>
            <h2 className="krm-emp-h2" style={{ fontSize: "var(--text-3xl)", fontWeight: 800, color: "var(--text-strong)", letterSpacing: "-0.02em" }}>{TR("How it works")}</h2>
            <p className="krm-emp-sub" style={{ fontSize: "var(--text-lg)", color: "var(--text-muted)", marginTop: 8, maxWidth: 560, margin: "8px auto 0" }}>{TR("From posting to offer in three steps.")}</p>
          </div>
          <div className="krm-info-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 20, alignItems: "start" }}>
            {[
              ["briefcase", "1. Post your job", "Create a listing in minutes. Set salary range, required skills, and your company story. Our team reviews every job before it goes live."],
              ["users", "2. Review applicants", "Applications land in a visual pipeline. Move candidates through stages — shortlisted, interview, offered — with one click."],
              ["check-circle", "3. Make the hire", "Download CVs, leave notes, and update candidates directly. No juggling spreadsheets or email threads."],
            ].map(function(item, idx) {
              return (
                <div key={idx} style={{ background: "var(--surface-card)", border: "1px solid var(--border)", borderRadius: "var(--radius-lg)", padding: 28 }}>
                  <div style={{ width: 48, height: 48, borderRadius: "var(--radius-md)", background: "var(--brand-subtle)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--brand)", marginBottom: 16 }}>
                    <i data-lucide={item[0]} style={{ width: 22, height: 22 }}></i>
                  </div>
                  <h3 style={{ fontSize: "var(--text-lg)", fontWeight: 700, color: "var(--text-strong)", marginBottom: 8 }}>{TR(item[1])}</h3>
                  <p style={{ fontSize: "var(--text-base)", color: "var(--text-body)", lineHeight: 1.6, margin: 0 }}>{TR(item[2])}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Feature grid */}
        <div className="krm-emp-section" style={{ marginBottom: 64 }}>
          <div style={{ textAlign: "center", marginBottom: 32 }}>
            <h2 className="krm-emp-h2" style={{ fontSize: "var(--text-3xl)", fontWeight: 800, color: "var(--text-strong)", letterSpacing: "-0.02em" }}>{TR("Everything you need")}</h2>
          </div>
          <div className="krm-info-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16, alignItems: "start" }}>
            {EMPLOYER_FEATURES.map(function(f, idx) {
              return (
                <div key={idx} style={{ display: "flex", gap: 14, padding: "20px 0" }}>
                  <div style={{ width: 40, height: 40, borderRadius: "var(--radius-md)", background: "var(--brand-subtle)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--brand)", flexShrink: 0 }}>
                    <i data-lucide={f[0]} style={{ width: 18, height: 18 }}></i>
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, color: "var(--text-strong)", marginBottom: 4 }}>{TR(f[1])}</div>
                    <div style={{ fontSize: "var(--text-sm)", color: "var(--text-muted)", lineHeight: 1.55 }}>{TR(f[2])}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Social proof numbers */}
        <div className="krm-emp-band" style={{ background: "var(--surface-sunken)", borderRadius: "var(--radius-xl)", padding: "36px 40px", marginBottom: 64 }}>
          <div className="krm-info-grid krm-stats-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 24, textAlign: "center" }}>
            {[["486", "Verified companies"], ["40k+", "Active candidates"], ["12,480", "Live jobs posted"]].map(function(stat) {
              return (
                <div key={stat[1]}>
                  <div className="krm-emp-stat-num" style={{ fontFamily: "var(--font-display)", fontSize: "var(--text-5xl)", fontWeight: 800, color: "var(--brand)", lineHeight: 1 }}>{stat[0]}</div>
                  <div className="krm-emp-stat-label" style={{ fontSize: "var(--text-base)", color: "var(--text-muted)", marginTop: 6 }}>{TR(stat[1])}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Pricing */}
        <div className="krm-emp-section" style={{ marginBottom: 64 }}>
          <div style={{ textAlign: "center", marginBottom: 32 }}>
            <h2 className="krm-emp-h2" style={{ fontSize: "var(--text-3xl)", fontWeight: 800, color: "var(--text-strong)", letterSpacing: "-0.02em" }}>{TR("Plan grow with yours")}</h2>
            <p className="krm-emp-sub" style={{ fontSize: "var(--text-lg)", color: "var(--text-muted)", marginTop: 8 }}>{TR("Start free, upgrade when you need more reach.")}</p>
          </div>
          <PricingSection onNav={onNav} />
        </div>

        {/* CTA strip */}
        <div className="krm-emp-cta" style={{ background: "var(--teal-800)", borderRadius: "var(--radius-xl)", padding: "44px 40px", textAlign: "center", position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", inset: 0, background: "url('../../assets/krama-pattern.svg')", backgroundSize: 64, opacity: 0.08 }} />
          <div style={{ position: "relative" }}>
            <h2 className="krm-emp-h2" style={{ fontSize: "var(--text-3xl)", fontWeight: 800, color: "#fff", marginBottom: 12, letterSpacing: "-0.02em" }}>{TR("Ready to find your next hire?")}</h2>
            <p className="krm-emp-sub" style={{ color: "rgba(255,255,255,0.8)", fontSize: "var(--text-lg)", marginBottom: 28 }}>{TR("Create a free account and post your first job today.")}</p>
            <div className="krm-emp-cta-btns" style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
              <Button variant="primary" style={{ background: "#fff", color: "var(--teal-800)", border: "none" }} onClick={function() { onNav && onNav("register"); }}>{TR("Post a job — it's free")}</Button>
              <Button variant="secondary" style={{ color: "#fff", borderColor: "rgba(255,255,255,0.4)", background: "transparent" }} onClick={function() { onNav && onNav("pricing"); }}>{TR("See pricing")}</Button>
            </div>
          </div>
        </div>
      </React.Fragment>
    );
  }

  const CONTENT = {
    employers: {
      eyebrow: "Members",
      title: "Hire the right people, faster.",
      lead: "Post jobs, review applications, and manage your entire hiring pipeline — all in one place built for Cambodia and Southeast Asia.",
      render: (onNav) => <EmployerLanding onNav={onNav} />,
    },
    pricing: {
      eyebrow: "Pricing", title: "Plans that grow with your hiring.",
      lead: "Start free, upgrade when you need more reach. All prices in USD.",
      render: (onNav) => <PricingSection onNav={onNav} />,
    },
    about: {
      eyebrow: "About us", title: "Work that fits your life.",
      lead: "Krama connects ambitious people with verified employers across Cambodia and Southeast Asia.",
      render: (onNav) => {
        const H = ({ children }) => (
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: "var(--text-2xl)", fontWeight: 800, color: "var(--text-strong)", letterSpacing: "-0.01em", margin: 0 }}>{children}</h2>
        );
        const FeatureCard = ({ icon, title, body }) => (
          <Card padding={28}>
            <div style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 48, height: 48, borderRadius: "var(--radius-md)", background: "var(--brand-subtle)", color: "var(--brand)", marginBottom: 14 }}>{I(icon, 22)}</div>
            <div style={{ fontSize: "var(--text-lg)", fontWeight: 700, color: "var(--text-strong)", marginBottom: 6 }}>{TR(title)}</div>
            <p style={{ fontSize: "var(--text-base)", color: "var(--text-muted)", lineHeight: 1.6, margin: 0 }}>{TR(body)}</p>
          </Card>
        );
        const VALUES = [
          ["shield-check", "Verified & trusted", "Every company is checked and every job is reviewed before it goes live."],
          ["map-pin", "Local-first", "Built for Cambodia and the region, with payments that work here — KHQR, ABA, and Wing."],
          ["heart", "Human & hopeful", "We treat every candidate as more than a CV, and every employer as a partner."],
          ["languages", "Bilingual", "Khmer and English as first-class peers, across the whole experience."],
        ];
        return (
          <div style={{ display: "flex", flexDirection: "column", gap: 44 }}>
            {/* Mission */}
            <div style={{ display: "flex", flexDirection: "column", gap: 16, maxWidth: 760 }}>
              <p style={{ fontSize: "var(--text-xl)", color: "var(--text-strong)", lineHeight: 1.6, fontWeight: 600, margin: 0 }}>
                {TR("Krama exists to make finding work — and hiring — feel hopeful and human.")}
              </p>
              <p style={{ fontSize: "var(--text-base)", color: "var(--text-body)", lineHeight: 1.7, margin: 0 }}>
                {TR("Every company on Krama is verified and every job is reviewed before it goes live, so candidates apply with confidence and employers reach people who are genuinely a fit. We're a Cambodia-first team building for the whole region — with Khmer and English side by side, and local payment options from KHQR to ABA and Wing.")}
              </p>
            </div>

            {/* Stats band */}
            <Card padding={0}>
              <div className="krm-info-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)" }}>
                {[["12,480", "Open jobs"], ["486", "Verified companies"], ["40k+", "Candidates"]].map(([n, l], i) => (
                  <div key={l} style={{ padding: "28px 24px", textAlign: "center", borderLeft: i ? "1px solid var(--border)" : "none" }}>
                    <div style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "var(--text-4xl)", color: "var(--brand)" }}>{n}</div>
                    <div style={{ fontSize: "var(--text-base)", color: "var(--text-muted)", marginTop: 4 }}>{TR(l)}</div>
                  </div>
                ))}
              </div>
            </Card>

            {/* What we do */}
            <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
              <H>{TR("What we do")}</H>
              <div className="krm-info-grid" style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 16 }}>
                <FeatureCard icon="search" title="For candidates" body="Search thousands of verified jobs, build a résumé, save roles, follow companies, and apply in a few taps — with your CV visibility always under your control." />
                <FeatureCard icon="briefcase" title="Employers" body="Post jobs, reach verified candidates, and manage your entire hiring pipeline — from application to offer — with tools built for local teams." />
              </div>
            </div>

            {/* Values */}
            <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
              <H>{TR("What we stand for")}</H>
              <div className="krm-info-grid" style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16 }}>
                {VALUES.map(([icon, title, body]) => (
                  <Card key={title} padding={22}>
                    <div style={{ color: "var(--brand)", marginBottom: 10 }}>{I(icon, 24)}</div>
                    <div style={{ fontSize: "var(--text-base)", fontWeight: 700, color: "var(--text-strong)", marginBottom: 6 }}>{TR(title)}</div>
                    <p style={{ fontSize: "var(--text-sm)", color: "var(--text-muted)", lineHeight: 1.55, margin: 0 }}>{TR(body)}</p>
                  </Card>
                ))}
              </div>
            </div>

            {/* CTA */}
            <div style={{ position: "relative", overflow: "hidden", borderRadius: "var(--radius-lg)", background: "var(--teal-800)", padding: "40px 32px", textAlign: "center" }}>
              <div style={{ position: "absolute", inset: 0, background: "url('../../assets/krama-pattern.svg')", backgroundSize: 72, opacity: 0.08 }} />
              <div style={{ position: "relative" }}>
                <h2 style={{ fontFamily: "var(--font-display)", fontSize: "var(--text-2xl)", fontWeight: 800, color: "#fff", margin: 0 }}>{TR("Ready to get started?")}</h2>
                <p style={{ color: "var(--stone-300)", fontSize: "var(--text-base)", marginTop: 8, marginBottom: 20 }}>{TR("Find your next role or hire your next teammate on Krama.")}</p>
                <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
                  <Button variant="primary" onClick={() => onNav && onNav("jobs")}>{TR("Find jobs")}</Button>
                  <Button variant="secondary" onClick={() => onNav && onNav("employers")}>{TR("Employers")}</Button>
                </div>
              </div>
            </div>
          </div>
        );
      },
    },
    contact: {
      eyebrow: "Contact", title: "We'd love to hear from you.",
      lead: "Questions, partnerships, or support -- reach the Krama team.",
      render: () => (
        <div className="krm-info-grid" style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: 32, alignItems: "start" }}>
          <Card padding={28}>
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div className="krm-info-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                <Input label={TR("Your name")} placeholder="Sok Dara" />
                <Input label={TR("Email")} type="email" placeholder="you@example.com" />
              </div>
              <Input label={TR("Subject")} placeholder={TR("How can we help?")} />
              <Textarea label={TR("Message")} rows={5} placeholder={TR("Tell us a little more…")} />
              <Button variant="primary">{TR("Send message")}</Button>
            </div>
          </Card>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {[["map-pin", "Office", "Wat Samrong andet, Khan Sensok, Phnom Penh, Cambodia"], ["mail", "Email", "info@kramajob.com"], ["phone", "Phone", "087 767 272"], ["globe", "Website", "kramajob.com"], ["clock", "Hours", "Mon-Fri · 8:00-17:30"]].map(([ic, k, v]) => (
              <div key={k} style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
                <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 42, height: 42, borderRadius: "var(--radius-md)", background: "var(--brand-subtle)", color: "var(--brand)", flexShrink: 0 }}>{I(ic, 18)}</span>
                <div>
                  <div style={{ fontWeight: 700, color: "var(--text-strong)" }}>{TR(k)}</div>
                  <div style={{ fontSize: "var(--text-sm)", color: "var(--text-muted)", marginTop: 2 }}>{v}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ),
    },
    terms: {
      eyebrow: "Legal", title: "Terms of Service",
      lead: "The rules for using Krama Job. Last updated 24 July 2026.",
      render: () => <TermsContent />,
    },
    privacy: {
      eyebrow: "Legal", title: "Privacy Policy",
      lead: "How Krama Job collects, uses, and protects your information. Last updated 24 July 2026.",
      render: () => <PrivacyContent />,
    },
  };

  function prose(items) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 22, maxWidth: 760 }}>
        {items.map(([h, b]) => (
          <div key={h}>
            <h3 style={{ fontSize: "var(--text-lg)", fontWeight: 700, color: "var(--text-strong)", marginBottom: 6 }}>{h}</h3>
            <p style={{ fontSize: "var(--text-base)", color: "var(--text-body)", lineHeight: 1.6 }}>{b}</p>
          </div>
        ))}
      </div>
    );
  }

  // ── Full Privacy Policy (Facebook-review ready: social-login disclosure + data-deletion path) ──
  function PrivacyContent() {
    const P = ({ children }) => <p style={{ fontSize: "var(--text-base)", color: "var(--text-body)", lineHeight: 1.65, margin: 0 }}>{children}</p>;
    const List = ({ items }) => (
      <ul style={{ margin: "4px 0 0", paddingLeft: 20, display: "flex", flexDirection: "column", gap: 7 }}>
        {items.map((it, i) => <li key={i} style={{ fontSize: "var(--text-base)", color: "var(--text-body)", lineHeight: 1.6 }}>{it}</li>)}
      </ul>
    );
    const Section = ({ n, h, children }) => (
      <div>
        <h3 style={{ fontSize: "var(--text-lg)", fontWeight: 700, color: "var(--text-strong)", marginBottom: 8 }}>{n}. {h}</h3>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>{children}</div>
      </div>
    );
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 24, maxWidth: 760 }}>
        <P>
          Krama Job (“Krama”, “we”, “us”, or “our”) operates the kramajob.com website and related services
          (the “Service”) — an online job board and recruitment platform serving Cambodia and Southeast Asia.
          This Privacy Policy explains what personal information we collect, how we use and share it, and the
          choices and rights you have. By creating an account or using the Service, you agree to the practices
          described in this policy.
        </P>

        <Section n={1} h="Information We Collect">
          <P>We collect the following categories of information:</P>
          <List items={[
            "Account & profile: your name, email address, phone number, password, and profile photo. For candidates, this includes résumé/CV content you provide such as work experience, education, skills, and languages.",
            "Employer & company: company name, registration details, address, logo, and the content of job postings.",
            "Applications & activity: jobs you apply to, jobs you save, companies you follow, messages you exchange with employers, company reviews, and community forum posts.",
            "Social login: if you sign in with Facebook or Google, we receive basic profile information from that provider — typically your name, email address, and profile picture — as permitted by the permissions you grant. We never receive your social-media password.",
            "Payment information: when you buy a paid plan or feature, payments are handled by our payment providers (KHQR/Bakong, ABA PayWay, and Stripe). We receive confirmation of payment and limited transaction details; we do not collect or store your full card number or bank credentials.",
            "Automatically collected: device and browser type, IP address, pages viewed, and actions taken — collected through cookies, browser local storage, and server logs to operate and secure the Service.",
          ]} />
        </Section>

        <Section n={2} h="How We Use Your Information">
          <List items={[
            "Create and manage your account and profile.",
            "Match candidates with jobs and employers with candidates, and power recommendations.",
            "Process job applications and share them with the relevant employer.",
            "Process payments, subscriptions, and featured listings.",
            "Send you transactional messages — email, SMS one-time codes, and Telegram alerts — about your account and activity.",
            "Provide customer support, including our AI-assisted chat.",
            "Maintain security, prevent fraud and abuse, and keep audit logs.",
            "Comply with legal obligations and enforce our Terms of Service.",
          ]} />
        </Section>

        <Section n={3} h="How We Share Your Information">
          <P>We do not sell your personal information. We share it only in these ways:</P>
          <List items={[
            "With employers: when you apply to a job, your application and résumé are shared with that employer. Verified employers can search résumés only if you have opted in through your CV visibility setting.",
            "With service providers who process data on our behalf — payment processors (Bakong/KHQR, ABA PayWay, Stripe), messaging providers (Telegram, our SMS gateway, and our email provider), and AI providers used for the support assistant and CV matching — each only to the extent needed to provide their service.",
            "With social-login providers (Facebook, Google) to authenticate you, as described below.",
            "For legal reasons: to comply with applicable law, respond to lawful requests, or protect the rights, safety, and property of Krama, our users, or the public.",
            "In a business transfer: if Krama is involved in a merger, acquisition, or sale of assets, your information may be transferred as part of that transaction.",
          ]} />
        </Section>

        <Section n={4} h="Facebook Login and Data">
          <P>If you choose to connect your Facebook account:</P>
          <List items={[
            "We request only basic profile information (name, email address, and profile picture) needed to create or sign you into your Krama account.",
            "We use this information solely to authenticate you and populate your Krama profile. We do not post to your Facebook account and we do not access your friends list.",
            "You can disconnect Krama from Facebook at any time in your Facebook settings under “Settings → Apps and Websites”.",
          ]} />
        </Section>

        <Section n={5} h="Data Deletion">
          <P>You can request deletion of your account and associated personal data at any time:</P>
          <List items={[
            "From your Krama profile settings, or",
            "By emailing info@kramajob.com with the subject “Data deletion request”.",
          ]} />
          <P>
            Once we verify your request, we will delete your personal data within 30 days, except information we
            are required to retain for legal, accounting, or fraud-prevention purposes.
          </P>
        </Section>

        <Section n={6} h="Cookies and Similar Technologies">
          <P>
            We use cookies and browser local storage to keep you signed in, remember your preferences (such as
            language), and understand how the Service is used. You can control cookies through your browser
            settings; disabling them may affect some features of the Service.
          </P>
        </Section>

        <Section n={7} h="Data Retention">
          <P>
            We keep your personal information for as long as your account is active or as needed to provide the
            Service. We may retain certain information after your account is closed where required for legal, tax,
            security, or dispute-resolution purposes.
          </P>
        </Section>

        <Section n={8} h="Data Security">
          <P>
            We protect your data using encryption in transit and at rest, role-based access controls, and audit
            logging. No method of transmission or storage is completely secure, but we work to safeguard your
            information and will notify you and the relevant authorities of any breach as required by law.
          </P>
        </Section>

        <Section n={9} h="Your Rights and Choices">
          <List items={[
            "Access, update, or correct your information from your profile.",
            "Export or delete your data (see “Data Deletion” above).",
            "Control your CV visibility to employers.",
            "Withdraw consent or opt out of non-essential communications.",
            "Contact us to exercise any right available to you under applicable law.",
          ]} />
        </Section>

        <Section n={10} h="Children’s Privacy">
          <P>
            The Service is intended for users aged 18 and over. We do not knowingly collect personal information
            from children. If you believe a child has provided us with information, please contact us and we will
            delete it.
          </P>
        </Section>

        <Section n={11} h="International Transfers">
          <P>
            We are based in Cambodia and may process information in other countries where our service providers
            operate. Where we transfer data internationally, we take steps to ensure it remains protected.
          </P>
        </Section>

        <Section n={12} h="Changes to This Policy">
          <P>
            We may update this Privacy Policy from time to time. We will post the updated version on this page and
            revise the “Last updated” date above. Significant changes will be communicated through the Service.
          </P>
        </Section>

        <Section n={13} h="Contact Us">
          <P>If you have any questions about this Privacy Policy or your data, please contact us:</P>
          <div style={{ fontSize: "var(--text-base)", color: "var(--text-body)", lineHeight: 1.7 }}>
            <div style={{ fontWeight: 700, color: "var(--text-strong)" }}>Krama Job</div>
            <div>Wat Samrong andet, Khan Sensok, Phnom Penh, Cambodia</div>
            <div>Email: <a href="mailto:info@kramajob.com" style={{ color: "var(--text-brand)" }}>info@kramajob.com</a></div>
            <div>Phone: <a href="tel:087767272" style={{ color: "var(--text-brand)" }}>087 767 272</a></div>
            <div>Website: <a href="https://kramajob.com" target="_blank" rel="noopener noreferrer" style={{ color: "var(--text-brand)" }}>kramajob.com</a></div>
          </div>
        </Section>
      </div>
    );
  }

  // ── Full Terms of Service ──
  function TermsContent() {
    const P = ({ children }) => <p style={{ fontSize: "var(--text-base)", color: "var(--text-body)", lineHeight: 1.65, margin: 0 }}>{children}</p>;
    const List = ({ items }) => (
      <ul style={{ margin: "4px 0 0", paddingLeft: 20, display: "flex", flexDirection: "column", gap: 7 }}>
        {items.map((it, i) => <li key={i} style={{ fontSize: "var(--text-base)", color: "var(--text-body)", lineHeight: 1.6 }}>{it}</li>)}
      </ul>
    );
    const Section = ({ n, h, children }) => (
      <div>
        <h3 style={{ fontSize: "var(--text-lg)", fontWeight: 700, color: "var(--text-strong)", marginBottom: 8 }}>{n}. {h}</h3>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>{children}</div>
      </div>
    );
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 24, maxWidth: 760 }}>
        <P>
          These Terms of Service (“Terms”) govern your access to and use of the kramajob.com website and related
          services (the “Service”) operated by Krama Job (“Krama”, “we”, “us”, or “our”), an online job board and
          recruitment platform serving Cambodia and Southeast Asia. Please read them carefully. By creating an
          account or using the Service, you agree to these Terms and to our Privacy Policy. If you do not agree,
          please do not use the Service.
        </P>

        <Section n={1} h="Eligibility & Acceptance">
          <List items={[
            "You must be at least 18 years old and able to form a legally binding contract to use the Service.",
            "By registering or using the Service, you accept these Terms and our Privacy Policy.",
            "If you use the Service on behalf of a company or organization, you represent that you are authorized to bind that entity to these Terms.",
          ]} />
        </Section>

        <Section n={2} h="Accounts & Security">
          <List items={[
            "You must provide accurate, current information and keep it up to date.",
            "You are responsible for all activity under your account and for keeping your password confidential.",
            "You may sign in using your email or phone, or a connected Facebook or Google account; you are responsible for the security of any linked account.",
            "Notify us immediately at info@kramajob.com of any unauthorized use of your account.",
          ]} />
        </Section>

        <Section n={3} h="Candidates">
          <List items={[
            "You may create a profile, build a résumé, search and apply to jobs, save jobs, and follow companies.",
            "Apply honestly — misrepresenting your identity, qualifications, or experience may result in suspension.",
            "When you apply, your application and résumé are shared with the relevant employer (see our Privacy Policy).",
            "You control your CV visibility to employers through your profile settings.",
          ]} />
        </Section>

        <Section n={4} h="Employers">
          <List items={[
            "You must provide accurate company information and are subject to verification.",
            "Job postings must be genuine, lawful, non-discriminatory, and for real vacancies.",
            "All jobs are reviewed before publishing; we may reject, edit, or remove postings that are misleading, discriminatory, fraudulent, or that violate these Terms or applicable law.",
            "You must handle candidate data lawfully, use it only for legitimate recruitment, and comply with applicable data-protection and employment laws.",
            "You are solely responsible for your hiring decisions, interviews, offers, and employment relationships.",
          ]} />
        </Section>

        <Section n={5} h="Acceptable Use">
          <P>You agree not to:</P>
          <List items={[
            "Post false, misleading, unlawful, discriminatory, or infringing content.",
            "Harass, defraud, impersonate, or harm other users.",
            "Scrape, harvest, or collect data from the Service by automated means.",
            "Upload malware or interfere with, disrupt, or attempt to gain unauthorized access to the Service.",
            "Use the Service to send spam, or for any purpose other than genuine job search or recruitment.",
          ]} />
        </Section>

        <Section n={6} h="User Content & Community Forum">
          <List items={[
            "You retain ownership of the content you submit (profile, résumé, job posts, reviews, and forum posts).",
            "You grant Krama a non-exclusive, worldwide, royalty-free license to host, display, and use that content as needed to operate and promote the Service.",
            "You are responsible for your content and must have the rights necessary to post it.",
            "We may moderate, remove, or restrict content that violates these Terms, and may suspend repeat offenders.",
          ]} />
        </Section>

        <Section n={7} h="Payments, Subscriptions & Refunds">
          <List items={[
            "Certain features — subscription plans, featured job boosts, and CV-match credits — are paid.",
            "Prices are shown in the Service and may be charged in USD or KHR through our payment providers (KHQR/Bakong, ABA PayWay, or Stripe).",
            "Paid subscriptions renew on their billing date until cancelled; you may cancel before the renewal date.",
            "Fees are non-refundable except where required by law. Featured boosts and credit purchases are one-time and non-refundable once activated.",
            "We may change plans and pricing prospectively; changes will not affect a term you have already paid for.",
          ]} />
        </Section>

        <Section n={8} h="Verification & No Guarantee">
          <List items={[
            "A “Verified” label means we performed a basic check; it is not an endorsement or guarantee of any employer, candidate, or job.",
            "Krama is a marketplace that connects candidates and employers. We are not a party to any employment contract and do not guarantee employment, hiring outcomes, the accuracy of listings, or the conduct of any user.",
          ]} />
        </Section>

        <Section n={9} h="Intellectual Property">
          <P>
            The Service — including its software, design, logos, and content (excluding user content) — is owned
            by Krama and protected by applicable law. You may not copy, modify, distribute, or create derivative
            works from the Service without our prior written permission.
          </P>
        </Section>

        <Section n={10} h="Third-Party Services">
          <P>
            The Service integrates third-party providers (including Facebook, Google, Stripe, ABA PayWay, Bakong,
            Telegram, and AI providers). Your use of those services is governed by their own terms and privacy
            policies. We are not responsible for third-party services or for external websites linked from the
            Service.
          </P>
        </Section>

        <Section n={11} h="Suspension & Termination">
          <List items={[
            "You may stop using the Service and delete your account at any time.",
            "We may suspend or terminate your access if you violate these Terms, create legal risk or exposure, or for prolonged inactivity.",
            "Provisions that by their nature should survive termination — such as payment obligations, disclaimers, and limitation of liability — will survive.",
          ]} />
        </Section>

        <Section n={12} h="Disclaimers">
          <P>
            The Service is provided “as is” and “as available”, without warranties of any kind, whether express or
            implied, including warranties of merchantability, fitness for a particular purpose, and
            non-infringement, to the fullest extent permitted by law.
          </P>
        </Section>

        <Section n={13} h="Limitation of Liability">
          <P>
            To the maximum extent permitted by law, Krama will not be liable for any indirect, incidental, special,
            consequential, or punitive damages, or for any loss of profits, data, or goodwill, arising from or
            related to your use of the Service.
          </P>
        </Section>

        <Section n={14} h="Indemnification">
          <P>
            You agree to indemnify and hold Krama harmless from any claims, losses, liabilities, and expenses
            (including reasonable legal fees) arising from your content, your use of the Service, or your violation
            of these Terms or applicable law.
          </P>
        </Section>

        <Section n={15} h="Changes to These Terms">
          <P>
            We may update these Terms from time to time. We will post the updated version on this page and revise
            the “Last updated” date above. Your continued use of the Service after changes take effect means you
            accept the revised Terms.
          </P>
        </Section>

        <Section n={16} h="Governing Law">
          <P>
            These Terms are governed by the laws of the Kingdom of Cambodia, without regard to its conflict-of-laws
            rules. Any disputes arising from these Terms or the Service will be subject to the competent courts of
            Cambodia.
          </P>
        </Section>

        <Section n={17} h="Contact Us">
          <P>If you have any questions about these Terms, please contact us:</P>
          <div style={{ fontSize: "var(--text-base)", color: "var(--text-body)", lineHeight: 1.7 }}>
            <div style={{ fontWeight: 700, color: "var(--text-strong)" }}>Krama Job</div>
            <div>Wat Samrong andet, Khan Sensok, Phnom Penh, Cambodia</div>
            <div>Email: <a href="mailto:info@kramajob.com" style={{ color: "var(--text-brand)" }}>info@kramajob.com</a></div>
            <div>Phone: <a href="tel:087767272" style={{ color: "var(--text-brand)" }}>087 767 272</a></div>
            <div>Website: <a href="https://kramajob.com" target="_blank" rel="noopener noreferrer" style={{ color: "var(--text-brand)" }}>kramajob.com</a></div>
          </div>
        </Section>
      </div>
    );
  }

  function InfoPage({ slug, onNav }) {
    const c = CONTENT[slug] || CONTENT.about;
    useHomeContent();
    React.useEffect(() => { if (window.lucide) window.lucide.createIcons(); }, [slug]);
    return (
      <div style={{ background: "var(--surface-page)", minHeight: "70vh" }}>
        {slug === "employers" && <AnnouncementBar b={loadBanner("employersTopBanner", EMPLOYERS_TOP_DEFAULT)} onNav={onNav} />}
        {/* page hero — For Employers uses the large 1600 × 480 hero (matches Find Jobs / Companies / Community); Job Detail keeps the smaller hero */}
        {slug === "employers"
          ? (() => { const h = loadBanner("employersHero", { heading: c.title, sub: c.lead, image: "../../assets/banners/bg-employersHero.svg", fit: "cover", imgOverlay: 45 }); return (
            <div className={"krm-page-hero" + (h.hideText ? " krm-page-hero--img" : "")} style={{ position: "relative", background: "var(--teal-800)", overflow: "hidden", padding: h.hideText ? 0 : "64px 32px", aspectRatio: h.hideText ? "1600 / 480" : undefined, maxHeight: h.hideText ? 480 : undefined }}>
              {h.image
                ? <React.Fragment>
                    <img className="krm-page-hero-bg" src={h.image} alt="" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: h.fit === "contain" ? "contain" : "cover", display: "block" }} />
                    <div className="krm-page-hero-tint" style={{ position: "absolute", inset: 0, background: "var(--teal-800)", opacity: (h.imgOverlay != null ? h.imgOverlay : 45) / 100 }} />
                  </React.Fragment>
                : <div style={{ position: "absolute", inset: 0, background: "url('../../assets/krama-pattern.svg')", backgroundSize: 72, opacity: 0.08 }} />}
              {!h.hideText && (
              <div style={{ position: "relative", maxWidth: 1200, margin: "0 auto" }}>
                <div style={{ fontSize: "var(--text-xs)", fontWeight: 800, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--teal-200)" }}>{TR(c.eyebrow)}</div>
                <h1 style={{ color: "#fff", fontSize: "var(--text-4xl)", fontWeight: 800, letterSpacing: "-0.02em", marginTop: 6 }}>{TR(h.heading)}</h1>
                <p style={{ color: "var(--stone-300)", fontSize: "var(--text-lg)", marginTop: 8 }}>{TR(h.sub)}</p>
              </div>
              )}
            </div>
          ); })()
          : (
            <div style={{ position: "relative", background: "var(--teal-800)", overflow: "hidden", padding: "52px 32px" }}>
              <div style={{ position: "absolute", inset: 0, background: "url('../../assets/krama-pattern.svg')", backgroundSize: 72, opacity: 0.08 }} />
              <div style={{ position: "relative", maxWidth: 1200, margin: "0 auto" }}>
                <div style={{ fontSize: "var(--text-xs)", fontWeight: 800, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--teal-200)" }}>{TR(c.eyebrow)}</div>
                <h1 className="krm-info-hero-title" style={{ color: "#fff", fontSize: "var(--text-5xl)", fontWeight: 800, letterSpacing: "-0.02em", marginTop: 8 }}>{TR(c.title)}</h1>
                <p style={{ color: "var(--stone-300)", fontSize: "var(--text-lg)", marginTop: 12, maxWidth: 640 }}>{TR(c.lead)}</p>
              </div>
            </div>
          )}
        <div className="krm-info-body" style={{ maxWidth: 1200, margin: "0 auto", padding: "44px 32px 64px" }}>
          {c.render(onNav)}
        </div>
      </div>
    );
  }

  window.KramaInfoPage = InfoPage;

  // ── Candidate public profile (own profile page, logged in) ─────────────────
  function CandidateProfile({ user, onNav, onUserUpdate }) {
    const api = window.KRAMA_API;
    const [tab, setTab] = React.useState("profile");
    const [name, setName] = React.useState(user ? user.name || "" : "");
    const [email, setEmail] = React.useState(user ? user.email || "" : "");
    const [phone, setPhone] = React.useState(user ? user.phone || "" : "");
    const [bio, setBio] = React.useState(user ? user.bio || "" : "");
    const [preview, setPreview] = React.useState(user ? user.avatar_url || "" : "");
    const [busy, setBusy] = React.useState(false);
    const [uploading, setUploading] = React.useState(false);
    const [msg, setMsg] = React.useState(null); // { ok, text }
    const [curPwd, setCurPwd] = React.useState("");
    const [newPwd, setNewPwd] = React.useState("");
    const [conPwd, setConPwd] = React.useState("");
    const [pwdBusy, setPwdBusy] = React.useState(false);
    const [pwdMsg, setPwdMsg] = React.useState(null);
    const fileRef = React.useRef(null);
    const [resume, setResume] = React.useState(null);

    React.useEffect(() => { if (window.lucide) window.lucide.createIcons(); });

    React.useEffect(() => {
      api.getMyResume && api.getMyResume().then(setResume).catch(() => {});
    }, []);

    function fieldError(err, field) {
      if (!err) return null;
      const errs = err.errors || {};
      return errs[field] ? errs[field][0] : null;
    }

    function save() {
      setBusy(true); setMsg(null);
      const payload = { name: name.trim(), email: email.trim(), phone: phone.trim(), bio: bio.trim() };
      api.updateMe(payload).then(function (u) {
        if (onUserUpdate) onUserUpdate(u);
        setMsg({ ok: true, text: "Profile saved!" });
        setBusy(false);
      }).catch(function (err) {
        setBusy(false);
        if (err && err.errors) {
          const first = Object.values(err.errors)[0];
          setMsg({ ok: false, text: Array.isArray(first) ? first[0] : first });
        } else {
          setMsg({ ok: false, text: (err && err.message) || "Failed to save." });
        }
      });
    }

    function changePwd() {
      if (!curPwd || !newPwd || !conPwd) { setPwdMsg({ ok: false, text: "All fields are required." }); return; }
      if (newPwd !== conPwd) { setPwdMsg({ ok: false, text: "New passwords do not match." }); return; }
      if (newPwd.length < 8) { setPwdMsg({ ok: false, text: "Password must be at least 8 characters." }); return; }
      setPwdBusy(true); setPwdMsg(null);
      fetch((window.KRAMA_API._base || ((/^(localhost|127\.0\.0\.1|::1|192\.168\.|10\.)/.test(window.location.hostname) ? "http://127.0.0.1:8000/api" : (window.location.protocol + "//" + window.location.host + "/api")))) + "/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": "Bearer " + api.getToken() },
        body: JSON.stringify({ current_password: curPwd, password: newPwd, password_confirmation: conPwd }),
      }).then(function (r) { return r.json().then(function (b) { if (!r.ok) throw b; return b; }); }).then(function () {
        setPwdBusy(false); setPwdMsg({ ok: true, text: "Password updated!" });
        setCurPwd(""); setNewPwd(""); setConPwd("");
      }).catch(function (e) {
        setPwdBusy(false);
        if (e && e.errors) {
          const first = Object.values(e.errors)[0];
          setPwdMsg({ ok: false, text: Array.isArray(first) ? first[0] : first });
        } else {
          setPwdMsg({ ok: false, text: (e && e.message) || "Failed to update password." });
        }
      });
    }

    function onFileChange(e) {
      const file = e.target.files && e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = function (ev) { setPreview(ev.target.result); };
      reader.readAsDataURL(file);
      setUploading(true);
      const fd = new FormData();
      fd.append("avatar", file);
      fetch(((/^(localhost|127\.0\.0\.1|::1|192\.168\.|10\.)/.test(window.location.hostname) ? "http://127.0.0.1:8000/api" : (window.location.protocol + "//" + window.location.host + "/api"))) + "/auth/avatar", {
        method: "POST",
        headers: { "Authorization": "Bearer " + api.getToken() },
        body: fd,
      }).then(function (r) { return r.json(); }).then(function (u) {
        setPreview(u.avatar_url || "");
        if (onUserUpdate) onUserUpdate(u);
        setUploading(false); setMsg({ ok: true, text: "Photo updated!" });
      }).catch(function () { setUploading(false); setMsg({ ok: false, text: "Photo upload failed." }); });
    }

    const TABS = [
      { id: "profile", label: "My profile",    icon: "user" },
      { id: "resume",  label: "Resume preview", icon: "file-text" },
      { id: "password",label: "Password",       icon: "lock" },
    ];

    const skills = resume && resume.data && Array.isArray(resume.data.skills) ? resume.data.skills : [];
    const headline = resume && resume.headline ? resume.headline : "";
    const experience = resume && resume.data && Array.isArray(resume.data.experience) ? resume.data.experience : [];

    return (
      <div style={{ background: "var(--surface-page)", minHeight: "80vh" }}>
        {/* Hero banner */}
        <div style={{ position: "relative", background: "var(--teal-800)", overflow: "hidden", padding: "40px 32px 100px" }}>
          <div style={{ position: "absolute", inset: 0, background: "url('../../assets/krama-pattern.svg')", backgroundSize: 72, opacity: 0.08 }} />
        </div>

        {/* Profile card floating over banner */}
        <div style={{ maxWidth: 860, margin: "-70px auto 0", padding: "0 24px 60px", position: "relative" }}>
          <Card padding={0} style={{ overflow: "hidden" }}>
            {/* Card header */}
            <div style={{ padding: "28px 32px 20px", borderBottom: "1px solid var(--border)", display: "flex", gap: 22, alignItems: "flex-end" }}>
              <div style={{ position: "relative", flexShrink: 0 }}>
                <Avatar name={name || "?"} size={84} src={preview || undefined} />
                <button onClick={function () { fileRef.current && fileRef.current.click(); }} disabled={uploading} style={{ position: "absolute", bottom: 2, right: 2, width: 26, height: 26, borderRadius: "50%", background: "var(--brand)", border: "2.5px solid var(--surface-card)", cursor: "pointer", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  {uploading ? <span style={{ fontSize: 9 }}>…</span> : I("camera", 12)}
                </button>
                <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }} onChange={onFileChange} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 800, fontSize: "var(--text-xl)", color: "var(--text-strong)" }}>{name || "—"}</div>
                {headline && <div style={{ fontSize: "var(--text-base)", color: "var(--text-brand)", fontWeight: 600, marginTop: 2 }}>{headline}</div>}
                <div style={{ fontSize: "var(--text-sm)", color: "var(--text-muted)", marginTop: 3 }}>{email}</div>
              </div>
              {onNav && (
                <Button variant="secondary" size="sm" onClick={() => onNav("jobs")} iconLeft={I("search", 14)}>{TR("Browse jobs")}</Button>
              )}
            </div>

            {/* Tabs */}
            <div style={{ display: "flex", gap: 0, borderBottom: "1px solid var(--border)", padding: "0 24px" }}>
              {TABS.map(function (t) {
                const active = tab === t.id;
                return (
                  <button key={t.id} onClick={function () { setTab(t.id); }} style={{ display: "flex", alignItems: "center", gap: 6, padding: "12px 16px", border: "none", background: "transparent", cursor: "pointer", fontFamily: "var(--font-sans)", fontSize: "var(--text-sm)", fontWeight: active ? 700 : 500, color: active ? "var(--text-brand)" : "var(--text-muted)", borderBottom: active ? "2px solid var(--brand)" : "2px solid transparent", marginBottom: -1 }}>
                    {I(t.icon, 14)} {t.label}
                  </button>
                );
              })}
            </div>

            <div style={{ padding: "28px 32px" }}>

              {/* ── Profile edit tab ── */}
              {tab === "profile" && (
                <div style={{ display: "flex", flexDirection: "column", gap: 18, maxWidth: 560 }}>
                  <Input label={TR("Full name")} value={name} onChange={function (e) { setName(e.target.value); }} placeholder={TR("Your full name")} />
                  <Input label={TR("Email")} type="email" value={email} onChange={function (e) { setEmail(e.target.value); }} placeholder="you@example.com" iconLeft={I("mail", 16)} />
                  <Input label={TR("Phone")} value={phone} onChange={function (e) { setPhone(e.target.value); }} iconLeft={I("phone", 16)} />
                  <Textarea label={TR("Bio / About me")} value={bio} onChange={function (e) { setBio(e.target.value); }} rows={4} placeholder={TR("Tell employers a bit about yourself…")} />
                  {msg && (
                    <div style={{ padding: "10px 14px", borderRadius: "var(--radius-md)", background: msg.ok ? "var(--success-subtle, #f0fdf4)" : "var(--danger-subtle, #fff5f5)", color: msg.ok ? "var(--success)" : "var(--danger)", fontSize: "var(--text-sm)", fontWeight: 600 }}>
                      {I(msg.ok ? "check-circle" : "alert-circle", 15)} {msg.text}
                    </div>
                  )}
                  <div>
                    <Button variant="primary" disabled={busy} onClick={save}>{busy ? "Saving…" : "Save profile"}</Button>
                  </div>
                </div>
              )}

              {/* ── Resume preview tab ── */}
              {tab === "resume" && (
                <div>
                  {!resume ? (
                    <div style={{ textAlign: "center", padding: "32px 0", color: "var(--text-muted)" }}>
                      <div>{I("file-text", 36)}</div>
                      <p style={{ marginTop: 12 }}>{TR("No resume yet.")}</p>
                      <Button variant="secondary" style={{ marginTop: 12 }} onClick={() => onNav && onNav("register")}>Go to Candidate Dashboard</Button>
                    </div>
                  ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
                      {headline && (
                        <div>
                          <div style={{ fontWeight: 700, fontSize: "var(--text-sm)", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: ".05em", marginBottom: 6 }}>Headline</div>
                          <div style={{ fontWeight: 700, fontSize: "var(--text-lg)", color: "var(--text-strong)" }}>{headline}</div>
                          {resume.summary && <p style={{ fontSize: "var(--text-base)", color: "var(--text-body)", marginTop: 6, lineHeight: 1.6 }}>{resume.summary}</p>}
                        </div>
                      )}
                      {skills.length > 0 && (
                        <div>
                          <div style={{ fontWeight: 700, fontSize: "var(--text-sm)", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: ".05em", marginBottom: 10 }}>Skills</div>
                          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                            {skills.map(function (s, i) { return <Badge key={i} tone="neutral">{s}</Badge>; })}
                          </div>
                        </div>
                      )}
                      {experience.length > 0 && (
                        <div>
                          <div style={{ fontWeight: 700, fontSize: "var(--text-sm)", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: ".05em", marginBottom: 10 }}>Experience</div>
                          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                            {experience.map(function (ex, i) {
                              return (
                                <div key={i} style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
                                  <div style={{ width: 40, height: 40, borderRadius: "var(--radius-md)", background: "var(--brand-subtle)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--brand)", flexShrink: 0 }}>{I("briefcase", 18)}</div>
                                  <div>
                                    <div style={{ fontWeight: 700, color: "var(--text-strong)" }}>{ex.title || "Position"}</div>
                                    <div style={{ fontSize: "var(--text-sm)", color: "var(--text-muted)" }}>{ex.org}{ex.from ? " · " + ex.from + (ex.to ? " – " + ex.to : " – Present") : ""}</div>
                                    {ex.desc && <p style={{ fontSize: "var(--text-sm)", color: "var(--text-body)", marginTop: 4, lineHeight: 1.5 }}>{ex.desc}</p>}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* ── Password tab ── */}
              {tab === "password" && (
                <div style={{ display: "flex", flexDirection: "column", gap: 16, maxWidth: 460 }}>
                  <p style={{ fontSize: "var(--text-sm)", color: "var(--text-muted)", margin: 0 }}>Choose a strong password of at least 8 characters.</p>
                  <Input label="Current password" type="password" value={curPwd} onChange={function (e) { setCurPwd(e.target.value); }} placeholder="••••••••" />
                  <Input label="New password" type="password" value={newPwd} onChange={function (e) { setNewPwd(e.target.value); }} placeholder="At least 8 characters" />
                  <Input label="Confirm new password" type="password" value={conPwd} onChange={function (e) { setConPwd(e.target.value); }} placeholder="••••••••" />
                  {pwdMsg && (
                    <div style={{ padding: "10px 14px", borderRadius: "var(--radius-md)", background: pwdMsg.ok ? "var(--success-subtle, #f0fdf4)" : "var(--danger-subtle, #fff5f5)", color: pwdMsg.ok ? "var(--success)" : "var(--danger)", fontSize: "var(--text-sm)", fontWeight: 600 }}>
                      {I(pwdMsg.ok ? "check-circle" : "alert-circle", 15)} {pwdMsg.text}
                    </div>
                  )}
                  <div>
                    <Button variant="primary" disabled={pwdBusy} onClick={changePwd}>{pwdBusy ? "Updating…" : "Update password"}</Button>
                  </div>
                </div>
              )}

            </div>
          </Card>
        </div>
      </div>
    );
  }

  window.KramaInfoPage = InfoPage;
  window.KramaCandidateProfile = CandidateProfile;
})();
