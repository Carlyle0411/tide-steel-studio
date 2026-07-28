-- AI IP Studio V2 core schema
-- Run this after the existing Tide Steel cloud asset setup.

create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  display_name text,
  avatar_url text,
  default_organization_id uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table if not exists public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  owner_id uuid not null references auth.users(id) on delete cascade,
  plan text not null default 'personal',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table if not exists public.organization_members (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null default 'owner' check (role in ('owner', 'admin', 'member', 'viewer')),
  status text not null default 'active' check (status in ('active', 'invited', 'disabled')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  unique (organization_id, user_id)
);

create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  owner_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  slug text,
  cover_url text,
  project_type text not null default 'ai_film',
  target_platform text,
  aspect_ratio text not null default '16:9',
  content_style text,
  description text,
  visual_standard jsonb not null default '{}'::jsonb,
  status text not null default 'active' check (status in ('active', 'archived', 'deleted')),
  favorite boolean not null default false,
  archived_at timestamptz,
  created_by uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  unique (organization_id, slug)
);

create table if not exists public.project_members (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null default 'owner' check (role in ('owner', 'admin', 'editor', 'viewer')),
  status text not null default 'active' check (status in ('active', 'invited', 'disabled')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  unique (project_id, user_id)
);

create or replace function public.is_organization_member(target_org uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.organization_members member
    where member.organization_id = target_org
      and member.user_id = auth.uid()
      and member.status = 'active'
      and member.deleted_at is null
  );
$$;

create or replace function public.is_project_member(target_project uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.project_members member
    where member.project_id = target_project
      and member.user_id = auth.uid()
      and member.status = 'active'
      and member.deleted_at is null
  );
$$;

create or replace function public.has_project_role(target_project uuid, allowed_roles text[])
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.project_members member
    where member.project_id = target_project
      and member.user_id = auth.uid()
      and member.role = any(allowed_roles)
      and member.status = 'active'
      and member.deleted_at is null
  );
$$;

create table if not exists public.ip_bibles (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  project_id uuid not null references public.projects(id) on delete cascade,
  world_rules jsonb not null default '{}'::jsonb,
  visual_rules jsonb not null default '{}'::jsonb,
  character_rules jsonb not null default '{}'::jsonb,
  scene_rules jsonb not null default '{}'::jsonb,
  forbidden_rules jsonb not null default '{}'::jsonb,
  raw_markdown text not null default '',
  created_by uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  unique (project_id)
);

create table if not exists public.asset_groups (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  project_id uuid not null references public.projects(id) on delete cascade,
  name text not null,
  group_type text not null,
  description text,
  cover_asset_id uuid,
  required_slots jsonb not null default '[]'::jsonb,
  sort_order integer not null default 0,
  created_by uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table if not exists public.assets (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  project_id uuid not null references public.projects(id) on delete cascade,
  asset_group_id uuid references public.asset_groups(id) on delete set null,
  asset_code text not null,
  name text not null,
  asset_type text not null,
  status text not null default 'draft' check (status in ('draft', 'pending_review', 'approved', 'deprecated', 'archived')),
  is_master_reference boolean not null default false,
  master_version_id uuid,
  tags text[] not null default '{}',
  consistency_fields jsonb not null default '{}'::jsonb,
  metadata jsonb not null default '{}'::jsonb,
  created_by uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  unique (project_id, asset_code)
);

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'asset_groups_cover_asset_id_fkey'
  ) then
    alter table public.asset_groups
      add constraint asset_groups_cover_asset_id_fkey
      foreign key (cover_asset_id) references public.assets(id) on delete set null;
  end if;
end $$;

do $$
begin
  if exists (
    select 1 from information_schema.tables
    where table_schema = 'public' and table_name = 'asset_versions'
  ) and not exists (
    select 1 from pg_constraint where conname = 'assets_master_version_id_fkey'
  ) then
    alter table public.assets
      add constraint assets_master_version_id_fkey
      foreign key (master_version_id) references public.asset_versions(id) on delete set null
      deferrable initially deferred;
  end if;
end $$;

create table if not exists public.asset_relations (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  project_id uuid not null references public.projects(id) on delete cascade,
  source_asset_id uuid not null references public.assets(id) on delete cascade,
  target_asset_id uuid not null references public.assets(id) on delete cascade,
  relation_type text not null,
  note text,
  created_by uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  unique (source_asset_id, target_asset_id, relation_type)
);

create table if not exists public.asset_tags (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  project_id uuid not null references public.projects(id) on delete cascade,
  name text not null,
  color text not null default '#39f4cc',
  created_by uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  unique (project_id, name)
);

create table if not exists public.prompts (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  project_id uuid not null references public.projects(id) on delete cascade,
  asset_id uuid references public.assets(id) on delete set null,
  shot_id uuid,
  name text not null,
  prompt_type text not null,
  model text,
  body text not null,
  negative_prompt text not null default '',
  variables jsonb not null default '{}'::jsonb,
  usage_count integer not null default 0,
  success_count integer not null default 0,
  created_by uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table if not exists public.prompt_versions (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  project_id uuid not null references public.projects(id) on delete cascade,
  prompt_id uuid not null references public.prompts(id) on delete cascade,
  version text not null,
  body text not null,
  negative_prompt text not null default '',
  change_reason text,
  created_by uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  unique (prompt_id, version)
);

create table if not exists public.episodes (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  project_id uuid not null references public.projects(id) on delete cascade,
  episode_code text not null,
  title text not null,
  logline text,
  synopsis text,
  status text not null default 'draft',
  sort_order integer not null default 0,
  created_by uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  unique (project_id, episode_code)
);

create table if not exists public.scenes (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  project_id uuid not null references public.projects(id) on delete cascade,
  episode_id uuid not null references public.episodes(id) on delete cascade,
  scene_code text not null,
  title text not null,
  description text,
  location text,
  time_of_day text,
  sort_order integer not null default 0,
  created_by uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  unique (episode_id, scene_code)
);

create table if not exists public.storyboards (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  project_id uuid not null references public.projects(id) on delete cascade,
  episode_id uuid references public.episodes(id) on delete cascade,
  title text not null,
  status text not null default 'draft',
  metadata jsonb not null default '{}'::jsonb,
  created_by uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table if not exists public.shots (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  project_id uuid not null references public.projects(id) on delete cascade,
  episode_id uuid references public.episodes(id) on delete cascade,
  scene_id uuid references public.scenes(id) on delete set null,
  storyboard_id uuid references public.storyboards(id) on delete set null,
  shot_code text not null,
  title text not null,
  description text,
  dialogue text,
  voice_over text,
  duration_seconds numeric(8,2),
  lens text,
  camera_angle text,
  camera_movement text,
  composition text,
  lighting text,
  emotion text,
  image_prompt text,
  video_prompt text,
  status text not null default 'draft',
  sort_order integer not null default 0,
  created_by uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  unique (project_id, shot_code)
);

alter table public.prompts
  add constraint prompts_shot_id_fkey
  foreign key (shot_id) references public.shots(id) on delete set null;

create table if not exists public.shot_assets (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  project_id uuid not null references public.projects(id) on delete cascade,
  shot_id uuid not null references public.shots(id) on delete cascade,
  asset_id uuid not null references public.assets(id) on delete cascade,
  asset_role text not null default 'reference',
  created_by uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  unique (shot_id, asset_id, asset_role)
);

create table if not exists public.reference_videos (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  project_id uuid not null references public.projects(id) on delete cascade,
  title text not null,
  source_url text,
  file_path text,
  duration_seconds numeric(8,2),
  analysis_status text not null default 'draft',
  metadata jsonb not null default '{}'::jsonb,
  created_by uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table if not exists public.video_analyses (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  project_id uuid not null references public.projects(id) on delete cascade,
  reference_video_id uuid not null references public.reference_videos(id) on delete cascade,
  shot_structure jsonb not null default '[]'::jsonb,
  rhythm_notes text,
  camera_notes text,
  reusable_rules jsonb not null default '{}'::jsonb,
  created_by uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  project_id uuid not null references public.projects(id) on delete cascade,
  parent_task_id uuid references public.tasks(id) on delete set null,
  asset_id uuid references public.assets(id) on delete set null,
  shot_id uuid references public.shots(id) on delete set null,
  task_name text not null,
  task_type text not null check (task_type in ('image_generation', 'video_generation', 'prompt_generation', 'storyboard_generation', 'consistency_check', 'export_package', 'asset_import')),
  status text not null default 'draft' check (status in ('draft', 'queued', 'processing', 'succeeded', 'failed', 'cancelled', 'pending_review', 'approved', 'rejected')),
  progress integer not null default 0 check (progress >= 0 and progress <= 100),
  input_prompt text,
  negative_prompt text,
  reference_asset_ids uuid[] not null default '{}',
  model_provider text,
  model_name text,
  model_params jsonb not null default '{}'::jsonb,
  estimated_cost numeric(12,4) not null default 0,
  actual_cost numeric(12,4) not null default 0,
  error_message text,
  attempt integer not null default 1,
  idempotency_key text,
  created_by uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  started_at timestamptz,
  completed_at timestamptz,
  cancelled_at timestamptz,
  deleted_at timestamptz
);

create unique index if not exists tasks_project_idempotency_key_idx
  on public.tasks(project_id, idempotency_key)
  where idempotency_key is not null;

create table if not exists public.task_items (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  project_id uuid not null references public.projects(id) on delete cascade,
  task_id uuid not null references public.tasks(id) on delete cascade,
  asset_id uuid references public.assets(id) on delete set null,
  shot_id uuid references public.shots(id) on delete set null,
  item_index integer not null default 0,
  status text not null default 'draft',
  progress integer not null default 0 check (progress >= 0 and progress <= 100),
  input jsonb not null default '{}'::jsonb,
  output jsonb not null default '{}'::jsonb,
  error_message text,
  created_by uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table if not exists public.generation_outputs (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  project_id uuid not null references public.projects(id) on delete cascade,
  task_id uuid not null references public.tasks(id) on delete cascade,
  task_item_id uuid references public.task_items(id) on delete set null,
  asset_id uuid references public.assets(id) on delete set null,
  asset_version_id uuid,
  output_type text not null check (output_type in ('image', 'video', 'audio', 'text', 'package')),
  file_path text,
  url text,
  status text not null default 'pending_review',
  metadata jsonb not null default '{}'::jsonb,
  created_by uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table if not exists public.consistency_checks (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  project_id uuid not null references public.projects(id) on delete cascade,
  target_type text not null,
  target_id uuid,
  check_type text not null,
  severity text not null default 'warning' check (severity in ('info', 'warning', 'error')),
  status text not null default 'warning' check (status in ('pass', 'warning', 'fail')),
  message text not null,
  field_path text,
  recommendation text,
  created_by uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table if not exists public.workflow_templates (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  project_id uuid references public.projects(id) on delete cascade,
  name text not null,
  description text,
  steps jsonb not null default '[]'::jsonb,
  created_by uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table if not exists public.workflow_runs (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  project_id uuid not null references public.projects(id) on delete cascade,
  workflow_template_id uuid references public.workflow_templates(id) on delete set null,
  name text not null,
  status text not null default 'draft',
  created_by uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table if not exists public.workflow_steps (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  project_id uuid not null references public.projects(id) on delete cascade,
  workflow_run_id uuid not null references public.workflow_runs(id) on delete cascade,
  task_id uuid references public.tasks(id) on delete set null,
  step_index integer not null,
  name text not null,
  status text not null default 'draft',
  input jsonb not null default '{}'::jsonb,
  output jsonb not null default '{}'::jsonb,
  created_by uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table if not exists public.delivery_packages (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  project_id uuid not null references public.projects(id) on delete cascade,
  name text not null,
  package_type text not null default 'asset_package',
  status text not null default 'draft',
  manifest jsonb not null default '{}'::jsonb,
  file_path text,
  created_by uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table if not exists public.delivery_items (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  project_id uuid not null references public.projects(id) on delete cascade,
  delivery_package_id uuid not null references public.delivery_packages(id) on delete cascade,
  asset_id uuid references public.assets(id) on delete set null,
  asset_version_id uuid,
  shot_id uuid references public.shots(id) on delete set null,
  item_type text not null,
  file_path text,
  metadata jsonb not null default '{}'::jsonb,
  created_by uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table if not exists public.model_providers (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid references public.organizations(id) on delete cascade,
  project_id uuid references public.projects(id) on delete cascade,
  provider_key text not null,
  display_name text not null,
  provider_type text not null,
  status text not null default 'not_configured' check (status in ('not_configured', 'configured', 'disabled')),
  config jsonb not null default '{}'::jsonb,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table if not exists public.provider_credentials (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  project_id uuid references public.projects(id) on delete cascade,
  provider_id uuid references public.model_providers(id) on delete cascade,
  credential_label text not null,
  secret_ref text not null,
  status text not null default 'configured',
  created_by uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table if not exists public.usage_records (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  project_id uuid references public.projects(id) on delete cascade,
  task_id uuid references public.tasks(id) on delete set null,
  provider_key text not null,
  model_name text,
  unit text not null,
  quantity numeric(12,4) not null default 0,
  estimated_cost numeric(12,4) not null default 0,
  actual_cost numeric(12,4) not null default 0,
  created_by uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table if not exists public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid references public.organizations(id) on delete cascade,
  project_id uuid references public.projects(id) on delete cascade,
  actor_id uuid references auth.users(id) on delete set null,
  action text not null,
  target_type text,
  target_id uuid,
  before_data jsonb,
  after_data jsonb,
  created_at timestamptz not null default now()
);

alter table if exists public.asset_versions
  add column if not exists organization_id uuid references public.organizations(id) on delete set null,
  add column if not exists project_id uuid references public.projects(id) on delete set null,
  add column if not exists asset_table_id uuid references public.assets(id) on delete set null,
  add column if not exists created_by uuid references auth.users(id) on delete set null,
  add column if not exists updated_at timestamptz not null default now(),
  add column if not exists deleted_at timestamptz,
  add column if not exists generation_task_id uuid references public.tasks(id) on delete set null;

do $$
begin
  if exists (
    select 1 from information_schema.tables
    where table_schema = 'public' and table_name = 'asset_versions'
  ) and not exists (
    select 1 from pg_constraint where conname = 'generation_outputs_asset_version_id_fkey'
  ) then
    alter table public.generation_outputs
      add constraint generation_outputs_asset_version_id_fkey
      foreign key (asset_version_id) references public.asset_versions(id) on delete set null
      deferrable initially deferred;
  end if;
end $$;

do $$
begin
  if exists (
    select 1 from information_schema.tables
    where table_schema = 'public' and table_name = 'asset_versions'
  ) and not exists (
    select 1 from pg_constraint where conname = 'delivery_items_asset_version_id_fkey'
  ) then
    alter table public.delivery_items
      add constraint delivery_items_asset_version_id_fkey
      foreign key (asset_version_id) references public.asset_versions(id) on delete set null
      deferrable initially deferred;
  end if;
end $$;

create index if not exists projects_organization_id_idx on public.projects(organization_id);
create index if not exists assets_project_id_idx on public.assets(project_id);
create index if not exists assets_group_id_idx on public.assets(asset_group_id);
create index if not exists asset_versions_project_id_idx on public.asset_versions(project_id);
create index if not exists shots_project_id_idx on public.shots(project_id);
create index if not exists tasks_project_id_status_idx on public.tasks(project_id, status);
create index if not exists generation_outputs_task_id_idx on public.generation_outputs(task_id);

alter table public.profiles enable row level security;
alter table public.organizations enable row level security;
alter table public.organization_members enable row level security;
alter table public.projects enable row level security;
alter table public.project_members enable row level security;
alter table public.ip_bibles enable row level security;
alter table public.asset_groups enable row level security;
alter table public.assets enable row level security;
alter table public.asset_relations enable row level security;
alter table public.asset_tags enable row level security;
alter table public.prompts enable row level security;
alter table public.prompt_versions enable row level security;
alter table public.episodes enable row level security;
alter table public.scenes enable row level security;
alter table public.storyboards enable row level security;
alter table public.shots enable row level security;
alter table public.shot_assets enable row level security;
alter table public.reference_videos enable row level security;
alter table public.video_analyses enable row level security;
alter table public.tasks enable row level security;
alter table public.task_items enable row level security;
alter table public.generation_outputs enable row level security;
alter table public.consistency_checks enable row level security;
alter table public.workflow_templates enable row level security;
alter table public.workflow_runs enable row level security;
alter table public.workflow_steps enable row level security;
alter table public.delivery_packages enable row level security;
alter table public.delivery_items enable row level security;
alter table public.model_providers enable row level security;
alter table public.provider_credentials enable row level security;
alter table public.usage_records enable row level security;
alter table public.audit_logs enable row level security;

drop policy if exists profiles_own_read on public.profiles;
create policy profiles_own_read on public.profiles
  for select using (id = auth.uid());

drop policy if exists profiles_own_write on public.profiles;
create policy profiles_own_write on public.profiles
  for all using (id = auth.uid()) with check (id = auth.uid());

drop policy if exists organizations_member_read on public.organizations;
create policy organizations_member_read on public.organizations
  for select using (owner_id = auth.uid() or public.is_organization_member(id));

drop policy if exists organizations_owner_write on public.organizations;
create policy organizations_owner_write on public.organizations
  for all using (owner_id = auth.uid()) with check (owner_id = auth.uid());

drop policy if exists organization_members_member_read on public.organization_members;
create policy organization_members_member_read on public.organization_members
  for select using (user_id = auth.uid() or public.is_organization_member(organization_id));

drop policy if exists organization_members_owner_insert on public.organization_members;
create policy organization_members_owner_insert on public.organization_members
  for insert with check (user_id = auth.uid() or exists (
    select 1 from public.organizations org
    where org.id = organization_id and org.owner_id = auth.uid()
  ));

drop policy if exists organization_members_owner_update on public.organization_members;
create policy organization_members_owner_update on public.organization_members
  for update using (exists (
    select 1 from public.organizations org
    where org.id = organization_id and org.owner_id = auth.uid()
  ));

drop policy if exists projects_member_read on public.projects;
create policy projects_member_read on public.projects
  for select using (owner_id = auth.uid() or public.is_project_member(id));

drop policy if exists projects_owner_insert on public.projects;
create policy projects_owner_insert on public.projects
  for insert with check (owner_id = auth.uid() and created_by = auth.uid());

drop policy if exists projects_editor_update on public.projects;
create policy projects_editor_update on public.projects
  for update using (public.has_project_role(id, array['owner','admin','editor']));

drop policy if exists project_members_read on public.project_members;
create policy project_members_read on public.project_members
  for select using (user_id = auth.uid() or public.is_project_member(project_id));

drop policy if exists project_members_insert on public.project_members;
create policy project_members_insert on public.project_members
  for insert with check (user_id = auth.uid() or public.has_project_role(project_id, array['owner','admin']));

drop policy if exists project_members_update on public.project_members;
create policy project_members_update on public.project_members
  for update using (public.has_project_role(project_id, array['owner','admin']));

-- Project-scoped policies.
drop policy if exists project_scoped_ip_bibles on public.ip_bibles;
create policy project_scoped_ip_bibles on public.ip_bibles for all
  using (public.is_project_member(project_id)) with check (public.is_project_member(project_id));

drop policy if exists project_scoped_asset_groups on public.asset_groups;
create policy project_scoped_asset_groups on public.asset_groups for all
  using (public.is_project_member(project_id)) with check (public.is_project_member(project_id));

drop policy if exists project_scoped_assets on public.assets;
create policy project_scoped_assets on public.assets for all
  using (public.is_project_member(project_id)) with check (public.is_project_member(project_id));

drop policy if exists project_scoped_asset_relations on public.asset_relations;
create policy project_scoped_asset_relations on public.asset_relations for all
  using (public.is_project_member(project_id)) with check (public.is_project_member(project_id));

drop policy if exists project_scoped_asset_tags on public.asset_tags;
create policy project_scoped_asset_tags on public.asset_tags for all
  using (public.is_project_member(project_id)) with check (public.is_project_member(project_id));

drop policy if exists project_scoped_prompts on public.prompts;
create policy project_scoped_prompts on public.prompts for all
  using (public.is_project_member(project_id)) with check (public.is_project_member(project_id));

drop policy if exists project_scoped_prompt_versions on public.prompt_versions;
create policy project_scoped_prompt_versions on public.prompt_versions for all
  using (public.is_project_member(project_id)) with check (public.is_project_member(project_id));

drop policy if exists project_scoped_episodes on public.episodes;
create policy project_scoped_episodes on public.episodes for all
  using (public.is_project_member(project_id)) with check (public.is_project_member(project_id));

drop policy if exists project_scoped_scenes on public.scenes;
create policy project_scoped_scenes on public.scenes for all
  using (public.is_project_member(project_id)) with check (public.is_project_member(project_id));

drop policy if exists project_scoped_storyboards on public.storyboards;
create policy project_scoped_storyboards on public.storyboards for all
  using (public.is_project_member(project_id)) with check (public.is_project_member(project_id));

drop policy if exists project_scoped_shots on public.shots;
create policy project_scoped_shots on public.shots for all
  using (public.is_project_member(project_id)) with check (public.is_project_member(project_id));

drop policy if exists project_scoped_shot_assets on public.shot_assets;
create policy project_scoped_shot_assets on public.shot_assets for all
  using (public.is_project_member(project_id)) with check (public.is_project_member(project_id));

drop policy if exists project_scoped_reference_videos on public.reference_videos;
create policy project_scoped_reference_videos on public.reference_videos for all
  using (public.is_project_member(project_id)) with check (public.is_project_member(project_id));

drop policy if exists project_scoped_video_analyses on public.video_analyses;
create policy project_scoped_video_analyses on public.video_analyses for all
  using (public.is_project_member(project_id)) with check (public.is_project_member(project_id));

drop policy if exists project_scoped_tasks on public.tasks;
create policy project_scoped_tasks on public.tasks for all
  using (public.is_project_member(project_id)) with check (public.is_project_member(project_id));

drop policy if exists project_scoped_task_items on public.task_items;
create policy project_scoped_task_items on public.task_items for all
  using (public.is_project_member(project_id)) with check (public.is_project_member(project_id));

drop policy if exists project_scoped_generation_outputs on public.generation_outputs;
create policy project_scoped_generation_outputs on public.generation_outputs for all
  using (public.is_project_member(project_id)) with check (public.is_project_member(project_id));

drop policy if exists project_scoped_consistency_checks on public.consistency_checks;
create policy project_scoped_consistency_checks on public.consistency_checks for all
  using (public.is_project_member(project_id)) with check (public.is_project_member(project_id));

drop policy if exists project_scoped_workflow_templates on public.workflow_templates;
create policy project_scoped_workflow_templates on public.workflow_templates for all
  using (project_id is null or public.is_project_member(project_id)) with check (project_id is null or public.is_project_member(project_id));

drop policy if exists project_scoped_workflow_runs on public.workflow_runs;
create policy project_scoped_workflow_runs on public.workflow_runs for all
  using (public.is_project_member(project_id)) with check (public.is_project_member(project_id));

drop policy if exists project_scoped_workflow_steps on public.workflow_steps;
create policy project_scoped_workflow_steps on public.workflow_steps for all
  using (public.is_project_member(project_id)) with check (public.is_project_member(project_id));

drop policy if exists project_scoped_delivery_packages on public.delivery_packages;
create policy project_scoped_delivery_packages on public.delivery_packages for all
  using (public.is_project_member(project_id)) with check (public.is_project_member(project_id));

drop policy if exists project_scoped_delivery_items on public.delivery_items;
create policy project_scoped_delivery_items on public.delivery_items for all
  using (public.is_project_member(project_id)) with check (public.is_project_member(project_id));

drop policy if exists project_scoped_model_providers on public.model_providers;
create policy project_scoped_model_providers on public.model_providers for all
  using (project_id is null or public.is_project_member(project_id)) with check (project_id is null or public.is_project_member(project_id));

drop policy if exists project_scoped_provider_credentials on public.provider_credentials;
create policy project_scoped_provider_credentials on public.provider_credentials for all
  using (project_id is null or public.has_project_role(project_id, array['owner','admin']))
  with check (project_id is null or public.has_project_role(project_id, array['owner','admin']));

drop policy if exists project_scoped_usage_records on public.usage_records;
create policy project_scoped_usage_records on public.usage_records for all
  using (project_id is null or public.is_project_member(project_id)) with check (project_id is null or public.is_project_member(project_id));

drop policy if exists audit_logs_read on public.audit_logs;
create policy audit_logs_read on public.audit_logs
  for select using (project_id is null or public.is_project_member(project_id));

drop policy if exists audit_logs_insert on public.audit_logs;
create policy audit_logs_insert on public.audit_logs
  for insert with check (actor_id = auth.uid());

-- Keep the old personal asset_versions policies intact, and add V2 project access.
drop policy if exists asset_versions_project_read on public.asset_versions;
create policy asset_versions_project_read on public.asset_versions
  for select using (
    owner_id = auth.uid()
    or (project_id is not null and public.is_project_member(project_id))
  );

drop policy if exists asset_versions_project_write on public.asset_versions;
create policy asset_versions_project_write on public.asset_versions
  for all using (
    owner_id = auth.uid()
    or (project_id is not null and public.is_project_member(project_id))
  ) with check (
    owner_id = auth.uid()
    or (project_id is not null and public.is_project_member(project_id))
  );
