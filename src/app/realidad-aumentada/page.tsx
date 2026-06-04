"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { apiFetch } from "@/services/api.client";
import { coverColor, coverLetter, getBookCoverUrl } from "@/lib/book-cover";
import Iconify from "@/components/iconify/iconify";

interface Libro {
  id: string;
  titulo: string;
  idAutor: number;
  precio: number;
  imagenPortada?: string;
  estado: string;
}

function BookCoverThumb({ libro }: { libro: Libro }) {
  const [imgError, setImgError] = useState(false);
  const coverUrl = getBookCoverUrl(libro.imagenPortada);
  const showImg = !!coverUrl && !imgError;
  const bg = coverColor(libro.titulo);
  const letter = coverLetter(libro.titulo);

  if (showImg) {
    return (
      <img
        src={coverUrl}
        alt={`Portada de ${libro.titulo}`}
        onError={() => setImgError(true)}
        className="w-full h-full object-cover"
      />
    );
  }

  return (
    <div
      className="w-full h-full flex flex-col items-center justify-center p-3"
      style={{ background: bg }}
    >
      <span className="text-5xl font-bold text-white/90 leading-none">{letter}</span>
      <span className="mt-2 text-[10px] font-semibold text-white/70 text-center leading-tight line-clamp-2">
        {libro.titulo}
      </span>
    </div>
  );
}

export default function RealidadAumentadaPage() {
  const [libros, setLibros] = useState<Libro[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [busqueda, setBusqueda] = useState("");

  useEffect(() => {
    apiFetch<Libro[]>("/libros")
      .then(data => setLibros(data))
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  const librosFiltrados = busqueda.trim()
    ? libros.filter(l => l.titulo.toLowerCase().includes(busqueda.toLowerCase()))
    : libros;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {/* ── Header section ── */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center shrink-0">
            <Iconify icon="solar:camera-bold" className="text-white" width={22} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Realidad aumentada</h1>
            <p className="text-slate-500 text-sm">Visualiza los libros a través de la cámara de tu dispositivo</p>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 flex items-start gap-3">
          <Iconify icon="solar:info-circle-linear" className="text-blue-500 mt-0.5 shrink-0" width={18} />
          <p className="text-blue-800 text-sm leading-relaxed">
            Selecciona un libro y concede acceso a la cámara para ver el libro flotando sobre el mundo real.
            Funciona mejor en <strong>Chrome o Safari</strong> móvil, con conexión <strong>HTTPS</strong>.
          </p>
        </div>
      </div>

      {/* ── Search ── */}
      <div className="mb-6">
        <div className="relative max-w-sm">
          <Iconify
            icon="solar:magnifer-linear"
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            width={18}
          />
          <input
            type="text"
            placeholder="Buscar libro…"
            value={busqueda}
            onChange={e => setBusqueda(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* ── States ── */}
      {loading && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="rounded-xl overflow-hidden border border-slate-200 animate-pulse">
              <div className="aspect-[2/3] bg-slate-200" />
              <div className="p-3 space-y-2">
                <div className="h-3.5 bg-slate-200 rounded w-4/5" />
                <div className="h-3 bg-slate-100 rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      )}

      {error && (
        <div className="text-center py-16">
          <Iconify icon="solar:sad-circle-linear" className="text-slate-400 mx-auto mb-3" width={48} />
          <p className="text-slate-600 font-medium">No se pudieron cargar los libros</p>
          <p className="text-slate-400 text-sm mt-1">Comprueba tu conexión e inténtalo de nuevo.</p>
        </div>
      )}

      {!loading && !error && librosFiltrados.length === 0 && (
        <div className="text-center py-16">
          <Iconify icon="solar:book-2-linear" className="text-slate-300 mx-auto mb-3" width={48} />
          <p className="text-slate-500 font-medium">Sin resultados para «{busqueda}»</p>
        </div>
      )}

      {/* ── Book grid ── */}
      {!loading && !error && librosFiltrados.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {librosFiltrados.map(libro => (
            <Link
              key={libro.id}
              href={`/realidad-aumentada/${libro.id}`}
              className="group rounded-xl overflow-hidden border border-slate-200 bg-white shadow-sm hover:shadow-md hover:border-blue-300 transition-all duration-200"
            >
              <div className="aspect-[2/3] overflow-hidden relative">
                <BookCoverThumb libro={libro} />
                {/* AR badge */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity w-12 h-12 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-lg">
                    <Iconify icon="solar:camera-bold" className="text-blue-600" width={24} />
                  </div>
                </div>
              </div>
              <div className="p-3">
                <p className="text-slate-800 text-xs font-semibold leading-tight line-clamp-2 mb-1">
                  {libro.titulo}
                </p>
                <span
                  className={`inline-block text-[10px] font-bold px-1.5 py-0.5 rounded-md border ${
                    libro.estado === "nuevo"
                      ? "bg-green-50 text-green-700 border-green-300"
                      : "bg-amber-50 text-amber-700 border-amber-300"
                  }`}
                >
                  {libro.estado}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
