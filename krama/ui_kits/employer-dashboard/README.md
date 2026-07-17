# Employer dashboard — UI kit

Employer portal for posting jobs and managing applicants.

## Screens
- **Dashboard** — 4 KPI cards (active / pending / applications / profile views) + job-postings table with `StatusBadge` per row.
- **Applicant tracking** — Kanban pipeline (Applied → Reviewed → Shortlisted → Interview → Offered) with applicant cards (CV / Move actions).

## Composition
`StatCard`, `Card`, `StatusBadge`, `Badge`, `Avatar`, `Button`, `EmptyState` from `window.KramaDesignSystem_1a6f65`. Reflects the spec's approval workflow (draft / pending / published / rejected) and pipeline stages.

Open `index.html` (needs compiled `_ds_bundle.js`).
