/**
 * Public data access entry point used by pages and layout components.
 *   - records.ts : view-model types + row mapping (no I/O)
 *   - catalog.ts : cached public reads (anon client, RLS: active rows only)
 *   - admin.ts   : admin writes (session client, RLS: editors/admins)
 */
export * from "./data/records";
export {
  getWebsiteSettings,
  getCategoriesList,
  getBrandsList,
  getGalleryList,
  getProductsList,
  getProductBySlugRecord,
  getRelatedProducts,
  queryCatalog,
  getCatalogFacets,
  CATALOG_TAG,
  type CatalogQuery,
  type CatalogResult,
  type CatalogSort,
} from "./data/catalog";
