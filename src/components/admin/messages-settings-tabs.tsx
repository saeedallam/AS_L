"use client";

import React, { useState } from "react";
import { Loader2, Mail, Phone, Trash2 } from "lucide-react";
import type { ContactMessageRecord, WebsiteSettingsRecord } from "@/lib/data/records";
import { buildWhatsAppUrl } from "@/lib/whatsapp";
import { adminAction } from "./admin-api";
import { Checkbox, EmptyState, Field, ImageInput, inputClass, type ConfirmRequest } from "./ui";

type Toast = { success: (t: string) => void; error: (t: string) => void };
type Shared = { refresh: () => Promise<void>; toast: Toast; confirm: (r: ConfirmRequest) => void };

// ===========================================================================
// Messages
// ===========================================================================
export function MessagesTab({ messages, ...shared }: Shared & { messages: ContactMessageRecord[] }) {
  const [filter, setFilter] = useState<"all" | "unread">("all");
  const [busyId, setBusyId] = useState<string | null>(null);
  const shown = filter === "unread" ? messages.filter((m) => !m.is_read) : messages;

  const mark = async (m: ContactMessageRecord) => {
    setBusyId(m.id);
    const res = await adminAction("message.mark", { id: m.id, is_read: !m.is_read });
    setBusyId(null);
    if (!res.ok) return shared.toast.error(res.error);
    await shared.refresh();
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl font-extrabold text-navy">رسائل واستفسارات الزوار</h2>
        <div className="flex gap-1 rounded-lg border border-line bg-surface p-1 text-xs font-bold">
          {(["all", "unread"] as const).map((key) => (
            <button
              key={key}
              type="button"
              onClick={() => setFilter(key)}
              className={`rounded-md px-3 py-1.5 ${filter === key ? "bg-navy text-white" : "text-navy"}`}
            >
              {key === "all" ? `الكل (${messages.length})` : `غير المقروءة (${messages.filter((m) => !m.is_read).length})`}
            </button>
          ))}
        </div>
      </div>

      {shown.length === 0 ? (
        <EmptyState text={filter === "unread" ? "لا توجد رسائل غير مقروءة." : "لا توجد رسائل واردة حتى الآن."} />
      ) : (
        <div className="space-y-3">
          {shown.map((m) => {
            const wa = buildWhatsAppUrl(m.phone);
            return (
              <article key={m.id} className={`rounded-xl border bg-surface p-5 shadow-card ${m.is_read ? "border-line" : "border-gold"}`}>
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line pb-3">
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-navy">{m.name}</span>
                    <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold ${m.is_read ? "bg-slate-100 text-slate-600" : "bg-gold text-navy"}`}>
                      {m.is_read ? "مقروءة" : "جديدة"}
                    </span>
                  </div>
                  <time dateTime={m.created_at} className="font-mono text-xs text-muted-text">
                    {new Date(m.created_at).toLocaleString("ar-EG", { dateStyle: "medium", timeStyle: "short" })}
                  </time>
                </div>
                {/* Rendered as text (React escapes it): visitor input is never injected as HTML. */}
                <p className="mt-3 whitespace-pre-line rounded-lg bg-page p-3.5 text-sm leading-relaxed text-ink">{m.message}</p>
                <div className="mt-3 flex flex-wrap items-center justify-between gap-3 pt-1 text-xs">
                  <div className="flex flex-wrap items-center gap-4 text-muted-text">
                    <a href={`tel:${m.phone.replace(/[^\d+]/g, "")}`} className="inline-flex items-center gap-1 font-mono hover:text-navy" dir="ltr">
                      <Phone className="size-3.5 text-blue" />
                      {m.phone}
                    </a>
                    {wa && (
                      <a href={wa} target="_blank" rel="noopener noreferrer" className="font-bold text-emerald-700 hover:underline">
                        واتساب
                      </a>
                    )}
                    {m.email && (
                      <a href={`mailto:${m.email}`} className="inline-flex items-center gap-1 font-mono hover:text-navy" dir="ltr">
                        <Mail className="size-3.5 text-blue" />
                        {m.email}
                      </a>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      disabled={busyId === m.id}
                      onClick={() => mark(m)}
                      className="rounded-lg border border-line bg-page px-3 py-1.5 font-bold text-navy hover:bg-navy hover:text-white disabled:opacity-60"
                    >
                      {m.is_read ? "تحديد كغير مقروءة" : "تحديد كمقروءة"}
                    </button>
                    <button
                      type="button"
                      aria-label={`حذف رسالة ${m.name}`}
                      onClick={() =>
                        shared.confirm({
                          title: "حذف الرسالة",
                          body: `هل تريد حذف رسالة «${m.name}» نهائياً؟`,
                          onConfirm: async () => {
                            const res = await adminAction("message.delete", { id: m.id });
                            if (!res.ok) return shared.toast.error(res.error);
                            shared.toast.success("تم حذف الرسالة");
                            await shared.refresh();
                          },
                        })
                      }
                      className="rounded-lg bg-red-50 p-1.5 text-red-600 hover:bg-red-600 hover:text-white"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ===========================================================================
// Settings
// ===========================================================================
type TextKey = Exclude<keyof WebsiteSettingsRecord, "allow_indexing">;

export function SettingsTab({ settings, ...shared }: Shared & { settings: WebsiteSettingsRecord }) {
  const [form, setForm] = useState<WebsiteSettingsRecord>(settings);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  const input = (key: TextKey, label: string, opts: { ltr?: boolean; type?: string; placeholder?: string; hint?: string; textarea?: boolean } = {}) => (
    <Field label={label} error={errors[key]} hint={opts.hint}>
      {opts.textarea ? (
        <textarea rows={2} value={form[key]} onChange={(e) => setForm({ ...form, [key]: e.target.value })} className={inputClass} />
      ) : (
        <input
          type={opts.type ?? "text"}
          dir={opts.ltr ? "ltr" : undefined}
          value={form[key]}
          placeholder={opts.placeholder}
          onChange={(e) => setForm({ ...form, [key]: e.target.value })}
          className={`${inputClass} ${opts.ltr ? "text-end" : ""}`}
        />
      )}
    </Field>
  );

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setErrors({});
    const res = await adminAction<WebsiteSettingsRecord>("settings.update", form);
    setSaving(false);
    if (!res.ok) {
      setErrors(res.fieldErrors ?? {});
      return shared.toast.error(res.error);
    }
    setForm(res.item);
    shared.toast.success("تم حفظ إعدادات الموقع بنجاح");
    await shared.refresh();
  };

  const section = "space-y-4 rounded-xl border border-line bg-surface p-6 shadow-card sm:p-8";

  return (
    <form onSubmit={submit} noValidate className="mx-auto max-w-3xl space-y-5">
      <section className={section}>
        <h2 className="text-xl font-extrabold text-navy">رقم الواتساب وبيانات المكتبة</h2>
        <div className="rounded-xl border border-emerald-200 bg-emerald-50/60 p-4">
          <Field label="رقم واتساب المكتبة (مع كود الدولة بدون + أو أصفار، مثال: 2010XXXXXXXX)" error={errors.whatsapp_number}>
            <input type="tel" dir="ltr" value={form.whatsapp_number} onChange={(e) => setForm({ ...form, whatsapp_number: e.target.value })} placeholder="2010XXXXXXXX" className="w-full rounded-lg border border-emerald-300 bg-white px-4 py-2.5 text-end font-mono text-sm text-navy" />
          </Field>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {input("store_name_ar", "اسم المكتبة (عربي) *")}
          {input("store_name_en", "اسم المكتبة (إنجليزي)", { ltr: true })}
          {input("phone", "رقم الهاتف للاتصال", { ltr: true, type: "tel" })}
          {input("email", "البريد الإلكتروني", { ltr: true, type: "email" })}
          {input("address_ar", "العنوان (عربي)")}
          {input("address_en", "العنوان (إنجليزي)", { ltr: true })}
          {input("working_hours_ar", "مواعيد العمل (عربي)", { placeholder: "يومياً من 9 صباحاً حتى 10 مساءً" })}
          {input("working_hours_en", "مواعيد العمل (إنجليزي)", { ltr: true })}
          {input("currency_label", "رمز العملة لعرض الأسعار", { placeholder: "مثال: ج.م", hint: "يظهر بجانب الأسعار الاختيارية" })}
          {input("map_url", "رابط تضمين خريطة جوجل", { ltr: true, type: "url", placeholder: "https://www.google.com/maps/embed?..." })}
        </div>
        <ImageInput label="شعار المكتبة" value={form.logo_url} bucket="gallery-images" purpose="settings" error={errors.logo_url} onError={shared.toast.error} onChange={(url) => setForm({ ...form, logo_url: url })} />
      </section>

      <section className={section}>
        <h2 className="text-lg font-extrabold text-navy">روابط التواصل الاجتماعي</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {input("facebook_url", "فيسبوك", { ltr: true, type: "url", placeholder: "https://facebook.com/..." })}
          {input("instagram_url", "إنستجرام", { ltr: true, type: "url", placeholder: "https://instagram.com/..." })}
          {input("tiktok_url", "تيك توك", { ltr: true, type: "url", placeholder: "https://tiktok.com/@..." })}
          {input("x_url", "X (تويتر)", { ltr: true, type: "url", placeholder: "https://x.com/..." })}
          {input("youtube_url", "يوتيوب", { ltr: true, type: "url", placeholder: "https://youtube.com/..." })}
        </div>
      </section>

      <section className={section}>
        <h2 className="text-lg font-extrabold text-navy">وصف الموقع والإعلانات</h2>
        {input("site_description_ar", "وصف الموقع (عربي)", { textarea: true })}
        {input("site_description_en", "وصف الموقع (إنجليزي)", { textarea: true })}
        <div className="grid gap-4 sm:grid-cols-2">
          {input("announcement_ar", "شريط الإعلان (عربي)", { hint: "اتركه فارغاً لإخفاء الشريط" })}
          {input("announcement_en", "شريط الإعلان (إنجليزي)", { ltr: true })}
        </div>
      </section>

      <section className={section}>
        <h2 className="text-lg font-extrabold text-navy">تحسين محركات البحث (SEO)</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {input("seo_title_ar", "عنوان الموقع (عربي)")}
          {input("seo_title_en", "عنوان الموقع (إنجليزي)", { ltr: true })}
          {input("seo_description_ar", "وصف محركات البحث (عربي)", { textarea: true })}
          {input("seo_description_en", "وصف محركات البحث (إنجليزي)", { textarea: true })}
        </div>
        {input("seo_keywords", "الكلمات المفتاحية (مفصولة بفواصل)")}
        <ImageInput label="صورة المشاركة (Open Graph) — يفضل 1200×630" value={form.og_image_url} bucket="gallery-images" purpose="settings" error={errors.og_image_url} onError={shared.toast.error} onChange={(url) => setForm({ ...form, og_image_url: url })} />
        <Checkbox checked={form.allow_indexing} onChange={(v) => setForm({ ...form, allow_indexing: v })} label="السماح لمحركات البحث بأرشفة الموقع" />
      </section>

      <button type="submit" disabled={saving} className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-lg bg-navy px-6 text-sm font-bold text-white hover:bg-navy-deep disabled:opacity-60">
        {saving && <Loader2 className="size-4 animate-spin" />}
        <span>حفظ الإعدادات</span>
      </button>
    </form>
  );
}
