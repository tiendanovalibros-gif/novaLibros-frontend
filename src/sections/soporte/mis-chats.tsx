"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Iconify from "@/components/iconify/iconify";
import {
  crearMiForo,
  listarMisForos,
  type ForoResumen,
} from "@/services/foros.service";

function formatRelativeDate(iso: string) {
  const date = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return "Ahora mismo";
  if (diffMins < 60) return `Hace ${diffMins} min`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `Hace ${diffHours} h`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `Hace ${diffDays} d`;
  return date.toLocaleDateString("es-ES", { day: "numeric", month: "short" });
}

export default function MisChats() {
  const [foros, setForos] = useState<ForoResumen[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [nuevoTitulo, setNuevoTitulo] = useState("");
  const [nuevoContenido, setNuevoContenido] = useState("");
  const [creando, setCreando] = useState(false);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [errorCrear, setErrorCrear] = useState<string | null>(null);

  const cargar = useCallback(async () => {
    try {
      const data = await listarMisForos();
      setForos(data);
    } catch {
      setError("No se pudieron cargar los chats.");
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    void cargar();
  }, [cargar]);

  const handleCrear = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nuevoTitulo.trim()) return;
    setCreando(true);
    setErrorCrear(null);
    try {
      await crearMiForo(nuevoTitulo.trim(), nuevoContenido.trim() || undefined);
      setNuevoTitulo("");
      setNuevoContenido("");
      setMostrarFormulario(false);
      await cargar();
    } catch {
      setErrorCrear("No se pudo crear el chat. Intenta de nuevo.");
    } finally {
      setCreando(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Soporte</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Tus conversaciones con el equipo de NovaLibros
          </p>
        </div>
        <button
          onClick={() => setMostrarFormulario((v) => !v)}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition-colors"
        >
          <Iconify icon="solar:chat-round-line-bold" width={16} />
          Nuevo chat
        </button>
      </div>

      {mostrarFormulario && (
        <form
          onSubmit={handleCrear}
          className="bg-white border border-slate-200 rounded-xl p-5 space-y-3 shadow-sm"
        >
          <h2 className="text-base font-semibold text-slate-800">Abrir nuevo chat</h2>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">
              Asunto <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={nuevoTitulo}
              onChange={(e) => setNuevoTitulo(e.target.value)}
              placeholder="Ej. Consulta sobre mi pedido"
              maxLength={120}
              required
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">
              Mensaje inicial (opcional)
            </label>
            <textarea
              value={nuevoContenido}
              onChange={(e) => setNuevoContenido(e.target.value)}
              placeholder="Describe brevemente tu consulta..."
              rows={3}
              maxLength={2000}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>
          {errorCrear && (
            <p className="text-xs text-red-600">{errorCrear}</p>
          )}
          <div className="flex gap-2 justify-end">
            <button
              type="button"
              onClick={() => setMostrarFormulario(false)}
              className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={creando || !nuevoTitulo.trim()}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-semibold rounded-lg transition-colors"
            >
              {creando ? "Creando..." : "Abrir chat"}
            </button>
          </div>
        </form>
      )}

      {cargando ? (
        <div className="space-y-3">
          {[1, 2].map((i) => (
            <div key={i} className="h-20 rounded-xl bg-slate-100 animate-pulse" />
          ))}
        </div>
      ) : error ? (
        <div className="text-center py-12 text-slate-500">
          <Iconify icon="solar:danger-circle-bold" width={32} className="mx-auto mb-2 text-red-400" />
          <p>{error}</p>
        </div>
      ) : foros.length === 0 ? (
        <div className="text-center py-16 text-slate-400 space-y-2">
          <Iconify icon="solar:chat-round-dots-bold" width={40} className="mx-auto" />
          <p className="text-sm">Aún no tienes chats abiertos.</p>
          <p className="text-xs">Haz clic en "Nuevo chat" para contactar al equipo de soporte.</p>
        </div>
      ) : (
        <ul className="space-y-3">
          {foros.map((foro) => {
            const ultimoMensaje = foro.mensajes[0];
            return (
              <li key={foro.id}>
                <Link
                  href={`/soporte/${foro.id}`}
                  className="block bg-white border border-slate-200 rounded-xl px-5 py-4 hover:border-blue-300 hover:shadow-sm transition-all group"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-slate-900 truncate group-hover:text-blue-700 transition-colors">
                        {foro.titulo}
                      </p>
                      {ultimoMensaje ? (
                        <p className="text-sm text-slate-500 truncate mt-0.5">
                          <span className="font-medium text-slate-600">
                            {ultimoMensaje.remitente.rol === "cliente" ? "Tú" : "Soporte"}:
                          </span>{" "}
                          {ultimoMensaje.contenido}
                        </p>
                      ) : (
                        <p className="text-sm text-slate-400 mt-0.5 italic">Sin mensajes</p>
                      )}
                    </div>
                    <div className="flex flex-col items-end gap-1 shrink-0">
                      <span className="text-xs text-slate-400">
                        {formatRelativeDate(foro.fechaActualizacion)}
                      </span>
                      <span className="text-xs text-slate-400">
                        {foro._count.mensajes} msg
                      </span>
                    </div>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
