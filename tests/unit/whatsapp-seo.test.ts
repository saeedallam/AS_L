import { describe, expect, it } from "vitest";
import { buildProductWhatsAppMessage, buildWhatsAppUrl, formatPrice } from "@/lib/whatsapp";
import { jsonLdString } from "@/lib/seo";
import { makeSlug } from "@/lib/slug";

describe("WhatsApp inquiry links", () => {
  it("builds the polite Arabic message with product name and page URL", () => {
    const msg = buildProductWhatsAppMessage({ locale: "ar", productName: "دفتر سلك A4", slug: "notebook-a4-100" });
    expect(msg).toBe("السلام عليكم، أريد الاستفسار عن المنتج: دفتر سلك A4\n\nhttps://example.com/ar/products/notebook-a4-100");
  });

  it("links to wa.me with the configured number and encoded text", () => {
    const url = buildWhatsAppUrl("+20 101 234 5678", "مرحبا");
    expect(url).toBe(`https://wa.me/201012345678?text=${encodeURIComponent("مرحبا")}`);
  });

  it("never invents a number: no number -> null, or a share link when allowed", () => {
    expect(buildWhatsAppUrl("", "x")).toBeNull();
    expect(buildWhatsAppUrl("", "x", true)).toBe("https://api.whatsapp.com/send?text=x");
  });

  it("formats optional prices with the configured currency label", () => {
    expect(formatPrice(null, "ج.م")).toBe("");
    expect(formatPrice(25, "ج.م")).toBe("25 ج.م");
    expect(formatPrice(12.5)).toBe("12.50");
  });
});

describe("SEO helpers", () => {
  it("escapes JSON-LD so stored text cannot close the script tag", () => {
    const out = jsonLdString({ name: "</script><script>alert(1)</script>" });
    expect(out).not.toContain("</script>");
    expect(JSON.parse(out).name).toBe("</script><script>alert(1)</script>");
  });

  it("generates URL slugs, with a random fallback for Arabic-only names", () => {
    expect(makeSlug("", "School Backpack 2026!", "product")).toBe("school-backpack-2026");
    expect(makeSlug("", "حقيبة", "product")).toMatch(/^product-[a-f0-9]{6}$/);
  });
});
