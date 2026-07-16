import { createBrowserClient } from '@supabase/ssr';
import type { SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Faltan las variables de entorno de Supabase. Define NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_ANON_KEY en invoice-app/.env.local',
  );
}

/**
 * Cliente de navegador con sesión en cookies (@supabase/ssr), para que el
 * middleware del Portero Digital pueda leer la sesión en el servidor.
 */
export const supabase: SupabaseClient = createBrowserClient(supabaseUrl, supabaseAnonKey);
