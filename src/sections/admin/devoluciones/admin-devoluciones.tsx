"use client";

import { useState, useEffect, useCallback } from "react";
import Iconify from "@/components/iconify/iconify";
import EstadoBadge from "@/components/pedidos/estado-badge";
import AdminDevolucionDetalleDialog from "./admin-devolucion-detalle-dialog";
import {
  obtenerTodasLasDevoluciones,
  cambiarEstadoDevolucion,
  obtenerDevolucion,
} from "@/services/devoluciones.service";
import type { Devolucion } from "@/types/pedidos.types";

export default function AdminDevoluciones() {
  const [devoluciones, setDevoluciones] = useState<Devolucion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filtro, setFiltro] = useState<"todas" | "solicitada" | "aprobada" | "rechazada">("todas");

  const [seleccionada, setSeleccionada] = useState<Devolucion | null>(null);
  const [detalleOpen, setDetalleOpen] = useState(false);
  const [loadingDetalle, setLoadingDetalle] = useState(false);
  const [procesando, setProcesando] = useState(false);

  const cargar = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await obtenerTodasLasDevoluciones();
      setDevoluciones(data);
    } catch {
      setError("No se pudieron cargar las devoluciones.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void cargar();
  }, [cargar]);

  const abrirDetalle = async (id: string) => {
    setLoadingDetalle(true);
    try {
      const data = await obtenerDevolucion(id);
      setSeleccionada(data);
      setDetalleOpen(true);
    } catch {
      // silencioso
    } finally {
      setLoadingDetalle(false);
    }
  };

  const handleCambiarEstado = async (id: string, estado: "aprobada" | "rechazada") => {
    setProcesando(true);
    try {
      await cambiarEstadoDevolucion(id, estado);
      await cargar();
      setDetalleOpen(false);
    } catch (err: any) {
      setError(err?.message ?? "Error al actualizar el estado");
    } finally {
      setProcesando(false);
    }
  };

  const devolucionesFiltradas =
    filtro === "todas" ? devoluciones : devoluciones.filter(d => d.estado === filtro);

  const conteos = {
    todas: devoluciones.length,
    solicitada: devoluciones.filter(d => d.estado === "solicitada").length,
    aprobada: devoluciones.filter(d => d.estado === "aprobada").length,
    rechazada: devoluciones.filter(d => d.estado === "rechazada").length,
  };

  return (
    <>
      <div className="space-y-5">
        {/* Filtros */}
        <div className="flex flex-wrap gap-2">
          {(["todas", "solicitada", "aprobada", "rechazada"] as const).map(f => (
            <button
              key={f}
              onClick={() => setFiltro(f)}
              className={`rounded-full px-4 py-1.5 text-xs font-medium transition-colors
                ${
                  filtro === f
                    ? "bg-slate-900 text-white"
                    : "border border-slate-200 text-slate-600 hover:bg-slate-50"
                }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
              <span className="ml-1.5 opacity-70">({conteos[f]})</span>
            </button>
          ))}
        </div>

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-20 animate-pulse rounded-2xl bg-slate-100" />
            ))}
          </div>
        ) : devolucionesFiltradas.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-slate-100">
              <Iconify icon="solar:arrow-left-broken" width={28} className="text-slate-400" />
            </div>
            <p className="text-sm font-semibold text-slate-700">Sin devoluciones</p>
          </div>
        ) : (
          <div className="space-y-3">
            {devolucionesFiltradas.map(d => (
              <div
                key={d.id}
                className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0 space-y-0.5">
                    <p className="text-xs text-slate-500">{d.pedido?.numeroOrden ?? d.idPedido}</p>
                    <p className="text-sm font-semibold text-slate-900 truncate">{d.razon}</p>
                    {d.descripcion && (
                      <p className="text-xs text-slate-500 truncate">{d.descripcion}</p>
                    )}
                    {d.pedido?.fechaOrden && (
                      <p className="text-xs text-slate-400">
                        {new Date(d.pedido.fechaOrden).toLocaleDateString("es-CO", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </p>
                    )}
                  </div>
                  <EstadoBadge estado={d.estado} />
                </div>

                <div className="mt-3 flex gap-2">
                  <button
                    onClick={() => void abrirDetalle(d.id)}
                    disabled={loadingDetalle}
                    className="flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                  >
                    <Iconify icon="solar:eye-linear" width={14} />
                    Ver detalle
                  </button>

                  {d.estado === "solicitada" && (
                    <>
                      <button
                        onClick={() => void handleCambiarEstado(d.id, "aprobada")}
                        disabled={procesando}
                        className="flex items-center gap-1 rounded-lg bg-green-50 border border-green-200 px-3 py-1.5 text-xs font-medium text-green-700 hover:bg-green-100 disabled:opacity-50"
                      >
                        <Iconify icon="solar:check-circle-linear" width={14} />
                        Aprobar
                      </button>
                      <button
                        onClick={() => void handleCambiarEstado(d.id, "rechazada")}
                        disabled={procesando}
                        className="flex items-center gap-1 rounded-lg bg-red-50 border border-red-200 px-3 py-1.5 text-xs font-medium text-red-700 hover:bg-red-100 disabled:opacity-50"
                      >
                        <Iconify icon="solar:close-circle-linear" width={14} />
                        Rechazar
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <AdminDevolucionDetalleDialog
        devolucion={seleccionada}
        isOpen={detalleOpen}
        procesando={procesando}
        onClose={() => setDetalleOpen(false)}
        onAprobar={id => void handleCambiarEstado(id, "aprobada")}
        onRechazar={id => void handleCambiarEstado(id, "rechazada")}
      />
    </>
  );
}
