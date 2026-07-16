<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Cursor Cloud specific instructions

- The application lives in the `invoice-app/` subdirectory (not the repo root). Run all `npm` commands from inside `invoice-app/`.
- Stack: Next.js 16 (App Router, Turbopack), React 19, TypeScript, Tailwind CSS v4, plus `zustand` (state) and `@react-pdf/renderer` (PDF generation).
- Standard scripts (see `invoice-app/package.json`): `npm run dev` (dev server, port 3000), `npm run build`, `npm start`, `npm run lint`.
- Dependencies are installed by the startup update script; no manual install needed for a fresh cloud VM.
- **Portero Digital (acceso cerrado)**:
  - Tabla `public.subscribers` (`email` PK, `status` active|canceled) — ver `supabase/subscribers.sql` o el schema completo.
  - Webhook Hotmart (`app/api/webhooks/hotmart/route.ts`): en compra aprobada hace upsert `subscribers` + provisiona Auth + `profiles.is_premium`; en no-aprobada marca `canceled` y revoca premium.
  - **NO usar `proxy.ts` / `middleware.ts` en Vercel con Next 16 + `@supabase/ssr`**: ese combo puede devolver 404 en todas las rutas (routing manifest roto). El portero vive en layouts de servidor (`app/app/layout.tsx`, `app/dashboard/layout.tsx`, `app/admin/layout.tsx`) vía `utils/portero.ts`.
  - Panel `/admin` + `GET|PATCH /api/admin/subscribers`: lista activos, dar de baja / reactivar (`ADMIN_EMAILS`).
  - Auth: **Supabase Magic Link** + cookies `@supabase/ssr` (`utils/supabase/client.ts` + `server.ts`).
  - Obligatorio aplicar el SQL de `subscribers` en el SQL Editor de Supabase antes de probar el portero.
  - Vercel: Root Directory = `invoice-app`, Framework = Next.js, **sin** `vercel.json` con rewrites/builds. Production Branch = `main`.
- Local env vars live in `invoice-app/.env.local`, which is git-ignored (Next.js convention) and therefore does NOT persist in the repo or on fresh cloud VMs. Recreate from `invoice-app/.env.example` (or provide the vars as Cursor Secrets) when Supabase/payment-backed features are needed. Next loads it at startup/reload — watch for `Reload env: .env.local` in the dev log. Required / common vars:
  - `NEXT_PUBLIC_SUPABASE_URL` (the `https://<ref>.supabase.co` project URL, NOT a publishable key) and `NEXT_PUBLIC_SUPABASE_ANON_KEY` — used by the browser client and by server routes to validate user JWTs.
  - `SUPABASE_SERVICE_ROLE_KEY` (server-only, no `NEXT_PUBLIC_` prefix) — used by Hotmart/Stripe webhooks (`utils/supabase/admin.ts`) to update `profiles.is_premium`, bypassing RLS. Never expose this to the client.
  - `ADMIN_EMAILS` — comma-separated admin emails for `/admin` and portero bypass.
  - `HOTMART_HOTTOK` (server-only) — secret for `app/api/webhooks/hotmart/route.ts`.
  - `NEXT_PUBLIC_HOTMART_CHECKOUT_URL` — public Hotmart checkout link used by landing Pro CTAs and by `hooks/useUpgradeCheckout.ts` when set.
  - `STRIPE_SECRET_KEY` / `STRIPE_WEBHOOK_SECRET` (server-only) — Stripe fallback when Hotmart checkout URL is not set.
- Supabase: the browser client is `utils/supabase/client.ts`; the admin (service-role) client for server routes is `utils/supabase/admin.ts`. The database schema — `invoices` table, `profiles` table (with `is_premium`), all RLS policies, and the `logos` Storage bucket — is defined in `invoice-app/supabase/schema.sql` and must be applied via the Supabase SQL Editor (safe to re-run any time; fully idempotent) before cloud save or premium gating work. Auth uses Magic Link (email OTP); Google OAuth is not enabled on the project.
- Monetization: one-time $15 USD "lifetime" Pro. **Primary path = Hotmart** (landing CTAs + webhook). **Fallback = Stripe Checkout** in `/app` when `NEXT_PUBLIC_HOTMART_CHECKOUT_URL` is empty (`app/api/checkout/route.ts` + `app/api/webhooks/stripe/route.ts`). Saving/updating invoices in the cloud is gated on `is_premium` both in the UI (`components/layout/Header.tsx`, via `store/useProfileStore.ts`) and at the RLS level (`invoices_insert_own` / `invoices_update_own` policies in `schema.sql`) — the DB-level check is the real security boundary. For local Stripe webhook testing: `stripe listen --forward-to localhost:3000/api/webhooks/stripe`.
- **Monetización vía Hotmart (`app/api/webhooks/hotmart/route.ts`)**: valida el `hottok` (header `X-HOTMART-HOTTOK`, query `?hottok=`, o body `{hottok}`) contra `process.env.HOTMART_HOTTOK`; extrae email/status del payload y, si el estado es `APPROVED`/`COMPLETE`/`COMPLETED`, otorga acceso Pro buscando o creando (auto-provisioning) un usuario de Supabase Auth por ese email. **IMPORTANTE**: la búsqueda por email usa `auth.admin.listUsers()` paginado con comparación EXACTA en memoria (`===`) — NO usar el parámetro `?email=` del endpoint REST de administración de GoTrue como filtro de servidor: se verificó que en este proyecto ese parámetro no filtra de forma exacta y devuelve un usuario arbitrario, lo cual causó el borrado accidental (irreversible, hard-delete) de una cuenta real durante el desarrollo de este endpoint. Revisar `types/hotmart.ts` contra un payload real de Hotmart en cuanto se pueda probar en producción.
- **Routing split (important)**: `app/page.tsx` (`/`) is a *purely presentational* public marketing landing page (`components/landing/{PublicNav,HeroSection,FeaturesSection,HotmartPricingSection}.tsx`) — no Supabase/Stripe/session logic on purpose, to satisfy payment-gateway compliance requirements (visible legal links via the global `Footer`, visible pricing). Free CTAs go to `/app`; Pro CTA uses `NEXT_PUBLIC_HOTMART_CHECKOUT_URL` when set (else `/app`). The functional app (login, invoice editor, upgrade via `components/landing/PricingSection.tsx` + `hooks/useUpgradeCheckout.ts`) lives at `app/app/page.tsx` (`/app`). All internal redirects (checkout success/cancel URLs, auth callback, `RequireAuth` fallback, dashboard "back" link) point to `/app`, not `/`. Don't conflate the two pricing components: `PricingSection.tsx` is the session-aware one on `/app`; `HotmartPricingSection.tsx` is the static marketing one on `/`.
- Vercel: set Root Directory to `invoice-app`. Full deploy checklist is in `invoice-app/README.md`.

