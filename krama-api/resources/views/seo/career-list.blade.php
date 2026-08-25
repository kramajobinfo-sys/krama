@extends('seo.layout')

@section('title', 'Career Advice — ' . ($brandName ?? 'Krama'))
@section('robots', $robots)

@section('page_css')
  .art-hero h1 { margin-bottom:8px; }
  .art-grid { display:grid; grid-template-columns:repeat(2, 1fr); gap:18px; margin-top:24px; }
  .art-card { display:flex; flex-direction:column; background:#fff; border:1px solid var(--line); border-radius:16px;
    overflow:hidden; text-decoration:none; box-shadow:0 1px 2px rgba(16,24,40,.04); transition:box-shadow .15s, transform .15s; }
  .art-card:hover { box-shadow:0 10px 28px -14px rgba(16,24,40,.22); transform:translateY(-2px); }
  .art-thumb { height:150px; background:var(--teal-50) center/cover no-repeat; border-bottom:1px solid var(--line-soft); }
  .art-body { padding:18px 20px 20px; display:flex; flex-direction:column; gap:8px; flex:1; }
  .art-body h3 { font-family:var(--display); font-size:18px; line-height:1.3; color:var(--ink); margin:2px 0; font-weight:700; }
  .art-body p { font-size:14px; color:var(--muted); margin:0; flex:1; }
  .art-date { font-size:12.5px; color:var(--faint); font-weight:600; }
  .art-empty { text-align:center; padding:44px 24px; }
  .art-empty h2 { text-transform:none; letter-spacing:0; font-size:20px; margin:0 0 6px; }
  @media (max-width:640px) { .art-grid { grid-template-columns:1fr; } }
@endsection

@section('content')
  <div class="card art-hero">
    <h1>Career advice</h1>
    <p class="meta">CV &amp; résumé tips, interview prep, and job-search guidance for Cambodia — from the Krama team.</p>
  </div>

  @if($articles->isEmpty())
    <div class="card mt-lg art-empty">
      <h2>New guides coming soon</h2>
      <p class="meta">We’re preparing practical advice to help you find and land the right job. Check back shortly.</p>
      <a class="cta" href="{{ url('/?page=jobs') }}">Browse jobs in the meantime</a>
    </div>
  @else
    <div class="art-grid">
      @foreach($articles as $a)
        @php
          $cover = $a->cover_image
            ? (\Illuminate\Support\Str::startsWith($a->cover_image, 'http') ? $a->cover_image : url(ltrim($a->cover_image, '/')))
            : null;
        @endphp
        <a class="art-card" href="{{ url('/career/' . $a->slug) }}">
          @if($cover)
            <div class="art-thumb" style="background-image:url('{{ $cover }}')"></div>
          @endif
          <div class="art-body">
            @if($a->category)<span class="chip" style="align-self:flex-start">{{ $a->category }}</span>@endif
            <h3>{{ $a->title }}</h3>
            <p>{{ \Illuminate\Support\Str::limit(trim(strip_tags($a->excerpt)), 120, '…') }}</p>
            <span class="art-date">{{ optional($a->published_at)->format('M j, Y') }}</span>
          </div>
        </a>
      @endforeach
    </div>
  @endif
@endsection
