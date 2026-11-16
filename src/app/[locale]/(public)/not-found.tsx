import { getTranslations } from "next-intl/server";
import { ButtonLink } from "@/components/shared/button-link";

export default async function NotFound() {
  const t = await getTranslations("NotFound");

  return (
    <main className="mx-auto flex w-full max-w-xl flex-1 flex-col items-center justify-center gap-4 px-6 py-24 text-center">
      <p className="font-heading text-7xl font-bold text-eraser">404</p>
      <h1 className="font-heading text-2xl font-bold">{t("title")}</h1>
      <p className="text-muted">{t("description")}</p>
      <ButtonLink href="/" size="lg">
        {t("backHome")}
      </ButtonLink>
    </main>
  );
}
