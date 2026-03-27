'use client'

import Link from 'next/link'
import { useState, useEffect, useMemo } from 'react'
import { apiFetch } from '@/services/api.client'
import { useAuth } from '@/context/auth.context'
import { useAuth } from '@/context/auth.context'

// ─── Tipos de la API ──────────────────────────────────────────────────────────
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

// ─── Constantes ──────────────────────────────────────────────────────────────
const MIN_PRECIO = 0
const MAX_PRECIO = 1000000
const PRECIO_STEP = 5000

const OPCIONES_ORDEN = [
  { value: 'relevancia', label: 'Relevancia' },
  { value: 'precio_asc', label: 'Precio: menor a mayor' },
  { value: 'precio_desc', label: 'Precio: mayor a menor' },
  { value: 'reciente', label: 'Más recientes' },
  { value: 'antiguo', label: 'Más antiguos' },
  { value: 'az', label: 'Alfabético A-Z' },
]

// ─── Iconos ───────────────────────────────────────────────────────────────────
const BookIcon = ({ size = 20 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
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

const SearchIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="text-slate-400">
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

const CartIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
    <path
      d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"
      stroke="#2563EB"
      strokeWidth="2"
      strokeLinecap="round"
    />
    <line x1="3" y1="6" x2="21" y2="6" stroke="#2563EB" strokeWidth="2" strokeLinecap="round" />
    <path d="M16 10a4 4 0 0 1-8 0" stroke="#2563EB" strokeWidth="2" strokeLinecap="round" />
  </svg>
)

const LockIcon = () => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="none">
    <rect x="3" y="11" width="18" height="11" rx="2" stroke="currentColor" strokeWidth="2" />
    <path
      d="M7 11V7a5 5 0 0 1 10 0v4"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
  </svg>
)

const MenuIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
    <line
      x1="3"
      y1="6"
      x2="21"
      y2="6"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
    <line
      x1="3"
      y1="12"
      x2="21"
      y2="12"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
    <line
      x1="3"
      y1="18"
      x2="21"
      y2="18"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
  </svg>
)

const CloseIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
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

const UserIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
    <path
      d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
    <circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="2" />
  </svg>
)

const ShoppingBagIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
    <path
      d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
    <line x1="3" y1="6" x2="21" y2="6" stroke="currentColor" strokeWidth="2" />
    <path d="M16 10a4 4 0 0 1-8 0" stroke="currentColor" strokeWidth="2" />
  </svg>
)

const HeartIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
    <path
      d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
)

const SettingsIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" />
    <path
      d="M12 1v6m0 6v6M5.5 5.5l4.2 4.2m4.6 4.6l4.2 4.2M1 12h6m6 0h6M5.5 18.5l4.2-4.2m4.6-4.6l4.2-4.2"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
  </svg>
)

const LogoutIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
    <path
      d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
    <polyline
      points="16 17 21 12 16 7"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
    <line
      x1="21"
      y1="12"
      x2="9"
      y2="12"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
  </svg>
)

const ChevronDownIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
    <polyline points="6 9 12 15 18 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </svg>
)

// ─── Generar portada ──────────────────────────────────────────────────────────
const generarColorPortada = (titulo: string) => {
  const colors = [
    '#3B82F6',
    '#EF4444',
    '#10B981',
    '#F59E0B',
    '#8B5CF6',
    '#06B6D4',
    '#84CC16',
    '#F97316',
  ]
  const index = titulo.length % colors.length
  return colors[index]
}

const generarLetraPortada = (titulo: string) => {
  return titulo.charAt(0).toUpperCase()
}

const RANGE_SLIDER_STYLES = `
.range-slider input[type='range'] {
  -webkit-appearance: none;
  appearance: none;
  pointer-events: none;
}

.range-slider input[type='range']::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  pointer-events: auto;
  height: 16px;
  width: 16px;
  border-radius: 9999px;
  background: #1d4ed8;
  border: 2px solid #fff;
  box-shadow: 0 0 4px rgba(15, 23, 42, 0.25);
  cursor: pointer;
  margin-top: -6px;
}

.range-slider input[type='range']::-moz-range-thumb {
  pointer-events: auto;
  height: 16px;
  width: 16px;
  border-radius: 9999px;
  background: #1d4ed8;
  border: 2px solid #fff;
  box-shadow: 0 0 4px rgba(15, 23, 42, 0.25);
  cursor: pointer;
}

.range-slider input[type='range']::-ms-thumb {
  pointer-events: auto;
  height: 16px;
  width: 16px;
  border-radius: 9999px;
  background: #1d4ed8;
  border: 2px solid #fff;
  box-shadow: 0 0 4px rgba(15, 23, 42, 0.25);
  cursor: pointer;
}
`

// ─── Portada con imagen o placeholder ──────────────────────────────────────────
const BookCover = ({ libro }: { libro: Libro }) => {
  const [imageError, setImageError] = useState(false)

  // Verificar si la URL de la imagen es válida
  const imageUrl = libro.imagenPortada
  const isValidUrl =
    imageUrl &&
    (imageUrl.startsWith('http') || imageUrl.startsWith('https') || imageUrl.startsWith('/'))

  // Si es una URL relativa, agregar el dominio de la API
  const fullImageUrl =
    imageUrl && imageUrl.startsWith('/')
      ? `${process.env.NEXT_PUBLIC_API_URL}${imageUrl}`
      : imageUrl

  if (isValidUrl && !imageError) {
    return (
      <div className="w-full h-full relative overflow-hidden">
        <img
          src={fullImageUrl}
          alt={`Portada de ${libro.titulo}`}
          className="w-full h-full object-cover"
          onError={() => {
            console.log('Error cargando imagen:', fullImageUrl)
            setImageError(true)
          }}
        />
        <span
          className={`absolute top-2 left-2 px-2 py-0.5 rounded-md text-xs font-bold border
          ${
            libro.estado === 'nuevo'
              ? 'bg-green-50 text-green-800 border-green-400'
              : libro.estado === 'agotado'
                ? 'bg-red-50 text-red-800 border-red-400'
                : 'bg-yellow-50 text-yellow-800 border-yellow-400'
          }`}
        >
          {libro.estado}
        </span>
      </div>
    )
  }

  // Fallback: portada generada
  return (
    <div
      className="w-full h-full flex flex-col items-center justify-center gap-2 p-3 relative"
      style={{ backgroundColor: generarColorPortada(libro.titulo) }}
    >
      <span
        className="text-6xl font-extrabold leading-none select-none"
        style={{ color: 'rgba(255,255,255,0.15)' }}
      >
        {generarLetraPortada(libro.titulo)}
      </span>
      <span
        className="text-xs font-semibold text-center leading-tight line-clamp-2 max-w-full"
        style={{ color: 'rgba(255,255,255,0.5)' }}
      >
        {libro.titulo}
      </span>
      <span
        className={`absolute top-2 left-2 px-2 py-0.5 rounded-md text-xs font-bold border
        ${
          libro.estado === 'nuevo'
            ? 'bg-green-50 text-green-800 border-green-400'
            : libro.estado === 'agotado'
              ? 'bg-red-50 text-red-800 border-red-400'
              : 'bg-yellow-50 text-yellow-800 border-yellow-400'
        }`}
      >
        {libro.estado}
      </span>
    </div>
  )
}

// ─── Tarjeta de libro ─────────────────────────────────────────────────────────
type UserRole = 'root' | 'administrador' | 'cliente' | null

const BookCard = ({
  libro,
  nombreAutor,
  nombreGenero,
  isAuthenticated,
  userRole,
}: {
  libro: Libro
  nombreAutor: (id: number) => string
  nombreGenero: (id: number) => string
  isAuthenticated: boolean
  userRole: UserRole
}) => {
  const canAddToCart = isAuthenticated && userRole === 'cliente'
  const cartTooltip = !isAuthenticated
    ? 'Inicia sesión para agregar al carrito'
    : userRole === 'cliente'
      ? 'Agregar al carrito'
      : 'Solo clientes pueden agregar al carrito'

  return (
    <a
      href={`/books/${libro.id}`}
      className="bg-white border border-slate-200 rounded-xl overflow-hidden transition-all duration-150 hover:-translate-y-1 hover:shadow-lg group block no-underline"
    >
      <div className="w-full aspect-[2/3] relative overflow-hidden">
        <BookCover libro={libro} />
      </div>

      <div className="p-3">
        <p className="text-slate-900 text-sm font-bold leading-snug mb-1 line-clamp-2">
          {libro.titulo}
        </p>
        <p className="text-slate-500 text-xs mb-2">{nombreAutor(libro.idAutor)}</p>
        <span className="inline-block bg-blue-50 text-blue-800 text-xs font-medium px-2 py-0.5 rounded mb-3">
          {nombreGenero(libro.idGenero)}
        </span>

        <div className="flex items-center justify-between pt-2 border-t border-slate-100">
          <div>
            <p className="text-blue-600 font-bold text-base">
              ${libro.precio.toLocaleString('es-CO')}
            </p>
            <div className="flex items-center gap-1 mt-0.5 text-xs">
              {!canAddToCart ? (
                <>
                  <LockIcon />
                  <span className="italic text-slate-400">
                    {isAuthenticated
                      ? 'Solo clientes pueden comprar'
                      : 'Inicia sesión para comprar'}
                  </span>
                </>
              ) : (
                <span className="text-green-500 font-medium">Disponible para comprar</span>
              )}
            </div>
          </div>
          {/* e.preventDefault() para que el clic en el carrito no navegue */}
          <div
            className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
              canAddToCart
                ? 'bg-blue-600 text-white cursor-pointer hover:bg-blue-700'
                : 'bg-slate-100 text-slate-400 opacity-75 cursor-not-allowed group-hover:bg-blue-50'
            }`}
            title={cartTooltip}
            onClick={e => {
              e.preventDefault()
              if (!canAddToCart) return
              // TODO: implementar lógica real para agregar al carrito
              alert(`Agregaste al carrito: ${libro.titulo}`)
            }}
          >
            <CartIcon />
          </div>
        </div>
      </div>
    </a>
  )
}

// ─── Página principal ─────────────────────────────────────────────────────────
export default function CataloguePage() {
  const [libros, setLibros] = useState<Libro[]>([])
  const [autores, setAutores] = useState<Autor[]>([])
  const [generos, setGeneros] = useState<Genero[]>([])
  const [editoriales, setEditoriales] = useState<Editorial[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [busqueda, setBusqueda] = useState('')
  const [inputBusqueda, setInputBusqueda] = useState('')
  const [generosSeleccionados, setGenerosSeleccionados] = useState<number[]>([])
  const [precioRango, setPrecioRango] = useState({ min: MIN_PRECIO, max: MAX_PRECIO })
  const [orden, setOrden] = useState('relevancia')
  const [menuAbierto, setMenuAbierto] = useState(false)

  const { user, isAuthenticated, logout } = useAuth()
  const nombreVisible = user?.nombre ? `${user.nombre} ${user.apellido}`.trim() : ''
  const inicialesPerfil = user
    ? `${user.nombre?.charAt(0).toUpperCase() ?? ''}${user.apellido?.charAt(0).toUpperCase() ?? ''}`
    : ''

  useEffect(() => {
    cargarDatos()
  }, [])

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      if (!target.closest('.user-menu-container')) {
        setMenuUsuarioAbierto(false)
      }
    }
    if (menuUsuarioAbierto) {
      document.addEventListener('click', handleClickOutside)
      return () => document.removeEventListener('click', handleClickOutside)
    }
  }, [menuUsuarioAbierto])

  const handleLogout = async () => {
    await logout()
    setMenuUsuarioAbierto(false)
  }

  const getInitials = (nombre: string, apellido: string) => {
    if (!nombre || !apellido) return 'U'
    return `${nombre.charAt(0)}${apellido.charAt(0)}`.toUpperCase()
  }

  const porcentajePrecio = (valor: number) =>
    ((valor - MIN_PRECIO) / (MAX_PRECIO - MIN_PRECIO)) * 100

  const toggleGenero = (id: number) => {
    setGenerosSeleccionados(prev =>
      prev.includes(id) ? prev.filter(gid => gid !== id) : [...prev, id]
    )
  }

  const handlePrecioChange = (tipo, valor) => {
    setPrecioRango(prev => {
      if (tipo === 'min') {
        // 👇 evita que pase al max
        const nuevoMin = Math.min(valor, prev.max - PRECIO_STEP)
        return { ...prev, min: nuevoMin }
      } else {
        // 👇 evita que pase al min
        const nuevoMax = Math.max(valor, prev.min + PRECIO_STEP)
        return { ...prev, max: nuevoMax }
      }
    })
  }

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
  const nombreEditorial = (id: number) =>
    editoriales.find(e => e.id === id)?.nombre ?? `Editorial #${id}`

  const librosFiltrados = useMemo(() => {
    let r = [...libros]
    if (busqueda.trim()) {
      const q = busqueda.toLowerCase()
      r = r.filter(
        l =>
          l.titulo.toLowerCase().includes(q) ||
          nombreAutor(l.idAutor).toLowerCase().includes(q) ||
          nombreGenero(l.idGenero).toLowerCase().includes(q) ||
          nombreEditorial(l.idEditorial).toLowerCase().includes(q) ||
          l.isbn.toLowerCase().includes(q)
      )
    }
    if (generosSeleccionados.length) {
      r = r.filter(l => generosSeleccionados.includes(l.idGenero))
    }
    r = r.filter(l => l.precio >= precioRango.min && l.precio <= precioRango.max)
    switch (orden) {
      case 'precio_asc':
        r.sort((a, b) => a.precio - b.precio)
        break
      case 'precio_desc':
        r.sort((a, b) => b.precio - a.precio)
        break
      case 'reciente':
        r.sort((a, b) => b.anoPublicacion - a.anoPublicacion)
        break
      case 'antiguo':
        r.sort((a, b) => a.anoPublicacion - b.anoPublicacion)
        break
      case 'az':
        r.sort((a, b) => a.titulo.localeCompare(b.titulo))
        break
    }
    return r
  }, [libros, busqueda, generosSeleccionados, precioRango, orden, autores, generos, editoriales])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setBusqueda(inputBusqueda)
  }
  const clearSidebarFilters = () => {
    setGenerosSeleccionados([])
    setPrecioRango({ min: MIN_PRECIO, max: MAX_PRECIO })
  }

  const clearFilters = () => {
    setBusqueda('')
    setInputBusqueda('')
    clearSidebarFilters()
    setOrden('relevancia')
  }
  const filtrosActivos =
    generosSeleccionados.length > 0 ||
    precioRango.min !== MIN_PRECIO ||
    precioRango.max !== MAX_PRECIO
  const minSliderMax = Math.max(MIN_PRECIO, precioRango.max - PRECIO_STEP)
  const maxSliderMin = Math.min(MAX_PRECIO, precioRango.min + PRECIO_STEP)

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <style>{RANGE_SLIDER_STYLES}</style>
      {/* ── Navbar ── */}
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-3 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500"
          >
            <div className="w-9 h-9 bg-blue-600 rounded-lg flex items-center justify-center shrink-0">
              <BookIcon size={20} />
            </div>
            <span className="text-slate-900 text-xl font-bold tracking-tight">NovaLibros</span>
          </div>

          <div className="hidden sm:flex items-center gap-3">
            {isAuthenticated ? (
              <>
                {user?.rol === 'root' || user?.rol === 'administrador' ? (
                  <a
                    href="/admin"
                    className="px-3 py-2 border border-slate-300 rounded-lg text-sm font-semibold text-slate-800 hover:bg-slate-50 transition-colors flex items-center gap-2"
                    title="Dashboard de administración"
                  >
                    🛠️ Admin
                  </a>
                ) : (
                  <a
                    href="/carrito"
                    className="px-3 py-2 border border-slate-300 rounded-lg text-sm font-semibold text-slate-800 hover:bg-slate-50 transition-colors flex items-center gap-2"
                    title="Carrito"
                  >
                    <CartIcon />
                    Carrito
                  </a>
                )}

                <button
                  className="px-3 py-2 border border-slate-300 rounded-lg text-sm font-semibold text-slate-800 hover:bg-slate-50 transition-colors relative"
                  title="Notificaciones"
                >
                  🔔
                  <span className="absolute -top-1 -right-1 w-4 h-4 text-[10px] leading-4 rounded-full bg-red-500 text-white flex items-center justify-center">
                    3
                  </span>
                </button>

                <div className="flex items-center gap-2 px-3 py-2 border border-slate-300 rounded-full bg-slate-50">
                  <span className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold">
                    {inicialesPerfil || 'U'}
                  </span>
                  <span className="text-sm font-semibold text-slate-700 truncate max-w-[120px]">
                    {nombreVisible || 'Usuario'}
                  </span>
                </div>

                <button
                  onClick={() => logout()}
                  className="px-3 py-2 border border-red-300 text-red-700 rounded-lg text-sm font-semibold hover:bg-red-50"
                >
                  Cerrar sesión
                </button>
              </>
            ) : (
              <>
                <a
                  href="/login"
                  className="px-4 py-2 border border-slate-300 rounded-lg text-sm font-semibold text-slate-800 hover:bg-slate-50 transition-colors"
                >
                  Iniciar sesión
                </a>
                <a
                  href="/register"
                  className="px-4 py-2 bg-blue-600 rounded-lg text-sm font-semibold text-white hover:bg-blue-700 transition-colors"
                >
                  Registrarse
                </a>
              </>
            )}
          </div>

          {/* Mobile: Hamburger */}
          <button
            className="sm:hidden text-slate-700 p-1"
            onClick={() => setMenuAbierto(!menuAbierto)}
          >
            {menuAbierto ? <CloseIcon /> : <MenuIcon />}
          </button>
        </div>

        {/* Mobile Menu */}
        {menuAbierto && (
          <div className="sm:hidden bg-white border-t border-slate-100 px-4 py-4 flex flex-col gap-3">
            {isAuthenticated ? (
              <>
                {user?.rol === 'root' || user?.rol === 'administrador' ? (
                  <a
                    href="/admin"
                    className="w-full text-center py-2.5 border border-slate-300 rounded-lg text-sm font-semibold text-slate-800"
                  >
                    Dashboard Admin
                  </a>
                ) : (
                  <a
                    href="/carrito"
                    className="w-full text-center py-2.5 border border-slate-300 rounded-lg text-sm font-semibold text-slate-800"
                  >
                    Carrito
                  </a>
                )}
                <a
                  href="/profile"
                  className="w-full text-center py-2.5 border border-slate-300 rounded-lg text-sm font-semibold text-slate-800"
                >
                  Perfil
                </a>
                <button
                  className="w-full text-center py-2.5 bg-red-100 text-red-700 rounded-lg font-semibold"
                  onClick={() => logout()}
                >
                  Cerrar sesión
                </button>
              </>
            ) : (
              <>
                <a
                  href="/login"
                  className="w-full text-center py-2.5 border border-slate-300 rounded-lg text-sm font-semibold text-slate-800"
                >
                  Iniciar sesión
                </a>
                <a
                  href="/register"
                  className="w-full text-center py-2.5 bg-blue-600 rounded-lg text-sm font-semibold text-white"
                >
                  Registrarse
                </a>
              </>
            )}
          </div>
        )}
      </nav>

      {/* ── Hero ── */}
      {isAuthenticated && user ? (
        // Banner para usuario autenticado
        <section className="bg-slate-700 px-4 sm:px-8 py-10 sm:py-14 relative overflow-hidden">
          {/* Decoraciones */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600 opacity-10 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-600 opacity-5 rounded-full translate-y-1/2 -translate-x-1/2" />
          <div className="absolute top-1/2 left-1/4 w-32 h-32 bg-blue-400 opacity-10 rounded-full" />

          <div className="max-w-7xl mx-auto relative z-10">
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
              {/* Lado izquierdo: Saludo personalizado */}
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white text-lg font-bold border-2 border-white/30">
                    {getInitials(user.nombre, user.apellido)}
                  </div>
                  <div>
                    <p className="text-slate-400 text-xs font-medium uppercase tracking-wider">
                      Hola de nuevo
                    </p>
                    <h2 className="text-white text-2xl sm:text-3xl font-bold">
                      {user.nombre} {user.apellido}
                    </h2>
                  </div>
                </div>
                <p className="text-slate-300 text-sm sm:text-base mb-6 max-w-xl leading-relaxed">
                  ¿Qué te gustaría leer hoy? Descubre nuevos títulos, revisa tus reservas o continúa
                  donde lo dejaste.
                </p>

                {/* Acciones rápidas */}
                <div className="flex flex-wrap gap-3">
                  <a
                    href="/reservations"
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-white text-slate-700 rounded-lg text-sm font-semibold hover:bg-slate-50 transition-colors shadow-lg"
                  >
                    <ShoppingBagIcon />
                    <span>Mis Reservas</span>
                  </a>
                  <a
                    href="/purchases"
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-white/10 backdrop-blur-sm text-white rounded-lg text-sm font-semibold hover:bg-white/20 transition-colors border border-white/20"
                  >
                    <HeartIcon />
                    <span>Mis Compras</span>
                  </a>
                </div>
              </div>

              {/* Lado derecho: Búsqueda */}
              <div className="w-full lg:max-w-md">
                <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
                  <div className="relative flex-1">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
                      <SearchIcon />
                    </div>
                    <input
                      type="text"
                      value={inputBusqueda}
                      onChange={e => setInputBusqueda(e.target.value)}
                      placeholder="Buscar libros..."
                      className="w-full pl-10 pr-4 py-3 rounded-xl text-sm text-slate-900 bg-white outline-none focus:ring-2 focus:ring-blue-400 shadow-lg"
                    />
                  </div>
                  <button
                    type="submit"
                    className="px-6 py-3 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors shadow-lg"
                  >
                    Buscar
                  </button>
                </form>

                {/* Mini estadísticas */}
                <div className="mt-5 grid grid-cols-3 gap-3">
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 border border-white/20">
                    <p className="text-white text-lg font-bold">0</p>
                    <p className="text-slate-300 text-xs">Reservas</p>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 border border-white/20">
                    <p className="text-white text-lg font-bold">0</p>
                    <p className="text-slate-300 text-xs">Compras</p>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 border border-white/20">
                    <p className="text-white text-lg font-bold">0</p>
                    <p className="text-slate-300 text-xs">Favoritos</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      ) : (
        // Banner para usuario no autenticado (original)
        <section className="bg-slate-700 px-4 sm:px-8 py-12 sm:py-16 relative overflow-hidden">
          <div className="absolute -top-16 -right-16 w-64 h-64 rounded-full bg-blue-600 opacity-10 pointer-events-none" />
          <div className="absolute -bottom-10 left-1/3 w-48 h-48 rounded-full bg-blue-100 opacity-5 pointer-events-none" />

          <div className="max-w-7xl mx-auto relative z-10">
            <p className="text-slate-400 text-xs font-medium tracking-widest uppercase mb-3">
              Bienvenido a NovaLibros
            </p>
            <h1 className="text-white text-3xl sm:text-4xl font-bold leading-tight tracking-tight mb-3">
              Tu próxima lectura
              <br />
              <span className="text-blue-200">te está esperando</span>
            </h1>
            <p className="text-slate-400 text-sm sm:text-base mb-8 max-w-lg leading-relaxed">
              Explora miles de títulos. Regístrate para reservar, comprar y mucho más.
            </p>

            <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3 max-w-xl">
              <div className="relative flex-1">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
                  <SearchIcon />
                </div>
                <input
                  type="text"
                  value={inputBusqueda}
                  onChange={e => setInputBusqueda(e.target.value)}
                  placeholder="Buscar por título, autor, género..."
                  className="w-full pl-10 pr-4 py-3 rounded-xl text-sm text-slate-900 bg-white outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>
              <button
                type="submit"
                className="px-6 py-3 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors"
              >
                Buscar
              </button>
            </form>
          </div>
        </section>
      )}

      {/* ── Stats bar — solo md+ ── */}
      {/* <div className="hidden md:block bg-blue-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 py-3 flex gap-8">
          {[
            { icon: '📚', text: `${libros.length} títulos disponibles` },
            { icon: '✍️', text: `${autores.length} autores` },
            { icon: '🏷️', text: `${generos.length} géneros` },
            { icon: '🚚', text: 'Entrega en Colombia' },
          ].map(s => (
            <div key={s.text} className="flex items-center gap-2 text-blue-900 text-xs font-medium">
              <span>{s.icon}</span>
              <span>{s.text}</span>
            </div>
          ))}
        </div>
      </div> */}

      {/* ── Main ── */}
      <main className="flex-1 max-w-7xl mx-auto w-full py-6 sm:py-8">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar filtros */}
          <aside className="w-full lg:max-w-xs bg-white border border-slate-200 rounded-2xl p-5 h-fit">
            <div className="flex items-center justify-between mb-4">
              <p className="text-slate-900 font-semibold text-sm uppercase tracking-wide">
                Filtros
              </p>
              <button
                onClick={clearSidebarFilters}
                disabled={!filtrosActivos}
                className={`text-sm font-semibold transition-colors ${
                  filtrosActivos
                    ? 'text-blue-600 hover:text-blue-700'
                    : 'text-slate-300 cursor-not-allowed'
                }`}
              >
                Limpiar
              </button>
            </div>

            <div className="space-y-6">
              <div>
                <p className="text-slate-500 text-xs font-semibold uppercase tracking-wide mb-3">
                  Géneros
                </p>
                <div className="flex flex-col gap-2 max-h-72 overflow-y-auto pr-1">
                  {generos.length === 0 && (
                    <span className="text-xs text-slate-400">Sin géneros disponibles</span>
                  )}
                  {generos.map(g => (
                    <label
                      key={g.id}
                      className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        className="size-4 accent-blue-600 rounded border-slate-300"
                        checked={generosSeleccionados.includes(g.id)}
                        onChange={() => toggleGenero(g.id)}
                      />
                      <span>{g.nombre}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100">
                <p className="text-slate-500 text-xs font-semibold uppercase tracking-wide mb-3">
                  Precio
                </p>
                <div className="flex items-center justify-between text-xs text-slate-500 mb-4">
                  <span>${precioRango.min.toLocaleString('es-CO')}</span>
                  <span>${precioRango.max.toLocaleString('es-CO')}</span>
                </div>
                <div className="relative h-10 range-slider">
                  <div className="absolute top-1/2 -translate-y-1/2 h-1 w-full bg-slate-200 rounded-full" />
                  <div
                    className="absolute top-1/2 -translate-y-1/2 h-1 bg-blue-500 rounded-full"
                    style={{
                      left: `${porcentajePrecio(precioRango.min)}%`,
                      right: `${100 - porcentajePrecio(precioRango.max)}%`,
                    }}
                  />
                  <input
                    type="range"
                    min={MIN_PRECIO}
                    max={MAX_PRECIO}
                    step={PRECIO_STEP}
                    value={precioRango.min}
                    onChange={e => handlePrecioChange('min', Number(e.target.value))}
                    className="absolute inset-0 w-full h-10 appearance-none bg-transparent"
                    style={{ zIndex: 3 }}
                  />

                  <input
                    type="range"
                    min={MIN_PRECIO}
                    max={MAX_PRECIO}
                    step={PRECIO_STEP}
                    value={precioRango.max}
                    onChange={e => handlePrecioChange('max', Number(e.target.value))}
                    className="absolute inset-0 w-full h-10 appearance-none bg-transparent"
                    style={{ zIndex: 4 }}
                  />
                </div>
                <p className="text-[11px] text-slate-400 mt-2">
                  Usa la barra para definir un rango entre {MIN_PRECIO.toLocaleString('es-CO')} y
                  {MAX_PRECIO.toLocaleString('es-CO')}.
                </p>
              </div>
            </div>
          </aside>

          {/* Contenido principal */}
          <section className="flex-1">
            <div className="flex flex-wrap items-center gap-3 mb-5">
              <span className="text-slate-600 text-sm font-semibold">Ordenar por:</span>
              <select
                value={orden}
                onChange={e => setOrden(e.target.value)}
                className="px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm text-slate-800 outline-none focus:border-blue-500 cursor-pointer"
              >
                {OPCIONES_ORDEN.map(o => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>

            {!loading && !error && (
              <p className="text-slate-500 text-sm mb-4">
                <span className="text-slate-900 font-bold">{librosFiltrados.length}</span>{' '}
                {librosFiltrados.length === 1 ? 'libro encontrado' : 'libros encontrados'}
                {busqueda && (
                  <span>
                    {' '}
                    para &quot;<strong className="text-slate-800">{busqueda}</strong>&quot;
                  </span>
                )}
              </p>
            )}

        {/* Grid */}
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
        ) : librosFiltrados.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
            {librosFiltrados.map(libro => (
              <BookCard
                key={libro.id}
                libro={libro}
                nombreAutor={nombreAutor}
                nombreGenero={nombreGenero}
                isAuthenticated={isAuthenticated}
                userRole={user?.rol ?? null}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 text-slate-500">
            <div className="text-5xl mb-4">📭</div>
            <h3 className="text-slate-900 text-lg font-bold mb-2">No encontramos resultados</h3>
            <p className="text-sm mb-5">Intenta con otros términos o ajusta los filtros</p>
            <button
              onClick={clearFilters}
              className="px-6 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors"
            >
              Ver todos los libros
            </button>
          </div>
        )}

        {/* Banner CTA */}
        {!isAuthenticated && (
          <div className="mt-12 bg-slate-700 rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div>
              <h3 className="text-white text-lg font-bold mb-1">¿Listo para empezar?</h3>
              <p className="text-slate-400 text-sm leading-relaxed max-w-md">
                Regístrate gratis para comprar, reservar libros y recibir recomendaciones
                personalizadas.
              </p>
            </div>
            <div className="flex gap-3 w-full sm:w-auto shrink-0">
              <a
                href="/register"
                className="flex-1 sm:flex-none text-center px-5 py-2.5 bg-blue-600 rounded-lg text-sm font-semibold text-white hover:bg-blue-700 transition-colors"
              >
                Crear cuenta gratis
              </a>
              <a
                href="/login"
                className="flex-1 sm:flex-none text-center px-5 py-2.5 border border-slate-500 rounded-lg text-sm font-semibold text-white hover:border-slate-400 transition-colors"
              >
                Iniciar sesión
              </a>
            </div>
          </div>
        )}
      </main>

      {/* ── Footer ── */}
      <footer className="bg-slate-800 border-t border-slate-700 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <Link
            href="/"
            className="flex items-center gap-3 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-400"
          >
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <BookIcon size={16} />
            </div>
            <span className="text-white font-bold text-base">NovaLibros</span>
          </Link>

          <div className="flex flex-wrap gap-x-6 gap-y-2">
            {[
              'Catálogo',
              'Sobre nosotros',
              'Términos y condiciones',
              'Política de datos',
              'Contacto',
            ].map(link => (
              <a
                key={link}
                href="#"
                className="text-slate-400 text-sm hover:text-white transition-colors"
              >
                {link}
              </a>
            ))}
          </div>

          <span className="text-slate-500 text-sm">© 2025 NovaLibros.</span>
        </div>
      </footer>
    </div>
  )
}
