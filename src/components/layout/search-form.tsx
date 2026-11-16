import { Search } from "lucide-react";
import { getLocale, getTranslations } from "next-intl/server";
import { cn } from "@/lib/utils";

/** Plain GET form: works without JavaScript and gives shareable result URLs. */
export async function SearchForm({ className }: { className?: string }) {
  const locale = await getLocale();
  const t = await getTranslations("Search");

  return (
    <form
      role="search"
      action={`/${locale}/products`}
      method="get"
      className={cn(
        "flex min-h-12 items-center gap-2 rounded-full border border-line bg-background px-4 transition focus-within:border-secondary",
        className,
      )}
    >
      <Search aria-hidden className="size-4 shrink-0 text-muted" />
      <input
        type="search"
        name="q"
        aria-label={t("label")}
        placeholder={t("placeholder")}
        className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted"
      />
      <button type="submit" className="sr-only">
        {t("submit")}
      </button>
    </form>
  );
}
