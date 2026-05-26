"use client";

import { useMemo, useState } from "react";
import Iconify from "@/components/iconify/iconify";
import { formatearSaldo, formatearTarjeta } from "@/services/pagos.service";
import type { MovimientoSaldo, TipoMovimiento } from "@/types/pagos.types";

interface HistorialRecargasSectionProps {
  movimientos: MovimientoSaldo[];
  loading: boolean;
}

type FiltroMovimiento = "todos" | TipoMovimiento;

const filtros: Array<{ id: FiltroMovimiento; label: string }> = [
  { id: "todos", label: "Todos" },
  { id: "recarga", label: "Recargas" },
  { id: "compra", label: "Compras" },
  { id: "devolucion", label: "Devoluciones" },
  { id: "bono", label: "Bonos" },
];

const iconosPorTipo: Record<
  TipoMovimiento,
  { icon: string; color: string; bg: string; label: string }
> = {
  recarga: {
    icon: "solar:card-bold-duotone",
    color: "text-emerald-600",
    bg: "bg-emerald-100",
    label: "Recarga",
  },
  compra: {
    icon: "solar:bag-3-bold-duotone",
    color: "text-blue-600",
    bg: "bg-blue-100",
    label: "Compra",
  },
  devolucion: {
    icon: "solar:refresh-bold-duotone",
    color: "text-amber-600",
    bg: "bg-amber-100",
    label: "Devolucion",
  },
  bono: {
    icon: "solar:gift-bold-duotone",
    color: "text-purple-600",
    bg: "bg-purple-100",
    label: "Bono",
  },
};

export default function HistorialRecargasSection({
  movimientos,
  loading,
}: HistorialRecargasSectionProps) {
  const [filtro, setFiltro] = useState<FiltroMovimiento>("todos");

  const movimientosFiltrados = useMemo(() => {
    if (filtro === "todos") return movimientos;
    return movimientos.filter(mov => mov.tipoMovimiento === filtro);
  }, [filtro, movimientos]);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-slate-900">Historial de movimientos</h3>
          <p className="text-sm text-slate-600">Tus ultimas recargas y compras</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {filtros.map(item => {
          const activo = item.id === filtro;
          return (
            <button
              key={item.id}
              onClick={() => setFiltro(item.id)}
              className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${
                activo ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
            >
              {item.label}
            </button>
          );
        })}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-8">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
        </div>
      ) : movimientosFiltrados.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-6 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100">
            <Iconify icon="solar:history-bold-duotone" className="text-slate-300" width={28} />
          </div>
          <p className="text-sm font-semibold text-slate-700">No hay movimientos registrados</p>
        </div>
      ) : (
        <div className="space-y-3 h-[320px] overflow-y-auto no-scrollbar pr-1">
          {movimientosFiltrados.map(mov => {
            const config = iconosPorTipo[mov.tipoMovimiento];
            const esPositivo = mov.tipoMovimiento !== "compra";
            const montoTexto = `${esPositivo ? "+" : "-"}${formatearSaldo(mov.monto)}`;
            const metodo = mov.metodoPago?.numeroEnmascarado
              ? formatearTarjeta(mov.metodoPago.numeroEnmascarado)
              : null;

            return (
              <div
                key={mov.id}
                className="rounded-xl border border-slate-100 bg-white p-4 flex items-center gap-4"
              >
                <div
                  className={`h-10 w-10 rounded-full ${config.bg} flex items-center justify-center`}
                >
                  <Iconify icon={config.icon} className={config.color} width={20} />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-slate-900">{config.label}</p>
                  <p className="text-xs text-slate-500">
                    {metodo ? `Metodo: ${metodo}` : "Metodo: saldo"}
                  </p>
                  <p className="text-[11px] text-slate-400">ID #{mov.id}</p>
                </div>
                <div
                  className={`text-sm font-bold ${esPositivo ? "text-emerald-600" : "text-red-600"}`}
                >
                  {montoTexto}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
