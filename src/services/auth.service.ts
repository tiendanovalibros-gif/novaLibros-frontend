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

export async function saveToken(token: string): Promise<void> {
  await fetch('/api/auth/set-cookie', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token }),
  })
}

export async function clearToken(): Promise<void> {
  await fetch('/api/auth/clear-cookie', { method: 'POST' })
}

// Login retorna el usuario directo — no hay que llamar /me después
export async function login(payload: LoginPayload): Promise<Usuario> {
  const data = await apiFetch<LoginResponse>('/users/login', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
  await saveToken(data.access_token)
  return data.usuario
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
