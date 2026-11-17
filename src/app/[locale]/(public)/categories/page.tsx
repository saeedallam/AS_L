import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import { hasLocale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { CategoryTile } from "@/components/catalog/category-tile";
import { Breadcrumbs } from "@/components/ui-kit/breadcrumbs";
import { routing } from "@/i18n/routing";
import { getCategoriesList, getProductsList } from "@/lib/repository";

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/categories">): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Categories" });
  return pageMetadata(locale, "/categories", t("title"), t("subtitle"));
}

export default async function Page({
  params,
}: PageProps<"/[locale]/categories">) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);

  const [t, tCatalog, tNav, categories, products] = await Promise.all([
    getTranslations("Categories"),
    getTranslations("Catalog"),
    getTranslations("Nav"),
    getCategoriesList(),
    getProductsList(),
  ]);

  const countInCategory = (slug: string) =>
    products.filter((p) => p.category_slug === slug).length;

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
      <p className="mt-2 max-w-prose text-sm text-muted-text">
        {t("subtitle")}
      </p>

      <ul className="mt-8 grid grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-3">
        {categories.map((cat) => {
          const name =
            locale === "en" ? cat.name_en || cat.name_ar : cat.name_ar;
          return (
            <li key={cat.id}>
              <CategoryTile
                name={name}
                note={t("itemCount", { count: countInCategory(cat.slug) })}
                href={`/categories/${cat.slug}`}
                media={cat.image_path}
                slotLabel={name}
              />
            </li>
          );
        })}
      </ul>
    </div>
  );
}
