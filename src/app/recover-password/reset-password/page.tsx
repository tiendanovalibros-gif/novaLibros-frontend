"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import BannerCard from "@/components/authCard";
import Iconify from "@/components/iconify/iconify";
import { resetPassword } from "@/services/auth.service";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [nuevaContrasena, setNuevaContrasena] = useState("");
  const [confirmarContrasena, setConfirmarContrasena] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!token) {
      router.push("/forgot-password");
    }
  }, [token, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (nuevaContrasena.length < 8) {
      setError("La contraseña debe tener al menos 8 caracteres.");
      return;
    }

    if (nuevaContrasena !== confirmarContrasena) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    setLoading(true);
    try {
      await resetPassword(token!, nuevaContrasena);
      setSuccess(true);
    } catch {
      setError("El enlace es inválido o ha expirado. Solicita uno nuevo.");
    } finally {
      setLoading(false);
    }
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

          {!success ? (
            <>
              <h1 className="mb-2 text-center text-[24px] font-bold tracking-[-0.4px] text-slate-900">
                Nueva contraseña
              </h1>
              <p className="mb-6 text-center text-[15px] text-slate-600">
                Ingresa tu nueva contraseña. Debe tener al menos 8 caracteres.
              </p>

              {error && (
                <div className="mb-5 flex items-center gap-2 rounded-lg border border-red-500 bg-red-100 px-4 py-3 text-[14px] text-red-800">
                  <Iconify icon="jam:alert" className="text-red-800" />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <label className="mb-2 block text-[14px] font-semibold text-slate-900">
                    Nueva contraseña
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={nuevaContrasena}
                      onChange={e => setNuevaContrasena(e.target.value)}
                      placeholder="Mínimo 8 caracteres"
                      className={`w-full rounded-lg border px-4 py-3 text-[15px] text-slate-900 outline-none transition-colors focus:border-blue-600 pr-12 ${error ? "border-red-500 bg-red-100" : "border-slate-300 bg-white"}`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      <Iconify icon={showPassword ? "jam:eye-close" : "jam:eye"} width={20} />
                    </button>
                  </div>
                </div>

                <div className="mb-6">
                  <label className="mb-2 block text-[14px] font-semibold text-slate-900">
                    Confirmar contraseña
                  </label>
                  <input
                    type={showPassword ? "text" : "password"}
                    value={confirmarContrasena}
                    onChange={e => setConfirmarContrasena(e.target.value)}
                    placeholder="Repite tu nueva contraseña"
                    className={`w-full rounded-lg border px-4 py-3 text-[15px] text-slate-900 outline-none transition-colors focus:border-blue-600 ${error ? "border-red-500 bg-red-100" : "border-slate-300 bg-white"}`}
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-lg bg-blue-600 py-3 text-[15px] font-semibold text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
                >
                  {loading ? "Guardando..." : "Guardar nueva contraseña"}
                </button>
              </form>
            </>
          ) : (
            <>
              <h1 className="mb-2 text-center text-[24px] font-bold tracking-[-0.4px] text-slate-900">
                ¡Contraseña actualizada!
              </h1>
              <p className="mb-8 text-center text-[15px] text-slate-600">
                Tu contraseña fue restablecida exitosamente. Ya puedes iniciar sesión.
              </p>
              <button
                onClick={() => router.push("/login")}
                className="w-full rounded-lg bg-blue-600 py-3 text-[15px] font-semibold text-white transition-colors hover:bg-blue-700"
              >
                Ir al inicio de sesión
              </button>
            </>
          )}

          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={() => router.push("/login")}
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

export default function ResetPasswordPage() {
  return (
    <Suspense>
      <ResetPasswordForm />
    </Suspense>
  );
}
