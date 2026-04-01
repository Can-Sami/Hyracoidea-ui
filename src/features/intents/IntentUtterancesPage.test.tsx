import { fireEvent, render, screen } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createMemoryHistory, createRouter, RouterProvider } from '@tanstack/react-router'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { rootRoute } from '@/routes/__root'
import { intentsUtterancesRoute } from '@/routes/intents-utterances'

function renderUtterancesRoute() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  })

  const router = createRouter({
    routeTree: rootRoute.addChildren([intentsUtterancesRoute]),
    history: createMemoryHistory({ initialEntries: ['/intents/intent-1/utterances'] }),
  })

  return render(
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>,
  )
}

describe('IntentUtterancesPage', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('loads utterances and renders list', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          items: [
            {
              id: 'ut-1',
              intent_id: 'intent-1',
              language_code: 'tr',
              text: 'hesabimda ne kadar para var',
              source: 'manual',
            },
          ],
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } },
      ),
    )

    vi.stubGlobal('fetch', fetchMock)

    renderUtterancesRoute()

    expect(await screen.findByText(/hesabimda ne kadar para var/i)).toBeInTheDocument()
    expect(fetchMock).toHaveBeenCalledWith(
      '/api/v1/intents/intent-1/utterances',
      expect.objectContaining({ method: 'GET' }),
    )
  })

  it('adds a new utterance', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ items: [] }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }),
      )
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ id: 'ut-2', intent_id: 'intent-1' }), {
          status: 201,
          headers: { 'Content-Type': 'application/json' },
        }),
      )
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ items: [] }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }),
      )

    vi.stubGlobal('fetch', fetchMock)

    renderUtterancesRoute()

    fireEvent.change(await screen.findByLabelText(/utterance text/i), {
      target: { value: 'kart borcum ne kadar' },
    })
    fireEvent.click(screen.getByRole('button', { name: /add utterance/i }))

    expect(await screen.findByRole('button', { name: /add utterance/i })).toBeInTheDocument()
    expect(fetchMock).toHaveBeenNthCalledWith(
      2,
      '/api/v1/intents/intent-1/utterances',
      expect.objectContaining({ method: 'POST' }),
    )
  })
})
