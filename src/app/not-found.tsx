'use client'

import Link from 'next/link'

const BookIcon = () => (
  <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
    <path
      d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
)

const PenIcon = () => (
  <svg width="64" height="64" viewBox="0 0 24 24" fill="none" className="text-blue-600">
    <path
      d="M12 19l7-7 3 3-7 7-3-3z"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M2 2l7.586 7.586"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <circle cx="11" cy="11" r="2" fill="currentColor" />
  </svg>
)

export default function NotFound() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header */}
      <nav className="bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-3 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500"
          >
            <div className="w-9 h-9 bg-blue-600 rounded-lg flex items-center justify-center shrink-0">
              <BookIcon />
            </div>
            <span className="text-slate-900 text-xl font-bold tracking-tight">NovaLibros</span>
          </Link>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-4 py-16">
        <div className="max-w-2xl w-full text-center">
          {/* Decoraciones de fondo */}
          <div className="relative">
            <div className="absolute -top-20 -left-20 w-40 h-40 bg-blue-100 rounded-full opacity-30 blur-3xl" />
            <div className="absolute -bottom-20 -right-20 w-40 h-40 bg-purple-100 rounded-full opacity-30 blur-3xl" />

            {/* Contenido principal */}
            <div className="relative">
              {/* Icono de pluma */}
              <div className="flex justify-center mb-8">
                <div className="relative">
                  <PenIcon />
                  {/* Línea de escritura animada */}
                  <div className="absolute -bottom-2 left-0 w-full h-0.5 bg-blue-600 animate-pulse" />
                </div>
              </div>

              {/* Número 404 */}
              <div className="mb-6">
                <h1 className="text-8xl sm:text-9xl font-bold text-slate-900 mb-2">404</h1>
                <div className="flex items-center justify-center gap-2 text-slate-500">
                  <div className="h-px w-12 bg-slate-300" />
                  <span className="text-sm font-medium uppercase tracking-widest">
                    Página no encontrada
                  </span>
                  <div className="h-px w-12 bg-slate-300" />
                </div>
              </div>

              {/* Mensaje principal */}
              <div className="mb-8">
                <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-4">
                  Esta página del libro
                  <br />
                  <span className="text-blue-600">aún se está escribiendo</span>
                </h2>
                <p className="text-slate-600 text-base sm:text-lg leading-relaxed max-w-lg mx-auto">
                  Parece que esta historia todavía no ha sido escrita. Mientras tanto, te invitamos
                  a explorar nuestra biblioteca de títulos disponibles.
                </p>
              </div>

              {/* Citas decorativas */}
              <div className="mb-10 flex items-center justify-center gap-8 text-slate-300">
                <div className="text-6xl">"</div>
                <p className="text-slate-500 italic text-sm max-w-md">
                  Un libro es un sueño que tienes en tus manos
                </p>
                <div className="text-6xl">"</div>
              </div>

              {/* Botones de acción */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link
                  href="/"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors shadow-lg"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M19 12H5M12 19l-7-7 7-7"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <span>Volver al inicio</span>
                </Link>
                <Link
                  href="/"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-white border border-slate-300 text-slate-700 rounded-lg text-sm font-semibold hover:bg-slate-50 transition-colors"
                >
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
                  <span>Explorar catálogo</span>
                </Link>
              </div>

              {/* Estadísticas decorativas */}
              <div className="mt-16 pt-8 border-t border-slate-200">
                <p className="text-slate-400 text-xs uppercase tracking-widest mb-4">
                  Mientras tanto, puedes disfrutar de
                </p>
                <div className="flex flex-wrap items-center justify-center gap-8">
                  <div>
                    <p className="text-2xl font-bold text-slate-900">+5.000</p>
                    <p className="text-xs text-slate-500">Títulos disponibles</p>
                  </div>
                  <div className="h-8 w-px bg-slate-200" />
                  <div>
                    <p className="text-2xl font-bold text-slate-900">+800</p>
                    <p className="text-xs text-slate-500">Autores</p>
                  </div>
                  <div className="h-8 w-px bg-slate-200" />
                  <div>
                    <p className="text-2xl font-bold text-slate-900">24h</p>
                    <p className="text-xs text-slate-500">Reservas rápidas</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-slate-800 border-t border-slate-700 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 text-center">
          <span className="text-slate-400 text-sm">
            © 2025 NovaLibros. Todos los derechos reservados.
          </span>
        </div>
      </footer>
    </div>
  )
}
