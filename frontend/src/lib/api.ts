/** В прод-сборке без VITE_API_URL запросы идут на тот же origin (Caddy :80/:443 + /api). */
const raw = import.meta.env.VITE_API_URL
export const API_BASE: string = (() => {
  if (raw !== undefined && String(raw).trim() !== '') {
    return String(raw).replace(/\/$/, '')
  }
  return import.meta.env.DEV ? 'http://127.0.0.1:8000' : ''
})()

const TOKEN_KEY = 'access_token'

export function getStoredToken(): string | null {
  return localStorage.getItem(TOKEN_KEY)
}

export function setStoredToken(token: string | null): void {
  if (token) localStorage.setItem(TOKEN_KEY, token)
  else localStorage.removeItem(TOKEN_KEY)
}

export class ApiError extends Error {
  status: number
  body?: unknown
  constructor(message: string, status: number, body?: unknown) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.body = body
  }
}

export async function apiJson<T>(
  path: string,
  init: RequestInit = {}
): Promise<T> {
  const url = path.startsWith('http') ? path : `${API_BASE}${path}`
  const headers = new Headers(init.headers)
  if (init.body !== undefined && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json')
  }
  const t = getStoredToken()
  if (t) headers.set('Authorization', `Bearer ${t}`)

  const res = await fetch(url, { ...init, headers })
  const text = await res.text()
  const data = text
    ? (() => {
        try {
          return JSON.parse(text) as unknown
        } catch {
          return text
        }
      })()
    : null

  if (!res.ok) {
    const msg =
      data &&
      typeof data === 'object' &&
      data !== null &&
      'detail' in data
        ? String(
            (data as { detail: string | string[] }).detail
          )
        : res.statusText
    const detail = Array.isArray(msg) ? msg.join(', ') : msg
    throw new ApiError(detail || 'Request failed', res.status, data)
  }
  return data as T
}
