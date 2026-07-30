# KRAMA — Go-Live Readiness Checklist

**Prepared:** 2026-07-30 · **Target launch:** tomorrow · **Scope:** `main` @ `33e9ca9` — the **Laravel 12** upgrade + all security hardening + the NBC exchange-rate feature (deploy target; **requires PHP 8.2+** on the host — confirmed available via cPanel PHP Selector).
**Method:** evidence-based. Every ✅ cites a file verified this pass. Anything not verifiable from code is marked **Verification required** (host/ops/live-credential facts — not code).

---

## VERDICT: 🟡 CONDITIONAL GO — no code blockers remain; 3 production-config items must be done + verified on the server first.

All Critical and High findings from the earlier `audit/` are now **fixed in code** (verified below). The remaining launch gates are **deploy-time configuration** on the production host (env, cron, queue) plus live-integration verification — none are code defects.

---

## A. Security & functional Critical/High — ✅ FIXED (code-verified this pass)

| ID | Issue | Status | Evidence |
|---|---|---|---|
| C-S1 | Stored XSS via unsanitized rich text | ✅ Fixed | `app/Support/HtmlSanitizer.php` (HTMLPurifier, deny-by-default allowlist, blocks script/svg/handlers/js: URLs) applied on write in `JobController.php:134,190,266`, `CompanyController.php:102,152`, `ResumeController.php:84,89` |
| C-4 | Public job search capped ~50 | ✅ Fixed | `public-website/api.js:206` `getAllPages()` loops all pages (`last_page`) |
| H-2 | `adminCreateUser` privilege escalation | ✅ Fixed | `UserController.php:100-107` — creating super_admin/admin requires `manage_roles` |
| H-S2 | Stripe webhook payment bypass/replay | ✅ Fixed | `PaymentController.php:564` → `PaymentService::stripeSessionMatchesPayment()` binds `paid`+`client_reference_id`+`currency`+`amount_total` (`PaymentService.php:338-361`); rejections audit-logged |
| H-3 | Employer logged out hourly (bad refresh) | ✅ Fixed | `employer-dashboard/api.js:23` body-based `refresh_token` + stored refresh key |
| H-6 | Paid (pending) subscription hides live jobs | ✅ Fixed | `JobController.php:32-38` public query includes `'pending'` subs |
| M-7 | Email change didn't reset verified state | ✅ Fixed | `AuthController.php:258-264` nulls `email_verified_at` + re-dispatches verification |

**Baseline controls verified good (do not regress):** JWT auth (`config/jwt.php`, guard `api`); custom `CheckPermission` authz; auth rate-limiting `throttle:auth` 5/min (`routes/api.php`); security headers + CSP on API + `ForceHttps` (`SecurityHeaders.php`); CORS = env allowlist, `supports_credentials:false` (`config/cors.php`); CV files on private `local` disk with ownership + `cv_visibility` checks; payments idempotent + server-side re-verified; no committed secrets (`.env.example` has empty `APP_KEY`/`JWT_SECRET`); no SQLi / mass-assignment.

---

## B. ❌ BLOCKING LAUNCH — production host configuration (must complete + verify before go-live)

### B1. Production `.env` hardening — ❌ Verification required
- **Root cause:** dev `.env` ships `APP_ENV=local`, `APP_DEBUG=true`; the `.env.hosting.template` carries a concrete `JWT_SECRET`/`APP_KEY` shared across environments (audit H-4). `APP_DEBUG=true` leaks stack traces/secrets in errors; a known/shared `JWT_SECRET` allows **forging any user's token** → full auth bypass.
- **File(s):** production server `krama-api/.env` (host-side; not in repo).
- **Exact fix (on server):** `APP_ENV=production`, `APP_DEBUG=false`, `LOG_LEVEL=warning`; run `php artisan key:generate` and `php artisan jwt:secret` to mint **unique** secrets; set `CORS_ALLOWED_ORIGINS=https://<your-domain>` and `FRONTEND_URL=https://<your-domain>`; real DB creds.
- **Priority:** P0 · **Effort:** ~15 min.

### B2. Scheduler not triggered in prod — ❌ Verification required
- **Root cause:** payment reconciliation + expiries run via `schedule:run` (`app/Console/Kernel.php` — 7 jobs incl. `payments:verify-pending` every 3 min). Without an OS cron they **never run** → a customer whose gateway callback is lost is **charged but never fulfilled**; subscriptions/boosts never expire.
- **File(s):** server crontab (host-side).
- **Exact fix:** add `* * * * * cd /path/to/krama-api && php artisan schedule:run >> /dev/null 2>&1`. Verify: create a pending payment, confirm it flips within ~3 min.
- **Priority:** P0 (money) · **Effort:** ~10 min.

### B3. Queue worker / email delivery — ❌ Verification required
- **Root cause:** `SendEmailVerificationJob` is `ShouldQueue`; if `QUEUE_CONNECTION=database` with no running worker, verification (and email-change) mails **never send**.
- **File(s):** server `krama-api/.env` + process manager (host-side).
- **Exact fix:** either set `QUEUE_CONNECTION=sync` (simplest — sends inline), OR run a supervised `php artisan queue:work`. Verify: register a user → confirm the verification email arrives.
- **Priority:** P0 (signup) · **Effort:** ~10 min.

---

## C. ⚠ NEEDS ATTENTION (non-blocking, but confirm / schedule)

- **Live integration round-trips — Verification required:** Bakong/KHQR, ABA PayWay, Stripe (real merchant creds + a real test transaction each); SMTP send; SMS OTP; Telegram bot webhook (needs public HTTPS). Code paths verified to boot correctly; **live gateways cannot be verified without production credentials.**
- **SSL / HTTPS — Verification required:** valid cert + force-HTTPS at the web server (`ForceHttps` middleware exists but relies on correct proxy headers behind the host's TLS).
- **Backups & monitoring — Verification required:** automated DB + `storage/app` backup with one tested restore; uptime check on `/api/health`; error alerting. (No code artifact — host/ops.)
- **`storage/` writable** (avatars, cvs, htmlpurifier cache, logs) — Verification required on host.
- **Unauthenticated LLM chat proxy** (`routes/api.php:70`, throttle 20/min/IP): cost-abuse risk. Add auth or a global daily spend cap. Medium.
- **bcrypt rounds = 10** (`config/hashing.php`): set `BCRYPT_ROUNDS=12` in prod `.env`. Low.
- **Frontend perf** (audit H-5): runtime `@babel/standalone` compile + `no-store` on `.jsx`/`.html`. Works, but slow first paint on low-end mobile. Post-launch: add a build step. Not blocking.
- **`payment_config` served publicly in full** (`SettingController::publicGroup`): currently only the public KHQR merchant id — keep secrets out of it. Defense-in-depth.

---

## D. ✅ VERIFIED WORKING (runtime, this engagement)

App boots (no fatal errors); `GET /api/health` 200; **auth** (login/me/refresh) works; **uploads** (avatar→public disk, CV→private disk, download) work; **payment creation** (subscribe→201, invoice gen, KHQR QR helper) works; **admin API** (all read endpoints + a settings write) 200; **scheduler** lists 7 crons; routing (202 routes) + `migrate:status` clean. (Runtime checks exercised the identical controllers that run on `main`.)

---

## E. Verification required before production (feature runtime, human/staging)

Not individually re-run this pass — confirm on staging with the production config from §B:
Candidate: apply to job, saved jobs, messages, job alerts email. Employer: post job → admin approve → visible; applicant pipeline stage emails; AI CV-match credit spend; billing/subscribe → **real payment** → fulfillment. Admin: company approval, job moderation, homepage editor save, SMTP/SMS/Social-login/Telegram test buttons, reports, audit log, role changes. Public: EN/KM toggle, SEO/sitemap, AI chat.

---

## STOP-CONDITION CHECK

| Condition | State |
|---|---|
| No Critical issues remain | ✅ (code) |
| No High security issues remain | ✅ (code) |
| Authentication works | ✅ |
| Payments work | ✅ code paths · ⚠ live gateways = Verification required |
| Scheduled jobs work | ✅ defined · ❌ **cron not verified on host (B2)** |
| Emails/notifications work | ⚠ ❌ **queue/SMTP not verified on host (B3)** |
| DB migrations succeed | ✅ |
| App starts without errors | ✅ |
| Core Candidate/Employer/Admin workflows | ✅ code fixed · ⚠ end-to-end runtime = §E |

**Recommendation:** **Do not launch until B1–B3 are completed and verified on the production server, and at least one real payment + one verification email succeed on staging.** Once those pass, this is a GO — the code itself carries no remaining Critical/High defects.

---

## F. Deployment sequence (Laravel 12 → production)

**Launch decision:** deploy `main` (now the L12 + hardened tree) on the cPanel host's **PHP 8.2**.

### F0. Settled state (local)
`main` working tree clean at **`8a7c368`** ("Frontend: production-ready URLs for kramajob.com" — 22 cross-app links relativized + path-aware `<base>` for the clean root URL + cache-bust bumps), on top of the L12 + hardening + NBC exchange-rate tree. Contents verified: L12 (`composer ^12`, fruitcake removed, `(int)env` jwt casts, built-in `HandleCors`), XSS `HtmlSanitizer` on write, mobile account menu, employer Team mobile fit, candidate alerts/Recommended fixes, public search-cap fix (`getAllPages`), NBC exchange-rate. The code base `9acda28` is the consolidated L12 + all hardening + all UX fixes.

### F1. Settle origin/main on GitHub  ⚠ (requires GitHub auth — run by the team, not from the dev sandbox)
> ⚠️ **First freeze any parallel session's git operations** — `main`'s history was being rewritten; a mid-push force-push would clobber this. One session owns the push.
```bash
git fetch origin
git log --oneline main..origin/main      # what origin has that local doesn't
```
- **Empty** → `git push origin main` (clean fast-forward).
- **Not empty** → origin diverged; the exchange-rate commit `443aa5b` touches only the 8 tax-invoice files and cherry-picks cleanly — reconcile onto origin/main, then push.
- **Verify on GitHub:** `origin/main` HEAD shows the "Tax invoice: NBC exchange-rate…" commit.

**Confirmed server layout** (cPanel user `seagzdgt`, home `/home/seagzdgt`):
- `~/krama-api/` — Laravel **API app-root**, OUTSIDE the webroot (test copy). Its `.env` holds all secrets.
- `~/kramajob.com/` — **document root** for kramajob.com (confirmed in cPanel → Domains). Currently a throwaway default-Laravel placeholder; holds `cgi-bin/` + `.well-known/` (cPanel/SSL — **must keep**).
- `~/krama.seagullguesthouse.com/` — the proven-working test site. Reference only; leave as-is.
- `~/public_html`, `~/uat.seagullguesthouse.com`, `~/*.cpanel.site` — UNRELATED hotel app. 🔴 **NEVER touch.**

**Wiring (one origin):** the docroot `index.php` boots the API from `../krama-api`; `bootstrap/app.php` reads **`APP_PUBLIC_PATH`** from `~/krama-api/.env` and binds `public_path()` to the docroot, so uploads (`UploadController` → `public_path('uploads')`) + the `storage` symlink land web-accessibly under `~/kramajob.com/`. Real files (`/krama/...`) are served static; everything else (`/api/*`, `/jobs/{slug}`, `/sitemap.xml`, `/robots.txt`) → `index.php` → Laravel. `/` is internally rewritten to the React public site.

### F2. Server — backup + fetch current code
```bash
cd ~ && tar czf ~/krama-backup-$(date +%F).tgz krama-api kramajob.com   # rollback insurance
rm -rf ~/krama-src
git clone https://github.com/kramajobinfo-sys/krama.git ~/krama-src     # private repo → PAT/deploy key
cd ~/krama-src && git checkout main && git log --oneline -1             # expect 8a7c368
```

### F3. Deploy the API to ~/krama-api  (preserve .env / storage / uploads)
```bash
rsync -a --delete \
  --exclude='.env' --exclude='.env.*' --exclude='/vendor/' \
  --exclude='/storage/' --exclude='/public/uploads/' \
  ~/krama-src/krama-api/  ~/krama-api/
cd ~/krama-api
/opt/alt/php82/usr/bin/php $(which composer) install --no-dev --optimize-autoloader --no-interaction
```
Confirm PHP 8.2 extensions: **gd**, `mbstring`, `openssl`, `pdo_mysql`, `curl`, `dom`, `fileinfo` (cPanel PHP Selector).

### F4. Production `.env` (`~/krama-api/.env`)  ← secrets: **you** edit, never scripted
```
APP_ENV=production
APP_DEBUG=false
LOG_LEVEL=warning
BCRYPT_ROUNDS=12
APP_URL=https://kramajob.com
FRONTEND_URL=https://kramajob.com
APP_PUBLIC_PATH=/home/seagzdgt/kramajob.com     # makes uploads + storage web-servable
QUEUE_CONNECTION=sync                            # shared host: no persistent worker
DB_DATABASE=… DB_USERNAME=… DB_PASSWORD=…        # production DB
MAIL_*                                           # kramajob.com SMTP (verify — was seagullguesthouse)
# Stripe / ABA / Bakong keys — LIVE or sandbox (your call)
```
Then (you run — writes secrets): `php artisan key:generate` and `php artisan jwt:secret`.

### F5. Database (fresh launch — decision)
- **Clean slate (recommended):** `php artisan migrate:fresh --force` (**DROPS all test data**) → then re-create the production admin + baseline settings (seeder or `php artisan tinker`).
- **Keep current test rows:** `php artisan migrate --force` (pending migrations only).

### F6. Deploy the frontend + docroot (`~/kramajob.com`)
```bash
# a) Move the placeholder aside (KEEP cgi-bin + .well-known) — reversible
mkdir -p ~/kramajob_placeholder_bak && cd ~/kramajob.com
for i in app artisan bootstrap cache composer.json composer.lock config database \
         .editorconfig .env .env.example .gitattributes .gitignore .htaccess \
         package.json phpunit.xml postcss.config.js public README.md resources \
         routes storage tailwind.config.js tests vendor vite.config.js; do
  [ -e "$i" ] && mv "$i" ~/kramajob_placeholder_bak/
done
# b) Frontend + c) docroot bootstrap (boots ../krama-api)
rsync -a --delete ~/krama-src/krama/  ~/kramajob.com/krama/
cp ~/krama-src/krama-api/public_html_index.php  ~/kramajob.com/index.php
```
Create `~/kramajob.com/.htaccess`:
```apache
<IfModule mod_rewrite.c>
    <IfModule mod_negotiation.c>
        Options -MultiViews -Indexes
    </IfModule>
    RewriteEngine On
    RewriteCond %{HTTP:Authorization} .
    RewriteRule .* - [E=HTTP_AUTHORIZATION:%{HTTP:Authorization}]
    # Clean homepage: serve the React public site at "/" (assets resolve via the page's <base>)
    RewriteRule ^$ krama/ui_kits/public-website/index.html [L]
    RewriteCond %{REQUEST_FILENAME} !-d
    RewriteCond %{REQUEST_URI} (.+)/$
    RewriteRule ^ %1 [L,R=301]
    RewriteCond %{REQUEST_FILENAME} !-d
    RewriteCond %{REQUEST_FILENAME} !-f
    RewriteRule ^ index.php [L]
</IfModule>
```

### F7. Storage link, uploads dir, caches, cron
```bash
cd ~/krama-api
php artisan storage:link                          # → ~/kramajob.com/storage (uses APP_PUBLIC_PATH)
mkdir -p ~/kramajob.com/uploads && chmod 755 ~/kramajob.com/uploads
chmod -R 775 storage bootstrap/cache
php artisan config:cache
php artisan route:cache                            # if it errors on a closure route, skip this one
php artisan view:cache
```
Cron (cPanel → Cron Jobs, every minute — **absolute** PHP 8.2 binary):
```
* * * * * /opt/alt/php82/usr/bin/php /home/seagzdgt/krama-api/artisan schedule:run >/dev/null 2>&1
```

### F8. Post-deploy verification (live)
- `curl -I https://kramajob.com/` → 200; browser shows the React homepage at the **clean `/`**.
- Log in → Employer / Candidate / Admin dashboards load; cross-links back to `/` work.
- `https://kramajob.com/sitemap.xml` + `/robots.txt` → 200 (Laravel SEO routes).
- One **real payment** → fulfillment; one **verification email** received; an **avatar upload** lands under `/uploads/` and renders.
- NBC scrape: `php artisan tinker --execute="var_dump(App\Services\ExchangeRateService::fetchFromNbc());"` → a real number (else fallback rate — still correct).
- Scheduler: a pending payment reconciles within ~3 min.

### The one standing risk
The only thing between here and a clean deploy is the **parallel session rewriting git history**. Pick one authoritative `main`, push it once, freeze the rest. All application code is verified ready.
