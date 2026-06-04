"use client";

import { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { getBookCoverTextureUrl } from "@/lib/book-cover";
import Book3DModel from "./book-3d-model";

interface FloatingBookProps {
  titulo: string;
  imagenPortada?: string | null;
  /** Approximate width of the canvas in px */
  width?: number;
  autoRotate?: boolean;
}

export default function FloatingBook({
  titulo,
  imagenPortada,
  width = 180,
  autoRotate = true,
}: FloatingBookProps) {
  const height = Math.round(width * 1.55);
  const coverUrl = getBookCoverTextureUrl(imagenPortada);

  return (
    <div
      style={{
        width,
        height,
        filter: "drop-shadow(0 20px 36px rgba(0,0,0,0.5))",
      }}
      data-ar-book-canvas
    >
      <Canvas
        camera={{ position: [0, 0.1, 3.8], fov: 42 }}
        gl={{ alpha: true, antialias: true, preserveDrawingBuffer: true }}
        style={{ width: "100%", height: "100%", touchAction: "none" }}
        dpr={[1, 2]}
      >
        <Suspense fallback={null}>
          <Book3DModel titulo={titulo} coverUrl={coverUrl} autoRotate={autoRotate} />
        </Suspense>
      </Canvas>
    </div>
  );
}
