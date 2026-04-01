"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import {
  login as loginService,
  logout as logoutService,
  type Usuario,
  type LoginPayload,
} from "@/services/auth.service";

interface AuthContextType {
  user: Usuario | null;
  token: string | null;
  loading: boolean;
  login: (payload: LoginPayload) => Promise<Usuario>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<Usuario | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Al cargar la app verificar si hay sesión activa via cookie
  useEffect(() => {
    checkSession();
  }, []);

  const checkSession = async () => {
    try {
      const res = await fetch("/api/auth/me");
      if (res.ok) {
        const data = await res.json();
        setUser(data.user ?? null);
        const browserToken = localStorage.getItem("auth_token");
        setToken(browserToken);
      } else {
        setUser(null);
        setToken(null);
      }
    } catch {
      setUser(null);
      setToken(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (payload: LoginPayload): Promise<Usuario> => {
    // El service guarda el token en cookie + localStorage y retorna usuario + token
    const data = await loginService(payload);
    setUser(data.usuario);
    setToken(data.access_token);
    return data.usuario;
  };

  const logout = async () => {
    await logoutService();
    setUser(null);
    setToken(null);
  };

  const refreshUser = async () => {
    try {
      const res = await fetch("/api/auth/me");
      if (res.ok) {
        const data = await res.json();
        setUser(data.user ?? null);
      } else {
        setUser(null);
        setToken(null);
      }
    } catch {
      // Si falla, mantener el estado actual
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        logout,
        refreshUser,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth debe usarse dentro de AuthProvider");
  return ctx;
}
