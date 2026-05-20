export type TipoTarjeta = "credito" | "debito";

export type TipoMovimiento = "recarga" | "compra" | "devolucion" | "bono";

export interface MetodoPago {
  id: number;
  idUsuario: string;
  tipo: TipoTarjeta;
  numeroEnmascarado: string;
  titular: string;
}

export interface SaldoUsuario {
  id: number | null;
  idUsuario: string;
  saldoDisponible: number | string;
}

export interface MovimientoSaldo {
  id: number;
  idUsuario: string;
  tipoMovimiento: TipoMovimiento;
  monto: number | string;
  idPedido: string | null;
  idMetodoPago: number | null;
  metodoPago?: MetodoPago | null;
}

export interface RegistrarTarjetaPayload {
  idUsuario: string;
  tipo: TipoTarjeta;
  numeroEnmascarado: string;
  titular: string;
}

export interface RecargarSaldoPayload {
  monto: number;
  idMetodoPago: number;
}

export const MONTOS_RECARGA = [10000, 20000, 50000, 100000, 200000, 500000];
