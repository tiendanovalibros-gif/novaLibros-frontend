"use client";

import { useEffect, useMemo, useState } from "react";
import Iconify from "@/components/iconify/iconify";
import type { RegistrarTarjetaPayload, TipoTarjeta } from "@/types/pagos.types";

type CardBrandId =
  | "visa"
  | "mastercard"
  | "amex"
  | "discover"
  | "diners"
  | "jcb"
  | "unionpay"
  | "desconocida";

type CardBrandConfig = {
  id: CardBrandId;
  label: string;
  pattern: RegExp;
  lengths: number[];
  groups: number[];
  maxLength: number;
  color: string;
  bg: string;
};

const CARD_BRANDS: CardBrandConfig[] = [
  {
    id: "amex",
    label: "American Express",
    pattern: /^3[47]/,
    lengths: [15],
    groups: [4, 6, 5],
    maxLength: 15,
    color: "text-blue-700",
    bg: "bg-blue-50",
  },
  {
    id: "mastercard",
    label: "Mastercard",
    pattern: /^(5[1-5]|2(2[2-9]|[3-6]|7[01]|720))/,
    lengths: [16],
    groups: [4, 4, 4, 4],
    maxLength: 16,
    color: "text-orange-600",
    bg: "bg-orange-50",
  },
  {
    id: "visa",
    label: "Visa",
    pattern: /^4/,
    lengths: [13, 16, 19],
    groups: [4, 4, 4, 4, 3],
    maxLength: 19,
    color: "text-indigo-600",
    bg: "bg-indigo-50",
  },
  {
    id: "discover",
    label: "Discover",
    pattern: /^(6011|65|64[4-9]|622(12[6-9]|1[3-9]\d|[2-8]\d{2}|9[01]\d|92[0-5]))/,
    lengths: [16, 19],
    groups: [4, 4, 4, 4, 3],
    maxLength: 19,
    color: "text-amber-600",
    bg: "bg-amber-50",
  },
  {
    id: "diners",
    label: "Diners Club",
    pattern: /^(3(0[0-5]|[68]))/,
    lengths: [14],
    groups: [4, 6, 4],
    maxLength: 14,
    color: "text-teal-600",
    bg: "bg-teal-50",
  },
  {
    id: "jcb",
    label: "JCB",
    pattern: /^35(2[8-9]|[3-8]\d)/,
    lengths: [16],
    groups: [4, 4, 4, 4],
    maxLength: 16,
    color: "text-emerald-600",
    bg: "bg-emerald-50",
  },
  {
    id: "unionpay",
    label: "UnionPay",
    pattern: /^62/,
    lengths: [16, 19],
    groups: [4, 4, 4, 4, 3],
    maxLength: 19,
    color: "text-rose-600",
    bg: "bg-rose-50",
  },
];

const UNKNOWN_BRAND: CardBrandConfig = {
  id: "desconocida",
  label: "Desconocida",
  pattern: /.^/,
  lengths: [],
  groups: [4, 4, 4, 4, 3],
  maxLength: 19,
  color: "text-slate-500",
  bg: "bg-slate-100",
};

const SANDBOX_CARD_APPROVED = "4242424242424242";
const SANDBOX_CARD_DECLINED = "4343434343434343";

const detectBrand = (digits: string): CardBrandConfig => {
  if (!digits) return UNKNOWN_BRAND;
  return CARD_BRANDS.find(brand => brand.pattern.test(digits)) ?? UNKNOWN_BRAND;
};

const formatWithGroups = (digits: string, groups: number[], separator: string) => {
  if (!digits) return "";
  const parts: string[] = [];
  let index = 0;

  for (const group of groups) {
    if (index >= digits.length) break;
    parts.push(digits.slice(index, index + group));
    index += group;
  }

  if (index < digits.length) {
    parts.push(digits.slice(index));
  }

  return parts.join(separator);
};

const formatCardNumber = (digits: string, brand: CardBrandConfig) => {
  return formatWithGroups(digits, brand.groups, " ");
};

const maskCardNumber = (digits: string, brand: CardBrandConfig) => {
  const visible = digits.slice(-4);
  const masked = `${"*".repeat(Math.max(digits.length - 4, 0))}${visible}`;
  return formatWithGroups(masked, brand.groups, "-");
};

const luhnCheck = (digits: string) => {
  let sum = 0;
  let shouldDouble = false;

  for (let i = digits.length - 1; i >= 0; i -= 1) {
    let digit = Number(digits[i]);
    if (shouldDouble) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    sum += digit;
    shouldDouble = !shouldDouble;
  }

  return sum % 10 === 0;
};

const buildFormatHint = (brand: CardBrandConfig) => {
  return brand.groups.map(group => "#".repeat(group)).join(" ");
};

interface AddTarjetaFormProps {
  isOpen: boolean;
  idUsuario: string;
  isLoading: boolean;
  onClose: () => void;
  onSubmit: (payload: RegistrarTarjetaPayload) => Promise<void>;
}

export default function AddTarjetaForm({
  isOpen,
  idUsuario,
  isLoading,
  onClose,
  onSubmit,
}: AddTarjetaFormProps) {
  const [tipo, setTipo] = useState<TipoTarjeta>("credito");
  const [numeroTarjeta, setNumeroTarjeta] = useState("");
  const [titular, setTitular] = useState("");
  const [error, setError] = useState("");
  const [brandPulse, setBrandPulse] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<{
    tipo?: string;
    numeroTarjeta?: string;
    titular?: string;
  }>({});

  useEffect(() => {
    if (!isOpen) return;
    setTipo("credito");
    setNumeroTarjeta("");
    setTitular("");
    setError("");
    setFieldErrors({});
  }, [isOpen]);

  const brand = useMemo(() => detectBrand(numeroTarjeta), [numeroTarjeta]);
  const isSandboxCard =
    numeroTarjeta === SANDBOX_CARD_APPROVED || numeroTarjeta === SANDBOX_CARD_DECLINED;

  useEffect(() => {
    if (!numeroTarjeta) return;
    setBrandPulse(true);
    const timer = window.setTimeout(() => setBrandPulse(false), 250);
    return () => window.clearTimeout(timer);
  }, [brand.id, numeroTarjeta]);

  if (!isOpen) return null;

  const validate = () => {
    const nextErrors: { tipo?: string; numeroTarjeta?: string; titular?: string } = {};

    if (!tipo) {
      nextErrors.tipo = "Selecciona el tipo de tarjeta";
    }

    if (!numeroTarjeta.trim()) {
      nextErrors.numeroTarjeta = "Ingresa el numero de la tarjeta";
    } else if (!isSandboxCard) {
      nextErrors.numeroTarjeta = "Sandbox activo: usa 4242 4242 4242 4242 o 4343 4343 4343 4343";
    } else if (brand.id === "desconocida") {
      nextErrors.numeroTarjeta = "No se reconoce la franquicia de la tarjeta";
    } else if (!brand.lengths.includes(numeroTarjeta.length)) {
      nextErrors.numeroTarjeta = `El numero debe tener ${brand.lengths.join(", ")} digitos`;
    } else if (!luhnCheck(numeroTarjeta) && !isSandboxCard) {
      nextErrors.numeroTarjeta = "El numero de tarjeta no es valido";
    }

    if (!titular.trim()) {
      nextErrors.titular = "Ingresa el nombre del titular";
    }

    setFieldErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async () => {
    setError("");
    if (!validate()) return;

    try {
      await onSubmit({
        idUsuario,
        tipo,
        numeroEnmascarado: maskCardNumber(numeroTarjeta, brand),
        titular: titular.trim(),
      });
      onClose();
    } catch (err: unknown) {
      const message =
        typeof err === "object" && err && "message" in err
          ? String((err as { message?: string }).message)
          : "No se pudo registrar la tarjeta";
      setError(message);
    }
  };

  return (
    <div className="fixed inset-0 z-[70] bg-slate-900/55 backdrop-blur-[2px] flex items-end sm:items-center justify-center p-0 sm:p-6">
      <div
        className="w-full sm:max-w-md bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl border border-slate-200 overflow-hidden"
        onClick={event => event.stopPropagation()}
      >
        <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 bg-blue-50 rounded-lg flex items-center justify-center">
              <Iconify icon="solar:wallet-bold" className="text-blue-600" width={20} />
            </div>
            <span className="text-slate-900 text-sm font-bold tracking-tight">NovaLibros</span>
          </div>
          <button
            onClick={onClose}
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-300 text-slate-600 leading-none hover:bg-slate-100"
            aria-label="Cerrar"
          >
            <Iconify icon="solar:close-circle-linear" width={18} />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <div>
            <h3 className="text-slate-900 text-lg font-bold">Registrar tarjeta</h3>
            <p className="text-slate-600 text-sm">
              Guarda un metodo de pago para futuras recargas.
            </p>
          </div>

          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <div>
            <label className="block text-slate-700 text-sm font-semibold mb-1.5">
              Tipo de tarjeta
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setTipo("credito")}
                className={`rounded-lg border px-3 py-2 text-sm font-semibold transition-colors ${
                  tipo === "credito"
                    ? "border-blue-600 bg-blue-50 text-blue-700"
                    : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
                }`}
              >
                Credito
              </button>
              <button
                type="button"
                onClick={() => setTipo("debito")}
                className={`rounded-lg border px-3 py-2 text-sm font-semibold transition-colors ${
                  tipo === "debito"
                    ? "border-emerald-600 bg-emerald-50 text-emerald-700"
                    : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
                }`}
              >
                Debito
              </button>
            </div>
            {fieldErrors.tipo && <p className="mt-1 text-xs text-red-600">{fieldErrors.tipo}</p>}
          </div>

          <div>
            <label className="block text-slate-700 text-sm font-semibold mb-1.5">
              Numero de tarjeta
            </label>
            <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
              <span className="text-xs text-slate-500">Franquicia detectada</span>
              <div
                className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold transition-all ${
                  brand.bg
                } ${brand.color} ${brandPulse ? "scale-[1.03]" : "scale-100"}`}
              >
                <Iconify icon="solar:card-bold-duotone" width={14} />
                {numeroTarjeta ? brand.label : "Detectando..."}
              </div>
            </div>
            <input
              type="text"
              value={formatCardNumber(numeroTarjeta, brand)}
              onChange={event => {
                const digits = event.target.value.replace(/\D/g, "");
                const detected = detectBrand(digits);
                setNumeroTarjeta(digits.slice(0, detected.maxLength));
                setFieldErrors(prev => ({ ...prev, numeroTarjeta: undefined }));
              }}
              placeholder="1234 5678 9012 3456"
              className="w-full px-3 py-2.5 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 outline-none focus:border-blue-500"
            />
            <p className="mt-1 text-xs text-slate-500">
              Formato {brand.label === "Desconocida" ? "tarjeta" : brand.label}:{" "}
              {buildFormatHint(brand)}
            </p>
            <p className="mt-1 text-xs text-slate-500">
              Sandbox activa: 4242 4242 4242 4242 aprueba, 4343 4343 4343 4343 rechaza.
            </p>
            {fieldErrors.numeroTarjeta && (
              <p className="mt-1 text-xs text-red-600">{fieldErrors.numeroTarjeta}</p>
            )}
          </div>

          <div>
            <label className="block text-slate-700 text-sm font-semibold mb-1.5">
              Titular de la tarjeta
            </label>
            <input
              type="text"
              value={titular}
              onChange={event => setTitular(event.target.value)}
              placeholder="Nombre completo"
              className="w-full px-3 py-2.5 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 outline-none focus:border-blue-500"
            />
            {fieldErrors.titular && (
              <p className="mt-1 text-xs text-red-600">{fieldErrors.titular}</p>
            )}
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              onClick={onClose}
              disabled={isLoading}
              className="px-4 py-2 border border-slate-300 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-60"
            >
              Cancelar
            </button>
            <button
              onClick={() => void handleSubmit()}
              disabled={isLoading}
              className="px-5 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 disabled:opacity-60 flex items-center gap-2"
            >
              {isLoading && (
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              )}
              Guardar tarjeta
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
