import { Metadata } from "next";
import Link from "next/link";
import { LandingHubClient } from "./components/LandingHubClient";

export const metadata: Metadata = {
  title: "AfriBrok Marketplace — Verified Properties & Trusted Brokers",
  description: "Explore licensed listings and confirm broker status instantly. Connect with certified professionals for reliable property transactions in Ethiopia.",
  openGraph: {
    title: "AfriBrok Marketplace — Verified Properties & Trusted Brokers",
    description: "Explore licensed listings and confirm broker status instantly. Connect with certified professionals for reliable property transactions in Ethiopia.",
    type: "website",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "AfriBrok Marketplace",
      },
    ],
  },
  alternates: {
    canonical: "/",
  },
};

export default function LandingHub() {
  return (
    <div className="min-h-screen bg-slate-50">
      <LandingHubClient />
    </div>
  );
}
