// Krama public website -- shared chrome (header + footer). Assigns to window.
(function init() {
  if (!window.KramaDesignSystem_1a6f65) { return setTimeout(init, 40); }
  const { Button, Badge } = window.KramaDesignSystem_1a6f65;

  function UserMenu({ user, onLogout, onNav }) {
    const [open, setOpen] = React.useState(false);
    const initials = user.name ? user.name.split(" ").map(w => w[0]).join("").slice(0,2).toUpperCase() : "?";
    const roleSlug = user.role && user.role.slug;

    const isAdmin = roleSlug === "admin" || roleSlug === "super_admin";

    const goToDashboard = () => {
      setOpen(false);
      const token = localStorage.getItem("krama_access_token");
      if (roleSlug === "employer") {
        if (token) localStorage.setItem("krama_employer_token", token);
        window.location.href = "/krama/krama/ui_kits/employer-dashboard/index.html";
      } else if (isAdmin) {
        if (token) localStorage.setItem("krama_admin_token", token);
        window.location.href = "/krama/krama/ui_kits/admin-dashboard/index.html";
      } else {
        window.location.href = "/krama/krama/ui_kits/candidate-dashboard/index.html";
      }
    };

    const dashboardLabel = roleSlug === "employer" ? "Employer Dashboard"
      : isAdmin ? "Admin Dashboard"
      : "Candidate Dashboard";

    const goToProfile = () => { setOpen(false); onNav("candidateProfile"); };

    const menuItems = [
      [dashboardLabel, goToDashboard],
      ...(!isAdmin ? [["My profile", goToProfile]] : []),
    ];

    return (
      <div style={{ position: "relative" }}>
        <button onClick={() => setOpen(o => !o)} style={{
          display: "flex", alignItems: "center", gap: 8, border: 0,
          borderRadius: "var(--radius-full)", padding: "4px 12px 4px 4px",
          background: "var(--surface-card)", cursor: "pointer", fontFamily: "var(--font-sans)",
        }}>
          <span style={{
            width: 30, height: 30, borderRadius: "50%", background: "var(--brand)",
            color: "#fff", display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 12, fontWeight: 700, flexShrink: 0, overflow: "hidden",
          }}>
            {user.avatar_url
              ? <img src={user.avatar_url} alt={initials} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
              : initials}
          </span>
          <span style={{ fontWeight: 600, fontSize: "var(--text-sm)", color: "var(--text-strong)", maxWidth: 120, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{user.name}</span>
        </button>
        {open && (
          <div onClick={() => setOpen(false)} style={{
            position: "fixed", inset: 0, zIndex: 99,
          }}>
            <div onClick={e => e.stopPropagation()} style={{
              position: "absolute", top: 40, right: 0, minWidth: 200,
              background: "var(--surface-card)", border: "1px solid var(--border)",
              borderRadius: "var(--radius-md)", boxShadow: "var(--shadow-lg)", zIndex: 100,
              padding: "6px 0", overflow: "hidden",
            }}>
              <div style={{ padding: "10px 14px 8px", borderBottom: "1px solid var(--border)" }}>
                <div style={{ fontWeight: 700, fontSize: "var(--text-sm)", color: "var(--text-strong)" }}>{user.name}</div>
                <div style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>{user.email}</div>
                {roleSlug && <div style={{ marginTop: 4, fontSize: "var(--text-xs)", color: "var(--text-brand)", fontWeight: 600, textTransform: "capitalize" }}>{roleSlug}</div>}
              </div>
              {menuItems.map(([label, action]) => (
                <button key={label} onClick={action} style={{
                  display: "block", width: "100%", textAlign: "left", border: "none",
                  background: "transparent", padding: "9px 14px", cursor: "pointer",
                  fontFamily: "var(--font-sans)", fontSize: "var(--text-sm)", color: "var(--text-body)",
                }}>{label}</button>
              ))}
              <div style={{ borderTop: "1px solid var(--border)", marginTop: 4 }}>
                <button onClick={() => { setOpen(false); onLogout(); }} style={{
                  display: "block", width: "100%", textAlign: "left", border: "none",
                  background: "transparent", padding: "9px 14px", cursor: "pointer",
                  fontFamily: "var(--font-sans)", fontSize: "var(--text-sm)", color: "var(--danger)",
                }}>Sign out</button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  function Header({ page, onNav, user, onLogout, lang, onToggleLang }) {
    const [menuOpen, setMenuOpen] = React.useState(false);
    const t = window.KRAMA_T || function (s) { return s; };
    const LangToggle = () => (
      <button onClick={onToggleLang} title="Language / ភាសា" style={{ display: "inline-flex", alignItems: "center", gap: 2, border: "1px solid var(--border)", borderRadius: "var(--radius-pill)", background: "transparent", cursor: "pointer", padding: 3, flexShrink: 0 }}>
        <span style={{ padding: "2px 8px", borderRadius: "var(--radius-pill)", fontSize: "var(--text-xs)", fontWeight: 700, background: lang !== "km" ? "var(--brand)" : "transparent", color: lang !== "km" ? "#fff" : "var(--text-muted)" }}>EN</span>
        <span style={{ padding: "2px 8px", borderRadius: "var(--radius-pill)", fontSize: "var(--text-xs)", fontWeight: 700, background: lang === "km" ? "var(--brand)" : "transparent", color: lang === "km" ? "#fff" : "var(--text-muted)", fontFamily: "var(--font-khmer, var(--font-sans))" }}>ខ្មែរ</span>
      </button>
    );
    const links = [
      { id: "home", label: "Home" },
      { id: "jobs", label: "Find jobs" },
      { id: "companies", label: "Companies" },
      { id: "employers", label: "For Employers" },
    ];
    // Mobile bottom nav (app-style tab bar). Home removed (logo links home);
    // "Job Search" is a raised action button in the centre.
    const bottomTabs = [
      { id: "home", icon: "home", label: "Home" },
      { id: "companies", icon: "building-2", label: "Companies" },
      { id: "jobs", icon: "search", label: "Job Search", center: true },
      { id: "employers", icon: "users", label: "Employers" },
    ];
    const navTo = (id) => { setMenuOpen(false); onNav(id); };

    return (
      <React.Fragment>
        <header className="krm-header" style={{
          position: "sticky", top: 0, zIndex: 50, height: 64,
          background: "rgba(255,255,255,0.92)", backdropFilter: "blur(8px)",
          borderBottom: "1px solid var(--border)",
          display: "flex", alignItems: "center", padding: "0 32px", gap: 32,
        }}>
          {/* Logo */}
          <div style={{ display: "flex", alignItems: "center", gap: 9, cursor: "pointer", flexShrink: 0 }} onClick={() => navTo("home")}>
            <img src={window.getKramaLogo("../../assets/krama-mark.svg")} height="36" alt="KRAMA" />
            <span style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "var(--text-lg)", letterSpacing: ".08em", color: "var(--text-strong)" }}>{window.KRAMA_BRAND_NAME || "KRAMA"}</span>
          </div>

          {/* Desktop nav */}
          <nav className="krm-header-nav" style={{ display: "flex", gap: 6 }}>
            {links.map((l) => (
              <button key={l.id} onClick={() => navTo(l.id)} style={{
                border: "none", background: "transparent", cursor: "pointer",
                fontFamily: "var(--font-sans)", fontSize: "var(--text-base)",
                fontWeight: page === l.id ? 700 : 500,
                color: page === l.id ? "var(--text-brand)" : "var(--text-body)",
                padding: "8px 12px", borderRadius: "var(--radius-sm)",
              }}>{t(l.label)}</button>
            ))}
          </nav>

          {/* Desktop right actions */}
          <div className="krm-header-right" style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 12, flexShrink: 0 }}>
            <LangToggle />
            {user
              ? <UserMenu user={user} onLogout={onLogout} onNav={onNav} />
              : <button onClick={() => navTo("login")} style={{ border: "none", background: "transparent", cursor: "pointer", fontFamily: "var(--font-sans)", fontWeight: 600, color: "var(--text-body)", fontSize: "var(--text-base)", whiteSpace: "nowrap" }}>{t("Sign in")}</button>
            }
            {!user && <Button variant="primary" size="sm" style={{ whiteSpace: "nowrap" }} onClick={() => navTo("register")}>{t("Post a job")}</Button>}
          </div>

          {/* Language toggle — mobile only, shown in header bar */}
          <div className="krm-mobile-lang" style={{ marginLeft: "auto", display: "none", alignItems: "center", flexShrink: 0 }}>
            <LangToggle />
          </div>

        </header>

        {/* Mobile account sheet — slides up from the Account tab */}
        {menuOpen && (
          <div className="krm-mobile-drawer" style={{
            position: "fixed", inset: 0, zIndex: 400, display: "flex", flexDirection: "column", justifyContent: "flex-end",
          }}>
            {/* Backdrop */}
            <div onClick={() => setMenuOpen(false)} style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.35)" }} />
            {/* Sheet panel */}
            <div style={{
              position: "relative", background: "#fff",
              borderTopLeftRadius: 18, borderTopRightRadius: 18,
              boxShadow: "var(--shadow-xl)",
              padding: "10px 0 calc(72px + env(safe-area-inset-bottom, 0px))",
            }}>
              {/* Grabber */}
              <div style={{ width: 40, height: 4, borderRadius: 2, background: "var(--border)", margin: "0 auto 12px" }} />
              {user ? (
                <div style={{ padding: "0 20px" }}>
                  <div style={{ fontWeight: 700, fontSize: "var(--text-sm)", color: "var(--text-strong)", marginBottom: 4 }}>{user.name}</div>
                  <div style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)", marginBottom: 12 }}>{user.email}</div>
                  <button onClick={() => { setMenuOpen(false); onLogout(); }} style={{
                    width: "100%", padding: "10px", border: "1px solid var(--border)",
                    borderRadius: "var(--radius-md)", background: "transparent", cursor: "pointer",
                    fontFamily: "var(--font-sans)", fontWeight: 600, color: "var(--danger)",
                    fontSize: "var(--text-sm)",
                  }}>{t("Log out")}</button>
                </div>
              ) : (
                <div style={{ padding: "0 20px", display: "flex", flexDirection: "column", gap: 10 }}>
                  <button onClick={() => navTo("login")} style={{
                    width: "100%", padding: "11px", border: "1px solid var(--border)",
                    borderRadius: "var(--radius-md)", background: "transparent", cursor: "pointer",
                    fontFamily: "var(--font-sans)", fontWeight: 600, color: "var(--text-strong)",
                    fontSize: "var(--text-base)",
                  }}>{t("Log in")}</button>
                  <button onClick={() => navTo("register")} style={{
                    width: "100%", padding: "11px", border: "none",
                    borderRadius: "var(--radius-md)", background: "var(--brand)", cursor: "pointer",
                    fontFamily: "var(--font-sans)", fontWeight: 700, color: "#fff",
                    fontSize: "var(--text-base)",
                  }}>{t("Register")}</button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Mobile bottom nav — app-style tab bar */}
        <nav className="krm-bottom-nav">
          {bottomTabs.map((tab, i) => {
            const active = page === tab.id;
            if (tab.center) {
              return (
                <button key={"c" + i} className="krm-bottom-tab krm-bottom-tab--center" onClick={() => navTo(tab.id)} aria-label={t(tab.label)}>
                  <span className="krm-bottom-fab"><i data-lucide={tab.icon} style={{ width: 24, height: 24 }}></i></span>
                  <span style={{ fontSize: 11, fontWeight: active ? 700 : 500, fontFamily: "var(--font-sans)", whiteSpace: "nowrap", color: active ? "var(--text-brand)" : "var(--text-muted)" }}>{t(tab.label)}</span>
                </button>
              );
            }
            return (
              <button key={"t" + i} className="krm-bottom-tab" onClick={() => navTo(tab.id)} style={{
                color: active ? "var(--text-brand)" : "var(--text-muted)",
              }}>
                <i data-lucide={tab.icon} style={{ width: 22, height: 22 }}></i>
                <span style={{ fontSize: 11, fontWeight: active ? 700 : 500, fontFamily: "var(--font-sans)", whiteSpace: "nowrap" }}>{t(tab.label)}</span>
              </button>
            );
          })}
          {/* Account tab — opens login/register (or profile) sheet */}
          <button className="krm-bottom-tab" onClick={() => setMenuOpen(o => !o)} style={{
            color: menuOpen ? "var(--text-brand)" : "var(--text-muted)",
          }}>
            <i data-lucide={user ? "circle-user" : "user"} style={{ width: 22, height: 22 }}></i>
            <span style={{ fontSize: 11, fontWeight: menuOpen ? 700 : 500, fontFamily: "var(--font-sans)", whiteSpace: "nowrap" }}>{t("Account")}</span>
          </button>
        </nav>
      </React.Fragment>
    );
  }

  function Footer({ onNav }) {
    const t = window.KRAMA_T || function (s) { return s; };
    const go = (p) => (e) => { e.preventDefault(); onNav && onNav(p); };
    const col = (title, items) => (
      <div>
        <div style={{ fontWeight: 700, color: "var(--text-on-dark)", fontSize: "var(--text-sm)", marginBottom: 12 }}>{t(title)}</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
          {items.map(([label, target]) => <a key={label} href="#" onClick={go(target)} style={{ color: "var(--text-on-dark-mut)", fontSize: "var(--text-sm)", cursor: "pointer", textDecoration: "none" }}>{t(label)}</a>)}
        </div>
      </div>
    );
    return (
      <footer className="krm-footer" style={{ position: "relative", background: "var(--stone-900)", padding: "56px 32px 32px", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, background: "url('../../assets/krama-pattern.svg')", backgroundSize: 64, opacity: 0.05 }} />
        <div className="krm-footer-grid" style={{ position: "relative", maxWidth: 1200, margin: "0 auto", display: "grid", gridTemplateColumns: "1.4fr 1fr 1fr 1fr", gap: 40 }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
              <img src={window.getKramaLogo("../../assets/krama-mark.svg")} height="34" alt="KRAMA" />
              <span style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "var(--text-lg)", letterSpacing: ".08em", color: "#fff" }}>{window.KRAMA_BRAND_NAME || "KRAMA"}</span>
            </div>
            <p style={{ color: "var(--text-on-dark-mut)", fontSize: "var(--text-sm)", marginTop: 16, maxWidth: 260, lineHeight: 1.6 }}>
              {t("Connecting talent and verified employers across Cambodia and Southeast Asia.")}
            </p>
          </div>
          {col("For candidates", [["Find jobs", "jobs"], ["Build résumé", "register"], ["Saved jobs", "login"], ["Career advice", "about"]])}
          {col("For employers", [["For Employers", "employers"], ["Post a job", "register"], ["Pricing", "pricing"], ["Companies", "companies"]])}
          {col("Company", [["About us", "about"], ["Contact", "contact"], ["Terms", "terms"], ["Privacy", "privacy"]])}
        </div>
        <div className="krm-footer-bottom" style={{ position: "relative", maxWidth: 1200, margin: "32px auto 0", paddingTop: 20, borderTop: "1px solid rgba(255,255,255,0.1)", display: "flex", justifyContent: "center", textAlign: "center", color: "var(--text-on-dark-mut)", fontSize: "var(--text-xs)" }}>
          <span>© 2026 Krama. {t("All rights reserved.")}</span>
        </div>
      </footer>
    );
  }

  Object.assign(window, { KramaHeader: Header, KramaFooter: Footer });
})();
