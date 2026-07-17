// Krama -- floating chat agent (bottom-left). Pluggable external API.
//
// INTEGRATION: set window.KRAMA_CHAT_API before this script loads, e.g.
//   window.KRAMA_CHAT_API = {
//     // return a string (or a Promise of a string)
//     async send(message, history) {
//       const res = await fetch("https://your-api.example.com/chat", {
//         method: "POST",
//         headers: { "Content-Type": "application/json", "Authorization": "Bearer <KEY>" },
//         body: JSON.stringify({ message, history })
//       });
//       const data = await res.json();
//       return data.reply;
//     }
//   };
// With no API configured, a local canned-response stub is used so the UI is demoable.
(function init() {
  if (!window.KramaDesignSystem_1a6f65) { return setTimeout(init, 40); }
  const I = (n, s = 18) => <i data-lucide={n} style={{ width: s, height: s }}></i>;
  const TR = window.KRAMA_T || function (s) { return s; };

  // Admin-configured chat settings (Admin Console → Chat agent), persisted to localStorage.
  const CHAT_DEFAULTS = { enabled: true, botName: "Krama Assistant", welcome: "Hi! I'm Krama's assistant \uD83D\uDC4B Ask me about jobs, applications, or your account.", endpoint: "", apiKey: "", model: "", launcher: "Chat with us" };
  // --- fallback stub when no external API is wired ---
  const STUB = {
    send(msg) {
      const m = (msg || "").toLowerCase();
      let reply = "Thanks! A Krama specialist will follow up. Meanwhile, try Find jobs to search openings.";
      if (/salary|pay|wage/.test(m)) reply = "Most roles list a monthly range. Use the Minimum salary filter on Find jobs to narrow by pay.";
      else if (/apply|application/.test(m)) reply = "Open any job and hit Apply now -- you can attach your Krama résumé in two clicks.";
      else if (/remote/.test(m)) reply = "Toggle Remote under Work mode on the Find jobs page to see remote-friendly roles.";
      else if (/account|register|sign ?up|login/.test(m)) reply = "You can register as a candidate or employer -- Google and Facebook sign-in are supported.";
      else if (/hi|hello|hey/.test(m)) reply = "Hi! I'm Krama's assistant. Ask me about jobs, applications, or your account.";
      return new Promise((res) => setTimeout(() => res(reply), 650));
    },
  };

  // --- send via the Krama backend chat proxy (LLM runs server-side; API key never exposed) ---
  // Falls back to a custom window.KRAMA_CHAT_API or the local canned stub if the backend is unreachable.
  async function sendMessage(cfg, msg, history) {
    var apiBase = (/^(localhost|127\.0\.0\.1|::1|192\.168\.|10\.)/.test(window.location.hostname) ? 'http://127.0.0.1:8000/api' : (window.location.protocol + '//' + window.location.host + '/api'));
    try {
      const res = await fetch(apiBase + "/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Accept": "application/json" },
        body: JSON.stringify({ message: msg, history: (history || []).slice(-20) }),
      });
      if (!res.ok) throw new Error("HTTP " + res.status);
      const data = await res.json();
      if (data && data.reply) return data.reply;
    } catch (e) {
      // fall through to the stub below
    }
    if (window.KRAMA_CHAT_API && window.KRAMA_CHAT_API.send) return window.KRAMA_CHAT_API.send(msg, history);
    return STUB.send(msg, history);
  }

  function ChatAgent({ onNav }) {
    const [cfg, setCfg] = React.useState(CHAT_DEFAULTS);
    const [open, setOpen] = React.useState(false);
    const [input, setInput] = React.useState("");
    const [busy, setBusy] = React.useState(false);
    const [msgs, setMsgs] = React.useState([{ from: "bot", text: CHAT_DEFAULTS.welcome }]);
    const scrollRef = React.useRef(null);

    React.useEffect(function() {
      var apiBase = (/^(localhost|127\.0\.0\.1|::1|192\.168\.|10\.)/.test(window.location.hostname) ? 'http://127.0.0.1:8000/api' : (window.location.protocol + '//' + window.location.host + '/api'));
      fetch(apiBase + '/settings/chat', { cache: 'no-cache' })
        .then(function(r) { return r.ok ? r.json() : null; })
        .then(function(d) {
          if (d && Object.keys(d).length) {
            var newCfg = Object.assign({}, CHAT_DEFAULTS, d);
            setCfg(newCfg);
            setMsgs(function(prev) {
              if (prev.length === 1 && prev[0].from === 'bot' && prev[0].text === CHAT_DEFAULTS.welcome) {
                return [{ from: 'bot', text: newCfg.welcome }];
              }
              return prev;
            });
          }
        })
        .catch(function() {});
    }, []);
    React.useEffect(() => { if (window.lucide) window.lucide.createIcons(); });
    React.useEffect(() => { if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight; }, [msgs, open, busy]);

    if (!cfg.enabled) return null;

    const send = async () => {
      const text = input.trim();
      if (!text || busy) return;
      const history = msgs.map((m) => ({ role: m.from === "bot" ? "assistant" : "user", content: m.text }));
      setMsgs((s) => [...s, { from: "me", text }]);
      setInput("");
      setBusy(true);
      try {
    const reply = await sendMessage(cfg, text, history);
        setMsgs((s) => [...s, { from: "bot", text: String(reply || "…") }]);
      } catch (e) {
        setMsgs((s) => [...s, { from: "bot", text: "Sorry -- I couldn't reach the assistant. Please try again." }]);
      } finally {
        setBusy(false);
      }
    };

    const onKey = (e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } };
    const quick = ["How do I apply?", "Show remote jobs", "Salary info"];

    return (
      <div className="krm-chat-fab" style={{ position: "fixed", left: 24, bottom: 24, zIndex: 300, fontFamily: "var(--font-sans)" }}>
        {open ? (
          <div style={{ width: 360, maxWidth: "calc(100vw - 48px)", height: 520, maxHeight: "calc(100vh - 120px)", background: "var(--surface-card)", borderRadius: "var(--radius-xl)", boxShadow: "var(--shadow-xl)", border: "1px solid var(--border)", display: "flex", flexDirection: "column", overflow: "hidden", animation: "krmChatIn var(--dur-base) var(--ease-out)" }}>
            {/* header */}
            <div style={{ position: "relative", overflow: "hidden", background: "var(--teal-800)", color: "#fff", padding: "16px 18px", display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ position: "absolute", inset: 0, background: "url('../../assets/krama-pattern.svg')", backgroundSize: 52, opacity: 0.1 }} />
              <div style={{ position: "relative", display: "flex", alignItems: "center", gap: 12, flex: 1 }}>
                <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 38, height: 38, borderRadius: "50%", background: "rgba(255,255,255,0.16)" }}>{I("bot", 20)}</span>
                <div>
                  <div style={{ fontWeight: 700, fontFamily: "var(--font-display)", fontSize: "var(--text-md)" }}>{cfg.botName}</div>
                  <div style={{ fontSize: "var(--text-xs)", color: "var(--teal-100)", display: "flex", alignItems: "center", gap: 5 }}>
                    <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#46d39a" }} />Online
                  </div>
                </div>
              </div>
              <button onClick={() => setOpen(false)} aria-label="Close chat" style={{ position: "relative", border: "none", background: "transparent", color: "#fff", cursor: "pointer", opacity: 0.85, display: "inline-flex", padding: 4 }}>{I("x", 18)}</button>
            </div>

            {/* messages */}
            <div ref={scrollRef} style={{ flex: 1, overflowY: "auto", padding: 16, display: "flex", flexDirection: "column", gap: 10, background: "var(--surface-page)" }}>
              {msgs.map((m, i) => (
                <div key={i} style={{ alignSelf: m.from === "me" ? "flex-end" : "flex-start", maxWidth: "82%", padding: "10px 13px", borderRadius: m.from === "me" ? "14px 14px 4px 14px" : "14px 14px 14px 4px", background: m.from === "me" ? "var(--brand)" : "var(--surface-card)", color: m.from === "me" ? "#fff" : "var(--text-body)", border: m.from === "me" ? "none" : "1px solid var(--border)", fontSize: "var(--text-sm)", lineHeight: 1.5, boxShadow: "var(--shadow-xs)" }}>{m.text}</div>
              ))}
              {busy ? (
                <div style={{ alignSelf: "flex-start", padding: "10px 14px", borderRadius: "14px 14px 14px 4px", background: "var(--surface-card)", border: "1px solid var(--border)", display: "flex", gap: 4 }}>
                  {[0, 1, 2].map((d) => <span key={d} style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--text-faint)", animation: "krmDot 1s " + (d * 0.15) + "s infinite" }} />)}
                </div>
              ) : null}
            </div>

            {/* quick replies */}
            {msgs.length <= 2 ? (
              <div style={{ display: "flex", gap: 6, padding: "0 16px 10px", flexWrap: "wrap" }}>
                {quick.map((q) => (
                  <button key={q} onClick={() => { setInput(q); setTimeout(send, 0); }} style={{ border: "1px solid var(--brand-border)", background: "var(--brand-subtle)", color: "var(--text-brand)", fontSize: "var(--text-xs)", fontWeight: 600, padding: "6px 11px", borderRadius: "var(--radius-pill)", cursor: "pointer" }}>{q}</button>
                ))}
              </div>
            ) : null}

            {/* input */}
            <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "12px 14px", borderTop: "1px solid var(--border)", background: "var(--surface-card)" }}>
              <input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={onKey} placeholder="Type a message…" style={{ flex: 1, border: "1px solid var(--border-strong)", borderRadius: "var(--radius-pill)", padding: "10px 14px", fontFamily: "var(--font-sans)", fontSize: "var(--text-sm)", outline: "none", color: "var(--text-strong)" }} />
              <button onClick={send} disabled={!input.trim() || busy} aria-label="Send" style={{ flexShrink: 0, width: 40, height: 40, borderRadius: "50%", border: "none", background: input.trim() && !busy ? "var(--brand)" : "var(--stone-300)", color: "#fff", cursor: input.trim() && !busy ? "pointer" : "default", display: "inline-flex", alignItems: "center", justifyContent: "center" }}>{I("send", 17)}</button>
            </div>
          </div>
        ) : (
          <button onClick={() => setOpen(true)} aria-label="Open chat" style={{ display: "inline-flex", alignItems: "center", gap: 10, height: 56, padding: "0 22px 0 18px", borderRadius: "var(--radius-pill)", border: "none", background: "var(--brand)", color: "#fff", cursor: "pointer", boxShadow: "var(--shadow-lg)", fontFamily: "var(--font-sans)", fontWeight: 700, fontSize: "var(--text-base)", animation: "krmChatIn var(--dur-base) var(--ease-out)" }}>
            <span style={{ display: "inline-flex" }}>{I("message-circle", 22)}</span>
            {TR(cfg.launcher)}
          </button>
        )}
        <style>{`
          @keyframes krmChatIn { from { opacity: 0; transform: translateY(12px) scale(0.96); } to { opacity: 1; transform: none; } }
          @keyframes krmDot { 0%,60%,100% { opacity: 0.25; transform: translateY(0); } 30% { opacity: 1; transform: translateY(-3px); } }
        `}</style>
      </div>
    );
  }

  window.KramaChatAgent = ChatAgent;
})();
