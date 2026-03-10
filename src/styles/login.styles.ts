import { CSSProperties } from 'react';
import { colors } from './auth.styles';

// ─── Contenedor raíz ──────────────────────────────────────────────────────────
export const root: CSSProperties = {
  minHeight: '100vh',
  backgroundColor: colors.bgGeneral,
  display: 'flex',
};

// ─── Panel izquierdo (decorativo) ─────────────────────────────────────────────
export const leftPanel: CSSProperties = {
  flex: '0 0 45%',
  backgroundColor: colors.secondary,
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-between',
  padding: '48px',
  position: 'relative',
  overflow: 'hidden',
};

export const circleTopRight: CSSProperties = {
  position: 'absolute',
  top: '-80px',
  right: '-80px',
  width: '320px',
  height: '320px',
  borderRadius: '50%',
  backgroundColor: colors.primary,
  opacity: 0.12,
};

export const circleBottomLeft: CSSProperties = {
  position: 'absolute',
  bottom: '80px',
  left: '-60px',
  width: '240px',
  height: '240px',
  borderRadius: '50%',
  backgroundColor: colors.primary,
  opacity: 0.08,
};

export const circleBottomRight: CSSProperties = {
  position: 'absolute',
  bottom: '-40px',
  right: '20%',
  width: '160px',
  height: '160px',
  borderRadius: '50%',
  backgroundColor: colors.primarySoft,
  opacity: 0.07,
};

export const leftContent: CSSProperties = {
  position: 'relative',
  zIndex: 1,
};

export const leftEyebrow: CSSProperties = {
  color: colors.textDisabled,
  fontSize: '13px',
  fontWeight: 500,
  letterSpacing: '2px',
  textTransform: 'uppercase',
  marginBottom: '16px',
};

export const leftHeading: CSSProperties = {
  color: '#FFFFFF',
  fontSize: '36px',
  fontWeight: 700,
  lineHeight: 1.2,
  letterSpacing: '-0.5px',
  margin: '0 0 20px',
};

export const leftHeadingAccent: CSSProperties = {
  color: colors.primarySoft,
};

export const leftBody: CSSProperties = {
  color: colors.textDisabled,
  fontSize: '15px',
  lineHeight: 1.7,
  maxWidth: '340px',
  margin: 0,
};

export const statsRow: CSSProperties = {
  position: 'relative',
  zIndex: 1,
  display: 'flex',
  gap: '32px',
};

export const statNumber: CSSProperties = {
  color: '#FFFFFF',
  fontSize: '22px',
  fontWeight: 700,
};

export const statLabel: CSSProperties = {
  color: '#64748B',
  fontSize: '13px',
  marginTop: '2px',
};

// ─── Panel derecho (formulario) ───────────────────────────────────────────────
export const rightPanel: CSSProperties = {
  flex: 1,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '48px 32px',
};

export const formWrapper: CSSProperties = {
  width: '100%',
  maxWidth: '400px',
};

export const heading: CSSProperties = {
  color: colors.textPrimary,
  fontSize: '28px',
  fontWeight: 700,
  letterSpacing: '-0.4px',
  margin: '0 0 8px',
};

export const subheading: CSSProperties = {
  color: colors.textSecondary,
  fontSize: '15px',
  margin: '0 0 36px',
};

export const forgotLink: CSSProperties = {
  color: colors.primary,
  fontSize: '14px',
  fontWeight: 500,
  textDecoration: 'none',
};

export const forgotRow: CSSProperties = {
  textAlign: 'right',
  marginBottom: '28px',
};

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

export const bottomText: CSSProperties = {
  textAlign: 'center',
  color: colors.textSecondary,
  fontSize: '14px',
  margin: 0,
};

export const bottomLink: CSSProperties = {
  color: colors.primary,
  fontWeight: 600,
  textDecoration: 'none',
};

// ─── Responsive (clase CSS) ───────────────────────────────────────────────────
export const responsiveStyles = `
  @media (max-width: 768px) {
    .login-left-panel { display: none !important; }
  }
`;
