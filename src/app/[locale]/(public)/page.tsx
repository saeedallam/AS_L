import {
  ArrowLeft,
  ArrowRight,
  Book,
  Briefcase,
  Clock,
  Handshake,
  MapPin,
  PenTool,
  Phone,
  School,
  ShieldCheck,
  Zap,
} from "lucide-react";
import { hasLocale } from "next-intl";
import { getLocale, getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { CategoryCard } from "@/components/catalog/category-card";
import { ProductCard } from "@/components/catalog/product-card";
import { ButtonLink } from "@/components/shared/button-link";
import { ImagePlaceholder } from "@/components/shared/image-placeholder";
import { SectionHeading } from "@/components/shared/section-heading";
import { WhatsAppButton } from "@/components/shared/whatsapp-button";
import { routing } from "@/i18n/routing";
import { siteConfig } from "@/lib/site-config";
import { buildWhatsAppUrl } from "@/lib/whatsapp";

// Sample content. Phase 4 replaces every list below with database queries.
const categories = [
  { key: "school", icon: School },
  { key: "paper", icon: Book },
  { key: "writing", icon: PenTool },
  { key: "office", icon: Briefcase },
] as const;

const sampleProducts = [
  { key: "backpack", category: "school" },
  { key: "notebook", category: "paper" },
  { key: "pencilSet", category: "writing" },
] as const;

const reasons = [
  { key: "authentic", icon: ShieldCheck },
  { key: "advice", icon: Handshake },
  { key: "fast", icon: Zap },
] as const;

const contactRows = [
  { key: "address", icon: MapPin },
  { key: "phone", icon: Phone },
  { key: "hours", icon: Clock },
] as const;

export default async function HomePage({ params }: PageProps<"/[locale]">) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);

  const current = await getLocale();
  const Arrow = current === "ar" ? ArrowLeft : ArrowRight;

  const t = await getTranslations("Home");
  const cat = await getTranslations("Categories");
  const product = await getTranslations("Product");
  const whatsapp = await getTranslations("WhatsApp");

  const whatsappUrl = buildWhatsAppUrl(
    siteConfig.whatsappNumber,
    whatsapp("greeting"),
  );
  const askAbout = (name: string) =>
    buildWhatsAppUrl(siteConfig.whatsappNumber, whatsapp("about", { name }));

  return (
    <main className="flex flex-col">
      {/* Hero */}
      <section className="border-b border-line bg-gradient-to-b from-surface to-background py-14 lg:py-20">
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 sm:px-6 lg:grid-cols-12 lg:px-8">
          <div className="space-y-6 lg:col-span-7">
            <p className="inline-flex items-center gap-2 rounded-full border border-secondary/20 bg-secondary-soft px-3 py-1.5 text-xs font-bold text-secondary">
              <span
                aria-hidden
                className="size-2 animate-pulse rounded-full bg-secondary"
              />
              {t("badge")}
            </p>
            <h1 className="text-3xl font-black leading-tight text-heading sm:text-5xl lg:text-6xl">
              {t("titleStart")}{" "}
              <span className="text-secondary underline decoration-accent decoration-wavy">
                {t("titleAccent")}
              </span>
            </h1>
            <p className="max-w-2xl text-base leading-relaxed text-muted sm:text-lg">
              {t("subtitle")}
            </p>
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <ButtonLink href="/products" size="lg">
                <span>{t("browseProducts")}</span>
                <Arrow aria-hidden className="size-4" />
              </ButtonLink>
              <ButtonLink href="/contact" variant="outline" size="lg">
                {t("contactUs")}
              </ButtonLink>
            </div>
            <dl className="grid grid-cols-3 gap-6 border-t border-line pt-7">
              {(["products", "brands", "quality"] as const).map((key) => (
                <div key={key}>
                  <dt className="sr-only">{t(`stats.${key}.label`)}</dt>
                  <dd className="text-xl font-black text-heading sm:text-2xl">
                    {t(`stats.${key}.value`)}
                  </dd>
                  <p className="mt-1 text-xs font-medium text-muted">
                    {t(`stats.${key}.label`)}
                  </p>
                </div>
              ))}
            </dl>
          </div>

          <div className="lg:col-span-5">
            <div className="relative rounded-3xl border border-line bg-surface p-4 shadow-2xl">
              <div className="h-80 overflow-hidden rounded-2xl sm:h-96">
                <ImagePlaceholder label={t("heroImage")} className="text-sm" />
              </div>
              <p className="absolute bottom-7 end-7 flex items-center gap-3 rounded-2xl border border-line bg-surface/90 px-5 py-3 shadow-lg backdrop-blur-md">
                <span
                  aria-hidden
                  className="grid size-10 place-items-center rounded-xl bg-accent text-primary"
                >
                  <ShieldCheck className="size-5" />
                </span>
                <span>
                  <span className="block text-xs font-medium text-muted">
                    {t("heroBadgeLabel")}
                  </span>
                  <span className="block text-sm font-bold text-heading">
                    {t("heroBadgeValue")}
                  </span>
                </span>
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
        <SectionHeading
          align="center"
          eyebrow={t("categoriesEyebrow")}
          title={t("categoriesTitle")}
          description={t("categoriesDescription")}
        />
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {categories.map(({ key, icon }) => (
            <CategoryCard
              key={key}
              name={cat(`${key}.name`)}
              description={cat(`${key}.description`)}
              href="/categories"
              icon={icon}
              browseLabel={t("browseCategory")}
            />
          ))}
        </div>
      </section>

      {/* Featured products */}
      <section className="border-y border-line bg-surface py-16 lg:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow={t("featuredEyebrow")}
            title={t("featuredTitle")}
            description={t("sampleNote")}
            action={{ label: t("allProducts"), href: "/products" }}
          />
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {sampleProducts.map(({ key, category }) => (
              <ProductCard
                key={key}
                name={t(`samples.${key}.name`)}
                description={t(`samples.${key}.description`)}
                href="/products"
                category={cat(`${category}.name`)}
                whatsappUrl={askAbout(t(`samples.${key}.name`))}
                labels={{
                  details: product("details"),
                  noImage: product("noImage"),
                  ask: whatsapp("ask"),
                }}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Brands */}
      <section className="mx-auto w-full max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <h2 className="mb-8 text-center text-sm font-bold uppercase tracking-wider text-muted">
          {t("brandsTitle")}
        </h2>
        <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {Array.from({ length: 6 }, (_, index) => (
            <li
              key={index}
              className="grid min-h-20 place-items-center rounded-2xl border-2 border-dashed border-line bg-surface px-3 text-center text-xs text-muted"
            >
              {t("brandSlot")}
            </li>
          ))}
        </ul>
      </section>

      {/* Why choose us */}
      <section className="bg-primary py-16 text-white lg:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto mb-12 max-w-2xl text-center">
            <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-accent">
              {t("whyEyebrow")}
            </span>
            <h2 className="mt-3 text-2xl font-black sm:text-3xl">
              {t("whyTitle")}
            </h2>
          </div>
          <div className="grid gap-8 md:grid-cols-3">
            {reasons.map(({ key, icon: Icon }) => (
              <div
                key={key}
                className="rounded-3xl border border-white/10 bg-white/5 p-8"
              >
                <span
                  aria-hidden
                  className="mb-6 grid size-14 place-items-center rounded-2xl bg-accent text-primary"
                >
                  <Icon className="size-6" />
                </span>
                <h3 className="mb-3 text-xl font-bold">
                  {t(`why.${key}.title`)}
                </h3>
                <p className="text-sm leading-relaxed text-slate-300">
                  {t(`why.${key}.description`)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact */}
      <section
        id="visit"
        className="mx-auto w-full max-w-7xl scroll-mt-24 px-4 py-16 sm:px-6 lg:px-8 lg:py-20"
      >
        <div className="rounded-3xl border border-line bg-surface p-6 shadow-sm sm:p-10">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div>
              <span className="rounded-full bg-secondary-soft px-3 py-1 text-xs font-bold uppercase tracking-wider text-secondary">
                {t("contactEyebrow")}
              </span>
              <h2 className="mb-7 mt-3 text-2xl font-black text-heading sm:text-3xl">
                {t("contactTitle")}
              </h2>
              <dl className="space-y-5">
                {contactRows.map(({ key, icon: Icon }) => (
                  <div key={key} className="flex items-start gap-4">
                    <span
                      aria-hidden
                      className="grid size-12 shrink-0 place-items-center rounded-2xl bg-secondary-soft text-secondary"
                    >
                      <Icon className="size-5" />
                    </span>
                    <div>
                      <dt className="font-bold text-heading">
                        {t(`contact.${key}.label`)}
                      </dt>
                      <dd className="mt-0.5 text-sm text-muted">
                        {t(`contact.${key}.value`)}
                      </dd>
                    </div>
                  </div>
                ))}
                {whatsappUrl ? (
                  <div className="pt-1">
                    <WhatsAppButton
                      href={whatsappUrl}
                      label={whatsapp("quickAsk")}
                      className="min-h-13 px-6 text-sm shadow-lg shadow-whatsapp/20"
                    />
                  </div>
                ) : null}
              </dl>
            </div>

            <div className="rounded-2xl border border-line bg-background p-5">
              <h3 className="mb-4 text-lg font-bold text-heading">
                {t("mapTitle")}
              </h3>
              <div className="h-72 overflow-hidden rounded-xl">
                {siteConfig.mapUrl ? (
                  <a
                    href={siteConfig.mapUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="grid size-full place-items-center gap-2 rounded-xl border border-line bg-surface text-center"
                  >
                    <span>
                      <MapPin
                        aria-hidden
                        className="mx-auto mb-2 size-8 text-secondary"
                      />
                      <span className="block font-bold text-heading">
                        {t("mapOpen")}
                      </span>
                    </span>
                  </a>
                ) : (
                  <ImagePlaceholder label={t("mapPlaceholder")} />
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
