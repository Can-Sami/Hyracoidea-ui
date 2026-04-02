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

  it('loads overview metrics and service status from backend', async () => {
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
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            total_inferences: 128,
            avg_confidence: 0.78,
            total_inferences_delta_pct: 14.29,
            avg_confidence_delta_pct: -2.5,
          }),
          { status: 200, headers: { 'Content-Type': 'application/json' } },
        ),
      )
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            items: [
              { intent_code: 'balance_inquiry', count: 74, percentage: 57.81 },
              { intent_code: 'unmatched', count: 24, percentage: 18.75 },
            ],
          }),
          { status: 200, headers: { 'Content-Type': 'application/json' } },
        ),
      )
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            items: [
              {
                timestamp: '2026-04-01T11:59:10+00:00',
                input_snippet: 'hesabimda ne kadar para var',
                predicted_intent: 'balance_inquiry',
                confidence: 0.89,
              },
            ],
          }),
          { status: 200, headers: { 'Content-Type': 'application/json' } },
        ),
      )

    vi.stubGlobal('fetch', fetchMock)

    renderWithQueryClient(<OverviewDashboardPage />)

    expect(await screen.findByText(/operational/i)).toBeInTheDocument()
    expect(await screen.findByText(/callsteering-backend/i)).toBeInTheDocument()
    expect(await screen.findByText('128')).toBeInTheDocument()
    expect(await screen.findByText('78%')).toBeInTheDocument()
    expect(await screen.findAllByText('balance_inquiry')).toHaveLength(2)
    expect(fetchMock).toHaveBeenCalledWith(
      '/api/healthz',
      expect.objectContaining({ method: 'GET' }),
    )
    expect(fetchMock).toHaveBeenCalledWith(
      '/api/readyz',
      expect.objectContaining({ method: 'GET' }),
    )
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining('/api/v1/overview/summary?'),
      expect.objectContaining({ method: 'GET' }),
    )
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining('/api/v1/overview/intent-distribution?'),
      expect.objectContaining({ method: 'GET' }),
    )
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining('/api/v1/overview/recent-activity?'),
      expect.objectContaining({ method: 'GET' }),
    )
  })

  it('refresh button re-fetches dashboard endpoints', async () => {
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

  it('renders safely when overview deltas are null', async () => {
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
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            total_inferences: 128,
            avg_confidence: 0.78,
            total_inferences_delta_pct: null,
            avg_confidence_delta_pct: null,
          }),
          { status: 200, headers: { 'Content-Type': 'application/json' } },
        ),
      )
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ items: [] }), {
          status: 200,
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

    renderWithQueryClient(<OverviewDashboardPage />)

    expect(await screen.findByText(/operational/i)).toBeInTheDocument()
    expect(await screen.findByText('128')).toBeInTheDocument()
    expect(await screen.findByText('78%')).toBeInTheDocument()
  })
})
