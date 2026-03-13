'use client'

import { useState, useMemo } from 'react'
import { LIBROS_MOCK, GENEROS, RANGOS_PRECIO, OPCIONES_ORDEN, type Libro } from '@/data/libros.mock'

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

// ─── Portada placeholder ──────────────────────────────────────────────────────
const BookCover = ({ libro }: { libro: Libro }) => (
  <div
    className="w-full h-full flex flex-col items-center justify-center gap-2 p-3"
    style={{ backgroundColor: libro.portadaColor }}
  >
    <span
      className="text-6xl font-extrabold leading-none select-none"
      style={{ color: 'rgba(255,255,255,0.15)' }}
    >
      {libro.portadaLetra}
    </span>
    <span
      className="text-xs font-semibold text-center leading-tight line-clamp-2 max-w-full"
      style={{ color: 'rgba(255,255,255,0.5)' }}
    >
      {libro.titulo}
    </span>
  </div>
)

// ─── Tarjeta de libro ─────────────────────────────────────────────────────────
const BookCard = ({ libro }: { libro: Libro }) => (
  <a
    href={`/books/${libro.id}`}
    className="bg-white border border-slate-200 rounded-xl overflow-hidden transition-all duration-150 hover:-translate-y-1 hover:shadow-lg group block no-underline"
  >
    <div className="w-full aspect-[2/3] relative overflow-hidden">
      <BookCover libro={libro} />
      <span
        className={`absolute top-2 left-2 px-2 py-0.5 rounded-md text-xs font-bold border
        ${
          libro.estado === 'Nuevo'
            ? 'bg-green-50 text-green-800 border-green-400'
            : 'bg-yellow-50 text-yellow-800 border-yellow-400'
        }`}
      >
        {libro.estado}
      </span>
    </div>

    <div className="p-3">
      <p className="text-slate-900 text-sm font-bold leading-snug mb-1 line-clamp-2">
        {libro.titulo}
      </p>
      <p className="text-slate-500 text-xs mb-2">{libro.autor}</p>
      <span className="inline-block bg-blue-50 text-blue-800 text-xs font-medium px-2 py-0.5 rounded mb-3">
        {libro.genero}
      </span>

      <div className="flex items-center justify-between pt-2 border-t border-slate-100">
        <div>
          <p className="text-blue-600 font-bold text-base">
            ${libro.precio.toLocaleString('es-CO')}
          </p>
          <div className="flex items-center gap-1 text-slate-400 mt-0.5">
            <LockIcon />
            <span className="text-xs italic">Inicia sesión para comprar</span>
          </div>
        </div>
        {/* e.preventDefault() para que el clic en el carrito no navegue */}
        <div
          className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center opacity-50 cursor-not-allowed group-hover:bg-blue-50 transition-colors"
          title="Inicia sesión para agregar al carrito"
          onClick={e => e.preventDefault()}
        >
          <CartIcon />
        </div>
      </div>
    </div>
  </a>
)

// ─── Página principal ─────────────────────────────────────────────────────────
export default function CataloguePage() {
  const [busqueda, setBusqueda] = useState('')
  const [inputBusqueda, setInputBusqueda] = useState('')
  const [generoActivo, setGeneroActivo] = useState('Todos')
  const [rangoIdx, setRangoIdx] = useState(0)
  const [orden, setOrden] = useState('relevancia')
  const [menuAbierto, setMenuAbierto] = useState(false)

  const librosFiltrados = useMemo(() => {
    let r = [...LIBROS_MOCK]
    if (busqueda.trim()) {
      const q = busqueda.toLowerCase()
      r = r.filter(
        l =>
          l.titulo.toLowerCase().includes(q) ||
          l.autor.toLowerCase().includes(q) ||
          l.genero.toLowerCase().includes(q) ||
          l.editorial.toLowerCase().includes(q)
      )
    }
    if (generoActivo !== 'Todos') r = r.filter(l => l.genero === generoActivo)
    const rango = RANGOS_PRECIO[rangoIdx]
    r = r.filter(l => l.precio >= rango.min && l.precio <= rango.max)
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
  }, [busqueda, generoActivo, rangoIdx, orden])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setBusqueda(inputBusqueda)
  }
  const clearFilters = () => {
    setBusqueda('')
    setInputBusqueda('')
    setGeneroActivo('Todos')
    setRangoIdx(0)
    setOrden('relevancia')
  }
  const hayFiltros = busqueda || generoActivo !== 'Todos' || rangoIdx !== 0

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* ── Navbar ── */}
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-blue-600 rounded-lg flex items-center justify-center shrink-0">
              <BookIcon size={20} />
            </div>
            <span className="text-slate-900 text-xl font-bold tracking-tight">NovaLibros</span>
          </div>

          <div className="hidden sm:flex items-center gap-3">
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
          </div>

          <button
            className="sm:hidden text-slate-700 p-1"
            onClick={() => setMenuAbierto(!menuAbierto)}
          >
            {menuAbierto ? <CloseIcon /> : <MenuIcon />}
          </button>
        </div>

        {menuAbierto && (
          <div className="sm:hidden bg-white border-t border-slate-100 px-4 py-4 flex flex-col gap-3">
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
          </div>
        )}
      </nav>

      {/* ── Hero ── */}
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

      {/* ── Stats bar — solo md+ ── */}
      <div className="hidden md:block bg-blue-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 py-3 flex gap-8">
          {[
            { icon: '📚', text: `${LIBROS_MOCK.length} títulos disponibles` },
            { icon: '✍️', text: `${new Set(LIBROS_MOCK.map(l => l.autor)).size} autores` },
            { icon: '🏷️', text: `${GENEROS.length - 1} géneros` },
            { icon: '🚚', text: 'Entrega en Colombia' },
          ].map(s => (
            <div key={s.text} className="flex items-center gap-2 text-blue-900 text-xs font-medium">
              <span>{s.icon}</span>
              <span>{s.text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Main ── */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 py-6 sm:py-8">
        {/* Filtros género */}
        <div className="flex items-center gap-2 mb-4 overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0">
          <span className="text-slate-600 text-sm font-semibold shrink-0">Género:</span>
          {GENEROS.map(g => (
            <button
              key={g}
              onClick={() => setGeneroActivo(g)}
              className={`px-3 py-1.5 rounded-full text-xs border whitespace-nowrap transition-all shrink-0
                ${
                  generoActivo === g
                    ? 'bg-blue-50 border-blue-500 text-blue-800 font-semibold'
                    : 'bg-white border-slate-200 text-slate-500 font-medium hover:border-slate-300'
                }`}
            >
              {g}
            </button>
          ))}
        </div>

        {/* Precio + orden */}
        <div className="flex flex-wrap items-center gap-3 mb-5">
          <span className="text-slate-600 text-sm font-semibold">Precio:</span>
          <select
            value={rangoIdx}
            onChange={e => setRangoIdx(Number(e.target.value))}
            className="px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm text-slate-800 outline-none focus:border-blue-500 cursor-pointer"
          >
            {RANGOS_PRECIO.map((r, i) => (
              <option key={i} value={i}>
                {r.label}
              </option>
            ))}
          </select>

          <select
            value={orden}
            onChange={e => setOrden(e.target.value)}
            className="px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm text-slate-800 outline-none focus:border-blue-500 cursor-pointer sm:ml-auto"
          >
            {OPCIONES_ORDEN.map(o => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>

          {hayFiltros && (
            <button
              onClick={clearFilters}
              className="text-blue-600 text-sm font-semibold hover:text-blue-700"
            >
              × Limpiar filtros
            </button>
          )}
        </div>

        {/* Contador */}
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

        {/* Grid */}
        {librosFiltrados.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
            {librosFiltrados.map(libro => (
              <BookCard key={libro.id} libro={libro} />
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
      </main>

      {/* ── Footer ── */}
      <footer className="bg-slate-800 border-t border-slate-700 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <BookIcon size={16} />
            </div>
            <span className="text-white font-bold text-base">NovaLibros</span>
          </div>

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
