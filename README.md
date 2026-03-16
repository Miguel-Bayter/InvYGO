<div align="center">

# InvYGO

**Yu-Gi-Oh! Card Inventory & Deck Builder**

A production-grade single-page application for managing your physical Yu-Gi-Oh! card collection, building competitive decks, and tracking cards you still need to acquire.

[![Live Demo](https://img.shields.io/badge/Live%20Demo-invygo.netlify.app-00c7ff?style=for-the-badge&logo=netlify&logoColor=white)](https://invygo.netlify.app)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178c6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19-61dafb?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-7-646cff?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge)](LICENSE)

<img src="apps/web/public/favicon-card.svg" width="320" alt="InvYGO Logo" style="border-radius: 24px; box-shadow: 0 0 40px #00c7ff88; margin: 16px 0;" />

</div>

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Getting Started](#getting-started)
- [Available Scripts](#available-scripts)
- [API Integration](#api-integration)
- [Business Rules](#business-rules)
- [Deployment](#deployment)
- [Roadmap](#roadmap)
- [Contributing](#contributing)
- [License](#license)

---

## Overview

InvYGO is a **full-featured frontend application** built for collectors and competitive players of the Yu-Gi-Oh! Trading Card Game. The app consumes a real external REST API and enforces official TCG rules at the business logic layer.

The project was designed and built **solo from scratch** across 6 sprints, with emphasis on clean architecture, type safety, real-world UX patterns, and visual identity.

---

## Features

### Catalog
- Search the complete YGO card database (40,000+ cards) via a proxied REST API
- **Fuzzy name search** with debouncing and request cancellation via `AbortController`
- **Advanced filters**: attribute, level/rank, ATK/DEF, race, archetype (populated from API)
- Filter state **persisted in the URL** — shareable and refresh-safe
- **Dual view**: list (data-dense) and gallery (visual) with smooth toggle
- **Card tooltip** on hover: image, effect text, ATK/DEF stats, attribute icon, type line — positioned via `createPortal` with smart edge detection

### Inventory
- Add any card from the catalog to your personal collection
- Set quantity per card, search/filter your owned cards
- **Sort** by name (A→Z, Z→A), quantity (high→low, low→high), or date added
- Persistent across sessions via `localStorage`

### Deck Builder
- Create, rename, duplicate, and delete decks
- **Official TCG rules enforced**:
  - Main Deck: 40–60 cards
  - Extra Deck: 0–15 cards (Fusion, Synchro, XYZ, Link auto-routed)
  - Side Deck: 0–15 cards
  - Maximum 3 copies of any card **across all three sections combined**
- **Dual view**: list mode (steppers + missing badge) and gallery mode (card tiles with overlay actions)
- **Deck status chip**: VALID / INCOMPLETE / INVALID computed in real time
- **Advanced card search**: filter by attribute, race, and level directly inside the deck builder modal
- **Export to JSON** — full deck with card snapshots; import back without any API calls
- **Export to YDK** — standard `.ydk` format compatible with YGOPro / EDOPro simulators
- **Import from JSON or YDK** — auto-detected by file extension; YDK import resolves card data from the API in parallel
- **Missing Cards Panel**: click any missing card to jump straight to the catalog with the name pre-loaded
- **Coverage bar**: % of deck covered by current inventory
- Deck data snapshot approach — card objects stored with entries for offline-safe access

### UX & Visual Design
- **HUD gamer aesthetic** with a custom design token system (CSS custom properties)
- **Yu-Gi-Oh! typography**: Cinzel (card names, headings) + Crimson Pro (effect text) — matching official TCG fonts
- **Toast notification system** (success / error / warning / info) with portal rendering
- **Bilingual**: Spanish / English with runtime toggle, zero page reload (react-i18next)
- **Responsive**: desktop-first with full mobile support across all pages
- 3D card carousel on homepage with configurable inner/outer face styles

---

## Tech Stack

| Category | Technology |
|---|---|
| UI | React 19, TypeScript 5.9 |
| Build | Vite 7, npm Workspaces (monorepo) |
| Routing | React Router v7 |
| Data Fetching | TanStack Query v5, Axios |
| Styling | CSS Modules + Tailwind CSS v4 (utility layer) |
| i18n | i18next v25, react-i18next, browser language detector |
| Client state | Zustand v5 |
| Persistence | localStorage (inventory, decks, carousel config) |
| Deployment | Netlify (SPA redirect + API proxy) |
| Quality | ESLint 9, Prettier, TypeScript strict mode |

---

## Architecture

```
InventoryYGO/                    ← npm workspaces monorepo
├── apps/
│   └── web/
│       └── src/
│           ├── features/        ← Feature-sliced structure
│           │   ├── catalog/     ← API client, hooks, components, filters
│           │   ├── inventory/   ← Context, storage, modal, grid
│           │   ├── decks/       ← Context, storage, builder, sidebar, panel
│           │   └── carousel/    ← Reusable 3D carousel component
│           ├── pages/           ← Route-level components
│           ├── components/      ← Shared UI (layout, Navbar, Toast, EmptyState)
│           ├── i18n/            ← ES / EN locale files
│           └── styles/          ← Design tokens, global CSS
├── Docs/                        ← Sprint planning & roadmap
└── netlify.toml                 ← Build config + API proxy + SPA fallback
```

### Key Design Decisions

**Feature-sliced architecture** — Each feature (`catalog`, `inventory`, `decks`, `carousel`) is self-contained with its own context, storage, types, hooks, and components. Cross-feature dependencies go one-way: `decks` reads from `inventory`, never the reverse.

**Context + localStorage pattern** — No external state management library. Each feature owns a React Context with a custom hook (`useInventory`, `useDecks`, `useCarousel`). Persistence is handled by a thin `storage.ts` module that silently recovers from corrupt data.

**Snapshot entries in decks** — When a card is added to a deck, the full card object is stored inside the entry. This means deck data is self-contained and doesn't re-fetch the API on load, making the builder work fully offline after initial load.

**Proxy on both dev and production** — Vite dev proxy + Netlify redirect rules handle CORS transparently. No environment-specific API URLs in source code.

**URL-as-state for filters** — All catalog filter values live in `URLSearchParams`. Bookmarks, browser back/forward, and link sharing all work natively.

---

## Getting Started

### Prerequisites

- Node.js ≥ 20.0.0
- npm ≥ 10

### Installation

```bash
git clone https://github.com/your-username/InventoryYGO.git
cd InventoryYGO
npm install
```

### Development

```bash
npm run dev
```

Opens at `http://localhost:5173`. The Vite dev proxy forwards `/ygo-api/*` requests to the YGO API, so no `.env` file is needed.

### Type Check

```bash
npm run typecheck
```

### Lint

```bash
npm run lint          # check
npm run lint:fix      # auto-fix (ESLint + Prettier)
```

### Production Build

```bash
npm run build
# Output: apps/web/dist/
```

---

## API Integration

The app integrates with a YGO Card Database REST API that exposes:

| Endpoint | Description |
|---|---|
| `GET /api/v1/cards` | Paginated card list with filter params |
| `GET /api/v1/archetypes` | Full archetype list for filter dropdown |

**Filter parameters supported**: `name`, `fuzzyName`, `attribute`, `level`, `atk`, `def`, `race`, `archetype`, `page`, `limit`

All requests use TanStack Query for caching, background refetch, and loading/error states. Each search request carries an `AbortController` signal — navigating away or typing a new query cancels in-flight requests immediately.

---

## Business Rules

The deck builder enforces **official Konami TCG rules** at the application layer:

```
Main Deck:   40 ≤ cards ≤ 60
Extra Deck:   0 ≤ cards ≤ 15   (Fusion / Synchro / XYZ / Link types only)
Side Deck:    0 ≤ cards ≤ 15
Copies:       max 3 per card name, counted across ALL sections
```

Auto-routing: adding a Fusion/Synchro/XYZ/Link card while Main is selected silently redirects it to Extra (with a toast notification). Non-extra cards added to Extra route to Main.

---

## Deployment

The app deploys to **Netlify** as a static SPA. No server-side rendering or backend required.

```bash
# Build for production
npm run build
# Output: apps/web/dist/
```

**Netlify setup:**
1. Connect repo → set build command to `npm run build` and publish directory to `apps/web/dist`
2. Add a `_redirects` file (or `netlify.toml`) to handle SPA routing:
   ```
   /*  /index.html  200
   ```
3. Add the API proxy rule to avoid CORS in production (see `netlify.toml`)

The app has **no required environment variables** — all configuration (API base URL, timeouts) lives in source code. No `.env` file is needed to build or run locally.

---

## Roadmap

| Sprint | Feature | Status |
|---|---|---|
| 1 | Project foundation, routing, API client | ✅ Done |
| 2 | Card catalog v1 — search & pagination | ✅ Done |
| 3 | Advanced filters, URL state, i18n, card tooltip | ✅ Done |
| 4 | Inventory — add, edit, persist | ✅ Done |
| 5 | Deck Builder v1 — CRUD, sections, missing cards panel | ✅ Done |
| 6 | Deck refinement — export/import JSON & YDK, advanced search in builder, missing → catalog link | ✅ Done |
| 7 | Marketplaces — price display, buy links from missing cards | 🔜 Planned |
| 8 | Hardening & beta — E2E tests, performance, error resilience | 🔜 Planned |

---

## Project Highlights

- **Zero external state library** — full application state managed with React Context, `useReducer`-style patterns, and `localStorage` persistence
- **TypeScript strict mode** throughout — no `any`, exhaustive types for all API responses, deck entries, and context values
- **Internationalization from day one** — every string is a translation key; language switches at runtime without remounting
- **Real API, real data** — not a mock; the catalog queries a live YGO database with 40,000+ cards
- **Official rule enforcement** — the 3-copy limit is enforced across sections in both `addCard` and `updateQuantity`, with clamping logic rather than hard blocks
- **Accessible modals** — Escape key closes all modals; click-outside dismisses overlays; focus trapping on rename inputs

---

## Contributing

This is a personal portfolio project — issues and suggestions are welcome via [GitHub Issues](https://github.com/your-username/InventoryYGO/issues).

If you'd like to contribute:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature-name`
3. Make your changes and ensure all checks pass:
   ```bash
   npm run typecheck   # must exit 0
   npm run lint        # must exit 0
   ```
4. Commit with a descriptive message and open a Pull Request

**Code standards:**
- TypeScript strict mode — no `any`, no type assertions without justification
- All user-visible strings must use i18n keys (add to both `es.json` and `en.json`)
- CSS goes in CSS Modules files, not inline styles
- Follow the existing feature-sliced folder convention

---

## License

MIT License — see [LICENSE](LICENSE) for details.

You are free to use, modify, and distribute this project for personal or commercial purposes with attribution.

---

## Author

**Miguel Bayter** — Full Stack Developer

[![LinkedIn](https://img.shields.io/badge/LinkedIn-Miguel%20Bayter-0077b5?style=flat-square&logo=linkedin)](https://linkedin.com/in/miguelbayter)
[![GitHub](https://img.shields.io/badge/GitHub-mbayt-181717?style=flat-square&logo=github)](https://github.com/mbayt)

---

<div align="center">

Built with React 19 · TypeScript · Vite · TanStack Query · react-i18next

</div>
