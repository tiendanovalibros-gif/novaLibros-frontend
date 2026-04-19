"use client";

import { useState, useEffect } from "react";
import BannerCard from "@/components/authCard";
import Iconify from "@/components/iconify/iconify";
import { useRouter } from "next/navigation";
import { useStepEmail } from "@/hooks/useStepEmail";
import { forgotPassword } from "@/services/auth.service";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [emailSent, setEmailSent] = useState(false);
  const [savedEmail, setSavedEmail] = useState("");
  const [countdown, setCountdown] = useState(0);
  const [resendError, setResendError] = useState("");
  const [resendLoading, setResendLoading] = useState(false);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const { email, error, loading, handleChange, handleSubmit } = useStepEmail(submittedEmail => {
    setSavedEmail(submittedEmail);
    setEmailSent(true);
    setCountdown(60);
  });

  const handleResend = async () => {
    if (countdown > 0 || !savedEmail || resendLoading) return;
    setResendError("");
    setResendLoading(true);
    try {
      await forgotPassword(savedEmail);
      setCountdown(60);
    } catch {
      setResendError("No se pudo reenviar el correo. Intentalo de nuevo.");
    } finally {
      setResendLoading(false);
    }
  };

  const handleBackToLogin = () => {
    router.push("/login");
  };

  return (
    <div className="min-h-screen bg-slate-50 md:flex">
      <BannerCard
        title="Descubre tu próxima"
        description="Accede a miles de títulos, gestiona tus reservas y compras, todo desde un solo lugar."
        highlight="gran lectura"
        eyebrow="Tu librería en línea"
      />
      <div className="flex w-full flex-1 items-center justify-center px-8 py-12">
        <div className="w-full max-w-[440px] rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
          <div className="flex justify-center">
            <Iconify icon="streamline-flex-color:padlock-square-1-flat" width={96} />
          </div>

          {!emailSent ? (
            <>
              {/* Formulario para ingresar email */}
              <h1 className="mb-2 text-center text-[24px] font-bold tracking-[-0.4px] text-slate-900">
                ¿Olvidaste tu contraseña?
              </h1>
              <p className="mb-6 text-center text-[15px] text-slate-600">
                Ingresa tu correo electrónico y te enviaremos un enlace para restablecerla.
              </p>

              {error && (
                <div className="mb-5 flex items-center gap-2 rounded-lg border border-red-500 bg-red-100 px-4 py-3 text-[14px] text-red-800">
                  <Iconify icon="jam:alert" className="text-red-800" />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div className="mb-5">
                  <label className="mb-2 block text-[14px] font-semibold text-slate-900">
                    Correo electrónico
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={e => handleChange(e.target.value)}
                    placeholder="tucorreo@ejemplo.com"
                    className={`w-full rounded-lg border px-4 py-3 text-[15px] text-slate-900 outline-none transition-colors focus:border-blue-600 ${!!error ? "border-red-500 bg-red-100" : "border-slate-300 bg-white"}`}
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-lg bg-blue-600 py-3 text-[15px] font-semibold text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
                >
                  {loading ? "Enviando..." : "Enviar enlace de recuperación"}
                </button>
              </form>
            </>
          ) : (
            <>
              {/* Pantalla de confirmación */}
              <h1 className="mb-2 text-center text-[24px] font-bold tracking-[-0.4px] text-slate-900">
                Revisa tu correo
              </h1>
              <p className="mb-6 text-center text-[15px] text-slate-600">
                Enviamos un enlace de recuperación a{" "}
                <span className="font-semibold text-slate-900">{savedEmail}</span>. El enlace expira
                en 15 minutos.
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

              <div className="text-center">
                {countdown > 0 ? (
                  <p className="text-[14px] text-slate-600">
                    Puedes reenviar el correo en{" "}
                    <strong className="text-slate-900">{countdown}s</strong>
                  </p>
                ) : (
                  <p className="text-[14px] text-slate-600">
                    ¿No te llegó?{" "}
                    <button
                      type="button"
                      onClick={handleResend}
                      disabled={resendLoading}
                      className="font-semibold text-blue-600 transition-colors hover:text-blue-700 disabled:cursor-not-allowed disabled:text-blue-300"
                    >
                      {resendLoading ? "Reenviando..." : "Reenviar correo"}
                    </button>
                  </p>
                )}
                {resendError && (
                  <p className="mt-3 text-[13px] text-red-600">{resendError}</p>
                )}
              </div>
            </>
          )}

          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={handleBackToLogin}
              className="inline-flex items-center gap-2 text-[14px] font-medium text-slate-600 transition-colors hover:text-slate-800"
            >
              <Iconify icon="formkit:arrowleft" />
              Volver al inicio de sesión
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
