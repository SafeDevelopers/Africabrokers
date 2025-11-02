"use client";

import { createContext, useContext, useEffect, useMemo, useState, type PropsWithChildren } from "react";

type UserRole = "broker" | "real-estate" | "individual" | "tenant";
type ApprovalStatus = "pending" | "approved";

export type AuthUser = {
  name: string;
  email: string;
  role: UserRole;
  status: ApprovalStatus;
};

type AuthContextValue = {
  user: AuthUser | null;
  login: (payload: AuthUser) => void;
  register: (payload: AuthUser) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);
const STORAGE_KEY = "afribrok-auth-user";

export function AuthProvider({ children }: PropsWithChildren) {
  const [user, setUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as Partial<AuthUser>;
        if (parsed) {
          setUser({
            name: parsed.name ?? "",
            email: parsed.email ?? "",
            role: (parsed.role as UserRole) ?? "tenant",
            status: (parsed.status as ApprovalStatus) ?? "approved"
          });
        }
      }
    } catch (error) {
      console.error("Failed to restore auth session", error);
    }
  }, []);

  const persistUser = (value: AuthUser | null) => {
    if (typeof window === "undefined") return;
    if (value) {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
    } else {
      window.localStorage.removeItem(STORAGE_KEY);
    }
  };

  const login = (payload: AuthUser) => {
    setUser(payload);
    persistUser(payload);
  };

  const register = (payload: AuthUser) => {
    setUser(payload);
    persistUser(payload);
  };

  const logout = () => {
    setUser(null);
    persistUser(null);
  };

  const value = useMemo(
    () => ({
      user,
      login,
      register,
      logout
    }),
    [user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
