"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Iconify from "@/components/iconify/iconify";
import { apiFetch } from "@/services/api.client";
import { listarTiendas, type Tienda } from "@/services/tiendas.service";
import { encontrarDepartamentoPorCiudad } from "@/constants/colombia-locations.constants";
import { formatDistanciaKm, haversineKm } from "@/lib/geo";

interface InventarioLite {
  idTienda: number;
  idLibro: string;
  cantidadDisponible: number;
}

export interface TiendaConStats extends Tienda {
  distanciaKm: number | null;
  departamento: string | null;
  skus: number;
  unidadesDisponibles: number;
  titulosConStock: number;
}

type OrdenTiendas = "cercania" | "nombre" | "stock";
type VistaTiendas = "grid" | "lista";

const parseApiError = (error: unknown, fallback: string): string => {
  if (typeof error === "string") return error;
  if (error && typeof error === "object" && "message" in error) {
    const message = (error as { message?: unknown }).message;
    if (typeof message === "string") return message;
    if (Array.isArray(message)) {
      return message.filter(v => typeof v === "string").join(" · ") || fallback;
    }
  }
  return fallback;
};

function getMapsUrl(tienda: Tienda): string {
  if (Number.isFinite(tienda.latitud) && Number.isFinite(tienda.longitud)) {
    return `https://www.google.com/maps/search/?api=1&query=${tienda.latitud},${tienda.longitud}`;
  }
  const query = encodeURIComponent(
    `${tienda.nombre}, ${tienda.direccion}, ${tienda.ciudad ?? "Colombia"}`
  );
  return `https://www.google.com/maps/search/?api=1&query=${query}`;
}

function buildStatsPorTienda(inventarios: InventarioLite[]) {
  const map = new Map<
    number,
    { skus: Set<string>; unidades: number; titulosConStock: Set<string> }
  >();

  for (const inv of inventarios) {
    let entry = map.get(inv.idTienda);
    if (!entry) {
      entry = { skus: new Set(), unidades: 0, titulosConStock: new Set() };
      map.set(inv.idTienda, entry);
    }
    entry.skus.add(inv.idLibro);
    if (inv.cantidadDisponible > 0) {
      entry.unidades += inv.cantidadDisponible;
      entry.titulosConStock.add(inv.idLibro);
    }
  }

  return map;
}

export default function ExplorarTiendas() {
  const [tiendas, setTiendas] = useState<TiendaConStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busqueda, setBusqueda] = useState("");
  const [ciudadFiltro, setCiudadFiltro] = useState<string>("");
  const [orden, setOrden] = useState<OrdenTiendas>("nombre");
  const [vista, setVista] = useState<VistaTiendas>("grid");
  const [tiendaSeleccionadaId, setTiendaSeleccionadaId] = useState<number | null>(null);
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [ubicacionActiva, setUbicacionActiva] = useState(false);
  const [ubicacionError, setUbicacionError] = useState("");
  const [copiadoId, setCopiadoId] = useState<number | null>(null);

  const cargarDatos = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [tiendasData, inventarios] = await Promise.all([
        listarTiendas(),
        apiFetch<InventarioLite[]>("/inventarios").catch(() => [] as InventarioLite[]),
      ]);

      const statsMap = buildStatsPorTienda(inventarios);

      const enriquecidas: TiendaConStats[] = tiendasData.map(t => {
        const stats = statsMap.get(t.id);
        return {
          ...t,
          distanciaKm: null,
          departamento: t.ciudad ? encontrarDepartamentoPorCiudad(t.ciudad) : null,
          skus: stats?.skus.size ?? 0,
          unidadesDisponibles: stats?.unidades ?? 0,
          titulosConStock: stats?.titulosConStock.size ?? 0,
        };
      });

      setTiendas(enriquecidas);
      setTiendaSeleccionadaId(prev => prev ?? enriquecidas[0]?.id ?? null);
    } catch (err) {
      setError(parseApiError(err, "No fue posible cargar las tiendas"));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void cargarDatos();
  }, [cargarDatos]);

  const activarUbicacion = () => {
    setUbicacionError("");
    if (!navigator.geolocation) {
      setUbicacionError("Tu navegador no soporta geolocalización.");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      pos => {
        setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setUbicacionActiva(true);
        setOrden("cercania");
      },
      () => setUbicacionError("No se pudo obtener tu ubicación. Revisa los permisos."),
      { timeout: 10000 }
    );
  };

  const tiendasConDistancia = useMemo(() => {
    if (!coords) return tiendas;
    return tiendas.map(t => ({
      ...t,
      distanciaKm: haversineKm(coords.lat, coords.lng, t.latitud, t.longitud),
    }));
  }, [tiendas, coords]);

  const ciudadesDisponibles = useMemo(() => {
    const set = new Set(
      tiendas.map(t => t.ciudad?.trim()).filter((c): c is string => Boolean(c))
    );
    return Array.from(set).sort((a, b) => a.localeCompare(b, "es"));
  }, [tiendas]);

  const resumen = useMemo(() => {
    const ciudades = ciudadesDisponibles.length;
    const unidades = tiendas.reduce((acc, t) => acc + t.unidadesDisponibles, 0);
    const conStock = tiendas.filter(t => t.titulosConStock > 0).length;
    return { total: tiendas.length, ciudades, unidades, conStock };
  }, [tiendas, ciudadesDisponibles]);

  const tiendasFiltradas = useMemo(() => {
    const q = busqueda.trim().toLowerCase();
    let lista = tiendasConDistancia.filter(t => {
      if (ciudadFiltro && (t.ciudad ?? "") !== ciudadFiltro) return false;
      if (!q) return true;
      return (
        t.nombre.toLowerCase().includes(q) ||
        t.direccion.toLowerCase().includes(q) ||
        (t.direccionNormalizada ?? "").toLowerCase().includes(q) ||
        (t.ciudad ?? "").toLowerCase().includes(q) ||
        (t.departamento ?? "").toLowerCase().includes(q)
      );
    });

    lista = [...lista].sort((a, b) => {
      if (orden === "cercania") {
        if (a.distanciaKm === null && b.distanciaKm === null) return a.nombre.localeCompare(b.nombre);
        if (a.distanciaKm === null) return 1;
        if (b.distanciaKm === null) return -1;
        return a.distanciaKm - b.distanciaKm;
      }
      if (orden === "stock") {
        return b.unidadesDisponibles - a.unidadesDisponibles || a.nombre.localeCompare(b.nombre);
      }
      return a.nombre.localeCompare(b.nombre, "es");
    });

    return lista;
  }, [tiendasConDistancia, busqueda, ciudadFiltro, orden]);

  const tiendaSeleccionada = useMemo(
    () => tiendasFiltradas.find(t => t.id === tiendaSeleccionadaId) ?? tiendasFiltradas[0] ?? null,
    [tiendasFiltradas, tiendaSeleccionadaId]
  );

  const copiarDireccion = async (tienda: TiendaConStats) => {
    const texto = [
      tienda.nombre,
      tienda.direccionNormalizada || tienda.direccion,
      tienda.ciudad,
    ]
      .filter(Boolean)
      .join(", ");
    try {
      await navigator.clipboard.writeText(texto);
      setCopiadoId(tienda.id);
      setTimeout(() => setCopiadoId(null), 2000);
    } catch {
      /* ignore */
    }
  };

  return (
    <div className="space-y-6">
      {/* Hero */}
      <section className="rounded-2xl bg-white border border-slate-200 p-6 sm:p-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="max-w-xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 text-blue-700 px-3 py-1 text-xs font-semibold mb-3">
              <Iconify icon="solar:shop-bold" width={14} />
              Red NovaLibros
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
              Encuentra tu tienda
            </h1>
            <p className="text-slate-500 text-sm sm:text-base mt-2 leading-relaxed">
              Consulta sedes, existencias disponibles y cómo llegar. Al comprar puedes recoger tu
              pedido en la tienda más conveniente para ti.
            </p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 shrink-0">
            {[
              { valor: resumen.total, label: "Tiendas", icon: "solar:shop-2-bold" },
              { valor: resumen.ciudades, label: "Ciudades", icon: "solar:city-bold" },
              { valor: resumen.conStock, label: "Con stock", icon: "solar:box-bold" },
              { valor: resumen.unidades, label: "Libros disp.", icon: "solar:book-2-bold" },
            ].map(item => (
              <div
                key={item.label}
                className="rounded-xl bg-slate-50 border border-slate-200 px-3 py-3 text-center"
              >
                <Iconify icon={item.icon} className="mx-auto text-blue-600 mb-1" width={20} />
                <p className="text-xl font-bold text-slate-900">{item.valor}</p>
                <p className="text-[10px] sm:text-xs text-slate-500 uppercase tracking-wide">
                  {item.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Cómo funciona */}
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {[
          {
            paso: "1",
            titulo: "Explora sedes",
            texto: "Filtra por ciudad o usa tu ubicación para ver las más cercanas.",
            icon: "solar:map-point-bold",
          },
          {
            paso: "2",
            titulo: "Revisa disponibilidad",
            texto: "Cada tienda muestra cuántos títulos y unidades tiene en inventario.",
            icon: "solar:box-bold",
          },
          {
            paso: "3",
            titulo: "Recoge tu pedido",
            texto: "Al pagar en el carrito, elige recogida en tienda y selecciona la sede.",
            icon: "solar:bag-check-bold",
          },
        ].map(item => (
          <div
            key={item.paso}
            className="flex gap-3 bg-white border border-slate-200 rounded-xl p-4"
          >
            <div className="h-10 w-10 shrink-0 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-sm">
              {item.paso}
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <Iconify icon={item.icon} width={16} className="text-blue-600" />
                <h3 className="font-semibold text-slate-900 text-sm">{item.titulo}</h3>
              </div>
              <p className="text-slate-500 text-xs mt-1 leading-relaxed">{item.texto}</p>
            </div>
          </div>
        ))}
      </section>

      {/* Barra de herramientas */}
      <section className="bg-white border border-slate-200 rounded-2xl p-4 space-y-4">
        <div className="flex flex-col lg:flex-row gap-3">
          <div className="relative flex-1">
            <Iconify
              icon="solar:magnifer-linear"
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              width={18}
            />
            <input
              type="text"
              value={busqueda}
              onChange={e => setBusqueda(e.target.value)}
              placeholder="Buscar por nombre, ciudad, departamento o dirección..."
              className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-xl text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={activarUbicacion}
              className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold border transition-colors ${
                ubicacionActiva
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-white text-slate-700 border-slate-300 hover:bg-slate-50"
              }`}
            >
              <Iconify icon="solar:gps-bold" width={18} />
              {ubicacionActiva ? "Ubicación activa" : "Cerca de mí"}
            </button>
            <select
              value={orden}
              onChange={e => setOrden(e.target.value as OrdenTiendas)}
              className="px-3 py-2.5 border border-slate-300 rounded-xl text-sm font-medium text-slate-700 bg-white outline-none focus:border-blue-500"
            >
              <option value="nombre">Orden: nombre</option>
              <option value="cercania">Orden: más cercanas</option>
              <option value="stock">Orden: más stock</option>
            </select>
            <div className="flex rounded-xl border border-slate-300 overflow-hidden">
              <button
                type="button"
                onClick={() => setVista("grid")}
                className={`px-3 py-2.5 ${vista === "grid" ? "bg-slate-100 text-slate-900" : "text-slate-500"}`}
                aria-label="Vista cuadrícula"
              >
                <Iconify icon="solar:widget-4-bold" width={18} />
              </button>
              <button
                type="button"
                onClick={() => setVista("lista")}
                className={`px-3 py-2.5 border-l border-slate-300 ${vista === "lista" ? "bg-slate-100 text-slate-900" : "text-slate-500"}`}
                aria-label="Vista lista"
              >
                <Iconify icon="solar:list-bold" width={18} />
              </button>
            </div>
          </div>
        </div>

        {ubicacionError && (
          <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
            {ubicacionError}
          </p>
        )}

        {ciudadesDisponibles.length > 0 && (
          <div className="flex flex-wrap gap-2 items-center">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide mr-1">
              Ciudad:
            </span>
            <button
              type="button"
              onClick={() => setCiudadFiltro("")}
              className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors ${
                !ciudadFiltro
                  ? "bg-blue-600 text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              Todas
            </button>
            {ciudadesDisponibles.map(ciudad => (
              <button
                key={ciudad}
                type="button"
                onClick={() => setCiudadFiltro(ciudad)}
                className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors ${
                  ciudadFiltro === ciudad
                    ? "bg-blue-600 text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {ciudad}
              </button>
            ))}
          </div>
        )}
      </section>

      {/* Contenido principal */}
      {loading ? (
        <div className="py-24 text-center">
          <div className="h-8 w-8 mx-auto animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
          <p className="text-slate-500 text-sm mt-4">Cargando tiendas e inventario...</p>
        </div>
      ) : error ? (
        <div className="py-16 text-center bg-white rounded-2xl border border-red-200">
          <p className="text-red-600 font-semibold">{error}</p>
          <button
            type="button"
            onClick={() => void cargarDatos()}
            className="mt-3 text-blue-600 text-sm font-semibold hover:underline"
          >
            Reintentar
          </button>
        </div>
      ) : tiendasFiltradas.length === 0 ? (
        <div className="py-16 text-center bg-white rounded-2xl border border-slate-200">
          <Iconify icon="solar:map-point-search-bold" className="mx-auto text-slate-300" width={48} />
          <p className="font-semibold text-slate-700 mt-3">No hay tiendas con esos filtros</p>
          <button
            type="button"
            onClick={() => {
              setBusqueda("");
              setCiudadFiltro("");
            }}
            className="mt-2 text-blue-600 text-sm font-semibold hover:underline"
          >
            Limpiar filtros
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-[1fr_340px] gap-6 items-start">
          {/* Lista / grid */}
          <div
            className={
              vista === "grid"
                ? "grid grid-cols-1 sm:grid-cols-2 gap-4"
                : "flex flex-col gap-3"
            }
          >
            {tiendasFiltradas.map(tienda => {
              const seleccionada = tiendaSeleccionada?.id === tienda.id;
              const distancia = formatDistanciaKm(tienda.distanciaKm);
              const sinStock = tienda.titulosConStock === 0;

              return (
                <button
                  key={tienda.id}
                  type="button"
                  onClick={() => setTiendaSeleccionadaId(tienda.id)}
                  className={`text-left rounded-2xl border p-4 transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/40 ${
                    seleccionada
                      ? "border-blue-500 bg-blue-50/80 shadow-md ring-1 ring-blue-200"
                      : "border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm"
                  } ${vista === "lista" ? "flex gap-4 items-start" : ""}`}
                >
                  <div
                    className={`shrink-0 rounded-xl flex items-center justify-center ${
                      vista === "lista" ? "h-14 w-14" : "h-11 w-11 mb-3"
                    } ${sinStock ? "bg-slate-100 text-slate-400" : "bg-blue-100 text-blue-600"}`}
                  >
                    <Iconify icon="solar:shop-bold" width={vista === "lista" ? 26 : 22} />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <h2 className="text-slate-900 font-bold text-base leading-tight">
                        {tienda.nombre}
                      </h2>
                      <div className="flex flex-wrap gap-1.5">
                        {distancia && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-violet-100 text-violet-700">
                            {distancia}
                          </span>
                        )}
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            sinStock
                              ? "bg-red-100 text-red-700"
                              : "bg-emerald-100 text-emerald-700"
                          }`}
                        >
                          {sinStock ? "Sin stock" : "Con stock"}
                        </span>
                      </div>
                    </div>

                    <p className="text-slate-600 text-sm mt-1 line-clamp-2">
                      {tienda.direccionNormalizada || tienda.direccion}
                    </p>

                    <div className="flex flex-wrap gap-x-3 gap-y-1 mt-2 text-xs text-slate-500">
                      <span className="inline-flex items-center gap-1">
                        <Iconify icon="solar:city-bold" width={12} />
                        {tienda.ciudad ?? "Sin ciudad"}
                        {tienda.departamento ? ` · ${tienda.departamento}` : ""}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <Iconify icon="solar:book-2-bold" width={12} />
                        {tienda.titulosConStock} títulos · {tienda.unidadesDisponibles} uds.
                      </span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Panel detalle */}
          {tiendaSeleccionada && (
            <aside className="xl:sticky xl:top-24 bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
              <div className="bg-slate-900 text-white px-5 py-4">
                <p className="text-slate-400 text-xs uppercase tracking-wide font-semibold">
                  Tienda seleccionada
                </p>
                <h3 className="text-lg font-bold mt-0.5">{tiendaSeleccionada.nombre}</h3>
              </div>

              <div className="p-5 space-y-4">
                <div className="grid grid-cols-2 gap-2">
                  <div className="rounded-xl bg-slate-50 border border-slate-100 p-3 text-center">
                    <p className="text-lg font-bold text-slate-900">
                      {tiendaSeleccionada.titulosConStock}
                    </p>
                    <p className="text-[10px] text-slate-500 uppercase font-semibold">Títulos</p>
                  </div>
                  <div className="rounded-xl bg-slate-50 border border-slate-100 p-3 text-center">
                    <p className="text-lg font-bold text-emerald-600">
                      {tiendaSeleccionada.unidadesDisponibles}
                    </p>
                    <p className="text-[10px] text-slate-500 uppercase font-semibold">Unidades</p>
                  </div>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex gap-2">
                    <Iconify icon="solar:map-point-bold" className="text-blue-600 shrink-0 mt-0.5" width={18} />
                    <div>
                      <p className="font-medium text-slate-800">Dirección</p>
                      <p className="text-slate-600 text-sm leading-relaxed">
                        {tiendaSeleccionada.direccionNormalizada || tiendaSeleccionada.direccion}
                      </p>
                      {tiendaSeleccionada.direccionNormalizada &&
                        tiendaSeleccionada.direccionNormalizada !== tiendaSeleccionada.direccion && (
                          <p className="text-slate-400 text-xs mt-1">{tiendaSeleccionada.direccion}</p>
                        )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Iconify icon="solar:city-bold" className="text-blue-600 shrink-0 mt-0.5" width={18} />
                    <div>
                      <p className="font-medium text-slate-800">Ciudad</p>
                      <p className="text-slate-600">
                        {tiendaSeleccionada.ciudad ?? "No definida"}
                        {tiendaSeleccionada.departamento && (
                          <span className="text-slate-400"> · {tiendaSeleccionada.departamento}</span>
                        )}
                      </p>
                    </div>
                  </div>
                  {tiendaSeleccionada.distanciaKm !== null && (
                    <div className="flex gap-2">
                      <Iconify icon="solar:gps-bold" className="text-violet-600 shrink-0 mt-0.5" width={18} />
                      <div>
                        <p className="font-medium text-slate-800">Distancia estimada</p>
                        <p className="text-slate-600">
                          {formatDistanciaKm(tiendaSeleccionada.distanciaKm)} desde tu ubicación
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex flex-col gap-2 pt-2 border-t border-slate-100">
                  <a
                    href={getMapsUrl(tiendaSeleccionada)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 w-full py-2.5 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors"
                  >
                    <Iconify icon="solar:map-bold" width={18} />
                    Cómo llegar (Google Maps)
                  </a>
                  <button
                    type="button"
                    onClick={() => void copiarDireccion(tiendaSeleccionada)}
                    className="inline-flex items-center justify-center gap-2 w-full py-2.5 border border-slate-300 text-slate-700 rounded-xl text-sm font-semibold hover:bg-slate-50 transition-colors"
                  >
                    <Iconify
                      icon={copiadoId === tiendaSeleccionada.id ? "solar:check-circle-bold" : "solar:copy-bold"}
                      width={18}
                    />
                    {copiadoId === tiendaSeleccionada.id ? "¡Copiado!" : "Copiar dirección"}
                  </button>
                  <Link
                    href="/carrito"
                    className="inline-flex items-center justify-center gap-2 w-full py-2.5 border border-blue-200 bg-blue-50 text-blue-700 rounded-xl text-sm font-semibold hover:bg-blue-100 transition-colors"
                  >
                    <Iconify icon="solar:cart-large-2-bold" width={18} />
                    Ir al carrito y recoger aquí
                  </Link>
                </div>

                <p className="text-[11px] text-slate-400 leading-relaxed">
                  El stock mostrado es referencial y puede cambiar. Al comprar, el sistema validará
                  disponibilidad en la tienda que elijas.
                </p>
              </div>
            </aside>
          )}
        </div>
      )}

      <p className="text-center text-xs text-slate-400 pb-4">
        Mostrando {tiendasFiltradas.length} de {tiendas.length} tiendas
      </p>
    </div>
  );
}
