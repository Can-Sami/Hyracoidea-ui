# Frontend Repository Setup Design (Vite + React + shadcn + TanStack)

## Problem
Create a clean frontend repository setup using:
- Vite + React + TypeScript
- shadcn/ui
- TanStack Router, Query, and Table
- pnpm

The setup should focus on infrastructure and conventions (not product UI), with a REST-ready data layer and robust defaults for scaling.

## Goals
- Fast local setup and predictable project structure
- Clear separation of app bootstrap, routing, features, and shared libraries
- Typed and explicit data-fetching primitives for future API integration
- Minimal but production-aligned baseline for error handling and testing

## Non-Goals
- Authentication implementation
- Full dashboard or feature UI
- Backend service implementation

## Recommended Approach
Use a CLI-first, standards-based stack with minimal custom glue:
1. Scaffold Vite React TypeScript app
2. Install and configure TanStack Router/Query/Table
3. Initialize shadcn/ui and keep design tokens/base theme neutral
4. Add shared app providers and thin API client abstraction
5. Add baseline tests for app bootstrap and API client behavior

This balances speed, maintainability, and long-term flexibility.

## Architecture
Single-app repository layout:

```text
src/
  app/
    providers/        # QueryClientProvider, router provider composition
    router/           # router creation/bootstrap
  routes/             # route definitions and route tree
  features/           # domain-level modules, route-facing logic
  components/
    ui/               # shadcn/ui generated components
  lib/
    api/              # REST client + error mapping
    table/            # TanStack Table helper types/config
```

### Responsibilities
- `app/*`: composition root only (providers and bootstrapping)
- `routes/*`: route declarations and page boundaries
- `features/*`: domain logic and state derivation
- `lib/api/*`: transport concerns, typed request/response helpers, explicit errors
- `lib/table/*`: reusable table definitions/state helpers
- `components/ui/*`: presentational primitives from shadcn

## Data Flow
1. Route/component triggers a query action.
2. Query function calls `apiClient`.
3. `apiClient` returns typed payload or throws mapped error.
4. TanStack Query manages caching, retries, and async state.
5. Feature/domain layer transforms data for table/view consumption.

## Error Handling
- Add a route-level error boundary for unexpected route failures.
- Normalize network/API errors into a shared shape (status/code/message).
- Avoid silent fallbacks; surface errors to route/UI boundaries.

## Testing Strategy
- App bootstrap smoke test (providers + router mount)
- Router navigation sanity test for baseline route(s)
- Unit tests for `apiClient` error mapping and response handling

## Tooling and Defaults
- Package manager: pnpm
- Build tool: Vite
- TypeScript strict mode enabled
- ESLint configured for React + TypeScript
- TanStack Router devtools enabled in development only
- TanStack Query devtools behind dev toggle

## Success Criteria
- Repo boots with `pnpm install && pnpm dev`
- Router, Query, and Table are wired and compile cleanly
- shadcn initialized and usable via `components/ui`
- Baseline tests execute successfully
- Structure is ready for feature implementation without refactoring

## Risks and Mitigations
- **Risk:** Over-opinionated scaffolding.
  - **Mitigation:** Keep abstractions thin and colocate complexity in `features`.
- **Risk:** API contract drift later.
  - **Mitigation:** Centralize request typing and error mapping in `lib/api`.

## Implementation Handoff Notes
Next step after this approved design: create a concrete implementation plan covering setup commands, file creation order, and validation checklist.
