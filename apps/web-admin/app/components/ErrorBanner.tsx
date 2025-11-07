"use client";

import { ApiError } from "@/lib/api";

interface ErrorBannerProps {
  error: ApiError | Error | { message: string; code?: string; status?: number };
  route?: string;
  onRetry?: () => void;
}

export function ErrorBanner({ error, route, onRetry }: ErrorBannerProps) {
  // Handle both class instances and plain objects
  const apiError = error instanceof ApiError ? error : null;
  const errorObj = error instanceof Error 
    ? (error instanceof ApiError ? error : null)
    : (typeof error === 'object' && error !== null && 'message' in error ? error : null);
  
  const isNetworkError = apiError?.isNetworkError() || 
    (errorObj && 'status' in errorObj && errorObj.status === 0) ||
    (errorObj && 'code' in errorObj && errorObj.code === 'NETWORK_ERROR') ||
    false;
  const isNotFound = apiError?.isNotFound() || 
    (errorObj && 'status' in errorObj && errorObj.status === 404) ||
    false;
  
  // Show "Service unreachable" for 404/Network errors
  const showServiceUnreachable = isNetworkError || isNotFound;
  const message = showServiceUnreachable
    ? `Service unreachable: ${route || 'API'}`
    : apiError?.message || 
      (errorObj && 'message' in errorObj ? errorObj.message : null) ||
      (error instanceof Error ? error.message : null) ||
      'An error occurred';
  
  // Handle retry - use window.location.reload if onRetry is not provided
  const handleRetry = onRetry || (() => {
    if (typeof window !== 'undefined') {
      window.location.reload();
    }
  });
  
  return (
    <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4 mb-4">
      <div className="flex items-start gap-3">
        <span className="text-xl">⚠️</span>
        <div className="flex-1">
          <h3 className="text-sm font-semibold text-red-900">Service Unreachable</h3>
          <p className="text-sm text-red-700 mt-1">{message}</p>
          {route && (
            <p className="text-xs text-red-600 mt-1">Route: {route}</p>
          )}
          <button
            onClick={handleRetry}
            className="mt-3 px-3 py-1.5 bg-red-600 text-white text-sm font-medium rounded hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      </div>
    </div>
  );
}

