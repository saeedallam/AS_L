/** School stages used by the catalogue filter (products.age_stage). */
export const ageKeys = ["primary", "preparatory", "secondary"] as const;
export type AgeKey = (typeof ageKeys)[number];

/** Products per catalogue page. */
export const PAGE_SIZE = 10;
