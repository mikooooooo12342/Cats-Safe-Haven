
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { CatMedia } from "./types";
import { clearCache } from "./utils";

export const uploadCatMedia = async (
  catId: string,
  file: File,
  isPrimary: boolean = false,
  mediaType: 'image' | 'video' = 'image'
): Promise<CatMedia> => {
  try {
    const userId = (await supabase.auth.getUser()).data.user?.id;
    if (!userId) {
      throw new Error('User not authenticated');
    }
    
    // For cards, we want images to be primary for display purposes
    let makeThisPrimary = isPrimary;
    
    // Get existing media to make informed decisions
    const { data: existingMedia } = await supabase
      .from('cat_media')
      .select('media_type, is_primary')
      .eq('cat_id', catId);
    
    if (existingMedia && existingMedia.length > 0) {
      const existingImages = existingMedia.filter(m => m.media_type === 'image');
      const existingVideos = existingMedia.filter(m => m.media_type === 'video');
      
      // If this is an image:
      if (mediaType === 'image') {
        // If there are no other images, make this primary for card display
        if (existingImages.length === 0) {
          makeThisPrimary = true;
        }
        // If there is already a primary image, respect the existing structure
      }
      // If this is a video:
      else if (mediaType === 'video') {
        // Videos are never primary for card display if there are images
        if (existingImages.length > 0) {
          makeThisPrimary = false;
        }
        // If there are no images but this is the first video, it can be primary
        else if (existingVideos.length === 0) {
          makeThisPrimary = true;
        }
      }
    } else {
      // First media uploaded is primary by default
      makeThisPrimary = true;
    }
    
    const formData = new FormData();
    formData.append('file', file);
    formData.append('catId', catId);
    formData.append('userId', userId);
    formData.append('mediaType', mediaType);
    formData.append('isPrimary', makeThisPrimary.toString());
    
    const { data, error } = await supabase.functions.invoke('upload-media', {
      body: formData,
    });
    
    if (error) throw error;
    if (!data.success) throw new Error(data.error || 'Upload failed');
    
    // Clear any cached results after uploading media
    await clearCache();
    
    return data.media;
  } catch (error) {
    console.error("Error uploading media:", error);
    toast.error("Failed to upload media");
    throw error;
  }
};
