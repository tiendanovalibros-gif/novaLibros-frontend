"use client";

import Iconify from "@/components/iconify/iconify";
import { formatearSaldo } from "@/services/pagos.service";

interface RecargaExitosaDialogProps {
  isOpen: boolean;
  monto: number;
  nuevoSaldo: number | string;
  onClose: () => void;
}

export default function RecargaExitosaDialog({
  isOpen,
  monto,
  nuevoSaldo,
  onClose,
}: RecargaExitosaDialogProps) {
  if (!isOpen) return null;

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

        <div className="p-6 text-center space-y-4">
          <div className="mx-auto h-14 w-14 rounded-full bg-green-100 flex items-center justify-center">
            <Iconify icon="solar:check-circle-bold-duotone" className="text-green-600" width={32} />
          </div>
          <div>
            <h3 className="text-green-600 text-lg font-bold">Recarga exitosa!</h3>
            <p className="text-slate-600 text-sm">
              Se han anadido {formatearSaldo(monto)} a tu saldo.
            </p>
          </div>

          <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700">
            Saldo actual: {formatearSaldo(nuevoSaldo)}
          </div>

          <button
            onClick={onClose}
            className="w-full px-5 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700"
          >
            Aceptar
          </button>
        </div>
      </div>
    </div>
  );
}
