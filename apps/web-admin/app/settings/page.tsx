"use client";

import { useEffect, useState } from "react";

interface PlatformSettings {
  siteName: string;
  supportEmail: string;
  enableRegistrations: boolean;
  defaultLocale: string;
  theme: "light" | "dark";
  brandingLogoUrl?: string;
  smtpHost?: string;
  smtpPort?: number;
  smtpUser?: string;
}

const STORAGE_KEY = "afribrok:platform_settings:v1";

const defaultSettings: PlatformSettings = {
  siteName: "AfriBrok",
  supportEmail: "support@afribrok.et",
  enableRegistrations: true,
  defaultLocale: "en-ET",
  theme: "light",
  brandingLogoUrl: "/logo.png",
  smtpHost: "smtp.example.com",
  smtpPort: 587,
  smtpUser: "smtp-user",
};

export default function PlatformSettingsPage() {
  const [settings, setSettings] = useState<PlatformSettings>(defaultSettings);
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<string | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        setSettings({ ...defaultSettings, ...parsed });
      }
    } catch (err) {
      // ignore parse errors
    }
  }, []);

  const update = <K extends keyof PlatformSettings>(key: K, value: PlatformSettings[K]) => {
    setSettings((s) => ({ ...s, [key]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    // Simulate API save latency
    await new Promise((r) => setTimeout(r, 600));
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    setSavedAt(new Date().toISOString());
    setSaving(false);
  };

  const handleReset = () => {
    setSettings(defaultSettings);
    localStorage.removeItem(STORAGE_KEY);
    setSavedAt(null);
  };

  return (
    <div className="bg-gray-50 min-h-full">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Platform Settings</h1>
              <p className="text-sm text-gray-500">Configure global settings for the AfriBrok platform.</p>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={handleReset}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50"
              >
                Reset to defaults
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-60"
              >
                {saving ? "Saving..." : "Save Settings"}
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <section className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900">General</h2>
              <p className="text-sm text-gray-500 mt-1">Basic site settings and defaults.</p>

              <div className="mt-4 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Site Name</label>
                  <input
                    type="text"
                    value={settings.siteName}
                    onChange={(e) => update("siteName", e.target.value)}
                    className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Support Email</label>
                  <input
                    type="email"
                    value={settings.supportEmail}
                    onChange={(e) => update("supportEmail", e.target.value)}
                    className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Default Locale</label>
                    <select
                      value={settings.defaultLocale}
                      onChange={(e) => update("defaultLocale", e.target.value)}
                      className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="en-ET">English (Ethiopia)</option>
                      <option value="am-ET">Amharic (Ethiopia)</option>
                      <option value="om-ET">Oromo (Ethiopia)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Allow Registrations</label>
                    <div className="mt-1">
                      <label className="inline-flex items-center">
                        <input
                          type="checkbox"
                          checked={settings.enableRegistrations}
                          onChange={(e) => update("enableRegistrations", e.target.checked)}
                          className="form-checkbox h-5 w-5 text-indigo-600"
                        />
                        <span className="ml-2 text-sm text-gray-700">Enable new user signups</span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <section className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900">Branding</h2>
              <p className="text-sm text-gray-500 mt-1">Logo and visual preferences.</p>

              <div className="mt-4 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Site Theme</label>
                  <div className="mt-2 flex items-center gap-3">
                    <button
                      onClick={() => update("theme", "light")}
                      className={`px-3 py-2 rounded-lg border ${settings.theme === "light" ? "bg-indigo-50 border-indigo-300" : "bg-white border-gray-200"}`}
                    >
                      Light
                    </button>
                    <button
                      onClick={() => update("theme", "dark")}
                      className={`px-3 py-2 rounded-lg border ${settings.theme === "dark" ? "bg-indigo-50 border-indigo-300" : "bg-white border-gray-200"}`}
                    >
                      Dark
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Branding Logo URL</label>
                  <input
                    type="text"
                    value={settings.brandingLogoUrl || ""}
                    onChange={(e) => update("brandingLogoUrl", e.target.value)}
                    className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  />
                  {settings.brandingLogoUrl && (
                    <div className="mt-3">
                      <p className="text-sm text-gray-500">Preview</p>
                      <div className="mt-2 w-36 h-12 bg-gray-100 rounded flex items-center justify-center overflow-hidden">
                        <img src={settings.brandingLogoUrl} alt="logo preview" className="h-full object-contain" />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </section>

            <section className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900">Email / SMTP</h2>
              <p className="text-sm text-gray-500 mt-1">Outgoing mail configuration used for notifications and verification.</p>

              <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">SMTP Host</label>
                  <input
                    type="text"
                    value={settings.smtpHost || ""}
                    onChange={(e) => update("smtpHost", e.target.value)}
                    className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">SMTP Port</label>
                  <input
                    type="number"
                    value={settings.smtpPort ?? 0}
                    onChange={(e) => update("smtpPort", Number(e.target.value))}
                    className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">SMTP User</label>
                  <input
                    type="text"
                    value={settings.smtpUser || ""}
                    onChange={(e) => update("smtpUser", e.target.value)}
                    className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>
            </section>
          </div>

          <aside className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-sm font-semibold text-gray-900">Status</h3>
              <p className="text-sm text-gray-500 mt-2">Last saved</p>
              <div className="mt-3">
                {savedAt ? (
                  <p className="text-sm text-gray-700">{new Date(savedAt).toLocaleString()}</p>
                ) : (
                  <p className="text-sm text-gray-500">Not saved yet</p>
                )}
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-sm font-semibold text-gray-900">Quick Actions</h3>
              <div className="mt-4 space-y-3">
                <button
                  onClick={() => {
                    // Toggle registrations quickly
                    update("enableRegistrations", !settings.enableRegistrations);
                  }}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50"
                >
                  Toggle Registrations
                </button>
                <button
                  onClick={() => {
                    // simulate sending test email
                    alert("Test email sent (mock)");
                  }}
                  className="w-full px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700"
                >
                  Send Test Email
                </button>
              </div>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}
