@extends('seo.layout')

@section('title', $name . ' — CV | Krama')
@section('robots', 'noindex, nofollow')
@section('og_type', 'profile')

@push('head')
<style>
  .cv-head { display:flex; align-items:center; gap:18px; margin-bottom:8px; }
  .cv-photo { width:84px; height:84px; border-radius:14px; object-fit:cover; flex-shrink:0; border:1px solid var(--line); }
  .cv-headline { font-size:16px; color:#374151; margin-top:2px; }
  .entry { padding:10px 0; border-bottom:1px solid var(--line); }
  .entry:last-child { border-bottom:none; }
  .entry-title { font-weight:700; font-size:15px; }
  .cv-foot { margin-top:24px; padding-top:16px; border-top:1px solid var(--line); font-size:13px; }
</style>
@endpush

@php $data = $resume ? ($resume->data ?: []) : []; @endphp

@section('content')
<div class="card">
  <div class="cv-head">
    @if($user->avatar_url)
      <img class="cv-photo" src="{{ $user->avatar_url }}" alt="{{ $name }}">
    @endif
    <div>
      <h1>{{ $name }}</h1>
      @if($headline)<div class="cv-headline">{{ $headline }}</div>@endif
    </div>
  </div>

  @if($resume && trim(strip_tags($resume->summary)) !== '')
    <h2>About</h2>
    <div class="content">{!! $resume->summary !!}</div>
  @endif

  @if(!empty($data['experience']))
    <h2>Work experience</h2>
    @foreach($data['experience'] as $e)
      <div class="entry">
        <div class="entry-title">{{ $e['role'] ?? '' }}@if(!empty($e['org'])) &middot; {{ $e['org'] }}@endif</div>
        @if(!empty($e['years']))<div class="meta">{{ $e['years'] }}</div>@endif
        @if(!empty($e['note']))<div class="content">{!! $e['note'] !!}</div>@endif
      </div>
    @endforeach
  @endif

  @if(!empty($data['education']))
    <h2>Education</h2>
    @foreach($data['education'] as $ed)
      <div class="entry">
        <div class="entry-title">{{ $ed['degree'] ?? '' }}@if(!empty($ed['school'])) &middot; {{ $ed['school'] }}@endif</div>
        @if(!empty($ed['years']))<div class="meta">{{ $ed['years'] }}</div>@endif
      </div>
    @endforeach
  @endif

  @if(!empty($data['skills']))
    <h2>Skills</h2>
    <div class="chips">
      @foreach($data['skills'] as $s)<span class="chip">{{ is_array($s) ? ($s['name'] ?? '') : $s }}</span>@endforeach
    </div>
  @endif

  @if(!empty($data['certifications']))
    <h2>Certifications</h2>
    @foreach($data['certifications'] as $c)
      <div class="entry"><div class="entry-title">{{ $c['name'] ?? '' }}@if(!empty($c['year'])) &middot; {{ $c['year'] }}@endif</div></div>
    @endforeach
  @endif

  @if($resume && $resume->file_url && ($user->cv_visibility ?? '') === 'public')
    <a class="cta" href="{{ $resume->file_url }}">Download CV</a>
  @endif

  <div class="cv-foot meta">This is {{ $name }}'s verified profile on <a href="{{ url('/') }}">Krama</a>.</div>
</div>
@endsection
