"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiClient } from "@/lib/api-client";
import {
  Save,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Webhook,
  QrCode,
  Mail,
  AlertTriangle,
  RefreshCw,
} from "lucide-react";
import QRCode from "qrcode";

// Zod schema matching PlatformSettings
const BrandingSchema = z.object({
  siteName: z.string().min(1, "Site name is required"),
  logoUrl: z.string().url().optional().or(z.literal("")),
  faviconUrl: z.string().url().optional().or(z.literal("")),
  primaryColor: z.string().optional(),
  secondaryColor: z.string().optional(),
  theme: z.enum(["light", "dark", "auto"]).optional(),
});

const LocalizationSchema = z.object({
  defaultLocale: z.string().min(1),
  supportedLocales: z.array(z.string()).min(1),
  currency: z.string().min(1),
  timezone: z.string().min(1),
  dateFormat: z.string().min(1),
  timeFormat: z.string().min(1),
});

const SecuritySchema = z.object({
  require2FA: z.boolean(),
  sessionTimeout: z.number().min(5).max(1440),
  passwordMinLength: z.number().min(6).max(128),
  passwordRequireUppercase: z.boolean(),
  passwordRequireLowercase: z.boolean(),
  passwordRequireNumbers: z.boolean(),
  passwordRequireSpecialChars: z.boolean(),
  maxLoginAttempts: z.number().min(3).max(10),
  lockoutDuration: z.number().min(1).max(60),
  ipAllowlist: z.array(z.string()).optional(),
});

const TenancySchema = z.object({
  allowMultiTenant: z.boolean(),
  defaultTenantId: z.string().optional(),
  tenantIsolationLevel: z.enum(["strict", "relaxed"]),
});

const MarketplaceSchema = z.object({
  enableSellPageLeads: z.boolean(),
  enablePublicListings: z.boolean(),
  requireBrokerVerification: z.boolean(),
  listingApprovalRequired: z.boolean(),
});

const PaymentsSchema = z.object({
  defaultPaymentProvider: z.string().optional(),
  supportedCurrencies: z.array(z.string()).min(1),
  enableSubscriptions: z.boolean(),
  enableInvoicing: z.boolean(),
});

const IntegrationsSchema = z.object({
  webhookUrl: z.string().url().optional().or(z.literal("")),
  webhookSecret: z.string().optional(),
  emailProvider: z.string().optional(),
  smsProvider: z.string().optional(),
  analyticsEnabled: z.boolean(),
});

const ObservabilitySchema = z.object({
  enableLogging: z.boolean(),
  logLevel: z.enum(["debug", "info", "warn", "error"]),
  enableMetrics: z.boolean(),
  enableTracing: z.boolean(),
});

const LegalSchema = z.object({
  termsOfServiceUrl: z.string().url().optional().or(z.literal("")),
  privacyPolicyUrl: z.string().url().optional().or(z.literal("")),
  cookiePolicyUrl: z.string().url().optional().or(z.literal("")),
  gdprCompliant: z.boolean(),
});

const PlatformSettingsSchema = z.object({
  branding: BrandingSchema,
  localization: LocalizationSchema,
  security: SecuritySchema,
  tenancy: TenancySchema,
  marketplace: MarketplaceSchema,
  payments: PaymentsSchema,
  integrations: IntegrationsSchema,
  observability: ObservabilitySchema,
  legal: LegalSchema,
});

type PlatformSettings = z.infer<typeof PlatformSettingsSchema>;

interface PlatformSettingsClientProps {
  initialSettings: PlatformSettings;
  version: number;
}

type Tab = "general" | "security" | "tenancy" | "marketplace" | "payments" | "integrations" | "observability" | "legal";

export function PlatformSettingsClient({
  initialSettings,
  version: initialVersion,
}: PlatformSettingsClientProps) {
  const [activeTab, setActiveTab] = useState<Tab>("general");
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [showResetModal, setShowResetModal] = useState(false);
  const [testingWebhook, setTestingWebhook] = useState(false);
  const [testingEmail, setTestingEmail] = useState(false);
  const [qrSvg, setQrSvg] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
    reset,
    watch,
    setValue,
  } = useForm<PlatformSettings>({
    resolver: zodResolver(PlatformSettingsSchema),
    defaultValues: initialSettings,
  });

  const watchedSettings = watch();

  // Show toast and hide after 3 seconds
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const onSubmit = async (data: PlatformSettings) => {
    setSaving(true);
    try {
      await apiClient.put("/super/platform-settings", data, {
        includeTenant: false,
      });
      setToast({ type: "success", message: "Settings saved successfully" });
      reset(data);
    } catch (error) {
      setToast({
        type: "error",
        message: error instanceof Error ? error.message : "Failed to save settings",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async () => {
    setShowResetModal(false);
    setSaving(true);
    try {
      // Reset to defaults (would need to fetch defaults from API or use the defaults from types)
      const defaultSettings = {
        branding: {
          siteName: "AfriBrok",
          theme: "light" as const,
        },
        localization: {
          defaultLocale: "en-ET",
          supportedLocales: ["en-ET", "am-ET"],
          currency: "ETB",
          timezone: "Africa/Addis_Ababa",
          dateFormat: "DD/MM/YYYY",
          timeFormat: "24h",
        },
        security: {
          require2FA: false,
          sessionTimeout: 60,
          passwordMinLength: 8,
          passwordRequireUppercase: true,
          passwordRequireLowercase: true,
          passwordRequireNumbers: true,
          passwordRequireSpecialChars: false,
          maxLoginAttempts: 5,
          lockoutDuration: 15,
        },
        tenancy: {
          allowMultiTenant: true,
          tenantIsolationLevel: "strict" as const,
        },
        marketplace: {
          enableSellPageLeads: false,
          enablePublicListings: true,
          requireBrokerVerification: true,
          listingApprovalRequired: true,
        },
        payments: {
          supportedCurrencies: ["ETB", "USD"],
          enableSubscriptions: true,
          enableInvoicing: true,
        },
        integrations: {
          analyticsEnabled: true,
        },
        observability: {
          enableLogging: true,
          logLevel: "info" as const,
          enableMetrics: true,
          enableTracing: false,
        },
        legal: {
          gdprCompliant: false,
        },
      };

      await apiClient.put("/super/platform-settings", defaultSettings, {
        includeTenant: false,
      });
      reset(defaultSettings);
      setToast({ type: "success", message: "Settings reset to defaults" });
    } catch (error) {
      setToast({
        type: "error",
        message: error instanceof Error ? error.message : "Failed to reset settings",
      });
    } finally {
      setSaving(false);
    }
  };

  const handlePingWebhook = async () => {
    const webhookUrl = watchedSettings.integrations?.webhookUrl;
    if (!webhookUrl) {
      setToast({ type: "error", message: "Webhook URL is not configured" });
      return;
    }

    setTestingWebhook(true);
    try {
      const response = await fetch(webhookUrl, {
        method: "HEAD",
        mode: "no-cors",
      });
      // Since we use no-cors, we can't read the response, but if it doesn't throw, it's likely reachable
      setToast({ type: "success", message: "Webhook ping sent (check server logs)" });
    } catch (error) {
      setToast({
        type: "error",
        message: error instanceof Error ? error.message : "Failed to ping webhook",
      });
    } finally {
      setTestingWebhook(false);
    }
  };

  const handleGenerateQR = async () => {
    try {
      // Generate a sample QR code (signed)
      const sampleData = {
        id: "sample-qr-123",
        code: "AFR-QR-SAMPLE",
        signed: true,
        timestamp: new Date().toISOString(),
      };
      const qrData = JSON.stringify(sampleData);
      const svg = await QRCode.toString(qrData, {
        type: "svg",
        errorCorrectionLevel: "M",
        margin: 1,
        width: 256,
      });
      setQrSvg(svg);
      setToast({ type: "success", message: "Sample QR code generated" });
    } catch (error) {
      setToast({
        type: "error",
        message: error instanceof Error ? error.message : "Failed to generate QR code",
      });
    }
  };

  const handleTestEmail = async () => {
    setTestingEmail(true);
    try {
      // Stub: Would call API endpoint if it exists
      // For now, just show a no-op message
      setToast({
        type: "success",
        message: "Test email functionality not yet implemented",
      });
    } catch (error) {
      setToast({
        type: "error",
        message: error instanceof Error ? error.message : "Failed to send test email",
      });
    } finally {
      setTestingEmail(false);
    }
  };

  const tabs: { id: Tab; label: string }[] = [
    { id: "general", label: "General" },
    { id: "security", label: "Security" },
    { id: "tenancy", label: "Tenancy & KYC" },
    { id: "marketplace", label: "Marketplace" },
    { id: "payments", label: "Payments" },
    { id: "integrations", label: "Integrations" },
    { id: "observability", label: "Observability" },
    { id: "legal", label: "Legal" },
  ];

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed top-4 right-4 z-50 flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg ${
            toast.type === "success"
              ? "bg-green-50 border border-green-200 text-green-800"
              : "bg-red-50 border border-red-200 text-red-800"
          }`}
        >
          {toast.type === "success" ? (
            <CheckCircle2 className="w-5 h-5" />
          ) : (
            <AlertCircle className="w-5 h-5" />
          )}
          <p className="text-sm font-medium">{toast.message}</p>
        </div>
      )}

      {/* Tenant Override Banner - will be shown if tenant overrides exist */}
      {/* This is a placeholder - actual check would be done server-side */}
      {/* For now, showing a subtle banner that can be conditionally rendered */}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Platform Settings</h1>
          <p className="mt-2 text-gray-600">
            Configure platform-wide settings and policies. Version {initialVersion}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleSubmit(onSubmit)}
            disabled={!isDirty || saving}
            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-semibold hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Save Changes
              </>
            )}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? "border-indigo-500 text-indigo-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          {/* General Tab */}
          {activeTab === "general" && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900">Branding</h2>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Site Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    {...register("branding.siteName")}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                  {errors.branding?.siteName && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.branding.siteName.message}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Logo URL
                  </label>
                  <input
                    {...register("branding.logoUrl")}
                    type="url"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                  {errors.branding?.logoUrl && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.branding.logoUrl.message}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Favicon URL
                  </label>
                  <input
                    {...register("branding.faviconUrl")}
                    type="url"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Theme
                  </label>
                  <select
                    {...register("branding.theme")}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="light">Light</option>
                    <option value="dark">Dark</option>
                    <option value="auto">Auto</option>
                  </select>
                </div>
              </div>

              <h2 className="text-xl font-semibold text-gray-900 mt-8">
                Localization
              </h2>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Default Locale <span className="text-red-500">*</span>
                  </label>
                  <input
                    {...register("localization.defaultLocale")}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                  {errors.localization?.defaultLocale && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.localization.defaultLocale.message}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Currency <span className="text-red-500">*</span>
                  </label>
                  <input
                    {...register("localization.currency")}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                  {errors.localization?.currency && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.localization.currency.message}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Timezone <span className="text-red-500">*</span>
                  </label>
                  <input
                    {...register("localization.timezone")}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date Format <span className="text-red-500">*</span>
                  </label>
                  <input
                    {...register("localization.dateFormat")}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Time Format <span className="text-red-500">*</span>
                  </label>
                  <input
                    {...register("localization.timeFormat")}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Security Tab */}
          {activeTab === "security" && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900">Security Settings</h2>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    {...register("security.require2FA")}
                    className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                  />
                  <label className="text-sm font-medium text-gray-700">
                    Require 2FA
                  </label>
                </div>
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Session Timeout (minutes)
                    </label>
                    <input
                      type="number"
                      {...register("security.sessionTimeout", { valueAsNumber: true })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Password Min Length
                    </label>
                    <input
                      type="number"
                      {...register("security.passwordMinLength", { valueAsNumber: true })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Max Login Attempts
                    </label>
                    <input
                      type="number"
                      {...register("security.maxLoginAttempts", { valueAsNumber: true })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Lockout Duration (minutes)
                    </label>
                    <input
                      type="number"
                      {...register("security.lockoutDuration", { valueAsNumber: true })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Password Requirements
                  </label>
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        {...register("security.passwordRequireUppercase")}
                        className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                      />
                      <label className="text-sm text-gray-700">Require Uppercase</label>
                    </div>
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        {...register("security.passwordRequireLowercase")}
                        className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                      />
                      <label className="text-sm text-gray-700">Require Lowercase</label>
                    </div>
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        {...register("security.passwordRequireNumbers")}
                        className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                      />
                      <label className="text-sm text-gray-700">Require Numbers</label>
                    </div>
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        {...register("security.passwordRequireSpecialChars")}
                        className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                      />
                      <label className="text-sm text-gray-700">Require Special Characters</label>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tenancy Tab */}
          {activeTab === "tenancy" && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900">Tenancy & KYC</h2>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    {...register("tenancy.allowMultiTenant")}
                    className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                  />
                  <label className="text-sm font-medium text-gray-700">
                    Allow Multi-Tenant
                  </label>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Default Tenant ID
                  </label>
                  <input
                    {...register("tenancy.defaultTenantId")}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tenant Isolation Level
                  </label>
                  <select
                    {...register("tenancy.tenantIsolationLevel")}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="strict">Strict</option>
                    <option value="relaxed">Relaxed</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Marketplace Tab */}
          {activeTab === "marketplace" && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900">Marketplace</h2>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    {...register("marketplace.enableSellPageLeads")}
                    className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                  />
                  <label className="text-sm font-medium text-gray-700">
                    Enable Sell Page Lead Capture
                  </label>
                </div>
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    {...register("marketplace.enablePublicListings")}
                    className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                  />
                  <label className="text-sm font-medium text-gray-700">
                    Enable Public Listings
                  </label>
                </div>
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    {...register("marketplace.requireBrokerVerification")}
                    className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                  />
                  <label className="text-sm font-medium text-gray-700">
                    Require Broker Verification
                  </label>
                </div>
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    {...register("marketplace.listingApprovalRequired")}
                    className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                  />
                  <label className="text-sm font-medium text-gray-700">
                    Listing Approval Required
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* Payments Tab */}
          {activeTab === "payments" && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900">Payments</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Default Payment Provider
                  </label>
                  <input
                    {...register("payments.defaultPaymentProvider")}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    {...register("payments.enableSubscriptions")}
                    className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                  />
                  <label className="text-sm font-medium text-gray-700">
                    Enable Subscriptions
                  </label>
                </div>
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    {...register("payments.enableInvoicing")}
                    className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                  />
                  <label className="text-sm font-medium text-gray-700">
                    Enable Invoicing
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* Integrations Tab */}
          {activeTab === "integrations" && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900">Integrations</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Webhook URL
                  </label>
                  <div className="flex gap-2">
                    <input
                      {...register("integrations.webhookUrl")}
                      type="url"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                    <button
                      type="button"
                      onClick={handlePingWebhook}
                      disabled={testingWebhook || !watchedSettings.integrations?.webhookUrl}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 disabled:opacity-50"
                    >
                      {testingWebhook ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Webhook className="w-4 h-4" />
                      )}
                      Ping Webhook
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Webhook Secret
                  </label>
                  <input
                    {...register("integrations.webhookSecret")}
                    type="password"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Provider
                  </label>
                  <div className="flex gap-2">
                    <input
                      {...register("integrations.emailProvider")}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                    <button
                      type="button"
                      onClick={handleTestEmail}
                      disabled={testingEmail}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 disabled:opacity-50"
                    >
                      {testingEmail ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Mail className="w-4 h-4" />
                      )}
                      Send Test Email
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    SMS Provider
                  </label>
                  <input
                    {...register("integrations.smsProvider")}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    {...register("integrations.analyticsEnabled")}
                    className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                  />
                  <label className="text-sm font-medium text-gray-700">
                    Analytics Enabled
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* Observability Tab */}
          {activeTab === "observability" && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900">Observability</h2>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    {...register("observability.enableLogging")}
                    className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                  />
                  <label className="text-sm font-medium text-gray-700">
                    Enable Logging
                  </label>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Log Level
                  </label>
                  <select
                    {...register("observability.logLevel")}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="debug">Debug</option>
                    <option value="info">Info</option>
                    <option value="warn">Warn</option>
                    <option value="error">Error</option>
                  </select>
                </div>
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    {...register("observability.enableMetrics")}
                    className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                  />
                  <label className="text-sm font-medium text-gray-700">
                    Enable Metrics
                  </label>
                </div>
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    {...register("observability.enableTracing")}
                    className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                  />
                  <label className="text-sm font-medium text-gray-700">
                    Enable Tracing
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* Legal Tab */}
          {activeTab === "legal" && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900">Legal</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Terms of Service URL
                  </label>
                  <input
                    {...register("legal.termsOfServiceUrl")}
                    type="url"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                  {errors.legal?.termsOfServiceUrl && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.legal.termsOfServiceUrl.message}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Privacy Policy URL
                  </label>
                  <input
                    {...register("legal.privacyPolicyUrl")}
                    type="url"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                  {errors.legal?.privacyPolicyUrl && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.legal.privacyPolicyUrl.message}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cookie Policy URL
                  </label>
                  <input
                    {...register("legal.cookiePolicyUrl")}
                    type="url"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                  {errors.legal?.cookiePolicyUrl && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.legal.cookiePolicyUrl.message}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    {...register("legal.gdprCompliant")}
                    className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                  />
                  <label className="text-sm font-medium text-gray-700">
                    GDPR Compliant
                  </label>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleGenerateQR}
              className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200"
            >
              <QrCode className="w-4 h-4" />
              Generate Sample QR (signed)
            </button>
            {qrSvg && (
              <div className="p-4 bg-white border border-gray-200 rounded-lg">
                <div dangerouslySetInnerHTML={{ __html: qrSvg }} />
              </div>
            )}
          </div>
          <button
            type="submit"
            disabled={!isDirty || saving}
            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-semibold hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Save Changes
              </>
            )}
          </button>
        </div>
      </form>

      {/* Danger Zone */}
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-red-900 mb-2">Danger Zone</h3>
        <p className="text-sm text-red-700 mb-4">
          Reset all platform settings to their default values. This action cannot be undone.
        </p>
        <button
          onClick={() => setShowResetModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-semibold hover:bg-red-700"
        >
          <RefreshCw className="w-4 h-4" />
          Reset to Defaults
        </button>
      </div>

      {/* Reset Confirmation Modal */}
      {showResetModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Reset to Defaults
            </h3>
            <p className="text-sm text-gray-600 mb-6">
              Are you sure you want to reset all platform settings to their default values? This action cannot be undone.
            </p>
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setShowResetModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={handleReset}
                className="px-4 py-2 text-sm font-semibold text-white bg-red-600 rounded-lg hover:bg-red-700"
              >
                Reset to Defaults
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

