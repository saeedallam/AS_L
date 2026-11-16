import { getTranslations } from "next-intl/server";
import { ButtonLink } from "./button-link";

/** Temporary body for pages that are built in a later phase. */
export async function ComingSoon({ title }: { title: string }) {
  const t = await getTranslations("ComingSoon");

  return (
    <main className="mx-auto flex w-full max-w-xl flex-1 flex-col items-center justify-center gap-4 px-6 py-24 text-center">
      <span className="rounded-full bg-secondary-soft px-3 py-1 text-xs font-bold uppercase tracking-wider text-secondary">
        {t("badge")}
      </span>
      <h1 className="text-3xl font-black text-heading">{title}</h1>
      <p className="text-sm text-muted">{t("description")}</p>
      <ButtonLink href="/" size="lg">
        {t("backHome")}
      </ButtonLink>
    </main>
  );
}
