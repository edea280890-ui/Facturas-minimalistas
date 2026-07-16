import type { SupabaseClient } from '@supabase/supabase-js';

export type SubscriberStatus = 'active' | 'canceled';

export interface Subscriber {
  email: string;
  status: SubscriberStatus;
  created_at: string;
  updated_at?: string;
}

/**
 * Upsert en la lista de invitados del Portero Digital.
 * Solo usar con el cliente admin (Service Role).
 */
export async function upsertSubscriber(
  supabaseAdmin: SupabaseClient,
  email: string,
  status: SubscriberStatus,
): Promise<void> {
  const normalized = email.trim().toLowerCase();
  const { error } = await supabaseAdmin.from('subscribers').upsert(
    { email: normalized, status, updated_at: new Date().toISOString() },
    { onConflict: 'email' },
  );
  if (error) throw error;
}

/**
 * ¿El email tiene acceso activo? Consulta con el cliente del usuario
 * (RLS: solo ve su propia fila) o con admin.
 */
export async function isActiveSubscriber(
  supabase: SupabaseClient,
  email: string,
): Promise<boolean> {
  const normalized = email.trim().toLowerCase();
  const { data, error } = await supabase
    .from('subscribers')
    .select('status')
    .eq('email', normalized)
    .maybeSingle();

  if (error) throw error;
  return data?.status === 'active';
}
