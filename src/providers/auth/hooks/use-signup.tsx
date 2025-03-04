
import { useCallback, useRef } from "react";
import { toast } from "sonner";
import { signupUser } from "../auth-actions";
import { SignupData, UserProfile } from "../types";

export function useSignup(
  setUser: (user: UserProfile | null) => void,
  setIsLoading: (isLoading: boolean) => void,
  setIsAuthenticated: (isAuthenticated: boolean) => void
) {
  const isSignupInProgressRef = useRef(false);

  const signup = useCallback(
    async (data: SignupData): Promise<void> => {
      if (isSignupInProgressRef.current) {
        console.log("Signup already in progress, ignoring duplicate call");
        return;
      }

      isSignupInProgressRef.current = true;
      setIsLoading(true);

      try {
        const result = await signupUser(data);
        
        if (result.success) {
          // Use type guard to check if profile property exists before accessing it
          if (result.data && 'profile' in result.data && result.data.profile) {
            setUser(result.data.profile);
            setIsAuthenticated(true);
            toast.success("Account created and logged in successfully!");
          } else {
            toast.success("Account created successfully! Please login.");
          }
        } else {
          console.error("Signup error in hook:", result.error);
          
          // Handle specific error messages
          let errorMessage = "Failed to create account";
          if (result.error?.message?.includes("already registered")) {
            errorMessage = "This email is already registered";
          } else if (typeof result.error?.message === 'string') {
            errorMessage = result.error.message;
          }
          
          toast.error(errorMessage);
          throw result.error;
        }
      } catch (error: any) {
        console.error("Signup error in hook:", error);
        
        // Handle specific error messages
        let errorMessage = "Failed to create account";
        if (error.message?.includes("already registered")) {
          errorMessage = "This email is already registered";
        } else if (typeof error.message === 'string') {
          errorMessage = error.message;
        }
        
        toast.error(errorMessage);
        throw error;
      } finally {
        setIsLoading(false);
        isSignupInProgressRef.current = false;
      }
    },
    [setUser, setIsLoading, setIsAuthenticated]
  );

  return signup;
}
