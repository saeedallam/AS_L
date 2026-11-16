import { hasLocale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { AnnouncementBar } from "@/components/layout/announcement-bar";
import { Footer } from "@/components/layout/footer";
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
        className="absolute start-3 top-3 z-50 -translate-y-24 rounded-md bg-ink px-4 py-2 font-semibold text-paper focus:translate-y-0"
      >
        {t("skipToContent")}
      </a>
      <AnnouncementBar />
      <Header />
      <div id="main" className="flex flex-1 scroll-mt-32 flex-col">
        {children}
      </div>
      <Footer />
      <WhatsAppFab />
    </>
  );
}
