'use client'

import { useState } from 'react'

// ─── Mock de usuario (en producción vendría del AuthContext) ──────────────────
const USUARIO_MOCK = {
  nombre: 'Juan David',
  apellido: 'Gañán',
  usuario: 'juan.ganan',
  correo: 'juan.ganan@utp.edu.co',
  telefono: '+57 300 123 4567',
  direccion: 'Calle 15 #23-45, Pereira, Risaralda',
  fechaNacimiento: '2000-05-12',
  lugarNacimiento: 'Pereira, Colombia',
  genero: 'Masculino',
  saldo: 150000,
  preferencias: ['Ficción', 'Ciencia ficción', 'Historia', 'Filosofía'],
  avatar: null as string | null,
}

const PEDIDOS_MOCK = [
  {
    id: 'PED-001',
    fecha: '2025-11-10',
    total: 83000,
    estado: 'Entregado',
    libros: ['Cien años de soledad', '1984'],
  },
  {
    id: 'PED-002',
    fecha: '2025-12-01',
    total: 42000,
    estado: 'En camino',
    libros: ['Harry Potter y la piedra filosofal'],
  },
  {
    id: 'PED-003',
    fecha: '2026-01-15',
    total: 55000,
    estado: 'Pendiente',
    libros: ['Sapiens: De animales a dioses'],
  },
]

const GENEROS_DISPONIBLES = [
  'Ficción',
  'No ficción',
  'Ciencia ficción',
  'Fantasy',
  'Romance',
  'Thriller',
  'Terror',
  'Historia',
  'Biografía',
  'Autoayuda',
  'Ciencia',
  'Filosofía',
  'Poesía',
  'Infantil',
  'Juvenil',
]

type Tab = 'perfil' | 'seguridad' | 'pedidos' | 'saldo' | 'preferencias'

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

const LockIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
    <rect x="3" y="11" width="18" height="11" rx="2" stroke="currentColor" strokeWidth="2" />
    <path
      d="M7 11V7a5 5 0 0 1 10 0v4"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
  </svg>
)

const PackageIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
    <path
      d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <polyline
      points="3.27 6.96 12 12.01 20.73 6.96"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
    <line
      x1="12"
      y1="22.08"
      x2="12"
      y2="12"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
  </svg>
)

const WalletIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
    <path
      d="M21 12V7H5a2 2 0 0 1 0-4h14v4"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M3 5v14a2 2 0 0 0 2 2h16v-5"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M18 12a2 2 0 0 0 0 4h4v-4z"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
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

const EyeIcon = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
    <path
      d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
    <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" />
  </svg>
)

const EyeOffIcon = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
    <path
      d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
    <path
      d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
    <line
      x1="1"
      y1="1"
      x2="23"
      y2="23"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
  </svg>
)

const CheckIcon = () => (
  <svg width="10" height="10" viewBox="0 0 24 24" fill="none">
    <polyline
      points="20 6 9 17 4 12"
      stroke="white"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
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

// ─── Estado del pedido ────────────────────────────────────────────────────────
const EstadoBadge = ({ estado }: { estado: string }) => {
  const styles: Record<string, string> = {
    Entregado: 'bg-green-50 text-green-800 border-green-300',
    'En camino': 'bg-blue-50 text-blue-800 border-blue-300',
    Pendiente: 'bg-yellow-50 text-yellow-800 border-yellow-300',
    Cancelado: 'bg-red-50 text-red-800 border-red-300',
  }
  return (
    <span
      className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${styles[estado] ?? 'bg-slate-50 text-slate-700 border-slate-300'}`}
    >
      {estado}
    </span>
  )
}

// ─── Tabs ─────────────────────────────────────────────────────────────────────
const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: 'perfil', label: 'Datos personales', icon: <UserIcon /> },
  { id: 'seguridad', label: 'Contraseña', icon: <LockIcon /> },
  { id: 'pedidos', label: 'Pedidos', icon: <PackageIcon /> },
  { id: 'saldo', label: 'Saldo', icon: <WalletIcon /> },
  { id: 'preferencias', label: 'Preferencias', icon: <HeartIcon /> },
]

// ─── Componente principal ─────────────────────────────────────────────────────
export default function ProfilePage() {
  const [tabActiva, setTabActiva] = useState<Tab>('perfil')
  const [menuAbierto, setMenuAbierto] = useState(false)
  const [guardando, setGuardando] = useState(false)
  const [guardado, setGuardado] = useState(false)
  const [showPass, setShowPass] = useState({ actual: false, nueva: false, confirmar: false })
  const [preferencias, setPreferencias] = useState<string[]>(USUARIO_MOCK.preferencias)

  const [form, setForm] = useState({
    nombre: USUARIO_MOCK.nombre,
    apellido: USUARIO_MOCK.apellido,
    telefono: USUARIO_MOCK.telefono,
    direccion: USUARIO_MOCK.direccion,
    fechaNacimiento: USUARIO_MOCK.fechaNacimiento,
    lugarNacimiento: USUARIO_MOCK.lugarNacimiento,
    genero: USUARIO_MOCK.genero,
  })

  const [passForm, setPassForm] = useState({ actual: '', nueva: '', confirmar: '' })
  const [passError, setPassError] = useState('')

  const handleGuardar = () => {
    setGuardando(true)
    // TODO: conectar con users.service.ts → updateProfile(form)
    setTimeout(() => {
      setGuardando(false)
      setGuardado(true)
      setTimeout(() => setGuardado(false), 3000)
    }, 1200)
  }

  const handleCambiarPass = (e: React.FormEvent) => {
    e.preventDefault()
    setPassError('')
    if (passForm.nueva.length < 8) {
      setPassError('La nueva contraseña debe tener mínimo 8 caracteres')
      return
    }
    if (passForm.nueva !== passForm.confirmar) {
      setPassError('Las contraseñas no coinciden')
      return
    }
    setGuardando(true)
    // TODO: conectar con auth.service.ts → changePassword(passForm)
    setTimeout(() => {
      setGuardando(false)
      setPassForm({ actual: '', nueva: '', confirmar: '' })
    }, 1200)
  }

  const togglePreferencia = (p: string) =>
    setPreferencias(prev => (prev.includes(p) ? prev.filter(x => x !== p) : [...prev, p]))

  const inputClass =
    'w-full px-3 py-2.5 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors'

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
              href="/"
              className="text-sm text-slate-600 font-medium hover:text-blue-600 transition-colors"
            >
              Catálogo
            </a>
            <div className="w-9 h-9 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-bold cursor-pointer">
              {USUARIO_MOCK.nombre[0]}
              {USUARIO_MOCK.apellido[0]}
            </div>
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
            <a href="/" className="text-sm font-medium text-slate-700">
              Catálogo
            </a>
          </div>
        )}
      </nav>

      {/* ── Header de perfil ── */}
      <div className="bg-slate-700 px-4 sm:px-6 py-8">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-start sm:items-center gap-5">
          {/* Avatar */}
          <div className="relative">
            <div className="w-20 h-20 rounded-2xl bg-blue-600 flex items-center justify-center text-white text-2xl font-bold shadow-lg">
              {USUARIO_MOCK.nombre[0]}
              {USUARIO_MOCK.apellido[0]}
            </div>
            <button className="absolute -bottom-1 -right-1 w-7 h-7 bg-white rounded-full shadow flex items-center justify-center border border-slate-200 hover:bg-slate-50 transition-colors">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                <path
                  d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"
                  stroke="#475569"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"
                  stroke="#475569"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </div>

          <div>
            <h1 className="text-white text-xl font-bold">
              {USUARIO_MOCK.nombre} {USUARIO_MOCK.apellido}
            </h1>
            <p className="text-slate-400 text-sm">@{USUARIO_MOCK.usuario}</p>
            <p className="text-slate-400 text-sm">{USUARIO_MOCK.correo}</p>
          </div>

          {/* Saldo destacado */}
          <div className="sm:ml-auto bg-slate-600 rounded-xl px-5 py-3 border border-slate-500">
            <p className="text-slate-400 text-xs mb-1">Saldo disponible</p>
            <p className="text-white text-xl font-bold">
              ${USUARIO_MOCK.saldo.toLocaleString('es-CO')}
            </p>
          </div>
        </div>
      </div>

      {/* ── Contenido con tabs ── */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 py-8">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar tabs */}
          <aside className="lg:w-56 shrink-0">
            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
              {TABS.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setTabActiva(tab.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3.5 text-sm font-medium transition-colors border-b border-slate-100 last:border-0
                    ${
                      tabActiva === tab.id
                        ? 'bg-blue-50 text-blue-700 border-l-2 border-l-blue-600'
                        : 'text-slate-600 hover:bg-slate-50'
                    }`}
                >
                  {tab.icon}
                  {tab.label}
                </button>
              ))}
            </div>
          </aside>

          {/* Panel de contenido */}
          <div className="flex-1 min-w-0">
            {/* ── Tab: Datos personales ── */}
            {tabActiva === 'perfil' && (
              <div className="bg-white border border-slate-200 rounded-xl p-6">
                <h2 className="text-slate-900 text-lg font-bold mb-6">Datos personales</h2>

                {guardado && (
                  <div className="mb-4 bg-green-50 border border-green-300 rounded-lg px-4 py-3 text-green-800 text-sm flex items-center gap-2">
                    <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                      <CheckIcon />
                    </div>
                    Cambios guardados correctamente
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    { label: 'Nombre(s)', key: 'nombre', type: 'text' },
                    { label: 'Apellido(s)', key: 'apellido', type: 'text' },
                    { label: 'Teléfono', key: 'telefono', type: 'tel' },
                    { label: 'Fecha de nacimiento', key: 'fechaNacimiento', type: 'date' },
                    { label: 'Lugar de nacimiento', key: 'lugarNacimiento', type: 'text' },
                  ].map(f => (
                    <div key={f.key}>
                      <label className="block text-slate-700 text-sm font-semibold mb-1.5">
                        {f.label}
                      </label>
                      <input
                        type={f.type}
                        value={form[f.key as keyof typeof form]}
                        onChange={e => setForm(prev => ({ ...prev, [f.key]: e.target.value }))}
                        className={inputClass}
                      />
                    </div>
                  ))}

                  <div>
                    <label className="block text-slate-700 text-sm font-semibold mb-1.5">
                      Género
                    </label>
                    <select
                      value={form.genero}
                      onChange={e => setForm(prev => ({ ...prev, genero: e.target.value }))}
                      className={inputClass}
                    >
                      <option>Masculino</option>
                      <option>Femenino</option>
                      <option>Otro</option>
                      <option>Prefiero no decir</option>
                    </select>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-slate-700 text-sm font-semibold mb-1.5">
                      Dirección de entrega
                    </label>
                    <input
                      type="text"
                      value={form.direccion}
                      onChange={e => setForm(prev => ({ ...prev, direccion: e.target.value }))}
                      className={inputClass}
                    />
                  </div>
                </div>

                {/* Campos no editables */}
                <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    { label: 'Correo electrónico', value: USUARIO_MOCK.correo },
                    { label: 'Nombre de usuario', value: `@${USUARIO_MOCK.usuario}` },
                  ].map(f => (
                    <div key={f.label}>
                      <label className="block text-slate-500 text-sm font-semibold mb-1.5">
                        {f.label}
                      </label>
                      <div className="px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-500 cursor-not-allowed">
                        {f.value}
                      </div>
                      <p className="text-slate-400 text-xs mt-1">Este campo no se puede editar</p>
                    </div>
                  ))}
                </div>

                <div className="mt-6 flex justify-end">
                  <button
                    onClick={handleGuardar}
                    disabled={guardando}
                    className="px-6 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
                  >
                    {guardando ? 'Guardando...' : 'Guardar cambios'}
                  </button>
                </div>
              </div>
            )}

            {/* ── Tab: Contraseña ── */}
            {tabActiva === 'seguridad' && (
              <div className="bg-white border border-slate-200 rounded-xl p-6">
                <h2 className="text-slate-900 text-lg font-bold mb-2">Cambiar contraseña</h2>
                <p className="text-slate-500 text-sm mb-6">
                  Usa una contraseña segura de al menos 8 caracteres.
                </p>

                {passError && (
                  <div className="mb-4 bg-red-50 border border-red-300 rounded-lg px-4 py-3 text-red-800 text-sm">
                    {passError}
                  </div>
                )}

                <form onSubmit={handleCambiarPass} className="flex flex-col gap-4 max-w-md">
                  {[
                    { label: 'Contraseña actual', key: 'actual' as const },
                    { label: 'Nueva contraseña', key: 'nueva' as const },
                    { label: 'Confirmar nueva contraseña', key: 'confirmar' as const },
                  ].map(f => (
                    <div key={f.key}>
                      <label className="block text-slate-700 text-sm font-semibold mb-1.5">
                        {f.label}
                      </label>
                      <div className="relative">
                        <input
                          type={showPass[f.key] ? 'text' : 'password'}
                          value={passForm[f.key]}
                          onChange={e =>
                            setPassForm(prev => ({ ...prev, [f.key]: e.target.value }))
                          }
                          placeholder="••••••••"
                          className={`${inputClass} pr-10`}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPass(prev => ({ ...prev, [f.key]: !prev[f.key] }))}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                        >
                          {showPass[f.key] ? <EyeOffIcon /> : <EyeIcon />}
                        </button>
                      </div>
                    </div>
                  ))}

                  <button
                    type="submit"
                    disabled={guardando}
                    className="mt-2 px-6 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors w-fit"
                  >
                    {guardando ? 'Actualizando...' : 'Actualizar contraseña'}
                  </button>
                </form>
              </div>
            )}

            {/* ── Tab: Pedidos ── */}
            {tabActiva === 'pedidos' && (
              <div className="bg-white border border-slate-200 rounded-xl p-6">
                <h2 className="text-slate-900 text-lg font-bold mb-6">Historial de pedidos</h2>

                {PEDIDOS_MOCK.length === 0 ? (
                  <div className="text-center py-16 text-slate-500">
                    <div className="text-4xl mb-3">📦</div>
                    <p className="font-semibold text-slate-700">Sin pedidos aún</p>
                    <p className="text-sm mt-1">Cuando realices una compra aparecerá aquí</p>
                  </div>
                ) : (
                  <div className="flex flex-col gap-4">
                    {PEDIDOS_MOCK.map(pedido => (
                      <div
                        key={pedido.id}
                        className="border border-slate-200 rounded-xl p-4 hover:border-blue-200 transition-colors"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                          <div className="flex items-center gap-3">
                            <span className="text-slate-900 font-bold text-sm">{pedido.id}</span>
                            <EstadoBadge estado={pedido.estado} />
                          </div>
                          <div className="flex items-center gap-4">
                            <span className="text-slate-500 text-xs">{pedido.fecha}</span>
                            <span className="text-blue-600 font-bold text-sm">
                              ${pedido.total.toLocaleString('es-CO')}
                            </span>
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {pedido.libros.map(libro => (
                            <span
                              key={libro}
                              className="bg-slate-100 text-slate-600 text-xs px-2.5 py-1 rounded-lg"
                            >
                              {libro}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ── Tab: Saldo ── */}
            {tabActiva === 'saldo' && (
              <div className="bg-white border border-slate-200 rounded-xl p-6">
                <h2 className="text-slate-900 text-lg font-bold mb-6">Saldo interno</h2>

                {/* Saldo actual */}
                <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-2xl p-6 mb-6 text-white">
                  <p className="text-blue-200 text-sm mb-1">Saldo disponible</p>
                  <p className="text-4xl font-bold">
                    ${USUARIO_MOCK.saldo.toLocaleString('es-CO')}
                  </p>
                  <p className="text-blue-200 text-xs mt-3">
                    Solo puede usarse para compras en NovaLibros
                  </p>
                </div>

                {/* Info */}
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
                  <h3 className="text-blue-800 font-semibold text-sm mb-2">
                    ¿Cómo funciona el saldo?
                  </h3>
                  <ul className="text-blue-700 text-xs space-y-1.5">
                    <li>• El saldo interno es la única forma de pago en NovaLibros</li>
                    <li>• Puedes recargar saldo desde tu cuenta bancaria</li>
                    <li>• Las devoluciones aprobadas se reintegran al saldo</li>
                    <li>• El saldo de cumpleaños es válido solo por 1 día</li>
                  </ul>
                </div>

                <button className="px-6 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors">
                  Recargar saldo
                </button>
              </div>
            )}

            {/* ── Tab: Preferencias ── */}
            {tabActiva === 'preferencias' && (
              <div className="bg-white border border-slate-200 rounded-xl p-6">
                <h2 className="text-slate-900 text-lg font-bold mb-2">Preferencias literarias</h2>
                <p className="text-slate-500 text-sm mb-6">
                  Selecciona los géneros que más te interesan. Usamos esto para personalizar tus
                  recomendaciones.
                </p>

                <div className="flex flex-wrap gap-2.5 mb-6">
                  {GENEROS_DISPONIBLES.map(g => {
                    const activo = preferencias.includes(g)
                    return (
                      <button
                        key={g}
                        onClick={() => togglePreferencia(g)}
                        className={`flex items-center gap-1.5 px-3.5 py-2 rounded-full text-sm border transition-all
                          ${
                            activo
                              ? 'bg-blue-50 border-blue-500 text-blue-800 font-semibold'
                              : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300'
                          }`}
                      >
                        {activo && (
                          <div className="w-4 h-4 bg-blue-600 rounded-full flex items-center justify-center">
                            <CheckIcon />
                          </div>
                        )}
                        {g}
                      </button>
                    )
                  })}
                </div>

                <div className="flex items-center justify-between">
                  <p className="text-slate-400 text-sm">
                    <span className="font-semibold text-slate-700">{preferencias.length}</span>{' '}
                    géneros seleccionados
                  </p>
                  <button
                    onClick={handleGuardar}
                    disabled={guardando}
                    className="px-6 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 disabled:opacity-60 transition-colors"
                  >
                    {guardando ? 'Guardando...' : 'Guardar preferencias'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-slate-800 border-t border-slate-700 mt-auto">
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
