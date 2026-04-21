"use client";

import { useState, useEffect, useMemo } from "react";
import { apiFetch } from "@/services/api.client";
import { obtenerLibrosAgotados } from "@/services/inventarios.service";
import { agregarLibroAMiCarrito } from "@/services/carrito.service";
import { useAuth } from "@/context/auth.context";
import Link from "next/link";
import Iconify from "@/components/iconify/iconify";
import MainNavbar from "@/components/navigation/main-navbar";
import AddToCartDialog from "@/components/carrito/add-to-cart-dialog";
import type { LibroAgotado } from "@/types/inventarios.types";

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
interface InventarioLite {
  idLibro: string;
  cantidadDisponible: number;
}

const Modal = ({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) => (
  <div className="fixed inset-0 z-[70] bg-slate-900/55 backdrop-blur-[2px] flex items-end sm:items-center justify-center p-0 sm:p-6">
    <div className="w-full sm:max-w-2xl bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl border border-slate-200 max-h-[88vh] overflow-hidden">
      <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
        <h3 className="text-slate-900 text-lg font-bold">{title}</h3>
        <button
          onClick={onClose}
          className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-300 text-slate-600 leading-none hover:bg-slate-100"
          aria-label="Cerrar"
        >
          <Iconify icon="mdi:close" width={18} />
        </button>
      </div>
      <div className="p-5 overflow-y-auto">{children}</div>
    </div>
  </div>
);

// ─── Funciones de utilidad ───────────────────────────────────────────────────
const formatearPrecio = (precio: number): string => {
  return precio.toLocaleString("es-CO", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
};

// ─── Constantes ──────────────────────────────────────────────────────────────
const RANGOS_PRECIO = [
  { min: 0, max: 1000000, label: "Todos los precios" },
  { min: 0, max: 50000, label: "Hasta $50.000" },
  { min: 50000, max: 100000, label: "$50.000 - $100.000" },
  { min: 100000, max: 200000, label: "$100.000 - $200.000" },
  { min: 200000, max: 1000000, label: "Más de $200.000" },
];

const OPCIONES_ORDEN = [
  { value: "relevancia", label: "Relevancia" },
  { value: "precio_asc", label: "Precio: menor a mayor" },
  { value: "precio_desc", label: "Precio: mayor a menor" },
  { value: "reciente", label: "Más recientes" },
  { value: "antiguo", label: "Más antiguos" },
  { value: "az", label: "Alfabético A-Z" },
];
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
const BookCover = ({ libro, estadoVisual }: { libro: Libro; estadoVisual: string }) => {
  const [imageError, setImageError] = useState(false);

  const imageUrl = libro.imagenPortada;
  const isValidUrl =
    imageUrl &&
    (imageUrl.startsWith("http") || imageUrl.startsWith("https") || imageUrl.startsWith("/"));

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
            estadoVisual === "nuevo"
              ? "bg-green-50 text-green-800 border-green-400"
              : estadoVisual === "agotado"
                ? "bg-red-50 text-red-800 border-red-400"
                : "bg-yellow-50 text-yellow-800 border-yellow-400"
          }`}
        >
          {estadoVisual}
        </span>
      </div>
    );
  }

  return (
    <div
      className="w-full h-full flex flex-col items-center justify-center gap-2 p-3 relative"
      style={{ backgroundColor: generarColorPortada(libro.titulo) }}
    >
      <span
        className="text-6xl font-extrabold leading-none select-none"
        style={{ color: "rgba(255,255,255,0.15)" }}
      >
        {generarLetraPortada(libro.titulo)}
      </span>
      <span
        className="text-xs font-semibold text-center leading-tight line-clamp-2 max-w-full"
        style={{ color: "rgba(255,255,255,0.5)" }}
      >
        {libro.titulo}
      </span>
      <span
        className={`absolute top-2 left-2 px-2 py-0.5 rounded-md text-xs font-bold border
        ${
          estadoVisual === "nuevo"
            ? "bg-green-50 text-green-800 border-green-400"
            : estadoVisual === "agotado"
              ? "bg-red-50 text-red-800 border-red-400"
              : "bg-yellow-50 text-yellow-800 border-yellow-400"
        }`}
      >
        {estadoVisual}
      </span>
    </div>
  );
};

// ─── Tarjeta de libro ─────────────────────────────────────────────────────────
type UserRole = "root" | "administrador" | "cliente" | null;

const BookCard = ({
  libro,
  nombreAutor,
  nombreGenero,
  isAuthenticated,
  userRole,
  estadoVisual,
  cantidadDisponible,
  onRequestAddToCart,
}: {
  libro: Libro;
  nombreAutor: (id: number) => string;
  nombreGenero: (id: number) => string;
  isAuthenticated: boolean;
  userRole: UserRole;
  estadoVisual: string;
  cantidadDisponible: number;
  onRequestAddToCart: (libro: Libro) => void;
}) => {
  const estaAgotado = estadoVisual === "agotado";
  const canAddToCart = isAuthenticated && userRole === "cliente" && !estaAgotado;
  const cartTooltip = estaAgotado
    ? "Sin existencias disponibles"
    : !isAuthenticated
      ? "Inicia sesión para agregar al carrito"
      : userRole === "cliente"
        ? "Agregar al carrito"
        : "Solo clientes pueden agregar al carrito";

  return (
    <Link
      href={`/books/${libro.id}`}
      className="bg-white border border-slate-200 rounded-xl overflow-hidden transition-all duration-150 hover:-translate-y-1 hover:shadow-lg group block no-underline flex flex-col"
    >
      <div className="w-full aspect-[2/3] relative overflow-hidden">
        <BookCover libro={libro} estadoVisual={estadoVisual} />
      </div>

      <div className="p-3 flex flex-col flex-1">
        <p className="text-slate-900 text-sm font-bold leading-snug mb-1 line-clamp-2">
          {libro.titulo}
        </p>
        <p className="text-slate-500 text-xs mb-2">{nombreAutor(libro.idAutor)}</p>
        <span className="inline-block bg-blue-50 text-blue-800 text-xs font-medium px-2 py-0.5 rounded mb-3">
          {nombreGenero(libro.idGenero)}
        </span>

        <div className="flex items-center justify-between pt-2 border-t border-slate-100 mt-auto">
          <div>
            <p className="text-blue-600 font-bold text-base">${formatearPrecio(libro.precio)}</p>
            <div className="flex items-center gap-1 mt-0.5 text-xs">
              {estaAgotado ? (
                <span className="italic text-red-500 font-medium">0 libros disponibles</span>
              ) : (
                <span className="text-green-500 font-medium">
                  {cantidadDisponible} libro{cantidadDisponible === 1 ? "" : "s"} disponibles
                </span>
              )}
            </div>
          </div>
          <div
            className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
              canAddToCart
                ? "bg-blue-600 text-white cursor-pointer hover:bg-blue-700"
                : "bg-slate-100 text-slate-400 opacity-75 cursor-not-allowed group-hover:bg-blue-50"
            }`}
            title={cartTooltip}
            onClick={e => {
              e.preventDefault();
              if (!canAddToCart) return;
              onRequestAddToCart(libro);
            }}
          >
            <Iconify icon="icon-park-outline:mall-bag" className="text-slate-300" width={18} />
          </div>
        </div>
      </div>
    </Link>
  );
};

// ─── Página principal ─────────────────────────────────────────────────────────
export default function CataloguePage() {
  const [libros, setLibros] = useState<Libro[]>([]);
  const [inventarios, setInventarios] = useState<InventarioLite[]>([]);
  const [librosAgotados, setLibrosAgotados] = useState<LibroAgotado[]>([]);
  const [autores, setAutores] = useState<Autor[]>([]);
  const [generos, setGeneros] = useState<Genero[]>([]);
  const [editoriales, setEditoriales] = useState<Editorial[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingAgotados, setLoadingAgotados] = useState(false);
  const [errorAgotados, setErrorAgotados] = useState("");
  const [error, setError] = useState("");
  const [busqueda, setBusqueda] = useState("");
  const [generoActivo, setGeneroActivo] = useState("Todos");
  const [rangoIdx, setRangoIdx] = useState(0);
  const [orden, setOrden] = useState("relevancia");
  const [showAgotadosDialog, setShowAgotadosDialog] = useState(false);
  const [showCarritoDialog, setShowCarritoDialog] = useState(false);
  const [libroCarritoActual, setLibroCarritoActual] = useState<Libro | null>(null);
  const [agregandoCarrito, setAgregandoCarrito] = useState(false);
  const [carritoMensaje, setCarritoMensaje] = useState("");
  const [carritoError, setCarritoError] = useState("");
  const [indiceCarousel, setIndiceCarousel] = useState(0);

  const { user, isAuthenticated } = useAuth();

  const nombreAutor = (id: number) => autores.find(a => a.id === id)?.nombre ?? `Autor #${id}`;
  const nombreGenero = (id: number) => generos.find(g => g.id === id)?.nombre ?? `Género #${id}`;
  const nombreEditorial = (id: number) =>
    editoriales.find(e => e.id === id)?.nombre ?? `Editorial #${id}`;

  const librosNuevos = useMemo(() => {
    return libros
      .filter(l => l.estado === "nuevo")
      .sort((a, b) => b.anoPublicacion - a.anoPublicacion);
  }, [libros]);

  const libroActual = useMemo(() => {
    if (librosNuevos.length === 0) return null;
    return librosNuevos[indiceCarousel];
  }, [librosNuevos, indiceCarousel]);

  useEffect(() => {
    cargarDatos();
  }, []);

  useEffect(() => {
    if (librosNuevos.length === 0) return;

    const intervalo = setInterval(() => {
      setIndiceCarousel(prev => (prev + 1) % librosNuevos.length);
    }, 5000);

    return () => clearInterval(intervalo);
  }, [librosNuevos.length]);

  const cargarDatos = async () => {
    setLoading(true);
    setError("");
    try {
      const l = await apiFetch<Libro[]>("/libros");
      setLibros(Array.isArray(l) ? l : []);

      const [autoresRes, generosRes, editorialesRes, inventariosRes] = await Promise.allSettled([
        apiFetch<Autor[]>("/autores"),
        apiFetch<Genero[]>("/generos"),
        apiFetch<Editorial[]>("/editoriales"),
        apiFetch<InventarioLite[]>("/inventarios"),
      ]);

      setAutores(autoresRes.status === "fulfilled" ? autoresRes.value : []);
      setGeneros(generosRes.status === "fulfilled" ? generosRes.value : []);
      setEditoriales(editorialesRes.status === "fulfilled" ? editorialesRes.value : []);
      setInventarios(inventariosRes.status === "fulfilled" ? inventariosRes.value : []);
    } catch {
      setError("Error al cargar los datos");
      setLibros([]);
      setInventarios([]);
    } finally {
      setLoading(false);
    }

    recargarAgotados();
  };

  const recargarAgotados = async () => {
    setLoadingAgotados(true);
    setErrorAgotados("");
    try {
      const agotados = await obtenerLibrosAgotados();
      setLibrosAgotados(agotados);
    } catch {
      setErrorAgotados("No fue posible cargar los libros agotados");
      setLibrosAgotados([]);
    } finally {
      setLoadingAgotados(false);
    }
  };

  const inventarioResumenPorLibro = useMemo(() => {
    const resumen = new Map<string, { totalDisponible: number; tiendas: number }>();
    for (const inventario of inventarios) {
      const actual = resumen.get(inventario.idLibro) ?? { totalDisponible: 0, tiendas: 0 };
      actual.totalDisponible += inventario.cantidadDisponible;
      actual.tiendas += 1;
      resumen.set(inventario.idLibro, actual);
    }
    return resumen;
  }, [inventarios]);

  const estadoVisualLibro = (libro: Libro) => {
    const inventario = inventarioResumenPorLibro.get(libro.id);
    if (!inventario || inventario.totalDisponible <= 0) {
      return "agotado";
    }
    return libro.estado;
  };

  const cantidadDisponibleLibro = (idLibro: string) => {
    const inventario = inventarioResumenPorLibro.get(idLibro);
    return inventario?.totalDisponible ?? 0;
  };

  const librosFiltrados = useMemo(() => {
    let r = [...libros];
    if (busqueda.trim()) {
      const q = busqueda.toLowerCase();
      r = r.filter(
        l =>
          l.titulo.toLowerCase().includes(q) ||
          nombreAutor(l.idAutor).toLowerCase().includes(q) ||
          nombreGenero(l.idGenero).toLowerCase().includes(q) ||
          nombreEditorial(l.idEditorial).toLowerCase().includes(q) ||
          l.isbn.toLowerCase().includes(q)
      );
    }
    if (generoActivo !== "Todos") {
      const generoId = generos.find(g => g.nombre === generoActivo)?.id;
      if (generoId) r = r.filter(l => l.idGenero === generoId);
    }
    const rango = RANGOS_PRECIO[rangoIdx];
    r = r.filter(l => l.precio >= rango.min && l.precio <= rango.max);
    switch (orden) {
      case "precio_asc":
        r.sort((a, b) => a.precio - b.precio);
        break;
      case "precio_desc":
        r.sort((a, b) => b.precio - a.precio);
        break;
      case "reciente":
        r.sort((a, b) => b.anoPublicacion - a.anoPublicacion);
        break;
      case "antiguo":
        r.sort((a, b) => a.anoPublicacion - b.anoPublicacion);
        break;
      case "az":
        r.sort((a, b) => a.titulo.localeCompare(b.titulo));
        break;
    }
    return r;
  }, [libros, busqueda, generoActivo, rangoIdx, orden, autores, generos, editoriales]);

  const handleOpenAddToCartDialog = (libro: Libro) => {
    setCarritoError("");
    setCarritoMensaje("");
    setLibroCarritoActual(libro);
    setShowCarritoDialog(true);
  };

  const handleConfirmAddToCart = async (cantidad: number) => {
    if (!libroCarritoActual) return;

    setAgregandoCarrito(true);
    setCarritoError("");
    setCarritoMensaje("");

    try {
      await agregarLibroAMiCarrito({
        idLibro: libroCarritoActual.id,
        cantidad,
      });

      setCarritoMensaje(
        `Se agregaron ${cantidad} unidad(es) al carrito: ${libroCarritoActual.titulo}`
      );
      setShowCarritoDialog(false);
    } catch (e: unknown) {
      setCarritoError((e as { message?: string })?.message ?? "No se pudo agregar al carrito");
    } finally {
      setAgregandoCarrito(false);
    }
  };

  const clearFilters = () => {
    setBusqueda("");
    setGeneroActivo("Todos");
    setRangoIdx(0);
    setOrden("relevancia");
  };
  const hayFiltros = busqueda || generoActivo !== "Todos" || rangoIdx !== 0;

  const colorHero = useMemo(() => {
    if (librosNuevos.length === 0) return "#334155";
    const libro = librosNuevos[indiceCarousel];
    if (!libro.imagenPortada) {
      return generarColorPortada(libro.titulo);
    }
    return generarColorPortada(libro.titulo);
  }, [librosNuevos, indiceCarousel]);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <MainNavbar libros={libros} autores={autores} />

      {/* ── HERO: Carrusel completo de nuevos libros ── */}
      <section
        className="px-4 sm:px-8 py-12 sm:py-16 relative overflow-hidden transition-colors duration-700"
        style={{ backgroundColor: colorHero }}
      >
        <div className="absolute inset-0 bg-black/40" />

        {/* Fondo blur dinámico */}
        {librosNuevos.length > 0 && libroActual && (
          <div className="absolute inset-0 opacity-20">
            {(() => {
              const imageUrl = libroActual.imagenPortada;
              const isValidUrl =
                imageUrl &&
                (imageUrl.startsWith("http") ||
                  imageUrl.startsWith("https") ||
                  imageUrl.startsWith("/"));
              const fullImageUrl =
                imageUrl && imageUrl.startsWith("/")
                  ? `${process.env.NEXT_PUBLIC_API_URL}${imageUrl}`
                  : imageUrl;
              return isValidUrl ? (
                <img
                  src={fullImageUrl}
                  alt="fondo"
                  className="w-full h-full object-cover filter blur-xl scale-110"
                />
              ) : null;
            })()}
          </div>
        )}

        <div className="absolute -top-16 -right-16 w-64 h-64 rounded-full bg-blue-600 opacity-10 pointer-events-none" />
        <div className="absolute -bottom-10 left-1/3 w-48 h-48 rounded-full bg-blue-100 opacity-5 pointer-events-none" />

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 items-center">
            {/* Columna izquierda – Información dinámica */}
            <div>
              <p className="text-slate-400 text-xs font-medium tracking-widest uppercase mb-3">
                {libroActual
                  ? `NOVEDAD • ${libroActual.anoPublicacion}`
                  : "Bienvenido a NovaLibros"}
              </p>

              <h1 className="text-white text-3xl sm:text-4xl font-bold leading-tight tracking-tight mb-3">
                {libroActual ? libroActual.titulo : "Tu próxima lectura"}
                {!libroActual && (
                  <>
                    <br />
                    <span className="text-blue-200">te está esperando</span>
                  </>
                )}
              </h1>

              {libroActual ? (
                <>
                  <div className="flex items-center gap-x-2 text-blue-200 text-base mb-4">
                    <span>{nombreAutor(libroActual.idAutor)}</span>
                    <span className="text-white/30">•</span>
                    <span>{nombreGenero(libroActual.idGenero)}</span>
                  </div>

                  {libroActual.descripcion && (
                    <p className="text-slate-300 text-sm sm:text-base mb-8 max-w-lg leading-relaxed line-clamp-4">
                      {libroActual.descripcion}
                    </p>
                  )}

                  <div className="flex items-center gap-8">
                    <div>
                      <p className="uppercase text-xs text-slate-400 tracking-widest">Precio</p>
                      <p className="text-4xl font-bold text-white">
                        ${formatearPrecio(libroActual.precio)}
                      </p>
                    </div>
                    <Link
                      href={`/books/${libroActual.id}`}
                      className="inline-flex items-center px-8 py-4 bg-white text-slate-900 rounded-3xl font-semibold hover:bg-amber-100 transition-all active:scale-95"
                    >
                      Ver libro completo
                      <Iconify icon="mdi:arrow-right" width={20} className="ml-2" />
                    </Link>
                  </div>
                </>
              ) : (
                <p className="text-slate-400 text-sm sm:text-base mb-8 max-w-lg leading-relaxed">
                  Explora miles de títulos. Regístrate para reservar, comprar y mucho más.
                </p>
              )}
            </div>

            {/* Columna derecha – Imagen grande del libro actual */}
            {librosNuevos.length > 0 && libroActual && (
              <div className="hidden lg:flex justify-center">
                <div className="w-72 h-[432px] rounded-3xl overflow-hidden shadow-2xl border-4 border-white/30 relative">
                  <BookCover libro={libroActual} estadoVisual={estadoVisualLibro(libroActual)} />
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ── Stats bar — solo md+ ── */}
      <div className="hidden md:block bg-blue-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 py-3 flex gap-8">
          {[
            { icon: "📚", text: `${libros.length} títulos disponibles` },
            { icon: "✍️", text: `${autores.length} autores` },
            { icon: "🏷️", text: `${generos.length} géneros` },
            { icon: "🚚", text: "Entrega en Colombia" },
          ].map(s => (
            <div key={s.text} className="flex items-center gap-2 text-blue-900 text-xs font-medium">
              <span>{s.icon}</span>
              <span>{s.text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Main ── */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 py-6 sm:py-8">
        {/* Filtros género */}
        <div className="flex items-center gap-2 mb-4 overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0">
          <span className="text-slate-600 text-sm font-semibold shrink-0">Género:</span>
          {["Todos", ...generos.map(g => g.nombre)].map(g => (
            <button
              key={g}
              onClick={() => setGeneroActivo(g)}
              className={`px-3 py-1.5 rounded-full text-xs border whitespace-nowrap transition-all shrink-0
                ${
                  generoActivo === g
                    ? "bg-blue-50 border-blue-500 text-blue-800 font-semibold"
                    : "bg-white border-slate-200 text-slate-500 font-medium hover:border-slate-300"
                }`}
            >
              {g}
            </button>
          ))}
        </div>

        {/* Precio + orden */}
        <div className="flex flex-wrap items-center gap-3 mb-5">
          <span className="text-slate-600 text-sm font-semibold">Precio:</span>
          <select
            value={rangoIdx}
            onChange={e => setRangoIdx(Number(e.target.value))}
            className="px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm text-slate-800 outline-none focus:border-blue-500 cursor-pointer"
          >
            {RANGOS_PRECIO.map((r, i) => (
              <option key={i} value={i}>
                {r.label}
              </option>
            ))}
          </select>

          <select
            value={orden}
            onChange={e => setOrden(e.target.value)}
            className="px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm text-slate-800 outline-none focus:border-blue-500 cursor-pointer sm:ml-auto"
          >
            {OPCIONES_ORDEN.map(o => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>

          {hayFiltros && (
            <button
              onClick={clearFilters}
              className="text-blue-600 text-sm font-semibold hover:text-blue-700"
            >
              × Limpiar filtros
            </button>
          )}

          <button
            onClick={() => {
              setShowAgotadosDialog(true);
              recargarAgotados();
            }}
            className="ml-auto sm:ml-0 px-3 py-2 rounded-lg border border-red-200 bg-red-50 text-red-700 text-sm font-semibold hover:bg-red-100 transition-colors"
          >
            Agotados ({librosAgotados.length})
          </button>
        </div>

        {/* Contador */}
        {!loading && !error && (
          <p className="text-slate-500 text-sm mb-4">
            <span className="text-slate-900 font-bold">{librosFiltrados.length}</span>{" "}
            {librosFiltrados.length === 1 ? "libro encontrado" : "libros encontrados"}
            {busqueda && (
              <span>
                {" "}
                para &quot;<strong className="text-slate-800">{busqueda}</strong>&quot;
              </span>
            )}
          </p>
        )}

        {/* Grid */}
        {loading ? (
          <div className="py-20 text-center text-slate-500 text-sm">Cargando libros...</div>
        ) : error ? (
          <div className="py-20 text-center">
            <p className="text-red-600 font-semibold mb-2">{error}</p>
            <button
              onClick={cargarDatos}
              className="text-blue-600 text-sm font-medium hover:underline"
            >
              Reintentar
            </button>
          </div>
        ) : librosFiltrados.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
            {librosFiltrados.map(libro => (
              <BookCard
                key={libro.id}
                libro={libro}
                nombreAutor={nombreAutor}
                nombreGenero={nombreGenero}
                isAuthenticated={isAuthenticated}
                userRole={user?.rol ?? null}
                estadoVisual={estadoVisualLibro(libro)}
                cantidadDisponible={cantidadDisponibleLibro(libro.id)}
                onRequestAddToCart={handleOpenAddToCartDialog}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 text-slate-500">
            <div className="text-5xl mb-4">📭</div>
            <h3 className="text-slate-900 text-lg font-bold mb-2">No encontramos resultados</h3>
            <p className="text-sm mb-5">Intenta con otros términos o ajusta los filtros</p>
            <button
              onClick={clearFilters}
              className="px-6 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors"
            >
              Ver todos los libros
            </button>
          </div>
        )}

        {carritoError && (
          <div className="mt-4 bg-red-50 border border-red-200 rounded-xl p-3 text-red-700 text-sm">
            {carritoError}
          </div>
        )}

        {carritoMensaje && (
          <div className="mt-4 bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-emerald-700 text-sm">
            {carritoMensaje}
          </div>
        )}

        {/* Banner CTA */}
        {!isAuthenticated && (
          <div className="mt-12 bg-slate-700 rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div>
              <h3 className="text-white text-lg font-bold mb-1">¿Listo para empezar?</h3>
              <p className="text-slate-400 text-sm leading-relaxed max-w-md">
                Regístrate gratis para comprar, reservar libros y recibir recomendaciones
                personalizadas.
              </p>
            </div>
            <div className="flex gap-3 w-full sm:w-auto shrink-0">
              <a
                href="/register"
                className="flex-1 sm:flex-none text-center px-5 py-2.5 bg-blue-600 rounded-lg text-sm font-semibold text-white hover:bg-blue-700 transition-colors"
              >
                Crear cuenta gratis
              </a>
              <a
                href="/login"
                className="flex-1 sm:flex-none text-center px-5 py-2.5 border border-slate-500 rounded-lg text-sm font-semibold text-white hover:border-slate-400 transition-colors"
              >
                Iniciar sesión
              </a>
            </div>
          </div>
        )}
      </main>

      {showAgotadosDialog && (
        <Modal
          title="Libros agotados"
          onClose={() => {
            setShowAgotadosDialog(false);
          }}
        >
          {loadingAgotados ? (
            <p className="text-slate-500 text-sm">Cargando libros agotados...</p>
          ) : errorAgotados ? (
            <div className="text-center py-8">
              <p className="text-red-600 font-semibold text-sm">{errorAgotados}</p>
              <button
                onClick={recargarAgotados}
                className="mt-3 text-sm font-semibold text-blue-600 hover:text-blue-700"
              >
                Reintentar
              </button>
            </div>
          ) : librosAgotados.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-slate-900 font-semibold">No hay libros agotados por ahora.</p>
              <p className="text-slate-500 text-sm mt-1">
                Todo el inventario tiene unidades disponibles.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-slate-600 text-sm">
                Estos títulos no tienen stock disponible en tiendas ({librosAgotados.length}).
              </p>
              {librosAgotados.map(libro => (
                <div
                  key={libro.idLibro}
                  className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-slate-900 font-semibold text-sm">{libro.titulo}</p>
                      <p className="text-slate-500 text-xs mt-0.5">{libro.autor.nombre}</p>
                    </div>
                    <span className="inline-flex items-center rounded-full border border-red-300 bg-red-100 px-2.5 py-1 text-xs font-semibold text-red-700">
                      Sin stock
                    </span>
                  </div>

                  <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-600">
                    <p>ISBN: {libro.isbn}</p>
                    <p>Editorial: {libro.editorial.nombre}</p>
                    <p>Tiendas afectadas: {libro.tiendasAfectadas}</p>
                    <p>
                      Actualizado: {new Date(libro.ultimaActualizacion).toLocaleDateString("es-CO")}
                    </p>
                  </div>

                  <div className="mt-3">
                    <Link
                      href={`/books/${libro.idLibro}`}
                      onClick={() => setShowAgotadosDialog(false)}
                      className="inline-flex items-center text-xs font-semibold text-blue-600 hover:text-blue-700"
                    >
                      Ver detalle del libro
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Modal>
      )}

      <AddToCartDialog
        isOpen={showCarritoDialog}
        libroTitulo={libroCarritoActual?.titulo ?? ""}
        isLoading={agregandoCarrito}
        onClose={() => setShowCarritoDialog(false)}
        onConfirm={handleConfirmAddToCart}
      />
    </div>
  );
}
