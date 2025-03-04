
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { CatPost } from "./types";
import { castCatData, clearCache } from "./utils";

export const addCat = async (catData: Omit<CatPost, "id" | "createdAt" | "imageUrl">): Promise<CatPost> => {
  try {
    // Clear any cached results before inserting new data
    await clearCache();
    
    // Create the database record object and explicitly cast to Json where needed
    const dbRecord = {
      name: catData.name,
      breed: catData.breed,
      gender: catData.gender,
      age: catData.age,
      description: catData.description,
      condition: catData.condition as any, // Cast to any/Json for database compatibility
      contact: catData.contact as any, // Cast to any/Json for database compatibility
      user_id: catData.userId,
      location: catData.location, // Include location field
    };
    
    const { data: newCat, error } = await supabase
      .from('cats')
      .insert(dbRecord) // Pass a single object without array
      .select()
      .single();
    
    if (error) throw error;
    if (!newCat) throw new Error("Failed to create cat post");
    
    toast.success("Cat posted for adoption successfully!");
    
    return {
      ...catData,
      id: newCat.id,
      createdAt: newCat.created_at,
      imageUrl: 'https://placekitten.com/600/600',
      media: []
    };
  } catch (error) {
    console.error("Error adding cat:", error);
    toast.error("Failed to post cat for adoption");
    throw error;
  }
};

export const updateCat = async (id: string, catData: Partial<CatPost>): Promise<CatPost> => {
  try {
    // Clear any cached results before updating
    await clearCache();
    
    const dbData: any = {
      ...catData
    };
    
    delete dbData.id;
    delete dbData.createdAt;
    delete dbData.userId;
    delete dbData.imageUrl;
    delete dbData.media;
    
    if (catData.userId) {
      dbData.user_id = catData.userId;
    }
    
    const { data: updatedCat, error } = await supabase
      .from('cats')
      .update(dbData)
      .eq('id', id)
      .select(`
        *,
        profiles:user_id (username, email, profile_image),
        cat_media(*)
      `)
      .single();
    
    if (error) throw error;
    if (!updatedCat) throw new Error("Failed to update cat post");
    
    toast.success("Cat updated successfully!");
    
    return castCatData(updatedCat);
  } catch (error) {
    console.error("Error updating cat:", error);
    toast.error("Failed to update cat");
    throw error;
  }
};

export const deleteCat = async (id: string): Promise<void> => {
  try {
    // Clear any cached results before deleting
    await clearCache();
    
    const { error } = await supabase
      .from('cats')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    
    toast.success("Cat deleted successfully!");
  } catch (error) {
    console.error("Error deleting cat:", error);
    toast.error("Failed to delete cat");
    throw error;
  }
};
