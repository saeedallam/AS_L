import { getTranslations } from "next-intl/server";
import { FilterPanel, type FilterGroup } from "@/components/catalog/filter-panel";
import { Pagination } from "@/components/catalog/pagination";
import { ProductCard } from "@/components/catalog/product-card";
import { SearchField } from "@/components/catalog/search-field";
import { ageKeys, PAGE_SIZE, type AgeKey } from "@/lib/catalog-constants";
import {
  getBrandsList,
  getCatalogFacets,
  getCategoriesList,
  getWebsiteSettings,
  queryCatalog,
} from "@/lib/repository";
import {
  buildProductWhatsAppMessage,
  buildWhatsAppUrl,
} from "@/lib/whatsapp";

type Raw = string | string[] | undefined;
type SearchParams = Record<string, Raw>;

function readList(raw: Raw, allowed: readonly string[]): string[] {
  const values = raw === undefined ? [] : Array.isArray(raw) ? raw : [raw];
  return allowed.filter((option) => values.includes(option));
}

function readPage(raw: Raw): number {
  const value = Number.parseInt(Array.isArray(raw) ? raw[0] : (raw ?? ""), 10);
  return Number.isFinite(value) && value > 0 ? value : 1;
}

const shell = "grid gap-6 lg:grid-cols-[1fr_17rem]";

export function CatalogResultsFallback() {
  return (
    <div aria-hidden>
      <div className="h-14 w-full rounded-xl border border-line bg-surface shadow-card" />
      <div className={`mt-8 ${shell}`}>
        <div className="h-96 rounded-xl border border-line bg-surface shadow-card lg:col-start-2 lg:row-start-1" />
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-5 lg:col-start-1 lg:row-start-1 xl:grid-cols-5">
          {Array.from({ length: 8 }, (_, index) => (
            <div
              key={index}
              className="h-72 rounded-xl border border-line bg-surface shadow-card"
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export async function CatalogResults({
  locale,
  searchParams,
}: {
  locale: string;
  searchParams: Promise<SearchParams>;
}) {
  const [
    sp,
    t,
    tCatalogData,
    tSearch,
    tWhatsApp,
    allCategories,
    allBrands,
    settings,
    facets,
  ] = await Promise.all([
    searchParams,
    getTranslations("Catalog"),
    getTranslations("CatalogData"),
    getTranslations("Search"),
    getTranslations("WhatsApp"),
    getCategoriesList(),
    getBrandsList(),
    getWebsiteSettings(),
    getCatalogFacets(),
  ]);

  const allowedCats = allCategories.map((c) => c.slug);
  const allowedBrands = allBrands.map((b) => b.slug);

  const q = (Array.isArray(sp.q) ? sp.q[0] : sp.q)?.slice(0, 80) ?? "";
  const cat = readList(sp.cat, allowedCats);
  const brand = readList(sp.brand, allowedBrands);
  const age = readList(sp.age, ageKeys) as AgeKey[];
  const sortRaw = Array.isArray(sp.sort) ? sp.sort[0] : sp.sort;
  const sort =
    sortRaw === "name" || sortRaw === "featured" ? sortRaw : "newest";

  // Filtering, search, sorting and pagination all run in the database.
  const result = await queryCatalog({
    q,
    categoryIds: allCategories.filter((c) => cat.includes(c.slug)).map((c) => c.id),
    brandIds: allBrands.filter((b) => brand.includes(b.slug)).map((b) => b.id),
    ages: age,
    sort,
    page: readPage(sp.page),
    pageSize: PAGE_SIZE,
  });
  const { page, pageCount } = result;
  const visible = result.items;

  const groups: FilterGroup[] = [
    {
      name: "cat",
      legend: t("categories"),
      selected: cat,
      options: allCategories.map((c) => ({
        value: c.slug,
        label: locale === "en" ? c.name_en || c.name_ar : c.name_ar,
        count: facets.count("category_id", c.id),
      })),
    },
    {
      name: "brand",
      legend: t("brands"),
      selected: brand,
      options: allBrands.map((b) => ({
        value: b.slug,
        label: locale === "en" ? b.name_en || b.name_ar : b.name_ar,
        count: facets.count("brand_id", b.id),
      })),
    },
    {
      name: "age",
      legend: t("ages"),
      selected: age,
      options: ageKeys.map((value: AgeKey) => ({
        value,
        label: tCatalogData(`ages.${value}`),
        count: facets.count("age_stage", value),
      })),
    },
  ];

  const hrefFor = (next: number, nextSort = sort) => {
    const search = new URLSearchParams();
    if (q) search.set("q", q);
    for (const value of cat) search.append("cat", value);
    for (const value of brand) search.append("brand", value);
    for (const value of age) search.append("age", value);
    if (nextSort !== "newest") search.set("sort", nextSort);
    if (next > 1) search.set("page", String(next));
    const query = search.toString();
    return query ? `/products?${query}` : "/products";
  };

  const isFiltered =
    Boolean(q) || cat.length > 0 || brand.length > 0 || age.length > 0;
  const hiddenFilters = [
    ...cat.map((value) => ({ name: "cat", value })),
    ...brand.map((value) => ({ name: "brand", value })),
    ...age.map((value) => ({ name: "age", value })),
  ];
  const clearHref = `/${locale}/products`;

  const brandNameBySlug = (slug: string) => {
    const found = allBrands.find((b) => b.slug === slug);
    if (!found) return slug;
    return locale === "en" ? found.name_en || found.name_ar : found.name_ar;
  };

  return (
    <>
      <SearchField
        defaultValue={q}
        label={tSearch("label")}
        placeholder={tSearch("placeholder")}
        submitLabel={tSearch("submit")}
        hidden={hiddenFilters}
      />

      <div className={`mt-8 ${shell}`}>
        <aside className="lg:col-start-2 lg:row-start-1">
          <FilterPanel
            title={t("filters")}
            groups={groups}
            query={q || undefined}
            applyLabel={t("apply")}
            clearLabel={t("clear")}
            clearHref={clearHref}
            isFiltered={isFiltered}
          />
        </aside>

        <section
          aria-label={t("resultsLabel")}
          className="lg:col-start-1 lg:row-start-1"
        >
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <p aria-live="polite" className="text-sm text-muted-text">
              {t("count", { count: result.total })}
            </p>

            {/* Sort switcher */}
            <div className="flex items-center gap-2 text-xs">
              <span className="font-bold text-muted-text">{t("sortLabel")}:</span>
              {(["newest", "featured", "name"] as const).map((sKey) => {
                const label =
                  sKey === "newest"
                    ? t("sortNewest")
                    : sKey === "featured"
                      ? t("sortFeatured")
                      : t("sortName");
                const active = sort === sKey;
                return (
                  <a
                    key={sKey}
                    href={`/${locale}${hrefFor(1, sKey)}`}
                    className={`rounded-lg px-3 py-1.5 font-bold transition-colors ${
                      active
                        ? "bg-navy text-white dark:text-navy-deep"
                        : "border border-line bg-surface text-navy hover:bg-navy-soft/60"
                    }`}
                  >
                    {label}
                  </a>
                );
              })}
            </div>
          </div>

          {visible.length > 0 ? (
            <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-5 xl:grid-cols-5">
              {visible.map((product) => {
                const name =
                  locale === "en"
                    ? product.name_en || product.name_ar
                    : product.name_ar;
                return (
                  <li key={product.slug}>
                    <ProductCard
                      name={name}
                      meta={brandNameBySlug(product.brand_slug)}
                      href={`/products/${product.slug}`}
                      media={product.media}
                      slotLabel={name}
                      buttonVariant="outline"
                      askLabel={tWhatsApp("ask")}
                      askUrl={buildWhatsAppUrl(
                        settings.whatsapp_number,
                        buildProductWhatsAppMessage({
                          locale,
                          productName: name,
                          slug: product.slug,
                        }),
                        true,
                      )}
                    />
                  </li>
                );
              })}
            </ul>
          ) : (
            <div className="rounded-xl border border-dashed border-line bg-surface p-10 text-center">
              <p className="font-bold text-navy">{t("emptyTitle")}</p>
              <p className="mt-2 text-sm text-muted-text">{t("emptyBody")}</p>
              <a
                href={clearHref}
                className="mt-5 inline-flex min-h-11 items-center rounded-lg bg-navy px-5 text-sm font-bold text-white hover:bg-navy-deep dark:text-navy-deep"
              >
                {t("clear")}
              </a>
            </div>
          )}

          <Pagination
            page={page}
            pageCount={pageCount}
            hrefFor={(p) => hrefFor(p, sort)}
            labels={{
              nav: t("paginationLabel"),
              previous: t("previous"),
              next: t("next"),
              page: t("page"),
            }}
          />
        </section>
      </div>
    </>
  );
}
