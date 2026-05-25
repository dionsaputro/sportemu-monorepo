-- 001 — Roles & Profiles

create type user_role as enum ('admin', 'trainer');

create table profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  role        user_role not null,
  full_name   text not null,
  phone       text,
  avatar_url  text,
  fcm_token   text,
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);

-- Trigger: auto-create profile on signup
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into profiles (id, role, full_name)
  values (
    new.id,
    coalesce((new.raw_user_meta_data->>'role')::user_role, 'trainer'),
    coalesce(new.raw_user_meta_data->>'full_name', new.email)
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();
