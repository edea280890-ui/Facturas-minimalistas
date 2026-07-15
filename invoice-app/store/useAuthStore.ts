import { create } from 'zustand';
import type { Session } from '@supabase/supabase-js';
import { supabase } from '@/utils/supabase/client';

interface AuthState {
  session: Session | null;
  /** true una vez que se ha llamado a initialize(); no implica que la sesión ya se haya resuelto. */
  initialized: boolean;
  /** true una vez que la primera consulta a getSession() se ha resuelto (con o sin sesión). */
  sessionLoaded: boolean;
  initialize: () => void;
}

let unsubscribe: (() => void) | null = null;

export const useAuthStore = create<AuthState>((set, get) => ({
  session: null,
  initialized: false,
  sessionLoaded: false,

  initialize: () => {
    if (get().initialized) return;
    set({ initialized: true });

    supabase.auth
      .getSession()
      .then(({ data }) => set({ session: data.session, sessionLoaded: true }))
      .catch(() => set({ session: null, sessionLoaded: true }));

    const { data: sub } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      set({ session: nextSession, sessionLoaded: true });
    });

    unsubscribe = () => sub.subscription.unsubscribe();
  },
}));

/** Solo necesario para tests/HMR; en producción la suscripción vive durante toda la sesión del navegador. */
export function teardownAuthListener(): void {
  unsubscribe?.();
  unsubscribe = null;
}
