# PASS 3 — Functional Verification (Krama)

Senior QA + Product Owner, static code review (app NOT run). Every finding cites a file opened this run with the line range read. Confidence tags: **VERIFIED** (read exact code, issue present) · **LIKELY** (strong inference) · **HYPOTHESIS** (risk to check — no fabricated line numbers). Severity: Critical / High / Medium / Low.

Stack re-confirmed against source this run:
- Laravel 8.75, PHP platform pinned 8.2 — `krama-api/composer.json:7-16`.
- JWT auth (`php-open-source-saver/jwt-auth`), `role=in:employer,candidate` self-service register — `AuthController.php:22,80-81`.
- Frontend = runtime-Babel React UI kits; public jobs page filters client-side (see F1).
- **No Meilisearch / Filament / Inertia / PWA.** No `manifest.json`, no service worker anywhere under `krama/ui_kits` (find returned nothing). Search = Eloquent `LIKE` — `JobController.php:36-42`. → **all PWA and Meilisearch checks are SKIPPED (components do not exist).**

---

## Coverage Ledger

| Artifact | Status | Evidence / notes |
|---|---|---|
| routes/api.php | full read | 1-336 |
| AuthController | full | 1-608 (register/login/OTP/refresh/reset/social/updateMe/avatar) |
| ApplicationController | full | 1-363 (apply/withdraw/pipeline/CV download/save) |
| JobController | full | 1-874 (CRUD/submit/approve/close/boost/quota/alerts) |
| PaymentController | full | 1-730 (subscribe/khqr/verify/webhooks/refund/admin) |
| PaymentService | full | 1-183 (fulfill/bakong/aba/stripe) |
| Subscription model | full | 1-66 (expireOverdue) |
| CompanyController | full | 1-555 (CRUD/uploads/admin approve/verify/suspend) |
| MessageController | full | 1-208 |
| UserController | full | 1-148 (admin users/candidates/roles) |
| TelegramController | full | 1-102 |
| EmployerCvMatchController | full | 1-278 (credits/run) |
| ResumeController | full | 1-194 (upload/download/CV visibility) |
| SettingController | partial | 1-205 read (schema, publicGroup, adminGroup, update head). testSmtp/Sms/Social/Telegram + activateTelegram (206-end) NOT read |
| Controller (base) | full | requirePermission / auditLog 1-46 |
| CheckPermission mw | full | 1-33 |
| User model | full | 1-77 |
| Notification model | full | 1-64 |
| Helpers/Khqr | full | 1-120 (TLV/CRC/amount) |
| i18n.js (public) | full | 1-340 |
| api.js (public) | partial | 1-173 (normaliseJob/fmtSalary/init 100-cap) |
| jobs.jsx | partial | 320-394 filter/pagination + grep of full file |
| apply.jsx | grep | login gate, no resume_id sent |
| Frontend PWA/i18n coverage | verified | find + grep: no SW/manifest; i18n only public-website |
| ForumThread/Reply/Report/Category controllers | NOT read | forum out of core-workflow scope this pass |
| Recommendation, JobAlert, CompanyReview/Follower, Banner, Category, Location, ExperienceLevel, Report, Audit, Chat, Health, Upload, Team controllers | NOT read | referenced only |
| CvMatchService, SocialPostService, TelegramService, SmsService, MailConfig, EmailTemplates | NOT read | behavior inferred from callers |
| Migrations / DB schema | NOT read | column + unique-index existence assumed from models |
| Role→Permission seeding | NOT read | **needed to grade F3 (escalation)** |
| payment_config JSON contents | NOT read | **needed to grade F13 (public exposure)** |

---

## Feature Verification Matrix

| # | Feature | Traced in code | Predicted result | Requires-runtime-test |
|---|---|---|---|---|
| 1 | Register (email) | AuthController.php:73-145 | Works. Token issued immediately; `email_verified=false`; verification email dispatched. App usable unverified. | POST /auth/register {name,email,password} → 201 + access_token. |
| 2 | Register (phone+OTP) | 27-71, 91-110 | request-otp texts/logs 6-digit; register needs valid unexpired OTP (5 attempts, 5-min TTL). | request-otp then register with otp; wrong/expired → 422. |
| 3 | Login (email or phone) | 147-188 | Accepts identifier/email/phone; rejects non-active; logs failures. | Login as suspended user → 401. |
| 4 | Post a job (draft→publish) | JobController.php:96-233 | Draft created; company-admin publish enforces per-sub quota; recruiter → company_pending. | Submit draft with no active plan → 422. |
| 5 | Edit / close job | 137-198, 399-408 | Edit only draft/pending/rejected; rejected→draft; close sets closed. | PUT a published job → 422. |
| 6 | Search & filter (public) | server 22-75 exists but **frontend bypasses it** | **BROKEN at scale** — jobs.jsx loads first N jobs, filters in JS. See F1. | Seed 120 published jobs; confirm #51+ unreachable. |
| 7 | Apply to a job | ApplicationController.php:20-109 | Works; auto-attaches primary resume; duplicate → 422. | Apply twice → 2nd 422. |
| 8 | Concurrent apply (same job) | 51-63 | Safe — insertOrIgnore + unique index; loser 422. | Fire 2 parallel applies; expect 1 row (verify DB unique index exists). |
| 9 | Upload CV | ResumeController.php:90-118 | pdf/doc/docx ≤5 MB → private disk; download via route. | Upload .exe → 422; 6 MB → 422. |
| 10 | Application pipeline | ApplicationController.php:199-249 | Employer moves stage; notifies candidate (in-app+email); ownership enforced. | PATCH stage on another employer's app → 404. |
| 11 | Employer dashboard | JobController.php:410-432; PaymentController.php:23-108 | myJobs (recruiter scoped), quota rows. English-only UI (F8). | — |
| 12 | Candidate dashboard | ApplicationController.php:128-150; ResumeController | applications/saved/resume. **English-only** (no i18n). | — |
| 13 | Notifications — email | throughout, SMTP-gated | Sent only if configured; failures swallowed; run in terminating() after response. | Publish job with SMTP off → no error/mail. |
| 14 | Notifications — Telegram | ApplicationController.php:80-87; TelegramController | DM employer on new application if linked; admin chat on new sub. | Link deep-link, apply → DM. |
| 15 | Social auto-post (FB/LinkedIn/Telegram channel) | SocialPostService (not read) called JobController.php:349 | Auto-post on publish; best-effort. | Publish with social_post on → verify post. |
| 16 | Payment success | PaymentController.php:279-335; PaymentService.php:30-57 | KHQR/ABA/Stripe re-verified server-side; fulfill() idempotent → activate sub / feature job / top CV credits. | Bakong sandbox pay; verify → paid, sub active. |
| 17 | Payment failure / pending | PaymentService.php:64-182 | Any error/negative → false → stays pending (never falsely fulfilled). | Verify unpaid invoice → {status:pending}. |
| 18 | Expired / unpaid job posting | JobController.php:714-775; Subscription.php:27-45 | Unpaid (pending) sub not usable → publish blocked; expired sub auto-closes jobs. See F9. | Subscribe paid (unpaid) → prior free jobs vanish. |
| 19 | Admin: job moderate | JobController.php:292-397,435-478 | approve/reject/feature; audit-logged; notifies employer. | — |
| 20 | Admin: company moderate | CompanyController.php:439-490 | approve/reject/suspend/verify; **approve sends NO employer notification** (F11). | — |
| 21 | Admin: payments/plans/subs | PaymentController.php:219-702 | mark-paid, refund (un-features/cancels), plan CRUD, manual sub. | Refund a boost → job un-featured. |
| 22 | Admin: users/roles | UserController.php:63-147 | create/update; **role change gated only by permission, not super_admin** (F3). | — |
| 23 | Khmer vs English | i18n.js public only | Public EN/KH; **3 dashboards effectively English-only; API messages English-only** (F8). | lang=km on candidate dashboard → still English. |
| 24 | Currency KHR/USD display | api.js:56-69; Khqr.php:26,60-66 | Display consistent ($ USD / "KHR " prefix); KHQR encodes correct minor units. **Salary filter mixes currencies** (F2). | — |

---

## Findings

### F1 — Public job browse/search silently caps (client-side only) · High · VERIFIED
`api.js:165` fetches `GET /jobs?per_page=100` once into `D.jobs`; `jobs.jsx:333-362` does **all** filtering, search, sort and pagination in JavaScript over that array. The server's real search/filter/pagination (`JobController::index`, `api.php:87`) is never used by the public site.
- With more jobs than the cap, extra jobs are **invisible everywhere** on the public site — not in listings, search, or category/location filters. A paid employer's job may never appear.
- The server clamps `per_page` to **50** (`JobController.php:71`) while the client requests 100 → the client receives at most 50 jobs, so the effective live cap is ~50, not 100.
Failure scenario: 60 published jobs; ~10 are unreachable from the public UI depending on sort order.

### F2 — Salary "minimum" filter treats KHR amounts as USD · Medium · VERIFIED
`jobs.jsx:328-343` parses the *formatted* salary string (`salaryHigh`) to a bare integer and compares to USD thresholds ($500/$800/…, `jobs.jsx:438`). A KHR job renders `"KHR 1,000,000/mo"` (`api.js:64`) → `salaryHigh`=1000000, passing every USD threshold. The chip hard-codes `"$"` (`jobs.jsx:373`).
Failure scenario: filter "≥ $1,500/mo" returns a KHR 500,000/mo (~$125) job and excludes a real USD $800 job. Cross-currency comparison is meaningless. (Server `salary_min`, `JobController.php:64-66`, is equally currency-blind but unused by the public UI.)

### F3 — Admin role-change / user-create not restricted to super_admin (escalation risk) · High · HYPOTHESIS
`UserController::adminUpdateUser` (`117-147`) accepts `role => exists:roles,slug` and applies it, gated only by `permission:manage_roles`. `adminCreateUser` (`85-114`) lets `role` be any slug incl. `super_admin`, gated by `manage_users`. Route comment (`api.php:294`) claims "super_admin only for role changes", but **no super_admin check exists in code**.
- If the seeded `admin` role holds `manage_roles`/`manage_users`, any admin can promote an account to `super_admin`.
- To grade: read `database/seeders/*` for the `admin` role's permissions. If it has them → **Critical auth-bypass**; if only `super_admin` does → intended, Low.

### F4 — Email change does not reset verified state · Medium · VERIFIED
`AuthController::updateMe` (`242-258`) updates `email` with a uniqueness rule but never clears `email_verified_at` or re-dispatches verification. A user verified under address A switches to unverified address B and stays `hasVerifiedEmail()===true`. Any "verified email" trust signal is bypassable.

### F5 — CV-match credits: check-then-charge race allows overspend / negative balance · Medium · VERIFIED
`EmployerCvMatchController::run` reads balance (`:116`), 402s if `< cost` (`:118`), runs the engine (AI call can take seconds, `:141-145`), then `decrement('cv_match_credits', cost)` (`:163`) with no re-check or lock.
Failure scenario: company with 3 credits fires two parallel AI runs (cost 3 each) → both pass the check, both decrement → balance = -3. Fix: conditional `UPDATE … WHERE cv_match_credits >= cost` inside a transaction.

### F6 — cv_match AI keys wiped when settings saved blank · Medium · VERIFIED
`SECRET_KEYS` (`SettingController.php:126-133`) preserves-on-blank for telegram/sms/smtp/chat/payment/social_post secrets, **but omits `claude_api_key` and `gemini_api_key`** (cv_match schema `:86-89`). Saving the CV-Match settings form with those fields blank (normal UX — secrets not re-rendered) overwrites the stored key with empty, breaking AI matching until re-entered.

### F7 — Company-admin jobs skip platform moderation, contradicting "every job is reviewed" · Medium · VERIFIED
`JobController::submit` (`218-232`): a company **owner/admin** publishes **directly** (`status=published`) with no platform-admin approval; only recruiter jobs enter review (`company_pending` → company-admin approval, still no platform admin). Site copy repeatedly promises platform review (i18n.js:277 "Our team reviews every job before it goes live", :283). Combined with self-service `role=employer` registration, a self-registered employer can publish arbitrary listings with zero human review.

### F8 — Khmer localization is public-site-only; dashboards + all API text are English-only · Medium · VERIFIED
`i18n.js` exists only under `public-website` (find). `candidate-dashboard/app.jsx` and `admin-dashboard/app.jsx` have **0** `KRAMA_T` calls; `employer-dashboard` loads the dict (`index.html:13`) but uses it **twice** (`app.jsx:1384,1479`). All server messages (validation errors, "You have already applied to this job.", stage labels, emails) are hard-coded English. About page markets "Khmer and English as first-class peers" (i18n.js:304) — unmet once logged in.

### F9 — Subscribing to a paid plan (pre-payment) hides the company's existing published jobs · Medium · VERIFIED
Listing gate (`JobController.php:29-34`): show jobs where the company has **no** subscriptions OR an **active/trial** one. `subscribe` cancels active/trial subs and creates a **pending** one (`PaymentController.php:150-170`). A free-tier company (no sub → visible via `whereDoesntHave`) that starts a paid subscription now *has* a sub that is only `pending` → neither branch matches → **all its published jobs disappear from listings** until payment confirms. `show()` by direct URL still works (`:78-93`), masking it.
Failure scenario: employer with live free jobs clicks Upgrade, generates KHQR, hasn't paid → jobs vanish from search/browse.

### F10 — `checkApplied` has no role/permission guard · Low · VERIFIED
`ApplicationController::checkApplied` (`251-264`) omits `requirePermission('apply_jobs')` (unlike apply/withdraw/save). Any authenticated user (incl. employer) can query `/jobs/{id}/applied`. Low impact, inconsistent.

### F11 — Company approval sends no notification to the employer · Low · VERIFIED
`CompanyController::approve` (`439-450`) sets status + audit only. Job approve/reject (`JobController.php:315,380`) and company *resubmit* (`CompanyController.php:149`) notify, so the omission is inconsistent — the employer isn't told their company was approved.

### F12 — Candidates can apply with no CV, silently · Low · VERIFIED
`apply.jsx` posts only `coverNote`; `apply` auto-attaches a primary resume if present (`ApplicationController.php:41-47`) else stores `resume_id=null`. A candidate with no resume applies successfully; employer sees `has_cv=false` (`:181`). No prompt to upload a CV first.

### F13 — `payment_config` settings group is publicly readable · Low · HYPOTHESIS
`publicGroup` allows group `payment_config` (`SettingController.php:138`) with no key filtering (unlike `chat`, which strips secrets `:150`). `generateKhqr` reads KHQR merchant account/name/enabled from it (`PaymentController.php:249-251`); code treats the account id as public. Risk: if the admin UI ever stores a token/secret inside the `payment_config.data` JSON, it is served unauthenticated at `GET /api/settings/payment_config`. To grade: dump `settings` row group=payment_config,key=data. The real gateway secrets live in the separate `payment` group, which is **not** public — good.

### F14 — KHQR TLV length field overflows for values >99 chars · Low · HYPOTHESIS
`Khqr::tlv` (`Khqr.php:53-56`) does `str_pad(strlen($value),2,'0')`; EMVCo length is 2 digits (max 99). A Bakong `account_id` long enough that the nested tag-29 payload exceeds 99 bytes yields a malformed length → unscannable QR. Bakong account ids are short in practice; verify max length before dismissing.

---

## Positives confirmed (no action)
- Duplicate-apply and concurrent-apply handled by `insertOrIgnore` (ApplicationController.php:51-63); saved-jobs likewise (:276).
- `PaymentService::fulfill` idempotent (guards `status!=='pending'`, PaymentService.php:32) — safe across manual mark-paid, verify, and webhook.
- All three payment webhooks re-verify authoritatively server-side rather than trusting the callback payload (PaymentController.php:339-361,398-429).
- Refresh-token rotation, reset-token single-use + session revocation (AuthController.php:206,452-455).
- Telegram webhook secret compared with `hash_equals` (TelegramController.php:80).
- CV visibility respected on employer download (ApplicationController.php:333-338); CV files on a private disk (ResumeController.php:109).
- Per-subscription job quota + `expireOverdue` auto-closes lapsed jobs (JobController.php:714-775, Subscription.php:27-45).

## Highest-value runtime tests
1. Seed 60+ published jobs; confirm the public Find-Jobs page reaches none past the ~50 server clamp (F1).
2. Read the role→permission seeder; attempt `PATCH /api/admin/users/{id}` `{role:"super_admin"}` as a plain `admin` (F3).
3. Free-tier employer with live jobs → `POST /employer/subscribe` (paid, unpaid) → reload public listings; confirm jobs disappear (F9).
4. Two parallel `POST /employer/cv-match/run` with balance == cost; confirm negative balance (F5).
5. `GET /api/settings/payment_config` unauthenticated; inspect JSON for anything beyond display config (F13).
