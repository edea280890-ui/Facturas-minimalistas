/**
 * Emails con acceso de administrador al panel `/admin` y bypass del Portero
 * (pueden entrar aunque no estén en `subscribers`).
 *
 * Configura `ADMIN_EMAILS` como lista separada por comas en `.env.local`.
 */
export function getAdminEmails(): string[] {
  const raw = process.env.ADMIN_EMAILS ?? '';
  return raw
    .split(',')
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
}

export function isAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  return getAdminEmails().includes(email.trim().toLowerCase());
}
