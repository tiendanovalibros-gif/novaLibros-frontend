"use client";

import { useEffect, useMemo, useState } from "react";
import Iconify from "@/components/iconify/iconify";
import {
  obtenerOpcionesEntrega,
  type CheckoutCarritoPayload,
  type MetodoEntregaCodigo,
  type OpcionMetodoEntrega,
  type TiendaRecogidaOpcion,
} from "@/services/carrito.service";

interface Props {
  isOpen: boolean;
  comprando: boolean;
  saldoDisponible: number;
  /** Dirección guardada en el perfil del usuario */
  direccionUsuario?: string | null;
  onClose: () => void;
  onConfirm: (payload: CheckoutCarritoPayload) => void;
}

const ICONO_METODO: Record<MetodoEntregaCodigo, string> = {
  tienda: "solar:shop-bold",
  domicilio: "solar:home-2-bold",
  express: "solar:delivery-bold",
};

function formatDistancia(km: number | null): string | null {
  if (km === null) return null;
  if (km < 1) return `${Math.round(km * 1000)} m`;
  return `${km.toFixed(1)} km`;
}

function getMapsUrl(tienda: TiendaRecogidaOpcion): string {
  const query = encodeURIComponent(
    `${tienda.nombre}, ${tienda.direccion}, ${tienda.ciudad ?? "Colombia"}`
  );
  return `https://www.google.com/maps/search/?api=1&query=${query}&ll=${tienda.latitud},${tienda.longitud}`;
}

function formatPrecio(n: number) {
  return n.toLocaleString("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 });
}

export default function SeleccionEntregaModal({
  isOpen,
  comprando,
  saldoDisponible,
  direccionUsuario,
  onClose,
  onConfirm,
}: Props) {
  const [metodos, setMetodos] = useState<OpcionMetodoEntrega[]>([]);
  const [tiendas, setTiendas] = useState<TiendaRecogidaOpcion[]>([]);
  const [subtotal, setSubtotal] = useState(0);
  const [metodoSeleccionado, setMetodoSeleccionado] = useState<MetodoEntregaCodigo | null>(null);
  const [tiendaSeleccionada, setTiendaSeleccionada] = useState<number | null>(null);
  const [direccion, setDireccion] = useState("");
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [sinUbicacion, setSinUbicacion] = useState(false);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");
  const [errorValidacion, setErrorValidacion] = useState("");

  useEffect(() => {
    if (!isOpen) return;

    setMetodos([]);
    setTiendas([]);
    setSubtotal(0);
    setMetodoSeleccionado(null);
    setTiendaSeleccionada(null);
    setDireccion(direccionUsuario?.trim() ?? "");
    setCoords(null);
    setSinUbicacion(false);
    setError("");
    setErrorValidacion("");
    setCargando(true);

    const cargar = (lat?: number, lng?: number) => {
      obtenerOpcionesEntrega(lat, lng)
        .then(data => {
          setMetodos(data.metodos);
          setTiendas(data.tiendas);
          setSubtotal(Number(data.subtotal));
          const primero = data.metodos.find(m => m.disponible);
          if (primero) {
            setMetodoSeleccionado(primero.codigo);
            if (primero.codigo === "tienda") {
              const t = data.tiendas.find(x => x.puedeCompletarCarrito);
              setTiendaSeleccionada(t?.id ?? null);
            }
          }
        })
        .catch(e =>
          setError((e as { message?: string })?.message ?? "No se pudieron cargar las opciones de entrega")
        )
        .finally(() => setCargando(false));
    };

    if (!navigator.geolocation) {
      setSinUbicacion(true);
      cargar();
      return;
    }

    navigator.geolocation.getCurrentPosition(
      pos => {
        setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        cargar(pos.coords.latitude, pos.coords.longitude);
      },
      () => {
        setSinUbicacion(true);
        cargar();
      },
      { timeout: 10000 }
    );
  }, [isOpen, direccionUsuario]);

  const direccionModificada =
    direccion.trim() !== (direccionUsuario?.trim() ?? "");

  const metodoActivo = useMemo(
    () => metodos.find(m => m.codigo === metodoSeleccionado) ?? null,
    [metodos, metodoSeleccionado]
  );

  const costoEnvio = metodoActivo?.costoAdicional ?? 0;
  const total = subtotal + costoEnvio;
  const saldoSuficiente = saldoDisponible >= total;

  const tiendaElegida = tiendas.find(t => t.id === tiendaSeleccionada);

  const puedeConfirmar = useMemo(() => {
    if (!metodoActivo?.disponible) return false;
    if (!saldoSuficiente) return false;
    if (metodoActivo.codigo === "tienda") {
      return tiendaSeleccionada !== null && Boolean(tiendaElegida?.puedeCompletarCarrito);
    }
    if (metodoActivo.requiereDireccion && direccion.trim().length < 10) return false;
    if (metodoActivo.codigo === "express" && !coords) return false;
    return true;
  }, [metodoActivo, saldoSuficiente, tiendaSeleccionada, tiendaElegida, direccion, coords]);

  const handleSeleccionarMetodo = (metodo: OpcionMetodoEntrega) => {
    if (!metodo.disponible) return;
    setMetodoSeleccionado(metodo.codigo);
    setErrorValidacion("");
    if (metodo.codigo === "tienda") {
      const t = tiendas.find(x => x.puedeCompletarCarrito);
      setTiendaSeleccionada(t?.id ?? null);
    }
  };

  const handleConfirmar = () => {
    setErrorValidacion("");
    if (!metodoActivo?.disponible) {
      setErrorValidacion("Selecciona un método de entrega disponible");
      return;
    }
    if (!saldoSuficiente) {
      setErrorValidacion("Saldo insuficiente para cubrir el total con envío");
      return;
    }
    if (metodoActivo.codigo === "tienda") {
      if (!tiendaSeleccionada || !tiendaElegida?.puedeCompletarCarrito) {
        setErrorValidacion("Selecciona una tienda con stock disponible");
        return;
      }
      onConfirm({ metodoEntrega: "tienda", idTienda: tiendaSeleccionada });
      return;
    }
    if (direccion.trim().length < 10) {
      setErrorValidacion("Ingresa una dirección de entrega válida (mínimo 10 caracteres)");
      return;
    }
    if (metodoActivo.codigo === "express" && !coords) {
      setErrorValidacion("Activa tu ubicación para confirmar entrega express");
      return;
    }
    onConfirm({
      metodoEntrega: metodoActivo.codigo,
      direccionEntrega: direccion.trim(),
      ...(metodoActivo.codigo === "express" && coords
        ? { lat: coords.lat, lng: coords.lng }
        : {}),
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[70] bg-slate-900/55 backdrop-blur-[2px] flex items-end sm:items-center justify-center p-0 sm:p-6">
      <div
        className="w-full sm:max-w-xl bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92dvh]"
        onClick={e => e.stopPropagation()}
      >
        <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Iconify icon="solar:delivery-bold" className="text-white" width={18} />
            </div>
            <span className="text-slate-900 text-sm font-bold tracking-tight">
              Método de entrega
            </span>
          </div>
          <button
            onClick={onClose}
            disabled={comprando}
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-300 text-slate-600 hover:bg-slate-100 disabled:opacity-50"
            aria-label="Cerrar"
          >
            <Iconify icon="mdi:close" width={18} />
          </button>
        </div>

        <div className="overflow-y-auto flex-1 p-4 space-y-4">
          {cargando && (
            <div className="flex flex-col items-center justify-center py-12 gap-3 text-slate-500">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
              <span className="text-sm">Calculando opciones de entrega...</span>
            </div>
          )}

          {!cargando && error && (
            <div className="py-10 text-center">
              <p className="text-red-600 text-sm font-semibold">{error}</p>
            </div>
          )}

          {!cargando && !error && (
            <>
              {sinUbicacion && (
                <div className="flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-700">
                  <Iconify icon="solar:map-point-off-bold" width={14} />
                  Sin ubicación: recogida y express pueden estar limitadas. Ordenamos tiendas sin distancia.
                </div>
              )}

              <div className="space-y-2">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                  Elige cómo recibir tu pedido
                </p>
                {metodos.map(metodo => {
                  const seleccionado = metodoSeleccionado === metodo.codigo;
                  return (
                    <button
                      key={metodo.codigo}
                      type="button"
                      disabled={!metodo.disponible}
                      onClick={() => handleSeleccionarMetodo(metodo)}
                      className={`w-full text-left rounded-xl border p-3.5 transition-colors ${
                        seleccionado && metodo.disponible
                          ? "border-blue-500 bg-blue-50"
                          : metodo.disponible
                            ? "border-slate-200 bg-white hover:border-slate-300"
                            : "border-slate-100 bg-slate-50 opacity-60 cursor-not-allowed"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className={`mt-0.5 h-9 w-9 shrink-0 rounded-lg flex items-center justify-center ${
                            seleccionado && metodo.disponible
                              ? "bg-blue-600 text-white"
                              : "bg-slate-100 text-slate-500"
                          }`}
                        >
                          <Iconify icon={ICONO_METODO[metodo.codigo]} width={18} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2 flex-wrap">
                            <span className="text-slate-900 font-semibold text-sm">{metodo.nombre}</span>
                            <span className="text-xs font-semibold text-slate-700">
                              {metodo.costoAdicional === 0
                                ? "Sin costo"
                                : `+ ${formatPrecio(metodo.costoAdicional)}`}
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 mt-0.5">{metodo.descripcion}</p>
                          <p className="text-xs text-blue-600 mt-1 font-medium">{metodo.tiempoEstimado}</p>
                          {!metodo.disponible && metodo.motivoNoDisponible && (
                            <p className="text-xs text-red-500 mt-1">{metodo.motivoNoDisponible}</p>
                          )}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>

              {metodoActivo?.codigo === "tienda" && metodoActivo.disponible && (
                <div className="space-y-2 pt-1 border-t border-slate-100">
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide pt-2">
                    Tienda de recogida
                  </p>
                  {tiendas.map(tienda => {
                    const seleccionada = tiendaSeleccionada === tienda.id;
                    const disponible = tienda.puedeCompletarCarrito;
                    const distancia = formatDistancia(tienda.distanciaKm);
                    return (
                      <button
                        key={tienda.id}
                        type="button"
                        disabled={!disponible}
                        onClick={() => setTiendaSeleccionada(tienda.id)}
                        className={`w-full text-left rounded-xl border p-3 transition-colors ${
                          seleccionada && disponible
                            ? "border-blue-500 bg-blue-50"
                            : disponible
                              ? "border-slate-200 hover:bg-slate-50"
                              : "border-slate-100 opacity-60 cursor-not-allowed"
                        }`}
                      >
                        <div className="flex justify-between gap-2">
                          <span className="font-semibold text-sm text-slate-900">{tienda.nombre}</span>
                          <div className="flex gap-1">
                            {distancia && (
                              <span className="text-xs px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">
                                {distancia}
                              </span>
                            )}
                            <span
                              className={`text-xs px-1.5 py-0.5 rounded ${
                                disponible
                                  ? "bg-emerald-100 text-emerald-700"
                                  : "bg-red-100 text-red-600"
                              }`}
                            >
                              {disponible ? "Disponible" : "Sin stock"}
                            </span>
                          </div>
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5 truncate">
                          {tienda.direccionNormalizada || tienda.direccion}
                          {tienda.ciudad ? `, ${tienda.ciudad}` : ""}
                        </p>
                        <a
                          href={getMapsUrl(tienda)}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={e => e.stopPropagation()}
                          className="inline-flex items-center gap-1 text-xs text-blue-600 hover:underline mt-1"
                        >
                          <Iconify icon="solar:map-point-bold" width={12} />
                          Ver en mapa
                        </a>
                      </button>
                    );
                  })}
                </div>
              )}

              {metodoActivo?.requiereDireccion && metodoActivo.disponible && (
                <div className="pt-1 border-t border-slate-100">
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5 pt-2">
                    Dirección de entrega *
                  </label>
                  <p className="text-xs text-slate-500 mb-2">
                    {direccionUsuario?.trim()
                      ? "Usamos la dirección de tu perfil. Si la cambias, se actualizará en tu cuenta al confirmar la compra."
                      : "Indica tu dirección de entrega. Se guardará en tu perfil al confirmar la compra."}
                  </p>
                  <textarea
                    value={direccion}
                    onChange={e => setDireccion(e.target.value)}
                    rows={3}
                    placeholder="Calle, número, barrio, ciudad..."
                    className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                  {direccionUsuario?.trim() && direccionModificada && (
                    <p className="text-xs text-amber-700 mt-1.5">
                      Dirección distinta a la del perfil; se actualizará al pagar.
                    </p>
                  )}
                </div>
              )}

              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm space-y-1.5">
                <div className="flex justify-between text-slate-600">
                  <span>Subtotal productos</span>
                  <span>{formatPrecio(subtotal)}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Costo de envío</span>
                  <span>{formatPrecio(costoEnvio)}</span>
                </div>
                <div className="flex justify-between font-bold text-slate-900 pt-1 border-t border-slate-200">
                  <span>Total a pagar</span>
                  <span>{formatPrecio(total)}</span>
                </div>
                {!saldoSuficiente && (
                  <p className="text-xs text-red-600 pt-1">
                    Saldo insuficiente ({formatPrecio(saldoDisponible)} disponible).
                  </p>
                )}
              </div>

              {errorValidacion && (
                <p className="text-sm text-red-600 font-medium">{errorValidacion}</p>
              )}
            </>
          )}
        </div>

        <div className="shrink-0 px-5 py-4 border-t border-slate-200 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            disabled={comprando}
            className="px-4 py-2 border border-slate-300 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-60"
          >
            Cancelar
          </button>
          <button
            onClick={handleConfirmar}
            disabled={!puedeConfirmar || comprando || cargando}
            className="px-5 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {comprando && (
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
            )}
            {comprando ? "Procesando..." : "Confirmar y pagar"}
          </button>
        </div>
      </div>
    </div>
  );
}
