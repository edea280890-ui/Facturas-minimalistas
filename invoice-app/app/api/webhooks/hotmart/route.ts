import { NextResponse } from 'next/server';
import { getSupabaseAdminClient } from '@/utils/supabase/admin';
import { HotmartWebhookPayload, HOTMART_APPROVED_STATUSES } from '@/types/hotmart';

export const runtime = 'nodejs';

/**
 * POST /api/webhooks/hotmart
 *
 * Recibe las notificaciones de compra de Hotmart y, cuando el pago fue
 * aprobado, otorga acceso Pro al comprador en nuestra base de datos.
 *
 * Seguridad: Hotmart no firma el payload con HMAC (a diferencia de Stripe),
 * así que la validación consiste en comparar el `hottok` (un token secreto
 * que configuras en el panel de Hotmart) contra `process.env.HOTMART_HOTTOK`.
 * Hotmart puede enviar ese token en distintos lugares según la configuración
 * del webhook, así que revisamos, en este orden: la cabecera
 * `X-HOTMART-HOTTOK`, el query string (`?hottok=...`, si así se configuró la
 * URL del webhook en el panel) y el propio cuerpo JSON (`{ "hottok": "..." }`).
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
      // Compra cancelada, reembolsada, pendiente, etc.: reconocemos el evento
      // sin otorgar acceso. Devolver 200 evita que Hotmart siga reintentando.
      return NextResponse.json({ received: true, granted: false, status: status ?? null });
    }

    await grantPremiumAccessByEmail(email);

    return NextResponse.json({ received: true, granted: true, email });
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
 * ── AQUÍ VA LA LÓGICA DE NEGOCIO ─────────────────────────────────────────
 *
 * Otorga acceso Pro al comprador identificado por su correo electrónico:
 *   1. Busca si ya existe un usuario de Supabase Auth con ese correo.
 *   2. Si no existe, lo crea (auto-provisioning): el comprador podrá iniciar
 *      sesión más adelante con un Magic Link enviado a ese mismo correo,
 *      sin necesidad de contraseña.
 *   3. Marca `profiles.is_premium = true` para ese usuario.
 *
 * Notas / limitaciones a revisar antes de producción:
 * - La búsqueda por email usa `auth.admin.listUsers()` paginado, comparando
 *   el email en memoria con `===` exacto. ¡IMPORTANTE! No usar el parámetro
 *   `?email=` del endpoint REST de administración de GoTrue como filtro: se
 *   verificó manualmente que en este proyecto ese parámetro NO filtra de
 *   forma exacta (devuelve un usuario arbitrario sin importar el valor), lo
 *   cual causó el borrado accidental de una cuenta real durante las pruebas
 *   de este endpoint. Para volúmenes altos de usuarios, la alternativa segura
 *   es una función RPC en Postgres que consulte `auth.users` por email.
 * - No se ha probado contra un payload real de Hotmart todavía: verifica que
 *   `extractBuyerEmail`/`extractPurchaseStatus` matcheen el payload real que
 *   llegue a este endpoint (puedes loguear `payload` temporalmente) y ajusta
 *   `types/hotmart.ts` si el formato difiere.
 * - Este flujo no distingue entre "Plan Básico" y "Plan Pro" de Hotmart; si
 *   se venden productos distintos, usa `payload.data?.product?.id` para
 *   diferenciar qué acceso otorgar.
 */
async function grantPremiumAccessByEmail(email: string): Promise<void> {
  const supabaseAdmin = getSupabaseAdminClient();

  let userId = await findUserIdByEmail(email);

  if (!userId) {
    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email,
      email_confirm: true,
    });
    if (error) throw error;
    userId = data.user?.id ?? null;
  }

  if (!userId) {
    throw new Error(`No se pudo crear ni encontrar un usuario de Supabase para ${email}.`);
  }

  const { error: upsertError } = await supabaseAdmin
    .from('profiles')
    .upsert({ id: userId, is_premium: true }, { onConflict: 'id' });

  if (upsertError) throw upsertError;
}

async function findUserIdByEmail(email: string): Promise<string | null> {
  const supabaseAdmin = getSupabaseAdminClient();
  const normalizedEmail = email.trim().toLowerCase();
  const perPage = 200;

  for (let page = 1; page <= 50; page += 1) {
    const { data, error } = await supabaseAdmin.auth.admin.listUsers({ page, perPage });
    if (error) throw error;

    // Comparación EXACTA en memoria. No confiar en filtros de query string
    // del endpoint admin de GoTrue para esto (ver nota arriba).
    const match = data.users.find((user) => user.email?.toLowerCase() === normalizedEmail);
    if (match) return match.id;

    if (data.users.length < perPage) return null;
  }

  return null;
}
