import { NextResponse, type NextRequest } from 'next/server';
import { createSupabaseMiddlewareClient } from '@/utils/supabase/middleware';

/**
 * Middleware: modo mantenimiento + refresco de sesión Supabase.
 *
 * Bypass estricto (nunca redirige a /maintenance):
 * - /api/webhooks/* (incl. /api/webhooks/lemonsqueezy)
 * - /maintenance
 * - estáticos vía `config.matcher` (_next, favicon, imágenes)
 */
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1) Webhooks: paso libre — sin sesión y sin telón de mantenimiento.
  if (pathname.startsWith('/api/webhooks/')) {
    console.log('[middleware] Webhook bypass', {
      method: request.method,
      pathname,
      userAgent: request.headers.get('user-agent'),
      contentType: request.headers.get('content-type'),
    });
    return NextResponse.next();
  }

  // 2) Modo mantenimiento: redirige todo el tráfico público al telón.
  const maintenanceMode = process.env.MAINTENANCE_MODE === 'true';
  if (maintenanceMode && pathname !== '/maintenance') {
    const url = request.nextUrl.clone();
    url.pathname = '/maintenance';
    url.search = '';
    return NextResponse.redirect(url);
  }

  // 3) Fuera de mantenimiento (o ya en /maintenance): refrescar sesión.
  const { supabase, supabaseResponse } = await createSupabaseMiddlewareClient(request);

  if (supabase) {
    try {
      await supabase.auth.getUser();
    } catch (err) {
      console.error('[middleware] Error al refrescar la sesión:', err);
    }
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|sw\\.js|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
