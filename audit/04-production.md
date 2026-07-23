# PASS 4 — Production & Performance Audit (Krama)

Role: Senior DevOps + SRE + Performance Engineer
Scope: Static review only (code + config read on disk; app not run). Date of review basis: repo state on branch `main` @ 5b9b242.

Confirmed stack (re-verified this run, not trusted blindly):
- Backend: Laravel 8 REST API (`laravel/framework ^8.75`, platform pinned PHP 8.2) — `krama-api/composer.json`. No Meilisearch/Scout/Filament/Inertia (grep of composer.json). Search is plain Eloquent `LIKE`.
- Auth: JWT (`php-open-source-saver/jwt-auth`). Not relevant to this pass beyond deploy secrets.
- Frontend: four in-browser React "UI kits" compiled by `@babel/standalone` at RUNTIME from unpkg CDN — `krama/ui_kits/*/index.html`. No build step, no bundler, no service worker/manifest (PWA = false, confirmed).
- Real deploy target: **Namecheap cPanel shared hosting** (subdomain `krama.seagullguesthouse.com`) via a manual zip upload. Confirmed by `~/krama-backups/namecheap_build/NAMECHEAP_DEPLOY.md` + `UPLOAD_ME/` package. Local dev = XAMPP Apache + MySQL.

---

## COVERAGE LEDGER

| Artifact | Path | Status | Notes |
|---|---|---|---|
| Backend composer manifest | `krama-api/composer.json` | REVIEWED | Laravel 8, PHP pinned 8.2, no Redis/Horizon/Sentry pkgs |
| Local `.env` | `krama-api/.env` | REVIEWED | APP_DEBUG=true (local), QUEUE=database, CACHE=file, Redis creds present but unused |
| `.env.example` | `krama-api/.env.example` | REVIEWED | QUEUE default sync in example; real .env uses database |
| Production `.env` (deploy pkg) | `~/krama-backups/namecheap_build/UPLOAD_ME/laravel/.env` | REVIEWED | APP_ENV=production, APP_DEBUG=false, **LOG_LEVEL=debug**, QUEUE=database, MAIL_MAILER=log |
| `.gitignore` | `krama-api/.gitignore` | REVIEWED | `.env` ignored → secrets not committed (good) |
| Console scheduler | `krama-api/app/Console/Kernel.php` | REVIEWED | 7 scheduled commands; needs `schedule:run` cron |
| Scheduled commands | `krama-api/app/Console/Commands/*` | REVIEWED | 6 commands incl. VerifyPendingPayments (payment reconciliation) |
| Queue config | `krama-api/config/queue.php` | REVIEWED | default=database, table queue_jobs, retry_after 90 |
| Cache config | `krama-api/config/cache.php` | REVIEWED | default=file |
| Logging config | `krama-api/config/logging.php` | REVIEWED | daily files (30d app / 90d audit); slack channel unused |
| DB config | `krama-api/config/database.php` | PARTIAL | strict=true confirmed; SSL CA env-gated; pool N/A (PDO) |
| Queue tables migration | `.../2026_06_22_000002_create_queue_jobs_table.php` | REVIEWED | queue_jobs + queue_failed_jobs |
| Index/constraint migration | `.../2026_06_22_000001_database_health_indexes_and_constraints.php` | REVIEWED | Strong composite indexes on hot paths |
| Core tables migration | `.../2026_06_19_000001_create_core_tables.php` | REVIEWED | FK columns `->index()` only; no `->foreign()` constraints in core |
| FK constraints (all migrations) | `database/migrations/*` | REVIEWED (grep) | Only 10 `->foreign()` occurrences, all in later add-on migrations |
| Fulltext indexes | `database/migrations/*` | REVIEWED (grep) | Fulltext only on forum threads/replies; NOT on jobs |
| Only queued Job | `krama-api/app/Jobs/SendEmailVerificationJob.php` | REVIEWED | ShouldQueue, tries=3, backoff=60 — requires worker |
| JobController (index/show/publish/alerts) | `krama-api/app/Http/Controllers/JobController.php` | PARTIAL (1-120, 320-360, 740-850 + grep of 36KB file) | index eager-loads; search LIKE; expireOverdue on hot path; view increment write; social via terminating() |
| Subscription model | `krama-api/app/Models/Subscription.php` | REVIEWED | expireOverdue() runs on public jobs index |
| SocialPostService | `krama-api/app/Services/SocialPostService.php` | REVIEWED | Fire-and-forget, no retry, marks social_posted_at even on failure |
| VerifyPendingPayments cmd | `krama-api/app/Console/Commands/VerifyPendingPayments.php` | REVIEWED | Gateway reconciliation; depends on scheduler cron |
| ReportController (dashboard) | `krama-api/app/Http/Controllers/ReportController.php` | REVIEWED | Aggregate SQL, no N+1 |
| MessageController | `krama-api/app/Http/Controllers/MessageController.php` | PARTIAL (grep) | unread_count loop per conversation (bounded 30) |
| RecommendationController | `krama-api/app/Http/Controllers/RecommendationController.php` | PARTIAL (grep) | paginate + collection transform (bounded) |
| UploadController | `krama-api/app/Http/Controllers/UploadController.php` | REVIEWED | 5MB image, no re-encode/optimize |
| Image handling (GD) | `CompanyController.php`, `AuthController.php` | PARTIAL (grep + lines) | GD downscale present; 10MB raw uploads; no WebP/queue |
| HealthController | `krama-api/app/Http/Controllers/HealthController.php` | REVIEWED | DB + cache check, returns 503 on failure |
| ForceHttps middleware | `krama-api/app/Http/Middleware/ForceHttps.php` | REVIEWED | HTTPS + HSTS in production only |
| SecurityHeaders middleware | `krama-api/app/Http/Middleware/SecurityHeaders.php` | REVIEWED | CSP present (applies to API JSON only) |
| API `.htaccess` | `krama-api/public/.htaccess` | REVIEWED | Standard Laravel front-controller rewrite |
| Deploy `.htaccess` | `~/krama-backups/namecheap_build/UPLOAD_ME/.htaccess` | REVIEWED | Static-first, /api/* → index.php |
| Namecheap deploy guide | `~/krama-backups/namecheap_build/NAMECHEAP_DEPLOY.md` | REVIEWED | No cron, no worker, no artisan optimize steps mentioned |
| Frontend entrypoint | `krama/ui_kits/public-website/index.html` | REVIEWED | Runtime Babel compile of 11 jsx; unpkg CDN deps |
| UI kit bundle sizes | `krama/ui_kits/*` | REVIEWED (ls) | admin app.jsx 481KB, employer 215KB, _ds_bundle.js 494KB — all runtime-compiled |
| Backups | `~/krama-backups/` | REVIEWED (ls) | Manual tar.gz + SQL dumps present (today); no automation/offsite |
| CI/CD | repo root, `.github/` | NOT FOUND | Only `.styleci.yml` (hosted style linter); no pipeline/tests-on-push |
| Docker/Compose | repo | NOT FOUND | None; XAMPP + cPanel only |
| Redis usage | config + .env | REVIEWED | Redis creds in .env but CACHE=file/QUEUE=database → Redis NOT used |
| PWA (manifest/SW) | `krama/ui_kits/*` | NOT FOUND | Confirmed absent |
| Meilisearch | composer/config | NOT FOUND | Confirmed absent; search = Eloquent LIKE |

Unread / not-opened this run (honest gaps): full body of JobController (36KB — read key regions only), PaymentService.php internals (KHQR/Stripe verify logic — Pass 2/3 territory), CvMatchService, TelegramService/SmsService bodies, ApplicationController apply path, config/database.php lines 62-140. These are flagged where a finding depends on them.

---

## PERFORMANCE FINDINGS

### P1 — [High] [VERIFIED] Frontend compiles React in the browser at runtime via Babel Standalone on every page load
Evidence: `krama/ui_kits/public-website/index.html` loads `@babel/standalone@7.29.0/babel.min.js` from unpkg, then `Promise.all` fetches 11 separate JSX files (`chrome/home/jobs/job-detail/company-detail/auth/apply/pages/forum/chat/app`, `JSX_V=185`) and runs `Babel.transform(src,{presets:['react']})` client-side for each. The dashboards are far heavier: `admin-dashboard/app.jsx` = 481 KB, `employer-dashboard/app.jsx` = 215 KB, `candidate-dashboard/app.jsx` = 96 KB, plus `_ds_bundle.js` = 494 KB — all fetched and (for jsx) transpiled on the client.
Impact: Babel Standalone (~1.5-3 MB) plus per-file transpile runs on the main thread on first paint. On the low-end Android devices typical of the Cambodian market this is multi-second time-to-interactive and heavy CPU/battery cost. No caching of compiled output; each visit re-downloads and re-compiles (cache-busting `?v=` query defeats long-lived caching on every version bump). This is the single largest end-user performance liability.
Fix: Introduce a one-time build step (esbuild/vite) that produces pre-compiled, minified, hash-named bundles; ship React production runtime and drop Babel Standalone entirely. This is a build-tooling change, not a rewrite — the JSX sources are already modular.

### P2 — [High] [VERIFIED] Hard runtime dependency on the unpkg.com CDN with no SRI, no fallback, no pinned integrity
Evidence: same `index.html` — `react.production.min.js`, `react-dom.production.min.js`, `@babel/standalone`, and `lucide@0.441.0` all load from `https://unpkg.com/...` with plain `<script src>` (no `integrity=`/`crossorigin`). All four UI kits follow this pattern.
Impact: unpkg latency/outage or a compromised CDN response takes the entire product down or executes arbitrary code. There is no graceful degradation — if the Babel fetch fails the app shows "Failed to load". This is both an availability SPOF and a supply-chain risk.
Fix: Self-host the vendored libraries on the same origin (they can sit next to `_ds_bundle.js`), add Subresource Integrity hashes, and eliminate the runtime-only dependency by pre-building (see P1).

### P3 — [Medium] [VERIFIED] `Subscription::expireOverdue()` performs writes on the public job-listing hot path
Evidence: `JobController::index()` line 25 calls `Subscription::expireOverdue()` before every public `/api/jobs` query. `Subscription.php` lines 27-45: it `pluck`s overdue active/trial subs, then `UPDATE`s jobs to `closed` and subs to `expired`.
Impact: Every anonymous listing request (including crawler/bot traffic) triggers this. When nothing is overdue it is one extra indexed SELECT (acceptable), but when subscriptions lapse it issues bulk UPDATEs on the `/jobs` read path — the busiest public endpoint — creating write contention and unpredictable latency under load. Coupling housekeeping to a read endpoint is an anti-pattern.
Fix: Move expiry to the already-scheduled `subscriptions:expire` command (runs hourly) and drop the inline call, OR gate it behind a short cache lock so it runs at most once per minute regardless of request volume.

### P4 — [Medium] [VERIFIED] Job search uses leading-wildcard `LIKE '%term%'` + correlated `orWhereHas` subquery — cannot use an index
Evidence: `JobController::index()` lines 37-41 build `$term = '%'.search.'%'` and query `where('title','like',$term)->orWhereHas('company', ... name like ...)`. Same pattern at lines 440-441 (admin/company list). No fulltext index on `jobs` (grep confirms fulltext exists only on `forum_threads`/`forum_replies`).
Impact: Leading `%` forces a full scan of `jobs.title`; the `orWhereHas('company')` adds a correlated subquery scan of `companies.name`. Fine at a few hundred jobs; degrades toward seconds as the catalog grows to 10k+ rows. The job-alert matcher (`whereRaw LOWER(?) LIKE CONCAT('%',LOWER(keyword),'%')`, ~line 831) has the same non-sargable shape.
Fix: Add a MySQL InnoDB FULLTEXT index on `jobs(title, description)` and switch keyword search to `MATCH() AGAINST()` (natural-language mode). Graceful and cheap for an SME; degrades to LIKE only when the term is too short for fulltext.

### P5 — [Medium] [VERIFIED] View counter writes to the database on every single job detail view
Evidence: `JobController::show()` line 89: `DB::table('jobs')->where('id',$id)->increment('views')` on every `GET /api/jobs/{id}`, no throttling/dedup.
Impact: A read endpoint becomes a write endpoint; row-level write contention on popular listings and easy inflation/abuse (refresh loop, crawlers). Under bot traffic this multiplies write load unnecessarily.
Fix: Batch view counts (increment a cache counter, flush periodically) or at minimum dedupe per session/IP window.

### P6 — [Low] [VERIFIED] N+1 unread-count query per conversation in the messaging list
Evidence: `MessageController::index()` line 36 `paginate(30)`, then lines 38-41 loop each conversation issuing `Message::where('conversation_id',$conv->id)->...count()`.
Impact: Up to 30 extra queries per inbox load. Bounded by page size so not severe, but avoidable.
Fix: Single grouped subquery (`withCount` with a constraint, or a `GROUP BY conversation_id` aggregate joined back).

### P7 — [Low] [VERIFIED] Uploaded images are stored without server-side optimization/format conversion
Evidence: `UploadController::storeImage()` moves the raw file as-is (5 MB cap, no re-encode). Company/avatar paths use GD `imagecreatefromstring` downscaling (`CompanyController.php` ~221-240, 516-538; `AuthController.php` ~297-310) but accept up to 10 MB raw and only downscale "when available" — else store as-is. No WebP output, no responsive variants, no CDN.
Impact: Large PNG/JPEG logos/banners served at full weight to mobile users compounds the P1 payload problem. Admin banner uploads (`/uploads`) get no downscale at all.
Fix: Always re-encode to a bounded max dimension + quality, prefer WebP with JPEG fallback, and generate a thumbnail variant for listings.

Positive perf notes (verified): The `2026_06_22` health-indexes migration adds well-chosen composite indexes exactly matching the hot queries (`idx_jobs_status_featured_date` for the listing sort, `idx_jobs_company_status`, `idx_sub_company_status`, `idx_app_*_stage`, `idx_pay_company_status`, `idx_notif_user_read`), a unique slug, and tightens column types. FK columns in core tables carry `->index()`. `ReportController::summary` uses proper aggregate SQL (no N+1). The public listing eager-loads `company/category/location` with column selection (no N+1 there). This is above-average DB hygiene for an early-stage app.

---

## INFRASTRUCTURE FINDINGS

### I1 — [Critical] [VERIFIED] Scheduler is never run in production → payment reconciliation and all housekeeping silently stop
Evidence: `app/Console/Kernel.php` schedules 7 commands including `payments:verify-pending` (every 3 min, the server-side gateway reconciliation net for KHQR/Bakong/ABA/Stripe — see `VerifyPendingPayments.php`), `subscriptions:expire`, `jobs:expire`, `features:expire`, `tokens:prune`, `forum:digest`, `queue:prune-failed`. The production deploy guide `NAMECHEAP_DEPLOY.md` has **no step to create a cron job for `php artisan schedule:run`** (grep of the repo finds zero `schedule:run`/`queue:work`/supervisor references).
Impact: On cPanel shared hosting nothing invokes the scheduler, so `payments:verify-pending` never runs. Any payment whose gateway callback is missed/delayed (network blip, webhook not delivered, user closes the KHQR screen before the synchronous poll succeeds) is **never reconciled or fulfilled** — the customer pays and gets nothing. Subscriptions/featured boosts also never auto-expire except via the inline `expireOverdue()` hack on the jobs page. This is a money-correctness/data-integrity failure.
Fix: Add a cPanel cron entry `* * * * * /usr/local/bin/php /home/<user>/.../laravel/artisan schedule:run >> /dev/null 2>&1` and document it as a required deploy step. Verify `payments:verify-pending` runs and logs `payment.gateway_verified` to the audit channel.

### I2 — [High] [VERIFIED] Queued email-verification job has no worker in production → verification emails never send
Evidence: Production `.env` sets `QUEUE_CONNECTION=database`. The only `ShouldQueue` class is `SendEmailVerificationJob` (dispatched from `AuthController` lines 129 & 371). The deploy guide documents no `queue:work` worker/supervisor, and shared cPanel hosting cannot keep a long-running worker alive.
Impact: On registration the job is inserted into `queue_jobs` and sits there forever. New users never receive verification email (compounded by `MAIL_MAILER=log` default — see I3). Registration onboarding is broken end-to-end even after SMTP is configured, unless a worker runs.
Fix: Either (a) add a cron running `php artisan queue:work --stop-when-empty --max-time=55` each minute (works on shared hosting), or (b) change this single job to run synchronously (`QUEUE_CONNECTION=sync` or dispatch after response via `terminating()` like the social/alert emails already do — that pattern is proven in `JobController::notifyNewlyPublished`).

### I3 — [High] [VERIFIED] Production ships with `MAIL_MAILER=log` — no email is actually sent
Evidence: Production `.env` in the deploy package: `MAIL_MAILER=log`. Deploy guide confirms "emails go to the log, not sent" and defers SMTP to a post-launch admin action.
Impact: Password reset, email verification, job-alert, follower, and application notifications are all silently written to a log file instead of delivered. For a jobs marketplace this breaks core workflows on day one until an operator remembers to configure SMTP. Combined with I2 the email subsystem is doubly non-functional out of the box.
Fix: Configure real SMTP (the `.env` already references `mail.seagullguesthouse.com:465/ssl`) before go-live and set `MAIL_MAILER=smtp`; make this a launch-blocking checklist item, not a troubleshooting note.

### I4 — [Medium] [VERIFIED] Social-post delivery (Telegram/Facebook/LinkedIn) is fire-and-forget with no retry, and marks itself done even on failure
Evidence: `JobController::notifyNewlyPublished()` runs `SocialPostService::shareJob($job)` inside `app()->terminating()` (post-response, in-process — no worker, good for shared hosting). But `SocialPostService::shareJob()` lines 43-69 wrap each platform in try/catch that only logs, then sets `social_posted_at = now()` whenever `$attempted` is true — regardless of success/failure.
Impact: A transient network error or expired token when a job is published means the post is lost permanently; `social_posted_at` being set prevents any re-post. The `terminating()` callback also has no retry and won't fire if the PHP process is killed mid-shutdown. For the advertised auto-posting feature this silently drops posts.
Fix: Only stamp `social_posted_at` for platforms that succeeded (track per-platform), and record failures for retry via the scheduler (`social:retry-failed`). If a durable queue is added later, move social posting onto it.

### I5 — [Medium] [VERIFIED] No config/route/view caching or opcache warmup in the deploy process
Evidence: `NAMECHEAP_DEPLOY.md` steps 1-8 cover DB import, file upload, PHP version, permissions, SSL — but never run `php artisan config:cache`, `route:cache`, `view:cache`, or `optimize`. No SSH access is assumed on shared cPanel.
Impact: Every request re-parses all config and route files from disk — measurable per-request overhead on shared hosting. Combined with `composer.json` `optimize-autoloader:true` this is partially mitigated, but the framework boot is not cached.
Fix: Pre-generate `bootstrap/cache/*.php` locally (`php artisan config:cache && route:cache`) and include them in the upload package, OR add a one-time cPanel "Terminal"/cron `artisan optimize` step. Note: with `config:cache` on, all `env()` reads outside config files return null — verify the app reads config, not env, at runtime before enabling.

### I6 — [Medium] [VERIFIED] `LOG_LEVEL=debug` in the production environment
Evidence: Production `.env`: `LOG_LEVEL=debug`. `config/logging.php` `daily` channel level defaults to that env value (30-day retention).
Impact: Verbose debug logging on shared hosting fills the (limited) disk quota faster and adds I/O overhead; debug logs can also capture sensitive request context. Not fatal but wrong for prod.
Fix: Set `LOG_LEVEL=warning` (or `error`) in production.

### I7 — [Medium] [VERIFIED] No monitoring, error tracking, or alerting; `/health` exists but nothing polls it
Evidence: `HealthController` provides a real DB+cache check returning 503 on failure (good). `config/logging.php` has a `slack` channel but `LOG_SLACK_WEBHOOK_URL` is unset; no Sentry/Bugsnag package in composer; no uptime monitor config anywhere.
Impact: Failures (payment reconciliation stalls, 500s, disk full, SMTP down) are invisible until a user complains. For a product handling money this is a meaningful operational gap.
Fix: Point an external uptime monitor (e.g. UptimeRobot free tier) at `/api/health`; set `LOG_SLACK_WEBHOOK_URL` so `critical`/`error` logs page someone; consider a lightweight error tracker.

### I8 — [Medium] [VERIFIED] Redis is configured but unused; caching/queue run on file+database
Evidence: `.env` sets `REDIS_HOST/PASSWORD/PORT` but `CACHE_DRIVER=file` and `QUEUE_CONNECTION=database`. Namecheap shared hosting typically offers no Redis.
Impact: No functional bug, but the Redis config is misleading (implies a capability that isn't wired). File cache and DB queue are acceptable at SME scale but both compete for the same disk/DB the app already uses.
Fix: Either remove the unused Redis config to avoid confusion, or (if the host offers it) actually switch cache+queue to Redis for the scaling headroom. Do NOT over-engineer — file+DB is fine for launch volume.

### I9 — [Medium] [LIKELY] No enforced foreign-key constraints in the core schema (referential integrity is application-only)
Evidence: `2026_06_19_000001_create_core_tables.php` declares FK columns with `->index()` only; grep across all migrations finds just 10 `->foreign()` occurrences, all in later add-on tables (`job_alerts`, `company_followers`, `company_reviews`, plus the two jobs add-columns). Core relations (jobs↔companies, applications↔jobs/candidates, subscriptions↔plans/companies, payments↔companies) have indexes but no DB-level FK.
Impact: Orphaned rows are possible on delete paths (e.g. deleting a company leaves dangling jobs/subscriptions), and cascade behavior depends entirely on application code being correct everywhere. This is a data-integrity risk, not a perf one.
Fix: Add FK constraints with explicit `onDelete` behavior where the delete semantics are known; where soft-delete/keep-history is intended, document that choice. Verify no existing orphans before adding constraints.

### I10 — [Low] [VERIFIED] Backups are manual, un-automated, and restore is untested/undocumented beyond "re-import the SQL"
Evidence: `~/krama-backups/` holds recent `krama-backup-*.tar.gz` + `krama-db-*.sql` (dated today) and older snapshots — clearly created by hand. `NAMECHEAP_DEPLOY.md` "Restore / re-deploy" says only "re-import `krama_db_production.sql`". No scheduled backup, no offsite copy, no restore drill.
Impact: RPO is "whenever someone last remembered"; a host failure between manual backups loses data. An untested restore may fail when it matters (uploaded files under `storage/`/`uploads/` are on the same host and not obviously in the offsite set).
Fix: Automate a daily `mysqldump` + `tar` of `storage/`/`uploads/` via cron, push a copy off the host (cheap object storage), and run one documented restore drill into a scratch DB.

### I11 — [Low] [VERIFIED] Production secrets (APP_KEY, JWT_SECRET) and full production DB dumps sit in plaintext in local backups
Evidence: `~/krama-backups/namecheap_build/UPLOAD_ME/laravel/.env` contains `APP_KEY`/`JWT_SECRET`; multiple `*_production.sql` and `upload_me.zip` (with the embedded `.env`) are in `~/krama-backups/`.
Impact: Anyone with access to this developer machine has the production JWT signing key (forge any user's token → auth bypass) and a full DB copy. This is an operational-hygiene exposure, not a code bug.
Fix: Keep the production `.env`/secrets out of shared backup archives; rotate `JWT_SECRET`/`APP_KEY` if this machine is ever shared or compromised. (Good: `.env` IS gitignored, so secrets are not in git history.)

---

## DEPLOYMENT RISKS (summary of the real deploy story)

The app deploys to **Namecheap cPanel shared hosting** by manually uploading a pre-built `upload_me.zip` and importing a SQL dump — there is **no CI/CD, no Docker, no automated tests on push** (only `.styleci.yml`, a hosted style-linter config; no `.github/` workflows exist). Consequences ranked:

1. **No cron → no payment reconciliation / no housekeeping** (I1, Critical). The most dangerous deploy gap: the money-safety net doesn't run.
2. **No queue worker → verification emails stuck** (I2, High), compounded by **MAIL_MAILER=log** (I3, High) — email is fully non-functional at launch.
3. **Manual, un-versioned deploy** — the "build" is a hand-assembled zip in `~/krama-backups/namecheap_build/`. No reproducible pipeline; drift between local and prod is easy. Rollback = "re-upload the old zip + re-import SQL" (destructive; loses data written since the dump).
4. **No `artisan optimize`/config-cache step** (I5) — slower per-request boot.
5. **Storage symlink caveat is a known live bug** — the deploy guide itself warns newly-uploaded company images may 404 if `storage:link` isn't run, which requires host intervention.
6. **`APP_DEBUG=true` foot-gun** — the guide instructs operators to flip `APP_DEBUG=true` to troubleshoot 500s; risk of it being left on (stack traces + env leakage). Production default is correctly `false`.
7. **Single host, no redundancy** — DB, files, and app share one shared-hosting box. Acceptable for launch scale but the entire product is one host away from downtime with no failover.

---

## PRODUCTION CHECKLIST (launch-blocking unless noted)

Deploy-time (must do before go-live):
- [ ] BLOCKER: Add cPanel cron `* * * * * php <path>/laravel/artisan schedule:run >/dev/null 2>&1` and confirm `payments:verify-pending` logs a run (I1).
- [ ] BLOCKER: Make email work — set real SMTP + `MAIL_MAILER=smtp` (I3) AND handle the queued verification job: either `QUEUE_CONNECTION=sync` for that job or a per-minute `queue:work --stop-when-empty --max-time=55` cron (I2).
- [ ] BLOCKER: Confirm `APP_ENV=production`, `APP_DEBUG=false` on the live box (verified in package; re-verify after any troubleshooting).
- [ ] Set `LOG_LEVEL=warning` in production (I6).
- [ ] Run `php artisan storage:link` (or create the symlink) so new uploads serve (deploy-guide known issue).
- [ ] Pre-generate and ship `config:cache`/`route:cache`, or run `artisan optimize` post-upload (I5). Verify no runtime `env()` reads first.
- [ ] Run AutoSSL / confirm HTTPS; `ForceHttps` + HSTS activate only under `APP_ENV=production` (verified).

Reliability / operations:
- [ ] Point an external uptime monitor at `/api/health` and set `LOG_SLACK_WEBHOOK_URL` for critical-log alerts (I7).
- [ ] Automate daily DB + `storage/`+`uploads/` backup with an offsite copy; run one restore drill (I10).
- [ ] Keep production secrets out of shared backup archives; plan a `JWT_SECRET` rotation path (I11).
- [ ] Verify social auto-post retries or at least alerts on failure (I4).

Performance (fast follow, not all launch-blocking):
- [ ] HIGH: Add a build step — pre-compile/minify the UI kits, self-host React + drop Babel Standalone (P1) and add SRI/self-host CDN libs (P2).
- [ ] Move `Subscription::expireOverdue()` off the public `/jobs` read path (P3).
- [ ] Add FULLTEXT index on `jobs` and switch keyword search to `MATCH…AGAINST` before the catalog grows (P4).
- [ ] Batch/throttle the job-view counter (P5).
- [ ] Ensure Apache gzip/brotli + far-future cache headers for the large static JS assets (`_ds_bundle.js` 494KB, app.jsx bundles) — verify on the live host.

Data integrity:
- [ ] Add core-table FK constraints (or document the intentional absence) after checking for orphans (I9).

---

## PERFORMANCE & PRODUCTION-READINESS ASSESSMENT

Overall verdict: **Not production-ready as it would deploy today**, driven almost entirely by operational gaps (no cron, no worker, email off) rather than by the application code, which is actually in good shape.

Justification:
- The **database layer is genuinely well-tuned for an SME product** — the `2026_06_22` health-indexes migration adds precise composite indexes matching every hot query, and the controllers I read eager-load relations and use aggregate SQL rather than N+1 loops. Query performance will be fine well past launch scale.
- The **dominant end-user performance problem is the frontend delivery model** (P1/P2): downloading Babel Standalone + up-to-481KB of un-minified JSX and transpiling it in the browser on every visit. This is a real, measurable TTI hit on the low-end mobile devices this market runs on, and it introduces a hard third-party CDN SPOF. It is fixable with a conventional build step without touching the modular source.
- The **most severe risks are operational, not algorithmic.** The scheduler and queue simply aren't wired to run on the target shared host, so the payment-reconciliation safety net (I1) and email onboarding (I2/I3) are non-functional out of the box. For a marketplace that takes KHQR/ABA/Stripe money, a payment that isn't reconciled is the worst possible failure, and it will happen the first time a gateway callback is missed.
- **Scaling is appropriately sized** for early-stage: single shared host, file cache, DB queue, plain Eloquent search. I am explicitly NOT recommending Redis/Horizon/Meilisearch/Docker/multi-node now — that would be over-engineering. The right moves are the cheap, high-leverage ones: a cron line, a working mailer, a monitor, an automated backup, and a frontend build step.

Confidence in this assessment: HIGH for the config/deploy/DB findings (read directly, including the production `.env` and deploy guide). MEDIUM where noted (partial reads of the 36KB JobController and un-opened PaymentService/CvMatchService bodies). Items requiring runtime confirmation are flagged inline (e.g. exact TTI cost of Babel compile, whether Apache gzip is enabled on the live host — REQUIRES RUNTIME TEST: load `https://krama.seagullguesthouse.com/ui_kits/admin-dashboard/index.html` with devtools Network throttled to "Slow 4G" and measure DOMContentLoaded + JS main-thread time; expected: multi-second on the 481KB admin bundle).
