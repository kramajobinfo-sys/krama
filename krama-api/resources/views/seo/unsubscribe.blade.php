@extends('seo.layout')

@section('title', 'Unsubscribed — ' . ($brandName ?? 'Krama'))
@section('robots', 'noindex, nofollow')

@section('content')
<article class="card" style="text-align:center">
  @if($ok)
    <h1>You're unsubscribed</h1>
    <p class="meta">You won't receive marketing emails from {{ $brandName ?? 'Krama' }} anymore.</p>
    <p class="content" style="margin-top:14px">You'll still get important account emails — job alerts you set up, application updates, and security notices.</p>
  @else
    <h1>Link expired</h1>
    <p class="meta">This unsubscribe link is invalid or has expired. You can manage email preferences from your account.</p>
  @endif
  <a class="cta" href="{{ url('/') }}">Back to {{ $brandName ?? 'Krama' }}</a>
</article>
@endsection
