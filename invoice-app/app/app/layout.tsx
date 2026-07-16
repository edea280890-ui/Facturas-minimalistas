import { requireActiveSubscriberOrRedirect } from '@/utils/portero';

/**
 * Layout del editor (/app): exige sesión + suscriptor active (o admin).
 */
export default async function AppSectionLayout({ children }: { children: React.ReactNode }) {
  await requireActiveSubscriberOrRedirect('/app');
  return children;
}
