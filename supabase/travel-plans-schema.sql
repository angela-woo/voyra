create table travel_plans (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  city text not null,
  country text not null,
  country_code text,
  days int not null,
  travel_type text not null,
  theme text,
  title text not null,
  meta_description text,
  overview jsonb,
  days_data jsonb,
  cover_image_url text,
  views_count int default 0,
  published boolean default true,
  created_at timestamptz default now()
);

create policy "public read travel_plans"
on travel_plans for select using (true);
alter table travel_plans enable row level security;
