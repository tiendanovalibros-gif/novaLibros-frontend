"use client";

import { useAuth } from "@/context/auth.context";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import ChatConversacion from "@/sections/soporte/chat-conversacion";
import {
  obtenerForoAdmin,
  enviarMensajeAdmin,
  listarMensajesAdmin,
} from "@/services/foros.service";

interface PageProps {
  params: { id: string };
}

export default function AdminSoporteChatPage({ params }: PageProps) {
  const foroId = parseInt(params.id, 10);
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) router.replace("/login");
    else if (user && user.rol !== "administrador" && user.rol !== "root") {
      router.replace("/");
    }
  }, [isAuthenticated, user, router]);

  if (!isAuthenticated || !user) return null;
  if (user.rol !== "administrador" && user.rol !== "root") return null;

  return (
    <ChatConversacion
      foroId={foroId}
      obtenerForo={obtenerForoAdmin}
      enviarMensaje={enviarMensajeAdmin}
      listarMensajes={listarMensajesAdmin}
      backHref="/admin/soporte"
    />
  );
}
