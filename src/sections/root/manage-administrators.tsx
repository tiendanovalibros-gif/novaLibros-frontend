"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/auth.context";
import { useRouter } from "next/navigation";
import type { Usuario } from "@/services/auth.service";
import { apiFetch } from "@/services/api.client";
import { AdminRegister } from "@/components/root/admin-register";
import Iconify from "@/components/iconify/iconify";

export default function ManageAdministrators() {
  const { user } = useAuth();
  const router = useRouter();
  const [administrators, setAdministrators] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);
  const [adminToDelete, setAdminToDelete] = useState<Usuario | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  useEffect(() => {
    if (!user) return;
    if (user.rol !== "root") {
      router.push("/");
      return;
    }
    fetchAdministrators();
  }, [user, router, refreshKey]);

  const fetchAdministrators = async () => {
    setError("");
    setLoading(true);
    try {
      const response = await apiFetch<Usuario[]>("/users");
      setAdministrators(response.filter(u => u.rol === "administrador"));
    } catch (err) {
      setError((err as Error).message || "No se pudieron cargar los administradores.");
    } finally {
      setLoading(false);
    }
  };
  const handleAdminCreated = () => {
    setRefreshKey(prev => prev + 1);
  };

  const openDeleteModal = (admin: Usuario) => {
    setDeleteError("");
    setAdminToDelete(admin);
  };

  const closeDeleteModal = () => {
    setAdminToDelete(null);
    setDeleteError("");
  };

  const handleDeleteAdmin = async () => {
    if (!adminToDelete) return;
    setDeleting(true);
    setDeleteError("");

    try {
      await apiFetch(`/users/${adminToDelete.id}`, {
        method: "DELETE",
      });

      setAdministrators(prev => prev.filter(admin => admin.id !== adminToDelete.id));

      closeDeleteModal();
    } catch (err) {
      setDeleteError((err as Error).message || "No se pudo eliminar el administrador.");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-slate-900 text-2xl font-bold">Administradores</h1>
          <p className="text-slate-500 text-sm mt-0.5">
            Gestiona usuarios con permisos administrativos
          </p>
        </div>
        <AdminRegister onCreated={handleAdminCreated} />
      </div>
      <section className="mt-8 bg-white rounded-2xl shadow-sm border border-slate-200">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 px-6 py-4 border-b border-slate-200">
          <div>
            <h2 className="text-slate-900 font-semibold">Lista de administradores</h2>
            <p className="text-xs text-slate-500 mt-0.5">Información básica de contacto</p>
          </div>
          <span className="text-xs text-slate-500">
            {loading ? "Cargando..." : `${administrators.length} registrados`}
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50 text-slate-600">
              <tr>
                <th className="text-left font-semibold px-6 py-3">Nombre</th>
                <th className="text-left font-semibold px-6 py-3">Apellido</th>
                <th className="text-left font-semibold px-6 py-3">Teléfono</th>
                <th className="text-left font-semibold px-6 py-3">Correo</th>
                <th className="text-left font-semibold px-6 py-3">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-6 text-center text-slate-500">
                    Cargando administradores...
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={5} className="px-6 py-6 text-center text-red-600">
                    {error}
                  </td>
                </tr>
              ) : administrators.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-6 text-center text-slate-500">
                    No hay administradores registrados.
                  </td>
                </tr>
              ) : (
                administrators.map(admin => (
                  <tr key={admin.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-3.5 text-slate-900 font-medium">{admin.nombre}</td>
                    <td className="px-6 py-3.5 text-slate-900">{admin.apellido}</td>
                    <td className="px-6 py-3.5 text-slate-700">{admin.telefono ?? "—"}</td>
                    <td className="px-6 py-3.5 text-slate-700">{admin.correo}</td>
                    <td className="px-6 py-3.5">
                      <button
                        onClick={() => openDeleteModal(admin)}
                        title="Eliminar"
                        className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <Iconify icon="mdi:trash-can-outline" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
      {adminToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            onClick={closeDeleteModal}
          />

          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
              <h2 className="text-lg font-bold text-slate-900">Eliminar administrador</h2>

              <button onClick={closeDeleteModal} className="text-slate-400 hover:text-slate-600">
                <Iconify icon="material-symbols:close" />
              </button>
            </div>

            <div className="p-6">
              <p className="text-slate-600">Está a punto de eliminar un administrador:</p>

              <div className="mt-4 p-4 rounded-xl bg-slate-50 border border-slate-200">
                <p className="font-semibold text-slate-900">
                  {adminToDelete.nombre} {adminToDelete.apellido}
                </p>

                <p className="text-sm text-slate-500 mt-1">{adminToDelete.correo}</p>
              </div>

              {deleteError && (
                <div className="mt-4 bg-red-50 border border-red-300 rounded-lg px-4 py-3 text-sm text-red-700">
                  {deleteError}
                </div>
              )}

              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={closeDeleteModal}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  Cancelar
                </button>

                <button
                  onClick={handleDeleteAdmin}
                  disabled={deleting}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-60 transition-colors"
                >
                  {deleting ? "Eliminando..." : "Eliminar"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
