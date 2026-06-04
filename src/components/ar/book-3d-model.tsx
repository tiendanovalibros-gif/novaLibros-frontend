"use client";

import { useEffect, useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import { coverColor } from "@/lib/book-cover";
import { loadCoverTexture } from "@/lib/load-cover-texture";

const BOOK_W = 1.35;
const BOOK_H = 2.0;
const BOOK_D = 0.28;

interface Book3DModelProps {
  titulo: string;
  coverUrl: string | null;
  autoRotate?: boolean;
}

function hexToColor(hex: string): THREE.Color {
  const n = parseInt(hex.replace("#", ""), 16);
  return new THREE.Color((n >> 16) / 255, ((n >> 8) & 0xff) / 255, (n & 0xff) / 255);
}

function shadeHex(hex: string, amount: number): string {
  const n = parseInt(hex.replace("#", ""), 16);
  const r = Math.min(255, Math.max(0, (n >> 16) + amount));
  const g = Math.min(255, Math.max(0, ((n >> 8) & 0xff) + amount));
  const b = Math.min(255, Math.max(0, (n & 0xff) + amount));
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, "0")}`;
}

export default function Book3DModel({ titulo, coverUrl, autoRotate = true }: Book3DModelProps) {
  const groupRef = useRef<THREE.Group>(null);
  const coverMatRef = useRef<THREE.MeshStandardMaterial>(null);
  const [coverTexture, setCoverTexture] = useState<THREE.Texture | null>(null);

  const bg = coverColor(titulo);
  const spineColor = hexToColor(shadeHex(bg, -40));
  const backColor = hexToColor(shadeHex(bg, -25));
  const pagesColor = new THREE.Color(0.96, 0.94, 0.9);
  const edgeColor = new THREE.Color(0.88, 0.86, 0.82);

  useEffect(() => {
    let active = true;
    let tex: THREE.Texture | null = null;

    void loadCoverTexture(coverUrl, titulo).then(loaded => {
      if (!active) {
        loaded.dispose();
        return;
      }
      tex = loaded;
      setCoverTexture(prev => {
        if (prev && prev !== loaded) prev.dispose();
        return loaded;
      });
    });

    return () => {
      active = false;
      if (tex) tex.dispose();
    };
  }, [coverUrl, titulo]);

  useEffect(() => {
    const mat = coverMatRef.current;
    if (!mat) return;

    if (coverTexture) {
      mat.map = coverTexture;
      mat.color.set(0xffffff);
    } else {
      mat.map = null;
      mat.color.copy(hexToColor(bg));
    }
    mat.needsUpdate = true;
  }, [coverTexture, bg]);

  useFrame((_, delta) => {
    if (autoRotate && groupRef.current) {
      groupRef.current.rotation.y += delta * 0.55;
    }
  });

  return (
    <>
      <ambientLight intensity={0.9} />
      <directionalLight position={[3, 4, 5]} intensity={1.25} />
      <directionalLight position={[-2, 1, -3]} intensity={0.4} />
      <pointLight position={[0, 2, 3]} intensity={0.45} />

      <group ref={groupRef}>
        {/* Cuerpo del libro (sin portada frontal) */}
        <mesh position={[0, 0, -0.006]} castShadow receiveShadow>
          <boxGeometry args={[BOOK_W * 0.98, BOOK_H * 0.98, BOOK_D * 0.92]} />
          <meshStandardMaterial color={pagesColor} roughness={0.85} metalness={0} />
        </mesh>

        {/* Lomo */}
        <mesh position={[-BOOK_W / 2 - 0.01, 0, 0]} castShadow>
          <boxGeometry args={[0.04, BOOK_H, BOOK_D]} />
          <meshStandardMaterial color={spineColor} roughness={0.55} metalness={0.02} />
        </mesh>

        {/* Contracara */}
        <mesh position={[0, 0, -BOOK_D / 2 - 0.008]} castShadow>
          <boxGeometry args={[BOOK_W, BOOK_H, 0.02]} />
          <meshStandardMaterial color={backColor} roughness={0.5} metalness={0.03} />
        </mesh>

        {/* Bordes superior e inferior */}
        <mesh position={[0, BOOK_H / 2 + 0.008, 0]}>
          <boxGeometry args={[BOOK_W, 0.03, BOOK_D]} />
          <meshStandardMaterial color={edgeColor} roughness={0.7} />
        </mesh>
        <mesh position={[0, -BOOK_H / 2 - 0.008, 0]}>
          <boxGeometry args={[BOOK_W, 0.03, BOOK_D]} />
          <meshStandardMaterial color={edgeColor} roughness={0.7} />
        </mesh>

        {/* Portada (plano frontal con textura) */}
        <mesh position={[0, 0, BOOK_D / 2 + 0.012]} castShadow>
          <planeGeometry args={[BOOK_W, BOOK_H]} />
          <meshStandardMaterial
            ref={coverMatRef}
            color={hexToColor(bg)}
            roughness={0.42}
            metalness={0.04}
          />
        </mesh>
      </group>

      <OrbitControls
        enablePan={false}
        enableZoom={false}
        minPolarAngle={Math.PI / 4}
        maxPolarAngle={(Math.PI * 3) / 4}
        rotateSpeed={0.8}
      />
    </>
  );
}
