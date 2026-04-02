# Test Lab Rerank Search Design

## Problem

The backend now exposes `POST /api/v1/intents/search/rerank`, which returns semantic retrieval scores and cross-encoder reranker scores. The Test & Inference Lab page currently supports only semantic search and audio inference, so there is no UI path to validate rerank behavior before rollout.

## Goals

1. Add a dedicated rerank testing component to the existing test page.
2. Preserve existing semantic search and audio inference behavior.
3. Make rerank diagnostics explicit by showing both semantic and reranker scores.
4. Keep implementation aligned with existing shadcn composition and page style.

## Non-Goals

1. Replacing existing semantic search panel.
2. Altering backend rerank contract.
3. Introducing new routing or navigation.

## Chosen Approach

Use **Approach B**: add a dedicated rerank card with side-by-side semantic vs reranked views in the same panel.

### Why this approach

1. It keeps existing flows intact and avoids regressions in current semantic/audio workflows.
2. It surfaces reranker value clearly by contrasting pre-rerank and post-rerank order.
3. It fits existing Test Lab card layout and shadcn usage patterns with minimal disruption.

## UI / Component Design

Add a new shadcn `Card` to `TestLabPage`:

- Title: `Semantic + Rerank Search`
- Endpoint badge: `/api/v1/intents/search/rerank`

### Input controls

Implement a `FieldGroup` with:

1. `query` text input (max 300 chars, required)
2. `language_hint` text input, prefilled with `tr`
3. `k` numeric input, user-editable (integer)
4. Execute button (disabled during pending request)

### Results presentation

Inside the same card, show:

1. **Semantic Top-K** list (sorted by `semantic_score` descending)
2. **Reranked Output** list (response reranked order)

Each row displays:

- `intent_code`
- `semantic_score` (fixed precision for readability)
- `reranker_score` (fixed precision for readability)

Also include a full JSON response textarea with a copy action, consistent with the current semantic search behavior.

## Data and API Design

### New schema types

In `src/lib/api/schema.ts`:

- `SearchIntentsRerankRequest`
  - `query: string`
  - `k: number`
  - `language_hint: string`
- `SearchIntentsRerankResponse`
  - `items: Array<{ intent_code: string; semantic_score: number; reranker_score: number }>`

### New service and hook

In `src/lib/api/services.ts`:

- `searchIntentsRerank(body)` -> `POST /api/v1/intents/search/rerank`

In `src/lib/api/hooks.ts`:

- `useSearchIntentsRerankMutation()`

## Interaction Flow

1. User fills query/language/k and clicks Execute.
2. UI validates:
   - query not empty
   - query length <= 300
   - k is integer and within bounded UI range (1..20)
3. UI sends rerank request.
4. On success:
   - store raw response
   - derive semantic sorted list and reranked list for side-by-side render
5. On failure:
   - show destructive alert with backend message
   - clear previous rerank results

## Error Handling

Follow existing TestLabPage patterns:

1. Use local validation messages for invalid inputs.
2. Use mutation error surface for API failures.
3. Keep clear loading state and disable submission while pending.
4. Avoid silent fallback behavior.

## Testing Plan

Extend `src/features/test-lab/TestLabPage.test.tsx` with rerank coverage:

1. Successful rerank call renders both semantic and reranked result sections and both score types.
2. Request targets `/api/v1/intents/search/rerank`.
3. Empty query validation blocks submission.
4. Invalid `k` validation blocks submission.
5. API error renders backend message.

Also keep existing semantic search and audio inference tests passing.

## Impacted Files

1. `src/features/test-lab/TestLabPage.tsx`
2. `src/features/test-lab/TestLabPage.test.tsx`
3. `src/lib/api/schema.ts`
4. `src/lib/api/services.ts`
5. `src/lib/api/hooks.ts`

## Risks and Mitigations

1. **Risk:** UI complexity increases with a third card and dual lists.  
   **Mitigation:** keep consistent card structure and compact list rows.
2. **Risk:** confusion around ranking order.  
   **Mitigation:** explicit section labels (`Semantic Top-K` vs `Reranked Output`) and fixed score columns.
3. **Risk:** input misuse for `k`.  
   **Mitigation:** client-side bounds and integer validation before request.
