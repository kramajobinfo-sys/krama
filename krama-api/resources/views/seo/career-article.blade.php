@extends('seo.layout')

@section('title', $article->title . ' — ' . ($brandName ?? 'Krama'))
@section('robots', $robots)
@section('og_type', 'article')

@push('head')
  <meta property="og:image" content="{{ $ogImage }}">
  <meta name="twitter:image" content="{{ $ogImage }}">
  @if($article->published_at)<meta property="article:published_time" content="{{ $article->published_at->toIso8601String() }}">@endif
@endpush

@section('page_css')
  .art-back { display:inline-block; margin-bottom:14px; font-size:14px; font-weight:600; text-decoration:none; }
  article.card h1 { font-size:30px; margin:10px 0 8px; }
  .art-byline { color:var(--muted); font-size:14px; margin:0 0 4px; }
  .art-cover { width:100%; height:auto; border-radius:12px; margin:20px 0 8px; display:block; }
  .article-body { font-size:16px; line-height:1.75; color:var(--body); margin-top:18px; }
  .article-body h2 { text-transform:none; letter-spacing:0; font-size:22px; margin:30px 0 10px; }
  .article-body h3 { font-family:var(--display); font-size:18px; margin:22px 0 8px; color:var(--ink); font-weight:700; }
  .article-body p { margin:0 0 16px; }
  .article-body ul, .article-body ol { padding-left:22px; margin:0 0 16px; }
  .article-body li { margin:6px 0; }
  .article-body a { color:var(--teal); }
  .article-body img { max-width:100%; height:auto; border-radius:10px; margin:12px 0; }
  .article-body blockquote { margin:18px 0; padding:10px 18px; border-left:3px solid var(--teal-100); color:var(--muted); font-style:italic; }
  .article-body strong { color:var(--ink); }
@endsection

@section('content')
  <a class="art-back" href="{{ url('/career') }}">← Career advice</a>
  <article class="card">
    @if($article->category)<span class="chip">{{ $article->category }}</span>@endif
    <h1>{{ $article->title }}</h1>
    <p class="art-byline">By {{ $article->author_name ?: 'Krama Team' }} @if($article->published_at) · {{ $article->published_at->format('M j, Y') }} @endif</p>
    @php
      $cover = $article->cover_image
        ? (\Illuminate\Support\Str::startsWith($article->cover_image, 'http') ? $article->cover_image : url(ltrim($article->cover_image, '/')))
        : null;
    @endphp
    @if($cover)<img class="art-cover" src="{{ $cover }}" alt="{{ $article->title }}">@endif
    {{-- Body is sanitized on write (HtmlSanitizer::clean) — safe to render as raw HTML. --}}
    <div class="content article-body">{!! $article->body !!}</div>
  </article>

  @if($related->isNotEmpty())
    <h2>Related reading</h2>
    <ul class="joblist">
      @foreach($related as $r)
        <li><a href="{{ url('/career/' . $r->slug) }}">{{ $r->title }}</a></li>
      @endforeach
    </ul>
  @endif

  <a class="cta" href="{{ url('/?page=jobs') }}">Browse jobs on {{ $brandName ?? 'Krama' }}</a>
@endsection
