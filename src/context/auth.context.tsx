"use client";

import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from "react";
import {
  login as loginService,
  logout as logoutService,
  getProfile as getProfileService,
  updateProfile as updateProfileService,
  type Usuario,
  type LoginPayload,
  type UpdateProfilePayload,
} from "@/services/auth.service";

interface AuthContextType {
  user: Usuario | null;
  token: string | null;
  loading: boolean;
  login: (payload: LoginPayload) => Promise<Usuario>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  updateProfile: (userId: string, payload: UpdateProfilePayload) => Promise<Usuario>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<Usuario | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Al cargar la app verificar si hay sesión activa via cookie
  const checkSession = useCallback(async () => {
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
  }, []);

  useEffect(() => {
    void checkSession();
  }, [checkSession]);

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

  const updateProfile = async (userId: string, payload: UpdateProfilePayload) => {
    const updated = await updateProfileService(userId, payload);
    try {
      const profile = await getProfileService();
      setUser(profile);
      return profile;
    } catch {
      setUser(updated);
      return updated;
    }
  };

  const refreshUser = useCallback(async () => {
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
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        logout,
        refreshUser,
        updateProfile,
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
