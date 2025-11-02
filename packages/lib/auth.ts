/**
 * Authentication utilities and helpers
 */

export type UserRole = 
  | 'certified_broker' 
  | 'agency' 
  | 'individual_seller' 
  | 'inspector' 
  | 'regulator' 
  | 'admin' 
  | 'public';

export interface User {
  id: string;
  role: UserRole;
  tenantId: string;
  kycStatus?: string;
  mfaEnabled: boolean;
}

export interface AuthSession {
  user: User;
  token: string;
  expiresAt: Date;
}

export class AuthHelper {
  private static SESSION_KEY = 'afribrok_session';

  static saveSession(session: AuthSession): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem(this.SESSION_KEY, JSON.stringify({
        ...session,
        expiresAt: session.expiresAt.toISOString(),
      }));
    }
  }

  static getSession(): AuthSession | null {
    if (typeof window === 'undefined') return null;
    
    try {
      const stored = localStorage.getItem(this.SESSION_KEY);
      if (!stored) return null;
      
      const session = JSON.parse(stored);
      const expiresAt = new Date(session.expiresAt);
      
      if (expiresAt <= new Date()) {
        this.clearSession();
        return null;
      }
      
      return {
        ...session,
        expiresAt,
      };
    } catch {
      this.clearSession();
      return null;
    }
  }

  static clearSession(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(this.SESSION_KEY);
    }
  }

  static isAuthenticated(): boolean {
    return this.getSession() !== null;
  }

  static hasRole(role: UserRole): boolean {
    const session = this.getSession();
    return session?.user.role === role;
  }

  static hasAnyRole(roles: UserRole[]): boolean {
    const session = this.getSession();
    return session ? roles.includes(session.user.role) : false;
  }

  static canAccessAdmin(): boolean {
    return this.hasAnyRole(['admin', 'regulator', 'inspector']);
  }

  static canCreateBroker(): boolean {
    return this.hasAnyRole(['certified_broker', 'agency']);
  }

  static canCreateListing(): boolean {
    return this.hasAnyRole(['certified_broker', 'agency', 'individual_seller']);
  }
}

// Hook for Next.js/React apps
export function useAuth() {
  if (typeof window === 'undefined') {
    return {
      session: null,
      isAuthenticated: false,
      user: null,
    };
  }

  const session = AuthHelper.getSession();
  
  return {
    session,
    isAuthenticated: session !== null,
    user: session?.user || null,
    hasRole: (role: UserRole) => AuthHelper.hasRole(role),
    hasAnyRole: (roles: UserRole[]) => AuthHelper.hasAnyRole(roles),
    canAccessAdmin: () => AuthHelper.canAccessAdmin(),
    canCreateBroker: () => AuthHelper.canCreateBroker(),
    canCreateListing: () => AuthHelper.canCreateListing(),
  };
}