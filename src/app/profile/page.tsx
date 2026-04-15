"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/auth.context";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Iconify from "@/components/iconify/iconify";
import { apiFetch } from "@/services/api.client";
import { getProfile, type Usuario } from "@/services/auth.service";
import ProfileEditView from "./profile-edit-view";

// ═══════════════════════════════════════════════════════════════════════════════
// TIPOS E INTERFACES
// ═══════════════════════════════════════════════════════════════════════════════

interface Preferencia {
  idGenero: number;
  genero?: {
    id: number;
    nombre: string;
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// COMPONENTE PRINCIPAL
// ═══════════════════════════════════════════════════════════════════════════════

export default function ProfilePage() {
  // ─────────────────────────────────────────────────────────────────────────────
  // Estado y Hooks
  // ─────────────────────────────────────────────────────────────────────────────
  const { loading, isAuthenticated, logout } = useAuth();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [profile, setProfile] = useState<Usuario | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [profileError, setProfileError] = useState("");
  const [preferencias, setPreferencias] = useState<Preferencia[]>([]);
  const [loadingPreferencias, setLoadingPreferencias] = useState(true);
  const [editOpen, setEditOpen] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");

  // ─────────────────────────────────────────────────────────────────────────────
  // Efectos
  // ─────────────────────────────────────────────────────────────────────────────
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && !loading && !isAuthenticated) {
      router.push("/login");
    }
  }, [mounted, loading, isAuthenticated, router]);

  useEffect(() => {
    if (!mounted || loading || !isAuthenticated) return;
    cargarPerfil();
  }, [mounted, loading, isAuthenticated]);

  useEffect(() => {
    if (profile?.id) {
      cargarPreferencias(profile.id);
    }
  }, [profile?.id]);

  useEffect(() => {
    if (!saveMessage) return;
    const timer = setTimeout(() => setSaveMessage(""), 4000);
    return () => clearTimeout(timer);
  }, [saveMessage]);

  // ─────────────────────────────────────────────────────────────────────────────
  // Funciones
  // ─────────────────────────────────────────────────────────────────────────────
  const cargarPreferencias = async (userId: string) => {
    try {
      setLoadingPreferencias(true);
      const data = await apiFetch<Preferencia[]>(`/usuarios-preferencias/${userId}`);
      setPreferencias(data);
    } catch (error) {
      console.error("Error al cargar preferencias:", error);
    } finally {
      setLoadingPreferencias(false);
    }
  };

  const cargarPerfil = async () => {
    try {
      setLoadingProfile(true);
      setProfileError("");
      const data = await getProfile();
      setProfile(data);
    } catch (error) {
      console.error("Error al cargar perfil:", error);
      setProfileError("No se pudo cargar el perfil.");
    } finally {
      setLoadingProfile(false);
    }
  };

  const formatearFecha = (fecha: string | null | undefined) => {
    if (!fecha) return "No especificado";
    try {
      return new Date(fecha).toLocaleDateString("es-ES", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch {
      return "Fecha inválida";
    }
  };

  const formatearGenero = (genero: string | null | undefined) => {
    if (!genero) return "No especificado";
    const generos: Record<string, string> = {
      masculino: "Masculino",
      femenino: "Femenino",
      otro: "Otro",
    };
    return generos[genero.toLowerCase()] || genero;
  };

  const formatearRol = (rol: string) => {
    if (rol === "usuario") return "Usuario";
    if (rol === "administrador") return "Administrador";
    if (rol === "root") return "Root";
    return rol;
  };

  const handleEditSaved = async () => {
    await cargarPerfil();
    setSaveMessage("Informacion actualizada correctamente.");
  };

  // ─────────────────────────────────────────────────────────────────────────────
  // Datos Derivados
  // ─────────────────────────────────────────────────────────────────────────────
  const nombreCompleto = profile ? `${profile.nombre} ${profile.apellido}`.trim() : "";
  const iniciales = profile
    ? `${profile.nombre?.charAt(0).toUpperCase() ?? ""}${profile.apellido?.charAt(0).toUpperCase() ?? ""}`
    : "";

  const infoItems = profile
    ? [
        {
          icon: "solar:user-id-bold-duotone",
          label: "Nombre completo",
          value: nombreCompleto || "No especificado",
        },
        {
          icon: "solar:letter-bold-duotone",
          label: "Correo electrónico",
          value: profile.correo,
        },
        {
          icon: "solar:phone-bold-duotone",
          label: "Teléfono",
          value: profile.telefono || "No especificado",
        },
        {
          icon: "solar:calendar-bold-duotone",
          label: "Fecha de nacimiento",
          value: formatearFecha(profile.fechaNacimiento),
        },
        {
          icon: "solar:user-bold-duotone",
          label: "Género",
          value: formatearGenero(profile.genero),
        },
        {
          icon: "solar:shield-user-bold-duotone",
          label: "Rol",
          value: formatearRol(profile.rol),
        },
      ]
    : [];

  const stats = [
    {
      icon: "solar:book-bold-duotone",
      label: "Libros Favoritos",
      value: "0",
      color: "bg-blue-50 text-blue-600",
      iconColor: "text-blue-600",
    },
    {
      icon: "solar:cart-large-2-bold-duotone",
      label: "Compras Realizadas",
      value: "0",
      color: "bg-green-50 text-green-600",
      iconColor: "text-green-600",
    },
    {
      icon: "solar:star-bold-duotone",
      label: "Reseñas Escritas",
      value: "0",
      color: "bg-yellow-50 text-yellow-600",
      iconColor: "text-yellow-600",
    },
    {
      icon: "solar:heart-bold-duotone",
      label: "Lista de Deseos",
      value: "0",
      color: "bg-red-50 text-red-600",
      iconColor: "text-red-600",
    },
  ];

  // ─────────────────────────────────────────────────────────────────────────────
  // Estados de carga y validación
  // ─────────────────────────────────────────────────────────────────────────────
  if (!mounted || loading || loadingProfile) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="mx-auto mb-4 h-16 w-16 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
          <p className="text-sm font-semibold text-slate-600">Cargando perfil...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
        <div className="max-w-md rounded-xl border border-slate-200 bg-white p-6 text-center shadow-sm">
          <p className="text-sm font-semibold text-slate-700">Perfil no disponible</p>
          <p className="mt-2 text-sm text-slate-500">{profileError || "Intenta nuevamente mas tarde."}</p>
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════════════════════════════════
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* ═══════════════════════════════════════════════════════════════════════════
          NAVBAR
      ═══════════════════════════════════════════════════════════════════════════ */}
      <nav className="border-b border-slate-200 bg-white/80 backdrop-blur-md">
        <div className="mx-auto max-w-7xl px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <div className="rounded-lg bg-blue-600 p-2">
                <Iconify icon="solar:book-2-bold" className="text-white" width={24} />
              </div>
              <span className="text-xl font-bold text-slate-900">NovaLibros</span>
            </Link>

            <div className="flex items-center gap-4">
              <button
                onClick={() => {
                  logout();
                }}
                className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
              >
                <Iconify icon="material-symbols:logout-rounded" width={20} />
                <span className="font-medium">Cerrar sesión</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* ═══════════════════════════════════════════════════════════════════════════
          CONTENIDO PRINCIPAL
      ═══════════════════════════════════════════════════════════════════════════ */}
      <main className="mx-auto max-w-7xl px-4 py-8">
        {/* Breadcrumb */}
        <div className="mb-6 flex items-center gap-2 text-sm text-slate-600">
          <Link href="/" className="hover:text-blue-600">
            Inicio
          </Link>
          <Iconify icon="solar:alt-arrow-right-linear" width={16} />
          <span className="font-semibold text-slate-900">Mi Perfil</span>
        </div>

        {/* ─────────────────────────────────────────────────────────────────────────
            HEADER DEL PERFIL
        ───────────────────────────────────────────────────────────────────────── */}
        <div className="mb-8">
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 to-blue-800 p-8 text-white shadow-xl">
            {/* Patrón decorativo */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute right-0 top-0 h-64 w-64 rounded-full bg-white blur-3xl" />
              <div className="absolute bottom-0 left-0 h-48 w-48 rounded-full bg-white blur-3xl" />
            </div>

            {/* Contenido */}
            <div className="relative flex items-center gap-6">
              {/* Avatar grande */}
              <div className="relative">
                <div className="flex h-24 w-24 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm ring-4 ring-white/30">
                  <span className="text-4xl font-bold">{iniciales || "U"}</span>
                </div>
                <div className="absolute -bottom-2 -right-2 rounded-full bg-green-500 p-2 ring-4 ring-blue-600">
                  <Iconify icon="solar:check-circle-bold" width={16} />
                </div>
              </div>

              {/* Info */}
              <div className="flex-1">
                <h1 className="mb-1 text-3xl font-bold">{nombreCompleto || "Usuario"}</h1>
                <p className="mb-3 flex items-center gap-2 text-blue-100">
                  <Iconify icon="solar:letter-bold-duotone" width={18} />
                  {profile.correo}
                </p>
                <div className="flex items-center gap-4 text-sm">
                  <span className="rounded-full bg-white/20 px-3 py-1 backdrop-blur-sm">
                    <Iconify
                      icon="solar:shield-user-bold-duotone"
                      width={16}
                      className="mr-1 inline"
                    />
                    {formatearRol(profile.rol)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {saveMessage && (
          <div className="mb-6 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            {saveMessage}
          </div>
        )}

        {/* ─────────────────────────────────────────────────────────────────────────
            GRID DE CONTENIDO
        ───────────────────────────────────────────────────────────────────────── */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* ═══════════════════════════════════════════════════════════════════════
              COLUMNA IZQUIERDA
          ═══════════════════════════════════════════════════════════════════════ */}
          <div className="space-y-6">
            {/* Información Personal */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="mb-6 flex items-center gap-3">
                <div className="rounded-lg bg-blue-50 p-2">
                  <Iconify icon="solar:user-id-bold-duotone" className="text-blue-600" width={24} />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900">Información Personal</h2>
                  <p className="text-sm text-slate-600">Datos básicos de tu cuenta</p>
                </div>
              </div>

              <div className="space-y-4">
                {infoItems.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-4 rounded-lg p-3 transition-colors hover:bg-slate-50"
                  >
                    <div className="mt-0.5 rounded-lg bg-slate-100 p-2">
                      <Iconify icon={item.icon} className="text-slate-700" width={20} />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                        {item.label}
                      </p>
                      <p className="mt-1 text-sm font-semibold text-slate-900">{item.value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Preferencias */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="mb-6 flex items-center gap-3">
                <div className="rounded-lg bg-orange-50 p-2">
                  <Iconify icon="solar:heart-bold-duotone" className="text-orange-600" width={24} />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900">Géneros Favoritos</h2>
                  <p className="text-sm text-slate-600">Tus preferencias de lectura</p>
                </div>
              </div>

              {loadingPreferencias ? (
                <div className="flex items-center justify-center py-8">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
                </div>
              ) : preferencias.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {preferencias.map(pref => (
                    <span
                      key={pref.idGenero}
                      className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-blue-50 to-purple-50 px-4 py-2 text-sm font-semibold text-slate-900 ring-1 ring-blue-200"
                    >
                      <Iconify
                        icon="solar:book-2-bold-duotone"
                        className="text-blue-600"
                        width={16}
                      />
                      {pref.genero?.nombre || `Género ${pref.idGenero}`}
                    </span>
                  ))}
                </div>
              ) : (
                <div className="rounded-lg bg-slate-50 p-8 text-center">
                  <div className="mx-auto mb-3 inline-flex rounded-full bg-slate-200 p-4">
                    <Iconify icon="solar:book-2-linear" className="text-slate-500" width={32} />
                  </div>
                  <p className="font-semibold text-slate-700">
                    No has seleccionado géneros favoritos
                  </p>
                  <p className="mt-1 text-sm text-slate-500">
                    Agrega tus géneros preferidos para recibir recomendaciones personalizadas
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* ═══════════════════════════════════════════════════════════════════════
              COLUMNA DERECHA
          ═══════════════════════════════════════════════════════════════════════ */}
          <div className="space-y-6">
            {/* Estadísticas */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="mb-6 flex items-center gap-3">
                <div className="rounded-lg bg-purple-50 p-2">
                  <Iconify icon="solar:chart-bold-duotone" className="text-purple-600" width={24} />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900">Estadísticas</h2>
                  <p className="text-sm text-slate-600">Tu actividad en NovaLibros</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {stats.map((stat, index) => (
                  <div
                    key={index}
                    className="rounded-xl border border-slate-100 bg-gradient-to-br from-slate-50 to-white p-4 transition-shadow hover:shadow-md"
                  >
                    <div className={`mb-3 inline-flex rounded-lg ${stat.color} p-2`}>
                      <Iconify icon={stat.icon} className={stat.iconColor} width={24} />
                    </div>
                    <p className="text-3xl font-bold text-slate-900">{stat.value}</p>
                    <p className="mt-1 text-sm font-medium text-slate-600">{stat.label}</p>
                  </div>
                ))}
              </div>

              <div className="mt-6 rounded-lg bg-gradient-to-r from-blue-50 to-purple-50 p-4">
                <div className="flex items-start gap-3">
                  <div className="rounded-full bg-white p-2 shadow-sm">
                    <Iconify
                      icon="solar:confetti-bold-duotone"
                      className="text-blue-600"
                      width={20}
                    />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-slate-900">¡Comienza tu aventura!</p>
                    <p className="mt-1 text-sm text-slate-600">
                      Explora nuestro catálogo y descubre tu próximo libro favorito.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Acciones Rápidas */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="mb-4 flex items-center gap-3">
                <div className="rounded-lg bg-green-50 p-2">
                  <Iconify
                    icon="solar:settings-bold-duotone"
                    className="text-green-600"
                    width={24}
                  />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900">Acciones Rápidas</h2>
                  <p className="text-sm text-slate-600">Gestiona tu cuenta</p>
                </div>
              </div>

              <div className="space-y-3">
                <button
                  onClick={() => setEditOpen(true)}
                  className="flex w-full items-center gap-3 rounded-lg border border-slate-200 bg-white p-4 text-left transition-all hover:border-blue-300 hover:bg-blue-50"
                >
                  <div className="rounded-lg bg-blue-100 p-2">
                    <Iconify icon="solar:pen-bold-duotone" className="text-blue-600" width={20} />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-slate-900">Editar Información</p>
                    <p className="text-xs text-slate-600">Actualiza tus datos personales</p>
                  </div>
                  <Iconify
                    icon="solar:alt-arrow-right-linear"
                    className="text-slate-400"
                    width={20}
                  />
                </button>

                <button className="flex w-full items-center gap-3 rounded-lg border border-slate-200 bg-white p-4 text-left transition-all hover:border-purple-300 hover:bg-purple-50">
                  <div className="rounded-lg bg-purple-100 p-2">
                    <Iconify
                      icon="solar:lock-password-bold-duotone"
                      className="text-purple-600"
                      width={20}
                    />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-slate-900">Cambiar Contraseña</p>
                    <p className="text-xs text-slate-600">Actualiza tu contraseña</p>
                  </div>
                  <Iconify
                    icon="solar:alt-arrow-right-linear"
                    className="text-slate-400"
                    width={20}
                  />
                </button>

                <button className="flex w-full items-center gap-3 rounded-lg border border-slate-200 bg-white p-4 text-left transition-all hover:border-orange-300 hover:bg-orange-50">
                  <div className="rounded-lg bg-orange-100 p-2">
                    <Iconify
                      icon="solar:heart-bold-duotone"
                      className="text-orange-600"
                      width={20}
                    />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-slate-900">Gestionar Preferencias</p>
                    <p className="text-xs text-slate-600">Actualiza tus géneros favoritos</p>
                  </div>
                  <Iconify
                    icon="solar:alt-arrow-right-linear"
                    className="text-slate-400"
                    width={20}
                  />
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* ═══════════════════════════════════════════════════════════════════════════
          FOOTER
      ═══════════════════════════════════════════════════════════════════════════ */}
      <footer className="mt-12 border-t border-slate-200 bg-white py-6">
        <div className="mx-auto max-w-7xl px-4 text-center text-sm text-slate-600">
          <p>© 2024 NovaLibros. Tu librería en línea de confianza.</p>
        </div>
      </footer>

      {profile && (
        <ProfileEditView
          open={editOpen}
          onClose={() => setEditOpen(false)}
          user={profile}
          onSaved={handleEditSaved}
        />
      )}
    </div>
  );
}
