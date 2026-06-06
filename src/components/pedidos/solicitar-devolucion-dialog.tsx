"use client";

import { useState } from "react";
import Iconify from "@/components/iconify/iconify";
import { solicitarDevolucion } from "@/services/devoluciones.service";

const RAZONES = [
  "Producto dañado",
  "Producto incorrecto",
  "No coincide con la descripción",
  "Llegó incompleto",
  "Otro motivo",
];

interface Props {
  isOpen: boolean;
  pedidoId: string;
  numeroOrden: string;
  onClose: () => void;
  onSuccess: () => void;
}

export default function SolicitarDevolucionDialog({
  isOpen,
  pedidoId,
  numeroOrden,
  onClose,
  onSuccess,
}: Props) {
  const [razon, setRazon] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async () => {
    if (!razon) {
      setError("Selecciona una razón");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await solicitarDevolucion(pedidoId, razon, descripcion || undefined);
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err?.message ?? "No se pudo enviar la solicitud");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 px-0 sm:px-4">
      <div className="w-full sm:max-w-md rounded-t-2xl sm:rounded-2xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <h2 className="text-base font-bold text-slate-900">Solicitar devolución</h2>
          <button onClick={onClose} className="rounded-full p-1.5 hover:bg-slate-100">
            <Iconify icon="solar:close-circle-linear" width={22} className="text-slate-500" />
          </button>
        </div>

        <div className="px-5 py-4 space-y-4">
          <p className="text-sm text-slate-600">
            Pedido: <span className="font-semibold text-slate-900">{numeroOrden}</span>
          </p>

          <div className="space-y-2">
            <label className="text-xs font-medium text-slate-700">Razón *</label>
            <div className="space-y-2">
              {RAZONES.map(r => (
                <button
                  key={r}
                  onClick={() => setRazon(r)}
                  className={`w-full rounded-xl border px-4 py-2.5 text-left text-sm transition-colors
                    ${
                      razon === r
                        ? "border-blue-500 bg-blue-50 text-blue-700 font-medium"
                        : "border-slate-200 text-slate-700 hover:bg-slate-50"
                    }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-700">
              Descripción adicional (opcional)
            </label>
            <textarea
              value={descripcion}
              onChange={e => setDescripcion(e.target.value)}
              rows={3}
              placeholder="Describe el problema con más detalle..."
              className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none resize-none"
            />
          </div>

          {error && <p className="text-xs text-red-600">{error}</p>}
        </div>

        <div className="border-t border-slate-100 px-5 py-4 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 rounded-xl border border-slate-200 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Cancelar
          </button>
          <button
            onClick={() => void handleSubmit()}
            disabled={loading || !razon}
            className="flex-1 rounded-xl bg-orange-500 py-2.5 text-sm font-semibold text-white hover:bg-orange-600 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading && (
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
            )}
            Enviar solicitud
          </button>
        </div>
      </div>
    </div>
  );
}
