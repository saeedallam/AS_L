import { Search } from "lucide-react";
import { getLocale, getTranslations } from "next-intl/server";
import { cn } from "@/lib/utils";

/** Plain GET form, so search works without JavaScript and results are shareable URLs. */
export async function SearchForm({ className }: { className?: string }) {
  const locale = await getLocale();
  const t = await getTranslations("Search");

  return (
    <form
      role="search"
      action={`/${locale}/products`}
      method="get"
      className={cn(
        "flex min-h-12 items-center gap-2.5 rounded-full border border-foreground/20 bg-surface ps-5 pe-1.5",
        className,
      )}
    >
      <Search aria-hidden className="size-5 shrink-0" />
      <input
        type="search"
        name="q"
        aria-label={t("label")}
        placeholder={t("placeholder")}
        className="min-w-0 flex-1 bg-transparent text-base outline-none placeholder:text-muted"
      />
      <button
        type="submit"
        className="min-h-9 rounded-full bg-ink px-4 text-sm font-semibold text-paper dark:bg-paper dark:text-ink"
      >
        {t("submit")}
      </button>
    </form>
  );
}
