import { create } from 'zustand';
import { supabase } from '@/utils/supabase/client';

interface ProfileRow {
  id: string;
  is_premium: boolean;
  stripe_customer_id: string | null;
}

interface ProfileState {
  isPremium: boolean;
  /** true una vez que se resolvió la primera consulta de perfil (con o sin premium). */
  profileLoaded: boolean;
  fetchProfile: (userId: string) => Promise<void>;
  reset: () => void;
}

const MAX_POLL_ATTEMPTS = 6;
const POLL_INTERVAL_MS = 1500;

export const useProfileStore = create<ProfileState>((set) => ({
  isPremium: false,
  profileLoaded: false,

  fetchProfile: async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('is_premium, stripe_customer_id')
        .eq('id', userId)
        .single();

      if (error) throw error;

      const row = data as ProfileRow;
      set({ isPremium: Boolean(row.is_premium), profileLoaded: true });
    } catch {
      // Si el perfil todavía no existe (p. ej. el trigger no ha corrido) tratamos
      // al usuario como no-premium, sin bloquear el resto de la UI.
      set({ isPremium: false, profileLoaded: true });
    }
  },

  reset: () => set({ isPremium: false, profileLoaded: false }),
}));

/**
 * Reintenta `fetchProfile` varias veces con espera entre intentos. Se usa tras
 * volver de Stripe Checkout, ya que el webhook que marca `is_premium = true`
 * puede tardar un instante en procesarse respecto al redirect de éxito.
 */
export async function pollProfileUntilPremium(userId: string): Promise<boolean> {
  for (let attempt = 0; attempt < MAX_POLL_ATTEMPTS; attempt += 1) {
    await useProfileStore.getState().fetchProfile(userId);
    if (useProfileStore.getState().isPremium) return true;
    if (attempt < MAX_POLL_ATTEMPTS - 1) {
      await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL_MS));
    }
  }
  return useProfileStore.getState().isPremium;
}
