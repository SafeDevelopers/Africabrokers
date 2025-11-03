"use client";

import { use } from 'react';
import { getUserContext } from '../../lib/auth';

/**
 * Feature flag component for SUPER_ADMIN features
 * Only renders children if user has SUPER_ADMIN role
 */
export function SuperAdminFeature({
  children,
  fallback = null,
}: {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}) {
  // This is a client component, so we'll use cookies directly
  // For server-side checks, use the checkFeatureFlag utility
  const role = typeof window !== 'undefined' 
    ? document.cookie.split(';').find(c => c.trim().startsWith('afribrok-role='))?.split('=')[1]
    : null;

  if (role !== 'SUPER_ADMIN') {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

