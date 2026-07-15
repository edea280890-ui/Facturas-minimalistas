import { supabase } from '@/utils/supabase/client';

const LOGOS_BUCKET = 'logos';
const MAX_LOGO_SIZE_BYTES = 2 * 1024 * 1024; // 2 MB
const ALLOWED_LOGO_TYPES = ['image/png', 'image/jpeg', 'image/webp', 'image/svg+xml'];

export interface UploadLogoResult {
  url: string | null;
  error: string | null;
}

/**
 * Sube el logo del emisor al bucket `logos` de Supabase Storage, bajo el
 * prefijo `<user_id>/` (requerido por las políticas RLS de storage.objects
 * definidas en `supabase/schema.sql`), y devuelve su URL pública.
 */
export async function uploadCompanyLogo(file: File, userId: string): Promise<UploadLogoResult> {
  try {
    if (!ALLOWED_LOGO_TYPES.includes(file.type)) {
      return { url: null, error: 'Formato de imagen no soportado. Usa PNG, JPG, WEBP o SVG.' };
    }
    if (file.size > MAX_LOGO_SIZE_BYTES) {
      return { url: null, error: 'El logo no puede superar los 2 MB.' };
    }

    const extension = file.name.split('.').pop()?.toLowerCase() || 'png';
    const path = `${userId}/logo-${Date.now()}.${extension}`;

    const { error: uploadError } = await supabase.storage.from(LOGOS_BUCKET).upload(path, file, {
      cacheControl: '3600',
      upsert: false,
    });
    if (uploadError) throw uploadError;

    const { data } = supabase.storage.from(LOGOS_BUCKET).getPublicUrl(path);
    return { url: data.publicUrl, error: null };
  } catch (err) {
    const message =
      err instanceof Error ? err.message : 'No se pudo subir el logo. Comprueba que el bucket "logos" existe.';
    return { url: null, error: message };
  }
}
