import { PRODUCT_NAME } from '@/utils/brand';

export const metadata = {
  title: `${PRODUCT_NAME} — Próximamente`,
  description: `${PRODUCT_NAME} estará disponible muy pronto.`,
  robots: { index: false, follow: false },
};

/**
 * Telón / Coming Soon. Sin navbar ni CTAs de producto.
 * El Footer del layout raíz se oculta en esta ruta.
 */
export default function MaintenancePage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 px-6 text-center">
      <div className="max-w-lg">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-400">
          {PRODUCT_NAME}
        </p>
        <h1 className="mt-4 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
          Estamos preparando algo increíble.
        </h1>
        <p className="mt-4 text-base leading-relaxed text-slate-300 sm:text-lg">
          FacturaExterior estará disponible muy pronto. Estamos afinando los últimos detalles.
        </p>
      </div>
    </main>
  );
}
