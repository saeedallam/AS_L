"use client";

import React, { useState } from "react";
import Image from "next/image";
import {
  Sparkles,
  CheckCircle2,
  Eye,
  X,
  ArrowUpLeft,
  BookOpen,
  GraduationCap,
  Compass,
  Briefcase,
} from "lucide-react";
import { Link } from "@/i18n/navigation";
import { WhatsAppIcon } from "@/components/shared/whatsapp-icon";
import { ActionAnchor, ActionLink } from "@/components/ui-kit/button";
import type { CategoryRecord, ProductRecord } from "@/lib/data/records";
import { PLACEHOLDER_PHOTOS, previewSrc } from "@/lib/media-placeholders";
import { buildProductWhatsAppMessage, buildWhatsAppUrl, formatPrice } from "@/lib/whatsapp";

const STAGE_GUIDES = [
  {
    key: "primary",
    titleAr: "المرحلة الابتدائية والتأسيسية",
    titleEn: "Primary School Stage",
    icon: BookOpen,
    badgeAr: "أساسيات التعلم",
    descriptionAr:
      "تشكيلة متكاملة من الكراسات المدرسية، أقلام الرصاص المريحة لليد، الألوان الخشبية والمائية الآمنة، والحقائب الخفيفة المدعمة للظهر.",
    checklistAr: [
      "حقائب ظهر خفيفة الوزن ومبطنة لحماية العمود الفقري",
      "كراسات مسطرة ومربعات بورق ناصع مريح للعين",
      "ألوان خشبية ومائية ومقلمات واسعة سهلة الفتح",
    ],
    filterHref: "/products?age=primary",
  },
  {
    key: "preparatory",
    titleAr: "المرحلة الإعدادية والمتوسطة",
    titleEn: "Preparatory Stage",
    icon: Compass,
    badgeAr: "تنظيم ودقة",
    descriptionAr:
      "أدوات هندسية دقيقة، كشاكيل سلك متعددة الفواصل لتنظيم المواد، وأقلام جاف وتظليل عالية الجودة للمذاكرة وتلخيص الدروس.",
    checklistAr: [
      "أطقم هندسية معدنية ومساطر قياس دقيقة",
      "كشاكيل سلك A4 و B5 بوزن ورق يتحمل الكتابة على الوجهين",
      "أقلام جاف وأقلام تظليل باستيل لتنظيم الملاحظات",
    ],
    filterHref: "/products?age=preparatory",
  },
  {
    key: "secondary",
    titleAr: "المرحلة الثانوية والجامعية",
    titleEn: "Secondary & University",
    icon: GraduationCap,
    badgeAr: "أداء احترافي",
    descriptionAr:
      "آلات حاسبة علمية، دفاتر محاضرات فاخرة، أقلام تحبير ورسم هندسي، وحقائب عصرية مزودة بجيب مبطن للابتوب والتابلت.",
    checklistAr: [
      "آلات حاسبة علمية وأقلام تحبير ورسم هندسي",
      "دفاتر ومفكرات جلدية وقطنية للمحاضرات والمشاريع",
      "حقائب ظهر جامعية مقاومة للماء تتسع للابتوب",
    ],
    filterHref: "/products?age=secondary",
  },
  {
    key: "office",
    titleAr: "تجهيزات المكاتب والشركات",
    titleEn: "Office & Corporate Supplies",
    icon: Briefcase,
    badgeAr: "بيئة عمل منظمة",
    descriptionAr:
      "كل ما يحتاجه المكتب العصري من منظمات سطح المكتب، ورق التصوير الفاخر، الدباسات والخرامات، وملفات الأرشفة وحفظ الوثائق.",
    checklistAr: [
      "ورق تصوير A4 عالي النصاعة ومستلزمات الطباعة",
      "منظمات مكتب ودباسات وأدوات أرشفة متينة",
      "أقلام توقيع ومفكرات تخطيط يومية وسنوية",
    ],
    filterHref: "/products?cat=office",
  },
];

export function HeroInteractiveDeck({
  products,
  categories,
  locale,
  whatsappNumber,
}: {
  products: ProductRecord[];
  categories: CategoryRecord[];
  locale: string;
  whatsappNumber: string;
}) {
  const deckItems = products.slice(0, 3);
  const [activeIndex, setActiveIndex] = useState(0);
  const current = deckItems[activeIndex] || products[0];

  if (!current) return null;

  const name =
    locale === "en" ? current.name_en || current.name_ar : current.name_ar;
  const catObj = categories.find((c) => c.slug === current.category_slug);
  const catName = catObj
    ? locale === "en"
      ? catObj.name_en || catObj.name_ar
      : catObj.name_ar
    : current.category_slug;

  const resolveImg = (media: string) =>
    previewSrc(media) ?? PLACEHOLDER_PHOTOS["c-4"];

  const waHref =
    buildWhatsAppUrl(
      whatsappNumber,
      buildProductWhatsAppMessage({ locale, productName: name, slug: current.slug }),
      true,
    ) ?? "#";

  return (
    <div className="rounded-2xl border border-line bg-surface p-4 shadow-raised sm:p-5">
      {/* Top Switcher Bar */}
      <div className="mb-3 flex items-center justify-between border-b border-line pb-3">
        <div className="flex items-center gap-2">
          <span className="size-2.5 rounded-full bg-gold" />
          <span className="text-xs font-extrabold text-navy">
            {locale === "en" ? "Featured Showcase" : "مختارات من المعرض"}
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          {deckItems.map((item, idx) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setActiveIndex(idx)}
              className={`rounded-lg px-2.5 py-1 text-xs font-bold transition-colors ${
                activeIndex === idx
                  ? "bg-navy text-gold shadow-xs"
                  : "bg-page text-muted-text hover:text-navy"
              }`}
            >
              0{idx + 1}
            </button>
          ))}
        </div>
      </div>

      {/* Main Image */}
      <div className="relative aspect-[4/3] overflow-hidden rounded-xl border border-line bg-page">
        <Image
          src={resolveImg(current.media)}
          alt={name}
          fill
          sizes="(min-width: 1024px) 40vw, 100vw"
          className="object-cover transition-transform duration-500 hover:scale-105"
        />
        <span className="absolute top-3 start-3 rounded-lg bg-navy/90 px-3 py-1 text-xs font-bold text-gold backdrop-blur-xs">
          {catName}
        </span>
      </div>

      {/* Details & Actions */}
      <div className="mt-4 space-y-3">
        <div className="flex items-center justify-between gap-2">
          <Link
            href={`/products/${current.slug}`}
            className="text-lg font-extrabold text-navy hover:text-blue"
          >
            {name}
          </Link>
          {current.sku && (
            <span className="rounded border border-line bg-page px-2 py-0.5 font-mono text-[11px] text-muted-text">
              {current.sku}
            </span>
          )}
        </div>

        <p className="line-clamp-2 text-xs leading-relaxed text-muted-text sm:text-sm">
          {locale === "en"
            ? current.short_description_en || current.description_en
            : current.short_description_ar || current.description_ar}
        </p>

        <div className="flex items-center gap-2.5 pt-1">
          <ActionLink
            href={`/products/${current.slug}`}
            variant="navy"
            size="sm"
            className="flex-1"
          >
            <span>{locale === "en" ? "View Details" : "عرض التفاصيل"}</span>
            <ArrowUpLeft className="size-4" />
          </ActionLink>
          <ActionAnchor
            href={waHref}
            target="_blank"
            rel="noopener noreferrer"
            variant="whatsapp"
            size="sm"
          >
            <WhatsAppIcon className="size-4" />
            <span>{locale === "en" ? "WhatsApp" : "واتساب"}</span>
          </ActionAnchor>
        </div>
      </div>
    </div>
  );
}

export function HomeInteractiveProducts({
  products,
  categories,
  locale,
  whatsappNumber,
  currencyLabel = "",
}: {
  products: ProductRecord[];
  categories: CategoryRecord[];
  locale: string;
  whatsappNumber: string;
  currencyLabel?: string;
}) {
  const [selectedCat, setSelectedCat] = useState<string>("all");
  const [quickProduct, setQuickProduct] = useState<ProductRecord | null>(null);

  const filtered =
    selectedCat === "all"
      ? products.slice(0, 8)
      : products.filter((p) => p.category_slug === selectedCat).slice(0, 8);

  const resolveImg = (media: string) =>
    previewSrc(media) ?? PLACEHOLDER_PHOTOS["c-4"];

  const catNameBySlug = (slug: string) => {
    const found = categories.find((c) => c.slug === slug);
    if (!found) return slug;
    return locale === "en" ? found.name_en || found.name_ar : found.name_ar;
  };

  const buildWaUrl = (productName: string, slug: string) =>
    buildWhatsAppUrl(
      whatsappNumber,
      buildProductWhatsAppMessage({ locale, productName, slug }),
      true,
    ) ?? "#";

  return (
    <div>
      {/* Interactive Filter Tabs */}
      <div className="mb-8 flex flex-wrap justify-center gap-2">
        <button
          type="button"
          onClick={() => setSelectedCat("all")}
          className={`rounded-xl px-4 py-2 text-xs font-bold transition-all sm:text-sm ${
            selectedCat === "all"
              ? "bg-navy text-white shadow-card"
              : "border border-line bg-surface text-navy hover:bg-navy-soft/60"
          }`}
        >
          {locale === "en" ? "All Featured" : "كل المختارات"}
        </button>
        {categories.map((cat) => {
          const label =
            locale === "en" ? cat.name_en || cat.name_ar : cat.name_ar;
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => setSelectedCat(cat.slug)}
              className={`rounded-xl px-4 py-2 text-xs font-bold transition-all sm:text-sm ${
                selectedCat === cat.slug
                  ? "bg-blue text-white shadow-card"
                  : "border border-line bg-surface text-navy hover:bg-navy-soft/60"
              }`}
            >
              {label}
            </button>
          );
        })}
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-4">
        {filtered.map((product) => {
          const name =
            locale === "en"
              ? product.name_en || product.name_ar
              : product.name_ar;
          const catName = catNameBySlug(product.category_slug);

          return (
            <article
              key={product.slug}
              className="group flex h-full flex-col overflow-hidden rounded-xl border border-line bg-surface shadow-card transition-shadow hover:shadow-raised"
            >
              <div className="relative aspect-square overflow-hidden bg-secondary">
                <Image
                  src={resolveImg(product.media)}
                  alt={name}
                  fill
                          sizes="(min-width: 1024px) 25vw, 50vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <button
                  type="button"
                  onClick={() => setQuickProduct(product)}
                  className="absolute bottom-2.5 end-2.5 inline-flex items-center gap-1 rounded-lg bg-white/90 px-2.5 py-1 text-[11px] font-bold text-navy shadow-xs backdrop-blur-xs transition-colors hover:bg-navy hover:text-white"
                >
                  <Eye className="size-3.5" />
                  <span>{locale === "en" ? "Quick View" : "نظرة سريعة"}</span>
                </button>
              </div>

              <div className="flex flex-1 flex-col gap-1 p-4">
                <span className="text-[11px] font-bold text-blue">
                  {catName}
                </span>
                <h3 className="line-clamp-2 text-[15px] font-bold leading-snug text-navy">
                  <Link
                    href={`/products/${product.slug}`}
                    className="hover:text-blue"
                  >
                    {name}
                  </Link>
                </h3>
                {product.display_price != null && (
                  <p className="mt-1 text-sm font-extrabold text-navy">
                    {formatPrice(product.display_price, currencyLabel)}
                  </p>
                )}

                <div className="mt-auto pt-3">
                  <ActionAnchor
                    href={buildWaUrl(name, product.slug)}
                    target="_blank"
                    rel="noopener noreferrer"
                    variant="whatsapp"
                    size="md"
                    className="w-full px-3 text-[12.5px] whitespace-nowrap"
                  >
                    <WhatsAppIcon className="size-4" />
                    <span>
                      {locale === "en" ? "Ask on WhatsApp" : "تواصل للاستفسار"}
                    </span>
                  </ActionAnchor>
                </div>
              </div>
            </article>
          );
        })}
      </div>

      {/* Quick View Modal */}
      {quickProduct && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs"
          onClick={() => setQuickProduct(null)}
        >
          <div
            className="w-full max-w-2xl overflow-hidden rounded-2xl border border-line bg-surface shadow-raised"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between bg-navy px-6 py-4 text-white">
              <h3 className="text-base font-extrabold">
                {locale === "en"
                  ? quickProduct.name_en || quickProduct.name_ar
                  : quickProduct.name_ar}
              </h3>
              <button
                type="button"
                onClick={() => setQuickProduct(null)}
                className="rounded-lg bg-white/10 p-1.5 text-white hover:bg-white/20"
              >
                <X className="size-4" />
              </button>
            </div>

            <div className="grid gap-6 p-6 sm:grid-cols-2">
              <div className="relative aspect-square overflow-hidden rounded-xl border border-line bg-page">
                <Image
                  src={resolveImg(quickProduct.media)}
                  alt={quickProduct.name_ar}
                  fill
                          sizes="400px"
                  className="object-cover"
                />
              </div>

              <div className="flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <span className="inline-block rounded-md bg-navy-soft px-2.5 py-1 text-xs font-bold text-navy">
                    {catNameBySlug(quickProduct.category_slug)}
                  </span>
                  <p className="text-sm leading-relaxed text-ink/85">
                    {locale === "en"
                      ? quickProduct.description_en ||
                        quickProduct.description_ar
                      : quickProduct.description_ar}
                  </p>
                </div>

                <div className="space-y-2 border-t border-line pt-4">
                  <ActionAnchor
                    href={buildWaUrl(quickProduct.name_ar, quickProduct.slug)}
                    target="_blank"
                    rel="noopener noreferrer"
                    variant="whatsapp"
                    size="md"
                    className="w-full"
                  >
                    <WhatsAppIcon className="size-4" />
                    <span>اسأل عن المنتج عبر واتساب</span>
                  </ActionAnchor>
                  <ActionLink
                    href={`/products/${quickProduct.slug}`}
                    variant="outline"
                    size="md"
                    className="w-full"
                  >
                    <span>صفحة المنتج الكاملة</span>
                  </ActionLink>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export function SchoolStageExplorer({ locale }: { locale: string }) {
  const [activeStage, setActiveStage] = useState(STAGE_GUIDES[0]);

  return (
    <div className="rounded-2xl border border-line bg-navy p-6 text-white shadow-raised sm:p-10">
      <div className="grid items-center gap-8 lg:grid-cols-12">
        <div className="space-y-4 lg:col-span-5">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-gold/20 px-3 py-1 text-xs font-bold text-gold">
            <Sparkles className="size-3.5" />
            <span>دليل تجهيز المستلزمات</span>
          </span>
          <h2 className="text-2xl font-extrabold sm:text-3xl">
            اختر المرحلة الدراسية أو المكتبية لتصفح احتياجاتك بسرعة
          </h2>
          <p className="text-sm leading-relaxed text-white/75">
            رتبنا تشكيلة «مكتبة أسماء النموذجية» حسب كل مرحلة دراسية ومكتبية
            لتجد جميع أدواتك في مكان واحد:
          </p>

          <div className="space-y-2 pt-1">
            {STAGE_GUIDES.map((st) => {
              const Icon = st.icon;
              const isSelected = activeStage.key === st.key;
              return (
                <button
                  key={st.key}
                  type="button"
                  onClick={() => setActiveStage(st)}
                  className={`flex w-full items-center justify-between rounded-xl border p-3.5 text-start transition-all ${
                    isSelected
                      ? "border-gold bg-white text-navy shadow-md"
                      : "border-white/15 bg-white/5 text-white hover:bg-white/10"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon
                      className={`size-5 ${
                        isSelected ? "text-blue" : "text-gold"
                      }`}
                    />
                    <span className="text-sm font-extrabold">
                      {locale === "en" ? st.titleEn : st.titleAr}
                    </span>
                  </div>
                  <ArrowUpLeft
                    className={`size-4 ${
                      isSelected ? "text-blue" : "text-white/50"
                    }`}
                  />
                </button>
              );
            })}
          </div>
        </div>

        <div className="lg:col-span-7">
          <div className="rounded-2xl border border-white/15 bg-surface p-6 text-ink shadow-card sm:p-8">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line pb-4">
              <div>
                <span className="text-xs font-bold text-blue">
                  {activeStage.badgeAr}
                </span>
                <h3 className="mt-1 text-xl font-extrabold text-navy sm:text-2xl">
                  {locale === "en" ? activeStage.titleEn : activeStage.titleAr}
                </h3>
              </div>
              <span className="rounded-lg bg-navy px-3 py-1 text-xs font-bold text-gold">
                مكتبة أسماء النموذجية
              </span>
            </div>

            <p className="mt-4 text-sm leading-relaxed text-muted-text sm:text-base">
              {activeStage.descriptionAr}
            </p>

            <ul className="mt-5 space-y-2.5">
              {activeStage.checklistAr.map((item, i) => (
                <li
                  key={i}
                  className="flex items-center gap-2.5 rounded-xl bg-page p-3 text-xs font-bold text-navy sm:text-sm"
                >
                  <CheckCircle2 className="size-4 shrink-0 text-blue" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>

            <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-5">
              <span className="text-xs text-muted-text">
                متوفرة بتشكيلة متنوعة في المكتبة
              </span>
              <ActionLink href={activeStage.filterHref} variant="navy" size="md">
                <span>استعراض منتجات هذه المرحلة</span>
                <ArrowUpLeft className="size-4" />
              </ActionLink>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
