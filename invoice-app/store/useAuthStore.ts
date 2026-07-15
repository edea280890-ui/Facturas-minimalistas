import { create } from 'zustand';
import type { Session } from '@supabase/supabase-js';
import { supabase } from '@/utils/supabase/client';

interface AuthState {
  session: Session | null;
  initialized: boolean;
  initialize: () => void;
}

let unsubscribe: (() => void) | null = null;

export const useAuthStore = create<AuthState>((set, get) => ({
  session: null,
  initialized: false,

  initialize: () => {
    if (get().initialized) return;
    set({ initialized: true });

    supabase.auth
      .getSession()
      .then(({ data }) => set({ session: data.session }))
      .catch(() => set({ session: null }));

    const { data: sub } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      set({ session: nextSession });
    });

    unsubscribe = () => sub.subscription.unsubscribe();
  },
}));

/** Solo necesario para tests/HMR; en producción la suscripción vive durante toda la sesión del navegador. */
export function teardownAuthListener(): void {
  unsubscribe?.();
  unsubscribe = null;
}
