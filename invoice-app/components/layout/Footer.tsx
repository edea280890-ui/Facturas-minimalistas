import React from 'react';
import Link from 'next/link';

const CONTACT_EMAIL = 'edea280890@gmail.com';

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-6 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between md:px-8">
        <p>© {year} Generador de Facturas. Todos los derechos reservados.</p>

        <nav className="flex flex-wrap items-center gap-x-6 gap-y-2">
          <Link href="/#precios" className="hover:text-slate-900">
            Precios
          </Link>
          <Link href="/terms" className="hover:text-slate-900">
            Términos y Condiciones
          </Link>
          <Link href="/privacy" className="hover:text-slate-900">
            Política de Privacidad
          </Link>
          <a href={`mailto:${CONTACT_EMAIL}`} className="hover:text-slate-900">
            Contacto
          </a>
        </nav>
      </div>
    </footer>
  );
}
