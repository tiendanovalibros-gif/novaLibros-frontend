import { useState } from "react";
import { forgotPassword } from "@/services/auth.service";

export function useStepEmail(onNext: (email: string) => void) {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (value: string) => {
    setEmail(value);
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!email.trim() || !/\S+@\S+\.\S+/.test(email)) {
      setError("Ingresa un correo electrónico válido.");
      return;
    }
    setLoading(true);
    try {
      await forgotPassword(email);
      onNext(email);
    } catch {
      setError("Ocurrió un error. Inténtalo de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  return { email, error, loading, handleChange, handleSubmit };
}
