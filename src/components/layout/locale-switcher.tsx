"use client";

import { useLocale } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";

export function LocaleSwitcher({ label }: { label: string }) {
  const locale = useLocale();
  const pathname = usePathname();
  const target = locale === "ar" ? "en" : "ar";

  return (
    <Link
      href={pathname}
      locale={target}
      lang={target}
      className="inline-flex min-h-11 items-center rounded-full border border-foreground/15 px-4 text-sm font-medium transition-colors hover:bg-foreground/5"
    >
      {label}
    </Link>
  );
}
