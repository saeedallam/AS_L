import { getTranslations } from "next-intl/server";

/** Slim note at the top of the sheet. Hidden when the text is empty. */
export async function AnnouncementBar() {
  const t = await getTranslations("Announcement");
  const text = t("text");
  if (!text.trim()) return null;

  return (
    <p className="border-b border-rule bg-pencil px-4 py-1.5 text-sm font-medium text-[#14213d]">
      {text}
    </p>
  );
}
