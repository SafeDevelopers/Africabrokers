"use client";

import { signIn } from "next-auth/react";
import { Shield, LogIn } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function SignInContent() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/";

  const handleKeycloakSignIn = () => {
    signIn("keycloak", { callbackUrl });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center p-4">
      <div className="w-full max-w-5xl">
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-200">
          <div className="grid md:grid-cols-2">
            {/* Left Side - Branding */}
            <div className="hidden md:flex flex-col justify-center items-center bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 p-12 text-white relative overflow-hidden">
              <div className="absolute inset-0 bg-black/10"></div>
              <div className="relative z-10 text-center space-y-6">
                <div className="flex items-center justify-center mb-8">
                  <div className="w-20 h-20 rounded-2xl bg-white/20 backdrop-blur-lg flex items-center justify-center shadow-2xl">
                    <Shield className="w-10 h-10 text-white" />
                  </div>
                </div>
                <h1 className="text-4xl font-bold">AfriBrok Admin</h1>
                <p className="text-lg text-white/90">Platform Administration & Management</p>
                <div className="pt-6 space-y-3">
                  <div className="flex items-center gap-3 text-white/80">
                    <div className="w-2 h-2 rounded-full bg-white/60"></div>
                    <span className="text-sm">Secure multi-tenant platform</span>
                  </div>
                  <div className="flex items-center gap-3 text-white/80">
                    <div className="w-2 h-2 rounded-full bg-white/60"></div>
                    <span className="text-sm">Real-time analytics & insights</span>
                  </div>
                  <div className="flex items-center gap-3 text-white/80">
                    <div className="w-2 h-2 rounded-full bg-white/60"></div>
                    <span className="text-sm">Comprehensive broker management</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Side - Sign In Form */}
            <div className="p-8 md:p-12">
              <div className="max-w-md mx-auto space-y-8">
                <div className="text-center md:text-left">
                  <h2 className="text-3xl font-bold text-gray-900 mb-2">Welcome Back</h2>
                  <p className="text-gray-600">Sign in to your admin account</p>
                </div>

                <div className="space-y-6">
                  <button
                    onClick={handleKeycloakSignIn}
                    className="w-full flex items-center justify-center gap-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold py-3.5 px-6 rounded-lg shadow-lg hover:shadow-xl hover:from-indigo-700 hover:to-purple-700 transition-all transform hover:scale-[1.02] active:scale-[0.98]"
                  >
                    <LogIn className="w-5 h-5" />
                    <span>Sign In with Keycloak</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            © 2025 AfriBrok. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}

export default function SignInPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    }>
      <SignInContent />
    </Suspense>
  );
}

