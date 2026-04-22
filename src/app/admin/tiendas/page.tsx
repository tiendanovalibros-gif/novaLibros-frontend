"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth.context";
import {
  crearTienda,
  editarTienda,
  eliminarTienda,
  listarTiendas,
  type Tienda,
  validarDireccionTienda,
  type ValidateDireccionResponse,
} from "@/services/tiendas.service";
import {
  DEPARTAMENTOS_CIUDADES,
  DEPARTAMENTO_OTROS,
  encontrarDepartamentoPorCiudad,
  normalizeUbicacionTexto,
} from "@/constants/colombia-locations.constants";

type DialogMode = "create" | "edit" | "delete" | null;

interface FormTienda {
  nombre: string;
  direccion: string;
  departamento: string;
  ciudad: string;
}

const EMPTY_FORM: FormTienda = {
  nombre: "",
  direccion: "",
  departamento: "",
  ciudad: "",
};

const DEPARTAMENTOS_ORDENADOS = Object.keys(DEPARTAMENTOS_CIUDADES).sort((a, b) =>
  a.localeCompare(b, "es", { sensitivity: "base" })
);

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

const PlusIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
    <line
      x1="12"
      y1="5"
      x2="12"
      y2="19"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
    <line
      x1="5"
      y1="12"
      x2="19"
      y2="12"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
  </svg>
);

const EditIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
    <path
      d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const TrashIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
    <polyline
      points="3 6 5 6 21 6"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path d="M10 11v6M14 11v6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    <path
      d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const SearchIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
    <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2" />
    <line
      x1="21"
      y1="21"
      x2="16.65"
      y2="16.65"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
  </svg>
);

const CloseIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
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

const Input = ({
  label,
  ...props
}: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) => (
  <div>
    <label className="block text-slate-700 text-sm font-semibold mb-1.5">{label}</label>
    <input
      {...props}
      className="w-full px-3 py-2.5 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors disabled:bg-slate-50 disabled:text-slate-500"
    />
  </div>
);

const Select = ({
  label,
  children,
  ...props
}: { label: string } & React.SelectHTMLAttributes<HTMLSelectElement> & {
    children: React.ReactNode;
  }) => (
  <div>
    <label className="block text-slate-700 text-sm font-semibold mb-1.5">{label}</label>
    <select
      {...props}
      className="w-full px-3 py-2.5 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors disabled:bg-slate-50 disabled:text-slate-500"
    >
      {children}
    </select>
  </div>
);

const Modal = ({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />
    <div
      className="relative bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
      onClick={e => e.stopPropagation()}
    >
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 sticky top-0 bg-white rounded-t-2xl z-10">
        <h3 className="text-slate-900 font-bold text-lg">{title}</h3>
        <button
          onClick={onClose}
          className="inline-flex h-8 w-8 items-center justify-center text-slate-400 leading-none transition-colors hover:text-slate-600"
        >
          <CloseIcon />
        </button>
      </div>
      <div className="p-6">{children}</div>
    </div>
  </div>
);

export default function AdminTiendasPage() {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const router = useRouter();

  const [tiendas, setTiendas] = useState<Tienda[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busqueda, setBusqueda] = useState("");

  const [dialogMode, setDialogMode] = useState<DialogMode>(null);
  const [tiendaActual, setTiendaActual] = useState<Tienda | null>(null);
  const [form, setForm] = useState<FormTienda>(EMPTY_FORM);
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);
  const [validatingAddress, setValidatingAddress] = useState(false);
  const [validationResult, setValidationResult] = useState<ValidateDireccionResponse | null>(null);

  const cargarTiendas = async () => {
    setLoading(true);
    setError("");

    try {
      const data = await listarTiendas();
      setTiendas(data);
    } catch (err) {
      setError(parseApiError(err, "Error al cargar tiendas"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (authLoading) return;

    if (!isAuthenticated) {
      router.push("/login");
      return;
    }

    if (user && user.rol !== "administrador" && user.rol !== "root") {
      router.push("/");
      return;
    }

    cargarTiendas();
  }, [authLoading, isAuthenticated, user, router]);

  const tiendasFiltradas = useMemo(() => {
    const q = busqueda.trim().toLowerCase();
    if (!q) return tiendas;

    return tiendas.filter(t => {
      const departamento = t.ciudad
        ? (encontrarDepartamentoPorCiudad(t.ciudad) ?? DEPARTAMENTO_OTROS)
        : "";

      return (
        t.nombre.toLowerCase().includes(q) ||
        t.direccion.toLowerCase().includes(q) ||
        (t.direccionNormalizada ?? "").toLowerCase().includes(q) ||
        (t.ciudad ?? "").toLowerCase().includes(q) ||
        departamento.toLowerCase().includes(q)
      );
    });
  }, [tiendas, busqueda]);

  const ciudadesSinDepartamento = useMemo(() => {
    const ciudades = tiendas
      .map(tienda => tienda.ciudad?.trim() ?? "")
      .filter(Boolean)
      .filter(ciudad => !encontrarDepartamentoPorCiudad(ciudad));

    return Array.from(new Set(ciudades)).sort((a, b) =>
      a.localeCompare(b, "es", { sensitivity: "base" })
    );
  }, [tiendas]);

  const ciudadesDisponibles = useMemo(() => {
    if (!form.departamento) {
      return [];
    }

    const base =
      form.departamento === DEPARTAMENTO_OTROS
        ? [...ciudadesSinDepartamento]
        : [...(DEPARTAMENTOS_CIUDADES[form.departamento] ?? [])];

    if (
      form.ciudad &&
      !base.some(ciudad => normalizeUbicacionTexto(ciudad) === normalizeUbicacionTexto(form.ciudad))
    ) {
      base.push(form.ciudad);
    }

    return base.sort((a, b) => a.localeCompare(b, "es", { sensitivity: "base" }));
  }, [form.departamento, form.ciudad, ciudadesSinDepartamento]);

  const setF = (key: keyof FormTienda, value: string) => {
    setForm(prev => ({ ...prev, [key]: value }));
    setValidationResult(null);
  };

  const setDepartamento = (departamento: string) => {
    setForm(prev => ({
      ...prev,
      departamento,
      ciudad: prev.departamento === departamento ? prev.ciudad : "",
    }));
    setValidationResult(null);
  };

  const cerrarDialogo = () => {
    setDialogMode(null);
    setTiendaActual(null);
    setFormError("");
    setValidationResult(null);
  };

  const abrirCrear = () => {
    setForm(EMPTY_FORM);
    setFormError("");
    setValidationResult(null);
    setDialogMode("create");
  };

  const abrirEditar = (tienda: Tienda) => {
    const departamentoDetectado = tienda.ciudad
      ? encontrarDepartamentoPorCiudad(tienda.ciudad)
      : null;

    setTiendaActual(tienda);
    setForm({
      nombre: tienda.nombre,
      direccion: tienda.direccion,
      departamento: departamentoDetectado ?? (tienda.ciudad ? DEPARTAMENTO_OTROS : ""),
      ciudad: tienda.ciudad ?? "",
    });
    setFormError("");
    setValidationResult(null);
    setDialogMode("edit");
  };

  const abrirEliminar = (tienda: Tienda) => {
    setTiendaActual(tienda);
    setFormError("");
    setDialogMode("delete");
  };

  const validarFormulario = (): boolean => {
    if (!form.nombre.trim()) {
      setFormError("El nombre es obligatorio");
      return false;
    }

    if (form.nombre.trim().length < 3) {
      setFormError("El nombre debe tener al menos 3 caracteres");
      return false;
    }

    if (!form.direccion.trim()) {
      setFormError("La dirección es obligatoria");
      return false;
    }

    if (!form.departamento.trim()) {
      setFormError("El departamento es obligatorio");
      return false;
    }

    if (!form.ciudad.trim()) {
      setFormError("La ciudad es obligatoria");
      return false;
    }

    return true;
  };

  const handleValidarDireccion = async () => {
    if (!form.direccion.trim() || !form.ciudad.trim()) {
      setFormError("Ingresa dirección y ciudad para validar");
      return;
    }

    setFormError("");
    setValidatingAddress(true);

    try {
      const result = await validarDireccionTienda({
        direccion: form.direccion.trim(),
        ciudad: form.ciudad.trim(),
      });
      setValidationResult(result);
    } catch (err) {
      setValidationResult(null);
      setFormError(parseApiError(err, "No se pudo validar la dirección"));
    } finally {
      setValidatingAddress(false);
    }
  };

  const handleCrear = async () => {
    if (!validarFormulario()) return;

    setSaving(true);
    setFormError("");

    try {
      const nueva = await crearTienda({
        nombre: form.nombre.trim(),
        direccion: form.direccion.trim(),
        ciudad: form.ciudad.trim(),
      });
      setTiendas(prev => [nueva, ...prev]);
      cerrarDialogo();
    } catch (err) {
      setFormError(parseApiError(err, "Error al crear la tienda"));
    } finally {
      setSaving(false);
    }
  };

  const handleEditar = async () => {
    if (!tiendaActual || !validarFormulario()) return;

    setSaving(true);
    setFormError("");

    try {
      const actualizada = await editarTienda(tiendaActual.id, {
        nombre: form.nombre.trim(),
        direccion: form.direccion.trim(),
        ciudad: form.ciudad.trim(),
      });

      setTiendas(prev => prev.map(t => (t.id === tiendaActual.id ? actualizada : t)));
      cerrarDialogo();
    } catch (err) {
      setFormError(parseApiError(err, "Error al actualizar la tienda"));
    } finally {
      setSaving(false);
    }
  };

  const handleEliminar = async () => {
    if (!tiendaActual) return;

    setSaving(true);
    setFormError("");

    try {
      await eliminarTienda(tiendaActual.id);
      setTiendas(prev => prev.filter(t => t.id !== tiendaActual.id));
      cerrarDialogo();
    } catch (err) {
      setFormError(parseApiError(err, "Error al eliminar la tienda"));
    } finally {
      setSaving(false);
    }
  };

  const renderFormTienda = (readOnly = false) => (
    <div className="flex flex-col gap-4">
      {formError && (
        <div className="bg-red-50 border border-red-300 rounded-lg px-4 py-3 text-red-800 text-sm">
          {formError}
        </div>
      )}

      <Input
        label="Nombre *"
        value={form.nombre}
        onChange={e => setF("nombre", e.target.value)}
        placeholder="Tienda Centro"
        disabled={readOnly}
      />

      <Input
        label="Dirección *"
        value={form.direccion}
        onChange={e => setF("direccion", e.target.value)}
        placeholder="Calle 23 # 13-45"
        disabled={readOnly}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Select
          label="Departamento *"
          value={form.departamento}
          onChange={e => setDepartamento(e.target.value)}
          disabled={readOnly}
        >
          <option value="">Seleccionar departamento...</option>
          {DEPARTAMENTOS_ORDENADOS.map(departamento => (
            <option key={departamento} value={departamento}>
              {departamento}
            </option>
          ))}
          <option value={DEPARTAMENTO_OTROS}>{DEPARTAMENTO_OTROS}</option>
        </Select>

        <Select
          label="Ciudad *"
          value={form.ciudad}
          onChange={e => setF("ciudad", e.target.value)}
          disabled={readOnly || !form.departamento}
        >
          <option value="">
            {!form.departamento
              ? "Selecciona primero departamento"
              : ciudadesDisponibles.length === 0
                ? "No hay ciudades disponibles"
                : "Seleccionar ciudad..."}
          </option>
          {ciudadesDisponibles.map(ciudad => (
            <option key={ciudad} value={ciudad}>
              {ciudad}
            </option>
          ))}
        </Select>
      </div>

      {!readOnly && (
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleValidarDireccion}
            disabled={validatingAddress}
            className="px-4 py-2 border border-blue-300 bg-blue-50 text-blue-700 rounded-lg text-sm font-semibold hover:bg-blue-100 disabled:opacity-60 transition-colors"
          >
            {validatingAddress ? "Validando..." : "Validar dirección"}
          </button>
          <span className="text-xs text-slate-500">
            Comprueba dirección + ciudad antes de guardar.
          </span>
        </div>
      )}

      {validationResult && (
        <div className="bg-emerald-50 border border-emerald-300 rounded-lg p-4 text-sm text-emerald-900">
          <p className="font-semibold">Dirección validada correctamente</p>
          <p className="mt-1">
            Ciudad detectada:{" "}
            <span className="font-semibold">
              {validationResult.ciudadDetectada || "No detectada"}
            </span>
          </p>
          <p className="mt-1">
            Coordenadas:{" "}
            <span className="font-semibold">
              {validationResult.latitud}, {validationResult.longitud}
            </span>
          </p>
          <p className="mt-1 break-all">Normalizada: {validationResult.direccionNormalizada}</p>
          <p className="mt-1 text-xs">Proveedor: {validationResult.proveedor}</p>
        </div>
      )}
    </div>
  );

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100 text-slate-700">
        <div className="p-6 bg-white rounded-xl shadow-md text-center">
          <p className="font-semibold mb-2">Cargando sesión...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100 text-slate-700">
        <div className="p-6 bg-white rounded-xl shadow-md text-center">
          <p className="font-semibold mb-2">Debes iniciar sesión para ver esta página.</p>
          <a href="/login" className="text-blue-600 underline">
            Ir a iniciar sesión
          </a>
        </div>
      </div>
    );
  }

  if (user && user.rol !== "administrador" && user.rol !== "root") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100 text-slate-700">
        <div className="p-6 bg-white rounded-xl shadow-md text-center">
          <p className="font-semibold mb-2">Acceso denegado.</p>
          <p>Solo administradores y root pueden acceder a esta sección.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-slate-900 text-2xl font-bold">Gestión de tiendas</h1>
            <p className="text-slate-500 text-sm mt-0.5">
              Administra sedes, ciudad y dirección normalizada por geocodificación
            </p>
          </div>

          <button
            onClick={abrirCrear}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 rounded-lg text-sm font-semibold text-white hover:bg-blue-700 transition-colors"
          >
            <PlusIcon />
            Agregar tienda
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="bg-white border border-slate-200 rounded-xl p-4">
            <p className="text-2xl font-bold text-blue-600">{tiendas.length}</p>
            <p className="text-slate-500 text-sm mt-0.5">Total tiendas</p>
          </div>
          <div className="bg-white border border-slate-200 rounded-xl p-4">
            <p className="text-2xl font-bold text-emerald-600">
              {new Set(tiendas.map(t => t.ciudad).filter(Boolean)).size}
            </p>
            <p className="text-slate-500 text-sm mt-0.5">Ciudades con tiendas</p>
          </div>
          <div className="bg-white border border-slate-200 rounded-xl p-4">
            <p className="text-2xl font-bold text-violet-600">
              {tiendas.filter(t => Boolean(t.direccionNormalizada)).length}
            </p>
            <p className="text-slate-500 text-sm mt-0.5">Direcciones normalizadas</p>
          </div>
        </div>

        <div className="relative mb-4">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
            <SearchIcon />
          </div>
          <input
            type="text"
            value={busqueda}
            onChange={e => setBusqueda(e.target.value)}
            placeholder="Buscar por nombre, ciudad o dirección..."
            className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
          />
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
          {loading ? (
            <div className="py-20 text-center text-slate-500 text-sm">Cargando tiendas...</div>
          ) : error ? (
            <div className="py-20 text-center">
              <p className="text-red-600 font-semibold mb-2">{error}</p>
              <button
                onClick={cargarTiendas}
                className="text-blue-600 text-sm font-medium hover:underline"
              >
                Reintentar
              </button>
            </div>
          ) : tiendasFiltradas.length === 0 ? (
            <div className="py-20 text-center text-slate-500">
              <div className="text-4xl mb-3">📍</div>
              <p className="font-semibold text-slate-700">No hay tiendas</p>
              <p className="text-sm mt-1">Agrega una nueva tienda para comenzar</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50">
                    {[
                      "Nombre",
                      "Departamento",
                      "Ciudad",
                      "Dirección",
                      "Dirección normalizada",
                      "Coordenadas",
                      "Acciones",
                    ].map(h => (
                      <th
                        key={h}
                        className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {tiendasFiltradas.map(tienda => (
                    <tr key={tienda.id} className="hover:bg-slate-50 transition-colors align-top">
                      <td className="px-4 py-3 text-slate-900 text-sm font-semibold whitespace-nowrap">
                        {tienda.nombre}
                      </td>
                      <td className="px-4 py-3 text-slate-900 text-sm font-semibold whitespace-nowrap">
                        {tienda.ciudad
                          ? (encontrarDepartamentoPorCiudad(tienda.ciudad) ?? DEPARTAMENTO_OTROS)
                          : "Sin definir"}
                      </td>
                      <td className="px-4 py-3 text-slate-600 text-sm whitespace-nowrap">
                        {tienda.ciudad ?? "Sin ciudad"}
                      </td>
                      <td className="px-4 py-3 text-slate-600 text-sm">{tienda.direccion}</td>
                      <td className="px-4 py-3 text-slate-500 text-xs max-w-[280px] break-words">
                        {tienda.direccionNormalizada || "-"}
                      </td>
                      <td className="px-4 py-3 text-slate-500 text-xs whitespace-nowrap">
                        {tienda.latitud}, {tienda.longitud}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => abrirEditar(tienda)}
                            title="Editar"
                            className="p-1.5 rounded-lg text-slate-400 hover:text-yellow-600 hover:bg-yellow-50 transition-colors"
                          >
                            <EditIcon />
                          </button>
                          <button
                            onClick={() => abrirEliminar(tienda)}
                            title="Eliminar"
                            className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                          >
                            <TrashIcon />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="px-4 py-3 border-t border-slate-100 text-slate-500 text-xs">
                Mostrando {tiendasFiltradas.length} de {tiendas.length} tiendas
              </div>
            </div>
          )}
        </div>
      </main>

      {dialogMode === "create" && (
        <Modal title="Agregar tienda" onClose={cerrarDialogo}>
          {renderFormTienda()}
          <div className="flex gap-3 justify-end mt-6 pt-4 border-t border-slate-100">
            <button
              onClick={cerrarDialogo}
              className="px-4 py-2 border border-slate-300 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleCrear}
              disabled={saving}
              className="px-5 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 disabled:opacity-60 transition-colors"
            >
              {saving ? "Guardando..." : "Guardar tienda"}
            </button>
          </div>
        </Modal>
      )}

      {dialogMode === "edit" && tiendaActual && (
        <Modal title={`Editar: ${tiendaActual.nombre}`} onClose={cerrarDialogo}>
          {renderFormTienda()}
          <div className="flex gap-3 justify-end mt-6 pt-4 border-t border-slate-100">
            <button
              onClick={cerrarDialogo}
              className="px-4 py-2 border border-slate-300 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleEditar}
              disabled={saving}
              className="px-5 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 disabled:opacity-60 transition-colors"
            >
              {saving ? "Actualizando..." : "Actualizar tienda"}
            </button>
          </div>
        </Modal>
      )}

      {dialogMode === "delete" && tiendaActual && (
        <Modal title="Eliminar tienda" onClose={cerrarDialogo}>
          <div className="text-center py-3">
            <p className="text-slate-900 font-semibold">¿Eliminar esta tienda?</p>
            <p className="text-slate-500 text-sm mt-1">
              Se eliminará{" "}
              <span className="font-semibold text-slate-700">{tiendaActual.nombre}</span>.
            </p>
            {formError && <p className="text-red-600 text-sm mt-3">{formError}</p>}
          </div>

          <div className="flex gap-3 justify-center mt-2">
            <button
              onClick={cerrarDialogo}
              className="px-5 py-2 border border-slate-300 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleEliminar}
              disabled={saving}
              className="px-5 py-2 bg-red-600 text-white rounded-lg text-sm font-semibold hover:bg-red-700 disabled:opacity-60 transition-colors"
            >
              {saving ? "Eliminando..." : "Eliminar"}
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}
