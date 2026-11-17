"use client";

import React, { useState } from "react";
import { ArrowDown, ArrowUp, Edit3, ExternalLink, Plus, Trash2 } from "lucide-react";
import type { BrandRecord, CategoryRecord, GalleryRecord, ProductRecord } from "@/lib/data/records";
import { adminAction, discardUpload } from "./admin-api";
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

type Toast = { success: (t: string) => void; error: (t: string) => void };
type Shared = { refresh: () => Promise<void>; toast: Toast; confirm: (r: ConfirmRequest) => void };

function AddButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-navy px-5 text-sm font-bold text-white hover:bg-navy-deep">
      <Plus className="size-4" />
      <span>{label}</span>
    </button>
  );
}

function RowActions({ onEdit, onDelete, label }: { onEdit: () => void; onDelete: () => void; label: string }) {
  return (
    <div className="flex items-center gap-2">
      <button type="button" onClick={onEdit} aria-label={`تعديل ${label}`} className="rounded-lg border border-line bg-page p-2 text-navy hover:bg-navy hover:text-white">
        <Edit3 className="size-4" />
      </button>
      <button type="button" onClick={onDelete} aria-label={`حذف ${label}`} className="rounded-lg bg-red-50 p-2 text-red-600 hover:bg-red-600 hover:text-white">
        <Trash2 className="size-4" />
      </button>
    </div>
  );
}

function OrderButtons({ onUp, onDown, disabled }: { onUp: () => void; onDown: () => void; disabled: boolean }) {
  return (
    <div className="flex flex-col">
      <button type="button" disabled={disabled} onClick={onUp} aria-label="تحريك لأعلى" className="rounded p-0.5 text-navy hover:bg-page disabled:opacity-40"><ArrowUp className="size-4" /></button>
      <button type="button" disabled={disabled} onClick={onDown} aria-label="تحريك لأسفل" className="rounded p-0.5 text-navy hover:bg-page disabled:opacity-40"><ArrowDown className="size-4" /></button>
    </div>
  );
}

/** Generic save helper: create or update, surface field errors, toast, refresh. */
async function save(
  entity: "category" | "brand" | "gallery",
  id: string | undefined,
  payload: unknown,
  setErrors: (e: Record<string, string>) => void,
  shared: Shared,
  messages: [string, string],
): Promise<boolean> {
  const res = id ? await adminAction(`${entity}.update`, payload, id) : await adminAction(`${entity}.create`, payload);
  if (!res.ok) {
    setErrors(res.fieldErrors ?? {});
    shared.toast.error(res.error);
    return false;
  }
  shared.toast.success(id ? messages[1] : messages[0]);
  await shared.refresh();
  return true;
}

function useUploadTracker(initial: string) {
  const uploaded = React.useRef(new Set<string>());
  return {
    track: (url: string) => url && uploaded.current.add(url),
    discardUnsaved: () => uploaded.current.forEach((u) => u !== initial && discardUpload(u)),
    clear: () => uploaded.current.clear(),
  };
}

// ===========================================================================
// Categories
// ===========================================================================
export function CategoriesTab({ categories, products, ...shared }: Shared & { categories: CategoryRecord[]; products: ProductRecord[] }) {
  const [editing, setEditing] = useState<CategoryRecord | null | undefined>(undefined);
  const [reordering, setReordering] = useState(false);

  const move = async (index: number, delta: number) => {
    const target = index + delta;
    if (target < 0 || target >= categories.length) return;
    const ids = categories.map((c) => c.id);
    [ids[index], ids[target]] = [ids[target], ids[index]];
    setReordering(true);
    const res = await adminAction("category.reorder", { ids });
    setReordering(false);
    if (!res.ok) return shared.toast.error(res.error);
    await shared.refresh();
  };

  const remove = (c: CategoryRecord) => {
    const count = products.filter((p) => p.category_id === c.id).length;
    shared.confirm({
      title: "حذف القسم",
      body: count
        ? `القسم «${c.name_ar}» يحتوي على ${count} منتج. سيتم حذف القسم وتبقى المنتجات بدون قسم.`
        : `هل تريد حذف القسم «${c.name_ar}» نهائياً؟`,
      onConfirm: async () => {
        const res = await adminAction("category.delete", { id: c.id });
        if (!res.ok) return shared.toast.error(res.error);
        shared.toast.success("تم حذف القسم");
        await shared.refresh();
      },
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-extrabold text-navy">أقسام المكتبة</h2>
        <AddButton label="إضافة قسم جديد" onClick={() => setEditing(null)} />
      </div>
      {categories.length === 0 ? (
        <EmptyState text="لا توجد أقسام بعد." />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((c, index) => (
            <div key={c.id} className="flex items-center justify-between gap-3 rounded-xl border border-line bg-surface p-4 shadow-card">
              <div className="flex items-center gap-3">
                <OrderButtons disabled={reordering} onUp={() => move(index, -1)} onDown={() => move(index, 1)} />
                <Thumb src={c.image_path} alt={c.name_ar} />
                <div>
                  <p className="text-base font-extrabold text-navy">{c.name_ar}</p>
                  <p className="mt-1 text-xs text-muted-text">
                    الترتيب: #{index + 1} • {c.is_visible ? "نشط" : "مخفي"} • {products.filter((p) => p.category_id === c.id).length} منتج
                  </p>
                </div>
              </div>
              <RowActions label={c.name_ar} onEdit={() => setEditing(c)} onDelete={() => remove(c)} />
            </div>
          ))}
        </div>
      )}
      {editing !== undefined && (
        <CategoryModal category={editing} nextOrder={categories.length + 1} shared={shared} onClose={() => setEditing(undefined)} />
      )}
    </div>
  );
}

function CategoryModal({ category, nextOrder, shared, onClose }: { category: CategoryRecord | null; nextOrder: number; shared: Shared; onClose: () => void }) {
  const [form, setForm] = useState({
    name_ar: category?.name_ar ?? "",
    name_en: category?.name_en ?? "",
    slug: category?.slug ?? "",
    description_ar: category?.description_ar ?? "",
    description_en: category?.description_en ?? "",
    image_path: category?.image_path ?? "",
    sort_order: category?.sort_order ?? nextOrder,
    is_visible: category?.is_visible ?? true,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const uploads = useUploadTracker(category?.image_path ?? "");
  const close = () => {
    uploads.discardUnsaved();
    onClose();
  };

  return (
    <Modal title={category ? "تعديل القسم" : "إضافة قسم جديد"} onClose={close}>
      <form
        noValidate
        className="space-y-4 text-sm"
        onSubmit={async (e) => {
          e.preventDefault();
          setSaving(true);
          const ok = await save("category", category?.id, form, setErrors, shared, ["تمت إضافة القسم بنجاح", "تم تعديل القسم بنجاح"]);
          setSaving(false);
          if (ok) {
            uploads.clear();
            onClose();
          }
        }}
      >
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="اسم القسم (عربي) *" error={errors.name_ar}>
            <input required value={form.name_ar} onChange={(e) => setForm({ ...form, name_ar: e.target.value })} className={inputClass} />
          </Field>
          <Field label="اسم القسم (إنجليزي)" error={errors.name_en}>
            <input dir="ltr" value={form.name_en} onChange={(e) => setForm({ ...form, name_en: e.target.value })} className={inputClass} />
          </Field>
        </div>
        <Field label="الرابط المختصر (Slug)" error={errors.slug} hint="يُنشأ تلقائياً إن تُرك فارغاً">
          <input dir="ltr" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value.toLowerCase() })} className={`${inputClass} text-end`} />
        </Field>
        <Field label="وصف القسم (عربي)" error={errors.description_ar}>
          <textarea rows={2} value={form.description_ar} onChange={(e) => setForm({ ...form, description_ar: e.target.value })} className={inputClass} />
        </Field>
        <Field label="وصف القسم (إنجليزي)" error={errors.description_en}>
          <textarea dir="ltr" rows={2} value={form.description_en} onChange={(e) => setForm({ ...form, description_en: e.target.value })} className={inputClass} />
        </Field>
        <ImageInput label="صورة القسم" value={form.image_path} bucket="category-images" error={errors.image_path} onError={shared.toast.error} onChange={(url) => {
          uploads.track(url);
          setForm({ ...form, image_path: url });
        }} />
        <Checkbox checked={form.is_visible} onChange={(v) => setForm({ ...form, is_visible: v })} label="قسم نشط (يظهر في الموقع)" />
        <SaveBar saving={saving} onCancel={close} label="حفظ القسم" />
      </form>
    </Modal>
  );
}

// ===========================================================================
// Brands
// ===========================================================================
export function BrandsTab({ brands, products, ...shared }: Shared & { brands: BrandRecord[]; products: ProductRecord[] }) {
  const [editing, setEditing] = useState<BrandRecord | null | undefined>(undefined);

  const remove = (b: BrandRecord) => {
    const count = products.filter((p) => p.brand_id === b.id).length;
    shared.confirm({
      title: "حذف العلامة التجارية",
      body: count
        ? `العلامة «${b.name_ar}» مرتبطة بـ ${count} منتج. سيتم حذفها وتبقى المنتجات بدون علامة تجارية.`
        : `هل تريد حذف العلامة «${b.name_ar}» نهائياً؟`,
      onConfirm: async () => {
        const res = await adminAction("brand.delete", { id: b.id });
        if (!res.ok) return shared.toast.error(res.error);
        shared.toast.success("تم حذف العلامة التجارية");
        await shared.refresh();
      },
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-extrabold text-navy">العلامات التجارية</h2>
        <AddButton label="إضافة علامة تجارية" onClick={() => setEditing(null)} />
      </div>
      {brands.length === 0 ? (
        <EmptyState text="لا توجد علامات تجارية بعد." />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {brands.map((b) => (
            <div key={b.id} className="flex items-center justify-between gap-3 rounded-xl border border-line bg-surface p-4 shadow-card">
              <div className="flex items-center gap-3">
                <Thumb src={b.logo_path} alt={b.name_ar} />
                <div>
                  <p className="text-base font-extrabold text-navy">{b.name_ar}</p>
                  <p className="mt-1 flex items-center gap-1 text-xs text-muted-text">
                    {b.is_visible ? "نشطة" : "مخفية"} • {products.filter((p) => p.brand_id === b.id).length} منتج
                    {b.website_url && (
                      <a href={b.website_url} target="_blank" rel="noopener noreferrer" aria-label="الموقع الرسمي" className="text-blue">
                        <ExternalLink className="size-3" />
                      </a>
                    )}
                  </p>
                </div>
              </div>
              <RowActions label={b.name_ar} onEdit={() => setEditing(b)} onDelete={() => remove(b)} />
            </div>
          ))}
        </div>
      )}
      {editing !== undefined && <BrandModal brand={editing} shared={shared} onClose={() => setEditing(undefined)} />}
    </div>
  );
}

function BrandModal({ brand, shared, onClose }: { brand: BrandRecord | null; shared: Shared; onClose: () => void }) {
  const [form, setForm] = useState({
    name_ar: brand?.name_ar ?? "",
    name_en: brand?.name_en ?? "",
    slug: brand?.slug ?? "",
    description_ar: brand?.description_ar ?? "",
    website_url: brand?.website_url ?? "",
    logo_path: brand?.logo_path ?? "",
    is_visible: brand?.is_visible ?? true,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const uploads = useUploadTracker(brand?.logo_path ?? "");
  const close = () => {
    uploads.discardUnsaved();
    onClose();
  };

  return (
    <Modal title={brand ? "تعديل العلامة التجارية" : "إضافة علامة تجارية"} onClose={close}>
      <form
        noValidate
        className="space-y-4 text-sm"
        onSubmit={async (e) => {
          e.preventDefault();
          setSaving(true);
          const ok = await save("brand", brand?.id, form, setErrors, shared, ["تمت إضافة العلامة التجارية", "تم تعديل العلامة التجارية"]);
          setSaving(false);
          if (ok) {
            uploads.clear();
            onClose();
          }
        }}
      >
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="الاسم *" error={errors.name_ar}>
            <input required value={form.name_ar} onChange={(e) => setForm({ ...form, name_ar: e.target.value })} className={inputClass} />
          </Field>
          <Field label="الاسم (إنجليزي)" error={errors.name_en}>
            <input dir="ltr" value={form.name_en} onChange={(e) => setForm({ ...form, name_en: e.target.value })} className={inputClass} />
          </Field>
        </div>
        <Field label="الرابط المختصر (Slug)" error={errors.slug} hint="يُنشأ تلقائياً إن تُرك فارغاً">
          <input dir="ltr" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value.toLowerCase() })} className={`${inputClass} text-end`} />
        </Field>
        <Field label="نبذة" error={errors.description_ar}>
          <textarea rows={2} value={form.description_ar} onChange={(e) => setForm({ ...form, description_ar: e.target.value })} className={inputClass} />
        </Field>
        <Field label="الموقع الرسمي (اختياري)" error={errors.website_url}>
          <input type="url" dir="ltr" value={form.website_url} onChange={(e) => setForm({ ...form, website_url: e.target.value })} placeholder="https://" className={`${inputClass} text-end`} />
        </Field>
        <ImageInput label="شعار العلامة" value={form.logo_path} bucket="brand-logos" error={errors.logo_path} onError={shared.toast.error} onChange={(url) => {
          uploads.track(url);
          setForm({ ...form, logo_path: url });
        }} />
        <Checkbox checked={form.is_visible} onChange={(v) => setForm({ ...form, is_visible: v })} label="علامة نشطة (تظهر في الموقع)" />
        <SaveBar saving={saving} onCancel={close} label="حفظ العلامة" />
      </form>
    </Modal>
  );
}

// ===========================================================================
// Gallery
// ===========================================================================
export function GalleryTab({ gallery, ...shared }: Shared & { gallery: GalleryRecord[] }) {
  const [editing, setEditing] = useState<GalleryRecord | null | undefined>(undefined);
  const [reordering, setReordering] = useState(false);

  const move = async (index: number, delta: number) => {
    const target = index + delta;
    if (target < 0 || target >= gallery.length) return;
    const ids = gallery.map((g) => g.id);
    [ids[index], ids[target]] = [ids[target], ids[index]];
    setReordering(true);
    const res = await adminAction("gallery.reorder", { ids });
    setReordering(false);
    if (!res.ok) return shared.toast.error(res.error);
    await shared.refresh();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-extrabold text-navy">معرض الصور</h2>
        <AddButton label="إضافة صورة" onClick={() => setEditing(null)} />
      </div>
      {gallery.length === 0 ? (
        <EmptyState text="المعرض فارغ. أضف صوراً من المكتبة لعرضها في الصفحة الرئيسية." />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {gallery.map((g, index) => (
            <div key={g.id} className="overflow-hidden rounded-xl border border-line bg-surface shadow-card">
              <Thumb src={g.storage_path} alt={g.caption_ar} className="h-40 w-full rounded-none border-0" />
              <div className="flex items-center justify-between gap-2 p-3">
                <div className="flex items-center gap-2">
                  <OrderButtons disabled={reordering} onUp={() => move(index, -1)} onDown={() => move(index, 1)} />
                  <div>
                    <p className="text-sm font-extrabold text-navy">{g.caption_ar}</p>
                    <p className="text-xs text-muted-text">#{index + 1} • {g.is_visible ? "ظاهرة" : "مخفية"}</p>
                  </div>
                </div>
                <RowActions
                  label={g.caption_ar}
                  onEdit={() => setEditing(g)}
                  onDelete={() =>
                    shared.confirm({
                      title: "حذف الصورة",
                      body: `سيتم حذف الصورة «${g.caption_ar}» من المعرض ومن التخزين نهائياً.`,
                      onConfirm: async () => {
                        const res = await adminAction("gallery.delete", { id: g.id });
                        if (!res.ok) return shared.toast.error(res.error);
                        shared.toast.success("تم حذف الصورة");
                        await shared.refresh();
                      },
                    })
                  }
                />
              </div>
            </div>
          ))}
        </div>
      )}
      {editing !== undefined && <GalleryModal item={editing} nextOrder={gallery.length + 1} shared={shared} onClose={() => setEditing(undefined)} />}
    </div>
  );
}

function GalleryModal({ item, nextOrder, shared, onClose }: { item: GalleryRecord | null; nextOrder: number; shared: Shared; onClose: () => void }) {
  const [form, setForm] = useState({
    storage_path: item?.storage_path ?? "",
    caption_ar: item?.caption_ar ?? "",
    caption_en: item?.caption_en ?? "",
    description: item?.description ?? "",
    sort_order: item?.sort_order ?? nextOrder,
    is_visible: item?.is_visible ?? true,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const uploads = useUploadTracker(item?.storage_path ?? "");
  const close = () => {
    uploads.discardUnsaved();
    onClose();
  };

  return (
    <Modal title={item ? "تعديل الصورة" : "إضافة صورة للمعرض"} onClose={close}>
      <form
        noValidate
        className="space-y-4 text-sm"
        onSubmit={async (e) => {
          e.preventDefault();
          setSaving(true);
          const ok = await save("gallery", item?.id, form, setErrors, shared, ["تمت إضافة الصورة للمعرض", "تم تعديل الصورة"]);
          setSaving(false);
          if (ok) {
            uploads.clear();
            onClose();
          }
        }}
      >
        <ImageInput label="الصورة *" value={form.storage_path} bucket="gallery-images" error={errors.storage_path} onError={shared.toast.error} onChange={(url) => {
          uploads.track(url);
          setForm({ ...form, storage_path: url });
        }} />
        <Field label="العنوان (عربي) *" error={errors.caption_ar}>
          <input required value={form.caption_ar} onChange={(e) => setForm({ ...form, caption_ar: e.target.value })} className={inputClass} />
        </Field>
        <Field label="العنوان (إنجليزي)" error={errors.caption_en}>
          <input dir="ltr" value={form.caption_en} onChange={(e) => setForm({ ...form, caption_en: e.target.value })} className={inputClass} />
        </Field>
        <Field label="وصف (اختياري)" error={errors.description}>
          <textarea rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className={inputClass} />
        </Field>
        <Checkbox checked={form.is_visible} onChange={(v) => setForm({ ...form, is_visible: v })} label="تظهر في الموقع" />
        <SaveBar saving={saving} onCancel={close} label="حفظ الصورة" />
      </form>
    </Modal>
  );
}
