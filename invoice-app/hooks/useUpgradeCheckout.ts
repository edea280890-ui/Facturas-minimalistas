'use client';

import { useState } from 'react';
import { supabase } from '@/utils/supabase/client';
import { useToastStore } from '@/store/useToastStore';

/**
 * Encapsula el inicio del checkout de Stripe (obtener el token de sesión,
 * llamar a /api/checkout y redirigir). Se usa tanto desde el Header como
 * desde la sección de precios de la landing page, para no duplicar lógica.
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
