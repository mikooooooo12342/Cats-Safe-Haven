
import { supabase } from "@/integrations/supabase/client";
import { CatMedia, CatPost } from "./types";

export const castCatData = (cat: any): CatPost => {
  const media = cat.cat_media || [];
  
  // Find a primary image first
  let primaryMedia = media.find((m: CatMedia) => m.is_primary && m.media_type === 'image');
  
  // If no primary image, find any image
  if (!primaryMedia) {
    primaryMedia = media.find((m: CatMedia) => m.media_type === 'image');
  }
  
  // If still no image, fall back to the first primary media (could be video)
  if (!primaryMedia) {
    primaryMedia = media.find((m: CatMedia) => m.is_primary);
  }
  
  // Final fallback: just use the first media item
  if (!primaryMedia) {
    primaryMedia = media[0];
  }
  
  // Use a cat profile placeholder if no media is available
  let imageUrl = '/profile-images/cat-placeholder.png';
  
  if (primaryMedia) {
    const { data } = supabase.storage
      .from('cat_media')
      .getPublicUrl(primaryMedia.file_path);
    
    imageUrl = data.publicUrl;
  }
  
  const gender = typeof cat.gender === 'string' ? cat.gender : 'unknown';
  
  return {
    id: cat.id,
    name: cat.name,
    breed: cat.breed,
    gender: gender,
    age: cat.age,
    location: cat.location,
    description: cat.description,
    imageUrl,
    condition: cat.condition,
    contact: cat.contact,
    userId: cat.user_id,
    createdAt: cat.created_at,
    media: media.map((m: any) => ({
      ...m,
      url: supabase.storage.from('cat_media').getPublicUrl(m.file_path).data.publicUrl
    }))
  };
};

// Helper function to clear supabase cache before/after operations
export const clearCache = async (): Promise<void> => {
  await supabase.removeAllChannels();
};
