"use client";

import { useAuth } from "@/context/auth.context";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import ChatConversacion from "@/sections/soporte/chat-conversacion";
import {
  obtenerMiForo,
  enviarMensajeCliente,
} from "@/services/foros.service";

interface PageProps {
  params: { id: string };
}

export default function SoporteChatPage({ params }: PageProps) {
  const foroId = parseInt(params.id, 10);
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) router.replace("/login");
    else if (user && user.rol !== "cliente") router.replace("/");
  }, [isAuthenticated, user, router]);

  if (!isAuthenticated || !user || user.rol !== "cliente") return null;

  return (
    <ChatConversacion
      foroId={foroId}
      obtenerForo={obtenerMiForo}
      enviarMensaje={enviarMensajeCliente}
      backHref="/soporte"
    />
  );
}
