"use client";

import { useState } from "react";
import { createInquiry } from "../../lib/inquiries";

type ContactBrokerFormProps = {
  listingId: string;
  listingTitle: string;
  brokerName?: string;
};

export function ContactBrokerForm({ listingId, listingTitle, brokerName }: ContactBrokerFormProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setSuccess(false);

    if (!name || !email || !message) {
      setError("Name, email, and message are required to contact the broker.");
      return;
    }

    if (message.length > 2000) {
      setError("Message must be 2000 characters or less.");
      return;
    }

    setIsSubmitting(true);
    try {
      await createInquiry({
        listingId,
        fullName: name,
        email,
        phone: phone || undefined,
        message,
        captchaToken: captchaToken || undefined,
      });
      
      setSuccess(true);
      setName("");
      setEmail("");
      setPhone("");
      setMessage("");
      setCaptchaToken(null);
    } catch (err: any) {
      console.error("Failed to submit inquiry:", err);
      // Handle 401/403 with friendly message
      if (err?.status === 401 || err?.status === 403) {
        setError("Please sign in to contact brokers. Some features require authentication.");
      } else {
        setError(
          err instanceof Error
            ? err.message
            : "Failed to send inquiry. Please try again.",
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <h3 className="text-lg font-semibold text-slate-900">Contact {brokerName ?? "broker"}</h3>
      <p className="mt-2 text-xs text-slate-500">
        Send a direct inquiry about “{listingTitle}”. The broker will receive your contact details and
        respond within a few hours.
      </p>

      <form className="mt-4 space-y-4" onSubmit={handleSubmit}>
        <label className="block text-sm">
          <span className="text-slate-700">Full name *</span>
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Your name"
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/10"
          />
        </label>

        <label className="block text-sm">
          <span className="text-slate-700">Email *</span>
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="you@example.com"
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/10"
          />
        </label>

        <label className="block text-sm">
          <span className="text-slate-700">Phone (optional)</span>
          <input
            value={phone}
            onChange={(event) => setPhone(event.target.value)}
            placeholder="+251 9X XXX XXXX"
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/10"
          />
        </label>

        <label className="block text-sm">
          <span className="text-slate-700">Message *</span>
          <textarea
            rows={4}
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            placeholder="Share move-in timelines, questions, or viewing availability."
            maxLength={2000}
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/10"
          />
          <p className="mt-1 text-xs text-slate-500">
            {message.length} / 2000 characters
          </p>
        </label>

        {/* hCaptcha/Turnstile placeholder */}
        <div className="h-20 rounded-lg border border-slate-200 bg-slate-50 flex items-center justify-center">
          <p className="text-xs text-slate-500">
            {/* TODO: Add hCaptcha or Cloudflare Turnstile widget */}
            {/* Example: <Turnstile sitekey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY} onVerify={setCaptchaToken} /> */}
            Captcha verification (placeholder)
          </p>
        </div>

        {error ? <p className="text-sm font-medium text-rose-600">{error}</p> : null}
        {success ? (
          <p className="rounded-md bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
            Inquiry sent! Expect a reply shortly. We&apos;ve also emailed you a confirmation.
          </p>
        ) : null}

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isSubmitting ? "Sending..." : "Send inquiry"}
        </button>
      </form>

      <p className="mt-3 text-xs text-slate-500">
        By submitting you agree to AfriBrok&apos;s communication policy. Brokers may call or email you to
        coordinate visits.
      </p>
    </div>
  );
}
