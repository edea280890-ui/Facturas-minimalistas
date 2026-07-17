'use client';

import { useEffect, useRef, type InputHTMLAttributes } from 'react';

interface DeferredInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'value' | 'defaultValue' | 'onChange' | 'onBlur'> {
  value: string;
  onCommit: (value: string) => void;
  onDraftChange?: (value: string) => void;
  error?: string;
  label?: string;
  inputClass: string;
  errorInputClass?: string;
  labelClass?: string;
  errorTextClass?: string;
}

/**
 * Input de texto no controlado: el valor vive en el DOM mientras se escribe
 * y solo se propaga al estado global en blur (o vía flushDraftFields al guardar).
 * Evita re-renderizar InvoicePreview / PDF en cada pulsación de tecla.
 */
export function DeferredInput({
  value,
  onCommit,
  onDraftChange,
  error,
  label,
  inputClass,
  errorInputClass,
  labelClass,
  errorTextClass,
  id,
  ...inputProps
}: DeferredInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const inputId = id ?? (label ? `deferred-${label.replace(/\s+/g, '-').toLowerCase()}` : undefined);

  useEffect(() => {
    const input = inputRef.current;
    if (!input || document.activeElement === input) return;
    if (input.value !== value) {
      input.value = value;
    }
  }, [value]);

  return (
    <div>
      {label && (
        <label className={labelClass} htmlFor={inputId}>
          {label}
        </label>
      )}
      <input
        {...inputProps}
        id={inputId}
        ref={inputRef}
        defaultValue={value}
        onChange={(e) => onDraftChange?.(e.target.value)}
        onBlur={(e) => onCommit(e.target.value)}
        className={`${inputClass} ${error && errorInputClass ? errorInputClass : ''}`}
      />
      {error && errorTextClass && <p className={errorTextClass}>{error}</p>}
    </div>
  );
}
