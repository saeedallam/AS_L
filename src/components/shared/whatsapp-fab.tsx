import { getTranslations } from "next-intl/server";
import { siteConfig } from "@/lib/site-config";
import { buildWhatsAppUrl } from "@/lib/whatsapp";
import { WhatsAppButton } from "./whatsapp-button";

/** Floating WhatsApp button. Renders nothing until a number is configured. */
export async function WhatsAppFab() {
  const t = await getTranslations("WhatsApp");
  const url = buildWhatsAppUrl(siteConfig.whatsappNumber, t("greeting"));
  if (!url) return null;

  return (
    <WhatsAppButton
      href={url}
      label={t("label")}
      iconOnly
      className="fixed bottom-5 end-5 z-50 size-14 rounded-full border-2 border-background shadow-xl shadow-whatsapp/30 md:hidden"
      iconClassName="size-7"
    />
  );
}
