import { PencilLine } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { mainNav } from "@/lib/site-config";
import { LocaleSwitcher } from "./locale-switcher";
import { MobileMenu } from "./mobile-menu";
import { SearchForm } from "./search-form";
import { ThemeToggle } from "./theme-toggle";

export async function Header() {
  const t = await getTranslations("Nav");
  const common = await getTranslations("Common");
  const items = mainNav.map((item) => ({
    href: item.href,
    label: t(item.key),
  }));

  return (
    <header className="sticky top-0 z-40 border-b border-foreground/10 bg-background">
      <div className="relative mx-auto flex max-w-6xl flex-wrap items-center gap-x-4 gap-y-3 px-4 py-3 sm:px-6">
        <Link
          href="/"
          className="flex min-w-0 items-center gap-2.5 font-heading text-[15px] font-bold leading-tight sm:text-xl"
        >
          <span
            aria-hidden
            className="grid size-10 shrink-0 place-items-center rounded-xl bg-pencil text-ink"
          >
            <PencilLine className="size-5" />
          </span>
          {common("storeName")}
        </Link>

        {/* On phones the search drops to its own full-width row. */}
        <SearchForm className="order-last w-full md:order-none md:w-auto md:flex-1" />

        <div className="ms-auto flex shrink-0 items-center gap-2 md:ms-0">
          <LocaleSwitcher label={common("switchLocale")} />
          <ThemeToggle label={common("toggleTheme")} />
          <MobileMenu
            items={items}
            labels={{
              open: t("openMenu"),
              close: t("closeMenu"),
              nav: t("label"),
            }}
          />
        </div>
      </div>

      <nav
        aria-label={t("label")}
        className="mx-auto hidden max-w-6xl items-center gap-7 px-6 pb-3 text-base font-medium lg:flex"
      >
        {items.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="underline-offset-8 hover:underline"
          >
            {item.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
