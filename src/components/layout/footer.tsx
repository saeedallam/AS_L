import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { footerNav, mainNav } from "@/lib/site-config";

export async function Footer() {
  const t = await getTranslations("Footer");
  const nav = await getTranslations("Nav");
  const common = await getTranslations("Common");

  return (
    <footer className="mt-16 border-t border-rule pb-8 ps-4 pt-10">
      <div className="grid gap-8 sm:grid-cols-3">
        <div>
          <p className="font-display text-base font-bold">
            {common("storeName")}
          </p>
          <p className="mt-1.5 max-w-xs text-sm text-quiet">{t("tagline")}</p>
        </div>

        <nav aria-label={t("browse")}>
          <p className="mb-2 text-sm font-semibold text-quiet">{t("browse")}</p>
          <ul className="space-y-1.5">
            {mainNav.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="text-sm hover:text-link">
                  {nav(item.key)}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <nav aria-label={t("more")}>
          <p className="mb-2 text-sm font-semibold text-quiet">{t("more")}</p>
          <ul className="space-y-1.5">
            {footerNav.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="text-sm hover:text-link">
                  {t(item.key)}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      <p className="mt-8 border-t border-rule pt-5 text-sm text-quiet">
        {t("rights", { store: common("storeName") })}
      </p>
    </footer>
  );
}
