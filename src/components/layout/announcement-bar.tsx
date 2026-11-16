import { getTranslations } from "next-intl/server";

/** Slim seasonal strip above the header. Hidden when the text is empty. */
export async function AnnouncementBar() {
  const t = await getTranslations("Announcement");
  const text = t("text");
  if (!text.trim()) return null;

  return (
    <p className="bg-navy px-4 py-2 text-center text-xs font-medium text-white dark:text-navy-deep">
      <span className="me-2 rounded bg-gold px-2 py-0.5 text-[10px] font-bold text-primary">
        {t("badge")}
      </span>
      {text}
    </p>
  );
}
