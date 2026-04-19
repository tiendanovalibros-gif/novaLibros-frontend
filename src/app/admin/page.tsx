"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth.context";
import { apiFetch } from "@/services/api.client";
import MainNavbar from "@/components/navigation/main-navbar";
import StockManagerModal from "@/components/inventarios/stock-manager-modal";
import {
  agregarExistenciasLibro,
  actualizarCantidadInventarioLibro,
  crearInventarioLibro,
  obtenerLibrosAgotadosAdmin,
} from "@/services/inventarios.service";
import type { LibroAgotadoAdmin } from "@/types/inventarios.types";

interface TiendaLite {
  id: number;
  nombre: string;
}

interface InventarioLite {
  id: number;
  idLibro: string;
  idTienda: number;
  cantidadDisponible: number;
  cantidadBloqueada: number;
}

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
type DialogMode = "create" | "edit" | "view" | "delete" | null;

const ESTADO_OPTIONS = ["nuevo", "usado"];
const IDIOMA_OPTIONS = ["Español", "Inglés", "Francés", "Portugués", "Alemán", "Italiano"];
const LIBRO_VACIO = {
  titulo: "",
  idAutor: 0,
  idGenero: 0,
  idEditorial: 0,
  anoPublicacion: new Date().getFullYear(),
  precio: 0,
  isbn: "",
  idioma: "Español",
  descripcion: "",
  imagenPortada: "",
  estado: "nuevo",
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
const EyeIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
    <path
      d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
    <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" />
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
const AlertIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
    <path
      d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"
      stroke="#EF4444"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <line x1="12" y1="9" x2="12" y2="13" stroke="#EF4444" strokeWidth="2" strokeLinecap="round" />
    <line
      x1="12"
      y1="17"
      x2="12.01"
      y2="17"
      stroke="#EF4444"
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
const PackageIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
    <path
      d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const EstadoBadge = ({ estado }: { estado: string }) => (
  <span
    className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold border ${estado === "agotado" ? "bg-red-50 text-red-700 border-red-300" : estado === "nuevo" ? "bg-green-50 text-green-700 border-green-300" : "bg-yellow-50 text-yellow-700 border-yellow-300"}`}
  >
    {estado}
  </span>
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
      className="w-full px-3 py-2.5 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors disabled:bg-slate-50"
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
          className="text-slate-400 hover:text-slate-600 transition-colors p-1"
        >
          <CloseIcon />
        </button>
      </div>
      <div className="p-6">{children}</div>
    </div>
  </div>
);

export default function AdminLibrosPage() {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const router = useRouter();

  const [libros, setLibros] = useState<Libro[]>([]);
  const [autores, setAutores] = useState<Autor[]>([]);
  const [generos, setGeneros] = useState<Genero[]>([]);
  const [editoriales, setEditoriales] = useState<Editorial[]>([]);
  const [tiendas, setTiendas] = useState<TiendaLite[]>([]);
  const [inventarios, setInventarios] = useState<InventarioLite[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busqueda, setBusqueda] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("todos");
  const [dialogMode, setDialogMode] = useState<DialogMode>(null);
  const [libroActual, setLibroActual] = useState<Libro | null>(null);
  const [form, setForm] = useState(LIBRO_VACIO);
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);
  const [showAgotados, setShowAgotados] = useState(false);
  const [librosAgotadosAdmin, setLibrosAgotadosAdmin] = useState<LibroAgotadoAdmin[]>([]);
  const [loadingAgotadosAdmin, setLoadingAgotadosAdmin] = useState(false);
  const [agotadosError, setAgotadosError] = useState("");
  const [reposicionPorLibro, setReposicionPorLibro] = useState<
    Record<
      string,
      { idTienda: number; cantidadAAgregar: number; tipoMovimiento: "sumar" | "restar" }
    >
  >({});
  const [savingReposicionLibroId, setSavingReposicionLibroId] = useState<string | null>(null);
  const [showStockManager, setShowStockManager] = useState(false);
  const [stockLibroActual, setStockLibroActual] = useState<Libro | null>(null);
  const [idTiendaStock, setIdTiendaStock] = useState<number>(0);
  const [cantidadStock, setCantidadStock] = useState<number>(1);
  const [tipoMovimientoStock, setTipoMovimientoStock] = useState<"sumar" | "restar">("sumar");
  const [guardandoStock, setGuardandoStock] = useState(false);
  const [stockMensaje, setStockMensaje] = useState("");
  const [stockError, setStockError] = useState("");

  const cargarDatos = async () => {
    setLoading(true);
    setError("");
    try {
      const [l, a, g, e, t, i, agotados] = await Promise.all([
        apiFetch<Libro[]>("/libros"),
        apiFetch<Autor[]>("/autores"),
        apiFetch<Genero[]>("/generos"),
        apiFetch<Editorial[]>("/editoriales"),
        apiFetch<TiendaLite[]>("/tiendas").catch(() => []),
        apiFetch<InventarioLite[]>("/inventarios").catch(() => []),
        obtenerLibrosAgotadosAdmin().catch(() => []),
      ]);
      setLibros(l);
      setAutores(a);
      setGeneros(g);
      setEditoriales(e);
      setTiendas(t);
      setInventarios(i);
      setLibrosAgotadosAdmin(agotados);
    } catch {
      setError("Error al cargar los datos");
    } finally {
      setLoading(false);
    }
  };

  const cargarAgotadosAdmin = async () => {
    setLoadingAgotadosAdmin(true);
    setAgotadosError("");
    try {
      const agotados = await obtenerLibrosAgotadosAdmin();
      setLibrosAgotadosAdmin(agotados);
      setReposicionPorLibro(prev => {
        const next = { ...prev };
        for (const libro of agotados) {
          if (!next[libro.idLibro]) {
            next[libro.idLibro] = {
              idTienda: libro.inventarios[0]?.idTienda ?? 0,
              cantidadAAgregar: 1,
              tipoMovimiento: "sumar",
            };
          }
        }
        return next;
      });
    } catch {
      setAgotadosError("No se pudo cargar la lista de libros agotados");
      setLibrosAgotadosAdmin([]);
    } finally {
      setLoadingAgotadosAdmin(false);
    }
  };

  useEffect(() => {
    if (authLoading) return;

    if (!isAuthenticated) {
      router.push("/login");
      return;
    }

    if (user && user.rol !== "root" && user.rol !== "administrador") {
      router.push("/");
      return;
    }

    cargarDatos();
  }, [authLoading, isAuthenticated, user, router]);

  const nombreAutor = (id: number) => autores.find(a => a.id === id)?.nombre ?? `Autor #${id}`;
  const nombreGenero = (id: number) => generos.find(g => g.id === id)?.nombre ?? `Género #${id}`;

  const librosFiltrados = useMemo(
    () =>
      libros.filter(l => {
        const q = busqueda.toLowerCase();
        return (
          (!q ||
            l.titulo.toLowerCase().includes(q) ||
            l.isbn.toLowerCase().includes(q) ||
            (autores.find(a => a.id === l.idAutor)?.nombre ?? `autor #${l.idAutor}`)
              .toLowerCase()
              .includes(q)) &&
          (filtroEstado === "todos" || l.estado === filtroEstado)
        );
      }),
    [libros, busqueda, filtroEstado, autores]
  );

  const librosAgotados = useMemo(() => librosAgotadosAdmin, [librosAgotadosAdmin]);
  const librosSinInventario = useMemo(() => {
    const idsConInventario = new Set(inventarios.map(inv => inv.idLibro));
    return libros.filter(libro => !idsConInventario.has(libro.id));
  }, [libros, inventarios]);

  const inventariosLibroSeleccionado = useMemo(() => {
    if (!stockLibroActual) return [];
    return inventarios.filter(inv => inv.idLibro === stockLibroActual.id);
  }, [inventarios, stockLibroActual]);

  const totalExistenciasLibro = (idLibro: string) =>
    inventarios
      .filter(inv => inv.idLibro === idLibro)
      .reduce((acumulado, inv) => acumulado + inv.cantidadDisponible, 0);

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
          <p>Solo usuarios con permisos pueden acceder a esta sección.</p>
        </div>
      </div>
    );
  }

  const setReposicion = (
    idLibro: string,
    patch: Partial<{
      idTienda: number;
      cantidadAAgregar: number;
      tipoMovimiento: "sumar" | "restar";
    }>
  ) => {
    setReposicionPorLibro(prev => {
      const actual = prev[idLibro] ?? { idTienda: 0, cantidadAAgregar: 1, tipoMovimiento: "sumar" };
      return {
        ...prev,
        [idLibro]: {
          ...actual,
          ...patch,
        },
      };
    });
  };

  const handleActualizarExistencias = async (libro: LibroAgotadoAdmin) => {
    const reposicion = reposicionPorLibro[libro.idLibro] ?? {
      idTienda: libro.inventarios[0]?.idTienda ?? 0,
      cantidadAAgregar: 1,
      tipoMovimiento: "sumar" as const,
    };

    if (!reposicion.idTienda) {
      setAgotadosError("Selecciona una tienda para reponer existencias");
      return;
    }

    if (reposicion.cantidadAAgregar <= 0) {
      setAgotadosError("La cantidad debe ser mayor a 0");
      return;
    }

    setSavingReposicionLibroId(libro.idLibro);
    setAgotadosError("");
    try {
      const inventarioTienda = libro.inventarios.find(inv => inv.idTienda === reposicion.idTienda);

      if (!inventarioTienda) {
        setAgotadosError("No existe inventario para ese libro en la tienda seleccionada");
        setSavingReposicionLibroId(null);
        return;
      }

      if (reposicion.tipoMovimiento === "sumar") {
        await agregarExistenciasLibro(
          reposicion.idTienda,
          libro.idLibro,
          reposicion.cantidadAAgregar
        );
      } else {
        const nuevaCantidad = inventarioTienda.cantidadDisponible - reposicion.cantidadAAgregar;
        if (nuevaCantidad < 0) {
          setAgotadosError("No puedes disminuir más de las existencias actuales");
          setSavingReposicionLibroId(null);
          return;
        }

        await actualizarCantidadInventarioLibro(reposicion.idTienda, libro.idLibro, nuevaCantidad);
      }
      await cargarAgotadosAdmin();
      await cargarDatos();
    } catch (e: unknown) {
      setAgotadosError(
        (e as { message?: string })?.message ?? "No fue posible actualizar existencias"
      );
    } finally {
      setSavingReposicionLibroId(null);
    }
  };

  const handleCrearInventario = async (libro: Libro) => {
    const reposicion = reposicionPorLibro[libro.id] ?? {
      idTienda: tiendas[0]?.id ?? 0,
      cantidadAAgregar: 1,
      tipoMovimiento: "sumar" as const,
    };

    if (!reposicion.idTienda) {
      setAgotadosError("Selecciona una tienda para crear inventario");
      return;
    }

    if (reposicion.cantidadAAgregar <= 0) {
      setAgotadosError("La cantidad inicial debe ser mayor a 0");
      return;
    }

    if (reposicion.tipoMovimiento === "restar") {
      setAgotadosError("No se puede disminuir porque el libro no tiene inventario en esa tienda");
      return;
    }

    setSavingReposicionLibroId(libro.id);
    setAgotadosError("");
    try {
      await crearInventarioLibro(reposicion.idTienda, libro.id, reposicion.cantidadAAgregar);
      await cargarAgotadosAdmin();
      await cargarDatos();
    } catch (e: unknown) {
      setAgotadosError((e as { message?: string })?.message ?? "No fue posible crear inventario");
    } finally {
      setSavingReposicionLibroId(null);
    }
  };

  const abrirGestorExistencias = (libro: Libro) => {
    const inventariosDeLibro = inventarios.filter(inv => inv.idLibro === libro.id);
    setStockLibroActual(libro);
    setIdTiendaStock(inventariosDeLibro[0]?.idTienda ?? tiendas[0]?.id ?? 0);
    setCantidadStock(1);
    setTipoMovimientoStock("sumar");
    setStockError("");
    setStockMensaje("");
    setShowStockManager(true);
  };

  const handleGuardarExistenciasLibro = async () => {
    if (!stockLibroActual) return;

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
      const inventarioExistente = inventariosLibroSeleccionado.find(
        i => i.idTienda === idTiendaStock
      );

      if (inventarioExistente) {
        if (tipoMovimientoStock === "sumar") {
          await agregarExistenciasLibro(idTiendaStock, stockLibroActual.id, cantidadStock);
        } else {
          const nuevaCantidad = inventarioExistente.cantidadDisponible - cantidadStock;
          if (nuevaCantidad < 0) {
            setStockError("No puedes disminuir más de las existencias actuales");
            setGuardandoStock(false);
            return;
          }
          await actualizarCantidadInventarioLibro(
            idTiendaStock,
            stockLibroActual.id,
            nuevaCantidad
          );
        }
      } else {
        if (tipoMovimientoStock === "restar") {
          setStockError("No se puede disminuir porque no existe inventario en esa tienda");
          setGuardandoStock(false);
          return;
        }
        await crearInventarioLibro(idTiendaStock, stockLibroActual.id, cantidadStock);
      }

      await cargarDatos();
      await cargarAgotadosAdmin();
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

  const cerrar = () => {
    setDialogMode(null);
    setLibroActual(null);
    setFormError("");
  };
  const abrirCrear = () => {
    setForm(LIBRO_VACIO);
    setFormError("");
    setDialogMode("create");
  };
  const abrirEditar = (libro: Libro) => {
    setLibroActual(libro);
    setForm({
      titulo: libro.titulo,
      idAutor: libro.idAutor,
      idGenero: libro.idGenero,
      idEditorial: libro.idEditorial,
      anoPublicacion: libro.anoPublicacion,
      precio: libro.precio,
      isbn: libro.isbn,
      idioma: libro.idioma,
      descripcion: libro.descripcion ?? "",
      imagenPortada: libro.imagenPortada ?? "",
      estado: libro.estado,
    });
    setFormError("");
    setDialogMode("edit");
  };
  const abrirVer = (libro: Libro) => {
    setLibroActual(libro);
    setForm({
      titulo: libro.titulo,
      idAutor: libro.idAutor,
      idGenero: libro.idGenero,
      idEditorial: libro.idEditorial,
      anoPublicacion: libro.anoPublicacion,
      precio: libro.precio,
      isbn: libro.isbn,
      idioma: libro.idioma,
      descripcion: libro.descripcion ?? "",
      imagenPortada: libro.imagenPortada ?? "",
      estado: libro.estado,
    });
    setDialogMode("view");
  };
  const abrirEliminar = (libro: Libro) => {
    setLibroActual(libro);
    setDialogMode("delete");
  };

  const validar = (): boolean => {
    if (!form.titulo.trim()) {
      setFormError("El título es requerido");
      return false;
    }
    if (!form.idAutor) {
      setFormError("Selecciona un autor");
      return false;
    }
    if (!form.idGenero) {
      setFormError("Selecciona un género");
      return false;
    }
    if (!form.idEditorial) {
      setFormError("Selecciona una editorial");
      return false;
    }
    if (!form.isbn.trim()) {
      setFormError("El ISBN es requerido");
      return false;
    }
    if (form.precio <= 0) {
      setFormError("El precio debe ser mayor a 0");
      return false;
    }
    return true;
  };

  // Payload para CREAR — incluye idAutor e idEditorial
  const payloadCrear = () => ({
    titulo: form.titulo,
    idAutor: Number(form.idAutor),
    idGeneros: [Number(form.idGenero)],
    idEditorial: Number(form.idEditorial),
    anoPublicacion: Number(form.anoPublicacion),
    precio: Number(form.precio),
    isbn: form.isbn,
    idioma: form.idioma,
    descripcion: form.descripcion,
    imagenPortada: form.imagenPortada,
    estado: form.estado,
  });

  // Payload para EDITAR — sin idAutor ni idEditorial (bug del backend)
  const payloadEditar = () => ({
    titulo: form.titulo,
    idGeneros: [Number(form.idGenero)],
    anoPublicacion: Number(form.anoPublicacion),
    precio: Number(form.precio),
    isbn: form.isbn,
    idioma: form.idioma,
    descripcion: form.descripcion,
    imagenPortada: form.imagenPortada,
    estado: form.estado,
  });

  const handleCrear = async () => {
    if (!validar()) return;
    setSaving(true);
    try {
      const nuevo = await apiFetch<Libro>("/libros", {
        method: "POST",
        body: JSON.stringify(payloadCrear()),
      });
      setLibros(prev => [nuevo, ...prev]);
      cerrar();
    } catch (e: unknown) {
      setFormError((e as { message?: string })?.message ?? "Error al crear");
    } finally {
      setSaving(false);
    }
  };

  const handleEditar = async () => {
    if (!libroActual || !validar()) return;
    setSaving(true);
    try {
      const u = await apiFetch<Libro>(`/libros/${libroActual.id}`, {
        method: "PATCH",
        body: JSON.stringify(payloadEditar()),
      });
      setLibros(prev => prev.map(l => (l.id === libroActual.id ? u : l)));
      cerrar();
    } catch (e: unknown) {
      setFormError((e as { message?: string })?.message ?? "Error al actualizar");
    } finally {
      setSaving(false);
    }
  };

  const handleEliminar = async () => {
    if (!libroActual) return;
    setSaving(true);
    try {
      await apiFetch(`/libros/${libroActual.id}`, { method: "DELETE" });
      setLibros(prev => prev.filter(l => l.id !== libroActual.id));
      cerrar();
    } catch (e: unknown) {
      setFormError((e as { message?: string })?.message ?? "Error al eliminar");
    } finally {
      setSaving(false);
    }
  };

  const setF = (key: string, value: string | number) =>
    setForm(prev => ({ ...prev, [key]: value }));

  const renderFormLibro = (readOnly = false) => (
    <div className="flex flex-col gap-4">
      {formError && (
        <div className="bg-red-50 border border-red-300 rounded-lg px-4 py-3 text-red-800 text-sm">
          {formError}
        </div>
      )}

      <Input
        label="Título *"
        value={form.titulo}
        onChange={e => setF("titulo", e.target.value)}
        placeholder="Nombre del libro"
        disabled={readOnly}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Select
          label="Autor *"
          value={form.idAutor}
          onChange={e => setF("idAutor", Number(e.target.value) || 0)}
          disabled={readOnly}
        >
          <option value={0}>Seleccionar autor...</option>
          {autores.map(a => (
            <option key={a.id} value={a.id}>
              {a.nombre}
            </option>
          ))}
        </Select>

        <Select
          label="Género *"
          value={form.idGenero}
          onChange={e => setF("idGenero", Number(e.target.value) || 0)}
          disabled={readOnly}
        >
          <option value={0}>Seleccionar género...</option>
          {generos.map(g => (
            <option key={g.id} value={g.id}>
              {g.nombre}
            </option>
          ))}
        </Select>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Select
          label="Editorial *"
          value={form.idEditorial}
          onChange={e => setF("idEditorial", Number(e.target.value) || 0)}
          disabled={readOnly}
        >
          <option value={0}>Seleccionar editorial...</option>
          {editoriales.map(e => (
            <option key={e.id} value={e.id}>
              {e.nombre}
            </option>
          ))}
        </Select>

        <Select
          label="Idioma"
          value={form.idioma}
          onChange={e => setF("idioma", e.target.value)}
          disabled={readOnly}
        >
          {IDIOMA_OPTIONS.map(i => (
            <option key={i} value={i}>
              {i}
            </option>
          ))}
        </Select>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Input
          label="Año publicación"
          type="number"
          value={form.anoPublicacion}
          onChange={e => setF("anoPublicacion", e.target.value)}
          disabled={readOnly}
        />
        <Input
          label="Precio (COP) *"
          type="number"
          value={form.precio}
          onChange={e => setF("precio", e.target.value)}
          placeholder="45000"
          disabled={readOnly}
        />
        <Select
          label="Estado"
          value={form.estado}
          onChange={e => setF("estado", e.target.value)}
          disabled={readOnly}
        >
          {ESTADO_OPTIONS.map(s => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </Select>
      </div>

      <Input
        label="ISBN *"
        value={form.isbn}
        onChange={e => setF("isbn", e.target.value)}
        placeholder="978-0000000000"
        disabled={readOnly}
      />

      <Input
        label="URL imagen portada"
        value={form.imagenPortada}
        onChange={e => setF("imagenPortada", e.target.value)}
        placeholder="https://..."
        disabled={readOnly}
      />

      <div>
        <label className="block text-slate-700 text-sm font-semibold mb-1.5">Descripción</label>
        <textarea
          value={form.descripcion}
          onChange={e => setF("descripcion", e.target.value)}
          disabled={readOnly}
          rows={3}
          placeholder="Sinopsis del libro..."
          className="w-full px-3 py-2.5 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors resize-none disabled:bg-slate-50 disabled:text-slate-500"
        />
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50">
      <MainNavbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-slate-900 text-2xl font-bold">Gestión de libros</h1>
            <p className="text-slate-500 text-sm mt-0.5">Administra el catálogo de NovaLibros</p>
          </div>
          <div className="flex gap-3">
            <a
              href="/admin/tiendas"
              className="flex items-center gap-2 px-4 py-2 border border-slate-300 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
            >
              Ir a tiendas
            </a>
            <button
              onClick={() => {
                setShowAgotados(true);
                cargarAgotadosAdmin();
              }}
              className="flex items-center gap-2 px-4 py-2 border border-slate-300 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
            >
              <PackageIcon />
              Agotados ({librosAgotados.length})
            </button>
            <button
              onClick={abrirCrear}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 rounded-lg text-sm font-semibold text-white hover:bg-blue-700 transition-colors"
            >
              <PlusIcon />
              Agregar libro
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          {[
            { label: "Total libros", value: libros.length, color: "text-blue-600" },
            {
              label: "Nuevos",
              value: libros.filter(l => l.estado === "nuevo").length,
              color: "text-green-600",
            },
            {
              label: "Usados",
              value: libros.filter(l => l.estado === "usado").length,
              color: "text-yellow-600",
            },
            { label: "Agotados", value: librosAgotados.length, color: "text-red-600" },
          ].map(s => (
            <div key={s.label} className="bg-white border border-slate-200 rounded-xl p-4">
              <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
              <p className="text-slate-500 text-sm mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <div className="relative flex-1">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
              <SearchIcon />
            </div>
            <input
              type="text"
              value={busqueda}
              onChange={e => setBusqueda(e.target.value)}
              placeholder="Buscar por título, autor o ISBN..."
              className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
            />
          </div>
          <select
            value={filtroEstado}
            onChange={e => setFiltroEstado(e.target.value)}
            className="px-3 py-2.5 bg-white border border-slate-300 rounded-lg text-sm text-slate-800 outline-none focus:border-blue-500 cursor-pointer"
          >
            <option value="todos">Todos los estados</option>
            <option value="nuevo">Nuevo</option>
            <option value="usado">Usado</option>
            <option value="agotado">Agotado</option>
          </select>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
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
          ) : librosFiltrados.length === 0 ? (
            <div className="py-20 text-center text-slate-500">
              <div className="text-4xl mb-3">📭</div>
              <p className="font-semibold text-slate-700">No hay libros</p>
              <p className="text-sm mt-1">Agrega uno nuevo</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50">
                    {[
                      "Título",
                      "Autor",
                      "Género",
                      "ISBN",
                      "Precio",
                      "Existencias",
                      "Estado",
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
                  {librosFiltrados.map(libro => (
                    <tr key={libro.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3">
                        <p className="text-slate-900 text-sm font-semibold line-clamp-1 max-w-[200px]">
                          {libro.titulo}
                        </p>
                        <p className="text-slate-400 text-xs">{libro.anoPublicacion}</p>
                      </td>
                      <td className="px-4 py-3 text-slate-600 text-sm whitespace-nowrap">
                        {nombreAutor(libro.idAutor)}
                      </td>
                      <td className="px-4 py-3 text-slate-600 text-sm whitespace-nowrap">
                        {nombreGenero(libro.idGenero)}
                      </td>
                      <td className="px-4 py-3 text-slate-500 text-xs font-mono">{libro.isbn}</td>
                      <td className="px-4 py-3 text-blue-600 font-bold text-sm whitespace-nowrap">
                        ${Number(libro.precio).toLocaleString("es-CO")}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold border ${
                            totalExistenciasLibro(libro.id) > 0
                              ? "bg-green-50 text-green-700 border-green-300"
                              : "bg-red-50 text-red-700 border-red-300"
                          }`}
                        >
                          {totalExistenciasLibro(libro.id)}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <EstadoBadge estado={libro.estado} />
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => abrirVer(libro)}
                            title="Ver"
                            className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                          >
                            <EyeIcon />
                          </button>
                          <button
                            onClick={() => abrirEditar(libro)}
                            title="Editar"
                            className="p-1.5 rounded-lg text-slate-400 hover:text-yellow-600 hover:bg-yellow-50 transition-colors"
                          >
                            <EditIcon />
                          </button>
                          <button
                            onClick={() => abrirGestorExistencias(libro)}
                            title="Gestionar existencias"
                            className="p-1.5 rounded-lg text-slate-400 hover:text-amber-700 hover:bg-amber-50 transition-colors"
                          >
                            <PackageIcon />
                          </button>
                          <button
                            onClick={() => abrirEliminar(libro)}
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
                Mostrando {librosFiltrados.length} de {libros.length} libros
              </div>
            </div>
          )}
        </div>
      </main>

      {dialogMode === "create" && (
        <Modal title="Agregar nuevo libro" onClose={cerrar}>
          {renderFormLibro()}
          <div className="flex gap-3 justify-end mt-6 pt-4 border-t border-slate-100">
            <button
              onClick={cerrar}
              className="px-4 py-2 border border-slate-300 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleCrear}
              disabled={saving}
              className="px-5 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 disabled:opacity-60 transition-colors"
            >
              {saving ? "Guardando..." : "Guardar libro"}
            </button>
          </div>
        </Modal>
      )}
      {dialogMode === "edit" && (
        <Modal title={`Editar: ${libroActual?.titulo}`} onClose={cerrar}>
          {renderFormLibro()}
          <div className="flex gap-3 justify-end mt-6 pt-4 border-t border-slate-100">
            <button
              onClick={cerrar}
              className="px-4 py-2 border border-slate-300 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleEditar}
              disabled={saving}
              className="px-5 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 disabled:opacity-60 transition-colors"
            >
              {saving ? "Actualizando..." : "Actualizar libro"}
            </button>
          </div>
        </Modal>
      )}
      {dialogMode === "view" && (
        <Modal title="Detalles del libro" onClose={cerrar}>
          {renderFormLibro(true)}
          <div className="flex justify-end mt-6 pt-4 border-t border-slate-100">
            <button
              onClick={cerrar}
              className="px-5 py-2 bg-slate-100 text-slate-700 rounded-lg text-sm font-semibold hover:bg-slate-200 transition-colors"
            >
              Cerrar
            </button>
          </div>
        </Modal>
      )}
      {dialogMode === "delete" && libroActual && (
        <Modal title="Eliminar libro" onClose={cerrar}>
          <div className="flex flex-col items-center text-center gap-4 py-4">
            <div className="w-14 h-14 bg-red-50 rounded-full flex items-center justify-center">
              <AlertIcon />
            </div>
            <div>
              <p className="text-slate-900 font-bold text-lg">¿Eliminar este libro?</p>
              <p className="text-slate-500 text-sm mt-1">
                Estás a punto de eliminar{" "}
                <span className="font-semibold text-slate-700">{libroActual.titulo}</span>. Esta
                acción no se puede deshacer.
              </p>
            </div>
            {formError && <p className="text-red-600 text-sm">{formError}</p>}
          </div>
          <div className="flex gap-3 justify-center mt-2">
            <button
              onClick={cerrar}
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
      {showAgotados && (
        <Modal title="Libros agotados" onClose={() => setShowAgotados(false)}>
          {loadingAgotadosAdmin ? (
            <div className="text-center py-8 text-slate-500">
              <p className="font-semibold">Cargando libros agotados...</p>
            </div>
          ) : librosAgotados.length === 0 ? (
            <div className="text-center py-8 text-slate-500">
              <div className="text-3xl mb-2">✅</div>
              <p className="font-semibold">No hay libros agotados</p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {agotadosError && (
                <div className="bg-red-50 border border-red-300 rounded-lg px-3 py-2 text-red-700 text-sm">
                  {agotadosError}
                </div>
              )}
              <p className="text-slate-500 text-sm">
                {librosAgotados.length} libro(s) con stock en cero
              </p>
              {librosAgotados.map(libro => (
                <div key={libro.idLibro} className="p-3 bg-red-50 border border-red-200 rounded-xl">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-slate-900 font-semibold text-sm">{libro.titulo}</p>
                      <p className="text-slate-500 text-xs">
                        {libro.autor.nombre} · {libro.isbn}
                      </p>
                      <p className="text-slate-500 text-xs mt-0.5">
                        Tiendas: {libro.inventarios.length} · Bloqueado: {libro.totalBloqueada}
                      </p>
                    </div>
                    <a
                      href={`/books/${libro.idLibro}`}
                      className="text-blue-600 text-xs font-semibold hover:underline"
                    >
                      Ver libro
                    </a>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto_auto] gap-2 mt-3">
                    <select
                      value={
                        reposicionPorLibro[libro.idLibro]?.idTienda ??
                        libro.inventarios[0]?.idTienda ??
                        0
                      }
                      onChange={e =>
                        setReposicion(libro.idLibro, { idTienda: Number(e.target.value) })
                      }
                      className="px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm text-slate-800"
                    >
                      <option value={0}>Seleccionar tienda</option>
                      {libro.inventarios.map(inv => (
                        <option key={inv.idInventario} value={inv.idTienda}>
                          {inv.nombreTienda} (disp: {inv.cantidadDisponible})
                        </option>
                      ))}
                    </select>

                    <select
                      value={reposicionPorLibro[libro.idLibro]?.tipoMovimiento ?? "sumar"}
                      onChange={e =>
                        setReposicion(libro.idLibro, {
                          tipoMovimiento: e.target.value as "sumar" | "restar",
                        })
                      }
                      className="px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm text-slate-800"
                    >
                      <option value="sumar">Sumar</option>
                      <option value="restar">Disminuir</option>
                    </select>

                    <input
                      type="number"
                      min={1}
                      value={reposicionPorLibro[libro.idLibro]?.cantidadAAgregar ?? 1}
                      onChange={e =>
                        setReposicion(libro.idLibro, {
                          cantidadAAgregar: Number(e.target.value) || 1,
                        })
                      }
                      className="px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm text-slate-800 w-full sm:w-24"
                    />

                    <button
                      onClick={() => handleActualizarExistencias(libro)}
                      disabled={savingReposicionLibroId === libro.idLibro}
                      className="px-3 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 disabled:opacity-60"
                    >
                      {savingReposicionLibroId === libro.idLibro
                        ? "Guardando..."
                        : "Actualizar existencias"}
                    </button>
                  </div>

                  <p className="mt-2 text-xs text-slate-500">
                    Existencias actuales en tienda:{" "}
                    {libro.inventarios.find(
                      inv =>
                        inv.idTienda ===
                        (reposicionPorLibro[libro.idLibro]?.idTienda ??
                          libro.inventarios[0]?.idTienda)
                    )?.cantidadDisponible ?? 0}
                  </p>
                </div>
              ))}

              <div className="mt-2 pt-3 border-t border-slate-200">
                <p className="text-slate-700 text-sm font-semibold mb-2">
                  Libros sin inventario registrado ({librosSinInventario.length})
                </p>

                {librosSinInventario.length === 0 ? (
                  <p className="text-slate-500 text-sm">
                    Todos los libros ya tienen inventario registrado.
                  </p>
                ) : (
                  <div className="flex flex-col gap-3">
                    {librosSinInventario.map(libro => (
                      <div
                        key={libro.id}
                        className="p-3 bg-amber-50 border border-amber-200 rounded-xl"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div>
                            <p className="text-slate-900 font-semibold text-sm">{libro.titulo}</p>
                            <p className="text-slate-500 text-xs">
                              {nombreAutor(libro.idAutor)} · {libro.isbn}
                            </p>
                          </div>
                          <span className="text-xs font-semibold text-amber-700">
                            Sin inventario
                          </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto_auto] gap-2 mt-3">
                          <select
                            value={reposicionPorLibro[libro.id]?.idTienda ?? tiendas[0]?.id ?? 0}
                            onChange={e =>
                              setReposicion(libro.id, { idTienda: Number(e.target.value) })
                            }
                            className="px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm text-slate-800"
                          >
                            <option value={0}>Seleccionar tienda</option>
                            {tiendas.map(tienda => (
                              <option key={tienda.id} value={tienda.id}>
                                {tienda.nombre}
                              </option>
                            ))}
                          </select>

                          <select
                            value={reposicionPorLibro[libro.id]?.tipoMovimiento ?? "sumar"}
                            onChange={e =>
                              setReposicion(libro.id, {
                                tipoMovimiento: e.target.value as "sumar" | "restar",
                              })
                            }
                            className="px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm text-slate-800"
                          >
                            <option value="sumar">Sumar</option>
                            <option value="restar">Disminuir</option>
                          </select>

                          <input
                            type="number"
                            min={1}
                            value={reposicionPorLibro[libro.id]?.cantidadAAgregar ?? 1}
                            onChange={e =>
                              setReposicion(libro.id, {
                                cantidadAAgregar: Number(e.target.value) || 1,
                              })
                            }
                            className="px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm text-slate-800 w-full sm:w-24"
                          />

                          <button
                            onClick={() => handleCrearInventario(libro)}
                            disabled={savingReposicionLibroId === libro.id}
                            className="px-3 py-2 bg-amber-600 text-white rounded-lg text-sm font-semibold hover:bg-amber-700 disabled:opacity-60"
                          >
                            {savingReposicionLibroId === libro.id
                              ? "Creando..."
                              : "Crear inventario"}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
          <div className="flex justify-end mt-4 pt-4 border-t border-slate-100">
            <button
              onClick={() => setShowAgotados(false)}
              className="px-5 py-2 bg-slate-100 text-slate-700 rounded-lg text-sm font-semibold hover:bg-slate-200 transition-colors"
            >
              Cerrar
            </button>
          </div>
        </Modal>
      )}

      <StockManagerModal
        isOpen={showStockManager && !!stockLibroActual}
        title="Gestionar existencias"
        libroTitulo={stockLibroActual?.titulo ?? ""}
        tiendas={tiendas}
        inventarios={inventariosLibroSeleccionado}
        idTienda={idTiendaStock}
        cantidad={cantidadStock}
        tipoMovimiento={tipoMovimientoStock}
        loading={guardandoStock}
        error={stockError}
        message={stockMensaje}
        onClose={() => setShowStockManager(false)}
        onChangeTienda={setIdTiendaStock}
        onChangeCantidad={setCantidadStock}
        onChangeTipoMovimiento={setTipoMovimientoStock}
        onSubmit={handleGuardarExistenciasLibro}
      />
    </div>
  );
}
