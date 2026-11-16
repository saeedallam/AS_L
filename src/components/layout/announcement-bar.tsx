import { getTranslations } from "next-intl/server";

/**
 * One line at the very top. Hidden when the text is empty.
 * In dark mode the brand lightens, so the text flips dark to keep 4.5:1.
 */
export async function AnnouncementBar() {
  const t = await getTranslations("Announcement");
  const text = t("text");
  if (!text.trim()) return null;

  return (
    <p className="bg-brand px-5 py-2 text-center text-sm font-medium text-white sm:px-8 dark:text-[#10242b]">
      {text}
    </p>
  );
}
