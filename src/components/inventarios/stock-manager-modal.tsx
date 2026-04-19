"use client";

import Iconify from "@/components/iconify/iconify";

interface TiendaOption {
  id: number;
  nombre: string;
}

interface InventarioOption {
  id: number;
  idTienda: number;
  cantidadDisponible: number;
}

interface StockManagerModalProps {
  isOpen: boolean;
  title: string;
  libroTitulo: string;
  tiendas: TiendaOption[];
  inventarios: InventarioOption[];
  idTienda: number;
  cantidad: number;
  tipoMovimiento: "sumar" | "restar";
  loading: boolean;
  error: string;
  message: string;
  onClose: () => void;
  onChangeTienda: (idTienda: number) => void;
  onChangeCantidad: (cantidad: number) => void;
  onChangeTipoMovimiento: (tipo: "sumar" | "restar") => void;
  onSubmit: () => void;
}

export default function StockManagerModal({
  isOpen,
  title,
  libroTitulo,
  tiendas,
  inventarios,
  idTienda,
  cantidad,
  tipoMovimiento,
  loading,
  error,
  message,
  onClose,
  onChangeTienda,
  onChangeCantidad,
  onChangeTipoMovimiento,
  onSubmit,
}: StockManagerModalProps) {
  if (!isOpen) return null;

  const existenciasActuales =
    inventarios.find(inventario => inventario.idTienda === idTienda)?.cantidadDisponible ?? 0;

  return (
    <div className="fixed inset-0 z-[70] bg-slate-900/55 backdrop-blur-[2px] flex items-end sm:items-center justify-center p-0 sm:p-6">
      <div className="w-full sm:max-w-lg bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl border border-slate-200 max-h-[88vh] overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
          <h3 className="text-slate-900 text-lg font-bold">{title}</h3>
          <button
            onClick={onClose}
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-300 text-slate-600 leading-none hover:bg-slate-100"
            aria-label="Cerrar"
          >
            <Iconify icon="mdi:close" width={18} />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <p className="text-slate-600 text-sm">
            Libro: <span className="font-semibold text-slate-800">{libroTitulo}</span>
          </p>

          <div>
            <label className="block text-slate-700 text-sm font-semibold mb-1.5">Tienda</label>
            <select
              value={idTienda}
              onChange={e => onChangeTienda(Number(e.target.value))}
              className="w-full px-3 py-2.5 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 outline-none focus:border-blue-500"
            >
              <option value={0}>Seleccionar tienda...</option>
              {tiendas.map(tienda => (
                <option key={tienda.id} value={tienda.id}>
                  {tienda.nombre}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-slate-700 text-sm font-semibold mb-1.5">Accion</label>
            <select
              value={tipoMovimiento}
              onChange={e => onChangeTipoMovimiento(e.target.value as "sumar" | "restar")}
              className="w-full px-3 py-2.5 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 outline-none focus:border-blue-500"
            >
              <option value="sumar">Sumar existencias</option>
              <option value="restar">Disminuir existencias</option>
            </select>
          </div>

          <div>
            <label className="block text-slate-700 text-sm font-semibold mb-1.5">
              {tipoMovimiento === "sumar" ? "Cantidad a agregar" : "Cantidad a disminuir"}
            </label>
            <input
              type="number"
              min={1}
              value={cantidad}
              onChange={e => onChangeCantidad(Number(e.target.value) || 1)}
              className="w-full px-3 py-2.5 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 outline-none focus:border-blue-500"
            />
          </div>

          {idTienda > 0 && (
            <p className="text-xs text-slate-500">
              Existencias actuales en tienda: {existenciasActuales}
            </p>
          )}

          {error && (
            <div className="bg-red-50 border border-red-300 rounded-lg px-3 py-2 text-red-700 text-sm">
              {error}
            </div>
          )}

          {message && (
            <div className="bg-emerald-50 border border-emerald-300 rounded-lg px-3 py-2 text-emerald-700 text-sm">
              {message}
            </div>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-slate-300 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              Cerrar
            </button>
            <button
              onClick={onSubmit}
              disabled={loading}
              className="px-5 py-2 bg-amber-600 text-white rounded-lg text-sm font-semibold hover:bg-amber-700 disabled:opacity-60"
            >
              {loading
                ? "Guardando..."
                : tipoMovimiento === "sumar"
                  ? "Sumar existencias"
                  : "Disminuir existencias"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
