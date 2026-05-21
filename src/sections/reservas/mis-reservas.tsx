"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Iconify from "@/components/iconify/iconify";
import ConfirmCancelarReservaDialog, {
  type ReservaCancelarPreview,
} from "@/components/reservas/confirm-cancelar-reserva-dialog";
import { obtenerMiCarrito, type CarritoResponse } from "@/services/carrito.service";
import {
  cancelarReserva,
  convertirReservaACarrito,
  obtenerMisReservas,
  type ReservaResponse,
} from "@/services/reservas.service";

type FiltroReservas = "activas" | "historial" | "todas";

const ESTADO_RESERVA: Record<
  ReservaResponse["estado"],
  { label: string; badge: string; icon: string }
> = {
  activa: {
    label: "Activa",
    badge: "bg-emerald-100 text-emerald-800 border-emerald-200",
    icon: "solar:bookmark-bold",
  },
  expirada: {
    label: "Expirada",
    badge: "bg-slate-100 text-slate-600 border-slate-200",
    icon: "solar:clock-circle-bold",
  },
  cancelada: {
    label: "Cancelada",
    badge: "bg-red-50 text-red-700 border-red-200",
    icon: "solar:close-circle-bold",
  },
  convertida: {
    label: "En carrito",
    badge: "bg-blue-50 text-blue-700 border-blue-200",
    icon: "solar:cart-check-bold",
  },
};

function getBookCoverUrl(imagenPortada?: string | null) {
  if (!imagenPortada) return null;
  if (imagenPortada.startsWith("http")) return imagenPortada;
  if (imagenPortada.startsWith("/")) {
    return `${process.env.NEXT_PUBLIC_API_URL}${imagenPortada}`;
  }
  return null;
}

function formatFecha(iso: string) {
  try {
    return new Date(iso).toLocaleString("es-CO", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  } catch {
    return iso;
  }
}

function tiempoRestante(horaExpiracion: string): string | null {
  const ms = new Date(horaExpiracion).getTime() - Date.now();
  if (ms <= 0) return null;
  const horas = Math.floor(ms / (1000 * 60 * 60));
  const minutos = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
  if (horas >= 24) {
    const dias = Math.floor(horas / 24);
    return `${dias} día${dias === 1 ? "" : "s"} restante${dias === 1 ? "" : "s"}`;
  }
  if (horas > 0) return `${horas} h ${minutos} min restantes`;
  return `${minutos} min restantes`;
}

export default function MisReservas() {
  const [reservas, setReservas] = useState<ReservaResponse[]>([]);
  const [carrito, setCarrito] = useState<CarritoResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [filtro, setFiltro] = useState<FiltroReservas>("activas");
  const [busqueda, setBusqueda] = useState("");
  const [cancelandoReservaId, setCancelandoReservaId] = useState<string | null>(null);
  const [convirtiendoReservaId, setConvirtiendoReservaId] = useState<string | null>(null);
  const [reservaACancelar, setReservaACancelar] = useState<ReservaCancelarPreview | null>(null);

  const cargar = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [reservasData, carritoData] = await Promise.all([
        obtenerMisReservas(),
        obtenerMiCarrito().catch(() => null),
      ]);
      setReservas(reservasData);
      setCarrito(carritoData);
    } catch (e: unknown) {
      setError((e as { message?: string })?.message ?? "No se pudieron cargar tus reservas");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void cargar();
  }, [cargar]);

  useEffect(() => {
    if (!mensaje) return;
    const t = window.setTimeout(() => setMensaje(""), 4000);
    return () => window.clearTimeout(t);
  }, [mensaje]);

  const cantidadEnCarritoPorLibro = useMemo(() => {
    const map = new Map<string, number>();
    for (const item of carrito?.detalles ?? []) {
      map.set(item.idLibro, (map.get(item.idLibro) ?? 0) + item.cantidad);
    }
    return map;
  }, [carrito]);

  const resumen = useMemo(() => {
    const activas = reservas.filter(r => r.estado === "activa");
    const unidadesActivas = activas.reduce(
      (acc, r) => acc + r.itemsReserva.reduce((s, i) => s + i.cantidad, 0),
      0
    );
    const proximaExpirar = activas
      .map(r => new Date(r.horaExpiracion).getTime())
      .filter(t => t > Date.now())
      .sort((a, b) => a - b)[0];
    return {
      activas: activas.length,
      unidadesActivas,
      total: reservas.length,
      proximaExpirar: proximaExpirar ? new Date(proximaExpirar) : null,
    };
  }, [reservas]);

  const reservasFiltradas = useMemo(() => {
    const q = busqueda.trim().toLowerCase();
    return reservas.filter(reserva => {
      if (filtro === "activas" && reserva.estado !== "activa") return false;
      if (filtro === "historial" && reserva.estado === "activa") return false;
      if (!q) return true;
      return reserva.itemsReserva.some(
        item =>
          (item.libro?.titulo ?? "").toLowerCase().includes(q) ||
          (item.libro?.isbn ?? "").toLowerCase().includes(q)
      );
    });
  }, [reservas, filtro, busqueda]);

  const abrirDialogoCancelar = (reserva: ReservaResponse) => {
    const item = reserva.itemsReserva[0];
    if (!item) return;
    setReservaACancelar({
      id: reserva.id,
      titulo: item.libro?.titulo ?? item.idLibro,
      isbn: item.libro?.isbn ?? "—",
      cantidad: item.cantidad,
      horaExpiracion: reserva.horaExpiracion,
    });
  };

  const handleConfirmarCancelar = async () => {
    if (!reservaACancelar) return;
    const id = reservaACancelar.id;
    setCancelandoReservaId(id);
    setError("");
    try {
      await cancelarReserva(id);
      setReservas(prev =>
        prev.map(r => (r.id === id ? { ...r, estado: "cancelada" as const } : r))
      );
      setReservaACancelar(null);
      setMensaje("Reserva cancelada correctamente");
      await cargar();
    } catch (e: unknown) {
      setError((e as { message?: string })?.message ?? "No se pudo cancelar la reserva");
    } finally {
      setCancelandoReservaId(null);
    }
  };

  const handleConvertirACarrito = async (idReserva: string) => {
    setConvirtiendoReservaId(idReserva);
    setError("");
    try {
      const carritoActualizado = await convertirReservaACarrito(idReserva);
      setCarrito(carritoActualizado);
      setMensaje("Libro añadido al carrito. La reserva sigue activa.");
    } catch (e: unknown) {
      setError((e as { message?: string })?.message ?? "No se pudo añadir al carrito");
    } finally {
      setConvirtiendoReservaId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Mis reservas</h1>
          <p className="text-slate-500 text-sm mt-1 max-w-xl">
            Apartaste libros temporalmente. Las reservas activas duran 24 horas; después se liberan
            si no compras o cancelas.
          </p>
        </div>
        <button
          type="button"
          onClick={() => void cargar()}
          disabled={loading}
          className="inline-flex items-center gap-2 px-4 py-2 border border-slate-300 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-60 shrink-0"
        >
          <Iconify icon="solar:refresh-bold" width={16} />
          Actualizar
        </button>
      </div>

      {(error || mensaje) && (
        <div
          className={`rounded-xl px-4 py-3 text-sm border ${
            error
              ? "bg-red-50 border-red-200 text-red-700"
              : "bg-emerald-50 border-emerald-200 text-emerald-700"
          }`}
        >
          {error || mensaje}
        </div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <p className="text-2xl font-bold text-emerald-600">{resumen.activas}</p>
          <p className="text-xs text-slate-500 mt-0.5">Reservas activas</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <p className="text-2xl font-bold text-slate-900">{resumen.unidadesActivas}</p>
          <p className="text-xs text-slate-500 mt-0.5">Libros apartados</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <p className="text-2xl font-bold text-slate-900">{resumen.total}</p>
          <p className="text-xs text-slate-500 mt-0.5">Total historial</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <p className="text-sm font-bold text-amber-700 leading-snug">
            {resumen.proximaExpirar
              ? formatFecha(resumen.proximaExpirar.toISOString())
              : "—"}
          </p>
          <p className="text-xs text-slate-500 mt-0.5">Próxima expiración</p>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-4">
        <div className="flex flex-wrap gap-2">
          {(
            [
              { id: "activas" as const, label: "Activas" },
              { id: "historial" as const, label: "Historial" },
              { id: "todas" as const, label: "Todas" },
            ] as const
          ).map(tab => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setFiltro(tab.id)}
              className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors ${
                filtro === tab.id
                  ? "bg-blue-600 text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="relative">
          <Iconify
            icon="solar:magnifer-linear"
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            width={18}
          />
          <input
            type="text"
            value={busqueda}
            onChange={e => setBusqueda(e.target.value)}
            placeholder="Buscar por título o ISBN..."
            className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-xl text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          />
        </div>
      </div>

      {loading ? (
        <div className="py-20 text-center text-slate-500 text-sm">Cargando reservas...</div>
      ) : reservasFiltradas.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl py-16 px-6 text-center">
          <Iconify icon="solar:bookmark-opened-bold" className="mx-auto text-slate-300" width={48} />
          <p className="font-semibold text-slate-700 mt-4">
            {filtro === "activas"
              ? "No tienes reservas activas"
              : "No hay reservas en este filtro"}
          </p>
          <p className="text-slate-500 text-sm mt-2 max-w-sm mx-auto">
            Explora el catálogo y reserva un libro cuando quieras apartarlo antes de comprar.
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 mt-6 px-5 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700"
          >
            <Iconify icon="solar:book-2-bold" width={18} />
            Ir al catálogo
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {reservasFiltradas.map(reserva => {
            const config = ESTADO_RESERVA[reserva.estado];
            const restante =
              reserva.estado === "activa" ? tiempoRestante(reserva.horaExpiracion) : null;
            const esActiva = reserva.estado === "activa";

            return (
              <article
                key={reserva.id}
                className="bg-white border border-slate-200 rounded-2xl overflow-hidden"
              >
                <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 bg-slate-50 border-b border-slate-100">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${config.badge}`}
                    >
                      <Iconify icon={config.icon} width={14} />
                      {config.label}
                    </span>
                    {restante && (
                      <span className="text-xs font-semibold text-amber-700 bg-amber-50 px-2 py-1 rounded-full">
                        {restante}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500">
                    Creada {formatFecha(reserva.horaCreacion)}
                    {esActiva && (
                      <> · Expira {formatFecha(reserva.horaExpiracion)}</>
                    )}
                  </p>
                </div>

                <div className="p-4 space-y-3">
                  {reserva.itemsReserva.map(item => {
                    const titulo = item.libro?.titulo ?? item.idLibro;
                    const coverUrl = getBookCoverUrl(item.libro?.imagenPortada);
                    const cantidadCarrito = cantidadEnCarritoPorLibro.get(item.idLibro) ?? 0;
                    const yaEnCarrito = cantidadCarrito >= item.cantidad;

                    return (
                      <div
                        key={item.id}
                        className="flex gap-3 border border-slate-100 rounded-xl p-3"
                      >
                        <Link
                          href={`/books/${item.idLibro}`}
                          className="w-16 shrink-0 rounded-lg overflow-hidden bg-slate-100 border border-slate-200 block"
                        >
                          {coverUrl ? (
                            <img
                              src={coverUrl}
                              alt=""
                              className="w-full h-full min-h-[88px] object-cover"
                            />
                          ) : (
                            <div className="w-full min-h-[88px] flex items-center justify-center text-slate-400 text-xl font-bold">
                              {titulo.charAt(0)}
                            </div>
                          )}
                        </Link>

                        <div className="flex-1 min-w-0 flex flex-col">
                          <Link
                            href={`/books/${item.idLibro}`}
                            className="text-slate-900 font-semibold text-sm hover:text-blue-600 line-clamp-2"
                          >
                            {titulo}
                          </Link>
                          <p className="text-xs text-slate-500 mt-1">ISBN {item.libro?.isbn ?? "—"}</p>
                          <p className="text-sm text-amber-800 font-semibold mt-1">
                            Cantidad reservada: {item.cantidad}
                          </p>
                          {yaEnCarrito && (
                            <p className="text-xs text-emerald-700 font-medium mt-0.5">
                              Ya en tu carrito ({cantidadCarrito} uds.)
                            </p>
                          )}

                          {esActiva && (
                            <div className="mt-auto pt-3 flex flex-wrap gap-2 justify-end">
                              <button
                                type="button"
                                onClick={() => void handleConvertirACarrito(reserva.id)}
                                disabled={
                                  yaEnCarrito ||
                                  convirtiendoReservaId === reserva.id ||
                                  cancelandoReservaId === reserva.id
                                }
                                className="px-3 py-1.5 rounded-lg border border-blue-200 text-blue-700 text-xs font-semibold hover:bg-blue-50 disabled:opacity-60"
                              >
                                {convirtiendoReservaId === reserva.id
                                  ? "Añadiendo..."
                                  : yaEnCarrito
                                    ? "En carrito"
                                    : "Añadir al carrito"}
                              </button>
                              <button
                                type="button"
                                onClick={() => abrirDialogoCancelar(reserva)}
                                disabled={
                                  cancelandoReservaId === reserva.id ||
                                  convirtiendoReservaId === reserva.id
                                }
                                className="px-3 py-1.5 rounded-lg border border-red-200 text-red-700 text-xs font-semibold hover:bg-red-50 disabled:opacity-60"
                              >
                                Cancelar
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </article>
            );
          })}
        </div>
      )}

      <div className="flex flex-wrap gap-3 justify-center pt-2">
        <Link
          href="/carrito"
          className="inline-flex items-center gap-2 px-4 py-2 border border-slate-300 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-50"
        >
          <Iconify icon="solar:cart-large-2-bold" width={18} />
          Ver carrito
        </Link>
      </div>

      <ConfirmCancelarReservaDialog
        isOpen={reservaACancelar !== null}
        reserva={reservaACancelar}
        isLoading={reservaACancelar !== null && cancelandoReservaId === reservaACancelar.id}
        onConfirm={() => void handleConfirmarCancelar()}
        onClose={() => {
          if (cancelandoReservaId) return;
          setReservaACancelar(null);
        }}
      />
    </div>
  );
}
