import type { ComponentProps } from "react";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

const variants = {
  solid: "bg-ink text-paper hover:bg-ink/90",
  outline: "border border-ink/40 text-ink hover:bg-ink/5",
  quiet: "text-brand underline underline-offset-4 hover:text-brand-ink",
} as const;

const sizes = {
  sm: "min-h-11 px-4 text-sm",
  md: "min-h-12 px-5 text-[15px]",
  lg: "min-h-14 px-7 text-base",
} as const;

type Props = ComponentProps<typeof Link> & {
  variant?: keyof typeof variants;
  size?: keyof typeof sizes;
};

export function ButtonLink({
  variant = "solid",
  size = "md",
  className,
  ...props
}: Props) {
  const quiet = variant === "quiet";

  return (
    <Link
      className={cn(
        "inline-flex items-center justify-center gap-2 font-semibold transition-colors",
        quiet ? "" : "rounded-md",
        variants[variant],
        quiet ? "" : sizes[size],
        className,
      )}
      {...props}
    />
  );
}
