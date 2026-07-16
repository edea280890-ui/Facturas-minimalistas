/**
 * Lectura segura de variables de entorno (trim de espacios / saltos
 * que a veces se cuelan al pegar secretos en Vercel).
 */
export function env(name: string): string {
  const value = process.env[name];
  if (value == null) return '';
  return value.trim();
}

export function requireEnv(name: string): string {
  const value = env(name);
  if (!value) {
    throw new Error(`Falta la variable de entorno ${name}.`);
  }
  return value;
}
