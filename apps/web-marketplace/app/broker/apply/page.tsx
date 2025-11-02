"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useAuth } from "../../context/auth-context";
import { brokers } from "../../data/mock-data";

type BrokerApplication = {
  fullName: string;
  email: string;
  phone: string;
  companyName: string;
  companyWebsite: string;
  yearsExperience: string;
  licenseNumber: string;
  licenseExpiry: string;
  serviceAreas: string[];
  specialties: string[];
  languages: string[];
  compliance: {
    backgroundCheck: boolean;
    codeOfConduct: boolean;
    disputeResolution: boolean;
  };
  notes: string;
};

const initialForm: BrokerApplication = {
  fullName: "",
  email: "",
  phone: "",
  companyName: "",
  companyWebsite: "",
  yearsExperience: "",
  licenseNumber: "",
  licenseExpiry: "",
  serviceAreas: [],
  specialties: [],
  languages: [],
  compliance: {
    backgroundCheck: false,
    codeOfConduct: false,
    disputeResolution: false
  },
  notes: ""
};

const serviceAreaOptions = [
  "Bole",
  "Kazanchis",
  "Old Airport",
  "CMC / Ayat",
  "Piassa",
  "Sarbet",
  "Lebu / Haile Garment"
];

const specialtyOptions = [
  "Residential rentals",
  "Residential sales",
  "Commercial leasing",
  "Retail spaces",
  "Industrial",
  "Diplomatic housing",
  "Luxury residences"
];

const languageOptions = ["Amharic", "English", "Oromo", "French", "Arabic"];

const steps = [
  { id: 1, title: "Personal & Contact" },
  { id: 2, title: "Company Profile" },
  { id: 3, title: "Licensing & Compliance" },
  { id: 4, title: "Review & Submit" }
] as const;

export default function BrokerApplyPage() {
  const [form, setForm] = useState<BrokerApplication>(initialForm);
  const [currentStep, setCurrentStep] = useState<(typeof steps)[number]["id"]>(1);
  const [errors, setErrors] = useState<string[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const [accountEmail, setAccountEmail] = useState("");
  const [accountPassword, setAccountPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const { register: registerUser } = useAuth();

  const verifiedCount = useMemo(() => brokers.filter((broker) => broker.verified).length, []);

  const toggleArrayValue = (field: keyof Pick<BrokerApplication, "serviceAreas" | "specialties" | "languages">, value: string) => {
    setForm((prev) => {
      const currentValues = prev[field];
      const nextValues = currentValues.includes(value)
        ? currentValues.filter((item) => item !== value)
        : [...currentValues, value];
      return { ...prev, [field]: nextValues };
    });
  };

  const updateField = <T extends keyof BrokerApplication>(field: T, value: BrokerApplication[T]) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  useEffect(() => {
    if (!accountEmail && form.email) {
      setAccountEmail(form.email);
    }
  }, [form.email, accountEmail]);

  const validateStep = (stepId: number): boolean => {
    const issues: string[] = [];
    const effectiveStep = Math.min(stepId, 4);

    if (effectiveStep >= 1) {
      if (!form.fullName) issues.push("Full name is required.");
      if (!form.email) issues.push("Email is required.");
      if (!form.phone) issues.push("Phone number is required.");
    }
    if (effectiveStep >= 2) {
      if (!form.companyName) issues.push("Company name is required.");
      if (!form.yearsExperience) issues.push("Years of experience must be provided.");
      if (form.serviceAreas.length === 0) issues.push("Select at least one service area.");
    }
    if (effectiveStep >= 3) {
      if (!form.licenseNumber) issues.push("License number is required.");
      if (!form.licenseExpiry) issues.push("License expiry date is required.");
      if (form.languages.length === 0) issues.push("Select at least one language.");
      if (Object.values(form.compliance).some((value) => value === false)) {
        issues.push("All compliance confirmations must be checked.");
      }
    }
    if (effectiveStep >= 4) {
      if (!accountEmail) issues.push("Provide an email for your broker login.");
      if (!accountPassword) issues.push("Create a password for your broker login.");
      if (accountPassword && accountPassword.length < 8) {
        issues.push("Password must be at least 8 characters long.");
      }
      if (accountPassword !== confirmPassword) {
        issues.push("Passwords do not match.");
      }
    }

    setErrors(issues);
    return issues.length === 0;
  };

  const advanceStep = () => {
    if (!validateStep(currentStep)) return;
    setErrors([]);
    setCurrentStep((prev) => (prev === steps.length ? prev : (prev + 1) as (typeof steps)[number]["id"]));
  };

  const retreatStep = () => {
    setErrors([]);
    setCurrentStep((prev) => (prev === 1 ? prev : (prev - 1) as (typeof steps)[number]["id"]));
  };

  const handleSubmit = () => {
    if (!validateStep(4)) {
      setCurrentStep(4);
      return;
    }
    registerUser({
      name: form.fullName,
      email: accountEmail || form.email,
      role: "broker",
      status: "pending"
    });
    setSubmitted(true);
  };

  const StepContent = () => {
    switch (currentStep) {
      case 1:
        return <PersonalInfoStep form={form} onChange={updateField} />;
      case 2:
        return (
          <CompanyInfoStep
            form={form}
            onChange={updateField}
            onToggleService={(value) => toggleArrayValue("serviceAreas", value)}
            onToggleSpecialty={(value) => toggleArrayValue("specialties", value)}
          />
        );
      case 3:
        return (
          <ComplianceStep
            form={form}
            onChange={updateField}
            onToggleLanguage={(value) => toggleArrayValue("languages", value)}
          />
        );
      case 4:
        return (
          <AccountSetupStep
            email={accountEmail}
            onEmailChange={setAccountEmail}
            password={accountPassword}
            onPasswordChange={setAccountPassword}
            confirmPassword={confirmPassword}
            onConfirmPasswordChange={setConfirmPassword}
          />
        );
      default:
        return <ReviewStep form={form} accountEmail={accountEmail} />;
    }
  };

  return (
    <div className="bg-slate-50 pb-20">
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-screen-2xl flex-col gap-6 px-6 py-12 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-2xl space-y-4">
            <p className="text-sm text-primary">Broker Application</p>
            <h1 className="text-4xl font-bold text-slate-900">
              Join the AfriBrok trusted broker network
            </h1>
            <p className="text-sm text-slate-600">
              Submit your credentials to list properties, access verified leads, and build trust with
              tenants and buyers across Addis Ababa. Broker applications are reviewed within two business
              days.
            </p>
          <div className="grid gap-4 sm:grid-cols-3">
            <StatCard title="Verified brokers" value={`${verifiedCount}+`} />
            <StatCard title="Avg. response time" value="< 48 hrs" />
            <StatCard title="Active listings" value="1,200+" />
          </div>
          <div className="flex flex-wrap gap-3 text-sm">
            <Link
              href="https://example.com/broker-course"
              className="inline-flex items-center rounded-md border border-primary/40 px-4 py-2 text-sm font-semibold text-primary transition hover:bg-primary/10"
            >
              Need the broker course? View providers →
            </Link>
          </div>
        </div>

          <div className="rounded-2xl border border-primary/20 bg-primary/10 p-6 text-sm text-primary shadow-sm">
            ✅ Requirements snapshot
            <ul className="mt-3 space-y-2 text-primary/90">
              <li>• Valid Ethiopian real estate license</li>
              <li>• Proof of company registration (if applicable)</li>
              <li>• Agreement to AfriBrok code of conduct</li>
            </ul>
          </div>
        </div>
      </section>

      <main className="mx-auto mt-10 flex max-w-screen-2xl flex-col gap-6 px-6 lg:flex-row">
        <aside className="top-24 h-max w-full rounded-2xl border border-slate-200 bg-white p-6 shadow-sm lg:w-80">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
            Application progress
          </h2>
          <ol className="mt-4 space-y-4 text-sm">
            {steps.map((step) => {
              const isActive = step.id === currentStep;
              const isCompleted = step.id < currentStep || (submitted && step.id === steps.length);
              return (
                <li key={step.id} className="flex items-center justify-between">
                  <div>
                    <span
                      className={`flex h-8 w-8 items-center justify-center rounded-full border text-xs font-semibold ${
                        isCompleted
                          ? "border-emerald-400 bg-emerald-50 text-emerald-600"
                          : isActive
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-slate-200 text-slate-500"
                      }`}
                    >
                      {isCompleted ? "✓" : step.id}
                    </span>
                  </div>
                  <div className="flex-1 pl-3">
                    <p className={`text-sm font-medium ${isActive ? "text-slate-900" : "text-slate-600"}`}>
                      {step.title}
                    </p>
                  </div>
                </li>
              );
            })}
          </ol>
        </aside>

        <section className="flex-1 rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          {submitted ? (
            <SubmissionSuccess />
          ) : (
            <>
              <StepHeader step={currentStep} />
              {errors.length > 0 ? (
                <div className="mb-6 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-700">
                  <p className="font-semibold">Complete the required fields</p>
                  <ul className="mt-2 list-disc space-y-1 pl-5">
                    {errors.map((error) => (
                      <li key={error}>{error}</li>
                    ))}
                  </ul>
                </div>
              ) : null}

              <StepContent />

              <div className="mt-8 flex items-center justify-between">
                <button
                  type="button"
                  onClick={retreatStep}
                  disabled={currentStep === 1}
                  className="rounded-md border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Back
                </button>

                {currentStep < steps.length ? (
                  <button
                    type="button"
                    onClick={advanceStep}
                    className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-primary/90"
                  >
                    Continue
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleSubmit}
                    className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-primary/90"
                  >
                    Submit application
                  </button>
                )}
              </div>
            </>
          )}
        </section>
      </main>
    </div>
  );
}

function StatCard({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 text-sm shadow-sm">
      <p className="text-xs uppercase tracking-wide text-slate-500">{title}</p>
      <p className="mt-2 text-2xl font-bold text-slate-900">{value}</p>
    </div>
  );
}

function StepHeader({ step }: { step: number }) {
  const copy = {
    1: {
      title: "Tell us about you",
      description:
        "Provide your personal contact information so we can verify your identity and keep you updated about your application."
    },
    2: {
      title: "Your brokerage profile",
      description:
        "Share your company background, service areas, and specialties. This helps us match you with the right leads."
    },
    3: {
      title: "Licensing & compliance",
      description:
        "Upload your license information and confirm compliance requirements. All brokers must agree to AfriBrok standards."
    },
    4: {
      title: "Create your broker login",
      description:
        "Secure your AfriBrok portal with a unique email and password. You’ll sign in here once your account is approved."
    },
    5: {
      title: "Review and confirm",
      description:
        "Double-check your application details before submitting. You can still edit previous steps if needed."
    }
  } as const;

  const content = copy[step as keyof typeof copy] ?? copy[5];
  return (
    <header className="mb-8 space-y-2">
      <p className="text-xs font-semibold uppercase tracking-wide text-primary">Step {step}</p>
      <h2 className="text-2xl font-semibold text-slate-900">{content.title}</h2>
      <p className="text-sm text-slate-600">{content.description}</p>
    </header>
  );
}

type PersonalInfoProps = {
  form: BrokerApplication;
  onChange: <K extends keyof BrokerApplication>(field: K, value: BrokerApplication[K]) => void;
};

function PersonalInfoStep({ form, onChange }: PersonalInfoProps) {
  return (
    <div className="grid gap-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <FormField label="Full name" required>
          <input
            value={form.fullName}
            onChange={(event) => onChange("fullName", event.target.value)}
            placeholder="Alem Fekadu"
            className="w-full rounded-lg border border-slate-200 px-4 py-3 text-sm text-slate-900 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/10"
          />
        </FormField>
        <FormField label="Email address" required>
          <input
            type="email"
            value={form.email}
            onChange={(event) => onChange("email", event.target.value)}
            placeholder="alem@example.com"
            className="w-full rounded-lg border border-slate-200 px-4 py-3 text-sm text-slate-900 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/10"
          />
        </FormField>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <FormField label="Phone number" required>
          <input
            value={form.phone}
            onChange={(event) => onChange("phone", event.target.value)}
            placeholder="+251 90 123 4567"
            className="w-full rounded-lg border border-slate-200 px-4 py-3 text-sm text-slate-900 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/10"
          />
        </FormField>
        <FormField label="LinkedIn or portfolio (optional)">
          <input
            value={form.notes}
            onChange={(event) => onChange("notes", event.target.value)}
            placeholder="https://linkedin.com/in/..."
            className="w-full rounded-lg border border-slate-200 px-4 py-3 text-sm text-slate-900 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/10"
          />
        </FormField>
      </div>
    </div>
  );
}

type CompanyInfoProps = {
  form: BrokerApplication;
  onChange: <K extends keyof BrokerApplication>(field: K, value: BrokerApplication[K]) => void;
  onToggleService: (value: string) => void;
  onToggleSpecialty: (value: string) => void;
};

function CompanyInfoStep({ form, onChange, onToggleService, onToggleSpecialty }: CompanyInfoProps) {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <FormField label="Company or brokerage name" required>
          <input
            value={form.companyName}
            onChange={(event) => onChange("companyName", event.target.value)}
            placeholder="Desta Real Estate"
            className="w-full rounded-lg border border-slate-200 px-4 py-3 text-sm text-slate-900 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/10"
          />
        </FormField>
        <FormField label="Company website">
          <input
            value={form.companyWebsite}
            onChange={(event) => onChange("companyWebsite", event.target.value)}
            placeholder="https://destaestate.com"
            className="w-full rounded-lg border border-slate-200 px-4 py-3 text-sm text-slate-900 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/10"
          />
        </FormField>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <FormField label="Years of experience" required>
          <select
            value={form.yearsExperience}
            onChange={(event) => onChange("yearsExperience", event.target.value)}
            className="w-full rounded-lg border border-slate-200 px-4 py-3 text-sm text-slate-900 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/10"
          >
            <option value="">Select range</option>
            <option value="0-2 years">0-2 years</option>
            <option value="3-5 years">3-5 years</option>
            <option value="6-10 years">6-10 years</option>
            <option value="10+ years">10+ years</option>
          </select>
        </FormField>
        <FormField label="Team size (optional)">
          <select
            value={form.notes}
            onChange={(event) => onChange("notes", event.target.value)}
            className="w-full rounded-lg border border-slate-200 px-4 py-3 text-sm text-slate-900 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/10"
          >
            <option value="">Select size</option>
            <option value="1-3 agents">1-3 agents</option>
            <option value="4-10 agents">4-10 agents</option>
            <option value="11-25 agents">11-25 agents</option>
            <option value="26+ agents">26+ agents</option>
          </select>
        </FormField>
      </div>

      <fieldset className="space-y-3">
        <legend className="text-sm font-semibold text-slate-900">Service areas *</legend>
        <p className="text-xs text-slate-500">Select all neighborhoods where you actively represent clients.</p>
        <div className="grid gap-3 sm:grid-cols-2">
          {serviceAreaOptions.map((area) => (
            <ToggleCard
              key={area}
              label={area}
              active={form.serviceAreas.includes(area)}
              onClick={() => onToggleService(area)}
            />
          ))}
        </div>
      </fieldset>

      <fieldset className="space-y-3">
        <legend className="text-sm font-semibold text-slate-900">Specialties *</legend>
        <p className="text-xs text-slate-500">Tell us which property types or client segments you focus on.</p>
        <div className="grid gap-3 sm:grid-cols-2">
          {specialtyOptions.map((specialty) => (
            <ToggleCard
              key={specialty}
              label={specialty}
              active={form.specialties.includes(specialty)}
              onClick={() => onToggleSpecialty(specialty)}
            />
          ))}
        </div>
      </fieldset>
    </div>
  );
}

type ComplianceProps = {
  form: BrokerApplication;
  onChange: <K extends keyof BrokerApplication>(field: K, value: BrokerApplication[K]) => void;
  onToggleLanguage: (value: string) => void;
};

function ComplianceStep({ form, onChange, onToggleLanguage }: ComplianceProps) {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <FormField label="License number" required>
          <input
            value={form.licenseNumber}
            onChange={(event) => onChange("licenseNumber", event.target.value)}
            placeholder="ET-REA-XXXXX"
            className="w-full rounded-lg border border-slate-200 px-4 py-3 text-sm text-slate-900 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/10"
          />
        </FormField>
        <FormField label="License expiry date" required>
          <input
            type="date"
            value={form.licenseExpiry}
            onChange={(event) => onChange("licenseExpiry", event.target.value)}
            className="w-full rounded-lg border border-slate-200 px-4 py-3 text-sm text-slate-900 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/10"
          />
        </FormField>
      </div>

      <fieldset className="space-y-3">
        <legend className="text-sm font-semibold text-slate-900">Languages spoken *</legend>
        <div className="flex flex-wrap gap-3">
          {languageOptions.map((lang) => (
            <TogglePill
              key={lang}
              label={lang}
              active={form.languages.includes(lang)}
              onClick={() => onToggleLanguage(lang)}
            />
          ))}
        </div>
      </fieldset>

      <div className="space-y-3 rounded-2xl border border-slate-200 bg-slate-50 p-6">
        <p className="text-sm font-semibold text-slate-900">Compliance confirmations *</p>
        <label className="flex items-start gap-3 text-sm text-slate-600">
          <input
            type="checkbox"
            checked={form.compliance.backgroundCheck}
            onChange={(event) =>
              onChange("compliance", { ...form.compliance, backgroundCheck: event.target.checked })
            }
            className="mt-1 h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary/20"
          />
          <span>I authorize AfriBrok to conduct a professional background and license validity check.</span>
        </label>
        <label className="flex items-start gap-3 text-sm text-slate-600">
          <input
            type="checkbox"
            checked={form.compliance.codeOfConduct}
            onChange={(event) =>
              onChange("compliance", { ...form.compliance, codeOfConduct: event.target.checked })
            }
            className="mt-1 h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary/20"
          />
          <span>I agree to follow the AfriBrok broker code of conduct and client communication standards.</span>
        </label>
        <label className="flex items-start gap-3 text-sm text-slate-600">
          <input
            type="checkbox"
            checked={form.compliance.disputeResolution}
            onChange={(event) =>
              onChange("compliance", {
                ...form.compliance,
                disputeResolution: event.target.checked
              })
            }
            className="mt-1 h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary/20"
          />
          <span>I will cooperate with AfriBrok dispute resolution processes when representing clients.</span>
        </label>
      </div>
    </div>
  );
}

type AccountSetupProps = {
  email: string;
  onEmailChange: (value: string) => void;
  password: string;
  onPasswordChange: (value: string) => void;
  confirmPassword: string;
  onConfirmPasswordChange: (value: string) => void;
};

function AccountSetupStep({
  email,
  onEmailChange,
  password,
  onPasswordChange,
  confirmPassword,
  onConfirmPasswordChange
}: AccountSetupProps) {
  return (
    <div className="space-y-6">
      <p className="text-sm text-slate-600">
        Set the credentials you’ll use to sign in once AfriBrok verifies your documents. Use a secure
        password you don’t reuse elsewhere.
      </p>
      <div className="grid gap-4 sm:grid-cols-2">
        <FormField label="Account email" required>
          <input
            type="email"
            value={email}
            onChange={(event) => onEmailChange(event.target.value)}
            placeholder="you@example.com"
            className="w-full rounded-lg border border-slate-200 px-4 py-3 text-sm text-slate-900 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/10"
          />
        </FormField>
        <FormField label="Password" required>
          <input
            type="password"
            value={password}
            onChange={(event) => onPasswordChange(event.target.value)}
            placeholder="Minimum 8 characters"
            className="w-full rounded-lg border border-slate-200 px-4 py-3 text-sm text-slate-900 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/10"
          />
        </FormField>
      </div>
      <FormField label="Confirm password" required>
        <input
          type="password"
          value={confirmPassword}
          onChange={(event) => onConfirmPasswordChange(event.target.value)}
          placeholder="Re-enter password"
          className="w-full rounded-lg border border-slate-200 px-4 py-3 text-sm text-slate-900 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/10"
        />
      </FormField>
      <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-xs text-slate-500">
        <p className="font-semibold text-slate-900">What’s next?</p>
        <ul className="mt-2 space-y-1">
          <li>• Approved brokers receive a unique AfriBrok QR badge tied to this account.</li>
          <li>• You can reset this password anytime from the login screen.</li>
        </ul>
      </div>
    </div>
  );
}

function ReviewStep({ form, accountEmail }: { form: BrokerApplication; accountEmail: string }) {
  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
          Personal & contact
        </h3>
        <div className="mt-4 grid gap-4 text-sm text-slate-700 sm:grid-cols-2">
          <ReviewLine label="Full name" value={form.fullName} />
          <ReviewLine label="Email" value={form.email} />
          <ReviewLine label="Phone" value={form.phone} />
          <ReviewLine label="Portfolio" value={form.notes || "—"} />
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
          Company profile
        </h3>
        <div className="mt-4 grid gap-4 text-sm text-slate-700 sm:grid-cols-2">
          <ReviewLine label="Company" value={form.companyName} />
          <ReviewLine label="Website" value={form.companyWebsite || "—"} />
          <ReviewLine label="Experience" value={form.yearsExperience || "—"} />
          <ReviewLine label="Team size" value={form.notes || "—"} />
        </div>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <ReviewTagGroup title="Service areas" items={form.serviceAreas} />
          <ReviewTagGroup title="Specialties" items={form.specialties} />
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
          Licensing & compliance
        </h3>
        <div className="mt-4 grid gap-4 text-sm text-slate-700 sm:grid-cols-2">
          <ReviewLine label="License number" value={form.licenseNumber} />
          <ReviewLine label="License expiry" value={form.licenseExpiry} />
          <ReviewTagGroup title="Languages" items={form.languages} />
        </div>
        <div className="mt-4 rounded-lg border border-slate-200 bg-white p-4">
          <ReviewLine label="Broker login email" value={accountEmail || form.email} />
          <p className="mt-2 text-xs text-slate-500">
            Password is securely stored. You can reset it from the sign-in screen if needed.
          </p>
        </div>
        <div className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">
          <p className="font-semibold">Compliance confirmed</p>
          <p className="mt-1">
            All AfriBrok standards are accepted. Our verification team will reach out if additional
            documents are needed.
          </p>
        </div>
      </div>
    </div>
  );
}

function SubmissionSuccess() {
  return (
    <div className="flex flex-col items-center justify-center gap-6 text-center">
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100 text-3xl text-emerald-600">
        🎉
      </div>
      <div className="space-y-2">
        <h2 className="text-2xl font-semibold text-slate-900">Application submitted</h2>
        <p className="text-sm text-slate-600">
          Thanks for applying to AfriBrok. Our verification team will review your documentation and follow up
          within two business days. We&apos;ve saved your broker login credentials—sign in anytime to check your status.
        </p>
      </div>
      <div className="flex flex-col gap-3 sm:flex-row">
        <Link
          href="/broker/dashboard"
          className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-primary/90"
        >
          Explore broker dashboard
        </Link>
        <Link
          href="/listings"
          className="rounded-md border border-primary/40 px-4 py-2 text-sm font-semibold text-primary transition hover:bg-primary/10"
        >
          View marketplace
        </Link>
      </div>
    </div>
  );
}

type FormFieldProps = {
  label: string;
  required?: boolean;
  children: React.ReactNode;
};

function FormField({ label, required, children }: FormFieldProps) {
  return (
    <label className="space-y-2 text-sm">
      <span className="block font-semibold text-slate-700">
        {label}
        {required ? <span className="ml-1 text-primary">*</span> : null}
      </span>
      {children}
    </label>
  );
}

function ToggleCard({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex h-full items-start rounded-xl border px-4 py-3 text-sm font-medium transition ${
        active
          ? "border-primary bg-primary/10 text-primary shadow-sm"
          : "border-slate-200 text-slate-600 hover:border-primary/40 hover:text-primary"
      }`}
      aria-pressed={active}
    >
      {label}
    </button>
  );
}

function TogglePill({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full px-4 py-1.5 text-xs font-medium transition ${
        active ? "bg-primary text-white shadow-sm" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
      }`}
      aria-pressed={active}
    >
      {label}
    </button>
  );
}

function ReviewLine({ label, value }: { label: string; value: string }) {
  return (
    <p>
      <span className="text-xs uppercase tracking-wide text-slate-500">{label}</span>
      <br />
      <span className="font-medium text-slate-800">{value || "—"}</span>
    </p>
  );
}

function ReviewTagGroup({ title, items }: { title: string; items: string[] }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-wide text-slate-500">{title}</p>
      <div className="mt-2 flex flex-wrap gap-2">
        {items.length > 0 ? (
          items.map((item) => (
            <span
              key={item}
              className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary"
            >
              {item}
            </span>
          ))
        ) : (
          <span className="text-sm text-slate-500">—</span>
        )}
      </div>
    </div>
  );
}
