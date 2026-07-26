# PASS 4 — Production & Performance Audit (Krama)

**Auditor role:** Senior DevOps + SRE + Performance Engineer
**Method:** STATIC review (read the real files; cannot run the app). Every finding cites a file opened this run with the line range read.
**Stack confirmed this run:** Laravel 8 REST API (`laravel/framework ^8.75`, platform pinned PHP 8.2 — `krama-api/composer.json:11,63-65`), JWT auth, MySQL/MariaDB, four in-browser React "UI kits" compiled by `@babel/standalone` at runtime (`krama/ui_kits/public-website/index.html:5-44`). No Meilisearch, no Filament, no Inertia, no PWA, no Docker, no CI — all re-confirmed below.

---

## Executive summary

Krama is a competently built Laravel 8 API with a genuinely thoughtful data layer (a dedicated index/constraint migration, sensible eager-loading, GD image resizing for logos/avatars). The **production risk is not in the code — it is in the operational glue that a shared-cPanel deploy will silently omit.** The app depends on a scheduler and a queue worker to move money and unblock signups, but ships no runbook, cron, or supervisor config to run them. Separately, the frontend architecture (runtime Babel compile of 200–480 KB `.jsx` per dashboard, forced `no-store`, CDN-only React/Babel with no SRI or fallback) is the dominant end-user performance problem.

**Top risks, in order:**
1. **Scheduler won't run in prod → paid customers not fulfilled.** `payments:verify-pending` (the reconciliation safety-net for KHQR/ABA/Stripe) runs only under `schedule:run`, which has no documented cron. (HIGH, money)
2. **Queue worker won't run in prod → email verification never sends.** `SendEmailVerificationJob` is `ShouldQueue`, `QUEUE_CONNECTION=database`, no worker/supervisor documented. (HIGH)
3. **Frontend runtime Babel + `no-store` on `.jsx`** → every visit re-downloads and re-compiles the whole app in the browser. (HIGH perf)
4. **CDN-only React/Babel/Lucide, no SRI, no fallback** → unpkg outage or slowness breaks the whole site. (HIGH availability)
5. Shared `JWT_SECRET`/`APP_KEY` across local/testing/hosting templates. (HIGH secret hygiene)

No Critical: no auth-bypass / data-loss / direct money-miscalculation defect was found in the production/perf surface this pass reviewed (payment *math* is Pass-2/3 scope).

---

## Coverage ledger

| Artifact | Path | Status | Notes |
|---|---|---|---|
| Composer manifest | `krama-api/composer.json` | Read fully | Laravel 8.75, PHP platform 8.2, no meili/scout/filament/inertia |
| Live env | `krama-api/.env` | Read fully | `APP_ENV=local`, `APP_DEBUG=true`, `QUEUE_CONNECTION=database` |
| Env example | `krama-api/.env.example` | Read fully | `QUEUE_CONNECTION=sync`, empty JWT_SECRET |
| Hosting template | `krama-api/.env.hosting.template` | Read fully | `APP_ENV=production`, debug off, but hardcoded real secrets |
| Testing env | `krama-api/.env.testing` | Read fully | Same JWT/APP_KEY as prod template |
| Root gitignore | `.gitignore` | Read fully | `.env`/`.env.*` ignored except example |
| API gitignore | `krama-api/.gitignore` | Read fully | ignores `.env`, `.env.testing` |
| Deploy doc | `krama/database/DEPLOY.md` | Read fully | STALE ("no backend API code yet"), XAMPP + cPanel, no cron/queue setup |
| API README | `krama-api/README.md` | Read fully | Stock Laravel README, zero deploy content |
| Console scheduler | `krama-api/app/Console/Kernel.php` | Read fully | 7 scheduled commands |
| Scheduled commands | `app/Console/Commands/*` | Listed; VerifyPendingPayments read fully | 6 commands present |
| Queue job | `app/Jobs/SendEmailVerificationJob.php` | Read fully | `ShouldQueue`, tries=3 |
| Queue config | `krama-api/config/queue.php` | Read fully | default sync, `database` → `queue_jobs` table |
| Logging config | `krama-api/config/logging.php` | Read fully | daily 30d + audit 90d; slack/papertrail unconfigured |
| Cache config | `krama-api/config/cache.php` | default line read | `file` default |
| App config | `krama-api/config/app.php` | debug line read | `debug` from env, default false |
| SecurityHeaders MW | `app/Http/Middleware/SecurityHeaders.php` | Read fully | CSP applies to API responses only |
| ForceHttps MW | `app/Http/Middleware/ForceHttps.php` | Read fully | prod-only redirect + HSTS |
| Health check | `app/Http/Controllers/HealthController.php` | Read fully | DB + cache probes |
| Job listing/search | `app/Http/Controllers/JobController.php:22-134` | Read | eager-loaded; LIKE search; write-on-read `expireOverdue()` |
| Post-publish fanout | `JobController.php:300-366, 818-874` | Read | `app()->terminating()` social + alert emails |
| Subscription model | `app/Models/Subscription.php` | Read fully | `expireOverdue()` |
| DB health indexes | `migrations/2026_06_22_000001_*` | Read fully | broad index/constraint coverage |
| Migrations (all) | `database/migrations/` | Listed (53) | queue_jobs + failed_jobs present |
| Report/metrics | `app/Http/Controllers/ReportController.php` | Read fully | aggregate queries, OK |
| Payment reconcile cmd | `app/Console/Commands/VerifyPendingPayments.php` | Read fully | 7-day window, gateway re-verify |
| Upload handling | `app/Http/Controllers/UploadController.php` | Read fully | NO resize/optimize, 5MB raw |
| Image resize (GD) | `CompanyController.php:221-252,523-550`, `AuthController.php:299-318` | grep + lines confirmed | logos/avatars resized q85 |
| Social service HTTP | `app/Services/SocialPostService.php` (HTTP-call lines) | Partial | up to ~5 blocking calls, 12–30s timeouts |
| Telegram service HTTP | `app/Services/TelegramService.php` (HTTP-call lines) | Partial | 10–20s timeouts |
| Frontend entrypoints | `krama/ui_kits/public-website/index.html` | Read fully | runtime Babel, CDN, JSX fetch |
| UI-kit .htaccess (all 4) | `krama/ui_kits/*/.htaccess` | Read | `no-store` on html/jsx |
| API .htaccess | `krama-api/public/.htaccess` | Read fully | stock Laravel front controller |
| Uploads .htaccess | `krama-api/public/uploads/.htaccess` | Read fully | `Options -Indexes` |
| CI / Docker / supervisor | repo-wide search | Confirmed ABSENT | no `.github`, no Dockerfile/compose, no supervisor/Procfile |
| Compression/expires config | grep of all `.htaccess` | Confirmed ABSENT | no mod_deflate / mod_expires |
| **NOT reviewed** | PaymentService/CvMatchService internals | Skipped | payment math + AI cost = Pass 2/3 scope |
| **NOT reviewed** | Full SocialPostService/TelegramService bodies | Partial | only HTTP-call lines read; retry/backoff unread |
| **NOT reviewed** | Dashboard `app.jsx` internals | Skipped (size only) | 96–482 KB; measured size, not logic |
| **NOT reviewed** | `core_tables` migration column detail | Skipped | index migration read instead |

---

## FINDINGS

### HIGH

#### H-1 — Scheduler has no production trigger; payment reconciliation + expiry silently never run
**Severity: HIGH (money / broken core workflow) · Confidence: VERIFIED (code) + LIKELY (deploy gap)**

`app/Console/Kernel.php:16-25` schedules seven business-critical commands:
```
$schedule->command('payments:verify-pending')->everyThreeMinutes()->withoutOverlapping();
$schedule->command('subscriptions:expire')->hourly();
$schedule->command('jobs:expire')->dailyAt('00:05');
$schedule->command('features:expire')->dailyAt('00:10');
$schedule->command('tokens:prune')->daily()->at('03:00');
```
`payments:verify-pending` (`VerifyPendingPayments.php:30-58`) is the **only** mechanism that reconciles a KHQR/ABA/Stripe payment when its webhook is missed/delayed/failed — it re-queries the gateway and calls `PaymentService::fulfill()`. All of this runs only if `php artisan schedule:run` fires every minute. The deploy target is cPanel (`.env.hosting.template:8-12` describes cPanel paths), and **no cron entry or scheduler doc exists anywhere in the repo** — `DEPLOY.md`, `README.md`, and the hosting template were all read this run and none mention `schedule:run`.

**Impact:** If the cron isn't manually configured, a customer who pays via KHQR/ABA but whose webhook is lost is **charged but never granted their plan/credits**, with no automatic recovery. Compounding: `VerifyPendingPayments.php:31` only scans payments `created_at >= now()->subDays(7)`, so if the scheduler is down >7 days those pending payments become **permanently unrecoverable** by this job. Subscriptions/featured boosts also never expire.

**Fix:** cPanel cron `* * * * * cd /home/USER/krama-api && php artisan schedule:run >> /dev/null 2>&1`; document it; add a heartbeat alert if it hasn't run in >5 min; widen the reconciliation window or add a manual admin re-verify for older pending payments.
**REQUIRES RUNTIME TEST:** on the host, `crontab -l` shows the line; create a pending payment and confirm it flips within 3 min.

#### H-2 — Queue worker has no production trigger; verification emails enqueued but never processed
**Severity: HIGH (broken signup workflow) · Confidence: VERIFIED (code) + LIKELY (deploy gap)**

`.env:26` and `.env.hosting.template:32` set `QUEUE_CONNECTION=database`. `SendEmailVerificationJob` implements `ShouldQueue` (`SendEmailVerificationJob.php:12`) and is dispatched at registration (`AuthController.php:129,371`). With the `database` driver, `dispatch()` inserts into `queue_jobs` and returns immediately — a worker must consume it. There is **no supervisor config, Procfile, or `queue:work` doc** (confirmed by repo-wide search this run). On shared cPanel, long-running workers are often disallowed/killed, and no cron-based `queue:work --stop-when-empty` fallback exists.

**Impact:** As configured for prod, **email verification emails are enqueued and never sent** → users can't verify → blocked from `MustVerifyEmail`-gated flows. Silent: registration returns 200, the row sits in `queue_jobs`.
**Mitigating (verified):** The heavier post-publish fanout (social, job-alert, follower emails) does NOT use the queue — it runs via `app()->terminating()` (`JobController.php:347-365`). So only email verification is affected by the missing worker.
**Fix:** Set `QUEUE_CONNECTION=sync` in prod (send inline; see M-6 for blocking note), OR add cron `* * * * * php artisan queue:work --stop-when-empty --max-time=55` and document it.

#### H-3 — Frontend recompiles the entire app in-browser on every visit; `.jsx` forced `no-store`
**Severity: HIGH (performance, esp. mobile) · Confidence: VERIFIED**

`public-website/index.html:5-7,35-52` loads React + ReactDOM + **`@babel/standalone@7.29.0`** (~1.5 MB) from CDN, then `fetch()`es 11 `.jsx` files and runs `Babel.transform(...)` on each **in the browser at load**. Dashboard sizes measured this run: admin `app.jsx` **482 KB**, employer **219 KB**, candidate **96 KB** — all re-compiled client-side every load. Worse, **all four UI-kit `.htaccess` force `Cache-Control: no-store, no-cache, must-revalidate` on every `.jsx`/`.html`** (`public-website/.htaccess:1-6`; admin identical), so the browser can't even cache the source between visits.

**Impact:** High Time-To-Interactive and heavy main-thread CPU (Babel compile is synchronous) on every load — worst on the low-end Android devices typical of the Cambodian market. The single largest UX cost in the product.
**Fix:** Add a one-time build step (esbuild/vite) to emit minified, hashed bundles; drop Babel-standalone; serve compiled JS with `Cache-Control: public, max-age=31536000, immutable` (cache-bust via hashed filename). If a build step is truly out of reach short-term, at least precompile to `.js` once and remove `no-store` from compiled assets.

#### H-4 — Core libraries loaded from unpkg CDN with no SRI and no fallback
**Severity: HIGH (availability + supply chain) · Confidence: VERIFIED**

`index.html:5-7,11` loads `react`, `react-dom`, `@babel/standalone`, `lucide` from `https://unpkg.com/...` with **no `integrity`/`crossorigin` (no SRI)** and **no local fallback**. `DEPLOY.md:23` even tells operators to "keep internet on."

**Impact:** (a) Availability — if unpkg is slow/down/rate-limited, the entire site (public + all dashboards) fails to render; unpkg is a free community CDN with no SLA. (b) Supply chain — with no SRI, a compromised CDN response runs arbitrary JS in every session including admins (full account/PII compromise), and the app's CSP does not protect these pages (see M-2).
**Fix:** Self-host pinned copies (and drop Babel per H-3), or at minimum add `integrity=` SRI hashes + `crossorigin="anonymous"` to every CDN `<script>`.

#### H-5 — Same `JWT_SECRET` and `APP_KEY` reused across local, testing, and the prod template
**Severity: HIGH (secret hygiene / cross-env token forgery) · Confidence: VERIFIED**

Identical values in three files read this run: `.env:3,19`, `.env.testing:3,19`, and `.env.hosting.template:3,25` (under `APP_ENV=production`). The template pre-fills real JWT/APP keys while every other secret is a `YOUR_..._HERE` placeholder — inviting verbatim deploy.

**Impact:** A JWT minted on any developer box is valid in production and vice versa; anyone who has seen the local `.env` or this template can forge production tokens for any user/role. `APP_KEY` reuse makes encrypted cookies/tokens interchangeable across environments.
**Mitigating (verified):** `git ls-files` this run shows **only `.env.example` is tracked** — the template and live `.env` are NOT committed, so this is not a public git leak; the risk is process/hygiene.
**Fix:** Blank `JWT_SECRET`/`APP_KEY` in the template; instruct `php artisan key:generate` + `jwt:secret` on the server; rotate the prod secret to a unique value.

### MEDIUM

#### M-1 — No CI/CD, no build/optimize/rollback plan; deploy is manual file copy to cPanel
**Severity: MEDIUM · Confidence: VERIFIED (absence) + LIKELY (process)**
Confirmed absent: `.github/`, any Dockerfile/compose, any pipeline `.yml` (only `.styleci.yml`), any deploy script. `README.md` is stock Laravel; `DEPLOY.md` covers only manual phpMyAdmin import and is stale. No mention of `config:cache`/`route:cache`/`view:cache`/`optimize` anywhere, so every request re-parses config/routes.
**Impact:** Ad-hoc unversioned deploys, no fast rollback, missed per-request cache warmers.
**Fix:** Deploy runbook (composer install --no-dev --optimize-autoloader → migrate --force → config/route/view cache), keep previous release for symlink rollback, add a minimal CI job (lint + `php artisan test`).

#### M-2 — `SecurityHeaders`/CSP protect only the API JSON, not the actual HTML pages
**Severity: MEDIUM · Confidence: VERIFIED**
`SecurityHeaders.php:23-26` sets a strict CSP (`script-src 'none'`) on Laravel responses, but the UI kits are static HTML served by Apache (`krama/ui_kits/.../index.html`), never routed through Laravel. So the CSP protects only JSON (where `script-src 'none'` is trivially met) and does nothing for the pages that execute scripts / load CDN libs (H-4).
**Fix:** Emit security headers for the static kits via UI-kit `.htaccess`; once assets are self-hosted, a tight `script-src 'self'` becomes feasible.

#### M-3 — `LOG_LEVEL=debug` in the production template
**Severity: MEDIUM · Confidence: VERIFIED**
`.env.hosting.template:16` sets `LOG_LEVEL=debug` under `APP_ENV=production`; the daily channel level is `env('LOG_LEVEL','warning')` (`logging.php:66`), so prod logs at debug (30-day retention, `:67`). `APP_DEBUG=false` is correct (no user-facing trace leak), but logs grow fast and may capture PII/token fragments on limited cPanel disk.
**Fix:** `LOG_LEVEL=warning` (or `error`) in prod.

#### M-4 — No monitoring/alerting/uptime checks; health endpoint exists but nothing consumes it
**Severity: MEDIUM · Confidence: VERIFIED**
`HealthController.php` gives a solid `/health` (DB+cache, 503 on failure) but nothing scrapes it. `logging.php:70-86` defines slack/papertrail channels but their env keys are unset and the stack is `['daily']` only (`:52-55`). No Sentry/APM.
**Impact:** The silent failures of H-1/H-2, gateway errors, and 5xx spikes go unnoticed.
**Fix:** UptimeRobot/BetterStack on `/health`; add slack channel to the stack with `LOG_SLACK_WEBHOOK_URL` at error level; consider Sentry free tier.

#### M-5 — Admin/employer uploads stored raw (up to 5 MB), no resize/optimize; no compression/cache headers
**Severity: MEDIUM (performance) · Confidence: VERIFIED**
`UploadController.php:9-28` (admin homepage/banner) and `:32-48` (employer job-share) validate `image|max:5120` then `$file->move(...)` with **no resize/re-encode** — a 5 MB hero/banner served full-size to every visitor. (Logos/covers/avatars ARE resized via GD q85 — `CompanyController.php:221-252,523-550`, `AuthController.php:299-318` — so the capability exists but isn't applied here.) Repo-wide `.htaccess` search found **no `mod_deflate`/`mod_expires`**; UI-kit `.htaccess` actively sets `no-store` (H-3). Uploads dir is 11 MB / 83 files today.
**Fix:** Reuse the GD resize path in `UploadController`; add `mod_deflate` for text/js/css and `mod_expires`/`Cache-Control` for images and compiled JS.

#### M-6 — Post-publish social + alert fanout runs synchronously in `terminating()`; up to ~90 s blocking on Apache mod_php
**Severity: MEDIUM (perf / worker exhaustion) · Confidence: VERIFIED (code) + LIKELY (Apache behavior)**
Job publish schedules `SocialPostService::shareJob()` + `sendJobAlertEmails()` + `sendFollowerEmails()` via `app()->terminating()` (`JobController.php:347-365`). The comment assumes this runs after the response "so no queue worker is needed," but `terminating()` only frees the client early when `fastcgi_finish_request()` exists (PHP-FPM). Under **Apache + mod_php** (the documented XAMPP/cPanel deploy) it runs before the worker is released. The fanout makes multiple blocking calls with long timeouts (grep confirmed): LinkedIn 15+30+15 s (`SocialPostService.php:179,205,222`), Facebook 20 s (`:145-148`), Telegram 20 s (`TelegramService.php:71-75`), plus a per-recipient SMTP loop (`JobController.php:854-872,799`).
**Impact:** Publishing can occupy a PHP worker (and possibly stall the employer's browser) for tens of seconds — up to ~90 s worst case — reducing concurrency and risking worker-pool exhaustion under concurrent publishing.
**Fix:** Move the fanout to the real queue (H-2), or dispatch each external call as a short individually-timed job; if staying inline on FPM, verify `fastcgi_finish_request` is actually invoked (it is not on mod_php).

#### M-7 — `Subscription::expireOverdue()` performs writes on every public `GET /api/jobs`
**Severity: MEDIUM (perf / lock contention) · Confidence: VERIFIED**
`JobController.php:25` calls `expireOverdue()` at the top of the highest-traffic listing endpoint. That method (`Subscription.php:27-45`) SELECTs and, when anything is overdue, issues two UPDATEs. The hourly `subscriptions:expire` command already covers expiry, making the per-request call redundant.
**Impact:** Extra query on every anonymous listing hit; when subs lapse, concurrent requests race the same UPDATEs (idempotent, but redundant write load / row-lock contention). Read is cheap (indexed `subscriptions(status)`), but this keeps the GET write-capable and non-cacheable (`:74` sets `no-cache`).
**Fix:** Rely on the hourly command; remove the per-request call or guard it behind a cache lock (once per N min). Then make the listing HTTP-cacheable.

#### M-8 — No documented, tested backup/restore for production
**Severity: MEDIUM · Confidence: LIKELY (absence)**
No backup automation or restore procedure in the repo; `DEPLOY.md` covers only initial schema/seed import. (Project memory notes local dev backups in `~/krama-backups/` — a developer machine, not prod, and no restore test.)
**Impact:** For a product taking real payments, an untested backup is a latent data-loss incident.
**Fix:** Daily automated MySQL dump + `public/uploads` to off-host storage; perform a real restore drill; record RPO/RTO.

### LOW

#### L-1 — Deploy docs stale/misleading
**VERIFIED.** `DEPLOY.md:8` says "There is no backend API code yet" and frames the backend as future work (`:70-102`) — false; `krama-api` exists. `README.md` is stock Laravel. **Fix:** replace with a real runbook.

#### L-2 — `robots.txt` permits full crawling of the API origin
**VERIFIED.** `krama-api/public/robots.txt` is `User-agent: *` / `Disallow:` (allow all). **Fix:** `Disallow: /` on the API origin (it serves JSON); keep SEO on the public-site origin.

#### L-3 — `APP_PUBLIC_PATH` ships as an unresolved placeholder
**VERIFIED.** `.env.hosting.template:12` = `/home/YOUR_CPANEL_USERNAME/PUBLIC_HTML`; the template's own comment (`:8-11`) warns wrong values break admin image uploads. **Fix:** validate at boot / fail loudly if placeholder remains.

#### L-4 — Redis configured but entirely unused
**VERIFIED.** `.env` sets `REDIS_*` but `CACHE_DRIVER=file`, `SESSION_DRIVER=file`, `QUEUE_CONNECTION=database` (`.env:24-27`). Dead config. **Fix:** wire Redis for cache/queue if the host offers it, or remove the env to avoid confusion. (`file`/`database` are acceptable at SME scale.)

---

## Performance assessment (justification)

**Backend data layer: GOOD for SME scale.** The health migration (`migrations/2026_06_22_000001`) adds exactly the composite indexes the hot paths need: `jobs(status,is_featured,created_at)` for the public listing sort (matches `JobController.php:69`), `jobs(company_id,status)`, `subscriptions(company_id,status)`, `applications(candidate_id,stage)`/`(job_id,stage)`, unread-notification and payment-status indexes, plus the previously-scanning `auth_tokens(token_hash)`. Controllers eager-load with column-scoped `with(...)` (`JobController.php:27,82,419`), so no obvious N+1 in reviewed reads. `ReportController` aggregates are bounded. Search is leading-wildcard `LIKE '%term%'` (`JobController.php:37-41`) — non-sargable, a non-issue at current volume, a scan risk at 10k+ jobs; add FULLTEXT (not a search engine) only when data justifies it. Do NOT add Meilisearch now — over-engineering for this stage.

**Frontend: POOR, and it is the dominant user-facing cost.** Runtime Babel compilation of 96–482 KB JSX per dashboard on every load (H-3), forced `no-store` defeating caching (H-3), and CDN-only libs with no SRI/fallback (H-4) make first paint and every navigation slow and fragile — especially on low-end mobile hardware common in the target market. Highest-ROI fix; needs a build step.

**Operational readiness: NOT PRODUCTION-READY as documented.** The two load-bearing background mechanisms — scheduler (money reconciliation, expiry) and queue (verification email) — have no documented way to run on the intended cPanel host (H-1, H-2) and will fail silently. Monitoring/alerting is absent (M-4). Deploy is manual with no rollback (M-1) and no tested backup (M-8).

**Scaling verdict (right-sized):** A single Laravel app + MySQL on shared/VPS will comfortably serve thousands of daily users once the operational gaps close. Do NOT reach for Kubernetes, autoscaling, Redis clusters, or a search engine yet. The proportionate work: (1) cron for `schedule:run`; (2) `QUEUE_CONNECTION=sync` or a `queue:work` cron; (3) frontend build step + long-cache/SRI; (4) uptime monitor on `/health` + Slack error logging; (5) deploy runbook, automated DB+uploads backup, one restore drill. That list — not new infrastructure — stands between this and a dependable launch.

---

## Production checklist (pre-launch)

**Secrets & env**
- [ ] Generate unique `APP_KEY` (`php artisan key:generate`) + `JWT_SECRET` (`php artisan jwt:secret`) on the server; blank them in the template (H-5)
- [ ] `APP_ENV=production`, `APP_DEBUG=false` (verify on server)
- [ ] `LOG_LEVEL=warning` in prod (M-3)
- [ ] `CORS_ALLOWED_ORIGINS` / `FRONTEND_URL` = real prod origin
- [ ] `APP_PUBLIC_PATH` filled with the real cPanel path, not the placeholder (L-3)
- [ ] Confirm `.env` not web-served and not committed (currently gitignored — good)

**Background processing**
- [ ] Cron `* * * * * php artisan schedule:run` installed + verified (H-1)
- [ ] Queue worker running, OR `QUEUE_CONNECTION=sync` (H-2)
- [ ] Heartbeat/alert if scheduler or worker stalls (M-4)
- [ ] Verified `payments:verify-pending` fulfils a real pending payment within 3 min (H-1)

**Performance**
- [ ] Frontend build step; drop Babel-standalone; hashed minified bundles (H-3)
- [ ] Self-host or SRI-pin React/ReactDOM/Lucide (H-4)
- [ ] Long-cache compiled assets; remove `no-store` from compiled JS (H-3)
- [ ] `config:cache` + `route:cache` + `view:cache` on deploy (M-1)
- [ ] Resize/optimize `UploadController` images; enable `mod_deflate`/`mod_expires` (M-5)
- [ ] Remove per-request `expireOverdue()` from public listing (M-7)

**Reliability & security**
- [ ] Uptime monitor on `/health`; Slack/Sentry error alerting (M-4)
- [ ] Security headers/CSP on the static UI-kit origin, not just the API (M-2)
- [ ] `robots.txt` disallows API-origin crawling (L-2)
- [ ] Automated daily DB + `uploads/` backup off-host; **restore drill performed** (M-8)
- [ ] Deploy runbook written; previous-release rollback path in place (M-1)
- [ ] Move social/alert fanout to queue or verify non-blocking on prod SAPI (M-6)
- [ ] Replace stale `DEPLOY.md`/`README.md` with the real runbook (L-1)
