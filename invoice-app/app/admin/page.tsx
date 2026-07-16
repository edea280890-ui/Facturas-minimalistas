import { redirect } from 'next/navigation';
import Link from 'next/link';
import { createSupabaseServerClient } from '@/utils/supabase/server';
import { getSupabaseAdminClient } from '@/utils/supabase/admin';
import { isAdminEmail } from '@/utils/adminEmails';
import AdminSubscribersClient from '@/components/admin/AdminSubscribersClient';
import type { Subscriber } from '@/utils/subscribers';

export const dynamic = 'force-dynamic';

/**
 * Panel de Administración — lista de suscriptores del Portero Digital.
 *
 * Seguridad (importante): NO usamos el Service Role sin comprobar identidad.
 * Solo emails en `ADMIN_EMAILS` pueden ver esta página. El proxy también
 * bloquea `/admin` al resto de usuarios.
 */
export default async function AdminPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email || !isAdminEmail(user.email)) {
    redirect('/login?next=/admin');
  }

  // Service Role solo en servidor (nunca se envía al navegador).
  const admin = getSupabaseAdminClient();
  const { data: subscribers, error } = await admin
    .from('subscribers')
    .select('email, status, created_at, updated_at')
    .order('created_at', { ascending: false });

  if (error) {
    return (
      <div style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
        <h1>Panel de Administración</h1>
        <p style={{ color: '#b91c1c' }}>Error cargando datos: {error.message}</p>
        <p style={{ color: '#64748b', fontSize: 14 }}>
          Si la tabla no existe, ejecuta <code>invoice-app/supabase/subscribers.sql</code> en el
          SQL Editor de Supabase.
        </p>
        <Link href="/app">← Volver a la app</Link>
      </div>
    );
  }

  const rows = (subscribers ?? []) as Subscriber[];
  const activeCount = rows.filter((s) => s.status === 'active').length;

  return (
    <AdminSubscribersClient
      initialSubscribers={rows}
      initialActiveCount={activeCount}
      initialTotalCount={rows.length}
    />
  );
}
