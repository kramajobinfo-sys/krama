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
`main` working tree clean. **Last code commit = `443aa5b`** (NBC exchange-rate, auto-sync + safe manual fallback); doc commits sit on top (`68425f5` at time of writing). Contents verified: L12 (`composer ^12`, fruitcake removed, `(int)env` jwt casts, built-in `HandleCors`), XSS `HtmlSanitizer` on write, mobile account menu, employer Team mobile fit, candidate alerts/Recommended fixes, public search-cap fix (`getAllPages`), NBC exchange-rate. The code base `9acda28` is the consolidated L12 + all hardening + all UX fixes.

### F1. Settle origin/main on GitHub  ⚠ (requires GitHub auth — run by the team, not from the dev sandbox)
> ⚠️ **First freeze any parallel session's git operations** — `main`'s history was being rewritten; a mid-push force-push would clobber this. One session owns the push.
```bash
git fetch origin
git log --oneline main..origin/main      # what origin has that local doesn't
```
- **Empty** → `git push origin main` (clean fast-forward).
- **Not empty** → origin diverged; the exchange-rate commit `443aa5b` touches only the 8 tax-invoice files and cherry-picks cleanly — reconcile onto origin/main, then push.
- **Verify on GitHub:** `origin/main` HEAD shows the "Tax invoice: NBC exchange-rate…" commit.

### F2. Deploy the code — BOTH the API and the frontend (⚠ confirm server layout first — NOT yet verified)
The repo root holds **two** deployable parts: `krama-api/` (Laravel API) **and** `krama/ui_kits/` (the static frontend — mobile menu, admin exchange-rate UI, etc.). Both must reach production. First confirm how each is checked out/served:
```bash
cd ~/krama-api && git remote -v && git log --oneline -1     # is THIS a git checkout, and of the whole repo or just the API?
```
- **If `~/krama-api` is a full-repo checkout** (contains `krama-api/` + `krama/` inside it, and the domain docroot points into it):
  ```bash
  git fetch origin && git reset --hard origin/main
  ```
- **If `~/krama-api` is only the API dir** (repo split across folders / files uploaded) — deploy each part to its real location:
  - **API** → the `krama-api` dir (git pull there, or upload).
  - **Frontend** → wherever `kramajob.com` is served (e.g. `public_html` / the domain docroot): update `krama/ui_kits/*` there. 🔴 **Do NOT skip this** — the mobile-menu, admin exchange-rate UI, candidate/employer mobile fixes live in `krama/ui_kits` and won't reach users otherwise.

Then build the Laravel 12 vendor **under PHP 8.2** (in the `krama-api` dir):
```bash
composer install --no-dev --optimize-autoloader
# if `composer` runs under the wrong PHP, force 8.2 explicitly, e.g.:
#   php ~/composer.phar install --no-dev --optimize-autoloader
```
- Confirm PHP 8.2 extensions incl. **gd** (avatar/image resize), `mbstring`, `openssl`, `pdo_mysql`, `curl`, `dom`, `fileinfo` are enabled (cPanel PHP Selector — a version switch can reset extensions).

### F3. Config gates (B1–B3) + finalize
- **B1** `.env`: `APP_ENV=production`, `APP_DEBUG=false`, `LOG_LEVEL=warning`, `BCRYPT_ROUNDS=12`, `APP_URL`/`FRONTEND_URL`/`CORS_ALLOWED_ORIGINS=https://kramajob.com`, real `DB_*`/`MAIL_*`; then `php artisan key:generate` + `php artisan jwt:secret` (fresh unique secrets).
- **B2** cron (cPanel → Cron Jobs, once per minute) — ⚠ use the **absolute** PHP 8.2 binary (cron's `PATH` differs from your shell; get it from `which php`, e.g. `/opt/alt/php82/usr/bin/php`), not bare `php`:
  `* * * * * /opt/alt/php82/usr/bin/php /home/seagzdgt/krama-api/artisan schedule:run >/dev/null 2>&1`
- **B3** `.env`: `QUEUE_CONNECTION=sync` (shared host can't keep a worker alive).
- Finalize: `php artisan config:cache && php artisan route:cache` (re-run after ANY `.env` change); `chmod -R 775 storage bootstrap/cache`.

### F4. Post-deploy verification (on the live host)
- `https://kramajob.com/api/health` → 200.
- Login (candidate + employer + admin), one **real payment** → fulfillment, one **verification email** received.
- NBC scrape (else the manual fallback rate is used — still correct):
  `php artisan tinker --execute="var_dump(App\Services\ExchangeRateService::fetchFromNbc());"`
- Confirm the scheduler fired: a pending payment reconciles within ~3 min.

### The one standing risk
The only thing between here and a clean deploy is the **parallel session rewriting git history**. Pick one authoritative `main`, push it once, freeze the rest. All application code is verified ready.
