import { CSSProperties } from 'react'
import { colors } from './auth.styles'

// ─── Contenedor raíz ──────────────────────────────────────────────────────────
export const root: CSSProperties = {
  minHeight: '100vh',
  backgroundColor: colors.bgGeneral,
  display: 'flex',
  flexDirection: 'column',
}

// ─── Header ───────────────────────────────────────────────────────────────────
export const header: CSSProperties = {
  backgroundColor: colors.bgCard,
  borderBottom: `1px solid ${colors.borderSoft}`,
  padding: '16px 32px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
}

export const headerLogoBox: CSSProperties = {
  width: '36px',
  height: '36px',
  backgroundColor: colors.primary,
  borderRadius: '9px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
}

export const headerLogoText: CSSProperties = {
  color: colors.textPrimary,
  fontSize: '20px',
  fontWeight: 700,
  letterSpacing: '-0.3px',
}

export const headerLink: CSSProperties = {
  color: colors.textSecondary,
  fontSize: '14px',
  margin: 0,
}

export const headerLoginLink: CSSProperties = {
  color: colors.primary,
  fontWeight: 600,
  textDecoration: 'none',
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export const main: CSSProperties = {
  flex: 1,
  display: 'flex',
  justifyContent: 'center',
  padding: '40px 24px 60px',
}

export const mainInner: CSSProperties = {
  width: '100%',
  maxWidth: '560px',
}

export const pageTitle: CSSProperties = {
  color: colors.textPrimary,
  fontSize: '26px',
  fontWeight: 700,
  letterSpacing: '-0.4px',
  margin: '0 0 8px',
}

export const pageSubtitle: CSSProperties = {
  color: colors.textSecondary,
  fontSize: '15px',
  margin: 0,
}

export const titleWrapper: CSSProperties = {
  textAlign: 'center',
  marginBottom: '32px',
}

// ─── Stepper ──────────────────────────────────────────────────────────────────
export const stepperRow: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  marginBottom: '36px',
}

export const stepCircleActive: CSSProperties = {
  width: '36px',
  height: '36px',
  borderRadius: '50%',
  backgroundColor: colors.primary,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  transition: 'all 0.2s',
}

export const stepCircleInactive: CSSProperties = {
  ...stepCircleActive,
  backgroundColor: colors.borderSoft,
}

export const stepLabelActive: CSSProperties = {
  fontSize: '12px',
  fontWeight: 600,
  color: colors.textPrimary,
  whiteSpace: 'nowrap',
}

export const stepLabelInactive: CSSProperties = {
  ...stepLabelActive,
  fontWeight: 400,
  color: colors.textDisabled,
}

export const stepConnectorActive: CSSProperties = {
  width: '80px',
  height: '2px',
  backgroundColor: colors.primary,
  margin: '0 8px',
  marginBottom: '22px',
  transition: 'background-color 0.2s',
}

export const stepConnectorInactive: CSSProperties = {
  ...stepConnectorActive,
  backgroundColor: colors.borderSoft,
}

// ─── Card ─────────────────────────────────────────────────────────────────────
export const card: CSSProperties = {
  backgroundColor: colors.bgCard,
  border: `1px solid ${colors.borderSoft}`,
  borderRadius: '12px',
  padding: '32px',
  boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
}

export const cardTitle: CSSProperties = {
  color: colors.textPrimary,
  fontSize: '18px',
  fontWeight: 700,
  margin: '0 0 24px',
}

export const cardSubtitle: CSSProperties = {
  color: colors.textSecondary,
  fontSize: '14px',
  margin: '0 0 20px',
}

// ─── Grid dos columnas ────────────────────────────────────────────────────────
export const gridTwoCols: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  gap: '0 16px',
}

// ─── Indicador fuerza contraseña ──────────────────────────────────────────────
export const strengthRow: CSSProperties = {
  marginTop: '8px',
  display: 'flex',
  gap: '4px',
}

export const getStrengthBarColor = (len: number): string => {
  if (len < 6) return colors.errorBorder
  if (len < 10) return colors.warningBorder
  return colors.successBorder
}

// ─── Chips de preferencias ────────────────────────────────────────────────────
export const chipsWrapper: CSSProperties = {
  display: 'flex',
  flexWrap: 'wrap',
  gap: '8px',
  marginBottom: '24px',
}

export const chipSelected: CSSProperties = {
  padding: '7px 14px',
  borderRadius: '20px',
  border: `1px solid ${colors.primary}`,
  backgroundColor: colors.primarySoft,
  color: colors.infoText,
  fontSize: '13px',
  fontWeight: 600,
  cursor: 'pointer',
  transition: 'all 0.15s',
}

export const chipDefault: CSSProperties = {
  ...chipSelected,
  border: `1px solid ${colors.borderSoft}`,
  backgroundColor: colors.bgCard,
  color: colors.textSecondary,
  fontWeight: 400,
}

// ─── Sección legal (checkboxes) ───────────────────────────────────────────────
export const legalBox: CSSProperties = {
  backgroundColor: colors.bgGeneral,
  border: `1px solid ${colors.borderSoft}`,
  borderRadius: '10px',
  padding: '20px',
  marginBottom: '24px',
  display: 'flex',
  flexDirection: 'column',
  gap: '14px',
}

export const checkboxActive: CSSProperties = {
  width: '18px',
  height: '18px',
  minWidth: '18px',
  borderRadius: '4px',
  border: `2px solid ${colors.primary}`,
  backgroundColor: colors.primary,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  marginTop: '1px',
  cursor: 'pointer',
  transition: 'all 0.15s',
}

export const checkboxInactive: CSSProperties = {
  ...checkboxActive,
  border: `2px solid ${colors.borderStrong}`,
  backgroundColor: colors.bgCard,
}

export const checkboxError: CSSProperties = {
  ...checkboxInactive,
  border: `2px solid ${colors.errorBorder}`,
}

export const checkboxLabel: CSSProperties = {
  color: colors.textSecondary,
  fontSize: '14px',
  lineHeight: 1.5,
}

// ─── Navegación entre steps ───────────────────────────────────────────────────
export const navRow = (showBack: boolean): CSSProperties => ({
  display: 'flex',
  justifyContent: showBack ? 'space-between' : 'flex-end',
  marginTop: '8px',
  paddingTop: '24px',
  borderTop: `1px solid ${colors.borderSoft}`,
})

// ─── Pie de página ────────────────────────────────────────────────────────────
export const footerText: CSSProperties = {
  textAlign: 'center',
  color: colors.textDisabled,
  fontSize: '13px',
  marginTop: '24px',
}

export const footerLink: CSSProperties = {
  color: colors.primary,
  textDecoration: 'none',
}
