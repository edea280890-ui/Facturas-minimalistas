<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Cursor Cloud specific instructions

- The application lives in the `invoice-app/` subdirectory (not the repo root). Run all `npm` commands from inside `invoice-app/`.
- Stack: Next.js 16 (App Router, Turbopack), React 19, TypeScript, Tailwind CSS v4, plus `zustand` (state) and `@react-pdf/renderer` (PDF generation).
- Standard scripts (see `invoice-app/package.json`): `npm run dev` (dev server, port 3000), `npm run build`, `npm start`, `npm run lint`.
- Dependencies are installed by the startup update script; no manual install needed for a fresh cloud VM.
- Local env vars live in `invoice-app/.env.local`, which is git-ignored (Next.js convention) and therefore does NOT persist in the repo or on fresh cloud VMs. Recreate this file (or provide the vars as Cursor Secrets) when Supabase/Stripe-backed features are needed. Next loads it at startup/reload — watch for `Reload env: .env.local` in the dev log. Required vars:
  - `NEXT_PUBLIC_SUPABASE_URL` (the `https://<ref>.supabase.co` project URL, NOT a publishable key) and `NEXT_PUBLIC_SUPABASE_ANON_KEY` — used by the browser client and by server routes to validate user JWTs.
  - `SUPABASE_SERVICE_ROLE_KEY` (server-only, no `NEXT_PUBLIC_` prefix) — used only by the Stripe webhook (`utils/supabase/admin.ts`) to update `profiles.is_premium`, bypassing RLS. Never expose this to the client.
  - `STRIPE_SECRET_KEY` (server-only) and `STRIPE_WEBHOOK_SECRET` (server-only) — used by `utils/stripe/server.ts` and `app/api/webhooks/stripe/route.ts`.
- Supabase: the browser client is `utils/supabase/client.ts`; the admin (service-role) client for server routes is `utils/supabase/admin.ts`. The database schema — `invoices` table, `profiles` table (with `is_premium`), all RLS policies, and the `logos` Storage bucket — is defined in `invoice-app/supabase/schema.sql` and must be applied via the Supabase SQL Editor (safe to re-run any time; fully idempotent) before cloud save or premium gating work. Auth uses Magic Link (email OTP); Google OAuth is not enabled on the project.
- Monetization (Fase 3): one-time $15 USD "lifetime" upgrade via Stripe Checkout (`price_data` created inline, no pre-existing Stripe Product/Price needed). `app/api/checkout/route.ts` creates the Checkout Session for the authenticated caller (validated via `Authorization: Bearer <access_token>`); `app/api/webhooks/stripe/route.ts` listens for `checkout.session.completed` and flips `profiles.is_premium` to `true` using the Service Role Key. Saving/updating invoices in the cloud is gated on `is_premium` both in the UI (`components/layout/Header.tsx`, via `store/useProfileStore.ts`) and at the RLS level (`invoices_insert_own` / `invoices_update_own` policies in `schema.sql`) — the DB-level check is the real security boundary. For local webhook testing use the Stripe CLI: `stripe listen --forward-to localhost:3000/api/webhooks/stripe`.
