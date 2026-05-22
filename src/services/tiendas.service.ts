import { apiFetch } from './api.client'

export interface Tienda {
  id: number
  nombre: string
  direccion: string
  direccionNormalizada: string
  ciudad: string | null
  latitud: number
  longitud: number
}

export interface TiendaPayload {
  nombre: string
  direccion: string
  ciudad: string
  latitud?: number
  longitud?: number
}

export interface TiendaUbicacionPayload {
  latitud: number
  longitud: number
}

export interface ValidateDireccionPayload {
  direccion: string
  ciudad: string
}

export interface ValidateDireccionResponse {
  coincideCiudad: boolean
  latitud: number
  longitud: number
  ciudadDetectada: string
  direccionNormalizada: string
  proveedor: string
}

export function listarTiendas(): Promise<Tienda[]> {
  return apiFetch<Tienda[]>('/tiendas')
}

export function crearTienda(payload: TiendaPayload): Promise<Tienda> {
  return apiFetch<Tienda>('/tiendas', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function editarTienda(id: number, payload: TiendaPayload): Promise<Tienda> {
  return apiFetch<Tienda>(`/tiendas/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  })
}

export function actualizarUbicacionTienda(
  id: number,
  payload: TiendaUbicacionPayload
): Promise<Tienda> {
  return apiFetch<Tienda>(`/tiendas/${id}/ubicacion`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  })
}

export function eliminarTienda(id: number): Promise<Tienda> {
  return apiFetch<Tienda>(`/tiendas/${id}`, {
    method: 'DELETE',
  })
}

export function validarDireccionTienda(
  payload: ValidateDireccionPayload
): Promise<ValidateDireccionResponse> {
  return apiFetch<ValidateDireccionResponse>('/tiendas/validar-direccion', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}
