"use client";

import Image from "next/image";
import Iconify from "@/components/iconify/iconify";
import type { Devolucion } from "@/types/pedidos.types";

interface Props {
  devolucion: Devolucion | null;
  isOpen: boolean;
  onClose: () => void;
}

const ESTADO_INFO = {
  solicitada: {
    label: "Solicitud enviada",
    color: "text-orange-600",
    icon: "solar:clock-circle-bold",
  },
  aprobada: {
    label: "Devolución aprobada",
    color: "text-green-600",
    icon: "solar:check-circle-bold",
  },
  rechazada: {
    label: "Solicitud rechazada",
    color: "text-red-600",
    icon: "solar:close-circle-bold",
  },
};

export default function QrDevolucionDialog({ devolucion, isOpen, onClose }: Props) {
  if (!isOpen || !devolucion) return null;

  const info = ESTADO_INFO[devolucion.estado];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-sm rounded-2xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <h2 className="text-base font-bold text-slate-900">Estado de devolución</h2>
          <button onClick={onClose} className="rounded-full p-1.5 hover:bg-slate-100">
            <Iconify icon="solar:close-circle-linear" width={22} className="text-slate-500" />
          </button>
        </div>

        <div className="px-5 py-6 space-y-4 text-center">
          <div className="flex items-center justify-center gap-2">
            <Iconify icon={info.icon} width={22} className={info.color} />
            <p className={`text-sm font-semibold ${info.color}`}>{info.label}</p>
          </div>

          <div className="text-sm text-slate-600 space-y-1">
            <p>
              <span className="font-medium">Razón:</span> {devolucion.razon}
            </p>
            {devolucion.descripcion && (
              <p>
                <span className="font-medium">Detalle:</span> {devolucion.descripcion}
              </p>
            )}
          </div>

          {devolucion.estado === "aprobada" && devolucion.codigoQr ? (
            <div className="space-y-2">
              <p className="text-xs text-slate-500">
                Muestra este código en la tienda para completar tu devolución
              </p>
              <div className="flex justify-center">
                <div className="rounded-xl border-2 border-slate-200 p-3">
                  <Image
                    src={devolucion.codigoQr}
                    alt="QR de devolución"
                    width={180}
                    height={180}
                    unoptimized
                  />
                </div>
              </div>
            </div>
          ) : devolucion.estado === "solicitada" ? (
            <p className="text-xs text-slate-500 bg-slate-50 rounded-xl p-3">
              Tu solicitud está siendo revisada. Te notificaremos cuando sea procesada.
            </p>
          ) : (
            <p className="text-xs text-slate-500 bg-red-50 rounded-xl p-3">
              Tu solicitud fue rechazada. Contacta con soporte para más información.
            </p>
          )}
        </div>

        <div className="border-t border-slate-100 px-5 py-4">
          <button
            onClick={onClose}
            className="w-full rounded-xl bg-slate-900 py-2.5 text-sm font-semibold text-white hover:bg-slate-800"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
