import Link from "next/link";
import type { PropsWithChildren } from "react";

export function Empty({
  title = "Nothing to display",
  description,
  action,
  children,
}: PropsWithChildren<{
  title?: string;
  description?: string;
  action?: { href: string; label: string } | { onClick: () => void; label: string };
}>) {
  const Action = () => {
    if (!action) return null;
    if ("href" in action) {
      return (
        <Link href={action.href} className="inline-flex mt-4 px-4 py-2 rounded-md bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700">
          {action.label}
        </Link>
      );
    }
    return (
      <button onClick={action.onClick} className="inline-flex mt-4 px-4 py-2 rounded-md bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700">
        {action.label}
      </button>
    );
  };

  return (
    <div className="col-span-full bg-white rounded-lg border border-gray-200 p-12 text-center">
      <div className="text-5xl mb-2">🗂️</div>
      <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
      {description && <p className="text-gray-600 mt-1">{description}</p>}
      {children}
      <Action />
    </div>
  );
}
