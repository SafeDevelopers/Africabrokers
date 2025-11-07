"use client";

import { ListingsClient } from "./listings-client";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function ListingsPageContent() {
  const searchParams = useSearchParams();
  
  // Convert URLSearchParams to object
  const params: Record<string, string> = {};
  searchParams.forEach((value, key) => {
    params[key] = value;
  });
  
  return <ListingsClient searchParams={params} />;
}

export default function ListingsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-slate-600">Loading listings...</p>
        </div>
      </div>
    }>
      <ListingsPageContent />
    </Suspense>
  );
}
