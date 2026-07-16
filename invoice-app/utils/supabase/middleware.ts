import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import { env } from '@/utils/env';

/**
 * Refresca la sesión de Supabase en el middleware (cookies).
 * No hace redirects de negocio: eso vive en layouts / route handlers.
 *
 * Si faltan las variables de entorno de Supabase, NO lanza: el middleware
 * corre en (casi) todas las rutas, así que un throw aquí devolvería 500 en
 * todo el sitio. En su lugar, devuelve `supabase: null` y deja pasar la
 * request sin refrescar sesión (fail-open).
 */
export async function createSupabaseMiddlewareClient(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request: { headers: request.headers },
  });

  const supabaseUrl = env('NEXT_PUBLIC_SUPABASE_URL');
  const supabaseAnonKey = env('NEXT_PUBLIC_SUPABASE_ANON_KEY');

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error(
      '[middleware] Falta NEXT_PUBLIC_SUPABASE_URL o NEXT_PUBLIC_SUPABASE_ANON_KEY; se omite el refresco de sesión.',
    );
    return { supabase: null, supabaseResponse };
  }

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet: { name: string; value: string; options?: Record<string, unknown> }[]) {
        cookiesToSet.forEach(({ name, value }) => {
          request.cookies.set(name, value);
        });
        supabaseResponse = NextResponse.next({
          request: { headers: request.headers },
        });
        cookiesToSet.forEach(({ name, value, options }) => {
          supabaseResponse.cookies.set(name, value, options);
        });
      },
    },
  });

  return { supabase, supabaseResponse };
}
