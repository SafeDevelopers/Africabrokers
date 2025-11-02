"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../context/auth-context";

const authenticationTips = [
  "Two-factor authentication keeps your broker conversations secure.",
  "Use your business email for faster broker verification.",
  "Switch to AfriBrok Pro to unlock saved searches and analytics."
];

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"tenant" | "seller" | "broker">("tenant");
  const [sellerType, setSellerType] = useState<"individual" | "real-estate">("individual");
  const [isApproved, setIsApproved] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { user, login } = useAuth();

  useEffect(() => {
    if (user) {
      if (user.role === "broker" || user.role === "real-estate") {
        router.replace(user.status === "approved" ? "/broker/dashboard" : "/broker/pending");
      } else {
        router.replace("/dashboard");
      }
    }
  }, [user, router]);

  useEffect(() => {
    setIsApproved(role === "tenant");
  }, [role]);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    if (!email || !password) {
      setError("Enter both your email and password to continue.");
      return;
    }

    setLoading(true);

    setTimeout(() => {
      const status = isApproved ? "approved" : "pending";
      const mappedRole = role === "seller" ? sellerType : role;
      login({
        name: "Hanna Solomon",
        email,
        role: mappedRole,
        status
      });
      if (mappedRole === "broker") {
        router.push(status === "approved" ? "/broker/dashboard" : "/broker/pending");
      } else if (mappedRole === "individual" || mappedRole === "real-estate") {
        router.push(status === "approved" ? "/seller/dashboard" : "/seller/pending");
      } else {
        router.push("/dashboard");
      }
    }, 300);
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-xl">
      <div className="border-b border-slate-100 px-8 py-6">
        <h2 className="text-2xl font-semibold text-slate-900">Welcome back</h2>
        <p className="mt-1 text-sm text-slate-600">
          Sign in to continue tracking your property inquiries and favorites.
        </p>
      </div>

      <form className="space-y-6 px-8 py-8" onSubmit={handleSubmit}>
        <div className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Sign in as
          </p>
          <div className="flex gap-3">
            <RoleToggle
              label="Tenant / Buyer"
              active={role === "tenant"}
              onClick={() => setRole("tenant")}
            />
            <RoleToggle
              label="Seller / Agency"
              active={role === "seller"}
              onClick={() => setRole("seller")}
            />
            <RoleToggle
              label="Broker"
              active={role === "broker"}
              onClick={() => setRole("broker")}
            />
          </div>
          {role === "broker" ? (
            <label className="flex items-center gap-2 text-xs text-slate-600">
              <input
                type="checkbox"
                checked={isApproved}
                onChange={(event) => setIsApproved(event.target.checked)}
                className="h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary/20"
              />
              <span>My AfriBrok broker account has been approved</span>
            </label>
          ) : role === "seller" ? (
            <div className="space-y-2 text-xs text-slate-500">
              <p>
                Seller and agency accounts remain pending until the partnerships team reviews your mandate.
                Select the account type you registered with.
              </p>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setSellerType("individual")}
                  className={`rounded-full px-3 py-1 font-semibold transition ${
                    sellerType === "individual"
                      ? "bg-primary text-white"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                  aria-pressed={sellerType === "individual"}
                >
                  Individual seller
                </button>
                <button
                  type="button"
                  onClick={() => setSellerType("real-estate")}
                  className={`rounded-full px-3 py-1 font-semibold transition ${
                    sellerType === "real-estate"
                      ? "bg-primary text-white"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                  aria-pressed={sellerType === "real-estate"}
                >
                  Agency account
                </button>
              </div>
            </div>
          ) : null}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700" htmlFor="email">
            Email address
          </label>
          <input
            id="email"
            name="email"
            type="email"
            placeholder="you@example.com"
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="w-full rounded-lg border border-slate-200 px-4 py-3 text-sm text-slate-900 shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/10"
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-slate-700" htmlFor="password">
              Password
            </label>
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="text-xs font-medium text-primary hover:underline"
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>
          <input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            placeholder="••••••••"
            autoComplete="current-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="w-full rounded-lg border border-slate-200 px-4 py-3 text-sm text-slate-900 shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/10"
          />
        </div>

        <div className="flex items-center justify-between text-sm">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              name="remember"
              className="h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary/20"
            />
            <span className="text-slate-600">Keep me signed in</span>
          </label>
          <Link href="#" className="font-medium text-primary hover:underline">
            Forgot password?
          </Link>
        </div>

        {error ? <p className="text-sm font-medium text-rose-600">{error}</p> : null}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-primary px-4 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {loading ? "Signing in..." : "Sign in"}
        </button>
      </form>

      <div className="space-y-4 border-t border-slate-100 px-8 py-6">
        <p className="text-sm text-slate-600">
          Don&apos;t have an account?{" "}
          <Link href="/auth/register" className="font-semibold text-primary hover:underline">
            Create one now
          </Link>
        </p>
        {role === "broker" ? (
          <p className="text-xs text-slate-500">
            New brokers must upload government ID and license during registration. Pending accounts can
            track status via the broker portal once documents are submitted.
          </p>
        ) : role === "seller" ? (
          <p className="text-xs text-slate-500">
            Seller and agency accounts require manual approval. After signing in you&apos;ll see the status
            page until listing tools are enabled.
          </p>
        ) : null}

        <div className="rounded-lg bg-slate-50 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Tips for brokers & tenants
          </p>
          <ul className="mt-2 space-y-2 text-sm text-slate-600">
            {authenticationTips.map((tip, index) => (
              <li key={index} className="flex items-start gap-2">
                <span className="mt-1 text-primary">•</span>
                <span>{tip}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

function RoleToggle({
  label,
  active,
  onClick
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full px-4 py-1.5 text-xs font-semibold transition ${
        active ? "bg-primary text-white shadow-sm" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
      }`}
      aria-pressed={active}
    >
      {label}
    </button>
  );
}
