"use client";

import { useState } from "react";
import Iconify from "@/components/iconify/iconify";
import { apiFetch } from "@/services/api.client";

type AdminRegisterProps = {
  onCreated?: () => void;
};

const initialAdminForm = {
  dni: "",
  nombre: "",
  apellido: "",
  fechaNacimiento: "",
  correo: "",
  contrasenaHash: "",
  direccion: "",
  telefono: "",
  estadoCuenta: true,
};

const requiredFields: Array<{ key: keyof typeof initialAdminForm; message: string }> = [
  { key: "dni", message: "El DNI es requerido" },
  { key: "nombre", message: "El nombre es requerido" },
  { key: "apellido", message: "El apellido es requerido" },
  { key: "fechaNacimiento", message: "La fecha de nacimiento es requerida" },
  { key: "correo", message: "El correo es requerido" },
  { key: "contrasenaHash", message: "La contraseña es requerida" },
  { key: "direccion", message: "La dirección es requerida" },
];

const getValidationError = (form: typeof initialAdminForm): string => {
  for (const field of requiredFields) {
    const value = form[field.key];
    if (typeof value === "string" && !value.trim()) {
      return field.message;
    }
  }
  return "";
};

export const AdminRegister = ({ onCreated }: AdminRegisterProps) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);
  const [adminForm, setAdminForm] = useState(initialAdminForm);

  const closeDialog = () => {
    setDialogOpen(false);
    setFormError("");
  };

  const openDialog = () => {
    setAdminForm(initialAdminForm);
    setFormError("");
    setDialogOpen(true);
  };

  const setF = (key: string, value: string | boolean) =>
    setAdminForm(prev => ({ ...prev, [key]: value }));

  const handleCrearAdmin = async () => {
    const validationError = getValidationError(adminForm);
    if (validationError) {
      setFormError(validationError);
      return;
    }

    setSaving(true);
    setFormError("");

    try {
      await apiFetch("/users/register-admin", {
        method: "POST",
        body: JSON.stringify(adminForm),
      });
      closeDialog();
      onCreated?.();
    } catch (e: any) {
      setFormError(e?.message ?? "Error al crear el administrador");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <button
        onClick={openDialog}
        className="flex items-center gap-2 px-4 py-2 bg-blue-600 rounded-lg text-sm font-semibold text-white hover:bg-blue-700 transition-colors"
      >
        <Iconify icon="ic:baseline-plus" />
        Crear administrador
      </button>

      {dialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            onClick={closeDialog}
          />
          <div
            className="relative bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 sticky top-0 bg-white rounded-t-2xl z-10">
              <h3 className="text-slate-900 font-bold text-lg">Crear administrador</h3>
              <button
                onClick={closeDialog}
                className="inline-flex h-8 w-8 items-center justify-center text-slate-400 leading-none transition-colors hover:text-slate-600"
              >
                <Iconify icon="material-symbols:close" />
              </button>
            </div>
            <div className="p-6">
              <div className="flex flex-col gap-4">
                {formError && (
                  <div className="bg-red-50 border border-red-300 rounded-lg px-4 py-3 text-red-800 text-sm">
                    {formError}
                  </div>
                )}
                <div>
                  <label className="block text-slate-700 text-sm font-semibold mb-1.5">DNI</label>
                  <input
                    value={adminForm.dni}
                    onChange={e => setF("dni", e.target.value)}
                    placeholder="1234567890"
                    className="w-full px-3 py-2.5 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors disabled:bg-slate-50 disabled:text-slate-500"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-700 text-sm font-semibold mb-1.5">
                      Nombre
                    </label>
                    <input
                      value={adminForm.nombre}
                      onChange={e => setF("nombre", e.target.value)}
                      placeholder="Juan"
                      className="w-full px-3 py-2.5 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors disabled:bg-slate-50 disabled:text-slate-500"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 text-sm font-semibold mb-1.5">
                      Apellido
                    </label>
                    <input
                      value={adminForm.apellido}
                      onChange={e => setF("apellido", e.target.value)}
                      placeholder="Pérez"
                      className="w-full px-3 py-2.5 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors disabled:bg-slate-50 disabled:text-slate-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-slate-700 text-sm font-semibold mb-1.5">
                    Fecha de nacimiento
                  </label>
                  <input
                    type="date"
                    value={adminForm.fechaNacimiento}
                    onChange={e => setF("fechaNacimiento", e.target.value)}
                    className="w-full px-3 py-2.5 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors disabled:bg-slate-50 disabled:text-slate-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 text-sm font-semibold mb-1.5">
                    Correo
                  </label>
                  <input
                    type="email"
                    value={adminForm.correo}
                    onChange={e => setF("correo", e.target.value)}
                    placeholder="juan@email.com"
                    className="w-full px-3 py-2.5 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors disabled:bg-slate-50 disabled:text-slate-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 text-sm font-semibold mb-1.5">
                    Contraseña
                  </label>
                  <input
                    type="password"
                    value={adminForm.contrasenaHash}
                    onChange={e => setF("contrasenaHash", e.target.value)}
                    placeholder="********"
                    className="w-full px-3 py-2.5 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors disabled:bg-slate-50 disabled:text-slate-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 text-sm font-semibold mb-1.5">
                    Dirección
                  </label>
                  <input
                    value={adminForm.direccion}
                    onChange={e => setF("direccion", e.target.value)}
                    placeholder="Calle 123"
                    className="w-full px-3 py-2.5 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors disabled:bg-slate-50 disabled:text-slate-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 text-sm font-semibold mb-1.5">
                    Teléfono
                  </label>
                  <input
                    value={adminForm.telefono}
                    onChange={e => setF("telefono", e.target.value)}
                    placeholder="3001234567"
                    className="w-full px-3 py-2.5 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors disabled:bg-slate-50 disabled:text-slate-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 text-sm font-semibold mb-1.5">
                    Estado de cuenta
                  </label>
                  <select
                    value={adminForm.estadoCuenta ? "true" : "false"}
                    onChange={e => setF("estadoCuenta", e.target.value === "true")}
                    className="w-full px-3 py-2.5 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors disabled:bg-slate-50"
                  >
                    <option value="true">Activa</option>
                    <option value="false">Inactiva</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-3 justify-end mt-6 pt-4 border-t border-slate-100">
                <button
                  onClick={closeDialog}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleCrearAdmin}
                  disabled={saving}
                  className="px-5 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 disabled:opacity-60 transition-colors"
                >
                  {saving ? "Creando..." : "Crear administrador"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
