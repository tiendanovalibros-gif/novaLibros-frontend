"use client";

import { useLogin } from "@/hooks/useLogin";
import Iconify from "@/components/iconify/iconify";
import LayoutCard from "@/layouts/auth/authCard";
import { Alert } from "@mui/material";

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

export default function LoginPage() {
  const {
    email,
    setEmail,
    password,
    setPassword,
    error,
    loading,
    showPassword,
    setShowPassword,
    handleSubmit,
  } = useLogin();

  return (
    <div className="min-h-screen bg-slate-50 md:flex">
      <LayoutCard
        title="Descubre tu próxima"
        description="Accede a miles de títulos, gestiona tus reservas y compras, todo desde un solo lugar."
        highlight="gran lectura"
        eyebrow="Tu librería en línea"
        logo={<BookIcon />}
      />

      <div className="flex w-full flex-1 items-center justify-center px-8 py-12">
        <div className="w-full max-w-[400px] rounded-2xl bg-white p-8 shadow-lg">
          <div className="text-center">
            <h1 className="mb-2 text-[28px] font-bold tracking-[-0.4px] text-slate-900">
              NovaLibros
            </h1>
            <p className="mb-9 text-[15px] text-slate-600">
              Bienvenido de nuevo a tu librería en línea
            </p>
          </div>

          {!!error && (
            <div className="flex items-center rounded-lg border mb-2">
              <Alert className="w-full" severity="error">
                {error}
              </Alert>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="mb-[18px]">
              <label className="mb-[7px] block text-[14px] font-semibold text-slate-900">
                Correo electrónico
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="tucorreo@ejemplo.com"
                className="w-full rounded-lg border border-slate-300 bg-white px-[14px] py-[11px] text-[15px] text-slate-900 outline-none transition-colors focus:border-blue-600"
              />
            </div>

            <div className="mb-[18px]">
              <label className="mb-[7px] block text-[14px] font-semibold text-slate-900">
                Contraseña
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-lg border border-slate-300 bg-white px-[14px] py-[11px] pr-11 text-[15px] text-slate-900 outline-none transition-colors focus:border-blue-600"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-500"
                >
                  <Iconify icon={showPassword ? "solar:eye-bold" : "solar:eye-closed-bold"} />
                </button>
              </div>
            </div>

            <div className="mb-7 text-right">
              <a
                href="/forgot-password"
                className="text-[14px] font-medium text-blue-600 hover:text-blue-700"
              >
                ¿Olvidaste tu contraseña?
              </a>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-blue-600 py-3 text-[15px] font-semibold text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
            >
              {loading ? "Ingresando..." : "Iniciar sesión"}
            </button>
          </form>

          <div className="my-7 flex items-center gap-4">
            <div className="h-px flex-1 bg-slate-200" />
            <span className="text-[13px] text-slate-400">o</span>
            <div className="h-px flex-1 bg-slate-200" />
          </div>

          <p className="text-center text-[14px] text-slate-600">
            ¿No tienes cuenta?{" "}
            <a href="/register" className="font-semibold text-blue-600 hover:text-blue-700">
              Regístrate gratis
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
