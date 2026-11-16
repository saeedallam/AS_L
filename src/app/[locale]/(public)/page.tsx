import {
  Backpack,
  Check,
  Clock,
  MapPin,
  Palette,
  PenLine,
  Phone,
  Shapes,
} from "lucide-react";
import { hasLocale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { CategoryCard } from "@/components/catalog/category-card";
import { ProductTile } from "@/components/catalog/product-tile";
import { ButtonLink } from "@/components/shared/button-link";
import { ImagePlaceholder } from "@/components/shared/image-placeholder";
import { SectionHeading } from "@/components/shared/section-heading";
import { WhatsAppButton } from "@/components/shared/whatsapp-button";
import { routing } from "@/i18n/routing";
import { siteConfig } from "@/lib/site-config";
import { buildWhatsAppUrl } from "@/lib/whatsapp";

// Sample content. Phase 4 replaces every list below with database queries.
const categories = [
  { key: "school", tab: "pencil", icon: Backpack },
  { key: "paper", tab: "margin", icon: PenLine },
  { key: "art", tab: "link", icon: Palette },
  { key: "office", tab: "ink", icon: Shapes },
] as const;

const products = [
  { key: "backpack", shape: "tall" },
  { key: "notebook", shape: "square" },
  { key: "pencils", shape: "wide" },
  { key: "geometry", shape: "square" },
  { key: "calculator", shape: "wide" },
] as const;

const listItems = ["notebooks", "pens", "colours", "bag"] as const;
const services = ["printing", "schoolLists", "business"] as const;
const section = "ps-4 py-12";

export default async function HomePage({ params }: PageProps<"/[locale]">) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);

  const t = await getTranslations("Home");
  const cat = await getTranslations("Categories");
  const product = await getTranslations("Product");
  const whatsapp = await getTranslations("WhatsApp");

  const listUrl = buildWhatsAppUrl(
    siteConfig.whatsappNumber,
    whatsapp("sendList"),
  );
  const askAbout = (name: string) =>
    buildWhatsAppUrl(siteConfig.whatsappNumber, whatsapp("about", { name }));

  return (
    <main className="flex flex-col">
      {/* Opening: the school list, which is how a term actually starts here. */}
      <section className="grid items-start gap-10 pb-14 ps-4 pt-10 lg:grid-cols-[1.15fr_1fr] lg:gap-14 lg:pt-14">
        <div>
          <h1 className="max-w-[16ch] text-balance font-display text-[2.5rem] font-extrabold leading-[1.15] tracking-tight sm:text-6xl sm:leading-[1.1]">
            {t("title")}
          </h1>
          <p className="mt-5 max-w-[46ch] text-lg leading-relaxed text-quiet">
            {t("subtitle")}
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
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

        {/* A prepared school list, as the shop writes one out. */}
        <figure className="border border-rule bg-tile">
          <figcaption className="flex items-baseline justify-between gap-3 border-b border-rule px-5 py-3">
            <span className="font-display text-base font-bold">
              {t("list.title")}
            </span>
            <span className="text-sm text-quiet">{t("list.caption")}</span>
          </figcaption>
          <ul className="divide-y divide-rule">
            {listItems.map((key) => (
              <li
                key={key}
                className="flex items-center gap-3 px-5 py-3 text-[15px]"
              >
                <Check
                  aria-hidden
                  className="size-4 shrink-0 text-margin"
                  strokeWidth={2.5}
                />
                <span className="flex-1">{t(`list.items.${key}.name`)}</span>
                <span className="text-sm text-quiet">
                  {t(`list.items.${key}.qty`)}
                </span>
              </li>
            ))}
          </ul>
          <p className="border-t border-rule px-5 py-3 text-sm text-quiet">
            {t("list.note")}
          </p>
        </figure>
      </section>

      <section className={section}>
        <SectionHeading
          title={t("categoriesTitle")}
          description={t("categoriesDescription")}
          action={{ label: t("allCategories"), href: "/categories" }}
        />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {categories.map(({ key, tab, icon }) => (
            <CategoryCard
              key={key}
              name={cat(`${key}.name`)}
              description={cat(`${key}.description`)}
              items={cat.raw(`${key}.items`) as string[]}
              href="/categories"
              tab={tab}
              icon={icon}
            />
          ))}
        </div>
      </section>

      <section className={section}>
        <SectionHeading
          title={t("featuredTitle")}
          description={t("sampleNote")}
          action={{ label: t("allProducts"), href: "/products" }}
        />
        {/* Tile size follows the shape of the goods, not a uniform card grid. */}
        <div className="columns-1 gap-4 sm:columns-2 lg:columns-3 [&>*]:mb-4">
          {products.map(({ key, shape }) => (
            <ProductTile
              key={key}
              name={t(`samples.${key}.name`)}
              href="/products"
              category={cat(`${t(`samples.${key}.category`)}.name`)}
              specs={t.raw(`samples.${key}.specs`) as { label: string; value: string }[]}
              shape={shape}
              whatsappUrl={askAbout(t(`samples.${key}.name`))}
              labels={{ ask: whatsapp("ask"), noImage: product("noImage") }}
            />
          ))}
        </div>
      </section>

      <section id="visit" className={`${section} scroll-mt-24`}>
        <SectionHeading title={t("visit.title")} />
        <div className="grid gap-4 lg:grid-cols-[1fr_1fr]">
          <div className="border border-rule bg-tile">
            <dl className="divide-y divide-rule">
              <div className="flex gap-4 px-5 py-4">
                <MapPin
                  aria-hidden
                  className="size-5 shrink-0 text-quiet"
                  strokeWidth={1.75}
                />
                <div>
                  <dt className="font-semibold">{t("visit.addressLabel")}</dt>
                  <dd className="text-[15px] text-quiet">
                    {t("visit.address")}
                  </dd>
                </div>
              </div>
              <div className="flex gap-4 px-5 py-4">
                <Clock
                  aria-hidden
                  className="size-5 shrink-0 text-quiet"
                  strokeWidth={1.75}
                />
                <div>
                  <dt className="font-semibold">{t("visit.hoursLabel")}</dt>
                  <dd className="text-[15px] text-quiet">{t("visit.hours")}</dd>
                </div>
              </div>
              <div className="flex gap-4 px-5 py-4">
                <Phone
                  aria-hidden
                  className="size-5 shrink-0 text-quiet"
                  strokeWidth={1.75}
                />
                <div>
                  <dt className="font-semibold">{t("visit.phoneLabel")}</dt>
                  <dd className="text-[15px] text-quiet">{t("visit.phone")}</dd>
                </div>
              </div>
            </dl>

            <div className="border-t border-rule px-5 py-4">
              <p className="mb-2 font-semibold">{t("visit.servicesLabel")}</p>
              <ul className="space-y-1 text-[15px] text-quiet">
                {services.map((key) => (
                  <li key={key}>{t(`services.${key}`)}</li>
                ))}
              </ul>
            </div>

            {siteConfig.mapUrl ? (
              <div className="border-t border-rule px-5 py-4">
                <ButtonLink href="/contact" variant="outline">
                  {t("visit.openMap")}
                </ButtonLink>
              </div>
            ) : null}
          </div>

          <div className="min-h-64 border border-rule">
            <ImagePlaceholder label={t("visit.image")} />
          </div>
        </div>
      </section>
    </main>
  );
}
