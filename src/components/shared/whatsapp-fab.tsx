import { getTranslations } from "next-intl/server";
import { getWebsiteSettings } from "@/lib/repository";
import { buildWhatsAppUrl } from "@/lib/whatsapp";
import { WhatsAppIcon } from "./whatsapp-icon";

/** Floating button on small screens, where the header button is hidden. */
export async function WhatsAppFab() {
  const [t, settings] = await Promise.all([
    getTranslations("WhatsApp"),
    getWebsiteSettings(),
  ]);
  const url = buildWhatsAppUrl(
    settings.whatsapp_number,
    t("greeting"),
    true,
  );
  if (!url) return null;

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={t("label")}
      className="fixed bottom-5 end-5 z-50 grid size-14 place-items-center rounded-full bg-whatsapp-deep text-white shadow-raised transition-[filter] hover:brightness-115 sm:hidden"
    >
      <WhatsAppIcon className="size-7" />
    </a>
  );
}
