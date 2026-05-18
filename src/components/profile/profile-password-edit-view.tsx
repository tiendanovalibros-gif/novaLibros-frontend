"use client";

import { useEffect, useState } from "react";
import Iconify from "@/components/iconify/iconify";
import { getStrengthInfo, validatePassword } from "@/utils/password.utils";

type ProfilePasswordEditViewProps = {
  open: boolean;
  onClose: () => void;
  onSubmit?: (currentPassword: string, newPassword: string) => Promise<void>;
  onSaved?: () => void;
};

export default function ChangePasswordModal({
  open,
  onClose,
  onSubmit,
  onSaved,
}: ProfilePasswordEditViewProps) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setError("");
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  const strength = getStrengthInfo(newPassword.length);
  const strengthPercent =
    newPassword.length === 0 ? 0 : newPassword.length < 6 ? 35 : newPassword.length < 10 ? 65 : 100;

  const inputClass =
    "w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-[15px] text-slate-900 outline-none transition-colors focus:border-blue-600";

  const validate = (): boolean => {
    if (!currentPassword.trim()) {
      setError("Ingresa tu contrasena actual.");
      return false;
    }
    const passwordError = validatePassword(newPassword);
    if (passwordError) {
      setError(passwordError);
      return false;
    }
    if (currentPassword.trim() === newPassword.trim()) {
      setError("La nueva contrasena debe ser diferente a la actual.");
      return false;
    }
    if (!confirmPassword.trim()) {
      setError("Confirma tu nueva contrasena.");
      return false;
    }
    if (newPassword !== confirmPassword) {
      setError("Las contrasenas no coinciden.");
      return false;
    }
    return true;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");

    if (!validate()) return;
    if (!onSubmit) {
      setError("La actualizacion de contrasena no esta configurada.");
      return;
    }

    setSaving(true);
    try {
      await onSubmit(currentPassword.trim(), newPassword.trim());
      onSaved?.();
      onClose();
    } catch (err) {
      const message =
        typeof err === "object" && err && "message" in err
          ? String((err as { message?: string }).message)
          : "No se pudo actualizar la contrasena.";
      setError(message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />
      <div
        className="relative w-full max-w-xl overflow-hidden rounded-2xl bg-white shadow-xl"
        onClick={event => event.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <div>
            <h3 className="text-lg font-bold text-slate-900">Cambiar contraseña</h3>
            <p className="text-xs text-slate-500">Actualiza tu contraseña de acceso.</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-8 w-8 items-center justify-center rounded-full text-slate-400 leading-none transition-colors hover:text-slate-600"
            aria-label="Cerrar"
          >
            <Iconify icon="material-symbols:close-rounded" width={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 p-6">
          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <div>
            <label className="mb-2 block text-[14px] font-semibold text-slate-900">
              Contraseña actual
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={currentPassword}
                onChange={event => setCurrentPassword(event.target.value)}
                placeholder="Ingresa tu contraseña actual"
                className={`${inputClass} pr-12`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <Iconify
                  icon={showPassword ? "solar:eye-bold" : "solar:eye-closed-bold"}
                  width={20}
                />
              </button>
            </div>
          </div>

          <div>
            <label className="mb-2 block text-[14px] font-semibold text-slate-900">
              Nueva contraseña
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={newPassword}
                onChange={event => setNewPassword(event.target.value)}
                placeholder="Minimo 8 caracteres"
                className={`${inputClass} pr-12`}
              />
            </div>
            {newPassword.length > 0 && (
              <div className="mt-2 flex items-center gap-2">
                <div className="flex-1 rounded-full bg-slate-200">
                  <div
                    className={`h-1 rounded-full transition-all ${strength.barClass}`}
                    style={{ width: `${strengthPercent}%` }}
                  />
                </div>
                <span className={`text-xs font-semibold ${strength.textClass}`}>
                  {strength.label}
                </span>
              </div>
            )}
          </div>

          <div>
            <label className="mb-2 block text-[14px] font-semibold text-slate-900">
              Confirmar contraseña
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={event => setConfirmPassword(event.target.value)}
                placeholder="Repite la nueva contraseña"
                className={`${inputClass} pr-12`}
              />
            </div>
          </div>

          <div className="flex flex-wrap justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-[14px] font-semibold text-slate-700 transition-colors hover:bg-slate-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="rounded-lg bg-blue-600 px-5 py-2.5 text-[14px] font-semibold text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
            >
              {saving ? "Guardando..." : "Guardar cambios"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
