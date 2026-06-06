"use client";

import Image from "next/image";
import Iconify from "@/components/iconify/iconify";
import EstadoBadge from "@/components/pedidos/estado-badge";
import type { Devolucion } from "@/types/pedidos.types";

interface Props {
  devolucion: Devolucion | null;
  isOpen: boolean;
  procesando: boolean;
  onClose: () => void;
  onAprobar: (id: string) => void;
  onRechazar: (id: string) => void;
}

export default function AdminDevolucionDetalleDialog({
  devolucion,
  isOpen,
  procesando,
  onClose,
  onAprobar,
  onRechazar,
}: Props) {
  if (!isOpen || !devolucion) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 px-0 sm:px-4">
      <div className="w-full sm:max-w-md rounded-t-2xl sm:rounded-2xl bg-white shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <h2 className="text-base font-bold text-slate-900">Detalle de devolución</h2>
          <button onClick={onClose} className="rounded-full p-1.5 hover:bg-slate-100">
            <Iconify icon="solar:close-circle-linear" width={22} className="text-slate-500" />
          </button>
        </div>

        {/* Body */}
        <div className="px-5 py-5 space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-xs text-slate-500">
              {devolucion.pedido?.numeroOrden ?? devolucion.idPedido}
            </p>
            <EstadoBadge estado={devolucion.estado} />
          </div>

          <div className="rounded-xl bg-slate-50 p-4 space-y-2 text-sm">
            <div>
              <p className="text-xs text-slate-500 mb-0.5">Razón</p>
              <p className="font-medium text-slate-900">{devolucion.razon}</p>
            </div>
            {devolucion.descripcion && (
              <div>
                <p className="text-xs text-slate-500 mb-0.5">Descripción</p>
                <p className="text-slate-700">{devolucion.descripcion}</p>
              </div>
            )}
            {devolucion.pedido?.fechaOrden && (
              <div>
                <p className="text-xs text-slate-500 mb-0.5">Fecha del pedido</p>
                <p className="text-slate-700">
                  {new Date(devolucion.pedido.fechaOrden).toLocaleDateString("es-CO", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </p>
              </div>
            )}
          </div>

          {/* QR si está aprobada */}
          {devolucion.estado === "aprobada" && devolucion.codigoQr && (
            <div className="space-y-2 text-center">
              <p className="text-xs text-slate-500">Código QR generado</p>
              <div className="flex justify-center">
                <div className="rounded-xl border-2 border-slate-200 p-3">
                  <Image
                    src={devolucion.codigoQr}
                    alt="QR de devolución"
                    width={160}
                    height={160}
                    unoptimized
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Acciones */}
        {devolucion.estado === "solicitada" && (
          <div className="border-t border-slate-100 px-5 py-4 flex gap-3">
            <button
              onClick={() => onRechazar(devolucion.id)}
              disabled={procesando}
              className="flex-1 rounded-xl border border-red-200 bg-red-50 py-2.5 text-sm font-semibold text-red-700 hover:bg-red-100 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {procesando && (
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-red-400 border-t-transparent" />
              )}
              <Iconify icon="solar:close-circle-bold" width={16} />
              Rechazar
            </button>
            <button
              onClick={() => onAprobar(devolucion.id)}
              disabled={procesando}
              className="flex-1 rounded-xl bg-green-600 py-2.5 text-sm font-semibold text-white hover:bg-green-700 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {procesando && (
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              )}
              <Iconify icon="solar:check-circle-bold" width={16} />
              Aprobar y generar QR
            </button>
          </div>
        )}

        {devolucion.estado !== "solicitada" && (
          <div className="border-t border-slate-100 px-5 py-4">
            <button
              onClick={onClose}
              className="w-full rounded-xl bg-slate-900 py-2.5 text-sm font-semibold text-white hover:bg-slate-800"
            >
              Cerrar
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
