// Home screen -- hero search, categories, featured jobs, companies, stats.
(function init() {
  if (!window.KramaDesignSystem_1a6f65) { return setTimeout(init, 40); }
  const { Button, JobCard, CompanyCard, Card, Tag, Avatar } = window.KramaDesignSystem_1a6f65;
  const D = window.KRAMA_DATA;
  const TR = window.KRAMA_T || function (s) { return s; };
  const I = (n, s = 20) => <i data-lucide={n} style={{ width: s, height: s }}></i>;

  const BANNER_THEMES = {
    saffron: { bg: "var(--saffron-500)", fg: "#fff", ctaBg: "#fff", ctaFg: "var(--saffron-700)" },
    teal: { bg: "var(--teal-700)", fg: "#fff", ctaBg: "#fff", ctaFg: "var(--teal-700)" },
    dark: { bg: "var(--stone-900)", fg: "#fff", ctaBg: "var(--saffron-500)", ctaFg: "#fff" },
    blank: { bg: "var(--surface-card)", fg: "var(--text-body)", ctaBg: "var(--brand)", ctaFg: "#fff" },
    transparent: { bg: "transparent", fg: "var(--text-body)", ctaBg: "var(--brand)", ctaFg: "#fff" },
  };
  function resolveBannerTheme(b) {
    if (b.theme === "custom") return { bg: b.customBg || "var(--saffron-500)", fg: b.customFg || "#fff", ctaBg: b.customCtaBg || "#fff", ctaFg: b.customCtaFg || "var(--saffron-700)" };
    return BANNER_THEMES[b.theme] || BANNER_THEMES.saffron;
  }

  const TODAY = new Date().toISOString().slice(0, 10);
  const bannerLive = (b) => b.active && (!b.start || TODAY >= b.start) && (!b.end || TODAY <= b.end);
  const BANNER_IMG = {
    jobfair: "../../assets/banners/banner-jobfair.png",
    ai: "../../assets/banners/banner-ai.png",
    hiring: "../../assets/banners/banner-hiring.png",
  };
  const bannerImg = (id) => { if (!id) return null; if (/^(data:|https?:|\.|\/)/.test(id)) return id; return BANNER_IMG[id] || null; };

  function PromoBannerStack({ onNav }) {
    const all = (D && D.banners) || [];
    const [dismissed, setDismissed] = React.useState({});
    const visible = all.filter((b) => bannerLive(b) && !dismissed[b.id]);
    if (visible.length === 0) return null;
    return (
      <div>
        {visible.map((b) => {
          const t = resolveBannerTheme(b);
          const img = bannerImg(b.image);
          const center = b.align === "center";
          return (
            <div key={b.id} style={{ position: "relative", overflow: "hidden", background: t.bg, color: t.fg, borderBottom: (b.theme === "transparent" || b.theme === "blank") ? "1px solid var(--border)" : "none" }}>
              {img
                ? <React.Fragment>
                    <div style={{ position: "absolute", inset: 0, backgroundImage: "url('" + img + "')", backgroundSize: b.fit === "contain" ? "contain" : "cover", backgroundRepeat: "no-repeat", backgroundPosition: "center" }} />
                    <div style={{ position: "absolute", inset: 0, background: t.bg, opacity: (b.imgOverlay != null ? b.imgOverlay : 20) / 100 }} />
                  </React.Fragment>
                : <div style={{ position: "absolute", inset: 0, background: "url('../../assets/krama-pattern.svg')", backgroundSize: 60, opacity: 0.10 }} />}
              <div style={{ position: "relative", maxWidth: 1200, margin: "0 auto", minHeight: 52, display: "flex", alignItems: "center", gap: 14, padding: "10px 24px" }}>
                {b.hideText
                  ? <div style={{ flex: 1 }} />
                  : <React.Fragment>
                <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 12, minWidth: 0, justifyContent: center ? "center" : "flex-start" }}>
                  <span style={{ display: "inline-flex", flexShrink: 0 }}>{I(b.icon || "megaphone", 18)}</span>
                  <div style={{ fontSize: "var(--text-sm)", fontWeight: 500, lineHeight: 1.3, textAlign: center ? "center" : "left" }}>
                    <strong style={{ fontWeight: 700 }}>{TR(b.title)}</strong>
                    {b.message ? <span style={{ opacity: 0.92 }}> -- {TR(b.message)}</span> : null}
                  </div>
                </div>
                {b.cta ? (
                  <span onClick={() => onNav("jobs")} style={{ flexShrink: 0, background: img ? "#fff" : t.ctaBg, color: img ? "var(--stone-900)" : t.ctaFg, fontSize: "var(--text-sm)", fontWeight: 700, padding: "7px 14px", borderRadius: "var(--radius-pill)", cursor: "pointer", whiteSpace: "nowrap" }}>{TR(b.cta)}</span>
                ) : null}
                    </React.Fragment>}
                <button onClick={() => setDismissed((s) => ({ ...s, [b.id]: true }))} aria-label="Dismiss" style={{ flexShrink: 0, border: "none", background: "transparent", color: t.fg, cursor: "pointer", opacity: 0.6, display: "inline-flex", padding: 4 }}>{I("x", 16)}</button>
              </div>
            </div>
          );
        })}
      </div>
    );
  }


  function Section({ eyebrow, title, action, children }) {
    return (
      <section className="krm-section" style={{ maxWidth: 1200, margin: "0 auto", padding: "56px 32px" }}>
        <div className="krm-section-header" style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 28 }}>
          <div>
            <div className="eyebrow" style={{ marginBottom: 8 }}>{eyebrow}</div>
            <h2 style={{ fontSize: "var(--text-3xl)", fontWeight: 700, color: "var(--text-strong)" }}>{title}</h2>
          </div>
          {action}
        </div>
        {children}
      </section>
    );
  }

  function TopEmployers({ onNav, settings }) {
    const all = (D && D.companies) || [];
    if (settings && settings.topVisible === false) return null;
    const list = settings && settings.topCount ? all.slice(0, settings.topCount) : all;
    if (list.length === 0) return null;
    const loop = list.concat(list); // duplicate for seamless scroll
    const dur = Math.max(18, list.length * 3.5); // seconds
    const Tile = (c, i) => (
      <button key={i} onClick={() => onNav("jobs", { company: c.name })} title={c.name} style={{
        width: 104, height: 76, flexShrink: 0, border: "1px solid var(--border)", borderRadius: "var(--radius-lg)",
        background: "var(--surface-card)", boxShadow: "var(--shadow-xs)", cursor: "pointer",
        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 6,
        transition: "box-shadow var(--dur-base) var(--ease-standard), transform var(--dur-base) var(--ease-standard), border-color var(--dur-base)",
      }}
        onMouseEnter={(e) => { e.currentTarget.style.boxShadow = "var(--shadow-md)"; e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.borderColor = "var(--border-strong)"; }}
        onMouseLeave={(e) => { e.currentTarget.style.boxShadow = "var(--shadow-xs)"; e.currentTarget.style.transform = "none"; e.currentTarget.style.borderColor = "var(--border)"; }}>
        <Avatar src={c.logo} name={c.name} square size={36} />
        <span className="krm-top-name" style={{ fontSize: "var(--text-2xs)", fontWeight: 600, color: "var(--text-muted)", maxWidth: 92, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{c.name}</span>
      </button>
    );
    return (
      <section style={{ background: "var(--surface-card)", borderBottom: "1px solid var(--border)" }}>
        <div className="krm-top-inner" style={{ maxWidth: 1200, margin: "0 auto", padding: "28px 32px" }}>
          <div style={{ textAlign: "center", marginBottom: 18 }}>
            <span className="eyebrow">{TR("Trusted by Cambodia's leading employers")}</span>
            <h2 style={{ fontSize: "var(--text-xl)", fontWeight: 700, color: "var(--text-strong)", marginTop: 4 }}>{TR("Top employers")}</h2>
          </div>
          <div className="krm-marquee" style={{
            position: "relative", overflow: "hidden",
            WebkitMaskImage: "linear-gradient(90deg, transparent, #000 8%, #000 92%, transparent)",
            maskImage: "linear-gradient(90deg, transparent, #000 8%, #000 92%, transparent)",
          }}>
            <div className="krm-marquee-track" style={{ display: "flex", gap: 14, width: "max-content", padding: "4px 0", animation: "krmMarquee " + dur + "s linear infinite" }}>
              {loop.map((c, i) => Tile(c, i))}
            </div>
          </div>
        </div>
        <style>{`
          @keyframes krmMarquee { from { transform: translateX(0); } to { transform: translateX(-50%); } }
          .krm-marquee:hover .krm-marquee-track { animation-play-state: paused; }
          @media (prefers-reduced-motion: reduce) { .krm-marquee-track { animation: none !important; } }
        `}</style>
      </section>
    );
  }

  const HOME_KEY = "krama_home_settings";
  function loadHomeSettings() { try { return JSON.parse(localStorage.getItem(HOME_KEY) || "{}") || {}; } catch (e) { return {}; } }

  const SLIDE_DEFAULTS = [
    { id: "s1", title: "Find work that fits your life", subtitle: "Search thousands of roles across Cambodia -- from banking to engineering -- and apply in two clicks.", badge: "12,480 open jobs from verified employers", theme: "teal", image: "../../assets/banners/bg-heroSlide1.svg", fit: "cover", ctaLabel: "", ctaUrl: "" },
    { id: "s2", title: "Hiring? Reach top talent fast", subtitle: "Post your job and get in front of 40,000+ verified candidates.", badge: "Trusted by 500+ companies", theme: "saffron", image: "../../assets/banners/bg-heroSlide2.svg", fit: "cover", ctaLabel: "Post a job", ctaUrl: "" },
    { id: "s3", title: "Get career-matched roles instantly", subtitle: "Complete your profile and let AI find the right jobs for you.", badge: "Smart job matching", theme: "dark", image: "../../assets/banners/bg-heroSlide3.svg", fit: "cover", ctaLabel: "Build profile", ctaUrl: "" },
  ];
  const SLIDE_THEMES = {
    teal:        { bg: "var(--teal-800)",     fg: "#fff", ctaBg: "var(--saffron-500)", ctaFg: "#fff" },
    saffron:     { bg: "var(--saffron-600)",  fg: "#fff", ctaBg: "#fff",              ctaFg: "var(--saffron-700)" },
    dark:        { bg: "var(--stone-900)",    fg: "#fff", ctaBg: "var(--saffron-500)", ctaFg: "#fff" },
    brand:       { bg: "var(--brand-700)",    fg: "#fff", ctaBg: "#fff",              ctaFg: "var(--brand-700)" },
    blank:       { bg: "var(--surface-card)", fg: "var(--text-strong)", ctaBg: "var(--brand)", ctaFg: "#fff" },
    transparent: { bg: "var(--surface-page)", fg: "var(--text-strong)", ctaBg: "var(--brand)", ctaFg: "#fff" },
  };
  function resolveSlideTheme(slide) {
    if (slide.theme === "custom") return { bg: slide.customBg || "var(--teal-800)", fg: slide.customFg || "#fff", ctaBg: slide.customCtaBg || "var(--saffron-500)", ctaFg: slide.customCtaFg || "#fff" };
    return SLIDE_THEMES[slide.theme] || SLIDE_THEMES.teal;
  }
  const FOOTER_BANNER_DEFAULT = { visible: true, mobileVisible: false, theme: "teal", title: "Hiring? Reach 40,000+ verified candidates.", message: "Post your first job free and reach thousands of candidates.", cta: "Post a job", ctaUrl: "", image: "../../assets/banners/bg-footerBanner.svg", fit: "cover" };
  const FOOTER_BANNER_THEMES = {
    teal:        { bg: "var(--teal-700)",    fg: "#fff", ctaBg: "var(--saffron-500)", ctaFg: "#fff" },
    saffron:     { bg: "var(--saffron-500)", fg: "#fff", ctaBg: "#fff",              ctaFg: "var(--saffron-700)" },
    dark:        { bg: "var(--stone-900)",   fg: "#fff", ctaBg: "var(--saffron-500)", ctaFg: "#fff" },
    blank:       { bg: "var(--surface-card)", fg: "var(--text-body)", ctaBg: "var(--brand)", ctaFg: "#fff" },
    transparent: { bg: "transparent",        fg: "var(--text-body)", ctaBg: "var(--brand)", ctaFg: "#fff" },
  };
  function resolveFooterTheme(b) {
    if (b.theme === "custom") return { bg: b.customBg || "var(--teal-700)", fg: b.customFg || "#fff", ctaBg: b.customCtaBg || "var(--saffron-500)", ctaFg: b.customCtaFg || "#fff" };
    return FOOTER_BANNER_THEMES[b.theme] || FOOTER_BANNER_THEMES.teal;
  }
  function FooterBanner({ onNav }) {
    const hs = loadHomeSettings();
    const b = Object.assign({}, FOOTER_BANNER_DEFAULT, hs.footerBanner || {});
    if (!b.visible) return null;
    const t = resolveFooterTheme(b);
    const handleCta = () => { if (b.ctaUrl) window.open(b.ctaUrl, "_blank"); else if (onNav) onNav("register"); };
    return (
      <section className={"krm-footer-banner" + (b.mobileVisible === true ? " krm-banner-show-mobile" : "")} style={{ position: "relative", background: t.bg, overflow: "hidden", margin: "0 32px 56px", maxWidth: 1136, marginLeft: "auto", marginRight: "auto", borderRadius: "var(--radius-2xl)", padding: b.hideText ? 0 : "48px", minHeight: b.hideText ? 160 : undefined, border: (b.theme === "transparent" || b.theme === "blank") ? "1px solid var(--border)" : "none" }}>
        {b.image
          ? <React.Fragment>
              <div style={{ position: "absolute", inset: 0, backgroundImage: "url('" + b.image + "')", backgroundSize: b.fit === "contain" ? "contain" : "cover", backgroundRepeat: "no-repeat", backgroundPosition: "center" }} />
              <div style={{ position: "absolute", inset: 0, background: t.bg, opacity: (b.imgOverlay != null ? b.imgOverlay : 20) / 100 }} />
            </React.Fragment>
          : <div style={{ position: "absolute", inset: 0, background: "url('../../assets/krama-pattern.svg')", backgroundSize: 64, opacity: 0.08 }} />}
        {!b.hideText && (
        <div className="krm-footer-banner-inner" style={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 32, flexWrap: "wrap" }}>
          <div>
            <h2 style={{ color: t.fg, fontSize: "var(--text-3xl)", fontWeight: 700 }}>{TR(b.title)}</h2>
            {b.message && <p style={{ color: t.fg, opacity: 0.8, fontSize: "var(--text-md)", marginTop: 10 }}>{TR(b.message)}</p>}
          </div>
          {b.cta && <button className="krm-footer-cta-btn" onClick={handleCta} style={{ flexShrink: 0, height: 52, padding: "0 32px", borderRadius: "var(--radius-pill)", border: "none", background: t.ctaBg, color: t.ctaFg, fontFamily: "var(--font-sans)", fontSize: "var(--text-base)", fontWeight: 700, cursor: "pointer", whiteSpace: "nowrap" }}>{TR(b.cta)}</button>}
        </div>
        )}
      </section>
    );
  }

  function loadSlides() {
    try { const s = JSON.parse(localStorage.getItem(HOME_KEY) || "{}"); return (s.heroSlides && s.heroSlides.length) ? s.heroSlides : SLIDE_DEFAULTS; }
    catch (e) { return SLIDE_DEFAULTS; }
  }

  function HeroSlider({ onNav }) {
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
      return () => { mq.removeEventListener ? mq.removeEventListener("change", on) : mq.removeListener(on); };
    }, []);
    const search = () => onNav("jobs", { keyword: kw, location: loc });
    const onKey = (e) => { if (e.key === "Enter") search(); };
    const prev = () => setIdx((i) => (i - 1 + slides.length) % slides.length);
    const next = () => setIdx((i) => (i + 1) % slides.length);

    React.useEffect(() => {
      if (paused || slides.length <= 1) return;
      const t = setInterval(next, 5000);
      return () => clearInterval(t);
    }, [paused, slides.length, idx]);

    React.useEffect(() => { if (window.lucide) window.lucide.createIcons(); });

    const slide = slides[idx] || slides[0];
    const t = resolveSlideTheme(slide);
    const heroImg = slide.image;
    // Image-only ad slide: show the full poster as-is (no crop, no overlaid text/search).
    const imageOnly = !!(slide.imageOnly && heroImg);
    const hasHeroImg = !!slide.image;
    // Mobile + text overlay: show the whole image at its NATURAL height so it fills the width
    // edge-to-edge with no theme-colour space around it; any title/search flow below.
    const mobileStack = isMobile && !imageOnly && hasHeroImg;
    const searchOnMobile = !slide.hideSearch && !slide.searchDesktopOnly;
    const mobileHasContentBelow = !slide.hideTitle || searchOnMobile;

    return (
      <section
        className={"krm-hero" + (imageOnly ? " krm-hero--image-only" : "") + (mobileStack ? " krm-hero--mobile-stack" : "")} style={{ position: "relative", overflow: "hidden", background: t.bg, minHeight: (imageOnly || mobileStack) ? 0 : (isMobile ? 340 : 480), display: "flex", flexDirection: "column", justifyContent: "center", padding: (imageOnly || mobileStack) ? 0 : "56px 32px 72px", transition: "background 0.5s ease" }}
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        {slide.image
          ? <React.Fragment>
              {imageOnly
                ? <img
                    src={heroImg}
                    alt={TR(slide.title) || "Banner"}
                    onClick={() => { if (slide.ctaUrl) window.open(slide.ctaUrl, "_blank"); }}
                    style={{ position: "relative", zIndex: 1, display: "block", width: "100%", height: "auto", cursor: slide.ctaUrl ? "pointer" : "default" }}
                  />
                : <React.Fragment>
                    {/* whole image shown uncropped (contain), centered on the theme-colour background */}
                    <div style={{ position: "absolute", inset: 0, zIndex: 1, backgroundImage: "url('" + heroImg + "')", backgroundSize: slide.fit === "contain" ? "contain" : "cover", backgroundRepeat: "no-repeat", backgroundPosition: "center" }} />
                    <div style={{ position: "absolute", inset: 0, zIndex: 2, background: t.bg, opacity: (slide.imgOverlay != null ? slide.imgOverlay : 20) / 100 }} />
                  </React.Fragment>}
            </React.Fragment>
          : <div style={{ position: "absolute", inset: 0, background: "url('../../assets/krama-pattern.svg')", backgroundSize: 80, opacity: 0.08 }} />}

        <div style={{ position: "relative", zIndex: 3, maxWidth: 1200, margin: "0 auto", textAlign: "center", display: imageOnly ? "none" : undefined }}>
          {!slide.hideTitle && <React.Fragment>
          {slide.badge && (
            <span style={{ display: "inline-block", background: t.fg === "#fff" ? "rgba(255,255,255,0.14)" : "rgba(0,0,0,0.08)", color: t.fg, fontSize: "var(--text-sm)", fontWeight: 600, padding: "6px 14px", borderRadius: "var(--radius-pill)", marginBottom: 22 }}>
              {TR(slide.badge)}
            </span>
          )}
          <h1 style={{ color: t.fg, fontSize: "var(--text-6xl)", fontWeight: 800, letterSpacing: "-0.03em", lineHeight: 1.05 }}>
            {TR(slide.title)}
          </h1>
          {slide.subtitle && (
            <p style={{ color: t.fg, opacity: 0.8, fontSize: "var(--text-lg)", marginTop: 18, maxWidth: 560, marginLeft: "auto", marginRight: "auto" }}>
              {TR(slide.subtitle)}
            </p>
          )}
          {slide.ctaLabel && (
            <div style={{ marginTop: 24 }}>
              <button
                onClick={() => { if (slide.ctaUrl) window.open(slide.ctaUrl, "_blank"); else onNav("jobs"); }}
                style={{ background: t.ctaBg, color: t.ctaFg, border: "none", borderRadius: "var(--radius-lg)", padding: "12px 28px", fontSize: "var(--text-base)", fontWeight: 700, cursor: "pointer", fontFamily: "var(--font-sans)" }}
              >{TR(slide.ctaLabel)}</button>
            </div>
          )}
          </React.Fragment>}
          {!slide.hideSearch && !(isMobile && slide.searchDesktopOnly) && <React.Fragment>
          <div className="krm-search-bar" style={{ display: "flex", gap: 8, background: "#fff", padding: 8, borderRadius: "var(--radius-lg)", boxShadow: "var(--shadow-lg)", marginTop: 32, maxWidth: 920, marginLeft: "auto", marginRight: "auto" }}>
            <div className="krm-search-input" style={{ flex: 1, display: "flex", alignItems: "center", gap: 8, padding: "0 12px" }}>
              <span style={{ color: "var(--text-faint)" }}>{I("search", 18)}</span>
              <input value={kw} onChange={(e) => setKw(e.target.value)} onKeyDown={onKey} placeholder={TR("Job title or keyword")} style={{ flex: 1, border: "none", outline: "none", fontFamily: "var(--font-sans)", fontSize: "var(--text-base)", color: "var(--text-strong)" }} />
            </div>
            <div className="krm-search-divider" style={{ width: 1, background: "var(--border)" }} />
            <div className="krm-search-input" style={{ flex: 1, display: "flex", alignItems: "center", gap: 8, padding: "0 12px" }}>
              <span style={{ color: "var(--text-faint)" }}>{I("map-pin", 18)}</span>
              <input value={loc} onChange={(e) => setLoc(e.target.value)} onKeyDown={onKey} placeholder={TR("City or province")} style={{ flex: 1, border: "none", outline: "none", fontFamily: "var(--font-sans)", fontSize: "var(--text-base)", color: "var(--text-strong)" }} />
            </div>
            <Button className="krm-search-btn" variant="primary" size="lg" onClick={search}>{TR("Search")}</Button>
          </div>
          <div style={{ display: "flex", gap: 8, justifyContent: "center", marginTop: 20, flexWrap: "wrap" }}>
            <span style={{ color: t.fg, opacity: 0.7, fontSize: "var(--text-sm)", marginRight: 4 }}>{TR("Popular:")}</span>
            {["Accountant", "Engineer", "Sales", "Designer"].map((tag) => (
              <span key={tag} onClick={() => onNav("jobs", { keyword: tag })} style={{ color: t.fg, fontSize: "var(--text-sm)", fontWeight: 500, padding: "4px 12px", border: "1px solid " + (t.fg === "#fff" ? "rgba(255,255,255,0.25)" : "rgba(0,0,0,0.15)"), borderRadius: "var(--radius-pill)", cursor: "pointer" }}>{tag}</span>
            ))}
          </div>
          </React.Fragment>}
        </div>

        {slides.length > 1 && (
          <React.Fragment>
            <button onClick={prev} style={{ position: "absolute", left: 20, top: "50%", transform: "translateY(-50%)", width: 40, height: 40, borderRadius: "50%", background: "rgba(255,255,255,0.18)", border: "1px solid rgba(255,255,255,0.25)", color: "#fff", cursor: "pointer", display: "inline-flex", alignItems: "center", justifyContent: "center" }}>{I("chevron-left", 20)}</button>
            <button onClick={next} style={{ position: "absolute", right: 20, top: "50%", transform: "translateY(-50%)", width: 40, height: 40, borderRadius: "50%", background: "rgba(255,255,255,0.18)", border: "1px solid rgba(255,255,255,0.25)", color: "#fff", cursor: "pointer", display: "inline-flex", alignItems: "center", justifyContent: "center" }}>{I("chevron-right", 20)}</button>
            <div style={{ position: "absolute", bottom: 18, left: "50%", transform: "translateX(-50%)", display: "flex", gap: 8 }}>
              {slides.map((_, i) => (
                <button key={i} onClick={() => setIdx(i)} style={{ width: i === idx ? 28 : 8, height: 8, borderRadius: "var(--radius-pill)", background: i === idx ? "#fff" : "rgba(255,255,255,0.4)", border: "none", cursor: "pointer", transition: "all 0.3s ease", padding: 0 }} />
              ))}
            </div>
          </React.Fragment>
        )}
      </section>
    );
  }

  function Home({ onNav, onOpenJob, saved, toggleSave }) {
    const [hs, setHs] = React.useState(loadHomeSettings);
    React.useEffect(function() {
      var apiBase = (/^(localhost|127\.0\.0\.1|::1|192\.168\.|10\.)/.test(window.location.hostname) ? 'http://127.0.0.1:8000/api' : (window.location.protocol + '//' + window.location.host + '/api'));
      fetch(apiBase + '/settings/home_content', { cache: 'no-cache' })
        .then(function(r) { return r.ok ? r.json() : null; })
        .then(function(d) {
          if (d && d.data) {
            try {
              var parsed = JSON.parse(d.data);
              try { localStorage.setItem(HOME_KEY, JSON.stringify(parsed)); } catch (e) {}
              setHs(parsed);
            } catch (e) {}
          }
        })
        .catch(function() {});
    }, []);
    const [fjPage, setFjPage] = React.useState(0);
    const [fcPage, setFcPage] = React.useState(0);
    const [fjView, setFjView] = React.useState("grid"); // mobile: "list" (1 col) | "grid" (2 col)
    const showFeaturedJobs = hs.featuredJobsVisible !== false;
    const FJ_PER_PAGE = hs.featuredJobsCount || 8;
    const FC_PER_PAGE = 8;
    // featured-first ordering across all jobs, then paginate
    const fjAll = (D && D.jobs) ? D.jobs.filter((j) => j.featured).concat(D.jobs.filter((j) => !j.featured)) : [];
    const fjPages = Math.max(1, Math.ceil(fjAll.length / FJ_PER_PAGE));
    const fjPageSafe = Math.min(fjPage, fjPages - 1);
    const fjSlice = fjAll.slice(fjPageSafe * FJ_PER_PAGE, fjPageSafe * FJ_PER_PAGE + FJ_PER_PAGE);
    // map home category labels to Find-jobs filter values
    const CAT_FILTER = { "Information Technology": "IT", "Human Resources": "HR" };
    const toFilter = (name) => CAT_FILTER[name] || name;
    // respect admin's category visibility selection (null = show all)
    const allCats = (D && D.categories) || [];
    const visibleCats = hs.visibleCategories && hs.visibleCategories.length
      ? allCats.filter(function(c) { return hs.visibleCategories.includes(c.slug); })
      : allCats;
    // featured companies: admin selection (fallback to all), respect visibility
    const allCompanies = (D && D.companies) || [];
    const featuredNames = hs.featured && hs.featured.length ? hs.featured : null;
    const featuredList = featuredNames ? allCompanies.filter((c) => featuredNames.includes(c.name)) : allCompanies;
    const showFeatured = hs.featuredVisible !== false;
    const fcPages = Math.max(1, Math.ceil(featuredList.length / FC_PER_PAGE));
    const fcPageSafe = Math.min(fcPage, fcPages - 1);
    const fcSlice = featuredList.slice(fcPageSafe * FC_PER_PAGE, fcPageSafe * FC_PER_PAGE + FC_PER_PAGE);
    return (
      <div>
        <PromoBannerStack onNav={onNav} />
        <HeroSlider onNav={onNav} />
        <TopEmployers onNav={onNav} settings={hs} />

        <Section eyebrow={TR("Browse by field")} title={TR("Explore job categories")}>
          <div className="krm-cat-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16 }}>
            {visibleCats.map((c) => (
              <Card key={c.name} interactive onClick={() => onNav("jobs", { category: toFilter(c.name) })} padding={18}>
                <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                  <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 46, height: 46, borderRadius: "var(--radius-md)", background: "var(--brand-subtle)", color: "var(--brand)" }}>{I(c.icon, 22)}</span>
                  <div>
                    <div style={{ fontWeight: 700, color: "var(--text-strong)", fontSize: "var(--text-md)" }}>{c.name}</div>
                    <div style={{ fontSize: "var(--text-sm)", color: "var(--text-muted)", marginTop: 2 }}>{c.count.toLocaleString()} jobs</div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </Section>

        {showFeaturedJobs && <div style={{ background: "var(--surface-card)", borderTop: "1px solid var(--border)", borderBottom: "1px solid var(--border)" }}>
          <Section eyebrow={TR("Hand-picked")} title={TR("Featured jobs")}
            action={<Button variant="ghost" onClick={() => onNav("jobs")} iconRight={I("arrow-right", 16)}>{TR("View all jobs")}</Button>}>
            {/* View toggle — mobile only */}
            <div className="krm-view-toggle" style={{ display: "none", alignItems: "center", justifyContent: "flex-end", gap: 6, marginBottom: 12 }}>
              {[["list", "list"], ["grid", "layout-grid"]].map(([v, icon]) => (
                <button key={v} onClick={() => setFjView(v)} aria-label={v === "list" ? TR("List view") : TR("Grid view")} style={{
                  display: "inline-flex", alignItems: "center", justifyContent: "center", width: 38, height: 38, borderRadius: "var(--radius-md)", cursor: "pointer",
                  border: "1px solid " + (fjView === v ? "var(--brand)" : "var(--border-strong)"),
                  background: fjView === v ? "var(--brand)" : "var(--surface-card)",
                  color: fjView === v ? "var(--on-brand)" : "var(--text-body)",
                }}>{I(icon, 18)}</button>
              ))}
            </div>
            <div className={"krm-job-grid" + (fjView === "grid" ? " krm-job-grid--2col" : "")} style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              {fjSlice.map((j) => (
                <JobCard key={j.id} {...j} saved={saved.includes(j.id)} onSave={() => toggleSave(j.id)} onClick={() => onOpenJob(j)} />
              ))}
            </div>
            {fjPages > 1 ? (
              <div className="krm-pagination" style={{ display: "flex", alignItems: "center", justifyContent: "center", flexWrap: "wrap", gap: 8, marginTop: 28 }}>
                <button onClick={() => setFjPage(Math.max(0, fjPageSafe - 1))} disabled={fjPageSafe === 0} aria-label="Previous" style={{
                  display: "inline-flex", alignItems: "center", justifyContent: "center", width: 40, height: 40, borderRadius: "var(--radius-md)",
                  border: "1px solid var(--border-strong)", background: "var(--surface-card)", cursor: fjPageSafe === 0 ? "not-allowed" : "pointer",
                  color: fjPageSafe === 0 ? "var(--text-faint)" : "var(--text-body)",
                }}>{I("chevron-left", 18)}</button>
                {Array.from({ length: fjPages }).map((_, i) => (
                  <button key={i} onClick={() => setFjPage(i)} style={{
                    minWidth: 40, height: 40, padding: "0 12px", borderRadius: "var(--radius-md)", cursor: "pointer",
                    border: "1px solid " + (i === fjPageSafe ? "var(--brand)" : "var(--border-strong)"),
                    background: i === fjPageSafe ? "var(--brand)" : "var(--surface-card)",
                    color: i === fjPageSafe ? "var(--on-brand)" : "var(--text-body)",
                    fontFamily: "var(--font-sans)", fontSize: "var(--text-sm)", fontWeight: 700,
                  }}>{i + 1}</button>
                ))}
                <button onClick={() => setFjPage(Math.min(fjPages - 1, fjPageSafe + 1))} disabled={fjPageSafe === fjPages - 1} aria-label="Next" style={{
                  display: "inline-flex", alignItems: "center", justifyContent: "center", width: 40, height: 40, borderRadius: "var(--radius-md)",
                  border: "1px solid var(--border-strong)", background: "var(--surface-card)", cursor: fjPageSafe === fjPages - 1 ? "not-allowed" : "pointer",
                  color: fjPageSafe === fjPages - 1 ? "var(--text-faint)" : "var(--text-body)",
                }}>{I("chevron-right", 18)}</button>
              </div>
            ) : null}
          </Section>
        </div>}

        {showFeatured ? (
        <Section eyebrow={TR("Trusted by")} title={TR("Featured companies")}
          action={<Button variant="ghost" onClick={() => onNav("companies")} iconRight={I("arrow-right", 16)}>{TR("All companies")}</Button>}>
          <div className="krm-company-grid" style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16 }}>
            {fcSlice.map((c) => <CompanyCard key={c.name} {...c} onClick={() => onNav("company", { companyId: c.id })} />)}
          </div>
          {fcPages > 1 ? (
            <div className="krm-pagination" style={{ display: "flex", alignItems: "center", justifyContent: "center", flexWrap: "wrap", gap: 8, marginTop: 28 }}>
              <button onClick={() => setFcPage(Math.max(0, fcPageSafe - 1))} disabled={fcPageSafe === 0} aria-label="Previous" style={{
                display: "inline-flex", alignItems: "center", justifyContent: "center", width: 40, height: 40, borderRadius: "var(--radius-md)",
                border: "1px solid var(--border-strong)", background: "var(--surface-card)", cursor: fcPageSafe === 0 ? "not-allowed" : "pointer",
                color: fcPageSafe === 0 ? "var(--text-faint)" : "var(--text-body)",
              }}>{I("chevron-left", 18)}</button>
              {Array.from({ length: fcPages }).map((_, i) => (
                <button key={i} onClick={() => setFcPage(i)} style={{
                  minWidth: 40, height: 40, padding: "0 12px", borderRadius: "var(--radius-md)", cursor: "pointer",
                  border: "1px solid " + (i === fcPageSafe ? "var(--brand)" : "var(--border-strong)"),
                  background: i === fcPageSafe ? "var(--brand)" : "var(--surface-card)",
                  color: i === fcPageSafe ? "var(--on-brand)" : "var(--text-body)",
                  fontFamily: "var(--font-sans)", fontSize: "var(--text-sm)", fontWeight: 700,
                }}>{i + 1}</button>
              ))}
              <button onClick={() => setFcPage(Math.min(fcPages - 1, fcPageSafe + 1))} disabled={fcPageSafe === fcPages - 1} aria-label="Next" style={{
                display: "inline-flex", alignItems: "center", justifyContent: "center", width: 40, height: 40, borderRadius: "var(--radius-md)",
                border: "1px solid var(--border-strong)", background: "var(--surface-card)", cursor: fcPageSafe === fcPages - 1 ? "not-allowed" : "pointer",
                color: fcPageSafe === fcPages - 1 ? "var(--text-faint)" : "var(--text-body)",
              }}>{I("chevron-right", 18)}</button>
            </div>
          ) : null}
        </Section>
        ) : null}

        <FooterBanner onNav={onNav} />
      </div>
    );
  }

  window.KramaHome = Home;
})();
