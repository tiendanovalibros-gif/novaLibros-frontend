"use client";

import { useState } from "react";
import Link from "next/link";
import type { Tienda } from "@/services/tiendas.service";
import TiendaCrudPanel from "./tienda-crud-panel";
import TiendaInventarioPanel from "./tienda-inventario-panel";

const BackIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
    <polyline points="15 18 9 12 15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

interface Props {
  backHref: string;
  titulo?: string;
}

export default function ManageStores({ backHref, titulo = "Gestión de tiendas" }: Props) {
  const [tiendaSeleccionada, setTiendaSeleccionada] = useState<Tienda | null>(null);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-3">
        <Link
          href={backHref}
          className="flex items-center gap-1.5 text-slate-500 hover:text-slate-800 text-sm font-medium transition-colors"
        >
          <BackIcon />
          Volver
        </Link>
        <span className="text-slate-300">/</span>
        <h1 className="text-slate-900 text-xl font-bold">{titulo}</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-6 items-start">
        <div className="bg-white border border-slate-200 rounded-2xl p-4 flex flex-col min-h-[540px]">
          <TiendaCrudPanel
            tiendaSeleccionada={tiendaSeleccionada}
            onSeleccionar={setTiendaSeleccionada}
          />
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 min-h-[540px] flex flex-col">
          {tiendaSeleccionada ? (
            <TiendaInventarioPanel tienda={tiendaSeleccionada} />
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-400 select-none">
              <div className="text-5xl mb-3">🏪</div>
              <p className="font-semibold text-slate-600">Selecciona una tienda</p>
              <p className="text-sm mt-1">Haz clic en una tienda de la lista para ver y gestionar su inventario.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
