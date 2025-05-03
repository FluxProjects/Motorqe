// src/components/ProtectedRoute.tsx
import { useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/contexts/AuthContext"; // Adjust your auth context import
import { redirectToCorrectDashboard } from "@/lib/utils"; // Helper function to redirect

interface ProtectedRouteProps {
  allowedRoles: string[]; // Roles allowed to access this route
  children: React.ReactNode; // Route content
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ allowedRoles, children }) => {
  const { user } = useAuth();
  const [currentPath, navigate] = useLocation();

  useEffect(() => {
    if (!user) {
      // If user isn't logged in, you can redirect them to login page (if necessary)
      navigate("/");
      return;
    }

    if (!allowedRoles.includes(user.role)) {
      // If the user's role isn't in allowedRoles, redirect them to their own dashboard
      redirectToCorrectDashboard(user.role as any, currentPath, navigate);
    }
  }, [user, allowedRoles, currentPath, navigate]);

  return <>{children}</>;
};

export default ProtectedRoute;
