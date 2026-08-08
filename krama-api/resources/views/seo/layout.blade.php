<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>@yield('title')</title>
  <meta name="description" content="{{ $metaDesc }}">
  <link rel="canonical" href="{{ $canonical }}">
  <meta name="robots" content="@yield('robots', 'index, follow, max-image-preview:large')">

  {{-- Open Graph (social share previews) --}}
  <meta property="og:site_name" content="Krama">
  <meta property="og:type" content="@yield('og_type', 'website')">
  <meta property="og:title" content="@yield('title')">
  <meta property="og:description" content="{{ $metaDesc }}">
  <meta property="og:url" content="{{ $canonical }}">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="@yield('title')">
  <meta name="twitter:description" content="{{ $metaDesc }}">
  @stack('head')

  {{-- Structured data. Needs the nonce: script-src is nonce-only (see SecurityHeaders). --}}
  <script type="application/ld+json" nonce="{{ $cspNonce ?? '' }}">{!! json_encode($ld, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE) !!}</script>

  {{-- Same families as the main app (krama/fonts/fonts.css). Kantumruy Pro carries Khmer. --}}
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Sora:wght@600;700;800&family=Plus+Jakarta+Sans:wght@400;500;600;700&family=Kantumruy+Pro:wght@400;600;700&display=swap">

  <style nonce="{{ $cspNonce ?? '' }}">
    :root {
      --teal:#0C7E6B; --teal-700:#0B6557; --teal-50:#ECFBF6; --teal-100:#D0F5EA;
      --ink:#111827; --body:#374151; --muted:#6b7280; --faint:#9ca3af;
      --line:#e5e7eb; --line-soft:#f0f2f1; --bg:#F4F6F5;
      --display:'Sora',-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;
      --sans:'Plus Jakarta Sans','Kantumruy Pro',-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;
    }
    * { box-sizing:border-box; }
    body { margin:0; font-family:var(--sans); color:var(--body); background:var(--bg); line-height:1.6; -webkit-font-smoothing:antialiased; }
    .wrap { max-width:860px; margin:0 auto; padding:26px 20px 64px; }

    /* ── Site chrome: mirrors the SPA's header/footer (public-website/chrome.jsx) so a
       server-rendered page doesn't read as a different site. Static markup — the SPA's
       language toggle and account menu need JS, so they are left out rather than faked. --- */
    header.site { position:sticky; top:0; z-index:50; height:64px; display:flex; align-items:center; gap:32px;
      padding:0 32px; background:rgba(255,255,255,.92); backdrop-filter:blur(8px); border-bottom:1px solid var(--line); }
    .site-logo { display:flex; align-items:center; gap:9px; flex-shrink:0; text-decoration:none; }
    .site-logo img { height:36px; width:auto; display:block; }
    .site-logo span { font-family:var(--display); font-weight:800; font-size:18px; letter-spacing:.08em; color:var(--ink); }
    .site-nav { display:flex; gap:6px; }
    .site-nav a { font-size:15px; font-weight:500; color:var(--body); text-decoration:none; padding:8px 12px; border-radius:8px; }
    .site-nav a:hover { color:var(--teal); background:var(--teal-50); }
    .site-actions { margin-left:auto; display:flex; align-items:center; gap:12px; flex-shrink:0; }
    .site-signin { font-size:15px; font-weight:600; color:var(--ink); text-decoration:none; }
    .site-signin:hover { color:var(--teal); }
    .site-post { background:var(--teal); color:#fff; text-decoration:none; font-weight:700; font-size:14px; padding:10px 18px; border-radius:10px; white-space:nowrap; }
    .site-post:hover { background:var(--teal-700); }
    .card { background:#fff; border:1px solid var(--line); border-radius:16px; padding:28px; box-shadow:0 1px 2px rgba(16,24,40,.04), 0 8px 24px -12px rgba(16,24,40,.10); }
    h1 { font-family:var(--display); font-size:28px; line-height:1.2; margin:0 0 6px; color:var(--ink); font-weight:800; letter-spacing:-.01em; }
    h2 { font-family:var(--display); font-size:15px; margin:28px 0 12px; color:var(--ink); font-weight:700; text-transform:uppercase; letter-spacing:.08em; }
    .meta { color:var(--muted); font-size:14px; margin:2px 0; }
    .mt-lg { margin-top:24px; }
    .chips { display:flex; flex-wrap:wrap; gap:8px; margin:14px 0; }
    .chip { background:var(--teal-50); border:1px solid var(--teal-100); border-radius:999px; padding:5px 13px; font-size:13px; font-weight:600; color:var(--teal-700); }
    .chip-org { display:inline-block; border-radius:999px; padding:5px 13px; font-size:13px; font-weight:700; }
    .chip-org-ngo { background:rgba(14,116,144,.12); color:#0e7490; }
    .chip-org-government { background:rgba(67,56,202,.12); color:#4338ca; }
    .chip-org-education { background:rgba(124,58,237,.12); color:#7c3aed; }
    .chip-org-international { background:rgba(15,118,110,.12); color:#0f766e; }
    .cta { display:inline-block; background:var(--teal); color:#fff; text-decoration:none; font-weight:700; padding:12px 22px; border-radius:10px; margin:20px 0 4px; }
    .cta:hover { background:var(--teal-700); }
    .content { font-size:15px; color:var(--body); }
    .content ul { padding-left:20px; }
    a { color:var(--teal); }
    .joblist { list-style:none; padding:0; margin:0; }
    .joblist li { border-bottom:1px solid var(--line); padding:12px 0; }
    .joblist a { font-weight:600; text-decoration:none; font-size:16px; }
    footer.site { position:relative; background:#1C1B17; padding:56px 32px 32px; overflow:hidden; }
    .foot-pattern { position:absolute; inset:0; background:url('/krama/assets/krama-pattern.svg'); background-size:64px; opacity:.05; }
    .foot-grid { position:relative; max-width:1200px; margin:0 auto; display:grid; grid-template-columns:1.4fr 1fr 1fr 1fr; gap:40px; }
    .foot-brand { display:flex; align-items:center; gap:9px; }
    .foot-brand img { height:34px; width:auto; display:block; }
    .foot-brand span { font-family:var(--display); font-weight:800; font-size:17px; letter-spacing:.08em; color:#fff; }
    .foot-tag { color:#D2CFC7; font-size:14px; margin-top:16px; max-width:260px; line-height:1.6; }
    .foot-col-title { font-weight:700; color:#F8F8F6; font-size:14px; margin-bottom:12px; }
    .foot-links { display:flex; flex-direction:column; gap:9px; }
    .foot-links a { color:#D2CFC7; font-size:14px; text-decoration:none; }
    .foot-links a:hover { color:#fff; }
    .foot-bottom { position:relative; max-width:1200px; margin:32px auto 0; padding-top:20px;
      border-top:1px solid rgba(255,255,255,.1); color:#D2CFC7; font-size:13px; }

    @media (max-width:860px) {
      header.site { padding:0 16px; gap:16px; }
      .site-nav { display:none; }
      footer.site { padding:40px 20px 28px; }
      .foot-grid { grid-template-columns:1fr 1fr; gap:28px; }
      .foot-brand-col { grid-column:1 / -1; }
    }
    @media (max-width:460px) {
      .foot-grid { grid-template-columns:1fr; }
      /* Logo + wordmark + two actions won't fit at 375px — keep the primary action only. */
      .site-signin { display:none; }
      .site-logo span { font-size:16px; }
    }

    @yield('page_css')
  </style>
</head>
<body>
  @php
    // ?page=<id> is the SPA's deep link for views with no clean URL of their own
    // (see public-website/app.jsx). Without it every one of these would land on home.
    $brandName = $brandName ?? 'Krama';
    $logo      = $brandLogo ?: url('/krama/assets/krama-icon.png');
    $go        = fn ($id) => url('/?page=' . $id);
  @endphp

  <header class="site">
    <a class="site-logo" href="{{ url('/') }}">
      <img src="{{ $logo }}" alt="{{ $brandName }}">
      <span>{{ $brandName }}</span>
    </a>
    <nav class="site-nav">
      <a href="{{ url('/') }}">Home</a>
      <a href="{{ $go('jobs') }}">Find jobs</a>
      <a href="{{ $go('companies') }}">Companies</a>
      <a href="{{ $go('community') }}">Community</a>
      <a href="{{ $go('employers') }}">Employers</a>
    </nav>
    {{-- The SPA also shows a language toggle and an account menu here; both need JS and
         session state, so they are omitted rather than rendered as dead controls. --}}
    <div class="site-actions">
      <a class="site-signin" href="{{ $go('login') }}">Sign in</a>
      <a class="site-post" href="{{ $go('register') }}">Post a job</a>
    </div>
  </header>

  <main class="wrap">
    @yield('content')
  </main>

  <footer class="site">
    <div class="foot-pattern"></div>
    <div class="foot-grid">
      <div class="foot-brand-col">
        <div class="foot-brand">
          <img src="{{ $logo }}" alt="{{ $brandName }}">
          <span>{{ $brandName }}</span>
        </div>
        <p class="foot-tag">Connecting talent and verified employers across Cambodia and Southeast Asia.</p>
      </div>
      <div>
        <div class="foot-col-title">For candidates</div>
        <div class="foot-links">
          <a href="{{ $go('jobs') }}">Find jobs</a>
          <a href="{{ $go('register') }}">Build résumé</a>
          <a href="{{ $go('login') }}">Saved jobs</a>
          <a href="{{ $go('community') }}">Community</a>
        </div>
      </div>
      <div>
        <div class="foot-col-title">Employers</div>
        <div class="foot-links">
          <a href="{{ $go('employers') }}">Employers</a>
          <a href="{{ $go('register') }}">Post a job</a>
          <a href="{{ $go('pricing') }}">Pricing</a>
          <a href="{{ $go('companies') }}">Companies</a>
        </div>
      </div>
      <div>
        <div class="foot-col-title">Company</div>
        <div class="foot-links">
          <a href="{{ $go('about') }}">About us</a>
          <a href="{{ $go('contact') }}">Contact</a>
          <a href="{{ url('/terms') }}">Terms</a>
          <a href="{{ url('/privacy') }}">Privacy</a>
        </div>
      </div>
    </div>
    <div class="foot-bottom">© {{ date('Y') }} {{ $brandName }} Job. All rights reserved.</div>
  </footer>
</body>
</html>
