import { fireEvent, render, screen } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { OverviewDashboardPage } from './OverviewDashboardPage'

function renderWithQueryClient(ui: React.ReactNode) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  })

  return render(
    <QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>,
  )
}

describe('OverviewDashboardPage', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('loads health and readiness status from backend', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ status: 'ok', request_id: 'req-1' }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }),
      )
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            status: 'ready',
            service: 'callsteering-backend',
            version: '0.1.0',
            request_id: 'req-2',
          }),
          { status: 200, headers: { 'Content-Type': 'application/json' } },
        ),
      )

    vi.stubGlobal('fetch', fetchMock)

    renderWithQueryClient(<OverviewDashboardPage />)

    expect(await screen.findByText(/operational/i)).toBeInTheDocument()
    expect(await screen.findByText(/callsteering-backend/i)).toBeInTheDocument()
    expect(fetchMock).toHaveBeenCalledWith(
      '/api/healthz',
      expect.objectContaining({ method: 'GET' }),
    )
    expect(fetchMock).toHaveBeenCalledWith(
      '/api/readyz',
      expect.objectContaining({ method: 'GET' }),
    )
  })

  it('refresh button re-fetches health endpoints', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(
        new Response(JSON.stringify({ status: 'ok' }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }),
      )

    vi.stubGlobal('fetch', fetchMock)

    renderWithQueryClient(<OverviewDashboardPage />)

    await screen.findByText(/operational/i)
    const baselineCalls = fetchMock.mock.calls.length

    fireEvent.click(screen.getByRole('button', { name: /refresh dashboard/i }))

    expect(fetchMock.mock.calls.length).toBeGreaterThan(baselineCalls)
  })
})
