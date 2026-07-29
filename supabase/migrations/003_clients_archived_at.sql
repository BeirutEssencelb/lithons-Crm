-- Soft-archive clients (hide from active lists without hard delete)
alter table public.clients
  add column if not exists archived_at timestamptz;

create index if not exists clients_archived_at_idx
  on public.clients (archived_at);
