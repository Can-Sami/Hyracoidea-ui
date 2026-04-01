import { afterEach, describe, expect, it, vi } from 'vitest'

import { get, post } from './client'

describe('api client', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
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
})
