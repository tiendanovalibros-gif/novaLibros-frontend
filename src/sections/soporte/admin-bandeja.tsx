"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Iconify from "@/components/iconify/iconify";
import { listarTodosLosForos, type ForoResumen } from "@/services/foros.service";

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

interface Props {
  chatHref: (id: number) => string;
}

export default function AdminBandeja({ chatHref }: Props) {
  const [foros, setForos] = useState<ForoResumen[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busqueda, setBusqueda] = useState("");

  const cargar = useCallback(async () => {
    try {
      const data = await listarTodosLosForos();
      setForos(data);
    } catch {
      setError("No se pudieron cargar los chats de soporte.");
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    void cargar();
  }, [cargar]);

  const forosFiltrados = foros.filter((f) => {
    const q = busqueda.toLowerCase();
    return (
      f.titulo.toLowerCase().includes(q) ||
      `${f.usuarioCreador.nombre} ${f.usuarioCreador.apellido}`
        .toLowerCase()
        .includes(q)
    );
  });

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Bandeja de soporte</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            {foros.length} conversaciones de clientes
          </p>
        </div>
        <button
          onClick={() => void cargar()}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
        >
          <Iconify icon="solar:refresh-bold" width={14} />
          Actualizar
        </button>
      </div>

      <div className="relative">
        <Iconify
          icon="solar:magnifer-linear"
          width={16}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
        />
        <input
          type="text"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          placeholder="Buscar por asunto o cliente…"
          className="w-full pl-9 pr-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {cargando ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 rounded-xl bg-slate-100 animate-pulse" />
          ))}
        </div>
      ) : error ? (
        <div className="text-center py-12 text-slate-500">
          <Iconify icon="solar:danger-circle-bold" width={32} className="mx-auto mb-2 text-red-400" />
          <p>{error}</p>
        </div>
      ) : forosFiltrados.length === 0 ? (
        <div className="text-center py-16 text-slate-400 space-y-2">
          <Iconify icon="solar:inbox-bold" width={40} className="mx-auto" />
          <p className="text-sm">
            {busqueda ? "Sin resultados para esa búsqueda." : "No hay conversaciones aún."}
          </p>
        </div>
      ) : (
        <ul className="space-y-2">
          {forosFiltrados.map((foro) => {
            const ultimo = foro.mensajes[0];
            const esStaff =
              ultimo &&
              (ultimo.remitente.rol === "administrador" ||
                ultimo.remitente.rol === "root");
            return (
              <li key={foro.id}>
                <Link
                  href={chatHref(foro.id)}
                  className="flex items-start gap-4 bg-white border border-slate-200 rounded-xl px-5 py-4 hover:border-blue-300 hover:shadow-sm transition-all group"
                >
                  <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-sm shrink-0">
                    {foro.usuarioCreador.nombre.charAt(0).toUpperCase()}
                    {foro.usuarioCreador.apellido.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-900 truncate group-hover:text-blue-700 transition-colors">
                        {foro.titulo}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {foro.usuarioCreador.nombre} {foro.usuarioCreador.apellido}
                    </p>
                    {ultimo && (
                      <p className="text-sm text-slate-500 truncate mt-1">
                        <span className="font-medium text-slate-600">
                          {esStaff ? "Soporte" : "Cliente"}:
                        </span>{" "}
                        {ultimo.contenido}
                      </p>
                    )}
                  </div>
                  <div className="flex flex-col items-end gap-1 shrink-0">
                    <span className="text-xs text-slate-400">
                      {formatRelativeDate(foro.fechaActualizacion)}
                    </span>
                    <span className="text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">
                      {foro._count.mensajes}
                    </span>
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
