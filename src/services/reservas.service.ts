import { apiFetch } from "@/services/api.client";
import type { CarritoResponse } from "@/services/carrito.service";

export interface CrearReservaPayload {
  idLibro: string;
  cantidad: number;
}

export interface ReservaResponse {
  id: string;
  idUsuario: string;
  horaCreacion: string;
  horaExpiracion: string;
  estado: "activa" | "expirada" | "cancelada" | "convertida";
  itemsReserva: Array<{
    id: number;
    idReserva: string;
    idLibro: string;
    cantidad: number;
    libro?: {
      id: string;
      titulo: string;
      imagenPortada?: string | null;
      isbn: string;
    };
  }>;
}

export async function crearReserva(payload: CrearReservaPayload): Promise<ReservaResponse> {
  return apiFetch<ReservaResponse>("/reservas", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function obtenerMisReservas(): Promise<ReservaResponse[]> {
  return apiFetch<ReservaResponse[]>("/reservas/me");
}

export async function cancelarReserva(idReserva: string): Promise<ReservaResponse> {
  return apiFetch<ReservaResponse>(`/reservas/${idReserva}/cancel`, {
    method: "PATCH",
  });
}

export async function convertirReservaACarrito(idReserva: string): Promise<CarritoResponse> {
  return apiFetch<CarritoResponse>(`/reservas/${idReserva}/convert-to-cart`, {
    method: "PATCH",
  });
}
