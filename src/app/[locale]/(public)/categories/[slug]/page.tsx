import type { Metadata } from "next";
import { hasLocale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { ProductCard } from "@/components/catalog/product-card";
import { ActionLink } from "@/components/ui-kit/button";
import { Breadcrumbs } from "@/components/ui-kit/breadcrumbs";
import { routing } from "@/i18n/routing";
import {
  getBrandsList,
  getCategoriesList,
  getProductsList,
  getWebsiteSettings,
} from "@/lib/repository";
import {
  buildProductWhatsAppMessage,
  buildWhatsAppUrl,
} from "@/lib/whatsapp";

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/categories/[slug]">): Promise<Metadata> {
  const { locale, slug } = await params;
  const categories = await getCategoriesList();
  const found = categories.find((c) => c.slug === slug);
  if (!found) notFound();
  const title = locale === "en" ? found.name_en || found.name_ar : found.name_ar;
  const description =
    (locale === "en" ? found.description_en || found.description_ar : found.description_ar) || undefined;
  const path = `/${locale}/categories/${found.slug}`;
  return {
    title,
    description,
    alternates: {
      canonical: path,
      languages: { ar: `/ar/categories/${found.slug}`, en: `/en/categories/${found.slug}` },
    },
    openGraph: { title, description, url: path },
  };
}

export default async function Page({
  params,
}: PageProps<"/[locale]/categories/[slug]">) {
  const { locale, slug } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);

  const [
    t,
    tCatalog,
    tNav,
    tWhatsApp,
    categories,
    allProducts,
    allBrands,
    settings,
  ] = await Promise.all([
    getTranslations("Categories"),
    getTranslations("Catalog"),
    getTranslations("Nav"),
    getTranslations("WhatsApp"),
    getCategoriesList(),
    getProductsList(),
    getBrandsList(),
    getWebsiteSettings(),
  ]);

  const category = categories.find((item) => item.slug === slug);
  if (!category) notFound();

  const name =
    locale === "en"
      ? category.name_en || category.name_ar
      : category.name_ar;
  const products = allProducts.filter((p) => p.category_slug === category.slug);

  const brandNameBySlug = (bSlug: string) => {
    const found = allBrands.find((b) => b.slug === bSlug);
    if (!found) return bSlug;
    return locale === "en" ? found.name_en || found.name_ar : found.name_ar;
  };

  return (
    <div className="mx-auto w-full max-w-[76rem] px-4 pt-6 pb-16 sm:px-6 lg:px-8">
      <Breadcrumbs
        label={tCatalog("breadcrumbsLabel")}
        items={[
          { label: tNav("home"), href: "/" },
          { label: tNav("categories"), href: "/categories" },
          { label: name },
        ]}
      />

      <div className="mt-5 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-balance text-navy sm:text-4xl">
            {name}
          </h1>
          <p className="mt-2 text-sm text-muted-text">
            {t("itemCount", { count: products.length })}
          </p>
        </div>
        <ActionLink
          href={`/products?cat=${category.slug}`}
          variant="outline"
          size="sm"
        >
          {t("filterInCatalog")}
        </ActionLink>
      </div>

      <ul className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-5 xl:grid-cols-5">
        {products.map((product) => {
          const productName =
            locale === "en"
              ? product.name_en || product.name_ar
              : product.name_ar;
          return (
            <li key={product.slug}>
              <ProductCard
                name={productName}
                meta={brandNameBySlug(product.brand_slug)}
                href={`/products/${product.slug}`}
                media={product.media}
                slotLabel={productName}
                buttonVariant="outline"
                askLabel={tWhatsApp("ask")}
                askUrl={buildWhatsAppUrl(
                  settings.whatsapp_number,
                  buildProductWhatsAppMessage({
                    locale,
                    productName,
                    slug: product.slug,
                  }),
                  true,
                )}
              />
            </li>
          );
        })}
      </ul>
    </div>
  );
}
