"use client";

import { useState } from "react";
import Image from "next/image";
import Iconify from "@/components/iconify/iconify";
import EstadoBadge from "@/components/pedidos/estado-badge";
import DetallePedidoDialog from "@/components/pedidos/detalle-pedido-dialog";
import SolicitarDevolucionDialog from "@/components/pedidos/solicitar-devolucion-dialog";
import QrDevolucionDialog from "@/components/pedidos/qr-devolucion-dialog";
import { usePedidos } from "@/hooks/usePedidos";
import { obtenerPedido } from "@/services/pedidos.service";
import { obtenerDevolucion } from "@/services/devoluciones.service";
import type { PedidoDetalle, Devolucion } from "@/types/pedidos.types";

export default function MisPedidos() {
  const { pedidos, devoluciones, loading, error, recargar } = usePedidos();

  const [detalle, setDetalle] = useState<PedidoDetalle | null>(null);
  const [loadingDetalle, setLoadingDetalle] = useState(false);
  const [detalleOpen, setDetalleOpen] = useState(false);

  const [devolucionPedidoId, setDevolucionPedidoId] = useState("");
  const [devolucionNumeroOrden, setDevolucionNumeroOrden] = useState("");
  const [devolucionOpen, setDevolucionOpen] = useState(false);

  const [qrDevolucion, setQrDevolucion] = useState<Devolucion | null>(null);
  const [qrOpen, setQrOpen] = useState(false);
  const [loadingQr, setLoadingQr] = useState(false);

  const abrirDetalle = async (id: string) => {
    setLoadingDetalle(true);
    try {
      const data = await obtenerPedido(id);
      setDetalle(data);
      setDetalleOpen(true);
    } catch {
      // silencioso
    } finally {
      setLoadingDetalle(false);
    }
  };

  const abrirQr = async (devolucionId: string) => {
    setLoadingQr(true);
    try {
      const data = await obtenerDevolucion(devolucionId);
      setQrDevolucion(data);
      setQrOpen(true);
    } catch {
      // silencioso
    } finally {
      setLoadingQr(false);
    }
  };

  const handleSolicitarDevolucion = (pedidoId: string) => {
    const pedido = pedidos.find(p => p.id === pedidoId);
    setDevolucionPedidoId(pedidoId);
    setDevolucionNumeroOrden(pedido?.numeroOrden ?? "");
    setDevolucionOpen(true);
  };

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-24 animate-pulse rounded-2xl bg-slate-100" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
        {error}
      </div>
    );
  }

  if (pedidos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100">
          <Iconify icon="solar:bag-smile-linear" width={32} className="text-slate-400" />
        </div>
        <p className="text-base font-semibold text-slate-700">Sin compras aún</p>
        <p className="mt-1 text-sm text-slate-500">Cuando realices una compra aparecerá aquí.</p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-3">
        {pedidos.map(pedido => {
          const monto =
            typeof pedido.montoTotal === "string"
              ? parseFloat(pedido.montoTotal)
              : pedido.montoTotal;

          const devolucion = devoluciones.find(d => d.idPedido === pedido.id);
          const estadoVisible = devolucion?.estado ?? pedido.estadoActual;

          return (
            <div
              key={pedido.id}
              className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
            >
              <div className="flex items-start justify-between gap-3">
                {/* Portadas */}
                <div className="flex -space-x-2 flex-shrink-0">
                  {pedido.portadas.slice(0, 3).map((portada, idx) => (
                    <div
                      key={idx}
                      className="relative h-12 w-9 overflow-hidden rounded-md border-2 border-white bg-slate-100"
                      style={{ zIndex: 3 - idx }}
                    >
                      {portada ? (
                        <Image
                          src={`/api/proxy-cover?url=${encodeURIComponent(portada)}`}
                          alt=""
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center">
                          <Iconify icon="solar:book-linear" width={14} className="text-slate-400" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-slate-500">{pedido.numeroOrden}</p>
                  <p className="text-sm font-semibold text-slate-900">
                    ${monto.toLocaleString("es-CO")}
                    <span className="ml-1.5 text-xs font-normal text-slate-500">
                      · {pedido.totalItems} {pedido.totalItems === 1 ? "libro" : "libros"}
                    </span>
                  </p>
                  <p className="text-xs text-slate-500">
                    {new Date(pedido.fechaOrden).toLocaleDateString("es-CO", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </p>
                </div>

                {/* Estado */}
                <EstadoBadge estado={estadoVisible} />
              </div>

              {/* Acciones */}
              <div className="mt-3 flex gap-2 flex-wrap">
                <button
                  onClick={() => void abrirDetalle(pedido.id)}
                  disabled={loadingDetalle}
                  className="flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                >
                  <Iconify icon="solar:eye-linear" width={14} />
                  Ver detalle
                </button>

                {devolucion && (
                  <button
                    onClick={() => void abrirQr(devolucion.id)}
                    disabled={loadingQr}
                    className="flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                  >
                    <Iconify icon="solar:qr-code-linear" width={14} />
                    Ver devolución
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <DetallePedidoDialog
        pedido={detalle}
        isOpen={detalleOpen}
        onClose={() => setDetalleOpen(false)}
        onSolicitarDevolucion={handleSolicitarDevolucion}
        onFacturaGenerada={recargar}
      />

      <SolicitarDevolucionDialog
        isOpen={devolucionOpen}
        pedidoId={devolucionPedidoId}
        numeroOrden={devolucionNumeroOrden}
        onClose={() => setDevolucionOpen(false)}
        onSuccess={recargar}
      />

      <QrDevolucionDialog
        devolucion={qrDevolucion}
        isOpen={qrOpen}
        onClose={() => setQrOpen(false)}
      />
    </>
  );
}
