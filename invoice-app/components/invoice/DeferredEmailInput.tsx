'use client';

import { DeferredInput } from './DeferredInput';

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

/** Wrapper de DeferredInput para campos de correo electrónico. */
export function DeferredEmailInput(props: DeferredEmailInputProps) {
  return (
    <DeferredInput
      {...props}
      type="email"
      autoComplete="email"
    />
  );
}
