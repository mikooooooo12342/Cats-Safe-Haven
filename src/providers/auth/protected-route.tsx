
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "./auth-context";
import { toast } from "sonner";

interface ProtectedRouteProps {
  children: React.ReactNode;
  redirectTo?: string;
}

export const ProtectedRoute = ({
  children,
  redirectTo = "/login",
}: ProtectedRouteProps) => {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-full border-4 border-primary border-t-transparent animate-spin"></div>
          <p className="text-muted-foreground">Checking authentication...</p>
        </div>
      </div>
    );
  }

  // If not authenticated, redirect to login
  if (!isAuthenticated) {
    // Only show toast if not already on the login page
    if (location.pathname !== redirectTo && location.pathname !== "/") {
      toast.error("Please login to access this page");
    }
    return <Navigate to={redirectTo} replace />;
  }

  // If authenticated, render children
  return <>{children}</>;
};
