import { LineItem } from '@/types/invoice';

export function computeSubtotal(items: LineItem[]): number {
  return items.reduce((sum, item) => sum + item.quantity * item.price, 0);
}

/** Impuesto = Subtotal × taxRate / 100. Si taxRate ≤ 0, el monto es 0. */
export function computeTaxAmount(subtotal: number, taxRate: number): number {
  if (!Number.isFinite(taxRate) || taxRate <= 0) return 0;
  return subtotal * (taxRate / 100);
}

/** Total = Subtotal + (Subtotal × taxRate / 100). */
export function computeTotal(subtotal: number, taxRate: number): number {
  return subtotal + computeTaxAmount(subtotal, taxRate);
}
