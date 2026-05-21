"use client";

import Iconify from "@/components/iconify/iconify";

export interface ReservaCancelarPreview {
  id: string;
  titulo: string;
  isbn: string;
  cantidad: number;
  horaExpiracion: string;
}

interface ConfirmCancelarReservaDialogProps {
  isOpen: boolean;
  reserva: ReservaCancelarPreview | null;
  isLoading: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

function formatExpiracion(iso: string) {
  try {
    return new Date(iso).toLocaleString("es-CO", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  } catch {
    return iso;
  }
}

export default function ConfirmCancelarReservaDialog({
  isOpen,
  reserva,
  isLoading,
  onConfirm,
  onClose,
}: ConfirmCancelarReservaDialogProps) {
  if (!isOpen || !reserva) return null;

  return (
    <div
      className="fixed inset-0 z-[70] bg-slate-900/55 backdrop-blur-[2px] flex items-end sm:items-center justify-center p-0 sm:p-6"
      onClick={onClose}
      role="presentation"
    >
      <div
        className="w-full sm:max-w-md bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl border border-slate-200 overflow-hidden"
        onClick={e => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-cancelar-reserva-title"
      >
        <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 bg-amber-50 rounded-lg flex items-center justify-center">
              <Iconify icon="solar:bookmark-bold" className="text-amber-600" width={20} />
            </div>
            <span className="text-slate-900 text-sm font-bold tracking-tight">NovaLibros</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-300 text-slate-600 leading-none hover:bg-slate-100 disabled:opacity-50"
            aria-label="Cerrar"
          >
            <Iconify icon="solar:close-circle-linear" width={18} />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <div>
            <h3 id="confirm-cancelar-reserva-title" className="text-slate-900 text-lg font-bold">
              ¿Cancelar esta reserva?
            </h3>
            <p className="text-slate-600 text-sm mt-1">
              El libro dejará de estar apartado para ti y otras personas podrán reservarlo o comprarlo.
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 space-y-2 text-sm">
            <p className="font-semibold text-slate-900 leading-snug">{reserva.titulo}</p>
            <p className="text-slate-500 text-xs">ISBN: {reserva.isbn}</p>
            <p className="text-slate-600 text-xs">
              Cantidad reservada: <span className="font-semibold">{reserva.cantidad}</span>
            </p>
            <p className="text-slate-600 text-xs">
              Expira: <span className="font-medium">{formatExpiracion(reserva.horaExpiracion)}</span>
            </p>
          </div>

          <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-800">
            Esta acción no se puede deshacer. Si aún quieres el libro, tendrás que reservarlo de nuevo.
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="px-4 py-2 border border-slate-300 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-60"
            >
              Volver
            </button>
            <button
              type="button"
              onClick={onConfirm}
              disabled={isLoading}
              className="px-5 py-2 bg-red-600 text-white rounded-lg text-sm font-semibold hover:bg-red-700 disabled:opacity-60 flex items-center gap-2"
            >
              {isLoading && (
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              )}
              {isLoading ? "Cancelando..." : "Sí, cancelar reserva"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
