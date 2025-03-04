
import { useLogin } from "./use-login";
import { useSignup } from "./use-signup";
import { useSignOut } from "./use-sign-out";
import { useUpdateUser } from "./use-update-user";
import { UserProfile } from "../types";
import { getProfileImageUrl } from "../auth-utils";

export function useAuthMethods(
  user: UserProfile | null,
  setUser: (user: UserProfile | null) => void,
  setIsLoading: (isLoading: boolean) => void,
  setIsAuthenticated: (isAuthenticated: boolean) => void
) {
  const login = useLogin(setUser, setIsLoading, setIsAuthenticated);
  const signup = useSignup(setUser, setIsLoading, setIsAuthenticated);
  const signOut = useSignOut(setUser, setIsLoading, setIsAuthenticated);
  const updateUser = useUpdateUser(user, setUser, setIsLoading);

  return {
    login,
    signup,
    signOut,
    updateUser,
    getProfileImageUrl,
  };
}
