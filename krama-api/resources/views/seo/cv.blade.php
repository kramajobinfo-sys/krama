@extends('seo.layout')

@section('title', $name . ' — CV | Krama')
@section('robots', 'noindex, nofollow')
@section('og_type', 'profile')

{{-- Lands inside the layout's nonce'd <style>, so it needs no nonce of its own. --}}
@section('page_css')
@verbatim
    .cv { padding:0; overflow:hidden; }
    .cv-head { display:flex; align-items:center; gap:20px; padding:30px 32px; background:linear-gradient(135deg,#0C7E6B 0%,#0B6557 100%); color:#fff; }
    .cv-avatar { width:88px; height:88px; border-radius:18px; object-fit:cover; flex-shrink:0; border:3px solid rgba(255,255,255,.28); background:#fff; }
    .cv-mono { width:88px; height:88px; border-radius:18px; flex-shrink:0; border:3px solid rgba(255,255,255,.28);
      background:rgba(255,255,255,.14); display:flex; align-items:center; justify-content:center;
      font-family:var(--display); font-weight:800; font-size:32px; letter-spacing:.02em; color:#fff; }
    .cv-id { min-width:0; }
    .cv-name { font-family:var(--display); font-size:30px; font-weight:800; line-height:1.15; margin:0; color:#fff; letter-spacing:-.01em; word-wrap:break-word; }
    .cv-role { font-size:16px; font-weight:600; margin:6px 0 0; color:rgba(255,255,255,.92); }
    .cv-verified { display:inline-flex; align-items:center; gap:6px; margin-top:12px; padding:4px 11px; border-radius:999px;
      background:rgba(255,255,255,.16); font-size:12px; font-weight:700; letter-spacing:.03em; color:#fff; }

    .cv-body { display:grid; grid-template-columns:1fr 250px; gap:0; }
    .cv-body-solo { grid-template-columns:1fr; }
    .cv-main { padding:8px 32px 30px; min-width:0; }
    .cv-aside { padding:8px 28px 30px; border-left:1px solid var(--line); background:#FCFDFD; min-width:0; }
    .cv-body h2 { margin:26px 0 12px; }
    .cv-main h2:first-of-type, .cv-aside h2:first-of-type { margin-top:22px; }

    /* Experience / education timeline */
    .tl { position:relative; padding-left:20px; }
    .tl::before { content:''; position:absolute; left:4px; top:6px; bottom:6px; width:2px; background:var(--line); border-radius:2px; }
    .tl-item { position:relative; padding:0 0 18px; }
    .tl-item:last-child { padding-bottom:0; }
    .tl-item::before { content:''; position:absolute; left:-20px; top:6px; width:10px; height:10px; border-radius:50%;
      background:#fff; border:2.5px solid var(--teal); }
    .tl-title { font-weight:700; font-size:15px; color:var(--ink); line-height:1.4; }
    .tl-org { font-weight:600; color:var(--teal); }
    .tl-years { font-size:13px; color:var(--muted); margin-top:2px; font-variant-numeric:tabular-nums; }
    .tl-note { font-size:14px; margin-top:6px; color:var(--body); }
    .tl-note ul { padding-left:18px; margin:4px 0; }

    .cv-aside .chips { gap:7px; }
    /* Squarer than the pill used elsewhere: skills like "Microsoft Dynamics Business
       Central 365" wrap to two lines in a 250px column, and a 999px radius on a
       two-line box reads as a squashed stadium rather than a tag. */
    .cv-aside .chip { font-size:12.5px; padding:5px 11px; border-radius:9px; line-height:1.45; }
    .cert { font-size:14px; color:var(--body); padding:7px 0; border-bottom:1px solid var(--line-soft); }
    .cert:last-child { border-bottom:none; }
    .cert-year { color:var(--muted); font-size:13px; }

    .cv-foot { padding:16px 32px 22px; border-top:1px solid var(--line); font-size:13px; color:var(--muted); }
    .cv-empty { font-size:14px; color:var(--faint); padding:6px 0 2px; }

    @media (max-width:760px) {
      .cv-head { flex-direction:column; align-items:flex-start; gap:14px; padding:24px 20px; }
      .cv-name { font-size:25px; }
      .cv-body { grid-template-columns:1fr; }
      .cv-main { padding:4px 20px 12px; }
      .cv-aside { border-left:none; border-top:1px solid var(--line); padding:8px 20px 26px; }
      .cv-foot { padding:14px 20px 20px; }
    }

    /* A shared CV gets printed and attached to applications — make that copy clean. */
    @media print {
      body { background:#fff; }
      header.site, footer.site, .cta { display:none !important; }
      .wrap { max-width:none; padding:0; }
      .cv { border:none; box-shadow:none; border-radius:0; }
      .cv-head { background:#0C7E6B !important; -webkit-print-color-adjust:exact; print-color-adjust:exact; }
      .cv-aside { background:#fff; }
      .tl-item { break-inside:avoid; }
    }
@endverbatim
@endsection

@php
  $data  = $resume ? ($resume->data ?: []) : [];
  $about = $resume ? trim(strip_tags((string) $resume->summary)) : '';

  // Monogram stands in for a missing photo — an empty circle reads as a broken image.
  $bits     = preg_split('/\s+/', trim($name)) ?: [];
  $initials = mb_strtoupper(mb_substr($bits[0] ?? '', 0, 1) . (count($bits) > 1 ? mb_substr(end($bits), 0, 1) : ''));

  // Résumé JSON comes in two shapes: entered through the candidate dashboard
  // (role/org/years) or imported/seeded (title/company/period, with education and
  // certifications as plain strings). Reading only the first shape rendered those
  // profiles as a column of empty timeline dots, so accept both and drop anything
  // that normalises to nothing.
  $pick = function (array $row, array $keys) {
      foreach ($keys as $k) {
          if (trim((string) ($row[$k] ?? '')) !== '') return trim((string) $row[$k]);
      }
      return '';
  };
  $entries = function ($list, array $titleKeys, array $orgKeys, array $whenKeys) use ($pick) {
      $out = [];
      foreach ((array) $list as $row) {
          if (is_string($row) || is_numeric($row)) {
              $row = trim((string) $row);
              if ($row !== '') $out[] = ['title' => $row, 'org' => '', 'when' => '', 'note' => null];
              continue;
          }
          if (! is_array($row)) continue;
          $e = [
              'title' => $pick($row, $titleKeys),
              'org'   => $pick($row, $orgKeys),
              'when'  => $pick($row, $whenKeys),
              'note'  => $row['note'] ?? $row['description'] ?? null,
          ];
          if ($e['title'] !== '' || $e['org'] !== '') $out[] = $e;
      }
      return $out;
  };

  $experience = $entries($data['experience'] ?? [], ['role', 'title', 'position'], ['org', 'company', 'employer'], ['years', 'period', 'dates']);
  $education  = $entries($data['education'] ?? [], ['degree', 'qualification', 'title'], ['school', 'institution', 'university'], ['years', 'period', 'dates']);
  $certs      = $entries($data['certifications'] ?? [], ['name', 'title'], [], ['year', 'years', 'date']);

  $skills = array_values(array_filter(array_map(
      fn ($s) => trim(is_array($s) ? ($s['name'] ?? $s['title'] ?? '') : (string) $s),
      $data['skills'] ?? []
  ), fn ($s) => $s !== ''));

  $hasAside = $skills || $certs;
@endphp

@section('content')
<div class="card cv">

  <header class="cv-head">
    @if($user->avatar_url)
      <img class="cv-avatar" src="{{ $user->avatar_url }}" alt="{{ $name }}">
    @else
      <div class="cv-mono" aria-hidden="true">{{ $initials }}</div>
    @endif
    <div class="cv-id">
      <h1 class="cv-name">{{ $name }}</h1>
      @if($headline)<p class="cv-role">{{ $headline }}</p>@endif
      <span class="cv-verified">&#10003; Verified profile on Krama</span>
    </div>
  </header>

  {{-- No style="" attributes anywhere on this page: style-src is nonce-only, and a nonce
       cannot authorise an inline attribute — it would simply be dropped. --}}
  <div class="cv-body{{ $hasAside ? '' : ' cv-body-solo' }}">
    <div class="cv-main">

      @if($about !== '')
        <h2>About</h2>
        <div class="content">{!! $resume->summary !!}</div>
      @endif

      @if($experience)
        <h2>Work experience</h2>
        <div class="tl">
          @foreach($experience as $e)
            <div class="tl-item">
              <div class="tl-title">{{ $e['title'] }}@if($e['org'] !== '') <span class="tl-org">· {{ $e['org'] }}</span>@endif</div>
              @if($e['when'] !== '')<div class="tl-years">{{ $e['when'] }}</div>@endif
              @if(!empty($e['note']))<div class="tl-note content">{!! $e['note'] !!}</div>@endif
            </div>
          @endforeach
        </div>
      @endif

      @if($education)
        <h2>Education</h2>
        <div class="tl">
          @foreach($education as $ed)
            <div class="tl-item">
              <div class="tl-title">{{ $ed['title'] }}@if($ed['org'] !== '') <span class="tl-org">· {{ $ed['org'] }}</span>@endif</div>
              @if($ed['when'] !== '')<div class="tl-years">{{ $ed['when'] }}</div>@endif
            </div>
          @endforeach
        </div>
      @endif

      @if($about === '' && ! $experience && ! $education)
        <p class="cv-empty">This profile has no published experience yet.</p>
      @endif

      @if($resume && $resume->file_url && ($user->cv_visibility ?? '') === 'public')
        <a class="cta" href="{{ $resume->file_url }}">Download CV</a>
      @endif
    </div>

    @if($hasAside)
      <aside class="cv-aside">
        @if($skills)
          <h2>Skills</h2>
          <div class="chips">
            @foreach($skills as $s)<span class="chip">{{ $s }}</span>@endforeach
          </div>
        @endif

        @if($certs)
          <h2>Certifications</h2>
          @foreach($certs as $c)
            <div class="cert">{{ $c['title'] }}@if($c['when'] !== '') <span class="cert-year">· {{ $c['when'] }}</span>@endif</div>
          @endforeach
        @endif
      </aside>
    @endif
  </div>

  <div class="cv-foot">This is {{ $name }}'s verified profile on <a href="{{ url('/') }}">Krama</a>.</div>
</div>
@endsection
