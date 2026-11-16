import { getTranslations } from "next-intl/server";
import { WhatsAppButton } from "@/components/shared/whatsapp-button";
import { Link } from "@/i18n/navigation";
import { footerNav, mainNav, siteConfig } from "@/lib/site-config";
import { buildWhatsAppUrl } from "@/lib/whatsapp";

export async function Footer() {
  const t = await getTranslations("Footer");
  const nav = await getTranslations("Nav");
  const common = await getTranslations("Common");
  const whatsapp = await getTranslations("WhatsApp");

  const whatsappUrl = buildWhatsAppUrl(
    siteConfig.whatsappNumber,
    whatsapp("greeting"),
  );

  return (
    <footer className="mt-16 bg-primary pb-8 pt-14 text-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-10 border-b border-white/10 pb-10 sm:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-4">
            <p className="text-lg font-black">{common("storeNameShort")}</p>
            <p className="text-xs leading-relaxed text-slate-300">
              {t("tagline")}
            </p>
          </div>

          <nav aria-label={t("browse")} className="flex flex-col gap-2">
            <p className="mb-2 text-sm font-bold text-gold">{t("browse")}</p>
            {mainNav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="w-fit text-xs text-slate-300 transition hover:text-white"
              >
                {nav(item.key)}
              </Link>
            ))}
          </nav>

          <nav aria-label={t("more")} className="flex flex-col gap-2">
            <p className="mb-2 text-sm font-bold text-gold">{t("more")}</p>
            {footerNav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="w-fit text-xs text-slate-300 transition hover:text-white"
              >
                {t(item.key)}
              </Link>
            ))}
          </nav>

          <div className="space-y-4">
            <p className="text-sm font-bold text-gold">{t("quickContact")}</p>
            <p className="text-xs text-slate-300">{t("quickContactText")}</p>
            {whatsappUrl ? (
              <WhatsAppButton
                href={whatsappUrl}
                label={whatsapp("message")}
                className="min-h-11 px-4 text-xs"
                iconClassName="size-4"
              />
            ) : null}
          </div>
        </div>

        <div className="flex flex-col items-center justify-between gap-3 pt-8 text-xs text-slate-400 sm:flex-row">
          <p>{t("rights", { store: common("storeName") })}</p>
          <div className="flex items-center gap-6">
            <Link href="/privacy" className="transition hover:text-white">
              {t("privacy")}
            </Link>
            <Link href="/faq" className="transition hover:text-white">
              {t("faq")}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
