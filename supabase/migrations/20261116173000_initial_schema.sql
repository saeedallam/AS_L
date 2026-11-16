-- Initial schema for the stationery showcase site.
-- Public visitors: read-only access to published/visible content.
-- Admins (rows in admin_users): full access. Everything else goes through the server.

create extension if not exists pg_trgm with schema extensions;

-- Helpers live in a schema that the Data API does not expose.
create schema if not exists private;

create or replace function private.set_updated_at()
returns trigger language plpgsql set search_path = '' as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ---------- Tables ----------

create table public.admin_users (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users (id) on delete cascade,
  full_name text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function private.is_admin()
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.admin_users where user_id = (select auth.uid())
  );
$$;

create table public.categories (
  id uuid primary key default gen_random_uuid(),
  parent_id uuid references public.categories (id) on delete set null,
  name_ar text not null,
  name_en text,
  slug text not null unique,
  description_ar text,
  description_en text,
  image_path text,
  accent text not null default 'pencil'
    check (accent in ('pencil', 'ruler', 'eraser', 'marker')),
  is_visible boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.brands (
  id uuid primary key default gen_random_uuid(),
  name_ar text not null,
  name_en text,
  slug text not null unique,
  logo_path text,
  is_visible boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.products (
  id uuid primary key default gen_random_uuid(),
  category_id uuid not null references public.categories (id) on delete restrict,
  brand_id uuid references public.brands (id) on delete set null,
  name_ar text not null,
  name_en text,
  slug text not null unique,
  short_description_ar text,
  short_description_en text,
  description_ar text,
  description_en text,
  sku text unique,
  display_price numeric(10, 2) check (display_price is null or display_price >= 0),
  is_featured boolean not null default false,
  is_published boolean not null default false,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products (id) on delete cascade,
  storage_path text not null,
  alt_ar text,
  alt_en text,
  is_featured boolean not null default false,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.product_variants (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products (id) on delete cascade,
  group_ar text not null,
  group_en text,
  value_ar text not null,
  value_en text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.product_specifications (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products (id) on delete cascade,
  label_ar text not null,
  label_en text,
  value_ar text not null,
  value_en text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.gallery_images (
  id uuid primary key default gen_random_uuid(),
  storage_path text not null,
  caption_ar text,
  caption_en text,
  is_visible boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Single-row table: id is always 1.
create table public.website_settings (
  id smallint primary key default 1 check (id = 1),
  store_name_ar text not null default '',
  store_name_en text not null default '',
  logo_path text,
  phone text,
  whatsapp_number text,
  email text,
  address_ar text,
  address_en text,
  working_hours_ar text,
  working_hours_en text,
  map_url text,
  announcement_ar text,
  announcement_en text,
  social_links jsonb not null default '{}'::jsonb,
  homepage_content jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text,
  phone text,
  message text not null,
  is_read boolean not null default false,
  ip_hash text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Fixed-window counters for the contact form and admin login.
create table public.rate_limits (
  key text not null,
  window_start timestamptz not null,
  count integer not null default 1,
  primary key (key, window_start)
);

-- ---------- Indexes ----------

create index categories_parent_id_idx on public.categories (parent_id);
create index categories_visible_order_idx on public.categories (is_visible, sort_order);
create index brands_visible_order_idx on public.brands (is_visible, sort_order);
create index products_published_created_idx on public.products (is_published, created_at desc);
create index products_category_id_idx on public.products (category_id);
create index products_brand_id_idx on public.products (brand_id);
create index products_featured_idx on public.products (created_at desc) where is_featured and is_published;
create index products_name_ar_trgm_idx on public.products using gin (name_ar extensions.gin_trgm_ops);
create index products_name_en_trgm_idx on public.products using gin (name_en extensions.gin_trgm_ops);
create index product_images_product_order_idx on public.product_images (product_id, sort_order);
create unique index product_images_one_featured_idx on public.product_images (product_id) where is_featured;
create index product_variants_product_order_idx on public.product_variants (product_id, sort_order);
create index product_specifications_product_order_idx on public.product_specifications (product_id, sort_order);
create index gallery_images_visible_order_idx on public.gallery_images (is_visible, sort_order);
create index contact_messages_created_idx on public.contact_messages (created_at desc);

-- ---------- updated_at triggers ----------

do $$
declare t text;
begin
  foreach t in array array[
    'admin_users', 'categories', 'brands', 'products', 'product_images',
    'product_variants', 'product_specifications', 'gallery_images',
    'website_settings', 'contact_messages'
  ] loop
    execute format(
      'create trigger set_updated_at before update on public.%I
         for each row execute function private.set_updated_at()', t);
  end loop;
end;
$$;

-- ---------- Privileges ----------

grant usage on schema private to anon, authenticated;
revoke all on function private.is_admin() from public;
grant execute on function private.is_admin() to anon, authenticated;

revoke all on all tables in schema public from anon, authenticated;

grant select on
  public.categories, public.brands, public.products, public.product_images,
  public.product_variants, public.product_specifications, public.gallery_images,
  public.website_settings
to anon, authenticated;

grant insert, update, delete on
  public.categories, public.brands, public.products, public.product_images,
  public.product_variants, public.product_specifications, public.gallery_images
to authenticated;

grant update on public.website_settings to authenticated;
grant select on public.admin_users to authenticated;
grant select, update, delete on public.contact_messages to authenticated;
-- rate_limits and contact_messages inserts: service role only (server actions).

-- ---------- Row Level Security ----------

alter table public.admin_users enable row level security;
alter table public.categories enable row level security;
alter table public.brands enable row level security;
alter table public.products enable row level security;
alter table public.product_images enable row level security;
alter table public.product_variants enable row level security;
alter table public.product_specifications enable row level security;
alter table public.gallery_images enable row level security;
alter table public.website_settings enable row level security;
alter table public.contact_messages enable row level security;
alter table public.rate_limits enable row level security;

create policy "Admins read own row" on public.admin_users
  for select to authenticated using (user_id = (select auth.uid()));

create policy "Public reads visible categories" on public.categories
  for select to anon, authenticated using (is_visible or (select private.is_admin()));
create policy "Admins insert categories" on public.categories
  for insert to authenticated with check ((select private.is_admin()));
create policy "Admins update categories" on public.categories
  for update to authenticated using ((select private.is_admin())) with check ((select private.is_admin()));
create policy "Admins delete categories" on public.categories
  for delete to authenticated using ((select private.is_admin()));

create policy "Public reads visible brands" on public.brands
  for select to anon, authenticated using (is_visible or (select private.is_admin()));
create policy "Admins insert brands" on public.brands
  for insert to authenticated with check ((select private.is_admin()));
create policy "Admins update brands" on public.brands
  for update to authenticated using ((select private.is_admin())) with check ((select private.is_admin()));
create policy "Admins delete brands" on public.brands
  for delete to authenticated using ((select private.is_admin()));

create policy "Public reads published products" on public.products
  for select to anon, authenticated using (is_published or (select private.is_admin()));
create policy "Admins insert products" on public.products
  for insert to authenticated with check ((select private.is_admin()));
create policy "Admins update products" on public.products
  for update to authenticated using ((select private.is_admin())) with check ((select private.is_admin()));
create policy "Admins delete products" on public.products
  for delete to authenticated using ((select private.is_admin()));

create policy "Public reads images of published products" on public.product_images
  for select to anon, authenticated using (
    (select private.is_admin())
    or exists (select 1 from public.products p where p.id = product_id and p.is_published)
  );
create policy "Admins insert product images" on public.product_images
  for insert to authenticated with check ((select private.is_admin()));
create policy "Admins update product images" on public.product_images
  for update to authenticated using ((select private.is_admin())) with check ((select private.is_admin()));
create policy "Admins delete product images" on public.product_images
  for delete to authenticated using ((select private.is_admin()));

create policy "Public reads variants of published products" on public.product_variants
  for select to anon, authenticated using (
    (select private.is_admin())
    or exists (select 1 from public.products p where p.id = product_id and p.is_published)
  );
create policy "Admins insert product variants" on public.product_variants
  for insert to authenticated with check ((select private.is_admin()));
create policy "Admins update product variants" on public.product_variants
  for update to authenticated using ((select private.is_admin())) with check ((select private.is_admin()));
create policy "Admins delete product variants" on public.product_variants
  for delete to authenticated using ((select private.is_admin()));

create policy "Public reads specifications of published products" on public.product_specifications
  for select to anon, authenticated using (
    (select private.is_admin())
    or exists (select 1 from public.products p where p.id = product_id and p.is_published)
  );
create policy "Admins insert product specifications" on public.product_specifications
  for insert to authenticated with check ((select private.is_admin()));
create policy "Admins update product specifications" on public.product_specifications
  for update to authenticated using ((select private.is_admin())) with check ((select private.is_admin()));
create policy "Admins delete product specifications" on public.product_specifications
  for delete to authenticated using ((select private.is_admin()));

create policy "Public reads visible gallery images" on public.gallery_images
  for select to anon, authenticated using (is_visible or (select private.is_admin()));
create policy "Admins insert gallery images" on public.gallery_images
  for insert to authenticated with check ((select private.is_admin()));
create policy "Admins update gallery images" on public.gallery_images
  for update to authenticated using ((select private.is_admin())) with check ((select private.is_admin()));
create policy "Admins delete gallery images" on public.gallery_images
  for delete to authenticated using ((select private.is_admin()));

create policy "Public reads settings" on public.website_settings
  for select to anon, authenticated using (true);
create policy "Admins update settings" on public.website_settings
  for update to authenticated using ((select private.is_admin())) with check ((select private.is_admin()));

create policy "Admins read messages" on public.contact_messages
  for select to authenticated using ((select private.is_admin()));
create policy "Admins update messages" on public.contact_messages
  for update to authenticated using ((select private.is_admin())) with check ((select private.is_admin()));
create policy "Admins delete messages" on public.contact_messages
  for delete to authenticated using ((select private.is_admin()));

-- rate_limits: RLS on with no policies, so only the service role can touch it.

-- ---------- Storage ----------

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'media', 'media', true, 5242880,
  array['image/jpeg', 'image/png', 'image/webp', 'image/avif']
)
on conflict (id) do nothing;

create policy "Admins read media objects" on storage.objects
  for select to authenticated using (bucket_id = 'media' and (select private.is_admin()));
create policy "Admins upload media objects" on storage.objects
  for insert to authenticated with check (bucket_id = 'media' and (select private.is_admin()));
create policy "Admins update media objects" on storage.objects
  for update to authenticated using (bucket_id = 'media' and (select private.is_admin()))
  with check (bucket_id = 'media' and (select private.is_admin()));
create policy "Admins delete media objects" on storage.objects
  for delete to authenticated using (bucket_id = 'media' and (select private.is_admin()));

-- ---------- Default settings row ----------

insert into public.website_settings (id, store_name_ar, store_name_en)
values (1, 'مكتبة أسماء النموذجية', 'Asmaa Model Stationery');
