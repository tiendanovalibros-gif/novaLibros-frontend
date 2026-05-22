"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Iconify from "@/components/iconify/iconify";
import AdminTiendasMapDynamic from "@/components/map/admin-tiendas-map-dynamic";
import {
  actualizarUbicacionTienda,
  listarTiendas,
  type Tienda,
} from "@/services/tiendas.service";
import { obtenerInventarioPorTienda } from "@/services/inventarios.service";
import type { InventarioTiendaResumen } from "@/types/inventarios.types";

interface Props {
  tiendas: Tienda[];
  tiendaSeleccionadaId: number | null;
  onSeleccionarTienda: (tienda: Tienda) => void;
  onEditarTienda: (tienda: Tienda) => void;
  onTiendasActualizadas?: (tiendas: Tienda[]) => void;
  /** Vista junto a la lista: mapa reducido */
  compact?: boolean;
}

const parseError = (err: unknown, fallback: string) => {
  if (err && typeof err === "object" && "message" in err) {
    return String((err as { message?: string }).message);
  }
  return fallback;
};

export default function TiendasMapaAdminPanel({
  tiendas,
  tiendaSeleccionadaId,
  onSeleccionarTienda,
  onEditarTienda,
  onTiendasActualizadas,
  compact = false,
}: Props) {
  const [tiendaActivaId, setTiendaActivaId] = useState<number | null>(tiendaSeleccionadaId);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [ubicacionBorrador, setUbicacionBorrador] = useState<{ lat: number; lng: number } | null>(
    null
  );
  const [resumen, setResumen] = useState<InventarioTiendaResumen | null>(null);
  const [cargandoResumen, setCargandoResumen] = useState(false);
  const [guardandoUbicacion, setGuardandoUbicacion] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState("");
  const [refrescando, setRefrescando] = useState(false);

  const tiendaActiva = useMemo(
    () => tiendas.find(t => t.id === tiendaActivaId) ?? null,
    [tiendas, tiendaActivaId]
  );

  const ubicacionCambio = useMemo(() => {
    if (!tiendaActiva || !ubicacionBorrador) return false;
    return (
      Math.abs(tiendaActiva.latitud - ubicacionBorrador.lat) > 0.000001 ||
      Math.abs(tiendaActiva.longitud - ubicacionBorrador.lng) > 0.000001
    );
  }, [tiendaActiva, ubicacionBorrador]);

  useEffect(() => {
    setTiendaActivaId(tiendaSeleccionadaId);
  }, [tiendaSeleccionadaId]);

  useEffect(() => {
    if (!tiendaActiva) {
      setUbicacionBorrador(null);
      setResumen(null);
      return;
    }
    setUbicacionBorrador({ lat: tiendaActiva.latitud, lng: tiendaActiva.longitud });
  }, [tiendaActiva?.id, tiendaActiva?.latitud, tiendaActiva?.longitud]);

  const cargarResumen = useCallback(async (idTienda: number) => {
    setCargandoResumen(true);
    try {
      const data = await obtenerInventarioPorTienda(idTienda);
      setResumen(data.resumen);
    } catch {
      setResumen(null);
    } finally {
      setCargandoResumen(false);
    }
  }, []);

  useEffect(() => {
    if (!tiendaActivaId) return;
    void cargarResumen(tiendaActivaId);
  }, [tiendaActivaId, cargarResumen]);

  const refrescarTiendas = async () => {
    setRefrescando(true);
    try {
      const data = await listarTiendas();
      onTiendasActualizadas?.(data);
    } catch (err) {
      setError(parseError(err, "No se pudo actualizar el listado"));
    } finally {
      setRefrescando(false);
    }
  };

  const handleSelectTienda = (id: number) => {
    setTiendaActivaId(id);
    setModoEdicion(false);
    setError("");
    const t = tiendas.find(x => x.id === id);
    if (t) onSeleccionarTienda(t);
  };

  const handleMapClick = (lat: number, lng: number) => {
    if (!modoEdicion) return;
    setUbicacionBorrador({ lat, lng });
  };

  const handleMarkerDrag = (_id: number, lat: number, lng: number) => {
    setUbicacionBorrador({ lat, lng });
  };

  const handleGuardarUbicacion = async () => {
    if (!tiendaActiva || !ubicacionBorrador) return;
    setGuardandoUbicacion(true);
    setError("");
    setMensaje("");
    try {
      const actualizada = await actualizarUbicacionTienda(tiendaActiva.id, {
        latitud: ubicacionBorrador.lat,
        longitud: ubicacionBorrador.lng,
      });
      const next = tiendas.map(t => (t.id === actualizada.id ? actualizada : t));
      onTiendasActualizadas?.(next);
      onSeleccionarTienda(actualizada);
      setMensaje("Ubicación guardada. Los clientes verán la nueva posición al elegir recogida.");
      setModoEdicion(false);
    } catch (err) {
      setError(parseError(err, "No se pudo guardar la ubicación"));
    } finally {
      setGuardandoUbicacion(false);
    }
  };

  const mapHeightClass = compact
    ? "h-[280px] min-h-[280px] lg:h-[300px] lg:min-h-[300px] w-full"
    : "h-full min-h-[320px] md:min-h-[420px] w-full";

  return (
    <div className={`flex flex-col h-full ${compact ? "min-h-0" : "min-h-[480px]"}`}>
      <div className="flex items-center justify-between gap-2 mb-2 shrink-0">
        <div className="flex items-center gap-1.5 min-w-0">
          <div className="w-7 h-7 bg-blue-600 rounded-md flex items-center justify-center shrink-0">
            <Iconify icon="solar:map-bold" className="text-white" width={14} />
          </div>
          <div className="min-w-0">
            <h2 className="text-slate-900 font-bold text-xs">Mapa</h2>
            {!compact && (
              <p className="text-xs text-slate-500 truncate">Clic en marcador para seleccionar</p>
            )}
          </div>
        </div>
        <button
          type="button"
          onClick={() => void refrescarTiendas()}
          disabled={refrescando}
          className="px-2 py-0.5 border border-slate-300 rounded-md text-[10px] font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-60 shrink-0"
        >
          {refrescando ? "..." : "↻"}
        </button>
      </div>

      {tiendas.length === 0 ? (
        <div className="flex-1 flex items-center justify-center rounded-lg border border-dashed border-slate-200 bg-slate-50 text-xs text-slate-500 text-center px-2">
          Agrega una tienda para verla en el mapa
        </div>
      ) : (
        <div
          className={`flex-1 min-h-0 ${compact ? "flex flex-col gap-2" : "grid grid-cols-1 md:grid-cols-[1fr_240px] gap-3"}`}
        >
          <AdminTiendasMapDynamic
            tiendas={tiendas}
            tiendaSeleccionada={tiendaActivaId}
            modoEdicionUbicacion={modoEdicion}
            ubicacionBorrador={ubicacionBorrador}
            onSelectTienda={handleSelectTienda}
            onMapClick={handleMapClick}
            onMarkerDrag={handleMarkerDrag}
            className={`${mapHeightClass} rounded-lg overflow-hidden border border-slate-200 z-0 shrink-0`}
          />

          <aside
            className={`rounded-lg border border-slate-200 bg-slate-50 p-2.5 flex flex-col gap-2 overflow-y-auto shrink-0 ${
              compact ? "max-h-[200px] text-[11px]" : "max-h-[420px] md:max-h-none"
            }`}
          >
            {!tiendaActiva ? (
              <p className="text-sm text-slate-500 text-center py-6">
                Selecciona una tienda en el mapa o en la lista
              </p>
            ) : (
              <>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">{tiendaActiva.nombre}</h3>
                  <p className="text-xs text-slate-600 mt-0.5 line-clamp-2">
                    {tiendaActiva.ciudad ? `${tiendaActiva.ciudad} · ` : ""}
                    {tiendaActiva.direccionNormalizada || tiendaActiva.direccion}
                  </p>
                  <p className="text-[10px] font-mono text-slate-500 mt-1">
                    {ubicacionBorrador
                      ? `${ubicacionBorrador.lat.toFixed(5)}, ${ubicacionBorrador.lng.toFixed(5)}`
                      : `${tiendaActiva.latitud}, ${tiendaActiva.longitud}`}
                  </p>
                </div>

                <div className="rounded-lg border border-slate-200 bg-white p-2.5">
                  <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
                    Stock
                  </p>
                  {cargandoResumen ? (
                    <p className="text-xs text-slate-500">Cargando...</p>
                  ) : resumen ? (
                    <ul className="space-y-0.5 text-slate-700 text-xs">
                      <li>
                        <span className="font-semibold">{resumen.totalItems}</span> títulos
                      </li>
                      <li>
                        <span className="font-semibold">{resumen.totalDisponible}</span> disponibles
                      </li>
                      <li>
                        <span className="font-semibold text-red-600">{resumen.librosAgotados}</span>{" "}
                        agotados
                      </li>
                    </ul>
                  ) : (
                    <p className="text-xs text-slate-500">Sin inventario</p>
                  )}
                </div>

                {mensaje && (
                  <div className="rounded-lg bg-emerald-50 border border-emerald-200 px-2 py-1.5 text-xs text-emerald-800">
                    {mensaje}
                  </div>
                )}
                {error && (
                  <div className="rounded-lg bg-red-50 border border-red-200 px-2 py-1.5 text-xs text-red-700">
                    {error}
                  </div>
                )}

                <div className="flex flex-col gap-1.5 mt-auto">
                  <button
                    type="button"
                    onClick={() => onEditarTienda(tiendaActiva)}
                    className="w-full py-1.5 border border-slate-300 rounded-lg text-xs font-semibold text-slate-800 hover:bg-white"
                  >
                    Editar datos
                  </button>
                  <button
                    type="button"
                    onClick={() => setModoEdicion(v => !v)}
                    className={`w-full py-1.5 rounded-lg text-xs font-semibold border ${
                      modoEdicion
                        ? "border-amber-400 bg-amber-50 text-amber-900"
                        : "border-slate-300 text-slate-700 hover:bg-white"
                    }`}
                  >
                    {modoEdicion ? "Cancelar ajuste" : "Mover en mapa"}
                  </button>
                  {modoEdicion && ubicacionCambio && (
                    <button
                      type="button"
                      onClick={() => void handleGuardarUbicacion()}
                      disabled={guardandoUbicacion}
                      className="w-full py-1.5 bg-emerald-600 text-white rounded-lg text-xs font-semibold hover:bg-emerald-700 disabled:opacity-60"
                    >
                      {guardandoUbicacion ? "Guardando..." : "Guardar ubicación"}
                    </button>
                  )}
                </div>
              </>
            )}
          </aside>
        </div>
      )}
    </div>
  );
}
