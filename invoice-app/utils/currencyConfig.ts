import { CurrencyCode, SUPPORTED_CURRENCIES } from '@/types/invoice';

export interface CurrencyOption {
  code: CurrencyCode;
  symbol: string;
  label: string;
}

/** Catálogo de monedas para Commercial Invoices. Sin sugerencias fiscales por país. */
export const CURRENCY_OPTIONS: CurrencyOption[] = [
  { code: 'USD', symbol: '$', label: 'US Dollar' },
  { code: 'EUR', symbol: '€', label: 'Euro' },
  { code: 'GBP', symbol: '£', label: 'British Pound' },
  { code: 'MXN', symbol: '$', label: 'Mexican Peso' },
  { code: 'ARS', symbol: '$', label: 'Argentine Peso' },
  { code: 'COP', symbol: '$', label: 'Colombian Peso' },
  { code: 'CLP', symbol: '$', label: 'Chilean Peso' },
  { code: 'PEN', symbol: 'S/', label: 'Peruvian Sol' },
];

export function getCurrencyOption(code: string): CurrencyOption {
  const match = CURRENCY_OPTIONS.find((option) => option.code === code);
  if (match) return match;
  return CURRENCY_OPTIONS[0];
}

export function formatCurrencySelectLabel(option: CurrencyOption): string {
  return `${option.code} (${option.symbol}) — ${option.label}`;
}

/** Garantiza que solo se usen códigos soportados por Intl y el selector. */
export function isSupportedCurrency(code: string): code is CurrencyCode {
  return (SUPPORTED_CURRENCIES as readonly string[]).includes(code);
}
