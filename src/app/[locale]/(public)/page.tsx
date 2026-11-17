import { BadgeCheck, Gem, Sparkles, Truck, Layers } from "lucide-react";
import { hasLocale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { CategoryTile } from "@/components/catalog/category-tile";
import {
  HeroInteractiveDeck,
  HomeInteractiveProducts,
  SchoolStageExplorer,
} from "@/components/catalog/home-interactive-showcase";
import { Photo } from "@/components/shared/photo";
import { WhatsAppIcon } from "@/components/shared/whatsapp-icon";
import { ActionAnchor, ActionLink } from "@/components/ui-kit/button";
import { FeatureTile } from "@/components/ui-kit/feature-tile";
import { SectionTitle } from "@/components/ui-kit/section-title";
import { Link } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import {
  getBrandsList,
  getCategoriesList,
  getGalleryList,
  getProductsList,
  getWebsiteSettings,
} from "@/lib/repository";
import { buildWhatsAppUrl } from "@/lib/whatsapp";

const reasons = [
  { key: "curation", icon: Sparkles, tint: "blue" },
  { key: "quality", icon: BadgeCheck, tint: "navy" },
  { key: "exclusive", icon: Gem, tint: "gold" },
  { key: "ready", icon: Truck, tint: "blue" },
] as const;

const BRAND_WORDMARKS: Record<
  string,
  { title: string; subtitle: string; monogram: string }
> = {
  one: {
    title: "FABER-CASTELL",
    subtitle: "since 1761",
    monogram: "FC",
  },
  two: {
    title: "STAEDTLER",
    subtitle: "Nürnberg",
    monogram: "ST",
  },
  three: {
    title: "MIDORI",
    subtitle: "Japan",
    monogram: "MD",
  },
  four: {
    title: "rOtring",
    subtitle: "Germany",
    monogram: "rO",
  },
};

const shell = "mx-auto w-full max-w-[76rem] px-4 sm:px-6 lg:px-8";

export default async function HomePage({ params }: PageProps<"/[locale]">) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);

  const [
    t,
    whatsapp,
    tCategories,
    allCategories,
    allProducts,
    allBrands,
    allGallery,
    settings,
  ] = await Promise.all([
    getTranslations("Home"),
    getTranslations("WhatsApp"),
    getTranslations("Categories"),
    getCategoriesList(),
    getProductsList(),
    getBrandsList(),
    getGalleryList(),
    getWebsiteSettings(),
  ]);

  const featuredProducts = allProducts
    .filter((p) => p.is_featured)
    .concat(allProducts.filter((p) => !p.is_featured));

  const popularBrands = allBrands.slice(0, 4);
  const galleryItems = allGallery.slice(0, 5);

  const countInCategory = (slug: string) =>
    allProducts.filter((p) => p.category_slug === slug).length;

  const contactUrl = buildWhatsAppUrl(
    settings.whatsapp_number,
    whatsapp("greeting"),
    true,
  );

  return (
    <main className="flex flex-col pb-4">
      {/* 1. Rich Editorial Hero Section */}
      <section className={`${shell} pb-14 pt-8 lg:pb-20 lg:pt-12`}>
        <div className="grid items-center gap-10 lg:grid-cols-12 lg:gap-12">
          <div className="order-2 text-center lg:order-none lg:col-span-7 lg:text-start">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-line bg-surface px-3.5 py-1.5 text-xs font-extrabold text-navy shadow-xs">
              <span className="size-2 rounded-full bg-gold" />
              <span>مكتبة أسماء النموذجية • Asmaa Model Library</span>
            </div>

            <h1 className="text-[1.9rem] font-extrabold leading-[1.32] text-navy sm:text-4xl lg:text-[2.65rem] lg:leading-[1.26]">
              {t("title")}
            </h1>
            <p className="mx-auto mt-4 max-w-xl text-[15px] leading-relaxed text-muted-text lg:mx-0 sm:text-base">
              {t("subtitle")}
            </p>

            <div className="mt-7 flex flex-wrap justify-center gap-3 lg:justify-start">
              <ActionLink href="/products" size="lg">
                {t("browseProducts")}
              </ActionLink>
              <ActionLink href="/categories" variant="outline" size="lg">
                <Layers className="size-4 text-blue" />
                <span>تصفح الأقسام</span>
              </ActionLink>
              {contactUrl ? (
                <ActionAnchor
                  href={contactUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  variant="whatsapp"
                  size="lg"
                >
                  <WhatsAppIcon className="size-4" />
                  {whatsapp("headerCta")}
                </ActionAnchor>
              ) : null}
            </div>

            {/* 4 Key Library Metrics */}
            <div className="mt-9 grid grid-cols-2 gap-3 border-t border-line pt-6 sm:grid-cols-4 text-start">
              <div className="rounded-xl border border-line bg-surface p-3.5 shadow-xs">
                <p className="text-xl font-extrabold text-navy">+٨٣٠</p>
                <p className="text-xs text-muted-text">منتج مدرسي ومكتبي</p>
              </div>
              <div className="rounded-xl border border-line bg-surface p-3.5 shadow-xs">
                <p className="text-xl font-extrabold text-blue">
                  {allCategories.length} أقسام
                </p>
                <p className="text-xs text-muted-text">تغطية لكل المراحل</p>
              </div>
              <div className="rounded-xl border border-line bg-surface p-3.5 shadow-xs">
                <p className="text-xl font-extrabold text-navy">١٠٠٪</p>
                <p className="text-xs text-muted-text">ماركات أصلية معتمدة</p>
              </div>
              <div className="rounded-xl border border-gold/40 bg-[#fef4dc]/60 p-3.5 shadow-xs">
                <p className="text-xl font-extrabold text-navy">فوري</p>
                <p className="text-xs font-semibold text-navy/80">
                  تجهيز قوائم المدارس
                </p>
              </div>
            </div>
          </div>

          <div className="order-1 lg:order-none lg:col-span-5">
            <HeroInteractiveDeck
              products={featuredProducts}
              categories={allCategories}
              locale={locale}
              whatsappNumber={settings.whatsapp_number}
            />
          </div>
        </div>
      </section>

      {/* 2. Featured Categories (All 6 Sections) */}
      <section className={`${shell} py-14`}>
        <SectionTitle
          title={t("categoriesTitle")}
          subtitle={t("categoriesSubtitle")}
        />
        <div className="grid grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-3">
          {allCategories.map((cat) => {
            const name =
              locale === "en" ? cat.name_en || cat.name_ar : cat.name_ar;
            return (
              <CategoryTile
                key={cat.id}
                name={name}
                note={tCategories("itemCount", {
                  count: countInCategory(cat.slug),
                })}
                href={`/categories/${cat.slug}`}
                media={cat.image_path}
                slotLabel={name}
              />
            );
          })}
        </div>
      </section>

      {/* 3. Interactive Featured Products with Filter Tabs & Quick View */}
      <section className={`${shell} py-14`}>
        <SectionTitle
          title={t("productsTitle")}
          subtitle={t("productsSubtitle")}
        />
        <HomeInteractiveProducts
          products={featuredProducts}
          categories={allCategories}
          locale={locale}
          whatsappNumber={settings.whatsapp_number}
              currencyLabel={settings.currency_label}
        />
        <div className="mt-10 text-center">
          <ActionLink href="/products" variant="navy" size="lg">
            {t("allProducts")}
          </ActionLink>
        </div>
      </section>

      {/* 4. Interactive School Stage & Office Supplies Explorer */}
      <section className={`${shell} py-14`}>
        <SchoolStageExplorer locale={locale} />
      </section>

      {/* 5. Popular Brands — Clean Logo Cards ONLY (nothing underneath the logo) */}
      <section className={`${shell} py-14`}>
        <SectionTitle title={t("brandsTitle")} subtitle={t("brandsSubtitle")} />
        <div className="grid grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-4">
          {popularBrands.map((brand) => {
            const wm = BRAND_WORDMARKS[brand.slug] || {
              title: brand.name_en || brand.name_ar,
              subtitle: "",
              monogram: brand.slug.slice(0, 2).toUpperCase(),
            };
            return (
              <Link
                key={brand.id}
                href={`/products?brand=${brand.slug}`}
                aria-label={brand.name_ar}
                className="group flex aspect-[16/9] flex-col items-center justify-center rounded-xl border border-line bg-surface p-6 text-center shadow-card transition-all hover:border-blue hover:shadow-raised"
              >
                <span className="mb-2 grid size-11 place-items-center rounded-lg bg-navy font-mono text-sm font-black text-gold transition-colors group-hover:bg-blue group-hover:text-white">
                  {wm.monogram}
                </span>
                <span className="font-mono text-base font-black tracking-wider text-navy sm:text-lg">
                  {wm.title}
                </span>
              </Link>
            );
          })}
        </div>
      </section>

      {/* 6. Why Choose Us */}
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

      {/* 7. Gallery */}
      <section className={`${shell} py-14`}>
        <SectionTitle
          title={t("galleryTitle")}
          subtitle={t("gallerySubtitle")}
        />
        <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {galleryItems.map((item) => {
            const caption =
              locale === "en"
                ? item.caption_en || item.caption_ar
                : item.caption_ar;
            return (
              <li key={item.id}>
                <Photo
                  media={item.storage_path}
                  alt={caption}
                  slotLabel={caption}
                  sizes="(min-width: 1024px) 20vw, (min-width: 640px) 33vw, 50vw"
                  className="aspect-square rounded-xl shadow-card"
                />
              </li>
            );
          })}
        </ul>
      </section>

      {/* 8. WhatsApp Panel */}
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
