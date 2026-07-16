import { requireActiveSubscriberOrRedirect } from '@/utils/portero';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  await requireActiveSubscriberOrRedirect('/dashboard');
  return children;
}
