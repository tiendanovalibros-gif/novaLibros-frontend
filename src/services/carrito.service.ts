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
  metodoEntrega?: string;
  direccionEntrega?: string;
}

export interface CheckoutCarritoResponse {
  pedidoId: string;
  numeroOrden: string;
  montoTotal: number | string;
  saldoDisponible: number | string;
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
  payload: CheckoutCarritoPayload = {}
): Promise<CheckoutCarritoResponse> {
  return apiFetch<CheckoutCarritoResponse>("/carritos/me/checkout", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}
