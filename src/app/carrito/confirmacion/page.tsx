"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useAuth } from "@/context/auth.context";
import ConfirmacionCompra from "@/sections/carrito/confirmacion-compra";
import { obtenerPedido, type PedidoDetalle } from "@/services/pedidos.service";
import type { CheckoutCarritoResponse } from "@/services/carrito.service";

const STORAGE_KEY = "novalibros_ultima_compra";

function ConfirmacionCompraContent() {
  const searchParams = useSearchParams();
  const pedidoId = searchParams.get("pedido");
  const { user, isAuthenticated, loading: authLoading } = useAuth();

  const [pedido, setPedido] = useState<PedidoDetalle | null>(null);
  const [saldoDisponible, setSaldoDisponible] = useState<number | string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (authLoading) return;

    if (!isAuthenticated || user?.rol !== "cliente") {
      setLoading(false);
      return;
    }

    if (!pedidoId) {
      setError("No se encontró el identificador del pedido.");
      setLoading(false);
      return;
    }

    try {
      const raw = sessionStorage.getItem(STORAGE_KEY);
      if (raw) {
        const cached = JSON.parse(raw) as CheckoutCarritoResponse;
        if (cached.pedidoId === pedidoId && cached.saldoDisponible !== undefined) {
          setSaldoDisponible(cached.saldoDisponible);
        }
      }
    } catch {
      /* ignore */
    }

    obtenerPedido(pedidoId)
      .then(data => {
        setPedido(data);
        setError("");
      })
      .catch(e => {
        setError((e as { message?: string })?.message ?? "No se pudo cargar el detalle del pedido");
      })
      .finally(() => setLoading(false));
  }, [authLoading, isAuthenticated, user?.rol, pedidoId]);

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <p className="text-slate-600 text-sm">Cargando confirmación...</p>
      </div>
    );
  }

  if (!isAuthenticated || user?.rol !== "cliente") {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="max-w-lg mx-auto px-4 py-16 text-center">
          <p className="text-slate-800 font-semibold mb-3">Debes iniciar sesión como cliente.</p>
          <Link href="/login" className="text-blue-600 text-sm font-semibold hover:underline">
            Ir a iniciar sesión
          </Link>
        </div>
      </div>
    );
  }

  if (error || !pedido) {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="max-w-lg mx-auto px-4 py-16 text-center space-y-4">
          <p className="text-red-600 font-semibold">{error || "Pedido no encontrado"}</p>
          <Link
            href="/carrito"
            className="inline-block text-blue-600 text-sm font-semibold hover:underline"
          >
            Volver al carrito
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
        <ConfirmacionCompra pedido={pedido} saldoDisponible={saldoDisponible} />
      </main>
    </div>
  );
}

export default function ConfirmacionCompraPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-50 flex items-center justify-center">
          <p className="text-slate-600 text-sm">Cargando confirmación...</p>
        </div>
      }
    >
      <ConfirmacionCompraContent />
    </Suspense>
  );
}
