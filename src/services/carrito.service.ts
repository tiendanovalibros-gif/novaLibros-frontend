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
