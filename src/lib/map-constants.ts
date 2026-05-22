/** Centro aproximado de Colombia (Bogotá) cuando no hay puntos. */
export const MAP_DEFAULT_CENTER: [number, number] = [4.711, -74.072];
export const MAP_DEFAULT_ZOOM = 6;

export function tiendaTieneCoords(lat: number, lng: number): boolean {
  return Number.isFinite(lat) && Number.isFinite(lng) && !(lat === 0 && lng === 0);
}
