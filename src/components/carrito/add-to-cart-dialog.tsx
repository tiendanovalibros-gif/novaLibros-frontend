"use client";

import { useEffect, useState } from "react";
import Iconify from "@/components/iconify/iconify";

interface AddToCartDialogProps {
  isOpen: boolean;
  libroTitulo: string;
  isLoading: boolean;
  onClose: () => void;
  onConfirm: (cantidad: number) => void;
}

export default function AddToCartDialog({
  isOpen,
  libroTitulo,
  isLoading,
  onClose,
  onConfirm,
}: AddToCartDialogProps) {
  const [cantidad, setCantidad] = useState(1);

  useEffect(() => {
    if (isOpen) {
      setCantidad(1);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[70] bg-slate-900/55 backdrop-blur-[2px] flex items-end sm:items-center justify-center p-0 sm:p-6">
      <div className="w-full sm:max-w-md bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Iconify icon="solar:book-2-bold" className="text-white" width={20} />
            </div>
            <span className="text-slate-900 text-sm font-bold tracking-tight">NovaLibros</span>
          </div>
          <button
            onClick={onClose}
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-300 text-slate-600 leading-none hover:bg-slate-100"
            aria-label="Cerrar"
          >
            <Iconify icon="mdi:close" width={18} />
          </button>
        </div>

        <div className="p-5 space-y-3">
          <h3 className="text-slate-900 text-lg font-bold">Agregar al carrito</h3>
          <p className="text-slate-600 text-sm">
            Libro: <span className="font-semibold text-slate-900">{libroTitulo}</span>
          </p>

          <div>
            <label className="block text-slate-700 text-sm font-semibold mb-1.5">Cantidad</label>
            <input
              type="number"
              min={1}
              value={cantidad}
              onChange={e => setCantidad(Math.max(1, Number(e.target.value) || 1))}
              className="w-full px-3 py-2.5 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 outline-none focus:border-blue-500"
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-slate-300 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              Cancelar
            </button>
            <button
              onClick={() => onConfirm(cantidad)}
              disabled={isLoading}
              className="px-5 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 disabled:opacity-60"
            >
              {isLoading ? "Agregando..." : "Agregar al carrito"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
