'use client';

import { useEffect, useRef } from 'react';

interface DeferredNumberInputProps {
  value: number;
  onCommit: (value: number) => void;
  onDraftChange?: (value: number) => void;
  label: string;
  inputClass: string;
  labelClass: string;
  min?: number;
  max?: number;
  step?: number;
  placeholder?: string;
  disabled?: boolean;
}

/**
 * Input numérico no controlado: evita re-render del PDF en cada pulsación.
 * El valor se propaga al store en blur o vía flushDraftFields al guardar.
 */
export function DeferredNumberInput({
  value,
  onCommit,
  onDraftChange,
  label,
  inputClass,
  labelClass,
  min = 0,
  max,
  step = 0.01,
  placeholder,
  disabled = false,
}: DeferredNumberInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const input = inputRef.current;
    if (!input || document.activeElement === input) return;
    const next = Number.isFinite(value) ? String(value) : '0';
    if (input.value !== next) {
      input.value = next;
    }
  }, [value]);

  const parseValue = (raw: string): number => {
    const parsed = parseFloat(raw);
    return Number.isFinite(parsed) ? parsed : 0;
  };

  return (
    <div>
      <label className={labelClass}>{label}</label>
      <input
        ref={inputRef}
        type="number"
        defaultValue={value}
        min={min}
        max={max}
        step={step}
        placeholder={placeholder}
        disabled={disabled}
        onChange={(e) => onDraftChange?.(parseValue(e.target.value))}
        onBlur={(e) => onCommit(parseValue(e.target.value))}
        className={`${inputClass} ${disabled ? 'cursor-not-allowed opacity-60' : ''}`}
      />
    </div>
  );
}
