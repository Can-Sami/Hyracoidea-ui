import { fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { TestLabPage } from './TestLabPage'

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

    render(<TestLabPage />)

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

  it('shows API error message when search request fails', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ code: 'UPSTREAM_ERROR', message: 'service down' }), {
        status: 502,
        headers: { 'Content-Type': 'application/json' },
      }),
    )
    vi.stubGlobal('fetch', fetchMock)

    render(<TestLabPage />)

    fireEvent.change(screen.getByPlaceholderText(/cancel my subscription/i), {
      target: { value: 'query' },
    })
    fireEvent.click(screen.getByRole('button', { name: /execute/i }))

    expect(await screen.findByText(/service down/i)).toBeInTheDocument()
  })
})
