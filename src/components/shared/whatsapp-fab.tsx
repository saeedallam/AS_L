import { getTranslations } from "next-intl/server";
import { siteConfig } from "@/lib/site-config";
import { buildWhatsAppUrl } from "@/lib/whatsapp";
import { WhatsAppIcon } from "./whatsapp-icon";

/** Floating WhatsApp button. Renders nothing until a number is configured. */
export async function WhatsAppFab() {
  const t = await getTranslations("WhatsApp");
  const url = buildWhatsAppUrl(siteConfig.whatsappNumber, t("greeting"));
  if (!url) return null;

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={t("label")}
      className="fixed bottom-5 end-5 z-50 grid size-14 place-items-center rounded-full border-2 border-background bg-whatsapp text-whatsapp-ink shadow-lg transition-transform hover:scale-105"
    >
      <WhatsAppIcon className="size-7" />
    </a>
  );
}
