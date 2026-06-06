import { apiFetch } from "./api.client";
import type { Devolucion } from "@/types/pedidos.types";

export function obtenerMisDevoluciones(): Promise<Devolucion[]> {
  return apiFetch<Devolucion[]>("/devoluciones/me");
}

export function solicitarDevolucion(
  idPedido: string,
  razon: string,
  descripcion?: string
): Promise<Devolucion> {
  return apiFetch<Devolucion>("/devoluciones/me", {
    method: "POST",
    body: JSON.stringify({ idPedido, razon, descripcion }),
  });
}

// Admin
export function cambiarEstadoDevolucion(
  id: string,
  estado: "aprobada" | "rechazada"
): Promise<Devolucion> {
  return apiFetch<Devolucion>(`/devoluciones/${id}/estado`, {
    method: "PATCH",
    body: JSON.stringify({ estado }),
  });
}

export function obtenerTodasLasDevoluciones(): Promise<Devolucion[]> {
  return apiFetch<Devolucion[]>("/devoluciones");
}

export function obtenerDevolucion(id: string): Promise<Devolucion> {
  return apiFetch<Devolucion>(`/devoluciones/${id}`);
}
