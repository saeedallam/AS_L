import { describe, expect, it } from "vitest";
import { parseStorageUrl, validateImageFile } from "@/lib/storage";
import { mapProduct, mapSettings, type ProductRowWithRelations } from "@/lib/data/records";
import { toSearchTerm } from "@/lib/data/catalog";

const png = new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0, 0, 0, 0]);

describe("image upload validation", () => {
  it("accepts a real PNG", async () => {
    const res = await validateImageFile(new File([png], "a.png", { type: "image/png" }));
    expect(res.valid && res.ext).toBe("png");
  });

  it("rejects a script renamed to .png (magic bytes)", async () => {
    const res = await validateImageFile(new File(["<script>alert(1)</script>"], "a.png", { type: "image/png" }));
    expect(res.valid).toBe(false);
  });

  it("rejects SVG and files over 5 MB", async () => {
    const svg = await validateImageFile(new File(["<svg/>"], "a.svg", { type: "image/svg+xml" }));
    expect(svg.valid).toBe(false);
    const big = new Uint8Array(5 * 1024 * 1024 + 1);
    big.set(png);
    const res = await validateImageFile(new File([big], "big.png", { type: "image/png" }));
    expect(res.valid).toBe(false);
  });

  it("only parses URLs from this project's showcase buckets", () => {
    const base = "https://qmgcuvsphakcidoabgzl.supabase.co/storage/v1/object/public";
    expect(parseStorageUrl(`${base}/product-images/2026/11/x.png`)).toEqual({ bucket: "product-images", path: "2026/11/x.png" });
    expect(parseStorageUrl(`${base}/private-bucket/x.png`)).toBeNull();
    expect(parseStorageUrl(`${base}/product-images/../secrets`)).toBeNull();
    expect(parseStorageUrl("https://other.supabase.co/storage/v1/object/public/product-images/x.png")).toBeNull();
    expect(parseStorageUrl("c-4")).toBeNull();
  });
});

describe("row mapping", () => {
  it("maps a product row with numeric strings, relations and ordered images", () => {
    const row = {
      id: "p1", name_ar: "قلم", name_en: null, slug: "pen", short_description: "", short_description_en: "",
      description: "", description_en: "", category_id: "c1", brand_id: null, age_stage: null,
      price: "12.50", sale_price: null, sku: null, specifications: [], variations: [], main_image: "c-1",
      is_featured: true, is_active: true, seo_title: null, seo_description: null,
      created_at: "2026-01-01", updated_at: "2026-01-02",
      category: { slug: "pens" }, brand: null,
      product_images: [
        { id: "i2", product_id: "p1", image_url: "b", alt_text: "", display_order: 2, created_at: "" },
        { id: "i1", product_id: "p1", image_url: "a", alt_text: "", display_order: 1, created_at: "" },
      ],
    } as ProductRowWithRelations;
    const p = mapProduct(row);
    expect(p.display_price).toBe(12.5);
    expect(p.category_slug).toBe("pens");
    expect(p.additional_images).toEqual(["a", "b"]);
  });

  it("maps settings rows, ignoring unknown keys and keeping the business name", () => {
    const s = mapSettings([
      { setting_key: "store_name_ar", setting_value: "" },
      { setting_key: "allow_indexing", setting_value: "false" },
      { setting_key: "evil_key", setting_value: "x" },
    ]);
    expect(s.store_name_ar).toBe("مكتبة أسماء النموذجية");
    expect(s.allow_indexing).toBe(false);
    expect((s as Record<string, unknown>).evil_key).toBeUndefined();
  });
});

describe("catalogue search term", () => {
  it("removes PostgREST filter syntax and wildcards", () => {
    expect(toSearchTerm("pen,name.eq.x)%_*")).toBe("pen name eq x");
    expect(toSearchTerm("  دفتر   سلك  ")).toBe("دفتر سلك");
  });
});
