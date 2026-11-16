import { AtSign, Globe, MapPin, Phone, Send } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { BrandMark } from "@/components/ui-kit/brand-mark";
import { Link } from "@/i18n/navigation";
import { footerNav, mainNav } from "@/lib/site-config";

// This Lucide build ships no brand logos, and drawing them by hand would
// misuse the trademarks. Neutral icons carry the platform name as the label;
// swap in the official assets when the shop supplies them.
const socials = [
  { key: "facebook", icon: Globe },
  { key: "instagram", icon: AtSign },
  { key: "youtube", icon: Send },
] as const;

export async function Footer() {
  const t = await getTranslations("Footer");
  const nav = await getTranslations("Nav");
  const common = await getTranslations("Common");
  const home = await getTranslations("Home");

  return (
    <footer className="mt-20 bg-navy-deep text-white">
      <div className="mx-auto max-w-[76rem] px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <div className="flex items-center gap-3">
              <BrandMark className="size-10 bg-white/10" />
              <p className="text-base font-extrabold">
                {common("storeNameShort")}
              </p>
            </div>
            <p className="mt-3 max-w-xs text-sm leading-relaxed text-white/65">
              {t("tagline")}
            </p>
            <ul className="mt-5 flex gap-3">
              {socials.map(({ key, icon: Icon }) => (
                <li key={key}>
                  <a
                    href="#"
                    aria-label={t(`social.${key}`)}
                    className="grid size-10 place-items-center rounded-lg bg-white/10 transition-colors hover:bg-white/20"
                  >
                    <Icon aria-hidden className="size-4" strokeWidth={1.75} />
                  </a>
                </li>
              ))}
            </ul>
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
            </ul>
          </nav>

          <nav aria-label={t("more")}>
            <p className="mb-4 text-sm font-bold text-gold">{t("more")}</p>
            <ul className="space-y-2.5">
              {footerNav.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-sm text-white/75 transition-colors hover:text-white"
                  >
                    {t(item.key)}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div>
            <p className="mb-4 text-sm font-bold text-gold">{t("contact")}</p>
            <ul className="space-y-3 text-sm text-white/75">
              <li className="flex gap-2.5">
                <MapPin aria-hidden className="mt-1 size-4 shrink-0" />
                <span>{home("visit.address")}</span>
              </li>
              <li className="flex gap-2.5">
                <Phone aria-hidden className="mt-1 size-4 shrink-0" />
                <span dir="ltr" className="text-start">
                  {home("visit.phone")}
                </span>
              </li>
            </ul>
          </div>
        </div>

        <p className="mt-12 border-t border-white/10 pt-6 text-center text-sm text-white/55">
          {t("rights", { store: common("storeName") })}
        </p>
      </div>
    </footer>
  );
}
