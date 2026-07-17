-- =============================================================================
-- Generador de Facturas - Esquema completo (subscribers, profiles, invoices, storage)
-- Ejecutar en: Supabase Dashboard -> SQL Editor
-- Es seguro volver a ejecutar este script completo en cualquier momento: usa
-- `if not exists` / `drop ... if exists` / `on conflict do nothing` en todo.
-- =============================================================================

-- Necesario para gen_random_uuid()
create extension if not exists "pgcrypto";

-- -----------------------------------------------------------------------------
-- Tabla `subscribers`: "lista de invitados" del Portero Digital.
-- El webhook de Hotmart hace upsert aquí; el middleware solo deja pasar emails
-- con status = 'active'. El panel /admin lista y puede dar de baja (canceled).
-- -----------------------------------------------------------------------------
create table if not exists public.subscribers (
  email      text primary key,
  status     text not null default 'active' check (status in ('active', 'canceled')),
  created_at timestamptz not null default timezone('utc'::text, now()),
  updated_at timestamptz not null default timezone('utc'::text, now())
);

create index if not exists subscribers_status_idx on public.subscribers (status);

alter table public.subscribers enable row level security;

-- Cada usuario autenticado solo puede leer SU propia fila (por email del JWT).
drop policy if exists "subscribers_select_own" on public.subscribers;
create policy "subscribers_select_own"
  on public.subscribers
  for select
  to authenticated
  using (lower(email) = lower(coalesce(auth.jwt()->>'email', '')));

-- Sin INSERT/UPDATE/DELETE para "authenticated": solo Service Role (webhooks /admin).

-- -----------------------------------------------------------------------------
-- Tabla `profiles`: 1 fila por usuario de `auth.users`, con el estado premium.
-- Se crea automáticamente vía trigger cuando se registra un usuario nuevo.
-- -----------------------------------------------------------------------------
create table if not exists public.profiles (
  id                 uuid primary key references auth.users (id) on delete cascade,
  is_premium         boolean not null default false,
  stripe_customer_id text,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);

alter table public.profiles enable row level security;

-- SELECT: cada usuario solo puede leer su propio perfil (para saber si es premium).
drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own"
  on public.profiles
  for select
  to authenticated
  using (auth.uid() = id);

-- OJO: a propósito NO hay política de INSERT/UPDATE/DELETE para "authenticated".
-- `is_premium` solo lo puede cambiar el webhook de Stripe usando la Service Role
-- Key (que ignora RLS por completo); así ningún usuario puede marcarse premium
-- a sí mismo manipulando el cliente desde la consola del navegador.

-- Crea automáticamente la fila de `profiles` al registrarse un usuario nuevo.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id)
  values (new.id)
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Crea la fila de perfil para usuarios que ya existían antes de este script.
insert into public.profiles (id)
select u.id from auth.users u
on conflict (id) do nothing;

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
  currency         text not null default 'USD',
  tax_rate         numeric not null default 0,
  payment_details  jsonb not null default '{}'::jsonb,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

-- Migración idempotente para entornos que ya tenían `invoices` sin payment_details.
alter table public.invoices
  add column if not exists payment_details jsonb not null default '{}'::jsonb;

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

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

drop trigger if exists subscribers_set_updated_at on public.subscribers;
create trigger subscribers_set_updated_at
  before update on public.subscribers
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

-- INSERT: cada usuario solo puede crear facturas a su propio nombre, y solo si
-- es premium (pago único vía Stripe). Esto es lo que realmente bloquea el
-- guardado en la nube para usuarios no-premium a nivel de base de datos,
-- independientemente de lo que haga o manipule el cliente.
drop policy if exists "invoices_insert_own" on public.invoices;
create policy "invoices_insert_own"
  on public.invoices
  for insert
  to authenticated
  with check (
    auth.uid() = user_id
    and exists (
      select 1 from public.profiles p where p.id = auth.uid() and p.is_premium = true
    )
  );

-- UPDATE: cada usuario solo puede modificar sus propias facturas, y solo si es premium.
drop policy if exists "invoices_update_own" on public.invoices;
create policy "invoices_update_own"
  on public.invoices
  for update
  to authenticated
  using (auth.uid() = user_id)
  with check (
    auth.uid() = user_id
    and exists (
      select 1 from public.profiles p where p.id = auth.uid() and p.is_premium = true
    )
  );

-- DELETE: cada usuario solo puede borrar sus propias facturas.
drop policy if exists "invoices_delete_own" on public.invoices;
create policy "invoices_delete_own"
  on public.invoices
  for delete
  to authenticated
  using (auth.uid() = user_id);

-- -----------------------------------------------------------------------------
-- Storage: bucket `logos` para el logo del emisor (opcional, Fase 3.8).
-- Cada usuario sube sus archivos bajo el prefijo `<user_id>/...` y el bucket es
-- público en lectura para poder incrustar el logo directamente en el PDF.
-- -----------------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('logos', 'logos', true)
on conflict (id) do nothing;

drop policy if exists "logos_select_public" on storage.objects;
create policy "logos_select_public"
  on storage.objects
  for select
  to public
  using (bucket_id = 'logos');

drop policy if exists "logos_insert_own" on storage.objects;
create policy "logos_insert_own"
  on storage.objects
  for insert
  to authenticated
  with check (bucket_id = 'logos' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "logos_update_own" on storage.objects;
create policy "logos_update_own"
  on storage.objects
  for update
  to authenticated
  using (bucket_id = 'logos' and (storage.foldername(name))[1] = auth.uid()::text)
  with check (bucket_id = 'logos' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "logos_delete_own" on storage.objects;
create policy "logos_delete_own"
  on storage.objects
  for delete
  to authenticated
  using (bucket_id = 'logos' and (storage.foldername(name))[1] = auth.uid()::text);
