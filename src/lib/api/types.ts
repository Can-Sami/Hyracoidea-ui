export type ApiError = Error & {
  status: number
  code: string
  message: string
}

export type RequestBody = Record<string, unknown>

export type ErrorPayload = {
  code?: string
  message?: string
}
