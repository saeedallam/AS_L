import { BadgeCheck, Gem, Sparkles, Truck } from "lucide-react";
import { hasLocale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { CategoryTile } from "@/components/catalog/category-tile";
import { ProductCard } from "@/components/catalog/product-card";
import { Photo } from "@/components/shared/photo";
import { WhatsAppIcon } from "@/components/shared/whatsapp-icon";
import { ActionAnchor, ActionLink } from "@/components/ui-kit/button";
import { FeatureTile } from "@/components/ui-kit/feature-tile";
import { SectionTitle } from "@/components/ui-kit/section-title";
import type { MediaKey } from "@/lib/media";
import { routing } from "@/i18n/routing";
import {
  brands,
  categories,
  countIn,
  sampleProducts,
} from "@/lib/sample-catalog";
import { siteConfig } from "@/lib/site-config";
import { buildWhatsAppUrl } from "@/lib/whatsapp";

// The home page shows the first few of the same sections, brands and products
// the rest of the site uses, so every tile here links somewhere real.
const featuredCategories = categories.slice(0, 4);
const featuredProducts = sampleProducts.slice(0, 4);

const reasons = [
  { key: "curation", icon: Sparkles, tint: "blue" },
  { key: "quality", icon: BadgeCheck, tint: "navy" },
  { key: "exclusive", icon: Gem, tint: "gold" },
  { key: "ready", icon: Truck, tint: "blue" },
] as const;

const gallery = [
  "gallery-1",
  "gallery-2",
  "gallery-3",
  "gallery-4",
  "gallery-5",
] as const satisfies readonly MediaKey[];

const shell = "mx-auto w-full max-w-[76rem] px-4 sm:px-6 lg:px-8";

export default async function HomePage({ params }: PageProps<"/[locale]">) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);

  const t = await getTranslations("Home");
  const whatsapp = await getTranslations("WhatsApp");
  const tCatalogData = await getTranslations("CatalogData");
  const tCategories = await getTranslations("Categories");

  const askAbout = (name: string) =>
    buildWhatsAppUrl(siteConfig.whatsappNumber, whatsapp("about", { name }));
  const contactUrl = buildWhatsAppUrl(
    siteConfig.whatsappNumber,
    whatsapp("greeting"),
  );

  return (
    <main className="flex flex-col pb-4">
      {/* Hero: photo on one side, headline and action on the other. */}
      <section className={`${shell} pb-14 pt-10 lg:pb-20 lg:pt-14`}>
        <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-14">
          <div className="order-2 text-center lg:order-none lg:text-start">
            <h1 className="text-[1.9rem] font-extrabold leading-[1.35] text-navy sm:text-4xl lg:text-[2.6rem] lg:leading-[1.3]">
              {t("title")}
            </h1>
            <p className="mx-auto mt-4 max-w-xl text-[15px] leading-relaxed text-muted-text lg:mx-0">
              {t("subtitle")}
            </p>
            <div className="mt-7 flex flex-wrap justify-center gap-3 lg:justify-start">
              <ActionLink href="/products" size="lg">
                {t("browseProducts")}
              </ActionLink>
              {contactUrl ? (
                <ActionAnchor
                  href={contactUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  variant="outline"
                  size="lg"
                >
                  <WhatsAppIcon className="size-4" />
                  {whatsapp("headerCta")}
                </ActionAnchor>
              ) : null}
            </div>
          </div>
          <Photo
            media="hero"
            alt={t("heroAlt")}
            slotLabel={t("heroSlot")}
            priority
            sizes="(min-width: 1024px) 50vw, 100vw"
            className="order-1 aspect-[4/3] rounded-xl shadow-card lg:order-none"
          />
        </div>
      </section>

      {/* Featured categories: photo tiles with the name banded on. */}
      <section className={`${shell} py-14`}>
        <SectionTitle
          title={t("categoriesTitle")}
          subtitle={t("categoriesSubtitle")}
        />
        <div className="grid grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-4">
          {featuredCategories.map(({ key, media }) => (
            <CategoryTile
              key={key}
              name={tCatalogData(`categories.${key}`)}
              note={tCategories("itemCount", { count: countIn("category", key) })}
              href={`/categories/${key}`}
              media={media}
              slotLabel={tCatalogData(`categories.${key}`)}
            />
          ))}
        </div>
      </section>

      {/* Featured products. */}
      <section className={`${shell} py-14`}>
        <SectionTitle
          title={t("productsTitle")}
          subtitle={t("productsSubtitle")}
        />
        <div className="grid grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-4">
          {featuredProducts.map((product) => {
            const name = locale === "en" ? product.nameEn : product.name;
            return (
              <ProductCard
                key={product.slug}
                name={name}
                meta={tCatalogData(`categories.${product.category}`)}
                href={`/products/${product.slug}`}
                media={product.media}
                slotLabel={name}
                askUrl={askAbout(name)}
                askLabel={whatsapp("ask")}
              />
            );
          })}
        </div>
        <div className="mt-8 text-center">
          <ActionLink href="/products" variant="outline" size="lg">
            {t("allProducts")}
          </ActionLink>
        </div>
      </section>

      {/* Popular brands. */}
      <section className={`${shell} py-14`}>
        <SectionTitle title={t("brandsTitle")} subtitle={t("brandsSubtitle")} />
        <div className="grid grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-4">
          {brands.map(({ key, media }) => (
            <article
              key={key}
              className="group overflow-hidden rounded-xl border border-line bg-surface shadow-card transition-shadow hover:shadow-raised"
            >
              <Photo
                media={media}
                alt={tCatalogData(`brands.${key}`)}
                slotLabel={t("brandSlot")}
                sizes="(min-width: 1024px) 25vw, 50vw"
                className="aspect-[5/4]"
              />
              <div className="p-4 text-center">
                <p className="text-sm font-extrabold uppercase tracking-wide text-navy">
                  {tCatalogData(`brands.${key}`)}
                </p>
                <ActionLink
                  href="/brands"
                  className="mt-3 w-full"
                  variant="outline"
                >
                  {t("brandBrowse")}
                </ActionLink>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Why choose us. */}
      <section className={`${shell} py-14`}>
        <SectionTitle title={t("whyTitle")} subtitle={t("whySubtitle")} />
        <div className="grid grid-cols-2 gap-8 lg:grid-cols-4">
          {reasons.map(({ key, icon, tint }) => (
            <FeatureTile
              key={key}
              label={t(`why.${key}`)}
              icon={icon}
              tint={tint}
            />
          ))}
        </div>
      </section>

      {/* Gallery. */}
      <section className={`${shell} py-14`}>
        <SectionTitle title={t("galleryTitle")} subtitle={t("gallerySubtitle")} />
        <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {gallery.map((key) => (
            <li key={key}>
              <Photo
                media={key}
                alt={t("gallerySlot")}
                slotLabel={t("gallerySlot")}
                sizes="(min-width: 1024px) 20vw, (min-width: 640px) 33vw, 50vw"
                className="aspect-square rounded-xl shadow-card"
              />
            </li>
          ))}
        </ul>
      </section>

      {/* WhatsApp panel. */}
      <section className={`${shell} py-14`}>
        <div className="flex flex-col items-center gap-8 rounded-xl border border-line bg-surface p-8 text-center shadow-card sm:p-12 lg:flex-row-reverse lg:justify-between lg:text-start">
          <WhatsAppIcon className="size-20 shrink-0 text-whatsapp" />
          <div className="lg:max-w-2xl">
            <h2 className="text-2xl font-extrabold text-navy">
              {t("whatsappTitle")}
            </h2>
            <p className="mt-3 text-[15px] leading-relaxed text-muted-text">
              {t("whatsappBody")}
            </p>
            {contactUrl ? (
              <ActionAnchor
                href={contactUrl}
                target="_blank"
                rel="noopener noreferrer"
                size="lg"
                className="mt-6"
              >
                <WhatsAppIcon className="size-4" />
                {whatsapp("headerCta")}
              </ActionAnchor>
            ) : null}
          </div>
        </div>
      </section>
    </main>
  );
}
