import { PencilLine } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { mainNav } from "@/lib/site-config";
import { LocaleSwitcher } from "./locale-switcher";
import { MobileMenu } from "./mobile-menu";
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
      <div className="relative mx-auto flex h-16 max-w-6xl items-center gap-4 px-4 sm:px-6">
        <Link
          href="/"
          className="flex items-center gap-2.5 font-heading text-xl font-bold"
        >
          <span
            aria-hidden
            className="grid size-10 place-items-center rounded-xl bg-pencil text-ink"
          >
            <PencilLine className="size-5" />
          </span>
          {common("storeName")}
        </Link>

        <nav
          aria-label={t("label")}
          className="ms-4 hidden items-center gap-6 text-[15px] font-medium lg:flex"
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

        <div className="ms-auto flex items-center gap-2">
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
    </header>
  );
}
