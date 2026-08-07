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
    header.site { background:var(--teal); }
    header.site .wrap { padding:14px 20px; display:flex; align-items:center; }
    header.site a { color:#fff; text-decoration:none; font-family:var(--display); font-weight:800; letter-spacing:.10em; font-size:19px; }
    .card { background:#fff; border:1px solid var(--line); border-radius:16px; padding:28px; box-shadow:0 1px 2px rgba(16,24,40,.04), 0 8px 24px -12px rgba(16,24,40,.10); }
    h1 { font-family:var(--display); font-size:28px; line-height:1.2; margin:0 0 6px; color:var(--ink); font-weight:800; letter-spacing:-.01em; }
    h2 { font-family:var(--display); font-size:15px; margin:28px 0 12px; color:var(--ink); font-weight:700; text-transform:uppercase; letter-spacing:.08em; }
    .meta { color:var(--muted); font-size:14px; margin:2px 0; }
    .mt-lg { margin-top:24px; }
    .chips { display:flex; flex-wrap:wrap; gap:8px; margin:14px 0; }
    .chip { background:var(--teal-50); border:1px solid var(--teal-100); border-radius:999px; padding:5px 13px; font-size:13px; font-weight:600; color:var(--teal-700); }
    .cta { display:inline-block; background:var(--teal); color:#fff; text-decoration:none; font-weight:700; padding:12px 22px; border-radius:10px; margin:20px 0 4px; }
    .cta:hover { background:var(--teal-700); }
    .content { font-size:15px; color:var(--body); }
    .content ul { padding-left:20px; }
    a { color:var(--teal); }
    .joblist { list-style:none; padding:0; margin:0; }
    .joblist li { border-bottom:1px solid var(--line); padding:12px 0; }
    .joblist a { font-weight:600; text-decoration:none; font-size:16px; }
    footer.site { color:var(--muted); font-size:13px; text-align:center; padding:24px; }
    @yield('page_css')
  </style>
</head>
<body>
  <header class="site"><div class="wrap"><a href="{{ url('/') }}">KRAMA</a></div></header>
  <main class="wrap">
    @yield('content')
  </main>
  <footer class="site">© {{ date('Y') }} Krama — Jobs &amp; Hiring in Cambodia</footer>
</body>
</html>
