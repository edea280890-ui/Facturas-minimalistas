'use client';

import { useState } from 'react';
import { supabase } from '@/utils/supabase/client';
import { useToastStore } from '@/store/useToastStore';
import { buildLemonSqueezyCheckoutUrl } from '@/utils/lemonsqueezy/constants';
import { getHotmartCheckoutUrl } from '@/utils/hotmart/config';

/**
 * Inicia el upgrade a Pro. Preferencia:
 *   1. Lemon Squeezy — con `user_id` en custom data (si hay sesión).
 *   2. Hotmart — si `NEXT_PUBLIC_HOTMART_CHECKOUT_URL` está definido (link-out).
 *   3. Stripe Checkout — fallback vía `/api/checkout` (requiere sesión).
 */
export function useUpgradeCheckout() {
  const [upgrading, setUpgrading] = useState(false);
  const showToast = useToastStore((s) => s.showToast);

  const startCheckout = async () => {
    setUpgrading(true);
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session?.user?.id) {
        showToast('info', 'Te redirigimos a Lemon Squeezy para completar el pago de forma segura.');
        window.location.href = buildLemonSqueezyCheckoutUrl(session.user.id);
        return;
      }

      const hotmartUrl = getHotmartCheckoutUrl();
      if (hotmartUrl) {
        showToast(
          'info',
          'Te redirigimos a Hotmart. Usa el mismo correo con el que inicias sesión aquí para que se active tu Plan Pro.',
        );
        window.location.href = hotmartUrl;
        return;
      }

      showToast('error', 'Inicia sesión primero para actualizar a Pro.');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'No se pudo iniciar el proceso de pago.';
      showToast('error', message);
    } finally {
      setUpgrading(false);
    }
  };

  return { upgrading, startCheckout };
}
