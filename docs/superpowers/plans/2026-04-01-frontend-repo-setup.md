# Frontend Repo Setup (Vite + shadcn + TanStack) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a production-ready frontend infrastructure repository using Vite + React + TypeScript, shadcn/ui, and TanStack Router/Query/Table with a REST-ready client and baseline tests.

**Architecture:** A single Vite app with clear boundaries: app bootstrapping in `src/app`, route declarations in `src/routes`, reusable UI in `src/components/ui`, domain logic in `src/features`, and shared primitives in `src/lib/api` and `src/lib/table`. Use TanStack Query for server-state, TanStack Router for navigation/error boundaries, and thin typed wrappers for API interactions.

**Tech Stack:** pnpm, Vite, React, TypeScript (strict), TanStack Router, TanStack Query, TanStack Table, shadcn/ui, Vitest, Testing Library, ESLint.

---

### Task 1: Bootstrap project and baseline tooling

**Files:**
- Create: `package.json` (via scaffold)
- Create: `tsconfig.json` and Vite defaults (via scaffold)
- Create: `eslint.config.*` (via scaffold/templates)
- Create: `src/main.tsx`, `src/App.tsx`, `src/index.css` (via scaffold; later replaced)

- [ ] **Step 1: Scaffold Vite React TypeScript app**

Run: `pnpm create vite . --template react-ts`
Expected: app scaffolded at repo root

- [ ] **Step 2: Install and verify dependencies**

Run: `pnpm install`
Expected: lockfile generated, install succeeds

- [ ] **Step 3: Add baseline scripts check**

Run: `pnpm run build && pnpm run lint`
Expected: both commands pass on clean scaffold

- [ ] **Step 4: Commit bootstrap**

```bash
git add .
git commit -m "chore: scaffold vite react ts frontend"
```

### Task 2: Configure test harness (Vitest + Testing Library)

**Files:**
- Modify: `package.json`
- Modify: `vite.config.ts`
- Create: `src/test/setup.ts`
- Create: `src/test/smoke.test.tsx`

- [ ] **Step 1: Add testing dependencies**

Run: `pnpm add -D vitest jsdom @testing-library/react @testing-library/jest-dom @testing-library/user-event`
Expected: test dependencies installed

- [ ] **Step 2: Wire test config**

Add Vitest config (`environment: "jsdom"`, `setupFiles: ["./src/test/setup.ts"]`) and add scripts:
- `"test": "vitest"`
- `"test:run": "vitest run"`

- [ ] **Step 3: Add setup file**

Create `src/test/setup.ts` importing `@testing-library/jest-dom`.

- [ ] **Step 4: Add minimal smoke test and verify harness**

Create `src/test/smoke.test.tsx`:

```tsx
import { describe, expect, it } from "vitest";

describe("test harness", () => {
  it("runs", () => {
    expect(true).toBe(true);
  });
});
```

Run: `pnpm vitest src/test/smoke.test.tsx --run`
Expected: PASS

- [ ] **Step 5: Commit test harness**

```bash
git add package.json pnpm-lock.yaml vite.config.ts src/test/setup.ts src/test/smoke.test.tsx
git commit -m "test: configure vitest and testing library harness"
```

### Task 3: Install and wire TanStack libraries (code-based router)

**Files:**
- Modify: `package.json`
- Create: `src/app/router/router.tsx`
- Create: `src/routes/__root.tsx`
- Create: `src/routes/index.tsx`

- [ ] **Step 1: Write failing router smoke test**

**Test file:** `src/app/router/router.test.tsx`

```tsx
import { describe, expect, it } from "vitest";

describe("router bootstrap", () => {
  it("creates a router instance", () => {
    expect(true).toBe(false);
  });
});
```

- [ ] **Step 2: Run test to verify failure**

Run: `pnpm vitest src/app/router/router.test.tsx`
Expected: FAIL

- [ ] **Step 3: Install TanStack deps**

Run: `pnpm add @tanstack/react-router @tanstack/react-query @tanstack/react-table`
Expected: packages installed

- [ ] **Step 4: Implement minimal router bootstrap**

Use code-based route wiring with explicit route tree construction:
- create root route and layout in `src/routes/__root.tsx`
- create index route in `src/routes/index.tsx`
- build route tree in `src/app/router/router.tsx` using `rootRoute.addChildren([indexRoute])`
- export the router for provider composition in Task 4 (do not mount in `main.tsx` yet)

- [ ] **Step 5: Update smoke test to pass**

Replace placeholder assertion with router instance assertion.

- [ ] **Step 6: Re-run targeted test**

Run: `pnpm vitest src/app/router/router.test.tsx`
Expected: PASS

- [ ] **Step 7: Commit TanStack wiring**

```bash
git add package.json pnpm-lock.yaml src/
git commit -m "feat: wire tanstack router query table foundations"
```

### Task 4: Add app providers and QueryClient composition

**Files:**
- Create: `src/app/providers/AppProviders.tsx`
- Modify: `src/main.tsx`
- Test: `src/app/providers/AppProviders.test.tsx`

- [ ] **Step 1: Write failing provider test**

Test should assert wrapped children render with providers mounted.

- [ ] **Step 2: Run provider test and confirm fail**

Run: `pnpm vitest src/app/providers/AppProviders.test.tsx`
Expected: FAIL (missing module/provider)

- [ ] **Step 3: Implement minimal provider composition**

Add `QueryClientProvider` and router provider composition in `AppProviders.tsx`; wire in `main.tsx`.

- [ ] **Step 4: Run provider test again**

Run: `pnpm vitest src/app/providers/AppProviders.test.tsx`
Expected: PASS

- [ ] **Step 5: Commit provider composition**

```bash
git add src/app/providers src/main.tsx
git commit -m "feat: add app provider composition with query client"
```

### Task 5: Configure TanStack devtools (development only)

**Files:**
- Modify: `package.json`
- Modify: `src/app/providers/AppProviders.tsx`
- Test: `src/app/providers/AppProviders.test.tsx`

- [ ] **Step 1: Write failing dev-only render test**

Test should assert TanStack Router/Query devtools are only mounted in development mode.

- [ ] **Step 2: Run targeted test and confirm failure**

Run: `pnpm vitest src/app/providers/AppProviders.test.tsx`
Expected: FAIL

- [ ] **Step 3: Install and wire devtools**

Run: `pnpm add @tanstack/router-devtools @tanstack/react-query-devtools`
Expected: packages installed and `AppProviders` conditionally renders devtools only in dev.

- [ ] **Step 4: Re-run targeted test**

Run: `pnpm vitest src/app/providers/AppProviders.test.tsx`
Expected: PASS

- [ ] **Step 5: Commit devtools setup**

```bash
git add -A
git commit -m "feat: add tanstack devtools for development only"
```

### Task 6: Initialize shadcn/ui baseline

**Files:**
- Create: `components.json`
- Modify: `tailwind.config.*` / `postcss.config.*` (if generated by shadcn init path)
- Modify: `src/index.css` (tokens/layers)
- Create: `src/components/ui/*` (generated components)

- [ ] **Step 1: Add required styling deps for shadcn path**

Run: `pnpm add -D tailwindcss postcss autoprefixer`
Expected: dev dependencies added

- [ ] **Step 2: Initialize shadcn with neutral defaults**

Run: `pnpm dlx shadcn@latest init`
When prompted, choose:
- framework: `Vite`
- style: `Default`
- base color: `Slate`
- CSS variables: `Yes`
- global CSS path: `src/index.css`
- import alias: `@/*` (or the project default alias if scaffold differs)
Expected: `components.json` and base styling setup generated

- [ ] **Step 3: Add one validation component**

Run: `pnpm dlx shadcn@latest add button`
Expected: `src/components/ui/button.tsx` created

- [ ] **Step 4: Verify build still passes**

Run: `pnpm run build`
Expected: PASS

- [ ] **Step 5: Commit shadcn setup**

```bash
git add -A
git commit -m "feat: initialize shadcn ui baseline"
```

### Task 7: Add REST client scaffold with explicit error mapping

**Files:**
- Create: `src/lib/api/types.ts`
- Create: `src/lib/api/errors.ts`
- Create: `src/lib/api/client.ts`
- Test: `src/lib/api/client.test.ts`

- [ ] **Step 1: Write failing API client tests**

Add tests for:
- maps non-2xx response to normalized error shape
- parses typed JSON on 2xx response

- [ ] **Step 2: Run API tests to confirm failure**

Run: `pnpm vitest src/lib/api/client.test.ts`
Expected: FAIL

- [ ] **Step 3: Implement minimal API client**

Implement typed `get`/`post` wrappers and normalized error mapper `{ status, code, message }`.

- [ ] **Step 4: Re-run API tests**

Run: `pnpm vitest src/lib/api/client.test.ts`
Expected: PASS

- [ ] **Step 5: Commit API layer**

```bash
git add src/lib/api
git commit -m "feat: add typed rest api client scaffold"
```

### Task 8: Add TanStack Table helper scaffold

**Files:**
- Create: `src/lib/table/createTable.ts`
- Create: `src/features/health/columns.tsx`
- Test: `src/lib/table/createTable.test.ts`

- [ ] **Step 1: Write failing table helper test**

Test should assert helper produces typed column definitions.

- [ ] **Step 2: Run targeted table test**

Run: `pnpm vitest src/lib/table/createTable.test.ts`
Expected: FAIL

- [ ] **Step 3: Implement minimal table helper**

Create reusable helper around TanStack Table column helper utilities.

- [ ] **Step 4: Re-run table test**

Run: `pnpm vitest src/lib/table/createTable.test.ts`
Expected: PASS

- [ ] **Step 5: Commit table helper**

```bash
git add src/lib/table src/features/health/columns.tsx
git commit -m "feat: add tanstack table helper scaffold"
```

### Task 9: Route error boundary + baseline route sanity

**Files:**
- Modify: `src/routes/__root.tsx`
- Modify: `src/routes/index.tsx`
- Test: `src/routes/router-navigation.test.tsx`

- [ ] **Step 1: Write failing navigation/error test**

Test should verify:
- `/` route renders baseline content
- route error boundary renders friendly fallback

- [ ] **Step 2: Run route tests and confirm failure**

Run: `pnpm vitest src/routes/router-navigation.test.tsx`
Expected: FAIL

- [ ] **Step 3: Implement minimal boundary and baseline route**

Add route error boundary in `__root.tsx` and simple baseline page in `index.tsx`.

- [ ] **Step 4: Re-run route tests**

Run: `pnpm vitest src/routes/router-navigation.test.tsx`
Expected: PASS

- [ ] **Step 5: Commit route safety baseline**

```bash
git add src/routes
git commit -m "feat: add route boundary and baseline navigation route"
```

### Task 10: Final verification and docs touch-up

**Files:**
- Modify: `README.md` (create if absent)

- [ ] **Step 1: Add setup/run/test instructions**

Document:
- install: `pnpm install`
- dev: `pnpm dev`
- test: `pnpm vitest`
- build: `pnpm build`
- lint: `pnpm lint`

- [ ] **Step 2: Run full verification**

Run: `pnpm run lint && pnpm vitest run && pnpm run build`
Expected: all PASS

- [ ] **Step 3: Commit verification-ready repo**

```bash
git add README.md
git commit -m "docs: add runbook and verify frontend infrastructure setup"
```

## Notes for Implementer
- Keep scope infrastructure-only; do not add auth or product dashboard UI.
- Keep abstractions thin (YAGNI): only add primitives needed by current tests.
- If this directory remains non-git, skip commit steps but still checkpoint progress in task notes.
