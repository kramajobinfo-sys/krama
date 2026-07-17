// Krama candidate dashboard — wired to real API
(function init() {
  if (!window.KramaDesignSystem_1a6f65) { return setTimeout(init, 40); }
  const NS = window.KramaDesignSystem_1a6f65;
  const { Button, Badge, Avatar, Card, StatCard, Tabs, ProgressTracker, JobCard, EmptyState, Input, Textarea, Select, Tag, Switch, Modal } = NS;

  const LucideIcon = React.memo(function ({ name, size }) {
    var ref = React.useRef(null);
    React.useEffect(function () {
      if (ref.current && window.lucide) {
        ref.current.innerHTML = '<i data-lucide="' + name + '" style="width:' + size + 'px;height:' + size + 'px"></i>';
        window.lucide.createIcons({ el: ref.current });
      }
    }, [name, size]);
    return <span ref={ref} style={{ display: "inline-flex", alignItems: "center" }} />;
  });
  const I = (n, s) => <LucideIcon name={n} size={s || 18} />;

  // Resize + convert any image to JPEG ≤ maxPx on longest side, quality 0–1
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

  function flatJob(j) {
    var co = j.company || {}; var cat = j.category || {}; var loc = j.location || {};
    return Object.assign({}, j, {
      company: co.name || (typeof j.company === "string" ? j.company : ""),
      logo: co.logo_url || j.logo || "",
      category: cat.name || (typeof j.category === "string" ? j.category : ""),
      location: loc.name || (typeof j.location === "string" ? j.location : ""),
    });
  }

  const STAGE_ORDER = ["applied", "reviewed", "shortlisted", "interview", "offered", "rejected"];
  const STAGE_LABEL = { applied: "Applied", reviewed: "Reviewed", shortlisted: "Shortlisted", interview: "Interview", offered: "Offered", rejected: "Rejected" };
  const PIPELINE_STEPS = ["Applied", "Reviewed", "Shortlisted", "Interview", "Offered"];

  function stageIndex(stage) {
    var idx = ["applied", "reviewed", "shortlisted", "interview", "offered"].indexOf(stage);
    return idx < 0 ? 0 : idx;
  }

  function fmtDate(iso) {
    if (!iso) return "";
    var d = new Date(iso);
    return d.getDate() + " " + ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"][d.getMonth()] + " " + d.getFullYear();
  }

  // ── Login ──────────────────────────────────────────────────────────────────
  function CandidateLogin({ onLogin }) {
    var [email, setEmail] = React.useState("");
    var [password, setPassword] = React.useState("");
    var [error, setError] = React.useState("");
    var [busy, setBusy] = React.useState(false);

    function submit(e) {
      e.preventDefault();
      setBusy(true); setError("");
      cand.login(email, password).then(function (d) {
        if (d.access_token && d.user && d.user.role && d.user.role.slug === "candidate") {
          onLogin(d.user);
        } else if (d.access_token) {
          localStorage.removeItem("krama_access_token");
          setError("This account is not a candidate.");
        } else {
          setError(d.message || "Login failed.");
        }
        setBusy(false);
      }).catch(function (err) { setError(err.message || "Login failed."); setBusy(false); });
    }

    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--surface-page)", padding: 16 }}>
        <Card padding={40} style={{ width: "100%", maxWidth: 380 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 28 }}>
            <img src={window.getKramaLogo("../../assets/krama-mark.svg")} height="42" alt="KRAMA" />
            <span style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "var(--text-xl)", letterSpacing: ".08em", color: "var(--text-strong)" }}>{window.KRAMA_BRAND_NAME || "KRAMA"}</span>
          </div>
          <h2 style={{ fontSize: "var(--text-xl)", fontWeight: 700, color: "var(--text-strong)", marginBottom: 6 }}>Candidate sign in</h2>
          <p style={{ fontSize: "var(--text-sm)", color: "var(--text-muted)", marginBottom: 24 }}>Access your applications and saved jobs.</p>
          {error && <div style={{ marginBottom: 16, padding: "10px 14px", background: "var(--danger-subtle)", color: "var(--danger)", borderRadius: "var(--radius-md)", fontSize: "var(--text-sm)" }}>{error}</div>}
          <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <Input label="Email" type="email" value={email} onChange={function(e){ setEmail(e.target.value); }} required />
            <Input label="Password" type="password" value={password} onChange={function(e){ setPassword(e.target.value); }} required />
            <Button variant="primary" block disabled={busy}>{busy ? "Signing in…" : "Sign in"}</Button>
          </form>
        </Card>
      </div>
    );
  }

  // ── Sidebar ────────────────────────────────────────────────────────────────
  function Sidebar({ page, onNav, user, badges, open, onClose, onLogout }) {
    const NAV = [
      { id: "dashboard",    label: "Dashboard",       icon: "layout-dashboard" },
      { id: "applications", label: "My applications", icon: "send",      badge: badges.applications },
      { id: "saved",        label: "Saved jobs",       icon: "bookmark",  badge: badges.saved },
      { id: "recommended",  label: "Recommended",      icon: "sparkles" },
      { id: "following",    label: "Following",         icon: "heart" },
      { id: "alerts",       label: "Job alerts",       icon: "bell" },
      { id: "messages",     label: "Messages",          icon: "message-square", badge: badges.messages },
      { id: "resume",       label: "Résumé builder",  icon: "file-text" },
      { id: "profile",      label: "Profile",          icon: "user-round" },
    ];
    return (
      <aside className={"krm-sidebar" + (open ? " open" : "")} style={{ width: 248, flexShrink: 0, background: "var(--surface-card)", borderRight: "1px solid var(--border)", display: "flex", flexDirection: "column", padding: "20px 14px", position: "sticky", top: 0, height: "100vh" }}>
        <a href="/krama/krama/ui_kits/public-website/index.html" style={{ display: "flex", alignItems: "center", gap: 10, margin: "4px 8px 22px", textDecoration: "none" }}>
          <img src={window.getKramaLogo("../../assets/krama-mark.svg")} height="36" alt="KRAMA" />
          <span style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "var(--text-lg)", letterSpacing: ".08em", color: "var(--text-strong)" }}>{window.KRAMA_BRAND_NAME || "KRAMA"}</span>
        </a>
        <nav style={{ display: "flex", flexDirection: "column", gap: 3 }}>
          {NAV.map(function (n) {
            var active = page === n.id;
            return (
              <button key={n.id} onClick={function(){ onNav(n.id); onClose && onClose(); }} style={{
                display: "flex", alignItems: "center", gap: 11, border: "none", cursor: "pointer",
                padding: "10px 12px", borderRadius: "var(--radius-md)", textAlign: "left",
                background: active ? "var(--brand-subtle)" : "transparent",
                color: active ? "var(--text-brand)" : "var(--text-body)",
                fontFamily: "var(--font-sans)", fontWeight: active ? 700 : 500, fontSize: "var(--text-base)",
              }}>
                <span style={{ display: "inline-flex", color: active ? "var(--brand)" : "var(--text-muted)" }}>{I(n.icon, 19)}</span>
                <span style={{ flex: 1 }}>{n.label}</span>
                {n.badge > 0 && <Badge tone={active ? "brand" : "neutral"}>{n.badge}</Badge>}
              </button>
            );
          })}
        </nav>
        <div style={{ marginTop: "auto", paddingTop: 16, borderTop: "1px solid var(--border)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px" }}>
            <Avatar name={user ? user.name : "?"} src={user && user.avatar_url || undefined} size={36} />
            <div style={{ minWidth: 0 }}>
              <div style={{ fontWeight: 600, fontSize: "var(--text-sm)", color: "var(--text-strong)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{user ? user.name : ""}</div>
              <div style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{user ? user.email : ""}</div>
            </div>
          </div>
          <button onClick={onLogout} style={{ display: "flex", alignItems: "center", gap: 10, width: "100%", border: "none", background: "transparent", cursor: "pointer", padding: "10px 12px", borderRadius: "var(--radius-md)", fontFamily: "var(--font-sans)", fontSize: "var(--text-base)", fontWeight: 500, color: "var(--danger)", textAlign: "left" }}>
            {I("log-out", 18)} Sign out
          </button>
        </div>
      </aside>
    );
  }

  // ── Topbar ─────────────────────────────────────────────────────────────────
  function NotificationBell({ onNav }) {
    var [open, setOpen] = React.useState(false);
    var [list, setList] = React.useState([]);
    var [unread, setUnread] = React.useState(0);
    var [loading, setLoading] = React.useState(false);
    var ROUTE = { application_received: "applications", application_stage: "applications", job_approved: "applications", job_rejected: "applications" };
    var ICON = { application_received: "user-plus", application_stage: "activity", job_approved: "circle-check-big", job_rejected: "circle-x" };
    var pollUnread = React.useCallback(function () { cand.fetchNotifUnread().then(function (d) { setUnread(d.count || 0); }).catch(function () {}); }, []);
    React.useEffect(function () { pollUnread(); var t = setInterval(pollUnread, 20000); return function () { clearInterval(t); }; }, [pollUnread]);
    function openPanel() {
      var next = !open; setOpen(next);
      if (next) { setLoading(true); cand.fetchNotifications().then(function (d) { setList(d.data || []); setUnread(d.unread || 0); setLoading(false); }).catch(function () { setLoading(false); }); }
    }
    function markAll() { cand.markAllNotifRead().then(function () { setList(function (l) { return l.map(function (n) { return Object.assign({}, n, { read_at: n.read_at || "x" }); }); }); setUnread(0); }).catch(function () {}); }
    function clickNotif(n) {
      if (!n.read_at) { cand.markNotifRead(n.id).then(function () { setUnread(function (u) { return Math.max(0, u - 1); }); }).catch(function () {}); }
      setOpen(false);
      var route = ROUTE[n.type]; if (route && onNav) onNav(route);
    }
    function fmtTime(iso) { if (!iso) return ""; var d = new Date(iso), diff = Date.now() - d.getTime(); if (diff < 60000) return "just now"; if (diff < 3600000) return Math.floor(diff / 60000) + "m ago"; if (diff < 86400000) return Math.floor(diff / 3600000) + "h ago"; return d.getDate() + " " + ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"][d.getMonth()]; }
    return (
      <div style={{ position: "relative" }}>
        <button onClick={openPanel} title="Notifications" style={{ position: "relative", width: 36, height: 36, border: "1px solid var(--border)", borderRadius: "var(--radius-md)", background: "transparent", cursor: "pointer", color: "var(--text-muted)", display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
          {I("bell", 16)}
          {unread > 0 && <span style={{ position: "absolute", top: -6, right: -6, minWidth: 18, height: 18, padding: "0 5px", borderRadius: 9, background: "var(--danger)", color: "#fff", fontSize: 11, fontWeight: 700, display: "inline-flex", alignItems: "center", justifyContent: "center", border: "2px solid var(--surface-card)" }}>{unread > 9 ? "9+" : unread}</span>}
        </button>
        {open && <>
          <div onClick={function () { setOpen(false); }} style={{ position: "fixed", inset: 0, zIndex: 99 }} />
          <div onClick={function (e) { e.stopPropagation(); }} style={{ position: "absolute", top: 44, right: 0, width: 340, maxHeight: 440, overflowY: "auto", background: "var(--surface-card)", border: "1px solid var(--border)", borderRadius: "var(--radius-md)", boxShadow: "var(--shadow-lg)", zIndex: 100 }}>
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
        </>}
      </div>
    );
  }

  function Topbar({ title, user, onLogout, onMenu, onNav }) {
    return (
      <header className="krm-topbar" style={{ height: 64, flexShrink: 0, borderBottom: "1px solid var(--border)", background: "var(--surface-card)", display: "flex", alignItems: "center", gap: 16, padding: "0 28px", position: "sticky", top: 0, zIndex: 10 }}>
        <button className="krm-hamburger-dash" onClick={onMenu} style={{ display: "none", alignItems: "center", justifyContent: "center", width: 36, height: 36, border: "1px solid var(--border)", borderRadius: "var(--radius-md)", background: "transparent", cursor: "pointer", color: "var(--text-muted)", flexShrink: 0 }}>{I("menu", 20)}</button>
        <h1 style={{ fontSize: "var(--text-xl)", fontWeight: 700, color: "var(--text-strong)" }}>{title}</h1>
        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 12 }}>
          <NotificationBell onNav={onNav} />
          <Avatar name={user ? user.name : "?"} src={user && user.avatar_url || undefined} size={36} />
          <button onClick={onLogout} title="Sign out" style={{ width: 36, height: 36, border: "1px solid var(--border)", borderRadius: "var(--radius-md)", background: "transparent", cursor: "pointer", color: "var(--text-muted)", display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
            {I("log-out", 16)}
          </button>
        </div>
      </header>
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

  // ── Overview ───────────────────────────────────────────────────────────────
  function Overview({ user, onNav }) {
    var [stats, setStats] = React.useState({ applied: 0, saved: 0, interviews: 0 });
    var [recentApps, setRecentApps] = React.useState([]);
    var [recs, setRecs] = React.useState([]);
    var [savedIds, setSavedIds] = React.useState([]);
    var [loading, setLoading] = React.useState(true);

    React.useEffect(function () {
      Promise.all([
        cand.fetchApplications("all", 1),
        cand.fetchSavedJobs(1),
        cand.fetchJobs({ per_page: 4 }),
      ]).then(function (results) {
        var apps = results[0]; var saved = results[1]; var jobs = results[2];
        var allApps = apps.data || [];
        var interviewCount = allApps.filter(function(a){ return a.stage === "interview" || a.stage === "offered"; }).length;
        setStats({ applied: apps.total || 0, saved: saved.total || 0, interviews: interviewCount });
        setRecentApps(allApps.slice(0, 3));
        setRecs(jobs.data || []);
        setSavedIds((saved.data || []).map(function(j){ return j.id; }));
        setLoading(false);
      }).catch(function(){ setLoading(false); });
    }, []);

    function toggleSave(jobId) {
      var isSaved = savedIds.includes(jobId);
      (isSaved ? cand.unsaveJob(jobId) : cand.saveJob(jobId)).then(function() {
        setSavedIds(function(ids){ return isSaved ? ids.filter(function(x){ return x !== jobId; }) : ids.concat(jobId); });
      }).catch(function(){});
    }

    if (loading) return <div style={{ padding: 28, color: "var(--text-muted)" }}>Loading…</div>;

    return (
      <div className="krm-page-pad" style={{ padding: 28, display: "flex", flexDirection: "column", gap: 24 }}>
        <div className="krm-stats-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16 }}>
          <StatCard label="Applied jobs" value={String(stats.applied)} tone="brand" icon={I("send", 22)} />
          <StatCard label="Saved jobs" value={String(stats.saved)} tone="accent" icon={I("bookmark", 22)} />
          <StatCard label="Interviews" value={String(stats.interviews)} tone="success" icon={I("calendar-check", 22)} />
        </div>

        <Card padding={0}>
          <div style={{ padding: "18px 22px", borderBottom: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h2 style={{ fontSize: "var(--text-lg)", fontWeight: 700, color: "var(--text-strong)" }}>Recent applications</h2>
            <Button variant="ghost" size="sm" iconRight={I("arrow-right", 14)} onClick={function(){ onNav("applications"); }}>View all</Button>
          </div>
          {recentApps.length === 0
            ? <div style={{ padding: "28px 22px", color: "var(--text-muted)", fontSize: "var(--text-sm)", textAlign: "center" }}>No applications yet. Start applying!</div>
            : recentApps.map(function (a, i) {
              var job = a.job || {};
              var company = job.company || {};
              return (
                <div key={a.id} style={{ padding: "16px 22px", borderBottom: i < recentApps.length - 1 ? "1px solid var(--border-subtle)" : "none", display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
                  <Avatar name={company.name || "?"} square size={42} src={company.logo_url} />
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontWeight: 700, color: "var(--text-strong)" }}>{job.title}</div>
                    <div style={{ fontSize: "var(--text-sm)", color: "var(--text-muted)" }}>{company.name}</div>
                  </div>
                  <div style={{ flex: 1, maxWidth: 380 }}>
                    <ProgressTracker current={stageIndex(a.stage)} steps={PIPELINE_STEPS} />
                  </div>
                  <span style={{ marginLeft: "auto", fontSize: "var(--text-sm)", color: "var(--text-faint)" }}>{fmtDate(a.created_at)}</span>
                </div>
              );
            })
          }
        </Card>

        {recs.length > 0 && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
              <h2 style={{ fontSize: "var(--text-lg)", fontWeight: 700, color: "var(--text-strong)" }}>Recommended for you</h2>
              <Button variant="ghost" size="sm" iconRight={I("arrow-right", 14)} onClick={function(){ onNav("recommended"); }}>View all</Button>
            </div>
            <div className="krm-card-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              {recs.map(function (j) {
                return <JobCard key={j.id} {...flatJob(j)} saved={savedIds.includes(j.id)} onSave={function(){ toggleSave(j.id); }} onClick={function(){ window.location.href = "/krama/krama/ui_kits/public-website/index.html?job=" + j.id; }} />;
              })}
            </div>
          </div>
        )}
      </div>
    );
  }

  // ── Applications ───────────────────────────────────────────────────────────
  function Applications({ onBadgeChange, onGoToMessages }) {
    var [tab, setTab] = React.useState("all");
    var [apps, setApps] = React.useState([]);
    var [meta, setMeta] = React.useState({ total: 0, last_page: 1, current_page: 1 });
    var [loading, setLoading] = React.useState(true);
    var [counts, setCounts] = React.useState({ all: 0, active: 0, interview: 0, closed: 0 });
    var [msgModal, setMsgModal] = React.useState(null);
    var [msgBody, setMsgBody] = React.useState("");
    var [msgSending, setMsgSending] = React.useState(false);
    var [msgErr, setMsgErr] = React.useState("");

    function openMessage(job, owner) { setMsgModal({ job: job, owner: owner }); setMsgBody(""); setMsgErr(""); }
    function sendNewMessage() {
      if (!msgBody.trim() || msgSending || !msgModal) return;
      setMsgSending(true); setMsgErr("");
      cand.startConversation({ other_user_id: msgModal.owner.id, job_id: msgModal.job.id || null, subject: msgModal.job.title || null, message: msgBody.trim() })
        .then(function () { setMsgSending(false); setMsgModal(null); setMsgBody(""); if (onGoToMessages) onGoToMessages(); })
        .catch(function (e) { setMsgSending(false); setMsgErr((e && e.message) || "Could not send message."); });
    }

    function load(stage, page) {
      setLoading(true);
      cand.fetchApplications(stage === "all" ? "" : stage, page || 1).then(function (r) {
        setApps(r.data || []);
        setMeta({ total: r.total || 0, last_page: r.last_page || 1, current_page: r.current_page || 1 });
        setLoading(false);
      }).catch(function(){ setLoading(false); });
    }

    React.useEffect(function() {
      // Fetch counts for all tabs
      Promise.all([
        cand.fetchApplications("", 1),
        cand.fetchApplications("interview", 1),
      ]).then(function(results) {
        var all = results[0].total || 0;
        var interviews = results[1].total || 0;
        setCounts({ all: all, active: all, interview: interviews, closed: 0 });
        if (onBadgeChange) onBadgeChange(all);
      }).catch(function(){});
      load("all", 1);
    }, []);

    function changeTab(t) {
      setTab(t);
      load(t, 1);
    }

    function withdraw(id) {
      if (!confirm("Withdraw this application?")) return;
      cand.withdrawApplication(id).then(function() {
        load(tab, meta.current_page);
      }).catch(function(err){ alert(err.message || "Failed to withdraw."); });
    }

    var tabList = [
      { value: "all",       label: "All",       count: counts.all },
      { value: "interview", label: "Interview",  count: counts.interview },
    ];

    return (
      <div className="krm-page-pad" style={{ padding: 28 }}>
        <ScreenHead title="My applications" sub={counts.all + " total applications"} />
        <Tabs value={tab} onChange={changeTab} tabs={tabList} style={{ marginBottom: 20 }} />
        {loading
          ? <div style={{ color: "var(--text-muted)", fontSize: "var(--text-sm)" }}>Loading…</div>
          : apps.length === 0
            ? <Card padding={32}><div style={{ textAlign: "center", color: "var(--text-muted)" }}>No applications found.</div></Card>
            : (
              <Card padding={0}>
                {apps.map(function (a, i) {
                  var job = a.job || {};
                  var company = job.company || {};
                  var owner = company.owner || null;
                  var canMessage = owner && owner.allow_candidate_messages;
                  var rejected = a.stage === "rejected";
                  return (
                    <div key={a.id} style={{ padding: "18px 22px", borderBottom: i < apps.length - 1 ? "1px solid var(--border-subtle)" : "none", display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
                      <Avatar name={company.name || "?"} square size={46} src={company.logo_url} />
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontWeight: 700, color: "var(--text-strong)", fontSize: "var(--text-md)" }}>{job.title}</div>
                        <div style={{ fontSize: "var(--text-sm)", color: "var(--text-muted)" }}>{company.name} · Applied {fmtDate(a.created_at)}</div>
                        {rejected && <Badge tone="danger" style={{ marginTop: 4 }}>Rejected</Badge>}
                      </div>
                      {!rejected
                        ? <div style={{ flex: 1, maxWidth: 420 }}><ProgressTracker current={stageIndex(a.stage)} steps={PIPELINE_STEPS} /></div>
                        : <div style={{ flex: 1 }} />
                      }
                      <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 8 }}>
                        {canMessage && (
                          <Button variant="secondary" size="sm" iconLeft={I("message-square", 13)} onClick={function(){ openMessage(job, owner); }}>Message</Button>
                        )}
                        {a.stage === "applied" && (
                          <Button variant="ghost" size="sm" style={{ color: "var(--danger)" }} onClick={function(){ withdraw(a.id); }}>Withdraw</Button>
                        )}
                      </div>
                    </div>
                  );
                })}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 22px", borderTop: "1px solid var(--border-subtle)" }}>
                  <span style={{ fontSize: "var(--text-sm)", color: "var(--text-muted)" }}>
                    {meta.total > 0 ? "Showing " + ((meta.current_page - 1) * 10 + 1) + "–" + ((meta.current_page - 1) * 10 + apps.length) + " of " + meta.total : "No results"}
                  </span>
                  <div style={{ display: "flex", gap: 8 }}>
                    <Button variant="secondary" size="sm" disabled={meta.current_page <= 1} onClick={function(){ load(tab, meta.current_page - 1); }}>Previous</Button>
                    <Button variant="secondary" size="sm" disabled={meta.current_page >= meta.last_page} onClick={function(){ load(tab, meta.current_page + 1); }}>Next</Button>
                  </div>
                </div>
              </Card>
            )
        }
        {msgModal && (
          <div onClick={function(){ setMsgModal(null); }} style={{ position: "fixed", inset: 0, zIndex: 200, background: "var(--surface-overlay, rgba(0,0,0,0.45))", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
            <div onClick={function(e){ e.stopPropagation(); }} style={{ width: "100%", maxWidth: 460, background: "var(--surface-card)", borderRadius: "var(--radius-xl)", boxShadow: "var(--shadow-xl)", overflow: "hidden" }}>
              <div style={{ padding: "18px 22px", borderBottom: "1px solid var(--border)" }}>
                <div style={{ fontWeight: 700, color: "var(--text-strong)", fontSize: "var(--text-md)" }}>Message about “{msgModal.job.title}”</div>
                <div style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)", marginTop: 3 }}>{((msgModal.job.company || {}).name) || "Employer"}</div>
              </div>
              <div style={{ padding: 18 }}>
                <textarea value={msgBody} onChange={function(e){ setMsgBody(e.target.value); }} rows={5} autoFocus placeholder="Write your message to the employer…"
                  onKeyDown={function(e){ if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) { e.preventDefault(); sendNewMessage(); } }}
                  style={{ width: "100%", boxSizing: "border-box", resize: "vertical", border: "1px solid var(--border)", borderRadius: "var(--radius-md)", padding: "10px 12px", fontFamily: "var(--font-sans)", fontSize: "var(--text-sm)", color: "var(--text-body)", background: "var(--surface-page)", outline: "none", lineHeight: 1.5 }} />
                {msgErr && <div style={{ color: "var(--danger)", fontSize: "var(--text-xs)", marginTop: 8 }}>{msgErr}</div>}
              </div>
              <div style={{ padding: "0 18px 18px", display: "flex", justifyContent: "flex-end", gap: 10 }}>
                <Button variant="secondary" onClick={function(){ setMsgModal(null); }}>Cancel</Button>
                <Button variant="primary" disabled={msgSending || !msgBody.trim()} onClick={sendNewMessage}>{msgSending ? "Sending…" : "Send message"}</Button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ── Saved Jobs ─────────────────────────────────────────────────────────────
  function SavedJobs({ onBadgeChange }) {
    var [jobs, setJobs] = React.useState([]);
    var [meta, setMeta] = React.useState({ total: 0, last_page: 1, current_page: 1 });
    var [loading, setLoading] = React.useState(true);

    function load(page) {
      setLoading(true);
      cand.fetchSavedJobs(page || 1).then(function (r) {
        setJobs(r.data || []);
        setMeta({ total: r.total || 0, last_page: r.last_page || 1, current_page: r.current_page || 1 });
        if (onBadgeChange) onBadgeChange(r.total || 0);
        setLoading(false);
      }).catch(function(){ setLoading(false); });
    }

    React.useEffect(function() { load(1); }, []);

    function unsave(jobId) {
      cand.unsaveJob(jobId).then(function() { load(meta.current_page); }).catch(function(){});
    }

    return (
      <div className="krm-page-pad" style={{ padding: 28 }}>
        <ScreenHead title="Saved jobs" sub={meta.total + " jobs saved"} />
        {loading
          ? <div style={{ color: "var(--text-muted)" }}>Loading…</div>
          : jobs.length === 0
            ? <Card padding={32}><div style={{ textAlign: "center", color: "var(--text-muted)" }}>No saved jobs yet. Browse jobs and click the bookmark icon.</div></Card>
            : (
              <React.Fragment>
                <div className="krm-card-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 20 }}>
                  {jobs.map(function (j) {
                    return <JobCard key={j.id} {...flatJob(j)} saved={true} onSave={function(){ unsave(j.id); }} onClick={function(){ window.location.href = "/krama/krama/ui_kits/public-website/index.html?job=" + j.id; }} />;
                  })}
                </div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <span style={{ fontSize: "var(--text-sm)", color: "var(--text-muted)" }}>
                    Showing {(meta.current_page - 1) * 10 + 1}–{(meta.current_page - 1) * 10 + jobs.length} of {meta.total}
                  </span>
                  <div style={{ display: "flex", gap: 8 }}>
                    <Button variant="secondary" size="sm" disabled={meta.current_page <= 1} onClick={function(){ load(meta.current_page - 1); }}>Previous</Button>
                    <Button variant="secondary" size="sm" disabled={meta.current_page >= meta.last_page} onClick={function(){ load(meta.current_page + 1); }}>Next</Button>
                  </div>
                </div>
              </React.Fragment>
            )
        }
      </div>
    );
  }

  // ── Recommended ────────────────────────────────────────────────────────────
  function MatchBadge({ reasons }) {
    if (!reasons || reasons.length === 0) return null;
    var labels = { category: "Matches your field", level: "Matches your level" };
    return (
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 6 }}>
        {reasons.map(function(r) {
          return (
            <span key={r} style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "2px 8px", borderRadius: "var(--radius-full)", background: "var(--brand-subtle)", color: "var(--text-brand)", fontSize: "var(--text-xs)", fontWeight: 600 }}>
              {I("sparkles", 11)} {labels[r] || r}
            </span>
          );
        })}
      </div>
    );
  }

  function Recommended() {
    var [jobs, setJobs] = React.useState([]);
    var [meta, setMeta] = React.useState({ total: 0, last_page: 1, current_page: 1 });
    var [savedIds, setSavedIds] = React.useState([]);
    var [loading, setLoading] = React.useState(true);
    var [search, setSearch] = React.useState("");
    var [searchInput, setSearchInput] = React.useState("");
    var [hasHistory, setHasHistory] = React.useState(true);

    function load(page, kw) {
      setLoading(true);
      Promise.all([
        cand.fetchRecommended(page || 1, kw || ""),
        cand.fetchSavedJobs(1),
      ]).then(function(r) {
        var jobsRes = r[0]; var savedRes = r[1];
        var jobList = jobsRes.data || [];
        setJobs(jobList);
        setMeta({ total: jobsRes.total || 0, last_page: jobsRes.last_page || 1, current_page: jobsRes.current_page || 1 });
        setSavedIds((savedRes.data || []).map(function(j){ return j.id; }));
        // If no job has match_reasons, the candidate has no history (fallback mode)
        setHasHistory(jobList.some(function(j){ return j.match_reasons && j.match_reasons.length > 0; }));
        setLoading(false);
      }).catch(function(){ setLoading(false); });
    }

    React.useEffect(function() { load(1, ""); }, []);

    function toggleSave(jobId) {
      var isSaved = savedIds.includes(jobId);
      (isSaved ? cand.unsaveJob(jobId) : cand.saveJob(jobId)).then(function() {
        setSavedIds(function(ids){ return isSaved ? ids.filter(function(x){ return x !== jobId; }) : ids.concat(jobId); });
      }).catch(function(){});
    }

    function doSearch(e) {
      e && e.preventDefault();
      setSearch(searchInput);
      load(1, searchInput);
    }

    return (
      <div className="krm-page-pad" style={{ padding: 28 }}>
        <ScreenHead title="Recommended for you" sub={loading ? "Loading…" : meta.total + " jobs matched"} />

        {!loading && !hasHistory && (
          <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 16px", background: "var(--info-subtle)", border: "1px solid var(--info-border)", borderRadius: "var(--radius-md)", marginBottom: 18, fontSize: "var(--text-sm)", color: "var(--info)" }}>
            {I("info", 15)} Apply to or save some jobs first — we'll personalise these recommendations based on your activity.
          </div>
        )}

        <form onSubmit={doSearch} style={{ display: "flex", gap: 10, marginBottom: 20 }}>
          <div style={{ flex: 1, position: "relative" }}>
            <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--text-faint)", pointerEvents: "none" }}>{I("search", 16)}</span>
            <input
              value={searchInput}
              onChange={function(e){ setSearchInput(e.target.value); }}
              placeholder="Search job title, company, keyword…"
              style={{ width: "100%", height: 40, padding: "0 12px 0 38px", borderRadius: "var(--radius-md)", border: "1px solid var(--border)", background: "var(--surface-input)", color: "var(--text-body)", fontFamily: "var(--font-sans)", fontSize: "var(--text-sm)", boxSizing: "border-box" }}
            />
          </div>
          <Button variant="primary" type="submit">Search</Button>
          {search && <Button variant="secondary" onClick={function(){ setSearchInput(""); setSearch(""); load(1, ""); }}>Clear</Button>}
        </form>

        {loading
          ? <div style={{ color: "var(--text-muted)", padding: "28px 0" }}>Loading…</div>
          : jobs.length === 0
            ? <Card padding={32}><div style={{ textAlign: "center", color: "var(--text-muted)" }}>No jobs found{search ? ' for "' + search + '"' : ""}. Try a different keyword.</div></Card>
            : (
              <React.Fragment>
                <div className="krm-card-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 20 }}>
                  {jobs.map(function(j) {
                    return (
                      <div key={j.id}>
                        <JobCard {...flatJob(j)} saved={savedIds.includes(j.id)} onSave={function(){ toggleSave(j.id); }} onClick={function(){ window.location.href = "/krama/krama/ui_kits/public-website/index.html?job=" + j.id; }} />
                        <MatchBadge reasons={j.match_reasons} />
                      </div>
                    );
                  })}
                </div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <span style={{ fontSize: "var(--text-sm)", color: "var(--text-muted)" }}>
                    Showing {(meta.current_page - 1) * 12 + 1}–{(meta.current_page - 1) * 12 + jobs.length} of {meta.total}
                  </span>
                  <div style={{ display: "flex", gap: 8 }}>
                    <Button variant="secondary" size="sm" disabled={meta.current_page <= 1} onClick={function(){ load(meta.current_page - 1, search); }}>Previous</Button>
                    <Button variant="secondary" size="sm" disabled={meta.current_page >= meta.last_page} onClick={function(){ load(meta.current_page + 1, search); }}>Next</Button>
                  </div>
                </div>
              </React.Fragment>
            )
        }
      </div>
    );
  }

  // ── Profile ────────────────────────────────────────────────────────────────
  function Profile({ user, onUserUpdate }) {
    var [name, setName] = React.useState(user ? user.name : "");
    var [email, setEmail] = React.useState(user ? (user.email || "") : "");
    var [phone, setPhone] = React.useState(user ? (user.phone || "") : "");
    var [bio, setBio] = React.useState(user ? (user.bio || "") : "");
    var [cvVis, setCvVis] = React.useState(user ? (user.cv_visibility || "employers") : "employers");
    var [preview, setPreview] = React.useState(user ? (user.avatar_url || "") : "");
    var [busy, setBusy] = React.useState(false);
    var [uploading, setUploading] = React.useState(false);
    var [msg, setMsg] = React.useState(null); // { ok, text }
    var fileRef = React.useRef(null);
    var [curPwd, setCurPwd] = React.useState("");
    var [newPwd, setNewPwd] = React.useState("");
    var [conPwd, setConPwd] = React.useState("");
    var [pwdBusy, setPwdBusy] = React.useState(false);
    var [pwdMsg, setPwdMsg] = React.useState(null);

    function changePwd() {
      if (!curPwd || !newPwd || !conPwd) { setPwdMsg({ ok: false, text: "All fields are required." }); return; }
      if (newPwd !== conPwd) { setPwdMsg({ ok: false, text: "New passwords do not match." }); return; }
      if (newPwd.length < 8) { setPwdMsg({ ok: false, text: "Password must be at least 8 characters." }); return; }
      setPwdBusy(true); setPwdMsg(null);
      cand.changePassword(curPwd, newPwd).then(function() {
        setPwdBusy(false); setPwdMsg({ ok: true, text: "Password updated!" });
        setCurPwd(""); setNewPwd(""); setConPwd("");
      }).catch(function(e) { setPwdBusy(false); setPwdMsg({ ok: false, text: (e && e.message) || "Failed to update password." }); });
    }

    function onFileChange(e) {
      var file = e.target.files && e.target.files[0];
      if (!file) return;
      var reader = new FileReader();
      reader.onload = function(ev) { setPreview(ev.target.result); };
      reader.readAsDataURL(file);
      setUploading(true); setMsg(null);
      compressImage(file, 400, 0.82).then(function(compressed) {
        return cand.uploadAvatar(compressed);
      }).then(function(u) {
        setPreview(u.avatar_url || "");
        if (onUserUpdate) onUserUpdate(u);
        setUploading(false); setMsg({ ok: true, text: "Photo updated!" });
      }).catch(function(err){ setUploading(false); setMsg({ ok: false, text: err.message || "Upload failed." }); });
    }

    function save() {
      setBusy(true); setMsg(null);
      cand.updateMe({ name: name.trim(), email: email.trim(), phone: phone.trim(), bio: bio.trim(), cv_visibility: cvVis }).then(function (u) {
        if (u.cv_visibility) setCvVis(u.cv_visibility);
        if (onUserUpdate) onUserUpdate(u);
        setMsg({ ok: true, text: "Profile saved!" });
        setBusy(false);
      }).catch(function(err) {
        setBusy(false);
        if (err && err.errors) {
          var first = Object.values(err.errors)[0];
          setMsg({ ok: false, text: Array.isArray(first) ? first[0] : first });
        } else {
          setMsg({ ok: false, text: (err && err.message) || "Failed to save." });
        }
      });
    }

    return (
      <div className="krm-page-pad" style={{ padding: 28, maxWidth: 720 }}>
        <ScreenHead title="Profile" sub="How you appear to employers." />
        <Card padding={24}>
          <div style={{ display: "flex", gap: 20, alignItems: "center", marginBottom: 24 }}>
            <div style={{ position: "relative", flexShrink: 0 }}>
              <Avatar name={name || "?"} size={72} src={preview || undefined} />
              <button onClick={function(){ fileRef.current && fileRef.current.click(); }} disabled={uploading} style={{ position: "absolute", bottom: 0, right: 0, width: 26, height: 26, borderRadius: "50%", background: "var(--brand)", border: "2px solid var(--surface-card)", cursor: "pointer", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center" }}>
                {uploading ? <span style={{ fontSize: 10 }}>…</span> : I("camera", 13)}
              </button>
              <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }} onChange={onFileChange} />
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: "var(--text-md)", color: "var(--text-strong)" }}>{name}</div>
              <div style={{ fontSize: "var(--text-sm)", color: "var(--text-muted)", marginTop: 2 }}>{email}</div>
              <Button variant="ghost" size="sm" style={{ marginTop: 8, paddingLeft: 0 }} onClick={function(){ fileRef.current && fileRef.current.click(); }} disabled={uploading}>
                {uploading ? "Uploading…" : "Change photo"}
              </Button>
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <Input label="Full name" value={name} onChange={function(e){ setName(e.target.value); }} />
            <div className="krm-form-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <Input label="Email" type="email" value={email} onChange={function(e){ setEmail(e.target.value); }} iconLeft={I("mail", 16)} />
              <Input label="Phone" value={phone} onChange={function(e){ setPhone(e.target.value); }} iconLeft={I("phone", 16)} />
            </div>
            <Textarea label="Bio / Description" value={bio} onChange={function(e){ setBio(e.target.value); }} rows={4} placeholder="Tell employers a bit about yourself…" />
            <div>
              <div style={{ fontSize: "var(--text-sm)", fontWeight: 600, color: "var(--text-strong)", marginBottom: 6 }}>CV / Resume visibility</div>
              <Select value={cvVis} onChange={function(e){ setCvVis(e.target.value); }} options={[
                { value: "public", label: "Public — anyone can view" },
                { value: "employers", label: "Employers only — recruiters who review your application" },
                { value: "private", label: "Private — only you can access" },
              ]} />
              <div style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)", marginTop: 5 }}>Controls who can download your uploaded CV file.</div>
            </div>
            {msg && (
              <div style={{ padding: "10px 14px", borderRadius: "var(--radius-md)", background: msg.ok ? "var(--success-subtle,#f0fdf4)" : "var(--danger-subtle,#fff5f5)", color: msg.ok ? "var(--success)" : "var(--danger)", fontSize: "var(--text-sm)", fontWeight: 600 }}>
                {msg.text}
              </div>
            )}
            <div style={{ display: "flex", gap: 10, paddingTop: 6 }}>
              <Button variant="primary" disabled={busy} onClick={save}>{busy ? "Saving…" : "Save changes"}</Button>
            </div>
          </div>
        </Card>
        <Card padding={24} style={{ marginTop: 20 }}>
          <h3 style={{ fontSize: "var(--text-base)", fontWeight: 700, color: "var(--text-strong)", marginBottom: 4 }}>Change password</h3>
          <p style={{ fontSize: "var(--text-sm)", color: "var(--text-muted)", marginBottom: 18 }}>Choose a strong password of at least 8 characters.</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <Input label="Current password" type="password" value={curPwd} onChange={function(e){ setCurPwd(e.target.value); }} placeholder="••••••••" />
            <div className="krm-form-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              <Input label="New password" type="password" value={newPwd} onChange={function(e){ setNewPwd(e.target.value); }} placeholder="At least 8 characters" />
              <Input label="Confirm new password" type="password" value={conPwd} onChange={function(e){ setConPwd(e.target.value); }} placeholder="••••••••" />
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

  // ── Resume Builder ─────────────────────────────────────────────────────────
  function ResumeBuilder() {
    var EMPTY_RESUME = { headline: "", summary: "", data: { education: [], experience: [], skills: [], certifications: [] } };
    var [resume, setResume] = React.useState(EMPTY_RESUME);
    var [loading, setLoading] = React.useState(true);
    var [busy, setBusy] = React.useState(false);
    var [saved, setSaved] = React.useState(false);
    var [uploading, setUploading] = React.useState(false);
    var cvRef = React.useRef(null);

    React.useEffect(function() {
      cand.fetchResume().then(function(r) {
        if (r) {
          setResume({ headline: r.headline || "", summary: r.summary || "", has_cv: !!(r.download_url), data: Object.assign({ education: [], experience: [], skills: [], certifications: [] }, r.data || {}) });
        }
        setLoading(false);
      }).catch(function(){ setLoading(false); });
    }, []);

    function setField(key, val) { setResume(function(r){ return Object.assign({}, r, { [key]: val }); }); }
    function setData(key, val) { setResume(function(r){ return Object.assign({}, r, { data: Object.assign({}, r.data, { [key]: val }) }); }); }

    function saveAll() {
      setBusy(true); setSaved(false);
      cand.saveResume({ headline: resume.headline, summary: resume.summary, data: resume.data }).then(function(r) {
        setSaved(true); setBusy(false);
      }).catch(function(err){ alert(err.message || "Save failed."); setBusy(false); });
    }

    function onCvChange(e) {
      var file = e.target.files && e.target.files[0];
      if (!file) return;
      setUploading(true);
      cand.uploadCv(file).then(function(r) {
        setResume(function(rv){ return Object.assign({}, rv, { has_cv: !!(r.download_url) }); });
        setUploading(false);
      }).catch(function(err){ alert(err.message || "Upload failed."); setUploading(false); });
    }

    function downloadCv() {
      cand.downloadCv().then(function(blob) {
        var url = URL.createObjectURL(blob);
        var a = document.createElement('a'); a.href = url; a.download = 'my_cv.pdf';
        document.body.appendChild(a); a.click();
        setTimeout(function() { document.body.removeChild(a); URL.revokeObjectURL(url); }, 300);
      }).catch(function(e) { alert('Download failed: ' + (e && e.message || 'Unknown error')); });
    }

    // Education helpers
    function addEdu() { setData("education", resume.data.education.concat({ school: "", degree: "", years: "" })); }
    function updateEdu(i, key, val) { var arr = resume.data.education.slice(); arr[i] = Object.assign({}, arr[i], { [key]: val }); setData("education", arr); }
    function removeEdu(i) { setData("education", resume.data.education.filter(function(_,idx){ return idx !== i; })); }

    // Experience helpers
    function addExp() { setData("experience", resume.data.experience.concat({ role: "", org: "", years: "", note: "" })); }
    function updateExp(i, key, val) { var arr = resume.data.experience.slice(); arr[i] = Object.assign({}, arr[i], { [key]: val }); setData("experience", arr); }
    function removeExp(i) { setData("experience", resume.data.experience.filter(function(_,idx){ return idx !== i; })); }

    // Skills helpers
    var [skillInput, setSkillInput] = React.useState("");
    function addSkill() { var s = skillInput.trim(); if (!s) return; setData("skills", resume.data.skills.concat(s)); setSkillInput(""); }
    function removeSkill(i) { setData("skills", resume.data.skills.filter(function(_,idx){ return idx !== i; })); }

    // Certifications helpers
    function addCert() { setData("certifications", resume.data.certifications.concat({ name: "", year: "" })); }
    function updateCert(i, key, val) { var arr = resume.data.certifications.slice(); arr[i] = Object.assign({}, arr[i], { [key]: val }); setData("certifications", arr); }
    function removeCert(i) { setData("certifications", resume.data.certifications.filter(function(_,idx){ return idx !== i; })); }

    var sectionStyle = { marginBottom: 20 };
    var sectionHeadStyle = { display: "flex", alignItems: "center", gap: 10, marginBottom: 14 };
    var iconBoxStyle = { display: "inline-flex", alignItems: "center", justifyContent: "center", width: 34, height: 34, borderRadius: "var(--radius-md)", background: "var(--brand-subtle)", color: "var(--brand)", flexShrink: 0 };

    if (loading) return <div style={{ padding: 28, color: "var(--text-muted)" }}>Loading…</div>;

    return (
      <div className="krm-page-pad" style={{ padding: 28, maxWidth: 860 }}>
        <ScreenHead title="Résumé builder" sub="Build your CV to attach when applying for jobs."
          action={
            <div style={{ display: "flex", gap: 10 }}>
              {resume.has_cv && <Button variant="secondary" iconLeft={I("download", 15)} onClick={downloadCv}>Download CV</Button>}
              <Button variant="primary" disabled={busy} onClick={saveAll} iconLeft={I("save", 15)}>{busy ? "Saving…" : "Save resume"}</Button>
            </div>
          }
        />
        {saved && <div style={{ marginBottom: 16, padding: "10px 16px", background: "var(--success-subtle)", color: "var(--success)", borderRadius: "var(--radius-md)", fontSize: "var(--text-sm)" }}>Resume saved successfully!</div>}

        {/* Upload CV file */}
        <Card padding={20} style={{ marginBottom: 20 }}>
          <div style={sectionHeadStyle}>
            <span style={iconBoxStyle}>{I("upload", 18)}</span>
            <h3 style={{ fontSize: "var(--text-md)", fontWeight: 700, color: "var(--text-strong)", flex: 1 }}>Upload CV file</h3>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            {resume.has_cv
              ? <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", border: "1px solid var(--border)", borderRadius: "var(--radius-md)", flex: 1 }}>
                  <span style={{ color: "var(--brand)" }}>{I("file-text", 20)}</span>
                  <span style={{ fontSize: "var(--text-sm)", color: "var(--text-body)", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>CV uploaded</span>
                  <button onClick={downloadCv} style={{ fontSize: "var(--text-sm)", color: "var(--brand)", background: "none", border: "none", cursor: "pointer", padding: 0 }}>View</button>
                </div>
              : <div style={{ flex: 1, fontSize: "var(--text-sm)", color: "var(--text-muted)" }}>No CV uploaded yet. Upload a PDF or DOC (max 5 MB).</div>
            }
            <input ref={cvRef} type="file" accept=".pdf,.doc,.docx" style={{ display: "none" }} onChange={onCvChange} />
            <Button variant="secondary" disabled={uploading} onClick={function(){ cvRef.current && cvRef.current.click(); }}>{uploading ? "Uploading…" : resume.has_cv ? "Replace CV" : "Upload CV"}</Button>
          </div>
        </Card>

        {/* Headline & Summary */}
        <Card padding={20} style={sectionStyle}>
          <div style={sectionHeadStyle}>
            <span style={iconBoxStyle}>{I("user-round", 18)}</span>
            <h3 style={{ fontSize: "var(--text-md)", fontWeight: 700, color: "var(--text-strong)" }}>Personal summary</h3>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <Input label="Headline / Job title" value={resume.headline} onChange={function(e){ setField("headline", e.target.value); }} placeholder="e.g. Senior Accountant" />
            <div>
              <label style={{ fontSize: "var(--text-sm)", fontWeight: 600, color: "var(--text-strong)", display: "block", marginBottom: 6 }}>Summary</label>
              <textarea value={resume.summary} onChange={function(e){ setField("summary", e.target.value); }} placeholder="Brief professional summary…" rows={4}
                style={{ width: "100%", padding: "10px 12px", border: "1px solid var(--border)", borderRadius: "var(--radius-md)", fontFamily: "var(--font-sans)", fontSize: "var(--text-sm)", resize: "vertical", boxSizing: "border-box", color: "var(--text-body)" }} />
            </div>
          </div>
        </Card>

        {/* Education */}
        <Card padding={20} style={sectionStyle}>
          <div style={sectionHeadStyle}>
            <span style={iconBoxStyle}>{I("graduation-cap", 18)}</span>
            <h3 style={{ fontSize: "var(--text-md)", fontWeight: 700, color: "var(--text-strong)", flex: 1 }}>Education</h3>
            <Button variant="ghost" size="sm" iconLeft={I("plus", 13)} onClick={addEdu}>Add</Button>
          </div>
          {resume.data.education.length === 0 && <div style={{ color: "var(--text-faint)", fontSize: "var(--text-sm)" }}>No education entries yet.</div>}
          {resume.data.education.map(function(e, i) {
            return (
              <div key={i} style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 10, marginBottom: 10, alignItems: "end" }}>
                <Input label={i === 0 ? "School / University" : undefined} value={e.school} onChange={function(ev){ updateEdu(i,"school",ev.target.value); }} placeholder="School" />
                <Input label={i === 0 ? "Degree" : undefined} value={e.degree} onChange={function(ev){ updateEdu(i,"degree",ev.target.value); }} placeholder="e.g. BBA, Accounting" />
                <Input label={i === 0 ? "Years" : undefined} value={e.years} onChange={function(ev){ updateEdu(i,"years",ev.target.value); }} placeholder="2018–2022" />
                <button onClick={function(){ removeEdu(i); }} style={{ height: 40, width: 36, border: "1px solid var(--border)", borderRadius: "var(--radius-md)", background: "transparent", cursor: "pointer", color: "var(--danger)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{I("trash-2", 15)}</button>
              </div>
            );
          })}
        </Card>

        {/* Experience */}
        <Card padding={20} style={sectionStyle}>
          <div style={sectionHeadStyle}>
            <span style={iconBoxStyle}>{I("briefcase", 18)}</span>
            <h3 style={{ fontSize: "var(--text-md)", fontWeight: 700, color: "var(--text-strong)", flex: 1 }}>Work experience</h3>
            <Button variant="ghost" size="sm" iconLeft={I("plus", 13)} onClick={addExp}>Add</Button>
          </div>
          {resume.data.experience.length === 0 && <div style={{ color: "var(--text-faint)", fontSize: "var(--text-sm)" }}>No experience entries yet.</div>}
          {resume.data.experience.map(function(e, i) {
            return (
              <div key={i} style={{ border: "1px solid var(--border-subtle)", borderRadius: "var(--radius-md)", padding: "14px", marginBottom: 12 }}>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 10, marginBottom: 10, alignItems: "end" }}>
                  <Input label="Job title" value={e.role} onChange={function(ev){ updateExp(i,"role",ev.target.value); }} placeholder="e.g. Senior Accountant" />
                  <Input label="Company" value={e.org} onChange={function(ev){ updateExp(i,"org",ev.target.value); }} placeholder="Company name" />
                  <Input label="Years" value={e.years} onChange={function(ev){ updateExp(i,"years",ev.target.value); }} placeholder="2021–present" />
                  <button onClick={function(){ removeExp(i); }} style={{ height: 40, width: 36, border: "1px solid var(--border)", borderRadius: "var(--radius-md)", background: "transparent", cursor: "pointer", color: "var(--danger)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 20 }}>{I("trash-2", 15)}</button>
                </div>
                <div>
                  <label style={{ fontSize: "var(--text-sm)", fontWeight: 600, color: "var(--text-strong)", display: "block", marginBottom: 6 }}>Description</label>
                  <textarea value={e.note} onChange={function(ev){ updateExp(i,"note",ev.target.value); }} placeholder="Key responsibilities and achievements…" rows={2}
                    style={{ width: "100%", padding: "10px 12px", border: "1px solid var(--border)", borderRadius: "var(--radius-md)", fontFamily: "var(--font-sans)", fontSize: "var(--text-sm)", resize: "vertical", boxSizing: "border-box", color: "var(--text-body)" }} />
                </div>
              </div>
            );
          })}
        </Card>

        {/* Skills */}
        <Card padding={20} style={sectionStyle}>
          <div style={sectionHeadStyle}>
            <span style={iconBoxStyle}>{I("sparkles", 18)}</span>
            <h3 style={{ fontSize: "var(--text-md)", fontWeight: 700, color: "var(--text-strong)", flex: 1 }}>Skills</h3>
          </div>
          <div style={{ display: "flex", gap: 8, marginBottom: 12, alignItems: "center" }}>
            <input value={skillInput} onChange={function(e){ setSkillInput(e.target.value); }}
              onKeyDown={function(e){ if(e.key==="Enter"){ e.preventDefault(); addSkill(); } }}
              placeholder="Type a skill and press Enter or Add"
              style={{ flex: 1, height: 40, padding: "0 12px", border: "1px solid var(--border)", borderRadius: "var(--radius-md)", fontFamily: "var(--font-sans)", fontSize: "var(--text-sm)", color: "var(--text-body)" }} />
            <Button variant="secondary" size="sm" onClick={addSkill}>Add</Button>
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {resume.data.skills.map(function(s, i) {
              return (
                <span key={i} style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "5px 10px", background: "var(--brand-subtle)", color: "var(--text-brand)", borderRadius: 99, fontSize: "var(--text-sm)", fontWeight: 500 }}>
                  {s}
                  <button onClick={function(){ removeSkill(i); }} style={{ border: "none", background: "transparent", cursor: "pointer", color: "var(--text-muted)", display: "inline-flex", padding: 0, lineHeight: 1 }}>{I("x", 12)}</button>
                </span>
              );
            })}
            {resume.data.skills.length === 0 && <span style={{ color: "var(--text-faint)", fontSize: "var(--text-sm)" }}>No skills added yet.</span>}
          </div>
        </Card>

        {/* Certifications */}
        <Card padding={20} style={sectionStyle}>
          <div style={sectionHeadStyle}>
            <span style={iconBoxStyle}>{I("award", 18)}</span>
            <h3 style={{ fontSize: "var(--text-md)", fontWeight: 700, color: "var(--text-strong)", flex: 1 }}>Certifications</h3>
            <Button variant="ghost" size="sm" iconLeft={I("plus", 13)} onClick={addCert}>Add</Button>
          </div>
          {resume.data.certifications.length === 0 && <div style={{ color: "var(--text-faint)", fontSize: "var(--text-sm)" }}>No certifications yet.</div>}
          {resume.data.certifications.map(function(c, i) {
            return (
              <div key={i} style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 10, marginBottom: 10, alignItems: "end" }}>
                <Input label={i === 0 ? "Certification name" : undefined} value={c.name} onChange={function(ev){ updateCert(i,"name",ev.target.value); }} placeholder="e.g. CPA Cambodia" />
                <Input label={i === 0 ? "Year" : undefined} value={c.year} onChange={function(ev){ updateCert(i,"year",ev.target.value); }} placeholder="2021" />
                <button onClick={function(){ removeCert(i); }} style={{ height: 40, width: 36, border: "1px solid var(--border)", borderRadius: "var(--radius-md)", background: "transparent", cursor: "pointer", color: "var(--danger)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{I("trash-2", 15)}</button>
              </div>
            );
          })}
        </Card>
      </div>
    );
  }

  // ── Following ──────────────────────────────────────────────────────────────
  // Reusable client-side pager (auto-hides while everything fits on one page).
  function Pager({ page, perPage, total, onPage, label }) {
    var pages = Math.max(1, Math.ceil(total / perPage));
    var safe = Math.min(Math.max(1, page), pages);
    if (total <= perPage) return null;
    var from = total === 0 ? 0 : (safe - 1) * perPage + 1;
    var to = Math.min(total, safe * perPage);
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 14, flexWrap: "wrap", gap: 10 }}>
        <span style={{ fontSize: "var(--text-sm)", color: "var(--text-muted)" }}>Showing {from}–{to} of {total}{label ? " " + label : ""}</span>
        <div style={{ display: "flex", gap: 8 }}>
          <Button variant="secondary" size="sm" disabled={safe <= 1} onClick={function(){ onPage(safe - 1); }}>Previous</Button>
          <Button variant="secondary" size="sm" disabled={safe >= pages} onClick={function(){ onPage(safe + 1); }}>Next</Button>
        </div>
      </div>
    );
  }

  function Following() {
    var [companies, setCompanies] = React.useState([]);
    var [loading, setLoading] = React.useState(true);
    var [error, setError] = React.useState("");
    var [unfollowing, setUnfollowing] = React.useState(null);
    var [page, setPage] = React.useState(1);
    var FOLLOW_PER = 10;
    var pageSafe = Math.min(Math.max(1, page), Math.max(1, Math.ceil(companies.length / FOLLOW_PER)));
    var shown = companies.slice((pageSafe - 1) * FOLLOW_PER, pageSafe * FOLLOW_PER);

    React.useEffect(function() {
      cand.fetchFollowing().then(function(r) {
        setCompanies(r.data || []);
        setLoading(false);
      }).catch(function(e) {
        setError(e.message);
        setLoading(false);
      });
    }, []);

    function handleUnfollow(id) {
      if (!window.confirm("Unfollow this company?")) return;
      setUnfollowing(id);
      cand.unfollowCompany(id).then(function() {
        setCompanies(function(prev){ return prev.filter(function(c){ return c.id !== id; }); });
        setUnfollowing(null);
      }).catch(function(e) {
        alert(e.message || "Failed.");
        setUnfollowing(null);
      });
    }

    if (loading) return <div className="krm-page-pad" style={{ padding: 28, color: "var(--text-muted)" }}>Loading…</div>;
    if (error) return <div className="krm-page-pad" style={{ padding: 28, color: "var(--danger)" }}>{error}</div>;

    return (
      <div className="krm-page-pad" style={{ padding: 28 }}>
        <div style={{ maxWidth: 740 }}>
          <div style={{ marginBottom: 22 }}>
            <div style={{ fontFamily: "var(--font-sans)", fontWeight: 700, fontSize: "var(--text-lg)", color: "var(--text-strong)" }}>Companies I follow</div>
            <div style={{ fontSize: "var(--text-sm)", color: "var(--text-muted)", marginTop: 2 }}>You'll get an email when a followed company posts a new job.</div>
          </div>

          {companies.length === 0 ? (
            <EmptyState icon={I("heart", 28)} title="Not following anyone yet" description="Visit a company profile and click Follow to stay notified of new jobs." />
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {shown.map(function(c) {
                return (
                  <Card key={c.id} style={{ display: "flex", alignItems: "center", gap: 16 }}>
                    <Avatar src={c.logo_url} name={c.name} square size={48} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 700, color: "var(--text-strong)", fontSize: "var(--text-sm)" }}>{c.name}</div>
                      <div style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)", marginTop: 2 }}>
                        {[c.industry, c.location].filter(Boolean).join(" · ")}
                        {c.open_jobs > 0 && <span style={{ marginLeft: 8, color: "var(--text-brand)", fontWeight: 600 }}>{c.open_jobs} open role{c.open_jobs === 1 ? "" : "s"}</span>}
                      </div>
                    </div>
                    <button onClick={function(){ handleUnfollow(c.id); }} disabled={unfollowing === c.id} style={{ border: "1px solid var(--border-strong)", background: "transparent", cursor: "pointer", color: "var(--text-muted)", padding: "7px 14px", borderRadius: "var(--radius-md)", fontFamily: "var(--font-sans)", fontWeight: 600, fontSize: "var(--text-xs)", display: "inline-flex", alignItems: "center", gap: 6 }}>
                      {I("heart-off", 14)} Unfollow
                    </button>
                  </Card>
                );
              })}
              <Pager page={pageSafe} perPage={FOLLOW_PER} total={companies.length} onPage={setPage} label="companies" />
            </div>
          )}
        </div>
      </div>
    );
  }

  // ── JobAlerts ──────────────────────────────────────────────────────────────
  function JobAlerts() {
    var { Card, Button, Input, Select, Badge, EmptyState } = window.KramaDesignSystem_1a6f65;
    var [alerts, setAlerts] = React.useState([]);
    var [loading, setLoading] = React.useState(true);
    var [error, setError] = React.useState("");
    var [deleting, setDeleting] = React.useState(null);
    var [showForm, setShowForm] = React.useState(true);
    var [categories, setCategories] = React.useState([]);
    var [locations, setLocations] = React.useState([]);
    var [form, setForm] = React.useState({ keyword: "", category_id: "", location_id: "", job_type: "", is_remote: "" });
    var [saving, setSaving] = React.useState(false);
    var [formErr, setFormErr] = React.useState("");

    function load() {
      cand.fetchAlerts().then(function(r) {
        setAlerts(r.data || []);
        setLoading(false);
      }).catch(function(e) {
        setError(e.message);
        setLoading(false);
      });
    }

    React.useEffect(function() {
      load();
      // Load filter options for the form
      var base = /^(localhost|127\.0\.0\.1|::1|192\.168\.|10\.)/.test(window.location.hostname) ? "http://127.0.0.1:8000/api" : (window.location.protocol + "//" + window.location.host + "/api");
      Promise.all([fetch(base + "/categories").then(function(r){ return r.json(); }), fetch(base + "/locations").then(function(r){ return r.json(); })])
        .then(function(r) {
          setCategories(r[0].data || r[0] || []);
          setLocations(r[1].data || r[1] || []);
        }).catch(function(){});
    }, []);

    function handleDelete(id) {
      if (!window.confirm("Delete this alert?")) return;
      setDeleting(id);
      cand.deleteAlert(id).then(function() {
        setAlerts(function(prev){ return prev.filter(function(a){ return a.id !== id; }); });
        setDeleting(null);
      }).catch(function(e) {
        alert(e.message || "Failed to delete alert.");
        setDeleting(null);
      });
    }

    function handleCreate(e) {
      e.preventDefault();
      setFormErr("");
      var payload = {};
      if (form.keyword.trim()) payload.keyword = form.keyword.trim();
      if (form.category_id) payload.category_id = parseInt(form.category_id);
      if (form.location_id) payload.location_id = parseInt(form.location_id);
      if (form.job_type) payload.job_type = form.job_type;
      if (form.is_remote !== "") payload.is_remote = form.is_remote === "1";
      if (!Object.keys(payload).length) { setFormErr("Set at least one filter before saving."); return; }
      setSaving(true);
      cand.createAlert(payload).then(function(r) {
        setAlerts(function(prev){ return [r.data, ...prev]; });
        setForm({ keyword: "", category_id: "", location_id: "", job_type: "", is_remote: "" });
        setShowForm(false);
        setSaving(false);
        setFormErr("");
      }).catch(function(e) {
        setFormErr(e.message || "Failed to save alert.");
        setSaving(false);
      });
    }

    var JOB_TYPES = [{ value: "", label: "Any type" }, { value: "full_time", label: "Full-time" }, { value: "part_time", label: "Part-time" }, { value: "contract", label: "Contract" }, { value: "internship", label: "Internship" }];
    var REMOTE_OPTS = [{ value: "", label: "Any" }, { value: "1", label: "Remote only" }, { value: "0", label: "On-site / hybrid" }];

    function alertLabel(a) {
      var parts = [];
      if (a.keyword) parts.push('"' + a.keyword + '"');
      if (a.category) parts.push(a.category.name);
      if (a.location) parts.push(a.location.name);
      if (a.job_type) parts.push(a.job_type.replace("_", "-"));
      if (a.is_remote === true) parts.push("Remote");
      return parts.length ? parts.join(" · ") : "All new jobs";
    }

    if (loading) return <div className="krm-page-pad" style={{ padding: 28, color: "var(--text-muted)" }}>Loading…</div>;
    if (error) return <div className="krm-page-pad" style={{ padding: 28, color: "var(--danger)" }}>{error}</div>;

    return (
      <div className="krm-page-pad" style={{ padding: 28 }}>
        <div style={{ maxWidth: 740 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
          <div>
            <div style={{ fontFamily: "var(--font-sans)", fontWeight: 700, fontSize: "var(--text-lg)", color: "var(--text-strong)" }}>Your job alerts</div>
            <div style={{ fontSize: "var(--text-sm)", color: "var(--text-muted)", marginTop: 2 }}>Get an email the moment a matching role is posted. Up to 10 alerts.</div>
          </div>
          {alerts.length < 10 && alerts.length > 0 && (
            <Button variant="primary" size="sm" onClick={function(){ setShowForm(!showForm); setFormErr(""); }}>
              {showForm ? "Cancel" : "+ New alert"}
            </Button>
          )}
        </div>

        {showForm && (
          <Card style={{ marginBottom: 24 }}>
            <form onSubmit={handleCreate}>
              <div style={{ fontWeight: 700, fontSize: "var(--text-base)", color: "var(--text-strong)", marginBottom: 16 }}>Create a new alert</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
                <Input label="Keyword" placeholder="e.g. Software Engineer" value={form.keyword} onChange={function(e){ setForm(function(f){ return Object.assign({}, f, { keyword: e.target.value }); }); }} />
                <div>
                  <label style={{ display: "block", fontSize: "var(--text-sm)", fontWeight: 600, color: "var(--text-label)", marginBottom: 6 }}>Category</label>
                  <select value={form.category_id} onChange={function(e){ setForm(function(f){ return Object.assign({}, f, { category_id: e.target.value }); }); }} style={{ width: "100%", padding: "9px 12px", border: "1px solid var(--border-strong)", borderRadius: "var(--radius-md)", fontFamily: "var(--font-sans)", fontSize: "var(--text-sm)", background: "var(--surface-card)", color: "var(--text-body)" }}>
                    <option value="">Any category</option>
                    {categories.map(function(c){ return <option key={c.id} value={c.id}>{c.name}</option>; })}
                  </select>
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "var(--text-sm)", fontWeight: 600, color: "var(--text-label)", marginBottom: 6 }}>Location</label>
                  <select value={form.location_id} onChange={function(e){ setForm(function(f){ return Object.assign({}, f, { location_id: e.target.value }); }); }} style={{ width: "100%", padding: "9px 12px", border: "1px solid var(--border-strong)", borderRadius: "var(--radius-md)", fontFamily: "var(--font-sans)", fontSize: "var(--text-sm)", background: "var(--surface-card)", color: "var(--text-body)" }}>
                    <option value="">Any location</option>
                    {locations.map(function(l){ return <option key={l.id} value={l.id}>{l.name}</option>; })}
                  </select>
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "var(--text-sm)", fontWeight: 600, color: "var(--text-label)", marginBottom: 6 }}>Job type</label>
                  <select value={form.job_type} onChange={function(e){ setForm(function(f){ return Object.assign({}, f, { job_type: e.target.value }); }); }} style={{ width: "100%", padding: "9px 12px", border: "1px solid var(--border-strong)", borderRadius: "var(--radius-md)", fontFamily: "var(--font-sans)", fontSize: "var(--text-sm)", background: "var(--surface-card)", color: "var(--text-body)" }}>
                    {JOB_TYPES.map(function(o){ return <option key={o.value} value={o.value}>{o.label}</option>; })}
                  </select>
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "var(--text-sm)", fontWeight: 600, color: "var(--text-label)", marginBottom: 6 }}>Work mode</label>
                  <select value={form.is_remote} onChange={function(e){ setForm(function(f){ return Object.assign({}, f, { is_remote: e.target.value }); }); }} style={{ width: "100%", padding: "9px 12px", border: "1px solid var(--border-strong)", borderRadius: "var(--radius-md)", fontFamily: "var(--font-sans)", fontSize: "var(--text-sm)", background: "var(--surface-card)", color: "var(--text-body)" }}>
                    {REMOTE_OPTS.map(function(o){ return <option key={o.value} value={o.value}>{o.label}</option>; })}
                  </select>
                </div>
              </div>
              {formErr && <div style={{ color: "var(--danger)", fontSize: "var(--text-sm)", marginBottom: 12 }}>{formErr}</div>}
              <Button variant="primary" size="sm" disabled={saving}>{saving ? "Saving…" : "Save alert"}</Button>
            </form>
          </Card>
        )}

        {alerts.length === 0 && !showForm && (
          <EmptyState icon={I("bell", 28)} title="No job alerts yet" description="Create an alert and we'll email you when a matching role is posted." />
        )}
        {alerts.length > 0 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {alerts.map(function(a) {
              return (
                <Card key={a.id} style={{ display: "flex", alignItems: "center", gap: 16 }}>
                  <div style={{ width: 36, height: 36, borderRadius: "50%", background: "var(--brand-subtle)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    {I("bell", 16)}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, color: "var(--text-strong)", fontSize: "var(--text-sm)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{alertLabel(a)}</div>
                    <div style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)", marginTop: 2 }}>Created {new Date(a.created_at).toLocaleDateString()}</div>
                  </div>
                  <button onClick={function(){ handleDelete(a.id); }} disabled={deleting === a.id} style={{ border: "none", background: "transparent", cursor: "pointer", color: "var(--text-faint)", padding: 6, borderRadius: "var(--radius-sm)", display: "inline-flex" }}>
                    {I("trash-2", 16)}
                  </button>
                </Card>
              );
            })}
          </div>
        )}
        </div>
      </div>
    );
  }

  // ── Messages ───────────────────────────────────────────────────────────────
  function Messages({ user }) {
    var [convs, setConvs] = React.useState([]);
    var [activeConv, setActiveConv] = React.useState(null);
    var [msgs, setMsgs] = React.useState([]);
    var [body, setBody] = React.useState("");
    var [sending, setSending] = React.useState(false);
    var [loading, setLoading] = React.useState(true);
    var [msgLoading, setMsgLoading] = React.useState(false);
    var bottomRef = React.useRef(null);
    var lastIdRef = React.useRef(0);
    var activeId = activeConv ? activeConv.id : null;

    function fmtTime(iso) {
      if (!iso) return "";
      var d = new Date(iso); var now = new Date(); var diff = now - d;
      if (diff < 60000) return "Just now";
      if (diff < 3600000) return Math.floor(diff / 60000) + "m";
      if (diff < 86400000) return Math.floor(diff / 3600000) + "h";
      return d.getDate() + " " + ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"][d.getMonth()];
    }

    function otherParty(conv) {
      if (!user || !user.role) return {};
      return user.role.slug === "candidate" ? (conv.employer || {}) : (conv.candidate || {});
    }

    function reloadConvs() {
      cand.fetchConversations().then(function(d) {
        setConvs(d.data || []);
        setLoading(false);
      }).catch(function() { setLoading(false); });
    }

    function reloadMsgs(convId) {
      cand.fetchMessages(convId).then(function(d) {
        var arr = (d.messages && d.messages.data) || [];
        setMsgs(arr);
        lastIdRef.current = arr.length ? arr[arr.length - 1].id : 0;
        setMsgLoading(false);
      }).catch(function() { setMsgLoading(false); });
    }

    // Delta poll: fetch only messages newer than the last one we hold, then append.
    function pollNew(convId) {
      cand.fetchNewMessages(convId, lastIdRef.current).then(function(d) {
        var fresh = (d && d.messages) || [];
        if (!fresh.length) return;
        setMsgs(function(m) {
          var seen = {};
          m.forEach(function(x) { seen[x.id] = 1; });
          var add = fresh.filter(function(x) { return !seen[x.id]; });
          return add.length ? m.concat(add) : m;
        });
        lastIdRef.current = Math.max(lastIdRef.current, fresh[fresh.length - 1].id);
      }).catch(function() {});
    }

    React.useEffect(function() {
      reloadConvs();
      var t = setInterval(function() { if (!document.hidden) reloadConvs(); }, 5000);
      return function() { clearInterval(t); };
    }, []);

    React.useEffect(function() {
      if (!activeId) { setMsgs([]); lastIdRef.current = 0; return; }
      setMsgLoading(true);
      lastIdRef.current = 0;
      reloadMsgs(activeId);
      var t = setInterval(function() { if (!document.hidden) pollNew(activeId); }, 1500);
      function onVis() { if (!document.hidden) pollNew(activeId); }
      document.addEventListener("visibilitychange", onVis);
      return function() { clearInterval(t); document.removeEventListener("visibilitychange", onVis); };
    }, [activeId]);

    React.useEffect(function() {
      if (bottomRef.current) bottomRef.current.scrollIntoView({ behavior: "smooth" });
    }, [msgs.length]);

    function send() {
      if (!body.trim() || !activeId || sending) return;
      setSending(true);
      cand.sendMessage(activeId, body.trim()).then(function(msg) {
        setMsgs(function(m) {
          if (msg && m.some(function(x) { return x.id === msg.id; })) return m;
          return m.concat(msg);
        });
        if (msg && msg.id) lastIdRef.current = Math.max(lastIdRef.current, msg.id);
        setBody("");
        setSending(false);
        reloadConvs();
      }).catch(function(e) { alert(e.message || "Failed to send."); setSending(false); });
    }

    return (
      <div style={{ display: "flex", height: "calc(100vh - 64px)", overflow: "hidden" }}>
        <div style={{ width: 290, flexShrink: 0, borderRight: "1px solid var(--border)", overflowY: "auto", background: "var(--surface-card)" }}>
          <div style={{ padding: "16px 16px 12px", borderBottom: "1px solid var(--border)", fontWeight: 700, fontSize: "var(--text-base)", color: "var(--text-strong)" }}>Conversations</div>
          {loading && <div style={{ padding: 24, color: "var(--text-muted)", fontSize: "var(--text-sm)" }}>Loading…</div>}
          {!loading && convs.length === 0 && (
            <div style={{ padding: 28, color: "var(--text-muted)", fontSize: "var(--text-sm)", textAlign: "center" }}>
              {I("message-square", 28)}
              <div style={{ marginTop: 8 }}>No conversations yet.</div>
              <div style={{ marginTop: 4, fontSize: 12, color: "var(--text-faint)" }}>Employers can message you directly after viewing your application.</div>
            </div>
          )}
          {convs.map(function(conv) {
            var other = otherParty(conv);
            var latest = conv.latest_message;
            var isActive = activeId === conv.id;
            return (
              <button key={conv.id} onClick={function() { setActiveConv(conv); }} style={{
                display: "flex", alignItems: "center", gap: 11, width: "100%", border: "none",
                background: isActive ? "var(--brand-subtle)" : "transparent",
                padding: "11px 14px", cursor: "pointer", textAlign: "left",
                borderBottom: "1px solid var(--border-subtle)",
              }}>
                <Avatar name={other.name || "?"} src={other.avatar_url} size={38} />
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 6 }}>
                    <span style={{ fontWeight: 700, fontSize: "var(--text-sm)", color: isActive ? "var(--text-brand)" : "var(--text-strong)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{other.name || "?"}</span>
                    {latest && <span style={{ fontSize: 10, color: "var(--text-faint)", flexShrink: 0 }}>{fmtTime(latest.created_at)}</span>}
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 2 }}>
                    {latest && <span style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1 }}>{latest.body}</span>}
                    {conv.unread_count > 0 && <Badge tone="brand">{conv.unread_count}</Badge>}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
        <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0, background: "var(--surface-page)" }}>
          {!activeConv ? (
            <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 12, color: "var(--text-faint)" }}>
              {I("message-square", 40)}
              <span style={{ fontSize: "var(--text-sm)" }}>Select a conversation to read messages</span>
            </div>
          ) : (<>
            <div style={{ padding: "12px 20px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", gap: 12, background: "var(--surface-card)", flexShrink: 0 }}>
              <Avatar name={otherParty(activeConv).name || "?"} src={otherParty(activeConv).avatar_url} size={36} />
              <div>
                <div style={{ fontWeight: 700, color: "var(--text-strong)", fontSize: "var(--text-base)" }}>{otherParty(activeConv).name || "?"}</div>
                {activeConv.job && <div style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>Re: {activeConv.job.title}</div>}
              </div>
            </div>
            <div style={{ flex: 1, overflowY: "auto", padding: "16px 20px", display: "flex", flexDirection: "column", gap: 10 }}>
              {msgLoading && msgs.length === 0 && <div style={{ color: "var(--text-muted)", fontSize: "var(--text-sm)" }}>Loading…</div>}
              {msgs.map(function(msg) {
                var mine = msg.sender_id === user.id;
                return (
                  <div key={msg.id} style={{ display: "flex", flexDirection: mine ? "row-reverse" : "row", gap: 8, alignItems: "flex-end" }}>
                    {!mine && <Avatar name={(msg.sender && msg.sender.name) || "?"} src={msg.sender && msg.sender.avatar_url} size={26} />}
                    <div style={{
                      maxWidth: "70%", padding: "8px 12px", lineHeight: 1.55, fontSize: "var(--text-sm)",
                      background: mine ? "var(--brand)" : "var(--surface-card)",
                      color: mine ? "#fff" : "var(--text-body)",
                      borderRadius: mine ? "12px 12px 2px 12px" : "12px 12px 12px 2px",
                      border: mine ? "none" : "1px solid var(--border)",
                    }}>
                      {msg.body}
                      <div style={{ fontSize: 10, marginTop: 4, opacity: 0.65 }}>{fmtTime(msg.created_at)}</div>
                    </div>
                  </div>
                );
              })}
              <div ref={bottomRef} />
            </div>
            <div style={{ padding: "10px 20px", borderTop: "1px solid var(--border)", display: "flex", gap: 10, alignItems: "flex-end", background: "var(--surface-card)", flexShrink: 0 }}>
              <textarea
                value={body}
                onChange={function(e){ setBody(e.target.value); }}
                onKeyDown={function(e){ if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
                placeholder="Type a message… (Enter to send, Shift+Enter for new line)"
                rows={2}
                style={{ flex: 1, resize: "none", border: "1px solid var(--border)", borderRadius: "var(--radius-md)", padding: "8px 12px", fontFamily: "var(--font-sans)", fontSize: "var(--text-sm)", color: "var(--text-body)", background: "var(--surface-page)", outline: "none", lineHeight: 1.5 }}
              />
              <Button variant="primary" iconLeft={I("send", 16)} disabled={sending || !body.trim()} onClick={send}>{sending ? "…" : "Send"}</Button>
            </div>
          </>)}
        </div>
      </div>
    );
  }

  // ── App ────────────────────────────────────────────────────────────────────
  function App() {
    var [page, setPage] = React.useState("dashboard");
    var [authUser, setAuthUser] = React.useState(null);
    var [authLoading, setAuthLoading] = React.useState(true);
    var [badges, setBadges] = React.useState({ applications: 0, saved: 0, messages: 0 });
    var [sidebarOpen, setSidebarOpen] = React.useState(false);

    React.useEffect(function() {
      if (!cand.token()) { setAuthLoading(false); return; }
      cand.fetchMe().then(function(u) {
        if (u && u.role && u.role.slug === "candidate") { setAuthUser(u); }
        setAuthLoading(false);
      }).catch(function(){ setAuthLoading(false); });
    }, []);

    // Load badge counts once logged in
    React.useEffect(function() {
      if (!authUser) return;
      Promise.all([cand.fetchApplications("", 1), cand.fetchSavedJobs(1)]).then(function(r) {
        setBadges(function(b) { return Object.assign({}, b, { applications: r[0].total || 0, saved: r[1].total || 0 }); });
      }).catch(function(){});
    }, [authUser]);

    // Poll unread message count every 15s
    React.useEffect(function() {
      if (!authUser) return;
      function pollUnread() {
        cand.fetchUnreadCount().then(function(d) {
          setBadges(function(b) { return Object.assign({}, b, { messages: d.count || 0 }); });
        }).catch(function(){});
      }
      pollUnread();
      var t = setInterval(pollUnread, 15000);
      return function() { clearInterval(t); };
    }, [authUser]);

    function handleLogout() {
      function doLogout() {
        localStorage.removeItem("krama_access_token");
        localStorage.removeItem("krama_refresh_token");
        localStorage.removeItem("krama_admin_token");
        localStorage.removeItem("krama_admin_refresh_token");
        localStorage.removeItem("krama_employer_token");
        localStorage.removeItem("krama_employer_refresh_token");
        window.location.href = "/krama/krama/ui_kits/public-website/index.html";
      }
      cand.logout().then(doLogout).catch(doLogout);
    }

    if (authLoading) return <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", color: "var(--text-muted)" }}>Loading…</div>;
    if (!authUser) return <CandidateLogin onLogin={function(u){ setAuthUser(u); }} />;

    var titles = { dashboard: "Welcome back, " + (authUser.name.split(" ")[0]), applications: "My applications", saved: "Saved jobs", recommended: "Recommended for you", following: "Companies I follow", alerts: "Job alerts", messages: "Messages", resume: "Résumé builder", profile: "Profile" };

    return (
      <div style={{ display: "flex", minHeight: "100vh", background: "var(--surface-page)" }}>
        {sidebarOpen && <div className="krm-sidebar-backdrop open" onClick={function(){ setSidebarOpen(false); }} />}
        <Sidebar page={page} onNav={setPage} user={authUser} badges={badges} open={sidebarOpen} onClose={function(){ setSidebarOpen(false); }} onLogout={handleLogout} />
        <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column" }}>
          <Topbar title={titles[page]} user={authUser} onLogout={handleLogout} onMenu={function(){ setSidebarOpen(function(o){ return !o; }); }} onNav={setPage} />
          <div style={{ flex: 1, overflowY: "auto" }}>
            {page === "dashboard"    && <Overview user={authUser} onNav={setPage} />}
            {page === "applications" && <Applications onBadgeChange={function(n){ setBadges(function(b){ return Object.assign({}, b, { applications: n }); }); }} onGoToMessages={function(){ setPage("messages"); }} />}
            {page === "saved"        && <SavedJobs onBadgeChange={function(n){ setBadges(function(b){ return Object.assign({}, b, { saved: n }); }); }} />}
            {page === "recommended"  && <Recommended />}
            {page === "following"    && <Following />}
            {page === "alerts"       && <JobAlerts />}
            {page === "messages"     && <Messages user={authUser} />}
            {page === "resume"       && <ResumeBuilder />}
            {page === "profile"      && <Profile user={authUser} onUserUpdate={function(u){ setAuthUser(u); }} />}
          </div>
        </div>
      </div>
    );
  }

  window.KramaCandidateApp = App;
})();
