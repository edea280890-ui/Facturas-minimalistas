/**
 * Checkout de Lemon Squeezy (Merchant of Record) para FacturaExterior Pro.
 * El `user_id` de Supabase se adjunta como custom data para el webhook.
 */
export const LEMONSQUEEZY_CHECKOUT_BASE_URL =
  'https://generador-de-facturas.lemonsqueezy.com/checkout/buy/160a7d38-5699-476f-9c30-19086e07f11a';

/**
 * Construye la URL de checkout con el UUID de Supabase del comprador.
 * Formato requerido: `URL_BASE?checkout[custom][user_id]=${userId}`
 */
export function buildLemonSqueezyCheckoutUrl(userId: string): string {
  const encoded = encodeURIComponent(userId);
  return `${LEMONSQUEEZY_CHECKOUT_BASE_URL}?checkout[custom][user_id]=${encoded}`;
}
