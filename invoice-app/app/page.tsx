import PublicNav from '@/components/landing/PublicNav';
import HeroSection from '@/components/landing/HeroSection';
import FeaturesSection from '@/components/landing/FeaturesSection';
import HotmartPricingSection from '@/components/landing/HotmartPricingSection';

/**
 * Landing page pública de marketing. Sin lógica de sesión ni captura de
 * errores de auth (esos van a `/login?error=auth_failed` desde el callback).
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
