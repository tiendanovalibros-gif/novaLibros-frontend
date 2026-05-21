"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth.context";
import MisReservas from "@/sections/reservas/mis-reservas";

export default function ReservasPage() {
  const router = useRouter();
  const { user, isAuthenticated, loading: authLoading } = useAuth();

  useEffect(() => {
    if (authLoading) return;
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }
    if (user?.rol !== "cliente") {
      router.push("/");
    }
  }, [authLoading, isAuthenticated, user?.rol, router]);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center text-slate-600 text-sm">
        Cargando...
      </div>
    );
  }

  if (!isAuthenticated || user?.rol !== "cliente") {
    return null;
  }

  return (
    <main className="min-h-screen bg-slate-50 max-w-4xl mx-auto px-4 sm:px-6 py-8">
      <MisReservas />
    </main>
  );
}
