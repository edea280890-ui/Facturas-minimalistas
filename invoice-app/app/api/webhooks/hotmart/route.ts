import { NextResponse } from 'next/server';
import { getSupabaseAdminClient } from '@/utils/supabase/admin';
import { upsertSubscriber } from '@/utils/subscribers';
import { HotmartWebhookPayload, HOTMART_APPROVED_STATUSES } from '@/types/hotmart';

export const runtime = 'nodejs';

/**
 * POST /api/webhooks/hotmart
 *
 * 1. Valida hottok.
 * 2. Extrae email + status de la compra.
 * 3. Si aprobado → upsert en `subscribers` (active) + provisiona Auth/Pro.
 * 4. Si cancelado/reembolsado → marca subscriber canceled y revoca premium.
 */
export async function POST(request: Request) {
  try {
    const expectedToken = process.env.HOTMART_HOTTOK;
    if (!expectedToken) {
      return NextResponse.json(
        { error: 'HOTMART_HOTTOK no está configurado en el servidor.' },
        { status: 500 },
      );
    }

    const payload = (await request.json()) as HotmartWebhookPayload;

    const receivedToken =
      request.headers.get('x-hotmart-hottok') ??
      new URL(request.url).searchParams.get('hottok') ??
      payload.hottok ??
      null;

    if (!receivedToken || receivedToken !== expectedToken) {
      return NextResponse.json({ error: 'hottok inválido o ausente.' }, { status: 401 });
    }

    const email = extractBuyerEmail(payload);
    const status = extractPurchaseStatus(payload);

    if (!email) {
      return NextResponse.json(
        { error: 'No se encontró el email del comprador en el payload.' },
        { status: 400 },
      );
    }

    const isApproved = status ? HOTMART_APPROVED_STATUSES.includes(status.toUpperCase()) : false;

    if (!isApproved) {
      await revokeAccessByEmail(email);
      return NextResponse.json({ received: true, granted: false, status: status ?? null });
    }

    await grantAccessByEmail(email);

    return NextResponse.json({ received: true, granted: true, email: email.trim().toLowerCase() });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Error al procesar el webhook de Hotmart.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

function extractBuyerEmail(payload: HotmartWebhookPayload): string | null {
  return (
    payload.data?.buyer?.email ??
    payload.data?.subscriber?.email ??
    payload.email ??
    null
  );
}

function extractPurchaseStatus(payload: HotmartWebhookPayload): string | null {
  return (
    payload.data?.purchase?.status ??
    payload.data?.subscription?.status ??
    payload.status ??
    null
  );
}

/**
 * Lista de invitados + acceso Pro:
 * 1. Upsert en `subscribers` con status active.
 * 2. Busca o crea usuario Auth (Magic Link).
 * 3. Marca `profiles.is_premium = true` (compatibilidad con RLS de invoices).
 */
async function grantAccessByEmail(email: string): Promise<void> {
  const supabaseAdmin = getSupabaseAdminClient();
  const normalized = email.trim().toLowerCase();

  await upsertSubscriber(supabaseAdmin, normalized, 'active');

  let userId = await findUserIdByEmail(normalized);

  if (!userId) {
    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email: normalized,
      email_confirm: true,
    });
    if (error) throw error;
    userId = data.user?.id ?? null;
  }

  if (!userId) {
    throw new Error(`No se pudo crear ni encontrar un usuario de Supabase para ${normalized}.`);
  }

  const { error: upsertError } = await supabaseAdmin
    .from('profiles')
    .upsert({ id: userId, is_premium: true }, { onConflict: 'id' });

  if (upsertError) throw upsertError;
}

async function revokeAccessByEmail(email: string): Promise<void> {
  const supabaseAdmin = getSupabaseAdminClient();
  const normalized = email.trim().toLowerCase();

  await upsertSubscriber(supabaseAdmin, normalized, 'canceled');

  const userId = await findUserIdByEmail(normalized);
  if (!userId) return;

  const { error } = await supabaseAdmin
    .from('profiles')
    .update({ is_premium: false })
    .eq('id', userId);

  if (error) throw error;
}

async function findUserIdByEmail(email: string): Promise<string | null> {
  const supabaseAdmin = getSupabaseAdminClient();
  const normalizedEmail = email.trim().toLowerCase();
  const perPage = 200;

  for (let page = 1; page <= 50; page += 1) {
    const { data, error } = await supabaseAdmin.auth.admin.listUsers({ page, perPage });
    if (error) throw error;

    const match = data.users.find((user) => user.email?.toLowerCase() === normalizedEmail);
    if (match) return match.id;

    if (data.users.length < perPage) return null;
  }

  return null;
}
