import { afterEach, describe, expect, it, vi } from 'vitest'

import { del, get, post, put } from './client'

describe('api client', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
    vi.unstubAllEnvs()
    vi.resetModules()
  })

  it('throws an Error subtype while preserving normalized fields', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ code: 'NOT_FOUND', message: 'User not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      }),
    )

    vi.stubGlobal('fetch', fetchMock)

    const request = get('/api/users/42')

    await expect(request).rejects.toBeInstanceOf(Error)
    await expect(request).rejects.toMatchObject({
      status: 404,
      code: 'NOT_FOUND',
      message: 'User not found',
    })
  })

  it('parses typed JSON for 2xx responses', async () => {
    type CreateUserRequest = { name: string }
    type CreateUserResponse = { id: number; name: string }

    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ id: 7, name: 'Ada' }), {
        status: 201,
        headers: { 'Content-Type': 'application/json' },
      }),
    )

    vi.stubGlobal('fetch', fetchMock)

    const result = await post<CreateUserResponse, CreateUserRequest>('/api/users', { name: 'Ada' })

    expect(result).toEqual({ id: 7, name: 'Ada' })
    expect(fetchMock).toHaveBeenCalledWith(
      '/api/users',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ name: 'Ada' }),
      }),
    )
  })

  it('returns undefined for 204 responses with empty body', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(null, {
        status: 204,
      }),
    )

    vi.stubGlobal('fetch', fetchMock)

    const result = await get<undefined>('/api/users/42')

    expect(result).toBeUndefined()
  })

  it('returns undefined for 2xx responses with empty string body', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response('', {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    )

    vi.stubGlobal('fetch', fetchMock)

    const result = await get<undefined>('/api/users/42')

    expect(result).toBeUndefined()
  })

  it('sends PUT requests with a JSON body', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ id: 'it-1', intent_code: 'card_limit' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    )
    vi.stubGlobal('fetch', fetchMock)

    await put<{ id: string; intent_code: string }, { intent_code: string; description: string }>(
      '/api/v1/intents/it-1',
      { intent_code: 'card_limit', description: 'Card limit inquiry' },
    )

    expect(fetchMock).toHaveBeenCalledWith(
      '/api/v1/intents/it-1',
      expect.objectContaining({
        method: 'PUT',
      }),
    )
  })

  it('sends DELETE requests', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ status: 'deleted', id: 'it-1' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    )
    vi.stubGlobal('fetch', fetchMock)

    await del<{ status: string; id: string }>('/api/v1/intents/it-1')

    expect(fetchMock).toHaveBeenCalledWith(
      '/api/v1/intents/it-1',
      expect.objectContaining({
        method: 'DELETE',
      }),
    )
  })

  it('injects x-api-key header when VITE_API_KEY is configured', async () => {
    vi.stubEnv('VITE_API_KEY', 'local-dev-key')
    const { get: getWithApiKey } = await import('./client')

    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ status: 'ok' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    )
    vi.stubGlobal('fetch', fetchMock)

    await getWithApiKey('/api/healthz')

    const options = fetchMock.mock.calls[0]?.[1] as RequestInit
    const headers = new Headers(options?.headers)
    expect(headers.get('x-api-key')).toBe('local-dev-key')
  })
})
