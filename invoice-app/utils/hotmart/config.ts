/**
 * Configuración pública de Hotmart (disponible en cliente y servidor).
 *
 * `NEXT_PUBLIC_HOTMART_CHECKOUT_URL` es el enlace de checkout del producto Pro
 * en Hotmart (p. ej. `https://pay.hotmart.com/...`). Si está vacío, la app
 * usa Stripe Checkout como fallback en `/app`.
 */
export function getHotmartCheckoutUrl(): string {
  return (process.env.NEXT_PUBLIC_HOTMART_CHECKOUT_URL ?? '').trim();
}

export function isHotmartCheckoutConfigured(): boolean {
  return getHotmartCheckoutUrl().length > 0;
}
