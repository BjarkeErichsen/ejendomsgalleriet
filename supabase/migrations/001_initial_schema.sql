-- Enable UUID extension
create extension if not exists "pgcrypto";

-- ============================================
-- PROFILES TABLE
-- ============================================
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  full_name text not null default '',
  company text,
  phone text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============================================
-- LISTINGS TABLE
-- ============================================
create table if not exists public.listings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  status text not null default 'draft' check (status in ('draft', 'published')),
  transaction_type text not null check (transaction_type in ('leje', 'salg', 'investering')),
  primary_usage text not null,
  title text,
  description text not null default '',
  address_street text not null default '',
  address_postal_code text not null default '',
  address_city text not null default '',
  region text not null default '',
  latitude float8,
  longitude float8,
  primary_area_m2 integer,
  secondary_area_m2 integer,
  plot_area_m2 integer,
  monthly_rent_dkk integer,
  annual_rent_dkk integer,
  deposit_months integer,
  deposit_dkk integer,
  operating_costs_monthly integer,
  operating_costs_annual integer,
  prepaid_consumption_monthly integer,
  prepaid_consumption_annual integer,
  transfer_fee_dkk integer,
  sale_price_dkk integer,
  price_per_m2_dkk integer,
  yield_percent numeric(5,2),
  annual_rental_income integer,
  energy_label text,
  is_listed_building boolean not null default false,
  handover_condition text,
  vacating_condition text,
  notice_period_months integer,
  notice_period_years integer,
  non_cancellation_months integer,
  non_cancellation_years integer,
  sublease_right boolean,
  transfer_right boolean,
  rent_adjustment text,
  rent_adjustment_percent numeric(5,2),
  maintenance_note text,
  external_link text,
  internal_case_number text,
  video_url text,
  contact_name text not null default '',
  contact_email text not null default '',
  contact_phone text not null default '',
  contact_company text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============================================
-- LISTING FACILITIES TABLE
-- ============================================
create table if not exists public.listing_facilities (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid references public.listings(id) on delete cascade not null,
  facility text not null
);

-- ============================================
-- LISTING IMAGES TABLE
-- ============================================
create table if not exists public.listing_images (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid references public.listings(id) on delete cascade not null,
  storage_path text not null,
  url text not null,
  type text not null default 'photo' check (type in ('photo', 'floorplan')),
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

-- ============================================
-- LISTING DOCUMENTS TABLE
-- ============================================
create table if not exists public.listing_documents (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid references public.listings(id) on delete cascade not null,
  storage_path text not null,
  url text not null,
  filename text not null,
  file_type text not null default 'prospekt',
  created_at timestamptz not null default now()
);

-- ============================================
-- INDEXES
-- ============================================
create index if not exists idx_listings_user_id on public.listings(user_id);
create index if not exists idx_listings_status on public.listings(status);
create index if not exists idx_listings_transaction_type on public.listings(transaction_type);
create index if not exists idx_listings_primary_usage on public.listings(primary_usage);
create index if not exists idx_listings_region on public.listings(region);
create index if not exists idx_listings_created_at on public.listings(created_at desc);
create index if not exists idx_listing_facilities_listing_id on public.listing_facilities(listing_id);
create index if not exists idx_listing_images_listing_id on public.listing_images(listing_id);
create index if not exists idx_listing_documents_listing_id on public.listing_documents(listing_id);

-- ============================================
-- UPDATED_AT TRIGGER FUNCTION
-- ============================================
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger on_listings_updated
  before update on public.listings
  for each row execute function public.handle_updated_at();

create trigger on_profiles_updated
  before update on public.profiles
  for each row execute function public.handle_updated_at();

-- ============================================
-- AUTO-CREATE PROFILE ON SIGNUP
-- ============================================
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name', ''));
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================
alter table public.profiles enable row level security;
alter table public.listings enable row level security;
alter table public.listing_facilities enable row level security;
alter table public.listing_images enable row level security;
alter table public.listing_documents enable row level security;

-- Profiles: anyone can read, users can update own
create policy "Profiles are viewable by everyone"
  on public.profiles for select
  using (true);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- Listings: anyone can read published, owners can CRUD
create policy "Published listings are viewable by everyone"
  on public.listings for select
  using (status = 'published' or auth.uid() = user_id);

create policy "Users can insert own listings"
  on public.listings for insert
  with check (auth.uid() = user_id);

create policy "Users can update own listings"
  on public.listings for update
  using (auth.uid() = user_id);

create policy "Users can delete own listings"
  on public.listings for delete
  using (auth.uid() = user_id);

-- Listing facilities
create policy "Listing facilities are viewable by everyone"
  on public.listing_facilities for select
  using (true);

create policy "Users can insert listing facilities"
  on public.listing_facilities for insert
  with check (
    exists (
      select 1 from public.listings
      where id = listing_id and user_id = auth.uid()
    )
  );

create policy "Users can delete listing facilities"
  on public.listing_facilities for delete
  using (
    exists (
      select 1 from public.listings
      where id = listing_id and user_id = auth.uid()
    )
  );

-- Listing images
create policy "Listing images are viewable by everyone"
  on public.listing_images for select
  using (true);

create policy "Users can insert listing images"
  on public.listing_images for insert
  with check (
    exists (
      select 1 from public.listings
      where id = listing_id and user_id = auth.uid()
    )
  );

create policy "Users can delete listing images"
  on public.listing_images for delete
  using (
    exists (
      select 1 from public.listings
      where id = listing_id and user_id = auth.uid()
    )
  );

-- Listing documents
create policy "Listing documents are viewable by everyone"
  on public.listing_documents for select
  using (true);

create policy "Users can insert listing documents"
  on public.listing_documents for insert
  with check (
    exists (
      select 1 from public.listings
      where id = listing_id and user_id = auth.uid()
    )
  );

create policy "Users can delete listing documents"
  on public.listing_documents for delete
  using (
    exists (
      select 1 from public.listings
      where id = listing_id and user_id = auth.uid()
    )
  );

-- ============================================
-- STORAGE BUCKETS
-- ============================================
insert into storage.buckets (id, name, public)
values ('listing-images', 'listing-images', true)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('listing-documents', 'listing-documents', true)
on conflict (id) do nothing;

-- Storage policies
create policy "Anyone can view listing images"
  on storage.objects for select
  using (bucket_id = 'listing-images');

create policy "Authenticated users can upload listing images"
  on storage.objects for insert
  with check (bucket_id = 'listing-images' and auth.role() = 'authenticated');

create policy "Users can delete own listing images"
  on storage.objects for delete
  using (bucket_id = 'listing-images' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "Anyone can view listing documents"
  on storage.objects for select
  using (bucket_id = 'listing-documents');

create policy "Authenticated users can upload listing documents"
  on storage.objects for insert
  with check (bucket_id = 'listing-documents' and auth.role() = 'authenticated');

create policy "Users can delete own listing documents"
  on storage.objects for delete
  using (bucket_id = 'listing-documents' and auth.uid()::text = (storage.foldername(name))[1]);
