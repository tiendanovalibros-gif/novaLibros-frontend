"use client";

import Link from "next/link";
import Iconify from "@/components/iconify/iconify";
import { formatearSaldo } from "@/services/pagos.service";
import type { PedidoDetalle } from "@/services/pedidos.service";
import type { MetodoEntregaCodigo } from "@/services/carrito.service";

const ETIQUETA_METODO: Record<MetodoEntregaCodigo, string> = {
  tienda: "Recogida en tienda",
  domicilio: "Envío a domicilio",
  express: "Entrega express",
};

const ICONO_METODO: Record<MetodoEntregaCodigo, string> = {
  tienda: "solar:shop-bold",
  domicilio: "solar:home-2-bold",
  express: "solar:delivery-bold",
};

const ETIQUETA_ESTADO: Record<string, string> = {
  en_preparacion: "En preparación",
  enviado: "Enviado",
  entregado: "Entregado",
};

function formatFecha(iso: string) {
  try {
    return new Date(iso).toLocaleString("es-CO", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  } catch {
    return iso;
  }
}

function getBookCoverUrl(imagenPortada?: string | null) {
  if (!imagenPortada) return null;
  if (imagenPortada.startsWith("http")) return imagenPortada;
  if (imagenPortada.startsWith("/")) {
    return `${process.env.NEXT_PUBLIC_API_URL}${imagenPortada}`;
  }
  return null;
}

function getMapsUrl(tienda: PedidoDetalle["tienda"]) {
  if (!tienda) return null;
  const query = encodeURIComponent(
    `${tienda.nombre}, ${tienda.direccion}, ${tienda.ciudad ?? "Colombia"}`
  );
  return `https://www.google.com/maps/search/?api=1&query=${query}&ll=${tienda.latitud},${tienda.longitud}`;
}

interface Props {
  pedido: PedidoDetalle;
  saldoDisponible?: number | string | null;
}

export default function ConfirmacionCompra({ pedido, saldoDisponible }: Props) {
  const metodo = pedido.metodoEntrega;
  const mapsUrl = getMapsUrl(pedido.tienda);

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="text-center">
        <div className="mx-auto h-16 w-16 rounded-full bg-emerald-100 flex items-center justify-center mb-4">
          <Iconify icon="solar:check-circle-bold-duotone" className="text-emerald-600" width={40} />
        </div>
        <h1 className="text-2xl font-bold text-slate-900">¡Compra confirmada!</h1>
        <p className="text-slate-500 text-sm mt-1">
          Tu pedido fue registrado correctamente. Guarda el número de orden.
        </p>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
        <div className="bg-blue-600 px-5 py-4 text-white">
          <p className="text-blue-100 text-xs font-medium uppercase tracking-wide">Número de orden</p>
          <p className="text-xl font-bold tracking-tight mt-0.5">{pedido.numeroOrden}</p>
          <p className="text-blue-100 text-xs mt-1">{formatFecha(pedido.fechaOrden)}</p>
        </div>

        <div className="p-5 space-y-4">
          <div className="flex items-center justify-between gap-3">
            <span className="text-slate-500 text-sm">Estado</span>
            <span className="text-sm font-semibold px-2.5 py-1 rounded-full bg-amber-100 text-amber-800">
              {ETIQUETA_ESTADO[pedido.estadoActual] ?? pedido.estadoActual}
            </span>
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <div className="flex items-start gap-3">
              <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center shrink-0">
                <Iconify icon={ICONO_METODO[metodo]} className="text-blue-600" width={22} />
              </div>
              <div className="min-w-0">
                <p className="font-semibold text-slate-900 text-sm">{ETIQUETA_METODO[metodo]}</p>
                {metodo === "tienda" && pedido.tienda && (
                  <>
                    <p className="text-slate-700 text-sm mt-1 font-medium">{pedido.tienda.nombre}</p>
                    <p className="text-slate-500 text-xs mt-0.5">
                      {pedido.tienda.direccionNormalizada || pedido.tienda.direccion}
                      {pedido.tienda.ciudad ? `, ${pedido.tienda.ciudad}` : ""}
                    </p>
                    {mapsUrl && (
                      <a
                        href={mapsUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs text-blue-600 hover:underline mt-2 font-medium"
                      >
                        <Iconify icon="solar:map-point-bold" width={14} />
                        Ver tienda en mapa
                      </a>
                    )}
                  </>
                )}
                {metodo !== "tienda" && pedido.direccionEntrega && (
                  <p className="text-slate-600 text-sm mt-1">{pedido.direccionEntrega}</p>
                )}
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-sm font-bold text-slate-800 mb-3">Libros ({pedido.items.length})</h2>
            <ul className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden">
              {pedido.items.map(item => {
                const cover = getBookCoverUrl(item.libro.imagenPortada);
                return (
                  <li key={item.id} className="flex gap-3 p-3 bg-white">
                    <div className="h-14 w-10 shrink-0 rounded bg-slate-100 border border-slate-200 overflow-hidden flex items-center justify-center">
                      {cover ? (
                        <img src={cover} alt="" className="h-full w-full object-cover" />
                      ) : (
                        <Iconify icon="solar:book-bold" className="text-slate-300" width={20} />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-900 leading-snug">
                        {item.libro.titulo}
                      </p>
                      <p className="text-xs text-slate-500">ISBN {item.libro.isbn}</p>
                      <p className="text-xs text-slate-600 mt-1">
                        {item.cantidad} × {formatearSaldo(item.precioUnitario)}
                      </p>
                    </div>
                    <p className="text-sm font-semibold text-slate-900 shrink-0">
                      {formatearSaldo(item.subtotalLinea)}
                    </p>
                  </li>
                );
              })}
            </ul>
          </div>

          <div className="rounded-xl bg-slate-50 border border-slate-200 p-4 space-y-2 text-sm">
            <div className="flex justify-between text-slate-600">
              <span>Subtotal</span>
              <span>{formatearSaldo(pedido.subtotal)}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Envío</span>
              <span>
                {pedido.costoEnvio === 0 ? "Gratis" : formatearSaldo(pedido.costoEnvio)}
              </span>
            </div>
            <div className="flex justify-between font-bold text-slate-900 pt-2 border-t border-slate-200">
              <span>Total pagado</span>
              <span>{formatearSaldo(pedido.montoTotal)}</span>
            </div>
            {saldoDisponible !== undefined && saldoDisponible !== null && (
              <div className="flex justify-between text-slate-500 text-xs pt-1">
                <span>Saldo restante</span>
                <span>{formatearSaldo(saldoDisponible)}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Link
          href="/"
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors"
        >
          <Iconify icon="solar:book-2-bold" width={18} />
          Seguir comprando
        </Link>
        <Link
          href="/tiendas"
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 border border-slate-300 text-slate-700 rounded-lg text-sm font-semibold hover:bg-slate-50 transition-colors"
        >
          <Iconify icon="solar:map-point-bold" width={18} />
          Ver tiendas
        </Link>
      </div>
    </div>
  );
}
