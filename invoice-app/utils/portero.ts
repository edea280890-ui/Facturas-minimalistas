import { redirect } from 'next/navigation';
import { NextResponse } from 'next/server';
import type { SupabaseClient } from '@supabase/supabase-js';
import { createSupabaseServerClient } from '@/utils/supabase/server';
import { isAdminEmail } from '@/utils/adminEmails';
import { MissingEnvVarError } from '@/utils/env';

/**
 * Portero Digital en el servidor (App Router), SIN middleware/proxy.
 *
 * Next.js 16 + `proxy.ts`/`middleware.ts` con `@supabase/ssr` en Vercel
 * puede romper el routing manifest y devolver 404 en TODAS las rutas.
 * La protección vive aquí (layouts / route handlers).
 */

/**
 * Crea el cliente de Supabase o redirige a `/login` con un error controlado
 * si Supabase no está configurado (env vars faltantes), en vez de dejar que
 * el layout lance y Next.js muestre una página de error genérica sin salida.
 *
 * IMPORTANTE: solo capturamos `MissingEnvVarError`. Cualquier otra excepción
 * (p. ej. la señal interna `DYNAMIC_SERVER_USAGE` que Next.js lanza al usar
 * `cookies()` durante el análisis estático, o las de `redirect()`/`notFound()`)
 * se relanza sin tocar — capturarlas por error rompería el build/routing.
 */
async function getSupabaseOrRedirectToLogin(nextPath: string): Promise<SupabaseClient> {
  try {
    return await createSupabaseServerClient();
  } catch (err) {
    if (err instanceof MissingEnvVarError) {
      console.error('[portero] No se pudo inicializar Supabase:', err.message);
      redirect(`/login?next=${encodeURIComponent(nextPath)}&error=service_unavailable`);
    }
    throw err;
  }
}

export async function requireActiveSubscriberOrRedirect(nextPath: string = '/app') {
  const supabase = await getSupabaseOrRedirectToLogin(nextPath);
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email) {
    redirect(`/login?next=${encodeURIComponent(nextPath)}`);
  }

  const email = user.email.toLowerCase();

  if (isAdminEmail(email)) {
    return { user, email, supabase };
  }

  const { data: subscriber, error } = await supabase
    .from('subscribers')
    .select('status')
    .eq('email', email)
    .maybeSingle();

  if (error || !subscriber || subscriber.status !== 'active') {
    redirect('/acceso-denegado');
  }

  return { user, email, supabase };
}

export async function requireAdminOrRedirect() {
  const supabase = await getSupabaseOrRedirectToLogin('/admin');
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email) {
    redirect('/login?next=/admin');
  }

  if (!isAdminEmail(user.email)) {
    // Sesión válida pero sin privilegio admin → app, no login (evita bucle
    // tras /auth/callback que redirige a /admin).
    redirect('/app');
  }

  return { user, email: user.email.toLowerCase(), supabase };
}

/** Para Route Handlers: 401/403/503 JSON en lugar de redirect. */
export async function requireActiveSubscriberApi() {
  let supabase: SupabaseClient;
  try {
    supabase = await createSupabaseServerClient();
  } catch (err) {
    if (!(err instanceof MissingEnvVarError)) {
      throw err;
    }
    console.error('[portero] No se pudo inicializar Supabase:', err.message);
    return {
      error: NextResponse.json({ error: 'Servicio no disponible.' }, { status: 503 }),
      user: null,
      supabase: null,
    };
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email) {
    return {
      error: NextResponse.json({ error: 'No autenticado.' }, { status: 401 }),
      user: null,
      supabase,
    };
  }

  const email = user.email.toLowerCase();
  if (isAdminEmail(email)) {
    return { error: null, user, supabase };
  }

  const { data: subscriber, error } = await supabase
    .from('subscribers')
    .select('status')
    .eq('email', email)
    .maybeSingle();

  if (error || !subscriber || subscriber.status !== 'active') {
    return {
      error: NextResponse.json({ error: 'Suscripción inactiva.' }, { status: 403 }),
      user: null,
      supabase,
    };
  }

  return { error: null, user, supabase };
}
