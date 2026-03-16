# apps/web

This is the main React application for **InventoryYGO**.

For full documentation — features, architecture, getting started, and roadmap — see the [root README](../../README.md).

## Local development

```bash
# From the repo root
npm install
npm run dev
```

## Scripts (run from repo root or this directory)

| Command | Description |
|---|---|
| `npm run dev` | Start Vite dev server on port 5173 |
| `npm run build` | Type-check + production build → `dist/` |
| `npm run typecheck` | `tsc --noEmit` — must pass with 0 errors |
| `npm run lint` | ESLint check |
| `npm run lint:fix` | ESLint + auto-fix Prettier formatting |
| `npm run format` | Prettier write on `src/**/*.{ts,tsx}` |
| `npm run preview` | Preview the production build locally |
