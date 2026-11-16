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
      className="grid h-11 min-w-11 place-items-center rounded-lg border border-line px-2 text-sm font-bold text-navy transition-colors hover:bg-navy-soft/60"
    >
      {label}
    </Link>
  );
}
