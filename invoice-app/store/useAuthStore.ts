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

    // `supabase.auth` puede lanzar de forma síncrona (cliente perezoso) si
    // faltan las variables de entorno de Supabase. Sin este try/catch, ese
    // throw ocurriría dentro de un useEffect (ProfileSync se monta en el
    // layout raíz) y rompería el render de TODA la app. Con él, la sesión
    // simplemente queda en null y el resto de la UI se muestra con normalidad.
    try {
      supabase.auth
        .getSession()
        .then(({ data }) => set({ session: data.session, sessionLoaded: true }))
        .catch(() => set({ session: null, sessionLoaded: true }));

      const { data: sub } = supabase.auth.onAuthStateChange((_event, nextSession) => {
        set({ session: nextSession, sessionLoaded: true });
      });

      unsubscribe = () => sub.subscription.unsubscribe();
    } catch (err) {
      console.error('[useAuthStore] No se pudo inicializar Supabase Auth:', err);
      set({ session: null, sessionLoaded: true });
    }
  },
}));

/** Solo necesario para tests/HMR; en producción la suscripción vive durante toda la sesión del navegador. */
export function teardownAuthListener(): void {
  unsubscribe?.();
  unsubscribe = null;
}
