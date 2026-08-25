<!doctype html>
<html>
<head>
<meta charset="utf-8">
<style>
  * { box-sizing:border-box; }
  body { font-family:'dejavusans',sans-serif; color:#374151; font-size:10.5pt; line-height:1.55; margin:0; }
  table.layout { width:100%; border-collapse:collapse; }
  td.side { width:35%; background-color:#0B6557; color:#fff; padding:30px 22px; vertical-align:top; }
  td.main { width:65%; background-color:#ffffff; padding:34px 30px; vertical-align:top; }

  /* Sidebar */
  .mono { width:74px; height:74px; border-radius:37px; background-color:rgba(255,255,255,.16);
    color:#fff; font-weight:700; font-size:26pt; text-align:center; line-height:74px; margin:0 auto 16px; }
  .s-h2 { font-size:9.5pt; font-weight:700; text-transform:uppercase; letter-spacing:1.2px;
    color:#CFF3EA; margin:20px 0 8px; padding-bottom:4px; border-bottom:1px solid rgba(255,255,255,.25); }
  .s-h2:first-of-type { margin-top:6px; }
  .s-contact { font-size:9pt; color:#EAFBF6; word-wrap:break-word; margin-bottom:5px; }
  .s-skill { font-size:9.5pt; color:#fff; margin-bottom:5px; }
  .s-cert { font-size:9pt; color:#EAFBF6; margin-bottom:7px; }
  .s-cert-when { color:#Bfe9dd; }

  /* Main */
  .name { font-size:24pt; font-weight:700; color:#0B6557; margin:0; letter-spacing:-.3px; }
  .role { font-size:12.5pt; color:#4b5563; margin:4px 0 0; font-weight:600; }
  .m-h2 { font-size:10pt; font-weight:700; color:#0B6557; text-transform:uppercase; letter-spacing:1px;
    margin:22px 0 10px; }
  .m-h2:first-of-type { margin-top:20px; }
  .rule { height:2px; background-color:#D0F5EA; margin:-6px 0 12px; }
  .about { color:#374151; }
  .item { margin-bottom:13px; }
  .item-title { font-weight:700; color:#111827; }
  .item-org { color:#0B6557; font-weight:600; }
  .item-when { color:#6b7280; font-size:9pt; margin-top:1px; }
  .item-note { color:#4b5563; font-size:9.5pt; margin-top:3px; }
  .foot { margin-top:24px; padding-top:12px; border-top:1px solid #e5e7eb; color:#9ca3af; font-size:8.5pt; }
  .empty { color:#9ca3af; font-style:italic; }
</style>
</head>
<body>
<table class="layout"><tr>
  <td class="side">
    <div class="mono">{{ $initials }}</div>

    <div class="s-h2">Contact</div>
    @if($email)<div class="s-contact">{{ $email }}</div>@endif
    @if($phone)<div class="s-contact">{{ $phone }}</div>@endif

    @if(count($skills))
      <div class="s-h2">Skills</div>
      @foreach($skills as $s)<div class="s-skill">{{ $s }}</div>@endforeach
    @endif

    @if(count($languages))
      <div class="s-h2">Languages</div>
      @foreach($languages as $l)<div class="s-skill">{{ $l }}</div>@endforeach
    @endif

    @if(count($certs))
      <div class="s-h2">Certifications</div>
      @foreach($certs as $c)<div class="s-cert">{{ $c['title'] }}@if($c['when'] !== '') <span class="s-cert-when">· {{ $c['when'] }}</span>@endif</div>@endforeach
    @endif
  </td>

  <td class="main">
    <p class="name">{{ $name }}</p>
    @if($headline)<p class="role">{{ $headline }}</p>@endif

    @if($about !== '')
      <div class="m-h2">Profile</div><div class="rule"></div>
      <div class="about">{{ $about }}</div>
    @endif

    @if(count($experience))
      <div class="m-h2">Experience</div><div class="rule"></div>
      @foreach($experience as $e)
        <div class="item">
          <div class="item-title">{{ $e['title'] }}@if($e['org'] !== '') <span class="item-org">· {{ $e['org'] }}</span>@endif</div>
          @if($e['when'] !== '')<div class="item-when">{{ $e['when'] }}</div>@endif
          @if($e['note'])<div class="item-note">{{ $e['note'] }}</div>@endif
        </div>
      @endforeach
    @endif

    @if(count($education))
      <div class="m-h2">Education</div><div class="rule"></div>
      @foreach($education as $ed)
        <div class="item">
          <div class="item-title">{{ $ed['title'] }}@if($ed['org'] !== '') <span class="item-org">· {{ $ed['org'] }}</span>@endif</div>
          @if($ed['when'] !== '')<div class="item-when">{{ $ed['when'] }}</div>@endif
        </div>
      @endforeach
    @endif

    @if($about === '' && !count($experience) && !count($education))
      <p class="empty">This résumé has no experience or education added yet.</p>
    @endif

    <div class="foot">Generated on Krama · kramajob.com · {{ $generated }}</div>
  </td>
</tr></table>
</body>
</html>
