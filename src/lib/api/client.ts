import { mapResponseError } from './errors'
import type { RequestBody } from './types'

type ClientInit = Omit<RequestInit, 'body' | 'method'>

async function requestJson<T>(input: string, init: RequestInit): Promise<T> {
  const response = await fetch(input, init)

  if (!response.ok) {
    throw await mapResponseError(response)
  }

  const rawBody = await response.text()
  if (rawBody === '') {
    return undefined as T
  }

  return JSON.parse(rawBody) as T
}

export function get<T>(input: string, init: ClientInit = {}): Promise<T> {
  return requestJson<T>(input, {
    ...init,
    method: 'GET',
  })
}

export function post<TResponse, TBody extends RequestBody>(
  input: string,
  body: TBody,
  init: ClientInit = {},
): Promise<TResponse> {
  const headers = new Headers(init.headers)
  headers.set('Content-Type', 'application/json')

  return requestJson<TResponse>(input, {
    ...init,
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  })
}

export function put<TResponse, TBody extends RequestBody>(
  input: string,
  body: TBody,
  init: ClientInit = {},
): Promise<TResponse> {
  const headers = new Headers(init.headers)
  headers.set('Content-Type', 'application/json')

  return requestJson<TResponse>(input, {
    ...init,
    method: 'PUT',
    headers,
    body: JSON.stringify(body),
  })
}

export function del<TResponse>(input: string, init: ClientInit = {}): Promise<TResponse> {
  return requestJson<TResponse>(input, {
    ...init,
    method: 'DELETE',
  })
}
