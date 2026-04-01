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

export async function mapResponseError(response: Response): Promise<ApiError> {
  const fallbackMessage = response.statusText || 'Request failed'
  let payload: unknown

  try {
    payload = await response.json()
  } catch {
    payload = undefined
  }

  const normalized = normalizeErrorPayload(payload)

  return {
    status: response.status,
    code: normalized.code ?? 'UNKNOWN_ERROR',
    message: normalized.message ?? fallbackMessage,
  }
}
