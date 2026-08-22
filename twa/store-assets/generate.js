const { createCanvas, loadImage, GlobalFonts } = require('@napi-rs/canvas');
const fs = require('fs');
const path = require('path');

const OUT = '/Applications/XAMPP/xamppfiles/htdocs/Krama/twa/store-assets';
fs.mkdirSync(OUT, { recursive: true });
const ICON = '/Applications/XAMPP/xamppfiles/htdocs/Krama/krama/assets/icon-512.png';

// Palette
const TEAL = '#0C7E6B', TEAL7 = '#0B6557', TEAL_SUB = '#ECFBF6', TEAL_LINE = '#CFF0E7';
const INK = '#1C1B17', BODY = '#3f4a45', MUTED = '#7b8783', LINE = '#e7ebe9';
const CREAM = '#F6F5F1', WHITE = '#ffffff', GOLD = '#E0A63A';

const F = (s, w = '400') => `${w} ${s}px Arial, Helvetica, sans-serif`;

function rr(ctx, x, y, w, h, r) {
  r = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}
function shadow(ctx, blur, dy, a = 0.14) { ctx.shadowColor = `rgba(16,24,40,${a})`; ctx.shadowBlur = blur; ctx.shadowOffsetY = dy; }
function noShadow(ctx) { ctx.shadowColor = 'transparent'; ctx.shadowBlur = 0; ctx.shadowOffsetY = 0; }

// Drawn glyphs (the Arial fallback lacks ✓/✦, which render as tofu).
function drawCheck(ctx, cx, cy, s, color) {
  ctx.save(); ctx.strokeStyle = color; ctx.lineWidth = Math.max(2, s * 0.16); ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  ctx.beginPath(); ctx.moveTo(cx - s * 0.38, cy + s * 0.02); ctx.lineTo(cx - s * 0.08, cy + s * 0.3); ctx.lineTo(cx + s * 0.42, cy - s * 0.32); ctx.stroke(); ctx.restore();
}
function verifiedMark(ctx, cx, cy, r) {
  ctx.beginPath(); ctx.arc(cx, cy, r, 0, 7); ctx.fillStyle = TEAL; ctx.fill(); drawCheck(ctx, cx, cy, r * 1.15, '#fff');
}
function drawSpark(ctx, cx, cy, s, color) {
  ctx.save(); ctx.fillStyle = color; ctx.beginPath();
  ctx.moveTo(cx, cy - s); ctx.quadraticCurveTo(cx + s * 0.16, cy - s * 0.16, cx + s, cy);
  ctx.quadraticCurveTo(cx + s * 0.16, cy + s * 0.16, cx, cy + s);
  ctx.quadraticCurveTo(cx - s * 0.16, cy + s * 0.16, cx - s, cy);
  ctx.quadraticCurveTo(cx - s * 0.16, cy - s * 0.16, cx, cy - s);
  ctx.closePath(); ctx.fill(); ctx.restore();
}

// A small logo tile (rounded teal square with the icon) — falls back to a "K" if icon missing.
function logoTile(ctx, img, x, y, s, r) {
  ctx.save(); rr(ctx, x, y, s, s, r); ctx.clip();
  if (img) ctx.drawImage(img, x, y, s, s);
  else { ctx.fillStyle = TEAL; ctx.fillRect(x, y, s, s); }
  ctx.restore();
}

// generic verified check chip
function badge(ctx, x, y, text, bg, fg) {
  ctx.font = F(19, '700');
  const w = ctx.measureText(text).width + 34;
  rr(ctx, x, y, w, 30, 15); ctx.fillStyle = bg; ctx.fill();
  ctx.fillStyle = fg; ctx.textBaseline = 'middle'; ctx.fillText(text, x + 17, y + 16);
  return w;
}

function chip(ctx, x, y, text) {
  ctx.font = F(20, '600');
  const w = ctx.measureText(text).width + 30;
  rr(ctx, x, y, w, 36, 18); ctx.fillStyle = TEAL_SUB; ctx.fill();
  ctx.fillStyle = TEAL7; ctx.textBaseline = 'middle'; ctx.fillText(text, x + 15, y + 19);
  return w;
}

// ---------- FEATURE GRAPHIC 1024x500 ----------
async function featureGraphic(icon) {
  const W = 1024, H = 500;
  const c = createCanvas(W, H), ctx = c.getContext('2d');
  // teal gradient bg
  const g = ctx.createLinearGradient(0, 0, W, H);
  g.addColorStop(0, '#0E8C77'); g.addColorStop(1, '#0A5F52');
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  // subtle woven dots
  ctx.fillStyle = 'rgba(255,255,255,0.05)';
  for (let yy = 40; yy < H; yy += 46) for (let xx = 40; xx < W; xx += 46) { ctx.beginPath(); ctx.arc(xx, yy, 3, 0, 7); ctx.fill(); }

  // LEFT: wordmark + headline
  const LX = 70;
  logoTile(ctx, icon, LX, 66, 64, 16);
  ctx.fillStyle = WHITE; ctx.textBaseline = 'middle';
  ctx.font = F(40, '800'); ctx.fillText('KRAMA', LX + 84, 100);

  ctx.font = F(62, '800');
  ctx.fillText('Jobs & hiring', LX, 210);
  ctx.fillText('in Cambodia', LX, 280);
  ctx.font = F(30, '500'); ctx.fillStyle = 'rgba(255,255,255,0.92)';
  ctx.fillText('Find verified jobs. Apply in seconds.', LX, 350);

  // little store pills
  ctx.font = F(22, '700');
  let px = LX;
  ['Verified employers', 'Job alerts', 'AI matching'].forEach((tp) => {
    const w = ctx.measureText(tp).width + 36;
    rr(ctx, px, 398, w, 40, 20); ctx.fillStyle = 'rgba(255,255,255,0.15)'; ctx.fill();
    ctx.fillStyle = WHITE; ctx.textBaseline = 'middle'; ctx.fillText(tp, px + 18, 419);
    px += w + 14;
  });

  // RIGHT: a phone showing a mini job list
  const pw = 250, ph = 470, pxp = W - pw - 70, pyp = 78;
  ctx.save(); shadow(ctx, 40, 20, 0.3);
  rr(ctx, pxp, pyp, pw, ph, 34); ctx.fillStyle = CREAM; ctx.fill(); noShadow(ctx); ctx.restore();
  // screen clip
  ctx.save(); rr(ctx, pxp, pyp, pw, ph, 34); ctx.clip();
  // top bar
  ctx.fillStyle = WHITE; ctx.fillRect(pxp, pyp, pw, 70);
  logoTile(ctx, icon, pxp + 18, pyp + 20, 30, 8);
  ctx.fillStyle = INK; ctx.font = F(20, '800'); ctx.textBaseline = 'middle'; ctx.fillText('KRAMA', pxp + 56, pyp + 36);
  // search pill
  rr(ctx, pxp + 18, pyp + 84, pw - 36, 38, 19); ctx.fillStyle = WHITE; ctx.fill();
  ctx.fillStyle = MUTED; ctx.font = F(17, '500'); ctx.fillText('Search jobs…', pxp + 34, pyp + 104);
  // cards
  const colors = ['#0C7E6B', '#4338ca', '#E0A63A'];
  const names = ['ACLEDA Bank', 'Smart Axiata', 'Chip Mong'];
  const titles = ['Senior Accountant', 'Data Analyst', 'Site Engineer'];
  for (let i = 0; i < 3; i++) {
    const cy = pyp + 140 + i * 104;
    ctx.save(); shadow(ctx, 14, 6, 0.08); rr(ctx, pxp + 16, cy, pw - 32, 90, 16); ctx.fillStyle = WHITE; ctx.fill(); noShadow(ctx); ctx.restore();
    rr(ctx, pxp + 28, cy + 16, 34, 34, 9); ctx.fillStyle = colors[i]; ctx.fill();
    ctx.fillStyle = INK; ctx.font = F(17, '700'); ctx.textBaseline = 'alphabetic'; ctx.fillText(titles[i], pxp + 72, cy + 34);
    ctx.fillStyle = MUTED; ctx.font = F(14, '500'); ctx.fillText(names[i], pxp + 72, cy + 54);
    rr(ctx, pxp + 72, cy + 64, 66, 20, 10); ctx.fillStyle = TEAL_SUB; ctx.fill();
    ctx.fillStyle = TEAL7; ctx.font = F(12, '700'); ctx.fillText('Phnom Penh', pxp + 80, cy + 78);
  }
  ctx.restore();

  fs.writeFileSync(path.join(OUT, 'feature-graphic-1024x500.png'), c.toBuffer('image/png'));
  console.log('✓ feature-graphic-1024x500.png');
}

// ---------- SCREENSHOT TEMPLATE 1080x1920 ----------
function screenshot(name, bg, headlineColor, headline, sub, drawScreen, icon) {
  const W = 1080, H = 1920;
  const c = createCanvas(W, H), ctx = c.getContext('2d');
  ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H);

  // headline
  ctx.fillStyle = headlineColor; ctx.textBaseline = 'alphabetic'; ctx.textAlign = 'center';
  ctx.font = F(66, '800'); ctx.fillText(headline, W / 2, 190);
  ctx.font = F(34, '500'); ctx.globalAlpha = 0.85; ctx.fillText(sub, W / 2, 250); ctx.globalAlpha = 1;
  ctx.textAlign = 'left';

  // phone: rounded top, edge into bottom
  const pw = 840, px = (W - pw) / 2, py = 360, ph = H - py + 40, r = 54;
  ctx.save(); shadow(ctx, 60, 24, 0.22);
  rr(ctx, px, py, pw, ph, r); ctx.fillStyle = WHITE; ctx.fill(); noShadow(ctx); ctx.restore();
  ctx.save(); rr(ctx, px, py, pw, ph, r); ctx.clip();
  ctx.fillStyle = CREAM; ctx.fillRect(px, py, pw, ph);
  drawScreen(ctx, px, py, pw, ph, icon);
  ctx.restore();
  // subtle bezel
  ctx.lineWidth = 2; ctx.strokeStyle = 'rgba(0,0,0,0.06)'; rr(ctx, px, py, pw, ph, r); ctx.stroke();

  fs.writeFileSync(path.join(OUT, name), c.toBuffer('image/png'));
  console.log('✓ ' + name);
}

function appbar(ctx, x, y, w, icon, title) {
  ctx.fillStyle = WHITE; ctx.fillRect(x, y, w, 96);
  logoTile(ctx, icon, x + 32, y + 26, 44, 12);
  ctx.fillStyle = INK; ctx.font = F(30, '800'); ctx.textBaseline = 'middle'; ctx.fillText(title, x + 90, y + 50);
  ctx.strokeStyle = LINE; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(x, y + 96); ctx.lineTo(x + w, y + 96); ctx.stroke();
}
function jobCard(ctx, x, y, w, color, title, company, loc, salary, verified) {
  ctx.save(); shadow(ctx, 20, 8, 0.07); rr(ctx, x, y, w, 150, 22); ctx.fillStyle = WHITE; ctx.fill(); noShadow(ctx); ctx.restore();
  rr(ctx, x + 26, y + 26, 60, 60, 14); ctx.fillStyle = color; ctx.fill();
  ctx.fillStyle = INK; ctx.font = F(28, '700'); ctx.textBaseline = 'alphabetic'; ctx.fillText(title, x + 104, y + 52);
  ctx.fillStyle = MUTED; ctx.font = F(22, '500'); ctx.fillText(company, x + 104, y + 84);
  if (verified) { const cw = ctx.measureText(company).width; verifiedMark(ctx, x + 104 + cw + 26, y + 76, 13); }
  let cx = x + 104;
  ctx.textBaseline = 'middle';
  cx += chip(ctx, cx, y + 100, loc) + 10;
  if (salary) { ctx.font = F(22, '700'); const w2 = ctx.measureText(salary).width + 30; rr(ctx, cx, y + 100, w2, 36, 18); ctx.fillStyle = '#FBF3E0'; ctx.fill(); ctx.fillStyle = '#9A6B12'; ctx.textBaseline = 'middle'; ctx.fillText(salary, cx + 15, y + 118); }
  ctx.textBaseline = 'alphabetic';
}

// Screen A: job list
function screenJobs(ctx, x, y, w, h, icon) {
  appbar(ctx, x, y, w, icon, 'Find jobs');
  rr(ctx, x + 32, y + 120, w - 64, 60, 30); ctx.fillStyle = WHITE; ctx.fill();
  ctx.strokeStyle = LINE; ctx.lineWidth = 1; rr(ctx, x + 32, y + 120, w - 64, 60, 30); ctx.stroke();
  ctx.fillStyle = MUTED; ctx.font = F(24, '500'); ctx.textBaseline = 'middle'; ctx.fillText('Search jobs, companies…', x + 60, y + 151); ctx.textBaseline = 'alphabetic';
  const data = [
    ['#0C7E6B', 'Senior Accountant', 'ACLEDA Bank', 'Phnom Penh', '$800–1,200', true],
    ['#4338ca', 'Data Analyst', 'Smart Axiata', 'Phnom Penh', '$1,000–1,500', true],
    ['#E0A63A', 'Site Engineer', 'Chip Mong Group', 'Siem Reap', '$700–1,100', false],
    ['#0e7490', 'Marketing Officer', 'Wing Bank', 'Phnom Penh', '$600–900', true],
  ];
  let cy = y + 210;
  data.forEach((d) => { jobCard(ctx, x + 32, cy, w - 64, d[0], d[1], d[2], d[3], d[4], d[5]); cy += 172; });
}

// Screen B: job detail + apply
function screenApply(ctx, x, y, w, h, icon) {
  appbar(ctx, x, y, w, icon, 'Job details');
  let cy = y + 150;
  ctx.fillStyle = INK; ctx.font = F(46, '800'); ctx.fillText('Senior Accountant', x + 40, cy);
  cy += 54; ctx.fillStyle = BODY; ctx.font = F(28, '600'); ctx.fillText('ACLEDA Bank', x + 40, cy);
  const cw = ctx.measureText('ACLEDA Bank').width; verifiedMark(ctx, x + 40 + cw + 34, cy - 9, 14);
  ctx.fillStyle = TEAL7; ctx.font = F(24, '800'); ctx.fillText('Verified', x + 40 + cw + 54, cy);
  cy += 40; ctx.textBaseline = 'middle';
  let chx = x + 40;
  chx += chip(ctx, chx, cy, 'Phnom Penh') + 12;
  chx += chip(ctx, chx, cy, 'Full-time') + 12;
  chip(ctx, chx, cy, '$800–1,200/mo');
  ctx.textBaseline = 'alphabetic';
  cy += 84;
  ctx.fillStyle = INK; ctx.font = F(28, '700'); ctx.fillText('About the role', x + 40, cy);
  cy += 26; ctx.fillStyle = '#e4e8e6';
  for (let i = 0; i < 6; i++) { const lw = (i % 3 === 2) ? (w - 80) * 0.55 : w - 80; rr(ctx, x + 40, cy + i * 34, lw, 16, 8); ctx.fill(); }
  // sticky apply button
  const by = y + h - 150;
  ctx.fillStyle = WHITE; ctx.fillRect(x, by - 30, w, 180);
  ctx.strokeStyle = LINE; ctx.beginPath(); ctx.moveTo(x, by - 30); ctx.lineTo(x + w, by - 30); ctx.stroke();
  ctx.save(); shadow(ctx, 24, 10, 0.25); rr(ctx, x + 40, by, w - 80, 84, 42); ctx.fillStyle = TEAL; ctx.fill(); noShadow(ctx); ctx.restore();
  ctx.fillStyle = WHITE; ctx.font = F(32, '800'); ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('Apply on Krama', x + w / 2, by + 43); ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
}

// Screen C: alerts
function screenAlerts(ctx, x, y, w, h, icon) {
  appbar(ctx, x, y, w, icon, 'Job alerts');
  // notification toast
  let cy = y + 132;
  ctx.save(); shadow(ctx, 22, 8, 0.12); rr(ctx, x + 32, cy, w - 64, 120, 20); ctx.fillStyle = INK; ctx.fill(); noShadow(ctx); ctx.restore();
  logoTile(ctx, icon, x + 52, cy + 30, 56, 14);
  ctx.fillStyle = WHITE; ctx.font = F(25, '700'); ctx.fillText('New job matching your alert', x + 128, cy + 52);
  ctx.fillStyle = 'rgba(255,255,255,0.7)'; ctx.font = F(22, '500'); ctx.fillText('Senior Accountant — ACLEDA Bank', x + 128, cy + 84);
  cy += 168;
  // AI match card
  function toggleCard(cardY, title, desc, on) {
    ctx.save(); shadow(ctx, 18, 6, 0.07); rr(ctx, x + 32, cardY, w - 64, 150, 22); ctx.fillStyle = WHITE; ctx.fill(); noShadow(ctx); ctx.restore();
    if (on) { ctx.strokeStyle = TEAL; ctx.lineWidth = 2; rr(ctx, x + 32, cardY, w - 64, 150, 22); ctx.stroke(); }
    rr(ctx, x + 56, cardY + 30, 56, 56, 14); ctx.fillStyle = TEAL_SUB; ctx.fill();
    drawSpark(ctx, x + 84, cardY + 58, 16, TEAL7);
    ctx.fillStyle = INK; ctx.font = F(27, '700'); ctx.fillText(title, x + 130, cardY + 54);
    ctx.fillStyle = MUTED; ctx.font = F(21, '500'); ctx.fillText(desc, x + 130, cardY + 90);
    // toggle
    const tx = x + w - 64 - 78, ty = cardY + 44;
    rr(ctx, tx, ty, 78, 44, 22); ctx.fillStyle = on ? TEAL : '#cbd5d1'; ctx.fill();
    ctx.beginPath(); ctx.arc(on ? tx + 56 : tx + 22, ty + 22, 17, 0, 7); ctx.fillStyle = WHITE; ctx.fill();
  }
  toggleCard(cy, 'Match me by my profile (AI)', 'Get the roles that fit your résumé', true);
  cy += 172;
  toggleCard(cy, 'Push notifications', 'Alerts on this device, even when closed', true);
  cy += 172;
  toggleCard(cy, 'Email & Telegram alerts', 'New matching jobs, the moment they post', true);
}

// Screen D: application tracker
function screenTracker(ctx, x, y, w, h, icon) {
  appbar(ctx, x, y, w, icon, 'My applications');
  const steps = ['Applied', 'Reviewed', 'Shortlisted', 'Interview', 'Offered'];
  // stepper
  let sy = y + 170, sx = x + 60, gap = (w - 120) / (steps.length - 1);
  for (let i = 0; i < steps.length; i++) {
    const cxp = sx + gap * i, done = i <= 3;
    if (i < steps.length - 1) { ctx.strokeStyle = i < 3 ? TEAL : '#d7dedb'; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(cxp, sy); ctx.lineTo(cxp + gap, sy); ctx.stroke(); }
  }
  for (let i = 0; i < steps.length; i++) {
    const cxp = sx + gap * i, active = i === 3, done = i < 3;
    ctx.beginPath(); ctx.arc(cxp, sy, 22, 0, 7); ctx.fillStyle = (done || active) ? TEAL : '#d7dedb'; ctx.fill();
    if (active) { ctx.beginPath(); ctx.arc(cxp, sy, 30, 0, 7); ctx.strokeStyle = TEAL; ctx.lineWidth = 4; ctx.stroke(); }
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    if (done) { drawCheck(ctx, cxp, sy, 18, '#fff'); }
    else { ctx.fillStyle = active ? WHITE : '#8a938f'; ctx.font = F(20, '800'); ctx.fillText(String(i + 1), cxp, sy + 1); }
    ctx.fillStyle = (done || active) ? INK : MUTED; ctx.font = F(17, active ? '800' : '600'); ctx.fillText(steps[i], cxp, sy + 52);
    ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
  }
  // application rows
  let cy = y + 300;
  const rows = [
    ['#0C7E6B', 'Senior Accountant', 'ACLEDA Bank', 'Interview', '#FBF3E0', '#9A6B12'],
    ['#4338ca', 'Data Analyst', 'Smart Axiata', 'Shortlisted', TEAL_SUB, TEAL7],
    ['#E0A63A', 'Site Engineer', 'Chip Mong', 'Reviewed', '#eef2ff', '#4338ca'],
  ];
  rows.forEach((rw) => {
    ctx.save(); shadow(ctx, 18, 6, 0.07); rr(ctx, x + 32, cy, w - 64, 130, 22); ctx.fillStyle = WHITE; ctx.fill(); noShadow(ctx); ctx.restore();
    rr(ctx, x + 26 + 26, cy + 26, 56, 56, 14); ctx.fillStyle = rw[0]; ctx.fill();
    ctx.fillStyle = INK; ctx.font = F(27, '700'); ctx.fillText(rw[1], x + 130, cy + 52);
    ctx.fillStyle = MUTED; ctx.font = F(22, '500'); ctx.fillText(rw[2], x + 130, cy + 88);
    ctx.font = F(21, '700'); const bw = ctx.measureText(rw[3]).width + 30;
    rr(ctx, x + w - 64 - bw, cy + 48, bw, 36, 18); ctx.fillStyle = rw[4]; ctx.fill();
    ctx.fillStyle = rw[5]; ctx.textBaseline = 'middle'; ctx.fillText(rw[3], x + w - 64 - bw + 15, cy + 66); ctx.textBaseline = 'alphabetic';
    cy += 152;
  });
}

(async () => {
  let icon = null;
  try { icon = await loadImage(ICON); } catch (e) { console.log('icon load failed:', e.message); }

  await featureGraphic(icon);
  screenshot('screenshot-1-jobs.png', TEAL, WHITE, 'Thousands of verified jobs', 'Across every industry in Cambodia', screenJobs, icon);
  screenshot('screenshot-2-apply.png', CREAM, INK, 'Apply in seconds', 'One profile, every application', screenApply, icon);
  screenshot('screenshot-3-alerts.png', '#0B6557', WHITE, 'Alerts that reach you first', 'Email, Telegram, push & AI matching', screenAlerts, icon);
  screenshot('screenshot-4-tracker.png', '#123B34', WHITE, 'Track every application', 'From applied to offer', screenTracker, icon);

  console.log('\nAll assets written to', OUT);
})();
