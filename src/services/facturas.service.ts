import { apiFetch } from "./api.client";
import type { Factura } from "@/types/pedidos.types";

export function obtenerMisFacturas(): Promise<Factura[]> {
  return apiFetch<Factura[]>("/facturas/me");
}

export function generarFactura(idPedido: string): Promise<Factura> {
  return apiFetch<Factura>(`/facturas/generar/${idPedido}`, { method: "POST" });
}

export async function descargarFacturaPdf(idFactura: string): Promise<void> {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL ?? "";
  const token = localStorage.getItem("auth_token") ?? "";

  const res = await fetch(`${baseUrl}/facturas/${idFactura}/pdf`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) throw new Error("No se pudo descargar la factura");

  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `factura-${idFactura}.pdf`;
  a.click();
  URL.revokeObjectURL(url);
}
