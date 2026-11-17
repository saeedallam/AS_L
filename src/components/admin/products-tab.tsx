"use client";

import React, { useMemo, useState } from "react";
import { ArrowDown, ArrowUp, Edit3, Eye, EyeOff, Plus, Search, Star, Trash2 } from "lucide-react";
import type { BrandRecord, CategoryRecord, ProductRecord } from "@/lib/data/records";
import { formatPrice } from "@/lib/whatsapp";
import { adminAction, discardUpload, uploadFile, ACCEPTED_IMAGES } from "./admin-api";
import {
  Checkbox,
  EmptyState,
  Field,
  ImageInput,
  Modal,
  SaveBar,
  Thumb,
  inputClass,
  type ConfirmRequest,
} from "./ui";

type Ctx = {
  products: ProductRecord[];
  categories: CategoryRecord[];
  brands: BrandRecord[];
  currencyLabel: string;
  refresh: () => Promise<void>;
  toast: { success: (t: string) => void; error: (t: string) => void };
  confirm: (r: ConfirmRequest) => void;
};

type Spec = { label_ar: string; label_en: string; value_ar: string; value_en: string };
type Variant = { group_ar: string; group_en: string; value_ar: string; value_en: string };

type Form = {
  name_ar: string;
  name_en: string;
  slug: string;
  category_id: string;
  brand_id: string;
  age_stage: string;
  display_price: string;
  promotional_price: string;
  sku: string;
  short_description_ar: string;
  short_description_en: string;
  description_ar: string;
  description_en: string;
  media: string;
  images: { url: string; alt: string }[];
  specifications: Spec[];
  variants: Variant[];
  seo_title: string;
  seo_description: string;
  is_featured: boolean;
  is_published: boolean;
};

const AGE_LABELS: Record<string, string> = {
  primary: "المرحلة الابتدائية",
  preparatory: "المرحلة الإعدادية",
  secondary: "الثانوية والجامعة",
};

function toForm(p: ProductRecord | null, categories: CategoryRecord[]): Form {
  return {
    name_ar: p?.name_ar ?? "",
    name_en: p?.name_en ?? "",
    slug: p?.slug ?? "",
    category_id: p?.category_id ?? categories[0]?.id ?? "",
    brand_id: p?.brand_id ?? "",
    age_stage: p?.age_stage ?? "",
    display_price: p?.display_price != null ? String(p.display_price) : "",
    promotional_price: p?.promotional_price != null ? String(p.promotional_price) : "",
    sku: p?.sku ?? "",
    short_description_ar: p?.short_description_ar ?? "",
    short_description_en: p?.short_description_en ?? "",
    description_ar: p?.description_ar ?? "",
    description_en: p?.description_en ?? "",
    media: p?.media ?? "",
    images: p?.images.map((i) => ({ url: i.url, alt: i.alt })) ?? [],
    specifications: (p?.specifications ?? []).map((s) => ({
      label_ar: s.label_ar,
      label_en: s.label_en ?? "",
      value_ar: s.value_ar,
      value_en: s.value_en ?? "",
    })),
    variants: (p?.variants ?? []).map((v) => ({
      group_ar: v.group_ar,
      group_en: v.group_en ?? "",
      value_ar: v.value_ar,
      value_en: v.value_en ?? "",
    })),
    seo_title: p?.seo_title ?? "",
    seo_description: p?.seo_description ?? "",
    is_featured: p?.is_featured ?? false,
    is_published: p?.is_published ?? true,
  };
}

export function ProductsTab({ products, categories, brands, currencyLabel, refresh, toast, confirm }: Ctx) {
  const [editing, setEditing] = useState<ProductRecord | null>(null);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return products;
    return products.filter(
      (p) => p.name_ar.toLowerCase().includes(q) || p.name_en.toLowerCase().includes(q) || (p.sku ?? "").toLowerCase().includes(q),
    );
  }, [products, query]);

  const categoryName = (id: string | null) => categories.find((c) => c.id === id)?.name_ar ?? "بدون قسم";

  const toggle = async (p: ProductRecord, field: "is_published" | "is_featured") => {
    setBusyId(p.id);
    const value = field === "is_published" ? !p.is_published : !p.is_featured;
    const res = await adminAction("product.toggle", { id: p.id, field, value });
    setBusyId(null);
    if (!res.ok) return toast.error(res.error);
    toast.success(
      field === "is_published" ? (value ? "تم تفعيل المنتج" : "تم إخفاء المنتج") : value ? "تمت إضافة المنتج للمميزة" : "تمت إزالة المنتج من المميزة",
    );
    await refresh();
  };

  const remove = (p: ProductRecord) =>
    confirm({
      title: "حذف المنتج",
      body: `سيتم حذف «${p.name_ar}» وجميع صوره نهائياً. لا يمكن التراجع عن هذه العملية.`,
      onConfirm: async () => {
        const res = await adminAction("product.delete", { id: p.id });
        if (!res.ok) return toast.error(res.error);
        toast.success("تم حذف المنتج");
        await refresh();
      },
    });

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl font-extrabold text-navy">قائمة المنتجات</h2>
        <div className="flex flex-1 flex-wrap items-center justify-end gap-2">
          <label className="relative min-w-52 flex-1 sm:max-w-xs">
            <span className="sr-only">بحث في المنتجات</span>
            <Search className="pointer-events-none absolute end-3 top-1/2 size-4 -translate-y-1/2 text-muted-text" />
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="بحث بالاسم أو الرمز" className={`${inputClass} pe-9`} />
          </label>
          <button
            type="button"
            onClick={() => {
              if (!categories.length) toast.error("أضف قسماً واحداً على الأقل قبل إضافة المنتجات");
              setEditing(null);
              setOpen(true);
            }}
            className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-navy px-5 text-sm font-bold text-white hover:bg-navy-deep"
          >
            <Plus className="size-4" />
            <span>إضافة منتج جديد</span>
          </button>
        </div>
      </div>

      {visible.length === 0 ? (
        <EmptyState text={products.length ? "لا توجد منتجات مطابقة للبحث." : "لا توجد منتجات بعد. ابدأ بإضافة أول منتج."} />
      ) : (
        <div className="overflow-hidden rounded-xl border border-line bg-surface shadow-card">
          <div className="overflow-x-auto">
            <table className="w-full text-start text-sm">
              <thead className="border-b border-line bg-page text-xs font-bold text-navy">
                <tr>
                  <th className="p-4 text-start">اسم المنتج</th>
                  <th className="p-4 text-start">القسم</th>
                  <th className="p-4 text-start">السعر (اختياري)</th>
                  <th className="p-4 text-start">الحالة</th>
                  <th className="p-4 text-end">إجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {visible.map((p) => (
                  <tr key={p.id} className="hover:bg-page/50">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <Thumb src={p.media} alt={p.name_ar} className="size-11" />
                        <div>
                          <p className="font-bold text-navy">{p.name_ar}</p>
                          <p className="font-mono text-[11px] text-muted-text" dir="ltr">
                            {p.slug}
                            {p.images.length ? ` · +${p.images.length} صور` : ""}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-muted-text">{categoryName(p.category_id)}</td>
                    <td className="p-4 font-bold text-navy">
                      {p.display_price != null ? formatPrice(p.promotional_price ?? p.display_price, currencyLabel) : "تواصل للسعر"}
                    </td>
                    <td className="p-4">
                      <div className="flex flex-wrap items-center gap-2">
                        <button
                          type="button"
                          disabled={busyId === p.id}
                          onClick={() => toggle(p, "is_published")}
                          title={p.is_published ? "إخفاء من الموقع" : "إظهار في الموقع"}
                          className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-bold ${
                            p.is_published ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"
                          }`}
                        >
                          {p.is_published ? <Eye className="size-3" /> : <EyeOff className="size-3" />}
                          {p.is_published ? "نشط" : "مخفي"}
                        </button>
                        <button
                          type="button"
                          disabled={busyId === p.id}
                          onClick={() => toggle(p, "is_featured")}
                          title={p.is_featured ? "إزالة من المميزة" : "تمييز في الرئيسية"}
                          className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-bold ${
                            p.is_featured ? "bg-gold/20 text-navy" : "bg-slate-100 text-slate-500"
                          }`}
                        >
                          <Star className={`size-3 ${p.is_featured ? "fill-current" : ""}`} />
                          مميز
                        </button>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setEditing(p);
                            setOpen(true);
                          }}
                          className="rounded-lg border border-line bg-page p-2 text-navy hover:bg-navy hover:text-white"
                          aria-label={`تعديل ${p.name_ar}`}
                        >
                          <Edit3 className="size-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => remove(p)}
                          className="rounded-lg bg-red-50 p-2 text-red-600 hover:bg-red-600 hover:text-white"
                          aria-label={`حذف ${p.name_ar}`}
                        >
                          <Trash2 className="size-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {open && (
        <ProductModal
          product={editing}
          categories={categories}
          brands={brands}
          onClose={() => setOpen(false)}
          onSaved={async (msg) => {
            setOpen(false);
            toast.success(msg);
            await refresh();
          }}
          onError={toast.error}
        />
      )}
    </div>
  );
}

function ProductModal({
  product,
  categories,
  brands,
  onClose,
  onSaved,
  onError,
}: {
  product: ProductRecord | null;
  categories: CategoryRecord[];
  brands: BrandRecord[];
  onClose: () => void;
  onSaved: (msg: string) => Promise<void>;
  onError: (msg: string) => void;
}) {
  const initial = useMemo(() => toForm(product, categories), [product, categories]);
  const [form, setForm] = useState<Form>(initial);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const uploaded = React.useRef<Set<string>>(new Set());

  const set = <K extends keyof Form>(key: K, value: Form[K]) => setForm((f) => ({ ...f, [key]: value }));

  const close = () => {
    // Discard files uploaded in this session that were never saved.
    const kept = new Set([initial.media, ...initial.images.map((i) => i.url)]);
    uploaded.current.forEach((url) => !kept.has(url) && discardUpload(url));
    onClose();
  };

  const addImages = async (files: FileList) => {
    setUploading(true);
    for (const file of Array.from(files).slice(0, 12 - form.images.length)) {
      const res = await uploadFile(file, "product-images");
      if (!res.ok) {
        onError(`${file.name}: ${res.error}`);
        continue;
      }
      uploaded.current.add(res.url);
      setForm((f) => ({ ...f, images: [...f.images, { url: res.url, alt: "" }] }));
    }
    setUploading(false);
  };

  const moveImage = (index: number, delta: number) =>
    setForm((f) => {
      const images = [...f.images];
      const target = index + delta;
      if (target < 0 || target >= images.length) return f;
      [images[index], images[target]] = [images[target], images[index]];
      return { ...f, images };
    });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setErrors({});
    const payload = {
      ...form,
      specifications: form.specifications.filter((s) => s.label_ar.trim() && s.value_ar.trim()),
      variants: form.variants.filter((v) => v.group_ar.trim() && v.value_ar.trim()),
    };
    const res = product
      ? await adminAction("product.update", payload, product.id)
      : await adminAction("product.create", payload);
    setSaving(false);
    if (!res.ok) {
      setErrors(res.fieldErrors ?? {});
      return onError(res.error);
    }
    uploaded.current.clear();
    await onSaved(product ? "تم تعديل المنتج بنجاح" : "تمت إضافة المنتج بنجاح");
  };

  return (
    <Modal title={product ? "تعديل المنتج" : "إضافة منتج جديد"} onClose={close} wide>
      <form onSubmit={submit} className="space-y-4 text-sm" noValidate>
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="اسم المنتج (عربي) *" error={errors.name_ar}>
            <input required value={form.name_ar} onChange={(e) => set("name_ar", e.target.value)} className={inputClass} />
          </Field>
          <Field label="اسم المنتج (إنجليزي)" error={errors.name_en}>
            <input dir="ltr" value={form.name_en} onChange={(e) => set("name_en", e.target.value)} className={inputClass} />
          </Field>
          <Field label="الرابط المختصر (Slug)" error={errors.slug} hint="يُنشأ تلقائياً من الاسم الإنجليزي إن تُرك فارغاً">
            <input dir="ltr" value={form.slug} onChange={(e) => set("slug", e.target.value.toLowerCase())} placeholder="school-backpack" className={`${inputClass} text-end`} />
          </Field>
          <Field label="رمز المنتج SKU" error={errors.sku}>
            <input dir="ltr" value={form.sku} onChange={(e) => set("sku", e.target.value)} className={`${inputClass} text-end`} />
          </Field>
          <Field label="القسم" error={errors.category_id}>
            <select value={form.category_id} onChange={(e) => set("category_id", e.target.value)} className={`${inputClass} font-bold`}>
              <option value="">بدون قسم</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name_ar}
                  {c.is_visible ? "" : " (مخفي)"}
                </option>
              ))}
            </select>
          </Field>
          <Field label="العلامة التجارية" error={errors.brand_id}>
            <select value={form.brand_id} onChange={(e) => set("brand_id", e.target.value)} className={`${inputClass} font-bold`}>
              <option value="">بدون علامة</option>
              {brands.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name_ar}
                </option>
              ))}
            </select>
          </Field>
          <Field label="المرحلة الدراسية" error={errors.age_stage}>
            <select value={form.age_stage} onChange={(e) => set("age_stage", e.target.value)} className={inputClass}>
              <option value="">غير محددة</option>
              {Object.entries(AGE_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="السعر (اختياري)" error={errors.display_price}>
              <input type="number" inputMode="decimal" min="0" step="0.01" value={form.display_price} onChange={(e) => set("display_price", e.target.value)} placeholder="فارغ = تواصل للسعر" className={inputClass} />
            </Field>
            <Field label="سعر العرض" error={errors.promotional_price}>
              <input type="number" inputMode="decimal" min="0" step="0.01" value={form.promotional_price} onChange={(e) => set("promotional_price", e.target.value)} className={inputClass} />
            </Field>
          </div>
        </div>

        <ImageInput label="الصورة الرئيسية" value={form.media} bucket="product-images" error={errors.media} onError={onError} onChange={(url) => {
          if (url) uploaded.current.add(url);
          set("media", url);
        }} />

        <div>
          <div className="mb-1 flex items-center justify-between">
            <span className="text-xs font-bold text-navy">صور إضافية ({form.images.length}/12)</span>
            <label className={`inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-line bg-page px-3 py-1.5 text-xs font-bold text-navy ${uploading || form.images.length >= 12 ? "pointer-events-none opacity-50" : ""}`}>
              <Plus className="size-3.5" />
              {uploading ? "جاري الرفع…" : "إضافة صور"}
              <input type="file" multiple accept={ACCEPTED_IMAGES} className="hidden" onChange={(e) => {
                if (e.target.files?.length) void addImages(e.target.files);
                e.target.value = "";
              }} />
            </label>
          </div>
          {form.images.length === 0 ? (
            <p className="rounded-lg border border-dashed border-line p-3 text-center text-xs text-muted-text">لا توجد صور إضافية</p>
          ) : (
            <ul className="space-y-2">
              {form.images.map((img, index) => (
                <li key={img.url} className="flex items-center gap-2 rounded-lg border border-line bg-page p-2">
                  <Thumb src={img.url} alt={img.alt || form.name_ar} />
                  <input value={img.alt} onChange={(e) => setForm((f) => ({ ...f, images: f.images.map((x, i) => (i === index ? { ...x, alt: e.target.value } : x)) }))} placeholder="وصف الصورة (نص بديل)" aria-label="وصف الصورة" className={`${inputClass} py-1.5 text-xs`} />
                  <button type="button" onClick={() => moveImage(index, -1)} aria-label="تحريك لأعلى" className="rounded p-1 text-navy hover:bg-surface"><ArrowUp className="size-4" /></button>
                  <button type="button" onClick={() => moveImage(index, 1)} aria-label="تحريك لأسفل" className="rounded p-1 text-navy hover:bg-surface"><ArrowDown className="size-4" /></button>
                  <button type="button" onClick={() => setForm((f) => ({ ...f, images: f.images.filter((_, i) => i !== index) }))} aria-label="إزالة الصورة" className="rounded p-1 text-red-600 hover:bg-red-50"><Trash2 className="size-4" /></button>
                </li>
              ))}
            </ul>
          )}
          {errors.images && <p className="mt-1 text-xs font-bold text-red-600">{errors.images}</p>}
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="وصف مختصر (عربي)" error={errors.short_description_ar}>
            <textarea rows={2} value={form.short_description_ar} onChange={(e) => set("short_description_ar", e.target.value)} className={inputClass} />
          </Field>
          <Field label="وصف مختصر (إنجليزي)" error={errors.short_description_en}>
            <textarea dir="ltr" rows={2} value={form.short_description_en} onChange={(e) => set("short_description_en", e.target.value)} className={inputClass} />
          </Field>
          <Field label="الوصف الكامل (عربي)" error={errors.description_ar}>
            <textarea rows={4} value={form.description_ar} onChange={(e) => set("description_ar", e.target.value)} className={inputClass} />
          </Field>
          <Field label="الوصف الكامل (إنجليزي)" error={errors.description_en}>
            <textarea dir="ltr" rows={4} value={form.description_en} onChange={(e) => set("description_en", e.target.value)} className={inputClass} />
          </Field>
        </div>

        <PairsEditor
          title="المواصفات"
          rows={form.specifications}
          keys={["label_ar", "value_ar", "label_en", "value_en"]}
          placeholders={["الخاصية (مثال: المقاس)", "القيمة (مثال: A4)", "Label (EN)", "Value (EN)"]}
          onChange={(rows) => set("specifications", rows as Spec[])}
          empty={{ label_ar: "", label_en: "", value_ar: "", value_en: "" }}
        />
        <PairsEditor
          title="الخيارات المتاحة (ألوان، مقاسات…)"
          rows={form.variants}
          keys={["group_ar", "value_ar", "group_en", "value_en"]}
          placeholders={["المجموعة (مثال: اللون)", "القيمة (مثال: أزرق)", "Group (EN)", "Value (EN)"]}
          onChange={(rows) => set("variants", rows as Variant[])}
          empty={{ group_ar: "", group_en: "", value_ar: "", value_en: "" }}
        />

        <details className="rounded-lg border border-line p-3">
          <summary className="cursor-pointer text-xs font-bold text-navy">تحسين محركات البحث (SEO)</summary>
          <div className="mt-3 grid gap-3">
            <Field label="عنوان الصفحة" error={errors.seo_title} hint="حتى 120 حرفاً — يُستخدم اسم المنتج إن تُرك فارغاً">
              <input value={form.seo_title} onChange={(e) => set("seo_title", e.target.value)} className={inputClass} />
            </Field>
            <Field label="وصف الصفحة" error={errors.seo_description} hint="حتى 320 حرفاً">
              <textarea rows={2} value={form.seo_description} onChange={(e) => set("seo_description", e.target.value)} className={inputClass} />
            </Field>
          </div>
        </details>

        <div className="flex flex-wrap gap-6 pt-1">
          <Checkbox checked={form.is_published} onChange={(v) => set("is_published", v)} label="منتج نشط (يظهر في الموقع)" />
          <Checkbox checked={form.is_featured} onChange={(v) => set("is_featured", v)} label="منتج مميز بالرئيسية" />
        </div>

        <SaveBar saving={saving || uploading} onCancel={close} label="حفظ المنتج" />
      </form>
    </Modal>
  );
}

function PairsEditor<T extends Record<string, string>>({
  title,
  rows,
  keys,
  placeholders,
  onChange,
  empty,
}: {
  title: string;
  rows: T[];
  keys: (keyof T & string)[];
  placeholders: string[];
  onChange: (rows: T[]) => void;
  empty: T;
}) {
  return (
    <div>
      <div className="mb-1 flex items-center justify-between">
        <span className="text-xs font-bold text-navy">{title}</span>
        <button type="button" onClick={() => onChange([...rows, { ...empty }])} className="inline-flex items-center gap-1 rounded-lg border border-line bg-page px-3 py-1.5 text-xs font-bold text-navy">
          <Plus className="size-3.5" /> إضافة
        </button>
      </div>
      {rows.length === 0 ? (
        <p className="rounded-lg border border-dashed border-line p-3 text-center text-xs text-muted-text">لا يوجد</p>
      ) : (
        <ul className="space-y-2">
          {rows.map((row, index) => (
            <li key={index} className="grid grid-cols-[1fr_1fr_auto] gap-2 rounded-lg border border-line bg-page p-2 sm:grid-cols-[1fr_1fr_1fr_1fr_auto]">
              {keys.map((key, k) => (
                <input
                  key={key}
                  dir={key.endsWith("_en") ? "ltr" : undefined}
                  value={row[key]}
                  aria-label={placeholders[k]}
                  placeholder={placeholders[k]}
                  onChange={(e) => onChange(rows.map((r, i) => (i === index ? { ...r, [key]: e.target.value } : r)))}
                  className={`${inputClass} py-1.5 text-xs ${key.endsWith("_en") ? "hidden sm:block" : ""}`}
                />
              ))}
              <button type="button" onClick={() => onChange(rows.filter((_, i) => i !== index))} aria-label="حذف" className="rounded p-1 text-red-600 hover:bg-red-50">
                <Trash2 className="size-4" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
