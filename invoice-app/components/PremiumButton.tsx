'use client';

import { useState } from 'react';
import { buildLemonSqueezyCheckoutUrl } from '@/utils/lemonsqueezy/constants';
import { PRO_PRICE_USD_LABEL } from '@/utils/stripe/constants';

interface PremiumButtonProps {
  /** UUID de Supabase (`auth.users.id`) del usuario autenticado. */
  userId: string;
  className?: string;
  label?: string;
  disabled?: boolean;
}

/**
 * Botón de upgrade a Pro vía Lemon Squeezy.
 * Redirige al checkout adjuntando `checkout[custom][user_id]` para que el
 * webhook pueda marcar `profiles.is_premium = true`.
 */
export default function PremiumButton({
  userId,
  className,
  label,
  disabled = false,
}: PremiumButtonProps) {
  const [redirecting, setRedirecting] = useState(false);

  const handleClick = () => {
    if (!userId || disabled || redirecting) return;
    setRedirecting(true);
    window.location.href = buildLemonSqueezyCheckoutUrl(userId);
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={disabled || redirecting || !userId}
      className={
        className ??
        'rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-slate-800 disabled:opacity-50'
      }
    >
      {redirecting ? 'Redirigiendo…' : (label ?? `Actualizar a Pro (${PRO_PRICE_USD_LABEL})`)}
    </button>
  );
}
