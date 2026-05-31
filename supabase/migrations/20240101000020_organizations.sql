-- 020 — Organizations (Multi-trainer for Enterprise)
-- An organization groups multiple trainers under one billing account.

create table organizations (
  id              uuid primary key default gen_random_uuid(),
  name            text not null,
  slug            text unique not null,
  owner_id        uuid not null references trainers(id) on delete cascade,
  logo_url        text,
  is_active       boolean default true,
  created_at      timestamptz default now(),
  updated_at      timestamptz default now()
);

-- Organization members (trainers that belong to an org)
create type org_member_role as enum ('owner', 'admin', 'trainer');

create table organization_members (
  id              uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  trainer_id      uuid not null references trainers(id) on delete cascade,
  role            org_member_role not null default 'trainer',
  invited_at      timestamptz default now(),
  joined_at       timestamptz,
  is_active       boolean default true,
  unique(organization_id, trainer_id)
);

-- Link subscription to organization (enterprise plan covers all members)
alter table trainer_subscriptions add column organization_id uuid references organizations(id);

-- Add organization_id to trainers for quick lookup
alter table trainers add column organization_id uuid references organizations(id);

-- RLS
alter table organizations enable row level security;
create policy "Admin full access orgs" on organizations for all using (is_admin());
create policy "Owner manage own org" on organizations for all using (owner_id = auth.uid());
create policy "Members read own org" on organizations for select
  using (id in (select organization_id from organization_members where trainer_id = auth.uid()));

alter table organization_members enable row level security;
create policy "Admin full access org_members" on organization_members for all using (is_admin());
create policy "Org owner manage members" on organization_members for all
  using (organization_id in (select id from organizations where owner_id = auth.uid()));
create policy "Member read own membership" on organization_members for select
  using (trainer_id = auth.uid());

-- Org owner can see all data from org members
-- This enables the "overview" dashboard for enterprise owners
create or replace function get_org_trainer_ids(p_org_id uuid)
returns setof uuid as $$
  select trainer_id from organization_members
  where organization_id = p_org_id and is_active = true;
$$ language sql security definer;
