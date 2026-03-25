'use client'

import { useState, useEffect, useMemo } from 'react'

const API_URL = process.env.NEXT_PUBLIC_API_URL

interface Libro {
  id: string
  titulo: string
  idAutor: number
  idGenero: number
  idEditorial: number
  anoPublicacion: number
  precio: number
  isbn: string
  idioma: string
  descripcion?: string
  imagenPortada?: string
  estado: string
}
interface Autor {
  id: number
  nombre: string
}
interface Genero {
  id: number
  nombre: string
}
interface Editorial {
  id: number
  nombre: string
}
type DialogMode = 'create' | 'edit' | 'view' | 'delete' | null

const ESTADO_OPTIONS = ['nuevo', 'usado']
const IDIOMA_OPTIONS = ['Español', 'Inglés', 'Francés', 'Portugués', 'Alemán', 'Italiano']
const LIBRO_VACIO = {
  titulo: '',
  idAutor: 0,
  idGenero: 0,
  idEditorial: 0,
  anoPublicacion: new Date().getFullYear(),
  precio: 0,
  isbn: '',
  idioma: 'Español',
  descripcion: '',
  imagenPortada: '',
  estado: 'nuevo',
}

function getToken(): string {
  if (typeof document === 'undefined') return ''
  const match = document.cookie.match(/auth_token=([^;]+)/)
  return match ? match[1] : ''
}

async function apiFetch<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getToken()
  const res = await fetch(`${API_URL}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
    ...options,
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data?.message || 'Error en el servidor')
  return data
}

const BookIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
    <path
      d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"
      stroke="white"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"
      stroke="white"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
)
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
)
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
)
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
)
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
)
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
)
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
)
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
)
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
)

const EstadoBadge = ({ estado }: { estado: string }) => (
  <span
    className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold border ${estado === 'agotado' ? 'bg-red-50 text-red-700 border-red-300' : estado === 'nuevo' ? 'bg-green-50 text-green-700 border-green-300' : 'bg-yellow-50 text-yellow-700 border-yellow-300'}`}
  >
    {estado}
  </span>
)

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
)

const Select = ({
  label,
  children,
  ...props
}: { label: string } & React.SelectHTMLAttributes<HTMLSelectElement> & {
    children: React.ReactNode
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
)

const Modal = ({
  title,
  onClose,
  children,
}: {
  title: string
  onClose: () => void
  children: React.ReactNode
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
)

export default function AdminLibrosPage() {
  const [libros, setLibros] = useState<Libro[]>([])
  const [autores, setAutores] = useState<Autor[]>([])
  const [generos, setGeneros] = useState<Genero[]>([])
  const [editoriales, setEditoriales] = useState<Editorial[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [busqueda, setBusqueda] = useState('')
  const [filtroEstado, setFiltroEstado] = useState('todos')
  const [dialogMode, setDialogMode] = useState<DialogMode>(null)
  const [libroActual, setLibroActual] = useState<Libro | null>(null)
  const [form, setForm] = useState(LIBRO_VACIO)
  const [formError, setFormError] = useState('')
  const [saving, setSaving] = useState(false)
  const [showAgotados, setShowAgotados] = useState(false)

  useEffect(() => {
    cargarDatos()
  }, [])

  const cargarDatos = async () => {
    setLoading(true)
    setError('')
    try {
      const [l, a, g, e] = await Promise.all([
        apiFetch<Libro[]>('/libros'),
        apiFetch<Autor[]>('/autores'),
        apiFetch<Genero[]>('/generos'),
        apiFetch<Editorial[]>('/editoriales'),
      ])
      setLibros(l)
      setAutores(a)
      setGeneros(g)
      setEditoriales(e)
    } catch {
      setError('Error al cargar los datos')
    } finally {
      setLoading(false)
    }
  }

  const nombreAutor = (id: number) => autores.find(a => a.id === id)?.nombre ?? `Autor #${id}`
  const nombreGenero = (id: number) => generos.find(g => g.id === id)?.nombre ?? `Género #${id}`

  const librosFiltrados = useMemo(
    () =>
      libros.filter(l => {
        const q = busqueda.toLowerCase()
        return (
          (!q ||
            l.titulo.toLowerCase().includes(q) ||
            l.isbn.toLowerCase().includes(q) ||
            nombreAutor(l.idAutor).toLowerCase().includes(q)) &&
          (filtroEstado === 'todos' || l.estado === filtroEstado)
        )
      }),
    [libros, busqueda, filtroEstado, autores]
  )

  const librosAgotados = useMemo(() => libros.filter(l => l.estado === 'agotado'), [libros])

  const cerrar = () => {
    setDialogMode(null)
    setLibroActual(null)
    setFormError('')
  }
  const abrirCrear = () => {
    setForm(LIBRO_VACIO)
    setFormError('')
    setDialogMode('create')
  }
  const abrirEditar = (libro: Libro) => {
    setLibroActual(libro)
    setForm({
      titulo: libro.titulo,
      idAutor: libro.idAutor,
      idGenero: libro.idGenero,
      idEditorial: libro.idEditorial,
      anoPublicacion: libro.anoPublicacion,
      precio: libro.precio,
      isbn: libro.isbn,
      idioma: libro.idioma,
      descripcion: libro.descripcion ?? '',
      imagenPortada: libro.imagenPortada ?? '',
      estado: libro.estado,
    })
    setFormError('')
    setDialogMode('edit')
  }
  const abrirVer = (libro: Libro) => {
    setLibroActual(libro)
    setForm({
      titulo: libro.titulo,
      idAutor: libro.idAutor,
      idGenero: libro.idGenero,
      idEditorial: libro.idEditorial,
      anoPublicacion: libro.anoPublicacion,
      precio: libro.precio,
      isbn: libro.isbn,
      idioma: libro.idioma,
      descripcion: libro.descripcion ?? '',
      imagenPortada: libro.imagenPortada ?? '',
      estado: libro.estado,
    })
    setDialogMode('view')
  }
  const abrirEliminar = (libro: Libro) => {
    setLibroActual(libro)
    setDialogMode('delete')
  }

  const validar = (): boolean => {
    if (!form.titulo.trim()) {
      setFormError('El título es requerido')
      return false
    }
    if (!form.idAutor) {
      setFormError('Selecciona un autor')
      return false
    }
    if (!form.idGenero) {
      setFormError('Selecciona un género')
      return false
    }
    if (!form.idEditorial) {
      setFormError('Selecciona una editorial')
      return false
    }
    if (!form.isbn.trim()) {
      setFormError('El ISBN es requerido')
      return false
    }
    if (form.precio <= 0) {
      setFormError('El precio debe ser mayor a 0')
      return false
    }
    return true
  }

  const payload = () => ({
    ...form,
    idAutor: Number(form.idAutor),
    idGenero: Number(form.idGenero),
    idEditorial: Number(form.idEditorial),
    anoPublicacion: Number(form.anoPublicacion),
    precio: Number(form.precio),
  })

  const handleCrear = async () => {
    if (!validar()) return
    setSaving(true)
    try {
      const nuevo = await apiFetch<Libro>('/libros', {
        method: 'POST',
        body: JSON.stringify(payload()),
      })
      setLibros(prev => [nuevo, ...prev])
      cerrar()
    } catch (e: unknown) {
      setFormError((e as { message?: string })?.message ?? 'Error al crear')
    } finally {
      setSaving(false)
    }
  }

  const handleEditar = async () => {
    if (!libroActual || !validar()) return
    setSaving(true)
    try {
      const u = await apiFetch<Libro>(`/libros/${libroActual.id}`, {
        method: 'PATCH',
        body: JSON.stringify(payload()),
      })
      setLibros(prev => prev.map(l => (l.id === libroActual.id ? u : l)))
      cerrar()
    } catch (e: unknown) {
      setFormError((e as { message?: string })?.message ?? 'Error al actualizar')
    } finally {
      setSaving(false)
    }
  }

  const handleEliminar = async () => {
    if (!libroActual) return
    setSaving(true)
    try {
      await apiFetch(`/libros/${libroActual.id}`, { method: 'DELETE' })
      setLibros(prev => prev.filter(l => l.id !== libroActual.id))
      cerrar()
    } catch (e: unknown) {
      setFormError((e as { message?: string })?.message ?? 'Error al eliminar')
    } finally {
      setSaving(false)
    }
  }

  const setF = (key: string, value: string | number) => setForm(prev => ({ ...prev, [key]: value }))

  const FormLibro = ({ readOnly = false }: { readOnly?: boolean }) => (
    <div className="flex flex-col gap-4">
      {formError && (
        <div className="bg-red-50 border border-red-300 rounded-lg px-4 py-3 text-red-800 text-sm">
          {formError}
        </div>
      )}
      <Input
        key="titulo"
        label="Título *"
        value={form.titulo}
        onChange={e => setF('titulo', e.target.value)}
        placeholder="Nombre del libro"
        disabled={readOnly}
      />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Select
          key="autor"
          label="Autor *"
          value={form.idAutor}
          onChange={e => setF('idAutor', e.target.value)}
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
          key="genero"
          label="Género *"
          value={form.idGenero}
          onChange={e => setF('idGenero', e.target.value)}
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
          key="editorial"
          label="Editorial *"
          value={form.idEditorial}
          onChange={e => setF('idEditorial', e.target.value)}
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
          key="idioma"
          label="Idioma"
          value={form.idioma}
          onChange={e => setF('idioma', e.target.value)}
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
          key="anoPublicacion"
          label="Año publicación"
          type="number"
          value={form.anoPublicacion}
          onChange={e => setF('anoPublicacion', e.target.value)}
          disabled={readOnly}
        />
        <Input
          key="precio"
          label="Precio (COP) *"
          type="number"
          value={form.precio}
          onChange={e => setF('precio', e.target.value)}
          placeholder="45000"
          disabled={readOnly}
        />
        <Select
          key="estado"
          label="Estado"
          value={form.estado}
          onChange={e => setF('estado', e.target.value)}
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
        key="isbn"
        label="ISBN *"
        value={form.isbn}
        onChange={e => setF('isbn', e.target.value)}
        placeholder="978-0000000000"
        disabled={readOnly}
      />
      <Input
        key="imagenPortada"
        label="URL imagen portada"
        value={form.imagenPortada}
        onChange={e => setF('imagenPortada', e.target.value)}
        placeholder="https://..."
        disabled={readOnly}
      />
      <div>
        <label className="block text-slate-700 text-sm font-semibold mb-1.5">Descripción</label>
        <textarea
          key="descripcion"
          value={form.descripcion}
          onChange={e => setF('descripcion', e.target.value)}
          disabled={readOnly}
          rows={3}
          placeholder="Sinopsis del libro..."
          className="w-full px-3 py-2.5 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors resize-none disabled:bg-slate-50 disabled:text-slate-500"
        />
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-slate-50">
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-blue-600 rounded-lg flex items-center justify-center">
              <BookIcon />
            </div>
            <div>
              <span className="text-slate-900 text-base font-bold">NovaLibros</span>
              <span className="ml-2 text-xs text-slate-400 font-medium uppercase tracking-wider">
                Admin
              </span>
            </div>
          </div>
          <a href="/" className="text-slate-500 text-sm hover:text-blue-600 transition-colors">
            Ver catálogo →
          </a>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-slate-900 text-2xl font-bold">Gestión de libros</h1>
            <p className="text-slate-500 text-sm mt-0.5">Administra el catálogo de NovaLibros</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setShowAgotados(true)}
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
            { label: 'Total libros', value: libros.length, color: 'text-blue-600' },
            {
              label: 'Nuevos',
              value: libros.filter(l => l.estado === 'nuevo').length,
              color: 'text-green-600',
            },
            {
              label: 'Usados',
              value: libros.filter(l => l.estado === 'usado').length,
              color: 'text-yellow-600',
            },
            { label: 'Agotados', value: librosAgotados.length, color: 'text-red-600' },
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
                    {['Título', 'Autor', 'Género', 'ISBN', 'Precio', 'Estado', 'Acciones'].map(
                      h => (
                        <th
                          key={h}
                          className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap"
                        >
                          {h}
                        </th>
                      )
                    )}
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
                        ${Number(libro.precio).toLocaleString('es-CO')}
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

      {dialogMode === 'create' && (
        <Modal title="Agregar nuevo libro" onClose={cerrar}>
          <FormLibro />
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
              {saving ? 'Guardando...' : 'Guardar libro'}
            </button>
          </div>
        </Modal>
      )}
      {dialogMode === 'edit' && (
        <Modal title={`Editar: ${libroActual?.titulo}`} onClose={cerrar}>
          <FormLibro />
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
              {saving ? 'Actualizando...' : 'Actualizar libro'}
            </button>
          </div>
        </Modal>
      )}
      {dialogMode === 'view' && (
        <Modal title="Detalles del libro" onClose={cerrar}>
          <FormLibro readOnly />
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
      {dialogMode === 'delete' && libroActual && (
        <Modal title="Eliminar libro" onClose={cerrar}>
          <div className="flex flex-col items-center text-center gap-4 py-4">
            <div className="w-14 h-14 bg-red-50 rounded-full flex items-center justify-center">
              <AlertIcon />
            </div>
            <div>
              <p className="text-slate-900 font-bold text-lg">¿Eliminar este libro?</p>
              <p className="text-slate-500 text-sm mt-1">
                Estás a punto de eliminar{' '}
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
              {saving ? 'Eliminando...' : 'Eliminar'}
            </button>
          </div>
        </Modal>
      )}
      {showAgotados && (
        <Modal title="Libros agotados" onClose={() => setShowAgotados(false)}>
          {librosAgotados.length === 0 ? (
            <div className="text-center py-8 text-slate-500">
              <div className="text-3xl mb-2">✅</div>
              <p className="font-semibold">No hay libros agotados</p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              <p className="text-slate-500 text-sm">
                {librosAgotados.length} libro(s) con stock en cero
              </p>
              {librosAgotados.map(libro => (
                <div
                  key={libro.id}
                  className="flex items-center justify-between p-3 bg-red-50 border border-red-200 rounded-xl"
                >
                  <div>
                    <p className="text-slate-900 font-semibold text-sm">{libro.titulo}</p>
                    <p className="text-slate-500 text-xs">
                      {nombreAutor(libro.idAutor)} · {libro.isbn}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setShowAgotados(false)
                      abrirEditar(libro)
                    }}
                    className="text-blue-600 text-xs font-semibold hover:underline"
                  >
                    Editar
                  </button>
                </div>
              ))}
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
    </div>
  )
}
