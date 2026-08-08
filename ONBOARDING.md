# Krama — Project & Admin Onboarding

Onboarding guide for **Krama** (kramajob.com), a jobs & hiring platform for Cambodia. Covers
the architecture, local setup, the build system, how we deploy, the major features, and the
conventions that will bite you if you don't know them. Written for developers and platform
admins joining the project.

> Secrets (prod SSH host/key, DB passwords, gateway/API keys) are **not** in this doc — they
> live in the team's secure store. Local dev credentials below are throwaway XAMPP-only logins.

---

## 1. What Krama is

A jobs marketplace: candidates find and apply to jobs; employers post jobs, manage applicants,
and pay for plans; admins review/approve companies and jobs and run the platform. It also has a
community forum, AI CV-matching, multi-currency payments (USD/KHR), Cambodia VAT invoicing, and
SEO/social distribution.

## 2. Architecture

- **API** — `krama-api/`, a **Laravel 12** app (MySQL). All business logic + the JSON API.
- **Frontend** — four static **"UI kits"** of React served as plain files (no Node server):
  `krama/ui_kits/{public-website, employer-dashboard, candidate-dashboard, admin-dashboard}/`.
  Each is a set of `.jsx` files **precompiled** to `compiled/*.js` (see §4).
- **Design system** — `krama/_ds_bundle.js`, a shared bundle exposing
  `window.KramaDesignSystem_1a6f65` (Button, Card, Avatar, JobCard, CompanyCard, …). Loaded by
  all four kits. **Hand-maintained** (see §4).
- **SEO layer** — server-rendered Blade pages (`krama-api/resources/views/seo/*`) for
  `/jobs/{slug}`, `/companies/{id}`, `/sitemap.xml`, served to crawlers.
- **Prod topology** — cPanel + **LiteSpeed**, fronted by **Cloudflare**. The web root serves the
  static kits; the same host runs the Laravel API at `/api`.

## 3. Local development

Runs under **XAMPP** (Apache + MySQL) on macOS.

- **API**: `php artisan serve` on `http://127.0.0.1:8000` (kept running via a launchd job).
  After editing a controller, restart it — the long-running server holds the old class.
- **Frontend**: serve the kits through **Apache**, not the API — e.g.
  `http://localhost/Krama/krama/ui_kits/admin-dashboard/index.html`. The API's CORS allows the
  `http://localhost` origin only, so a `php -S …:8091` preview is CORS-blocked. Apache serves
  `.html`/`.jsx` as `no-store`, so `?v=` bumps apply immediately locally.
- **Dev logins** (local DB only): admin `admin@krama.local` / `Admin@1234`; employer
  `hr@acleda.test` / `password123` (owns "ACLEDA Bank"); `hr@sabay.test` / `password123` for
  multi-subscription cases.
- **Auth in the SPA** is a Bearer JWT in `localStorage` (`krama_admin_token` /
  `krama_employer_token` / …). To drive a dashboard in a headless browser, mint a token via the
  API and inject it, then reload.

## 4. The UI-kit build system (read this before editing any `.jsx`)

All four kits are **precompiled** — `babel.min.js` was removed from the browsers.

1. Edit the `.jsx`.
2. **Recompile**: `node krama/build-jsx.js <kit-dir> <file1.jsx> <file2.jsx> …`
   - dashboards → `compiled/app.js`; public-website → per-file `compiled/*.js` + a concatenated
     `compiled/bundle.js` (pass the files in execution order — see the header of `bundle.js`).
3. **Cache-bust**: bump the `?v=N` for that file in the kit's `index.html`, **after** recompiling.
   Commit the regenerated `compiled/*.js` alongside the source — they're tracked in the repo.

Gotchas:
- **`api.js` is loaded raw** (not compiled) in every kit — edit it and bump its `?v=`, no recompile.
- **`_ds_bundle.js` has no rebuild pipeline.** It's a hand-compiled concat of the DS components.
  Editing `krama/components/**/*.jsx` alone does nothing at runtime — you must **also** hand-patch
  the Babel-style `React.createElement` copy inside `_ds_bundle.js` **and** bump
  `_ds_bundle.js?v=` in **all four** `index.html`.
- **Boot code is inside a `__kramaReady()` DOMContentLoaded gate** — never add top-level code that
  references `React` outside it; it throws.
- **lucide `<i data-lucide>` → React crash**: `createIcons()` swaps `<i>` for `<svg>` behind
  React's back. At any point where such an `<i>` is conditionally swapped for a different element,
  use an inline `<svg>` instead, or React throws `removeChild`.
- **Don't hardcode `?v=` numbers anywhere but `index.html`** — read them live:
  `grep -o "app.js?v=[0-9]*" <kit>/index.html`.

## 5. Deploying to production

Prod is **not a git checkout** — deploys are **SSH file-copies** to the cPanel host (connection
details in the team secure store). The mechanics that matter:

- SSH must target the **origin IP, not the hostname** — Cloudflare blocks SSH on the hostname.
- `scp` needs **absolute remote paths** (`/home/<user>/…`); `~` expands locally.
- Backend lives at `~/krama-api`; the kits at `~/kramajob.com/krama/…`.
- After a deploy, as applicable:
  - **routes changed** → `php artisan route:cache` (prod caches routes).
  - **migrations** → `php artisan migrate --force`.
  - **Blade/SEO views changed** → `php artisan view:clear`.
  - **any frontend change** → flush **LiteSpeed** (a `?v=` bump alone does NOT clear its server
    cache), and recycle it to pick up new PHP.
- Verify live: SEO pages render for **crawler user-agents only** (browsers get the SPA) — test
  with `curl -A Googlebot https://www.kramajob.com/jobs/<slug>`.

## 6. Feature map (all live on `main`)

| Area | What | Key code |
|---|---|---|
| Plans & billing | Subscriptions, discounts, per-sub job quota, pooled featured credits, coupons + two-sided referral | `PaymentController`, `Plan`/`Subscription`, `PaymentService` |
| Payments | ABA PayWay (QR + hosted card), KHQR/Bakong, Stripe; **USD or KHR** at checkout & boosts | `PaymentService`, `Helpers/Khqr.php`, `ExchangeRateService` |
| Tax | Cambodia GDT tax invoice vs plain invoice, mPDF w/ Khmer shaping | `InvoiceService`, `tax` settings group |
| SEO | Server-rendered `/jobs/{slug}`, `/companies/{id}`, sitemap, JobPosting JSON-LD, dynamic OG cards | `SeoController`, `resources/views/seo/*`, `OgImageService` |
| Distribution | Auto-post published jobs to Telegram/FB/LinkedIn; Community forum | `NotifyJobPublished`, forum controllers |
| Aggregation | Import external job/company listings from RSS/Atom/JSON feeds, blended into search, link out | `external_*` tables, admin Feeds panel |
| AI | CV-match, job-draft, chat (Gemini); one shared `ai` settings group | `AiConfig`, CV-match/job-draft controllers |
| Candidate | Profile-completion meter, onboarding wizard, Khmer localization, Digital CV + QR | candidate-dashboard kit, CV Blade |
| **Organizations** | **Free posting for verified NGO/Gov/Edu/Intl employers** | §7 below |
| Access & ops | Company access delegation (company_admin / recruitment), admin post-on-behalf, phone/email + SMS OTP auth, editable banners/heroes | various |

Security posture: rich text is HTML-sanitized **on write** (HTMLPurifier); payment webhooks are
bound/verified; SEO pages use a **nonce-based CSP** (no inline `style=""` — use CSS classes).

---

## 7. Free for Organizations (detailed)

Non-commercial employers post jobs **for free**, while normal companies pay. An admin verifies the
organization from an uploaded proof document; **verification is the single switch** that grants the
free plan, the public trust badge, and the right to post — and revoking it removes all three.

### For Krama admins — how to verify

1. An employer applies at **Company profile → About → "Non-profit / organization"**, picking a
   type (NGO / Government / Education / International), an optional registration/MoU number, and a
   proof document (PDF/JPG/PNG). Status becomes **pending** and an admin notification is posted.
2. In **Admin dashboard → Companies**, open the company → **About** tab → the **"Organization
   verification"** card: claimed type, registration number, a **"View submitted document"** link
   (opens the private proof), and a note field.
3. Check the document, then:
   - **Verify** → status **verified**; the company **immediately** gets the free *Organization*
     plan (unlimited posts) and a public **NGO/Gov/Education/International** badge on job cards, its
     profile, and the crawlable SEO pages.
   - **Mark pending / Reject / Clear** as needed. Rejecting or un-verifying a verified org
     **cancels the free plan and closes the jobs posted under it.**

Every action is audit-logged; a verified org never touches paid checkout.

### Employer experience
Pending → "Under review" (posting is blocked with a "will activate once verified" message).
Verified → free posting, no plan picker. Rejected → reason shown, can re-apply.

### Architecture
- **`companies`** columns: `org_type` (claimed), `org_status` (`none|pending|verified|rejected`,
  the admin-verified truth, indexed), `org_reg_no`, `org_doc_url`, `org_doc_path` (raw filename,
  `$hidden`), `org_note`, `org_verified_at`. **`org_status`/`org_type` are NOT `$fillable`** —
  only the admin endpoint sets them (forceFill), so no employer can self-verify.
- **Endpoints** (`CompanyController`): `POST /api/companies/{id}/org-apply` (employer; proof stored
  on the **private** `local` disk, sets `pending`), `GET /api/companies/{id}/org-document` (owner
  or admin only — never public), `PATCH /api/admin/companies/{id}/org-review` (classify + set
  status; `syncOrgSubscription()` grants/revokes the free plan).
- **Free plan**: a hidden `plans.is_org_plan = true` plan ($0, unlimited, `is_active = false`).
  Kept off public pricing; `PaymentController::subscribe()` hard-rejects it (403) so it can't be
  self-served. On verify → an active subscription with `renews_at = null` (never expires while
  verified; idempotent, doesn't touch paid subs). On un-verify → its published jobs are closed,
  then it's canceled.
- **Gate**: `JobController::enforceJobPostLimit()` requires an active plan to publish; verified
  orgs always have one, and pending/rejected companies get an org-aware "why" message.
- **Badge**: DS `JobCard`/`CompanyCard` (optional `orgType` prop), the company list row, profile
  header, job-detail, and the SEO Blades. Shows only for `verified` + a non-commercial type.
- **Deploy specifics**: migrations `2026_08_06_000007`, `2026_08_08_000001/2` (`migrate --force`);
  `route:cache` (routes changed); `view:clear` (SEO Blades); bump `_ds_bundle.js?v=` in all kits.

---

## 8. Conventions & where to get help

- **Never rename internal identifiers** for display changes — e.g. the public label is
  "Employers" but the role slug `employer`, setting keys (`employersHero`, …), and route id
  `employers` must stay. Change display strings only.
- **Server-side caches**: `/api/categories`, `/api/locations`, and settings are cached ~6h. Admin
  UI writes self-invalidate; **direct SQL edits do not** — `Cache::forget('public.categories')`
  (etc.) after any raw DB change.
- **Verifying UI without logging in**: stub the API global (`window.KRAMA_ADMIN_API` /
  `KRAMA_EMPLOYER_API`, including `fetchMe`) and remount via
  `ReactDOM.createRoot(host).render(React.createElement(window.Krama<Kit>App))`; or inject a
  minted JWT into `localStorage` and reload.
- **Backend verification**: `curl` against `127.0.0.1:8000` with a dev login, or
  `php artisan tinker` for in-process checks. Local DB backups live in `~/krama-backups/`.
- The git history is the source of truth for what shipped; each feature's commit message explains
  the why. When in doubt, read the code — this doc points you at it, it doesn't replace it.
