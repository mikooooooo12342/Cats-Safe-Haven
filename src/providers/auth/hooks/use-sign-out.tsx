
import { useCallback, useRef } from "react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { signOutUser } from "../auth-actions";
import { UserProfile } from "../types";
import { persistSession } from "../auth-utils";

export function useSignOut(
  setUser: (user: UserProfile | null) => void,
  setIsLoading: (isLoading: boolean) => void,
  setIsAuthenticated: (isAuthenticated: boolean) => void
) {
  const isSignOutInProgressRef = useRef(false);
  const navigate = useNavigate();

  const signOut = useCallback(async (): Promise<void> => {
    if (isSignOutInProgressRef.current) {
      console.log("Sign out already in progress, ignoring duplicate call");
      return;
    }

    isSignOutInProgressRef.current = true;
    
    // Set authentication to false immediately to trigger faster UI updates
    setIsAuthenticated(false);
    setUser(null);
    
    // Ensure we clear the persisted session on sign out
    persistSession(null, false);
    
    // Also clear any local storage items that might be causing persistence issues
    localStorage.removeItem('userProfile');
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('supabase.auth.token');
    
    // Show immediate feedback
    toast.success("Successfully logged out");
    
    // Redirect to index page
    navigate("/");
    
    // Set loading to true for signout process in the background
    setIsLoading(true);
    
    try {
      // Execute the sign out in the background 
      const result = await signOutUser();
      
      if (!result.success) {
        console.error("Logout error in hook:", result.error);
        // We don't need to show an error toast here since we already logged out the user locally
      }
    } catch (error) {
      console.error("Logout error in hook:", error);
      // We don't need to show an error toast here since we already logged out the user locally
    } finally {
      setIsLoading(false);
      isSignOutInProgressRef.current = false;
    }
  }, [setUser, setIsLoading, setIsAuthenticated, navigate]);

  return signOut;
}
