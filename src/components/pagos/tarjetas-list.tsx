"use client";

import { useState } from "react";
import Iconify from "@/components/iconify/iconify";
import { formatearTarjeta } from "@/services/pagos.service";
import type { MetodoPago } from "@/types/pagos.types";

interface TarjetasListProps {
  tarjetas: MetodoPago[];
  loading: boolean;
  onEliminar: (id: number) => Promise<void>;
  onAgregar: () => void;
}

export default function TarjetasList({
  tarjetas,
  loading,
  onEliminar,
  onAgregar,
}: TarjetasListProps) {
  const [eliminandoId, setEliminandoId] = useState<number | null>(null);
  const [error, setError] = useState("");

  const handleEliminar = async (id: number) => {
    setError("");
    setEliminandoId(id);
    try {
      await onEliminar(id);
    } catch (err: unknown) {
      const message =
        typeof err === "object" && err && "message" in err
          ? String((err as { message?: string }).message)
          : "No se pudo eliminar la tarjeta";
      setError(message);
    } finally {
      setEliminandoId(null);
    }
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-slate-900">Tus tarjetas</h3>
          <p className="text-sm text-slate-600">Gestiona tus metodos de pago</p>
        </div>
        <button
          onClick={onAgregar}
          className="hidden sm:inline-flex items-center gap-2 px-3 py-2 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50"
        >
          <Iconify icon="solar:add-circle-bold" width={16} />
          Agregar
        </button>
      </div>

      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-8">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
        </div>
      ) : tarjetas.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-6 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100">
            <Iconify icon="solar:card-2-bold-duotone" className="text-slate-300" width={28} />
          </div>
          <p className="text-sm font-semibold text-slate-700">No tienes tarjetas registradas</p>
          <p className="mt-1 text-xs text-slate-500">Agrega una tarjeta para recargar tu saldo.</p>
          <button
            onClick={onAgregar}
            className="mt-4 inline-flex items-center gap-2 px-4 py-2 border border-slate-300 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            <Iconify icon="solar:add-circle-bold" width={18} />
            Agregar tarjeta
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {tarjetas.map(tarjeta => {
            const esCredito = tarjeta.tipo === "credito";
            const icono = esCredito ? "solar:card-bold-duotone" : "solar:card-2-bold-duotone";
            const colorIcono = esCredito ? "text-blue-600" : "text-emerald-600";
            const badgeClass = esCredito
              ? "bg-blue-100 text-blue-700"
              : "bg-emerald-100 text-emerald-700";
            const tipoLabel = esCredito ? "Credito" : "Debito";

            return (
              <div
                key={tarjeta.id}
                className="rounded-xl border border-slate-200 bg-white p-4 flex items-center gap-4"
              >
                <div className="h-10 w-10 rounded-lg bg-slate-100 flex items-center justify-center">
                  <Iconify icon={icono} className={colorIcono} width={22} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-slate-900">
                      {formatearTarjeta(tarjeta.numeroEnmascarado)}
                    </p>
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs font-semibold ${badgeClass}`}
                    >
                      {tipoLabel}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500">{tarjeta.titular}</p>
                </div>
                <button
                  onClick={() => void handleEliminar(tarjeta.id)}
                  disabled={eliminandoId === tarjeta.id}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-red-200 text-red-600 hover:bg-red-50 disabled:opacity-60"
                  aria-label="Eliminar tarjeta"
                >
                  {eliminandoId === tarjeta.id ? (
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-red-500 border-t-transparent" />
                  ) : (
                    <Iconify icon="solar:trash-bin-trash-bold-duotone" width={18} />
                  )}
                </button>
              </div>
            );
          })}

          <button
            onClick={onAgregar}
            className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 border border-slate-300 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            <Iconify icon="solar:add-circle-bold" width={18} />
            Agregar tarjeta
          </button>
        </div>
      )}
    </div>
  );
}
