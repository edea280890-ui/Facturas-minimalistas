import { CurrencyCode, SUPPORTED_CURRENCIES } from '@/types/invoice';

export interface CurrencyOption {
  code: CurrencyCode;
  symbol: string;
  label: string;
  taxEnabledByDefault: boolean;
  suggestedTaxRate: number;
}

export const CURRENCY_OPTIONS: CurrencyOption[] = [
  { code: 'USD', symbol: '$', label: 'Dólar estadounidense', taxEnabledByDefault: false, suggestedTaxRate: 0 },
  { code: 'EUR', symbol: '€', label: 'Euro', taxEnabledByDefault: true, suggestedTaxRate: 21 },
  { code: 'GBP', symbol: '£', label: 'Libra esterlina', taxEnabledByDefault: true, suggestedTaxRate: 20 },
  { code: 'MXN', symbol: '$', label: 'Peso mexicano', taxEnabledByDefault: true, suggestedTaxRate: 16 },
  { code: 'ARS', symbol: '$', label: 'Peso argentino', taxEnabledByDefault: true, suggestedTaxRate: 21 },
  { code: 'COP', symbol: '$', label: 'Peso colombiano', taxEnabledByDefault: true, suggestedTaxRate: 19 },
  { code: 'CLP', symbol: '$', label: 'Peso chileno', taxEnabledByDefault: true, suggestedTaxRate: 19 },
  { code: 'PEN', symbol: 'S/', label: 'Sol peruano', taxEnabledByDefault: true, suggestedTaxRate: 18 },
];

export function getCurrencyOption(code: string): CurrencyOption {
  const match = CURRENCY_OPTIONS.find((option) => option.code === code);
  if (match) return match;
  return CURRENCY_OPTIONS[0];
}

export function formatCurrencySelectLabel(option: CurrencyOption): string {
  return `${option.code} (${option.symbol}) — ${option.label}`;
}

export function getDefaultTaxForCurrency(code: string): { taxEnabled: boolean; taxRate: number } {
  const option = getCurrencyOption(code);
  return {
    taxEnabled: option.taxEnabledByDefault,
    taxRate: option.suggestedTaxRate,
  };
}

/** Garantiza que solo se usen códigos soportados por Intl y el selector. */
export function isSupportedCurrency(code: string): code is CurrencyCode {
  return (SUPPORTED_CURRENCIES as readonly string[]).includes(code);
}
