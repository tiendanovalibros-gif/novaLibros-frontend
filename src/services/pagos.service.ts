import { apiFetch } from "@/services/api.client";
import type {
  MetodoPago,
  SaldoUsuario,
  MovimientoSaldo,
  RegistrarTarjetaPayload,
  RecargarSaldoPayload,
  TipoMovimiento,
  SetupIntentResponse,
  ConfirmarTarjetaPayload,
} from "@/types/pagos.types";

export async function obtenerMisMetodosPago(): Promise<MetodoPago[]> {
  return apiFetch<MetodoPago[]>("/metodos-pago/me");
}

export async function registrarTarjeta(payload: RegistrarTarjetaPayload): Promise<MetodoPago> {
  return apiFetch<MetodoPago>("/metodos-pago", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function eliminarMiTarjeta(id: number): Promise<void> {
  return apiFetch<void>(`/metodos-pago/me/${id}`, { method: "DELETE" });
}

export async function obtenerMiSaldo(): Promise<SaldoUsuario> {
  return apiFetch<SaldoUsuario>("/saldos-usuario/me");
}

export async function recargarSaldo(payload: RecargarSaldoPayload): Promise<SaldoUsuario> {
  return apiFetch<SaldoUsuario>("/saldos-usuario/me/recargar", {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export async function obtenerMisMovimientos(tipo?: TipoMovimiento): Promise<MovimientoSaldo[]> {
  const query = tipo ? `?tipo=${tipo}` : "";
  return apiFetch<MovimientoSaldo[]>(`/movimientos-saldo/me${query}`);
}

/**
 * Solicita un SetupIntent al backend para iniciar el flujo de registro de tarjeta.
 * Devuelve el clientSecret que se pasa a Stripe Elements.
 */
export async function crearSetupIntent(): Promise<SetupIntentResponse> {
  return apiFetch<SetupIntentResponse>("/metodos-pago/setup-intent", {
    method: "POST",
  });
}

/**
 * Confirma y guarda la tarjeta en BD después de que Stripe procesó el SetupIntent.
 * Se llama con el paymentMethodId que devuelve stripe.confirmCardSetup().
 */
export async function confirmarTarjetaStripe(
  payload: ConfirmarTarjetaPayload
): Promise<MetodoPago> {
  return apiFetch<MetodoPago>("/metodos-pago/confirmar", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function formatearSaldo(valor: number | string): string {
  const num = typeof valor === "string" ? parseFloat(valor) : valor;
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(num);
}

export function formatearTarjeta(numeroEnmascarado: string): string {
  return numeroEnmascarado.replace(/\*/g, "•");
}
