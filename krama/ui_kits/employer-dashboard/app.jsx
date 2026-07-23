// Krama employer dashboard — shell + overview + jobs + applicant pipeline + billing, wired to the API.
(function init() {
  if (!window.KramaDesignSystem_1a6f65) { return setTimeout(init, 40); }
  const NS = window.KramaDesignSystem_1a6f65;
  const { Button, Badge, StatusBadge, Avatar, Card, StatCard, Tabs, EmptyState, Input, Textarea, Select, Switch } = NS;
  const emp = window.KRAMA_EMPLOYER_API;
  if (!document.getElementById('kre-css')) { var _krecss = document.createElement('style'); _krecss.id = 'kre-css'; _krecss.textContent = '.krama-rich-body:empty:before{content:attr(data-placeholder);color:var(--text-faint,#bbb);pointer-events:none;display:block}.krama-rich-body ul,.krama-rich-body ol{margin:6px 0;padding-left:22px}.krama-rich-body li{margin-bottom:3px}'; document.head.appendChild(_krecss); }

  // LucideIcon isolates lucide's DOM mutations inside a <span> React controls,
  // so re-renders never hit the removeChild error from swapped-out <i> nodes.
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

  function RichEditor({ label, value, onChange, placeholder, rows }) {
    const ref = React.useRef(null);
    React.useEffect(function() {
      if (ref.current) ref.current.innerHTML = value || "";
    }, []);
    const exec = function(cmd) { if (ref.current) ref.current.focus(); document.execCommand(cmd, false, null); };
    const tb = { border: "1px solid var(--border)", background: "var(--surface-page)", borderRadius: "var(--radius-sm)", cursor: "pointer", padding: "3px 9px", fontSize: "var(--text-xs)", fontFamily: "var(--font-sans)", color: "var(--text-body)", lineHeight: 1.5, display: "inline-flex", alignItems: "center" };
    const sep = <span style={{ display: "inline-block", width: 1, alignSelf: "stretch", background: "var(--border)", margin: "2px 2px" }} />;
    return (
      <div>
        {label && <div style={{ fontSize: "var(--text-sm)", fontWeight: 600, color: "var(--text-strong)", marginBottom: 6 }}>{label}</div>}
        <div style={{ border: "1px solid var(--border)", borderRadius: "var(--radius-md)", overflow: "hidden" }}>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 4, padding: "6px 10px", background: "var(--surface-page)", borderBottom: "1px solid var(--border)" }}>
            <button type="button" onMouseDown={function(e){e.preventDefault();exec("bold");}} style={tb} title="Bold"><strong>B</strong></button>
            <button type="button" onMouseDown={function(e){e.preventDefault();exec("italic");}} style={tb} title="Italic"><em>I</em></button>
            <button type="button" onMouseDown={function(e){e.preventDefault();exec("underline");}} style={tb} title="Underline"><span style={{textDecoration:"underline"}}>U</span></button>
            {sep}
            <button type="button" onMouseDown={function(e){e.preventDefault();exec("insertUnorderedList");}} style={tb} title="Bullet list">• Bullet list</button>
            <button type="button" onMouseDown={function(e){e.preventDefault();exec("insertOrderedList");}} style={tb} title="Numbered list">1. Numbered</button>
            {sep}
            <button type="button" onMouseDown={function(e){e.preventDefault();exec("removeFormat");}} style={tb} title="Clear formatting">Clear format</button>
          </div>
          <div
            ref={ref}
            contentEditable
            className="krama-rich-body"
            data-placeholder={placeholder || "Type here…"}
            suppressContentEditableWarning
            onInput={function(){onChange && onChange(ref.current ? ref.current.innerHTML : "");}}
            style={{ padding: "10px 12px", minHeight: (rows || 3) * 26, outline: "none", fontSize: "var(--text-sm)", color: "var(--text-body)", lineHeight: 1.65, background: "var(--surface-card)" }}
          />
        </div>
      </div>
    );
  }

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

  const NAV = [
    { id: "dashboard", label: "Dashboard", icon: "layout-dashboard" },
    { id: "jobs", label: "Job postings", icon: "briefcase" },
    { id: "applicants", label: "Applicants", icon: "users" },
    { id: "cvmatch", label: "CV Match", icon: "git-compare-arrows" },
    { id: "messages", label: "Messages", icon: "message-square" },
    { id: "team", label: "Team", icon: "user-plus", adminOnly: true },
    { id: "company", label: "Company profile", icon: "building-2", adminOnly: true },
    { id: "billing", label: "Plan & billing", icon: "credit-card", adminOnly: true },
  ];

  function isCompanyAdmin(user) {
    // Owner (no company_role set, owns a company) or explicit company_admin
    return !user || user.company_role !== "recruitment";
  }

  function Sidebar({ page, onNav, company, badges, open, onClose, user }) {
    badges = badges || {};
    return (
      <aside className={"krm-sidebar" + (open ? " open" : "")} style={{ width: 248, flexShrink: 0, background: "var(--surface-card)", borderRight: "1px solid var(--border)", display: "flex", flexDirection: "column", padding: "20px 14px", position: "sticky", top: 0, height: "100vh" }}>
        <a href="/krama/krama/ui_kits/public-website/index.html" style={{ display: "flex", alignItems: "center", gap: 10, margin: "4px 8px 22px", textDecoration: "none" }}>
          <img src={window.getKramaLogo("../../assets/krama-mark.svg")} height="36" alt="KRAMA" />
          <span style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "var(--text-lg)", letterSpacing: ".08em", color: "var(--text-strong)" }}>{window.KRAMA_BRAND_NAME || "KRAMA"}</span>
        </a>
        <nav style={{ display: "flex", flexDirection: "column", gap: 3 }}>
          {NAV.filter(function(n) { return !n.adminOnly || isCompanyAdmin(user); }).map((n) => {
            const active = page === n.id;
            return (
              <button key={n.id} onClick={() => { onNav(n.id); onClose && onClose(); }} style={{ display: "flex", alignItems: "center", gap: 11, border: "none", cursor: "pointer", padding: "10px 12px", borderRadius: "var(--radius-md)", textAlign: "left", background: active ? "var(--brand-subtle)" : "transparent", color: active ? "var(--text-brand)" : "var(--text-body)", fontFamily: "var(--font-sans)", fontWeight: active ? 700 : 500, fontSize: "var(--text-base)" }}>
                <span style={{ display: "inline-flex", color: active ? "var(--brand)" : "var(--text-muted)" }}>{I(n.icon, 19)}</span>
                <span style={{ flex: 1 }}>{n.label}</span>
                {badges[n.id] > 0 && <Badge tone={active ? "brand" : "neutral"}>{badges[n.id]}</Badge>}
              </button>
            );
          })}
        </nav>
        <div style={{ marginTop: "auto", display: "flex", alignItems: "center", gap: 10, padding: "10px 8px", borderTop: "1px solid var(--border)" }}>
          <Avatar src={company && company.logo_url} name={(company && company.name) || "Company"} square size={36} />
          <div style={{ minWidth: 0 }}>
            <div style={{ fontWeight: 700, fontSize: "var(--text-sm)", color: "var(--text-strong)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{(company && company.name) || "Company"}</div>
            {company && company.is_verified
              ? <div style={{ fontSize: "var(--text-xs)", color: "var(--success)", display: "flex", alignItems: "center", gap: 4 }}>{I("badge-check", 12)} Verified</div>
              : <div style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>Unverified</div>}
          </div>
        </div>
      </aside>
    );
  }

  function NotificationBell({ onNav }) {
    const [open, setOpen] = React.useState(false);
    const [list, setList] = React.useState([]);
    const [unread, setUnread] = React.useState(0);
    const [loading, setLoading] = React.useState(false);
    const ROUTE = { application_received: "applicants", application_stage: "applications", job_approved: "jobs", job_rejected: "jobs" };
    const ICON = { application_received: "user-plus", application_stage: "activity", job_approved: "circle-check-big", job_rejected: "circle-x", forum_reply: "message-circle", forum_mention: "at-sign" };
    const pollUnread = React.useCallback(function () { emp.fetchNotifUnread().then(function (d) { setUnread(d.count || 0); }).catch(function () {}); }, []);
    React.useEffect(function () { pollUnread(); var t = setInterval(pollUnread, 20000); return function () { clearInterval(t); }; }, [pollUnread]);
    function openPanel() {
      var next = !open; setOpen(next);
      if (next) { setLoading(true); emp.fetchNotifications().then(function (d) { setList(d.data || []); setUnread(d.unread || 0); setLoading(false); }).catch(function () { setLoading(false); }); }
    }
    function markAll() { emp.markAllNotifRead().then(function () { setList(function (l) { return l.map(function (n) { return Object.assign({}, n, { read_at: n.read_at || "x" }); }); }); setUnread(0); }).catch(function () {}); }
    function clickNotif(n) {
      if (!n.read_at) { emp.markNotifRead(n.id).then(function () { setUnread(function (u) { return Math.max(0, u - 1); }); }).catch(function () {}); }
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
        {open && <>
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
        </>}
      </div>
    );
  }

  function Topbar({ title, user, onLogout, onPost, onNav, onMenu }) {
    const [open, setOpen] = React.useState(false);
    const initials = user && user.name ? user.name.split(" ").map(w => w[0]).join("").slice(0,2).toUpperCase() : "EM";
    return (
      <header className="krm-topbar" style={{ height: 64, flexShrink: 0, borderBottom: "1px solid var(--border)", background: "var(--surface-card)", display: "flex", alignItems: "center", gap: 16, padding: "0 28px", position: "sticky", top: 0, zIndex: 10 }}>
        <button className="krm-hamburger-dash" onClick={onMenu} style={{ display: "none", alignItems: "center", justifyContent: "center", width: 36, height: 36, border: "1px solid var(--border)", borderRadius: "var(--radius-md)", background: "transparent", cursor: "pointer", color: "var(--text-muted)", flexShrink: 0 }}>{I("menu", 20)}</button>
        <h1 style={{ fontSize: "var(--text-xl)", fontWeight: 700, color: "var(--text-strong)" }}>{title}</h1>
        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 14 }}>
          <NotificationBell onNav={onNav} />
          <Button variant="primary" iconLeft={I("plus", 16)} onClick={onPost}>Post a job</Button>
          <div style={{ position: "relative" }}>
            <button onClick={() => setOpen(o => !o)} style={{ width: 38, height: 38, borderRadius: "50%", background: "var(--brand)", color: "#fff", border: "2px solid var(--border)", cursor: "pointer", fontFamily: "var(--font-sans)", fontWeight: 700, fontSize: 14, display: "inline-flex", alignItems: "center", justifyContent: "center", overflow: "hidden", padding: 0 }}>
              {user && user.avatar_url
                ? <img src={user.avatar_url} alt={initials} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                : initials}
            </button>
            {open && <>
              <div onClick={() => setOpen(false)} style={{ position: "fixed", inset: 0, zIndex: 99 }} />
              <div onClick={e => e.stopPropagation()} style={{ position: "absolute", top: 46, right: 0, minWidth: 200, background: "var(--surface-card)", border: "1px solid var(--border)", borderRadius: "var(--radius-md)", boxShadow: "var(--shadow-lg)", zIndex: 100, padding: "6px 0", overflow: "hidden" }}>
                <div style={{ padding: "10px 14px 8px", borderBottom: "1px solid var(--border)" }}>
                  <div style={{ fontWeight: 700, fontSize: "var(--text-sm)", color: "var(--text-strong)" }}>{user ? user.name : "Employer"}</div>
                  <div style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>{user ? user.email : ""}</div>
                </div>
                <button onClick={() => { setOpen(false); onNav && onNav("profile"); }} style={{ display: "block", width: "100%", textAlign: "left", border: "none", background: "transparent", padding: "9px 14px", cursor: "pointer", fontFamily: "var(--font-sans)", fontSize: "var(--text-sm)", color: "var(--text-body)" }}>My Profile</button>
                <div style={{ borderTop: "1px solid var(--border)", marginTop: 4 }}>
                  <button onClick={() => { setOpen(false); onLogout && onLogout(); }} style={{ display: "block", width: "100%", textAlign: "left", border: "none", background: "transparent", padding: "9px 14px", cursor: "pointer", fontFamily: "var(--font-sans)", fontSize: "var(--text-sm)", color: "var(--danger)" }}>Sign out</button>
                </div>
              </div>
            </>}
          </div>
        </div>
      </header>
    );
  }

  function MyProfile({ user, onUserUpdate }) {
    const [name, setName] = React.useState(user ? user.name || "" : "");
    const [phone, setPhone] = React.useState(user ? user.phone || "" : "");
    const [bio, setBio] = React.useState(user ? user.bio || "" : "");
    const [allowMsgs, setAllowMsgs] = React.useState(user ? !!user.allow_candidate_messages : false);
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
      emp.changePassword(curPwd, newPwd).then(() => {
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
      compressImage(file, 400, 0.82).then(compressed => emp.uploadAvatar(compressed)).then(u => {
        setPreview(u.avatar_url || "");
        if (onUserUpdate) onUserUpdate(u);
        setUploading(false); setSaved(true);
      }).catch(err => { alert(err.message || "Upload failed."); setUploading(false); });
    }

    function save() {
      setBusy(true); setSaved(false);
      emp.updateMe({ name, phone, bio, allow_candidate_messages: allowMsgs }).then(u => {
        if (onUserUpdate) onUserUpdate(u);
        setSaved(true); setBusy(false);
      }).catch(err => { alert(err.message || "Save failed."); setBusy(false); });
    }

    // ── Telegram alerts (deep-link connect flow) ──
    const [tgConnected, setTgConnected] = React.useState(false);
    const [tgBusy, setTgBusy] = React.useState(false);
    const [tgMsg, setTgMsg] = React.useState(null);
    const tgPollRef = React.useRef(null);
    React.useEffect(function () {
      emp.telegramStatus().then(function (d) { setTgConnected(!!(d && d.connected)); }).catch(function () {});
      return function () { if (tgPollRef.current) clearInterval(tgPollRef.current); };
    }, []);
    function tgConnect() {
      setTgBusy(true); setTgMsg(null);
      emp.telegramLink().then(function (d) {
        if (!d || !d.url) { setTgBusy(false); setTgMsg({ ok: false, text: "Telegram isn't set up yet — ask the administrator to enable it." }); return; }
        window.open(d.url, "_blank");
        setTgMsg({ ok: true, text: "Opening Telegram… press Start in the bot, then come back here." });
        var tries = 0;
        if (tgPollRef.current) clearInterval(tgPollRef.current);
        tgPollRef.current = setInterval(function () {
          tries++;
          emp.telegramStatus().then(function (s) {
            if (s && s.connected) {
              clearInterval(tgPollRef.current); tgPollRef.current = null;
              setTgConnected(true); setTgBusy(false); setTgMsg({ ok: true, text: "Connected! You'll get a Telegram message when a candidate applies." });
            } else if (tries >= 40) {
              clearInterval(tgPollRef.current); tgPollRef.current = null;
              setTgBusy(false); setTgMsg({ ok: false, text: "Didn't detect a connection yet. Make sure you pressed Start in the bot, then try again." });
            }
          }).catch(function () {});
        }, 3000);
      }).catch(function (e) { setTgBusy(false); setTgMsg({ ok: false, text: (e && e.message) || "Could not start connection." }); });
    }
    function tgDisconnect() {
      setTgBusy(true);
      emp.telegramUnlink().then(function () { setTgConnected(false); setTgBusy(false); setTgMsg(null); }).catch(function () { setTgBusy(false); });
    }
    function tgTest() {
      setTgMsg(null);
      emp.telegramTest().then(function () { setTgMsg({ ok: true, text: "Test message sent — check your Telegram." }); }).catch(function (e) { setTgMsg({ ok: false, text: (e && e.message) || "Test failed." }); });
    }

    return (
      <div className="krm-page-pad" style={{ padding: 28, maxWidth: 720 }}>
        <ScreenHead title="My Profile" sub="Update your personal information and photo." />
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
              <Button variant="ghost" size="sm" style={{ marginTop: 8, paddingLeft: 0 }} onClick={() => fileRef.current && fileRef.current.click()} disabled={uploading}>{uploading ? "Uploading…" : "Change photo"}</Button>
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <Input label="Full name" value={name} onChange={e => setName(e.target.value)} />
            <div className="krm-form-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <Input label="Email" value={user ? user.email : ""} disabled iconLeft={I("mail", 16)} />
              <Input label="Phone" value={phone} onChange={e => setPhone(e.target.value)} iconLeft={I("phone", 16)} />
            </div>
            <Textarea label="Bio / Description" value={bio} onChange={e => setBio(e.target.value)} rows={4} placeholder="Tell candidates a bit about yourself…" />
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, padding: "14px 16px", border: "1px solid var(--border)", borderRadius: "var(--radius-md)", background: "var(--surface-sunken, var(--surface-page))" }}>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontWeight: 600, fontSize: "var(--text-sm)", color: "var(--text-strong)" }}>Allow candidates to message me directly</div>
                <div style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)", marginTop: 3 }}>When off, only you can start a conversation. When on, any candidate who applied can message you first.</div>
              </div>
              <Switch checked={allowMsgs} onChange={(v) => setAllowMsgs(typeof v === "boolean" ? v : !allowMsgs)} />
            </div>
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
        <Card padding={24} style={{ marginTop: 20 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
            <h3 style={{ fontSize: "var(--text-base)", fontWeight: 700, color: "var(--text-strong)", margin: 0 }}>Telegram alerts</h3>
            <span style={{ fontSize: 11, fontWeight: 700, padding: "2px 9px", borderRadius: 999, background: tgConnected ? "var(--success-subtle, #e6f6ee)" : "var(--surface-sunken, var(--surface-page))", color: tgConnected ? "var(--success)" : "var(--text-muted)", border: "1px solid var(--border)" }}>{tgConnected ? "Connected" : "Not connected"}</span>
          </div>
          <p style={{ fontSize: "var(--text-sm)", color: "var(--text-muted)", marginBottom: 16 }}>Get an instant Telegram message whenever a candidate applies to one of your jobs. Click connect, press <b>Start</b> in the bot, and you're done — no codes to copy.</p>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            {!tgConnected && <Button variant="primary" iconLeft={I("send", 15)} disabled={tgBusy} onClick={tgConnect}>{tgBusy ? "Waiting for Telegram…" : "Connect Telegram"}</Button>}
            {tgConnected && <Button variant="outline" iconLeft={I("send", 15)} onClick={tgTest}>Send test</Button>}
            {tgConnected && <Button variant="ghost" onClick={tgDisconnect} disabled={tgBusy}>Disconnect</Button>}
          </div>
          {tgMsg && <div style={{ marginTop: 12, fontSize: "var(--text-sm)", color: tgMsg.ok ? "var(--success)" : "var(--danger)", fontWeight: 600 }}>{tgMsg.text}</div>}
        </Card>
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

  function EmployerLogin({ onLogin }) {
    const [email, setEmail] = React.useState("");
    const [password, setPassword] = React.useState("");
    const [error, setError] = React.useState("");
    const [loading, setLoading] = React.useState(false);
    const submit = () => {
      setError(""); setLoading(true);
      emp.login(email, password)
        .then(function (u) { setLoading(false); onLogin(u); })
        .catch(function (e) { setLoading(false); setError((e && e.message) || "Login failed."); });
    };
    const onKey = (e) => { if (e.key === "Enter") submit(); };
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--surface-page)" }}>
        <div style={{ width: "100%", maxWidth: 380, background: "var(--surface-card)", borderRadius: "var(--radius-xl)", boxShadow: "var(--shadow-xl)", padding: 36 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 24 }}>
            <img src={window.getKramaLogo("../../assets/krama-mark.svg")} height="40" alt="KRAMA" />
            <span style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "var(--text-xl)", letterSpacing: ".08em", color: "var(--text-strong)" }}>{window.KRAMA_BRAND_NAME || "KRAMA"}</span>
          </div>
          <h1 style={{ fontSize: "var(--text-2xl)", fontWeight: 700, color: "var(--text-strong)", marginBottom: 6 }}>Employer login</h1>
          <p style={{ fontSize: "var(--text-sm)", color: "var(--text-muted)", marginBottom: 22 }}>Manage your jobs and applicants.</p>
          {error && <div style={{ padding: "10px 14px", background: "var(--danger-subtle)", color: "var(--danger)", borderRadius: "var(--radius-md)", fontSize: "var(--text-sm)", marginBottom: 16 }}>{error}</div>}
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} onKeyDown={onKey} placeholder="hr@company.com" />
            <Input label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} onKeyDown={onKey} placeholder="••••••••" />
            <Button variant="primary" block onClick={submit} disabled={loading}>{loading ? "Signing in…" : "Sign in"}</Button>
          </div>
        </div>
      </div>
    );
  }

  const JOB_TYPE_LABELS = { full_time: "Full-time", part_time: "Part-time", contract: "Contract", internship: "Internship", temporary: "Temporary" };

  function Overview({ jobs, loading, onNav }) {
    const active = jobs.filter((j) => j.status === "published").length;
    const pending = jobs.filter((j) => j.status === "company_pending").length;
    const totalApps = jobs.reduce((s, j) => s + (j.applications_count || 0), 0);
    const totalViews = jobs.reduce((s, j) => s + (j.views || 0), 0);
    const fmtDate = (iso) => { if (!iso) return "—"; var d = new Date(iso); return d.getDate() + " " + ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"][d.getMonth()]; };
    const recent = jobs.slice(0, 6);
    return (
      <div className="krm-page-pad" style={{ padding: 28, display: "flex", flexDirection: "column", gap: 24 }}>
        <div className="krm-stats-grid" style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16 }}>
          <StatCard label="Active jobs" value={loading ? "—" : String(active)} tone="brand" icon={I("briefcase", 22)} />
          <StatCard label="Pending approval" value={loading ? "—" : String(pending)} tone="warning" icon={I("clock", 22)} />
          <StatCard label="Total applications" value={loading ? "—" : String(totalApps)} tone="info" icon={I("users", 22)} />
          <StatCard label="Total job views" value={loading ? "—" : totalViews.toLocaleString()} tone="success" icon={I("eye", 22)} />
        </div>

        <div className="krm-table-wrap"><Card padding={0}>
          <div style={{ padding: "18px 22px", borderBottom: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h2 style={{ fontSize: "var(--text-lg)", fontWeight: 700, color: "var(--text-strong)" }}>Your job postings</h2>
            <Button variant="ghost" size="sm" iconRight={I("arrow-right", 14)} onClick={() => onNav("jobs")}>Manage jobs</Button>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1.6fr 1fr 0.7fr 0.7fr 0.8fr", padding: "10px 22px", fontSize: "var(--text-xs)", fontWeight: 700, letterSpacing: ".04em", textTransform: "uppercase", color: "var(--text-faint)", borderBottom: "1px solid var(--border-subtle)" }}>
            <span>Job title</span><span>Status</span><span>Applicants</span><span>Views</span><span>Posted</span>
          </div>
          {loading && <div style={{ padding: "26px 22px", color: "var(--text-muted)", fontSize: "var(--text-sm)", textAlign: "center" }}>Loading…</div>}
          {!loading && recent.length === 0 && <div style={{ padding: "26px 22px", color: "var(--text-muted)", fontSize: "var(--text-sm)", textAlign: "center" }}>No jobs yet. Click “Post a job” to create your first listing.</div>}
          {!loading && recent.map((j, i) => (
            <div key={j.id} style={{ display: "grid", gridTemplateColumns: "1.6fr 1fr 0.7fr 0.7fr 0.8fr", alignItems: "center", padding: "14px 22px", borderBottom: i < recent.length - 1 ? "1px solid var(--border-subtle)" : "none" }}>
              <span style={{ fontWeight: 600, color: "var(--text-strong)" }}>{j.title}</span>
              <span><StatusBadge status={j.status} /></span>
              <span style={{ fontFamily: "var(--font-mono)", fontSize: "var(--text-sm)", color: "var(--text-body)" }}>{j.applications_count || 0}</span>
              <span style={{ fontFamily: "var(--font-mono)", fontSize: "var(--text-sm)", color: "var(--text-body)" }}>{j.views || 0}</span>
              <span style={{ fontSize: "var(--text-sm)", color: "var(--text-muted)" }}>{fmtDate(j.created_at)}</span>
            </div>
          ))}
        </Card></div>
      </div>
    );
  }

  function JobFormModal({ open, mode, job, onClose, onCreated, onPublishRequest, user }) {
    const BLANK = { title: "", job_type: "full_time", experience_level: "mid", category_id: "", location_id: "", salary_min: "", salary_max: "", salary_currency: "USD", salary_period: "month", is_remote: false, description: "", requirements: "", benefits: "", expires_at: "", share_social: true, social_image: "" };
    function jobToForm(j, isClone) {
      var _today = new Date(); _today.setHours(0, 0, 0, 0);
      var _rawExp = j.expires_at ? j.expires_at.split("T")[0] : "";
      var _exp = (!isClone && _rawExp && new Date(_rawExp) > _today) ? _rawExp : "";
      return { title: isClone ? "Copy of " + (j.title || "") : (j.title || ""), job_type: j.job_type || "full_time", experience_level: j.experience_level || "mid", category_id: j.category_id ? String(j.category_id) : "", location_id: j.location_id ? String(j.location_id) : "", salary_min: j.salary_min != null ? String(j.salary_min) : "", salary_max: j.salary_max != null ? String(j.salary_max) : "", salary_currency: j.salary_currency || "USD", salary_period: j.salary_period || "month", is_remote: !!j.is_remote, description: j.description || "", requirements: j.requirements || "", benefits: j.benefits || "", expires_at: _exp, share_social: j.share_social !== undefined ? !!j.share_social : true, social_image: j.social_image || "" };
    }
    const [form, setForm] = React.useState(BLANK);
    const [cats, setCats] = React.useState([]);
    const [locs, setLocs] = React.useState([]);
    const [expLevels, setExpLevels] = React.useState([]);
    const [error, setError] = React.useState("");
    const [saving, setSaving] = React.useState(false);
    const [resetKey, setResetKey] = React.useState(0);
    const [socialUploading, setSocialUploading] = React.useState(false);
    React.useEffect(function () {
      if (!open) return;
      setForm(job && (mode === "edit" || mode === "clone") ? jobToForm(job, mode === "clone") : BLANK);
      setResetKey(function(k) { return k + 1; });
      setError(""); setSaving(false);
      emp.fetchCategories().then(setCats).catch(function () {});
      emp.fetchLocations().then(setLocs).catch(function () {});
      emp.fetchExperienceLevels().then(setExpLevels).catch(function () {});
    }, [open]);
    if (!open) return null;
    const set = (k, v) => setForm((f) => Object.assign({}, f, { [k]: v }));
    const onSocialImage = (e) => {
      var file = e.target.files && e.target.files[0]; e.target.value = "";
      if (!file) return;
      setSocialUploading(true); setError("");
      emp.uploadJobImage(file)
        .then(function (url) { set("social_image", url); setSocialUploading(false); })
        .catch(function (err) { setSocialUploading(false); setError((err && err.message) || "Image upload failed."); });
    };
    const isEdit = mode === "edit";
    const canSubmit = !isEdit || (job && (job.status === "draft" || job.status === "rejected"));
    const modalTitle = isEdit ? "Edit job" : mode === "clone" ? "Clone job" : "Post a job";
    const isRecruiter = user && user.company_role === "recruitment";
    const submitLabel = isRecruiter ? "Submit for approval" : "Publish job";

    const submit = (publish) => {
      if (!form.title.trim()) { setError("Job title is required."); return; }
      if (form.salary_min && form.salary_max && Number(form.salary_max) < Number(form.salary_min)) { setError("Max salary must be greater than or equal to min salary."); return; }
      setError(""); setSaving(true);
      var payload = {
        title: form.title.trim(),
        job_type: form.job_type,
        experience_level: form.experience_level || null,
        category_id: form.category_id || null,
        location_id: form.location_id || null,
        salary_min: form.salary_min ? Number(form.salary_min) : null,
        salary_max: form.salary_max ? Number(form.salary_max) : null,
        salary_currency: form.salary_currency || null,
        salary_period: form.salary_period || null,
        is_remote: !!form.is_remote,
        share_social: !!form.share_social,
        social_image: form.social_image || null,
        description: form.description || null,
        requirements: form.requirements || null,
        benefits: form.benefits || null,
        expires_at: form.expires_at || null,
      };
      var wantsPublish = publish && (!isEdit || canSubmit);

      // Save (create or update), resolving to the job id.
      var savePromise = isEdit
        ? emp.updateJob(job.id, payload).then(function () { return job.id; })
        : emp.createJob(payload).then(function (newJob) { return newJob.id; });

      savePromise.then(function (jobId) {
        // Company admin publishing → hand off to the plan picker (publishes directly if only one plan).
        if (wantsPublish && !isRecruiter && onPublishRequest) {
          setSaving(false); onClose();
          onPublishRequest(jobId, "Job published!");
          return;
        }
        // Recruiter publishing → submit for company approval (no slot consumed yet).
        if (wantsPublish && isRecruiter) {
          return emp.submitJob(jobId).then(function () { setSaving(false); onCreated("Job submitted for company approval."); onClose(); });
        }
        // Draft save, or edit without publishing.
        setSaving(false); onCreated(isEdit ? "Job updated." : "Draft saved."); onClose();
      }).catch(function (e) { setSaving(false); setError((e && e.message) || "Could not save job."); });
    };

    return (
      <div onClick={onClose} style={{ position: "fixed", inset: 0, zIndex: 200, background: "var(--surface-overlay)", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
        <div onClick={(e) => e.stopPropagation()} style={{ width: "100%", maxWidth: 560, background: "var(--surface-card)", borderRadius: "var(--radius-xl)", boxShadow: "var(--shadow-xl)", overflow: "hidden" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "18px 22px", borderBottom: "1px solid var(--border)" }}>
            <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "var(--text-lg)", color: "var(--text-strong)" }}>{modalTitle}</div>
            <button onClick={onClose} aria-label="Close" style={{ border: "none", background: "transparent", cursor: "pointer", color: "var(--text-muted)", display: "inline-flex" }}>{I("x", 18)}</button>
          </div>
          <div style={{ padding: 22, display: "flex", flexDirection: "column", gap: 16, maxHeight: "68vh", overflowY: "auto" }}>
            <Input label="Job title" value={form.title} onChange={(e) => set("title", e.target.value)} placeholder="e.g. Senior Accountant" />
            <div className="krm-form-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <Select label="Job type" value={form.job_type} onChange={(e) => set("job_type", e.target.value)}
                options={Object.keys(JOB_TYPE_LABELS).map((k) => ({ value: k, label: JOB_TYPE_LABELS[k] }))} />
              <Select label="Experience level" value={form.experience_level} onChange={(e) => set("experience_level", e.target.value)}
                options={[{ value: "", label: "— Select —" }].concat(expLevels.map(function(l) { return { value: l.slug, label: l.name }; }))} />
            </div>
            <div className="krm-form-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <Select label="Category" value={form.category_id} onChange={(e) => set("category_id", e.target.value)}
                options={[{ value: "", label: "— Select —" }].concat(cats.map((c) => ({ value: String(c.id), label: c.name })))} />
              <Select label="Location" value={form.location_id} onChange={(e) => set("location_id", e.target.value)}
                options={[{ value: "", label: "— Select —" }].concat(locs.map((l) => ({ value: String(l.id), label: l.name })))} />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: 12 }}>
              <Input label="Salary min" type="number" value={form.salary_min} onChange={(e) => set("salary_min", e.target.value)} placeholder="800" />
              <Input label="Salary max" type="number" value={form.salary_max} onChange={(e) => set("salary_max", e.target.value)} placeholder="1500" />
              <Select label="Currency" value={form.salary_currency} onChange={(e) => set("salary_currency", e.target.value)}
                options={[{ value: "USD", label: "USD" }, { value: "KHR", label: "KHR" }]} />
              <Select label="Per" value={form.salary_period} onChange={(e) => set("salary_period", e.target.value)}
                options={[{ value: "hour", label: "Hour" }, { value: "day", label: "Day" }, { value: "month", label: "Month" }, { value: "year", label: "Year" }]} />
            </div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 14px", border: "1px solid var(--border)", borderRadius: "var(--radius-md)" }}>
              <div>
                <div style={{ fontSize: "var(--text-sm)", fontWeight: 600, color: "var(--text-strong)" }}>Remote-friendly</div>
                <div style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>Candidates can work remotely.</div>
              </div>
              <Switch checked={form.is_remote} onChange={(v) => set("is_remote", typeof v === "boolean" ? v : !form.is_remote)} />
            </div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 14px", border: "1px solid var(--border)", borderRadius: "var(--radius-md)" }}>
              <div>
                <div style={{ fontSize: "var(--text-sm)", fontWeight: 600, color: "var(--text-strong)" }}>Share on social media</div>
                <div style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>Auto-post this job to our social channels when it's published.</div>
              </div>
              <Switch checked={form.share_social} onChange={(v) => set("share_social", typeof v === "boolean" ? v : !form.share_social)} />
            </div>
            {form.share_social && (
              <div style={{ padding: "12px 14px", border: "1px solid var(--border)", borderRadius: "var(--radius-md)" }}>
                <div style={{ fontSize: "var(--text-sm)", fontWeight: 600, color: "var(--text-strong)", marginBottom: 4 }}>Banner image for the social post <span style={{ fontWeight: 400, color: "var(--text-muted)" }}>(optional)</span></div>
                <div style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)", marginBottom: 10 }}>A hiring poster shared with the job (recommended ~1200 × 630). Without one, a text-only post is shared.</div>
                <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                  {form.social_image
                    ? <img src={form.social_image} alt="Banner preview" style={{ width: 132, height: 69, objectFit: "cover", borderRadius: "var(--radius-sm)", border: "1px solid var(--border)", flexShrink: 0 }} />
                    : <div style={{ width: 132, height: 69, borderRadius: "var(--radius-sm)", border: "1px dashed var(--border-strong)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-faint)", flexShrink: 0 }}>{I("image", 22)}</div>}
                  <div style={{ display: "flex", flexDirection: "column", gap: 8, alignItems: "flex-start" }}>
                    <label style={{ display: "inline-flex", alignItems: "center", gap: 6, cursor: socialUploading ? "not-allowed" : "pointer", opacity: socialUploading ? 0.5 : 1, fontFamily: "var(--font-sans)", fontWeight: 600, color: "var(--text-brand)", fontSize: "var(--text-sm)" }}>
                      {I("upload", 14)} {socialUploading ? "Uploading…" : (form.social_image ? "Replace image" : "Upload image")}
                      <input type="file" accept="image/*" disabled={socialUploading} onChange={onSocialImage} style={{ display: "none" }} />
                    </label>
                    {form.social_image && <button type="button" onClick={() => set("social_image", "")} style={{ border: "none", background: "transparent", cursor: "pointer", color: "var(--danger)", fontSize: "var(--text-xs)", fontWeight: 600, padding: 0 }}>Remove</button>}
                  </div>
                </div>
              </div>
            )}
            <RichEditor key={"d" + resetKey} label="Description" rows={4} value={form.description} onChange={(v) => set("description", v)} placeholder="Describe the role and what the team does…" />
            <RichEditor key={"r" + resetKey} label="Requirements" rows={3} value={form.requirements} onChange={(v) => set("requirements", v)} placeholder="Skills, qualifications, experience…" />
            <RichEditor key={"b" + resetKey} label="Benefits" rows={3} value={form.benefits} onChange={(v) => set("benefits", v)} placeholder="Perks, insurance, bonuses…" />
            <Input label="Application deadline" type="date" value={form.expires_at} onChange={(e) => set("expires_at", e.target.value)} />
            {error && <div style={{ padding: "10px 14px", background: "var(--danger-subtle)", color: "var(--danger)", borderRadius: "var(--radius-md)", fontSize: "var(--text-sm)" }}>{error}</div>}
          </div>
          <div style={{ display: "flex", gap: 10, padding: "16px 22px", borderTop: "1px solid var(--border)" }}>
            <Button variant="ghost" onClick={onClose} style={{ flex: 1 }}>Cancel</Button>
            <Button variant="secondary" onClick={() => submit(false)} disabled={saving} style={{ flex: 1 }}>{isEdit ? "Save changes" : "Save draft"}</Button>
            {canSubmit && <Button variant="primary" onClick={() => submit(true)} disabled={saving} style={{ flex: 1 }}>{saving ? "Saving…" : submitLabel}</Button>}
          </div>
        </div>
      </div>
    );
  }

  function JobViewModal({ job, onClose }) {
    if (!job) return null;
    const JTL = { full_time: "Full-time", part_time: "Part-time", contract: "Contract", freelance: "Freelance", internship: "Internship" };
    const fmtDate = (iso) => { if (!iso) return "—"; var d = new Date(iso); return ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"][d.getMonth()] + " " + d.getDate() + ", " + d.getFullYear(); };
    const fmtSalary = (j) => { if (!j.salary_min && !j.salary_max) return "—"; var cur = j.salary_currency || "USD"; var per = j.salary_period || "month"; var range = j.salary_min && j.salary_max ? j.salary_min + " – " + j.salary_max : (j.salary_min || j.salary_max); return cur + " " + range + " / " + per; };
    const Row = ({ label, value }) => value ? (<div style={{ display: "flex", gap: 8, marginBottom: 10 }}><span style={{ minWidth: 130, fontSize: "var(--text-sm)", color: "var(--text-muted)", fontWeight: 600 }}>{label}</span><span style={{ fontSize: "var(--text-sm)", color: "var(--text-body)" }}>{value}</span></div>) : null;
    const Section = ({ title, text }) => text ? (<div style={{ marginTop: 18 }}><div style={{ fontSize: "var(--text-sm)", fontWeight: 700, color: "var(--text-strong)", marginBottom: 6 }}>{title}</div><div className="krama-rich-body" style={{ fontSize: "var(--text-sm)", color: "var(--text-body)", lineHeight: 1.65 }} dangerouslySetInnerHTML={{ __html: text }} /></div>) : null;
    return (
      <div onClick={onClose} style={{ position: "fixed", inset: 0, zIndex: 200, background: "var(--surface-overlay)", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
        <div onClick={(e) => e.stopPropagation()} style={{ width: "100%", maxWidth: 580, background: "var(--surface-card)", borderRadius: "var(--radius-xl)", boxShadow: "var(--shadow-xl)", overflow: "hidden" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "18px 22px", borderBottom: "1px solid var(--border)" }}>
            <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "var(--text-lg)", color: "var(--text-strong)" }}>{job.title}</div>
            <button onClick={onClose} aria-label="Close" style={{ border: "none", background: "transparent", cursor: "pointer", color: "var(--text-muted)", display: "inline-flex" }}>{I("x", 18)}</button>
          </div>
          <div style={{ padding: "20px 22px", maxHeight: "70vh", overflowY: "auto" }}>
            <div style={{ marginBottom: 12 }}><StatusBadge status={job.status} /></div>
            <Row label="Job type" value={JTL[job.job_type] || job.job_type} />
            <Row label="Salary" value={fmtSalary(job)} />
            <Row label="Remote" value={job.is_remote ? "Yes" : "No"} />
            <Row label="Posted" value={fmtDate(job.created_at)} />
            <Row label="Deadline" value={fmtDate(job.expires_at)} />
            <Row label="Applicants" value={String(job.applications_count || 0)} />
            <Row label="Views" value={String(job.views || 0)} />
            <Section title="Description" text={job.description} />
            <Section title="Requirements" text={job.requirements} />
            <Section title="Benefits" text={job.benefits} />
          </div>
          <div style={{ padding: "14px 22px", borderTop: "1px solid var(--border)", display: "flex", justifyContent: "flex-end" }}>
            <Button variant="secondary" onClick={onClose}>Close</Button>
          </div>
        </div>
      </div>
    );
  }

  // Reusable client-side pager — shows "Showing X–Y of Z" + Previous/Next.
  // Hidden while everything fits on one page, so it only appears once lists grow.
  function Pager({ page, perPage, total, onPage, label }) {
    const pages = Math.max(1, Math.ceil(total / perPage));
    const safe = Math.min(Math.max(1, page), pages);
    if (total <= perPage) return null;
    const from = total === 0 ? 0 : (safe - 1) * perPage + 1;
    const to = Math.min(total, safe * perPage);
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 22px", borderTop: "1px solid var(--border-subtle)", flexWrap: "wrap", gap: 10 }}>
        <span style={{ fontSize: "var(--text-sm)", color: "var(--text-muted)" }}>Showing {from}–{to} of {total}{label ? " " + label : ""}</span>
        <div style={{ display: "flex", gap: 8 }}>
          <Button variant="secondary" size="sm" disabled={safe <= 1} onClick={() => onPage(safe - 1)}>Previous</Button>
          <Button variant="secondary" size="sm" disabled={safe >= pages} onClick={() => onPage(safe + 1)}>Next</Button>
        </div>
      </div>
    );
  }

  function JobsManage({ jobs, loading, reload, onPost, onPublish, sub, quota, onBilling, onView, onEdit, onClone, user }) {
    const [tab, setTab] = React.useState("all");
    const [msg, setMsg] = React.useState("");
    const [rejectModal, setRejectModal] = React.useState(null);
    const [rejectReason, setRejectReason] = React.useState("");
    const [boostTarget, setBoostTarget] = React.useState(null);
    const flash = (m) => { setMsg(m); setTimeout(() => setMsg(""), 3000); };
    const fmtDate = (iso) => { if (!iso) return "—"; var d = new Date(iso); return d.getDate() + " " + ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"][d.getMonth()]; };
    const featuredDaysLeft = (j) => { if (!j.featured_until) return null; var ms = new Date(j.featured_until) - new Date(); return ms > 0 ? Math.ceil(ms / 86400000) : null; };
    const subActive = sub && sub.plan && (sub.status === "active" || sub.status === "trial");
    const q = quota || { used: 0, remaining: null, limit: null };
    const quotaFull = q.limit !== null && q.remaining <= 0;
    const isAdmin = isCompanyAdmin(user);
    const isRecruiter = user && user.company_role === "recruitment";

    const [page, setPage] = React.useState(1);
    React.useEffect(function () { setPage(1); }, [tab]);
    const JOBS_PER = 10;

    const counts = { all: jobs.length };
    ["published", "company_pending", "draft", "rejected", "closed"].forEach((s) => { counts[s] = jobs.filter((j) => j.status === s).length; });
    const filtered = tab === "all" ? jobs : jobs.filter((j) => j.status === tab);
    const pageSafe = Math.min(Math.max(1, page), Math.max(1, Math.ceil(filtered.length / JOBS_PER)));
    const shown = filtered.slice((pageSafe - 1) * JOBS_PER, pageSafe * JOBS_PER);

    const act = (fn, m) => fn().then(function () { flash(m); reload(); }).catch(function (e) { flash("Error: " + (e && e.message)); });
    const del = (j) => { if (window.confirm('Delete "' + j.title + '"? This cannot be undone.')) act(() => emp.deleteJob(j.id), "Job deleted."); };
    const doCompanyReject = () => {
      if (!rejectReason.trim()) return;
      act(() => emp.companyRejectJob(rejectModal.id, rejectReason), "Job rejected.");
      setRejectModal(null); setRejectReason("");
    };

    return (
      <div className="krm-page-pad" style={{ padding: 28 }}>
        <ScreenHead title="Job postings" sub="Create, submit, close, and remove your listings."
          action={subActive && q.limit !== null ? (
            <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: "var(--text-sm)", color: quotaFull ? "var(--danger)" : q.used / q.limit > 0.8 ? "var(--warning, #b45309)" : "var(--text-muted)" }}>
              {I(quotaFull ? "alert-circle" : "bar-chart-2", 15)}
              <span style={{ fontWeight: 600 }}>{q.used}/{q.limit} posts used</span>
              {q.remaining !== null && !quotaFull && <span>· {q.remaining} remaining</span>}
            </div>
          ) : null}
        />
        {sub !== undefined && !subActive && (
          sub && sub.plan && sub.status === "pending"
            ? (
              <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 16px", background: "var(--warning-subtle)", border: "1px solid var(--warning-border, #fcd34d)", borderRadius: "var(--radius-md)", color: "var(--warning, #b45309)", fontWeight: 600, fontSize: "var(--text-sm)", marginBottom: 18 }}>
                {I("clock", 16)}
                <span>Payment pending admin confirmation. Job posting will be unlocked once your subscription is activated.</span>
              </div>
            ) : (
              <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 16px", background: "var(--danger-subtle)", border: "1px solid var(--danger-border, #fca5a5)", borderRadius: "var(--radius-md)", color: "var(--danger)", fontWeight: 600, fontSize: "var(--text-sm)", marginBottom: 18 }}>
                {I("alert-circle", 16)}
                <span>{sub && sub.plan ? "Your subscription has expired. Jobs are hidden from the public website." : "No active subscription."} Job posting requires an active plan.{" "}
                  <button onClick={onBilling} style={{ background: "none", border: "none", color: "inherit", fontWeight: 700, cursor: "pointer", textDecoration: "underline", fontFamily: "var(--font-sans)", fontSize: "inherit", padding: 0 }}>Subscribe now →</button>
                </span>
              </div>
            )
        )}
        {subActive && quotaFull && (
          <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 16px", background: "var(--danger-subtle)", border: "1px solid var(--danger-border, #fca5a5)", borderRadius: "var(--radius-md)", color: "var(--danger)", fontWeight: 600, fontSize: "var(--text-sm)", marginBottom: 18 }}>
            {I("alert-circle", 16)}
            <span>Job post limit reached ({q.used}/{q.limit}). Close or delete an existing job, or{" "}
              <button onClick={onBilling} style={{ background: "none", border: "none", color: "inherit", fontWeight: 700, cursor: "pointer", textDecoration: "underline", fontFamily: "var(--font-sans)", fontSize: "inherit", padding: 0 }}>upgrade your plan →</button>
            </span>
          </div>
        )}
        <Tabs value={tab} onChange={setTab} tabs={[
          { value: "all", label: "All", count: counts.all },
          { value: "published", label: "Published", count: counts.published },
          { value: "company_pending", label: isAdmin ? "Needs approval" : "Awaiting review", count: counts.company_pending },
          { value: "draft", label: "Draft", count: counts.draft },
          { value: "rejected", label: "Rejected", count: counts.rejected },
          { value: "closed", label: "Closed", count: counts.closed },
        ]} style={{ marginBottom: 18 }} />
        {msg && <div style={{ padding: "10px 14px", background: "var(--success-subtle)", color: "var(--success)", borderRadius: "var(--radius-md)", marginBottom: 14, fontWeight: 600, fontSize: "var(--text-sm)" }}>{msg}</div>}
        <div className="krm-table-wrap"><Card padding={0}>
          <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1.6fr) 130px 96px 80px 96px 264px", padding: "10px 22px", fontSize: "var(--text-xs)", fontWeight: 700, letterSpacing: ".04em", textTransform: "uppercase", color: "var(--text-faint)", borderBottom: "1px solid var(--border-subtle)" }}>
            <span>Job title</span><span>Status</span><span>Applicants</span><span>Views</span><span>Posted</span><span style={{ textAlign: "right" }}>Actions</span>
          </div>
          {loading && <div style={{ padding: "26px 22px", color: "var(--text-muted)", fontSize: "var(--text-sm)", textAlign: "center" }}>Loading…</div>}
          {!loading && filtered.length === 0 && <div style={{ padding: "26px 22px", color: "var(--text-muted)", fontSize: "var(--text-sm)", textAlign: "center" }}>No jobs in this tab.</div>}
          {!loading && shown.map((j, i) => (
            <div key={j.id} style={{ display: "grid", gridTemplateColumns: "minmax(0,1.6fr) 130px 96px 80px 96px 264px", alignItems: "center", padding: "14px 22px", borderBottom: i < shown.length - 1 ? "1px solid var(--border-subtle)" : "none" }}>
              <div style={{ minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0 }}>
                  <span style={{ fontWeight: 600, color: "var(--text-strong)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", minWidth: 0 }}>{j.title}</span>
                  {j.is_featured ? <span style={{ flexShrink: 0 }}><Badge tone="accent">{I("star", 11)} Featured{featuredDaysLeft(j) != null ? " · " + featuredDaysLeft(j) + "d left" : ""}</Badge></span> : null}
                </div>
                {isAdmin && j.poster && j.poster.company_role === "recruitment" && (
                  <div style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)", marginTop: 2, display: "flex", alignItems: "center", gap: 4 }}>
                    {I("user", 11)} {j.poster.name}
                  </div>
                )}
              </div>
              <span><StatusBadge status={j.status} /></span>
              <span style={{ fontFamily: "var(--font-mono)", fontSize: "var(--text-sm)", color: "var(--text-body)" }}>{j.applications_count || 0}</span>
              <span style={{ fontFamily: "var(--font-mono)", fontSize: "var(--text-sm)", color: "var(--text-body)" }}>{j.views || 0}</span>
              <span style={{ fontSize: "var(--text-sm)", color: "var(--text-muted)" }}>{fmtDate(j.created_at)}</span>
              <div style={{ display: "flex", gap: 2, justifyContent: "flex-end", alignItems: "center" }}>
                <button onClick={() => onView && onView(j)} title="View" style={{ border: "none", background: "transparent", cursor: "pointer", color: "var(--text-muted)", padding: "4px 6px", borderRadius: "var(--radius-sm)", display: "inline-flex", alignItems: "center" }}>{I("eye", 15)}</button>
                <button onClick={() => onEdit && onEdit(j)} title="Edit" style={{ border: "none", background: "transparent", cursor: "pointer", color: "var(--text-muted)", padding: "4px 6px", borderRadius: "var(--radius-sm)", display: "inline-flex", alignItems: "center" }}>{I("pencil", 15)}</button>
                <button onClick={() => onClone && onClone(j)} title="Clone" style={{ border: "none", background: "transparent", cursor: "pointer", color: "var(--text-muted)", padding: "4px 6px", borderRadius: "var(--radius-sm)", display: "inline-flex", alignItems: "center" }}>{I("copy", 15)}</button>
                <span style={{ display: "inline-block", width: 1, height: 16, background: "var(--border)", margin: "0 3px" }} />
                {(j.status === "draft" || j.status === "rejected") && (
                  <Button variant="primary" size="sm" onClick={() => isRecruiter ? act(() => emp.submitJob(j.id), "Submitted for company review.") : onPublish(j.id, "Job published!")}>
                    {isRecruiter ? "Submit" : "Publish"}
                  </Button>
                )}
                {j.status === "company_pending" && isAdmin && (
                  <React.Fragment>
                    <Button variant="primary" size="sm" onClick={() => act(() => emp.companyApproveJob(j.id), "Job approved and published.")}>Approve</Button>
                    <Button variant="ghost" size="sm" onClick={() => { setRejectModal(j); setRejectReason(""); }}>Reject</Button>
                  </React.Fragment>
                )}
                {j.status === "company_pending" && isRecruiter && (
                  <span style={{ fontSize: "var(--text-xs)", color: "var(--warning, #b45309)", padding: "0 4px" }}>Awaiting review</span>
                )}
                {j.status === "published" && !j.is_featured && <Button variant="ghost" size="sm" iconLeft={I("star", 13)} onClick={() => setBoostTarget(j)}>Feature</Button>}
                {j.status === "published" && <Button variant="secondary" size="sm" onClick={() => act(() => emp.closeJob(j.id), "Job closed.")}>Close</Button>}
                {(j.status === "draft" || j.status === "rejected" || j.status === "closed" || j.status === "company_pending") && <Button variant="ghost" size="sm" onClick={() => del(j)}>Delete</Button>}
              </div>
            </div>
          ))}
          {!loading && <Pager page={pageSafe} perPage={JOBS_PER} total={filtered.length} onPage={setPage} label="jobs" />}
        </Card></div>
        {/* Company admin reject modal */}
        {rejectModal && (
          <div onClick={() => setRejectModal(null)} style={{ position: "fixed", inset: 0, zIndex: 300, background: "var(--surface-overlay)", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
            <div onClick={(e) => e.stopPropagation()} style={{ width: "100%", maxWidth: 400, background: "var(--surface-card)", borderRadius: "var(--radius-xl)", boxShadow: "var(--shadow-xl)", overflow: "hidden" }}>
              <div style={{ padding: "18px 22px", borderBottom: "1px solid var(--border)", fontWeight: 700, fontSize: "var(--text-md)", color: "var(--text-strong)" }}>Reject job posting</div>
              <div style={{ padding: "18px 22px" }}>
                <div style={{ fontSize: "var(--text-sm)", color: "var(--text-muted)", marginBottom: 12 }}>Tell the recruiter why this job was rejected.</div>
                <Input label="Reason" value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} placeholder="e.g. Job description is incomplete…" />
              </div>
              <div style={{ display: "flex", gap: 10, padding: "14px 22px", borderTop: "1px solid var(--border)" }}>
                <Button variant="ghost" onClick={() => setRejectModal(null)} style={{ flex: 1 }}>Cancel</Button>
                <Button variant="primary" style={{ background: "var(--danger)", flex: 1 }} disabled={!rejectReason.trim()} onClick={doCompanyReject}>Reject</Button>
              </div>
            </div>
          </div>
        )}
        <BoostModal job={boostTarget} onClose={() => setBoostTarget(null)} onDone={(m) => { setBoostTarget(null); flash(m); reload(); }} />
      </div>
    );
  }

  const STAGES = [
    { key: "applied", label: "Applied", tone: "neutral" },
    { key: "reviewed", label: "Reviewed", tone: "info" },
    { key: "shortlisted", label: "Shortlisted", tone: "brand" },
    { key: "interview", label: "Interview", tone: "warning" },
    { key: "offered", label: "Offered", tone: "success" },
  ];
  const NEXT_STAGE = { applied: "reviewed", reviewed: "shortlisted", shortlisted: "interview", interview: "offered" };

  function Applicants({ jobs, onGoToMessages }) {
    const reviewable = jobs.filter((j) => j.status === "published" || j.status === "closed");
    const [jobId, setJobId] = React.useState("");
    const [apps, setApps] = React.useState([]);
    const [loading, setLoading] = React.useState(false);
    const [msg, setMsg] = React.useState("");
    const [msgModal, setMsgModal] = React.useState(null);
    const [msgBody, setMsgBody] = React.useState("");
    const [msgSending, setMsgSending] = React.useState(false);
    const [msgErr, setMsgErr] = React.useState("");
    const flash = (m) => { setMsg(m); setTimeout(() => setMsg(""), 2500); };

    const openMessage = (candidate) => { setMsgModal({ candidate: candidate, jobId: jobId }); setMsgBody(""); setMsgErr(""); };
    const sendNewMessage = () => {
      if (!msgBody.trim() || msgSending || !msgModal) return;
      setMsgSending(true); setMsgErr("");
      var job = reviewable.find((j) => String(j.id) === String(msgModal.jobId));
      emp.startConversation({ other_user_id: msgModal.candidate.id, job_id: msgModal.jobId || null, subject: job ? job.title : null, message: msgBody.trim() })
        .then(function () { setMsgSending(false); setMsgModal(null); setMsgBody(""); if (onGoToMessages) onGoToMessages(); })
        .catch(function (e) { setMsgSending(false); setMsgErr((e && e.message) || "Could not send message."); });
    };

    React.useEffect(function () {
      if (!jobId && reviewable.length > 0) setJobId(String(reviewable[0].id));
    }, [jobs]);

    const load = React.useCallback(function () {
      if (!jobId) { setApps([]); return; }
      setLoading(true);
      emp.fetchJobApplications(jobId).then(function (d) {
        var list = (d.applications && d.applications.data) || [];
        setApps(list); setLoading(false);
      }).catch(function () { setLoading(false); });
    }, [jobId]);
    React.useEffect(function () { load(); }, [load]);

    const move = (a, stage) => {
      emp.updateApplicationStage(a.id, stage)
        .then(function () { flash("Moved to " + stage + "."); load(); })
        .catch(function (e) { flash("Error: " + (e && e.message)); });
    };

    const byStage = {};
    STAGES.forEach((s) => { byStage[s.key] = []; });
    apps.forEach((a) => { var k = a.stage || "applied"; if (!byStage[k]) byStage[k] = []; byStage[k].push(a); });

    if (reviewable.length === 0) {
      return <div className="krm-page-pad" style={{ padding: 28 }}><EmptyState icon={I("users", 28)} title="No applicants yet" message="Publish a job to start receiving applications." /></div>;
    }

    return (
      <div className="krm-page-pad" style={{ padding: 28 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 20, flexWrap: "wrap" }}>
          <span style={{ fontWeight: 700, color: "var(--text-strong)", fontSize: "var(--text-md)" }}>Pipeline</span>
          <div style={{ width: 280 }}>
            <Select value={jobId} onChange={(e) => setJobId(e.target.value)}
              options={reviewable.map((j) => ({ value: String(j.id), label: j.title + " (" + (j.applications_count || 0) + ")" }))} />
          </div>
          <Badge tone="neutral">{apps.length} applicant{apps.length === 1 ? "" : "s"}</Badge>
          {msg && <span style={{ fontSize: "var(--text-sm)", color: "var(--success)", fontWeight: 600 }}>{msg}</span>}
        </div>
        {loading ? <div style={{ color: "var(--text-muted)", fontSize: "var(--text-sm)" }}>Loading…</div> : (
        <div className="krm-pipeline" style={{ display: "grid", gridTemplateColumns: "repeat(5, minmax(190px, 1fr))", gap: 14, alignItems: "start", overflowX: "auto", paddingBottom: 6 }}>
          {STAGES.map((s) => (
            <div key={s.key} style={{ background: "var(--surface-sunken)", borderRadius: "var(--radius-lg)", padding: 10, minHeight: 200, minWidth: 0 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "4px 6px 10px" }}>
                <Badge tone={s.tone}>{s.label}</Badge>
                <span style={{ fontSize: "var(--text-xs)", fontWeight: 700, color: "var(--text-muted)" }}>{byStage[s.key].length}</span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {byStage[s.key].map((a) => {
                  var c = a.candidate || {};
                  var next = NEXT_STAGE[s.key];
                  return (
                    <div key={a.id} style={{ background: "var(--surface-card)", border: "1px solid var(--border)", borderRadius: "var(--radius-md)", padding: 12, boxShadow: "var(--shadow-xs)" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
                        <Avatar src={c.avatar_url} name={c.name || "?"} size={32} />
                        <div style={{ minWidth: 0 }}>
                          <div style={{ fontWeight: 700, fontSize: "var(--text-sm)", color: "var(--text-strong)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{c.name || "Candidate"}</div>
                          <div style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{(a.resume && a.resume.headline) || c.email || ""}</div>
                        </div>
                      </div>
                      <div style={{ display: "flex", gap: 6, marginTop: 10 }}>
                        {a.resume && a.resume.has_cv
                          ? (c.cv_visibility === "private"
                            ? <Button variant="ghost" size="sm" style={{ flex: 1, height: 30 }} disabled title="Candidate has hidden their CV">{I("eye-off", 12)} Hidden</Button>
                            : <Button variant="ghost" size="sm" style={{ flex: 1, height: 30 }} iconLeft={I("download", 13)} onClick={function() { emp.downloadCv(a.id).catch(function(e){ flash(e && e.message || "Download failed"); }); }}>CV</Button>)
                          : <Button variant="ghost" size="sm" style={{ flex: 1, height: 30 }} disabled>No CV</Button>}
                        {next
                          ? <Button variant="secondary" size="sm" style={{ flex: 1, height: 30 }} onClick={() => move(a, next)}>→ {next}</Button>
                          : <Button variant="ghost" size="sm" style={{ flex: 1, height: 30 }} disabled>Final</Button>}
                      </div>
                      <Button variant="ghost" size="sm" style={{ width: "100%", height: 30, marginTop: 6 }} iconLeft={I("message-square", 13)} onClick={() => openMessage(c)}>Message</Button>
                    </div>
                  );
                })}
                {byStage[s.key].length === 0 && <div style={{ fontSize: "var(--text-xs)", color: "var(--text-faint)", textAlign: "center", padding: "10px 0" }}>—</div>}
              </div>
            </div>
          ))}
        </div>
        )}
        {msgModal && (
          <div onClick={() => setMsgModal(null)} style={{ position: "fixed", inset: 0, zIndex: 200, background: "var(--surface-overlay)", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
            <div onClick={(e) => e.stopPropagation()} style={{ width: "100%", maxWidth: 460, background: "var(--surface-card)", borderRadius: "var(--radius-xl)", boxShadow: "var(--shadow-xl)", overflow: "hidden" }}>
              <div style={{ padding: "18px 22px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", gap: 10 }}>
                <Avatar src={msgModal.candidate.avatar_url} name={msgModal.candidate.name || "?"} size={38} />
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontWeight: 700, color: "var(--text-strong)", fontSize: "var(--text-sm)" }}>Message {msgModal.candidate.name || "candidate"}</div>
                  <div style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{msgModal.candidate.email || ""}</div>
                </div>
              </div>
              <div style={{ padding: 18 }}>
                <textarea value={msgBody} onChange={(e) => setMsgBody(e.target.value)} rows={5} autoFocus placeholder="Write your message…"
                  onKeyDown={(e) => { if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) { e.preventDefault(); sendNewMessage(); } }}
                  style={{ width: "100%", boxSizing: "border-box", resize: "vertical", border: "1px solid var(--border)", borderRadius: "var(--radius-md)", padding: "10px 12px", fontFamily: "var(--font-sans)", fontSize: "var(--text-sm)", color: "var(--text-body)", background: "var(--surface-page)", outline: "none", lineHeight: 1.5 }} />
                {msgErr && <div style={{ color: "var(--danger)", fontSize: "var(--text-xs)", marginTop: 8 }}>{msgErr}</div>}
              </div>
              <div style={{ padding: "0 18px 18px", display: "flex", justifyContent: "flex-end", gap: 10 }}>
                <Button variant="secondary" onClick={() => setMsgModal(null)}>Cancel</Button>
                <Button variant="primary" disabled={msgSending || !msgBody.trim()} onClick={sendNewMessage}>{msgSending ? "Sending…" : "Send message"}</Button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  function CompanyProfile({ company, onSaved, jobs }) {
    const [tab, setTab] = React.useState("about");
    // About tab
    const [form, setForm] = React.useState(null);
    const [saving, setSaving] = React.useState(false);
    const [logoUploading, setLogoUploading] = React.useState(false);
    const [msg, setMsg] = React.useState("");
    const [err, setErr] = React.useState("");
    const logoInputRef = React.useRef(null);
    // Gallery tab
    const [gallery, setGallery] = React.useState([]);
    const [galleryUploading, setGalleryUploading] = React.useState(false);
    const galleryInputRef = React.useRef(null);
    // Awards tab
    const [awards, setAwards] = React.useState([]);
    const [awardForm, setAwardForm] = React.useState({ title: "", year: String(new Date().getFullYear()), description: "" });
    const [awardSaving, setAwardSaving] = React.useState(false);
    const [awardUploadingId, setAwardUploadingId] = React.useState(null);
    // About feature image
    const [aboutImageUrl, setAboutImageUrl] = React.useState("");
    const [aboutUploading, setAboutUploading] = React.useState(false);
    const aboutInputRef = React.useRef(null);
    // Cover banner
    const [coverBannerUrl, setCoverBannerUrl] = React.useState("");
    const [coverUploading, setCoverUploading] = React.useState(false);
    const coverInputRef = React.useRef(null);

    React.useEffect(function () {
      if (company) {
        var sl = company.social_links || {};
        setForm({ name: company.name || "", registration_no: company.registration_no || "", industry: company.industry || "", website: company.website || "", address: company.address || "", description: company.description || "", logo_url: company.logo_url || "", facebook_url: sl.facebook || "", linkedin_url: sl.linkedin || "", twitter_url: sl.twitter || "", instagram_url: sl.instagram || "", company_size: company.company_size || "", culture_values: company.culture_values || "", benefits_tags: Array.isArray(company.benefits_tags) ? company.benefits_tags : [] });
        setAboutImageUrl(company.about_image_url || "");
        setCoverBannerUrl(company.cover_banner_url || "");
        setGallery(Array.isArray(company.gallery) ? company.gallery : []);
        setAwards(Array.isArray(company.awards) ? company.awards : []);
      }
    }, [company]);

    if (!company || !form) return <div className="krm-page-pad" style={{ padding: 28, color: "var(--text-muted)" }}>Loading…</div>;
    const set = (k, v) => setForm((f) => Object.assign({}, f, { [k]: v }));

    const flash = (m, isErr) => {
      if (isErr) { setErr(m); setTimeout(() => setErr(""), 4000); }
      else { setMsg(m); setTimeout(() => setMsg(""), 3000); }
    };

    const save = () => {
      setSaving(true); setErr(""); setMsg("");
      var payload = { name: form.name, registration_no: form.registration_no, industry: form.industry, website: form.website, address: form.address, description: form.description, social_links: { facebook: form.facebook_url, linkedin: form.linkedin_url, twitter: form.twitter_url, instagram: form.instagram_url }, company_size: form.company_size || null, culture_values: form.culture_values || null, benefits_tags: form.benefits_tags && form.benefits_tags.length ? form.benefits_tags : null };
      emp.updateCompany(company.id, payload)
        .then(function (updated) { setSaving(false); flash("Profile saved."); onSaved && onSaved(updated); })
        .catch(function (e) { setSaving(false); flash((e && e.message) || "Save failed.", true); });
    };

    const handleLogoChange = (e) => {
      var file = e.target.files && e.target.files[0];
      if (!file) return;
      setLogoUploading(true); setErr(""); setMsg("");
      compressImage(file, 400, 0.82).then(function (compressed) {
        return emp.uploadCompanyLogo(company.id, compressed);
      }).then(function (updated) {
        setLogoUploading(false); set("logo_url", updated.logo_url || "");
        onSaved && onSaved(updated); flash("Logo updated.");
      }).catch(function (e) { setLogoUploading(false); flash((e && e.message) || "Logo upload failed.", true); });
      e.target.value = "";
    };

    const handleGalleryUpload = (e) => {
      var files = e.target.files;
      if (!files || !files.length) return;
      setGalleryUploading(true);
      Promise.all(Array.from(files).map(function (file) {
        return compressImage(file, 1200, 0.85).then(function (compressed) { return emp.uploadGalleryPhoto(company.id, compressed); });
      })).then(function (results) {
        setGallery(function (g) { return g.concat(results); });
        setGalleryUploading(false); flash("Photo(s) uploaded.");
      }).catch(function (ex) { setGalleryUploading(false); flash((ex && ex.message) || "Upload failed.", true); });
      e.target.value = "";
    };

    const deleteGalleryPhoto = (photoId) => {
      emp.deleteGalleryPhoto(company.id, photoId)
        .then(function () { setGallery(function (g) { return g.filter(function (p) { return p.id !== photoId; }); }); flash("Photo removed."); })
        .catch(function (ex) { flash((ex && ex.message) || "Failed to remove.", true); });
    };

    const saveCaption = (photoId, caption) => {
      emp.updateGalleryCaption(company.id, photoId, caption)
        .then(function () { setGallery(function (g) { return g.map(function (p) { return p.id === photoId ? Object.assign({}, p, { caption: caption }) : p; }); }); })
        .catch(function (ex) { flash((ex && ex.message) || "Failed to save caption.", true); });
    };

    const handleAboutImageChange = (e) => {
      var file = e.target.files && e.target.files[0];
      if (!file) return;
      setAboutUploading(true); setErr(""); setMsg("");
      compressImage(file, 1400, 0.85).then(function (compressed) { return emp.uploadAboutImage(company.id, compressed); })
        .then(function (updated) { setAboutUploading(false); setAboutImageUrl(updated.about_image_url || ""); onSaved && onSaved(updated); flash("About image updated."); })
        .catch(function (ex) { setAboutUploading(false); flash((ex && ex.message) || "Upload failed.", true); });
      e.target.value = "";
    };

    const handleCoverBannerChange = (e) => {
      var file = e.target.files && e.target.files[0];
      if (!file) return;
      setCoverUploading(true); setErr(""); setMsg("");
      compressImage(file, 1600, 0.85).then(function (compressed) { return emp.uploadCoverBanner(company.id, compressed); })
        .then(function (updated) { setCoverUploading(false); setCoverBannerUrl(updated.cover_banner_url || ""); onSaved && onSaved(updated); flash("Cover banner updated."); })
        .catch(function (ex) { setCoverUploading(false); flash((ex && ex.message) || "Upload failed.", true); });
      e.target.value = "";
    };

    const toggleBenefitTag = (tag) => {
      setForm(function (f) {
        var tags = f.benefits_tags || [];
        var idx = tags.indexOf(tag);
        return Object.assign({}, f, { benefits_tags: idx >= 0 ? tags.filter(function (t) { return t !== tag; }) : tags.concat([tag]) });
      });
    };

    const handleAwardImageChange = (awardId, e) => {
      var file = e.target.files && e.target.files[0];
      if (!file) return;
      setAwardUploadingId(awardId);
      compressImage(file, 1000, 0.85).then(function (compressed) { return emp.uploadAwardImage(company.id, awardId, compressed); })
        .then(function (updated) { setAwardUploadingId(null); setAwards(function (arr) { return arr.map(function (a) { return a.id === awardId ? Object.assign({}, a, { image_url: updated.image_url || "" }) : a; }); }); flash("Certificate uploaded."); })
        .catch(function (ex) { setAwardUploadingId(null); flash((ex && ex.message) || "Upload failed.", true); });
      e.target.value = "";
    };

    const saveAward = () => {
      if (!awardForm.title.trim()) return;
      setAwardSaving(true);
      emp.createAward(company.id, { title: awardForm.title, year: awardForm.year, description: awardForm.description })
        .then(function (a) { setAwards(function (arr) { return arr.concat([a]); }); setAwardForm({ title: "", year: String(new Date().getFullYear()), description: "" }); setAwardSaving(false); flash("Award added."); })
        .catch(function (ex) { setAwardSaving(false); flash((ex && ex.message) || "Failed to save award.", true); });
    };

    const deleteAward = (awardId) => {
      emp.deleteAward(company.id, awardId)
        .then(function () { setAwards(function (arr) { return arr.filter(function (a) { return a.id !== awardId; }); }); flash("Award removed."); })
        .catch(function (ex) { flash((ex && ex.message) || "Failed to remove.", true); });
    };

    const companyJobs = jobs || [];
    const fmtDate = (iso) => { if (!iso) return "—"; var d = new Date(iso); return d.getDate() + " " + ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"][d.getMonth()]; };

    const TABS = [
      { value: "about", label: "About" },
      { value: "jobs", label: "Jobs", count: companyJobs.length },
      { value: "gallery", label: "Gallery", count: gallery.length || undefined },
      { value: "awards", label: "Awards", count: awards.length || undefined },
    ];

    return (
      <div className="krm-page-pad" style={{ padding: 28, maxWidth: 1100 }}>
        {/* Header */}
        <div style={{ display: "flex", gap: 20, alignItems: "center", marginBottom: 24 }}>
          <div style={{ position: "relative", flexShrink: 0 }}>
            <Avatar src={form.logo_url} name={form.name || "Company"} square size={80} />
            <button onClick={() => logoInputRef.current && logoInputRef.current.click()} disabled={logoUploading}
              style={{ position: "absolute", bottom: 0, right: 0, width: 26, height: 26, borderRadius: "50%", border: "2px solid var(--surface-card)", background: "var(--brand)", color: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", padding: 0 }}>
              {logoUploading ? <span style={{ fontSize: 10 }}>…</span> : I("camera", 13)}
            </button>
            <input ref={logoInputRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleLogoChange} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
              <h2 style={{ fontSize: "var(--text-xl)", fontWeight: 700, color: "var(--text-strong)", margin: 0 }}>{form.name || "Company name"}</h2>
              {company.is_verified
                ? <Badge tone="success"><span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>{I("badge-check", 12)} Verified</span></Badge>
                : <Badge tone="neutral">Unverified</Badge>}
            </div>
            <div style={{ fontSize: "var(--text-sm)", color: "var(--text-muted)", marginTop: 4 }}>{form.industry}{form.industry && form.address ? " · " : ""}{form.address}</div>
            {/* Social icons */}
            <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
              {form.facebook_url && <a href={form.facebook_url} target="_blank" rel="noopener" style={{ width: 32, height: 32, borderRadius: "50%", background: "#1877f2", color: "#fff", display: "inline-flex", alignItems: "center", justifyContent: "center", textDecoration: "none" }}>{I("facebook", 15)}</a>}
              {form.linkedin_url && <a href={form.linkedin_url} target="_blank" rel="noopener" style={{ width: 32, height: 32, borderRadius: "50%", background: "#0a66c2", color: "#fff", display: "inline-flex", alignItems: "center", justifyContent: "center", textDecoration: "none" }}>{I("linkedin", 15)}</a>}
              {form.twitter_url && <a href={form.twitter_url} target="_blank" rel="noopener" style={{ width: 32, height: 32, borderRadius: "50%", background: "#000", color: "#fff", display: "inline-flex", alignItems: "center", justifyContent: "center", textDecoration: "none" }}>{I("twitter", 15)}</a>}
              {form.instagram_url && <a href={form.instagram_url} target="_blank" rel="noopener" style={{ width: 32, height: 32, borderRadius: "50%", background: "linear-gradient(135deg,#f09433,#e6683c,#dc2743,#cc2366,#bc1888)", color: "#fff", display: "inline-flex", alignItems: "center", justifyContent: "center", textDecoration: "none" }}>{I("instagram", 15)}</a>}
            </div>
          </div>
        </div>

        {/* Flash messages */}
        {err && <div style={{ padding: "10px 14px", background: "var(--danger-subtle)", color: "var(--danger)", borderRadius: "var(--radius-md)", fontSize: "var(--text-sm)", marginBottom: 14 }}>{err}</div>}
        {msg && <div style={{ padding: "10px 14px", background: "var(--success-subtle)", color: "var(--success)", borderRadius: "var(--radius-md)", fontSize: "var(--text-sm)", fontWeight: 600, marginBottom: 14 }}>{msg}</div>}

        {/* Tabs */}
        <Tabs value={tab} onChange={setTab} tabs={TABS} style={{ marginBottom: 20 }} />

        {/* ── About tab ── */}
        {tab === "about" && (
          <Card padding={24}>
            <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
              <div className="krm-form-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <Input label="Company name" value={form.name} onChange={(e) => set("name", e.target.value)} />
                <Input label="Registration number" value={form.registration_no} onChange={(e) => set("registration_no", e.target.value)} />
              </div>
              <div className="krm-form-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <Input label="Industry" value={form.industry} onChange={(e) => set("industry", e.target.value)} />
                <Input label="Website" value={form.website} onChange={(e) => set("website", e.target.value)} iconLeft={I("globe", 16)} />
              </div>
              <Input label="Address" value={form.address} onChange={(e) => set("address", e.target.value)} iconLeft={I("map-pin", 16)} />
              <Textarea label="About the company" rows={5} value={form.description} onChange={(e) => set("description", e.target.value)} placeholder="Tell candidates about your company, culture, and mission…" />

              {/* Cover banner image */}
              <div>
                <div style={{ fontSize: "var(--text-sm)", fontWeight: 700, color: "var(--text-strong)", marginBottom: 4 }}>Cover banner</div>
                <div style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)", marginBottom: 8 }}>Wide banner shown at the top of your company profile page. Recommended: 1600×400px.</div>
                <div style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
                  <div style={{ flex: 1, height: 100, borderRadius: "var(--radius-md)", border: "1px dashed var(--border-strong)", background: "var(--surface-sunken)", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    {coverBannerUrl ? <img src={coverBannerUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <span style={{ color: "var(--text-faint)" }}>{I("panorama", 28)}</span>}
                  </div>
                  <div style={{ flexShrink: 0 }}>
                    <Button variant="secondary" size="sm" disabled={coverUploading} onClick={() => coverInputRef.current && coverInputRef.current.click()}>{coverUploading ? "Uploading…" : (coverBannerUrl ? "Change banner" : "Upload banner")}</Button>
                    <input ref={coverInputRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleCoverBannerChange} />
                  </div>
                </div>
              </div>

              {/* About feature image */}
              <div>
                <div style={{ fontSize: "var(--text-sm)", fontWeight: 700, color: "var(--text-strong)", marginBottom: 8 }}>About image</div>
                <div style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
                  <div style={{ width: 200, height: 120, borderRadius: "var(--radius-md)", border: "1px dashed var(--border-strong)", background: "var(--surface-sunken)", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    {aboutImageUrl ? <img src={aboutImageUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <span style={{ color: "var(--text-faint)" }}>{I("image", 28)}</span>}
                  </div>
                  <div>
                    <Button variant="secondary" size="sm" disabled={aboutUploading} onClick={() => aboutInputRef.current && aboutInputRef.current.click()}>{aboutUploading ? "Uploading…" : (aboutImageUrl ? "Change image" : "Upload image")}</Button>
                    <div style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)", marginTop: 6, maxWidth: 260 }}>Shown at the top of your public About section. Landscape works best.</div>
                    <input ref={aboutInputRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleAboutImageChange} />
                  </div>
                </div>
              </div>

              {/* Social media */}
              <div>
                <div style={{ fontSize: "var(--text-sm)", fontWeight: 700, color: "var(--text-strong)", marginBottom: 12 }}>Social media</div>
                <div className="krm-form-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                  <Input label="Facebook" value={form.facebook_url} onChange={(e) => set("facebook_url", e.target.value)} iconLeft={I("facebook", 16)} placeholder="https://facebook.com/yourpage" />
                  <Input label="LinkedIn" value={form.linkedin_url} onChange={(e) => set("linkedin_url", e.target.value)} iconLeft={I("linkedin", 16)} placeholder="https://linkedin.com/company/yourpage" />
                  <Input label="Twitter / X" value={form.twitter_url} onChange={(e) => set("twitter_url", e.target.value)} iconLeft={I("twitter", 16)} placeholder="https://x.com/yourhandle" />
                  <Input label="Instagram" value={form.instagram_url} onChange={(e) => set("instagram_url", e.target.value)} iconLeft={I("instagram", 16)} placeholder="https://instagram.com/yourpage" />
                </div>
              </div>

              {/* Company size */}
              <div>
                <div style={{ fontSize: "var(--text-sm)", fontWeight: 700, color: "var(--text-strong)", marginBottom: 8 }}>Company size</div>
                <select value={form.company_size} onChange={(e) => set("company_size", e.target.value)} style={{ padding: "8px 12px", borderRadius: "var(--radius-md)", border: "1px solid var(--border)", background: "var(--surface-input)", color: "var(--text)", fontSize: "var(--text-sm)", minWidth: 180 }}>
                  <option value="">Not specified</option>
                  <option value="1-10">1–10 employees</option>
                  <option value="11-50">11–50 employees</option>
                  <option value="51-200">51–200 employees</option>
                  <option value="201-500">201–500 employees</option>
                  <option value="500+">500+ employees</option>
                </select>
              </div>

              {/* Culture & values */}
              <Textarea label="Culture & values" rows={3} value={form.culture_values} onChange={(e) => set("culture_values", e.target.value)} placeholder="Describe your company culture, mission, and what makes your workplace special…" />

              {/* Benefits tags */}
              <div>
                <div style={{ fontSize: "var(--text-sm)", fontWeight: 700, color: "var(--text-strong)", marginBottom: 8 }}>Employee benefits</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {["Health insurance", "Remote work", "Flexible hours", "Learning budget", "Annual bonus", "Stock options", "Gym membership", "Meals provided", "Transportation", "Paid leave", "Pension plan", "International travel"].map(function (tag) {
                    var active = (form.benefits_tags || []).indexOf(tag) >= 0;
                    return (
                      <button key={tag} onClick={() => toggleBenefitTag(tag)} style={{ padding: "5px 12px", borderRadius: 20, border: "1px solid " + (active ? "var(--teal-500)" : "var(--border)"), background: active ? "var(--teal-subtle)" : "transparent", color: active ? "var(--teal-600)" : "var(--text-muted)", fontSize: "var(--text-sm)", cursor: "pointer", fontWeight: active ? 600 : 400, transition: "all .15s" }}>
                        {active && I("check", 12, { style: { marginRight: 4 } })}{tag}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div style={{ paddingTop: 4 }}>
                <Button variant="primary" onClick={save} disabled={saving}>{saving ? "Saving…" : "Save changes"}</Button>
              </div>
            </div>
          </Card>
        )}

        {/* ── Jobs tab ── */}
        {tab === "jobs" && (
          <div className="krm-table-wrap"><Card padding={0}>
            <div style={{ padding: "16px 22px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ fontWeight: 700, color: "var(--text-strong)" }}>Job postings</div>
              <Badge tone="neutral">{companyJobs.length}</Badge>
            </div>
            {companyJobs.length === 0 && (
              <div style={{ padding: "40px 22px", textAlign: "center", color: "var(--text-muted)", fontSize: "var(--text-sm)" }}>No jobs posted yet.</div>
            )}
            {companyJobs.length > 0 && (
              <React.Fragment>
                <div style={{ display: "grid", gridTemplateColumns: "1.8fr 0.9fr 0.7fr 0.7fr 0.8fr", padding: "10px 22px", fontSize: "var(--text-xs)", fontWeight: 700, letterSpacing: ".04em", textTransform: "uppercase", color: "var(--text-faint)", borderBottom: "1px solid var(--border-subtle)" }}>
                  <span>Job title</span><span>Status</span><span>Applicants</span><span>Views</span><span>Posted</span>
                </div>
                {companyJobs.map((j, i) => (
                  <div key={j.id} style={{ display: "grid", gridTemplateColumns: "1.8fr 0.9fr 0.7fr 0.7fr 0.8fr", alignItems: "center", padding: "14px 22px", borderBottom: i < companyJobs.length - 1 ? "1px solid var(--border-subtle)" : "none" }}>
                    <span style={{ fontWeight: 600, color: "var(--text-strong)" }}>{j.title}</span>
                    <span><StatusBadge status={j.status} /></span>
                    <span style={{ fontFamily: "var(--font-mono)", fontSize: "var(--text-sm)", color: "var(--text-body)" }}>{j.applications_count || 0}</span>
                    <span style={{ fontFamily: "var(--font-mono)", fontSize: "var(--text-sm)", color: "var(--text-body)" }}>{j.views || 0}</span>
                    <span style={{ fontSize: "var(--text-sm)", color: "var(--text-muted)" }}>{fmtDate(j.created_at)}</span>
                  </div>
                ))}
              </React.Fragment>
            )}
          </Card></div>
        )}

        {/* ── Gallery tab ── */}
        {tab === "gallery" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <Button variant="primary" iconLeft={I("image-plus", 16)} disabled={galleryUploading} onClick={() => galleryInputRef.current && galleryInputRef.current.click()}>
                {galleryUploading ? "Uploading…" : "Upload photos"}
              </Button>
              <span style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>JPG, PNG up to 10 MB each. Multiple files allowed.</span>
              <input ref={galleryInputRef} type="file" accept="image/*" multiple style={{ display: "none" }} onChange={handleGalleryUpload} />
            </div>
            {gallery.length === 0 && (
              <Card padding={40}>
                <div style={{ textAlign: "center", color: "var(--text-muted)" }}>
                  <span style={{ display: "inline-flex", marginBottom: 12, color: "var(--text-faint)" }}>{I("image", 36)}</span>
                  <div style={{ fontWeight: 600, color: "var(--text-body)", marginBottom: 4 }}>No photos yet</div>
                  <div style={{ fontSize: "var(--text-sm)" }}>Upload photos to showcase your office, team, and culture.</div>
                </div>
              </Card>
            )}
            {gallery.length > 0 && (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 12 }}>
                {gallery.map(function (photo) {
                  return (
                    <div key={photo.id} style={{ border: "1px solid var(--border)", borderRadius: "var(--radius-md)", overflow: "hidden", background: "var(--surface-card)" }}>
                      <div style={{ position: "relative", aspectRatio: "4/3", background: "var(--surface-sunken)" }}>
                        <img src={photo.url || photo.photo_url || photo} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                        <button onClick={() => deleteGalleryPhoto(photo.id)} title="Remove" style={{ position: "absolute", top: 6, right: 6, width: 28, height: 28, borderRadius: "50%", background: "rgba(0,0,0,0.55)", border: "none", color: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>{I("x", 14)}</button>
                      </div>
                      <input defaultValue={photo.caption || ""} onBlur={(e) => { if ((e.target.value || "") !== (photo.caption || "")) saveCaption(photo.id, e.target.value); }} placeholder="Add a caption…" style={{ width: "100%", border: "none", borderTop: "1px solid var(--border-subtle)", outline: "none", padding: "8px 10px", fontFamily: "var(--font-sans)", fontSize: "var(--text-xs)", color: "var(--text-body)", background: "transparent", boxSizing: "border-box" }} />
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ── Awards tab ── */}
        {tab === "awards" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <Card padding={20}>
              <div style={{ fontWeight: 700, color: "var(--text-strong)", marginBottom: 14, fontSize: "var(--text-base)" }}>Add award or recognition</div>
              <div className="krm-form-grid" style={{ display: "grid", gridTemplateColumns: "1fr 140px", gap: 12, marginBottom: 12 }}>
                <Input label="Award title" value={awardForm.title} onChange={(e) => setAwardForm(function (f) { return Object.assign({}, f, { title: e.target.value }); })} placeholder="e.g. Best Employer of the Year" />
                <Input label="Year" type="number" value={awardForm.year} onChange={(e) => setAwardForm(function (f) { return Object.assign({}, f, { year: e.target.value }); })} placeholder="2024" />
              </div>
              <Textarea label="Description (optional)" rows={2} value={awardForm.description} onChange={(e) => setAwardForm(function (f) { return Object.assign({}, f, { description: e.target.value }); })} placeholder="Awarded by…" />
              <div style={{ marginTop: 12 }}>
                <Button variant="primary" iconLeft={I("plus", 16)} disabled={awardSaving || !awardForm.title.trim()} onClick={saveAward}>{awardSaving ? "Saving…" : "Add award"}</Button>
              </div>
            </Card>

            {awards.length === 0 && (
              <div style={{ padding: "28px 0", textAlign: "center", color: "var(--text-muted)", fontSize: "var(--text-sm)" }}>No awards yet. Add your first one above.</div>
            )}
            {awards.length > 0 && awards.map(function (a) {
              return (
                <Card key={a.id} padding={18}>
                  <div style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
                    <label title="Upload certificate" style={{ position: "relative", flexShrink: 0, width: 56, height: 56, borderRadius: "var(--radius-md)", overflow: "hidden", cursor: awardUploadingId === a.id ? "wait" : "pointer", display: "inline-flex", alignItems: "center", justifyContent: "center", background: a.image_url ? "var(--surface-sunken)" : "var(--warning-subtle, #fef3c7)", color: "var(--warning, #b45309)", border: "1px solid var(--border)" }}>
                      {awardUploadingId === a.id
                        ? <span style={{ fontSize: 11, color: "var(--text-muted)" }}>…</span>
                        : a.image_url
                          ? <img src={a.image_url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                          : I("trophy", 20)}
                      <input type="file" accept="image/*" style={{ display: "none" }} onChange={(e) => handleAwardImageChange(a.id, e)} />
                    </label>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 700, color: "var(--text-strong)", fontSize: "var(--text-sm)" }}>{a.title}</div>
                      {a.year && <div style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)", marginTop: 2 }}>{a.year}</div>}
                      {a.description && <div style={{ fontSize: "var(--text-sm)", color: "var(--text-body)", marginTop: 6, lineHeight: 1.5 }}>{a.description}</div>}
                      <div style={{ fontSize: "var(--text-xs)", color: "var(--text-faint)", marginTop: 6 }}>{a.image_url ? "Click the image to replace the certificate." : "Click the trophy to add a certificate image."}</div>
                    </div>
                    <button onClick={() => deleteAward(a.id)} title="Remove" style={{ border: "none", background: "transparent", cursor: "pointer", color: "var(--text-muted)", display: "inline-flex", padding: 4, borderRadius: "var(--radius-sm)" }}>{I("trash-2", 15)}</button>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  // Payment methods are configured by the admin (Admin Console → Payment methods), stored via API.
  const PAY_DEFAULTS = {
    khqr:  { enabled: true,  merchant: "Krama (Cambodia) Co., Ltd", account: "krama@aclb" },
    acleda:{ enabled: true,  merchant: "Krama (Cambodia) Co., Ltd", account: "1000-12-345678-9" },
    aba:   { enabled: true,  merchant: "Krama (Cambodia) Co., Ltd", account: "000 123 456" },
    card:  { enabled: true,  merchant: "Krama (Cambodia) Co., Ltd", account: "" },
    cod:   { enabled: true,  merchant: "Krama (Cambodia) Co., Ltd", account: "" },
  };
  const PAY_META = {
    khqr:  { label: "KHQR",              desc: window.KRAMA_T("Scan with any KHQR app — ABA, Wing, ACLEDA & more"),          apiMethod: "khqr"  },
    acleda:{ label: "ACLEDA Bank",        desc: "ACLEDA mobile / transfer",                     apiMethod: "acleda" },
    aba:   { label: "ABA Bank",           desc: "ABA PAY / transfer",                            apiMethod: "aba"    },
    card:  { label: "Card (Visa / Mastercard)", desc: "Pay by Visa or Mastercard",              apiMethod: "card"   },
    cod:   { label: "Cash on Delivery",   desc: "Pay in cash — invoice sent after confirmation", apiMethod: "cod"    },
  };
  const SUB_STATUS_TONE = { pending: "warning", active: "success", trial: "brand", canceled: "neutral", expired: "danger" };
  // A $0 plan is a timed trial only if trial_days is explicitly set (>0); otherwise it's genuinely free forever.
  const planIsTrial = (p) => !!p && Number(p.price) === 0 && Number(p.trial_days) > 0;
  const planIsFree = (p) => !!p && Number(p.price) === 0 && !planIsTrial(p);
  const planIsCustom = (p) => !!p && /enterprise/i.test(p.name || "");

  // Renders a KHQR string to a QR image using the qrcodejs UMD lib (loaded on demand from the CDN).
  function KhqrCanvas({ value, size }) {
    const ref = React.useRef(null);
    React.useEffect(function () {
      var s = size || 200;
      function draw() {
        if (window.QRCode && ref.current && value) {
          ref.current.innerHTML = "";
          new window.QRCode(ref.current, { text: value, width: s, height: s, correctLevel: window.QRCode.CorrectLevel.M });
        }
      }
      if (window.QRCode) { draw(); return; }
      var existing = document.getElementById("qrcode-lib");
      if (existing) { existing.addEventListener("load", draw); return; }
      var sc = document.createElement("script");
      sc.id = "qrcode-lib";
      sc.src = "https://unpkg.com/qrcodejs@1.0.0/qrcode.min.js";
      sc.onload = draw;
      document.head.appendChild(sc);
    }, [value, size]);
    return <div ref={ref} style={{ width: (size || 200), height: (size || 200) }} />;
  }

  // Buy a CV-match credit pack — reuses the standard payment method + KHQR/Stripe flow.
  function BuyCreditsModal({ pricing, onClose, onDone }) {
    const [pay, setPay] = React.useState(PAY_DEFAULTS);
    React.useEffect(function () {
      var apiBase = /^(localhost|127\.0\.0\.1|::1|192\.168\.|10\.)/.test(window.location.hostname) ? 'http://127.0.0.1:8000/api' : (window.location.protocol + '//' + window.location.host + '/api');
      fetch(apiBase + '/settings/payment_config', { cache: 'no-cache' }).then(function (r) { return r.ok ? r.json() : null; }).then(function (d) { if (d && d.data) { try { setPay(Object.assign({}, PAY_DEFAULTS, JSON.parse(d.data))); } catch (e) {} } }).catch(function () {});
    }, []);
    const available = ["cod", "khqr", "aba", "card"].filter((k) => pay[k] && pay[k].enabled);
    const [method, setMethod] = React.useState(available[0] || null);
    React.useEffect(() => { if (!method && available.length) setMethod(available[0]); }, [pay]);
    const [busy, setBusy] = React.useState(false);
    const [error, setError] = React.useState("");
    const [khqr, setKhqr] = React.useState(null);
    const [stripeUrl, setStripeUrl] = React.useState(null);
    const [paymentId, setPaymentId] = React.useState(null);
    const [waiting, setWaiting] = React.useState(false);
    const [done, setDone] = React.useState(false);

    React.useEffect(function () {
      if (!waiting || !paymentId || done) return;
      var t = setInterval(function () {
        emp.verifyPayment(paymentId).then(function (r) { if (r && r.status === "paid") { setDone(true); onDone && onDone(); } }).catch(function () {});
      }, 4000);
      return function () { clearInterval(t); };
    }, [waiting, paymentId, done]);

    const start = () => {
      if (!method || busy) return;
      setBusy(true); setError("");
      emp.cvMatchBuyCredits().then(function (res) {
        setBusy(false);
        var id = res && res.payment && res.payment.id;
        if (!id) { setError("Could not start purchase."); return; }
        setPaymentId(id);
        if (method === "khqr") { setWaiting(true); emp.generateKhqr(id).then(function (d) { setKhqr(d.qr); }).catch(function (e) { setError((e && e.message) || "Could not generate KHQR."); }); }
        else if (method === "card") { emp.stripeCheckout(id).then(function (d) { if (d && d.url) { setStripeUrl(d.url); setWaiting(true); window.open(d.url, "_blank"); } else { setDone(true); } }).catch(function () { setDone(true); }); }
        else if (method === "aba") { setWaiting(true); }
        else { setDone(true); } // cod → admin confirms; credits added on confirmation
      }).catch(function (e) { setBusy(false); setError((e && e.message) || "Purchase failed."); });
    };

    var m = method ? PAY_META[method] : null; var acct = method ? pay[method] : null;

    return (
      <div onClick={onClose} style={{ position: "fixed", inset: 0, zIndex: 200, background: "var(--surface-overlay)", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
        <div onClick={(e) => e.stopPropagation()} style={{ width: "100%", maxWidth: 440, background: "var(--surface-card)", borderRadius: "var(--radius-xl)", boxShadow: "var(--shadow-xl)", overflow: "hidden" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "18px 22px", borderBottom: "1px solid var(--border)" }}>
            <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "var(--text-lg)", color: "var(--text-strong)" }}>{done ? "Purchase complete" : ("Buy " + pricing.pack_size + " CV-match credits")}</div>
            <button onClick={onClose} aria-label="Close" style={{ border: "none", background: "transparent", cursor: "pointer", color: "var(--text-muted)", display: "inline-flex" }}>{I("x", 18)}</button>
          </div>
          {done ? (
            <div style={{ padding: "36px 28px", textAlign: "center" }}>
              <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 60, height: 60, borderRadius: "50%", background: "var(--success-subtle)", color: "var(--success)" }}>{I("circle-check-big", 28)}</span>
              <h2 style={{ fontSize: "var(--text-xl)", fontWeight: 700, color: "var(--text-strong)", marginTop: 16 }}>{waiting || khqr || stripeUrl ? "Credits added!" : "Payment pending"}</h2>
              <p style={{ color: "var(--text-muted)", marginTop: 8, lineHeight: 1.55 }}>{(waiting || khqr || stripeUrl) ? (pricing.pack_size + " credits have been added to your balance.") : "Your credits will be added once payment is confirmed."}</p>
              <Button variant="primary" style={{ marginTop: 20 }} onClick={onClose}>Done</Button>
            </div>
          ) : khqr ? (
            <div style={{ padding: "24px", display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
              <div style={{ padding: 12, border: "1px solid var(--border)", borderRadius: "var(--radius-md)", background: "#fff" }}><KhqrCanvas value={khqr} size={200} /></div>
              <div style={{ fontSize: "var(--text-sm)", color: "var(--text-muted)", textAlign: "center" }}>{window.KRAMA_T("Scan with any KHQR app — ABA, Wing, ACLEDA, Chip Mong, and more. This confirms automatically once paid.")}</div>
              <div style={{ display: "inline-flex", alignItems: "center", gap: 8, color: "var(--text-brand)", fontSize: "var(--text-sm)", fontWeight: 600 }}><span style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--brand)" }} />Waiting for payment…</div>
            </div>
          ) : waiting ? (
            <div style={{ padding: "24px", display: "flex", flexDirection: "column", gap: 14 }}>
              {method === "card" ? <div style={{ fontSize: "var(--text-sm)", color: "var(--text-body)" }}>Complete your card payment in the Stripe window.{stripeUrl && <> <a href={stripeUrl} target="_blank" rel="noopener noreferrer" style={{ color: "var(--text-brand)", fontWeight: 600 }}>Open again →</a></>}</div>
                : acct ? <div style={{ padding: "12px 14px", border: "1px solid var(--border)", borderRadius: "var(--radius-md)", fontSize: "var(--text-sm)", lineHeight: 1.7 }}>Pay via <strong>{m ? m.label : "bank"}</strong><br /><span style={{ color: "var(--text-muted)" }}>{acct.merchant}</span><br /><span style={{ fontFamily: "var(--font-mono)", color: "var(--text-strong)" }}>{acct.account}</span></div> : null}
              <div style={{ display: "inline-flex", alignItems: "center", gap: 8, color: "var(--text-brand)", fontSize: "var(--text-sm)", fontWeight: 600 }}><span style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--brand)" }} />Waiting for payment confirmation…</div>
            </div>
          ) : (
            <div style={{ padding: 22, display: "flex", flexDirection: "column", gap: 16 }}>
              <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", padding: "14px 16px", background: "var(--surface-sunken)", borderRadius: "var(--radius-md)" }}>
                <span style={{ fontWeight: 600, color: "var(--text-body)" }}>{pricing.pack_size} credits</span>
                <strong style={{ fontFamily: "var(--font-display)", fontSize: "var(--text-2xl)", color: "var(--text-strong)" }}>${pricing.pack_price}</strong>
              </div>
              {available.length === 0 ? <div style={{ fontSize: "var(--text-sm)", color: "var(--text-muted)" }}>No payment methods are enabled. Ask an admin to enable one.</div> : (
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {available.map((k) => { var meta = PAY_META[k]; var on = method === k; return (
                    <button key={k} onClick={() => setMethod(k)} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 14px", cursor: "pointer", textAlign: "left", border: "1.5px solid " + (on ? "var(--brand)" : "var(--border-strong)"), background: on ? "var(--brand-subtle)" : "var(--surface-card)", borderRadius: "var(--radius-md)" }}>
                      <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 34, height: 34, borderRadius: "var(--radius-sm)", background: "var(--brand-subtle)", color: "var(--brand)" }}>{I(k === "khqr" ? "qr-code" : k === "cod" ? "banknote" : k === "card" ? "credit-card" : "landmark", 17)}</span>
                      <div style={{ flex: 1 }}><div style={{ fontWeight: 700, fontSize: "var(--text-sm)", color: "var(--text-strong)" }}>{meta.label}</div></div>
                      <span style={{ width: 16, height: 16, borderRadius: "50%", border: "2px solid " + (on ? "var(--brand)" : "var(--border-strong)"), background: on ? "var(--brand)" : "transparent" }} />
                    </button>
                  ); })}
                </div>
              )}
              {error && <div style={{ padding: "10px 14px", background: "var(--danger-subtle)", color: "var(--danger)", borderRadius: "var(--radius-md)", fontSize: "var(--text-sm)" }}>{error}</div>}
              <Button variant="primary" block disabled={!method || busy} onClick={start}>{busy ? "Starting…" : "Continue to pay"}</Button>
            </div>
          )}
        </div>
      </div>
    );
  }

  function EmployerCvMatch() {
    const [cands, setCands] = React.useState([]);
    const [loadingCands, setLoadingCands] = React.useState(true);
    const [credits, setCredits] = React.useState(null); // {balance, pack_size, pack_price, currency, cost_deterministic, cost_ai, enabled}
    const [ref, setRef] = React.useState(null);
    const [engine, setEngine] = React.useState("deterministic");
    const [mode, setMode] = React.useState("suggest");
    const [targets, setTargets] = React.useState([]);
    const [q, setQ] = React.useState("");
    const [results, setResults] = React.useState(null);
    const [running, setRunning] = React.useState(false);
    const [error, setError] = React.useState("");
    const [buyOpen, setBuyOpen] = React.useState(false);
    const [history, setHistory] = React.useState([]);
    const [historyOpen, setHistoryOpen] = React.useState(false);
    const [viewingRun, setViewingRun] = React.useState(null); // {id, created_at} when re-viewing a saved run

    const loadCredits = React.useCallback(function () { emp.cvMatchCredits().then(setCredits).catch(function () {}); }, []);
    const loadHistory = React.useCallback(function () { emp.cvMatchHistory().then(function (d) { setHistory(d.data || []); }).catch(function () {}); }, []);
    React.useEffect(function () {
      setLoadingCands(true);
      emp.cvMatchCandidates().then(function (d) { setCands(d.data || []); setLoadingCands(false); }).catch(function () { setLoadingCands(false); });
      loadCredits();
      loadHistory();
    }, [loadCredits, loadHistory]);

    const fmtDate = function (s) { if (!s) return ""; try { var d = new Date(s); return d.toLocaleDateString(undefined, { month: "short", day: "numeric" }) + " " + d.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" }); } catch (e) { return String(s).slice(0, 16); } };

    const viewSavedRun = function (id) {
      setError(""); setResults(null); setViewingRun(null);
      emp.cvMatchHistoryShow(id).then(function (d) {
        setResults(d.results || []);
        setRef({ id: d.reference.resume_id, name: d.reference.name, headline: d.reference.headline });
        setEngine(d.engine === "ai" ? "ai" : "deterministic");
        setViewingRun({ id: d.run_id, created_at: d.created_at });
        setHistoryOpen(false);
      }).catch(function (e) { setError((e && e.message) || "Could not load saved result."); });
    };

    const cost = credits ? (engine === "ai" ? credits.cost_ai : credits.cost_deterministic) : 0;
    const balance = credits ? credits.balance : 0;
    const insufficient = credits && balance < cost;
    const scoreColor = (s) => s >= 60 ? "var(--success)" : s >= 35 ? "var(--warning)" : "var(--danger)";
    const toggleTarget = (id) => setTargets(function (t) { return t.includes(id) ? t.filter((x) => x !== id) : t.concat(id); });
    const filtered = cands.filter(function (r) { var n = ((r.candidate && r.candidate.name) || "") + " " + (r.headline || ""); return !q || n.toLowerCase().indexOf(q.toLowerCase()) !== -1; });
    const CANDS_PER = 8;
    const [candPage, setCandPage] = React.useState(1);
    React.useEffect(function () { setCandPage(1); }, [q]);
    const candPageSafe = Math.min(Math.max(1, candPage), Math.max(1, Math.ceil(filtered.length / CANDS_PER)));
    const candsShown = filtered.slice((candPageSafe - 1) * CANDS_PER, candPageSafe * CANDS_PER);
    const HIST_PER = 8;
    const [histPage, setHistPage] = React.useState(1);
    const histPageSafe = Math.min(Math.max(1, histPage), Math.max(1, Math.ceil(history.length / HIST_PER)));
    const histShown = history.slice((histPageSafe - 1) * HIST_PER, histPageSafe * HIST_PER);

    const run = () => {
      if (!ref || running) return;
      if (insufficient) { setBuyOpen(true); return; }
      setRunning(true); setError(""); setResults(null); setViewingRun(null);
      var payload = { reference_id: ref.id, engine: engine, mode: mode };
      if (mode === "compare") payload.target_ids = targets; else payload.limit = 3;
      emp.cvMatchRun(payload).then(function (d) {
        setResults(d.results || []);
        setCredits(function (c) { return c ? Object.assign({}, c, { balance: d.balance }) : c; });
        setRunning(false);
        loadHistory();
      }).catch(function (e) {
        setRunning(false);
        if (e && e.need_credits) { setBuyOpen(true); }
        else setError((e && e.message) || "Match failed.");
      });
    };

    return (
      <div className="krm-page-pad" style={{ padding: 28, maxWidth: 1000 }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, marginBottom: 20, flexWrap: "wrap" }}>
          <div>
            <h1 style={{ fontFamily: "var(--font-display)", fontSize: "var(--text-2xl)", fontWeight: 700, color: "var(--text-strong)" }}>CV Match</h1>
            <p style={{ fontSize: "var(--text-sm)", color: "var(--text-muted)", marginTop: 4, maxWidth: 620 }}>Rank your applicants against a reference CV. Standard matching is instant; AI matching adds Claude's semantic scoring. Each comparison spends credits.</p>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 14px", border: "1px solid var(--border)", borderRadius: "var(--radius-md)", background: "var(--surface-card)" }}>
              {I("coins", 16)}<span style={{ fontWeight: 700, color: "var(--text-strong)" }}>{balance}</span><span style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>credits</span>
            </div>
            <Button variant={historyOpen ? "primary" : "secondary"} size="sm" iconLeft={I("history", 15)} onClick={() => setHistoryOpen(function (v) { return !v; })}>History{history.length ? (" (" + history.length + ")") : ""}</Button>
            <Button variant="secondary" size="sm" iconLeft={I("plus", 15)} onClick={() => setBuyOpen(true)}>Buy credits</Button>
          </div>
        </div>

        {historyOpen && (
          <Card padding={0} style={{ marginBottom: 16 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 18px", borderBottom: "1px solid var(--border)" }}>
              <div style={{ fontSize: "var(--text-sm)", fontWeight: 700, color: "var(--text-strong)" }}>Match history</div>
              <span style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>Re-viewing a saved result is free.</span>
            </div>
            {history.length === 0 && <div style={{ padding: 24, textAlign: "center", color: "var(--text-muted)", fontSize: "var(--text-sm)" }}>No past matches yet. Runs you make are saved here.</div>}
            {histShown.map(function (h, i) {
              return (
                <div key={h.id} style={{ display: "grid", gridTemplateColumns: "1.6fr 90px 1fr 90px 100px", alignItems: "center", gap: 10, padding: "11px 18px", borderBottom: i < histShown.length - 1 ? "1px solid var(--border-subtle)" : "none" }}>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontWeight: 600, color: "var(--text-strong)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{h.reference_name || "Reference"}</div>
                    <div style={{ fontSize: "var(--text-xs)", color: "var(--text-faint)" }}>{fmtDate(h.created_at)} · {h.candidate_count} candidate{h.candidate_count === 1 ? "" : "s"}</div>
                  </div>
                  <Badge tone={h.engine === "ai" ? "brand" : "neutral"}>{h.engine === "ai" ? "AI" : "Standard"}</Badge>
                  <span style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>{h.mode === "suggest" ? "Auto-suggest" : "Compare"}</span>
                  <span style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 16, color: scoreColor(h.top_score || 0) }}>{h.top_score != null ? h.top_score + "%" : "—"}</span>
                  <div style={{ textAlign: "right" }}><Button variant="ghost" size="sm" onClick={() => viewSavedRun(h.id)}>View</Button></div>
                </div>
              );
            })}
            <Pager page={histPageSafe} perPage={HIST_PER} total={history.length} onPage={setHistPage} label="runs" />
          </Card>
        )}

        <Card padding={20} style={{ marginBottom: 16 }}>
          <div style={{ fontSize: "var(--text-sm)", fontWeight: 700, color: "var(--text-strong)", marginBottom: 10 }}>1 · Reference CV</div>
          {ref ? (
            <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 14px", border: "1px solid var(--brand)", background: "var(--brand-subtle)", borderRadius: "var(--radius-md)" }}>
              <Avatar name={ref.name} size={34} />
              <div style={{ flex: 1, minWidth: 0 }}><div style={{ fontWeight: 700, color: "var(--text-strong)" }}>{ref.name}</div><div style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>{ref.headline || "—"}</div></div>
              <Button variant="ghost" size="sm" onClick={() => { setRef(null); setResults(null); }}>Change</Button>
            </div>
          ) : <div style={{ fontSize: "var(--text-sm)", color: "var(--text-muted)" }}>Pick one of your applicants below as the reference.</div>}
        </Card>

        {/* engine + mode toggles */}
        <div style={{ display: "flex", gap: 12, marginBottom: 12, flexWrap: "wrap", alignItems: "center" }}>
          <div style={{ display: "flex", gap: 6 }}>
            {[["deterministic", "Standard"], ["ai", "AI ⚡"]].map(function (p) { var id = p[0], label = p[1]; return (
              <button key={id} onClick={() => { setEngine(id); setResults(null); }} style={{ height: 34, padding: "0 14px", borderRadius: "var(--radius-pill)", cursor: "pointer", border: "1px solid " + (engine === id ? "var(--brand)" : "var(--border-strong)"), background: engine === id ? "var(--brand-subtle)" : "var(--surface-card)", color: engine === id ? "var(--text-brand)" : "var(--text-body)", fontFamily: "var(--font-sans)", fontSize: "var(--text-sm)", fontWeight: 600 }}>{label}</button>
            ); })}
          </div>
          <div style={{ display: "flex", gap: 6 }}>
            {[["suggest", "Auto-suggest top 3"], ["compare", "Compare selected"]].map(function (p) { var id = p[0], label = p[1]; return (
              <button key={id} onClick={() => { setMode(id); setResults(null); }} style={{ height: 34, padding: "0 14px", borderRadius: "var(--radius-pill)", cursor: "pointer", border: "1px solid " + (mode === id ? "var(--brand)" : "var(--border-strong)"), background: mode === id ? "var(--brand-subtle)" : "var(--surface-card)", color: mode === id ? "var(--text-brand)" : "var(--text-body)", fontFamily: "var(--font-sans)", fontSize: "var(--text-sm)", fontWeight: 600 }}>{label}</button>
            ); })}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, height: 34, padding: "0 12px", border: "1px solid var(--border-strong)", borderRadius: "var(--radius-md)", background: "var(--surface-card)", width: 220, marginLeft: "auto" }}>
            <span style={{ color: "var(--text-faint)" }}>{I("search", 15)}</span>
            <input placeholder="Search applicants" value={q} onChange={(e) => setQ(e.target.value)} style={{ border: "none", outline: "none", flex: 1, fontFamily: "var(--font-sans)", fontSize: "var(--text-sm)", background: "transparent" }} />
          </div>
        </div>

        <div className="krm-table-wrap"><Card padding={0} style={{ marginBottom: 16 }}>
          <div style={{ display: "grid", gridTemplateColumns: "2fr 2fr 70px 180px", padding: "10px 18px", fontSize: "var(--text-xs)", fontWeight: 700, letterSpacing: ".04em", textTransform: "uppercase", color: "var(--text-faint)", borderBottom: "1px solid var(--border)" }}>
            <span>Applicant</span><span>Headline</span><span>Skills</span><span style={{ textAlign: "right" }}>Action</span>
          </div>
          {loadingCands && <div style={{ padding: 24, textAlign: "center", color: "var(--text-muted)", fontSize: "var(--text-sm)" }}>Loading…</div>}
          {!loadingCands && filtered.length === 0 && <div style={{ padding: 28, textAlign: "center", color: "var(--text-muted)", fontSize: "var(--text-sm)" }}>No applicant résumés yet. Candidates who apply to your jobs appear here.</div>}
          {!loadingCands && candsShown.map(function (r, i) {
            var c = r.candidate || {}; var isRef = ref && ref.id === r.id; var isTarget = targets.includes(r.id);
            return (
              <div key={r.id} style={{ display: "grid", gridTemplateColumns: "2fr 2fr 70px 180px", alignItems: "center", padding: "12px 18px", borderBottom: i < candsShown.length - 1 ? "1px solid var(--border-subtle)" : "none", background: isRef ? "var(--brand-subtle)" : "transparent" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}><Avatar name={c.name} size={30} /><span style={{ fontWeight: 600, color: "var(--text-strong)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{c.name}</span></div>
                <span style={{ fontSize: "var(--text-sm)", color: "var(--text-muted)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.headline || "—"}</span>
                <span style={{ fontFamily: "var(--font-mono)", fontSize: "var(--text-sm)", color: "var(--text-body)" }}>{r.skills}</span>
                <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
                  {isRef ? <Badge tone="brand">Reference</Badge> : (
                    <React.Fragment>
                      <Button variant="secondary" size="sm" onClick={() => { setRef({ id: r.id, name: c.name, headline: r.headline }); setResults(null); }}>Set ref</Button>
                      {mode === "compare" && <Button variant={isTarget ? "primary" : "ghost"} size="sm" onClick={() => toggleTarget(r.id)}>{isTarget ? "✓" : "Add"}</Button>}
                    </React.Fragment>
                  )}
                </div>
              </div>
            );
          })}
          {!loadingCands && <Pager page={candPageSafe} perPage={CANDS_PER} total={filtered.length} onPage={setCandPage} label="applicants" />}
        </Card></div>

        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20, flexWrap: "wrap" }}>
          <Button variant="primary" disabled={!ref || running || (mode === "compare" && targets.length === 0)} onClick={run}>
            {running ? "Matching…" : insufficient ? ("Buy credits to run (" + cost + " needed)") : (engine === "ai" ? "Run AI match" : "Run match") + " · " + cost + " credit" + (cost === 1 ? "" : "s")}
          </Button>
          <span style={{ fontSize: "var(--text-sm)", color: "var(--text-muted)" }}>Balance: <strong style={{ color: insufficient ? "var(--danger)" : "var(--text-body)" }}>{balance}</strong>{mode === "compare" && targets.length > 0 ? (" · " + targets.length + " selected") : ""}</span>
          {error && <span style={{ color: "var(--danger)", fontSize: "var(--text-sm)" }}>{error}</span>}
        </div>

        {results && (
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12, flexWrap: "wrap" }}>
              <span style={{ fontSize: "var(--text-sm)", fontWeight: 700, color: "var(--text-strong)" }}>Results{engine === "ai" ? " (AI)" : ""} — ranked by match{ref ? (" against " + ref.name) : ""}</span>
              {viewingRun && <Badge tone="neutral">{I("history", 12)} Saved · {fmtDate(viewingRun.created_at)} · free</Badge>}
            </div>
            {results.length === 0 && <div style={{ fontSize: "var(--text-sm)", color: "var(--text-muted)" }}>No matches found.</div>}
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {results.map(function (r, idx) { return (
                <Card key={r.resume_id} padding={18}>
                  <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                    <div style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 20, color: "var(--text-faint)", width: 24, textAlign: "center" }}>{idx + 1}</div>
                    <Avatar name={r.candidate.name} size={40} />
                    <div style={{ flex: 1, minWidth: 0 }}><div style={{ fontWeight: 700, color: "var(--text-strong)" }}>{r.candidate.name}</div><div style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>{r.headline || "—"}</div></div>
                    <div style={{ textAlign: "right" }}><div style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 24, color: scoreColor(r.score) }}>{r.score}%</div><div style={{ fontSize: "var(--text-xs)", color: "var(--text-faint)" }}>match</div></div>
                  </div>
                  <div style={{ height: 6, background: "var(--surface-sunken)", borderRadius: 3, overflow: "hidden", margin: "12px 0" }}><div style={{ height: "100%", width: r.score + "%", background: scoreColor(r.score), borderRadius: 3 }} /></div>
                  {r.breakdown && r.breakdown.reason ? <div style={{ fontSize: "var(--text-sm)", color: "var(--text-body)", marginBottom: 8, fontStyle: "italic" }}>{r.breakdown.reason}</div> : null}
                  {r.breakdown && r.breakdown.matched_skills && r.breakdown.matched_skills.length > 0 && <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 6 }}>{r.breakdown.matched_skills.map(function (s, i) { return <span key={i} style={{ fontSize: "var(--text-xs)", padding: "2px 8px", borderRadius: "var(--radius-pill)", background: "var(--success-subtle)", color: "var(--success)", fontWeight: 600 }}>{s}</span>; })}</div>}
                  {r.breakdown && r.breakdown.missing_skills && r.breakdown.missing_skills.length > 0 && <div style={{ display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center" }}><span style={{ fontSize: "var(--text-xs)", color: "var(--text-faint)" }}>Missing:</span>{r.breakdown.missing_skills.map(function (s, i) { return <span key={i} style={{ fontSize: "var(--text-xs)", padding: "2px 8px", borderRadius: "var(--radius-pill)", background: "var(--surface-sunken)", color: "var(--text-muted)" }}>{s}</span>; })}</div>}
                </Card>
              ); })}
            </div>
          </div>
        )}

        {buyOpen && credits && <BuyCreditsModal pricing={credits} onClose={() => setBuyOpen(false)} onDone={function () { loadCredits(); }} />}
      </div>
    );
  }

  function CheckoutModal({ plan, onClose, onPaid }) {
    const planFeatures = function(p) { return Array.isArray(p.features_json) ? p.features_json : (Array.isArray(p.features) ? p.features : []); };
    const isTrial = planIsTrial(plan);
    const isFree = planIsFree(plan);
    const [pay, setPay] = React.useState(PAY_DEFAULTS);
    React.useEffect(function() {
      var apiBase = /^(localhost|127\.0\.0\.1|::1|192\.168\.|10\.)/.test(window.location.hostname) ? 'http://127.0.0.1:8000/api' : (window.location.protocol + '//' + window.location.host + '/api');
      fetch(apiBase + '/settings/payment_config', { cache: 'no-cache' })
        .then(function(r) { return r.ok ? r.json() : null; })
        .then(function(d) {
          if (d && d.data) { try { setPay(Object.assign({}, PAY_DEFAULTS, JSON.parse(d.data))); } catch (e) {} }
        })
        .catch(function() {});
    }, []);
    const trialDays = plan ? (plan.trial_days || 7) : 7;
    // ACLEDA hidden for now (no gateway/API docs yet) — add "acleda" back to this list to restore it.
    const available = ["cod", "khqr", "aba", "card"].filter((k) => pay[k] && pay[k].enabled);
    const [method, setMethod] = React.useState(available[0] || null);
    const [done, setDone] = React.useState(false);
    const [error, setError] = React.useState("");
    const [busy, setBusy] = React.useState(false);
    const [khqr, setKhqr] = React.useState(null);
    const [stripeUrl, setStripeUrl] = React.useState(null);
    const [paymentId, setPaymentId] = React.useState(null);
    const [waiting, setWaiting] = React.useState(false);
    React.useEffect(() => { if (plan) { setDone(false); setMethod(available[0] || null); setError(""); setKhqr(null); setStripeUrl(null); setPaymentId(null); setWaiting(false); } }, [plan]);

    // While awaiting a gateway payment (KHQR/Bakong, ABA, or Stripe card), poll the backend
    // which verifies the payment against the gateway and fulfills it on confirmation.
    React.useEffect(function () {
      if (!waiting || !paymentId || done) return;
      var t = setInterval(function () {
        emp.verifyPayment(paymentId).then(function (r) {
          if (r && r.status === "paid") { setDone(true); onPaid && onPaid(); }
        }).catch(function () {});
      }, 4000);
      return function () { clearInterval(t); };
    }, [waiting, paymentId, done]);

    if (!plan) return null;
    const m = method ? PAY_META[method] : null;
    const acct = method ? pay[method] : null;

    const confirm = () => {
      if (!isTrial && !isFree && !method) return;
      setBusy(true); setError("");
      emp.subscribe(plan.id, isTrial ? "trial" : (isFree ? "other" : PAY_META[method].apiMethod))
        .then(function (res) {
          setBusy(false);
          // KHQR / ABA / Card(Stripe): enter the waiting state and poll for gateway confirmation.
          if (res && res.payment && res.payment.id && (method === "khqr" || method === "aba" || method === "card")) {
            onPaid && onPaid(); // refresh billing list in the background
            if (method === "khqr") {
              setPaymentId(res.payment.id); setWaiting(true);
              emp.generateKhqr(res.payment.id)
                .then(function (d) { setKhqr(d.qr); })
                .catch(function (e) { setError((e && e.message) || "Could not generate KHQR. You can still pay and an admin will confirm."); });
            } else if (method === "card") {
              // Create a Stripe Checkout session, open it, then poll. If not configured → manual pending.
              emp.stripeCheckout(res.payment.id)
                .then(function (d) {
                  if (d && d.url) { setPaymentId(res.payment.id); setStripeUrl(d.url); setWaiting(true); window.open(d.url, "_blank"); }
                  else { setDone(true); }
                })
                .catch(function () { setDone(true); });
            } else {
              setPaymentId(res.payment.id); setWaiting(true); // aba
            }
          } else {
            setDone(true); onPaid && onPaid();
          }
        })
        .catch(function (e) { setBusy(false); setError((e && e.message) || "Subscription failed."); });
    };

    return (
      <div onClick={onClose} style={{ position: "fixed", inset: 0, zIndex: 200, background: "var(--surface-overlay)", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
        <div onClick={(e) => e.stopPropagation()} style={{ width: "100%", maxWidth: 460, background: "var(--surface-card)", borderRadius: "var(--radius-xl)", boxShadow: "var(--shadow-xl)", overflow: "hidden" }}>
          {!done ? (
            khqr ? (
              <React.Fragment>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "18px 22px", borderBottom: "1px solid var(--border)" }}>
                  <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "var(--text-lg)", color: "var(--text-strong)" }}>Scan to pay ${plan.price}</div>
                  <button onClick={onClose} aria-label="Close" style={{ border: "none", background: "transparent", cursor: "pointer", color: "var(--text-muted)", display: "inline-flex" }}>{I("x", 18)}</button>
                </div>
                <div style={{ padding: "26px 22px", display: "flex", flexDirection: "column", alignItems: "center", gap: 14 }}>
                  <div style={{ padding: 12, border: "1px solid var(--border)", borderRadius: "var(--radius-md)", background: "#fff" }}>
                    <KhqrCanvas value={khqr} size={220} />
                  </div>
                  <div style={{ fontSize: "var(--text-sm)", color: "var(--text-muted)", textAlign: "center", lineHeight: 1.55 }}>
                    Open any Cambodian banking app, choose <strong style={{ color: "var(--text-body)" }}>Scan KHQR</strong>, and pay. This page confirms automatically once payment is received.
                  </div>
                  <div style={{ display: "inline-flex", alignItems: "center", gap: 8, color: "var(--text-brand)", fontSize: "var(--text-sm)", fontWeight: 600 }}>
                    <span style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--brand)", display: "inline-block", animation: "pulse 1.4s ease-in-out infinite" }} />
                    Waiting for payment…
                  </div>
                  {error && <div style={{ padding: "10px 14px", background: "var(--danger-subtle)", color: "var(--danger)", borderRadius: "var(--radius-md)", fontSize: "var(--text-sm)", width: "100%", textAlign: "center" }}>{error}</div>}
                </div>
                <div style={{ display: "flex", gap: 10, padding: "16px 22px", borderTop: "1px solid var(--border)" }}>
                  <Button variant="ghost" block onClick={onClose}>I'll finish later</Button>
                </div>
              </React.Fragment>
            ) :
            waiting ? (
              <React.Fragment>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "18px 22px", borderBottom: "1px solid var(--border)" }}>
                  <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "var(--text-lg)", color: "var(--text-strong)" }}>Complete your ${plan.price} payment</div>
                  <button onClick={onClose} aria-label="Close" style={{ border: "none", background: "transparent", cursor: "pointer", color: "var(--text-muted)", display: "inline-flex" }}>{I("x", 18)}</button>
                </div>
                <div style={{ padding: "22px", display: "flex", flexDirection: "column", gap: 16 }}>
                  {method === "card" ? (
                    <div style={{ display: "flex", gap: 12, alignItems: "flex-start", padding: "14px 16px", border: "1px solid var(--border)", borderRadius: "var(--radius-md)", background: "var(--surface-sunken)" }}>
                      {I("credit-card", 20)}
                      <div style={{ fontSize: "var(--text-sm)", color: "var(--text-body)", lineHeight: 1.6 }}>
                        <strong>Secure card checkout</strong><br />
                        <span style={{ color: "var(--text-muted)" }}>Complete your Visa / Mastercard payment in the Stripe window that opened.</span>
                        {stripeUrl && <><br /><a href={stripeUrl} target="_blank" rel="noopener noreferrer" style={{ color: "var(--text-brand)", fontWeight: 600, display: "inline-block", marginTop: 6 }}>Didn't open? Open payment page →</a></>}
                      </div>
                    </div>
                  ) : acct ? (
                    <div style={{ padding: "14px 16px", border: "1px solid var(--border)", borderRadius: "var(--radius-md)", fontSize: "var(--text-sm)", color: "var(--text-body)", lineHeight: 1.7 }}>
                      Pay via <strong>{m ? m.label : "ABA"}</strong> to<br />
                      <span style={{ color: "var(--text-muted)" }}>{acct.merchant}</span><br />
                      <span style={{ fontFamily: "var(--font-mono)", color: "var(--text-strong)" }}>{acct.account}</span>
                    </div>
                  ) : null}
                  <div style={{ display: "inline-flex", alignItems: "center", gap: 8, color: "var(--text-brand)", fontSize: "var(--text-sm)", fontWeight: 600 }}>
                    <span style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--brand)", display: "inline-block" }} />
                    Waiting for payment confirmation…
                  </div>
                  <div style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)", lineHeight: 1.55 }}>This page confirms automatically once your payment is verified. You can safely close this — your plan activates as soon as payment is received.</div>
                </div>
                <div style={{ display: "flex", gap: 10, padding: "16px 22px", borderTop: "1px solid var(--border)" }}>
                  <Button variant="ghost" block onClick={onClose}>I'll finish later</Button>
                </div>
              </React.Fragment>
            ) :
            (isTrial || isFree) ? (
              <React.Fragment>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "18px 22px", borderBottom: "1px solid var(--border)" }}>
                  <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "var(--text-lg)", color: "var(--text-strong)" }}>{isFree ? ("Get started with " + plan.name) : ("Start your " + trialDays + "-day free trial")}</div>
                  <button onClick={onClose} aria-label="Close" style={{ border: "none", background: "transparent", cursor: "pointer", color: "var(--text-muted)", display: "inline-flex" }}>{I("x", 18)}</button>
                </div>
                <div style={{ padding: 22, display: "flex", flexDirection: "column", gap: 16 }}>
                  <div style={{ display: "flex", gap: 14, alignItems: "flex-start", padding: "16px", background: "var(--brand-subtle)", borderRadius: "var(--radius-md)", border: "1px solid var(--brand-border, var(--brand))" }}>
                    {I(isFree ? "sparkles" : "clock", 20)}
                    <div>
                      <div style={{ fontWeight: 700, color: "var(--text-strong)", fontSize: "var(--text-sm)" }}>{isFree ? "Free forever" : ("Free for " + trialDays + " days")}</div>
                      <div style={{ fontSize: "var(--text-sm)", color: "var(--text-muted)", marginTop: 4, lineHeight: 1.55 }}>{isFree ? <React.Fragment>The <strong style={{ color: "var(--text-body)" }}>{plan.name}</strong> plan is free, no card required. You can upgrade anytime.</React.Fragment> : <React.Fragment>Try all features included in the <strong style={{ color: "var(--text-body)" }}>{plan.name}</strong> plan at no cost. No payment required to start.</React.Fragment>}</div>
                    </div>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
                    {plan.job_post_limit != null && (
                      <div style={{ display: "flex", gap: 8, fontSize: "var(--text-sm)", color: "var(--text-body)" }}>
                        <span style={{ color: "var(--brand)", flexShrink: 0 }}>{I("briefcase", 16)}</span>
                        {plan.job_post_limit} job post{plan.job_post_limit !== 1 ? "s" : ""}
                      </div>
                    )}
                    {planFeatures && planFeatures(plan).map(function(f, idx) { return (
                      <div key={idx} style={{ display: "flex", gap: 8, fontSize: "var(--text-sm)", color: "var(--text-body)" }}>
                        <span style={{ color: "var(--brand)", flexShrink: 0 }}>{I("check", 16)}</span>{f}
                      </div>
                    ); })}
                  </div>
                  {error && <div style={{ padding: "10px 14px", background: "var(--danger-subtle)", color: "var(--danger)", borderRadius: "var(--radius-md)", fontSize: "var(--text-sm)" }}>{error}</div>}
                </div>
                <div style={{ display: "flex", gap: 10, padding: "16px 22px", borderTop: "1px solid var(--border)" }}>
                  <Button variant="ghost" onClick={onClose}>Cancel</Button>
                  <Button variant="primary" block disabled={busy} onClick={confirm}>{busy ? "Starting…" : (isFree ? "Get started" : "Start free trial")}</Button>
                </div>
              </React.Fragment>
            ) : (
            <React.Fragment>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "18px 22px", borderBottom: "1px solid var(--border)" }}>
                <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "var(--text-lg)", color: "var(--text-strong)" }}>Upgrade to {plan.name}</div>
                <button onClick={onClose} aria-label="Close" style={{ border: "none", background: "transparent", cursor: "pointer", color: "var(--text-muted)", display: "inline-flex" }}>{I("x", 18)}</button>
              </div>
              <div style={{ padding: 22, display: "flex", flexDirection: "column", gap: 16, maxHeight: "66vh", overflowY: "auto" }}>
                <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", padding: "14px 16px", background: "var(--surface-sunken)", borderRadius: "var(--radius-md)" }}>
                  <span style={{ fontWeight: 600, color: "var(--text-body)" }}>{plan.name} plan</span>
                  <span><strong style={{ fontFamily: "var(--font-display)", fontSize: "var(--text-2xl)", color: "var(--text-strong)" }}>${plan.price}</strong><span style={{ color: "var(--text-muted)", fontSize: "var(--text-sm)" }}> / {plan.interval}</span></span>
                </div>
                <div>
                  <div style={{ fontSize: "var(--text-sm)", fontWeight: 700, color: "var(--text-strong)", marginBottom: 10 }}>Payment method</div>
                  {available.length === 0 ? (
                    <div style={{ fontSize: "var(--text-sm)", color: "var(--text-muted)", padding: "12px 14px", border: "1px solid var(--border)", borderRadius: "var(--radius-md)" }}>No payment methods are enabled. Ask an admin to enable one in Payment settings.</div>
                  ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                      {available.map((k) => {
                        const meta = PAY_META[k]; const on = method === k;
                        return (
                          <button key={k} onClick={() => setMethod(k)} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 14px", cursor: "pointer", textAlign: "left", border: "1.5px solid " + (on ? "var(--brand)" : "var(--border-strong)"), background: on ? "var(--brand-subtle)" : "var(--surface-card)", borderRadius: "var(--radius-md)" }}>
                            <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 38, height: 38, borderRadius: "var(--radius-sm)", background: "var(--brand-subtle)", color: "var(--brand)" }}>{I(k === "khqr" ? "qr-code" : k === "cod" ? "banknote" : k === "card" ? "credit-card" : "landmark", 19)}</span>
                            <div style={{ flex: 1 }}>
                              <div style={{ fontWeight: 700, fontSize: "var(--text-sm)", color: "var(--text-strong)" }}>{meta.label}</div>
                              <div style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>{meta.desc}</div>
                            </div>
                            <span style={{ width: 18, height: 18, borderRadius: "50%", border: "2px solid " + (on ? "var(--brand)" : "var(--border-strong)"), background: on ? "var(--brand)" : "transparent", display: "inline-flex", alignItems: "center", justifyContent: "center", color: "#fff" }}>{on ? I("check", 11) : null}</span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
                {m && acct ? (
                  method === "khqr" ? (
                    <div style={{ display: "flex", gap: 12, alignItems: "flex-start", padding: "14px 16px", border: "1px solid var(--border)", borderRadius: "var(--radius-md)", background: "var(--surface-sunken)" }}>
                      {I("qr-code", 20)}
                      <div style={{ fontSize: "var(--text-sm)", color: "var(--text-body)", lineHeight: 1.6 }}>
                        <strong>KHQR</strong><br />
                        <span style={{ color: "var(--text-muted)" }}>Continue to get a KHQR code to scan with any Cambodian banking app. Your plan activates automatically once payment is confirmed.</span>
                      </div>
                    </div>
                  ) : method === "cod" ? (
                    <div style={{ display: "flex", gap: 12, alignItems: "flex-start", padding: "14px 16px", border: "1px solid var(--border)", borderRadius: "var(--radius-md)", background: "var(--surface-sunken)" }}>
                      {I("banknote", 20)}
                      <div style={{ fontSize: "var(--text-sm)", color: "var(--text-body)", lineHeight: 1.6 }}>
                        <strong>Cash on Delivery</strong><br />
                        <span style={{ color: "var(--text-muted)" }}>An invoice will be sent to your registered email. Our team will contact you to arrange payment in person. Your plan activates after admin confirmation.</span>
                        {acct.account && <><br /><span style={{ color: "var(--text-muted)", marginTop: 4, display: "block" }}>Contact: <strong style={{ color: "var(--text-strong)" }}>{acct.account}</strong></span></>}
                      </div>
                    </div>
                  ) : method === "card" ? (
                    <div style={{ display: "flex", gap: 12, alignItems: "flex-start", padding: "14px 16px", border: "1px solid var(--border)", borderRadius: "var(--radius-md)", background: "var(--surface-sunken)" }}>
                      {I("credit-card", 20)}
                      <div style={{ fontSize: "var(--text-sm)", color: "var(--text-body)", lineHeight: 1.6 }}>
                        <strong>Visa / Mastercard</strong><br />
                        <span style={{ color: "var(--text-muted)" }}>You'll be taken to Stripe's secure checkout to pay by card. Your plan activates automatically once payment is confirmed.</span>
                      </div>
                    </div>
                  ) : (
                    <div style={{ padding: "14px 16px", border: "1px solid var(--border)", borderRadius: "var(--radius-md)", fontSize: "var(--text-sm)", color: "var(--text-body)" }}>
                      Transfer to <strong>{m.label}</strong><br />
                      <span style={{ color: "var(--text-muted)" }}>{acct.merchant}</span><br />
                      <span style={{ fontFamily: "var(--font-mono)", color: "var(--text-strong)" }}>{acct.account}</span>
                    </div>
                  )
                ) : null}
                {error && <div style={{ padding: "10px 14px", background: "var(--danger-subtle)", color: "var(--danger)", borderRadius: "var(--radius-md)", fontSize: "var(--text-sm)" }}>{error}</div>}
              </div>
              <div style={{ display: "flex", gap: 10, padding: "16px 22px", borderTop: "1px solid var(--border)" }}>
                <Button variant="ghost" onClick={onClose}>Cancel</Button>
                <Button variant="primary" block disabled={!method || busy} onClick={confirm}>{busy ? "Processing…" : (method === "khqr" || method === "aba" || method === "card") ? "Continue to pay" : method === "cod" ? "Confirm order" : "Confirm payment"}</Button>
              </div>
            </React.Fragment>
            )
          ) : (
            <div style={{ padding: "40px 32px", textAlign: "center" }}>
              <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 64, height: 64, borderRadius: "50%", background: "var(--success-subtle)", color: "var(--success)" }}>{I("circle-check-big", 30)}</span>
              <h2 style={{ fontSize: "var(--text-2xl)", fontWeight: 700, color: "var(--text-strong)", marginTop: 18 }}>{isTrial ? "Trial started!" : isFree ? "You're all set!" : ((method === "khqr" || method === "aba" || method === "card") ? "Payment confirmed!" : "Subscription created")}</h2>
              <p style={{ color: "var(--text-muted)", marginTop: 8, lineHeight: 1.55 }}>
                {isTrial
                  ? <span>Your <strong style={{ color: "var(--text-body)" }}>{trialDays}-day free trial</strong> is now active. Enjoy full access to the <strong style={{ color: "var(--text-body)" }}>{plan.name}</strong> plan features.</span>
                  : isFree
                  ? <span>You're now on the <strong style={{ color: "var(--text-body)" }}>{plan.name}</strong> plan — free, active immediately, no payment needed.</span>
                  : (method === "khqr" || method === "aba" || method === "card")
                  ? <span>Payment received — you're now on the <strong style={{ color: "var(--text-body)" }}>{plan.name}</strong> plan, active immediately.</span>
                  : <span>You're now on the <strong style={{ color: "var(--text-body)" }}>{plan.name}</strong> plan, paid via {method ? PAY_META[method].label : ""}. Payment is pending admin confirmation.</span>
                }
              </p>
              <Button variant="primary" style={{ marginTop: 22 }} onClick={onClose}>Done</Button>
            </div>
          )}
        </div>
      </div>
    );
  }

  function Billing({ onSubChange }) {
    const [plans, setPlans] = React.useState([]);
    const [sub, setSub] = React.useState(null);
    const [allSubs, setAllSubs] = React.useState([]);
    const [quota, setQuota] = React.useState({ used: 0, remaining: null, limit: null });
    const [payments, setPayments] = React.useState([]);
    const [payMeta, setPayMeta] = React.useState({ total: 0, last_page: 1, current_page: 1 });
    const [loading, setLoading] = React.useState(true);
    const [payLoading, setPayLoading] = React.useState(false);
    const [checkout, setCheckout] = React.useState(null);
    const [invPage, setInvPage] = React.useState(1);
    const [usedPlanIds, setUsedPlanIds] = React.useState([]);

    const fetchPayHistory = React.useCallback(function (page) {
      setPayLoading(true);
      emp.fetchPayments(page).then(function (r) {
        setPayments(r.data || []);
        setPayMeta({ total: r.total || 0, last_page: r.last_page || 1, current_page: r.current_page || page });
        setPayLoading(false);
      }).catch(function () { setPayLoading(false); });
    }, []);

    const load = React.useCallback(function () {
      setLoading(true);
      Promise.all([emp.fetchPlans(), emp.fetchSubscription()])
        .then(function (r) {
          setPlans(Array.isArray(r[0]) ? r[0] : (r[0].data || []));
          var subResp = r[1] || {};
          var latestSub = subResp.subscription || null;
          setSub(latestSub);
          setAllSubs(Array.isArray(subResp.all_subscriptions) ? subResp.all_subscriptions : []);
          setQuota({ used: subResp.jobs_used || 0, remaining: subResp.jobs_remaining !== undefined ? subResp.jobs_remaining : null, limit: subResp.jobs_limit !== undefined ? subResp.jobs_limit : null });
          setUsedPlanIds(Array.isArray(subResp.used_plan_ids) ? subResp.used_plan_ids : []);
          if (onSubChange) onSubChange();
          setLoading(false);
          return latestSub;
        }).catch(function () { setLoading(false); return null; });
      fetchPayHistory(1);
    }, [fetchPayHistory]);
    React.useEffect(function () { load(); }, [load]);

    // Auto-poll when subscription is pending payment confirmation
    React.useEffect(function () {
      if (!sub || sub.status !== "pending") return;
      var timer = setInterval(function () {
        emp.fetchSubscription().then(function (r) {
          var latestSub = (r && r.subscription) || null;
          if (latestSub && latestSub.status !== "pending") {
            setSub(latestSub);
            setAllSubs(Array.isArray(r.all_subscriptions) ? r.all_subscriptions : []);
            setQuota({ used: r.jobs_used || 0, remaining: r.jobs_remaining !== undefined ? r.jobs_remaining : null, limit: r.jobs_limit !== undefined ? r.jobs_limit : null });
            if (onSubChange) onSubChange();
            fetchPayHistory(1);
          }
        }).catch(function () {});
      }, 10000);
      return function () { clearInterval(timer); };
    }, [sub && sub.status]);

    const currentPlanId = sub && sub.plan ? sub.plan.id : null;
    const invSlice = payments;
    const invSafe = payMeta.current_page;
    const invPages = payMeta.last_page;
    const INV_PER = 10;
    const fmtDate = (iso) => { if (!iso) return "—"; var d = new Date(iso); return d.getDate() + " " + ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"][d.getMonth()] + " " + d.getFullYear(); };
    const planFeatures = (p) => Array.isArray(p.features_json) ? p.features_json : (Array.isArray(p.features) ? p.features : []);

    return (
      <div className="krm-page-pad" style={{ padding: 28 }}>
        <ScreenHead title="Plan & billing" sub="Manage your subscription and billing history." />
        {loading ? <div style={{ color: "var(--text-muted)", fontSize: "var(--text-sm)" }}>Loading…</div> : (
        <React.Fragment>
        {sub && sub.plan && (
          <div className="krm-stats-grid" style={{ marginBottom: 24, borderRadius: "var(--radius-lg)", border: "1px solid " + (sub.status === "expired" ? "var(--danger, #ef4444)" : sub.status === "pending" ? "var(--warning-border, #fcd34d)" : "var(--border)"), overflow: "hidden" }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)" }}>
              <div style={{ padding: "16px 20px", borderRight: "1px solid var(--border)", background: "var(--surface-card)" }}>
                <div style={{ fontSize: "var(--text-xs)", fontWeight: 700, color: "var(--text-faint)", textTransform: "uppercase", letterSpacing: ".05em", marginBottom: 6 }}>Current plan</div>
                <div style={{ fontWeight: 700, color: "var(--text-strong)", fontSize: "var(--text-sm)" }}>{sub.status === "trial" ? "Trial — " + sub.plan.name : sub.plan.name}</div>
              </div>
              <div style={{ padding: "16px 20px", borderRight: "1px solid var(--border)", background: "var(--surface-card)" }}>
                <div style={{ fontSize: "var(--text-xs)", fontWeight: 700, color: "var(--text-faint)", textTransform: "uppercase", letterSpacing: ".05em", marginBottom: 6 }}>Status</div>
                <Badge tone={SUB_STATUS_TONE[sub.status] || "neutral"}>{(sub.status || "").replace("_", " ")}</Badge>
              </div>
              <div style={{ padding: "16px 20px", borderRight: "1px solid var(--border)", background: "var(--surface-card)" }}>
                <div style={{ fontSize: "var(--text-xs)", fontWeight: 700, color: "var(--text-faint)", textTransform: "uppercase", letterSpacing: ".05em", marginBottom: 6 }}>Started</div>
                <div style={{ fontWeight: 600, color: "var(--text-body)", fontSize: "var(--text-sm)" }}>{fmtDate(sub.started_at || sub.created_at)}</div>
              </div>
              <div style={{ padding: "16px 20px", background: "var(--surface-card)" }}>
                <div style={{ fontSize: "var(--text-xs)", fontWeight: 700, color: "var(--text-faint)", textTransform: "uppercase", letterSpacing: ".05em", marginBottom: 6 }}>{sub.status === "expired" ? "Expired on" : sub.status === "pending" ? "Activates on" : "Renews"}</div>
                <div style={{ fontWeight: 600, color: sub.status === "expired" ? "var(--danger)" : "var(--text-body)", fontSize: "var(--text-sm)" }}>{fmtDate(sub.renews_at)}</div>
              </div>
            </div>
            {/* Per-subscription job quota rows */}
            {allSubs.length > 0 && allSubs.map(function(s, idx) {
              var lim = s.jobs_limit;
              var used = s.jobs_used || 0;
              var rem = s.jobs_remaining;
              var full = lim !== null && rem <= 0;
              var planName = s.plan ? s.plan.name : "Plan";
              var isCustom = s.job_post_limit != null;
              var label = isCustom ? planName + " · Custom slots (Admin assigned)" : planName;
              var statusTone = { active: "var(--brand)", trial: "var(--brand)", pending: "var(--warning, #f59e0b)", expired: "var(--danger)", canceled: "var(--text-faint)" };
              var barColor = full ? "var(--danger)" : (lim !== null && used / lim > 0.8) ? "var(--warning, #f59e0b)" : "var(--brand)";
              return (
                <div key={s.id} style={{ padding: "12px 20px", borderTop: "1px solid var(--border)", background: idx % 2 === 0 ? "var(--surface-sunken, var(--surface-card))" : "var(--surface-card)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ fontSize: "var(--text-xs)", fontWeight: 700, color: "var(--text-faint)", textTransform: "uppercase", letterSpacing: ".05em" }}>Live job posts</span>
                      <span style={{ fontSize: "var(--text-xs)", color: statusTone[s.status] || "var(--text-muted)", fontWeight: 600, background: "var(--surface-page)", border: "1px solid var(--border)", borderRadius: "var(--radius-full)", padding: "1px 8px" }}>{label}</span>
                      {full && <span style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>Close a job to free a slot, or upgrade your plan for more.</span>}
                    </div>
                    {lim !== null
                      ? <span style={{ fontSize: "var(--text-sm)", fontWeight: 700, color: full ? "var(--danger)" : "var(--text-body)", whiteSpace: "nowrap" }}>{used} / {lim} · {full ? "Limit reached" : rem + " remaining"}</span>
                      : <span style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)", display: "flex", alignItems: "center", gap: 4 }}>{I("infinity", 13)} Unlimited</span>
                    }
                  </div>
                  <div style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)", display: "flex", alignItems: "center", gap: 5, marginBottom: lim !== null ? 6 : 0 }}>
                    {I("calendar", 12)}
                    <span>Started {fmtDate(s.started_at)}</span>
                    <span style={{ color: "var(--text-faint)" }}>·</span>
                    <span style={{ color: s.status === "expired" ? "var(--danger)" : "var(--text-muted)" }}>{s.renews_at ? "Expires " + fmtDate(s.renews_at) : "No expiry"}</span>
                  </div>
                  {lim !== null && (
                    <div style={{ height: 5, borderRadius: 99, background: "var(--border)", overflow: "hidden" }}>
                      <div style={{ height: "100%", borderRadius: 99, width: Math.min(100, lim > 0 ? Math.round((used / lim) * 100) : 0) + "%", background: barColor }} />
                    </div>
                  )}
                </div>
              );
            })}
            {allSubs.length === 0 && quota.limit === null && sub.status !== "expired" && (
              <div style={{ padding: "10px 20px", borderTop: "1px solid var(--border)", background: "var(--surface-sunken, var(--surface-card))", fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>
                {I("infinity", 14)} Unlimited job posts included in this plan
              </div>
            )}
          </div>
        )}
        {sub && sub.status === "pending" && (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, padding: "12px 16px", background: "var(--warning-subtle, #fffbeb)", border: "1px solid var(--warning-border, #fcd34d)", borderRadius: "var(--radius-md)", color: "var(--warning-fg, #92400e)", fontWeight: 600, fontSize: "var(--text-sm)", marginBottom: 20 }}>
            <span style={{ display: "flex", alignItems: "center", gap: 8 }}>{I("clock", 16)} Awaiting payment confirmation from admin. Your plan will activate automatically once confirmed.</span>
            <Button variant="secondary" size="sm" onClick={load}>Check now</Button>
          </div>
        )}
        {sub && sub.status === "expired" && (
          <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 16px", background: "var(--danger-subtle)", border: "1px solid var(--danger-border, #fca5a5)", borderRadius: "var(--radius-md)", color: "var(--danger)", fontWeight: 600, fontSize: "var(--text-sm)", marginBottom: 20 }}>
            {I("alert-circle", 16)} Your subscription has expired. Choose a plan below to continue posting jobs.
          </div>
        )}
        <div className="krm-card-grid" style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16, marginBottom: 28 }}>
          {plans.map((p) => {
            const current = p.id === currentPlanId;
            const popular = /professional/i.test(p.name);
            const isCustom = planIsCustom(p);
            const isFree = planIsFree(p);
            const isTrialPlan = planIsTrial(p);
            // A $0 plan (free OR trial) is one-time per company — gate it client-side so the card
            // shows "Already used" (disabled) instead of letting the employer click through to a 422.
            const zeroCostUsed = (isFree || isTrialPlan) && usedPlanIds.indexOf(p.id) !== -1;
            const dark = isCustom;
            const textStrong = dark ? "var(--text-on-dark, #fff)" : "var(--text-strong)";
            const textMuted = dark ? "var(--text-on-dark-mut, rgba(255,255,255,0.65))" : "var(--text-muted)";
            const textBody = dark ? "rgba(255,255,255,0.9)" : "var(--text-body)";
            const checkColor = dark ? "#fff" : "var(--brand)";
            return (
              <Card key={p.id} featured={popular} padding={24} style={{
                border: current ? "1.5px solid var(--brand)" : (dark ? "none" : undefined),
                background: dark ? "var(--stone-900, #1a1a1a)" : undefined,
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <h3 style={{ fontSize: "var(--text-lg)", fontWeight: 700, color: textStrong }}>{p.name}</h3>
                  {popular && <Badge tone="accent">Popular</Badge>}
                  {current && <Badge tone="brand">Current</Badge>}
                </div>
                <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginTop: 12 }}>
                  {isCustom ? (
                    <span style={{ fontFamily: "var(--font-display)", fontSize: "var(--text-4xl)", fontWeight: 800, color: textStrong }}>Custom</span>
                  ) : isTrialPlan ? (
                    <React.Fragment>
                      <span style={{ fontFamily: "var(--font-display)", fontSize: "var(--text-4xl)", fontWeight: 800, color: textStrong }}>{p.trial_days || 7}</span>
                      <span style={{ color: textMuted, fontSize: "var(--text-sm)" }}>days free</span>
                    </React.Fragment>
                  ) : isFree ? (
                    <span style={{ fontFamily: "var(--font-display)", fontSize: "var(--text-4xl)", fontWeight: 800, color: textStrong }}>Free</span>
                  ) : (
                    <React.Fragment>
                      <span style={{ fontFamily: "var(--font-display)", fontSize: "var(--text-4xl)", fontWeight: 800, color: textStrong }}>${p.price}</span>
                      <span style={{ color: textMuted, fontSize: "var(--text-sm)" }}>/ {p.interval}</span>
                    </React.Fragment>
                  )}
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 9, margin: "18px 0" }}>
                  {p.job_post_limit != null && (
                    <div style={{ display: "flex", gap: 8, fontSize: "var(--text-sm)", color: textBody }}>
                      <span style={{ color: checkColor, flexShrink: 0 }}>{I("briefcase", 16)}</span>
                      {p.job_post_limit} active job post{p.job_post_limit !== 1 ? "s" : ""}
                    </div>
                  )}
                  {planFeatures(p).map((f, idx) => (
                    <div key={idx} style={{ display: "flex", gap: 8, fontSize: "var(--text-sm)", color: textBody }}>
                      <span style={{ color: checkColor, flexShrink: 0 }}>{I("check", 16)}</span>{f}
                    </div>
                  ))}
                </div>
                <Button
                  variant={current ? "secondary" : (dark ? "secondary" : (popular ? "primary" : "ghost"))}
                  block disabled={current || zeroCostUsed}
                  style={dark && !current && !zeroCostUsed ? { background: "#fff", color: "var(--stone-900, #1a1a1a)", border: "none" } : undefined}
                  onClick={() => {
                    if (current || zeroCostUsed) return;
                    if (isCustom) { window.location.href = "mailto:sales@krama.com?subject=" + encodeURIComponent("Enterprise plan inquiry"); return; }
                    setCheckout(p);
                  }}
                >
                  {current ? "Current plan" : zeroCostUsed ? "Already used" : isCustom ? "Contact sales" : isTrialPlan ? ("Start " + (p.trial_days || 7) + "-Day Trial") : isFree ? "Get started" : "Upgrade"}
                </Button>
              </Card>
            );
          })}
        </div>
        <div className="krm-table-wrap"><Card padding={0}>
          <div style={{ padding: "16px 22px", borderBottom: "1px solid var(--border)", fontWeight: 700, color: "var(--text-strong)" }}>Billing history</div>
          <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr 0.8fr 1fr 0.8fr", padding: "10px 22px", fontSize: "var(--text-xs)", fontWeight: 700, letterSpacing: ".04em", textTransform: "uppercase", color: "var(--text-faint)", borderBottom: "1px solid var(--border-subtle)" }}>
            <span>Invoice</span><span>Date</span><span>Amount</span><span>Method</span><span>Status</span>
          </div>
          {invSlice.length === 0 && <div style={{ padding: "24px 22px", color: "var(--text-muted)", fontSize: "var(--text-sm)", textAlign: "center" }}>No payments yet.</div>}
          {invSlice.map((inv, i) => (
            <div key={inv.id} style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr 0.8fr 1fr 0.8fr", alignItems: "center", padding: "13px 22px", borderBottom: i < invSlice.length - 1 ? "1px solid var(--border-subtle)" : "none" }}>
              <span style={{ fontFamily: "var(--font-mono)", fontSize: "var(--text-sm)", color: "var(--text-body)" }}>{inv.invoice_no || ("#" + inv.id)}</span>
              <span style={{ fontSize: "var(--text-sm)", color: "var(--text-muted)" }}>{fmtDate(inv.created_at)}</span>
              <span style={{ fontWeight: 600, color: "var(--text-strong)" }}>${Number(inv.amount).toLocaleString()}</span>
              <span style={{ fontSize: "var(--text-sm)", color: "var(--text-body)", textTransform: "uppercase" }}>{inv.method}</span>
              <span><Badge tone={inv.status === "paid" ? "success" : inv.status === "refunded" ? "neutral" : "warning"}>{inv.status}</Badge></span>
            </div>
          ))}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 22px", borderTop: "1px solid var(--border-subtle)" }}>
            <span style={{ fontSize: "var(--text-sm)", color: "var(--text-muted)" }}>
              {payMeta.total > 0 ? ("Showing " + ((invSafe - 1) * INV_PER + 1) + "–" + ((invSafe - 1) * INV_PER + invSlice.length) + " of " + payMeta.total) : "No payments yet."}
            </span>
            <div style={{ display: "flex", gap: 8 }}>
              <Button variant="secondary" size="sm" disabled={invSafe <= 1 || payLoading} onClick={() => { var p = invSafe - 1; setInvPage(p); fetchPayHistory(p); }}>Previous</Button>
              <Button variant="secondary" size="sm" disabled={invSafe >= invPages || payLoading} onClick={() => { var p = invSafe + 1; setInvPage(p); fetchPayHistory(p); }}>Next</Button>
            </div>
          </div>
        </Card></div>
        </React.Fragment>
        )}
        <CheckoutModal plan={checkout} onClose={() => setCheckout(null)} onPaid={load} />
      </div>
    );
  }

  function Team({ user }) {
    const [data, setData] = React.useState(null);
    const [loading, setLoading] = React.useState(true);
    const [inviteOpen, setInviteOpen] = React.useState(false);
    const [inviteName, setInviteName] = React.useState("");
    const [inviteEmail, setInviteEmail] = React.useState("");
    const [invitePassword, setInvitePassword] = React.useState("");
    const [inviting, setInviting] = React.useState(false);
    const [msg, setMsg] = React.useState(null);
    const [pwdModal, setPwdModal] = React.useState(null);
    const [newPwd, setNewPwd] = React.useState("");
    const [pwdBusy, setPwdBusy] = React.useState(false);

    const flash = (m, ok) => { setMsg({ text: m, ok: ok !== false }); setTimeout(() => setMsg(null), 3500); };

    const load = React.useCallback(function () {
      setLoading(true);
      emp.fetchTeam().then(function (d) { setData(d); setLoading(false); }).catch(function () { setLoading(false); });
    }, []);

    React.useEffect(function () { load(); }, [load]);

    const invite = () => {
      if (!inviteName.trim() || !inviteEmail.trim()) return;
      setInviting(true);
      emp.inviteRecruiter({ name: inviteName.trim(), email: inviteEmail.trim() }).then(function () {
        flash("Recruiter added. Set their password below.");
        setInviteOpen(false); setInviteName(""); setInviteEmail(""); setInvitePassword("");
        load();
      }).catch(function (e) { flash((e && e.message) || "Failed to add recruiter.", false); }).finally(function () { setInviting(false); });
    };

    const remove = (member) => {
      if (!window.confirm('Remove ' + member.name + ' from the team?')) return;
      emp.removeTeamMember(member.id).then(function () { flash("Team member removed."); load(); }).catch(function (e) { flash((e && e.message) || "Failed.", false); });
    };

    const setPassword = () => {
      if (!newPwd || newPwd.length < 8) { flash("Password must be at least 8 characters.", false); return; }
      setPwdBusy(true);
      emp.setMemberPassword(pwdModal.id, newPwd).then(function () {
        flash("Password updated for " + pwdModal.name + ".");
        setPwdModal(null); setNewPwd(""); setPwdBusy(false);
      }).catch(function (e) { flash((e && e.message) || "Failed.", false); setPwdBusy(false); });
    };

    if (loading) return <div className="krm-page-pad" style={{ padding: 28, color: "var(--text-muted)" }}>Loading…</div>;

    const recruiters = data ? (data.recruiters || []) : [];
    const owner = data ? data.owner : null;

    return (
      <div className="krm-page-pad" style={{ padding: 28, maxWidth: 860 }}>
        <ScreenHead
          title="Team"
          sub="Manage recruiters who can post jobs on behalf of your company."
          action={<Button variant="primary" iconLeft={I("user-plus", 15)} onClick={() => setInviteOpen(true)}>Add recruiter</Button>}
        />
        {msg && <div style={{ padding: "10px 14px", background: msg.ok ? "var(--success-subtle)" : "var(--danger-subtle)", color: msg.ok ? "var(--success)" : "var(--danger)", borderRadius: "var(--radius-md)", fontSize: "var(--text-sm)", fontWeight: 600, marginBottom: 14 }}>{msg.text}</div>}

        <Card padding={0} style={{ marginBottom: 20 }}>
          <div style={{ padding: "16px 22px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ fontWeight: 700, color: "var(--text-strong)" }}>Team members</div>
            <Badge tone="neutral">{1 + recruiters.length} member{recruiters.length !== 0 ? "s" : ""}</Badge>
          </div>

          {/* Owner row */}
          {owner && (
            <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 22px", borderBottom: recruiters.length > 0 ? "1px solid var(--border-subtle)" : "none" }}>
              <Avatar name={owner.name} src={owner.avatar_url} size={38} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 600, fontSize: "var(--text-sm)", color: "var(--text-strong)" }}>{owner.name}</div>
                <div style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>{owner.email}</div>
              </div>
              <Badge tone="brand">Company admin</Badge>
            </div>
          )}

          {recruiters.map((r, i) => (
            <div key={r.id} style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 22px", borderBottom: i < recruiters.length - 1 ? "1px solid var(--border-subtle)" : "none" }}>
              <Avatar name={r.name} src={r.avatar_url} size={38} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 600, fontSize: "var(--text-sm)", color: "var(--text-strong)" }}>{r.name}</div>
                <div style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>{r.email}</div>
              </div>
              <Badge tone="neutral">Recruiter</Badge>
              <Button variant="secondary" size="sm" iconLeft={I("key", 13)} onClick={() => { setPwdModal(r); setNewPwd(""); }}>Set password</Button>
              <Button variant="ghost" size="sm" onClick={() => remove(r)}>Remove</Button>
            </div>
          ))}

          {recruiters.length === 0 && (
            <div style={{ padding: "28px 22px", textAlign: "center", color: "var(--text-muted)", fontSize: "var(--text-sm)" }}>
              No recruiters yet. Add a recruiter to let them post jobs on your company's behalf.
            </div>
          )}
        </Card>

        <Card padding={20} style={{ background: "var(--surface-sunken, var(--surface-page))", border: "1px solid var(--border)" }}>
          <div style={{ fontWeight: 700, color: "var(--text-strong)", marginBottom: 4 }}>How team roles work</div>
          <div style={{ fontSize: "var(--text-sm)", color: "var(--text-muted)", lineHeight: 1.6 }}>
            <strong>Company admin</strong> — can manage the company profile, billing, and approve or reject recruiter job postings.<br />
            <strong>Recruiter</strong> — can create and edit job postings, but each post must be approved by the company admin before it goes live.
          </div>
        </Card>

        {/* Invite modal */}
        {inviteOpen && (
          <div onClick={() => setInviteOpen(false)} style={{ position: "fixed", inset: 0, zIndex: 300, background: "var(--surface-overlay)", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
            <div onClick={(e) => e.stopPropagation()} style={{ width: "100%", maxWidth: 420, background: "var(--surface-card)", borderRadius: "var(--radius-xl)", boxShadow: "var(--shadow-xl)", overflow: "hidden" }}>
              <div style={{ padding: "18px 22px", borderBottom: "1px solid var(--border)", fontWeight: 700, fontSize: "var(--text-md)", color: "var(--text-strong)" }}>Add recruiter</div>
              <div style={{ padding: "18px 22px", display: "flex", flexDirection: "column", gap: 14 }}>
                <div style={{ fontSize: "var(--text-sm)", color: "var(--text-muted)" }}>Create a recruiter account linked to your company. They can log in and post jobs that you approve.</div>
                <Input label="Full name" value={inviteName} onChange={(e) => setInviteName(e.target.value)} placeholder="e.g. Sokha Dara" />
                <Input label="Email address" type="email" value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)} placeholder="recruiter@company.com" />
              </div>
              <div style={{ display: "flex", gap: 10, padding: "14px 22px", borderTop: "1px solid var(--border)" }}>
                <Button variant="ghost" onClick={() => setInviteOpen(false)} style={{ flex: 1 }}>Cancel</Button>
                <Button variant="primary" style={{ flex: 1 }} disabled={!inviteName.trim() || !inviteEmail.trim() || inviting} onClick={invite}>{inviting ? "Adding…" : "Add recruiter"}</Button>
              </div>
            </div>
          </div>
        )}

        {/* Set password modal */}
        {pwdModal && (
          <div onClick={() => setPwdModal(null)} style={{ position: "fixed", inset: 0, zIndex: 300, background: "var(--surface-overlay)", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
            <div onClick={(e) => e.stopPropagation()} style={{ width: "100%", maxWidth: 380, background: "var(--surface-card)", borderRadius: "var(--radius-xl)", boxShadow: "var(--shadow-xl)", overflow: "hidden" }}>
              <div style={{ padding: "18px 22px", borderBottom: "1px solid var(--border)", fontWeight: 700, fontSize: "var(--text-md)", color: "var(--text-strong)" }}>Set password for {pwdModal.name}</div>
              <div style={{ padding: "18px 22px" }}>
                <Input label="New password" type="password" value={newPwd} onChange={(e) => setNewPwd(e.target.value)} placeholder="At least 8 characters" />
              </div>
              <div style={{ display: "flex", gap: 10, padding: "14px 22px", borderTop: "1px solid var(--border)" }}>
                <Button variant="ghost" onClick={() => setPwdModal(null)} style={{ flex: 1 }}>Cancel</Button>
                <Button variant="primary" style={{ flex: 1 }} disabled={!newPwd || newPwd.length < 8 || pwdBusy} onClick={setPassword}>{pwdBusy ? "Updating…" : "Set password"}</Button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ── Messages ───────────────────────────────────────────────────────────────
  function Messages({ user }) {
    const [convs, setConvs] = React.useState([]);
    const [activeConv, setActiveConv] = React.useState(null);
    const [msgs, setMsgs] = React.useState([]);
    const [body, setBody] = React.useState("");
    const [sending, setSending] = React.useState(false);
    const [loading, setLoading] = React.useState(true);
    const [msgLoading, setMsgLoading] = React.useState(false);
    const bottomRef = React.useRef(null);
    const lastIdRef = React.useRef(0);
    const activeId = activeConv ? activeConv.id : null;

    function fmtTime(iso) {
      if (!iso) return "";
      const d = new Date(iso); const now = new Date(); const diff = now - d;
      if (diff < 60000) return "Just now";
      if (diff < 3600000) return Math.floor(diff / 60000) + "m";
      if (diff < 86400000) return Math.floor(diff / 3600000) + "h";
      return d.getDate() + " " + ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"][d.getMonth()];
    }

    function otherParty(conv) {
      if (!user || !user.role) return {};
      return user.role.slug === "employer" ? (conv.candidate || {}) : (conv.employer || {});
    }

    function reloadConvs() {
      emp.fetchConversations().then(function(d) {
        setConvs(d.data || []);
        setLoading(false);
      }).catch(function() { setLoading(false); });
    }

    function reloadMsgs(convId) {
      emp.fetchMessages(convId).then(function(d) {
        var arr = (d.messages && d.messages.data) || [];
        setMsgs(arr);
        lastIdRef.current = arr.length ? arr[arr.length - 1].id : 0;
        setMsgLoading(false);
      }).catch(function() { setMsgLoading(false); });
    }

    // Delta poll: fetch only messages newer than the last one we hold, then append.
    function pollNew(convId) {
      emp.fetchNewMessages(convId, lastIdRef.current).then(function(d) {
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
      const t = setInterval(function() { if (!document.hidden) reloadConvs(); }, 5000);
      return function() { clearInterval(t); };
    }, []);

    React.useEffect(function() {
      if (!activeId) { setMsgs([]); lastIdRef.current = 0; return; }
      setMsgLoading(true);
      lastIdRef.current = 0;
      reloadMsgs(activeId);
      const t = setInterval(function() { if (!document.hidden) pollNew(activeId); }, 1500);
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
      emp.sendMessage(activeId, body.trim()).then(function(msg) {
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
              <div style={{ marginTop: 4, fontSize: 12, color: "var(--text-faint)" }}>Start a conversation from an applicant's profile.</div>
            </div>
          )}
          {convs.map(function(conv) {
            const other = otherParty(conv);
            const latest = conv.latest_message;
            const isActive = activeId === conv.id;
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
                const mine = msg.sender_id === user.id;
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

  function BoostModal({ job, onClose, onDone }) {
    const [quote, setQuote] = React.useState(null);
    const [loading, setLoading] = React.useState(true);
    const [method, setMethod] = React.useState("khqr");
    const [busy, setBusy] = React.useState(false);
    const [err, setErr] = React.useState("");
    React.useEffect(function () {
      if (!job) { setQuote(null); return; }
      setLoading(true); setErr(""); setQuote(null);
      emp.boostQuote(job.id)
        .then(function (q) { setQuote(q); setLoading(false); })
        .catch(function (e) { setErr((e && e.message) || "Failed to load boost details."); setLoading(false); });
    }, [job && job.id]);
    if (!job) return null;
    var days = quote ? quote.boost_days : 30;
    var hasCredits = quote && quote.credits_remaining > 0;
    var price = quote ? quote.boost_price : null;
    var currency = quote ? quote.boost_currency : "USD";
    var methods = [
      { v: "khqr", l: "KHQR" }, { v: "aba", l: "ABA" }, { v: "acleda", l: "ACLEDA" },
      { v: "wing", l: "Wing" }, { v: "card", l: "Card" }, { v: "cod", l: "Cash" },
    ];
    var submit = function () {
      setBusy(true); setErr("");
      emp.boostJob(job.id, hasCredits ? null : method).then(function (r) {
        setBusy(false);
        onDone(r && r.requires_payment
          ? "Payment pending — the job will be featured once an admin confirms it."
          : ("Job featured for " + days + " days!"));
      }).catch(function (e) { setBusy(false); setErr((e && e.message) || "Could not feature the job."); });
    };
    return (
      <div onClick={onClose} style={{ position: "fixed", inset: 0, zIndex: 260, background: "var(--surface-overlay)", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
        <div onClick={function (e) { e.stopPropagation(); }} style={{ width: "100%", maxWidth: 440, background: "var(--surface-card)", borderRadius: "var(--radius-xl)", boxShadow: "var(--shadow-xl)", overflow: "hidden" }}>
          <div style={{ padding: "18px 22px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ color: "var(--accent, #f59e0b)", display: "inline-flex" }}>{I("star", 18)}</span>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontWeight: 700, color: "var(--text-strong)", fontSize: "var(--text-md)" }}>Feature this job</div>
              <div style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{job.title}</div>
            </div>
          </div>
          <div style={{ padding: 20 }}>
            {loading ? (
              <div style={{ color: "var(--text-muted)", fontSize: "var(--text-sm)" }}>Loading…</div>
            ) : quote && quote.already_featured ? (
              <div style={{ fontSize: "var(--text-sm)", color: "var(--text-body)" }}>This job is already featured.</div>
            ) : hasCredits ? (
              <div style={{ fontSize: "var(--text-sm)", color: "var(--text-body)", lineHeight: 1.6 }}>
                Feature this job at the top of listings for <strong>{days} days</strong>.
                <div style={{ marginTop: 10, padding: "10px 14px", background: "var(--surface-sunken, var(--surface-page))", border: "1px solid var(--border)", borderRadius: "var(--radius-md)", display: "flex", alignItems: "center", gap: 8 }}>
                  {I("check-circle", 15)}
                  <span>Uses <strong>1</strong> of your <strong>{quote.credits_remaining}</strong> included featured credits — no charge.</span>
                </div>
              </div>
            ) : (
              <div style={{ fontSize: "var(--text-sm)", color: "var(--text-body)", lineHeight: 1.6 }}>
                You have no featured credits left. Feature this job for <strong>{days} days</strong> for <strong>{currency} {Number(price).toFixed(2)}</strong>.
                <div style={{ marginTop: 12 }}>
                  <label style={{ fontSize: "var(--text-xs)", fontWeight: 600, color: "var(--text-muted)", display: "block", marginBottom: 6 }}>Payment method</label>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                    {methods.map(function (m) { return (
                      <button key={m.v} onClick={function () { setMethod(m.v); }} style={{ padding: "6px 12px", borderRadius: "var(--radius-full)", border: "1px solid " + (method === m.v ? "var(--brand)" : "var(--border)"), background: method === m.v ? "var(--brand-subtle)" : "var(--surface-page)", color: method === m.v ? "var(--text-brand)" : "var(--text-muted)", fontFamily: "var(--font-sans)", fontSize: "var(--text-xs)", fontWeight: 600, cursor: "pointer" }}>{m.l}</button>
                    ); })}
                  </div>
                  <div style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)", marginTop: 10 }}>Payment is confirmed by an admin. The job becomes featured once the payment is marked paid.</div>
                </div>
              </div>
            )}
            {err && <div style={{ color: "var(--danger)", fontSize: "var(--text-xs)", marginTop: 10 }}>{err}</div>}
          </div>
          <div style={{ padding: "0 20px 18px", display: "flex", justifyContent: "flex-end", gap: 10 }}>
            <Button variant="secondary" onClick={onClose}>Cancel</Button>
            {!loading && quote && !quote.already_featured && (
              <Button variant="primary" disabled={busy} onClick={submit}>
                {busy ? "Working…" : hasCredits ? ("Feature for " + days + " days") : ("Pay " + currency + " " + Number(price).toFixed(2))}
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  }

  function PlanPickerModal({ picker, onPick, onClose }) {
    if (!picker) return null;
    var fmtDate = function (iso) { if (!iso) return "No expiry"; var d = new Date(iso); return d.getDate() + " " + ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"][d.getMonth()] + " " + d.getFullYear(); };
    return (
      <div onClick={onClose} style={{ position: "fixed", inset: 0, zIndex: 250, background: "var(--surface-overlay)", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
        <div onClick={function (e) { e.stopPropagation(); }} style={{ width: "100%", maxWidth: 440, background: "var(--surface-card)", borderRadius: "var(--radius-xl)", boxShadow: "var(--shadow-xl)", overflow: "hidden" }}>
          <div style={{ padding: "18px 22px", borderBottom: "1px solid var(--border)" }}>
            <h2 style={{ fontSize: "var(--text-lg)", fontWeight: 700, color: "var(--text-strong)" }}>Choose a plan for this job</h2>
            <p style={{ fontSize: "var(--text-sm)", color: "var(--text-muted)", marginTop: 4 }}>You have more than one active plan. Pick which one to spend a job slot from.</p>
          </div>
          <div style={{ padding: 12, display: "flex", flexDirection: "column", gap: 8 }}>
            {picker.options.map(function (s) {
              var planName = s.plan ? s.plan.name : "Plan";
              var isCustom = s.job_post_limit != null;
              var rem = s.jobs_limit == null ? "Unlimited" : (s.jobs_remaining + " of " + s.jobs_limit + " left");
              return (
                <button key={s.id} onClick={function () { onPick(s.id); }} style={{ textAlign: "left", border: "1px solid var(--border)", borderRadius: "var(--radius-md)", background: "var(--surface-page)", padding: "12px 14px", cursor: "pointer", fontFamily: "var(--font-sans)", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
                  <div>
                    <div style={{ fontWeight: 700, color: "var(--text-strong)", fontSize: "var(--text-sm)" }}>{planName}{isCustom ? " · Custom slots (Admin assigned)" : ""}</div>
                    <div style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)", marginTop: 2, display: "flex", alignItems: "center", gap: 5 }}>{I("calendar", 12)} Expires {fmtDate(s.renews_at)}</div>
                  </div>
                  <span style={{ fontSize: "var(--text-xs)", fontWeight: 700, color: "var(--text-brand)", whiteSpace: "nowrap" }}>{rem}</span>
                </button>
              );
            })}
          </div>
          <div style={{ padding: "12px 22px 18px", display: "flex", justifyContent: "flex-end" }}>
            <Button variant="secondary" onClick={onClose}>Cancel</Button>
          </div>
        </div>
      </div>
    );
  }

  function App() {
    const [page, setPage] = React.useState("dashboard");
    const [authUser, setAuthUser] = React.useState(null);
    const [authLoading, setAuthLoading] = React.useState(true);
    const [company, setCompany] = React.useState(null);
    const [sidebarOpen, setSidebarOpen] = React.useState(false);
    const [jobs, setJobs] = React.useState([]);
    const [jobsLoading, setJobsLoading] = React.useState(true);
    const [posting, setPosting] = React.useState(null);
    const [viewingJob, setViewingJob] = React.useState(null);
    const [sub, setSub] = React.useState(undefined);
    const [quota, setQuota] = React.useState({ used: 0, remaining: null, limit: null });
    const [allSubs, setAllSubs] = React.useState([]);
    const [planPicker, setPlanPicker] = React.useState(null);
    const [unreadMsg, setUnreadMsg] = React.useState(0);
    const [toast, setToast] = React.useState("");

    React.useEffect(() => {
      emp.fetchMe().then(function (u) { setAuthUser(u); setAuthLoading(false); }).catch(function () { setAuthLoading(false); });
    }, []);

    const loadJobs = React.useCallback(function () {
      setJobsLoading(true);
      emp.fetchJobs().then(function (d) { setJobs(d.data || []); setJobsLoading(false); }).catch(function () { setJobsLoading(false); });
    }, []);

    const loadSub = React.useCallback(function () {
      emp.fetchSubscription().then(function (r) {
        setSub(r && r.subscription || null);
        setQuota({ used: r.jobs_used || 0, remaining: r.jobs_remaining !== undefined ? r.jobs_remaining : null, limit: r.jobs_limit !== undefined ? r.jobs_limit : null });
        setAllSubs(Array.isArray(r.all_subscriptions) ? r.all_subscriptions : []);
      }).catch(function () { setSub(null); });
    }, []);

    // Active/trial subscriptions that still have an open slot, soonest-expiry first.
    const postableSubs = React.useCallback(function () {
      return (allSubs || [])
        .filter(function (s) {
          var live = s.status === "active" || s.status === "trial";
          var notExpired = !s.renews_at || new Date(s.renews_at) > new Date();
          var hasRoom = s.jobs_limit == null || (s.jobs_remaining != null && s.jobs_remaining > 0);
          return live && notExpired && hasRoom;
        })
        .sort(function (a, b) {
          var ax = a.renews_at ? new Date(a.renews_at).getTime() : Infinity;
          var bx = b.renews_at ? new Date(b.renews_at).getTime() : Infinity;
          return ax - bx;
        });
    }, [allSubs]);

    // Publish a job. One eligible plan → publish directly; several → let the user pick.
    const publishJob = React.useCallback(function (jobId, successMsg) {
      var msg = successMsg || "Job published!";
      loadJobs(); // reflect any just-created draft immediately (e.g. picker cancelled)
      var opts = postableSubs();
      var finish = function () { setToast(msg); setTimeout(function () { setToast(""); }, 3000); loadJobs(); loadSub(); };
      var fail = function (e) { setToast("Error: " + (e && e.message)); setTimeout(function () { setToast(""); }, 4000); };
      if (opts.length > 1) {
        setPlanPicker({ jobId: jobId, options: opts, successMsg: msg });
        return;
      }
      // 0 or 1 eligible plan — publish directly; API auto-picks or returns a clear error.
      emp.submitJob(jobId, opts.length === 1 ? opts[0].id : undefined).then(finish).catch(fail);
    }, [postableSubs, loadJobs, loadSub]);

    const confirmPlanPick = function (subscriptionId) {
      var pk = planPicker;
      if (!pk) return;
      setPlanPicker(null);
      emp.submitJob(pk.jobId, subscriptionId)
        .then(function () { setToast(pk.successMsg); setTimeout(function () { setToast(""); }, 3000); loadJobs(); loadSub(); })
        .catch(function (e) { setToast("Error: " + (e && e.message)); setTimeout(function () { setToast(""); }, 4000); });
    };

    React.useEffect(function () {
      if (!authUser) return;
      emp.fetchCompany().then(setCompany).catch(function () { setCompany(null); });
      loadSub();
      loadJobs();
    }, [authUser, loadJobs, loadSub]);

    // Poll unread message count every 15s
    React.useEffect(function () {
      if (!authUser) return;
      function pollUnread() {
        emp.fetchUnreadCount().then(function (d) { setUnreadMsg(d.count || 0); }).catch(function () {});
      }
      pollUnread();
      var t = setInterval(pollUnread, 15000);
      return function () { clearInterval(t); };
    }, [authUser]);

    const handlePost = () => { setPosting({ mode: "create" }); };

    const handleLogout = () => {
      emp.logout().then(function () {
        localStorage.removeItem("krama_access_token");
        localStorage.removeItem("krama_refresh_token");
        localStorage.removeItem("krama_admin_token");
        localStorage.removeItem("krama_admin_refresh_token");
        window.location.href = "/krama/krama/ui_kits/public-website/index.html";
      });
    };

    if (authLoading) {
      return (
        <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--surface-page)" }}>
          <div style={{ width: 36, height: 36, border: "3px solid var(--border)", borderTopColor: "var(--brand)", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
          <style>{"@keyframes spin{to{transform:rotate(360deg)}}"}</style>
        </div>
      );
    }
    if (!authUser) return <EmployerLogin onLogin={setAuthUser} />;

    const companyPending = jobs.filter((j) => j.status === "company_pending").length;
    const totalApps = jobs.reduce((s, j) => s + (j.applications_count || 0), 0);
    // Company admin sees pending-review badge on jobs tab; recruiters see awaiting-review count
    const badges = { jobs: companyPending, applicants: totalApps, messages: unreadMsg };

    const titles = { dashboard: "Dashboard", jobs: "Job postings", applicants: "Applicant tracking", messages: "Messages", team: "Team", company: "Company profile", billing: "Plan & billing", profile: "My Profile" };
    return (
      <div style={{ display: "flex", minHeight: "100vh", background: "var(--surface-page)" }}>
        {sidebarOpen && <div className="krm-sidebar-backdrop open" onClick={() => setSidebarOpen(false)} />}
        <Sidebar page={page} onNav={setPage} company={company} badges={badges} open={sidebarOpen} onClose={() => setSidebarOpen(false)} user={authUser} />
        <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column" }}>
          <Topbar title={titles[page] || page} user={authUser} onLogout={handleLogout} onPost={handlePost} onNav={setPage} onMenu={() => setSidebarOpen(o => !o)} />
          {page === "dashboard" && <Overview jobs={jobs} loading={jobsLoading} onNav={setPage} />}
          {page === "jobs" && <JobsManage jobs={jobs} loading={jobsLoading} reload={loadJobs} onPost={handlePost} onPublish={publishJob} sub={sub} quota={quota} onBilling={() => setPage("billing")} onView={(j) => setViewingJob(j)} onEdit={(j) => setPosting({ mode: "edit", job: j })} onClone={(j) => setPosting({ mode: "clone", job: j })} user={authUser} />}
          {page === "applicants" && <Applicants jobs={jobs} onGoToMessages={() => setPage("messages")} />}
          {page === "cvmatch" && <EmployerCvMatch />}
          {page === "team" && isCompanyAdmin(authUser) && <Team user={authUser} />}
          {page === "company" && <CompanyProfile company={company} onSaved={setCompany} jobs={jobs} />}
          {page === "messages" && <Messages user={authUser} />}
          {page === "billing" && <Billing onSubChange={loadSub} />}
          {page === "profile" && <MyProfile user={authUser} onUserUpdate={u => setAuthUser(u)} />}
        </div>
        <JobFormModal open={!!posting} mode={posting && posting.mode} job={posting && posting.job} onClose={() => setPosting(null)} onCreated={function(msg) { loadJobs(); setToast(msg || "Done"); setTimeout(function() { setToast(""); }, 3000); }} onPublishRequest={publishJob} user={authUser} />
        <PlanPickerModal picker={planPicker} onPick={confirmPlanPick} onClose={() => setPlanPicker(null)} />
        {toast && (
          <div style={{ position: "fixed", bottom: 24, right: 24, zIndex: 300, background: "var(--success)", color: "#fff", borderRadius: "var(--radius-md)", padding: "12px 20px", fontFamily: "var(--font-sans)", fontWeight: 600, fontSize: "var(--text-sm)", boxShadow: "var(--shadow-lg)", animation: "krmrise var(--dur-base) var(--ease-out)" }}>{toast}</div>
        )}
        <JobViewModal job={viewingJob} onClose={() => setViewingJob(null)} />
      </div>
    );
  }

  window.KramaEmployerApp = App;
  window.KRAMA_EMPLOYER_READY = true;
})();
