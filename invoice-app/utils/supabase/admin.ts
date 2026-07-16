import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { requireEnv } from '@/utils/env';

let adminSingleton: SupabaseClient | null = null;

/**
 * Cliente de Supabase con la Service Role Key: ignora RLS por completo.
 * Uso EXCLUSIVO en el servidor (Route Handlers / webhooks). Nunca debe
 * importarse desde un componente 'use client' ni exponerse al navegador.
 */
export function getSupabaseAdminClient(): SupabaseClient {
  if (adminSingleton) return adminSingleton;

  const supabaseUrl = requireEnv('NEXT_PUBLIC_SUPABASE_URL');
  const serviceRoleKey = requireEnv('SUPABASE_SERVICE_ROLE_KEY');

  adminSingleton = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return adminSingleton;
}
