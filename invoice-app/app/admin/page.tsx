import { redirect } from 'next/navigation';
import { createSupabaseServerClient } from '@/utils/supabase/server';
import { getSupabaseAdminClient } from '@/utils/supabase/admin';
import { isAdminEmail } from '@/utils/adminEmails';
import AdminSubscribersClient from '@/components/admin/AdminSubscribersClient';
import type { Subscriber } from '@/utils/subscribers';

export const dynamic = 'force-dynamic';

/**
 * Panel del Portero Digital (solo ADMIN_EMAILS).
 * Los datos se cargan en el servidor; las acciones viven en el client component.
 */
export default async function AdminPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email || !isAdminEmail(user.email)) {
    redirect('/app');
  }

  const admin = getSupabaseAdminClient();
  const { data, error } = await admin
    .from('subscribers')
    .select('email, status, created_at, updated_at')
    .order('created_at', { ascending: false });

  if (error) {
    return (
      <main className="min-h-screen bg-slate-50 px-4 py-10">
        <div className="mx-auto max-w-4xl rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          No se pudo cargar suscriptores: {error.message}. ¿Ejecutaste{' '}
          <code>supabase/subscribers.sql</code> en el SQL Editor?
        </div>
      </main>
    );
  }

  const subscribers = (data ?? []) as Subscriber[];
  const activeCount = subscribers.filter((s) => s.status === 'active').length;

  return (
    <AdminSubscribersClient
      initialSubscribers={subscribers}
      initialActiveCount={activeCount}
      initialTotalCount={subscribers.length}
    />
  );
}
