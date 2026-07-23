# Krama — PASS 3: Functional Verification (QA + Product Owner)

**Scope:** Static code review (app not executed). Every finding cites a file opened this run with the line range read. Confidence tags: **VERIFIED** (read exact code, issue present) / **LIKELY** (strong inference) / **HYPOTHESIS** (risk to check). Runtime-only claims are tagged **REQUIRES RUNTIME TEST** with steps.

**Stack confirmed this run:** Laravel 8 REST API (`krama-api/composer.json`: `laravel/framework ^8.75`, `php ^7.3|^8.0`, platform pinned `8.2.0`, `php-open-source-saver/jwt-auth ^1.4`; **no** scout/meilisearch/filament/inertia). JWT auth (`config/auth.php` guard=api driver=jwt — inferred from recon, not re-opened). Search = plain Eloquent `LIKE` (`JobController::index`). Frontends = runtime-Babel React kits. **No PWA** (grep of all `ui_kits/*/index.html` for manifest/serviceWorker/sw.js = none). PWA / offline / cache-invalidation checks **SKIPPED — component does not exist.** Meilisearch checks **SKIPPED — not installed.** Filament checks **SKIPPED — admin is custom React.**

---

## 1. Coverage Ledger

| Artifact | Path | Status | Notes |
|---|---|---|---|
| Routes | `krama-api/routes/api.php` (1–336) | **Read fully** | All route groups traced |
| AuthController | `app/Http/Controllers/AuthController.php` (1–608) | **Read fully** | register/login/OTP/refresh/reset/social/verify/avatar |
| ApplicationController | `app/Http/Controllers/ApplicationController.php` (1–363) | **Read fully** | apply/withdraw/pipeline/CV download |
| JobController | `app/Http/Controllers/JobController.php` (1–866) | **Read fully** | CRUD/publish/quota/boost/alerts |
| PaymentController | `app/Http/Controllers/PaymentController.php` (1–730) | **Read fully** | subscribe/KHQR/ABA/Stripe/refund/admin |
| PaymentService | `app/Services/PaymentService.php` (1–183) | **Read fully** | fulfill()/gateway verify |
| CompanyController | `app/Http/Controllers/CompanyController.php` (1–555) | **Read fully** | CRUD/uploads/admin moderation |
| ResumeController | `app/Http/Controllers/ResumeController.php` (1–194) | **Read fully** | CV upload/download/visibility |
| UserController | `app/Http/Controllers/UserController.php` (1–148) | **Read fully** | admin candidate/user mgmt |
| MessageController | `app/Http/Controllers/MessageController.php` (1–208) | **Read fully** | conversations/polling/unread |
| ReportController | `app/Http/Controllers/ReportController.php` (1–64) | **Read fully** | admin summary metrics |
| Controller (base) | `app/Http/Controllers/Controller.php` (1–46) | **Read fully** | requirePermission()/auditLog() |
| CheckPermission | `app/Http/Middleware/CheckPermission.php` (1–33) | **Read fully** | route-level gate |
| SocialPostService | `app/Services/SocialPostService.php` (1–145) | **Read fully** | FB/LinkedIn/Telegram autopost |
| TelegramService | `app/Services/TelegramService.php` (1–172) | **Read fully** | bot send/webhook |
| User model | `app/Models/User.php` (1–77) | **Read fully** | hasPermission()/JWT |
| Subscription model | `app/Models/Subscription.php` (1–66) | **Read fully** | expireOverdue() |
| Notification model | `app/Models/Notification.php` (1–64) | **Read fully** | record()/recordAdmins() |
| i18n | `krama/ui_kits/public-website/i18n.js` (300–339 + structure grep) | **Partial** | KRAMA_T + KM dict tail read; middle KM entries not line-read |
| admin app.jsx | `krama/ui_kits/admin-dashboard/app.jsx` (270–309) + api.js (165–188) | **Partial** | Overview/fetchStats read; 481KB bulk unread |
| employer app.jsx | `krama/ui_kits/employer-dashboard/app.jsx` (grep of salary/currency/invoice) | **Partial** | 215KB bulk unread; currency lines read |
| candidate app.jsx | not opened | **Skipped/grep-only** | confirmed no KRAMA_T via grep -rl |
| **NOT reviewed** | ForumThread/Reply/Report/Category, EmployerCvMatch, CvMatch, CvMatchService, TeamController, JobAlertController, CompanyFollowerController, BannerController, SettingController, CategoryController, LocationController, ExperienceLevelController, RecommendationController, TelegramController, ChatController, AuditController, NotificationController, UploadController | — | **Gap** — out of time budget; forum/CV-match/settings flows only inferred from route signatures |

---

## 2. Feature Verification Matrix

| Feature | Traced (file:lines) | Predicted result | Requires runtime test |
|---|---|---|---|
| **Register (email)** | AuthController 73–145 | Yes. Requires strong pw (mixedCase+numbers+symbols). Issues JWT + refresh token immediately; email verification dispatched but **not required** to use API. | POST /auth/register {name,email,password}; expect 201 + token; confirm login works pre-verification |
| **Register (phone + OTP)** | 27–71, 91–110 | Yes. request-otp → SMS (or logged in dev). register validates OTP (5-attempt cap, 5-min expiry). Fails closed on missing SMS gateway (logs code). | Request OTP, register with code; test expired code & 6th attempt → 422 |
| **Login (email/phone)** | 147–188 | Yes. Accepts identifier/email/phone; `status!=='active'` blocked; failed logins audit-logged. | Login suspended user → 401; login unverified email → succeeds (verification not gated) |
| **Password reset** | 379–463 | Yes. Generic response (no user enumeration), 60-min token, revokes all sessions on reset. | Reset with expired/invalid token → 422 |
| **Social login** | 467–569 | Yes. Server-side token verify; Google audience check; requires provider email. New users → candidate. | Google token minted for other app → 401 (audience mismatch) |
| **Post a job (draft)** | JobController 96–130 | Yes. `post_jobs` perm; resolveCompany (any status). No quota at draft. | — |
| **Submit/publish job** | 195–225 | Company owner → **auto-published** (quota enforced). Recruiter → company_pending. | See Finding F-02 (no company-approval gate) & F-08 (quota race) |
| **Edit / close job** | 133–174, 391–400 | Edit only draft/pending/rejected. Close sets `closed` (frees quota slot). | Edit published job → 422 |
| **Search & filter** | 24–75 | Yes. Eloquent `LIKE '%term%'` on title + company name; category/location/type/level/remote/salary_min filters; featured-first sort. | Khmer term search — F-11; `%like%` cannot use index at scale (perf) |
| **Apply to job** | ApplicationController 20–109 | Yes. `apply_jobs` perm; auto-attaches primary resume; `insertOrIgnore` prevents duplicate race; notifies employer (in-app+Telegram+email **synchronously**). | Concurrent double-apply → one 201 one 422 (OK). See F-06 (sync mail blocks request) |
| **Withdraw application** | 112–126 | Yes, only while stage=`applied`. | Withdraw reviewed app → 422 |
| **Upload CV** | ResumeController 90–118 | Yes. pdf/doc/docx ≤5MB, private disk, replaces old file. | Upload .exe → 422; verify old file deleted |
| **CV download (employer)** | 322–361 | Yes. Ownership-scoped; honors `cv_visibility=private` → 403; streams private file. | Employer downloads CV of applicant to another company's job → 404 |
| **Application pipeline** | 199–249 | Yes. Stages reviewed/shortlisted/interview/offered/rejected; notifies candidate (in-app + sync email). | — |
| **Employer dashboard (billing/quota)** | PaymentController 22–108 | Yes. Auto-expires overdue subs, per-subscription quota rows, one-time free-plan tracking. | — |
| **Candidate dashboard** | routes 128–169 | Yes (applications/saved/alerts/resume). **English-only** — F-05. | — |
| **Notifications — in-app** | Notification 24–63 | Yes. record()/recordAdmins() (bulk insert to admin/super_admin). | — |
| **Notifications — Telegram** | ApplicationController 81–87; TelegramService 89–108 | Yes. No-op unless enabled+linked. New-application DM sent **synchronously in apply** (F-06). | — |
| **Notifications — Facebook/LinkedIn (job autopost)** | SocialPostService 32–70 | Yes. Deferred to `app()->terminating()`; gated by enabled+share_social+not-already-posted. | Verify social_posted_at prevents re-post on re-publish |
| **Notifications — email** | JobController 332–358 (deferred) vs ApplicationController 90–103 (sync) | Publish emails deferred; **apply/stage emails sent in-request** (F-06). | Slow SMTP → measure apply latency |
| **Payment success** | PaymentController 279–335; PaymentService 30–57 | Yes. verify/webhook re-verify server-side; `fulfill()` idempotent (pending-only guard). | KHQR/ABA/Stripe happy path each |
| **Payment failure/pending** | 234–335 | Correct. Unconfigured gateway → `pending, configured:false`; never falsely marks paid. | Verify with no bakong_token → stays pending |
| **Expired/unpaid job posting** | JobController 706–767; Subscription 27–45 | Correct. No active sub → 422; overdue subs expired + jobs auto-closed on listing/quota check. | Post with only pending (unpaid) sub → 422 |
| **Concurrent applications** | ApplicationController 51–63 | Safe via `insertOrIgnore` (needs DB unique index on job_id+candidate_id). | Confirm unique constraint exists in migration |
| **Admin: approve/reject job** | JobController 285–389 | Yes. Assigns primary sub; admin can exceed quota; reject nulls published_at. | — |
| **Admin: company approve/reject/suspend/verify** | CompanyController 439–490 | Works, **but suspend/reject does NOT cascade to jobs** — F-01. | Suspend company → its published jobs still in /jobs |
| **Admin: users/candidates** | UserController 15–147 | Yes. Suspend candidate; create/update user; role change needs `manage_roles`. | — |
| **Admin: plans/subscriptions** | PaymentController 504–702 | Yes. Reactivation resets featured credits; manual expire closes jobs. | — |
| **Admin: payments mark-paid/refund** | 219–232, 431–456 | Yes. Refund un-features boosted job / refunds subscription. | — |
| **Admin: revenue KPI** | admin api.js 167–188; app.jsx 284/294 | **Broken** — F-03 (mixed-currency sum) + F-04 (first-page only, mislabeled MTD). | — |
| **Admin: monthly chart / candidates card** | admin app.jsx 273–294 | **Mock data** — F-09 (hardcoded BARS + "--" candidates + "2026" badge). | — |
| **Messaging** | MessageController 55–106 | Yes. Candidate→employer gated by `allow_candidate_messages`; employer→candidate open; self/same-role → 422. | — |
| **Khmer/English i18n** | i18n.js 319–339; grep of kits | Partial — F-05 (admin+candidate kits English-only; KM dict falls back to English on missing keys). | Switch lang=km on candidate dashboard → all English |
| **Currency consistency** | employer app.jsx 602/2181; admin 284/4200; SocialPostService 87–97 | Inconsistent — F-03/F-07 ("$" hardcoded for KHR in invoices & revenue; KHR shown with .toFixed(2)). | Create KHR plan/invoice → shows "$" |
| **PWA offline/install** | — | **N/A — no manifest/service worker exists.** | — |

---

## 3. Findings (severity-ordered)

### F-01 — Suspending/rejecting a company does not remove its jobs from the public site — HIGH — VERIFIED
`CompanyController::suspend/reject` (465–476, 452–463) only set `company.status`. `JobController::index` (27–34) filters by `job.status='published'` and *subscription* status, **never** `company.status='approved'`. `JobController::show` (82–87) and `ApplicationController::apply` (25) likewise only check the job is published. **Result:** jobs from a suspended or rejected company remain publicly listed, directly viewable, and applyable. Moderation action on a company has no effect on its live jobs. Failure scenario: admin suspends a fraudulent company → its jobs keep collecting applications.

### F-02 — Company-owner jobs publish live without company approval or platform review — HIGH — VERIFIED (may be intentional; confirm with product)
`JobController::store` (96–130) and `submit` (195–225) call `resolveCompany()` (643–656) which returns a company of **any** status (including `pending`). For a company owner, `submit` sets `status='published'` immediately once any active/trial subscription exists — no `company.status==='approved'` check and no platform admin review. **Result:** a newly-registered employer can create a pending (never-approved) company, activate a free plan, and publish jobs that go live instantly — bypassing both the "every company verified" and "every job reviewed before it goes live" guarantees stated in the public copy (`i18n.js` line 303). Failure scenario: spam employer floods live listings before any admin sees the company.

### F-03 — Admin "Revenue (MTD)" sums mixed KHR + USD into one $-labelled number — HIGH — VERIFIED
`admin-dashboard/api.js` 178–179 reduces `parseFloat(p.amount)` across paid payments **regardless of `p.currency`**; `app.jsx` 284/294 renders it as `"$" + n.toLocaleString()`. Plans/payments may be KHR or USD (`PaymentController::subscribe` uses `plan->currency`; plan editor offers USD/KHR/EUR at app.jsx 4290). **Result:** a KHR 20,000 payment and a USD 50 payment display as "$20,050" — a meaningless, wildly wrong revenue figure. Currency miscalculation.

### F-04 — Revenue KPI counts only the first page of payments and is mislabeled "MTD" — MEDIUM — VERIFIED
Same code path: `req("GET","/admin/payments")` (api.js 173) returns Laravel pagination (default `per_page=20`, `PaymentController::adminIndex` 499). `payments.data` is only the newest 20 rows, and there is no month filter. **Result:** "Revenue (MTD)" is actually "sum of the paid rows among the 20 most recent payments" — understated once >20 payments exist and not month-to-date at all.

### F-05 — Khmer localization absent from admin and candidate dashboards — MEDIUM — VERIFIED
`grep -rl KRAMA_T/KRAMA_LANG` across kits matches only `public-website` and `employer-dashboard`. `admin-dashboard` and `candidate-dashboard` neither load `i18n.js` nor call `KRAMA_T` (their index.html has no i18n script). **Result:** for a "Cambodia-first, Khmer and English as first-class peers" product (i18n.js 304), the **candidate** dashboard — used by the primary end users — is English-only. Even in localized kits, `KRAMA_T` (i18n.js 331–337) silently returns the English source string for any key missing from the KM dict, so coverage is best-effort with no completeness guarantee.

### F-06 — Apply and stage-change block on synchronous email + Telegram sends — MEDIUM — VERIFIED
`ApplicationController::apply` (81–103) calls `TelegramService::notifyChat` (10s HTTP timeout) and `Mail::html(...)` **inline in the request**; `updateStage` (227–243) sends stage email inline. This is inconsistent with `JobController::notifyNewlyPublished` (332–358) which correctly defers to `app()->terminating()`. **Result:** with a slow/unreachable SMTP or Telegram endpoint, the candidate's "Apply" request hangs up to ~10s+ (Telegram) plus SMTP connect time before returning 201; errors are caught but latency is borne by the user. Perf/UX under load.

### F-07 — Employer invoice amounts hardcode "$" regardless of currency — MEDIUM — VERIFIED
`employer-dashboard/app.jsx` line 2181 renders `${Number(inv.amount).toLocaleString()}` with a literal `$`. Payment `currency` may be KHR (plan currency flows into Payment, `PaymentController::subscribe` 172–182). **Result:** a KHR 20,000 invoice displays as "$20,000". Same-amount-different-page inconsistency vs `fmtSalary` (app.jsx 602) which correctly prefixes the actual currency code.

### F-08 — Concurrent publishes can exceed a subscription's job-post quota — MEDIUM — LIKELY
`JobController::enforceJobPostLimit` (706–767) and `pickSubscription` (673–704) count published jobs then update — no row lock / no unique guard. Two simultaneous `submit`/`companyApprove` calls can both read `publishedCount < limit` before either commits. **Result:** quota overrun by the number of concurrent requests. Low likelihood on shared hosting (QUEUE=sync, low concurrency) but real. Failure scenario: employer with limit=1 rapidly publishes two drafts in parallel → both go live.

### F-09 — Admin Overview shows mock/static data (monthly chart, candidates count, year badge) — MEDIUM — VERIFIED
`admin-dashboard/app.jsx` 273–276 hardcodes `BARS` (fake monthly job counts), 300 hardcodes `<Badge>2026</Badge>`, 293 hardcodes Candidates value `"--"`. `ReportController::summary` (54–61) does return real `applicationsPerMonth`, but the Overview chart ignores it. **Result:** admins see fabricated trend data presented as real KPIs — misleading for decisions.

### F-10 — Inconsistent password policy + email change bypasses re-verification — MEDIUM — VERIFIED
Registration/reset require `Password::min(8)->mixedCase()->numbers()->symbols()` (AuthController 80, 433), but `changePassword` (266) and admin/team setters (`UserController` 93/124, `TeamController`) require only `min(8)`. A user can set a weak password post-registration. Separately, `updateMe` (246–255) updates `email` without clearing `email_verified_at` — a previously-verified account's new (unverified) email is treated as verified. Failure scenario: account takeover hardening bypass / unverified email trusted.

### F-11 — Job search relies on `LIKE '%term%'`; Khmer works but is unindexed — LOW/MEDIUM — VERIFIED
`JobController::index` 36–42 uses `where('title','like','%term%')`. Khmer substring search functions under utf8mb4 collation (Khmer is caseless, `LIKE` is substring), so **Khmer input returns matches** — but the leading `%` prevents index use, so search degrades linearly with table size. No full-text/segmentation. **Result:** correct results, poor performance at scale; no relevance ranking. REQUIRES RUNTIME TEST: search a Khmer job title substring, confirm hit and inspect query plan.

### F-12 — Saved-jobs list silently drops closed jobs; `checkApplied` ungated — LOW — VERIFIED
`ApplicationController::savedJobs` (311–317) filters `status='published'`, so a saved job that gets closed vanishes from the candidate's saved list with no indication (UX). `checkApplied` (252–264) has no `requirePermission`, so any authenticated user (incl. employer) can probe it — reads only their own applications, so low impact.

### F-13 — KHR amounts formatted with 2 decimals — LOW — VERIFIED
`admin-dashboard/app.jsx` 4200/4402/4467 and plan editor use `parseFloat(price).toFixed(2)` for all currencies. KHR is conventionally a zero-decimal currency; "KHR 5000.00" is cosmetically wrong. Low.

---

## 4. Broken / Missing Workflows (summary)
- **Company moderation is non-cascading** (F-01) and **bypassable before publish** (F-02) — the core "reviewed before live" workflow is not enforced end-to-end.
- **Admin revenue reporting is unreliable** (F-03 mixed currency, F-04 first-page/mislabeled) and **Overview KPIs are partly mocked** (F-09).
- **Candidate dashboard has no Khmer** (F-05) despite being the primary end-user surface.

## 5. Missing Validation
- `updateMe` email change without re-verification (F-10).
- Weak-vs-strong password inconsistency (F-10).
- No cap that a job's `salary_min <= salary_max` (JobController 109–110 validate each `min:0` independently) — LIKELY; a job can be posted with min > max (display "USD 9000 – 100 / month"). Confirm in runtime.

## 6. UX Issues
- Apply latency under slow SMTP/Telegram (F-06).
- Saved jobs disappearing silently (F-12).
- Mixed-currency / hardcoded-`$` displays (F-03, F-07, F-13).
- Mock admin charts erode trust (F-09).

## 7. Explicitly Skipped / Not-Found (honest gaps)
- **PWA** — no manifest/service worker anywhere; all PWA checks skipped.
- **Meilisearch / Scout** — not installed; search is Eloquent LIKE.
- **Filament** — admin is custom React; no Filament.
- **Forum (Thread/Reply/Report/Category), CV-match (Employer + admin + CvMatchService), Settings/SMTP/SMS test, Team, JobAlert, CompanyFollower, Banner, Recommendation, Chat/LLM proxy, TelegramController webhook, AuditController, NotificationController** — not opened this run; behavior only inferred from route signatures. These need a dedicated pass.
- i18n KM dictionary middle section (lines ~1–299) not line-by-line read; only structure + tail confirmed.
