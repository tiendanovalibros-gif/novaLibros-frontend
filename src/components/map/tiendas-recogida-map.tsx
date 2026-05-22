"use client";

import { useEffect, useMemo } from "react";
import { MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import type { TiendaRecogidaOpcion } from "@/services/carrito.service";
import {
  crearIconoMarcador,
  ICONO_USUARIO,
  MAP_DEFAULT_CENTER,
  MAP_DEFAULT_ZOOM,
  tiendaTieneCoords,
} from "@/lib/map-utils";

interface TiendasRecogidaMapProps {
  tiendas: TiendaRecogidaOpcion[];
  tiendaSeleccionada: number | null;
  userCoords?: { lat: number; lng: number } | null;
  onSelectTienda: (id: number) => void;
  className?: string;
}

function formatDistancia(km: number | null): string | null {
  if (km === null) return null;
  if (km < 1) return `${Math.round(km * 1000)} m`;
  return `${km.toFixed(1)} km`;
}

function MapBounds({
  points,
  selectedId,
  tiendas,
}: {
  points: [number, number][];
  selectedId: number | null;
  tiendas: TiendaRecogidaOpcion[];
}) {
  const map = useMap();

  useEffect(() => {
    if (selectedId !== null) {
      const t = tiendas.find(x => x.id === selectedId);
      if (t && tiendaTieneCoords(t.latitud, t.longitud)) {
        map.flyTo([t.latitud, t.longitud], 15, { duration: 0.5 });
        return;
      }
    }

    if (points.length === 0) {
      map.setView(MAP_DEFAULT_CENTER, MAP_DEFAULT_ZOOM);
      return;
    }
    if (points.length === 1) {
      map.setView(points[0], 14);
      return;
    }
    map.fitBounds(L.latLngBounds(points), { padding: [48, 48], maxZoom: 15 });
  }, [map, points, selectedId, tiendas]);

  return null;
}

export default function TiendasRecogidaMap({
  tiendas,
  tiendaSeleccionada,
  userCoords,
  onSelectTienda,
  className = "h-[240px] w-full rounded-xl overflow-hidden border border-slate-200 z-0",
}: TiendasRecogidaMapProps) {
  const tiendasConCoords = useMemo(
    () => tiendas.filter(t => tiendaTieneCoords(t.latitud, t.longitud)),
    [tiendas]
  );

  const points = useMemo(() => {
    const pts: [number, number][] = tiendasConCoords.map(t => [t.latitud, t.longitud]);
    if (userCoords) pts.push([userCoords.lat, userCoords.lng]);
    return pts;
  }, [tiendasConCoords, userCoords]);

  const center = points[0] ?? MAP_DEFAULT_CENTER;

  if (tiendasConCoords.length === 0) {
    return (
      <div
        className={`${className} flex items-center justify-center bg-slate-100 text-sm text-slate-500`}
      >
        No hay tiendas con ubicación en el mapa.
      </div>
    );
  }

  return (
    <div className={className}>
      <MapContainer
        center={center}
        zoom={MAP_DEFAULT_ZOOM}
        scrollWheelZoom
        className="h-full w-full"
        style={{ minHeight: "100%" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapBounds points={points} selectedId={tiendaSeleccionada} tiendas={tiendasConCoords} />

        {userCoords && (
          <Marker position={[userCoords.lat, userCoords.lng]} icon={ICONO_USUARIO}>
            <Popup>
              <span className="text-sm font-semibold">Tu ubicación</span>
            </Popup>
          </Marker>
        )}

        {tiendasConCoords.map(tienda => {
          const seleccionada = tiendaSeleccionada === tienda.id;
          const disponible = tienda.puedeCompletarCarrito;
          const color = !disponible ? "#94a3b8" : seleccionada ? "#2563eb" : "#059669";
          const distancia = formatDistancia(tienda.distanciaKm);

          return (
            <Marker
              key={tienda.id}
              position={[tienda.latitud, tienda.longitud]}
              icon={crearIconoMarcador(color, seleccionada)}
              eventHandlers={{
                click: () => {
                  if (disponible) onSelectTienda(tienda.id);
                },
              }}
            >
              <Popup>
                <div className="min-w-[160px] space-y-1">
                  <p className="font-semibold text-slate-900 text-sm">{tienda.nombre}</p>
                  <p className="text-xs text-slate-600">
                    {tienda.direccionNormalizada || tienda.direccion}
                  </p>
                  {distancia && (
                    <p className="text-xs text-blue-600 font-medium">{distancia} de distancia</p>
                  )}
                  <p
                    className={`text-xs font-semibold ${
                      disponible ? "text-emerald-600" : "text-red-600"
                    }`}
                  >
                    {disponible ? "Disponible — clic para seleccionar" : "Sin stock"}
                  </p>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}
