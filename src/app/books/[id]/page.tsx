"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { apiFetch } from "@/services/api.client";
import { useAuth } from "@/context/auth.context";
import {
  agregarExistenciasLibro,
  actualizarCantidadInventarioLibro,
  crearInventarioLibro,
} from "@/services/inventarios.service";
import Iconify from "@/components/iconify/iconify";
import MainNavbar from "@/components/navigation/main-navbar";
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
interface TiendaLite {
  id: number;
  nombre: string;
}
interface InventarioLite {
  id: number;
  idLibro: string;
  idTienda: number;
  cantidadDisponible: number;
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

const MenuIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
    <line
      x1="3"
      y1="6"
      x2="21"
      y2="6"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
    <line
      x1="3"
      y1="12"
      x2="21"
      y2="12"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
    <line
      x1="3"
      y1="18"
      x2="21"
      y2="18"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
  </svg>
);

const CloseIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
    <line
      x1="18"
      y1="6"
      x2="6"
      y2="18"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
    <line
      x1="6"
      y1="6"
      x2="18"
      y2="18"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
  </svg>
);

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
const Navbar = () => {
  const [menuAbierto, setMenuAbierto] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();

  return (
    <nav className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3">
          <div className="w-9 h-9 bg-blue-600 rounded-lg flex items-center justify-center shrink-0">
            <Iconify icon="solar:book-2-bold" className="text-white" width={24} />
          </div>
          <span className="text-slate-900 text-xl font-bold tracking-tight">NovaLibros</span>
        </Link>
        <div className="hidden sm:flex items-center gap-3">
          {isAuthenticated ? (
            <>
              {user?.rol === "root" || user?.rol === "administrador" ? (
                <a
                  href="/admin"
                  className="px-3 py-2 border border-slate-300 rounded-lg text-sm font-semibold text-slate-800 hover:bg-slate-50 transition-colors"
                >
                  Dashboard Admin
                </a>
              ) : (
                <a
                  href="/carrito"
                  className="px-3 py-2 border border-slate-300 rounded-lg text-sm font-semibold text-slate-800 hover:bg-slate-50 transition-colors"
                >
                  Carrito
                </a>
              )}

              <Link
                href="/profile"
                className="px-3 py-2 border border-slate-300 rounded-lg text-sm font-semibold text-slate-800 hover:bg-slate-50 transition-colors"
              >
                Mi perfil
              </Link>

              <button
                onClick={() => void logout()}
                className="px-3 py-2 bg-red-100 text-red-700 rounded-lg text-sm font-semibold hover:bg-red-200 transition-colors"
              >
                Cerrar sesión
              </button>
            </>
          ) : (
            <>
              <a
                href="/login"
                className="px-4 py-2 border border-slate-300 rounded-lg text-sm font-semibold text-slate-800 hover:bg-slate-50 transition-colors"
              >
                Iniciar sesión
              </a>
              <a
                href="/register"
                className="px-4 py-2 bg-blue-600 rounded-lg text-sm font-semibold text-white hover:bg-blue-700 transition-colors"
              >
                Registrarse
              </a>
            </>
          )}
        </div>
        <button
          className="sm:hidden text-slate-700 p-1"
          onClick={() => setMenuAbierto(!menuAbierto)}
        >
          {menuAbierto ? <CloseIcon /> : <MenuIcon />}
        </button>
      </div>
      {menuAbierto && (
        <div className="sm:hidden bg-white border-t border-slate-100 px-4 py-4 flex flex-col gap-3">
          {isAuthenticated ? (
            <>
              {user?.rol === "root" || user?.rol === "administrador" ? (
                <a
                  href="/admin"
                  className="w-full text-center py-2.5 border border-slate-300 rounded-lg text-sm font-semibold text-slate-800"
                >
                  Dashboard Admin
                </a>
              ) : (
                <a
                  href="/carrito"
                  className="w-full text-center py-2.5 border border-slate-300 rounded-lg text-sm font-semibold text-slate-800"
                >
                  Carrito
                </a>
              )}

              <Link
                href="/profile"
                className="w-full text-center py-2.5 border border-slate-300 rounded-lg text-sm font-semibold text-slate-800"
              >
                Mi perfil
              </Link>

              <button
                onClick={() => void logout()}
                className="w-full text-center py-2.5 bg-red-100 text-red-700 rounded-lg font-semibold"
              >
                Cerrar sesión
              </button>
            </>
          ) : (
            <>
              <a
                href="/login"
                className="w-full text-center py-2.5 border border-slate-300 rounded-lg text-sm font-semibold text-slate-800"
              >
                Iniciar sesión
              </a>
              <a
                href="/register"
                className="w-full text-center py-2.5 bg-blue-600 rounded-lg text-sm font-semibold text-white"
              >
                Registrarse
              </a>
            </>
          )}
        </div>
      )}
    </nav>
  );
};

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
  const { user } = useAuth();
  const esAdmin = user?.rol === "administrador" || user?.rol === "root";

  const [libro, setLibro] = useState<Libro | null>(null);
  const [autores, setAutores] = useState<Autor[]>([]);
  const [generos, setGeneros] = useState<Genero[]>([]);
  const [editoriales, setEditoriales] = useState<Editorial[]>([]);
  const [tiendas, setTiendas] = useState<TiendaLite[]>([]);
  const [inventariosLibro, setInventariosLibro] = useState<InventarioLite[]>([]);
  const [librosRelacionados, setLibrosRelacionados] = useState<Libro[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reservando, setReservando] = useState(false);
  const [agregando, setAgregando] = useState(false);
  const [showStockModal, setShowStockModal] = useState(false);
  const [idTiendaStock, setIdTiendaStock] = useState<number>(0);
  const [cantidadStock, setCantidadStock] = useState<number>(1);
  const [tipoMovimientoStock, setTipoMovimientoStock] = useState<"sumar" | "restar">("sumar");
  const [guardandoStock, setGuardandoStock] = useState(false);
  const [stockMensaje, setStockMensaje] = useState("");
  const [stockError, setStockError] = useState("");

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
      const [libroData, autoresData, generosData, editorialesData, tiendasData, inventariosData] = await Promise.all([
        apiFetch<Libro>(`/libros/${libroId}`),
        apiFetch<Autor[]>("/autores"),
        apiFetch<Genero[]>("/generos"),
        apiFetch<Editorial[]>("/editoriales"),
        apiFetch<TiendaLite[]>("/tiendas").catch(() => []),
        apiFetch<InventarioLite[]>("/inventarios").catch(() => []),
      ]);

      setLibro(libroData);
      setAutores(autoresData);
      setGeneros(generosData);
      setEditoriales(editorialesData);
      setTiendas(tiendasData);
      const inventariosDeEsteLibro = inventariosData.filter((i) => i.idLibro === libroData.id);
      setInventariosLibro(inventariosDeEsteLibro);
      setIdTiendaStock(inventariosDeEsteLibro[0]?.idTienda ?? tiendasData[0]?.id ?? 0);

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
  const nombreTienda = (id: number) => tiendas.find(t => t.id === id)?.nombre ?? `Tienda #${id}`;
  const totalExistencias = inventariosLibro.reduce((acc, inv) => acc + inv.cantidadDisponible, 0);

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

  const handleGuardarExistencias = async () => {
    if (!libro) return;
    if (!idTiendaStock) {
      setStockError("Selecciona una tienda");
      return;
    }
    if (cantidadStock <= 0) {
      setStockError("La cantidad debe ser mayor a 0");
      return;
    }

    setGuardandoStock(true);
    setStockError("");
    setStockMensaje("");
    try {
      const inventarioExistente = inventariosLibro.find((i) => i.idTienda === idTiendaStock);

      if (inventarioExistente) {
        if (tipoMovimientoStock === "sumar") {
          await agregarExistenciasLibro(idTiendaStock, libro.id, cantidadStock);
        } else {
          const nuevaCantidad = inventarioExistente.cantidadDisponible - cantidadStock;
          if (nuevaCantidad < 0) {
            setStockError("No puedes disminuir más de las existencias actuales");
            setGuardandoStock(false);
            return;
          }
          await actualizarCantidadInventarioLibro(idTiendaStock, libro.id, nuevaCantidad);
        }
      } else {
        if (tipoMovimientoStock === "restar") {
          setStockError("No se puede disminuir porque no existe inventario en esa tienda");
          setGuardandoStock(false);
          return;
        }
        await crearInventarioLibro(idTiendaStock, libro.id, cantidadStock);
      }

      const inventariosData = await apiFetch<InventarioLite[]>("/inventarios");
      setInventariosLibro(inventariosData.filter((i) => i.idLibro === libro.id));
      setStockMensaje("Existencias actualizadas correctamente");
      setCantidadStock(1);
    } catch (e: unknown) {
      setStockError((e as { message?: string })?.message ?? "No fue posible actualizar existencias");
    } finally {
      setGuardandoStock(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <MainNavbar />
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
        <MainNavbar />
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
      <MainNavbar />

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

                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 mb-6">
                  <div className="flex items-center justify-between gap-3 mb-2">
                    <p className="text-slate-700 text-sm font-semibold">Existencias</p>
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold border ${
                        totalExistencias > 0
                          ? "bg-green-50 text-green-700 border-green-300"
                          : "bg-red-50 text-red-700 border-red-300"
                      }`}
                    >
                      {totalExistencias > 0 ? "Disponible" : "Agotado"}
                    </span>
                  </div>

                  <p className="text-slate-900 text-base font-bold">{totalExistencias} unidades</p>

                  {inventariosLibro.length > 0 ? (
                    <div className="mt-3 space-y-1.5">
                      {inventariosLibro.map((inv) => (
                        <div
                          key={inv.id}
                          className="text-xs text-slate-600 flex items-center justify-between"
                        >
                          <span>{nombreTienda(inv.idTienda)}</span>
                          <span className="font-semibold text-slate-800">{inv.cantidadDisponible}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="mt-2 text-xs text-slate-500">Este libro no tiene inventario registrado.</p>
                  )}
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
                    {esAdmin && (
                      <button
                        onClick={() => setShowStockModal(true)}
                        className="flex items-center justify-center gap-2 px-5 py-2.5 border-2 border-amber-500 text-amber-700 rounded-xl text-sm font-semibold hover:bg-amber-50 transition-colors"
                      >
                        <Iconify icon="material-symbols:inventory-2-outline-rounded" width={20} />
                        Gestionar existencias
                      </button>
                    )}

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

        {showStockModal && (
          <div className="fixed inset-0 z-[70] bg-slate-900/55 backdrop-blur-[2px] flex items-end sm:items-center justify-center p-0 sm:p-6">
            <div className="w-full sm:max-w-lg bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl border border-slate-200 max-h-[88vh] overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
                <h3 className="text-slate-900 text-lg font-bold">Agregar existencias</h3>
                <button
                  onClick={() => setShowStockModal(false)}
                  className="w-9 h-9 rounded-lg border border-slate-300 text-slate-600 hover:bg-slate-100"
                  aria-label="Cerrar"
                >
                  <Iconify icon="mdi:close" width={18} />
                </button>
              </div>

              <div className="p-5 space-y-4">
                <p className="text-slate-600 text-sm">
                  Libro: <span className="font-semibold text-slate-800">{libro.titulo}</span>
                </p>

                <div>
                  <label className="block text-slate-700 text-sm font-semibold mb-1.5">Tienda</label>
                  <select
                    value={idTiendaStock}
                    onChange={(e) => setIdTiendaStock(Number(e.target.value))}
                    className="w-full px-3 py-2.5 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 outline-none focus:border-blue-500"
                  >
                    <option value={0}>Seleccionar tienda...</option>
                    {tiendas.map((tienda) => (
                      <option key={tienda.id} value={tienda.id}>
                        {tienda.nombre}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 text-sm font-semibold mb-1.5">Acción</label>
                  <select
                    value={tipoMovimientoStock}
                    onChange={(e) => setTipoMovimientoStock(e.target.value as "sumar" | "restar")}
                    className="w-full px-3 py-2.5 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 outline-none focus:border-blue-500"
                  >
                    <option value="sumar">Sumar existencias</option>
                    <option value="restar">Disminuir existencias</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 text-sm font-semibold mb-1.5">
                    {tipoMovimientoStock === "sumar" ? "Cantidad a agregar" : "Cantidad a disminuir"}
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={cantidadStock}
                    onChange={(e) => setCantidadStock(Number(e.target.value) || 1)}
                    className="w-full px-3 py-2.5 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 outline-none focus:border-blue-500"
                  />
                </div>

                {idTiendaStock > 0 && (
                  <p className="text-xs text-slate-500">
                    Existencias actuales en tienda: {inventariosLibro.find((i) => i.idTienda === idTiendaStock)?.cantidadDisponible ?? 0}
                  </p>
                )}

                {stockError && (
                  <div className="bg-red-50 border border-red-300 rounded-lg px-3 py-2 text-red-700 text-sm">
                    {stockError}
                  </div>
                )}
                {stockMensaje && (
                  <div className="bg-emerald-50 border border-emerald-300 rounded-lg px-3 py-2 text-emerald-700 text-sm">
                    {stockMensaje}
                  </div>
                )}

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    onClick={() => setShowStockModal(false)}
                    className="px-4 py-2 border border-slate-300 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    Cerrar
                  </button>
                  <button
                    onClick={handleGuardarExistencias}
                    disabled={guardandoStock}
                    className="px-5 py-2 bg-amber-600 text-white rounded-lg text-sm font-semibold hover:bg-amber-700 disabled:opacity-60"
                  >
                    {guardandoStock
                      ? "Guardando..."
                      : tipoMovimientoStock === "sumar"
                        ? "Sumar existencias"
                        : "Disminuir existencias"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

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

      {/* Footer */}
      <footer className="bg-slate-800 border-t border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Iconify icon="solar:book-2-bold" className="text-white" width={24} />
            </div>
            <span className="text-white font-bold">NovaLibros</span>
          </div>
          <span className="text-slate-500 text-sm">
            © 2025 NovaLibros. Todos los derechos reservados.
          </span>
        </div>
      </footer>
    </div>
  );
}
