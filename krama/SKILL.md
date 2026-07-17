---
name: krama-design
description: Use this skill to generate well-branded interfaces and assets for Krama (a Southeast-Asia job portal), either for production or throwaway prototypes/mocks. Contains essential design guidelines, colors, type, fonts, assets, and UI kit components for prototyping.
user-invocable: true
---

# Krama Design System

Krama is a modern job portal connecting talent and verified employers across Cambodia and Southeast Asia (public website + candidate / employer / admin portals, with an approval workflow and Khmer + English support).

Read **README.md** in this skill first — it holds the full design guide: brand story, content fundamentals (voice, casing, bilingual rules), visual foundations (color, type, spacing, shadows, motion, hover/press), and iconography (Lucide). Then explore the other files.

## What's here
- `styles.css` — single global entry point (link this). Pulls in `tokens/*.css` (colors, typography, spacing, elevation, motion, base) and `fonts/fonts.css`.
- `tokens/` — CSS custom properties: base scales (`--teal-600`, `--saffron-500`, `--stone-900`) and semantic aliases (`--brand`, `--surface-card`, `--text-body`, `--status-pending-bg`, …).
- `assets/` — logo (`krama-logo.svg`, `krama-logo-light.svg`), mark (`krama-mark.svg`), weave motif (`krama-pattern.svg`).
- `components/` — React primitives: `core/` (Button, IconButton, Badge, StatusBadge, Tag, Avatar, Card), `forms/` (Input, Textarea, Select, Checkbox, Switch), `data/` (JobCard, CompanyCard, StatCard, Tabs, ProgressTracker, EmptyState).
- `ui_kits/` — full interactive screens: `public-website/`, `candidate-dashboard/`, `employer-dashboard/`, `admin-dashboard/`. Each has an `index.html` + screen `.jsx` + `README.md`.

## How to use
- **Visual artifacts** (slides, mocks, throwaway prototypes): copy the assets and token CSS you need out into static HTML files the user can open. Reference the tokens by variable; pull components' visual patterns from `components/` and `ui_kits/`.
- **Production code**: read the rules here and reuse the token names + component APIs to design accurately on-brand.

## Brand quick reference
- **Primary** Banyan Teal `--brand` (#0C7E6B) · **Accent** Saffron `--accent` (#F26B1F, sparingly) · warm **Stone** neutrals on an off-white page.
- **Type** Sora (display) · Plus Jakarta Sans (UI/body) · JetBrains Mono (data) · Kantumruy Pro (Khmer). Sentence case everywhere; ALL-CAPS only for tiny eyebrow labels.
- **Voice** warm, direct, encouraging; address the user as "you"; verb-first CTAs ("Apply now", "Post a job"); no emoji.
- **Shape** soft radii (cards 14px, controls 10px), hairline stone borders, warm layered shadows, calm 140–220ms motion.

If invoked without specifics, ask the user what they want to build, ask a few focused questions, then act as an expert Krama designer — outputting HTML artifacts or production code as the need dictates.
