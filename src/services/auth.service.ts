import { apiFetch } from './api.client'

export interface LoginPayload {
  correo: string
  contrasena: string
}

export interface RegisterPayload {
  nombre: string
  apellido: string
  dni: string
  fechaNacimiento: string
  correo: string
  contrasenaHash: string
  direccion: string
  telefono?: string
  rol: string
  estadoCuenta: boolean
}

export interface Usuario {
  id: string
  nombre: string
  apellido: string
  correo: string
  rol: 'root' | 'administrador' | 'cliente'
}

export interface LoginResponse {
  access_token: string
  usuario: Usuario
}

export function persistToken(token: string): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem('auth_token', token)
  }
}

export function clearPersistedToken(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('auth_token')
  }
}

export async function saveToken(token: string): Promise<void> {
  await fetch('/api/auth/set-cookie', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token }),
  })
  persistToken(token)
}

export async function clearToken(): Promise<void> {
  await fetch('/api/auth/clear-cookie', { method: 'POST' })
  clearPersistedToken()
}

// Login retorna el usuario directo — no hay que llamar /me después
export async function login(payload: LoginPayload): Promise<LoginResponse> {
  const data = await apiFetch<LoginResponse>('/users/login', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
  await saveToken(data.access_token)
  return data
}

export async function register(payload: RegisterPayload): Promise<void> {
  await apiFetch('/users/register', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export async function logout(): Promise<void> {
  await clearToken()
}

export async function getUserById(id: string, token: string): Promise<Usuario> {
  return apiFetch<Usuario>(`/users/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  })
}

export async function forgotPassword(correo: string): Promise<void> {
  await apiFetch("/users/forgot-password", {
    method: "POST",
    body: JSON.stringify({ correo }),
  });
}

export async function resetPassword(token: string, nuevaContrasena: string): Promise<void> {
  await apiFetch("/users/reset-password", {
    method: "POST",
    body: JSON.stringify({ token, nuevaContrasena }),
  });
}
