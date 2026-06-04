"use client";

import { useState, useRef, useEffect } from "react";
import Iconify from "@/components/iconify/iconify";
import FolioAvatar from "@/components/asistente/folio-avatar";
import MensajeContenido from "@/components/asistente/mensaje-contenido";
import { NOMBRE_BOT } from "@/components/asistente/asistente-widget";
import {
  enviarMensajeAsistente,
  obtenerHistorialAsistente,
} from "@/services/asistente.service";

const PROMPTS = [
  "Recomiéndame 3 libros según mis gustos literarios",
  "¿Qué novedades tienen en el catálogo?",
  "Sugiere libros por género o autor",
];

interface Mensaje {
  role: "user" | "assistant";
  content: string;
}

const BIENVENIDA: Mensaje = {
  role: "assistant",
  content: `¡Hola! Soy ${NOMBRE_BOT}, tu guía literaria en NovaLibros. Pregúntame por libros del catálogo, autores, precios o recomendaciones.`,
};

export default function FolioRecomendaciones() {
  const [mensajes, setMensajes] = useState<Mensaje[]>([BIENVENIDA]);
  const [texto, setTexto] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    obtenerHistorialAsistente()
      .then(({ mensajes: guardados }) => {
        if (guardados.length > 0) {
          setMensajes(
            guardados.map((m) => ({
              role: m.role,
              content: m.content,
            })),
          );
        }
      })
      .catch(() => undefined);
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [mensajes, enviando]);

  async function enviar(textoEnviar: string) {
    const contenido = textoEnviar.trim();
    if (!contenido || enviando) return;

    setError(null);
    const userMsg: Mensaje = { role: "user", content: contenido };
    setMensajes((prev) => {
      const sinBienvenida =
        prev.length === 1 &&
        prev[0].role === "assistant" &&
        prev[0].content === BIENVENIDA.content;
      return [...(sinBienvenida ? [] : prev), userMsg];
    });
    setTexto("");
    setEnviando(true);

    try {
      const res = await enviarMensajeAsistente(contenido);
      setMensajes((prev) => [...prev, { role: "assistant", content: res.respuesta }]);
    } catch (err: unknown) {
      const msg =
        (err as { message?: string })?.message ?? "Ocurrió un error. Inténtalo de nuevo.";
      setError(msg);
      setMensajes((prev) => prev.slice(0, -1));
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="rounded-2xl border border-blue-100 bg-gradient-to-br from-blue-50 to-indigo-50 p-6 shadow-sm">
      <div className="flex items-center gap-3 mb-4">
        <FolioAvatar size="lg" />
        <div>
          <p className="font-bold text-slate-900">Chatea con {NOMBRE_BOT}</p>
          <p className="text-sm text-slate-600">Tu guía literaria en NovaLibros</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        {PROMPTS.map((prompt) => (
          <button
            key={prompt}
            type="button"
            onClick={() => enviar(prompt)}
            disabled={enviando}
            className="px-3 py-1.5 rounded-full bg-white border border-blue-200 text-sm font-medium text-blue-700 hover:bg-blue-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
          >
            {prompt}
          </button>
        ))}
      </div>

      <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-sm">
        <div className="space-y-3 max-h-72 overflow-y-auto p-4">
          {mensajes.map((msg, i) => (
            <div
              key={i}
              className={`flex gap-2 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              {msg.role === "assistant" && (
                <div className="w-7 h-7 shrink-0 mt-0.5">
                  <FolioAvatar size="sm" />
                </div>
              )}
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm ${
                  msg.role === "user"
                    ? "bg-blue-600 text-white rounded-tr-sm"
                    : "bg-slate-50 text-slate-800 border border-slate-200 rounded-tl-sm"
                }`}
              >
                {msg.role === "assistant" ? (
                  <MensajeContenido content={msg.content} variant="assistant" />
                ) : (
                  <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                )}
              </div>
            </div>
          ))}
          {enviando && (
            <div className="flex gap-2 justify-start">
              <div className="w-7 h-7 shrink-0 mt-0.5">
                <FolioAvatar size="sm" />
              </div>
              <div className="bg-slate-50 border border-slate-200 rounded-2xl rounded-tl-sm px-4 py-2.5">
                <span className="flex gap-1 items-center">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-bounce [animation-delay:0ms]" />
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-bounce [animation-delay:150ms]" />
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-bounce [animation-delay:300ms]" />
                </span>
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {error && (
          <p className="px-4 pb-2 text-xs text-red-600 font-medium">{error}</p>
        )}

        <div className="flex gap-2 p-3 border-t border-slate-200 bg-slate-50">
          <textarea
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                void enviar(texto);
              }
            }}
            placeholder="Escribe tu pregunta sobre libros..."
            rows={2}
            disabled={enviando}
            className="flex-1 resize-none rounded-xl border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-blue-400 disabled:opacity-60"
          />
          <button
            type="button"
            onClick={() => enviar(texto)}
            disabled={enviando || !texto.trim()}
            className="self-end px-4 py-2 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            aria-label="Enviar mensaje"
          >
            <Iconify icon="solar:plain-2-bold" width={20} />
          </button>
        </div>
      </div>
    </div>
  );
}
