import { apiFetch } from "./api.client";

export interface RemitenteInfo {
  id: string;
  nombre: string;
  apellido: string;
  rol: string;
}

export interface MensajeForo {
  id: string;
  idForo: number;
  idRemitente: string;
  contenido: string;
  fechaHora: string;
  remitente: RemitenteInfo;
}

export interface CreadorInfo {
  id: string;
  nombre: string;
  apellido: string;
}

export interface ForoResumen {
  id: number;
  titulo: string;
  fechaCreacion: string;
  fechaActualizacion: string;
  idUsuarioCreador: string;
  usuarioCreador: CreadorInfo;
  mensajes: MensajeForo[];
  _count: { mensajes: number };
}

export interface ForoDetalle {
  id: number;
  titulo: string;
  fechaCreacion: string;
  fechaActualizacion: string;
  idUsuarioCreador: string;
  usuarioCreador: CreadorInfo;
  mensajes: MensajeForo[];
}

// ── Cliente ──────────────────────────────────────────────────────────────────

export function crearMiForo(titulo: string, contenido?: string) {
  return apiFetch<ForoDetalle>("/foros/me", {
    method: "POST",
    body: JSON.stringify({ titulo, contenido }),
  });
}

export function listarMisForos() {
  return apiFetch<ForoResumen[]>("/foros/me");
}

export function obtenerMiForo(id: number) {
  return apiFetch<ForoDetalle>(`/foros/me/${id}`);
}

export function enviarMensajeCliente(foroId: number, contenido: string) {
  return apiFetch<MensajeForo>(`/foros/me/${foroId}/mensajes`, {
    method: "POST",
    body: JSON.stringify({ contenido }),
  });
}

// ── Admin / Root ──────────────────────────────────────────────────────────────

export function listarTodosLosForos() {
  return apiFetch<ForoResumen[]>("/foros");
}

export function obtenerForoAdmin(id: number) {
  return apiFetch<ForoDetalle>(`/foros/${id}`);
}

export function enviarMensajeAdmin(foroId: number, contenido: string) {
  return apiFetch<MensajeForo>(`/foros/${foroId}/mensajes`, {
    method: "POST",
    body: JSON.stringify({ contenido }),
  });
}

export function listarMensajesAdmin(foroId: number) {
  return apiFetch<MensajeForo[]>(`/foros/${foroId}/mensajes`);
}
