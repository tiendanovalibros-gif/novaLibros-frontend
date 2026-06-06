import { apiFetch } from "./api.client";
import type { MetodoEntregaCodigo } from "./carrito.service";
import type { PedidoResumen } from "@/types/pedidos.types";

export interface PedidoItemLibro {
  id: string;
  titulo: string;
  isbn: string;
  imagenPortada?: string | null;
}

export interface PedidoItem {
  id: number;
  idLibro: string;
  cantidad: number;
  precioUnitario: number | string;
  subtotalLinea: number;
  libro: PedidoItemLibro;
}

export interface PedidoTienda {
  id: number;
  nombre: string;
  direccion: string;
  direccionNormalizada: string | null;
  ciudad: string | null;
  latitud: number;
  longitud: number;
}

export interface PedidoDetalle {
  id: string;
  numeroOrden: string;
  fechaOrden: string;
  montoTotal: number | string;
  subtotal: number;
  costoEnvio: number;
  metodoEntrega: MetodoEntregaCodigo;
  direccionEntrega: string | null;
  idTienda: number | null;
  tienda: PedidoTienda | null;
  estadoActual: string;
  items: PedidoItem[];
}

export async function obtenerPedido(id: string): Promise<PedidoDetalle> {
  return apiFetch<PedidoDetalle>(`/pedidos/${id}`);
}

export async function obtenerMisPedidos(): Promise<PedidoResumen[]> {
  return apiFetch<PedidoResumen[]>("/pedidos/me");
}
