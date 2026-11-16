import { hasLocale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { CategoryRow } from "@/components/catalog/category-row";
import { ProductFigure } from "@/components/catalog/product-figure";
import { ButtonLink } from "@/components/shared/button-link";
import { ImageFrame } from "@/components/shared/image-frame";
import { SectionHeading } from "@/components/shared/section-heading";
import { WhatsAppButton } from "@/components/shared/whatsapp-button";
import { routing } from "@/i18n/routing";
import type { IndexColour } from "@/lib/categories";
import { siteConfig } from "@/lib/site-config";
import { buildWhatsAppUrl } from "@/lib/whatsapp";

// Sample content. Phase 3 replaces every list below with database queries.
const categories = [
  { key: "school", accent: "school" },
  { key: "paper", accent: "paper" },
  { key: "writing", accent: "writing" },
  { key: "art", accent: "art" },
  { key: "office", accent: "office" },
  { key: "learning", accent: "learning" },
] as const satisfies readonly { key: string; accent: IndexColour }[];

// Frame heights alternate so the row has a rhythm without breaking the grid.
const featured = [
  { key: "backpack", accent: "school", tall: true },
  { key: "notebook", accent: "paper", tall: false },
  { key: "pencils", accent: "art", tall: true },
  { key: "calculator", accent: "office", tall: false },
] as const satisfies readonly {
  key: string;
  accent: IndexColour;
  tall: boolean;
}[];

const claims = ["choice", "advice", "ready"] as const;
const services = ["printing", "lists", "business"] as const;
const shell = "mx-auto w-full max-w-[75rem] px-5 sm:px-8";

export default async function HomePage({ params }: PageProps<"/[locale]">) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);

  const t = await getTranslations("Home");
  const cat = await getTranslations("Categories");
  const whatsapp = await getTranslations("WhatsApp");
  const placeholder = t("photoSlot");

  const listUrl = buildWhatsAppUrl(
    siteConfig.whatsappNumber,
    whatsapp("sendList"),
  );

  return (
    <main className="flex flex-col">
      {/* 1. Hero — asymmetric, type-led. No card, no gradient, no stats. */}
      <section className={`${shell} grid gap-10 pb-16 pt-12 lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] lg:items-center lg:gap-16 lg:pb-24 lg:pt-20`}>
        <div>
          <h1 className="rise max-w-[15ch] text-[2.75rem] font-bold leading-[1.1] sm:text-6xl lg:text-[4.25rem]">
            {t("title")}
          </h1>
          <p className="rise rise-2 mt-6 max-w-[42ch] text-lg leading-relaxed text-graphite">
            {t("subtitle")}
          </p>
          <div className="rise rise-3 mt-8 flex flex-wrap gap-3">
            <ButtonLink href="/products" size="lg">
              {t("browseProducts")}
            </ButtonLink>
            {listUrl ? (
              <WhatsAppButton
                href={listUrl}
                label={whatsapp("sendListCta")}
                className="min-h-14 px-7 text-base"
              />
            ) : (
              <ButtonLink href="/contact" variant="outline" size="lg">
                {t("contactUs")}
              </ButtonLink>
            )}
          </div>
        </div>

        <ImageFrame
          alt={t("heroAlt")}
          placeholder={t("heroSlot")}
          sizes="(min-width: 1024px) 55vw, 100vw"
          priority
          className="rise rise-2 aspect-[4/3] lg:aspect-[5/4]"
        />
      </section>

      {/* 2. The index: colour-coded rows, not cards. */}
      <section className={`${shell} py-14`}>
        <SectionHeading
          title={t("indexTitle")}
          description={t("indexDescription")}
          action={{ label: t("allCategories"), href: "/categories" }}
        />
        <div className="border-t border-line">
          {categories.map(({ key, accent }) => (
            <CategoryRow
              key={key}
              name={cat(`${key}.name`)}
              description={cat(`${key}.description`)}
              href="/categories"
              accent={accent}
              samples={cat.raw(`${key}.samples`) as string[]}
            />
          ))}
        </div>
      </section>

      {/* 3. Featured: a gallery where the lead item is larger. */}
      <section className={`${shell} py-14`}>
        <SectionHeading
          title={t("featuredTitle")}
          description={t("sampleNote")}
          action={{ label: t("allProducts"), href: "/products" }}
        />
        <div className="grid items-start gap-x-6 gap-y-10 grid-cols-2 lg:grid-cols-4">
          {featured.map(({ key, accent, tall }, index) => (
            <ProductFigure
              key={key}
              name={t(`samples.${key}.name`)}
              href="/products"
              category={cat(`${t(`samples.${key}.category`)}.name`)}
              accent={accent}
              price={t(`samples.${key}.price`)}
              placeholder={placeholder}
              tall={tall}
              priority={index === 0}
            />
          ))}
        </div>
      </section>

      {/* 4. The one dark block: a statement, no icons, no cards. */}
      <section className="my-10 bg-ink py-20 text-paper">
        <div className={shell}>
          <p className="max-w-[20ch] text-3xl font-bold leading-snug sm:text-5xl sm:leading-tight">
            {t("statement")}
          </p>
          <dl className="mt-14 grid gap-10 border-t border-paper/20 pt-10 sm:grid-cols-3">
            {claims.map((key) => (
              <div key={key}>
                <dt className="text-lg font-semibold">
                  {t(`claims.${key}.title`)}
                </dt>
                <dd className="mt-2 text-[15px] leading-relaxed text-paper/70">
                  {t(`claims.${key}.body`)}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* 5. Brands: hairlines, no boxes. */}
      <section className={`${shell} py-14`}>
        <h2 className="mb-6 text-sm font-semibold text-graphite">
          {t("brandsTitle")}
        </h2>
        <ul className="grid grid-cols-2 border-t border-line sm:grid-cols-3 lg:grid-cols-6">
          {Array.from({ length: 6 }, (_, index) => (
            <li
              key={index}
              className="flex min-h-20 items-center justify-center border-b border-line px-3 text-center text-xs text-graphite lg:border-s lg:first:border-s-0"
            >
              {t("brandSlot")}
            </li>
          ))}
        </ul>
      </section>

      {/* 6. The shop, as a horizontal strip that runs past the edge. */}
      <section className="py-14">
        <div className={shell}>
          <SectionHeading
            title={t("galleryTitle")}
            action={{ label: t("galleryAll"), href: "/gallery" }}
          />
        </div>
        {/* Scrollable region: focusable so it can be reached and scrolled by keyboard. */}
        <ul
          tabIndex={0}
          aria-label={t("galleryTitle")}
          className="flex snap-x snap-mandatory gap-4 overflow-x-auto overscroll-x-contain px-5 pb-3 sm:px-8"
        >
          {[
            "aspect-[4/3] w-72",
            "aspect-square w-64",
            "aspect-[3/4] w-56",
            "aspect-[4/3] w-72",
            "aspect-square w-64",
          ].map((shape, index) => (
            <li key={index} className={`shrink-0 snap-start ${shape}`}>
              <ImageFrame
                alt={t("gallerySlot")}
                placeholder={t("gallerySlot")}
                sizes="300px"
                className="size-full"
              />
            </li>
          ))}
        </ul>
      </section>

      {/* 7. Services and the shop's own details. */}
      <section id="visit" className={`${shell} scroll-mt-32 py-14`}>
        <SectionHeading title={t("visitTitle")} />
        <div className="grid gap-x-16 gap-y-10 lg:grid-cols-2">
          <div>
            <h3 className="mb-4 text-sm font-semibold text-graphite">
              {t("servicesTitle")}
            </h3>
            <dl className="border-t border-line">
              {services.map((key) => (
                <div key={key} className="border-b border-line py-4">
                  <dt className="font-semibold">{t(`services.${key}.name`)}</dt>
                  <dd className="mt-1 text-[15px] text-graphite">
                    {t(`services.${key}.body`)}
                  </dd>
                </div>
              ))}
            </dl>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-semibold text-graphite">
              {t("detailsTitle")}
            </h3>
            <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-3 border-t border-line pt-4 text-[15px]">
              <dt className="font-semibold">{t("visit.addressLabel")}</dt>
              <dd className="text-graphite">{t("visit.address")}</dd>
              <dt className="font-semibold">{t("visit.hoursLabel")}</dt>
              <dd className="text-graphite">{t("visit.hours")}</dd>
              <dt className="font-semibold">{t("visit.phoneLabel")}</dt>
              <dd className="text-graphite">{t("visit.phone")}</dd>
            </dl>
            {siteConfig.mapUrl ? (
              <a
                href={siteConfig.mapUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-5 inline-block font-semibold text-brand underline underline-offset-4"
              >
                {t("visit.openMap")}
              </a>
            ) : null}
          </div>
        </div>
      </section>

      {/* 8. A quiet close. */}
      <section className={`${shell} py-14`}>
        <div className="flex flex-wrap items-center justify-between gap-6 border-t-2 border-ink pt-8">
          <p className="max-w-[30ch] text-2xl font-bold leading-snug sm:text-3xl">
            {t("closingTitle")}
          </p>
          {listUrl ? (
            <WhatsAppButton
              href={listUrl}
              label={whatsapp("sendListCta")}
              className="min-h-14 px-7 text-base"
            />
          ) : (
            <ButtonLink href="/contact" size="lg">
              {t("contactUs")}
            </ButtonLink>
          )}
        </div>
      </section>
    </main>
  );
}
