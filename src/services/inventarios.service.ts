import { apiFetch } from "./api.client";
import type {
  LibroAgotado,
  LibroAgotadoAdmin,
  InventarioTiendaResponse,
} from "@/types/inventarios.types";

export async function obtenerLibrosAgotados(): Promise<LibroAgotado[]> {
  return apiFetch<LibroAgotado[]>("/inventarios/libros-agotados");
}

export async function obtenerLibrosAgotadosAdmin(): Promise<LibroAgotadoAdmin[]> {
  return apiFetch<LibroAgotadoAdmin[]>("/inventarios/libros-agotados/admin");
}

export async function agregarExistenciasLibro(
  idTienda: number,
  idLibro: string,
  cantidadAAgregar: number
): Promise<void> {
  await apiFetch(`/inventarios/tiendas/${idTienda}/libros/${idLibro}/agregar-existencias`, {
    method: "PATCH",
    body: JSON.stringify({ cantidadAAgregar }),
  });
}

export async function actualizarCantidadInventarioLibro(
  idTienda: number,
  idLibro: string,
  cantidadDisponible: number
): Promise<void> {
  await apiFetch(`/inventarios/tiendas/${idTienda}/libros/${idLibro}/cantidad`, {
    method: "PATCH",
    body: JSON.stringify({ cantidadDisponible }),
  });
}

export async function obtenerInventarioPorTienda(
  idTienda: number
): Promise<InventarioTiendaResponse> {
  return apiFetch<InventarioTiendaResponse>(`/inventarios/tiendas/${idTienda}`);
}

export async function marcarLibroAgotado(
  idTienda: number,
  idLibro: string
): Promise<void> {
  await apiFetch(`/inventarios/tiendas/${idTienda}/libros/${idLibro}/agotado`, {
    method: "PATCH",
  });
}

export async function bloquearLibros(
  idTienda: number,
  idLibro: string,
  cantidadABloquear: number
): Promise<void> {
  await apiFetch(`/inventarios/tiendas/${idTienda}/libros/${idLibro}/bloquear`, {
    method: "PATCH",
    body: JSON.stringify({ cantidadABloquear }),
  });
}

export async function reponerPorGenero(
  idTienda: number,
  idGenero: number,
  cantidadDisponible: number
): Promise<void> {
  await apiFetch(`/inventarios/tiendas/${idTienda}/generos/${idGenero}/agregar`, {
    method: "POST",
    body: JSON.stringify({ cantidadDisponible }),
  });
}

export async function crearInventarioLibro(
  idTienda: number,
  idLibro: string,
  cantidadDisponible: number
): Promise<void> {
  await apiFetch("/inventarios", {
    method: "POST",
    body: JSON.stringify({
      idLibro,
      idTienda,
      cantidadDisponible,
      cantidadBloqueada: 0,
      fechaActualizacion: new Date().toISOString(),
    }),
  });
}
