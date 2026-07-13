-- Tide Steel Studio cloud asset library
-- Run once in Supabase Dashboard -> SQL Editor -> New query.

create table if not exists public.asset_versions (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  asset_id text not null,
  version_id text not null,
  file_name text not null,
  file_path text not null unique,
  media_type text not null check (media_type in ('image', 'video')),
  status text not null check (status in ('EMPTY', 'DRAFT', 'REVIEW', 'APPROVED', 'MASTER_REFERENCE', 'REJECTED')) default 'REVIEW',
  uploaded_at timestamptz not null default now(),
  checklist jsonb not null default '{"face":false,"hair":false,"age":false,"costume":false,"world":false}'::jsonb,
  rating jsonb not null default '{"consistency":0,"quality":0,"cinematic":0,"reusable":0}'::jsonb,
  prompt_versions jsonb not null default '[]'::jsonb,
  metadata jsonb not null default '{}'::jsonb,
  unique (owner_id, asset_id, version_id)
);

alter table public.asset_versions enable row level security;
grant select, insert, update, delete on table public.asset_versions to authenticated;

drop policy if exists "asset_versions_select_own" on public.asset_versions;
create policy "asset_versions_select_own" on public.asset_versions
  for select to authenticated
  using ((select auth.uid()) = owner_id);

drop policy if exists "asset_versions_insert_own" on public.asset_versions;
create policy "asset_versions_insert_own" on public.asset_versions
  for insert to authenticated
  with check ((select auth.uid()) = owner_id);

drop policy if exists "asset_versions_update_own" on public.asset_versions;
create policy "asset_versions_update_own" on public.asset_versions
  for update to authenticated
  using ((select auth.uid()) = owner_id)
  with check ((select auth.uid()) = owner_id);

drop policy if exists "asset_versions_delete_own" on public.asset_versions;
create policy "asset_versions_delete_own" on public.asset_versions
  for delete to authenticated
  using ((select auth.uid()) = owner_id);

insert into storage.buckets (id, name, public)
values ('tide-assets', 'tide-assets', false)
on conflict (id) do update set public = false;

drop policy if exists "tide_assets_select_own" on storage.objects;
create policy "tide_assets_select_own" on storage.objects
  for select to authenticated
  using (bucket_id = 'tide-assets' and owner_id = (select auth.uid())::text);

drop policy if exists "tide_assets_insert_own" on storage.objects;
create policy "tide_assets_insert_own" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'tide-assets' and owner_id = (select auth.uid())::text);

drop policy if exists "tide_assets_update_own" on storage.objects;
create policy "tide_assets_update_own" on storage.objects
  for update to authenticated
  using (bucket_id = 'tide-assets' and owner_id = (select auth.uid())::text)
  with check (bucket_id = 'tide-assets' and owner_id = (select auth.uid())::text);

drop policy if exists "tide_assets_delete_own" on storage.objects;
create policy "tide_assets_delete_own" on storage.objects
  for delete to authenticated
  using (bucket_id = 'tide-assets' and owner_id = (select auth.uid())::text);

