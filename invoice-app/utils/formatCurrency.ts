/**
 * Formatea un importe según la divisa de la factura usando Intl.NumberFormat.
 * Se usa tanto en la UI (React) como en el documento PDF (@react-pdf/renderer),
 * por lo que no depende de ningún API específico del navegador o del DOM.
 */
export function formatCurrency(amount: number, currency: string, locale = 'es-ES'): string {
  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(Number.isFinite(amount) ? amount : 0);
  } catch {
    // Divisa no reconocida por Intl: se recurre a un formato simple de respaldo.
    return `${currency} ${(Number.isFinite(amount) ? amount : 0).toFixed(2)}`;
  }
}
