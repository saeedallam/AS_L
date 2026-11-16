import { getTranslations } from "next-intl/server";
import { LocaleSwitcher } from "@/components/layout/locale-switcher";
import { MobileMenu } from "@/components/layout/mobile-menu";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { WhatsAppIcon } from "@/components/shared/whatsapp-icon";
import { BrandMark } from "@/components/ui-kit/brand-mark";
import { ActionAnchor } from "@/components/ui-kit/button";
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
    <header className="sticky top-0 z-40 border-b border-line bg-surface">
      <div className="mx-auto flex h-20 max-w-[76rem] items-center gap-6 px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex min-w-0 items-center gap-3">
          <BrandMark className="size-11" />
          <span className="min-w-0">
            <span className="block truncate text-base font-extrabold leading-tight text-navy sm:text-lg">
              {common("storeNameShort")}
            </span>
            <span className="hidden truncate text-xs text-muted-text sm:block">
              {common("storeTagline")}
            </span>
          </span>
        </Link>

        <nav
          aria-label={t("label")}
          className="mx-auto hidden items-center gap-8 text-sm font-bold text-ink lg:flex"
        >
          {items.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="transition-colors hover:text-blue"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="ms-auto flex shrink-0 items-center gap-2 lg:ms-0">
          <LocaleSwitcher label={common("switchLocale")} />
          <ThemeToggle label={common("toggleTheme")} />
          {whatsappUrl ? (
            <ActionAnchor
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:inline-flex"
            >
              <WhatsAppIcon className="size-4" />
              {whatsapp("headerCta")}
            </ActionAnchor>
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
