
import { supabase } from "@/integrations/supabase/client";
import { CatPost } from "./types";
import { castCatData } from "./utils";

export const getCatById = async (id: string): Promise<CatPost | null> => {
  try {
    const { data: cat, error } = await supabase
      .from('cats')
      .select(`
        *,
        profiles:user_id (username, email, profile_image),
        cat_media(*)
      `)
      .eq('id', id)
      .single();
    
    if (error) throw error;
    if (!cat) return null;
    
    const catData = castCatData(cat);
    
    // Add the uploader's username to the cat data
    if (cat.profiles) {
      catData.uploaderUsername = cat.profiles.username;
    }
    
    return catData;
  } catch (error) {
    console.error("Error fetching cat by ID:", error);
    return null;
  }
};

export const getAllCats = async (): Promise<CatPost[]> => {
  try {
    const { data: cats, error } = await supabase
      .from('cats')
      .select(`
        *,
        profiles:user_id (username, email, profile_image),
        cat_media(*)
      `)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    return cats.map(cat => castCatData(cat));
  } catch (error) {
    console.error("Error fetching cats:", error);
    return [];
  }
};

export const getCatsByUserId = async (userId: string): Promise<CatPost[]> => {
  try {
    const { data: cats, error } = await supabase
      .from('cats')
      .select(`
        *,
        profiles:user_id (username, email, profile_image),
        cat_media(*)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    return cats.map(cat => castCatData(cat));
  } catch (error) {
    console.error("Error fetching cats by user ID:", error);
    return [];
  }
};

// Adding the getUserCats function that was missing
export const getUserCats = async (userId: string): Promise<CatPost[]> => {
  return getCatsByUserId(userId);
};
