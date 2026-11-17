"use client";

import React, { useEffect, useId, useRef, useState } from "react";
import { AlertCircle, AlertTriangle, CheckCircle2, ImageIcon, Loader2, Upload, X } from "lucide-react";
import { previewSrc } from "@/lib/media-placeholders";
import { ACCEPTED_IMAGES, discardUpload, uploadFile, type UploadBucket } from "./admin-api";

export const inputClass =
  "w-full rounded-lg border border-line bg-page px-3.5 py-2.5 text-sm text-ink focus:border-blue focus:outline-none aria-[invalid=true]:border-red-400";

// ---------------------------------------------------------------------------
// Toasts
// ---------------------------------------------------------------------------
export type Toast = { id: number; kind: "success" | "error"; text: string };

export function useToasts() {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const push = (kind: Toast["kind"], text: string) => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t, { id, kind, text }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), kind === "error" ? 6000 : 3500);
  };
  return {
    toasts,
    success: (text: string) => push("success", text),
    error: (text: string) => push("error", text),
    dismiss: (id: number) => setToasts((t) => t.filter((x) => x.id !== id)),
  };
}

export function ToastStack({ toasts, onDismiss }: { toasts: Toast[]; onDismiss: (id: number) => void }) {
  return (
    <div aria-live="polite" className="fixed inset-x-0 bottom-4 z-[60] flex flex-col items-center gap-2 px-4">
      {toasts.map((t) => (
        <div
          key={t.id}
          role={t.kind === "error" ? "alert" : "status"}
          className={`flex w-full max-w-md items-start gap-2 rounded-xl border p-4 text-sm font-bold shadow-raised ${
            t.kind === "success"
              ? "border-emerald-200 bg-emerald-50 text-emerald-800"
              : "border-red-200 bg-red-50 text-red-800"
          }`}
        >
          {t.kind === "success" ? (
            <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-emerald-600" />
          ) : (
            <AlertCircle className="mt-0.5 size-4 shrink-0 text-red-600" />
          )}
          <span className="flex-1">{t.text}</span>
          <button type="button" onClick={() => onDismiss(t.id)} aria-label="إغلاق" className="opacity-60 hover:opacity-100">
            <X className="size-4" />
          </button>
        </div>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Modal + confirmation dialog
// ---------------------------------------------------------------------------
export function Modal({
  title,
  onClose,
  children,
  wide = false,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  wide?: boolean;
}) {
  const titleId = useId();
  const panel = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    panel.current?.querySelector<HTMLElement>("input, select, textarea, button")?.focus();
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = overflow;
    };
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div
        ref={panel}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className={`max-h-[92vh] w-full overflow-y-auto rounded-2xl border border-line bg-surface p-6 shadow-raised ${wide ? "max-w-3xl" : "max-w-lg"}`}
      >
        <div className="mb-4 flex items-center justify-between border-b border-line pb-3">
          <h3 id={titleId} className="text-lg font-extrabold text-navy">
            {title}
          </h3>
          <button type="button" onClick={onClose} className="text-muted-text hover:text-navy" aria-label="إغلاق">
            <X className="size-5" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

export type ConfirmRequest = {
  title: string;
  body: string;
  confirmLabel?: string;
  onConfirm: () => Promise<void> | void;
};

export function ConfirmDialog({ request, onClose }: { request: ConfirmRequest | null; onClose: () => void }) {
  const [busy, setBusy] = useState(false);
  if (!request) return null;
  return (
    <Modal title={request.title} onClose={() => !busy && onClose()}>
      <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-900">
        <AlertTriangle className="mt-0.5 size-5 shrink-0 text-red-600" />
        <p className="leading-relaxed">{request.body}</p>
      </div>
      <div className="mt-5 flex justify-end gap-2 border-t border-line pt-4">
        <button type="button" disabled={busy} onClick={onClose} className="rounded-lg border border-line bg-page px-4 py-2 text-xs font-bold text-navy">
          إلغاء
        </button>
        <button
          type="button"
          disabled={busy}
          onClick={async () => {
            setBusy(true);
            try {
              await request.onConfirm();
            } finally {
              setBusy(false);
              onClose();
            }
          }}
          className="inline-flex items-center gap-1.5 rounded-lg bg-red-600 px-5 py-2 text-xs font-bold text-white hover:bg-red-700 disabled:opacity-60"
        >
          {busy && <Loader2 className="size-3.5 animate-spin" />}
          {request.confirmLabel ?? "حذف نهائي"}
        </button>
      </div>
    </Modal>
  );
}

// ---------------------------------------------------------------------------
// Form fields
// ---------------------------------------------------------------------------
export function Field({
  label,
  error,
  hint,
  children,
  className,
}: {
  label: string;
  error?: string;
  hint?: string;
  children: React.ReactElement<{ id?: string; "aria-invalid"?: boolean; "aria-describedby"?: string }>;
  className?: string;
}) {
  const id = useId();
  const msgId = `${id}-msg`;
  const child = React.cloneElement(children, {
    id,
    "aria-invalid": Boolean(error),
    "aria-describedby": error || hint ? msgId : undefined,
  });
  return (
    <div className={className}>
      <label htmlFor={id} className="mb-1 block text-xs font-bold text-navy">
        {label}
      </label>
      {child}
      {error ? (
        <p id={msgId} className="mt-1 text-xs font-bold text-red-600">
          {error}
        </p>
      ) : hint ? (
        <p id={msgId} className="mt-1 text-[11px] text-muted-text">
          {hint}
        </p>
      ) : null}
    </div>
  );
}

export function Checkbox({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <label className="inline-flex cursor-pointer items-center gap-2 text-xs font-bold text-navy">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="size-4 accent-navy" />
      <span>{label}</span>
    </label>
  );
}

export function EmptyState({ text, action }: { text: string; action?: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-dashed border-line bg-surface p-10 text-center text-sm text-muted-text">
      <p>{text}</p>
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  );
}

export function Thumb({ src, alt, className = "size-12" }: { src: string; alt: string; className?: string }) {
  const resolved = previewSrc(src);
  return resolved ? (
    // eslint-disable-next-line @next/next/no-img-element -- admin preview of arbitrary uploads
    <img src={resolved} alt={alt} loading="lazy" className={`${className} shrink-0 rounded-lg border border-line object-cover`} />
  ) : (
    <div className={`${className} grid shrink-0 place-items-center rounded-lg border border-dashed border-line bg-page text-muted-text`}>
      <ImageIcon className="size-4" />
    </div>
  );
}

/**
 * Image picker: preview + upload (replace) + clear. Uploading a new file over
 * an unsaved upload discards the previous file from storage.
 */
export function ImageInput({
  label,
  value,
  onChange,
  bucket,
  purpose = "catalog",
  onError,
  error,
  allowUrl = true,
}: {
  label: string;
  value: string;
  onChange: (url: string) => void;
  bucket: UploadBucket;
  purpose?: "catalog" | "settings";
  onError: (msg: string) => void;
  error?: string;
  allowUrl?: boolean;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const pendingUpload = useRef<string | null>(null);

  const pick = async (file: File) => {
    setBusy(true);
    const res = await uploadFile(file, bucket, purpose);
    setBusy(false);
    if (!res.ok) return onError(res.error);
    if (pendingUpload.current) discardUpload(pendingUpload.current);
    pendingUpload.current = res.url;
    onChange(res.url);
  };

  return (
    <div>
      <span className="mb-1 block text-xs font-bold text-navy">{label}</span>
      <div className="flex items-center gap-3">
        <Thumb src={value} alt={label} className="size-16" />
        <div className="flex flex-1 flex-col gap-2">
          {allowUrl && (
            <input
              type="text"
              dir="ltr"
              value={value}
              aria-label={`${label} (رابط)`}
              aria-invalid={Boolean(error)}
              onChange={(e) => onChange(e.target.value)}
              placeholder="https://…"
              className={`${inputClass} py-2 text-end text-xs`}
            />
          )}
          <div className="flex gap-2">
            <button
              type="button"
              disabled={busy}
              onClick={() => fileRef.current?.click()}
              className="inline-flex items-center gap-1.5 rounded-lg bg-navy px-3.5 py-2 text-xs font-bold text-white disabled:opacity-60"
            >
              {busy ? <Loader2 className="size-3.5 animate-spin" /> : <Upload className="size-3.5" />}
              <span>{busy ? "جاري الرفع…" : value ? "استبدال الصورة" : "رفع صورة"}</span>
            </button>
            {value && (
              <button type="button" onClick={() => onChange("")} className="rounded-lg border border-line bg-page px-3 py-2 text-xs font-bold text-navy">
                إزالة
              </button>
            )}
          </div>
        </div>
      </div>
      {error && <p className="mt-1 text-xs font-bold text-red-600">{error}</p>}
      <input
        ref={fileRef}
        type="file"
        accept={ACCEPTED_IMAGES}
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          e.target.value = "";
          if (file) void pick(file);
        }}
      />
    </div>
  );
}

export function SaveBar({ saving, onCancel, label }: { saving: boolean; onCancel: () => void; label: string }) {
  return (
    <div className="flex justify-end gap-2 border-t border-line pt-4">
      <button type="button" onClick={onCancel} className="rounded-lg border border-line bg-page px-4 py-2 text-xs font-bold text-navy">
        إلغاء
      </button>
      <button type="submit" disabled={saving} className="inline-flex items-center gap-1.5 rounded-lg bg-navy px-5 py-2 text-xs font-bold text-white disabled:opacity-60">
        {saving && <Loader2 className="size-3.5 animate-spin" />}
        {saving ? "جاري الحفظ…" : label}
      </button>
    </div>
  );
}
