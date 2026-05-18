"use client";

import { useEffect } from "react";
import { useAuth } from "@/context/auth.context";
import { useRouter } from "next/navigation";
import ManageBooks from "@/sections/root/manage-books";
export default function AdministradoresPage() {
  const { user, isAuthenticated, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    if (!isAuthenticated) {
      router.push("/login");
      return;
    }

    if (user?.rol !== "root") {
      router.push("/");
      return;
    }
  }, [loading, isAuthenticated, user?.rol, router]);

  return (
    <div className="min-h-screen bg-slate-50">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        <ManageBooks />
      </main>
    </div>
  );
}
