import { useEffect, useState } from "react";
import { useAuth } from "@/context/auth.context";
import type { Usuario, UpdateProfilePayload } from "@/services/auth.service";

interface UseProfileEditOptions {
  user: Usuario | null;
  open: boolean;
  onSuccess?: () => void;
}

export function useProfileEdit({ user, open, onSuccess }: UseProfileEditOptions) {
  const { updateProfile } = useAuth();

  const [correo, setCorreo] = useState("");
  const [telefono, setTelefono] = useState("");
  const [direccion, setDireccion] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open || !user) return;
    setCorreo(user.correo ?? "");
    setTelefono(user.telefono ?? "");
    setDireccion(user.direccion ?? "");
    setError("");
  }, [open, user]);

  const validate = (): boolean => {
    if (!correo.trim() || !/\S+@\S+\.\S+/.test(correo)) {
      setError("Ingresa un correo valido.");
      return false;
    }
    return true;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");

    if (!user) {
      setError("Usuario no disponible.");
      return;
    }

    if (!validate()) return;

    const payload: UpdateProfilePayload = {
      correo: correo.trim(),
      telefono: telefono.trim() || undefined,
      direccion: direccion.trim() || undefined,
    };

    setSaving(true);
    try {
      await updateProfile(user.id, payload);
      onSuccess?.();
    } catch (err) {
      const message =
        typeof err === "object" && err && "message" in err
          ? String((err as { message?: string }).message)
          : "No se pudo actualizar tu informacion.";
      setError(message);
    } finally {
      setSaving(false);
    }
  };

  return {
    correo,
    setCorreo,
    telefono,
    setTelefono,
    direccion,
    setDireccion,
    error,
    saving,
    handleSubmit,
  };
}
