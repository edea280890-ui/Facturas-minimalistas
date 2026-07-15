/** Convierte un número de factura en un nombre de archivo seguro para descargar. */
export function invoicePdfFilename(invoiceNumber: string): string {
  const safeNumber = invoiceNumber.trim().replace(/[^a-zA-Z0-9-_]+/g, '-').replace(/^-+|-+$/g, '');
  return `factura-${safeNumber || 'sin-numero'}.pdf`;
}
