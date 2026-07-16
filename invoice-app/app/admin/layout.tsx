import { requireAdminOrRedirect } from '@/utils/portero';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireAdminOrRedirect();
  return children;
}
