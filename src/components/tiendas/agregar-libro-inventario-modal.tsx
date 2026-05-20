"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/services/api.client";
import { crearInventarioLibro } from "@/services/inventarios.service";

interface LibroLite {
  id: string;
  titulo: string;
  isbn: string;
  autor?: { nombre: string };
}

interface Props {
  idTienda: number;
  nombreTienda: string;
  onClose: () => void;
  onAdded: () => void;
}

const CloseIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
    <line x1="18" y1="6" x2="6" y2="18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    <line x1="6" y1="6" x2="18" y2="18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

export default function AgregarLibroInventarioModal({ idTienda, nombreTienda, onClose, onAdded }: Props) {
  const [libros, setLibros] = useState<LibroLite[]>([]);
  const [loadingLibros, setLoadingLibros] = useState(true);
  const [busqueda, setBusqueda] = useState("");
  const [idLibroSeleccionado, setIdLibroSeleccionado] = useState("");
  const [cantidad, setCantidad] = useState(1);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    apiFetch<LibroLite[]>("/libros")
      .then(data => setLibros(data))
      .catch(() => setError("No se pudieron cargar los libros"))
      .finally(() => setLoadingLibros(false));
  }, []);

  const librosFiltrados = libros.filter(l => {
    const q = busqueda.trim().toLowerCase();
    if (!q) return true;
    return (
      l.titulo.toLowerCase().includes(q) ||
      l.isbn.toLowerCase().includes(q) ||
      (l.autor?.nombre ?? "").toLowerCase().includes(q)
    );
  });

  const handleAgregar = async () => {
    if (!idLibroSeleccionado) { setError("Selecciona un libro"); return; }
    if (cantidad < 1) { setError("La cantidad debe ser al menos 1"); return; }
    setSaving(true);
    setError("");
    try {
      await crearInventarioLibro(idTienda, idLibroSeleccionado, cantidad);
      onAdded();
    } catch (err: unknown) {
      const msg = err && typeof err === "object" && "message" in err
        ? String((err as { message: unknown }).message)
        : "Error al agregar el libro";
      setError(msg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />
      <div
        className="relative bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
          <div>
            <h3 className="text-slate-900 font-bold text-lg">Agregar libro al inventario</h3>
            <p className="text-slate-500 text-xs mt-0.5">{nombreTienda}</p>
          </div>
          <button
            onClick={onClose}
            className="inline-flex h-8 w-8 items-center justify-center text-slate-400 hover:text-slate-600 transition-colors"
          >
            <CloseIcon />
          </button>
        </div>

        <div className="p-6 flex flex-col gap-4 flex-1 overflow-y-auto">
          {error && (
            <div className="bg-red-50 border border-red-300 rounded-lg px-4 py-3 text-red-800 text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="block text-slate-700 text-sm font-semibold mb-1.5">Buscar libro</label>
            <input
              type="text"
              value={busqueda}
              onChange={e => setBusqueda(e.target.value)}
              placeholder="Título, ISBN o autor..."
              className="w-full px-3 py-2.5 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
            />
          </div>

          <div>
            <label className="block text-slate-700 text-sm font-semibold mb-1.5">Libro *</label>
            {loadingLibros ? (
              <p className="text-slate-500 text-sm">Cargando libros...</p>
            ) : (
              <select
                value={idLibroSeleccionado}
                onChange={e => setIdLibroSeleccionado(e.target.value)}
                className="w-full px-3 py-2.5 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                size={6}
              >
                <option value="">Seleccionar libro...</option>
                {librosFiltrados.map(l => (
                  <option key={l.id} value={l.id}>
                    {l.titulo}{l.autor ? ` — ${l.autor.nombre}` : ""} ({l.isbn})
                  </option>
                ))}
              </select>
            )}
          </div>

          <div>
            <label className="block text-slate-700 text-sm font-semibold mb-1.5">Cantidad inicial *</label>
            <input
              type="number"
              min={1}
              value={cantidad}
              onChange={e => setCantidad(Number(e.target.value))}
              className="w-full px-3 py-2.5 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
            />
          </div>
        </div>

        <div className="flex gap-3 justify-end px-6 py-4 border-t border-slate-100">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-slate-300 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleAgregar}
            disabled={saving || !idLibroSeleccionado}
            className="px-5 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 disabled:opacity-60 transition-colors"
          >
            {saving ? "Agregando..." : "Agregar libro"}
          </button>
        </div>
      </div>
    </div>
  );
}
