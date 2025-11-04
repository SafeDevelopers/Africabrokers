"use client";

import { useEffect, useState } from "react";
import { Mail, Phone, MapPin, MessageCircle } from "lucide-react";

interface ContactInfo {
  contactEmail?: string;
  contactEmailSecondary?: string;
  contactPhone?: string;
  contactPhoneHours?: string;
  contactAddress?: string;
  contactCity?: string;
  contactCountry?: string;
  contactWhatsApp?: string;
}

const STORAGE_KEY = "afribrok:platform_settings:v1";

const defaultContactInfo: ContactInfo = {
  contactEmail: "support@afribrok.et",
  contactEmailSecondary: "info@afribrok.et",
  contactPhone: "+251 11 123 4567",
  contactPhoneHours: "Mon-Fri, 9am-5pm",
  contactAddress: "Addis Ababa",
  contactCity: "Addis Ababa",
  contactCountry: "Ethiopia",
  contactWhatsApp: "",
};

export default function ContactPage() {
  const [contactInfo, setContactInfo] = useState<ContactInfo>(defaultContactInfo);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        setContactInfo({
          contactEmail: parsed.contactEmail || defaultContactInfo.contactEmail,
          contactEmailSecondary: parsed.contactEmailSecondary || defaultContactInfo.contactEmailSecondary,
          contactPhone: parsed.contactPhone || defaultContactInfo.contactPhone,
          contactPhoneHours: parsed.contactPhoneHours || defaultContactInfo.contactPhoneHours,
          contactAddress: parsed.contactAddress || defaultContactInfo.contactAddress,
          contactCity: parsed.contactCity || defaultContactInfo.contactCity,
          contactCountry: parsed.contactCountry || defaultContactInfo.contactCountry,
          contactWhatsApp: parsed.contactWhatsApp || defaultContactInfo.contactWhatsApp,
        });
      }
    } catch (err) {
      // ignore parse errors
    }
  }, []);

  const getWhatsAppUrl = (phone: string) => {
    if (!phone) return "#";
    // Remove any spaces, dashes, or other characters, keep only digits and +
    const cleanPhone = phone.replace(/[^\d+]/g, "");
    return `https://wa.me/${cleanPhone}`;
  };

  const getFullAddress = () => {
    const parts = [contactInfo.contactAddress, contactInfo.contactCity, contactInfo.contactCountry].filter(Boolean);
    return parts.join(", ") || "Address not configured";
  };
  return (
    <div className="bg-slate-50 min-h-screen">
      <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 sm:py-24">
        <div className="space-y-12">
          <div>
            <h1 className="text-4xl font-bold text-slate-900 sm:text-5xl">Contact Us</h1>
            <p className="mt-4 text-lg text-slate-600">
              Have questions? We're here to help. Reach out to us through any of the channels below.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-xl border border-slate-200 bg-white p-6 text-center shadow-sm">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <Mail className="h-6 w-6 text-primary" />
              </div>
              <h3 className="mb-2 font-semibold text-slate-900">Email</h3>
              <p className="text-sm text-slate-600">{contactInfo.contactEmail || "Not configured"}</p>
              {contactInfo.contactEmailSecondary && (
                <p className="mt-1 text-sm text-slate-600">{contactInfo.contactEmailSecondary}</p>
              )}
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-6 text-center shadow-sm">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <Phone className="h-6 w-6 text-primary" />
              </div>
              <h3 className="mb-2 font-semibold text-slate-900">Phone</h3>
              <p className="text-sm text-slate-600">{contactInfo.contactPhone || "Not configured"}</p>
              {contactInfo.contactPhoneHours && (
                <p className="mt-1 text-sm text-slate-600">{contactInfo.contactPhoneHours}</p>
              )}
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-6 text-center shadow-sm">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <MapPin className="h-6 w-6 text-primary" />
              </div>
              <h3 className="mb-2 font-semibold text-slate-900">Address</h3>
              <p className="text-sm text-slate-600">{getFullAddress()}</p>
            </div>

            {contactInfo.contactWhatsApp && (
              <div className="rounded-xl border border-slate-200 bg-white p-6 text-center shadow-sm">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                  <MessageCircle className="h-6 w-6 text-primary" />
                </div>
                <h3 className="mb-2 font-semibold text-slate-900">WhatsApp</h3>
                <a
                  href={getWhatsAppUrl(contactInfo.contactWhatsApp)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block text-sm text-primary hover:underline"
                >
                  {contactInfo.contactWhatsApp}
                </a>
                <p className="mt-1 text-xs text-slate-500">Click to chat</p>
              </div>
            )}
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
            <h2 className="mb-6 text-2xl font-semibold text-slate-900">Send us a message</h2>
            <form className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-semibold text-slate-700">
                  Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  className="mt-2 w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/10"
                  placeholder="Your name"
                />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-semibold text-slate-700">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  className="mt-2 w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/10"
                  placeholder="your.email@example.com"
                />
              </div>
              <div>
                <label htmlFor="subject" className="block text-sm font-semibold text-slate-700">
                  Subject
                </label>
                <input
                  type="text"
                  id="subject"
                  name="subject"
                  className="mt-2 w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/10"
                  placeholder="What is this regarding?"
                />
              </div>
              <div>
                <label htmlFor="message" className="block text-sm font-semibold text-slate-700">
                  Message
                </label>
                <textarea
                  id="message"
                  name="message"
                  rows={6}
                  className="mt-2 w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/10"
                  placeholder="Tell us how we can help..."
                />
              </div>
              <button
                type="submit"
                className="w-full rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-white transition hover:bg-primary/90 sm:w-auto"
              >
                Send Message
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

