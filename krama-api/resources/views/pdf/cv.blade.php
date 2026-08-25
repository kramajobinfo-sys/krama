<!doctype html>
<html>
<head>
<meta charset="utf-8">
<style>
  * { box-sizing:border-box; }
  body { font-family:'dejavusans',sans-serif; color:#374151; font-size:10.5pt; line-height:1.5; margin:0; }
  .page { padding:0; }

  /* Header band */
  .hdr { background:#0C7E6B; color:#fff; padding:26px 40px; }
  .hdr-row { display:table; width:100%; }
  .mono { display:table-cell; width:64px; vertical-align:middle; }
  .mono-c { width:56px; height:56px; border-radius:28px; background:rgba(255,255,255,.18);
    color:#fff; font-weight:700; font-size:20pt; text-align:center; line-height:56px; }
  .hdr-main { display:table-cell; vertical-align:middle; padding-left:16px; }
  .hdr-name { font-size:22pt; font-weight:700; margin:0; letter-spacing:-.3px; }
  .hdr-role { font-size:12pt; margin:3px 0 0; color:rgba(255,255,255,.92); font-weight:600; }
  .hdr-contact { margin:10px 0 0; font-size:9.5pt; color:rgba(255,255,255,.90); }
  .hdr-contact span { margin-right:16px; }

  /* Body: two columns via a table (mPDF-friendly) */
  .body { padding:24px 40px 40px; }
  .cols { display:table; width:100%; }
  .main { display:table-cell; width:64%; vertical-align:top; padding-right:26px; }
  .side { display:table-cell; width:36%; vertical-align:top; border-left:1px solid #e5e7eb; padding-left:22px; }

  h2 { font-size:10pt; font-weight:700; color:#0C7E6B; text-transform:uppercase; letter-spacing:1px;
    margin:0 0 10px; padding-bottom:5px; border-bottom:2px solid #ECFBF6; }
  .sec { margin-bottom:20px; }
  .sec:last-child { margin-bottom:0; }

  .item { margin-bottom:13px; }
  .item-title { font-weight:700; color:#111827; font-size:10.5pt; }
  .item-org { color:#0C7E6B; font-weight:600; }
  .item-when { color:#6b7280; font-size:9pt; margin-top:1px; }
  .item-note { color:#4b5563; font-size:9.5pt; margin-top:3px; }

  .about { color:#374151; font-size:10.5pt; }

  .chip { display:inline-block; background:#ECFBF6; color:#0B6557; border:1px solid #D0F5EA;
    border-radius:5px; padding:3px 9px; font-size:9pt; font-weight:600; margin:0 5px 6px 0; }
  .lang { font-size:10pt; color:#374151; margin-bottom:5px; }
  .cert { font-size:9.5pt; margin-bottom:8px; }
  .cert-title { font-weight:600; color:#111827; }
  .cert-when { color:#6b7280; }

  .foot { margin-top:22px; padding-top:12px; border-top:1px solid #e5e7eb; color:#9ca3af; font-size:8.5pt; text-align:center; }
  .empty { color:#9ca3af; font-style:italic; }
</style>
</head>
<body>
<div class="page">
  <div class="hdr">
    <div class="hdr-row">
      <div class="mono"><div class="mono-c">{{ $initials }}</div></div>
      <div class="hdr-main">
        <p class="hdr-name">{{ $name }}</p>
        @if($headline)<p class="hdr-role">{{ $headline }}</p>@endif
        <div class="hdr-contact">
          @if($email)<span>{{ $email }}</span>@endif
          @if($phone)<span>{{ $phone }}</span>@endif
        </div>
      </div>
    </div>
  </div>

  <div class="body">
    <div class="cols">
      <div class="main">
        @if($about !== '')
          <div class="sec"><h2>Summary</h2><div class="about">{{ $about }}</div></div>
        @endif

        @if(count($experience))
          <div class="sec">
            <h2>Work experience</h2>
            @foreach($experience as $e)
              <div class="item">
                <div class="item-title">{{ $e['title'] }}@if($e['org'] !== '') <span class="item-org">· {{ $e['org'] }}</span>@endif</div>
                @if($e['when'] !== '')<div class="item-when">{{ $e['when'] }}</div>@endif
                @if($e['note'])<div class="item-note">{{ $e['note'] }}</div>@endif
              </div>
            @endforeach
          </div>
        @endif

        @if(count($education))
          <div class="sec">
            <h2>Education</h2>
            @foreach($education as $ed)
              <div class="item">
                <div class="item-title">{{ $ed['title'] }}@if($ed['org'] !== '') <span class="item-org">· {{ $ed['org'] }}</span>@endif</div>
                @if($ed['when'] !== '')<div class="item-when">{{ $ed['when'] }}</div>@endif
              </div>
            @endforeach
          </div>
        @endif

        @if($about === '' && !count($experience) && !count($education))
          <p class="empty">This résumé has no experience or education added yet.</p>
        @endif
      </div>

      <div class="side">
        @if(count($skills))
          <div class="sec"><h2>Skills</h2>@foreach($skills as $s)<span class="chip">{{ $s }}</span>@endforeach</div>
        @endif
        @if(count($languages))
          <div class="sec"><h2>Languages</h2>@foreach($languages as $l)<div class="lang">{{ $l }}</div>@endforeach</div>
        @endif
        @if(count($certs))
          <div class="sec"><h2>Certifications</h2>@foreach($certs as $c)<div class="cert"><span class="cert-title">{{ $c['title'] }}</span>@if($c['when'] !== '') <span class="cert-when">· {{ $c['when'] }}</span>@endif</div>@endforeach</div>
        @endif
      </div>
    </div>

    <div class="foot">Generated on Krama · kramajob.com · {{ $generated }}</div>
  </div>
</div>
</body>
</html>
