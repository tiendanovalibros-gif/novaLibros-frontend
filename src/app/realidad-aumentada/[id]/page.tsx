"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { apiFetch } from "@/services/api.client";
import Iconify from "@/components/iconify/iconify";
import ArUnsupportedNotice from "@/components/ar/ar-unsupported-notice";
import { useArSupport } from "@/hooks/use-ar-support";

// Load the camera viewer only on the client — it relies on browser APIs
const CameraArViewer = dynamic(() => import("@/components/ar/camera-ar-viewer"), { ssr: false });

interface Libro {
  id: string;
  titulo: string;
  imagenPortada?: string;
}

export default function ArViewerPage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const { loading: checkingAr, supported, reason } = useArSupport();
  const [libro, setLibro] = useState<Libro | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!id) return;
    apiFetch<Libro>(`/libros/${id}`)
      .then(data => setLibro(data))
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [id]);

  if (checkingAr) {
    return (
      <div className="fixed inset-0 bg-slate-950 flex items-center justify-center">
        <div className="w-10 h-10 border-[3px] border-white/30 border-t-white rounded-full animate-spin" />
      </div>
    );
  }

  if (!supported) {
    return (
      <ArUnsupportedNotice
        variant="fullscreen"
        reason={reason}
        backHref="/realidad-aumentada"
        backLabel="Volver al catálogo AR"
        onBack={() => router.back()}
      />
    );
  }

  if (loading) {
    return (
      <div className="fixed inset-0 bg-slate-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-[3px] border-white/30 border-t-white rounded-full animate-spin" />
          <p className="text-white/60 text-sm">Cargando libro…</p>
        </div>
      </div>
    );
  }

  if (error || !libro) {
    return (
      <div className="fixed inset-0 bg-slate-950 flex flex-col items-center justify-center gap-4 px-8 text-center">
        <Iconify icon="solar:sad-circle-linear" className="text-white/40" width={48} />
        <p className="text-white font-semibold">No se encontró el libro</p>
        <a
          href="/realidad-aumentada"
          className="px-5 py-2.5 bg-white/15 hover:bg-white/25 text-white text-sm font-medium rounded-xl transition-colors"
        >
          Volver al catálogo AR
        </a>
      </div>
    );
  }

  return (
    <CameraArViewer
      titulo={libro.titulo}
      imagenPortada={libro.imagenPortada}
    />
  );
}
