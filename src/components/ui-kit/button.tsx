import type { ComponentProps } from "react";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

const variants = {
  // In dark mode `--navy` is a light blue, so it carries dark text instead.
  navy: "bg-navy text-white hover:bg-navy-deep dark:text-navy-deep dark:hover:brightness-110",
  blue: "bg-blue text-white hover:brightness-110",
  outline:
    "border border-line bg-surface text-navy hover:border-navy/40 hover:bg-navy-soft/60",
  whatsapp: "bg-whatsapp-deep text-white hover:brightness-115",
} as const;

const sizes = {
  sm: "min-h-10 px-4 text-[13px]",
  md: "min-h-11 px-5 text-sm",
  lg: "min-h-13 px-8 text-base",
} as const;

type Variant = keyof typeof variants;
type Size = keyof typeof sizes;

const base =
  "inline-flex items-center justify-center gap-2 rounded-lg font-bold transition-colors focus-visible:ring-2 focus-visible:ring-blue/40 focus-visible:ring-offset-2 focus-visible:outline-none";

export function ActionLink({
  variant = "navy",
  size = "md",
  className,
  ...props
}: ComponentProps<typeof Link> & { variant?: Variant; size?: Size }) {
  return (
    <Link
      className={cn(base, variants[variant], sizes[size], className)}
      {...props}
    />
  );
}

export function ActionAnchor({
  variant = "navy",
  size = "md",
  className,
  ...props
}: ComponentProps<"a"> & { variant?: Variant; size?: Size }) {
  return (
    <a
      className={cn(base, variants[variant], sizes[size], className)}
      {...props}
    />
  );
}
