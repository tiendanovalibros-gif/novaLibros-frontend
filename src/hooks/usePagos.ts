"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/context/auth.context";
import {
  obtenerMisMetodosPago,
  obtenerMiSaldo,
  obtenerMisMovimientos,
  registrarTarjeta,
  eliminarMiTarjeta,
  recargarSaldo,
} from "@/services/pagos.service";
import type {
  MetodoPago,
  SaldoUsuario,
  MovimientoSaldo,
  RegistrarTarjetaPayload,
  RecargarSaldoPayload,
} from "@/types/pagos.types";

export function usePagos() {
  const { user, isAuthenticated } = useAuth();

  const [metodosPago, setMetodosPago] = useState<MetodoPago[]>([]);
  const [saldo, setSaldo] = useState<SaldoUsuario | null>(null);
  const [movimientos, setMovimientos] = useState<MovimientoSaldo[]>([]);

  const [loadingMetodos, setLoadingMetodos] = useState(true);
  const [loadingSaldo, setLoadingSaldo] = useState(true);
  const [loadingMovimientos, setLoadingMovimientos] = useState(true);

  const [error, setError] = useState("");

  const cargarMetodos = useCallback(async () => {
    try {
      setLoadingMetodos(true);
      setError("");
      const data = await obtenerMisMetodosPago();
      setMetodosPago(data);
    } catch {
      setError("No se pudieron cargar los metodos de pago");
    } finally {
      setLoadingMetodos(false);
    }
  }, []);

  const cargarSaldo = useCallback(async () => {
    try {
      setLoadingSaldo(true);
      setError("");
      const data = await obtenerMiSaldo();
      setSaldo(data);
    } catch {
      setSaldo({ id: null, idUsuario: user?.id ?? "", saldoDisponible: 0 });
    } finally {
      setLoadingSaldo(false);
    }
  }, [user?.id]);

  const cargarMovimientos = useCallback(async () => {
    try {
      setLoadingMovimientos(true);
      setError("");
      const data = await obtenerMisMovimientos();
      setMovimientos(data);
    } catch {
      setError("No se pudo cargar el historial");
    } finally {
      setLoadingMovimientos(false);
    }
  }, []);

  useEffect(() => {
    if (!isAuthenticated) return;
    void cargarMetodos();
    void cargarSaldo();
    void cargarMovimientos();
  }, [isAuthenticated, cargarMetodos, cargarSaldo, cargarMovimientos]);

  const agregarTarjeta = async (payload: RegistrarTarjetaPayload) => {
    const nueva = await registrarTarjeta(payload);
    setMetodosPago(prev => [nueva, ...prev]);
    return nueva;
  };

  const borrarTarjeta = async (id: number) => {
    await eliminarMiTarjeta(id);
    setMetodosPago(prev => prev.filter(m => m.id !== id));
  };

  const hacerRecarga = async (payload: RecargarSaldoPayload) => {
    const nuevoSaldo = await recargarSaldo(payload);
    setSaldo(nuevoSaldo);
    void cargarMovimientos();
    return nuevoSaldo;
  };

  return {
    metodosPago,
    saldo,
    movimientos,
    loadingMetodos,
    loadingSaldo,
    loadingMovimientos,
    error,
    agregarTarjeta,
    borrarTarjeta,
    hacerRecarga,
    recargarDatos: () => {
      void cargarMetodos();
      void cargarSaldo();
      void cargarMovimientos();
    },
  };
}
