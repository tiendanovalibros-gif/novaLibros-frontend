"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { usePathname } from "next/navigation";
import Iconify from "@/components/iconify/iconify";
import FolioAvatar from "@/components/asistente/folio-avatar";
import MensajeContenido from "@/components/asistente/mensaje-contenido";
import { useAuth } from "@/context/auth.context";
import {
  enviarMensajeAsistente,
  obtenerHistorialAsistente,
  type MensajeAsistente,
} from "@/services/asistente.service";

export const NOMBRE_BOT = "Folio";

const BIENVENIDA: MensajeAsistente = {
  role: "assistant",
  content:
    `¡Hola! Soy ${NOMBRE_BOT}, tu guía literaria en NovaLibros. Puedo ayudarte a encontrar libros en nuestro catálogo, contarte sobre títulos, autores, precios y más. ¿En qué te puedo ayudar?`,
};

const OCULTAR_EN = ["/soporte", "/admin/soporte", "/login", "/register"];

export default function AsistenteWidget() {
  const pathname = usePathname() ?? "";
  const { isAuthenticated, user } = useAuth();
  const [abierto, setAbierto] = useState(false);
  const [mensajes, setMensajes] = useState<MensajeAsistente[]>([BIENVENIDA]);
  const [texto, setTexto] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [cargandoHistorial, setCargandoHistorial] = useState(false);
  const [historialCargado, setHistorialCargado] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const ocultarWidget = OCULTAR_EN.some(
    (ruta) => pathname === ruta || pathname.startsWith(`${ruta}/`)
  );

  const cargarHistorial = useCallback(async () => {
    if (!isAuthenticated || user?.rol !== "cliente" || historialCargado) return;
    setCargandoHistorial(true);
    try {
      const { mensajes: guardados } = await obtenerHistorialAsistente();
      if (guardados.length > 0) {
        setMensajes(guardados);
      } else {
        setMensajes([BIENVENIDA]);
      }
      setHistorialCargado(true);
    } catch {
      setMensajes([BIENVENIDA]);
      setHistorialCargado(true);
    } finally {
      setCargandoHistorial(false);
    }
  }, [isAuthenticated, user?.rol, historialCargado]);

  useEffect(() => {
    void cargarHistorial();
  }, [cargarHistorial]);

  useEffect(() => {
    if (abierto) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
      textareaRef.current?.focus();
    }
  }, [abierto, mensajes]);

  const handleEnviar = useCallback(async () => {
    const contenido = texto.trim();
    if (!contenido || enviando) return;

    const nuevoMensajeUsuario: MensajeAsistente = { role: "user", content: contenido };
    const sinBienvenida =
      mensajes.length === 1 &&
      mensajes[0].role === "assistant" &&
      mensajes[0].content === BIENVENIDA.content;
    const base = sinBienvenida ? [] : mensajes;
    setMensajes([...base, nuevoMensajeUsuario]);
    setTexto("");
    setEnviando(true);
    setError(null);

    try {
      const { respuesta } = await enviarMensajeAsistente(contenido);
      setMensajes((prev) => [
        ...prev,
        { role: "assistant", content: respuesta },
      ]);
    } catch (err: any) {
      const msg: string =
        err?.message ?? "No se pudo obtener respuesta. Intenta de nuevo.";
      setError(msg);
      setMensajes((prev) => {
        const rolled = prev.slice(0, -1);
        return rolled.length === 0 ? [BIENVENIDA] : rolled;
      });
    } finally {
      setEnviando(false);
    }
  }, [texto, enviando, mensajes]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void handleEnviar();
    }
  };

  if (ocultarWidget) return null;

  return (
    <div className="fixed bottom-6 right-6 z-[80] flex flex-col items-end gap-3">
      {abierto && (
        <div className="w-[360px] max-w-[calc(100vw-3rem)] flex flex-col rounded-2xl shadow-2xl border border-slate-200 bg-white overflow-hidden"
          style={{ height: "480px" }}>
          {/* Header */}
          <div className="flex items-center gap-2.5 px-4 py-3 bg-blue-600 text-white shrink-0">
            <FolioAvatar size="md" className="ring-blue-400/50" />
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm leading-tight">{NOMBRE_BOT}</p>
              <p className="text-[11px] text-blue-200 leading-tight">Guía literaria · NovaLibros</p>
            </div>
            <button
              onClick={() => setAbierto(false)}
              className="text-blue-200 hover:text-white transition-colors p-0.5"
              aria-label="Cerrar asistente"
            >
              <Iconify icon="solar:close-circle-bold" width={20} />
            </button>
          </div>

          {/* Mensajes */}
          <div className="flex-1 overflow-y-auto px-3 py-3 space-y-3 bg-slate-50">
            {cargandoHistorial ? (
              <div className="flex flex-col gap-3 py-4">
                {[1, 2, 3].map((n) => (
                  <div
                    key={n}
                    className={`h-12 rounded-2xl bg-slate-200 animate-pulse ${
                      n % 2 === 0 ? "w-2/3 ml-auto" : "w-3/4"
                    }`}
                  />
                ))}
              </div>
            ) : (
            mensajes.map((m, i) => (
              <div
                key={m.id ?? `msg-${i}`}
                className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
              >
                {m.role === "assistant" && (
                  <FolioAvatar size="sm" className="mr-1.5 mt-0.5" />
                )}
                <div
                  className={`max-w-[82%] rounded-2xl px-3.5 py-2.5 text-sm shadow-sm ${
                    m.role === "user"
                      ? "bg-blue-600 text-white rounded-br-sm"
                      : "bg-white border border-slate-200 text-slate-800 rounded-bl-sm"
                  }`}
                >
                  <MensajeContenido content={m.content} variant={m.role} />
                </div>
              </div>
            ))
            )}

            {!cargandoHistorial && enviando && (
              <div className="flex justify-start">
                <FolioAvatar size="sm" className="mr-1.5 mt-0.5" />
                <div className="bg-white border border-slate-200 rounded-2xl rounded-bl-sm px-4 py-2.5">
                  <span className="flex gap-1 items-center">
                    <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:0ms]" />
                    <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:150ms]" />
                    <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:300ms]" />
                  </span>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="bg-white border-t border-slate-200 px-3 py-2.5 shrink-0">
            {error && (
              <p className="text-[11px] text-red-600 mb-1.5 px-1">{error}</p>
            )}
            <div className="flex items-end gap-2">
              <textarea
                ref={textareaRef}
                value={texto}
                onChange={(e) => setTexto(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Pregunta sobre libros… (Enter para enviar)"
                rows={1}
                maxLength={500}
                disabled={enviando}
                className="flex-1 border border-slate-300 rounded-2xl px-3.5 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 max-h-24 overflow-y-auto disabled:opacity-60"
                style={{ minHeight: "38px" }}
              />
              <button
                onClick={() => void handleEnviar()}
                disabled={enviando || !texto.trim()}
                className="w-9 h-9 rounded-full bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white flex items-center justify-center shrink-0 transition-colors"
                aria-label="Enviar mensaje"
              >
                <Iconify icon="solar:plain-bold" width={16} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FAB: robot animado cerrado; mismo robot quieto al abrir */}
      <div
        className={`relative flex flex-col items-center gap-2 ${
          abierto ? "" : "animate-asistente-float"
        }`}
      >
        <button
          type="button"
          onClick={() => setAbierto((v) => !v)}
          className={`relative z-10 w-[4.5rem] h-[4.5rem] rounded-full flex items-center justify-center bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-700 hover:from-blue-600 hover:via-blue-700 hover:to-indigo-800 text-white ring-4 ring-white shadow-xl transition-transform duration-200 hover:scale-105 active:scale-95 ${
            abierto ? "shadow-lg" : "animate-asistente-glow"
          }`}
          aria-label={abierto ? `Cerrar chat con ${NOMBRE_BOT}` : `Abrir chat con ${NOMBRE_BOT}`}
          aria-expanded={abierto}
        >
          <span className={`inline-flex ${abierto ? "" : "animate-asistente-wiggle"}`}>
            <FolioAvatar size="lg" bare />
          </span>
        </button>
        {!abierto && (
          <span className="pointer-events-none text-[11px] font-semibold text-blue-700 bg-white/95 px-2.5 py-0.5 rounded-full shadow-sm border border-blue-100">
            Habla con {NOMBRE_BOT}
          </span>
        )}
      </div>
    </div>
  );
}
