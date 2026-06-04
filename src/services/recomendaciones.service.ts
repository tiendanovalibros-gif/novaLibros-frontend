import { apiFetch } from "./api.client";

export interface LibroRecomendado {
  id: string;
  titulo: string;
  precio: number;
  imagenPortada?: string;
  anoPublicacion: number;
  idGenero: number;
  idGeneros: number[];
  autor?: { id: number; nombre: string };
  editorial?: { id: number; nombre: string };
  generos?: { idGenero: number; genero: { id: number; nombre: string } }[];
}

export interface SeccionRecomendacion {
  motivo: string;
  libros: LibroRecomendado[];
}

export interface RecomendacionesResponse {
  secciones: SeccionRecomendacion[];
  coldStart: boolean;
  meta: {
    generosDetectados: string[];
    preferenciasCount: number;
  };
}

export interface Preferencia {
  id: number;
  nombre: string;
}

export function getRecomendaciones() {
  return apiFetch<RecomendacionesResponse>("/recomendaciones/me");
}

export function getMisPreferencias() {
  return apiFetch<Preferencia[]>("/users/me/preferencias");
}

export function syncPreferencias(nombres: string[]) {
  return apiFetch<Preferencia[]>("/users/me/preferencias", {
    method: "PUT",
    body: JSON.stringify({ nombres }),
  });
}

export function registrarBusqueda(criterio: string) {
  return apiFetch<unknown>("/registros-busqueda/me", {
    method: "POST",
    body: JSON.stringify({ criterio }),
  });
}
