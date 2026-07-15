import { NextResponse } from 'next/server';
import type Stripe from 'stripe';
import { getStripeServerClient } from '@/utils/stripe/server';
import { getSupabaseAdminClient } from '@/utils/supabase/admin';

// El runtime Node.js es obligatorio: `stripe.webhooks.constructEvent` usa
// primitivas de crypto de Node que no están disponibles en el Edge Runtime.
export const runtime = 'nodejs';

/**
 * POST /api/webhooks/stripe
 *
 * Los Route Handlers de Next.js (App Router) NO parsean el body automáticamente
 * (a diferencia de las antiguas API Routes de `pages/api`, donde había que
 * desactivar `bodyParser`). Aquí basta con leer `request.text()` para obtener
 * el body crudo tal como Stripe lo firmó — es indispensable usar el texto sin
 * modificar, NUNCA `request.json()`, o la verificación de firma fallará.
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
    // Devolvemos 500 para que Stripe reintente la entrega del evento.
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
  const { error } = await supabaseAdmin
    .from('profiles')
    .update({ is_premium: true, stripe_customer_id: stripeCustomerId })
    .eq('id', userId);

  if (error) throw error;
}
