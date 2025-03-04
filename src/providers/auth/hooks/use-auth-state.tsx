
import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { fetchUserProfile, getPersistedSession, persistSession, clearAllAuthStorage } from "../auth-utils";
import { UserProfile } from "../types";
import { getCurrentSession } from "../auth-actions";

export function useAuthState() {
  // Initialize from localStorage (not sessionStorage)
  const { user: initialUser, isAuthenticated: initialAuthState } = getPersistedSession();
  
  const [user, setUser] = useState<UserProfile | null>(initialUser);
  const [isLoading, setIsLoading] = useState<boolean>(!initialAuthState);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(initialAuthState);
  
  const authCheckedRef = useRef(false);
  const sessionCheckInProgressRef = useRef(false);

  // Function to update user state and persist to localStorage
  const updateUserState = (newUser: UserProfile | null, newAuthState: boolean) => {
    setUser(newUser);
    setIsAuthenticated(newAuthState);
    persistSession(newUser, newAuthState);
  };

  // Check session on mount and set up auth state change listener
  useEffect(() => {
    let isMounted = true;
    console.log("Auth state effect running, initial state:", initialAuthState ? "authenticated" : "not authenticated");
    
    // Function to check session with Supabase
    const checkSession = async () => {
      if (!isMounted || sessionCheckInProgressRef.current) return;
      
      sessionCheckInProgressRef.current = true;
      console.log("Checking session...");
      
      try {
        // Try to get session from Supabase
        const { session, error } = await getCurrentSession();
        
        if (error) {
          console.error("Error getting session:", error);
          if (isMounted) {
            updateUserState(null, false);
            setIsLoading(false);
          }
          return;
        }
        
        if (!session) {
          console.log("No session found");
          if (isMounted) {
            updateUserState(null, false);
            setIsLoading(false);
          }
          return;
        }
        
        // If we have a session with a user, get the profile
        if (session.user) {
          try {
            console.log("Session found, fetching profile...");
            const userProfile = await fetchUserProfile(session.user);
            
            if (userProfile && isMounted) {
              console.log("Profile found, setting user state");
              updateUserState(userProfile, true);
            } else if (isMounted) {
              console.warn("Profile not found after fetching");
              updateUserState(null, false);
            }
          } catch (profileError) {
            console.error("Error fetching profile:", profileError);
            if (isMounted) {
              updateUserState(null, false);
            }
          } finally {
            if (isMounted) {
              setIsLoading(false);
            }
          }
        } else {
          if (isMounted) {
            updateUserState(null, false);
            setIsLoading(false);
          }
        }
      } catch (error) {
        console.error("Auth session error:", error);
        if (isMounted) {
          updateUserState(null, false);
          setIsLoading(false);
        }
      } finally {
        if (isMounted) {
          authCheckedRef.current = true;
          sessionCheckInProgressRef.current = false;
        }
      }
    };
    
    // Check session immediately
    checkSession();
    
    // Set a shorter timeout to clear loading state if session check takes too long
    const loadingTimeout = setTimeout(() => {
      if (isMounted && isLoading) {
        console.log("Auth check timed out, setting loading to false");
        setIsLoading(false);
      }
    }, 300); // Even shorter timeout for faster feedback
    
    // Set up listener for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log("Auth state changed event:", event);
        
        if (event === "SIGNED_IN" && session?.user) {
          try {
            console.log("Signed in, fetching profile...");
            const userProfile = await fetchUserProfile(session.user);
            
            if (userProfile && isMounted) {
              console.log("Profile found after sign in");
              updateUserState(userProfile, true);
              setIsLoading(false);
            } else if (isMounted) {
              console.warn("No profile found after sign in");
              updateUserState(null, false);
              setIsLoading(false);
            }
          } catch (error) {
            console.error("Profile fetch error during auth state change:", error);
            if (isMounted) {
              updateUserState(null, false);
              setIsLoading(false);
            }
          }
        } else if (event === "SIGNED_OUT") {
          console.log("Signed out");
          if (isMounted) {
            clearAllAuthStorage(); // Clear all auth-related storage
            updateUserState(null, false);
            setIsLoading(false);
          }
        } else if (event === "TOKEN_REFRESHED") {
          console.log("Token refreshed, continuing with existing session");
          if (isMounted) {
            setIsLoading(false);
          }
        } else if (event === "USER_UPDATED") {
          console.log("User updated, refreshing profile");
          if (session?.user && isMounted) {
            try {
              const userProfile = await fetchUserProfile(session.user);
              if (userProfile) {
                updateUserState(userProfile, true);
              }
            } catch (error) {
              console.error("Error refreshing profile after user update:", error);
            } finally {
              setIsLoading(false);
            }
          }
        }
      }
    );
    
    return () => {
      console.log("Cleaning up auth state effect");
      isMounted = false;
      
      // Clear the timeout
      clearTimeout(loadingTimeout);
      
      // Unsubscribe from auth state changes
      subscription.unsubscribe();
    };
  }, []);

  return {
    user,
    setUser,
    isLoading,
    setIsLoading,
    isAuthenticated,
    setIsAuthenticated: (newState: boolean) => {
      setIsAuthenticated(newState);
      persistSession(user, newState);
    }
  };
}
