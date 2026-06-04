"use client";

import { useAuth } from "@/context/auth.context";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import AdminBandeja from "@/sections/soporte/admin-bandeja";

export default function AdminSoportePage() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) router.replace("/login");
    else if (user && user.rol !== "administrador" && user.rol !== "root") {
      router.replace("/");
    }
  }, [isAuthenticated, user, router]);

  if (!isAuthenticated || !user) return null;
  if (user.rol !== "administrador" && user.rol !== "root") return null;

  return <AdminBandeja chatHref={(id) => `/admin/soporte/${id}`} />;
}
