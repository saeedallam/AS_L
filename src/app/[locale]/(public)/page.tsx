import { BookOpen, FolderOpen, GraduationCap, Palette } from "lucide-react";
import { hasLocale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { CategoryCard } from "@/components/catalog/category-card";
import { ProductCard } from "@/components/catalog/product-card";
import { ButtonLink } from "@/components/shared/button-link";
import { SectionHeading } from "@/components/shared/section-heading";
import { routing } from "@/i18n/routing";

// Phase 3 preview: shows the shared components with sample content.
// Phase 4 replaces the samples with data from the database.
const categories = [
  { key: "school", accent: "pencil", icon: BookOpen },
  { key: "office", accent: "ruler", icon: FolderOpen },
  { key: "art", accent: "eraser", icon: Palette },
  { key: "educational", accent: "marker", icon: GraduationCap },
] as const;

const sampleProducts = [
  { key: "notebook", category: "school", isNew: true },
  { key: "backpack", category: "school", isNew: false },
  { key: "pencils", category: "art", isNew: false },
  { key: "calculator", category: "office", isNew: false },
] as const;

export default async function HomePage({ params }: PageProps<"/[locale]">) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);

  const t = await getTranslations("Home");
  const cat = await getTranslations("Categories");
  const product = await getTranslations("Product");

  return (
    <main className="flex flex-col">
      <section className="mx-auto grid w-full max-w-6xl items-center gap-10 px-4 py-12 sm:px-6 lg:grid-cols-2 lg:py-16">
        <div className="flex flex-col items-start gap-5">
          <span className="-rotate-2 rounded-md bg-pencil px-3.5 py-1 text-sm font-semibold text-ink">
            {t("badge")}
          </span>
          <h1 className="font-heading text-4xl font-bold leading-snug sm:text-5xl sm:leading-snug">
            {t("title")}
          </h1>
          <p className="max-w-xl text-lg text-muted">{t("subtitle")}</p>
          <div className="flex flex-wrap gap-3">
            <ButtonLink href="/products" size="lg">
              {t("browseProducts")}
            </ButtonLink>
            <ButtonLink href="/contact" size="lg" variant="outline">
              {t("contactUs")}
            </ButtonLink>
          </div>
        </div>

        <div className="paper-dots relative grid min-h-80 place-items-center rounded-3xl border border-foreground/10 bg-surface p-8">
          <div className="grid aspect-[4/5] w-3/5 rotate-3 place-items-center rounded-2xl border-2 border-dashed border-foreground/30 bg-background p-4 text-center text-[15px] text-muted">
            {t("heroImage")}
          </div>
          <span className="absolute start-6 top-6 -rotate-6 rounded-md bg-eraser px-3 py-1 text-sm font-semibold text-ink">
            {t("stickerNew")}
          </span>
          <span className="absolute bottom-7 end-6 rotate-3 rounded-md bg-ruler px-3 py-1 text-sm font-semibold text-ink">
            {t("stickerBrands")}
          </span>
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6">
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

      <section className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6">
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
    </main>
  );
}
