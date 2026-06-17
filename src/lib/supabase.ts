import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Storage bucket name — create this in Supabase Dashboard → Storage
export const PRODUCT_IMAGES_BUCKET = 'product-images';

/** Upload a file to Supabase Storage and return the public URL */
export async function uploadProductImage(file: File): Promise<string> {
  const ext = file.name.split('.').pop();
  const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

  const { error } = await supabase.storage
    .from(PRODUCT_IMAGES_BUCKET)
    .upload(fileName, file, { upsert: false, contentType: file.type });

  if (error) throw new Error(`Upload failed: ${error.message}`);

  const { data } = supabase.storage
    .from(PRODUCT_IMAGES_BUCKET)
    .getPublicUrl(fileName);

  return data.publicUrl;
}

/** Delete an image from Supabase Storage by its public URL */
export async function deleteProductImage(publicUrl: string): Promise<void> {
  const parts = publicUrl.split(`/${PRODUCT_IMAGES_BUCKET}/`);
  if (parts.length < 2) return;
  const path = parts[1];
  await supabase.storage.from(PRODUCT_IMAGES_BUCKET).remove([path]);
}
