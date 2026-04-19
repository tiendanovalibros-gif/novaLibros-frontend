"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Iconify from "@/components/iconify/iconify";
import { useAuth } from "@/context/auth.context";

const MenuIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
    <line
      x1="3"
      y1="6"
      x2="21"
      y2="6"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
    <line
      x1="3"
      y1="12"
      x2="21"
      y2="12"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
    <line
      x1="3"
      y1="18"
      x2="21"
      y2="18"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
  </svg>
);

const CloseIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
    <line
      x1="18"
      y1="6"
      x2="6"
      y2="18"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
    <line
      x1="6"
      y1="6"
      x2="18"
      y2="18"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
  </svg>
);

export default function MainNavbar() {
  const [menuAbierto, setMenuAbierto] = useState(false);
  const [menuUsuarioAbierto, setMenuUsuarioAbierto] = useState(false);
  const menuUsuarioRef = useRef<HTMLDivElement>(null);

  const { user, isAuthenticated, logout, refreshUser } = useAuth();
  const nombreVisible = user?.nombre ? `${user.nombre} ${user.apellido}`.trim() : "";
  const inicialesPerfil = user
    ? `${user.nombre?.charAt(0).toUpperCase() ?? ""}${user.apellido?.charAt(0).toUpperCase() ?? ""}`
    : "";

  useEffect(() => {
    if (isAuthenticated) {
      void refreshUser();
    }
  }, [isAuthenticated, refreshUser]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuUsuarioRef.current && !menuUsuarioRef.current.contains(event.target as Node)) {
        setMenuUsuarioAbierto(false);
      }
    };

    if (menuUsuarioAbierto) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [menuUsuarioAbierto]);

  return (
    <nav className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3">
          <div className="w-9 h-9 bg-blue-600 rounded-lg flex items-center justify-center shrink-0">
            <Iconify icon="solar:book-2-bold" className="text-white" width={24} />
          </div>
          <span className="text-slate-900 text-xl font-bold tracking-tight">NovaLibros</span>
        </Link>

        <div className="hidden sm:flex items-center gap-3">
          {isAuthenticated ? (
            <>
              {user?.rol === "administrador" || user?.rol === "root" ? (
                <a
                  href="/admin"
                  className="px-3 py-2 border border-slate-300 rounded-lg text-sm font-semibold text-slate-800 hover:bg-slate-50 transition-colors flex items-center gap-2"
                  title="Dashboard de administración"
                >
                  🛠️ Admin
                </a>
              ) : (
                <Link
                  href="/carrito"
                  className="px-3 py-2 rounded-full text-sm font-semibold text-slate-800 hover:bg-slate-100 transition-colors flex items-center gap-2"
                  title="Carrito"
                >
                  <Iconify icon="material-symbols:shopping-cart-outline-rounded" />
                </Link>
              )}

              <button
                className="px-3 py-2 rounded-full text-sm font-semibold text-slate-800 hover:bg-slate-100 transition-colors relative"
                title="Notificaciones"
              >
                <Iconify icon="material-symbols:notifications-outline" />
                <span className="absolute -top-1 -right-1 w-4 h-4 text-[10px] leading-4 rounded-full bg-red-500 text-white flex items-center justify-center">
                  3
                </span>
              </button>

              <div ref={menuUsuarioRef} className="relative">
                <button
                  onClick={() => setMenuUsuarioAbierto(!menuUsuarioAbierto)}
                  className="flex items-center gap-2 px-3 py-2 rounded-full bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  <span className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm">
                    {inicialesPerfil || "U"}
                  </span>
                  <span className="text-sm font-semibold text-slate-700 truncate max-w-[120px]">
                    {nombreVisible || "Usuario"}
                  </span>
                  <Iconify
                    icon="solar:alt-arrow-down-linear"
                    className={`text-slate-600 transition-transform ${menuUsuarioAbierto ? "rotate-180" : ""}`}
                    width={16}
                  />
                </button>

                {menuUsuarioAbierto && (
                  <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-lg border border-slate-200 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="px-4 py-3 border-b border-slate-100">
                      <p className="text-sm font-semibold text-slate-900">
                        {nombreVisible || "Usuario"}
                      </p>
                      <p className="text-xs text-slate-500 truncate">{user?.correo}</p>
                    </div>

                    <div className="py-1">
                      <Link
                        href="/profile"
                        onClick={() => setMenuUsuarioAbierto(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                      >
                        <Iconify icon="gg:profile" width={20} />
                        <span className="font-medium">Mi Perfil</span>
                      </Link>

                      <button
                        onClick={() => {
                          setMenuUsuarioAbierto(false);
                          void logout();
                        }}
                        className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <Iconify icon="material-symbols:logout-rounded" width={20} />
                        <span className="font-medium">Cerrar sesión</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <a
                href="/login"
                className="px-4 py-2 border border-slate-300 rounded-lg text-sm font-semibold text-slate-800 hover:bg-slate-50 transition-colors"
              >
                Iniciar sesión
              </a>
              <a
                href="/register"
                className="px-4 py-2 bg-blue-600 rounded-lg text-sm font-semibold text-white hover:bg-blue-700 transition-colors"
              >
                Registrarse
              </a>
            </>
          )}
        </div>

        <button
          className="sm:hidden text-slate-700 p-1"
          onClick={() => setMenuAbierto(!menuAbierto)}
        >
          {menuAbierto ? <CloseIcon /> : <MenuIcon />}
        </button>
      </div>

      {menuAbierto && (
        <div className="sm:hidden bg-white border-t border-slate-100 px-4 py-4 flex flex-col gap-3">
          {isAuthenticated ? (
            <>
              {user?.rol === "root" || user?.rol === "administrador" ? (
                <a
                  href="/admin"
                  className="w-full text-center py-2.5 border border-slate-300 rounded-lg text-sm font-semibold text-slate-800"
                >
                  Dashboard Admin
                </a>
              ) : (
                <a
                  href="/carrito"
                  className="w-full text-center py-2.5 border border-slate-300 rounded-lg text-sm font-semibold text-slate-800"
                >
                  Carrito
                </a>
              )}
              <Link
                href="/profile"
                className="w-full text-center py-2.5 border border-slate-300 rounded-lg text-sm font-semibold text-slate-800"
              >
                Perfil
              </Link>
              <button
                className="w-full text-center py-2.5 bg-red-100 text-red-700 rounded-lg font-semibold"
                onClick={() => void logout()}
              >
                Cerrar sesión
              </button>
            </>
          ) : (
            <>
              <a
                href="/login"
                className="w-full text-center py-2.5 border border-slate-300 rounded-lg text-sm font-semibold text-slate-800"
              >
                Iniciar sesión
              </a>
              <a
                href="/register"
                className="w-full text-center py-2.5 bg-blue-600 rounded-lg text-sm font-semibold text-white"
              >
                Registrarse
              </a>
            </>
          )}
        </div>
      )}
    </nav>
  );
}
