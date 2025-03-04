
import { useCallback } from "react";
import { toast } from "sonner";
import { updateUserProfile } from "../auth-actions";
import { UserProfile } from "../types";
import { persistSession } from "../auth-utils";

export function useUpdateUser(
  user: UserProfile | null,
  setUser: (user: UserProfile | null) => void,
  setIsLoading: (isLoading: boolean) => void
) {
  const updateUser = useCallback(
    async (data: Partial<UserProfile>): Promise<void> => {
      if (!user?.id) {
        toast.error("Cannot update profile: user not authenticated");
        return;
      }

      setIsLoading(true);

      try {
        const result = await updateUserProfile(user.id, data);

        if (result.success) {
          const updatedUser = {
            ...user,
            ...data,
          };

          setUser(updatedUser);
          persistSession(updatedUser, true);
          toast.success("Profile updated successfully");
        } else {
          console.error("Update user error in hook:", result.error);
          toast.error("Failed to update profile");
          throw result.error;
        }
      } catch (error) {
        console.error("Update user error in hook:", error);
        toast.error("Failed to update profile");
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [user, setUser, setIsLoading]
  );

  return updateUser;
}
