import { hasLocale } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { Footer } from "@/components/layout/footer";
import { getTranslations } from "next-intl/server";
import { AnnouncementBar } from "@/components/layout/announcement-bar";
import { Header } from "@/components/layout/header";
import { WhatsAppFab } from "@/components/shared/whatsapp-fab";
import { routing } from "@/i18n/routing";

export default async function PublicLayout({
  children,
  params,
}: LayoutProps<"/[locale]">) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);
  const t = await getTranslations("Nav");

  return (
    <>
      <a
        href="#main"
        className="absolute start-3 top-3 z-50 -translate-y-24 rounded-xl bg-primary px-4 py-2 font-bold text-white focus:translate-y-0"
      >
        {t("skipToContent")}
      </a>
      <AnnouncementBar />
      <Header />
      <div id="main" className="flex flex-1 scroll-mt-28 flex-col">{children}</div>
      <Footer />
      <WhatsAppFab />
    </>
  );
}
