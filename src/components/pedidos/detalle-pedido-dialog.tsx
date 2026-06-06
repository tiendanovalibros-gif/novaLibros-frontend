"use client";

import { useState } from "react";
import Image from "next/image";
import Iconify from "@/components/iconify/iconify";
import EstadoBadge from "./estado-badge";
import ConfirmFacturaDialog from "./confirm-factura-dialog";
import type { PedidoDetalle } from "@/types/pedidos.types";
import { generarFactura, descargarFacturaPdf } from "@/services/facturas.service";

interface Props {
  pedido: PedidoDetalle | null;
  isOpen: boolean;
  onClose: () => void;
  onSolicitarDevolucion: (pedidoId: string) => void;
  onFacturaGenerada?: () => void;
}

const LABEL_ENTREGA: Record<string, string> = {
  domicilio: "Envío a domicilio",
  tienda: "Recogida en tienda",
  express: "Envío express",
};

export default function DetallePedidoDialog({
  pedido,
  isOpen,
  onClose,
  onSolicitarDevolucion,
  onFacturaGenerada,
}: Props) {
  const [facturaId, setFacturaId] = useState<string | null>(null);
  const [confirmFactura, setConfirmFactura] = useState(false);
  const [generandoFactura, setGenerandoFactura] = useState(false);
  const [descargandoPdf, setDescargandoPdf] = useState(false);
  const [facturaGenerada, setFacturaGenerada] = useState(false);
  const [errorFactura, setErrorFactura] = useState<string | null>(null);

  if (!isOpen || !pedido) return null;

  const monto =
    typeof pedido.montoTotal === "string" ? parseFloat(pedido.montoTotal) : pedido.montoTotal;
  const yaTieneFactura = pedido.tieneFactura || facturaGenerada;

  const handleGenerarFactura = async () => {
    setGenerandoFactura(true);
    setErrorFactura(null);
    try {
      const factura = await generarFactura(pedido.id);
      setFacturaId(factura.id);
      setFacturaGenerada(true);
      setConfirmFactura(false);
      onFacturaGenerada?.();
      // Descarga automática al generar
      await descargarFacturaPdf(factura.id);
    } catch (err: any) {
      setErrorFactura(err?.message ?? "No se pudo generar la factura");
      setConfirmFactura(false);
    } finally {
      setGenerandoFactura(false);
    }
  };

  const handleDescargarPdf = async () => {
    const id = facturaId ?? pedido.facturaId ?? null;
    if (!id) return;
    setDescargandoPdf(true);
    try {
      await descargarFacturaPdf(id);
    } catch {
      setErrorFactura("No se pudo descargar el PDF");
    } finally {
      setDescargandoPdf(false);
    }
  };

  const puedeDevolucion = pedido.estadoActual === "entregado" && !pedido.devolucion;

  return (
    <>
      <div className="fixed inset-0 z-40 flex items-end sm:items-center justify-center bg-black/40 px-0 sm:px-4">
        <div className="w-full sm:max-w-lg rounded-t-2xl sm:rounded-2xl bg-white shadow-xl max-h-[90vh] flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
            <div>
              <p className="text-xs text-slate-500">Pedido</p>
              <h2 className="text-base font-bold text-slate-900">{pedido.numeroOrden}</h2>
            </div>
            <button onClick={onClose} className="rounded-full p-1.5 hover:bg-slate-100">
              <Iconify icon="solar:close-circle-linear" width={22} className="text-slate-500" />
            </button>
          </div>

          {/* Body */}
          <div className="overflow-y-auto flex-1 px-5 py-4 space-y-5">
            {/* Estado + fecha */}
            <div className="flex items-center justify-between">
              <EstadoBadge estado={pedido.devolucion?.estado ?? pedido.estadoActual} />
              <span className="text-xs text-slate-500">
                {new Date(pedido.fechaOrden).toLocaleDateString("es-CO", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </span>
            </div>

            {/* Items */}
            <div className="space-y-3">
              {pedido.items.map(item => (
                <div key={item.id} className="flex items-center gap-3">
                  <div className="relative h-14 w-10 flex-shrink-0 overflow-hidden rounded-md bg-slate-100">
                    {item.libro.imagenPortada ? (
                      <Image
                        src={`/api/proxy-cover?url=${encodeURIComponent(item.libro.imagenPortada)}`}
                        alt={item.libro.titulo}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        <Iconify icon="solar:book-linear" width={18} className="text-slate-400" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="truncate text-sm font-medium text-slate-900">
                      {item.libro.titulo}
                    </p>
                    <p className="text-xs text-slate-500">Cant. {item.cantidad}</p>
                  </div>
                  <p className="text-sm font-semibold text-slate-900">
                    ${item.subtotalLinea.toLocaleString("es-CO")}
                  </p>
                </div>
              ))}
            </div>

            {/* Totales */}
            <div className="rounded-xl bg-slate-50 p-4 space-y-1.5 text-sm">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal</span>
                <span>${pedido.subtotal.toLocaleString("es-CO")}</span>
              </div>
              {pedido.costoEnvio > 0 && (
                <div className="flex justify-between text-slate-600">
                  <span>Envío</span>
                  <span>${pedido.costoEnvio.toLocaleString("es-CO")}</span>
                </div>
              )}
              <div className="flex justify-between font-bold text-slate-900 pt-1 border-t border-slate-200">
                <span>Total</span>
                <span>${monto.toLocaleString("es-CO")}</span>
              </div>
            </div>

            {/* Entrega */}
            <div className="text-sm text-slate-600 space-y-1">
              <p className="font-medium text-slate-800">
                {LABEL_ENTREGA[pedido.metodoEntrega] ?? pedido.metodoEntrega}
              </p>
              {pedido.tienda && (
                <p>
                  {pedido.tienda.nombre} — {pedido.tienda.ciudad}
                </p>
              )}
              {pedido.direccionEntrega && <p>{pedido.direccionEntrega}</p>}
            </div>

            {/* Error factura */}
            {errorFactura && <p className="text-xs text-red-600">{errorFactura}</p>}
          </div>

          {/* Acciones */}
          <div className="border-t border-slate-100 px-5 py-4 flex gap-3">
            {puedeDevolucion && (
              <button
                onClick={() => {
                  onClose();
                  onSolicitarDevolucion(pedido.id);
                }}
                className="flex-1 rounded-xl border border-slate-200 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 flex items-center justify-center gap-1.5"
              >
                <Iconify icon="solar:arrow-left-broken" width={16} />
                Devolver
              </button>
            )}
            {yaTieneFactura ? (
              <button
                onClick={() => void handleDescargarPdf()}
                disabled={descargandoPdf}
                className="flex-1 rounded-xl bg-green-50 border border-green-200 py-2.5 text-sm font-semibold text-green-700 hover:bg-green-100 disabled:opacity-50 flex items-center justify-center gap-1.5"
              >
                {descargandoPdf ? (
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-green-500 border-t-transparent" />
                ) : (
                  <Iconify icon="solar:download-bold" width={16} />
                )}
                Descargar factura
              </button>
            ) : (
              <button
                onClick={() => setConfirmFactura(true)}
                disabled={generandoFactura}
                className="flex-1 rounded-xl bg-blue-600 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-1.5"
              >
                {generandoFactura ? (
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                ) : (
                  <Iconify icon="solar:document-bold" width={16} />
                )}
                Generar factura
              </button>
            )}
          </div>
        </div>
      </div>

      <ConfirmFacturaDialog
        isOpen={confirmFactura}
        numeroOrden={pedido.numeroOrden}
        montoTotal={pedido.montoTotal}
        isLoading={generandoFactura}
        onConfirm={() => void handleGenerarFactura()}
        onCancel={() => setConfirmFactura(false)}
      />
    </>
  );
}
