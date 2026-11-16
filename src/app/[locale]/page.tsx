import { hasLocale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { LocaleSwitcher } from "@/components/layout/locale-switcher";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { routing } from "@/i18n/routing";

export default async function HomePage({ params }: PageProps<"/[locale]">) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);

  const t = await getTranslations("Home");
  const common = await getTranslations("Common");

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col justify-center gap-6 px-6 py-16">
      <div className="flex items-center gap-3">
        <LocaleSwitcher label={common("switchLocale")} />
        <ThemeToggle label={common("toggleTheme")} />
      </div>
      <span className="w-fit -rotate-2 rounded-md bg-pencil px-3 py-1 text-sm font-semibold text-ink">
        {t("badge")}
      </span>
      <h1 className="font-heading text-4xl font-bold leading-tight sm:text-5xl">
        {t("title")}
      </h1>
      <p className="text-lg leading-8 text-foreground/75">{t("subtitle")}</p>
    </main>
  );
}
