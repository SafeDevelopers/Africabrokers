"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, CheckCircle, Upload, X } from "lucide-react";
import { getTenant } from "../../../lib/tenant";
import { trackCta } from "../../../lib/analytics";

type Step = 1 | 2 | 3 | 4 | 5;

interface ApplicationData {
  // Step 1: Organization
  organizationName: string;
  organizationType: string;
  orgTypeNotes?: string;
  registrationNumber: string;
  country: string;
  city: string;
  address: string;
  
  // Step 2: Contacts
  primaryContactName: string;
  primaryContactEmail: string;
  primaryContactPhone: string;
  secondaryContactName?: string;
  secondaryContactEmail?: string;
  secondaryContactPhone?: string;
  
  // Step 3: Evidence
  licenseDocument?: File;
  registrationDocument?: File;
  authorizationDocument?: File;
  documents: File[];
  
  // Step 4: Operations
  teamSize: string;
  coverageAreas: string[];
  previousExperience: string;
  complianceStandards: string[];
  
  // Step 5: Legal
  termsAccepted: boolean;
  dataProtectionAccepted: boolean;
  agreementSigned: boolean;
}

const initialData: ApplicationData = {
  organizationName: "",
  organizationType: "",
  orgTypeNotes: "",
  registrationNumber: "",
  country: "",
  city: "",
  address: "",
  primaryContactName: "",
  primaryContactEmail: "",
  primaryContactPhone: "",
  documents: [],
  teamSize: "",
  coverageAreas: [],
  previousExperience: "",
  complianceStandards: [],
  termsAccepted: false,
  dataProtectionAccepted: false,
  agreementSigned: false,
};

export default function AgentApplicationPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<Step>(1);
  const [formData, setFormData] = useState<ApplicationData>(initialData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const updateFormData = (updates: Partial<ApplicationData>) => {
    setFormData((prev) => ({ ...prev, ...updates }));
  };

  const handleFileUpload = (field: keyof ApplicationData, file: File) => {
    updateFormData({ [field]: file });
    const newDocuments = [...formData.documents, file];
    updateFormData({ documents: newDocuments });
  };

  const removeFile = (index: number) => {
    const newDocuments = formData.documents.filter((_, i) => i !== index);
    updateFormData({ documents: newDocuments });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (currentStep < 5) {
      setCurrentStep((prev) => (prev + 1) as Step);
      return;
    }

    setIsSubmitting(true);

    try {
      const tenant = getTenant();
      const apiBase = process.env.NEXT_PUBLIC_CORE_API_BASE_URL || "http://localhost:8080";
      
      // Prepare form data for upload
      const payload = {
        organizationName: formData.organizationName,
        organizationType: formData.organizationType,
        orgType: formData.organizationType || undefined,
        orgTypeNotes: formData.orgTypeNotes || undefined,
        registrationNumber: formData.registrationNumber,
        country: formData.country,
        city: formData.city,
        address: formData.address,
        primaryContact: {
          name: formData.primaryContactName,
          email: formData.primaryContactEmail,
          phone: formData.primaryContactPhone,
        },
        secondaryContact: formData.secondaryContactName
          ? {
              name: formData.secondaryContactName,
              email: formData.secondaryContactEmail,
              phone: formData.secondaryContactPhone,
            }
          : undefined,
        teamSize: formData.teamSize,
        coverageAreas: formData.coverageAreas,
        previousExperience: formData.previousExperience,
        complianceStandards: formData.complianceStandards,
      };

      // TODO: Upload files to presigned URLs first, then include URLs in payload
      // For now, just send the application data
      const response = await fetch(`${apiBase}/v1/public/agents/applications`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Tenant": tenant,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`Submission failed: ${response.status}`);
      }

      trackCta({ name: "Agent Application Submitted", context: "agents-apply" });
      setSubmitSuccess(true);
    } catch (error) {
      console.error("Failed to submit application:", error);
      alert("Failed to submit application. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitSuccess) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center px-6 py-20">
        <div className="max-w-2xl w-full text-center space-y-6">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100">
            <CheckCircle className="h-12 w-12 text-emerald-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Application Submitted!</h1>
          <p className="text-lg text-gray-600">
            Thank you for your interest in becoming an AfriBrok Agent. Our team will review your
            application and get back to you within 5-7 business days.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/agents"
              className="rounded-lg border border-gray-300 bg-white px-6 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50"
            >
              Back to Agent Program
            </Link>
            <Link
              href="/"
              className="rounded-lg bg-indigo-600 px-6 py-3 text-sm font-semibold text-white hover:bg-indigo-700"
            >
              Return to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const totalSteps = 5;
  const progress = (currentStep / totalSteps) * 100;

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-4xl px-6 py-8">
          <Link
            href="/agents"
            className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-indigo-600 hover:text-indigo-700"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Agent Program
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Apply to Become an Agent</h1>
          <p className="mt-2 text-gray-600">Complete the form below to apply for agent access</p>
        </div>
      </header>

      {/* Progress Bar */}
      <div className="border-b border-slate-200 bg-white px-6 py-4">
        <div className="mx-auto max-w-4xl">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">
              Step {currentStep} of {totalSteps}
            </span>
            <span className="text-sm text-gray-500">{Math.round(progress)}%</span>
          </div>
          <div className="h-2 w-full rounded-full bg-gray-200">
            <div
              className="h-2 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      {/* Form */}
      <main className="mx-auto max-w-4xl px-6 py-12">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Step 1: Organization */}
          {currentStep === 1 && (
            <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
              <h2 className="mb-6 text-2xl font-bold text-gray-900">Organization Information</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Organization Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.organizationName}
                    onChange={(e) => updateFormData({ organizationName: e.target.value })}
                    className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10"
                    placeholder="Enter organization name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Organization Type
                  </label>
                  <select
                    value={formData.organizationType}
                    onChange={(e) => updateFormData({ organizationType: e.target.value })}
                    className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10"
                  >
                    <option value="">Select type (optional)</option>
                    <option value="Government / Public">Government / Public</option>
                    <option value="Private / Association">Private / Association</option>
                    <option value="Other (describe)">Other (describe)</option>
                  </select>
                  {formData.organizationType === "Other (describe)" && (
                    <div className="mt-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Please describe your organization type
                      </label>
                      <textarea
                        value={formData.orgTypeNotes || ""}
                        onChange={(e) => updateFormData({ orgTypeNotes: e.target.value })}
                        className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10"
                        rows={3}
                        placeholder="Describe your organization type..."
                      />
                    </div>
                  )}
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Registration Number *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.registrationNumber}
                      onChange={(e) => updateFormData({ registrationNumber: e.target.value })}
                      className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Country *</label>
                    <input
                      type="text"
                      required
                      value={formData.country}
                      onChange={(e) => updateFormData({ country: e.target.value })}
                      className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10"
                    />
                  </div>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">City *</label>
                    <input
                      type="text"
                      required
                      value={formData.city}
                      onChange={(e) => updateFormData({ city: e.target.value })}
                      className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Address *</label>
                    <input
                      type="text"
                      required
                      value={formData.address}
                      onChange={(e) => updateFormData({ address: e.target.value })}
                      className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Contacts */}
          {currentStep === 2 && (
            <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
              <h2 className="mb-6 text-2xl font-bold text-gray-900">Contact Information</h2>
              <div className="space-y-6">
                <div className="rounded-lg bg-indigo-50 p-4">
                  <h3 className="mb-4 font-semibold text-gray-900">Primary Contact *</h3>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Full Name *</label>
                      <input
                        type="text"
                        required
                        value={formData.primaryContactName}
                        onChange={(e) => updateFormData({ primaryContactName: e.target.value })}
                        className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
                      <input
                        type="email"
                        required
                        value={formData.primaryContactEmail}
                        onChange={(e) => updateFormData({ primaryContactEmail: e.target.value })}
                        className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Phone *</label>
                      <input
                        type="tel"
                        required
                        value={formData.primaryContactPhone}
                        onChange={(e) => updateFormData({ primaryContactPhone: e.target.value })}
                        className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10"
                      />
                    </div>
                  </div>
                </div>
                <div className="rounded-lg bg-gray-50 p-4">
                  <h3 className="mb-4 font-semibold text-gray-900">Secondary Contact (Optional)</h3>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                      <input
                        type="text"
                        value={formData.secondaryContactName}
                        onChange={(e) => updateFormData({ secondaryContactName: e.target.value })}
                        className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                      <input
                        type="email"
                        value={formData.secondaryContactEmail}
                        onChange={(e) => updateFormData({ secondaryContactEmail: e.target.value })}
                        className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                      <input
                        type="tel"
                        value={formData.secondaryContactPhone}
                        onChange={(e) => updateFormData({ secondaryContactPhone: e.target.value })}
                        className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Evidence */}
          {currentStep === 3 && (
            <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
              <h2 className="mb-6 text-2xl font-bold text-gray-900">Evidence & Documentation</h2>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    License Document *
                  </label>
                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleFileUpload("licenseDocument", file);
                    }}
                    className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Registration Document *
                  </label>
                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleFileUpload("registrationDocument", file);
                    }}
                    className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Authorization Document (Optional)
                  </label>
                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleFileUpload("authorizationDocument", file);
                    }}
                    className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10"
                  />
                </div>
                {formData.documents.length > 0 && (
                  <div>
                    <p className="mb-2 text-sm font-medium text-gray-700">Uploaded Documents</p>
                    <div className="space-y-2">
                      {formData.documents.map((doc, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between rounded-lg border border-gray-200 bg-gray-50 px-4 py-2"
                        >
                          <span className="text-sm text-gray-700">{doc.name}</span>
                          <button
                            type="button"
                            onClick={() => removeFile(index)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Step 4: Operations */}
          {currentStep === 4 && (
            <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
              <h2 className="mb-6 text-2xl font-bold text-gray-900">Operations</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Team Size *
                  </label>
                  <select
                    required
                    value={formData.teamSize}
                    onChange={(e) => updateFormData({ teamSize: e.target.value })}
                    className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10"
                  >
                    <option value="">Select team size</option>
                    <option value="1-5">1-5 members</option>
                    <option value="6-20">6-20 members</option>
                    <option value="21-50">21-50 members</option>
                    <option value="50+">50+ members</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Coverage Areas * (comma-separated)
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.coverageAreas.join(", ")}
                    onChange={(e) =>
                      updateFormData({
                        coverageAreas: e.target.value.split(",").map((s) => s.trim()).filter(Boolean),
                      })
                    }
                    className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10"
                    placeholder="Bole, Kazanchis, Yeka"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Previous Experience *
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={formData.previousExperience}
                    onChange={(e) => updateFormData({ previousExperience: e.target.value })}
                    className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10"
                    placeholder="Describe your organization's experience in real estate regulation, property management, or compliance enforcement..."
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 5: Legal */}
          {currentStep === 5 && (
            <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
              <h2 className="mb-6 text-2xl font-bold text-gray-900">Legal & Agreement</h2>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    required
                    id="terms"
                    checked={formData.termsAccepted}
                    onChange={(e) => updateFormData({ termsAccepted: e.target.checked })}
                    className="mt-1 h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <label htmlFor="terms" className="text-sm text-gray-700">
                    I accept the{" "}
                    <Link href="/terms" className="text-indigo-600 hover:underline">
                      Terms of Service
                    </Link>{" "}
                    and{" "}
                    <Link href="/privacy" className="text-indigo-600 hover:underline">
                      Privacy Policy
                    </Link>{" "}
                    *
                  </label>
                </div>
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    required
                    id="dataProtection"
                    checked={formData.dataProtectionAccepted}
                    onChange={(e) => updateFormData({ dataProtectionAccepted: e.target.checked })}
                    className="mt-1 h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <label htmlFor="dataProtection" className="text-sm text-gray-700">
                    I understand and agree to the data protection requirements *
                  </label>
                </div>
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    required
                    id="agreement"
                    checked={formData.agreementSigned}
                    onChange={(e) => updateFormData({ agreementSigned: e.target.checked })}
                    className="mt-1 h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <label htmlFor="agreement" className="text-sm text-gray-700">
                    I certify that all information provided is accurate and I am authorized to
                    submit this application on behalf of my organization *
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => setCurrentStep((prev) => (prev > 1 ? (prev - 1) as Step : 1))}
              disabled={currentStep === 1}
              className="rounded-lg border border-gray-300 bg-white px-6 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 px-8 py-2.5 text-sm font-semibold text-white shadow-lg transition hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50"
            >
              {currentStep < 5
                ? "Next Step"
                : isSubmitting
                ? "Submitting..."
                : "Submit Application"}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}

