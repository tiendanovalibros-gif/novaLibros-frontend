"use client";

import Iconify from "@/components/iconify/iconify";
import { formatearSaldo } from "@/services/pagos.service";

interface SaldoInsuficienteDialogProps {
  isOpen: boolean;
  saldoActual: number | string;
  montoRequerido: number | string;
  onClose: () => void;
  onRecargar: () => void;
}

export default function SaldoInsuficienteDialog({
  isOpen,
  saldoActual,
  montoRequerido,
  onClose,
  onRecargar,
}: SaldoInsuficienteDialogProps) {
  if (!isOpen) return null;

  const saldoNum = typeof saldoActual === "string" ? parseFloat(saldoActual) : saldoActual;
  const requeridoNum =
    typeof montoRequerido === "string" ? parseFloat(montoRequerido) : montoRequerido;
  const diferencia = Math.max(requeridoNum - saldoNum, 0);

  return (
    <div className="fixed inset-0 z-[70] bg-slate-900/55 backdrop-blur-[2px] flex items-end sm:items-center justify-center p-0 sm:p-6">
      <div
        className="w-full sm:max-w-md bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl border border-slate-200 overflow-hidden"
        onClick={event => event.stopPropagation()}
      >
        <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 bg-blue-50 rounded-lg flex items-center justify-center">
              <Iconify icon="solar:wallet-bold" className="text-blue-600" width={20} />
            </div>
            <span className="text-slate-900 text-sm font-bold tracking-tight">NovaLibros</span>
          </div>
          <button
            onClick={onClose}
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-300 text-slate-600 leading-none hover:bg-slate-100"
            aria-label="Cerrar"
          >
            <Iconify icon="solar:close-circle-linear" width={18} />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-full bg-amber-100 flex items-center justify-center">
              <Iconify
                icon="solar:danger-triangle-bold-duotone"
                className="text-amber-500"
                width={28}
              />
            </div>
            <div>
              <h3 className="text-slate-900 text-lg font-bold">Saldo insuficiente</h3>
              <p className="text-sm text-slate-600">Tu saldo actual no cubre el monto requerido.</p>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-500">Saldo disponible:</span>
              <span className="font-semibold text-red-600">{formatearSaldo(saldoActual)}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-500">Monto requerido:</span>
              <span className="font-semibold text-slate-900">{formatearSaldo(montoRequerido)}</span>
            </div>
            <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-700">
              Te faltan {formatearSaldo(diferencia)} para completar la compra.
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-slate-300 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              Cerrar
            </button>
            <button
              onClick={onRecargar}
              className="px-5 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 flex items-center gap-2"
            >
              <Iconify icon="solar:card-bold" width={18} />
              Recargar saldo
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
