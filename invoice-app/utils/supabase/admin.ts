import { createClient, type SupabaseClient } from '@supabase/supabase-js';

let adminSingleton: SupabaseClient | null = null;

/**
 * Cliente de Supabase con la Service Role Key: ignora RLS por completo.
 * Uso EXCLUSIVO en el servidor (Route Handlers / webhooks). Nunca debe
 * importarse desde un componente 'use client' ni exponerse al navegador.
 */
export function getSupabaseAdminClient(): SupabaseClient {
  if (adminSingleton) return adminSingleton;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error(
      'Faltan NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY. Configura la Service Role Key como variable de entorno del servidor.',
    );
  }

  adminSingleton = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return adminSingleton;
}
