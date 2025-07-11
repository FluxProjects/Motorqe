import { useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import { LoadingScreen } from "@/components/LoadingScreen";
import Login from "@/pages/Login";
import { roleIdMapping } from "@shared/permissions";

export function LoginRedirect() {
  const [location, navigate] = useLocation();
  const { user, isLoading } = useAuth();
  const role = roleIdMapping[user?.roleId];

 useEffect(() => {
    if (!isLoading && user) {
      // Check for redirect URL in query parameters
      const searchParams = new URLSearchParams(window.location.search);
      const redirectTo = searchParams.get('redirectTo');
      
      // Check for stored location state (from ProtectedRoute)
      const fromLocation = (location.state as any)?.from;

      // Priority 1: Explicit redirect URL
      if (redirectTo) {
        navigate(redirectTo);
        return;
      }
      
      // Priority 2: Previously attempted protected route
      if (fromLocation) {
        navigate(fromLocation);
        return;
      }
      
      // Priority 3: Default dashboard based on role
      switch (role) {
        case "ADMIN":
        case "SUPER_ADMIN":
          navigate("/admin");
          break;
        case "BUYER":
          navigate("/buyer-dashboard");
          break;
        case "SELLER":
          navigate("/seller-dashboard");
          break;
        case "DEALER":
          navigate("/showroom-dashboard");
          break;
        case "GARAGE":
          navigate("/garage-dashboard");
          break;
        default:
          navigate("/");
      }
    }
  }, [user, isLoading, navigate, location.state]);

  if (isLoading) {
    return <LoadingScreen />;
  }

  return <Login />;
}
