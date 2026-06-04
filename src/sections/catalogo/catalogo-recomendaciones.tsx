"use client";

import { useState, useEffect, useCallback } from "react";
import Iconify from "@/components/iconify/iconify";
import PreferenciasModal from "@/components/recomendaciones/preferencias-modal";
import {
  getRecomendaciones,
  getMisPreferencias,
  syncPreferencias,
  type SeccionRecomendacion,
  type Preferencia,
} from "@/services/recomendaciones.service";

export interface LibroCatalogo {
  id: string;
  titulo: string;
  idAutor: number;
  idGenero: number;
  idEditorial: number;
  anoPublicacion: number;
  precio: number;
  isbn: string;
  idioma: string;
  descripcion?: string;
  imagenPortada?: string;
  estado: string;
}

function mapLibroRecomendado(libro: any): LibroCatalogo {
  return {
    id: libro.id,
    titulo: libro.titulo,
    idAutor: libro.autor?.id ?? libro.idAutor ?? 0,
    idGenero: libro.idGenero ?? libro.idGeneros?.[0] ?? libro.generos?.[0]?.idGenero ?? 0,
    idEditorial: libro.editorial?.id ?? libro.idEditorial ?? 0,
    anoPublicacion: libro.anoPublicacion ?? 0,
    precio: Number(libro.precio),
    isbn: libro.isbn ?? "",
    idioma: libro.idioma ?? "es",
    descripcion: libro.descripcion,
    imagenPortada: libro.imagenPortada,
    estado: libro.estado ?? "usado",
  };
}

interface Props {
  visible: boolean;
  renderBookCard: (libro: LibroCatalogo) => React.ReactNode;
}

export default function CatalogoRecomendaciones({ visible, renderBookCard }: Props) {
  const [secciones, setSecciones] = useState<SeccionRecomendacion[]>([]);
  const [preferencias, setPreferencias] = useState<Preferencia[]>([]);
  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [modalAbierto, setModalAbierto] = useState(false);

  const cargar = useCallback(async () => {
    setLoading(true);
    try {
      const [rec, prefs] = await Promise.all([
        getRecomendaciones(),
        getMisPreferencias(),
      ]);
      setSecciones(rec.secciones ?? []);
      setPreferencias(prefs);
      setLoaded(true);
    } catch {
      setSecciones([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!visible) {
      setSecciones([]);
      setPreferencias([]);
      setLoaded(false);
      return;
    }
    void cargar();
  }, [visible, cargar]);

  useEffect(() => {
    if (!visible || typeof window === "undefined") return;
    if (window.location.hash === "#preferencias") {
      setModalAbierto(true);
    }
  }, [visible]);

  if (!visible) return null;

  const tieneLibros = secciones.some((s) => s.libros.length > 0);

  async function guardarPreferencias(nombres: string[]) {
    const actualizadas = await syncPreferencias(nombres);
    setPreferencias(actualizadas);
    await cargar();
  }

  return (
    <section id="preferencias" className="mb-10 space-y-6 scroll-mt-24">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Iconify icon="solar:star-bold-duotone" className="text-amber-500" width={22} />
            <h2 className="text-lg sm:text-xl font-bold text-slate-900">Recomendaciones para ti</h2>
          </div>
          <p className="text-sm text-slate-500">
            Basado en tus gustos, historial y búsquedas recientes
          </p>
        </div>
        <button
          type="button"
          onClick={() => setModalAbierto(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-300 bg-white text-sm font-semibold text-slate-700 hover:bg-slate-50 shadow-sm transition-colors shrink-0 self-start sm:self-auto"
        >
          <Iconify icon="solar:heart-bold-duotone" className="text-rose-500" width={18} />
          {preferencias.length > 0
            ? `Preferencias (${preferencias.length})`
            : "Configurar preferencias"}
        </button>
      </div>

      {preferencias.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {preferencias.map((p) => (
            <span
              key={p.id}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold border border-blue-200"
            >
              <Iconify icon="solar:bookmark-bold" width={12} />
              {p.nombre}
            </span>
          ))}
        </div>
      )}

      {loading && (
        <div className="py-10 text-center text-slate-500 text-sm">Cargando recomendaciones...</div>
      )}

      {!loading && loaded && !tieneLibros && (
        <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-8 text-center">
          <p className="text-sm font-medium text-slate-700">
            Configura tus preferencias para ver sugerencias personalizadas
          </p>
          <button
            type="button"
            onClick={() => setModalAbierto(true)}
            className="inline-block mt-3 text-sm font-semibold text-blue-600 hover:text-blue-700"
          >
            Configurar preferencias
          </button>
        </div>
      )}

      {!loading &&
        secciones.map((sec, i) =>
          sec.libros.length > 0 ? (
            <div key={i} className="space-y-3">
              <p className="text-sm font-semibold text-slate-700">{sec.motivo}</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
                {sec.libros.map((libro) => (
                  <div key={libro.id}>{renderBookCard(mapLibroRecomendado(libro))}</div>
                ))}
              </div>
            </div>
          ) : null,
        )}

      <div className="pt-2 border-b border-slate-200" />

      {modalAbierto && (
        <PreferenciasModal
          preferencias={preferencias}
          onClose={() => setModalAbierto(false)}
          onSave={guardarPreferencias}
        />
      )}
    </section>
  );
}
