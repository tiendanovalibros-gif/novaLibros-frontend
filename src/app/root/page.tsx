"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/auth.context";
import { useRouter } from "next/navigation";
import Iconify from "@/components/iconify/iconify";
import Link from "next/link";
import { apiFetch } from "@/services/api.client";

const managementCards = [
  {
    title: "Gestionar Administradores",
    description: "Controle el acceso de los administradores y supervise permisos y actividad.",
    href: "/root/administradores",
    icon: "mdi:shield-account",
    iconClass: "bg-blue-50 text-blue-700",
  },
  {
    title: "Gestionar Libros",
    description: "Supervision total del catalogo bibliografico y sus inventarios.",
    href: "/root/libros",
    icon: "mdi:book-open-page-variant",
    iconClass: "bg-blue-50 text-blue-700",
  },
  {
    title: "Gestionar Tiendas",
    description: "Administre ubicaciones fisicas, rendimiento de ventas y operatividad.",
    href: "/root/tiendas",
    icon: "mdi:storefront-outline",
    iconClass: "bg-blue-50 text-blue-700",
  },
  {
    title: "Bandeja de soporte",
    description: "Revise y responda los chats de soporte abiertos por los clientes.",
    href: "/admin/soporte",
    icon: "solar:chat-round-line-bold",
    iconClass: "bg-emerald-50 text-emerald-700",
  },
];

export default function AdminLibrosPage() {
  const { user, isAuthenticated, loading } = useAuth();
  const router = useRouter();

  const [totalLibros, setTotalLibros] = useState(0);
  const [totalTiendas, setTotalTiendas] = useState(0);
  const [totalUsuarios, setTotalUsuarios] = useState(0);
  const [totalAdministradores, setTotalAdministradores] = useState(0);

  useEffect(() => {
    const cargarLibros = async () => {
      try {
        const libros = await apiFetch<Libro[]>("/libros");
        const tiendas = await apiFetch<Tienda[]>("/tiendas");
        const usuarios = await apiFetch<Usuario[]>("/users");
        setTotalTiendas(tiendas.length);
        setTotalUsuarios(usuarios.filter(u => u.rol === "cliente").length);
        setTotalAdministradores(usuarios.filter(u => u.rol === "administrador").length);
        setTotalLibros(libros.length);
      } catch (error) {
        console.error(error);
      }
    };

    cargarLibros();
  }, []);

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
        <div className="flex flex-col gap-10">
          <section className="flex flex-col gap-6">
            <div>
              <h1 className="text-slate-900 text-2xl sm:text-3xl font-bold">
                Bienvenido al panel de supervisión de NovaLibros
              </h1>
              <p className="text-slate-500 text-sm mt-1">
                Supervise y controle el ecosistema Novalibros desde su panel central.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {managementCards.map(card => (
                <div
                  key={card.title}
                  className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col gap-4"
                >
                  <div
                    className={`h-12 w-12 rounded-2xl inline-flex items-center justify-center ${card.iconClass}`}
                  >
                    <Iconify icon={card.icon} width={22} />
                  </div>
                  <div className="space-y-2">
                    <h2 className="text-slate-900 text-2xl font-semibold">{card.title}</h2>
                    <p className="text-slate-500 text-sm leading-relaxed">{card.description}</p>
                  </div>
                  <Link
                    href={card.href}
                    className="mt-auto inline-flex items-center justify-center px-4 py-2 rounded-lg text-md font-semibold bg-blue-500 text-white hover:bg-blue-600 transition-colors"
                  >
                    Ir a gestion
                  </Link>
                </div>
              ))}
            </div>
          </section>
          <section className="flex flex-col gap-6">
            <div>
              <h1 className="text-slate-900 text-2xl sm:text-3xl font-bold">
                Resumen de la plataforma
              </h1>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col gap-4">
                <h1>Total Libros</h1>
                <div className="h-12 w-12 rounded-2xl inline-flex items-center justify-center ">
                  <h1 className="text-slate-900 text-5xl font-semibold">{totalLibros}</h1>
                </div>
              </div>
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col gap-4">
                <h1>Total Tiendas</h1>
                <div className="h-12 w-12 rounded-2xl inline-flex items-center justify-center ">
                  <h1 className="text-slate-900 text-5xl font-semibold">{totalTiendas}</h1>
                </div>
              </div>
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col gap-4">
                <h1>Total Usuarios</h1>
                <div className="h-12 w-12 rounded-2xl inline-flex items-center justify-center ">
                  <h1 className="text-slate-900 text-5xl font-semibold">{totalUsuarios}</h1>
                </div>
              </div>
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col gap-4">
                <h1>Total Administradores</h1>
                <div className="h-12 w-12 rounded-2xl inline-flex items-center justify-center ">
                  <h1 className="text-slate-900 text-5xl font-semibold">{totalAdministradores}</h1>
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
