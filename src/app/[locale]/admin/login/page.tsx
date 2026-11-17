"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock, Mail, Loader2, AlertCircle, ArrowRight } from "lucide-react";
import { BrandMark } from "@/components/ui-kit/brand-mark";
import { Link } from "@/i18n/navigation";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/admin/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "بيانات الدخول غير صحيحة");
        setLoading(false);
        return;
      }

      router.push("/ar/admin");
      router.refresh();
    } catch {
      setError("حدث خطأ أثناء الاتصال بالخادم");
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-page p-4">
      <div className="w-full max-w-md overflow-hidden rounded-2xl border border-line bg-surface shadow-card">
        <div className="bg-navy p-7 text-center text-white">
          <BrandMark className="mx-auto size-14" />
          <h1 className="mt-4 text-xl font-extrabold">
            لوحة تحكم مكتبة أسماء النموذجية
          </h1>
          <p className="mt-1 text-xs text-white/75">
            إدارة المنتجات والأقسام ورقم الواتساب
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 p-7">
          {error && (
            <div className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-3.5 text-xs font-bold text-red-800">
              <AlertCircle className="mt-0.5 size-4 shrink-0 text-red-600" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label
              htmlFor="admin-email"
              className="mb-1.5 block text-xs font-bold text-navy"
            >
              البريد الإلكتروني
            </label>
            <div className="relative">
              <Mail className="pointer-events-none absolute end-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-text" />
              <input
                id="admin-email"
                type="email"
                required
                autoComplete="username"
                dir="ltr"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@asmaa-library.com"
                className="w-full rounded-xl border border-line bg-page py-3 ps-4 pe-10 text-end text-sm text-ink focus:border-blue focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="admin-password"
              className="mb-1.5 block text-xs font-bold text-navy"
            >
              كلمة المرور
            </label>
            <div className="relative">
              <Lock className="pointer-events-none absolute end-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-text" />
              <input
                id="admin-password"
                type="password"
                required
                autoComplete="current-password"
                dir="ltr"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full rounded-xl border border-line bg-page py-3 ps-4 pe-10 text-end text-sm text-ink focus:border-blue focus:outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-navy px-5 text-sm font-bold text-white transition-colors hover:bg-navy-deep disabled:opacity-60"
          >
            {loading && <Loader2 className="size-4 animate-spin" />}
            <span>تسجيل الدخول</span>
          </button>

          <div className="border-t border-line pt-4 text-center">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-blue hover:underline"
            >
              <ArrowRight className="size-3.5" />
              <span>العودة إلى الموقع الرئيسي</span>
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
