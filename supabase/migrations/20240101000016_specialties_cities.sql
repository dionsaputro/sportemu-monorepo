-- 016 — Specialties & Cities (dynamic, admin-managed)

-- Specialties table
create table specialties (
  id          uuid primary key default gen_random_uuid(),
  name        text unique not null,
  is_active   boolean default true,
  created_at  timestamptz default now()
);

-- Seed initial specialties
insert into specialties (name) values ('renang'), ('yoga');

-- Trainer can have multiple specialties (many-to-many)
create table trainer_specialties (
  id            uuid primary key default gen_random_uuid(),
  trainer_id    uuid not null references trainers(id) on delete cascade,
  specialty_id  uuid not null references specialties(id) on delete cascade,
  unique(trainer_id, specialty_id)
);

-- Cities table
create table cities (
  id          uuid primary key default gen_random_uuid(),
  name        text unique not null,
  is_active   boolean default true,
  created_at  timestamptz default now()
);

-- Seed initial cities
insert into cities (name) values
  ('Jakarta Selatan'),
  ('Jakarta Pusat'),
  ('Jakarta Barat'),
  ('Jakarta Timur'),
  ('Jakarta Utara'),
  ('Tangerang'),
  ('Tangerang Selatan'),
  ('Depok'),
  ('Bekasi'),
  ('Bogor');

-- Trainer home city
alter table trainers add column home_city_id uuid references cities(id);

-- Trainer available cities (many-to-many)
create table trainer_available_cities (
  id            uuid primary key default gen_random_uuid(),
  trainer_id    uuid not null references trainers(id) on delete cascade,
  city_id       uuid not null references cities(id) on delete cascade,
  unique(trainer_id, city_id)
);

-- Customer city
alter table customers add column city_id uuid references cities(id);

-- RLS for new tables
alter table specialties enable row level security;
create policy "Anyone can read specialties" on specialties for select using (true);
create policy "Admin manage specialties" on specialties for all using (is_admin());

alter table trainer_specialties enable row level security;
create policy "Anyone can read trainer_specialties" on trainer_specialties for select using (true);
create policy "Admin manage trainer_specialties" on trainer_specialties for all using (is_admin());
create policy "Trainer manage own specialties" on trainer_specialties for all using (trainer_id = auth.uid());

alter table cities enable row level security;
create policy "Anyone can read cities" on cities for select using (true);
create policy "Admin manage cities" on cities for all using (is_admin());

alter table trainer_available_cities enable row level security;
create policy "Anyone can read trainer_available_cities" on trainer_available_cities for select using (true);
create policy "Admin manage trainer_available_cities" on trainer_available_cities for all using (is_admin());
create policy "Trainer manage own cities" on trainer_available_cities for all using (trainer_id = auth.uid());
