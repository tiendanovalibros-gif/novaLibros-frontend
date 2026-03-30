import { useState } from "react";

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
      // TODO: await forgotPassword(email) desde auth.service.ts
      await new Promise(r => setTimeout(r, 1200));
      onNext(email);
    } finally {
      setLoading(false);
    }
  };

  return { email, error, loading, handleChange, handleSubmit };
}
