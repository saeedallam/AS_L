import { Clock, MapPin, Phone, ShieldCheck } from "lucide-react";
import { getLocale, getTranslations } from "next-intl/server";
import { BrandMark } from "@/components/ui-kit/brand-mark";
import { Link } from "@/i18n/navigation";
import { getWebsiteSettings } from "@/lib/repository";
import { mainNav } from "@/lib/site-config";

export async function Footer() {
  const [locale, t, nav, common, settings] = await Promise.all([
    getLocale(),
    getTranslations("Footer"),
    getTranslations("Nav"),
    getTranslations("Common"),
    getWebsiteSettings(),
  ]);

  const storeName =
    locale === "en"
      ? settings.store_name_en || common("storeName")
      : settings.store_name_ar || common("storeName");

  // Only details configured in the admin settings are shown.
  const address =
    locale === "en" ? settings.address_en || settings.address_ar : settings.address_ar;
  const hours =
    locale === "en"
      ? settings.working_hours_en || settings.working_hours_ar
      : settings.working_hours_ar;
  const phone = settings.phone;
  const tagline =
    (locale === "en" ? settings.site_description_en : settings.site_description_ar) || t("tagline");
  const socials = [
    { key: "facebook", label: t("social.facebook"), href: settings.facebook_url },
    { key: "instagram", label: t("social.instagram"), href: settings.instagram_url },
    { key: "youtube", label: t("social.youtube"), href: settings.youtube_url },
    { key: "tiktok", label: "TikTok", href: settings.tiktok_url },
    { key: "x", label: "X", href: settings.x_url },
  ].filter((s) => s.href);

  return (
    <footer className="mt-20 bg-navy-deep text-white">
      <div className="mx-auto max-w-[76rem] px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <div className="flex items-center gap-3">
              <BrandMark className="size-10 bg-white/10" />
              <p className="text-base font-extrabold">{storeName}</p>
            </div>
            <p className="mt-3 max-w-xs text-sm leading-relaxed text-white/65">
              {tagline}
            </p>
            {socials.length > 0 && (
              <ul className="mt-4 flex flex-wrap gap-2">
                {socials.map((s) => (
                  <li key={s.key}>
                    <a
                      href={s.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex rounded-lg border border-white/15 px-3 py-1.5 text-xs font-bold text-white/80 transition-colors hover:bg-white/10 hover:text-white"
                    >
                      {s.label}
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <nav aria-label={t("browse")}>
            <p className="mb-4 text-sm font-bold text-gold">{t("browse")}</p>
            <ul className="space-y-2.5">
              {mainNav.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-sm text-white/75 transition-colors hover:text-white"
                  >
                    {nav(item.key)}
                  </Link>
                </li>
              ))}
              <li>
                <Link
                  href="/admin"
                  className="inline-flex items-center gap-1.5 text-sm font-bold text-gold transition-colors hover:text-white"
                >
                  <ShieldCheck className="size-4" />
                  <span>{t("admin")}</span>
                </Link>
              </li>
            </ul>
          </nav>

          <div>
            <p className="mb-4 text-sm font-bold text-gold">{t("contact")}</p>
            <ul className="space-y-3 text-sm text-white/75">
              {address && (
                <li className="flex gap-2.5">
                  <MapPin aria-hidden className="mt-1 size-4 shrink-0 text-gold" />
                  <span>{address}</span>
                </li>
              )}
              {hours && (
                <li className="flex gap-2.5">
                  <Clock aria-hidden className="mt-1 size-4 shrink-0 text-gold" />
                  <span>{hours}</span>
                </li>
              )}
              {phone && (
                <li className="flex gap-2.5">
                  <Phone aria-hidden className="mt-1 size-4 shrink-0 text-gold" />
                  <a href={`tel:${phone.replace(/[^\d+]/g, "")}`} dir="ltr" className="text-start hover:text-white">
                    {phone}
                  </a>
                </li>
              )}
              <li>
                <Link href="/contact" className="font-bold text-gold hover:text-white">
                  {nav("contact")}
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <p className="mt-10 border-t border-white/10 pt-6 text-center text-sm text-white/55">
          {t("rights", { store: storeName })}
        </p>
      </div>
    </footer>
  );
}
