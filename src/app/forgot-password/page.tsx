'use client'

import { useState } from 'react'
import * as S from '@/styles/forgot-password.styles'
import {
  btnPrimary,
  btnPrimaryDisabled,
  label,
  field,
  getInputStyle,
  inputFocusOn,
  inputFocusOff,
  fieldErrorText,
  alertError,
  alertErrorText,
  globalStyles,
  colors,
} from '@/styles/auth.styles'

// ─── Tipos ────────────────────────────────────────────────────────────────────
type Step = 'email' | 'confirmation' | 'new-password' | 'done'

// ─── Iconos ───────────────────────────────────────────────────────────────────
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

const LockIcon = ({ color = colors.primary }: { color?: string }) => (
  <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
    <rect x="3" y="11" width="18" height="11" rx="2" stroke={color} strokeWidth="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" stroke={color} strokeWidth="2" strokeLinecap="round" />
  </svg>
)

const MailIcon = () => (
  <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
    <path
      d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"
      stroke={colors.primary}
      strokeWidth="2"
      strokeLinecap="round"
    />
    <polyline
      points="22,6 12,13 2,6"
      stroke={colors.primary}
      strokeWidth="2"
      strokeLinecap="round"
    />
  </svg>
)

const CheckIcon = ({ size = 28 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <polyline
      points="20 6 9 17 4 12"
      stroke={colors.successText}
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
)

const ArrowLeftIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
    <polyline
      points="15 18 9 12 15 6"
      stroke="currentColor"
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

const ErrorAlertIcon = () => (
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

// ─── Indicador de pasos (3 dots) ──────────────────────────────────────────────
const STEP_ORDER: Step[] = ['email', 'confirmation', 'new-password']

const StepsIndicator = ({ current }: { current: Step }) => {
  const idx = STEP_ORDER.indexOf(current)
  return (
    <div style={S.stepsIndicator}>
      {STEP_ORDER.map((_, i) => (
        <div key={i} style={i <= idx ? S.stepDotActive : S.stepDotInactive} />
      ))}
    </div>
  )
}

// ─── PASO 1: Ingresar correo ──────────────────────────────────────────────────
function StepEmail({ onNext }: { onNext: (email: string) => void }) {
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!email.trim() || !/\S+@\S+\.\S+/.test(email)) {
      setError('Ingresa un correo electrónico válido.')
      return
    }
    setLoading(true)
    // TODO: llamar a auth.service.ts → forgotPassword(email)
    setTimeout(() => {
      setLoading(false)
      onNext(email)
    }, 1200)
  }

  return (
    <>
      <StepsIndicator current="email" />

      <div style={S.iconWrapper}>
        <MailIcon />
      </div>

      <h1 style={S.cardTitle}>¿Olvidaste tu contraseña?</h1>
      <p style={S.cardSubtitle}>
        Ingresa el correo de tu cuenta y te enviaremos un enlace para restablecerla.
      </p>

      {error && (
        <div style={alertError}>
          <ErrorAlertIcon />
          <span style={alertErrorText}>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div style={field}>
          <label style={label}>Correo electrónico</label>
          <input
            type="email"
            value={email}
            onChange={e => {
              setEmail(e.target.value)
              setError('')
            }}
            placeholder="tucorreo@ejemplo.com"
            style={getInputStyle(!!error)}
            onFocus={e => inputFocusOn(e, !!error)}
            onBlur={e => inputFocusOff(e, !!error)}
          />
          {error && <p style={fieldErrorText}>{error}</p>}
        </div>

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
          {loading ? 'Enviando...' : 'Enviar enlace de recuperación'}
        </button>
      </form>

      <div style={{ textAlign: 'center' }}>
        <a href="/login" style={S.backLink}>
          <ArrowLeftIcon />
          Volver al inicio de sesión
        </a>
      </div>
    </>
  )
}

// ─── PASO 2: Confirmación de envío ────────────────────────────────────────────
function StepConfirmation({ email, onNext }: { email: string; onNext: () => void }) {
  const [resent, setResent] = useState(false)
  const [countdown, setCountdown] = useState(0)

  const handleResend = () => {
    setResent(true)
    setCountdown(30)
    // TODO: llamar a auth.service.ts → resendEmail(email)
    const interval = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(interval)
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }

  return (
    <>
      <StepsIndicator current="confirmation" />

      <div style={S.successCircle}>
        <CheckIcon />
      </div>

      <h1 style={S.cardTitle}>Revisa tu correo</h1>
      <p style={S.cardSubtitle}>
        Enviamos un enlace de recuperación a <span style={S.emailHighlight}>{email}</span>. El
        enlace expira en 15 minutos.
      </p>

      {/* Info box */}
      <div
        style={{
          backgroundColor: colors.infoBg,
          border: `1px solid ${colors.infoBorder}`,
          borderRadius: '8px',
          padding: '14px 16px',
          marginBottom: '28px',
          display: 'flex',
          gap: '10px',
          alignItems: 'flex-start',
        }}
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          style={{ marginTop: '2px', flexShrink: 0 }}
        >
          <circle cx="12" cy="12" r="10" stroke={colors.infoText} strokeWidth="2" />
          <line
            x1="12"
            y1="8"
            x2="12"
            y2="8"
            stroke={colors.infoText}
            strokeWidth="2"
            strokeLinecap="round"
          />
          <line
            x1="12"
            y1="12"
            x2="12"
            y2="16"
            stroke={colors.infoText}
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
        <p style={{ color: colors.infoText, fontSize: '13px', margin: 0, lineHeight: 1.5 }}>
          Si no ves el correo, revisa tu carpeta de spam o correo no deseado.
        </p>
      </div>

      {/* Botón continuar (simula que ya hicieron clic en el enlace) */}
      <button
        style={btnPrimary}
        onClick={onNext}
        onMouseEnter={e => ((e.target as HTMLButtonElement).style.backgroundColor = '#1D4ED8')}
        onMouseLeave={e => ((e.target as HTMLButtonElement).style.backgroundColor = '#2563EB')}
      >
        Ya tengo el enlace, continuar
      </button>

      {/* Reenviar */}
      <div style={S.resendRow}>
        {resent && countdown > 0 ? (
          <p style={S.resendText}>
            Correo reenviado. Puedes intentarlo de nuevo en{' '}
            <strong style={{ color: colors.textPrimary }}>{countdown}s</strong>
          </p>
        ) : (
          <p style={S.resendText}>
            ¿No te llegó?{' '}
            <button style={S.resendBtn} onClick={handleResend}>
              Reenviar correo
            </button>
          </p>
        )}
      </div>

      <div style={{ textAlign: 'center' }}>
        <a href="/login" style={S.backLink}>
          <ArrowLeftIcon />
          Volver al inicio de sesión
        </a>
      </div>
    </>
  )
}

// ─── PASO 3: Nueva contraseña ─────────────────────────────────────────────────
function StepNewPassword({ onDone }: { onDone: () => void }) {
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<{ password?: string; confirm?: string }>({})

  const strength = S.getStrengthInfo(password.length)

  const validate = () => {
    const e: typeof errors = {}
    if (password.length < 8) e.password = 'Mínimo 8 caracteres'
    if (password !== confirm) e.confirm = 'Las contraseñas no coinciden'
    if (!confirm.trim()) e.confirm = 'Campo requerido'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return
    setLoading(true)
    // TODO: llamar a auth.service.ts → resetPassword(token, password)
    setTimeout(() => {
      setLoading(false)
      onDone()
    }, 1200)
  }

  return (
    <>
      <StepsIndicator current="new-password" />

      <div style={S.iconWrapper}>
        <LockIcon />
      </div>

      <h1 style={S.cardTitle}>Nueva contraseña</h1>
      <p style={S.cardSubtitle}>Crea una contraseña segura. Debe tener al menos 8 caracteres.</p>

      <form onSubmit={handleSubmit}>
        {/* Nueva contraseña */}
        <div style={field}>
          <label style={label}>Nueva contraseña</label>
          <div style={{ position: 'relative' }}>
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={e => {
                setPassword(e.target.value)
                setErrors(p => ({ ...p, password: '' }))
              }}
              placeholder="Mínimo 8 caracteres"
              style={{ ...getInputStyle(!!errors.password), paddingRight: '44px' }}
              onFocus={e => inputFocusOn(e, !!errors.password)}
              onBlur={e => inputFocusOff(e, !!errors.password)}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              style={S.togglePasswordBtn}
            >
              {showPassword ? <EyeOffIcon /> : <EyeIcon />}
            </button>
          </div>

          {/* Barra de fuerza */}
          {password.length > 0 && (
            <>
              <div style={S.strengthRow}>
                {[1, 2, 3, 4].map(i => (
                  <div
                    key={i}
                    style={{
                      flex: 1,
                      height: '3px',
                      borderRadius: '2px',
                      transition: 'background-color 0.2s',
                      backgroundColor: password.length >= i * 2 ? strength.color : '#E2E8F0',
                    }}
                  />
                ))}
              </div>
              {strength.label && (
                <p style={{ ...S.strengthLabel, color: strength.color }}>{strength.label}</p>
              )}
            </>
          )}
          {errors.password && <p style={fieldErrorText}>{errors.password}</p>}
        </div>

        {/* Confirmar contraseña */}
        <div style={field}>
          <label style={label}>Confirmar contraseña</label>
          <div style={{ position: 'relative' }}>
            <input
              type={showConfirm ? 'text' : 'password'}
              value={confirm}
              onChange={e => {
                setConfirm(e.target.value)
                setErrors(p => ({ ...p, confirm: '' }))
              }}
              placeholder="Repite tu contraseña"
              style={{ ...getInputStyle(!!errors.confirm), paddingRight: '44px' }}
              onFocus={e => inputFocusOn(e, !!errors.confirm)}
              onBlur={e => inputFocusOff(e, !!errors.confirm)}
            />
            <button
              type="button"
              onClick={() => setShowConfirm(!showConfirm)}
              style={S.togglePasswordBtn}
            >
              {showConfirm ? <EyeOffIcon /> : <EyeIcon />}
            </button>
          </div>

          {/* Indicador de coincidencia */}
          {confirm.length > 0 && (
            <p
              style={{
                fontSize: '12px',
                marginTop: '5px',
                color: password === confirm ? colors.successText : colors.errorText,
                fontWeight: 500,
              }}
            >
              {password === confirm
                ? '✓ Las contraseñas coinciden'
                : '✗ Las contraseñas no coinciden'}
            </p>
          )}
          {errors.confirm && <p style={fieldErrorText}>{errors.confirm}</p>}
        </div>

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
          {loading ? 'Guardando...' : 'Guardar nueva contraseña'}
        </button>
      </form>
    </>
  )
}

// ─── PASO 4: Éxito ────────────────────────────────────────────────────────────
function StepDone() {
  return (
    <>
      <div style={{ textAlign: 'center' }}>
        <div style={{ ...S.successCircle, margin: '0 auto 24px' }}>
          <CheckIcon size={28} />
        </div>

        <h1 style={{ ...S.cardTitle, textAlign: 'center' }}>¡Contraseña actualizada!</h1>
        <p style={{ ...S.cardSubtitle, textAlign: 'center' }}>
          Tu contraseña fue cambiada exitosamente. Ya puedes iniciar sesión con tu nueva contraseña.
        </p>

        <a
          href="/login"
          style={{
            ...btnPrimary,
            display: 'flex',
            textDecoration: 'none',
            justifyContent: 'center',
          }}
          onMouseEnter={e =>
            ((e.currentTarget as HTMLAnchorElement).style.backgroundColor = '#1D4ED8')
          }
          onMouseLeave={e =>
            ((e.currentTarget as HTMLAnchorElement).style.backgroundColor = '#2563EB')
          }
        >
          Ir al inicio de sesión
        </a>
      </div>
    </>
  )
}

// ─── Componente principal ─────────────────────────────────────────────────────
export default function ForgotPasswordPage() {
  const [step, setStep] = useState<Step>('email')
  const [email, setEmail] = useState('')

  return (
    <div style={S.root}>
      {/* Header */}
      <header style={S.header}>
        <div style={S.headerLogoBox}>
          <BookIcon />
        </div>
        <span style={S.headerLogoText}>NovaLibros</span>
      </header>

      {/* Main */}
      <main style={S.main}>
        <div style={S.card}>
          {step === 'email' && (
            <StepEmail
              onNext={e => {
                setEmail(e)
                setStep('confirmation')
              }}
            />
          )}
          {step === 'confirmation' && (
            <StepConfirmation email={email} onNext={() => setStep('new-password')} />
          )}
          {step === 'new-password' && <StepNewPassword onDone={() => setStep('done')} />}
          {step === 'done' && <StepDone />}
        </div>
      </main>

      <style>{globalStyles}</style>
    </div>
  )
}
