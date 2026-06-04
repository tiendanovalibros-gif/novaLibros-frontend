const COVER_COLORS = [
  "#3B82F6",
  "#EF4444",
  "#10B981",
  "#F59E0B",
  "#8B5CF6",
  "#06B6D4",
  "#84CC16",
  "#F97316",
];

export function coverColor(titulo: string): string {
  return COVER_COLORS[titulo.length % COVER_COLORS.length];
}

export function coverLetter(titulo: string): string {
  return titulo.charAt(0).toUpperCase();
}

export function getBookCoverUrl(imagenPortada?: string | null): string | null {
  if (!imagenPortada) return null;
  if (imagenPortada.startsWith("http") || imagenPortada.startsWith("https")) {
    return imagenPortada;
  }
  if (imagenPortada.startsWith("/")) {
    return `${process.env.NEXT_PUBLIC_API_URL}${imagenPortada}`;
  }
  return null;
}

/** URL apta para texturas WebGL (mismo origen o proxy). */
export function getBookCoverTextureUrl(imagenPortada?: string | null): string | null {
  const url = getBookCoverUrl(imagenPortada);
  if (!url) return null;

  if (typeof window === "undefined") return url;

  try {
    const target = new URL(url, window.location.origin);
    const apiBase = process.env.NEXT_PUBLIC_API_URL ?? "";
    const apiOrigin = apiBase ? new URL(apiBase).origin : "";

    // Mismo origen del frontend o del API → carga directa
    if (
      target.origin === window.location.origin ||
      (apiOrigin && target.origin === apiOrigin)
    ) {
      return url;
    }
  } catch {
    return url;
  }

  return `/api/proxy-cover?url=${encodeURIComponent(url)}`;
}
