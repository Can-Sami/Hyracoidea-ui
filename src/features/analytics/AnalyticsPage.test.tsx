import { render, screen } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { afterEach, describe, expect, it, vi } from 'vitest'

import AnalyticsPage from './AnalyticsPage'

vi.mock('@/components/layout/AppSidebar', () => ({
  AppSidebar: () => null,
}))

function renderWithQueryClient(ui: React.ReactNode) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  })

  return render(<QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>)
}

describe('AnalyticsPage', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('loads stage telemetry and benchmark analytics from backend', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            items: [
              {
                stage_name: 'embedding',
                request_count: 128,
                error_count: 0,
                p50_ms: 23,
                p95_ms: 41,
                avg_ms: 25.5,
              },
              {
                stage_name: 'total',
                request_count: 128,
                error_count: 2,
                p50_ms: 98,
                p95_ms: 176,
                avg_ms: 108.4,
              },
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
                stage_name: 'stt',
                request_count: 128,
                total_estimated_cost_usd: 0.42,
                cost_per_1k_requests: 3.28,
              },
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
                stage_name: 'embedding',
                baseline_p95_ms: 46,
                candidate_p95_ms: 41,
                p95_delta_pct: -10.8,
                baseline_cost_per_1k_requests: 1.61,
                candidate_cost_per_1k_requests: 1.48,
                cost_per_1k_delta_pct: -8.0,
              },
            ],
          }),
          { status: 200, headers: { 'Content-Type': 'application/json' } },
        ),
      )

    vi.stubGlobal('fetch', fetchMock)

    renderWithQueryClient(<AnalyticsPage />)

    expect(await screen.findByRole('heading', { name: /stage analytics/i })).toBeInTheDocument()
    expect(await screen.findByText(/slowest p95 stage/i)).toBeInTheDocument()
    expect(await screen.findByText(/benchmark comparison/i)).toBeInTheDocument()

    const requestUrls = fetchMock.mock.calls.map((call) => call[0] as string)
    const stageLatencyUrl = requestUrls.find((url) => url.includes('/api/v1/overview/stage-latency?'))
    const stageCostUrl = requestUrls.find((url) => url.includes('/api/v1/overview/stage-cost?'))
    const benchmarkUrl = requestUrls.find((url) =>
      url.includes('/api/v1/overview/benchmark-compare?'),
    )

    expect(stageLatencyUrl).toBeDefined()
    expect(stageCostUrl).toBeDefined()
    expect(benchmarkUrl).toBeDefined()

    const stageLatencyParams = new URL(stageLatencyUrl!, 'http://localhost').searchParams
    expect(stageLatencyParams.get('start_at')).toBeTruthy()
    expect(stageLatencyParams.get('end_at')).toBeTruthy()

    const benchmarkParams = new URL(benchmarkUrl!, 'http://localhost').searchParams
    expect(benchmarkParams.get('baseline_start_at')).toBeTruthy()
    expect(benchmarkParams.get('baseline_end_at')).toBeTruthy()
    expect(benchmarkParams.get('candidate_start_at')).toBeTruthy()
    expect(benchmarkParams.get('candidate_end_at')).toBeTruthy()
  })
})
