"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Shield, Building2, LogIn, Eye, EyeOff, AlertCircle } from "lucide-react";

type LoginRole = "SUPER_ADMIN" | "TENANT_ADMIN";

interface RoleOption {
  value: LoginRole;
  label: string;
  description: string;
  icon: React.ReactNode;
  badge?: string;
}

const roleOptions: RoleOption[] = [
  {
    value: "SUPER_ADMIN",
    label: "Super Admin",
    description: "Platform administrator with full access",
    icon: <Shield className="w-6 h-6" />,
    badge: "Demo Account",
  },
  {
    value: "TENANT_ADMIN",
    label: "Tenant Admin",
    description: "Tenant administrator account",
    icon: <Building2 className="w-6 h-6" />,
  },
];

// Demo credentials for testing
const DEMO_ACCOUNTS: Record<LoginRole, { email: string; password: string }> = {
  SUPER_ADMIN: {
    email: "admin@afribrok.com",
    password: "admin123",
  },
  TENANT_ADMIN: {
    email: "broker@afribrok.com",
    password: "broker123",
  },
};

export default function LoginPage() {
  const router = useRouter();
  const [selectedRole, setSelectedRole] = useState<LoginRole>("SUPER_ADMIN");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      // For demo purposes, auto-fill credentials based on selected role
      const demoAccount = DEMO_ACCOUNTS[selectedRole];
      const loginEmail = email || demoAccount.email;
      const loginPassword = password || demoAccount.password;

      // Call the login API
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include", // Important for cookies to be set
        body: JSON.stringify({
          email: loginEmail,
          password: loginPassword,
          role: selectedRole,
        }),
      });

      // Read response body once
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || "Login failed");
      }

      console.log('Login successful, data:', data);
      
      // The API route already sets cookies via NextResponse.cookies.set
      // But we also set them here for immediate client-side access
      document.cookie = `afribrok-role=${selectedRole}; path=/; max-age=86400; SameSite=Lax`;
      document.cookie = `afribrok-user-id=${data.user?.id || "demo-user"}; path=/; max-age=86400; SameSite=Lax`;
      if (data.token) {
        document.cookie = `afribrok-token=${data.token}; path=/; max-age=86400; SameSite=Lax`;
      }
      if (data.tenantId && selectedRole !== "SUPER_ADMIN") {
        document.cookie = `afribrok-tenant=${data.tenantId}; path=/; max-age=86400; SameSite=Lax`;
      }

      // Small delay to ensure cookies are set, then redirect
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Redirect based on role
      console.log('Selected role:', selectedRole);
      if (selectedRole === "SUPER_ADMIN") {
        console.log('Redirecting to super admin dashboard');
        setIsLoading(false);
        window.location.replace("/superadmin/dashboard");
      } else if (selectedRole === "TENANT_ADMIN") {
        console.log('Redirecting to tenant admin dashboard');
        setIsLoading(false);
        window.location.replace("/admin/dashboard");
      } else {
        console.error('Invalid role selected:', selectedRole);
        setError("Invalid role. Only SUPER_ADMIN or TENANT_ADMIN can log in here. Brokers should sign in at the marketplace.");
        setIsLoading(false);
      }
    } catch (err) {
      console.error('Login error:', err);
      const errorMessage = err instanceof Error ? err.message : "An error occurred during login";
      setError(errorMessage);
      setIsLoading(false);
      
      // Broker login errors should redirect to marketplace
      if (error && error.includes('broker')) {
        const marketplaceUrl = process.env.NEXT_PUBLIC_MARKETPLACE_URL || "http://localhost:3000";
        window.location.href = `${marketplaceUrl}/signin`;
      }
    }
  };

  // Auto-fill demo credentials when role changes
  const handleRoleChange = (role: LoginRole) => {
    setSelectedRole(role);
    const demoAccount = DEMO_ACCOUNTS[role];
    setEmail(demoAccount.email);
    setPassword(demoAccount.password);
    setError(null);
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

            {/* Right Side - Login Form */}
            <div className="p-8 md:p-12">
              <div className="max-w-md mx-auto space-y-8">
                <div className="text-center md:text-left">
                  <h2 className="text-3xl font-bold text-gray-900 mb-2">Welcome Back</h2>
                  <p className="text-gray-600">Sign in to your admin account</p>
                </div>

                {/* Role Selection */}
                <div className="space-y-4">
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Select Account Type
                  </label>
                  <div className="grid gap-3">
                    {roleOptions.map((role) => (
                      <button
                        key={role.value}
                        type="button"
                        onClick={() => handleRoleChange(role.value)}
                        className={`group relative flex items-start gap-4 p-4 rounded-xl border-2 transition-all ${
                          selectedRole === role.value
                            ? "border-indigo-500 bg-indigo-50 shadow-md"
                            : "border-slate-200 hover:border-indigo-200 hover:bg-slate-50"
                        }`}
                      >
                        <div
                          className={`flex-shrink-0 w-12 h-12 rounded-lg flex items-center justify-center transition-colors ${
                            selectedRole === role.value
                              ? "bg-indigo-600 text-white"
                              : "bg-slate-100 text-slate-600 group-hover:bg-indigo-100 group-hover:text-indigo-600"
                          }`}
                        >
                          {role.icon}
                        </div>
                        <div className="flex-1 text-left">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-gray-900">{role.label}</h3>
                            {role.badge && (
                              <span className="px-2 py-0.5 text-xs font-bold bg-indigo-100 text-indigo-700 rounded-full">
                                {role.badge}
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 mt-1">{role.description}</p>
                        </div>
                        {selectedRole === role.value && (
                          <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-indigo-600 flex items-center justify-center">
                            <div className="w-2 h-2 rounded-full bg-white"></div>
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Login Form */}
                <form onSubmit={handleSubmit} className="space-y-6">
                  {error && (
                    <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
                      <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                      <p className="text-sm text-red-800">{error}</p>
                    </div>
                  )}

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
                      placeholder="admin@afribrok.com"
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

                {/* Demo Account Info */}
                {selectedRole === "SUPER_ADMIN" && (
                  <div className="p-4 bg-indigo-50 border border-indigo-200 rounded-lg">
                    <p className="text-xs font-semibold text-indigo-900 mb-1">Demo Account Credentials</p>
                    <p className="text-xs text-indigo-700">
                      Email: <span className="font-mono">{DEMO_ACCOUNTS.SUPER_ADMIN.email}</span>
                    </p>
                    <p className="text-xs text-indigo-700">
                      Password: <span className="font-mono">{DEMO_ACCOUNTS.SUPER_ADMIN.password}</span>
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            © 2024 AfriBrok. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}
