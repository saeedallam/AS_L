import { ArrowLeft, Check, Tag } from "lucide-react";
import { hasLocale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ProductCard } from "@/components/catalog/product-card";
import { Photo } from "@/components/shared/photo";
import { WhatsAppIcon } from "@/components/shared/whatsapp-icon";
import { ActionAnchor, ActionLink } from "@/components/ui-kit/button";
import { Breadcrumbs } from "@/components/ui-kit/breadcrumbs";
import { routing } from "@/i18n/routing";
import {
  getBrandsList,
  getCategoriesList,
  getProductBySlugRecord,
  getRelatedProducts,
  getWebsiteSettings,
} from "@/lib/repository";
import { photoSrc } from "@/lib/media";
import { jsonLdString } from "@/lib/seo";
import { siteUrl } from "@/lib/supabase/env";
import {
  buildProductWhatsAppMessage,
  buildWhatsAppUrl,
  formatPrice,
} from "@/lib/whatsapp";

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/products/[slug]">): Promise<Metadata> {
  const { locale, slug } = await params;
  const product = await getProductBySlugRecord(slug);
  if (!product) notFound();
  const name = locale === "en" ? product.name_en || product.name_ar : product.name_ar;
  const title = (locale === "ar" && product.seo_title) || name;
  const description =
    (locale === "ar" && product.seo_description) ||
    (locale === "en"
      ? product.short_description_en || product.short_description_ar
      : product.short_description_ar) ||
    undefined;
  const image = photoSrc(product.media);
  const path = `/${locale}/products/${product.slug}`;
  return {
    title,
    description,
    alternates: {
      canonical: path,
      languages: { ar: `/ar/products/${product.slug}`, en: `/en/products/${product.slug}`, "x-default": `/ar/products/${product.slug}` },
    },
    openGraph: {
      type: "website",
      title,
      description,
      url: path,
      images: image ? [{ url: image, alt: name }] : undefined,
    },
    twitter: { card: image ? "summary_large_image" : "summary", title, description, images: image ? [image] : undefined },
  };
}

export default async function Page({
  params,
}: PageProps<"/[locale]/products/[slug]">) {
  const { locale, slug } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);

  const [
    product,
    allCategories,
    allBrands,
    settings,
    t,
    tCatalog,
    tCatalogData,
    tNav,
    tWhatsApp,
  ] = await Promise.all([
    getProductBySlugRecord(slug),
    getCategoriesList(),
    getBrandsList(),
    getWebsiteSettings(),
    getTranslations("Product"),
    getTranslations("Catalog"),
    getTranslations("CatalogData"),
    getTranslations("Nav"),
    getTranslations("WhatsApp"),
  ]);

  if (!product) notFound();

  const name =
    locale === "en" ? product.name_en || product.name_ar : product.name_ar;
  const description =
    locale === "en"
      ? product.description_en || product.description_ar || t("intro")
      : product.description_ar || t("intro");

  const catObj = allCategories.find((c) => c.slug === product.category_slug);
  const brandObj = allBrands.find((b) => b.slug === product.brand_slug);

  const categoryName = catObj
    ? locale === "en"
      ? catObj.name_en || catObj.name_ar
      : catObj.name_ar
    : product.category_slug;

  const brandName = brandObj
    ? locale === "en"
      ? brandObj.name_en || brandObj.name_ar
      : brandObj.name_ar
    : product.brand_slug;

  const askUrl = buildWhatsAppUrl(
    settings.whatsapp_number,
    buildProductWhatsAppMessage({
      locale,
      productName: name,
      slug: product.slug,
    }),
    true,
  );

  const defaultSpecs = [
    { label: tCatalog("categories"), value: categoryName },
    { label: tCatalog("brands"), value: brandName },
    ...(product.age_stage
      ? [{ label: tCatalog("ages"), value: tCatalogData(`ages.${product.age_stage}`) }]
      : []),
  ];

  const customSpecs = (product.specifications || []).map((s) => ({
    label: locale === "en" ? s.label_en || s.label_ar : s.label_ar,
    value: locale === "en" ? s.value_en || s.value_ar : s.value_ar,
  }));

  const specs = customSpecs.length > 0 ? customSpecs : defaultSpecs;

  const related = await getRelatedProducts(product, 4);
  const extraImages = product.images;
  const priceText = formatPrice(product.display_price, settings.currency_label);
  const saleText = formatPrice(product.promotional_price, settings.currency_label);

  const imageUrl = photoSrc(product.media);
  const productJsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name,
    description: product.short_description_ar || description,
    sku: product.sku,
    url: `${siteUrl()}/${locale}/products/${product.slug}`,
    image: [imageUrl, ...extraImages.map((img) => photoSrc(img.url))]
      .filter((u): u is string => Boolean(u))
      .map((u) => (u.startsWith("/") ? `${siteUrl()}${u}` : u)),
    category: categoryName || undefined,
    brand: brandObj ? { "@type": "Brand", name: brandName } : undefined,
  };
  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: tNav("home"), item: `${siteUrl()}/${locale}` },
      { "@type": "ListItem", position: 2, name: tNav("products"), item: `${siteUrl()}/${locale}/products` },
      { "@type": "ListItem", position: 3, name },
    ],
  };

  return (
    <div className="mx-auto w-full max-w-[76rem] px-4 pt-6 pb-16 sm:px-6 lg:px-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdString([productJsonLd, breadcrumbJsonLd]) }}
      />
      <Breadcrumbs
        label={tCatalog("breadcrumbsLabel")}
        items={[
          { label: tNav("home"), href: "/" },
          { label: tNav("products"), href: "/products" },
          { label: name },
        ]}
      />

      <div className="mt-6 grid gap-8 lg:grid-cols-2 lg:gap-12">
        <div className="space-y-4">
          <Photo
            media={product.media}
            alt={name}
            slotLabel={name}
            priority
            sizes="(min-width: 1024px) 38rem, 100vw"
            className="aspect-square rounded-2xl border border-line bg-surface"
          />

          {extraImages.length > 0 && (
            <div className="grid grid-cols-4 gap-3">
              {extraImages.map((img, idx) => (
                <Photo
                  key={img.id}
                  media={img.url}
                  alt={img.alt || `${name} ${idx + 2}`}
                  slotLabel={`${name} ${idx + 2}`}
                  sizes="140px"
                  className="aspect-square rounded-xl border border-line bg-surface"
                />
              ))}
            </div>
          )}
        </div>

        <div className="flex flex-col">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-sm font-bold text-blue">{categoryName}</p>
            {product.sku && (
              <span className="rounded-md border border-line bg-surface px-2.5 py-0.5 font-mono text-xs text-muted-text">
                {t("skuLabel")}: {product.sku}
              </span>
            )}
          </div>

          <h1 className="mt-2 text-3xl font-extrabold text-balance text-navy sm:text-4xl">
            {name}
          </h1>

          {/* Optional Price & Promotional Price */}
          {product.display_price != null && (
            <div className="mt-4 inline-flex items-center gap-3 self-start rounded-xl border border-line bg-surface px-4 py-2.5 shadow-card">
              <Tag className="size-4 text-blue" />
              <span className="text-xs font-bold text-muted-text">
                {t("priceLabel")}:
              </span>
              {product.promotional_price != null ? (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-text line-through">
                    {priceText}
                  </span>
                  <span className="text-lg font-extrabold text-blue">
                    {saleText}
                  </span>
                </div>
              ) : (
                <span className="text-lg font-extrabold text-navy">
                  {priceText}
                </span>
              )}
            </div>
          )}

          <p className="mt-4 max-w-prose text-[15px] leading-relaxed text-ink/80">
            {description}
          </p>

          {/* Optional Variants */}
          {product.variants && product.variants.length > 0 && (
            <div className="mt-5">
              <p className="mb-2 text-xs font-bold text-navy">
                {t("variantsLabel")}:
              </p>
              <div className="flex flex-wrap gap-2">
                {product.variants.map((v, i) => (
                  <span
                    key={i}
                    className="rounded-lg border border-line bg-surface px-3 py-1 text-xs font-bold text-navy"
                  >
                    {v.group_ar}: {v.value_ar}
                  </span>
                ))}
              </div>
            </div>
          )}

          <dl className="mt-7 divide-y divide-line border-y border-line">
            {specs.map((spec, idx) => (
              <div key={idx} className="flex gap-4 py-3 text-sm">
                <dt className="w-36 shrink-0 text-muted-text">{spec.label}</dt>
                <dd className="min-w-0 flex-1 font-bold text-navy">
                  {spec.value}
                </dd>
              </div>
            ))}
          </dl>

          <ul className="mt-6 space-y-2 text-sm text-ink/80">
            {["availability", "advice", "bulk"].map((key) => (
              <li key={key} className="flex items-start gap-2">
                <Check
                  aria-hidden
                  className="mt-0.5 size-4 shrink-0 text-whatsapp-deep"
                  strokeWidth={2.5}
                />
                <span>{t(`points.${key}`)}</span>
              </li>
            ))}
          </ul>

          <div className="mt-8 flex flex-wrap gap-3">
            {askUrl ? (
              <ActionAnchor
                href={askUrl}
                target="_blank"
                rel="noopener noreferrer"
                variant="whatsapp"
                size="lg"
              >
                <WhatsAppIcon className="size-5" />
                {t("askPrice")}
              </ActionAnchor>
            ) : null}
            <ActionLink
              href="/contact"
              variant={askUrl ? "outline" : "navy"}
              size="lg"
            >
              {tNav("contact")}
            </ActionLink>
          </div>

          <p className="mt-4 text-xs text-muted-text">{t("priceNote")}</p>
        </div>
      </div>

      {related.length > 0 ? (
        <section className="mt-16" aria-labelledby="related-heading">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2
              id="related-heading"
              className="text-2xl font-extrabold text-navy"
            >
              {t("related")}
            </h2>
            <ActionLink href="/products" variant="outline" size="sm">
              {tCatalog("title")}
              <ArrowLeft aria-hidden className="size-4 ltr:rotate-180" />
            </ActionLink>
          </div>

          <ul className="mt-6 grid grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-4">
            {related.map((item) => {
              const itemName =
                locale === "en" ? item.name_en || item.name_ar : item.name_ar;
              return (
                <li key={item.slug}>
                  <ProductCard
                    name={itemName}
                    meta={categoryName}
                    href={`/products/${item.slug}`}
                    media={item.media}
                    slotLabel={itemName}
                    buttonVariant="outline"
                    askLabel={tWhatsApp("ask")}
                    askUrl={buildWhatsAppUrl(
                      settings.whatsapp_number,
                      buildProductWhatsAppMessage({
                        locale,
                        productName: itemName,
                        slug: item.slug,
                      }),
                      true,
                    )}
                  />
                </li>
              );
            })}
          </ul>
        </section>
      ) : null}
    </div>
  );
}
