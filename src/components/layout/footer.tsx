import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { footerNav, mainNav } from "@/lib/site-config";

export async function Footer() {
  const t = await getTranslations("Footer");
  const nav = await getTranslations("Nav");
  const common = await getTranslations("Common");

  return (
    <footer className="mt-16 border-t border-foreground/10 bg-foreground/[0.04]">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 sm:grid-cols-2 sm:px-6 lg:grid-cols-3">
        <div className="flex flex-col gap-2">
          <p className="font-heading text-xl font-bold">
            {common("storeName")}
          </p>
          <p className="text-base text-muted">{t("tagline")}</p>
        </div>

        <nav aria-label={t("browse")} className="flex flex-col gap-1.5">
          <p className="font-bold">{t("browse")}</p>
          {mainNav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="w-fit text-base underline-offset-4 hover:underline"
            >
              {nav(item.key)}
            </Link>
          ))}
        </nav>

        <nav aria-label={t("more")} className="flex flex-col gap-1.5">
          <p className="font-bold">{t("more")}</p>
          {footerNav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="w-fit text-base underline-offset-4 hover:underline"
            >
              {t(item.key)}
            </Link>
          ))}
        </nav>
      </div>
      <p className="border-t border-foreground/10 px-4 py-4 text-center text-sm text-muted">
        {t("rights", { store: common("storeName") })}
      </p>
    </footer>
  );
}
