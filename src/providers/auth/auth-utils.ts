
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import { UserProfile } from "./types";

export const fetchUserProfile = async (authUser: User): Promise<UserProfile | null> => {
  try {
    if (!authUser?.id) {
      console.error("Auth user is missing ID, cannot fetch profile");
      return null;
    }
    
    console.log("Fetching profile for user:", authUser.id);
    
    // First attempt to get existing profile
    const { data: existingProfile, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", authUser.id)
      .single();
    
    if (error && error.code !== 'PGRST116') { // PGRST116 is "no rows found" error
      console.error("Error fetching profile:", error);
      throw error;
    }
    
    // If profile exists, return it
    if (existingProfile) {
      console.log("Profile found:", existingProfile);
      return {
        id: existingProfile.id,
        username: existingProfile.username,
        email: existingProfile.email,
        profile_image: existingProfile.profile_image
      };
    }
    
    // If no profile exists, create one
    console.log("Profile not found, creating new profile");
    
    const metadata = authUser.user_metadata || {};
    
    const newProfile = {
      id: authUser.id,
      username: metadata.username || `user_${authUser.id.substring(0, 8)}`,
      email: authUser.email || '',
      profile_image: metadata.profile_image || 'cat-profile-1.png'
    };
    
    const { error: insertError } = await supabase
      .from("profiles")
      .insert(newProfile);
    
    if (insertError) {
      console.error("Error creating profile:", insertError);
      throw insertError;
    }
    
    console.log("New profile created:", newProfile);
    return newProfile;
  } catch (error) {
    console.error("Error in fetchUserProfile:", error);
    throw error;
  }
};

export const getProfileImageUrl = (profileImage: string): string => {
  if (!profileImage) return '';
  
  return supabase.storage
    .from('profile_images')
    .getPublicUrl(profileImage).data.publicUrl;
};

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePassword = (password: string): boolean => {
  return password.length >= 6;
};

export const validateUsername = (username: string): boolean => {
  return username.length >= 3;
};

export const persistSession = (user: UserProfile | null, isAuthenticated: boolean) => {
  console.log("Persisting session:", isAuthenticated ? "authenticated" : "not authenticated");
  
  try {
    if (user && isAuthenticated) {
      localStorage.setItem('userProfile', JSON.stringify(user));
      localStorage.setItem('isAuthenticated', 'true');
      console.log("Session persisted to localStorage with user:", user.id);
    } else {
      // Always clear everything to prevent persistence issues
      localStorage.removeItem('userProfile');
      localStorage.removeItem('isAuthenticated');
      console.log("Session removed from localStorage");
    }
  } catch (error) {
    console.error("Error persisting session:", error);
  }
};

export const getPersistedSession = (): { user: UserProfile | null, isAuthenticated: boolean } => {
  try {
    const userProfileStr = localStorage.getItem('userProfile');
    const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
    
    console.log("Got persisted session:", isAuthenticated ? "Authenticated" : "Not authenticated");
    
    if (isAuthenticated && userProfileStr) {
      const user = JSON.parse(userProfileStr);
      console.log("Retrieved user from localStorage:", user.id);
      return { user, isAuthenticated };
    }
    
    return { user: null, isAuthenticated: false };
  } catch (error) {
    console.error("Error getting persisted session:", error);
    return { user: null, isAuthenticated: false };
  }
};

export const clearAllAuthStorage = () => {
  try {
    // Clear localStorage
    localStorage.removeItem('userProfile');
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('supabase.auth.token');
    
    // Clear all keys that might be related to Supabase auth
    Object.keys(localStorage).forEach(key => {
      if (key.includes('supabase') || key.includes('sb-')) {
        localStorage.removeItem(key);
      }
    });
    
    // Clear sessionStorage
    Object.keys(sessionStorage).forEach(key => {
      if (key.includes('supabase') || key.includes('sb-')) {
        sessionStorage.removeItem(key);
      }
    });
    
    // Clear common Supabase cookies
    document.cookie.split(';').forEach(cookie => {
      const [name] = cookie.trim().split('=');
      if (name.includes('sb-') || name.includes('supabase')) {
        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/;`;
      }
    });
    
    console.log("Cleared all auth storage");
  } catch (error) {
    console.error("Error clearing auth storage:", error);
  }
};
