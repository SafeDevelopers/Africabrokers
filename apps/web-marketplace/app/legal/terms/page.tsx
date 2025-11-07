import Link from "next/link";

export const metadata = {
  title: "Terms & Conditions | AfriBrok Marketplace",
  description: "General terms that govern the use of the AfriBrok marketplace.",
};

export default function TermsPage() {
  return (
    <div className="bg-slate-50">
      <div className="mx-auto max-w-4xl px-6 py-12 space-y-8">
        <header className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Legal</p>
          <h1 className="text-3xl font-bold text-slate-900">Terms &amp; Conditions</h1>
          <p className="text-sm text-slate-600">
            Effective {new Date().toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" })}
          </p>
        </header>

        <section className="space-y-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm text-slate-700">
            These Terms &amp; Conditions (&quot;Terms&quot;) govern access to and use of the AfriBrok marketplace,
            including the web experience, broker portal, and related APIs (collectively, the &quot;Services&quot;).
            By browsing, registering, or submitting content through the Services you agree to be bound by these Terms.
          </p>

          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-slate-900">1. Platform Role</h2>
            <p className="text-sm text-slate-700">
              AfriBrok provides a listing and verification platform for certified real-estate professionals.
              We facilitate discovery, broker accreditation workflows, and marketplace visibility. We are not a party
              to property transactions, lease contracts, or payment arrangements negotiated between users.
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-slate-900">2. Accounts &amp; Eligibility</h2>
            <ul className="space-y-2 text-sm text-slate-700 list-disc pl-6 marker:text-primary">
              <li>Tenant administrators warrant that submitted organisational data is accurate and kept up to date.</li>
              <li>Brokers warrant that licensing information, documents, and declarations are true and complete.</li>
              <li>You are responsible for maintaining the confidentiality of authentication credentials issued to you.</li>
            </ul>
          </div>

          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-slate-900">3. Acceptable Use</h2>
            <p className="text-sm text-slate-700">
              You agree not to upload unlawful, fraudulent, or misleading material, and not to interfere with the integrity
              of the platform. We may suspend accounts that violate policy, applicable law, or regulator directives.
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-slate-900">4. Listings &amp; Content</h2>
            <p className="text-sm text-slate-700">
              Tenant administrators and brokers are solely responsible for the accuracy of property details, pricing,
              and media uploaded to the Services. By publishing a listing you confirm that you hold (or represent) the
              necessary rights to market the property and to share the submitted materials with AfriBrok.
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-slate-900">5. Disclaimers</h2>
            <p className="text-sm text-slate-700">
              The Services are provided on an &quot;as is&quot; basis. AfriBrok disclaims implied warranties of merchantability,
              fitness for a particular purpose, or non-infringement. We do not guarantee uninterrupted availability and may
              change features or suspend access where legally required or technically necessary.
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-slate-900">6. Limitation of Liability</h2>
            <p className="text-sm text-slate-700">
              To the maximum extent permitted by law AfriBrok is not liable for lost profits, consequential damages,
              or claims arising from transactions between users. Our aggregate liability for any claim relating to the
              Services will be limited to fees paid to us (if any) in the preceding twelve months.
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-slate-900">7. Updates</h2>
            <p className="text-sm text-slate-700">
              We may update these Terms to reflect regulatory changes or platform enhancements. Material changes will be
              communicated through the admin portal or email. Continued use of the Services after an update constitutes
              acceptance of the revised Terms.
            </p>
          </div>

          <div className="space-y-2 text-sm text-slate-700">
            <p>If you have questions regarding these Terms please contact us at <a className="font-medium text-primary hover:underline" href="mailto:legal@afribrok.com">legal@afribrok.com</a>.</p>
          </div>

          <div className="flex items-center justify-between rounded-lg bg-slate-100 px-4 py-3 text-xs text-slate-600">
            <span>Need help interpreting these terms?</span>
            <Link href="/support" className="font-medium text-primary hover:underline">
              Visit support →
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
