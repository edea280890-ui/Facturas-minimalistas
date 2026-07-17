import { LineItem } from '@/types/invoice';

export function computeSubtotal(items: LineItem[]): number {
  return items.reduce((sum, item) => sum + item.quantity * item.price, 0);
}

export function computeTaxAmount(subtotal: number, taxEnabled: boolean, taxRate: number): number {
  if (!taxEnabled || !Number.isFinite(taxRate) || taxRate <= 0) return 0;
  return subtotal * (taxRate / 100);
}

export function computeTotal(subtotal: number, taxEnabled: boolean, taxRate: number): number {
  return subtotal + computeTaxAmount(subtotal, taxEnabled, taxRate);
}
