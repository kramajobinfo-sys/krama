# Admin console — UI kit

Super-admin console for moderating the marketplace.

## Screens
- **Overview** — 6 KPI cards (total/active/pending jobs, companies, candidates, revenue) + a monthly job-posts bar chart (CSS bars, no external chart lib).
- **Job approval queue** — selectable table with per-row Approve/Reject, a bulk-action bar (Approve/Reject selected), verified/unverified employer flags, and `StatusBadge`. Dark sidebar distinguishes the admin surface.

## Composition
`StatCard`, `Card`, `StatusBadge`, `Badge`, `Avatar`, `Button`, `Checkbox`, `Tabs`, `EmptyState` from `window.KramaDesignSystem_1a6f65`. Implements the spec's admin approval workflow + bulk actions.

Open `index.html` (needs compiled `_ds_bundle.js`).
