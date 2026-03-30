import { useState } from "react";
import { getStrengthInfo, validatePassword } from "@/utils/password.utils";

export function useStepNewPassword(onDone: () => void) {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ password?: string; confirm?: string }>({});

  const strength = getStrengthInfo(password.length);

  const validate = (): boolean => {
    const e: typeof errors = {};
    const passwordError = validatePassword(password);
    if (passwordError) e.password = passwordError;
    if (!confirm.trim()) e.confirm = "Campo requerido";
    else if (password !== confirm) e.confirm = "Las contraseñas no coinciden";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      // TODO: await resetPassword(token, password) desde auth.service.ts
      await new Promise(r => setTimeout(r, 1200));
      onDone();
    } finally {
      setLoading(false);
    }
  };

  return {
    password,
    setPassword,
    confirm,
    setConfirm,
    showPassword,
    setShowPassword,
    showConfirm,
    setShowConfirm,
    loading,
    errors,
    setErrors,
    strength,
    handleSubmit,
  };
}
