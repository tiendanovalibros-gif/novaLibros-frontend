"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Iconify from "@/components/iconify/iconify";
import MainNavbar from "@/components/navigation/main-navbar";
import AddTarjetaForm from "@/components/pagos/add-tarjeta-form";
import ConfirmRecargaDialog from "@/components/pagos/confirm-recarga-dialog";
import RecargaExitosaDialog from "@/components/pagos/recarga-exitosa-dialog";
import SaldoInsuficienteDialog from "@/components/pagos/saldo-insuficiente-dialog";
import TarjetasList from "@/components/pagos/tarjetas-list";
import { useAuth } from "@/context/auth.context";
import { usePagos } from "@/hooks/usePagos";
import HistorialRecargasSection from "@/sections/pagos/historial-recargas-section";
import RecargaSaldoSection from "@/sections/pagos/recarga-saldo-section";
import SaldoDisponibleSection from "@/sections/pagos/saldo-disponible-section";
import type {
  RecargarSaldoPayload,
  RegistrarTarjetaPayload,
  SaldoUsuario,
} from "@/types/pagos.types";

interface PendienteRecarga {
  payload: RecargarSaldoPayload;
  resolve: (saldo: SaldoUsuario) => void;
  reject: (err: unknown) => void;
}

export default function PagosPage() {
  const router = useRouter();
  const { user, loading, isAuthenticated } = useAuth();
  const {
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
  } = usePagos();

  const [mounted, setMounted] = useState(false);
  const [mostrarAddTarjeta, setMostrarAddTarjeta] = useState(false);
  const [loadingTarjeta, setLoadingTarjeta] = useState(false);
  const [pendienteRecarga, setPendienteRecarga] = useState<PendienteRecarga | null>(null);
  const [loadingRecarga, setLoadingRecarga] = useState(false);
  const [recargaExitosa, setRecargaExitosa] = useState<{
    monto: number;
    nuevoSaldo: SaldoUsuario;
  } | null>(null);
  const [saldoInsuficiente, setSaldoInsuficiente] = useState<{
    saldoActual: number | string;
    montoRequerido: number | string;
  } | null>(null);
  const recargaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && !loading && !isAuthenticated) {
      router.push("/login");
    }
  }, [mounted, loading, isAuthenticated, router]);

  const solicitarRecarga = (payload: RecargarSaldoPayload) => {
    return new Promise<SaldoUsuario>((resolve, reject) => {
      setPendienteRecarga({ payload, resolve, reject });
    });
  };

  const metodoPendiente = useMemo(() => {
    if (!pendienteRecarga) return null;
    return metodosPago.find(metodo => metodo.id === pendienteRecarga.payload.idMetodoPago) ?? null;
  }, [metodosPago, pendienteRecarga]);

  const handleConfirmRecarga = async () => {
    if (!pendienteRecarga) return;

    setLoadingRecarga(true);
    try {
      const nuevoSaldo = await hacerRecarga(pendienteRecarga.payload);
      pendienteRecarga.resolve(nuevoSaldo);
    } catch (err: unknown) {
      const message =
        typeof err === "object" && err && "message" in err
          ? String((err as { message?: string }).message)
          : "No se pudo completar la recarga";
      if (message.toLowerCase().includes("saldo insuficiente")) {
        setSaldoInsuficiente({
          saldoActual: saldo?.saldoDisponible ?? 0,
          montoRequerido: pendienteRecarga.payload.monto,
        });
      }
      pendienteRecarga.reject(err);
    } finally {
      setLoadingRecarga(false);
      setPendienteRecarga(null);
    }
  };

  const handleCancelRecarga = () => {
    if (!pendienteRecarga) return;
    pendienteRecarga.reject({ message: "RECARGA_CANCELADA" });
    setPendienteRecarga(null);
  };

  const handleRecargaExitosa = (nuevoSaldo: SaldoUsuario, monto: number) => {
    setRecargaExitosa({ monto, nuevoSaldo });
  };

  const handleAgregarTarjeta = async (payload: RegistrarTarjetaPayload) => {
    setLoadingTarjeta(true);
    try {
      await agregarTarjeta(payload);
    } catch (err) {
      throw err;
    } finally {
      setLoadingTarjeta(false);
    }
  };

  if (!mounted || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="mx-auto mb-4 h-16 w-16 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
          <p className="text-sm font-semibold text-slate-600">Cargando pagos...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <main className="min-h-screen bg-slate-50 pt-8 pb-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-6 flex items-center gap-2 text-sm text-slate-600">
            <Link href="/profile" className="hover:text-blue-600">
              Perfil
            </Link>
            <Iconify icon="solar:alt-arrow-right-linear" width={16} />
            <span className="font-semibold text-slate-900">Pagos y saldo</span>
          </div>

          <div className="mb-6">
            <h1 className="text-2xl font-bold text-slate-900">Pagos y saldo</h1>
            <p className="text-sm text-slate-600">
              Administra tus metodos de pago y recarga tu saldo.
            </p>
          </div>

          {error && (
            <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6 items-start">
            <div className="lg:col-span-2 space-y-6">
              <SaldoDisponibleSection
                saldo={saldo}
                loading={loadingSaldo}
                onRecargar={() => recargaRef.current?.scrollIntoView({ behavior: "smooth" })}
              />

              <div ref={recargaRef}>
                <RecargaSaldoSection
                  metodosPago={metodosPago}
                  loadingMetodos={loadingMetodos}
                  onRecargar={solicitarRecarga}
                  onSuccess={handleRecargaExitosa}
                  onAgregarTarjeta={() => setMostrarAddTarjeta(true)}
                />
              </div>

              <HistorialRecargasSection movimientos={movimientos} loading={loadingMovimientos} />
            </div>

            <div className="lg:col-span-1 space-y-6">
              <TarjetasList
                tarjetas={metodosPago}
                loading={loadingMetodos}
                onEliminar={borrarTarjeta}
                onAgregar={() => setMostrarAddTarjeta(true)}
              />
            </div>
          </div>
        </div>
      </main>

      <AddTarjetaForm
        isOpen={mostrarAddTarjeta}
        idUsuario={user?.id ?? ""}
        isLoading={loadingTarjeta}
        onClose={() => setMostrarAddTarjeta(false)}
        onSubmit={handleAgregarTarjeta}
      />

      <ConfirmRecargaDialog
        isOpen={!!pendienteRecarga}
        monto={pendienteRecarga?.payload.monto ?? 0}
        metodoPago={metodoPendiente}
        isLoading={loadingRecarga}
        onCancel={handleCancelRecarga}
        onConfirm={() => void handleConfirmRecarga()}
      />

      <RecargaExitosaDialog
        isOpen={!!recargaExitosa}
        monto={recargaExitosa?.monto ?? 0}
        nuevoSaldo={recargaExitosa?.nuevoSaldo.saldoDisponible ?? 0}
        onClose={() => setRecargaExitosa(null)}
      />

      <SaldoInsuficienteDialog
        isOpen={!!saldoInsuficiente}
        saldoActual={saldoInsuficiente?.saldoActual ?? 0}
        montoRequerido={saldoInsuficiente?.montoRequerido ?? 0}
        onClose={() => setSaldoInsuficiente(null)}
        onRecargar={() => {
          setSaldoInsuficiente(null);
          recargaRef.current?.scrollIntoView({ behavior: "smooth" });
        }}
      />
    </div>
  );
}
