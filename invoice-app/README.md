# Generador de Facturas Minimalista

Micro-SaaS para crear, previsualizar y descargar facturas en PDF. Plan gratuito + Plan Pro (pago único) con guardado en la nube.

## Estructura

| Ruta | Qué es |
|------|--------|
| `/` | Landing de marketing (precios, características, legales) |
| `/login` | Magic Link (entrada al Portero) |
| `/acceso-denegado` | Logueado pero sin suscripción activa |
| `/app` | Aplicación (protegida por Portero) |
| `/dashboard` | Mis facturas (protegida) |
| `/admin` | Panel de suscriptores (solo `ADMIN_EMAILS`) |
| `/terms`, `/privacy` | Documentos legales |
| `/api/webhooks/hotmart` | Webhook Hotmart → `subscribers` + Pro |
| `/api/webhooks/stripe` | Webhook Stripe (fallback) |
| `/api/checkout` | Crea sesión Stripe Checkout (fallback) |
| `/api/admin/subscribers` | API del panel admin |

El código vive en el subdirectorio `invoice-app/`.

## Desarrollo local

```bash
cd invoice-app
cp .env.example .env.local   # rellena valores
npm install
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000).

Antes de usar nube/premium, aplica el schema en el SQL Editor de Supabase:

```text
invoice-app/supabase/schema.sql
```

(es idempotente; se puede re-ejecutar).

## Portero Digital (acceso cerrado)

Flujo: Hotmart aprueba → webhook guarda el email en `subscribers` → el usuario inicia sesión con Magic Link → layouts de servidor solo dejan pasar emails `active`.

**Importante (Vercel):** no uses `middleware.ts`/`proxy.ts` con este stack; causa 404 globales en Next.js 16. El gate está en `utils/portero.ts` + layouts.

1. Ejecuta en Supabase SQL Editor: [`supabase/subscribers.sql`](./supabase/subscribers.sql) (o el schema completo).
2. Define `ADMIN_EMAILS` en Vercel / `.env.local`.
3. Configura el webhook Hotmart → `/api/webhooks/hotmart`.
4. Panel interno: `/admin` (solo emails admin).
5. Vercel: Root Directory = `invoice-app`, Framework Preset = **Next.js**, rama `main`, redeploy **sin** cache. No añadas `vercel.json` con `rewrites`/`builds`.

Rutas públicas: `/`, `/login`, `/acceso-denegado`, `/terms`, `/privacy`, webhooks.
Rutas protegidas (layouts): `/app`, `/dashboard`, `/admin`.

## Variables de entorno

Ver `.env.example`. Resumen:

- **Supabase**: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`
- **Hotmart** (recomendado): `HOTMART_HOTTOK`, `NEXT_PUBLIC_HOTMART_CHECKOUT_URL`
- **Stripe** (opcional/fallback): `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`

Si `NEXT_PUBLIC_HOTMART_CHECKOUT_URL` está definido, los botones “Comprar / Actualizar a Pro” abren Hotmart. Si no, `/app` usa Stripe Checkout.

## Despliegue en Vercel

1. Importa el repo en [Vercel](https://vercel.com/new).
2. **Root Directory**: `invoice-app`.
3. Framework: Next.js (autodetectado).
4. Añade todas las variables de `.env.example` en Project → Settings → Environment Variables.
5. Deploy.
6. En Supabase → Authentication → URL Configuration, añade:
   - Site URL: `https://TU-DOMINIO.vercel.app`
   - Redirect URLs: `https://TU-DOMINIO.vercel.app/auth/callback**` (incluye `?next=`)
7. En Hotmart, configura el webhook a:
   - `https://TU-DOMINIO.vercel.app/api/webhooks/hotmart`
   - Mismo `hottok` que `HOTMART_HOTTOK`
8. (Opcional) Stripe webhook → `/api/webhooks/stripe` con el signing secret en `STRIPE_WEBHOOK_SECRET`.

## Scripts

```bash
npm run dev      # desarrollo
npm run build    # build de producción
npm run start    # servir build
npm run lint     # ESLint
```

## Stack

Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS v4, Zustand, `@react-pdf/renderer`, Supabase Auth/DB/Storage, Hotmart (+ Stripe como fallback).
