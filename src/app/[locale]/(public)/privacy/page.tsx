import { hasLocale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { ComingSoon } from "@/components/shared/coming-soon";
import { routing } from "@/i18n/routing";

// Placeholder until this page is built in a later phase.
export default async function Page({ params }: PageProps<"/[locale]/privacy">) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);

  const t = await getTranslations("Footer");
  return <ComingSoon title={t("privacy")} />;
}
