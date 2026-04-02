import { fireEvent, render, screen } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { TestLabPage } from './TestLabPage'

function renderWithQueryClient(ui: React.ReactNode) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  })

  return render(
    <QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>,
  )
}

describe('TestLabPage semantic search', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('submits query and renders returned intent scores', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          items: [
            { intent_code: 'balance_inquiry', score: 0.93 },
            { intent_code: 'card_limit', score: 0.71 },
          ],
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } },
      ),
    )
    vi.stubGlobal('fetch', fetchMock)

    renderWithQueryClient(<TestLabPage />)

    fireEvent.change(screen.getByPlaceholderText(/cancel my subscription/i), {
      target: { value: 'hesabimda ne kadar para var' },
    })
    fireEvent.click(screen.getByRole('button', { name: /execute/i }))

    expect(await screen.findByText('balance_inquiry')).toBeInTheDocument()
    expect(screen.getByText('card_limit')).toBeInTheDocument()
    expect(fetchMock).toHaveBeenCalledWith(
      '/api/v1/intents/search',
      expect.objectContaining({
        method: 'POST',
      }),
    )
  })



  it('shows validation error when query is empty', async () => {
    const fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)

    renderWithQueryClient(<TestLabPage />)

    fireEvent.click(screen.getByRole('button', { name: /execute/i }))

    expect(await screen.findByText(/query text is required/i)).toBeInTheDocument()
    expect(fetchMock).not.toHaveBeenCalled()
  })
  it('shows API error message when search request fails', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ code: 'UPSTREAM_ERROR', message: 'service down' }), {
        status: 502,
        headers: { 'Content-Type': 'application/json' },
      }),
    )
    vi.stubGlobal('fetch', fetchMock)

    renderWithQueryClient(<TestLabPage />)

    fireEvent.change(screen.getByPlaceholderText(/cancel my subscription/i), {
      target: { value: 'query' },
    })
    fireEvent.click(screen.getByRole('button', { name: /execute/i }))

    expect(await screen.findByText(/service down/i)).toBeInTheDocument()
  })

  it('renders audio inference results after uploading a wav file', async () => {
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
    const file = new File(['wav-content'], 'intent.wav', { type: 'audio/wav' })
    fireEvent.change(input, { target: { files: [file] } })

    expect(await screen.findByText(/analyzed in 214 ms/i)).toBeInTheDocument()
    expect(screen.getByText(/predicted intent/i)).toBeInTheDocument()
    expect(screen.getByText('Candidate Ranking')).toBeInTheDocument()
    expect(screen.getAllByText('billing_support')).toHaveLength(2)
    expect(screen.getByText(/89% confidence/i)).toBeInTheDocument()
    expect(screen.getByText('intent.wav')).toBeInTheDocument()
  })

  it('rejects non-wav uploads before making request', async () => {
    const fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)

    renderWithQueryClient(<TestLabPage />)

    const input = screen.getByLabelText(/audio file/i)
    const file = new File(['audio-content'], 'intent.mp3', { type: 'audio/mpeg' })
    fireEvent.change(input, { target: { files: [file] } })

    expect(await screen.findByText(/only wav files are supported/i)).toBeInTheDocument()
    expect(fetchMock).not.toHaveBeenCalled()
  })
})
