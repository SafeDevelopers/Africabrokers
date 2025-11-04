"use client";

import Link from "next/link";
import { LucideIcon } from "lucide-react";
import { trackCta } from "../../lib/analytics";

interface ServiceCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  href: string;
  secondaryHref?: string;
  secondaryLabel?: string;
}

export function ServiceCard({
  icon: Icon,
  title,
  description,
  href,
  secondaryHref,
  secondaryLabel,
}: ServiceCardProps) {
  const handleClick = () => {
    trackCta({ name: "service_card", context: title });
  };

  return (
    <div className="group relative rounded-2xl border-2 border-gray-100 bg-white p-6 shadow-lg transition-all hover:-translate-y-1 hover:border-indigo-500/30 hover:shadow-xl">
      <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-md transition-transform group-hover:scale-110">
        <Icon className="h-6 w-6" />
      </div>
      
      <h3 className="mb-2 text-lg font-bold text-gray-900 group-hover:text-indigo-600 transition-colors">
        {title}
      </h3>
      
      <p className="mb-4 text-sm text-gray-600 leading-relaxed">
        {description}
      </p>

      <div className="flex items-center gap-3">
        <Link
          href={href}
          onClick={handleClick}
          className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-lg border-2 border-indigo-600 bg-transparent px-4 py-2.5 text-sm font-semibold text-indigo-600 transition-all hover:bg-indigo-50 hover:border-indigo-700 hover:text-indigo-700 active:scale-95"
        >
          Get Started
          <span className="opacity-75">→</span>
        </Link>
        
        {secondaryHref && (
          <Link
            href={secondaryHref}
            onClick={() => trackCta({ name: "service_card_secondary", context: `${title} - ${secondaryLabel}` })}
            className="text-sm font-medium text-indigo-600 hover:text-indigo-700 hover:underline"
          >
            {secondaryLabel || "Learn more"}
          </Link>
        )}
      </div>
    </div>
  );
}

