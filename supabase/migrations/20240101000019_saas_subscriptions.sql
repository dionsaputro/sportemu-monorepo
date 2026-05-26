-- 019 — SaaS Subscription Model

-- Subscription plans (managed by admin)
create table subscription_plans (
  id              uuid primary key default gen_random_uuid(),
  name            text not null,
  slug            text unique not null,
  max_clients     int not null default 5,
  max_sessions_per_month int not null default 20,
  price_monthly   numeric(12,2) not null default 0,
  is_free         boolean default false,
  is_active       boolean default true,
  features        jsonb default '[]',
  created_at      timestamptz default now()
);

-- Seed default plans
insert into subscription_plans (name, slug, max_clients, max_sessions_per_month, price_monthly, is_free) values
  ('Free', 'free', 5, 20, 0, true),
  ('Pro', 'pro', 50, 500, 199000, false),
  ('Enterprise', 'enterprise', -1, -1, 499000, false); -- -1 = unlimited

-- Trainer subscriptions
create type subscription_status as enum ('free', 'active', 'expired', 'cancelled');

create table trainer_subscriptions (
  id              uuid primary key default gen_random_uuid(),
  trainer_id      uuid not null references trainers(id) on delete cascade,
  plan_id         uuid not null references subscription_plans(id),
  status          subscription_status not null default 'free',
  started_at      timestamptz default now(),
  expires_at      timestamptz,
  cancelled_at    timestamptz,
  notes           text,
  created_at      timestamptz default now(),
  updated_at      timestamptz default now()
);

-- Each trainer has exactly one active subscription
create unique index idx_trainer_active_sub on trainer_subscriptions(trainer_id) where status in ('free', 'active');

-- Auto-create free subscription when trainer is created
create or replace function auto_create_subscription()
returns trigger as $$
declare
  free_plan_id uuid;
begin
  select id into free_plan_id from subscription_plans where is_free = true limit 1;
  if free_plan_id is not null then
    insert into trainer_subscriptions (trainer_id, plan_id, status)
    values (new.id, free_plan_id, 'free');
  end if;
  return new;
end;
$$ language plpgsql security definer;

create trigger on_trainer_created_subscription
  after insert on trainers
  for each row execute function auto_create_subscription();

-- RLS
alter table subscription_plans enable row level security;
create policy "Anyone can read plans" on subscription_plans for select using (true);
create policy "Admin manage plans" on subscription_plans for all using (is_admin());

alter table trainer_subscriptions enable row level security;
create policy "Admin full access subs" on trainer_subscriptions for all using (is_admin());
create policy "Trainer read own sub" on trainer_subscriptions for select using (trainer_id = auth.uid());

-- Helper function to check trainer limits
create or replace function get_trainer_limits(p_trainer_id uuid)
returns table(max_clients int, max_sessions_per_month int, plan_name text) as $$
  select sp.max_clients, sp.max_sessions_per_month, sp.name
  from trainer_subscriptions ts
  join subscription_plans sp on sp.id = ts.plan_id
  where ts.trainer_id = p_trainer_id
    and ts.status in ('free', 'active')
  limit 1;
$$ language sql security definer;
