"use client";

import { useState, FormEvent, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { LogIn, Eye, EyeOff, AlertCircle, ArrowLeft } from "lucide-react";

export default function BrokerSignInPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const hasCheckedAuthRef = useRef(false);
  const redirectToRef = useRef<string | null>(null);

  // Check authentication and redirect once on mount
  useEffect(() => {
    // Only check once on mount
    if (hasCheckedAuthRef.current) return;
    hasCheckedAuthRef.current = true;
    
    // Initialize redirect if not already set
    if (redirectToRef.current === null && searchParams) {
      redirectToRef.current = searchParams.get("redirect") || "/dashboard";
    }
    
    // Check if already authenticated
    if (typeof document === 'undefined') return;
    
    const role = document.cookie
      .split(";")
      .find((c) => c.trim().startsWith("afribrok-role="))
      ?.split("=")[1];
    
    if (role === "BROKER" || role === "broker") {
      const redirectTo = redirectToRef.current || "/dashboard";
      router.replace(redirectTo);
    }
  }, []); // Empty dependency array - only run once on mount

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      // Call local authentication API route
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", // Important for cookies to be set
        body: JSON.stringify({
          email,
          password,
          role: "BROKER",
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Login failed");
      }

      // Set cookies for authentication
      document.cookie = `afribrok-role=BROKER; path=/; max-age=86400; SameSite=Lax`;
      document.cookie = `afribrok-user-id=${data.user?.id || "demo-broker-001"}; path=/; max-age=86400; SameSite=Lax`;
      if (data.token) {
        document.cookie = `afribrok-token=${data.token}; path=/; max-age=86400; SameSite=Lax`;
      }
      if (data.tenantId) {
        document.cookie = `afribrok-tenant=${data.tenantId}; path=/; max-age=86400; SameSite=Lax`;
      }

      // Redirect to broker dashboard
      router.replace(redirectToRef.current || "/dashboard");
    } catch (err) {
      console.error("Login error:", err);
      const errorMessage = err instanceof Error ? err.message : "An error occurred during login";
      setError(errorMessage);
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-200 p-8 md:p-12">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-medium text-indigo-600 hover:text-indigo-700 mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Marketplace
          </Link>

          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Broker Sign In</h1>
              <p className="text-gray-600">Sign in to access your broker dashboard</p>
            </div>

            {error && (
              <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                <p className="text-sm text-red-800">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                  Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none"
                  placeholder="broker@marketplace.com"
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none pr-12"
                    placeholder="Enter your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500" />
                  <span className="text-sm text-gray-600">Remember me</span>
                </label>
                <a href="#" className="text-sm font-semibold text-indigo-600 hover:text-indigo-700">
                  Forgot password?
                </a>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold py-3.5 px-6 rounded-lg shadow-lg hover:shadow-xl hover:from-indigo-700 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98]"
              >
                {isLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>Signing in...</span>
                  </>
                ) : (
                  <>
                    <LogIn className="w-5 h-5" />
                    <span>Sign In</span>
                  </>
                )}
              </button>
            </form>

            <div className="text-center pt-4 border-t border-slate-200">
              <p className="text-sm text-gray-600">
                Don't have a broker account?{" "}
                <Link href="/broker/apply" className="font-semibold text-indigo-600 hover:text-indigo-700">
                  Apply to become a broker
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

