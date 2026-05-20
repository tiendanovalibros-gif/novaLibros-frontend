import { apiFetch } from "@/services/api.client";

export interface CarritoDetalleLibro {
  id: string;
  titulo: string;
  imagenPortada?: string | null;
  isbn: string;
  precio: number;
  estado: string;
}

export interface CarritoDetalle {
  id: number;
  idCarrito: number;
  idLibro: string;
  cantidad: number;
  precioUnitario: number;
  libro: CarritoDetalleLibro;
}

export interface CarritoResponse {
  id: number;
  idUsuario: string;
  fechaCreacion: string;
  fechaActualizacion: string;
  detalles: CarritoDetalle[];
}

export interface AddItemCarritoPayload {
  idLibro: string;
  cantidad: number;
}

export interface CheckoutCarritoPayload {
  idTienda: number;
  direccionEntrega?: string;
}

export interface CheckoutCarritoResponse {
  pedidoId: string;
  numeroOrden: string;
  montoTotal: number | string;
  idTienda: number | null;
  nombreTienda: string | null;
  saldoDisponible: number | string;
}

export interface TiendaRecogidaOpcion {
  id: number;
  nombre: string;
  direccion: string;
  direccionNormalizada: string | null;
  ciudad: string | null;
  latitud: number;
  longitud: number;
  distanciaKm: number | null;
  puedeCompletarCarrito: boolean;
  faltantes: Array<{ idLibro: string; solicitado: number; disponible: number }>;
}

export async function obtenerMiCarrito(): Promise<CarritoResponse> {
  return apiFetch<CarritoResponse>("/carritos/me");
}

export async function agregarLibroAMiCarrito(
  payload: AddItemCarritoPayload
): Promise<CarritoResponse> {
  return apiFetch<CarritoResponse>("/carritos/me/items", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function quitarLibroDeMiCarrito(idDetalle: number): Promise<CarritoResponse> {
  return apiFetch<CarritoResponse>(`/carritos/me/items/${idDetalle}`, {
    method: "DELETE",
  });
}

export async function actualizarCantidadLibroMiCarrito(
  idDetalle: number,
  cantidad: number
): Promise<CarritoResponse> {
  return apiFetch<CarritoResponse>(`/carritos/me/items/${idDetalle}`, {
    method: "PATCH",
    body: JSON.stringify({ cantidad }),
  });
}

export async function checkoutMiCarrito(
  payload: CheckoutCarritoPayload
): Promise<CheckoutCarritoResponse> {
  return apiFetch<CheckoutCarritoResponse>("/carritos/me/checkout", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function obtenerOpcionesRecogida(
  lat?: number,
  lng?: number
): Promise<TiendaRecogidaOpcion[]> {
  const params = new URLSearchParams();
  if (lat !== undefined) params.set("lat", String(lat));
  if (lng !== undefined) params.set("lng", String(lng));
  const qs = params.toString();
  return apiFetch<TiendaRecogidaOpcion[]>(`/carritos/me/opciones-recogida${qs ? `?${qs}` : ""}`);
}
