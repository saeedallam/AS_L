import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { footerNav, mainNav } from "@/lib/site-config";

export async function Footer() {
  const t = await getTranslations("Footer");
  const nav = await getTranslations("Nav");
  const common = await getTranslations("Common");

  return (
    <footer className="mt-24 bg-ink text-paper">
      <div className="mx-auto max-w-[75rem] px-5 py-14 sm:px-8">
        <div className="grid gap-10 sm:grid-cols-3">
          <div>
            <p className="text-lg font-bold">{common("storeName")}</p>
            <p className="mt-2 max-w-xs text-sm text-paper/70">{t("tagline")}</p>
          </div>

          <nav aria-label={t("browse")}>
            <p className="mb-3 text-sm font-semibold text-paper/60">
              {t("browse")}
            </p>
            <ul className="space-y-2">
              {mainNav.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-sm text-paper/85 underline-offset-4 hover:underline"
                  >
                    {nav(item.key)}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-label={t("more")}>
            <p className="mb-3 text-sm font-semibold text-paper/60">
              {t("more")}
            </p>
            <ul className="space-y-2">
              {footerNav.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-sm text-paper/85 underline-offset-4 hover:underline"
                  >
                    {t(item.key)}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <p className="mt-12 border-t border-paper/15 pt-6 text-sm text-paper/60">
          {t("rights", { store: common("storeName") })}
        </p>
      </div>
    </footer>
  );
}
