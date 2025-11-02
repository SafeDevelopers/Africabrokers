import type { HTMLAttributes, PropsWithChildren } from "react";

export type BadgeVariant =
  | "gray"
  | "blue"
  | "green"
  | "red"
  | "yellow"
  | "orange"
  | "purple";

const styles: Record<BadgeVariant, string> = {
  gray: "bg-gray-100 text-gray-800",
  blue: "bg-blue-100 text-blue-800",
  green: "bg-green-100 text-green-800",
  red: "bg-red-100 text-red-800",
  yellow: "bg-yellow-100 text-yellow-800",
  orange: "bg-orange-100 text-orange-800",
  purple: "bg-purple-100 text-purple-800",
};

export function Badge({
  variant = "gray",
  className,
  children,
  ...rest
}: PropsWithChildren<{ variant?: BadgeVariant } & HTMLAttributes<HTMLSpanElement>>) {
  return (
    <span
      className={[
        "inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold",
        styles[variant],
        className || "",
      ].join(" ")}
      {...rest}
    >
      {children}
    </span>
  );
}
