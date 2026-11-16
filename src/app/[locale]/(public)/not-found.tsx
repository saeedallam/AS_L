import { getTranslations } from "next-intl/server";
import { ButtonLink } from "@/components/shared/button-link";

export default async function NotFound() {
  const t = await getTranslations("NotFound");

  return (
    <main className="mx-auto flex w-full max-w-xl flex-1 flex-col items-center justify-center gap-4 px-6 py-24 text-center">
      <p className="text-7xl font-black text-brand">404</p>
      <h1 className="text-2xl font-black text-heading">{t("title")}</h1>
      <p className="text-sm text-subtle">{t("description")}</p>
      <ButtonLink href="/" size="lg">
        {t("backHome")}
      </ButtonLink>
    </main>
  );
}
