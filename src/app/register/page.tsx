'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

// ─── Iconos ───────────────────────────────────────────────────────────────────
const BookIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
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

const EyeIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
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
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
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

const ErrorIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="12" r="10" stroke="#991B1B" strokeWidth="2" />
    <line x1="12" y1="8" x2="12" y2="12" stroke="#991B1B" strokeWidth="2" strokeLinecap="round" />
    <line
      x1="12"
      y1="16"
      x2="12.01"
      y2="16"
      stroke="#991B1B"
      strokeWidth="2"
      strokeLinecap="round"
    />
  </svg>
)

// ─── Constantes ───────────────────────────────────────────────────────────────
const GENEROS_LITERARIOS = [
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

const STEPS = [
  { num: 1, label: 'Datos personales' },
  { num: 2, label: 'Cuenta' },
  { num: 3, label: 'Preferencias' },
]

const STATS = [
  { num: '+5.000', label: 'Títulos' },
  { num: '+800', label: 'Autores' },
  { num: '24h', label: 'Reservas' },
]

// ─── Tipos ────────────────────────────────────────────────────────────────────
type Step = 1 | 2 | 3

interface FormData {
  nombre: string
  apellido: string
  dni: string
  fechaNacimiento: string
  lugarNacimiento: string
  genero: string
  correo: string
  usuario: string
  contrasena: string
  confirmarContrasena: string
  direccion: string
  telefono: string
  preferencias: string[]
  aceptaTerminos: boolean
  aceptaDatos: boolean
}

type FormErrors = Partial<Record<keyof FormData | 'general', string>>

const INITIAL_FORM: FormData = {
  nombre: '',
  apellido: '',
  dni: '',
  fechaNacimiento: '',
  lugarNacimiento: '',
  genero: '',
  correo: '',
  usuario: '',
  contrasena: '',
  confirmarContrasena: '',
  direccion: '',
  telefono: '',
  preferencias: [],
  aceptaTerminos: false,
  aceptaDatos: false,
}

// ─── Componente ───────────────────────────────────────────────────────────────
export default function RegisterPage() {
  const [step, setStep] = useState<Step>(1)
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [errors, setErrors] = useState<FormErrors>({})
  const [form, setForm] = useState<FormData>(INITIAL_FORM)
  const router = useRouter()
  const [error, setError] = useState('')

  const set = (field: keyof FormData, value: string | boolean | string[]) => {
    setForm(prev => ({ ...prev, [field]: value }))
    setErrors(prev => ({ ...prev, [field]: '' }))
  }

  const togglePreferencia = (pref: string) => {
    const next = form.preferencias.includes(pref)
      ? form.preferencias.filter(p => p !== pref)
      : [...form.preferencias, pref]
    set('preferencias', next)
  }

  // ── Validaciones por step ──
  const validateStep1 = (): boolean => {
    const e: FormErrors = {}
    if (!form.nombre.trim()) e.nombre = 'Campo requerido'
    if (!form.apellido.trim()) e.apellido = 'Campo requerido'
    if (!form.dni.trim()) e.dni = 'Campo requerido'
    if (!form.fechaNacimiento) e.fechaNacimiento = 'Campo requerido'
    if (!form.lugarNacimiento.trim()) e.lugarNacimiento = 'Campo requerido'
    if (!form.genero) e.genero = 'Selecciona un género'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const validateStep2 = (): boolean => {
    const e: FormErrors = {}
    if (!form.correo.trim() || !/\S+@\S+\.\S+/.test(form.correo)) e.correo = 'Correo inválido'
    if (!form.usuario.trim()) e.usuario = 'Campo requerido'
    if (form.contrasena.length < 8) e.contrasena = 'Mínimo 8 caracteres'
    if (form.contrasena !== form.confirmarContrasena)
      e.confirmarContrasena = 'Las contraseñas no coinciden'
    if (!form.direccion.trim()) e.direccion = 'Campo requerido'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const validateStep3 = (): boolean => {
    const e: FormErrors = {}
    if (form.preferencias.length === 0) e.general = 'Selecciona al menos una preferencia'
    if (!form.aceptaTerminos) e.aceptaTerminos = 'Debes aceptar los términos y condiciones'
    if (!form.aceptaDatos) e.aceptaDatos = 'Debes aceptar la política de datos'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const nextStep = () => {
    if (step === 1 && validateStep1()) setStep(2)
    if (step === 2 && validateStep2()) setStep(3)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrors({})
    if (!validateStep3()) return
    setLoading(true)

    const API_URL = process.env.NEXT_PUBLIC_API_URL

    try {
      const res = await fetch(`${API_URL}/users/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          dni: form.dni,
          nombre: form.nombre,
          apellido: form.apellido,
          fechaNacimiento: form.fechaNacimiento,
          correo: form.correo,
          contrasenaHash: form.contrasena,
          direccion: form.direccion || undefined,
          telefono: form.telefono || undefined,
          rol: 'cliente',
          estadoCuenta: true,
        }),
      })
      if (!res.ok) {
        let message = 'Error al registrar usuario'
        try {
          const data = await res.json()
          if (data && typeof data.message === 'string') {
            message = data.message
          }
        } catch {
          //ignorar error
        }
        throw new Error(message)
      }
      const data = await res.json()
      console.log('Register exitoso:', data)
      router.push('/')
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al iniciar sesión'
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  const err = (f: keyof FormData) =>
    errors[f] ? <p className="mt-1 text-xs text-[#DC2626]">{errors[f]}</p> : null

  // ── Sub-componente: Checkbox ──
  const Checkbox = ({
    field: f,
    label: lbl,
  }: {
    field: 'aceptaTerminos' | 'aceptaDatos'
    label: string
  }) => {
    const checked = form[f] as boolean
    const boxClasses = errors[f]
      ? 'w-[18px] h-[18px] min-w-[18px] rounded border-2 border-[#DC2626] bg-white flex items-center justify-center mt-0.5 cursor-pointer transition-all'
      : checked
        ? 'w-[18px] h-[18px] min-w-[18px] rounded border-2 border-[#2563EB] bg-[#2563EB] flex items-center justify-center mt-0.5 cursor-pointer transition-all'
        : 'w-[18px] h-[18px] min-w-[18px] rounded border-2 border-[#94A3B8] bg-white flex items-center justify-center mt-0.5 cursor-pointer transition-all'
    return (
      <div>
        <label className="flex cursor-pointer items-start gap-3">
          <div onClick={() => set(f, !checked)} className={boxClasses}>
            {checked && <CheckIcon />}
          </div>
          <span className="text-sm leading-relaxed text-[#475569]">{lbl}</span>
        </label>
        {errors[f] && <p className="ml-[30px] mt-1 text-xs text-[#DC2626]">{errors[f]}</p>}
      </div>
    )
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap');
        @media (max-width: 640px) {
          input, select {
            font-size: 16px !important;
          }
        }
      `}</style>
      <div className="flex min-h-screen bg-[#F8FAFC] font-['DM_Sans','Segoe_UI',sans-serif]">
        {/* ── Panel izquierdo ── */}
        <div className="relative hidden basis-[45%] flex-shrink-0 flex-col justify-between overflow-hidden bg-[#334155] p-12 text-white md:flex">
          <div className="pointer-events-none absolute -top-20 -right-20 h-80 w-80 rounded-full bg-[#2563EB] opacity-10" />
          <div className="pointer-events-none absolute -bottom-10 left-[-60px] h-60 w-60 rounded-full bg-[#2563EB] opacity-10" />
          <div className="pointer-events-none absolute -bottom-16 right-[20%] h-40 w-40 rounded-full bg-[#DBEAFE] opacity-20" />

          {/* Logo */}
          <a href="/" className="relative z-[1] flex items-center gap-3 text-white no-underline">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#2563EB]">
              <BookIcon />
            </div>
            <span className="text-2xl font-bold">NovaLibros</span>
          </a>

          {/* Hero text */}
          <div className="relative z-[1] space-y-5">
            <p className="text-[13px] font-medium uppercase tracking-[0.2em] text-[#94A3B8]">
              Tu librería en línea
            </p>
            <h2 className="text-[36px] font-bold leading-tight text-white">
              Encuentra el libro
              <br />
              <span className="text-[#DBEAFE]">perfecto para ti</span>
            </h2>
            <p className="max-w-[340px] text-[15px] leading-relaxed text-[#CBD5F5]">
              Navega entre miles de títulos y organiza tus compras y reservas sin complicaciones
            </p>
          </div>

          {/* Stats */}
          <div className="relative z-[1] flex gap-8">
            {STATS.map(stat => (
              <div key={stat.label}>
                <div className="text-[22px] font-bold text-white">{stat.num}</div>
                <div className="text-[13px] text-[#94A3B8]">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Panel derecho ── */}
        <div className="flex flex-1 items-start justify-center overflow-y-auto px-8 py-12">
          <div className="w-full max-w-[520px]">
            {/* Header mobile */}
            <div className="mb-8 text-center md:hidden">
              <a href="/" className="inline-flex items-center gap-3 text-[#0F172A] no-underline">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#2563EB]">
                  <BookIcon />
                </div>
                <span className="text-2xl font-bold">NovaLibros</span>
              </a>
            </div>

            {/* Título */}
            <div className="mb-6 text-center">
              <h1 className="text-3xl font-bold text-[#0F172A]">Crea tu cuenta</h1>
              <p className="mt-2 text-[15px] text-[#475569]">
                Completa el formulario para acceder a todos los beneficios
              </p>
            </div>

            {/* Stepper */}
            <div className="mb-8 flex items-center justify-center">
              {STEPS.map((s, i) => {
                const done = step > s.num
                const active = step === s.num
                return (
                  <div key={s.num} className="flex items-center">
                    <div className="flex flex-col items-center gap-1.5">
                      <div
                        className={`flex h-9 w-9 items-center justify-center rounded-full transition-all ${
                          active || done ? 'bg-[#2563EB]' : 'bg-[#E2E8F0]'
                        }`}
                      >
                        {done ? (
                          <CheckIcon />
                        ) : (
                          <span
                            className={`text-sm font-bold ${active ? 'text-white' : 'text-[#94A3B8]'}`}
                          >
                            {s.num}
                          </span>
                        )}
                      </div>
                      <span
                        className={`text-xs ${
                          active ? 'font-semibold text-[#0F172A]' : 'text-[#94A3B8]'
                        }`}
                      >
                        {s.label}
                      </span>
                    </div>
                    {i < STEPS.length - 1 && (
                      <div
                        className={`mx-2 mb-5 h-0.5 w-20 transition-colors ${
                          done ? 'bg-[#2563EB]' : 'bg-[#E2E8F0]'
                        }`}
                      />
                    )}
                  </div>
                )
              })}
            </div>

            {/* Card */}
            <div className="rounded-[28px] bg-white px-9 py-10 shadow-[0_18px_45px_rgba(15,23,42,0.12)]">
              {/* Error general */}
              {errors.general && (
                <div className="mb-5 flex items-center gap-2 rounded-lg border border-[#EF4444] bg-[#FEE2E2] px-4 py-3 text-sm text-[#991B1B]">
                  <ErrorIcon />
                  <span>{errors.general}</span>
                </div>
              )}

              {error && (
                <div className="mb-5 flex items-center gap-2 rounded-lg border border-[#EF4444] bg-[#FEE2E2] px-4 py-3 text-sm text-[#991B1B]">
                  <ErrorIcon />
                  <span>{error}</span>
                </div>
              )}

              {/* ── STEP 1: Datos personales ── */}
              {step === 1 && (
                <>
                  <h2 className="mb-6 text-lg font-bold text-[#0F172A]">Información personal</h2>
                  <div className="space-y-5">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="mb-2 block text-sm font-semibold text-[#0F172A]">
                          Nombre(s)
                        </label>
                        <input
                          type="text"
                          value={form.nombre}
                          onChange={e => set('nombre', e.target.value)}
                          placeholder="Juan"
                          className={`w-full rounded-lg border ${
                            errors.nombre ? 'border-[#DC2626]' : 'border-[#CBD5E1]'
                          } bg-white px-3.5 py-3 text-[15px] text-[#0F172A] outline-none transition focus:border-[#2563EB]`}
                        />
                        {err('nombre')}
                      </div>
                      <div>
                        <label className="mb-2 block text-sm font-semibold text-[#0F172A]">
                          Apellido(s)
                        </label>
                        <input
                          type="text"
                          value={form.apellido}
                          onChange={e => set('apellido', e.target.value)}
                          placeholder="García"
                          className={`w-full rounded-lg border ${
                            errors.apellido ? 'border-[#DC2626]' : 'border-[#CBD5E1]'
                          } bg-white px-3.5 py-3 text-[15px] text-[#0F172A] outline-none transition focus:border-[#2563EB]`}
                        />
                        {err('apellido')}
                      </div>
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-semibold text-[#0F172A]">
                        DNI / Documento de identidad
                      </label>
                      <input
                        type="text"
                        value={form.dni}
                        onChange={e => set('dni', e.target.value)}
                        placeholder="1234567890"
                        className={`w-full rounded-lg border ${
                          errors.dni ? 'border-[#DC2626]' : 'border-[#CBD5E1]'
                        } bg-white px-3.5 py-3 text-[15px] text-[#0F172A] outline-none transition focus:border-[#2563EB]`}
                      />
                      {err('dni')}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="mb-2 block text-sm font-semibold text-[#0F172A]">
                          Fecha de nacimiento
                        </label>
                        <input
                          type="date"
                          value={form.fechaNacimiento}
                          onChange={e => set('fechaNacimiento', e.target.value)}
                          className={`w-full rounded-lg border ${
                            errors.fechaNacimiento ? 'border-[#DC2626]' : 'border-[#CBD5E1]'
                          } bg-white px-3.5 py-3 text-[15px] text-[#0F172A] outline-none transition focus:border-[#2563EB]`}
                        />
                        {err('fechaNacimiento')}
                      </div>
                      <div>
                        <label className="mb-2 block text-sm font-semibold text-[#0F172A]">
                          Género
                        </label>
                        <select
                          value={form.genero}
                          onChange={e => set('genero', e.target.value)}
                          className={`w-full cursor-pointer rounded-lg border ${
                            errors.genero ? 'border-[#DC2626]' : 'border-[#CBD5E1]'
                          } bg-white px-3.5 py-3 text-[15px] text-[#0F172A] outline-none transition focus:border-[#2563EB]`}
                        >
                          <option value="">Seleccionar...</option>
                          <option value="masculino">Masculino</option>
                          <option value="femenino">Femenino</option>
                          <option value="otro">Otro</option>
                          <option value="prefiero_no_decir">Prefiero no decir</option>
                        </select>
                        {err('genero')}
                      </div>
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-semibold text-[#0F172A]">
                        Lugar de nacimiento
                      </label>
                      <input
                        type="text"
                        value={form.lugarNacimiento}
                        onChange={e => set('lugarNacimiento', e.target.value)}
                        placeholder="Pereira, Colombia"
                        className={`w-full rounded-lg border ${
                          errors.lugarNacimiento ? 'border-[#DC2626]' : 'border-[#CBD5E1]'
                        } bg-white px-3.5 py-3 text-[15px] text-[#0F172A] outline-none transition focus:border-[#2563EB]`}
                      />
                      {err('lugarNacimiento')}
                    </div>
                  </div>
                </>
              )}

              {/* ── STEP 2: Cuenta ── */}
              {step === 2 && (
                <>
                  <h2 className="mb-6 text-lg font-bold text-[#0F172A]">
                    Datos de acceso y contacto
                  </h2>
                  <div className="space-y-5">
                    <div>
                      <label className="mb-2 block text-sm font-semibold text-[#0F172A]">
                        Correo electrónico
                      </label>
                      <input
                        type="email"
                        value={form.correo}
                        onChange={e => set('correo', e.target.value)}
                        placeholder="tucorreo@ejemplo.com"
                        className={`w-full rounded-lg border ${
                          errors.correo ? 'border-[#DC2626]' : 'border-[#CBD5E1]'
                        } bg-white px-3.5 py-3 text-[15px] text-[#0F172A] outline-none transition focus:border-[#2563EB]`}
                      />
                      {err('correo')}
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-semibold text-[#0F172A]">
                        Nombre de usuario
                      </label>
                      <input
                        type="text"
                        value={form.usuario}
                        onChange={e => set('usuario', e.target.value)}
                        placeholder="juan_garcia"
                        className={`w-full rounded-lg border ${
                          errors.usuario ? 'border-[#DC2626]' : 'border-[#CBD5E1]'
                        } bg-white px-3.5 py-3 text-[15px] text-[#0F172A] outline-none transition focus:border-[#2563EB]`}
                      />
                      {err('usuario')}
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-semibold text-[#0F172A]">
                        Contraseña
                      </label>
                      <div className="relative">
                        <input
                          type={showPassword ? 'text' : 'password'}
                          value={form.contrasena}
                          onChange={e => set('contrasena', e.target.value)}
                          placeholder="Mínimo 8 caracteres"
                          className={`w-full rounded-lg border ${
                            errors.contrasena ? 'border-[#DC2626]' : 'border-[#CBD5E1]'
                          } bg-white px-3.5 py-3 pr-11 text-[15px] text-[#0F172A] outline-none transition focus:border-[#2563EB]`}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 flex -translate-y-1/2 items-center border-none bg-transparent p-1 text-[#94A3B8]"
                        >
                          {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                        </button>
                      </div>
                      {/* Indicador de fuerza */}
                      {form.contrasena.length > 0 && (
                        <div className="mt-2 flex gap-1">
                          {[1, 2, 3, 4].map(i => (
                            <div
                              key={i}
                              className="h-[3px] flex-1 rounded-sm transition-colors"
                              style={{
                                backgroundColor:
                                  form.contrasena.length >= i * 2
                                    ? form.contrasena.length < 6
                                      ? '#EF4444'
                                      : form.contrasena.length < 10
                                        ? '#F59E0B'
                                        : '#10B981'
                                    : '#E2E8F0',
                              }}
                            />
                          ))}
                        </div>
                      )}
                      {err('contrasena')}
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-semibold text-[#0F172A]">
                        Confirmar contraseña
                      </label>
                      <input
                        type="password"
                        value={form.confirmarContrasena}
                        onChange={e => set('confirmarContrasena', e.target.value)}
                        placeholder="Repite tu contraseña"
                        className={`w-full rounded-lg border ${
                          errors.confirmarContrasena ? 'border-[#DC2626]' : 'border-[#CBD5E1]'
                        } bg-white px-3.5 py-3 text-[15px] text-[#0F172A] outline-none transition focus:border-[#2563EB]`}
                      />
                      {err('confirmarContrasena')}
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-semibold text-[#0F172A]">
                        Dirección de correspondencia
                      </label>
                      <input
                        type="text"
                        value={form.direccion}
                        onChange={e => set('direccion', e.target.value)}
                        placeholder="Calle 15 #23-45, Pereira"
                        className={`w-full rounded-lg border ${
                          errors.direccion ? 'border-[#DC2626]' : 'border-[#CBD5E1]'
                        } bg-white px-3.5 py-3 text-[15px] text-[#0F172A] outline-none transition focus:border-[#2563EB]`}
                      />
                      {err('direccion')}
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-semibold text-[#0F172A]">
                        Teléfono <span className="font-normal text-[#94A3B8]">(opcional)</span>
                      </label>
                      <input
                        type="tel"
                        value={form.telefono}
                        onChange={e => set('telefono', e.target.value)}
                        placeholder="+57 300 000 0000"
                        className="w-full rounded-lg border border-[#CBD5E1] bg-white px-3.5 py-3 text-[15px] text-[#0F172A] outline-none transition focus:border-[#2563EB]"
                      />
                    </div>
                  </div>
                </>
              )}

              {/* ── STEP 3: Preferencias ── */}
              {step === 3 && (
                <form onSubmit={handleSubmit}>
                  <h2 className="mb-2 text-lg font-bold text-[#0F172A]">Preferencias literarias</h2>
                  <p className="mb-5 text-sm text-[#475569]">
                    Selecciona los géneros que más te interesan para personalizar tus
                    recomendaciones
                  </p>

                  <div className="mb-6 flex flex-wrap gap-2">
                    {GENEROS_LITERARIOS.map(pref => {
                      const selected = form.preferencias.includes(pref)
                      return (
                        <button
                          key={pref}
                          type="button"
                          onClick={() => togglePreferencia(pref)}
                          className={`rounded-full border px-3.5 py-1.5 text-[13px] transition-all ${
                            selected
                              ? 'border-[#2563EB] bg-[#DBEAFE] font-semibold text-[#1D4ED8]'
                              : 'border-[#E2E8F0] bg-white text-[#475569]'
                          }`}
                        >
                          {pref}
                        </button>
                      )
                    })}
                  </div>

                  <div className="mb-6 space-y-3.5 rounded-[10px] border border-[#E2E8F0] bg-[#F8FAFC] p-5">
                    <Checkbox
                      field="aceptaTerminos"
                      label="Acepto los términos y condiciones del servicio"
                    />
                    <Checkbox
                      field="aceptaDatos"
                      label="Acepto la política de tratamiento de datos personales (Ley 1581 de 2012)"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full rounded-lg bg-[#2563EB] px-4 py-3 text-[15px] font-semibold text-white transition hover:bg-[#1D4ED8] disabled:cursor-not-allowed disabled:bg-[#93C5FD]"
                  >
                    {loading ? 'Creando cuenta...' : 'Crear cuenta'}
                  </button>
                </form>
              )}

              {/* ── Navegación entre steps ── */}
              {step < 3 && (
                <div
                  className={`mt-2 flex border-t border-[#E2E8F0] pt-6 ${
                    step > 1 ? 'justify-between' : 'justify-end'
                  }`}
                >
                  {step > 1 && (
                    <button
                      type="button"
                      onClick={() => setStep((step - 1) as Step)}
                      className="rounded-lg border border-[#CBD5E1] bg-[#E2E8F0] px-6 py-2.5 text-sm font-semibold text-[#0F172A] transition hover:bg-[#CBD5E1]"
                    >
                      Atrás
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={nextStep}
                    className="rounded-lg bg-[#2563EB] px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-[#1D4ED8]"
                  >
                    Continuar
                  </button>
                </div>
              )}
            </div>

            {/* Link a login */}
            <p className="mt-6 text-center text-sm text-[#475569]">
              ¿Ya tienes cuenta?{' '}
              <a href="/login" className="font-semibold text-[#2563EB] hover:text-[#1D4ED8]">
                Inicia sesión
              </a>
            </p>
          </div>
        </div>
      </div>
    </>
  )
}
