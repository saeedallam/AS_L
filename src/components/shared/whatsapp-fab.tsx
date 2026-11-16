import { getTranslations } from "next-intl/server";
import { siteConfig } from "@/lib/site-config";
import { buildWhatsAppUrl } from "@/lib/whatsapp";
import { WhatsAppIcon } from "./whatsapp-icon";

/** Floating button on small screens, where the header button is hidden. */
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
      className="fixed bottom-5 end-5 z-50 grid size-14 place-items-center rounded-full bg-whatsapp text-white shadow-raised transition-colors hover:bg-whatsapp-deep sm:hidden"
    >
      <WhatsAppIcon className="size-7" />
    </a>
  );
}
