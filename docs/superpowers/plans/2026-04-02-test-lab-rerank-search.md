# Test Lab Rerank Search Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a new Test Lab component that calls `/api/v1/intents/search/rerank` and visualizes semantic vs reranked results side-by-side with editable `k` and prefilled `language_hint`.

**Architecture:** Extend the existing API contract layer (`schema.ts`, `services.ts`, `hooks.ts`) with rerank request/response types and mutation. Add a new rerank card to `TestLabPage` that follows current shadcn composition, local validation, and error/loading conventions. Drive implementation through tests in `services.test.ts` and `TestLabPage.test.tsx`.

**Tech Stack:** React 19, TypeScript, TanStack Query mutations, shadcn/ui components, Vitest, Testing Library.

---

### Task 1: Add rerank API contract, service, and hook

**Files:**
- Create: `src/lib/api/services.test.ts`
- Modify: `src/lib/api/schema.ts`
- Modify: `src/lib/api/services.ts`
- Modify: `src/lib/api/hooks.ts`

- [ ] **Step 1: Write the failing service test**

```ts
// src/lib/api/services.test.ts
import { afterEach, describe, expect, it, vi } from 'vitest'

import { searchIntentsRerank } from './services'

describe('searchIntentsRerank', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('posts rerank payload to the rerank endpoint', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          items: [{ intent_code: 'bill_payment', semantic_score: 0.86, reranker_score: 0.42 }],
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } },
      ),
    )
    vi.stubGlobal('fetch', fetchMock)

    await searchIntentsRerank({ query: 'faturami odemek istiyorum', k: 5, language_hint: 'tr' })

    expect(fetchMock).toHaveBeenCalledWith(
      '/api/v1/intents/search/rerank',
      expect.objectContaining({ method: 'POST' }),
    )
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm vitest src/lib/api/services.test.ts --run`  
Expected: FAIL with missing `searchIntentsRerank` export/type errors.

- [ ] **Step 3: Add minimal API types and service/hook implementation**

```ts
// src/lib/api/schema.ts
export type SearchIntentsRerankRequest = {
  query: string
  k: number
  language_hint: string
}

export type SearchIntentsRerankResponse = {
  items: Array<{ intent_code: string; semantic_score: number; reranker_score: number }>
}
```

```ts
// src/lib/api/services.ts (imports + new function)
import type {
  // ...
  SearchIntentsRerankRequest,
  SearchIntentsRerankResponse,
} from './schema'

export function searchIntentsRerank(body: SearchIntentsRerankRequest) {
  return client.post<SearchIntentsRerankResponse, SearchIntentsRerankRequest>(
    apiUrl('/api/v1/intents/search/rerank'),
    body,
  )
}
```

```ts
// src/lib/api/hooks.ts (imports + new hook)
import {
  // ...
  searchIntentsRerank,
} from './services'
import type {
  // ...
  SearchIntentsRerankRequest,
} from './schema'

export function useSearchIntentsRerankMutation() {
  return useMutation({
    mutationFn: (body: SearchIntentsRerankRequest) => searchIntentsRerank(body),
  })
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm vitest src/lib/api/services.test.ts --run`  
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/lib/api/schema.ts src/lib/api/services.ts src/lib/api/hooks.ts src/lib/api/services.test.ts
git commit -m "feat: add rerank api service and hook"
```

### Task 2: Add failing Test Lab rerank UI tests

**Files:**
- Modify: `src/features/test-lab/TestLabPage.test.tsx`

- [ ] **Step 1: Add failing rerank success and validation tests**

```ts
it('submits rerank query and renders semantic and reranked sections', async () => {
  const fetchMock = vi.fn((input: RequestInfo | URL) => {
    const url = typeof input === 'string' ? input : input.toString()
    if (url.includes('/api/v1/intents/search/rerank')) {
      return Promise.resolve(
        new Response(
          JSON.stringify({
            items: [
              { intent_code: 'bill_payment', semantic_score: 0.86, reranker_score: 0.42 },
              { intent_code: 'bill_check', semantic_score: 0.88, reranker_score: 0.15 },
            ],
          }),
          { status: 200, headers: { 'Content-Type': 'application/json' } },
        ),
      )
    }
    return Promise.resolve(new Response(JSON.stringify({ items: [] }), { status: 200 }))
  })
  vi.stubGlobal('fetch', fetchMock)

  renderWithQueryClient(<TestLabPage />)

  fireEvent.change(screen.getByPlaceholderText(/faturami odemek istiyorum/i), {
    target: { value: 'faturami odemek istiyorum' },
  })
  fireEvent.change(screen.getByLabelText(/rerank top-k/i), { target: { value: '5' } })
  fireEvent.click(screen.getByRole('button', { name: /execute rerank/i }))

  expect(await screen.findByText(/semantic top-k/i)).toBeInTheDocument()
  expect(screen.getByText(/reranked output/i)).toBeInTheDocument()
  expect(screen.getByText('bill_payment')).toBeInTheDocument()
  expect(fetchMock).toHaveBeenCalledWith(
    '/api/v1/intents/search/rerank',
    expect.objectContaining({ method: 'POST' }),
  )
})

it('shows validation error when rerank k is out of range', async () => {
  vi.stubGlobal('fetch', vi.fn())
  renderWithQueryClient(<TestLabPage />)

  fireEvent.change(screen.getByPlaceholderText(/faturami odemek istiyorum/i), {
    target: { value: 'query' },
  })
  fireEvent.change(screen.getByLabelText(/rerank top-k/i), { target: { value: '0' } })
  fireEvent.click(screen.getByRole('button', { name: /execute rerank/i }))

  expect(await screen.findByText(/top-k must be between 1 and 20/i)).toBeInTheDocument()
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm vitest src/features/test-lab/TestLabPage.test.tsx --run`  
Expected: FAIL because rerank UI controls/labels/endpoint flow do not exist yet.

- [ ] **Step 3: Commit failing test checkpoint**

```bash
git add src/features/test-lab/TestLabPage.test.tsx
git commit -m "test: add failing rerank coverage for test lab"
```

### Task 3: Implement rerank card in Test Lab page

**Files:**
- Modify: `src/features/test-lab/TestLabPage.tsx`

- [ ] **Step 1: Add rerank state and mutation wiring**

```tsx
const [rerankQuery, setRerankQuery] = useState('')
const [rerankLanguageHint, setRerankLanguageHint] = useState('tr')
const [rerankK, setRerankK] = useState('5')
const [rerankError, setRerankError] = useState<string | null>(null)
const [rerankResponse, setRerankResponse] = useState<SearchIntentsRerankResponse | null>(null)

const rerankMutation = useSearchIntentsRerankMutation()
const rerankApiError = rerankMutation.error?.message ?? null
```

- [ ] **Step 2: Implement rerank submit handler with validation**

```tsx
async function onRerankSubmit() {
  const query = rerankQuery.trim()
  const kValue = Number(rerankK)

  if (!query) {
    setRerankError('Query text is required.')
    return
  }
  if (query.length > 300) {
    setRerankError('Query text cannot exceed 300 characters.')
    return
  }
  if (!Number.isInteger(kValue) || kValue < 1 || kValue > 20) {
    setRerankError('Top-k must be between 1 and 20.')
    return
  }

  setRerankError(null)
  try {
    const response = await rerankMutation.mutateAsync({
      query,
      k: kValue,
      language_hint: rerankLanguageHint.trim() || 'tr',
    })
    setRerankResponse(response)
  } catch {
    setRerankResponse(null)
  }
}
```

- [ ] **Step 3: Add rerank card UI with side-by-side sections**

```tsx
<Card className="border-border/70 shadow-sm">
  <CardHeader className="flex flex-row items-center justify-between gap-3">
    <CardTitle className="text-xl">Semantic + Rerank Search</CardTitle>
    <Badge variant="outline">/api/v1/intents/search/rerank</Badge>
  </CardHeader>
  <CardContent className="flex flex-col gap-6">
    <FieldGroup>
      <Field data-invalid={rerankError ? true : undefined}>
        <FieldLabel htmlFor="rerank-query">Search query</FieldLabel>
        <Input
          id="rerank-query"
          aria-label="Rerank Query"
          placeholder="e.g. faturami odemek istiyorum"
          value={rerankQuery}
          maxLength={300}
          onChange={(event) => setRerankQuery(event.target.value)}
          aria-invalid={rerankError ? true : undefined}
        />
      </Field>
      <Field>
        <FieldLabel htmlFor="rerank-language">Language hint</FieldLabel>
        <Input
          id="rerank-language"
          value={rerankLanguageHint}
          onChange={(event) => setRerankLanguageHint(event.target.value)}
        />
      </Field>
      <Field data-invalid={rerankError ? true : undefined}>
        <FieldLabel htmlFor="rerank-k">Rerank top-k</FieldLabel>
        <Input
          id="rerank-k"
          aria-label="Rerank Top-K"
          type="number"
          min={1}
          max={20}
          value={rerankK}
          onChange={(event) => setRerankK(event.target.value)}
          aria-invalid={rerankError ? true : undefined}
        />
      </Field>
    </FieldGroup>

    <Button onClick={onRerankSubmit} disabled={rerankMutation.isPending}>
      {rerankMutation.isPending ? 'Running...' : 'Execute Rerank'}
    </Button>

    {rerankApiError ? <Alert variant="destructive">{rerankApiError}</Alert> : null}
    {rerankError ? <Alert variant="destructive">{rerankError}</Alert> : null}

    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      <section className="flex flex-col gap-2">
        <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Semantic Top-K</h3>
        {(rerankResponse?.items ?? [])
          .slice()
          .sort((a, b) => b.semantic_score - a.semantic_score)
          .map((item) => (
            <div key={`semantic-${item.intent_code}`} className="flex items-center justify-between border-b border-border/70 py-2 text-xs">
              <span>{item.intent_code}</span>
              <span>{item.semantic_score.toFixed(3)} / {item.reranker_score.toFixed(3)}</span>
            </div>
          ))}
      </section>
      <section className="flex flex-col gap-2">
        <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Reranked Output</h3>
        {(rerankResponse?.items ?? []).map((item) => (
          <div key={`rerank-${item.intent_code}`} className="flex items-center justify-between border-b border-border/70 py-2 text-xs">
            <span>{item.intent_code}</span>
            <span>{item.semantic_score.toFixed(3)} / {item.reranker_score.toFixed(3)}</span>
          </div>
        ))}
      </section>
    </div>
  </CardContent>
</Card>
```

- [ ] **Step 4: Run rerank page tests to verify pass**

Run: `pnpm vitest src/features/test-lab/TestLabPage.test.tsx --run`  
Expected: PASS including new rerank tests and existing semantic/audio tests.

- [ ] **Step 5: Commit rerank UI**

```bash
git add src/features/test-lab/TestLabPage.tsx
git commit -m "feat: add rerank search panel to test lab page"
```

### Task 4: Full verification and final commit

**Files:**
- Modify: `src/features/test-lab/TestLabPage.tsx` (if any final fixes)
- Modify: `src/features/test-lab/TestLabPage.test.tsx` (if any final fixes)
- Modify: `src/lib/api/{schema.ts,services.ts,hooks.ts,services.test.ts}` (if any final fixes)

- [ ] **Step 1: Run lint, tests, and build**

Run: `pnpm -s run lint && pnpm -s run test:run && pnpm -s run build`  
Expected: all commands PASS.

- [ ] **Step 2: Review diff for scope correctness**

Run: `git --no-pager diff --stat HEAD~3..HEAD`  
Expected: changes only in rerank API contract, TestLab page, and related tests.

- [ ] **Step 3: Create final squash-style feature commit (if your workflow requires one)**

```bash
git add src/lib/api/schema.ts src/lib/api/services.ts src/lib/api/hooks.ts src/lib/api/services.test.ts src/features/test-lab/TestLabPage.tsx src/features/test-lab/TestLabPage.test.tsx
git commit -m "feat: support rerank intent search in test lab"
```

## Spec Coverage Check

1. Dedicated rerank component on test page: **Task 3**
2. Keep existing semantic/audio functionality: **Task 3 + Task 4**
3. Show semantic and reranker scores: **Task 3 tests + rendering**
4. Add new API contract/service/hook: **Task 1**
5. Validation/error handling for query and `k`: **Task 2 + Task 3**
6. Add rerank-focused tests: **Task 2**

## Type Consistency Check

1. Request type name is consistently `SearchIntentsRerankRequest`.
2. Response type name is consistently `SearchIntentsRerankResponse`.
3. Hook name is consistently `useSearchIntentsRerankMutation`.
4. UI field name and test label for `k` is consistently `Rerank Top-K`.
