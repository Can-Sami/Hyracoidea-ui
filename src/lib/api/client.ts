import { mapResponseError } from './errors'
import { apiKey } from './config'
import type { RequestBody } from './types'

type ClientInit = Omit<RequestInit, 'body' | 'method'>

function withApiKeyHeaders(headers: HeadersInit | undefined) {
  const nextHeaders = new Headers(headers)
  if (apiKey.length > 0 && !nextHeaders.has('x-api-key')) {
    nextHeaders.set('x-api-key', apiKey)
  }
  return nextHeaders
}

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
    headers: withApiKeyHeaders(init.headers),
  })
}

export function post<TResponse, TBody extends RequestBody>(
  input: string,
  body: TBody,
  init: ClientInit = {},
): Promise<TResponse> {
  const headers = new Headers(init.headers)
  const apiHeaders = withApiKeyHeaders(headers)
  apiHeaders.set('Content-Type', 'application/json')

  return requestJson<TResponse>(input, {
    ...init,
    method: 'POST',
    headers: apiHeaders,
    body: JSON.stringify(body),
  })
}

export function put<TResponse, TBody extends RequestBody>(
  input: string,
  body: TBody,
  init: ClientInit = {},
): Promise<TResponse> {
  const headers = new Headers(init.headers)
  const apiHeaders = withApiKeyHeaders(headers)
  apiHeaders.set('Content-Type', 'application/json')

  return requestJson<TResponse>(input, {
    ...init,
    method: 'PUT',
    headers: apiHeaders,
    body: JSON.stringify(body),
  })
}

export function del<TResponse>(input: string, init: ClientInit = {}): Promise<TResponse> {
  return requestJson<TResponse>(input, {
    ...init,
    method: 'DELETE',
    headers: withApiKeyHeaders(init.headers),
  })
}
