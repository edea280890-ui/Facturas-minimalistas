-- =============================================================================
-- Generador de Facturas - Esquema de la tabla `invoices`
-- Ejecutar en: Supabase Dashboard -> SQL Editor
-- =============================================================================

-- Necesario para gen_random_uuid()
create extension if not exists "pgcrypto";

-- -----------------------------------------------------------------------------
-- Tabla `invoices`: refleja la interfaz `Invoice` del frontend.
-- Los objetos anidados (company, client) y la lista `items` se almacenan como
-- JSONB para mantener la flexibilidad del modelo de datos del cliente.
-- -----------------------------------------------------------------------------
create table if not exists public.invoices (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid not null references auth.users (id) on delete cascade,
  invoice_number text not null,
  date           date not null,
  due_date       date not null,
  company        jsonb not null default '{}'::jsonb,
  client         jsonb not null default '{}'::jsonb,
  items          jsonb not null default '[]'::jsonb,
  currency       text not null default 'USD',
  tax_rate       numeric not null default 0,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

-- Índice para acelerar las consultas por usuario.
create index if not exists invoices_user_id_idx on public.invoices (user_id);

-- Mantener `updated_at` sincronizado en cada UPDATE.
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists invoices_set_updated_at on public.invoices;
create trigger invoices_set_updated_at
  before update on public.invoices
  for each row execute function public.set_updated_at();

-- -----------------------------------------------------------------------------
-- Row Level Security (RLS)
-- -----------------------------------------------------------------------------
alter table public.invoices enable row level security;

-- SELECT: cada usuario solo ve sus propias facturas.
drop policy if exists "invoices_select_own" on public.invoices;
create policy "invoices_select_own"
  on public.invoices
  for select
  to authenticated
  using (auth.uid() = user_id);

-- INSERT: cada usuario solo puede crear facturas a su propio nombre.
drop policy if exists "invoices_insert_own" on public.invoices;
create policy "invoices_insert_own"
  on public.invoices
  for insert
  to authenticated
  with check (auth.uid() = user_id);

-- UPDATE: cada usuario solo puede modificar sus propias facturas.
drop policy if exists "invoices_update_own" on public.invoices;
create policy "invoices_update_own"
  on public.invoices
  for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- DELETE: cada usuario solo puede borrar sus propias facturas.
drop policy if exists "invoices_delete_own" on public.invoices;
create policy "invoices_delete_own"
  on public.invoices
  for delete
  to authenticated
  using (auth.uid() = user_id);
