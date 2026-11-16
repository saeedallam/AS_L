import type { ComponentProps } from "react";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

const variants = {
  primary: "bg-ink text-paper hover:bg-ink/90 dark:bg-paper dark:text-ink",
  outline: "border border-foreground/30 hover:bg-foreground/5",
  whatsapp: "bg-whatsapp text-whatsapp-ink hover:brightness-95",
} as const;

const sizes = {
  md: "min-h-11 px-5 text-[15px]",
  lg: "min-h-13 px-7 text-base",
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
        "inline-flex items-center justify-center gap-2 rounded-full font-semibold transition-colors",
        variants[variant],
        sizes[size],
        className,
      )}
      {...props}
    />
  );
}
