"use client";

import { useMemo, useState } from "react";
import Iconify from "@/components/iconify/iconify";
import { formatearSaldo, formatearTarjeta } from "@/services/pagos.service";
import type { MetodoPago, RecargarSaldoPayload, SaldoUsuario } from "@/types/pagos.types";
import { MONTOS_RECARGA } from "@/types/pagos.types";

interface RecargaSaldoSectionProps {
  metodosPago: MetodoPago[];
  loadingMetodos: boolean;
  onRecargar: (payload: RecargarSaldoPayload) => Promise<SaldoUsuario>;
  onSuccess: (nuevoSaldo: SaldoUsuario, monto: number) => void;
  onAgregarTarjeta: () => void;
}

export default function RecargaSaldoSection({
  metodosPago,
  loadingMetodos,
  onRecargar,
  onSuccess,
  onAgregarTarjeta,
}: RecargaSaldoSectionProps) {
  const [montoSeleccionado, setMontoSeleccionado] = useState<number | null>(null);
  const [montoPersonalizado, setMontoPersonalizado] = useState("");
  const [metodoPagoSeleccionado, setMetodoPagoSeleccionado] = useState<number | null>(null);
  const [errorMonto, setErrorMonto] = useState("");
  const [errorMetodo, setErrorMetodo] = useState("");
  const [errorGeneral, setErrorGeneral] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const montoFinal = useMemo(() => {
    if (montoPersonalizado.trim()) {
      return Number(montoPersonalizado);
    }
    return montoSeleccionado ?? 0;
  }, [montoPersonalizado, montoSeleccionado]);

  const handleSelectMonto = (monto: number) => {
    setMontoSeleccionado(monto);
    setMontoPersonalizado("");
    setErrorMonto("");
  };

  const handleMontoPersonalizado = (value: string) => {
    setMontoPersonalizado(value);
    setMontoSeleccionado(null);
    setErrorMonto("");
  };

  const handleContinuar = async () => {
    setErrorGeneral("");

    if (!montoFinal || montoFinal <= 0 || Number.isNaN(montoFinal)) {
      setErrorMonto("Selecciona un monto valido");
      return;
    }

    if (!metodoPagoSeleccionado) {
      setErrorMetodo("Selecciona un metodo de pago");
      return;
    }

    setIsLoading(true);
    try {
      const nuevoSaldo = await onRecargar({
        monto: montoFinal,
        idMetodoPago: metodoPagoSeleccionado,
      });
      onSuccess(nuevoSaldo, montoFinal);
      setMontoSeleccionado(null);
      setMontoPersonalizado("");
    } catch (err: unknown) {
      const message =
        typeof err === "object" && err && "message" in err
          ? String((err as { message?: string }).message)
          : "No se pudo completar la recarga";
      if (
        message !== "RECARGA_CANCELADA" &&
        !message.toLowerCase().includes("saldo insuficiente")
      ) {
        setErrorGeneral(message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-6">
      <div>
        <h3 className="text-lg font-bold text-slate-900">Recargar saldo</h3>
        <p className="text-sm text-slate-600">Selecciona el monto y el metodo de pago.</p>
      </div>

      {errorGeneral && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {errorGeneral}
        </div>
      )}

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-semibold text-slate-900">Selecciona el monto</h4>
          <span className="text-xs text-slate-500">COP</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {MONTOS_RECARGA.map(monto => {
            const isSelected = montoSeleccionado === monto && !montoPersonalizado;
            return (
              <button
                key={monto}
                type="button"
                onClick={() => handleSelectMonto(monto)}
                className={`rounded-xl border-2 py-3 px-4 text-center font-bold text-sm transition-colors ${
                  isSelected
                    ? "border-blue-600 bg-blue-50 text-blue-700"
                    : "border-slate-200 bg-white text-slate-900 hover:border-slate-300"
                }`}
              >
                {formatearSaldo(monto)}
              </button>
            );
          })}
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-900 mb-2">Otro monto</label>
          <div className="flex items-center gap-2">
            <span className="px-3 py-2.5 rounded-lg border border-slate-300 text-sm text-slate-600">
              $ COP
            </span>
            <input
              type="number"
              min={0}
              value={montoPersonalizado}
              onChange={event => handleMontoPersonalizado(event.target.value)}
              placeholder="Ingresa un monto"
              className="flex-1 px-3 py-2.5 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 outline-none focus:border-blue-500"
            />
          </div>
          {errorMonto && <p className="mt-2 text-xs text-red-600">{errorMonto}</p>}
        </div>
      </div>

      <div className="space-y-3">
        <h4 className="text-sm font-semibold text-slate-900">Metodo de pago</h4>

        {loadingMetodos ? (
          <div className="flex items-center justify-center py-6">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
          </div>
        ) : metodosPago.length === 0 ? (
          <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50 p-4 text-center">
            <p className="text-sm text-slate-600">No tienes tarjetas registradas.</p>
            <button
              onClick={onAgregarTarjeta}
              className="mt-3 inline-flex items-center gap-2 px-4 py-2 border border-slate-300 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              <Iconify icon="solar:add-circle-bold" width={18} />
              Agregar tarjeta
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            {metodosPago.map(metodo => {
              const selected = metodoPagoSeleccionado === metodo.id;
              return (
                <button
                  key={metodo.id}
                  type="button"
                  onClick={() => {
                    setMetodoPagoSeleccionado(metodo.id);
                    setErrorMetodo("");
                  }}
                  className={`w-full flex items-center gap-3 rounded-xl border px-4 py-3 text-left transition-colors ${
                    selected
                      ? "border-blue-600 bg-blue-50"
                      : "border-slate-200 bg-white hover:border-slate-300"
                  }`}
                >
                  <div className="h-9 w-9 rounded-lg bg-slate-100 flex items-center justify-center">
                    <Iconify icon="solar:card-bold-duotone" className="text-slate-700" width={20} />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-slate-900">
                      {formatearTarjeta(metodo.numeroEnmascarado)}
                    </p>
                    <p className="text-xs text-slate-500">{metodo.titular}</p>
                  </div>
                  <div
                    className={`h-4 w-4 rounded-full border-2 ${
                      selected ? "border-blue-600 bg-blue-600" : "border-slate-300"
                    }`}
                  />
                </button>
              );
            })}
          </div>
        )}

        {errorMetodo && <p className="text-xs text-red-600">{errorMetodo}</p>}
      </div>

      <div className="flex items-center justify-end">
        <button
          onClick={() => void handleContinuar()}
          disabled={isLoading || loadingMetodos}
          className="px-5 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 disabled:opacity-60 flex items-center gap-2"
        >
          {isLoading && (
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
          )}
          Continuar
        </button>
      </div>
    </div>
  );
}
