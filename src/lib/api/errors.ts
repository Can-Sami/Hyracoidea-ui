import type { ApiError, ErrorPayload } from './types'

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function normalizeErrorPayload(payload: unknown): ErrorPayload {
  if (!isObject(payload)) return {}

  return {
    code: typeof payload.code === 'string' ? payload.code : undefined,
    message: typeof payload.message === 'string' ? payload.message : undefined,
  }
}

export class ApiClientError extends Error implements ApiError {
  status: number
  code: string

  constructor(status: number, code: string, message: string) {
    super(message)
    this.name = 'ApiClientError'
    this.status = status
    this.code = code
  }
}

export async function mapResponseError(response: Response): Promise<ApiError> {
  const fallbackMessage = response.statusText || 'Request failed'
  let payload: unknown

  try {
    payload = await response.json()
  } catch {
    payload = undefined
  }

  const normalized = normalizeErrorPayload(payload)

  return new ApiClientError(
    response.status,
    normalized.code ?? 'UNKNOWN_ERROR',
    normalized.message ?? fallbackMessage,
  )
}
