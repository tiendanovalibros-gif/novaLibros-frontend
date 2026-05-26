"use client";

import { useEffect, useState, useCallback } from "react";
import { Elements, CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import Iconify from "@/components/iconify/iconify";
import { getStripe } from "@/lib/stripe";
import { crearSetupIntent, confirmarTarjetaStripe } from "@/services/pagos.service";
import type { MetodoPago, TipoTarjeta } from "@/types/pagos.types";

// ─── Estilos para CardElement de Stripe ──────────────────────────────────────

const CARD_ELEMENT_OPTIONS = {
  style: {
    base: {
      fontSize: "14px",
      color: "#0f172a",
      fontFamily: "inherit",
      "::placeholder": { color: "#94a3b8" },
    },
    invalid: { color: "#dc2626" },
  },
  hidePostalCode: true,
};

// ─── Formulario interno (necesita estar dentro de <Elements>) ────────────────

interface InnerFormProps {
  tipo: TipoTarjeta;
  titular: string;
  clientSecret: string;
  onTipoChange: (v: TipoTarjeta) => void;
  onTitularChange: (v: string) => void;
  onSuccess: (metodo: MetodoPago) => void;
  onClose: () => void;
}

function InnerCardForm({
  tipo,
  titular,
  clientSecret,
  onTipoChange,
  onTitularChange,
  onSuccess,
  onClose,
}: InnerFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<{ titular?: string }>({});

  const validate = () => {
    const errs: { titular?: string } = {};
    if (!titular.trim()) errs.titular = "Ingresa el nombre del titular";
    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async () => {
    if (!stripe || !elements) return;
    setError("");
    if (!validate()) return;

    const cardElement = elements.getElement(CardElement);
    if (!cardElement) return;

    setIsSubmitting(true);
    try {
      // 1. Confirmar el SetupIntent con Stripe
      const result = await stripe.confirmCardSetup(clientSecret, {
        payment_method: {
          card: cardElement,
          billing_details: { name: titular.trim() },
        },
      });

      if (result.error) {
        setError(result.error.message ?? "Error al procesar la tarjeta");
        return;
      }

      const paymentMethodId = result.setupIntent?.payment_method;
      if (!paymentMethodId || typeof paymentMethodId !== "string") {
        setError("No se pudo obtener el método de pago de Stripe");
        return;
      }

      // 2. Guardar en backend
      const metodo = await confirmarTarjetaStripe({
        paymentMethodId,
        tipo,
        titular: titular.trim(),
      });

      onSuccess(metodo);
      onClose();
    } catch (err: unknown) {
      const message =
        typeof err === "object" && err && "message" in err
          ? String((err as { message?: string }).message)
          : "No se pudo registrar la tarjeta";
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-5 space-y-4">
      <div>
        <h3 className="text-slate-900 text-lg font-bold">Registrar tarjeta</h3>
        <p className="text-slate-600 text-sm">Guarda un método de pago para futuras recargas.</p>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Tipo de tarjeta */}
      <div>
        <label className="block text-slate-700 text-sm font-semibold mb-1.5">Tipo de tarjeta</label>
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => onTipoChange("credito")}
            className={`rounded-lg border px-3 py-2 text-sm font-semibold transition-colors ${
              tipo === "credito"
                ? "border-blue-600 bg-blue-50 text-blue-700"
                : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
            }`}
          >
            Crédito
          </button>
          <button
            type="button"
            onClick={() => onTipoChange("debito")}
            className={`rounded-lg border px-3 py-2 text-sm font-semibold transition-colors ${
              tipo === "debito"
                ? "border-emerald-600 bg-emerald-50 text-emerald-700"
                : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
            }`}
          >
            Débito
          </button>
        </div>
      </div>

      {/* Datos de tarjeta vía Stripe Elements */}
      <div>
        <label className="block text-slate-700 text-sm font-semibold mb-1.5">
          Datos de la tarjeta
        </label>
        <div className="w-full px-3 py-3 bg-white border border-slate-300 rounded-lg focus-within:border-blue-500 transition-colors">
          <CardElement options={CARD_ELEMENT_OPTIONS} />
        </div>
        <p className="mt-1 text-xs text-slate-500">
          Número, fecha de expiración y CVV — procesados de forma segura por Stripe.
        </p>
      </div>

      {/* Titular */}
      <div>
        <label className="block text-slate-700 text-sm font-semibold mb-1.5">
          Titular de la tarjeta
        </label>
        <input
          type="text"
          value={titular}
          onChange={e => onTitularChange(e.target.value)}
          placeholder="Nombre completo"
          className="w-full px-3 py-2.5 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 outline-none focus:border-blue-500"
        />
        {fieldErrors.titular && <p className="mt-1 text-xs text-red-600">{fieldErrors.titular}</p>}
      </div>

      {/* Badge de seguridad */}
      <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
        <Iconify icon="solar:shield-check-bold" className="text-emerald-600" width={16} />
        <p className="text-xs text-slate-600">
          Tus datos son cifrados y procesados directamente por <strong>Stripe</strong>. NovaLibros
          nunca almacena el número de tu tarjeta.
        </p>
      </div>

      {/* Botones */}
      <div className="flex items-center justify-end gap-3 pt-2">
        <button
          onClick={onClose}
          disabled={isSubmitting}
          className="px-4 py-2 border border-slate-300 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-60"
        >
          Cancelar
        </button>
        <button
          onClick={() => void handleSubmit()}
          disabled={isSubmitting || !stripe}
          className="px-5 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 disabled:opacity-60 flex items-center gap-2"
        >
          {isSubmitting && (
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
          )}
          Guardar tarjeta
        </button>
      </div>
    </div>
  );
}

// ─── Componente principal (maneja el ciclo de vida del modal) ─────────────────

interface AddTarjetaFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (metodo: MetodoPago) => void;
}

export default function AddTarjetaForm({ isOpen, onClose, onSuccess }: AddTarjetaFormProps) {
  const [tipo, setTipo] = useState<TipoTarjeta>("credito");
  const [titular, setTitular] = useState("");
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [loadingIntent, setLoadingIntent] = useState(false);
  const [intentError, setIntentError] = useState("");

  // Cuando el modal se abre: pedir el SetupIntent al backend
  const fetchSetupIntent = useCallback(async () => {
    setLoadingIntent(true);
    setIntentError("");
    try {
      const { clientSecret: cs } = await crearSetupIntent();
      setClientSecret(cs);
    } catch {
      setIntentError("No se pudo inicializar el formulario de pago. Intenta de nuevo.");
    } finally {
      setLoadingIntent(false);
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      setTipo("credito");
      setTitular("");
      setClientSecret(null);
      setIntentError("");
      void fetchSetupIntent();
    }
  }, [isOpen, fetchSetupIntent]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[70] bg-slate-900/55 backdrop-blur-[2px] flex items-end sm:items-center justify-center p-0 sm:p-6">
      <div
        className="w-full sm:max-w-md bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl border border-slate-200 overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 bg-blue-50 rounded-lg flex items-center justify-center">
              <Iconify icon="solar:wallet-bold" className="text-blue-600" width={20} />
            </div>
            <span className="text-slate-900 text-sm font-bold tracking-tight">NovaLibros</span>
          </div>
          <button
            onClick={onClose}
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-300 text-slate-600 hover:bg-slate-100"
            aria-label="Cerrar"
          >
            <Iconify icon="solar:close-circle-linear" width={18} />
          </button>
        </div>

        {/* Contenido */}
        {loadingIntent ? (
          <div className="flex items-center justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
          </div>
        ) : intentError ? (
          <div className="p-5 space-y-4">
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {intentError}
            </div>
            <div className="flex justify-end gap-3">
              <button
                onClick={onClose}
                className="px-4 py-2 border border-slate-300 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                Cerrar
              </button>
              <button
                onClick={() => void fetchSetupIntent()}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700"
              >
                Reintentar
              </button>
            </div>
          </div>
        ) : clientSecret ? (
          <Elements stripe={getStripe()} options={{ clientSecret }}>
            <InnerCardForm
              tipo={tipo}
              titular={titular}
              clientSecret={clientSecret}
              onTipoChange={setTipo}
              onTitularChange={setTitular}
              onSuccess={onSuccess}
              onClose={onClose}
            />
          </Elements>
        ) : null}
      </div>
    </div>
  );
}
