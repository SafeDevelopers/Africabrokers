"use client";

import { useState } from "react";
import { Save, Bell, User, Mail, Phone, MapPin, Building2 } from "lucide-react";

export default function SettingsPage() {
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState({
    name: "Alemayehu Tadesse",
    email: "alemayehu@brokerage.com",
    phone: "+251 911 234 567",
    company: "Ethiopian Real Estate Agency",
    location: "Addis Ababa, Ethiopia",
    bio: "Experienced real estate broker specializing in residential and commercial properties.",
  });

  const [notifications, setNotifications] = useState({
    emailLeads: true,
    smsLeads: false,
    emailListings: true,
    weeklySummary: true,
    systemUpdates: false,
  });

  const handleSaveProfile = async () => {
    setSaving(true);
    // Mock API call - replace with actual API
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setSaving(false);
    console.log("Profile saved", profile);
  };

  const handleSaveNotifications = async () => {
    setSaving(true);
    // Mock API call - replace with actual API
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setSaving(false);
    console.log("Notifications saved", notifications);
  };

  return (
    <div className="bg-slate-50 min-h-screen">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-screen-2xl px-6 py-8">
          <h1 className="text-3xl font-bold text-slate-900">Settings</h1>
          <p className="mt-2 text-sm text-slate-600">
            Manage your profile and notification preferences
          </p>
        </div>
      </header>

      <main className="mx-auto max-w-screen-2xl px-6 py-8">
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Profile Settings */}
          <div className="lg:col-span-2 space-y-6">
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <User className="w-5 h-5 text-primary" />
                <h2 className="text-lg font-semibold text-slate-900">Profile Information</h2>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={profile.name}
                    onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                    className="w-full rounded-lg border border-slate-200 px-4 py-3 text-sm text-slate-900 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/10"
                  />
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Email
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        type="email"
                        value={profile.email}
                        onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                        className="w-full rounded-lg border border-slate-200 pl-10 pr-4 py-3 text-sm text-slate-900 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/10"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Phone
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        type="tel"
                        value={profile.phone}
                        onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                        className="w-full rounded-lg border border-slate-200 pl-10 pr-4 py-3 text-sm text-slate-900 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/10"
                      />
                    </div>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Company
                  </label>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      value={profile.company}
                      onChange={(e) => setProfile({ ...profile, company: e.target.value })}
                      className="w-full rounded-lg border border-slate-200 pl-10 pr-4 py-3 text-sm text-slate-900 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/10"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Location
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      value={profile.location}
                      onChange={(e) => setProfile({ ...profile, location: e.target.value })}
                      className="w-full rounded-lg border border-slate-200 pl-10 pr-4 py-3 text-sm text-slate-900 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/10"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Bio</label>
                  <textarea
                    value={profile.bio}
                    onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                    rows={4}
                    className="w-full rounded-lg border border-slate-200 px-4 py-3 text-sm text-slate-900 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/10"
                  />
                </div>
                <button
                  onClick={handleSaveProfile}
                  disabled={saving}
                  className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Save className={`w-4 h-4 ${saving ? "animate-spin" : ""}`} />
                  {saving ? "Saving..." : "Save Profile"}
                </button>
              </div>
            </div>

            {/* Notification Settings */}
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <Bell className="w-5 h-5 text-primary" />
                <h2 className="text-lg font-semibold text-slate-900">Notifications</h2>
              </div>
              <div className="space-y-4">
                <label className="flex items-center justify-between rounded-lg border border-slate-200 p-4 hover:bg-slate-50 cursor-pointer">
                  <div>
                    <p className="font-semibold text-slate-900">Email for new leads</p>
                    <p className="text-xs text-slate-500">Receive email notifications when new leads are assigned</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={notifications.emailLeads}
                    onChange={(e) => setNotifications({ ...notifications, emailLeads: e.target.checked })}
                    className="w-5 h-5 rounded border-slate-300 text-primary focus:ring-primary"
                  />
                </label>
                <label className="flex items-center justify-between rounded-lg border border-slate-200 p-4 hover:bg-slate-50 cursor-pointer">
                  <div>
                    <p className="font-semibold text-slate-900">SMS for urgent leads</p>
                    <p className="text-xs text-slate-500">Receive SMS notifications for high-priority leads</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={notifications.smsLeads}
                    onChange={(e) => setNotifications({ ...notifications, smsLeads: e.target.checked })}
                    className="w-5 h-5 rounded border-slate-300 text-primary focus:ring-primary"
                  />
                </label>
                <label className="flex items-center justify-between rounded-lg border border-slate-200 p-4 hover:bg-slate-50 cursor-pointer">
                  <div>
                    <p className="font-semibold text-slate-900">Email for listing updates</p>
                    <p className="text-xs text-slate-500">Get notified when your listings are verified or have new views</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={notifications.emailListings}
                    onChange={(e) => setNotifications({ ...notifications, emailListings: e.target.checked })}
                    className="w-5 h-5 rounded border-slate-300 text-primary focus:ring-primary"
                  />
                </label>
                <label className="flex items-center justify-between rounded-lg border border-slate-200 p-4 hover:bg-slate-50 cursor-pointer">
                  <div>
                    <p className="font-semibold text-slate-900">Weekly summary</p>
                    <p className="text-xs text-slate-500">Receive a weekly summary of your activity</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={notifications.weeklySummary}
                    onChange={(e) => setNotifications({ ...notifications, weeklySummary: e.target.checked })}
                    className="w-5 h-5 rounded border-slate-300 text-primary focus:ring-primary"
                  />
                </label>
                <label className="flex items-center justify-between rounded-lg border border-slate-200 p-4 hover:bg-slate-50 cursor-pointer">
                  <div>
                    <p className="font-semibold text-slate-900">System updates</p>
                    <p className="text-xs text-slate-500">Get notified about platform updates and new features</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={notifications.systemUpdates}
                    onChange={(e) => setNotifications({ ...notifications, systemUpdates: e.target.checked })}
                    className="w-5 h-5 rounded border-slate-300 text-primary focus:ring-primary"
                  />
                </label>
                <button
                  onClick={handleSaveNotifications}
                  disabled={saving}
                  className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Save className={`w-4 h-4 ${saving ? "animate-spin" : ""}`} />
                  {saving ? "Saving..." : "Save Notifications"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

