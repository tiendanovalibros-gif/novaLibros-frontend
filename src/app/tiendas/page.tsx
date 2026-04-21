"use client";

import { useEffect, useMemo, useState } from "react";
import MainNavbar from "@/components/navigation/main-navbar";
import { listarTiendas, type Tienda } from "@/services/tiendas.service";

const SearchIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
    <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2" />
    <line
      x1="21"
      y1="21"
      x2="16.65"
      y2="16.65"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
  </svg>
);

const PinIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
    <path
      d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 1 1 18 0z"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <circle cx="12" cy="10" r="3" stroke="currentColor" strokeWidth="2" />
  </svg>
);

const MapIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
    <path
      d="M9 6L3 4v14l6 2m0-14l6 2m-6-2v14m6-12l6-2v14l-6 2m0-14v14"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const parseApiError = (error: unknown, fallback: string): string => {
  if (typeof error === "string") return error;

  if (error && typeof error === "object" && "message" in error) {
    const message = (error as { message?: unknown }).message;
    if (typeof message === "string") return message;
    if (Array.isArray(message)) {
      return message.filter(v => typeof v === "string").join(" · ") || fallback;
    }
  }

  return fallback;
};

export default function TiendasPublicPage() {
  const [tiendas, setTiendas] = useState<Tienda[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busqueda, setBusqueda] = useState("");

  useEffect(() => {
    const cargarTiendas = async () => {
      setLoading(true);
      setError("");

      try {
        const data = await listarTiendas();
        setTiendas(data);
      } catch (err) {
        setError(parseApiError(err, "No fue posible cargar las tiendas"));
      } finally {
        setLoading(false);
      }
    };

    void cargarTiendas();
  }, []);

  const tiendasFiltradas = useMemo(() => {
    const q = busqueda.trim().toLowerCase();
    if (!q) return tiendas;

    return tiendas.filter(tienda => {
      return (
        tienda.nombre.toLowerCase().includes(q) ||
        tienda.direccion.toLowerCase().includes(q) ||
        (tienda.direccionNormalizada ?? "").toLowerCase().includes(q) ||
        (tienda.ciudad ?? "").toLowerCase().includes(q)
      );
    });
  }, [tiendas, busqueda]);

  const getMapsUrl = (tienda: Tienda): string => {
    if (Number.isFinite(tienda.latitud) && Number.isFinite(tienda.longitud)) {
      return `https://www.google.com/maps?q=${tienda.latitud},${tienda.longitud}`;
    }

    const query = encodeURIComponent(
      `${tienda.nombre}, ${tienda.direccion}, ${tienda.ciudad ?? "Colombia"}`
    );
    return `https://www.google.com/maps/search/?api=1&query=${query}`;
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <div className="mb-6">
          <h1 className="text-slate-900 text-2xl font-bold">Nuestras tiendas</h1>
          <p className="text-slate-500 text-sm mt-1">
            Consulta ubicaciones y direcciones disponibles para recoger tus libros.
          </p>
        </div>

        <div className="relative mb-5">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
            <SearchIcon />
          </div>
          <input
            type="text"
            value={busqueda}
            onChange={e => setBusqueda(e.target.value)}
            placeholder="Buscar por nombre, ciudad o dirección..."
            className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
          />
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
          {loading ? (
            <div className="py-20 text-center text-slate-500 text-sm">Cargando tiendas...</div>
          ) : error ? (
            <div className="py-16 text-center">
              <p className="text-red-600 font-semibold">{error}</p>
            </div>
          ) : tiendasFiltradas.length === 0 ? (
            <div className="py-16 text-center text-slate-500">
              <p className="font-semibold text-slate-700">No hay tiendas para mostrar</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
              {tiendasFiltradas.map(tienda => (
                <div key={tienda.id} className="border border-slate-200 rounded-xl p-4 bg-white">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="w-7 h-7 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center">
                      <PinIcon />
                    </span>
                    <h2 className="text-slate-900 text-base font-bold">{tienda.nombre}</h2>
                  </div>
                  <p className="text-slate-700 text-sm">{tienda.direccion}</p>
                  <p className="text-slate-500 text-xs mt-1">
                    {tienda.ciudad ?? "Ciudad no definida"}
                  </p>

                  <a
                    href={getMapsUrl(tienda)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                  >
                    <MapIcon />
                    Ver en mapa
                  </a>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
