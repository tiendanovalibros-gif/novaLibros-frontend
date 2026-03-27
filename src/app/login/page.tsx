'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/auth.context'
import { globalStyles } from '@/styles/auth.styles'
import Iconify from '@/components/iconify'

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

const STATS = [
  { num: '+5.000', label: 'Títulos' },
  { num: '+800', label: 'Autores' },
  { num: '24h', label: 'Reservas' },
]

export default function LoginPage() {
  const router = useRouter()
  const { login } = useAuth()
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!email || !password) {
      setError('Por favor completa todos los campos.')
      return
    }

    setLoading(true)
    try {
      await login({ correo: email, contrasena: password })
      router.push('/')
    } catch (err) {
      let message = 'Error al iniciar sesión'
      if (err && typeof err === 'object' && 'message' in err) {
        const maybeMessage = (err as { message?: unknown }).message
        if (typeof maybeMessage === 'string') {
          message = maybeMessage
        }
      }
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  return (
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
            Descubre tu próxima
            <br />
            <span className="text-[#DBEAFE]">gran lectura</span>
          </h2>
          <p className="max-w-[340px] text-[15px] leading-relaxed text-[#CBD5F5]">
            Accede a miles de títulos, gestiona tus reservas y compras, todo desde un solo lugar.
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
      <div className="flex flex-1 items-center justify-center px-8 py-12">
        <div className="w-full max-w-md rounded-[28px] bg-white px-9 py-10 shadow-[0_18px_45px_rgba(15,23,42,0.12)]">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-[#0F172A]">NovaLibros</h1>
            <p className="mt-2 text-[15px] text-[#475569]">Bienvenido de vuelta</p>
          </div>

          {error && (
            <div className="mt-6 mb-5 flex items-center gap-2 rounded-lg border border-[#EF4444] bg-[#FEE2E2] px-4 py-3 text-sm text-[#991B1B]">
              <ErrorIcon />
              <span>{error}</span>
            </div>
          )}

          <form className="mt-6 space-y-5" onSubmit={handleSubmit}>
            {/* Email */}
            <div>
              <label className="mb-2 block text-sm font-semibold text-[#0F172A]">
                Correo electrónico
              </label>
              <div className="relative">
                <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-[#94A3B8]">
                  <Iconify icon="mdi:email-outline" width={20} aria-hidden="true" />
                </span>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="tucorreo@ejemplo.com"
                  className="w-full rounded-lg border border-[#CBD5E1] bg-white py-3 pl-11 pr-3.5 text-[15px] text-[#0F172A] outline-none transition focus:border-[#2563EB]"
                />
              </div>
            </div>

            {/* Contraseña */}
            <div>
              <label className="mb-2 block text-sm font-semibold text-[#0F172A]">Contraseña</label>
              <div className="relative">
                <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-[#94A3B8]">
                  <Iconify icon="mdi:lock-outline" width={20} aria-hidden="true" />
                </span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-lg border border-[#CBD5E1] bg-white py-3 pl-11 pr-11 text-[15px] text-[#0F172A] outline-none transition focus:border-[#2563EB]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-3 flex items-center text-[#94A3B8]"
                  aria-label="Mostrar u ocultar contraseña"
                >
                  {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              </div>
            </div>

            {/* Olvidé contraseña */}
            <div className="text-right">
              <a
                href="/forgot-password"
                className="text-[14px] font-medium text-[#2563EB] hover:text-[#1D4ED8]"
              >
                ¿Olvidaste tu contraseña?
              </a>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-[#2563EB] px-4 py-3 text-[15px] font-semibold text-white transition hover:bg-[#1D4ED8] disabled:cursor-not-allowed disabled:bg-[#93C5FD]"
            >
              {loading ? 'Ingresando...' : 'Iniciar sesión'}
            </button>
          </form>

          {/* Divider */}
          <div className="my-7 flex items-center gap-4">
            <div className="h-px flex-1 bg-[#E2E8F0]" />
            <span className="text-sm text-[#94A3B8]">o</span>
            <div className="h-px flex-1 bg-[#E2E8F0]" />
          </div>

          {/* Registro */}
          <p className="text-center text-sm text-[#475569]">
            ¿No tienes cuenta?{' '}
            <a href="/register" className="font-semibold text-[#2563EB] hover:text-[#1D4ED8]">
              Regístrate gratis
            </a>
          </p>
        </div>
      </div>

      <style>{globalStyles}</style>
    </div>
  )
}
