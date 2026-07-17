# Candidate dashboard — UI kit

Logged-in candidate portal. Sidebar + topbar app shell with in-memory navigation.

## Screens
- **Dashboard** — stat cards (applied / saved / interviews), recent-applications list with live pipeline trackers, AI-matched recommended jobs.
- **My applications** — tabbed list (All / Active / Interview / Closed) with `ProgressTracker` per row.

## Composition
`StatCard`, `JobCard`, `Card`, `ProgressTracker`, `Tabs`, `Badge`, `Avatar`, `Button`, `EmptyState` from `window.KramaDesignSystem_1a6f65`. Icons via Lucide. Other nav items render a "coming soon" empty state.

Open `index.html` (needs compiled `_ds_bundle.js`).
