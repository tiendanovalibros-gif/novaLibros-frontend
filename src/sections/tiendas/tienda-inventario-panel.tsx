"use client";

import { useCallback, useEffect, useState } from "react";
import type { Tienda } from "@/services/tiendas.service";
import type { InventarioTiendaItem } from "@/types/inventarios.types";
import {
  obtenerInventarioPorTienda,
  agregarExistenciasLibro,
  actualizarCantidadInventarioLibro,
  marcarLibroAgotado,
} from "@/services/inventarios.service";
import AgregarLibroInventarioModal from "@/components/tiendas/agregar-libro-inventario-modal";
import ReponerGeneroModal from "@/components/tiendas/reponer-genero-modal";

interface Props {
  tienda: Tienda;
}

type ActionModal =
  | { type: "ajustar"; item: InventarioTiendaItem }
  | { type: "agregar" }
  | { type: "reponer" }
  | null;

const PlusIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
    <line x1="12" y1="5" x2="12" y2="19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    <line x1="5" y1="12" x2="19" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

const RefreshIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
    <polyline points="23 4 23 10 17 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <polyline points="1 20 1 14 7 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const CloseIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
    <line x1="18" y1="6" x2="6" y2="18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    <line x1="6" y1="6" x2="18" y2="18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

function AjustarCantidadModal({
  item,
  idTienda,
  onClose,
  onSaved,
}: {
  item: InventarioTiendaItem;
  idTienda: number;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [modo, setModo] = useState<"set" | "add">("add");
  const [valor, setValor] = useState(1);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleGuardar = async () => {
    if (valor < 0) { setError("El valor no puede ser negativo"); return; }
    setSaving(true);
    setError("");
    try {
      if (modo === "add") {
        await agregarExistenciasLibro(idTienda, item.idLibro, valor);
      } else {
        await actualizarCantidadInventarioLibro(idTienda, item.idLibro, valor);
      }
      onSaved();
    } catch (err: unknown) {
      const msg = err && typeof err === "object" && "message" in err
        ? String((err as { message: unknown }).message)
        : "Error al actualizar cantidad";
      setError(msg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />
      <div
        className="relative bg-white rounded-2xl shadow-xl w-full max-w-sm"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
          <div>
            <h3 className="text-slate-900 font-bold text-base">Ajustar stock</h3>
            <p className="text-slate-500 text-xs mt-0.5 truncate max-w-[220px]">{item.libro.titulo}</p>
          </div>
          <button
            onClick={onClose}
            className="inline-flex h-8 w-8 items-center justify-center text-slate-400 hover:text-slate-600 transition-colors"
          >
            <CloseIcon />
          </button>
        </div>

        <div className="p-6 flex flex-col gap-4">
          {error && (
            <div className="bg-red-50 border border-red-300 rounded-lg px-4 py-3 text-red-800 text-sm">{error}</div>
          )}

          <p className="text-slate-500 text-sm">
            Disponible actual: <span className="font-semibold text-slate-800">{item.cantidadDisponible}</span>
            {item.cantidadBloqueada > 0 && (
              <> · Bloqueado: <span className="font-semibold text-amber-700">{item.cantidadBloqueada}</span></>
            )}
          </p>

          <div className="flex gap-2">
            <button
              onClick={() => setModo("add")}
              className={`flex-1 py-2 rounded-lg text-sm font-semibold border transition-colors ${
                modo === "add"
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-white text-slate-700 border-slate-300 hover:bg-slate-50"
              }`}
            >
              Sumar unidades
            </button>
            <button
              onClick={() => setModo("set")}
              className={`flex-1 py-2 rounded-lg text-sm font-semibold border transition-colors ${
                modo === "set"
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-white text-slate-700 border-slate-300 hover:bg-slate-50"
              }`}
            >
              Fijar total
            </button>
          </div>

          <div>
            <label className="block text-slate-700 text-sm font-semibold mb-1.5">
              {modo === "add" ? "Unidades a agregar" : "Nueva cantidad disponible"}
            </label>
            <input
              type="number"
              min={0}
              value={valor}
              onChange={e => setValor(Number(e.target.value))}
              className="w-full px-3 py-2.5 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
            />
            {modo === "add" && valor > 0 && (
              <p className="text-slate-500 text-xs mt-1">
                Nuevo total: {item.cantidadDisponible + valor}
              </p>
            )}
          </div>
        </div>

        <div className="flex gap-3 justify-end px-6 py-4 border-t border-slate-100">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-slate-300 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleGuardar}
            disabled={saving}
            className="px-5 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 disabled:opacity-60 transition-colors"
          >
            {saving ? "Guardando..." : "Guardar"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function TiendaInventarioPanel({ tienda }: Props) {
  const [inventarios, setInventarios] = useState<InventarioTiendaItem[]>([]);
  const [resumen, setResumen] = useState({
    totalItems: 0,
    totalDisponible: 0,
    totalBloqueada: 0,
    librosAgotados: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionModal, setActionModal] = useState<ActionModal>(null);
  const [busqueda, setBusqueda] = useState("");
  const [agotandoId, setAgotandoId] = useState<string | null>(null);

  const cargar = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await obtenerInventarioPorTienda(tienda.id);
      setInventarios(data.inventarios);
      setResumen(data.resumen);
    } catch {
      setError("No se pudo cargar el inventario");
    } finally {
      setLoading(false);
    }
  }, [tienda.id]);

  useEffect(() => {
    cargar();
  }, [cargar]);

  const handleMarcarAgotado = async (item: InventarioTiendaItem) => {
    setAgotandoId(item.idLibro);
    try {
      await marcarLibroAgotado(tienda.id, item.idLibro);
      await cargar();
    } catch {
      // silently ignore; user can retry via refresh
    } finally {
      setAgotandoId(null);
    }
  };

  const inventariosFiltrados = inventarios.filter(inv => {
    const q = busqueda.trim().toLowerCase();
    if (!q) return true;
    return (
      inv.libro.titulo.toLowerCase().includes(q) ||
      inv.libro.isbn.toLowerCase().includes(q) ||
      inv.libro.autor.nombre.toLowerCase().includes(q)
    );
  });

  const formatFecha = (iso: string) => {
    try {
      return new Date(iso).toLocaleDateString("es-CO", { day: "2-digit", month: "short", year: "numeric" });
    } catch {
      return iso;
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="mb-4">
        <h2 className="text-slate-800 font-bold text-base">{tienda.nombre}</h2>
        <p className="text-slate-500 text-xs mt-0.5">
          {tienda.ciudad ? `${tienda.ciudad} · ` : ""}{tienda.direccion}
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
        <div className="bg-white border border-slate-200 rounded-xl p-3 text-center">
          <p className="text-xl font-bold text-slate-800">{resumen.totalItems}</p>
          <p className="text-slate-500 text-xs mt-0.5">SKUs</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-3 text-center">
          <p className="text-xl font-bold text-emerald-600">{resumen.totalDisponible}</p>
          <p className="text-slate-500 text-xs mt-0.5">Disponibles</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-3 text-center">
          <p className="text-xl font-bold text-amber-600">{resumen.totalBloqueada}</p>
          <p className="text-slate-500 text-xs mt-0.5">Bloqueados</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-3 text-center">
          <p className="text-xl font-bold text-red-500">{resumen.librosAgotados}</p>
          <p className="text-slate-500 text-xs mt-0.5">Agotados</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-3">
        <button
          onClick={() => setActionModal({ type: "agregar" })}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700 transition-colors"
        >
          <PlusIcon />
          Agregar libro
        </button>
        <button
          onClick={() => setActionModal({ type: "reponer" })}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-violet-600 text-white rounded-lg text-xs font-semibold hover:bg-violet-700 transition-colors"
        >
          Reponer por género
        </button>
        <button
          onClick={cargar}
          className="flex items-center gap-1.5 px-3 py-1.5 border border-slate-300 text-slate-600 rounded-lg text-xs font-semibold hover:bg-slate-50 transition-colors ml-auto"
        >
          <RefreshIcon />
          Actualizar
        </button>
      </div>

      <div className="relative mb-3">
        <input
          type="text"
          value={busqueda}
          onChange={e => setBusqueda(e.target.value)}
          placeholder="Buscar libro en inventario..."
          className="w-full pl-3 pr-4 py-2 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
        />
      </div>

      <div className="flex-1 overflow-auto bg-white border border-slate-200 rounded-xl">
        {loading ? (
          <div className="py-16 text-center text-slate-500 text-sm">Cargando inventario...</div>
        ) : error ? (
          <div className="py-16 text-center">
            <p className="text-red-600 font-semibold mb-2">{error}</p>
            <button onClick={cargar} className="text-blue-600 text-sm hover:underline">Reintentar</button>
          </div>
        ) : inventariosFiltrados.length === 0 ? (
          <div className="py-16 text-center text-slate-500">
            <div className="text-3xl mb-2">📦</div>
            {inventarios.length === 0 ? (
              <>
                <p className="font-semibold text-slate-700 text-sm">Sin libros en inventario</p>
                <p className="text-xs mt-1">Agrega el primer libro usando el botón de arriba.</p>
              </>
            ) : (
              <p className="font-semibold text-slate-700 text-sm">Sin resultados para "{busqueda}"</p>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  {["Libro", "ISBN", "Disponible", "Bloqueado", "Actualización", "Acciones"].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {inventariosFiltrados.map(inv => (
                  <tr key={inv.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3">
                      <p className="text-slate-900 font-semibold text-sm leading-snug">{inv.libro.titulo}</p>
                      <p className="text-slate-500 text-xs">{inv.libro.autor.nombre}</p>
                    </td>
                    <td className="px-4 py-3 text-slate-500 text-xs whitespace-nowrap">{inv.libro.isbn}</td>
                    <td className="px-4 py-3">
                      <span className={`font-semibold text-sm ${inv.cantidadDisponible === 0 ? "text-red-500" : "text-emerald-600"}`}>
                        {inv.cantidadDisponible}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-amber-700 font-medium text-sm">{inv.cantidadBloqueada}</td>
                    <td className="px-4 py-3 text-slate-500 text-xs whitespace-nowrap">{formatFecha(inv.fechaActualizacion)}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <button
                          onClick={() => setActionModal({ type: "ajustar", item: inv })}
                          className="px-2.5 py-1 rounded-lg text-xs font-semibold border border-blue-200 text-blue-700 bg-blue-50 hover:bg-blue-100 transition-colors"
                        >
                          Ajustar
                        </button>
                        {inv.cantidadDisponible > 0 && (
                          <button
                            onClick={() => handleMarcarAgotado(inv)}
                            disabled={agotandoId === inv.idLibro}
                            className="px-2.5 py-1 rounded-lg text-xs font-semibold border border-red-200 text-red-700 bg-red-50 hover:bg-red-100 disabled:opacity-60 transition-colors"
                          >
                            Agotar
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="px-4 py-2 border-t border-slate-100 text-slate-500 text-xs">
              Mostrando {inventariosFiltrados.length} de {inventarios.length} libros
            </div>
          </div>
        )}
      </div>

      {actionModal?.type === "ajustar" && (
        <AjustarCantidadModal
          item={actionModal.item}
          idTienda={tienda.id}
          onClose={() => setActionModal(null)}
          onSaved={() => { setActionModal(null); cargar(); }}
        />
      )}

      {actionModal?.type === "agregar" && (
        <AgregarLibroInventarioModal
          idTienda={tienda.id}
          nombreTienda={tienda.nombre}
          idsLibrosEnTienda={inventarios.map(inv => inv.idLibro)}
          onClose={() => setActionModal(null)}
          onAdded={() => { setActionModal(null); cargar(); }}
        />
      )}

      {actionModal?.type === "reponer" && (
        <ReponerGeneroModal
          idTienda={tienda.id}
          nombreTienda={tienda.nombre}
          onClose={() => setActionModal(null)}
          onRepuesto={() => { cargar(); }}
        />
      )}
    </div>
  );
}
