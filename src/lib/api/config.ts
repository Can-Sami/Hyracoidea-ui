const defaultApiBaseUrl = ''
const defaultApiKey = ''

export const apiBaseUrl =
  import.meta.env.VITE_API_BASE_URL?.trim() || defaultApiBaseUrl
export const apiKey = import.meta.env.VITE_API_KEY?.trim() || defaultApiKey

export function apiUrl(path: string): string {
  if (path.startsWith('http://') || path.startsWith('https://')) return path
  if (apiBaseUrl === '') return path
  return `${apiBaseUrl}${path}`
}
