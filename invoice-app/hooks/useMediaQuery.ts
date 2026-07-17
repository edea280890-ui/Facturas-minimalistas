'use client';

import { useEffect, useState } from 'react';

/**
 * Hook mínimo para reaccionar a un media query en cliente. Devuelve `false`
 * durante SSR/primer render (sin acceso a `window`) y se actualiza tras el
 * montaje y ante cualquier cambio de tamaño/orientación.
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const mediaQueryList = window.matchMedia(query);
    const update = () => setMatches(mediaQueryList.matches);

    update();
    mediaQueryList.addEventListener('change', update);
    return () => mediaQueryList.removeEventListener('change', update);
  }, [query]);

  return matches;
}
