import { hasLocale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { Photo } from "@/components/shared/photo";
import { Breadcrumbs } from "@/components/ui-kit/breadcrumbs";
import { Link } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { brands, countIn } from "@/lib/sample-catalog";

export default async function Page({ params }: PageProps<"/[locale]/brands">) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);

  const [t, tCatalog, tCatalogData, tNav] = await Promise.all([
    getTranslations("Brands"),
    getTranslations("Catalog"),
    getTranslations("CatalogData"),
    getTranslations("Nav"),
  ]);

  return (
    <div className="mx-auto w-full max-w-[76rem] px-4 pt-6 pb-16 sm:px-6 lg:px-8">
      <Breadcrumbs
        label={tCatalog("breadcrumbsLabel")}
        items={[{ label: tNav("home"), href: "/" }, { label: tNav("brands") }]}
      />

      <h1 className="mt-5 text-3xl font-extrabold text-balance text-navy sm:text-4xl">
        {t("title")}
      </h1>
      <p className="mt-2 max-w-prose text-sm text-muted-text">{t("subtitle")}</p>

      <ul className="mt-8 grid grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-4">
        {brands.map(({ key, media }) => {
          const name = tCatalogData(`brands.${key}`);
          return (
            <li key={key}>
              <Link
                href={`/products?brand=${key}`}
                className="group flex h-full flex-col items-center gap-4 rounded-xl border border-line bg-surface p-6 text-center shadow-card transition-shadow hover:shadow-raised"
              >
                <Photo
                  media={media}
                  alt={name}
                  slotLabel={name}
                  sizes="160px"
                  className="aspect-[3/2] w-full rounded-lg"
                />
                <span className="text-sm font-bold text-navy group-hover:text-blue">
                  {name}
                </span>
                <span className="mt-auto text-xs text-muted-text">
                  {t("itemCount", { count: countIn("brand", key) })}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>

      <p className="mt-10 rounded-xl border border-dashed border-line bg-surface p-6 text-center text-sm text-muted-text">
        {t("note")}
      </p>
    </div>
  );
}
