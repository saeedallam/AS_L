"use client";

import React, { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ExternalLink,
  Image as ImageIcon,
  Layers,
  Loader2,
  LogOut,
  MessageSquare,
  Package,
  Settings,
  Tag,
} from "lucide-react";
import { BrandMark } from "@/components/ui-kit/brand-mark";
import { Link } from "@/i18n/navigation";
import type { AdminSnapshot } from "@/lib/data/records";
import { loadSnapshot } from "./admin-api";
import { ProductsTab } from "./products-tab";
import { BrandsTab, CategoriesTab, GalleryTab } from "./catalog-tabs";
import { MessagesTab, SettingsTab } from "./messages-settings-tabs";
import { ConfirmDialog, ToastStack, useToasts, type ConfirmRequest } from "./ui";

type TabKey = "products" | "categories" | "brands" | "gallery" | "messages" | "settings";

export function SimpleAdminDashboard({
  adminEmail,
  role,
  initial,
}: {
  adminEmail: string;
  role: "admin" | "editor";
  initial: AdminSnapshot;
}) {
  const router = useRouter();
  const [data, setData] = useState<AdminSnapshot>(initial);
  const [activeTab, setActiveTab] = useState<TabKey>("products");
  const [refreshing, setRefreshing] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [confirmRequest, setConfirmRequest] = useState<ConfirmRequest | null>(null);
  const toasts = useToasts();
  const isAdmin = role === "admin";

  const refresh = useCallback(async () => {
    setRefreshing(true);
    const next = await loadSnapshot();
    setRefreshing(false);
    if (next) setData(next);
    else toasts.error("تعذر تحديث البيانات. أعد تحميل الصفحة.");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleLogout = async () => {
    setLoggingOut(true);
    await fetch("/api/admin/auth", { method: "DELETE", credentials: "same-origin" }).catch(() => undefined);
    router.replace("/ar/admin/login");
    router.refresh();
  };

  const shared = { refresh, toast: toasts, confirm: setConfirmRequest };
  const unreadCount = data.messages.filter((m) => !m.is_read).length;

  const tabs: { key: TabKey; label: string; icon: React.ElementType; badge?: number; adminOnly?: boolean }[] = [
    { key: "products", label: `المنتجات (${data.products.length})`, icon: Package },
    { key: "categories", label: `الأقسام (${data.categories.length})`, icon: Layers },
    { key: "brands", label: `العلامات (${data.brands.length})`, icon: Tag },
    { key: "gallery", label: `المعرض (${data.gallery.length})`, icon: ImageIcon },
    { key: "messages", label: `الرسائل (${data.messages.length})`, icon: MessageSquare, badge: unreadCount, adminOnly: true },
    { key: "settings", label: "الإعدادات والواتساب", icon: Settings, adminOnly: true },
  ];

  return (
    <div className="min-h-screen bg-page pb-16">
      <header className="border-b border-line bg-surface">
        <div className="mx-auto flex h-20 max-w-[76rem] items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <BrandMark className="size-12" />
            <div>
              <h1 className="text-base font-extrabold text-navy sm:text-lg">إدارة مكتبة أسماء النموذجية</h1>
              <p className="text-xs text-muted-text">
                {adminEmail} • {isAdmin ? "مدير" : "محرر"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2.5">
            {refreshing && <Loader2 className="size-4 animate-spin text-blue" aria-label="جاري التحديث" />}
            <Link href="/" className="inline-flex min-h-10 items-center gap-1.5 rounded-lg border border-line bg-page px-3.5 text-xs font-bold text-navy hover:bg-navy-soft/60">
              <ExternalLink className="size-3.5" />
              <span>عرض الموقع</span>
            </Link>
            <button
              type="button"
              onClick={handleLogout}
              disabled={loggingOut}
              className="inline-flex min-h-10 items-center gap-1.5 rounded-lg bg-red-50 px-3.5 text-xs font-bold text-red-700 hover:bg-red-100 disabled:opacity-60"
            >
              {loggingOut ? <Loader2 className="size-3.5 animate-spin" /> : <LogOut className="size-3.5" />}
              <span>خروج</span>
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-[76rem] px-4 pt-8 sm:px-6 lg:px-8">
        <nav aria-label="أقسام لوحة الإدارة" className="mb-6 flex flex-wrap gap-2 rounded-xl border border-line bg-surface p-2 shadow-card">
          {tabs
            .filter((t) => isAdmin || !t.adminOnly)
            .map(({ key, label, icon: Icon, badge }) => (
              <button
                key={key}
                type="button"
                aria-current={activeTab === key ? "page" : undefined}
                onClick={() => setActiveTab(key)}
                className={`flex flex-1 items-center justify-center gap-2 whitespace-nowrap rounded-lg px-4 py-3 text-sm font-bold transition-colors ${
                  activeTab === key ? "bg-navy text-white" : "text-navy hover:bg-navy-soft/50"
                }`}
              >
                <Icon className="size-4" />
                <span>{label}</span>
                {badge ? <span className="rounded-full bg-gold px-2 py-0.5 text-[11px] font-black text-navy">{badge}</span> : null}
              </button>
            ))}
        </nav>

        {activeTab === "products" && (
          <ProductsTab
            products={data.products}
            categories={data.categories}
            brands={data.brands}
            currencyLabel={data.settings.currency_label}
            {...shared}
          />
        )}
        {activeTab === "categories" && <CategoriesTab categories={data.categories} products={data.products} {...shared} />}
        {activeTab === "brands" && <BrandsTab brands={data.brands} products={data.products} {...shared} />}
        {activeTab === "gallery" && <GalleryTab gallery={data.gallery} {...shared} />}
        {activeTab === "messages" && isAdmin && <MessagesTab messages={data.messages} {...shared} />}
        {activeTab === "settings" && isAdmin && <SettingsTab key={data.settings.store_name_ar} settings={data.settings} {...shared} />}
      </div>

      <ConfirmDialog request={confirmRequest} onClose={() => setConfirmRequest(null)} />
      <ToastStack toasts={toasts.toasts} onDismiss={toasts.dismiss} />
    </div>
  );
}
