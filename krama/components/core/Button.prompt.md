Primary action control — use for the single most important action in a view; pair with `secondary`/`ghost` for lesser actions and `accent` (saffron) only for one standout marketing CTA.

```jsx
<Button variant="primary" size="md" onClick={apply}>Apply now</Button>
<Button variant="secondary" iconLeft={<i data-lucide="bookmark" />}>Save job</Button>
<Button variant="accent" size="lg">Post a job</Button>
<Button variant="ghost">Cancel</Button>
<Button variant="danger" loading>Reject</Button>
```

Variants: `primary` (teal), `accent` (saffron, sparingly), `secondary` (outline), `ghost`, `danger`. Sizes `sm | md | lg`. Props: `block`, `loading`, `disabled`, `iconLeft`, `iconRight`.
