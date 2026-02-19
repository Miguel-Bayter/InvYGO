# InvYGO Interface System

## Direction and Feel
- HUD-inspired TCG interface with luminous cyan accents over deep blue-violet space.
- Prioritize cinematic hero composition: rotating carousel, character silhouette, anchored utility panel.
- Visual tone: tactical, clean, slightly futuristic; avoid playful rounded UI.

## Color and Surface Strategy
- Base canvas: deep navy and indigo overlays with subtle glow.
- Accent: cyan for primary emphasis (`catalog`, active links, focused actions).
- Surface panels: translucent blue gradients with soft blur and low-opacity cyan border.
- Text hierarchy:
  - Primary: near-white
  - Secondary: cool gray-blue
  - Muted/meta: lower-contrast desaturated blue-gray

## Depth Strategy
- Primary depth model is border-led with restrained shadows.
- Layering order for hero scene:
  1. Background artwork and grid overlays
  2. Character model
  3. UI chrome/panel
  4. Carousel cards (must pass in front of panel/model when intersecting)
- Keep drop shadows soft and diffuse; avoid hard black elevation blocks.

## Spacing Scale
- Base spacing unit: 4px.
- Typical component spacing:
  - Micro: 4px
  - Tight: 6-8px
  - Standard: 10-12px
  - Section: 16-24px

## Typography
- Hero wordmark: `ICA Rubrik` for strong display identity.
- UI controls and labels: project mono token (`var(--font-mono)`) in uppercase with tracking.
- Body copy: compact, right-aligned in hero panel for desktop and mobile consistency.

## Core Component Patterns

### Hero Action Panel
- Right-anchored panel on desktop, full-width inset panel on mobile.
- Compact heading + subtitle + 3-button action row.
- Buttons share equal visual weight with subtle cyan border and transparent fill variants.

### Carousel Cards
- 3D ring with consistent card ratio and controlled perspective.
- Two-face behavior (art/reverse) with configurable outer face.
- Default card count for refresh/reset: fixed at 10 unique cards.

### Responsive Rules
- Target range: 320px to 2560px.
- Mobile first adjustments focus on preserving:
  - title legibility,
  - 3-button row stability,
  - non-overlapping hero composition.
- Keep desktop composition stable; only tune panel density and scale across breakpoints.
