import { hasLocale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { CategoryTile } from "@/components/catalog/category-tile";
import { Breadcrumbs } from "@/components/ui-kit/breadcrumbs";
import { routing } from "@/i18n/routing";
import { categories, countIn } from "@/lib/sample-catalog";

export default async function Page({ params }: PageProps<"/[locale]/categories">) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);

  const [t, tCatalog, tCatalogData, tNav] = await Promise.all([
    getTranslations("Categories"),
    getTranslations("Catalog"),
    getTranslations("CatalogData"),
    getTranslations("Nav"),
  ]);

  return (
    <div className="mx-auto w-full max-w-[76rem] px-4 pt-6 pb-16 sm:px-6 lg:px-8">
      <Breadcrumbs
        label={tCatalog("breadcrumbsLabel")}
        items={[
          { label: tNav("home"), href: "/" },
          { label: tNav("categories") },
        ]}
      />

      <h1 className="mt-5 text-3xl font-extrabold text-balance text-navy sm:text-4xl">
        {t("title")}
      </h1>
      <p className="mt-2 max-w-prose text-sm text-muted-text">{t("subtitle")}</p>

      <ul className="mt-8 grid grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-3">
        {categories.map(({ key, media }) => {
          const name = tCatalogData(`categories.${key}`);
          return (
            <li key={key}>
              <CategoryTile
                name={name}
                note={t("itemCount", { count: countIn("category", key) })}
                href={`/categories/${key}`}
                media={media}
                slotLabel={name}
              />
            </li>
          );
        })}
      </ul>
    </div>
  );
}
