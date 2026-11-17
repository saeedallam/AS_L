-- =============================================================================
-- مكتبة أسماء النموذجية — Showcase backend schema (rebuild)
-- Applied to project qmgcuvsphakcidoabgzl as migration 20261117172845_showcase_schema
--
-- Replaces the earlier prototype tables (admin_users, gallery_images,
-- website_settings, product_variants, product_specifications, rate_limits)
-- with the final 8-table schema. Showcase only: no orders, carts, payments
-- or shipping. Prices are optional.
--
-- Security model
--   * anon      : reads active catalogue rows + site settings, submits contact
--                 messages ONLY through public.submit_contact_message().
--   * admin     : profiles.role = 'admin'  -> everything.
--   * editor    : profiles.role = 'editor' -> catalogue + gallery + images.
--   * viewer    : profiles.role = 'viewer' (default for any new auth user)
--                 -> no admin access at all.
--   The app never needs the service-role key.
-- =============================================================================

-- ---------------------------------------------------------------------------
-- 0. Clean up the prototype schema (contained sample data only)
-- ---------------------------------------------------------------------------
drop policy if exists "Admins read media objects"   on storage.objects;
drop policy if exists "Admins upload media objects" on storage.objects;
drop policy if exists "Admins update media objects" on storage.objects;
drop policy if exists "Admins delete media objects" on storage.objects;

drop table if exists public.product_specifications cascade;
drop table if exists public.product_variants       cascade;
drop table if exists public.product_images         cascade;
drop table if exists public.products               cascade;
drop table if exists public.categories             cascade;
drop table if exists public.brands                 cascade;
drop table if exists public.gallery_images         cascade;
drop table if exists public.gallery                cascade;
drop table if exists public.website_settings       cascade;
drop table if exists public.site_settings          cascade;
drop table if exists public.contact_messages       cascade;
drop table if exists public.rate_limits            cascade;
drop table if exists public.admin_users            cascade;
drop table if exists public.profiles               cascade;
drop function if exists private.is_admin() cascade;

create schema if not exists private;
create schema if not exists extensions;
create extension if not exists pg_trgm with schema extensions;
alter extension pg_trgm set schema extensions;

revoke all on schema private from public, anon, authenticated;
grant usage on schema private to anon, authenticated;

create or replace function private.set_updated_at()
returns trigger language plpgsql set search_path = '' as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- 1. profiles
-- ---------------------------------------------------------------------------
create table public.profiles (
  id          uuid primary key references auth.users (id) on delete cascade,
  full_name   text not null default '' check (char_length(full_name) <= 120),
  email       text not null unique check (char_length(email) <= 254),
  role        text not null default 'viewer' check (role in ('admin', 'editor', 'viewer')),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- Role helpers (security definer so policies can read profiles without recursion)
create or replace function private.current_role_name()
returns text language sql stable security definer set search_path = '' as $$
  select role from public.profiles where id = (select auth.uid());
$$;

create or replace function private.is_admin()
returns boolean language sql stable security definer set search_path = '' as $$
  select coalesce((select private.current_role_name()) = 'admin', false);
$$;

create or replace function private.is_editor()
returns boolean language sql stable security definer set search_path = '' as $$
  select coalesce((select private.current_role_name()) in ('admin', 'editor'), false);
$$;

revoke all on function private.current_role_name() from public;
revoke all on function private.is_admin()  from public;
revoke all on function private.is_editor() from public;
grant execute on function private.current_role_name() to authenticated;
grant execute on function private.is_admin()  to anon, authenticated;
grant execute on function private.is_editor() to anon, authenticated;

-- Every new auth user gets a 'viewer' profile (no access). Promotion to admin
-- is done manually in SQL — there is no public admin registration.
create or replace function private.handle_new_user()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  insert into public.profiles (id, email, full_name, role)
  values (
    new.id,
    coalesce(new.email, new.id::text),
    coalesce(new.raw_user_meta_data ->> 'full_name', ''),
    'viewer'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function private.handle_new_user();

-- Backfill profiles for any users that already exist
insert into public.profiles (id, email, role)
select id, coalesce(email, id::text), 'viewer' from auth.users
on conflict (id) do nothing;

-- ---------------------------------------------------------------------------
-- 2. categories
-- ---------------------------------------------------------------------------
create table public.categories (
  id             uuid primary key default gen_random_uuid(),
  name_ar        text not null check (char_length(btrim(name_ar)) between 2 and 120),
  name_en        text check (name_en is null or char_length(name_en) <= 120),
  slug           text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$' and char_length(slug) <= 80),
  description    text not null default '' check (char_length(description) <= 1000),
  description_en text not null default '' check (char_length(description_en) <= 1000),
  image_url      text not null default '' check (char_length(image_url) <= 1000),
  is_active      boolean not null default true,
  display_order  integer not null default 0 check (display_order between 0 and 100000),
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- 3. brands
-- ---------------------------------------------------------------------------
create table public.brands (
  id          uuid primary key default gen_random_uuid(),
  name        text not null check (char_length(btrim(name)) between 1 and 120),
  name_en     text check (name_en is null or char_length(name_en) <= 120),
  slug        text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$' and char_length(slug) <= 80),
  description text not null default '' check (char_length(description) <= 1000),
  logo_url    text not null default '' check (char_length(logo_url) <= 1000),
  website_url text check (website_url is null or website_url = '' or website_url ~* '^https?://'),
  is_active   boolean not null default true,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- 4. products  (showcase: prices optional)
-- ---------------------------------------------------------------------------
create table public.products (
  id                   uuid primary key default gen_random_uuid(),
  name_ar              text not null check (char_length(btrim(name_ar)) between 2 and 200),
  name_en              text check (name_en is null or char_length(name_en) <= 200),
  slug                 text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$' and char_length(slug) <= 120),
  short_description    text not null default '' check (char_length(short_description) <= 500),
  short_description_en text not null default '' check (char_length(short_description_en) <= 500),
  description          text not null default '' check (char_length(description) <= 5000),
  description_en       text not null default '' check (char_length(description_en) <= 5000),
  category_id          uuid references public.categories (id) on delete set null,
  brand_id             uuid references public.brands (id) on delete set null,
  age_stage            text check (age_stage is null or age_stage in ('primary', 'preparatory', 'secondary')),
  price                numeric(10, 2) check (price is null or price >= 0),
  sale_price           numeric(10, 2) check (sale_price is null or sale_price >= 0),
  sku                  text unique check (sku is null or char_length(btrim(sku)) between 1 and 64),
  specifications       jsonb not null default '[]'::jsonb check (jsonb_typeof(specifications) = 'array'),
  variations           jsonb not null default '[]'::jsonb check (jsonb_typeof(variations) = 'array'),
  main_image           text not null default '' check (char_length(main_image) <= 1000),
  is_featured          boolean not null default false,
  is_active            boolean not null default true,
  seo_title            text check (seo_title is null or char_length(seo_title) <= 120),
  seo_description      text check (seo_description is null or char_length(seo_description) <= 320),
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now(),
  constraint sale_price_requires_price check (sale_price is null or price is not null),
  constraint sale_price_below_price   check (sale_price is null or sale_price <= price)
);

-- ---------------------------------------------------------------------------
-- 5. product_images
-- ---------------------------------------------------------------------------
create table public.product_images (
  id            uuid primary key default gen_random_uuid(),
  product_id    uuid not null references public.products (id) on delete cascade,
  image_url     text not null check (char_length(btrim(image_url)) between 1 and 1000),
  alt_text      text not null default '' check (char_length(alt_text) <= 200),
  display_order integer not null default 0 check (display_order between 0 and 100000),
  created_at    timestamptz not null default now(),
  unique (product_id, image_url)
);

-- ---------------------------------------------------------------------------
-- 6. gallery
-- ---------------------------------------------------------------------------
create table public.gallery (
  id             uuid primary key default gen_random_uuid(),
  title          text not null check (char_length(btrim(title)) between 1 and 200),
  title_en       text not null default '' check (char_length(title_en) <= 200),
  image_url      text not null check (char_length(btrim(image_url)) between 1 and 1000),
  description    text not null default '' check (char_length(description) <= 1000),
  display_order  integer not null default 0 check (display_order between 0 and 100000),
  is_active      boolean not null default true,
  created_at     timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- 7. contact_messages  (private)
-- ---------------------------------------------------------------------------
create table public.contact_messages (
  id          uuid primary key default gen_random_uuid(),
  name        text not null check (char_length(btrim(name)) between 2 and 100),
  phone       text not null check (phone ~ '^\+?[0-9 ()-]{6,25}$'),
  email       text check (email is null or (char_length(email) <= 254 and email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$')),
  message     text not null check (char_length(btrim(message)) between 5 and 2000),
  is_read     boolean not null default false,
  ip_hash     text check (ip_hash is null or ip_hash ~ '^[a-f0-9]{16,64}$'),
  created_at  timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- 8. site_settings  (key/value, all values are public website info)
-- ---------------------------------------------------------------------------
create table public.site_settings (
  id            uuid primary key default gen_random_uuid(),
  setting_key   text not null unique check (setting_key ~ '^[a-z][a-z0-9_]{1,63}$'),
  setting_value text not null default '' check (char_length(setting_value) <= 2000),
  updated_at    timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Indexes
-- ---------------------------------------------------------------------------
create index idx_categories_active_order on public.categories (is_active, display_order);
create index idx_brands_active_name      on public.brands (is_active, name);
create index idx_products_active_created on public.products (is_active, created_at desc);
create index idx_products_featured       on public.products (created_at desc) where is_active and is_featured;
create index idx_products_category       on public.products (category_id);
create index idx_products_brand          on public.products (brand_id);
create index idx_products_age_stage      on public.products (age_stage);
create index idx_products_name_ar_trgm   on public.products using gin (name_ar extensions.gin_trgm_ops);
create index idx_products_name_en_trgm   on public.products using gin (name_en extensions.gin_trgm_ops);
create index idx_product_images_product  on public.product_images (product_id, display_order);
create index idx_gallery_active_order    on public.gallery (is_active, display_order);
create index idx_messages_created        on public.contact_messages (created_at desc);
create index idx_messages_unread         on public.contact_messages (created_at desc) where not is_read;
create index idx_messages_ip_created     on public.contact_messages (ip_hash, created_at desc);

-- ---------------------------------------------------------------------------
-- updated_at triggers
-- ---------------------------------------------------------------------------
create trigger trg_profiles_updated_at   before update on public.profiles      for each row execute function private.set_updated_at();
create trigger trg_categories_updated_at before update on public.categories    for each row execute function private.set_updated_at();
create trigger trg_brands_updated_at     before update on public.brands        for each row execute function private.set_updated_at();
create trigger trg_products_updated_at   before update on public.products      for each row execute function private.set_updated_at();
create trigger trg_settings_updated_at   before update on public.site_settings for each row execute function private.set_updated_at();

-- Users may not change their own role (only an admin may, and never via self-edit)
create or replace function private.protect_profile_role()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  -- Direct SQL (SQL editor / migrations) has no auth.uid(): allowed, that is
  -- how the first admin is promoted. API users never get here without RLS.
  if (select auth.uid()) is null then
    return new;
  end if;
  if new.role is distinct from old.role and not (select private.is_admin()) then
    raise exception 'Only an administrator can change roles' using errcode = '42501';
  end if;
  if new.id = (select auth.uid()) and new.role is distinct from old.role then
    raise exception 'Administrators cannot change their own role' using errcode = '42501';
  end if;
  return new;
end;
$$;
create trigger trg_profiles_protect_role before update on public.profiles
  for each row execute function private.protect_profile_role();

-- ---------------------------------------------------------------------------
-- Grants (least privilege; RLS still applies on top)
-- ---------------------------------------------------------------------------
revoke all on public.profiles, public.categories, public.brands, public.products,
  public.product_images, public.gallery, public.contact_messages, public.site_settings
  from anon, authenticated;

grant select on public.categories, public.brands, public.products,
  public.product_images, public.gallery, public.site_settings to anon, authenticated;

grant insert, update, delete on public.categories, public.brands, public.products,
  public.product_images, public.gallery, public.site_settings to authenticated;
grant select, update, delete on public.contact_messages to authenticated;
grant select, update on public.profiles to authenticated;
-- NOTE: no INSERT grant on contact_messages for anyone; the only write path
-- is public.submit_contact_message() below.

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------
alter table public.profiles         enable row level security;
alter table public.categories       enable row level security;
alter table public.brands           enable row level security;
alter table public.products         enable row level security;
alter table public.product_images   enable row level security;
alter table public.gallery          enable row level security;
alter table public.contact_messages enable row level security;
alter table public.site_settings    enable row level security;

-- profiles
create policy "profiles: read own or admin" on public.profiles
  for select to authenticated
  using (id = (select auth.uid()) or (select private.is_admin()));
create policy "profiles: admin updates" on public.profiles
  for update to authenticated
  using ((select private.is_admin())) with check ((select private.is_admin()));

-- categories
create policy "categories: public reads active" on public.categories
  for select to anon, authenticated
  using (is_active or (select private.is_editor()));
create policy "categories: editors insert" on public.categories
  for insert to authenticated with check ((select private.is_editor()));
create policy "categories: editors update" on public.categories
  for update to authenticated using ((select private.is_editor())) with check ((select private.is_editor()));
create policy "categories: editors delete" on public.categories
  for delete to authenticated using ((select private.is_editor()));

-- brands
create policy "brands: public reads active" on public.brands
  for select to anon, authenticated
  using (is_active or (select private.is_editor()));
create policy "brands: editors insert" on public.brands
  for insert to authenticated with check ((select private.is_editor()));
create policy "brands: editors update" on public.brands
  for update to authenticated using ((select private.is_editor())) with check ((select private.is_editor()));
create policy "brands: editors delete" on public.brands
  for delete to authenticated using ((select private.is_editor()));

-- products
create policy "products: public reads active" on public.products
  for select to anon, authenticated
  using (is_active or (select private.is_editor()));
create policy "products: editors insert" on public.products
  for insert to authenticated with check ((select private.is_editor()));
create policy "products: editors update" on public.products
  for update to authenticated using ((select private.is_editor())) with check ((select private.is_editor()));
create policy "products: editors delete" on public.products
  for delete to authenticated using ((select private.is_editor()));

-- product_images (visible only when the parent product is visible)
create policy "product_images: public reads for active products" on public.product_images
  for select to anon, authenticated
  using (
    (select private.is_editor())
    or exists (select 1 from public.products p where p.id = product_id and p.is_active)
  );
create policy "product_images: editors insert" on public.product_images
  for insert to authenticated with check ((select private.is_editor()));
create policy "product_images: editors update" on public.product_images
  for update to authenticated using ((select private.is_editor())) with check ((select private.is_editor()));
create policy "product_images: editors delete" on public.product_images
  for delete to authenticated using ((select private.is_editor()));

-- gallery
create policy "gallery: public reads active" on public.gallery
  for select to anon, authenticated
  using (is_active or (select private.is_editor()));
create policy "gallery: editors insert" on public.gallery
  for insert to authenticated with check ((select private.is_editor()));
create policy "gallery: editors update" on public.gallery
  for update to authenticated using ((select private.is_editor())) with check ((select private.is_editor()));
create policy "gallery: editors delete" on public.gallery
  for delete to authenticated using ((select private.is_editor()));

-- contact_messages: admins only (read / mark read / delete). No insert policy.
create policy "contact_messages: admins read" on public.contact_messages
  for select to authenticated using ((select private.is_admin()));
create policy "contact_messages: admins update" on public.contact_messages
  for update to authenticated using ((select private.is_admin())) with check ((select private.is_admin()));
create policy "contact_messages: admins delete" on public.contact_messages
  for delete to authenticated using ((select private.is_admin()));

-- site_settings: public website info; admins only may change it
create policy "site_settings: public reads" on public.site_settings
  for select to anon, authenticated using (true);
create policy "site_settings: admins insert" on public.site_settings
  for insert to authenticated with check ((select private.is_admin()));
create policy "site_settings: admins update" on public.site_settings
  for update to authenticated using ((select private.is_admin())) with check ((select private.is_admin()));
create policy "site_settings: admins delete" on public.site_settings
  for delete to authenticated using ((select private.is_admin()));

-- ---------------------------------------------------------------------------
-- Contact form: the single public write path, rate limited in the database
-- ---------------------------------------------------------------------------
create or replace function public.submit_contact_message(
  p_name text, p_phone text, p_email text, p_message text, p_ip_hash text
) returns uuid
language plpgsql security definer set search_path = '' as $$
declare
  v_id uuid;
  v_name text := btrim(coalesce(p_name, ''));
  v_phone text := btrim(coalesce(p_phone, ''));
  v_email text := nullif(lower(btrim(coalesce(p_email, ''))), '');
  v_message text := btrim(coalesce(p_message, ''));
  v_ip text := nullif(lower(btrim(coalesce(p_ip_hash, ''))), '');
begin
  -- Per-client limit: 3 messages per 10 minutes, 10 per day
  if v_ip is not null then
    if (select count(*) from public.contact_messages
        where ip_hash = v_ip and created_at > now() - interval '10 minutes') >= 3
       or (select count(*) from public.contact_messages
        where ip_hash = v_ip and created_at > now() - interval '1 day') >= 10 then
      raise exception 'rate_limited' using errcode = 'P0001';
    end if;
  end if;

  -- Same phone + same text within 24 h is treated as a duplicate
  if exists (select 1 from public.contact_messages
             where phone = v_phone and message = v_message
               and created_at > now() - interval '1 day') then
    raise exception 'duplicate' using errcode = 'P0001';
  end if;

  -- Global flood guard (protects the inbox even if the ip hash is spoofed)
  if (select count(*) from public.contact_messages
      where created_at > now() - interval '1 hour') >= 60 then
    raise exception 'rate_limited' using errcode = 'P0001';
  end if;

  insert into public.contact_messages (name, phone, email, message, ip_hash)
  values (v_name, v_phone, v_email, v_message, v_ip)
  returning id into v_id;   -- column CHECK constraints validate every field

  return v_id;
end;
$$;

revoke all on function public.submit_contact_message(text, text, text, text, text) from public;
grant execute on function public.submit_contact_message(text, text, text, text, text) to anon, authenticated;

-- ---------------------------------------------------------------------------
-- Storage: 4 public-read buckets, writes restricted to editors/admins
-- (Public buckets serve files by URL; no SELECT policy for anon, so the
--  bucket contents cannot be listed by visitors.)
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('product-images',  'product-images',  true, 5242880, array['image/jpeg','image/png','image/webp','image/avif']),
  ('category-images', 'category-images', true, 5242880, array['image/jpeg','image/png','image/webp','image/avif']),
  ('brand-logos',     'brand-logos',     true, 5242880, array['image/jpeg','image/png','image/webp','image/avif']),
  ('gallery-images',  'gallery-images',  true, 5242880, array['image/jpeg','image/png','image/webp','image/avif'])
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "showcase: editors read objects"   on storage.objects;
drop policy if exists "showcase: editors upload objects" on storage.objects;
drop policy if exists "showcase: editors update objects" on storage.objects;
drop policy if exists "showcase: editors delete objects" on storage.objects;

create policy "showcase: editors read objects" on storage.objects
  for select to authenticated
  using (bucket_id in ('product-images','category-images','brand-logos','gallery-images')
         and (select private.is_editor()));
create policy "showcase: editors upload objects" on storage.objects
  for insert to authenticated
  with check (bucket_id in ('product-images','category-images','brand-logos','gallery-images')
              and (select private.is_editor()));
create policy "showcase: editors update objects" on storage.objects
  for update to authenticated
  using (bucket_id in ('product-images','category-images','brand-logos','gallery-images')
         and (select private.is_editor()))
  with check (bucket_id in ('product-images','category-images','brand-logos','gallery-images')
              and (select private.is_editor()));
create policy "showcase: editors delete objects" on storage.objects
  for delete to authenticated
  using (bucket_id in ('product-images','category-images','brand-logos','gallery-images')
         and (select private.is_editor()));

-- ---------------------------------------------------------------------------
-- Default site settings (no invented contact details: phone/WhatsApp empty)
-- ---------------------------------------------------------------------------
insert into public.site_settings (setting_key, setting_value) values
  ('store_name_ar', 'مكتبة أسماء النموذجية'),
  ('store_name_en', 'Asmaa Model Library'),
  ('logo_url', ''),
  ('phone', ''),
  ('whatsapp_number', ''),
  ('email', ''),
  ('address_ar', ''),
  ('address_en', ''),
  ('working_hours_ar', ''),
  ('working_hours_en', ''),
  ('map_url', ''),
  ('facebook_url', ''),
  ('instagram_url', ''),
  ('tiktok_url', ''),
  ('x_url', ''),
  ('youtube_url', ''),
  ('site_description_ar', 'مكتبة أسماء النموذجية — أدوات مدرسية ومكتبية وفنية. تصفّح المنتجات واستفسر عبر واتساب.'),
  ('site_description_en', 'Asmaa Model Library — school, office and art supplies. Browse products and ask us on WhatsApp.'),
  ('announcement_ar', ''),
  ('announcement_en', ''),
  ('seo_title_ar', 'مكتبة أسماء النموذجية | أدوات مدرسية ومكتبية'),
  ('seo_title_en', 'Asmaa Model Library | School & Office Supplies'),
  ('seo_description_ar', 'تصفّح منتجات مكتبة أسماء النموذجية من الأدوات المدرسية والمكتبية والفنية، واستفسر عن أي منتج عبر واتساب.'),
  ('seo_description_en', 'Browse school, office and art supplies at Asmaa Model Library and ask about any product on WhatsApp.'),
  ('seo_keywords', 'مكتبة أسماء النموذجية, Asmaa Model Library, أدوات مدرسية, أدوات مكتبية, قرطاسية'),
  ('og_image_url', ''),
  ('currency_label', ''),
  ('allow_indexing', 'true')
on conflict (setting_key) do nothing;
