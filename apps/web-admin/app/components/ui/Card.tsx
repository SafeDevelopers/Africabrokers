import type { HTMLAttributes, PropsWithChildren } from "react";

export function Card({ className, children, ...rest }: PropsWithChildren<HTMLAttributes<HTMLDivElement>>) {
  return (
    <div
      className={[
        "bg-white rounded-lg shadow-sm border border-gray-200",
        className || "",
      ].join(" ")}
      {...rest}
    >
      {children}
    </div>
  );
}
