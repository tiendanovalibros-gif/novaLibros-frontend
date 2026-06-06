"use client";

import { useState } from "react";
import Iconify from "@/components/iconify/iconify";

interface Props {
  isOpen: boolean;
  numeroOrden: string;
  montoTotal: number | string;
  isLoading: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmFacturaDialog({
  isOpen,
  numeroOrden,
  montoTotal,
  isLoading,
  onConfirm,
  onCancel,
}: Props) {
  if (!isOpen) return null;

  const monto = typeof montoTotal === "string" ? parseFloat(montoTotal) : montoTotal;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
            <Iconify icon="solar:document-bold" className="text-blue-600" width={22} />
          </div>
          <h2 className="text-base font-semibold text-slate-900">Generar factura electrónica</h2>
        </div>

        <p className="mb-1 text-sm text-slate-600">Se generará una factura para el pedido:</p>
        <p className="mb-1 text-sm font-semibold text-slate-900">{numeroOrden}</p>
        <p className="mb-5 text-sm text-slate-600">
          Por un total de{" "}
          <span className="font-semibold text-slate-900">${monto.toLocaleString("es-CO")}</span>
        </p>

        <div className="flex gap-3">
          <button
            onClick={onCancel}
            disabled={isLoading}
            className="flex-1 rounded-xl border border-slate-200 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className="flex-1 rounded-xl bg-blue-600 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
            ) : (
              <Iconify icon="solar:download-bold" width={16} />
            )}
            Generar
          </button>
        </div>
      </div>
    </div>
  );
}
