import { BookOpen, Feather } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { LocaleSwitcher } from "@/components/layout/locale-switcher";
import { MobileMenu } from "@/components/layout/mobile-menu";
import { SearchForm } from "@/components/layout/search-form";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { ButtonLink } from "@/components/shared/button-link";
import { WhatsAppButton } from "@/components/shared/whatsapp-button";
import { Link } from "@/i18n/navigation";
import { mainNav, siteConfig } from "@/lib/site-config";
import { buildWhatsAppUrl } from "@/lib/whatsapp";

export async function Header() {
  const t = await getTranslations("Nav");
  const common = await getTranslations("Common");
  const whatsapp = await getTranslations("WhatsApp");

  const items = mainNav.map((item) => ({ href: item.href, label: t(item.key) }));
  const whatsappUrl = buildWhatsAppUrl(
    siteConfig.whatsappNumber,
    whatsapp("greeting"),
  );

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-surface shadow-sm">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex min-w-0 items-center gap-3">
          <span
            aria-hidden
            className="grid size-11 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-primary to-secondary text-accent shadow-md"
          >
            <Feather className="size-6" />
          </span>
          <span className="min-w-0">
            <span className="block truncate text-lg font-extrabold leading-tight text-heading sm:text-xl">
              {common("storeNameShort")}
            </span>
            <span className="hidden truncate text-xs font-medium tracking-wide text-muted sm:block">
              {common("storeTagline")}
            </span>
          </span>
        </Link>

        <nav
          aria-label={t("label")}
          className="hidden items-center gap-7 text-sm font-semibold lg:flex"
        >
          {items.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="transition hover:text-secondary"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex shrink-0 items-center gap-2">
          <SearchForm className="hidden w-56 xl:flex" />
          <ButtonLink
            href="/products"
            variant="soft"
            size="sm"
            className="hidden sm:inline-flex lg:hidden xl:inline-flex"
          >
            <BookOpen aria-hidden className="size-4" />
            {t("catalog")}
          </ButtonLink>
          <LocaleSwitcher label={common("switchLocale")} />
          <ThemeToggle label={common("toggleTheme")} />
          {whatsappUrl ? (
            <WhatsAppButton
              href={whatsappUrl}
              label={whatsapp("quickAsk")}
              className="hidden min-h-11 px-4 text-sm shadow-lg shadow-whatsapp/20 md:inline-flex"
            />
          ) : null}
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
