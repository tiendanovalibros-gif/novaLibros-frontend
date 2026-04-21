"use client";

import { useState, useMemo } from "react";
import Iconify from "@/components/iconify/iconify";
import { useLibros } from "@/context/libros.context";

interface Libro {
  id: string;
  titulo: string;
  idAutor: number;
  precio: number;
  isbn?: string;
  descripcion?: string;
}

const generarColorPortada = (titulo: string) => {
  const colors = [
    "#3B82F6",
    "#EF4444",
    "#10B981",
    "#F59E0B",
    "#8B5CF6",
    "#06B6D4",
    "#84CC16",
    "#F97316",
  ];
  const index = titulo.length % colors.length;
  return colors[index];
};

const generarLetraPortada = (titulo: string) => {
  return titulo.charAt(0).toUpperCase();
};

const formatearPrecio = (precio: number): string => {
  return precio.toLocaleString("es-CO", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
};

export default function SearchBar() {
  const [inputBusqueda, setInputBusqueda] = useState("");
  const { libros, getNombreAutor } = useLibros();

  const sugerencias = useMemo(() => {
    if (inputBusqueda.trim().length < 2) return [];

    const q = inputBusqueda.toLowerCase().trim();
    const filtered = libros.filter(
      l =>
        l.titulo.toLowerCase().includes(q) ||
        getNombreAutor(l.idAutor).toLowerCase().includes(q) ||
        (l.isbn && l.isbn.toLowerCase().includes(q)) ||
        (l.descripcion && l.descripcion.toLowerCase().includes(q))
    );

    // Prioridad: coincidencias exactas en título primero
    filtered.sort((a, b) => {
      const aTitle = a.titulo.toLowerCase().includes(q) ? 0 : 1;
      const bTitle = b.titulo.toLowerCase().includes(q) ? 0 : 1;
      return aTitle - bTitle || a.titulo.localeCompare(b.titulo);
    });

    return filtered.slice(0, 8);
  }, [inputBusqueda, libros, getNombreAutor]);

  const handleSugerenciaClick = (libroId: string, libroTitulo: string) => {
    setInputBusqueda("");
    // Navegar al libro
    window.location.href = `/books/${libroId}`;
  };

  return (
    <div className="flex-1 max-w-sm hidden sm:block">
      <div className="relative">
        <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
          <Iconify icon="material-symbols:search-rounded" width={22} className="text-slate-400" />
        </div>
        <input
          type="text"
          value={inputBusqueda}
          onChange={e => {
            setInputBusqueda(e.target.value);
          }}
          placeholder="Buscar libros, autores..."
          className="w-full pl-11 pr-4 py-2 rounded-2xl text-sm text-slate-900 bg-slate-100 outline-none focus:ring-2 focus:ring-blue-400 focus:bg-white transition-all"
        />

        {/* Sugerencias inteligentes (dropdown) */}
        {inputBusqueda.trim().length >= 2 && sugerencias.length > 0 && (
          <div className="absolute top-[calc(100%+8px)] left-0 right-0 bg-white border border-slate-200 rounded-3xl shadow-2xl max-h-80 overflow-auto z-[60] py-2">
            {sugerencias.map(libro => (
              <div
                key={libro.id}
                onClick={() => handleSugerenciaClick(libro.id, libro.titulo)}
                className="px-5 py-3 hover:bg-slate-100 cursor-pointer flex items-center gap-4 border-b border-slate-100 last:border-none"
              >
                {/* Mini portada */}
                <div
                  className="w-10 h-14 flex-shrink-0 rounded-2xl overflow-hidden flex items-center justify-center text-xs font-bold text-white/70 shadow-inner"
                  style={{ backgroundColor: generarColorPortada(libro.titulo) }}
                >
                  {generarLetraPortada(libro.titulo)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-slate-900 line-clamp-1">{libro.titulo}</p>
                  <p className="text-xs text-slate-500">{getNombreAutor(libro.idAutor)}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-blue-600">${formatearPrecio(libro.precio)}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
