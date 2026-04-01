# Intent Management Page Design

## Problem and Goal
We need to implement a new frontend page from provided HTML mock content in the current Vite + React + TypeScript + TanStack Router + shadcn/Tailwind stack.

Goal for this pass:
- Add a new route at `/intents`
- Recreate the provided page structure and hierarchy
- Adapt styles to existing project design tokens/components
- Keep controls presentational-only (no behavior yet)

## Scope
In scope:
- New route wiring for `/intents`
- New page component with static, typed mock data
- Layout sections:
  - Sidebar navigation
  - Top header
  - Page heading and action buttons
  - 3 KPI cards
  - Library manifest table
  - Suggestion engine cards
  - Indexing health panel
- Styling aligned to existing Tailwind/shadcn token usage

Out of scope:
- API integration
- Search/filter/pagination behavior
- Button action handlers
- Authentication/authorization
- Responsive redesign beyond sensible layout adaptation

## Current Codebase Context
- Routing is configured manually via TanStack Router route objects:
  - `src/routes/__root.tsx`
  - `src/routes/index.tsx`
  - `src/app/router/router.tsx`
- Providers already wrap app with Query + Router.
- `src/components/ui/button.tsx` exists (shadcn variant system).
- Base styling uses Tailwind and CSS variables from `src/index.css`.

## Approach Options Considered
1. Pixel-close custom markup/classes
   - Fastest for direct visual copy
   - Lower reuse and less consistent with existing design system

2. **Selected**: shadcn primitives + light custom layout wrappers
   - Good consistency/maintainability balance
   - Reuses project button/tokens and existing utility patterns

3. Fully modular dashboard architecture from day one
   - Most scalable long-term
   - Higher upfront complexity for initial page delivery

## Final Design

### 1) Route and Component Structure
- Add `src/routes/intents.tsx` using `createRoute` with:
  - parent: `rootRoute`
  - path: `/intents`
  - component: `IntentManagementPage`
- Update `src/app/router/router.tsx` to include `intentsRoute` in `rootRoute.addChildren`.
- Keep route-driven composition simple for now (single page component with local section subcomponents/helpers if needed).

### 2) Page Composition
`IntentManagementPage` will render these blocks in order:
1. Fixed left sidebar
2. Fixed top bar (offset by sidebar width)
3. Main content area with:
   - Header/title + action buttons
   - Metrics grid (3 cards)
   - Manifest table card (header + table + footer pagination row)
   - Bottom split: suggestion engine + indexing health card

Data source pattern:
- Use local `const` arrays/objects for:
  - nav items
  - KPI metrics
  - table rows
  - suggestion cards
  - health progress rows
- Add explicit TypeScript types for clarity and later API migration.

### 3) Styling Strategy
- Map to project token classes (`bg-background`, `bg-card`, `text-foreground`, `text-muted-foreground`, `border-border`) instead of importing custom palette.
- Keep visual accents from design via:
  - gradient utility classes for primary CTAs/panel
  - rounded cards, subtle shadows, small uppercase labels
  - status badges with semantic colors
- Use `lucide-react` icons (already in dependencies) instead of Google Material Symbols.

### 4) Accessibility and Semantics
- Use semantic structure (`aside`, `header`, `main`, `nav`, `table`, `thead`, `tbody`).
- Ensure icon-only controls include `aria-label`.
- Preserve clear text contrast via existing token system.
- Keep truncated table descriptions accessible with `title` where needed.

### 5) Error Handling
- No runtime data fetching in this pass, so no async/error boundary additions needed.
- Route-level existing root error component remains unchanged.

### 6) Testing Plan
- Add a focused route test similar to existing router tests:
  - render app at `/intents`
  - assert key headings/labels exist (`Intent Management`, `Library Manifest`, etc.)
- Keep tests behavior-oriented (presence of sections), not brittle pixel/style assertions.

## Implementation Notes
- Reuse existing `Button` component where practical; use plain semantic elements where variants don’t fit.
- Avoid introducing new global CSS unless utility classes are insufficient.
- Keep component boundaries clean so future interactivity can be added section-by-section.

## Acceptance Criteria
- Visiting `/intents` renders the full static page layout.
- Existing `/` route still works.
- App builds, lints, and tests pass.
- New page visually matches the provided structure while staying consistent with current design system tokens.
