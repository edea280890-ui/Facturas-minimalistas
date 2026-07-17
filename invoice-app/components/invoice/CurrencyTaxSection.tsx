'use client';

import { CURRENCY_OPTIONS, formatCurrencySelectLabel, getCurrencyOption } from '@/utils/currencyConfig';
import { CurrencyCode } from '@/types/invoice';
import { DeferredNumberInput } from './DeferredNumberInput';

interface CurrencyTaxSectionProps {
  currency: string;
  taxRate: number;
  onCurrencyChange: (currency: CurrencyCode) => void;
  onTaxRateCommit: (rate: number) => void;
  onTaxRateDraft?: (rate: number) => void;
  inputClass: string;
  labelClass: string;
}

/**
 * Selector de moneda + taxRate numérico simple (inicia en 0).
 * Sin matrices fiscales por país ni toggles locales.
 */
export function CurrencyTaxSection({
  currency,
  taxRate,
  onCurrencyChange,
  onTaxRateCommit,
  onTaxRateDraft,
  inputClass,
  labelClass,
}: CurrencyTaxSectionProps) {
  const selected = getCurrencyOption(currency);

  return (
    <div className="space-y-4">
      <div>
        <label className={labelClass} htmlFor="invoice-currency">
          Currency
        </label>
        <select
          id="invoice-currency"
          value={currency}
          onChange={(e) => onCurrencyChange(e.target.value as CurrencyCode)}
          className={inputClass}
        >
          {CURRENCY_OPTIONS.map((option) => (
            <option key={option.code} value={option.code}>
              {formatCurrencySelectLabel(option)}
            </option>
          ))}
        </select>
        <p className="mt-1.5 text-xs text-slate-500">
          Active symbol: <span className="font-medium text-slate-700">{selected.symbol}</span>
        </p>
      </div>

      <DeferredNumberInput
        label="Tax / Retention / Discount (%)"
        value={taxRate}
        onDraftChange={onTaxRateDraft}
        onCommit={onTaxRateCommit}
        inputClass={inputClass}
        labelClass={labelClass}
        min={0}
        max={100}
        step={0.01}
        placeholder="0"
      />
    </div>
  );
}
