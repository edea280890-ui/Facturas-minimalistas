/**
 * Lectura segura de variables de entorno (trim de espacios / saltos
 * que a veces se cuelan al pegar secretos en Vercel).
 */
export function env(name: string): string {
  const value = process.env[name];
  if (value == null) return '';
  return value.trim();
}

/**
 * Error identificable (no un `Error` genérico) para que el código que llama
 * a `requireEnv` pueda distinguirlo de otras excepciones — en particular de
 * las señales internas de control de flujo de Next.js (`redirect()`,
 * `notFound()`, `DYNAMIC_SERVER_USAGE` por usar `cookies()`), que NUNCA se
 * deben capturar/silenciar con un `catch` genérico.
 */
export class MissingEnvVarError extends Error {
  constructor(name: string) {
    super(`Falta la variable de entorno ${name}.`);
    this.name = 'MissingEnvVarError';
  }
}

export function requireEnv(name: string): string {
  const value = env(name);
  if (!value) {
    throw new MissingEnvVarError(name);
  }
  return value;
}
