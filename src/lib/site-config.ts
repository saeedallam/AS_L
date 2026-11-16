// Temporary source for store details. Phase 6 moves these to the
// website_settings table so they can be edited from the dashboard.
export const siteConfig = {
  whatsappNumber: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "",
};

export const mainNav = [
  { key: "home", href: "/" },
  { key: "products", href: "/products" },
  { key: "categories", href: "/categories" },
  { key: "brands", href: "/brands" },
  { key: "services", href: "/services" },
  { key: "contact", href: "/contact" },
] as const;

export const footerNav = [
  { key: "about", href: "/about" },
  { key: "gallery", href: "/gallery" },
  { key: "faq", href: "/faq" },
  { key: "privacy", href: "/privacy" },
] as const;
