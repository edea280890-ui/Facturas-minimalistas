import { NextResponse, type NextRequest } from 'next/server';
import { createSupabaseMiddlewareClient } from '@/utils/supabase/middleware';
import { isAdminEmail } from '@/utils/adminEmails';

/**
 * Portero Digital: filtro que corre antes de cargar páginas protegidas.
 *
 * Reglas:
 * - Rutas públicas (landing, legales, login, webhooks): pasan sin chequeo.
 * - Rutas de app (`/app`, `/dashboard`, `/admin`, APIs internas): requieren sesión.
 * - Con sesión: el email debe estar en `subscribers` con status `active`
 *   (los emails de `ADMIN_EMAILS` hacen bypass y siempre entran).
 * - Sin sesión → `/login` (o 401 en APIs). Sin suscripción → `/acceso-denegado`.
 *
 * Auth: Supabase Auth (Magic Link) vía cookies (`@supabase/ssr`). No usamos
 * Clerk ni NextAuth para no duplicar sistemas de identidad.
 */
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (isPublicPath(pathname)) {
    const { supabaseResponse } = await createSupabaseMiddlewareClient(request);
    return supabaseResponse;
  }

  const { supabase, supabaseResponse } = await createSupabaseMiddlewareClient(request);
  const isApi = pathname.startsWith('/api/');

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email) {
    if (isApi) {
      return NextResponse.json({ error: 'No autenticado.' }, { status: 401 });
    }
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = '/login';
    loginUrl.searchParams.set('next', pathname);
    return NextResponse.redirect(loginUrl);
  }

  const email = user.email.toLowerCase();

  if (pathname.startsWith('/admin') || pathname.startsWith('/api/admin')) {
    if (!isAdminEmail(email)) {
      if (isApi) {
        return NextResponse.json({ error: 'No autorizado.' }, { status: 403 });
      }
      const denied = request.nextUrl.clone();
      denied.pathname = '/app';
      return NextResponse.redirect(denied);
    }
    return supabaseResponse;
  }

  if (isAdminEmail(email)) {
    return supabaseResponse;
  }

  const { data: subscriber, error } = await supabase
    .from('subscribers')
    .select('status')
    .eq('email', email)
    .maybeSingle();

  if (error) {
    console.error('[portero] error al consultar subscribers:', error.message);
    if (isApi) {
      return NextResponse.json({ error: 'Error al verificar acceso.' }, { status: 500 });
    }
    const denied = request.nextUrl.clone();
    denied.pathname = '/acceso-denegado';
    denied.searchParams.set('reason', 'error');
    return NextResponse.redirect(denied);
  }

  if (!subscriber || subscriber.status !== 'active') {
    if (isApi) {
      return NextResponse.json({ error: 'Suscripción inactiva.' }, { status: 403 });
    }
    const denied = request.nextUrl.clone();
    denied.pathname = '/acceso-denegado';
    return NextResponse.redirect(denied);
  }

  return supabaseResponse;
}

function isPublicPath(pathname: string): boolean {
  if (pathname === '/') return true;
  if (pathname.startsWith('/login')) return true;
  if (pathname.startsWith('/acceso-denegado')) return true;
  if (pathname.startsWith('/auth/')) return true;
  if (pathname.startsWith('/terms')) return true;
  if (pathname.startsWith('/privacy')) return true;
  if (pathname.startsWith('/api/webhooks/')) return true;
  return false;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
