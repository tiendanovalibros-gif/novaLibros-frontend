import { apiFetch } from "./api.client";

export interface MensajeAsistente {
  id?: string;
  role: "user" | "assistant";
  content: string;
  fechaHora?: string;
}

export function obtenerHistorialAsistente() {
  return apiFetch<{ mensajes: MensajeAsistente[] }>("/asistente/historial");
}

export function enviarMensajeAsistente(mensaje: string) {
  return apiFetch<{ respuesta: string }>("/asistente/chat", {
    method: "POST",
    body: JSON.stringify({ mensaje }),
  });
}
