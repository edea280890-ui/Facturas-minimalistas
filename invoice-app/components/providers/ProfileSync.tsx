'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { useProfileStore } from '@/store/useProfileStore';

/**
 * Componente sin UI que mantiene `useProfileStore` sincronizado con la sesión:
 * carga el perfil (is_premium) al iniciar sesión y lo limpia al cerrar sesión.
 * Se monta una sola vez en `app/layout.tsx`.
 */
export default function ProfileSync() {
  const initialize = useAuthStore((s) => s.initialize);
  const userId = useAuthStore((s) => s.session?.user.id ?? null);
  const fetchProfile = useProfileStore((s) => s.fetchProfile);
  const reset = useProfileStore((s) => s.reset);

  useEffect(() => {
    initialize();
  }, [initialize]);

  useEffect(() => {
    if (userId) {
      fetchProfile(userId);
    } else {
      reset();
    }
  }, [userId, fetchProfile, reset]);

  return null;
}
