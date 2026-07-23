// Community forum — landing, category, thread, and composer views.
(function init() {
  if (!window.KramaDesignSystem_1a6f65) { return setTimeout(init, 40); }
  const { Card, Button, Input, Textarea, Badge, Avatar, EmptyState } = window.KramaDesignSystem_1a6f65;
  const TR = window.KRAMA_T || function (s) { return s; };
  const I = (n, s = 18) => <i data-lucide={n} style={{ width: s, height: s }}></i>;
  const API = () => window.KRAMA_API;

  // ── Top banner (admin-editable via home_content -> "communityTopBanner"). Shown on both
  //    desktop and mobile, same AnnouncementBar as the other public pages. ──────────────
  const COMMUNITY_TOP_DEFAULT = { visible: true, theme: "teal", icon: "messages-square", title: "Join the conversation", message: "Ask questions, share tips, and connect with people hiring across Cambodia.", cta: "Start a discussion", ctaUrl: "", image: "", fit: "cover" };
  function loadBanner(key, def) {
    try { const s = JSON.parse(localStorage.getItem("krama_home_settings") || "{}"); const m = Object.assign({}, def, s[key] || {}); if (!m.image && def.image) m.image = def.image; return m; }
    catch (e) { return Object.assign({}, def); }
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
  const BAR_THEMES = { saffron: { bg: "var(--saffron-500)", pill: "#fff", pillFg: "var(--saffron-700)" }, teal: { bg: "var(--teal-700)", pill: "#fff", pillFg: "var(--teal-800)" }, dark: { bg: "var(--stone-900)", pill: "var(--saffron-500)", pillFg: "#fff" }, brand: { bg: "var(--brand-700)", pill: "#fff", pillFg: "var(--brand-800)" }, blank: { bg: "var(--surface-card)", pill: "var(--brand)", pillFg: "#fff" }, transparent: { bg: "transparent", pill: "var(--brand)", pillFg: "#fff" } };
  function resolveBarTheme(b) {
    if (b.theme === "custom") return { bg: b.customBg || "var(--saffron-500)", pill: b.customCtaBg || "#fff", pillFg: b.customCtaFg || "var(--saffron-700)", fg: b.customFg || "#fff" };
    const isLight = b.theme === "transparent" || b.theme === "blank";
    const t = BAR_THEMES[b.theme] || BAR_THEMES.teal;
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

  const CAT_THEME = {
    teal:    { bg: "var(--teal-50)",    fg: "var(--teal-700)" },
    saffron: { bg: "var(--saffron-50)", fg: "var(--saffron-600)" },
    dark:    { bg: "var(--stone-100)",  fg: "var(--stone-700)" },
  };
  const catTheme = (c) => CAT_THEME[(c && c.color) || "teal"] || CAT_THEME.teal;

  function timeAgo(iso) {
    if (!iso) return "";
    const then = new Date(iso).getTime();
    const mins = Math.floor(Math.max(0, Date.now() - then) / 60000);
    if (mins < 1) return TR("just now");
    if (mins < 60) return mins + "m " + TR("ago");
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return hrs + "h " + TR("ago");
    const days = Math.floor(hrs / 24);
    if (days < 7) return days + "d " + TR("ago");
    return Math.floor(days / 7) + "w " + TR("ago");
  }

  // Render a body: turn @[Name](id) mention tokens into styled spans, keep line breaks.
  function renderBody(text) {
    if (!text) return null;
    const parts = [];
    const re = /@\[([^\]]+)\]\((\d+)\)/g;
    let last = 0, m, key = 0;
    while ((m = re.exec(text)) !== null) {
      if (m.index > last) parts.push(text.slice(last, m.index));
      parts.push(<strong key={"m" + (key++)} style={{ color: "var(--brand)", fontWeight: 700 }}>@{m[1]}</strong>);
      last = m.index + m[0].length;
    }
    if (last < text.length) parts.push(text.slice(last));
    return <div style={{ whiteSpace: "pre-wrap", lineHeight: 1.65, color: "var(--text-body)", wordBreak: "break-word" }}>{parts}</div>;
  }

  const errMsg = (e) => (e && (e.message || (e.errors && Object.values(e.errors).flat().join(" ")))) || TR("Something went wrong. Please try again.");

  // ── Vote button ────────────────────────────────────────────────────────────
  function VoteButton({ score, voted, onVote, size }) {
    const s = size || 34;
    return (
      <button onClick={onVote} title={TR("Upvote")} style={{
        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 1,
        width: s, minWidth: s, padding: "4px 0", cursor: "pointer",
        border: "1px solid " + (voted ? "var(--brand)" : "var(--border-strong)"),
        background: voted ? "var(--brand-subtle)" : "var(--surface-card)",
        color: voted ? "var(--text-brand)" : "var(--text-muted)", borderRadius: "var(--radius-md)",
      }}>
        {I("arrow-big-up", 16)}
        <span style={{ fontSize: "var(--text-xs)", fontWeight: 800 }}>{score || 0}</span>
      </button>
    );
  }

  // ── Report control (reason dropdown) ────────────────────────────────────────
  function ReportControl({ type, id, user, onNav }) {
    const [open, setOpen] = React.useState(false);
    const [done, setDone] = React.useState(false);
    const reasons = [["spam", TR("Spam")], ["abuse", TR("Abuse or harassment")], ["off_topic", TR("Off-topic")], ["other", TR("Other")]];
    const submit = (reason) => {
      if (!user) { onNav("login"); return; }
      API().forumReport({ reportable_type: type, reportable_id: id, reason: reason }).then(function () {
        setDone(true); setOpen(false);
      }).catch(function () { setDone(true); setOpen(false); });
    };
    if (done) return <span style={{ fontSize: "var(--text-xs)", color: "var(--text-faint)" }}>{TR("Reported")}</span>;
    return (
      <div style={{ position: "relative" }}>
        <button onClick={() => setOpen(!open)} title={TR("Report")} style={{ display: "inline-flex", alignItems: "center", gap: 4, background: "none", border: "none", cursor: "pointer", color: "var(--text-faint)", fontSize: "var(--text-xs)", fontWeight: 600, padding: 2 }}>
          {I("flag", 13)} {TR("Report")}
        </button>
        {open && (
          <div style={{ position: "absolute", right: 0, top: "100%", marginTop: 4, zIndex: 20, background: "var(--surface-card)", border: "1px solid var(--border)", borderRadius: "var(--radius-md)", boxShadow: "var(--shadow-lg)", minWidth: 180, overflow: "hidden" }}>
            {reasons.map(function (r) {
              return <button key={r[0]} onClick={() => submit(r[0])} style={{ display: "block", width: "100%", textAlign: "left", padding: "9px 14px", background: "none", border: "none", cursor: "pointer", fontSize: "var(--text-sm)", color: "var(--text-body)", fontFamily: "var(--font-sans)" }}>{r[1]}</button>;
            })}
          </div>
        )}
      </div>
    );
  }

  // ── Mention-aware reply composer ─────────────────────────────────────────────
  function ReplyComposer({ participants, onSubmit, busy, placeholder }) {
    const [text, setText] = React.useState("");
    const [suggest, setSuggest] = React.useState([]);
    const onChange = (e) => {
      const v = e.target.value;
      setText(v);
      const m = v.match(/@(\w{0,30})$/);
      if (m) {
        const q = m[1].toLowerCase();
        setSuggest(participants.filter(function (p) { return p.name && p.name.toLowerCase().indexOf(q) !== -1; }).slice(0, 5));
      } else setSuggest([]);
    };
    const pick = (p) => {
      setText(text.replace(/@(\w{0,30})$/, "@[" + p.name + "](" + p.id + ") "));
      setSuggest([]);
    };
    const send = () => {
      const body = text.trim();
      if (body.length < 2) return;
      onSubmit(body, function () { setText(""); });
    };
    return (
      <div style={{ position: "relative" }}>
        <Textarea rows={3} value={text} onChange={onChange} placeholder={placeholder || TR("Write a reply…  Use @ to mention someone.")} />
        {suggest.length > 0 && (
          <div style={{ position: "absolute", left: 0, bottom: 54, zIndex: 20, background: "var(--surface-card)", border: "1px solid var(--border)", borderRadius: "var(--radius-md)", boxShadow: "var(--shadow-lg)", minWidth: 200, overflow: "hidden" }}>
            {suggest.map(function (p) {
              return <button key={p.id} onClick={() => pick(p)} style={{ display: "flex", alignItems: "center", gap: 8, width: "100%", textAlign: "left", padding: "8px 12px", background: "none", border: "none", cursor: "pointer", fontFamily: "var(--font-sans)" }}>
                <Avatar name={p.name} size={22} /> <span style={{ fontSize: "var(--text-sm)", color: "var(--text-strong)" }}>{p.name}</span>
              </button>;
            })}
          </div>
        )}
        <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 8 }}>
          <Button variant="primary" size="sm" disabled={busy || text.trim().length < 2} onClick={send}>{busy ? TR("Posting…") : TR("Post reply")}</Button>
        </div>
      </div>
    );
  }

  // ── Thread list row ──────────────────────────────────────────────────────────
  function ThreadRow({ t, onOpen }) {
    const ct = catTheme(t.category);
    return (
      <button onClick={() => onOpen(t)} style={{ display: "flex", gap: 14, width: "100%", textAlign: "left", padding: "16px 4px", background: "none", border: "none", borderBottom: "1px solid var(--border-subtle)", cursor: "pointer" }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2, minWidth: 44, color: "var(--text-muted)" }}>
          <span style={{ fontWeight: 800, fontSize: "var(--text-base)", color: t.vote_score > 0 ? "var(--text-brand)" : "var(--text-muted)" }}>{t.vote_score || 0}</span>
          <span style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: ".04em" }}>{TR("votes")}</span>
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4, flexWrap: "wrap" }}>
            {t.is_pinned ? <Badge tone="accent">{I("pin", 11)} {TR("Pinned")}</Badge> : null}
            {t.is_locked ? <Badge tone="neutral">{I("lock", 11)} {TR("Locked")}</Badge> : null}
            {t.category ? <span style={{ fontSize: "var(--text-xs)", fontWeight: 700, color: ct.fg, background: ct.bg, padding: "2px 9px", borderRadius: "var(--radius-pill)" }}>{t.category.name}</span> : null}
          </div>
          <div style={{ fontSize: "var(--text-lg)", fontWeight: 700, color: "var(--text-strong)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{t.title}</div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 6, color: "var(--text-muted)", fontSize: "var(--text-xs)", flexWrap: "wrap" }}>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}><Avatar name={t.author ? t.author.name : "?"} size={18} /> {t.author ? t.author.name : TR("Unknown")}</span>
            <span>{I("message-circle", 12)} {t.reply_count || 0}</span>
            <span>{I("eye", 12)} {t.views || 0}</span>
            <span>{timeAgo(t.last_activity_at || t.created_at)}</span>
            {(t.tags || []).map(function (tg) { return <span key={tg.id} style={{ color: "var(--text-faint)" }}>#{tg.name}</span>; })}
          </div>
        </div>
      </button>
    );
  }

  function Pager({ page, lastPage, onPage }) {
    if (!lastPage || lastPage <= 1) return null;
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 12, marginTop: 20 }}>
        <Button variant="secondary" size="sm" disabled={page <= 1} onClick={() => onPage(page - 1)}>{TR("Previous")}</Button>
        <span style={{ fontSize: "var(--text-sm)", color: "var(--text-muted)" }}>{TR("Page")} {page} / {lastPage}</span>
        <Button variant="secondary" size="sm" disabled={page >= lastPage} onClick={() => onPage(page + 1)}>{TR("Next")}</Button>
      </div>
    );
  }

  // ── Thread detail view ────────────────────────────────────────────────────────
  function ThreadView({ threadId, user, onNav, onBack, goCategory }) {
    const [thread, setThread] = React.useState(null);
    const [replies, setReplies] = React.useState([]);
    const [page, setPage] = React.useState(1);
    const [lastPage, setLastPage] = React.useState(1);
    const [loading, setLoading] = React.useState(true);
    const [err, setErr] = React.useState("");
    const [busy, setBusy] = React.useState(false);
    const isMod = user && user.role && (user.role.slug === "admin" || user.role.slug === "super_admin");

    const loadThread = React.useCallback(function () {
      setLoading(true);
      API().forumThread(threadId).then(function (t) {
        setThread(t); setErr("");
      }).catch(function (e) { setErr(errMsg(e)); }).finally(function () { setLoading(false); });
    }, [threadId]);

    const loadReplies = React.useCallback(function (p) {
      API().forumReplies(threadId, p).then(function (r) {
        setReplies(r.data || []); setPage(r.current_page || 1); setLastPage(r.last_page || 1);
      }).catch(function () {});
    }, [threadId]);

    React.useEffect(function () { loadThread(); loadReplies(1); }, [threadId]);
    React.useEffect(function () { if (window.lucide) window.lucide.createIcons(); });

    const requireLogin = function () { if (!user) { onNav("login"); return false; } return true; };

    const voteThread = function () {
      if (!requireLogin()) return;
      API().forumVoteThread(thread.id).then(function (r) {
        setThread(Object.assign({}, thread, { vote_score: r.score, voted: r.voted }));
      }).catch(function () {});
    };
    const toggleFollow = function () {
      if (!requireLogin()) return;
      const fn = thread.subscribed ? API().forumUnsubscribe : API().forumSubscribe;
      fn(thread.id).then(function (r) { setThread(Object.assign({}, thread, { subscribed: r.subscribed })); }).catch(function () {});
    };
    const voteReply = function (rep) {
      if (!requireLogin()) return;
      API().forumVoteReply(rep.id).then(function (r) {
        setReplies(replies.map(function (x) { return x.id === rep.id ? Object.assign({}, x, { vote_score: r.score, voted: r.voted }) : x; }));
      }).catch(function () {});
    };
    const submitReply = function (body, reset) {
      if (!requireLogin()) return;
      setBusy(true);
      API().forumCreateReply(thread.id, { body: body }).then(function () {
        reset(); setBusy(false);
        // reload last page to show the new reply
        API().forumReplies(threadId, lastPage).then(function (r) {
          setReplies(r.data || []); setPage(r.current_page || 1); setLastPage(r.last_page || 1);
          setThread(function (t) { return t ? Object.assign({}, t, { reply_count: (t.reply_count || 0) + 1 }) : t; });
        });
      }).catch(function (e) { setBusy(false); setErr(errMsg(e)); });
    };
    const deleteReply = function (rep) {
      if (!confirm(TR("Delete this reply?"))) return;
      API().forumDeleteReply(rep.id).then(function () { loadReplies(page); }).catch(function () {});
    };
    const modReply = function (rep, hidden) {
      API().authedPost ? null : null;
      window.KRAMA_API_PATCH; // noop
    };
    const deleteThread = function () {
      if (!confirm(TR("Delete this whole thread?"))) return;
      API().forumDeleteThread(thread.id).then(function () { onBack(); }).catch(function () {});
    };

    if (loading && !thread) return <div style={{ padding: 60, textAlign: "center", color: "var(--text-muted)" }}>{TR("Loading…")}</div>;
    if (err && !thread) return <div style={{ padding: 40 }}><EmptyState icon="alert-triangle" title={TR("Couldn't load this discussion")} message={err} /></div>;
    if (!thread) return null;

    const ct = catTheme(thread.category);
    const participants = (function () {
      const seen = {}, list = [];
      const add = function (u) { if (u && u.id && !seen[u.id]) { seen[u.id] = 1; list.push({ id: u.id, name: u.name }); } };
      add(thread.author);
      replies.forEach(function (r) { add(r.author); });
      return list;
    })();
    const own = user && thread.author && user.id === thread.author.id;

    return (
      <div style={{ maxWidth: 860, margin: "0 auto", padding: "28px 16px 64px" }}>
        <button onClick={onBack} style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", fontSize: "var(--text-sm)", fontWeight: 600, marginBottom: 16, padding: 0 }}>{I("arrow-left", 15)} {TR("Back to Community")}</button>

        <Card padding={24}>
          <div style={{ display: "flex", gap: 16 }}>
            <VoteButton score={thread.vote_score} voted={thread.voted} onVote={voteThread} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8, flexWrap: "wrap" }}>
                {thread.is_pinned ? <Badge tone="accent">{I("pin", 11)} {TR("Pinned")}</Badge> : null}
                {thread.is_locked ? <Badge tone="neutral">{I("lock", 11)} {TR("Locked")}</Badge> : null}
                {thread.category ? <button onClick={() => goCategory(thread.category)} style={{ background: ct.bg, color: ct.fg, border: "none", cursor: "pointer", fontSize: "var(--text-xs)", fontWeight: 700, padding: "3px 10px", borderRadius: "var(--radius-pill)" }}>{thread.category.name}</button> : null}
              </div>
              <h1 style={{ fontSize: "var(--text-2xl)", fontWeight: 800, color: "var(--text-strong)", margin: "0 0 10px", letterSpacing: "-0.01em" }}>{thread.title}</h1>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16, color: "var(--text-muted)", fontSize: "var(--text-sm)" }}>
                <Avatar name={thread.author ? thread.author.name : "?"} size={24} />
                <span style={{ fontWeight: 600, color: "var(--text-strong)" }}>{thread.author ? thread.author.name : TR("Unknown")}</span>
                <span>· {timeAgo(thread.created_at)}</span>
                <span>· {I("eye", 13)} {thread.views || 0}</span>
              </div>
              {renderBody(thread.body)}
              {(thread.tags || []).length > 0 && (
                <div style={{ display: "flex", gap: 6, marginTop: 16, flexWrap: "wrap" }}>
                  {thread.tags.map(function (tg) { return <span key={tg.id} style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)", background: "var(--surface-sunken)", padding: "3px 10px", borderRadius: "var(--radius-pill)" }}>#{tg.name}</span>; })}
                </div>
              )}
              <div style={{ display: "flex", alignItems: "center", gap: 16, marginTop: 18, paddingTop: 14, borderTop: "1px solid var(--border-subtle)", flexWrap: "wrap" }}>
                <button onClick={toggleFollow} style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "none", border: "none", cursor: "pointer", color: thread.subscribed ? "var(--text-brand)" : "var(--text-muted)", fontSize: "var(--text-sm)", fontWeight: 600, padding: 0 }}>
                  {I(thread.subscribed ? "bell-ring" : "bell", 15)} {thread.subscribed ? TR("Following") : TR("Follow")}
                </button>
                {own ? <button onClick={deleteThread} style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "none", border: "none", cursor: "pointer", color: "var(--danger)", fontSize: "var(--text-sm)", fontWeight: 600, padding: 0 }}>{I("trash-2", 15)} {TR("Delete")}</button> : null}
                <ReportControl type="thread" id={thread.id} user={user} onNav={onNav} />
              </div>
            </div>
          </div>
        </Card>

        <div style={{ margin: "26px 0 12px", fontSize: "var(--text-lg)", fontWeight: 800, color: "var(--text-strong)" }}>{thread.reply_count || 0} {(thread.reply_count === 1 ? TR("reply") : TR("replies"))}</div>

        {replies.length === 0
          ? <Card padding={28}><div style={{ textAlign: "center", color: "var(--text-muted)", fontSize: "var(--text-sm)" }}>{TR("No replies yet — be the first to respond.")}</div></Card>
          : <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {replies.map(function (r) {
                const ownReply = user && r.author && user.id === r.author.id;
                return (
                  <Card key={r.id} padding={18} style={{ opacity: r.is_hidden ? 0.55 : 1 }}>
                    <div style={{ display: "flex", gap: 14 }}>
                      <VoteButton score={r.vote_score} voted={r.voted} onVote={() => voteReply(r)} size={30} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8, color: "var(--text-muted)", fontSize: "var(--text-sm)" }}>
                          <Avatar name={r.author ? r.author.name : "?"} size={22} />
                          <span style={{ fontWeight: 600, color: "var(--text-strong)" }}>{r.author ? r.author.name : TR("Unknown")}</span>
                          <span>· {timeAgo(r.created_at)}</span>
                          {r.is_hidden ? <Badge tone="neutral">{TR("Hidden")}</Badge> : null}
                        </div>
                        {renderBody(r.body)}
                        <div style={{ display: "flex", alignItems: "center", gap: 16, marginTop: 10 }}>
                          {ownReply ? <button onClick={() => deleteReply(r)} style={{ display: "inline-flex", alignItems: "center", gap: 5, background: "none", border: "none", cursor: "pointer", color: "var(--danger)", fontSize: "var(--text-xs)", fontWeight: 600, padding: 0 }}>{I("trash-2", 13)} {TR("Delete")}</button> : null}
                          <ReportControl type="reply" id={r.id} user={user} onNav={onNav} />
                        </div>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>}

        <Pager page={page} lastPage={lastPage} onPage={loadReplies} />

        <div style={{ marginTop: 26 }}>
          {thread.is_locked
            ? <Card padding={20}><div style={{ textAlign: "center", color: "var(--text-muted)", fontSize: "var(--text-sm)" }}>{I("lock", 14)} {TR("This thread is locked. No new replies can be posted.")}</div></Card>
            : user
              ? <Card padding={18}>
                  <div style={{ fontSize: "var(--text-sm)", fontWeight: 700, color: "var(--text-strong)", marginBottom: 10 }}>{TR("Add a reply")}</div>
                  {err ? <div style={{ padding: "8px 12px", background: "var(--danger-subtle)", color: "var(--danger)", borderRadius: "var(--radius-md)", fontSize: "var(--text-sm)", marginBottom: 10 }}>{err}</div> : null}
                  <ReplyComposer participants={participants} onSubmit={submitReply} busy={busy} />
                </Card>
              : <Card padding={20}><div style={{ textAlign: "center", color: "var(--text-muted)", fontSize: "var(--text-sm)" }}>{TR("Please")} <a onClick={() => onNav("login")} style={{ color: "var(--text-brand)", cursor: "pointer", fontWeight: 700 }}>{TR("log in")}</a> {TR("to join the discussion.")}</div></Card>}
        </div>
      </div>
    );
  }

  // ── New-thread composer ────────────────────────────────────────────────────────
  function Composer({ categories, presetCategory, user, onNav, onCreated, onCancel }) {
    const [categoryId, setCategoryId] = React.useState(presetCategory ? String(presetCategory.id) : (categories[0] ? String(categories[0].id) : ""));
    const [title, setTitle] = React.useState("");
    const [body, setBody] = React.useState("");
    const [tags, setTags] = React.useState("");
    const [busy, setBusy] = React.useState(false);
    const [err, setErr] = React.useState("");

    React.useEffect(function () { if (window.lucide) window.lucide.createIcons(); });

    const submit = function () {
      if (!user) { onNav("login"); return; }
      if (!title.trim() || body.trim().length < 10 || !categoryId) { setErr(TR("Add a title and at least a short message (10+ characters).")); return; }
      setBusy(true); setErr("");
      const tagList = tags.split(",").map(function (t) { return t.trim(); }).filter(Boolean).slice(0, 5);
      API().forumCreateThread({ category_id: Number(categoryId), title: title.trim(), body: body.trim(), tags: tagList })
        .then(function (t) { setBusy(false); onCreated(t); })
        .catch(function (e) { setBusy(false); setErr(errMsg(e)); });
    };

    return (
      <div style={{ maxWidth: 760, margin: "0 auto", padding: "28px 16px 64px" }}>
        <button onClick={onCancel} style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", fontSize: "var(--text-sm)", fontWeight: 600, marginBottom: 16, padding: 0 }}>{I("arrow-left", 15)} {TR("Cancel")}</button>
        <Card padding={24}>
          <h1 style={{ fontSize: "var(--text-2xl)", fontWeight: 800, color: "var(--text-strong)", margin: "0 0 18px" }}>{TR("Start a discussion")}</h1>
          {err ? <div style={{ padding: "10px 14px", background: "var(--danger-subtle)", color: "var(--danger)", borderRadius: "var(--radius-md)", fontSize: "var(--text-sm)", marginBottom: 16 }}>{err}</div> : null}
          <div style={{ display: "grid", gap: 16 }}>
            <div>
              <label style={{ display: "block", fontSize: "var(--text-sm)", fontWeight: 700, color: "var(--text-strong)", marginBottom: 6 }}>{TR("Category")}</label>
              <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} style={{ width: "100%", height: 42, padding: "0 12px", borderRadius: "var(--radius-md)", border: "1px solid var(--border-strong)", background: "var(--surface-card)", color: "var(--text-strong)", fontFamily: "var(--font-sans)", fontSize: "var(--text-sm)" }}>
                {categories.map(function (c) { return <option key={c.id} value={c.id}>{c.name}</option>; })}
              </select>
            </div>
            <Input label={TR("Title")} value={title} onChange={(e) => setTitle(e.target.value)} placeholder={TR("What do you want to discuss?")} />
            <div>
              <label style={{ display: "block", fontSize: "var(--text-sm)", fontWeight: 700, color: "var(--text-strong)", marginBottom: 6 }}>{TR("Message")}</label>
              <Textarea rows={8} value={body} onChange={(e) => setBody(e.target.value)} placeholder={TR("Share the details… Use @ to mention someone.")} />
            </div>
            <Input label={TR("Tags (optional, comma-separated)")} value={tags} onChange={(e) => setTags(e.target.value)} placeholder="salary, interview, remote" />
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
              <Button variant="secondary" onClick={onCancel}>{TR("Cancel")}</Button>
              <Button variant="primary" disabled={busy} onClick={submit}>{busy ? TR("Posting…") : TR("Post discussion")}</Button>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  // ── Landing + category list ──────────────────────────────────────────────────
  function Community({ onNav, user, initialThreadId }) {
    useHomeContent();
    const [view, setView] = React.useState(initialThreadId ? "thread" : "list");
    const [activeThreadId, setActiveThreadId] = React.useState(initialThreadId || null);
    const [category, setCategory] = React.useState(null); // active category filter (object) or null
    const [categories, setCategories] = React.useState([]);
    const [threads, setThreads] = React.useState([]);
    const [page, setPage] = React.useState(1);
    const [lastPage, setLastPage] = React.useState(1);
    const [total, setTotal] = React.useState(0);
    const [sort, setSort] = React.useState("latest");
    const [q, setQ] = React.useState("");
    const [qInput, setQInput] = React.useState("");
    const [loading, setLoading] = React.useState(true);

    React.useEffect(function () {
      API().forumCategories().then(function (c) { setCategories(c || []); }).catch(function () {});
    }, []);

    const loadThreads = React.useCallback(function (p) {
      setLoading(true);
      const params = { page: p || 1, sort: sort };
      if (category) params.category = category.id;
      if (q) params.q = q;
      API().forumThreads(params).then(function (r) {
        setThreads(r.data || []); setPage(r.current_page || 1); setLastPage(r.last_page || 1); setTotal(r.total || 0);
      }).catch(function () { setThreads([]); }).finally(function () { setLoading(false); });
    }, [category, sort, q]);

    React.useEffect(function () { if (view === "list") loadThreads(1); }, [category, sort, q, view]);
    React.useEffect(function () { if (window.lucide) window.lucide.createIcons(); });

    const openThread = function (t) { setActiveThreadId(t.id); setView("thread"); window.scrollTo(0, 0); };
    const openCategory = function (c) { setCategory(c); setQ(""); setQInput(""); setView("list"); window.scrollTo(0, 0); };
    const startNew = function () { if (!user) { onNav("login"); return; } setView("new"); window.scrollTo(0, 0); };
    const runSearch = function () { setQ(qInput.trim()); };

    if (view === "thread" && activeThreadId) {
      return <ThreadView threadId={activeThreadId} user={user} onNav={onNav}
                onBack={function () { setView("list"); setActiveThreadId(null); }}
                goCategory={openCategory} />;
    }
    if (view === "new") {
      return <Composer categories={categories} presetCategory={category} user={user} onNav={onNav}
                onCreated={function (t) { openThread(t); }} onCancel={function () { setView("list"); }} />;
    }

    // list view
    return (
      <React.Fragment>
        <AnnouncementBar b={loadBanner("communityTopBanner", COMMUNITY_TOP_DEFAULT)} onNav={onNav} onCtaClick={startNew} />
        <div style={{ maxWidth: 1000, margin: "0 auto", padding: "28px 16px 64px" }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, flexWrap: "wrap", marginBottom: 8 }}>
          <div>
            <h1 style={{ fontSize: "var(--text-3xl)", fontWeight: 800, color: "var(--text-strong)", margin: 0, letterSpacing: "-0.02em" }}>{TR("Community")}</h1>
            <p style={{ color: "var(--text-muted)", marginTop: 6, fontSize: "var(--text-base)" }}>{TR("Ask questions, share knowledge, and connect with others on Krama.")}</p>
          </div>
          <Button variant="primary" iconLeft={I("plus", 15)} onClick={startNew}>{TR("New discussion")}</Button>
        </div>

        {/* Categories */}
        {!category && !q && (
          <div className="krm-info-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12, margin: "20px 0 28px" }}>
            {categories.map(function (c) {
              const ct = catTheme(c);
              return (
                <button key={c.id} onClick={() => openCategory(c)} style={{ display: "flex", gap: 12, textAlign: "left", padding: 16, background: "var(--surface-card)", border: "1px solid var(--border)", borderRadius: "var(--radius-lg)", cursor: "pointer" }}>
                  <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 42, height: 42, borderRadius: "var(--radius-md)", background: ct.bg, color: ct.fg, flexShrink: 0 }}>{I(c.icon || "messages-square", 20)}</span>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontWeight: 700, color: "var(--text-strong)" }}>{c.name}</div>
                    <div style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)", marginTop: 2, overflow: "hidden", textOverflow: "ellipsis", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>{c.description}</div>
                    <div style={{ fontSize: "var(--text-xs)", color: "var(--text-faint)", marginTop: 6 }}>{c.threads_count || 0} {(c.threads_count === 1 ? TR("thread") : TR("threads"))}</div>
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {/* Search + toolbar */}
        <Card padding={16} style={{ marginBottom: 18 }}>
          <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
            <div style={{ flex: 1, minWidth: 200, display: "flex", gap: 8, alignItems: "center", background: "var(--surface-sunken)", borderRadius: "var(--radius-md)", padding: "0 12px" }}>
              <span style={{ color: "var(--text-faint)" }}>{I("search", 16)}</span>
              <input value={qInput} onChange={(e) => setQInput(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") runSearch(); }} placeholder={TR("Search discussions…")} style={{ flex: 1, border: "none", background: "none", outline: "none", height: 40, fontFamily: "var(--font-sans)", fontSize: "var(--text-sm)", color: "var(--text-strong)" }} />
              {q ? <button onClick={() => { setQ(""); setQInput(""); }} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-faint)" }}>{I("x", 16)}</button> : null}
            </div>
            <Button variant="secondary" size="sm" onClick={runSearch}>{TR("Search")}</Button>
            <div style={{ display: "flex", gap: 4, background: "var(--surface-sunken)", borderRadius: "var(--radius-md)", padding: 4 }}>
              {[["latest", TR("Latest")], ["new", TR("New")], ["top", TR("Top")]].map(function (s) {
                const on = sort === s[0];
                return <button key={s[0]} onClick={() => setSort(s[0])} style={{ padding: "6px 14px", borderRadius: "var(--radius-sm)", border: "none", cursor: "pointer", fontSize: "var(--text-sm)", fontWeight: 700, background: on ? "var(--surface-card)" : "transparent", color: on ? "var(--text-brand)" : "var(--text-muted)", boxShadow: on ? "var(--shadow-sm)" : "none" }}>{s[1]}</button>;
              })}
            </div>
          </div>
        </Card>

        {/* Active filter row */}
        {(category || q) && (
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8, fontSize: "var(--text-sm)", color: "var(--text-muted)" }}>
            <button onClick={() => { setCategory(null); setQ(""); setQInput(""); }} style={{ display: "inline-flex", alignItems: "center", gap: 5, background: "none", border: "none", cursor: "pointer", color: "var(--text-brand)", fontWeight: 700, padding: 0 }}>{I("arrow-left", 14)} {TR("All discussions")}</button>
            <span>·</span>
            <span>{category ? category.name : TR("Search") + ': "' + q + '"'} — {total} {TR("results")}</span>
          </div>
        )}

        {/* Threads */}
        {loading
          ? <div style={{ padding: 50, textAlign: "center", color: "var(--text-muted)" }}>{TR("Loading…")}</div>
          : threads.length === 0
            ? <EmptyState icon="messages-square" title={TR("No discussions yet")} message={TR("Be the first to start a conversation.")} />
            : <Card padding={8}>
                <div>{threads.map(function (t) { return <ThreadRow key={t.id} t={t} onOpen={openThread} />; })}</div>
              </Card>}

        <Pager page={page} lastPage={lastPage} onPage={loadThreads} />
      </div>
      </React.Fragment>
    );
  }

  window.KramaCommunity = Community;
})();
