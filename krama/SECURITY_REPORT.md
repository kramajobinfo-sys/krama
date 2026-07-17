# Krama API — Security Audit Report
> Audit date: 2026-06-22 | Auditor: Senior Security Engineer | Standard: OWASP API Security Top 10 + OWASP Top 10

---

## Executive Summary

| Severity | Found | Fixed | Remaining |
|---|---|---|---|
| Critical | 4 | 4 | 0 |
| High | 6 | 6 | 0 |
| Medium | 2 | 1 | 1 (advisory) |
| Informational | 3 | — | 3 (advisory) |

The application uses JWT dual-token auth, bcrypt password hashing, parameterized queries via Eloquent, per-IP rate limiting, HSTS, and ForceHttps middleware — a solid baseline. All critical and high issues have been remediated in this audit.

---

## Scope

- **Backend**: `/Applications/XAMPP/xamppfiles/htdocs/krama-api` — Laravel 8, PHP 8.x, MySQL 8
- **Files reviewed**: All controllers, middleware, routes, models, exception handler, config
- **Out of scope**: Frontend UI kits, third-party packages, server OS configuration

---

## Critical Vulnerabilities (All Fixed)

### C1 — CV Files Publicly Accessible Without Authentication
**OWASP**: API3:2023 Broken Object Property Level Authorization / OWASP A05:2021 Security Misconfiguration

**Description**: `ResumeController::upload()` stored all uploaded CV files in the `public` disk (`storage/app/public/cvs/`), served via the `storage:link` symlink at `/storage/cvs/*`. Any person knowing or guessing a URL could download any candidate's CV without authentication. CV files contain names, contact details, employment history, and education — classified as personal data under most privacy regulations.

URL pattern was predictable:
```
http://host/storage/cvs/{slug(user.name)}_cv_{6-char-random}.{ext}
```

**Fix applied**:
- CVs now stored in `local` disk (`storage/app/cvs/`) — not web-accessible
- `file_url` column stores the disk path (e.g. `cvs/john-doe_cv_ABC123.pdf`), not a web URL
- New authenticated endpoints added:
  - `GET /api/candidate/resume/cv` — candidate downloads their own CV (JWT required)
  - `GET /api/applications/{id}/cv` — employer downloads CV via verified application ownership (JWT + `view_applicants` permission required)
- Raw path never exposed in API responses; `download_url` is returned instead

**Files changed**: `ResumeController.php`, `ApplicationController.php`, `routes/api.php`

---

### C2 — Suspended Accounts Could Obtain New Access Tokens via Refresh
**OWASP**: API2:2023 Broken Authentication

**Description**: `AuthController::refresh()` deleted the refresh token and issued a new JWT without checking if the user's `status` was still `active`. An admin suspending a user would revoke their ability to log in, but the user's existing refresh token (valid for `JWT_REFRESH_TTL` minutes) could continue producing fresh access tokens, effectively bypassing the suspension.

```php
// BEFORE — no status check after finding the user
$user = User::with('role.permissions')->find($record->user_id);
$record->delete();
$token = JWTAuth::fromUser($user);   // issued even if user is suspended
```

**Fix applied**:
```php
$user = User::with('role.permissions')->find($record->user_id);
$record->delete();   // always rotate/consume the token
if (! $user || $user->status !== 'active') {
    return response()->json(['message' => 'Account is not active.'], 401);
}
$token = JWTAuth::fromUser($user);
```

**Files changed**: `AuthController.php`

---

### C3 — Missing Defense-in-Depth on ExperienceLevelController Admin Endpoints
**OWASP**: API5:2023 Broken Function Level Authorization

**Description**: `ExperienceLevelController::store()`, `update()`, and `destroy()` contained zero in-controller permission checks. The outer route middleware (`['auth:api', 'permission:site_settings']`) provided the only guard. Any bug in middleware registration, route caching, or future refactoring that moves these routes would expose unauthenticated write access to a reference data table. Additionally, `adminIndex()` accepted no `Request` parameter, so it could not perform secondary authorization.

**Fix applied**: Added `$this->requirePermission($request->user(), 'site_settings')` as the first call in every admin method (`adminIndex`, `store`, `update`, `destroy`). Added `Request $request` parameter to `destroy()`.

**Files changed**: `ExperienceLevelController.php`

---

### C4 — Host Header Injection (TrustHosts Middleware Disabled)
**OWASP**: API7:2023 Server Side Request Forgery / OWASP A05:2021

**Description**: `TrustHosts::class` was commented out in `Kernel.php`. Laravel uses the `Host` request header to generate URLs, including signed email-verification URLs. An attacker who could manipulate the `Host` header (e.g. via a reverse proxy misconfiguration) could make Laravel generate signed verification links pointing to a host they control, enabling account takeover via phishing.

**Fix applied**: `\App\Http\Middleware\TrustHosts::class` uncommented in `$middleware` array. `TrustHosts::hosts()` uses `$this->allSubdomainsOfApplicationUrl()` which trusts only subdomains of `APP_URL`.

**Files changed**: `Kernel.php`

---

## High Vulnerabilities (All Fixed)

### H1 — Missing Security Response Headers
**OWASP**: API7:2023 Security Misconfiguration

**Description**: No response included `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`, or `Permissions-Policy`. Without `X-Content-Type-Options: nosniff`, browsers may MIME-sniff responses (e.g., treat a JSON response as HTML, enabling XSS). Without `X-Frame-Options: DENY`, the API's redirect responses (email verification) could be embedded in iframes for clickjacking.

**Fix applied**: New `SecurityHeaders` middleware added to the global `$middleware` stack:

```
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: camera=(), microphone=(), geolocation=()
X-XSS-Protection: 0   (explicitly disabled — browser auditors create bypass vectors)
```

**Files created**: `app/Http/Middleware/SecurityHeaders.php`
**Files changed**: `Kernel.php`

---

### H2 — `env()` Called Directly in Controller (Config Cache Bypass)
**OWASP**: API7:2023 Security Misconfiguration

**Description**: `AuthController::verifyEmail()` called `env('FRONTEND_URL')` directly. When `php artisan config:cache` is run (standard in production), all `.env` reads via `env()` outside config files return `null`. This would redirect verified users to `http://localhost/krama` (the hardcoded default) instead of the production frontend URL — a security regression that silently breaks the verification flow.

**Fix applied**:
1. Added `'frontend_url' => env('FRONTEND_URL', ...)` to `config/app.php`
2. Changed all `env('FRONTEND_URL')` calls to `config('app.frontend_url')`

**Files changed**: `AuthController.php`, `config/app.php`

---

### H3 — `Company.description` Accepted Unbounded Text
**OWASP**: API4:2023 Unrestricted Resource Consumption

**Description**: Both `CompanyController::store()` and `update()` validated `description` as `'nullable|string'` with no `max:` constraint. An authenticated employer could POST a multi-MB description on every update request, consuming excessive memory during validation, ORM hydration, and database write, and bloating JSON responses to public company listings.

**Fix applied**: `'description' => 'nullable|string|max:10000'` in both `store()` and `update()`.

**Files changed**: `CompanyController.php`

---

### H4 — URL Fields Accepted Any Scheme (`data:`, `ftp://`, etc.)
**OWASP**: API8:2023 Security Misconfiguration / XSS

**Description**: Laravel's built-in `url` validation rule delegates to PHP's `filter_var($v, FILTER_VALIDATE_URL)`, which accepts `data:`, `ftp://`, and other non-HTTP schemes as valid. Fields affected:

| Controller | Field | Risk |
|---|---|---|
| `CompanyController` | `logo_url`, `website` | If frontend renders as `<img src>` or `<a href>`, `data:` payloads or non-HTTP redirects possible |
| `BannerController` | `cta_url`, `image_url` | Same |

**Fix applied**: Added `'regex:/^https?:\/\//'` to every URL validation rule in `CompanyController` and `BannerController`. This ensures only `http://` and `https://` schemes are accepted.

**Files changed**: `CompanyController.php`, `BannerController.php`

---

### H5 — No Rate Limit on `resendVerification` Endpoint
**OWASP**: API4:2023 Unrestricted Resource Consumption

**Description**: `POST /api/auth/email/resend` was behind the global `throttle:api` limiter (60/min per user), but had no dedicated per-operation limit. An authenticated user (or attacker who obtained a token) could fire 60 verification emails per minute toward any target address, using Krama as an email spam relay.

**Fix applied**: Added per-user rate limit inside the controller: 3 resends per 10 minutes using `RateLimiter::hit($key, 600)`. Returns HTTP 429 with a `Retry-After`-style seconds message when exceeded.

**Files changed**: `AuthController.php`

---

### H6 — Missing Audit Logs on Admin Reference Data CRUDs
**OWASP**: API9:2023 Improper Inventory Management / Audit

**Description**: Banner, Category, Location, and ExperienceLevel create/update/delete operations left no audit trail. An admin could add a malicious banner URL, alter category names, or delete locations with no forensic record.

**Fix applied**: `$this->auditLog(...)` calls added to every write operation across all four controllers:

| Controller | Actions logged |
|---|---|
| `BannerController` | `banner.created`, `banner.updated`, `banner.deleted`, `banner.reordered` |
| `CategoryController` | `category.created`, `category.updated`, `category.deleted` |
| `LocationController` | `location.created`, `location.updated`, `location.deleted` |
| `ExperienceLevelController` | `experience_level.created`, `experience_level.updated`, `experience_level.deleted` |

All audit entries capture `admin_id`, `admin_email`, `ip`, and action-specific context.

**Files changed**: `BannerController.php`, `CategoryController.php`, `LocationController.php`, `ExperienceLevelController.php`

---

## Medium Vulnerabilities

### M1 — New Banners Auto-Published (DB Default `is_active = 1`) ✅ Fixed
**Description**: The `banners` table has `is_active` default 1. Any `POST /api/admin/banners` request that omitted `is_active` would create a live banner immediately, without review.

**Fix applied**: `BannerController::store()` now sets `$data['is_active'] = $data['is_active'] ?? false` before `Banner::create()`. New banners default to inactive.

---

### M2 — Job View Counter Artificially Inflatable (Advisory)
**Description**: `GET /api/jobs/{id}` increments `jobs.views` on every request with no deduplication. The general `throttle:api` limit (60/min per IP) provides minimal protection. Distributed IPs can inflate competitor job view counts or skew analytics.

**Recommendation**: Replace `jobs.views` counter with a `job_views (job_id, viewer_ip, date)` table (or Redis incr + flush) and deduplicate per IP per 24-hour window. This is a medium-effort schema change tracked as DB-008 in `DATABASE_HEALTH.md`.

**Status**: Not auto-fixed — requires schema migration and decision on storage backend.

---

## Informational / Advisory

### I1 — No Per-User Login Attempt Lockout
The `auth` throttle limiter (5/min per IP) mitigates single-IP brute force. Distributed password-spraying across many IPs can bypass it. A per-user lockout after N failed attempts would add another layer. Suggested approach: track failed attempts in Redis keyed to email, lock for 15 minutes after 10 failures, send account-lock notification email.

### I2 — `password_hash` Column Name with Bcrypt
The column `users.password_hash` stores bcrypt hashes (not raw hashes). The name is technically accurate but may mislead future developers into expecting a simple hash rather than a bcrypt verifiable value. No code change needed — document in schema notes.

### I3 — No Password Change Endpoint
Users cannot change their own password. The only password-reset path requires an email link via `AuthToken`. If a user suspects their password was compromised and can still log in, they have no self-service way to change it. Recommend adding `PATCH /api/auth/me/password` requiring `current_password` + `new_password` with the same complexity rule.

---

## Existing Controls Verified (Passing)

| Control | Status | Details |
|---|---|---|
| Password hashing | ✅ | `Hash::make()` (bcrypt, cost=10) via `password_hash` column |
| Password complexity | ✅ | `Password::min(8)->mixedCase()->numbers()->symbols()` on register |
| JWT TTL | ✅ | 15-minute access tokens; refresh token rotation on every use |
| Refresh token storage | ✅ | Raw token never stored; SHA-256 hash only in `auth_tokens` |
| SQL injection | ✅ | All queries via Eloquent parameterized bindings; `orderByRaw` in RecommendationController uses PDO `?` placeholders with array bindings |
| Mass assignment | ✅ | `status` and `is_verified` removed from `$fillable`; set only via `forceFill()` in admin paths |
| CSRF | ✅ | Pure JWT API — no cookies, CSRF inapplicable; email verification uses signed URLs |
| Avatar upload | ✅ | Re-encoded through GD (strips embedded EXIF/IPTC), output always JPEG |
| Logo upload | ✅ | Same GD re-encode pipeline |
| CV MIME validation | ✅ | `mimes:pdf,doc,docx` validated against actual MIME type, not client extension |
| Auth error messages | ✅ | Single generic message for bad credentials AND inactive account (no user enumeration) |
| Per-IP rate limiting | ✅ | `throttle:auth` (5/min) on login/register/refresh; `throttle:api` (60/min) on all other routes |
| HSTS | ✅ | `ForceHttps` middleware sets `Strict-Transport-Security: max-age=31536000; includeSubDomains; preload` in production |
| CORS | ✅ | Origins loaded from `CORS_ALLOWED_ORIGINS` env var; not wildcard |
| Debug mode | ✅ | `APP_DEBUG=false` in production `.env` |
| Error responses | ✅ | No stack traces in production; generic "Server error." for 500s |
| IDOR on applications | ✅ | `withdraw()` checks `candidate_id`; `updateStage()` verifies employer owns the job |
| IDOR on jobs | ✅ | `ownJob()` checks `company_id` via authenticated user's company |
| IDOR on resumes | ✅ | `save()` uses `candidate_id` tied to JWT user |
| Audit logging | ✅ | All admin state changes logged to `storage/logs/audit.log` (90-day rotation) |
| Paginator limits | ✅ | `per_page` capped at 100 on all paginated admin endpoints |
| Job text field limits | ✅ | `description` max:20000, `requirements` max:10000, `benefits` max:5000 |
| Resume array limits | ✅ | `education` max:20, `experience` max:30, `skills` max:100, etc. |
| Session cookie | ✅ | `SESSION_SECURE_COOKIE=true` required in production (currently false in dev) |

---

## Files Changed in This Audit

| File | Change |
|---|---|
| `app/Http/Middleware/SecurityHeaders.php` | **Created** — global security response headers |
| `app/Http/Kernel.php` | Added `SecurityHeaders`, uncommented `TrustHosts` |
| `config/app.php` | Added `frontend_url` key |
| `app/Http/Controllers/AuthController.php` | Fixed `refresh()` user status check; replaced `env()` with `config()`; added resend rate limit |
| `app/Http/Controllers/ResumeController.php` | Private disk storage; authenticated download endpoint; `download_url` in responses |
| `app/Http/Controllers/ApplicationController.php` | Employer CV download endpoint |
| `app/Http/Controllers/CompanyController.php` | `description` max:10000; URL scheme regex on `logo_url`, `website` |
| `app/Http/Controllers/BannerController.php` | Audit logs; URL scheme regex on `cta_url`, `image_url`; default `is_active=false` |
| `app/Http/Controllers/CategoryController.php` | Audit logs |
| `app/Http/Controllers/LocationController.php` | Audit logs |
| `app/Http/Controllers/ExperienceLevelController.php` | In-controller permission checks; audit logs |
| `routes/api.php` | Added `GET candidate/resume/cv` and `GET applications/{id}/cv` routes |

---

## Production Deployment Checklist

Before going live, confirm:

```
[ ] APP_DEBUG=false
[ ] APP_ENV=production
[ ] SESSION_SECURE_COOKIE=true
[ ] CORS_ALLOWED_ORIGINS=https://yourdomain.com  (HTTPS only)
[ ] FRONTEND_URL=https://yourdomain.com
[ ] MAIL_MAILER=smtp  (not log)
[ ] JWT_SECRET is set and rotated from the dev value
[ ] storage/logs/ is not web-accessible
[ ] storage/app/cvs/ is not web-accessible (local disk only)
[ ] php artisan storage:link  (public disk symlink — cvs no longer in public)
[ ] php artisan config:cache
[ ] php artisan route:cache
[ ] Crontab has: * * * * * php artisan schedule:run  (for tokens:prune)
[ ] Database user has only SELECT/INSERT/UPDATE/DELETE (no DROP/ALTER in prod)
```

---

*Generated 2026-06-22. All Critical and High findings remediated. Re-audit recommended after implementing I1 (per-user lockout) and M2 (view counter dedup).*
