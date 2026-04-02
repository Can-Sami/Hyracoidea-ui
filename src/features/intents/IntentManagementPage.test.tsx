import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { createMemoryHistory, createRouter, RouterProvider } from '@tanstack/react-router'

import { rootRoute } from '@/routes/__root'
import { intentsRoute } from '@/routes/intents'

function renderWithQueryClient() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  })
  const router = createRouter({
    routeTree: rootRoute.addChildren([intentsRoute]),
    history: createMemoryHistory({ initialEntries: ['/intents'] }),
  })

  return render(
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>,
  )
}

describe('IntentManagementPage', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('loads intents from backend and renders rows', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            items: [
              {
                id: 'it-1',
                intent_code: 'balance_inquiry',
                description: 'Customer asks account balance',
                is_active: true,
              },
            ],
          }),
          { status: 200, headers: { 'Content-Type': 'application/json' } },
        ),
      )
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            status: 'ok',
            reindexed_count: 34,
          }),
          { status: 200, headers: { 'Content-Type': 'application/json' } },
        ),
      )

    vi.stubGlobal('fetch', fetchMock)

    renderWithQueryClient()

    expect(await screen.findByText('balance_inquiry')).toBeInTheDocument()
    expect(screen.getByText(/customer asks account balance/i)).toBeInTheDocument()
    expect(fetchMock).toHaveBeenCalledWith(
      '/api/v1/intents',
      expect.objectContaining({ method: 'GET' }),
    )
  })

  it('triggers reindex and shows returned count', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ items: [] }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }),
      )
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ status: 'ok', reindexed_count: 7 }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }),
      )

    vi.stubGlobal('fetch', fetchMock)

    renderWithQueryClient()

    fireEvent.click(await screen.findByRole('button', { name: /reindex all/i }))

    expect(await screen.findByText(/7 intents reindexed/i)).toBeInTheDocument()
    expect(fetchMock).toHaveBeenCalledWith(
      '/api/v1/intents/reindex',
      expect.objectContaining({ method: 'POST' }),
    )
  })



  it('shows validation error when intent code is invalid', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ items: [] }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }),
      )

    vi.stubGlobal('fetch', fetchMock)

    renderWithQueryClient()

    fireEvent.click(await screen.findByRole('button', { name: /open create intent form/i }))
    fireEvent.change(screen.getByLabelText(/intent code/i), {
      target: { value: 'invalid code' },
    })
    fireEvent.change(screen.getByLabelText(/intent description/i), {
      target: { value: 'desc' },
    })
    fireEvent.click(screen.getByRole('button', { name: /^save$/i }))

    expect(
      await screen.findByText(/Intent code can only contain letters, numbers, underscores, and hyphens./i),
    ).toBeInTheDocument()
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })
  it('creates an intent from the form', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ items: [] }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }),
      )
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ id: 'it-2', intent_code: 'card_limit' }), {
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

    renderWithQueryClient()

    fireEvent.click(
      await screen.findByRole('button', { name: /open create intent form/i }),
    )
    fireEvent.change(screen.getByLabelText(/intent code/i), {
      target: { value: 'card_limit' },
    })
    fireEvent.change(screen.getByLabelText(/intent description/i), {
      target: { value: 'Customer asks about card limit' },
    })
    fireEvent.click(screen.getByRole('button', { name: /^save$/i }))

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(
        '/api/v1/intents',
        expect.objectContaining({ method: 'POST' }),
      )
    })
  })
})
