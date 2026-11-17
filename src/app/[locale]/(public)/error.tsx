"use client";

import React from "react";
import { AlertCircle, RotateCcw } from "lucide-react";

export default function PublicErrorBoundary({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="mx-auto flex min-h-[50vh] max-w-lg flex-col items-center justify-center px-4 py-16 text-center">
      <div className="grid size-14 place-items-center rounded-2xl bg-red-50 text-red-600">
        <AlertCircle className="size-7" />
      </div>
      <h2 className="mt-4 text-xl font-extrabold text-navy">
        حدث خطأ غير متوقع أثناء تحميل الصفحة
      </h2>
      <p className="mt-2 text-sm text-muted-text">
        يرجى إعادة المحاولة أو تحديث الصفحة.
      </p>
      <button
        type="button"
        onClick={() => reset()}
        className="mt-6 inline-flex min-h-11 items-center gap-2 rounded-lg bg-navy px-6 text-sm font-bold text-white hover:bg-navy-deep"
      >
        <RotateCcw className="size-4" />
        <span>إعادة المحاولة</span>
      </button>
    </div>
  );
}
