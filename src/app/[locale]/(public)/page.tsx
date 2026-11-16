import {
  BookOpen,
  Building2,
  ClipboardList,
  FolderOpen,
  GraduationCap,
  MapPin,
  Palette,
  Printer,
} from "lucide-react";
import { hasLocale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { CategoryCard } from "@/components/catalog/category-card";
import { MiniProductCard } from "@/components/catalog/mini-product-card";
import { ProductCard } from "@/components/catalog/product-card";
import { ButtonLink } from "@/components/shared/button-link";
import { SectionHeading } from "@/components/shared/section-heading";
import { WhatsAppIcon } from "@/components/shared/whatsapp-icon";
import { Link } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { siteConfig } from "@/lib/site-config";
import { cn } from "@/lib/utils";
import { buildWhatsAppUrl } from "@/lib/whatsapp";

// Sample content only. Phase 4 replaces every list below with database queries.
const quickLinks = [
  { key: "notebooks", tint: "bg-pencil-soft" },
  { key: "pens", tint: "bg-marker-soft" },
  { key: "bags", tint: "bg-eraser-soft" },
  { key: "colors", tint: "bg-ruler-soft" },
  { key: "paper", tint: "bg-pencil-soft" },
  { key: "calculators", tint: "bg-marker-soft" },
  { key: "geometry", tint: "bg-eraser-soft" },
  { key: "learning", tint: "bg-ruler-soft" },
] as const;

const categories = [
  { key: "school", accent: "pencil", icon: BookOpen },
  { key: "office", accent: "ruler", icon: FolderOpen },
  { key: "art", accent: "eraser", icon: Palette },
  { key: "educational", accent: "marker", icon: GraduationCap },
] as const;

const needs = ["kg", "primary", "secondary", "university", "office"] as const;

const collectionItems = ["pencilCase", "pencilSet", "bottle"] as const;

const sampleProducts = [
  { key: "notebook", category: "school", isNew: true },
  { key: "backpack", category: "school", isNew: false },
  { key: "pencils", category: "art", isNew: false },
  { key: "calculator", category: "office", isNew: false },
] as const;

const services = [
  { key: "printing", icon: Printer },
  { key: "schoolLists", icon: ClipboardList },
  { key: "business", icon: Building2 },
] as const;

const section = "mx-auto w-full max-w-6xl px-4 py-10 sm:px-6";
const photoSlot =
  "grid place-items-center rounded-3xl border-2 border-dashed border-foreground/30 bg-foreground/[0.06] p-6 text-center text-[15px] text-muted";

export default async function HomePage({ params }: PageProps<"/[locale]">) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);

  const t = await getTranslations("Home");
  const cat = await getTranslations("Categories");
  const product = await getTranslations("Product");
  const whatsapp = await getTranslations("WhatsApp");

  const whatsappUrl = buildWhatsAppUrl(
    siteConfig.whatsappNumber,
    whatsapp("greeting"),
  );
  const productHref = (query: string) =>
    ({ pathname: "/products", query: { q: query } }) as const;

  return (
    <main className="flex flex-col">
      {/* Quick category strip */}
      <nav
        aria-label={t("quickTitle")}
        className="mx-auto grid w-full max-w-6xl grid-cols-2 gap-3 px-4 pt-5 sm:grid-cols-4 sm:px-6 lg:grid-cols-8"
      >
        {quickLinks.map((item) => (
          <Link
            key={item.key}
            href={productHref(t(`quick.${item.key}`))}
            className={cn(
              "grid min-h-16 place-items-center rounded-2xl border border-ink/10 px-2 py-2 text-center text-[15px] font-semibold leading-snug text-ink transition-transform hover:-translate-y-0.5",
              item.tint,
            )}
          >
            {t(`quick.${item.key}`)}
          </Link>
        ))}
      </nav>

      {/* Banner hero */}
      <section className="mx-auto w-full max-w-6xl px-4 pb-10 pt-6 sm:px-6">
        <div className="paper-dots relative flex min-h-[26rem] items-end rounded-3xl border-2 border-dashed border-foreground/30 bg-foreground/[0.06] p-4 sm:p-7">
          <span className="absolute end-5 top-5 hidden rounded-md bg-background px-3.5 py-1 text-[15px] text-muted sm:block">
            {t("heroImage")}
          </span>
          <div className="flex max-w-xl flex-col items-start gap-4 rounded-2xl border border-foreground/10 bg-background p-6 sm:p-7">
            <span className="-rotate-2 rounded-md bg-pencil px-3.5 py-1 text-sm font-semibold text-ink">
              {t("badge")}
            </span>
            <h1 className="font-heading text-3xl font-bold leading-snug sm:text-[2.6rem] sm:leading-snug">
              {t("title")}
            </h1>
            <p className="text-muted">{t("subtitle")}</p>
            <div className="flex flex-wrap gap-3">
              <ButtonLink href="/products" size="lg">
                {t("browseProducts")}
              </ButtonLink>
              {whatsappUrl ? (
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-13 items-center gap-2 rounded-full bg-whatsapp px-6 font-semibold text-whatsapp-ink transition hover:brightness-95"
                >
                  <WhatsAppIcon className="size-5" />
                  {whatsapp("ask")}
                </a>
              ) : (
                <ButtonLink href="/contact" size="lg" variant="outline">
                  {t("contactUs")}
                </ButtonLink>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Main categories */}
      <section className={section}>
        <SectionHeading
          title={t("categoriesTitle")}
          action={{ label: t("allCategories"), href: "/categories" }}
        />
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {categories.map((category) => (
            <CategoryCard
              key={category.key}
              name={cat(`${category.key}.name`)}
              description={cat(`${category.key}.description`)}
              href="/categories"
              accent={category.accent}
              icon={category.icon}
            />
          ))}
        </div>
      </section>

      {/* Browse by need */}
      <section className={section}>
        <SectionHeading
          title={t("needsTitle")}
          description={t("needsDescription")}
        />
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {needs.map((key) => (
            <Link
              key={key}
              href={productHref(t(`needs.${key}.name`))}
              className="flex min-h-24 flex-col justify-center gap-0.5 rounded-2xl border border-foreground/10 bg-surface px-5 py-4 transition-transform hover:-translate-y-1"
            >
              <span className="font-heading text-lg font-semibold leading-snug">
                {t(`needs.${key}.name`)}
              </span>
              <span className="text-sm text-muted">
                {t(`needs.${key}.items`)}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured products */}
      <section className={section}>
        <SectionHeading
          title={t("featuredTitle")}
          description={t("sampleNote")}
          action={{ label: t("allProducts"), href: "/products" }}
        />
        <div className="grid grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-4">
          {sampleProducts.map((item) => (
            <ProductCard
              key={item.key}
              name={t(`samples.${item.key}`)}
              href="/products"
              category={cat(`${item.category}.name`)}
              badge={item.isNew ? product("new") : null}
              labels={{
                details: product("details"),
                noImage: product("noImage"),
              }}
            />
          ))}
        </div>
      </section>

      {/* Editorial collection: lifestyle photo beside a short product set */}
      <section className={cn(section, "grid gap-7 lg:grid-cols-2")}>
        <div className={cn(photoSlot, "min-h-72 lg:min-h-full")}>
          {t("collection.image")}
        </div>
        <div className="flex flex-col">
          <SectionHeading
            title={t("collection.title")}
            description={t("collection.description")}
            action={{ label: t("collection.all"), href: "/products" }}
          />
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {collectionItems.map((key) => (
              <MiniProductCard
                key={key}
                name={t(`collection.items.${key}`)}
                href="/products"
                noImageLabel={product("noImage")}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Services */}
      <section className={section}>
        <div className="grid gap-7 rounded-3xl bg-ink px-6 py-9 text-paper sm:grid-cols-3 sm:px-8 dark:border dark:border-paper/15">
          {services.map(({ key, icon: Icon }) => (
            <div key={key} className="flex flex-col gap-2">
              <Icon aria-hidden className="size-7 text-pencil" />
              <h3 className="font-heading text-xl font-semibold">
                {t(`services.${key}.title`)}
              </h3>
              <p className="text-[15px] text-paper/80">
                {t(`services.${key}.description`)}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Visit the store */}
      <section
        id="visit"
        className={cn(section, "grid scroll-mt-40 gap-7 lg:grid-cols-2")}
      >
        <div className="flex flex-col items-start justify-center gap-3.5">
          <SectionHeading
            title={t("visit.title")}
            description={t("visit.description")}
          />
          <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1.5 text-base">
            <dt className="font-bold">{t("visit.addressLabel")}</dt>
            <dd>{t("visit.address")}</dd>
            <dt className="font-bold">{t("visit.hoursLabel")}</dt>
            <dd>{t("visit.hours")}</dd>
          </dl>
          <div className="flex flex-wrap gap-3">
            {siteConfig.mapUrl ? (
              <a
                href={siteConfig.mapUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-12 items-center gap-2 rounded-full bg-ink px-6 font-semibold text-paper dark:bg-paper dark:text-ink"
              >
                <MapPin aria-hidden className="size-5" />
                {t("visit.openMap")}
              </a>
            ) : null}
            <ButtonLink href="/gallery" size="lg" variant="outline">
              {t("visit.gallery")}
            </ButtonLink>
          </div>
        </div>
        <div className={cn(photoSlot, "min-h-72")}>{t("visit.image")}</div>
      </section>
    </main>
  );
}
