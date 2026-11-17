import { getLocale } from "next-intl/server";
import { getWebsiteSettings } from "@/lib/repository";

/** Slim seasonal strip above the header. Hidden when the text is empty. */
export async function AnnouncementBar() {
  const [locale, settings] = await Promise.all([
    getLocale(),
    getWebsiteSettings(),
  ]);
  const text =
    locale === "en" ? settings.announcement_en : settings.announcement_ar;
  if (!text || !text.trim()) return null;

  const badge =
    locale === "en" ? settings.store_name_en : settings.store_name_ar;

  return (
    <p className="bg-navy px-4 py-2 text-center text-xs font-medium text-white dark:text-navy-deep">
      <span className="me-2 rounded bg-gold px-2 py-0.5 text-[10px] font-bold text-ink">
        {badge}
      </span>
      {text}
    </p>
  );
}
