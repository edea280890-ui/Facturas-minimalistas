'use client';

import { useState } from 'react';
import { supabase } from '@/utils/supabase/client';
import { useToastStore } from '@/store/useToastStore';
import { getHotmartCheckoutUrl } from '@/utils/hotmart/config';

/**
 * Inicia el upgrade a Pro. Preferencia:
 *   1. Hotmart — si `NEXT_PUBLIC_HOTMART_CHECKOUT_URL` está definido (link-out).
 *   2. Stripe Checkout — fallback vía `/api/checkout` (requiere sesión).
 *
 * Se usa desde el Header y desde la sección de precios de `/app`.
 */
export function useUpgradeCheckout() {
  const [upgrading, setUpgrading] = useState(false);
  const showToast = useToastStore((s) => s.showToast);

  const startCheckout = async () => {
    const hotmartUrl = getHotmartCheckoutUrl();
    if (hotmartUrl) {
      showToast(
        'info',
        'Te redirigimos a Hotmart. Usa el mismo correo con el que inicias sesión aquí para que se active tu Plan Pro.',
      );
      window.location.href = hotmartUrl;
      return;
    }

    setUpgrading(true);
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const accessToken = session?.access_token;
      if (!accessToken) {
        showToast('error', 'Inicia sesión primero para actualizar a Pro.');
        return;
      }

      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const json = (await response.json()) as { url?: string; error?: string };

      if (!response.ok || !json.url) {
        throw new Error(json.error ?? 'No se pudo iniciar el proceso de pago.');
      }

      window.location.href = json.url;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'No se pudo iniciar el proceso de pago.';
      showToast('error', message);
    } finally {
      setUpgrading(false);
    }
  };

  return { upgrading, startCheckout };
}
