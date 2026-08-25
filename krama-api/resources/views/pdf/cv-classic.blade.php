<!doctype html>
<html>
<head>
<meta charset="utf-8">
<style>
  * { box-sizing:border-box; }
  body { font-family:'dejavusans',sans-serif; color:#1a1a1a; font-size:10.5pt; line-height:1.5; margin:0; }
  .page { padding:40px 48px; }

  .hdr { text-align:center; border-bottom:2px solid #1a1a1a; padding-bottom:14px; margin-bottom:6px; }
  .name { font-family:'dejavuserif',serif; font-size:23pt; font-weight:700; letter-spacing:1px; margin:0; color:#111; }
  .role { font-size:12pt; color:#444; margin:5px 0 0; font-style:italic; }
  .contact { font-size:9.5pt; color:#333; margin:9px 0 0; }
  .contact span { margin:0 8px; }

  h2 { font-family:'dejavuserif',serif; font-size:11pt; font-weight:700; color:#111; text-transform:uppercase;
    letter-spacing:1.5px; margin:20px 0 9px; padding-bottom:3px; border-bottom:1px solid #bbb; }
  .sec:first-of-type h2 { margin-top:18px; }

  .about { color:#222; text-align:justify; }

  .item { margin-bottom:11px; }
  .item-head { }
  .item-title { font-weight:700; color:#111; }
  .item-org { font-weight:400; color:#333; }
  .item-when { float:right; color:#555; font-size:9.5pt; font-style:italic; }
  .item-note { color:#333; font-size:9.5pt; margin-top:2px; }
  .clear { clear:both; }

  .inline { color:#222; }
  .cert { margin-bottom:5px; }
  .cert-when { color:#555; font-style:italic; }

  .foot { margin-top:26px; padding-top:10px; border-top:1px solid #ccc; color:#888; font-size:8.5pt; text-align:center; }
  .empty { color:#888; font-style:italic; }
</style>
</head>
<body>
<div class="page">
  <div class="hdr">
    <p class="name">{{ $name }}</p>
    @if($headline)<p class="role">{{ $headline }}</p>@endif
    <div class="contact">
      @if($email)<span>{{ $email }}</span>@endif
      @if($email && $phone)·@endif
      @if($phone)<span>{{ $phone }}</span>@endif
    </div>
  </div>

  @if($about !== '')
    <div class="sec"><h2>Professional Summary</h2><div class="about">{{ $about }}</div></div>
  @endif

  @if(count($experience))
    <div class="sec">
      <h2>Work Experience</h2>
      @foreach($experience as $e)
        <div class="item">
          @if($e['when'] !== '')<span class="item-when">{{ $e['when'] }}</span>@endif
          <div class="item-title">{{ $e['title'] }}@if($e['org'] !== '')<span class="item-org">, {{ $e['org'] }}</span>@endif</div>
          @if($e['note'])<div class="item-note">{{ $e['note'] }}</div>@endif
          <div class="clear"></div>
        </div>
      @endforeach
    </div>
  @endif

  @if(count($education))
    <div class="sec">
      <h2>Education</h2>
      @foreach($education as $ed)
        <div class="item">
          @if($ed['when'] !== '')<span class="item-when">{{ $ed['when'] }}</span>@endif
          <div class="item-title">{{ $ed['title'] }}@if($ed['org'] !== '')<span class="item-org">, {{ $ed['org'] }}</span>@endif</div>
          <div class="clear"></div>
        </div>
      @endforeach
    </div>
  @endif

  @if(count($skills))
    <div class="sec"><h2>Skills</h2><div class="inline">{{ implode('  ·  ', $skills) }}</div></div>
  @endif

  @if(count($languages))
    <div class="sec"><h2>Languages</h2><div class="inline">{{ implode('  ·  ', $languages) }}</div></div>
  @endif

  @if(count($certs))
    <div class="sec">
      <h2>Certifications</h2>
      @foreach($certs as $c)
        <div class="cert">{{ $c['title'] }}@if($c['when'] !== '') <span class="cert-when">({{ $c['when'] }})</span>@endif</div>
      @endforeach
    </div>
  @endif

  @if($about === '' && !count($experience) && !count($education))
    <p class="empty">This résumé has no experience or education added yet.</p>
  @endif

  <div class="foot">Generated on Krama · kramajob.com · {{ $generated }}</div>
</div>
</body>
</html>
