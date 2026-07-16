-- =============================================================================
-- Portero Digital — solo la tabla subscribers (Fase 1)
-- Ejecutar en Supabase → SQL Editor si aún no corriste el schema completo.
-- =============================================================================

create table if not exists public.subscribers (
  email      text primary key,
  status     text not null default 'active' check (status in ('active', 'canceled')),
  created_at timestamptz not null default timezone('utc'::text, now()),
  updated_at timestamptz not null default timezone('utc'::text, now())
);

create index if not exists subscribers_status_idx on public.subscribers (status);

alter table public.subscribers enable row level security;

drop policy if exists "subscribers_select_own" on public.subscribers;
create policy "subscribers_select_own"
  on public.subscribers
  for select
  to authenticated
  using (lower(email) = lower(coalesce(auth.jwt()->>'email', '')));

-- Opcional: date de alta a tu email admin para poder entrar sin pasar por Hotmart
-- insert into public.subscribers (email, status)
-- values ('tu@correo.com', 'active')
-- on conflict (email) do update set status = 'active';
