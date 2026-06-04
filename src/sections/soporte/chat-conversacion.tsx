"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import Iconify from "@/components/iconify/iconify";
import { useAuth } from "@/context/auth.context";
import type { MensajeForo, ForoDetalle } from "@/services/foros.service";

const POLL_INTERVAL_MS = 12000;

function formatTime(iso: string) {
  const d = new Date(iso);
  return d.toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" });
}

function formatDateSeparator(iso: string) {
  const d = new Date(iso);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  if (d.toDateString() === today.toDateString()) return "Hoy";
  if (d.toDateString() === yesterday.toDateString()) return "Ayer";
  return d.toLocaleDateString("es-ES", { weekday: "long", day: "numeric", month: "long" });
}

function groupByDate(mensajes: MensajeForo[]) {
  const groups: { fecha: string; items: MensajeForo[] }[] = [];
  for (const m of mensajes) {
    const key = new Date(m.fechaHora).toDateString();
    const last = groups[groups.length - 1];
    if (!last || last.fecha !== key) {
      groups.push({ fecha: key, items: [m] });
    } else {
      last.items.push(m);
    }
  }
  return groups;
}

interface Props {
  foroId: number;
  obtenerForo: (id: number) => Promise<ForoDetalle>;
  enviarMensaje: (foroId: number, contenido: string) => Promise<MensajeForo>;
  listarMensajes?: (foroId: number) => Promise<MensajeForo[]>;
  backHref: string;
}

export default function ChatConversacion({
  foroId,
  obtenerForo,
  enviarMensaje,
  listarMensajes,
  backHref,
}: Props) {
  const { user } = useAuth();
  const [foro, setForo] = useState<ForoDetalle | null>(null);
  const [mensajes, setMensajes] = useState<MensajeForo[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [texto, setTexto] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [errorEnviar, setErrorEnviar] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const cargar = useCallback(async () => {
    try {
      const data = await obtenerForo(foroId);
      setForo(data);
      setMensajes(data.mensajes);
    } catch {
      setError("No se pudo cargar el chat.");
    } finally {
      setCargando(false);
    }
  }, [foroId, obtenerForo]);

  // Polling incremental usando el endpoint de mensajes si está disponible
  const pollMensajes = useCallback(async () => {
    if (!listarMensajes) return;
    try {
      const data = await listarMensajes(foroId);
      setMensajes(data);
    } catch {
      // Silencioso en polling
    }
  }, [foroId, listarMensajes]);

  useEffect(() => {
    void cargar();
  }, [cargar]);

  useEffect(() => {
    if (cargando) return;
    const interval = setInterval(pollMensajes, POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [cargando, pollMensajes]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [mensajes]);

  const handleEnviar = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!texto.trim() || enviando) return;
    setEnviando(true);
    setErrorEnviar(null);
    try {
      const nuevo = await enviarMensaje(foroId, texto.trim());
      setMensajes((prev) => [...prev, nuevo]);
      setTexto("");
      textareaRef.current?.focus();
    } catch {
      setErrorEnviar("No se pudo enviar el mensaje.");
    } finally {
      setEnviando(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void handleEnviar();
    }
  };

  if (cargando) {
    return (
      <div className="flex flex-col h-[calc(100vh-4rem)]">
        <div className="border-b border-slate-200 px-4 py-3 h-14 bg-white animate-pulse rounded-t-xl" />
        <div className="flex-1 p-4 space-y-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className={`h-10 rounded-2xl bg-slate-100 animate-pulse ${
                i % 2 === 0 ? "w-2/3 ml-auto" : "w-2/3"
              }`}
            />
          ))}
        </div>
      </div>
    );
  }

  if (error || !foro) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-3 text-slate-500">
        <Iconify icon="solar:danger-circle-bold" width={32} className="text-red-400" />
        <p>{error ?? "Foro no encontrado"}</p>
        <Link href={backHref} className="text-blue-600 text-sm hover:underline">
          Volver
        </Link>
      </div>
    );
  }

  const groups = groupByDate(mensajes);

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 bg-white border-b border-slate-200 shrink-0">
        <Link
          href={backHref}
          className="text-slate-400 hover:text-slate-700 transition-colors"
        >
          <Iconify icon="solar:arrow-left-bold" width={20} />
        </Link>
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-slate-900 truncate">{foro.titulo}</p>
          <p className="text-xs text-slate-400">
            {foro.usuarioCreador.nombre} {foro.usuarioCreador.apellido}
          </p>
        </div>
      </div>

      {/* Mensajes */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 bg-slate-50">
        {groups.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-slate-400 space-y-1">
            <Iconify icon="solar:chat-round-dots-bold" width={36} />
            <p className="text-sm">Aún no hay mensajes. ¡Escribe el primero!</p>
          </div>
        ) : (
          groups.map((group) => (
            <div key={group.fecha} className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="flex-1 border-t border-slate-200" />
                <span className="text-xs text-slate-400 shrink-0">
                  {formatDateSeparator(group.items[0].fechaHora)}
                </span>
                <div className="flex-1 border-t border-slate-200" />
              </div>
              {group.items.map((m) => {
                const esPropio = m.idRemitente === user?.id;
                const esStaff =
                  m.remitente.rol === "administrador" || m.remitente.rol === "root";
                return (
                  <div
                    key={m.id}
                    className={`flex ${esPropio ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[75%] rounded-2xl px-4 py-2.5 shadow-sm ${
                        esPropio
                          ? "bg-blue-600 text-white rounded-br-sm"
                          : esStaff
                          ? "bg-white border border-slate-200 text-slate-800 rounded-bl-sm"
                          : "bg-white border border-slate-200 text-slate-800 rounded-bl-sm"
                      }`}
                    >
                      {!esPropio && (
                        <p
                          className={`text-[10px] font-semibold mb-0.5 ${
                            esStaff ? "text-blue-600" : "text-slate-500"
                          }`}
                        >
                          {esStaff
                            ? "Soporte"
                            : `${m.remitente.nombre} ${m.remitente.apellido}`}
                        </p>
                      )}
                      <p className="text-sm whitespace-pre-wrap break-words">{m.contenido}</p>
                      <p
                        className={`text-[10px] mt-1 text-right ${
                          esPropio ? "text-blue-200" : "text-slate-400"
                        }`}
                      >
                        {formatTime(m.fechaHora)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          ))
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="bg-white border-t border-slate-200 px-4 py-3 shrink-0">
        {errorEnviar && (
          <p className="text-xs text-red-600 mb-1">{errorEnviar}</p>
        )}
        <form onSubmit={handleEnviar} className="flex items-end gap-2">
          <textarea
            ref={textareaRef}
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Escribe un mensaje… (Enter para enviar)"
            rows={1}
            maxLength={2000}
            className="flex-1 border border-slate-300 rounded-2xl px-4 py-2.5 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 max-h-32 overflow-y-auto"
            style={{ minHeight: "42px" }}
          />
          <button
            type="submit"
            disabled={enviando || !texto.trim()}
            className="w-10 h-10 rounded-full bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white flex items-center justify-center shrink-0 transition-colors"
          >
            <Iconify icon="solar:plain-bold" width={18} />
          </button>
        </form>
      </div>
    </div>
  );
}
