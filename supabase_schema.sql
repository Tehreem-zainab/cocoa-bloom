-- ============================================================
-- Cocoa Bloom — Supabase Schema
-- Run this entire file in: Supabase Dashboard → SQL Editor → New Query
-- ============================================================

-- ── 1. PRODUCTS ─────────────────────────────────────────────
create table if not exists public.products (
  id            text primary key default gen_random_uuid()::text,
  slug          text not null unique,
  name          text not null,
  description   text not null default '',
  short_description text not null default '',
  price         numeric(10,2) not null default 0,
  compare_at_price numeric(10,2),
  images        text[] not null default '{}',
  category      text not null default 'bar'
                  check (category in ('bar','truffle','bonbon','gift-set')),
  flavor_map    jsonb not null default '{"intensity":5,"sweetness":5,"bitterness":5,"fruitiness":5,"nuttiness":5}',
  tasting_notes text[] not null default '{}',
  ingredients   text not null default '',
  allergens     text[] not null default '{}',
  pairings      text[] not null default '{}',
  cold_chain_required boolean not null default false,
  max_transit_hours   integer not null default 120,
  gift_wrappable      boolean not null default true,
  is_truffle          boolean not null default false,
  seasonal            boolean not null default false,
  in_stock            boolean not null default true,
  stock_level   text not null default 'high'
                  check (stock_level in ('high','low','out')),
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- Auto-update updated_at
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end $$;

drop trigger if exists products_updated_at on public.products;
create trigger products_updated_at
  before update on public.products
  for each row execute function public.set_updated_at();

-- ── 2. ORDERS ────────────────────────────────────────────────
create table if not exists public.orders (
  id            text primary key,  -- e.g. CB-2026-00142
  customer_name text not null,
  email         text not null,
  address_line1 text not null default '',
  address_line2 text not null default '',
  city          text not null default '',
  province      text not null default '',
  postal_code   text not null default '',
  country       text not null default 'PK',
  items         jsonb not null default '[]',
  subtotal      numeric(10,2) not null default 0,
  shipping_cost numeric(10,2) not null default 0,
  gift_wrap_total numeric(10,2) not null default 0,
  total         numeric(10,2) not null default 0,
  status        text not null default 'pending'
                  check (status in ('pending','processing','shipped','delivered','cancelled')),
  payment_method text not null default 'cod',
  notes         text not null default '',
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

drop trigger if exists orders_updated_at on public.orders;
create trigger orders_updated_at
  before update on public.orders
  for each row execute function public.set_updated_at();

-- ── 3. CATEGORIES ────────────────────────────────────────────
create table if not exists public.categories (
  id          text primary key default gen_random_uuid()::text,
  name        text not null,
  slug        text not null unique,
  description text not null default '',
  sort_order  integer not null default 0,
  created_at  timestamptz not null default now()
);

-- Seed default categories
insert into public.categories (name, slug, description, sort_order) values
  ('Bars',                   'bar',        'Single-origin chocolate bars',          1),
  ('Truffles',               'truffle',    'Hand-rolled chocolate truffles',        2),
  ('Bonbons',                'bonbon',     'Filled chocolate bonbons',              3),
  ('Gift Sets',              'gift-set',   'Curated gift box collections',          4),
  ('Seasonal Limited Edition','seasonal',  'Limited edition seasonal specials',     5),
  ('Gift Box Guide',         'gift-guide', 'Curated gift giving collections',       6)
on conflict (slug) do nothing;

-- ── 4. HOMEPAGE CONFIG ───────────────────────────────────────
create table if not exists public.homepage_config (
  id                    integer primary key default 1,  -- singleton row
  banner_headline       text not null default 'From Beans to Luxury',
  banner_subtitle       text not null default 'Discover the finest artisanal chocolate',
  banner_cta            text not null default 'Explore Collection',
  featured_product_ids  text[] not null default '{}',
  announcement_bar      text not null default 'Free shipping on orders over Rs 5,000',
  announcement_enabled  boolean not null default true,
  updated_at            timestamptz not null default now(),
  constraint single_row check (id = 1)
);

-- Seed the singleton row
insert into public.homepage_config (id) values (1) on conflict (id) do nothing;

-- ── 5. REVIEWS (linked to products) ─────────────────────────
create table if not exists public.reviews (
  id         text primary key default gen_random_uuid()::text,
  product_id text not null references public.products(id) on delete cascade,
  author     text not null,
  rating     integer not null check (rating between 1 and 5),
  title      text not null default '',
  body       text not null default '',
  verified   boolean not null default false,
  created_at timestamptz not null default now()
);

-- ── 6. ROW LEVEL SECURITY ────────────────────────────────────
-- Allow public read on products, categories, reviews, homepage_config
-- (storefront reads them). Allow all operations with the anon key for
-- simplicity — tighten with Supabase Auth later if needed.

alter table public.products         enable row level security;
alter table public.orders           enable row level security;
alter table public.categories       enable row level security;
alter table public.homepage_config  enable row level security;
alter table public.reviews          enable row level security;

-- Public read policies
create policy "public read products"        on public.products        for select using (true);
create policy "public read categories"      on public.categories      for select using (true);
create policy "public read homepage_config" on public.homepage_config for select using (true);
create policy "public read reviews"         on public.reviews         for select using (true);

-- Admin write policies (anon key — all operations allowed)
create policy "anon all products"        on public.products        for all using (true) with check (true);
create policy "anon all orders"          on public.orders          for all using (true) with check (true);
create policy "anon all categories"      on public.categories      for all using (true) with check (true);
create policy "anon all homepage_config" on public.homepage_config for all using (true) with check (true);
create policy "anon all reviews"         on public.reviews         for all using (true) with check (true);

-- ── 7. STORAGE BUCKET (run separately if needed) ─────────────
-- If the bucket doesn't exist yet, create it via:
--   Supabase Dashboard → Storage → New Bucket
--   Name: product-images
--   Public: YES (tick "Public bucket")
-- Or run:
-- insert into storage.buckets (id, name, public) values ('product-images','product-images',true) on conflict do nothing;
