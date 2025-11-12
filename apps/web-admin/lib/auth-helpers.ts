import { getToken } from "next-auth/jwt";
import { NextRequest } from "next/server";

/**
 * Get user roles from NextAuth session
 */
export async function getUserRoles(req: NextRequest): Promise<string[]> {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  return (token?.roles as string[]) || [];
}

/**
 * Check if user has required role
 */
export function hasRole(userRoles: string[], requiredRoles: string[]): boolean {
  // SUPER_ADMIN has access to everything
  if (userRoles.includes("SUPER_ADMIN")) {
    return true;
  }
  return requiredRoles.some((role) => userRoles.includes(role));
}

/**
 * Get access token from NextAuth session
 */
export async function getAccessToken(req: NextRequest): Promise<string | null> {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  return (token?.accessToken as string) || null;
}

