import L from "leaflet";

/** Centro aproximado de Colombia (Bogotá) cuando no hay puntos. */
export const MAP_DEFAULT_CENTER: [number, number] = [4.711, -74.072];
export const MAP_DEFAULT_ZOOM = 6;

export function tiendaTieneCoords(lat: number, lng: number): boolean {
  return Number.isFinite(lat) && Number.isFinite(lng) && !(lat === 0 && lng === 0);
}

export function crearIconoMarcador(color: string, seleccionado: boolean): L.DivIcon {
  const size = seleccionado ? 36 : 28;
  return L.divIcon({
    className: "",
    html: `<div style="
      width:${size}px;height:${size}px;
      background:${color};
      border:3px solid white;
      border-radius:50% 50% 50% 0;
      transform:rotate(-45deg);
      box-shadow:0 2px 8px rgba(0,0,0,.25);
      ${seleccionado ? "outline:2px solid #2563eb;outline-offset:2px;" : ""}
    "></div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size],
    popupAnchor: [0, -size],
  });
}

export const ICONO_USUARIO = L.divIcon({
  className: "",
  html: `<div style="
    width:14px;height:14px;
    background:#2563eb;
    border:3px solid white;
    border-radius:50%;
    box-shadow:0 1px 6px rgba(0,0,0,.3);
  "></div>`,
  iconSize: [14, 14],
  iconAnchor: [7, 7],
});
