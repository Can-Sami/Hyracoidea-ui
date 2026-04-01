export type ApiError = {
  status: number
  code: string
  message: string
}

export type RequestBody = Record<string, unknown>
