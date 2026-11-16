import { Clock, Mail, MapPin, Phone } from "lucide-react";
import { hasLocale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { WhatsAppIcon } from "@/components/shared/whatsapp-icon";
import { ActionAnchor } from "@/components/ui-kit/button";
import { Breadcrumbs } from "@/components/ui-kit/breadcrumbs";
import { routing } from "@/i18n/routing";
import { siteConfig } from "@/lib/site-config";
import { buildWhatsAppUrl } from "@/lib/whatsapp";

export default async function Page({ params }: PageProps<"/[locale]/contact">) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);

  const [t, tCatalog, tHome, tNav, tWhatsApp] = await Promise.all([
    getTranslations("Contact"),
    getTranslations("Catalog"),
    getTranslations("Home"),
    getTranslations("Nav"),
    getTranslations("WhatsApp"),
  ]);

  const whatsappUrl = buildWhatsAppUrl(
    siteConfig.whatsappNumber,
    tWhatsApp("greeting"),
  );

  const details = [
    { icon: MapPin, label: t("addressLabel"), value: tHome("visit.address") },
    { icon: Phone, label: t("phoneLabel"), value: tHome("visit.phone") },
    { icon: Clock, label: t("hoursLabel"), value: tHome("visit.hours") },
    { icon: Mail, label: t("emailLabel"), value: t("emailValue") },
  ];

  return (
    <div className="mx-auto w-full max-w-[76rem] px-4 pt-6 pb-16 sm:px-6 lg:px-8">
      <Breadcrumbs
        label={tCatalog("breadcrumbsLabel")}
        items={[{ label: tNav("home"), href: "/" }, { label: tNav("contact") }]}
      />

      <h1 className="mt-5 text-3xl font-extrabold text-balance text-navy sm:text-4xl">
        {t("title")}
      </h1>
      <p className="mt-2 max-w-prose text-sm text-muted-text">{t("subtitle")}</p>

      <div className="mt-8 grid gap-6 lg:grid-cols-[22rem_1fr]">
        <div className="flex flex-col gap-4">
          <ul className="rounded-xl border border-line bg-surface p-2 shadow-card">
            {details.map(({ icon: Icon, label, value }) => (
              <li
                key={label}
                className="flex items-start gap-3 border-b border-line p-4 last:border-b-0"
              >
                <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-navy-soft text-navy">
                  <Icon aria-hidden className="size-4" strokeWidth={2.2} />
                </span>
                <span className="min-w-0">
                  <span className="block text-xs text-muted-text">{label}</span>
                  <span className="block font-bold break-words text-navy">
                    {value}
                  </span>
                </span>
              </li>
            ))}
          </ul>

          {whatsappUrl ? (
            <ActionAnchor
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              variant="whatsapp"
              size="lg"
            >
              <WhatsAppIcon className="size-5" />
              {tWhatsApp("headerCta")}
            </ActionAnchor>
          ) : null}

          <p className="rounded-xl border border-dashed border-line bg-surface p-4 text-xs leading-relaxed text-muted-text">
            {t("formNote")}
          </p>
        </div>

        {/* The map is embedded only once a URL is configured, so no empty frame ships. */}
        {siteConfig.mapUrl ? (
          <iframe
            src={siteConfig.mapUrl}
            title={t("mapTitle")}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            className="h-[26rem] w-full rounded-xl border border-line shadow-card lg:h-full"
          />
        ) : (
          <div className="grid min-h-[26rem] place-items-center rounded-xl border border-dashed border-line bg-surface p-8 text-center shadow-card">
            <div>
              <MapPin
                aria-hidden
                className="mx-auto size-8 text-muted-text"
                strokeWidth={1.6}
              />
              <p className="mt-3 font-bold text-navy">{t("mapTitle")}</p>
              <p className="mt-1 text-sm text-muted-text">{t("mapEmpty")}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
