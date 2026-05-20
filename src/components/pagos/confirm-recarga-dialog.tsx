"use client";

import Iconify from "@/components/iconify/iconify";
import { formatearSaldo, formatearTarjeta } from "@/services/pagos.service";
import type { MetodoPago } from "@/types/pagos.types";

interface ConfirmRecargaDialogProps {
  isOpen: boolean;
  monto: number;
  metodoPago: MetodoPago | null;
  isLoading: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmRecargaDialog({
  isOpen,
  monto,
  metodoPago,
  isLoading,
  onConfirm,
  onCancel,
}: ConfirmRecargaDialogProps) {
  if (!isOpen) return null;

  const tipoLabel = metodoPago?.tipo === "credito" ? "Credito" : "Debito";
  const badgeClass =
    metodoPago?.tipo === "credito"
      ? "bg-blue-100 text-blue-700"
      : "bg-emerald-100 text-emerald-700";

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
            onClick={onCancel}
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-300 text-slate-600 leading-none hover:bg-slate-100"
            aria-label="Cerrar"
          >
            <Iconify icon="solar:close-circle-linear" width={18} />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <div>
            <h3 className="text-slate-900 text-lg font-bold">Confirmar recarga</h3>
            <p className="text-slate-600 text-sm">Revisa los datos antes de confirmar el cargo.</p>
          </div>

          <div className="rounded-xl border border-blue-100 bg-blue-50 px-4 py-4 text-center">
            <p className="text-xs uppercase tracking-wide text-blue-600">Monto a recargar</p>
            <p className="text-2xl font-bold text-blue-700">{formatearSaldo(monto)}</p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white px-4 py-3">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-slate-100 flex items-center justify-center">
                <Iconify icon="solar:card-bold-duotone" className="text-slate-700" width={22} />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-slate-900">
                  {metodoPago ? formatearTarjeta(metodoPago.numeroEnmascarado) : "Tarjeta"}
                </p>
                <p className="text-xs text-slate-500">{metodoPago?.titular || ""}</p>
              </div>
              {metodoPago && (
                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${badgeClass}`}>
                  {tipoLabel}
                </span>
              )}
            </div>
          </div>

          <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-700">
            Al confirmar, se procesara el cargo a tu tarjeta.
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              onClick={onCancel}
              disabled={isLoading}
              className="px-4 py-2 border border-slate-300 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-60"
            >
              Cancelar
            </button>
            <button
              onClick={onConfirm}
              disabled={isLoading}
              className="px-5 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 disabled:opacity-60 flex items-center gap-2"
            >
              {isLoading && (
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              )}
              Confirmar recarga
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
