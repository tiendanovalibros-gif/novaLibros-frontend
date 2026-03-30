import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth.context";

export function useLogin() {
  const router = useRouter();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const validate = (): boolean => {
    if (!email || !password) {
      setError("Por favor completa todos los campos.");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!validate()) return;

    setLoading(true);
    try {
      const user = await login({ correo: email, contrasena: password });
      router.push(user.rol === "root" ? "/root" : "/");
    } catch (err) {
      console.error("Login error", err);
      setError("Credenciales incorrectas.");
    } finally {
      setLoading(false);
    }
  };

  return {
    email,
    setEmail,
    password,
    setPassword,
    error,
    loading,
    showPassword,
    setShowPassword,
    handleSubmit,
  };
}
