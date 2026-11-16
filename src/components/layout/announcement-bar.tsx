import { getTranslations } from "next-intl/server";

/** Slim seasonal message above the header. Hidden when the text is empty. */
export async function AnnouncementBar() {
  const t = await getTranslations("Announcement");
  const text = t("text");
  if (!text.trim()) return null;

  return (
    <p className="bg-ink px-4 py-2 text-center text-[15px] font-medium text-paper">
      {text}
    </p>
  );
}
