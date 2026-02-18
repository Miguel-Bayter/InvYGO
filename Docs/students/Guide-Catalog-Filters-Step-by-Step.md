# InvYGO Student Guide - Catalog Filters Step by Step

## 1) Goal of this guide

This document explains, from zero, what we changed in the Catalog and why.
It is written for beginners.

At the end you should understand:

- How filters work in this project.
- Why some filters (Normal, XYZ, Ritual, Link, Spell, Trap, Token) were failing.
- How we fixed those issues.
- How to write similar React code with good practices.
- Which errors can appear and how to solve them.

---

## 2) Quick map of important files

- `apps/web/src/features/catalog/api.ts`
  - Calls the API (`fetchCards`, `fetchArchetypes`).
- `apps/web/src/features/catalog/hooks/useCards.ts`
  - Main logic for card fetching, debounce, retries, cache, and client-only filters.
- `apps/web/src/pages/CatalogPage.tsx`
  - Page orchestration (filters, cards, pagination, loading/error states).
- `apps/web/src/features/catalog/components/FilterBar.tsx`
  - UI inputs for filters.
- `apps/web/src/i18n/locales/en.json`
- `apps/web/src/i18n/locales/es.json`
  - Translations.

---

## 3) The root technical problem (simple explanation)

### What users expected

When selecting `Type` (example: `Normal` or `XYZ`), users expected a full page of results (20 cards in a 5-column grid), same behavior as other filters.

### What was actually happening

The backend API does **not** support filtering by `frameType` directly.
So the app had to:

1. Fetch generic pages from API.
2. Filter those results on the frontend.

If we only filtered one API page, rare types could return 2-4 cards.

### Extra issue

For rare types, frontend needed many API requests to collect enough cards.
That could trigger upstream limits (`429 Too Many Requests`) or temporary outages (`503 Service Unavailable`).

---

## 4) What we changed (high level)

### A) Better client-side filter engine

In `useCards.ts` we built a progressive collector:

- Fetches API pages in batches (`limit=100`).
- Applies client-only filters (`frameType`, `hideTokens`).
- Keeps collecting until there are enough cards for the current UI page.

### B) Incremental cache per filter combination

We added an in-memory cache keyed by all filter values:

- name/fuzzyName
- attribute
- level
- atk
- def
- race
- archetype
- frameType
- hideTokens

This avoids restarting from API page 1 every time.

### C) Retry + backoff for unstable API

We added retry logic for `429/503`:

- Retry several times.
- Wait more time between retries (backoff).
- Add a tiny delay between scanned pages to reduce request bursts.

### D) Numeric filters support

ATK/DEF now accept:

- exact numbers (example `2500`)
- unknown value with `?` (mapped to `-1`)

This was done in `parseStatFilter`.

### E) i18n and English base

We moved UI literals to translation files where needed and kept codebase literals in English.

---

## 5) Step-by-step: how to implement this pattern from scratch

Use this exact sequence when building a new filtered list in React.

1. **Create API layer first**
   - Keep raw HTTP logic in one file (`api.ts`).
   - Return normalized data types.

2. **Create UI filter state as strings**
   - Keep all input values as strings in UI state.
   - Parse values later in the data hook.

3. **Debounce user inputs**
   - Debounce text and numeric inputs to reduce requests.

4. **Parse safely before request**
   - Convert string inputs to numbers only if valid.
   - Keep invalid intermediate typing from breaking requests.

5. **Use query keys with all relevant filters**
   - Include everything that affects results in `queryKey`.

6. **Handle server filters and client-only filters separately**
   - Server-supported filters go in API params.
   - Client-only filters run after API response.

7. **For rare client-only filters, collect across API pages**
   - Loop pages and accumulate matches until enough cards.

8. **Add retries for unstable services**
   - Retry `429/503` with backoff.

9. **Cache accumulated data**
   - Reuse previous scan progress for same filter combination.

10. **Keep UI states clear**
   - Loading, Error, Empty, and Data states must be explicit.

---

## 6) React coding style used here (academic notes)

### Separate concerns

- Components render UI only.
- Hooks handle logic/state/fetching.
- API layer handles HTTP details.

### Why this matters

- Easier testing.
- Easier refactor.
- Easier onboarding for new team members.

### TypeScript rules we follow

- Declare interfaces for params and responses.
- Avoid `any`.
- Normalize API output into stable internal types.

### Query design rule

If a value changes the response, it must be in `queryKey`.

### i18n rule

- No user-facing text hardcoded in components.
- Put text keys in locale JSON.
- Keep fallback language explicit.

---

## 7) Common errors and solutions

### Error: `429 Too Many Requests`

Meaning: too many calls in short time.

Solutions:

- Add debounce to inputs.
- Add delay between page scans.
- Add retry with backoff.
- Use incremental cache so you do not restart scans.

### Error: `503 Service Unavailable`

Meaning: upstream API is temporarily down.

Solutions:

- Retry with backoff.
- Show clear error message with retry button.
- Do not crash whole page.

### Error: `400 Bad Request`

Meaning: unsupported query param sent to API.

Example in this project:

- `type` and `frameType` are not accepted by wrapper API.

Solutions:

- Remove unsupported params.
- Do those filters client-side.

### Symptom: only 2-4 cards for a filter

Meaning: likely filtering only current API page.

Solutions:

- Aggregate across multiple API pages.
- Keep collecting until current UI page is filled.

---

## 8) How to write the code (small template)

Use this structure when you write future hooks:

```ts
// 1) parse
const parsedValue = parseInput(rawValue)

// 2) build params
const serverParams = { ... }

// 3) decide strategy
if (needsClientOnlyFilter) {
  return fetchWithProgressiveClientFilter(...)
}

return fetchDirect(...)
```

Key point: always isolate parse/build/strategy into clear blocks.

---

## 9) Manual QA checklist (student workflow)

1. Open Catalog.
2. Verify default loads 20 cards.
3. Test `Type=Normal` -> check if page fills to 20.
4. Test `Type=XYZ` -> check if page fills to 20.
5. Test `Type=Ritual` -> verify no hard crash.
6. Test `Type=Token` -> verify behavior is stable.
7. Test `ATK=2500`, `DEF=2100`, `DEF=?`.
8. Test switch language EN/ES.
9. Run build:

```bash
npm run build
```

---

## 10) Final notes for students

- Build reliable behavior first, then optimize.
- If API does not support a filter, be explicit and design a safe client strategy.
- Always plan for unstable networks and rate limits.
- Keep user messages clear and actionable.

If you get stuck, start from `useCards.ts` and trace data flow top to bottom.
