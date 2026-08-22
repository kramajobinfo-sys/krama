@extends('seo.layout')

@section('title', 'Delete your account — ' . ($brandName ?? 'Krama'))

@section('content')
<article class="card">
  <h1>Delete your account & data</h1>
  <p class="meta">This page explains how to delete your {{ $brandName ?? 'Krama' }} account and the personal data linked to it, on the website or in the Krama app.</p>

  <h2>Option 1 — Delete it yourself (candidates)</h2>
  <div class="content">
    <ol>
      <li>Sign in to {{ $brandName ?? 'Krama' }} (app or <a href="{{ url('/') }}">kramajob.com</a>).</li>
      <li>Go to <strong>Profile → Delete account</strong>.</li>
      <li>Confirm with your password. Your account and personal data are deleted immediately.</li>
    </ol>
  </div>

  <h2>Option 2 — Request deletion</h2>
  <div class="content">
    <p>Employers, or anyone who can't sign in, can request deletion by emailing
      <a href="mailto:{{ $support }}?subject=Delete%20my%20Krama%20account">{{ $support }}</a>
      from the address on your account. We complete verified requests within <strong>30 days</strong>.</p>
  </div>

  <h2>What gets deleted</h2>
  <div class="content">
    <ul>
      <li>Your name, email, phone number and profile photo</li>
      <li>Your résumé/CV and uploaded files</li>
      <li>Job alerts, saved jobs, followed companies, and push-notification subscriptions</li>
    </ul>
  </div>

  <h2>What may be retained</h2>
  <div class="content">
    <ul>
      <li>Records an employer already holds for a job you applied to, and messages you sent, are kept but no longer show your identity.</li>
      <li>Limited financial records (e.g. invoices for paid employer plans) may be retained where the law requires, then deleted.</li>
    </ul>
    <p>Questions? Contact <a href="mailto:{{ $support }}">{{ $support }}</a>. See also our <a href="{{ url('/privacy') }}">Privacy Policy</a>.</p>
  </div>
</article>
@endsection
