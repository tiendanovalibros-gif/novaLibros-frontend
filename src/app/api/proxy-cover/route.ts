import { NextRequest, NextResponse } from "next/server";

/** Sirve portadas en el mismo origen para que Three.js pueda usarlas como textura. */
export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get("url");
  if (!url) {
    return NextResponse.json({ message: "Falta el parámetro url" }, { status: 400 });
  }

  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return NextResponse.json({ message: "URL inválida" }, { status: 400 });
  }

  if (!["http:", "https:"].includes(parsed.protocol)) {
    return NextResponse.json({ message: "Protocolo no permitido" }, { status: 400 });
  }

  try {
    const upstream = await fetch(url, {
      headers: { Accept: "image/*" },
      next: { revalidate: 3600 },
    });

    if (!upstream.ok) {
      return NextResponse.json({ message: "No se pudo obtener la imagen" }, { status: 502 });
    }

    const contentType = upstream.headers.get("content-type") ?? "image/jpeg";
    const buffer = await upstream.arrayBuffer();

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=86400",
      },
    });
  } catch {
    return NextResponse.json({ message: "Error al descargar la imagen" }, { status: 502 });
  }
}
