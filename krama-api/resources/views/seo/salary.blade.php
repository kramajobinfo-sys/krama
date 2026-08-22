@extends('seo.layout')

@section('title', 'Cambodia Salary Guide ' . date('Y') . ' — Median Pay by Job & Level — Krama')
@section('robots', $robots ?? 'index, follow, max-image-preview:large')

@php
    $money = fn ($n) => '$' . number_format((int) $n);
    $o = $data['overall'];
    $ready = $data['sufficient'] ?? false;
@endphp

@section('page_css')
  .sg-hero { background:linear-gradient(180deg,#fff, var(--teal-50)); }
  .sg-stat-row { display:flex; flex-wrap:wrap; gap:14px; margin:18px 0 4px; }
  .sg-stat { flex:1 1 150px; background:#fff; border:1px solid var(--line); border-radius:14px; padding:16px 18px; }
  .sg-stat .n { font-family:var(--display); font-weight:800; font-size:26px; color:var(--teal-700); line-height:1.1; }
  .sg-stat .l { font-size:12.5px; color:var(--muted); margin-top:4px; text-transform:uppercase; letter-spacing:.05em; font-weight:600; }
  .sg-note { font-size:13px; color:var(--muted); margin-top:14px; }
  table.sg { width:100%; border-collapse:collapse; margin-top:8px; font-size:14.5px; }
  table.sg th, table.sg td { text-align:left; padding:12px 10px; border-bottom:1px solid var(--line); }
  table.sg th { font-size:11.5px; text-transform:uppercase; letter-spacing:.06em; color:var(--muted); font-weight:700; }
  table.sg td.num, table.sg th.num { text-align:right; font-variant-numeric:tabular-nums; white-space:nowrap; }
  table.sg td.name { font-weight:600; color:var(--ink); }
  table.sg td.med { font-weight:800; color:var(--teal-700); }
  table.sg tbody tr:hover { background:var(--teal-50); }
  .sg-bar-wrap { display:block; height:6px; background:var(--line-soft); border-radius:999px; margin-top:6px; overflow:hidden; }
  .sg-bar { display:block; height:100%; background:var(--teal); border-radius:999px; }
  .sg-methodology { font-size:13.5px; color:var(--body); }
  .sg-methodology li { margin:4px 0; }
@endsection

@section('content')

@unless($ready)
{{-- Not enough salary-bearing listings yet: show an honest "compiling" state, no numbers. --}}
<article class="card sg-hero">
  <h1>Cambodia Salary Guide</h1>
  <p class="meta">We're building a salary guide for Cambodia from <strong>real, live job listings</strong> on {{ $brandName ?? 'Krama' }} — median monthly pay by job category and experience level, straight from what employers are offering.</p>
  <p class="content" style="margin-top:14px">It goes live as soon as enough listings include pay details. In the meantime, browse the jobs hiring right now — many list their salary.</p>
  <a class="cta" href="{{ url('/?page=jobs') }}">Browse open jobs</a>
</article>
@else

<article class="card sg-hero">
  <h1>Cambodia Salary Guide {{ date('Y') }}</h1>
  <p class="meta">Median monthly pay by job category and experience level — from <strong>{{ number_format($data['total']) }}</strong> live job listings on {{ $brandName ?? 'Krama' }}, not surveys. Updated {{ $data['generated_at']->format('j M Y') }}.</p>

  <div class="sg-stat-row">
    <div class="sg-stat">
      <div class="n">{{ $money($o['median']) }}</div>
      <div class="l">Median · per month</div>
    </div>
    <div class="sg-stat">
      <div class="n">{{ $money($o['p25']) }} – {{ $money($o['p75']) }}</div>
      <div class="l">Typical range (middle 50%)</div>
    </div>
    <div class="sg-stat">
      <div class="n">{{ number_format($data['total']) }}</div>
      <div class="l">Listings analysed</div>
    </div>
  </div>
  <p class="sg-note">Figures are gross monthly pay in USD, normalised across currencies and pay periods. Median (not average) so a few outliers don't skew the number.</p>
  <a class="cta" href="{{ url('/?page=jobs') }}">Browse open jobs</a>
</article>

@if(count($data['by_category']))
<div class="card mt-lg">
  <h2>Salary by job category</h2>
  @php $catMax = max(array_map(fn ($r) => $r['median'], $data['by_category'])) ?: 1; @endphp
  <table class="sg">
    <thead>
      <tr>
        <th>Category</th>
        <th class="num">Listings</th>
        <th class="num">Typical range / mo</th>
        <th class="num">Median / mo</th>
      </tr>
    </thead>
    <tbody>
      @foreach($data['by_category'] as $r)
      <tr>
        <td class="name">
          {{ $r['name'] }}
          <span class="sg-bar-wrap"><span class="sg-bar" style="width: {{ max(6, (int) round($r['median'] / $catMax * 100)) }}%"></span></span>
        </td>
        <td class="num">{{ number_format($r['count']) }}</td>
        <td class="num">{{ $money($r['p25']) }} – {{ $money($r['p75']) }}</td>
        <td class="num med">{{ $money($r['median']) }}</td>
      </tr>
      @endforeach
    </tbody>
  </table>
</div>
@endif

@if(count($data['by_level']))
<div class="card mt-lg">
  <h2>Salary by experience level</h2>
  <table class="sg">
    <thead>
      <tr>
        <th>Experience level</th>
        <th class="num">Listings</th>
        <th class="num">Typical range / mo</th>
        <th class="num">Median / mo</th>
      </tr>
    </thead>
    <tbody>
      @foreach($data['by_level'] as $r)
      <tr>
        <td class="name">{{ $r['label'] }}</td>
        <td class="num">{{ number_format($r['count']) }}</td>
        <td class="num">{{ $money($r['p25']) }} – {{ $money($r['p75']) }}</td>
        <td class="num med">{{ $money($r['median']) }}</td>
      </tr>
      @endforeach
    </tbody>
  </table>
</div>
@endif

<div class="card mt-lg">
  <h2>How we calculate this</h2>
  <ul class="sg-methodology">
    <li>Every figure comes from a <strong>real, currently-published job</strong> on {{ $brandName ?? 'Krama' }} — updated as employers post new roles.</li>
    <li>We take the midpoint of each listing's advertised range and normalise it to <strong>gross USD per month</strong> (converting other currencies and pay periods).</li>
    <li>We report the <strong>median</strong> and the <strong>middle-50% range</strong> (25th–75th percentile), which resist outliers better than an average.</li>
    <li>A category or level appears only when it has at least a few listings, so a single posting can't define a "market rate".</li>
  </ul>
  <p class="meta">These figures are a guide, not a guarantee — actual pay depends on the specific role, company, and your experience.</p>
  <a class="cta" href="{{ url('/?page=jobs') }}">See jobs hiring now</a>
</div>

@endunless
@endsection
