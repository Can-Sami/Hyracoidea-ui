import { afterEach, describe, expect, it, vi } from 'vitest'

import { get, post } from './client'

describe('api client', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('maps non-2xx responses to a normalized error', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ code: 'NOT_FOUND', message: 'User not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      }),
    )

    vi.stubGlobal('fetch', fetchMock)

    await expect(get('/api/users/42')).rejects.toMatchObject({
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
})
