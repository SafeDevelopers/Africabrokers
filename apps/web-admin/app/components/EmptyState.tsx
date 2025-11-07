"use client";

import Link from "next/link";

interface EmptyStateProps {
  title?: string;
  description?: string;
  ctaText?: string;
  ctaHref?: string;
  icon?: React.ReactNode;
}

export function EmptyState({
  title = "No items",
  description,
  ctaText,
  ctaHref,
  icon,
}: EmptyStateProps) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-12 text-center">
      <div className="max-w-md mx-auto">
        {icon && <div className="mb-4 flex justify-center">{icon}</div>}
        <p className="text-lg font-semibold text-gray-900 mb-2">{title}</p>
        {description && (
          <p className="text-sm text-gray-600 mb-4">{description}</p>
        )}
        {ctaText && ctaHref && (
          <Link
            href={ctaHref}
            className="inline-block text-indigo-600 hover:text-indigo-700 text-sm font-medium"
          >
            {ctaText} →
          </Link>
        )}
      </div>
    </div>
  );
}

