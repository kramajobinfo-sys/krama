// Krama auth -- Login + Register screens with social sign-in. Assigns to window.
(function init() {
  if (!window.KramaDesignSystem_1a6f65) { return setTimeout(init, 40); }
  const { Button, Input, Checkbox } = window.KramaDesignSystem_1a6f65;
  const TR = window.KRAMA_T || function (s) { return s; };

  // Brand social marks (standard "continue with" glyphs)
  const GoogleIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.27-4.74 3.27-8.1Z"/>
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23Z"/>
      <path fill="#FBBC05" d="M5.84 14.1a6.6 6.6 0 0 1 0-4.2V7.06H2.18a11 11 0 0 0 0 9.88l3.66-2.84Z"/>
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84C6.71 7.3 9.14 5.38 12 5.38Z"/>
    </svg>
  );
  const FacebookIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
      <path fill="#1877F2" d="M24 12a12 12 0 1 0-13.88 11.85v-8.38H7.08V12h3.04V9.36c0-3 1.79-4.67 4.53-4.67 1.31 0 2.68.24 2.68.24v2.95H15.8c-1.49 0-1.95.92-1.95 1.87V12h3.32l-.53 3.47h-2.79v8.38A12 12 0 0 0 24 12Z"/>
    </svg>
  );

  const SOCIAL_DEFAULTS = { googleEnabled: true, googleClientId: "", facebookEnabled: true, facebookAppId: "" };

  // Both helpers return the provider ACCESS TOKEN (not a client-fetched profile).
  // The backend verifies the token with the provider and derives the trusted email.
  function signInWithGoogle(clientId, onToken, onError) {
    function trigger() {
      window.google.accounts.oauth2.initTokenClient({
        client_id: clientId,
        scope: "email profile openid",
        callback: function (resp) {
          if (resp.error || !resp.access_token) { onError("Google sign-in failed: " + (resp.error || "no token")); return; }
          onToken(resp.access_token);
        },
      }).requestAccessToken();
    }
    if (window.google && window.google.accounts) { trigger(); return; }
    var s = document.createElement("script");
    s.src = "https://accounts.google.com/gsi/client";
    s.onload = trigger;
    s.onerror = function () { onError("Failed to load Google SDK."); };
    document.head.appendChild(s);
  }

  function signInWithFacebook(appId, onToken, onError) {
    function trigger() {
      window.FB.init({ appId: appId, version: "v18.0", xfbml: false, cookie: true });
      window.FB.login(function (resp) {
        if (!resp.authResponse || !resp.authResponse.accessToken) { onError("Facebook sign-in cancelled."); return; }
        onToken(resp.authResponse.accessToken);
      }, { scope: "email" });
    }
    if (window.FB) { trigger(); return; }
    window.fbAsyncInit = trigger;
    var s = document.createElement("script");
    s.src = "https://connect.facebook.net/en_US/sdk.js";
    s.onerror = function () { onError("Failed to load Facebook SDK."); };
    document.head.appendChild(s);
  }

  function SocialButtons({ onSocialLogin, onError }) {
    const [cfg, setCfg] = React.useState(SOCIAL_DEFAULTS);
    React.useEffect(function() {
      var apiBase = (/^(localhost|127\.0\.0\.1|::1|192\.168\.|10\.)/.test(window.location.hostname) ? 'http://127.0.0.1:8000/api' : (window.location.protocol + '//' + window.location.host + '/api'));
      fetch(apiBase + '/settings/social', { cache: 'no-cache' })
        .then(function(r) { return r.ok ? r.json() : null; })
        .then(function(d) {
          if (d && Object.keys(d).length) {
            setCfg({
              googleEnabled: d.google_enabled !== undefined ? !!d.google_enabled : SOCIAL_DEFAULTS.googleEnabled,
              googleClientId: d.google_client_id || "",
              facebookEnabled: d.facebook_enabled !== undefined ? !!d.facebook_enabled : SOCIAL_DEFAULTS.facebookEnabled,
              facebookAppId: d.facebook_app_id || "",
            });
          }
        })
        .catch(function() {});
    }, []);
    const base = {
      display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
      width: "100%", height: 46, borderRadius: "var(--radius-md)",
      border: "1px solid var(--border-strong)", background: "var(--surface-card)",
      fontFamily: "var(--font-sans)", fontSize: "var(--text-base)", fontWeight: 600,
      color: "var(--text-strong)", cursor: "pointer",
    };

    const handleGoogle = () => {
      if (!cfg.googleClientId) { onError && onError("Google login is not configured. Please contact admin."); return; }
      signInWithGoogle(cfg.googleClientId,
        function (token) { onSocialLogin && onSocialLogin("google", token); },
        function (err) { onError && onError(err); }
      );
    };

    const handleFacebook = () => {
      if (!cfg.facebookAppId) { onError && onError("Facebook login is not configured. Please contact admin."); return; }
      signInWithFacebook(cfg.facebookAppId,
        function (token) { onSocialLogin && onSocialLogin("facebook", token); },
        function (err) { onError && onError(err); }
      );
    };

    const showGoogle = cfg.googleEnabled !== false;
    const showFacebook = cfg.facebookEnabled !== false;
    if (!showGoogle && !showFacebook) return null;

    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {showGoogle && <button style={base} onClick={handleGoogle}><GoogleIcon /> {TR("Continue with Google")}</button>}
        {showFacebook && <button style={base} onClick={handleFacebook}><FacebookIcon /> {TR("Continue with Facebook")}</button>}
      </div>
    );
  }

  function Divider() {
    return (
      <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "20px 0" }}>
        <span style={{ flex: 1, height: 1, background: "var(--border)" }} />
        <span style={{ fontSize: "var(--text-xs)", color: "var(--text-faint)", fontWeight: 600 }}>{TR("OR")}</span>
        <span style={{ flex: 1, height: 1, background: "var(--border)" }} />
      </div>
    );
  }

  function Shell({ children, onNav }) {
    return (
      <div className="krm-auth-shell" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", minHeight: "100vh", background: "var(--surface-page)" }}>
        {/* form side */}
        <div className="krm-auth-form-side" style={{ display: "flex", flexDirection: "column", padding: "28px 40px" }}>
          <div className="krm-auth-logo" style={{ display: "flex", alignItems: "center", gap: 9, cursor: "pointer", alignSelf: "flex-start" }} onClick={() => onNav("home")}>
            <img src={window.getKramaLogo("../../assets/krama-icon.png")} height="36" alt="KRAMA" />
            <span style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "var(--text-lg)", letterSpacing: ".08em", color: "var(--text-strong)" }}>{window.KRAMA_BRAND_NAME || "KRAMA"}</span>
          </div>
          <div className="krm-auth-form-center" style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div style={{ width: "100%", maxWidth: 380 }}>{children}</div>
          </div>
        </div>
        {/* brand side */}
        <div className="krm-auth-brand-side" style={{ position: "relative", background: "var(--teal-800)", overflow: "hidden", display: "flex", alignItems: "center", padding: 56 }}>
          <div style={{ position: "absolute", inset: 0, background: "url('../../assets/krama-pattern.svg')", backgroundSize: 80, opacity: 0.1 }} />
          <div style={{ position: "relative", color: "#fff", maxWidth: 420 }}>
            <h2 style={{ fontFamily: "var(--font-display)", fontSize: "var(--text-4xl)", fontWeight: 800, lineHeight: 1.1, letterSpacing: "-0.02em" }}>{TR("Your next role is waiting.")}</h2>
            <p style={{ color: "var(--stone-300)", fontSize: "var(--text-lg)", marginTop: 16, lineHeight: 1.6 }}>Join 40,000+ people building their careers with verified employers across Cambodia.</p>
            <div style={{ display: "flex", gap: 28, marginTop: 36 }}>
              {[["12,480", "Open jobs"], ["486", "Companies"], ["40k+", "Candidates"]].map(([n, l]) => (
                <div key={l}>
                  <div style={{ fontFamily: "var(--font-display)", fontSize: "var(--text-2xl)", fontWeight: 700 }}>{n}</div>
                  <div style={{ color: "var(--stone-400)", fontSize: "var(--text-sm)", marginTop: 2 }}>{l}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  function Login({ onNav, onLogin }) {
    const [identifier, setIdentifier] = React.useState("");
    const [password, setPassword] = React.useState("");
    const [error, setError] = React.useState("");
    const [loading, setLoading] = React.useState(false);

    const submit = () => {
      setError(""); setLoading(true);
      window.KRAMA_API.login(identifier, password)
        .then((user) => { setLoading(false); if (onLogin) onLogin(user); })
        .catch((e) => { setLoading(false); setError((e && e.message) || "Invalid credentials."); });
    };
    const onKey = (e) => { if (e.key === "Enter") submit(); };

    return (
      <Shell onNav={onNav}>
        <h1 className="krm-auth-title" style={{ fontSize: "var(--text-3xl)", fontWeight: 700, color: "var(--text-strong)" }}>{TR("Welcome back")}</h1>
        <p style={{ color: "var(--text-muted)", marginTop: 8, marginBottom: 28 }}>{TR("Sign in to track applications and saved jobs.")}</p>
        <SocialButtons onError={(msg) => setError(msg)} onSocialLogin={(provider, token) => {
          setError(""); setLoading(true);
          window.KRAMA_API.socialLogin(provider, token)
            .then((user) => { setLoading(false); if (onLogin) onLogin(user); })
            .catch((e) => { setLoading(false); setError((e && e.message) || "Social sign-in failed. Please try again."); });
        }} />
        <Divider />
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {error && <div style={{ padding: "10px 14px", background: "var(--danger-subtle)", color: "var(--danger)", borderRadius: "var(--radius-md)", fontSize: "var(--text-sm)", fontWeight: 500 }}>{error}</div>}
          <Input label={TR("Email or phone")} type="text" placeholder="you@example.com or 012 345 678" value={identifier} onChange={(e) => setIdentifier(e.target.value)} onKeyDown={onKey} />
          <div>
            <Input label={TR("Password")} type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} onKeyDown={onKey} />
            <div style={{ textAlign: "right", marginTop: 8 }}>
              <a href="#" onClick={(e) => { e.preventDefault(); onNav("forgot"); }} style={{ fontSize: "var(--text-sm)", fontWeight: 600 }}>{TR("Forgot password?")}</a>
            </div>
          </div>
          <Button variant="primary" block size="lg" onClick={submit} disabled={loading}>{loading ? "…" : TR("Sign in")}</Button>
        </div>
        <p style={{ textAlign: "center", marginTop: 24, fontSize: "var(--text-sm)", color: "var(--text-muted)" }}>
          {TR("Don't have an account?")}{" "}
          <a href="#" onClick={(e) => { e.preventDefault(); onNav("register"); }} style={{ fontWeight: 700 }}>{TR("Create one")}</a>
        </p>
      </Shell>
    );
  }

  function Register({ onNav, onLogin }) {
    const [role, setRole] = React.useState("candidate");
    const [mode, setMode] = React.useState("email"); // "email" | "phone"
    const [name, setName] = React.useState("");
    const [email, setEmail] = React.useState("");
    const [phone, setPhone] = React.useState("");
    const [otp, setOtp] = React.useState("");
    const [otpSent, setOtpSent] = React.useState(false);
    const [otpBusy, setOtpBusy] = React.useState(false);
    const [otpNote, setOtpNote] = React.useState("");
    const [password, setPassword] = React.useState("");
    const [agreed, setAgreed] = React.useState(false);
    const [error, setError] = React.useState("");
    const [loading, setLoading] = React.useState(false);

    const seg = (id, label, cur, setter) => (
      <button key={id} onClick={() => setter(id)} style={{
        flex: 1, height: 38, border: "none", cursor: "pointer", borderRadius: "var(--radius-sm)",
        fontFamily: "var(--font-sans)", fontSize: "var(--text-sm)", fontWeight: 700,
        background: cur === id ? "var(--surface-card)" : "transparent",
        color: cur === id ? "var(--text-brand)" : "var(--text-muted)",
        boxShadow: cur === id ? "var(--shadow-xs)" : "none",
      }}>{label}</button>
    );

    const sendCode = () => {
      if (!phone) { setError(TR("Enter your phone number.")); return; }
      setError(""); setOtpBusy(true); setOtpNote("");
      window.KRAMA_API.requestOtp(phone)
        .then(() => { setOtpBusy(false); setOtpSent(true); setOtpNote(TR("We sent a 6-digit code to your phone.")); })
        .catch((e) => { setOtpBusy(false); setError((e && e.message) || "Could not send code."); });
    };

    const submit = () => {
      if (!agreed) { setError("Please agree to the Terms and Privacy Policy."); return; }
      if (mode === "phone" && !otpSent) { setError(TR("Request the code sent to your phone first.")); return; }
      setError(""); setLoading(true);
      var payload = mode === "phone"
        ? { name: name, phone: phone, otp: otp, password: password, role: role }
        : { name: name, email: email, password: password, role: role };
      window.KRAMA_API.register(payload)
        .then((user) => { setLoading(false); if (onLogin) onLogin(user); })
        .catch((e) => {
          setLoading(false);
          const errs = e && e.errors;
          if (errs) { const first = Object.values(errs)[0]; setError(Array.isArray(first) ? first[0] : first); }
          else setError((e && e.message) || "Registration failed.");
        });
    };

    return (
      <Shell onNav={onNav}>
        <h1 className="krm-auth-title" style={{ fontSize: "var(--text-3xl)", fontWeight: 700, color: "var(--text-strong)" }}>{TR("Create your account")}</h1>
        <p style={{ color: "var(--text-muted)", marginTop: 8, marginBottom: 20 }}>{TR("It's free. Apply to jobs in two clicks.")}</p>
        <div style={{ display: "flex", gap: 4, padding: 4, background: "var(--surface-sunken)", borderRadius: "var(--radius-md)", marginBottom: 22 }}>
          {seg("candidate", TR("I'm a candidate"), role, setRole)}
          {seg("employer", TR("I'm a member"), role, setRole)}
        </div>
        <SocialButtons onError={(msg) => setError(msg)} onSocialLogin={(provider, token) => {
          setError(""); setLoading(true);
          window.KRAMA_API.socialLogin(provider, token)
            .then((user) => { setLoading(false); if (onLogin) onLogin(user); })
            .catch((e) => { setLoading(false); setError((e && e.message) || "Social sign-in failed. Please try again."); });
        }} />
        <Divider />
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {error && <div style={{ padding: "10px 14px", background: "var(--danger-subtle)", color: "var(--danger)", borderRadius: "var(--radius-md)", fontSize: "var(--text-sm)", fontWeight: 500 }}>{error}</div>}
          <Input label={role === "employer" ? TR("Contact name") : TR("Full name")} placeholder={TR("Sok Dara")} value={name} onChange={(e) => setName(e.target.value)} />
          <div style={{ display: "flex", gap: 4, padding: 4, background: "var(--surface-sunken)", borderRadius: "var(--radius-md)" }}>
            {seg("email", TR("Email"), mode, function (m) { setMode(m); setError(""); })}
            {seg("phone", TR("Phone"), mode, function (m) { setMode(m); setError(""); })}
          </div>
          {mode === "email" && (
            <Input label={TR("Email")} type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} />
          )}
          {mode === "phone" && (
            <React.Fragment>
              <div style={{ display: "flex", gap: 8, alignItems: "flex-end" }}>
                <div style={{ flex: 1 }}>
                  <Input label={TR("Phone number")} type="tel" placeholder="012 345 678" value={phone} onChange={(e) => { setPhone(e.target.value); setOtpSent(false); }} />
                </div>
                <Button variant="secondary" onClick={sendCode} disabled={otpBusy || !phone}>{otpBusy ? "…" : (otpSent ? TR("Resend") : TR("Send code"))}</Button>
              </div>
              {otpNote && <div style={{ fontSize: "var(--text-sm)", color: "var(--success)" }}>{otpNote}</div>}
              {otpSent && <Input label={TR("Verification code")} type="text" placeholder="123456" value={otp} onChange={(e) => setOtp(e.target.value)} />}
            </React.Fragment>
          )}
          <Input label={TR("Password")} type="password" placeholder={TR("Min. 8 characters")} value={password} onChange={(e) => setPassword(e.target.value)} />
          <Checkbox label={<span style={{ fontSize: "var(--text-sm)" }}>{TR("I agree to the Terms and Privacy Policy")}</span>} checked={agreed} onChange={() => setAgreed((v) => !v)} />
          <Button variant="primary" block size="lg" onClick={submit} disabled={loading}>{loading ? "Creating account…" : "Create account"}</Button>
        </div>
        <p style={{ textAlign: "center", marginTop: 22, fontSize: "var(--text-sm)", color: "var(--text-muted)" }}>
          Already have an account?{" "}
          <a href="#" onClick={(e) => { e.preventDefault(); onNav("login"); }} style={{ fontWeight: 700 }}>{TR("Sign in")}</a>
        </p>
      </Shell>
    );
  }

  function ForgotPassword({ onNav }) {
    // step: "request" -> "sent" -> "reset" -> "done"
    // A reset link (?reset=1&token=…&email=…) deep-links straight into the "reset" step.
    const params = new URLSearchParams(window.location.search);
    const resetToken = params.get("token") || "";
    const linkEmail = params.get("email") || "";
    const [step, setStep] = React.useState(resetToken ? "reset" : "request");
    const [email, setEmail] = React.useState(linkEmail);
    const [password, setPassword] = React.useState("");
    const [confirm, setConfirm] = React.useState("");
    const [error, setError] = React.useState("");
    const [loading, setLoading] = React.useState(false);
    React.useEffect(() => { if (window.lucide) window.lucide.createIcons(); });
    const I = (n, s = 18) => <i data-lucide={n} style={{ width: s, height: s }}></i>;

    function sendLink() {
      if (!email.trim() || loading) return;
      setError(""); setLoading(true);
      window.KRAMA_API.forgotPassword(email.trim())
        .then(() => { setLoading(false); setStep("sent"); })
        .catch((e) => { setLoading(false); setError((e && e.message) || "Something went wrong. Please try again."); });
    }

    function submitReset() {
      if (loading) return;
      if (password.length < 8) { setError("Password must be at least 8 characters."); return; }
      if (password !== confirm) { setError("Passwords do not match."); return; }
      setError(""); setLoading(true);
      window.KRAMA_API.resetPassword(email, resetToken, password, confirm)
        .then(() => { setLoading(false); setStep("done"); })
        .catch((e) => { setLoading(false); setError((e && e.message) || "This reset link is invalid or has expired."); });
    }

    const backToLogin = (
      <p style={{ textAlign: "center", marginTop: 24, fontSize: "var(--text-sm)", color: "var(--text-muted)" }}>
        <a href="#" onClick={(e) => { e.preventDefault(); onNav("login"); }} style={{ fontWeight: 700, display: "inline-flex", alignItems: "center", gap: 6, whiteSpace: "nowrap" }}>{I("arrow-left", 14)} Back to sign in</a>
      </p>
    );

    let body;
    if (step === "request") {
      body = (
        <React.Fragment>
          <h1 className="krm-auth-title" style={{ fontSize: "var(--text-3xl)", fontWeight: 700, color: "var(--text-strong)" }}>{TR("Forgot your password?")}</h1>
          <p style={{ color: "var(--text-muted)", marginTop: 8, marginBottom: 28 }}>{TR("Enter your email and we'll send a reset link.")}</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {error && <div style={{ background: "var(--danger-subtle)", color: "var(--danger)", padding: "10px 14px", borderRadius: "var(--radius-md)", fontSize: "var(--text-sm)" }}>{error}</div>}
            <Input label={TR("Email")} type="email" value={email} onChange={(e) => setEmail(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") sendLink(); }} iconLeft={I("mail", 16)} />
            <Button variant="primary" block size="lg" disabled={loading} onClick={sendLink}>{loading ? "Sending…" : "Send reset link"}</Button>
          </div>
          {backToLogin}
        </React.Fragment>
      );
    } else if (step === "sent") {
      body = (
        <div style={{ textAlign: "center" }}>
          <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 60, height: 60, borderRadius: "50%", background: "var(--brand-subtle)", color: "var(--brand)" }}>{I("mail-check", 28)}</span>
          <h1 style={{ fontSize: "var(--text-2xl)", fontWeight: 700, color: "var(--text-strong)", marginTop: 18 }}>{TR("Check your email")}</h1>
          <p style={{ color: "var(--text-muted)", marginTop: 8, lineHeight: 1.55 }}>If an account exists for<br/><strong style={{ color: "var(--text-body)" }}>{email}</strong>, we've sent a reset link. It expires in 60 minutes.</p>
          <p style={{ marginTop: 20, fontSize: "var(--text-sm)", color: "var(--text-muted)" }}>
            Didn't get it? <a href="#" onClick={(e) => { e.preventDefault(); setError(""); setStep("request"); }} style={{ fontWeight: 700 }}>{TR("Try again")}</a>
          </p>
          {backToLogin}
        </div>
      );
    } else if (step === "reset") {
      body = (
        <React.Fragment>
          <h1 className="krm-auth-title" style={{ fontSize: "var(--text-3xl)", fontWeight: 700, color: "var(--text-strong)" }}>{TR("Set a new password")}</h1>
          <p style={{ color: "var(--text-muted)", marginTop: 8, marginBottom: 28 }}>{TR("Choose a strong password you haven't used before.")}</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {error && <div style={{ background: "var(--danger-subtle)", color: "var(--danger)", padding: "10px 14px", borderRadius: "var(--radius-md)", fontSize: "var(--text-sm)" }}>{error}</div>}
            <Input label={TR("New password")} type="password" placeholder="••••••••" hint="At least 8 characters, with upper & lower case, a number, and a symbol." value={password} onChange={(e) => setPassword(e.target.value)} />
            <Input label={TR("Confirm password")} type="password" placeholder="••••••••" value={confirm} onChange={(e) => setConfirm(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") submitReset(); }} />
            <Button variant="primary" block size="lg" disabled={loading} onClick={submitReset}>{loading ? "Resetting…" : "Reset password"}</Button>
          </div>
        </React.Fragment>
      );
    } else {
      body = (
        <div style={{ textAlign: "center" }}>
          <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 60, height: 60, borderRadius: "50%", background: "var(--success-subtle)", color: "var(--success)" }}>{I("check", 28)}</span>
          <h1 style={{ fontSize: "var(--text-2xl)", fontWeight: 700, color: "var(--text-strong)", marginTop: 18 }}>{TR("Password reset")}</h1>
          <p style={{ color: "var(--text-muted)", marginTop: 8, lineHeight: 1.55 }}>Your password has been updated. You can now sign in with your new password.</p>
          <Button variant="primary" block size="lg" style={{ marginTop: 24 }} onClick={() => onNav("login")}>{TR("Back to sign in")}</Button>
        </div>
      );
    }
    return <Shell onNav={onNav}>{body}</Shell>;
  }

  window.KramaLogin = Login;
  window.KramaRegister = Register;
  window.KramaForgotPassword = ForgotPassword;
})();
