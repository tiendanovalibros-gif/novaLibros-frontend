"use client";

import { useEffect } from "react";
import { useAuth } from "@/context/auth.context";
import { useRouter } from "next/navigation";
import ManageStores from "@/sections/tiendas/manage-stores";

export default function RootTiendasPage() {
  const { user, isAuthenticated, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (!isAuthenticated) { router.push("/login"); return; }
    if (user?.rol !== "root") { router.push("/"); return; }
  }, [loading, isAuthenticated, user?.rol, router]);

  if (loading || !isAuthenticated || user?.rol !== "root") return null;

  return (
    <div className="min-h-screen bg-slate-50">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        <ManageStores backHref="/root" titulo="Gestión de tiendas" />
      </main>
    </div>
  );
}
