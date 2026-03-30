"use client";

import { useForgotPassword } from "@/hooks/useForgotPassword";
import { useStepEmail } from "@/hooks/useStepEmail";
import { useStepConfirmation } from "@/hooks/useStepConfirmation";
import { useStepNewPassword } from "@/hooks/useStepNewPassword";
import type { ForgotPasswordStep } from "@/types/forgotPassword.types";

// ─── Clases ───────────────────────────────────────────────────────────────────
const inputClass = (hasError: boolean) =>
  `w-full rounded-lg border px-4 py-3 text-[15px] text-slate-900 outline-none transition-colors focus:border-blue-600 ${hasError ? "border-red-500 bg-red-100" : "border-slate-300 bg-white"}`;

const labelClass = "mb-2 block text-[14px] font-semibold text-slate-900";
const fieldClass = "mb-5";
const errorTextClass = "mt-1.5 text-[12px] text-red-800";
const primaryButtonClass =
  "w-full rounded-lg bg-blue-600 py-3 text-[15px] font-semibold text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300";

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
);

const LockIcon = ({ className }: { className?: string }) => (
  <svg className={className} width="26" height="26" viewBox="0 0 24 24" fill="none">
    <rect x="3" y="11" width="18" height="11" rx="2" stroke="currentColor" strokeWidth="2" />
    <path
      d="M7 11V7a5 5 0 0 1 10 0v4"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
  </svg>
);

const MailIcon = ({ className }: { className?: string }) => (
  <svg className={className} width="26" height="26" viewBox="0 0 24 24" fill="none">
    <path
      d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
    <polyline points="22,6 12,13 2,6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

const CheckIcon = ({ size = 28, className }: { size?: number; className?: string }) => (
  <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none">
    <polyline
      points="20 6 9 17 4 12"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

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
);

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
);

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
);

const ErrorAlertIcon = ({ className }: { className?: string }) => (
  <svg className={className} width="16" height="16" viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
    <line
      x1="12"
      y1="8"
      x2="12"
      y2="12"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
    <line
      x1="12"
      y1="16"
      x2="12.01"
      y2="16"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
  </svg>
);

// ─── Steps indicator ──────────────────────────────────────────────────────────
const STEP_ORDER: ForgotPasswordStep[] = ["email", "confirmation", "new-password"];

const StepsIndicator = ({ current }: { current: ForgotPasswordStep }) => {
  const idx = STEP_ORDER.indexOf(current);
  return (
    <div className="mb-6 flex gap-2">
      {STEP_ORDER.map((_, i) => (
        <div
          key={i}
          className={`h-1 flex-1 rounded ${i <= idx ? "bg-blue-600" : "bg-slate-200"}`}
        />
      ))}
    </div>
  );
};

const BackToLogin = () => (
  <div className="mt-6 text-center">
    <a
      href="/login"
      className="inline-flex items-center gap-2 text-[14px] font-medium text-slate-600 hover:text-slate-800"
    >
      <ArrowLeftIcon />
      Volver al inicio de sesión
    </a>
  </div>
);

// ─── Step 1 ───────────────────────────────────────────────────────────────────
function StepEmail({ onNext }: { onNext: (email: string) => void }) {
  const { email, error, loading, handleChange, handleSubmit } = useStepEmail(onNext);

  return (
    <>
      <StepsIndicator current="email" />
      <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
        <MailIcon />
      </div>
      <h1 className="mb-2 text-[24px] font-bold tracking-[-0.4px] text-slate-900">
        ¿Olvidaste tu contraseña?
      </h1>
      <p className="mb-6 text-[15px] text-slate-600">
        Ingresa el correo de tu cuenta y te enviaremos un enlace para restablecerla.
      </p>

      {error && (
        <div className="mb-5 flex items-center gap-2 rounded-lg border border-red-500 bg-red-100 px-4 py-3 text-[14px] text-red-800">
          <ErrorAlertIcon className="text-red-800" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className={fieldClass}>
          <label className={labelClass}>Correo electrónico</label>
          <input
            type="email"
            value={email}
            onChange={e => handleChange(e.target.value)}
            placeholder="tucorreo@ejemplo.com"
            className={inputClass(!!error)}
          />
          {error && <p className={errorTextClass}>{error}</p>}
        </div>
        <button type="submit" disabled={loading} className={primaryButtonClass}>
          {loading ? "Enviando..." : "Enviar enlace de recuperación"}
        </button>
      </form>
      <BackToLogin />
    </>
  );
}

// ─── Step 2 ───────────────────────────────────────────────────────────────────
function StepConfirmation({ email, onNext }: { email: string; onNext: () => void }) {
  const { resent, countdown, handleResend } = useStepConfirmation();

  return (
    <>
      <StepsIndicator current="confirmation" />
      <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-full border-2 border-green-200 bg-green-100 text-green-600">
        <CheckIcon className="text-green-600" />
      </div>
      <h1 className="mb-2 text-[24px] font-bold tracking-[-0.4px] text-slate-900">
        Revisa tu correo
      </h1>
      <p className="mb-6 text-[15px] text-slate-600">
        Enviamos un enlace de recuperación a{" "}
        <span className="font-semibold text-slate-900">{email}</span>. El enlace expira en 15
        minutos.
      </p>
      <div className="mb-7 flex items-start gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-blue-800">
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          className="mt-0.5 flex-shrink-0"
        >
          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
          <line
            x1="12"
            y1="12"
            x2="12"
            y2="16"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
        <p className="text-[13px] leading-[1.5]">
          Si no ves el correo, revisa tu carpeta de spam o correo no deseado.
        </p>
      </div>
      <button className={primaryButtonClass} onClick={onNext}>
        Ya tengo el enlace, continuar
      </button>
      <div className="mt-5 text-center">
        {resent && countdown > 0 ? (
          <p className="text-[14px] text-slate-600">
            Correo reenviado. Puedes intentarlo de nuevo en{" "}
            <strong className="text-slate-900">{countdown}s</strong>
          </p>
        ) : (
          <p className="text-[14px] text-slate-600">
            ¿No te llegó?{" "}
            <button
              className="font-semibold text-blue-600 hover:text-blue-700"
              onClick={handleResend}
            >
              Reenviar correo
            </button>
          </p>
        )}
      </div>
      <BackToLogin />
    </>
  );
}

// ─── Step 3 ───────────────────────────────────────────────────────────────────
function StepNewPassword({ onDone }: { onDone: () => void }) {
  const {
    password,
    setPassword,
    confirm,
    setConfirm,
    showPassword,
    setShowPassword,
    showConfirm,
    setShowConfirm,
    loading,
    errors,
    setErrors,
    strength,
    handleSubmit,
  } = useStepNewPassword(onDone);

  return (
    <>
      <StepsIndicator current="new-password" />
      <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
        <LockIcon className="text-blue-600" />
      </div>
      <h1 className="mb-2 text-[24px] font-bold tracking-[-0.4px] text-slate-900">
        Nueva contraseña
      </h1>
      <p className="mb-6 text-[15px] text-slate-600">
        Crea una contraseña segura. Debe tener al menos 8 caracteres.
      </p>

      <form onSubmit={handleSubmit}>
        <div className={fieldClass}>
          <label className={labelClass}>Nueva contraseña</label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={e => {
                setPassword(e.target.value);
                setErrors(p => ({ ...p, password: "" }));
              }}
              placeholder="Mínimo 8 caracteres"
              className={`${inputClass(!!errors.password)} pr-11`}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-500"
            >
              {showPassword ? <EyeOffIcon /> : <EyeIcon />}
            </button>
          </div>
          {password.length > 0 && (
            <>
              <div className="mt-2 flex gap-1">
                {[1, 2, 3, 4].map(i => (
                  <div
                    key={i}
                    className={`h-[3px] flex-1 rounded-[2px] transition-colors ${password.length >= i * 2 ? strength.barClass : "bg-slate-200"}`}
                  />
                ))}
              </div>
              {strength.label && (
                <p className={`mt-1.5 text-[12px] font-medium ${strength.textClass}`}>
                  {strength.label}
                </p>
              )}
            </>
          )}
          {errors.password && <p className={errorTextClass}>{errors.password}</p>}
        </div>

        <div className={fieldClass}>
          <label className={labelClass}>Confirmar contraseña</label>
          <div className="relative">
            <input
              type={showConfirm ? "text" : "password"}
              value={confirm}
              onChange={e => {
                setConfirm(e.target.value);
                setErrors(p => ({ ...p, confirm: "" }));
              }}
              placeholder="Repite tu contraseña"
              className={`${inputClass(!!errors.confirm)} pr-11`}
            />
            <button
              type="button"
              onClick={() => setShowConfirm(!showConfirm)}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-500"
            >
              {showConfirm ? <EyeOffIcon /> : <EyeIcon />}
            </button>
          </div>
          {confirm.length > 0 && (
            <p
              className={`mt-1.5 text-[12px] font-medium ${password === confirm ? "text-green-600" : "text-red-600"}`}
            >
              {password === confirm
                ? "✓ Las contraseñas coinciden"
                : "✗ Las contraseñas no coinciden"}
            </p>
          )}
          {errors.confirm && <p className={errorTextClass}>{errors.confirm}</p>}
        </div>

        <button type="submit" disabled={loading} className={primaryButtonClass}>
          {loading ? "Guardando..." : "Guardar nueva contraseña"}
        </button>
      </form>
    </>
  );
}

// ─── Step 4 ───────────────────────────────────────────────────────────────────
function StepDone() {
  return (
    <div className="text-center">
      <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-full border-2 border-green-200 bg-green-100 text-green-600">
        <CheckIcon size={28} className="text-green-600" />
      </div>
      <h1 className="mb-2 text-[24px] font-bold tracking-[-0.4px] text-slate-900">
        ¡Contraseña actualizada!
      </h1>
      <p className="mb-6 text-[15px] text-slate-600">
        Tu contraseña fue cambiada exitosamente. Ya puedes iniciar sesión con tu nueva contraseña.
      </p>
      <a href="/login" className={`${primaryButtonClass} inline-flex justify-center no-underline`}>
        Ir al inicio de sesión
      </a>
    </div>
  );
}

// ─── Página principal ─────────────────────────────────────────────────────────
export default function ForgotPasswordPage() {
  const { step, email, goToConfirmation, goToNewPassword, goToDone } = useForgotPassword();

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <header className="flex items-center gap-3 border-b border-slate-200 bg-white px-8 py-4">
        <div className="flex h-9 w-9 items-center justify-center rounded-[9px] bg-blue-600">
          <BookIcon />
        </div>
        <span className="text-[20px] font-bold text-slate-900">NovaLibros</span>
      </header>

      <main className="flex flex-1 items-center justify-center px-6 py-12">
        <div className="w-full max-w-[440px] rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
          {step === "email" && <StepEmail onNext={goToConfirmation} />}
          {step === "confirmation" && <StepConfirmation email={email} onNext={goToNewPassword} />}
          {step === "new-password" && <StepNewPassword onDone={goToDone} />}
          {step === "done" && <StepDone />}
        </div>
      </main>
    </div>
  );
}
