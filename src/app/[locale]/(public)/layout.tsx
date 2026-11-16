import { hasLocale } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
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
    // One sheet of squared paper: the red margin rule runs its full height.
    <div className="sheet mx-auto flex w-full max-w-6xl flex-1 flex-col pe-4 [--margin-w:1.25rem] sm:pe-6 sm:[--margin-w:3rem] lg:[--margin-w:5rem]">
      <a
        href="#main"
        className="absolute start-2 top-2 z-50 -translate-y-20 bg-ink px-4 py-2 font-semibold text-paper focus:translate-y-0"
      >
        {t("skipToContent")}
      </a>
      <AnnouncementBar />
      <Header />
      <div id="main" className="flex flex-1 scroll-mt-24 flex-col">{children}</div>
      <Footer />
      <WhatsAppFab />
    </div>
  );
}
