import PublicNav from '@/components/landing/PublicNav';
import HeroSection from '@/components/landing/HeroSection';
import FeaturesSection from '@/components/landing/FeaturesSection';
import HotmartPricingSection from '@/components/landing/HotmartPricingSection';

/**
 * Landing page pública de marketing. A propósito NO tiene ninguna dependencia
 * de Supabase/Stripe/estado de sesión: es puramente presentacional, pensada
 * para conversión y para cumplir requisitos de compliance de pasarelas de
 * pago (enlaces legales visibles vía el Footer global, modelo de negocio
 * visible en la sección de precios).
 *
 * La aplicación funcional (login, formulario, guardado en la nube) vive en
 * `/app`. El CTA Pro usa `NEXT_PUBLIC_HOTMART_CHECKOUT_URL` cuando está
 * definido; si no, redirige a `/app` (Stripe como fallback).
 */
export default function LandingPage() {
  return (
    <main className="min-h-screen bg-white">
      <PublicNav />
      <HeroSection />
      <FeaturesSection />
      <HotmartPricingSection />
    </main>
  );
}
