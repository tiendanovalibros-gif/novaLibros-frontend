// src/utils/password.utils.ts
import type { StrengthInfo } from "@/types/forgotPassword.types";

export const PASSWORD_RULES = {
  allowed: /^[a-zA-Z0-9 !"#$%&'()*+,\-./:;<=>?@\[\]\\\^_`{|}~]+$/,
  lowercase: /[a-z]/,
  number: /[0-9]/,
  symbol: /[ !"#$%&'()*+,\-./:;<=>?@\[\]\\\^_`{|}~]/,
} as const;

export const validatePassword = (password: string): string | null => {
  if (!password.trim()) return "La contrasena no puede ser solo espacios";
  if (password.length < 8) return "Minimo 8 caracteres";
  if (!PASSWORD_RULES.allowed.test(password))
    return "La contrasena contiene caracteres no permitidos";
  if (!PASSWORD_RULES.lowercase.test(password)) return "Debe incluir al menos una letra minuscula";
  if (!PASSWORD_RULES.number.test(password)) return "Debe incluir al menos un numero";
  if (!PASSWORD_RULES.symbol.test(password)) return "Debe incluir al menos un simbolo";
  return null;
};

export const getStrengthInfo = (len: number): StrengthInfo => {
  if (len === 0) return { label: "", barClass: "bg-slate-200", textClass: "text-slate-400" };
  if (len < 6) return { label: "Débil", barClass: "bg-red-500", textClass: "text-red-600" };
  if (len < 10) return { label: "Media", barClass: "bg-yellow-400", textClass: "text-yellow-600" };
  return { label: "Fuerte", barClass: "bg-green-500", textClass: "text-green-600" };
};
