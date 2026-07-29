<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>@yield('title')</title>
  <meta name="description" content="{{ $metaDesc }}">
  <link rel="canonical" href="{{ $canonical }}">
  <meta name="robots" content="index, follow, max-image-preview:large">

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

  {{-- Structured data --}}
  <script type="application/ld+json">{!! json_encode($ld, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE) !!}</script>

  <style>
    :root { --teal:#0C7E6B; --ink:#1a1a1a; --muted:#6b7280; --line:#e5e7eb; --bg:#f8faf9; }
    * { box-sizing:border-box; }
    body { margin:0; font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif; color:var(--ink); background:var(--bg); line-height:1.6; }
    .wrap { max-width:760px; margin:0 auto; padding:24px 20px 64px; }
    header.site { background:var(--teal); }
    header.site .wrap { padding:14px 20px; }
    header.site a { color:#fff; text-decoration:none; font-weight:800; letter-spacing:.06em; font-size:20px; }
    .card { background:#fff; border:1px solid var(--line); border-radius:12px; padding:24px; }
    h1 { font-size:26px; line-height:1.25; margin:0 0 6px; }
    h2 { font-size:19px; margin:26px 0 8px; }
    .meta { color:var(--muted); font-size:14px; margin:2px 0; }
    .chips { display:flex; flex-wrap:wrap; gap:8px; margin:14px 0; }
    .chip { background:var(--bg); border:1px solid var(--line); border-radius:999px; padding:4px 12px; font-size:13px; color:#374151; }
    .cta { display:inline-block; background:var(--teal); color:#fff; text-decoration:none; font-weight:700; padding:12px 22px; border-radius:8px; margin:20px 0 4px; }
    .content { font-size:15px; }
    .content ul { padding-left:20px; }
    a { color:var(--teal); }
    .joblist { list-style:none; padding:0; margin:0; }
    .joblist li { border-bottom:1px solid var(--line); padding:12px 0; }
    .joblist a { font-weight:600; text-decoration:none; font-size:16px; }
    footer.site { color:var(--muted); font-size:13px; text-align:center; padding:24px; }
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
