import "server-only";
import { revalidatePath, revalidateTag } from "next/cache";
import { CATALOG_TAG } from "./catalog";

/**
 * Called after every successful admin write: expires cached catalogue data
 * immediately (next visitor gets fresh data) and re-renders cached pages.
 */
export function revalidateCatalog(): void {
  revalidateTag(CATALOG_TAG, { expire: 0 });
  revalidatePath("/", "layout");
}
