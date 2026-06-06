import { apiFetch } from "./api.client";
import type { Factura } from "@/types/pedidos.types";

export function obtenerMisFacturas(): Promise<Factura[]> {
  return apiFetch<Factura[]>("/facturas/me");
}

export function generarFactura(idPedido: string): Promise<Factura> {
  return apiFetch<Factura>(`/facturas/generar/${idPedido}`, { method: "POST" });
}
