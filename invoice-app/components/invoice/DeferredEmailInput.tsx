'use client';

import { useEffect, useRef } from 'react';

interface DeferredEmailInputProps {
  value: string;
  onCommit: (value: string) => void;
  onDraftChange?: (value: string) => void;
  error?: string;
  label: string;
  inputClass: string;
  errorInputClass: string;
  labelClass: string;
  errorTextClass: string;
}

/**
 * Input de email no controlado: el valor vive en el DOM mientras se escribe
 * y solo se propaga al estado global en blur (o vía flushDraftFields al guardar).
 * Evita re-renderizar InvoicePreview / PDF en cada pulsación de tecla.
 */
export function DeferredEmailInput({
  value,
  onCommit,
  onDraftChange,
  error,
  label,
  inputClass,
  errorInputClass,
  labelClass,
  errorTextClass,
}: DeferredEmailInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const input = inputRef.current;
    if (!input || document.activeElement === input) return;
    if (input.value !== value) {
      input.value = value;
    }
  }, [value]);

  return (
    <div>
      <label className={labelClass}>{label}</label>
      <input
        ref={inputRef}
        type="email"
        defaultValue={value}
        onChange={(e) => onDraftChange?.(e.target.value)}
        onBlur={(e) => onCommit(e.target.value)}
        className={`${inputClass} ${error ? errorInputClass : ''}`}
        autoComplete="email"
      />
      {error && <p className={errorTextClass}>{error}</p>}
    </div>
  );
}
