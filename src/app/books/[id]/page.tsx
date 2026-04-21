"use client";

import { useState, useEffect, useMemo } from "react";
import { useParams } from "next/navigation";
import { apiFetch } from "@/services/api.client";
import { useAuth } from "@/context/auth.context";
import {
  agregarExistenciasLibro,
  actualizarCantidadInventarioLibro,
  crearInventarioLibro,
} from "@/services/inventarios.service";
import {
  crearReserva,
  obtenerMisReservas,
  type ReservaResponse,
} from "@/services/reservas.service";
import { agregarLibroAMiCarrito } from "@/services/carrito.service";
import Iconify from "@/components/iconify/iconify";
import MainNavbar from "@/components/navigation/main-navbar";
import StockManagerModal from "@/components/inventarios/stock-manager-modal";
import AddToCartDialog from "@/components/carrito/add-to-cart-dialog";
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

const MAX_RESERVA_MISMO_LIBRO = 3;
const MAX_RESERVA_TOTAL = 5;

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
  const esCliente = user?.rol === "cliente";

  const [libro, setLibro] = useState<Libro | null>(null);
  const [autores, setAutores] = useState<Autor[]>([]);
  const [generos, setGeneros] = useState<Genero[]>([]);
  const [editoriales, setEditoriales] = useState<Editorial[]>([]);
  const [tiendas, setTiendas] = useState<TiendaLite[]>([]);
  const [inventariosLibro, setInventariosLibro] = useState<InventarioLite[]>([]);
  const [librosRelacionados, setLibrosRelacionados] = useState<Libro[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showReservaConfirmModal, setShowReservaConfirmModal] = useState(false);
  const [cantidadReserva, setCantidadReserva] = useState(1);
  const [misReservas, setMisReservas] = useState<ReservaResponse[]>([]);
  const [showCarritoConfirmModal, setShowCarritoConfirmModal] = useState(false);
  const [reservando, setReservando] = useState(false);
  const [reservaMensaje, setReservaMensaje] = useState("");
  const [reservaError, setReservaError] = useState("");
  const [agregando, setAgregando] = useState(false);
  const [carritoMensaje, setCarritoMensaje] = useState("");
  const [carritoError, setCarritoError] = useState("");
  const [showStockModal, setShowStockModal] = useState(false);
  const [idTiendaStock, setIdTiendaStock] = useState<number>(0);
  const [cantidadStock, setCantidadStock] = useState<number>(1);
  const [tipoMovimientoStock, setTipoMovimientoStock] = useState<"sumar" | "restar">("sumar");
  const [guardandoStock, setGuardandoStock] = useState(false);
  const [stockMensaje, setStockMensaje] = useState("");
  const [stockError, setStockError] = useState("");

  useEffect(() => {
    cargarDatos();
  }, [libroId, esCliente]);

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
      const [
        libroData,
        autoresData,
        generosData,
        editorialesData,
        tiendasData,
        inventariosData,
        reservasData,
      ] = await Promise.all([
        apiFetch<Libro>(`/libros/${libroId}`),
        apiFetch<Autor[]>("/autores"),
        apiFetch<Genero[]>("/generos"),
        apiFetch<Editorial[]>("/editoriales"),
        apiFetch<TiendaLite[]>("/tiendas").catch(() => []),
        apiFetch<InventarioLite[]>("/inventarios").catch(() => []),
        esCliente ? obtenerMisReservas().catch(() => []) : Promise.resolve([]),
      ]);

      setLibro(libroData);
      setAutores(autoresData);
      setGeneros(generosData);
      setEditoriales(editorialesData);
      setTiendas(tiendasData);
      const inventariosDeEsteLibro = inventariosData.filter(i => i.idLibro === libroData.id);
      setInventariosLibro(inventariosDeEsteLibro);
      setMisReservas(reservasData);
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

  const reservasActivas = useMemo(() => {
    const ahora = new Date();
    return misReservas.filter(
      reserva => reserva.estado === "activa" && new Date(reserva.horaExpiracion) > ahora
    );
  }, [misReservas]);

  const totalReservadoActivo = useMemo(() => {
    return reservasActivas.reduce(
      (total, reserva) =>
        total + reserva.itemsReserva.reduce((subTotal, item) => subTotal + item.cantidad, 0),
      0
    );
  }, [reservasActivas]);

  const totalReservadoMismoLibro = useMemo(() => {
    if (!libro) return 0;
    return reservasActivas.reduce(
      (total, reserva) =>
        total +
        reserva.itemsReserva
          .filter(item => item.idLibro === libro.id)
          .reduce((subTotal, item) => subTotal + item.cantidad, 0),
      0
    );
  }, [reservasActivas, libro]);

  const maxCantidadReservable = useMemo(() => {
    const restanteMismoLibro = Math.max(0, MAX_RESERVA_MISMO_LIBRO - totalReservadoMismoLibro);
    const restanteTotal = Math.max(0, MAX_RESERVA_TOTAL - totalReservadoActivo);
    return Math.max(0, Math.min(restanteMismoLibro, restanteTotal, totalExistencias));
  }, [totalReservadoMismoLibro, totalReservadoActivo, totalExistencias]);

  useEffect(() => {
    if (!showReservaConfirmModal) return;
    if (maxCantidadReservable <= 0) {
      setCantidadReserva(1);
      return;
    }
    setCantidadReserva(prev => Math.min(Math.max(prev, 1), maxCantidadReservable));
  }, [showReservaConfirmModal, maxCantidadReservable]);

  const handleConfirmarReserva = async () => {
    if (!libro) return;

    setReservando(true);
    setReservaError("");
    setReservaMensaje("");

    try {
      const reserva = await crearReserva({
        idLibro: libro.id,
        cantidad: cantidadReserva,
      });

      setReservaMensaje(
        `Reserva creada. Expira el ${new Date(reserva.horaExpiracion).toLocaleString("es-CO")}`
      );
      setShowReservaConfirmModal(false);
      await cargarDatos();
    } catch (e: unknown) {
      setReservaError((e as { message?: string })?.message ?? "No se pudo crear la reserva");
    } finally {
      setReservando(false);
    }
  };

  const handleConfirmarAgregarCarrito = async (cantidad: number) => {
    if (!libro) return;

    setAgregando(true);
    setCarritoError("");
    setCarritoMensaje("");

    try {
      await agregarLibroAMiCarrito({
        idLibro: libro.id,
        cantidad,
      });

      setCarritoMensaje(`Se agregaron ${cantidad} unidad(es) al carrito: ${libro.titulo}`);
      setShowCarritoConfirmModal(false);
    } catch (e: unknown) {
      setCarritoError(
        (e as { message?: string })?.message ?? "No se pudo agregar el libro al carrito"
      );
    } finally {
      setAgregando(false);
    }
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
      const inventarioExistente = inventariosLibro.find(i => i.idTienda === idTiendaStock);

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
      setInventariosLibro(inventariosData.filter(i => i.idLibro === libro.id));
      setStockMensaje("Existencias actualizadas correctamente");
      setCantidadStock(1);
    } catch (e: unknown) {
      setStockError(
        (e as { message?: string })?.message ?? "No fue posible actualizar existencias"
      );
    } finally {
      setGuardandoStock(false);
    }
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
                      {inventariosLibro.map(inv => (
                        <div
                          key={inv.id}
                          className="text-xs text-slate-600 flex items-center justify-between"
                        >
                          <span>{nombreTienda(inv.idTienda)}</span>
                          <span className="font-semibold text-slate-800">
                            {inv.cantidadDisponible}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="mt-2 text-xs text-slate-500">
                      Este libro no tiene inventario registrado.
                    </p>
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
                    <p className="text-slate-600 text-sm mt-1">
                      Existencias disponibles:{" "}
                      <span className="font-semibold">{totalExistencias}</span>
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
                      onClick={() => setShowReservaConfirmModal(true)}
                      disabled={reservando || !esCliente}
                      className="flex items-center justify-center gap-2 px-5 py-2.5 border-2 border-blue-600 text-blue-600 rounded-xl text-sm font-semibold hover:bg-blue-50 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
                    >
                      <Iconify icon="material-symbols:bookmark-outline" width={22} />
                      {reservando ? "Reservando..." : "Reservar"}
                    </button>

                    {/* Agregar al carrito */}
                    <button
                      onClick={() => setShowCarritoConfirmModal(true)}
                      disabled={agregando || !esCliente}
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

                {reservaError && (
                  <div className="mt-3 bg-red-50 border border-red-200 rounded-xl p-3 text-red-700 text-sm">
                    {reservaError}
                  </div>
                )}

                {reservaMensaje && (
                  <div className="mt-3 bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-emerald-700 text-sm">
                    {reservaMensaje}
                  </div>
                )}

                {carritoError && (
                  <div className="mt-3 bg-red-50 border border-red-200 rounded-xl p-3 text-red-700 text-sm">
                    {carritoError}
                  </div>
                )}

                {carritoMensaje && (
                  <div className="mt-3 bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-emerald-700 text-sm">
                    {carritoMensaje}
                  </div>
                )}

                {/* Aviso visitante */}
                {!user && (
                  <div className="mt-4 bg-blue-50 border border-blue-200 rounded-xl p-3 flex items-start gap-2">
                    <Iconify icon="gg:lock" width={15} />
                    <p className="text-blue-800 text-xs leading-relaxed">
                      Debes{" "}
                      <a href="/login" className="font-semibold underline">
                        iniciar sesión
                      </a>{" "}
                      para reservar o agregar al carrito.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <StockManagerModal
          isOpen={showStockModal}
          title="Gestionar existencias"
          libroTitulo={libro.titulo}
          tiendas={tiendas}
          inventarios={inventariosLibro}
          idTienda={idTiendaStock}
          cantidad={cantidadStock}
          tipoMovimiento={tipoMovimientoStock}
          loading={guardandoStock}
          error={stockError}
          message={stockMensaje}
          onClose={() => setShowStockModal(false)}
          onChangeTienda={setIdTiendaStock}
          onChangeCantidad={setCantidadStock}
          onChangeTipoMovimiento={setTipoMovimientoStock}
          onSubmit={handleGuardarExistencias}
        />

        {showReservaConfirmModal && (
          <div className="fixed inset-0 z-[70] bg-slate-900/55 backdrop-blur-[2px] flex items-end sm:items-center justify-center p-0 sm:p-6">
            <div className="w-full sm:max-w-md bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                    <Iconify icon="solar:book-2-bold" className="text-white" width={20} />
                  </div>
                  <span className="text-slate-900 text-sm font-bold tracking-tight">
                    NovaLibros
                  </span>
                </div>
                <button
                  onClick={() => setShowReservaConfirmModal(false)}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-300 text-slate-600 leading-none hover:bg-slate-100"
                  aria-label="Cerrar"
                >
                  <Iconify icon="mdi:close" width={18} />
                </button>
              </div>

              <div className="p-5 space-y-3">
                <h3 className="text-slate-900 text-lg font-bold">Confirmar reserva</h3>
                <p className="text-slate-600 text-sm">
                  Estás a punto de reservar:{" "}
                  <span className="font-semibold text-slate-900">{libro.titulo}</span>
                </p>
                <div className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-slate-700 text-sm font-semibold">Cantidad a reservar</p>
                    <div className="inline-flex items-center rounded-lg border border-slate-300 overflow-hidden">
                      <button
                        onClick={() => setCantidadReserva(prev => Math.max(1, prev - 1))}
                        disabled={reservando || cantidadReserva <= 1 || maxCantidadReservable <= 0}
                        className="w-8 h-8 text-sm font-bold text-slate-700 hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        -
                      </button>
                      <span className="w-10 text-center text-sm font-semibold text-slate-900">
                        {cantidadReserva}
                      </span>
                      <button
                        onClick={() =>
                          setCantidadReserva(prev => Math.min(maxCantidadReservable, prev + 1))
                        }
                        disabled={
                          reservando ||
                          cantidadReserva >= maxCantidadReservable ||
                          maxCantidadReservable <= 0
                        }
                        className="w-8 h-8 text-sm font-bold text-slate-700 hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        +
                      </button>
                    </div>
                  </div>
                  <p className="text-xs text-slate-500 mt-2">
                    Límite por libro: {MAX_RESERVA_MISMO_LIBRO}. Límite total activo:{" "}
                    {MAX_RESERVA_TOTAL}. Puedes reservar hasta {maxCantidadReservable} unidad(es)
                    ahora.
                  </p>
                </div>
                {maxCantidadReservable <= 0 && (
                  <div className="bg-red-50 border border-red-200 rounded-lg px-3 py-2 text-red-700 text-sm">
                    No puedes reservar más unidades de este libro ahora por límites de reserva o
                    falta de existencias.
                  </div>
                )}
                <div className="bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 text-amber-800 text-sm">
                  Tu reserva expirará en 24 horas. Si no se completa, el libro se liberará
                  automáticamente.
                </div>

                <div className="pt-2 flex items-center justify-end gap-3">
                  <button
                    onClick={() => setShowReservaConfirmModal(false)}
                    className="px-4 py-2 border border-slate-300 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleConfirmarReserva}
                    disabled={reservando || maxCantidadReservable <= 0}
                    className="px-5 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 disabled:opacity-60"
                  >
                    {reservando ? "Reservando..." : "Reservar"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        <AddToCartDialog
          isOpen={showCarritoConfirmModal}
          libroTitulo={libro.titulo}
          isLoading={agregando}
          onClose={() => setShowCarritoConfirmModal(false)}
          onConfirm={handleConfirmarAgregarCarrito}
        />

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
