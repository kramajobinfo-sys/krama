// Krama admin console -- shell + KPI overview (with bar chart) + job approval queue.
(function init() {
  if (!window.KramaDesignSystem_1a6f65) { return setTimeout(init, 40); }
  const NS = window.KramaDesignSystem_1a6f65;
  const { Button, Badge, StatusBadge, Avatar, Card, StatCard, Tabs, Checkbox, Switch, Select, Input, Textarea, IconButton, EmptyState } = NS;
  // LucideIcon isolates lucide's DOM mutations inside a <span> React controls.
  // lucide.createIcons() replaces <i> with <svg> in-place; if React owns the <i>
  // directly it loses track of the node and throws removeChild errors on re-renders.
  const LucideIcon = React.memo(function LucideIcon({ name, size }) {
    size = size || 18;
    const ref = React.useRef(null);
    React.useEffect(function () {
      var span = ref.current;
      if (!span || !window.lucide) return;
      span.innerHTML = '<i data-lucide="' + name + '" style="width:' + size + 'px;height:' + size + 'px;display:inline-flex"></i>';
      window.lucide.createIcons({ el: span });
    }, [name, size]);
    return <span ref={ref} style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: size, height: size, flexShrink: 0 }} />;
  });
  const I = (n, s = 18) => <LucideIcon name={n} size={s} />;

  function compressImage(file, maxPx, quality) {
    maxPx = maxPx || 400; quality = quality || 0.82;
    return new Promise(function(resolve) {
      var url = URL.createObjectURL(file);
      var img = new Image();
      img.onload = function() {
        var ratio = Math.min(maxPx / img.width, maxPx / img.height, 1);
        var w = Math.round(img.width * ratio), h = Math.round(img.height * ratio);
        var canvas = document.createElement('canvas');
        canvas.width = w; canvas.height = h;
        var ctx = canvas.getContext('2d');
        ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, w, h);
        ctx.drawImage(img, 0, 0, w, h);
        URL.revokeObjectURL(url);
        canvas.toBlob(function(blob) { resolve(new File([blob], 'avatar.jpg', { type: 'image/jpeg' })); }, 'image/jpeg', quality);
      };
      img.src = url;
    });
  }

  // Crop `src` (data URL / URL) to the targetW×targetH aspect ratio, centered on the
  // focal point (fx,fy given as 0..100 percentages), scaled down to fit the target size
  // (never upscaled beyond the source crop). Returns a JPEG File. Used to auto-produce
  // separate desktop (landscape) and mobile (portrait) versions of a hero-slide image
  // from a single upload.
  function cropImageToFile(src, fx, fy, targetW, targetH, quality) {
    quality = quality || 0.85;
    return new Promise(function(resolve, reject) {
      var img = new Image();
      img.onload = function() {
        var iw = img.naturalWidth, ih = img.naturalHeight;
        var targetRatio = targetW / targetH;
        var cropW, cropH;
        if (iw / ih > targetRatio) { cropH = ih; cropW = Math.round(ih * targetRatio); }
        else { cropW = iw; cropH = Math.round(iw / targetRatio); }
        var cx = (fx / 100) * iw, cy = (fy / 100) * ih;
        var sx = Math.max(0, Math.min(cx - cropW / 2, iw - cropW));
        var sy = Math.max(0, Math.min(cy - cropH / 2, ih - cropH));
        var scale = Math.min(targetW / cropW, 1);
        var outW = Math.round(cropW * scale), outH = Math.round(cropH * scale);
        var canvas = document.createElement('canvas');
        canvas.width = outW; canvas.height = outH;
        var ctx = canvas.getContext('2d');
        ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, outW, outH);
        ctx.drawImage(img, sx, sy, cropW, cropH, 0, 0, outW, outH);
        canvas.toBlob(function(blob) {
          if (!blob) { reject(new Error('crop failed')); return; }
          resolve(new File([blob], 'slide.jpg', { type: 'image/jpeg' }));
        }, 'image/jpeg', quality);
      };
      img.onerror = function() { reject(new Error('image load failed')); };
      img.src = src;
    });
  }

  // Convert a data URL (or any image URL) to a File without re-cropping — used to upload
  // an "image only" ad slide as the full poster so nothing is sliced off.
  function dataUrlToFile(src, name) {
    return fetch(src).then(function(r) { return r.blob(); }).then(function(b) {
      return new File([b], name || 'banner.jpg', { type: b.type || 'image/jpeg' });
    });
  }

  const adm = window.KRAMA_ADMIN_API;

  function AdminLogin({ onLogin }) {
    const [email, setEmail] = React.useState("");
    const [password, setPassword] = React.useState("");
    const [error, setError] = React.useState("");
    const [loading, setLoading] = React.useState(false);
    const submit = () => {
      setError(""); setLoading(true);
      adm.login(email, password)
        .then(function (u) { setLoading(false); onLogin(u); })
        .catch(function (e) { setLoading(false); setError((e && e.message) || "Login failed."); });
    };
    const onKey = (e) => { if (e.key === "Enter") submit(); };
    return (
      <div className="krm-login-outer" style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--stone-900)" }}>
        <div className="krm-login-card" style={{ width: "100%", maxWidth: 380, background: "var(--surface-card)", borderRadius: "var(--radius-xl)", boxShadow: "var(--shadow-xl)", padding: 36 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 24 }}>
            <img src={window.getKramaLogo("../../assets/krama-mark.svg")} height="40" alt="KRAMA" />
            <span style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "var(--text-xl)", letterSpacing: ".08em", color: "var(--text-strong)" }}>{window.KRAMA_BRAND_NAME || "KRAMA"}</span>
          </div>
          <h1 style={{ fontSize: "var(--text-2xl)", fontWeight: 700, color: "var(--text-strong)", marginBottom: 6 }}>Admin console</h1>
          <p style={{ fontSize: "var(--text-sm)", color: "var(--text-muted)", marginBottom: 24 }}>Sign in with your admin credentials.</p>
          {error && <div style={{ padding: "10px 14px", background: "var(--danger-subtle)", color: "var(--danger)", borderRadius: "var(--radius-md)", fontSize: "var(--text-sm)", marginBottom: 16 }}>{error}</div>}
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div>
              <label style={{ fontSize: "var(--text-sm)", fontWeight: 600, color: "var(--text-strong)", display: "block", marginBottom: 6 }}>Email</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} onKeyDown={onKey} placeholder="admin@krama.com" style={{ width: "100%", height: 40, border: "1px solid var(--border-strong)", borderRadius: "var(--radius-md)", padding: "0 12px", fontFamily: "var(--font-sans)", fontSize: "var(--text-sm)", boxSizing: "border-box", outline: "none" }} />
            </div>
            <div>
              <label style={{ fontSize: "var(--text-sm)", fontWeight: 600, color: "var(--text-strong)", display: "block", marginBottom: 6 }}>Password</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} onKeyDown={onKey} placeholder="••••••••" style={{ width: "100%", height: 40, border: "1px solid var(--border-strong)", borderRadius: "var(--radius-md)", padding: "0 12px", fontFamily: "var(--font-sans)", fontSize: "var(--text-sm)", boxSizing: "border-box", outline: "none" }} />
            </div>
            <button onClick={submit} disabled={loading} style={{ width: "100%", height: 44, borderRadius: "var(--radius-md)", border: "none", background: "var(--brand)", color: "#fff", fontFamily: "var(--font-sans)", fontSize: "var(--text-base)", fontWeight: 700, cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.7 : 1 }}>{loading ? "Signing in…" : "Sign in"}</button>
          </div>
        </div>
      </div>
    );
  }

  const NAV = [
    { id: "dashboard", label: "Dashboard", icon: "layout-dashboard" },
    { id: "companies", label: "Companies", icon: "building-2" },
    { id: "jobs", label: "Jobs", icon: "briefcase" },
    { id: "candidates", label: "Candidates", icon: "users" },
    { id: "resumes",    label: "Resumes",    icon: "file-text" },
    { id: "reviews",   label: "Reviews",    icon: "star" },
    { id: "forum",    label: "Forum",      icon: "messages-square" },
    { id: "homepage", label: "Homepage", icon: "layout-template" },
    { id: "chat", label: "Chat agent", icon: "bot" },
    { id: "social", label: "Social login", icon: "share-2" },
    { id: "email", label: "Email", icon: "mail" },
    { id: "telegram", label: "Telegram", icon: "send" },
    { id: "sms", label: "SMS gateway", icon: "message-square" },
    { id: "social_post", label: "Social posting", icon: "megaphone" },
    { id: "payments", label: "Payments", icon: "credit-card" },
    { id: "reports", label: "Reports", icon: "chart-line" },
    { id: "audit", label: "Audit log", icon: "scroll-text" },
    { id: "cvmatch", label: "CV match", icon: "git-compare-arrows" },
    { id: "brand", label: "Brand", icon: "palette" },
    { id: "settings", label: "Settings", icon: "settings" },
  ];

  function Sidebar({ page, onNav, badges, open, onClose }) {
    badges = badges || {};
    return (
      <aside className={"krm-sidebar" + (open ? " open" : "")} style={{ width: 248, flexShrink: 0, background: "var(--teal-800)", display: "flex", flexDirection: "column", padding: "20px 14px", position: "sticky", top: 0, height: "100vh" }}>
        <a href="/krama/krama/ui_kits/public-website/index.html" style={{ display: "flex", alignItems: "center", gap: 10, margin: "4px 8px 8px", textDecoration: "none" }}>
          <img src={window.getKramaLogo("../../assets/krama-mark.svg")} height="34" alt="KRAMA" />
          <span style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "var(--text-lg)", letterSpacing: ".08em", color: "#fff" }}>{window.KRAMA_BRAND_NAME || "KRAMA"}</span>
        </a>
        <div style={{ margin: "0 8px 18px", fontSize: "var(--text-xs)", fontWeight: 700, letterSpacing: ".1em", textTransform: "uppercase", color: "rgba(255,255,255,0.45)" }}>Admin console</div>
        <nav className="krm-sidebar-nav" style={{ display: "flex", flexDirection: "column", gap: 3, flex: 1, minHeight: 0, overflowY: "auto", overflowX: "hidden" }}>
          {NAV.map((n) => {
            const active = page === n.id;
            return (
              <button key={n.id} onClick={() => { onNav(n.id); onClose && onClose(); }} style={{ display: "flex", alignItems: "center", gap: 11, border: "none", cursor: "pointer", padding: "10px 12px", borderRadius: "var(--radius-md)", textAlign: "left", background: active ? "rgba(255,255,255,0.15)" : "transparent", color: active ? "#fff" : "rgba(255,255,255,0.75)", fontFamily: "var(--font-sans)", fontWeight: active ? 700 : 500, fontSize: "var(--text-base)", flexShrink: 0 }}>
                <span style={{ display: "inline-flex", color: active ? "#fff" : "rgba(255,255,255,0.6)" }}>{I(n.icon, 19)}</span>
                <span style={{ flex: 1 }}>{n.label}</span>
                {badges[n.id] > 0 && <span style={{ fontSize: "var(--text-xs)", fontWeight: 700, padding: "1px 7px", borderRadius: 99, background: "var(--saffron-500)", color: "#fff" }}>{badges[n.id]}</span>}
              </button>
            );
          })}
        </nav>
      </aside>
    );
  }

  function NotificationBell({ onNav }) {
    const [open, setOpen] = React.useState(false);
    const [list, setList] = React.useState([]);
    const [unread, setUnread] = React.useState(0);
    const [loading, setLoading] = React.useState(false);
    const ROUTE = { company_pending: "companies", payment_pending: "payments", job_approved: "jobs", job_rejected: "jobs", forum_report: "forum" };
    const ICON = { company_pending: "building-2", payment_pending: "banknote", job_approved: "circle-check-big", job_rejected: "circle-x", forum_report: "flag", forum_reply: "message-circle", forum_mention: "at-sign" };
    const pollUnread = React.useCallback(function () { adm.fetchNotifUnread().then(function (d) { setUnread(d.count || 0); }).catch(function () {}); }, []);
    React.useEffect(function () { pollUnread(); var t = setInterval(pollUnread, 20000); return function () { clearInterval(t); }; }, [pollUnread]);
    function openPanel() {
      var next = !open; setOpen(next);
      if (next) { setLoading(true); adm.fetchNotifications().then(function (d) { setList(d.data || []); setUnread(d.unread || 0); setLoading(false); }).catch(function () { setLoading(false); }); }
    }
    function markAll() { adm.markAllNotifRead().then(function () { setList(function (l) { return l.map(function (n) { return Object.assign({}, n, { read_at: n.read_at || "x" }); }); }); setUnread(0); }).catch(function () {}); }
    function clickNotif(n) {
      if (!n.read_at) { adm.markNotifRead(n.id).then(function () { setUnread(function (u) { return Math.max(0, u - 1); }); }).catch(function () {}); setList(function (l) { return l.map(function (x) { return x.id === n.id ? Object.assign({}, x, { read_at: "x" }) : x; }); }); }
      setOpen(false);
      if (n.type === "forum_reply" || n.type === "forum_mention") {
        window.location.href = "/krama/krama/ui_kits/public-website/index.html" + (n.link ? "?thread=" + n.link : "");
        return;
      }
      var route = ROUTE[n.type]; if (route && onNav) onNav(route);
    }
    function fmtTime(iso) { if (!iso) return ""; var d = new Date(iso), diff = Date.now() - d.getTime(); if (diff < 60000) return "just now"; if (diff < 3600000) return Math.floor(diff / 60000) + "m ago"; if (diff < 86400000) return Math.floor(diff / 3600000) + "h ago"; return d.getDate() + " " + ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"][d.getMonth()]; }
    return (
      <div style={{ position: "relative" }}>
        <button onClick={openPanel} title="Notifications" style={{ position: "relative", width: 40, height: 40, border: "1px solid var(--border)", borderRadius: "var(--radius-md)", background: "var(--surface-card)", cursor: "pointer", color: "var(--text-muted)", display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
          {I("bell", 18)}
          {unread > 0 && <span style={{ position: "absolute", top: -6, right: -6, minWidth: 18, height: 18, padding: "0 5px", borderRadius: 9, background: "var(--danger)", color: "#fff", fontSize: 11, fontWeight: 700, display: "inline-flex", alignItems: "center", justifyContent: "center", border: "2px solid var(--surface-card)" }}>{unread > 9 ? "9+" : unread}</span>}
        </button>
        {open && <React.Fragment>
          <div onClick={function () { setOpen(false); }} style={{ position: "fixed", inset: 0, zIndex: 99 }} />
          <div onClick={function (e) { e.stopPropagation(); }} style={{ position: "absolute", top: 48, right: 0, width: 340, maxHeight: 440, overflowY: "auto", background: "var(--surface-card)", border: "1px solid var(--border)", borderRadius: "var(--radius-md)", boxShadow: "var(--shadow-lg)", zIndex: 100 }}>
            <div style={{ padding: "12px 16px", borderBottom: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center", position: "sticky", top: 0, background: "var(--surface-card)" }}>
              <span style={{ fontWeight: 700, fontSize: "var(--text-sm)", color: "var(--text-strong)" }}>Notifications</span>
              {unread > 0 && <button onClick={markAll} style={{ fontSize: "var(--text-xs)", color: "var(--text-brand)", cursor: "pointer", background: "none", border: "none", fontFamily: "var(--font-sans)", fontWeight: 600 }}>Mark all read</button>}
            </div>
            {loading ? <div style={{ padding: 24, color: "var(--text-muted)", fontSize: "var(--text-sm)", textAlign: "center" }}>Loading…</div>
              : list.length === 0 ? <div style={{ padding: 28, color: "var(--text-muted)", fontSize: "var(--text-sm)", textAlign: "center" }}>{I("bell", 26)}<div style={{ marginTop: 8 }}>No notifications yet.</div></div>
              : list.map(function (n) { return (
                <div key={n.id} onClick={function () { clickNotif(n); }} style={{ display: "flex", gap: 11, padding: "12px 16px", borderBottom: "1px solid var(--border)", cursor: "pointer", background: n.read_at ? "transparent" : "var(--brand-subtle)" }}>
                  <span style={{ width: 32, height: 32, borderRadius: "var(--radius-sm)", background: "var(--surface-page)", color: "var(--text-brand)", display: "inline-flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{I(ICON[n.type] || "bell", 15)}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: "var(--text-sm)", fontWeight: 600, color: "var(--text-strong)" }}>{n.title}</div>
                    <div style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)", marginTop: 2, lineHeight: 1.4 }}>{n.body}</div>
                    <div style={{ fontSize: "var(--text-xs)", color: "var(--text-faint)", marginTop: 3 }}>{fmtTime(n.created_at)}</div>
                  </div>
                </div>
              ); })}
          </div>
        </React.Fragment>}
      </div>
    );
  }

  function Topbar({ title, user, onLogout, onNav, onMenu }) {
    const [userOpen, setUserOpen] = React.useState(false);
    const initials = user && user.name ? user.name.split(" ").map(w => w[0]).join("").slice(0,2).toUpperCase() : "AD";

    const closeAll = () => { setUserOpen(false); };

    return (
      <header className="krm-topbar" style={{ height: 64, flexShrink: 0, borderBottom: "1px solid var(--border)", background: "var(--surface-card)", display: "flex", alignItems: "center", gap: 16, padding: "0 28px", position: "sticky", top: 0, zIndex: 10 }}>
        <button className="krm-hamburger-dash" onClick={onMenu} style={{ display: "none", alignItems: "center", justifyContent: "center", width: 36, height: 36, border: "1px solid var(--border)", borderRadius: "var(--radius-md)", background: "transparent", cursor: "pointer", color: "var(--text-muted)", flexShrink: 0 }}>{I("menu", 20)}</button>
        <h1 style={{ fontSize: "var(--text-xl)", fontWeight: 700, color: "var(--text-strong)" }}>{title}</h1>
        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 14 }}>

          {/* Bell */}
          <NotificationBell onNav={onNav} />

          {/* User avatar menu */}
          <div style={{ position: "relative" }}>
            <button onClick={() => { setUserOpen(o => !o); }} style={{ width: 40, height: 40, borderRadius: "50%", background: "var(--brand)", color: "#fff", border: "2px solid var(--border)", cursor: "pointer", fontFamily: "var(--font-sans)", fontWeight: 700, fontSize: 14, display: "inline-flex", alignItems: "center", justifyContent: "center", overflow: "hidden", padding: 0 }}>
              {user && user.avatar_url
                ? <img src={user.avatar_url} alt={initials} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                : initials}
            </button>
            {userOpen && (
              <div onClick={e => e.stopPropagation()} style={{ position: "absolute", top: 48, right: 0, minWidth: 200, background: "var(--surface-card)", border: "1px solid var(--border)", borderRadius: "var(--radius-md)", boxShadow: "var(--shadow-lg)", zIndex: 100, padding: "6px 0", overflow: "hidden" }}>
                <div style={{ padding: "10px 14px 8px", borderBottom: "1px solid var(--border)" }}>
                  <div style={{ fontWeight: 700, fontSize: "var(--text-sm)", color: "var(--text-strong)" }}>{user ? user.name : "Admin"}</div>
                  <div style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>{user ? user.email : ""}</div>
                  <div style={{ marginTop: 3, fontSize: "var(--text-xs)", color: "var(--text-brand)", fontWeight: 600, textTransform: "capitalize" }}>{user && user.role ? user.role.name : "Admin"}</div>
                </div>
                <button onClick={() => { closeAll(); onNav && onNav("profile"); }} style={{ display: "block", width: "100%", textAlign: "left", border: "none", background: "transparent", padding: "9px 14px", cursor: "pointer", fontFamily: "var(--font-sans)", fontSize: "var(--text-sm)", color: "var(--text-body)" }}>My Profile</button>
                <button onClick={() => { closeAll(); onNav && onNav("settings"); }} style={{ display: "block", width: "100%", textAlign: "left", border: "none", background: "transparent", padding: "9px 14px", cursor: "pointer", fontFamily: "var(--font-sans)", fontSize: "var(--text-sm)", color: "var(--text-body)" }}>Settings</button>
                <div style={{ borderTop: "1px solid var(--border)", marginTop: 4 }}>
                  <button onClick={() => { closeAll(); onLogout && onLogout(); }} style={{ display: "block", width: "100%", textAlign: "left", border: "none", background: "transparent", padding: "9px 14px", cursor: "pointer", fontFamily: "var(--font-sans)", fontSize: "var(--text-sm)", color: "var(--danger)" }}>Sign out</button>
                </div>
              </div>
            )}
          </div>

          {/* Click-away overlay */}
          {userOpen && <div onClick={closeAll} style={{ position: "fixed", inset: 0, zIndex: 99 }} />}
        </div>
      </header>
    );
  }

  const BARS = [
    ["Jan", 60], ["Feb", 75], ["Mar", 58], ["Apr", 88], ["May", 96], ["Jun", 72],
    ["Jul", 110], ["Aug", 84], ["Sep", 120], ["Oct", 102], ["Nov", 134], ["Dec", 118],
  ];

  function Overview() {
    const [stats, setStats] = React.useState(null);
    React.useEffect(() => {
      adm.fetchStats().then(setStats).catch(function () {});
    }, []);
    const fmt = (n) => n >= 1000 ? (n / 1000).toFixed(n >= 10000 ? 0 : 1) + "k" : String(n);
    const fmtUsd = (n) => "$" + n.toLocaleString("en", { minimumFractionDigits: 0, maximumFractionDigits: 0 });
    const max = Math.max(...BARS.map((b) => b[1]));
    return (
      <div className="krm-page-pad" style={{ padding: 28, display: "flex", flexDirection: "column", gap: 24 }}>
        <div className="krm-stats-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16 }}>
          <StatCard label="Total jobs" value={stats ? fmt(stats.totalJobs) : "--"} tone="brand" icon={I("briefcase", 22)} />
          <StatCard label="Active jobs" value={stats ? fmt(stats.activeJobs) : "--"} tone="success" icon={I("circle-check-big", 22)} />
          <StatCard label="Published jobs" value={stats ? String(stats.activeJobs || stats.pendingJobs) : "--"} tone="success" icon={I("circle-check-big", 22)} />
          <StatCard label="Companies" value={stats ? fmt(stats.companies) : "--"} tone="info" icon={I("building-2", 22)} />
          <StatCard label="Candidates" value="--" tone="brand" icon={I("users", 22)} />
          <StatCard label="Revenue (MTD)" value={stats ? fmtUsd(stats.revenue) : "--"} tone="accent" icon={I("banknote", 22)} />
        </div>

        <Card padding={24}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 22 }}>
            <h2 style={{ fontSize: "var(--text-lg)", fontWeight: 700, color: "var(--text-strong)" }}>Monthly job posts</h2>
            <Badge tone="brand">2026</Badge>
          </div>
          <div style={{ display: "flex", alignItems: "flex-end", gap: 12, height: 180 }}>
            {BARS.map(([m, v], i) => (
              <div key={m} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
                <div style={{ width: "100%", maxWidth: 36, height: (v / max) * 150, background: i === 10 ? "var(--accent)" : "var(--teal-500)", borderRadius: "var(--radius-sm) var(--radius-sm) 0 0", transition: "height var(--dur-slow) var(--ease-out)" }} />
                <span style={{ fontSize: "var(--text-xs)", color: "var(--text-faint)" }}>{m}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    );
  }

  const QUEUE = [
    { title: "Senior Accountant", company: "ABA Bank", cat: "Accounting", date: "14 Jun 2026", verified: true },
    { title: "DevOps Engineer", company: "Smart Axiata", cat: "IT", date: "14 Jun 2026", verified: true },
    { title: "Sales Executive", company: "Chip Mong Retail", cat: "Marketing", date: "13 Jun 2026", verified: true },
    { title: "Crypto Trader (urgent!!)", company: "QuickCash Ltd", cat: "Finance", date: "13 Jun 2026", verified: false },
    { title: "HR Coordinator", company: "Manulife", cat: "HR", date: "12 Jun 2026", verified: true },
  ];

  function Approvals() {
    const [jobs, setJobs] = React.useState([]);
    const [counts, setCounts] = React.useState({ published: 0, rejected: 0, all: 0 });
    const [loading, setLoading] = React.useState(true);
    const [tab, setTab] = React.useState("published");
    const [actionMsg, setActionMsg] = React.useState("");
    const [rejectModal, setRejectModal] = React.useState(null);
    const [rejectReason, setRejectReason] = React.useState("");
    const [featureBusy, setFeatureBusy] = React.useState({});
    const [page, setPage] = React.useState(1);
    const [lastPage, setLastPage] = React.useState(1);
    const [total, setTotal] = React.useState(0);

    const loadJobs = (status, pg) => {
      setLoading(true);
      var q = status === "all" ? adm.fetchJobs(undefined, pg) : adm.fetchJobs(status, pg);
      q.then(function (d) {
        setJobs(d.data || []);
        setLastPage(d.last_page || 1);
        setTotal(d.total || 0);
        setLoading(false);
      }).catch(function () { setLoading(false); });
    };

    React.useEffect(() => {
      Promise.all([
        adm.fetchJobs("published", 1),
        adm.fetchJobs("rejected", 1),
        adm.fetchJobs(undefined, 1),
      ]).then(function (r) {
        var tot = function (x) { return x.total || (x.meta && x.meta.total) || 0; };
        setCounts({ published: tot(r[0]), rejected: tot(r[1]), all: tot(r[2]) });
      }).catch(function () {});
    }, []);

    React.useEffect(() => { loadJobs(tab, page); }, [tab, page]);

    const flashMsg = (msg) => { setActionMsg(msg); setTimeout(() => setActionMsg(""), 3000); };

    const takeDown = (id, reason) => {
      adm.rejectJob(id, reason).then(function () { flashMsg("Job taken down."); loadJobs(tab, page); setRejectModal(null); setRejectReason(""); }).catch(function (e) { flashMsg("Error: " + (e && e.message)); });
    };

    const toggleFeatured = (j) => {
      setFeatureBusy(function(b) { return Object.assign({}, b, { [j.id]: true }); });
      adm.toggleJobFeatured(j.id).then(function(d) {
        flashMsg(d.message || "Updated.");
        setJobs(function(list) { return list.map(function(x) { return x.id === j.id ? Object.assign({}, x, { is_featured: d.is_featured }) : x; }); });
        setFeatureBusy(function(b) { return Object.assign({}, b, { [j.id]: false }); });
      }).catch(function(e) { flashMsg("Error: " + (e && e.message)); setFeatureBusy(function(b) { return Object.assign({}, b, { [j.id]: false }); }); });
    };

    const fmtDate = (iso) => { if (!iso) return "--"; var d = new Date(iso); return d.getDate() + " " + ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"][d.getMonth()] + " " + d.getFullYear(); };

    return (
      <div className="krm-page-pad" style={{ padding: 28 }}>
        <div style={{ marginBottom: 16 }}>
          <h2 style={{ fontSize: "var(--text-xl)", fontWeight: 700, color: "var(--text-strong)", margin: 0 }}>Job management</h2>
          <p style={{ fontSize: "var(--text-sm)", color: "var(--text-muted)", marginTop: 4 }}>
            Jobs are now published directly by employers. Use this panel to monitor and take down inappropriate listings.
          </p>
        </div>
        <Tabs value={tab} onChange={(v) => { setPage(1); setTab(v); }} tabs={[
          { value: "published", label: "Live jobs", count: counts.published },
          { value: "rejected", label: "Taken down", count: counts.rejected },
          { value: "all", label: "All jobs", count: counts.all },
        ]} style={{ marginBottom: 20 }} />

        {actionMsg && <div style={{ padding: "10px 14px", background: "var(--success-subtle)", color: "var(--success)", borderRadius: "var(--radius-md)", marginBottom: 14, fontWeight: 600, fontSize: "var(--text-sm)" }}>{actionMsg}</div>}

        <div className="krm-table-wrap"><Card padding={0}>
          <div style={{ display: "grid", gridTemplateColumns: "2fr 1.4fr 1fr 1fr 1fr 190px", padding: "12px 18px", fontSize: "var(--text-xs)", fontWeight: 700, letterSpacing: ".04em", textTransform: "uppercase", color: "var(--text-faint)", borderBottom: "1px solid var(--border)", alignItems: "center" }}>
            <span>Job title</span><span>Employer</span><span>Category</span><span>Status</span><span>Posted</span><span style={{ textAlign: "right" }}>Actions</span>
          </div>
          {loading && <div style={{ padding: "28px 18px", color: "var(--text-muted)", fontSize: "var(--text-sm)", textAlign: "center" }}>Loading…</div>}
          {!loading && jobs.length === 0 && <div style={{ padding: "28px 18px", color: "var(--text-muted)", fontSize: "var(--text-sm)", textAlign: "center" }}>No jobs in this tab.</div>}
          {!loading && jobs.map((j, i) => {
            var company = j.company || {};
            var companyName = company.name || j.company_name || "Unknown";
            var catName = j.category ? j.category.name : (j.category_name || "--");
            return (
              <div key={j.id} style={{ display: "grid", gridTemplateColumns: "2fr 1.4fr 1fr 1fr 1fr 190px", alignItems: "center", padding: "14px 18px", borderBottom: i < jobs.length - 1 ? "1px solid var(--border-subtle)" : "none" }}>
                <div style={{ fontWeight: 600, color: "var(--text-strong)" }}>
                  {j.title}
                  {j.is_featured ? <Badge tone="accent" style={{ marginLeft: 8 }}>{I("star", 11)} Featured</Badge> : null}
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <Avatar src={company.logo_url || undefined} name={companyName} square size={30} />
                  <span style={{ fontSize: "var(--text-sm)", color: "var(--text-body)", display: "flex", alignItems: "center", gap: 4 }}>
                    {companyName}
                    {company.is_verified
                      ? <span style={{ color: "var(--brand)", display: "inline-flex" }}>{I("badge-check", 13)}</span>
                      : <span title="Unverified" style={{ color: "var(--warning)", display: "inline-flex" }}>{I("triangle-alert", 13)}</span>}
                  </span>
                </div>
                <span><Badge tone="neutral">{catName}</Badge></span>
                <span><StatusBadge status={j.status} /></span>
                <span style={{ fontSize: "var(--text-sm)", color: "var(--text-muted)" }}>{fmtDate(j.created_at)}</span>
                <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", alignItems: "center" }}>
                  <Button
                    variant={j.is_featured ? "primary" : "secondary"}
                    size="sm"
                    disabled={!!featureBusy[j.id]}
                    title={j.is_featured ? "Unfeature job" : "Mark as featured"}
                    onClick={() => toggleFeatured(j)}
                    iconLeft={I("star", 13)}
                    style={j.is_featured ? { background: "var(--accent)", borderColor: "var(--accent)", color: "#fff" } : {}}
                  >{j.is_featured ? "Unfeature" : "Feature"}</Button>
                  {j.status === "published" && (
                    <Button variant="secondary" size="sm" onClick={() => { setRejectModal(j); setRejectReason(""); }}>Take down</Button>
                  )}
                </div>
              </div>
            );
          })}
          {!loading && total > 30 && (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 18px", borderTop: "1px solid var(--border-subtle)", flexWrap: "wrap", gap: 10 }}>
              <span style={{ fontSize: "var(--text-sm)", color: "var(--text-muted)" }}>Showing {(page - 1) * 30 + 1}–{(page - 1) * 30 + jobs.length} of {total}</span>
              <div style={{ display: "flex", gap: 8 }}>
                <Button variant="secondary" size="sm" disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>Previous</Button>
                <Button variant="secondary" size="sm" disabled={page >= lastPage} onClick={() => setPage((p) => Math.min(lastPage, p + 1))}>Next</Button>
              </div>
            </div>
          )}
        </Card></div>

        {/* Take-down modal */}
        {rejectModal && (
          <div onClick={() => setRejectModal(null)} style={{ position: "fixed", inset: 0, zIndex: 300, background: "var(--surface-overlay)", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
            <div onClick={(e) => e.stopPropagation()} style={{ width: "100%", maxWidth: 420, background: "var(--surface-card)", borderRadius: "var(--radius-xl)", boxShadow: "var(--shadow-xl)", overflow: "hidden" }}>
              <div style={{ padding: "18px 22px", borderBottom: "1px solid var(--border)", fontWeight: 700, fontSize: "var(--text-md)", color: "var(--text-strong)" }}>Take down job posting</div>
              <div style={{ padding: "18px 22px" }}>
                <div style={{ fontSize: "var(--text-sm)", color: "var(--text-muted)", marginBottom: 12 }}>This will hide the job from the public website and notify the employer.</div>
                <Input label="Reason" value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} placeholder="e.g. Violates community guidelines…" />
              </div>
              <div style={{ display: "flex", gap: 10, padding: "14px 22px", borderTop: "1px solid var(--border)" }}>
                <Button variant="ghost" onClick={() => setRejectModal(null)} style={{ flex: 1 }}>Cancel</Button>
                <Button variant="primary" style={{ background: "var(--danger)", flex: 1 }} disabled={!rejectReason.trim()} onClick={() => takeDown(rejectModal.id, rejectReason)}>Take down</Button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  function ScreenHead({ title, sub, action }) {
    return (
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 18 }}>
        <div>
          <h2 style={{ fontSize: "var(--text-xl)", fontWeight: 700, color: "var(--text-strong)" }}>{title}</h2>
          {sub && <div style={{ fontSize: "var(--text-sm)", color: "var(--text-muted)", marginTop: 4 }}>{sub}</div>}
        </div>
        {action}
      </div>
    );
  }

  const COMPANIES = [
    { name: "ABA Bank", industry: "Financial services", reg: "00012345-2010", jobs: 12, status: "approved" },
    { name: "Smart Axiata", industry: "Telecommunications", reg: "00033211-2009", jobs: 8, status: "approved" },
    { name: "QuickCash Ltd", industry: "Finance", reg: "--", jobs: 0, status: "pending" },
    { name: "Chip Mong Group", industry: "Retail", reg: "00091122-2012", jobs: 6, status: "approved" },
    { name: "GoldTrade Express", industry: "Logistics", reg: "00120931-2023", jobs: 1, status: "suspended" },
    { name: "Prince Bank", industry: "Financial services", reg: "00077654-2018", jobs: 4, status: "pending" },
  ];
  const CANDIDATES = [
    { name: "Sok Dara", title: "Senior Accountant", location: "Phnom Penh", applied: 12, status: "active" },
    { name: "Chan Mony", title: "Finance Officer", location: "Phnom Penh", applied: 7, status: "active" },
    { name: "Heng Visal", title: "Data Analyst", location: "Siem Reap", applied: 4, status: "active" },
    { name: "Lim Chhay", title: "Bookkeeper", location: "Battambang", applied: 9, status: "suspended" },
    { name: "Neang Sreyleak", title: "Financial Controller", location: "Phnom Penh", applied: 3, status: "active" },
  ];
  const CATEGORIES = [
    { name: "Information Technology", slug: "it", icon: "monitor", jobs: 1240, status: "active" },
    { name: "Accounting", slug: "accounting", icon: "calculator", jobs: 860, status: "active" },
    { name: "Finance", slug: "finance", icon: "landmark", jobs: 540, status: "active" },
    { name: "Marketing", slug: "marketing", icon: "megaphone", jobs: 720, status: "active" },
    { name: "Human Resources", slug: "hr", icon: "users", jobs: 410, status: "active" },
    { name: "Engineering", slug: "engineering", icon: "hard-hat", jobs: 630, status: "inactive" },
  ];
  const APP_BARS = [["Jan", 320], ["Feb", 410], ["Mar", 380], ["Apr", 520], ["May", 610], ["Jun", 470], ["Jul", 680], ["Aug", 540], ["Sep", 720], ["Oct", 660], ["Nov", 810], ["Dec", 760]];

  function CompaniesMgmt() {
    const [tab, setTab] = React.useState("pending");
    const [companies, setCompanies] = React.useState([]);
    const [counts, setCounts] = React.useState({ pending: 0, approved: 0, suspended: 0 });
    const [loading, setLoading] = React.useState(true);
    const [actionMsg, setActionMsg] = React.useState("");
    const [logoBusy, setLogoBusy] = React.useState(null);
    const [coverBusy, setCoverBusy] = React.useState(null);
    const [page, setPage] = React.useState(1);
    const [lastPage, setLastPage] = React.useState(1);
    const [total, setTotal] = React.useState(0);

    const loadCompanies = (status, pg) => {
      setLoading(true);
      adm.fetchCompanies(status, pg).then(function (d) {
        setCompanies(d.data || []);
        setLastPage(d.last_page || 1);
        setTotal(d.total || 0);
        setLoading(false);
      }).catch(function () { setLoading(false); });
    };

    React.useEffect(() => {
      Promise.all([
        adm.fetchCompanies("pending"),
        adm.fetchCompanies("approved"),
        adm.fetchCompanies("suspended"),
      ]).then(function (r) {
        // Laravel LengthAwarePaginator puts `total` at the root (not inside meta)
        var tot = function (x) { return x.total || (x.meta && x.meta.total) || 0; };
        setCounts({ pending: tot(r[0]), approved: tot(r[1]), suspended: tot(r[2]) });
      }).catch(function () {});
    }, []);

    React.useEffect(() => { loadCompanies(tab, page); }, [tab, page]);

    const flashMsg = (msg) => { setActionMsg(msg); setTimeout(() => setActionMsg(""), 3000); };

    const doAction = (fn, msg) => {
      fn().then(function () { flashMsg(msg); loadCompanies(tab, page); }).catch(function (e) { flashMsg("Error: " + (e && e.message)); });
    };

    const onLogoPick = (company, file) => {
      if (!file) return;
      setLogoBusy(company.id);
      adm.uploadCompanyLogo(company.id, file)
        .then(function (updated) {
          setCompanies(function (arr) { return arr.map(function (x) { return x.id === company.id ? Object.assign({}, x, { logo_url: (updated && updated.logo_url) || x.logo_url }) : x; }); });
          flashMsg("Logo updated for " + company.name + ".");
        })
        .catch(function (e) { flashMsg("Error: " + (e && e.message)); })
        .then(function () { setLogoBusy(null); });
    };

    const onCoverPick = (company, file) => {
      if (!file) return;
      setCoverBusy(company.id);
      adm.uploadCompanyCoverBanner(company.id, file)
        .then(function (updated) {
          setCompanies(function (arr) { return arr.map(function (x) { return x.id === company.id ? Object.assign({}, x, { cover_banner_url: (updated && updated.cover_banner_url) || x.cover_banner_url }) : x; }); });
          flashMsg("Cover banner updated for " + company.name + ".");
        })
        .catch(function (e) { flashMsg("Error: " + (e && e.message)); })
        .then(function () { setCoverBusy(null); });
    };

    return (
      <div className="krm-page-pad" style={{ padding: 28 }}>
        <ScreenHead title="Company management" sub="Approve, reject, or suspend employer companies." />
        <Tabs value={tab} onChange={(v) => { setPage(1); setTab(v); }} tabs={[{ value: "pending", label: "Pending", count: counts.pending }, { value: "approved", label: "Approved", count: counts.approved }, { value: "suspended", label: "Suspended", count: counts.suspended }]} style={{ marginBottom: 18 }} />
        {actionMsg && <div style={{ padding: "10px 14px", background: "var(--success-subtle)", color: "var(--success)", borderRadius: "var(--radius-md)", marginBottom: 14, fontWeight: 600, fontSize: "var(--text-sm)" }}>{actionMsg}</div>}
        <div className="krm-table-wrap"><Card padding={0}>
          <div style={{ display: "grid", gridTemplateColumns: "2fr 1.3fr 1.1fr 0.6fr 0.9fr 270px", padding: "12px 20px", fontSize: "var(--text-xs)", fontWeight: 700, letterSpacing: ".04em", textTransform: "uppercase", color: "var(--text-faint)", borderBottom: "1px solid var(--border)" }}>
            <span>Company</span><span>Industry</span><span>Reg. number</span><span>Jobs</span><span>Status</span><span style={{ textAlign: "right" }}>Actions</span>
          </div>
          {loading && <div style={{ padding: "28px 20px", color: "var(--text-muted)", fontSize: "var(--text-sm)", textAlign: "center" }}>Loading…</div>}
          {!loading && companies.length === 0 && <div style={{ padding: "28px 20px", color: "var(--text-muted)", fontSize: "var(--text-sm)", textAlign: "center" }}>No companies in this tab.</div>}
          {!loading && companies.map((c, i) => (
            <div key={c.id} style={{ display: "grid", gridTemplateColumns: "2fr 1.3fr 1.1fr 0.6fr 0.9fr 270px", alignItems: "center", padding: "14px 20px", borderBottom: i < companies.length - 1 ? "1px solid var(--border-subtle)" : "none" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <label title="Upload / change logo" style={{ position: "relative", cursor: logoBusy === c.id ? "wait" : "pointer", flexShrink: 0, display: "inline-flex" }}>
                  <Avatar src={c.logo_url || undefined} name={c.name} square size={34} />
                  <span style={{ position: "absolute", right: -3, bottom: -3, width: 16, height: 16, borderRadius: "50%", background: "var(--brand)", color: "#fff", display: "inline-flex", alignItems: "center", justifyContent: "center", border: "1.5px solid var(--surface-card)" }}>{I(logoBusy === c.id ? "loader" : "camera", 9)}</span>
                  <input type="file" accept="image/*" disabled={logoBusy === c.id} onChange={(e) => { onLogoPick(c, e.target.files[0]); e.target.value = ""; }} style={{ display: "none" }} />
                </label>
                <span style={{ fontWeight: 600, color: "var(--text-strong)" }}>{c.name}</span>
              </div>
              <span style={{ fontSize: "var(--text-sm)", color: "var(--text-body)" }}>{c.industry || "--"}</span>
              <span style={{ fontFamily: "var(--font-mono)", fontSize: "var(--text-sm)", color: "var(--text-muted)" }}>{c.registration_number || "--"}</span>
              <span style={{ fontFamily: "var(--font-mono)", fontSize: "var(--text-sm)", color: "var(--text-body)" }}>{c.jobs_count || 0}</span>
              <span><StatusBadge status={c.status} /></span>
              <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", alignItems: "center" }}>
                <label title={(c.cover_banner_url ? "Replace cover banner" : "Upload cover banner") + " — recommended 1600 × 220px (top band of the company profile page)"} style={{ display: "inline-flex", alignItems: "center", gap: 5, height: 30, padding: "0 10px", borderRadius: "var(--radius-sm)", cursor: coverBusy === c.id ? "wait" : "pointer", border: "1px solid " + (c.cover_banner_url ? "var(--brand)" : "var(--border-strong)"), background: c.cover_banner_url ? "var(--brand-subtle)" : "var(--surface-card)", color: c.cover_banner_url ? "var(--text-brand)" : "var(--text-muted)", fontFamily: "var(--font-sans)", fontSize: "var(--text-xs)", fontWeight: 700, flexShrink: 0 }}>
                  {I(coverBusy === c.id ? "loader" : "image", 13)} Cover
                  <input type="file" accept="image/*" disabled={coverBusy === c.id} onChange={(e) => { onCoverPick(c, e.target.files[0]); e.target.value = ""; }} style={{ display: "none" }} />
                </label>
                {c.status === "pending" && (
                  <React.Fragment>
                    <Button variant="primary" size="sm" iconLeft={I("check", 13)} onClick={() => doAction(() => adm.approveCompany(c.id), "Company approved.")}>Approve</Button>
                    <Button variant="secondary" size="sm" onClick={() => doAction(() => adm.rejectCompany(c.id), "Company rejected.")}>Reject</Button>
                  </React.Fragment>
                )}
                {c.status === "approved" && <Button variant="secondary" size="sm" onClick={() => doAction(() => adm.suspendCompany(c.id), "Company suspended.")}>Suspend</Button>}
                {c.status === "suspended" && <Button variant="secondary" size="sm" onClick={() => doAction(() => adm.reinstateCompany(c.id), "Company reinstated.")}>Reinstate</Button>}
              </div>
            </div>
          ))}
          {!loading && total > 30 && (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 20px", borderTop: "1px solid var(--border-subtle)", flexWrap: "wrap", gap: 10 }}>
              <span style={{ fontSize: "var(--text-sm)", color: "var(--text-muted)" }}>Showing {(page - 1) * 30 + 1}–{(page - 1) * 30 + companies.length} of {total}</span>
              <div style={{ display: "flex", gap: 8 }}>
                <Button variant="secondary" size="sm" disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>Previous</Button>
                <Button variant="secondary" size="sm" disabled={page >= lastPage} onClick={() => setPage((p) => Math.min(lastPage, p + 1))}>Next</Button>
              </div>
            </div>
          )}
        </Card></div>
      </div>
    );
  }

  function Candidates() {
    const [rows, setRows] = React.useState([]);
    const [total, setTotal] = React.useState(0);
    const [lastPage, setLastPage] = React.useState(1);
    const [page, setPage] = React.useState(1);
    const [status, setStatus] = React.useState("all");
    const [search, setSearch] = React.useState("");
    const [query, setQuery] = React.useState("");
    const [loading, setLoading] = React.useState(true);
    const [actionMsg, setActionMsg] = React.useState("");
    const PER_PAGE = 10;

    const load = React.useCallback(function () {
      setLoading(true);
      adm.fetchCandidates(status, page, PER_PAGE, query).then(function (d) {
        setRows(d.data || []);
        setTotal(d.total || 0);
        setLastPage(d.last_page || 1);
        setLoading(false);
      }).catch(function () { setLoading(false); });
    }, [status, page, query]);

    React.useEffect(function () { load(); }, [load]);

    const flashMsg = (msg) => { setActionMsg(msg); setTimeout(() => setActionMsg(""), 3000); };

    const toggleStatus = (c) => {
      var next = c.status === "active" ? "suspended" : "active";
      adm.setCandidateStatus(c.id, next)
        .then(function () { flashMsg("Candidate " + next + "."); load(); })
        .catch(function (e) { flashMsg("Error: " + (e && e.message)); });
    };

    const runSearch = () => { setPage(1); setQuery(search.trim()); };
    const setFilter = (s) => { setPage(1); setStatus(s); };

    const fmtDate = (iso) => { if (!iso) return "--"; var d = new Date(iso); return d.getDate() + " " + ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"][d.getMonth()] + " " + d.getFullYear(); };

    return (
      <div className="krm-page-pad" style={{ padding: 28 }}>
        <ScreenHead title="Candidates" sub={total + " registered candidate" + (total === 1 ? "" : "s") + ". Activate or suspend access."} />

        {/* toolbar: search + status filter */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16, flexWrap: "wrap" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, height: 40, padding: "0 12px", border: "1px solid var(--border-strong)", borderRadius: "var(--radius-md)", background: "var(--surface-card)", width: 280 }}>
            <span style={{ color: "var(--text-faint)" }}>{I("search", 16)}</span>
            <input placeholder="Search name or email" value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") runSearch(); }}
              style={{ border: "none", outline: "none", flex: 1, fontFamily: "var(--font-sans)", fontSize: "var(--text-sm)", background: "transparent" }} />
            {query && <button onClick={() => { setSearch(""); setQuery(""); setPage(1); }} title="Clear" style={{ border: "none", background: "transparent", cursor: "pointer", color: "var(--text-faint)", display: "inline-flex" }}>{I("x", 14)}</button>}
          </div>
          <Button variant="secondary" size="sm" onClick={runSearch}>Search</Button>
          <div style={{ display: "flex", gap: 6, marginLeft: "auto", flexWrap: "wrap" }}>
            {[["all", "All"], ["active", "Active"], ["suspended", "Suspended"]].map(([id, label]) => (
              <button key={id} onClick={() => setFilter(id)} style={{
                height: 34, padding: "0 14px", borderRadius: "var(--radius-pill)", cursor: "pointer",
                border: "1px solid " + (status === id ? "var(--brand)" : "var(--border-strong)"),
                background: status === id ? "var(--brand-subtle)" : "var(--surface-card)",
                color: status === id ? "var(--text-brand)" : "var(--text-body)",
                fontFamily: "var(--font-sans)", fontSize: "var(--text-sm)", fontWeight: 600,
              }}>{label}</button>
            ))}
          </div>
        </div>

        {actionMsg && <div style={{ padding: "10px 14px", background: "var(--success-subtle)", color: "var(--success)", borderRadius: "var(--radius-md)", marginBottom: 14, fontWeight: 600, fontSize: "var(--text-sm)" }}>{actionMsg}</div>}

        <div className="krm-table-wrap"><Card padding={0}>
          <div style={{ display: "grid", gridTemplateColumns: "2fr 2fr 1.2fr 0.8fr 1fr 150px", padding: "12px 20px", fontSize: "var(--text-xs)", fontWeight: 700, letterSpacing: ".04em", textTransform: "uppercase", color: "var(--text-faint)", borderBottom: "1px solid var(--border)" }}>
            <span>Name</span><span>Email</span><span>Joined</span><span>Applied</span><span>Status</span><span style={{ textAlign: "right" }}>Actions</span>
          </div>
          {loading && <div style={{ padding: "28px 20px", color: "var(--text-muted)", fontSize: "var(--text-sm)", textAlign: "center" }}>Loading…</div>}
          {!loading && rows.length === 0 && <div style={{ padding: "28px 20px", color: "var(--text-muted)", fontSize: "var(--text-sm)", textAlign: "center" }}>No candidates found.</div>}
          {!loading && rows.map((c, i) => (
            <div key={c.id} style={{ display: "grid", gridTemplateColumns: "2fr 2fr 1.2fr 0.8fr 1fr 150px", alignItems: "center", padding: "14px 20px", borderBottom: i < rows.length - 1 ? "1px solid var(--border-subtle)" : "none" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}><Avatar name={c.name} size={34} /><span style={{ fontWeight: 600, color: "var(--text-strong)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{c.name}</span></div>
              <span style={{ fontSize: "var(--text-sm)", color: "var(--text-muted)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{c.email}</span>
              <span style={{ fontSize: "var(--text-sm)", color: "var(--text-muted)" }}>{fmtDate(c.created_at)}</span>
              <span style={{ fontFamily: "var(--font-mono)", fontSize: "var(--text-sm)", color: "var(--text-body)" }}>{c.applications_count || 0}</span>
              <span><Badge tone={c.status === "active" ? "success" : "danger"}>{c.status === "active" ? "Active" : "Suspended"}</Badge></span>
              <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
                <Button variant="secondary" size="sm" onClick={() => toggleStatus(c)}>{c.status === "active" ? "Suspend" : "Activate"}</Button>
              </div>
            </div>
          ))}
        </Card></div>

        {/* pagination */}
        {!loading && total > 0 && (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 16 }}>
            <span style={{ fontSize: "var(--text-sm)", color: "var(--text-muted)" }}>
              Showing {(page - 1) * PER_PAGE + 1}-{Math.min(page * PER_PAGE, total)} of {total}
            </span>
            <div style={{ display: "flex", gap: 8 }}>
              <Button variant="secondary" size="sm" disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>Previous</Button>
              <span style={{ display: "inline-flex", alignItems: "center", padding: "0 8px", fontSize: "var(--text-sm)", color: "var(--text-body)", fontWeight: 600 }}>Page {page} of {lastPage}</span>
              <Button variant="secondary" size="sm" disabled={page >= lastPage} onClick={() => setPage((p) => Math.min(lastPage, p + 1))}>Next</Button>
            </div>
          </div>
        )}
      </div>
    );
  }

  const ICON_OPTIONS = ["monitor","calculator","landmark","megaphone","users","hard-hat","briefcase","building-2","stethoscope","truck","shopping-bag","book-open","coffee","music","camera","code-2","bar-chart-2","globe","layers","settings"];

  function CategoryModal({ cat, onClose, onSaved }) {
    const isNew = !cat;
    const [form, setForm] = React.useState({ name: cat ? cat.name : "", slug: cat ? cat.slug : "", icon: cat ? (cat.icon || "briefcase") : "briefcase", status: cat ? cat.status : "active" });
    const [saving, setSaving] = React.useState(false);
    const [err, setErr] = React.useState("");
    const set = (k, v) => setForm(f => Object.assign({}, f, { [k]: v }));

    const save = () => {
      setSaving(true); setErr("");
      var payload = { name: form.name.trim(), slug: form.slug.trim() || undefined, icon: form.icon, status: form.status };
      var p = isNew ? adm.createCategory(payload) : adm.updateCategory(cat.id, payload);
      p.then(function (updated) { setSaving(false); onSaved(updated); onClose(); })
       .catch(function (e) { setSaving(false); setErr((e && e.message) || "Save failed."); });
    };

    return (
      <div style={{ position: "fixed", inset: 0, zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div onClick={onClose} style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.45)" }} />
        <div style={{ position: "relative", background: "var(--surface-card)", borderRadius: "var(--radius-lg)", boxShadow: "var(--shadow-xl)", width: "100%", maxWidth: 440, padding: 28, zIndex: 201 }}>
          <div style={{ fontWeight: 700, fontSize: "var(--text-lg)", color: "var(--text-strong)", marginBottom: 20 }}>{isNew ? "New category" : "Edit category"}</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <Input label="Name" value={form.name} onChange={e => set("name", e.target.value)} />
            <Input label="Slug (auto-generated if blank)" value={form.slug} onChange={e => set("slug", e.target.value)} />
            <div>
              <div style={{ fontSize: "var(--text-sm)", fontWeight: 600, color: "var(--text-body)", marginBottom: 8 }}>Icon</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {ICON_OPTIONS.map(ic => (
                  <button key={ic} onClick={() => set("icon", ic)} title={ic} style={{ width: 36, height: 36, borderRadius: "var(--radius-md)", border: "2px solid " + (form.icon === ic ? "var(--brand)" : "var(--border)"), background: form.icon === ic ? "var(--brand-subtle)" : "var(--surface-card)", color: form.icon === ic ? "var(--brand)" : "var(--text-muted)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>{I(ic, 16)}</button>
                ))}
              </div>
            </div>
            <Select label="Status" value={form.status} onChange={e => set("status", e.target.value)} options={[{ value: "active", label: "Active" }, { value: "inactive", label: "Inactive" }]} />
            {err && <div style={{ padding: "8px 12px", background: "var(--danger-subtle)", color: "var(--danger)", borderRadius: "var(--radius-md)", fontSize: "var(--text-sm)" }}>{err}</div>}
            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", paddingTop: 4 }}>
              <Button variant="secondary" onClick={onClose}>Cancel</Button>
              <Button variant="primary" onClick={save} disabled={saving || !form.name.trim()}>{saving ? "Saving…" : "Save"}</Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  function Categories() {
    const [cats, setCats] = React.useState([]);
    const [loading, setLoading] = React.useState(true);
    const [editing, setEditing] = React.useState(null); // null=closed, false=new, or cat object
    const [deleting, setDeleting] = React.useState(null);
    const [err, setErr] = React.useState("");

    const load = () => {
      setLoading(true);
      adm.fetchCategories().then(function (d) { setCats(d); setLoading(false); }).catch(function () { setLoading(false); });
    };
    React.useEffect(load, []);

    const onSaved = (updated) => {
      setCats(prev => {
        var idx = prev.findIndex(c => c.id === updated.id);
        if (idx >= 0) { var next = prev.slice(); next[idx] = updated; return next; }
        return [updated].concat(prev);
      });
    };

    const confirmDelete = (cat) => setDeleting(cat);
    const doDelete = () => {
      if (!deleting) return;
      adm.deleteCategory(deleting.id).then(function () {
        setCats(prev => prev.filter(c => c.id !== deleting.id));
        setDeleting(null);
      }).catch(function (e) { setErr((e && e.message) || "Delete failed."); setDeleting(null); });
    };

    return (
      <div className="krm-page-pad" style={{ padding: 28 }}>
        <ScreenHead title="Categories" sub="Manage the job taxonomy candidates browse by."
          action={<Button variant="primary" iconLeft={I("plus", 16)} onClick={() => setEditing(false)}>New category</Button>} />
        {err && <div style={{ marginBottom: 14, padding: "10px 14px", background: "var(--danger-subtle)", color: "var(--danger)", borderRadius: "var(--radius-md)", fontSize: "var(--text-sm)" }}>{err}</div>}
        {loading ? (
          <div style={{ color: "var(--text-muted)", padding: 24 }}>Loading…</div>
        ) : (
          <div className="krm-card-grid" style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 14 }}>
            {cats.map(c => (
              <Card key={c.id} padding={18}>
                <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                  <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 44, height: 44, borderRadius: "var(--radius-md)", background: "var(--brand-subtle)", color: "var(--brand)", flexShrink: 0 }}>{I(c.icon || "briefcase", 22)}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 700, color: "var(--text-strong)" }}>{c.name}</div>
                    <div style={{ fontFamily: "var(--font-mono)", fontSize: "var(--text-xs)", color: "var(--text-faint)", marginTop: 2 }}>/{c.slug} · {(c.jobs_count || 0).toLocaleString()} jobs</div>
                  </div>
                  <Badge tone={c.status === "active" ? "success" : "neutral"}>{c.status === "active" ? "Active" : "Inactive"}</Badge>
                  <button onClick={() => setEditing(c)} title="Edit" style={{ border: "none", background: "none", cursor: "pointer", color: "var(--text-muted)", display: "inline-flex", padding: 4 }}>{I("pencil", 16)}</button>
                  <button onClick={() => confirmDelete(c)} title="Delete" style={{ border: "none", background: "none", cursor: "pointer", color: "var(--danger)", display: "inline-flex", padding: 4 }}>{I("trash-2", 16)}</button>
                </div>
              </Card>
            ))}
          </div>
        )}
        {editing !== null && (
          <CategoryModal cat={editing || null} onClose={() => setEditing(null)} onSaved={onSaved} />
        )}
        {deleting && (
          <div style={{ position: "fixed", inset: 0, zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div onClick={() => setDeleting(null)} style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.45)" }} />
            <div style={{ position: "relative", background: "var(--surface-card)", borderRadius: "var(--radius-lg)", boxShadow: "var(--shadow-xl)", width: "100%", maxWidth: 380, margin: "0 16px", padding: 28, zIndex: 201, boxSizing: "border-box" }}>
              <div style={{ fontWeight: 700, fontSize: "var(--text-md)", color: "var(--text-strong)", marginBottom: 10 }}>Delete "{deleting.name}"?</div>
              <div style={{ fontSize: "var(--text-sm)", color: "var(--text-muted)", marginBottom: 20 }}>This cannot be undone. Jobs in this category will lose their category assignment.</div>
              <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
                <Button variant="secondary" onClick={() => setDeleting(null)}>Cancel</Button>
                <Button variant="danger" onClick={doDelete}>Delete</Button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  function CvMatch() {
    const [q, setQ] = React.useState("");
    const [query, setQuery] = React.useState("");
    const [list, setList] = React.useState([]);
    const [loadingList, setLoadingList] = React.useState(true);
    const [ref, setRef] = React.useState(null); // { id, name, headline }
    const [mode, setMode] = React.useState("suggest");
    const [targets, setTargets] = React.useState([]); // resume ids
    const [results, setResults] = React.useState(null);
    const [running, setRunning] = React.useState(false);
    const [error, setError] = React.useState("");

    const loadList = React.useCallback(function () {
      setLoadingList(true);
      adm.fetchResumes(query, 1, 50).then(function (d) { setList(d.data || []); setLoadingList(false); }).catch(function () { setLoadingList(false); });
    }, [query]);
    React.useEffect(function () { loadList(); }, [loadList]);

    const runSearch = () => setQuery(q.trim());
    const cand = (r) => (r.candidate || {});
    const skillsCount = (r) => (r.data && Array.isArray(r.data.skills)) ? r.data.skills.length : 0;
    const toggleTarget = (id) => setTargets(function (t) { return t.includes(id) ? t.filter((x) => x !== id) : t.concat(id); });
    const scoreColor = (s) => s >= 60 ? "var(--success)" : s >= 35 ? "var(--warning)" : "var(--danger)";

    const run = () => {
      if (!ref) return;
      setRunning(true); setError(""); setResults(null);
      var p = mode === "suggest" ? adm.cvMatchSuggest(ref.id, 3) : adm.cvMatchCompare(ref.id, targets);
      p.then(function (d) { setResults(d.results || []); setRunning(false); })
       .catch(function (e) { setError((e && e.message) || "Match failed."); setRunning(false); });
    };

    return (
      <div className="krm-page-pad" style={{ padding: 28, maxWidth: 1000 }}>
        <ScreenHead title="CV match" sub="Compare a reference résumé against others, or auto-suggest the best-matching candidates. Scored on skills, experience, and field." />

        <Card padding={20} style={{ marginBottom: 16 }}>
          <div style={{ fontSize: "var(--text-sm)", fontWeight: 700, color: "var(--text-strong)", marginBottom: 10 }}>1 · Reference CV</div>
          {ref ? (
            <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 14px", border: "1px solid var(--brand)", background: "var(--brand-subtle)", borderRadius: "var(--radius-md)" }}>
              <Avatar name={ref.name} size={34} />
              <div style={{ flex: 1, minWidth: 0 }}><div style={{ fontWeight: 700, color: "var(--text-strong)" }}>{ref.name}</div><div style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>{ref.headline || "—"}</div></div>
              <Button variant="ghost" size="sm" onClick={() => { setRef(null); setResults(null); }}>Change</Button>
            </div>
          ) : <div style={{ fontSize: "var(--text-sm)", color: "var(--text-muted)" }}>Pick a résumé from the list below to use as the reference.</div>}
        </Card>

        <div style={{ display: "flex", gap: 12, marginBottom: 12, flexWrap: "wrap", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, height: 40, padding: "0 12px", border: "1px solid var(--border-strong)", borderRadius: "var(--radius-md)", background: "var(--surface-card)", width: 280 }}>
            <span style={{ color: "var(--text-faint)" }}>{I("search", 16)}</span>
            <input placeholder="Search candidate résumés" value={q} onChange={(e) => setQ(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") runSearch(); }} style={{ border: "none", outline: "none", flex: 1, fontFamily: "var(--font-sans)", fontSize: "var(--text-sm)", background: "transparent" }} />
          </div>
          <Button variant="secondary" size="sm" onClick={runSearch}>Search</Button>
          <div style={{ display: "flex", gap: 6, marginLeft: "auto" }}>
            {[["suggest", "Auto-suggest top 3"], ["compare", "Compare selected"]].map(function (pair) {
              var id = pair[0], label = pair[1];
              return <button key={id} onClick={() => { setMode(id); setResults(null); }} style={{ height: 34, padding: "0 14px", borderRadius: "var(--radius-pill)", cursor: "pointer", border: "1px solid " + (mode === id ? "var(--brand)" : "var(--border-strong)"), background: mode === id ? "var(--brand-subtle)" : "var(--surface-card)", color: mode === id ? "var(--text-brand)" : "var(--text-body)", fontFamily: "var(--font-sans)", fontSize: "var(--text-sm)", fontWeight: 600 }}>{label}</button>;
            })}
          </div>
        </div>

        <div className="krm-table-wrap"><Card padding={0} style={{ marginBottom: 16 }}>
          <div style={{ display: "grid", gridTemplateColumns: "2fr 2fr 80px 190px", padding: "10px 18px", fontSize: "var(--text-xs)", fontWeight: 700, letterSpacing: ".04em", textTransform: "uppercase", color: "var(--text-faint)", borderBottom: "1px solid var(--border)" }}>
            <span>Candidate</span><span>Headline</span><span>Skills</span><span style={{ textAlign: "right" }}>Action</span>
          </div>
          {loadingList && <div style={{ padding: 24, textAlign: "center", color: "var(--text-muted)", fontSize: "var(--text-sm)" }}>Loading…</div>}
          {!loadingList && list.length === 0 && <div style={{ padding: 24, textAlign: "center", color: "var(--text-muted)", fontSize: "var(--text-sm)" }}>No résumés found.</div>}
          {!loadingList && list.map(function (r, i) {
            var c = cand(r); var isRef = ref && ref.id === r.id; var isTarget = targets.includes(r.id);
            return (
              <div key={r.id} style={{ display: "grid", gridTemplateColumns: "2fr 2fr 80px 190px", alignItems: "center", padding: "12px 18px", borderBottom: i < list.length - 1 ? "1px solid var(--border-subtle)" : "none", background: isRef ? "var(--brand-subtle)" : "transparent" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}><Avatar name={c.name} size={30} /><span style={{ fontWeight: 600, color: "var(--text-strong)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{c.name}</span></div>
                <span style={{ fontSize: "var(--text-sm)", color: "var(--text-muted)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.headline || "—"}</span>
                <span style={{ fontFamily: "var(--font-mono)", fontSize: "var(--text-sm)", color: "var(--text-body)" }}>{skillsCount(r)}</span>
                <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
                  {isRef ? <Badge tone="brand">Reference</Badge> : (
                    <React.Fragment>
                      <Button variant="secondary" size="sm" onClick={() => { setRef({ id: r.id, name: c.name, headline: r.headline }); setResults(null); }}>Set ref</Button>
                      {mode === "compare" && <Button variant={isTarget ? "primary" : "ghost"} size="sm" onClick={() => toggleTarget(r.id)}>{isTarget ? "✓ Added" : "Add"}</Button>}
                    </React.Fragment>
                  )}
                </div>
              </div>
            );
          })}
        </Card></div>

        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
          <Button variant="primary" disabled={!ref || running || (mode === "compare" && targets.length === 0)} onClick={run}>
            {running ? "Matching…" : mode === "suggest" ? "Find top matches" : ("Compare " + targets.length + " selected")}
          </Button>
          {mode === "compare" && targets.length > 0 && <span style={{ fontSize: "var(--text-sm)", color: "var(--text-muted)" }}>{targets.length} CV{targets.length === 1 ? "" : "s"} selected</span>}
          {error && <span style={{ color: "var(--danger)", fontSize: "var(--text-sm)" }}>{error}</span>}
        </div>

        {results && (
          <div>
            <div style={{ fontSize: "var(--text-sm)", fontWeight: 700, color: "var(--text-strong)", marginBottom: 12 }}>Results — ranked by match{ref ? (" against " + ref.name) : ""}</div>
            {results.length === 0 && <div style={{ fontSize: "var(--text-sm)", color: "var(--text-muted)" }}>No matches found.</div>}
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {results.map(function (r, idx) {
                return (
                  <Card key={r.resume_id} padding={18}>
                    <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                      <div style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 20, color: "var(--text-faint)", width: 24, textAlign: "center" }}>{idx + 1}</div>
                      <Avatar name={r.candidate.name} size={40} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 700, color: "var(--text-strong)" }}>{r.candidate.name}</div>
                        <div style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>{r.headline || "—"}</div>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <div style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 24, color: scoreColor(r.score) }}>{r.score}%</div>
                        <div style={{ fontSize: "var(--text-xs)", color: "var(--text-faint)" }}>match</div>
                      </div>
                    </div>
                    <div style={{ height: 6, background: "var(--surface-sunken)", borderRadius: 3, overflow: "hidden", margin: "12px 0" }}><div style={{ height: "100%", width: r.score + "%", background: scoreColor(r.score), borderRadius: 3 }} /></div>
                    <div style={{ display: "flex", gap: 20, flexWrap: "wrap", fontSize: "var(--text-xs)", color: "var(--text-muted)", marginBottom: 8 }}>
                      <span>Skills overlap <strong style={{ color: "var(--text-body)" }}>{r.breakdown.skill_overlap_pct}%</strong></span>
                      <span>Field <strong style={{ color: "var(--text-body)" }}>{r.breakdown.field_pct}%</strong></span>
                      <span>Experience <strong style={{ color: "var(--text-body)" }}>{r.breakdown.experience.candidate}</strong> vs {r.breakdown.experience.reference} roles</span>
                    </div>
                    {r.breakdown.matched_skills.length > 0 && <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 6 }}>{r.breakdown.matched_skills.map(function (s, i) { return <span key={i} style={{ fontSize: "var(--text-xs)", padding: "2px 8px", borderRadius: "var(--radius-pill)", background: "var(--success-subtle)", color: "var(--success)", fontWeight: 600 }}>{s}</span>; })}</div>}
                    {r.breakdown.missing_skills.length > 0 && <div style={{ display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center" }}><span style={{ fontSize: "var(--text-xs)", color: "var(--text-faint)" }}>Missing:</span>{r.breakdown.missing_skills.map(function (s, i) { return <span key={i} style={{ fontSize: "var(--text-xs)", padding: "2px 8px", borderRadius: "var(--radius-pill)", background: "var(--surface-sunken)", color: "var(--text-muted)" }}>{s}</span>; })}</div>}
                  </Card>
                );
              })}
            </div>
          </div>
        )}
      </div>
    );
  }

  function AuditLog() {
    const [rows, setRows] = React.useState([]);
    const [total, setTotal] = React.useState(0);
    const [lastPage, setLastPage] = React.useState(1);
    const [page, setPage] = React.useState(1);
    const [actions, setActions] = React.useState([]);
    const [action, setAction] = React.useState("");
    const [capped, setCapped] = React.useState(false);
    const [search, setSearch] = React.useState("");
    const [query, setQuery] = React.useState("");
    const [loading, setLoading] = React.useState(true);
    const PER_PAGE = 30;

    const load = React.useCallback(function () {
      setLoading(true);
      adm.fetchAuditLog({ page: page, perPage: PER_PAGE, action: action, q: query }).then(function (d) {
        setRows(d.data || []);
        setTotal(d.total || 0);
        setLastPage(d.last_page || 1);
        setCapped(!!d.capped);
        if (d.actions && d.actions.length) setActions(d.actions);
        setLoading(false);
      }).catch(function () { setLoading(false); });
    }, [page, action, query]);

    React.useEffect(function () { load(); }, [load]);

    const runSearch = () => { setPage(1); setQuery(search.trim()); };

    // Tone the action badge by what it signals.
    const actionTone = (a) => {
      if (/reject|fail|delete|suspend|refund|remov|expired|closed/.test(a)) return "danger";
      if (/approv|creat|marked_paid|invited/.test(a)) return "success";
      if (/updat|toggl|reset|reorder|status_changed/.test(a)) return "brand";
      return "neutral";
    };

    const renderCtx = (ctx) => {
      if (!ctx) return "";
      const keys = Object.keys(ctx);
      if (!keys.length) return <span style={{ color: "var(--text-faint)" }}>—</span>;
      return keys.map(function (k) {
        var v = ctx[k];
        if (v && typeof v === "object") v = JSON.stringify(v);
        return k + ": " + v;
      }).join("  ·  ");
    };

    return (
      <div className="krm-page-pad" style={{ padding: 28 }}>
        <ScreenHead title="Audit log" sub={"Recent administrative and security events across the platform" + (capped ? " (most recent shown)" : "") + "."} />

        {/* toolbar: search + action filter */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16, flexWrap: "wrap" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, height: 40, padding: "0 12px", border: "1px solid var(--border-strong)", borderRadius: "var(--radius-md)", background: "var(--surface-card)", width: 300 }}>
            <span style={{ color: "var(--text-faint)" }}>{I("search", 16)}</span>
            <input placeholder="Search email, IP, or details" value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") runSearch(); }}
              style={{ border: "none", outline: "none", flex: 1, fontFamily: "var(--font-sans)", fontSize: "var(--text-sm)", background: "transparent" }} />
            {query && <button onClick={() => { setSearch(""); setQuery(""); setPage(1); }} title="Clear" style={{ border: "none", background: "transparent", cursor: "pointer", color: "var(--text-faint)", display: "inline-flex" }}>{I("x", 14)}</button>}
          </div>
          <Button variant="secondary" size="sm" onClick={runSearch}>Search</Button>
          <select value={action} onChange={(e) => { setPage(1); setAction(e.target.value); }}
            style={{ height: 40, padding: "0 12px", borderRadius: "var(--radius-md)", border: "1px solid var(--border-strong)", background: "var(--surface-card)", color: "var(--text-body)", fontFamily: "var(--font-sans)", fontSize: "var(--text-sm)", marginLeft: "auto", cursor: "pointer" }}>
            <option value="">All actions</option>
            {actions.map((a) => <option key={a} value={a}>{a}</option>)}
          </select>
        </div>

        <div className="krm-table-wrap"><Card padding={0}>
          <div style={{ display: "grid", gridTemplateColumns: "160px 1.6fr 1.4fr 120px 2.2fr", padding: "12px 20px", fontSize: "var(--text-xs)", fontWeight: 700, letterSpacing: ".04em", textTransform: "uppercase", color: "var(--text-faint)", borderBottom: "1px solid var(--border)" }}>
            <span>Time</span><span>Actor</span><span>Action</span><span>IP</span><span>Details</span>
          </div>
          {loading && <div style={{ padding: "28px 20px", color: "var(--text-muted)", fontSize: "var(--text-sm)", textAlign: "center" }}>Loading…</div>}
          {!loading && rows.length === 0 && <div style={{ padding: "28px 20px", color: "var(--text-muted)", fontSize: "var(--text-sm)", textAlign: "center" }}>No audit entries found.</div>}
          {!loading && rows.map((e, i) => (
            <div key={i} style={{ display: "grid", gridTemplateColumns: "160px 1.6fr 1.4fr 120px 2.2fr", alignItems: "center", padding: "13px 20px", borderBottom: i < rows.length - 1 ? "1px solid var(--border-subtle)" : "none" }}>
              <span style={{ fontFamily: "var(--font-mono)", fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>{e.time}</span>
              <span style={{ fontSize: "var(--text-sm)", color: "var(--text-body)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{e.email || (e.user_id ? "User #" + e.user_id : <span style={{ color: "var(--text-faint)" }}>system</span>)}</span>
              <span><Badge tone={actionTone(e.action)}>{e.action}</Badge></span>
              <span style={{ fontFamily: "var(--font-mono)", fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>{e.ip || "—"}</span>
              <span style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={typeof renderCtx(e.context) === "string" ? renderCtx(e.context) : ""}>{renderCtx(e.context)}</span>
            </div>
          ))}
        </Card></div>

        {!loading && total > 0 && (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 16 }}>
            <span style={{ fontSize: "var(--text-sm)", color: "var(--text-muted)" }}>
              Showing {(page - 1) * PER_PAGE + 1}-{Math.min(page * PER_PAGE, total)} of {total}
            </span>
            <div style={{ display: "flex", gap: 8 }}>
              <Button variant="secondary" size="sm" disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>Previous</Button>
              <span style={{ display: "inline-flex", alignItems: "center", padding: "0 8px", fontSize: "var(--text-sm)", color: "var(--text-body)", fontWeight: 600 }}>Page {page} of {lastPage}</span>
              <Button variant="secondary" size="sm" disabled={page >= lastPage} onClick={() => setPage((p) => Math.min(lastPage, p + 1))}>Next</Button>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ── Community forum moderation ───────────────────────────────────────────
  function ForumModeration() {
    const [tab, setTab] = React.useState("reports");
    return (
      <div className="krm-page-pad" style={{ padding: 28 }}>
        <ScreenHead title="Community forum" sub="Moderate discussions, handle reports, and manage categories." />
        <Tabs value={tab} onChange={setTab} tabs={[{ value: "reports", label: "Reports" }, { value: "threads", label: "Threads" }, { value: "categories", label: "Categories" }]} style={{ marginBottom: 20 }} />
        {tab === "reports" && <ForumReportsTab />}
        {tab === "threads" && <ForumThreadsTab />}
        {tab === "categories" && <ForumCategoriesTab />}
      </div>
    );
  }

  function ForumReportsTab() {
    const [rows, setRows] = React.useState([]);
    const [page, setPage] = React.useState(1);
    const [lastPage, setLastPage] = React.useState(1);
    const [total, setTotal] = React.useState(0);
    const [status, setStatus] = React.useState("open");
    const [loading, setLoading] = React.useState(true);
    const [busy, setBusy] = React.useState(0);

    const load = React.useCallback(function () {
      setLoading(true);
      adm.forumReports({ status: status, page: page }).then(function (d) {
        setRows(d.data || []); setLastPage(d.last_page || 1); setTotal(d.total || 0); setLoading(false);
      }).catch(function () { setLoading(false); });
    }, [status, page]);
    React.useEffect(function () { load(); }, [load]);

    const act = function (r, newStatus, action) {
      setBusy(r.id);
      adm.forumResolveReport(r.id, newStatus, action).then(function () { setBusy(0); load(); }).catch(function () { setBusy(0); });
    };

    const reasonTone = (x) => ({ spam: "danger", abuse: "danger", off_topic: "brand", other: "neutral" })[x] || "neutral";

    return (
      <div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
          {["open", "resolved", "dismissed"].map(function (s) {
            const on = status === s;
            return <button key={s} onClick={() => { setStatus(s); setPage(1); }} style={{ padding: "7px 14px", borderRadius: "var(--radius-md)", border: "1px solid " + (on ? "var(--brand)" : "var(--border-strong)"), background: on ? "var(--brand-subtle)" : "var(--surface-card)", color: on ? "var(--text-brand)" : "var(--text-muted)", cursor: "pointer", fontFamily: "var(--font-sans)", fontSize: "var(--text-sm)", fontWeight: 700, textTransform: "capitalize" }}>{s}</button>;
          })}
        </div>

        <div className="krm-table-wrap"><Card padding={0}>
          <div style={{ display: "grid", gridTemplateColumns: "90px 2.4fr 1fr 130px 1.8fr", padding: "12px 20px", fontSize: "var(--text-xs)", fontWeight: 700, letterSpacing: ".04em", textTransform: "uppercase", color: "var(--text-faint)", borderBottom: "1px solid var(--border)" }}>
            <span>Type</span><span>Content</span><span>Reporter</span><span>Reason</span><span>Actions</span>
          </div>
          {loading && <div style={{ padding: 28, textAlign: "center", color: "var(--text-muted)", fontSize: "var(--text-sm)" }}>Loading…</div>}
          {!loading && rows.length === 0 && <div style={{ padding: 28, textAlign: "center", color: "var(--text-muted)", fontSize: "var(--text-sm)" }}>No {status} reports.</div>}
          {!loading && rows.map(function (r, i) {
            return (
              <div key={r.id} style={{ display: "grid", gridTemplateColumns: "90px 2.4fr 1fr 130px 1.8fr", alignItems: "center", gap: 8, padding: "13px 20px", borderBottom: i < rows.length - 1 ? "1px solid var(--border-subtle)" : "none" }}>
                <span><Badge tone="neutral">{r.reportable_type}</Badge></span>
                <div style={{ minWidth: 0 }}>
                  {r.content_title ? <div style={{ fontWeight: 700, fontSize: "var(--text-sm)", color: "var(--text-strong)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.content_title}</div> : null}
                  <div style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.content_snippet}{r.content_hidden ? " " : ""}{r.content_hidden ? <Badge tone="neutral">hidden</Badge> : null}</div>
                </div>
                <span style={{ fontSize: "var(--text-sm)", color: "var(--text-body)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.reporter_name}</span>
                <span><Badge tone={reasonTone(r.reason)}>{String(r.reason).replace("_", " ")}</Badge></span>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                  {r.status === "open" ? (
                    <React.Fragment>
                      {r.content_hidden
                        ? <Button variant="secondary" size="sm" disabled={busy === r.id} onClick={() => act(r, "resolved", "unhide")}>Unhide</Button>
                        : <Button variant="secondary" size="sm" disabled={busy === r.id} onClick={() => act(r, "resolved", "hide")}>Hide</Button>}
                      <Button variant="danger" size="sm" disabled={busy === r.id} onClick={() => { if (confirm("Permanently delete this " + r.reportable_type + "?")) act(r, "resolved", "delete"); }}>Delete</Button>
                      <Button variant="ghost" size="sm" disabled={busy === r.id} onClick={() => act(r, "dismissed", "none")}>Dismiss</Button>
                    </React.Fragment>
                  ) : <Badge tone={r.status === "resolved" ? "success" : "neutral"}>{r.status}</Badge>}
                </div>
              </div>
            );
          })}
        </Card></div>

        {!loading && total > 0 && (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 8, marginTop: 16 }}>
            <Button variant="secondary" size="sm" disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>Previous</Button>
            <span style={{ fontSize: "var(--text-sm)", color: "var(--text-body)", fontWeight: 600 }}>Page {page} of {lastPage}</span>
            <Button variant="secondary" size="sm" disabled={page >= lastPage} onClick={() => setPage((p) => Math.min(lastPage, p + 1))}>Next</Button>
          </div>
        )}
      </div>
    );
  }

  function ForumThreadsTab() {
    const [rows, setRows] = React.useState([]);
    const [page, setPage] = React.useState(1);
    const [lastPage, setLastPage] = React.useState(1);
    const [total, setTotal] = React.useState(0);
    const [search, setSearch] = React.useState("");
    const [query, setQuery] = React.useState("");
    const [loading, setLoading] = React.useState(true);

    const load = React.useCallback(function () {
      setLoading(true);
      adm.forumAdminThreads({ page: page, q: query }).then(function (d) {
        setRows(d.data || []); setLastPage(d.last_page || 1); setTotal(d.total || 0); setLoading(false);
      }).catch(function () { setLoading(false); });
    }, [page, query]);
    React.useEffect(function () { load(); }, [load]);

    const setFlag = function (t, key) {
      const changes = {}; changes[key] = !t[key];
      adm.forumModerateThread(t.id, changes).then(function () {
        setRows((rs) => rs.map((x) => x.id === t.id ? Object.assign({}, x, changes) : x));
      }).catch(function () {});
    };
    const del = function (t) {
      if (!confirm('Delete "' + t.title + '" and all its replies?')) return;
      adm.forumDeleteThread(t.id).then(function () { load(); }).catch(function () {});
    };

    const FlagBtn = ({ t, k, label }) => (
      <button onClick={() => setFlag(t, k)} title={label} style={{ padding: "5px 9px", borderRadius: "var(--radius-sm)", border: "1px solid " + (t[k] ? "var(--brand)" : "var(--border-strong)"), background: t[k] ? "var(--brand-subtle)" : "var(--surface-card)", color: t[k] ? "var(--text-brand)" : "var(--text-muted)", cursor: "pointer", fontSize: "var(--text-xs)", fontWeight: 700, fontFamily: "var(--font-sans)" }}>{label}</button>
    );

    return (
      <div>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, height: 40, padding: "0 12px", border: "1px solid var(--border-strong)", borderRadius: "var(--radius-md)", background: "var(--surface-card)", width: 320 }}>
            <span style={{ color: "var(--text-faint)" }}>{I("search", 16)}</span>
            <input placeholder="Search threads" value={search} onChange={(e) => setSearch(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") { setPage(1); setQuery(search.trim()); } }} style={{ border: "none", outline: "none", flex: 1, fontFamily: "var(--font-sans)", fontSize: "var(--text-sm)", background: "transparent" }} />
            {query && <button onClick={() => { setSearch(""); setQuery(""); setPage(1); }} style={{ border: "none", background: "transparent", cursor: "pointer", color: "var(--text-faint)" }}>{I("x", 14)}</button>}
          </div>
          <Button variant="secondary" size="sm" onClick={() => { setPage(1); setQuery(search.trim()); }}>Search</Button>
        </div>

        <div className="krm-table-wrap"><Card padding={0}>
          <div style={{ display: "grid", gridTemplateColumns: "2.4fr 1.2fr 1fr 1.6fr 220px", padding: "12px 20px", fontSize: "var(--text-xs)", fontWeight: 700, letterSpacing: ".04em", textTransform: "uppercase", color: "var(--text-faint)", borderBottom: "1px solid var(--border)" }}>
            <span>Title</span><span>Author</span><span>Category</span><span>Stats</span><span>Moderate</span>
          </div>
          {loading && <div style={{ padding: 28, textAlign: "center", color: "var(--text-muted)", fontSize: "var(--text-sm)" }}>Loading…</div>}
          {!loading && rows.length === 0 && <div style={{ padding: 28, textAlign: "center", color: "var(--text-muted)", fontSize: "var(--text-sm)" }}>No threads found.</div>}
          {!loading && rows.map(function (t, i) {
            return (
              <div key={t.id} style={{ display: "grid", gridTemplateColumns: "2.4fr 1.2fr 1fr 1.6fr 220px", alignItems: "center", gap: 8, padding: "13px 20px", borderBottom: i < rows.length - 1 ? "1px solid var(--border-subtle)" : "none", opacity: t.is_hidden ? 0.6 : 1 }}>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontWeight: 700, fontSize: "var(--text-sm)", color: "var(--text-strong)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{t.title}</div>
                  <div style={{ display: "flex", gap: 5, marginTop: 3 }}>
                    {t.is_pinned ? <Badge tone="accent">pinned</Badge> : null}
                    {t.is_locked ? <Badge tone="neutral">locked</Badge> : null}
                    {t.is_hidden ? <Badge tone="danger">hidden</Badge> : null}
                  </div>
                </div>
                <span style={{ fontSize: "var(--text-sm)", color: "var(--text-body)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{t.author ? t.author.name : "—"}</span>
                <span style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>{t.category ? t.category.name : "—"}</span>
                <span style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>{t.reply_count || 0} replies · {t.vote_score || 0} votes · {t.views || 0} views</span>
                <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
                  <FlagBtn t={t} k="is_pinned" label="Pin" />
                  <FlagBtn t={t} k="is_locked" label="Lock" />
                  <FlagBtn t={t} k="is_hidden" label="Hide" />
                  <button onClick={() => del(t)} title="Delete" style={{ padding: "5px 9px", borderRadius: "var(--radius-sm)", border: "1px solid var(--danger)", background: "var(--surface-card)", color: "var(--danger)", cursor: "pointer", fontSize: "var(--text-xs)", fontWeight: 700, fontFamily: "var(--font-sans)" }}>{I("trash-2", 13)}</button>
                </div>
              </div>
            );
          })}
        </Card></div>

        {!loading && total > 0 && (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 8, marginTop: 16 }}>
            <Button variant="secondary" size="sm" disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>Previous</Button>
            <span style={{ fontSize: "var(--text-sm)", color: "var(--text-body)", fontWeight: 600 }}>Page {page} of {lastPage}</span>
            <Button variant="secondary" size="sm" disabled={page >= lastPage} onClick={() => setPage((p) => Math.min(lastPage, p + 1))}>Next</Button>
          </div>
        )}
      </div>
    );
  }

  function ForumCategoriesTab() {
    const [rows, setRows] = React.useState([]);
    const [loading, setLoading] = React.useState(true);
    const [editing, setEditing] = React.useState(null); // {id?, name, description, icon, color, is_active}
    const [msg, setMsg] = React.useState("");

    const BLANK = { name: "", description: "", icon: "messages-square", color: "teal", is_active: true };

    const load = React.useCallback(function () {
      setLoading(true);
      adm.forumCategories().then(function (d) { setRows(d || []); setLoading(false); }).catch(function () { setLoading(false); });
    }, []);
    React.useEffect(function () { load(); }, [load]);

    const save = function () {
      if (!editing.name.trim()) { setMsg("Name is required."); return; }
      const data = { name: editing.name, description: editing.description, icon: editing.icon, color: editing.color, is_active: editing.is_active };
      const p = editing.id ? adm.forumUpdateCategory(editing.id, data) : adm.forumCreateCategory(data);
      p.then(function () { setEditing(null); setMsg(""); load(); }).catch(function (e) { setMsg((e && e.message) || "Save failed."); });
    };
    const del = function (c) {
      if (!confirm('Delete category "' + c.name + '"?')) return;
      adm.forumDeleteCategory(c.id).then(function () { load(); }).catch(function (e) {
        alert((e && e.message) || "This category still has threads.");
      });
    };
    const toggleActive = function (c) {
      adm.forumUpdateCategory(c.id, { is_active: !c.is_active }).then(function () {
        setRows((rs) => rs.map((x) => x.id === c.id ? Object.assign({}, x, { is_active: !c.is_active }) : x));
      }).catch(function () {});
    };

    return (
      <div>
        <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 16 }}>
          <Button variant="primary" size="sm" iconLeft={I("plus", 14)} onClick={() => { setEditing(Object.assign({}, BLANK)); setMsg(""); }}>New category</Button>
        </div>

        {editing && (
          <Card padding={20} style={{ marginBottom: 18 }}>
            <div style={{ fontWeight: 700, fontSize: "var(--text-base)", color: "var(--text-strong)", marginBottom: 14 }}>{editing.id ? "Edit category" : "New category"}</div>
            {msg && <div style={{ padding: "8px 12px", background: "var(--danger-subtle)", color: "var(--danger)", borderRadius: "var(--radius-md)", fontSize: "var(--text-sm)", marginBottom: 12 }}>{msg}</div>}
            <div style={{ display: "grid", gap: 12 }}>
              <Input label="Name" value={editing.name} onChange={(e) => setEditing(Object.assign({}, editing, { name: e.target.value }))} />
              <Input label="Description" value={editing.description || ""} onChange={(e) => setEditing(Object.assign({}, editing, { description: e.target.value }))} />
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <Input label="Icon (lucide name)" value={editing.icon || ""} onChange={(e) => setEditing(Object.assign({}, editing, { icon: e.target.value }))} />
                <div>
                  <label style={{ display: "block", fontSize: "var(--text-sm)", fontWeight: 700, color: "var(--text-strong)", marginBottom: 6 }}>Colour</label>
                  <select value={editing.color || "teal"} onChange={(e) => setEditing(Object.assign({}, editing, { color: e.target.value }))} style={{ width: "100%", height: 42, padding: "0 12px", borderRadius: "var(--radius-md)", border: "1px solid var(--border-strong)", background: "var(--surface-card)", color: "var(--text-strong)", fontFamily: "var(--font-sans)", fontSize: "var(--text-sm)" }}>
                    <option value="teal">Teal</option><option value="saffron">Saffron</option><option value="dark">Dark</option>
                  </select>
                </div>
              </div>
              <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
                <input type="checkbox" checked={!!editing.is_active} onChange={(e) => setEditing(Object.assign({}, editing, { is_active: e.target.checked }))} style={{ width: 16, height: 16, accentColor: "var(--brand)" }} />
                <span style={{ fontSize: "var(--text-sm)", color: "var(--text-strong)" }}>Active (visible on the public site)</span>
              </label>
              <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
                <Button variant="secondary" onClick={() => setEditing(null)}>Cancel</Button>
                <Button variant="primary" onClick={save}>{editing.id ? "Save" : "Create"}</Button>
              </div>
            </div>
          </Card>
        )}

        <div className="krm-table-wrap"><Card padding={0}>
          <div style={{ display: "grid", gridTemplateColumns: "1.4fr 2.2fr 100px 120px 160px", padding: "12px 20px", fontSize: "var(--text-xs)", fontWeight: 700, letterSpacing: ".04em", textTransform: "uppercase", color: "var(--text-faint)", borderBottom: "1px solid var(--border)" }}>
            <span>Name</span><span>Description</span><span>Threads</span><span>Status</span><span>Actions</span>
          </div>
          {loading && <div style={{ padding: 28, textAlign: "center", color: "var(--text-muted)", fontSize: "var(--text-sm)" }}>Loading…</div>}
          {!loading && rows.map(function (c, i) {
            return (
              <div key={c.id} style={{ display: "grid", gridTemplateColumns: "1.4fr 2.2fr 100px 120px 160px", alignItems: "center", gap: 8, padding: "13px 20px", borderBottom: i < rows.length - 1 ? "1px solid var(--border-subtle)" : "none" }}>
                <span style={{ fontWeight: 700, fontSize: "var(--text-sm)", color: "var(--text-strong)" }}>{c.name}</span>
                <span style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{c.description}</span>
                <span style={{ fontSize: "var(--text-sm)", color: "var(--text-body)" }}>{c.threads_count || 0}</span>
                <span><Badge tone={c.is_active ? "success" : "neutral"}>{c.is_active ? "Active" : "Hidden"}</Badge></span>
                <div style={{ display: "flex", gap: 6 }}>
                  <Button variant="secondary" size="sm" onClick={() => { setEditing({ id: c.id, name: c.name, description: c.description || "", icon: c.icon || "messages-square", color: c.color || "teal", is_active: !!c.is_active }); setMsg(""); }}>Edit</Button>
                  <Button variant="ghost" size="sm" onClick={() => toggleActive(c)}>{c.is_active ? "Hide" : "Show"}</Button>
                  <button onClick={() => del(c)} title="Delete" style={{ padding: "6px 9px", borderRadius: "var(--radius-sm)", border: "1px solid var(--danger)", background: "var(--surface-card)", color: "var(--danger)", cursor: "pointer", fontFamily: "var(--font-sans)" }}>{I("trash-2", 13)}</button>
                </div>
              </div>
            );
          })}
        </Card></div>
      </div>
    );
  }

  function Reports() {
    const [data, setData] = React.useState(null);
    const [loading, setLoading] = React.useState(true);

    React.useEffect(function () {
      adm.fetchReportSummary().then(function (d) { setData(d); setLoading(false); }).catch(function () { setLoading(false); });
    }, []);

    const bars = (data && data.applicationsPerMonth) || [];
    const topCats = (data && data.topCategories) || [];
    const max = Math.max(1, ...bars.map((b) => b.count));
    const catMax = Math.max(1, ...topCats.map((c) => c.jobs));
    const year = (data && data.year) || new Date().getFullYear();

    const exportCsv = () => {
      // Quote every field and escape embedded quotes (RFC-4180)
      const esc = (v) => '"' + String(v).replace(/"/g, '""') + '"';
      const rows = [];
      rows.push(["Section", "Label", "Value"]);
      rows.push(["Summary", "Applications (YTD)", (data && data.applicationsYtd) || 0]);
      rows.push(["Summary", "New registrations", (data && data.newRegistrations) || 0]);
      rows.push(["Summary", "Approval rate", ((data && data.approvalRate) || 0) + "%"]);
      bars.forEach((b) => rows.push(["Applications per month", b.month, b.count]));
      topCats.forEach((c) => rows.push(["Top categories by open jobs", c.name, c.jobs]));
      const csv = rows.map((r) => r.map(esc).join(",")).join("\r\n");

      const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "krama-report-" + year + ".csv";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    };

    const fmt = (n) => (n == null ? "--" : Number(n).toLocaleString());

    // Print-to-PDF: open a print-styled report and let the browser save it as PDF (no external library).
    const exportPdf = () => {
      if (!data) return;
      const esc = (s) => String(s == null ? "" : s).replace(/[&<>]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" }[c]));
      const d = new Date();
      const MON = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
      const genDate = d.getDate() + " " + MON[d.getMonth()] + " " + d.getFullYear();
      const mMax = Math.max(1, ...bars.map((b) => b.count));
      const cMax = Math.max(1, ...topCats.map((c) => c.jobs));
      const monthRows = bars.map((b) =>
        '<tr><td>' + esc(b.month) + '</td><td class="num">' + b.count + '</td><td class="bar"><span style="width:' + Math.round((b.count / mMax) * 100) + '%"></span></td></tr>'
      ).join("");
      const catRows = topCats.length ? topCats.map((c) =>
        '<tr><td>' + esc(c.name) + '</td><td class="num">' + c.jobs + '</td><td class="bar"><span style="width:' + Math.round((c.jobs / cMax) * 100) + '%"></span></td></tr>'
      ).join("") : '<tr><td colspan="3" class="empty">No published jobs yet.</td></tr>';

      const html = '<!doctype html><html><head><meta charset="utf-8"><title>Krama Report ' + year + '</title><style>'
        + '*{box-sizing:border-box}body{font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;color:#0f172a;margin:0;padding:40px}'
        + '.hd{display:flex;justify-content:space-between;align-items:flex-end;border-bottom:3px solid #0d9488;padding-bottom:14px}'
        + '.brand{font-size:24px;font-weight:800;color:#0d9488;letter-spacing:-.02em}.sub{color:#64748b;font-size:13px;margin-top:3px}.gen{color:#94a3b8;font-size:12px}'
        + 'h2{font-size:15px;margin:26px 0 10px}'
        + '.cards{display:flex;gap:14px;margin-top:20px}.card{flex:1;border:1px solid #e2e8f0;border-radius:10px;padding:14px 16px}'
        + '.card .lbl{font-size:11px;text-transform:uppercase;letter-spacing:.05em;color:#64748b;font-weight:700}.card .val{font-size:24px;font-weight:800;margin-top:6px}'
        + 'table{width:100%;border-collapse:collapse;font-size:13px}th,td{text-align:left;padding:8px 10px;border-bottom:1px solid #eef2f6}'
        + 'th{font-size:11px;text-transform:uppercase;letter-spacing:.04em;color:#64748b}'
        + 'td.num{width:90px;text-align:right;font-variant-numeric:tabular-nums;font-weight:600}'
        + 'td.bar{width:45%}td.bar span{display:block;height:9px;border-radius:99px;background:#0d9488}.empty{color:#94a3b8;text-align:center}'
        + '@media print{body{padding:16px}}'
        + '</style></head><body>'
        + '<div class="hd"><div><div class="brand">Krama</div><div class="sub">Marketplace activity report · ' + year + '</div></div><div class="gen">Generated ' + genDate + '</div></div>'
        + '<div class="cards">'
        + '<div class="card"><div class="lbl">Applications (YTD)</div><div class="val">' + fmt(data.applicationsYtd) + '</div></div>'
        + '<div class="card"><div class="lbl">New registrations</div><div class="val">' + fmt(data.newRegistrations) + '</div></div>'
        + '<div class="card"><div class="lbl">Approval rate</div><div class="val">' + ((data.approvalRate || 0) + '%') + '</div></div>'
        + '</div>'
        + '<h2>Applications per month</h2><table><thead><tr><th>Month</th><th class="num">Count</th><th></th></tr></thead><tbody>' + monthRows + '</tbody></table>'
        + '<h2>Top categories by open jobs</h2><table><thead><tr><th>Category</th><th class="num">Open jobs</th><th></th></tr></thead><tbody>' + catRows + '</tbody></table>'
        + '</body></html>';

      const win = window.open("", "_blank");
      if (!win) { alert("Please allow pop-ups to export the PDF report."); return; }
      win.document.open();
      win.document.write(html);
      win.document.close();
      setTimeout(function () { try { win.focus(); win.print(); } catch (e) {} }, 350);
    };

    return (
      <div className="krm-page-pad" style={{ padding: 28, display: "flex", flexDirection: "column", gap: 24 }}>
        <ScreenHead title="Reports" sub={"Marketplace activity across " + year + "."}
          action={<div style={{ display: "flex", gap: 8 }}>
            <Button variant="secondary" iconLeft={I("download", 16)} onClick={exportCsv} disabled={loading || !data}>Export CSV</Button>
            <Button variant="secondary" iconLeft={I("file-text", 16)} onClick={exportPdf} disabled={loading || !data}>Download PDF</Button>
          </div>} />
        <div className="krm-stats-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16 }}>
          <StatCard label="Applications (YTD)" value={data ? fmt(data.applicationsYtd) : "--"} tone="info" icon={I("send", 22)} />
          <StatCard label="New registrations" value={data ? fmt(data.newRegistrations) : "--"} tone="brand" icon={I("user-plus", 22)} />
          <StatCard label="Approval rate" value={data ? data.approvalRate + "%" : "--"} tone="success" icon={I("circle-check-big", 22)} />
        </div>
        <Card padding={24}>
          <h2 style={{ fontSize: "var(--text-lg)", fontWeight: 700, color: "var(--text-strong)", marginBottom: 22 }}>Applications per month</h2>
          {loading ? <div style={{ color: "var(--text-muted)", fontSize: "var(--text-sm)" }}>Loading…</div> : (
          <div style={{ display: "flex", alignItems: "flex-end", gap: 12, height: 170 }}>
            {bars.map((b) => (
              <div key={b.month} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
                <div title={b.count + " applications"} style={{ width: "100%", maxWidth: 36, height: (b.count / max) * 140, background: "var(--info)", borderRadius: "var(--radius-sm) var(--radius-sm) 0 0", transition: "height var(--dur-slow) var(--ease-out)" }} />
                <span style={{ fontSize: "var(--text-xs)", color: "var(--text-faint)" }}>{b.month}</span>
              </div>
            ))}
          </div>
          )}
        </Card>
        <Card padding={24}>
          <h2 style={{ fontSize: "var(--text-lg)", fontWeight: 700, color: "var(--text-strong)", marginBottom: 18 }}>Top categories by open jobs</h2>
          {loading ? <div style={{ color: "var(--text-muted)", fontSize: "var(--text-sm)" }}>Loading…</div> :
            topCats.length === 0 ? <div style={{ color: "var(--text-muted)", fontSize: "var(--text-sm)" }}>No published jobs yet.</div> : (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {topCats.map((c) => (
              <div key={c.name} style={{ display: "flex", alignItems: "center", gap: 14 }}>
                <span style={{ width: 150, fontSize: "var(--text-sm)", fontWeight: 600, color: "var(--text-strong)" }}>{c.name}</span>
                <div style={{ flex: 1, height: 10, background: "var(--surface-sunken)", borderRadius: 99, overflow: "hidden" }}>
                  <div style={{ width: (c.jobs / catMax) * 100 + "%", height: "100%", background: "var(--brand)" }} />
                </div>
                <span style={{ width: 60, textAlign: "right", fontFamily: "var(--font-mono)", fontSize: "var(--text-sm)", color: "var(--text-body)" }}>{c.jobs.toLocaleString()}</span>
              </div>
            ))}
          </div>
          )}
        </Card>
      </div>
    );
  }

  // ===== User management -- roles & permissions ============================
  const ROLES = {
    super_admin: { label: "Super Admin", tone: "danger", desc: "Full control of the entire system." },
    admin: { label: "Admin", tone: "brand", desc: "Moderates content; no billing or role changes." },
    employer: { label: "Employer", tone: "info", desc: "Posts jobs and manages applicants." },
    candidate: { label: "Candidate", tone: "neutral", desc: "Searches and applies to jobs." },
  };

  // Numeric hierarchy — higher number = higher authority
  const ROLE_RANK = { super_admin: 4, admin: 3, employer: 2, candidate: 1 };

  // permission catalogue grouped by area
  const PERM_GROUPS = [
    { group: "Dashboard & reports", perms: [["view_dashboard", "View dashboard"], ["view_reports", "View reports"], ["view_audit", "View audit logs"]] },
    { group: "Moderation", perms: [["approve_companies", "Approve companies"], ["approve_jobs", "Approve jobs"], ["suspend_users", "Suspend users"]] },
    { group: "Content", perms: [["manage_categories", "Manage categories"], ["manage_locations", "Manage locations"], ["manage_cms", "Manage CMS pages"]] },
    { group: "Commerce", perms: [["manage_plans", "Manage plans"], ["manage_payments", "Manage payments"]] },
    { group: "Administration", perms: [["manage_users", "Manage users"], ["manage_roles", "Manage roles & permissions"], ["site_settings", "Site settings"]] },
    { group: "Employer actions", perms: [["post_jobs", "Post jobs"], ["view_applicants", "View applicants"], ["download_resume", "Download résumés"]] },
    { group: "Candidate actions", perms: [["apply_jobs", "Apply to jobs"], ["build_resume", "Build résumé"], ["save_jobs", "Save jobs"]] },
  ];
  const ALL_PERMS = PERM_GROUPS.flatMap((g) => g.perms.map((p) => p[0]));

  // default permission set per role
  const ROLE_PERMS = {
    super_admin: ALL_PERMS,
    admin: ["view_dashboard", "view_reports", "view_audit", "approve_companies", "approve_jobs", "suspend_users", "manage_categories", "manage_locations", "manage_cms"],
    employer: ["view_dashboard", "post_jobs", "view_applicants", "download_resume"],
    candidate: ["apply_jobs", "build_resume", "save_jobs"],
  };

  const USERS = [
    { id: "USR-1001", name: "Sophea Chan", email: "sophea@krama.com", role: "super_admin", status: "active", last: "2m ago" },
    { id: "USR-1002", name: "Vichea Lim", email: "vichea@krama.com", role: "admin", status: "active", last: "1h ago" },
    { id: "USR-1003", name: "Davin Ouk", email: "davin@krama.com", role: "admin", status: "active", last: "Yesterday" },
    { id: "USR-2041", name: "ABA Bank HR", email: "hr@ababank.com", role: "employer", status: "active", last: "3h ago" },
    { id: "USR-2042", name: "Smart Axiata TA", email: "talent@smart.com.kh", role: "employer", status: "active", last: "2d ago" },
    { id: "USR-2043", name: "QuickCash Ltd", email: "jobs@quickcash.kh", role: "employer", status: "suspended", last: "1w ago" },
    { id: "USR-3087", name: "Sok Dara", email: "dara.sok@email.com", role: "candidate", status: "active", last: "5m ago" },
    { id: "USR-3088", name: "Chan Mony", email: "mony.chan@email.com", role: "candidate", status: "active", last: "30m ago" },
    { id: "USR-3091", name: "Lim Chhay", email: "chhay.lim@email.com", role: "candidate", status: "suspended", last: "3w ago" },
  ];

  function RoleBadge({ role }) {
    const r = ROLES[role] || { tone: "warning", label: "Unknown role" };
    return <Badge tone={r.tone}>{r.label}</Badge>;
  }

  function PermissionDrawer({ user, onClose, onSaved, viewerRole, isSelf }) {
    const [role, setRole] = React.useState(user ? user.role : "candidate");
    const [perms, setPerms] = React.useState(user ? ROLE_PERMS[user.role] : []);
    const [saving, setSaving] = React.useState(false);
    const [err, setErr] = React.useState("");
    const [pwdNew, setPwdNew] = React.useState("");
    const [pwdConfirm, setPwdConfirm] = React.useState("");
    const [pwdBusy, setPwdBusy] = React.useState(false);
    const [pwdMsg, setPwdMsg] = React.useState(null);
    React.useEffect(() => {
      if (user) { setRole(user.role); setPerms(ROLE_PERMS[user.role] || []); setErr(""); setPwdNew(""); setPwdConfirm(""); setPwdMsg(null); }
    }, [user]);
    if (!user) return null;

    // Hierarchy guard: viewer can only edit users strictly below their own rank
    var viewerRank = ROLE_RANK[viewerRole] || 3;
    var targetRank = ROLE_RANK[user.role] || 0;
    // locked = viewer has no authority over this user's role
    var locked = !isSelf && viewerRank <= targetRank;
    // self = viewing own profile — allow password change but not role change
    var selfView = !!isSelf;
    // Roles the viewer is allowed to assign (strictly lower rank than themselves)
    var assignableRoles = Object.keys(ROLES).filter(function(k) { return ROLE_RANK[k] < viewerRank; });

    const setRoleAndDefaults = (r) => { setRole(r); setPerms(ROLE_PERMS[r] || []); };
    const toggle = (p) => setPerms((s) => s.includes(p) ? s.filter((x) => x !== p) : [...s, p]);

    const savePassword = () => {
      if (pwdNew.length < 8) { setPwdMsg({ ok: false, text: "Password must be at least 8 characters." }); return; }
      if (pwdNew !== pwdConfirm) { setPwdMsg({ ok: false, text: "Passwords do not match." }); return; }
      setPwdBusy(true); setPwdMsg(null);
      adm.changeUserPassword(user.id, pwdNew).then(() => {
        setPwdBusy(false); setPwdMsg({ ok: true, text: "Password updated successfully." });
        setPwdNew(""); setPwdConfirm("");
      }).catch((e) => { setPwdBusy(false); setPwdMsg({ ok: false, text: (e && e.message) || "Failed to update password." }); });
    };

    const save = () => {
      setSaving(true); setErr("");
      adm.updateUser(user.id, { role: role }).then((updated) => {
        setSaving(false);
        if (onSaved) onSaved(updated);
        onClose();
      }).catch((e) => { setSaving(false); setErr((e && e.message) || "Failed to update user."); });
    };

    return (
      <div onClick={onClose} style={{ position: "fixed", inset: 0, zIndex: 200, background: "var(--surface-overlay)", display: "flex", justifyContent: "flex-end", animation: "krmfade var(--dur-base) var(--ease-out)" }}>
        <div onClick={(e) => e.stopPropagation()} style={{ width: 480, maxWidth: "92vw", height: "100%", background: "var(--surface-card)", boxShadow: "var(--shadow-xl)", display: "flex", flexDirection: "column", animation: "krmslide var(--dur-base) var(--ease-out)" }}>
          {/* header */}
          <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "20px 24px", borderBottom: "1px solid var(--border)" }}>
            <Avatar name={user.name} size={44} src={user.avatar_url || undefined} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "var(--text-lg)", color: "var(--text-strong)" }}>{user.name}</div>
              <div style={{ fontSize: "var(--text-sm)", color: "var(--text-muted)" }}>{user.email}</div>
            </div>
            <IconButton aria-label="Close" onClick={onClose}>{I("x", 18)}</IconButton>
          </div>

          {/* body */}
          <div style={{ flex: 1, overflowY: "auto", padding: 24 }}>

            {/* Lock banner — shown when viewer doesn't have authority over this user */}
            {locked && (
              <div style={{ display: "flex", alignItems: "flex-start", gap: 12, padding: "14px 16px", background: "var(--warning-subtle)", border: "1px solid var(--warning-border)", borderRadius: "var(--radius-md)", marginBottom: 20 }}>
                <span style={{ color: "var(--warning)", flexShrink: 0, marginTop: 1 }}>{I("shield-alert", 18)}</span>
                <div>
                  <div style={{ fontWeight: 700, fontSize: "var(--text-sm)", color: "var(--text-strong)" }}>Read-only — insufficient privilege</div>
                  <div style={{ fontSize: "var(--text-sm)", color: "var(--text-muted)", marginTop: 2 }}>
                    You cannot modify a user whose role is equal to or higher than your own.
                    Only a <strong>Super Admin</strong> can edit {ROLES[user.role] ? ROLES[user.role].label : user.role} accounts.
                  </div>
                </div>
              </div>
            )}

            {/* Self-edit notice */}
            {selfView && !locked && (
              <div style={{ display: "flex", alignItems: "flex-start", gap: 12, padding: "12px 16px", background: "var(--info-subtle)", border: "1px solid var(--info-border)", borderRadius: "var(--radius-md)", marginBottom: 20 }}>
                <span style={{ color: "var(--info)", flexShrink: 0 }}>{I("info", 16)}</span>
                <div style={{ fontSize: "var(--text-sm)", color: "var(--text-muted)" }}>
                  This is your own account. You can change your password but not your own role.
                </div>
              </div>
            )}

            <div style={{ fontSize: "var(--text-sm)", fontWeight: 700, color: "var(--text-strong)", marginBottom: 10 }}>Role</div>
            {locked || selfView ? (
              /* Read-only role display */
              <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", background: "var(--surface-sunken)", borderRadius: "var(--radius-md)", border: "1px solid var(--border)" }}>
                <RoleBadge role={user.role} />
                <span style={{ fontSize: "var(--text-xs)", color: "var(--text-faint)", marginLeft: "auto" }}>{locked ? I("lock", 13) : I("user", 13)}</span>
              </div>
            ) : (
              <Select value={role} onChange={(e) => setRoleAndDefaults(e.target.value)}
                options={assignableRoles.map((k) => ({ value: k, label: ROLES[k].label }))} />
            )}
            <p style={{ fontSize: "var(--text-sm)", color: "var(--text-muted)", margin: "8px 0 22px" }}>{(ROLES[role] || {}).desc || ""}</p>

            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
              <div style={{ fontSize: "var(--text-sm)", fontWeight: 700, color: "var(--text-strong)" }}>Permissions</div>
              <span style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>{perms.length} of {ALL_PERMS.length} enabled</span>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 18, opacity: (locked || selfView) ? 0.55 : 1, pointerEvents: (locked || selfView) ? "none" : "auto" }}>
              {PERM_GROUPS.map((g) => (
                <div key={g.group}>
                  <div style={{ fontSize: "var(--text-xs)", fontWeight: 700, letterSpacing: ".06em", textTransform: "uppercase", color: "var(--text-faint)", marginBottom: 10 }}>{g.group}</div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    {g.perms.map(([id, label]) => (
                      <div key={id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                        <span style={{ fontSize: "var(--text-sm)", color: "var(--text-body)" }}>{label}</span>
                        <Switch checked={perms.includes(id)} onChange={() => toggle(id)} />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {err && <div style={{ marginTop: 18, padding: "10px 14px", background: "var(--danger-subtle)", color: "var(--danger)", borderRadius: "var(--radius-md)", fontSize: "var(--text-sm)" }}>{err}</div>}

            {/* Change password section — allowed for self and for users you outrank */}
            {!locked && (
              <div style={{ marginTop: 28, paddingTop: 24, borderTop: "1px solid var(--border)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                  {I("key-round", 16)}
                  <span style={{ fontSize: "var(--text-sm)", fontWeight: 700, color: "var(--text-strong)" }}>Change password</span>
                </div>
                <p style={{ fontSize: "var(--text-sm)", color: "var(--text-muted)", marginBottom: 14 }}>Set a new password for this user. Min. 8 characters.</p>
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  <Input label="New password" type="password" value={pwdNew} onChange={(e) => { setPwdNew(e.target.value); setPwdMsg(null); }} placeholder="At least 8 characters" />
                  <Input label="Confirm password" type="password" value={pwdConfirm} onChange={(e) => { setPwdConfirm(e.target.value); setPwdMsg(null); }} placeholder="••••••••" />
                  {pwdMsg && (
                    <div style={{ padding: "9px 13px", borderRadius: "var(--radius-md)", fontSize: "var(--text-sm)", fontWeight: 500, background: pwdMsg.ok ? "var(--success-subtle)" : "var(--danger-subtle)", color: pwdMsg.ok ? "var(--success)" : "var(--danger)" }}>
                      {pwdMsg.text}
                    </div>
                  )}
                  <Button variant="secondary" disabled={pwdBusy || !pwdNew} onClick={savePassword}>{pwdBusy ? "Updating…" : "Set password"}</Button>
                </div>
              </div>
            )}
          </div>

          {/* footer */}
          <div style={{ display: "flex", gap: 10, padding: "16px 24px", borderTop: "1px solid var(--border)" }}>
            <Button variant="ghost" onClick={onClose}>Close</Button>
            {!locked && !selfView && (
              <Button variant="primary" block disabled={saving} onClick={save}>{saving ? "Saving…" : "Save role"}</Button>
            )}
          </div>
        </div>
        <style>{`
          @keyframes krmfade { from { opacity: 0 } to { opacity: 1 } }
          @keyframes krmslide { from { transform: translateX(40px); opacity: .4 } to { transform: none; opacity: 1 } }
        `}</style>
      </div>
    );
  }

  function AddUserModal({ open, onClose, onCreated, viewerRole }) {
    const [name, setName] = React.useState("");
    const [email, setEmail] = React.useState("");
    const [password, setPassword] = React.useState("");
    const [showPw, setShowPw] = React.useState(false);
    const [role, setRole] = React.useState("candidate");
    const [status, setStatus] = React.useState("active");
    const [error, setError] = React.useState("");
    const [saving, setSaving] = React.useState(false);

    // Only roles strictly below the viewer's rank can be created
    var viewerRank = ROLE_RANK[viewerRole] || 3;
    var creatableRoles = Object.keys(ROLES).filter(function(k) { return ROLE_RANK[k] < viewerRank; });

    React.useEffect(() => {
      if (open) {
        var defaultRole = creatableRoles.includes("candidate") ? "candidate" : (creatableRoles[creatableRoles.length - 1] || "candidate");
        setName(""); setEmail(""); setPassword(""); setRole(defaultRole); setStatus("active"); setError(""); setSaving(false); setShowPw(false);
      }
    }, [open]);

    if (!open) return null;

    const submit = () => {
      if (!name.trim()) { setError("Full name is required."); return; }
      if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) { setError("Please enter a valid email address."); return; }
      if (password.length < 8) { setError("Password must be at least 8 characters."); return; }
      setError(""); setSaving(true);
      adm.createUser({ name: name.trim(), email: email.trim(), password, role, status })
        .then((user) => { setSaving(false); onCreated(user); onClose(); })
        .catch((err) => { setSaving(false); setError(err && err.message ? err.message : "Failed to create user. Email may already be taken."); });
    };

    return (
      <div onClick={onClose} style={{ position: "fixed", inset: 0, zIndex: 200, background: "var(--surface-overlay)", display: "flex", alignItems: "center", justifyContent: "center", padding: 24, animation: "krmfade var(--dur-base) var(--ease-out)" }}>
        <div onClick={(e) => e.stopPropagation()} style={{ width: "100%", maxWidth: 460, background: "var(--surface-card)", borderRadius: "var(--radius-xl)", boxShadow: "var(--shadow-xl)", overflow: "hidden" }}>
          {/* Header */}
          <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "20px 24px", borderBottom: "1px solid var(--border)" }}>
            <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 40, height: 40, borderRadius: "var(--radius-md)", background: "var(--brand-subtle)", color: "var(--brand)" }}>{I("user-plus", 20)}</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "var(--text-lg)", color: "var(--text-strong)" }}>Add new user</div>
              <div style={{ fontSize: "var(--text-sm)", color: "var(--text-muted)" }}>Create an account directly — no email invite needed.</div>
            </div>
            <IconButton aria-label="Close" onClick={onClose}>{I("x", 18)}</IconButton>
          </div>
          {/* Body */}
          <div style={{ padding: 24, display: "flex", flexDirection: "column", gap: 16 }}>
            <Input label="Full name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Sok Dara" />
            <Input label="Email address" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@example.com" iconLeft={I("mail", 16)} />
            {/* Password with show/hide toggle */}
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <label style={{ fontSize: "var(--text-sm)", fontWeight: 600, color: "var(--text-strong)" }}>Password</label>
              <div style={{ display: "flex", alignItems: "center", border: "1px solid var(--border-strong)", borderRadius: "var(--radius-md)", background: "var(--surface-input)", overflow: "hidden" }}>
                <input
                  type={showPw ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min. 8 characters"
                  style={{ flex: 1, border: "none", outline: "none", padding: "0 12px", height: 40, fontFamily: "var(--font-sans)", fontSize: "var(--text-sm)", background: "transparent", color: "var(--text-body)" }}
                />
                <button type="button" onClick={() => setShowPw(!showPw)} style={{ border: "none", background: "none", cursor: "pointer", padding: "0 12px", color: "var(--text-faint)", display: "flex", alignItems: "center" }}>
                  {I(showPw ? "eye-off" : "eye", 16)}
                </button>
              </div>
            </div>
            {/* Role */}
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <label style={{ fontSize: "var(--text-sm)", fontWeight: 600, color: "var(--text-strong)" }}>Role</label>
              <Select value={role} onChange={(e) => setRole(e.target.value)} options={creatableRoles.map((k) => ({ value: k, label: ROLES[k].label }))} />
              <span style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>{ROLES[role] && ROLES[role].desc}</span>
            </div>
            {/* Status */}
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <label style={{ fontSize: "var(--text-sm)", fontWeight: 600, color: "var(--text-strong)" }}>Account status</label>
              <Select value={status} onChange={(e) => setStatus(e.target.value)} options={[{ value: "active", label: "Active" }, { value: "suspended", label: "Suspended" }, { value: "pending", label: "Pending" }]} />
            </div>
            {error && <div style={{ padding: "10px 14px", background: "var(--danger-subtle)", color: "var(--danger)", borderRadius: "var(--radius-md)", fontSize: "var(--text-sm)" }}>{error}</div>}
          </div>
          {/* Footer */}
          <div style={{ display: "flex", gap: 10, padding: "16px 24px", borderTop: "1px solid var(--border)" }}>
            <Button variant="ghost" onClick={onClose} disabled={saving}>Cancel</Button>
            <Button variant="primary" block onClick={submit} disabled={saving}>{saving ? "Creating…" : "Create user"}</Button>
          </div>
        </div>
      </div>
    );
  }

  function MyProfile({ user, onUserUpdate }) {
    const { Input, Button, Card, Avatar } = window.KramaDesignSystem_1a6f65;
    const Textarea = window.KramaDesignSystem_1a6f65.Textarea;
    const [name, setName] = React.useState(user ? user.name || "" : "");
    const [phone, setPhone] = React.useState(user ? user.phone || "" : "");
    const [bio, setBio] = React.useState(user ? user.bio || "" : "");
    const [preview, setPreview] = React.useState(user ? user.avatar_url || "" : "");
    const [busy, setBusy] = React.useState(false);
    const [uploading, setUploading] = React.useState(false);
    const [saved, setSaved] = React.useState(false);
    const fileRef = React.useRef(null);
    const [curPwd, setCurPwd] = React.useState("");
    const [newPwd, setNewPwd] = React.useState("");
    const [conPwd, setConPwd] = React.useState("");
    const [pwdBusy, setPwdBusy] = React.useState(false);
    const [pwdMsg, setPwdMsg] = React.useState(null);
    function changePwd() {
      if (!curPwd || !newPwd || !conPwd) { setPwdMsg({ ok: false, text: "All fields are required." }); return; }
      if (newPwd !== conPwd) { setPwdMsg({ ok: false, text: "New passwords do not match." }); return; }
      if (newPwd.length < 8) { setPwdMsg({ ok: false, text: "Password must be at least 8 characters." }); return; }
      setPwdBusy(true); setPwdMsg(null);
      adm.changePassword(curPwd, newPwd).then(() => {
        setPwdBusy(false); setPwdMsg({ ok: true, text: "Password updated!" });
        setCurPwd(""); setNewPwd(""); setConPwd("");
      }).catch(e => { setPwdBusy(false); setPwdMsg({ ok: false, text: (e && e.message) || "Failed to update password." }); });
    }

    function onFileChange(e) {
      const file = e.target.files && e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = ev => setPreview(ev.target.result);
      reader.readAsDataURL(file);
      setUploading(true); setSaved(false);
      compressImage(file, 400, 0.82).then(compressed => adm.uploadAvatar(compressed)).then(u => {
        setPreview(u.avatar_url || "");
        if (onUserUpdate) onUserUpdate(u);
        setUploading(false); setSaved(true);
      }).catch(err => { alert(err.message || "Upload failed."); setUploading(false); });
    }

    function save() {
      setBusy(true); setSaved(false);
      adm.updateMe({ name, phone, bio }).then(u => {
        if (onUserUpdate) onUserUpdate(u);
        setSaved(true); setBusy(false);
      }).catch(err => { alert(err.message || "Save failed."); setBusy(false); });
    }

    return (
      <div className="krm-page-pad" style={{ padding: 28, maxWidth: 720 }}>
        <div style={{ marginBottom: 20 }}>
          <h2 style={{ fontSize: "var(--text-xl)", fontWeight: 700, color: "var(--text-strong)" }}>My Profile</h2>
          <p style={{ fontSize: "var(--text-sm)", color: "var(--text-muted)", marginTop: 4 }}>Update your personal information and photo.</p>
        </div>
        <Card padding={24}>
          <div style={{ display: "flex", gap: 20, alignItems: "center", marginBottom: 24 }}>
            <div style={{ position: "relative", flexShrink: 0 }}>
              <Avatar name={name || "?"} size={72} src={preview || undefined} />
              <button onClick={() => fileRef.current && fileRef.current.click()} disabled={uploading} style={{ position: "absolute", bottom: 0, right: 0, width: 26, height: 26, borderRadius: "50%", background: "var(--brand)", border: "2px solid var(--surface-card)", cursor: "pointer", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center" }}>
                {uploading ? <span style={{ fontSize: 10 }}>…</span> : I("camera", 13)}
              </button>
              <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }} onChange={onFileChange} />
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: "var(--text-md)", color: "var(--text-strong)" }}>{name}</div>
              <div style={{ fontSize: "var(--text-sm)", color: "var(--text-muted)", marginTop: 2 }}>{user ? user.email : ""}</div>
              <button onClick={() => fileRef.current && fileRef.current.click()} disabled={uploading} style={{ marginTop: 8, border: "none", background: "transparent", cursor: "pointer", color: "var(--text-brand)", fontSize: "var(--text-sm)", fontFamily: "var(--font-sans)", padding: 0 }}>{uploading ? "Uploading…" : "Change photo"}</button>
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <Input label="Full name" value={name} onChange={e => setName(e.target.value)} />
            <div className="krm-form-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <Input label="Email" value={user ? user.email : ""} disabled iconLeft={I("mail", 16)} />
              <Input label="Phone" value={phone} onChange={e => setPhone(e.target.value)} iconLeft={I("phone", 16)} />
            </div>
            {Textarea && <Textarea label="Bio / Description" value={bio} onChange={e => setBio(e.target.value)} rows={4} placeholder="A short description about yourself…" />}
            {!Textarea && <div><label style={{ fontSize: "var(--text-sm)", fontWeight: 600, color: "var(--text-body)", display: "block", marginBottom: 6 }}>Bio / Description</label><textarea value={bio} onChange={e => setBio(e.target.value)} rows={4} placeholder="A short description about yourself…" style={{ width: "100%", padding: "10px 12px", border: "1px solid var(--border)", borderRadius: "var(--radius-md)", fontFamily: "var(--font-sans)", fontSize: "var(--text-sm)", resize: "vertical", boxSizing: "border-box" }} /></div>}
            {saved && <div style={{ fontSize: "var(--text-sm)", color: "var(--success)" }}>Changes saved!</div>}
            <div style={{ paddingTop: 6 }}>
              <Button variant="primary" disabled={busy} onClick={save}>{busy ? "Saving…" : "Save changes"}</Button>
            </div>
          </div>
        </Card>
        <Card padding={24} style={{ marginTop: 20 }}>
          <h3 style={{ fontSize: "var(--text-base)", fontWeight: 700, color: "var(--text-strong)", marginBottom: 4 }}>Change password</h3>
          <p style={{ fontSize: "var(--text-sm)", color: "var(--text-muted)", marginBottom: 18 }}>Choose a strong password of at least 8 characters.</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <Input label="Current password" type="password" value={curPwd} onChange={e => setCurPwd(e.target.value)} placeholder="••••••••" />
            <div className="krm-form-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              <Input label="New password" type="password" value={newPwd} onChange={e => setNewPwd(e.target.value)} placeholder="At least 8 characters" />
              <Input label="Confirm new password" type="password" value={conPwd} onChange={e => setConPwd(e.target.value)} placeholder="••••••••" />
            </div>
            {pwdMsg && <div style={{ fontSize: "var(--text-sm)", color: pwdMsg.ok ? "var(--success)" : "var(--danger)", fontWeight: 600 }}>{pwdMsg.text}</div>}
            <div style={{ paddingTop: 4 }}>
              <Button variant="primary" disabled={pwdBusy} onClick={changePwd}>{pwdBusy ? "Updating…" : "Update password"}</Button>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  // ── Reusable inline CRUD list ──────────────────────────────────────────────
  function RefDataModal({ title, item, fields, onClose, onSave }) {
    const blank = {};
    fields.forEach(function(f) { blank[f.key] = item ? (item[f.key] !== undefined ? item[f.key] : "") : (f.default !== undefined ? f.default : ""); });
    const [form, setForm] = React.useState(blank);
    const [saving, setSaving] = React.useState(false);
    const [err, setErr] = React.useState("");
    const set = (k, v) => setForm(function(f) { return Object.assign({}, f, { [k]: v }); });
    const save = () => {
      setSaving(true); setErr("");
      onSave(form)
        .then(function() { setSaving(false); onClose(); })
        .catch(function(e) { setSaving(false); setErr((e && e.message) || "Save failed."); });
    };
    return (
      <div style={{ position: "fixed", inset: 0, zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div onClick={onClose} style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.45)" }} />
        <div style={{ position: "relative", background: "var(--surface-card)", borderRadius: "var(--radius-lg)", boxShadow: "var(--shadow-xl)", width: "100%", maxWidth: 420, padding: 28, zIndex: 201 }}>
          <div style={{ fontWeight: 700, fontSize: "var(--text-lg)", color: "var(--text-strong)", marginBottom: 20 }}>{item ? "Edit" : "New"} {title}</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {fields.map(function(f) {
              if (f.type === "select") return (
                <Select key={f.key} label={f.label} value={form[f.key]} onChange={function(e) { set(f.key, e.target.value); }} options={f.options} />
              );
              return <Input key={f.key} label={f.label} value={form[f.key]} onChange={function(e) { set(f.key, e.target.value); }} placeholder={f.placeholder || ""} />;
            })}
            {err && <div style={{ padding: "8px 12px", background: "var(--danger-subtle)", color: "var(--danger)", borderRadius: "var(--radius-md)", fontSize: "var(--text-sm)" }}>{err}</div>}
            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", paddingTop: 4 }}>
              <Button variant="secondary" onClick={onClose}>Cancel</Button>
              <Button variant="primary" onClick={save} disabled={saving}>{saving ? "Saving…" : "Save"}</Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  function DeleteConfirm({ label, onClose, onConfirm }) {
    return (
      <div style={{ position: "fixed", inset: 0, zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div onClick={onClose} style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.45)" }} />
        <div style={{ position: "relative", background: "var(--surface-card)", borderRadius: "var(--radius-lg)", boxShadow: "var(--shadow-xl)", width: "100%", maxWidth: 360, margin: "0 16px", padding: 28, zIndex: 201, boxSizing: "border-box" }}>
          <div style={{ fontWeight: 700, fontSize: "var(--text-md)", color: "var(--text-strong)", marginBottom: 10 }}>Delete "{label}"?</div>
          <div style={{ fontSize: "var(--text-sm)", color: "var(--text-muted)", marginBottom: 20 }}>This cannot be undone.</div>
          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
            <Button variant="secondary" onClick={onClose}>Cancel</Button>
            <Button variant="danger" onClick={onConfirm}>Delete</Button>
          </div>
        </div>
      </div>
    );
  }

  // ── Locations tab ──────────────────────────────────────────────────────────
  function LocationsTab() {
    const [items, setItems] = React.useState([]);
    const [loading, setLoading] = React.useState(true);
    const [modal, setModal] = React.useState(null); // null | { item: obj|null }
    const [deleting, setDeleting] = React.useState(null);
    const [err, setErr] = React.useState("");
    const [search, setSearch] = React.useState("");

    React.useEffect(function() {
      adm.fetchLocations().then(function(d) { setItems(d); setLoading(false); }).catch(function() { setLoading(false); });
    }, []);

    const TYPE_LABEL = { country: "Country", province: "Province", city: "City" };
    const TYPE_TONE = { country: "info", province: "brand", city: "neutral" };

    const fields = [
      { key: "name", label: "Name", placeholder: "e.g. Phnom Penh" },
      { key: "type", label: "Type", type: "select", default: "city", options: [{ value: "country", label: "Country" }, { value: "province", label: "Province" }, { value: "city", label: "City" }] },
    ];

    const onSave = (form) => {
      if (modal.item) {
        return adm.updateLocation(modal.item.id, form).then(function(updated) {
          setItems(function(prev) { return prev.map(function(x) { return x.id === updated.id ? updated : x; }); });
        });
      }
      return adm.createLocation(form).then(function(created) {
        setItems(function(prev) { return [created].concat(prev); });
      });
    };

    const doDelete = () => {
      adm.deleteLocation(deleting.id).then(function() {
        setItems(function(prev) { return prev.filter(function(x) { return x.id !== deleting.id; }); });
        setDeleting(null);
      }).catch(function(e) { setErr((e && e.message) || "Delete failed."); setDeleting(null); });
    };

    const filtered = search ? items.filter(function(x) { return x.name.toLowerCase().includes(search.toLowerCase()); }) : items;

    return (
      <div>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, height: 38, padding: "0 12px", border: "1px solid var(--border-strong)", borderRadius: "var(--radius-md)", background: "var(--surface-card)", flex: 1, maxWidth: 300 }}>
            {I("search", 15)} <input value={search} onChange={function(e) { setSearch(e.target.value); }} placeholder="Search locations…" style={{ border: "none", outline: "none", flex: 1, fontFamily: "var(--font-sans)", fontSize: "var(--text-sm)" }} />
          </div>
          <Button variant="primary" iconLeft={I("plus", 15)} onClick={function() { setModal({ item: null }); }}>New location</Button>
        </div>
        {err && <div style={{ marginBottom: 12, padding: "8px 12px", background: "var(--danger-subtle)", color: "var(--danger)", borderRadius: "var(--radius-md)", fontSize: "var(--text-sm)" }}>{err}</div>}
        {loading ? <div style={{ color: "var(--text-muted)", padding: 16 }}>Loading…</div> : (
          <Card padding={0}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid var(--border)" }}>
                  {["Name", "Type", ""].map(function(h) { return <th key={h} style={{ padding: "10px 16px", textAlign: "left", fontSize: "var(--text-xs)", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>{h}</th>; })}
                </tr>
              </thead>
              <tbody>
                {filtered.map(function(loc) {
                  return (
                    <tr key={loc.id} style={{ borderBottom: "1px solid var(--border-subtle)" }}>
                      <td style={{ padding: "11px 16px", fontWeight: 600, color: "var(--text-strong)", fontSize: "var(--text-sm)" }}>{loc.name}</td>
                      <td style={{ padding: "11px 16px" }}><Badge tone={TYPE_TONE[loc.type] || "neutral"}>{TYPE_LABEL[loc.type] || loc.type}</Badge></td>
                      <td style={{ padding: "11px 16px", textAlign: "right" }}>
                        <div style={{ display: "inline-flex", gap: 6 }}>
                          <button onClick={function() { setModal({ item: loc }); }} title="Edit" style={{ border: "none", background: "none", cursor: "pointer", color: "var(--text-muted)", display: "inline-flex", padding: 4 }}>{I("pencil", 15)}</button>
                          <button onClick={function() { setDeleting(loc); }} title="Delete" style={{ border: "none", background: "none", cursor: "pointer", color: "var(--danger)", display: "inline-flex", padding: 4 }}>{I("trash-2", 15)}</button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {filtered.length === 0 && <tr><td colSpan={3} style={{ padding: "24px 16px", color: "var(--text-muted)", textAlign: "center", fontSize: "var(--text-sm)" }}>No locations found.</td></tr>}
              </tbody>
            </table>
          </Card>
        )}
        {modal && <RefDataModal title="Location" item={modal.item} fields={fields} onClose={function() { setModal(null); }} onSave={onSave} />}
        {deleting && <DeleteConfirm label={deleting.name} onClose={function() { setDeleting(null); }} onConfirm={doDelete} />}
      </div>
    );
  }

  // ── Experience Levels tab ──────────────────────────────────────────────────
  function ExperienceLevelsTab() {
    const [items, setItems] = React.useState([]);
    const [loading, setLoading] = React.useState(true);
    const [modal, setModal] = React.useState(null);
    const [deleting, setDeleting] = React.useState(null);
    const [err, setErr] = React.useState("");

    React.useEffect(function() {
      adm.fetchExperienceLevels().then(function(d) { setItems(d); setLoading(false); }).catch(function() { setLoading(false); });
    }, []);

    const fields = [
      { key: "name", label: "Name", placeholder: "e.g. Senior" },
      { key: "slug", label: "Slug (auto-generated if blank)", placeholder: "e.g. senior" },
      { key: "sort_order", label: "Sort order", placeholder: "0" },
      { key: "status", label: "Status", type: "select", default: "active", options: [{ value: "active", label: "Active" }, { value: "inactive", label: "Inactive" }] },
    ];

    const onSave = (form) => {
      if (modal.item) {
        return adm.updateExperienceLevel(modal.item.id, form).then(function(updated) {
          setItems(function(prev) { return prev.map(function(x) { return x.id === updated.id ? updated : x; }); });
        });
      }
      return adm.createExperienceLevel(form).then(function(created) {
        setItems(function(prev) { return prev.concat([created]).sort(function(a,b){ return (a.sort_order||0)-(b.sort_order||0); }); });
      });
    };

    const doDelete = () => {
      adm.deleteExperienceLevel(deleting.id).then(function() {
        setItems(function(prev) { return prev.filter(function(x) { return x.id !== deleting.id; }); });
        setDeleting(null);
      }).catch(function(e) { setErr((e && e.message) || "Delete failed."); setDeleting(null); });
    };

    return (
      <div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", marginBottom: 16 }}>
          <Button variant="primary" iconLeft={I("plus", 15)} onClick={function() { setModal({ item: null }); }}>New level</Button>
        </div>
        {err && <div style={{ marginBottom: 12, padding: "8px 12px", background: "var(--danger-subtle)", color: "var(--danger)", borderRadius: "var(--radius-md)", fontSize: "var(--text-sm)" }}>{err}</div>}
        {loading ? <div style={{ color: "var(--text-muted)", padding: 16 }}>Loading…</div> : (
          <div className="krm-table-wrap"><Card padding={0}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid var(--border)" }}>
                  {["Order", "Name", "Slug", "Status", ""].map(function(h) { return <th key={h} style={{ padding: "10px 16px", textAlign: "left", fontSize: "var(--text-xs)", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>{h}</th>; })}
                </tr>
              </thead>
              <tbody>
                {items.map(function(lvl) {
                  return (
                    <tr key={lvl.id} style={{ borderBottom: "1px solid var(--border-subtle)" }}>
                      <td style={{ padding: "11px 16px", color: "var(--text-faint)", fontSize: "var(--text-sm)", width: 60 }}>{lvl.sort_order}</td>
                      <td style={{ padding: "11px 16px", fontWeight: 600, color: "var(--text-strong)", fontSize: "var(--text-sm)" }}>{lvl.name}</td>
                      <td style={{ padding: "11px 16px", fontFamily: "var(--font-mono)", fontSize: "var(--text-xs)", color: "var(--text-faint)" }}>{lvl.slug}</td>
                      <td style={{ padding: "11px 16px" }}><Badge tone={lvl.status === "active" ? "success" : "neutral"}>{lvl.status === "active" ? "Active" : "Inactive"}</Badge></td>
                      <td style={{ padding: "11px 16px", textAlign: "right" }}>
                        <div style={{ display: "inline-flex", gap: 6 }}>
                          <button onClick={function() { setModal({ item: lvl }); }} title="Edit" style={{ border: "none", background: "none", cursor: "pointer", color: "var(--text-muted)", display: "inline-flex", padding: 4 }}>{I("pencil", 15)}</button>
                          <button onClick={function() { setDeleting(lvl); }} title="Delete" style={{ border: "none", background: "none", cursor: "pointer", color: "var(--danger)", display: "inline-flex", padding: 4 }}>{I("trash-2", 15)}</button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {items.length === 0 && <tr><td colSpan={5} style={{ padding: "24px 16px", color: "var(--text-muted)", textAlign: "center", fontSize: "var(--text-sm)" }}>No experience levels yet.</td></tr>}
              </tbody>
            </table>
          </Card></div>
        )}
        {modal && <RefDataModal title="Experience Level" item={modal.item} fields={fields} onClose={function() { setModal(null); }} onSave={onSave} />}
        {deleting && <DeleteConfirm label={deleting.name} onClose={function() { setDeleting(null); }} onConfirm={doDelete} />}
      </div>
    );
  }

  // ===== Brand settings =====
  const BRAND_KEY = "krama_brand_settings";
  function loadBrandLocal() { try { return JSON.parse(localStorage.getItem(BRAND_KEY) || "{}"); } catch(e) { return {}; } }
  function syncBrandLocal(b) { try { localStorage.setItem(BRAND_KEY, JSON.stringify(b)); window.KRAMA_LOGO_SRC = b.logoUrl || null; window.KRAMA_BRAND_NAME = b.brandName || "KRAMA"; } catch(e) {} }

  function Brand() {
    const [b, setB] = React.useState(loadBrandLocal);
    const [saved, setSaved] = React.useState(true);
    const [reloading, setReloading] = React.useState(false);
    const [err, setErr] = React.useState("");
    const [loading, setLoading] = React.useState(true);
    const set = (k, v) => { setB((prev) => Object.assign({}, prev, { [k]: v })); setSaved(false); setReloading(false); setErr(""); };

    // Load from API on mount — overwrites stale localStorage
    React.useEffect(function() {
      window.KRAMA_ADMIN_API.fetchSettings("brand").then(function(data) {
        if (data && typeof data === "object") {
          setB(data);
          syncBrandLocal(data);
        }
      }).catch(function() {}).finally(function() { setLoading(false); });
    }, []);

    const save = () => {
      setErr("");
      window.KRAMA_ADMIN_API.updateSettings("brand", b).then(function(saved_data) {
        syncBrandLocal(saved_data || b);
        setSaved(true);
        setReloading(true);
        // Hard reload to apply new logo everywhere
        setTimeout(() => { window.location.href = window.location.pathname + '?_r=' + Date.now(); }, 400);
      }).catch(function(e) {
        setErr("Save failed: " + (e && e.message ? e.message : "Server error. Try using a hosted image URL instead of uploading."));
      });
    };
    const defaultLogo = "../../assets/krama-mark.svg";
    const previewSrc = b.logoUrl || defaultLogo;
    // Resize + compress uploaded image to keep it well under localStorage limits (~200 KB target)
    const handleFileUpload = (e) => {
      const file = e.target.files && e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        const raw = ev.target.result;
        // SVG files cannot be safely drawn onto canvas (CORS/taint issues) — use the raw data URI directly
        if (file.type === "image/svg+xml") { set("logoUrl", raw); return; }
        const img = new Image();
        img.onload = () => {
          const MAX = 400; // max dimension in px — enough for a logo at 2×
          const scale = Math.min(1, MAX / Math.max(img.width, img.height));
          const canvas = document.createElement("canvas");
          canvas.width = Math.round(img.width * scale);
          canvas.height = Math.round(img.height * scale);
          canvas.getContext("2d").drawImage(img, 0, 0, canvas.width, canvas.height);
          const dataUrl = file.type === "image/png" ? canvas.toDataURL("image/png") : canvas.toDataURL("image/jpeg", 0.88);
          set("logoUrl", dataUrl);
        };
        img.src = raw;
      };
      reader.readAsDataURL(file);
    };
    return (
      <div className="krm-page-pad" style={{ padding: 28, maxWidth: 780 }}>
        <ScreenHead title="Brand settings" sub="Changes apply across the public website, Admin Console, Candidate dashboard, and Employer dashboard."
          action={<Button variant={saved ? "secondary" : "primary"} iconLeft={I("save", 16)} onClick={save}>{reloading ? "Saved — reloading…" : saved ? "Saved" : "Save & apply"}</Button>} />

        {/* Logo */}
        <Card padding={24} style={{ marginBottom: 20 }}>
          <h3 style={{ fontSize: "var(--text-lg)", fontWeight: 700, color: "var(--text-strong)", marginBottom: 4, display: "flex", alignItems: "center", gap: 8 }}>
            {I("image", 18)} Logo
          </h3>
          <p style={{ fontSize: "var(--text-sm)", color: "var(--text-muted)", marginBottom: 20 }}>Upload a custom logo image (PNG, SVG, JPG). Recommended height 36-42 px, transparent background.</p>
          <div style={{ display: "flex", alignItems: "center", gap: 24, flexWrap: "wrap" }}>
            {/* Preview */}
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 20px", background: "#fff", border: "1px solid var(--border)", borderRadius: "var(--radius-md)" }}>
                <img src={previewSrc} height="36" alt="Logo preview" style={{ maxWidth: 140, objectFit: "contain" }} />
                <span style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "var(--text-lg)", letterSpacing: ".08em", color: "var(--text-strong)" }}>{b.brandName || "KRAMA"}</span>
              </div>
              <div style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>Light background preview</div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 20px", background: "var(--stone-900)", border: "1px solid var(--border)", borderRadius: "var(--radius-md)" }}>
                <img src={previewSrc} height="36" alt="Logo preview" style={{ maxWidth: 140, objectFit: "contain", filter: b.logoUrl ? "none" : "brightness(0) invert(1)" }} />
                <span style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "var(--text-lg)", letterSpacing: ".08em", color: "#fff" }}>{b.brandName || "KRAMA"}</span>
              </div>
              <div style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>Dark background preview</div>
            </div>
          </div>
          <div style={{ marginTop: 20, display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
            <label style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "9px 18px", background: "var(--brand)", color: "#fff", borderRadius: "var(--radius-md)", fontWeight: 700, fontSize: "var(--text-sm)", cursor: "pointer", fontFamily: "var(--font-sans)" }}>
              {I("upload", 16)} Upload logo
              <input type="file" accept="image/*" onChange={handleFileUpload} style={{ display: "none" }} />
            </label>
            <Input label="" value={b.logoUrl && !b.logoUrl.startsWith("data:") ? b.logoUrl : ""} onChange={(e) => set("logoUrl", e.target.value)} placeholder="Or paste an image URL (https://…)" style={{ flex: 1, minWidth: 260 }} iconLeft={I("link", 16)} />
            {b.logoUrl && (
              <Button variant="ghost" size="sm" onClick={() => { set("logoUrl", ""); }} iconLeft={I("rotate-ccw", 14)}>Reset to default</Button>
            )}
          </div>
        </Card>

        {/* Brand name */}
        <Card padding={24} style={{ marginBottom: 20 }}>
          <h3 style={{ fontSize: "var(--text-lg)", fontWeight: 700, color: "var(--text-strong)", marginBottom: 4, display: "flex", alignItems: "center", gap: 8 }}>
            {I("type", 18)} Brand name
          </h3>
          <p style={{ fontSize: "var(--text-sm)", color: "var(--text-muted)", marginBottom: 16 }}>The text shown next to the logo in headers. Defaults to "KRAMA".</p>
          <Input label="Brand name" value={b.brandName || ""} onChange={(e) => set("brandName", e.target.value)} placeholder="KRAMA" style={{ maxWidth: 320 }} />
        </Card>

        {err && (
          <div style={{ marginBottom: 16, padding: "12px 16px", background: "var(--danger-subtle)", border: "1px solid var(--danger)", borderRadius: "var(--radius-md)", fontSize: "var(--text-sm)", color: "var(--danger)", display: "flex", gap: 8, alignItems: "flex-start" }}>
            {I("alert-circle", 16)}<span>{err}</span>
          </div>
        )}
        {!saved && <p style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)", marginTop: 4 }}>Page will reload automatically to apply the new logo everywhere.</p>}
      </div>
    );
  }

  function Settings({ authUser }) {
    const [tab, setTab] = React.useState("users");
    const [filter, setFilter] = React.useState("all");
    const [editing, setEditing] = React.useState(null);
    const [users, setUsers] = React.useState([]);
    const [usersLoading, setUsersLoading] = React.useState(true);
    const [searchInput, setSearchInput] = React.useState("");
    const [search, setSearch] = React.useState("");
    const [inviting, setInviting] = React.useState(false);

    // Derive the logged-in user's role slug and rank
    var viewerSlug = authUser && authUser.role ? (authUser.role.slug || authUser.role) : "admin";
    var viewerRank = ROLE_RANK[viewerSlug] || 3;
    var canEditUser = function(u) { return (ROLE_RANK[u.role] || 0) < viewerRank; };
    var isSelfUser = function(u) { return authUser && String(u.id) === String(authUser.id); };

    const fmtAgo = (iso) => {
      if (!iso) return "Never";
      var d = new Date(iso), now = new Date(), diff = Math.floor((now - d) / 1000);
      if (diff < 60) return diff + "s ago";
      if (diff < 3600) return Math.floor(diff / 60) + "m ago";
      if (diff < 86400) return Math.floor(diff / 3600) + "h ago";
      if (diff < 604800) return Math.floor(diff / 86400) + "d ago";
      return d.getDate() + " " + ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"][d.getMonth()];
    };

    const normalize = (u) => ({
      id: u.id, name: u.name, email: u.email, avatar_url: u.avatar_url || "",
      role: (u.role && u.role.slug) || "unknown",
      status: u.status || "active",
      last: fmtAgo(u.last_active_at),
    });

    React.useEffect(() => {
      var t = setTimeout(() => setSearch(searchInput), 350);
      return () => clearTimeout(t);
    }, [searchInput]);

    React.useEffect(() => {
      setUsersLoading(true);
      adm.fetchUsers("all", 1, search).then((r) => {
        setUsers((r.data || []).map(normalize));
        setUsersLoading(false);
      }).catch(() => setUsersLoading(false));
    }, [search]);

    const onUserSaved = (updated) => {
      var slug = updated.role ? updated.role.slug : "candidate";
      setUsers((list) => list.map((u) => u.id === updated.id ? Object.assign({}, u, { role: slug }) : u));
    };

    const filtered = filter === "all" ? users : users.filter((u) => u.role === filter);
    const counts = { all: users.length, super_admin: 0, admin: 0, employer: 0, candidate: 0 };
    users.forEach((u) => { if (u.role in counts) counts[u.role]++; });

    return (
      <div className="krm-page-pad" style={{ padding: 28 }}>
        <ScreenHead title="User management" sub="Every user across the platform in one place. Assign roles and fine-tune permissions." />
        <Tabs value={tab} onChange={setTab} tabs={[{ value: "users", label: "Users", count: users.length }, { value: "roles", label: "Roles & permissions", count: 4 }, { value: "locations", label: "Locations" }, { value: "experience", label: "Experience levels" }, { value: "categories", label: "Categories" }]} style={{ marginBottom: 20 }} />

        {tab === "users" && (
          <React.Fragment>
            {/* toolbar */}
            <div className="krm-settings-toolbar" style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16, flexWrap: "wrap" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, height: 40, padding: "0 12px", border: "1px solid var(--border-strong)", borderRadius: "var(--radius-md)", background: "var(--surface-card)", width: 260, flexShrink: 0 }}>
                <span style={{ color: "var(--text-faint)" }}>{I("search", 16)}</span>
                <input value={searchInput} onChange={(e) => setSearchInput(e.target.value)} placeholder="Search name or email" style={{ border: "none", outline: "none", flex: 1, fontFamily: "var(--font-sans)", fontSize: "var(--text-sm)", background: "transparent" }} />
              </div>
              <div className="krm-filter-pills" style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {[["all", "All"], ["super_admin", "Super Admin"], ["admin", "Admin"], ["employer", "Employer"], ["candidate", "Candidate"]].map(([id, label]) => (
                  <button key={id} onClick={() => setFilter(id)} style={{
                    height: 34, padding: "0 12px", borderRadius: "var(--radius-pill)", cursor: "pointer",
                    border: "1px solid " + (filter === id ? "var(--brand)" : "var(--border-strong)"),
                    background: filter === id ? "var(--brand-subtle)" : "var(--surface-card)",
                    color: filter === id ? "var(--text-brand)" : "var(--text-body)",
                    fontFamily: "var(--font-sans)", fontSize: "var(--text-sm)", fontWeight: 600,
                  }}>{label} <span style={{ opacity: 0.6 }}>{counts[id]}</span></button>
                ))}
              </div>
              <Button variant="primary" iconLeft={I("user-plus", 16)} onClick={() => setInviting(true)}>Add new user</Button>
            </div>

            <div className="krm-table-wrap"><Card padding={0}>
              <div style={{ display: "grid", gridTemplateColumns: "2.2fr 1.2fr 1fr 1fr 132px", padding: "12px 20px", fontSize: "var(--text-xs)", fontWeight: 700, letterSpacing: ".04em", textTransform: "uppercase", color: "var(--text-faint)", borderBottom: "1px solid var(--border)" }}>
                <span>User</span><span>Role</span><span>Status</span><span>Last active</span><span style={{ textAlign: "right" }}>Actions</span>
              </div>
              {usersLoading && <div style={{ padding: "28px 20px", textAlign: "center", color: "var(--text-muted)", fontSize: "var(--text-sm)" }}>Loading…</div>}
              {!usersLoading && filtered.length === 0 && <div style={{ padding: "28px 20px", textAlign: "center", color: "var(--text-muted)", fontSize: "var(--text-sm)" }}>No users found.</div>}
              {!usersLoading && filtered.map((u, i) => {
                var self = isSelfUser(u);
                var editable = canEditUser(u) || self;
                return (
                <div key={u.id} style={{ display: "grid", gridTemplateColumns: "2.2fr 1.2fr 1fr 1fr 132px", alignItems: "center", padding: "13px 20px", borderBottom: i < filtered.length - 1 ? "1px solid var(--border-subtle)" : "none" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 11, minWidth: 0 }}>
                    <Avatar name={u.name} size={36} src={u.avatar_url || undefined} />
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontWeight: 600, color: "var(--text-strong)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                        {u.name}
                        {self && <span style={{ marginLeft: 6, fontSize: "var(--text-xs)", color: "var(--text-brand)", fontWeight: 700 }}>You</span>}
                      </div>
                      <div style={{ fontSize: "var(--text-sm)", color: "var(--text-muted)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{u.email}</div>
                    </div>
                  </div>
                  <span><RoleBadge role={u.role} /></span>
                  <span><Badge tone={u.status === "active" ? "success" : "danger"}>{u.status === "active" ? "Active" : "Suspended"}</Badge></span>
                  <span style={{ fontSize: "var(--text-sm)", color: "var(--text-muted)" }}>{u.last}</span>
                  <div style={{ display: "flex", gap: 6, justifyContent: "flex-end", alignItems: "center" }}>
                    {editable ? (
                      <Button variant="secondary" size="sm" onClick={() => setEditing(u)}>
                        {self ? "View / Password" : "Edit"}
                      </Button>
                    ) : (
                      <span title={"Only a Super Admin can edit " + (ROLES[u.role] ? ROLES[u.role].label : u.role) + " accounts"}
                        style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: "var(--text-xs)", color: "var(--text-faint)", padding: "5px 10px", border: "1px solid var(--border)", borderRadius: "var(--radius-md)", background: "var(--surface-sunken)" }}>
                        {I("lock", 12)} Protected
                      </span>
                    )}
                  </div>
                </div>
              );})}
            </Card></div>
          </React.Fragment>
        )}

        {tab === "roles" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {/* role summary cards */}
            <div className="krm-roles-grid" style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14 }}>
              {Object.keys(ROLES).map((k) => (
                <Card key={k} padding={18}>
                  <RoleBadge role={k} />
                  <p style={{ fontSize: "var(--text-sm)", color: "var(--text-muted)", margin: "10px 0 12px", lineHeight: 1.5, minHeight: 42 }}>{ROLES[k].desc}</p>
                  <div style={{ fontFamily: "var(--font-mono)", fontSize: "var(--text-xs)", color: "var(--text-faint)" }}>{ROLE_PERMS[k].length} permissions · {counts[k] || 0} users</div>
                </Card>
              ))}
            </div>

            {/* permission matrix */}
            <div className="krm-table-wrap"><Card padding={0}>
              <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--border)", fontWeight: 700, color: "var(--text-strong)" }}>Permission matrix</div>
              <div style={{ display: "grid", gridTemplateColumns: "1.6fr repeat(4, 1fr)", padding: "10px 20px", fontSize: "var(--text-xs)", fontWeight: 700, letterSpacing: ".04em", textTransform: "uppercase", color: "var(--text-faint)", borderBottom: "1px solid var(--border)", position: "sticky", top: 0, background: "var(--surface-card)" }}>
                <span>Permission</span>
                {Object.keys(ROLES).map((k) => <span key={k} style={{ textAlign: "center" }}>{ROLES[k].label}</span>)}
              </div>
              {PERM_GROUPS.map((g) => (
                <React.Fragment key={g.group}>
                  <div style={{ padding: "10px 20px", background: "var(--surface-sunken)", fontSize: "var(--text-xs)", fontWeight: 700, letterSpacing: ".05em", textTransform: "uppercase", color: "var(--text-muted)" }}>{g.group}</div>
                  {g.perms.map(([id, label]) => (
                    <div key={id} style={{ display: "grid", gridTemplateColumns: "1.6fr repeat(4, 1fr)", alignItems: "center", padding: "11px 20px", borderBottom: "1px solid var(--border-subtle)" }}>
                      <span style={{ fontSize: "var(--text-sm)", color: "var(--text-body)" }}>{label}</span>
                      {Object.keys(ROLES).map((k) => (
                        <span key={k} style={{ display: "flex", justifyContent: "center", color: ROLE_PERMS[k].includes(id) ? "var(--success)" : "var(--stone-300)" }}>
                          {ROLE_PERMS[k].includes(id) ? I("check", 18) : I("minus", 16)}
                        </span>
                      ))}
                    </div>
                  ))}
                </React.Fragment>
              ))}
            </Card></div>
          </div>
        )}

        {tab === "locations" && <LocationsTab />}
        {tab === "experience" && <ExperienceLevelsTab />}
        {tab === "categories" && <Categories />}

        <PermissionDrawer user={editing} onClose={() => setEditing(null)} onSaved={onUserSaved}
          viewerRole={viewerSlug} isSelf={editing ? isSelfUser(editing) : false} />
        <AddUserModal open={inviting} onClose={() => setInviting(false)} viewerRole={viewerSlug}
          onCreated={(newUser) => { setUsers((list) => [normalize(newUser), ...list]); }} />
      </div>
    );
  }

  // ===== Promotional banner manager ======================================
  const BANNER_THEMES = {
    saffron: { label: "Saffron", bg: "var(--saffron-500)", fg: "#fff", ctaBg: "#fff", ctaFg: "var(--saffron-700)" },
    teal: { label: "Teal", bg: "var(--teal-700)", fg: "#fff", ctaBg: "#fff", ctaFg: "var(--teal-700)" },
    dark: { label: "Dark", bg: "var(--stone-900)", fg: "#fff", ctaBg: "var(--saffron-500)", ctaFg: "#fff" },
  };
  function resolveBannerTheme(b) {
    return BANNER_THEMES[b.theme] || BANNER_THEMES.saffron;
  }

  const BANNER_IMAGES = [
    { id: "", label: "None" },
    { id: "jobfair", label: "Job fair", src: "../../assets/banners/banner-jobfair.png" },
    { id: "ai", label: "AI / teal", src: "../../assets/banners/banner-ai.png" },
    { id: "hiring", label: "Hiring / dark", src: "../../assets/banners/banner-hiring.png" },
  ];
  const bannerImgSrc = (id) => {
    if (!id) return null;
    if (/^(data:|https?:|\.|\/)/.test(id)) return id; // uploaded data-URL or direct path
    const m = BANNER_IMAGES.find((x) => x.id === id); return m ? m.src : null;
  };

  function BannerStrip({ data, onDismiss }) {
    const t = resolveBannerTheme(data);
    const img = bannerImgSrc(data.image);
    const center = data.align === "center";
    return (
      <div style={{ position: "relative", overflow: "hidden", background: t.bg, color: "#fff" }}>
        {img
          ? <React.Fragment>
              <div style={{ position: "absolute", inset: 0, backgroundImage: "url('" + img + "')", backgroundSize: data.fit === "contain" ? "contain" : "cover", backgroundRepeat: "no-repeat", backgroundPosition: "center" }} />
              <div style={{ position: "absolute", inset: 0, background: t.bg, opacity: (data.imgOverlay != null ? data.imgOverlay : 20) / 100 }} />
            </React.Fragment>
          : <div style={{ position: "absolute", inset: 0, background: "url('../../assets/krama-pattern.svg')", backgroundSize: 60, opacity: 0.10 }} />}
        <div style={{ position: "relative", maxWidth: 1200, margin: "0 auto", minHeight: 52, display: "flex", alignItems: "center", gap: 14, padding: "10px 20px" }}>
          <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 12, minWidth: 0, justifyContent: center ? "center" : "flex-start" }}>
            <span style={{ display: "inline-flex", flexShrink: 0 }}>{I(data.icon || "megaphone", 18)}</span>
            <div style={{ fontSize: "var(--text-sm)", fontWeight: 500, lineHeight: 1.3, textAlign: center ? "center" : "left" }}>
              <strong style={{ fontWeight: 700 }}>{data.title}</strong>
              {data.message ? <span style={{ opacity: 0.92 }}> -- {data.message}</span> : null}
            </div>
          </div>
          {data.cta ? (
            <span style={{ flexShrink: 0, background: img ? "#fff" : t.ctaBg, color: img ? "var(--stone-900)" : t.ctaFg, fontSize: "var(--text-sm)", fontWeight: 700, padding: "7px 14px", borderRadius: "var(--radius-pill)", cursor: "pointer", whiteSpace: "nowrap" }}>{data.cta}</span>
          ) : null}
          {onDismiss ? (
            <button onClick={onDismiss} aria-label="Dismiss" style={{ flexShrink: 0, border: "none", background: "transparent", color: "#fff", cursor: "pointer", opacity: 0.8, display: "inline-flex", padding: 4 }}>{I("x", 16)}</button>
          ) : null}
        </div>
      </div>
    );
  }

  const TODAY = new Date().toISOString().slice(0, 10);
  const fmtDate = (s) => {
    if (!s) return "--";
    const [y, m, d] = s.split("-");
    const mon = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][parseInt(m, 10) - 1];
    return d + " " + mon + " " + y;
  };
  // status: hidden | scheduled | expired | live
  const bannerStatus = (b) => {
    if (!b.active) return "hidden";
    if (b.start && TODAY < b.start) return "scheduled";
    if (b.end && TODAY > b.end) return "expired";
    return "live";
  };
  const STATUS_TONE = { live: "success", scheduled: "info", expired: "neutral", hidden: "neutral" };
  const STATUS_LABEL = { live: "Live", scheduled: "Scheduled", expired: "Expired", hidden: "Hidden" };

  const ICON_OPTS = [
    { value: "party-popper", label: "Celebration" }, { value: "megaphone", label: "Announcement" },
    { value: "sparkles", label: "Sparkles" }, { value: "calendar", label: "Event" }, { value: "zap", label: "Flash" },
  ];

  const INITIAL_BANNERS = [
    { id: "b1", title: "Krama Job Fair 2026", message: "Meet 80+ verified employers in Phnom Penh this Saturday.", cta: "Reserve your spot", theme: "saffron", icon: "party-popper", image: "jobfair", align: "left", fit: "cover", active: true, start: "2026-06-10", end: "2026-06-21" },
    { id: "b2", title: "New: AI job matching", message: "Get roles picked for your résumé -- now in beta.", cta: "Try it", theme: "teal", icon: "sparkles", image: "ai", align: "center", fit: "cover", active: true, start: "", end: "" },
    { id: "b3", title: "Year-end hiring rush", message: "Premium listings 20% off through December.", cta: "See plans", theme: "dark", icon: "zap", image: "hiring", align: "left", fit: "cover", active: true, start: "2026-11-01", end: "2026-12-31" },
  ];

  function BannerEditorDrawer({ banner, onClose, onSave }) {
    const [d, setD] = React.useState(banner);
    React.useEffect(() => { setD(banner); }, [banner]);
    const fileRef = React.useRef(null);
    const [dragOver, setDragOver] = React.useState(false);
    if (!banner || !d) return null;
    const set = (k, v) => setD((x) => ({ ...x, [k]: v }));
    const readImageFile = (f) => {
      if (!f || !/^image\//.test(f.type)) return;
      const r = new FileReader();
      r.onload = () => setD((x) => ({ ...x, image: r.result, fit: x.fit || "cover" }));
      r.readAsDataURL(f);
    };
    const onUpload = (e) => readImageFile(e.target.files && e.target.files[0]);
    const isUploaded = d.image && /^data:/.test(d.image);
    const hasImage = !!d.image;
    const themeBtn = (key) => {
      const t = BANNER_THEMES[key]; const sel = d.theme === key;
      return (
        <button key={key} onClick={() => set("theme", key)} style={{ flex: 1, height: 40, borderRadius: "var(--radius-md)", cursor: "pointer", border: "2px solid " + (sel ? "var(--brand)" : "var(--border)"), background: t.bg, color: t.fg, fontFamily: "var(--font-sans)", fontWeight: 700, fontSize: "var(--text-sm)" }}>{t.label}</button>
      );
    };
    return (
      <div onClick={onClose} style={{ position: "fixed", inset: 0, zIndex: 200, background: "var(--surface-overlay)", display: "flex", justifyContent: "flex-end", animation: "krmfade var(--dur-base) var(--ease-out)" }}>
        <div onClick={(e) => e.stopPropagation()} style={{ width: 520, maxWidth: "94vw", height: "100%", background: "var(--surface-card)", boxShadow: "var(--shadow-xl)", display: "flex", flexDirection: "column", animation: "krmslide var(--dur-base) var(--ease-out)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "20px 24px", borderBottom: "1px solid var(--border)" }}>
            <div style={{ flex: 1, fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "var(--text-lg)", color: "var(--text-strong)" }}>{banner.isNew ? "New banner" : "Edit banner"}</div>
            <IconButton aria-label="Close" onClick={onClose}>{I("x", 18)}</IconButton>
          </div>
          <div style={{ flex: 1, overflowY: "auto", padding: 24 }}>
            {/* preview */}
            <div style={{ border: "1px solid var(--border)", borderRadius: "var(--radius-md)", overflow: "hidden", marginBottom: 20 }}>
              <BannerStrip data={d} onDismiss={null} />
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <Input label="Headline" value={d.title} onChange={(e) => set("title", e.target.value)} />
              <Input label="Message" value={d.message} onChange={(e) => set("message", e.target.value)} hint="Keep it short -- it sits on one line." />
              <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", padding: "8px 10px", borderRadius: "var(--radius-md)", background: d.hideText ? "var(--brand-subtle)" : "var(--surface-sunken)", border: "1px solid " + (d.hideText ? "var(--brand)" : "var(--border-subtle)") }}>
                <input type="checkbox" checked={!!d.hideText} onChange={(e) => set("hideText", e.target.checked)} style={{ width: 16, height: 16, accentColor: "var(--brand)", cursor: "pointer", flexShrink: 0 }} />
                <span style={{ fontSize: "var(--text-sm)", fontWeight: 700, color: "var(--text-strong)" }}>Show background image only</span>
                <span style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>Hides the title, message &amp; button.</span>
              </label>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                <Input label="Button label" value={d.cta} onChange={(e) => set("cta", e.target.value)} />
                <Select label="Icon" value={d.icon} onChange={(e) => set("icon", e.target.value)} options={ICON_OPTS} />
              </div>
              <div>
                <div style={{ fontSize: "var(--text-sm)", fontWeight: 600, color: "var(--text-strong)", marginBottom: 8 }}>Theme</div>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>{Object.keys(BANNER_THEMES).map(themeBtn)}</div>
              </div>
              {/* background picture */}
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                  <span style={{ color: "var(--text-muted)", display: "inline-flex" }}>{I("image", 16)}</span>
                  <span style={{ fontSize: "var(--text-sm)", fontWeight: 600, color: "var(--text-strong)" }}>Background picture</span>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10 }}>
                  {BANNER_IMAGES.map((im) => {
                    const sel = (d.image || "") === im.id;
                    return (
                      <button key={im.id || "none"} onClick={() => set("image", im.id)} title={im.label} style={{
                        position: "relative", height: 48, borderRadius: "var(--radius-md)", cursor: "pointer", overflow: "hidden", padding: 0,
                        border: "2px solid " + (sel ? "var(--brand)" : "var(--border)"),
                        background: im.src ? "transparent" : "var(--surface-sunken)",
                        backgroundImage: im.src ? "url('" + im.src + "')" : "none", backgroundSize: "cover", backgroundPosition: "center",
                        display: "flex", alignItems: "center", justifyContent: "center",
                      }}>
                        {!im.src ? <span style={{ fontSize: "var(--text-xs)", fontWeight: 600, color: "var(--text-muted)" }}>None</span> : null}
                        {sel ? <span style={{ position: "absolute", top: 3, right: 3, width: 16, height: 16, borderRadius: "50%", background: "var(--brand)", color: "#fff", display: "inline-flex", alignItems: "center", justifyContent: "center" }}>{I("check", 11)}</span> : null}
                      </button>
                    );
                  })}
                  {/* upload tile -- click or drag & drop */}
                  <button onClick={() => fileRef.current && fileRef.current.click()}
                    onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                    onDragLeave={() => setDragOver(false)}
                    onDrop={(e) => { e.preventDefault(); setDragOver(false); readImageFile(e.dataTransfer.files && e.dataTransfer.files[0]); }}
                    title="Upload image" style={{
                    position: "relative", height: 48, borderRadius: "var(--radius-md)", cursor: "pointer", overflow: "hidden", padding: 0,
                    border: "2px " + (dragOver ? "solid var(--brand)" : isUploaded ? "solid var(--brand)" : "dashed var(--border-strong)"),
                    background: dragOver ? "var(--brand-subtle)" : isUploaded ? "transparent" : "var(--surface-sunken)",
                    backgroundImage: isUploaded && !dragOver ? "url('" + d.image + "')" : "none", backgroundSize: "cover", backgroundPosition: "center",
                    display: "flex", alignItems: "center", justifyContent: "center", color: dragOver ? "var(--brand)" : "var(--text-muted)",
                  }}>
                    {(!isUploaded || dragOver) ? <span style={{ display: "inline-flex", flexDirection: "column", alignItems: "center", gap: 2, fontSize: "var(--text-2xs)", fontWeight: 600 }}>{I(dragOver ? "download" : "upload", 15)}{dragOver ? "Drop" : "Upload"}</span> : null}
                    {isUploaded && !dragOver ? <span style={{ position: "absolute", top: 3, right: 3, width: 16, height: 16, borderRadius: "50%", background: "var(--brand)", color: "#fff", display: "inline-flex", alignItems: "center", justifyContent: "center" }}>{I("check", 11)}</span> : null}
                  </button>
                </div>
                <input ref={fileRef} type="file" accept="image/*" onChange={onUpload} style={{ display: "none" }} />
                <p style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)", marginTop: 8 }}>Pick a preset, or drag &amp; drop / click Upload for your own (JPG/PNG). Recommended size: 1600 × 160px (wide strip).</p>
              </div>
              {/* image fit -- only when a picture is set */}
              {hasImage ? (
                <div>
                  <div style={{ fontSize: "var(--text-sm)", fontWeight: 600, color: "var(--text-strong)", marginBottom: 8 }}>Image fit</div>
                  <div style={{ display: "flex", gap: 4, padding: 4, background: "var(--surface-sunken)", borderRadius: "var(--radius-md)", maxWidth: 240 }}>
                    {[["cover", "Cover", "scaling"], ["contain", "Contain", "maximize-2"]].map(([val, label, ic]) => {
                      const sel = (d.fit || "cover") === val;
                      return (
                        <button key={val} onClick={() => set("fit", val)} style={{
                          flex: 1, height: 36, border: "none", cursor: "pointer", borderRadius: "var(--radius-sm)",
                          display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 6,
                          fontFamily: "var(--font-sans)", fontSize: "var(--text-sm)", fontWeight: 700,
                          background: sel ? "var(--surface-card)" : "transparent", color: sel ? "var(--text-brand)" : "var(--text-muted)",
                          boxShadow: sel ? "var(--shadow-xs)" : "none",
                        }}>{I(ic, 14)}{label}</button>
                      );
                    })}
                  </div>
                  <p style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)", marginTop: 8 }}>Cover fills the bar (may crop). Contain shows the whole image on the theme color.</p>
                  <div style={{ marginTop: 14 }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
                      <span style={{ fontSize: "var(--text-sm)", fontWeight: 600, color: "var(--text-strong)" }}>Image visibility</span>
                      <span style={{ fontSize: "var(--text-sm)", fontWeight: 700, color: "var(--text-brand)" }}>{100 - (d.imgOverlay != null ? d.imgOverlay : 20)}%</span>
                    </div>
                    <input type="range" min={0} max={80} step={5} value={d.imgOverlay != null ? d.imgOverlay : 20} onChange={(e) => set("imgOverlay", Number(e.target.value))} style={{ width: "100%", accentColor: "var(--brand)" }} />
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "var(--text-xs)", color: "var(--text-muted)", marginTop: 2 }}>
                      <span>Full colour</span><span>Clear image</span>
                    </div>
                  </div>
                </div>
              ) : null}
              {/* text position */}
              <div>
                <div style={{ fontSize: "var(--text-sm)", fontWeight: 600, color: "var(--text-strong)", marginBottom: 8 }}>Text position</div>
                <div style={{ display: "flex", gap: 4, padding: 4, background: "var(--surface-sunken)", borderRadius: "var(--radius-md)", maxWidth: 240 }}>
                  {[["left", "Left", "align-left"], ["center", "Center", "align-center"]].map(([val, label, ic]) => {
                    const sel = (d.align || "left") === val;
                    return (
                      <button key={val} onClick={() => set("align", val)} style={{
                        flex: 1, height: 36, border: "none", cursor: "pointer", borderRadius: "var(--radius-sm)",
                        display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 6,
                        fontFamily: "var(--font-sans)", fontSize: "var(--text-sm)", fontWeight: 700,
                        background: sel ? "var(--surface-card)" : "transparent", color: sel ? "var(--text-brand)" : "var(--text-muted)",
                        boxShadow: sel ? "var(--shadow-xs)" : "none",
                      }}>{I(ic, 15)}{label}</button>
                    );
                  })}
                </div>
              </div>
              {/* scheduling window */}
              <div style={{ borderTop: "1px solid var(--border-subtle)", paddingTop: 16 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                  <span style={{ color: "var(--text-muted)", display: "inline-flex" }}>{I("calendar-clock", 16)}</span>
                  <span style={{ fontSize: "var(--text-sm)", fontWeight: 700, color: "var(--text-strong)" }}>Scheduling window</span>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                  <Input label="Start date" type="date" value={d.start} onChange={(e) => set("start", e.target.value)} />
                  <Input label="End date" type="date" value={d.end} onChange={(e) => set("end", e.target.value)} />
                </div>
                <p style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)", marginTop: 8 }}>Leave a date blank for no bound. The banner only shows while active and within the window.</p>
              </div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderTop: "1px solid var(--border-subtle)", paddingTop: 16 }}>
                <span style={{ fontSize: "var(--text-sm)", fontWeight: 700, color: "var(--text-strong)" }}>Active</span>
                <Switch checked={d.active} onChange={(v) => set("active", v)} />
              </div>
            </div>
          </div>
          <div style={{ display: "flex", gap: 10, padding: "16px 24px", borderTop: "1px solid var(--border)" }}>
            <Button variant="ghost" onClick={onClose}>Cancel</Button>
            <Button variant="primary" block onClick={() => onSave(d)}>{banner.isNew ? "Create banner" : "Save changes"}</Button>
          </div>
        </div>
        <style>{`
          @keyframes krmfade { from { opacity: 0 } to { opacity: 1 } }
          @keyframes krmslide { from { transform: translateX(40px); opacity: .4 } to { transform: none; opacity: 1 } }
        `}</style>
      </div>
    );
  }

  // ===== Homepage content control (drives the public website) ==========
  const HOME_COMPANIES =["ABA Bank", "Smart Axiata", "Wing Bank", "Manulife", "Acleda Bank", "Cellcard"];
  const HOME_DEFAULTS = { topVisible: true, topCount: 6, featuredJobsVisible: true, featuredJobsCount: 8, featuredVisible: true, featured: ["ABA Bank", "Smart Axiata", "Wing Bank", "Manulife"], visibleCategories: null, sidebarBanner: { visible: true, theme: "teal", icon: "sparkles", title: "Boost your search", message: "Complete your profile to get AI-matched roles and apply in one click.", cta: "Build your profile", ctaUrl: "", image: "../../assets/banners/bg-sidebarBanner.svg", fit: "cover" }, categoryBanner: { visible: true, theme: "saffron", icon: "rocket", title: "Hiring? Reach top talent", message: "Post a job and get in front of 40,000+ candidates.", cta: "Post a job", ctaUrl: "", image: "../../assets/banners/bg-categoryBanner.svg", fit: "cover" }, companiesBanner: { visible: true, theme: "teal", icon: "building-2", title: "Get your company verified", message: "Verified employers rank higher and earn candidate trust.", cta: "List your company", ctaUrl: "", image: "../../assets/banners/bg-companiesBanner.svg", fit: "cover" }, companiesBanner2: { visible: true, theme: "dark", icon: "gift", title: "Featured placement", message: "Put your company at the top of the directory and get 3× more views.", cta: "Go featured", ctaUrl: "", image: "../../assets/banners/bg-companiesBanner2.svg", fit: "cover" }, companiesBanner3: { visible: true, theme: "saffron", icon: "bell", title: "Company alerts", message: "Follow employers and get notified when they post new roles.", cta: "Follow companies", ctaUrl: "", image: "../../assets/banners/bg-companiesBanner3.svg", fit: "cover" }, companiesBanner4: { visible: true, theme: "teal", icon: "sparkles", title: "Browse by industry", message: "Find employers in banking, telecom, retail and more.", cta: "Explore industries", ctaUrl: "", image: "../../assets/banners/bg-companiesBanner4.svg", fit: "cover" }, findJobsBanner3: { visible: true, theme: "saffron", icon: "bell", title: "Job alerts", message: "Get an email the moment a matching role is posted.", cta: "Create alert", ctaUrl: "", image: "../../assets/banners/bg-findJobsBanner3.svg", fit: "cover" }, findJobsBanner4: { visible: true, theme: "dark", icon: "briefcase", title: "Career resources", message: "Tips, guides, and tools to help you land your next role.", cta: "Explore", ctaUrl: "", image: "../../assets/banners/bg-findJobsBanner4.svg", fit: "cover" }, findJobsTopBanner: { visible: true, theme: "saffron", icon: "bell", title: "Job alerts", message: "Get an email the moment a matching role is posted.", cta: "Create alert", ctaUrl: "", image: "../../assets/banners/bg-findJobsTopBanner.svg", fit: "cover" }, companiesTopBanner: { visible: true, theme: "saffron", icon: "building-2", title: "Are you hiring?", message: "List your company and reach 40,000+ verified candidates.", cta: "Post a job", ctaUrl: "", image: "../../assets/banners/bg-companiesTopBanner.svg", fit: "cover" }, jobDetailTopBanner: { visible: true, theme: "teal", icon: "sparkles", title: "Looking for more roles?", message: "Browse thousands of verified opportunities across Cambodia.", cta: "Browse jobs", ctaUrl: "", image: "../../assets/banners/bg-jobDetailTopBanner.svg", fit: "cover" }, companyProfileTopBanner: { visible: true, theme: "teal", icon: "building-2", title: "Looking to hire?", message: "List your company on Krama and reach 40,000+ verified candidates.", cta: "Post a job", ctaUrl: "", image: "../../assets/banners/bg-companyProfileTopBanner.svg", fit: "cover" }, employersTopBanner: { visible: true, theme: "saffron", icon: "briefcase", title: "Ready to hire?", message: "Post your first job free and reach 40,000+ verified candidates.", cta: "Post a job", ctaUrl: "", image: "../../assets/banners/bg-employersTopBanner.svg", fit: "cover" }, communityTopBanner: { visible: true, theme: "teal", icon: "messages-square", title: "Join the conversation", message: "Ask questions, share tips, and connect with people hiring across Cambodia.", cta: "Start a discussion", ctaUrl: "", image: "", fit: "cover" }, findJobsHero: { heading: "Find your next opportunity", sub: "Browse thousands of verified roles across Cambodia -- filter by category, location, and work mode.", image: "../../assets/banners/bg-findJobsHero.svg", fit: "cover", imgOverlay: 45 }, jobDetailHero: { visible: true, heading: "Find the role that fits you", sub: "Discover verified opportunities from Cambodia's leading employers.", image: "../../assets/banners/bg-jobDetailHero.svg", fit: "cover", imgOverlay: 45 }, companiesHero: { heading: "Verified companies hiring now", sub: "Explore {count} approved employers across Cambodia.", image: "../../assets/banners/bg-companiesHero.svg", fit: "cover", imgOverlay: 45 }, employersHero: { heading: "Hire the right people, faster.", sub: "Post jobs, review applications, and manage your entire hiring pipeline — all in one place built for Cambodia and Southeast Asia.", image: "../../assets/banners/bg-employersHero.svg", fit: "cover", imgOverlay: 45 }, footerBanner: { visible: true, mobileVisible: false, theme: "teal", icon: "megaphone", title: "Hiring? Reach 40,000+ verified candidates.", message: "Post your first job free. Featured listings available.", cta: "Post a job", ctaUrl: "", image: "../../assets/banners/bg-footerBanner.svg", fit: "cover" }, jobDetailBanner: { visible: true, theme: "teal", icon: "sparkles", title: "Looking for more opportunities?", message: "Browse hundreds of open roles matching your skills.", cta: "Explore jobs", ctaUrl: "", image: "../../assets/banners/bg-jobDetailBanner.svg", fit: "cover" }, heroSlides: [{ id: "s1", title: "Find work that fits your life", subtitle: "Search thousands of roles across Cambodia -- from banking to engineering -- and apply in two clicks.", badge: "12,480 open jobs from verified employers", theme: "teal", image: "../../assets/banners/bg-heroSlide1.svg", fit: "cover", ctaLabel: "", ctaUrl: "" }, { id: "s2", title: "Hiring? Reach top talent fast", subtitle: "Post your job and get in front of 40,000+ verified candidates.", badge: "Trusted by 500+ companies", theme: "saffron", image: "../../assets/banners/bg-heroSlide2.svg", fit: "cover", ctaLabel: "Post a job", ctaUrl: "" }, { id: "s3", title: "Get career-matched roles instantly", subtitle: "Complete your profile and let AI find the right jobs for you.", badge: "Smart job matching", theme: "dark", image: "../../assets/banners/bg-heroSlide3.svg", fit: "cover", ctaLabel: "Build profile", ctaUrl: "" }] };
  // Strip data: URIs before persisting -- inline base64 images can exceed the
  // settings column limit (SQLSTATE[22001]). Recursively blank ANY string that is a
  // data: URI, anywhere in the object (incl. heroSlides[] and any future field), so a
  // stray base64 blob can never break the save. Uploaded images live as short URLs;
  // no legitimate setting value starts with "data:".
  function stripDataUris(s) {
    function scrub(v) {
      if (typeof v === "string") return v.indexOf("data:") === 0 ? "" : v;
      if (Array.isArray(v)) return v.map(scrub);
      if (v && typeof v === "object") {
        var o = {};
        for (var k in v) { if (Object.prototype.hasOwnProperty.call(v, k)) o[k] = scrub(v[k]); }
        return o;
      }
      return v;
    }
    return scrub(s);
  }
  function Stepper({ value, min, max, onChange }) {
    const btn = (label, fn, disabled) => (
      <button onClick={fn} disabled={disabled} style={{ width: 38, height: 38, border: "1px solid var(--border-strong)", background: disabled ? "var(--surface-sunken)" : "var(--surface-card)", color: disabled ? "var(--text-faint)" : "var(--text-strong)", borderRadius: "var(--radius-md)", cursor: disabled ? "not-allowed" : "pointer", fontSize: 20, fontWeight: 700, display: "inline-flex", alignItems: "center", justifyContent: "center", lineHeight: 1 }}>{label}</button>
    );
    return (
      <div style={{ display: "inline-flex", alignItems: "center", gap: 12 }}>
        {btn("−", () => onChange(Math.max(min, value - 1)), value <= min)}
        <span style={{ minWidth: 36, textAlign: "center", fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "var(--text-2xl)", color: "var(--text-strong)" }}>{value}</span>
        {btn("+", () => onChange(Math.min(max, value + 1)), value >= max)}
      </div>
    );
  }

  function Homepage() {
    const [s, setS] = React.useState(HOME_DEFAULTS);
    const [hpTab, setHpTab] = React.useState("home");
    const [saved, setSaved] = React.useState(false);
    const [saveErr, setSaveErr] = React.useState("");
    const [companies, setCompanies] = React.useState(HOME_COMPANIES);
    const [allCats, setAllCats] = React.useState([]);
    const [editSlide, setEditSlide] = React.useState(null);
    const SLIDE_BLANK = { id: "", title: "", subtitle: "", badge: "", theme: "teal", image: "", imageMobile: "", focalX: 50, focalY: 50, fit: "cover", imageOnly: true, ctaLabel: "", ctaUrl: "" };
    const [slideForm, setSlideForm] = React.useState(SLIDE_BLANK);
    const [uploading, setUploading] = React.useState(false);
    const slideFileRef = React.useRef();
    const slideMobileFileRef = React.useRef();
    const [banners, setBanners] = React.useState([]);
    const [bannerEditing, setBannerEditing] = React.useState(null);
    const [bannerLoading, setBannerLoading] = React.useState(true);
    const [bannerMsg, setBannerMsg] = React.useState("");
    React.useEffect(function () { adm.fetchBanners().then(function(arr) { setBanners(arr); setBannerLoading(false); }).catch(function() { setBannerLoading(false); }); }, []);
    React.useEffect(function () {
      window.KRAMA_ADMIN_API.fetchSettings('home_content')
        .then(function(d) {
          if (d && d.data) { try { setS(Object.assign({}, HOME_DEFAULTS, JSON.parse(d.data))); } catch (e) {} }
        })
        .catch(function() {});
      adm.fetchCompanies("approved", 1, 100).then(function (res) {
        var names = (res.data || []).map(function (c) { return c.name; }).filter(Boolean);
        if (names.length > 0) setCompanies(names);
      }).catch(function () {});
      adm.fetchCategories().then(function (cats) {
        setAllCats(cats.filter(function (c) { return c.status === "active"; }));
      }).catch(function () {});
    }, []);
    const set = (k, v) => { setS((x) => ({ ...x, [k]: v })); setSaved(false); };
    const setSB = (k, v) => { setS((x) => ({ ...x, sidebarBanner: Object.assign({}, x.sidebarBanner, { [k]: v }) })); setSaved(false); };
    const setBanner = (key, k, v) => { setS((x) => ({ ...x, [key]: Object.assign({}, x[key], { [k]: v }) })); setSaved(false); };
    const bannerLiveStack = banners.filter((b) => bannerStatus(b) === "live");
    const bannerFlash = (msg) => { setBannerMsg(msg); setTimeout(() => setBannerMsg(""), 3000); };
    const toggleBanner = (id) => {
      var b = banners.find(function(x) { return x.id === id; });
      if (!b) return;
      adm.updateBanner(id, Object.assign({}, b, { active: !b.active }))
        .then(function(updated) { setBanners(function(arr) { return arr.map(function(x) { return x.id === id ? updated : x; }); }); })
        .catch(function(e) { bannerFlash("Error: " + (e && e.message)); });
    };
    const removeBanner = (id) => {
      if (!window.confirm("Delete this banner?")) return;
      adm.deleteBanner(id)
        .then(function() { setBanners(function(arr) { return arr.filter(function(b) { return b.id !== id; }); }); bannerFlash("Banner deleted."); })
        .catch(function(e) { bannerFlash("Error: " + (e && e.message)); });
    };
    const saveBanner = (d) => {
      var isNew = d.isNew;
      var op = isNew ? adm.createBanner(d) : adm.updateBanner(d.id, d);
      op.then(function(saved) {
        setBanners(function(arr) { return isNew ? [...arr, saved] : arr.map(function(b) { return b.id === saved.id ? saved : b; }); });
        setBannerEditing(null);
        bannerFlash(isNew ? "Banner created." : "Banner saved.");
      }).catch(function(e) { bannerFlash("Error: " + (e && e.message)); });
    };
    const toggleCategory = (slug) => {
      setS((x) => {
        const current = x.visibleCategories !== null && x.visibleCategories !== undefined ? x.visibleCategories : allCats.map(function(c){ return c.slug; });
        const has = current.includes(slug);
        return { ...x, visibleCategories: has ? current.filter(function(s){ return s !== slug; }) : [...current, slug] };
      });
      setSaved(false);
    };
    const uploadTo = (key) => (e) => {
      const f = e.target.files && e.target.files[0];
      if (!f || !/^image\//.test(f.type)) return;
      e.target.value = "";
      setSaveErr("");
      setBanner(key, "_uploading", true);
      compressImage(f, 1200, 0.85).then(function(compressed) {
        return window.KRAMA_ADMIN_API.uploadImage(compressed);
      }).then(function(url) {
        setS((x) => ({ ...x, [key]: Object.assign({}, x[key], { image: url, _uploading: undefined }) }));
        setSaved(false);
      }).catch(function(err) {
        setBanner(key, "_uploading", undefined);
        setSaveErr("Image upload failed: " + ((err && err.message) || "Unknown error"));
      });
    };
    const toggleFeatured = (name) => { setS((x) => { const has = x.featured.includes(name); return { ...x, featured: has ? x.featured.filter((n) => n !== name) : [...x.featured, name] }; }); setSaved(false); };
    const apply = () => {
      setSaveErr("");
      window.KRAMA_ADMIN_API.updateSettings('home_content', { data: JSON.stringify(stripDataUris(s)) })
        .then(function() { setSaved(true); })
        .catch(function(e) { setSaved(false); setSaveErr('Save failed: ' + (e && e.message ? e.message : 'Unknown error')); });
    };
    const SLIDE_THEME_COLORS = { teal: "var(--teal-700)", saffron: "var(--saffron-500)", dark: "var(--stone-900)", brand: "var(--brand)", blank: "var(--surface-card)", transparent: "var(--surface-page)", custom: null };
    function resolveSlidePreviewBg(f) { return f.theme === "custom" ? (f.customBg || "var(--teal-700)") : (SLIDE_THEME_COLORS[f.theme] || SLIDE_THEME_COLORS.teal); }
    function resolveSlidePreviewFg(f) { if (f.theme === "custom") return f.customFg || "#fff"; if (f.theme === "transparent" || f.theme === "blank") return f.customFg || "var(--text-strong)"; return "#fff"; }
    const openNewSlide = () => { setSlideForm({ ...SLIDE_BLANK, id: "s" + Date.now() }); setEditSlide("new"); };
    const openEditSlide = (sl) => { setSlideForm({ ...sl }); setEditSlide(sl.id); };
    const closeSlide = () => setEditSlide(null);
    const commitSlide = (form) => {
      const slides = s.heroSlides || [];
      const updated = editSlide === "new" ? [...slides, form] : slides.map((sl) => sl.id === editSlide ? form : sl);
      set("heroSlides", updated); closeSlide();
    };
    const saveSlide = () => {
      const isImageOnly = !!slideForm.imageOnly;
      // Image-only slides need a picture; text slides need a title.
      if (isImageOnly ? (!slideForm.image && !slideForm._src) : !slideForm.title.trim()) return;
      // Freshly-picked images live in _src (desktop) / _srcMobile (mobile) as transient data
      // URLs. On save, upload each WHOLE (no crop) → image / imageMobile. If no dedicated
      // mobile image exists, mobile falls back to the desktop image. _src(Mobile) is dropped
      // afterward so no base64 is ever persisted.
      const jobs = [];
      if (slideForm._src) jobs.push(
        dataUrlToFile(slideForm._src, "banner.jpg")
          .then(function(file) { return window.KRAMA_ADMIN_API.uploadImage(file); })
          .then(function(url) { return ["image", url]; })
      );
      if (slideForm._srcMobile) jobs.push(
        dataUrlToFile(slideForm._srcMobile, "banner-mobile.jpg")
          .then(function(file) { return window.KRAMA_ADMIN_API.uploadImage(file); })
          .then(function(url) { return ["imageMobile", url]; })
      );
      if (!jobs.length) { commitSlide(slideForm); return; }
      setUploading(true);
      setSaveErr("");
      Promise.all(jobs).then(function(results) {
        const patch = { _src: undefined, _srcMobile: undefined };
        results.forEach(function(r) { patch[r[0]] = r[1]; });
        // No dedicated mobile image anywhere → mobile shows the desktop image.
        if (patch.image && !slideForm._srcMobile && !slideForm.imageMobile) patch.imageMobile = patch.image;
        setUploading(false);
        commitSlide(Object.assign({}, slideForm, patch));
      }).catch(function(err) {
        setUploading(false);
        setSaveErr("Image upload failed: " + ((err && err.message) || "Unknown error"));
      });
    };
    const deleteSlide = (id) => set("heroSlides", (s.heroSlides || []).filter((sl) => sl.id !== id));
    const moveSlide = (id, dir) => {
      const slides = s.heroSlides || [];
      const i = slides.findIndex((sl) => sl.id === id);
      const next = i + dir;
      if (next < 0 || next >= slides.length) return;
      const arr = [...slides]; [arr[i], arr[next]] = [arr[next], arr[i]];
      set("heroSlides", arr);
    };
    const uploadSlideImage = (e) => {
      const file = e.target.files && e.target.files[0];
      if (!file || !/^image\//.test(file.type)) return;
      e.target.value = "";
      setSaveErr("");
      setUploading(true);
      // Stage the picked image as a transient source (_src) for the focal-point picker.
      // Downscale to <=1600px first so the source stays light; the actual desktop/mobile
      // crops + uploads happen on Save (see saveSlide). No base64 is ever persisted.
      compressImage(file, 1600, 0.9).then(function(smaller) {
        return new Promise(function(resolve, reject) {
          var r = new FileReader();
          r.onload = function() { resolve(r.result); };
          r.onerror = function() { reject(new Error("read failed")); };
          r.readAsDataURL(smaller);
        });
      }).then(function(dataUrl) {
        setSlideForm((f) => ({ ...f, _src: dataUrl, focalX: f.focalX != null ? f.focalX : 50, focalY: f.focalY != null ? f.focalY : 50 }));
        setUploading(false);
      }).catch(function(err) {
        setUploading(false);
        setSaveErr("Image upload failed: " + ((err && err.message) || "Unknown error"));
      });
    };
    // Separate MOBILE image — staged as _srcMobile, uploaded whole on save (see saveSlide).
    const uploadSlideImageMobile = (e) => {
      const file = e.target.files && e.target.files[0];
      if (!file || !/^image\//.test(file.type)) return;
      e.target.value = "";
      setSaveErr("");
      setUploading(true);
      compressImage(file, 1600, 0.9).then(function(smaller) {
        return new Promise(function(resolve, reject) {
          var r = new FileReader();
          r.onload = function() { resolve(r.result); };
          r.onerror = function() { reject(new Error("read failed")); };
          r.readAsDataURL(smaller);
        });
      }).then(function(dataUrl) {
        setSlideForm((f) => ({ ...f, _srcMobile: dataUrl }));
        setUploading(false);
      }).catch(function(err) {
        setUploading(false);
        setSaveErr("Image upload failed: " + ((err && err.message) || "Unknown error"));
      });
    };
    // Set the focal point from a click on the source preview (percentages, clamped 0..100).
    const setFocalFromEvent = (e) => {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
      const y = Math.max(0, Math.min(100, ((e.clientY - rect.top) / rect.height) * 100));
      setSlideForm((f) => ({ ...f, focalX: Math.round(x), focalY: Math.round(y) }));
    };

    const ICON_SET = [{ value: "sparkles", label: "Sparkles" }, { value: "rocket", label: "Rocket" }, { value: "bell", label: "Bell" }, { value: "gift", label: "Gift" }, { value: "building-2", label: "Building" }, { value: "badge-check", label: "Verified" }, { value: "star", label: "Star" }, { value: "trending-up", label: "Trending" }, { value: "briefcase", label: "Briefcase" }, { value: "messages-square", label: "Community" }];
    const BannerCard = (key, label, sub, iconName, iconTint, opts) => {
      const b = s[key] || {};
      const o = opts || {};
      return (
        <Card padding={24} style={{ marginTop: 18 }}>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16 }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 36, height: 36, borderRadius: "var(--radius-md)", background: iconTint[0], color: iconTint[1] }}>{I(iconName, 18)}</span>
                <h3 style={{ fontSize: "var(--text-lg)", fontWeight: 700, color: "var(--text-strong)" }}>{label}</h3>
              </div>
              <p style={{ fontSize: "var(--text-sm)", color: "var(--text-muted)", marginTop: 8 }}>{sub}</p>
              {o.size && <div style={{ display: "inline-flex", alignItems: "center", gap: 5, marginTop: 8, fontSize: "var(--text-xs)", fontWeight: 700, color: "var(--text-brand)", background: "var(--brand-subtle)", borderRadius: "var(--radius-pill)", padding: "3px 10px" }}>{I("image", 13)} Recommended image: {o.size}</div>}
            </div>
            <Switch checked={b.visible} onChange={(v) => setBanner(key, "visible", v)} />
          </div>
          {o.mobileToggle && (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, marginTop: 14, paddingTop: 14, borderTop: "1px solid var(--border-subtle)", opacity: b.visible ? 1 : 0.45, pointerEvents: b.visible ? "auto" : "none" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 36, height: 36, borderRadius: "var(--radius-md)", background: "var(--brand-subtle)", color: "var(--brand)" }}>{I("smartphone", 18)}</span>
                <div>
                  <div style={{ fontSize: "var(--text-sm)", fontWeight: 700, color: "var(--text-strong)" }}>Show on mobile view</div>
                  <p style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)", marginTop: 2 }}>When off, this banner is hidden on phones (≤767px) but still shows on desktop.</p>
                </div>
              </div>
              <Switch checked={b.mobileVisible === true} onChange={(v) => setBanner(key, "mobileVisible", v)} />
            </div>
          )}
          <div className="krm-form-grid" style={{ marginTop: 20, paddingTop: 18, borderTop: "1px solid var(--border-subtle)", opacity: b.visible ? 1 : 0.45, pointerEvents: b.visible ? "auto" : "none", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <div style={{ gridColumn: "1 / -1" }}>
              <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", padding: "8px 10px", borderRadius: "var(--radius-md)", background: b.hideText ? "var(--brand-subtle)" : "var(--surface-sunken)", border: "1px solid " + (b.hideText ? "var(--brand)" : "var(--border-subtle)") }}>
                <input type="checkbox" checked={!!b.hideText} onChange={(e) => setBanner(key, "hideText", e.target.checked)} style={{ width: 16, height: 16, accentColor: "var(--brand)", cursor: "pointer", flexShrink: 0 }} />
                <span style={{ fontSize: "var(--text-sm)", fontWeight: 700, color: "var(--text-strong)" }}>Show background image only</span>
                <span style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>Hides the title, message &amp; button — use when your image already has the text.</span>
              </label>
            </div>
            <Input label="Headline" value={b.title} onChange={(e) => setBanner(key, "title", e.target.value)} />
            <Input label="Button label" value={b.cta} onChange={(e) => setBanner(key, "cta", e.target.value)} />
            <div style={{ gridColumn: "1 / -1" }}>
              <Input label="Button URL (leave blank to use default action)" value={b.ctaUrl || ""} onChange={(e) => setBanner(key, "ctaUrl", e.target.value)} placeholder="https://… or /krama/ui_kits/…" iconLeft={I("link", 16)} />
            </div>
            <div style={{ gridColumn: "1 / -1" }}>
              <Textarea label="Message" rows={2} value={b.message} onChange={(e) => setBanner(key, "message", e.target.value)} />
            </div>
            <Select label="Icon" value={b.icon} onChange={(e) => setBanner(key, "icon", e.target.value)} options={ICON_SET} />
            <div style={{ gridColumn: "1 / -1" }}>
              <div style={{ fontSize: "var(--text-sm)", fontWeight: 600, color: "var(--text-strong)", marginBottom: 8 }}>Theme</div>
              <div style={{ display: "flex", gap: 8 }}>
                {[["teal", "var(--teal-700)"], ["saffron", "var(--saffron-500)"], ["dark", "var(--stone-900)"], ["blank", "var(--surface-card)"], ["transparent", null], ["custom", null]].map(([val, col]) => (
                  <button key={val} onClick={() => setBanner(key, "theme", val)} title={val} style={{ flex: 1, height: 40, borderRadius: "var(--radius-md)", cursor: "pointer", border: "2px solid " + (b.theme === val ? "var(--brand)" : "var(--border)"), background: col || (val === "transparent" ? "var(--surface-sunken)" : "var(--surface-card)"), fontSize: 10, fontWeight: 700, fontFamily: "var(--font-sans)", color: col ? "transparent" : "var(--text-muted)", textTransform: "capitalize" }}>{val === "transparent" || val === "custom" ? val : ""}</button>
                ))}
              </div>
              {/* Text colour — always visible, overrides the theme default */}
              <div style={{ marginTop: 10, display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)", minWidth: 72 }}>Text colour</div>
                <input type="color" value={b.customFg || "#ffffff"} onChange={(e) => setBanner(key, "customFg", e.target.value)} style={{ width: 32, height: 28, border: "1px solid var(--border)", borderRadius: "var(--radius-sm)", cursor: "pointer", padding: 2, flexShrink: 0 }} />
                <input value={b.customFg || ""} onChange={(e) => setBanner(key, "customFg", e.target.value)} placeholder="theme default" style={{ width: 96, border: "1px solid var(--border)", borderRadius: "var(--radius-sm)", padding: "4px 8px", fontFamily: "monospace", fontSize: 12 }} />
                {b.customFg && <button onClick={() => setBanner(key, "customFg", "")} title="Reset to theme default" style={{ height: 28, padding: "0 8px", border: "1px solid var(--border)", borderRadius: "var(--radius-sm)", background: "var(--surface-card)", color: "var(--text-muted)", fontFamily: "var(--font-sans)", fontSize: 11, cursor: "pointer" }}>Reset</button>}
              </div>
              {(b.theme === "custom" || b.theme === "transparent") && (
                <div style={{ marginTop: 8, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                  {b.theme === "custom" && (
                    <div>
                      <div style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)", marginBottom: 4 }}>Background</div>
                      <div style={{ display: "flex", gap: 6 }}><input type="color" value={b.customBg || "#1a56db"} onChange={(e) => setBanner(key, "customBg", e.target.value)} style={{ width: 36, height: 32, border: "1px solid var(--border)", borderRadius: "var(--radius-sm)", cursor: "pointer", padding: 2 }} /><input value={b.customBg || ""} onChange={(e) => setBanner(key, "customBg", e.target.value)} placeholder="#1a56db" style={{ flex: 1, border: "1px solid var(--border)", borderRadius: "var(--radius-sm)", padding: "5px 8px", fontFamily: "monospace", fontSize: 12 }} /></div>
                    </div>
                  )}
                  <div>
                    <div style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)", marginBottom: 4 }}>Button colour</div>
                    <div style={{ display: "flex", gap: 6 }}><input type="color" value={b.customCtaBg || "#ffffff"} onChange={(e) => setBanner(key, "customCtaBg", e.target.value)} style={{ width: 36, height: 32, border: "1px solid var(--border)", borderRadius: "var(--radius-sm)", cursor: "pointer", padding: 2 }} /><input value={b.customCtaBg || ""} onChange={(e) => setBanner(key, "customCtaBg", e.target.value)} placeholder="#ffffff" style={{ flex: 1, border: "1px solid var(--border)", borderRadius: "var(--radius-sm)", padding: "5px 8px", fontFamily: "monospace", fontSize: 12 }} /></div>
                  </div>
                  <div>
                    <div style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)", marginBottom: 4 }}>Button text</div>
                    <div style={{ display: "flex", gap: 6 }}><input type="color" value={b.customCtaFg || "#1a56db"} onChange={(e) => setBanner(key, "customCtaFg", e.target.value)} style={{ width: 36, height: 32, border: "1px solid var(--border)", borderRadius: "var(--radius-sm)", cursor: "pointer", padding: 2 }} /><input value={b.customCtaFg || ""} onChange={(e) => setBanner(key, "customCtaFg", e.target.value)} placeholder="#1a56db" style={{ flex: 1, border: "1px solid var(--border)", borderRadius: "var(--radius-sm)", padding: "5px 8px", fontFamily: "monospace", fontSize: 12 }} /></div>
                  </div>
                </div>
              )}
            </div>
            <div style={{ gridColumn: "1 / -1", display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ width: 88, height: 52, flexShrink: 0, borderRadius: "var(--radius-md)", border: "1px solid var(--border)", background: b.image ? "transparent" : "var(--surface-sunken)", backgroundImage: b.image ? "url('" + b.image + "')" : "none", backgroundSize: "cover", backgroundPosition: "center", display: "flex", alignItems: "center", justifyContent: "center" }}>
                {b._uploading && <span style={{ fontSize: 10, color: "var(--text-muted)", fontFamily: "var(--font-sans)" }}>Uploading…</span>}
              </div>
              <div>
                <label style={{ display: "inline-flex", alignItems: "center", gap: 6, cursor: b._uploading ? "not-allowed" : "pointer", opacity: b._uploading ? 0.5 : 1, fontFamily: "var(--font-sans)", fontSize: "var(--text-sm)", fontWeight: 700, color: "var(--text-brand)" }}>
                  {I("upload", 14)} {b._uploading ? "Uploading…" : b.image ? "Replace image" : "Upload image"}
                  <input type="file" accept="image/*" disabled={!!b._uploading} onChange={uploadTo(key)} style={{ display: "none" }} />
                </label>
                {b.image ? (
                  <div>
                    <div style={{ display: "flex", gap: 6, marginTop: 8 }}>
                      {["cover", "contain"].map((f) => (
                        <button key={f} onClick={() => setBanner(key, "fit", f)} style={{ height: 28, padding: "0 12px", borderRadius: "var(--radius-sm)", cursor: "pointer", border: "1px solid " + (b.fit === f ? "var(--brand)" : "var(--border-strong)"), background: b.fit === f ? "var(--brand-subtle)" : "var(--surface-card)", color: b.fit === f ? "var(--text-brand)" : "var(--text-muted)", fontFamily: "var(--font-sans)", fontSize: "var(--text-xs)", fontWeight: 700 }}>{f}</button>
                      ))}
                      <button onClick={() => setBanner(key, "image", "")} style={{ height: 28, padding: "0 12px", borderRadius: "var(--radius-sm)", cursor: "pointer", border: "1px solid var(--border-strong)", background: "var(--surface-card)", color: "var(--text-muted)", fontFamily: "var(--font-sans)", fontSize: "var(--text-xs)", fontWeight: 700 }}>Remove</button>
                    </div>
                    <div style={{ marginTop: 12 }}>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
                        <span style={{ fontSize: "var(--text-xs)", fontWeight: 600, color: "var(--text-muted)" }}>Image visibility</span>
                        <span style={{ fontSize: "var(--text-xs)", fontWeight: 700, color: "var(--text-brand)" }}>{100 - (b.imgOverlay != null ? b.imgOverlay : 20)}%</span>
                      </div>
                      <input type="range" min={0} max={80} step={5} value={b.imgOverlay != null ? b.imgOverlay : 20} onChange={(e) => setBanner(key, "imgOverlay", Number(e.target.value))} style={{ width: "100%", accentColor: "var(--brand)" }} />
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: "var(--text-muted)", marginTop: 2 }}><span>Full colour</span><span>Clear image</span></div>
                    </div>
                  </div>
                ) : <div style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)", marginTop: 4 }}>Optional -- image sits behind the text.</div>}
              </div>
            </div>
          </div>
        </Card>
      );
    };

    return (
      <div className="krm-page-pad" style={{ padding: 28, maxWidth: 1100 }}>
        <ScreenHead title="Homepage content" sub="Control sections and banners on the public website. Changes apply after Save."
          action={<Button variant="primary" iconLeft={I("check", 16)} onClick={apply}>Save changes</Button>} />

        {saved ? (
          <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 16px", background: "var(--success-subtle)", border: "1px solid var(--success-border)", borderRadius: "var(--radius-md)", color: "var(--success)", fontWeight: 600, fontSize: "var(--text-sm)", marginBottom: 18 }}>
            {I("circle-check-big", 16)} Saved -- reload the public website to see the change.
          </div>
        ) : null}
        {saveErr ? (
          <div style={{ display: "flex", alignItems: "flex-start", gap: 10, padding: "12px 16px", background: "var(--danger-subtle)", border: "1px solid var(--danger-border)", borderRadius: "var(--radius-md)", color: "var(--danger)", fontSize: "var(--text-sm)", marginBottom: 18 }}>
            {I("alert-triangle", 16)} <span>{saveErr}</span>
          </div>
        ) : null}

        <Tabs value={hpTab} onChange={setHpTab} tabs={[{ value: "home", label: "Home page" }, { value: "findjobs", label: "Find Jobs" }, { value: "jobdetail", label: "Job Detail" }, { value: "companies", label: "Companies" }, { value: "members", label: "Members" }, { value: "community", label: "Community" }, { value: "explore", label: "Explore" }]} style={{ marginBottom: 20 }} />

        {hpTab === "home" && <React.Fragment>

        {/* ── Promotional Banners ──────────────────────────────────────────── */}
        <Card padding={24} style={{ marginBottom: 18 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 36, height: 36, borderRadius: "var(--radius-md)", background: "var(--warning-subtle)", color: "var(--warning)" }}>{I("megaphone", 18)}</span>
              <div>
                <h3 style={{ fontSize: "var(--text-lg)", fontWeight: 700, color: "var(--text-strong)" }}>Promotional Banners</h3>
                <p style={{ fontSize: "var(--text-sm)", color: "var(--text-muted)", marginTop: 2 }}>Stack banners at the top of the public website. Each can be scheduled and toggled independently.</p>
              </div>
            </div>
            <Button variant="primary" size="sm" iconLeft={I("plus", 14)} onClick={() => setBannerEditing({ isNew: true, title: "New announcement", message: "", cta: "Learn more", theme: "teal", icon: "megaphone", image: "", align: "left", fit: "cover", active: true, start: "", end: "" })}>New banner</Button>
          </div>
          {bannerMsg && <div style={{ padding: "10px 14px", background: "var(--success-subtle)", color: "var(--success)", borderRadius: "var(--radius-md)", marginBottom: 14, fontWeight: 600, fontSize: "var(--text-sm)" }}>{bannerMsg}</div>}
          <div style={{ marginBottom: 6, fontSize: "var(--text-xs)", fontWeight: 700, letterSpacing: ".06em", textTransform: "uppercase", color: "var(--text-faint)" }}>
            Live preview {bannerLiveStack.length > 0 ? "· " + bannerLiveStack.length + " showing" : ""}
          </div>
          <div style={{ border: "1px solid var(--border)", borderRadius: "var(--radius-lg)", overflow: "hidden", boxShadow: "var(--shadow-sm)", marginBottom: 16 }}>
            {bannerLiveStack.length > 0
              ? bannerLiveStack.map((b) => <BannerStrip key={b.id} data={b} onDismiss={null} />)
              : <div style={{ padding: "14px 16px", background: "var(--surface-sunken)", color: "var(--text-muted)", fontSize: "var(--text-sm)" }}>No banners live right now.</div>}
          </div>
          {bannerLoading ? (
            <div style={{ padding: "14px 0", color: "var(--text-muted)", fontSize: "var(--text-sm)", textAlign: "center" }}>Loading…</div>
          ) : banners.length === 0 ? (
            <div style={{ padding: "14px 0", color: "var(--text-muted)", fontSize: "var(--text-sm)", textAlign: "center" }}>No banners yet — click "New banner" to create one.</div>
          ) : (
            <div className="krm-table-wrap"><div style={{ border: "1px solid var(--border)", borderRadius: "var(--radius-md)", overflow: "hidden" }}>
              <div style={{ display: "grid", gridTemplateColumns: "36px 2.4fr 1fr 1.4fr 140px", padding: "10px 16px", fontSize: "var(--text-xs)", fontWeight: 700, letterSpacing: ".04em", textTransform: "uppercase", color: "var(--text-faint)", borderBottom: "1px solid var(--border)" }}>
                <span></span><span>Banner</span><span>Status</span><span>Schedule</span><span style={{ textAlign: "right" }}>Actions</span>
              </div>
              {banners.map((b, i) => {
                const st = bannerStatus(b);
                const t = resolveBannerTheme(b);
                return (
                  <div key={b.id} style={{ display: "grid", gridTemplateColumns: "36px 2.4fr 1fr 1.4fr 140px", alignItems: "center", padding: "12px 16px", borderBottom: i < banners.length - 1 ? "1px solid var(--border-subtle)" : "none" }}>
                    <span style={{ width: 26, height: 26, borderRadius: "var(--radius-sm)", background: t.bg, color: t.fg, display: "inline-flex", alignItems: "center", justifyContent: "center" }}>{I(b.icon, 14)}</span>
                    <div style={{ minWidth: 0, paddingRight: 12 }}>
                      <div style={{ fontWeight: 700, color: "var(--text-strong)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{b.title}</div>
                      <div style={{ fontSize: "var(--text-sm)", color: "var(--text-muted)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{b.message}</div>
                    </div>
                    <span><Badge tone={STATUS_TONE[st]}>{STATUS_LABEL[st]}</Badge></span>
                    <span style={{ fontSize: "var(--text-sm)", color: "var(--text-muted)", display: "inline-flex", alignItems: "center", gap: 6 }}>
                      {I("calendar", 13)}{fmtDate(b.start)} - {fmtDate(b.end)}
                    </span>
                    <div style={{ display: "flex", gap: 6, justifyContent: "flex-end", alignItems: "center" }}>
                      <Switch checked={b.active} onChange={() => toggleBanner(b.id)} />
                      <IconButton size="sm" variant="ghost" aria-label="Edit" onClick={() => setBannerEditing(b)}>{I("pencil", 14)}</IconButton>
                      <IconButton size="sm" variant="ghost" aria-label="Delete" onClick={() => removeBanner(b.id)}>{I("trash-2", 14)}</IconButton>
                    </div>
                  </div>
                );
              })}
            </div></div>
          )}
        </Card>

        {/* ── Hero Slideshow ─────────────────────────────────────────────── */}
        {(function() {
          const slides = s.heroSlides || [];
          return (
            <Card padding={24} style={{ marginBottom: 18 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 36, height: 36, borderRadius: "var(--radius-md)", background: "var(--info-subtle)", color: "var(--info)" }}>{I("layout-template", 18)}</span>
                  <div>
                    <h3 style={{ fontSize: "var(--text-lg)", fontWeight: 700, color: "var(--text-strong)" }}>Main Banner Slideshow</h3>
                    <p style={{ fontSize: "var(--text-sm)", color: "var(--text-muted)", marginTop: 2 }}>Hero slides on the home page -- auto-advances every 5 seconds.</p>
                  </div>
                </div>
                <Button variant="primary" size="sm" iconLeft={I("plus", 14)} onClick={openNewSlide}>Add slide</Button>
              </div>

              {slides.length === 0 ? (
                <div style={{ textAlign: "center", padding: "28px 0", color: "var(--text-muted)", fontSize: "var(--text-sm)" }}>No slides yet -- click "Add slide" to create one.</div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {slides.map((sl, i) => (
                    <div key={sl.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 14px", border: "1px solid var(--border)", borderRadius: "var(--radius-md)", background: "var(--surface-sunken)" }}>
                      <div style={{ width: 10, height: 10, borderRadius: "50%", background: SLIDE_THEME_COLORS[sl.theme] || SLIDE_THEME_COLORS.teal, flexShrink: 0 }} />
                      {sl.image && <div style={{ width: 48, height: 32, borderRadius: "var(--radius-sm)", backgroundImage: "url('" + sl.image + "')", backgroundSize: "cover", backgroundPosition: "center", flexShrink: 0 }} />}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 700, fontSize: "var(--text-sm)", color: "var(--text-strong)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{sl.title || "(untitled)"}</div>
                        {sl.subtitle && <div style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)", marginTop: 2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{sl.subtitle}</div>}
                      </div>
                      <div style={{ display: "flex", gap: 4, flexShrink: 0 }}>
                        <button onClick={() => moveSlide(sl.id, -1)} disabled={i === 0} style={{ width: 28, height: 28, border: "1px solid var(--border-strong)", borderRadius: "var(--radius-sm)", background: "var(--surface-card)", cursor: i === 0 ? "not-allowed" : "pointer", color: "var(--text-muted)", display: "inline-flex", alignItems: "center", justifyContent: "center" }}>{I("chevron-up", 14)}</button>
                        <button onClick={() => moveSlide(sl.id, 1)} disabled={i === slides.length - 1} style={{ width: 28, height: 28, border: "1px solid var(--border-strong)", borderRadius: "var(--radius-sm)", background: "var(--surface-card)", cursor: i === slides.length - 1 ? "not-allowed" : "pointer", color: "var(--text-muted)", display: "inline-flex", alignItems: "center", justifyContent: "center" }}>{I("chevron-down", 14)}</button>
                        <button onClick={() => openEditSlide(sl)} style={{ width: 28, height: 28, border: "1px solid var(--border-strong)", borderRadius: "var(--radius-sm)", background: "var(--surface-card)", cursor: "pointer", color: "var(--text-muted)", display: "inline-flex", alignItems: "center", justifyContent: "center" }}>{I("pencil", 13)}</button>
                        <button onClick={() => deleteSlide(sl.id)} style={{ width: 28, height: 28, border: "1px solid var(--danger-subtle)", borderRadius: "var(--radius-sm)", background: "var(--danger-subtle)", cursor: "pointer", color: "var(--danger)", display: "inline-flex", alignItems: "center", justifyContent: "center" }}>{I("trash-2", 13)}</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Slide edit modal */}
              {editSlide && (
                <div style={{ position: "fixed", inset: 0, zIndex: 300, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
                  <div onClick={closeSlide} style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.5)" }} />
                  <div onClick={(e) => e.stopPropagation()} style={{ position: "relative", width: "100%", maxWidth: 560, background: "var(--surface-card)", borderRadius: "var(--radius-xl)", boxShadow: "var(--shadow-xl)", overflow: "hidden", maxHeight: "90vh", display: "flex", flexDirection: "column" }}>
                    <div style={{ padding: "20px 24px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <h3 style={{ fontWeight: 700, fontSize: "var(--text-lg)", color: "var(--text-strong)" }}>{editSlide === "new" ? "Add slide" : "Edit slide"}</h3>
                      <button onClick={closeSlide} style={{ border: "none", background: "transparent", cursor: "pointer", color: "var(--text-muted)", display: "inline-flex" }}>{I("x", 18)}</button>
                    </div>
                    <div style={{ padding: 24, overflowY: "auto", display: "flex", flexDirection: "column", gap: 14 }}>
                      {/* Preview */}
                      <div style={{ position: "relative", overflow: "hidden", borderRadius: "var(--radius-md)", background: resolveSlidePreviewBg(slideForm), minHeight: 80, padding: "14px 16px", color: resolveSlidePreviewFg(slideForm), border: slideForm.theme === "transparent" ? "1px solid var(--border)" : "none" }}>
                        {(slideForm._src || slideForm.image) && <div style={{ position: "absolute", inset: 0, backgroundImage: "url('" + (slideForm._src || slideForm.image) + "')", backgroundSize: slideForm.fit === "contain" ? "contain" : "cover", backgroundRepeat: "no-repeat", backgroundPosition: (slideForm.focalX != null ? slideForm.focalX : 50) + "% " + (slideForm.focalY != null ? slideForm.focalY : 50) + "%", opacity: 0.2 }} />}
                        <div style={{ position: "relative" }}>
                          {slideForm.badge && <div style={{ display: "inline-block", background: "rgba(255,255,255,0.2)", fontSize: "var(--text-xs)", fontWeight: 600, padding: "3px 10px", borderRadius: "var(--radius-pill)", marginBottom: 6 }}>{slideForm.badge}</div>}
                          <div style={{ fontWeight: 800, fontSize: "var(--text-lg)", lineHeight: 1.2 }}>{slideForm.title || "Slide title"}</div>
                          {slideForm.subtitle && <div style={{ fontSize: "var(--text-xs)", opacity: 0.8, marginTop: 4 }}>{slideForm.subtitle}</div>}
                          {slideForm.ctaLabel && <div style={{ marginTop: 8, display: "inline-block", background: "rgba(255,255,255,0.25)", fontSize: "var(--text-xs)", fontWeight: 700, padding: "4px 12px", borderRadius: "var(--radius-sm)" }}>{slideForm.ctaLabel}</div>}
                        </div>
                      </div>

                      <Input label="Title" value={slideForm.title} onChange={(e) => setSlideForm((f) => ({ ...f, title: e.target.value }))} placeholder="Find work that fits your life" />
                      <Textarea label="Subtitle" rows={2} value={slideForm.subtitle} onChange={(e) => setSlideForm((f) => ({ ...f, subtitle: e.target.value }))} placeholder="Short description under the title" />
                      <Input label="Badge text (optional)" value={slideForm.badge} onChange={(e) => setSlideForm((f) => ({ ...f, badge: e.target.value }))} placeholder="e.g. 12,480 open jobs" />
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                        <Input label="CTA button label" value={slideForm.ctaLabel} onChange={(e) => setSlideForm((f) => ({ ...f, ctaLabel: e.target.value }))} placeholder="Browse jobs" />
                        <Input label="CTA URL (blank = Browse jobs)" value={slideForm.ctaUrl} onChange={(e) => setSlideForm((f) => ({ ...f, ctaUrl: e.target.value }))} placeholder="https://…" iconLeft={I("link", 14)} />
                      </div>

                      {/* Theme */}
                      <div>
                        <div style={{ fontSize: "var(--text-sm)", fontWeight: 600, color: "var(--text-strong)", marginBottom: 8 }}>Theme colour</div>
                        <div style={{ display: "flex", gap: 8 }}>
                          {[["teal", "var(--teal-700)"], ["saffron", "var(--saffron-500)"], ["dark", "var(--stone-900)"], ["brand", "var(--brand)"], ["blank", "var(--surface-card)"], ["transparent", null], ["custom", null]].map(([val, col]) => (
                            <button key={val} onClick={() => setSlideForm((f) => ({ ...f, theme: val }))} title={val} style={{ flex: 1, height: 40, borderRadius: "var(--radius-md)", cursor: "pointer", border: "2px solid " + (slideForm.theme === val ? "var(--brand)" : "var(--border)"), background: col || (val === "transparent" ? "var(--surface-sunken)" : "var(--surface-card)"), position: "relative", fontSize: 10, fontWeight: 700, fontFamily: "var(--font-sans)", color: "var(--text-muted)", textTransform: "capitalize" }}>
                              {!col && val}
                              {slideForm.theme === val && <span style={{ position: "absolute", top: 3, right: 3, width: 14, height: 14, borderRadius: "50%", background: "#fff", display: "inline-flex", alignItems: "center", justifyContent: "center", color: "var(--stone-900)" }}>{I("check", 9)}</span>}
                            </button>
                          ))}
                        </div>
                        {(slideForm.theme === "custom" || slideForm.theme === "transparent") && (
                          <div style={{ marginTop: 10, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                            {slideForm.theme === "custom" && (
                              <div>
                                <div style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)", marginBottom: 4 }}>Background</div>
                                <div style={{ display: "flex", gap: 6 }}><input type="color" value={slideForm.customBg || "#1a56db"} onChange={(e) => setSlideForm((f) => ({ ...f, customBg: e.target.value }))} style={{ width: 36, height: 32, border: "1px solid var(--border)", borderRadius: "var(--radius-sm)", cursor: "pointer", padding: 2 }} /><input value={slideForm.customBg || ""} onChange={(e) => setSlideForm((f) => ({ ...f, customBg: e.target.value }))} placeholder="#1a56db" style={{ flex: 1, border: "1px solid var(--border)", borderRadius: "var(--radius-sm)", padding: "5px 8px", fontFamily: "monospace", fontSize: 12 }} /></div>
                              </div>
                            )}
                            <div>
                              <div style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)", marginBottom: 4 }}>Text colour</div>
                              <div style={{ display: "flex", gap: 6 }}><input type="color" value={slideForm.customFg || "#ffffff"} onChange={(e) => setSlideForm((f) => ({ ...f, customFg: e.target.value }))} style={{ width: 36, height: 32, border: "1px solid var(--border)", borderRadius: "var(--radius-sm)", cursor: "pointer", padding: 2 }} /><input value={slideForm.customFg || ""} onChange={(e) => setSlideForm((f) => ({ ...f, customFg: e.target.value }))} placeholder="#ffffff" style={{ flex: 1, border: "1px solid var(--border)", borderRadius: "var(--radius-sm)", padding: "5px 8px", fontFamily: "monospace", fontSize: 12 }} /></div>
                            </div>
                            <div>
                              <div style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)", marginBottom: 4 }}>Button colour</div>
                              <div style={{ display: "flex", gap: 6 }}><input type="color" value={slideForm.customCtaBg || "#ffb703"} onChange={(e) => setSlideForm((f) => ({ ...f, customCtaBg: e.target.value }))} style={{ width: 36, height: 32, border: "1px solid var(--border)", borderRadius: "var(--radius-sm)", cursor: "pointer", padding: 2 }} /><input value={slideForm.customCtaBg || ""} onChange={(e) => setSlideForm((f) => ({ ...f, customCtaBg: e.target.value }))} placeholder="#ffb703" style={{ flex: 1, border: "1px solid var(--border)", borderRadius: "var(--radius-sm)", padding: "5px 8px", fontFamily: "monospace", fontSize: 12 }} /></div>
                            </div>
                            <div>
                              <div style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)", marginBottom: 4 }}>Button text</div>
                              <div style={{ display: "flex", gap: 6 }}><input type="color" value={slideForm.customCtaFg || "#ffffff"} onChange={(e) => setSlideForm((f) => ({ ...f, customCtaFg: e.target.value }))} style={{ width: 36, height: 32, border: "1px solid var(--border)", borderRadius: "var(--radius-sm)", cursor: "pointer", padding: 2 }} /><input value={slideForm.customCtaFg || ""} onChange={(e) => setSlideForm((f) => ({ ...f, customCtaFg: e.target.value }))} placeholder="#ffffff" style={{ flex: 1, border: "1px solid var(--border)", borderRadius: "var(--radius-sm)", padding: "5px 8px", fontFamily: "monospace", fontSize: 12 }} /></div>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Image */}
                      <div>
                        <div style={{ fontSize: "var(--text-sm)", fontWeight: 600, color: "var(--text-strong)", marginBottom: 8 }}>{slideForm.imageOnly ? "Banner image" : "Background image (optional)"}</div>
                        <div style={{ display: "inline-flex", alignItems: "center", gap: 5, marginBottom: 10, fontSize: "var(--text-xs)", fontWeight: 700, color: "var(--text-brand)", background: "var(--brand-subtle)", borderRadius: "var(--radius-pill)", padding: "3px 10px" }}>{I("image", 13)} Recommended image: 1600 × 480px</div>
                        <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", marginBottom: 10, padding: "8px 10px", borderRadius: "var(--radius-md)", background: slideForm.imageOnly ? "var(--brand-subtle)" : "var(--surface-sunken)", border: "1px solid " + (slideForm.imageOnly ? "var(--brand)" : "var(--border-subtle)") }}>
                          <input type="checkbox" checked={!!slideForm.imageOnly} onChange={(e) => setSlideForm((f) => ({ ...f, imageOnly: e.target.checked }))} style={{ width: 16, height: 16, accentColor: "var(--brand)", cursor: "pointer", flexShrink: 0 }} />
                          <span style={{ fontSize: "var(--text-sm)", fontWeight: 700, color: "var(--text-strong)" }}>Hide title &amp; search bar (show banner image only)</span>
                          <span style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>On: only your banner image shows, filling the hero on desktop &amp; mobile (use a 1600 × 480px image). Off: the title, subtitle &amp; search bar are shown over the image.</span>
                        </label>
                        {!slideForm.imageOnly && (
                        <div style={{ marginBottom: 12, display: "grid", gap: 6 }}>
                          <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", padding: "7px 10px", borderRadius: "var(--radius-md)", background: slideForm.hideTitleDesktop ? "var(--brand-subtle)" : "var(--surface-sunken)", border: "1px solid " + (slideForm.hideTitleDesktop ? "var(--brand)" : "var(--border-subtle)") }}>
                            <input type="checkbox" checked={!!slideForm.hideTitleDesktop} onChange={(e) => setSlideForm((f) => ({ ...f, hideTitleDesktop: e.target.checked }))} style={{ width: 16, height: 16, accentColor: "var(--brand)", cursor: "pointer", flexShrink: 0 }} />
                            <span style={{ fontSize: "var(--text-sm)", fontWeight: 700, color: "var(--text-strong)" }}>Hide title on desktop</span>
                          </label>
                          <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", padding: "7px 10px", borderRadius: "var(--radius-md)", background: slideForm.hideTitleMobile ? "var(--brand-subtle)" : "var(--surface-sunken)", border: "1px solid " + (slideForm.hideTitleMobile ? "var(--brand)" : "var(--border-subtle)") }}>
                            <input type="checkbox" checked={!!slideForm.hideTitleMobile} onChange={(e) => setSlideForm((f) => ({ ...f, hideTitleMobile: e.target.checked }))} style={{ width: 16, height: 16, accentColor: "var(--brand)", cursor: "pointer", flexShrink: 0 }} />
                            <span style={{ fontSize: "var(--text-sm)", fontWeight: 700, color: "var(--text-strong)" }}>Hide title on mobile</span>
                          </label>
                          <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", padding: "7px 10px", borderRadius: "var(--radius-md)", background: slideForm.searchDesktopOnly ? "var(--brand-subtle)" : "var(--surface-sunken)", border: "1px solid " + (slideForm.searchDesktopOnly ? "var(--brand)" : "var(--border-subtle)") }}>
                            <input type="checkbox" checked={!!slideForm.searchDesktopOnly} onChange={(e) => setSlideForm((f) => ({ ...f, searchDesktopOnly: e.target.checked }))} style={{ width: 16, height: 16, accentColor: "var(--brand)", cursor: "pointer", flexShrink: 0 }} />
                            <span style={{ fontSize: "var(--text-sm)", fontWeight: 700, color: "var(--text-strong)" }}>Show search on desktop only (hide on mobile)</span>
                          </label>
                        </div>
                        )}
                        <div style={{ fontSize: "var(--text-xs)", fontWeight: 700, color: "var(--text-strong)", marginBottom: 6 }}>Banner image</div>
                        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                          {(slideForm._src || slideForm.image) && <div style={{ width: 80, height: 48, borderRadius: "var(--radius-sm)", backgroundImage: "url('" + (slideForm._src || slideForm.image) + "')", backgroundSize: "cover", backgroundPosition: (slideForm.focalX != null ? slideForm.focalX : 50) + "% " + (slideForm.focalY != null ? slideForm.focalY : 50) + "%", flexShrink: 0, border: "1px solid var(--border)" }} />}
                          <div>
                            <label style={{ display: "inline-flex", alignItems: "center", gap: 6, cursor: "pointer", fontFamily: "var(--font-sans)", fontSize: "var(--text-sm)", fontWeight: 700, color: "var(--text-brand)" }}>
                              {I("upload", 14)} {uploading ? "Processing…" : ((slideForm.image || slideForm._src) ? "Replace image" : "Upload image")}
                              <input ref={slideFileRef} type="file" accept="image/*" onChange={uploadSlideImage} style={{ display: "none" }} />
                            </label>
                            {(slideForm.image || slideForm._src) && (
                              <React.Fragment>
                                <div style={{ display: "flex", gap: 6, marginTop: 6 }}>
                                  <button onClick={() => setSlideForm((fm) => ({ ...fm, image: "", _src: undefined }))} style={{ height: 26, padding: "0 10px", borderRadius: "var(--radius-sm)", cursor: "pointer", border: "1px solid var(--border-strong)", background: "var(--surface-card)", color: "var(--text-muted)", fontFamily: "var(--font-sans)", fontSize: "var(--text-xs)", fontWeight: 700 }}>Remove</button>
                                </div>
                                {!slideForm.imageOnly && <p style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)", marginTop: 6 }}>The full image is shown uncropped on the site, with a soft blurred fill around it.</p>}
                                <div style={{ marginTop: 10, display: slideForm.imageOnly ? "none" : undefined }}>
                                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
                                    <span style={{ fontSize: "var(--text-xs)", fontWeight: 600, color: "var(--text-muted)" }}>Image visibility</span>
                                    <span style={{ fontSize: "var(--text-xs)", fontWeight: 700, color: "var(--text-brand)" }}>{100 - (slideForm.imgOverlay != null ? slideForm.imgOverlay : 20)}%</span>
                                  </div>
                                  <input type="range" min={0} max={80} step={5} value={slideForm.imgOverlay != null ? slideForm.imgOverlay : 20} onChange={(e) => setSlideForm((f) => ({ ...f, imgOverlay: Number(e.target.value) }))} style={{ width: "100%", accentColor: "var(--brand)" }} />
                                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: "var(--text-muted)", marginTop: 2 }}><span>Full colour</span><span>Clear image</span></div>
                                </div>
                              </React.Fragment>
                            )}
                          </div>
                        </div>

                        {/* Image-only ad slide: full uncropped preview */}
                        {(slideForm._src || slideForm.image) && slideForm.imageOnly && (
                          <div style={{ marginTop: 14, padding: 14, borderRadius: "var(--radius-md)", background: "var(--surface-sunken)", border: "1px solid var(--border-subtle)" }}>
                            <div style={{ fontSize: "var(--text-xs)", fontWeight: 700, color: "var(--text-strong)", marginBottom: 8 }}>Full image (shown uncropped on the site)</div>
                            <img src={slideForm._src || slideForm.image} alt="ad preview" style={{ display: "block", width: "100%", borderRadius: "var(--radius-sm)", border: "1px solid var(--border)" }} />
                          </div>
                        )}
                      </div>
                    </div>
                    <div style={{ padding: "16px 24px", borderTop: "1px solid var(--border)", display: "flex", gap: 10, justifyContent: "flex-end", background: "var(--surface-card)" }}>
                      <Button variant="ghost" onClick={closeSlide}>Cancel</Button>
                      <Button variant="primary" onClick={saveSlide} disabled={uploading || (slideForm.imageOnly ? (!slideForm.image && !slideForm._src) : !slideForm.title.trim())}>{uploading ? "Processing…" : (editSlide === "new" ? "Add slide" : "Save changes")}</Button>
                    </div>
                  </div>
                </div>
              )}
            </Card>
          );
        })()}

        {/* Top employers */}
        <Card padding={24} style={{ marginBottom: 18 }}>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16 }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 36, height: 36, borderRadius: "var(--radius-md)", background: "var(--brand-subtle)", color: "var(--brand)" }}>{I("building-2", 18)}</span>
                <h3 style={{ fontSize: "var(--text-lg)", fontWeight: 700, color: "var(--text-strong)" }}>Top employers carousel</h3>
              </div>
              <p style={{ fontSize: "var(--text-sm)", color: "var(--text-muted)", marginTop: 8 }}>The auto-scrolling logo strip below the hero.</p>
            </div>
            <Switch checked={s.topVisible} onChange={(v) => set("topVisible", v)} />
          </div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 20, paddingTop: 18, borderTop: "1px solid var(--border-subtle)", opacity: s.topVisible ? 1 : 0.45, pointerEvents: s.topVisible ? "auto" : "none" }}>
            <div>
              <div style={{ fontSize: "var(--text-sm)", fontWeight: 700, color: "var(--text-strong)" }}>Companies to show</div>
              <div style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)", marginTop: 2 }}>Up to {companies.length} available</div>
            </div>
            <Stepper value={s.topCount} min={1} max={companies.length} onChange={(v) => set("topCount", v)} />
          </div>
        </Card>

        {BannerCard("footerBanner", "Footer call-to-action banner", "The wide teal banner above the footer on the home page -- typically used to drive employer sign-ups.", "megaphone", ["var(--brand-subtle)", "var(--brand)"], { mobileToggle: true, size: "1600 × 240px" })}

        </React.Fragment>}

        {hpTab === "community" && <React.Fragment>
        {BannerCard("communityTopBanner", "Community -- Top announcement bar", "The full-width coloured bar at the very top of the Community page. Shown on both desktop and mobile. Toggle off to hide it.", "messages-square", ["var(--brand-subtle)", "var(--brand)"], { size: "1600 × 160px" })}
        </React.Fragment>}

        {hpTab === "members" && <React.Fragment>
        {BannerCard("employersTopBanner", "Members -- Top announcement bar", "The full-width coloured bar at the very top of the Members page. Toggle off to hide it.", "briefcase", ["var(--saffron-50)", "var(--saffron-600)"], { size: "1600 × 160px" })}
        {/* Members Hero banner */}
        {(function() {
          const eh = s.employersHero || {};
          const ehImg = eh.image || "";
          return (
          <Card padding={24} style={{ marginTop: 18 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
              <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 36, height: 36, borderRadius: "var(--radius-md)", background: "var(--teal-50)", color: "var(--teal-700)" }}>{I("layout-panel-top", 18)}</span>
              <div>
                <h3 style={{ fontSize: "var(--text-lg)", fontWeight: 700, color: "var(--text-strong)" }}>Members -- Hero banner</h3>
                <p style={{ fontSize: "var(--text-sm)", color: "var(--text-muted)" }}>The large teal banner with the page title and subtitle on the Members page.</p>
              </div>
            </div>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 5, marginBottom: 16, fontSize: "var(--text-xs)", fontWeight: 700, color: "var(--text-brand)", background: "var(--brand-subtle)", borderRadius: "var(--radius-pill)", padding: "3px 10px" }}>{I("image", 13)} Recommended image: 1600 × 220px</div>
            <div style={{ display: "grid", gap: 14 }}>
              <Input label="Heading" value={eh.heading || "Hire the right people, faster."} onChange={(e) => setBanner("employersHero", "heading", e.target.value)} />
              <Textarea label="Subtitle" rows={2} value={eh.sub || ""} onChange={(e) => setBanner("employersHero", "sub", e.target.value)} />
              <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", padding: "8px 10px", borderRadius: "var(--radius-md)", background: eh.hideText ? "var(--brand-subtle)" : "var(--surface-sunken)", border: "1px solid " + (eh.hideText ? "var(--brand)" : "var(--border-subtle)") }}>
                <input type="checkbox" checked={!!eh.hideText} onChange={(e) => setBanner("employersHero", "hideText", e.target.checked)} style={{ width: 16, height: 16, accentColor: "var(--brand)", cursor: "pointer", flexShrink: 0 }} />
                <span style={{ fontSize: "var(--text-sm)", fontWeight: 700, color: "var(--text-strong)" }}>Show background image only</span>
                <span style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>Hides the heading &amp; subtitle.</span>
              </label>
            </div>
            <div style={{ marginTop: 16, paddingTop: 14, borderTop: "1px solid var(--border-subtle)", display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ width: 88, height: 52, flexShrink: 0, borderRadius: "var(--radius-md)", border: "1px solid var(--border)", background: ehImg ? "transparent" : "var(--surface-sunken)", backgroundImage: ehImg ? "url('" + ehImg + "')" : "none", backgroundSize: "cover", backgroundPosition: "center", display: "flex", alignItems: "center", justifyContent: "center" }}>
                {eh._uploading && <span style={{ fontSize: 10, color: "var(--text-muted)", fontFamily: "var(--font-sans)" }}>Uploading…</span>}
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ display: "inline-flex", alignItems: "center", gap: 6, cursor: eh._uploading ? "not-allowed" : "pointer", opacity: eh._uploading ? 0.5 : 1, fontFamily: "var(--font-sans)", fontSize: "var(--text-sm)", fontWeight: 700, color: "var(--text-brand)" }}>
                  {I("image", 14)} {eh._uploading ? "Uploading…" : ehImg ? "Replace background image" : "Upload background image"}
                  <input type="file" accept="image/*" disabled={!!eh._uploading} onChange={uploadTo("employersHero")} style={{ display: "none" }} />
                </label>
                {ehImg ? (
                  <div>
                    <div style={{ display: "flex", gap: 6, marginTop: 8 }}>
                      {["cover", "contain"].map((f) => (
                        <button key={f} onClick={() => setBanner("employersHero", "fit", f)} style={{ height: 28, padding: "0 12px", borderRadius: "var(--radius-sm)", cursor: "pointer", border: "1px solid " + ((eh.fit || "cover") === f ? "var(--brand)" : "var(--border-strong)"), background: (eh.fit || "cover") === f ? "var(--brand-subtle)" : "var(--surface-card)", color: (eh.fit || "cover") === f ? "var(--text-brand)" : "var(--text-muted)", fontFamily: "var(--font-sans)", fontSize: "var(--text-xs)", fontWeight: 700 }}>{f}</button>
                      ))}
                      <button onClick={() => setBanner("employersHero", "image", "")} style={{ height: 28, padding: "0 12px", borderRadius: "var(--radius-sm)", cursor: "pointer", border: "1px solid var(--border-strong)", background: "var(--surface-card)", color: "var(--text-muted)", fontFamily: "var(--font-sans)", fontSize: "var(--text-xs)", fontWeight: 700 }}>Remove</button>
                    </div>
                    <div style={{ marginTop: 12 }}>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
                        <span style={{ fontSize: "var(--text-xs)", fontWeight: 600, color: "var(--text-muted)" }}>Image visibility</span>
                        <span style={{ fontSize: "var(--text-xs)", fontWeight: 700, color: "var(--text-brand)" }}>{100 - (eh.imgOverlay != null ? eh.imgOverlay : 45)}%</span>
                      </div>
                      <input type="range" min={0} max={90} step={5} value={eh.imgOverlay != null ? eh.imgOverlay : 45} onChange={(e) => setBanner("employersHero", "imgOverlay", Number(e.target.value))} style={{ width: "100%", accentColor: "var(--brand)" }} />
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: "var(--text-muted)", marginTop: 2 }}><span>Full colour</span><span>Clear image</span></div>
                    </div>
                  </div>
                ) : <div style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)", marginTop: 4 }}>Optional — sits behind the heading text.</div>}
              </div>
            </div>
            <div style={{ marginTop: 14, borderRadius: "var(--radius-md)", overflow: "hidden", border: "1px solid var(--border)" }}>
              <div style={{ padding: "5px 10px", background: "var(--surface-sunken)", fontSize: "var(--text-xs)", color: "var(--text-faint)", fontWeight: 700, textTransform: "uppercase", letterSpacing: ".05em" }}>Preview</div>
              <div style={{ position: "relative", background: "var(--teal-800)", color: "#fff", padding: "20px 24px", overflow: "hidden" }}>
                {ehImg && <React.Fragment><div style={{ position: "absolute", inset: 0, backgroundImage: "url('" + ehImg + "')", backgroundSize: (eh.fit || "cover"), backgroundPosition: "center" }} /><div style={{ position: "absolute", inset: 0, background: "var(--teal-800)", opacity: (eh.imgOverlay != null ? eh.imgOverlay : 45) / 100 }} /></React.Fragment>}
                <div style={{ position: "relative" }}>
                  <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--teal-200)", marginBottom: 6 }}>Members</div>
                  <div style={{ fontSize: 22, fontWeight: 800 }}>{eh.heading || "Hire the right people, faster."}</div>
                  <div style={{ fontSize: 14, color: "var(--stone-300)", marginTop: 6 }}>{eh.sub || ""}</div>
                </div>
              </div>
            </div>
          </Card>
          );
        })()}

        </React.Fragment>}

        {hpTab === "explore" && <React.Fragment>

        {/* Explore job categories */}
        <Card padding={24} style={{ marginBottom: 18 }}>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, marginBottom: 16 }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 36, height: 36, borderRadius: "var(--radius-md)", background: "var(--success-subtle)", color: "var(--success)" }}>{I("tags", 18)}</span>
                <h3 style={{ fontSize: "var(--text-lg)", fontWeight: 700, color: "var(--text-strong)" }}>Explore job categories</h3>
              </div>
              <p style={{ fontSize: "var(--text-sm)", color: "var(--text-muted)", marginTop: 8 }}>Choose which active categories appear in the "Browse by field" section. All active categories are shown by default.</p>
            </div>
            <Badge tone="neutral">{(s.visibleCategories || allCats.map(function(c){return c.slug;})).length} / {allCats.length} shown</Badge>
          </div>
          {allCats.length === 0 ? (
            <div style={{ color: "var(--text-muted)", fontSize: "var(--text-sm)" }}>Loading categories…</div>
          ) : (
            <div className="krm-form-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              {allCats.map(function(c) {
                const visible = s.visibleCategories === null || s.visibleCategories === undefined ? true : s.visibleCategories.includes(c.slug);
                return (
                  <button key={c.id} onClick={() => toggleCategory(c.slug)} style={{
                    display: "flex", alignItems: "center", gap: 12, padding: "12px 14px", cursor: "pointer", textAlign: "left",
                    border: "1px solid " + (visible ? "var(--brand)" : "var(--border-strong)"),
                    background: visible ? "var(--brand-subtle)" : "var(--surface-card)", borderRadius: "var(--radius-md)",
                  }}>
                    <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 32, height: 32, borderRadius: "var(--radius-sm)", background: visible ? "var(--brand)" : "var(--surface-sunken)", color: visible ? "#fff" : "var(--text-faint)", flexShrink: 0 }}>{I(c.icon || "briefcase", 16)}</span>
                    <span style={{ flex: 1, fontWeight: 600, fontSize: "var(--text-sm)", color: "var(--text-strong)" }}>{c.name}</span>
                    <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 20, height: 20, borderRadius: "50%", background: visible ? "var(--brand)" : "var(--border-strong)", color: visible ? "#fff" : "var(--text-faint)", flexShrink: 0 }}>{visible ? I("check", 12) : null}</span>
                  </button>
                );
              })}
            </div>
          )}
        </Card>

        {/* Featured jobs */}
        <Card padding={24} style={{ marginBottom: 18 }}>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16 }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 36, height: 36, borderRadius: "var(--radius-md)", background: "var(--brand-subtle)", color: "var(--brand)" }}>{I("briefcase", 18)}</span>
                <h3 style={{ fontSize: "var(--text-lg)", fontWeight: 700, color: "var(--text-strong)" }}>Featured jobs</h3>
              </div>
              <p style={{ fontSize: "var(--text-sm)", color: "var(--text-muted)", marginTop: 8 }}>Show or hide the "Hand-picked" featured jobs section on the home page. Displays published jobs marked as featured first.</p>
            </div>
            <Switch checked={s.featuredJobsVisible !== false} onChange={(v) => { set("featuredJobsVisible", v); setSaved(false); }} />
          </div>
          <div style={{ marginTop: 16, paddingTop: 16, borderTop: "1px solid var(--border-subtle)", display: "flex", alignItems: "center", gap: 16, opacity: s.featuredJobsVisible !== false ? 1 : 0.45, pointerEvents: s.featuredJobsVisible !== false ? "auto" : "none" }}>
            <span style={{ fontSize: "var(--text-sm)", fontWeight: 600, color: "var(--text-strong)" }}>Jobs per page</span>
            <Stepper value={s.featuredJobsCount || 8} min={2} max={16} onChange={(v) => { set("featuredJobsCount", v); setSaved(false); }} />
          </div>
        </Card>

        {/* Featured companies */}
        <Card padding={24}>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16 }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 36, height: 36, borderRadius: "var(--radius-md)", background: "var(--accent-subtle)", color: "var(--accent)" }}>{I("star", 18)}</span>
                <h3 style={{ fontSize: "var(--text-lg)", fontWeight: 700, color: "var(--text-strong)" }}>Featured companies</h3>
              </div>
              <p style={{ fontSize: "var(--text-sm)", color: "var(--text-muted)", marginTop: 8 }}>Pick which approved companies appear in the &ldquo;Featured companies&rdquo; grid. Pending or suspended companies are excluded.</p>
            </div>
            <Switch checked={s.featuredVisible} onChange={(v) => set("featuredVisible", v)} />
          </div>
          <div style={{ marginTop: 20, paddingTop: 18, borderTop: "1px solid var(--border-subtle)", opacity: s.featuredVisible ? 1 : 0.45, pointerEvents: s.featuredVisible ? "auto" : "none" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
              <span style={{ fontSize: "var(--text-sm)", fontWeight: 700, color: "var(--text-strong)" }}>Selected companies</span>
              <Badge tone="accent">{s.featured.length} shown</Badge>
            </div>
            <div className="krm-form-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              {companies.map((name) => {
                const on = s.featured.includes(name);
                return (
                  <button key={name} onClick={() => toggleFeatured(name)} style={{
                    display: "flex", alignItems: "center", gap: 12, padding: "12px 14px", cursor: "pointer", textAlign: "left",
                    border: "1px solid " + (on ? "var(--brand)" : "var(--border-strong)"),
                    background: on ? "var(--brand-subtle)" : "var(--surface-card)", borderRadius: "var(--radius-md)",
                  }}>
                    <Avatar name={name} square size={32} />
                    <span style={{ flex: 1, fontWeight: 600, fontSize: "var(--text-sm)", color: "var(--text-strong)" }}>{name}</span>
                    <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 20, height: 20, borderRadius: "var(--radius-sm)", border: "1.5px solid " + (on ? "var(--brand)" : "var(--border-strong)"), background: on ? "var(--brand)" : "transparent", color: "#fff" }}>{on ? I("check", 13) : null}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </Card>

        </React.Fragment>}

        {hpTab === "findjobs" && <React.Fragment>
        {BannerCard("findJobsTopBanner", "Find Jobs -- Top announcement bar", "The full-width coloured bar at the very top of the Find Jobs page (above the hero). Toggle off to hide it.", "bell", ["var(--saffron-50)", "var(--saffron-600)"], { size: "1600 × 160px" })}
        {/* Find Jobs Hero heading */}
        {(function() {
          const fh = s.findJobsHero || {};
          const fjImg = fh.image || "";
          return (
          <Card padding={24} style={{ marginTop: 18 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
              <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 36, height: 36, borderRadius: "var(--radius-md)", background: "var(--teal-50)", color: "var(--teal-700)" }}>{I("layout-panel-top", 18)}</span>
              <div>
                <h3 style={{ fontSize: "var(--text-lg)", fontWeight: 700, color: "var(--text-strong)" }}>Find Jobs -- Hero banner</h3>
                <p style={{ fontSize: "var(--text-sm)", color: "var(--text-muted)" }}>The large teal banner with the page title and subtitle. Use <code style={{fontSize:"0.85em",background:"var(--surface-sunken)",padding:"1px 4px",borderRadius:3}}>{"{count}"}</code> in subtitle to insert the live job count.</p>
                <div style={{ display: "inline-flex", alignItems: "center", gap: 5, marginTop: 8, fontSize: "var(--text-xs)", fontWeight: 700, color: "var(--text-brand)", background: "var(--brand-subtle)", borderRadius: "var(--radius-pill)", padding: "3px 10px" }}>{I("image", 13)} Recommended image: 1600 × 220px</div>
              </div>
            </div>
            <div style={{ display: "grid", gap: 14 }}>
              <Input label="Heading" value={fh.heading || "Find your next opportunity"} onChange={(e) => setBanner("findJobsHero", "heading", e.target.value)} />
              <Textarea label="Subtitle" rows={2} value={fh.sub || ""} onChange={(e) => setBanner("findJobsHero", "sub", e.target.value)} />
              <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", padding: "8px 10px", borderRadius: "var(--radius-md)", background: fh.hideText ? "var(--brand-subtle)" : "var(--surface-sunken)", border: "1px solid " + (fh.hideText ? "var(--brand)" : "var(--border-subtle)") }}>
                <input type="checkbox" checked={!!fh.hideText} onChange={(e) => setBanner("findJobsHero", "hideText", e.target.checked)} style={{ width: 16, height: 16, accentColor: "var(--brand)", cursor: "pointer", flexShrink: 0 }} />
                <span style={{ fontSize: "var(--text-sm)", fontWeight: 700, color: "var(--text-strong)" }}>Show background image only</span>
                <span style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>Hides the heading &amp; subtitle.</span>
              </label>
            </div>
            {/* Background image */}
            <div style={{ marginTop: 16, paddingTop: 14, borderTop: "1px solid var(--border-subtle)", display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ width: 88, height: 52, flexShrink: 0, borderRadius: "var(--radius-md)", border: "1px solid var(--border)", background: fjImg ? "transparent" : "var(--surface-sunken)", backgroundImage: fjImg ? "url('" + fjImg + "')" : "none", backgroundSize: "cover", backgroundPosition: "center", display: "flex", alignItems: "center", justifyContent: "center" }}>
                {fh._uploading && <span style={{ fontSize: 10, color: "var(--text-muted)", fontFamily: "var(--font-sans)" }}>Uploading…</span>}
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ display: "inline-flex", alignItems: "center", gap: 6, cursor: fh._uploading ? "not-allowed" : "pointer", opacity: fh._uploading ? 0.5 : 1, fontFamily: "var(--font-sans)", fontSize: "var(--text-sm)", fontWeight: 700, color: "var(--text-brand)" }}>
                  {I("image", 14)} {fh._uploading ? "Uploading…" : fjImg ? "Replace background image" : "Upload background image"}
                  <input type="file" accept="image/*" disabled={!!fh._uploading} onChange={uploadTo("findJobsHero")} style={{ display: "none" }} />
                </label>
                {fjImg ? (
                  <div>
                    <div style={{ display: "flex", gap: 6, marginTop: 8 }}>
                      {["cover", "contain"].map((f) => (
                        <button key={f} onClick={() => setBanner("findJobsHero", "fit", f)} style={{ height: 28, padding: "0 12px", borderRadius: "var(--radius-sm)", cursor: "pointer", border: "1px solid " + ((fh.fit || "cover") === f ? "var(--brand)" : "var(--border-strong)"), background: (fh.fit || "cover") === f ? "var(--brand-subtle)" : "var(--surface-card)", color: (fh.fit || "cover") === f ? "var(--text-brand)" : "var(--text-muted)", fontFamily: "var(--font-sans)", fontSize: "var(--text-xs)", fontWeight: 700 }}>{f}</button>
                      ))}
                      <button onClick={() => setBanner("findJobsHero", "image", "")} style={{ height: 28, padding: "0 12px", borderRadius: "var(--radius-sm)", cursor: "pointer", border: "1px solid var(--border-strong)", background: "var(--surface-card)", color: "var(--text-muted)", fontFamily: "var(--font-sans)", fontSize: "var(--text-xs)", fontWeight: 700 }}>Remove</button>
                    </div>
                    <div style={{ marginTop: 12 }}>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
                        <span style={{ fontSize: "var(--text-xs)", fontWeight: 600, color: "var(--text-muted)" }}>Image visibility</span>
                        <span style={{ fontSize: "var(--text-xs)", fontWeight: 700, color: "var(--text-brand)" }}>{100 - (fh.imgOverlay != null ? fh.imgOverlay : 60)}%</span>
                      </div>
                      <input type="range" min={0} max={90} step={5} value={fh.imgOverlay != null ? fh.imgOverlay : 60} onChange={(e) => setBanner("findJobsHero", "imgOverlay", Number(e.target.value))} style={{ width: "100%", accentColor: "var(--brand)" }} />
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: "var(--text-muted)", marginTop: 2 }}><span>Full colour</span><span>Clear image</span></div>
                    </div>
                  </div>
                ) : <div style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)", marginTop: 4 }}>Optional — sits behind the heading text.</div>}
              </div>
            </div>
            {/* Preview */}
            <div style={{ marginTop: 14, borderRadius: "var(--radius-md)", overflow: "hidden", border: "1px solid var(--border)" }}>
              <div style={{ padding: "5px 10px", background: "var(--surface-sunken)", fontSize: "var(--text-xs)", color: "var(--text-faint)", fontWeight: 700, textTransform: "uppercase", letterSpacing: ".05em" }}>Preview</div>
              <div style={{ position: "relative", background: "var(--teal-800)", color: "#fff", padding: "20px 24px", overflow: "hidden" }}>
                {fjImg && <React.Fragment><div style={{ position: "absolute", inset: 0, backgroundImage: "url('" + fjImg + "')", backgroundSize: (fh.fit || "cover"), backgroundPosition: "center" }} /><div style={{ position: "absolute", inset: 0, background: "var(--teal-800)", opacity: (fh.imgOverlay != null ? fh.imgOverlay : 60) / 100 }} /></React.Fragment>}
                <div style={{ position: "relative" }}>
                  <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--teal-200)", marginBottom: 6 }}>Find jobs</div>
                  <div style={{ fontSize: 22, fontWeight: 800 }}>{fh.heading || "Find your next opportunity"}</div>
                  <div style={{ fontSize: 14, color: "var(--stone-300)", marginTop: 6 }}>{fh.sub || ""}</div>
                </div>
              </div>
            </div>
          </Card>
          );
        })()}
        {/* Find Jobs Banner 1 */}
        <Card padding={24} style={{ marginTop: 18 }}>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16 }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 36, height: 36, borderRadius: "var(--radius-md)", background: "var(--info-subtle)", color: "var(--info)" }}>{I("panel-left", 18)}</span>
                <h3 style={{ fontSize: "var(--text-lg)", fontWeight: 700, color: "var(--text-strong)" }}>Find Jobs - Banner 1</h3>
              </div>
              <p style={{ fontSize: "var(--text-sm)", color: "var(--text-muted)", marginTop: 8 }}>The promo card under the filters on the Find Jobs page.</p>
              <div style={{ display: "inline-flex", alignItems: "center", gap: 5, marginTop: 8, fontSize: "var(--text-xs)", fontWeight: 700, color: "var(--text-brand)", background: "var(--brand-subtle)", borderRadius: "var(--radius-pill)", padding: "3px 10px" }}>{I("image", 13)} Recommended image: 600 × 600px</div>
            </div>
            <Switch checked={s.sidebarBanner.visible} onChange={(v) => setSB("visible", v)} />
          </div>
          <div style={{ marginTop: 20, paddingTop: 18, borderTop: "1px solid var(--border-subtle)", opacity: s.sidebarBanner.visible ? 1 : 0.45, pointerEvents: s.sidebarBanner.visible ? "auto" : "none", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }} className="krm-form-grid">
            <Input label="Headline" value={s.sidebarBanner.title} onChange={(e) => setSB("title", e.target.value)} />
            <Input label="Button label" value={s.sidebarBanner.cta} onChange={(e) => setSB("cta", e.target.value)} />
            <div style={{ gridColumn: "1 / -1" }}>
              <Input label="Button URL (leave blank to use default action)" value={s.sidebarBanner.ctaUrl || ""} onChange={(e) => setSB("ctaUrl", e.target.value)} placeholder="https://… or /krama/ui_kits/…" iconLeft={I("link", 16)} />
            </div>
            <div style={{ gridColumn: "1 / -1" }}>
              <Textarea label="Message" rows={2} value={s.sidebarBanner.message} onChange={(e) => setSB("message", e.target.value)} />
            </div>
            <div style={{ gridColumn: "1 / -1" }}>
              <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", padding: "8px 10px", borderRadius: "var(--radius-md)", background: s.sidebarBanner.hideText ? "var(--brand-subtle)" : "var(--surface-sunken)", border: "1px solid " + (s.sidebarBanner.hideText ? "var(--brand)" : "var(--border-subtle)") }}>
                <input type="checkbox" checked={!!s.sidebarBanner.hideText} onChange={(e) => setSB("hideText", e.target.checked)} style={{ width: 16, height: 16, accentColor: "var(--brand)", cursor: "pointer", flexShrink: 0 }} />
                <span style={{ fontSize: "var(--text-sm)", fontWeight: 700, color: "var(--text-strong)" }}>Show background image only</span>
                <span style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>Hides the title, message &amp; button.</span>
              </label>
            </div>
            <Select label="Icon" value={s.sidebarBanner.icon} onChange={(e) => setSB("icon", e.target.value)} options={[{ value: "sparkles", label: "Sparkles" }, { value: "rocket", label: "Rocket" }, { value: "bell", label: "Bell" }, { value: "gift", label: "Gift" }, { value: "file-text", label: "Résumé" }]} />
            <div>
              <div style={{ fontSize: "var(--text-sm)", fontWeight: 600, color: "var(--text-strong)", marginBottom: 8 }}>Theme</div>
              <div style={{ display: "flex", gap: 8 }}>
                {[["teal", "var(--teal-700)"], ["saffron", "var(--saffron-500)"], ["dark", "var(--stone-900)"], ["blank", "var(--surface-card)"], ["transparent", null], ["custom", null]].map(([val, col]) => (
                  <button key={val} onClick={() => setSB("theme", val)} title={val} style={{ flex: 1, height: 40, borderRadius: "var(--radius-md)", cursor: "pointer", border: "2px solid " + (s.sidebarBanner.theme === val ? "var(--brand)" : "var(--border)"), background: col }} />
                ))}
              </div>
              <div style={{ marginTop: 10, display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)", minWidth: 72 }}>Text colour</div>
                <input type="color" value={s.sidebarBanner.customFg || "#ffffff"} onChange={(e) => setSB("customFg", e.target.value)} style={{ width: 32, height: 28, border: "1px solid var(--border)", borderRadius: "var(--radius-sm)", cursor: "pointer", padding: 2, flexShrink: 0 }} />
                <input value={s.sidebarBanner.customFg || ""} onChange={(e) => setSB("customFg", e.target.value)} placeholder="theme default" style={{ width: 96, border: "1px solid var(--border)", borderRadius: "var(--radius-sm)", padding: "4px 8px", fontFamily: "monospace", fontSize: 12 }} />
                {s.sidebarBanner.customFg && <button onClick={() => setSB("customFg", "")} title="Reset to theme default" style={{ height: 28, padding: "0 8px", border: "1px solid var(--border)", borderRadius: "var(--radius-sm)", background: "var(--surface-card)", color: "var(--text-muted)", fontFamily: "var(--font-sans)", fontSize: 11, cursor: "pointer" }}>Reset</button>}
              </div>
            </div>
            <div style={{ gridColumn: "1 / -1", display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ width: 88, height: 52, flexShrink: 0, borderRadius: "var(--radius-md)", border: "1px solid var(--border)", background: s.sidebarBanner.image ? "transparent" : "var(--surface-sunken)", backgroundImage: s.sidebarBanner.image ? "url('" + s.sidebarBanner.image + "')" : "none", backgroundSize: "cover", backgroundPosition: "center" }} />
              <div>
                <label style={{ display: "inline-flex", alignItems: "center", gap: 6, cursor: "pointer", fontFamily: "var(--font-sans)", fontSize: "var(--text-sm)", fontWeight: 700, color: "var(--text-brand)" }}>
                  {I("upload", 14)} {s.sidebarBanner.image ? "Replace image" : "Upload image"}
                  <input type="file" accept="image/*" onChange={uploadTo("sidebarBanner")} style={{ display: "none" }} />
                </label>
                {s.sidebarBanner.image ? (
                  <div style={{ display: "flex", gap: 6, marginTop: 8 }}>
                    {["cover", "contain"].map((f) => (
                      <button key={f} onClick={() => setSB("fit", f)} style={{ height: 28, padding: "0 12px", borderRadius: "var(--radius-sm)", cursor: "pointer", border: "1px solid " + (s.sidebarBanner.fit === f ? "var(--brand)" : "var(--border-strong)"), background: s.sidebarBanner.fit === f ? "var(--brand-subtle)" : "var(--surface-card)", color: s.sidebarBanner.fit === f ? "var(--text-brand)" : "var(--text-muted)", fontFamily: "var(--font-sans)", fontSize: "var(--text-xs)", fontWeight: 700 }}>{f}</button>
                    ))}
                    <button onClick={() => setSB("image", "")} style={{ height: 28, padding: "0 12px", borderRadius: "var(--radius-sm)", cursor: "pointer", border: "1px solid var(--border-strong)", background: "var(--surface-card)", color: "var(--text-muted)", fontFamily: "var(--font-sans)", fontSize: "var(--text-xs)", fontWeight: 700 }}>Remove</button>
                  </div>
                ) : <div style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)", marginTop: 4 }}>Optional -- image sits behind the text with a dark wash.</div>}
              </div>
            </div>
          </div>
        </Card>

        {/* Find Jobs Banner 2 */}
        <Card padding={24} style={{ marginTop: 18 }}>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16 }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 36, height: 36, borderRadius: "var(--radius-md)", background: "var(--accent-subtle)", color: "var(--accent)" }}>{I("megaphone", 18)}</span>
                <h3 style={{ fontSize: "var(--text-lg)", fontWeight: 700, color: "var(--text-strong)" }}>Find Jobs - Banner 2</h3>
              </div>
              <p style={{ fontSize: "var(--text-sm)", color: "var(--text-muted)", marginTop: 8 }}>The promo card directly under the Category filter.</p>
              <div style={{ display: "inline-flex", alignItems: "center", gap: 5, marginTop: 8, fontSize: "var(--text-xs)", fontWeight: 700, color: "var(--text-brand)", background: "var(--brand-subtle)", borderRadius: "var(--radius-pill)", padding: "3px 10px" }}>{I("image", 13)} Recommended image: 600 × 600px</div>
            </div>
            <Switch checked={s.categoryBanner.visible} onChange={(v) => setBanner("categoryBanner", "visible", v)} />
          </div>
          <div style={{ marginTop: 20, paddingTop: 18, borderTop: "1px solid var(--border-subtle)", opacity: s.categoryBanner.visible ? 1 : 0.45, pointerEvents: s.categoryBanner.visible ? "auto" : "none", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }} className="krm-form-grid">
            <Input label="Headline" value={s.categoryBanner.title} onChange={(e) => setBanner("categoryBanner", "title", e.target.value)} />
            <Input label="Button label" value={s.categoryBanner.cta} onChange={(e) => setBanner("categoryBanner", "cta", e.target.value)} />
            <div style={{ gridColumn: "1 / -1" }}>
              <Textarea label="Message" rows={2} value={s.categoryBanner.message} onChange={(e) => setBanner("categoryBanner", "message", e.target.value)} />
              <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", marginTop: 12, padding: "8px 10px", borderRadius: "var(--radius-md)", background: s.categoryBanner.hideText ? "var(--brand-subtle)" : "var(--surface-sunken)", border: "1px solid " + (s.categoryBanner.hideText ? "var(--brand)" : "var(--border-subtle)") }}>
                <input type="checkbox" checked={!!s.categoryBanner.hideText} onChange={(e) => setBanner("categoryBanner", "hideText", e.target.checked)} style={{ width: 16, height: 16, accentColor: "var(--brand)", cursor: "pointer", flexShrink: 0 }} />
                <span style={{ fontSize: "var(--text-sm)", fontWeight: 700, color: "var(--text-strong)" }}>Show background image only</span>
                <span style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>Hides the title, message &amp; button.</span>
              </label>
            </div>
            <div style={{ gridColumn: "1 / -1" }}>
              <Input label="Button URL (leave blank to use default action)" value={s.categoryBanner.ctaUrl || ""} onChange={(e) => setBanner("categoryBanner", "ctaUrl", e.target.value)} placeholder="https://… or /krama/ui_kits/…" iconLeft={I("link", 16)} />
            </div>
            <Select label="Icon" value={s.categoryBanner.icon} onChange={(e) => setBanner("categoryBanner", "icon", e.target.value)} options={[{ value: "rocket", label: "Rocket" }, { value: "megaphone", label: "Megaphone" }, { value: "sparkles", label: "Sparkles" }, { value: "gift", label: "Gift" }, { value: "briefcase", label: "Briefcase" }]} />
            <div>
              <div style={{ fontSize: "var(--text-sm)", fontWeight: 600, color: "var(--text-strong)", marginBottom: 8 }}>Theme</div>
              <div style={{ display: "flex", gap: 8 }}>
                {[["teal", "var(--teal-700)"], ["saffron", "var(--saffron-500)"], ["dark", "var(--stone-900)"], ["blank", "var(--surface-card)"], ["transparent", null], ["custom", null]].map(([val, col]) => (
                  <button key={val} onClick={() => setBanner("categoryBanner", "theme", val)} title={val} style={{ flex: 1, height: 40, borderRadius: "var(--radius-md)", cursor: "pointer", border: "2px solid " + (s.categoryBanner.theme === val ? "var(--brand)" : "var(--border)"), background: col }} />
                ))}
              </div>
              <div style={{ marginTop: 10, display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)", minWidth: 72 }}>Text colour</div>
                <input type="color" value={s.categoryBanner.customFg || "#ffffff"} onChange={(e) => setBanner("categoryBanner", "customFg", e.target.value)} style={{ width: 32, height: 28, border: "1px solid var(--border)", borderRadius: "var(--radius-sm)", cursor: "pointer", padding: 2, flexShrink: 0 }} />
                <input value={s.categoryBanner.customFg || ""} onChange={(e) => setBanner("categoryBanner", "customFg", e.target.value)} placeholder="theme default" style={{ width: 96, border: "1px solid var(--border)", borderRadius: "var(--radius-sm)", padding: "4px 8px", fontFamily: "monospace", fontSize: 12 }} />
                {s.categoryBanner.customFg && <button onClick={() => setBanner("categoryBanner", "customFg", "")} title="Reset to theme default" style={{ height: 28, padding: "0 8px", border: "1px solid var(--border)", borderRadius: "var(--radius-sm)", background: "var(--surface-card)", color: "var(--text-muted)", fontFamily: "var(--font-sans)", fontSize: 11, cursor: "pointer" }}>Reset</button>}
              </div>
            </div>
            <div style={{ gridColumn: "1 / -1", display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ width: 88, height: 52, flexShrink: 0, borderRadius: "var(--radius-md)", border: "1px solid var(--border)", background: s.categoryBanner.image ? "transparent" : "var(--surface-sunken)", backgroundImage: s.categoryBanner.image ? "url('" + s.categoryBanner.image + "')" : "none", backgroundSize: "cover", backgroundPosition: "center" }} />
              <div>
                <label style={{ display: "inline-flex", alignItems: "center", gap: 6, cursor: "pointer", fontFamily: "var(--font-sans)", fontSize: "var(--text-sm)", fontWeight: 700, color: "var(--text-brand)" }}>
                  {I("upload", 14)} {s.categoryBanner.image ? "Replace image" : "Upload image"}
                  <input type="file" accept="image/*" onChange={uploadTo("categoryBanner")} style={{ display: "none" }} />
                </label>
                {s.categoryBanner.image ? (
                  <div style={{ display: "flex", gap: 6, marginTop: 8 }}>
                    {["cover", "contain"].map((f) => (
                      <button key={f} onClick={() => setBanner("categoryBanner", "fit", f)} style={{ height: 28, padding: "0 12px", borderRadius: "var(--radius-sm)", cursor: "pointer", border: "1px solid " + (s.categoryBanner.fit === f ? "var(--brand)" : "var(--border-strong)"), background: s.categoryBanner.fit === f ? "var(--brand-subtle)" : "var(--surface-card)", color: s.categoryBanner.fit === f ? "var(--text-brand)" : "var(--text-muted)", fontFamily: "var(--font-sans)", fontSize: "var(--text-xs)", fontWeight: 700 }}>{f}</button>
                    ))}
                    <button onClick={() => setBanner("categoryBanner", "image", "")} style={{ height: 28, padding: "0 12px", borderRadius: "var(--radius-sm)", cursor: "pointer", border: "1px solid var(--border-strong)", background: "var(--surface-card)", color: "var(--text-muted)", fontFamily: "var(--font-sans)", fontSize: "var(--text-xs)", fontWeight: 700 }}>Remove</button>
                  </div>
                ) : <div style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)", marginTop: 4 }}>Optional -- image sits behind the text with a dark wash.</div>}
              </div>
            </div>
          </div>
        </Card>

        {BannerCard("findJobsBanner3", "Find Jobs - Banner 3", "A third promo card in the Find Jobs filter sidebar.", "bell", ["var(--saffron-50)", "var(--saffron-600)"], { size: "600 × 600px" })}
        {BannerCard("findJobsBanner4", "Find Jobs - Banner 4", "A fourth promo card in the Find Jobs filter sidebar.", "briefcase", ["var(--brand-subtle)", "var(--brand)"], { size: "600 × 600px" })}

        </React.Fragment>}

        {hpTab === "companies" && <React.Fragment>
        {BannerCard("companiesTopBanner", "Companies -- Top announcement bar", "The full-width coloured bar at the very top of the Companies page (above the hero). Toggle off to hide it.", "building-2", ["var(--saffron-50)", "var(--saffron-600)"], { size: "1600 × 160px" })}
        {BannerCard("companyProfileTopBanner", "Company Profile -- Top announcement bar", "The full-width coloured bar at the very top of each individual company's profile page. Toggle off to hide it.", "building-2", ["var(--brand-subtle)", "var(--brand)"], { size: "1600 × 160px" })}
        {/* Companies Hero heading */}
        {(function() {
          const ch = s.companiesHero || {};
          const coImg = ch.image || "";
          return (
          <Card padding={24} style={{ marginTop: 18 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
              <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 36, height: 36, borderRadius: "var(--radius-md)", background: "var(--teal-50)", color: "var(--teal-700)" }}>{I("layout-panel-top", 18)}</span>
              <div>
                <h3 style={{ fontSize: "var(--text-lg)", fontWeight: 700, color: "var(--text-strong)" }}>Companies -- Hero banner</h3>
                <p style={{ fontSize: "var(--text-sm)", color: "var(--text-muted)" }}>The large teal banner with the page title and subtitle. Use <code style={{fontSize:"0.85em",background:"var(--surface-sunken)",padding:"1px 4px",borderRadius:3}}>{"{count}"}</code> in subtitle to insert the live company count.</p>
                <div style={{ display: "inline-flex", alignItems: "center", gap: 5, marginTop: 8, fontSize: "var(--text-xs)", fontWeight: 700, color: "var(--text-brand)", background: "var(--brand-subtle)", borderRadius: "var(--radius-pill)", padding: "3px 10px" }}>{I("image", 13)} Recommended image: 1600 × 220px</div>
              </div>
            </div>
            <div style={{ display: "grid", gap: 14 }}>
              <Input label="Heading" value={ch.heading || "Verified companies hiring now"} onChange={(e) => setBanner("companiesHero", "heading", e.target.value)} />
              <Textarea label="Subtitle" rows={2} value={ch.sub || ""} onChange={(e) => setBanner("companiesHero", "sub", e.target.value)} />
              <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", padding: "8px 10px", borderRadius: "var(--radius-md)", background: ch.hideText ? "var(--brand-subtle)" : "var(--surface-sunken)", border: "1px solid " + (ch.hideText ? "var(--brand)" : "var(--border-subtle)") }}>
                <input type="checkbox" checked={!!ch.hideText} onChange={(e) => setBanner("companiesHero", "hideText", e.target.checked)} style={{ width: 16, height: 16, accentColor: "var(--brand)", cursor: "pointer", flexShrink: 0 }} />
                <span style={{ fontSize: "var(--text-sm)", fontWeight: 700, color: "var(--text-strong)" }}>Show background image only</span>
                <span style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>Hides the heading &amp; subtitle.</span>
              </label>
            </div>
            {/* Background image */}
            <div style={{ marginTop: 16, paddingTop: 14, borderTop: "1px solid var(--border-subtle)", display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ width: 88, height: 52, flexShrink: 0, borderRadius: "var(--radius-md)", border: "1px solid var(--border)", background: coImg ? "transparent" : "var(--surface-sunken)", backgroundImage: coImg ? "url('" + coImg + "')" : "none", backgroundSize: "cover", backgroundPosition: "center", display: "flex", alignItems: "center", justifyContent: "center" }}>
                {ch._uploading && <span style={{ fontSize: 10, color: "var(--text-muted)", fontFamily: "var(--font-sans)" }}>Uploading…</span>}
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ display: "inline-flex", alignItems: "center", gap: 6, cursor: ch._uploading ? "not-allowed" : "pointer", opacity: ch._uploading ? 0.5 : 1, fontFamily: "var(--font-sans)", fontSize: "var(--text-sm)", fontWeight: 700, color: "var(--text-brand)" }}>
                  {I("image", 14)} {ch._uploading ? "Uploading…" : coImg ? "Replace background image" : "Upload background image"}
                  <input type="file" accept="image/*" disabled={!!ch._uploading} onChange={uploadTo("companiesHero")} style={{ display: "none" }} />
                </label>
                {coImg ? (
                  <div>
                    <div style={{ display: "flex", gap: 6, marginTop: 8 }}>
                      {["cover", "contain"].map((f) => (
                        <button key={f} onClick={() => setBanner("companiesHero", "fit", f)} style={{ height: 28, padding: "0 12px", borderRadius: "var(--radius-sm)", cursor: "pointer", border: "1px solid " + ((ch.fit || "cover") === f ? "var(--brand)" : "var(--border-strong)"), background: (ch.fit || "cover") === f ? "var(--brand-subtle)" : "var(--surface-card)", color: (ch.fit || "cover") === f ? "var(--text-brand)" : "var(--text-muted)", fontFamily: "var(--font-sans)", fontSize: "var(--text-xs)", fontWeight: 700 }}>{f}</button>
                      ))}
                      <button onClick={() => setBanner("companiesHero", "image", "")} style={{ height: 28, padding: "0 12px", borderRadius: "var(--radius-sm)", cursor: "pointer", border: "1px solid var(--border-strong)", background: "var(--surface-card)", color: "var(--text-muted)", fontFamily: "var(--font-sans)", fontSize: "var(--text-xs)", fontWeight: 700 }}>Remove</button>
                    </div>
                    <div style={{ marginTop: 12 }}>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
                        <span style={{ fontSize: "var(--text-xs)", fontWeight: 600, color: "var(--text-muted)" }}>Image visibility</span>
                        <span style={{ fontSize: "var(--text-xs)", fontWeight: 700, color: "var(--text-brand)" }}>{100 - (ch.imgOverlay != null ? ch.imgOverlay : 60)}%</span>
                      </div>
                      <input type="range" min={0} max={90} step={5} value={ch.imgOverlay != null ? ch.imgOverlay : 60} onChange={(e) => setBanner("companiesHero", "imgOverlay", Number(e.target.value))} style={{ width: "100%", accentColor: "var(--brand)" }} />
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: "var(--text-muted)", marginTop: 2 }}><span>Full colour</span><span>Clear image</span></div>
                    </div>
                  </div>
                ) : <div style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)", marginTop: 4 }}>Optional — sits behind the heading text.</div>}
              </div>
            </div>
            {/* Preview */}
            <div style={{ marginTop: 14, borderRadius: "var(--radius-md)", overflow: "hidden", border: "1px solid var(--border)" }}>
              <div style={{ padding: "5px 10px", background: "var(--surface-sunken)", fontSize: "var(--text-xs)", color: "var(--text-faint)", fontWeight: 700, textTransform: "uppercase", letterSpacing: ".05em" }}>Preview</div>
              <div style={{ position: "relative", background: "var(--teal-800)", color: "#fff", padding: "20px 24px", overflow: "hidden" }}>
                {coImg && <React.Fragment><div style={{ position: "absolute", inset: 0, backgroundImage: "url('" + coImg + "')", backgroundSize: (ch.fit || "cover"), backgroundPosition: "center" }} /><div style={{ position: "absolute", inset: 0, background: "var(--teal-800)", opacity: (ch.imgOverlay != null ? ch.imgOverlay : 60) / 100 }} /></React.Fragment>}
                <div style={{ position: "relative" }}>
                  <div style={{ fontSize: 22, fontWeight: 800 }}>{ch.heading || "Verified companies hiring now"}</div>
                  <div style={{ fontSize: 14, color: "var(--stone-300)", marginTop: 6 }}>{ch.sub || ""}</div>
                </div>
              </div>
            </div>
          </Card>
          );
        })()}
        {/* Companies page -- side banner */}
        <Card padding={24} style={{ marginTop: 18 }}>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16 }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 36, height: 36, borderRadius: "var(--radius-md)", background: "var(--brand-subtle)", color: "var(--brand)" }}>{I("building-2", 18)}</span>
                <h3 style={{ fontSize: "var(--text-lg)", fontWeight: 700, color: "var(--text-strong)" }}>Companies page -- side banner</h3>
              </div>
              <p style={{ fontSize: "var(--text-sm)", color: "var(--text-muted)", marginTop: 8 }}>The promo card on the right of the Companies directory.</p>
              <div style={{ display: "inline-flex", alignItems: "center", gap: 5, marginTop: 8, fontSize: "var(--text-xs)", fontWeight: 700, color: "var(--text-brand)", background: "var(--brand-subtle)", borderRadius: "var(--radius-pill)", padding: "3px 10px" }}>{I("image", 13)} Recommended image: 600 × 600px</div>
            </div>
            <Switch checked={s.companiesBanner.visible} onChange={(v) => setBanner("companiesBanner", "visible", v)} />
          </div>
          <div style={{ marginTop: 20, paddingTop: 18, borderTop: "1px solid var(--border-subtle)", opacity: s.companiesBanner.visible ? 1 : 0.45, pointerEvents: s.companiesBanner.visible ? "auto" : "none", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }} className="krm-form-grid">
            <Input label="Headline" value={s.companiesBanner.title} onChange={(e) => setBanner("companiesBanner", "title", e.target.value)} />
            <Input label="Button label" value={s.companiesBanner.cta} onChange={(e) => setBanner("companiesBanner", "cta", e.target.value)} />
            <div style={{ gridColumn: "1 / -1" }}>
              <Textarea label="Message" rows={2} value={s.companiesBanner.message} onChange={(e) => setBanner("companiesBanner", "message", e.target.value)} />
              <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", marginTop: 12, padding: "8px 10px", borderRadius: "var(--radius-md)", background: s.companiesBanner.hideText ? "var(--brand-subtle)" : "var(--surface-sunken)", border: "1px solid " + (s.companiesBanner.hideText ? "var(--brand)" : "var(--border-subtle)") }}>
                <input type="checkbox" checked={!!s.companiesBanner.hideText} onChange={(e) => setBanner("companiesBanner", "hideText", e.target.checked)} style={{ width: 16, height: 16, accentColor: "var(--brand)", cursor: "pointer", flexShrink: 0 }} />
                <span style={{ fontSize: "var(--text-sm)", fontWeight: 700, color: "var(--text-strong)" }}>Show background image only</span>
                <span style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>Hides the title, message &amp; button.</span>
              </label>
            </div>
            <div style={{ gridColumn: "1 / -1" }}>
              <Input label="Button URL (leave blank to use default action)" value={s.companiesBanner.ctaUrl || ""} onChange={(e) => setBanner("companiesBanner", "ctaUrl", e.target.value)} placeholder="https://… or /krama/ui_kits/…" iconLeft={I("link", 16)} />
            </div>
            <Select label="Icon" value={s.companiesBanner.icon} onChange={(e) => setBanner("companiesBanner", "icon", e.target.value)} options={[{ value: "building-2", label: "Building" }, { value: "badge-check", label: "Verified" }, { value: "rocket", label: "Rocket" }, { value: "sparkles", label: "Sparkles" }, { value: "briefcase", label: "Briefcase" }]} />
            <div>
              <div style={{ fontSize: "var(--text-sm)", fontWeight: 600, color: "var(--text-strong)", marginBottom: 8 }}>Theme</div>
              <div style={{ display: "flex", gap: 8 }}>
                {[["teal", "var(--teal-700)"], ["saffron", "var(--saffron-500)"], ["dark", "var(--stone-900)"], ["blank", "var(--surface-card)"], ["transparent", null], ["custom", null]].map(([val, col]) => (
                  <button key={val} onClick={() => setBanner("companiesBanner", "theme", val)} title={val} style={{ flex: 1, height: 40, borderRadius: "var(--radius-md)", cursor: "pointer", border: "2px solid " + (s.companiesBanner.theme === val ? "var(--brand)" : "var(--border)"), background: col }} />
                ))}
              </div>
              <div style={{ marginTop: 10, display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)", minWidth: 72 }}>Text colour</div>
                <input type="color" value={s.companiesBanner.customFg || "#ffffff"} onChange={(e) => setBanner("companiesBanner", "customFg", e.target.value)} style={{ width: 32, height: 28, border: "1px solid var(--border)", borderRadius: "var(--radius-sm)", cursor: "pointer", padding: 2, flexShrink: 0 }} />
                <input value={s.companiesBanner.customFg || ""} onChange={(e) => setBanner("companiesBanner", "customFg", e.target.value)} placeholder="theme default" style={{ width: 96, border: "1px solid var(--border)", borderRadius: "var(--radius-sm)", padding: "4px 8px", fontFamily: "monospace", fontSize: 12 }} />
                {s.companiesBanner.customFg && <button onClick={() => setBanner("companiesBanner", "customFg", "")} title="Reset to theme default" style={{ height: 28, padding: "0 8px", border: "1px solid var(--border)", borderRadius: "var(--radius-sm)", background: "var(--surface-card)", color: "var(--text-muted)", fontFamily: "var(--font-sans)", fontSize: 11, cursor: "pointer" }}>Reset</button>}
              </div>
            </div>
            <div style={{ gridColumn: "1 / -1", display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ width: 88, height: 52, flexShrink: 0, borderRadius: "var(--radius-md)", border: "1px solid var(--border)", background: s.companiesBanner.image ? "transparent" : "var(--surface-sunken)", backgroundImage: s.companiesBanner.image ? "url('" + s.companiesBanner.image + "')" : "none", backgroundSize: "cover", backgroundPosition: "center" }} />
              <div>
                <label style={{ display: "inline-flex", alignItems: "center", gap: 6, cursor: "pointer", fontFamily: "var(--font-sans)", fontSize: "var(--text-sm)", fontWeight: 700, color: "var(--text-brand)" }}>
                  {I("upload", 14)} {s.companiesBanner.image ? "Replace image" : "Upload image"}
                  <input type="file" accept="image/*" onChange={uploadTo("companiesBanner")} style={{ display: "none" }} />
                </label>
                {s.companiesBanner.image ? (
                  <div style={{ display: "flex", gap: 6, marginTop: 8 }}>
                    {["cover", "contain"].map((f) => (
                      <button key={f} onClick={() => setBanner("companiesBanner", "fit", f)} style={{ height: 28, padding: "0 12px", borderRadius: "var(--radius-sm)", cursor: "pointer", border: "1px solid " + (s.companiesBanner.fit === f ? "var(--brand)" : "var(--border-strong)"), background: s.companiesBanner.fit === f ? "var(--brand-subtle)" : "var(--surface-card)", color: s.companiesBanner.fit === f ? "var(--text-brand)" : "var(--text-muted)", fontFamily: "var(--font-sans)", fontSize: "var(--text-xs)", fontWeight: 700 }}>{f}</button>
                    ))}
                    <button onClick={() => setBanner("companiesBanner", "image", "")} style={{ height: 28, padding: "0 12px", borderRadius: "var(--radius-sm)", cursor: "pointer", border: "1px solid var(--border-strong)", background: "var(--surface-card)", color: "var(--text-muted)", fontFamily: "var(--font-sans)", fontSize: "var(--text-xs)", fontWeight: 700 }}>Remove</button>
                  </div>
                ) : <div style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)", marginTop: 4 }}>Optional -- image sits behind the text with a dark wash.</div>}
              </div>
            </div>
          </div>
        </Card>

        {/* Companies page -- side banner 2 */}
        <Card padding={24} style={{ marginTop: 18 }}>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16 }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 36, height: 36, borderRadius: "var(--radius-md)", background: "var(--accent-subtle)", color: "var(--accent)" }}>{I("gift", 18)}</span>
                <h3 style={{ fontSize: "var(--text-lg)", fontWeight: 700, color: "var(--text-strong)" }}>Companies page -- side banner 2</h3>
              </div>
              <p style={{ fontSize: "var(--text-sm)", color: "var(--text-muted)", marginTop: 8 }}>A second promo card below the first, on the right of the Companies directory.</p>
              <div style={{ display: "inline-flex", alignItems: "center", gap: 5, marginTop: 8, fontSize: "var(--text-xs)", fontWeight: 700, color: "var(--text-brand)", background: "var(--brand-subtle)", borderRadius: "var(--radius-pill)", padding: "3px 10px" }}>{I("image", 13)} Recommended image: 600 × 600px</div>
            </div>
            <Switch checked={s.companiesBanner2.visible} onChange={(v) => setBanner("companiesBanner2", "visible", v)} />
          </div>
          <div style={{ marginTop: 20, paddingTop: 18, borderTop: "1px solid var(--border-subtle)", opacity: s.companiesBanner2.visible ? 1 : 0.45, pointerEvents: s.companiesBanner2.visible ? "auto" : "none", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }} className="krm-form-grid">
            <Input label="Headline" value={s.companiesBanner2.title} onChange={(e) => setBanner("companiesBanner2", "title", e.target.value)} />
            <Input label="Button label" value={s.companiesBanner2.cta} onChange={(e) => setBanner("companiesBanner2", "cta", e.target.value)} />
            <div style={{ gridColumn: "1 / -1" }}>
              <Textarea label="Message" rows={2} value={s.companiesBanner2.message} onChange={(e) => setBanner("companiesBanner2", "message", e.target.value)} />
              <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", marginTop: 12, padding: "8px 10px", borderRadius: "var(--radius-md)", background: s.companiesBanner2.hideText ? "var(--brand-subtle)" : "var(--surface-sunken)", border: "1px solid " + (s.companiesBanner2.hideText ? "var(--brand)" : "var(--border-subtle)") }}>
                <input type="checkbox" checked={!!s.companiesBanner2.hideText} onChange={(e) => setBanner("companiesBanner2", "hideText", e.target.checked)} style={{ width: 16, height: 16, accentColor: "var(--brand)", cursor: "pointer", flexShrink: 0 }} />
                <span style={{ fontSize: "var(--text-sm)", fontWeight: 700, color: "var(--text-strong)" }}>Show background image only</span>
                <span style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>Hides the title, message &amp; button.</span>
              </label>
            </div>
            <div style={{ gridColumn: "1 / -1" }}>
              <Input label="Button URL (leave blank to use default action)" value={s.companiesBanner2.ctaUrl || ""} onChange={(e) => setBanner("companiesBanner2", "ctaUrl", e.target.value)} placeholder="https://… or /krama/ui_kits/…" iconLeft={I("link", 16)} />
            </div>
            <Select label="Icon" value={s.companiesBanner2.icon} onChange={(e) => setBanner("companiesBanner2", "icon", e.target.value)} options={[{ value: "gift", label: "Gift" }, { value: "star", label: "Star" }, { value: "rocket", label: "Rocket" }, { value: "sparkles", label: "Sparkles" }, { value: "trending-up", label: "Trending" }]} />
            <div>
              <div style={{ fontSize: "var(--text-sm)", fontWeight: 600, color: "var(--text-strong)", marginBottom: 8 }}>Theme</div>
              <div style={{ display: "flex", gap: 8 }}>
                {[["teal", "var(--teal-700)"], ["saffron", "var(--saffron-500)"], ["dark", "var(--stone-900)"], ["blank", "var(--surface-card)"], ["transparent", null], ["custom", null]].map(([val, col]) => (
                  <button key={val} onClick={() => setBanner("companiesBanner2", "theme", val)} title={val} style={{ flex: 1, height: 40, borderRadius: "var(--radius-md)", cursor: "pointer", border: "2px solid " + (s.companiesBanner2.theme === val ? "var(--brand)" : "var(--border)"), background: col }} />
                ))}
              </div>
            </div>
            <div style={{ gridColumn: "1 / -1", display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ width: 88, height: 52, flexShrink: 0, borderRadius: "var(--radius-md)", border: "1px solid var(--border)", background: s.companiesBanner2.image ? "transparent" : "var(--surface-sunken)", backgroundImage: s.companiesBanner2.image ? "url('" + s.companiesBanner2.image + "')" : "none", backgroundSize: "cover", backgroundPosition: "center" }} />
              <div>
                <label style={{ display: "inline-flex", alignItems: "center", gap: 6, cursor: "pointer", fontFamily: "var(--font-sans)", fontSize: "var(--text-sm)", fontWeight: 700, color: "var(--text-brand)" }}>
                  {I("upload", 14)} {s.companiesBanner2.image ? "Replace image" : "Upload image"}
                  <input type="file" accept="image/*" onChange={uploadTo("companiesBanner2")} style={{ display: "none" }} />
                </label>
                {s.companiesBanner2.image ? (
                  <div style={{ display: "flex", gap: 6, marginTop: 8 }}>
                    {["cover", "contain"].map((f) => (
                      <button key={f} onClick={() => setBanner("companiesBanner2", "fit", f)} style={{ height: 28, padding: "0 12px", borderRadius: "var(--radius-sm)", cursor: "pointer", border: "1px solid " + (s.companiesBanner2.fit === f ? "var(--brand)" : "var(--border-strong)"), background: s.companiesBanner2.fit === f ? "var(--brand-subtle)" : "var(--surface-card)", color: s.companiesBanner2.fit === f ? "var(--text-brand)" : "var(--text-muted)", fontFamily: "var(--font-sans)", fontSize: "var(--text-xs)", fontWeight: 700 }}>{f}</button>
                    ))}
                    <button onClick={() => setBanner("companiesBanner2", "image", "")} style={{ height: 28, padding: "0 12px", borderRadius: "var(--radius-sm)", cursor: "pointer", border: "1px solid var(--border-strong)", background: "var(--surface-card)", color: "var(--text-muted)", fontFamily: "var(--font-sans)", fontSize: "var(--text-xs)", fontWeight: 700 }}>Remove</button>
                  </div>
                ) : <div style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)", marginTop: 4 }}>Optional -- image sits behind the text with a dark wash.</div>}
              </div>
            </div>
          </div>
        </Card>
        {BannerCard("companiesBanner3", "Companies page -- side banner 3", "A third promo card on the right of the Companies directory.", "bell", ["var(--saffron-50)", "var(--saffron-600)"], { size: "600 × 600px" })}
        {BannerCard("companiesBanner4", "Companies page -- side banner 4", "A fourth promo card on the right of the Companies directory.", "sparkles", ["var(--brand-subtle)", "var(--brand)"], { size: "600 × 600px" })}
        </React.Fragment>}

        {hpTab === "jobdetail" && <React.Fragment>
        {BannerCard("jobDetailTopBanner", "Job Detail -- Top announcement bar", "The full-width coloured bar at the very top of the Job Detail page. Toggle off to hide it.", "bell", ["var(--saffron-50)", "var(--saffron-600)"], { size: "1600 × 160px" })}
        {/* Job Detail Hero banner */}
        {(function() {
          const jh = s.jobDetailHero || {};
          const jhImg = jh.image || "";
          return (
          <Card padding={24} style={{ marginTop: 18 }}>
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 36, height: 36, borderRadius: "var(--radius-md)", background: "var(--teal-50)", color: "var(--teal-700)" }}>{I("layout-panel-top", 18)}</span>
                <div>
                  <h3 style={{ fontSize: "var(--text-lg)", fontWeight: 700, color: "var(--text-strong)" }}>Job Detail -- Hero banner</h3>
                  <p style={{ fontSize: "var(--text-sm)", color: "var(--text-muted)" }}>The large teal banner at the top of every Job Detail page. Toggle off to hide it.</p>
                  <div style={{ display: "inline-flex", alignItems: "center", gap: 5, marginTop: 8, fontSize: "var(--text-xs)", fontWeight: 700, color: "var(--text-brand)", background: "var(--brand-subtle)", borderRadius: "var(--radius-pill)", padding: "3px 10px" }}>{I("image", 13)} Recommended image: 1600 × 220px</div>
                </div>
              </div>
              <Switch checked={jh.visible !== false} onChange={(v) => setBanner("jobDetailHero", "visible", v)} />
            </div>
            <div style={{ marginTop: 20, paddingTop: 18, borderTop: "1px solid var(--border-subtle)", opacity: jh.visible !== false ? 1 : 0.45, pointerEvents: jh.visible !== false ? "auto" : "none" }}>
            <div style={{ display: "grid", gap: 14 }}>
              <Input label="Heading" value={jh.heading || "Find the role that fits you"} onChange={(e) => setBanner("jobDetailHero", "heading", e.target.value)} />
              <Textarea label="Subtitle" rows={2} value={jh.sub || ""} onChange={(e) => setBanner("jobDetailHero", "sub", e.target.value)} />
              <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", padding: "8px 10px", borderRadius: "var(--radius-md)", background: jh.hideText ? "var(--brand-subtle)" : "var(--surface-sunken)", border: "1px solid " + (jh.hideText ? "var(--brand)" : "var(--border-subtle)") }}>
                <input type="checkbox" checked={!!jh.hideText} onChange={(e) => setBanner("jobDetailHero", "hideText", e.target.checked)} style={{ width: 16, height: 16, accentColor: "var(--brand)", cursor: "pointer", flexShrink: 0 }} />
                <span style={{ fontSize: "var(--text-sm)", fontWeight: 700, color: "var(--text-strong)" }}>Show background image only</span>
                <span style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>Hides the heading &amp; subtitle.</span>
              </label>
            </div>
            {/* Background image */}
            <div style={{ marginTop: 16, paddingTop: 14, borderTop: "1px solid var(--border-subtle)", display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ width: 88, height: 52, flexShrink: 0, borderRadius: "var(--radius-md)", border: "1px solid var(--border)", background: jhImg ? "transparent" : "var(--surface-sunken)", backgroundImage: jhImg ? "url('" + jhImg + "')" : "none", backgroundSize: "cover", backgroundPosition: "center", display: "flex", alignItems: "center", justifyContent: "center" }}>
                {jh._uploading && <span style={{ fontSize: 10, color: "var(--text-muted)", fontFamily: "var(--font-sans)" }}>Uploading…</span>}
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ display: "inline-flex", alignItems: "center", gap: 6, cursor: jh._uploading ? "not-allowed" : "pointer", opacity: jh._uploading ? 0.5 : 1, fontFamily: "var(--font-sans)", fontSize: "var(--text-sm)", fontWeight: 700, color: "var(--text-brand)" }}>
                  {I("image", 14)} {jh._uploading ? "Uploading…" : jhImg ? "Replace background image" : "Upload background image"}
                  <input type="file" accept="image/*" disabled={!!jh._uploading} onChange={uploadTo("jobDetailHero")} style={{ display: "none" }} />
                </label>
                {jhImg ? (
                  <div>
                    <div style={{ display: "flex", gap: 6, marginTop: 8 }}>
                      {["cover", "contain"].map((f) => (
                        <button key={f} onClick={() => setBanner("jobDetailHero", "fit", f)} style={{ height: 28, padding: "0 12px", borderRadius: "var(--radius-sm)", cursor: "pointer", border: "1px solid " + ((jh.fit || "cover") === f ? "var(--brand)" : "var(--border-strong)"), background: (jh.fit || "cover") === f ? "var(--brand-subtle)" : "var(--surface-card)", color: (jh.fit || "cover") === f ? "var(--text-brand)" : "var(--text-muted)", fontFamily: "var(--font-sans)", fontSize: "var(--text-xs)", fontWeight: 700 }}>{f}</button>
                      ))}
                      <button onClick={() => setBanner("jobDetailHero", "image", "")} style={{ height: 28, padding: "0 12px", borderRadius: "var(--radius-sm)", cursor: "pointer", border: "1px solid var(--border-strong)", background: "var(--surface-card)", color: "var(--text-muted)", fontFamily: "var(--font-sans)", fontSize: "var(--text-xs)", fontWeight: 700 }}>Remove</button>
                    </div>
                    <div style={{ marginTop: 12 }}>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
                        <span style={{ fontSize: "var(--text-xs)", fontWeight: 600, color: "var(--text-muted)" }}>Image visibility</span>
                        <span style={{ fontSize: "var(--text-xs)", fontWeight: 700, color: "var(--text-brand)" }}>{100 - (jh.imgOverlay != null ? jh.imgOverlay : 60)}%</span>
                      </div>
                      <input type="range" min={0} max={90} step={5} value={jh.imgOverlay != null ? jh.imgOverlay : 60} onChange={(e) => setBanner("jobDetailHero", "imgOverlay", Number(e.target.value))} style={{ width: "100%", accentColor: "var(--brand)" }} />
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: "var(--text-muted)", marginTop: 2 }}><span>Full colour</span><span>Clear image</span></div>
                    </div>
                  </div>
                ) : <div style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)", marginTop: 4 }}>Optional — sits behind the heading text.</div>}
              </div>
            </div>
            {/* Preview */}
            <div style={{ marginTop: 14, borderRadius: "var(--radius-md)", overflow: "hidden", border: "1px solid var(--border)" }}>
              <div style={{ padding: "5px 10px", background: "var(--surface-sunken)", fontSize: "var(--text-xs)", color: "var(--text-faint)", fontWeight: 700, textTransform: "uppercase", letterSpacing: ".05em" }}>Preview</div>
              <div style={{ position: "relative", background: "var(--teal-800)", color: "#fff", padding: "20px 24px", overflow: "hidden" }}>
                {jhImg && <React.Fragment><div style={{ position: "absolute", inset: 0, backgroundImage: "url('" + jhImg + "')", backgroundSize: (jh.fit || "cover"), backgroundPosition: "center" }} /><div style={{ position: "absolute", inset: 0, background: "var(--teal-800)", opacity: (jh.imgOverlay != null ? jh.imgOverlay : 60) / 100 }} /></React.Fragment>}
                <div style={{ position: "relative" }}>
                  <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--teal-200)", marginBottom: 6 }}>Now hiring</div>
                  <div style={{ fontSize: 22, fontWeight: 800 }}>{jh.heading || "Find the role that fits you"}</div>
                  <div style={{ fontSize: 14, color: "var(--stone-300)", marginTop: 6 }}>{jh.sub || ""}</div>
                </div>
              </div>
            </div>
            </div>
          </Card>
          );
        })()}
        <div style={{ marginTop: 18 }}>
        {BannerCard("jobDetailBanner", "Job Detail -- Apply card banner", "Promotional banner shown inside the Apply card, below the Apply Now and Save buttons.", "sparkles", ["var(--brand-subtle)", "var(--brand)"], { size: "800 × 440px" })}
        </div>
        </React.Fragment>}
        <BannerEditorDrawer banner={bannerEditing} onClose={() => setBannerEditing(null)} onSave={saveBanner} />
      </div>
    );
  }

  // ===== Chat agent settings (drives the public website chat widget) =====
  const CHAT_DEFAULTS = { enabled: true, botName: "Krama Assistant", welcome: "Hi! I'm Krama's assistant 👋 Ask me about jobs, applications, or your account.", endpoint: "", apiKey: "", model: "claude-haiku-4-5", system_prompt: "", launcher: "Chat with us" };

  function ChatAgentSettings() {
    const [c, setC] = React.useState(CHAT_DEFAULTS);
    const [saved, setSaved] = React.useState(false);
    const [showKey, setShowKey] = React.useState(false);
    React.useEffect(function() {
      window.KRAMA_ADMIN_API.fetchSettings('chat')
        .then(function(d) { if (d && Object.keys(d).length) setC(Object.assign({}, CHAT_DEFAULTS, d)); })
        .catch(function() {});
    }, []);
    const set = (k, v) => { setC((x) => ({ ...x, [k]: v })); setSaved(false); };
    const save = () => {
      window.KRAMA_ADMIN_API.updateSettings('chat', c)
        .then(function() { setSaved(true); })
        .catch(function(e) { alert('Save failed: ' + (e && e.message ? e.message : 'Unknown error')); });
    };
    const connected = !!c.apiKey;

    return (
      <div className="krm-page-pad" style={{ padding: 28, maxWidth: 1100 }}>
        <ScreenHead title="Chat agent" sub="Control the assistant on the public website and connect it to your chat API."
          action={<Button variant="primary" iconLeft={I("check", 16)} onClick={save}>Save changes</Button>} />

        {saved ? (
          <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 16px", background: "var(--success-subtle)", border: "1px solid var(--success-border)", borderRadius: "var(--radius-md)", color: "var(--success)", fontWeight: 600, fontSize: "var(--text-sm)", marginBottom: 18 }}>
            {I("circle-check-big", 16)} Saved -- reload the public website to apply.
          </div>
        ) : null}

        <Card padding={24} style={{ marginBottom: 18 }}>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16 }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 36, height: 36, borderRadius: "var(--radius-md)", background: "var(--brand-subtle)", color: "var(--brand)" }}>{I("bot", 18)}</span>
                <h3 style={{ fontSize: "var(--text-lg)", fontWeight: 700, color: "var(--text-strong)" }}>Show chat on public site</h3>
              </div>
              <p style={{ fontSize: "var(--text-sm)", color: "var(--text-muted)", marginTop: 8 }}>The floating chat launcher in the bottom-left of every public page.</p>
            </div>
            <Switch checked={c.enabled} onChange={(v) => set("enabled", v)} />
          </div>
          <div style={{ marginTop: 20, paddingTop: 18, borderTop: "1px solid var(--border-subtle)", opacity: c.enabled ? 1 : 0.45, pointerEvents: c.enabled ? "auto" : "none", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }} className="krm-form-grid">
            <Input label="Assistant name" value={c.botName} onChange={(e) => set("botName", e.target.value)} />
            <Input label="Launcher button label" value={c.launcher} onChange={(e) => set("launcher", e.target.value)} />
            <div style={{ gridColumn: "1 / -1" }}>
              <Textarea label="Welcome message" rows={2} value={c.welcome} onChange={(e) => set("welcome", e.target.value)} />
            </div>
          </div>
        </Card>

        <Card padding={24}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
            <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 36, height: 36, borderRadius: "var(--radius-md)", background: "var(--info-subtle)", color: "var(--info)" }}>{I("sparkles", 18)}</span>
            <h3 style={{ fontSize: "var(--text-lg)", fontWeight: 700, color: "var(--text-strong)" }}>AI connection (Claude)</h3>
            <Badge tone={connected ? "success" : "neutral"} style={{ marginLeft: "auto" }}>{connected ? "Live" : "Demo mode"}</Badge>
          </div>
          <p style={{ fontSize: "var(--text-sm)", color: "var(--text-muted)", margin: "0 0 18px" }}>
            The assistant is powered by Anthropic&rsquo;s Claude. Paste your Anthropic API key to enable live answers. Krama calls Claude <strong>server-side</strong> — your key is never sent to visitors&rsquo; browsers. Leave the key blank to use the built-in demo replies.
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div className="krm-form-grid" style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 16 }}>
              <div style={{ position: "relative" }}>
                <Input label="Anthropic API key" type={showKey ? "text" : "password"} placeholder="sk-ant-…" value={c.apiKey} onChange={(e) => set("apiKey", e.target.value)} />
                <button onClick={() => setShowKey(!showKey)} style={{ position: "absolute", right: 10, top: 36, border: "none", background: "transparent", color: "var(--text-muted)", cursor: "pointer", display: "inline-flex" }} aria-label="Toggle key visibility">{I(showKey ? "eye-off" : "eye", 16)}</button>
              </div>
              <Input label="Model" placeholder="claude-haiku-4-5" value={c.model} onChange={(e) => set("model", e.target.value)} />
            </div>
            <Textarea label="System prompt / instructions (optional)" rows={4} placeholder="e.g. Always answer in a warm, professional tone. Mention that candidates can apply with one click…" value={c.system_prompt} onChange={(e) => set("system_prompt", e.target.value)} />
            <div style={{ fontSize: "var(--text-xs)", color: "var(--text-faint)", display: "flex", alignItems: "center", gap: 6 }}>
              {I("shield", 13)} Key and instructions are stored in the database and used server-side only. Default model is Claude Haiku 4.5 (fast and low-cost).
            </div>
          </div>
        </Card>
      </div>
    );
  }

  // ===== Social login settings =====
  const SOCIAL_DEFAULTS = { googleEnabled: true, googleClientId: "", facebookEnabled: true, facebookAppId: "" };

  function SocialLoginSettings() {
    const [s, setS] = React.useState(SOCIAL_DEFAULTS);
    const [saved, setSaved] = React.useState(false);
    const [showGKey, setShowGKey] = React.useState(false);
    const [showFKey, setShowFKey] = React.useState(false);
    React.useEffect(function() {
      window.KRAMA_ADMIN_API.fetchSettings('social')
        .then(function(d) {
          if (d && Object.keys(d).length) {
            setS({
              googleEnabled: d.google_enabled !== undefined ? !!d.google_enabled : SOCIAL_DEFAULTS.googleEnabled,
              googleClientId: d.google_client_id || "",
              facebookEnabled: d.facebook_enabled !== undefined ? !!d.facebook_enabled : SOCIAL_DEFAULTS.facebookEnabled,
              facebookAppId: d.facebook_app_id || "",
            });
          }
        })
        .catch(function() {});
      if (window.lucide) window.lucide.createIcons();
    }, []);
    const set = (k, v) => { setS((p) => ({ ...p, [k]: v })); setSaved(false); };
    const save = () => {
      window.KRAMA_ADMIN_API.updateSettings('social', {
        google_enabled: s.googleEnabled,
        google_client_id: s.googleClientId,
        facebook_enabled: s.facebookEnabled,
        facebook_app_id: s.facebookAppId,
      }).then(function() { setSaved(true); })
        .catch(function(e) { alert('Save failed: ' + (e && e.message ? e.message : 'Unknown error')); });
    };

    const GoogleIcon = () => React.createElement("svg", { width: 20, height: 20, viewBox: "0 0 24 24" },
      React.createElement("path", { fill: "#4285F4", d: "M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.27-4.74 3.27-8.1Z" }),
      React.createElement("path", { fill: "#34A853", d: "M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23Z" }),
      React.createElement("path", { fill: "#FBBC05", d: "M5.84 14.1a6.6 6.6 0 0 1 0-4.2V7.06H2.18a11 11 0 0 0 0 9.88l3.66-2.84Z" }),
      React.createElement("path", { fill: "#EA4335", d: "M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84C6.71 7.3 9.14 5.38 12 5.38Z" })
    );
    const FacebookIcon = () => React.createElement("svg", { width: 20, height: 20, viewBox: "0 0 24 24" },
      React.createElement("path", { fill: "#1877F2", d: "M24 12a12 12 0 1 0-13.88 11.85v-8.38H7.08V12h3.04V9.36c0-3 1.79-4.67 4.53-4.67 1.31 0 2.68.24 2.68.24v2.95H15.8c-1.49 0-1.95.92-1.95 1.87V12h3.32l-.53 3.47h-2.79v8.38A12 12 0 0 0 24 12Z" })
    );

    return (
      <div className="krm-page-pad" style={{ padding: 28, maxWidth: 1100 }}>
        <ScreenHead title="Social login" sub="Enable Google and Facebook sign-in on the public login and register pages."
          action={<Button variant="primary" iconLeft={I("check", 16)} onClick={save}>Save changes</Button>} />
        {saved && (
          <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 16px", background: "var(--success-subtle)", border: "1px solid var(--success-border)", borderRadius: "var(--radius-md)", color: "var(--success)", fontWeight: 600, fontSize: "var(--text-sm)", marginBottom: 18 }}>
            {I("circle-check-big", 16)} Saved -- reload the public website to apply.
          </div>
        )}
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>

          {/* Google */}
          <Card padding={24}>
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, marginBottom: 20 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 44, height: 44, borderRadius: "var(--radius-md)", background: "var(--surface-sunken)", border: "1px solid var(--border)" }}><GoogleIcon /></span>
                <div>
                  <div style={{ fontWeight: 700, fontSize: "var(--text-md)", color: "var(--text-strong)" }}>Google Sign-In</div>
                  <div style={{ fontSize: "var(--text-sm)", color: "var(--text-muted)", marginTop: 2 }}>Let users sign in or register with their Google account.</div>
                </div>
              </div>
              <Switch checked={s.googleEnabled} onChange={(v) => set("googleEnabled", v)} />
            </div>
            <div style={{ opacity: s.googleEnabled ? 1 : 0.45, pointerEvents: s.googleEnabled ? "auto" : "none", display: "flex", flexDirection: "column", gap: 12 }}>
              <div style={{ position: "relative" }}>
                <Input label="Google OAuth Client ID" value={s.googleClientId} onChange={(e) => set("googleClientId", e.target.value)} type={showGKey ? "text" : "password"} placeholder="123456789-abc…apps.googleusercontent.com" iconLeft={I("key", 16)} />
                <button onClick={() => setShowGKey((v) => !v)} style={{ position: "absolute", right: 10, top: 36, border: "none", background: "transparent", color: "var(--text-muted)", cursor: "pointer", display: "inline-flex" }}>{I(showGKey ? "eye-off" : "eye", 16)}</button>
              </div>
              <div style={{ padding: "10px 14px", background: "var(--info-subtle)", borderRadius: "var(--radius-md)", fontSize: "var(--text-sm)", color: "var(--text-body)", lineHeight: 1.5 }}>
                {I("info", 14)} Get your Client ID from <strong>Google Cloud Console</strong> → APIs &amp; Services → Credentials. Add your domain to Authorised JavaScript origins.
              </div>
            </div>
          </Card>

          {/* Facebook */}
          <Card padding={24}>
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, marginBottom: 20 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 44, height: 44, borderRadius: "var(--radius-md)", background: "var(--surface-sunken)", border: "1px solid var(--border)" }}><FacebookIcon /></span>
                <div>
                  <div style={{ fontWeight: 700, fontSize: "var(--text-md)", color: "var(--text-strong)" }}>Facebook Login</div>
                  <div style={{ fontSize: "var(--text-sm)", color: "var(--text-muted)", marginTop: 2 }}>Let users sign in or register with their Facebook account.</div>
                </div>
              </div>
              <Switch checked={s.facebookEnabled} onChange={(v) => set("facebookEnabled", v)} />
            </div>
            <div style={{ opacity: s.facebookEnabled ? 1 : 0.45, pointerEvents: s.facebookEnabled ? "auto" : "none", display: "flex", flexDirection: "column", gap: 12 }}>
              <div style={{ position: "relative" }}>
                <Input label="Facebook App ID" value={s.facebookAppId} onChange={(e) => set("facebookAppId", e.target.value)} type={showFKey ? "text" : "password"} placeholder="123456789012345" iconLeft={I("key", 16)} />
                <button onClick={() => setShowFKey((v) => !v)} style={{ position: "absolute", right: 10, top: 36, border: "none", background: "transparent", color: "var(--text-muted)", cursor: "pointer", display: "inline-flex" }}>{I(showFKey ? "eye-off" : "eye", 16)}</button>
              </div>
              <div style={{ padding: "10px 14px", background: "var(--info-subtle)", borderRadius: "var(--radius-md)", fontSize: "var(--text-sm)", color: "var(--text-body)", lineHeight: 1.5 }}>
                {I("info", 14)} Get your App ID from <strong>Meta for Developers</strong> → My Apps. Add your domain to App Domains and enable Facebook Login product.
              </div>
            </div>
          </Card>

        </div>
      </div>
    );
  }

  // ===== Payment settings (drives employer checkout) =====
  const PAY_DEFAULTS = {
    currency: "USD",
    khqr:  { enabled: true,  merchant: "Krama (Cambodia) Co., Ltd", account: "krama@aclb" },
    acleda:{ enabled: true,  merchant: "Krama (Cambodia) Co., Ltd", account: "1000-12-345678-9" },
    aba:   { enabled: true,  merchant: "Krama (Cambodia) Co., Ltd", account: "000 123 456" },
    card:  { enabled: true,  merchant: "Krama (Cambodia) Co., Ltd", account: "" },
    cod:   { enabled: true,  merchant: "Krama (Cambodia) Co., Ltd", account: "" },
  };
  // All employer payment transactions recorded by the platform.
  const PAY_TX = [
    { id: "TXN-2026-1042", employer: "ABA Bank", plan: "Standard", amount: "$49.00", method: "ABA Bank", status: "Paid", date: "01 Jun 2026" },
    { id: "TXN-2026-1041", employer: "Smart Axiata", plan: "Premium", amount: "$99.00", method: "KHQR", status: "Paid", date: "01 Jun 2026" },
    { id: "TXN-2026-1040", employer: "Wing Bank", plan: "Standard", amount: "$49.00", method: "ACLEDA Bank", status: "Paid", date: "31 May 2026" },
    { id: "TXN-2026-1039", employer: "Cellcard", plan: "Premium", amount: "$99.00", method: "ABA Bank", status: "Paid", date: "30 May 2026" },
    { id: "TXN-2026-1038", employer: "Manulife", plan: "Standard", amount: "$49.00", method: "KHQR", status: "Pending", date: "30 May 2026" },
    { id: "TXN-2026-1037", employer: "Acleda Bank", plan: "Standard", amount: "$49.00", method: "ACLEDA Bank", status: "Paid", date: "29 May 2026" },
    { id: "TXN-2026-1036", employer: "Chip Mong", plan: "Premium", amount: "$99.00", method: "ABA Bank", status: "Paid", date: "28 May 2026" },
    { id: "TXN-2026-1035", employer: "Prince Bank", plan: "Standard", amount: "$49.00", method: "KHQR", status: "Failed", date: "28 May 2026" },
    { id: "TXN-2026-1034", employer: "Borey Peng Huoth", plan: "Standard", amount: "$49.00", method: "ABA Bank", status: "Paid", date: "27 May 2026" },
    { id: "TXN-2026-1033", employer: "Pizza Company", plan: "Premium", amount: "$99.00", method: "ACLEDA Bank", status: "Paid", date: "26 May 2026" },
    { id: "TXN-2026-1032", employer: "Sathapana Bank", plan: "Standard", amount: "$49.00", method: "KHQR", status: "Paid", date: "25 May 2026" },
    { id: "TXN-2026-1031", employer: "Coca-Cola Cambodia", plan: "Premium", amount: "$99.00", method: "ABA Bank", status: "Refunded", date: "24 May 2026" },
    { id: "TXN-2026-1030", employer: "ABA Bank", plan: "Standard", amount: "$49.00", method: "ABA Bank", status: "Paid", date: "01 May 2026" },
    { id: "TXN-2026-1029", employer: "Smart Axiata", plan: "Premium", amount: "$99.00", method: "KHQR", status: "Paid", date: "01 May 2026" },
    { id: "TXN-2026-1028", employer: "Wing Bank", plan: "Standard", amount: "$49.00", method: "ACLEDA Bank", status: "Paid", date: "30 Apr 2026" },
    { id: "TXN-2026-1027", employer: "Cellcard", plan: "Premium", amount: "$99.00", method: "ABA Bank", status: "Paid", date: "29 Apr 2026" },
    { id: "TXN-2026-1026", employer: "Manulife", plan: "Standard", amount: "$49.00", method: "KHQR", status: "Paid", date: "28 Apr 2026" },
    { id: "TXN-2026-1025", employer: "Acleda Bank", plan: "Standard", amount: "$49.00", method: "ACLEDA Bank", status: "Paid", date: "27 Apr 2026" },
    { id: "TXN-2026-1024", employer: "Chip Mong", plan: "Premium", amount: "$99.00", method: "ABA Bank", status: "Paid", date: "26 Apr 2026" },
    { id: "TXN-2026-1023", employer: "Prince Bank", plan: "Standard", amount: "$49.00", method: "KHQR", status: "Paid", date: "25 Apr 2026" },
    { id: "TXN-2026-1022", employer: "Borey Peng Huoth", plan: "Standard", amount: "$49.00", method: "ABA Bank", status: "Paid", date: "24 Apr 2026" },
    { id: "TXN-2026-1021", employer: "Pizza Company", plan: "Premium", amount: "$99.00", method: "ACLEDA Bank", status: "Paid", date: "23 Apr 2026" },
  ];
  const TX_TONE = { Paid: "success", Pending: "warning", Failed: "danger", Refunded: "neutral" };

  const PLAN_BLANK = { name: "", price: "", currency: "USD", interval: "month", job_post_limit: "", trial_days: "", featured_credits: 0, features_json: [], is_active: true, custom_pricing: false };
  const SUB_BLANK  = { company_id: "", plan_id: "", status: "active", started_at: new Date().toISOString().slice(0,10), renews_at: "", job_post_limit: "" };

  function PlansTab() {
    const [plans, setPlans] = React.useState(null);
    const [modal, setModal] = React.useState(null); // null | { mode:"create"|"edit", data }
    const [delId, setDelId] = React.useState(null);
    const [saving, setSaving] = React.useState(false);
    const [msg, setMsg] = React.useState("");
    const flash = (m) => { setMsg(m); setTimeout(() => setMsg(""), 3000); };
    const load = () => adm.fetchPlans().then(setPlans).catch(() => setPlans([]));
    React.useEffect(() => { load(); }, []);

    // Featured-boost pricing (settings group "featured")
    const [boostCfg, setBoostCfg] = React.useState(null);
    const [boostSaving, setBoostSaving] = React.useState(false);
    const [boostSaved, setBoostSaved] = React.useState(false);
    React.useEffect(function () {
      adm.fetchSettings("featured").then(function (d) {
        setBoostCfg({
          boost_price:    (d && d.boost_price != null) ? String(d.boost_price) : "19",
          boost_currency: (d && d.boost_currency) || "USD",
          boost_days:     (d && d.boost_days != null) ? String(d.boost_days) : "30",
        });
      }).catch(function () { setBoostCfg({ boost_price: "19", boost_currency: "USD", boost_days: "30" }); });
    }, []);
    const setBoost = (k, v) => { setBoostCfg((c) => Object.assign({}, c, { [k]: v })); setBoostSaved(false); };
    const saveBoost = () => {
      setBoostSaving(true);
      adm.updateSettings("featured", {
        boost_price:    parseFloat(boostCfg.boost_price) || 0,
        boost_currency: (boostCfg.boost_currency || "USD").toUpperCase().slice(0, 3),
        boost_days:     parseInt(boostCfg.boost_days) || 30,
      }).then(function () { setBoostSaving(false); setBoostSaved(true); flash("Featured boost pricing saved."); })
        .catch(function (e) { setBoostSaving(false); flash("Error: " + (e && e.message)); });
    };

    const openCreate = () => setModal({ mode: "create", data: Object.assign({}, PLAN_BLANK) });
    const openEdit   = (pl) => setModal({ mode: "edit", data: {
      name: pl.name, price: String(pl.price), currency: pl.currency || "USD",
      interval: pl.interval || "month", job_post_limit: pl.job_post_limit != null ? String(pl.job_post_limit) : "",
      trial_days: pl.trial_days != null ? String(pl.trial_days) : "",
      featured_credits: pl.featured_credits || 0,
      features_json: Array.isArray(pl.features_json) ? pl.features_json : [],
      is_active: !!pl.is_active, custom_pricing: !!pl.custom_pricing, _id: pl.id,
    }});
    const setF = (k, v) => setModal((m) => ({ ...m, data: { ...m.data, [k]: v } }));
    const addFeature = () => { setF("features_json", [...(modal.data.features_json || []), ""]); };
    const setFeature = (i, v) => { var arr = [...(modal.data.features_json||[])]; arr[i] = v; setF("features_json", arr); };
    const removeFeature = (i) => { setF("features_json", (modal.data.features_json||[]).filter((_,j) => j !== i)); };

    const save = () => {
      var d = modal.data;
      if (!d.name || d.price === "") { flash("Name and price are required."); return; }
      var payload = { name: d.name, price: parseFloat(d.price) || 0, currency: d.currency, interval: d.interval,
        job_post_limit: d.job_post_limit ? parseInt(d.job_post_limit) : null,
        trial_days: d.trial_days ? parseInt(d.trial_days) : null,
        featured_credits: parseInt(d.featured_credits) || 0,
        features_json: (d.features_json||[]).filter(Boolean),
        is_active: d.is_active, custom_pricing: !!d.custom_pricing };
      setSaving(true);
      var call = modal.mode === "edit" ? adm.updatePlan(d._id, payload) : adm.createPlan(payload);
      call.then(() => { setSaving(false); setModal(null); flash(modal.mode === "edit" ? "Plan updated." : "Plan created."); load(); })
        .catch((e) => { setSaving(false); flash("Error: " + (e && e.message)); });
    };

    const confirmDelete = () => {
      adm.deletePlan(delId).then(() => { setDelId(null); flash("Plan deleted."); load(); })
        .catch((e) => { setDelId(null); flash("Error: " + (e && e.message)); });
    };

    const INTERVAL_LABEL = { month: "Monthly", year: "Yearly", once: "One-time" };
    const fmtPrice = (pl) => (pl.currency || "USD") + " " + parseFloat(pl.price || 0).toFixed(2) + " / " + (INTERVAL_LABEL[pl.interval] || pl.interval);

    return (
      <div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
          <div>
            <h2 style={{ fontSize: "var(--text-lg)", fontWeight: 700, color: "var(--text-strong)" }}>Subscription plans</h2>
            <p style={{ fontSize: "var(--text-sm)", color: "var(--text-muted)", marginTop: 2 }}>Define the plans employers can subscribe to.</p>
          </div>
          <Button variant="primary" iconLeft={I("plus", 16)} onClick={openCreate}>New plan</Button>
        </div>

        {msg && <div style={{ padding: "10px 14px", background: "var(--success-subtle)", color: "var(--success)", borderRadius: "var(--radius-md)", marginBottom: 14, fontWeight: 600, fontSize: "var(--text-sm)" }}>{msg}</div>}

        <Card padding={20} style={{ marginBottom: 20 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
            <span style={{ color: "var(--accent, #f59e0b)", display: "inline-flex" }}>{I("star", 16)}</span>
            <h2 style={{ fontSize: "var(--text-base)", fontWeight: 700, color: "var(--text-strong)" }}>Pay-per-boost pricing</h2>
          </div>
          <p style={{ fontSize: "var(--text-sm)", color: "var(--text-muted)", marginTop: 2 }}>One-time fee an employer pays to feature a job <strong>after</strong> using the free featured credits included in their plan. (Free credits are set per plan below, under “Featured”.)</p>
          {!boostCfg ? (
            <div style={{ color: "var(--text-muted)", fontSize: "var(--text-sm)", marginTop: 14 }}>Loading…</div>
          ) : (
            <div style={{ display: "flex", gap: 14, alignItems: "flex-end", marginTop: 16, flexWrap: "wrap" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <label style={{ fontSize: 12, fontWeight: 600, color: "var(--text-muted)" }}>Price per boost</label>
                <input type="number" min="0" step="0.01" value={boostCfg.boost_price} onChange={(e) => setBoost("boost_price", e.target.value)}
                  style={{ width: 110, padding: "8px 12px", borderRadius: 7, border: "1px solid var(--border)", background: "var(--surface-input, var(--surface-card))", color: "var(--text-body)", fontSize: 13 }} />
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <label style={{ fontSize: 12, fontWeight: 600, color: "var(--text-muted)" }}>Currency</label>
                <input type="text" maxLength={3} value={boostCfg.boost_currency} onChange={(e) => setBoost("boost_currency", e.target.value)}
                  style={{ width: 80, padding: "8px 12px", borderRadius: 7, border: "1px solid var(--border)", background: "var(--surface-input, var(--surface-card))", color: "var(--text-body)", fontSize: 13, textTransform: "uppercase" }} />
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <label style={{ fontSize: 12, fontWeight: 600, color: "var(--text-muted)" }}>Duration (days)</label>
                <input type="number" min="1" step="1" value={boostCfg.boost_days} onChange={(e) => setBoost("boost_days", e.target.value)}
                  style={{ width: 120, padding: "8px 12px", borderRadius: 7, border: "1px solid var(--border)", background: "var(--surface-input, var(--surface-card))", color: "var(--text-body)", fontSize: 13 }} />
              </div>
              <Button variant="primary" iconLeft={I("check", 15)} disabled={boostSaving} onClick={saveBoost}>{boostSaving ? "Saving…" : "Save pricing"}</Button>
              {boostSaved && <span style={{ fontSize: "var(--text-sm)", color: "var(--success)", fontWeight: 600, paddingBottom: 8 }}>Saved</span>}
            </div>
          )}
        </Card>

        {!plans && <div style={{ padding: 24, textAlign: "center", color: "var(--text-muted)" }}>Loading…</div>}
        {plans && plans.length === 0 && (
          <div style={{ padding: "48px 24px", textAlign: "center", color: "var(--text-muted)", background: "var(--surface-card)", borderRadius: "var(--radius-lg)", border: "1px dashed var(--border)" }}>
            {I("package", 32)} <div style={{ marginTop: 12, fontWeight: 600 }}>No plans yet</div>
            <div style={{ fontSize: "var(--text-sm)", marginTop: 4 }}>Create your first subscription plan.</div>
          </div>
        )}
        {plans && plans.length > 0 && (
          <div className="krm-table-wrap"><Card padding={0}>
            <div style={{ display: "grid", gridTemplateColumns: "2fr 1.2fr 1fr 0.8fr 0.8fr 1fr", padding: "10px 20px", fontSize: "var(--text-xs)", fontWeight: 700, letterSpacing: ".04em", textTransform: "uppercase", color: "var(--text-faint)", borderBottom: "1px solid var(--border-subtle)" }}>
              <span>Plan</span><span>Price</span><span>Job limit</span><span>Featured</span><span>Status</span><span style={{ textAlign: "right" }}>Actions</span>
            </div>
            {plans.map((pl, i) => (
              <div key={pl.id} style={{ display: "grid", gridTemplateColumns: "2fr 1.2fr 1fr 0.8fr 0.8fr 1fr", alignItems: "center", padding: "14px 20px", borderBottom: i < plans.length - 1 ? "1px solid var(--border-subtle)" : "none" }}>
                <div>
                  <div style={{ fontWeight: 700, color: "var(--text-strong)", fontSize: "var(--text-sm)" }}>{pl.name}</div>
                  {parseFloat(pl.price || 0) === 0 && (
                    <div style={{ fontSize: "var(--text-xs)", color: "var(--brand)", marginTop: 2, fontWeight: 600 }}>{Number(pl.trial_days) > 0 ? (pl.trial_days + " days trial") : "Free plan"}</div>
                  )}
                  {Array.isArray(pl.features_json) && pl.features_json.length > 0 && (
                    <div style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)", marginTop: 2 }}>{pl.features_json.slice(0,2).join(" · ")}{pl.features_json.length > 2 ? " · …" : ""}</div>
                  )}
                </div>
                <span style={{ fontWeight: 600, color: "var(--text-body)", fontSize: "var(--text-sm)" }}>{fmtPrice(pl)}</span>
                <span style={{ fontSize: "var(--text-sm)", color: "var(--text-muted)" }}>{pl.job_post_limit != null ? pl.job_post_limit + " jobs" : "Unlimited"}</span>
                <span style={{ fontSize: "var(--text-sm)", color: "var(--text-muted)" }}>{pl.featured_credits || 0}</span>
                <Badge tone={pl.is_active ? "success" : "neutral"}>{pl.is_active ? "Active" : "Inactive"}</Badge>
                <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
                  <Button variant="secondary" size="sm" onClick={() => openEdit(pl)}>Edit</Button>
                  <Button variant="danger" size="sm" onClick={() => setDelId(pl.id)}>Delete</Button>
                </div>
              </div>
            ))}
          </Card></div>
        )}

        {modal && (
          <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
            <div style={{ background: "var(--surface-card)", borderRadius: "var(--radius-xl)", width: "100%", maxWidth: 540, maxHeight: "90vh", overflow: "auto", boxShadow: "var(--shadow-xl)", padding: 28 }}>
              <h2 style={{ fontSize: "var(--text-xl)", fontWeight: 700, color: "var(--text-strong)", marginBottom: 20 }}>{modal.mode === "edit" ? "Edit plan" : "New plan"}</h2>
              <div className="krm-form-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                <div style={{ gridColumn: "1 / -1" }}>
                  <Input label="Plan name" value={modal.data.name} onChange={(e) => setF("name", e.target.value)} placeholder="e.g. Standard, Pro, Enterprise" />
                </div>
                <Input label="Price" value={modal.data.price} onChange={(e) => setF("price", e.target.value)} placeholder="0.00" />
                <Select label="Currency" value={modal.data.currency} onChange={(e) => setF("currency", e.target.value)} options={[{value:"USD",label:"USD"},{value:"KHR",label:"KHR"},{value:"EUR",label:"EUR"}]} />
                <Select label="Billing cycle" value={modal.data.interval} onChange={(e) => setF("interval", e.target.value)} options={[{value:"month",label:"Monthly"},{value:"year",label:"Yearly"},{value:"once",label:"One-time"}]} />
                <Input label="Job post limit (blank = unlimited)" value={modal.data.job_post_limit} onChange={(e) => setF("job_post_limit", e.target.value)} placeholder="e.g. 5" />
                <Input label="Trial duration days (blank = 7, for $0 plans)" value={modal.data.trial_days} onChange={(e) => setF("trial_days", e.target.value)} placeholder="e.g. 14" />
                <Input label="Featured credits" hint="Free featured listings included in this plan. Beyond these, employers pay the pay-per-boost price." value={String(modal.data.featured_credits)} onChange={(e) => setF("featured_credits", e.target.value)} placeholder="0" />
                <div style={{ gridColumn: "1 / -1" }}>
                  <div style={{ fontSize: "var(--text-sm)", fontWeight: 600, color: "var(--text-strong)", marginBottom: 8 }}>Features</div>
                  {(modal.data.features_json||[]).map((f, i) => (
                    <div key={i} style={{ display: "flex", gap: 8, marginBottom: 8 }}>
                      <input value={f} onChange={(e) => setFeature(i, e.target.value)} placeholder={"Feature " + (i+1)} style={{ flex: 1, height: 36, padding: "0 12px", borderRadius: "var(--radius-md)", border: "1px solid var(--border)", background: "var(--surface-input)", color: "var(--text-body)", fontFamily: "var(--font-sans)", fontSize: "var(--text-sm)" }} />
                      <button onClick={() => removeFeature(i)} style={{ width: 36, height: 36, border: "none", borderRadius: "var(--radius-md)", background: "var(--danger-subtle)", color: "var(--danger)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>{I("x", 14)}</button>
                    </div>
                  ))}
                  <button onClick={addFeature} style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 12px", border: "1px dashed var(--border)", borderRadius: "var(--radius-md)", background: "transparent", color: "var(--text-muted)", cursor: "pointer", fontSize: "var(--text-sm)", fontFamily: "var(--font-sans)" }}>{I("plus", 14)} Add feature</button>
                </div>
                <div style={{ gridColumn: "1 / -1", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16 }}>
                  <div>
                    <span style={{ fontSize: "var(--text-sm)", fontWeight: 600, color: "var(--text-strong)" }}>Custom pricing</span>
                    <div style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)", marginTop: 2 }}>On the public page, show "Custom" &amp; a "Contact sales" button instead of the price (dark card).</div>
                  </div>
                  <Switch checked={modal.data.custom_pricing} onChange={(v) => setF("custom_pricing", v)} />
                </div>
                <div style={{ gridColumn: "1 / -1", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <span style={{ fontSize: "var(--text-sm)", fontWeight: 600, color: "var(--text-strong)" }}>Active</span>
                  <Switch checked={modal.data.is_active} onChange={(v) => setF("is_active", v)} />
                </div>
              </div>
              <div style={{ display: "flex", gap: 10, marginTop: 22, justifyContent: "flex-end" }}>
                <Button variant="secondary" onClick={() => setModal(null)}>Cancel</Button>
                <Button variant="primary" onClick={save} disabled={saving}>{saving ? "Saving…" : modal.mode === "edit" ? "Save changes" : "Create plan"}</Button>
              </div>
            </div>
          </div>
        )}

        {delId && (
          <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div style={{ background: "var(--surface-card)", borderRadius: "var(--radius-xl)", padding: 28, maxWidth: 380, width: "100%", boxShadow: "var(--shadow-xl)" }}>
              <h3 style={{ fontWeight: 700, color: "var(--text-strong)", marginBottom: 8 }}>Delete plan?</h3>
              <p style={{ fontSize: "var(--text-sm)", color: "var(--text-muted)", marginBottom: 20 }}>Plans with active subscriptions cannot be deleted.</p>
              <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
                <Button variant="secondary" onClick={() => setDelId(null)}>Cancel</Button>
                <Button variant="danger" onClick={confirmDelete}>Delete</Button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  function SubscriptionsTab() {
    const [subs, setSubs] = React.useState(null);
    const [plans, setPlans] = React.useState([]);
    const [companies, setCompanies] = React.useState([]);
    const [modal, setModal] = React.useState(null);
    const [editModal, setEditModal] = React.useState(null);
    const [saving, setSaving] = React.useState(false);
    const [msg, setMsg] = React.useState("");
    const [statusFilter, setStatusFilter] = React.useState("all");
    const [page, setPage] = React.useState(1);
    const [total, setTotal] = React.useState(0);
    const flash = (m) => { setMsg(m); setTimeout(() => setMsg(""), 3500); };

    const load = (s, pg) => {
      adm.fetchSubscriptions(s || statusFilter, pg || page)
        .then((d) => { setSubs(d.data || []); setTotal(d.total || 0); })
        .catch(() => setSubs([]));
    };

    React.useEffect(() => {
      load();
      adm.fetchPlans().then(setPlans).catch(() => {});
      adm.fetchCompanies("all", 1, 100).then((d) => setCompanies(d.data || [])).catch(() => {});
    }, []);

    React.useEffect(() => { load(statusFilter, page); }, [statusFilter, page]);

    const openAssign = () => setModal(Object.assign({}, SUB_BLANK));
    const setMF = (k, v) => setModal((m) => ({ ...m, [k]: v }));
    const setEF = (k, v) => setEditModal((m) => ({ ...m, [k]: v }));

    const assign = () => {
      if (!modal.company_id || !modal.plan_id) { flash("Select a company and plan."); return; }
      setSaving(true);
      adm.createSubscription({ company_id: parseInt(modal.company_id), plan_id: parseInt(modal.plan_id),
        status: modal.status, started_at: modal.started_at || undefined, renews_at: modal.renews_at || undefined,
        job_post_limit: modal.job_post_limit ? parseInt(modal.job_post_limit) : undefined })
        .then(() => { setSaving(false); setModal(null); flash("Subscription assigned."); load(); })
        .catch((e) => { setSaving(false); flash("Error: " + (e && e.message)); });
    };

    const saveEdit = () => {
      setSaving(true);
      adm.updateSubscription(editModal._id, { plan_id: parseInt(editModal.plan_id), status: editModal.status,
        started_at: editModal.started_at || undefined, renews_at: editModal.renews_at || undefined,
        job_post_limit: editModal.job_post_limit ? parseInt(editModal.job_post_limit) : null })
        .then(() => { setSaving(false); setEditModal(null); flash("Subscription updated."); load(); })
        .catch((e) => { setSaving(false); flash("Error: " + (e && e.message)); });
    };

    const openEdit = (s) => setEditModal({ _id: s.id, plan_id: String(s.plan_id), status: s.status,
      started_at: s.started_at ? String(s.started_at).slice(0,10) : "",
      renews_at: s.renews_at ? String(s.renews_at).slice(0,10) : "",
      job_post_limit: s.job_post_limit != null ? String(s.job_post_limit) : "",
      company_name: s.company ? s.company.name : "--" });

    // Look up a plan by id, and build a one-line hint of its defaults.
    const planById = (id) => plans.find((p) => String(p.id) === String(id));
    const planHint = (id) => {
      var p = planById(id);
      if (!p) return null;
      return (p.job_post_limit != null ? p.job_post_limit + " job posts" : "Unlimited job posts") + " · " + (p.currency || "USD") + " " + parseFloat(p.price || 0).toFixed(2) + "/" + (p.interval || "month");
    };
    // Derive a renewal/end date from start + plan interval, so active/trial subs never end up blank.
    const computeRenews = (startISO, planId, status) => {
      var p = planById(planId);
      var d = new Date(startISO || new Date().toISOString().slice(0,10));
      if (status === "trial") { d.setDate(d.getDate() + ((p && p.trial_days) ? p.trial_days : 7)); return d.toISOString().slice(0,10); }
      if (status === "active" && p) {
        if (p.interval === "year") { d.setFullYear(d.getFullYear() + 1); return d.toISOString().slice(0,10); }
        if (p.interval === "month" || !p.interval) { d.setMonth(d.getMonth() + 1); return d.toISOString().slice(0,10); }
      }
      return ""; // one-time / other → no renewal date
    };

    const STONE = { pending: "warning", active: "success", trial: "brand", canceled: "neutral", refunded: "neutral", expired: "danger" };
    const fmtDate = (iso) => { if (!iso) return "--"; var d = new Date(iso); return d.getDate() + " " + ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"][d.getMonth()] + " " + d.getFullYear(); };
    const FILTERS = ["all","pending","active","canceled","refunded","expired"];
    const PER = 20;
    const pages = Math.max(1, Math.ceil(total / PER));

    return (
      <div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
          <div>
            <h2 style={{ fontSize: "var(--text-lg)", fontWeight: 700, color: "var(--text-strong)" }}>Employer subscriptions</h2>
            <p style={{ fontSize: "var(--text-sm)", color: "var(--text-muted)", marginTop: 2 }}>Manage which plan each employer is on.</p>
          </div>
          <Button variant="primary" iconLeft={I("user-check", 16)} onClick={openAssign}>Assign plan</Button>
        </div>

        {msg && <div style={{ padding: "10px 14px", background: "var(--success-subtle)", color: "var(--success)", borderRadius: "var(--radius-md)", marginBottom: 14, fontWeight: 600, fontSize: "var(--text-sm)" }}>{msg}</div>}

        <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
          {FILTERS.map((f) => (
            <button key={f} onClick={() => { setStatusFilter(f); setPage(1); }}
              style={{ padding: "6px 14px", borderRadius: "var(--radius-full)", border: "1px solid " + (statusFilter === f ? "var(--brand)" : "var(--border)"),
                background: statusFilter === f ? "var(--brand-subtle)" : "var(--surface-card)",
                color: statusFilter === f ? "var(--text-brand)" : "var(--text-muted)",
                fontFamily: "var(--font-sans)", fontSize: "var(--text-sm)", fontWeight: 600, cursor: "pointer", textTransform: "capitalize" }}>
              {f.replace("_"," ")}
            </button>
          ))}
        </div>

        {!subs && <div style={{ padding: 24, textAlign: "center", color: "var(--text-muted)" }}>Loading…</div>}
        {subs && subs.length === 0 && <div style={{ padding: "40px 24px", textAlign: "center", color: "var(--text-muted)", background: "var(--surface-card)", borderRadius: "var(--radius-lg)", border: "1px dashed var(--border)" }}>No subscriptions found.</div>}
        {subs && subs.length > 0 && (
          <div className="krm-table-wrap"><Card padding={0}>
            <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1.2fr 1fr 0.8fr 1.3fr 0.85fr 0.85fr 1.1fr", padding: "10px 20px", fontSize: "var(--text-xs)", fontWeight: 700, letterSpacing: ".04em", textTransform: "uppercase", color: "var(--text-faint)", borderBottom: "1px solid var(--border-subtle)" }}>
              <span>Company</span><span>Employee Account</span><span>Plan</span><span>Status</span><span>Payment</span><span>Started</span><span>End date</span><span style={{ textAlign: "right" }}>Actions</span>
            </div>
            {subs.map((s, i) => {
              var pay = s.latest_payment;
              var empUser = s.company && (s.company.owner || s.company.user);
              var METHOD_LABEL = { aba: "ABA", acleda: "ACLEDA", khqr: "KHQR", wing: "Wing", cod: "COD", card: "Card", stripe: "Stripe", other: "Manual" };
              var isReplaced = s.status === "canceled" && pay && pay.status === "paid";
              var endLabel = s.status === "expired" ? "Expired" : s.status === "pending" ? "Activates" : s.status === "trial" ? "Trial ends" : "Renews";
              var endColor = s.status === "expired" ? "var(--danger)" : "var(--text-muted)";
              var endWeight = s.status === "expired" ? 600 : 400;
              return (
              <div key={s.id} style={{ display: "grid", gridTemplateColumns: "1.4fr 1.2fr 1fr 0.8fr 1.3fr 0.85fr 0.85fr 1.1fr", alignItems: "center", padding: "14px 20px", borderBottom: i < subs.length - 1 ? "1px solid var(--border-subtle)" : "none" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <Avatar src={s.company && s.company.logo_url} name={s.company ? s.company.name : "?"} size={32} square />
                  <div>
                    <div style={{ fontWeight: 600, fontSize: "var(--text-sm)", color: "var(--text-strong)" }}>{s.company ? s.company.name : "--"}</div>
                    {s.plan && <div style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>{(s.plan.currency||"USD") + " " + parseFloat(s.plan.price||0).toFixed(2)}</div>}
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0 }}>
                  {empUser ? (
                    <React.Fragment>
                      <Avatar name={empUser.name} size={28} />
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontWeight: 600, fontSize: "var(--text-sm)", color: "var(--text-strong)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{empUser.name}</div>
                        <div style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{empUser.email}</div>
                      </div>
                    </React.Fragment>
                  ) : <span style={{ fontSize: "var(--text-xs)", color: "var(--text-faint)" }}>—</span>}
                </div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: "var(--text-sm)", color: "var(--text-body)" }}>{s.plan ? s.plan.name : "--"}</div>
                  {s.job_post_limit != null && <div style={{ fontSize: "var(--text-xs)", color: "var(--text-brand)", fontWeight: 600, marginTop: 2 }}>{s.job_post_limit} slots (custom)</div>}
                </div>
                <Badge tone={STONE[s.status] || "neutral"}>{(s.status||"").replace("_"," ")}</Badge>
                <div>
                  {pay ? (
                    <React.Fragment>
                      <div style={{ fontFamily: "var(--font-mono)", fontSize: "var(--text-xs)", color: "var(--text-body)" }}>{pay.invoice_no}</div>
                      <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 3 }}>
                        <span style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>
                          {METHOD_LABEL[pay.method] || pay.method}
                          {isReplaced ? " · replaced" : (pay.status === "failed" ? " · failed" : pay.status === "refunded" ? " · refunded" : "")}
                        </span>
                        {pay.status === "pending" && <Button variant="primary" size="sm" onClick={() => { adm.markPaid(pay.id).then(() => { flash("Payment marked as paid."); load(); }).catch((e) => flash("Error: " + (e&&e.message))); }}>Mark paid</Button>}
                      </div>
                    </React.Fragment>
                  ) : <span style={{ fontSize: "var(--text-xs)", color: "var(--text-faint)" }}>—</span>}
                </div>
                <span style={{ fontSize: "var(--text-sm)", color: "var(--text-muted)" }}>{fmtDate(s.started_at)}</span>
                <div>
                  <div style={{ fontSize: "var(--text-xs)", color: "var(--text-faint)", marginBottom: 2 }}>{endLabel}</div>
                  <div style={{ fontSize: "var(--text-sm)", color: endColor, fontWeight: endWeight }}>{fmtDate(s.renews_at)}</div>
                </div>
                <div style={{ display: "flex", gap: 6, justifyContent: "flex-end" }}>
                  <Button variant="secondary" size="sm" onClick={() => openEdit(s)}>Edit</Button>
                </div>
              </div>
            );
            })}
            {pages > 1 && (
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 20px", borderTop: "1px solid var(--border-subtle)" }}>
                <span style={{ fontSize: "var(--text-sm)", color: "var(--text-muted)" }}>Page {page} of {pages} · {total} total</span>
                <div style={{ display: "flex", gap: 8 }}>
                  <Button variant="secondary" size="sm" disabled={page === 1} onClick={() => setPage(page - 1)}>Previous</Button>
                  <Button variant="secondary" size="sm" disabled={page === pages} onClick={() => setPage(page + 1)}>Next</Button>
                </div>
              </div>
            )}
          </Card></div>
        )}

        {modal && (
          <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
            <div style={{ background: "var(--surface-card)", borderRadius: "var(--radius-xl)", width: "100%", maxWidth: 480, boxShadow: "var(--shadow-xl)", padding: 28 }}>
              <h2 style={{ fontSize: "var(--text-xl)", fontWeight: 700, color: "var(--text-strong)", marginBottom: 20 }}>Assign plan to employer</h2>
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <Select label="Company" value={modal.company_id} onChange={(e) => setMF("company_id", e.target.value)}
                  options={[{value:"",label:"Select company…"}, ...companies.map((c) => ({value:String(c.id),label:c.name}))]} />
                <Select label="Plan" hint={planHint(modal.plan_id)} value={modal.plan_id} onChange={(e) => {
                  var pid = e.target.value;
                  setModal((m) => ({ ...m, plan_id: pid, renews_at: m.renews_at || computeRenews(m.started_at, pid, m.status) }));
                }}
                  options={[{value:"",label:"Select plan…"}, ...plans.filter((p) => p.is_active).map((p) => ({value:String(p.id),label:p.name + " (" + (p.currency||"USD") + " " + parseFloat(p.price||0).toFixed(2) + ")"}))]  } />
                <Select label="Status" value={modal.status} onChange={(e) => {
                  var v = e.target.value;
                  setModal((m) => ({ ...m, status: v, renews_at: computeRenews(m.started_at, m.plan_id, v) || m.renews_at }));
                }} options={["pending","active","trial","canceled","refunded","expired"].map((v) => ({value:v,label:v.replace("_"," ")}))} />
                <Input type="date" label="Start date" value={modal.started_at} onChange={(e) => {
                  var sd = e.target.value;
                  setModal((m) => ({ ...m, started_at: sd, renews_at: m.renews_at || computeRenews(sd, m.plan_id, m.status) }));
                }} />
                <Input type="date" label="Renews at (leave blank for one-time)" value={modal.renews_at} onChange={(e) => setMF("renews_at", e.target.value)} />
                <Input type="number" label="Custom job-post limit (optional override)" hint="Overrides the plan default. Employer sees this as 'Custom slots (Admin assigned)'." value={modal.job_post_limit} onChange={(e) => setMF("job_post_limit", e.target.value)} placeholder="e.g. 10" />
              </div>
              <div style={{ display: "flex", gap: 10, marginTop: 22, justifyContent: "flex-end" }}>
                <Button variant="secondary" onClick={() => setModal(null)}>Cancel</Button>
                <Button variant="primary" onClick={assign} disabled={saving}>{saving ? "Assigning…" : "Assign plan"}</Button>
              </div>
            </div>
          </div>
        )}

        {editModal && (
          <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
            <div style={{ background: "var(--surface-card)", borderRadius: "var(--radius-xl)", width: "100%", maxWidth: 480, boxShadow: "var(--shadow-xl)", padding: 28 }}>
              <h2 style={{ fontSize: "var(--text-xl)", fontWeight: 700, color: "var(--text-strong)", marginBottom: 4 }}>Edit subscription</h2>
              <p style={{ fontSize: "var(--text-sm)", color: "var(--text-muted)", marginBottom: 20 }}>{editModal.company_name}</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <Select label="Plan" hint={planHint(editModal.plan_id)} value={editModal.plan_id} onChange={(e) => {
                  var pid = e.target.value;
                  setEditModal((m) => ({ ...m, plan_id: pid, renews_at: m.renews_at || computeRenews(m.started_at, pid, m.status) }));
                }}
                  options={plans.map((p) => ({value:String(p.id),label:p.name + " (" + (p.currency||"USD") + " " + parseFloat(p.price||0).toFixed(2) + ")"}))} />
                <Select label="Status" value={editModal.status} onChange={(e) => {
                  var v = e.target.value;
                  setEditModal((m) => ({ ...m, status: v, renews_at: computeRenews(m.started_at, m.plan_id, v) || m.renews_at }));
                }} options={["pending","active","trial","canceled","refunded","expired"].map((v) => ({value:v,label:v.replace("_"," ")}))} />
                <Input type="date" label="Start date" value={editModal.started_at} onChange={(e) => {
                  var sd = e.target.value;
                  setEditModal((m) => ({ ...m, started_at: sd, renews_at: m.renews_at || computeRenews(sd, m.plan_id, m.status) }));
                }} />
                <Input type="date" label="Renews at (leave blank for one-time)" value={editModal.renews_at} onChange={(e) => setEF("renews_at", e.target.value)} />
                <Input type="number" label="Custom job-post limit (optional override)" hint="Overrides the plan default. Employer sees this as 'Custom slots (Admin assigned)'." value={editModal.job_post_limit} onChange={(e) => setEF("job_post_limit", e.target.value)} placeholder="e.g. 10" />
              </div>
              <div style={{ display: "flex", gap: 10, marginTop: 22, justifyContent: "flex-end" }}>
                <Button variant="secondary" onClick={() => setEditModal(null)}>Cancel</Button>
                <Button variant="primary" onClick={saveEdit} disabled={saving}>{saving ? "Saving…" : "Save changes"}</Button>
              </div>
            </div>
          </div>
        )}


      </div>
    );
  }

  function TransactionsTab() {
    const [apiTx, setApiTx] = React.useState(null);
    const [txPage, setTxPage] = React.useState(0);
    const [msg, setMsg] = React.useState("");
    const TX_PER = 10;
    const flash = (m) => { setMsg(m); setTimeout(() => setMsg(""), 3000); };
    React.useEffect(() => {
      adm.fetchPayments().then(function (d) { setApiTx(d.data || d); }).catch(function () { setApiTx([]); });
    }, []);
    const markPaid = (id) => { adm.markPaid(id).then(() => { flash("Marked as paid."); adm.fetchPayments().then((d) => setApiTx(d.data || d)); }).catch((e) => flash("Error: " + (e && e.message))); };
    const refund  = (id) => { adm.refundPayment(id).then(() => { flash("Payment refunded."); adm.fetchPayments().then((d) => setApiTx(d.data || d)); }).catch((e) => flash("Error: " + (e && e.message))); };
    const fmtDate = (iso) => { if (!iso) return "--"; var d = new Date(iso); return d.getDate() + " " + ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"][d.getMonth()] + " " + d.getFullYear(); };
    const statusTone = { paid: "success", pending: "warning", failed: "danger", refunded: "neutral" };

    return (
      <div>
        <div style={{ marginBottom: 18 }}>
          <h2 style={{ fontSize: "var(--text-lg)", fontWeight: 700, color: "var(--text-strong)" }}>Payment transactions</h2>
          <p style={{ fontSize: "var(--text-sm)", color: "var(--text-muted)", marginTop: 2 }}>All employer invoice records. Mark pending payments paid or issue refunds.</p>
        </div>
        {msg && <div style={{ padding: "10px 14px", background: "var(--success-subtle)", color: "var(--success)", borderRadius: "var(--radius-md)", marginBottom: 14, fontWeight: 600, fontSize: "var(--text-sm)" }}>{msg}</div>}
        <div className="krm-table-wrap"><Card padding={0}>
          <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1.4fr 0.9fr 0.8fr 1.1fr 0.9fr 1.4fr", padding: "10px 22px", fontSize: "var(--text-xs)", fontWeight: 700, letterSpacing: ".04em", textTransform: "uppercase", color: "var(--text-faint)", borderBottom: "1px solid var(--border-subtle)" }}>
            <span>Invoice</span><span>Employer</span><span>Plan</span><span>Amount</span><span>Method</span><span>Date</span><span style={{ textAlign: "right" }}>Status / Actions</span>
          </div>
          {!apiTx && <div style={{ padding: "28px 22px", color: "var(--text-muted)", fontSize: "var(--text-sm)", textAlign: "center" }}>Loading…</div>}
          {apiTx && apiTx.length === 0 && <div style={{ padding: "28px 22px", color: "var(--text-muted)", fontSize: "var(--text-sm)", textAlign: "center" }}>No transactions yet.</div>}
          {apiTx && apiTx.length > 0 && (() => {
            var pages = Math.max(1, Math.ceil(apiTx.length / TX_PER));
            var safe = Math.min(txPage, pages - 1);
            var slice = apiTx.slice(safe * TX_PER, safe * TX_PER + TX_PER);
            return (
              <React.Fragment>
                {slice.map(function (t, i) {
                  var employer = t.company ? t.company.name : (t.subscription && t.subscription.company ? t.subscription.company.name : "--");
                  var plan = t.purpose === "featured_boost"
                    ? ("★ Featured boost" + (t.job && t.job.title ? " — " + t.job.title : ""))
                    : (t.subscription && t.subscription.plan ? t.subscription.plan.name : "--");
                  return (
                    <div key={t.id} style={{ display: "grid", gridTemplateColumns: "1.4fr 1.4fr 0.9fr 0.8fr 1.1fr 0.9fr 1.4fr", alignItems: "center", padding: "12px 22px", borderBottom: i < slice.length - 1 ? "1px solid var(--border-subtle)" : "none" }}>
                      <span style={{ fontFamily: "var(--font-mono)", fontSize: "var(--text-xs)", color: "var(--text-body)" }}>{t.invoice_no || t.id}</span>
                      <span style={{ fontSize: "var(--text-sm)", fontWeight: 600, color: "var(--text-strong)" }}>{employer}</span>
                      <span style={{ fontSize: "var(--text-sm)", color: "var(--text-muted)" }}>{plan}</span>
                      <span style={{ fontWeight: 600, color: "var(--text-strong)" }}>${parseFloat(t.amount || 0).toFixed(2)}</span>
                      <span style={{ fontSize: "var(--text-sm)", color: "var(--text-body)" }}>{t.method || "--"}</span>
                      <span style={{ fontSize: "var(--text-sm)", color: "var(--text-muted)" }}>{fmtDate(t.paid_at || t.created_at)}</span>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, justifyContent: "flex-end" }}>
                        <Badge tone={statusTone[t.status] || "neutral"}>{t.status}</Badge>
                        {t.status === "pending" && <Button variant="primary" size="sm" onClick={() => markPaid(t.id)}>Mark paid</Button>}
                        {t.status === "paid" && <Button variant="secondary" size="sm" onClick={() => refund(t.id)}>Refund</Button>}
                      </div>
                    </div>
                  );
                })}
                {pages > 1 && (
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 22px", borderTop: "1px solid var(--border-subtle)" }}>
                    <span style={{ fontSize: "var(--text-sm)", color: "var(--text-muted)" }}>Showing {safe * TX_PER + 1}-{safe * TX_PER + slice.length} of {apiTx.length}</span>
                    <div style={{ display: "flex", gap: 8 }}>
                      <Button variant="secondary" size="sm" disabled={safe === 0} onClick={() => setTxPage(safe - 1)}>Previous</Button>
                      <Button variant="secondary" size="sm" disabled={safe === pages - 1} onClick={() => setTxPage(safe + 1)}>Next</Button>
                    </div>
                  </div>
                )}
              </React.Fragment>
            );
          })()}
        </Card></div>
      </div>
    );
  }

  function PaymentMethodsTab() {
    const [p, setP] = React.useState(PAY_DEFAULTS);
    const [saved, setSaved] = React.useState(false);
    const [bakongToken, setBakongToken] = React.useState("");
    const [bakongCity, setBakongCity] = React.useState("");
    const [bakongSaved, setBakongSaved] = React.useState(false);
    const [abaMerchant, setAbaMerchant] = React.useState("");
    const [abaKey, setAbaKey] = React.useState("");
    const [abaSaved, setAbaSaved] = React.useState(false);
    const [stripeKey, setStripeKey] = React.useState("");
    const [stripeSaved, setStripeSaved] = React.useState(false);
    const CVM_DEFAULTS = { enabled: true, pack_size: 20, pack_price: 10, currency: "USD", cost_deterministic: 1, cost_ai: 3, ai_provider: "claude", claude_api_key: "", claude_model: "", gemini_api_key: "", gemini_model: "gemini-flash-latest" };
    const [cvm, setCvm] = React.useState(CVM_DEFAULTS);
    const [cvmSaved, setCvmSaved] = React.useState(false);
    React.useEffect(function() {
      window.KRAMA_ADMIN_API.fetchSettings('payment_config')
        .then(function(d) {
          if (d && d.data) { try { setP(Object.assign({}, PAY_DEFAULTS, JSON.parse(d.data))); } catch (e) {} }
        })
        .catch(function() {});
      window.KRAMA_ADMIN_API.fetchSettings('payment')
        .then(function(d) { if (d) { setBakongToken(d.bakong_token || ""); setBakongCity(d.merchant_city || ""); setAbaMerchant(d.aba_merchant_id || ""); setAbaKey(d.aba_api_key || ""); setStripeKey(d.stripe_secret_key || ""); } })
        .catch(function() {});
      window.KRAMA_ADMIN_API.fetchSettings('cv_match')
        .then(function(d) { if (d && Object.keys(d).length) { setCvm(Object.assign({}, CVM_DEFAULTS, d)); } })
        .catch(function() {});
    }, []);
    const saveCvm = () => {
      window.KRAMA_ADMIN_API.updateSettings('cv_match', cvm)
        .then(function() { setCvmSaved(true); setTimeout(function() { setCvmSaved(false); }, 3000); })
        .catch(function(e) { alert('Save failed: ' + (e && e.message ? e.message : 'Unknown error')); });
    };
    const setCvmField = (k, v) => setCvm(function (x) { return Object.assign({}, x, { [k]: v }); });
    const saveBakong = () => {
      window.KRAMA_ADMIN_API.updateSettings('payment', { bakong_token: bakongToken, merchant_city: bakongCity })
        .then(function() { setBakongSaved(true); setTimeout(function() { setBakongSaved(false); }, 3000); })
        .catch(function(e) { alert('Save failed: ' + (e && e.message ? e.message : 'Unknown error')); });
    };
    const saveAba = () => {
      window.KRAMA_ADMIN_API.updateSettings('payment', { aba_merchant_id: abaMerchant, aba_api_key: abaKey })
        .then(function() { setAbaSaved(true); setTimeout(function() { setAbaSaved(false); }, 3000); })
        .catch(function(e) { alert('Save failed: ' + (e && e.message ? e.message : 'Unknown error')); });
    };
    const saveStripe = () => {
      window.KRAMA_ADMIN_API.updateSettings('payment', { stripe_secret_key: stripeKey })
        .then(function() { setStripeSaved(true); setTimeout(function() { setStripeSaved(false); }, 3000); })
        .catch(function(e) { alert('Save failed: ' + (e && e.message ? e.message : 'Unknown error')); });
    };
    const setMethod = (key, k, v) => {
      setP((x) => {
        var next = { ...x, [key]: Object.assign({}, x[key], { [k]: v }) };
        if (k === "enabled") {
          window.KRAMA_ADMIN_API.updateSettings('payment_config', { data: JSON.stringify(next) })
            .then(function() { setSaved(true); })
            .catch(function(e) { alert('Save failed: ' + (e && e.message ? e.message : 'Unknown error')); });
        } else { setSaved(false); }
        return next;
      });
    };
    const save = () => {
      window.KRAMA_ADMIN_API.updateSettings('payment_config', { data: JSON.stringify(p) })
        .then(function() { setSaved(true); })
        .catch(function(e) { alert('Save failed: ' + (e && e.message ? e.message : 'Unknown error')); });
    };
    const methods = [
      { key: "khqr",   label: "KHQR",              desc: "Scan-to-pay QR accepted by all Cambodian banking apps.", tint: ["var(--brand-subtle)",   "var(--brand)"],   icon: "qr-code",   accountLabel: "KHQR account ID"           },
      // HIDDEN: ACLEDA — no gateway/API docs yet. Re-add this line to show it again.
      // { key: "acleda", label: "ACLEDA Bank",        desc: "ACLEDA mobile / bank transfer.",                         tint: ["var(--info-subtle)",    "var(--info)"],    icon: "landmark",  accountLabel: "ACLEDA account number"      },
      { key: "aba",    label: "ABA Bank",           desc: "ABA PAY / bank transfer.",                               tint: ["var(--accent-subtle)",  "var(--accent)"],  icon: "building-2",accountLabel: "ABA account number"         },
      { key: "card",   label: "Card (Visa / Mastercard)", desc: "Pay by Visa or Mastercard.",                        tint: ["var(--info-subtle)",    "var(--info)"],    icon: "credit-card",accountLabel: "Instructions / note"       },
      { key: "cod",    label: "Cash on Delivery",   desc: "Employer pays in cash — admin confirms after receipt.",  tint: ["var(--success-subtle)", "var(--success)"], icon: "banknote",  accountLabel: "Contact / instructions"     },
    ];
    const activeCount = methods.filter((m) => p[m.key].enabled).length;
    return (
      <div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
          <div>
            <h2 style={{ fontSize: "var(--text-lg)", fontWeight: 700, color: "var(--text-strong)" }}>Payment methods</h2>
            <p style={{ fontSize: "var(--text-sm)", color: "var(--text-muted)", marginTop: 2 }}>Choose which methods employers can pay with at checkout.</p>
          </div>
          <Button variant="primary" iconLeft={I("check", 16)} onClick={save}>Save changes</Button>
        </div>
        {saved && <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 16px", background: "var(--success-subtle)", border: "1px solid var(--success-border)", borderRadius: "var(--radius-md)", color: "var(--success)", fontWeight: 600, fontSize: "var(--text-sm)", marginBottom: 18 }}>
          {I("circle-check-big", 16)} Saved -- {activeCount} method{activeCount === 1 ? "" : "s"} available to employers.
        </div>}
        {methods.map((m) => {
          var cfg = p[m.key];
          return (
            <Card key={m.key} padding={24} style={{ marginBottom: 18 }}>
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 40, height: 40, borderRadius: "var(--radius-md)", background: m.tint[0], color: m.tint[1] }}>{I(m.icon, 20)}</span>
                  <div>
                    <h3 style={{ fontSize: "var(--text-lg)", fontWeight: 700, color: "var(--text-strong)" }}>{m.label}</h3>
                    <p style={{ fontSize: "var(--text-sm)", color: "var(--text-muted)", marginTop: 2 }}>{m.desc}</p>
                  </div>
                </div>
                <Switch checked={cfg.enabled} onChange={(v) => setMethod(m.key, "enabled", v)} />
              </div>
              <div style={{ marginTop: 20, paddingTop: 18, borderTop: "1px solid var(--border-subtle)", opacity: cfg.enabled ? 1 : 0.45, pointerEvents: cfg.enabled ? "auto" : "none", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }} className="krm-form-grid">
                <Input label="Merchant name" value={cfg.merchant} onChange={(e) => setMethod(m.key, "merchant", e.target.value)} />
                <Input label={m.accountLabel} value={cfg.account} onChange={(e) => setMethod(m.key, "account", e.target.value)} />
              </div>

              {m.key === "khqr" && (
                <div style={{ marginTop: 18, paddingTop: 18, borderTop: "1px solid var(--border-subtle)", opacity: cfg.enabled ? 1 : 0.45, pointerEvents: cfg.enabled ? "auto" : "none" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: "var(--text-sm)", fontWeight: 700, color: "var(--text-strong)" }}>{I("shield-check", 15)} Live verification <span style={{ fontWeight: 500, color: "var(--text-faint)" }}>— optional, via NBC Bakong</span></div>
                    <span style={{ fontSize: "var(--text-xs)", fontWeight: 700, padding: "3px 9px", borderRadius: "var(--radius-pill)", background: bakongToken ? "var(--success-subtle)" : "var(--surface-sunken)", color: bakongToken ? "var(--success)" : "var(--text-muted)" }}>{bakongToken ? "Auto-confirm" : "Manual"}</span>
                  </div>
                  {bakongSaved && <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "9px 13px", background: "var(--success-subtle)", border: "1px solid var(--success-border)", borderRadius: "var(--radius-md)", color: "var(--success)", fontWeight: 600, fontSize: "var(--text-sm)", marginBottom: 12 }}>{I("circle-check-big", 14)} Saved.</div>}
                  <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 16 }} className="krm-form-grid">
                    <Input label="Bakong API token" type="password" placeholder="eyJhbGciOi…" value={bakongToken} onChange={(e) => setBakongToken(e.target.value)} />
                    <Input label="Merchant city" placeholder="Phnom Penh" value={bakongCity} onChange={(e) => setBakongCity(e.target.value)} />
                  </div>
                  <div style={{ fontSize: "var(--text-xs)", color: "var(--text-faint)", marginTop: 8 }}>Paste your Bakong token to auto-confirm KHQR payments. Stored server-side, never sent to browsers. Leave blank to confirm manually.</div>
                  <div style={{ marginTop: 12 }}><Button variant="secondary" size="sm" iconLeft={I("check", 14)} onClick={saveBakong}>Save verification</Button></div>
                </div>
              )}

              {m.key === "aba" && (
                <div style={{ marginTop: 18, paddingTop: 18, borderTop: "1px solid var(--border-subtle)", opacity: cfg.enabled ? 1 : 0.45, pointerEvents: cfg.enabled ? "auto" : "none" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: "var(--text-sm)", fontWeight: 700, color: "var(--text-strong)" }}>{I("shield-check", 15)} Live verification <span style={{ fontWeight: 500, color: "var(--text-faint)" }}>— optional, via ABA PayWay</span></div>
                    <span style={{ fontSize: "var(--text-xs)", fontWeight: 700, padding: "3px 9px", borderRadius: "var(--radius-pill)", background: (abaMerchant && abaKey) ? "var(--success-subtle)" : "var(--surface-sunken)", color: (abaMerchant && abaKey) ? "var(--success)" : "var(--text-muted)" }}>{(abaMerchant && abaKey) ? "Auto-confirm" : "Manual"}</span>
                  </div>
                  {abaSaved && <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "9px 13px", background: "var(--success-subtle)", border: "1px solid var(--success-border)", borderRadius: "var(--radius-md)", color: "var(--success)", fontWeight: 600, fontSize: "var(--text-sm)", marginBottom: 12 }}>{I("circle-check-big", 14)} Saved.</div>}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: 16 }} className="krm-form-grid">
                    <Input label="PayWay merchant ID" placeholder="ec123456" value={abaMerchant} onChange={(e) => setAbaMerchant(e.target.value)} />
                    <Input label="PayWay API key" type="password" placeholder="••••••••••••" value={abaKey} onChange={(e) => setAbaKey(e.target.value)} />
                  </div>
                  <div style={{ fontSize: "var(--text-xs)", color: "var(--text-faint)", marginTop: 8 }}>Set your PayWay pushback URL to <code style={{ fontFamily: "var(--font-mono)" }}>/api/payments/aba/callback</code>. Stored server-side. Leave blank to confirm manually.</div>
                  <div style={{ marginTop: 12 }}><Button variant="secondary" size="sm" iconLeft={I("check", 14)} onClick={saveAba}>Save verification</Button></div>
                </div>
              )}

              {m.key === "card" && (
                <div style={{ marginTop: 18, paddingTop: 18, borderTop: "1px solid var(--border-subtle)", opacity: cfg.enabled ? 1 : 0.45, pointerEvents: cfg.enabled ? "auto" : "none" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: "var(--text-sm)", fontWeight: 700, color: "var(--text-strong)" }}>{I("shield-check", 15)} Live verification <span style={{ fontWeight: 500, color: "var(--text-faint)" }}>— optional, via Stripe</span></div>
                    <span style={{ fontSize: "var(--text-xs)", fontWeight: 700, padding: "3px 9px", borderRadius: "var(--radius-pill)", background: stripeKey ? "var(--success-subtle)" : "var(--surface-sunken)", color: stripeKey ? "var(--success)" : "var(--text-muted)" }}>{stripeKey ? "Auto-confirm" : "Manual"}</span>
                  </div>
                  {stripeSaved && <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "9px 13px", background: "var(--success-subtle)", border: "1px solid var(--success-border)", borderRadius: "var(--radius-md)", color: "var(--success)", fontWeight: 600, fontSize: "var(--text-sm)", marginBottom: 12 }}>{I("circle-check-big", 14)} Saved.</div>}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 16 }} className="krm-form-grid">
                    <Input label="Stripe secret key" type="password" placeholder="sk_live_… or sk_test_…" value={stripeKey} onChange={(e) => setStripeKey(e.target.value)} />
                  </div>
                  <div style={{ fontSize: "var(--text-xs)", color: "var(--text-faint)", marginTop: 8 }}>Paste your Stripe secret key to accept Visa/Mastercard via Stripe Checkout. Set your Stripe webhook to <code style={{ fontFamily: "var(--font-mono)" }}>/api/payments/stripe/webhook</code>. Stored server-side. Leave blank to confirm manually.</div>
                  <div style={{ marginTop: 12 }}><Button variant="secondary" size="sm" iconLeft={I("check", 14)} onClick={saveStripe}>Save verification</Button></div>
                </div>
              )}
            </Card>
          );
        })}
        <Card padding={24} style={{ marginBottom: 18 }}>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, marginBottom: 8 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 40, height: 40, borderRadius: "var(--radius-md)", background: "var(--brand-subtle)", color: "var(--brand)" }}>{I("git-compare-arrows", 20)}</span>
              <div>
                <h3 style={{ fontSize: "var(--text-lg)", fontWeight: 700, color: "var(--text-strong)" }}>CV Match credits (employer pricing)</h3>
                <p style={{ fontSize: "var(--text-sm)", color: "var(--text-muted)", marginTop: 2 }}>Employers buy CV-match credit packs (paid via the methods above) and spend them per comparison. AI comparisons cost more since they use the AI key.</p>
              </div>
            </div>
            <Switch checked={cvm.enabled !== false && cvm.enabled !== "0"} onChange={(v) => setCvmField("enabled", v)} />
          </div>
          {cvmSaved && <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", background: "var(--success-subtle)", border: "1px solid var(--success-border)", borderRadius: "var(--radius-md)", color: "var(--success)", fontWeight: 600, fontSize: "var(--text-sm)", margin: "10px 0" }}>{I("circle-check-big", 15)} CV Match pricing saved.</div>}
          <div style={{ marginTop: 14, display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 16 }} className="krm-form-grid">
            <Input label="Credits per pack" type="number" value={cvm.pack_size} onChange={(e) => setCvmField("pack_size", e.target.value)} />
            <Input label="Pack price ($)" type="number" value={cvm.pack_price} onChange={(e) => setCvmField("pack_price", e.target.value)} />
            <Input label="Cost: standard" type="number" value={cvm.cost_deterministic} onChange={(e) => setCvmField("cost_deterministic", e.target.value)} />
            <Input label="Cost: AI" type="number" value={cvm.cost_ai} onChange={(e) => setCvmField("cost_ai", e.target.value)} />
          </div>
          <div style={{ marginTop: 18, paddingTop: 16, borderTop: "1px solid var(--border-subtle)" }}>
            <div style={{ fontSize: "var(--text-sm)", fontWeight: 700, color: "var(--text-strong)", marginBottom: 4 }}>AI comparison engine</div>
            <p style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)", marginTop: 0, marginBottom: 10 }}>Which AI powers the employer's "AI" compare. The Standard (free) engine is unaffected.</p>
            <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
              {[["claude", "Claude (Anthropic)"], ["gemini", "Gemini (Google · free tier)"]].map(function (opt) {
                var on = (cvm.ai_provider || "claude") === opt[0];
                return (
                  <button key={opt[0]} onClick={function () { setCvmField("ai_provider", opt[0]); }} style={{ flex: 1, padding: "10px 12px", borderRadius: "var(--radius-md)", cursor: "pointer", border: "1px solid " + (on ? "var(--brand)" : "var(--border-strong)"), background: on ? "var(--brand-subtle)" : "var(--surface-card)", color: on ? "var(--text-brand)" : "var(--text-body)", fontFamily: "var(--font-sans)", fontSize: "var(--text-sm)", fontWeight: 700 }}>{opt[1]}</button>
                );
              })}
            </div>
            {(cvm.ai_provider || "claude") === "gemini" ? (
              <div className="krm-form-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <div style={{ gridColumn: "1 / -1" }}>
                  <Input label="Gemini API key" type="password" value={cvm.gemini_api_key || ""} onChange={function (e) { setCvmField("gemini_api_key", e.target.value); }} placeholder="AIza…" iconLeft={I("key", 16)} />
                </div>
                <Input label="Gemini model" value={cvm.gemini_model || ""} onChange={function (e) { setCvmField("gemini_model", e.target.value); }} placeholder="gemini-flash-latest" />
                <div style={{ display: "flex", alignItems: "flex-end" }}>
                  <p style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)", margin: 0 }}>Get a free key from Google AI Studio (aistudio.google.com/apikey).</p>
                </div>
              </div>
            ) : (
              <div className="krm-form-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <div style={{ gridColumn: "1 / -1" }}>
                  <Input label="Claude API key" type="password" value={cvm.claude_api_key || ""} onChange={function (e) { setCvmField("claude_api_key", e.target.value); }} placeholder="sk-ant-…" iconLeft={I("key", 16)} />
                </div>
                <Input label="Claude model" value={cvm.claude_model || ""} onChange={function (e) { setCvmField("claude_model", e.target.value); }} placeholder="claude-haiku-4-5" />
                <div style={{ display: "flex", alignItems: "flex-end" }}>
                  <p style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)", margin: 0 }}>Leave blank to reuse the key from the <strong>Chat agent</strong> tab. Get a key at console.anthropic.com.</p>
                </div>
              </div>
            )}
          </div>
          <div style={{ marginTop: 16 }}><Button variant="primary" iconLeft={I("check", 16)} onClick={saveCvm}>Save CV Match pricing</Button></div>
        </Card>
        <div style={{ fontSize: "var(--text-xs)", color: "var(--text-faint)", display: "flex", alignItems: "center", gap: 6, marginTop: 4 }}>
          {I("shield", 13)} Payment method settings saved to the database via the API.
        </div>
      </div>
    );
  }

  function PaymentSettings() {
    const [tab, setTab] = React.useState("plans");
    const TABS = [
      { id: "plans",         label: "Plans",            icon: "package" },
      { id: "subscriptions", label: "Subscriptions",    icon: "user-check" },
      { id: "transactions",  label: "Transactions",     icon: "receipt" },
      { id: "methods",       label: "Payment methods",  icon: "credit-card" },
    ];
    return (
      <div className="krm-page-pad" style={{ padding: 28, maxWidth: 1100 }}>
        <ScreenHead title="Payments" sub="Manage plans and employer subscriptions." />
        <div style={{ display: "flex", gap: 4, marginBottom: 24, borderBottom: "1px solid var(--border)", paddingBottom: 0 }}>
          {TABS.map((t) => (
            <button key={t.id} onClick={() => setTab(t.id)} style={{ display: "flex", alignItems: "center", gap: 7, padding: "10px 18px", border: "none", background: "transparent", cursor: "pointer", fontFamily: "var(--font-sans)", fontWeight: 600, fontSize: "var(--text-sm)", color: tab === t.id ? "var(--text-brand)" : "var(--text-muted)", borderBottom: "2px solid " + (tab === t.id ? "var(--brand)" : "transparent"), marginBottom: -1 }}>
              {I(t.icon, 15)} {t.label}
            </button>
          ))}
        </div>
        {tab === "plans"         && <PlansTab />}
        {tab === "subscriptions" && <SubscriptionsTab />}
        {tab === "transactions"  && <TransactionsTab />}
        {tab === "methods"       && <PaymentMethodsTab />}
      </div>
    );
  }

  // ===== Resume Builder =====
  function ResumeDetailPanel({ resumeId, onClose }) {
    const [r, setR] = React.useState(null);
    const [loading, setLoading] = React.useState(true);
    const [cvLoading, setCvLoading] = React.useState(false);
    const [cvErr, setCvErr] = React.useState("");
    React.useEffect(function() {
      setLoading(true);
      window.KRAMA_ADMIN_API.fetchResume(resumeId)
        .then(function(d) { setR(d); })
        .catch(function() {})
        .finally(function() { setLoading(false); });
    }, [resumeId]);

    function downloadCv() {
      if (!r) return;
      setCvLoading(true); setCvErr("");
      var token = localStorage.getItem('krama_admin_token');
      var BASE = /^(localhost|127\.0\.0\.1|::1|192\.168\.|10\.)/.test(window.location.hostname) ? 'http://127.0.0.1:8000/api' : (window.location.protocol + '//' + window.location.host + '/api');
      fetch(BASE + '/admin/resumes/' + r.id + '/cv', { headers: { 'Authorization': 'Bearer ' + token } })
        .then(function(resp) {
          if (!resp.ok) throw new Error('Server error ' + resp.status);
          var cd = resp.headers.get('content-disposition') || '';
          var m = cd.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
          var fname = m ? m[1].replace(/['"]/g, '') : ((r.candidate && r.candidate.name ? r.candidate.name.replace(/\s+/g,'_') : 'candidate') + '_cv.pdf');
          return resp.blob().then(function(blob) {
            var url = URL.createObjectURL(blob);
            var a = document.createElement('a');
            a.href = url; a.download = fname;
            document.body.appendChild(a); a.click();
            setTimeout(function() { document.body.removeChild(a); URL.revokeObjectURL(url); }, 300);
          });
        })
        .catch(function(e) { setCvErr('Download failed: ' + (e && e.message ? e.message : 'Unknown error')); })
        .finally(function() { setCvLoading(false); });
    }

    const fmtDate = function(iso) {
      if (!iso) return "--";
      var d = new Date(iso);
      return d.getDate() + " " + ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"][d.getMonth()] + " " + d.getFullYear();
    };

    var c = (r && r.candidate) || {};
    var data = (r && r.data) || {};
    var edu  = data.education     || [];
    var exp  = data.experience    || [];
    var skills = data.skills      || [];
    var certs  = data.certifications || [];
    var langs  = data.languages   || [];

    function Section({ icon, title, children, empty }) {
      return (
        <div style={{ marginBottom: 24 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 12, paddingBottom: 8, borderBottom: "1px solid var(--border-subtle)" }}>
            {I(icon, 15)}
            <span style={{ fontWeight: 700, fontSize: "var(--text-sm)", color: "var(--text-strong)", textTransform: "uppercase", letterSpacing: ".05em" }}>{title}</span>
          </div>
          {children || <p style={{ fontSize: "var(--text-sm)", color: "var(--text-faint)", fontStyle: "italic" }}>{empty || "None recorded"}</p>}
        </div>
      );
    }

    return (
      <div onClick={onClose} style={{ position: "fixed", inset: 0, zIndex: 300, background: "var(--surface-overlay)", display: "flex", justifyContent: "flex-end", animation: "krmfade var(--dur-base) var(--ease-out)" }}>
        <div onClick={function(e) { e.stopPropagation(); }} style={{ width: 560, maxWidth: "95vw", height: "100%", background: "var(--surface-card)", boxShadow: "var(--shadow-xl)", display: "flex", flexDirection: "column", animation: "krmslide var(--dur-base) var(--ease-out)" }}>

          {/* Header */}
          <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "20px 24px", borderBottom: "1px solid var(--border)", background: "var(--teal-800)" }}>
            <div style={{ position: "relative" }}>
              <Avatar src={c.avatar_url} name={c.name || "?"} size={56} />
              {c.status === "active" && (
                <span style={{ position: "absolute", bottom: 2, right: 2, width: 12, height: 12, borderRadius: "50%", background: "var(--success)", border: "2px solid var(--teal-800)" }} />
              )}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "var(--text-xl)", color: "#fff" }}>{c.name || "—"}</div>
              <div style={{ fontSize: "var(--text-sm)", color: "var(--teal-200)", marginTop: 2 }}>{c.email}</div>
              {c.phone && <div style={{ fontSize: "var(--text-xs)", color: "var(--teal-300)", marginTop: 1 }}>{c.phone}</div>}
            </div>
            <IconButton aria-label="Close" onClick={onClose} style={{ color: "#fff" }}>{I("x", 18)}</IconButton>
          </div>

          {/* Headline strip */}
          {!loading && r && (
            <div style={{ padding: "14px 24px", background: "var(--surface-sunken)", borderBottom: "1px solid var(--border)" }}>
              {r.headline && <div style={{ fontWeight: 700, fontSize: "var(--text-base)", color: "var(--text-strong)" }}>{r.headline}</div>}
              {r.summary  && <div style={{ fontSize: "var(--text-sm)", color: "var(--text-muted)", marginTop: 4 }}>{r.summary}</div>}
              <div style={{ display: "flex", gap: 16, marginTop: 8, fontSize: "var(--text-xs)", color: "var(--text-faint)" }}>
                <span>{I("calendar", 12)} Member since {fmtDate(c.created_at)}</span>
                <span>{I("clock", 12)} Updated {fmtDate(r.updated_at)}</span>
                {r.has_cv && (
                <button onClick={downloadCv} disabled={cvLoading} style={{ display:"inline-flex", alignItems:"center", gap:5, padding:"3px 10px", background:"var(--brand-subtle)", color:"var(--text-brand)", border:"1px solid var(--brand)", borderRadius:"var(--radius-full)", fontSize:"var(--text-xs)", fontWeight:700, cursor: cvLoading ? "wait" : "pointer", fontFamily:"var(--font-sans)" }}>
                  {I(cvLoading ? "loader" : "download", 12)} {cvLoading ? "Downloading…" : "Download CV"}
                </button>
              )}
              {cvErr && <span style={{ fontSize:"var(--text-xs)", color:"var(--danger)" }}>{cvErr}</span>}
              </div>
            </div>
          )}

          {/* Body */}
          <div style={{ flex: 1, overflowY: "auto", padding: "24px 24px 32px" }}>
            {loading && <div style={{ textAlign: "center", padding: 40, color: "var(--text-muted)" }}>{I("loader", 20)} Loading…</div>}

            {!loading && !r && <div style={{ textAlign: "center", padding: 40, color: "var(--danger)" }}>Failed to load resume.</div>}

            {!loading && r && (
              <React.Fragment>
                {/* Experience */}
                <Section icon="briefcase" title="Work experience">
                  {exp.length > 0 && exp.map(function(e, i) {
                    return (
                      <div key={i} style={{ display: "flex", gap: 14, marginBottom: i < exp.length-1 ? 14 : 0 }}>
                        <div style={{ width: 8, flexShrink: 0, marginTop: 6, display: "flex", flexDirection: "column", alignItems: "center" }}>
                          <div style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--brand)" }} />
                          {i < exp.length - 1 && <div style={{ width: 2, flex: 1, background: "var(--border)", marginTop: 4 }} />}
                        </div>
                        <div style={{ flex: 1, paddingBottom: 4 }}>
                          <div style={{ fontWeight: 700, fontSize: "var(--text-sm)", color: "var(--text-strong)" }}>{e.role || "—"}</div>
                          <div style={{ fontSize: "var(--text-sm)", color: "var(--text-body)" }}>{e.org}{e.years ? " · " + e.years : ""}</div>
                          {e.note && <div style={{ fontSize: "var(--text-sm)", color: "var(--text-muted)", marginTop: 4 }}>{e.note}</div>}
                        </div>
                      </div>
                    );
                  })}
                </Section>

                {/* Education */}
                <Section icon="graduation-cap" title="Education">
                  {edu.length > 0 && edu.map(function(e, i) {
                    return (
                      <div key={i} style={{ display: "flex", gap: 12, marginBottom: i < edu.length-1 ? 12 : 0 }}>
                        <div style={{ width: 34, height: 34, borderRadius: "var(--radius-md)", background: "var(--brand-subtle)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                          {I("graduation-cap", 16)}
                        </div>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: "var(--text-sm)", color: "var(--text-strong)" }}>{e.degree || "—"}</div>
                          <div style={{ fontSize: "var(--text-sm)", color: "var(--text-body)" }}>{e.school}{e.years ? " · " + e.years : ""}</div>
                        </div>
                      </div>
                    );
                  })}
                </Section>

                {/* Skills */}
                <Section icon="zap" title="Skills">
                  {skills.length > 0 && (
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                      {skills.map(function(s, i) {
                        return (
                          <span key={i} style={{ padding: "4px 12px", background: "var(--brand-subtle)", color: "var(--text-brand)", borderRadius: "var(--radius-full)", fontSize: "var(--text-sm)", fontWeight: 600 }}>
                            {typeof s === "object" ? (s.name || s.skill || JSON.stringify(s)) : s}
                          </span>
                        );
                      })}
                    </div>
                  )}
                </Section>

                {/* Certifications */}
                <Section icon="award" title="Certifications">
                  {certs.length > 0 && certs.map(function(cert, i) {
                    return (
                      <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: i < certs.length-1 ? 10 : 0 }}>
                        <div style={{ width: 32, height: 32, borderRadius: "var(--radius-md)", background: "var(--saffron-50)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                          {I("award", 15)}
                        </div>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: "var(--text-sm)", color: "var(--text-strong)" }}>{cert.name || "—"}</div>
                          {cert.year && <div style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>{cert.year}</div>}
                        </div>
                      </div>
                    );
                  })}
                </Section>

                {/* Languages */}
                {langs.length > 0 && (
                  <Section icon="languages" title="Languages">
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                      {langs.map(function(l, i) {
                        var name = typeof l === "object" ? (l.name || l.language || JSON.stringify(l)) : l;
                        var level = typeof l === "object" ? l.level : null;
                        return (
                          <span key={i} style={{ padding: "4px 12px", background: "var(--surface-sunken)", color: "var(--text-body)", borderRadius: "var(--radius-full)", fontSize: "var(--text-sm)", border: "1px solid var(--border)" }}>
                            {name}{level ? " · " + level : ""}
                          </span>
                        );
                      })}
                    </div>
                  </Section>
                )}

                {/* Bio */}
                {c.bio && (
                  <Section icon="user" title="About candidate">
                    <p style={{ fontSize: "var(--text-sm)", color: "var(--text-body)", lineHeight: 1.6 }}>{c.bio}</p>
                  </Section>
                )}
              </React.Fragment>
            )}
          </div>
        </div>
        <style>{`
          @keyframes krmfade { from { opacity: 0 } to { opacity: 1 } }
          @keyframes krmslide { from { transform: translateX(40px); opacity: .4 } to { transform: none; opacity: 1 } }
        `}</style>
      </div>
    );
  }

  function Reviews() {
    const [reviews, setReviews] = React.useState([]);
    const [total, setTotal] = React.useState(0);
    const [lastPage, setLastPage] = React.useState(1);
    const [page, setPage] = React.useState(1);
    const [status, setStatus] = React.useState("pending");
    const [busy, setBusy] = React.useState({});
    const [msg, setMsg] = React.useState("");
    const [loading, setLoading] = React.useState(true);

    var load = function(s, p) {
      setLoading(true);
      adm.fetchReviews(s || status, p || page).then(function(d) {
        setReviews(d.data || []);
        setTotal(d.total || 0);
        setLastPage(d.last_page || 1);
        setLoading(false);
      }).catch(function() { setLoading(false); });
    };

    React.useEffect(function() { load(status, page); }, [status, page]);

    var flash = function(m) { setMsg(m); setTimeout(function() { setMsg(""); }, 3000); };

    var act = function(id, action) {
      setBusy(function(b) { var n = Object.assign({}, b); n[id] = true; return n; });
      var fn = action === "approve" ? adm.approveReview(id) : adm.rejectReview(id);
      fn.then(function() {
        flash(action === "approve" ? "Review approved and published." : "Review rejected.");
        setBusy(function(b) { var n = Object.assign({}, b); delete n[id]; return n; });
        load(status, page);
      }).catch(function(e) {
        flash("Error: " + ((e && e.message) || "Request failed."));
        setBusy(function(b) { var n = Object.assign({}, b); delete n[id]; return n; });
      });
    };

    var fmtDate = function(iso) {
      if (!iso) return "--";
      var d = new Date(iso);
      return d.getDate() + " " + ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"][d.getMonth()] + " " + d.getFullYear();
    };

    var Stars = function(rating) {
      return (
        <span style={{ display: "inline-flex", gap: 1, color: "var(--saffron-500)" }}>
          {[1,2,3,4,5].map(function(n) {
            return <span key={n} style={{ opacity: n <= rating ? 1 : 0.2 }}>{I("star", 13)}</span>;
          })}
        </span>
      );
    };

    return (
      <div className="krm-page-pad" style={{ padding: 28, maxWidth: 1000 }}>
        <ScreenHead title="Company reviews" sub="Moderate reviews before they appear on company profiles." />

        <Tabs value={status} onChange={function(v) { setStatus(v); setPage(1); }} tabs={[
          { value: "pending",  label: "Pending" },
          { value: "approved", label: "Approved" },
          { value: "rejected", label: "Rejected" },
          { value: "all",      label: "All" },
        ]} style={{ marginBottom: 20 }} />

        {msg && <div style={{ padding: "10px 14px", background: "var(--success-subtle)", color: "var(--success)", borderRadius: "var(--radius-md)", marginBottom: 14, fontWeight: 600, fontSize: "var(--text-sm)" }}>{msg}</div>}

        {loading && <div style={{ padding: 32, textAlign: "center", color: "var(--text-muted)", fontSize: "var(--text-sm)" }}>Loading…</div>}
        {!loading && reviews.length === 0 && <EmptyState icon={I("star", 28)} title="No reviews" body={"No " + (status === "all" ? "" : status + " ") + "reviews at this time."} />}

        {!loading && reviews.length > 0 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {reviews.map(function(r) {
              var companyName = r.company ? r.company.name : "–";
              var candidateName = r.candidate ? r.candidate.name : "–";
              var candidateEmail = r.candidate ? r.candidate.email : "";
              return (
                <div key={r.id} style={{ background: "var(--surface-card)", border: "1px solid var(--border)", borderRadius: "var(--radius-lg)", padding: "18px 20px" }}>
                  <div style={{ display: "flex", alignItems: "flex-start", gap: 14, flexWrap: "wrap" }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", marginBottom: 4 }}>
                        {Stars(r.rating)}
                        <span style={{ fontSize: "var(--text-xs)", color: "var(--text-faint)" }}>({r.rating}/5)</span>
                        <StatusBadge status={r.status} />
                        {r.is_anonymous && <Badge tone="neutral">Anonymous</Badge>}
                      </div>
                      {r.title && <div style={{ fontWeight: 700, fontSize: "var(--text-base)", color: "var(--text-strong)", marginBottom: 4 }}>{r.title}</div>}
                      <div style={{ fontSize: "var(--text-sm)", color: "var(--text-body)", lineHeight: 1.6, marginBottom: 10 }}>{r.body}</div>
                      <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
                        <span style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>
                          <strong>Company:</strong> {companyName}
                        </span>
                        <span style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>
                          <strong>By:</strong> {candidateName} {candidateEmail ? "· " + candidateEmail : ""}
                        </span>
                        <span style={{ fontSize: "var(--text-xs)", color: "var(--text-faint)" }}>{fmtDate(r.created_at)}</span>
                      </div>
                    </div>
                    {r.status === "pending" && (
                      <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
                        <Button variant="primary" size="sm" disabled={busy[r.id]} onClick={function() { act(r.id, "approve"); }}>Approve</Button>
                        <Button variant="secondary" size="sm" disabled={busy[r.id]} onClick={function() { act(r.id, "reject"); }}>Reject</Button>
                      </div>
                    )}
                    {r.status === "approved" && (
                      <div style={{ flexShrink: 0 }}>
                        <Button variant="secondary" size="sm" disabled={busy[r.id]} onClick={function() { act(r.id, "reject"); }}>Remove</Button>
                      </div>
                    )}
                    {r.status === "rejected" && (
                      <div style={{ flexShrink: 0 }}>
                        <Button variant="secondary" size="sm" disabled={busy[r.id]} onClick={function() { act(r.id, "approve"); }}>Re-approve</Button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {!loading && lastPage > 1 && (
          <div style={{ display: "flex", gap: 10, justifyContent: "center", marginTop: 20 }}>
            <Button variant="secondary" size="sm" disabled={page === 1} onClick={function() { setPage(page - 1); }}>Previous</Button>
            <span style={{ fontSize: "var(--text-sm)", color: "var(--text-muted)", display: "flex", alignItems: "center" }}>Page {page} of {lastPage}</span>
            <Button variant="secondary" size="sm" disabled={page === lastPage} onClick={function() { setPage(page + 1); }}>Next</Button>
          </div>
        )}
      </div>
    );
  }

  function ResumesPage() {
    const [resumes, setResumes] = React.useState(null);
    const [total, setTotal] = React.useState(0);
    const [lastPage, setLastPage] = React.useState(1);
    const [page, setPage] = React.useState(1);
    const [search, setSearch] = React.useState("");
    const [query, setQuery] = React.useState("");
    const [selected, setSelected] = React.useState(null); // resume id for detail panel
    const PER = 10;

    React.useEffect(function() {
      setResumes(null);
      window.KRAMA_ADMIN_API.fetchResumes(query, page, PER).then(function(d) {
        setResumes(d.data || []);
        setTotal(d.total || 0);
        setLastPage(d.last_page || 1);
      }).catch(function() { setResumes([]); });
    }, [query, page]);

    var runSearch = function() { setPage(1); setQuery(search.trim()); };
    var fmtDate = function(iso) {
      if (!iso) return "--";
      var d = new Date(iso);
      return d.getDate() + " " + ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"][d.getMonth()] + " " + d.getFullYear();
    };

    return (
      <div className="krm-page-pad" style={{ padding: 28, maxWidth: 1100 }}>
        <ScreenHead title="Resume Builder" sub={"All candidate resumes built on Krama. " + (total ? total + " total." : "")} />

        {/* Search bar */}
        <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>
          <div style={{ flex: 1, maxWidth: 380, position: "relative" }}>
            <div style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--text-faint)", pointerEvents: "none" }}>{I("search", 15)}</div>
            <input
              value={search}
              onChange={function(e) { setSearch(e.target.value); }}
              onKeyDown={function(e) { if (e.key === "Enter") runSearch(); }}
              placeholder="Search by name, email, or headline…"
              style={{ width: "100%", padding: "9px 12px 9px 38px", border: "1px solid var(--border)", borderRadius: "var(--radius-md)", fontFamily: "var(--font-sans)", fontSize: "var(--text-sm)", background: "var(--surface-card)", color: "var(--text-body)", boxSizing: "border-box" }}
            />
          </div>
          <Button variant="secondary" onClick={runSearch}>Search</Button>
          {query && <Button variant="ghost" onClick={function() { setSearch(""); setQuery(""); setPage(1); }}>Clear</Button>}
          <div style={{ marginLeft: "auto", fontSize: "var(--text-sm)", color: "var(--text-muted)", display: "flex", alignItems: "center" }}>
            {total} resume{total !== 1 ? "s" : ""}
          </div>
        </div>

        {/* Table */}
        {!resumes && <div style={{ padding: 40, textAlign: "center", color: "var(--text-muted)" }}>{I("loader", 20)} Loading…</div>}

        {resumes && resumes.length === 0 && (
          <div style={{ padding: "48px 24px", textAlign: "center", background: "var(--surface-card)", borderRadius: "var(--radius-lg)", border: "1px dashed var(--border)" }}>
            <div style={{ marginBottom: 8 }}>{I("file-text", 36)}</div>
            <div style={{ fontWeight: 600, color: "var(--text-muted)" }}>No resumes found{query ? ' for "' + query + '"' : ""}.</div>
          </div>
        )}

        {resumes && resumes.length > 0 && (
          <div className="krm-table-wrap"><Card padding={0}>
            <div style={{ display: "grid", gridTemplateColumns: "2fr 1.4fr 0.8fr 0.8fr 0.8fr 0.7fr", padding: "10px 20px", fontSize: "var(--text-xs)", fontWeight: 700, letterSpacing: ".04em", textTransform: "uppercase", color: "var(--text-faint)", borderBottom: "1px solid var(--border-subtle)" }}>
              <span>Candidate</span>
              <span>Headline</span>
              <span>Experience</span>
              <span>Skills</span>
              <span>Updated</span>
              <span style={{ textAlign: "right" }}>Action</span>
            </div>
            {resumes.map(function(r, idx) {
              var c = r.candidate || {};
              var data = r.data || {};
              var expCount  = (data.experience || []).length;
              var skillCount = (data.skills || []).length;
              var isLast = idx === resumes.length - 1;
              return (
                <div key={r.id} style={{ display: "grid", gridTemplateColumns: "2fr 1.4fr 0.8fr 0.8fr 0.8fr 0.7fr", alignItems: "center", padding: "14px 20px", borderBottom: isLast ? "none" : "1px solid var(--border-subtle)", cursor: "pointer", transition: "background var(--dur-fast)" }}
                  onMouseEnter={function(e) { e.currentTarget.style.background = "var(--surface-sunken)"; }}
                  onMouseLeave={function(e) { e.currentTarget.style.background = ""; }}
                  onClick={function() { setSelected(r.id); }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <Avatar src={c.avatar_url} name={c.name || "?"} size={38} />
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontWeight: 700, fontSize: "var(--text-sm)", color: "var(--text-strong)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{c.name || "—"}</div>
                      <div style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>{c.email}</div>
                    </div>
                  </div>
                  <div style={{ fontSize: "var(--text-sm)", color: "var(--text-body)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{r.headline || <span style={{ color: "var(--text-faint)", fontStyle: "italic" }}>No headline</span>}</div>
                  <div style={{ fontSize: "var(--text-sm)", color: "var(--text-body)" }}>{expCount > 0 ? expCount + " job" + (expCount !== 1 ? "s" : "") : <span style={{ color: "var(--text-faint)" }}>—</span>}</div>
                  <div style={{ fontSize: "var(--text-sm)", color: "var(--text-body)" }}>{skillCount > 0 ? skillCount : <span style={{ color: "var(--text-faint)" }}>—</span>}</div>
                  <div style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>{fmtDate(r.updated_at)}</div>
                  <div style={{ textAlign: "right" }}>
                    <Button variant="ghost" size="sm" iconLeft={I("eye", 13)} onClick={function(e) { e.stopPropagation(); setSelected(r.id); }}>View</Button>
                  </div>
                </div>
              );
            })}
          </Card></div>
        )}

        {/* Pagination */}
        {resumes && total > 0 && (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 18 }}>
            <span style={{ fontSize: "var(--text-sm)", color: "var(--text-muted)" }}>
              Showing {(page - 1) * PER + 1}–{Math.min(page * PER, total)} of {total}
            </span>
            {lastPage > 1 && (
              <div style={{ display: "flex", gap: 8 }}>
                <Button variant="secondary" size="sm" disabled={page <= 1} onClick={function() { setPage(function(p) { return Math.max(1, p - 1); }); }}>Previous</Button>
                <span style={{ display: "inline-flex", alignItems: "center", padding: "0 8px", fontSize: "var(--text-sm)", color: "var(--text-body)", fontWeight: 600 }}>Page {page} of {lastPage}</span>
                <Button variant="secondary" size="sm" disabled={page >= lastPage} onClick={function() { setPage(function(p) { return Math.min(lastPage, p + 1); }); }}>Next</Button>
              </div>
            )}
          </div>
        )}

        {/* Detail slide panel */}
        {selected && <ResumeDetailPanel resumeId={selected} onClose={function() { setSelected(null); }} />}
      </div>
    );
  }

  function App() {
    const [page, setPage] = React.useState("dashboard");
    const [authUser, setAuthUser] = React.useState(null);
    const [authLoading, setAuthLoading] = React.useState(true);
    const [badges, setBadges] = React.useState({});
    const [sidebarOpen, setSidebarOpen] = React.useState(false);

    React.useEffect(() => {
      adm.fetchMe().then(function (u) { setAuthUser(u); setAuthLoading(false); }).catch(function () { setAuthLoading(false); });
    }, []);

    // Sidebar badges reflect items awaiting review (pending only). Re-checked when navigating.
    React.useEffect(() => {
      if (!authUser) return;
      var tot = function (x) { return x.total || (x.meta && x.meta.total) || 0; };
      Promise.all([adm.fetchJobs("pending", 1), adm.fetchCompanies("pending", 1)])
        .then(function (r) { setBadges({ jobs: tot(r[0]), companies: tot(r[1]) }); })
        .catch(function () {});
    }, [authUser, page]);

    const handleLogout = () => {
      adm.logout().then(function () {
        // Also clear the public-website and employer tokens so the user
        // is fully signed out on every page, not just the admin dashboard.
        localStorage.removeItem("krama_access_token");
        localStorage.removeItem("krama_refresh_token");
        localStorage.removeItem("krama_employer_token");
        localStorage.removeItem("krama_employer_refresh_token");
        window.location.href = "/krama/krama/ui_kits/public-website/index.html";
      });
    };

    if (authLoading) {
      return (
        <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: "var(--stone-900)", gap: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <img src={window.getKramaLogo("../../assets/krama-mark.svg")} height="40" alt="KRAMA" />
            <span style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "24px", letterSpacing: ".08em", color: "#fff", opacity: 0.9 }}>{window.KRAMA_BRAND_NAME || "KRAMA"}</span>
          </div>
          <div style={{ width: 36, height: 36, border: "3px solid rgba(255,255,255,0.2)", borderTopColor: "#fff", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
          <style>{"@keyframes spin{to{transform:rotate(360deg)}}"}</style>
        </div>
      );
    }

    if (!authUser) return <AdminLogin onLogin={setAuthUser} />;

    const titles = { dashboard: "Overview", jobs: "Job management", companies: "Company management", candidates: "Candidates", resumes: "Resume Builder", reviews: "Company reviews", forum: "Community forum", homepage: "Homepage content", chat: "Chat agent", social: "Social login", email: "Email settings", telegram: "Telegram notifications", sms: "SMS gateway", social_post: "Social posting", payments: "Payment settings", reports: "Reports", banners: "Promotional banner", brand: "Brand settings", settings: "Settings · Users & roles", profile: "My Profile" };
    return (
      <div style={{ display: "flex", minHeight: "100vh", background: "var(--surface-page)" }}>
        {sidebarOpen && <div className="krm-sidebar-backdrop open" onClick={() => setSidebarOpen(false)} />}
        <Sidebar page={page} onNav={setPage} badges={badges} open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column" }}>
          <Topbar title={titles[page]} user={authUser} onLogout={handleLogout} onNav={setPage} onMenu={() => setSidebarOpen(o => !o)} />
          {page === "dashboard" && <Overview />}
          {page === "jobs" && <Approvals />}
          {page === "companies" && <CompaniesMgmt />}
          {page === "candidates" && <Candidates />}
          {page === "resumes"    && <ResumesPage />}
          {page === "reviews"   && <Reviews />}
          {page === "forum"     && <ForumModeration />}

          {page === "homepage" && <Homepage />}
          {page === "chat" && <ChatAgentSettings />}
          {page === "social" && <SocialLoginSettings />}
          {page === "email" && <EmailSettings />}
          {page === "telegram" && <TelegramSettings />}
          {page === "sms" && <SmsSettings />}
          {page === "social_post" && <SocialPostingSettings />}
          {page === "payments" && <PaymentSettings />}
          {page === "reports" && <Reports />}
          {page === "audit" && <AuditLog />}
          {page === "cvmatch" && <CvMatch />}
          {page === "brand" && <Brand />}
          {page === "settings" && <Settings authUser={authUser} />}
          {page === "profile" && <MyProfile user={authUser} onUserUpdate={u => setAuthUser(u)} />}
        </div>
      </div>
    );
  }

  // ── SMS Gateway Settings ─────────────────────────────────────────────────────
  const SMS_DEFAULTS = { enabled: false, driver: "twilio", twilio_sid: "", twilio_token: "", twilio_from: "", http_url: "", http_method: "GET", http_to_param: "to", http_text_param: "text", http_extra: "", http_header: "" };

  const SOCIAL_POST_DEFAULTS = { enabled: false, telegram_enabled: false, telegram_channel: "", facebook_enabled: false, facebook_page_id: "", facebook_page_token: "", linkedin_enabled: false, linkedin_token: "", linkedin_author_urn: "" };

  function SocialPostingSettings() {
    const adm = window.KRAMA_ADMIN_API;
    const [s, setS] = React.useState(SOCIAL_POST_DEFAULTS);
    const [saved, setSaved] = React.useState(false);
    const [testing, setTesting] = React.useState(false);
    const [results, setResults] = React.useState(null);

    React.useEffect(function () {
      adm.fetchSettings("social_post").then(function (d) {
        if (d && Object.keys(d).length) {
          setS(Object.assign({}, SOCIAL_POST_DEFAULTS, {
            enabled: !!d.enabled,
            telegram_enabled: !!d.telegram_enabled, telegram_channel: d.telegram_channel || "",
            facebook_enabled: !!d.facebook_enabled, facebook_page_id: d.facebook_page_id || "", facebook_page_token: d.facebook_page_token || "",
            linkedin_enabled: !!d.linkedin_enabled, linkedin_token: d.linkedin_token || "", linkedin_author_urn: d.linkedin_author_urn || "",
          }));
        }
      }).catch(function () {});
    }, []);

    const anyConfigured = (s.telegram_enabled && s.telegram_channel) || (s.facebook_enabled && s.facebook_page_id && s.facebook_page_token) || (s.linkedin_enabled && s.linkedin_token && s.linkedin_author_urn);
    const connected = s.enabled && anyConfigured;
    const set = (k, v) => { setS(p => ({ ...p, [k]: v })); setSaved(false); setResults(null); };

    const save = () => {
      adm.updateSettings("social_post", {
        enabled: s.enabled,
        telegram_enabled: s.telegram_enabled, telegram_channel: s.telegram_channel,
        facebook_enabled: s.facebook_enabled, facebook_page_id: s.facebook_page_id, facebook_page_token: s.facebook_page_token,
        linkedin_enabled: s.linkedin_enabled, linkedin_token: s.linkedin_token, linkedin_author_urn: s.linkedin_author_urn,
      }).then(function () { setSaved(true); }).catch(function (e) { alert("Save failed: " + (e && e.message || "Unknown error")); });
    };

    const sendTest = () => {
      setTesting(true); setResults(null);
      adm.testSocial()
        .then(function (d) { setResults(d && d.results ? d.results : { info: (d && d.message) || "Done" }); })
        .catch(function (e) { setResults({ error: (e && e.message) || "Test failed. Save & enable a platform first." }); })
        .finally(function () { setTesting(false); });
    };

    const fieldRow = (label, child, hint) => (
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        <label style={{ fontSize: 12, fontWeight: 600, color: "var(--text-muted)" }}>{label}</label>
        {child}
        {hint && <div style={{ fontSize: 11, color: "var(--text-muted)", lineHeight: 1.5 }}>{hint}</div>}
      </div>
    );
    const inp = (k, type, placeholder) => (
      <input type={type || "text"} value={s[k]} placeholder={placeholder || ""} onChange={e => set(k, e.target.value)}
        style={{ width: "100%", padding: "8px 12px", borderRadius: 7, border: "1px solid var(--border)", background: "var(--surface-input)", color: "var(--text)", fontSize: 13 }} />
    );
    const platformCard = (key, name, icon, body, note) => (
      <Card padding={24}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, marginBottom: s[key + "_enabled"] ? 18 : 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 34, height: 34, borderRadius: 8, background: "var(--surface-card)", border: "1px solid var(--border)", color: "var(--text-muted)" }}>{I(icon, 18)}</span>
            <div style={{ fontWeight: 600, fontSize: 14, color: "var(--text)" }}>{name}</div>
          </div>
          <Switch checked={s[key + "_enabled"]} onChange={v => set(key + "_enabled", v)} />
        </div>
        {s[key + "_enabled"] && <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>{body}{note && <div style={{ fontSize: 11, color: "var(--text-muted)", lineHeight: 1.5 }}>{note}</div>}</div>}
      </Card>
    );

    return (
      <div className="krm-page-pad" style={{ padding: 28, maxWidth: 1100 }}>
        <ScreenHead title="Social posting" sub="Auto-share every newly-published job to your social channels. Members can opt a job out on the job form." action={<Button variant="primary" iconLeft={I("check", 16)} onClick={save}>Save changes</Button>} />
        {saved && (
          <div style={{ display: "flex", alignItems: "center", gap: 8, background: "var(--success-bg)", color: "var(--success)", border: "1px solid var(--success-border)", borderRadius: 8, padding: "10px 16px", marginBottom: 18, fontSize: 13 }}>
            {I("circle-check-big", 16)} Settings saved.
          </div>
        )}
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <Card padding={24}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16 }}>
              <div>
                <div style={{ fontWeight: 600, fontSize: 14, color: "var(--text)" }}>Enable social posting</div>
                <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 4 }}>Master switch. When on, a published job is posted once to each enabled platform below.</div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <span style={{ fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 999, background: connected ? "var(--success-bg)" : "var(--surface-card)", color: connected ? "var(--success)" : "var(--text-muted)", border: "1px solid " + (connected ? "var(--success-border)" : "var(--border)") }}>{connected ? "Live" : "Off"}</span>
                <Switch checked={s.enabled} onChange={v => set("enabled", v)} />
              </div>
            </div>
          </Card>

          {platformCard("telegram", "Telegram channel", "send",
            fieldRow("Channel", inp("telegram_channel", "text", "@yourchannel or -1001234567890"), "Uses the shared bot configured on the Telegram tab. Add that bot to your channel as an admin first."))}

          {platformCard("facebook", "Facebook Page", "facebook",
            <React.Fragment>
              {fieldRow("Page ID", inp("facebook_page_id", "text", "1234567890"))}
              {fieldRow("Page access token", inp("facebook_page_token", "password", "EAAB..."))}
            </React.Fragment>,
            "Needs a Meta app with the pages_manage_posts permission and a long-lived Page access token.")}

          {platformCard("linkedin", "LinkedIn", "linkedin",
            <React.Fragment>
              {fieldRow("Access token", inp("linkedin_token", "password", "AQV..."))}
              {fieldRow("Author URN", inp("linkedin_author_urn", "text", "urn:li:organization:12345"), "Your Company Page (urn:li:organization:ID) or member (urn:li:person:ID) URN.")}
            </React.Fragment>,
            "Requires an approved LinkedIn app with posting access (w_organization_social / w_member_social).")}

          <Card padding={24}>
            <div style={{ fontWeight: 600, fontSize: 14, color: "var(--text)", marginBottom: 6 }}>Send a test post</div>
            <div style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 16 }}>Save first, then post a sample to every enabled platform to confirm your credentials.</div>
            <Button variant="secondary" disabled={testing} iconLeft={I("send", 15)} onClick={sendTest}>{testing ? "Sending…" : "Send test post"}</Button>
            {results && (
              <div style={{ marginTop: 14, display: "flex", flexDirection: "column", gap: 8 }}>
                {Object.keys(results).map(function (k) {
                  const v = results[k]; const ok = v === "OK";
                  return <div key={k} style={{ display: "flex", gap: 8, fontSize: 13, color: ok ? "var(--success)" : "var(--danger)" }}>
                    {I(ok ? "circle-check-big" : "circle-x", 15)} <span style={{ textTransform: "capitalize", fontWeight: 600 }}>{k}:</span> <span style={{ color: "var(--text-muted)" }}>{v}</span>
                  </div>;
                })}
              </div>
            )}
          </Card>
        </div>
      </div>
    );
  }

  function SmsSettings() {
    const adm = window.KRAMA_ADMIN_API;
    const [s, setS] = React.useState(SMS_DEFAULTS);
    const [saved, setSaved] = React.useState(false);
    const [testing, setTesting] = React.useState(false);
    const [testResult, setTestResult] = React.useState(null);
    const [testPhone, setTestPhone] = React.useState("");

    React.useEffect(function () {
      adm.fetchSettings("sms").then(function (d) {
        if (d && Object.keys(d).length) {
          setS(Object.assign({}, SMS_DEFAULTS, {
            enabled:         !!d.enabled,
            driver:          d.driver || "twilio",
            twilio_sid:      d.twilio_sid || "",
            twilio_token:    d.twilio_token || "",
            twilio_from:     d.twilio_from || "",
            http_url:        d.http_url || "",
            http_method:     d.http_method || "GET",
            http_to_param:   d.http_to_param || "to",
            http_text_param: d.http_text_param || "text",
            http_extra:      d.http_extra || "",
            http_header:     d.http_header || "",
          }));
        }
      }).catch(function () {});
    }, []);

    const connected = s.enabled && (s.driver === "twilio" ? (s.twilio_sid && s.twilio_token && s.twilio_from) : !!s.http_url);
    const set = (k, v) => { setS(p => ({ ...p, [k]: v })); setSaved(false); setTestResult(null); };

    const save = () => {
      adm.updateSettings("sms", {
        enabled: s.enabled, driver: s.driver,
        twilio_sid: s.twilio_sid, twilio_token: s.twilio_token, twilio_from: s.twilio_from,
        http_url: s.http_url, http_method: s.http_method, http_to_param: s.http_to_param,
        http_text_param: s.http_text_param, http_extra: s.http_extra, http_header: s.http_header,
      }).then(function () { setSaved(true); }).catch(function (e) { alert("Save failed: " + (e && e.message || "Unknown error")); });
    };

    const sendTest = () => {
      if (!testPhone) return;
      setTesting(true); setTestResult(null);
      adm.testSms(testPhone)
        .then(function () { setTestResult("success"); })
        .catch(function (e) { setTestResult("error:" + (e && e.message || "Unknown")); })
        .finally(function () { setTesting(false); });
    };

    const fieldRow = (label, child, hint) => (
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        <label style={{ fontSize: 12, fontWeight: 600, color: "var(--text-muted)" }}>{label}</label>
        {child}
        {hint && <div style={{ fontSize: 11, color: "var(--text-muted)", lineHeight: 1.5 }}>{hint}</div>}
      </div>
    );
    const inp = (k, type, placeholder) => (
      <input type={type || "text"} value={s[k]} placeholder={placeholder || ""} onChange={e => set(k, e.target.value)}
        style={{ width: "100%", padding: "8px 12px", borderRadius: 7, border: "1px solid var(--border)", background: "var(--surface-input)", color: "var(--text)", fontSize: 13 }} />
    );
    const sel = (k, opts) => (
      <select value={s[k]} onChange={e => set(k, e.target.value)}
        style={{ width: "100%", padding: "8px 12px", borderRadius: 7, border: "1px solid var(--border)", background: "var(--surface-input)", color: "var(--text)", fontSize: 13 }}>
        {opts.map(function (o) { return <option key={o[0]} value={o[0]}>{o[1]}</option>; })}
      </select>
    );

    return (
      <div className="krm-page-pad" style={{ padding: 28, maxWidth: 1100 }}>
        <ScreenHead title="SMS gateway" sub="Send verification codes (OTP) so users can register and log in with a phone number." action={<Button variant="primary" iconLeft={I("check", 16)} onClick={save}>Save changes</Button>} />
        {saved && (
          <div style={{ display: "flex", alignItems: "center", gap: 8, background: "var(--success-bg)", color: "var(--success)", border: "1px solid var(--success-border)", borderRadius: 8, padding: "10px 16px", marginBottom: 18, fontSize: 13 }}>
            {I("circle-check-big", 16)} Settings saved.
          </div>
        )}
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <Card padding={24}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16 }}>
              <div>
                <div style={{ fontWeight: 600, fontSize: 14, color: "var(--text)" }}>Enable SMS sending</div>
                <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 4 }}>When off, phone OTP codes are written to the server log instead of being sent (development mode).</div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <span style={{ fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 999, background: connected ? "var(--success-bg)" : "var(--surface-card)", color: connected ? "var(--success)" : "var(--text-muted)", border: "1px solid " + (connected ? "var(--success-border)" : "var(--border)") }}>{connected ? "Live" : "Off"}</span>
                <Switch checked={s.enabled} onChange={v => set("enabled", v)} />
              </div>
            </div>
          </Card>

          <Card padding={24}>
            <div style={{ fontWeight: 600, fontSize: 14, color: "var(--text)", marginBottom: 18 }}>Provider</div>
            <div style={{ marginBottom: 16, maxWidth: 300 }}>
              {fieldRow("Gateway", sel("driver", [["twilio", "Twilio"], ["http", "Generic HTTP gateway"]]))}
            </div>
            {s.driver === "twilio" && (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                {fieldRow("Account SID", inp("twilio_sid", "text", "ACxxxxxxxx"))}
                {fieldRow("Auth token", inp("twilio_token", "password", "••••••••"))}
                {fieldRow("Sender number", inp("twilio_from", "text", "+1..."), "Your Twilio phone number or messaging sender ID.")}
              </div>
            )}
            {s.driver === "http" && (
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                {fieldRow("Gateway URL", inp("http_url", "text", "https://sms.example.com/send"))}
                <div style={{ display: "grid", gridTemplateColumns: "150px 1fr 1fr", gap: 14 }}>
                  {fieldRow("Method", sel("http_method", [["GET", "GET"], ["POST", "POST"]]))}
                  {fieldRow("Phone param", inp("http_to_param", "text", "to"))}
                  {fieldRow("Message param", inp("http_text_param", "text", "text"))}
                </div>
                {fieldRow("Extra params", inp("http_extra", "text", "user=me&password=secret&sender=KRAMA"), "Static params your gateway needs (API key, sender, etc.) — key=value&key=value. {to} and message go in the params above.")}
                {fieldRow("Auth header (optional)", inp("http_header", "text", "Authorization: Bearer xxxxx"))}
              </div>
            )}
          </Card>

          <Card padding={24}>
            <div style={{ fontWeight: 600, fontSize: 14, color: "var(--text)", marginBottom: 6 }}>Send test SMS</div>
            <div style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 16 }}>Save and enable your settings first, then text yourself to confirm delivery.</div>
            <div style={{ display: "flex", gap: 10, alignItems: "flex-end" }}>
              <div style={{ flex: 1, maxWidth: 320 }}>
                {fieldRow("Phone number",
                  <input type="tel" value={testPhone} onChange={e => { setTestPhone(e.target.value); setTestResult(null); }} placeholder="012 345 678"
                    style={{ width: "100%", padding: "8px 12px", borderRadius: 7, border: "1px solid var(--border)", background: "var(--surface-input)", color: "var(--text)", fontSize: 13 }} />)}
              </div>
              <Button variant="outline" iconLeft={I(testing ? "loader" : "send", 14)} onClick={sendTest} disabled={!testPhone || testing}>{testing ? "Sending…" : "Send test"}</Button>
            </div>
            {testResult === "success" && <div style={{ marginTop: 12, color: "var(--success)", fontSize: 13, display: "flex", alignItems: "center", gap: 6 }}>{I("circle-check-big", 14)} Test SMS sent!</div>}
            {testResult && testResult.startsWith("error:") && <div style={{ marginTop: 12, color: "var(--danger)", fontSize: 13, display: "flex", alignItems: "center", gap: 6 }}>{I("circle-x", 14)} Failed: {testResult.replace("error:", "")}</div>}
          </Card>

          <Card padding={24}>
            <div style={{ fontWeight: 600, fontSize: 14, color: "var(--text)", marginBottom: 8 }}>What it's used for</div>
            <div style={{ fontSize: 12, color: "var(--text-muted)", lineHeight: 1.6 }}>Sends the 6-digit verification code when someone signs up or logs in with a phone number. Until this is enabled, codes are written to the server log so you can still test the flow.</div>
          </Card>
        </div>
      </div>
    );
  }

  // ── Telegram Settings ───────────────────────────────────────────────────────
  const TELEGRAM_DEFAULTS = { enabled: false, bot_token: "", chat_id: "" };

  function TelegramSettings() {
    const adm = window.KRAMA_ADMIN_API;
    const [s, setS] = React.useState(TELEGRAM_DEFAULTS);
    const [saved, setSaved] = React.useState(false);
    const [testing, setTesting] = React.useState(false);
    const [testResult, setTestResult] = React.useState(null);
    const [botUsername, setBotUsername] = React.useState("");
    const [activating, setActivating] = React.useState(false);
    const [activateMsg, setActivateMsg] = React.useState(null);

    React.useEffect(function () {
      adm.fetchSettings("telegram").then(function (d) {
        if (d && Object.keys(d).length) {
          setS({
            enabled:   !!d.enabled,
            bot_token: d.bot_token || "",
            chat_id:   d.chat_id != null ? String(d.chat_id) : "",
          });
          setBotUsername(d.bot_username || "");
        }
      }).catch(function () {});
    }, []);

    const activate = () => {
      setActivating(true); setActivateMsg(null);
      adm.activateTelegram()
        .then(function (r) { setBotUsername((r && r.bot_username) || botUsername); setActivateMsg({ ok: true, text: (r && r.message) || "Bot activated." }); })
        .catch(function (e) { setActivateMsg({ ok: false, text: (e && e.message) || "Activation failed." }); })
        .finally(function () { setActivating(false); });
    };

    const connected = s.enabled && s.bot_token && s.chat_id;
    const set = (k, v) => { setS(p => ({ ...p, [k]: v })); setSaved(false); setTestResult(null); };

    const save = () => {
      adm.updateSettings("telegram", {
        enabled:   s.enabled,
        bot_token: s.bot_token,
        chat_id:   s.chat_id,
      }).then(function () { setSaved(true); }).catch(function (e) { alert("Save failed: " + (e && e.message || "Unknown error")); });
    };

    const sendTest = () => {
      setTesting(true); setTestResult(null);
      adm.testTelegram()
        .then(function () { setTestResult("success"); })
        .catch(function (e) { setTestResult("error:" + (e && e.message || "Unknown")); })
        .finally(function () { setTesting(false); });
    };

    const fieldRow = (label, child, hint) => (
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        <label style={{ fontSize: 12, fontWeight: 600, color: "var(--text-muted)" }}>{label}</label>
        {child}
        {hint && <div style={{ fontSize: 11, color: "var(--text-muted)", lineHeight: 1.5 }}>{hint}</div>}
      </div>
    );

    const inp = (k, type, placeholder) => (
      <input
        type={type || "text"}
        value={s[k]}
        placeholder={placeholder || ""}
        onChange={e => set(k, e.target.value)}
        style={{ width: "100%", padding: "8px 12px", borderRadius: 7, border: "1px solid var(--border)", background: "var(--surface-input)", color: "var(--text)", fontSize: 13 }}
      />
    );

    return (
      <div className="krm-page-pad" style={{ padding: 28, maxWidth: 1100 }}>
        <ScreenHead
          title="Telegram notifications"
          sub="Get a Telegram message in your admin chat whenever an employer starts a new subscription."
          action={<Button variant="primary" iconLeft={I("check", 16)} onClick={save}>Save changes</Button>}
        />
        {saved && (
          <div style={{ display: "flex", alignItems: "center", gap: 8, background: "var(--success-bg)", color: "var(--success)", border: "1px solid var(--success-border)", borderRadius: 8, padding: "10px 16px", marginBottom: 18, fontSize: 13 }}>
            {I("circle-check-big", 16)} Settings saved.
          </div>
        )}
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>

          <Card padding={24}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16 }}>
              <div>
                <div style={{ fontWeight: 600, fontSize: 14, color: "var(--text)" }}>Enable Telegram notifications</div>
                <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 4 }}>
                  When disabled, no Telegram messages are sent regardless of the token below.
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <span style={{ fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 999, background: connected ? "var(--success-bg)" : "var(--surface-card)", color: connected ? "var(--success)" : "var(--text-muted)", border: "1px solid " + (connected ? "var(--success-border)" : "var(--border)") }}>
                  {connected ? "Live" : "Off"}
                </span>
                <Switch checked={s.enabled} onChange={v => set("enabled", v)} />
              </div>
            </div>
          </Card>

          <Card padding={24}>
            <div style={{ fontWeight: 600, fontSize: 14, color: "var(--text)", marginBottom: 18 }}>Bot connection</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {fieldRow("Bot token", inp("bot_token", "password", "123456:ABC-DEF…"), "From @BotFather when you created the bot. Stored securely on the server, never exposed to the public site.")}
              {fieldRow("Chat ID", inp("chat_id", "text", "e.g. 123456789 or -1001234567890"),
                "Your personal chat, or a group/channel the bot is in. Tip: send any message to your bot, then open https://api.telegram.org/bot<token>/getUpdates and copy \"chat\":{\"id\": … }.")}
            </div>
          </Card>

          <Card padding={24}>
            <div style={{ fontWeight: 600, fontSize: 14, color: "var(--text)", marginBottom: 6 }}>Send test message</div>
            <div style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 16 }}>
              Save your token and chat ID first, then send a test to confirm the bot can post.
            </div>
            <Button variant="outline" iconLeft={I(testing ? "loader" : "send", 14)} onClick={sendTest} disabled={testing}>
              {testing ? "Sending…" : "Send test message"}
            </Button>
            {testResult === "success" && (
              <div style={{ marginTop: 12, color: "var(--success)", fontSize: 13, display: "flex", alignItems: "center", gap: 6 }}>
                {I("circle-check-big", 14)} Sent! Check your Telegram chat.
              </div>
            )}
            {testResult && testResult.startsWith("error:") && (
              <div style={{ marginTop: 12, color: "var(--danger)", fontSize: 13, display: "flex", alignItems: "center", gap: 6 }}>
                {I("circle-x", 14)} Failed: {testResult.replace("error:", "")}
              </div>
            )}
          </Card>

          <Card padding={24}>
            <div style={{ fontWeight: 600, fontSize: 14, color: "var(--text)", marginBottom: 6 }}>Activate bot &amp; employer alerts</div>
            <div style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 16 }}>
              Registers the webhook so employers can connect their own Telegram (dashboard → My Profile → Connect Telegram) and get alerted when a candidate applies to their jobs. Requires a public HTTPS site — this works on your live domain, not localhost.
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
              <Button variant="outline" iconLeft={I(activating ? "loader" : "plug", 14)} onClick={activate} disabled={activating}>
                {activating ? "Activating…" : "Activate bot"}
              </Button>
              {botUsername && <span style={{ fontSize: 13, color: "var(--text-muted)" }}>Bot: <b style={{ color: "var(--text)" }}>@{botUsername}</b></span>}
            </div>
            {activateMsg && (
              <div style={{ marginTop: 12, color: activateMsg.ok ? "var(--success)" : "var(--danger)", fontSize: 13, display: "flex", alignItems: "center", gap: 6 }}>
                {I(activateMsg.ok ? "circle-check-big" : "circle-x", 14)} {activateMsg.text}
              </div>
            )}
          </Card>

          <Card padding={24}>
            <div style={{ fontWeight: 600, fontSize: 14, color: "var(--text)", marginBottom: 14 }}>What triggers a message</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {[
                ["🆕 New subscription", "An employer subscribes to a plan for the first time."],
                ["🔄 Subscription renewed", "A returning employer subscribes again to a plan they've had before (there is no auto-renew — employers re-subscribe to continue)."],
              ].map(function (row, i) {
                return (
                  <div key={i} style={{ display: "flex", gap: 12, padding: "10px 14px", background: "var(--surface-card)", borderRadius: 8, border: "1px solid var(--border)" }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, fontSize: 13, color: "var(--text)" }}>{row[0]}</div>
                      <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>{row[1]}</div>
                    </div>
                  </div>
                );
              })}
              <div style={{ fontSize: 12, color: "var(--text-muted)" }}>Both include the company, plan, price and status (pending / active / trial).</div>
            </div>
          </Card>

        </div>
      </div>
    );
  }

  // ── Email Settings ──────────────────────────────────────────────────────────
  const SMTP_DEFAULTS = { enabled: false, host: "", port: 587, encryption: "tls", username: "", password: "", from_address: "", from_name: "" };

  function EmailSettings() {
    const adm = window.KRAMA_ADMIN_API;
    const [s, setS] = React.useState(SMTP_DEFAULTS);
    const [saved, setSaved] = React.useState(false);
    const [testing, setTesting] = React.useState(false);
    const [testResult, setTestResult] = React.useState(null);
    const [testEmail, setTestEmail] = React.useState("");

    React.useEffect(function () {
      adm.fetchSettings("smtp").then(function (d) {
        if (d && Object.keys(d).length) {
          setS({
            enabled:      !!d.enabled,
            host:         d.host || "",
            port:         d.port || 587,
            encryption:   d.encryption || "tls",
            username:     d.username || "",
            password:     d.password || "",
            from_address: d.from_address || "",
            from_name:    d.from_name || "",
          });
        }
      }).catch(function () {});
    }, []);

    const set = (k, v) => { setS(p => ({ ...p, [k]: v })); setSaved(false); setTestResult(null); };

    const save = () => {
      adm.updateSettings("smtp", {
        enabled:      s.enabled,
        host:         s.host,
        port:         parseInt(s.port) || 587,
        encryption:   s.encryption,
        username:     s.username,
        password:     s.password,
        from_address: s.from_address,
        from_name:    s.from_name,
      }).then(function () { setSaved(true); }).catch(function (e) { alert("Save failed: " + (e && e.message || "Unknown error")); });
    };

    const sendTest = () => {
      if (!testEmail) return;
      setTesting(true); setTestResult(null);
      adm.testSmtp(testEmail)
        .then(function () { setTestResult("success"); })
        .catch(function (e) { setTestResult("error:" + (e && e.message || "Unknown")); })
        .finally(function () { setTesting(false); });
    };

    const fieldRow = (label, child) => (
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        <label style={{ fontSize: 12, fontWeight: 600, color: "var(--text-muted)" }}>{label}</label>
        {child}
      </div>
    );

    const inp = (k, type, placeholder) => (
      <input
        type={type || "text"}
        value={s[k]}
        placeholder={placeholder || ""}
        onChange={e => set(k, e.target.value)}
        style={{ width: "100%", padding: "8px 12px", borderRadius: 7, border: "1px solid var(--border)", background: "var(--surface-input)", color: "var(--text)", fontSize: 13 }}
      />
    );

    return (
      <div className="krm-page-pad" style={{ padding: 28, maxWidth: 1100 }}>
        <ScreenHead
          title="Email / SMTP"
          sub="Configure outgoing email. Used for job alerts, application updates, and job approval notifications."
          action={<Button variant="primary" iconLeft={I("check", 16)} onClick={save}>Save changes</Button>}
        />
        {saved && (
          <div style={{ display: "flex", alignItems: "center", gap: 8, background: "var(--success-bg)", color: "var(--success)", border: "1px solid var(--success-border)", borderRadius: 8, padding: "10px 16px", marginBottom: 18, fontSize: 13 }}>
            {I("circle-check-big", 16)} Settings saved. New emails will use this configuration.
          </div>
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>

          {/* Enable / Disable */}
          <Card padding={24}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16 }}>
              <div>
                <div style={{ fontWeight: 600, fontSize: 14, color: "var(--text)" }}>Enable email sending</div>
                <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 4 }}>
                  When disabled, no emails are sent regardless of SMTP configuration.
                </div>
              </div>
              <Switch checked={s.enabled} onChange={v => set("enabled", v)} />
            </div>
          </Card>

          {/* SMTP server */}
          <Card padding={24}>
            <div style={{ fontWeight: 600, fontSize: 14, color: "var(--text)", marginBottom: 18 }}>SMTP Server</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 160px 160px", gap: 14, marginBottom: 14 }}>
              {fieldRow("Host", inp("host", "text", "smtp.gmail.com"))}
              {fieldRow("Port", inp("port", "number", "587"))}
              {fieldRow("Encryption",
                <select value={s.encryption} onChange={e => set("encryption", e.target.value)} style={{ width: "100%", padding: "8px 12px", borderRadius: 7, border: "1px solid var(--border)", background: "var(--surface-input)", color: "var(--text)", fontSize: 13 }}>
                  <option value="tls">TLS</option>
                  <option value="ssl">SSL</option>
                  <option value="">None</option>
                </select>
              )}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              {fieldRow("Username", inp("username", "text", "you@example.com"))}
              {fieldRow("Password", inp("password", "password", "••••••••"))}
            </div>
          </Card>

          {/* From address */}
          <Card padding={24}>
            <div style={{ fontWeight: 600, fontSize: 14, color: "var(--text)", marginBottom: 18 }}>Sender Identity</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              {fieldRow("From address", inp("from_address", "email", "noreply@yourdomain.com"))}
              {fieldRow("From name", inp("from_name", "text", "Krama Jobs"))}
            </div>
          </Card>

          {/* Test email */}
          <Card padding={24}>
            <div style={{ fontWeight: 600, fontSize: 14, color: "var(--text)", marginBottom: 6 }}>Send test email</div>
            <div style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 16 }}>
              Save your settings first, then send a test to verify the connection works.
            </div>
            <div style={{ display: "flex", gap: 10, alignItems: "flex-end" }}>
              <div style={{ flex: 1 }}>
                {fieldRow("Recipient email",
                  <input
                    type="email"
                    value={testEmail}
                    onChange={e => { setTestEmail(e.target.value); setTestResult(null); }}
                    placeholder="your@email.com"
                    style={{ width: "100%", padding: "8px 12px", borderRadius: 7, border: "1px solid var(--border)", background: "var(--surface-input)", color: "var(--text)", fontSize: 13 }}
                  />
                )}
              </div>
              <Button variant="outline" iconLeft={I(testing ? "loader" : "send", 14)} onClick={sendTest} disabled={!testEmail || testing}>
                {testing ? "Sending…" : "Send test"}
              </Button>
            </div>
            {testResult === "success" && (
              <div style={{ marginTop: 12, color: "var(--success)", fontSize: 13, display: "flex", alignItems: "center", gap: 6 }}>
                {I("circle-check-big", 14)} Test email sent! Check your inbox.
              </div>
            )}
            {testResult && testResult.startsWith("error:") && (
              <div style={{ marginTop: 12, color: "var(--danger)", fontSize: 13, display: "flex", alignItems: "center", gap: 6 }}>
                {I("circle-x", 14)} Failed: {testResult.replace("error:", "")}
              </div>
            )}
          </Card>

          {/* What gets sent */}
          <Card padding={24}>
            <div style={{ fontWeight: 600, fontSize: 14, color: "var(--text)", marginBottom: 14 }}>What triggers emails</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {[
                ["Candidate applies to a job", "Employer receives 'New application received'"],
                ["Employer moves applicant to new stage", "Candidate receives 'Application status updated'"],
                ["Admin approves a job posting", "Employer receives 'Your job is now live'"],
                ["Admin rejects a job posting", "Employer receives 'Action required' with rejection reason"],
              ].map(([trigger, action], i) => (
                <div key={i} style={{ display: "flex", gap: 12, padding: "10px 14px", background: "var(--surface-card)", borderRadius: 8, border: "1px solid var(--border)" }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 500, color: "var(--text)" }}>{trigger}</div>
                    <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>→ {action}</div>
                  </div>
                  <div style={{ flexShrink: 0 }}>{I("mail", 14, { color: "var(--text-muted)" })}</div>
                </div>
              ))}
            </div>
          </Card>

        </div>
      </div>
    );
  }

  window.KramaAdminApp = App;
  window.KRAMA_ADMIN_READY = true;
})();
