"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Iconify from "@/components/iconify/iconify";
import FloatingBook from "./floating-book";
import ArUnsupportedNotice from "./ar-unsupported-notice";
import { checkArSupport } from "@/lib/ar-support";

interface CameraArViewerProps {
  titulo: string;
  imagenPortada?: string | null;
}

type Status = "idle" | "loading" | "active" | "error" | "unsupported";

interface Pos {
  x: number;
  y: number;
}

const BOOK_BASE_WIDTH = 190;

export default function CameraArViewer({ titulo, imagenPortada }: CameraArViewerProps) {
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [status, setStatus] = useState<Status>("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [bookPos, setBookPos] = useState<Pos>({ x: 0, y: 0 });
  const [scale, setScale] = useState(1);

  // Dragging state (pointer events work for both touch and mouse)
  const dragRef = useRef<{ active: boolean; startX: number; startY: number; origX: number; origY: number }>({
    active: false,
    startX: 0,
    startY: 0,
    origX: 0,
    origY: 0,
  });

  // Pinch-to-zoom state
  const pinchRef = useRef<{ active: boolean; startDist: number; origScale: number }>({
    active: false,
    startDist: 0,
    origScale: 1,
  });

  const stopStream = useCallback(() => {
    streamRef.current?.getTracks().forEach(t => t.stop());
    streamRef.current = null;
  }, []);

  useEffect(() => {
    return () => stopStream();
  }, [stopStream]);

  useEffect(() => {
    const { supported, reason } = checkArSupport();
    if (!supported) {
      setStatus("unsupported");
      setErrorMsg(reason);
    }
  }, []);

  const activateCamera = useCallback(async () => {
    const { supported, reason } = checkArSupport();
    if (!supported) {
      setStatus("unsupported");
      setErrorMsg(reason);
      return;
    }

    if (!navigator.mediaDevices?.getUserMedia) {
      setStatus("error");
      setErrorMsg("Tu navegador no soporta acceso a la cámara. Prueba en Chrome o Safari móvil.");
      return;
    }

    setStatus("loading");
    try {
      // Prefer rear camera on mobile
      let stream: MediaStream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: "environment" }, width: { ideal: 1920 }, height: { ideal: 1080 } },
          audio: false,
        });
      } catch {
        // Fallback: any camera
        stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
      }

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setStatus("active");
    } catch (err: unknown) {
      stopStream();
      if (err instanceof DOMException && err.name === "NotAllowedError") {
        setErrorMsg("Permiso de cámara denegado. Actívalo en la configuración de tu navegador.");
      } else {
        setErrorMsg("No se pudo acceder a la cámara. Asegúrate de estar en HTTPS.");
      }
      setStatus("error");
    }
  }, [stopStream]);

  // ─── Drag handlers ────────────────────────────────────────────────────────
  const onPointerDown = useCallback(
    (e: React.PointerEvent) => {
      // Let touches on the 3D canvas rotate the book (OrbitControls)
      const target = e.target as HTMLElement;
      if (target.closest("[data-ar-book-canvas]")) return;

      if (e.isPrimary) {
        dragRef.current = {
          active: true,
          startX: e.clientX,
          startY: e.clientY,
          origX: bookPos.x,
          origY: bookPos.y,
        };
        (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
      }
    },
    [bookPos],
  );

  const onPointerMove = useCallback((e: React.PointerEvent) => {
    if (!dragRef.current.active || !e.isPrimary) return;
    setBookPos({
      x: dragRef.current.origX + (e.clientX - dragRef.current.startX),
      y: dragRef.current.origY + (e.clientY - dragRef.current.startY),
    });
  }, []);

  const onPointerUp = useCallback(() => {
    dragRef.current.active = false;
  }, []);

  // ─── Touch pinch-to-zoom ──────────────────────────────────────────────────
  const onTouchStart = useCallback(
    (e: React.TouchEvent) => {
      if (e.touches.length === 2) {
        dragRef.current.active = false; // Cancel drag while pinching
        const dist = getTouchDist(e.touches);
        pinchRef.current = { active: true, startDist: dist, origScale: scale };
      }
    },
    [scale],
  );

  const onTouchMove = useCallback((e: React.TouchEvent) => {
    if (!pinchRef.current.active || e.touches.length !== 2) return;
    e.preventDefault();
    const dist = getTouchDist(e.touches);
    const ratio = dist / pinchRef.current.startDist;
    setScale(clamp(pinchRef.current.origScale * ratio, 0.4, 3));
  }, []);

  const onTouchEnd = useCallback(() => {
    pinchRef.current.active = false;
  }, []);

  const bookWidth = Math.round(BOOK_BASE_WIDTH * scale);

  if (status === "unsupported") {
    return (
      <ArUnsupportedNotice
        variant="fullscreen"
        reason={errorMsg}
        backLabel="Volver"
        onBack={() => router.back()}
      />
    );
  }

  return (
    <div className="fixed inset-0 bg-black" style={{ touchAction: "none" }}>
      {/* ── Camera video background ── */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="absolute inset-0 w-full h-full object-cover"
        style={{ zIndex: 0 }}
      />

      {/* ── Gradient overlay at top for readability ── */}
      <div
        className="absolute inset-x-0 top-0 h-28 pointer-events-none"
        style={{
          background: "linear-gradient(to bottom, rgba(0,0,0,0.65) 0%, transparent 100%)",
          zIndex: 10,
        }}
      />

      {/* ── Top bar ── */}
      <div
        className="absolute inset-x-0 top-0 flex items-center gap-3 px-4 pt-safe"
        style={{ zIndex: 20, paddingTop: "env(safe-area-inset-top, 12px)", minHeight: 56 }}
      >
        <button
          onClick={() => {
            stopStream();
            router.back();
          }}
          className="flex items-center justify-center w-10 h-10 rounded-full bg-white/20 backdrop-blur-md text-white hover:bg-white/30 transition-colors"
          aria-label="Volver"
        >
          <Iconify icon="solar:arrow-left-linear" width={22} />
        </button>
        <div className="flex-1 min-w-0">
          <p className="text-white/60 text-xs font-medium uppercase tracking-wider">Vista AR</p>
          <p className="text-white font-semibold text-sm truncate">{titulo}</p>
        </div>
      </div>

      {/* ── Idle: activate camera button ── */}
      {status === "idle" && (
        <div
          className="absolute inset-0 flex flex-col items-center justify-center gap-6 px-8 text-center"
          style={{ zIndex: 15 }}
        >
          <div className="w-20 h-20 rounded-full bg-white/15 backdrop-blur-md flex items-center justify-center">
            <Iconify icon="solar:camera-bold" className="text-white" width={40} />
          </div>
          <div>
            <p className="text-white text-xl font-bold mb-2">Activar cámara</p>
            <p className="text-white/70 text-sm leading-relaxed max-w-xs">
              Apunta tu dispositivo a cualquier superficie y el libro aparecerá sobre la imagen de la cámara.
            </p>
          </div>
          <button
            onClick={() => void activateCamera()}
            className="px-7 py-3.5 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-2xl transition-colors shadow-xl text-sm"
          >
            Activar cámara
          </button>
        </div>
      )}

      {/* ── Loading ── */}
      {status === "loading" && (
        <div
          className="absolute inset-0 flex items-center justify-center"
          style={{ zIndex: 15 }}
        >
          <div className="flex flex-col items-center gap-3">
            <div className="w-10 h-10 border-3 border-white/30 border-t-white rounded-full animate-spin" />
            <p className="text-white/80 text-sm">Iniciando cámara…</p>
          </div>
        </div>
      )}

      {/* ── Error: fallback view (book on gradient bg) ── */}
      {status === "error" && (
        <div
          className="absolute inset-0 flex flex-col items-center justify-center gap-6 px-8 text-center"
          style={{
            zIndex: 15,
            background: "radial-gradient(ellipse at center, #1e3a5f 0%, #0a0f1e 100%)",
          }}
        >
          <FloatingBook titulo={titulo} imagenPortada={imagenPortada} width={bookWidth} />
          <div className="mt-4">
            <p className="text-amber-400 text-sm font-semibold mb-1">Sin acceso a la cámara</p>
            <p className="text-white/60 text-xs leading-relaxed max-w-xs">{errorMsg}</p>
          </div>
          <button
            onClick={() => {
              setStatus("idle");
              setErrorMsg("");
            }}
            className="px-5 py-2.5 bg-white/15 hover:bg-white/25 text-white text-sm font-medium rounded-xl transition-colors"
          >
            Reintentar
          </button>
        </div>
      )}

      {/* ── Active AR: book overlay ── */}
      {status === "active" && (
        <div
          className="absolute inset-0 overflow-hidden"
          style={{ zIndex: 15 }}
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
        >
          {/* Draggable book */}
          <div
            style={{
              position: "absolute",
              left: "50%",
              top: "50%",
              transform: `translate(calc(-50% + ${bookPos.x}px), calc(-50% + ${bookPos.y}px))`,
              cursor: "grab",
              userSelect: "none",
              touchAction: "none",
              padding: 36,
              margin: -36,
            }}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerCancel={onPointerUp}
          >
            <FloatingBook titulo={titulo} imagenPortada={imagenPortada} width={bookWidth} />
          </div>

          {/* Scale controls */}
          <div
            className="absolute bottom-10 right-5 flex flex-col gap-2"
            style={{ zIndex: 30 }}
          >
            <button
              onClick={() => setScale(s => clamp(s + 0.15, 0.4, 3))}
              className="w-11 h-11 rounded-full bg-white/20 backdrop-blur-md text-white flex items-center justify-center hover:bg-white/30 transition-colors shadow"
              aria-label="Acercar"
            >
              <Iconify icon="solar:add-circle-linear" width={22} />
            </button>
            <button
              onClick={() => setScale(s => clamp(s - 0.15, 0.4, 3))}
              className="w-11 h-11 rounded-full bg-white/20 backdrop-blur-md text-white flex items-center justify-center hover:bg-white/30 transition-colors shadow"
              aria-label="Alejar"
            >
              <Iconify icon="solar:minus-circle-linear" width={22} />
            </button>
            <button
              onClick={() => {
                setBookPos({ x: 0, y: 0 });
                setScale(1);
              }}
              className="w-11 h-11 rounded-full bg-white/20 backdrop-blur-md text-white flex items-center justify-center hover:bg-white/30 transition-colors shadow"
              aria-label="Restablecer posición"
            >
              <Iconify icon="solar:restart-linear" width={20} />
            </button>
          </div>

          {/* Hint label */}
          <div
            className="absolute bottom-10 left-5 max-w-[160px]"
            style={{ zIndex: 30 }}
          >
            <p className="text-white/50 text-xs leading-snug">
              Toca el libro para girarlo · Arrastra fuera para mover · +/− para escalar
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

function getTouchDist(touches: React.TouchList): number {
  const dx = touches[0].clientX - touches[1].clientX;
  const dy = touches[0].clientY - touches[1].clientY;
  return Math.sqrt(dx * dx + dy * dy);
}

function clamp(val: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, val));
}
