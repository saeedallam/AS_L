import { getTranslations } from "next-intl/server";
import { ActionLink } from "@/components/ui-kit/button";

export default async function NotFound() {
  const t = await getTranslations("NotFound");

  return (
    <main className="mx-auto flex w-full max-w-[76rem] flex-1 flex-col items-center justify-center gap-4 px-4 py-24 text-center sm:px-6">
      <p className="text-6xl font-extrabold text-navy">404</p>
      <h1 className="text-2xl font-extrabold text-navy">{t("title")}</h1>
      <p className="max-w-prose text-sm text-muted-text">{t("description")}</p>
      <ActionLink href="/" size="lg" className="mt-2">
        {t("backHome")}
      </ActionLink>
    </main>
  );
}
