"use client";

import { useState } from "react";
import Iconify from "@/components/iconify/iconify";
import type { Preferencia } from "@/services/recomendaciones.service";

export const GENEROS_PREFERENCIAS = [
  "Ficcion", "No ficcion", "Ciencia ficcion", "Fantasy", "Romance",
  "Thriller", "Terror", "Historia", "Biografia", "Autoayuda",
  "Ciencia", "Filosofia", "Poesia", "Infantil", "Juvenil",
  "Misterio", "Novela", "Tecnologia",
];

interface Props {
  preferencias: Preferencia[];
  onClose: () => void;
  onSave: (nombres: string[]) => Promise<void>;
}

export default function PreferenciasModal({ preferencias, onClose, onSave }: Props) {
  const [seleccionados, setSeleccionados] = useState<string[]>(
    preferencias.map((p) => p.nombre),
  );
  const [guardando, setGuardando] = useState(false);

  function toggle(nombre: string) {
    setSeleccionados((prev) =>
      prev.includes(nombre) ? prev.filter((n) => n !== nombre) : [...prev, nombre],
    );
  }

  async function guardar() {
    setGuardando(true);
    try {
      await onSave(seleccionados);
      onClose();
    } finally {
      setGuardando(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-slate-900">Mis géneros favoritos</h3>
            <p className="text-sm text-slate-500">Selecciona los que más te gustan</p>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-1.5 text-slate-500 hover:bg-slate-100 transition-colors"
          >
            <Iconify icon="mingcute:close-line" width={20} />
          </button>
        </div>

        <div className="flex flex-wrap gap-2">
          {GENEROS_PREFERENCIAS.map((nombre) => {
            const activo = seleccionados.includes(nombre);
            return (
              <button
                key={nombre}
                type="button"
                onClick={() => toggle(nombre)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                  activo
                    ? "bg-blue-600 text-white border-blue-600"
                    : "bg-white text-slate-700 border-slate-300 hover:border-blue-400 hover:text-blue-600"
                }`}
              >
                {nombre}
              </button>
            );
          })}
        </div>

        <div className="flex gap-3 pt-1">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl border border-slate-300 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={guardar}
            disabled={guardando}
            className="flex-1 py-2.5 rounded-xl bg-blue-600 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60 transition-colors"
          >
            {guardando ? "Guardando..." : "Guardar"}
          </button>
        </div>
      </div>
    </div>
  );
}
