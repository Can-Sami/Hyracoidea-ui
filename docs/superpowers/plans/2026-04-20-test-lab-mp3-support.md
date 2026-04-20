# Test Lab MP3 Audio Upload Support Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Enable full WAV+MP3 audio upload support in `TestLabPage` so frontend validation and file input behavior match backend capabilities.

**Architecture:** Extend the existing `onAudioFileChange` validation path in `TestLabPage` to accept MP3 alongside WAV, while keeping the existing request payload and mutation flow unchanged. Update user-facing upload copy and accepted file types at the input level so browser filtering and app validation stay aligned. Update tests to assert MP3 acceptance and non-audio rejection.

**Tech Stack:** React 19, TypeScript, TanStack Query, Vitest, Testing Library

---

### Task 1: Update upload tests to define expected MP3 behavior

**Files:**
- Modify: `src/features/test-lab/TestLabPage.test.tsx`
- Test: `src/features/test-lab/TestLabPage.test.tsx`

- [ ] **Step 1: Write the failing test updates**

```tsx
it('accepts mp3 uploads and renders audio inference result', async () => {
  const fetchMock = vi.fn((input: RequestInfo | URL) => {
    const url = typeof input === 'string' ? input : input.toString()
    if (url.includes('/api/v1/inference/intent')) {
      return Promise.resolve(
        new Response(
          JSON.stringify({
            request_id: 'req-1',
            channel_id: 'test-lab-ui',
            intent_code: 'billing_support',
            confidence: 0.89,
            match_status: 'matched',
            transcript: 'faturam ile ilgili destek istiyorum',
            top_candidates: [
              { intent_code: 'billing_support', score: 0.89 },
              { intent_code: 'general_support', score: 0.1 },
            ],
            processing_ms: 214,
          }),
          { status: 200, headers: { 'Content-Type': 'application/json' } },
        ),
      )
    }
    return Promise.resolve(
      new Response(JSON.stringify({ items: [] }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    )
  })
  vi.stubGlobal('fetch', fetchMock)

  renderWithQueryClient(<TestLabPage />)

  const input = screen.getByLabelText(/audio file/i)
  const file = new File(['mp3-content'], 'intent.mp3', { type: 'audio/mpeg' })
  fireEvent.change(input, { target: { files: [file] } })

  expect(await screen.findByText(/analyzed in 214 ms/i)).toBeInTheDocument()
  expect(fetchMock).toHaveBeenCalledWith(
    '/api/v1/inference/intent',
    expect.objectContaining({ method: 'POST' }),
  )
  expect(screen.getByText('intent.mp3')).toBeInTheDocument()
})

it('rejects unsupported audio uploads before making request', async () => {
  const fetchMock = vi.fn()
  vi.stubGlobal('fetch', fetchMock)

  renderWithQueryClient(<TestLabPage />)

  const input = screen.getByLabelText(/audio file/i)
  const file = new File(['text-content'], 'notes.txt', { type: 'text/plain' })
  fireEvent.change(input, { target: { files: [file] } })

  expect(await screen.findByText(/only wav or mp3 files are supported/i)).toBeInTheDocument()
  expect(fetchMock).not.toHaveBeenCalled()
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm -s run test:run src/features/test-lab/TestLabPage.test.tsx`
Expected: FAIL because current validation rejects MP3 and shows WAV-only messaging.

- [ ] **Step 3: Commit test changes**

```bash
git add src/features/test-lab/TestLabPage.test.tsx
git commit -m "test: define mp3 support behavior for test lab audio upload"
```

### Task 2: Implement WAV+MP3 validation and update UI copy

**Files:**
- Modify: `src/features/test-lab/TestLabPage.tsx`
- Modify: `src/features/test-lab/TestLabPage.test.tsx`
- Test: `src/features/test-lab/TestLabPage.test.tsx`

- [ ] **Step 1: Update file validation and input accept filter**

```tsx
const isWavOrMp3 =
  fileName.endsWith('.wav') ||
  fileName.endsWith('.mp3') ||
  ['audio/wav', 'audio/wave', 'audio/x-wav', 'audio/mpeg', 'audio/mp3'].includes(file.type)

if (!isWavOrMp3) {
  setAudioError('Only WAV or MP3 files are supported.')
  event.target.value = ''
  return
}
```

```tsx
<FieldDescription>WAV or MP3, max size 5MB.</FieldDescription>
...
accept=".wav,.mp3,audio/wav,audio/x-wav,audio/mpeg,audio/mp3"
...
Choose WAV/MP3
```

- [ ] **Step 2: Replace old rejection test and keep WAV success coverage**

```tsx
// Keep existing WAV success test unchanged.
// Remove old `rejects non-wav uploads before making request` test.
// Keep the new unsupported-format `.txt` rejection test from Task 1.
```

- [ ] **Step 3: Run focused tests**

Run: `pnpm -s run test:run src/features/test-lab/TestLabPage.test.tsx`
Expected: PASS

- [ ] **Step 4: Run repo verification**

Run: `pnpm -s run lint && pnpm -s run build && pnpm -s run test:run`
Expected: All commands pass.

- [ ] **Step 5: Commit implementation**

```bash
git add src/features/test-lab/TestLabPage.tsx src/features/test-lab/TestLabPage.test.tsx
git commit -m "feat: add mp3 support to test lab audio upload"
```
