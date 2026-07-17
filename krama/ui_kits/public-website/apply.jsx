// Krama -- Apply modal. Multi-state: form → success. Assigns to window.
(function init() {
  if (!window.KramaDesignSystem_1a6f65) { return setTimeout(init, 40); }
  const { Button, Input, Textarea, Avatar, IconButton } = window.KramaDesignSystem_1a6f65;
  const TR = window.KRAMA_T || function (s) { return s; };
  const I = (n, s = 18) => <i data-lucide={n} style={{ width: s, height: s }}></i>;

  function ApplyModal({ job, onClose, user, onNav }) {
    const [done, setDone] = React.useState(false);
    const [loading, setLoading] = React.useState(false);
    const [error, setError] = React.useState("");
    const [coverNote, setCoverNote] = React.useState("");

    React.useEffect(() => { if (window.lucide) window.lucide.createIcons(); });

    if (!job) return null;

    // Gate: must be logged in to apply
    if (!user) {
      return (
        <div onClick={onClose} style={{ position: "fixed", inset: 0, zIndex: 200, background: "var(--surface-overlay)", backdropFilter: "blur(2px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
          <div onClick={(e) => e.stopPropagation()} style={{ width: "100%", maxWidth: 400, background: "var(--surface-card)", borderRadius: "var(--radius-xl)", boxShadow: "var(--shadow-xl)", padding: 36, textAlign: "center" }}>
            <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 56, height: 56, borderRadius: "50%", background: "var(--brand-subtle)", color: "var(--brand)", marginBottom: 16 }}>{I("lock", 24)}</span>
            <h2 style={{ fontSize: "var(--text-xl)", fontWeight: 700, color: "var(--text-strong)" }}>{TR("Sign in to apply")}</h2>
            <p style={{ color: "var(--text-muted)", marginTop: 8, marginBottom: 24, fontSize: "var(--text-sm)" }}>You need an account to apply to <strong>{job.title}</strong> and track your applications.</p>
            <div style={{ display: "flex", gap: 10, marginBottom: 12 }}>
              <Button variant="secondary" block onClick={() => { onClose(); if (onNav) onNav("login"); }}>{TR("Sign in")}</Button>
              <Button variant="primary" block onClick={() => { onClose(); if (onNav) onNav("register"); }}>{TR("Create account")}</Button>
            </div>
            <Button variant="ghost" block onClick={onClose}>{TR("Cancel")}</Button>
          </div>
        </div>
      );
    }

    const submitApplication = () => {
      setError(""); setLoading(true);
      window.KRAMA_API.applyToJob(job._raw ? job._raw.id : job.id, coverNote)
        .then(() => { setLoading(false); setDone(true); })
        .catch((e) => { setLoading(false); setError((e && e.message) || "Application failed. Please try again."); });
    };

    return (
      <div
        onClick={!loading ? onClose : undefined}
        style={{
          position: "fixed", inset: 0, zIndex: 200,
          background: "var(--surface-overlay)", backdropFilter: "blur(2px)",
          display: "flex", alignItems: "center", justifyContent: "center", padding: 24,
          animation: "krmfade var(--dur-base) var(--ease-out)",
        }}
      >
        <div
          onClick={(e) => e.stopPropagation()}
          style={{
            width: "100%", maxWidth: 480, background: "var(--surface-card)",
            borderRadius: "var(--radius-xl)", boxShadow: "var(--shadow-xl)",
            overflow: "hidden", animation: "krmrise var(--dur-base) var(--ease-out)",
            padding: "36px 32px",
          }}
        >
          {loading ? (
            <div style={{ textAlign: "center" }}>
              <div style={{ width: 48, height: 48, border: "3px solid var(--border-strong)", borderTopColor: "var(--brand)", borderRadius: "50%", animation: "krmspin 0.8s linear infinite", margin: "0 auto 20px" }} />
              <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "var(--text-lg)", color: "var(--text-strong)" }}>Submitting your application…</div>
              <div style={{ fontSize: "var(--text-sm)", color: "var(--text-muted)", marginTop: 6 }}>{job.title} · {job.company}</div>
            </div>
          ) : done ? (
            <div style={{ textAlign: "center" }}>
              <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 64, height: 64, borderRadius: "50%", background: "var(--success-subtle)", color: "var(--success)", animation: "krmpop var(--dur-slow) var(--ease-spring)", marginBottom: 4 }}>{I("check", 30)}</span>
              <h2 style={{ fontSize: "var(--text-2xl)", fontWeight: 700, color: "var(--text-strong)", marginTop: 18 }}>Application sent!</h2>
              <p style={{ color: "var(--text-muted)", marginTop: 8, maxWidth: 320, marginLeft: "auto", marginRight: "auto", lineHeight: 1.55 }}>
                {job.company} has received your application for <strong style={{ color: "var(--text-body)" }}>{job.title}</strong>.
              </p>
              <div style={{ display: "flex", gap: 10, justifyContent: "center", marginTop: 24 }}>
                <Button variant="secondary" onClick={onClose}>{TR("Keep browsing")}</Button>
              </div>
            </div>
          ) : (
            <React.Fragment>
              <div style={{ marginBottom: 20 }}>
                <h2 style={{ fontSize: "var(--text-xl)", fontWeight: 700, color: "var(--text-strong)", margin: 0 }}>{TR("Apply for this role")}</h2>
                <p style={{ fontSize: "var(--text-sm)", color: "var(--text-muted)", marginTop: 6, marginBottom: 0 }}>
                  {job.title} · <span style={{ color: "var(--text-body)" }}>{job.company}</span>
                </p>
              </div>
              {error && (
                <div style={{ background: "var(--danger-subtle)", color: "var(--danger)", borderRadius: "var(--radius-md)", padding: "10px 14px", fontSize: "var(--text-sm)", marginBottom: 16 }}>
                  {error}
                </div>
              )}
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: "block", fontSize: "var(--text-sm)", fontWeight: 600, color: "var(--text-body)", marginBottom: 6 }}>
                  Cover note <span style={{ fontWeight: 400, color: "var(--text-muted)" }}>(optional)</span>
                </label>
                <Textarea
                  value={coverNote}
                  onChange={(e) => setCoverNote(e.target.value)}
                  placeholder={TR("Tell the employer why you're a great fit…")}
                  rows={4}
                />
              </div>
              <div style={{ display: "flex", gap: 10 }}>
                <Button variant="secondary" block onClick={onClose}>{TR("Cancel")}</Button>
                <Button variant="primary" block onClick={submitApplication}>{TR("Submit application")}</Button>
              </div>
            </React.Fragment>
          )}
        </div>
        <style>{`
          @keyframes krmfade { from { opacity: 0 } to { opacity: 1 } }
          @keyframes krmrise { from { opacity: 0; transform: translateY(12px) } to { opacity: 1; transform: none } }
          @keyframes krmpop { 0% { transform: scale(0.6); opacity: 0 } 100% { transform: scale(1); opacity: 1 } }
          @keyframes krmspin { to { transform: rotate(360deg); } }
        `}</style>
      </div>
    );
  }

  window.KramaApplyModal = ApplyModal;
})();
