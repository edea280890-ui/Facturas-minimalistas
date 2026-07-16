import { redirect } from 'next/navigation';
import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/utils/supabase/server';
import { isAdminEmail } from '@/utils/adminEmails';

/**
 * Portero Digital en el servidor (App Router), SIN middleware/proxy.
 *
 * Next.js 16 + `proxy.ts`/`middleware.ts` con `@supabase/ssr` en Vercel
 * puede romper el routing manifest y devolver 404 en TODAS las rutas.
 * La protección vive aquí (layouts / route handlers).
 */
export async function requireActiveSubscriberOrRedirect(nextPath: string = '/app') {
  const supabase = await createSupabaseServerClient();
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
  const supabase = await createSupabaseServerClient();
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

/** Para Route Handlers: 401/403 JSON en lugar de redirect. */
export async function requireActiveSubscriberApi() {
  const supabase = await createSupabaseServerClient();
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
