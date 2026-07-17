import { type NextRequest } from 'next/server';
import { createSupabaseMiddlewareClient } from '@/utils/supabase/middleware';

/**
 * Middleware mínimo: solo refresca la sesión de Supabase en cookies.
 *
 * - Corre sobre casi todas las rutas (ver `matcher`), incluyendo
 *   `/auth/callback` sin redirects ni lógica adicional.
 * - NO protege rutas aquí (eso lo hacen los layouts vía `utils/portero.ts`).
 *   Meter gates de negocio en middleware + @supabase/ssr en Next 16/Vercel
 *   ha causado 404 globales en este proyecto.
 * - Fail-open: si Supabase no está configurado o falla al refrescar la
 *   sesión, deja pasar la request en vez de devolver 500 sitio-completo.
 */
export async function middleware(request: NextRequest) {
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
    /*
     * Excluye estáticos y probes habituales del navegador (p. ej. /sw.js).
     * Incluye /auth/callback explícitamente vía el patrón.
     */
    '/((?!_next/static|_next/image|favicon.ico|sw\\.js|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
