"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth.context";
import ManageStores from "@/sections/tiendas/manage-stores";

export default function AdminTiendasClient() {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (authLoading) return;
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }
    if (user && user.rol !== "administrador" && user.rol !== "root") {
      router.push("/");
    }
  }, [authLoading, isAuthenticated, user, router]);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100 text-slate-700">
        <div className="p-6 bg-white rounded-xl shadow-md text-center">
          <p className="font-semibold mb-2">Cargando sesión...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100 text-slate-700">
        <div className="p-6 bg-white rounded-xl shadow-md text-center">
          <p className="font-semibold mb-2">Debes iniciar sesión para ver esta página.</p>
          <a href="/login" className="text-blue-600 underline">
            Ir a iniciar sesión
          </a>
        </div>
      </div>
    );
  }

  if (user && user.rol !== "administrador" && user.rol !== "root") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100 text-slate-700">
        <div className="p-6 bg-white rounded-xl shadow-md text-center">
          <p className="font-semibold mb-2">Acceso denegado.</p>
          <p>Solo administradores y root pueden acceder a esta sección.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <ManageStores backHref="/admin" titulo="Gestión de tiendas" />
      </main>
    </div>
  );
}
