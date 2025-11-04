import type { Metadata, Viewport } from "next";
import "./globals.css";
import { SiteHeader } from "./components/site-header";
import { AuthProvider } from "./context/auth-context";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
  title: "AfriBrok Marketplace — Verified Properties & Trusted Brokers",
  description: "Explore licensed listings and confirm broker status instantly. Connect with certified professionals for reliable property transactions.",
  openGraph: {
    title: "AfriBrok Marketplace — Verified Properties & Trusted Brokers",
    description: "Explore licensed listings and confirm broker status instantly. Connect with certified professionals for reliable property transactions.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "AfriBrok Marketplace",
    description: "Verified real estate listings across AfriBrok tenants.",
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        {/* Preload critical font */}
        <link
          rel="preconnect"
          href="https://fonts.googleapis.com"
        />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
      </head>
      <body className="bg-slate-50 text-slate-900" suppressHydrationWarning>
        <AuthProvider>
          <div className="flex min-h-screen flex-col">
            <SiteHeader />
            <main className="flex-1">{children}</main>
            <footer className="border-t border-slate-200 bg-gradient-to-b from-white to-slate-50/50">
              <div className="mx-auto flex max-w-screen-2xl flex-col gap-4 px-6 py-8 text-sm text-slate-600 md:flex-row md:items-center md:justify-between">
                <p className="font-medium">© {new Date().getFullYear()} AfriBrok. All rights reserved.</p>
                <div className="flex items-center gap-6">
                  <a href="#" className="font-medium transition-colors hover:text-primary">
                    Terms
                  </a>
                  <a href="#" className="font-medium transition-colors hover:text-primary">
                    Privacy
                  </a>
                  <a href="#" className="font-medium transition-colors hover:text-primary">
                    Support
                  </a>
                </div>
              </div>
            </footer>
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}
