import { getTranslations } from "next-intl/server";
import { siteConfig } from "@/lib/site-config";
import { buildWhatsAppUrl } from "@/lib/whatsapp";
import { WhatsAppButton } from "./whatsapp-button";

/** Floating WhatsApp button on small screens, where the header button is hidden. */
export async function WhatsAppFab() {
  const t = await getTranslations("WhatsApp");
  const url = buildWhatsAppUrl(siteConfig.whatsappNumber, t("greeting"));
  if (!url) return null;

  return (
    <WhatsAppButton
      href={url}
      label={t("label")}
      iconOnly
      className="fixed bottom-5 end-5 z-50 size-14 rounded-full lg:hidden"
      iconClassName="size-6"
    />
  );
}
