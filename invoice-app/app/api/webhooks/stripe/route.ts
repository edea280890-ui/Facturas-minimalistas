import { NextResponse } from 'next/server';
import type Stripe from 'stripe';
import { getStripeServerClient } from '@/utils/stripe/server';
import { getSupabaseAdminClient } from '@/utils/supabase/admin';
import { upsertSubscriber } from '@/utils/subscribers';

export const runtime = 'nodejs';

/**
 * POST /api/webhooks/stripe
 *
 * Además de marcar `profiles.is_premium`, registra el email en `subscribers`
 * para que el Portero Digital permita el acceso.
 */
export async function POST(request: Request) {
  const signature = request.headers.get('stripe-signature');
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!signature) {
    return NextResponse.json({ error: 'Falta la cabecera stripe-signature.' }, { status: 400 });
  }
  if (!webhookSecret) {
    return NextResponse.json({ error: 'STRIPE_WEBHOOK_SECRET no está configurado en el servidor.' }, { status: 500 });
  }

  const rawBody = await request.text();

  let event: Stripe.Event;
  try {
    const stripe = getStripeServerClient();
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Firma inválida.';
    return NextResponse.json({ error: `Webhook inválido: ${message}` }, { status: 400 });
  }

  try {
    if (event.type === 'checkout.session.completed') {
      await handleCheckoutSessionCompleted(event.data.object as Stripe.Checkout.Session);
    }
    return NextResponse.json({ received: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Error al procesar el evento del webhook.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session): Promise<void> {
  const userId = session.metadata?.supabase_user_id;
  if (!userId) {
    throw new Error('La sesión de Stripe no incluye metadata.supabase_user_id.');
  }
  if (session.payment_status !== 'paid') {
    return;
  }

  const stripeCustomerId =
    typeof session.customer === 'string' ? session.customer : session.customer?.id ?? null;

  const supabaseAdmin = getSupabaseAdminClient();

  const { data: userData, error: userError } = await supabaseAdmin.auth.admin.getUserById(userId);
  if (userError) throw userError;
  const email = userData.user?.email?.trim().toLowerCase();
  if (email) {
    await upsertSubscriber(supabaseAdmin, email, 'active');
  }

  const { error } = await supabaseAdmin
    .from('profiles')
    .update({ is_premium: true, stripe_customer_id: stripeCustomerId })
    .eq('id', userId);

  if (error) throw error;
}
