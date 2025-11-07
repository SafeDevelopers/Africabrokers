"use client";

import { useState } from "react";
import Link from "next/link";
import { Info } from "lucide-react";

interface ServiceInfoTooltipProps {
  endpoint: string;
  endpointName: string;
}

export function ServiceInfoTooltip({ endpoint, endpointName }: ServiceInfoTooltipProps) {
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <div className="relative inline-block">
      <button
        type="button"
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        onClick={() => setShowTooltip(!showTooltip)}
        className="inline-flex items-center justify-center w-5 h-5 rounded-full text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        aria-label="Service information"
      >
        <Info className="w-4 h-4" />
      </button>
      
      {showTooltip && (
        <div className="absolute z-50 w-64 p-3 mt-2 text-sm text-gray-700 bg-white border border-gray-200 rounded-lg shadow-lg left-0">
          <p className="font-semibold mb-2">Service Information</p>
          <p className="text-xs text-gray-600 mb-2">
            <strong>Endpoint:</strong> {endpointName}
          </p>
          <p className="text-xs text-gray-600 mb-3">
            <strong>Route:</strong> {endpoint}
          </p>
          <Link
            href="/settings/services"
            className="text-xs text-indigo-600 hover:text-indigo-700 font-medium"
            onClick={() => setShowTooltip(false)}
          >
            View service status →
          </Link>
        </div>
      )}
    </div>
  );
}

