import * as THREE from "three";
import { coverColor, coverLetter } from "@/lib/book-cover";

function createPlaceholderTexture(titulo: string): THREE.CanvasTexture {
  const bg = coverColor(titulo);
  const letter = coverLetter(titulo);
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 768;
  const ctx = canvas.getContext("2d")!;
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, 512, 768);
  ctx.fillStyle = "rgba(255,255,255,0.92)";
  ctx.font = "bold 220px system-ui, sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(letter, 256, 300);
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.needsUpdate = true;
  return tex;
}

function textureFromImage(img: HTMLImageElement): THREE.Texture {
  const tex = new THREE.Texture(img);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.minFilter = THREE.LinearMipmapLinearFilter;
  tex.magFilter = THREE.LinearFilter;
  tex.generateMipmaps = true;
  tex.needsUpdate = true;
  return tex;
}

function loadViaImage(url: string): Promise<THREE.Texture> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(textureFromImage(img));
    img.onerror = () => reject(new Error("image load failed"));
    img.src = url;
  });
}

/** Carga una textura de portada; usa placeholder si falla (CORS, 404, etc.). */
export async function loadCoverTexture(
  url: string | null,
  titulo: string,
): Promise<THREE.Texture> {
  if (!url) return createPlaceholderTexture(titulo);

  try {
    return await loadViaImage(url);
  } catch {
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error("fetch failed");
      const blob = await res.blob();
      const objectUrl = URL.createObjectURL(blob);
      try {
        return await new Promise<THREE.Texture>((resolve, reject) => {
          const img = new Image();
          img.onload = () => {
            URL.revokeObjectURL(objectUrl);
            resolve(textureFromImage(img));
          };
          img.onerror = () => {
            URL.revokeObjectURL(objectUrl);
            reject(new Error("blob image failed"));
          };
          img.src = objectUrl;
        });
      } catch (e) {
        URL.revokeObjectURL(objectUrl);
        throw e;
      }
    } catch {
      return createPlaceholderTexture(titulo);
    }
  }
}
