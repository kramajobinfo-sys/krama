# Krama — Session Summary (2026-08-01 → 08-02)

**Scope:** SEO go-live, richer social sharing, a broken feature repaired in prod, and a
strategic pivot to **legitimate native job content** with three new employer/admin tools.
Everything below is **committed, deployed to `kramajob.com`, and verified live** unless noted.

Deploys went out over SSH (cPanel, non-standard port 21098) — build/scp/`route:cache` — and
every change was verified from the server itself (this workstation is network-sandboxed).

---

## 1. SEO — went live

The server-rendered SEO pages existed in code but were **not actually serving on prod**. This
session deployed and verified them, then made social sharing first-class.

- **Crawlable pages live:** `/jobs/{slug}`, `/companies/{id}`, `/sitemap.xml`, `/robots.txt`
  (static file at the docroot), with per-page meta + **JobPosting JSON-LD** (Google for Jobs)
  and **Organization** JSON-LD. Activated via `config/route/view:cache` after deploy.
- **Homepage social card:** a branded **1200×630 `og:image`** (Banyan-Teal gradient, real krama
  mark + weave motif, Sora type) replaces the old apple-touch-icon fallback; added
  `og:image:width/height/type/alt` + `twitter:image`.
- **Per-page social cards (dynamic):** `GET /jobs/{slug}/og.png` and `/companies/{id}/og.png`
  render a 1200×630 card **server-side with PHP GD** (no browser/canvas), cached 7 days, showing
  the job title/company/location/salary (or company name + open-positions). Bundled DejaVu Sans
  (open-licensed) in-repo for the text, with a Battambang fallback for Khmer.
- **Fixes:** double-encoded `&amp;` in the company `<title>` and `og:image:alt`.

**Still yours to do (external / credentials):** submit `sitemap.xml` in Google Search Console;
optionally add a Google Indexing API service-account key in Admin → SEO to push new jobs.

---

## 2. Feeds feature — repaired in production

The external feed-aggregation feature was **code-deployed but silently broken**: its database
migration had never run, so the tables were missing (admin panel / public blend / cron would 500).

- **Root cause + fix:** prod MariaDB defaults to **`storage_engine=MyISAM`** (the app's real
  tables are InnoDB). The migration didn't pin an engine, so the feed tables were created as
  MyISAM — whose 1000-byte key cap broke an index and which silently drops FK cascades. Fixed by
  pinning **`engine = 'InnoDB'`** on the tables, dropping the partial tables, and re-migrating.
- **Result:** `feed_sources` / `external_jobs` / `external_companies` created (InnoDB), endpoints
  healthy.

> **Durable lesson:** every new-table migration on this host must set `$table->engine = 'InnoDB'`,
> and a code deploy does **not** run migrations — run `migrate --force` after deploying a feature
> with a new migration.

---

## 3. Strategic pivot — legitimate native content

A Cambodian **Bongthom** feed was added as a live external (link-out) source (246 jobs, verified
blending into Find Jobs) — then **removed** at your direction. You chose to grow the board with
**native employer postings** instead of syndicating a commercial board's full content (which would
be copyright/ToS infringement). That decision drove the three tools below.

---

## 4. Native-content tooling (the plan, all shipped)

### #1 — Bulk CSV import (admin seeding)
`POST /admin/jobs/bulk-import`. Admin uploads a CSV; rows resolve **company / category / location
by name** (auto-creating an *approved* company + category if new), de-dupe on title+company, get
sanitized + published. Partial success with per-row results. UI: a **Bulk import** modal on the
admin Jobs page with a template download, in-browser parse, validation preview, and a result
summary.
**Columns:** `title, company, category, location, job_type, experience_level, salary_min,
salary_max, salary_currency, salary_period, is_remote, description, requirements, benefits,
expires_at` (only `title` + `company` required).

### #2 — AI "draft-a-job" (admin + employer)
A **"Draft with AI"** button fills the **description / requirements / benefits** from a job title +
light context. New `JobDraftService` reuses your existing CV-Match/Chat AI config (Claude or
**Gemini** — prod uses Gemini) and returns clean HTML; graceful message if no AI key is set.
Wired into **both** the admin "Post a job" modal (`/admin/jobs/ai-draft`) and the employer post
form (`/jobs/ai-draft`, `post_jobs`-gated).

**Rich-text editors in the admin post form:** the admin "Post a job" modal used plain textareas,
so AI-drafted HTML showed as raw tags. Ported the employer kit's `RichEditor` (toolbar:
bold/italic/underline/bullet/numbered/clear) into admin and replaced the Description / Requirements
/ Benefits textareas — keyed by a `resetKey` so it remounts on form-reset and after an AI draft.
Both post forms now match, and AI drafts render formatted.

### #3 — Employer ATS/careers-feed → native drafts
An employer connects **their own** careers/ATS feed (RSS/Atom/JSON incl. **Greenhouse** & **Lever**)
and their roles import as **native draft jobs** under their company — full content, applications on
Krama. Legitimate because it's their own consented content.
- New `company_job_feeds` table (InnoDB) + a `jobs.import_ref` column for **idempotent re-sync**
  (re-syncing updates the same job, never duplicates, never overrides a published/edited job).
- `CompanyJobFeedService` keeps the **full** description; endpoints `GET/PUT/DELETE
  /employer/job-feed` + `POST /employer/job-feed/sync`; **6-hourly** auto-resync.
- **Imported as drafts on purpose** — the employer reviews and publishes, so your **plan quota is
  enforced at publish** and can't be bypassed.
- UI: an **"Import from a job feed"** modal on the employer Job postings page (URL, format, Save,
  Sync now, status, Disconnect).
- **Verified live:** synced figma's real Greenhouse board → **176 native drafts, ~5KB full
  descriptions each**, all drafts, then cleaned up.

---

## 5. Commits

| Commit | Summary |
|---|---|
| `ea73780` | Admin: rich-text editors in 'Post a job' (desc/reqs/benefits) |
| `e9336c2` | Public: "get notified" waitlist on the empty Find Jobs page |
| `ed667ee` | Employer: first-run onboarding card on the dashboard |
| `4be36a5` | Employer: connect careers/ATS feed → native draft jobs |
| `b16bf9a` | Employer: AI draft-a-job button in the post form |
| `72e39bd` | Admin: AI draft-a-job (description/requirements/benefits) |
| `9dfb7fe` | Admin: bulk CSV import to seed jobs |
| `6904920` | Feeds: force InnoDB on feed tables (host defaults to MyISAM) |
| `e6d9e83` | SEO: dynamic per-page og:image cards for jobs & companies |
| `d11b58e` | SEO: escape ampersand in og:image:alt |
| `720a3cf` | SEO: add 1200×630 og:image social share card |
| `f006ac8` | SEO: fix double-encoded ampersand in company `<title>` |

All pushed to `origin/main`; working tree clean.

---

## 6. Verification approach

- **Backend:** login-as-admin scripts + `Http::fake` for the LLM and feed fetches; **live** prod
  runs for the risky paths (feed migration, real Greenhouse sync).
- **Frontend:** stub-and-remount of each dashboard (mutating `window.KRAMA_*_API` **in place** —
  the module captures it by reference at load), driving the real UI and screenshotting.
- **Prod:** every endpoint checked for a healthy `401` (auth-gated) rather than `500`; UI
  cache-bust versions confirmed served.

---

## 7. Follow-ups (not built)

- Google Search Console sitemap submission + optional Indexing API key (external / your account).
- Optional: swap the DejaVu OG-card font for real **Sora** TTFs if you want exact brand type.
- Optional: an "auto-publish up to quota" mode for the employer feed (today it's drafts-only).
