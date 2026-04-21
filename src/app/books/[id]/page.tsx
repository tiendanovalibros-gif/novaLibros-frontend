"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { apiFetch } from "@/services/api.client";
import Iconify from "@/components/iconify/iconify";
import Link from "next/link";


// ─── Tipos de la API ──────────────────────────────────────────────────────────
interface Libro {
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
interface Autor {
  id: number;
  nombre: string;
}
interface Genero {
  id: number;
  nombre: string;
}
interface Editorial {
  id: number;
  nombre: string;
}

// ─── Generar portada ──────────────────────────────────────────────────────────
const generarColorPortada = (titulo: string) => {
  const colors = [
    "#3B82F6",
    "#EF4444",
    "#10B981",
    "#F59E0B",
    "#8B5CF6",
    "#06B6D4",
    "#84CC16",
    "#F97316",
  ];
  const index = titulo.length % colors.length;
  return colors[index];
};

const generarLetraPortada = (titulo: string) => {
  return titulo.charAt(0).toUpperCase();
};

// ─── Portada con imagen o placeholder ──────────────────────────────────────────
const BookCover = ({ libro, big = false }: { libro: Libro; big?: boolean }) => {
  const [imageError, setImageError] = useState(false);

  // Verificar si la URL de la imagen es válida
  const imageUrl = libro.imagenPortada;
  const isValidUrl =
    imageUrl &&
    (imageUrl.startsWith("http") || imageUrl.startsWith("https") || imageUrl.startsWith("/"));

  // Si es una URL relativa, agregar el dominio de la API
  const fullImageUrl =
    imageUrl && imageUrl.startsWith("/")
      ? `${process.env.NEXT_PUBLIC_API_URL}${imageUrl}`
      : imageUrl;

  if (isValidUrl && !imageError) {
    return (
      <div className="w-full h-full relative overflow-hidden">
        <img
          src={fullImageUrl}
          alt={`Portada de ${libro.titulo}`}
          className="w-full h-full object-cover"
          onError={() => {
            console.log("Error cargando imagen:", fullImageUrl);
            setImageError(true);
          }}
        />
        <span
          className={`absolute top-2 left-2 px-2 py-0.5 rounded-md text-xs font-bold border
          ${
            libro.estado === "nuevo"
              ? "bg-green-50 text-green-800 border-green-400"
              : libro.estado === "agotado"
                ? "bg-red-50 text-red-800 border-red-400"
                : "bg-yellow-50 text-yellow-800 border-yellow-400"
          }`}
        >
          {libro.estado}
        </span>
      </div>
    );
  }

  // Fallback: portada generada
  return (
    <div
      className={`w-full h-full flex flex-col items-center justify-center gap-3 ${big ? "p-8" : "p-3"} relative`}
      style={{ backgroundColor: generarColorPortada(libro.titulo) }}
    >
      <span
        className={`font-extrabold leading-none select-none ${big ? "text-9xl" : "text-5xl"}`}
        style={{ color: "rgba(255,255,255,0.15)" }}
      >
        {generarLetraPortada(libro.titulo)}
      </span>
      <span
        className={`font-semibold text-center leading-tight line-clamp-3 max-w-full ${big ? "text-sm" : "text-xs"}`}
        style={{ color: "rgba(255,255,255,0.5)" }}
      >
        {libro.titulo}
      </span>
      <span
        className={`absolute top-2 left-2 px-2 py-0.5 rounded-md text-xs font-bold border
        ${
          libro.estado === "nuevo"
            ? "bg-green-50 text-green-800 border-green-400"
            : libro.estado === "agotado"
              ? "bg-red-50 text-red-800 border-red-400"
              : "bg-yellow-50 text-yellow-800 border-yellow-400"
        }`}
      >
        {libro.estado}
      </span>
    </div>
  );
};

// ─── Navbar ───────────────────────────────────────────────────────────────────


// ─── Tarjeta relacionado ──────────────────────────────────────────────────────
const RelatedCard = ({ libro }: { libro: Libro }) => (
  <a
    href={`/books/${libro.id}`}
    className="bg-white border border-slate-200 rounded-xl overflow-hidden hover:-translate-y-1 hover:shadow-lg transition-all duration-150 group block"
  >
    <div className="w-full aspect-[2/3] relative overflow-hidden">
      <BookCover libro={libro} />
    </div>
    <div className="p-3">
      <p className="text-slate-900 text-sm font-bold leading-snug mb-1 line-clamp-2">
        {libro.titulo}
      </p>
      <p className="text-blue-600 font-bold text-sm">${libro.precio.toLocaleString("es-CO")}</p>
    </div>
  </a>
);

// ─── Página principal ─────────────────────────────────────────────────────────
export default function BookDetailPage() {
  const params = useParams();
  const libroId = params.id as string;

  const [libro, setLibro] = useState<Libro | null>(null);
  const [autores, setAutores] = useState<Autor[]>([]);
  const [generos, setGeneros] = useState<Genero[]>([]);
  const [editoriales, setEditoriales] = useState<Editorial[]>([]);
  const [librosRelacionados, setLibrosRelacionados] = useState<Libro[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reservando, setReservando] = useState(false);
  const [agregando, setAgregando] = useState(false);

  useEffect(() => {
    cargarDatos();
  }, [libroId]);

  const cargarDatos = async () => {
    if (!libroId || typeof libroId !== "string") {
      setError("ID de libro inválido");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");
    try {
      // Cargar datos básicos
      const [libroData, autoresData, generosData, editorialesData] = await Promise.all([
        apiFetch<Libro>(`/libros/${libroId}`),
        apiFetch<Autor[]>("/autores"),
        apiFetch<Genero[]>("/generos"),
        apiFetch<Editorial[]>("/editoriales"),
      ]);

      setLibro(libroData);
      setAutores(autoresData);
      setGeneros(generosData);
      setEditoriales(editorialesData);

      console.log("Libro cargado:", libroData);
      console.log("Imagen portada:", libroData.imagenPortada);

      // Cargar libros relacionados del mismo género
      const todosLibros = await apiFetch<Libro[]>("/libros");
      const relacionados = todosLibros
        .filter(l => l.idGenero === libroData.idGenero && l.id !== libroData.id)
        .slice(0, 4);
      setLibrosRelacionados(relacionados);
    } catch (err) {
      setError("Error al cargar los datos del libro");
      console.error("Error loading book data:", err);
    } finally {
      setLoading(false);
    }
  };

  const nombreAutor = (id: number) => autores.find(a => a.id === id)?.nombre ?? `Autor #${id}`;
  const nombreGenero = (id: number) => generos.find(g => g.id === id)?.nombre ?? `Género #${id}`;
  const nombreEditorial = (id: number) =>
    editoriales.find(e => e.id === id)?.nombre ?? `Editorial #${id}`;

  const handleReservar = () => {
    setReservando(true);
    setTimeout(() => setReservando(false), 1500);
    // TODO: conectar con reservas.service.ts
  };

  const handleAgregar = () => {
    setAgregando(true);
    setTimeout(() => setAgregando(false), 1500);
    // TODO: conectar con carrito.service.ts
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col">

        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-slate-600">Cargando libro...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !libro) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <p className="text-red-600 font-semibold mb-4">{error || "Libro no encontrado"}</p>
            <a href="/" className="text-blue-600 hover:underline">
              Volver al catálogo
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">

      {/* Breadcrumb */}
      <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 py-4">
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <a href="/" className="hover:text-blue-600 transition-colors">
            Catálogo
          </a>
          <span>/</span>
          <span className="text-blue-600 font-medium line-clamp-1">{libro.titulo}</span>
        </div>
      </div>

      {/* Contenido principal */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 pb-12">
        {/* ── Sección principal: portada + info ── */}
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden mb-8">
          <div className="flex flex-col md:flex-row">
            {/* Portada */}
            <div className="w-full md:w-64 lg:w-80 shrink-0">
              <div className="aspect-[2/3] md:h-full md:aspect-auto">
                <BookCover libro={libro} big />
              </div>
            </div>

            {/* Info */}
            <div className="flex-1 p-6 sm:p-8 flex flex-col justify-between gap-6">
              <div>
                {/* Badge estado */}
                <span
                  className={`inline-block px-2 py-0.5 rounded-md text-xs font-bold border mb-4
                  ${
                    libro.estado === "nuevo"
                      ? "bg-green-50 text-green-800 border-green-400"
                      : libro.estado === "agotado"
                        ? "bg-red-50 text-red-800 border-red-400"
                        : "bg-yellow-50 text-yellow-800 border-yellow-400"
                  }`}
                >
                  {libro.estado}
                </span>

                <h1 className="text-slate-900 text-2xl sm:text-3xl font-bold leading-tight tracking-tight mb-2">
                  {libro.titulo}
                </h1>
                <p className="text-slate-500 text-base mb-6">
                  por{" "}
                  <span className="text-slate-700 font-semibold">{nombreAutor(libro.idAutor)}</span>
                </p>

                {/* Metadatos */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                  {[
                    {
                      icon: <Iconify icon="tabler:tag" width={15} />,
                      label: "Género",
                      value: nombreGenero(libro.idGenero),
                    },
                    {
                      icon: <Iconify icon="meteor-icons:calendar" width={15} />,
                      label: "Año",
                      value: libro.anoPublicacion,
                    },
                    {
                      icon: <Iconify icon="uil:building" width={15} />,
                      label: "Editorial",
                      value: nombreEditorial(libro.idEditorial),
                    },
                    {
                      icon: <Iconify icon="tabler:tag" width={15} />,
                      label: "Idioma",
                      value: libro.idioma,
                    },
                  ].map(m => (
                    <div key={m.label} className="bg-slate-50 rounded-xl p-3">
                      <div className="flex items-center gap-1.5 text-slate-400 mb-1">
                        {m.icon}
                        <span className="text-xs">{m.label}</span>
                      </div>
                      <p className="text-slate-800 text-sm font-semibold">{m.value}</p>
                    </div>
                  ))}
                </div>

                {/* Descripción */}
                <p className="text-slate-600 text-sm leading-relaxed">{libro.descripcion}</p>
              </div>

              {/* Precio y botones */}
              <div className="border-t border-slate-100 pt-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <p className="text-blue-600 text-3xl font-bold">
                      ${libro.precio.toLocaleString("es-CO")}
                    </p>
                    <div className="flex items-center gap-1.5 text-slate-400 mt-1">
                      <Iconify icon="gg:lock" width={15} />
                      <span className="text-xs">Inicia sesión para comprar o reservar</span>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3">
                    {/* Reservar */}
                    <button
                      onClick={handleReservar}
                      disabled={reservando}
                      className="flex items-center justify-center gap-2 px-5 py-2.5 border-2 border-blue-600 text-blue-600 rounded-xl text-sm font-semibold hover:bg-blue-50 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
                    >
                      <Iconify icon="material-symbols:bookmark-outline" width={22} />
                      {reservando ? "Reservando..." : "Reservar"}
                    </button>

                    {/* Agregar al carrito */}
                    <button
                      onClick={handleAgregar}
                      disabled={agregando}
                      className="flex items-center justify-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
                    >
                      <Iconify
                        icon="icon-park-outline:mall-bag"
                        className="text-white"
                        width={18}
                      />
                      {agregando ? "Agregando..." : "Agregar al carrito"}
                    </button>
                  </div>
                </div>

                {/* Aviso visitante */}
                <div className="mt-4 bg-blue-50 border border-blue-200 rounded-xl p-3 flex items-start gap-2">
                  <Iconify icon="gg:lock" width={15} />
                  <p className="text-blue-800 text-xs leading-relaxed">
                    Debes{" "}
                    <a href="/login" className="font-semibold underline">
                      iniciar sesión
                    </a>{" "}
                    para reservar o agregar al carrito. Los administradores no pueden realizar
                    compras.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Libros relacionados ── */}
        {librosRelacionados.length > 0 && (
          <section>
            <h2 className="text-slate-900 text-xl font-bold mb-5">
              Más libros de <span className="text-blue-600">{nombreGenero(libro.idGenero)}</span>
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {librosRelacionados.map(r => (
                <RelatedCard key={r.id} libro={r} />
              ))}
            </div>
          </section>
        )}

        {/* Botón volver */}
        <div className="mt-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-slate-500 text-sm font-medium hover:text-blue-600 transition-colors"
          >
            <Iconify icon="formkit:arrowleft" />
            Volver al catálogo
          </Link>
        </div>
      </main>

    </div>
  );
}
