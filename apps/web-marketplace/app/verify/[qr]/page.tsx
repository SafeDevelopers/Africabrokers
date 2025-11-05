import Link from "next/link";
import { notFound } from "next/navigation";

type VerifyQRPageProps = {
  params: {
    qr: string;
  };
};

async function verifyQRCode(qrCodeId: string) {
  const apiBaseUrl = process.env.NEXT_PUBLIC_CORE_API_BASE_URL;
  const tenantKey = process.env.NEXT_PUBLIC_TENANT_KEY;

  if (!apiBaseUrl) {
    throw new Error("NEXT_PUBLIC_CORE_API_BASE_URL is not configured");
  }
  if (!tenantKey) {
    throw new Error("NEXT_PUBLIC_TENANT_KEY is not configured");
  }

  const url = `${apiBaseUrl}/v1/verify/${qrCodeId}`;
  
  try {
    const response = await fetch(url, {
      headers: {
        "X-Tenant": tenantKey,
      },
      cache: "no-store",
    });

    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      const errorText = await response.text();
      throw new Error(`Failed to verify QR code: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error verifying QR code:", error);
    throw error;
  }
}

async function fetchBrokerListings(brokerId: string) {
  const apiBaseUrl = process.env.NEXT_PUBLIC_CORE_API_BASE_URL;
  const tenantKey = process.env.NEXT_PUBLIC_TENANT_KEY;

  if (!apiBaseUrl || !tenantKey) return [];

  try {
    // Fetch listings for this broker
    const params = new URLSearchParams();
    params.set("brokerId", brokerId);
    params.set("limit", "5");
    
    const url = `${apiBaseUrl}/v1/listings/search?${params.toString()}`;
    const response = await fetch(url, {
      headers: {
        "X-Tenant": tenantKey,
      },
      cache: "no-store",
    });

    if (!response.ok) {
      return [];
    }

    const data = await response.json();
    return data.listings || [];
  } catch (error) {
    console.error("Error fetching broker listings:", error);
    return [];
  }
}

export default async function VerifyQRPage({ params }: VerifyQRPageProps) {
  const qrCode = params.qr || "";

  if (!qrCode) {
    return (
      <div className="min-h-screen bg-slate-50 pb-16">
        <header className="border-b border-slate-200 bg-white">
          <div className="mx-auto flex max-w-screen-xl flex-col gap-6 px-6 py-12">
            <div className="space-y-3">
              <p className="text-sm text-slate-500">Broker verification</p>
              <h1 className="text-3xl font-bold text-slate-900">Verification Error</h1>
            </div>
          </div>
        </header>

        <main className="mx-auto mt-10 flex max-w-screen-xl flex-col gap-10 px-6">
          <section className="flex-1 rounded-2xl border border-rose-200 bg-rose-50 p-8 shadow-sm">
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <span className="text-2xl">⚠️</span>
                <div>
                  <h2 className="text-lg font-semibold text-rose-900">We couldn't verify this broker</h2>
                  <p className="text-sm text-rose-700 mt-1">
                    Invalid QR code format. Please scan again or enter the code manually.
                  </p>
                </div>
              </div>

              <div className="mt-6 space-y-3">
                <Link
                  href="/verify"
                  className="block w-full rounded-lg bg-primary px-4 py-3 text-center text-sm font-semibold text-white shadow-md transition hover:bg-primary/90"
                >
                  Try another code
                </Link>
                <Link
                  href="/verify"
                  className="block w-full rounded-lg border border-primary/40 px-4 py-3 text-center text-sm font-semibold text-primary transition hover:bg-primary/10"
                >
                  Enter code manually
                </Link>
              </div>
            </div>
          </section>
        </main>
      </div>
    );
  }

  try {
    const verificationResult = await verifyQRCode(qrCode);

    if (!verificationResult) {
      return (
        <div className="min-h-screen bg-slate-50 pb-16">
          <header className="border-b border-slate-200 bg-white">
            <div className="mx-auto flex max-w-screen-xl flex-col gap-6 px-6 py-12">
              <div className="space-y-3">
                <p className="text-sm text-slate-500">Broker verification</p>
                <h1 className="text-3xl font-bold text-slate-900">Verification Error</h1>
              </div>
            </div>
          </header>

          <main className="mx-auto mt-10 flex max-w-screen-xl flex-col gap-10 px-6">
            <section className="flex-1 rounded-2xl border border-rose-200 bg-rose-50 p-8 shadow-sm">
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <span className="text-2xl">⚠️</span>
                  <div>
                    <h2 className="text-lg font-semibold text-rose-900">We couldn't verify this broker</h2>
                    <p className="text-sm text-rose-700 mt-1">
                      We couldn't find a broker with that code. Double-check and try again.
                    </p>
                  </div>
                </div>

                <div className="mt-6 space-y-3">
                  <Link
                    href="/verify"
                    className="block w-full rounded-lg bg-primary px-4 py-3 text-center text-sm font-semibold text-white shadow-md transition hover:bg-primary/90"
                  >
                    Try another code
                  </Link>
                  <Link
                    href="/verify"
                    className="block w-full rounded-lg border border-primary/40 px-4 py-3 text-center text-sm font-semibold text-primary transition hover:bg-primary/10"
                  >
                    Enter code manually
                  </Link>
                </div>
              </div>
            </section>
          </main>
        </div>
      );
    }

    if (!verificationResult.valid || !verificationResult.broker) {
      return (
        <div className="min-h-screen bg-slate-50 pb-16">
          <header className="border-b border-slate-200 bg-white">
            <div className="mx-auto flex max-w-screen-xl flex-col gap-6 px-6 py-12">
              <div className="space-y-3">
                <p className="text-sm text-slate-500">Broker verification</p>
                <h1 className="text-3xl font-bold text-slate-900">Verification Error</h1>
              </div>
            </div>
          </header>

          <main className="mx-auto mt-10 flex max-w-screen-xl flex-col gap-10 px-6">
            <section className="flex-1 rounded-2xl border border-rose-200 bg-rose-50 p-8 shadow-sm">
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <span className="text-2xl">⚠️</span>
                  <div>
                    <h2 className="text-lg font-semibold text-rose-900">We couldn't verify this broker</h2>
                    <p className="text-sm text-rose-700 mt-1">
                      {verificationResult.message || "Broker not found or not approved"}
                    </p>
                  </div>
                </div>

                <div className="mt-6 space-y-3">
                  <Link
                    href="/verify"
                    className="block w-full rounded-lg bg-primary px-4 py-3 text-center text-sm font-semibold text-white shadow-md transition hover:bg-primary/90"
                  >
                    Try another code
                  </Link>
                  <Link
                    href="/verify"
                    className="block w-full rounded-lg border border-primary/40 px-4 py-3 text-center text-sm font-semibold text-primary transition hover:bg-primary/10"
                  >
                    Enter code manually
                  </Link>
                </div>
              </div>
            </section>
          </main>
        </div>
      );
    }

    const broker = verificationResult.broker;
    const brokerId = broker.id;
    
    // Fetch broker listings
    const listings = await fetchBrokerListings(brokerId);

    // Get broker name from license docs or use default
    const brokerName = (broker as any).licenseDocs?.businessName || "Verified Broker";
    const licenseNumber = broker.licenseNumber || "N/A";
    const brokerRating = broker.rating || 0;
    const responseTime = (broker as any).responseTime || "N/A";
    const specialties = (broker as any).specialties || ["Property brokerage"];
    const location = (broker as any).location || "";

    return (
      <div className="min-h-screen bg-slate-50 pb-16">
        <header className="border-b border-slate-200 bg-white">
          <div className="mx-auto flex max-w-screen-xl flex-col gap-6 px-6 py-12">
            <div className="space-y-3">
              <p className="text-sm text-slate-500">Broker verification</p>
              <h1 className="text-3xl font-bold text-slate-900">Broker Verified</h1>
              <p className="text-sm text-slate-600">
                The broker code has been successfully verified.
              </p>
            </div>
          </div>
        </header>

        <main className="mx-auto mt-10 flex max-w-screen-xl flex-col gap-10 px-6 lg:flex-row">
          <section className="flex-1 rounded-2xl border border-emerald-200 bg-emerald-50 p-8 shadow-sm">
            <div className="space-y-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-base font-semibold text-emerald-900">
                    {brokerName} is verified on AfriBrok
                  </p>
                  <p className="text-xs text-emerald-700 mt-1">
                    License #{licenseNumber} {location ? `· ${location}` : ""}
                  </p>
                </div>
                <span className="text-2xl">👩🏾‍💼</span>
              </div>

              <div className="rounded-md border border-emerald-200 bg-white/80 p-4 text-emerald-700">
                <p className="text-xs uppercase tracking-wide">Trusted specialties</p>
                <p className="mt-1 text-sm">{Array.isArray(specialties) ? specialties.join(" · ") : specialties}</p>
                <p className="mt-2 text-xs text-emerald-600">
                  Typical response time: {responseTime} · Rating {brokerRating.toFixed(1)}
                </p>
              </div>

              {listings.length > 0 && (
                <div>
                  <p className="text-xs uppercase tracking-wide text-emerald-700 mb-2">Active listings</p>
                  <ul className="space-y-2 text-sm">
                    {listings.slice(0, 5).map((listing: any) => {
                      const listingTitle = listing.attrs?.title || listing.property?.address?.street || "Property Listing";
                      return (
                        <li key={listing.id} className="flex items-center justify-between gap-3 rounded-lg border border-emerald-200 bg-white/80 p-3">
                          <span>{listingTitle}</span>
                          <Link href={`/listings/${listing.id}`} className="text-xs font-semibold text-primary hover:underline">
                            View →
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )}

              <div className="flex flex-col gap-3 sm:flex-row">
                <Link
                  href={`/brokers/${brokerId}`}
                  className="rounded-md bg-primary px-4 py-2.5 text-center text-sm font-semibold text-white shadow-sm transition hover:bg-primary/90"
                >
                  Contact broker
                </Link>
                <Link
                  href="/verify"
                  className="rounded-md border border-emerald-300 px-4 py-2.5 text-center text-sm font-semibold text-emerald-700 transition hover:bg-emerald-100"
                >
                  Verify another code
                </Link>
              </div>
            </div>
          </section>

          <aside className="lg:w-96">
            <div className="space-y-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-slate-900">About verification</h2>
              <ul className="space-y-3 text-sm text-slate-700">
                <li className="flex items-start gap-2">
                  <span className="text-emerald-600">✓</span>
                  <span>This broker is licensed and verified by AfriBrok</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-600">✓</span>
                  <span>All listings are verified for accuracy</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-600">✓</span>
                  <span>Secure transaction processing available</span>
                </li>
              </ul>

              <div className="rounded-lg bg-primary/10 p-4 text-sm text-primary">
                <p className="font-semibold">✅ Verified brokers always display an AfriBrok holographic seal on their badge.</p>
              </div>

              <div className="pt-4 border-t border-slate-200">
                <Link
                  href="/verify"
                  className="text-sm font-semibold text-primary hover:underline"
                >
                  ← Verify another broker
                </Link>
              </div>
            </div>
          </aside>
        </main>
      </div>
    );
  } catch (error) {
    return (
      <div className="min-h-screen bg-slate-50 pb-16">
        <header className="border-b border-slate-200 bg-white">
          <div className="mx-auto flex max-w-screen-xl flex-col gap-6 px-6 py-12">
            <div className="space-y-3">
              <p className="text-sm text-slate-500">Broker verification</p>
              <h1 className="text-3xl font-bold text-slate-900">Verification Error</h1>
            </div>
          </div>
        </header>

        <main className="mx-auto mt-10 flex max-w-screen-xl flex-col gap-10 px-6">
          <section className="flex-1 rounded-2xl border border-rose-200 bg-rose-50 p-8 shadow-sm">
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <span className="text-2xl">⚠️</span>
                <div>
                  <h2 className="text-lg font-semibold text-rose-900">Failed to verify broker</h2>
                  <p className="text-sm text-rose-700 mt-1">
                    {error instanceof Error ? error.message : "An unexpected error occurred while verifying the QR code."}
                  </p>
                </div>
              </div>

              <div className="mt-6 space-y-3">
                <Link
                  href="/verify"
                  className="block w-full rounded-lg bg-primary px-4 py-3 text-center text-sm font-semibold text-white shadow-md transition hover:bg-primary/90"
                >
                  Try again
                </Link>
              </div>
            </div>
          </section>
        </main>
      </div>
    );
  }
}