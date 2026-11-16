import { getTranslations } from "next-intl/server";
import { LocaleSwitcher } from "@/components/layout/locale-switcher";
import { MobileMenu } from "@/components/layout/mobile-menu";
import { SearchForm } from "@/components/layout/search-form";
import { ThemeToggle } from "@/components/layout/theme-toggle";
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
    <header className="sticky top-0 z-40 bg-paper/95 backdrop-blur-sm">
      <div className="flex min-h-16 flex-wrap items-center gap-x-5 gap-y-3 border-b border-rule py-3 ps-4">
        <Link href="/" className="min-w-0">
          <span className="block truncate font-display text-lg font-bold leading-tight sm:text-xl">
            {common("storeNameShort")}
          </span>
          <span className="block truncate text-xs text-quiet">
            {common("storeTagline")}
          </span>
        </Link>

        <SearchForm className="order-last w-full md:order-none md:w-auto md:max-w-xs md:flex-1" />

        <div className="ms-auto flex shrink-0 items-center gap-2 md:ms-0">
          <LocaleSwitcher label={common("switchLocale")} />
          <ThemeToggle label={common("toggleTheme")} />
          {whatsappUrl ? (
            <WhatsAppButton
              href={whatsappUrl}
              label={whatsapp("quickAsk")}
              className="hidden min-h-11 px-4 text-sm lg:inline-flex"
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

      <nav
        aria-label={t("label")}
        className="hidden border-b border-rule ps-4 lg:block"
      >
        <ul className="flex flex-wrap items-stretch">
          {items.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className="flex min-h-12 items-center border-b-2 border-transparent px-4 text-[15px] font-medium transition-colors hover:border-margin"
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
}
