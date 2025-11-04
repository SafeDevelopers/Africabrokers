import { Metadata } from "next";

export const metadata: Metadata = {
  title: "About Us — AfriBrok Marketplace",
  description: "Learn about AfriBrok, our mission to connect verified brokers with property seekers, and how we're transforming real estate in Ethiopia.",
};

export default function AboutPage() {
  return (
    <div className="bg-slate-50 min-h-screen">
      <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 sm:py-24">
        <div className="space-y-8">
          <div>
            <h1 className="text-4xl font-bold text-slate-900 sm:text-5xl">About AfriBrok</h1>
            <p className="mt-4 text-lg text-slate-600">
              Connecting verified brokers with property seekers across Ethiopia
            </p>
          </div>

          <div className="prose prose-slate max-w-none">
            <section className="space-y-6">
              <h2 className="text-2xl font-semibold text-slate-900">Our Mission</h2>
              <p className="text-slate-700 leading-relaxed">
                AfriBrok is dedicated to transforming the real estate market in Ethiopia by providing
                a trusted platform where property seekers can connect with verified, licensed brokers.
                We ensure transparency, security, and reliability in every property transaction.
              </p>
            </section>

            <section className="space-y-6 mt-12">
              <h2 className="text-2xl font-semibold text-slate-900">What We Do</h2>
              <ul className="space-y-4 text-slate-700">
                <li className="flex items-start">
                  <span className="mr-3 text-primary">✓</span>
                  <span>Verify broker licenses and credentials to ensure compliance</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-3 text-primary">✓</span>
                  <span>Provide a marketplace for verified property listings</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-3 text-primary">✓</span>
                  <span>Enable instant broker verification via QR codes</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-3 text-primary">✓</span>
                  <span>Support regulatory compliance and enforcement</span>
                </li>
              </ul>
            </section>

            <section className="space-y-6 mt-12">
              <h2 className="text-2xl font-semibold text-slate-900">Why Choose AfriBrok</h2>
              <p className="text-slate-700 leading-relaxed">
                With AfriBrok, you can trust that every broker you interact with is licensed,
                verified, and compliant with local regulations. Our platform provides tools for
                both property seekers and brokers to ensure safe, transparent transactions.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}

