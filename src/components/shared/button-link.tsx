import type { ComponentProps } from "react";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

const variants = {
  primary: "bg-primary text-white shadow-xl shadow-primary/20 hover:bg-blue-900",
  outline:
    "border-2 border-line bg-surface text-foreground hover:border-secondary hover:text-secondary",
  soft: "bg-background border border-line text-heading hover:bg-line/60",
} as const;

const sizes = {
  sm: "min-h-11 px-4 text-xs",
  md: "min-h-12 px-5 text-sm",
  lg: "min-h-14 px-8 text-base",
} as const;

type Props = ComponentProps<typeof Link> & {
  variant?: keyof typeof variants;
  size?: keyof typeof sizes;
};

export function ButtonLink({
  variant = "primary",
  size = "md",
  className,
  ...props
}: Props) {
  return (
    <Link
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-2xl font-bold transition",
        variants[variant],
        sizes[size],
        className,
      )}
      {...props}
    />
  );
}
