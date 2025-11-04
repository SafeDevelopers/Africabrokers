"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, CheckCircle, X } from "lucide-react";
import { getTenant } from "../../../lib/tenant";
import { trackCta } from "../../../lib/analytics";

type Step = 1 | 2 | 3 | 4 | 5;

interface ApplicationData {
  // Step 1: Business/Personal Information
  businessName: string;
  businessType: string;
  businessTypeNotes?: string;
  registrationNumber: string;
  taxCertificateNumber?: string;
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
  
  // Step 3: Evidence & Documentation
  brokerageLicenseDocument?: File;
  businessRegistrationDocument?: File;
  nationalIdDocument?: File;
  professionalPhoto?: File;
  insuranceDocument?: File;
  documents: File[];
  
  // Step 4: Operations & Experience
  experienceYears: string;
  coverageAreas: string[];
  specializations: string[];
  previousExperience: string;
  clientReferences: string;
  
  // Step 5: Legal
  termsAccepted: boolean;
  dataProtectionAccepted: boolean;
  complianceAccepted: boolean;
  agreementSigned: boolean;
}

const initialData: ApplicationData = {
  businessName: "",
  businessType: "",
  businessTypeNotes: "",
  registrationNumber: "",
  taxCertificateNumber: "",
  country: "",
  city: "",
  address: "",
  primaryContactName: "",
  primaryContactEmail: "",
  primaryContactPhone: "",
  documents: [],
  experienceYears: "",
  coverageAreas: [],
  specializations: [],
  previousExperience: "",
  clientReferences: "",
  termsAccepted: false,
  dataProtectionAccepted: false,
  complianceAccepted: false,
  agreementSigned: false,
};

export default function BrokerApplyPage() {
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
      const apiBase = process.env.NEXT_PUBLIC_CORE_API_BASE_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
      
      // Prepare form data for upload
      const payload = {
        businessName: formData.businessName,
        businessType: formData.businessType,
        businessTypeNotes: formData.businessTypeNotes || undefined,
        registrationNumber: formData.registrationNumber,
        taxCertificateNumber: formData.taxCertificateNumber || undefined,
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
        experienceYears: formData.experienceYears,
        coverageAreas: formData.coverageAreas,
        specializations: formData.specializations,
        previousExperience: formData.previousExperience,
        clientReferences: formData.clientReferences,
      };

      // TODO: Upload files to presigned URLs first, then include URLs in payload
      // For now, just send the application data
      const response = await fetch(`${apiBase}/v1/public/brokers/applications`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Tenant": tenant,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Submission failed: ${response.status}`);
      }

      trackCta({ name: "Broker Application Submitted", context: "broker-apply" });
      setSubmitSuccess(true);
    } catch (error) {
      console.error("Failed to submit application:", error);
      alert(error instanceof Error ? error.message : "Failed to submit application. Please try again.");
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
            Thank you for your interest in becoming a certified AfriBrok broker. Our team will review your
            application and get back to you within 5-7 business days.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/"
              className="rounded-lg border border-gray-300 bg-white px-6 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50"
            >
              Return to Home
            </Link>
            <Link
              href="/signin"
              className="rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-white hover:bg-primary/90"
            >
              Sign In
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
            href="/"
            className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-primary hover:text-primary/80"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Apply to Become a Certified Broker</h1>
          <p className="mt-2 text-gray-600">Complete the form below to apply for broker certification</p>
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
              className="h-2 rounded-full bg-gradient-to-r from-primary to-purple-600 transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      {/* Form */}
      <main className="mx-auto max-w-4xl px-6 py-12">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Step 1: Business Information */}
          {currentStep === 1 && (
            <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
              <h2 className="mb-6 text-2xl font-bold text-gray-900">Business Information</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Business/Company Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.businessName}
                    onChange={(e) => updateFormData({ businessName: e.target.value })}
                    className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:border-primary focus:ring-2 focus:ring-primary/10"
                    placeholder="Enter your business or company name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Business Type
                  </label>
                  <select
                    value={formData.businessType}
                    onChange={(e) => updateFormData({ businessType: e.target.value })}
                    className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:border-primary focus:ring-2 focus:ring-primary/10"
                  >
                    <option value="">Select type (optional)</option>
                    <option value="Individual Broker">Individual Broker</option>
                    <option value="Real Estate Agency">Real Estate Agency</option>
                    <option value="Property Management Company">Property Management Company</option>
                    <option value="Other">Other (describe)</option>
                  </select>
                  {formData.businessType === "Other" && (
                    <div className="mt-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Please describe your business type
                      </label>
                      <textarea
                        value={formData.businessTypeNotes || ""}
                        onChange={(e) => updateFormData({ businessTypeNotes: e.target.value })}
                        className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:border-primary focus:ring-2 focus:ring-primary/10"
                        rows={3}
                        placeholder="Describe your business type..."
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
                      className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:border-primary focus:ring-2 focus:ring-primary/10"
                      placeholder="Business registration number"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tax Certificate Number
                    </label>
                    <input
                      type="text"
                      value={formData.taxCertificateNumber}
                      onChange={(e) => updateFormData({ taxCertificateNumber: e.target.value })}
                      className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:border-primary focus:ring-2 focus:ring-primary/10"
                      placeholder="Optional"
                    />
                  </div>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Country *</label>
                    <input
                      type="text"
                      required
                      value={formData.country}
                      onChange={(e) => updateFormData({ country: e.target.value })}
                      className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:border-primary focus:ring-2 focus:ring-primary/10"
                      placeholder="Ethiopia"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">City *</label>
                    <input
                      type="text"
                      required
                      value={formData.city}
                      onChange={(e) => updateFormData({ city: e.target.value })}
                      className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:border-primary focus:ring-2 focus:ring-primary/10"
                      placeholder="Addis Ababa"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Address *</label>
                  <input
                    type="text"
                    required
                    value={formData.address}
                    onChange={(e) => updateFormData({ address: e.target.value })}
                    className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:border-primary focus:ring-2 focus:ring-primary/10"
                    placeholder="Street address"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Contacts */}
          {currentStep === 2 && (
            <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
              <h2 className="mb-6 text-2xl font-bold text-gray-900">Contact Information</h2>
              <div className="space-y-6">
                <div className="rounded-lg bg-primary/5 p-4">
                  <h3 className="mb-4 font-semibold text-gray-900">Primary Contact *</h3>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Full Name *</label>
                      <input
                        type="text"
                        required
                        value={formData.primaryContactName}
                        onChange={(e) => updateFormData({ primaryContactName: e.target.value })}
                        className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:border-primary focus:ring-2 focus:ring-primary/10"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
                      <input
                        type="email"
                        required
                        value={formData.primaryContactEmail}
                        onChange={(e) => updateFormData({ primaryContactEmail: e.target.value })}
                        className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:border-primary focus:ring-2 focus:ring-primary/10"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Phone *</label>
                      <input
                        type="tel"
                        required
                        value={formData.primaryContactPhone}
                        onChange={(e) => updateFormData({ primaryContactPhone: e.target.value })}
                        className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:border-primary focus:ring-2 focus:ring-primary/10"
                        placeholder="+251 9X XXX XXXX"
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
                        className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:border-primary focus:ring-2 focus:ring-primary/10"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                      <input
                        type="email"
                        value={formData.secondaryContactEmail}
                        onChange={(e) => updateFormData({ secondaryContactEmail: e.target.value })}
                        className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:border-primary focus:ring-2 focus:ring-primary/10"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                      <input
                        type="tel"
                        value={formData.secondaryContactPhone}
                        onChange={(e) => updateFormData({ secondaryContactPhone: e.target.value })}
                        className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:border-primary focus:ring-2 focus:ring-primary/10"
                        placeholder="+251 9X XXX XXXX"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Evidence & Documentation */}
          {currentStep === 3 && (
            <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
              <h2 className="mb-6 text-2xl font-bold text-gray-900">Evidence & Documentation</h2>
              <p className="mb-6 text-sm text-gray-600">
                Upload required documents. Documents must be valid for at least six months.
              </p>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Brokerage License Document *
                  </label>
                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    required
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleFileUpload("brokerageLicenseDocument", file);
                    }}
                    className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:border-primary focus:ring-2 focus:ring-primary/10"
                  />
                  <p className="mt-1 text-xs text-gray-500">Must be issued within the last 12 months</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Business Registration Document *
                  </label>
                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    required
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleFileUpload("businessRegistrationDocument", file);
                    }}
                    className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:border-primary focus:ring-2 focus:ring-primary/10"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    National ID Document *
                  </label>
                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    required
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleFileUpload("nationalIdDocument", file);
                    }}
                    className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:border-primary focus:ring-2 focus:ring-primary/10"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Recent Professional Photo *
                  </label>
                  <input
                    type="file"
                    accept=".jpg,.jpeg,.png"
                    required
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleFileUpload("professionalPhoto", file);
                    }}
                    className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:border-primary focus:ring-2 focus:ring-primary/10"
                  />
                  <p className="mt-1 text-xs text-gray-500">For your broker badge</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Professional Indemnity Insurance (if applicable)
                  </label>
                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleFileUpload("insuranceDocument", file);
                    }}
                    className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:border-primary focus:ring-2 focus:ring-primary/10"
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

          {/* Step 4: Operations & Experience */}
          {currentStep === 4 && (
            <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
              <h2 className="mb-6 text-2xl font-bold text-gray-900">Operations & Experience</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Years of Experience *
                  </label>
                  <select
                    required
                    value={formData.experienceYears}
                    onChange={(e) => updateFormData({ experienceYears: e.target.value })}
                    className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:border-primary focus:ring-2 focus:ring-primary/10"
                  >
                    <option value="">Select experience level</option>
                    <option value="0-1">Less than 1 year</option>
                    <option value="1-3">1-3 years</option>
                    <option value="3-5">3-5 years</option>
                    <option value="5-10">5-10 years</option>
                    <option value="10+">10+ years</option>
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
                    className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:border-primary focus:ring-2 focus:ring-primary/10"
                    placeholder="Bole, Kazanchis, Yeka, etc."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Specializations (comma-separated)
                  </label>
                  <input
                    type="text"
                    value={formData.specializations.join(", ")}
                    onChange={(e) =>
                      updateFormData({
                        specializations: e.target.value.split(",").map((s) => s.trim()).filter(Boolean),
                      })
                    }
                    className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:border-primary focus:ring-2 focus:ring-primary/10"
                    placeholder="Residential, Commercial, Land, etc."
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
                    className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:border-primary focus:ring-2 focus:ring-primary/10"
                    placeholder="Describe your experience in real estate brokerage, property sales, and client management..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Client or Agency References *
                  </label>
                  <textarea
                    required
                    rows={3}
                    value={formData.clientReferences}
                    onChange={(e) => updateFormData({ clientReferences: e.target.value })}
                    className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:border-primary focus:ring-2 focus:ring-primary/10"
                    placeholder="Provide at least two references (name, contact, relationship)..."
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
                    className="mt-1 h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                  />
                  <label htmlFor="terms" className="text-sm text-gray-700">
                    I accept the{" "}
                    <Link href="/terms" className="text-primary hover:underline" target="_blank">
                      Terms of Service
                    </Link>{" "}
                    and{" "}
                    <Link href="/privacy" className="text-primary hover:underline" target="_blank">
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
                    className="mt-1 h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                  />
                  <label htmlFor="dataProtection" className="text-sm text-gray-700">
                    I understand and agree to the data protection requirements *
                  </label>
                </div>
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    required
                    id="compliance"
                    checked={formData.complianceAccepted}
                    onChange={(e) => updateFormData({ complianceAccepted: e.target.checked })}
                    className="mt-1 h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                  />
                  <label htmlFor="compliance" className="text-sm text-gray-700">
                    I commit to AfriBrok compliance & ethics policy *
                  </label>
                </div>
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    required
                    id="agreement"
                    checked={formData.agreementSigned}
                    onChange={(e) => updateFormData({ agreementSigned: e.target.checked })}
                    className="mt-1 h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                  />
                  <label htmlFor="agreement" className="text-sm text-gray-700">
                    I certify that all information provided is accurate and I am authorized to
                    submit this application on behalf of my business *
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
              className="rounded-lg bg-gradient-to-r from-primary to-purple-600 px-8 py-2.5 text-sm font-semibold text-white shadow-lg transition hover:from-primary/90 hover:to-purple-700 disabled:opacity-50"
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
