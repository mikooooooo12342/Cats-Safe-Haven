
import { User } from "@supabase/supabase-js";

export type UserProfile = {
  id: string;
  username: string;
  email: string;
  profile_image: string;
};

export type SignupData = {
  username: string;
  firstName?: string;
  lastName?: string;
  email: string;
  password: string;
};

export type AuthContextType = {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (data: SignupData) => Promise<void>;
  signOut: () => Promise<void>;
  updateUser: (data: Partial<UserProfile>) => Promise<void>;
  getProfileImageUrl: (profileImage: string) => string;
};
