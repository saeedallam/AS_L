import { describe, expect, it } from "vitest";
import {
  adminActionSchema,
  contactMessageSchema,
  imageRefSchema,
  productInputSchema,
  settingsInputSchema,
} from "@/lib/validations";

const validContact = { name: "سارة", phone: "01012345678", email: "", message: "أريد الاستفسار عن منتج" };

describe("contact form validation", () => {
  it("accepts a valid Arabic message without email", () => {
    expect(contactMessageSchema.safeParse(validContact).success).toBe(true);
  });

  it("strips HTML tags (XSS) before validating", () => {
    const parsed = contactMessageSchema.parse({ ...validContact, message: "<script>alert(1)</script>مرحبا بكم" });
    expect(parsed.message).not.toContain("<");
  });

  it("rejects letters in the phone number", () => {
    expect(contactMessageSchema.safeParse({ ...validContact, phone: "call me" }).success).toBe(false);
  });

  it("rejects an invalid email and an empty message", () => {
    expect(contactMessageSchema.safeParse({ ...validContact, email: "nope" }).success).toBe(false);
    expect(contactMessageSchema.safeParse({ ...validContact, message: "  " }).success).toBe(false);
  });

  it("rejects messages over 2000 characters", () => {
    expect(contactMessageSchema.safeParse({ ...validContact, message: "ا".repeat(2001) }).success).toBe(false);
  });
});

describe("product validation", () => {
  const base = { name_ar: "دفتر سلك", category_id: null, brand_id: null };

  it("allows a product without a price (showcase)", () => {
    const p = productInputSchema.parse(base);
    expect(p.display_price).toBeNull();
    expect(p.is_published).toBe(true);
  });

  it("parses prices and rejects negative ones", () => {
    expect(productInputSchema.parse({ ...base, display_price: "12.5" }).display_price).toBe(12.5);
    expect(productInputSchema.safeParse({ ...base, display_price: -1 }).success).toBe(false);
  });

  it("rejects a sale price higher than the price, or without a price", () => {
    expect(productInputSchema.safeParse({ ...base, display_price: 10, promotional_price: 20 }).success).toBe(false);
    expect(productInputSchema.safeParse({ ...base, promotional_price: 5 }).success).toBe(false);
  });

  it("rejects bad slugs and non-uuid category ids", () => {
    expect(productInputSchema.safeParse({ ...base, slug: "Bad Slug!" }).success).toBe(false);
    expect(productInputSchema.safeParse({ ...base, category_id: "1; drop table" }).success).toBe(false);
  });

  it("limits additional images to 12", () => {
    const images = Array.from({ length: 13 }, (_, i) => ({ url: `https://x.supabase.co/a${i}.png`, alt: "" }));
    expect(productInputSchema.safeParse({ ...base, images }).success).toBe(false);
  });
});

describe("image references", () => {
  it.each(["https://qmgcuvsphakcidoabgzl.supabase.co/storage/v1/object/public/product-images/a.png", "/media/logo.png", "c-4", ""])(
    "accepts %s",
    (v) => expect(imageRefSchema.safeParse(v).success).toBe(true),
  );
  it.each(["javascript:alert(1)", "data:image/png;base64,AAAA", "http://insecure.example/a.png", "https://x/\"onerror=alert(1)"])(
    "rejects %s",
    (v) => expect(imageRefSchema.safeParse(v).success).toBe(false),
  );
});

describe("settings validation", () => {
  it("normalises the WhatsApp number to digits", () => {
    const s = settingsInputSchema.parse({ store_name_ar: "مكتبة أسماء النموذجية", whatsapp_number: "+20 101-234-5678" });
    expect(s.whatsapp_number).toBe("201012345678");
  });
  it("rejects a WhatsApp number with a leading zero (no country code)", () => {
    expect(settingsInputSchema.safeParse({ store_name_ar: "مكتبة", whatsapp_number: "01012345678" }).success).toBe(false);
  });
  it("only accepts Google Maps embed links for the map iframe", () => {
    expect(settingsInputSchema.safeParse({ store_name_ar: "مكتبة", map_url: "https://evil.example/frame" }).success).toBe(false);
    expect(settingsInputSchema.safeParse({ store_name_ar: "مكتبة", map_url: "https://www.google.com/maps/embed?pb=1" }).success).toBe(true);
  });
});

describe("admin action envelope", () => {
  it("rejects unknown operations", () => {
    expect(adminActionSchema.safeParse({ op: "orders.create", payload: {} }).success).toBe(false);
  });
  it("requires a uuid for updates and deletes", () => {
    expect(adminActionSchema.safeParse({ op: "product.delete", payload: { id: "abc" } }).success).toBe(false);
    expect(adminActionSchema.safeParse({ op: "product.update", payload: {} }).success).toBe(false);
  });
});
