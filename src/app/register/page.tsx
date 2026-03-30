"use client";

import { useRegister } from "@/hooks/useRegister";
import { STEPS, GENEROS_LITERARIOS } from "@/constants/register.constants";
import type { RegisterFormData } from "@/types/register.types";
import Iconify from "@/components/iconify/iconify";
import LayoutCard from "@/layouts/auth/authCard";
import { Alert } from "@mui/material";

// ─── Iconos ──────────────────────────────────────────────────────────────────
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
);

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
);

// ─── Clases reutilizables ─────────────────────────────────────────────────────
const inputClass = (hasError: boolean) =>
  `w-full rounded-lg border bg-white px-[14px] py-[11px] text-[15px] text-slate-900 outline-none transition-colors focus:border-blue-600 ${hasError ? "border-red-500 bg-red-100" : "border-slate-300"}`;

const primaryBtnClass =
  "rounded-lg bg-blue-600 text-[15px] font-semibold text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300";
const secondaryBtnClass =
  "rounded-lg bg-slate-200 px-6 py-2.5 text-[15px] font-semibold text-slate-900 transition-colors hover:bg-slate-300";
const errorTextClass = "mt-1.5 text-[12px] text-red-800";
const fieldClass = "mb-[18px]";

const strengthColor = (len: number) => {
  if (len < 6) return "bg-red-500";
  if (len < 10) return "bg-yellow-400";
  return "bg-green-500";
};

// ─── Checkbox ─────────────────────────────────────────────────────────────────
interface CheckboxProps {
  field: "aceptaTerminos" | "aceptaDatos";
  label: string;
  checked: boolean;
  error?: string;
  onChange: (field: keyof RegisterFormData, value: boolean) => void;
}

const Checkbox = ({ field, label, checked, error, onChange }: CheckboxProps) => {
  const boxClass = error
    ? "border-red-500 bg-white"
    : checked
      ? "border-blue-600 bg-blue-600"
      : "border-slate-300 bg-white";

  return (
    <div>
      <label className="flex cursor-pointer items-start gap-3">
        <div
          role="checkbox"
          aria-checked={checked}
          tabIndex={0}
          onClick={() => onChange(field, !checked)}
          onKeyDown={e => e.key === " " && onChange(field, !checked)}
          className={`mt-[1px] flex h-[18px] w-[18px] min-w-[18px] items-center justify-center rounded-[4px] border-2 ${boxClass}`}
        >
          {checked && <CheckIcon />}
        </div>
        <span className="text-[14px] leading-[1.5] text-slate-600">{label}</span>
      </label>
      {error && <p className={`${errorTextClass} ml-[30px]`}>{error}</p>}
    </div>
  );
};

// ─── Página ───────────────────────────────────────────────────────────────────
export default function RegisterPage() {
  const {
    step,
    nextStep,
    prevStep,
    form,
    set,
    togglePreferencia,
    errors,
    loading,
    showPassword,
    setShowPassword,
    handleSubmit,
  } = useRegister();

  const err = (f: keyof RegisterFormData) =>
    errors[f] ? <p className={errorTextClass}>{errors[f]}</p> : null;

  return (
    <div className="min-h-screen bg-slate-50 md:flex relative z-10 flex gap-8">
      <LayoutCard
        title="Descubre tu próxima"
        description="Accede a miles de títulos, gestiona tus reservas y compras, todo desde un solo lugar."
        highlight="gran lectura"
        eyebrow="Tu librería en línea"
        logo={<BookIcon />}
      />

      <div className="flex w-full flex-1 items-center justify-center px-8 py-12">
        <div className="w-full max-w-[560px] rounded-2xl bg-white p-8 shadow-lg">
          <div className="mb-6 text-left text-[14px] text-slate-600">
            ¿Ya tienes cuenta?{" "}
            <a href="/login" className="font-semibold text-blue-600 hover:text-blue-700">
              Inicia sesion
            </a>
          </div>

          <div className="mb-8 text-center">
            <h1 className="text-[26px] font-bold tracking-[-0.4px] text-slate-900">
              Crea tu cuenta
            </h1>
            <p className="text-[15px] text-slate-600">
              Completa el formulario para acceder a todos los beneficios
            </p>
          </div>

          {/* Stepper */}
          <div className="mb-9 flex items-center justify-center">
            {STEPS.map((s, i) => {
              const done = step > s.num;
              const active = step === s.num;
              return (
                <div key={s.num} className="flex items-center">
                  <div className="flex flex-col items-center gap-1.5">
                    <div
                      className={`flex h-9 w-9 items-center justify-center rounded-full transition-all ${active || done ? "bg-blue-600" : "bg-slate-200"}`}
                    >
                      {done ? (
                        <CheckIcon />
                      ) : (
                        <span
                          className={`${active ? "text-white" : "text-slate-400"} text-[14px] font-bold`}
                        >
                          {s.num}
                        </span>
                      )}
                    </div>
                    <span
                      className={`whitespace-nowrap text-[12px] ${active ? "font-semibold text-slate-900" : "font-normal text-slate-400"}`}
                    >
                      {s.label}
                    </span>
                  </div>
                  {i < STEPS.length - 1 && (
                    <div
                      className={`mx-2 mb-[22px] h-0.5 w-20 transition-colors ${done ? "bg-blue-600" : "bg-slate-200"}`}
                    />
                  )}
                </div>
              );
            })}
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
            {errors.general && (
              <div className="flex items-center rounded-lg border mb-2">
                <Alert className="w-full" severity="error">
                  {errors.general}
                </Alert>
              </div>
            )}

            {/* Step 1 */}
            {step === 1 && (
              <>
                <h2 className="mb-6 text-[18px] font-bold text-slate-900">Informacion personal</h2>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-x-4 md:gap-y-0">
                  <div className={fieldClass}>
                    <label className="mb-[7px] block text-[14px] font-semibold text-slate-900">
                      Nombre(s)
                    </label>
                    <input
                      type="text"
                      value={form.nombre}
                      onChange={e => set("nombre", e.target.value)}
                      placeholder="Juan"
                      className={inputClass(!!errors.nombre)}
                    />
                    {err("nombre")}
                  </div>
                  <div className={fieldClass}>
                    <label className="mb-[7px] block text-[14px] font-semibold text-slate-900">
                      Apellido(s)
                    </label>
                    <input
                      type="text"
                      value={form.apellido}
                      onChange={e => set("apellido", e.target.value)}
                      placeholder="Garcia"
                      className={inputClass(!!errors.apellido)}
                    />
                    {err("apellido")}
                  </div>
                </div>
                <div className={fieldClass}>
                  <label className="mb-[7px] block text-[14px] font-semibold text-slate-900">
                    DNI / Documento de identidad
                  </label>
                  <input
                    type="text"
                    value={form.dni}
                    onChange={e => set("dni", e.target.value)}
                    placeholder="1234567890"
                    className={inputClass(!!errors.dni)}
                  />
                  {err("dni")}
                </div>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-x-4 md:gap-y-0">
                  <div className={fieldClass}>
                    <label className="mb-[7px] block text-[14px] font-semibold text-slate-900">
                      Fecha de nacimiento
                    </label>
                    <input
                      type="date"
                      value={form.fechaNacimiento}
                      onChange={e => set("fechaNacimiento", e.target.value)}
                      className={inputClass(!!errors.fechaNacimiento)}
                    />
                    {err("fechaNacimiento")}
                  </div>
                  <div className={fieldClass}>
                    <label className="mb-[7px] block text-[14px] font-semibold text-slate-900">
                      Genero
                    </label>
                    <select
                      value={form.genero}
                      onChange={e => set("genero", e.target.value)}
                      className={`${inputClass(!!errors.genero)} cursor-pointer`}
                    >
                      <option value="">Seleccionar...</option>
                      <option value="masculino">Masculino</option>
                      <option value="femenino">Femenino</option>
                      <option value="otro">Otro</option>
                      <option value="prefiero_no_decir">Prefiero no decir</option>
                    </select>
                    {err("genero")}
                  </div>
                </div>
                <div className={fieldClass}>
                  <label className="mb-[7px] block text-[14px] font-semibold text-slate-900">
                    Lugar de nacimiento
                  </label>
                  <input
                    type="text"
                    value={form.lugarNacimiento}
                    onChange={e => set("lugarNacimiento", e.target.value)}
                    placeholder="Pereira, Colombia"
                    className={inputClass(!!errors.lugarNacimiento)}
                  />
                  {err("lugarNacimiento")}
                </div>
              </>
            )}

            {/* Step 2 */}
            {step === 2 && (
              <>
                <h2 className="mb-6 text-[18px] font-bold text-slate-900">
                  Datos de acceso y contacto
                </h2>
                <div className={fieldClass}>
                  <label className="mb-[7px] block text-[14px] font-semibold text-slate-900">
                    Correo electronico
                  </label>
                  <input
                    type="email"
                    value={form.correo}
                    onChange={e => set("correo", e.target.value)}
                    placeholder="tucorreo@ejemplo.com"
                    className={inputClass(!!errors.correo)}
                  />
                  {err("correo")}
                </div>
                <div className={fieldClass}>
                  <label className="mb-[7px] block text-[14px] font-semibold text-slate-900">
                    Nombre de usuario
                  </label>
                  <input
                    type="text"
                    value={form.usuario}
                    onChange={e => set("usuario", e.target.value)}
                    placeholder="juan_garcia"
                    className={inputClass(!!errors.usuario)}
                  />
                  {err("usuario")}
                </div>
                <div className={fieldClass}>
                  <label className="mb-[7px] block text-[14px] font-semibold text-slate-900">
                    Contrasena
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={form.contrasena}
                      onChange={e => set("contrasena", e.target.value)}
                      placeholder="Minimo 8 caracteres"
                      className={`${inputClass(!!errors.contrasena)} pr-11`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-500"
                    >
                      <Iconify icon={showPassword ? "solar:eye-bold" : "solar:eye-closed-bold"} />
                    </button>
                  </div>
                  {form.contrasena.length > 0 && (
                    <div className="mt-2 flex gap-1">
                      {[1, 2, 3, 4].map(i => (
                        <div
                          key={i}
                          className={`h-[3px] flex-1 rounded-[2px] transition-colors ${form.contrasena.length >= i * 2 ? strengthColor(form.contrasena.length) : "bg-slate-200"}`}
                        />
                      ))}
                    </div>
                  )}
                  {err("contrasena")}
                </div>
                <div className={fieldClass}>
                  <label className="mb-[7px] block text-[14px] font-semibold text-slate-900">
                    Confirmar contrasena
                  </label>
                  <input
                    type="password"
                    value={form.confirmarContrasena}
                    onChange={e => set("confirmarContrasena", e.target.value)}
                    placeholder="Repite tu contrasena"
                    className={inputClass(!!errors.confirmarContrasena)}
                  />
                  {err("confirmarContrasena")}
                </div>
                <div className={fieldClass}>
                  <label className="mb-[7px] block text-[14px] font-semibold text-slate-900">
                    Direccion de correspondencia
                  </label>
                  <input
                    type="text"
                    value={form.direccion}
                    onChange={e => set("direccion", e.target.value)}
                    placeholder="Calle 15 #23-45, Pereira"
                    className={inputClass(!!errors.direccion)}
                  />
                  {err("direccion")}
                </div>
                <div className={fieldClass}>
                  <label className="mb-[7px] block text-[14px] font-semibold text-slate-900">
                    Telefono
                  </label>
                  <input
                    type="tel"
                    value={form.telefono}
                    onChange={e => set("telefono", e.target.value)}
                    placeholder="+570000000000"
                    className={inputClass(!!errors.telefono)}
                  />
                  {err("telefono")}
                </div>
              </>
            )}

            {/* Step 3 */}
            {step === 3 && (
              <>
                <h2 className="mb-6 text-[18px] font-bold text-slate-900">
                  Preferencias literarias
                </h2>
                <p className="mb-5 text-[14px] text-slate-600">
                  Selecciona los generos que mas te interesan para personalizar tus recomendaciones
                </p>
                <div className="mb-6 flex flex-wrap gap-2">
                  {GENEROS_LITERARIOS.map(pref => (
                    <button
                      key={pref}
                      type="button"
                      onClick={() => togglePreferencia(pref)}
                      className={`rounded-full border px-3.5 py-[7px] text-[13px] font-semibold transition-colors ${form.preferencias.includes(pref) ? "border-blue-600 bg-blue-100 text-blue-900" : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"}`}
                    >
                      {pref}
                    </button>
                  ))}
                </div>
                <div className="mb-6 flex flex-col gap-3.5 rounded-[10px] border border-slate-200 bg-slate-50 p-5">
                  <Checkbox
                    field="aceptaTerminos"
                    label="Acepto los terminos y condiciones del servicio"
                    checked={form.aceptaTerminos}
                    error={errors.aceptaTerminos}
                    onChange={set}
                  />
                  <Checkbox
                    field="aceptaDatos"
                    label="Acepto la politica de tratamiento de datos personales (Ley 1581 de 2012)"
                    checked={form.aceptaDatos}
                    error={errors.aceptaDatos}
                    onChange={set}
                  />
                </div>
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={loading}
                  className={`${primaryBtnClass} w-full py-3`}
                >
                  {loading ? "Creando cuenta..." : "Crear cuenta"}
                </button>
              </>
            )}

            {step < 3 && (
              <div
                className={`mt-2 flex border-t border-slate-200 pt-6 ${step > 1 ? "justify-between" : "justify-end"}`}
              >
                {step > 1 && (
                  <button type="button" onClick={prevStep} className={secondaryBtnClass}>
                    Atras
                  </button>
                )}
                <button
                  type="button"
                  onClick={nextStep}
                  className={`${primaryBtnClass} px-6 py-2.5`}
                >
                  Continuar
                </button>
              </div>
            )}
          </div>

          <p className="mt-6 text-center text-[13px] text-slate-400">
            Al registrarte aceptas nuestros{" "}
            <a href="#" className="text-blue-600 hover:text-blue-700">
              Terminos
            </a>{" "}
            y{" "}
            <a href="#" className="text-blue-600 hover:text-blue-700">
              Politica de privacidad
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
