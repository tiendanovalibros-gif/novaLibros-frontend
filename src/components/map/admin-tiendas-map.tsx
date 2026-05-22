"use client";

import { useEffect, useMemo } from "react";
import { MapContainer, Marker, Popup, TileLayer, useMap, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import type { Tienda } from "@/services/tiendas.service";
import {
  crearIconoMarcador,
  MAP_DEFAULT_CENTER,
  MAP_DEFAULT_ZOOM,
  tiendaTieneCoords,
} from "@/lib/map-utils";

export interface AdminTiendasMapProps {
  tiendas: Tienda[];
  tiendaSeleccionada: number | null;
  modoEdicionUbicacion?: boolean;
  ubicacionBorrador?: { lat: number; lng: number } | null;
  onSelectTienda: (id: number) => void;
  onMapClick?: (lat: number, lng: number) => void;
  onMarkerDrag?: (id: number, lat: number, lng: number) => void;
  className?: string;
}

function MapBounds({
  points,
  selectedId,
  tiendas,
}: {
  points: [number, number][];
  selectedId: number | null;
  tiendas: Tienda[];
}) {
  const map = useMap();

  useEffect(() => {
    if (selectedId !== null) {
      const t = tiendas.find(x => x.id === selectedId);
      if (t && tiendaTieneCoords(t.latitud, t.longitud)) {
        map.flyTo([t.latitud, t.longitud], 15, { duration: 0.45 });
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
    map.fitBounds(L.latLngBounds(points), { padding: [40, 40], maxZoom: 14 });
  }, [map, points, selectedId, tiendas]);

  return null;
}

function MapClickHandler({
  enabled,
  onMapClick,
}: {
  enabled: boolean;
  onMapClick?: (lat: number, lng: number) => void;
}) {
  useMapEvents({
    click(e) {
      if (enabled && onMapClick) onMapClick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

export default function AdminTiendasMap({
  tiendas,
  tiendaSeleccionada,
  modoEdicionUbicacion = false,
  ubicacionBorrador,
  onSelectTienda,
  onMapClick,
  onMarkerDrag,
  className = "h-[min(420px,50vh)] w-full rounded-xl overflow-hidden border border-slate-200",
}: AdminTiendasMapProps) {
  const tiendasConCoords = useMemo(
    () => tiendas.filter(t => tiendaTieneCoords(t.latitud, t.longitud)),
    [tiendas]
  );

  const points = useMemo(
    () => tiendasConCoords.map(t => [t.latitud, t.longitud] as [number, number]),
    [tiendasConCoords]
  );

  const center = points[0] ?? MAP_DEFAULT_CENTER;

  const tiendaActiva = tiendas.find(t => t.id === tiendaSeleccionada);
  const mostrarBorrador =
    modoEdicionUbicacion &&
    ubicacionBorrador &&
    tiendaActiva &&
    tiendaTieneCoords(ubicacionBorrador.lat, ubicacionBorrador.lng);

  if (tiendasConCoords.length === 0) {
    return (
      <div
        className={`${className} flex items-center justify-center bg-slate-100 text-sm text-slate-500`}
      >
        No hay tiendas con coordenadas para mostrar.
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
        <MapClickHandler enabled={modoEdicionUbicacion} onMapClick={onMapClick} />

        {tiendasConCoords.map(tienda => {
          const seleccionada = tiendaSeleccionada === tienda.id;
          const usarBorrador = seleccionada && mostrarBorrador && ubicacionBorrador;
          const lat = usarBorrador ? ubicacionBorrador.lat : tienda.latitud;
          const lng = usarBorrador ? ubicacionBorrador.lng : tienda.longitud;
          const color = seleccionada ? "#2563eb" : "#64748b";
          const draggable = modoEdicionUbicacion && seleccionada;

          return (
            <Marker
              key={tienda.id}
              position={[lat, lng]}
              icon={crearIconoMarcador(color, seleccionada)}
              draggable={draggable}
              eventHandlers={{
                click: () => onSelectTienda(tienda.id),
                dragend(e) {
                  if (!draggable || !onMarkerDrag) return;
                  const pos = (e.target as L.Marker).getLatLng();
                  onMarkerDrag(tienda.id, pos.lat, pos.lng);
                },
              }}
            >
              <Popup>
                <div className="min-w-[140px]">
                  <p className="font-semibold text-sm text-slate-900">{tienda.nombre}</p>
                  <p className="text-xs text-slate-600 mt-0.5">{tienda.direccion}</p>
                  {seleccionada && modoEdicionUbicacion && (
                    <p className="text-xs text-blue-600 mt-1 font-medium">
                      Arrastra o haz clic en el mapa
                    </p>
                  )}
                </div>
              </Popup>
            </Marker>
          );
        })}

      </MapContainer>
    </div>
  );
}
