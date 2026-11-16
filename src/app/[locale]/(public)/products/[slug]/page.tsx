import { ArrowLeft, Check } from "lucide-react";
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
import { sampleProducts } from "@/lib/sample-catalog";
import { siteConfig } from "@/lib/site-config";
import { buildWhatsAppUrl } from "@/lib/whatsapp";

export function generateStaticParams() {
  return sampleProducts.map((product) => ({ slug: product.slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/products/[slug]">): Promise<Metadata> {
  const { locale, slug } = await params;
  const product = sampleProducts.find((item) => item.slug === slug);
  if (!product) return {};
  return { title: locale === "en" ? product.nameEn : product.name };
}

export default async function Page({
  params,
}: PageProps<"/[locale]/products/[slug]">) {
  const { locale, slug } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);

  const product = sampleProducts.find((item) => item.slug === slug);
  if (!product) notFound();

  const [t, tCatalog, tCatalogData, tNav, tWhatsApp] = await Promise.all([
    getTranslations("Product"),
    getTranslations("Catalog"),
    getTranslations("CatalogData"),
    getTranslations("Nav"),
    getTranslations("WhatsApp"),
  ]);

  const name = locale === "en" ? product.nameEn : product.name;
  const askUrl = buildWhatsAppUrl(
    siteConfig.whatsappNumber,
    tWhatsApp("about", { name }),
  );

  const specs = [
    { label: tCatalog("categories"), value: tCatalogData(`categories.${product.category}`) },
    { label: tCatalog("brands"), value: tCatalogData(`brands.${product.brand}`) },
    { label: tCatalog("ages"), value: tCatalogData(`ages.${product.age}`) },
  ];

  const related = sampleProducts
    .filter(
      (item) =>
        item.category === product.category && item.slug !== product.slug,
    )
    .slice(0, 4);

  return (
    <div className="mx-auto w-full max-w-[76rem] px-4 pt-6 pb-16 sm:px-6 lg:px-8">
      <Breadcrumbs
        label={tCatalog("breadcrumbsLabel")}
        items={[
          { label: tNav("home"), href: "/" },
          { label: tNav("products"), href: "/products" },
          { label: name },
        ]}
      />

      <div className="mt-6 grid gap-8 lg:grid-cols-2 lg:gap-12">
        <Photo
          media={product.media}
          alt={name}
          slotLabel={name}
          priority
          sizes="(min-width: 1024px) 38rem, 100vw"
          className="aspect-square rounded-2xl border border-line bg-surface"
        />

        <div className="flex flex-col">
          <p className="text-sm font-bold text-blue">
            {tCatalogData(`categories.${product.category}`)}
          </p>
          <h1 className="mt-2 text-3xl font-extrabold text-balance text-navy sm:text-4xl">
            {name}
          </h1>
          <p className="mt-4 max-w-prose text-[15px] leading-relaxed text-ink/80">
            {t("intro")}
          </p>

          <dl className="mt-7 divide-y divide-line border-y border-line">
            {specs.map((spec) => (
              <div key={spec.label} className="flex gap-4 py-3 text-sm">
                <dt className="w-32 shrink-0 text-muted-text">{spec.label}</dt>
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
            {/* Without a WhatsApp number configured, contact becomes the primary step. */}
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
              const itemName = locale === "en" ? item.nameEn : item.name;
              return (
                <li key={item.slug}>
                  <ProductCard
                    name={itemName}
                    meta={tCatalogData(`brands.${item.brand}`)}
                    href={`/products/${item.slug}`}
                    media={item.media}
                    slotLabel={itemName}
                    buttonVariant="outline"
                    askLabel={tWhatsApp("ask")}
                    askUrl={buildWhatsAppUrl(
                      siteConfig.whatsappNumber,
                      tWhatsApp("about", { name: itemName }),
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
