// Temporary source for store details. Phase 3 moves these to the
// website_settings table so they can be edited from the dashboard.
export const siteConfig = {
  whatsappNumber: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "",
  mapUrl: process.env.NEXT_PUBLIC_MAP_URL ?? "",
};

export const mainNav = [
  { key: "home", href: "/" },
  { key: "products", href: "/products" },
  { key: "categories", href: "/categories" },
  { key: "brands", href: "/brands" },
  { key: "contact", href: "/contact" },
] as const;

export const footerNav = [
  { key: "about", href: "/about" },
  { key: "faq", href: "/faq" },
  { key: "privacy", href: "/privacy" },
] as const;
