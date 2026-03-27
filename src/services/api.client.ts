const API_URL = process.env.NEXT_PUBLIC_API_URL

if (!API_URL) {
  throw new Error('NEXT_PUBLIC_API_URL no está definida en .env.local')
}

// ─── Tipos ────────────────────────────────────────────────────────────────────
export interface ApiError {
  message: string
  statusCode: number
}

// ─── Fetch base con manejo de errores ─────────────────────────────────────────
function getToken(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem('auth_token')
}

export async function apiFetch<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getToken()
  const res = await fetch(`${API_URL}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
    ...options,
  })

  const data = await res.json()

  if (!res.ok) {
    const error: ApiError = {
      message: data?.message || 'Error en el servidor',
      statusCode: res.status,
    }
    throw error
  }

  return data as T
}
