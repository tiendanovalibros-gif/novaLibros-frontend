"use client";

import dynamic from "next/dynamic";
import type { AdminTiendasMapProps } from "./admin-tiendas-map";

const AdminTiendasMap = dynamic(() => import("./admin-tiendas-map"), {
  ssr: false,
  loading: () => (
    <div className="h-[min(420px,50vh)] w-full rounded-xl border border-slate-200 bg-slate-100 animate-pulse flex items-center justify-center text-sm text-slate-500">
      Cargando mapa de tiendas...
    </div>
  ),
});

export default function AdminTiendasMapDynamic(props: AdminTiendasMapProps) {
  return <AdminTiendasMap {...props} />;
}
