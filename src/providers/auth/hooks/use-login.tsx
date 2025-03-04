
import { useState, useCallback, useRef } from "react";
import { toast } from "sonner";
import { loginUser } from "../auth-actions";
import { UserProfile } from "../types";
import { persistSession } from "../auth-utils";

export function useLogin(
  setUser: (user: UserProfile | null) => void,
  setIsLoading: (isLoading: boolean) => void,
  setIsAuthenticated: (isAuthenticated: boolean) => void
) {
  const isLoginInProgressRef = useRef(false);
  const loginTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const login = useCallback(
    async (email: string, password: string): Promise<void> => {
      if (isLoginInProgressRef.current) {
        console.log("Login already in progress, ignoring duplicate call");
        return;
      }

      isLoginInProgressRef.current = true;
      console.log("Starting login process in useLogin");
      setIsLoading(true);
      
      // Set a timeout to reset the login state if it takes too long
      if (loginTimeoutRef.current) {
        clearTimeout(loginTimeoutRef.current);
      }
      
      loginTimeoutRef.current = setTimeout(() => {
        console.log("Login timeout occurred, resetting state");
        setIsLoading(false);
        isLoginInProgressRef.current = false;
        loginTimeoutRef.current = null;
      }, 15000); // 15 second timeout

      try {
        console.log("Logging in user...");
        const result = await loginUser(email, password);

        // First check if result is successful
        if (result.success && result.data) {
          // Check if data contains the profile property using type guard
          if ('profile' in result.data && result.data.profile) {
            console.log("User profile retrieved, updating auth state");
            setUser(result.data.profile);
            setIsAuthenticated(true);
            
            // Ensure session is properly persisted to localStorage
            persistSession(result.data.profile, true);
            
            toast.success("Login successful!");
          } else {
            console.error("Login returned success but profile data is missing");
            setUser(null);
            setIsAuthenticated(false);
            persistSession(null, false);
            toast.error("Could not retrieve user profile");
            throw new Error("Login successful but profile data is missing");
          }
        } else {
          console.error("Login failed:", result.error);
          setUser(null);
          setIsAuthenticated(false);
          persistSession(null, false);
          
          // Handle specific error messages
          let errorMessage = "Failed to login";
          if (result.error?.message?.includes("Invalid login credentials")) {
            errorMessage = "Invalid email or password";
          } else if (typeof result.error?.message === 'string') {
            errorMessage = result.error.message;
          }
          
          toast.error(errorMessage);
          throw result.error;
        }
      } catch (error: any) {
        console.error("Login error in hook:", error);
        setUser(null);
        setIsAuthenticated(false);
        persistSession(null, false);
        
        // Handle specific error messages
        let errorMessage = "Failed to login";
        if (error.message?.includes("Invalid login credentials")) {
          errorMessage = "Invalid email or password";
        } else if (typeof error.message === 'string') {
          errorMessage = error.message;
        }
        
        toast.error(errorMessage);
        throw error;
      } finally {
        setIsLoading(false);
        isLoginInProgressRef.current = false;
        
        // Clear the timeout
        if (loginTimeoutRef.current) {
          clearTimeout(loginTimeoutRef.current);
          loginTimeoutRef.current = null;
        }
      }
    },
    [setUser, setIsLoading, setIsAuthenticated]
  );

  return login;
}
