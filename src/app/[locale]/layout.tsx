import type { Metadata, Viewport } from "next";
import { notFound } from "next/navigation";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { ThemeProvider } from "@/components/theme-provider";
import { getDirection, routing } from "@/i18n/routing";
import { BUSINESS_NAME_AR, BUSINESS_NAME_EN, getWebsiteSettings } from "@/lib/repository";
import { photoSrc } from "@/lib/media";
import { jsonLdString } from "@/lib/seo";
import { siteUrl } from "@/lib/supabase/env";
import "../globals.css";

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#eef2f8" },
    { media: "(prefers-color-scheme: dark)", color: "#0f1725" },
  ],
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: LayoutProps<"/[locale]">): Promise<Metadata> {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) return {};

  const [t, settings] = await Promise.all([
    getTranslations({ locale, namespace: "Metadata" }),
    getWebsiteSettings(),
  ]);

  const baseUrl = siteUrl();
  const title =
    locale === "en"
      ? settings.seo_title_en || t("title")
      : settings.seo_title_ar || t("title");
  const description =
    locale === "en"
      ? settings.seo_description_en || t("description")
      : settings.seo_description_ar || t("description");
  const ogImage = photoSrc(settings.og_image_url) || "/media/logo-full.png";

  return {
    metadataBase: new URL(baseUrl),
    title: {
      default: title,
      template: `%s | ${locale === "en" ? BUSINESS_NAME_EN : BUSINESS_NAME_AR}`,
    },
    description,
    keywords: settings.seo_keywords
      ? settings.seo_keywords.split(",").map((k) => k.trim())
      : [
          "مكتبة أسماء النموذجية",
          "Asmaa Model Library",
          "قرطاسية",
          "مستلزمات مدرسية",
          "أدوات مكتبية",
        ],
    alternates: {
      canonical: `/${locale}`,
      languages: { ar: "/ar", en: "/en", "x-default": "/ar" },
    },
    openGraph: {
      type: "website",
      locale: locale === "en" ? "en_US" : "ar_EG",
      siteName: `${BUSINESS_NAME_AR} | ${BUSINESS_NAME_EN}`,
      title,
      description,
      url: `${baseUrl}/${locale}`,
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: BUSINESS_NAME_AR,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage],
    },
    robots: {
      index: settings.allow_indexing !== false,
      follow: settings.allow_indexing !== false,
    },
  };
}

export default async function RootLayout({
  children,
  params,
}: LayoutProps<"/[locale]">) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();

  setRequestLocale(locale);
  const settings = await getWebsiteSettings();
  const baseUrl = siteUrl();
  const sameAs = [
    settings.facebook_url,
    settings.instagram_url,
    settings.tiktok_url,
    settings.x_url,
    settings.youtube_url,
  ].filter(Boolean);
  const logo = photoSrc(settings.logo_url) || "/media/logo-full.png";

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Store",
    name: BUSINESS_NAME_AR,
    alternateName: BUSINESS_NAME_EN,
    description:
      (locale === "en" ? settings.site_description_en : settings.site_description_ar) ||
      settings.seo_description_ar,
    url: `${baseUrl}/${locale}`,
    logo: logo.startsWith("/") ? `${baseUrl}${logo}` : logo,
    ...(settings.phone ? { telephone: settings.phone } : {}),
    ...(settings.email ? { email: settings.email } : {}),
    ...(settings.address_ar
      ? { address: { "@type": "PostalAddress", streetAddress: locale === "en" ? settings.address_en || settings.address_ar : settings.address_ar } }
      : {}),
    ...(sameAs.length ? { sameAs } : {}),
  };

  return (
    <html
      lang={locale}
      dir={getDirection(locale)}
      className="h-full antialiased"
      suppressHydrationWarning
    >
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: jsonLdString(jsonLd) }}
        />
      </head>
      <body className="flex min-h-full flex-col font-sans">
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={false}
          disableTransitionOnChange
        >
          <NextIntlClientProvider>{children}</NextIntlClientProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
