"use client";

import { useEffect } from "react";
import { MapContainer, Marker, TileLayer, useMap, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { MAP_DEFAULT_CENTER, MAP_DEFAULT_ZOOM } from "@/lib/map-constants";
import { crearIconoMarcador } from "@/lib/map-utils";

interface UbicacionPickerMapProps {
  lat: number;
  lng: number;
  onChange: (lat: number, lng: number) => void;
  className?: string;
  hint?: string;
}

function MapCenter({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo([lat, lng], Math.max(map.getZoom(), 15), { duration: 0.4 });
  }, [map, lat, lng]);
  return null;
}

function MapClickHandler({ onChange }: { onChange: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onChange(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

export default function UbicacionPickerMap({
  lat,
  lng,
  onChange,
  className = "h-[220px] w-full rounded-xl overflow-hidden border border-slate-200",
  hint = "Haz clic en el mapa o arrastra el marcador para ajustar la ubicación.",
}: UbicacionPickerMapProps) {
  const icon = crearIconoMarcador("#2563eb", true);

  return (
    <div className="space-y-2">
      <div className={className}>
        <MapContainer
          center={[lat, lng]}
          zoom={15}
          scrollWheelZoom
          className="h-full w-full"
          style={{ minHeight: "100%" }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <MapCenter lat={lat} lng={lng} />
          <MapClickHandler onChange={onChange} />
          <Marker
            position={[lat, lng]}
            icon={icon}
            draggable
            eventHandlers={{
              dragend(e) {
                const pos = (e.target as L.Marker).getLatLng();
                onChange(pos.lat, pos.lng);
              },
            }}
          />
        </MapContainer>
      </div>
      <p className="text-xs text-slate-500">{hint}</p>
      <p className="text-xs font-mono text-slate-600">
        {lat.toFixed(6)}, {lng.toFixed(6)}
      </p>
    </div>
  );
}

export function UbicacionPickerMapFallback({
  className = "h-[220px] w-full rounded-xl border border-slate-200 bg-slate-100 animate-pulse flex items-center justify-center text-sm text-slate-500",
}: {
  className?: string;
}) {
  return <div className={className}>Cargando mapa...</div>;
}

export { MAP_DEFAULT_CENTER, MAP_DEFAULT_ZOOM } from "@/lib/map-constants";
