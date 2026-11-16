import type { Metadata } from "next";
import { hasLocale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { ProductCard } from "@/components/catalog/product-card";
import { ActionLink } from "@/components/ui-kit/button";
import { Breadcrumbs } from "@/components/ui-kit/breadcrumbs";
import { routing } from "@/i18n/routing";
import {
  categories,
  productsInCategory,
  type CategoryKey,
} from "@/lib/sample-catalog";
import { siteConfig } from "@/lib/site-config";
import { buildWhatsAppUrl } from "@/lib/whatsapp";

export function generateStaticParams() {
  return categories.map(({ key }) => ({ slug: key }));
}

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/categories/[slug]">): Promise<Metadata> {
  const { locale, slug } = await params;
  if (!categories.some((category) => category.key === slug)) return {};
  const t = await getTranslations({ locale, namespace: "CatalogData" });
  return { title: t(`categories.${slug}`) };
}

export default async function Page({
  params,
}: PageProps<"/[locale]/categories/[slug]">) {
  const { locale, slug } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);

  const category = categories.find((item) => item.key === slug);
  if (!category) notFound();

  const [t, tCatalog, tCatalogData, tNav, tWhatsApp] = await Promise.all([
    getTranslations("Categories"),
    getTranslations("Catalog"),
    getTranslations("CatalogData"),
    getTranslations("Nav"),
    getTranslations("WhatsApp"),
  ]);

  const key = category.key as CategoryKey;
  const name = tCatalogData(`categories.${key}`);
  const products = productsInCategory(key);

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
        {/* The catalogue page carries the full filters for this section. */}
        <ActionLink
          href={`/products?cat=${key}`}
          variant="outline"
          size="sm"
        >
          {t("filterInCatalog")}
        </ActionLink>
      </div>

      <ul className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-5 xl:grid-cols-5">
        {products.map((product) => {
          const productName = locale === "en" ? product.nameEn : product.name;
          return (
            <li key={product.slug}>
              <ProductCard
                name={productName}
                meta={tCatalogData(`brands.${product.brand}`)}
                href={`/products/${product.slug}`}
                media={product.media}
                slotLabel={productName}
                buttonVariant="outline"
                askLabel={tWhatsApp("ask")}
                askUrl={buildWhatsAppUrl(
                  siteConfig.whatsappNumber,
                  tWhatsApp("about", { name: productName }),
                )}
              />
            </li>
          );
        })}
      </ul>
    </div>
  );
}
