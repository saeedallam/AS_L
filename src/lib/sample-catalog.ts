/**
 * Temporary catalogue used until Phase 3 connects Supabase. The shape
 * mirrors the `products` table so the swap is a change of data source,
 * not a change of components.
 */
export type SampleProduct = {
  slug: string;
  name: string;
  nameEn: string;
  category: CategoryKey;
  brand: BrandKey;
  age: AgeKey;
  media: string;
};

export const categoryKeys = [
  "bags",
  "notebooks",
  "pens",
  "geometry",
  "art",
  "office",
] as const;
export const brandKeys = ["one", "two", "three", "four"] as const;
export const ageKeys = ["primary", "preparatory", "secondary"] as const;

export type CategoryKey = (typeof categoryKeys)[number];
export type BrandKey = (typeof brandKeys)[number];
export type AgeKey = (typeof ageKeys)[number];

export const sampleProducts: SampleProduct[] = [
  { slug: "backpack-classic", name: "حقيبة ظهر مدرسية", nameEn: "School backpack", category: "bags", brand: "one", age: "primary", media: "c-1" },
  { slug: "backpack-wheels", name: "حقيبة بعجل", nameEn: "Trolley bag", category: "bags", brand: "two", age: "primary", media: "c-2" },
  { slug: "pencil-case-fabric", name: "مقلمة قماش", nameEn: "Fabric pencil case", category: "bags", brand: "one", age: "preparatory", media: "c-3" },
  { slug: "notebook-a4-100", name: "كشكول سلك A4 ‏١٠٠ ورقة", nameEn: "A4 spiral notebook, 100 sheets", category: "notebooks", brand: "three", age: "preparatory", media: "c-4" },
  { slug: "notebook-a5-leather", name: "مفكرة جلدية A5", nameEn: "A5 leather notebook", category: "notebooks", brand: "four", age: "secondary", media: "c-5" },
  { slug: "copybook-60", name: "كراسة ٦٠ ورقة", nameEn: "60-sheet copybook", category: "notebooks", brand: "three", age: "primary", media: "c-6" },
  { slug: "pen-ballpoint-blue", name: "قلم جاف أزرق", nameEn: "Blue ballpoint pen", category: "pens", brand: "two", age: "preparatory", media: "c-7" },
  { slug: "pen-fountain-metal", name: "قلم حبر معدني", nameEn: "Metal fountain pen", category: "pens", brand: "four", age: "secondary", media: "c-8" },
  { slug: "pencil-set-hb", name: "طقم أقلام رصاص", nameEn: "Pencil set", category: "pens", brand: "one", age: "primary", media: "c-9" },
  { slug: "geometry-set-4", name: "طقم أدوات هندسية", nameEn: "Geometry set", category: "geometry", brand: "two", age: "preparatory", media: "c-10" },
  { slug: "ruler-30", name: "مسطرة ٣٠ سم", nameEn: "30 cm ruler", category: "geometry", brand: "two", age: "primary", media: "c-11" },
  { slug: "colour-pencils-24", name: "ألوان خشبية ٢٤ لون", nameEn: "Coloured pencils, 24", category: "art", brand: "three", age: "primary", media: "c-12" },
  { slug: "watercolour-12", name: "ألوان مائية ١٢ لون", nameEn: "Watercolours, 12", category: "art", brand: "three", age: "primary", media: "c-13" },
  { slug: "sketchbook-a3", name: "كراسة رسم A3", nameEn: "A3 sketchbook", category: "art", brand: "four", age: "secondary", media: "c-14" },
  { slug: "stapler-desk", name: "دبّاسة مكتب", nameEn: "Desk stapler", category: "office", brand: "one", age: "secondary", media: "c-15" },
  { slug: "calculator-scientific", name: "آلة حاسبة علمية", nameEn: "Scientific calculator", category: "office", brand: "four", age: "secondary", media: "c-16" },
  { slug: "organiser-desk", name: "منظّم مكتب", nameEn: "Desk organiser", category: "office", brand: "one", age: "secondary", media: "c-17" },
  { slug: "copy-paper-a4", name: "ورق تصوير A4", nameEn: "A4 copy paper", category: "office", brand: "three", age: "secondary", media: "c-18" },
];

/** One list of sections for the whole site: home, catalogue and filters. */
export const categories = [
  { key: "bags", media: "cat-bags" },
  { key: "notebooks", media: "cat-notebooks" },
  { key: "pens", media: "cat-pens" },
  { key: "geometry", media: "cat-geometry" },
  { key: "art", media: "cat-art" },
  { key: "office", media: "cat-office" },
] as const satisfies readonly { key: CategoryKey; media: string }[];

export const brands = [
  { key: "one", media: "brand-1" },
  { key: "two", media: "brand-2" },
  { key: "three", media: "brand-3" },
  { key: "four", media: "brand-4" },
] as const satisfies readonly { key: BrandKey; media: string }[];

export function productsInCategory(key: CategoryKey) {
  return sampleProducts.filter((product) => product.category === key);
}

export function countIn(field: "category" | "brand" | "age", value: string) {
  return sampleProducts.filter((product) => product[field] === value).length;
}

export const PAGE_SIZE = 10;

type Query = {
  q?: string;
  cat: CategoryKey[];
  brand: BrandKey[];
  age: AgeKey[];
  sort: "newest" | "name";
};

/** Filtering and sorting kept separate from the page, ready to move to SQL. */
export function queryProducts({ q, cat, brand, age, sort }: Query) {
  const needle = q?.trim().toLowerCase();

  const matched = sampleProducts.filter((product) => {
    if (cat.length && !cat.includes(product.category)) return false;
    if (brand.length && !brand.includes(product.brand)) return false;
    if (age.length && !age.includes(product.age)) return false;
    if (!needle) return true;
    return (
      product.name.toLowerCase().includes(needle) ||
      product.nameEn.toLowerCase().includes(needle)
    );
  });

  if (sort === "name") {
    matched.sort((a, b) => a.name.localeCompare(b.name, "ar"));
  }
  return matched;
}
