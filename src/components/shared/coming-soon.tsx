import { getTranslations } from "next-intl/server";
import { ActionLink } from "@/components/ui-kit/button";

/** Temporary body for pages built in a later phase. */
export async function ComingSoon({ title }: { title: string }) {
  const t = await getTranslations("ComingSoon");

  return (
    <main className="mx-auto flex w-full max-w-[76rem] flex-1 flex-col items-center justify-center gap-4 px-4 py-24 text-center sm:px-6">
      <p className="rounded-full bg-navy-soft px-3 py-1 text-xs font-bold text-navy">
        {t("badge")}
      </p>
      <h1 className="text-3xl font-extrabold text-navy">{title}</h1>
      <p className="max-w-prose text-sm text-muted-text">{t("description")}</p>
      <ActionLink href="/" size="lg" className="mt-2">
        {t("backHome")}
      </ActionLink>
    </main>
  );
}
