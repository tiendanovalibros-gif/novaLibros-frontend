"use client";

import { useEffect, useState } from "react";
import Iconify from "@/components/iconify/iconify";
import { obtenerOpcionesRecogida, type TiendaRecogidaOpcion } from "@/services/carrito.service";

interface SeleccionTiendaModalProps {
  isOpen: boolean;
  comprando: boolean;
  onClose: () => void;
  onConfirm: (idTienda: number) => void;
}

function formatDistancia(km: number | null): string | null {
  if (km === null) return null;
  if (km < 1) return `${Math.round(km * 1000)} m`;
  return `${km.toFixed(1)} km`;
}

function getMapsUrl(tienda: TiendaRecogidaOpcion): string {
  const query = encodeURIComponent(
    `${tienda.nombre}, ${tienda.direccion}, ${tienda.ciudad ?? "Colombia"}`
  );
  return `https://www.google.com/maps/search/?api=1&query=${query}&ll=${tienda.latitud},${tienda.longitud}`;
}

export default function SeleccionTiendaModal({
  isOpen,
  comprando,
  onClose,
  onConfirm,
}: SeleccionTiendaModalProps) {
  const [tiendas, setTiendas] = useState<TiendaRecogidaOpcion[]>([]);
  const [tiendaSeleccionada, setTiendaSeleccionada] = useState<number | null>(null);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");
  const [sinUbicacion, setSinUbicacion] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    setTiendas([]);
    setTiendaSeleccionada(null);
    setError("");
    setSinUbicacion(false);
    setCargando(true);

    const cargarConUbicacion = (lat: number, lng: number) => {
      obtenerOpcionesRecogida(lat, lng)
        .then(data => {
          setTiendas(data);
          const primera = data.find(t => t.puedeCompletarCarrito);
          setTiendaSeleccionada(primera?.id ?? null);
        })
        .catch(e => setError((e as { message?: string })?.message ?? "No se pudieron cargar las tiendas"))
        .finally(() => setCargando(false));
    };

    const cargarSinUbicacion = () => {
      setSinUbicacion(true);
      obtenerOpcionesRecogida()
        .then(data => {
          setTiendas(data);
          const primera = data.find(t => t.puedeCompletarCarrito);
          setTiendaSeleccionada(primera?.id ?? null);
        })
        .catch(e => setError((e as { message?: string })?.message ?? "No se pudieron cargar las tiendas"))
        .finally(() => setCargando(false));
    };

    if (!navigator.geolocation) {
      cargarSinUbicacion();
      return;
    }

    navigator.geolocation.getCurrentPosition(
      pos => cargarConUbicacion(pos.coords.latitude, pos.coords.longitude),
      () => cargarSinUbicacion(),
      { timeout: 10000 },
    );
  }, [isOpen]);

  if (!isOpen) return null;

  const tiendaElegida = tiendas.find(t => t.id === tiendaSeleccionada);
  const puedeConfirmar = tiendaSeleccionada !== null && tiendaElegida?.puedeCompletarCarrito;

  return (
    <div className="fixed inset-0 z-[70] bg-slate-900/55 backdrop-blur-[2px] flex items-end sm:items-center justify-center p-0 sm:p-6">
      <div
        className="w-full sm:max-w-lg bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90dvh]"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Iconify icon="solar:shop-bold" className="text-white" width={18} />
            </div>
            <span className="text-slate-900 text-sm font-bold tracking-tight">
              Elige dónde recoger tu pedido
            </span>
          </div>
          <button
            onClick={onClose}
            disabled={comprando}
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-300 text-slate-600 hover:bg-slate-100 disabled:opacity-50"
            aria-label="Cerrar"
          >
            <Iconify icon="mdi:close" width={18} />
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto flex-1 p-4 space-y-2">
          {cargando && (
            <div className="flex flex-col items-center justify-center py-12 gap-3 text-slate-500">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
              <span className="text-sm">Buscando tiendas cercanas...</span>
            </div>
          )}

          {!cargando && error && (
            <div className="py-10 text-center">
              <p className="text-red-600 text-sm font-semibold">{error}</p>
            </div>
          )}

          {!cargando && !error && (
            <>
              {sinUbicacion && (
                <div className="flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-700 mb-1">
                  <Iconify icon="solar:map-point-off-bold" width={14} />
                  Activa la ubicación para ver tiendas ordenadas por cercanía.
                </div>
              )}

              {tiendas.length === 0 && (
                <div className="py-10 text-center text-slate-500 text-sm">
                  No hay tiendas disponibles.
                </div>
              )}

              {tiendas.map(tienda => {
                const seleccionada = tiendaSeleccionada === tienda.id;
                const disponible = tienda.puedeCompletarCarrito;
                const distancia = formatDistancia(tienda.distanciaKm);

                return (
                  <button
                    key={tienda.id}
                    type="button"
                    disabled={!disponible}
                    onClick={() => setTiendaSeleccionada(tienda.id)}
                    className={`w-full text-left rounded-xl border p-3.5 transition-colors focus:outline-none ${
                      seleccionada && disponible
                        ? "border-blue-500 bg-blue-50"
                        : disponible
                          ? "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
                          : "border-slate-100 bg-slate-50 opacity-60 cursor-not-allowed"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`mt-0.5 h-4 w-4 shrink-0 rounded-full border-2 flex items-center justify-center ${
                        seleccionada && disponible
                          ? "border-blue-600 bg-blue-600"
                          : "border-slate-300"
                      }`}>
                        {seleccionada && disponible && (
                          <div className="h-1.5 w-1.5 rounded-full bg-white" />
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2 flex-wrap">
                          <span className="text-slate-900 font-semibold text-sm">{tienda.nombre}</span>
                          <div className="flex items-center gap-1.5">
                            {distancia && (
                              <span className="text-xs font-medium px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-600">
                                {distancia}
                              </span>
                            )}
                            <span className={`text-xs font-medium px-1.5 py-0.5 rounded-md ${
                              disponible
                                ? "bg-emerald-100 text-emerald-700"
                                : "bg-red-100 text-red-600"
                            }`}>
                              {disponible ? "Disponible" : "Sin stock"}
                            </span>
                          </div>
                        </div>

                        <p className="text-xs text-slate-500 mt-0.5 truncate">
                          {tienda.direccionNormalizada || tienda.direccion}
                          {tienda.ciudad ? `, ${tienda.ciudad}` : ""}
                        </p>

                        {!disponible && tienda.faltantes.length > 0 && (
                          <p className="text-xs text-red-500 mt-1">
                            Sin stock suficiente para:{" "}
                            {tienda.faltantes
                              .map(f => `${f.idLibro.slice(0, 8)}… (${f.disponible}/${f.solicitado})`)
                              .join(", ")}
                          </p>
                        )}

                        <a
                          href={getMapsUrl(tienda)}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={e => e.stopPropagation()}
                          className="inline-flex items-center gap-1 text-xs text-blue-600 hover:underline mt-1"
                        >
                          <Iconify icon="solar:map-point-bold" width={12} />
                          Ver en mapa
                        </a>
                      </div>
                    </div>
                  </button>
                );
              })}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="shrink-0 px-5 py-4 border-t border-slate-200 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            disabled={comprando}
            className="px-4 py-2 border border-slate-300 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-60"
          >
            Cancelar
          </button>
          <button
            onClick={() => puedeConfirmar && onConfirm(tiendaSeleccionada!)}
            disabled={!puedeConfirmar || comprando}
            className="px-5 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {comprando && (
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
            )}
            {comprando ? "Procesando..." : "Confirmar compra"}
          </button>
        </div>
      </div>
    </div>
  );
}
