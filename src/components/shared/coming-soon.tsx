import { getTranslations } from "next-intl/server";
import { ButtonLink } from "./button-link";

/** Temporary body for pages that are built in a later phase. */
export async function ComingSoon({ title }: { title: string }) {
  const t = await getTranslations("ComingSoon");

  return (
    <main className="flex flex-1 flex-col items-start gap-4 py-20 ps-4">
      <p className="border-b-2 border-margin pb-1 text-sm font-semibold">
        {t("badge")}
      </p>
      <h1 className="font-display text-3xl font-bold">{title}</h1>
      <p className="max-w-prose text-quiet">{t("description")}</p>
      <ButtonLink href="/" className="mt-2">
        {t("backHome")}
      </ButtonLink>
    </main>
  );
}
