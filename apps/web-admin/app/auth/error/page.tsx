"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import Link from "next/link";
import { AlertCircle, RefreshCw } from "lucide-react";

function ErrorContent() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");
  
  // NextAuth error codes and their meanings
  const errorMessages: Record<string, { title: string; description: string }> = {
    Configuration: {
      title: "Configuration Error",
      description: "There is a problem with the server configuration. Please contact support.",
    },
    AccessDenied: {
      title: "Access Denied",
      description: "You do not have permission to sign in. Please contact your administrator.",
    },
    Verification: {
      title: "Verification Error",
      description: "The verification token has expired or has already been used. Please try signing in again.",
    },
    OAuthCallback: {
      title: "OAuth Callback Error",
      description: "An error occurred while processing your login. This usually means the authentication callback failed. Check the server logs for details.",
    },
    OAuthAccountNotLinked: {
      title: "Account Not Linked",
      description: "This account is not linked to your user profile. Please contact support.",
    },
    keycloak: {
      title: "Keycloak Authentication Error",
      description: "Keycloak returned an error during authentication. This usually means there's a configuration issue with the Keycloak client or redirect URI.",
    },
    Default: {
      title: "Authentication Error",
      description: "An error occurred during authentication. Please try again.",
    },
  };

  const errorInfo = error ? errorMessages[error] || errorMessages.Default : errorMessages.Default;
  const rawError = error || "Unknown error";

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-200 p-8">
          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                  <AlertCircle className="w-6 h-6 text-red-600" />
                </div>
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">{errorInfo.title}</h2>
                <p className="text-gray-600 mb-4">{errorInfo.description}</p>
                {process.env.NODE_ENV === "development" && (
                  <div className="mt-4 p-3 bg-gray-100 rounded-lg">
                    <p className="text-xs font-mono text-gray-700">
                      Error Code: <strong>{rawError}</strong>
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-3 pt-4 border-t border-gray-200">
              <Link
                href="/auth/signin"
                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold py-3 px-6 rounded-lg shadow-lg hover:shadow-xl hover:from-indigo-700 hover:to-purple-700 transition-all"
              >
                <RefreshCw className="w-5 h-5" />
                <span>Try Again</span>
              </Link>
              
              <div className="text-center">
                <Link
                  href="/login"
                  className="text-sm text-gray-600 hover:text-indigo-600"
                >
                  Back to Login
                </Link>
              </div>
            </div>

            {process.env.NODE_ENV === "development" && (
              <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-xs text-yellow-800 font-semibold mb-2">Debug Information:</p>
                <ul className="text-xs text-yellow-700 space-y-1">
                  <li>• Check Keycloak redirect URI includes: <code className="bg-yellow-100 px-1 rounded">http://localhost:3000/api/auth/callback/keycloak</code></li>
                  <li>• Verify NEXTAUTH_URL is set to: <code className="bg-yellow-100 px-1 rounded">http://localhost:3000</code></li>
                  <li>• Check server logs for detailed error messages</li>
                  <li>• Ensure Keycloak client is configured correctly</li>
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ErrorPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    }>
      <ErrorContent />
    </Suspense>
  );
}

