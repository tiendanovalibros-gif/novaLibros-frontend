"use client";

import { useState, useEffect, useCallback } from "react";
import { obtenerMisPedidos } from "@/services/pedidos.service";
import { obtenerMisDevoluciones } from "@/services/devoluciones.service";
import type { PedidoResumen, Devolucion } from "@/types/pedidos.types";

export function usePedidos() {
  const [pedidos, setPedidos] = useState<PedidoResumen[]>([]);
  const [devoluciones, setDevoluciones] = useState<Devolucion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const cargar = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [p, d] = await Promise.all([obtenerMisPedidos(), obtenerMisDevoluciones()]);
      setPedidos(p);
      setDevoluciones(d);
    } catch {
      setError("No se pudo cargar el historial de compras.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void cargar();
  }, [cargar]);

  return { pedidos, devoluciones, loading, error, recargar: cargar };
}
