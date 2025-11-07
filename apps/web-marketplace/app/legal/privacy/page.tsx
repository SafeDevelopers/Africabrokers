export const metadata = {
  title: "Privacy Policy | AfriBrok Marketplace",
  description: "How AfriBrok collects, uses, and protects personal information.",
};

export default function PrivacyPage() {
  return (
    <div className="bg-slate-50">
      <div className="mx-auto max-w-4xl px-6 py-12 space-y-8">
        <header className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Legal</p>
          <h1 className="text-3xl font-bold text-slate-900">Privacy Policy</h1>
          <p className="text-sm text-slate-600">
            Effective {new Date().toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" })}
          </p>
        </header>

        <section className="space-y-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm text-slate-700">
            AfriBrok is committed to safeguarding the personal data processed through our marketplace and broker portals.
            This Privacy Policy explains what information we collect, how it is used, and the rights available to tenants,
            regulators, brokers, and public visitors.
          </p>

          <div className="space-y-3">
            <h2 className="text-lg font-semibold text-slate-900">1. Information We Collect</h2>
            <ul className="space-y-2 text-sm text-slate-700 list-disc pl-6 marker:text-primary">
              <li>Account data such as names, email addresses, phone numbers, and tenant affiliation.</li>
              <li>Broker accreditation material including licenses, IDs, and compliance documentation.</li>
              <li>Property listing content: descriptions, photos, pricing, geolocation, and availability.</li>
              <li>Usage telemetry (logs, request metadata, device type) used to secure and monitor the platform.</li>
            </ul>
          </div>

          <div className="space-y-3">
            <h2 className="text-lg font-semibold text-slate-900">2. How We Use Information</h2>
            <p className="text-sm text-slate-700">
              Personal data is processed to verify broker credentials, publish listings, route inquiries, comply with
              regulator mandates, improve product performance, and detect misuse. We do not sell personal data. Limited
              information may be shared with cloud infrastructure providers (hosting, email delivery) under data-processing
              agreements.
            </p>
          </div>

          <div className="space-y-3">
            <h2 className="text-lg font-semibold text-slate-900">3. Retention</h2>
            <p className="text-sm text-slate-700">
              We retain user and listing data for the duration of the tenancy relationship or as required by applicable
              regulation. Supporting documents submitted for accreditation are archived according to regulator guidance
              (typically 7 years). You may request deletion of optional materials via your tenant administrator.
            </p>
          </div>

          <div className="space-y-3">
            <h2 className="text-lg font-semibold text-slate-900">4. Security</h2>
            <p className="text-sm text-slate-700">
              Access to administrative tools is authenticated via OIDC (Keycloak). Sensitive documents are stored in
              encrypted object storage (S3) with strict access controls. We enforce audit logging, rate limiting, and
              regular vulnerability patching.
            </p>
          </div>

          <div className="space-y-3">
            <h2 className="text-lg font-semibold text-slate-900">5. Data Subject Rights</h2>
            <p className="text-sm text-slate-700">
              Depending on your jurisdiction you may have rights to access, correct, export, or erase personal data.
              Requests can be sent to <a className="font-medium text-primary hover:underline" href="mailto:privacy@afribrok.com">privacy@afribrok.com</a>.
              We work with tenant administrators and regulators to validate each request.
            </p>
          </div>

          <div className="space-y-3">
            <h2 className="text-lg font-semibold text-slate-900">6. Updates</h2>
            <p className="text-sm text-slate-700">
              If this policy changes we will post the update here and notify tenant administrators. Continued use of the
              Services after an update constitutes acceptance of the revised policy.
            </p>
          </div>

          <div className="rounded-lg bg-slate-100 px-4 py-3 text-xs text-slate-600">
            For urgent privacy matters email <a className="font-medium text-primary hover:underline" href="mailto:legal@afribrok.com">legal@afribrok.com</a>.
          </div>
        </section>
      </div>
    </div>
  );
}
