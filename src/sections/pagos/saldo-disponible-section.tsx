"use client";

import Iconify from "@/components/iconify/iconify";
import { formatearSaldo } from "@/services/pagos.service";
import type { SaldoUsuario } from "@/types/pagos.types";

interface SaldoDisponibleSectionProps {
  saldo: SaldoUsuario | null;
  loading: boolean;
  onRecargar: () => void;
}

export default function SaldoDisponibleSection({
  saldo,
  loading,
  onRecargar,
}: SaldoDisponibleSectionProps) {
  if (loading) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm animate-pulse">
        <div className="h-4 w-32 rounded-full bg-slate-200" />
        <div className="mt-4 h-10 w-48 rounded-full bg-slate-200" />
        <div className="mt-6 h-10 w-36 rounded-full bg-slate-200" />
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="rounded-2xl bg-gradient-to-br from-blue-600 to-blue-800 p-6 text-white shadow-sm">
        <p className="text-sm text-blue-100">Saldo disponible</p>
        <div className="mt-2 flex items-end justify-between gap-4">
          <p className="text-4xl font-bold">{formatearSaldo(saldo?.saldoDisponible ?? 0)}</p>
          <button
            onClick={onRecargar}
            className="inline-flex items-center gap-2 rounded-lg border border-white/50 px-4 py-2 text-sm font-semibold text-white hover:bg-white/10"
          >
            <Iconify icon="solar:card-bold" width={18} />
            Recargar saldo
          </button>
        </div>
      </div>

      <div className="flex items-center gap-2 text-xs text-slate-500">
        <Iconify icon="solar:info-circle-linear" width={16} />
        El saldo se aplica automaticamente en tus compras.
      </div>
    </div>
  );
}
