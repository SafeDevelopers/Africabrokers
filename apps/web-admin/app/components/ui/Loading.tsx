import type { HTMLAttributes } from "react";

export function SkeletonLine({ className = "w-1/2" }: { className?: string }) {
  return <div className={["h-4 bg-gray-200 rounded animate-pulse", className].join(" ")} />;
}

export function SkeletonBlock({ className = "h-24" }: { className?: string }) {
  return <div className={["bg-gray-200 rounded animate-pulse", className].join(" ")} />;
}

export function LoadingSection({ className, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={["space-y-3", className || ""].join(" ")} {...rest}>
      <SkeletonLine className="w-1/3" />
      <SkeletonLine className="w-1/2" />
      <SkeletonBlock className="h-20" />
    </div>
  );
}
