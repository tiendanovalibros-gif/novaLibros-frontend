'use client'

import { useState } from 'react'
import { LIBROS_MOCK, type Libro } from '@/data/libros.mock'

// ─── Mock: libro actual (en producción vendría de params + fetch) ─────────────
const LIBRO_ACTUAL = LIBROS_MOCK[0]
const RELACIONADOS = LIBROS_MOCK.filter(
  l => l.genero === LIBRO_ACTUAL.genero && l.id !== LIBRO_ACTUAL.id
).slice(0, 4)

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

const ArrowLeftIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
    <polyline
      points="15 18 9 12 15 6"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
)

const CartIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
    <path
      d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
    <line
      x1="3"
      y1="6"
      x2="21"
      y2="6"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
    <path d="M16 10a4 4 0 0 1-8 0" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </svg>
)

const BookmarkIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
    <path
      d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
)

const CalendarIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
    <rect x="3" y="4" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2" />
    <line
      x1="16"
      y1="2"
      x2="16"
      y2="6"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
    <line x1="8" y1="2" x2="8" y2="6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    <line
      x1="3"
      y1="10"
      x2="21"
      y2="10"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
  </svg>
)

const BuildingIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
    <rect x="2" y="7" width="20" height="14" rx="2" stroke="currentColor" strokeWidth="2" />
    <path
      d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
  </svg>
)

const TagIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
    <path
      d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <line
      x1="7"
      y1="7"
      x2="7.01"
      y2="7"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
  </svg>
)

const LockIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
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
const BookCover = ({ libro, big = false }: { libro: Libro; big?: boolean }) => (
  <div
    className={`w-full h-full flex flex-col items-center justify-center gap-3 ${big ? 'p-8' : 'p-3'}`}
    style={{ backgroundColor: libro.portadaColor }}
  >
    <span
      className={`font-extrabold leading-none select-none ${big ? 'text-9xl' : 'text-5xl'}`}
      style={{ color: 'rgba(255,255,255,0.15)' }}
    >
      {libro.portadaLetra}
    </span>
    <span
      className={`font-semibold text-center leading-tight line-clamp-3 max-w-full ${big ? 'text-sm' : 'text-xs'}`}
      style={{ color: 'rgba(255,255,255,0.5)' }}
    >
      {libro.titulo}
    </span>
  </div>
)

// ─── Navbar ───────────────────────────────────────────────────────────────────
const Navbar = () => {
  const [menuAbierto, setMenuAbierto] = useState(false)
  return (
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
  )
}

// ─── Tarjeta relacionado ──────────────────────────────────────────────────────
const RelatedCard = ({ libro }: { libro: Libro }) => (
  <a
    href={`/books/${libro.id}`}
    className="bg-white border border-slate-200 rounded-xl overflow-hidden hover:-translate-y-1 hover:shadow-lg transition-all duration-150 group block"
  >
    <div className="w-full aspect-[2/3] relative overflow-hidden">
      <BookCover libro={libro} />
      <span
        className={`absolute top-2 left-2 px-2 py-0.5 rounded-md text-xs font-bold border
        ${libro.estado === 'Nuevo' ? 'bg-green-50 text-green-800 border-green-400' : 'bg-yellow-50 text-yellow-800 border-yellow-400'}`}
      >
        {libro.estado}
      </span>
    </div>
    <div className="p-3">
      <p className="text-slate-900 text-sm font-bold leading-snug mb-1 line-clamp-2">
        {libro.titulo}
      </p>
      <p className="text-slate-500 text-xs mb-2">{libro.autor}</p>
      <p className="text-blue-600 font-bold text-sm">${libro.precio.toLocaleString('es-CO')}</p>
    </div>
  </a>
)

// ─── Página principal ─────────────────────────────────────────────────────────
export default function BookDetailPage() {
  const libro = LIBRO_ACTUAL
  const [reservando, setReservando] = useState(false)
  const [agregando, setAgregando] = useState(false)

  const handleReservar = () => {
    setReservando(true)
    setTimeout(() => setReservando(false), 1500)
    // TODO: conectar con reservas.service.ts
  }

  const handleAgregar = () => {
    setAgregando(true)
    setTimeout(() => setAgregando(false), 1500)
    // TODO: conectar con carrito.service.ts
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />

      {/* Breadcrumb */}
      <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 py-4">
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <a href="/" className="hover:text-blue-600 transition-colors">
            Catálogo
          </a>
          <span>/</span>
          <span className="text-blue-600 font-medium line-clamp-1">{libro.titulo}</span>
        </div>
      </div>

      {/* Contenido principal */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 pb-12">
        {/* ── Sección principal: portada + info ── */}
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden mb-8">
          <div className="flex flex-col md:flex-row">
            {/* Portada */}
            <div className="w-full md:w-64 lg:w-80 shrink-0">
              <div className="aspect-[2/3] md:h-full md:aspect-auto">
                <BookCover libro={libro} big />
              </div>
            </div>

            {/* Info */}
            <div className="flex-1 p-6 sm:p-8 flex flex-col justify-between gap-6">
              <div>
                {/* Badge estado */}
                <span
                  className={`inline-block px-2 py-0.5 rounded-md text-xs font-bold border mb-4
                  ${libro.estado === 'Nuevo' ? 'bg-green-50 text-green-800 border-green-400' : 'bg-yellow-50 text-yellow-800 border-yellow-400'}`}
                >
                  {libro.estado}
                </span>

                <h1 className="text-slate-900 text-2xl sm:text-3xl font-bold leading-tight tracking-tight mb-2">
                  {libro.titulo}
                </h1>
                <p className="text-slate-500 text-base mb-6">
                  por <span className="text-slate-700 font-semibold">{libro.autor}</span>
                </p>

                {/* Metadatos */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                  {[
                    { icon: <TagIcon />, label: 'Género', value: libro.genero },
                    { icon: <CalendarIcon />, label: 'Año', value: libro.anoPublicacion },
                    { icon: <BuildingIcon />, label: 'Editorial', value: libro.editorial },
                    { icon: <TagIcon />, label: 'Idioma', value: libro.idioma },
                  ].map(m => (
                    <div key={m.label} className="bg-slate-50 rounded-xl p-3">
                      <div className="flex items-center gap-1.5 text-slate-400 mb-1">
                        {m.icon}
                        <span className="text-xs">{m.label}</span>
                      </div>
                      <p className="text-slate-800 text-sm font-semibold">{m.value}</p>
                    </div>
                  ))}
                </div>

                {/* Descripción */}
                <p className="text-slate-600 text-sm leading-relaxed">{libro.descripcion}</p>
              </div>

              {/* Precio y botones */}
              <div className="border-t border-slate-100 pt-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <p className="text-blue-600 text-3xl font-bold">
                      ${libro.precio.toLocaleString('es-CO')}
                    </p>
                    <div className="flex items-center gap-1.5 text-slate-400 mt-1">
                      <LockIcon />
                      <span className="text-xs">Inicia sesión para comprar o reservar</span>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3">
                    {/* Reservar */}
                    <button
                      onClick={handleReservar}
                      disabled={reservando}
                      className="flex items-center justify-center gap-2 px-5 py-2.5 border-2 border-blue-600 text-blue-600 rounded-xl text-sm font-semibold hover:bg-blue-50 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
                    >
                      <BookmarkIcon />
                      {reservando ? 'Reservando...' : 'Reservar'}
                    </button>

                    {/* Agregar al carrito */}
                    <button
                      onClick={handleAgregar}
                      disabled={agregando}
                      className="flex items-center justify-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
                    >
                      <CartIcon />
                      {agregando ? 'Agregando...' : 'Agregar al carrito'}
                    </button>
                  </div>
                </div>

                {/* Aviso visitante */}
                <div className="mt-4 bg-blue-50 border border-blue-200 rounded-xl p-3 flex items-start gap-2">
                  <LockIcon />
                  <p className="text-blue-800 text-xs leading-relaxed">
                    Debes{' '}
                    <a href="/login" className="font-semibold underline">
                      iniciar sesión
                    </a>{' '}
                    para reservar o agregar al carrito. Los administradores no pueden realizar
                    compras.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Libros relacionados ── */}
        {RELACIONADOS.length > 0 && (
          <section>
            <h2 className="text-slate-900 text-xl font-bold mb-5">
              Más libros de <span className="text-blue-600">{libro.genero}</span>
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {RELACIONADOS.map(r => (
                <RelatedCard key={r.id} libro={r} />
              ))}
            </div>
          </section>
        )}

        {/* Botón volver */}
        <div className="mt-8">
          <a
            href="/"
            className="inline-flex items-center gap-2 text-slate-500 text-sm font-medium hover:text-blue-600 transition-colors"
          >
            <ArrowLeftIcon />
            Volver al catálogo
          </a>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-slate-800 border-t border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <BookIcon size={16} />
            </div>
            <span className="text-white font-bold">NovaLibros</span>
          </div>
          <span className="text-slate-500 text-sm">
            © 2025 NovaLibros. Todos los derechos reservados.
          </span>
        </div>
      </footer>
    </div>
  )
}
