@extends('seo.layout')

@section('title', $job->title . ($company ? ' at ' . $company->name : '') . ' — Krama')
@section('og_type', 'article')

@php
    $typeLabels = ['full_time'=>'Full-time','part_time'=>'Part-time','contract'=>'Contract','internship'=>'Internship','temporary'=>'Temporary'];
    $expLabels  = ['entry'=>'Entry level','junior'=>'Junior','mid'=>'Mid level','senior'=>'Senior','lead'=>'Lead','executive'=>'Executive','manager'=>'Manager'];
    $loc = optional($job->location)->name ?: ($job->is_remote ? 'Remote' : null);
    $sal = null;
    if ($job->salary_min || $job->salary_max) {
        $cur = $job->salary_currency ?: 'USD'; $per = $job->salary_period ?: 'month';
        $fmt = fn($n) => ($cur === 'USD' ? '$' : '') . number_format((float)$n) . ($cur !== 'USD' ? ' ' . $cur : '');
        $sal = $job->salary_min && $job->salary_max ? $fmt($job->salary_min) . ' – ' . $fmt($job->salary_max)
             : $fmt($job->salary_min ?: $job->salary_max);
        $sal .= ' / ' . $per;
    }
    $ogImg = url('/jobs/' . $job->slug . '/og.png');
@endphp

@push('head')
  <meta property="og:image" content="{{ $ogImg }}">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:image:type" content="image/png">
  <meta property="og:image:alt" content="{{ $job->title }}{{ $company ? ' at ' . $company->name : '' }}">
  <meta name="twitter:image" content="{{ $ogImg }}">
@endpush

@section('content')
<article class="card">
  <h1>{{ $job->title }}</h1>
  @if($company)
    <p class="meta">at <a href="{{ url('/companies/' . $company->id) }}">{{ $company->name }}</a>@if($company->is_verified) · Verified employer @endif</p>
  @endif

  <div class="chips">
    @if($loc)<span class="chip">📍 {{ $loc }}</span>@endif
    @if(isset($typeLabels[$job->job_type]))<span class="chip">{{ $typeLabels[$job->job_type] }}</span>@endif
    @if(isset($expLabels[$job->experience_level]))<span class="chip">{{ $expLabels[$job->experience_level] }}</span>@endif
    @if($sal)<span class="chip">{{ $sal }}</span>@endif
  </div>
  <p class="meta">Posted {{ optional($job->published_at ?? $job->created_at)->format('j M Y') }}@if($job->expires_at) · Apply by {{ $job->expires_at->format('j M Y') }}@endif</p>

  <a class="cta" href="{{ $applyUrl }}" rel="nofollow">Apply on Krama</a>

  @if($job->description)
    <h2>Job description</h2>
    <div class="content">{!! $job->description !!}</div>
  @endif
  @if($job->requirements)
    <h2>Requirements</h2>
    <div class="content">{!! $job->requirements !!}</div>
  @endif
  @if($job->benefits)
    <h2>Benefits</h2>
    <div class="content">{!! $job->benefits !!}</div>
  @endif
  @if($job->working_days || $job->working_time)
    <h2>Working schedule</h2>
    <p class="content">{{ trim(($job->working_days ?: '') . ($job->working_days && $job->working_time ? ' · ' : '') . ($job->working_time ?: '')) }}</p>
  @endif

  <a class="cta" href="{{ $applyUrl }}" rel="nofollow">Apply on Krama</a>
</article>
@endsection
