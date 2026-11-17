# Supabase setup & Vercel deployment — مكتبة أسماء النموذجية

Nothing here has been deployed. Every step that touches production (Vercel, DNS, live data) needs the owner's approval.

---

## 1. Supabase project

Project: **asmaa-stationery** — ref `qmgcuvsphakcidoabgzl` (region eu-central-1).

Already done on this project:
- Migration `20261117172845_showcase_schema` applied (8 tables, constraints, indexes, RLS, triggers, contact RPC, storage buckets and policies). It replaced the earlier prototype tables, which held sample data only.
- `supabase/seed.sql` loaded: 6 sample categories, 4 placeholder brands, 18 sample products, 5 gallery items, default settings. **Replace these from the dashboard.**

For a new/empty project (e.g. a separate production project):
1. Supabase Dashboard → SQL Editor → run `supabase/migrations/20261117172845_showcase_schema.sql`.
2. Optionally run `supabase/seed.sql` for sample data.
   (With the Supabase CLI: `supabase link --project-ref <ref>` then `supabase db push`.)

> The older file `supabase/migrations/20261116173000_initial_schema.sql` is prototype history; the showcase migration drops what they created. On a fresh project you only need the showcase migration.

## 2. Storage

Buckets (created by the migration): `product-images`, `category-images`, `brand-logos`, `gallery-images`.
- Public read by URL; visitors cannot list bucket contents.
- Upload/replace/delete only for `admin`/`editor` (storage RLS), max 5 MB, JPG/PNG/WebP/AVIF. The server also checks the real file type (magic bytes) and uses random file names.
- Replaced or deleted images are removed from storage only when no other record still references them.
- The old empty `media` bucket from the prototype is unused; delete it in Dashboard → Storage if you like.

## 3. Create the first admin

There is no public registration page. Admin = a Supabase Auth user whose `profiles.role` is `admin`.

1. **Authentication → Sign In / Providers → Email**: turn **off** "Allow new users to sign up" (prevents anyone from creating accounts through the public API). Keep Email provider enabled.
2. **Authentication → Users → Add user → Create new user**: enter the admin email and a strong password, tick "Auto Confirm User".
3. **SQL Editor**, run (replace the email):

   ```sql
   update public.profiles set role = 'admin' where email = 'owner@example.com';
   select email, role from public.profiles;
   ```
   Use `role = 'editor'` for staff who should manage products/categories/brands/gallery but not messages or settings.
4. Sign in at `https://<your-domain>/ar/admin/login`.

To remove access: `update public.profiles set role = 'viewer' where email = '…';` (takes effect on the next request).

## 4. Authentication URLs

Authentication → URL Configuration:
- **Site URL**: `https://<your-production-domain>`
- **Redirect URLs**: `https://<your-production-domain>/**`, `http://localhost:3000/**`, and (for previews) `https://*-<vercel-team>.vercel.app/**`

Login is email + password handled server-side; no magic links or OAuth callbacks are used, so these URLs only matter for password-reset emails you send from the dashboard.

## 5. Environment variables

| Name | Where | Value |
|---|---|---|
| `NEXT_PUBLIC_SITE_URL` | Vercel (Production / Preview), `.env.local` | `https://<domain>` — no trailing slash |
| `NEXT_PUBLIC_SUPABASE_URL` | same | `https://qmgcuvsphakcidoabgzl.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | same | Dashboard → Project Settings → API Keys → publishable key (`sb_publishable_…`) |
| `IP_HASH_SALT` | Vercel (optional, server-only) | any long random string |
| `CRON_SECRET` | Vercel (Production, server-only) | random string, 32+ characters — protects the daily keep-alive job |

Do **not** add `SUPABASE_SERVICE_ROLE_KEY`, `ADMIN_PASSWORD` or `ADMIN_SESSION_SECRET` — they are no longer used. If they exist in Vercel from earlier, delete them. If the service-role key was ever shared or committed, rotate it in Supabase.

## 6. Deploy to Vercel (after approval)

1. Push the repository to GitHub, then Vercel → Add New Project → import it (framework: Next.js, defaults are fine; Node 22).
2. Add the environment variables above for Production and Preview.
3. Deploy. Then verify:
   ```bash
   BASE_URL=https://<deployment-url> npm run test:smoke
   ```
4. Domain: Vercel → Project → Settings → Domains → add the domain and create the DNS records Vercel shows (HTTPS certificates are automatic). Update `NEXT_PUBLIC_SITE_URL` and the Supabase Site URL to the final domain, then redeploy.
5. Sign in to `/ar/admin`, fill **Settings** (WhatsApp number, phone, address, hours, logo, social links, currency label), and replace the sample catalogue.

Preview deployments automatically send `Disallow: /` in robots.txt.

## 7. Operational notes

- **Keep-alive (Supabase Free plan)**: Free projects are paused after about a week without database activity. `vercel.json` defines a Vercel Cron Job that calls `/api/health` once a day (03:17 UTC; Hobby runs it within that hour). The route reads one row from `site_settings` and only answers requests carrying `Authorization: Bearer <CRON_SECRET>`, so set `CRON_SECRET` in Vercel. Cron jobs run on production deployments only; check them under Vercel → Project → Settings → Cron Jobs. Manual test: `curl -H "Authorization: Bearer <CRON_SECRET>" https://<domain>/api/health` → `{"ok":true,"database":"up"}`. Upgrading Supabase to Pro removes pausing entirely and adds daily backups.

- **Caching**: public data is cached (tag `catalog`, 10 min); every admin save expires it immediately, so changes appear on the next page load.
- **Contact form spam protection**: server Zod validation, honeypot field, minimum fill time, same-origin check, and in Postgres: 3 messages / 10 min and 10 / day per hashed IP, duplicate (same phone + text in 24 h) rejection, and a global cap of 60 messages / hour.
- **Login rate limiting** is provided by Supabase Auth (Dashboard → Authentication → Rate Limits).
- **Not-found pages**: unknown products/categories render the 404 page with `noindex`. Because pages stream, the HTTP status can be 200 (documented Next.js 16 behaviour); search engines treat these as soft 404s and do not index them.
