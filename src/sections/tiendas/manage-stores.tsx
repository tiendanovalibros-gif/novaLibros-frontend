"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import Link from "next/link";
import Iconify from "@/components/iconify/iconify";
import type { Tienda } from "@/services/tiendas.service";
import TiendaCrudPanel from "./tienda-crud-panel";
import TiendaInventarioPanel from "./tienda-inventario-panel";

const TiendasMapaAdminPanel = dynamic(
  () => import("@/components/tiendas/tiendas-mapa-admin-panel"),
  {
    ssr: false,
    loading: () => (
      <div className="h-[280px] lg:h-full min-h-[280px] rounded-lg border border-slate-200 bg-slate-100 animate-pulse flex items-center justify-center text-xs text-slate-500">
        Cargando mapa...
      </div>
    ),
  }
);

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
  const [tiendas, setTiendas] = useState<Tienda[]>([]);
  const [tiendaEditarSolicitada, setTiendaEditarSolicitada] = useState<Tienda | null>(null);
  const [mapaVisible, setMapaVisible] = useState(true);

  const seleccionarTienda = (tienda: Tienda | null) => setTiendaSeleccionada(tienda);

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center gap-3">
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

      <div className="bg-white border border-slate-200 rounded-2xl p-4">
        <div className="flex justify-end mb-3">
          <button
            type="button"
            onClick={() => setMapaVisible(v => !v)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
            aria-expanded={mapaVisible}
          >
            <Iconify
              icon={mapaVisible ? "solar:eye-closed-bold" : "solar:map-bold"}
              width={16}
            />
            {mapaVisible ? "Ocultar mapa" : "Mostrar mapa"}
          </button>
        </div>

        <div
          className={`grid grid-cols-1 gap-4 items-stretch ${
            mapaVisible ? "lg:grid-cols-[minmax(0,1fr)_minmax(300px,340px)]" : ""
          }`}
        >
          <div
            className={`flex flex-col min-w-0 ${
              mapaVisible ? "min-h-[360px] lg:min-h-[460px]" : "min-h-[360px]"
            }`}
          >
            <TiendaCrudPanel
              tiendaSeleccionada={tiendaSeleccionada}
              onSeleccionar={seleccionarTienda}
              onTiendasChange={setTiendas}
              tiendaEditarSolicitada={tiendaEditarSolicitada}
              onTiendaEditarConsumida={() => setTiendaEditarSolicitada(null)}
            />
          </div>

          {mapaVisible && (
            <div className="flex flex-col min-h-[320px] lg:min-h-[460px] border-t lg:border-t-0 lg:border-l border-slate-200 pt-4 lg:pt-0 lg:pl-4">
              <TiendasMapaAdminPanel
                compact
                tiendas={tiendas}
                tiendaSeleccionadaId={tiendaSeleccionada?.id ?? null}
                onSeleccionarTienda={seleccionarTienda}
                onEditarTienda={setTiendaEditarSolicitada}
                onTiendasActualizadas={setTiendas}
              />
            </div>
          )}
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl p-4 min-h-[480px] flex flex-col">
        {tiendaSeleccionada ? (
          <TiendaInventarioPanel tienda={tiendaSeleccionada} />
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-400 select-none px-4">
            <div className="text-5xl mb-3">📦</div>
            <p className="font-semibold text-slate-600">Inventario de la tienda</p>
            <p className="text-sm mt-1 text-center max-w-xs">
              Selecciona una tienda en la lista o en el mapa para gestionar su stock.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
