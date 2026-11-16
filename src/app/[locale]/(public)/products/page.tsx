import { Suspense } from "react";
import { hasLocale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import {
  CatalogResults,
  CatalogResultsFallback,
} from "@/components/catalog/catalog-results";
import { Breadcrumbs } from "@/components/ui-kit/breadcrumbs";
import { routing } from "@/i18n/routing";

export default async function Page({
  params,
  searchParams,
}: PageProps<"/[locale]/products">) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);

  const [t, tNav] = await Promise.all([
    getTranslations("Catalog"),
    getTranslations("Nav"),
  ]);

  return (
    <div className="mx-auto w-full max-w-[76rem] px-4 pt-6 pb-16 sm:px-6 lg:px-8">
      <Breadcrumbs
        label={t("breadcrumbsLabel")}
        items={[{ label: tNav("home"), href: "/" }, { label: tNav("products") }]}
      />

      <h1 className="mt-5 text-3xl font-extrabold text-balance text-navy sm:text-4xl">
        {t("title")}
      </h1>
      <p className="mt-2 mb-6 max-w-prose text-sm text-muted-text">
        {t("subtitle")}
      </p>

      {/* The filters live in the URL, so the results stream in behind the shell. */}
      <Suspense fallback={<CatalogResultsFallback />}>
        <CatalogResults locale={locale} searchParams={searchParams} />
      </Suspense>
    </div>
  );
}
