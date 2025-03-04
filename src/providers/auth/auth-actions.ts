import { supabase } from "@/integrations/supabase/client";
import { SignupData, UserProfile } from "./types";
import { fetchUserProfile, persistSession, clearAllAuthStorage } from "./auth-utils";

export const signupUser = async (data: SignupData) => {
  try {
    console.log("Attempting to sign up user:", data.email);
    
    // Clear any existing sessions and local storage before signup
    clearAllAuthStorage();
    await supabase.auth.signOut({ scope: 'local' });
    
    const { data: authData, error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: {
          username: data.username,
          first_name: data.firstName || '',
          last_name: data.lastName || '',
          profile_image: 'cat-profile-1.png'
        }
      }
    });
    
    if (error) {
      console.error("Signup error from Supabase:", error);
      return { success: false, error };
    }
    
    if (!authData.user) {
      console.error("Signup completed but user data is missing");
      return { 
        success: false, 
        error: new Error("Signup completed but user data is missing") 
      };
    }
    
    console.log("Signup successful, user created:", authData.user.id);
    
    // If we have a session after signup, try to fetch the profile and log in directly
    if (authData.session) {
      try {
        const profile = await fetchUserProfile(authData.user);
        if (profile) {
          persistSession(profile, true);
          return { 
            success: true, 
            data: { 
              user: authData.user, 
              profile, 
              session: authData.session 
            } 
          };
        }
      } catch (profileError) {
        console.error("Error fetching profile after signup:", profileError);
        // Continue with signup success even if profile fetch fails
      }
    }
    
    // If we don't have a profile, explicitly return the authData without a profile property
    return { 
      success: true, 
      data: { 
        user: authData.user, 
        session: authData.session 
      } 
    };
    
  } catch (error) {
    console.error("Signup error:", error);
    return { success: false, error };
  }
};

export const loginUser = async (email: string, password: string) => {
  console.log("Starting login process in auth-actions");
  try {
    console.log("Attempting to log in user:", email);
    
    // Clear any existing sessions and local storage before login attempt
    clearAllAuthStorage();
    await supabase.auth.signOut({ scope: 'local' });
    
    // Add a small delay to ensure the signOut has completed
    await new Promise(resolve => setTimeout(resolve, 100));
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    
    if (error) {
      console.error("Login error from Supabase:", error);
      return { success: false, error };
    }
    
    if (!data.user) {
      console.error("Login successful but user data is missing");
      return { 
        success: false, 
        error: new Error("Login successful but user data is missing") 
      };
    }
    
    console.log("Login successful, fetching user profile");
    
    try {
      const profile = await fetchUserProfile(data.user);
      console.log("Profile fetched successfully:", profile);
      
      if (!profile) {
        return { 
          success: false, 
          error: new Error("Failed to fetch user profile") 
        };
      }
      
      // Persist session after successful login
      persistSession(profile, true);
      
      // Return with the profile property to make type checking clearer
      return { 
        success: true, 
        data: { 
          user: data.user, 
          profile, 
          session: data.session 
        } 
      };
    } catch (profileError) {
      console.error("Failed to fetch user profile:", profileError);
      return { success: false, error: profileError };
    }
  } catch (error) {
    console.error("Login error:", error);
    return { success: false, error };
  }
};

export const signOutUser = async () => {
  try {
    console.log("Attempting to sign out user");
    
    // First clear all authentication storage
    clearAllAuthStorage();
    
    const { error } = await supabase.auth.signOut({
      scope: 'local' // Use 'global' to sign out from all devices
    });
    
    if (error) {
      console.error("Logout error from Supabase:", error);
      return { success: false, error };
    }
    
    console.log("Sign out successful");
    return { success: true };
  } catch (error) {
    console.error("Logout error:", error);
    return { success: false, error };
  }
};

export const updateUserProfile = async (userId: string, data: Partial<UserProfile>) => {
  try {
    console.log("Attempting to update profile for user:", userId);
    
    const { error } = await supabase
      .from("profiles")
      .update(data)
      .eq("id", userId);
    
    if (error) {
      console.error("Profile update error from Supabase:", error);
      return { success: false, error };
    }
    
    console.log("Profile update successful");
    return { success: true };
  } catch (error) {
    console.error("Profile update error:", error);
    return { success: false, error };
  }
};

export const getCurrentSession = async () => {
  try {
    console.log("Getting current session from Supabase");
    const { data, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error("Error getting current session:", error);
      return { session: null, error };
    }
    
    console.log("Session retrieved successfully:", data.session ? "Session exists" : "No session");
    return { session: data.session, error: null };
  } catch (error) {
    console.error("Session retrieval error:", error);
    return { session: null, error };
  }
};

export const refreshSession = async () => {
  try {
    console.log("Refreshing session");
    const { data, error } = await supabase.auth.refreshSession();
    
    if (error) {
      console.error("Session refresh error:", error);
      return { success: false, error };
    }
    
    if (!data.session) {
      console.error("Session refresh completed but session is null");
      return { success: false, error: new Error("No session after refresh") };
    }
    
    console.log("Session refreshed successfully");
    return { success: true, data };
  } catch (error) {
    console.error("Session refresh error:", error);
    return { success: false, error };
  }
};
