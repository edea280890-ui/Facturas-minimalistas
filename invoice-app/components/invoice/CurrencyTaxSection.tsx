'use client';

import { CURRENCY_OPTIONS, formatCurrencySelectLabel, getDefaultTaxForCurrency } from '@/utils/currencyConfig';
import { CurrencyCode } from '@/types/invoice';
import { DeferredNumberInput } from './DeferredNumberInput';

interface CurrencyTaxSectionProps {
  currency: string;
  taxEnabled: boolean;
  taxRate: number;
  onCurrencyChange: (currency: CurrencyCode) => void;
  onTaxEnabledChange: (enabled: boolean) => void;
  onTaxRateCommit: (rate: number) => void;
  onTaxRateDraft?: (rate: number) => void;
  inputClass: string;
  labelClass: string;
}

export function CurrencyTaxSection({
  currency,
  taxEnabled,
  taxRate,
  onCurrencyChange,
  onTaxEnabledChange,
  onTaxRateCommit,
  onTaxRateDraft,
  inputClass,
  labelClass,
}: CurrencyTaxSectionProps) {
  const selected = CURRENCY_OPTIONS.find((option) => option.code === currency) ?? CURRENCY_OPTIONS[0];
  const suggestedRate = getDefaultTaxForCurrency(currency).taxRate;

  return (
    <div className="space-y-4">
      <div>
        <label className={labelClass} htmlFor="invoice-currency">
          Moneda
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
          Símbolo activo: <span className="font-medium text-slate-700">{selected.symbol}</span>
        </p>
      </div>

      <div className="rounded-lg border border-slate-200 bg-slate-50/80 p-4">
        <label className="flex cursor-pointer items-center gap-3">
          <input
            type="checkbox"
            checked={taxEnabled}
            onChange={(e) => onTaxEnabledChange(e.target.checked)}
            className="h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-400"
          />
          <span className="text-sm font-medium text-slate-800">Agregar impuestos</span>
        </label>

        {taxEnabled && (
          <div className="mt-3">
            <DeferredNumberInput
              label="Porcentaje de impuesto (%)"
              value={taxRate}
              onDraftChange={onTaxRateDraft}
              onCommit={onTaxRateCommit}
              inputClass={inputClass}
              labelClass={labelClass}
              min={0}
              max={100}
              step={0.01}
              placeholder={suggestedRate > 0 ? String(suggestedRate) : '0'}
            />
            {suggestedRate > 0 && (
              <p className="mt-1.5 text-xs text-slate-500">
                Sugerido para {currency}: {suggestedRate}%
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
