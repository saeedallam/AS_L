import { getTranslations } from "next-intl/server";
import { ButtonLink } from "./button-link";

/** Temporary body for pages built in a later phase. */
export async function ComingSoon({ title }: { title: string }) {
  const t = await getTranslations("ComingSoon");

  return (
    <main className="mx-auto flex w-full max-w-[75rem] flex-1 flex-col items-start gap-4 px-5 py-24 sm:px-8">
      <p className="border-b-2 border-brand pb-1 text-sm font-semibold text-brand">
        {t("badge")}
      </p>
      <h1 className="text-4xl font-bold">{title}</h1>
      <p className="max-w-prose text-graphite">{t("description")}</p>
      <ButtonLink href="/" className="mt-2">
        {t("backHome")}
      </ButtonLink>
    </main>
  );
}
