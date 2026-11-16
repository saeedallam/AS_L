import { getTranslations } from "next-intl/server";
import { ButtonLink } from "@/components/shared/button-link";

export default async function NotFound() {
  const t = await getTranslations("NotFound");

  return (
    <main className="flex flex-1 flex-col items-start gap-4 py-20 ps-4">
      <p className="font-display text-6xl font-extrabold text-margin">404</p>
      <h1 className="font-display text-2xl font-bold">{t("title")}</h1>
      <p className="max-w-prose text-quiet">{t("description")}</p>
      <ButtonLink href="/" className="mt-2">
        {t("backHome")}
      </ButtonLink>
    </main>
  );
}
