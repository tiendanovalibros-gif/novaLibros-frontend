import { CSSProperties } from 'react'

// ─── Colores base ────────────────────────────────────────────────────────────
export const colors = {
  primary: '#2563EB',
  primaryHover: '#1D4ED8',
  primaryActive: '#1E40AF',
  primarySoft: '#DBEAFE',

  secondary: '#334155',
  secondaryHover: '#1E293B',
  secondarySoft: '#F1F5F9',

  bgGeneral: '#F8FAFC',
  bgCard: '#FFFFFF',

  textPrimary: '#0F172A',
  textSecondary: '#475569',
  textDisabled: '#94A3B8',

  borderSoft: '#E2E8F0',
  borderStrong: '#CBD5E1',

  errorBg: '#FEE2E2',
  errorText: '#991B1B',
  errorBorder: '#EF4444',

  successBg: '#DCFCE7',
  successText: '#166534',
  successBorder: '#22C55E',

  warningBg: '#FEF9C3',
  warningText: '#854D0E',
  warningBorder: '#FACC15',

  infoBg: '#DBEAFE',
  infoText: '#1E3A8A',
  infoBorder: '#3B82F6',
}

// ─── Tipografía ───────────────────────────────────────────────────────────────
export const fontFamily = "'DM Sans', 'Segoe UI', sans-serif"

// ─── Inputs ───────────────────────────────────────────────────────────────────
export const inputBase: CSSProperties = {
  width: '100%',
  padding: '11px 14px',
  backgroundColor: colors.bgCard,
  border: `1px solid ${colors.borderStrong}`,
  borderRadius: '8px',
  fontSize: '15px',
  color: colors.textPrimary,
  outline: 'none',
  boxSizing: 'border-box',
  transition: 'border-color 0.15s',
}

export const inputError: CSSProperties = {
  ...inputBase,
  borderColor: colors.errorBorder,
  backgroundColor: colors.errorBg,
}

export const getInputStyle = (hasError: boolean): CSSProperties =>
  hasError ? inputError : inputBase

export const inputFocusOn = (
  e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>,
  hasError: boolean
) => {
  if (!hasError) e.target.style.borderColor = colors.primary
}
export const inputFocusOff = (
  e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>,
  hasError: boolean
) => {
  if (!hasError) e.target.style.borderColor = colors.borderStrong
}

// ─── Labels ───────────────────────────────────────────────────────────────────
export const label: CSSProperties = {
  display: 'block',
  color: colors.textPrimary,
  fontSize: '14px',
  fontWeight: 600,
  marginBottom: '7px',
}

// ─── Field wrapper ────────────────────────────────────────────────────────────
export const field: CSSProperties = {
  marginBottom: '18px',
}

// ─── Botones ──────────────────────────────────────────────────────────────────
export const btnPrimary: CSSProperties = {
  width: '100%',
  padding: '13px',
  backgroundColor: colors.primary,
  color: '#FFFFFF',
  border: 'none',
  borderRadius: '8px',
  fontSize: '15px',
  fontWeight: 600,
  cursor: 'pointer',
  transition: 'background-color 0.15s',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '8px',
}

export const btnPrimaryDisabled: CSSProperties = {
  ...btnPrimary,
  backgroundColor: '#93C5FD',
  cursor: 'not-allowed',
}

export const btnSecondary: CSSProperties = {
  padding: '11px 24px',
  backgroundColor: colors.borderSoft,
  color: colors.textPrimary,
  border: 'none',
  borderRadius: '8px',
  fontSize: '15px',
  fontWeight: 600,
  cursor: 'pointer',
  transition: 'background-color 0.15s',
}

// ─── Alerta de error ──────────────────────────────────────────────────────────
export const alertError: CSSProperties = {
  backgroundColor: colors.errorBg,
  border: `1px solid ${colors.errorBorder}`,
  borderRadius: '8px',
  padding: '12px 16px',
  marginBottom: '20px',
  display: 'flex',
  alignItems: 'center',
  gap: '10px',
}

export const alertErrorText: CSSProperties = {
  color: colors.errorText,
  fontSize: '14px',
}

// ─── Texto de error bajo un campo ─────────────────────────────────────────────
export const fieldErrorText: CSSProperties = {
  color: colors.errorText,
  fontSize: '12px',
  marginTop: '5px',
  marginBottom: 0,
}

// ─── Divider ──────────────────────────────────────────────────────────────────
export const dividerRow: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '16px',
  margin: '28px 0',
}

export const dividerLine: CSSProperties = {
  flex: 1,
  height: '1px',
  backgroundColor: colors.borderSoft,
}

export const dividerText: CSSProperties = {
  color: colors.textDisabled,
  fontSize: '13px',
}

// ─── Logo ─────────────────────────────────────────────────────────────────────
export const logoBox: CSSProperties = {
  width: '40px',
  height: '40px',
  backgroundColor: colors.primary,
  borderRadius: '10px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
}

export const logoText: CSSProperties = {
  color: '#FFFFFF',
  fontSize: '22px',
  fontWeight: 700,
  letterSpacing: '-0.3px',
}

export const logoRow: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
}

// ─── Google Fonts import ──────────────────────────────────────────────────────
export const globalStyles = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap');
  @keyframes spin { to { transform: rotate(360deg); } }
  @media (max-width: 640px) { input, select { font-size: 16px !important; } }
`

// ─── Alerta de éxito ──────────────────────────────────────────────────────────
export const alertSuccess: CSSProperties = {
  backgroundColor: colors.successBg,
  border: `1px solid ${colors.successBorder}`,
  borderRadius: '8px',
  padding: '12px 16px',
  marginBottom: '20px',
  display: 'flex',
  alignItems: 'center',
  gap: '10px',
}

export const alertSuccessText: CSSProperties = {
  color: colors.successText,
  fontSize: '14px',
}
