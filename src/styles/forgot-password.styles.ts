import { CSSProperties } from 'react';
import { colors } from './auth.styles';

// ─── Contenedor raíz ──────────────────────────────────────────────────────────
export const root: CSSProperties = {
  minHeight: '100vh',
  backgroundColor: colors.bgGeneral,
  display: 'flex',
  flexDirection: 'column',
  fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
};

// ─── Header ───────────────────────────────────────────────────────────────────
export const header: CSSProperties = {
  backgroundColor: colors.bgCard,
  borderBottom: `1px solid ${colors.borderSoft}`,
  padding: '16px 32px',
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
};

export const headerLogoBox: CSSProperties = {
  width: '36px',
  height: '36px',
  backgroundColor: colors.primary,
  borderRadius: '9px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
};

export const headerLogoText: CSSProperties = {
  color: colors.textPrimary,
  fontSize: '20px',
  fontWeight: 700,
  letterSpacing: '-0.3px',
};

// ─── Main centrado ────────────────────────────────────────────────────────────
export const main: CSSProperties = {
  flex: 1,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '40px 24px',
};

export const card: CSSProperties = {
  backgroundColor: colors.bgCard,
  border: `1px solid ${colors.borderSoft}`,
  borderRadius: '12px',
  padding: '40px',
  boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
  width: '100%',
  maxWidth: '440px',
};

// ─── Ícono decorativo ─────────────────────────────────────────────────────────
export const iconWrapper: CSSProperties = {
  width: '56px',
  height: '56px',
  backgroundColor: colors.primarySoft,
  borderRadius: '12px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  marginBottom: '24px',
};

export const iconWrapperSuccess: CSSProperties = {
  ...iconWrapper,
  backgroundColor: colors.successBg,
};

// ─── Textos ───────────────────────────────────────────────────────────────────
export const cardTitle: CSSProperties = {
  color: colors.textPrimary,
  fontSize: '24px',
  fontWeight: 700,
  letterSpacing: '-0.4px',
  margin: '0 0 8px',
};

export const cardSubtitle: CSSProperties = {
  color: colors.textSecondary,
  fontSize: '15px',
  lineHeight: 1.6,
  margin: '0 0 32px',
};

export const emailHighlight: CSSProperties = {
  color: colors.textPrimary,
  fontWeight: 600,
};

// ─── Back link ────────────────────────────────────────────────────────────────
export const backLink: CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '6px',
  color: colors.textSecondary,
  fontSize: '14px',
  fontWeight: 500,
  textDecoration: 'none',
  marginTop: '20px',
  transition: 'color 0.15s',
};

// ─── Resend link ──────────────────────────────────────────────────────────────
export const resendRow: CSSProperties = {
  textAlign: 'center',
  marginTop: '20px',
};

export const resendText: CSSProperties = {
  color: colors.textSecondary,
  fontSize: '14px',
};

export const resendBtn: CSSProperties = {
  background: 'none',
  border: 'none',
  color: colors.primary,
  fontSize: '14px',
  fontWeight: 600,
  cursor: 'pointer',
  padding: 0,
};

// ─── Indicador de pasos ───────────────────────────────────────────────────────
export const stepsIndicator: CSSProperties = {
  display: 'flex',
  gap: '6px',
  marginBottom: '32px',
};

export const stepDotActive: CSSProperties = {
  height: '4px',
  flex: 1,
  borderRadius: '2px',
  backgroundColor: colors.primary,
  transition: 'background-color 0.2s',
};

export const stepDotInactive: CSSProperties = {
  ...stepDotActive,
  backgroundColor: colors.borderSoft,
};

// ─── Password strength ────────────────────────────────────────────────────────
export const strengthRow: CSSProperties = {
  marginTop: '8px',
  display: 'flex',
  gap: '4px',
};

export const strengthLabel: CSSProperties = {
  fontSize: '12px',
  marginTop: '6px',
  fontWeight: 500,
};

export const getStrengthInfo = (len: number): { color: string; label: string } => {
  if (len === 0)  return { color: '#E2E8F0',                label: '' };
  if (len < 6)   return { color: colors.errorBorder,        label: 'Débil' };
  if (len < 10)  return { color: colors.warningBorder,      label: 'Media' };
  return              { color: colors.successBorder,        label: 'Fuerte' };
};

// ─── Toggle password btn ──────────────────────────────────────────────────────
export const togglePasswordBtn: CSSProperties = {
  position: 'absolute',
  right: '12px',
  top: '50%',
  transform: 'translateY(-50%)',
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  color: colors.textDisabled,
  padding: '4px',
  display: 'flex',
  alignItems: 'center',
};

// ─── Success check circle ─────────────────────────────────────────────────────
export const successCircle: CSSProperties = {
  width: '56px',
  height: '56px',
  backgroundColor: colors.successBg,
  border: `2px solid ${colors.successBorder}`,
  borderRadius: '50%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  marginBottom: '24px',
};
