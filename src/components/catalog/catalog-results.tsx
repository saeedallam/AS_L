import { getTranslations } from "next-intl/server";
import { FilterPanel, type FilterGroup } from "@/components/catalog/filter-panel";
import { Pagination } from "@/components/catalog/pagination";
import { ProductCard } from "@/components/catalog/product-card";
import { SearchField } from "@/components/catalog/search-field";
import {
  ageKeys,
  brandKeys,
  categoryKeys,
  PAGE_SIZE,
  queryProducts,
  sampleProducts,
  type AgeKey,
  type BrandKey,
  type CategoryKey,
} from "@/lib/sample-catalog";
import { siteConfig } from "@/lib/site-config";
import { buildWhatsAppUrl } from "@/lib/whatsapp";

type Raw = string | string[] | undefined;
type SearchParams = Record<string, Raw>;

/** Query strings arrive as one value or many; keep only what we recognise. */
function readList<T extends string>(raw: Raw, allowed: readonly T[]): T[] {
  const values = raw === undefined ? [] : Array.isArray(raw) ? raw : [raw];
  return allowed.filter((option) => values.includes(option));
}

function readPage(raw: Raw): number {
  const value = Number.parseInt(Array.isArray(raw) ? raw[0] : (raw ?? ""), 10);
  return Number.isFinite(value) && value > 0 ? value : 1;
}

const shell = "grid gap-6 lg:grid-cols-[1fr_17rem]";

/** Shown while the filtered results resolve, so the layout never jumps. */
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
  const sp = await searchParams;
  const q = (Array.isArray(sp.q) ? sp.q[0] : sp.q)?.slice(0, 80) ?? "";
  const cat = readList(sp.cat, categoryKeys);
  const brand = readList(sp.brand, brandKeys);
  const age = readList(sp.age, ageKeys);

  const [t, tCatalogData, tSearch, tWhatsApp] = await Promise.all([
    getTranslations("Catalog"),
    getTranslations("CatalogData"),
    getTranslations("Search"),
    getTranslations("WhatsApp"),
  ]);

  const matched = queryProducts({ q, cat, brand, age, sort: "newest" });
  const pageCount = Math.max(1, Math.ceil(matched.length / PAGE_SIZE));
  const page = Math.min(readPage(sp.page), pageCount);
  const visible = matched.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  // Counts come from the whole catalogue, so a filter never reads as empty.
  const countBy = (key: "category" | "brand" | "age", value: string) =>
    sampleProducts.filter((product) => product[key] === value).length;

  const groups: FilterGroup[] = [
    {
      name: "cat",
      legend: t("categories"),
      selected: cat,
      options: categoryKeys.map((value: CategoryKey) => ({
        value,
        label: tCatalogData(`categories.${value}`),
        count: countBy("category", value),
      })),
    },
    {
      name: "brand",
      legend: t("brands"),
      selected: brand,
      options: brandKeys.map((value: BrandKey) => ({
        value,
        label: tCatalogData(`brands.${value}`),
        count: countBy("brand", value),
      })),
    },
    {
      name: "age",
      legend: t("ages"),
      selected: age,
      options: ageKeys.map((value: AgeKey) => ({
        value,
        label: tCatalogData(`ages.${value}`),
        count: countBy("age", value),
      })),
    },
  ];

  /** Keeps every active filter while only the page number changes. */
  const hrefFor = (next: number) => {
    const search = new URLSearchParams();
    if (q) search.set("q", q);
    for (const value of cat) search.append("cat", value);
    for (const value of brand) search.append("brand", value);
    for (const value of age) search.append("age", value);
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
          <p aria-live="polite" className="mb-4 text-sm text-muted-text">
            {t("count", { count: matched.length })}
          </p>

          {visible.length > 0 ? (
            <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-5 xl:grid-cols-5">
              {visible.map((product) => {
                const name = locale === "en" ? product.nameEn : product.name;
                return (
                  <li key={product.slug}>
                    <ProductCard
                      name={name}
                      meta={tCatalogData(`brands.${product.brand}`)}
                      href={`/products/${product.slug}`}
                      media={product.media}
                      slotLabel={name}
                      buttonVariant="outline"
                      askLabel={tWhatsApp("ask")}
                      askUrl={buildWhatsAppUrl(
                        siteConfig.whatsappNumber,
                        tWhatsApp("about", { name }),
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
            hrefFor={hrefFor}
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
