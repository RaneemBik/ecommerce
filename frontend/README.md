# Nitro — Admin Panel (UI)

Small front-end admin panel demo built with Vite + TypeScript (vanilla DOM).

Quick start

```bash
npm install
npm run dev
# open http://localhost:5173
```

What to know

- Storage keys:
  - `novadash_user` — fake session object
  - `novadash_theme` — theme preference (`dark`|`light`)
  - `nitro_siteName` — persisted site name
  - `novadash_notifications` — persisted notifications array
- Routes:
  - `/` — login
  - `/admin` — admin layout

Testing

```bash
npm install
npm test
```

Improvements added

- Persisted `siteName` to localStorage and load on init
- Notifications persisted to localStorage and per-item read
- Small UI components extracted: `StatCard`, `MiniChart`, `ProgressRing`
- Accessibility: ARIA roles, Escape to close popovers, arrow navigation in sidebar
- Responsive CSS tweaks and reduced-motion support
- Basic Vitest test and GitHub Actions workflow

Next recommendations

- Extract more components (`Topbar`, `StatList`), add unit tests for pages.
- Improve keyboard focus styles and screen-reader labels.
- Add E2E tests and CI deploy step if desired.
