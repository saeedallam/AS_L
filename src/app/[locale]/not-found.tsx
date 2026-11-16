import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";

export default async function NotFound() {
  const t = await getTranslations("NotFound");

  return (
    <main className="mx-auto flex w-full max-w-xl flex-1 flex-col items-center justify-center gap-4 px-6 py-24 text-center">
      <p className="font-heading text-7xl font-bold text-eraser">404</p>
      <h1 className="font-heading text-2xl font-bold">{t("title")}</h1>
      <p className="text-foreground/75">{t("description")}</p>
      <Link
        href="/"
        className="rounded-full bg-ink px-6 py-3 font-medium text-paper dark:bg-paper dark:text-ink"
      >
        {t("backHome")}
      </Link>
    </main>
  );
}
