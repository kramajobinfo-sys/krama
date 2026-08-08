@extends('seo.layout')

@section('title', $company->name . ' — Jobs & company profile | Krama')

@php $ogImg = url('/companies/' . $company->id . '/og.png'); @endphp
@push('head')
  <meta property="og:image" content="{{ $ogImg }}">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:image:type" content="image/png">
  <meta property="og:image:alt" content="{{ $company->name }} — Jobs &amp; hiring on Krama">
  <meta name="twitter:image" content="{{ $ogImg }}">
@endpush

@section('content')
@php
  $orgLabels = ['ngo' => 'NGO', 'government' => 'Government', 'education' => 'Education', 'international' => 'International'];
  $orgLabel = ($company->org_status === 'verified' && isset($orgLabels[$company->org_type])) ? $orgLabels[$company->org_type] : null;
@endphp
<article class="card">
  <h1>{{ $company->name }}@if($company->is_verified) <span class="chip">Verified</span>@endif @if($orgLabel)<span class="chip-org chip-org-{{ $company->org_type }}">{{ $orgLabel }}</span>@endif</h1>
  <p class="meta">{{ $company->industry }}@if($company->industry && $company->address) · @endif{{ $company->address }}</p>
  @if($company->website)<p class="meta"><a href="{{ $company->website }}" rel="nofollow noopener" target="_blank">{{ preg_replace('#^https?://#', '', rtrim($company->website, '/')) }}</a></p>@endif

  @if($company->description)
    <h2>About</h2>
    <div class="content">{!! $company->description !!}</div>
  @endif

  <h2>Open jobs ({{ $jobs->count() }})</h2>
  @if($jobs->count())
    <ul class="joblist">
      @foreach($jobs as $j)
        <li>
          <a href="{{ url('/jobs/' . $j->slug) }}">{{ $j->title }}</a>
          <div class="meta">{{ optional($j->location)->name ?: ($j->is_remote ? 'Remote' : '') }}@if(optional($j->location)->name || $j->is_remote) · @endif Posted {{ optional($j->published_at ?? $j->created_at)->format('j M Y') }}</div>
        </li>
      @endforeach
    </ul>
  @else
    <p class="content">No open roles right now — check back soon.</p>
  @endif
</article>
@endsection
