"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/services/api.client";
import { reponerPorGenero } from "@/services/inventarios.service";

interface Genero {
  id: number;
  nombre: string;
}

interface Props {
  idTienda: number;
  nombreTienda: string;
  onClose: () => void;
  onRepuesto: () => void;
}

const CloseIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
    <line x1="18" y1="6" x2="6" y2="18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    <line x1="6" y1="6" x2="18" y2="18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

export default function ReponerGeneroModal({ idTienda, nombreTienda, onClose, onRepuesto }: Props) {
  const [generos, setGeneros] = useState<Genero[]>([]);
  const [loadingGeneros, setLoadingGeneros] = useState(true);
  const [idGenero, setIdGenero] = useState<number | "">("");
  const [cantidad, setCantidad] = useState(5);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    apiFetch<Genero[]>("/generos")
      .then(data => setGeneros(data))
      .catch(() => setError("No se pudieron cargar los géneros"))
      .finally(() => setLoadingGeneros(false));
  }, []);

  const handleReponer = async () => {
    if (idGenero === "") { setError("Selecciona un género"); return; }
    if (cantidad < 1) { setError("La cantidad debe ser al menos 1"); return; }
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      await reponerPorGenero(idTienda, Number(idGenero), cantidad);
      setSuccess("Inventario repuesto correctamente.");
      onRepuesto();
    } catch (err: unknown) {
      const msg = err && typeof err === "object" && "message" in err
        ? String((err as { message: unknown }).message)
        : "Error al reponer inventario";
      setError(msg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />
      <div
        className="relative bg-white rounded-2xl shadow-xl w-full max-w-md"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
          <div>
            <h3 className="text-slate-900 font-bold text-lg">Reponer por género</h3>
            <p className="text-slate-500 text-xs mt-0.5">{nombreTienda}</p>
          </div>
          <button
            onClick={onClose}
            className="inline-flex h-8 w-8 items-center justify-center text-slate-400 hover:text-slate-600 transition-colors"
          >
            <CloseIcon />
          </button>
        </div>

        <div className="p-6 flex flex-col gap-4">
          {error && (
            <div className="bg-red-50 border border-red-300 rounded-lg px-4 py-3 text-red-800 text-sm">{error}</div>
          )}
          {success && (
            <div className="bg-emerald-50 border border-emerald-300 rounded-lg px-4 py-3 text-emerald-800 text-sm">{success}</div>
          )}

          <div>
            <label className="block text-slate-700 text-sm font-semibold mb-1.5">Género *</label>
            {loadingGeneros ? (
              <p className="text-slate-500 text-sm">Cargando géneros...</p>
            ) : (
              <select
                value={idGenero}
                onChange={e => setIdGenero(e.target.value === "" ? "" : Number(e.target.value))}
                className="w-full px-3 py-2.5 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
              >
                <option value="">Seleccionar género...</option>
                {generos.map(g => (
                  <option key={g.id} value={g.id}>{g.nombre}</option>
                ))}
              </select>
            )}
          </div>

          <div>
            <label className="block text-slate-700 text-sm font-semibold mb-1.5">Cantidad a agregar por libro *</label>
            <input
              type="number"
              min={1}
              value={cantidad}
              onChange={e => setCantidad(Number(e.target.value))}
              className="w-full px-3 py-2.5 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
            />
            <p className="text-slate-500 text-xs mt-1">
              Se añadirá esta cantidad a cada libro del género en la tienda.
            </p>
          </div>
        </div>

        <div className="flex gap-3 justify-end px-6 py-4 border-t border-slate-100">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-slate-300 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
          >
            Cerrar
          </button>
          <button
            onClick={handleReponer}
            disabled={saving || idGenero === ""}
            className="px-5 py-2 bg-violet-600 text-white rounded-lg text-sm font-semibold hover:bg-violet-700 disabled:opacity-60 transition-colors"
          >
            {saving ? "Reponiendo..." : "Reponer inventario"}
          </button>
        </div>
      </div>
    </div>
  );
}
