"use client";

import dynamic from "next/dynamic";
import type { TiendaRecogidaOpcion } from "@/services/carrito.service";

export interface TiendasRecogidaMapDynamicProps {
  tiendas: TiendaRecogidaOpcion[];
  tiendaSeleccionada: number | null;
  userCoords?: { lat: number; lng: number } | null;
  onSelectTienda: (id: number) => void;
  className?: string;
}

const TiendasRecogidaMap = dynamic(() => import("./tiendas-recogida-map"), {
  ssr: false,
  loading: () => (
    <div className="h-[240px] w-full rounded-xl border border-slate-200 bg-slate-100 animate-pulse flex items-center justify-center text-sm text-slate-500">
      Cargando mapa...
    </div>
  ),
});

export default function TiendasRecogidaMapDynamic(props: TiendasRecogidaMapDynamicProps) {
  return <TiendasRecogidaMap {...props} />;
}
