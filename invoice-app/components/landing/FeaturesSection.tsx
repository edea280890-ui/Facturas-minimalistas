import React from 'react';

interface Feature {
  title: string;
  description: string;
  icon: React.ReactNode;
}

const iconClass = 'h-6 w-6';

const FEATURES: Feature[] = [
  {
    title: 'Rapidez',
    description: 'Genera una factura completa y su PDF en menos de un minuto, sin plantillas ni hojas de cálculo.',
    icon: (
      <svg className={iconClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M13 2L4 14h6l-1 8 9-12h-6l1-8z" />
      </svg>
    ),
  },
  {
    title: 'Historial de clientes',
    description: 'Guarda tus facturas en la nube y consúltalas, edítalas o elimínalas cuando lo necesites.',
    icon: (
      <svg className={iconClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
        <circle cx="12" cy="12" r="9" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 7v5l3 3" />
      </svg>
    ),
  },
  {
    title: 'PDF automático',
    description: 'Exporta cada factura como un PDF profesional listo para enviar, con un solo clic.',
    icon: (
      <svg className={iconClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M7 3h7l4 4v13a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M14 3v4h4M9 13h6M9 16h6" />
      </svg>
    ),
  },
  {
    title: 'Multi-moneda',
    description: 'Factura en USD, EUR, MXN, ARS, COP, CLP, PEN y GBP, con formato de moneda correcto en cada una.',
    icon: (
      <svg className={iconClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
        <circle cx="12" cy="12" r="9" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 3a15 15 0 0 0 0 18M3 12h18" />
      </svg>
    ),
  },
];

export default function FeaturesSection() {
  return (
    <section id="caracteristicas" className="bg-white px-4 py-16 md:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold text-slate-900">Todo lo que necesitas para facturar</h2>
          <p className="mt-3 text-slate-600">Diseñado para que factures rápido y no vuelvas a perder el rastro de un cobro.</p>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map((feature) => (
            <div key={feature.title} className="rounded-xl border border-slate-100 p-6 text-center sm:text-left">
              <span className="inline-flex h-12 w-12 items-center justify-center rounded-lg bg-slate-900 text-white">
                {feature.icon}
              </span>
              <h3 className="mt-4 text-base font-semibold text-slate-900">{feature.title}</h3>
              <p className="mt-2 text-sm text-slate-500">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
