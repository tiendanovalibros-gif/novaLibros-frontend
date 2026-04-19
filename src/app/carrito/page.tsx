"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import MainNavbar from "@/components/navigation/main-navbar";
import { useAuth } from "@/context/auth.context";
import {
  actualizarCantidadLibroMiCarrito,
  obtenerMiCarrito,
  quitarLibroDeMiCarrito,
  type CarritoResponse,
} from "@/services/carrito.service";
import {
  cancelarReserva,
  convertirReservaACarrito,
  obtenerMisReservas,
  type ReservaResponse,
} from "@/services/reservas.service";

export default function CarritoPage() {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [accionMensaje, setAccionMensaje] = useState("");
  const [carrito, setCarrito] = useState<CarritoResponse | null>(null);
  const [reservas, setReservas] = useState<ReservaResponse[]>([]);
  const [eliminandoDetalleId, setEliminandoDetalleId] = useState<number | null>(null);
  const [actualizandoCantidadId, setActualizandoCantidadId] = useState<number | null>(null);
  const [cancelandoReservaId, setCancelandoReservaId] = useState<string | null>(null);
  const [convirtiendoReservaId, setConvirtiendoReservaId] = useState<string | null>(null);

  const esCliente = user?.rol === "cliente";

  useEffect(() => {
    if (authLoading) return;

    if (!isAuthenticated || !esCliente) {
      setLoading(false);
      return;
    }

    const cargarData = async () => {
      setLoading(true);
      setError("");
      try {
        const [carritoData, reservasData] = await Promise.all([
          obtenerMiCarrito(),
          obtenerMisReservas(),
        ]);
        setCarrito(carritoData);
        setReservas(reservasData.filter(r => r.estado === "activa"));
      } catch (e: unknown) {
        setError((e as { message?: string })?.message ?? "No se pudo cargar tu carrito");
      } finally {
        setLoading(false);
      }
    };

    void cargarData();
  }, [authLoading, isAuthenticated, esCliente]);

  const totalCarrito = useMemo(() => {
    if (!carrito) return 0;
    return carrito.detalles.reduce(
      (acc, item) => acc + Number(item.precioUnitario) * item.cantidad,
      0
    );
  }, [carrito]);

  const totalUnidadesCarrito = useMemo(() => {
    if (!carrito) return 0;
    return carrito.detalles.reduce((acc, item) => acc + item.cantidad, 0);
  }, [carrito]);

  const getBookCoverUrl = (imagenPortada?: string | null) => {
    if (!imagenPortada) return null;
    if (imagenPortada.startsWith("http") || imagenPortada.startsWith("https")) return imagenPortada;
    if (imagenPortada.startsWith("/")) return `${process.env.NEXT_PUBLIC_API_URL}${imagenPortada}`;
    return null;
  };

  const handleQuitarDelCarrito = async (idDetalle: number) => {
    setEliminandoDetalleId(idDetalle);
    setError("");
    setAccionMensaje("");
    try {
      const carritoActualizado = await quitarLibroDeMiCarrito(idDetalle);
      setCarrito(carritoActualizado);
      setAccionMensaje("Libro removido del carrito");
    } catch (e: unknown) {
      setError((e as { message?: string })?.message ?? "No se pudo remover el libro del carrito");
    } finally {
      setEliminandoDetalleId(null);
    }
  };

  const handleActualizarCantidadCarrito = async (idDetalle: number, cantidad: number) => {
    if (cantidad <= 0) return;

    setActualizandoCantidadId(idDetalle);
    setError("");
    setAccionMensaje("");
    try {
      const carritoActualizado = await actualizarCantidadLibroMiCarrito(idDetalle, cantidad);
      setCarrito(carritoActualizado);
    } catch (e: unknown) {
      setError((e as { message?: string })?.message ?? "No se pudo actualizar la cantidad");
    } finally {
      setActualizandoCantidadId(null);
    }
  };

  const handleCancelarReserva = async (idReserva: string) => {
    setCancelandoReservaId(idReserva);
    setError("");
    setAccionMensaje("");
    try {
      await cancelarReserva(idReserva);
      setReservas(prev => prev.filter(reserva => reserva.id !== idReserva));
      setAccionMensaje("Reserva cancelada correctamente");
    } catch (e: unknown) {
      setError((e as { message?: string })?.message ?? "No se pudo cancelar la reserva");
    } finally {
      setCancelandoReservaId(null);
    }
  };

  const handleConvertirReservaACarrito = async (idReserva: string) => {
    setConvirtiendoReservaId(idReserva);
    setError("");
    setAccionMensaje("");
    try {
      const carritoActualizado = await convertirReservaACarrito(idReserva);
      setCarrito(carritoActualizado);
      setAccionMensaje("Reserva añadida a compra y mantenida como reservada");
    } catch (e: unknown) {
      setError((e as { message?: string })?.message ?? "No se pudo añadir la reserva a compra");
    } finally {
      setConvirtiendoReservaId(null);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <MainNavbar />
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 text-slate-600">
          Cargando carrito...
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-50">
        <MainNavbar />
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
          <div className="bg-white border border-slate-200 rounded-xl p-6 text-center">
            <p className="text-slate-800 font-semibold">
              Debes iniciar sesión para ver tu carrito.
            </p>
            <Link href="/login" className="text-blue-600 text-sm font-semibold hover:underline">
              Ir a iniciar sesión
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!esCliente) {
    return (
      <div className="min-h-screen bg-slate-50">
        <MainNavbar />
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
          <div className="bg-white border border-slate-200 rounded-xl p-6 text-center text-slate-700">
            Solo los clientes pueden gestionar carrito y reservas.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <MainNavbar />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-red-700 text-sm">
            {error}
          </div>
        )}

        {accionMensaje && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-emerald-700 text-sm">
            {accionMensaje}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_320px] gap-6 items-start">
          <section className="space-y-6">
            <section className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-slate-900 font-bold">Libros en carrito</h2>
                <span className="text-sm text-slate-500">
                  {carrito?.detalles.length ?? 0} item(s)
                </span>
              </div>

              {!carrito || carrito.detalles.length === 0 ? (
                <p className="text-slate-500 text-sm">Aún no has agregado libros al carrito.</p>
              ) : (
                <div className="space-y-3">
                  {carrito.detalles.map(item => {
                    const coverUrl = getBookCoverUrl(item.libro.imagenPortada);
                    return (
                      <div
                        key={item.id}
                        className="border border-slate-200 rounded-xl p-3 flex gap-3 items-stretch"
                      >
                        <div className="w-20 self-stretch rounded-lg overflow-hidden bg-slate-100 shrink-0 border border-slate-200">
                          {coverUrl ? (
                            <img
                              src={coverUrl}
                              alt={`Portada de ${item.libro.titulo}`}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-500 text-xl font-bold">
                              {item.libro.titulo.charAt(0).toUpperCase()}
                            </div>
                          )}
                        </div>

                        <div className="flex-1 min-w-0 flex flex-col">
                          <div className="flex items-start justify-between gap-3">
                            <p className="text-slate-900 font-semibold line-clamp-2">
                              {item.libro.titulo}
                            </p>
                            <span className="text-blue-700 font-bold text-sm shrink-0">
                              $
                              {(Number(item.precioUnitario) * item.cantidad).toLocaleString(
                                "es-CO"
                              )}
                            </span>
                          </div>
                          <p className="text-slate-500 text-xs mt-1">ISBN: {item.libro.isbn}</p>
                          <div className="mt-1 flex items-center gap-2">
                            <span className="text-slate-500 text-xs">Cantidad:</span>
                            <div className="inline-flex items-center rounded-lg border border-slate-300 overflow-hidden">
                              <button
                                onClick={() =>
                                  void handleActualizarCantidadCarrito(item.id, item.cantidad - 1)
                                }
                                disabled={
                                  item.cantidad <= 1 ||
                                  actualizandoCantidadId === item.id ||
                                  eliminandoDetalleId === item.id
                                }
                                className="w-7 h-7 text-sm font-bold text-slate-700 hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                -
                              </button>
                              <span className="w-8 text-center text-xs font-semibold text-slate-800">
                                {item.cantidad}
                              </span>
                              <button
                                onClick={() =>
                                  void handleActualizarCantidadCarrito(item.id, item.cantidad + 1)
                                }
                                disabled={
                                  actualizandoCantidadId === item.id ||
                                  eliminandoDetalleId === item.id
                                }
                                className="w-7 h-7 text-sm font-bold text-slate-700 hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                +
                              </button>
                            </div>
                          </div>
                          <p className="text-slate-600 text-xs mt-0.5">
                            ${Number(item.precioUnitario).toLocaleString("es-CO")} c/u
                          </p>

                          <div className="mt-auto pt-3 flex justify-end">
                            <button
                              onClick={() => void handleQuitarDelCarrito(item.id)}
                              disabled={eliminandoDetalleId === item.id}
                              className="px-3 py-1.5 rounded-lg border border-red-200 text-red-700 text-xs font-semibold hover:bg-red-50 disabled:opacity-60 disabled:cursor-not-allowed"
                            >
                              {eliminandoDetalleId === item.id ? "Removiendo..." : "Remover"}
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>

            <section className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-slate-900 font-bold">Reservas activas</h2>
                <span className="text-sm text-slate-500">{reservas.length} reserva(s)</span>
              </div>

              {reservas.length === 0 ? (
                <p className="text-slate-500 text-sm">No tienes reservas activas.</p>
              ) : (
                <div className="space-y-3">
                  {reservas.flatMap(reserva =>
                    reserva.itemsReserva.map(item => {
                      const coverUrl = getBookCoverUrl(item.libro?.imagenPortada);
                      const titulo = item.libro?.titulo ?? item.idLibro;

                      return (
                        <div
                          key={`${reserva.id}-${item.id}`}
                          className="border border-slate-200 rounded-xl p-3 flex gap-3 items-stretch"
                        >
                          <div className="w-20 self-stretch rounded-lg overflow-hidden bg-slate-100 shrink-0 border border-slate-200">
                            {coverUrl ? (
                              <img
                                src={coverUrl}
                                alt={`Portada de ${titulo}`}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-slate-500 text-xl font-bold">
                                {titulo.charAt(0).toUpperCase()}
                              </div>
                            )}
                          </div>

                          <div className="flex-1 min-w-0 flex flex-col">
                            <div className="flex items-start justify-between gap-3">
                              <p className="text-slate-900 font-semibold line-clamp-2">{titulo}</p>
                              <span className="text-amber-700 font-bold text-sm shrink-0">
                                x{item.cantidad}
                              </span>
                            </div>
                            <p className="text-slate-500 text-xs mt-1">
                              ISBN: {item.libro?.isbn ?? "No disponible"}
                            </p>
                            <p className="text-slate-600 text-xs mt-0.5">
                              Expira: {new Date(reserva.horaExpiracion).toLocaleString("es-CO")}
                            </p>
                            <p className="text-slate-600 text-xs mt-0.5">
                              Reservados: {item.cantidad}
                            </p>

                            <div className="mt-auto pt-3 flex items-center justify-end gap-2">
                              <button
                                onClick={() => void handleConvertirReservaACarrito(reserva.id)}
                                disabled={
                                  convirtiendoReservaId === reserva.id ||
                                  cancelandoReservaId === reserva.id
                                }
                                className="px-3 py-1.5 rounded-lg border border-blue-200 text-blue-700 text-xs font-semibold hover:bg-blue-50 disabled:opacity-60 disabled:cursor-not-allowed"
                              >
                                {convirtiendoReservaId === reserva.id
                                  ? "Añadiendo..."
                                  : "Añadir a compra"}
                              </button>
                              <button
                                onClick={() => void handleCancelarReserva(reserva.id)}
                                disabled={
                                  cancelandoReservaId === reserva.id ||
                                  convirtiendoReservaId === reserva.id
                                }
                                className="px-3 py-1.5 rounded-lg border border-amber-300 text-amber-800 text-xs font-semibold hover:bg-amber-100 disabled:opacity-60 disabled:cursor-not-allowed"
                              >
                                {cancelandoReservaId === reserva.id
                                  ? "Cancelando..."
                                  : "Cancelar reserva"}
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              )}
            </section>
          </section>

          <aside className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 lg:sticky lg:top-24">
            <h2 className="text-slate-900 font-bold mb-4">Resumen de compra</h2>

            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between text-slate-600">
                <span>Productos</span>
                <span>{carrito?.detalles.length ?? 0}</span>
              </div>
              <div className="flex items-center justify-between text-slate-600">
                <span>Unidades</span>
                <span>{totalUnidadesCarrito}</span>
              </div>
              <div className="flex items-center justify-between text-slate-600">
                <span>Subtotal</span>
                <span>${totalCarrito.toLocaleString("es-CO")}</span>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
              <span className="text-slate-700 font-semibold">Total</span>
              <span className="text-slate-900 text-xl font-bold">
                ${totalCarrito.toLocaleString("es-CO")}
              </span>
            </div>

            <button
              disabled={!carrito || carrito.detalles.length === 0}
              className="mt-5 w-full py-2.5 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
            >
              Comprar
            </button>
          </aside>
        </div>
      </main>
    </div>
  );
}
