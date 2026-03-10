'use client';

import { useState } from 'react';
import * as S from '@/styles/register.styles';
import { btnPrimary, btnPrimaryDisabled, btnSecondary, alertError, alertErrorText,
         label, field, getInputStyle, inputFocusOn, inputFocusOff,
         fieldErrorText, globalStyles } from '@/styles/auth.styles';

// ─── Iconos ───────────────────────────────────────────────────────────────────
const BookIcon = ({ size = 20 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const CheckIcon = () => (
  <svg width="10" height="10" viewBox="0 0 24 24" fill="none">
    <polyline points="20 6 9 17 4 12" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const EyeIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2"/>
  </svg>
);

const EyeOffIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    <line x1="1" y1="1" x2="23" y2="23" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

const ErrorIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="12" r="10" stroke="#991B1B" strokeWidth="2"/>
    <line x1="12" y1="8" x2="12" y2="12" stroke="#991B1B" strokeWidth="2" strokeLinecap="round"/>
    <line x1="12" y1="16" x2="12.01" y2="16" stroke="#991B1B" strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

// ─── Constantes ───────────────────────────────────────────────────────────────
const GENEROS_LITERARIOS = [
  'Ficción', 'No ficción', 'Ciencia ficción', 'Fantasy', 'Romance',
  'Thriller', 'Terror', 'Historia', 'Biografía', 'Autoayuda',
  'Ciencia', 'Filosofía', 'Poesía', 'Infantil', 'Juvenil',
];

const STEPS = [
  { num: 1, label: 'Datos personales' },
  { num: 2, label: 'Cuenta' },
  { num: 3, label: 'Preferencias' },
];

// ─── Tipos ────────────────────────────────────────────────────────────────────
type Step = 1 | 2 | 3;

interface FormData {
  nombre: string; apellido: string; dni: string;
  fechaNacimiento: string; lugarNacimiento: string; genero: string;
  correo: string; usuario: string; contrasena: string; confirmarContrasena: string;
  direccion: string; telefono: string;
  preferencias: string[];
  aceptaTerminos: boolean; aceptaDatos: boolean;
}

type FormErrors = Partial<Record<keyof FormData | 'general', string>>;

const INITIAL_FORM: FormData = {
  nombre: '', apellido: '', dni: '', fechaNacimiento: '', lugarNacimiento: '', genero: '',
  correo: '', usuario: '', contrasena: '', confirmarContrasena: '', direccion: '', telefono: '',
  preferencias: [], aceptaTerminos: false, aceptaDatos: false,
};

// ─── Componente ───────────────────────────────────────────────────────────────
export default function RegisterPage() {
  const [step, setStep]               = useState<Step>(1);
  const [loading, setLoading]         = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors]           = useState<FormErrors>({});
  const [form, setForm]               = useState<FormData>(INITIAL_FORM);

  const set = (field: keyof FormData, value: string | boolean | string[]) => {
    setForm(prev => ({ ...prev, [field]: value }));
    setErrors(prev => ({ ...prev, [field]: '' }));
  };

  const togglePreferencia = (pref: string) => {
    const next = form.preferencias.includes(pref)
      ? form.preferencias.filter(p => p !== pref)
      : [...form.preferencias, pref];
    set('preferencias', next);
  };

  // ── Validaciones por step ──
  const validateStep1 = (): boolean => {
    const e: FormErrors = {};
    if (!form.nombre.trim())          e.nombre          = 'Campo requerido';
    if (!form.apellido.trim())        e.apellido        = 'Campo requerido';
    if (!form.dni.trim())             e.dni             = 'Campo requerido';
    if (!form.fechaNacimiento)        e.fechaNacimiento = 'Campo requerido';
    if (!form.lugarNacimiento.trim()) e.lugarNacimiento = 'Campo requerido';
    if (!form.genero)                 e.genero          = 'Selecciona un género';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const validateStep2 = (): boolean => {
    const e: FormErrors = {};
    if (!form.correo.trim() || !/\S+@\S+\.\S+/.test(form.correo)) e.correo = 'Correo inválido';
    if (!form.usuario.trim())                e.usuario             = 'Campo requerido';
    if (form.contrasena.length < 8)          e.contrasena          = 'Mínimo 8 caracteres';
    if (form.contrasena !== form.confirmarContrasena) e.confirmarContrasena = 'Las contraseñas no coinciden';
    if (!form.direccion.trim())              e.direccion           = 'Campo requerido';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const validateStep3 = (): boolean => {
    const e: FormErrors = {};
    if (form.preferencias.length === 0) e.general       = 'Selecciona al menos una preferencia';
    if (!form.aceptaTerminos)           e.aceptaTerminos = 'Debes aceptar los términos y condiciones';
    if (!form.aceptaDatos)              e.aceptaDatos   = 'Debes aceptar la política de datos';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const nextStep = () => {
    if (step === 1 && validateStep1()) setStep(2);
    if (step === 2 && validateStep2()) setStep(3);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep3()) return;
    setLoading(true);
    // TODO: conectar con auth.service.ts
    setTimeout(() => setLoading(false), 1500);
  };

  const err = (f: keyof FormData) =>
    errors[f] ? <p style={fieldErrorText}>{errors[f]}</p> : null;

  // ── Sub-componente: Checkbox ──
  const Checkbox = ({ field: f, label: lbl }: { field: 'aceptaTerminos' | 'aceptaDatos'; label: string }) => {
    const checked = form[f] as boolean;
    const boxStyle = errors[f] ? S.checkboxError : checked ? S.checkboxActive : S.checkboxInactive;
    return (
      <div>
        <label style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', cursor: 'pointer' }}>
          <div onClick={() => set(f, !checked)} style={boxStyle}>
            {checked && <CheckIcon />}
          </div>
          <span style={S.checkboxLabel}>{lbl}</span>
        </label>
        {errors[f] && (
          <p style={{ ...fieldErrorText, marginLeft: '30px' }}>{errors[f]}</p>
        )}
      </div>
    );
  };

  return (
    <div style={{ ...S.root, fontFamily: "'DM Sans', 'Segoe UI', sans-serif" }}>

      {/* ── Header ── */}
      <header style={S.header}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={S.headerLogoBox}><BookIcon /></div>
          <span style={S.headerLogoText}>NovaLibros</span>
        </div>
        <p style={S.headerLink}>
          ¿Ya tienes cuenta?{' '}
          <a href="/login" style={S.headerLoginLink}>Inicia sesión</a>
        </p>
      </header>

      {/* ── Main ── */}
      <main style={S.main}>
        <div style={S.mainInner}>

          {/* Título */}
          <div style={S.titleWrapper}>
            <h1 style={S.pageTitle}>Crea tu cuenta</h1>
            <p style={S.pageSubtitle}>Completa el formulario para acceder a todos los beneficios</p>
          </div>

          {/* Stepper */}
          <div style={S.stepperRow}>
            {STEPS.map((s, i) => {
              const done   = step > s.num;
              const active = step === s.num;
              return (
                <div key={s.num} style={{ display: 'flex', alignItems: 'center' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                    <div style={active || done ? S.stepCircleActive : S.stepCircleInactive}>
                      {done
                        ? <CheckIcon />
                        : <span style={{ color: active ? '#FFF' : '#94A3B8', fontSize: '14px', fontWeight: 700 }}>{s.num}</span>
                      }
                    </div>
                    <span style={active ? S.stepLabelActive : S.stepLabelInactive}>{s.label}</span>
                  </div>
                  {i < STEPS.length - 1 && (
                    <div style={done ? S.stepConnectorActive : S.stepConnectorInactive} />
                  )}
                </div>
              );
            })}
          </div>

          {/* Card */}
          <div style={S.card}>

            {/* Error general */}
            {errors.general && (
              <div style={alertError}>
                <ErrorIcon />
                <span style={alertErrorText}>{errors.general}</span>
              </div>
            )}

            {/* ── STEP 1: Datos personales ── */}
            {step === 1 && (
              <>
                <h2 style={S.cardTitle}>Información personal</h2>
                <div style={S.gridTwoCols}>
                  <div style={field}>
                    <label style={label}>Nombre(s)</label>
                    <input type="text" value={form.nombre} onChange={e => set('nombre', e.target.value)}
                      placeholder="Juan" style={getInputStyle(!!errors.nombre)}
                      onFocus={e => inputFocusOn(e, !!errors.nombre)}
                      onBlur={e  => inputFocusOff(e, !!errors.nombre)} />
                    {err('nombre')}
                  </div>
                  <div style={field}>
                    <label style={label}>Apellido(s)</label>
                    <input type="text" value={form.apellido} onChange={e => set('apellido', e.target.value)}
                      placeholder="García" style={getInputStyle(!!errors.apellido)}
                      onFocus={e => inputFocusOn(e, !!errors.apellido)}
                      onBlur={e  => inputFocusOff(e, !!errors.apellido)} />
                    {err('apellido')}
                  </div>
                </div>

                <div style={field}>
                  <label style={label}>DNI / Documento de identidad</label>
                  <input type="text" value={form.dni} onChange={e => set('dni', e.target.value)}
                    placeholder="1234567890" style={getInputStyle(!!errors.dni)}
                    onFocus={e => inputFocusOn(e, !!errors.dni)}
                    onBlur={e  => inputFocusOff(e, !!errors.dni)} />
                  {err('dni')}
                </div>

                <div style={S.gridTwoCols}>
                  <div style={field}>
                    <label style={label}>Fecha de nacimiento</label>
                    <input type="date" value={form.fechaNacimiento} onChange={e => set('fechaNacimiento', e.target.value)}
                      style={getInputStyle(!!errors.fechaNacimiento)}
                      onFocus={e => inputFocusOn(e, !!errors.fechaNacimiento)}
                      onBlur={e  => inputFocusOff(e, !!errors.fechaNacimiento)} />
                    {err('fechaNacimiento')}
                  </div>
                  <div style={field}>
                    <label style={label}>Género</label>
                    <select value={form.genero} onChange={e => set('genero', e.target.value)}
                      style={{ ...getInputStyle(!!errors.genero), cursor: 'pointer' }}
                      onFocus={e => inputFocusOn(e, !!errors.genero)}
                      onBlur={e  => inputFocusOff(e, !!errors.genero)}>
                      <option value="">Seleccionar...</option>
                      <option value="masculino">Masculino</option>
                      <option value="femenino">Femenino</option>
                      <option value="otro">Otro</option>
                      <option value="prefiero_no_decir">Prefiero no decir</option>
                    </select>
                    {err('genero')}
                  </div>
                </div>

                <div style={field}>
                  <label style={label}>Lugar de nacimiento</label>
                  <input type="text" value={form.lugarNacimiento} onChange={e => set('lugarNacimiento', e.target.value)}
                    placeholder="Pereira, Colombia" style={getInputStyle(!!errors.lugarNacimiento)}
                    onFocus={e => inputFocusOn(e, !!errors.lugarNacimiento)}
                    onBlur={e  => inputFocusOff(e, !!errors.lugarNacimiento)} />
                  {err('lugarNacimiento')}
                </div>
              </>
            )}

            {/* ── STEP 2: Cuenta ── */}
            {step === 2 && (
              <>
                <h2 style={S.cardTitle}>Datos de acceso y contacto</h2>

                <div style={field}>
                  <label style={label}>Correo electrónico</label>
                  <input type="email" value={form.correo} onChange={e => set('correo', e.target.value)}
                    placeholder="tucorreo@ejemplo.com" style={getInputStyle(!!errors.correo)}
                    onFocus={e => inputFocusOn(e, !!errors.correo)}
                    onBlur={e  => inputFocusOff(e, !!errors.correo)} />
                  {err('correo')}
                </div>

                <div style={field}>
                  <label style={label}>Nombre de usuario</label>
                  <input type="text" value={form.usuario} onChange={e => set('usuario', e.target.value)}
                    placeholder="juan_garcia" style={getInputStyle(!!errors.usuario)}
                    onFocus={e => inputFocusOn(e, !!errors.usuario)}
                    onBlur={e  => inputFocusOff(e, !!errors.usuario)} />
                  {err('usuario')}
                </div>

                <div style={field}>
                  <label style={label}>Contraseña</label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={form.contrasena}
                      onChange={e => set('contrasena', e.target.value)}
                      placeholder="Mínimo 8 caracteres"
                      style={{ ...getInputStyle(!!errors.contrasena), paddingRight: '44px' }}
                      onFocus={e => inputFocusOn(e, !!errors.contrasena)}
                      onBlur={e  => inputFocusOff(e, !!errors.contrasena)}
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)}
                      style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)',
                               background: 'none', border: 'none', cursor: 'pointer', color: '#94A3B8',
                               padding: '4px', display: 'flex', alignItems: 'center' }}>
                      {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                    </button>
                  </div>
                  {/* Indicador de fuerza */}
                  {form.contrasena.length > 0 && (
                    <div style={S.strengthRow}>
                      {[1,2,3,4].map(i => (
                        <div key={i} style={{
                          flex: 1, height: '3px', borderRadius: '2px', transition: 'background-color 0.2s',
                          backgroundColor: form.contrasena.length >= i * 2
                            ? S.getStrengthBarColor(form.contrasena.length)
                            : '#E2E8F0',
                        }} />
                      ))}
                    </div>
                  )}
                  {err('contrasena')}
                </div>

                <div style={field}>
                  <label style={label}>Confirmar contraseña</label>
                  <input type="password" value={form.confirmarContrasena}
                    onChange={e => set('confirmarContrasena', e.target.value)}
                    placeholder="Repite tu contraseña"
                    style={getInputStyle(!!errors.confirmarContrasena)}
                    onFocus={e => inputFocusOn(e, !!errors.confirmarContrasena)}
                    onBlur={e  => inputFocusOff(e, !!errors.confirmarContrasena)} />
                  {err('confirmarContrasena')}
                </div>

                <div style={field}>
                  <label style={label}>Dirección de correspondencia</label>
                  <input type="text" value={form.direccion} onChange={e => set('direccion', e.target.value)}
                    placeholder="Calle 15 #23-45, Pereira" style={getInputStyle(!!errors.direccion)}
                    onFocus={e => inputFocusOn(e, !!errors.direccion)}
                    onBlur={e  => inputFocusOff(e, !!errors.direccion)} />
                  {err('direccion')}
                </div>

                <div style={field}>
                  <label style={label}>
                    Teléfono{' '}
                    <span style={{ color: '#94A3B8', fontWeight: 400 }}>(opcional)</span>
                  </label>
                  <input type="tel" value={form.telefono} onChange={e => set('telefono', e.target.value)}
                    placeholder="+57 300 000 0000" style={getInputStyle(false)}
                    onFocus={e => inputFocusOn(e, false)}
                    onBlur={e  => inputFocusOff(e, false)} />
                </div>
              </>
            )}

            {/* ── STEP 3: Preferencias ── */}
            {step === 3 && (
              <form onSubmit={handleSubmit}>
                <h2 style={S.cardTitle}>Preferencias literarias</h2>
                <p style={S.cardSubtitle}>
                  Selecciona los géneros que más te interesan para personalizar tus recomendaciones
                </p>

                <div style={S.chipsWrapper}>
                  {GENEROS_LITERARIOS.map(pref => {
                    const selected = form.preferencias.includes(pref);
                    return (
                      <button key={pref} type="button" onClick={() => togglePreferencia(pref)}
                        style={selected ? S.chipSelected : S.chipDefault}>
                        {pref}
                      </button>
                    );
                  })}
                </div>

                <div style={S.legalBox}>
                  <Checkbox field="aceptaTerminos" label="Acepto los términos y condiciones del servicio" />
                  <Checkbox field="aceptaDatos"    label="Acepto la política de tratamiento de datos personales (Ley 1581 de 2012)" />
                </div>

                <button type="submit" disabled={loading}
                  style={loading ? btnPrimaryDisabled : btnPrimary}
                  onMouseEnter={e => { if (!loading) (e.target as HTMLButtonElement).style.backgroundColor = '#1D4ED8'; }}
                  onMouseLeave={e => { if (!loading) (e.target as HTMLButtonElement).style.backgroundColor = '#2563EB'; }}>
                  {loading ? 'Creando cuenta...' : 'Crear cuenta'}
                </button>
              </form>
            )}

            {/* ── Navegación entre steps ── */}
            {step < 3 && (
              <div style={S.navRow(step > 1)}>
                {step > 1 && (
                  <button type="button" onClick={() => setStep((step - 1) as Step)} style={btnSecondary}
                    onMouseEnter={e => (e.target as HTMLButtonElement).style.backgroundColor = '#CBD5E1'}
                    onMouseLeave={e => (e.target as HTMLButtonElement).style.backgroundColor = '#E2E8F0'}>
                    Atrás
                  </button>
                )}
                <button type="button" onClick={nextStep}
                  style={{ ...btnPrimary, width: 'auto' }}
                  onMouseEnter={e => (e.target as HTMLButtonElement).style.backgroundColor = '#1D4ED8'}
                  onMouseLeave={e => (e.target as HTMLButtonElement).style.backgroundColor = '#2563EB'}>
                  Continuar
                </button>
              </div>
            )}
          </div>

          {/* Pie */}
          <p style={S.footerText}>
            Al registrarte aceptas nuestros{' '}
            <a href="#" style={S.footerLink}>Términos</a>{' '}y{' '}
            <a href="#" style={S.footerLink}>Política de privacidad</a>
          </p>
        </div>
      </main>

      <style>{globalStyles}</style>
    </div>
  );
}
