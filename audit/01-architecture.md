# Krama — PASS 1: Architecture & Code Quality Audit

**Scope:** Folder structure, module boundaries, service layer, controllers, models, in-browser React/JSX, custom admin dashboard, dependency wiring, naming, SOLID/DRY/KISS, currency handling, i18n, config/secret hygiene.
**Method:** Static review (reading code). App was **not** run. Every finding cites files opened this run with the exact line range read.
**Date:** 2026-07-23

---

## Stack — Confirmed Against Source (ground-truth re-verified)

| Claim | Verdict | Evidence (file:lines read) |
|---|---|---|
| Laravel 8 (`^8.75`), PHP `^7.3\|^8.0`, platform pinned 8.2 | **CONFIRMED** | `krama-api/composer.json:7-16,63-65` |
| JWT auth (`php-open-source-saver/jwt-auth ^1.4`), spatie permission `^5.0` | **CONFIRMED** | `composer.json:14-15`; `app/Models/User.php:9,35-49` (JWTSubject); `routes/api.php` all-`auth:api` |
| Sanctum installed but NOT the API guard | **CONFIRMED** | `composer.json:12`; no `auth:sanctum` anywhere in `routes/api.php` |
| REST-only, no Inertia/Filament/Meilisearch/Scout | **CONFIRMED** | `composer.json` require block has none; no `config/scout.php` reference; `JobController::index` uses Eloquent `LIKE` (`JobController.php:36-42`) |
| 4 in-browser React kits, Babel-standalone runtime compile, separate `api.js` per kit | **CONFIRMED** | `krama/ui_kits/{public-website,candidate-dashboard,employer-dashboard,admin-dashboard}/api.js` all read |
| Currency dual KHR/USD, KHQR (Bakong) + ABA PayWay + Stripe | **CONFIRMED** | `app/Services/PaymentService.php:16-22`; `app/Helpers/Khqr.php` |
| i18n frontend-only via `KRAMA_T` dict | **CONFIRMED** | `krama/ui_kits/public-website/i18n.js:1-40` |
| No PWA (manifest/service worker) | **CONFIRMED (not audited further)** | no manifest link / SW register in kits (ground-truth, not re-opened this run) |

---

## KRAMA-Specific Questions (answered directly)

### (a) Currency: integer minor units or float?
**Money is handled as decimal/float, NOT integer minor units, and there is no centralized currency service.** VERIFIED.
- DB columns are `decimal(10,2)`: `payments.amount`, `plans.price` — `database/migrations/2026_06_19_000001_create_core_tables.php:153,179` (read).
- The `Payment` model **casts `amount` to `float`** — `app/Models/Payment.php:17-21` (read). Money in a binary float is a latent-precision code smell.
- Stripe conversion does float math: `$unit = (int) round(((float) $payment->amount) * 100)` — `PaymentService.php:131` (read). It works for 2-dp USD because of `round()`, but the representation is float end-to-end.
- **No KHR↔USD conversion exists anywhere.** Each `Plan` carries a fixed `currency` (`create_core_tables.php:154`), copied verbatim onto the `Payment` (`PaymentController.php:176-177`). "Dual-currency" is really "per-record currency" — acceptable, but there is no single FX/format service. The one correct place is `Khqr::amount()` which properly treats KHR as zero-decimal and USD as 2-dp (`app/Helpers/Khqr.php:64-70`, read). Currency **formatting** is scattered (e.g. `SocialPostService::salary()` builds `$`/`KHR` strings in PHP — `SocialPostService.php:87-97`, read; the frontend does its own).

### (b) i18n: single translation layer or hard-coded Khmer?
**Single layer on the public site; inconsistent elsewhere.** VERIFIED.
- One `KRAMA_T`/`t()` dictionary, English-as-source — `i18n.js:1-40` (read). Public-site JSX files all consume it (grep: `home.jsx, jobs.jsx, job-detail.jsx, apply.jsx, auth.jsx, chrome.jsx, pages.jsx, forum.jsx, company-detail.jsx, chat.jsx`).
- **No hard-coded Khmer in component logic**: `grep` for Khmer codepoints `\x{1780}-\x{17FF}` across all four `app.jsx` = **0** chars; the only match is `chrome.jsx:96,98` — the language-toggle label "ភាសា" (intentional). VERIFIED.
- **Gap:** `candidate-dashboard/app.jsx` has **0** `i18n`/`KRAMA_T` references, `employer-dashboard/app.jsx` uses it only partially, `admin-dashboard/app.jsx` = 5 (internal tool, English-only acceptable). Candidate-facing dashboard is English-only despite a bilingual product. (Finding F9.)

---

## FINDINGS (severity + confidence)

### F1 — Employer dashboard token refresh is broken (wrong request shape) — **HIGH / VERIFIED**
`employer-dashboard/api.js` `refreshToken()` POSTs `/auth/refresh` with the refresh token in the **Authorization header and no body**:
```
_refreshing = fetch(BASE + "/auth/refresh", { method:"POST",
  headers:{ "Content-Type":"application/json", Authorization:"Bearer "+refreshTok } })
```
(`krama/ui_kits/employer-dashboard/api.js:15-33`, read). But the backend **validates `refresh_token` from the request body**: `$request->validate(['refresh_token' => 'required|string'])` — `AuthController::refresh` (`app/Http/Controllers/AuthController.php:190-192`, read). With no body the request fails validation (422), so `refreshToken()` always hits its `!r.ok` branch, **clears the tokens and rejects with "Session expired."** (`api.js:26`). The token is correctly stored (`api.js:6,28,68`) but never usable.
**Effect:** every employer is force-logged-out when the 60-minute access token (`JWT_TTL=60`, `.env.example`) expires; the refresh feature is dead code. The admin client does it correctly (`admin-dashboard/api.js:24-28` sends `body: JSON.stringify({ refresh_token: rt })`), proving the divergence.
**Fix:** send `body: JSON.stringify({ refresh_token: refreshTok })` (drop the header). Better: unify all clients on one shared client (F4).
**REQUIRES RUNTIME TEST** to see the UX: log in as employer, wait for/force access-token expiry, trigger any authed call, observe forced logout instead of silent refresh.

### F2 — Money stored/computed as float, not integer minor units — **MEDIUM / VERIFIED**
`Payment::$casts['amount'] => 'float'` (`Payment.php:17-21`); Stripe path multiplies a float by 100 (`PaymentService.php:131`); plan/boost prices flow as `(float)` throughout (`PaymentController.php:186,196-197`; `JobController.php:552,570,604-605`). No amounts are ever represented as integer cents/riel in the domain. Works today thanks to `round()` and 2-dp columns, but it is the classic money-in-float anti-pattern and will drift if arithmetic (proration, tax, multi-line totals) is ever added.
**Fix:** store/compute in integer minor units (or `decimal` casts via `bcmath`/a `Money` value object) and format only at the edges.

### F3 — No centralized currency layer; formatting duplicated — **MEDIUM / VERIFIED (dup: LIKELY)**
Currency correctness lives in three unrelated places instead of one service: `Khqr::amount()` (correct minor-unit logic, `Khqr.php:64-70`), `PaymentService::stripeCreateSession` (its own cents math, `PaymentService.php:130-131`), and `SocialPostService::salary()` (its own symbol/format, `SocialPostService.php:87-97`). The public/employer JSX add a fourth (frontend format). There is no single `Money`/`Currency` service. **LIKELY** duplication of the symbol/format rule between PHP and JSX.
**Fix:** one backend currency service (minor-unit ↔ display, zero-decimal awareness for KHR) reused by KHQR, Stripe, social, and API responses; one frontend formatter.

### F4 — Four copy-pasted API clients with divergent behavior — **MEDIUM / VERIFIED**
`public-website/api.js`, `candidate-dashboard/api.js`, `employer-dashboard/api.js`, `admin-dashboard/api.js` each re-implement, by copy-paste: the identical `BASE` host-detection regex, token storage, a `fetch` wrapper, and (some of them) refresh logic. All four opening blocks read this run. They **diverge in ways that cause real bugs and inconsistent UX**:
- **Token keys differ:** public + candidate share `krama_access_token`; employer uses `krama_employer_token`; admin uses `krama_admin_token`. (public `api.js:8-9`, candidate `api.js:5`, employer `api.js:5-6`, admin `api.js:5-6`.)
- **Refresh differs:** admin = body (correct); employer = header (broken, F1); **candidate & public have NO refresh at all** (`grep refresh candidate-dashboard/api.js` = 0). Candidate session simply dies on 401.
- **Error contract differs:** public throws the raw JSON object (`public api.js:31`); candidate throws `new Error(d.message)` (`candidate api.js:16-17`); employer/admin flatten `errors` into a `; `-joined string (`employer api.js:44-47`). Every `app.jsx` must therefore handle errors differently.
**Fix:** extract one shared `krama-client.js` (base, storage-key parameterized, one `req`, one refresh, one error shape) loaded by all kits.

### F5 — Write side-effects inside GET requests + redundant expiry sweeps — **MEDIUM / VERIFIED**
Subscription expiry + job-closing is executed as a side effect of read endpoints and re-implemented three ways:
- Public **`GET /api/jobs`** calls `Subscription::expireOverdue()` (a write) on **every unauthenticated request** — `JobController::index` (`JobController.php:24-25`, read).
- **`GET /api/employer/subscription`** expires subs and closes jobs inline — `PaymentController::mySubscription` (`PaymentController.php:27-39`, read).
- `JobController::enforceJobPostLimit` re-implements the same expire+close block inline again (`JobController.php:706-721`, read).
Meanwhile scheduled commands already do this: `subscriptions:expire` hourly, `jobs:expire`/`features:expire` daily, `payments:verify-pending` every 3 min — `app/Console/Kernel.php:20-26` (read). So the inline sweeps are **redundant**, make GETs non-idempotent, and add write load to the hottest public endpoint.
**Fix:** rely on the scheduler (or a cache-gated debounce); make read endpoints read-only. Route all expiry through the single `Subscription::expireOverdue()` API rather than three inline copies.

### F6 — Duplicated invoice-number generator + ineffective lock — **MEDIUM / VERIFIED (race: LIKELY)**
`PaymentController::nextInvoiceNo()` (`PaymentController.php:720-729`, read) and `JobController::nextBoostInvoiceNo()` (`JobController.php:627-636`, read) are byte-for-byte the same algorithm (`INV-YYYY-####`, `MAX(SUBSTRING(...))+1`). In `subscribe()` it is called inside `DB::transaction` with `lockForUpdate` (OK — `PaymentController.php:161-183`). In `JobController::boost()` the boost payment is created **without any surrounding transaction** (`JobController.php:539-550`), so the `lockForUpdate()` in `nextBoostInvoiceNo` runs outside a transaction and is a **no-op** → two concurrent boosts can mint the same `invoice_no`. **LIKELY** duplicate-invoice race under concurrency.
**Fix:** one shared `InvoiceNumber` service; wrap the boost payment creation in a transaction (or use a DB sequence / unique constraint + retry).

### F7 — Repeated helpers & dead "legacy alias" — **LOW / VERIFIED**
- `resolveCompany()` exists in `JobController` (`JobController.php:643-656`) and again as `employerCompany()` in `PaymentController` (`PaymentController.php:705-718`) — same logic, two copies.
- `JobController::employerCompany()` is a self-described **dead "legacy alias"** delegating to `resolveCompany()` (`JobController.php:658-662`).
- The active-subscription **sort closure is duplicated verbatim** in `activeSubscriptions()` and `enforceJobPostLimit()` (`JobController.php:600-608` and `730-738`).
**Fix:** move company resolution + subscription ordering into a `Company`/`Subscription` method or a small service; delete the alias.

### F8 — No FormRequest layer; validation arrays duplicated — **LOW / VERIFIED**
`app/Http/Requests` **does not exist** (`ls` = "No such file or directory"). Every controller validates inline. `JobController::store()` and `update()` carry ~15 **identical** rules each (`JobController.php:103-119` vs `143-159`, read). Plan `store`/`update` likewise near-duplicate (`PaymentController.php:519-530` vs `544-555`).
**Fix:** extract `FormRequest` classes (`StoreJobRequest`, `UpdateJobRequest`, `PlanRequest`) to centralize and DRY the rules.

### F9 — Inconsistent i18n coverage across kits — **LOW / VERIFIED**
Public site fully bilingual; **candidate dashboard has zero i18n** (`grep KRAMA_T candidate-dashboard/app.jsx` = 0), employer partial, admin internal-only. A logged-in candidate switching to Khmer keeps an English dashboard.
**Fix:** load `i18n.js`/`KRAMA_T` in the candidate (and complete the employer) dashboard, or extract a shared i18n module used by all user-facing kits.

### F10 — `User::hasPermission()` fails silently unless relation pre-loaded — **LOW / VERIFIED**
`hasPermission()` returns `false` whenever `role.permissions` is not already loaded: `return $this->role && $this->role->relationLoaded('permissions') && ...` (`User.php:61-66`, read). Correctness depends on every caller hydrating the relation first (the base `Controller::requirePermission` does — `Controller.php:28-29`). Any future caller that forgets gets a silent, misleading 403 rather than an authoritative check.
**Fix:** load the relation on demand inside `hasPermission()` (or eager-load on the auth guard) instead of treating "not loaded" as "no permission".

### F11 — Two-tier permission pattern applied inconsistently — **LOW / VERIFIED**
The intended design is a coarse route-group gate + a finer action check. It's finer-grained in payments (`manage_payments`/`manage_plans`, `PaymentController.php:223,477,507`) but a **pure duplicate** elsewhere: `CvMatchController::compare/suggest` re-check `requirePermission('site_settings')` — the exact permission the route group already enforced (`CvMatchController.php:14,38` vs `routes/api.php:242`). Dead double-check, and it muddies whether the second tier means anything.
**Fix:** make the second check genuinely finer-grained (e.g. `run_cv_match`) or drop it.

### F12 — Config not customized; risky composer setting — **LOW / VERIFIED**
`.env.example` still ships generic skeleton values: `APP_NAME=Laravel`, `DB_DATABASE=laravel`, `MAIL_HOST=mailhog`, `APP_DEBUG=true` (`.env.example`, read). `composer.json` sets `"minimum-stability": "dev"` (`composer.json:67`) — pulls dev releases of transitive deps into a payments app. **No secrets are committed** (`.env` is git-ignored: `.gitignore` lists `.env`; `git ls-files` shows only `.env.example`; no `sk_live`/`AKIA`/private keys in `app/` or `config/` — the one `sk_live_…` hit is a placeholder in an admin `<Input>`, `admin-dashboard/app.jsx:4804`). Runtime secrets correctly resolve via `env()` in `config/services.php` (read) and via the DB `Setting` table for gateway keys.
**Fix:** brand the example env; set `minimum-stability: stable` (or `prefer-stable` with pinned versions).

### F13 — Public settings group whitelist — verify `social` payload — **LOW / HYPOTHESIS**
`SettingController::publicGroup` whitelists `['homepage,chat,brand,home_content,social,payment_config']` and strips only `chat`'s `apiKey/endpoint/system_prompt` (`SettingController.php` publicGroup, read). Social **tokens** live in the `social_post` group (not public) per `SocialPostService::settings()` (`SocialPostService.php:18-20`), and KHQR merchant account in `payment_config` is public-by-design (comment at `PaymentController.php:246-251`). **Confirm** the `social` group holds only profile links, never a `*_token`. Open: the `social` settings seeder/rows.

### F14 — Minor correctness/UX smells — **LOW / LIKELY**
- `GET /api/jobs` `salary_min` filter compares against `salary_max` only (`JobController.php:64-66`): a job with only `salary_min` set (null `salary_max`) is excluded from any salary filter. LIKELY minor filtering bug.
- `JobController::show()` increments views in DB then also mutates `$job->views += 1` for the response (`JobController.php:89-91`) — harmless but redundant/racy for display.

---

## Technical-Debt List (grouped)

**Duplication / DRY**
- 4× copy-pasted API clients (F4) — highest-leverage debt; already caused F1.
- Duplicate invoice generator (F6), company resolver + subscription sort closure (F7), store/update validation (F8), currency formatting (F3).
- Three inline copies of subscription-expiry logic (F5).

**Boundaries / SOLID**
- No FormRequest layer; controllers do validation + orchestration + notification + mail inline (JobController is 866 lines; PaymentController 731). Fat controllers.
- Money/currency logic leaks across controllers, services, and helpers instead of a `Money`/`Currency` type (F2/F3).
- `User::hasPermission()` leaks a persistence detail (relation-loaded state) into an authorization decision (F10).

**Consistency**
- Divergent client error contracts and token/refresh strategies (F4).
- Two-tier permission pattern applied unevenly (F11).
- i18n coverage uneven (F9).

**Correctness risk**
- Broken employer refresh (F1), invoice race in boost path (F6), salary filter (F14).

**Config**
- Uncustomized example env, `minimum-stability: dev` (F12).

**Dead code**
- `JobController::employerCompany()` legacy alias (F7).

## What is GOOD (do not "fix")
- Centralized JSON error handling for `api/*` — `app/Exceptions/Handler.php` (read): consistent validation/auth/HTTP/500 shapes, debug-gated traces.
- Webhooks never trust their payload; they re-verify server-side (ABA `check-transaction-2`, Stripe session fetch, Bakong md5) — `PaymentController.php:337-429`, `PaymentService.php:64-182`.
- `PaymentService::fulfill()` is idempotent (guards on `status==='pending'`), safe across manual/verify/webhook paths (`PaymentService.php:30-57`).
- KHQR minor-unit handling is correct (KHR zero-decimal, USD 2-dp) — `Khqr.php:64-70`.
- CV-match admin controller delegates to the shared `CvMatchService::score()` — no duplicate scorer (`CvMatchController.php:59-73`; service signatures `CvMatchService.php:15`).
- Post-publish notifications deferred via `app()->terminating()` so slow SMTP/social never block the request (`JobController.php:332-358`) — pragmatic for `QUEUE_CONNECTION=sync` on shared hosting.
- No secrets committed; runtime secrets via env + DB settings (F12).

## Refactor Recommendations (priority order)
1. **Fix F1 now** (one-line body change) — employers are being logged out hourly.
2. **Extract one shared front-end API client** (F4) — removes the class of bug F1 belongs to and unifies error/refresh/token handling.
3. **Introduce a `Money`/`Currency` service + integer minor units** (F2/F3); route KHQR/Stripe/social/API through it.
4. **Make read endpoints read-only** (F5); rely on the existing scheduler; funnel all expiry through `Subscription::expireOverdue()`.
5. **Add a FormRequest layer** (F8) and a small `InvoiceNumber` service in a transaction (F6).
6. **De-dupe controller helpers** (F7), fix `hasPermission()` (F10), standardize the two-tier permission pattern (F11).
7. **Complete i18n** for the candidate/employer dashboards (F9); brand env + stabilize composer (F12).

---

## Code Quality Assessment

**Grade: B− / "Solid pragmatic mid-senior code with concentrated, fixable debt."**

Justification (one paragraph): The backend is competently built for its constraints — a clean Laravel-8 REST API with genuinely good instincts where they matter most: centralized JSON error handling, idempotent payment fulfillment, webhooks that re-verify server-side rather than trusting payloads, correct KHQR minor-unit math, and a real scheduler for lifecycle jobs. The weaknesses are not architectural rot but **duplication and inconsistency**: four hand-copied front-end API clients that have already drifted into a live bug (the employer refresh sends the token in the wrong place and silently logs users out), money represented as float rather than integer minor units with no single currency service, three inline re-implementations of subscription expiry (some inside GET handlers that should be read-only), a duplicated invoice generator with an ineffective lock on the boost path, no FormRequest layer so ~15-rule validation blocks are pasted per action, and uneven application of i18n and the two-tier permission pattern. None of these are hard to fix and none indicate a broken design — they indicate a codebase that grew feature-by-feature without a consolidation pass. Extracting a shared API client, a currency/Money type, an invoice service, and a FormRequest layer, plus making reads read-only, would lift this to a confident B+/A− with little structural upheaval.

---

## COVERAGE LEDGER

| Artifact | Status | Notes |
|---|---|---|
| `composer.json` | **Read fully** | Laravel 8.75, JWT, spatie; `minimum-stability:dev` |
| `routes/api.php` | **Read fully (1-336)** | All route groups reviewed |
| `app/Http/Controllers/Controller.php` | **Read fully** | `requirePermission`, `auditLog` |
| `app/Http/Controllers/PaymentController.php` | **Read fully (1-731)** | Currency, subscribe, webhooks, admin CRUD |
| `app/Http/Controllers/JobController.php` | **Read fully (1-866)** | Search, publish, boost, quota, alerts |
| `app/Http/Controllers/CvMatchController.php` | **Read fully** | Delegates to service (good) |
| `app/Http/Controllers/SettingController.php` | **Partial** | `publicGroup` read; SMTP/SMS/social test methods NOT read |
| `app/Http/Controllers/AuthController.php` | **Partial** | `refresh` read fully; login/register/OTP/social/reset NOT deep-read |
| `app/Services/PaymentService.php` | **Read fully** | Float cents; re-verify pattern |
| `app/Services/SocialPostService.php` | **Read fully** | Self-contained; hardcoded API versions |
| `app/Services/CvMatchService.php` | **Signatures only** | Method list read; scoring internals NOT deep-read |
| `app/Services/TelegramService.php` | **Not read** | Referenced only |
| `app/Services/SmsService.php` | **Not read** | — |
| `app/Models/User.php` | **Read fully** | `hasPermission` fragility (F10) |
| `app/Models/Payment.php` | **Read fully** | `amount => float` cast (F2) |
| `app/Models/Subscription.php` | **Not read** (behavior inferred from callers) | `expireOverdue()` referenced, not opened |
| `app/Models/Plan.php`, `Job.php`, others | **Not read** | Column types via migration instead |
| `database/migrations/...create_core_tables.php` | **Partial (140-199)** | plans/subscriptions/payments/banners cols |
| Other migrations | **Listed only** | Names reviewed for plan/payment/subscription changes |
| `app/Exceptions/Handler.php` | **Read fully** | Consistent JSON errors (good) |
| `app/Console/Kernel.php` | **Read fully** | Scheduler proves F5 redundancy |
| `app/Console/Commands/*` | **Listed only** | 6 commands enumerated, bodies NOT read |
| `app/Helpers/Khqr.php` | **Read fully** | Correct minor-unit handling |
| `app/Helpers/{EmailTemplates,MailConfig,Phone}.php` | **Not read** | Referenced from JobController |
| `config/services.php` | **Read fully** | env-based, no secrets |
| `.env.example` / `.gitignore` | **Read fully** | No committed secrets; generic values |
| `krama/ui_kits/public-website/api.js` | **Partial (1-55) + grep** | Core wrapper, no refresh |
| `krama/ui_kits/candidate-dashboard/api.js` | **Partial (1-55) + grep** | No refresh, shares public token key |
| `krama/ui_kits/employer-dashboard/api.js` | **Partial (1-55) + grep** | Broken refresh (F1) |
| `krama/ui_kits/admin-dashboard/api.js` | **Partial (1-55)** | Correct refresh (body) |
| `krama/ui_kits/*/app.jsx` (4 files, 96–481KB) | **Grepped only** | Khmer scan (0 hardcoded), i18n-ref counts; NOT read line-by-line (too large — recorded as unread) |
| `krama/ui_kits/public-website/i18n.js` | **Partial (1-40)** | Structure confirmed |
| `krama/ui_kits/public-website/chrome.jsx` | **Grepped** | Only Khmer = toggle label |
| Forum/Message/Company/Application/Resume/Team/Notification/Banner/etc. controllers | **Not read** | Out of time budget; behavior partly inferred from routes. Recorded as gaps. |

**Honest gaps:** the four large `app.jsx` bundles were analyzed by targeted grep, not full read (size); `Subscription` model, most secondary controllers (Forum*, Message, Company, Application, Resume, Team, Notification, Banner, Category, Location, ExperienceLevel, User, Report, Audit, Chat, Telegram, EmployerCvMatch), and `Telegram/Sms` services were not opened this run. Findings are scoped to files actually read; no line numbers are cited for unread files.
