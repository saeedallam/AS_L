# مكتبة أسماء النموذجية | Asmaa Model Library

الموقع الرسمي والكتالوج الرقمي لـ **مكتبة أسماء النموذجية** — موقع عرض منتجات (Showcase) مع استفسار عبر واتساب. **لا يوجد** سلة أو طلبات أو دفع أو شحن.

Next.js 16 (App Router) · TypeScript strict · Tailwind CSS v4 · next-intl (ar/en) · Supabase (PostgreSQL + Auth + Storage + RLS) · Zod 4

> دليل الإعداد والنشر الكامل: **[docs/DEPLOYMENT.md](docs/DEPLOYMENT.md)**

---

## 1. Backend architecture

```
Browser ──► Next.js (Vercel)
             ├─ Public pages (Server Components, cached, tag "catalog")
             │     └─ anon Supabase client ──► RLS: only active rows
             ├─ /api/contact  ──► rpc submit_contact_message() (validated + rate-limited in Postgres)
             ├─ /api/admin/*  ──► Supabase session of the signed-in admin ──► RLS: role admin/editor
             └─ proxy.ts      ──► locale routing + admin session refresh
```

| Layer | File(s) |
|---|---|
| Shared DB types | `src/types/database.ts` |
| View models + row mapping (pure) | `src/lib/data/records.ts` |
| Public queries (cached, anon) | `src/lib/data/catalog.ts` (re-exported by `src/lib/repository.ts`) |
| Admin commands (RLS-scoped) | `src/lib/data/admin.ts`, cache invalidation in `src/lib/data/revalidate.ts` |
| Validation (Zod) | `src/lib/validations.ts` |
| Authentication / authorization | `src/lib/auth.ts` (Supabase Auth + `profiles.role`), `src/lib/api/http.ts` (`requireAdmin`, CSRF origin check) |
| Storage | `src/lib/storage.ts` (magic-byte validation, random names, safe deletion) |
| WhatsApp | `src/lib/whatsapp.ts` |
| SEO helpers | `src/lib/seo.ts`, `src/app/sitemap.ts`, `src/app/robots.ts` |
| API handlers | `src/app/api/contact`, `src/app/api/admin/{auth,data,upload}` |
| Env validation | `src/lib/supabase/env.ts` |

**No service-role key is used anywhere.** Admin writes run with the admin's own session, so PostgreSQL Row Level Security is the final authority, in addition to the server-side checks in every route.

## 2. Database

Migration: `supabase/migrations/20261117172845_showcase_schema.sql` (applied to project `qmgcuvsphakcidoabgzl`). Sample data: `supabase/seed.sql`.

| Table | Purpose | Public access |
|---|---|---|
| `profiles` | admin accounts + role (`admin` / `editor` / `viewer`) | none |
| `categories` | sections | read active |
| `brands` | brands | read active |
| `products` | products, optional `price`/`sale_price`, JSONB `specifications`/`variations` | read active |
| `product_images` | extra images per product (cascade delete) | read if product active |
| `gallery` | store photo gallery | read active |
| `contact_messages` | visitor messages | **none** (insert only via `submit_contact_message`) |
| `site_settings` | key/value website settings | read |

All required columns from the spec exist. Additive columns keep the bilingual UI working: `categories.description_en`, `brands.name_en`, `products.name_en/short_description_en/description_en/age_stage`, `gallery.title_en`, `contact_messages.ip_hash` (hashed, for rate limiting).

Constraints: unique slugs/SKU/setting keys, slug format checks, length limits, non-negative prices, `sale_price <= price`, phone/email formats, JSONB must be arrays. Indexes cover active+ordering, foreign keys, trigram search on names, and messages by date/unread/ip.

## 3. Local development

```bash
cp .env.example .env.local   # fill NEXT_PUBLIC_SUPABASE_URL + NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
npm install
npm run dev                  # http://localhost:3000/ar  —  admin: /ar/admin
```

## 4. Quality checks

```bash
npm run typecheck   # next typegen + tsc --noEmit
npm run lint        # eslint
npm test            # vitest unit tests (validation, WhatsApp, storage, mapping, SEO)
npm run build       # production build
npm start & BASE_URL=http://localhost:3000 npm run test:smoke   # HTTP smoke tests (auth, CSRF, contact, 404, SEO)
```

## 5. Admin dashboard

`/ar/admin` — products (with multiple images, specs, variations, SEO, active/featured toggles), categories (ordering), brands (logos), gallery (ordering), messages (read/unread/delete) and settings (WhatsApp, phone, address, hours, logo, social links, description, SEO, currency label). Editors see catalogue tabs only; messages and settings are admin-only (enforced by the server and RLS, not just hidden).

Creating the first admin: see [docs/DEPLOYMENT.md § 3](docs/DEPLOYMENT.md#3-create-the-first-admin).
