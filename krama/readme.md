# Krama Design System

**Krama** is a modern, enterprise-grade **job portal** connecting talent and employers across Southeast Asia (Cambodia-first, multi-country). It spans a public marketing/jobs website, a Candidate portal, an Employer portal, and an Admin console — with an approval workflow, subscriptions, and Khmer + English support at its core.

The name comes from the **krama**, the iconic Cambodian checkered scarf — a symbol of versatility, identity, and connection. Its woven grid is the brand's central visual motif, expressed in the logo mark and subtle background textures.

> **Greenfield brand.** No external codebase or Figma was attached to this project — this design system was authored from the product specification. The brand, palette, type, logo, and components are all original to Krama. If you have an existing brand to align to, share it and we'll reconcile.

## Sources & references
- **Product spec:** "Full Stack Job Portal Development Prompt" (provided in chat) — roles (Super Admin / Employer / Candidate), registration & job-posting approval workflow, public site, dashboards, subscriptions, KHQR/ABA/Wing payments, Khmer + English.
- **Peers referenced for domain conventions only** (not visual copying): LinkedIn Jobs, Indeed, JobStreet, BongThom, CamHR.
- No proprietary assets were imported; everything here is original.

---

## CONTENT FUNDAMENTALS

**Voice:** Warm, direct, and encouraging — a knowledgeable local guide, not a corporate recruiter. Krama speaks to ambitious people in an emerging market and treats finding work (and hiring) as a hopeful, human act.

**Person & address:** Speak to the user as **"you"**; the brand refers to itself as **"Krama"** or **"we"** sparingly. Candidate-facing copy is motivating ("Find work that fits your life"); employer-facing copy is efficient and outcome-led ("Reach 40,000+ verified candidates this week").

**Tone by surface:**
- *Public / marketing* — aspirational but concrete. Lead with opportunity and numbers, not adjectives.
- *Candidate app* — supportive, plain-language, low-pressure ("Saved — we'll let you know if the deadline's near").
- *Employer app* — businesslike, time-respecting, action-first ("3 jobs awaiting approval").
- *Admin* — neutral, precise, audit-friendly ("Approved by A. Sok · 14 Jun 2026, 09:12").

**Casing:** Sentence case everywhere — buttons, headings, menus, table headers. NEVER Title Case UI. Reserve ALL-CAPS for tiny eyebrow labels / overlines only (with letter-spacing), never for sentences.

**Buttons & CTAs:** Verb-first and specific. "Apply now", "Post a job", "Save job", "Approve company", "Download résumé". Avoid "Submit", "Click here", "Learn more" when a specific verb exists.

**Numbers & data:** Use real, rounded figures with thousands separators ("12,480 jobs"). Salary in local currency with range and period ("$800–1,200 / month"). Dates as "14 Jun 2026". Relative time for activity ("2h ago", "Yesterday").

**Status language:** Workflow states are nouns shown as badges — *Draft, Pending approval, Published, Rejected, Closed*. Notifications narrate the change ("Your job 'Senior Accountant' was approved and is now live").

**Bilingual:** English is primary; Khmer (ខ្មែរ) is a first-class peer, never an afterthought. When both appear, English leads and Khmer follows on its own line in `--font-khmer`. Never machine-mix scripts mid-word.

**Emoji:** Not used in product UI or marketing copy. Meaning is carried by Lucide icons, not emoji.

**Examples**
- Hero: *"Find work that fits your life."* / sub: *"12,480 open jobs from verified employers across Cambodia."*
- Empty state: *"No applications yet. When you apply, you'll track every step right here."*
- Employer nudge: *"You have 2 jobs in draft. Submit them for approval to go live."*
- Admin row action toast: *"Company approved. The employer can now post jobs."*

---

## VISUAL FOUNDATIONS

**Overall vibe:** Trustworthy and optimistic. Clean, generous white space on a warm off-white page, anchored by a confident teal and lit with saffron. Feels professional enough for enterprise admins, warm enough for a first-time job seeker.

**Color:**
- **Banyan Teal** (`--teal-600` `#0C7E6B`) is the primary — used for primary buttons, links, active nav, brand surfaces. Evokes growth and stability (the banyan tree).
- **Saffron** (`--saffron-500` `#F26B1F`) is the accent — used sparingly for emphasis, highlights, featured tags, and a single hero CTA. Culturally resonant (monks' robes), energetic. Never the dominant color on a screen.
- **Stone** warm-gray neutrals carry 90% of surfaces and text. The page is `--stone-50` (warm off-white), cards are pure white. Text is warm near-black `--stone-900`, never pure `#000`.
- Semantic green/amber/red/blue map to success/warning/danger/info and to job statuses. Status badges are always subtle-bg + saturated-fg pairs.

**Type:** **Sora** for display & headings (geometric, confident, modern), **Plus Jakarta Sans** for UI & body (humanist, highly readable at small sizes), **JetBrains Mono** for IDs/codes/numbers in tables, **Kantumruy Pro** for Khmer. Headings use tight tracking (`-0.02em`) and tight leading; body is 15px at 1.5. Eyebrows are 12px uppercase with `0.08em` tracking in teal.

**Backgrounds:** Predominantly flat warm off-white and white. The **krama weave pattern** appears as a *very subtle* texture in hero panels, footers, and empty states — never loud. Brand/CTA bands use solid teal (`--teal-700/800`), occasionally with a low-opacity weave overlay. No purple gradients, no glassmorphism, no noisy photographic hero washes. Photography (employer/candidate imagery) is warm, natural-light, real-people-at-work — never cold stock-blue.

**Spacing & layout:** 4px base grid. Container max 1200px (1320 wide). Sidebars 260px, top bar 64px. Generous section padding (64–96px on marketing, 24–32px in app). Card grids use CSS grid with 24px gutters.

**Corner radii:** Soft but not bubbly. Inputs/buttons `--radius-md` (10px), cards `--radius-lg` (14px), large feature panels `--radius-xl` (20px). Pills (`--radius-pill`) only for tags/badges and avatars. No sharp 0-radius UI.

**Borders:** Hairline `1px` `--stone-200` for card edges and dividers; `--stone-300` for stronger separation. Inputs use a 1px border that goes teal on focus with a 3px soft ring (`--ring`). Borders do the structural work; shadows are restrained.

**Shadows:** Warm-tinted (`stone-950` at low alpha), never pure-black, always layered (ambient + key). Cards rest at `--shadow-sm`, lift to `--shadow-md` on hover, dialogs/popovers at `--shadow-lg/xl`. Primary CTAs may carry a brand-tinted `--shadow-brand`. Avoid heavy drop shadows.

**Animation:** Calm and quick. Default UI transitions 140–220ms on `--ease-standard`; entrances use `--ease-out` (fade + 8–12px rise). `--ease-spring` is reserved for rare emphasis (e.g. a success check). No infinite decorative loops, no parallax. Respect `prefers-reduced-motion`.

**Hover / press states:**
- *Primary button:* hover → `--brand-hover` (one step darker) + slight shadow lift; press → `--brand-active` + no lift (settles).
- *Secondary/ghost:* hover → `--surface-hover` fill; press → slightly darker.
- *Cards/rows:* hover → `--surface-hover` bg or border-strong + `--shadow-md`; clickable cards translate up 2px.
- Links: hover underline. No opacity-dimming as the primary hover signal.

**Transparency & blur:** Used sparingly — modal scrims `rgba(16,15,12,0.45)`; sticky headers get a `backdrop-filter: blur(8px)` with translucent white. Not used decoratively.

**Cards:** White surface, `--radius-lg`, `1px --border`, `--shadow-sm`, 20–24px internal padding. Featured cards get a saffron accent (top hairline or tag), never a full colored left-border-only treatment.

**Iconography vibe:** Line icons, 1.75px stroke, rounded caps — see ICONOGRAPHY below.

---

## ICONOGRAPHY

- **System icon set: [Lucide](https://lucide.dev)** — open-source, MIT, consistent 24×24 grid, rounded joins/caps, ~1.75–2px stroke. It matches Krama's warm, approachable-but-precise tone. **Substitution flag:** since this is a greenfield brand with no existing icon library, Lucide was chosen as the standard; swap if you adopt another.
- **Delivery:** Linked from CDN in cards and UI kits via `<script src="https://unpkg.com/lucide@latest"></script>` then `lucide.createIcons()`, or inline `<i data-lucide="briefcase"></i>`. For production, install the `lucide-react` package.
- **Default stroke color** inherits `currentColor`; size 18–20px inline with text, 24px standalone. Icons in teal for active/brand, stone-500 for neutral, semantic colors only inside status contexts.
- **Common icons:** `briefcase` (jobs), `building-2` (companies), `map-pin` (location), `search`, `bookmark` (save), `bell` (notifications), `user-round`, `file-text` (résumé), `badge-check` (verified), `check-circle-2` / `clock` / `x-circle` (statuses), `layout-dashboard`, `users`, `chart-line`.
- **Logo / brand marks** are SVG in `assets/` (`krama-mark.svg`, `krama-logo.svg`, `krama-logo-light.svg`, `krama-pattern.svg`).
- **Emoji:** never used. **Unicode glyphs:** avoided as icons. **PNG icons:** none — vector only.

---

## INDEX / MANIFEST

**Root**
- `styles.css` — global entry point (consumers link this). Import-only.
- `readme.md` — this guide. · `SKILL.md` — portable Agent Skill wrapper.

**`tokens/`** — `colors.css`, `typography.css`, `spacing.css`, `elevation.css`, `motion.css`, `base.css`
**`fonts/`** — `fonts.css` (Google Fonts CDN: Sora, Plus Jakarta Sans, JetBrains Mono, Kantumruy Pro)
**`assets/`** — `krama-mark.svg`, `krama-logo.svg`, `krama-logo-light.svg`, `krama-pattern.svg`

**`guidelines/`** — foundation specimen cards (Type, Colors, Spacing, Brand) shown in the Design System tab.

**`components/`** — reusable React primitives (namespace from `check_design_system`):
- `core/` — Button, IconButton, Badge, StatusBadge, Tag, Avatar, Card
- `forms/` — Input, Textarea, Select, Checkbox, Switch
- `data/` — JobCard, CompanyCard, StatCard, Tabs, ProgressTracker, EmptyState

**`ui_kits/`** — full-screen product recreations (each has `index.html` + screen JSX):
- `public-website/` — home, jobs search, job detail
- `candidate-dashboard/` — candidate home, applications tracker
- `employer-dashboard/` — employer home, applicant pipeline
- `admin-dashboard/` — KPI overview, job approval queue

See each kit's `README.md` for screen inventory.
