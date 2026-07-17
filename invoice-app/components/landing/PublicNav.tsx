import React from 'react';
import Link from 'next/link';

/**
 * Barra de navegación de la landing pública. A propósito NO tiene lógica de
 * sesión/Supabase: es puramente presentacional. El login real vive en `/app`.
 */
export default function PublicNav() {
  return (
    <header className="border-b border-slate-100 bg-white/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 md:px-8">
        <Link href="/" className="text-lg font-bold text-slate-900">
          Generador de Facturas
        </Link>

        <nav className="flex items-center gap-4 sm:gap-6">
          <a href="#caracteristicas" className="hidden text-sm font-medium text-slate-600 hover:text-slate-900 sm:inline">
            Características
          </a>
          <a href="#precios" className="hidden text-sm font-medium text-slate-600 hover:text-slate-900 sm:inline">
            Precios
          </a>
          <Link
            href="/login"
            className="hidden text-sm font-medium text-slate-600 hover:text-slate-900 sm:inline"
          >
            Iniciar sesión
          </Link>
          <Link
            href="/app"
            className="text-sm font-medium px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            Empezar gratis
          </Link>
        </nav>
      </div>
    </header>
  );
}
