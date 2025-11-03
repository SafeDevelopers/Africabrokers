import { Metadata } from "next";
import Link from "next/link";
import { AgentsPageClient } from "./AgentsPageClient";

export const metadata: Metadata = {
  title: "Become an AfriBrok Agent — Registry, Licensing & Enforcement Tools",
  description: "Join the AfriBrok agent program to access enforcement tools, verify broker compliance, and manage property listings in your region.",
};

export default function AgentsPage() {
  return <AgentsPageClient />;
}

