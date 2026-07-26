# Krama — Consolidated Audit (Final Consolidation Pass)

**Role:** Audit lead — merge, dedupe, prioritize the four specialist passes; re-verify the load-bearing claims against real code.
**Method:** Static code review. The app was **not run**. Every finding below cites a file and line range that was actually opened (either by a source pass and re-confirmed this run, or opened fresh this run). Confidence tags: **VERIFIED** (exact code read, issue present) · **LIKELY** (strong inference) · **HYPOTHESIS** (risk to check — no fabricated line numbers). Anything that can only be proven by running the app is tagged **REQUIRES RUNTIME TEST** with exact steps.
**Date:** 2026-07-24

> **UPDATE — all four passes now complete.** The dedicated security pass (`02-security.md`) has been produced and merged into this consolidation (§4). It confirmed the escalation and shared-secret findings the other passes flagged, and surfaced **one new CRITICAL** the earlier passes could not (they never read the JSX render paths line-by-line): **stored XSS via unsanitized rich text rendered with `dangerouslySetInnerHTML`** on public + admin-facing pages. Because an open **Critical** now exists, the go-live gate moves the status to **RED** (previously ORANGE pending the security pass). The API authorization model itself remains sound; the Critical lives in the front-end render layer, and the escalation is a single missing guard.

---

## 1. Executive Summary (for a non-engineer)

Krama is a competently built Cambodian jobs platform (Laravel 8 API + four in-browser React dashboards) that takes real money via KHQR/ABA/Stripe. The core payment logic is genuinely careful — every payment is re-verified with the bank before anything is granted, and fulfilment can't double-charge. **But it is not production-ready yet.** The single most severe problem is a **stored cross-site-scripting hole**: employers type job and company descriptions that the site displays without cleaning, so a malicious employer can plant hidden code that runs in the browser of **every visitor — including the admin who reviews the posting** — and can steal their login. On top of that: the app relies on two background processes (a scheduler that reconciles payments and an email queue) that have **no way to run on the intended cPanel host** — so a customer who pays but whose bank notification is lost could be **charged and never given what they bought**, and new users may **never receive their verification email**; a platform admin (not just the owner) can **create a super-admin account** (privilege escalation); the Stripe card **webhook can be tricked into granting an expensive plan for the price of a cheap one**; employers get **logged out every hour**; the public job search **silently hides jobs past ~50**; and upgrading to a paid plan makes a company's **live jobs temporarily disappear** before payment clears. None of these are deep design flaws — they are concentrated, fixable defects. Closing the XSS hole, the operational gaps, the escalation, the payment-webhook flaw, and the four broken workflows moves this from "not ready" to "ready."

---

## 2. Architecture Review

**Stack (re-confirmed this run):** Laravel `^8.75`, PHP platform pinned 8.2 (`krama-api/composer.json:11,63-65`); JWT auth via `php-open-source-saver/jwt-auth` with Spatie permission installed but the app uses its **own** `roles`/`permissions`/`role_permissions` tables + a custom `CheckPermission` middleware; MySQL/MariaDB; four static React "UI kits" compiled in-browser by `@babel/standalone`. No Meilisearch, Scout, Filament, Inertia, PWA, Docker, or CI (confirmed absent by all three passes and repo search).

**Shape.** Classic thin-ish-routes → fat-controllers → a few services (`PaymentService`, `SocialPostService`, `CvMatchService`, `TelegramService`, `SmsService`) → Eloquent models. `routes/api.php` is a clean, well-commented gate map: public group, `auth:api` group, and permission-gated `admin/*` group. Cross-cutting concerns are handled well in a few places (centralized JSON error handler, a base `Controller::requirePermission`, security-header + force-HTTPS middleware, a real scheduler).

**Strengths (do not "fix"):**
- Centralized JSON error handling for `api/*` (consistent validation/auth/HTTP/500 shapes, debug-gated traces) — `app/Exceptions/Handler.php`.
- Payment webhooks **never trust their payload** — they re-verify server-side (ABA `check-transaction-2`, Stripe session fetch, Bakong md5) — `PaymentController.php:337-429`, `PaymentService.php:64-182`. **Caveat (see §4 H-S2):** the Stripe webhook's `client_reference_id` *fallback* re-verifies a session id that is never bound to the payment's amount/identity, which the security pass found to be exploitable. ABA/Bakong bind the verified identifier to the payment and are safe.
- `PaymentService::fulfill()` is **idempotent** (guards `status==='pending'`) — safe across manual mark-paid / verify / webhook — `PaymentService.php:30-57`.
- KHQR minor-unit math is correct (KHR zero-decimal, USD 2-dp) — `Khqr.php:64-70`.
- Auth endpoints are **rate-limited** (`throttle:auth` = 5/min per IP on login/register/OTP/refresh/forgot — `RouteServiceProvider.php:65-66`, `routes/api.php:31`); refresh-token rotation + sha256 hashing + suspended-account rejection — `AuthController.php:194-211`.
- A dedicated index/constraint migration adds the composite indexes the hot paths need — `migrations/2026_06_22_000001_*`.

**Weaknesses (the debt is duplication + inconsistency, not rot):** four hand-copied front-end API clients that have already drifted into a live bug (F1); money represented as float with no single currency service; three inline re-implementations of subscription expiry, some inside GET handlers; a duplicated invoice generator with an ineffective lock on the boost path; no FormRequest layer; uneven i18n and two-tier-permission application. See Technical Debt (§9).

**Overall architecture grade: B− / "solid pragmatic mid-senior code with concentrated, fixable debt."**

---

## 3. Functional Matrix (core workflows)

| # | Feature | Traced in code | Predicted result | Confidence |
|---|---|---|---|---|
| 1 | Register (email) | `AuthController.php:73-145` | Works; token issued immediately; usable while unverified | VERIFIED |
| 2 | Register (phone+OTP) | `AuthController.php:27-71,91-110` | 6-digit OTP, 5-min TTL, 5 attempts | VERIFIED |
| 3 | Login (email/phone) | `AuthController.php:147-188` | Rejects non-active; logs failures; **rate-limited 5/min** | VERIFIED |
| 4 | Post job (draft→publish) | `JobController.php:96-233` | Company-admin publishes **directly**; recruiter → company review | VERIFIED |
| 5 | Edit / close job | `JobController.php:137-198,399-408` | Edit only draft/pending/rejected | VERIFIED |
| 6 | Public search & filter | server `JobController.php:22-75` exists, **frontend bypasses it** | **BROKEN at scale** — client filters first ≤50 jobs (C-4) | VERIFIED |
| 7 | Apply to job | `ApplicationController.php:20-109` | Works; auto-attaches primary resume; duplicate→422 | VERIFIED |
| 8 | Concurrent apply | `ApplicationController.php:51-63` | Safe — `insertOrIgnore` + unique index | VERIFIED |
| 9 | Upload CV | `ResumeController.php:90-118` | pdf/doc/docx ≤5 MB → **private** disk | VERIFIED |
| 10 | Application pipeline | `ApplicationController.php:199-249` | Ownership enforced; notifies candidate | VERIFIED |
| 11 | Payment success | `PaymentController.php:279-335`, `PaymentService.php:30-57` | Re-verified server-side; idempotent fulfil; **but Stripe webhook fallback bypassable (H-S2)** | VERIFIED |
| 12 | Payment pending/fail | `PaymentService.php:64-182` | KHQR/ABA never falsely fulfilled; **Stripe webhook can be forced to fulfil (H-S2)** | VERIFIED |
| 13 | Subscribe (paid) | `PaymentController.php:149-183` | Creates **pending** sub; **hides live jobs until paid** (H-6) | VERIFIED |
| 14 | Featured boost (paid) | `JobController.php:540-570` | Pending payment; **invoice race, no txn** (M-5) | VERIFIED |
| 15 | Admin: job moderate | `JobController.php:292-397` | approve/reject/feature; audited; notifies | VERIFIED |
| 16 | Admin: company moderate | `CompanyController.php:439-490` | approve/reject/suspend; **approve sends no notice** (L-8) | VERIFIED |
| 17 | Admin: users/roles | `UserController.php:63-147` | **admin can create super_admin** (H-2) | VERIFIED |
| 18 | Employer session refresh | `employer-dashboard/api.js:16-33` | **Broken — logs employer out hourly** (H-3) | VERIFIED |
| 19 | Khmer vs English | `i18n.js` (public only) | Public bilingual; **3 dashboards + all API text English-only** (M-9) | VERIFIED |
| 20 | Currency display | `api.js:56-69`, `Khqr.php` | Display OK; **salary filter mixes currencies** (M-6) | VERIFIED |

---

## 4. Security Report

> **Dedicated security pass complete** — see `audit/02-security.md` (1 critical / 3 high / 3 medium / 3 low). It covered the per-endpoint authorization surface, an IDOR sweep (CVs, applications, messages, company), the payment webhooks, the JSX render paths (XSS), the public settings/secret surface, CORS/headers, file uploads, the LLM proxy, and secret hygiene. Its findings are merged below; the earlier passes' security-adjacent items (H-2, H-4, M-7, L-1, L-9) were confirmed. The load-bearing new finding is **C-S1 (stored XSS)** — the other passes had explicitly left the JSX bundles unread.

**CRITICAL — C-S1 · Stored XSS: employer/candidate rich text rendered unsanitized via `dangerouslySetInnerHTML`.** VERIFIED.
- `job-detail.jsx:31-38` (`RichContent`): any description containing an HTML tag is rendered **raw**; same in `company-detail.jsx:269` (company "about") and `employer-dashboard/app.jsx:640` (`Section`).
- **No sanitization anywhere:** write side validates `description` only as `string` (`JobController.php:119,163`; `CompanyController.php:121`) and **no HTML sanitizer is installed** (`composer.json` has no purifier package). The API's CSP (`SecurityHeaders.php:23-26`) applies only to JSON responses, **not** to the static UI-kit HTML pages that actually run the scripts.
- **Exploit:** a self-registered employer posts a description with an event-handler payload (`<img src=x onerror=…>` / `<svg onload=…>`) — `<script>` won't fire via innerHTML but handlers do. Every visitor to the public job/company page executes it, **including the admin who opens it to moderate** → token theft (JWT in web storage) → account takeover up to admin.
- **Fix (all three):** DOMPurify before every `dangerouslySetInnerHTML`; sanitize on write server-side; add a real CSP to the static pages. **Blocking.**

**HIGH — H-2 · Privilege escalation: a plain `admin` can create a `super_admin` account.** VERIFIED.
- `UserController::adminCreateUser` requires only `manage_users` (`UserController.php:88`) and accepts `'role' => 'required|string|exists:roles,slug'` with **no restriction on which role** (`:94`), then sets it verbatim (`:98-107`).
- The seeder grants the `admin` role `manage_users` but **not** `manage_roles` (`DatabaseSeeder.php:46-49`; only `super_admin` gets all perms via the loop at `:54-56`). The design intent is explicit: role `admin` = "Platform administration **except role management**" (`:16`) and permission `manage_roles` = "super admin only" (`:35`).
- The "change existing user's role" path (`adminUpdateUser`) **correctly** requires `manage_roles` (`:119`) → super-admin-only → safe. But `adminCreateUser` bypasses that boundary: an admin creates a fresh account with `role=super_admin` and a password they choose, then logs in as a super-admin.
- **Impact:** any admin can self-escalate to full platform control (which includes `manage_roles`, payments, plans, settings). Precondition: already holding an admin account. **Fix:** in `adminCreateUser`, reject `role ∈ {super_admin, admin}` unless the caller holds `manage_roles`; or gate the whole endpoint on `manage_roles` for privileged target roles.
- **REQUIRES RUNTIME TEST:** as a seeded `admin` (not super_admin), `POST /api/admin/users {role:"super_admin", ...}` → expect 201 today (should be 403).

**HIGH — H-4 · Same `JWT_SECRET` and `APP_KEY` across local, testing, and the production template.** VERIFIED this run.
- Identical `APP_KEY` (`base64:eGVCaa6k…`) and `JWT_SECRET` (`rnFUcixK…`) in `.env`, `.env.testing`, and `.env.hosting.template` (which is `APP_ENV=production`). Confirmed by direct read this run.
- **Impact:** a JWT minted on any dev box is valid in production and vice-versa; anyone who has seen the local `.env` or the committed-adjacent template can forge production tokens for any user/role. `APP_KEY` reuse makes encrypted payloads interchangeable across environments.
- **Mitigating (VERIFIED):** `git ls-files` shows **only `.env.example` is tracked** — the live `.env` and template are not committed, so this is a process/hygiene hole, not a public git leak.
- **Fix:** blank both in the template; `php artisan key:generate` + `php artisan jwt:secret` on the server; rotate the prod secret to a unique value.

**HIGH — H-S2 · Stripe webhook fulfils payments with an unbound, reusable session id (payment bypass).** VERIFIED.
- `PaymentController.php:400-429` + `PaymentService.php:167-182`. The webhook re-verifies server-side (good), but its **fallback** match uses attacker-controlled `data.object.client_reference_id` to select a pending payment, then calls `stripeSessionPaid($sessionId)` — which only checks `payment_status==='paid'` and never binds the session's `amount_total`/`currency`/`client_reference_id` to the payment being fulfilled.
- **Exploit:** an employer completes **one** cheap real payment → gets a paid session id `cs_…`; creates an expensive pending payment (invoice `I2`), never pays it; POSTs the webhook with `{data:{object:{id: cs_…, client_reference_id: I2}}}`. Primary lookup (`gateway_ref=cs_…`) misses (already paid), fallback selects `I2`, `stripeSessionPaid(cs_…)` returns true → expensive plan fulfilled. The paid session id is **reusable** against unlimited invoices. ABA/Bakong are unaffected (they verify the same identifier that names the payment).
- **Fix:** assert `session.client_reference_id===payment.invoice_no` AND `amount_total===round(amount*100)` AND currency before `fulfill()`; drop or constrain the fallback; add `Stripe-Signature` verification; keep card payments disabled until fixed. **Blocking for card payments.**

**MEDIUM — M-S1 · Unauthenticated LLM chat proxy → cost abuse / free general-purpose model.** VERIFIED.
- `routes/api.php:70` (`POST /api/chat`, public, `throttle:20,1` per IP) + `ChatController.php:14-102`. The API key stays server-side (good), but the endpoint is unauthenticated with only a per-IP throttle and no global spend cap — distributed clients can drive unbounded paid Anthropic completions, and the "Krama assistant" system prompt is a soft guardrail (usable as a free general LLM). `max_tokens` is capped at 1024. **Fix:** require auth (or a signed widget token), add a global daily token/spend budget that fails closed, tighten the throttle.

**MEDIUM — M-7 · Email change does not reset verified state.** VERIFIED. `AuthController::updateMe` (`:242-258`) updates `email` (with a uniqueness rule) but never clears `email_verified_at` or re-dispatches verification. A user verified under address A switches to unverified address B and stays `hasVerifiedEmail()===true` — any "verified email" trust signal is bypassable. **Fix:** on email change, set `email_verified_at=null` and re-send verification.

**LOW — L-1 · `payment_config` and `social` settings groups are served unauthenticated with no per-key filtering.** VERIFIED (latent) / HYPOTHESIS (exploitability). `SettingController::publicGroup` whitelists `['homepage,chat,brand,home_content,social,payment_config']` and strips sensitive keys **only for `chat`** (`SettingController.php:138,144-152`). Real gateway secrets live in the separate `payment` and `social_post` groups, which are **not** in the whitelist (good — `bakong_token/aba_api_key/stripe_secret_key` at `:131`, `facebook_page_token/linkedin_token` at `:132`, all preserved via `SECRET_KEYS`). Residual risk: if anyone ever stores a token inside `payment_config` or `social`, it is served at `GET /api/settings/{group}` to the world. **Fix:** apply the same key-strip filter to every public group, not just `chat`.

**LOW — L-9 · `User::$fillable` includes `role_id`, `company_id`, `company_role`.** VERIFIED (fillable) / HYPOTHESIS (exploitability). `User.php:18-21`. This is a mass-assignment foot-gun: safe only as long as **no** self-service endpoint fills from raw request input. Admin create/update resolve the role explicitly (`UserController.php:98-107,129-131`) — safe. **To grade:** confirm `AuthController::register` and `updateMe` map validated slugs → `role_id` explicitly and never pass `$request->all()`/unvalidated `role_id` to `create`/`update`. If any do, it becomes a self-service escalation (Critical). Recommend removing `role_id`/`company_id` from `$fillable` and setting them explicitly.

**Security spot-check POSITIVES (VERIFIED this run):**
- **No SQL-injection surface found:** every `whereRaw`/`selectRaw` is either static (no user input — `ReportController.php:28,47`; `CompanyReviewController.php:25`; invoice `MAX` at `JobController.php:640`, `PaymentController.php:725`) or parameterized with a `?` binding (`ForumThreadController.php:271`). Eloquent everywhere else.
- **Auth brute-force protection present** (`throttle:auth` 5/min/IP).
- **Telegram webhook uses `hash_equals`** for the secret (`TelegramController.php:80`); CVs on a private disk with visibility checks (`ResumeController.php:109`, `ApplicationController.php:333-338`); refresh-token rotation + reset-token single-use.

---

## 5. Performance Report

**Backend data layer: GOOD for SME scale.** The health migration (`2026_06_22_000001`) adds exactly the composite indexes the hot paths need: `jobs(status,is_featured,created_at)` (matches the listing sort `JobController.php:69`), `jobs(company_id,status)`, `subscriptions(company_id,status)`, `applications(candidate_id,stage)`/`(job_id,stage)`, plus unread-notification and payment-status indexes. Controllers eager-load with column-scoped `with(...)` — no obvious N+1 in reviewed reads. Search is leading-wildcard `LIKE '%term%'` (`JobController.php:37-41`) — non-sargable; a non-issue now, a scan risk at 10k+ jobs (add FULLTEXT then, **not** a search engine now).

**Frontend: POOR — the dominant user-facing cost.** Runtime Babel compilation of 96–482 KB JSX per dashboard on every load (H-5), forced `no-store` on `.jsx`/`.html` defeating all caching (H-5), and CDN-only React/Babel/Lucide with no SRI or fallback (H-1). Worst on the low-end Android hardware typical of the target market. Highest-ROI fix; needs a one-time build step.

**Write-on-read + blocking fanout (Medium):** `Subscription::expireOverdue()` runs on **every** public `GET /api/jobs` (`JobController.php:25`) — redundant with the hourly command, keeps the hottest endpoint write-capable and non-cacheable. Post-publish social + alert fanout runs synchronously in `app()->terminating()` (`JobController.php:347-365`); on Apache+mod_php (the documented deploy) `terminating()` does **not** free the client early, so publishing can block a PHP worker for tens of seconds (LinkedIn 15+30+15s, Facebook 20s, Telegram 20s + per-recipient SMTP loop).

---

## 6. Database Report

- **Money columns are `decimal(10,2)`** (`payments.amount`, `plans.price` — `create_core_tables.php:153,179`) but the `Payment` model **casts `amount` to `float`** (`Payment.php:17-21`), and money flows as `(float)` throughout. Works today (2-dp columns + `round()`), but it is the money-in-float anti-pattern and will drift if proration/tax/multi-line totals are ever added. See M-4.
- **Per-record currency, no FX.** Each `Plan` carries a fixed `currency` copied onto the `Payment` (`PaymentController.php:176-177`). "Dual-currency" = "per-record currency"; there is no KHR↔USD conversion anywhere and no single currency service (M-4/M-6).
- **Indexes: good** (see §5). `queue_jobs` + `failed_jobs` tables present (53 migrations listed).
- **Invoice numbering:** `INV-YYYY-####` derived from `MAX(SUBSTRING(...))+1` via `selectRaw`, duplicated in two controllers (`JobController.php:640`, `PaymentController.php:725`); the boost path's `lockForUpdate` runs outside a transaction → ineffective (M-5). **Verify a UNIQUE index on `payments.invoice_no`** — if absent, concurrent boosts mint duplicate invoice numbers; if present, one request 500s.
- **Concurrency-safe** where it matters: unique index + `insertOrIgnore` for applications and saved-jobs (`ApplicationController.php:51-63,276`).

---

## 7. UI/UX Report

- **Employer logged out hourly** — broken session refresh (H-3). Highest-visibility UX defect for paying customers.
- **Public job discovery caps at ~50 jobs** — client-side filtering over a single capped fetch (C-4). Jobs beyond the cap are invisible in search/browse/filters.
- **Upgrading hides your live jobs** until payment clears (H-6) — actively punishes the conversion moment.
- **i18n only on the public site** — candidate dashboard has **zero** `KRAMA_T` calls, employer uses it twice, admin is internal-only; all API/validation/email text is English (M-9). A logged-in user who switched to Khmer still sees English.
- **Salary filter is currency-blind** — a "≥ $1,500" filter passes a KHR 500,000/mo (~$125) job and can exclude a real USD job (M-6).
- **Apply with no CV succeeds silently** — no prompt to upload first; employer sees `has_cv=false` (L-6).
- **Company approval sends no notification** to the employer, inconsistent with job approve/reject which do (L-8).

---

## 8. API Report

- **Consistent JSON envelope** via `Handler.php` (validation/auth/HTTP/500), debug-gated — good.
- **Route gating is clean**: public / `auth:api` / permission-gated `admin/*`; per-route throttles are thoughtfully tuned (subscribe 5/min, apply 20/min, uploads 10–20/min, webhooks 60–120/min).
- **Client contract is inconsistent** across the four hand-copied JS clients: different token keys (`krama_access_token` vs `krama_employer_token` vs `krama_admin_token`), different refresh strategies (admin=body/correct, employer=header/broken, public+candidate=none), and three different error shapes. Every dashboard must handle errors differently (M-3).
- **Read endpoints are non-idempotent**: `GET /api/jobs` and `GET /api/employer/subscription` perform writes (expiry sweeps) as a side effect (M-8).
- **Public search endpoint exists and is correct but unused** by the public site (C-4) — the server clamps `per_page` to 50 (`JobController.php:71`).

---

## 9. Technical Debt

**Duplication / DRY** — four copy-pasted API clients (already caused H-3); duplicate invoice generator (M-5); company resolver + subscription-sort closure duplicated (`JobController.php:643-662,600-608,730-738`); store/update validation pasted (`JobController.php:103-119` vs `143-159`); currency formatting in ≥3 places; three inline copies of subscription expiry.
**Boundaries / SOLID** — no FormRequest layer; fat controllers (JobController 866 lines, PaymentController 731) mixing validation + orchestration + notification + mail; money logic leaks across controllers/services/helpers instead of a `Money` type; `User::hasPermission()` leaks a persistence detail (relation-loaded state) into an authz decision (`User.php:61-66`).
**Consistency** — divergent client error/token/refresh; two-tier permission pattern applied unevenly (`CvMatchController` re-checks the same `site_settings` the route group already enforced); uneven i18n.
**Config** — uncustomized example env (`APP_NAME=Laravel`, `DB_DATABASE=laravel`); `composer.json` `minimum-stability: dev` in a payments app; Redis configured but unused.
**Dead code** — `JobController::employerCompany()` self-described legacy alias.

---

## 10. Production Risks (ranked)

0. **Stored XSS (C-S1)** → account takeover including admin, via unsanitized job/company descriptions on public pages. Security. **Top blocker.**
1. **Scheduler has no prod trigger** → payments not reconciled, subs/boosts never expire (H-1 below). Money.
2. **Queue worker has no prod trigger** → verification emails enqueued, never sent (M-1). Signup.
3. **Frontend recompiles in-browser + `no-store`** → slow/fragile on mobile (H-5). Perf.
4. **CDN-only libs, no SRI/fallback** → whole site breaks on unpkg outage; supply-chain risk to admin sessions (H-1-fe). Availability + security.
5. **Shared secrets across envs** (H-4). Security.
6. **No monitoring/alerting** → all of the above fail silently (M-10).
7. **No CI/CD, no build/optimize, no rollback, no tested backup** (M-11, M-13).

---

## 11. Deployment Readiness

**NOT ready as documented.** The two load-bearing background mechanisms (scheduler for money reconciliation + expiry; queue for verification email) have **no documented way to run** on the intended cPanel host and will fail silently. Deploy is a manual file copy with stale docs (`DEPLOY.md:8` literally says "There is no backend API code yet" — false), no `config:cache`/`route:cache`, no rollback path, no tested backup, no uptime/error monitoring. Security headers/CSP are applied only to API JSON, not to the static HTML pages that actually execute scripts.

---

## 12. Go-Live Checklist (blocking items in **bold**)

**Secrets & env**
- [ ] **Generate unique `APP_KEY` + `JWT_SECRET` on the server; blank them in the template; rotate prod (H-4).**
- [ ] `APP_ENV=production`, `APP_DEBUG=false`, `LOG_LEVEL=warning` (M-12).
- [ ] `CORS_ALLOWED_ORIGINS`/`FRONTEND_URL` = real origin; fill `APP_PUBLIC_PATH` (L-4).

**Background processing**
- [ ] **Cron `* * * * * php artisan schedule:run` installed + verified (H-1); confirm a pending payment flips within 3 min.**
- [ ] **Queue worker running OR `QUEUE_CONNECTION=sync` in prod (M-1); confirm verification email sends.**
- [ ] Heartbeat alert if scheduler/worker stalls (M-10).

**Security (blocking)**
- [ ] **Fix stored XSS (C-S1) — DOMPurify on all three `dangerouslySetInnerHTML` sinks, sanitize on write, add a CSP to the static UI pages.**
- [ ] **Fix privilege escalation in `adminCreateUser` — restrict privileged target roles to `manage_roles` holders (H-2).**
- [ ] **Fix Stripe webhook binding (H-S2) — verify session amount/`client_reference_id` against the payment + add `Stripe-Signature`; keep card off until done.**
- [x] ~~Run the dedicated security pass~~ — **complete** (`02-security.md`).
- [ ] Fix employer token refresh (H-3). Reset `email_verified_at` on email change (M-7). Confirm `register`/`updateMe` do not mass-assign `role_id` (L-9). Add a spend cap + auth to the LLM chat proxy (M-S1). Strip secrets from all public settings groups (L-1).

**Functional (blocking core workflows)**
- [ ] **Wire the public job list to the server search/pagination endpoint (C-4).**
- [ ] **Stop hiding a company's live jobs when it starts a paid (pending) subscription (H-6).**
- [ ] Wrap boost payment creation in a transaction; add UNIQUE on `invoice_no` (M-5). Preserve `claude_api_key`/`gemini_api_key` on blank save (M-2). Add a credit re-check/lock to CV-match run (M-3-cv).

**Performance / reliability**
- [ ] Frontend build step; drop Babel-standalone; hashed bundles + long-cache; self-host or SRI-pin libs (H-5, H-1-fe).
- [ ] Remove per-request `expireOverdue()` from the public listing; make it cacheable (M-8).
- [ ] Resize/optimize `UploadController` images; enable `mod_deflate`/`mod_expires` (M-5-perf).
- [ ] Move social/alert fanout to the queue (M-14).
- [ ] Uptime monitor on `/health`; Slack/Sentry error alerting (M-10). Security headers on the static UI origin (M-11-csp). `robots.txt` disallow API origin (L-5). Automated daily DB+uploads backup + **one restore drill** (M-13). Real deploy runbook (M-11).

---

## 13. Quick Wins (<1 day each)
- **Employer refresh (H-3):** send `body: JSON.stringify({refresh_token})`, drop the header (one line — `employer-dashboard/api.js:20-22`).
- **Escalation (H-2):** add a role-allowlist guard in `adminCreateUser` (a few lines).
- **Email verify reset (M-7):** null `email_verified_at` + re-dispatch in `updateMe`.
- **CV-match keys (M-2):** add `claude_api_key`, `gemini_api_key` to `SECRET_KEYS` (`SettingController.php:126-133`).
- **Env hygiene (H-4, M-12):** blank template secrets; `LOG_LEVEL=warning`; `minimum-stability: stable`.
- **Scheduler cron (H-1)** + **`QUEUE_CONNECTION=sync` (M-1):** one crontab line + one env change.
- **Remove per-request expiry sweep (M-8);** **`robots.txt` disallow API (L-5);** add `manage_roles`-style guard, strip secrets from public groups (L-1).
- **Add UNIQUE on `payments.invoice_no`** and wrap boost creation in a transaction (M-5).

## 14. Long-Term Improvements
- One-time frontend build (esbuild/vite), self-hosted hashed bundles, drop runtime Babel (H-5, H-1-fe).
- Extract one shared front-end API client (kills the whole H-3 bug class).
- Introduce a `Money`/`Currency` service + integer minor units; route KHQR/Stripe/social/API through it (M-4/M-6).
- FormRequest layer; `InvoiceNumber` service; de-dupe controller helpers; fix `hasPermission()`.
- Complete i18n for candidate/employer dashboards + localize API/email strings (M-9).
- CI (lint + `php artisan test`), deploy runbook with rollback, automated tested backups, monitoring/alerting.
- Rethink the "every job is reviewed" promise vs company-admins publishing directly (M-15).

---

## 15. COVERAGE LEDGER (mandatory)

### 15a. Source audit files
| File | Status | Note |
|---|---|---|
| `audit/01-architecture.md` | **Read fully** | 14 findings F1–F14 merged |
| `audit/02-security.md` | **Read fully** | 1 critical / 3 high / 3 medium / 3 low; C-S1 XSS + H-S2 Stripe merged, H-2/H-4/M-7/L-1/L-9 confirmed |
| `audit/03-functional.md` | **Read fully** | 14 findings F1–F14 merged |
| `audit/04-production.md` | **Read fully** | H-1..H-5, M-1..M-8, L-1..L-4 merged |

### 15b. Code re-verified THIS run (fresh reads)
| Artifact | Lines read this run | Used to confirm |
|---|---|---|
| `database/seeders/DatabaseSeeder.php` | 1-174 | **Resolved F3 → H-2**: admin lacks `manage_roles`; `adminCreateUser` escalation real |
| `app/Http/Controllers/UserController.php` | 1-148 | H-2 (create/update authz) |
| `krama/ui_kits/employer-dashboard/api.js` | 1-55 | H-3 refresh sends header, no body |
| `app/Http/Controllers/AuthController.php` | 180-219 | H-3 backend validates body `refresh_token` |
| `.env` / `.env.testing` / `.env.hosting.template` | secret lines | H-4 identical APP_KEY/JWT_SECRET; git-tracked = example only |
| `app/Http/Controllers/SettingController.php` | 80-154 | M-2 (SECRET_KEYS omits claude/gemini), L-1 (public groups no key filter) |
| `app/Http/Controllers/JobController.php` | 22-75, 535-570 | C-4 per_page=50, M-8 write-on-read, M-6 salary filter, M-5 boost no-txn, H-6 listing gate |
| `app/Http/Controllers/PaymentController.php` | 148-187 | H-6 subscribe creates `pending` sub |
| `app/Providers/RouteServiceProvider.php` (grep) | 59-66 | Auth rate limit 5/min (positive) |
| `app/Http/Kernel.php` + `routes/api.php` (grep) | throttle map | Per-route throttles (positive) |
| `app/Models/User.php` | 16-40 | L-9 mass-assignment (`role_id` fillable) |
| raw-SQL grep across controllers/services/models | matches | No SQLi surface (positive) |

### 15c. Reviewed by source passes (not re-opened this run)
| Artifact | By whom | Status |
|---|---|---|
| `PaymentService.php` (1-183) | arch + functional | Read fully — idempotent fulfil, gateway re-verify |
| `ApplicationController.php` (1-363) | functional | Read fully |
| `CompanyController.php` (1-555) | functional | Read fully |
| `Subscription.php` (1-66) | functional + prod | Read fully — `expireOverdue()` |
| `EmployerCvMatchController.php` (1-278) | functional | Read fully — credit race (M-3-cv) |
| `ResumeController.php`, `MessageController.php`, `TelegramController.php` | functional | Read fully |
| `Console/Kernel.php`, `VerifyPendingPayments.php`, `SendEmailVerificationJob.php` | prod | Read fully — H-1/M-1 |
| `Handler.php`, `SecurityHeaders.php`, `ForceHttps.php`, `HealthController.php`, `ReportController.php`, `UploadController.php` | prod/arch | Read fully |
| `Khqr.php` (1-120) | arch + functional | Read fully — correct minor units |
| `config/{queue,logging,cache,app,services}.php` | prod/arch | Read (relevant lines) |
| `.htaccess` (all UI kits + API + uploads) | prod | Read — `no-store` (H-5) |
| Frontend `index.html` (public) | prod | Read fully — runtime Babel, CDN |

### 15d. NOT read by any pass (honest gaps)
| Artifact | Status | Risk of the gap |
|---|---|---|
| Four `app.jsx` bundles (96–482 KB) | Security pass read the `dangerouslySetInnerHTML` sinks (→ C-S1); remainder still not read line-by-line | Client-side authz assumptions in the bundles' non-render logic still unreviewed |
| Dependency CVE / `composer audit` + npm | Not run (no lockfile audit this engagement) | Third-party CVE exposure unquantified — run `composer audit` before launch |
| `AuthController` register/OTP/social/reset internals | Functional read fully; **not re-verified this run for L-9** | Mass-assignment of `role_id` on self-service **UNCONFIRMED** — could be Critical if present |
| `CvMatchService`, `SocialPostService` (full body), `TelegramService`, `SmsService`, `MailConfig`, `EmailTemplates` | Not read / partial | Retry/backoff, prompt-injection in CV match, SSRF in SMS `http_url` unreviewed |
| `ForumThread/Reply/Report/Category`, `Recommendation`, `JobAlert`, `CompanyReview/Follower`, `Banner`, `Location`, `ExperienceLevel`, `Audit`, `Chat`, `Health`, `Team` controllers | Not read | Ownership/IDOR on forum + reviews unverified |
| Role→permission for the **actual production** DB (vs seeder) | Seeder read; live DB not inspected | H-2 assumes seeded perms; a hand-edited prod `admin` role could differ |
| `payments.invoice_no` UNIQUE index existence | Not confirmed | Determines M-5 failure mode (dup rows vs 500) |
| Migrations column detail | Listed (53); index migration read | Column-level nullability assumptions |

---

## 16. Remaining Runtime Tests (human must run before go-live)
0. **C-S1 stored XSS:** as an employer, save a job description of `<img src=x onerror="document.title='XSS'">`; open the public job-detail page as another user → today the payload fires (title changes / cookie exfil possible). After fix: rendered inert. Repeat for company "about" and the employer-dashboard Section.
0b. **H-S2 Stripe bypass:** in Stripe test mode, pay one cheap payment to get a paid `cs_…`; create a second expensive pending payment (invoice `I2`); `POST /api/payments/stripe/webhook {data:{object:{id:"cs_…",client_reference_id:"I2"}}}` → today `I2` flips to paid. After fix: rejected (amount/reference mismatch or bad signature).
1. **H-1 scheduler:** on host, `crontab -l` shows `schedule:run`; create a pending KHQR/ABA payment, confirm it flips to paid within 3 min without a webhook.
2. **M-1 queue:** register a new user with `QUEUE_CONNECTION=database` and no worker → confirm the verification email is stuck in `queue_jobs` (reproduces the bug); then verify the fix (sync or worker) sends it.
3. **H-2 escalation:** as a seeded `admin` (not super_admin), `POST /api/admin/users {role:"super_admin"}` → today expect 201 (bug); after fix expect 403.
4. **H-3 refresh:** log in as employer, force access-token expiry (>60 min or shorten TTL), trigger any authed call → today: forced logout; after fix: silent refresh.
5. **C-4 search cap:** seed 60+ published jobs; confirm the public Find-Jobs page cannot reach jobs past the ~50 server clamp.
6. **H-6 upgrade-hides-jobs:** free-tier employer with live published jobs → `POST /employer/subscribe` (paid, unpaid) → reload public listings → confirm jobs disappear until payment.
7. **M-3-cv credit race:** two parallel `POST /employer/cv-match/run` with balance == cost → confirm negative balance.
8. **L-9 mass-assignment (Critical-if-true):** `POST /auth/register` and `PATCH /auth/me` with an extra `role_id`/`company_id`/`role` field → confirm it is ignored, not persisted.
9. **L-1 public settings:** `GET /api/settings/payment_config` and `/api/settings/social` unauthenticated → confirm no token/secret in the JSON.
10. **M-5 invoice race:** fire two concurrent boost requests → confirm no duplicate `invoice_no` (and confirm the UNIQUE index exists).

---

## SCORES (0–100)

| Dimension | Score | One-sentence justification (against evidence) |
|---|---|---|
| **Code Quality** | **72** | Clean Laravel-8 REST with idempotent payments and server-side webhook re-verification, dragged down by four copy-pasted API clients, float money, and fat controllers with no FormRequest layer (§2, §9). |
| **Security** | **48** | Genuinely strong API baseline (consistent object-level authz / IDOR-clean, secrets excluded from the public settings surface, no SQLi, timing-safe webhook secret, hashing + rate-limiting), pulled down hard by an open **Critical** stored-XSS (C-S1) plus three Highs — admin→super_admin escalation (H-2), Stripe webhook payment bypass (H-S2), and shared cross-env secrets (H-4). The flaws are concentrated and fixable, not architectural. |
| **Performance** | **58** | Backend data layer is well-indexed and N+1-free for SME scale, but the frontend recompiles 96–482 KB of JSX in-browser on every visit with `no-store` and blocking synchronous fanout (§5, H-5, M-14). |
| **Maintainability** | **68** | Consistent error handling, a real scheduler, and clear route grouping, offset by pervasive duplication (clients, invoice gen, expiry sweeps, validation) and no build/CI (§9, M-11). |
| **UX** | **60** | Solid bilingual public site and thoughtful throttling, undercut by hourly employer logout, a ~50-job search ceiling, disappearing jobs on upgrade, and dashboard-only-in-English (§7). |
| **Production Readiness** | **35** | Two load-bearing background processes have no documented way to run on cPanel, no monitoring, no rollback, no tested backup, and shared prod secrets — the app will fail silently on day one (§10, §11). |

---

## OVERALL STATUS: **RED — Not Ready (open Critical)**

**One-line reason:** All four passes are now complete and the security pass surfaced an open **Critical** — stored XSS reaching public visitors and admins (C-S1) — alongside three HIGH security issues (escalation H-2, Stripe payment bypass H-S2, shared secrets H-4) and load-bearing operational gaps (no scheduler/queue trigger → paid customers unfulfilled, verification emails never sent); the go-live gate mandates RED while any Critical is open.

**Exactly what must close to reach ORANGE:** fix the Critical XSS (C-S1: sanitize the three sinks + on write + CSP). **To then reach YELLOW:** (1) fix H-2 escalation, H-S2 Stripe binding, and H-4 secret reuse; (2) confirm L-9 mass-assignment is not exploitable; (3) wire the scheduler cron and the queue (or `sync`) with verification on the host (H-1, M-1); (4) fix the four broken workflows H-3 / C-4 / H-6 / M-5. **GREEN** additionally requires the LLM-proxy spend cap (M-S1), the frontend build step, monitoring, tested backups, `composer audit`, and a real deploy runbook.
