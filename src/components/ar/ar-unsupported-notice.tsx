"use client";

import Link from "next/link";
import Iconify from "@/components/iconify/iconify";

interface Props {
  reason: string;
  /** Pantalla completa (visor AR) o bloque en página con layout */
  variant?: "fullscreen" | "inline";
  backHref?: string;
  backLabel?: string;
  onBack?: () => void;
}

export default function ArUnsupportedNotice({
  reason,
  variant = "inline",
  backHref = "/",
  backLabel = "Volver",
  onBack,
}: Props) {
  const content = (
    <>
      <div className="w-16 h-16 rounded-2xl bg-amber-100 flex items-center justify-center shrink-0">
        <Iconify icon="solar:smartphone-2-linear" className="text-amber-600" width={32} />
      </div>
      <div className="text-center max-w-md">
        <h2 className="text-lg font-bold text-slate-900 mb-2">
          Realidad aumentada no disponible
        </h2>
        <p className="text-sm text-slate-600 leading-relaxed">{reason}</p>
        <p className="text-xs text-slate-500 mt-3 leading-relaxed">
          Funciona mejor en móvil con Chrome o Safari, con permiso de cámara y conexión HTTPS.
        </p>
      </div>
      {onBack ? (
        <button
          type="button"
          onClick={onBack}
          className="mt-2 px-5 py-2.5 bg-slate-800 hover:bg-slate-900 text-white text-sm font-semibold rounded-xl transition-colors"
        >
          {backLabel}
        </button>
      ) : (
        <Link
          href={backHref}
          className="mt-2 px-5 py-2.5 bg-slate-800 hover:bg-slate-900 text-white text-sm font-semibold rounded-xl transition-colors"
        >
          {backLabel}
        </Link>
      )}
    </>
  );

  if (variant === "fullscreen") {
    return (
      <div className="fixed inset-0 bg-slate-950 flex flex-col items-center justify-center gap-6 px-8">
        <div className="flex flex-col items-center gap-5">{content}</div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-amber-200 bg-amber-50 px-5 py-6 flex flex-col items-center gap-4">
      {content}
    </div>
  );
}
