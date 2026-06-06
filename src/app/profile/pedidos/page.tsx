import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import Link from "next/link";
import MisPedidos from "@/sections/pedidos/mis-pedidos";

export const dynamic = "force-dynamic";

export default function PedidosPage() {
  const token = cookies().get("auth_token")?.value;
  if (!token) redirect("/login");

  return (
    <div className="min-h-screen bg-slate-50">
      <main className="mx-auto max-w-2xl px-4 pt-8 pb-16">
        <div className="mb-6 flex items-center gap-2 text-sm text-slate-600">
          <Link href="/profile" className="hover:text-blue-600">
            Perfil
          </Link>
          <span>›</span>
          <span className="font-semibold text-slate-900">Mis compras</span>
        </div>

        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-900">Historial de compras</h1>
          <p className="text-sm text-slate-600">
            Revisa tus pedidos, genera facturas y gestiona devoluciones.
          </p>
        </div>

        <MisPedidos />
      </main>
    </div>
  );
}
