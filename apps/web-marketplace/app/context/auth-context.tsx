"use client";

import { createContext, useContext, useEffect, useMemo, useState, type PropsWithChildren } from "react";

type UserRole = "broker" | "tenant"; // tenant = agency/government
type ApprovalStatus = "pending" | "approved";

export type AuthUser = {
  name: string;
  email: string;
  role: UserRole;
  status: ApprovalStatus;
};

type AuthContextValue = {
  user: AuthUser | null;
  isLoading: boolean;
  login: (payload: AuthUser) => void;
  register: (payload: AuthUser) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);
const STORAGE_KEY = "afribrok-auth-user";

export function AuthProvider({ children }: PropsWithChildren) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (typeof window === "undefined") {
      setIsLoading(false);
      return;
    }
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as Partial<AuthUser>;
        if (parsed) {
          const restoredUser = {
            name: parsed.name ?? "",
            email: parsed.email ?? "",
            role: (parsed.role as UserRole) ?? "tenant",
            status: (parsed.status as ApprovalStatus) ?? "approved"
          };
          setUser(restoredUser);
          
          // Set cookies for middleware authentication when restoring from localStorage
          if (restoredUser.role === "broker") {
            document.cookie = `afribrok-role=BROKER; path=/; max-age=86400; SameSite=Lax`;
            document.cookie = `afribrok-user-id=${restoredUser.email}; path=/; max-age=86400; SameSite=Lax`;
          }
        }
      }
    } catch (error) {
      console.error("Failed to restore auth session", error);
    } finally {
      setIsLoading(false);
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
    
    // Clear authentication cookies
    if (typeof document !== "undefined") {
      document.cookie.split(';').forEach((cookie) => {
        const eqPos = cookie.indexOf('=');
        const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim();
        if (name.startsWith('afribrok-')) {
          document.cookie = `${name}=;path=/;max-age=0`;
        }
      });
    }
  };

  const value = useMemo(
    () => ({
      user,
      isLoading,
      login,
      register,
      logout
    }),
    [user, isLoading]
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
