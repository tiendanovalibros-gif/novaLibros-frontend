"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import Iconify from "@/components/iconify/iconify";

export default function NotFound() {
  const router = useRouter();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-4">
      {/* Contenedor principal */}
      <div className="w-full max-w-md">
        {/* Header con logo/título */}
        <div className="mb-12 text-center">
          <div className="mb-4 inline-flex items-center gap-2">
            <Iconify icon="solar:book-2-bold-duotone" className="text-blue-600" width={32} />
            <span className="text-2xl font-bold text-slate-900">NovaLibros</span>
          </div>
        </div>

        {/* Card principal */}
        <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
          {/* Icono de error */}
          <div className="mb-6 flex justify-center">
            <div className="rounded-full bg-blue-50 p-6">
              <Iconify icon="solar:sad-circle-broken" className="text-blue-600" width={64} />
            </div>
          </div>

          {/* Error 404 */}
          <div className="mb-6 text-center">
            <h1 className="mb-2 text-6xl font-bold text-slate-900">404</h1>
            <h2 className="mb-3 text-xl font-semibold text-slate-700">Página no encontrada</h2>
            <p className="text-sm text-slate-600">
              La página que buscas no existe o fue movida a otra ubicación.
            </p>
          </div>

          {/* Botones */}
          <div className="space-y-3">
            <Link
              href="/"
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-3 text-[15px] font-semibold text-white transition-colors hover:bg-blue-700"
            >
              <Iconify icon="material-symbols:home-outline-rounded" width={20} />
              Volver al inicio
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
