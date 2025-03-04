
import React from "react";
import { AuthContext } from "./auth-context";
import { useAuthState } from "./hooks/use-auth-state";
import { useAuthMethods } from "./hooks/use-auth-methods";

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const {
    user,
    setUser,
    isLoading,
    setIsLoading,
    isAuthenticated,
    setIsAuthenticated
  } = useAuthState();
  
  const {
    login,
    signup,
    signOut,
    updateUser,
    getProfileImageUrl
  } = useAuthMethods(user, setUser, setIsLoading, setIsAuthenticated);
  
  const value = {
    user,
    isAuthenticated,
    isLoading,
    signup,
    login,
    signOut,
    updateUser,
    getProfileImageUrl
  };
  
  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Re-export useAuth from auth-context.tsx
export { useAuth } from "./auth-context";
