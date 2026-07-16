import React from 'react';

interface LegalSectionProps {
  title: string;
  children: React.ReactNode;
}

/** Bloque de sección numerada reutilizado en las páginas legales. */
export default function LegalSection({ title, children }: LegalSectionProps) {
  return (
    <section>
      <h2 className="mb-2 text-lg font-semibold text-slate-900">{title}</h2>
      <div className="space-y-3">{children}</div>
    </section>
  );
}
