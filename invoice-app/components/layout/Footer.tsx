import React from 'react';
import Link from 'next/link';

const SUPPORT_EMAIL = 'soporte@sirappstudio.com';

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-6 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between md:px-8">
        <p>© {year} Generador de Facturas. Todos los derechos reservados.</p>

        <nav aria-label="Enlaces legales y contacto" className="flex flex-wrap items-center gap-x-6 gap-y-2">
          <Link href="/terms" className="hover:text-slate-900">
            Terms
          </Link>
          <Link href="/privacy" className="hover:text-slate-900">
            Privacy
          </Link>
          <Link href="/refund" className="hover:text-slate-900">
            Refund
          </Link>
          <a href={`mailto:${SUPPORT_EMAIL}`} className="hover:text-slate-900">
            {SUPPORT_EMAIL}
          </a>
        </nav>
      </div>
    </footer>
  );
}
