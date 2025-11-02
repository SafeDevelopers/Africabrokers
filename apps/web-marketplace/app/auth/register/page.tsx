"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "../../context/auth-context";

const accountTypes = [
  {
    label: "Real-estate Agency",
    value: "real-estate",
    description: "Invite your team, manage multiple brokers, and access agency analytics.",
    icon: "🏢"
  },
  {
    label: "Individual Seller",
    value: "individual",
    description: "Promote a single listing or short portfolio with AfriBrok verification support.",
    icon: "🧑🏾‍💼"
  },
  {
    label: "Tenant / Buyer",
    value: "tenant",
    description: "Save listings, message brokers, and schedule property visits with ease.",
    icon: "🏠"
  }
] as const;

export default function RegisterPage() {
  const [selectedAccount, setSelectedAccount] = useState<(typeof accountTypes)[number]["value"]>(
    "tenant"
  );
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [fullName, setFullName] = useState("");
  const [company, setCompany] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const router = useRouter();
  const { user, register: registerUser } = useAuth();

  const searchParams = useSearchParams();

  useEffect(() => {
    const role = searchParams?.get("role");
    if (role && (role === "individual" || role === "real-estate" || role === "tenant")) {
      setSelectedAccount(role as any);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  useEffect(() => {
    if (user) {
      if (user.role === "broker" || user.role === "real-estate") {
        router.replace(user.status === "approved" ? "/broker/dashboard" : "/broker/pending");
      } else if (user.role === "individual") {
        router.replace(user.status === "approved" ? "/seller/dashboard" : "/seller/pending");
      } else {
        router.replace("/dashboard");
      }
    }
  }, [user, router]);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    if (!fullName || !email || !password || !confirmPassword) {
      setError("Please complete all required fields to continue.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match. Please re-type them.");
      return;
    }

    if (!acceptTerms) {
      setError("Please accept the terms to create your account.");
      return;
    }

    setLoading(true);
    setTimeout(() => {
      const status = selectedAccount === "tenant" ? "approved" : "pending";
      registerUser({
        name: fullName,
        email,
        role: selectedAccount,
        status
      });
      if (selectedAccount === "real-estate" || selectedAccount === "individual") {
        router.push(status === "approved" ? "/seller/dashboard" : "/seller/pending");
      } else {
        router.push("/dashboard");
      }
    }, 300);
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-xl">
      <div className="border-b border-slate-100 px-8 py-6">
        <h2 className="text-2xl font-semibold text-slate-900">Create an AfriBrok account</h2>
        <p className="mt-1 text-sm text-slate-600">
          Start saving properties, messaging verified brokers, and scheduling on-site visits.
        </p>
      </div>

      <form className="space-y-6 px-8 py-8" onSubmit={handleSubmit}>
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField label="Full name" id="fullName">
            <input
              id="fullName"
              name="fullName"
              type="text"
              placeholder="Hanna Solomon"
              value={fullName}
              onChange={(event) => setFullName(event.target.value)}
              className="w-full rounded-lg border border-slate-200 px-4 py-3 text-sm text-slate-900 shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/10"
            />
          </FormField>
          <FormField label="Company (optional)" id="company">
            <input
              id="company"
              name="company"
              type="text"
              placeholder="Desta Holdings"
              value={company}
              onChange={(event) => setCompany(event.target.value)}
              className="w-full rounded-lg border border-slate-200 px-4 py-3 text-sm text-slate-900 shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/10"
            />
          </FormField>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <FormField label="Email address" id="email">
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
          </FormField>
          <FormField label="Phone number" id="phone">
            <input
              id="phone"
              name="phone"
              type="tel"
              placeholder="+251 93 456 7890"
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
              className="w-full rounded-lg border border-slate-200 px-4 py-3 text-sm text-slate-900 shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/10"
            />
          </FormField>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <FormField label="Password" id="password">
            <input
              id="password"
              name="password"
              type="password"
              placeholder="Create a password"
              autoComplete="new-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="w-full rounded-lg border border-slate-200 px-4 py-3 text-sm text-slate-900 shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/10"
            />
          </FormField>
          <FormField label="Confirm password" id="confirmPassword">
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              placeholder="Re-type your password"
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              className="w-full rounded-lg border border-slate-200 px-4 py-3 text-sm text-slate-900 shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/10"
            />
          </FormField>
        </div>

        <div className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Account type
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            {accountTypes.map((account) => {
              const isActive = selectedAccount === account.value;
              return (
                <button
                  key={account.value}
                  type="button"
                  onClick={() => setSelectedAccount(account.value)}
                  className={`flex h-full flex-col items-start gap-2 rounded-xl border p-4 text-left transition ${
                    isActive
                      ? "border-primary bg-primary/10 text-primary shadow-sm"
                      : "border-slate-200 text-slate-600 hover:border-primary/40 hover:text-primary"
                  }`}
                  aria-pressed={isActive}
                >
                  <span className="text-2xl">{account.icon}</span>
                  <span className="text-sm font-semibold">{account.label}</span>
                  <span className="text-xs text-slate-500">{account.description}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-xs text-slate-600">
          <p className="font-semibold text-slate-900">Need to become a broker?</p>
          <p className="mt-1">
            Licensed brokers must complete the dedicated application with identity and license verification.
            Head to the <Link href="/broker/apply" className="font-semibold text-primary hover:underline">broker application</Link>
            {" "}once you have your government ID and certification ready.
          </p>
        </div>

        {selectedAccount === "real-estate" || selectedAccount === "individual" ? (
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 text-sm text-slate-600">
            <p className="font-semibold text-slate-900">Approval required</p>
            <p className="mt-2 text-xs text-slate-500">
              Our partnerships team reviews seller and agency accounts within one to two business days. Keep proof of property mandates or ownership handy so we can activate your listing tools quickly.
            </p>
          </div>
        ) : null}

        <label className="flex items-start gap-3 text-sm text-slate-600">
          <input
            type="checkbox"
            className="mt-1 h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary/20"
            checked={acceptTerms}
            onChange={(event) => setAcceptTerms(event.target.checked)}
          />
          <span>
            I agree to the AfriBrok{" "}
            <Link href="#" className="font-medium text-primary hover:underline">
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link href="#" className="font-medium text-primary hover:underline">
              Privacy Policy
            </Link>
            .
          </span>
        </label>

        {error ? <p className="text-sm font-medium text-rose-600">{error}</p> : null}

        <button
          type="submit"
          disabled={!acceptTerms || loading}
          className="w-full rounded-lg bg-primary px-4 py-3 text-sm font-semibold text-white shadow-md transition disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? "Creating account..." : "Create account"}
        </button>
      </form>

      <div className="space-y-2 border-t border-slate-100 px-8 py-6">
        <p className="text-sm text-slate-600">
          Already registered?{" "}
          <Link href="/auth/login" className="font-semibold text-primary hover:underline">
            Sign in
          </Link>
        </p>
        <p className="text-xs text-slate-500">
          AfriBrok verifies every broker application manually. Expect a 1-2 business day review
          window once you submit your documents.
        </p>
      </div>
    </div>
  );
}

type FormFieldProps = {
  id: string;
  label: string;
  children: React.ReactNode;
};

function FormField({ id, label, children }: FormFieldProps) {
  return (
    <div className="space-y-2">
      <label htmlFor={id} className="text-sm font-medium text-slate-700">
        {label}
      </label>
      {children}
    </div>
  );
}
