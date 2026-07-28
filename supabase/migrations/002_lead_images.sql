-- Lead images stored in Backblaze B2; metadata in Supabase
-- Run in Supabase SQL Editor after schema.sql

create table if not exists public.lead_images (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references public.leads(id) on delete cascade,
  storage_key text not null,
  filename text not null,
  content_type text not null,
  uploaded_at timestamptz not null default now()
);

create index if not exists lead_images_lead_id_idx
  on public.lead_images(lead_id);

create index if not exists lead_images_uploaded_at_idx
  on public.lead_images(lead_id, uploaded_at desc);

alter table public.lead_images enable row level security;

drop policy if exists "Users select own lead images" on public.lead_images;
drop policy if exists "Users insert own lead images" on public.lead_images;
drop policy if exists "Users delete own lead images" on public.lead_images;

create policy "Users select own lead images"
  on public.lead_images for select
  using (
    exists (
      select 1 from public.leads
      where leads.id = lead_images.lead_id
        and leads.user_id = auth.uid()
    )
  );

create policy "Users insert own lead images"
  on public.lead_images for insert
  with check (
    exists (
      select 1 from public.leads
      where leads.id = lead_images.lead_id
        and leads.user_id = auth.uid()
    )
  );

create policy "Users delete own lead images"
  on public.lead_images for delete
  using (
    exists (
      select 1 from public.leads
      where leads.id = lead_images.lead_id
        and leads.user_id = auth.uid()
    )
  );
