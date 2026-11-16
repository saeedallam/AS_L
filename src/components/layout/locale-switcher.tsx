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
      className="inline-flex min-h-11 items-center rounded-xl border border-line px-3 text-xs font-bold text-heading transition hover:bg-background"
    >
      {label}
    </Link>
  );
}
