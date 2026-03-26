'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/auth.context'
import * as S from '@/styles/login.styles'
import {
  btnPrimary,
  btnPrimaryDisabled,
  alertError,
  alertErrorText,
  dividerRow,
  dividerLine,
  dividerText,
  label,
  field,
  getInputStyle,
  inputFocusOn,
  inputFocusOff,
  globalStyles,
  logoBox,
  logoRow,
  logoText,
} from '@/styles/auth.styles'

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
      console.error('Login error', err)
      setError('Credenciales incorrectas o el servidor no está disponible.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ ...S.root, fontFamily: "'DM Sans', 'Segoe UI', sans-serif" }}>
      {/* ── Panel izquierdo ── */}
      <div style={S.leftPanel} className="login-left-panel">
        <div style={S.circleTopRight} />
        <div style={S.circleBottomLeft} />
        <div style={S.circleBottomRight} />

        {/* Logo */}
        <div style={{ ...logoRow, position: 'relative', zIndex: 1 }}>
          <div style={logoBox}>
            <BookIcon />
          </div>
          <span style={logoText}>NovaLibros</span>
        </div>

        {/* Hero text */}
        <div style={S.leftContent}>
          <p style={S.leftEyebrow}>Tu librería en línea</p>
          <h2 style={S.leftHeading}>
            Descubre tu próxima
            <br />
            <span style={S.leftHeadingAccent}>gran lectura</span>
          </h2>
          <p style={S.leftBody}>
            Accede a miles de títulos, gestiona tus reservas y compras, todo desde un solo lugar.
          </p>
        </div>

        {/* Stats */}
        <div style={S.statsRow}>
          {STATS.map(stat => (
            <div key={stat.label}>
              <div style={S.statNumber}>{stat.num}</div>
              <div style={S.statLabel}>{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Panel derecho ── */}
      <div style={S.rightPanel}>
        <div style={S.formWrapper}>
          <h1 style={S.heading}>Bienvenido de vuelta</h1>
          <p style={S.subheading}>Ingresa tus credenciales para continuar</p>

          {error && (
            <div style={alertError}>
              <ErrorIcon />
              <span style={alertErrorText}>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Email */}
            <div style={field}>
              <label style={label}>Correo electrónico</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="tucorreo@ejemplo.com"
                style={getInputStyle(false)}
                onFocus={e => inputFocusOn(e, false)}
                onBlur={e => inputFocusOff(e, false)}
              />
            </div>

            {/* Contraseña */}
            <div style={field}>
              <label style={label}>Contraseña</label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  style={{ ...getInputStyle(false), paddingRight: '44px' }}
                  onFocus={e => inputFocusOn(e, false)}
                  onBlur={e => inputFocusOff(e, false)}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={S.togglePasswordBtn}
                >
                  {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              </div>
            </div>

            {/* Olvidé contraseña */}
            <div style={S.forgotRow}>
              <a href="/forgot-password" style={S.forgotLink}>
                ¿Olvidaste tu contraseña?
              </a>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              style={loading ? btnPrimaryDisabled : btnPrimary}
              onMouseEnter={e => {
                if (!loading) (e.target as HTMLButtonElement).style.backgroundColor = '#1D4ED8'
              }}
              onMouseLeave={e => {
                if (!loading) (e.target as HTMLButtonElement).style.backgroundColor = '#2563EB'
              }}
            >
              {loading ? 'Ingresando...' : 'Iniciar sesión'}
            </button>
          </form>

          {/* Divider */}
          <div style={dividerRow}>
            <div style={dividerLine} />
            <span style={dividerText}>o</span>
            <div style={dividerLine} />
          </div>

          {/* Registro */}
          <p style={S.bottomText}>
            ¿No tienes cuenta?{' '}
            <a href="/register" style={S.bottomLink}>
              Regístrate gratis
            </a>
          </p>
        </div>
      </div>

      <style>{globalStyles + S.responsiveStyles}</style>
    </div>
  )
}
