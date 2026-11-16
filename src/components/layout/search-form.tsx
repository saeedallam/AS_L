import { Search } from "lucide-react";
import { getLocale, getTranslations } from "next-intl/server";
import { cn } from "@/lib/utils";

/** Plain GET form: works without JavaScript, and results get a shareable URL. */
export async function SearchForm({ className }: { className?: string }) {
  const locale = await getLocale();
  const t = await getTranslations("Search");

  return (
    <form
      role="search"
      action={`/${locale}/products`}
      method="get"
      className={cn(
        "flex min-h-11 items-center gap-2 border-b border-ink/30 px-1 transition-colors focus-within:border-link",
        className,
      )}
    >
      <Search aria-hidden className="size-4 shrink-0 text-quiet" />
      <input
        type="search"
        name="q"
        autoComplete="off"
        spellCheck={false}
        aria-label={t("label")}
        placeholder={t("placeholder")}
        className="min-w-0 flex-1 bg-transparent text-[15px] placeholder:text-quiet"
      />
      <button
        type="submit"
        className="min-h-9 px-2 text-sm font-semibold text-link"
      >
        {t("submit")}
      </button>
    </form>
  );
}
