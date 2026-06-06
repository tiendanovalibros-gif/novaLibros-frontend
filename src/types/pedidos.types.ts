import type { MetodoEntregaCodigo } from "@/services/carrito.service";

export interface PedidoResumen {
  id: string;
  numeroOrden: string;
  fechaOrden: string;
  montoTotal: number | string;
  metodoEntrega: MetodoEntregaCodigo;
  estadoActual: "en_preparacion" | "enviado" | "entregado";
  totalItems: number;
  portadas: (string | null)[];
  facturaId: string | null;
  devolucion: { id: string; estado: "solicitada" | "aprobada" | "rechazada" } | null;
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
  tienda: {
    id: number;
    nombre: string;
    direccion: string;
    direccionNormalizada: string | null;
    ciudad: string | null;
    latitud: number;
    longitud: number;
  } | null;
  estadoActual: "en_preparacion" | "enviado" | "entregado";
  tieneFactura: boolean;
  facturaId: string | null;
  devolucion: { id: string; estado: "solicitada" | "aprobada" | "rechazada" } | null;
  items: {
    id: number;
    idLibro: string;
    cantidad: number;
    precioUnitario: number | string;
    subtotalLinea: number;
    libro: {
      id: string;
      titulo: string;
      isbn: string;
      imagenPortada?: string | null;
    };
  }[];
}

export interface Factura {
  id: string;
  idPedido: string;
  idUsuario: string;
  montoSubtotal: number | string;
  iva: number | string;
  montoTotal: number | string;
  pedido?: {
    id: string;
    numeroOrden: string;
    fechaOrden: string;
    metodoEntrega: MetodoEntregaCodigo;
  };
}

export interface Devolucion {
  id: string;
  idPedido: string;
  idUsuario: string;
  razon: string;
  descripcion?: string | null;
  estado: "solicitada" | "aprobada" | "rechazada";
  codigoQr?: string | null;
  pedido?: {
    id: string;
    numeroOrden: string;
    fechaOrden: string;
  };
}
