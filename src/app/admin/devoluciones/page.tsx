import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import AdminDevoluciones from "@/sections/admin/devoluciones/admin-devoluciones";

export const dynamic = "force-dynamic";

export default function AdminDevolucionesPage() {
  const token = cookies().get("auth_token")?.value;
  if (!token) redirect("/login");

  return (
    <div className="min-h-screen bg-slate-50">
      <main className="mx-auto max-w-3xl px-4 pt-8 pb-16">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-900">Gestión de devoluciones</h1>
          <p className="text-sm text-slate-600">
            Revisa, aprueba o rechaza las solicitudes de devolución.
          </p>
        </div>
        <AdminDevoluciones />
      </main>
    </div>
  );
}
