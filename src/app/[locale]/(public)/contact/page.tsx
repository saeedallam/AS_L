import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import { Clock, Mail, MapPin, Phone } from "lucide-react";
import { hasLocale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { ContactFormCard } from "@/components/catalog/contact-form-card";
import { WhatsAppIcon } from "@/components/shared/whatsapp-icon";
import { ActionAnchor } from "@/components/ui-kit/button";
import { Breadcrumbs } from "@/components/ui-kit/breadcrumbs";
import { routing } from "@/i18n/routing";
import { getWebsiteSettings } from "@/lib/repository";
import { buildWhatsAppUrl } from "@/lib/whatsapp";

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/contact">): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Contact" });
  return pageMetadata(locale, "/contact", t("title"), t("subtitle"));
}

export default async function Page({ params }: PageProps<"/[locale]/contact">) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);

  const [t, tCatalog, tNav, tWhatsApp, settings] = await Promise.all([
    getTranslations("Contact"),
    getTranslations("Catalog"),
    getTranslations("Nav"),
    getTranslations("WhatsApp"),
    getWebsiteSettings(),
  ]);

  const whatsappUrl = buildWhatsAppUrl(
    settings.whatsapp_number,
    tWhatsApp("greeting"),
    true,
  );

  // Only details the admin has configured are shown (nothing is invented).
  const address =
    locale === "en" ? settings.address_en || settings.address_ar : settings.address_ar;
  const hours =
    locale === "en"
      ? settings.working_hours_en || settings.working_hours_ar
      : settings.working_hours_ar;

  const details = [
    { icon: MapPin, label: t("addressLabel"), value: address, href: undefined },
    { icon: Phone, label: t("phoneLabel"), value: settings.phone, href: settings.phone ? `tel:${settings.phone.replace(/[^\d+]/g, "")}` : undefined },
    { icon: Clock, label: t("hoursLabel"), value: hours, href: undefined },
    { icon: Mail, label: t("emailLabel"), value: settings.email, href: settings.email ? `mailto:${settings.email}` : undefined },
  ].filter((d) => Boolean(d.value));
  const isGoogleMapEmbed = /^https:\/\/(www\.)?google\.[a-z.]+\/maps\/embed/.test(settings.map_url);

  return (
    <div className="mx-auto w-full max-w-[76rem] px-4 pt-6 pb-16 sm:px-6 lg:px-8">
      <Breadcrumbs
        label={tCatalog("breadcrumbsLabel")}
        items={[{ label: tNav("home"), href: "/" }, { label: tNav("contact") }]}
      />

      <h1 className="mt-5 text-3xl font-extrabold text-balance text-navy sm:text-4xl">
        {t("title")}
      </h1>
      <p className="mt-2 max-w-prose text-sm text-muted-text">
        {t("subtitle")}
      </p>

      <div className="mt-8 grid gap-6 lg:grid-cols-[22rem_1fr]">
        <div className="flex flex-col gap-4">
          {details.length > 0 && (
          <ul className="rounded-xl border border-line bg-surface p-2 shadow-card">
            {details.map(({ icon: Icon, label, value, href }) => (
              <li
                key={label}
                className="flex items-start gap-3 border-b border-line p-4 last:border-b-0"
              >
                <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-navy-soft text-navy">
                  <Icon aria-hidden className="size-4" strokeWidth={2.2} />
                </span>
                <span className="min-w-0">
                  <span className="block text-xs text-muted-text">{label}</span>
                  {href ? (
                    <a href={href} dir="ltr" className="block font-bold break-words text-navy hover:text-blue">
                      {value}
                    </a>
                  ) : (
                    <span className="block font-bold break-words text-navy">
                      {value}
                    </span>
                  )}
                </span>
              </li>
            ))}
          </ul>
          )}

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
        </div>

        <div className="space-y-6">
          <ContactFormCard locale={locale} />

          {isGoogleMapEmbed ? (
            <iframe
              src={settings.map_url}
              title={t("mapTitle")}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="h-80 w-full rounded-xl border border-line shadow-card"
            />
          ) : null}
        </div>
      </div>
    </div>
  );
}
