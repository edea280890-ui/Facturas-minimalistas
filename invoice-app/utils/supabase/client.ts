import { createBrowserClient } from '@supabase/ssr';
import type { SupabaseClient } from '@supabase/supabase-js';
import { requireEnv } from '@/utils/env';

const supabaseUrl = requireEnv('NEXT_PUBLIC_SUPABASE_URL');
const supabaseAnonKey = requireEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY');

/**
 * Cliente de navegador con sesión en cookies (@supabase/ssr).
 */
export const supabase: SupabaseClient = createBrowserClient(supabaseUrl, supabaseAnonKey);
