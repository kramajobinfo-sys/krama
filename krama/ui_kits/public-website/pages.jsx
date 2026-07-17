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
    return (
      <div style={{ position: "relative", overflow: "hidden", background: t.bg, color: t.fg, borderBottom: (b.theme === "transparent" || b.theme === "blank") ? "1px solid var(--border)" : "none" }}>
        {hasImg
          ? <React.Fragment>
              <div style={{ position: "absolute", inset: 0, backgroundImage: "url('" + b.image + "')", backgroundSize: b.fit === "contain" ? "contain" : "cover", backgroundRepeat: "no-repeat", backgroundPosition: "center" }} />
              <div style={{ position: "absolute", inset: 0, background: t.bg, opacity: (b.imgOverlay != null ? b.imgOverlay : 20) / 100 }} />
            </React.Fragment>
          : <div style={{ position: "absolute", inset: 0, background: "url('../../assets/krama-pattern.svg')", backgroundSize: 60, opacity: 0.10 }} />}
        <div style={{ position: "relative", maxWidth: 1200, margin: "0 auto", display: "flex", alignItems: "center", gap: 14, padding: "10px 32px" }}>
          {b.icon && <span style={{ display: "inline-flex", flexShrink: 0 }}>{I(b.icon, 18)}</span>}
          <div style={{ flex: 1, fontSize: "var(--text-sm)", fontWeight: 500 }}>
            <strong style={{ fontWeight: 700 }}>{TR(b.title)}</strong>{b.message ? " -- " + TR(b.message) : ""}
          </div>
          {b.cta && <span onClick={() => { if (b.ctaUrl) window.open(b.ctaUrl, b.ctaUrl.startsWith("http") ? "_blank" : "_self"); else onNav && onNav("register"); }} style={{ flexShrink: 0, background: t.pill, color: t.pillFg, fontSize: "var(--text-sm)", fontWeight: 700, padding: "7px 16px", borderRadius: "var(--radius-pill)", cursor: "pointer", whiteSpace: "nowrap" }}>{TR(b.cta)}</span>}
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
    React.useEffect(() => {
      let alive = true;
      window.KRAMA_API.fetchPlans()
        .then((data) => { if (alive) setPlans(Array.isArray(data) ? data : []); })
        .catch(() => { if (alive) setPlans([]); });
      return () => { alive = false; };
    }, []);

    const isTrial = (p) => Number(p.price) === 0 && Number(p.trial_days) > 0;
    const isFree = (p) => Number(p.price) === 0 && !isTrial(p);
    const isCustom = (p) => /enterprise/i.test(p.name || "");
    const planFeatures = (p) => Array.isArray(p.features_json) ? p.features_json : [];

    if (plans === null) {
      return <div style={{ textAlign: "center", padding: "60px 0", color: "var(--text-muted)" }}>Loading plans…</div>;
    }
    if (plans.length === 0) {
      return (
        <div style={{ textAlign: "center", padding: "60px 0", color: "var(--text-muted)" }}>
          <p style={{ fontSize: "var(--text-base)" }}>{TR("Pricing is being updated right now.")}</p>
          <Button variant="secondary" style={{ marginTop: 12 }} onClick={() => onNav && onNav("contact")}>{TR("Contact us")}</Button>
        </div>
      );
    }

    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
        <div className="krm-info-grid" style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16, alignItems: "start" }}>
          {plans.map((p) => {
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
              <Card key={p.id} featured={popular} padding={22} style={{
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
                    if (custom) { window.location.href = "mailto:sales@krama.com?subject=" + encodeURIComponent("Enterprise plan inquiry"); return; }
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
        <div style={{ marginBottom: 56 }}>
          <div style={{ textAlign: "center", marginBottom: 32 }}>
            <h2 style={{ fontSize: "var(--text-3xl)", fontWeight: 800, color: "var(--text-strong)", letterSpacing: "-0.02em" }}>{TR("How it works")}</h2>
            <p style={{ fontSize: "var(--text-lg)", color: "var(--text-muted)", marginTop: 8, maxWidth: 560, margin: "8px auto 0" }}>{TR("From posting to offer in three steps.")}</p>
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
        <div style={{ marginBottom: 64 }}>
          <div style={{ textAlign: "center", marginBottom: 32 }}>
            <h2 style={{ fontSize: "var(--text-3xl)", fontWeight: 800, color: "var(--text-strong)", letterSpacing: "-0.02em" }}>{TR("Everything you need to hire well")}</h2>
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
        <div style={{ background: "var(--surface-sunken)", borderRadius: "var(--radius-xl)", padding: "36px 40px", marginBottom: 64 }}>
          <div className="krm-info-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 24, textAlign: "center" }}>
            {[["486", "Verified companies"], ["40k+", "Active candidates"], ["12,480", "Live jobs posted"]].map(function(stat) {
              return (
                <div key={stat[1]}>
                  <div style={{ fontFamily: "var(--font-display)", fontSize: "var(--text-5xl)", fontWeight: 800, color: "var(--brand)", lineHeight: 1 }}>{stat[0]}</div>
                  <div style={{ fontSize: "var(--text-base)", color: "var(--text-muted)", marginTop: 6 }}>{TR(stat[1])}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Pricing */}
        <div style={{ marginBottom: 64 }}>
          <div style={{ textAlign: "center", marginBottom: 32 }}>
            <h2 style={{ fontSize: "var(--text-3xl)", fontWeight: 800, color: "var(--text-strong)", letterSpacing: "-0.02em" }}>{TR("Plans that grow with your team")}</h2>
            <p style={{ fontSize: "var(--text-lg)", color: "var(--text-muted)", marginTop: 8 }}>{TR("Start free, upgrade when you need more reach.")}</p>
          </div>
          <PricingSection onNav={onNav} />
        </div>

        {/* CTA strip */}
        <div style={{ background: "var(--teal-800)", borderRadius: "var(--radius-xl)", padding: "44px 40px", textAlign: "center", position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", inset: 0, background: "url('../../assets/krama-pattern.svg')", backgroundSize: 64, opacity: 0.08 }} />
          <div style={{ position: "relative" }}>
            <h2 style={{ fontSize: "var(--text-3xl)", fontWeight: 800, color: "#fff", marginBottom: 12, letterSpacing: "-0.02em" }}>{TR("Ready to find your next hire?")}</h2>
            <p style={{ color: "rgba(255,255,255,0.8)", fontSize: "var(--text-lg)", marginBottom: 28 }}>{TR("Create a free account and post your first job today.")}</p>
            <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
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
      eyebrow: "For employers",
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
      render: () => (
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <p style={{ fontSize: "var(--text-lg)", color: "var(--text-body)", lineHeight: 1.65 }}>
            {TR("We started Krama with one belief: finding work -- and hiring -- should be hopeful and human. Every company on Krama is verified, every job is reviewed before it goes live, and every candidate is treated as more than a CV.")}
          </p>
          <div className="krm-info-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16 }}>
            {[["12,480", "Open jobs"], ["486", "Verified companies"], ["40k+", "Candidates"]].map(([n, l]) => (
              <Card key={l} padding={24}>
                <div style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "var(--text-4xl)", color: "var(--brand)" }}>{n}</div>
                <div style={{ fontSize: "var(--text-base)", color: "var(--text-muted)", marginTop: 4 }}>{TR(l)}</div>
              </Card>
            ))}
          </div>
          <p style={{ fontSize: "var(--text-base)", color: "var(--text-body)", lineHeight: 1.65 }}>
            {TR("We're a Cambodia-first team building for the whole region -- with Khmer and English as first-class peers, and payment options that work locally, from KHQR to ABA and Wing.")}
          </p>
        </div>
      ),
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
            {[["map-pin", "Office", "#148, Preah Sihanouk Blvd, Phnom Penh"], ["mail", "Email", "hello@krama.com"], ["phone", "Phone", "+855 23 900 100"], ["clock", "Hours", "Mon-Fri · 8:00-17:30"]].map(([ic, k, v]) => (
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
      lead: "The rules for using Krama. Last updated 18 June 2026.",
      render: () => prose([
        ["1. Acceptance", "By creating an account or using Krama, you agree to these terms. If you don't agree, please don't use the service."],
        ["2. Accounts", "You're responsible for your account and for keeping your password secure. Employers must provide accurate company information for verification."],
        ["3. Job postings", "All jobs are reviewed before publishing. We may reject or remove postings that are misleading, discriminatory, or violate local law."],
        ["4. Candidate conduct", "Apply honestly. Misrepresenting your experience or identity may result in account suspension."],
        ["5. Payments", "Paid plans renew on their billing date until cancelled. Fees are non-refundable except where required by law."],
        ["6. Liability", "Krama is a marketplace; we don't guarantee employment or hiring outcomes and aren't party to any employment contract."],
      ]),
    },
    privacy: {
      eyebrow: "Legal", title: "Privacy Policy",
      lead: "How we handle your data. Last updated 18 June 2026.",
      render: () => prose([
        ["1. What we collect", "Account details, résumé content you provide, and usage data needed to run the service."],
        ["2. How we use it", "To match you with jobs or candidates, process applications, and improve recommendations. We don't sell your personal data."],
        ["3. Sharing", "When you apply, your résumé is shared with that employer. Verified employers can search résumés only if you opt in."],
        ["4. Security", "Data is encrypted in transit and at rest. Access is role-based and audit-logged."],
        ["5. Your rights", "You can view, export, or delete your data at any time from your profile, or by contacting us."],
        ["6. Contact", "Questions about privacy? Email privacy@krama.com."],
      ]),
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

  function InfoPage({ slug, onNav }) {
    const c = CONTENT[slug] || CONTENT.about;
    useHomeContent();
    React.useEffect(() => { if (window.lucide) window.lucide.createIcons(); }, [slug]);
    return (
      <div style={{ background: "var(--surface-page)", minHeight: "70vh" }}>
        {slug === "employers" && <AnnouncementBar b={loadBanner("employersTopBanner", EMPLOYERS_TOP_DEFAULT)} onNav={onNav} />}
        {/* page hero — For Employers uses the standard page-hero (matches Find Jobs / Companies / Job Detail); other info pages keep the larger hero */}
        {slug === "employers"
          ? (() => { const h = loadBanner("employersHero", { heading: c.title, sub: c.lead, image: "../../assets/banners/bg-employersHero.svg", fit: "cover", imgOverlay: 45 }); return (
            <div className="krm-page-hero" style={{ position: "relative", background: "var(--teal-800)", overflow: "hidden", padding: "44px 32px" }}>
              {h.image
                ? <React.Fragment>
                    <div style={{ position: "absolute", inset: 0, backgroundImage: "url('" + h.image + "')", backgroundSize: h.fit === "contain" ? "contain" : "cover", backgroundRepeat: "no-repeat", backgroundPosition: "center" }} />
                    <div style={{ position: "absolute", inset: 0, background: "var(--teal-800)", opacity: (h.imgOverlay != null ? h.imgOverlay : 45) / 100 }} />
                  </React.Fragment>
                : <div style={{ position: "absolute", inset: 0, background: "url('../../assets/krama-pattern.svg')", backgroundSize: 72, opacity: 0.08 }} />}
              <div style={{ position: "relative", maxWidth: 1200, margin: "0 auto" }}>
                <div style={{ fontSize: "var(--text-xs)", fontWeight: 800, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--teal-200)" }}>{TR(c.eyebrow)}</div>
                <h1 style={{ color: "#fff", fontSize: "var(--text-4xl)", fontWeight: 800, letterSpacing: "-0.02em", marginTop: 6 }}>{TR(h.heading)}</h1>
                <p style={{ color: "var(--stone-300)", fontSize: "var(--text-lg)", marginTop: 8 }}>{TR(h.sub)}</p>
              </div>
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
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "44px 32px 64px" }}>
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
